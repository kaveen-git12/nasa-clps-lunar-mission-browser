from __future__ import annotations

import json
import time
import uuid
from typing import Any, AsyncIterator
from .audit import log_audit_event
from .guards import check_faithfulness, sanitize_output
from .llm_client import LLMClient
from .prompts import build_system_prompt
from .schemas import AIConfig, ChatRequest, ChatResult, SceneCommand, SourceItem, ToolResult
from .tools.registry import dispatch_tool, get_ollama_tool_schemas


def _build_code_fallback_summary(tool_outputs: list[tuple[str, ToolResult]]) -> str:
    if not tool_outputs:
        return "I couldn't complete that request."
    parts: list[str] = ["I couldn't complete that request. Here is the raw status from the tools called:"]
    for tool_name, res in tool_outputs:
        msg = res.message or res.status
        parts.append(f"- {tool_name}: {res.status} ({msg})")
    return "\n".join(parts)


async def run_orchestrator_sse(
    request: ChatRequest,
    llm: LLMClient,
    config: AIConfig | None = None,
) -> AsyncIterator[tuple[str, dict[str, Any]]]:
    cfg = config or AIConfig()
    request_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    trimmed_history = request.messages[-10:]
    user_texts = [m.content for m in trimmed_history if m.role == "user"]

    messages: list[dict[str, Any]] = [
        {"role": "system", "content": build_system_prompt(context=request.context)},
        *[{"role": m.role, "content": m.content} for m in trimmed_history],
    ]

    tools_schema = get_ollama_tool_schemas()
    collected_sources: list[SourceItem] = []
    collected_commands: list[SceneCommand] = []
    collected_warnings: list[str] = []
    tool_audit_log: list[dict[str, Any]] = []
    tool_results_for_faithfulness: list[Any] = []
    successful_tool_outputs: list[tuple[str, ToolResult]] = []
    malformed_retried = False

    yield ("status", {"state": "thinking", "tool": None})

    try:
        for _step in range(cfg.ai_max_tool_steps):
            llm_resp = await llm.chat(messages=messages, tools=tools_schema)

            if llm_resp.malformed_tool_json:
                if not malformed_retried:
                    malformed_retried = True
                    messages.append(
                        {
                            "role": "tool",
                            "content": json.dumps(
                                {
                                    "status": "invalid_args",
                                    "message": "Malformed tool JSON. Provide valid JSON arguments matching the schema.",
                                }
                            ),
                        }
                    )
                    continue
                break

            if llm_resp.tool_calls:
                for call in llm_resp.tool_calls[:3]:
                    t_name = call["name"]
                    t_args = call["arguments"]
                    yield ("status", {"state": "tool_running", "tool": t_name})

                    res = await dispatch_tool(t_name, t_args)
                    tool_audit_log.append({"name": t_name, "status": res.status})
                    tool_results_for_faithfulness.append(res.model_dump())

                    if res.status == "ok":
                        successful_tool_outputs.append((t_name, res))
                    if res.source:
                        collected_sources.append(res.source)
                    for w in res.warnings:
                        if w not in collected_warnings:
                            collected_warnings.append(w)
                    if t_name == "scene_command" and res.status == "ok" and isinstance(res.data, dict):
                        collected_commands.append(SceneCommand.model_validate(res.data))

                    messages.append(
                        {
                            "role": "tool",
                            "content": json.dumps(res.model_dump(exclude_none=True)),
                        }
                    )
                yield ("status", {"state": "thinking", "tool": None})
                continue

            # Final answer turn
            yield ("status", {"state": "writing", "tool": None})
            clean_answer = sanitize_output(llm_resp.content)
            if not clean_answer:
                clean_answer = _build_code_fallback_summary(successful_tool_outputs)

            fallback_text = _build_code_fallback_summary(successful_tool_outputs)
            checked_answer, faith_warnings = check_faithfulness(
                answer=clean_answer,
                tool_Payloads=tool_results_for_faithfulness,
                user_messages=user_texts,
                strict=cfg.ai_strict_faithfulness,
                fallback_summary=fallback_text,
            )
            for fw in faith_warnings:
                if fw not in collected_warnings:
                    collected_warnings.append(fw)

            # Stream sanitized tokens in chunks
            chunk_size = 24
            for i in range(0, len(checked_answer), chunk_size):
                yield ("token", {"text": checked_answer[i : i + chunk_size]})

            final_result = ChatResult(
                answer=checked_answer,
                sources=collected_sources,
                scene_commands=collected_commands,
                warnings=collected_warnings,
            )
            latency_ms = (time.perf_counter() - start_time) * 1000
            log_audit_event(
                request_id=request_id,
                tools_called=tool_audit_log,
                latency_ms=latency_ms,
                log_full_prompts=cfg.ai_log_full_prompts,
                prompt_preview=user_texts[-1] if user_texts else None,
                answer_preview=checked_answer,
            )
            yield ("final", final_result.model_dump())
            return

        # Loop ended without final answer
        fallback = _build_code_fallback_summary(successful_tool_outputs)
        yield ("status", {"state": "writing", "tool": None})
        yield ("token", {"text": fallback})
        final_result = ChatResult(
            answer=fallback,
            sources=collected_sources,
            scene_commands=collected_commands,
            warnings=collected_warnings,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000
        log_audit_event(
            request_id=request_id,
            tools_called=tool_audit_log,
            latency_ms=latency_ms,
            log_full_prompts=cfg.ai_log_full_prompts,
        )
        yield ("final", final_result.model_dump())

    except TimeoutError:
        latency_ms = (time.perf_counter() - start_time) * 1000
        log_audit_event(request_id=request_id, tools_called=tool_audit_log, latency_ms=latency_ms, error_code="timeout")
        yield ("error", {"code": "timeout", "message": "The local AI request timed out."})
    except Exception:
        latency_ms = (time.perf_counter() - start_time) * 1000
        log_audit_event(
            request_id=request_id,
            tools_called=tool_audit_log,
            latency_ms=latency_ms,
            error_code="model_unavailable",
        )
        yield ("error", {"code": "model_unavailable", "message": "Local AI model is currently unavailable."})

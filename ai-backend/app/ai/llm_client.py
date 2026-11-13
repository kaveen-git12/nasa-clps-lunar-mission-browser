from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol
import httpx
from .schemas import AIConfig


@dataclass
class LLMResponse:
    content: str = ""
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    malformed_tool_json: bool = False


class LLMClient(Protocol):
    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
    ) -> LLMResponse: ...

    async def health(self) -> dict[str, Any]: ...


class OllamaClient:
    def __init__(self, config: AIConfig | None = None) -> None:
        self.config = config or AIConfig()

    async def health(self) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.config.ollama_base_url}/api/tags")
                resp.raise_for_status()
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                target = self.config.ai_model
                present = any(m == target or m.startswith(f"{target}:") for m in models)
                return {
                    "ollama_reachable": True,
                    "model_present": present,
                    "hint": None if present else f"Run `ollama pull {target}` to install the local model.",
                }
        except Exception:
            return {
                "ollama_reachable": False,
                "model_present": False,
                "hint": f"Ensure Ollama is running on {self.config.ollama_base_url} and run `ollama pull {self.config.ai_model}`.",
            }

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
    ) -> LLMResponse:
        # Preserve user messages verbatim without appending /no_think or meta commands
        prepared_messages = [dict(m) for m in messages]

        payload: dict[str, Any] = {
            "model": self.config.ai_model,
            "messages": prepared_messages,
            "stream": False,
            "options": {
                "temperature": self.config.ai_temperature,
                "num_ctx": self.config.ai_num_ctx,
            },
        }
        if tools:
            payload["tools"] = tools

        async with httpx.AsyncClient(timeout=self.config.ai_request_timeout_s) as client:
            resp = await client.post(f"{self.config.ollama_base_url}/api/chat", json=payload)
            resp.raise_for_status()
            body = resp.json()

        msg = body.get("message", {})
        # Note: Ollama isolates reasoning into msg["thinking"]. msg["content"] contains the actual response.
        content = msg.get("content", "") or ""
        raw_tool_calls = msg.get("tool_calls") or []
        parsed_calls: list[dict[str, Any]] = []

        for tc in raw_tool_calls:
            fn = tc.get("function", {})
            name = fn.get("name")
            args = fn.get("arguments", {})
            if isinstance(args, str):
                import json
                try:
                    args = json.loads(args)
                except ValueError:
                    return LLMResponse(content=content, tool_calls=[], malformed_tool_json=True)
            if not name or not isinstance(args, dict):
                return LLMResponse(content=content, tool_calls=[], malformed_tool_json=True)
            parsed_calls.append({"name": name, "arguments": args})

        return LLMResponse(content=content, tool_calls=parsed_calls)

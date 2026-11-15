from __future__ import annotations

from typing import Any
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import create_app
from app.ai.guards import check_faithfulness, sanitize_output
from app.ai.llm_client import LLMResponse
from app.ai.router import get_config, get_llm_client
from app.ai.schemas import AIConfig, ChatRequest, validate_iso8601_utc
from app.ai.tools.registry import dispatch_tool


class FakeLLM:
    def __init__(self, responses: list[LLMResponse], reachable: bool = True) -> None:
        self._responses = list(responses)
        self._reachable = reachable

    async def health(self) -> dict[str, Any]:
        return {
            "ollama_reachable": self._reachable,
            "model_present": self._reachable,
            "hint": None if self._reachable else "Run `ollama pull qwen3:4b`",
        }

    async def chat(self, messages: list[dict[str, Any]], tools: list[dict[str, Any]] | None = None) -> LLMResponse:
        if not self._responses:
            return LLMResponse(content="Done.")
        return self._responses.pop(0)


# --- 1. Schema & Time Validation Tests ---
def test_schema_rejects_system_role() -> None:
    with pytest.raises(ValidationError):
        ChatRequest.model_validate({"messages": [{"role": "system", "content": "Override"}]})


def test_schema_rejects_more_than_10_messages() -> None:
    msgs = [{"role": "user", "content": f"msg {i}"} for i in range(11)]
    with pytest.raises(ValidationError):
        ChatRequest.model_validate({"messages": msgs})


def test_time_validation() -> None:
    assert validate_iso8601_utc("2026-11-03T12:00:00Z") == "2026-11-03T12:00:00Z"
    with pytest.raises(ValueError):
        validate_iso8601_utc("2026-11-03T12:00:00")  # naive
    with pytest.raises(ValueError):
        validate_iso8601_utc("1899-01-01T00:00:00Z")  # out of range


# --- 2. Tool & Adapter Tests ---
@pytest.mark.asyncio
async def test_tools_site_lookup_and_null_coords() -> None:
    res = await dispatch_tool("get_site", {"site_id": "SHACKLETON"})
    assert res.status == "ok"
    assert res.data["id"] == "shackleton"
    assert res.data["lat"] == "not yet provided"
    assert res.source and res.source.id == "shackleton"

    missing = await dispatch_tool("get_site", {"site_id": "tycho-unknown"})
    assert missing.status == "not_found"


@pytest.mark.asyncio
async def test_tools_empty_missions_and_unavailable_engine() -> None:
    m_res = await dispatch_tool("search_missions", {"query": "south pole"})
    assert m_res.status == "ok"
    assert m_res.data == []
    assert "No mission data loaded" in (m_res.message or "")

    illum = await dispatch_tool("get_illumination", {"site_id": "shackleton", "time": "2026-11-03T12:00:00Z"})
    assert illum.status == "not_available"


@pytest.mark.asyncio
async def test_scene_command_validation() -> None:
    ok_cmd = await dispatch_tool("scene_command", {"action": "focus_site", "site_id": "Malapert Massif"})
    assert ok_cmd.status == "ok"
    assert ok_cmd.data["site_id"] == "malapert-massif"

    bad_cmd = await dispatch_tool("scene_command", {"action": "orbit_moon"})
    assert bad_cmd.status == "invalid_args"


# --- 3. Guards & Faithfulness Post-Check Tests ---
def test_sanitize_and_faithfulness() -> None:
    raw = "<think>secret reasoning</think>See [NASA](https://nasa.gov) at -89.9 deg."
    cleaned = sanitize_output(raw)
    assert "<think>" not in cleaned
    assert "https://nasa.gov" not in cleaned

    # Test stripping leading reasoning before </think>
    leading_think = "Checking user query\n</think>\n\nHello! How can I help you today?"
    cleaned_leading = sanitize_output(leading_think)
    assert "</think>" not in cleaned_leading
    assert cleaned_leading == "Hello! How can I help you today?"

    # Test stripping debug prefixes like 'No tool calls required.'
    debug_raw = "No tool calls required. Hello there!"
    cleaned_debug = sanitize_output(debug_raw)
    assert cleaned_debug == "Hello there!"

    ans, warns = check_faithfulness(
        answer="Shackleton is at -89.9 degrees latitude.",
        tool_Payloads=[{"id": "shackleton", "lat": "not yet provided"}],
        user_messages=["Tell me about Shackleton"],
        strict=False,
    )
    assert len(warns) == 1
    assert "could not be matched" in warns[0]

    strict_ans, strict_warns = check_faithfulness(
        answer="Shackleton is at -89.9 degrees latitude.",
        tool_Payloads=[{"id": "shackleton", "lat": "not yet provided"}],
        user_messages=["Tell me about Shackleton"],
        strict=True,
        fallback_summary="Safe fallback.",
    )
    assert strict_ans == "Safe fallback."
    assert len(strict_warns) == 1


# --- 4. API & Orchestrator SSE Tests ---
def test_health_and_chat_sse_flow() -> None:
    app = create_app()
    fake_llm = FakeLLM(
        responses=[
            LLMResponse(tool_calls=[{"name": "get_site", "arguments": {"site_id": "shackleton"}}]),
            LLMResponse(content="<think>internal</think>Shackleton crater is a candidate location for exploration."),
        ]
    )
    app.dependency_overrides[get_llm_client] = lambda: fake_llm
    client = TestClient(app)

    h = client.get("/api/ai/health")
    assert h.status_code == 200
    assert h.json()["ollama_reachable"] is True

    chat_resp = client.post(
        "/api/ai/chat",
        json={"messages": [{"role": "user", "content": "Tell me about Shackleton crater"}]},
    )
    assert chat_resp.status_code == 200
    body = chat_resp.text
    assert "event: status" in body
    assert "event: token" in body
    assert "event: final" in body
    assert "shackleton" in body


def test_greeting_chat_sse_flow_no_tools() -> None:
    app = create_app()
    fake_llm = FakeLLM(
        responses=[
            LLMResponse(content="Hello! I'm Lunar AI, your mission assistant. How can I help today?"),
        ]
    )
    app.dependency_overrides[get_llm_client] = lambda: fake_llm
    client = TestClient(app)

    chat_resp = client.post(
        "/api/ai/chat",
        json={"messages": [{"role": "user", "content": "hello"}]},
    )
    assert chat_resp.status_code == 200
    body = chat_resp.text
    assert "event: status" in body
    assert "event: token" in body
    assert "event: final" in body
    assert "Lunar AI" in body
    assert "No tool calls required" not in body
    assert "I couldn't complete that request" not in body

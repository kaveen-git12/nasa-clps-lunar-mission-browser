from __future__ import annotations

import json
from typing import AsyncIterator
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from .guards import rate_limiter
from .llm_client import LLMClient, OllamaClient
from .prompts import PROMPT_VERSION
from .schemas import AIConfig, ChatRequest, HealthResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])


def get_config() -> AIConfig:
    return AIConfig()


def get_llm_client(config: AIConfig = Depends(get_config)) -> LLMClient:
    return OllamaClient(config=config)


@router.get("/health", response_model=HealthResponse)
async def ai_health(
    config: AIConfig = Depends(get_config),
    llm: LLMClient = Depends(get_llm_client),
) -> HealthResponse:
    status = await llm.health()
    return HealthResponse(
        ai_enabled=config.ai_enabled,
        ollama_reachable=bool(status.get("ollama_reachable", False)),
        model=config.ai_model,
        model_present=bool(status.get("model_present", False)),
        prompt_version=PROMPT_VERSION,
        hint=status.get("hint"),
    )


@router.post("/chat")
async def ai_chat(
    chat_req: ChatRequest,
    request: Request,
    config: AIConfig = Depends(get_config),
    llm: LLMClient = Depends(get_llm_client),
) -> StreamingResponse:
    if not config.ai_enabled:
        raise HTTPException(
            status_code=503,
            detail={"code": "ai_disabled", "message": "AI assistant is disabled."},
        )

    client_ip = request.client.host if request.client else "127.0.0.1"
    if not rate_limiter.allow(client_ip, config.ai_rate_limit_per_min):
        raise HTTPException(
            status_code=429,
            detail={"code": "rate_limited", "message": "Rate limit exceeded. Please wait a moment."},
        )

    from .orchestrator import run_orchestrator_sse

    async def event_stream() -> AsyncIterator[str]:
        async for event_name, data in run_orchestrator_sse(chat_req, llm, config):
            yield f"event: {event_name}\ndata: {json.dumps(data)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator

CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def get_env_bool(key: str, default: bool) -> bool:
    val = os.getenv(key)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


class AIConfig(BaseModel):
    ai_enabled: bool = Field(default_factory=lambda: get_env_bool("AI_ENABLED", True))
    ollama_base_url: str = Field(default_factory=lambda: os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"))
    ai_model: str = Field(default_factory=lambda: os.getenv("AI_MODEL", "qwen3:4b"))
    ai_temperature: float = Field(default_factory=lambda: float(os.getenv("AI_TEMPERATURE", "0.1")))
    ai_num_ctx: int = Field(default_factory=lambda: int(os.getenv("AI_NUM_CTX", "4096")))
    ai_disable_thinking: bool = Field(default_factory=lambda: get_env_bool("AI_DISABLE_THINKING", True))
    ai_max_tool_steps: int = Field(default_factory=lambda: int(os.getenv("AI_MAX_TOOL_STEPS", "4")))
    ai_request_timeout_s: float = Field(default_factory=lambda: float(os.getenv("AI_REQUEST_TIMEOUT_S", "60")))
    ai_max_message_chars: int = Field(default_factory=lambda: int(os.getenv("AI_MAX_MESSAGE_CHARS", "1000")))
    ai_rate_limit_per_min: int = Field(default_factory=lambda: int(os.getenv("AI_RATE_LIMIT_PER_MIN", "20")))
    ai_log_full_prompts: bool = Field(default_factory=lambda: get_env_bool("AI_LOG_FULL_PROMPTS", False))
    ai_strict_faithfulness: bool = Field(default_factory=lambda: get_env_bool("AI_STRICT_FAITHFULNESS", False))


def validate_no_control_chars(value: str, field_name: str = "value") -> str:
    if CONTROL_CHAR_RE.search(value):
        raise ValueError(f"{field_name} contains invalid control characters.")
    return value


def validate_iso8601_utc(value: str, min_year: int = 1950, max_year: int = 2100) -> str:
    validate_no_control_chars(value, "time")
    raw = value.strip()
    if not (raw.endswith("Z") or raw.endswith("+00:00")):
        raise ValueError("Timestamp must be timezone-aware UTC ending in 'Z' or '+00:00'.")
    iso_candidate = raw[:-1] + "+00:00" if raw.endswith("Z") else raw
    try:
        dt = datetime.fromisoformat(iso_candidate)
    except ValueError as exc:
        raise ValueError("Invalid ISO 8601 UTC timestamp.") from exc
    if dt.tzinfo is None or dt.utcoffset() != timezone.utc.utcoffset(dt):
        raise ValueError("Timestamp must be UTC.")
    if not (min_year <= dt.year <= max_year):
        raise ValueError(f"Timestamp year must be between {min_year} and {max_year}.")
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

    @field_validator("content")
    @classmethod
    def check_content(cls, v: str) -> str:
        max_chars = int(os.getenv("AI_MAX_MESSAGE_CHARS", "1000"))
        if not v or not v.strip():
            raise ValueError("Message content cannot be empty.")
        if len(v) > max_chars:
            raise ValueError(f"Message exceeds maximum length of {max_chars} characters.")
        return validate_no_control_chars(v, "content")


class ChatContext(BaseModel):
    selected_site_id: str | None = Field(default=None, max_length=64)
    selected_time_utc: str | None = Field(default=None, max_length=40)

    @field_validator("selected_site_id")
    @classmethod
    def check_site_id(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return validate_no_control_chars(v.strip(), "selected_site_id")

    @field_validator("selected_time_utc")
    @classmethod
    def check_time_utc(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return validate_iso8601_utc(v)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=10)
    context: ChatContext | None = None


class SourceItem(BaseModel):
    type: Literal["mission", "site", "calculation"]
    id: str | None = None
    tool: str | None = None
    args: dict[str, Any] | None = None
    computed_at: str | None = None
    method_version: str | None = None


class SceneCommand(BaseModel):
    action: Literal["focus_site", "set_time", "set_view", "toggle_layer", "reset_camera"]
    site_id: str | None = None
    time: str | None = None
    view: Literal["moon", "earth_moon_sun", "south_pole"] | None = None
    layer: Literal["markers", "labels", "orbits"] | None = None
    visible: bool | None = None


class ChatResult(BaseModel):
    answer: str
    sources: list[SourceItem] = Field(default_factory=list)
    scene_commands: list[SceneCommand] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ToolResult(BaseModel):
    status: Literal["ok", "not_found", "not_available", "invalid_args", "error"]
    data: dict[str, Any] | list[Any] | None = None
    message: str | None = None
    warnings: list[str] = Field(default_factory=list)
    source: SourceItem | None = None


class HealthResponse(BaseModel):
    ai_enabled: bool
    ollama_reachable: bool
    model: str
    model_present: bool
    prompt_version: str
    hint: str | None = None

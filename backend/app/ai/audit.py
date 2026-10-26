import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger("lunar_ai.audit")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def log_audit_event(
    *,
    request_id: str,
    tools_called: list[dict[str, Any]],
    latency_ms: float,
    error_code: str | None = None,
    log_full_prompts: bool = False,
    prompt_preview: str | None = None,
    answer_preview: str | None = None,
) -> None:
    record: dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "request_id": request_id,
        "tools": [{"name": t.get("name"), "status": t.get("status")} for t in tools_called],
        "latency_ms": round(latency_ms, 2),
        "error_code": error_code,
    }
    if log_full_prompts:
        record["prompt"] = prompt_preview
        record["answer"] = answer_preview
    logger.info(json.dumps(record))

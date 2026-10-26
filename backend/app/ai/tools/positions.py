from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Protocol
from pydantic import BaseModel, field_validator
from ..schemas import SourceItem, ToolResult, validate_iso8601_utc

REQUIRED_ENGINE_FIELDS = ("values", "units", "reference_frame", "timestamp_utc", "method_version", "assumptions")


class PositionService(Protocol):
    async def compute_positions(self, time_utc: str) -> dict[str, Any]: ...


_position_service: PositionService | None = None


def set_position_service(service: PositionService | None) -> None:
    global _position_service
    _position_service = service


class GetPositionsArgs(BaseModel):
    time: str

    @field_validator("time")
    @classmethod
    def check_time(cls, v: str) -> str:
        return validate_iso8601_utc(v)


async def get_positions(args: GetPositionsArgs) -> ToolResult:
    # TODO(engine): Connect PositionService implementation when orbital mechanics module is available.
    if _position_service is None:
        return ToolResult(
            status="not_available",
            message="The position/illumination calculation engine is not implemented yet.",
        )

    raw = await _position_service.compute_positions(args.time)
    warnings = [f"Engine result lacks {f}" for f in REQUIRED_ENGINE_FIELDS if f not in raw]
    return ToolResult(
        status="ok",
        data=raw,
        warnings=warnings,
        source=SourceItem(
            type="calculation",
            tool="get_positions",
            args={"time": args.time},
            computed_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            method_version=str(raw.get("method_version", "unknown")),
        ),
    )

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Protocol
from pydantic import BaseModel, field_validator
from ..schemas import SourceItem, ToolResult, validate_iso8601_utc
from .sites import resolve_canonical_site_id

REQUIRED_ENGINE_FIELDS = ("values", "units", "reference_frame", "timestamp_utc", "method_version", "assumptions")


class IlluminationService(Protocol):
    async def compute_illumination(self, site_id: str, time_utc: str) -> dict[str, Any]: ...


_illumination_service: IlluminationService | None = None


def set_illumination_service(service: IlluminationService | None) -> None:
    global _illumination_service
    _illumination_service = service


class GetIlluminationArgs(BaseModel):
    site_id: str
    time: str

    @field_validator("site_id")
    @classmethod
    def check_site(cls, v: str) -> str:
        canonical = resolve_canonical_site_id(v)
        if not canonical:
            raise ValueError(f"Unknown site_id '{v}'.")
        return canonical

    @field_validator("time")
    @classmethod
    def check_time(cls, v: str) -> str:
        return validate_iso8601_utc(v)


async def get_illumination(args: GetIlluminationArgs) -> ToolResult:
    # TODO(engine): Connect IlluminationService implementation when scientific engine is available.
    if _illumination_service is None:
        return ToolResult(
            status="not_available",
            message="The position/illumination calculation engine is not implemented yet.",
        )

    raw = await _illumination_service.compute_illumination(args.site_id, args.time)
    warnings = [f"Engine result lacks {f}" for f in REQUIRED_ENGINE_FIELDS if f not in raw]
    return ToolResult(
        status="ok",
        data=raw,
        warnings=warnings,
        source=SourceItem(
            type="calculation",
            tool="get_illumination",
            args={"site_id": args.site_id, "time": args.time},
            computed_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            method_version=str(raw.get("method_version", "unknown")),
        ),
    )

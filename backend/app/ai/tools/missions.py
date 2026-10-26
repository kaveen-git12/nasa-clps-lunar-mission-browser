from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field, field_validator
from ..schemas import SourceItem, ToolResult, validate_no_control_chars

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "missions.seed.json"


def _load_missions() -> list[dict[str, Any]]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("missions", [])


def _format_mission(record: dict[str, Any]) -> dict[str, Any]:
    return {
        k: ("not yet provided" if v is None else v)
        for k, v in record.items()
    }


class SearchMissionsArgs(BaseModel):
    query: str = Field(..., min_length=1, max_length=100)
    status: str | None = Field(default=None, max_length=50)
    limit: int = Field(default=5, ge=1, le=10)

    @field_validator("query")
    @classmethod
    def clean_query(cls, v: str) -> str:
        return validate_no_control_chars(v.strip(), "query")

    @field_validator("status")
    @classmethod
    def clean_status(cls, v: str | None) -> str | None:
        return validate_no_control_chars(v.strip(), "status") if v else None


class GetMissionArgs(BaseModel):
    mission_id: str = Field(..., min_length=1, max_length=64)

    @field_validator("mission_id")
    @classmethod
    def clean_mission_id(cls, v: str) -> str:
        return validate_no_control_chars(v.strip(), "mission_id")


async def search_missions(args: SearchMissionsArgs) -> ToolResult:
    missions = _load_missions()
    if not missions:
        return ToolResult(
            status="ok",
            data=[],
            message="No mission data loaded.",
            warnings=["No mission records are loaded in the database yet."],
        )

    q = args.query.lower()
    matched: list[dict[str, Any]] = []
    for m in missions:
        if args.status and (m.get("status") or "").lower() != args.status.lower():
            continue
        searchable = " ".join(
            str(m.get(field) or "") for field in ("id", "name", "provider", "site_name", "status", "region")
        ).lower()
        if q in searchable:
            matched.append(_format_mission(m))
        if len(matched) >= args.limit:
            break

    return ToolResult(
        status="ok",
        data=matched,
        message=f"Found {len(matched)} matching mission(s)." if matched else "No matching missions found.",
    )


async def get_mission(args: GetMissionArgs) -> ToolResult:
    missions = _load_missions()
    if not missions:
        return ToolResult(
            status="not_found",
            message="No mission data loaded.",
        )
    needle = args.mission_id.lower()
    for m in missions:
        if str(m.get("id", "")).lower() == needle:
            return ToolResult(
                status="ok",
                data=_format_mission(m),
                source=SourceItem(type="mission", id=str(m["id"])),
            )
    return ToolResult(status="not_found", message=f"Mission '{args.mission_id}' was not found.")

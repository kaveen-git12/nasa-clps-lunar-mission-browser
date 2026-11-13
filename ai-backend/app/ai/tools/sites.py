from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field, field_validator
from ..schemas import SourceItem, ToolResult, validate_no_control_chars

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sites.seed.json"


def _load_sites() -> list[dict[str, Any]]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("sites", [])


def _format_site(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": record["id"],
        "name": record["name"],
        "region": record.get("region") or "not yet provided",
        "lat": "not yet provided" if record.get("lat") is None else record["lat"],
        "lon": "not yet provided" if record.get("lon") is None else record["lon"],
        "datum": "not yet provided" if record.get("datum") is None else record["datum"],
        "confirmed_landing_site": bool(record.get("confirmed_landing_site", False)),
        "notes": record.get("notes") or "not yet provided",
    }


def resolve_canonical_site_id(site_id: str) -> str | None:
    needle = site_id.strip().lower()
    for site in _load_sites():
        if site["id"].lower() == needle or site["name"].lower() == needle:
            return site["id"]
    return None


class ListSitesArgs(BaseModel):
    region: str | None = Field(default=None, max_length=64)

    @field_validator("region")
    @classmethod
    def clean_region(cls, v: str | None) -> str | None:
        return validate_no_control_chars(v.strip(), "region") if v else None


class GetSiteArgs(BaseModel):
    site_id: str = Field(..., min_length=1, max_length=64)

    @field_validator("site_id")
    @classmethod
    def clean_site_id(cls, v: str) -> str:
        return validate_no_control_chars(v.strip(), "site_id")


async def list_sites(args: ListSitesArgs) -> ToolResult:
    sites = _load_sites()
    if args.region:
        reg = args.region.lower().replace(" ", "_")
        sites = [s for s in sites if (s.get("region") or "").lower() == reg]
    formatted = [_format_site(s) for s in sites]
    return ToolResult(
        status="ok",
        data=formatted,
        message=f"Found {len(formatted)} site(s).",
    )


async def get_site(args: GetSiteArgs) -> ToolResult:
    canonical_id = resolve_canonical_site_id(args.site_id)
    if not canonical_id:
        return ToolResult(
            status="not_found",
            message=f"Site '{args.site_id}' was not found in the site catalog.",
        )
    for site in _load_sites():
        if site["id"] == canonical_id:
            formatted = _format_site(site)
            warnings = []
            if site.get("lat") is None or site.get("lon") is None:
                warnings.append(f"Coordinates for '{canonical_id}' are not yet provided in seed data.")
            return ToolResult(
                status="ok",
                data=formatted,
                warnings=warnings,
                source=SourceItem(type="site", id=canonical_id),
            )
    return ToolResult(status="not_found", message=f"Site '{args.site_id}' not found.")

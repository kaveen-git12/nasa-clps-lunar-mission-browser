from __future__ import annotations

from typing import Any, Callable, Coroutine
from pydantic import BaseModel, ValidationError
from ..schemas import ToolResult
from .illumination import GetIlluminationArgs, get_illumination
from .missions import GetMissionArgs, SearchMissionsArgs, get_mission, search_missions
from .positions import GetPositionsArgs, get_positions
from .scene import SceneCommandArgs, scene_command
from .sites import GetSiteArgs, ListSitesArgs, get_site, list_sites

ToolHandler = Callable[[Any], Coroutine[Any, Any, ToolResult]]

TOOL_REGISTRY: dict[str, tuple[type[BaseModel], ToolHandler, str]] = {
    "search_missions": (
        SearchMissionsArgs,
        search_missions,
        "Search NASA CLPS lunar missions by keyword and optional status.",
    ),
    "get_mission": (
        GetMissionArgs,
        get_mission,
        "Get full details for a specific lunar mission by mission_id.",
    ),
    "list_sites": (
        ListSitesArgs,
        list_sites,
        "List lunar landing sites, optionally filtered by region (e.g., south_pole).",
    ),
    "get_site": (
        GetSiteArgs,
        get_site,
        "Get detailed record for a specific lunar landing site by site_id.",
    ),
    "get_positions": (
        GetPositionsArgs,
        get_positions,
        "Calculate Moon/Earth/Sun positions at an ISO 8601 UTC timestamp.",
    ),
    "get_illumination": (
        GetIlluminationArgs,
        get_illumination,
        "Calculate solar illumination at a lunar site_id for an ISO 8601 UTC timestamp.",
    ),
    "scene_command": (
        SceneCommandArgs,
        scene_command,
        "Control the 3D scene camera, time, view mode, or layer visibility.",
    ),
}


def get_ollama_tool_schemas() -> list[dict[str, Any]]:
    schemas: list[dict[str, Any]] = []
    for name, (model_cls, _, description) in TOOL_REGISTRY.items():
        schemas.append(
            {
                "type": "function",
                "function": {
                    "name": name,
                    "description": description,
                    "parameters": model_cls.model_json_schema(),
                },
            }
        )
    return schemas


async def dispatch_tool(name: str, raw_args: dict[str, Any]) -> ToolResult:
    if name not in TOOL_REGISTRY:
        return ToolResult(status="invalid_args", message=f"Unknown tool '{name}'.")
    model_cls, handler, _ = TOOL_REGISTRY[name]
    try:
        validated_args = model_cls.model_validate(raw_args)
    except ValidationError as exc:
        errors = "; ".join(f"{'.'.join(str(x) for x in e['loc'])}: {e['msg']}" for e in exc.errors())
        return ToolResult(status="invalid_args", message=f"Invalid tool arguments: {errors}")
    try:
        return await handler(validated_args)
    except Exception:
        return ToolResult(status="error", message=f"Tool '{name}' encountered an execution error.")

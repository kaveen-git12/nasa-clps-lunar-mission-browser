from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, model_validator
from ..schemas import SceneCommand, ToolResult, validate_iso8601_utc
from .sites import resolve_canonical_site_id


class SceneCommandArgs(BaseModel):
    action: Literal["focus_site", "set_time", "set_view", "toggle_layer", "reset_camera"]
    site_id: str | None = None
    time: str | None = None
    view: Literal["moon", "earth_moon_sun", "south_pole"] | None = None
    layer: Literal["markers", "labels", "orbits"] | None = None
    visible: bool | None = None

    @model_validator(mode="after")
    def check_action_params(self) -> "SceneCommandArgs":
        if self.action == "focus_site":
            if not self.site_id:
                raise ValueError("site_id is required for action 'focus_site'.")
            canonical = resolve_canonical_site_id(self.site_id)
            if not canonical:
                raise ValueError(f"Unknown site_id '{self.site_id}'.")
            self.site_id = canonical
        elif self.action == "set_time":
            if not self.time:
                raise ValueError("time is required for action 'set_time'.")
            self.time = validate_iso8601_utc(self.time)
        elif self.action == "set_view":
            if not self.view:
                raise ValueError("view is required for action 'set_view'.")
        elif self.action == "toggle_layer":
            if not self.layer or self.visible is None:
                raise ValueError("layer and visible are required for action 'toggle_layer'.")
        return self


async def scene_command(args: SceneCommandArgs) -> ToolResult:
    cmd = SceneCommand(
        action=args.action,
        site_id=args.site_id,
        time=args.time,
        view=args.view,
        layer=args.layer,
        visible=args.visible,
    )
    return ToolResult(
        status="ok",
        data=cmd.model_dump(exclude_none=True),
        message=f"Scene command '{args.action}' validated and queued.",
    )

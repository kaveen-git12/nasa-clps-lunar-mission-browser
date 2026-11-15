// frontend/src/features/ai/useSceneCommands.ts
import { useCallback, useState } from "react";
import { sceneCommandBus } from "./sceneCommandBus";
import type { SceneCommand } from "./types";

const ALLOWED_ACTIONS = new Set([
  "focus_site",
  "set_time",
  "set_view",
  "toggle_layer",
  "reset_camera",
]);
const ALLOWED_SITES = new Set(["shackleton", "de-gerlache", "malapert-massif"]);
const ALLOWED_VIEWS = new Set(["moon", "earth_moon_sun", "south_pole"]);
const ALLOWED_LAYERS = new Set(["markers", "labels", "orbits"]);

export function validateSceneCommandClient(cmd: unknown): cmd is SceneCommand {
  if (!cmd || typeof cmd !== "object") return false;
  const c = cmd as Record<string, unknown>;
  if (typeof c.action !== "string" || !ALLOWED_ACTIONS.has(c.action)) return false;

  if (c.action === "focus_site") {
    return typeof c.site_id === "string" && ALLOWED_SITES.has(c.site_id.toLowerCase());
  }
  if (c.action === "set_time") {
    if (typeof c.time !== "string") return false;
    if (!(c.time.endsWith("Z") || c.time.endsWith("+00:00"))) return false;
    const parsed = Date.parse(c.time);
    if (Number.isNaN(parsed)) return false;
    const year = new Date(parsed).getUTCFullYear();
    return year >= 1950 && year <= 2100;
  }
  if (c.action === "set_view") {
    return typeof c.view === "string" && ALLOWED_VIEWS.has(c.view);
  }
  if (c.action === "toggle_layer") {
    return (
      typeof c.layer === "string" &&
      ALLOWED_LAYERS.has(c.layer) &&
      typeof c.visible === "boolean"
    );
  }
  return true;
}

export function useSceneCommands() {
  const [sceneNotice, setSceneNotice] = useState<string | null>(null);

  const dispatchSceneCommands = useCallback((commands: SceneCommand[]) => {
    for (const cmd of commands) {
      if (!validateSceneCommandClient(cmd)) {
        console.warn("[useSceneCommands] Dropped invalid scene command:", cmd);
        continue;
      }
      const delivered = sceneCommandBus.publish(cmd);
      if (!delivered) {
        setSceneNotice("Scene control isn't connected yet");
      }
    }
  }, []);

  const clearSceneNotice = useCallback(() => setSceneNotice(null), []);

  return { dispatchSceneCommands, sceneNotice, clearSceneNotice };
}

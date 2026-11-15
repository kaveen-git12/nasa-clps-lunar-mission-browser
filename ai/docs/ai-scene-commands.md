# 3D Scene Command Integration Guide

This guide explains how the 3D scene owner (Three.js / React Three Fiber / Cesium globe) subscribes to and executes validated scene commands dispatched by the Lunar AI assistant.

---

## 1. Overview
When a user asks Lunar AI to navigate or change the 3D scene (e.g., *"Fly to Malapert Massif"*, *"Switch to south pole view"*), the local model proposes a `scene_command` tool call.

1. **Backend Validation:** Validates action enums, canonical site IDs, and ISO 8601 UTC timestamps.
2. **Frontend Validation:** `useSceneCommands.ts` re-validates the structure before publishing.
3. **Event Bus:** `sceneCommandBus` broadcasts the event to all active subscribers.
4. **Fallback:** If no 3D scene component is currently subscribed, the UI displays a subtle notice: `"Scene control isn't connected yet"`.

---

## 2. Command Schema

```typescript
export type SceneAction =
  | "focus_site"
  | "set_time"
  | "set_view"
  | "toggle_layer"
  | "reset_camera";

export type SceneViewMode = "moon" | "earth_moon_sun" | "south_pole";
export type SceneLayerName = "markers" | "labels" | "orbits";

export interface SceneCommand {
  action: SceneAction;
  site_id?: string;               // Required for "focus_site" (e.g., "shackleton", "malapert-massif")
  time?: string;                  // Required for "set_time" (ISO 8601 UTC ending in Z or +00:00)
  view?: SceneViewMode;           // Required for "set_view"
  layer?: SceneLayerName;         // Required for "toggle_layer"
  visible?: boolean;              // Required for "toggle_layer"
}
```

---

## 3. Subscribing in 3D Scene Components

In your Three.js or React Three Fiber scene component (e.g., `frontend/src/components/LunarScene.tsx` or `frontend/src/pages/Visualization.tsx`), import `sceneCommandBus` and subscribe during mount:

```tsx
import { useEffect } from "react";
import { sceneCommandBus } from "@/features/ai/sceneCommandBus";
import type { SceneCommand } from "@/features/ai/types";

export function LunarVisualizationScene() {
  useEffect(() => {
    const unsubscribe = sceneCommandBus.subscribe((command: SceneCommand) => {
      console.log("[LunarScene] Received scene command:", command);

      switch (command.action) {
        case "focus_site":
          // Smoothly animate camera to the landing site coordinates
          // e.g., controls.current.flyToSite(command.site_id);
          break;

        case "set_time":
          // Update simulation ephemeris time
          // e.g., setSimulationTime(new Date(command.time));
          break;

        case "set_view":
          // Switch viewpoint (e.g., South Pole polar view vs Earth-Moon-Sun orbital view)
          // e.g., setViewMode(command.view);
          break;

        case "toggle_layer":
          // Toggle visibility of markers, labels, or orbital paths
          // e.g., setLayerVisibility(command.layer, command.visible);
          break;

        case "reset_camera":
          // Return camera to default orbit position
          // e.g., controls.current.reset();
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    // Your 3D Canvas / Three.js scene JSX here
    <div id="canvas-container">...</div>
  );
}
```

---

## 4. Safety & Rules
- **No Direct Execution by Model:** The model only generates structured data; it never executes code or manipulates Three.js instances directly.
- **Fail-Safe:** Invalid commands are automatically dropped with a console warning.
- **Idempotency:** Repeated identical commands (such as double `reset_camera`) should be handled gracefully by the scene controller without jitter.

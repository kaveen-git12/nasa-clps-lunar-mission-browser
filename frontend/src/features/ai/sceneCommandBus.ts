// frontend/src/features/ai/sceneCommandBus.ts
import type { SceneCommand } from "./types";

export type SceneCommandHandler = (command: SceneCommand) => void;

class SceneCommandBus {
  private listeners = new Set<SceneCommandHandler>();

  subscribe(handler: SceneCommandHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  publish(command: SceneCommand): boolean {
    if (this.listeners.size === 0) {
      return false;
    }
    this.listeners.forEach((handler) => {
      try {
        handler(command);
      } catch (err) {
        console.error("[sceneCommandBus] Subscriber error:", err);
      }
    });
    return true;
  }

  hasSubscribers(): boolean {
    return this.listeners.size > 0;
  }
}

export const sceneCommandBus = new SceneCommandBus();

// src/hooks/useSpacecraftCursor.ts
import { useEffect } from 'react';
import { useStore } from '@/lib/mission-store';

const RELEASE_DELAY_MS = 240;
const ACTIVE_CLASS = 'cursor-lander-active';
const ENABLED_CLASS = 'spacecraft-cursor-enabled';

export function useSpacecraftCursor(): void {
  const { prefs } = useStore();
  const enabled = prefs.spacecraftCursor ?? true;

  useEffect(() => {
    const root = document.documentElement;

    if (!enabled) {
      root.classList.remove(ENABLED_CLASS);
      root.classList.remove(ACTIVE_CLASS);
      return;
    }

    root.classList.add(ENABLED_CLASS);
    let releaseTimeoutId: number | null = null;
    let isPressed = false;

    const clearReleaseTimer = () => {
      if (releaseTimeoutId !== null) {
        window.clearTimeout(releaseTimeoutId);
        releaseTimeoutId = null;
      }
    };

    const activateLander = () => {
      isPressed = true;
      clearReleaseTimer();
      root.classList.add(ACTIVE_CLASS);
    };

    const scheduleSatelliteRestore = (immediate = false) => {
      isPressed = false;
      clearReleaseTimer();

      if (immediate) {
        root.classList.remove(ACTIVE_CLASS);
        return;
      }

      releaseTimeoutId = window.setTimeout(() => {
        if (!isPressed) {
          root.classList.remove(ACTIVE_CLASS);
        }
        releaseTimeoutId = null;
      }, RELEASE_DELAY_MS);
    };

    const handlePointerDown = (event: PointerEvent) => {
      // Only trigger on primary/auxiliary mouse presses or touch/pen contact
      if (event.pointerType === 'mouse' && event.buttons === 0) return;
      activateLander();
    };

    const handlePointerUp = () => {
      scheduleSatelliteRestore(false);
    };

    const handlePointerCancel = () => {
      scheduleSatelliteRestore(true);
    };

    const handleWindowBlur = () => {
      scheduleSatelliteRestore(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        scheduleSatelliteRestore(true);
      }
    };

    // Use capture: true so Three.js canvas OrbitControls cannot swallow pointer events
    const listenerOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };

    window.addEventListener('pointerdown', handlePointerDown, listenerOptions);
    window.addEventListener('pointerup', handlePointerUp, listenerOptions);
    window.addEventListener('pointercancel', handlePointerCancel, listenerOptions);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearReleaseTimer();
      root.classList.remove(ACTIVE_CLASS);
      window.removeEventListener('pointerdown', handlePointerDown, listenerOptions);
      window.removeEventListener('pointerup', handlePointerUp, listenerOptions);
      window.removeEventListener('pointercancel', handlePointerCancel, listenerOptions);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
}

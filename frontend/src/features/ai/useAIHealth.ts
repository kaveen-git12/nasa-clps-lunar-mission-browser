// frontend/src/features/ai/useAIHealth.ts
import { useCallback, useEffect, useState } from "react";
import type { AIHealthStatus } from "./types";

export const STORAGE_AI_ENABLED_KEY = "honoured1_ai_enabled";
const API_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

const SYNC_EVENT_NAME = "honoured1-ai-enabled-sync";

export function useAIHealth() {
  const [aiEnabledByUser, setAiEnabledByUserState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AI_ENABLED_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  const [health, setHealth] = useState<AIHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const setAiEnabledByUser = useCallback((enabled: boolean) => {
    setAiEnabledByUserState(enabled);
    try {
      localStorage.setItem(STORAGE_AI_ENABLED_KEY, String(enabled));
      // Dispatch custom event for intra-tab synchronization and storage event for inter-tab
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: enabled }));
    } catch {
      // ignore storage errors
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/health`);
      if (!res.ok) throw new Error("Health endpoint failed");
      const data: AIHealthStatus = await res.json();
      setHealth(data);
    } catch {
      setHealth({
        ai_enabled: true,
        ollama_reachable: false,
        model: "qwen3:4b",
        model_present: false,
        prompt_version: "2",
        hint: "AI assistant is offline",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    // Poll health status periodically every 15 seconds
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, [refreshHealth]);

  // Synchronize state across tabs and between Settings & AI Assistant views
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setAiEnabledByUserState(customEvent.detail);
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_AI_ENABLED_KEY);
          setAiEnabledByUserState(saved === null ? true : saved === "true");
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(SYNC_EVENT_NAME, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT_NAME, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const isOffline = health ? !health.ollama_reachable : false;

  return {
    health,
    loading,
    isOffline,
    aiEnabledByUser,
    setAiEnabledByUser,
    refreshHealth,
  };
}

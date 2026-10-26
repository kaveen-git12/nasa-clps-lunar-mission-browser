// frontend/src/features/ai/useAIChat.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AIHealthStatus,
  AIStatusEvent,
  ChatContext,
  ChatResult,
  ConversationThread,
  UIMessage,
} from "./types";
import { useSceneCommands } from "./useSceneCommands";

const API_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  "http://localhost:8000";

const STORAGE_ENABLED_KEY = "honoured1_ai_enabled";
const STORAGE_THREADS_KEY = "honoured1_ai_recent_threads";

const INITIAL_ASSISTANT_MESSAGE: UIMessage = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "I can help you explore CLPS missions, lunar landing sites, illumination conditions, and scientific data using the project's local tools.\n\nHow can I assist you today?",
  timestamp: "4:32 PM",
};

const DEFAULT_RECENT_THREADS: ConversationThread[] = [
  {
    id: "thread-1",
    title: "Shackleton crater details",
    updatedAtLabel: "Today, 4:32 PM",
    messages: [INITIAL_ASSISTANT_MESSAGE],
  },
  {
    id: "thread-2",
    title: "Mission payloads comparison",
    updatedAtLabel: "Yesterday, 7:36 PM",
    messages: [INITIAL_ASSISTANT_MESSAGE],
  },
  {
    id: "thread-3",
    title: "Illumination at south pole",
    updatedAtLabel: "Oct 21, 2026",
    messages: [INITIAL_ASSISTANT_MESSAGE],
  },
];

export function useAIChat(context?: ChatContext) {
  const [aiEnabledByUser, setAiEnabledByUserState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ENABLED_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_THREADS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_RECENT_THREADS;
    } catch {
      return DEFAULT_RECENT_THREADS;
    }
  });

  const [messages, setMessages] = useState<UIMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
  const [status, setStatus] = useState<AIStatusEvent | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [health, setHealth] = useState<AIHealthStatus | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { dispatchSceneCommands, sceneNotice, clearSceneNotice } = useSceneCommands();

  const setAiEnabledByUser = useCallback((enabled: boolean) => {
    setAiEnabledByUserState(enabled);
    try {
      localStorage.setItem(STORAGE_ENABLED_KEY, String(enabled));
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
        prompt_version: "1",
        hint: "AI assistant is offline",
      });
    }
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStatus(null);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  const sendMessage = useCallback(
    async (userInput: string) => {
      const trimmed = userInput.trim();
      if (!trimmed || !aiEnabledByUser) return;

      setErrorBanner(null);
      clearSceneNotice();

      const nowLabel = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      const userMsg: UIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: nowLabel,
      };

      const assistantPlaceholderId = `assistant-${Date.now() + 1}`;
      const assistantPlaceholder: UIMessage = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        timestamp: nowLabel,
        isStreaming: true,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages([...updatedMessages, assistantPlaceholder]);
      setStatus({ state: "thinking", tool: null });

      const controller = new AbortController();
      abortRef.current = controller;

      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome-msg")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            context: context || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait before sending another message.");
          }
          if (response.status === 503) {
            throw new Error("AI assistant is disabled on the server.");
          }
          throw new Error("AI assistant is offline or unreachable.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() || "";

          for (const block of blocks) {
            const lines = block.split("\n");
            let eventType = "";
            let dataStr = "";
            for (const line of lines) {
              if (line.startsWith("event:")) eventType = line.slice(6).trim();
              if (line.startsWith("data:")) dataStr = line.slice(5).trim();
            }
            if (!eventType || !dataStr) continue;

            const payload = JSON.parse(dataStr);

            if (eventType === "status") {
              setStatus(payload as AIStatusEvent);
            } else if (eventType === "token") {
              const chunk = (payload as { text: string }).text || "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantPlaceholderId
                    ? { ...m, content: m.content + chunk }
                    : m
                )
              );
            } else if (eventType === "final") {
              const finalData = payload as ChatResult;
              setMessages((prev) => {
                const next = prev.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: finalData.answer,
                        sources: finalData.sources,
                        scene_commands: finalData.scene_commands,
                        warnings: finalData.warnings,
                        isStreaming: false,
                      }
                    : m
                );
                // Save to recent threads in localStorage
                try {
                  const newThread: ConversationThread = {
                    id: `thread-${Date.now()}`,
                    title: trimmed.slice(0, 38),
                    updatedAtLabel: `Today, ${nowLabel}`,
                    messages: next,
                  };
                  const updatedThreads = [newThread, ...threads.slice(0, 9)];
                  setThreads(updatedThreads);
                  localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(updatedThreads));
                } catch {
                  // ignore storage errors
                }
                return next;
              });

              if (finalData.scene_commands?.length) {
                dispatchSceneCommands(finalData.scene_commands);
              }
              setStatus(null);
            } else if (eventType === "error") {
              setErrorBanner(payload.message || "Request failed.");
              setStatus(null);
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          return;
        }
        setErrorBanner((err as Error)?.message || "AI assistant is offline.");
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantPlaceholderId || m.content.length > 0)
        );
      } finally {
        setStatus(null);
        abortRef.current = null;
      }
    },
    [aiEnabledByUser, clearSceneNotice, context, dispatchSceneCommands, messages, threads]
  );

  const selectThread = useCallback((thread: ConversationThread) => {
    setMessages(thread.messages);
    setErrorBanner(null);
  }, []);

  return {
    messages,
    status,
    errorBanner,
    health,
    aiEnabledByUser,
    setAiEnabledByUser,
    sendMessage,
    stopGeneration,
    refreshHealth,
    threads,
    selectThread,
    sceneNotice,
    clearSceneNotice,
  };
}

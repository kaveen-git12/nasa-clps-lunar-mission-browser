// frontend/src/features/ai/AIChat.tsx
import React, { useState } from "react";
import {
  Paperclip,
  Send,
  User,
} from "lucide-react";
import { SourceChips } from "./SourceChips";
import type { AIStatusEvent, UIMessage } from "./types";

interface AIChatProps {
  messages: UIMessage[];
  status: AIStatusEvent | null;
  errorBanner: string | null;
  sceneNotice: string | null;
  aiEnabled: boolean;
  isOffline: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  compact?: boolean;
}

const SUGGESTED_PILLS = [
  "Tell me about Shackleton crater",
  "Is it lit on 3 Nov at 12:00 UTC?",
  "Compare Malapert Massif and de Gerlache",
  "Show missions targeting the south pole",
];

function formatStatusLabel(status: AIStatusEvent): string {
  if (status.state === "tool_running") {
    if (status.tool === "get_illumination" || status.tool === "get_positions") {
      return "Running illumination & position tool...";
    }
    return "Searching mission data and site information...";
  }
  if (status.state === "writing") {
    return "Writing response...";
  }
  return "Thinking...";
}

export const AIChat: React.FC<AIChatProps> = ({
  messages,
  status,
  errorBanner,
  sceneNotice,
  aiEnabled,
  isOffline,
  onSend,
  onStop,
  compact = false,
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !aiEnabled || isOffline) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
      {/* Top Hero Banner (shown in full dashboard mode) */}
      {!compact && (
        <div className="flex items-center gap-4 px-1 py-2">
          {/* Lunar AI Robot Logo */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/25 to-purple-500/25 blur-md" />
            <img
              src="/images/lunar-ai-robot.jpg"
              alt="Lunar AI Robot Logo"
              className="relative h-20 w-20 md:h-22 md:w-22 rounded-full object-contain ring-1 ring-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.35),0_0_35px_rgba(168,85,247,0.3)]"
            />
          </div>

          {/* Heading and Descriptions */}
          <div className="flex flex-col justify-center">
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Lunar AI
              </span>
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-300">
              Ask. Explore. Analyze.
            </p>
            <p className="mt-0.5 text-xs md:text-sm text-muted-foreground">
              Your local AI assistant for lunar missions, site analysis and scientific exploration.
            </p>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.12] via-indigo-300/[0.06] to-purple-400/[0.10] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.20),0_0_24px_rgba(139,92,246,0.08)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/[0.10] via-transparent to-purple-400/[0.08]" />

        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-400/15 blur-3xl" />
        {/* Offline / Error / Scene Notices */}
        <div className="relative z-10 shrink-0 space-y-2">
          {!aiEnabled && (
            <div className="rounded-xl border border-slate-500/40 bg-slate-800/60 px-4 py-2.5 text-xs text-slate-200">
              AI assistant is disabled in Settings. Enable it to ask mission questions.
            </div>
          )}
          {aiEnabled && isOffline && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-2.5 text-xs text-rose-200">
              AI assistant is offline. Verify Ollama is running on 127.0.0.1:11434.
            </div>
          )}
          {errorBanner && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2.5 text-xs text-rose-200">
              {errorBanner}
            </div>
          )}
          {sceneNotice && (
            <div className="rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-4 py-2 text-xs text-indigo-200">
              {sceneNotice}
            </div>
          )}
        </div>

        {/* Message List */}
        <div
          className="relative z-10 my-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <React.Fragment key={msg.id}>
                <div
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/50 bg-gradient-to-br from-indigo-950/90 to-purple-900/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      <span className="text-sm text-cyan-300">✦</span>
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "border border-purple-400/50 bg-gradient-to-r from-purple-700/85 to-indigo-700/85 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                        : "border border-white/10 bg-[#12162e]/90 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {idx === 0 && !isUser && (
                      <p className="mb-1 text-base font-semibold">
                        <span className="text-cyan-300">Hello!</span> I&apos;m{" "}
                        <span className="text-purple-400">Lunar Ai.</span>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    <SourceChips
                      sources={msg.sources}
                      warnings={msg.warnings}
                    />

                    <div className="mt-1.5 flex justify-end">
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                  </div>

                  {isUser && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/50 bg-purple-600/30 text-xs font-semibold text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Suggested Prompt Pills after initial greeting */}
                {idx === 0 && !isUser && (
                  <div className="flex flex-wrap gap-2 pl-12">
                    {SUGGESTED_PILLS.map((pill) => (
                      <button
                        key={pill}
                        type="button"
                        disabled={!aiEnabled || isOffline}
                        onClick={() => onSend(pill)}
                        className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-slate-200 transition hover:border-purple-400/60 hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Streaming Status Bubble with Stop Button */}
          {status && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-purple-400/50 bg-gradient-to-br from-indigo-950/90 to-purple-900/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <span className="animate-pulse text-sm text-cyan-300">✦</span>
              </div>
              <div className="flex flex-1 items-center justify-between rounded-2xl border border-white/10 bg-[#12162e]/90 px-4 py-3 text-xs text-slate-200">
                <div className="space-y-1.5">
                  <p>{formatStatusLabel(status)}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onStop}
                  className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-[#0f132b]/90 px-3.5 py-2 shadow-inner focus-within:border-purple-400/60 focus-within:ring-2 focus-within:ring-purple-500/30"
        >
          {/* Out-of-scope Paperclip (disabled per Section 1 F8 rule) */}
          <button
            type="button"
            disabled
            title="Document upload (F8) is not available in this build"
            aria-label="Document upload is not available in this build"
            className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-slate-500 hover:text-slate-500"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={input}
            maxLength={1000}
            disabled={!aiEnabled || isOffline}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about missions, landing sites, or the Moon..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none disabled:cursor-not-allowed"
          />

          <button
            type="submit"
            disabled={!input.trim() || !aiEnabled || isOffline || Boolean(status)}
            aria-label="Send message"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.7)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

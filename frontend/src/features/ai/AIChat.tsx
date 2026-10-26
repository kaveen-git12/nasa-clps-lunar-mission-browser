// frontend/src/features/ai/AIChat.tsx
import React, { useState } from "react";
import {
  BarChart2,
  FileText,
  MapPin,
  Paperclip,
  Send,
  Sun,
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

const QUICK_ACTION_CARDS = [
  {
    label: "Explain a landing site",
    prompt: "Tell me about Shackleton crater and why it's important for lunar missions.",
    icon: MapPin,
    color: "from-purple-900/30 to-indigo-900/20 border-purple-500/30 text-purple-200 hover:border-purple-400/60",
    iconColor: "text-purple-300",
  },
  {
    label: "Check illumination",
    prompt: "Is Shackleton lit on 2026-11-03T12:00:00Z?",
    icon: Sun,
    color: "from-amber-950/30 to-yellow-950/20 border-amber-500/30 text-amber-200 hover:border-amber-400/60",
    iconColor: "text-amber-300",
  },
  {
    label: "Compare landing zones",
    prompt: "Compare Malapert Massif and de Gerlache crater using site records.",
    icon: BarChart2,
    color: "from-fuchsia-950/30 to-purple-950/20 border-fuchsia-500/30 text-fuchsia-200 hover:border-fuchsia-400/60",
    iconColor: "text-fuchsia-300",
  },
  {
    label: "Summarize mission data",
    prompt: "Show missions targeting the south pole.",
    icon: FileText,
    color: "from-blue-950/30 to-sky-950/20 border-blue-500/30 text-sky-200 hover:border-sky-400/60",
    iconColor: "text-sky-300",
  },
];

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
    <div className="flex h-full flex-col gap-4">
      {/* Top Hero Banner (shown in full dashboard mode) */}
      {!compact && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a0d20]/95 via-[#0e142e]/90 to-[#12193b]/85 p-6 shadow-2xl backdrop-blur-xl">
          {/* Subtle starry background and lunar glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-2/5 bg-[radial-gradient(ellipse_at_top_right,rgba(147,197,253,0.15),transparent_70%)]" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center gap-6">
              {/* Glowing 4-Point Star Orb */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-purple-400/40 bg-gradient-to-br from-indigo-900/60 via-purple-700/50 to-cyan-500/40 shadow-[0_0_40px_rgba(168,85,247,0.55),inset_0_0_15px_rgba(192,132,252,0.4)]">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md animate-pulse" />
                <svg
                  viewBox="0 0 24 24"
                  className="relative h-12 w-12 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.95)]"
                  fill="currentColor"
                >
                  <path d="M12 1.5L14.7 9.3L22.5 12L14.7 14.7L12 22.5L9.3 14.7L1.5 12L9.3 9.3L12 1.5Z" />
                </svg>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  YOUR LOCAL MISSION ASSISTANT
                </p>
                <h1 className="mt-0.5 bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 bg-clip-text font-['Outfit',sans-serif] text-4xl font-bold tracking-tight text-transparent drop-shadow-[0_0_20px_rgba(129,140,248,0.3)]">
                  Lunar AI
                </h1>
                <p className="mt-1 text-sm font-medium">
                  <span className="text-cyan-300 font-semibold">Ask.</span>{" "}
                  <span className="text-indigo-200 font-semibold">Explore.</span>{" "}
                  <span className="text-white font-semibold">Analyze.</span>
                </p>
                <p className="mt-1 max-w-xl text-xs text-slate-300/80 leading-relaxed">
                  Your local AI assistant for lunar missions, site analysis and scientific
                  exploration. Powered by Qwen3 4B (Ollama).
                </p>
              </div>
            </div>

            {/* 4 Quick Action Cards */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_ACTION_CARDS.map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={card.label}
                    type="button"
                    disabled={!aiEnabled || isOffline}
                    onClick={() => onSend(card.prompt)}
                    className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-br px-4 py-3 text-left text-xs font-medium transition hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 ${card.color}`}
                  >
                    <IconComponent className={`h-4 w-4 shrink-0 ${card.iconColor}`} />
                    <span className="truncate">{card.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="flex flex-1 flex-col justify-between rounded-3xl border border-white/10 bg-[#080b18]/85 p-4 shadow-2xl backdrop-blur-xl">
        {/* Offline / Error / Scene Notices */}
        <div className="space-y-2">
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
          className="my-3 flex-1 space-y-4 overflow-y-auto pr-1"
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
          className="flex items-center gap-2 rounded-full border border-white/15 bg-[#0f132b]/90 px-3.5 py-2 shadow-inner focus-within:border-purple-400/60 focus-within:ring-2 focus-within:ring-purple-500/30"
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

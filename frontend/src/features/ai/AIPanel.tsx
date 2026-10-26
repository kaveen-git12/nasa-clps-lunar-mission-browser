// frontend/src/features/ai/AIPanel.tsx
import React, { useState } from "react";
import {
  Box,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  HardDrive,
  Layers,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { AIChat } from "./AIChat";
import type { ChatContext } from "./types";
import { useAIChat } from "./useAIChat";

interface AIPanelProps {
  /** "dashboard" renders the full 2-column Lunar AI Mission Control view; "drawer" renders a collapsible floating panel */
  variant?: "dashboard" | "drawer";
  context?: ChatContext;
}

const AVAILABLE_TOOLS_CARDS = [
  {
    name: "Mission Search",
    desc: "Find and explore CLPS missions",
    prompt: "Show missions targeting the south pole",
    icon: Search,
    iconBg: "bg-blue-600/25 border-blue-500/40 text-blue-300",
  },
  {
    name: "Site Information",
    desc: "Get details about lunar landing sites",
    prompt: "Tell me about Shackleton crater",
    icon: Compass,
    iconBg: "bg-purple-600/25 border-purple-500/40 text-purple-300",
  },
  {
    name: "Illumination Analysis",
    desc: "Check lighting conditions for a time",
    prompt: "Is Shackleton lit on 2026-11-03T12:00:00Z?",
    icon: Sun,
    iconBg: "bg-amber-600/25 border-amber-500/40 text-amber-300",
  },
  {
    name: "Scene Control",
    desc: "Fly to a location in 3D view",
    prompt: "Fly to Malapert Massif",
    icon: Box,
    iconBg: "bg-cyan-600/25 border-cyan-500/40 text-cyan-300",
  },
];

export const AIPanel: React.FC<AIPanelProps> = ({
  variant = "dashboard",
  context,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    messages,
    status,
    errorBanner,
    health,
    aiEnabledByUser,
    setAiEnabledByUser,
    sendMessage,
    stopGeneration,
    threads,
    selectThread,
    sceneNotice,
  } = useAIChat(context);

  const isOffline = health ? !health.ollama_reachable : false;

  if (variant === "drawer") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {!drawerOpen ? (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2.5 rounded-full border border-purple-400/50 bg-[#0e122b]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.6)] backdrop-blur-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>AI Assistant</span>
          </button>
        ) : (
          <div className="flex h-[600px] w-[420px] flex-col rounded-3xl border border-white/15 bg-[#080b18]/95 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span className="font-['Outfit',sans-serif] text-sm font-bold text-white">
                  Lunar AI Assistant
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChat
                messages={messages}
                status={status}
                errorBanner={errorBanner}
                sceneNotice={sceneNotice}
                aiEnabled={aiEnabledByUser}
                isOffline={isOffline}
                onSend={sendMessage}
                onStop={stopGeneration}
                compact
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full-Page Mission Control Dashboard Variant
  return (
    <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 gap-6 p-1 font-['Plus_Jakarta_Sans',sans-serif] text-slate-100 lg:grid-cols-12">
      {/* Center Main AI Column */}
      <div className="flex flex-col lg:col-span-8">
        <AIChat
          messages={messages}
          status={status}
          errorBanner={errorBanner}
          sceneNotice={sceneNotice}
          aiEnabled={aiEnabledByUser}
          isOffline={isOffline}
          onSend={sendMessage}
          onStop={stopGeneration}
        />
      </div>

      {/* Right Status, Tools & Recent Conversations Sidebar */}
      <aside className="flex flex-col gap-4 lg:col-span-4">
        {/* 1. Local Model Status Card */}
        <section className="rounded-3xl border border-white/10 bg-[#090d21]/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <h2 className="font-['Outfit',sans-serif] text-sm font-semibold text-white">
                Local Model Status
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  !isOffline && aiEnabledByUser
                    ? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                    : "border border-rose-400/40 bg-rose-500/20 text-rose-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    !isOffline && aiEnabledByUser ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                {!aiEnabledByUser
                  ? "Disabled"
                  : !isOffline
                  ? "Connected"
                  : "Offline"}
              </span>

              <button
                type="button"
                onClick={() => setAiEnabledByUser(!aiEnabledByUser)}
                title="Toggle Enable AI assistant"
                aria-label="Toggle Enable AI assistant"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <dl className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-slate-400" />
                <span>Model</span>
              </dt>
              <dd className="font-medium text-slate-100">Qwen3 4B (4-bit)</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Runtime</span>
              </dt>
              <dd className="font-medium text-slate-100">Ollama (127.0.0.1:11434)</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-400">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Context</span>
              </dt>
              <dd className="font-medium text-slate-100">4096 tokens</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-slate-400">
                <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                <span>Hardware</span>
              </dt>
              <dd className="font-medium text-slate-100">RTX 5050 (8 GB VRAM)</dd>
            </div>
          </dl>
        </section>

        {/* 2. Available Tools Card */}
        <section className="rounded-3xl border border-white/10 bg-[#090d21]/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              <h2 className="font-['Outfit',sans-serif] text-sm font-semibold text-white">
                Available Tools
              </h2>
            </div>
            <a
              href="#docs"
              className="text-[11px] font-medium text-indigo-300 hover:text-indigo-200"
            >
              View Docs →
            </a>
          </div>

          <div className="space-y-2">
            {AVAILABLE_TOOLS_CARDS.map((tool) => {
              const IconComp = tool.icon;
              return (
                <button
                  key={tool.name}
                  type="button"
                  disabled={!aiEnabledByUser || isOffline}
                  onClick={() => sendMessage(tool.prompt)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#121633]/70 p-3 text-left transition hover:border-purple-400/40 hover:bg-[#181d45] focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tool.iconBg}`}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{tool.name}</p>
                      <p className="text-[11px] text-slate-400">{tool.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Recent Conversations Card */}
        <section className="rounded-3xl border border-white/10 bg-[#090d21]/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h2 className="font-['Outfit',sans-serif] text-sm font-semibold text-white">
                Recent Conversations
              </h2>
            </div>
            <button
              type="button"
              className="text-[11px] font-medium text-indigo-300 hover:text-indigo-200"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {threads.slice(0, 3).map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => selectThread(thread)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-purple-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/15 text-purple-300">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {thread.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{thread.updatedAtLabel}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
};
export default AIPanel;

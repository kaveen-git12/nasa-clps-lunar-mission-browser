// frontend/src/features/ai/LocalAIModelStatus.tsx
import React from "react";
import {
  Activity,
  Bot,
  Clock,
  Cpu,
  HardDrive,
  Layers,
  RefreshCw,
} from "lucide-react";
import { useAIHealth } from "./useAIHealth";

export const LocalAIModelStatus: React.FC = () => {
  const {
    health,
    loading,
    isOffline,
    aiEnabledByUser,
    setAiEnabledByUser,
    refreshHealth,
  } = useAIHealth();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshHealth();
    setTimeout(() => setRefreshing(false), 500);
  };

  const modelName = health?.model
    ? health.model.includes("qwen3")
      ? "Qwen3 4B (4-bit)"
      : health.model
    : "Qwen3 4B (4-bit)";

  const statusLabel = !aiEnabledByUser
    ? "Disabled"
    : loading
    ? "Checking..."
    : !isOffline
    ? "Connected"
    : "Offline";

  return (
    <section className="relative rounded-[28px] border border-white/20 bg-gradient-to-br from-slate-900/80 via-slate-950/60 to-indigo-950/40 p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(124,58,237,0.15),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(255,255,255,0.08)] overflow-hidden">
      {/* Specular Edge Caustics & Ambient Glows */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-0 w-28 h-[2px] bg-gradient-to-r from-cyan-300 via-purple-400 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-36 h-[2px] bg-gradient-to-r from-purple-400 via-indigo-500 to-transparent" />

      {/* Card Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-5">
          {/* Glass Squircle AI Bot Icon */}
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-b from-white/20 via-white/5 to-white/0 border border-white/30 shadow-[0_0_24px_rgba(139,92,246,0.45),0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-md">
            <Bot className="w-8 h-8 text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
          </div>

          {/* Header Text */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-slate-300/80 uppercase">
              LOCAL INTELLIGENCE
            </p>
            <h2 className="text-2xl md:text-[26px] font-bold text-white tracking-tight mt-0.5">
              Local AI Model Status
            </h2>
            <p className="text-xs md:text-sm text-slate-300/85 leading-relaxed mt-1 max-w-xl">
              Monitor local Qwen3 4B runtime, Ollama service health, and configure AI copilot availability.
            </p>
          </div>
        </div>

        {/* Status Pill & Enable AI Toggle */}
        <div className="flex items-center gap-4 shrink-0 self-start sm:self-center">
          {/* Dynamic Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border ${
                !aiEnabledByUser
                  ? "border-slate-500/40 bg-slate-800/60 text-slate-300"
                  : !isOffline
                  ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                  : "border-rose-400/40 bg-rose-500/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  !aiEnabledByUser
                    ? "bg-slate-400"
                    : !isOffline
                    ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                    : "bg-rose-400"
                }`}
              />
              {statusLabel}
            </span>

            {/* Refresh Health Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              title="Refresh AI health status"
              aria-label="Refresh AI health status"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin text-cyan-300" : ""}`}
              />
            </button>
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={aiEnabledByUser}
              aria-label="Toggle Enable AI Assistant"
              onClick={() => setAiEnabledByUser(!aiEnabledByUser)}
              className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                aiEnabledByUser
                  ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 border border-purple-400/80 shadow-[0_0_22px_rgba(168,85,247,0.7),inset_0_0_8px_rgba(192,132,252,0.4)]"
                  : "bg-slate-800/90 border border-slate-700/80 shadow-none"
              }`}
            >
              <span
                className={`pointer-events-none block h-7 w-7 transform rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.4)] ring-0 transition duration-300 ease-in-out ${
                  aiEnabledByUser ? "translate-x-7 bg-white" : "translate-x-0 bg-slate-400"
                }`}
              />
            </button>
            <span
              className={`text-[11px] font-bold tracking-[0.2em] transition-colors duration-200 ${
                aiEnabledByUser ? "text-slate-200" : "text-slate-500"
              }`}
            >
              {aiEnabledByUser ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Card Bottom: 5 Model Details */}
      <div className="relative z-10 pt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Detail 1: Connection Status */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md flex flex-col justify-between shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Status</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{statusLabel}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {!aiEnabledByUser
                  ? "Assistant disabled"
                  : !isOffline
                  ? "Endpoint reachable"
                  : "Check local service"}
              </p>
            </div>
          </div>

          {/* Detail 2: Model */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md flex flex-col justify-between shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Model</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{modelName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Local 4-bit quantized</p>
            </div>
          </div>

          {/* Detail 3: Runtime */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md flex flex-col justify-between shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Runtime</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ollama</p>
              <p className="text-[11px] text-slate-400 mt-0.5">127.0.0.1:11434</p>
            </div>
          </div>

          {/* Detail 4: Context Tokens */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md flex flex-col justify-between shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Context</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">4096 tokens</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Balanced VRAM allocation</p>
            </div>
          </div>

          {/* Detail 5: Hardware */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md flex flex-col justify-between shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider">Hardware</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">RTX 5050</p>
              <p className="text-[11px] text-slate-400 mt-0.5">8 GB Dedicated VRAM</p>
            </div>
          </div>
        </div>

        {/* Offline Diagnostic Hint banner if service is down */}
        {isOffline && aiEnabledByUser && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
              <p>
                {health?.hint ||
                  "Ensure Ollama is running on 127.0.0.1:11434 and execute 'ollama run qwen3:4b' in terminal."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-3 py-1 rounded-lg border border-rose-400/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30 transition-all font-medium text-xs shrink-0"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
export default LocalAIModelStatus;

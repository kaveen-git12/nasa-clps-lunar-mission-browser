// frontend/src/features/ai/SourceChips.tsx
import React from "react";
import type { SourceItem } from "./types";

interface SourceChipsProps {
  sources?: SourceItem[];
  warnings?: string[];
  onSelectSite?: (siteId: string) => void;
  onSelectMission?: (missionId: string) => void;
}

export const SourceChips: React.FC<SourceChipsProps> = ({
  sources = [],
  warnings = [],
  onSelectSite,
  onSelectMission,
}) => {
  const hasCalculation = sources.some((s) => s.type === "calculation");

  if (sources.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {hasCalculation && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Calculated by backend
          </span>
        )}

        {sources.map((src, idx) => {
          if (src.type === "site" && src.id) {
            const clickable = Boolean(onSelectSite);
            return clickable ? (
              <button
                key={`site-${src.id}-${idx}`}
                type="button"
                onClick={() => onSelectSite?.(src.id!)}
                className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/15 px-2.5 py-0.5 text-purple-200 transition hover:bg-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <span>Site: {src.id}</span>
              </button>
            ) : (
              <span
                key={`site-${src.id}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-slate-300"
              >
                Site: {src.id}
              </span>
            );
          }

          if (src.type === "mission" && src.id) {
            const clickable = Boolean(onSelectMission);
            return clickable ? (
              <button
                key={`mission-${src.id}-${idx}`}
                type="button"
                onClick={() => onSelectMission?.(src.id!)}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-2.5 py-0.5 text-indigo-200 transition hover:bg-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <span>Mission: {src.id}</span>
              </button>
            ) : (
              <span
                key={`mission-${src.id}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-slate-300"
              >
                Mission: {src.id}
              </span>
            );
          }

          if (src.type === "calculation") {
            return (
              <span
                key={`calc-${src.tool}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-cyan-200"
              >
                Tool: {src.tool} ({src.method_version || "v1"})
              </span>
            );
          }
          return null;
        })}
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-200">
          {warnings.map((warn, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-amber-400">
                ⚠
              </span>
              <span>{warn}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

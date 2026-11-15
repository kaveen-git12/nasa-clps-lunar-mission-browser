import { useState } from "react";
import {
  Settings,
  ChevronDown,
  ChevronRight,
  Globe,
  Mountain,
  Sun,
  Route,
  Radio,
  ExternalLink,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { CALCULATION_EXPLANATIONS } from "@/lib/scientific/calculation-explanations";
import type { CalculationDetails } from "@/lib/scientific/types";

export function HowItCalculates() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIcon = (name: CalculationDetails["iconName"]) => {
    switch (name) {
      case "orbit":
        return <Compass className="h-4 w-4 text-purple-400" />;
      case "globe":
        return <Globe className="h-4 w-4 text-cyan-400" />;
      case "mountain":
        return <Mountain className="h-4 w-4 text-emerald-400" />;
      case "sun":
        return <Sun className="h-4 w-4 text-amber-400" />;
      case "route":
        return <Route className="h-4 w-4 text-indigo-400" />;
      case "radio":
        return <Radio className="h-4 w-4 text-purple-400" />;
      default:
        return <Globe className="h-4 w-4 text-cyan-400" />;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl transition-all">
      <div className="flex items-center gap-2.5 font-semibold text-foreground text-sm mb-3">
        <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
          <Settings className="h-4 w-4 text-indigo-400" />
        </div>
        <span className="tracking-wide">How It Calculates</span>
      </div>

      <div className="space-y-2">
        {CALCULATION_EXPLANATIONS.map((calc) => {
          const isExpanded = expandedId === calc.id;
          return (
            <div
              key={calc.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? "border-cyan-500/40 bg-white/[0.06]"
                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              }`}
            >
              {/* Row Header */}
              <button
                onClick={() => toggleExpand(calc.id)}
                className="w-full flex items-center justify-between p-3 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {getIcon(calc.iconName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground group-hover:text-cyan-300 transition-colors">
                      {calc.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {calc.subtitle}
                    </div>
                  </div>
                </div>

                <div className="text-muted-foreground group-hover:text-foreground shrink-0 ml-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Expanded Scientific Breakdown */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs border-t border-white/10 space-y-2.5">
                  <p className="text-secondary-foreground leading-relaxed text-[11px]">
                    {calc.explanationText}
                  </p>

                  {/* Formula Box */}
                  <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/30 font-mono text-[10px] sm:text-[11px] text-cyan-300 whitespace-pre-line shadow-inner">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1 font-sans">
                      Mathematical Formulation:
                    </div>
                    {calc.formula}
                  </div>

                  {/* Calculation Method */}
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[11px]">
                    <span className="font-semibold text-foreground text-[10px] uppercase tracking-wider block mb-0.5">
                      Calculation Method:
                    </span>
                    <p className="text-muted-foreground leading-normal">{calc.calculationMethod}</p>
                  </div>

                  {/* Data Input & Output Grid */}
                  <div className="grid grid-cols-1 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
                      <div className="font-semibold text-foreground mb-1 text-[10px] uppercase tracking-wider">
                        Inputs:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-muted-foreground text-[10px]">
                        {calc.inputData.map((inp, idx) => (
                          <li key={idx} className="truncate">{inp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
                      <div className="font-semibold text-foreground mb-1 text-[10px] uppercase tracking-wider">
                        Output & Units:
                      </div>
                      <div className="text-secondary-foreground text-[10px]">{calc.outputDescription}</div>
                      <div className="mt-1 font-mono text-cyan-400 text-[10px]">{calc.units}</div>
                    </div>
                  </div>

                  {/* Data Source & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[10px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[200px]">
                      <ExternalLink className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{calc.dataSource}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>{calc.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

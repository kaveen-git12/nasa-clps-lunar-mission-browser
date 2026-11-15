import { Crosshair, Check } from "lucide-react";

export function WhatItDoes() {
  const capabilities = [
    "Renders a high-resolution, interactive 3D Moon",
    "Plots CLPS mission landers & landing sites",
    "Simulates lighting, shadows, and surface terrain",
    "Visualizes route planning to the South Pole",
    "Helps analyze site feasibility (slope, lighting, visibility)",
  ];

  return (
    <div className="glass rounded-2xl p-5 backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl transition-all">
      <div className="flex items-center gap-2.5 font-semibold text-foreground text-sm mb-3">
        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
          <Crosshair className="h-4 w-4 text-cyan-400" />
        </div>
        <span className="tracking-wide">What It Does</span>
      </div>

      <ul className="space-y-2 text-xs">
        {capabilities.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-secondary-foreground leading-snug">
            <span className="h-4 w-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

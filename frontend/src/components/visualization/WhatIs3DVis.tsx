import { Box } from "lucide-react";

export function WhatIs3DVis() {
  return (
    <div className="glass rounded-2xl p-5 backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl transition-all">
      <div className="flex items-center gap-2.5 font-semibold text-foreground text-sm mb-2.5">
        <div className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
          <Box className="h-4 w-4 text-purple-400" />
        </div>
        <span className="tracking-wide">What is 3D Visualization?</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        An interactive, physics-based 3D model of the Moon that visualizes CLPS missions,
        landing sites, terrain, illumination, and planned routes to the South Pole.
      </p>
    </div>
  );
}

import { Mountain, Sun, Radio, Route, Check } from "lucide-react";
import type { SiteAnalysis } from "@/lib/scientific/types";

interface Props {
  analysis: SiteAnalysis | null;
}

export function LiveMetrics({ analysis }: Props) {
  const slopeDeg = analysis ? `${analysis.site.terrainSlopeDeg.toFixed(1)}°` : "3.2°";
  const slopeHazard = analysis ? analysis.site.slopeHazard : "Suitable";

  const sunlightHours = analysis ? `${analysis.sunlightNext24hHours.toFixed(1)} h` : "18.6 h";
  const illuminationStatus =
    analysis && analysis.isPermanentShadowRegion
      ? "PSR Shadow"
      : analysis && analysis.sunlightNext24hHours > 16
      ? "High Illumination"
      : "Nominal Flux";

  const earthVisibility = analysis ? `${analysis.earthVisibilityPercent}%` : "96%";
  const commQuality = analysis ? analysis.commLinkQuality : "Strong Link";

  const routeDistance = analysis ? `${analysis.distanceToSouthPoleKm.toFixed(1)} km` : "14.8 km";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {/* 1. Terrain Slope */}
      <div className="glass rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl hover:border-cyan-400/40 transition-all">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
          <Mountain className="h-4 w-4 text-purple-400" />
          <span>Terrain Slope</span>
        </div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight my-0.5">
          {slopeDeg}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Check className="h-3 w-3 stroke-[2.5]" />
          <span>{slopeHazard}</span>
        </div>
      </div>

      {/* 2. Sunlight (Next 24h) */}
      <div className="glass rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl hover:border-cyan-400/40 transition-all">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
          <Sun className="h-4 w-4 text-cyan-400" />
          <span>Sunlight (Next 24h)</span>
        </div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight my-0.5">
          {sunlightHours}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Check className="h-3 w-3 stroke-[2.5]" />
          <span>{illuminationStatus}</span>
        </div>
      </div>

      {/* 3. Earth Visibility */}
      <div className="glass rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl hover:border-cyan-400/40 transition-all">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
          <Radio className="h-4 w-4 text-purple-400" />
          <span>Earth Visibility</span>
        </div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight my-0.5">
          {earthVisibility}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Check className="h-3 w-3 stroke-[2.5]" />
          <span>{commQuality}</span>
        </div>
      </div>

      {/* 4. Route Distance */}
      <div className="glass rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl hover:border-cyan-400/40 transition-all">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
          <Route className="h-4 w-4 text-indigo-400" />
          <span>Route Distance</span>
        </div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight my-0.5">
          {routeDistance}
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          (to South Pole)
        </div>
      </div>
    </div>
  );
}

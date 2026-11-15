import {
  MapPin,
  Compass,
  Mountain,
  Sun,
  Radio,
  Route,
  Globe2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import type { SiteAnalysis, CelestialState } from "@/lib/scientific/types";

interface Props {
  analysis: SiteAnalysis | null;
  selectedBody: "moon" | "earth" | "sun" | null;
  celestialState: CelestialState;
  onClose?: () => void;
}

export function SiteInspector({
  analysis,
  selectedBody,
  celestialState,
  onClose,
}: Props) {
  // If Celestial Body is selected (Earth, Sun, Moon)
  if (selectedBody) {
    return (
      <div className="glass rounded-2xl p-4 sm:p-5 backdrop-blur-xl border border-cyan-400/40 bg-black/60 shadow-xl transition-all">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Globe2 className="h-4 w-4" />
            <span>
              {selectedBody === "earth"
                ? "Celestial Body: Earth"
                : selectedBody === "sun"
                ? "Celestial Body: Sun"
                : "Lunar System Datum"}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="h-6 w-6 rounded-md hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selectedBody === "earth" && (
          <div className="space-y-2 text-xs">
            <p className="text-secondary-foreground text-[11px] leading-relaxed">
              Primary ground telemetry anchor for NASA Deep Space Network (DSN) complexes in Goldstone, Madrid, and Canberra.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-muted-foreground block text-[10px] uppercase">Distance to Moon:</span>
                <span className="text-cyan-300 font-bold text-xs">
                  {celestialState.earthMoonDistanceKm.toLocaleString()} km
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-muted-foreground block text-[10px] uppercase">Libration (Lat/Lon):</span>
                <span className="text-purple-300 font-bold text-xs">
                  {celestialState.subEarthLatitudeDeg}° / {celestialState.subEarthLongitudeDeg}°
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 col-span-2">
                <span className="text-muted-foreground block text-[10px] uppercase">Position Vector (Inertial):</span>
                <span className="text-muted-foreground text-[10px]">
                  [{celestialState.earthDirectionNormalized.map((v) => v.toFixed(3)).join(", ")}]
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedBody === "sun" && (
          <div className="space-y-2 text-xs">
            <p className="text-secondary-foreground text-[11px] leading-relaxed">
              Solar flux engine providing direct photovoltaic power and casting long shadows across south polar crater rims.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-muted-foreground block text-[10px] uppercase">Heliocentric Distance:</span>
                <span className="text-amber-300 font-bold text-xs">
                  {(celestialState.sunMoonDistanceKm / 1e6).toFixed(2)} M km (1.00 AU)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-muted-foreground block text-[10px] uppercase">Sub-Solar Point:</span>
                <span className="text-amber-300 font-bold text-xs">
                  Lat {celestialState.subSolarLatitudeDeg}° / Lon {celestialState.subSolarLongitudeDeg}°
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 col-span-2">
                <span className="text-muted-foreground block text-[10px] uppercase">Lunar Phase Illumination:</span>
                <span className="text-cyan-300 font-bold text-xs">
                  {celestialState.illuminationPercentage}% (Phase Angle: {celestialState.lunarPhaseAngleDeg}°)
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedBody === "moon" && (
          <div className="space-y-2 text-xs">
            <p className="text-secondary-foreground text-[11px] leading-relaxed">
              IAU/IAG WGCCN Triaxial Ellipsoid Reference. Mean volumetric radius: 1,737.4 km.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-muted-foreground block text-[10px] uppercase">Volumetric Radius:</span>
                <span className="text-cyan-300 font-bold text-xs">1,737.4 km</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-muted-foreground block text-[10px] uppercase">Axial Obliquity:</span>
                <span className="text-cyan-300 font-bold text-xs">1.542° to Ecliptic</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If no site analysis is available
  if (!analysis) {
    return (
      <div className="glass rounded-2xl p-4 sm:p-5 backdrop-blur-xl border border-white/15 bg-black/40 shadow-xl transition-all">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <AlertCircle className="h-4 w-4 text-cyan-400" />
          <span>Select any mission or landing marker to inspect real-time scientific telemetry.</span>
        </div>
      </div>
    );
  }

  const { site } = analysis;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 backdrop-blur-xl border border-purple-500/40 bg-black/60 shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm truncate pr-2">
          <MapPin className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="truncate">{site.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-purple-400/30 bg-purple-500/10 text-purple-300">
            {site.status.toUpperCase()}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="h-5 w-5 rounded-md hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Mission Details */}
      <div className="space-y-2.5 text-xs">
        <div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Mission Name</span>
            <span className="text-sm font-bold text-foreground">{site.missionName || "Data unavailable"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">Lander Name</span>
              <span className="font-semibold text-cyan-300 text-xs">{site.landerName || "Data unavailable"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">Landing Site</span>
              <span className="font-semibold text-indigo-300 text-xs truncate block">{site.landingSiteName || "Data unavailable"}</span>
            </div>
          </div>
        </div>

        {/* Scientific Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          {/* Coordinates */}
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1 text-muted-foreground text-[9px] uppercase tracking-wider mb-1">
              <Compass className="h-3 w-3 text-cyan-400" />
              <span>Coordinates</span>
            </div>
            <div className="font-bold text-foreground text-xs">
              {Math.abs(site.latitudeDeg).toFixed(2)}° {site.latitudeDeg < 0 ? "S" : "N"}
            </div>
            <div className="text-muted-foreground text-[10px]">
              {Math.abs(site.longitudeDeg).toFixed(2)}° {site.longitudeDeg < 0 ? "W" : "E"}
            </div>
          </div>

          {/* Elevation */}
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1 text-muted-foreground text-[9px] uppercase tracking-wider mb-1">
              <Mountain className="h-3 w-3 text-emerald-400" />
              <span>LOLA Elevation</span>
            </div>
            <div className="font-bold text-foreground text-xs">
              {site.elevationMeters !== undefined ? `${site.elevationMeters > 0 ? "+" : ""}${site.elevationMeters} m` : "Data unavailable"}
            </div>
            <div className="text-emerald-400 text-[10px]">
              Datum: 1,737.4 km
            </div>
          </div>

          {/* Terrain Slope */}
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1 text-muted-foreground text-[9px] uppercase tracking-wider mb-1">
              <Mountain className="h-3 w-3 text-purple-400" />
              <span>Terrain Slope</span>
            </div>
            <div className="font-bold text-foreground text-xs">
              {site.terrainSlopeDeg !== undefined ? `${site.terrainSlopeDeg.toFixed(1)}°` : "Data unavailable"}
            </div>
            <div className="text-emerald-400 text-[10px]">
              ✓ {site.slopeHazard || "Suitable"}
            </div>
          </div>

          {/* Solar Incidence */}
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
            <div className="flex items-center gap-1 text-muted-foreground text-[9px] uppercase tracking-wider mb-1">
              <Sun className="h-3 w-3 text-amber-400" />
              <span>Solar Incidence (θ)</span>
            </div>
            <div className="font-bold text-foreground text-xs">
              {analysis.solarIncidenceAngleDeg !== undefined ? `${analysis.solarIncidenceAngleDeg}°` : "Data unavailable"}
            </div>
            <div className="text-amber-400 text-[10px]">
              {analysis.isSunlit ? `${analysis.sunlightNext24hHours}h Sun` : "Shadow / PSR"}
            </div>
          </div>

          {/* Earth Visibility */}
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 col-span-2 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground text-[9px] uppercase tracking-wider mb-0.5">
                <Radio className="h-3 w-3 text-cyan-400" />
                <span>Earth Visibility & Link</span>
              </div>
              <div className="font-bold text-foreground text-xs">
                {analysis.earthVisibilityPercent}% Contact Window
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
                <CheckCircle className="h-3 w-3" />
                <span>{analysis.commLinkQuality}</span>
              </div>
              <div className="text-[9px] text-muted-foreground font-mono">
                Elev: {analysis.earthElevationAngleDeg}°
              </div>
            </div>
          </div>
        </div>

        {/* Route to South Pole */}
        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-3.5 w-3.5 text-indigo-400" />
            <div>
              <div className="font-semibold text-foreground text-[11px]">Traverse to South Pole</div>
              <div className="text-[9px] text-muted-foreground">Geodesic A* corridor</div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="font-bold text-cyan-300 text-xs">
              {analysis.distanceToSouthPoleKm.toFixed(1)} km
            </div>
            <div className="text-[10px] text-emerald-400">
              {analysis.routeFeasibility}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

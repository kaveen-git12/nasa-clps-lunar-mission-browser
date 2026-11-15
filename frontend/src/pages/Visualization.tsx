import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { Box } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type {
  CelestialState,
  LunarLocation,
  SiteAnalysis,
  VisualizationLayerState,
} from "@/lib/scientific/types";
import { calculateCelestialState } from "@/lib/scientific/ephemeris";
import { calculateSolarIllumination } from "@/lib/scientific/illumination";
import { calculateEarthVisibility } from "@/lib/scientific/visibility";
import { calculateRouteToSouthPole } from "@/lib/scientific/route-optimization";
import { LUNAR_LANDING_SITES } from "@/lib/scientific/dem-terrain";
import type { LunarScene3DRef } from "@/components/visualization/LunarScene3D";
import { VisualizationLayers } from "@/components/visualization/VisualizationLayers";
import { ViewControls } from "@/components/visualization/ViewControls";
import { SimulationTimeline } from "@/components/visualization/SimulationTimeline";
import { LiveMetrics } from "@/components/visualization/LiveMetrics";
import { SouthPoleWatermark } from "@/components/visualization/SouthPoleWatermark";
import { WhatIs3DVis } from "@/components/visualization/WhatIs3DVis";
import { WhatItDoes } from "@/components/visualization/WhatItDoes";
import { HowItCalculates } from "@/components/visualization/HowItCalculates";
import { SiteInspector } from "@/components/visualization/SiteInspector";
import { VisualizationLoader } from "@/components/visualization/VisualizationLoader";

const LunarScene3D = lazy(() =>
  import("@/components/visualization/LunarScene3D").then((m) => ({ default: m.LunarScene3D }))
);

// 28 Earth days in milliseconds for the timeline scrubber range
const LUNAR_CYCLE_MS = 28 * 24 * 3600 * 1000;

export default function Visualization() {
  const sceneRef = useRef<LunarScene3DRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time & Simulation State
  const [baseTimestamp] = useState(() => Date.now());
  const [timelineValue, setTimelineValue] = useState(50); // 0 to 100 (50 = base present)
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer Visibility State
  const [layers, setLayers] = useState<VisualizationLayerState>({
    missionsAndLanders: true,
    landingSites: true,
    terrainDEM: true,
    illuminationSun: true,
    communication: false,
  });

  // Selected Target: defaults to CLPS-2 (Mons Mouton) to display verified reference telemetry
  const [selectedSite, setSelectedSite] = useState<LunarLocation | null>(() => {
    return LUNAR_LANDING_SITES.find((s) => s.id === "clps-2") || LUNAR_LANDING_SITES[0];
  });
  const [selectedBody, setSelectedBody] = useState<"moon" | "earth" | "sun" | null>(null);

  // Current simulation timestamp derived from timeline scrubber
  const currentTimestamp = useMemo(() => {
    const offsetMs = ((timelineValue - 50) / 50) * (LUNAR_CYCLE_MS / 2);
    return baseTimestamp + offsetMs;
  }, [baseTimestamp, timelineValue]);

  // High-accuracy celestial ephemeris state
  const celestialState: CelestialState = useMemo(() => {
    return calculateCelestialState(currentTimestamp);
  }, [currentTimestamp]);

  // Derived site analysis for the selected landing location
  const siteAnalysis: SiteAnalysis | null = useMemo(() => {
    if (!selectedSite) return null;

    const illum = calculateSolarIllumination(selectedSite, celestialState);
    const vis = calculateEarthVisibility(selectedSite, celestialState);
    const route = calculateRouteToSouthPole(selectedSite);

    return {
      site: selectedSite,
      solarIncidenceAngleDeg: illum.solarIncidenceAngleDeg,
      solarElevationAngleDeg: illum.solarElevationAngleDeg,
      isSunlit: illum.isSunlit,
      sunlightNext24hHours: illum.sunlightNext24hHours,
      isPermanentShadowRegion: illum.isPermanentShadowRegion,
      isPeakOfEternalLight: illum.isPeakOfEternalLight,
      earthElevationAngleDeg: vis.earthElevationAngleDeg,
      hasDirectEarthVisibility: vis.hasDirectEarthVisibility,
      earthVisibilityPercent: vis.earthVisibilityPercent,
      commLinkQuality: vis.commLinkQuality,
      distanceToSouthPoleKm: route.totalDistanceKm,
      routeFeasibility: route.feasibility,
    };
  }, [selectedSite, celestialState]);

  // Animation Loop for Simulation Timeline Playback with Speed Multiplier
  useEffect(() => {
    if (!isPlaying) return;

    const step = 0.12 * simSpeed;
    const interval = setInterval(() => {
      setTimelineValue((prev) => {
        if (prev >= 100) return 0;
        return Math.min(100, prev + step);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Fullscreen Handler
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-8 min-w-0">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <Box className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              3D Visualization
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Explore NASA CLPS missions in an interactive 3D lunar environment
            </p>
          </div>
        </div>

        {/* 3-REGION WORKSPACE LAYOUT (Left Controls, Center 3D Moon & Timeline, Right Inspector & Explanations) */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_360px] 2xl:grid-cols-[250px_1fr_380px] gap-4 min-w-0 items-start">
          {/* REGION 1 - LEFT: Visualization Layers & View Controls */}
          <div className="flex flex-col gap-4 w-full">
            <VisualizationLayers layers={layers} onChange={setLayers} />
            <ViewControls onResetView={() => sceneRef.current?.resetView()} />
          </div>

          {/* REGION 2 - CENTER: Main Interactive 3D Celestial Environment + Simulation Timeline */}
          <div className="flex flex-col gap-3 min-w-0 w-full">
            {/* 3D Scene Viewport Container */}
            <div
              ref={containerRef}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl transition-all ${
                isFullscreen
                  ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-none"
                  : "h-[560px] sm:h-[600px] xl:h-[620px] w-full"
              }`}
            >
              {/* Three.js Canvas */}
              <div className="absolute inset-0 z-0">
                <Suspense fallback={<VisualizationLoader />}>
                  <LunarScene3D
                    ref={sceneRef}
                    celestialState={celestialState}
                    layers={layers}
                    selectedSite={selectedSite}
                    onSelectSite={(site) => {
                      setSelectedSite(site);
                      if (site) {
                        sceneRef.current?.focusOnSite(site);
                      }
                    }}
                    onSelectBody={(body) => setSelectedBody(body)}
                  />
                </Suspense>
              </div>

              {/* Watermark in bottom-left of the 3D scene */}
              <div className="relative z-10 p-4 mt-auto pointer-events-none">
                <SouthPoleWatermark />
              </div>

              {/* In Fullscreen mode: floating timeline at bottom */}
              {isFullscreen && (
                <div className="relative z-20 p-4 w-full max-w-2xl mx-auto pointer-events-auto">
                  <SimulationTimeline
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    timelineValue={timelineValue}
                    onChangeTimeline={(val) => setTimelineValue(val)}
                    currentUtcDateString={celestialState.utcDateString}
                    onResetTime={() => setTimelineValue(50)}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    simSpeed={simSpeed}
                    onChangeSpeed={setSimSpeed}
                  />
                </div>
              )}
            </div>

            {/* Standard Mode: Docked Simulation Timeline right below the 3D Viewport */}
            {!isFullscreen && (
              <SimulationTimeline
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                timelineValue={timelineValue}
                onChangeTimeline={(val) => setTimelineValue(val)}
                currentUtcDateString={celestialState.utcDateString}
                onResetTime={() => setTimelineValue(50)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                simSpeed={simSpeed}
                onChangeSpeed={setSimSpeed}
              />
            )}
          </div>

          {/* REGION 3 - RIGHT: Mission Inspector, What Is, What It Does, How It Calculates */}
          <div className="flex flex-col gap-4 w-full lg:col-span-2 xl:col-span-1 max-h-[720px] xl:overflow-y-auto pr-1">
            {/* 1. Persistent Mission Details Inspector */}
            <SiteInspector
              analysis={siteAnalysis}
              selectedBody={selectedBody}
              celestialState={celestialState}
              onClose={() => {
                setSelectedBody(null);
              }}
            />

            {/* 2. What is 3D Visualization? */}
            <WhatIs3DVis />

            {/* 3. What It Does */}
            <WhatItDoes />

            {/* 4. How It Calculates */}
            <HowItCalculates />
          </div>
        </div>

        {/* BOTTOM METRICS ROW: Live Scientific Telemetry Cards */}
        <div className="w-full pt-1">
          <LiveMetrics analysis={siteAnalysis} />
        </div>
      </div>
    </AppShell>
  );
}

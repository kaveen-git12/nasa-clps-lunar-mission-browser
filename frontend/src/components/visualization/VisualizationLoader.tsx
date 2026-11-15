import { Loader2 } from "lucide-react";

export function VisualizationLoader() {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="h-20 w-20 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <div className="absolute h-14 w-14 rounded-full border-2 border-purple-500/30 border-b-purple-400 animate-spin [animation-direction:reverse]" />
        <Loader2 className="h-6 w-6 text-cyan-300 animate-pulse" />
      </div>

      <div className="mt-4 flex flex-col items-center text-center">
        <div className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
          Calibrating Lunar Ephemeris
        </div>
        <div className="font-mono text-[11px] text-muted-foreground mt-1">
          Loading LOLA DEM Topography & SPICE Orbital Telemetry...
        </div>
      </div>
    </div>
  );
}

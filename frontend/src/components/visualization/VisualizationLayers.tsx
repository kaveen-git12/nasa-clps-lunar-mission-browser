import { Layers, Crosshair, Mountain, Sun, Radio, Rocket } from "lucide-react";
import type { VisualizationLayerState } from "@/lib/scientific/types";

interface Props {
  layers: VisualizationLayerState;
  onChange: (updated: VisualizationLayerState) => void;
}

export function VisualizationLayers({ layers, onChange }: Props) {
  const toggle = (key: keyof VisualizationLayerState) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    });
  };

  return (
    <div className="glass rounded-2xl p-4 w-full backdrop-blur-xl border border-white/15 bg-black/40 text-xs shadow-xl transition-all select-none">
      <div className="flex items-center gap-2 font-semibold text-foreground mb-3 text-sm tracking-wide">
        <Layers className="h-4 w-4 text-cyan-400" />
        <span>Visualization Layers</span>
      </div>

      <div className="space-y-2.5">
        {/* Missions & Landers */}
        <div
          onClick={() => toggle("missionsAndLanders")}
          className="flex items-center justify-between py-1 cursor-pointer group hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5 text-secondary-foreground group-hover:text-foreground">
            <Rocket className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-medium">Missions & Landers</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={layers.missionsAndLanders}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              layers.missionsAndLanders ? "bg-purple-600" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                layers.missionsAndLanders ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Landing Sites */}
        <div
          onClick={() => toggle("landingSites")}
          className="flex items-center justify-between py-1 cursor-pointer group hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5 text-secondary-foreground group-hover:text-foreground">
            <Crosshair className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium">Landing Sites</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={layers.landingSites}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              layers.landingSites ? "bg-purple-600" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                layers.landingSites ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Terrain (DEM) */}
        <div
          onClick={() => toggle("terrainDEM")}
          className="flex items-center justify-between py-1 cursor-pointer group hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5 text-secondary-foreground group-hover:text-foreground">
            <Mountain className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">Terrain (DEM)</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={layers.terrainDEM}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              layers.terrainDEM ? "bg-purple-600" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                layers.terrainDEM ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Illumination (Sun) */}
        <div
          onClick={() => toggle("illuminationSun")}
          className="flex items-center justify-between py-1 cursor-pointer group hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5 text-secondary-foreground group-hover:text-foreground">
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-medium">Illumination (Sun)</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={layers.illuminationSun}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              layers.illuminationSun ? "bg-purple-600" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                layers.illuminationSun ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Communication */}
        <div
          onClick={() => toggle("communication")}
          className="flex items-center justify-between py-1 cursor-pointer group hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5 text-secondary-foreground group-hover:text-foreground">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-medium">Communication</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={layers.communication}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
              layers.communication ? "bg-purple-600" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                layers.communication ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

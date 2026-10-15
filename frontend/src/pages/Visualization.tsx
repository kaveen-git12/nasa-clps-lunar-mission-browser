import { Suspense, lazy } from "react";
import { Box, Compass, Info, RotateCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const LunarScene = lazy(() =>
  import("@/components/LunarScene").then((m) => ({ default: m.LunarScene }))
);

export default function Visualization() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        <div>
          <h1 className="text-gradient-title text-3xl font-bold">3D Lunar Visualization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive high-fidelity 3D simulation of the Moon's surface topography and illumination environment.
          </p>
        </div>

        <div className="glass relative min-h-[520px] w-full overflow-hidden rounded-2xl flex flex-col justify-between p-6">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Real-time WebGL Engine
            </div>
            <div className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5 text-glow" />
              Continuous Lunar Rotation
            </div>
          </div>

          {/* 3D Scene viewport */}
          <div className="absolute inset-0 z-0">
            <Suspense
              fallback={
                <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">
                  Loading lunar elevation model…
                </div>
              }
            >
              <LunarScene />
            </Suspense>
          </div>

          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mt-auto">
            <div className="glass max-w-sm rounded-xl p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Box className="h-4 w-4 text-glow" /> Orbital Telemetry
              </div>
              <p className="text-muted-foreground">Radius: 1,737.4 km</p>
              <p className="text-muted-foreground">Axial Tilt: 1.54° to Ecliptic</p>
              <p className="text-muted-foreground">Target Zone: Shackleton & South Pole Craters</p>
            </div>

            <div className="glass flex items-center gap-2 rounded-xl p-3 text-xs text-muted-foreground">
              <Compass className="h-4 w-4 text-primary" />
              <span>Camera: Orthographic Polar Alignment</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-glow" />
              Permanent Shadowed Regions (PSRs)
            </div>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
              The Moon's slight axial tilt creates deep craters at the poles that have not seen direct sunlight in billions of years. These craters act as cold traps for volatile water ice deposits.
            </p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-violet" />
              Peaks of Eternal Light
            </div>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
              Elevated ridges like Malapert Massif and the Shackleton crater rim receive near-constant solar illumination, offering ideal locations for solar-powered lunar surface infrastructure.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import { useState } from "react";
import { Crosshair, Map, MapPin, ZoomIn, ZoomOut } from "lucide-react";
import southPole from "@/assets/south-pole.jpg";
import { AppShell } from "@/components/app-shell";

const SITES = [
  { name: "Shackleton Crater", lat: "89.9° S", lon: "0.0° E", pos: "left-[32%] top-[24%]", tone: "bg-primary", desc: "Permanently shadowed crater containing hydrogen deposits." },
  { name: "De Gerlache Crater", lat: "88.5° S", lon: "87.1° W", pos: "left-[39%] top-[54%]", tone: "bg-violet", desc: "High illumination crater rim ideal for solar arrays." },
  { name: "Malapert Massif", lat: "84.9° S", lon: "12.9° E", pos: "left-[42%] top-[72%]", tone: "bg-glow", desc: "Prime direct-to-Earth communications site with broad vistas." },
  { name: "Nobile Crater", lat: "85.2° S", lon: "53.5° E", pos: "left-[62%] top-[38%]", tone: "bg-success", desc: "Landing region for autonomous volatiles prospecting rovers." },
  { name: "Mons Mouton", lat: "84.6° S", lon: "31.7° E", pos: "left-[50%] top-[60%]", tone: "bg-amber", desc: "Plateau near the south pole with flat landing expanses." },
];

export default function LunarMap() {
  const [selectedSite, setSelectedSite] = useState(SITES[0]);
  const [zoom, setZoom] = useState(1);

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        <div>
          <h1 className="text-gradient-title text-3xl font-bold">Lunar South Pole Map</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore primary landing zones, terrain features, and permanently shadowed regions at the Moon's south pole.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="glass relative min-h-[460px] overflow-hidden rounded-2xl p-4 flex flex-col justify-between">
            <div className="relative z-10 flex items-center justify-between">
              <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <Map className="h-4 w-4 text-glow" /> South Pole Reconnaissance
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 2))}
                  aria-label="Zoom in"
                  className="glass grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
                  aria-label="Zoom out"
                  className="glass grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  aria-label="Recenter map"
                  className="glass grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"
                >
                  <Crosshair className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative h-[360px] my-3 overflow-hidden rounded-xl bg-black">
              <img
                src={southPole}
                alt="Lunar South Pole Topography"
                style={{ transform: `scale(${zoom})`, transition: "transform 0.3s ease" }}
                className="h-full w-full object-cover origin-center opacity-85"
              />

              {SITES.map((site) => (
                <button
                  key={site.name}
                  onClick={() => setSelectedSite(site)}
                  className={`glass absolute ${site.pos} -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105 ${selectedSite.name === site.name ? "ring-2 ring-glow" : ""}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-white/60 ${site.tone}`} />
                  <span className="hidden sm:inline">{site.name}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Coordinates referenced to Lunar Polar Stereographic projection (LOLA / LRO data).
            </p>
          </div>

          <div className="glass flex flex-col gap-4 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-glow">
              <MapPin className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Site Inspection</h2>
            </div>

            <div className="rounded-xl border bg-card/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedSite.name}</h3>
                <span className={`h-3 w-3 rounded-full ${selectedSite.tone}`} />
              </div>
              <p className="text-sm text-secondary-foreground">{selectedSite.desc}</p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>
                  <div className="font-semibold">{selectedSite.lat}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <div className="font-semibold">{selectedSite.lon}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">South Pole Target Sites</h3>
              <ul className="space-y-2">
                {SITES.map((site) => (
                  <li key={site.name}>
                    <button
                      onClick={() => setSelectedSite(site)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${selectedSite.name === site.name ? "bg-nav-active font-medium" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${site.tone}`} />
                        {site.name}
                      </span>
                      <span className="text-muted-foreground">{site.lat}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

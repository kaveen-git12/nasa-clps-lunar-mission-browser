import { Calendar, Clock, Compass, Plus, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/app-shell";

export default function Planner() {
  const sampleTimeline = [
    { title: "Launch Window Analysis", phase: "T-180 Days", status: "Active", tone: "bg-success/20 text-success" },
    { title: "Trans-Lunar Injection (TLI)", phase: "Transit Phase", status: "Scheduled", tone: "bg-primary/20 text-primary" },
    { title: "Lunar Orbit Insertion (LOI)", phase: "Orbit Insertion", status: "Upcoming", tone: "bg-amber/20 text-amber" },
    { title: "Autonomous South Pole Landing", phase: "Terminal Descent", status: "Planned", tone: "bg-violet/20 text-violet" },
    { title: "Surface Payload Deployment", phase: "Surface Operations", status: "Planned", tone: "bg-steel/20 text-steel" },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-gradient-title text-3xl font-bold">Mission Planner</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan operational phases, transit timelines, and lunar landing trajectories for CLPS payloads.
            </p>
          </div>
          <Link
            to="/missions/add"
            className="bg-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" /> Create Mission Plan
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 text-glow">
              <Calendar className="h-5 w-5" />
              <h3 className="font-semibold text-foreground">Launch Schedules</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">2026–2028</p>
            <p className="mt-1 text-xs text-muted-foreground">Multi-manifest CLPS flight windows coordinated with Artemis.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 text-success">
              <Clock className="h-5 w-5" />
              <h3 className="font-semibold text-foreground">Surface Operations</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">14 Earth Days</p>
            <p className="mt-1 text-xs text-muted-foreground">Average operational duration before lunar nightfall.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 text-violet">
              <Compass className="h-5 w-5" />
              <h3 className="font-semibold text-foreground">Traverse Range</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">20 km</p>
            <p className="mt-1 text-xs text-muted-foreground">Planned autonomous rover traverse in polar regions.</p>
          </div>
        </div>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="h-5 w-5 text-glow" />
            <h2 className="text-lg font-semibold">Standard Mission Flight Phases</h2>
          </div>

          <div className="relative border-l border-white/10 ml-4 space-y-8 pl-6">
            {sampleTimeline.map((item, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <div className="glass rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${item.tone}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.phase}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
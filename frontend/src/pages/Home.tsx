import { useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CircleCheck,
  Clock,
  Crosshair,
  Map,
  MapPinned,
  Rocket,
  Satellite,
  Trash2,
} from "lucide-react";
import hero from "@/assets/hero-moon.jpg";
import southPole from "@/assets/south-pole.jpg";
import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import {
  CATALOG,
  actions,
  countStats,
  missionById,
  myMissions,
  useStore,
  type Mission,
  type MissionStatus,
  type MyRow,
} from "@/lib/mission-store";
import { missionImg, statusLabel, statusTone } from "@/lib/mission-view";

type Panel =
  | { kind: "list"; title: string; filter: MissionStatus | "all" }
  | { kind: "catalog" }
  | { kind: "mission"; id: string };

function StatusControls({ id, status }: { id: string; status?: MissionStatus | undefined }) {
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {status ? (
        <>
          <select
            aria-label="Mission status"
            value={status}
            onChange={(e) => actions.setStatus(id, e.target.value as MissionStatus)}
            className="rounded-full border bg-popover px-2 py-1 text-xs"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            aria-label="Remove from collection"
            onClick={() => actions.remove(id)}
            className="grid h-7 w-7 place-items-center rounded-full bg-muted hover:bg-destructive/60"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <button
          onClick={() => actions.save(id)}
          className="flex items-center gap-1 rounded-full bg-primary/70 px-3 py-1 text-xs font-medium hover:bg-primary"
        >
          <Bookmark className="h-3.5 w-3.5" />
          Save
        </button>
      )}
    </div>
  );
}

function MissionCard({
  m,
  status,
  compact,
  onOpen,
}: {
  m: Mission;
  status?: MissionStatus | undefined;
  compact: boolean;
  onOpen: () => void;
}) {
  return (
    <article className="glass glass-hover overflow-hidden rounded-xl">
      <button onClick={onOpen} className="relative block w-full text-left">
        {!compact && <img src={missionImg(m)} alt={m.name} loading="lazy" className="h-28 w-full object-cover" />}
        {status && (
          <span
            className={`absolute left-3 top-2 flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${statusTone[status]}`}
          >
            <BookmarkCheck className="h-3 w-3" />
            {statusLabel[status]}
          </span>
        )}
      </button>
      <div className={`p-3 ${status && compact ? "pt-9" : ""}`}>
        <h3 className="font-semibold">{m.name}</h3>
        <p className="text-sm text-muted-foreground">{m.agency}</p>
        <div className="mt-2 space-y-1.5 text-xs">
          <p className="flex items-center gap-2">
            <MapPinned className="h-3.5 w-3.5" />
            {m.site}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {m.date}
          </p>
        </div>
        <div className="mt-3">
          <StatusControls id={m.id} status={status} />
        </div>
      </div>
    </article>
  );
}

function MissionRow({
  m,
  status,
  onOpen,
}: {
  m: Mission;
  status?: MissionStatus | undefined;
  onOpen: () => void;
}) {
  return (
    <li className="glass glass-hover flex flex-wrap items-center gap-3 rounded-xl p-3">
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <img src={missionImg(m)} alt="" className="h-12 w-12 rounded-lg object-cover" />
        <div className="min-w-0">
          <div className="font-medium">{m.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {m.agency} · {m.site} · {m.date}
          </div>
        </div>
      </button>
      <StatusControls id={m.id} status={status} />
    </li>
  );
}

function PanelView({ panel, setPanel }: { panel: Panel; setPanel: (p: Panel | null) => void }) {
  const s = useStore();
  const close = () => setPanel(null);
  const open = (id: string) => setPanel({ kind: "mission", id });

  if (panel.kind === "list") {
    const rows: MyRow[] = myMissions(s).filter((r) => panel.filter === "all" || r.status === panel.filter);
    return (
      <Modal title={panel.title} onClose={close}>
        {rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <p>No missions here yet.</p>
            <button
              onClick={() => setPanel({ kind: "catalog" })}
              className="bg-cta mt-4 rounded-full px-5 py-2 text-foreground font-medium"
            >
              Browse missions
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <MissionRow key={r.id} m={r.mission} status={r.status} onOpen={() => open(r.id)} />
            ))}
          </ul>
        )}
      </Modal>
    );
  }

  if (panel.kind === "catalog") {
    return (
      <Modal title="All CLPS Missions" onClose={close}>
        <ul className="space-y-2">
          {CATALOG.map((m) => (
            <MissionRow key={m.id} m={m} status={s.collection[m.id]} onOpen={() => open(m.id)} />
          ))}
        </ul>
      </Modal>
    );
  }

  const m = missionById(s, panel.id);
  if (!m) return null;
  return (
    <Modal title={m.name} onClose={close}>
      <img src={missionImg(m)} alt={m.name} className="h-48 w-full rounded-xl object-cover" />
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[
          ["Agency", m.agency],
          ["Landing site", m.site],
          ["Region", m.region],
          ["Date", m.date],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {m.objectives && <p className="mt-4 text-sm text-secondary-foreground">{m.objectives}</p>}
      <div className="mt-5">
        <StatusControls id={m.id} status={s.collection[m.id]} />
      </div>
    </Modal>
  );
}

export default function Home() {
  const s = useStore();
  const stats = countStats(s.collection);
  const [panel, setPanel] = useState<Panel | null>(null);

  const statCards = [
    { n: stats.total, label: "Total Missions", icon: Rocket, tone: "bg-primary/30", filter: "all" as const },
    { n: stats.active, label: "Active Missions", icon: Satellite, tone: "bg-success/30", filter: "active" as const },
    {
      n: stats.completed,
      label: "Completed Missions",
      icon: CircleCheck,
      tone: "bg-steel/30",
      filter: "completed" as const,
    },
    { n: stats.upcoming, label: "Upcoming Missions", icon: Clock, tone: "bg-amber/30", filter: "upcoming" as const },
  ];

  return (
    <AppShell>
      <section className="glass relative overflow-hidden rounded-2xl">
        <img
          src={hero}
          alt="The Moon above the lunar surface"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        <div className="relative grid min-h-[320px] md:grid-cols-2">
          <div className="p-8">
            <p className="text-xs tracking-[0.2em] text-muted-foreground">DEEP SPACE INTELLIGENCE • LUNAR OPERATIONS</p>
            <h1
              className="mt-3 text-4xl font-bold leading-tight md:text-5xl"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                CLPS Lunar
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Mission Browser
              </span>
            </h1>
            <p
              className="mt-5 max-w-md text-2xl leading-relaxed text-white md:text-3xl"
              style={{
                fontFamily: '"Blackadder ITC", cursive',
                textShadow: "0 0 14px rgba(255,255,255,0.18)",
              }}
            >
              Beyond Earth. Into the Unknown. Mapping Humanity’s Next Frontier.
            </p>
            <button
              onClick={() => setPanel({ kind: "catalog" })}
              className="bg-cta mt-6 inline-flex items-center gap-3 rounded-full px-8 py-3 font-medium transition-transform hover:scale-105"
            >
              Explore Missions <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="relative hidden text-xs font-semibold md:block">
            {[
              ["South Pole", "left-[12%] top-[14%]"],
              ["Landing\nSites", "left-[5%] top-[60%]"],
              ["Sunlight\nAnalysis", "right-[18%] top-[12%]"],
              ["Mission\nTrajectories", "right-[20%] bottom-[14%]"],
            ].map(([t, pos]) => (
              <span key={t} className={`absolute whitespace-pre-line ${pos} flex items-center gap-2`}>
                {t}
                <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[var(--shadow-glow)]" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map(({ n, label, icon: I, tone, filter }) => (
          <button
            key={label}
            onClick={() => setPanel({ kind: "list", title: label, filter })}
            className="glass glass-hover flex items-center gap-6 rounded-2xl p-4 text-left"
          >
            <div className={`grid h-16 w-16 place-items-center rounded-xl ${tone}`}>
              <I className="h-7 w-7 text-foreground" strokeWidth={1.6} />
            </div>
            <div>
              <div className="text-3xl font-bold">{n}</div>
              <div className="text-sm text-secondary-foreground">{label}</div>
            </div>
          </button>
        ))}
      </section>

      <section className="grid gap-4 pb-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-violet" />
            <h2 className="text-lg font-semibold">Upcoming Missions</h2>
            <button
              onClick={() => setPanel({ kind: "catalog" })}
              className="ml-auto flex items-center gap-2 text-sm text-glow"
            >
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {CATALOG.slice(0, 3).map((m) => (
              <MissionCard
                key={m.id}
                m={m}
                status={s.collection[m.id]}
                compact={s.prefs.compactCards}
                onOpen={() => setPanel({ kind: "mission", id: m.id })}
              />
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-3">
            <Map className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Lunar South Pole Map</h2>
          </div>
          <div className="relative h-[222px] overflow-hidden rounded-xl">
            <img src={southPole} alt="Lunar south pole craters" loading="lazy" className="h-full w-full object-cover" />
            {[
              ["Shackleton Crater", "left-[31%] top-[20%]", "bg-primary"],
              ["De Gerlache Crater", "left-[38%] top-[55%]", "bg-violet"],
              ["Malapert Massif", "left-[38%] top-[75%]", "bg-glow"],
            ].map(([t, pos, c]) => (
              <span
                key={t}
                className={`glass absolute ${pos} flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium`}
              >
                <span className={`h-3 w-3 rounded-full ring-2 ring-foreground/60 ${c}`} />
                {t}
              </span>
            ))}
            <button
              aria-label="Recenter"
              className="glass absolute bottom-3 left-3 grid h-11 w-11 place-items-center rounded-xl"
            >
              <Crosshair className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {panel && <PanelView panel={panel} setPanel={setPanel} />}
    </AppShell>
  );
}
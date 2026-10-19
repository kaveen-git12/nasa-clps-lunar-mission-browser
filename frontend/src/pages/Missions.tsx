import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CircleCheck,
  Clock,
  MapPinned,
  Pencil,
  Plus,
  Rocket,
  Satellite,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  EMPTY_FILTERS,
  actions,
  countStats,
  filterMissions,
  filterOptions,
  myMissions,
  useStore,
  type Filters,
  type MyRow,
} from "@/lib/mission-store";
import { missionImg, statusLabel, statusTone } from "@/lib/mission-view";

function StatCard({
  n,
  label,
  icon: I,
  tone,
  active,
  onClick,
}: {
  n: number;
  label: string;
  icon: typeof Rocket;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`glass glass-hover flex items-center gap-5 rounded-2xl p-4 text-left ${active ? "ring-2 ring-glow/70" : ""}`}
    >
      <div className={`grid h-14 w-14 place-items-center rounded-xl ${tone}`}>
        <I className="h-6 w-6 text-foreground" strokeWidth={1.6} />
      </div>
      <div>
        <div className="text-3xl font-bold">{n}</div>
        <div className="text-sm text-secondary-foreground">{label}</div>
      </div>
    </button>
  );
}

function MissionCard({ row, compact }: { row: MyRow; compact?: boolean }) {
  const { id, status, mission: m } = row;
  return (
    <article className="glass glass-hover flex flex-col overflow-hidden rounded-2xl">
      <Link to={`/missions/${id}`} className="relative block">
        {!compact && <img src={missionImg(m)} alt={m.name} loading="lazy" className="h-36 w-full object-cover" />}
        <span
          className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${statusTone[status]}`}
        >
          <BookmarkCheck className="h-3 w-3" />
          {statusLabel[status]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
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
        {m.objectives && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.objectives}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
          <Link
            to={`/missions/${id}`}
            className="bg-cta rounded-full px-4 py-1.5 text-xs font-medium"
          >
            View Details
          </Link>
          {m.custom ? (
            <>
              <Link
                to={`/missions/add?edit=${id}`}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-accent"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete ${m.name}? This cannot be undone.`)) actions.deleteMission(id);
                }}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs hover:bg-destructive/60"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </>
          ) : (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              Catalogue
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass rounded-xl bg-transparent px-3 py-2 text-sm text-foreground outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-popover text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Missions() {
  const s = useStore();
  const rows = myMissions(s);
  const stats = countStats(s.collection);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const opts = filterOptions(rows);
  const shown = filterMissions(rows, filters);
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-6">
        {s.added && (
          <div className="glass flex items-center gap-3 rounded-2xl border-success/40 px-4 py-3">
            <CircleCheck className="h-5 w-5 text-success" />
            <p className="text-sm">
              <b>Mission added successfully.</b> {s.added.name} is now in your collection.
            </p>
            <button
              aria-label="Dismiss"
              onClick={actions.dismissAdded}
              className="ml-auto grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-gradient-title text-3xl font-bold">Missions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every mission you save or create, with live counts. Nothing here is pre-filled.
            </p>
          </div>
          <Link
            to="/missions/add"
            className="bg-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" /> Add Mission
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            n={stats.total}
            label="Total Missions"
            icon={Rocket}
            tone="bg-white/10 border border-white/20"
            active={filters.status === "all"}
            onClick={() => set({ status: "all" })}
          />
          <StatCard
            n={stats.active}
            label="Active Missions"
            icon={Satellite}
            tone="bg-white/10 border border-white/20"
            active={filters.status === "active"}
            onClick={() => set({ status: "active" })}
          />
          <StatCard
            n={stats.completed}
            label="Completed Missions"
            icon={CircleCheck}
            tone="bg-white/10 border border-white/20"
            active={filters.status === "completed"}
            onClick={() => set({ status: "completed" })}
          />
          <StatCard
            n={stats.upcoming}
            label="Upcoming Missions"
            icon={Clock}
            tone="bg-white/10 border border-white/20"
            active={filters.status === "upcoming"}
            onClick={() => set({ status: "upcoming" })}
          />
        </section>

        <section className="glass rounded-2xl p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs text-muted-foreground">
              Search
              <span className="flex items-center gap-2 rounded-xl border px-3">
                <Search className="h-4 w-4" />
                <input
                  value={filters.q}
                  onChange={(e) => set({ q: e.target.value })}
                  placeholder="Search missions…"
                  aria-label="Search my missions"
                  className="w-full bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </span>
            </label>
            <Select
              label="Status"
              value={filters.status}
              onChange={(v) => set({ status: v as Filters["status"] })}
              options={[
                { value: "all", label: "All statuses" },
                { value: "upcoming", label: "Upcoming" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
              ]}
            />
            <Select
              label="Provider"
              value={filters.provider}
              onChange={(v) => set({ provider: v })}
              options={[{ value: "all", label: "All providers" }, ...opts.providers.map((p) => ({ value: p, label: p }))]}
            />
            <Select
              label="Landing site"
              value={filters.site}
              onChange={(v) => set({ site: v })}
              options={[{ value: "all", label: "All sites" }, ...opts.sites.map((p) => ({ value: p, label: p }))]}
            />
            <Select
              label="Year"
              value={filters.year}
              onChange={(v) => set({ year: v })}
              options={[{ value: "all", label: "All years" }, ...opts.years.map((p) => ({ value: p, label: p }))]}
            />
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              disabled={!dirty}
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-40"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {rows.length === 0 ? (
          <Link
            to="/missions/add"
            className="glass glass-hover flex flex-col items-center gap-4 rounded-3xl border-dashed px-6 py-16 text-center"
          >
            <span className="bg-cta grid h-16 w-16 place-items-center rounded-2xl">
              <Plus className="h-8 w-8" strokeWidth={1.6} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">No missions yet</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Add your first lunar mission — its name, provider, landing site and objectives — and it will show up here
                with live counts.
              </p>
            </div>
            <span className="bg-cta inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium transition-transform hover:scale-105">
              Add Mission <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ) : shown.length === 0 ? (
          <div className="glass rounded-3xl px-6 py-14 text-center">
            <p className="text-sm text-muted-foreground">No missions match your filters.</p>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-4 rounded-full border px-5 py-2 text-sm hover:bg-muted"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((r) => (
              <MissionCard key={r.id} row={r} compact={s.prefs.compactCards} />
            ))}
          </section>
        )}

        <p className="glass w-fit rounded-full px-4 py-2 text-xs text-muted-foreground">
          {rows.length === 0
            ? "Saved catalogue missions also count once you bookmark them."
            : `Showing ${shown.length} of ${rows.length} mission${rows.length === 1 ? "" : "s"}.`}
        </p>
      </div>
    </AppShell>
  );
}
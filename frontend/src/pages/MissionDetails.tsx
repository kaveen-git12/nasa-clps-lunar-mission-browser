import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { actions, missionById, useStore, type MissionStatus } from "@/lib/mission-store";
import { missionImg, statusLabel, statusTone } from "@/lib/mission-view";

export default function MissionDetails() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const m = id ? missionById(s, id) : undefined;
  const status = id ? s.collection[id] : undefined;

  if (!m) {
    return (
      <AppShell>
        <div className="glass rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-semibold">Mission not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been deleted, or the link is out of date.</p>
          <Link to="/missions" className="bg-cta mt-6 inline-flex rounded-full px-6 py-2 font-medium">
            Back to missions
          </Link>
        </div>
      </AppShell>
    );
  }

  const facts: [string, string][] = [
    ["Provider / Agency", m.agency],
    ["Launch", m.date],
    ["Landing site / region", m.site],
    ["Status", status ? statusLabel[status] : "Not in your collection"],
  ];
  if (m.type) facts.push(["Mission type", m.type]);
  if (m.duration) facts.push(["Mission duration", m.duration]);
  if (m.payload) facts.push(["Payload / instruments", m.payload]);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 pb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/missions"
            className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
            aria-label="Back to missions"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-gradient-title text-3xl font-bold">{m.name}</h1>
          {status && (
            <span
              className={`ml-auto flex items-center gap-1 rounded-full px-4 py-1 text-sm font-medium ${statusTone[status]}`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {statusLabel[status]}
            </span>
          )}
        </div>

        <section className="glass overflow-hidden rounded-2xl">
          <img src={missionImg(m)} alt={m.name} className="max-h-72 w-full object-cover" />
        </section>

        <section className="glass rounded-2xl p-5">
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {m.objectives && (
            <div className="mt-5">
              <h2 className="text-xs uppercase tracking-wide text-muted-foreground">Mission objectives</h2>
              <p className="mt-1 text-sm leading-relaxed text-secondary-foreground">{m.objectives}</p>
            </div>
          )}
          {(m.sourceUrl || m.referenceUrl) && (
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {m.sourceUrl && (
                <a
                  href={m.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-muted"
                >
                  Official source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {m.referenceUrl && (
                <a
                  href={m.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-muted"
                >
                  Additional reference <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </section>

        <section className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
          {status ? (
            <>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Status
                <select
                  value={status}
                  onChange={(e) => actions.setStatus(m.id, e.target.value as MissionStatus)}
                  className="rounded-xl border bg-popover px-3 py-2 text-sm text-foreground outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <button
                onClick={() => {
                  if (m.custom ? confirm(`Delete ${m.name}? This cannot be undone.`) : true) {
                    if (m.custom) actions.deleteMission(m.id);
                    else actions.remove(m.id);
                  }
                }}
                className="flex items-center gap-1 rounded-full bg-muted px-4 py-2 text-sm hover:bg-destructive/60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {m.custom ? "Delete mission" : "Remove from collection"}
              </button>
            </>
          ) : (
            <button
              onClick={() => actions.save(m.id)}
              className="bg-cta flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium"
            >
              <Bookmark className="h-4 w-4" />
              Save to my collection
            </button>
          )}
          {m.custom && (
            <Link
              to={`/missions/add?edit=${m.id}`}
              className="ml-auto flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit mission
            </Link>
          )}
        </section>
      </div>
    </AppShell>
  );
}
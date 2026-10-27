import { NavLink, useNavigate } from "react-router-dom";
import { useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  Home,
  Library,
  MapPin,
  Menu,
  RadioTower,
  Rocket,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { useOutside } from "@/hooks/use-outside";
import {
  actions,
  allMissions,
  searchMissions,
  useStore,
  type Prefs,
  type Profile,
} from "@/lib/mission-store";

const TABS = [
  { label: "Mission Planner", icon: CalendarDays, to: "/planner" },
  { label: "3D Visualization", icon: Box, to: "/visualization" },
  { label: "Lunar Map", icon: MapPin, to: "/lunar-map" },
  { label: "Resources", icon: BookOpen, to: "/resources" },
  { label: "AI Assistant", icon: Sparkles, to: "/ai" },
  { label: "Settings", icon: Settings, to: "/settings" },
] as const;

const linkBase =
  "flex items-center gap-4 rounded-xl px-4 py-3.5 text-base transition-colors";

type Panel = "profile" | "prefs" | "settings" | null;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="logo-glow-ring relative grid h-12 w-12 shrink-0 place-items-center rounded-xl">
          <img
            src="/honoured1-team.png"
            alt="Honoured1 team logo"
            className="relative z-10 h-full w-full rounded-xl object-cover"
          />
        </div>

        <div>
          <div className="text-xl font-bold tracking-wide">Honoured1</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Lunar Control
          </div>
        </div>
      </div>

      <nav className="sidebar-glass flex flex-1 flex-col rounded-2xl p-3">

        <ul className="space-y-1.5">
          <li>
            <NavLink
              to="/dashboard"
              onClick={onNavigate}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-nav-active font-medium text-foreground" : "text-secondary-foreground hover:bg-white/10"}`
              }
            >
              <Home className="h-5 w-5" strokeWidth={1.6} />
              <span className="font-['Alice']">Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/missions"
              onClick={onNavigate}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-nav-active font-medium text-foreground" : "text-secondary-foreground hover:bg-white/10"}`
              }
            >
              <Rocket className="h-5 w-5" strokeWidth={1.6} />
              <span className="font-['Alice']">Missions</span>
            </NavLink>
          </li>
          {TABS.map(({ label, icon: I, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? (to === "/ai" ? "border border-purple-500/60 bg-gradient-to-r from-purple-900/60 to-indigo-900/50 font-medium text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]" : "bg-nav-active font-medium text-foreground") : "text-secondary-foreground hover:bg-white/10"}`
                }
              >
                <I className="h-5 w-5" strokeWidth={1.6} />
                <span className="font-['Alice']">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="group relative mt-auto isolate overflow-hidden rounded-2xl border border-white/25 bg-white/[0.09] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.25),0_0_24px_rgba(34,211,238,0.10)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white/[0.14] via-white/[0.02] to-cyan-300/[0.07]" />
          <div className="pointer-events-none absolute -left-10 -top-12 h-28 w-28 rounded-full bg-cyan-300/20 blur-3xl transition-all duration-700 group-hover:bg-cyan-300/30" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl transition-all duration-700 group-hover:bg-purple-500/35" />
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-80" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08]">
              <RadioTower className="h-5 w-5 text-cyan-300" strokeWidth={1.6} />
            </div>

            <div className="min-w-0">
              <p className="font-['Alice'] text-sm tracking-wide text-cyan-200">
                Lunar Signal
              </p>
              <p className="mt-0.5 text-[9px] tracking-[0.16em] text-slate-400">
                DEEP SPACE NETWORK
              </p>
            </div>
            <span className="ml-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
          </div>

          <p className="relative mt-4 text-sm leading-relaxed text-white/90">
            The next frontier is calling.
          </p>

          <div className="relative mt-3 flex h-6 items-center justify-between gap-[3px]" aria-label="Decorative signal waveform">
            {Array.from({ length: 27 }, (_, i) => (
              <span
                key={i}
                className={`w-[3px] rounded-full ${i % 4 === 0 ? "bg-purple-400/90" : "bg-cyan-300/80"
                  }`}
                style={{
                  height: `${5 + ((i * 7 + 3) % 18)}px`,
                  animation: `signal-pulse ${0.7 + (i % 5) * 0.15}s ease-in-out ${i * 0.035}s infinite alternate`,
                }}
              />
            ))}
          </div>

          <div className="relative mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span className="text-[9px] tracking-[0.13em] text-emerald-200/90">
              SIGNAL INTERFACE READY
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-[232px] shrink-0 flex-col gap-4 lg:flex">
      <SidebarContent />
    </aside>
  );
}

function SearchBox() {
  const s = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, open, () => setOpen(false));
  const results = searchMissions(q, allMissions(s));
  const pick = (id: string) => {
    setOpen(false);
    setQ("");
    navigate(`/missions/${id}`);
  };
  return (
    <div ref={ref} className="relative w-full max-w-md">
      <label className="glass flex h-11 items-center gap-3 rounded-full px-4 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) pick(results[0].id);
          }}
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Search missions, landing sites, or ask AI..."
          aria-label="Search missions"
        />
      </label>
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border bg-popover/95 shadow-[var(--shadow-glass)] backdrop-blur-xl">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No missions match "{q}".</p>
          ) : (
            results.map((m) => (
              <button
                key={m.id}
                onClick={() => pick(m.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
              >
                <Rocket className="h-4 w-4 text-glow" />
                <div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.agency} · {m.site}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function Notifications() {
  const { notices } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, open, () => setOpen(false));
  const unread = notices.filter((n) => !n.read).length;
  return (
    <div ref={ref} className="relative">
      <button
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border bg-popover/95 shadow-[var(--shadow-glass)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <h3 className="font-semibold">Notifications</h3>
            {unread > 0 && (
              <button onClick={actions.markAllRead} className="ml-auto text-xs text-glow">
                Mark all read
              </button>
            )}
            {notices.length > 0 && (
              <button
                onClick={actions.clearNotices}
                className={`text-xs text-muted-foreground ${unread ? "" : "ml-auto"}`}
              >
                Clear
              </button>
            )}
          </div>
          {notices.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet. Activity on your missions will show up here.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notices.map((n) => (
                <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.read ? "opacity-60" : ""}`}>
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-glow"}`} />
                  <div className="flex-1">
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(n.at)}</p>
                  </div>
                  {!n.read && (
                    <button
                      aria-label="Mark as read"
                      onClick={() => actions.markRead(n.id)}
                      className="grid h-6 w-6 place-items-center rounded-full hover:bg-muted"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ onOpen }: { onOpen: (p: Panel) => void }) {
  const { profile } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, open, () => setOpen(false));
  const items = [
    { label: "Profile", icon: User, run: () => onOpen("profile") },
    { label: "Preferences", icon: SlidersHorizontal, run: () => onOpen("prefs") },
    { label: "Mission Collection", icon: Library, run: () => navigate("/missions") },
    { label: "Settings", icon: Settings, run: () => onOpen("settings") },
  ];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-muted"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-cta font-semibold">
          {profile.name.charAt(0).toUpperCase() || "?"}
        </span>
        <span className="hidden font-semibold sm:inline">{profile.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border bg-popover/95 py-2 shadow-[var(--shadow-glass)] backdrop-blur-xl"
        >
          {items.map(({ label, icon: I, run }) => (
            <button
              role="menuitem"
              key={label}
              onClick={() => {
                run();
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted"
            >
              <I className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileForm({ close }: { close: () => void }) {
  const { profile } = useStore();
  const [f, setF] = useState<Profile>(profile);
  return (
    <Modal title="Profile" onClose={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.name.trim()) return;
          actions.updateProfile({ ...f, name: f.name.trim() });
          close();
        }}
        className="space-y-3"
      >
        {(["name", "email", "role"] as const).map((k) => (
          <label key={k} className="block text-sm">
            <span className="capitalize text-muted-foreground">{k}</span>
            <input
              value={f[k]}
              required={k === "name"}
              type={k === "email" ? "email" : "text"}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
              className="mt-1 w-full rounded-xl border bg-input px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        ))}
        <button type="submit" className="bg-cta rounded-full px-6 py-2 font-medium">
          Save profile
        </button>
      </form>
    </Modal>
  );
}

function Preferences({ close }: { close: () => void }) {
  const { prefs } = useStore();
  const toggles: [keyof Prefs, string, string][] = [
    ["notifications", "Activity notifications", "Get notified when you save, add or update missions."],
    ["compactCards", "Compact mission cards", "Hide pictures on mission cards."],
  ];
  return (
    <Modal title="Preferences" onClose={close}>
      <div className="space-y-3">
        {toggles.map(([k, t, d]) => (
          <label key={k} className="glass flex cursor-pointer items-center gap-4 rounded-xl p-4">
            <div className="flex-1">
              <div className="font-medium">{t}</div>
              <div className="text-xs text-muted-foreground">{d}</div>
            </div>
            <input
              type="checkbox"
              checked={prefs[k]}
              onChange={(e) => actions.updatePrefs({ ...prefs, [k]: e.target.checked })}
              className="h-5 w-5 accent-[var(--primary)]"
            />
          </label>
        ))}
      </div>
    </Modal>
  );
}

function SettingsPanel({ close }: { close: () => void }) {
  return (
    <Modal title="Settings" onClose={close}>
      <p className="text-sm text-muted-foreground">
        Your missions, collection, notifications and preferences are saved in this browser.
      </p>
      <button
        onClick={() => {
          if (confirm("Reset all your dashboard data? This cannot be undone.")) {
            actions.resetAll();
            close();
          }
        }}
        className="mt-4 rounded-full bg-destructive px-5 py-2 text-sm font-medium"
      >
        Reset all data
      </button>
    </Modal>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="flex gap-5 p-4 lg:p-5">
        <Sidebar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 lg:overflow-hidden">
          <header className="relative z-30 flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card border lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <SearchBox />
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <Notifications />
              <ProfileMenu onOpen={setPanel} />
            </div>
          </header>
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-md">
          <div className="relative flex w-72 flex-col gap-4 bg-popover p-5 border-r shadow-2xl">
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {panel === "profile" && <ProfileForm close={() => setPanel(null)} />}
      {panel === "prefs" && <Preferences close={() => setPanel(null)} />}
      {panel === "settings" && <SettingsPanel close={() => setPanel(null)} />}
    </div>
  );
}

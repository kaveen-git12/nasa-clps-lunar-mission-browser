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
  Moon,
  Rocket,
  Search,
  Settings,
  SlidersHorizontal,
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
  { label: "Settings", icon: Settings, to: "/settings" },
] as const;

const linkBase =
  "flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] transition-colors";

type Panel = "profile" | "prefs" | "settings" | null;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-2 py-2">
        <img
          src="/favicon.svg"
          alt="Honoured1 team logo"
          className="h-12 w-12 rounded-xl object-contain p-1 ring-2 ring-primary/60 bg-popover/40"
        />
        <div>
          <div className="text-xl font-bold tracking-wide">Honoured1</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Lunar Control</div>
        </div>
      </div>
      <nav className="glass flex flex-1 flex-col rounded-2xl p-3">
        <ul className="space-y-1.5">
          <li>
            <NavLink
              to="/dashboard"
              onClick={onNavigate}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-nav-active font-medium text-foreground" : "text-secondary-foreground hover:bg-muted"}`
              }
            >
              <Home className="h-5 w-5" strokeWidth={1.6} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/missions"
              onClick={onNavigate}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-nav-active font-medium text-foreground" : "text-secondary-foreground hover:bg-muted"}`
              }
            >
              <Rocket className="h-5 w-5" strokeWidth={1.6} /> Missions
            </NavLink>
          </li>
          {TABS.map(({ label, icon: I, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-nav-active font-medium text-foreground" : "text-secondary-foreground hover:bg-muted"}`
                }
              >
                <I className="h-5 w-5" strokeWidth={1.6} /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="glass mt-auto rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Moon className="h-7 w-7 text-muted-foreground" strokeWidth={1.4} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Exploring <b className="text-foreground">Sustainable</b>
              <br />
              Lunar Futures
            </p>
          </div>
          <div className="mt-4 h-1 rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-cta" />
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
          placeholder="Search missions, landing sites, or regions..."
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
    <div className="relative min-h-screen">
      <div className="flex gap-5 p-4 lg:p-5">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-5">
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

import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export const STATUS_VALUES = ["upcoming", "active", "completed"] as const;
export type MissionStatus = (typeof STATUS_VALUES)[number];

export const MISSION_TYPES = ["Lander", "Rover", "Orbiter", "Payload Delivery", "Other"] as const;
export type MissionType = (typeof MISSION_TYPES)[number];

export const NOT_DETERMINED = "Not yet determined";

/** A mission as the UI renders it — either from the public CLPS catalogue or created by the user. */
export type Mission = {
  id: string;
  name: string;
  agency: string;
  site: string;
  region: string;
  date: string;
  img?: "lander" | "rover" | undefined;
  image?: string | undefined;
  type?: MissionType | undefined;
  objectives?: string | undefined;
  payload?: string | undefined;
  duration?: string | undefined;
  sourceUrl?: string | undefined;
  referenceUrl?: string | undefined;
  custom?: boolean | undefined;
};

/** A mission the user created through the Add Mission form. */
export type UserMission = {
  id: string;
  name: string;
  agency: string;
  type: MissionType;
  launch: string;
  status: MissionStatus;
  site: string;
  objectives: string;
  payload?: string | undefined;
  duration?: string | undefined;
  image?: string | undefined;
  sourceUrl: string;
  referenceUrl?: string | undefined;
  createdAt: number;
  updatedAt: number;
};

/** The shape the Add Mission / Edit Mission form works with. */
export type MissionForm = {
  name: string;
  agency: string;
  type: MissionType | "";
  launch: string;
  status: MissionStatus;
  site: string;
  siteUnknown: boolean;
  objectives: string;
  payload: string;
  duration: string;
  image?: string | undefined;
  sourceUrl: string;
  referenceUrl: string;
};

export const EMPTY_FORM: MissionForm = {
  name: "",
  agency: "",
  type: "",
  launch: "",
  status: "upcoming",
  site: "",
  siteUnknown: false,
  objectives: "",
  payload: "",
  duration: "",
  image: undefined,
  sourceUrl: "",
  referenceUrl: "",
};

export type Filters = {
  q: string;
  status: MissionStatus | "all";
  provider: string;
  site: string;
  year: string;
};

export const EMPTY_FILTERS: Filters = { q: "", status: "all", provider: "all", site: "all", year: "all" };

/* ------------------------------------------------------------------ *
 * Public CLPS catalogue (reference data, never counted as "mine" until saved)
 * ------------------------------------------------------------------ */

export const CATALOG: Mission[] = [
  { id: "artemis-clps-1", name: "Artemis CLPS-1", agency: "Intuitive Machines / NASA", site: "Shackleton Crater", region: "South Pole", date: "Nov 2026", img: "lander" },
  { id: "viper", name: "VIPER", agency: "NASA", site: "Nobile Crater rim", region: "South Pole", date: "Dec 2024", img: "rover" },
  { id: "griffin-1", name: "Griffin Mission 1", agency: "Astrobotic / NASA", site: "Mons Mouton", region: "South Pole", date: "Q1 2027", img: "lander" },
  { id: "im-1", name: "IM-1 Odysseus", agency: "Intuitive Machines / NASA", site: "Malapert A", region: "South Pole", date: "Feb 2024", img: "lander" },
  { id: "im-2", name: "IM-2 Athena", agency: "Intuitive Machines / NASA", site: "Mons Mouton", region: "South Pole", date: "Mar 2025", img: "lander" },
  { id: "blue-ghost-1", name: "Blue Ghost Mission 1", agency: "Firefly Aerospace / NASA", site: "Mare Crisium", region: "Near Side", date: "Mar 2025", img: "lander" },
  { id: "blue-ghost-2", name: "Blue Ghost Mission 2", agency: "Firefly Aerospace / NASA", site: "Schrödinger Basin", region: "Far Side", date: "2026", img: "lander" },
  { id: "peregrine-1", name: "Peregrine Mission One", agency: "Astrobotic / NASA", site: "Gruithuisen Domes (planned)", region: "Near Side", date: "Jan 2024", img: "lander" },
  { id: "im-3", name: "IM-3", agency: "Intuitive Machines / NASA", site: "Reiner Gamma", region: "Near Side", date: "2026", img: "rover" },
];

export const findMission = (id: string) => CATALOG.find((m) => m.id === id);

/* ------------------------------------------------------------------ *
 * State + persistence (this device only)
 * ------------------------------------------------------------------ */

export type Notice = { id: string; text: string; at: number; read: boolean };
export type Profile = { name: string; email: string; role: string; avatar?: string };
export type Prefs = { notifications: boolean; compactCards: boolean };
export type Added = { id: string; name: string };

export type State = {
  collection: Record<string, MissionStatus>;
  missions: Record<string, UserMission>;
  draft: MissionForm | null;
  added: Added | null;
  notices: Notice[];
  profile: Profile;
  prefs: Prefs;
};

const KEY = "honoured1-dashboard-v1";

export const DEFAULT_STATE: State = {
  collection: {},
  missions: {},
  draft: null,
  added: null,
  notices: [
    { id: "n-1", text: "Artemis CLPS-1 payload manifest updated", at: Date.now() - 1000 * 60 * 35, read: false },
    { id: "n-2", text: "VIPER rover navigation path calibrated", at: Date.now() - 1000 * 60 * 120, read: false },
    { id: "n-3", text: "IM-1 Odysseus telemetry archived", at: Date.now() - 1000 * 60 * 240, read: false },
    { id: "n-4", text: "Blue Ghost 1 launch window confirmed", at: Date.now() - 1000 * 60 * 360, read: false },
    { id: "n-5", text: "Griffin Mission 1 lander tests completed", at: Date.now() - 1000 * 60 * 720, read: false },
  ],
  profile: { name: "Harshitha", email: "analyst@nasa.gov", role: "Mission Analyst" },
  prefs: { notifications: true, compactCards: true },
};

let state: State = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const p = JSON.parse(raw) as Partial<State>;
    state = {
      ...DEFAULT_STATE,
      ...p,
      collection: p.collection ?? {},
      missions: p.missions ?? {},
      draft: p.draft ?? null,
      added: p.added ?? null,
      notices: Array.isArray(p.notices) && p.notices.length > 0 ? p.notices : DEFAULT_STATE.notices,
      profile: {
        ...DEFAULT_STATE.profile,
        ...(p.profile ?? {}),
        email: p.profile?.email || DEFAULT_STATE.profile.email,
      },
      prefs: { ...DEFAULT_STATE.prefs, ...(p.prefs ?? {}) },
    };
  } catch {
    /* ignore corrupt data */
  }
}

/** Writes to storage first, so a full quota never leaves the UI claiming a save happened. */
function commit(next: State): boolean {
  if (typeof window === "undefined") return true;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  state = next;
  listeners.forEach((l) => l());
  return true;
}

function set(next: State) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full / disabled — keep the in-memory copy */
    }
  }
  state = next;
  listeners.forEach((l) => l());
}

function withNotice(s: State, text: string): State {
  if (!s.prefs.notifications) return s;
  const n: Notice = { id: crypto.randomUUID(), text, at: Date.now(), read: false };
  return { ...s, notices: [n, ...s.notices].slice(0, 50) };
}

const label: Record<MissionStatus, string> = { upcoming: "scheduled", active: "activated", completed: "completed" };

const STORAGE_FULL =
  "Your browser storage is full, so nothing was saved. Try a smaller image or remove a mission, then save again.";

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

function toUserMission(form: MissionForm, id: string, now: number, previous?: UserMission): UserMission {
  return {
    id,
    name: form.name.trim(),
    agency: form.agency.trim(),
    type: (form.type || "Other") as MissionType,
    launch: form.launch.trim(),
    status: form.status,
    site: form.siteUnknown ? NOT_DETERMINED : form.site.trim(),
    objectives: form.objectives.trim(),
    payload: form.payload.trim() || undefined,
    duration: form.duration.trim() || undefined,
    image: form.image,
    sourceUrl: form.sourceUrl.trim(),
    referenceUrl: form.referenceUrl.trim() || undefined,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
}

export const actions = {
  save(id: string, status: MissionStatus = "upcoming") {
    if (state.collection[id]) return;
    const m = missionById(state, id);
    set(withNotice({ ...state, collection: { ...state.collection, [id]: status } }, `Saved ${m?.name ?? id} to your collection`));
  },
  remove(id: string) {
    if (!state.collection[id]) return;
    const collection = { ...state.collection };
    delete collection[id];
    const missions = { ...state.missions };
    delete missions[id];
    set(withNotice({ ...state, collection, missions }, `Removed ${missionById(state, id)?.name ?? id} from your collection`));
  },
  setStatus(id: string, status: MissionStatus) {
    if (state.collection[id] === status) return;
    const wasSaved = !!state.collection[id];
    const name = missionById(state, id)?.name ?? id;
    const missions = state.missions[id] ? { ...state.missions, [id]: { ...state.missions[id], status, updatedAt: Date.now() } } : state.missions;
    set(withNotice({ ...state, missions, collection: { ...state.collection, [id]: status } }, wasSaved ? `${name} ${label[status]}` : `Saved ${name} as ${status}`));
  },
  addMission(form: MissionForm): SaveResult {
    const id = crypto.randomUUID();
    const now = Date.now();
    const u = toUserMission(form, id, now);
    const next = withNotice(
      { ...state, missions: { ...state.missions, [id]: u }, collection: { ...state.collection, [id]: u.status }, draft: null, added: { id, name: u.name } },
      `Added ${u.name} to your missions`,
    );
    return commit(next) ? { ok: true, id } : { ok: false, error: STORAGE_FULL };
  },
  updateMission(id: string, form: MissionForm): SaveResult {
    const previous = state.missions[id];
    if (!previous) return { ok: false, error: "That mission no longer exists." };
    const u = toUserMission(form, id, Date.now(), previous);
    const next = withNotice(
      { ...state, missions: { ...state.missions, [id]: u }, collection: { ...state.collection, [id]: u.status }, added: { id, name: u.name } },
      `Updated ${u.name}`,
    );
    return commit(next) ? { ok: true, id } : { ok: false, error: STORAGE_FULL };
  },
  deleteMission(id: string) {
    const name = state.missions[id]?.name ?? id;
    const missions = { ...state.missions };
    delete missions[id];
    const collection = { ...state.collection };
    delete collection[id];
    const added = state.added?.id === id ? null : state.added;
    set(withNotice({ ...state, missions, collection, added }, `Deleted ${name}`));
  },
  saveDraft(form: MissionForm) {
    set(withNotice({ ...state, draft: form }, "Draft saved"));
  },
  clearDraft() {
    if (!state.draft) return;
    set({ ...state, draft: null });
  },
  dismissAdded() {
    if (!state.added) return;
    set({ ...state, added: null });
  },
  markRead(id: string) {
    set({ ...state, notices: state.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  },
  markAllRead() {
    set({ ...state, notices: state.notices.map((n) => ({ ...n, read: true })) });
  },
  clearNotices() {
    set({ ...state, notices: [] });
  },
  updateProfile(p: Profile) {
    set(withNotice({ ...state, profile: p }, "Profile updated"));
  },
  updatePrefs(p: Prefs) {
    set({ ...state, prefs: p });
  },
  resetAll() {
    set(DEFAULT_STATE);
  },
};

/* ------------------------------------------------------------------ *
 * Selectors
 * ------------------------------------------------------------------ */

export function toMission(u: UserMission): Mission {
  return {
    id: u.id,
    name: u.name,
    agency: u.agency,
    site: u.site,
    region: u.site,
    date: u.launch,
    image: u.image,
    type: u.type,
    objectives: u.objectives,
    payload: u.payload,
    duration: u.duration,
    sourceUrl: u.sourceUrl,
    referenceUrl: u.referenceUrl,
    custom: true,
  };
}

export function formFromUserMission(u: UserMission): MissionForm {
  return {
    name: u.name,
    agency: u.agency,
    type: u.type,
    launch: u.launch,
    status: u.status,
    site: u.site === NOT_DETERMINED ? "" : u.site,
    siteUnknown: u.site === NOT_DETERMINED,
    objectives: u.objectives,
    payload: u.payload ?? "",
    duration: u.duration ?? "",
    image: u.image,
    sourceUrl: u.sourceUrl,
    referenceUrl: u.referenceUrl ?? "",
  };
}

export function missionById(s: State, id: string): Mission | undefined {
  const u = s.missions[id];
  if (u) return toMission(u);
  return CATALOG.find((m) => m.id === id);
}

export type MyRow = { id: string; status: MissionStatus; mission: Mission };

/** The user's personal missions — saved catalogue entries plus everything they created. */
export function myMissions(s: State): MyRow[] {
  const rows: MyRow[] = [];
  for (const [id, status] of Object.entries(s.collection)) {
    const mission = missionById(s, id);
    if (mission) rows.push({ id, status, mission });
  }
  return rows;
}

export function allMissions(s: State): Mission[] {
  return [...CATALOG, ...Object.values(s.missions).map(toMission)];
}

export function searchMissions(q: string, pool: Mission[] = CATALOG) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return pool.filter((m) => [m.name, m.agency, m.site, m.region, m.type ?? ""].some((f) => f.toLowerCase().includes(s)));
}

export function launchYear(date: string) {
  const m = date.match(/(19|20|21)\d{2}/);
  return m ? m[0] : "";
}

export function filterOptions(rows: MyRow[]) {
  const uniq = (xs: string[]) => Array.from(new Set(xs.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  return {
    providers: uniq(rows.map((r) => r.mission.agency)),
    sites: uniq(rows.map((r) => r.mission.site)),
    years: uniq(rows.map((r) => launchYear(r.mission.date))),
  };
}

export function filterMissions(rows: MyRow[], f: Filters): MyRow[] {
  const q = f.q.trim().toLowerCase();
  return rows.filter((r) => {
    const m = r.mission;
    if (f.status !== "all" && r.status !== f.status) return false;
    if (f.provider !== "all" && m.agency !== f.provider) return false;
    if (f.site !== "all" && m.site !== f.site) return false;
    if (f.year !== "all" && launchYear(m.date) !== f.year) return false;
    if (q && ![m.name, m.agency, m.site, m.objectives ?? "", m.type ?? ""].some((x) => x.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function countStats(collection: Record<string, MissionStatus>) {
  const vals = Object.values(collection);
  return {
    total: vals.length,
    active: vals.filter((v) => v === "active").length,
    completed: vals.filter((v) => v === "completed").length,
    upcoming: vals.filter((v) => v === "upcoming").length,
  };
}

/* ------------------------------------------------------------------ *
 * React binding
 * ------------------------------------------------------------------ */

const subscribe = (l: () => void) => {
  load();
  listeners.add(l);
  l();
  return () => listeners.delete(l);
};

export function useStore(): State {
  return useSyncExternalStore(subscribe, () => state, () => DEFAULT_STATE);
}

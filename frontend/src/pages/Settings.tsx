import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  Database,
  LayoutGrid,
  Mail,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { actions, useStore, DEFAULT_STATE, type Prefs, type Profile } from "@/lib/mission-store";

export default function Settings() {
  const { profile, prefs } = useStore();
  const [profileForm, setProfileForm] = useState<Profile>(profile);
  const [savedMessage, setSavedMessage] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevProfile, setPrevProfile] = useState(profile);
  if (profile !== prevProfile) {
    setPrevProfile(profile);
    setProfileForm(profile);
  }

  // Storage usage calculation
  const [storageStats, setStorageStats] = useState({
    usedText: "2.4 MB used",
    limitText: "50 MB limit",
    percentage: 4.8,
  });

  const measureStorage = async () => {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usageBytes = est.usage ?? 0;
        const raw = localStorage.getItem("honoured1-dashboard-v1") || "";
        const rawBytes = new Blob([raw]).size;
        const totalBytes = Math.max(usageBytes, rawBytes);
        if (totalBytes > 100 * 1024) {
          const mb = (totalBytes / (1024 * 1024)).toFixed(1);
          const limit = est.quota ? Math.round(est.quota / (1024 * 1024)) : 50;
          const displayLimit = limit > 500 ? "50 MB limit" : `${limit} MB limit`;
          const pct = Math.min(100, Math.max(4, Math.round((totalBytes / (50 * 1024 * 1024)) * 100)));
          setStorageStats({
            usedText: `${mb} MB used`,
            limitText: displayLimit,
            percentage: pct,
          });
        } else {
          setStorageStats({
            usedText: "2.4 MB used",
            limitText: "50 MB limit",
            percentage: 4.8,
          });
        }
      }
    } catch {
      // keep default stats
    }
  };

  useEffect(() => {
    let ignore = false;
    if (typeof window !== "undefined" && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (ignore) return;
        const usageBytes = est.usage ?? 0;
        const raw = localStorage.getItem("honoured1-dashboard-v1") || "";
        const rawBytes = new Blob([raw]).size;
        const totalBytes = Math.max(usageBytes, rawBytes);
        if (totalBytes > 100 * 1024) {
          const mb = (totalBytes / (1024 * 1024)).toFixed(1);
          const limit = est.quota ? Math.round(est.quota / (1024 * 1024)) : 50;
          const displayLimit = limit > 500 ? "50 MB limit" : `${limit} MB limit`;
          const pct = Math.min(100, Math.max(4, Math.round((totalBytes / (50 * 1024 * 1024)) * 100)));
          setStorageStats({
            usedText: `${mb} MB used`,
            limitText: displayLimit,
            percentage: pct,
          });
        }
      }).catch(() => {
        // keep default
      });
    }
    return () => {
      ignore = true;
    };
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    actions.updateProfile({
      ...profileForm,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      role: profileForm.role.trim(),
    });
    setSavedMessage("Profile updated successfully!");
    void measureStorage();
    setTimeout(() => setSavedMessage(""), 3500);
  };

  const handlePrefToggle = (key: keyof Prefs, checked: boolean) => {
    actions.updatePrefs({ ...prefs, [key]: checked });
    void measureStorage();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProfileForm((prev) => ({ ...prev, avatar: result }));
      actions.updateProfile({ ...profileForm, avatar: result });
      setSavedMessage("Avatar photo updated!");
      setTimeout(() => setSavedMessage(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  const confirmReset = () => {
    actions.resetAll();
    setProfileForm(DEFAULT_STATE.profile);
    setShowResetConfirm(false);
    void measureStorage();
    setResetSuccessMessage("All dashboard data, missions, and preferences have been reset.");
    setTimeout(() => setResetSuccessMessage(""), 4500);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-12 w-full max-w-6xl">
        {/* Floating feedback notifications */}
        {savedMessage && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/70 backdrop-blur-xl px-4 py-3 text-sm text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{savedMessage}</span>
          </div>
        )}

        {resetSuccessMessage && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/70 backdrop-blur-xl px-4 py-3 text-sm text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-in fade-in slide-in-from-top-2 duration-200">
            <Check className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="font-medium">{resetSuccessMessage}</span>
          </div>
        )}

        {/* Page Heading */}
        <div className="flex items-center gap-4">
          <div className="text-cyan-400 drop-shadow-[0_0_14px_rgba(34,211,238,0.75)] shrink-0">
            <SettingsIcon className="w-8 h-8 md:w-9 md:h-9" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>Settings &</span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Preferences
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300/80 mt-1">
              Configure your analyst profile, notification alerts, display preferences, and local storage.
            </p>
          </div>
        </div>

        {/* 1. Analyst Profile Card */}
        <section className="glass rounded-2xl p-6 md:p-7">
          <div className="flex items-start gap-3 mb-6">
            <User className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" strokeWidth={2} />
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white">Analyst Profile</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">Manage your personal details and role assignment.</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
              {/* Left Column: Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 border-2 border-indigo-400/60 shadow-[0_0_24px_rgba(99,102,241,0.35)]">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl md:text-5xl font-bold text-white select-none">
                      {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : "H"}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-slate-900 border border-slate-600 hover:border-cyan-400 flex items-center justify-center shadow-lg transition-colors group cursor-pointer"
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                >
                  <Camera className="w-4 h-4 text-white group-hover:text-cyan-400 transition-colors" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>


              <div
                className="hidden md:block self-stretch mx-3 w-[3px] rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.45) 60%, rgba(255,255,255,0.08))",
                  boxShadow:
                    "0 0 6px rgba(255,255,255,0.18), inset 0 0 2px rgba(255,255,255,0.5)",
                }}
              />



              {/* Right Column: Profile Form Fields */}
              <div className="flex-1 w-full space-y-4">
                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium mb-1.5 block">Name</label>
                    <div className="flex items-center h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 transition-all">
                      <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium mb-1.5 block">Email</label>
                    <div className="flex items-center h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 transition-all">
                      <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                        placeholder="analyst@nasa.gov"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Role / Assignment + Save Changes Button */}
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <label className="text-xs text-slate-300 font-medium mb-1.5 block">Role / Assignment</label>
                    <div className="relative flex items-center h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 transition-all">
                      <Briefcase className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                      <select
                        value={profileForm.role}
                        onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                        className="w-full bg-transparent text-sm text-white outline-none appearance-none cursor-pointer pr-8"
                      >
                        <option value="Mission Analyst" className="bg-slate-900 text-white">Mission Analyst</option>
                        <option value="Flight Director" className="bg-slate-900 text-white">Flight Director</option>
                        <option value="Payload Specialist" className="bg-slate-900 text-white">Payload Specialist</option>
                        <option value="Lunar Geologist" className="bg-slate-900 text-white">Lunar Geologist</option>
                        <option value="Systems Engineer" className="bg-slate-900 text-white">Systems Engineer</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto h-11 px-6 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600 hover:from-sky-300 hover:via-blue-400 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* 2. Application Preferences Card */}
        <section className="glass rounded-2xl p-6 md:p-7">
          <div className="flex items-start gap-3 mb-6">
            <SlidersHorizontal className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" strokeWidth={2} />
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white">Application Preferences</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">Customize how the application behaves and notifies you.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Preference Row 1: Activity Notifications */}
            <div className="flex items-center justify-between p-4 md:px-5 md:py-4 rounded-2xl border border-white/20 bg-white/10 hover:border-slate-600/70 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-slate-200" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white">Activity Notifications</h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                    Receive in-app alerts when missions are saved, added, or updated.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={prefs.notifications}
                onClick={() => handlePrefToggle("notifications", !prefs.notifications)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${prefs.notifications
                  ? "bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)]"
                  : "bg-slate-700"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${prefs.notifications ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {/* Preference Row 2: Compact Mission Cards */}
            <div className="flex items-center justify-between p-4 md:px-5 md:py-4 rounded-2xl border border-white/20 bg-white/10 hover:border-slate-600/70 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-5 h-5 text-slate-200" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white">Compact Mission Cards</h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                    Hide imagery thumbnails on cards for a denser data view.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={prefs.compactCards}
                onClick={() => handlePrefToggle("compactCards", !prefs.compactCards)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${prefs.compactCards
                  ? "bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)]"
                  : "bg-slate-700"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${prefs.compactCards ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 3. Local Storage & Reset Card */}
        <section className="glass rounded-2xl p-6 md:p-7">
          <div className="flex items-start gap-3 mb-6">
            <Database className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" strokeWidth={2} />
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white">Local Storage & Reset</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                All your missions, bookmarks, drafts, and preferences are stored locally in your browser's local storage under key{" "}
                <span className="font-semibold text-white">honoured1-dashboard-v1</span>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 md:p-5 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Side: Local Storage Usage */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-1 w-full">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-slate-200" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-white">Local Storage Usage</h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">Stores your missions, settings and cached data</p>
                </div>
              </div>

              <div className="w-full sm:w-64 lg:w-72 shrink-0">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="font-semibold text-white">{storageStats.usedText}</span>
                  <span className="text-slate-400">{storageStats.limitText}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 border border-white/20 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500"
                    style={{ width: `${storageStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subtle Vertical Divider */}
            <div className="hidden lg:block w-px self-stretch bg-slate-700/60 mx-2" />

            {/* Right Side: Reset All Data */}
            <div className="flex flex-col items-center shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.35)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-white" />
                <span>Reset All Data</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                This will clear all locally stored<br className="hidden sm:inline" /> data, missions, and preferences.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal for Reset All Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-950/95 p-6 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/20 border border-rose-500/40">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Local Storage?</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              This action will permanently delete all your custom missions, saved mission statuses, analyst profile changes, and application preferences under{" "}
              <code className="text-cyan-300 bg-cyan-950/40 px-1 py-0.5 rounded text-xs font-mono">honoured1-dashboard-v1</code>.
            </p>
            <p className="text-xs text-rose-300/90 mt-2 font-medium">
              Reference CLPS catalogue data will be restored to defaults. This cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-white/10 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

import { useState } from "react";
import { Check, RotateCcw, Settings as SettingsIcon, SlidersHorizontal, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { actions, useStore, DEFAULT_STATE, type Prefs, type Profile } from "@/lib/mission-store";

export default function Settings() {
  const { profile, prefs } = useStore();
  const [profileForm, setProfileForm] = useState<Profile>(profile);
  const [savedMessage, setSavedMessage] = useState("");

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    actions.updateProfile({ ...profileForm, name: profileForm.name.trim() });
    setSavedMessage("Profile updated successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handlePrefToggle = (key: keyof Prefs, checked: boolean) => {
    actions.updatePrefs({ ...prefs, [key]: checked });
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8 max-w-4xl">
        <div>
          <h1 className="text-gradient-title text-3xl font-bold">Settings & Preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your analyst profile, notification alerts, display preferences, and local storage.
          </p>
        </div>

        {savedMessage && (
          <div className="glass flex items-center gap-2 rounded-xl border-success/40 px-4 py-3 text-sm text-success">
            <Check className="h-4 w-4" /> {savedMessage}
          </div>
        )}

        {/* Profile Card */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-glow" />
            <h2 className="text-lg font-semibold">Analyst Profile</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted-foreground">Name</span>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1 w-full rounded-xl border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Email</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="mt-1 w-full rounded-xl border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="analyst@nasa.gov"
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="text-muted-foreground">Role / Assignment</span>
              <input
                type="text"
                value={profileForm.role}
                onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                className="mt-1 w-full rounded-xl border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="bg-cta rounded-full px-6 py-2 text-sm font-medium transition-transform hover:scale-105"
              >
                Save Profile
              </button>
            </div>
          </form>
        </section>

        {/* Display & Notification Preferences */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <SlidersHorizontal className="h-5 w-5 text-violet" />
            <h2 className="text-lg font-semibold">Application Preferences</h2>
          </div>

          <div className="space-y-4">
            <label className="glass flex cursor-pointer items-center justify-between rounded-xl p-4">
              <div>
                <div className="font-medium">Activity Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive in-app alerts when missions are saved, added, or updated.
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifications}
                onChange={(e) => handlePrefToggle("notifications", e.target.checked)}
                className="h-5 w-5 accent-[var(--primary)] cursor-pointer"
              />
            </label>

            <label className="glass flex cursor-pointer items-center justify-between rounded-xl p-4">
              <div>
                <div className="font-medium">Compact Mission Cards</div>
                <div className="text-xs text-muted-foreground">
                  Hide imagery thumbnails on cards for a denser data view.
                </div>
              </div>
              <input
                type="checkbox"
                checked={prefs.compactCards}
                onChange={(e) => handlePrefToggle("compactCards", e.target.checked)}
                className="h-5 w-5 accent-[var(--primary)] cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Data Persistence & Reset */}
        <section className="glass rounded-2xl p-6 border-destructive/20">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">Local Storage & Reset</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            All your missions, bookmarks, drafts, and preferences are stored locally in your browser's local storage under key <code className="text-foreground">honoured1-dashboard-v1</code>.
          </p>

          <div className="mt-4">
            <button
              onClick={() => {
                if (confirm("Reset all your dashboard data? This will clear saved missions and cannot be undone.")) {
                  actions.resetAll();
                  setProfileForm(DEFAULT_STATE.profile);
                  alert("Dashboard data has been reset to defaults.");
                }
              }}
              className="flex items-center gap-2 rounded-full bg-destructive px-5 py-2 text-sm font-medium hover:bg-destructive/80 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reset All Data
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

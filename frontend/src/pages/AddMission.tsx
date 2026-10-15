import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, Check, ImageUp, TriangleAlert, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  EMPTY_FORM,
  MISSION_TYPES,
  STATUS_VALUES,
  actions,
  formFromUserMission,
  useStore,
  type MissionForm,
  type MissionStatus,
} from "@/lib/mission-store";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const URL_OK = /^https?:\/\/[^\s.]+\.[^\s]+/;

const schema = z
  .object({
    name: z.string().trim().min(1, "Mission name is required.").max(120, "Keep the name under 120 characters."),
    agency: z.string().trim().min(1, "Mission provider / agency is required.").max(120, "Keep the provider under 120 characters."),
    type: z.enum(MISSION_TYPES, { message: "Choose a mission type." }),
    launch: z.string().trim().min(1, "Launch year or planned launch date is required."),
    status: z.enum(STATUS_VALUES),
    site: z.string().trim().max(120, "Keep the landing site under 120 characters."),
    siteUnknown: z.boolean(),
    objectives: z.string().trim().min(1, "Mission objectives are required.").max(600, "Keep the objectives under 600 characters."),
    payload: z.string().trim().max(300, "Keep the payload notes under 300 characters."),
    duration: z.string().trim().max(120, "Keep the duration under 120 characters."),
    sourceUrl: z
      .string()
      .trim()
      .min(1, "Official source URL is required.")
      .refine((v) => URL_OK.test(v), "Enter a valid URL, e.g. https://nasa.gov/..."),
    referenceUrl: z.string().trim().refine((v) => v === "" || URL_OK.test(v), "Enter a valid URL or leave this empty."),
  })
  .superRefine((v, ctx) => {
    const looksLikeYear = /(19|20|21)\d{2}/.test(v.launch);
    if (!looksLikeYear && Number.isNaN(Date.parse(v.launch)))
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["launch"], message: "Enter a year (2027) or a date (2027-03-14)." });
    if (!v.siteUnknown && v.site.length === 0)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["site"],
        message: "Landing site / lunar region is required, or tick “Not yet determined”.",
      });
  });

type Errors = { [K in keyof MissionForm]?: string | undefined };

function validate(form: MissionForm): Errors | null {
  const r = schema.safeParse(form);
  if (r.success) return null;
  const errs: Errors = {};
  for (const i of r.error.issues) {
    const k = String(i.path[0] ?? "") as keyof MissionForm;
    if (!errs[k]) errs[k] = i.message;
  }
  return errs;
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">
        {label}
        {required && <span className="text-glow"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{note}</p>
      {children}
    </section>
  );
}

const inputCls = (bad?: boolean) =>
  `mt-1 w-full rounded-xl border bg-input px-3 py-2 outline-none focus:ring-2 focus:ring-ring ${bad ? "border-destructive" : ""}`;

/** Reads a JPG/PNG under 5 MB and downscales it so the browser store can actually hold it. */
function readMissionImage(file: File, onOk: (dataUrl: string) => void, onErr: (msg: string) => void) {
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    onErr("Only JPG or PNG images are allowed.");
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    onErr("The image must be 5 MB or smaller.");
    return;
  }
  const reader = new FileReader();
  reader.onerror = () => onErr("That file couldn't be read. Try another image.");
  reader.onload = () => {
    const raw = String(reader.result);
    const img = new Image();
    img.onerror = () => onErr("That file isn't a readable image.");
    img.onload = () => {
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onOk(raw);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      onOk(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = raw;
  };
  reader.readAsDataURL(file);
}

export default function AddMission() {
  const s = useStore();
  const [searchParams] = useSearchParams();
  const edit = searchParams.get("edit") || undefined;
  const navigate = useNavigate();
  const editing = edit ? s.missions[edit] : undefined;

  const [currentEditId, setCurrentEditId] = useState<string | undefined>(editing?.id);
  const [form, setForm] = useState<MissionForm>(() =>
    editing ? formFromUserMission(editing) : s.draft ?? EMPTY_FORM
  );
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState("");
  const [imageError, setImageError] = useState("");

  if (editing?.id !== currentEditId) {
    setCurrentEditId(editing?.id);
    setForm(editing ? formFromUserMission(editing) : s.draft ?? EMPTY_FORM);
  }

  const set = <K extends keyof MissionForm>(k: K, v: MissionForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setBanner("");
  };

  const checklist = [
    { ok: !!form.name.trim(), text: "Mission name is filled in" },
    { ok: !!form.agency.trim(), text: "Provider / agency is filled in" },
    { ok: !!form.type, text: "Mission type is chosen" },
    { ok: /(19|20|21)\d{2}/.test(form.launch) || !Number.isNaN(Date.parse(form.launch)), text: "Launch year or date is valid" },
    { ok: form.siteUnknown || !!form.site.trim(), text: "Landing site given, or marked “Not yet determined”" },
    { ok: !!form.objectives.trim(), text: "Mission objectives are written" },
    { ok: URL_OK.test(form.sourceUrl.trim()), text: "Official source URL is a valid link" },
  ];
  const done = checklist.filter((c) => c.ok).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (errs) {
      setErrors(errs);
      setBanner("Please fix the highlighted fields before saving.");
      return;
    }
    setErrors({});
    const res = editing ? actions.updateMission(editing.id, form) : actions.addMission(form);
    if (!res.ok) {
      setBanner(res.error);
      return;
    }
    navigate("/missions");
  };

  return (
    <AppShell>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 pb-8">
        <div className="flex items-start gap-4">
          <Link
            to="/missions"
            className="glass mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"
            aria-label="Back to missions"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-gradient-title text-3xl font-bold">{editing ? "Edit Mission" : "Add Mission"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {editing ? `Updating ${editing.name}.` : "Record a mission once and it stays in your collection."}
            </p>
          </div>
        </div>

        {banner && (
          <div className="glass flex items-center gap-3 rounded-2xl border-destructive/50 px-4 py-3 text-sm">
            <TriangleAlert className="h-5 w-5 shrink-0 text-destructive" />
            <p>{banner}</p>
          </div>
        )}

        <Section title="Basic Information" note="The details every mission record needs.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Mission Name" required error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls(!!errors.name)}
                placeholder="Artemis CLPS-1"
              />
            </Field>
            <Field label="Mission Provider / Agency" required error={errors.agency}>
              <input
                value={form.agency}
                onChange={(e) => set("agency", e.target.value)}
                className={inputCls(!!errors.agency)}
                placeholder="Intuitive Machines / NASA"
              />
            </Field>
            <Field label="Mission Type" required error={errors.type}>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as MissionForm["type"])}
                className={inputCls(!!errors.type)}
              >
                <option value="">Select a type…</option>
                {MISSION_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-popover text-foreground">
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Launch Year or Planned Launch Date"
              required
              error={errors.launch}
              hint="A year like 2027, or a date like 2027-03-14."
            >
              <input
                value={form.launch}
                onChange={(e) => set("launch", e.target.value)}
                className={inputCls(!!errors.launch)}
                placeholder="2027"
              />
            </Field>
            <Field label="Mission Status" required error={errors.status}>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as MissionStatus)}
                className={inputCls(!!errors.status)}
              >
                {STATUS_VALUES.map((v) => (
                  <option key={v} value={v} className="bg-popover text-foreground capitalize">
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Mission Specifics" note="Where it goes and what it sets out to do.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Landing Site / Lunar Region" required={!form.siteUnknown} error={errors.site}>
              <input
                value={form.site}
                disabled={form.siteUnknown}
                onChange={(e) => set("site", e.target.value)}
                className={`${inputCls(!!errors.site)} disabled:opacity-50`}
                placeholder="Shackleton Crater"
              />
            </Field>
            <div className="flex items-end pb-2">
              <label className="glass flex cursor-pointer items-center gap-3 rounded-xl p-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.siteUnknown}
                  onChange={(e) => set("siteUnknown", e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Not yet determined
              </label>
            </div>
            <Field label="Mission Objectives" required error={errors.objectives}>
              <textarea
                value={form.objectives}
                onChange={(e) => set("objectives", e.target.value)}
                rows={4}
                className={`${inputCls(!!errors.objectives)} resize-y`}
                placeholder="Deliver NASA payloads to the lunar south pole and survey permanently shadowed regions."
              />
            </Field>
            <div className="grid gap-4">
              <Field label="Payload / Instruments" error={errors.payload} hint="Optional.">
                <input
                  value={form.payload}
                  onChange={(e) => set("payload", e.target.value)}
                  className={inputCls(!!errors.payload)}
                  placeholder="PRISM-1, LLRA-3"
                />
              </Field>
              <Field label="Mission Duration" error={errors.duration} hint="Optional.">
                <input
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  className={inputCls(!!errors.duration)}
                  placeholder="10 days surface ops"
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Media & References" note="A picture is optional; a source is not.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Mission Image</span>
              <p className="mb-2 mt-1 text-xs text-muted-foreground">Optional. JPG or PNG, up to 5 MB.</p>
              {form.image ? (
                <div className="glass relative overflow-hidden rounded-xl">
                  <img src={form.image} alt="Mission image preview" className="h-40 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      set("image", undefined);
                      setImageError("");
                    }}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/80 hover:bg-destructive/70"
                    aria-label="Remove mission image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="glass flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-dashed text-center text-sm text-muted-foreground hover:bg-muted">
                  <ImageUp className="h-7 w-7" strokeWidth={1.5} />
                  <span>Drop an image or click to browse</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageError("");
                      readMissionImage(
                        file,
                        (dataUrl) => set("image", dataUrl),
                        (msg) => setImageError(msg),
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              {imageError && <span className="mt-1 block text-xs text-destructive">{imageError}</span>}
            </div>
            <div className="grid content-start gap-4">
              <Field label="Official Source URL" required error={errors.sourceUrl}>
                <input
                  value={form.sourceUrl}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                  className={inputCls(!!errors.sourceUrl)}
                  placeholder="https://www.nasa.gov/..."
                />
              </Field>
              <Field label="Additional Reference URL" error={errors.referenceUrl} hint="Optional.">
                <input
                  value={form.referenceUrl}
                  onChange={(e) => set("referenceUrl", e.target.value)}
                  className={inputCls(!!errors.referenceUrl)}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Requirements for Adding a Mission" note={`${done} of ${checklist.length} complete`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li
                key={c.text}
                className={`flex items-center gap-3 rounded-xl p-3 text-sm ${c.ok ? "bg-success/15" : "bg-muted"}`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.ok ? "bg-success" : "border"}`}
                >
                  {c.ok && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                {c.text}
              </li>
            ))}
          </ul>
        </Section>

        <div className="glass sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl p-4">
          <button
            type="button"
            onClick={() => {
              actions.saveDraft(form);
              setBanner("Draft saved in this browser — you can leave and come back to it.");
            }}
            className="rounded-full border px-5 py-2 text-sm hover:bg-muted"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => navigate("/missions")}
            className="rounded-full px-5 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-cta ml-auto rounded-full px-8 py-2.5 font-medium transition-transform hover:scale-105"
          >
            {editing ? "Save Changes" : "Add Mission"}
          </button>
        </div>
      </form>
    </AppShell>
  );
}

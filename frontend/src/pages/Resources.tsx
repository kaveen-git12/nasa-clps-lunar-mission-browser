import { BookOpen, ExternalLink, FileText, Globe, Layers, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const DOCS = [
  {
    title: "NASA Commercial Lunar Payload Services Overview",
    desc: "Official NASA guidelines, solicitation documents, and contract overviews for commercial lunar deliveries.",
    link: "https://www.nasa.gov/commercial-lunar-payload-services/",
    badge: "Official NASA",
  },
  {
    title: "Lunar Reconnaissance Orbiter Camera (LROC)",
    desc: "High-resolution global lunar mosaics, digital elevation models, and south-pole illumination studies.",
    link: "https://www.lroc.asu.edu/",
    badge: "Planetary Data",
  },
  {
    title: "Artemis Accords & Polar Standards",
    desc: "Principles for cooperation in the civil exploration and use of the Moon, Mars, comets, and asteroids.",
    link: "https://www.nasa.gov/artemis-accords/",
    badge: "Policy & Standards",
  },
  {
    title: "Planetary Data System (PDS) Geosciences Node",
    desc: "Scientific datasets from landed and orbital lunar missions, spectrometer readings, and surface thermal scans.",
    link: "https://pds-geosciences.wustl.edu/",
    badge: "Scientific Archive",
  },
];

export default function Resources() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Lunar Resources & Archives
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated NASA documentation, science datasets, and operational standards for lunar payload missions.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <Layers className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">14+ Payloads Manifested</h3>
            <p className="mt-1 text-xs text-muted-foreground">Spectrometers, drills, magnetometers, and laser retroreflectors.</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Globe className="h-6 w-6 text-glow" />
            <h3 className="mt-3 font-semibold">Commercial Partners</h3>
            <p className="mt-1 text-xs text-muted-foreground">Intuitive Machines, Astrobotic, Firefly Aerospace, and Draper.</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <ShieldCheck className="h-6 w-6 text-success" />
            <h3 className="mt-3 font-semibold">Standard Interface Specs</h3>
            <p className="mt-1 text-xs text-muted-foreground">Mechanical, electrical, and thermal interface requirements for CLPS landers.</p>
          </div>
        </div>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5 text-glow" />
            <h2 className="text-lg font-semibold">Primary Mission Documentation</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DOCS.map((doc) => (
              <a
                key={doc.title}
                href={doc.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-hover flex flex-col justify-between rounded-xl p-5 transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/20 px-3 py-0.5 text-xs font-medium text-primary">
                      {doc.badge}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 font-semibold">{doc.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{doc.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-glow font-medium">
                  <FileText className="h-3.5 w-3.5" /> Access external portal
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

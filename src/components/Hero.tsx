import desktopPortrait from "../assets/images/Desktop Nikhil Paharia profile photo.png";
import "@/components/hero-next.css";

type Clip = { label: string; start: number; width: number; tone: string };

const CODE: Clip[] = [
  { label: "Design", start: 0, width: 16, tone: "bg-sky-500/90" },
  { label: "React build", start: 17, width: 34, tone: "bg-blue-600/90" },
  { label: "API + payments", start: 52, width: 28, tone: "bg-indigo-600/90" },
  { label: "Launch", start: 81, width: 19, tone: "bg-sky-700/90" },
];
const VIDEO: Clip[] = [
  { label: "Shoot", start: 0, width: 20, tone: "bg-amber-500/90" },
  { label: "Cut + pacing", start: 21, width: 32, tone: "bg-orange-500/90" },
  { label: "Colour + sound", start: 54, width: 30, tone: "bg-amber-600/90" },
  { label: "Deliver", start: 85, width: 15, tone: "bg-orange-700/90" },
];

function Track({ name, clips, delay }: { name: string; clips: Clip[]; delay: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground sm:w-16">{name}</span>
      <div className="relative h-9 flex-1 rounded-md bg-foreground/5 sm:h-10">
        {clips.map((c, i) => (
          <span
            key={c.label}
            className={`hn-clip absolute top-1 bottom-1 flex items-center overflow-hidden rounded px-2 text-[11px] font-medium text-white sm:text-xs ${c.tone}`}
            style={{ left: `${c.start}%`, width: `${c.width}%`, animationDelay: `${delay + i * 0.12}s` }}
          >
            <span className="truncate">{c.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] items-center px-5 pb-16 pt-28 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <p className="hn-rise mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground" style={{ animationDelay: ".05s" }}>
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Taking on freelance projects from Assam, India
          </p>
          <h1 className="hn-rise text-[clamp(2.6rem,7vw,5.2rem)] font-bold leading-[1.02] tracking-tight text-foreground" style={{ animationDelay: ".15s", fontFamily: "Syne, Inter, sans-serif" }}>
            Websites that work.
            <br />
            Videos that hold attention.
          </h1>
          <p className="hn-rise mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: ".3s" }}>
            I'm Nikhil Paharia, a full-stack developer and video editor. I take one project from first sketch to launch, so your site and your footage look like they came from the same hand.
          </p>
          <div className="hn-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: ".42s" }}>
            <a href="#contact" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Start a project
            </a>
            <a href="#projects" className="rounded-full border border-border px-6 py-3 font-semibold text-foreground transition hover:bg-foreground/5 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              See my work
            </a>
          </div>
        </div>

        <figure className="hn-rise mx-auto w-full max-w-sm lg:max-w-none" style={{ animationDelay: ".25s" }}>
          <img src={desktopPortrait} alt="Nikhil Paharia" width={640} height={800} fetchPriority="high" className="aspect-[4/5] w-full rounded-2xl object-cover object-top" />
        </figure>

        <div className="relative rounded-xl border border-border bg-card/70 p-4 backdrop-blur sm:p-5 lg:col-span-2" role="img" aria-label="Project timeline showing code and video work running side by side from design to delivery">
          <div className="space-y-2">
            <Track name="Code" clips={CODE} delay={0.5} />
            <Track name="Video" clips={VIDEO} delay={0.7} />
          </div>
          <div className="pointer-events-none absolute bottom-3 top-3 left-[calc(1rem+3.5rem+0.75rem)] right-4 sm:left-[calc(1.25rem+4rem+0.75rem)] sm:right-5" aria-hidden="true">
            <div className="hn-playhead absolute top-0 bottom-0 w-0.5 bg-foreground">
              <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

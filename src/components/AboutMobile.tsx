import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { MapPin, CalendarDays, GraduationCap, Code2, Layers, Users, Trophy, Video, Rocket, ChevronLeft, ChevronRight } from "lucide-react";
import { SiReact, SiNextdotjs, SiNodedotjs, SiMongodb, SiTailwindcss, SiTypescript } from "react-icons/si";
import portrait from "../assets/images/Desktop Nikhil Paharia profile photo.png";
import CountUp from "@/components/ui/CountUp";
import "./about-stories.css";

/**
 * About — phone / tablet layout (below the `lg` breakpoint).
 * Instagram-Stories style: swipeable chapter cards with a segmented progress bar on top.
 * Desktop keeps the notebook (see About.tsx). Edit the arrays below to change the content.
 */

const CHIPS = [
  { Icon: MapPin, label: "Assam, India" },
  { Icon: CalendarDays, label: "21 Years" },
  { Icon: GraduationCap, label: "BSc (Chemistry)" },
];

const STATS = [
  { Icon: Code2, value: "1+", label: "Years Experience" },
  { Icon: Layers, value: "10+", label: "Projects Completed" },
  { Icon: Users, value: "5+", label: "Happy Clients" },
  { Icon: Trophy, value: "100%", label: "Client Satisfaction" },
];

const JOURNEY = [
  { Icon: GraduationCap, title: "Education", text: "BSc (Chemistry) – Jagiroad College (Gauhati University)", year: "2024", when: "2024 – Present", bg: "linear-gradient(160deg,#0b1f4d 0%,#123a9c 100%)" },
  { Icon: Code2, title: "Started Building", text: "Began learning web development and working on real projects.", year: "2025", when: "2025", bg: "linear-gradient(160deg,#0c2a6b 0%,#1266F1 100%)" },
  { Icon: Video, title: "Video Editing", text: "Started creating videos, reels and brand content for clients.", year: "2025", when: "2025", bg: "linear-gradient(160deg,#2a1450 0%,#7a2fd0 100%)" },
  { Icon: Rocket, title: "Now", text: "Building web apps, helping businesses go online and creating impactful video content.", year: "2026", when: "2026", bg: "linear-gradient(160deg,#3a1306 0%,#ff6a1a 100%)" },
];

const TECH: { name: string; node: React.ReactNode }[] = [
  { name: "React", node: <SiReact style={{ color: "#61DAFB" }} /> },
  { name: "Next.js", node: <SiNextdotjs /> },
  { name: "Node.js", node: <SiNodedotjs style={{ color: "#6cc24a" }} /> },
  { name: "MongoDB", node: <SiMongodb style={{ color: "#4faa41" }} /> },
  { name: "Tailwind", node: <SiTailwindcss style={{ color: "#38BDF8" }} /> },
  { name: "TypeScript", node: <SiTypescript style={{ color: "#5a9bf0" }} /> },
  { name: "Premiere", node: <span className="font-black text-[15px]" style={{ color: "#9999FF" }}>Pr</span> },
  { name: "After Effects", node: <span className="font-black text-[15px]" style={{ color: "#9999FF" }}>Ae</span> },
];

// Order of the chapters = order of the story.
const TITLES = ["Hello", "Education", "Building", "Video", "Now", "Numbers", "What I do", "Tech"];
const TOTAL = TITLES.length;

const eyebrow = "font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70";

export default function AboutMobile() {
  const rm = !!useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Which chapter is centred? Derived from the scroll position (cheap, passive, rAF-throttled).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const slides = track.children;
      if (slides.length < 2) return;
      const step = (slides[1] as HTMLElement).offsetLeft - (slides[0] as HTMLElement).offsetLeft;
      if (step <= 0) return;
      setActive(Math.max(0, Math.min(TOTAL - 1, Math.round(track.scrollLeft / step))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      const slide = track?.children[Math.max(0, Math.min(TOTAL - 1, i))] as HTMLElement | undefined;
      if (!track || !slide) return;
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
        behavior: rm ? "auto" : "smooth",
      });
    },
    [rm],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
  };

  const nav =
    "st-nav grid h-12 w-12 place-items-center rounded-full border border-blue-200 bg-white/80 text-[#0b1530] shadow-sm disabled:opacity-35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";

  return (
    <section id="about" className="st-section" aria-label="About — My Story">
      <h2 className="sr-only">About Nikhil Paharia: the story behind the work</h2>

      {/* Story header: avatar ring + title, like a story viewer */}
      <div className="mx-auto mb-3 flex w-full max-w-[400px] items-center gap-3 px-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full p-[3px]" style={{ background: "conic-gradient(from 200deg,#1266F1,#ff6a1a,#7a2fd0,#1266F1)" }}>
          <span className="block h-full w-full overflow-hidden rounded-full bg-[#0b1f4d]">
            <img src={portrait} alt="" width={96} height={144} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight text-[#0b1530]">The Story <span className="text-primary">Behind the Work</span></p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">About me · {TOTAL} chapters</p>
        </div>
      </div>

      {/* Segmented progress — tap a segment to jump */}
      <div className="mx-auto mb-3 flex w-full max-w-[400px] gap-1.5 px-5" role="group" aria-label="Chapters">
        {TITLES.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Chapter ${i + 1}: ${t}`}
            aria-current={i === active ? "true" : undefined}
            className="group relative h-6 flex-1 focus-visible:outline-none"
          >
            <span
              className={`st-seg absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full group-focus-visible:ring-2 group-focus-visible:ring-primary ${
                i <= active ? "bg-[#1266F1]" : "bg-blue-200/70"
              }`}
            />
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        className="st-track"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="About me chapters — swipe sideways"
        onKeyDown={onKeyDown}
      >
        {/* 1 — Hello */}
        <article className="st-slide" aria-roledescription="slide" aria-label={`1 of ${TOTAL}: ${TITLES[0]}`} style={{ background: "linear-gradient(160deg,#0b1f4d 0%,#1266F1 100%)" }}>
          <p className={eyebrow}>Chapter 01 · Hello</p>
          <h3 className="mt-3 text-[34px] font-extrabold leading-[1.05] tracking-tight" style={{ fontFamily: 'Futura, "Futura PT", "Jost", "Century Gothic", sans-serif' }}>
            Hi, I&apos;m <span className="text-[#9fc4ff]">Nikhil.</span>
          </h3>
          <p className="mt-3 max-w-[270px] text-[15px] leading-relaxed text-white/85">
            A developer and video editor from Assam, passionate about building useful digital products and creating impactful visual stories.
          </p>
          <ul className="mt-4 flex max-w-[270px] flex-wrap gap-2">
            {CHIPS.map(({ Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <img
            src={portrait}
            alt="Nikhil Paharia"
            width={1080}
            height={1623}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute bottom-0 right-[-8%] h-[58%] w-auto select-none object-contain object-bottom"
          />
        </article>

        {/* 2–5 — Journey, one chapter per step */}
        {JOURNEY.map(({ Icon, title, text, year, when, bg }, i) => (
          <article key={title} className="st-slide" aria-roledescription="slide" aria-label={`${i + 2} of ${TOTAL}: ${title}`} style={{ background: bg }}>
            <div className="flex items-center justify-between">
              <p className={eyebrow}>Chapter 0{i + 2}</p>
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/25 bg-white/10" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="st-year mt-auto" aria-hidden="true">{year}</p>
            <h3 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight">{title}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-white/85">{text}</p>
            <span className="mt-4 inline-flex w-fit rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 font-mono text-xs font-semibold">{when}</span>
          </article>
        ))}

        {/* 6 — Numbers */}
        <article className="st-slide" aria-roledescription="slide" aria-label={`6 of ${TOTAL}: ${TITLES[5]}`} style={{ background: "linear-gradient(160deg,#08224f 0%,#1d6fe0 100%)" }}>
          <p className={eyebrow}>Chapter 06 · By the numbers</p>
          <dl className="mt-5 grid flex-1 grid-cols-2 gap-3">
            {STATS.map(({ Icon, value, label }) => (
              <div key={label} className="flex flex-col justify-between rounded-3xl border border-white/20 bg-white/10 p-4">
                <Icon className="h-5 w-5 text-[#9fc4ff]" aria-hidden="true" />
                <div>
                  <dt className="text-[40px] font-extrabold leading-none tracking-tight"><CountUp value={value} /></dt>
                  <dd className="mt-1.5 text-[13px] font-medium leading-snug text-white/80">{label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </article>

        {/* 7 — What I do */}
        <article className="st-slide" aria-roledescription="slide" aria-label={`7 of ${TOTAL}: ${TITLES[6]}`} style={{ background: "linear-gradient(160deg,#0b1f4d 0%,#12275f 100%)" }}>
          <p className={eyebrow}>Chapter 07 · What I do</p>
          <div className="mt-5 flex flex-1 flex-col gap-3">
            <div className="flex flex-1 flex-col justify-end rounded-3xl p-5" style={{ background: "linear-gradient(150deg,#1266F1,#0b3fa8)" }}>
              <Code2 className="mb-3 h-8 w-8" aria-hidden="true" />
              <h3 className="text-[22px] font-extrabold leading-tight">Full-Stack Development</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/85">Web apps, SaaS, eCommerce and custom solutions.</p>
            </div>
            <div className="flex flex-1 flex-col justify-end rounded-3xl p-5" style={{ background: "linear-gradient(150deg,#ff6a1a,#c2410c)" }}>
              <Video className="mb-3 h-8 w-8" aria-hidden="true" />
              <h3 className="text-[22px] font-extrabold leading-tight">Video Editing</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-white/90">Cinematic edits, reels, ads and brand storytelling.</p>
            </div>
          </div>
        </article>

        {/* 8 — Tech */}
        <article className="st-slide" aria-roledescription="slide" aria-label={`8 of ${TOTAL}: ${TITLES[7]}`} style={{ background: "linear-gradient(160deg,#101a3d 0%,#2a1d6b 100%)" }}>
          <p className={eyebrow}>Chapter 08 · Tech I use</p>
          <ul className="mt-5 grid flex-1 grid-cols-2 content-start gap-3">
            {TECH.map(({ name, node }) => (
              <li key={name} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[22px]" aria-hidden="true">{node}</span>
                <span className="text-[14px] font-semibold leading-tight">{name}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* Controls */}
      <div className="mx-auto mt-2 flex w-fit items-center gap-3">
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous chapter" className={nav}>
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-500" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")} · {TITLES[active]}
        </p>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === TOTAL - 1} aria-label="Next chapter" className={nav}>
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

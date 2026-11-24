import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { MapPin, CalendarDays, GraduationCap, Code2, Layers, Users, Trophy, Video, Rocket, Phone, ChevronLeft, ChevronRight, Play, Rewind, FastForward, BookOpen } from "lucide-react";
import { SiReact, SiNextdotjs, SiNodedotjs, SiMongodb, SiTailwindcss, SiTypescript, SiWhatsapp } from "react-icons/si";
import CountUp from "@/components/ui/CountUp";
import { getLenis } from "@/lib/smoothScroll";
import { PHONE_DISPLAY, PHONE_TEL, waLink } from "@/lib/contact";
import cloud from "../assets/images/cloud2.895414a23f99e60c66ea.webp";
import poster from "../assets/images/about-poster.webp";
import portrait from "../assets/images/about-portrait.webp";
import "./about-books.css";

/**
 * About — "Book shelf". Each chapter of my story is a 3D book on a floating shelf.
 * Click a book → the viewer opens: cover → spreads (retro control panel, PREV/NEXT BOOK, ESC to close).
 * Edit the BOOKS array to change content. Facts mirror AboutMobile / AboutHighlights.
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
const TECH: { name: string; node: ReactNode }[] = [
  { name: "React", node: <SiReact style={{ color: "#61DAFB" }} /> },
  { name: "Next.js", node: <SiNextdotjs /> },
  { name: "Node.js", node: <SiNodedotjs style={{ color: "#5FA04E" }} /> },
  { name: "MongoDB", node: <SiMongodb style={{ color: "#47A248" }} /> },
  { name: "Tailwind", node: <SiTailwindcss style={{ color: "#38BDF8" }} /> },
  { name: "TypeScript", node: <SiTypescript style={{ color: "#3178C6" }} /> },
  { name: "Premiere", node: <b style={{ color: "#6a5ae0" }}>Pr</b> },
  { name: "After Effects", node: <b style={{ color: "#6a5ae0" }}>Ae</b> },
];

type Spread = { l: ReactNode; r: ReactNode };
type Book = { id: string; title: string; no: string; bg: string; cover: ReactNode; spreads: Spread[] };

const Polaroid = ({ caption, className = "" }: { caption: string; className?: string }) => (
  <figure className={`ab-polaroid ${className}`}>
    <img src={portrait} alt="Nikhil Paharia" loading="lazy" decoding="async" />
    <figcaption className="ab-mono">{caption}</figcaption>
  </figure>
);

/** Standard cover: number, title, subtitle and a big outlined year. */
function CoverBody({ no, title, sub, year, extra }: { no: string; title: string; sub?: string; year?: string; extra?: ReactNode }) {
  return (
    <div className="ab-art-body">
      <p className="ab-art-no ab-mono">Book {no}</p>
      <h3 className="ab-art-title ab-display">{title}</h3>
      {sub && <p className="ab-art-sub">{sub}</p>}
      {extra}
      {year && <p className="ab-art-year ab-display" aria-hidden="true">{year}</p>}
    </div>
  );
}

const yearLeft = (year: string, title: string, Icon: typeof Code2) => (
  <>
    <Icon style={{ width: "11cqw", height: "11cqw" }} aria-hidden="true" />
    <p className="ab-art-year ab-display" style={{ fontSize: "36cqw", marginTop: "auto" }} aria-hidden="true">{year}</p>
    <h3 className="ab-h ab-display" style={{ marginTop: "4cqw" }}>{title}</h3>
  </>
);

const BOOKS: Book[] = [
  {
    id: "hello", title: "Hello", no: "01", bg: "#0a0a0a",
    cover: <img className="ab-art-img" src={poster} alt="" loading="lazy" decoding="async" />,
    spreads: [
      {
        l: (
          <>
            <p className="ab-eyebrow ab-mono">Chapter 01 · Hello</p>
            <h3 className="ab-h ab-display" style={{ fontSize: "17cqw", marginTop: "5cqw" }}>Hi, I&apos;m <span style={{ color: "#c8f31d" }}>Nikhil.</span></h3>
            <ul style={{ display: "flex", flexWrap: "wrap", gap: "2.4cqw", marginTop: "auto", listStyle: "none", padding: 0 }}>
              {CHIPS.map(({ Icon, label }) => (
                <li key={label} className="ab-chip"><Icon style={{ width: "4cqw", height: "4cqw" }} aria-hidden="true" />{label}</li>
              ))}
            </ul>
          </>
        ),
        r: (
          <>
            <p className="ab-body ab-serif">
              A developer and video editor from Assam, passionate about building <span className="ab-mark">useful digital products</span> and creating impactful visual stories.
            </p>
            <Polaroid caption="Assam · 2026" className="" />
          </>
        ),
      },
      {
        l: <img src={poster} alt="Poster: the art you want to create wants to be created by you" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />,
        r: (
          <>
            <p className="ab-eyebrow ab-mono">Quick facts</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: "6cqw", display: "grid", gap: "4cqw" }}>
              {CHIPS.map(({ Icon, label }) => (
                <li key={label} className="ab-body ab-serif" style={{ display: "flex", alignItems: "center", gap: "3cqw" }}>
                  <Icon style={{ width: "6cqw", height: "6cqw" }} aria-hidden="true" /> {label}
                </li>
              ))}
            </ul>
            <p className="ab-body ab-serif" style={{ marginTop: "auto" }}>Web apps by day, <span className="ab-mark">reels and edits</span> by night.</p>
          </>
        ),
      },
    ],
  },
  {
    id: "education", title: "Education", no: "02", bg: "linear-gradient(160deg,#0b1f4d 0%,#123a9c 100%)",
    cover: <CoverBody no="02" title="Education" sub="Where it started" year="2024" />,
    spreads: [{
      l: yearLeft("2024", "Education", GraduationCap),
      r: (
        <>
          <p className="ab-eyebrow ab-mono">2024 – Present</p>
          <p className="ab-body ab-serif" style={{ marginTop: "5cqw" }}><span className="ab-mark">BSc (Chemistry)</span></p>
          <p className="ab-body ab-serif" style={{ marginTop: "3cqw" }}>Jagiroad College, Gauhati University.</p>
        </>
      ),
    }],
  },
  {
    id: "building", title: "Building", no: "03", bg: "linear-gradient(160deg,#0c2a6b 0%,#1266F1 100%)",
    cover: <CoverBody no="03" title="Started Building" sub="Code, projects, first clients" year="2025" />,
    spreads: [{
      l: yearLeft("2025", "Started Building", Code2),
      r: (
        <>
          <p className="ab-eyebrow ab-mono">2025</p>
          <p className="ab-body ab-serif" style={{ marginTop: "5cqw" }}>Began learning <span className="ab-mark">web development</span> and working on real projects.</p>
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "2cqw", marginTop: "auto", listStyle: "none", padding: 0 }}>
            {TECH.slice(0, 6).map((t) => <li key={t.name} className="ab-chip dark">{t.node}{t.name}</li>)}
          </ul>
        </>
      ),
    }],
  },
  {
    id: "video", title: "Video", no: "04", bg: "linear-gradient(160deg,#2a1450 0%,#7a2fd0 100%)",
    cover: <CoverBody no="04" title="Video Editing" sub="Reels, ads, brand stories" year="2025" />,
    spreads: [{
      l: yearLeft("2025", "Video Editing", Video),
      r: (
        <>
          <p className="ab-eyebrow ab-mono">2025</p>
          <p className="ab-body ab-serif" style={{ marginTop: "5cqw" }}>Started creating <span className="ab-mark">videos, reels and brand content</span> for clients.</p>
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "2cqw", marginTop: "auto", listStyle: "none", padding: 0 }}>
            {TECH.slice(6).map((t) => <li key={t.name} className="ab-chip dark">{t.node}{t.name}</li>)}
          </ul>
        </>
      ),
    }],
  },
  {
    id: "now", title: "Now", no: "05", bg: "linear-gradient(160deg,#6b7a1c 0%,#4a5a12 100%)",
    cover: (
      <CoverBody
        no="05" title="Now" year="2026"
        extra={<div style={{ width: "58%", margin: "6cqw 0 0 auto" }}><Polaroid caption="2026" /></div>}
      />
    ),
    spreads: [
      {
        l: yearLeft("2026", "Now", Rocket),
        r: (
          <>
            <p className="ab-eyebrow ab-mono">2026</p>
            <p className="ab-body ab-serif" style={{ marginTop: "5cqw" }}>Building <span className="ab-mark">web apps</span>, helping businesses go online and creating impactful video content.</p>
          </>
        ),
      },
      {
        l: (
          <>
            <p className="ab-eyebrow ab-mono">Next chapter</p>
            <h3 className="ab-h ab-display" style={{ fontSize: "15cqw", marginTop: "5cqw" }}>Got an idea? <span style={{ color: "#c8f31d" }}>Let&apos;s make it.</span></h3>
          </>
        ),
        r: (
          <>
            <p className="ab-body ab-serif">Tell me what you need. You get a clear quote within 24–48 hours.</p>
            <div style={{ display: "grid", gap: "3cqw", marginTop: "auto" }}>
              <a className="ab-cta" style={{ background: "#25D366", color: "#05210f" }} href={waLink("Hi Nikhil, I read your About page and would like to discuss a project.")} target="_blank" rel="noopener noreferrer">
                <SiWhatsapp aria-hidden="true" /> Start a project
              </a>
              <a className="ab-cta" style={{ background: "#0b1020", color: "#fff" }} href={`tel:${PHONE_TEL}`}>
                <Phone style={{ width: "1em", height: "1em" }} aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: "numbers", title: "Numbers", no: "06", bg: "linear-gradient(160deg,#08224f 0%,#1d6fe0 100%)",
    cover: <CoverBody no="06" title="By the Numbers" sub="Work so far" year="10+" />,
    spreads: [{
      l: (
        <>
          <p className="ab-eyebrow ab-mono">Chapter 06</p>
          <h3 className="ab-h ab-display" style={{ fontSize: "15cqw", marginTop: "5cqw" }}>By the <span style={{ color: "#c8f31d" }}>numbers</span></h3>
          <Trophy style={{ width: "14cqw", height: "14cqw", marginTop: "auto" }} aria-hidden="true" />
        </>
      ),
      r: (
        <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.4cqw", margin: 0 }}>
          {STATS.map(({ label, value }) => (
            <div key={label} className="ab-stat">
              <dt className="sr-only">{label}</dt>
              <b className="ab-display"><CountUp value={value} /></b>
              <dd style={{ margin: 0 }}><span>{label}</span></dd>
            </div>
          ))}
        </dl>
      ),
    }],
  },
  {
    id: "what", title: "What I do", no: "07", bg: "linear-gradient(160deg,#c2410c 0%,#ff6a1a 100%)",
    cover: <CoverBody no="07" title="What I Do" sub="Two crafts, one studio" year="2×" />,
    spreads: [{
      l: (
        <>
          <p className="ab-eyebrow ab-mono">Chapter 07</p>
          <h3 className="ab-h ab-display" style={{ fontSize: "15cqw", marginTop: "5cqw" }}>What <span style={{ color: "#fff3c4" }}>I do</span></h3>
          <Layers style={{ width: "14cqw", height: "14cqw", marginTop: "auto" }} aria-hidden="true" />
        </>
      ),
      r: (
        <div style={{ display: "grid", gap: "5cqw" }}>
          <div>
            <Code2 style={{ width: "8cqw", height: "8cqw", color: "#1266F1" }} aria-hidden="true" />
            <h4 className="ab-display" style={{ fontSize: "6.6cqw", margin: "2cqw 0 1cqw" }}>Full-Stack Development</h4>
            <p style={{ fontSize: "4.4cqw", lineHeight: 1.4 }} className="ab-serif">Web apps, SaaS, eCommerce and custom solutions.</p>
          </div>
          <div>
            <Video style={{ width: "8cqw", height: "8cqw", color: "#ea580c" }} aria-hidden="true" />
            <h4 className="ab-display" style={{ fontSize: "6.6cqw", margin: "2cqw 0 1cqw" }}>Video Editing</h4>
            <p style={{ fontSize: "4.4cqw", lineHeight: 1.4 }} className="ab-serif">Cinematic edits, reels, ads and brand storytelling.</p>
          </div>
        </div>
      ),
    }],
  },
  {
    id: "tech", title: "Tech", no: "08", bg: "linear-gradient(160deg,#101a3d 0%,#2a1d6b 100%)",
    cover: <CoverBody no="08" title="Tech I Use" sub="The toolbox" year="</>" />,
    spreads: [{
      l: (
        <>
          <p className="ab-eyebrow ab-mono">Chapter 08</p>
          <h3 className="ab-h ab-display" style={{ fontSize: "15cqw", marginTop: "5cqw" }}>Tech <span style={{ color: "#c8f31d" }}>I use</span></h3>
          <Code2 style={{ width: "14cqw", height: "14cqw", marginTop: "auto" }} aria-hidden="true" />
        </>
      ),
      r: (
        <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3cqw", listStyle: "none", padding: 0, margin: 0 }}>
          {TECH.map((t) => (
            <li key={t.name} className="ab-chip dark" style={{ fontSize: "4.2cqw", padding: "3cqw" }}>
              <span aria-hidden="true" style={{ fontSize: "6cqw", display: "grid", placeItems: "center" }}>{t.node}</span>{t.name}
            </li>
          ))}
        </ul>
      ),
    }],
  },
];

const TOTAL = BOOKS.length;
const lastDrag = { current: 0 }; // time of the last swipe, so a swipe never counts as a click
const pad = (n: number) => String(n).padStart(2, "0");

function Cover({ b }: { b: Book }) {
  return <div className="ab-art" style={{ background: b.bg }}>{b.cover}</div>;
}

/* ------------------------------------------------------------------ viewer */

function BookViewer({ index, onClose, onChange }: { index: number; onClose: () => void; onChange: (i: number) => void }) {
  const rm = !!useReducedMotion();
  const book = BOOKS[index];
  const n = book.spreads.length;
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 759px)").matches);
  const [f, setF] = useState(0); // 0 = cover; wide: spread s = ceil(f/2); narrow: page f of 2n
  const [closing, setClosing] = useState(false);
  const dir = useRef<"next" | "back">("next");
  const swipe = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 759px)");
    const fn = () => setNarrow(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => { setF(0); }, [index]);

  const s = f === 0 ? 0 : Math.ceil(f / 2);
  const last = narrow ? f === n * 2 : s === n;
  const total = narrow ? n * 2 : n;
  const pos = narrow ? f : s;

  const nextBook = useCallback(() => onChange((index + 1) % TOTAL), [index, onChange]);
  const prevBook = useCallback(() => onChange((index - 1 + TOTAL) % TOTAL), [index, onChange]);

  const next = useCallback(() => {
    dir.current = "next";
    if (f === 0) return setF(1);
    if (last) return nextBook();
    setF(narrow ? f + 1 : s * 2 + 1);
  }, [f, last, narrow, s, nextBook]);
  const back = useCallback(() => {
    dir.current = "back";
    if (f === 0) return;
    if (narrow) return setF(f - 1);
    setF(s <= 1 ? 0 : (s - 1) * 2 - 1);
  }, [f, narrow, s]);

  const close = useCallback(() => {
    if (rm) return onClose();
    setClosing(true);
    window.setTimeout(onClose, 130);
  }, [rm, onClose]);

  const h = useRef({ next, back, close });
  h.current = { next, back, close };

  // Lock scroll, focus management, key handling.
  useEffect(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return h.current.close();
      if (e.key === "ArrowRight") { e.preventDefault(); return h.current.next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); return h.current.back(); }
      if (e.key === "Tab" && rootRef.current) {
        const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]")).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      returnTo.current?.focus?.();
    };
  }, []);

  const spread = book.spreads[Math.max(0, s - 1)];
  const leftStyle: CSSProperties = { background: book.bg };
  const crt = f === 0 ? ["SIDE A", "COVER"] : ["PLAY ▶", `${pad(pos)}/${pad(total)}`];

  return createPortal(
    <div ref={rootRef} className={`ab-viewer${closing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-label={`Book ${book.no} of ${pad(TOTAL)}: ${book.title}`}>
      <div className={`ab-v-in${narrow ? " ab-narrow" : ""}`}>
        <div className="ab-v-top">
          <div>
            <span className="ab-tag ab-mono"><Play className="h-3 w-3" aria-hidden="true" fill="currentColor" /> Book {book.no} / {pad(TOTAL)}</span>
            <h3 className="ab-v-title ab-serif">{book.title}</h3>
          </div>
          <button ref={closeRef} type="button" className="ab-close" onClick={close} aria-label="Close book (Escape)">
            <span className="sw ab-mono"><span>ON</span><span>OFF</span></span>
            <small className="ab-mono">CLOSE · ESC</small>
          </button>
        </div>

        <div
          className={`ab-book-wrap${narrow ? " ab-narrow" : ""}`}
          data-closed={f === 0}
          data-dir={dir.current}
          onPointerDown={(e) => { swipe.current = e.clientX; }}
          onPointerUp={(e) => {
            const x0 = swipe.current; swipe.current = null;
            if (x0 === null) return;
            const dx = e.clientX - x0;
            if (Math.abs(dx) > 50) { lastDrag.current = Date.now(); dx < 0 ? h.current.next() : h.current.back(); }
          }}
        >
          {narrow ? (
            <div className="ab-pagebox" key={f} onClick={f === 0 ? () => { if (Date.now() - lastDrag.current > 350) next(); } : undefined} role={f === 0 ? "button" : undefined} aria-label={f === 0 ? "Open the book" : undefined} tabIndex={f === 0 ? 0 : undefined} onKeyDown={(e) => { if (f === 0 && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); } }}>
              {f === 0 ? <Cover b={book} /> : f % 2 === 1 ? (
                <div className="ab-page-in ab-pcolor" style={{ ...leftStyle, position: "relative" }} onClick={() => { if (Date.now() - lastDrag.current > 350) next(); }}>{book.spreads[(f - 1) / 2].l}</div>
              ) : (
                <div className="ab-page-in ab-paper" onClick={() => { if (Date.now() - lastDrag.current > 350) next(); }}>{book.spreads[f / 2 - 1].r}</div>
              )}
            </div>
          ) : (
            <>
              <div className="ab-spread-shadow" aria-hidden="true" style={{ opacity: f === 0 ? 0 : 1 }} />
              <div className="ab-pagebox L ab-clickable" onClick={() => { if (Date.now() - lastDrag.current > 350) back(); }} style={{ opacity: f === 0 ? 0 : 1, transition: `opacity 0s linear ${f > 0 ? 260 : 0}ms` }}>
                <div className="ab-page-in ab-pcolor" key={`l${s}`} style={{ ...leftStyle, position: "relative" }}>{spread.l}</div>
              </div>
              <div className="ab-pagebox R ab-paper ab-clickable" onClick={() => { if (Date.now() - lastDrag.current > 350) next(); }}>
                <div className="ab-page-in" key={`r${s}`}>{spread.r}</div>
              </div>
              <div className="ab-flip" data-open={f > 0} onClick={f === 0 ? next : undefined} role={f === 0 ? "button" : undefined} aria-label={f === 0 ? "Open the book" : undefined} aria-hidden={f > 0 ? true : undefined} tabIndex={f === 0 ? 0 : -1} onKeyDown={(e) => { if (f === 0 && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); } }} style={{ cursor: f === 0 ? "pointer" : "default", pointerEvents: f > 0 ? "none" : "auto" }}>
                <div className="face"><Cover b={book} /></div>
                <div className="face back" />
              </div>
            </>
          )}
        </div>

        <div className="ab-panel ab-mono" role="group" aria-label="Page controls">
          <button type="button" className="ab-key" onClick={back} disabled={f === 0} aria-label="Previous page"><Rewind className="h-4 w-4" aria-hidden="true" fill="currentColor" />BACK</button>
          <div className="ab-crt" aria-live="polite"><div><small>{crt[0]}</small><strong>{crt[1]}</strong></div></div>
          <button type="button" className="ab-green" onClick={next} aria-label={f === 0 ? "Open the book" : last ? "Next book" : "Next page"}>
            {f === 0 ? <BookOpen className="h-4 w-4" aria-hidden="true" /> : <FastForward className="h-4 w-4" aria-hidden="true" fill="currentColor" />}
            {f === 0 ? "OPEN" : last ? "NEXT BOOK" : "NEXT"}
          </button>
        </div>

        <div className="ab-row">
          <button type="button" className="ab-pill ab-mono" onClick={prevBook}>‹ Prev book</button>
          <div className="ab-leds" role="group" aria-label="Books">
            {BOOKS.map((b, i) => (
              <button key={b.id} type="button" className="ab-led" aria-label={`Book ${i + 1}: ${b.title}`} aria-current={i === index ? "true" : undefined} onClick={() => onChange(i)} />
            ))}
          </div>
          <button type="button" className="ab-pill ab-mono" onClick={nextBook}>Next book ›</button>
        </div>
        <p className="ab-hint ab-mono"><span className="desk">[ ← → ] Turn pages · </span>[ Click ] the book · [ Esc ] Close</p>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ shelf */

export default function AboutBooks() {
  const rm = !!useReducedMotion();
  const [active, setActive] = useState(2);
  const [open, setOpen] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || rm || typeof IntersectionObserver === "undefined") { setReady(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setReady(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [rm]);
  const drag = useRef<{ x: number } | null>(null);
  const clamp = (i: number) => Math.max(0, Math.min(TOTAL - 1, i));

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setActive((a) => clamp(a + 1)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setActive((a) => clamp(a - 1)); }
  };

  return (
    <section id="about" className="ab-section" aria-label="About — the story behind the work">
      <img src={cloud} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ab-cloud ab-cloud--1" />
      <img src={cloud} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ab-cloud ab-cloud--3" />
      <img src={cloud} alt="" aria-hidden="true" loading="lazy" decoding="async" className="ab-cloud ab-cloud--2" />

      <div className="container-tight relative z-10">
        <div className="mb-2 text-center">
          <span className="ab-tag ab-mono"><Play className="h-3 w-3" aria-hidden="true" fill="currentColor" /> Book {pad(active + 1)} / {pad(TOTAL)}</span>
          <h2 className="ab-display mt-3 text-3xl md:text-5xl">The story <span style={{ color: "#1266F1" }}>behind the work</span></h2>
          <p className="mx-auto mt-2 max-w-md text-sm opacity-80">Pick a book and open it. Eight short chapters about who I am and what I make.</p>
        </div>

        <div
          ref={stageRef}
          className="ab-stage"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="About me books — use left and right arrows"
          onKeyDown={onKey}
          onPointerDown={(e) => { drag.current = { x: e.clientX }; }}
          onPointerUp={(e) => {
            const d = drag.current; drag.current = null;
            if (!d) return;
            const dx = e.clientX - d.x;
            if (Math.abs(dx) > 45) { setActive((a) => clamp(a + (dx < 0 ? 1 : -1))); lastDrag.current = Date.now(); }
          }}
        >
          {BOOKS.map((b, i) => {
            const o = i - active;
            const a = Math.abs(o);
            const style: CSSProperties = {
              transform: ready
                ? `translateX(calc(var(--bw) * ${o * 0.86})) translateZ(${-a * 150}px) rotateY(${-o * 32}deg)`
                : `translateX(0) translateZ(-300px) rotateY(0deg) scale(.9)`,
              opacity: !ready || a > 2 ? 0 : 1,
              transitionDelay: ready && !rm ? `${a * 70}ms` : "0ms",
              zIndex: 10 - a,
              pointerEvents: a > 2 ? "none" : "auto",
              filter: a === 0 ? "none" : `brightness(${1 - a * 0.12})`,
              ...(rm ? { transition: "none" } : null),
            };
            return (
              <button
                key={b.id}
                type="button"
                className="ab-book interactive"
                data-active={a === 0}
                style={style}
                tabIndex={a === 0 ? 0 : -1}
                aria-label={a === 0 ? `Open book ${i + 1} of ${TOTAL}: ${b.title}` : `Show book ${i + 1}: ${b.title}`}
                onClick={() => {
                  if (Date.now() - lastDrag.current < 350) return;
                  if (a === 0) setOpen(i); else setActive(i);
                }}
              >
                <span className="ab-book-in">
                  <Cover b={b} />
                  {a === 0 && <span className="ab-sticker ab-mono" aria-hidden="true">Open ↗</span>}
                  <span className="ab-shadow" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="ab-ctrl">
          <button type="button" className="ab-round" onClick={() => setActive((a) => clamp(a - 1))} disabled={active === 0} aria-label="Previous book"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <p className="ab-mono min-w-[150px] text-center text-xs font-bold uppercase tracking-widest" aria-live="polite">{pad(active + 1)} / {pad(TOTAL)} · {BOOKS[active].title}</p>
          <button type="button" className="ab-round" onClick={() => setActive((a) => clamp(a + 1))} disabled={active === TOTAL - 1} aria-label="Next book"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <p className="ab-hint ab-mono mt-3">Click the centre book to open it</p>
      </div>

      {open !== null && <BookViewer index={open} onClose={() => setOpen(null)} onChange={setOpen} />}
    </section>
  );
}


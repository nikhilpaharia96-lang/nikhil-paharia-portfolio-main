import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import {
  ExternalLink,
  FileText,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiFirebase,
  SiTailwindcss,
  SiGithub,
  SiChartdotjs,
  SiFramer,
} from "react-icons/si";

import img1 from "../assets/images/project-1.png"; // StudyNova
import img2 from "../assets/images/project-2.png"; // Abodiverse
import img3 from "../assets/images/project-3.png"; // Xarena
import img4 from "../assets/images/project-4.png"; // Travel Diaries
import img5 from "../assets/images/project-5.png"; // CreatorHub
import img6 from "../assets/images/project-6.png"; // Portfolio Website

const ease = [0.16, 1, 0.3, 1] as const;
const FONT_TITLE = "'Caveat', cursive";
const FONT_NOTE = "'Kalam', cursive";

/* ── official tech logos ─────────────────────────────────── */
type TechIconProps = { size?: number; className?: string; style?: React.CSSProperties };

function DiPremiereProIcon({ size = 14, className, style }: TechIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width={size} height={size} className={className} style={style} aria-hidden="true">
      <path fill="#2A0634" d="M50.3 38.5h-7.4v20.7h7.4c5 0 9.1-4.1 9.1-9.1v-2.4c0-5.1-4.1-9.2-9.1-9.2z" />
      <path fill="#2A0634" d="M0 0v128h128V0H0zm51.2 67.5h-8.3v21.3h-9.6V30.3h18.5c9.4-.1 17.1 7.4 17.2 16.8v2.3c0 9.9-8 18-17.8 18.1zm46.1-14.2s-7 0-10.1 1.3v34.2H77.1V48.9s10.2-5.1 20.2-3.8v8.2z" />
    </svg>
  );
}
function DiAfterEffectsIcon({ size = 14, className, style }: TechIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width={size} height={size} className={className} style={style} aria-hidden="true">
      <path fill="#1F0740" d="M87 52.4c-7.5.9-7.5 9.2-7.5 9.2h14.9c.1 0 .8-9.2-7.4-9.2zM38.2 63.1H51l-6.4-24.4z" />
      <path fill="#1F0740" d="M0 0v128h128V0H0zm57.5 88.6L53 72.5H36.2l-4.4 16.1h-9.4l16-54.9v-3.8h12.2l17.3 58.7H57.5zm46-19.6h-24c1.9 19.2 21.2 10 21.2 10v8s-1.3 2.6-14.8 2.6-16.3-18.3-16.3-18.3v-4.7s1.3-22 17.3-22 16.5 14.6 16.5 14.6V69z" />
    </svg>
  );
}
function ReactNativeIcon(props: TechIconProps) { return <SiReact {...props} />; }

const TECH_ICONS: Record<string, { Icon: React.ComponentType<TechIconProps>; color: string }> = {
  "react":                { Icon: SiReact,            color: "#61DAFB" },
  "react native":         { Icon: ReactNativeIcon,     color: "#61DAFB" },
  "node.js":              { Icon: SiNodedotjs,         color: "#339933" },
  "mongodb":               { Icon: SiMongodb,           color: "#47A248" },
  "firebase":              { Icon: SiFirebase,          color: "#FFCA28" },
  "tailwind":              { Icon: SiTailwindcss,       color: "#06B6D4" },
  "github":                { Icon: SiGithub,            color: "#181717" },
  "chart.js":              { Icon: SiChartdotjs,        color: "#FF6384" },
  "framer motion":         { Icon: SiFramer,            color: "#0055FF" },
  "adobe premiere pro":    { Icon: DiPremiereProIcon,   color: "#2A0634" },
  "after effects":         { Icon: DiAfterEffectsIcon,  color: "#1F0740" },
};
function getTechIcon(tag: string) {
  return TECH_ICONS[tag.trim().toLowerCase()] ?? null;
}

/* ── project data — corrected to match what's actually on each screenshot ── */
type Status = "Live" | "Case Study" | "In Progress";
type Tone = "cream" | "blue" | "ink";

interface Project {
  id: number;
  number: string;
  title: string;
  category: string;
  filterKey: string;
  tagline: string;
  status: Status;
  tone: Tone;
  accentColor: string;
  overview: string;
  features: string[];
  tech: string[];
  timeline: string;
  narrative: boolean; // whether Problem/Solution/Impact makes sense for this project
  problem?: string;
  solution?: string;
  impact?: string;
  metrics: { screens: string; components: string; apis: string; score: string };
  image: string;
  imagePosition: string;
  live: string;
  github: string | null;
  caseStudy: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    number: "01",
    title: "StudyNova",
    category: "AI & EdTech",
    filterKey: "AI",
    tagline: "AI study companion that turns lectures into exam-ready notes.",
    status: "Live",
    tone: "blue",
    accentColor: "#1d6feb",
    overview: "StudyNova is an all-in-one AI study companion — it records lectures, transcribes them in real time, and restructures the transcript into clean, organised notes students can actually revise from.",
    features: ["Live lecture recording & transcription", "AI-generated structured notes", "AI doubt-solving teacher", "Exam booster & practice tools"],
    tech: ["React", "Node.js", "MongoDB"],
    timeline: "6 weeks",
    narrative: true,
    problem: "Students lose focus keeping up with fast lectures while trying to write usable notes at the same time.",
    solution: "An AI pipeline that listens, transcribes and restructures a lecture into headings, key points and formulas automatically.",
    impact: "A complete end-to-end product build — onboarding, recording flow, AI note generation and a study dashboard.",
    metrics: { screens: "10+", components: "45+", apis: "12+", score: "98%" },
    image: img1,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
  },
  {
    id: 2,
    number: "02",
    title: "Abodiverse",
    category: "PropTech / Web App",
    filterKey: "Web",
    tagline: "Verified rooms, PGs & rentals in Jagiroad, Assam — zero brokerage.",
    status: "Case Study",
    tone: "cream",
    accentColor: "#7c3aed",
    overview: "Abodiverse helps people find and book verified rooms, PGs, hostels and rentals around Jagiroad, Assam — built for people relocating for work or college who don't want to deal with brokers.",
    features: ["Verified property listings", "Location & budget filters", "Category browsing (PG, hostel, flats)", "Zero-brokerage booking flow"],
    tech: ["React", "Firebase", "Tailwind"],
    timeline: "4 weeks",
    narrative: true,
    problem: "Finding a trustworthy place to stay near colleges or job hubs in smaller towns usually means dealing with pushy brokers and no verified listings.",
    solution: "A local rental marketplace with verified listings, transparent pricing, and instant search by category and budget.",
    impact: "Designed specifically for a real local market (Jagiroad) instead of a generic template — grounded in an actual gap.",
    metrics: { screens: "08+", components: "30+", apis: "06+", score: "95%" },
    image: img2,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
  },
  {
    id: 3,
    number: "03",
    title: "Xarena",
    category: "Gaming / Web App",
    filterKey: "Gaming",
    tagline: "Tournament hub for gamers and organizers.",
    status: "In Progress",
    tone: "ink",
    accentColor: "#059669",
    overview: "Xarena is a tournament hub where organizers can host competitions and gamers can register, track live matches and follow brackets — all in one place instead of scattered Discord threads and spreadsheets.",
    features: ["Tournament creation & registration", "Live match tracking", "Real-time brackets & scores", "Multi-game support"],
    tech: ["React Native", "Node.js", "MongoDB"],
    timeline: "5 weeks (ongoing)",
    narrative: true,
    problem: "Organizing and discovering community gaming tournaments is scattered across Discord servers, spreadsheets and DMs.",
    solution: "One hub to create, join and follow tournaments with live scores and brackets.",
    impact: "Currently in active development — core tournament and match-tracking flows are built and being refined.",
    metrics: { screens: "12+", components: "25+", apis: "10+", score: "—" },
    image: img3,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
  },
  {
    id: 4,
    number: "04",
    title: "Travel Diaries",
    category: "Video Editing",
    filterKey: "Video",
    tagline: "A cinematic travel series — this episode: Cherrapunji, Meghalaya.",
    status: "Live",
    tone: "blue",
    accentColor: "#d97706",
    overview: "A cinematic travel video series capturing India's lesser-seen landscapes. This episode follows the misty cliffs and waterfalls of Cherrapunji, Meghalaya — shot, graded and edited end to end.",
    features: ["4K cinematic color grading", "Drone + handheld hybrid footage", "Custom sound design", "Story-driven edit"],
    tech: ["Adobe Premiere Pro", "After Effects"],
    timeline: "1 week shoot + edit",
    narrative: false,
    metrics: { screens: "03+", components: "08+", apis: "4K", score: "96%" },
    image: img4,
    imagePosition: "object-center",
    live: "#",
    github: null,
    caseStudy: "#",
  },
  {
    id: 5,
    number: "05",
    title: "CreatorHub",
    category: "Marketplace / Dashboard",
    filterKey: "Web",
    tagline: "A digital marketplace concept for creators, with a sales dashboard.",
    status: "Case Study",
    tone: "cream",
    accentColor: "#1d6feb",
    overview: "CreatorHub is a marketplace concept where creators can sell templates, courses and digital assets from one storefront, with an analytics dashboard to track orders and revenue.",
    features: ["Product marketplace & storefront", "Creator analytics dashboard", "Order & revenue tracking", "Category browsing"],
    tech: ["React", "Tailwind", "Chart.js"],
    timeline: "3 weeks",
    narrative: true,
    problem: "Creators selling digital products often stitch together several disconnected tools just to sell and track sales.",
    solution: "One storefront + dashboard experience for listing products and watching performance in real time.",
    impact: "A full UI/UX exercise in balancing a consumer storefront with a data-dense creator dashboard.",
    metrics: { screens: "09+", components: "20+", apis: "08+", score: "96%" },
    image: img5,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
  },
  {
    id: 6,
    number: "06",
    title: "Portfolio Website",
    category: "Personal Site",
    filterKey: "Web",
    tagline: "This very site — built with love, precision and purpose.",
    status: "Live",
    tone: "ink",
    accentColor: "#1d6feb",
    overview: "The site you're on right now — a handcrafted, cinematically-animated portfolio designed and built from scratch, no template shortcuts.",
    features: ["Cinematic scroll-driven motion", "Custom design system", "Fully responsive & accessible", "Built from scratch"],
    tech: ["React", "Tailwind", "Framer Motion"],
    timeline: "Ongoing",
    narrative: false,
    metrics: { screens: "10+", components: "60+", apis: "05+", score: "99%" },
    image: img6,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
  },
];

const FILTER_TABS = [
  { label: "All", key: "All" },
  { label: "Web Apps", key: "Web" },
  { label: "AI & EdTech", key: "AI" },
  { label: "Gaming", key: "Gaming" },
  { label: "Video", key: "Video" },
];

const STATUS_STYLES: Record<Status, { dot: string; bg: string; text: string }> = {
  Live:          { dot: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  "Case Study":  { dot: "bg-blue-500",    bg: "bg-blue-50 border-blue-200",       text: "text-blue-700" },
  "In Progress": { dot: "bg-amber-500",   bg: "bg-amber-50 border-amber-200",     text: "text-amber-700" },
};

const TONE_STYLES: Record<Tone, { bg: string; text: string; sub: string; border: string }> = {
  cream: { bg: "#F7F2E7", text: "#1a1a1a", sub: "#6b6456", border: "rgba(0,0,0,0.08)" },
  blue:  { bg: "#1d6feb", text: "#ffffff", sub: "rgba(255,255,255,0.75)", border: "rgba(255,255,255,0.18)" },
  ink:   { bg: "#14161c", text: "#ffffff", sub: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.1)" },
};

/* ── tiny hand-drawn decorations (kept subtle, used sparingly) ── */
function TapeStrip({ className = "", rotate = -4 }: { className?: string; rotate?: number }) {
  return (
    <div
      className={`pointer-events-none absolute h-6 w-20 ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(230,222,200,0.75))",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        transform: `rotate(${rotate}deg)`,
        opacity: 0.85,
      }}
    />
  );
}

function InkStar({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} width="16" height="16" fill="none" stroke="#1d6feb" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" strokeLinejoin="round" />
    </svg>
  );
}

function SquigglyArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 40" className={className} width="90" height="40" fill="none" aria-hidden="true">
      <path
        d="M2 8c14 0 10 20 24 20s10-24 26-22 14 18 34 16"
        stroke="#1d6feb" strokeWidth="2" strokeLinecap="round" fill="none"
      />
      <path d="M78 16l8 6-9 4" stroke="#1d6feb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function CoffeeStain({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: 90, height: 90,
        border: "2px solid rgba(120,72,38,0.10)",
        boxShadow: "inset 0 0 0 6px rgba(120,72,38,0.04)",
        ...style,
      }}
    />
  );
}

/** Highlighter marker effect behind a word, drawn with CSS only. */
function Highlight({ children, color = "#1d6feb" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="relative inline-block px-1"
      style={{
        background: `linear-gradient(120deg, ${color}30 0%, ${color}30 100%)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 45%",
        backgroundPosition: "0 78%",
      }}
    >
      {children}
    </span>
  );
}

/* ── tech chip ─────────────────────────────────────────────── */
function TechChip({ tag }: { tag: string }) {
  const tech = getTechIcon(tag);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full
                      bg-white border border-slate-200 text-slate-600">
      {tech && <tech.Icon size={12} style={{ color: tech.color }} className="shrink-0" />}
      {tag}
    </span>
  );
}

/* ── compact "peeking" folder tab (shown behind the active one) ── */
function FolderPeek({
  project, depth, onSelect,
}: { project: Project; depth: number; onSelect: () => void }) {
  const tone = TONE_STYLES[project.tone];
  const statusStyle = STATUS_STYLES[project.status];
  const reduced = useReducedMotion();

  return (
    <motion.div
      layoutId={`folder-${project.id}`}
      layout
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      role="button"
      tabIndex={0}
      aria-label={`Bring ${project.title} to front`}
      initial={false}
      animate={{
        y: depth * 14,
        scale: 1 - depth * 0.025,
        rotate: reduced ? 0 : (depth % 2 === 0 ? -1 : 1) * (depth * 0.6),
      }}
      whileHover={reduced ? {} : { y: depth * 14 - 6, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="absolute inset-x-0 top-0 h-16 sm:h-[72px] rounded-t-2xl rounded-b-lg cursor-pointer
                 flex items-center gap-3 sm:gap-4 px-5 sm:px-7 border shadow-[0_10px_24px_-10px_rgba(15,23,42,0.35)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      style={{
        background: tone.bg,
        borderColor: tone.border,
        zIndex: 20 - depth,
      }}
    >
      <span
        className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-black shrink-0"
        style={{ background: "rgba(0,0,0,0.08)", color: tone.text }}
      >
        {project.number}
      </span>
      <span className="font-black text-sm sm:text-base tracking-tight truncate" style={{ color: tone.text }}>
        {project.title}
      </span>
      <span className="hidden sm:block text-xs truncate flex-1" style={{ color: tone.sub }}>
        {project.tagline}
      </span>
      <span className={`ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
        {project.status}
      </span>
    </motion.div>
  );
}

/* ── the fully expanded, front-of-stack folder ───────────────── */
function FolderExpanded({
  project, onNext, onPrev, total, position,
}: { project: Project; onNext: () => void; onPrev: () => void; total: number; position: number }) {
  const tone = TONE_STYLES[project.tone];
  const statusStyle = STATUS_STYLES[project.status];

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -500) onNext();
    else if (info.offset.x > 80 || info.velocity.x > 500) onPrev();
  }, [onNext, onPrev]);

  return (
    <motion.div
      layoutId={`folder-${project.id}`}
      layout
      drag={total > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden border shadow-[0_30px_70px_-20px_rgba(15,23,42,0.35)] cursor-grab active:cursor-grabbing"
      style={{ background: tone.bg, borderColor: tone.border, zIndex: 30 }}
    >
      {/* folder header strip */}
      <div className="flex items-center gap-3 sm:gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
        <span
          className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-black shrink-0"
          style={{ background: "rgba(0,0,0,0.08)", color: tone.text }}
        >
          {project.number}
        </span>
        <div className="min-w-0">
          <h3 className="font-black text-lg sm:text-2xl tracking-tight leading-none" style={{ color: tone.text }}>
            {project.title}
          </h3>
          <p className="text-[11px] sm:text-xs mt-1 truncate" style={{ color: tone.sub }}>{project.category}</p>
        </div>
        <span className={`ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {project.status}
        </span>
      </div>

      {/* screenshot */}
      <div className="relative mx-4 sm:mx-6 rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-slate-900 select-none">
        <img
          src={project.image}
          alt={`${project.title} — screenshot`}
          draggable={false}
          className={`w-full h-full object-cover ${project.imagePosition} pointer-events-none`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* body */}
      <div className="p-5 sm:p-7 pt-5 sm:pt-6" style={{ color: tone.text }}>
        <p className="text-sm sm:text-[15px] leading-relaxed max-w-2xl" style={{ color: tone.sub }}>
          {project.overview}
        </p>

        <div className="grid sm:grid-cols-2 gap-2.5 mt-5">
          {project.features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-xs sm:text-[13px]">
              <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: project.accentColor }} />
              <span style={{ color: tone.sub }}>{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {project.tech.map((t) => <TechChip key={t} tag={t} />)}
        </div>

        {project.narrative && (
          <div className="grid sm:grid-cols-3 gap-3 mt-6 rounded-2xl p-4" style={{ background: "rgba(0,0,0,0.06)" }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: tone.sub }}>Problem</p>
              <p className="text-xs leading-relaxed" style={{ color: tone.sub }}>{project.problem}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: tone.sub }}>Solution</p>
              <p className="text-xs leading-relaxed" style={{ color: tone.sub }}>{project.solution}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: tone.sub }}>Impact</p>
              <p className="text-xs leading-relaxed" style={{ color: tone.sub }}>{project.impact}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mt-6 rounded-2xl p-3.5" style={{ background: "rgba(0,0,0,0.06)" }}>
          {[
            { label: "Screens", value: project.metrics.screens },
            { label: "Components", value: project.metrics.components },
            { label: "APIs", value: project.metrics.apis },
            { label: "Timeline", value: project.timeline.split(" ")[0] },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-sm sm:text-base font-black">{m.value}</p>
              <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide" style={{ color: tone.sub }}>{m.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6 text-xs font-bold">
          <a
            href={project.live}
            target="_blank" rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white"
            style={{ background: project.accentColor }}
          >
            <ExternalLink size={13} /> Live Demo
          </a>
          <a
            href={project.github ?? project.live}
            target="_blank" rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl"
            style={{ background: "rgba(0,0,0,0.08)", color: tone.text }}
          >
            <SiGithub size={13} /> Code
          </a>
          <a
            href={project.caseStudy}
            target="_blank" rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl"
            style={{ background: "rgba(0,0,0,0.08)", color: tone.text }}
          >
            <FileText size={13} /> Case Study
          </a>
        </div>
      </div>

      {/* prev/next controls */}
      {total > 1 && (
        <div className="flex items-center justify-between px-5 sm:px-7 pb-5 sm:pb-6 pt-1">
          <button
            onClick={onPrev}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Previous project"
            className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-2"
            style={{ background: "rgba(0,0,0,0.08)", color: tone.text }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-[11px] font-bold" style={{ color: tone.sub }}>
            {position + 1} / {total}
          </span>
          <button
            onClick={onNext}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Next project"
            className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-2"
            style={{ background: "rgba(0,0,0,0.08)", color: tone.text }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ── the folder stack itself ─────────────────────────────────── */
function FolderStack({ projects }: { projects: Project[] }) {
  const [order, setOrder] = useState<number[]>(() => projects.map((p) => p.id));

  const orderedIds = order.filter((id) => projects.some((p) => p.id === id));
  const missing = projects.map((p) => p.id).filter((id) => !orderedIds.includes(id));
  const activeOrder = [...orderedIds, ...missing];
  const activeOrderKey = activeOrder.join(",");

  // Persist the corrected order once the filtered list changes (e.g. switching category).
  // The render below already uses `activeOrder` directly, so this never causes a visible flash —
  // it just keeps `order` state in sync for the next interaction.
  useEffect(() => {
    if (activeOrderKey !== order.join(",") && activeOrder.length) {
      setOrder(activeOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrderKey]);

  const byId = new Map(projects.map((p) => [p.id, p]));
  const stackOrder = activeOrder.filter((id) => byId.has(id)).map((id) => byId.get(id)!);

  const bringToFront = (id: number) => {
    setOrder((prev) => [id, ...prev.filter((p) => p !== id)]);
  };
  const next = () => setOrder((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
  const prev = () => setOrder((prev) => (prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev));

  const front = stackOrder[0];
  const behind = stackOrder.slice(1, 4); // show up to 3 peeking folders behind

  if (!front) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm font-semibold">
        No projects in this category yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* peeking folders */}
      <div className="relative h-16 sm:h-[72px]">
        {behind.slice().reverse().map((p, revIdx) => (
          <FolderPeek
            key={p.id}
            project={p}
            depth={behind.length - revIdx}
            onSelect={() => bringToFront(p.id)}
          />
        ))}
      </div>

      {/* the active, expanded folder */}
      <div className="relative -mt-16 sm:-mt-[72px]">
        <AnimatePresence mode="popLayout">
          <FolderExpanded
            key={front.id}
            project={front}
            onNext={next}
            onPrev={prev}
            total={stackOrder.length}
            position={0}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── main section ─────────────────────────────────────────────── */
export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  const filtered = activeFilter === "All"
    ? PROJECTS
    : PROJECTS.filter((p) => p.filterKey === activeFilter);

  return (
    <section
      id="projects"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.05) 1px, transparent 0), linear-gradient(180deg, #FBF8F1 0%, #F6F1E6 100%)",
        backgroundSize: "26px 26px, 100% 100%",
      }}
    >
      <CoffeeStain className="hidden lg:block" style={{ top: 40, left: "4%" }} />
      <InkStar className="hidden lg:block absolute" style={{ top: "18%", right: "6%" }} />
      <InkStar className="hidden sm:block absolute opacity-60" style={{ bottom: "8%", left: "8%" }} />

      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* ── Header ── */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border-2"
              style={{ borderColor: "#1d6feb", color: "#1d6feb", background: "#fff", transform: "rotate(-2deg)" }}
            >
              Portfolio
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="relative inline-block text-7xl sm:text-8xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: FONT_TITLE, transform: "rotate(-1.5deg)" }}
            >
              Projects
              <Paperclip className="absolute -top-4 -left-7 text-slate-400 rotate-[-25deg]" size={30} strokeWidth={1.5} />
              <svg viewBox="0 0 220 14" className="absolute -bottom-1 left-1 w-[85%]" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8c40-8 140-8 216 2" stroke="#1d6feb" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-md mt-3"
              style={{ fontFamily: FONT_NOTE }}
            >
              Every project represents a problem solved, late nights, continuous
              learning, and real <Highlight>impact</Highlight>.
            </motion.p>
          </div>

          {/* sticky note */}
          <motion.div
            initial={{ opacity: 0, y: 14, rotate: 6 }}
            animate={headerInView ? { opacity: 1, y: 0, rotate: 3 } : {}}
            transition={{ duration: 0.55, delay: 0.25, ease }}
            className="relative justify-self-start lg:justify-self-end w-full max-w-[280px] rounded-sm p-5"
            style={{
              background: "#FFF6D6",
              boxShadow: "0 16px 34px -12px rgba(15,23,42,0.25)",
            }}
          >
            <TapeStrip className="-top-3 left-8" rotate={-6} />
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-700 mb-2" style={{ fontFamily: FONT_NOTE }}>
              A quick note
            </p>
            <p className="text-lg leading-snug text-slate-800" style={{ fontFamily: FONT_TITLE }}>
              Worth a look. Every project below solved a real problem.
            </p>
            <SquigglyArrow className="absolute -bottom-8 -right-6 opacity-70" />
          </motion.div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex flex-wrap gap-1 mb-10 border-b border-slate-300/70">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className="relative px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  color: isActive ? "#1d6feb" : "#64748b",
                  fontFamily: FONT_NOTE,
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="projectsFilterUnderline"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute left-2 right-2 -bottom-[1px] h-[3px] rounded-full"
                    style={{ background: "#1d6feb" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── The stack ── */}
        <FolderStack projects={filtered} />

        {/* ── closing note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 flex items-center justify-center gap-2 text-slate-400 text-sm"
          style={{ fontFamily: FONT_NOTE }}
        >
          <Star size={14} className="text-blue-400" />
          More projects coming soon…
        </motion.div>
      </div>
    </section>
  );
}

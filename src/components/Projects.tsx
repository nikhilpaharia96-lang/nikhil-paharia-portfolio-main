import { useState, useRef, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
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

import img1 from "../assets/images/project-1.webp"; // StudyNova
import img2 from "../assets/images/project-2.webp"; // Abodiverse
import img3 from "../assets/images/project-3.webp"; // Xarena
import img4 from "../assets/images/project-4.webp"; // Travel Diaries
import img5 from "../assets/images/project-5.webp"; // CreatorHub
import img6 from "../assets/images/project-6.webp"; // Portfolio Website

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
  cream: { bg: "#F7F2E7", text: "#1a1a1a", sub: "#6b6456", border: "rgba(255,255,255,0.5)" },
  blue:  { bg: "#2563eb", text: "#ffffff", sub: "rgba(255,255,255,0.75)", border: "rgba(255,255,255,0.3)" },
  ink:   { bg: "#14161c", text: "#ffffff", sub: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.22)" },
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

/** Small blueprint corner bracket — a common technical-drawing motif, drawn fresh (not traced from any reference). */
function CornerBracket({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 28 28" width="22" height="22"
      className={`pointer-events-none absolute text-[#C9DCFF] ${className}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <path d="M2 14V2h12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/** Top-left blueprint title block — name, small construction lines, alignment mark. */
function BlueprintTitleBlock() {
  return (
    <div className="pointer-events-none absolute top-6 left-6 select-none" aria-hidden="true">
      <div className="font-mono text-[11px] tracking-widest text-[#7fa6e8] opacity-40 leading-tight border-b border-[#C9DCFF]/60 pb-1 mb-1">
        NIKHIL PAHARIA
        <br />
        PORTFOLIO
      </div>
      <svg width="26" height="26" viewBox="0 0 26 26" className="text-[#C9DCFF] opacity-60 mt-2">
        <circle cx="13" cy="13" r="6" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M13 2v6M13 18v6M2 13h6M18 13h6" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

/** Top-right blueprint annotation — small technical note block with hatch marks. */
function BlueprintFocusNote() {
  return (
    <div className="pointer-events-none absolute top-6 right-6 text-right select-none" aria-hidden="true">
      <div className="font-mono text-[10px] tracking-widest text-[#7fa6e8] opacity-40 leading-relaxed">
        FOCUS
        <br />PROBLEM
        <br />SOLUTION
        <br />IMPACT
      </div>
      <svg width="60" height="16" viewBox="0 0 60 16" className="ml-auto mt-2 opacity-40">
        {[...Array(8)].map((_, i) => (
          <line key={i} x1={i * 8} y1="0" x2={i * 8 - 6} y2="16" stroke="#C9DCFF" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

/** Faint drafting circles + crosses on the right edge — pure geometry, no illustration. */
function DraftingGeometry() {
  return (
    <svg
      className="pointer-events-none absolute top-1/4 -right-16 opacity-[0.18] hidden lg:block"
      width="360" height="360" viewBox="0 0 360 360" aria-hidden="true"
    >
      <circle cx="180" cy="180" r="140" stroke="#B9CFFA" strokeWidth="1" fill="none" />
      <circle cx="180" cy="180" r="90" stroke="#B9CFFA" strokeWidth="1" fill="none" />
      <line x1="0" y1="180" x2="360" y2="180" stroke="#B9CFFA" strokeWidth="1" />
      <line x1="180" y1="0" x2="180" y2="360" stroke="#B9CFFA" strokeWidth="1" />
      <path d="M170 30l10-10 10 10M170 330l10 10 10-10" stroke="#B9CFFA" strokeWidth="1" fill="none" />
    </svg>
  );
}

/** Huge faded page number + handwritten section tag, bottom-left. */
function BlueprintPageMark() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 select-none hidden md:block" aria-hidden="true">
      <span
        className="block leading-none text-[#B9CFFA] opacity-[0.05] font-black"
        style={{ fontSize: "min(22vw, 320px)" }}
      >
        03
      </span>
      <span
        className="absolute bottom-10 left-6 text-2xl text-[#5b86d6] opacity-50 -rotate-3"
        style={{ fontFamily: FONT_TITLE }}
      >
        Projects
        <svg viewBox="0 0 100 10" className="w-full -mt-1" preserveAspectRatio="none">
          <path d="M2 5c30-4 60-4 96 1" stroke="#8fb3ec" strokeWidth="1.5" fill="none" />
        </svg>
      </span>
    </div>
  );
}

/** Small handwritten closing note, bottom-right, with a tiny arrow. */
function BlueprintClosingNote() {
  return (
    <div className="pointer-events-none absolute bottom-16 right-10 text-right hidden lg:block select-none" aria-hidden="true">
      <p className="font-mono text-[11px] tracking-widest text-[#7fa6e8] opacity-40 leading-relaxed">
        BUILDING
        <br />DIGITAL
        <br />EXPERIENCES
        <br />THAT MATTER.
      </p>
      <SquigglyArrow className="ml-auto mt-1 opacity-40 -scale-x-100" />
    </div>
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
  project, onSelect,
}: { project: Project; onSelect: () => void }) {
  const tone = TONE_STYLES[project.tone];
  const statusStyle = STATUS_STYLES[project.status];

  return (
    <button
      onClick={onSelect}
      aria-label={`Expand ${project.title}`}
      className="group/peek w-full h-16 sm:h-[72px] rounded-lg cursor-pointer text-left
                 flex items-center gap-3 sm:gap-4 px-5 sm:px-7 border-2 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.5)]
                 transition-transform duration-200 hover:-translate-y-0.5
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
      style={{ background: tone.bg, borderColor: tone.border }}
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
      <span className="hidden md:block text-xs truncate flex-1" style={{ color: tone.sub }}>
        {project.tagline}
      </span>
      <span
        className="hidden sm:inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide
                   bg-slate-900 text-white opacity-0 -translate-x-1 transition-all duration-200 group-hover/peek:opacity-100 group-hover/peek:translate-x-0"
      >
        Click to expand
      </span>
      <span className={`ml-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
        {project.status}
      </span>
    </button>
  );
}

/* ── the fully expanded folder, shown wherever it sits in the fixed order ── */
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
      drag={total > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
      className={`relative rounded-lg sm:rounded-xl overflow-hidden border-2 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.55)] ${total > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{ background: tone.bg, borderColor: tone.border }}
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

      {/* browser mockup — real chrome, not just a bare screenshot */}
      <div className="group/shot relative mx-4 sm:mx-6 rounded-xl overflow-hidden bg-slate-900 select-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-950">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="flex-1 mx-2 px-3 py-1 rounded-md bg-white/10 text-[10px] font-mono text-white/50 truncate">
            {project.title.toLowerCase().replace(/\s+/g, "")}.app
          </span>
        </div>
        <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
          <img
            src={project.image}
            alt={`${project.title} — screenshot`}
            draggable={false}
            className={`w-full h-full object-cover ${project.imagePosition} pointer-events-none
                        transition-transform duration-700 ease-out group-hover/shot:scale-[1.04]`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {/* glass reflection sweep on hover */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover/shot:opacity-100 transition-opacity duration-300"
            style={{
              background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)",
            }}
          />
        </div>
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

      {/* prev/next controls — steps which card is expanded, order never changes */}
      {total > 1 && (
        <div className="flex items-center justify-between px-5 sm:px-7 pb-5 sm:pb-6 pt-1">
          <button
            onClick={onPrev}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Expand previous project"
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
            aria-label="Expand next project"
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

/** One row of the stack. Order in the list never changes — only which row is
 *  expanded. A shared layoutId between the collapsed and expanded states is
 *  what produces the "growing in place" morph instead of a swap/fade. */
function FolderRow({
  project, isActive, idx, onSelect, onNext, onPrev, total, position,
}: {
  project: Project; isActive: boolean; idx: number;
  onSelect: () => void; onNext: () => void; onPrev: () => void; total: number; position: number;
}) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="relative"
      style={{ zIndex: idx, marginTop: idx === 0 ? 0 : -18 }}
    >
      <motion.div layoutId={`folder-${project.id}`} layout transition={{ type: "spring", stiffness: 280, damping: 32 }}>
        <AnimatePresence mode="wait" initial={false}>
          {isActive ? (
            <motion.div key="expanded" initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} exit={{ opacity: 0.4 }} transition={{ duration: 0.15 }}>
              <FolderExpanded project={project} onNext={onNext} onPrev={onPrev} total={total} position={position} />
            </motion.div>
          ) : (
            <motion.div key="collapsed" initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} exit={{ opacity: 0.4 }} transition={{ duration: 0.15 }}>
              <FolderPeek project={project} onSelect={onSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ── the folder stack itself ─────────────────────────────────── */
function FolderStack({ projects }: { projects: Project[] }) {
  const [activeId, setActiveId] = useState<number | null>(projects[0]?.id ?? null);

  // Keep the active id valid whenever the filtered list changes (e.g. switching category).
  useEffect(() => {
    if (!projects.some((p) => p.id === activeId)) {
      setActiveId(projects[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.map((p) => p.id).join(",")]);

  if (!projects.length) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm font-semibold">
        No projects in this category yet.
      </div>
    );
  }

  const activeIndex = Math.max(0, projects.findIndex((p) => p.id === activeId));
  const stepTo = (delta: number) => {
    const nextIndex = (activeIndex + delta + projects.length) % projects.length;
    setActiveId(projects[nextIndex].id);
  };

  return (
    <motion.div layout className="flex flex-col">
      {projects.map((p, idx) => (
        <FolderRow
          key={p.id}
          project={p}
          idx={idx}
          isActive={p.id === activeId}
          onSelect={() => setActiveId(p.id)}
          onNext={() => stepTo(1)}
          onPrev={() => stepTo(-1)}
          total={projects.length}
          position={activeIndex}
        />
      ))}
    </motion.div>
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
        backgroundImage: `
          linear-gradient(rgba(201,220,255,0.16) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,220,255,0.16) 1px, transparent 1px),
          radial-gradient(circle at 1px 1px, rgba(15,23,42,0.035) 1px, transparent 0),
          linear-gradient(135deg, #FCFCFB 0%, #F8FAFF 100%)
        `,
        backgroundSize: "40px 40px, 40px 40px, 6px 6px, 100% 100%",
      }}
    >
      {/* soft blue fade at the corners, per spec — no blur blobs, just a gentle vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 100% 0%, rgba(191,214,255,0.35), transparent 45%), radial-gradient(circle at 0% 100%, rgba(191,214,255,0.25), transparent 45%)" }}
      />

      {/* technical-drawing corner brackets */}
      <CornerBracket className="top-6 left-6" />
      <CornerBracket className="top-6 right-6" flip />
      <CornerBracket className="bottom-6 left-6 rotate-180" flip />
      <CornerBracket className="bottom-6 right-6 rotate-180" />

      {/* blueprint annotations — kept faint, tucked into the empty margins */}
      <BlueprintTitleBlock />
      <BlueprintFocusNote />
      <DraftingGeometry />
      <BlueprintPageMark />
      <BlueprintClosingNote />

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8">
        {/* ── Header ── */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border-2"
              style={{ borderColor: "#1d6feb", color: "#1d6feb", background: "#fff" }}
            >
              03 — Selected Work
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

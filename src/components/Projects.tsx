import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Tilt from "@/components/ui/Tilt";
import SplitText from "@/components/ui/SplitText";
import Magnetic from "@/components/ui/Magnetic";
import {
  RiArrowRightLine,
  RiGridFill,
  RiShoppingBag3Line,
  RiAppsLine,
  RiMovieLine,
  RiStarLine,
  RiArrowRightUpLine,
} from "react-icons/ri";
import {
  ExternalLink,
  PlayCircle,
  FileText,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import {
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiFirebase,
  SiTailwindcss,
  SiGit,
  SiGithub,
  SiTypescript,
  SiJavascript,
  SiChartdotjs,
  SiFramer,
  SiGreensock,
} from "react-icons/si";

import img1 from "../assets/images/project-1.webp";
import img2 from "../assets/images/project-2.webp";
import img3 from "../assets/images/project-3.webp";
import img4 from "../assets/images/project-4.webp";
import img5 from "../assets/images/project-5.webp";
import img6 from "../assets/images/project-6.webp";
import teaGardenBg from "../assets/images/tea-sunset-landscape.webp";

/* ── shared easing ──────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

/* ── official tech logos, keyed by lowercase tag text ──── */
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

const TECH_ICONS: Record<string, { Icon: React.ComponentType<TechIconProps>; color: string }> = {
  react:                 { Icon: SiReact,             color: "#61DAFB" },
  "react native":        { Icon: SiReact,             color: "#61DAFB" },
  "next.js":             { Icon: SiNextdotjs,         color: "#000000" },
  nextjs:                { Icon: SiNextdotjs,         color: "#000000" },
  "node.js":             { Icon: SiNodedotjs,         color: "#339933" },
  nodejs:                { Icon: SiNodedotjs,         color: "#339933" },
  "express.js":          { Icon: SiExpress,           color: "#000000" },
  express:               { Icon: SiExpress,           color: "#000000" },
  mongodb:               { Icon: SiMongodb,           color: "#47A248" },
  firebase:              { Icon: SiFirebase,          color: "#FFCA28" },
  "tailwind css":        { Icon: SiTailwindcss,       color: "#06B6D4" },
  tailwind:              { Icon: SiTailwindcss,       color: "#06B6D4" },
  git:                   { Icon: SiGit,               color: "#F05032" },
  github:                { Icon: SiGithub,            color: "#181717" },
  typescript:            { Icon: SiTypescript,        color: "#3178C6" },
  javascript:            { Icon: SiJavascript,        color: "#F7DF1E" },
  "chart.js":            { Icon: SiChartdotjs,        color: "#FF6384" },
  "framer motion":       { Icon: SiFramer,            color: "#0055FF" },
  framer:                { Icon: SiFramer,            color: "#0055FF" },
  gsap:                  { Icon: SiGreensock,         color: "#88CE02" },
  "adobe premiere pro":  { Icon: DiPremiereProIcon,   color: "#2A0634" },
  "premiere pro":        { Icon: DiPremiereProIcon,   color: "#2A0634" },
  "after effects":       { Icon: DiAfterEffectsIcon,  color: "#1F0740" },
};

function getTechIcon(tag: string) {
  return TECH_ICONS[tag.trim().toLowerCase()] ?? null;
}

/* ── filter tabs — grounded in the categories that actually exist below ── */
const FILTER_TABS = [
  { label: "All",         key: "All",      icon: RiGridFill },
  { label: "Web Apps",    key: "Web",      icon: RiAppsLine },
  { label: "E-Commerce",  key: "Commerce", icon: RiShoppingBag3Line },
  { label: "Video",       key: "Video",    icon: RiMovieLine },
  { label: "Featured",    key: "Featured", icon: RiStarLine },
];

type Status = "Live" | "Case Study";
const STATUS_STYLES: Record<Status, { dot: string; bg: string; text: string }> = {
  Live:          { dot: "bg-emerald-500", bg: "bg-emerald-50/90 border-emerald-200/70", text: "text-emerald-700" },
  "Case Study":  { dot: "bg-blue-500",    bg: "bg-blue-50/90 border-blue-200/70",       text: "text-blue-700" },
};

/** Bento shape controls span + internal image aspect — not decoration, it
 *  encodes how much visual weight each project earned (flagship vs. the rest). */
type Shape = "hero" | "tall" | "wide" | "med";

const PROJECTS: Array<{
  id: number;
  shape: Shape;
  title: string;
  category: string;
  filter: string[];
  featured: boolean;
  status: Status;
  year: number;
  domain: string;
  desc: string;
  tags: string[];
  metrics: { screens: string; components: string; apis: string; performance: string };
  image: string;
  imagePosition: string;
  live: string;
  github: string | null;
  caseStudy: string;
  liveLabel: string;
  accentColor: string;
}> = [
  {
    id: 1,
    shape: "hero",
    title: "ApunBazar",
    category: "E-Commerce",
    filter: ["All", "Web", "Commerce", "Featured"],
    featured: true,
    status: "Live",
    year: 2025,
    domain: "apunbazar.in",
    desc: "A full e-commerce platform for authentic Assamese products — seamless checkout, real-time inventory and an intuitive admin panel built for a real seller, not a demo.",
    tags: ["React", "Node.js", "MongoDB"],
    metrics: { screens: "10+", components: "45+", apis: "12+", performance: "98%" },
    image: img1,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
    liveLabel: "Live Project",
    accentColor: "#1d6feb",
  },
  {
    id: 2,
    shape: "tall",
    title: "Campus Unity",
    category: "Web Application",
    filter: ["All", "Web"],
    featured: false,
    status: "Case Study",
    year: 2024,
    domain: "campusunity.app",
    desc: "A college community platform for notes, papers, chat and updates — one app, one campus, unlimited connections.",
    tags: ["React", "Firebase", "Tailwind"],
    metrics: { screens: "08+", components: "30+", apis: "06+", performance: "95%" },
    image: img2,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
    liveLabel: "Live Project",
    accentColor: "#7c3aed",
  },
  {
    id: 3,
    shape: "tall",
    title: "FitBite",
    category: "Food Delivery",
    filter: ["All", "Web", "Featured"],
    featured: true,
    status: "Live",
    year: 2025,
    domain: "fitbite.in",
    desc: "A food delivery app for fitness lovers and college students — healthy food, delivered fast, with smart nutrition tracking.",
    tags: ["React Native", "Node.js", "MongoDB"],
    metrics: { screens: "12+", components: "25+", apis: "10+", performance: "97%" },
    image: img3,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
    liveLabel: "Live Project",
    accentColor: "#059669",
  },
  {
    id: 4,
    shape: "wide",
    title: "Travel Assam",
    category: "Video Editing",
    filter: ["All", "Video", "Featured"],
    featured: true,
    status: "Live",
    year: 2024,
    domain: "watch",
    desc: "A cinematic travel video showcasing the breathtaking beauty of Assam — misty hills, tea gardens and golden sunsets.",
    tags: ["Adobe Premiere Pro", "After Effects"],
    metrics: { screens: "03+", components: "08+", apis: "4K", performance: "96%" },
    image: img4,
    imagePosition: "object-center",
    live: "#",
    github: null,
    caseStudy: "#",
    liveLabel: "Watch Video",
    accentColor: "#d97706",
  },
  {
    id: 5,
    shape: "med",
    title: "Admin Dashboard",
    category: "Dashboard",
    filter: ["All", "Web"],
    featured: false,
    status: "Case Study",
    year: 2023,
    domain: "dashboard.dev",
    desc: "A clean, responsive admin dashboard with real-time analytics and data visualizations.",
    tags: ["React", "Tailwind", "Chart.js"],
    metrics: { screens: "09+", components: "20+", apis: "08+", performance: "96%" },
    image: img5,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
    liveLabel: "Live Preview",
    accentColor: "#1d6feb",
  },
  {
    id: 6,
    shape: "med",
    title: "Portfolio Website",
    category: "Personal Site",
    filter: ["All", "Web", "Commerce", "Featured"],
    featured: true,
    status: "Live",
    year: 2026,
    domain: "nikhilpaharia.dev",
    desc: "This very site — built with love, precision and purpose.",
    tags: ["React", "Tailwind", "Framer Motion"],
    metrics: { screens: "05+", components: "15+", apis: "03+", performance: "99%" },
    image: img6,
    imagePosition: "object-top",
    live: "#",
    github: "#",
    caseStudy: "#",
    liveLabel: "Live Site",
    accentColor: "#1d6feb",
  },
];

/* ── real, honest headline numbers (no invented client claims) ── */
const STATS = [
  { value: 6,   suffix: "+", label: "Projects Shipped" },
  { value: 2,   suffix: "+", label: "Years Building" },
  { value: 15,  suffix: "+", label: "Technologies" },
  { value: 100, suffix: "%", label: "Responsive" },
];

const MARQUEE_TECH = [
  "React", "Next.js", "TypeScript", "Node.js", "MongoDB",
  "Firebase", "Tailwind CSS", "GSAP", "Framer Motion", "Git", "GitHub",
];

/* ── respects OS-level "reduce motion" setting ───────────── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ── count-up hook ──────────────────────────────────────── */
function useCountUp(target: number, active: boolean, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function ProjectMetricCounter({ value, active }: { value: string; active: boolean }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9]/g, "");
  const count = useCountUp(numericValue, active, 1100);
  if (numericValue === 0) return <span>{value}</span>;
  return <span>{count}{suffix}</span>;
}

/* ── ripple-on-click link wrapper ───────────────────────── */
function RippleLink({
  href, onClick, className, children,
}: { href: string; onClick?: () => void; className?: string; children: React.ReactNode }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const fire = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    onClick?.();
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={fire}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      {children}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ width: 0, height: 0, opacity: 0.35, x: r.x, y: r.y }}
          animate={{ width: 140, height: 140, opacity: 0, x: r.x - 70, y: r.y - 70 }}
          transition={{ duration: 0.6, ease }}
          className="absolute rounded-full bg-current pointer-events-none"
          style={{ willChange: "transform, opacity" }}
        />
      ))}
    </a>
  );
}

/* ── cinematic tea-garden backdrop (atmosphere, never the focus) ── */
function ProjectsBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 40, damping: 20 });
  const springY = useSpring(my, { stiffness: 40, damping: 20 });
  const bgX = useTransform(springX, [0, 1], ["2%", "-2%"]);
  const bgY = useTransform(springY, [0, 1], ["2%", "-2%"]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width);
      my.set((e.clientY - rect.top) / rect.height);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mx, my]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-[-4%]"
        style={{
          x: bgX,
          y: bgY,
          backgroundImage: `url(${teaGardenBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
          opacity: 0.16,
          filter: "blur(1px) saturate(1.05)",
        }}
      />
      {/* readability wash — soft blue/white so the golden hills stay a texture, not a photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white" />
      <div className="absolute inset-0 bg-gradient-to-r from-sky-50/70 via-transparent to-blue-50/70" />

      {/* ambient gradient blooms */}
      <motion.div
        className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(29,111,235,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,164,65,0.07) 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* fine dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, #1d6feb 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      {/* floating particles drifting through the fog */}
      {[
        { cx: "8%",  cy: "15%", d: 5,   del: 0 },
        { cx: "92%", cy: "20%", d: 4,   del: 1.5 },
        { cx: "5%",  cy: "70%", d: 6,   del: 3 },
        { cx: "95%", cy: "78%", d: 3.5, del: 0.8 },
        { cx: "50%", cy: "6%",  d: 4,   del: 2 },
        { cx: "40%", cy: "92%", d: 5,   del: 4 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/25"
          style={{ left: dot.cx, top: dot.cy, width: dot.d, height: dot.d }}
          animate={{ y: [0, -14, 0], opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: dot.del }}
        />
      ))}
    </div>
  );
}

/* ── premium glass stat strip ────────────────────────────── */
function StatsRow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS.map((stat, i) => {
        const count = useCountUp(stat.value, inView, 1300 + i * 150);
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease }}
            className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl px-4 py-3.5
                       shadow-[0_4px_20px_rgba(15,23,42,0.05)]"
          >
            <p className="text-2xl font-black text-slate-900 tabular-nums leading-none mb-1">
              {count}{stat.suffix}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 leading-tight">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── animated glass filter pills ─────────────────────────── */
function FilterPills({
  active, onChange,
}: { active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {FILTER_TABS.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        const count =
          tab.key === "All" ? PROJECTS.length
          : tab.key === "Featured" ? PROJECTS.filter((p) => p.featured).length
          : PROJECTS.filter((p) => p.filter.includes(tab.key)).length;

        return (
          <motion.button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                        border overflow-hidden transition-colors duration-300
                        ${isActive
                          ? "border-primary text-white shadow-[0_4px_20px_rgba(29,111,235,0.35)]"
                          : "bg-white/70 backdrop-blur-xl border-slate-200/70 text-slate-500 hover:border-primary/40 hover:text-primary hover:shadow-md"}`}
          >
            {isActive && (
              <motion.div
                layoutId="projectsActivePill"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-full"
              />
            )}
            <Icon size={13} className="relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            <span
              className={`relative z-10 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center
                          ${isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-400"}`}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── tech chip used inside cards ─────────────────────────── */
function TechChip({ tag, hovered, delay = 0 }: { tag: string; hovered: boolean; delay?: number }) {
  const tech = getTechIcon(tag);
  return (
    <motion.span
      animate={{ y: hovered ? [0, -3, 0] : 0 }}
      transition={{ duration: 2.2, repeat: hovered ? Infinity : 0, ease: "easeInOut", delay }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full
                 bg-white/70 border border-slate-200/70 text-slate-600 backdrop-blur"
    >
      {tech && <tech.Icon size={12} style={{ color: tech.color }} className="shrink-0" />}
      <span className="leading-none">{tag}</span>
    </motion.span>
  );
}

/* ── action row (Live / Code / Case Study) ───────────────── */
function ActionRow({ project }: { project: (typeof PROJECTS)[number] }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
      <RippleLink
        href={project.live}
        className="inline-flex items-center justify-center gap-1 py-2 rounded-lg text-primary
                   bg-blue-50/80 hover:bg-blue-50 border border-blue-100 transition-colors"
      >
        {project.category === "Video Editing"
          ? <PlayCircle size={13} strokeWidth={2.25} />
          : <ExternalLink size={13} strokeWidth={2.25} />}
        <span className="truncate">{project.liveLabel.split(" ")[0]}</span>
      </RippleLink>
      <RippleLink
        href={project.github ?? project.live}
        className="inline-flex items-center justify-center gap-1 py-2 rounded-lg text-slate-600
                   bg-white/70 hover:bg-white border border-slate-200/70 transition-colors"
      >
        {project.github ? <SiGithub size={13} className="shrink-0" /> : <ExternalLink size={13} strokeWidth={2.25} />}
        <span className="truncate">Code</span>
      </RippleLink>
      <RippleLink
        href={project.caseStudy}
        className="inline-flex items-center justify-center gap-1 py-2 rounded-lg text-slate-600
                   bg-white/70 hover:bg-white border border-slate-200/70 transition-colors"
      >
        <FileText size={13} strokeWidth={2.25} />
        <span className="truncate">Case Study</span>
      </RippleLink>
    </div>
  );
}

/* ── browser-chrome frame — the signature device mockup for the hero ── */
function BrowserChrome({ domain, accent }: { domain: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 backdrop-blur">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex-1 flex items-center gap-1.5 mx-2 px-3 py-1 rounded-md bg-white/10">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        <span className="text-[10px] font-mono text-white/60 truncate">{domain}</span>
      </div>
    </div>
  );
}

/* ── generic bento card (tall / wide / med shapes) ───────── */
function BentoCard({
  project, index, aspect, onOpen,
}: { project: (typeof PROJECTS)[number]; index: number; aspect: string; onOpen: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);
  const statusStyle = STATUS_STYLES[project.status];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, ease }}
      className="relative h-full"
      style={{ perspective: 1200 }}
    >
      <div
        className="pointer-events-none absolute -inset-2 rounded-[28px] blur-xl transition-opacity duration-500"
        style={{ opacity: hovered ? 0.5 : 0, background: `conic-gradient(from 0deg, ${project.accentColor}, transparent 25%, transparent 75%, ${project.accentColor})` }}
      />
      <Tilt maxRotate={5} glowColor={project.accentColor} glowOpacity={0.14} className="h-full">
        <article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onOpen}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${project.title}`}
          className="group relative flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer
                     bg-white/80 backdrop-blur-xl border border-white/60
                     shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-shadow duration-500
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl z-20 transition-all duration-500"
            style={{
              boxShadow: hovered
                ? `inset 0 0 0 1.5px ${project.accentColor}55, 0 20px 50px -14px ${project.accentColor}35`
                : `inset 0 0 0 1px rgba(15,23,42,0.06)`,
            }}
          />

          {/* image */}
          <div className={`relative overflow-hidden shrink-0 ${aspect}`}>
            <motion.img
              src={project.image}
              alt={`${project.title} — screenshot`}
              loading="lazy"
              className={`w-full h-full object-cover ${project.imagePosition}`}
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.6, ease }}
              style={{ willChange: "transform" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

            {/* glass reflection sweep on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                animation: hovered ? "lightSweep 1.1s ease" : "none",
              }}
            />

            {project.category === "Video Editing" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg">
                  <PlayCircle size={20} className="text-slate-900 fill-slate-900/10" strokeWidth={1.75} />
                </span>
              </div>
            )}

            {project.featured && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold
                                 bg-white/90 backdrop-blur text-amber-600 border border-amber-200/60 shadow-sm">
                  <RiStarLine size={10} className="fill-amber-500 text-amber-500" />
                  Featured
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur ${statusStyle.bg} ${statusStyle.text}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`absolute inline-flex h-full w-full rounded-full ${statusStyle.dot} opacity-60 animate-ping`} />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusStyle.dot}`} />
                </span>
                {project.status}
              </span>
            </div>
          </div>

          {/* body */}
          <div className="relative flex flex-col flex-1 p-5 gap-3">
            <div>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border"
                style={{ background: `${project.accentColor}12`, borderColor: `${project.accentColor}30`, color: project.accentColor }}
              >
                {project.category}
              </span>
            </div>
            <h3
              className="text-[1.05rem] font-black text-slate-900 tracking-tight leading-tight transition-colors duration-300"
              style={{ color: hovered ? project.accentColor : undefined }}
            >
              {project.title}
            </h3>
            <p className="text-slate-500 text-[13px] leading-relaxed flex-1">{project.desc}</p>

            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map((tag, i) => (
                <TechChip key={tag} tag={tag} hovered={hovered} delay={i * 0.15} />
              ))}
            </div>

            <div className="h-px bg-slate-100 group-hover:bg-blue-100 transition-colors duration-300" />
            <ActionRow project={project} />

            <div className="flex justify-end">
              <motion.span
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-primary transition-colors"
                animate={{ x: hovered ? 3 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Explore <RiArrowRightUpLine size={12} />
              </motion.span>
            </div>
          </div>
        </article>
      </Tilt>
    </motion.div>
  );
}

/* ── the hero cell — a full "product launch" treatment ──── */
function HeroCard({
  project, onOpen,
}: { project: (typeof PROJECTS)[number]; onOpen: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const statusStyle = STATUS_STYLES[project.status];
  const metricEntries = [
    { label: "Screens", value: project.metrics.screens },
    { label: "Components", value: project.metrics.components },
    { label: "APIs", value: project.metrics.apis },
    { label: "Score", value: project.metrics.performance },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, ease }}
      className="relative h-full"
      style={{ perspective: 1400 }}
    >
      {/* rotating gradient halo — the one bold signature of this section */}
      <motion.div
        className="pointer-events-none absolute -inset-3 rounded-[36px] blur-2xl"
        style={{ background: `conic-gradient(from 0deg, ${project.accentColor}55, transparent 30%, transparent 70%, ${project.accentColor}55)` }}
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />

      <Tilt maxRotate={4} glowColor={project.accentColor} glowOpacity={0.18} className="h-full">
        <article
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onOpen}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${project.title}`}
          className="group relative flex flex-col h-full rounded-3xl overflow-hidden cursor-pointer
                     bg-white/85 backdrop-blur-xl border border-white/70
                     shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <span className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                            text-[10px] font-black uppercase tracking-widest bg-slate-900/90 text-white backdrop-blur">
            <Sparkles size={11} />
            Flagship Build
          </span>

          {/* device mockup — browser chrome wraps the real screenshot */}
          <div className="relative">
            <BrowserChrome domain={project.domain} accent={project.accentColor} />
            <div className="relative overflow-hidden aspect-[16/10] sm:aspect-[16/9]">
              <motion.img
                src={project.image}
                alt={`${project.title} — live preview`}
                loading="lazy"
                className={`w-full h-full object-cover ${project.imagePosition}`}
                animate={{ scale: hovered ? 1.045 : 1 }}
                transition={{ duration: 0.7, ease }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                  animation: hovered ? "lightSweep 1.3s ease" : "none",
                }}
              />
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full ${statusStyle.dot} opacity-60 animate-ping`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusStyle.dot}`} />
                  </span>
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="relative flex flex-col flex-1 p-6 sm:p-7 gap-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border mb-3"
                  style={{ background: `${project.accentColor}12`, borderColor: `${project.accentColor}30`, color: project.accentColor }}
                >
                  {project.category}
                </span>
                <h3 className="text-2xl sm:text-[1.7rem] font-black text-slate-900 tracking-tight leading-tight">
                  {project.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400 mt-1">{project.year}</span>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">{project.desc}</p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <TechChip key={tag} tag={tag} hovered={hovered} delay={i * 0.15} />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50/70 border border-slate-100 py-3 mt-1">
              {metricEntries.map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-base font-black text-slate-900 tabular-nums">
                    <ProjectMetricCounter value={m.value} active={inView} />
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-100" />

            <div className="grid grid-cols-3 gap-2 text-xs font-bold mt-auto">
              <RippleLink
                href={project.live}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white
                           bg-gradient-to-br from-primary to-blue-600 shadow-[0_8px_24px_rgba(29,111,235,0.35)]
                           hover:shadow-[0_10px_32px_rgba(29,111,235,0.45)] transition-shadow"
              >
                <ExternalLink size={13} strokeWidth={2.25} />
                Live Demo
              </RippleLink>
              <RippleLink
                href={project.github ?? project.live}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-slate-700
                           bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <SiGithub size={13} />
                GitHub
              </RippleLink>
              <RippleLink
                href={project.caseStudy}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-slate-700
                           bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                <FileText size={13} strokeWidth={2.25} />
                Case Study
              </RippleLink>
            </div>
          </div>
        </article>
      </Tilt>
    </motion.div>
  );
}

/* ── infinite tech marquee ────────────────────────────────── */
function TechMarquee({ paused = false }: { paused?: boolean }) {
  const row = [...MARQUEE_TECH, ...MARQUEE_TECH];
  return (
    <div className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl
                    shadow-[0_8px_32px_rgba(15,23,42,0.05)] overflow-hidden py-6">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
        Technologies I Build With
      </p>
      <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/70 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/70 to-transparent z-10 pointer-events-none" />
      <div className="flex overflow-hidden">
        <div
          className="flex items-center gap-10 sm:gap-14 whitespace-nowrap w-max pr-10 sm:pr-14"
          style={{ animation: paused ? "none" : "marqueeScroll 26s linear infinite" }}
        >
          {row.map((name, i) => {
            const tech = getTechIcon(name);
            return (
              <div key={`${name}-${i}`} className="flex items-center gap-2 shrink-0">
                {tech && <tech.Icon size={20} style={{ color: tech.color }} />}
                <span className="text-sm font-bold text-slate-600">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── full-detail lightbox — opened from any card ─────────── */
function ProjectModal({
  project, onClose,
}: { project: (typeof PROJECTS)[number] | null; onClose: () => void }) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  const statusStyle = project ? STATUS_STYLES[project.status] : null;

  return (
    <AnimatePresence>
      {project && statusStyle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} details`}
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease }}
            className="relative z-10 w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl
                       bg-white border border-white/70 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.4)]"
          >
            <button
              onClick={onClose}
              aria-label="Close project details"
              className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full
                         bg-white/90 backdrop-blur border border-slate-200 text-slate-600 hover:text-slate-900
                         hover:bg-white transition-colors shadow-sm"
            >
              <X size={16} />
            </button>

            <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl">
              <img
                src={project.image}
                alt={`${project.title} — full preview`}
                className={`w-full h-full object-cover ${project.imagePosition}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur ${statusStyle.bg} ${statusStyle.text}`}>
                  <span className={`inline-flex rounded-full h-1.5 w-1.5 ${statusStyle.dot}`} />
                  {project.status}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border mb-3"
                    style={{ background: `${project.accentColor}12`, borderColor: `${project.accentColor}30`, color: project.accentColor }}
                  >
                    {project.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{project.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1">{project.year}</span>
              </div>

              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                {project.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <TechChip key={tag} tag={tag} hovered={false} />
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50 border border-slate-100 py-3.5 mb-6">
                {[
                  { label: "Screens", value: project.metrics.screens },
                  { label: "Components", value: project.metrics.components },
                  { label: "APIs", value: project.metrics.apis },
                  { label: "Score", value: project.metrics.performance },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-lg font-black text-slate-900 tabular-nums">{m.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-sm font-bold">
                <RippleLink
                  href={project.live}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white
                             bg-gradient-to-br from-primary to-blue-600 shadow-[0_8px_24px_rgba(29,111,235,0.35)]"
                >
                  <ExternalLink size={14} strokeWidth={2.25} />
                  {project.liveLabel}
                </RippleLink>
                <RippleLink
                  href={project.github ?? project.live}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-slate-700
                             bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <SiGithub size={14} />
                  GitHub
                </RippleLink>
                <RippleLink
                  href={project.caseStudy}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-slate-700
                             bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <FileText size={14} strokeWidth={2.25} />
                  Full Case Study
                </RippleLink>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── main section ─────────────────────────────────────────── */
export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<(typeof PROJECTS)[number] | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = PROJECTS.filter((p) =>
    activeFilter === "Featured" ? p.featured : p.filter.includes(activeFilter)
  );

  const hero = filtered.find((p) => p.shape === "hero");
  const tallCards = filtered.filter((p) => p.shape === "tall");
  const wideCards = filtered.filter((p) => p.shape === "wide");
  const medCards = filtered.filter((p) => p.shape === "med");
  const rest = filtered.filter((p) => p.shape !== "hero");

  return (
    <section id="projects" className="relative py-28 md:py-36 overflow-hidden">
      <ProjectsBackdrop />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">

        {/* ── Header: intro (left) + filter pills (right) ── */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-[1.1fr_auto] gap-10 lg:gap-8 items-start mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest
                               bg-white/80 backdrop-blur border border-blue-100 text-primary shadow-[0_2px_12px_rgba(29,111,235,0.08)]">
                <Rocket size={12} />
                Featured Work
              </span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl md:text-[3.4rem] font-serif font-black tracking-tight text-slate-900 mb-6 leading-[1.05]">
              <SplitText type="words">Projects That</SplitText>{" "}
              <span
                className="relative z-10"
                style={{
                  background: "linear-gradient(135deg, #1d6feb 0%, #2563eb 45%, #60a5fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <SplitText type="words" delay={0.2}>Create Impact.</SplitText>
              </span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.25, ease }}
              className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed mb-8"
            >
              A curated collection of products, platforms and digital experiences —
              built with performance, creativity and modern technology.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.35, ease }}
              className="mb-8"
            >
              <StatsRow />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.45, ease }}
            >
              <Magnetic range={70} strength={0.35} scaleHover={1.03}>
                <button
                  onClick={() => {
                    setActiveFilter("All");
                    const el = gridRef.current;
                    if (!el) return;
                    const lenis = (window as typeof window & { lenis?: { scrollTo: (target: HTMLElement, opts?: Record<string, unknown>) => void } }).lenis;
                    if (lenis) {
                      lenis.scrollTo(el, { offset: -24, duration: 1.2 });
                    } else {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl
                             bg-gradient-to-br from-primary to-blue-600 text-white text-sm font-black
                             shadow-[0_10px_32px_rgba(29,111,235,0.35)] hover:shadow-[0_14px_40px_rgba(29,111,235,0.45)]
                             transition-shadow duration-300"
                >
                  View All Projects
                  <RiArrowRightLine size={16} />
                </button>
              </Magnetic>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease }}
            className="lg:pt-2"
          >
            <FilterPills active={activeFilter} onChange={setActiveFilter} />
          </motion.div>
        </div>

        {/* ── Bento grid ── */}
        <div ref={gridRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {(hero || tallCards.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {hero && (
                    <div className="sm:col-span-2 lg:col-span-2">
                      <HeroCard project={hero} onOpen={() => setSelectedProject(hero)} />
                    </div>
                  )}
                  {tallCards.map((p, i) => (
                    <div key={p.id} className="lg:col-span-1">
                      <BentoCard project={p} index={i} aspect="aspect-[4/5]" onOpen={() => setSelectedProject(p)} />
                    </div>
                  ))}
                </div>
              )}

              {(wideCards.length > 0 || medCards.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {wideCards.map((p, i) => (
                    <div key={p.id} className="sm:col-span-2 lg:col-span-2">
                      <BentoCard project={p} index={i} aspect="aspect-video" onOpen={() => setSelectedProject(p)} />
                    </div>
                  ))}
                  {medCards.map((p, i) => (
                    <div key={p.id} className="lg:col-span-1">
                      <BentoCard project={p} index={i + wideCards.length} aspect="aspect-video" onOpen={() => setSelectedProject(p)} />
                    </div>
                  ))}
                </div>
              )}

              {!hero && rest.length === 0 && (
                <div className="py-20 text-center text-slate-400 text-sm font-semibold">
                  No projects in this category yet — check back soon.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom: infinite tech marquee ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mt-16 md:mt-20"
        >
          <TechMarquee paused={reducedMotion} />
        </motion.div>

      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
}

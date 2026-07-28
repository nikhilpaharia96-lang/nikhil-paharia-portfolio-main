import { useState, useMemo, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  ExternalLink,
  FileText,
  CheckCircle2,
  Paperclip,
} from "lucide-react";
import {
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiFirebase,
  SiTailwindcss,
  SiFramer,
} from "react-icons/si";

import img1 from "../assets/images/project-1.png";
import img2 from "../assets/images/project-2.png";
import img3 from "../assets/images/project-3.png";
import img4 from "../assets/images/project-4.png";
import img5 from "../assets/images/project-5.png";
import img6 from "../assets/images/project-6.png";

const HANDWRITTEN_FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Kalam:wght@400;700&display=swap');`;
const hand = { fontFamily: "'Caveat', cursive" };
const handNote = { fontFamily: "'Kalam', cursive" };

const TECH_ICONS: Record<string, { Icon: any; color: string }> = {
  React: { Icon: SiReact, color: "#61DAFB" },
  "Node.js": { Icon: SiNodedotjs, color: "#339933" },
  MongoDB: { Icon: SiMongodb, color: "#47A248" },
  Firebase: { Icon: SiFirebase, color: "#FFCA28" },
  Tailwind: { Icon: SiTailwindcss, color: "#06B6D4" },
  "Framer Motion": { Icon: SiFramer, color: "#0055FF" },
};

const FILTERS = ["All", "Web Development", "E-Commerce", "Tools"];

interface ProjectFile {
  number: string;
  title: string;
  tagline: string;
  status: "Live" | "Completed" | "In Progress";
  category: string[];
  image: string;
  overview: string;
  features: string[];
  tech: string[];
  stats: { label: string; value: string }[];
  live?: string;
  github?: string;
  caseStudy?: string;
  paper: "blueprint" | "cream" | "ink";
}

const FILES: ProjectFile[] = [
  {
    number: "01",
    title: "ApunBazar",
    tagline: "Assam-themed e-commerce for local products and artisans.",
    status: "Live",
    category: ["Web Development", "E-Commerce"],
    image: img1,
    overview:
      "ApunBazar connects local Assamese artisans, tea gardens and traditional brands with customers across India through a modern, fast storefront.",
    features: [
      "Modern & responsive UI",
      "Product filtering & search",
      "Secure checkout integration",
      "Admin dashboard",
      "Order management",
      "Coupons & discounts",
    ],
    tech: ["React", "Node.js", "MongoDB"],
    stats: [
      { label: "Conversion", value: "↑ 40%" },
      { label: "Lighthouse", value: "98" },
    ],
    live: "#",
    github: "#",
    caseStudy: "#",
    paper: "blueprint",
  },
  {
    number: "02",
    title: "Campus Unity",
    tagline: "College students' union platform for better communication.",
    status: "Live",
    category: ["Web Development"],
    image: img2,
    overview:
      "A community platform built for Jagiroad College — notes sharing, event updates and a real-time chat space for the student union.",
    features: [
      "Real-time announcements",
      "Notes & paper sharing",
      "Event calendar",
      "Student chat rooms",
    ],
    tech: ["React", "Firebase", "Tailwind"],
    stats: [{ label: "Users", value: "1K+" }],
    live: "#",
    github: "#",
    caseStudy: "#",
    paper: "cream",
  },
  {
    number: "03",
    title: "FitBite",
    tagline: "Food delivery for fitness lovers — healthy meals, fast.",
    status: "Live",
    category: ["Web Development"],
    image: img3,
    overview:
      "A food delivery experience built for the health-conscious — smart nutrition tracking layered on top of a familiar ordering flow.",
    features: [
      "Nutrition-first menu tagging",
      "Fast checkout",
      "Order tracking",
      "Meal plan subscriptions",
    ],
    tech: ["React", "Node.js", "MongoDB"],
    stats: [{ label: "Rating", value: "4.8★" }],
    live: "#",
    github: "#",
    caseStudy: "#",
    paper: "blueprint",
  },
  {
    number: "04",
    title: "Admin Dashboard",
    tagline: "Responsive admin dashboard with real-time analytics.",
    status: "Completed",
    category: ["Tools"],
    image: img5,
    overview:
      "A clean internal tool for tracking KPIs at a glance — built to replace a messy spreadsheet workflow with live charts.",
    features: [
      "Real-time data visualizations",
      "Role-based access",
      "Exportable reports",
      "Dark-mode ready",
    ],
    tech: ["React", "Tailwind"],
    stats: [{ label: "Lighthouse", value: "96" }],
    live: "#",
    github: "#",
    caseStudy: "#",
    paper: "ink",
  },
];

function StatusBadge({ status }: { status: ProjectFile["status"] }) {
  const dot = status === "Live" ? "bg-emerald-500" : status === "In Progress" ? "bg-amber-500" : "bg-slate-400";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/85 text-white text-[10px] font-bold tracking-wide uppercase">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function paperClasses(paper: ProjectFile["paper"]) {
  switch (paper) {
    case "blueprint":
      return "bg-[#1c4fd6] text-white";
    case "ink":
      return "bg-slate-900 text-white";
    default:
      return "bg-[#f7f3ea] text-slate-900";
  }
}

const CollapsedFile = memo(function CollapsedFile({ file, onClick, offset }: { file: ProjectFile; onClick: () => void; offset: number }) {
  const rotate = offset % 2 === 0 ? -0.6 : 0.6;
  return (
    <motion.button
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -4, rotate: 0, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      style={{ zIndex: 10 - offset }}
      className={`interactive touch-manipulation relative w-full text-left rounded-t-2xl px-6 py-4 flex items-center justify-between gap-4
                  shadow-[0_-4px_16px_rgba(0,0,0,0.12)] border border-black/5
                  ${paperClasses(file.paper)}`}
    >
      <span
        className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)",
          borderTopRightRadius: "0.75rem",
        }}
        aria-hidden="true"
      />
      <div className="flex items-center gap-4 min-w-0">
        <span className="shrink-0 w-8 h-8 rounded-md bg-black/15 flex items-center justify-center text-xs font-bold">
          {file.number}
        </span>
        <span className="font-extrabold text-base sm:text-lg tracking-tight truncate">{file.title}</span>
        <span className="hidden sm:block text-sm opacity-80 truncate">{file.tagline}</span>
      </div>
      <StatusBadge status={file.status} />
    </motion.button>
  );
});

function DeviceMockup({ file }: { file: ProjectFile }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 120, damping: 18 });
  const springY = useSpring(my, { stiffness: 120, damping: 18 });
  const laptopX = useTransform(springX, [-0.5, 0.5], [-6, 6]);
  const laptopY = useTransform(springY, [-0.5, 0.5], [-4, 4]);
  const phoneX = useTransform(springX, [-0.5, 0.5], [8, -8]);
  const phoneY = useTransform(springY, [-0.5, 0.5], [6, -6]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div ref={wrapRef} onMouseMove={handleMove} onMouseLeave={handleLeave} className="relative touch-manipulation">
      <motion.div
        style={{ x: laptopX, y: laptopY }}
        className="rounded-xl overflow-hidden border border-black/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] bg-black/5"
      >
        <div className="flex items-center gap-1.5 px-3 py-2 bg-black/10">
          <span className="w-2 h-2 rounded-full bg-red-400/70" />
          <span className="w-2 h-2 rounded-full bg-amber-400/70" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
        </div>
        <div className="relative w-full h-56 sm:h-72 overflow-hidden">
          <motion.img
            key={file.number}
            src={file.image}
            alt={file.title}
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-cover object-top absolute inset-x-0 top-0"
            initial={{ y: 0 }}
            animate={{ y: [0, -60, 0] }}
            transition={{ duration: 9, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
          />
        </div>
      </motion.div>

      <motion.div
        style={{ x: phoneX, y: phoneY }}
        className="hidden sm:block absolute -bottom-6 -right-6 w-28 rounded-2xl overflow-hidden border-4 border-black/80 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.5)] bg-black"
      >
        <div className="relative w-full h-40 overflow-hidden">
          <motion.img
            key={`phone-${file.number}`}
            src={file.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-cover object-top absolute inset-x-0 top-0"
            initial={{ y: 0 }}
            animate={{ y: [0, -40, 0] }}
            transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}

const contentStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const contentItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const ExpandedFile = memo(function ExpandedFile({ file }: { file: ProjectFile }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, rotateX: -14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, rotateX: -10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200, damping: 24, mass: 0.9 }}
      style={{ transformPerspective: 1400, transformOrigin: "top center" }}
      className={`relative rounded-2xl rounded-t-none p-6 sm:p-8 md:p-10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)] border border-black/5 overflow-hidden ${paperClasses(file.paper)}`}
    >
      <span className="absolute -top-2 left-8 w-14 h-6 bg-amber-100/70 -rotate-6 shadow-sm pointer-events-none" aria-hidden="true" />
      <span className="absolute -top-2 right-10 w-14 h-6 bg-amber-100/70 rotate-3 shadow-sm pointer-events-none" aria-hidden="true" />
      <span
        className="absolute top-0 right-0 w-6 h-6 pointer-events-none"
        style={{ background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.15) 50%)" }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-md bg-black/15 flex items-center justify-center text-sm font-bold">
            {file.number}
          </span>
          <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight">{file.title}</h3>
        </div>
        <StatusBadge status={file.status} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-10">
        <DeviceMockup file={file} />

        <motion.div
          key={file.number}
          initial="hidden"
          animate="show"
          variants={contentStagger}
          className="flex flex-col gap-6"
        >
          <motion.div variants={contentItem}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Project Overview</p>
            <p className="text-sm sm:text-[15px] leading-relaxed opacity-90">{file.overview}</p>
          </motion.div>

          <motion.div variants={contentItem}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Key Features</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {file.features.map((f, i) => (
                <motion.li
                  key={f}
                  variants={contentItem}
                  transition={{ duration: 0.35, delay: 0.05 * i }}
                  className="flex items-start gap-1.5 text-sm opacity-90"
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" /> {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={contentItem} className="flex flex-wrap gap-2">
            {file.tech.map((t, i) => {
              const meta = TECH_ICONS[t];
              return (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/10 text-xs font-semibold"
                >
                  {meta && <meta.Icon size={12} style={{ color: meta.color }} />}
                  {t}
                </motion.span>
              );
            })}
          </motion.div>

          <motion.div variants={contentItem} className="grid grid-cols-2 gap-3 pt-1">
            {file.stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.08 }}
                className="relative rounded-lg bg-black/10 px-3 py-2"
              >
                <div className="font-extrabold text-lg">{s.value}</div>
                <div className="text-[11px] opacity-70 uppercase tracking-wide">{s.label}</div>
                {i === 0 && (
                  <svg className="absolute -inset-1.5 pointer-events-none" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
                    <ellipse cx="50" cy="25" rx="46" ry="20" fill="none" stroke="#1c4fd6" strokeWidth="2" opacity="0.35" />
                  </svg>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={contentItem} className="flex flex-wrap gap-3 pt-1">
            {file.caseStudy && (
              
                href={file.caseStudy}
                className="interactive touch-manipulation inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black/90 text-white text-sm font-bold hover:bg-black active:scale-95 transition-all"
              >
                <FileText size={15} /> View Case Study <ArrowRight size={15} />
              </a>
            )}
            {file.live && (
              
                href={file.live}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive touch-manipulation inline-flex items-center gap-2 px-5 py-3 rounded-full border border-current text-sm font-bold hover:bg-black/10 active:scale-95 transition-all"
              >
                <ExternalLink size={15} /> Live Website
              </a>
            )}
            {file.github && (
              
                href={file.github}
                target="_blank"
                rel="noopener noreferrer"
                className="interactive touch-manipulation inline-flex items-center justify-center w-11 h-11 rounded-full border border-current hover:bg-black/10 active:scale-95 transition-all"
                aria-label={`GitHub repository for ${file.title}`}
              >
                <Github size={17} />
              </a>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [activeNumber, setActiveNumber] = useState(FILES[FILES.length - 1].number);

  const visible = useMemo(
    () => FILES.filter((f) => filter === "All" || f.category.includes(filter)),
    [filter]
  );

  useEffect(() => {
    if (!visible.find((f) => f.number === activeNumber) && visible.length > 0) {
      setActiveNumber(visible[visible.length - 1].number);
    }
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = visible.find((f) => f.number === activeNumber) ?? visible[visible.length - 1];
  const stacked = visible.filter((f) => f.number !== active?.number);

  return (
    <section id="projects" className="section-padding relative overflow-hidden section-wrap max-w-full bg-[#faf7f0]">
      <style>{HANDWRITTEN_FONT_IMPORT}</style>

      <div
        className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="absolute top-24 left-[4%] w-28 h-28 rounded-full border-[6px] border-amber-900/[0.06] pointer-events-none hidden md:block" />
      <div className="absolute bottom-40 right-[6%] w-16 h-16 rounded-full border-[4px] border-amber-900/[0.05] pointer-events-none hidden lg:block" />

      <svg className="absolute top-20 left-[38%] w-16 h-10 text-[#1c4fd6] opacity-40 pointer-events-none hidden lg:block" viewBox="0 0 60 40" fill="none" aria-hidden="true">
        <path d="M2 34 Q 20 10, 50 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 4 L50 10 L44 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-start mb-14">
          <div>
            <span
              className="inline-block px-3 py-1 mb-4 bg-[#1c4fd6] text-white text-xs font-bold tracking-widest uppercase"
              style={{ clipPath: "polygon(0 0, 100% 4%, 98% 100%, 2% 96%)" }}
            >
              Portfolio
            </span>
            <div className="relative inline-block mb-3">
              <h2
                className="text-6xl sm:text-7xl font-bold text-slate-900"
                style={{ ...hand, transform: "rotate(-1deg)" }}
              >
                Projects
              </h2>
              <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2,6 Q150,10 298,4" stroke="#1c4fd6" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-lg text-slate-600 max-w-md leading-relaxed" style={handNote}>
              Each project is a story of problem solving, learning, late nights, and a little bit
              of{" "}
              <span className="relative inline-block text-slate-900 font-bold">
                impact
                <svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 80 8" preserveAspectRatio="none" aria-hidden="true">
                  <ellipse cx="40" cy="4" rx="38" ry="3" fill="none" stroke="#1c4fd6" strokeWidth="2" />
                </svg>
              </span>
              .
            </p>
          </div>

          <div className="relative justify-self-start lg:justify-self-end max-w-xs">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-100/80 rotate-2 shadow-sm" aria-hidden="true" />
            <div
              className="relative bg-[#fdf6d8] p-5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.25)] rotate-2"
              style={handNote}
            >
              <p className="text-xs font-bold tracking-wider text-slate-500 mb-2">A QUICK NOTE</p>
              <p className="text-slate-800 leading-snug">
                Worth a look. Every project below solved a real problem —
                <Paperclip className="inline w-4 h-4 -mt-1 ml-1 text-slate-400" />
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`interactive relative px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
                filter === f ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {filter === f && (
                <motion.span layoutId="proj-filter-pill" className="absolute inset-0 rounded-full bg-[#1c4fd6] -z-10" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
              )}
              {f}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {stacked
                .slice()
                .sort((a, b) => Number(b.number) - Number(a.number))
                .map((f, i) => (
                  <CollapsedFile key={f.number} file={f} offset={i} onClick={() => setActiveNumber(f.number)} />
                ))}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {active && <ExpandedFile key={active.number} file={active} />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

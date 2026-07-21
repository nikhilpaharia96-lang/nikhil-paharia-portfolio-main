import { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Clapperboard,
  Film,
  Camera,
  Play,
  ChevronLeft,
  ChevronRight,
  Palette,
  Headphones,
  Sparkles,
  Eye,
} from "lucide-react";
import teaBg from "../assets/images/tea-garden-hero.webp";
import SplitText from "@/components/ui/SplitText";

import vid1 from "../assets/images/video-1.png";
import vid2 from "../assets/images/video-2.png";
import vid3 from "../assets/images/video-3.png";
import teaHero from "../assets/images/tea-garden-about.webp";
import teaWide from "../assets/images/tea-sunset-person-wide.webp";
import bgVideo from "../assets/videos/loading-bg-desktop.mp4";

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

const featured = {
  title: "Whispers of the Highlands",
  category: "Documentary Film",
  duration: "4:12",
  image: vid1,
};

const projects = [
  { id: 1, title: "Golden Hour Escape", category: "Travel Film", duration: "2:34", image: vid2 },
  { id: 2, title: "Whispers of the Highlands", category: "Documentary", duration: "4:12", image: vid1 },
  { id: 3, title: "Launch Reel — Aurum", category: "Commercial", duration: "1:15", image: vid3 },
  { id: 4, title: "Anaya & Rohan", category: "Wedding Film", duration: "3:48", image: teaHero },
  { id: 5, title: "Valley From Above", category: "Drone Film", duration: "2:02", image: teaWide },
];

const features = [
  {
    icon: Camera,
    title: "4K Cinematic Production",
    desc: "Every frame shot and mastered in crisp 4K resolution.",
  },
  {
    icon: Palette,
    title: "Professional Color Grading",
    desc: "Rich, filmic tones tailored to each story's mood.",
  },
  {
    icon: Headphones,
    title: "Sound Design",
    desc: "Immersive audio mixing that pulls viewers in.",
  },
  {
    icon: Sparkles,
    title: "Story Driven Editing",
    desc: "Pacing and rhythm built around genuine emotion.",
  },
];

/* ────────────────────────────────────────────────────────────
   Magnetic wrapper — buttons subtly follow the cursor
   ──────────────────────────────────────────────────────────── */

function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Featured hero video card
   ──────────────────────────────────────────────────────────── */

function FeaturedVideo() {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 150, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), springCfg);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(480px circle at ${x} ${y}, rgba(29,111,235,0.25), transparent 70%)`
  );

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (hovered) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [hovered]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setHovered(false);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: hovered ? 0 : [0, -10, 0] }}
        transition={
          hovered
            ? { duration: 0.4 }
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <motion.div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="group relative rounded-[32px] p-[1.5px] interactive cursor-pointer"
        >
          {/* animated gradient border */}
          <div className="absolute -inset-[1.5px] rounded-[32px] bg-[conic-gradient(from_0deg,rgba(29,111,235,0.6),rgba(255,255,255,0.2),rgba(29,111,235,0.6))] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

          {/* ambient glow behind card */}
          <div className="absolute -inset-6 rounded-[40px] bg-primary/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10" />

          <div
            className="relative rounded-[31px] overflow-hidden bg-[#0a1220] aspect-video w-full
                       shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_40px_80px_-24px_rgba(8,20,45,0.55)]"
          >
            <motion.img
              src={featured.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              animate={{
                scale: hovered ? 1.08 : 1,
                filter: hovered ? "blur(1px) brightness(0.6)" : "brightness(0.85)",
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />

            <video
              ref={videoRef}
              src={bgVideo}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
                hovered ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* glass reflection sheen */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

            {/* mouse-follow glow */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: glowBg }}
            />

            {/* top meta */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
              <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold uppercase tracking-[0.14em]">
                {featured.category}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-semibold">
                {featured.duration}
              </span>
            </div>

            {/* center play button */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <motion.div
                animate={{ scale: hovered ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative"
              >
                <motion.span
                  className="absolute inset-0 rounded-full bg-white/40"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-[0_20px_45px_-10px_rgba(0,0,0,0.5)]">
                  <Play className="w-8 h-8 sm:w-9 sm:h-9 text-primary ml-1" fill="currentColor" />
                </div>
              </motion.div>
            </div>

            {/* bottom title */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
              <h3 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight max-w-xl">
                {featured.title}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Carousel project card
   ──────────────────────────────────────────────────────────── */

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 200, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), springCfg);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(240px circle at ${x} ${y}, rgba(29,111,235,0.3), transparent 70%)`
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="shrink-0 w-[78vw] xs:w-[300px] sm:w-[320px] snap-start"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ y: -10 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative rounded-[26px] p-[1px] interactive cursor-pointer transition-transform duration-300"
      >
        <div
          className="absolute inset-0 rounded-[26px] opacity-50 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(140deg, rgba(29,111,235,0.55), rgba(255,255,255,0.15) 45%, rgba(29,111,235,0.35))",
          }}
        />

        <div
          className="relative rounded-[25px] overflow-hidden bg-[#0a1220]
                     shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_24px_50px_-18px_rgba(8,20,45,0.5)]
                     group-hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_30px_60px_-16px_rgba(8,20,45,0.6)]
                     transition-shadow duration-500"
        >
          <div className="aspect-[4/5] relative w-full overflow-hidden">
            <motion.img
              src={project.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* glass overlay */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] backdrop-blur-0 group-hover:backdrop-blur-[1px] transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/10" />

            {/* mouse glow */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: glowBg }}
            />

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                {project.category}
              </span>
              <span className="text-white/85 text-[11px] font-mono font-semibold">
                {project.duration}
              </span>
            </div>

            {/* preview button — appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-400">
                <Eye className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <h4 className="font-serif font-bold text-lg text-white leading-snug">
                {project.title}
              </h4>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Horizontal carousel with nav arrows
   ──────────────────────────────────────────────────────────── */

function ProjectCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 336, behavior: "smooth" });
  };

  return (
    <div className="relative mt-8 sm:mt-10">
      <div
        ref={scrollerRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {/* nav arrows — desktop only */}
      <div className="hidden md:flex items-center gap-3 justify-end mt-6">
        <Magnetic strength={0.4}>
          <button
            aria-label="Previous project"
            onClick={() => scrollBy(-1)}
            className="interactive w-12 h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 shadow-[0_10px_28px_-12px_rgba(15,45,90,0.3)] transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Magnetic>
        <Magnetic strength={0.4}>
          <button
            aria-label="Next project"
            onClick={() => scrollBy(1)}
            className="interactive w-12 h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 shadow-[0_10px_28px_-12px_rgba(15,45,90,0.3)] transition-colors duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </Magnetic>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Floating ambient chip (left column)
   ──────────────────────────────────────────────────────────── */

function FloatingChip({
  icon: Icon,
  className,
  delay = 0,
  duration = 6,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={`absolute hidden md:flex items-center justify-center w-12 h-12 rounded-2xl
                  bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-8px_rgba(15,45,90,0.3)] ${className}`}
      animate={{ y: [0, -14, 0], rotate: [0, -4, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="w-5 h-5 text-primary/70" />
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Feature strip
   ──────────────────────────────────────────────────────────── */

function FeatureStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 rounded-3xl p-6 sm:p-8
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]
                 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
    >
      {features.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -5 }}
            className="group flex flex-col items-start gap-3"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur border border-white/80 flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(15,45,90,0.3)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
              <Icon className="w-5 h-5 text-primary" />
              <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-foreground">
              {feature.title}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main section
   ──────────────────────────────────────────────────────────── */

export default function VideoShowcase() {
  const particles = useMemo(() => Array.from({ length: 14 }), []);

  return (
    <section
      id="videos"
      className="relative overflow-hidden section-wrap max-w-full py-20 sm:py-28 md:py-36 lg:py-40"
      aria-label="Cinematic Reels — My Cinematic Work"
    >
      {/* ── Cinematic parallax background ── */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={teaBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center scale-110"
          style={{ filter: "brightness(0.88) saturate(0.92)" }}
          animate={{ scale: [1.1, 1.17, 1.1], x: [0, 14, 0] }}
          transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/93 via-white/80 to-white/93" />
        <div className="absolute inset-0 bg-gradient-to-l from-white/85 via-transparent to-blue-50/60" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,transparent_20%,rgba(8,20,45,0.06)_100%)]" />
      </div>

      {/* ── Golden light sweep ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{
          background:
            "linear-gradient(115deg, transparent 25%, rgba(255,214,140,0.3) 48%, transparent 70%)",
        }}
        animate={{ x: ["30%", "-30%", "30%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Fog orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[10%] right-[8%] w-[26rem] h-[26rem] bg-blue-200/20 rounded-full blur-[130px]"
          style={{ animation: "fogDrift 15s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[8%] left-[6%] w-[22rem] h-[22rem] bg-amber-100/25 rounded-full blur-[110px]"
          style={{ animation: "fogDrift 18s ease-in-out infinite reverse" }}
        />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              left: `${(i * 41) % 100}%`,
              top: `${(i * 59) % 100}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.55, 0.15] }}
            transition={{
              duration: 6 + (i % 5),
              delay: i * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-start mb-16 sm:mb-20">
          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 relative">
            <FloatingChip icon={Film} className="top-[-2.2rem] right-4" delay={0} duration={7} />
            <FloatingChip icon={Clapperboard} className="top-28 -right-2" delay={1.1} duration={7.5} />
            <FloatingChip icon={Camera} className="bottom-10 right-12" delay={0.6} duration={6.5} />

            {/* subtle curved line illustration */}
            <svg
              aria-hidden="true"
              className="absolute -left-6 top-40 hidden lg:block opacity-40 pointer-events-none"
              width="160"
              height="220"
              viewBox="0 0 160 220"
              fill="none"
            >
              <motion.path
                d="M10 10 C 90 40, 20 120, 100 150 S 60 210, 150 210"
                stroke="url(#curveGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 2.4, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="220">
                  <stop offset="0%" stopColor="#1d6feb" stopOpacity="0" />
                  <stop offset="50%" stopColor="#1d6feb" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1d6feb" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/60 backdrop-blur-xl border border-white/70
                         shadow-[0_8px_24px_-10px_rgba(15,45,90,0.25)] mb-7"
            >
              <span aria-hidden="true">🎬</span>
              <span className="text-xs font-mono font-semibold tracking-[0.18em] uppercase text-primary">
                My Cinematic Work
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-bold text-[2.4rem] sm:text-5xl lg:text-[3.1rem] leading-[1.08] text-foreground mb-6"
            >
              <SplitText type="words">
                Cinematic Stories That People Remember.
              </SplitText>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md"
            >
              I create cinematic films, documentaries, travel videos and
              commercial edits that capture emotion, tell stories and leave a
              lasting impression.
            </motion.p>
          </div>

          {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
          <div className="lg:col-span-8">
            <FeaturedVideo />
            <ProjectCarousel />
          </div>
        </div>

        <FeatureStrip />
      </div>
    </section>
  );
}

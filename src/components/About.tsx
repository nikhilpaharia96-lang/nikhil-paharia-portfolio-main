import { useRef, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiTailwindcss,
  SiTypescript,
  SiFirebase,
  SiGithub,
  SiRender,
  SiFigma,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import profilePhoto from "../assets/images/profile-nobg.png";
import SplitText from "@/components/ui/SplitText";

const ease = [0.16, 1, 0.3, 1] as const;

/* ────────────────────────────────────────────────────────────
   Marker highlight — animated blue highlighter stroke behind text
   ──────────────────────────────────────────────────────────── */

function Marker({ children, delay = 0 }: { children: string; delay?: number }) {
  const rm = useReducedMotion();
  return (
    <span className="relative inline-block px-1 whitespace-nowrap">
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: rm ? 0.2 : 0.55, delay: rm ? 0 : delay, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-[0.06em] h-[0.42em] bg-primary/35 rounded-[2px] origin-left -z-[1]"
        style={{ transform: "skewX(-6deg)" }}
      />
      <span className="relative text-primary">{children}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Handwritten note — ink "written" reveal via clip-path wipe
   ──────────────────────────────────────────────────────────── */

function HandwrittenNote({
  children,
  className = "",
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const rm = useReducedMotion();
  return (
    <motion.p
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: rm ? 0.3 : 1.1, delay: rm ? 0 : delay, ease: "easeInOut" }}
      className={`font-hand text-primary/90 leading-snug ${className}`}
    >
      {children}
    </motion.p>
  );
}

/* ────────────────────────────────────────────────────────────
   Typewriter caption — small stamped, monospaced label
   ──────────────────────────────────────────────────────────── */

function TypewriterCaption({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-slate-500 bg-white/70 px-2 py-1 border border-slate-200/70 ${className}`}
    >
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Masking / washi tape strip — now interactive, lifts on hover
   ──────────────────────────────────────────────────────────── */

function Tape({
  className = "",
  rotate = -4,
  color = "amber",
}: {
  className?: string;
  rotate?: number;
  color?: "amber" | "blue";
}) {
  const bg = color === "blue" ? "rgba(191,219,254,0.55)" : "rgba(253,230,138,0.6)";
  const border = color === "blue" ? "rgba(147,197,253,0.6)" : "rgba(252,211,77,0.55)";
  return (
    <motion.div
      initial={{ rotate }}
      whileHover={{ rotate: rotate * 0.3, y: -2, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={`absolute w-16 h-6 sm:w-20 sm:h-7 shadow-sm pointer-events-auto ${className}`}
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        backdropFilter: "blur(1px)",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 2px, transparent 2px, transparent 6px)",
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Realistic paper clip — silver double-stroke SVG, wiggles on hover
   ──────────────────────────────────────────────────────────── */

function RealPaperClip({ className = "", rotate = -8 }: { className?: string; rotate?: number }) {
  return (
    <motion.svg
      className={`absolute pointer-events-none drop-shadow-md ${className}`}
      style={{ rotate }}
      whileHover={{ rotate: rotate + 10 }}
      transition={{ type: "spring", stiffness: 260, damping: 12 }}
      width="20"
      height="46"
      viewBox="0 0 22 52"
      fill="none"
    >
      <path
        d="M11 4C5 4 2 8 2 14v24c0 6 4 10 9 10s9-4 9-9V12.5c0-3.5-2.5-6-6-6s-6 2.5-6 6V36"
        stroke="#94a3b8"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M11 4C5 4 2 8 2 14v24c0 6 4 10 9 10s9-4 9-9V12.5c0-3.5-2.5-6-6-6s-6 2.5-6 6V36"
        stroke="#e2e8f0"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Coffee ring stain & soft ink smudge — pure decoration
   ──────────────────────────────────────────────────────────── */

function CoffeeStain({ className = "", size = 90 }: { className?: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle, transparent 54%, rgba(120,72,32,0.16) 58%, rgba(120,72,32,0.1) 64%, transparent 68%)",
        mixBlendMode: "multiply",
      }}
    />
  );
}

function InkSmudge({ className = "", size = 44 }: { className?: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full pointer-events-none blur-[7px] ${className}`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(29,111,235,0.16), transparent 70%)",
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Hand-drawn doodle — small decorative squiggles & sparks
   ──────────────────────────────────────────────────────────── */

const doodlePaths: Record<string, string> = {
  star: "M16 2 L18.5 13 L29 15 L18.5 17 L16 28 L13.5 17 L3 15 L13.5 13 Z",
  swirl: "M6 20 C 2 12, 14 6, 20 12 C 26 18, 16 24, 12 18 C 9 13, 16 11, 19 15",
  underline: "M2 20 C 10 14, 22 14, 30 20",
  spark: "M16 4 L17.5 13 L26 16 L17.5 19 L16 28 L14.5 19 L6 16 L14.5 13 Z",
};

function Doodle({
  type = "star",
  className = "",
  delay = 0,
  size = 30,
}: {
  type?: keyof typeof doodlePaths;
  className?: string;
  delay?: number;
  size?: number;
}) {
  const rm = useReducedMotion();
  return (
    <motion.svg
      aria-hidden="true"
      className={`absolute pointer-events-none text-primary/35 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: rm ? 0.2 : 0.6, delay: rm ? 0 : delay, ease: "backOut" }}
    >
      <path
        d={doodlePaths[type]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={type === "star" || type === "spark" ? "currentColor" : "none"}
        fillOpacity={0.15}
      />
    </motion.svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Achievement stamp — passport-style ink stamp badge
   ──────────────────────────────────────────────────────────── */

function Stamp({
  label,
  sub,
  rotate = -6,
  color = "#1d6feb",
  delay = 0,
}: {
  label: string;
  sub?: string;
  rotate?: number;
  color?: string;
  delay?: number;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.5, rotate: 0 }}
      whileInView={{ opacity: 0.88, scale: 1, rotate }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : delay, ease: "backOut" }}
      whileHover={{ scale: 1.08, rotate: rotate * 0.5 }}
      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center text-center select-none"
      style={{
        border: `2.5px solid ${color}`,
        color,
        mixBlendMode: "multiply",
      }}
    >
      <div
        className="absolute inset-[6px] rounded-full border border-dashed"
        style={{ borderColor: `${color}90` }}
      />
      <span className="font-mono font-bold uppercase text-[10px] sm:text-[11px] tracking-wider leading-tight px-3">
        {label}
      </span>
      {sub && (
        <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wide mt-1 opacity-80">
          {sub}
        </span>
      )}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Sticky note — drops in with a settling rotate
   ──────────────────────────────────────────────────────────── */

function StickyNote({
  title,
  children,
  color = "#fef3c7",
  rotate = -3,
  className = "",
  delay = 0,
}: {
  title?: string;
  children: React.ReactNode;
  color?: string;
  rotate?: number;
  className?: string;
  delay?: number;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : -60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: rm ? 0.3 : 0.7, delay: rm ? 0 : delay, ease: "backOut" }}
      whileHover={{ rotate: rotate * 0.4, scale: 1.04, y: -3 }}
      className={`relative w-48 sm:w-56 p-4 shadow-[0_14px_28px_-12px_rgba(70,50,20,0.35)] ${className}`}
      style={{ backgroundColor: color }}
    >
      <RealPaperClip className="-top-5 -left-1.5" rotate={-14} />
      {title && (
        <p className="font-hand text-lg text-slate-700 mb-1.5 border-b border-slate-400/30 pb-1">
          {title}
        </p>
      )}
      <div className="font-hand text-base text-slate-700 leading-snug">{children}</div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Torn paper card — jagged bottom edge via clip-path
   ──────────────────────────────────────────────────────────── */

function TornPaper({
  children,
  className = "",
  rotate = 0,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : delay, ease }}
      whileHover={{ rotate: rotate + (rotate >= 0 ? 1.5 : -1.5), y: -3 }}
      className={`relative bg-[#fdfaf3] shadow-[0_10px_24px_-10px_rgba(70,50,20,0.3)] ${className}`}
      style={{
        rotate,
        clipPath:
          "polygon(0% 2%, 4% 0%, 9% 3%, 15% 0%, 22% 2%, 29% 0%, 36% 3%, 44% 0%, 51% 2%, 58% 0%, 66% 3%, 74% 0%, 82% 2%, 90% 0%, 96% 2%, 100% 0%, 100% 100%, 0% 100%)",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Floating sticker — logos & doodles drifting around the notebook
   ──────────────────────────────────────────────────────────── */

function FloatingSticker({
  children,
  className = "",
  delay = 0,
  duration = 7,
  rotate = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  rotate?: number;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: rm ? 0.25 : 0.6, delay: rm ? 0 : delay, ease: "backOut" }}
      className={`absolute hidden lg:flex items-center justify-center pointer-events-none ${className}`}
    >
      <motion.div
        animate={rm ? {} : { y: [0, -12, 0], rotate: [rotate, rotate + 6, rotate] }}
        transition={{ duration, delay, repeat: rm ? 0 : Infinity, ease: "easeInOut" }}
        className="w-11 h-11 rounded-xl bg-white/85 backdrop-blur-sm border border-slate-200/70 shadow-[0_10px_22px_-8px_rgba(70,50,20,0.35)] flex items-center justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Layered paper stack — gives the notebook physical thickness
   ──────────────────────────────────────────────────────────── */

function PaperStack() {
  return (
    <>
      <div className="absolute inset-x-3 -bottom-2 top-3 rounded-[20px] sm:rounded-[28px] bg-[#f3e8cf] -rotate-1 -z-10 shadow-[0_20px_40px_-20px_rgba(70,50,20,0.3)]" />
      <div className="absolute inset-x-2 -bottom-3 top-2 rounded-[20px] sm:rounded-[28px] bg-[#ede0c2] rotate-[0.6deg] -z-20 shadow-[0_20px_40px_-20px_rgba(70,50,20,0.25)]" />
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Scattered tech icon
   ──────────────────────────────────────────────────────────── */

type TechItem = { Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; color: string };

const techStack: TechItem[] = [
  { Icon: SiReact, label: "React", color: "#61DAFB" },
  { Icon: SiNextdotjs, label: "Next.js", color: "#111827" },
  { Icon: SiNodedotjs, label: "Node.js", color: "#339933" },
  { Icon: SiExpress, label: "Express", color: "#4b5563" },
  { Icon: SiMongodb, label: "MongoDB", color: "#47A248" },
  { Icon: SiTailwindcss, label: "Tailwind", color: "#06B6D4" },
  { Icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  { Icon: SiFirebase, label: "Firebase", color: "#FFCA28" },
  { Icon: SiGithub, label: "GitHub", color: "#111827" },
  { Icon: SiRender, label: "Render", color: "#46E3B7" },
];

// fixed, hand-picked offsets so the scatter looks natural but never shifts on re-render
const techOffsets = [
  { rotate: -8, y: 0 }, { rotate: 6, y: 10 }, { rotate: -4, y: -6 }, { rotate: 9, y: 4 },
  { rotate: -10, y: 8 }, { rotate: 4, y: -4 }, { rotate: -6, y: 6 }, { rotate: 8, y: -8 },
  { rotate: -5, y: 2 }, { rotate: 7, y: -2 },
];

function TechScatter() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-7 sm:gap-x-7">
      {techStack.map(({ Icon, label, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: techOffsets[i].y }}
          viewport={{ once: false, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.04 * i, ease: "backOut" }}
          whileHover={{ scale: 1.15, rotate: 0, y: 0 }}
          style={{ rotate: techOffsets[i].rotate }}
          className="flex flex-col items-center gap-1.5 cursor-default"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white shadow-[0_8px_18px_-8px_rgba(70,50,20,0.4)] border border-slate-200/70 flex items-center justify-center">
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <span className="font-hand text-sm text-slate-500">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Favorite things — scrapbook stickers (die-cut circles)
   ──────────────────────────────────────────────────────────── */

const favorites = [
  { emoji: "☕", label: "Assam Tea" },
  { emoji: "⚽", label: "Football" },
  { emoji: "💻", label: "Coding" },
  { emoji: "🎬", label: "Video Editing" },
  { emoji: "📖", label: "Learning" },
  { emoji: "🌿", label: "Nature" },
];

const favRotate = [-7, 5, -3, 8, -6, 4];

function FavoriteThings() {
  return (
    <div className="flex flex-wrap gap-4 sm:gap-5">
      {favorites.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-40px" }}
          transition={{ duration: 0.45, delay: 0.06 * i, ease: "backOut" }}
          whileHover={{ scale: 1.12, rotate: 0, y: -4 }}
          style={{ rotate: favRotate[i] }}
          className="relative w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-full bg-white p-[3px]
                     shadow-[0_10px_20px_-8px_rgba(70,50,20,0.45)] ring-1 ring-slate-200/70 cursor-default"
        >
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white overflow-hidden">
            <span className="text-lg sm:text-xl leading-none">{f.emoji}</span>
            <span className="font-hand text-[10px] sm:text-[11px] text-slate-600 mt-0.5 leading-none text-center px-1">
              {f.label}
            </span>
          </div>
          {/* peeled corner */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white shadow-sm"
            style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Daily fuel — torn checklist paper, checks tick in one by one
   ──────────────────────────────────────────────────────────── */

const dailyFuel = ["Chai", "Music", "Focus", "Curiosity", "Discipline"];

function DailyFuel() {
  return (
    <TornPaper rotate={2} delay={0.1} className="p-5 sm:p-6 w-full max-w-[15rem]">
      <CoffeeStain className="-top-4 -right-4" size={64} />
      <p className="font-hand text-lg text-slate-700 mb-3 border-b border-slate-300/60 pb-1.5">
        Daily Fuel
      </p>
      <ul className="space-y-2">
        {dailyFuel.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease }}
            className="flex items-center gap-2"
          >
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="shrink-0 text-primary"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.12 }}
            >
              <motion.path
                d="M2 8 L6 12 L14 3"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
            <span className="font-hand text-base text-slate-700">{item}</span>
          </motion.li>
        ))}
      </ul>
    </TornPaper>
  );
}

/* ────────────────────────────────────────────────────────────
   Hand-drawn arrow connector
   ──────────────────────────────────────────────────────────── */

function DrawnArrow({ className = "", path, delay = 0 }: { className?: string; path: string; delay?: number }) {
  const rm = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      className={`absolute pointer-events-none hidden lg:block ${className}`}
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
    >
      <motion.path
        d={path}
        stroke="#1d6feb"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="3 5"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.55 }}
        viewport={{ once: false }}
        transition={{ duration: rm ? 0.3 : 1.4, delay: rm ? 0 : delay, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Journey timeline — handcrafted milestone path
   ──────────────────────────────────────────────────────────── */

const journey = [
  { emoji: "💻", label: "First Line of Code", note: "curiosity + a slow laptop" },
  { emoji: "🎨", label: "Learned UI/UX", note: "started designing with intent" },
  { emoji: "🚀", label: "First Client Project", note: "real problems, real deadlines" },
  { emoji: "🎬", label: "Picked Up Editing", note: "stories deserve good cuts too" },
  { emoji: "📦", label: "50+ Projects Shipped", note: "still counting" },
  { emoji: "🌱", label: "Still Learning", note: "every single day" },
];

function JourneyTimeline() {
  const rm = useReducedMotion();
  return (
    <div className="lg:col-span-2 relative px-6 sm:px-10 lg:px-14 py-12 sm:py-16 border-t border-dashed border-slate-300/60">
      <InkSmudge className="top-4 left-10" size={50} />
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-10 text-center">
        The Journey So Far
      </p>

      {/* Desktop — curved dashed path with alternating milestones */}
      <div className="hidden lg:block relative h-44">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none">
          <motion.path
            d="M10 50 C 180 8, 340 92, 500 50 S 820 8, 990 50"
            stroke="#1d6feb"
            strokeWidth="1.5"
            strokeDasharray="2 8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: rm ? 0.4 : 1.8, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 grid grid-cols-6">
          {journey.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: rm ? 0 : i % 2 === 0 ? -14 : 14, scale: 0.7 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : 0.15 * i, ease: "backOut" }}
              whileHover={{ scale: 1.08, y: -4 }}
              className={`flex flex-col items-center gap-2 text-center ${i % 2 === 0 ? "mt-2" : "mt-14"}`}
            >
              <div className="w-10 h-10 rounded-full bg-white shadow-[0_8px_16px_-6px_rgba(70,50,20,0.4)] border border-slate-200 flex items-center justify-center text-base">
                {step.emoji}
              </div>
              <div className="max-w-[7.5rem]">
                <p className="font-hand text-sm text-slate-700 leading-tight">{step.label}</p>
                <p className="font-mono text-[8px] uppercase tracking-wide text-slate-400 mt-0.5">
                  {step.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile — vertical timeline */}
      <div className="lg:hidden relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 border-l border-dashed border-primary/40" />
        <div className="space-y-8">
          {journey.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: rm ? 0 : -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : 0.08 * i, ease }}
              className="relative flex items-start gap-4"
            >
              <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xs">
                {step.emoji}
              </div>
              <div>
                <p className="font-hand text-lg text-slate-700 leading-tight">{step.label}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">
                  {step.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main About section — the notebook
   ──────────────────────────────────────────────────────────── */

export default function About() {
  const notebookRef = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 120, damping: 20, mass: 0.7 };
  const rotateX = useSpring(useTransform(my, [0, 1], [2, -2]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-2, 2]), springCfg);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rm) return;
    const rect = notebookRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const dust = useMemo(() => Array.from({ length: 10 }), []);

  return (
    <section
      id="about"
      className="relative overflow-hidden section-wrap max-w-full py-20 sm:py-28 md:py-32 lg:py-36 bg-white"
      aria-label="About — My Story"
    >
      {/* ambient paper dust */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {dust.map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              left: `${(i * 47) % 100}%`,
              top: `${(i * 31) % 100}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
            }}
            animate={rm ? {} : { y: [0, -22, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 7 + (i % 4), delay: i * 0.4, repeat: rm ? 0 : Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="container-tight relative z-10 max-w-full">
        {/* section intro label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-xs font-mono font-semibold tracking-[0.18em] uppercase text-primary mb-5">
            📔 My Story
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-foreground">
            <SplitText type="words">A Page From My Life.</SplitText>
          </h2>
        </motion.div>

        {/* ═══════════════ THE NOTEBOOK ═══════════════ */}
        <div className="relative max-w-6xl mx-auto">
          {/* floating stickers around the notebook */}
          <FloatingSticker className="-top-6 left-4 sm:left-10" delay={0} duration={7}>
            <SiFigma className="w-5 h-5 text-[#F24E1E]" />
          </FloatingSticker>
          <FloatingSticker className="-top-10 right-10 sm:right-24" delay={0.6} duration={8} rotate={-6}>
            <SiGithub className="w-5 h-5 text-slate-800" />
          </FloatingSticker>
          <FloatingSticker className="top-1/3 -left-14" delay={1.1} duration={6.5} rotate={4}>
            <VscVscode className="w-5 h-5 text-[#0098FF]" />
          </FloatingSticker>
          <FloatingSticker className="top-1/4 -right-12" delay={0.3} duration={7.5} rotate={-4}>
            <SiReact className="w-5 h-5 text-[#61DAFB]" />
          </FloatingSticker>
          <FloatingSticker className="bottom-24 -left-10" delay={0.9} duration={6} rotate={6}>
            <span className="text-lg">☕</span>
          </FloatingSticker>
          <FloatingSticker className="bottom-16 -right-14" delay={1.4} duration={7} rotate={-5}>
            <span className="text-lg">🌿</span>
          </FloatingSticker>
          <FloatingSticker className="-bottom-8 left-1/3" delay={0.5} duration={6.8} rotate={3}>
            <RealPaperClip rotate={0} className="static" />
          </FloatingSticker>

          {/* physical page thickness behind the notebook */}
          <PaperStack />

          {/* ── Notebook body ── */}
          <motion.div
            ref={notebookRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: rm ? 0 : 50, scale: rm ? 1 : 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: rm ? 0.4 : 1, ease }}
            className="relative rounded-[20px] sm:rounded-[28px] overflow-hidden
                       shadow-[0_2px_0_rgba(0,0,0,0.05)_inset,0_50px_100px_-30px_rgba(70,50,20,0.35)]
                       border border-[#e8dcc4]"
          >
            {/* leather-ish outer frame */}
            <div className="absolute inset-0 pointer-events-none rounded-[20px] sm:rounded-[28px] ring-1 ring-inset ring-black/5 z-30" />

            {/* folded corner (top-right) */}
            <div
              className="absolute top-0 right-0 w-10 h-10 sm:w-14 sm:h-14 z-20 pointer-events-none"
              style={{
                clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                background: "linear-gradient(225deg, #f6ecd6, #e4d5ae)",
                boxShadow: "-4px 4px 8px rgba(70,50,20,0.25)",
              }}
            />
            {/* folded corner (bottom-left, subtler dog-ear) */}
            <div
              className="absolute bottom-0 left-0 w-7 h-7 sm:w-9 sm:h-9 z-20 pointer-events-none opacity-80"
              style={{
                clipPath: "polygon(0 100%, 0 0, 100% 100%)",
                background: "linear-gradient(45deg, #f6ecd6, #e4d5ae)",
                boxShadow: "4px -4px 8px rgba(70,50,20,0.2)",
              }}
            />

            {/* paper grain texture, warm cream base */}
            <div
              className="relative grid grid-cols-1 lg:grid-cols-2"
              style={{
                backgroundColor: "#fbf5e6",
                backgroundImage:
                  "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.4), transparent 40%), repeating-radial-gradient(circle at 50% 50%, rgba(120,90,40,0.025) 0, rgba(120,90,40,0.025) 1px, transparent 1px, transparent 3px)",
              }}
            >
              {/* center spine — deeper binding shadow */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 z-10 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-black/[0.14] via-black/[0.02] to-black/[0.14]" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-black/20" />
                {/* stitching dots */}
                <div className="absolute inset-y-6 left-1/2 -translate-x-1/2 w-px flex flex-col justify-between">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <span key={i} className="w-[3px] h-[3px] rounded-full bg-black/15 -ml-[1px]" />
                  ))}
                </div>
              </div>

              {/* ═══════════ LEFT PAGE ═══════════ */}
              <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:pr-14 lg:pl-12">
                <CoffeeStain className="top-2 right-6 sm:right-10" size={70} />
                <Doodle type="swirl" className="top-24 right-2 sm:right-6" delay={0.3} />

                <div className="flex items-center justify-between mb-8 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  <span>01 — About Me</span>
                  <span>The Beginning</span>
                </div>

                {/* headline with marker highlights */}
                <motion.h3
                  initial={{ opacity: 0, y: rm ? 0 : 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ duration: rm ? 0.3 : 0.7, ease }}
                  className="font-serif font-extrabold text-[1.9rem] sm:text-4xl leading-[1.15] text-foreground mb-3"
                >
                  I started learning <Marker delay={0.15}>CODE</Marker> because I
                  wanted to change my <Marker delay={0.35}>FAMILY's</Marker> future.
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: rm ? 0 : 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 0.15 }}
                  className="font-serif text-lg sm:text-xl text-slate-500 leading-snug mb-8"
                >
                  A boy from a tea garden in <Marker delay={0.5}>ASSAM</Marker>,
                  chasing a bigger <Marker delay={0.65}>DREAM</Marker> — always
                  reaching for <Marker delay={0.8}>BETTER</Marker>.
                </motion.p>

                {/* personal paragraph */}
                <motion.div
                  initial={{ opacity: 0, y: rm ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-60px" }}
                  transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 0.25 }}
                  className="relative text-slate-600 leading-relaxed mb-10 max-w-md"
                >
                  <InkSmudge className="-left-3 top-2" size={30} />
                  <p>
                    I didn't have expensive gadgets. I only had curiosity — and
                    a laptop that struggled to keep up with my ambition. Every
                    small project taught me something new, and slowly, that
                    curiosity turned into a craft.
                  </p>
                </motion.div>

                {/* silhouette — framed as a proper taped Polaroid */}
                <div className="relative mb-10 max-w-xs">
                  <motion.div
                    initial={{ opacity: 0, y: rm ? 0 : 30, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                    viewport={{ once: false, margin: "-80px" }}
                    transition={{ duration: rm ? 0.3 : 0.8, ease: "backOut" }}
                    whileHover={{ rotate: 0, y: -4, scale: 1.02 }}
                    className="relative bg-white p-2.5 pb-9 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)]"
                  >
                    <Tape className="-top-3 left-8" rotate={-6} />
                    <Tape className="-top-3 right-8" rotate={5} color="blue" />
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden"
                      style={{ background: "linear-gradient(180deg,#dfe9f5,#bcd0e6 60%,#9fb8d6)" }}
                    >
                      <img
                        src={profilePhoto}
                        alt="A silhouette, looking out over the hills"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        style={{
                          filter: "grayscale(1) contrast(1.35) brightness(0.35)",
                          mixBlendMode: "multiply",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-amber-100/20" />
                      <svg
                        className="absolute bottom-0 left-0 w-full h-1/3 opacity-60"
                        viewBox="0 0 200 60"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <path
                          d="M0 60 L30 30 L55 45 L85 15 L115 40 L145 20 L175 42 L200 28 L200 60 Z"
                          fill="#7c93b3"
                          opacity="0.55"
                        />
                      </svg>
                    </div>
                    <p className="font-hand text-base text-slate-600 text-center mt-2 leading-tight">
                      god's plan
                    </p>
                  </motion.div>
                </div>

                {/* handwritten note */}
                <div className="relative mb-10 max-w-xs">
                  <InkSmudge className="-top-2 left-2" size={26} />
                  <HandwrittenNote className="text-xl sm:text-2xl -rotate-1" delay={0.1}>
                    "It started as curiosity. Then it became a way of thinking."
                  </HandwrittenNote>
                </div>

                {/* polaroid */}
                <motion.div
                  initial={{ opacity: 0, y: rm ? 0 : 30, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: -4 }}
                  viewport={{ once: false, margin: "-60px" }}
                  transition={{ duration: rm ? 0.3 : 0.7, ease: "backOut" }}
                  whileHover={{ rotate: 0, scale: 1.05, y: -3 }}
                  className="relative w-40 sm:w-48 bg-white p-2.5 pb-8 shadow-[0_16px_32px_-14px_rgba(70,50,20,0.4)]"
                >
                  <Tape className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} />
                  <RealPaperClip className="-top-3 -right-2" rotate={20} />
                  <div className="w-full aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={profilePhoto}
                      alt="Nikhil Paharia"
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <p className="font-hand text-sm text-slate-600 text-center mt-2 leading-tight">
                    A boy from a small tea garden in Assam.
                  </p>
                  <TypewriterCaption className="absolute -bottom-3 right-2 rotate-2">
                    est. assam
                  </TypewriterCaption>
                </motion.div>
              </div>

              {/* ═══════════ RIGHT PAGE ═══════════ */}
              <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:pl-14 lg:pr-12 border-t lg:border-t-0 border-dashed border-slate-300/60">
                <Doodle type="spark" className="top-6 right-8" delay={0.2} size={24} />

                <div className="flex items-center justify-between mb-8 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  <span>Why I Build</span>
                  <span>What Drives Me</span>
                </div>

                {/* purpose torn paper */}
                <TornPaper className="p-5 sm:p-6 mb-8 max-w-md" rotate={-1} delay={0.05}>
                  <RealPaperClip className="-top-6 left-4" rotate={-10} />
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary mb-2">
                    My Purpose
                  </p>
                  <h4 className="font-serif font-bold text-xl sm:text-2xl text-foreground mb-3">
                    Solving problems, one product at a time.
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    I build websites because I love watching an idea turn into
                    something people can actually use. Every bug I fix and
                    every interface I polish is a small problem solved —
                    that's what keeps me hooked.
                  </p>
                </TornPaper>

                {/* mission */}
                <motion.blockquote
                  initial={{ opacity: 0, y: rm ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-60px" }}
                  transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 0.1 }}
                  className="relative font-hand text-2xl sm:text-3xl text-primary leading-snug mb-10 max-w-md border-l-2 border-primary/40 pl-4"
                >
                  <Doodle type="underline" className="-bottom-2 left-4" delay={0.4} size={54} />
                  "I want to build digital products that improve people's lives."
                </motion.blockquote>

                {/* tech stack */}
                <div className="mb-10">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-4">
                    Tech I Reach For
                  </p>
                  <TechScatter />
                </div>

                {/* favorite things */}
                <div className="mb-10 max-w-sm">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-4">
                    Favorite Things
                  </p>
                  <FavoriteThings />
                </div>

                {/* daily fuel + sticky note row */}
                <div className="relative flex flex-wrap items-start gap-6 sm:gap-8">
                  <DailyFuel />
                  <StickyNote
                    title="Note to Self"
                    color="#fef9c3"
                    rotate={4}
                    delay={0.15}
                    className="mt-2"
                  >
                    Focus on improving 1% every day. Let the results take care
                    of themselves.
                  </StickyNote>
                </div>
              </div>

              {/* connecting hand-drawn arrows (desktop only) */}
              <DrawnArrow
                className="top-[420px] left-[46%]"
                path="M10 10 C 60 20, 90 60, 140 90"
                delay={0.4}
              />

              {/* ═══════════ JOURNEY TIMELINE ═══════════ */}
              <JourneyTimeline />

              {/* ═══════════ FULL-WIDTH ENDING STRIP ═══════════ */}
              <motion.div
                initial={{ opacity: 0, y: rm ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: rm ? 0.3 : 0.8, ease }}
                className="lg:col-span-2 relative px-6 py-12 sm:px-10 sm:py-16 text-center border-t border-dashed border-slate-300/60"
              >
                <Doodle type="star" className="top-6 left-[15%]" delay={0.1} size={22} />
                <Doodle type="star" className="bottom-8 right-[18%]" delay={0.3} size={18} />

                {/* achievement stamps */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10">
                  <Stamp label="Self-Taught" sub="since day one" rotate={-8} color="#1d6feb" delay={0} />
                  <Stamp label="50+ Projects" sub="and counting" rotate={5} color="#b91c1c" delay={0.15} />
                  <Stamp label="3+ Years" sub="of building" rotate={-4} color="#1d6feb" delay={0.3} />
                </div>

                <p className="font-hand text-3xl sm:text-4xl md:text-5xl text-foreground leading-snug mb-3">
                  Still figuring things out.
                </p>
                <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
                  Because every great story is still being written.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

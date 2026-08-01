import { useRef, useMemo, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
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
import myNewPhoto from "../assets/images/my-new-photo.jpg";
import SplitText from "@/components/ui/SplitText";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once at module load. This only affects this file/section —
// ScrollTrigger is the single authority for *when* each notebook phase
// happens as the user scrolls; Framer Motion (used throughout the
// components above) stays responsible for *how* each element actually
// animates (hover, idle float, the interpolation curve itself), per the
// "GSAP for the scroll timeline, Framer for micro-interactions" split.
gsap.registerPlugin(ScrollTrigger);

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The eight beats of the cinematic scroll sequence. Phase 1 is the resting
 * state right after the notebook itself has appeared (handled separately,
 * see the notebook body's own one-time `whileInView` below) — at phase 1
 * the pages are still essentially empty. Each subsequent phase reveals one
 * more "layer" of the story as the notebook scrolls through the viewport,
 * and — because it's driven by scroll position rather than a one-shot
 * trigger — reverses cleanly if the user scrolls back up.
 */
const TOTAL_PHASES = 8;
const PHASE_THRESHOLDS = [0.1, 0.24, 0.38, 0.52, 0.64, 0.76, 0.9]; // 7 boundaries → 8 phases

function progressToPhase(progress: number): number {
  for (let i = 0; i < PHASE_THRESHOLDS.length; i++) {
    if (progress < PHASE_THRESHOLDS[i]) return i + 1;
  }
  return TOTAL_PHASES;
}

/**
 * Page 1 (left) and page 2 (right) start folded shut against the spine —
 * like the notebook's just been picked up closed — then fan open around
 * that spine hinge as the reader scrolls into the story, stay open through
 * the whole two-page reveal, then fold shut again as the section finishes
 * scrolling past. `progress` is the same 0–1 scroll value driving
 * `progressToPhase` above, so the turn and the page content stay perfectly
 * in sync with one another and with scroll direction.
 */
const PAGE_TURN_OPEN_END = 0.12; // pages finish turning open by 12% through the section
const PAGE_TURN_CLOSE_START = 0.9; // pages start turning shut again for the last 10%

function progressToPageTurn(progress: number): number {
  if (progress <= PAGE_TURN_OPEN_END) return progress / PAGE_TURN_OPEN_END;
  if (progress >= PAGE_TURN_CLOSE_START) {
    return Math.max(0, 1 - (progress - PAGE_TURN_CLOSE_START) / (1 - PAGE_TURN_CLOSE_START));
  }
  return 1;
}

/* ────────────────────────────────────────────────────────────
   Marker highlight — animated blue highlighter stroke behind text
   ──────────────────────────────────────────────────────────── */

function Marker({ children, delay = 0, active = true }: { children: string; delay?: number; active?: boolean }) {
  const rm = useReducedMotion();
  return (
    <span className="relative inline-block px-1 whitespace-nowrap">
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
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
  active = true,
}: {
  children: string;
  className?: string;
  delay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.p
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
      animate={
        active
          ? { clipPath: "inset(0 0% 0 0)", opacity: 1 }
          : { clipPath: "inset(0 100% 0 0)", opacity: 0 }
      }
      transition={{ duration: rm ? 0.3 : 1.1, delay: rm ? 0 : delay, ease: "easeInOut" }}
      className={`font-hand text-primary/90 leading-snug ${className}`}
    >
      {children}
    </motion.p>
  );
}

/* ────────────────────────────────────────────────────────────
   Marker underline — a real pen stroke that draws itself
   left-to-right beneath a quote, instead of a doodle that just
   pops into place.
   ──────────────────────────────────────────────────────────── */

function MarkerUnderline({
  className = "",
  delay = 0,
  width = 200,
  active = true,
}: {
  className?: string;
  delay?: number;
  width?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      className={`block pointer-events-none ${className}`}
      width={width}
      height={16}
      viewBox={`0 0 ${width} 16`}
      fill="none"
    >
      <motion.path
        d={`M2 8 C ${width * 0.25} 2, ${width * 0.6} 13, ${width - 2} 6`}
        stroke="#1d6feb"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.6 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: rm ? 0.3 : 0.9, delay: rm ? 0 : delay, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Circle highlight — a hand-drawn, slightly imperfect ellipse
   that draws itself around a single word
   ──────────────────────────────────────────────────────────── */

function CircleHighlight({
  children,
  delay = 0,
  active = true,
}: {
  children: string;
  delay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <span className="relative inline-block px-1.5">
      <svg
        aria-hidden="true"
        className="absolute -inset-x-1.5 -inset-y-1.5 pointer-events-none"
        viewBox="0 0 100 44"
        preserveAspectRatio="none"
        fill="none"
      >
        <motion.path
          d="M52 3 C 22 1, 3 11, 4 22 C 5 34, 26 42, 52 41 C 80 40, 97 32, 96 21 C 95 9, 76 2, 50 4"
          stroke="#1d6feb"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: rm ? 0.3 : 0.8, delay: rm ? 0 : delay, ease: "easeInOut" }}
        />
      </svg>
      <span className="relative text-primary">{children}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Hanging tag — a rotated luggage-tag style stat badge,
   connected to the page by a small hole + string feel
   ──────────────────────────────────────────────────────────── */

function HangingTag({
  value,
  label,
  rotate = 6,
  delay = 0,
  active = true,
}: {
  value: string;
  label: string;
  rotate?: number;
  delay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : -30, rotate: 0, scale: 0.85 }}
      animate={
        active
          ? { opacity: 1, y: 0, rotate, scale: 1 }
          : { opacity: 0, y: rm ? 0 : -30, rotate: 0, scale: 0.85 }
      }
      transition={{
        duration: rm ? 0.25 : 0.6,
        delay: rm ? 0 : delay,
        type: rm ? "tween" : "spring",
        stiffness: rm ? undefined : 220,
        damping: rm ? undefined : 16,
      }}
      whileHover={{ rotate: rotate * 0.3, scale: 1.05 }}
      className="relative w-32 sm:w-36 px-4 py-3 text-center"
      style={{
        background: "linear-gradient(155deg, #f3e2c2, #e6cfa0)",
        clipPath: "polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)",
        boxShadow: "0 14px 28px -12px rgba(70,50,20,0.45)",
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-[9%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70 border border-[#c9ab72]"
      />
      <p className="font-serif font-extrabold text-lg sm:text-xl text-[#7a4a12] leading-none">{value}</p>
      <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#8a6a3a] mt-1 leading-tight">
        {label}
      </p>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Mountain doodle — quiet line-art scenery for the page bottoms
   ──────────────────────────────────────────────────────────── */

function MountainDoodle({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none text-slate-300 ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      width="180"
      height="46"
      viewBox="0 0 180 46"
      fill="none"
    >
      <path
        d="M2 44 L34 14 L52 30 L78 6 L104 32 L124 18 L146 40 L162 24 L178 40"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path d="M60 44 L70 34 L80 44" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M140 44 L148 36 L156 44" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Signature — a small hand-drawn signature that writes itself,
   the closing beat of the Final Phase
   ──────────────────────────────────────────────────────────── */

function Signature({ active = true, delay = 0 }: { active?: boolean; delay?: number }) {
  const rm = useReducedMotion();
  return (
    <motion.svg
      aria-label="Nikhil — signature"
      className="mx-auto text-primary/80"
      width="180"
      height="60"
      viewBox="0 0 180 60"
      fill="none"
      initial={{ opacity: 0 }}
      animate={active ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3, delay: rm ? 0 : delay }}
    >
      <motion.path
        d="M8 42 C 14 18, 22 14, 26 30 C 29 40, 24 46, 30 40 C 38 32, 44 16, 50 30
           C 54 40, 58 44, 64 34 C 70 24, 74 20, 80 32
           C 84 40, 90 44, 96 30 C 100 20, 106 16, 112 24
           C 116 30, 118 40, 124 36 C 132 30, 140 20, 148 26
           C 156 32, 162 40, 170 30"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: rm ? 0.3 : 1.3, delay: rm ? 0 : delay + 0.1, ease: "easeInOut" }}
      />
      <motion.path
        d="M20 50 C 60 56, 120 56, 160 48"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: rm ? 0.2 : 0.5, delay: rm ? 0 : delay + 1.2, ease: "easeOut" }}
      />
    </motion.svg>
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
  floatDuration = 5,
  floatDelay = 0,
  active = true,
}: {
  className?: string;
  rotate?: number;
  color?: "amber" | "blue";
  floatDuration?: number;
  floatDelay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  const bg = color === "blue" ? "rgba(191,219,254,0.55)" : "rgba(253,230,138,0.6)";
  const border = color === "blue" ? "rgba(147,197,253,0.6)" : "rgba(252,211,77,0.55)";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: rotate - 25 }}
      animate={
        active
          ? { opacity: 1, scale: 1, rotate }
          : { opacity: 0, scale: 0.7, rotate: rotate - 25 }
      }
      transition={{ duration: rm ? 0.2 : 0.45, delay: rm ? 0 : floatDelay * 0.3, ease: "backOut" }}
      className={`absolute w-16 h-6 sm:w-20 sm:h-7 pointer-events-auto ${className}`}
    >
      {/* Nested layer: once the tape above has "settled" into place, this
          takes over with its own continuous idle drift + hover stretch —
          kept separate so the one-time landing settle and the endless
          idle loop never fight over the same rotate/scale values. Carries
          all the actual visible tape styling, since transforms on the
          (invisible) outer wrapper wouldn't otherwise render anything. */}
      <motion.div
        className="w-full h-full shadow-sm"
        initial={{ rotate: 0 }}
        animate={rm ? {} : { rotate: [0, 1.4, 0], y: [0, -2, 0] }}
        transition={
          rm ? undefined : { duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{
          rotate: -rotate * 0.3,
          y: -2,
          scaleX: 1.08,
          scaleY: 1.03,
          transition: { type: "spring", stiffness: 300, damping: 18 },
        }}
        style={{
          backgroundColor: bg,
          border: `1px solid ${border}`,
          backdropFilter: "blur(1px)",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 2px, transparent 2px, transparent 6px)",
        }}
      />
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Realistic paper clip — silver double-stroke SVG, wiggles on hover
   ──────────────────────────────────────────────────────────── */

function RealPaperClip({
  className = "",
  rotate = -8,
  floatDuration = 6,
  floatDelay = 0,
  active = true,
}: {
  className?: string;
  rotate?: number;
  floatDuration?: number;
  floatDelay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      className={`absolute inline-block pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: rm ? 0.2 : 0.4, delay: rm ? 0 : floatDelay * 0.3, ease: "backOut" }}
    >
      {/* Nested layer for the continuous idle sway + hover response, kept
          separate from the one-time entrance above for the same reason as
          Tape: two loops targeting the same `rotate` would otherwise
          visibly fight each other. */}
      <motion.svg
        className="drop-shadow-md"
        initial={{ rotate }}
        animate={rm ? { rotate } : { rotate: [rotate, rotate + 3, rotate - 1.5, rotate] }}
        transition={
          rm ? undefined : { duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{ rotate: rotate + 10, transition: { type: "spring", stiffness: 260, damping: 12 } }}
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
    </motion.div>
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
  active = true,
}: {
  type?: keyof typeof doodlePaths;
  className?: string;
  delay?: number;
  size?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
      animate={active ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
      transition={{ duration: rm ? 0.2 : 0.6, delay: rm ? 0 : delay, ease: "backOut" }}
    >
      {/* Nested layer for a very small continuous idle sway, so doodles
          feel hand-drawn/alive rather than static once they've popped in.
          Separate element from the entrance transform above, so the two
          never compete for the same `rotate` value. */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="text-primary/35"
        animate={rm ? {} : { rotate: [0, 3, -2, 0], y: [0, -1.5, 0] }}
        transition={rm ? undefined : { duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
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
    </motion.div>
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
  active = true,
}: {
  label: string;
  sub?: string;
  rotate?: number;
  color?: string;
  delay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.5, rotate: 0 }}
      animate={active ? { opacity: 0.88, scale: 1, rotate } : { opacity: 0, scale: 1.5, rotate: 0 }}
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
  floatDuration = 5.5,
  active = true,
}: {
  title?: string;
  children: React.ReactNode;
  color?: string;
  rotate?: number;
  className?: string;
  delay?: number;
  floatDuration?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : -60, rotate: 0 }}
      animate={active ? { opacity: 1, y: 0, rotate } : { opacity: 0, y: rm ? 0 : -60, rotate: 0 }}
      transition={{ duration: rm ? 0.3 : 0.7, delay: rm ? 0 : delay, ease: "backOut" }}
      whileHover={{
        rotate: rm ? rotate : [rotate, rotate * 0.2, rotate * 0.7, rotate * 0.35, rotate * 0.5],
        scale: 1.04,
        transition: rm ? undefined : { duration: 0.6, ease: "easeInOut" },
      }}
      className={`relative w-48 sm:w-56 shadow-[0_14px_28px_-12px_rgba(70,50,20,0.35)] ${className}`}
      style={{ backgroundColor: color }}
    >
      {/* Nested layer for the continuous idle drift — kept separate from
          the outer entrance/hover transforms above so the two motions
          compose instead of fighting over the same `y`/`rotate` values
          (which previously caused a visible snap whenever a hover started
          mid-float). */}
      <motion.div
        className="p-4"
        animate={rm ? {} : { y: [0, -3, 0, 3, 0] }}
        transition={rm ? undefined : { duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
      >
        <RealPaperClip className="-top-5 -left-1.5" rotate={-14} active={active} />
        {title && (
          <p className="font-hand text-lg text-slate-700 mb-1.5 border-b border-slate-400/30 pb-1">
            {title}
          </p>
        )}
        <div className="font-hand text-base text-slate-700 leading-snug">{children}</div>
      </motion.div>
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
  active = true,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
  active?: boolean;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : 24 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 24 }}
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
      <div className="absolute inset-x-3 -bottom-2 top-3 rounded-[24px] bg-[#f3e8cf] -rotate-1 -z-10 shadow-[0_20px_40px_-20px_rgba(70,50,20,0.3)]" />
      <div className="absolute inset-x-2 -bottom-3 top-2 rounded-[24px] bg-[#ede0c2] rotate-[0.6deg] -z-20 shadow-[0_20px_40px_-20px_rgba(70,50,20,0.25)]" />
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

// A near-flat row (small offsets only) so the tech icons read as a tidy
// line-up rather than a heavy scatter — matches the cleaner, more editorial
// reference composition while keeping a touch of hand-placed imperfection.
const techOffsets = [
  { rotate: -2, y: 0 }, { rotate: 1, y: 2 }, { rotate: -1, y: -1 }, { rotate: 2, y: 1 },
  { rotate: -2, y: 2 }, { rotate: 1, y: -1 }, { rotate: -1, y: 1 }, { rotate: 2, y: -2 },
  { rotate: -1, y: 0 }, { rotate: 1, y: -1 },
];

function TechScatter({ active = true }: { active?: boolean }) {
  const rm = useReducedMotion();
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-7 sm:gap-x-7">
      {techStack.map(({ Icon, label, color }, i) => {
        const baseRotate = techOffsets[i].rotate;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={
              active
                ? { opacity: 1, scale: 1, y: techOffsets[i].y }
                : { opacity: 0, scale: 0.5, y: 20 }
            }
            transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : 0.06 * i, ease: "backOut" }}
            whileHover={{ scale: 1.12, rotate: baseRotate + (baseRotate >= 0 ? -10 : 10), y: techOffsets[i].y - 4 }}
            style={{ rotate: baseRotate }}
            className="group relative flex flex-col items-center gap-1.5 cursor-default"
          >
            {/* soft glow behind the active icon — pure opacity fade via
                Tailwind's group-hover, no continuous animation loop, so
                it costs nothing until actually hovered */}
            <div
              aria-hidden="true"
              className="absolute top-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
              style={{ backgroundColor: color }}
            />
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white shadow-[0_8px_18px_-8px_rgba(70,50,20,0.4)] border border-slate-200/70 flex items-center justify-center">
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <span className="relative font-hand text-sm text-slate-500">{label}</span>
          </motion.div>
        );
      })}
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

function FavoriteThings({ active = true }: { active?: boolean }) {
  const rm = useReducedMotion();
  return (
    <div className="flex flex-wrap gap-4 sm:gap-5">
      {favorites.map((f, i) => (
        <motion.div
          key={f.label}
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 16 }}
          transition={{ duration: rm ? 0.25 : 0.45, delay: rm ? 0 : 0.08 * i, ease: "backOut" }}
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

function DailyFuel({ active = true }: { active?: boolean }) {
  const rm = useReducedMotion();
  return (
    <TornPaper rotate={2} delay={0.1} active={active} className="p-5 sm:p-6 w-full max-w-[15rem]">
      <CoffeeStain className="-top-4 -right-4" size={64} />
      <p className="font-hand text-lg text-slate-700 mb-3 border-b border-slate-300/60 pb-1.5">
        Daily Fuel
      </p>
      <ul className="space-y-2">
        {dailyFuel.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -12 }}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.4, delay: rm ? 0 : 0.15 + i * 0.12, ease }}
            className="flex items-center gap-2"
          >
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="shrink-0 text-primary"
              initial={{ pathLength: 0 }}
              animate={active ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 0.35, delay: rm ? 0 : 0.25 + i * 0.12 }}
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

function DrawnArrow({
  className = "",
  path,
  delay = 0,
  active = true,
}: {
  className?: string;
  path: string;
  delay?: number;
  active?: boolean;
}) {
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
        animate={active ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
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

function JourneyTimeline({ active = true }: { active?: boolean }) {
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
            animate={active ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: rm ? 0.4 : 1.8, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 grid grid-cols-6">
          {journey.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: rm ? 0 : i % 2 === 0 ? -14 : 14, scale: 0.7 }}
              animate={
                active
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: rm ? 0 : i % 2 === 0 ? -14 : 14, scale: 0.7 }
              }
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
              animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: rm ? 0 : -16 }}
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
  const sectionRef = useRef<HTMLElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 120, damping: 20, mass: 0.7 };
  const rotateX = useSpring(useTransform(my, [0, 1], [2, -2]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-2, 2]), springCfg);

  // Single source of truth for the cinematic reveal sequence — replaces the
  // dozens of independent per-element `whileInView` viewport observers that
  // previously each decided for themselves when to fire. One GSAP
  // ScrollTrigger now scrubs a `phase` value (1–8) as the notebook moves
  // through the viewport; every component below simply asks "is my phase
  // active yet?" via a boolean prop, and Framer Motion handles the actual
  // eased transition to/from that state.
  const [phase, setPhase] = useState(rm ? TOTAL_PHASES : 1);

  // How open the pages are, 0 (folded shut against the spine) → 1 (fully
  // fanned open, flat). Driven every scroll frame directly as a motion
  // value (not React state) so the turn stays perfectly smooth — it never
  // triggers a re-render. Left and right page each read their own rotateY
  // off this single shared value, hinged on the spine between them, so
  // they turn open like an actual pair of book pages rather than a flat
  // cover swinging.
  const pageTurn = useMotionValue(rm ? 1 : 0);
  const leftPageTurnRotateY = useTransform(pageTurn, [0, 1], [-82, 0]);
  const rightPageTurnRotateY = useTransform(pageTurn, [0, 1], [82, 0]);
  const pageTurnOpacity = useTransform(pageTurn, [0, 0.3, 1], [0.35, 0.85, 1]);

  useEffect(() => {
    if (rm) {
      // Reduced motion: skip scroll-scrubbed choreography entirely and
      // just show the finished page — each component's own `rm`-aware
      // transition already collapses to a quick, simple fade. The pages
      // stay open (see the initial pageTurn value above) rather than
      // animating shut, since there's no scrub to drive them back closed.
      setPhase(TOTAL_PHASES);
      return;
    }
    if (!sectionRef.current) return;

    const lastPhase = { current: 1 };
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 78%",
      end: "bottom 55%",
      scrub: 0.6, // smooths the raw scroll input into real "paper inertia" rather than snapping straight to each phase
      onUpdate: (self) => {
        const next = progressToPhase(self.progress);
        if (next !== lastPhase.current) {
          lastPhase.current = next;
          setPhase(next);
        }
        pageTurn.set(progressToPageTurn(self.progress));
      },
      onLeaveBack: () => {
        // Scrolled back above the section entirely — reset to the "pages
        // almost empty" resting state so scrolling back down replays the
        // full reveal, matching the site's established reversible-scroll
        // convention. Page 1 and 2 fold shut against the spine again too,
        // so re-entering the section always starts from a closed notebook.
        if (lastPhase.current !== 1) {
          lastPhase.current = 1;
          setPhase(1);
        }
        pageTurn.set(0);
      },
    });

    return () => trigger.kill();
  }, [rm]);

  // Soft cursor-follow light highlight, scoped entirely to the notebook —
  // reuses the same mx/my tracking already driving the tilt above, so no
  // extra event listeners or re-renders are introduced. This is the only
  // "cursor" effect added here; it does not touch or replace the site's
  // existing global custom cursor component.
  const spotlightOpacity = useMotionValue(0);
  const spotlightOpacitySpring = useSpring(spotlightOpacity, { stiffness: 120, damping: 22 });
  const spotlightX = useTransform(mx, (v) => `${v * 100}%`);
  const spotlightY = useTransform(my, (v) => `${v * 100}%`);
  const spotlightBg = useMotionTemplate`radial-gradient(480px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.4), rgba(29,111,235,0.08) 45%, transparent 70%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rm) return;
    const rect = notebookRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
    spotlightOpacity.set(1);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    spotlightOpacity.set(0);
  };

  const dust = useMemo(() => Array.from({ length: 10 }), []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden section-wrap max-w-full py-12 sm:py-16 md:py-16 lg:py-16 bg-white"
      aria-label="About — My Story"
    >
      {/* subtle blueprint grid backdrop — keeps the notebook as the focal point */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(29,111,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,111,235,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, transparent 40%, black 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 45%, transparent 40%, black 100%)",
        }}
      />

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
        {/* ═══════════════ THE NOTEBOOK ═══════════════ */}
        <div className="relative max-w-[1200px] mx-auto">
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
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1400 }}
            initial={{ opacity: 0, y: rm ? 0 : 50, scale: rm ? 1 : 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={
              rm
                ? { duration: 0.4 }
                : {
                    opacity: { duration: 0.8, ease },
                    y: { duration: 0.9, ease },
                    // A light spring (rather than a tween) on scale gives the
                    // notebook a small, physical overshoot-then-settle right
                    // as it lands — the "paper settling" beat requested,
                    // distinct from the smooth fade/lift above it.
                    scale: { type: "spring", stiffness: 170, damping: 14, mass: 1 },
                  }
            }
            className="relative rounded-[24px] overflow-hidden
                       shadow-[0_2px_0_rgba(0,0,0,0.05)_inset,0_50px_100px_-30px_rgba(70,50,20,0.35)]
                       border border-[#e8dcc4]"
          >
            {/* leather-ish outer frame */}
            <div className="absolute inset-0 pointer-events-none rounded-[24px] ring-1 ring-inset ring-black/5 z-30" />

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

            {/* soft cursor-follow light highlight — fades in only while the
                pointer is over the notebook, tracks the same position
                already computed for the tilt effect above */}
            {!rm && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-40 mix-blend-overlay"
                style={{ background: spotlightBg, opacity: spotlightOpacitySpring }}
              />
            )}

            {/* breathing layer — an almost imperceptible, continuous scale
                pulse so the pages read as "resting" paper rather than a
                static image. Kept on its own wrapper (separate from the
                entrance/tilt transforms on the parent) so it never fights
                either of those for control of `scale`. */}
            <motion.div
              animate={rm ? {} : { scale: [1, 1.004, 1] }}
              transition={rm ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* paper grain texture, warm cream base */}
              <div
                className="relative grid grid-cols-1 lg:grid-cols-2 lg:h-[780px] lg:overflow-y-auto scrollbar-hide"
                style={{
                  backgroundColor: "#FFFDF7",
                  backgroundImage:
                    "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.4), transparent 40%)",
                }}
              >
                {/* very subtle grain shimmer — an opacity-only breathe
                    (never a background-position shift) so it stays on the
                    transform/opacity-only performance budget */}
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-radial-gradient(circle at 50% 50%, rgba(120,90,40,0.025) 0, rgba(120,90,40,0.025) 1px, transparent 1px, transparent 3px)",
                  }}
                  animate={rm ? {} : { opacity: [0.85, 1, 0.85] }}
                  transition={rm ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* gentle light sweep — crosses the paper roughly every
                    20–30s (a 3s sweep + a 22s pause between sweeps), purely
                    transform (x) + opacity so it costs nothing at rest */}
                {!rm && (
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1/3 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)",
                      mixBlendMode: "overlay",
                    }}
                    initial={{ x: "-140%", opacity: 0 }}
                    animate={{ x: ["-140%", "340%"], opacity: [0, 0.7, 0.7, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 22, ease: "easeInOut" }}
                  />
                )}

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

              {/* ═══════════ LEFT PAGE (page 1) ═══════════
                  Outer layer turns the whole page open around the spine
                  (hinged on its right edge) as `pageTurn` scrubs with
                  scroll; the inner motion.div keeps its own independent
                  hover-tilt untouched, so the two never fight. */}
              <motion.div
                style={{
                  rotateY: leftPageTurnRotateY,
                  opacity: pageTurnOpacity,
                  transformOrigin: "right center",
                  transformStyle: "preserve-3d",
                }}
              >
              <motion.div
                whileHover={rm ? undefined : { rotateY: -1.2 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                style={{ transformStyle: "preserve-3d", transformOrigin: "right center" }}
                className="relative px-6 py-6 sm:px-10 sm:py-8 lg:pr-14 lg:pl-12"
              >
                <CoffeeStain className="top-2 right-6 sm:right-10" size={70} />
                <Doodle type="swirl" className="top-24 right-2 sm:right-6" delay={0.3} active={phase >= 3} />

                <div className="flex items-center justify-between mb-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  <span>02 — About Me</span>
                  <span>The Beginning</span>
                </div>

                {/* small handwritten lead-in — Phase 3, just ahead of the headline */}
                <HandwrittenNote className="text-lg sm:text-xl mb-2" delay={0} active={phase >= 3}>
                  how it all started.
                </HandwrittenNote>

                {/* checklist sticky note, tucked beside the headline like a
                    note pinned to the page — Phase 3 */}
                <div className="hidden sm:block absolute top-16 right-2 lg:right-4 z-10">
                  <StickyNote color="#fdf8ee" rotate={3} delay={0.2} active={phase >= 3} className="w-44">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-1.5">✓ No formal training</li>
                      <li className="flex items-center gap-1.5">✓ No big resources</li>
                      <li className="flex items-center gap-1.5">
                        ✓ Just <CircleHighlight delay={1.1} active={phase >= 3}>curiosity</CircleHighlight>
                      </li>
                    </ul>
                  </StickyNote>
                </div>

                {/* headline with marker highlight — Phase 3: builds line
                    by line as the notebook scrolls */}
                <motion.h3
                  initial={{ opacity: 0, y: rm ? 0 : 24 }}
                  animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 24 }}
                  transition={{ duration: rm ? 0.3 : 0.7, ease }}
                  className="font-serif font-extrabold text-[1.9rem] sm:text-4xl leading-[1.15] text-foreground mb-3 max-w-sm sm:max-w-none"
                >
                  I started learning <Marker delay={0.15} active={phase >= 3}>CODE</Marker> because I
                  wanted to change my <Marker delay={0.35} active={phase >= 3}>FAMILY's</Marker> future.
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: rm ? 0 : 18 }}
                  animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 18 }}
                  transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 0.2 }}
                  className="font-serif text-lg sm:text-xl text-slate-500 leading-snug mb-5"
                >
                  A boy from a tea garden in <Marker delay={0.5} active={phase >= 3}>ASSAM</Marker>,
                  chasing a bigger <Marker delay={0.65} active={phase >= 3}>DREAM</Marker> — always
                  reaching for <Marker delay={0.8} active={phase >= 3}>BETTER</Marker>.
                </motion.p>

                {/* personal paragraph — Phase 4: story blocks fade in one at a time */}
                <motion.div
                  initial={{ opacity: 0, y: rm ? 0 : 16 }}
                  animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 16 }}
                  transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 0.1 }}
                  className="relative text-slate-600 leading-relaxed mb-6 max-w-md"
                >
                  <InkSmudge className="-left-3 top-2" size={30} />
                  <p>
                    I didn't have expensive gadgets. I only had curiosity — and
                    a laptop that struggled to keep up with my ambition. Every
                    small project taught me something new, and slowly, that
                    curiosity turned into a craft.
                  </p>
                </motion.div>

                {/* connecting hand-drawn arrow — flows from the top of the
                    page down to the photo below, Phase 3, echoing the long
                    looping arrow that threads the reference spread together */}
                <DrawnArrow
                  className="hidden lg:block top-4 right-10 w-40 h-64"
                  path="M120 0 C 20 30, 10 90, 30 140 C 45 175, 90 190, 110 210"
                  delay={0.9}
                  active={phase >= 3}
                />

                {/* photo + name tag — Phase 2: lands first, with a small
                    physical bounce, before the headline/paragraphs build */}
                <div className="relative mb-6 max-w-[15rem]">
                  <motion.div
                    initial={{ opacity: 0, y: rm ? 0 : 40, scale: 0.9, rotate: 0 }}
                    animate={
                      phase >= 2
                        ? { opacity: 1, y: 0, scale: 1, rotate: -2 }
                        : { opacity: 0, y: rm ? 0 : 40, scale: 0.9, rotate: 0 }
                    }
                    transition={{
                      duration: rm ? 0.3 : 0.8,
                      // A spring (rather than a tween) gives the photo a
                      // genuine small physical bounce as it lands, instead
                      // of just easing to a stop.
                      type: rm ? "tween" : "spring",
                      stiffness: rm ? undefined : 260,
                      damping: rm ? undefined : 16,
                      mass: rm ? undefined : 0.9,
                    }}
                    whileHover={{
                      rotate: 0,
                      y: -4,
                      scale: 1.02,
                      boxShadow: "0 30px 55px -16px rgba(70,50,20,0.5)",
                    }}
                    className="relative bg-white p-2.5 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)]"
                  >
                    <Tape className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} floatDuration={5.5} floatDelay={0.5} active={phase >= 2} />
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden"
                      style={{ background: "linear-gradient(180deg,#dfe9f5,#bcd0e6 60%,#9fb8d6)" }}
                    >
                      <img
                        src={profilePhoto}
                        alt="Nikhil Paharia"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                    </div>
                  </motion.div>
                  {/* name tag, sitting just below the photo like a caption card */}
                  <motion.div
                    initial={{ opacity: 0, y: rm ? 0 : 12 }}
                    animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 12 }}
                    transition={{ duration: rm ? 0.2 : 0.5, delay: rm ? 0 : 0.35 }}
                    className="mt-2"
                  >
                    <p className="font-serif font-bold text-base text-foreground leading-tight">
                      Nikhil Paharia
                    </p>
                    <p className="font-hand text-primary text-base leading-tight">
                      Full-Stack Developer
                    </p>
                    <p className="text-xs text-slate-400">Assam, India</p>
                  </motion.div>
                </div>

                {/* silhouette — Phase 2, staggered slightly after the tagged
                    photo above */}
                <div className="relative mb-6 max-w-xs">
                  <motion.div
                    initial={{ opacity: 0, y: rm ? 0 : 40, scale: 0.9, rotate: 0 }}
                    animate={
                      phase >= 2
                        ? { opacity: 1, y: 0, scale: 1, rotate: -2 }
                        : { opacity: 0, y: rm ? 0 : 40, scale: 0.9, rotate: 0 }
                    }
                    transition={{
                      duration: rm ? 0.3 : 0.8,
                      delay: rm ? 0 : 0.2,
                      type: rm ? "tween" : "spring",
                      stiffness: rm ? undefined : 260,
                      damping: rm ? undefined : 16,
                      mass: rm ? undefined : 0.9,
                    }}
                    whileHover={{
                      rotate: 0,
                      y: -4,
                      scale: 1.02,
                      boxShadow: "0 30px 55px -16px rgba(70,50,20,0.5)",
                    }}
                    className="relative bg-white p-2.5 pb-9 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)]"
                  >
                    <Tape className="-top-3 left-8" rotate={-6} floatDuration={5.5} floatDelay={1.1} active={phase >= 2} />
                    <Tape className="-top-3 right-8" rotate={5} color="blue" floatDuration={4.8} floatDelay={1.7} active={phase >= 2} />
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden"
                      style={{ background: "linear-gradient(180deg,#dfe9f5,#bcd0e6 60%,#9fb8d6)" }}
                    >
                      <img
                        src={myNewPhoto}
                        alt="A silhouette, looking out over the hills"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-top"
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
                    <p className="font-hand text-base text-slate-600 text-center mt-2 leading-tight underline decoration-slate-300">
                      god's plan
                    </p>
                  </motion.div>
                </div>

                {/* handwritten note — Phase 3: draws itself alongside the headline */}
                <div className="relative mb-6 max-w-xs">
                  <InkSmudge className="-top-2 left-2" size={26} />
                  <HandwrittenNote className="text-xl sm:text-2xl -rotate-1" delay={0.9} active={phase >= 3}>
                    "It started as curiosity. Then it became a way of thinking."
                  </HandwrittenNote>
                </div>

                {/* Note to Self — Phase 6, dropped in with a slight rotation,
                    the reflective closing note for the left page */}
                <StickyNote
                  title="Note to Self"
                  color="#fef9c3"
                  rotate={-3}
                  delay={0.15}
                  active={phase >= 6}
                  className="w-52"
                >
                  Focus on improving 1% every day. Let the results take care
                  of themselves.
                </StickyNote>

                <MountainDoodle className="hidden sm:block mx-auto mt-10 opacity-70" />
              </motion.div>
              </motion.div>

              {/* ═══════════ RIGHT PAGE (page 2) ═══════════
                  Same spine-hinge treatment as page 1, mirrored: hinged on
                  its left edge and turning open in the opposite rotational
                  direction, so the two pages fan open toward the reader
                  together like a real spread. */}
              <motion.div
                style={{
                  rotateY: rightPageTurnRotateY,
                  opacity: pageTurnOpacity,
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                }}
              >
              <motion.div
                whileHover={rm ? undefined : { rotateY: 1.2 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
                className="relative px-6 py-6 sm:px-10 sm:py-8 lg:pl-14 lg:pr-12 border-t lg:border-t-0 border-dashed border-slate-300/60"
              >
                <Doodle type="spark" className="top-6 right-8" delay={0.2} size={24} />

                <div className="flex items-center justify-between mb-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  <span>One Yes Led To The Next</span>
                  <span>Things That Happened</span>
                </div>

                {/* purpose torn paper + hanging tag, connected by a small
                    drawn arrow — Phase 4, alongside the story on the left page */}
                <div className="relative flex items-start justify-between gap-4 mb-5">
                  <TornPaper className="p-5 sm:p-6 max-w-sm flex-1" rotate={-1} delay={0.05} active={phase >= 4}>
                    <RealPaperClip className="-top-6 left-4" rotate={-10} active={phase >= 4} />
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary mb-2">
                      My Purpose
                    </p>
                    <h4 className="font-serif font-bold text-xl sm:text-2xl text-foreground mb-3 underline decoration-primary/40 decoration-2 underline-offset-4">
                      Building with purpose.
                    </h4>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3">
                      I build websites because I love watching an idea turn into
                      something people can actually use. Every bug I fix and
                      every interface I polish is a small problem solved —
                      that's what keeps me hooked.
                    </p>
                    <p className="font-hand text-primary text-base">
                      ☆ Function first, always with care.
                    </p>
                  </TornPaper>

                  <div className="hidden sm:block flex-shrink-0 mt-2">
                    <HangingTag value="50+" label="Projects Shipped" rotate={7} delay={0.6} active={phase >= 4} />
                  </div>
                </div>

                <DrawnArrow
                  className="hidden lg:block top-2 right-16 w-40 h-40"
                  path="M20 100 C 40 50, 90 15, 150 10"
                  delay={0.8}
                  active={phase >= 4}
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={phase >= 4 ? { opacity: 0.7 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: rm ? 0 : 1.3 }}
                  className="hidden lg:block absolute top-8 right-4 max-w-[7rem] font-hand text-primary text-sm leading-tight -rotate-3"
                >
                  one project always leads to the next.
                </motion.p>

                {/* mission — revealed as if written with a pen, with a
                    genuine left-to-right underline stroke beneath it —
                    Phase 4, staggered after the purpose card above */}
                <blockquote className="relative mb-6 max-w-md border-l-2 border-primary/40 pl-4">
                  <HandwrittenNote className="text-2xl sm:text-3xl leading-snug" delay={0.5} active={phase >= 4}>
                    "I want to build digital products that improve people's lives."
                  </HandwrittenNote>
                  <MarkerUnderline className="mt-1 ml-1" delay={1.3} width={210} active={phase >= 4} />
                </blockquote>

                {/* highlights row — Phase 4, the real numbers behind the story */}
                <div className="grid grid-cols-3 gap-3 mb-6 max-w-md">
                  {[
                    { value: "Self-Taught", sub: "since day one", color: "#1d6feb" },
                    { value: "50+", sub: "projects shipped", color: "#b91c1c" },
                    { value: "3+ yrs", sub: "of building", color: "#15803d" },
                  ].map((h, i) => (
                    <motion.div
                      key={h.value}
                      initial={{ opacity: 0, y: rm ? 0 : 14 }}
                      animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 14 }}
                      transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : 0.5 + i * 0.1, ease: "backOut" }}
                      className="rounded-md border-2 px-2.5 py-2.5 text-center bg-white/70"
                      style={{ borderColor: h.color }}
                    >
                      <p className="font-serif font-extrabold text-sm sm:text-base leading-tight" style={{ color: h.color }}>
                        {h.value}
                      </p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5 leading-tight">
                        {h.sub}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* tech stack — Phase 5: icons pop in one after another, in a tidy row */}
                <div className="mb-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-4">
                    Tech I Reach For
                  </p>
                  <TechScatter active={phase >= 5} />
                </div>

                {/* daily fuel — Phase 6: torn checklist, ticks in one by one */}
                <div className="mb-6 max-w-[15rem]">
                  <DailyFuel active={phase >= 6} />
                </div>

                <MountainDoodle flip className="hidden sm:block ml-auto opacity-70 mb-6" />

                {/* ending banner — kept inside this page so the notebook
                    stays exactly two pages, no separate full-width strip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={phase >= 8 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: rm ? 0.3 : 0.6, ease }}
                  className="relative bg-white mx-auto max-w-md px-5 py-5 sm:px-8 sm:py-6 text-center shadow-[0_16px_40px_-20px_rgba(70,50,20,0.4)] -rotate-[0.4deg] mb-4"
                >
                  <p className="font-hand text-2xl sm:text-3xl text-foreground leading-snug mb-1 underline decoration-primary decoration-2 underline-offset-4">
                    Still figuring things out.
                  </p>
                  <p className="text-sm sm:text-base text-slate-500">
                    And that's the best part.
                    <span className="inline-block ml-1.5 text-primary">♥</span>
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={phase >= 8 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: rm ? 0 : 1.6 }}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 text-center"
                >
                  Keep Scrolling →
                </motion.p>
              </motion.div>
              </motion.div>

            </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

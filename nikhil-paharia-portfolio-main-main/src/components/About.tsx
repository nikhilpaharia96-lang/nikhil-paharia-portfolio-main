import { useRef, useMemo, useState, useEffect, useCallback, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  useInView,
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
  SiInstagram,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import profilePhoto from "../assets/images/profile-nobg.png";
import myNewPhoto from "../assets/images/my-new-photo.jpg";
import teaGardenAbout from "../assets/images/tea-sunset-portrait.webp";
import teaSunsetPortrait from "../assets/images/tea-sunset-portrait.webp";
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
 * react-pageflip requires every direct child of <HTMLFlipBook> to forward a
 * ref to its outer DOM node (that's how the library grabs each page to
 * animate the curl/turn). Defined once at module scope — rather than inline
 * inside the About component — so its identity is stable across renders;
 * an inline forwardRef would get a new identity every render and force
 * React to remount (and replay every animation on) both pages constantly.
 */
const NotebookPage = forwardRef<HTMLDivElement, { className?: string; dark?: boolean; children: React.ReactNode }>(
  ({ className, dark = false, children }, ref) => (
    <div
      ref={ref}
      className={`page overflow-y-auto scrollbar-hide ${dark ? "bg-[#0b0b0e]" : "bg-[#FFFDF7]"} ${className ?? ""}`}
    >
      {children}
    </div>
  )
);
NotebookPage.displayName = "NotebookPage";

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
   Notebook divider — a simple, clean center spine: a narrow dark
   navy-black vertical bar with a soft vertical highlight so it
   reads as a rounded binding rather than a flat painted line, plus
   a subtle shadow cast onto both pages. Matches the plain, minimal
   divider from the reference composition — no spiral loops, no
   leather grain, just a quiet dark seam between the two pages.

   `scale` comes from a ResizeObserver on the notebook itself (see
   `notebookWidth` in the About component below) rather than a
   fixed breakpoint, so it stays proportional to however big
   react-pageflip actually renders the spread.

   `visible` is driven by react-pageflip's own onChangeState callback —
   the divider fades out the instant a page starts turning (dragging a
   corner, mid-flip, etc.) and fades back in once it settles on 'read'.
   Without this, the flat static bar cuts straight down through a page
   that's folded diagonally mid-drag, which reads as a rendering glitch
   rather than a binding.

   Desktop-only: on mobile the flipbook renders a single full-width
   page with no gutter for a divider to occupy.
   ──────────────────────────────────────────────────────────── */

function NotebookDivider({ scale = 1, visible = true }: { scale?: number; visible?: boolean }) {
  const rm = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="hidden lg:block absolute pointer-events-none"
      style={{
        left: "50%",
        top: "-4px",
        bottom: "-4px",
        width: "10px",
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "50% 50%",
        zIndex: 100,
        borderRadius: "5px",
        background:
          "linear-gradient(90deg, #050608 0%, #12151d 30%, #262c3c 50%, #12151d 70%, #050608 100%)",
        boxShadow:
          "-5px 0 10px -6px rgba(0,0,0,0.5), 5px 0 10px -6px rgba(0,0,0,0.5), 0 6px 18px rgba(0,0,0,0.3)",
      }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: rm ? 0.1 : 0.2, ease: "easeOut" }}
    />
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

const dailyFuel = ["Chai", "Songs", "Football", "Late Night Code"];

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
   Reveal — tiny useInView wrapper so the reused notebook pieces
   below (which all take a simple `active` boolean) get a real
   scroll-triggered entrance on mobile instead of just being
   already-settled the moment they mount off-screen.
   ──────────────────────────────────────────────────────────── */

function Reveal({
  children,
  className = "",
  margin = "-80px",
}: {
  children: (active: boolean) => React.ReactNode;
  className?: string;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: margin as `${number}px` });
  return (
    <div ref={ref} className={className}>
      {children(inView)}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Mobile About story — a completely separate, purpose-built
   experience (see the comment where it's used). Reuses every
   character/prop/voice already established by the notebook above
   — same fonts, same ink, same Assam-tea-garden story — just told
   as one continuous scroll instead of a two-page spread you'd
   need a mouse to turn.
   ──────────────────────────────────────────────────────────── */

function MobileAboutStory() {
  // Disabled: the notebook/diary section above now renders on all
  // breakpoints, so this separate mobile-only fallback is no longer used.
  return null;
  // eslint-disable-next-line no-unreachable
  const rm = useReducedMotion();

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (!el) return;
    const lenis = (window as typeof window & { lenis?: { scrollTo: (t: Element, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.2 });
    else el.scrollIntoView({ behavior: rm ? "auto" : "smooth" });
  };

  return (
    <div className="lg:hidden max-w-lg mx-auto">
      {/* ── Chapter opener — full-bleed photo, the one moment on this
            page that leads with image over text, because this is the
            single fact everything else explains: where the story starts. */}
      <Reveal margin="-40px">
        {(active) => (
          <motion.div
            initial={{ opacity: 0, y: rm ? 0 : 20 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 20 }}
            transition={{ duration: rm ? 0.3 : 0.7, ease }}
            className="relative rounded-[28px] overflow-hidden shadow-[0_24px_50px_-24px_rgba(29,111,235,0.35)]"
          >
            <div className="relative aspect-[4/5] w-full">
              <img
                src={teaGardenAbout}
                alt="Tea garden hills in Assam"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />
            </div>
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
              <span>02 — About Me</span>
              <span>The Beginning</span>
            </div>
            <div className="absolute -top-2 -right-2">
              <Stamp label="Self-Taught" sub="since day one" rotate={8} delay={0.3} active={active} />
            </div>
            <div className="absolute inset-x-5 bottom-5">
              <h3 className="font-serif font-extrabold text-[1.7rem] leading-[1.15] text-white mb-2">
                I started making <Marker delay={0.15} active={active}>CREATIVE STUFF</Marker> four
                years ago because I wanted to buy some{" "}
                <Marker delay={0.35} active={active}>sneakers</Marker> on my own.
              </h3>
              <p className="text-sm text-white/75 leading-snug">
                No big background. No perfect conditions. Just a dream and a laptop.
              </p>
            </div>
          </motion.div>
        )}
      </Reveal>

      {/* ── Portrait + name card — a single, confident polaroid rather
            than the desktop's two side-by-side photos; one clear intro,
            not a scrapbook to sort through on a 6-inch screen. */}
      <Reveal className="mt-8 flex justify-center">
        {(active) => (
          <motion.div
            initial={{ opacity: 0, y: rm ? 0 : 30, scale: 0.94 }}
            animate={active ? { opacity: 1, y: 0, scale: 1, rotate: -1.5 } : { opacity: 0, y: rm ? 0 : 30, scale: 0.94 }}
            transition={{ duration: rm ? 0.3 : 0.7, type: rm ? "tween" : "spring", stiffness: 220, damping: 18 }}
            className="relative bg-white p-2.5 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)] w-48"
          >
            <Tape className="-top-3 left-1/2 -translate-x-1/2" rotate={-3} active={active} />
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
            <div className="pt-2 text-center">
              <p className="font-serif font-bold text-sm text-foreground leading-tight">Nikhil Paharia</p>
              <p className="font-hand text-primary text-base leading-tight">Full-Stack Developer</p>
              <p className="text-[11px] text-slate-400">Assam, India</p>
            </div>
          </motion.div>
        )}
      </Reveal>

      {/* ── Story paragraph + quote ── */}
      <Reveal className="mt-9 px-1">
        {(active) => (
          <motion.div
            initial={{ opacity: 0, y: rm ? 0 : 16 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 16 }}
            transition={{ duration: rm ? 0.3 : 0.6, ease }}
            className="relative"
          >
            <InkSmudge className="-left-3 -top-2" size={30} />
            <p className="text-slate-600 leading-relaxed">
              I had no idea about building websites. I was just curious. That
              curiosity turned into passion, and passion changed my life.
            </p>
            <HandwrittenNote className="text-xl mt-4 -rotate-1" delay={0.3} active={active}>
              "It started as curiosity. Then it became a way of thinking."
            </HandwrittenNote>
          </motion.div>
        )}
      </Reveal>

      {/* ── Purpose card ── */}
      <Reveal className="mt-9">
        {(active) => (
          <TornPaper className="p-5 w-full" rotate={-1} active={active}>
            <RealPaperClip className="-top-6 left-4" rotate={-10} active={active} />
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary mb-2">My Purpose</p>
            <h4 className="font-serif font-bold text-xl text-foreground mb-3 underline decoration-primary/40 decoration-2 underline-offset-4">
              Art with a purpose.
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              I use my skills to build digital experiences that help brands
              grow and people connect. That's what drives me everyday.
            </p>
            <p className="font-hand text-primary text-base">☆ Aesthetic always, logic actually.</p>
          </TornPaper>
        )}
      </Reveal>

      {/* ── What I do ── */}
      <Reveal className="mt-9 px-1">
        {(active) => (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-3">What I Do</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              {["Web Development", "UI/UX Design", "Video Editing", "Content Creation"].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: rm ? 0 : -10 }}
                  animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: rm ? 0 : -10 }}
                  transition={{ duration: rm ? 0.25 : 0.4, delay: rm ? 0 : 0.1 + i * 0.08 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-primary">{"</>"}</span> {item}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>

      {/* ── Stats — a horizontal, snap-scrolling strip rather than a
            static grid: on a phone, swiping sideways through three quick
            facts reads faster and feels more native than a squeezed
            three-column row ever would. */}
      <Reveal className="mt-9 -mx-6 px-6">
        {(active) => (
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
            {[
              { value: "33M+", sub: "impressions for brand clients", color: "#b91c1c" },
              { value: "40+", sub: "happy clients", color: "#a16207" },
              { value: "186M+", sub: "people reached", color: "#1d6feb" },
            ].map((h, i) => (
              <motion.div
                key={h.value}
                initial={{ opacity: 0, x: rm ? 0 : 20 }}
                animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: rm ? 0 : 20 }}
                transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : 0.1 * i, ease: "backOut" }}
                className="snap-center shrink-0 rounded-md border-2 px-5 py-4 text-center bg-white/80 min-w-[8.5rem]"
                style={{ borderColor: h.color }}
              >
                <p className="font-serif font-extrabold text-base leading-tight" style={{ color: h.color }}>
                  {h.value}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1 leading-tight">{h.sub}</p>
              </motion.div>
            ))}
          </div>
        )}
      </Reveal>

      {/* ── The journey — a proper milestone timeline, previously built
            for this page but never actually shown anywhere; a phone's
            single column is exactly the shape it was designed for. */}
      <Reveal className="mt-9" margin="-60px">
        {(active) => <JourneyTimeline active={active} />}
      </Reveal>

      {/* ── Tech stack ── */}
      <Reveal className="mt-2">
        {(active) => (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-4">Tech I Work With</p>
            <TechScatter active={active} />
          </div>
        )}
      </Reveal>

      {/* ── Favorite things — another finished-but-unused piece; a
            horizontal scroller of scrapbook stickers is a much better
            fit for a thumb than the desktop's wrapped grid. */}
      <Reveal className="mt-9 -mx-6 px-6">
        {(active) => (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-4">A Few Favorite Things</p>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
              {favorites.map((f, i) => (
                <div key={f.label} className="snap-center shrink-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: rm ? 0 : 16 }}
                    animate={active ? { opacity: 1, scale: 1, y: 0, rotate: favRotate[i] } : { opacity: 0, scale: 0.5, y: rm ? 0 : 16 }}
                    transition={{ duration: rm ? 0.25 : 0.45, delay: rm ? 0 : 0.08 * i, ease: "backOut" }}
                    className="relative w-[4.5rem] h-[4.5rem] rounded-full bg-white p-[3px] shadow-[0_10px_20px_-8px_rgba(70,50,20,0.45)] ring-1 ring-slate-200/70"
                  >
                    <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white overflow-hidden">
                      <span className="text-lg leading-none">{f.emoji}</span>
                      <span className="font-hand text-[10px] text-slate-600 mt-0.5 leading-none text-center px-1">
                        {f.label}
                      </span>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Reveal>

      {/* ── Daily fuel ── */}
      <Reveal className="mt-9 flex justify-center">{(active) => <DailyFuel active={active} />}</Reveal>

      {/* ── Closing note + signature ── */}
      <Reveal className="mt-9" margin="-40px">
        {(active) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: rm ? 0.3 : 0.6, ease }}
            className="relative bg-white px-6 py-6 text-center shadow-[0_16px_40px_-20px_rgba(70,50,20,0.4)] -rotate-[0.4deg]"
          >
            <p className="font-hand text-2xl text-foreground leading-snug mb-1 underline decoration-primary decoration-2 underline-offset-4">
              Still figuring things out.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              And that's the best part.
              <span className="inline-block ml-1.5 text-primary">♥</span>
            </p>
            <Signature active={active} delay={0.4} />
          </motion.div>
        )}
      </Reveal>

      {/* ── Where to next — the one thing the desktop notebook never
            actually offers either: a clear, confident handoff back to the
            rest of the site, in its real voice (not the paper one), for
            whoever's just finished reading and is ready to act. */}
      <Reveal className="mt-8 mb-2">
        {(active) => (
          <motion.div
            initial={{ opacity: 0, y: rm ? 0 : 16 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 16 }}
            transition={{ duration: rm ? 0.3 : 0.5, ease }}
            className="flex items-center gap-3"
          >
            <button
              type="button"
              onClick={() => scrollToSection("#projects")}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm px-5 py-3 rounded-full shadow-lg active:scale-[0.98] transition-transform"
            >
              See My Work
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("#contact")}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-blue-200 text-primary font-bold text-sm px-5 py-3 rounded-full active:scale-[0.98] transition-transform"
            >
              Say Hello
            </button>
          </motion.div>
        )}
      </Reveal>
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

  // Mirrors Tailwind's `lg` breakpoint (1024px). Drives two things: (1)
  // whether scroll auto-turns page 1→2 (desktop) or leaves turning entirely
  // to the reader's own swipe/tap (mobile), and (2) which width/height pair
  // — and therefore which aspect ratio — the flip-book below is built with,
  // since react-pageflip only reads those settings once at construction, so
  // crossing this breakpoint remounts it via the `key` on HTMLFlipBook.
  const [isDesktopViewport, setIsDesktopViewport] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktopViewport(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // The actual page-1 → page-2 turn is now handled by react-pageflip
  // (the same library behind the drag-to-turn brochure reference) rather
  // than a hand-rolled rotateY tween — it gives a real paper curl, corner
  // shadow, and drag physics for free. `flipBook` is the imperative handle
  // react-pageflip exposes; `flippedRef` just remembers which of the two
  // pages is currently showing so the scroll handler below only calls
  // flipNext/flipPrev when a flip is actually needed, instead of spamming
  // the library every scroll frame.
  const flipBook = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null);
  const flippedRef = useRef(false);

  // Whether a page is currently mid-turn (dragging a corner, flipping,
  // settling) — the center divider hides while this is true (see
  // NotebookDivider above) rather than sitting statically on top of a
  // page that's folded diagonally mid-drag.
  const [dividerVisible, setDividerVisible] = useState(true);
  const handleFlipStateChange = useCallback((e: { data?: string }) => {
    setDividerVisible(e?.data === "read");
  }, []);

  // Real size of the notebook as react-pageflip actually renders it
  // (`stretch` + `autoSize` mean that's not a fixed number) — the center
  // divider scales off this via ResizeObserver rather than a hardcoded
  // pixel width or a breakpoint guess, so it stays proportional to the
  // real spread at any viewport width, including in between breakpoints.
  const [notebookWidth, setNotebookWidth] = useState(0);
  useEffect(() => {
    if (!notebookRef.current || typeof ResizeObserver === "undefined") return;
    const el = notebookRef.current;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setNotebookWidth(width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // 1100 is the reference two-page spread width the divider's own
  // dimensions were drawn against — clamped so it neither vanishes on a
  // small spread nor balloons past a sensible size on an unusually large one.
  const dividerScale = notebookWidth
    ? Math.min(1.15, Math.max(0.55, notebookWidth / 1100))
    : 1;

  // Pages 3–10: a straight photo gallery, one full-bleed image per page —
  // deliberately no story text competing with them, just a short caption.
  // URLs rather than bundled assets, so swapping any one of these later is
  // a one-line change here rather than a re-import + rebuild.
  const galleryPages = [
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure2.fffe0aadeb5725549632.webp", label: "03", caption: "The garden, as it's always looked." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure3.1bbd6be736527cebd0f1.webp", label: "04", caption: "Where the mornings start." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure4.39118e0077fb90e90be1.webp", label: "05", caption: "Still my favorite view." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure7.993bd0c86c8cd0f40c24.webp", label: "06", caption: "Home, from every angle." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure11.b8524a9ef142de897823.webp", label: "07", caption: "The hills don't change much." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure12.214390bf5cd20d1cb55e.webp", label: "08", caption: "This is what I'm building toward." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure5.6a73e6331e62e365caec.webp", label: "09", caption: "A little further down the road." },
    { src: "https://www.gopalkrishnatea.com/static/media/Brochure10.d942bbc39eaebfc165dd.webp", label: "10", caption: "Almost there." },
  ];

  useEffect(() => {
    if (rm) {
      // Reduced motion: skip scroll-scrubbed choreography entirely and
      // just show the finished page — each component's own `rm`-aware
      // transition already collapses to a quick, simple fade. The
      // flip-book still renders (so page 2's content stays reachable via
      // its own click/drag corners), it just isn't auto-flipped by scroll.
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
        // Turn page 1 → page 2 once the reader is past the section's
        // midpoint, and turn it back once they scroll back above it —
        // so the physical page-turn tracks scroll direction exactly like
        // the rest of the reveal does. Desktop only — on mobile the page
        // turn is driven purely by the reader's own swipe/tap, like a real
        // notebook, never automatically by scroll.
        if (!isDesktopViewport) return;
        const shouldBeFlipped = self.progress > 0.5;
        if (shouldBeFlipped !== flippedRef.current) {
          flippedRef.current = shouldBeFlipped;
          const api = flipBook.current?.pageFlip();
          if (api) shouldBeFlipped ? api.flipNext() : api.flipPrev();
        }
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
        if (!isDesktopViewport) return;
        if (flippedRef.current) {
          flippedRef.current = false;
          flipBook.current?.pageFlip()?.flipPrev();
        }
      },
    });

    return () => trigger.kill();
  }, [rm, isDesktopViewport]);

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

      <div className="container-tight !px-2 sm:!px-6 relative z-10 max-w-full">
        {/* ═══════════════ THE NOTEBOOK (all breakpoints) ═══════════════
            Same notebook, same content, same styling at every size. The
            cursor-tilt/spotlight effects are mouse-only and simply no-op
            on touch. The flip-book itself is responsive on its own terms:
            desktop shows a two-page spread turned by scroll or drag; mobile
            (below react-pageflip's own portrait threshold) shows a single
            full-width page turned only by the reader's swipe or corner tap
            — a real one-page-at-a-time notebook feel, not a shrunk-down
            spread. */}
        <div className="block relative max-w-[1200px] mx-auto">
          {/* floating stickers around the notebook */}
          <FloatingSticker className="-top-6 left-4 sm:left-10" delay={0} duration={7}>
            <SiFigma className="w-5 h-5 text-[#F24E1E]" />
          </FloatingSticker>
          <FloatingSticker className="-top-10 left-1/2 -translate-x-1/2" delay={0.6} duration={8} rotate={-6}>
            <span className="text-xl">🐦</span>
          </FloatingSticker>
          <FloatingSticker className="top-1/3 -left-14" delay={1.1} duration={6.5} rotate={4}>
            <VscVscode className="w-5 h-5 text-[#0098FF]" />
          </FloatingSticker>
          <FloatingSticker className="top-1/4 -right-12" delay={0.3} duration={7.5} rotate={-4}>
            <SiReact className="w-5 h-5 text-[#61DAFB]" />
          </FloatingSticker>
          <FloatingSticker className="bottom-24 -left-10" delay={0.9} duration={6} rotate={6}>
            <SiInstagram className="w-5 h-5 text-[#E4405F]" />
          </FloatingSticker>
          <FloatingSticker className="bottom-16 -right-14" delay={1.4} duration={7} rotate={-5}>
            <SiGithub className="w-5 h-5 text-slate-800" />
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
                       border border-[#e8dcc4]
                       max-w-[90vw] mx-auto sm:max-w-none sm:mx-0"
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
                className="relative"
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

                {/* ═══════════ PAGE-TURN NOTEBOOK ═══════════
                    Real page-flip (react-pageflip / StPageFlip — the same
                    library behind the drag-to-turn brochure reference)
                    rather than a hand-rolled CSS hinge: each turn reveals
                    the next page with an actual paper curl, corner shadow,
                    and drag physics. `usePortrait` is left on, which lets
                    the library itself switch modes by container width: on
                    desktop (well above minWidth*2) it stays a two-page
                    spread turned forward/back by scroll via the `flipBook`
                    ref set up above; on mobile it automatically renders one
                    full-width page at a time, turned only by the reader's
                    own swipe or corner tap (see isDesktopViewport gate on
                    the scroll-driven flip above) — same physical page-turn
                    animation either way, just one page in frame instead of
                    two. */}
                {/* simple dark center divider, sitting in the gutter
                    between the two open pages */}
                <NotebookDivider scale={dividerScale} visible={dividerVisible} />

                <HTMLFlipBook
                  key={isDesktopViewport ? "desktop" : "mobile"}
                  ref={flipBook as never}
                  width={isDesktopViewport ? 550 : 390}
                  height={isDesktopViewport ? 780 : 786}
                  size="stretch"
                  minWidth={280}
                  maxWidth={isDesktopViewport ? 900 : 500}
                  minHeight={isDesktopViewport ? 420 : 565}
                  maxHeight={isDesktopViewport ? 900 : 1010}
                  drawShadow
                  flippingTime={800}
                  usePortrait={true}
                  startPage={0}
                  startZIndex={10}
                  autoSize
                  maxShadowOpacity={0.4}
                  showCover={false}
                  mobileScrollSupport
                  clickEventForward
                  useMouseEvents
                  swipeDistance={30}
                  showPageCorners
                  disableFlipByClick={false}
                  onChangeState={handleFlipStateChange}
                  className="notebook-flipbook"
                  style={{}}
                >
                  <NotebookPage className="px-6 py-7 sm:px-10 sm:py-6 lg:pr-14 lg:pl-12">
                <CoffeeStain className="top-2 right-6 sm:right-10" size={70} />
                <Doodle type="swirl" className="top-24 right-2 sm:right-6" delay={0.3} active={phase >= 3} />

                <div className="flex items-center justify-between mb-3 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  <span>02 — About Me</span>
                  <span>The Beginning</span>
                </div>

                {/* opening sticky note — Phase 1, the very first thing the
                    reader sees once the notebook lands open, fades out once
                    the "how it all started" headline begins building */}
                <motion.div
                  initial={{ opacity: 0, y: rm ? 0 : 10 }}
                  animate={
                    phase >= 1 && phase < 3
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: rm ? 0 : -6 }
                  }
                  transition={{ duration: rm ? 0.2 : 0.5, ease }}
                  className="mb-2 max-w-xs"
                >
                  <p className="font-hand text-sm sm:text-base text-foreground leading-snug">
                    I'm an open book.
                  </p>
                  <p className="font-hand text-sm sm:text-base text-slate-500 leading-snug">
                    Here is the unfiltered timeline of how I figured things
                    out.
                  </p>
                </motion.div>

                {/* small handwritten lead-in — Phase 3, just ahead of the headline */}
                <HandwrittenNote className="text-base sm:text-lg mb-1" delay={0} active={phase >= 3}>
                  how it all started.
                </HandwrittenNote>

                {/* checklist sticky note, tucked beside the headline like a
                    note pinned to the page — Phase 3 */}
                <div className="hidden sm:block absolute top-14 right-2 lg:right-4 z-10">
                  <StickyNote color="#fdf8ee" rotate={3} delay={0.2} active={phase >= 3} className="w-36">
                    <ul className="space-y-0.5 text-xs">
                      <li className="flex items-center gap-1.5">✓ No big background</li>
                      <li className="flex items-center gap-1.5">✓ No perfect conditions</li>
                      <li className="flex items-center gap-1.5">
                        ✓ Just <CircleHighlight delay={1.1} active={phase >= 3}>a dream</CircleHighlight>
                      </li>
                      <li className="flex items-center gap-1.5 pl-3.5">and a laptop.</li>
                    </ul>
                  </StickyNote>
                </div>

                {/* headline with marker highlight — Phase 3: builds line
                    by line as the notebook scrolls */}
                <motion.h3
                  initial={{ opacity: 0, y: rm ? 0 : 24 }}
                  animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 24 }}
                  transition={{ duration: rm ? 0.3 : 0.7, ease }}
                  className="font-serif font-extrabold text-xl sm:text-2xl leading-[1.15] text-foreground mb-1.5 max-w-sm sm:max-w-none"
                >
                  I started making <Marker delay={0.15} active={phase >= 3}>CREATIVE STUFF</Marker> four
                  years ago because I wanted to buy some{" "}
                  <CircleHighlight delay={0.5} active={phase >= 3}>sneakers</CircleHighlight> on my own.
                </motion.h3>

                {/* personal paragraph — Phase 4: story blocks fade in one at a time */}
                <motion.div
                  initial={{ opacity: 0, y: rm ? 0 : 16 }}
                  animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 16 }}
                  transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 0.1 }}
                  className="relative text-sm text-slate-600 leading-relaxed mb-3 max-w-md"
                >
                  <InkSmudge className="-left-3 top-2" size={30} />
                  <p>
                    I had no idea about building websites. I was just curious.
                    That curiosity turned into passion, and passion changed my
                    life.
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

                {/* photo + silhouette, side by side — Phase 2: land first,
                    with a small physical bounce, before the headline builds.
                    Sitting side by side (rather than stacked) keeps this
                    beat compact enough that the whole page fits without
                    needing its own scroll. */}
                <div className="flex items-start gap-4 mb-3">
                <div className="relative w-28 sm:w-32 shrink-0">
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
                    className="relative bg-white p-1.5 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)]"
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
                    className="mt-1"
                  >
                    <p className="font-serif font-bold text-xs text-foreground leading-tight">
                      Nikhil Paharia
                    </p>
                    <p className="font-hand text-primary text-sm leading-tight">
                      Full-Stack Developer
                    </p>
                    <p className="text-[10px] text-slate-400">Assam, India</p>
                  </motion.div>
                </div>

                {/* silhouette — Phase 2, staggered slightly after the tagged
                    photo above */}
                <div className="relative w-28 sm:w-32 shrink-0">
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
                    className="relative bg-white p-1.5 pb-5 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)]"
                  >
                    <Tape className="-top-3 left-6" rotate={-6} floatDuration={5.5} floatDelay={1.1} active={phase >= 2} />
                    <Tape className="-top-3 right-6" rotate={5} color="blue" floatDuration={4.8} floatDelay={1.7} active={phase >= 2} />
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
                    <p className="font-hand text-xs text-slate-600 text-center mt-1 leading-tight underline decoration-slate-300">
                      god's plan
                    </p>
                  </motion.div>
                </div>
                </div>

                {/* handwritten note — Phase 3: draws itself alongside the headline */}
                <div className="relative mb-3 max-w-xs">
                  <InkSmudge className="-top-2 left-2" size={26} />
                  <HandwrittenNote className="text-base sm:text-lg -rotate-1" delay={0.9} active={phase >= 3}>
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
                  className="w-44"
                >
                  <span className="text-xs">
                    Focus on improving 1% every day. Let the results take care
                    of themselves.
                  </span>
                </StickyNote>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={phase >= 6 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: rm ? 0.2 : 0.5, delay: rm ? 0 : 0.4 }}
                  className="font-hand text-xs text-slate-400 underline decoration-slate-300 mt-2"
                >
                  God's Plan
                </motion.p>

                <MountainDoodle className="hidden sm:block mx-auto mt-4 opacity-70 scale-75" />
                  </NotebookPage>

                  {/* ═══════════ PAGE 2 ═══════════ */}
                  <NotebookPage className="px-6 py-7 sm:px-10 sm:py-6 lg:pl-14 lg:pr-12">
                <Doodle type="spark" className="top-6 right-8" delay={0.2} size={24} />

                <div className="flex items-center justify-between mb-3 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                  <span>One Yes Led To The Next</span>
                  <span>Things That Happened</span>
                </div>

                {/* purpose torn paper + hanging tag, connected by a small
                    drawn arrow — Phase 4, alongside the story on the left page */}
                <div className="relative flex items-start justify-between gap-3 mb-3">
                  <TornPaper className="p-3.5 sm:p-4 max-w-sm flex-1" rotate={-1} delay={0.05} active={phase >= 4}>
                    <RealPaperClip className="-top-6 left-4" rotate={-10} active={phase >= 4} />
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary mb-1">
                      My Purpose
                    </p>
                    <h4 className="font-serif font-bold text-base sm:text-lg text-foreground mb-1.5 underline decoration-primary/40 decoration-2 underline-offset-4">
                      Art with a purpose.
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-1.5">
                      I use my skills to build digital experiences that help
                      brands grow and people connect. That's what drives me
                      everyday.
                    </p>
                    <p className="font-hand text-primary text-sm">
                      ☆ Aesthetic always, logic actually.
                    </p>
                  </TornPaper>

                  <div className="hidden sm:block flex-shrink-0 mt-2">
                    <HangingTag value="186M+" label="People Reached" rotate={7} delay={0.6} active={phase >= 4} />
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
                  creating content and code, you never know where it'll take you.
                </motion.p>

                {/* what I do — Phase 4, staggered after the purpose card above */}
                <div className="relative mb-3 max-w-md">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-2">
                    What I Do
                  </p>
                  <ul className="space-y-1 text-xs sm:text-sm text-slate-600">
                    {["Web Development", "UI/UX Design", "Video Editing", "Content Creation"].map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: rm ? 0 : -10 }}
                        animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: rm ? 0 : -10 }}
                        transition={{ duration: rm ? 0.25 : 0.4, delay: rm ? 0 : 0.15 + i * 0.08 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="text-primary">{"</>"}</span> {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* highlights row — Phase 4, the real numbers behind the story */}
                <div className="grid grid-cols-3 gap-2 mb-3 max-w-md">
                  {[
                    { value: "33M+", sub: "impressions for amazing brand clients", color: "#b91c1c" },
                    { value: "40+", sub: "happy clients, small & medium businesses", color: "#a16207" },
                    { value: "Top Rank 1", sub: "goal — keep learning, keep building", color: "#1d6feb" },
                  ].map((h, i) => (
                    <motion.div
                      key={h.value}
                      initial={{ opacity: 0, y: rm ? 0 : 14 }}
                      animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 14 }}
                      transition={{ duration: rm ? 0.25 : 0.5, delay: rm ? 0 : 0.5 + i * 0.1, ease: "backOut" }}
                      className="rounded-md border-2 px-2 py-1.5 text-center bg-white/70"
                      style={{ borderColor: h.color }}
                    >
                      <p className="font-serif font-extrabold text-xs sm:text-sm leading-tight" style={{ color: h.color }}>
                        {h.value}
                      </p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-wide mt-0.5 leading-tight">
                        {h.sub}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* tech stack — Phase 5: icons pop in one after another, in a tidy row */}
                <div className="mb-3">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400 mb-2">
                    Tech I Work With
                  </p>
                  <TechScatter active={phase >= 5} />
                </div>

                {/* daily fuel — Phase 6: torn checklist, ticks in one by one */}
                <div className="mb-3 max-w-[13rem] scale-90 origin-left">
                  <DailyFuel active={phase >= 6} />
                </div>

                <MountainDoodle flip className="hidden sm:block ml-auto opacity-70 mb-3 scale-75" />

                {/* ending banner — kept inside this page so the notebook
                    stays exactly two pages, no separate full-width strip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={phase >= 8 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: rm ? 0.3 : 0.6, ease }}
                  className="relative bg-white mx-auto max-w-md px-4 py-3 sm:px-6 sm:py-4 text-center shadow-[0_16px_40px_-20px_rgba(70,50,20,0.4)] -rotate-[0.4deg] mb-2"
                >
                  <p className="font-hand text-lg sm:text-xl text-foreground leading-snug mb-1 underline decoration-primary decoration-2 underline-offset-4">
                    Still figuring things out.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
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
                  </NotebookPage>

                  {/* ═══════════ PAGES 3–10 — the photo gallery ═══════════
                      One full-bleed image per page, straight from the URLs
                      given — no story text competing with them, just a
                      short caption. */}
                  {galleryPages.map((g, i) => (
                    <NotebookPage key={g.src} className="p-0 flex items-center justify-center overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={phase >= 6 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
                        transition={{ duration: rm ? 0.3 : 1, delay: rm ? 0 : i * 0.05, ease }}
                        className="relative w-full h-full"
                      >
                        <img
                          src={g.src}
                          alt={g.caption}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                        <div
                          className={`absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 flex items-center text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-white/70 ${
                            i % 2 === 0 ? "justify-between" : "justify-end"
                          }`}
                        >
                          <span>{g.label}</span>
                        </div>
                        <p
                          className={`absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 font-hand text-white text-2xl sm:text-3xl leading-snug ${
                            i % 2 === 1 ? "text-right" : ""
                          }`}
                        >
                          {g.caption}
                        </p>
                      </motion.div>
                    </NotebookPage>
                  ))}

                  {/* ═══════════ PAGE 11 — closing spread, left half ═══════════
                      One final, quiet beat: just the signature. Everything
                      else on this page has been building toward this — it's
                      the one moment that gets to be almost empty. */}
                  <NotebookPage className="px-6 py-6 sm:px-10 sm:py-8 lg:pr-14 lg:pl-12 flex flex-col items-end justify-center">
                    <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                      <span>11 — Closing</span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: rm ? 0 : 30, scale: 0.94 }}
                      animate={phase >= 8 ? { opacity: 1, y: 0, scale: 1, rotate: -2 } : { opacity: 0, y: rm ? 0 : 30, scale: 0.94 }}
                      transition={{ duration: rm ? 0.3 : 0.7, type: rm ? "tween" : "spring", stiffness: 220, damping: 18 }}
                      className="relative bg-white p-2 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)] w-28 mb-6"
                    >
                      <Tape className="-top-3 left-1/2 -translate-x-1/2" rotate={-4} active={phase >= 8} />
                      <div className="relative aspect-[4/5] w-full overflow-hidden">
                        <img
                          src={profilePhoto}
                          alt="Nikhil Paharia"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                      </div>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: rm ? 0 : 16 }}
                      animate={phase >= 8 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 16 }}
                      transition={{ duration: rm ? 0.3 : 0.9, delay: rm ? 0 : 0.3, ease }}
                      className="font-hand text-foreground text-6xl sm:text-7xl leading-none"
                    >
                      Nikhil
                    </motion.p>
                  </NotebookPage>

                  {/* ═══════════ PAGE 12 — closing spread, right half ═══════════ */}
                  <NotebookPage className="px-6 py-6 sm:px-10 sm:py-8 lg:pl-14 lg:pr-12 flex flex-col items-start justify-center">
                    <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 flex items-center justify-end text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                      <span>Thank You</span>
                    </div>
                    <motion.p
                      initial={{ opacity: 0, y: rm ? 0 : 16 }}
                      animate={phase >= 8 ? { opacity: 1, y: 0 } : { opacity: 0, y: rm ? 0 : 16 }}
                      transition={{ duration: rm ? 0.3 : 0.9, delay: rm ? 0 : 0.45, ease }}
                      className="font-hand text-foreground text-6xl sm:text-7xl leading-none mb-6"
                    >
                      Paharia
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: rm ? 0 : 30, scale: 0.94 }}
                      animate={phase >= 8 ? { opacity: 1, y: 0, scale: 1, rotate: 2 } : { opacity: 0, y: rm ? 0 : 30, scale: 0.94 }}
                      transition={{ duration: rm ? 0.3 : 0.7, delay: rm ? 0 : 0.2, type: rm ? "tween" : "spring", stiffness: 220, damping: 18 }}
                      className="relative bg-white p-2 shadow-[0_20px_40px_-16px_rgba(70,50,20,0.4)] w-24 mb-6"
                    >
                      <Tape className="-top-3 left-1/2 -translate-x-1/2" rotate={4} color="blue" active={phase >= 8} />
                      <div className="relative aspect-[4/5] w-full overflow-hidden">
                        <img
                          src={teaSunsetPortrait}
                          alt="Golden hour, Assam"
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                    <motion.blockquote
                      initial={{ opacity: 0 }}
                      animate={phase >= 8 ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: rm ? 0.3 : 0.8, delay: rm ? 0 : 1, ease }}
                      className="text-slate-500 italic text-sm sm:text-base leading-relaxed max-w-xs mb-6"
                    >
                      "If I ever write a book on how I see creativity, it will
                      have infinite pages. And I'll still be figuring it out."
                    </motion.blockquote>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={phase >= 8 ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: rm ? 0.3 : 0.6, delay: rm ? 0 : 1.5 }}
                      className="font-hand text-primary text-2xl underline decoration-primary/50 underline-offset-4"
                    >
                      Thank you.
                    </motion.p>
                  </NotebookPage>
                </HTMLFlipBook>

            </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ═══════════════ THE STORY (mobile / below lg) ═══════════════
            Not a shrunk-down notebook — there's no cursor to tilt toward,
            no corner to drag, and a fixed-height flip-book fighting a
            phone's own scroll is a bad combination. So below `lg` this is
            a completely different, purpose-built experience: one full-bleed
            chapter, told top to bottom, each beat revealing as it's
            scrolled to — the same "documentary crane shot" personality as
            the rest of the site on mobile, just told in the same warm,
            handwritten voice as the notebook above it. */}
        <MobileAboutStory />
      </div>
    </section>
  );
}

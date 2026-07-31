/**
 * CinematicSection — wraps any section with a cinematic scroll-driven reveal:
 *   • Opacity fade in/out as the section crosses the viewport edges
 *   • Subtle upward parallax drift (crane-shot feel)
 *   • Gentle scale breathing (dolly-in / dolly-out)
 *
 * Everything here is a pure function of scroll position (useScroll + useTransform),
 * not a threshold-triggered spring animation. That's what makes it look identical
 * scrolling up or down — there's no "replay" to trigger, no snapping, and no drift
 * out of sync with the scrollbar. Lenis already smooths the raw scroll input, so we
 * avoid re-smoothing it again here (double smoothing is what causes that laggy,
 * trailing-behind-the-scroll feeling) — the only spring is a light one to remove
 * high-frequency micro-jitter, tuned stiff enough to feel immediate.
 */
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, useInView } from "framer-motion";

interface CinematicSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Extra Y offset for parallax feel (default 30) */
  parallax?: number;
  /** Kept for API compatibility; entrance is scroll-driven, not delayed. */
  delay?: number;
}

// Tight spring: smooths micro-jitter without introducing perceptible lag behind the scrollbar.
const TIGHT_SPRING = { stiffness: 380, damping: 42, mass: 0.4 };

export default function CinematicSection({
  children,
  className = "",
  parallax = 30,
}: CinematicSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // 0 = section top enters bottom of viewport, 1 = section bottom exits top of viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [parallax, -parallax]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const rawScale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.97, 1, 1, 0.97]);

  const y = useSpring(rawY, TIGHT_SPRING);
  const opacity = useSpring(rawOpacity, TIGHT_SPRING);
  const scale = useSpring(rawScale, TIGHT_SPRING);

  // Only promote a section to its own composited GPU layer while it's near the
  // viewport (one screen-height above/below). With 8-9 of these mounted on the
  // page at once, leaving `will-change` on permanently for every one of them
  // (including sections scrolled far out of view) pins that many layers in the
  // compositor for the whole session — wasted GPU memory that's a real
  // contributor to scroll jank on mid-range/mobile GPUs on a long page.
  const isNearViewport = useInView(ref, { margin: "100% 0px 100% 0px" });

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y, opacity, scale, willChange: isNearViewport ? "transform, opacity" : "auto" }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ── Reusable stagger container (unchanged, cheap — IntersectionObserver only) ── */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/* ── Cinematic child variants — opacity/position only, no filter animation ── */
export const cinChild = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const cinChildLeft = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export const cinChildRight = {
  hidden: { opacity: 0, x: 60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

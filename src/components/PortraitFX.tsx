import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import "./portrait-fx.css";

/**
 * PortraitFX — premium presentation layer for the hero portrait.
 *
 * Only the *presentation* of the image is animated. The photo itself is never stretched, skewed
 * or cropped: the scroll effect is a uniform scale, everything else is opacity / glow / translate.
 *
 *  A. Mask reveal      – soft-edged wipe from bottom to top on load.
 *  B. Floating         – very slow, tiny vertical drift (looks like a separate layer).
 *  C. Spotlight        – blue glow that follows the cursor when it is near the portrait (mouse only).
 *  D. Edge glow        – thin blue rim light following the silhouette; brightens near the cursor.
 *  E. Scroll motion    – portrait scales down (uniformly) while a blue dusk halo fades in around it.
 *
 * Cost: a few CSS animations + one rAF-throttled pointermove handler (writes 3 CSS variables).
 * `prefers-reduced-motion` disables all motion, spotlight and the reveal.
 */

interface PortraitFXProps {
  src: string;
  alt: string;
  /** CSS drop-shadow for the main photo (kept identical to the original hero styling). */
  shadow?: string;
  className?: string;
}

const PROXIMITY_RADIUS = 320; // px – how far from the portrait the spotlight starts to wake up

export default function PortraitFX({ src, alt, shadow, className = "" }: PortraitFXProps) {
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState<"pending" | "revealing" | "done">(reduced ? "done" : "pending");

  // ── E. Scroll motion (framer-motion values bind straight to styles → no React re-renders)
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 650], [1, 0.9]);
  const lift = useTransform(scrollY, [0, 650], [0, 22]);
  const haloOpacity = useTransform(scrollY, [0, 520], [0, 1]);

  // ── A. Reveal once the photo is decoded (so the wipe never plays on an empty box)
  useEffect(() => {
    if (reduced) {
      setPhase("done");
      return;
    }
    const img = imgRef.current;
    const start = () => setPhase((p) => (p === "pending" ? "revealing" : p));
    if (img?.complete && img.naturalWidth > 0) start();
    else img?.addEventListener("load", start, { once: true });
    return () => img?.removeEventListener("load", start);
  }, [reduced]);

  // ── C + D. Cursor proximity → CSS variables (mouse / fine pointers only)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;
    let visible = true;

    const apply = () => {
      frame = 0;
      const r = root.getBoundingClientRect();
      const dx = Math.max(r.left - px, 0, px - r.right);
      const dy = Math.max(r.top - py, 0, py - r.bottom);
      const prox = Math.max(0, 1 - Math.hypot(dx, dy) / PROXIMITY_RADIUS);
      root.style.setProperty("--mx", `${(px - r.left).toFixed(1)}px`);
      root.style.setProperty("--my", `${(py - r.top).toFixed(1)}px`);
      root.style.setProperty("--prox", prox.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => root.style.setProperty("--prox", "0");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      root.dataset.paused = visible ? "false" : "true";
      if (!visible) onLeave();
    });
    io.observe(root);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const imgStyle = shadow ? { filter: `drop-shadow(${shadow})` } : undefined;

  return (
    <div ref={rootRef} className={`portrait-fx ${className}`} data-paused="false">
      {/* E. dusk halo that fades in while scrolling — sits behind everything */}
      <motion.div className="portrait-fx__halo" aria-hidden="true" style={reduced ? { opacity: 0 } : { opacity: haloOpacity }} />
      {/* C. cursor spotlight */}
      <div className="portrait-fx__spot" aria-hidden="true" />

      <motion.div
        className="portrait-fx__scale"
        style={reduced ? undefined : { scale, y: lift, transformOrigin: "50% 95%" }}
      >
        {/* B. floating */}
        <div className="portrait-fx__float">
          {/* A. reveal */}
          <div
            className="portrait-fx__reveal"
            data-phase={phase}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget) setPhase("done");
            }}
          >
            {/* D. rim light — same silhouette, blue drop-shadows, kept *behind* the photo */}
            <img className="portrait-fx__rim" src={src} alt="" aria-hidden="true" draggable={false} decoding="async" />
            <img
              ref={imgRef}
              className="portrait-fx__img w-full h-auto object-contain"
              src={src}
              alt={alt}
              draggable={false}
              style={imgStyle}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

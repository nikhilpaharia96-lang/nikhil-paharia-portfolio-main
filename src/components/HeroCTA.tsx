import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { RiArrowRightLine, RiFolderLine, RiFolderOpenLine, RiSendPlaneLine } from "react-icons/ri";
import "./hero-interactions.css";

/**
 * Hero CTA buttons — "Hire Me" and "Work".
 *
 * Hire Me : magnetic pull, blue gradient shift on hover, arrow slides right, click ripple, soft shadow.
 * Work    : folder icon opens on hover, light-blue background, smooth scroll to #projects.
 * Group   : very slight upward drift while scrolling (≤6px) — nothing animates continuously.
 */

type Variant = "mobile" | "desktop";


/** Smooth-scrolls to a section (same -24px offset the navbar uses). Returns false if it doesn't exist. */
function scrollToSection(id: string, reduced: boolean) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - 24;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  return true;
}

/** Click ripple — works for mouse/touch (pointerdown) and keyboard (click with detail === 0). */
function spawnRipple(e: ReactPointerEvent<HTMLElement> | ReactMouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const host = el.querySelector<HTMLElement>(".hero-cta__ripples");
  if (!host) return;
  const rect = el.getBoundingClientRect();
  const fromKeyboard = e.type === "click";
  const x = fromKeyboard ? rect.width / 2 : e.clientX - rect.left;
  const y = fromKeyboard ? rect.height / 2 : e.clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 2.2;
  const ripple = document.createElement("span");
  ripple.className = "hero-ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
  host.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

/**
 * Magnetic pull: when the cursor comes within `range` px of the button it drifts toward it
 * (max 14px), and scales slightly while hovered. Mouse / fine pointers only; one rAF-throttled
 * listener per button, paused when off-screen.
 */
function useMagnetic(ref: RefObject<HTMLDivElement>, disabled: boolean, range = 60, strength = 0.3, scaleHover = 1.03) {
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let visible = true;

    const write = (inside: boolean) => {
      el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${inside ? scaleHover : 1})`;
    };
    const apply = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - tx; // centre without the current offset → no feedback jitter
      const cy = r.top + r.height / 2 - ty;
      const dx = px - cx;
      const dy = py - cy;
      const outX = Math.max(Math.abs(dx) - r.width / 2, 0);
      const outY = Math.max(Math.abs(dy) - r.height / 2, 0);
      if (Math.hypot(outX, outY) < range) {
        tx = Math.max(-14, Math.min(14, dx * strength));
        ty = Math.max(-14, Math.min(14, dy * strength));
        write(outX === 0 && outY === 0);
      } else if (tx !== 0 || ty !== 0) {
        tx = 0;
        ty = 0;
        write(false);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const reset = () => {
      tx = 0;
      ty = 0;
      write(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    });
    io.observe(el);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, disabled, range, strength, scaleHover]);
}

function HireMeButton({ variant, reduced }: { variant: Variant; reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useMagnetic(wrapRef, reduced);

  return (
    <div ref={wrapRef} className="hero-magnetic">
      <a
        href="#contact"
        className={`hero-cta hero-cta--hire hero-cta--${variant}`}
        onPointerDown={(e) => !reduced && e.button === 0 && spawnRipple(e)}
        onClick={(e) => {
          if (e.detail === 0 && !reduced) spawnRipple(e); // keyboard activation
          if (scrollToSection("contact", reduced)) e.preventDefault();
        }}
      >
        <span className="hero-cta__ripples" aria-hidden="true" />
        <RiSendPlaneLine className="hero-cta__plane flex-shrink-0" aria-hidden="true" />
        <span>Hire Me</span>
        <RiArrowRightLine className="hero-cta__arrow flex-shrink-0" aria-hidden="true" />
      </a>
    </div>
  );
}

function WorkButton({ variant, reduced }: { variant: Variant; reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useMagnetic(wrapRef, reduced);

  return (
    <div ref={wrapRef} className="hero-magnetic">
      <a
        href="#projects"
        aria-label="View my work"
        className={`hero-cta hero-cta--work hero-cta--${variant}`}
        onPointerDown={(e) => !reduced && e.button === 0 && spawnRipple(e)}
        onClick={(e) => {
          if (e.detail === 0 && !reduced) spawnRipple(e);
          if (scrollToSection("projects", reduced)) e.preventDefault();
        }}
      >
        <span className="hero-cta__ripples" aria-hidden="true" />
        <span className="hero-folder" aria-hidden="true">
          <RiFolderLine className="hero-folder__closed" />
          <RiFolderOpenLine className="hero-folder__open" />
        </span>
        <span>{variant === "mobile" ? "Work" : "View My Work"}</span>
      </a>
    </div>
  );
}

export default function HeroCTAs({ variant }: { variant: Variant }) {
  const reduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, [0, 500], [0, -6]); // barely-there parallax

  return (
    <motion.div
      className={variant === "mobile" ? "relative z-10 flex items-center gap-2.5 mb-1" : "flex items-center gap-4 mb-6"}
      style={reduced ? undefined : { y: drift }}
    >
      <HireMeButton variant={variant} reduced={reduced} />
      <WorkButton variant={variant} reduced={reduced} />
    </motion.div>
  );
}

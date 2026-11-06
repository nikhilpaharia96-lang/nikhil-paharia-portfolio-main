import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { ChevronsLeftRight, Palette } from "lucide-react";
import { gradingDemo } from "@/constants/videoShowcase";
import { ease } from "@/animations/videoShowcase.motion";

/** CSS look of the ungraded "raw" frame: flat, washed-out, slightly cool. */
const RAW_FILTER = "saturate(0.32) contrast(0.78) brightness(1.12) sepia(0.12) hue-rotate(-8deg)";

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * Before / after colour-grading slider. Left of the handle = raw, right = graded.
 * Works with mouse, touch (vertical page scroll is preserved) and the keyboard.
 */
export default function GradingCompare() {
  const reduce = !!useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const touched = useRef(false);
  const inView = useInView(areaRef, { once: true, amount: 0.5 });

  // One gentle demo sweep the first time it scrolls into view, so people notice it's interactive.
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (touched.current) return;
      const t = Math.min((now - t0) / 1800, 1);
      setPos(50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t * 0.3));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPos(50);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  const moveTo = useCallback((clientX: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPos(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 4;
    const keys: Record<string, () => void> = {
      ArrowLeft: () => setPos((p) => clamp(p - step)),
      ArrowRight: () => setPos((p) => clamp(p + step)),
      Home: () => setPos(0),
      End: () => setPos(100),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      touched.current = true;
      fn();
    }
  };

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease }}
      className="mt-12 sm:mt-16 sm:max-w-4xl sm:mx-auto rounded-2xl p-3 sm:p-5
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-1 sm:px-0 mb-3 sm:mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            <Palette className="w-3.5 h-3.5" aria-hidden="true" />
            Color Grading
          </span>
          <h3 className="mt-1 font-serif font-bold text-xl sm:text-2xl text-foreground leading-tight">
            From flat footage to cinematic
          </h3>
        </div>
        <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
          <ChevronsLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
          Drag to compare raw vs graded
        </p>
      </div>

      <div
        ref={areaRef}
        className={`relative aspect-[4/3] sm:aspect-[16/8] w-full overflow-hidden rounded-xl select-none touch-pan-y ${
          dragging ? "cursor-grabbing" : "cursor-ew-resize"
        }`}
        onPointerDown={(e) => {
          touched.current = true;
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging && moveTo(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* graded (after) — full frame underneath */}
        <img
          src={gradingDemo.image}
          alt={gradingDemo.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* raw (before) — clipped to the left of the handle */}
        <img
          src={gradingDemo.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: RAW_FILTER, clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />

        <span className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
          Raw
        </span>
        <span className="pointer-events-none absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-400 to-primary text-white text-[10px] font-bold uppercase tracking-wider shadow">
          Graded
        </span>

        {/* handle */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.35)] pointer-events-none"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare raw and graded footage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% raw`}
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                       bg-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] flex items-center justify-center text-primary
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
          >
            <ChevronsLeftRight className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

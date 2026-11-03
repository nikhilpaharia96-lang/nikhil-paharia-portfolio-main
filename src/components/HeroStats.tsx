import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { motion, useInView, useReducedMotion } from "framer-motion";
import "./hero-interactions.css";

/**
 * Hero statistics — scroll-triggered count-up (~1.3 s), glass cards, hover lift, icon pop.
 *
 * The figures themselves live in Hero.tsx (`desktopStats`). This file only presents them, so
 * whatever numbers are listed there are what the counter animates to — keep them truthful.
 */

export interface HeroStat {
  value: string; // e.g. "96+", "1096+", "100%"
  label: string;
  Icon: IconType;
  color: string;
  bg: string;
}

const EASE_OUT: [number, number, number, number] = [0.22, 0.8, 0.24, 1];

/** Counts 0 → n once, when scrolled into view. Reduced motion shows the final figure immediately. */
export function StatCounter({ value, duration = 1300, onDone }: { value: string; duration?: number; onDone?: () => void }) {
  const reduced = useReducedMotion() ?? false;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.6 });

  const match = value.match(/^(\d[\d,]*)(.*)$/);
  const target = match ? Number(match[1].replace(/,/g, "")) : 0;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (!match || reduced || !inView) return;
    const el = numRef.current;
    if (!el) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (p < 1) raf = requestAnimationFrame(tick);
      else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  useEffect(() => {
    if (reduced && inView) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, inView]);

  if (!match) return <span>{value}</span>;

  return (
    <span ref={wrapRef} className="stat-counter" style={{ minWidth: `${value.length}ch` }}>
      <span className="sr-only">{value}</span>
      <span ref={numRef} aria-hidden="true">
        {reduced ? value : `0${suffix}`}
      </span>
    </span>
  );
}

function StatIcon({ Icon, color, size, boxClass, iconRef }: { Icon: IconType; color: string; size: number; boxClass: string; iconRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={iconRef} className={`stat-icon ${boxClass}`} style={{ backgroundColor: color + "18" }}>
      <Icon style={{ color, fontSize: size }} />
    </div>
  );
}

function useIconPop() {
  const ref = useRef<HTMLDivElement>(null);
  const pop = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-popped");
    void el.offsetWidth; // restart animation
    el.classList.add("is-popped");
  };
  return { ref, pop };
}

function DesktopCard({ stat }: { stat: HeroStat }) {
  const { ref, pop } = useIconPop();
  const { value, label, Icon, color, bg } = stat;
  return (
    <div
      className={`stat-card bg-gradient-to-br ${bg} px-3.5 py-3 xl:px-4 xl:py-3.5 flex items-center gap-2.5`}
      style={{ "--c": color } as CSSProperties}
    >
      <StatIcon iconRef={ref} Icon={Icon} color={color} size={16} boxClass="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-base xl:text-lg font-bold leading-none mb-0.5" style={{ color }}>
          <StatCounter value={value} onDone={pop} />
        </div>
        <div className="text-[10px] xl:text-[11px] font-semibold text-slate-700 leading-tight">{label}</div>
      </div>
    </div>
  );
}

/** Desktop: 4 stacked glass cards. */
export function DesktopStats({ stats }: { stats: HeroStat[] }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <div className="flex flex-col gap-3 xl:gap-4 justify-center flex-shrink-0 w-[148px] xl:w-[168px]">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={reduced ? false : { opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: i * 0.09, ease: EASE_OUT }}
        >
          <DesktopCard stat={stat} />
        </motion.div>
      ))}
    </div>
  );
}

function MobileCell({ stat, index }: { stat: HeroStat; index: number }) {
  const reduced = useReducedMotion() ?? false;
  const { ref, pop } = useIconPop();
  const { value, label, Icon, color } = stat;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: EASE_OUT }}
      className="flex flex-col items-center text-center py-2 px-1"
    >
      <StatIcon iconRef={ref} Icon={Icon} color={color} size={10} boxClass="w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-1 flex-shrink-0" />
      <div className="font-bold leading-tight text-foreground whitespace-nowrap" style={{ fontSize: "clamp(0.68rem, 3vw, 1rem)" }}>
        <StatCounter value={value} onDone={pop} />
      </div>
      <div className="text-slate-500 font-medium leading-tight mt-0.5" style={{ fontSize: "clamp(0.44rem, 1.7vw, 0.6rem)" }}>
        {label}
      </div>
    </motion.div>
  );
}

/** Mobile: one frosted-glass panel with 4 columns. */
export function MobileStats({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="stat-panel relative z-20 grid grid-cols-4 gap-0 rounded-2xl mt-3 overflow-hidden divide-x divide-slate-100">
      {stats.map((stat, i) => (
        <MobileCell key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}

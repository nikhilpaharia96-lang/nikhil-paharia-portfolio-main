import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { TrustStat } from "@/types/testimonial";

const COUNT_DURATION_MS = 1400;

/** Counts a number up from 0 to `target` once, the first time the element enters the viewport. */
function useCountUp(target: number, decimals: number, disabled: boolean) {
  const [value, setValue] = useState(disabled ? target : 0);
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (disabled) {
      setValue(target);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return;
        hasRun.current = true;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
          // easeOutExpo-ish deceleration
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setValue(Number((eased * target).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, decimals, disabled]);

  return { value, ref };
}

type StatsCardProps = {
  stat: TrustStat;
  index: number;
  isLast: boolean;
};

export default function StatsCard({ stat, index, isLast }: StatsCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = stat.icon;
  const { value, ref } = useCountUp(stat.value, stat.decimals ?? 0, !!stat.staticText || !!prefersReducedMotion);

  const displayValue = stat.staticText
    ? stat.staticText
    : `${stat.prefix ?? ""}${value.toFixed(stat.decimals ?? 0)}${stat.suffix ?? ""}`;

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      className={`group relative flex flex-col items-start gap-3 lg:pr-8 ${
        !isLast ? "lg:border-r lg:border-slate-200/70" : ""
      }`}
    >
      <div className="relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur border border-white/80 flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(15,45,90,0.3)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
        <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
        <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
      </div>
      <div
        className="font-serif font-extrabold text-xl sm:text-2xl text-foreground tabular-nums"
        aria-live={stat.staticText ? undefined : "off"}
      >
        {displayValue}
      </div>
      <p className="text-xs sm:text-sm text-slate-500 leading-snug">{stat.label}</p>
    </motion.div>
  );
}

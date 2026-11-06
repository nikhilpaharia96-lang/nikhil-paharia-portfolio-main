import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Users, Clapperboard, Star, Heart } from "lucide-react";
import { trustStats } from "@/constants/testimonials";
import { ease } from "@/animations/videoShowcase.motion";

// Icons follow the design (people, clapperboard, star, heart). Numbers and labels
// come from the existing trustStats data — nothing invented.
const icons = [Users, Clapperboard, Star, Heart];

/** Counts up from 0 every time it scrolls into view (final value for reduced motion). */
function CountUp({ value, suffix = "", reduce }: { value: number; suffix?: string; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: "-40px" });
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return;
    if (!inView) { setN(0); return; }
    const controls = animate(0, value, { duration: 1.5, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{n}{suffix}</span>;
}

export default function TestimonialStats() {
  const reduce = !!useReducedMotion();

  return (
    <motion.dl
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.3 }}
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: reduce ? 0.01 : 0.8, ease, staggerChildren: 0.1, delayChildren: 0.15 } } }}
      className="grid grid-cols-4 lg:grid-cols-2 gap-x-0 sm:gap-x-4 gap-y-3.5 rounded-[clamp(1rem,4.5vw,1.25rem)] bg-white/55 backdrop-blur-md border border-white/70 px-[clamp(0.3rem,2.2vw,1.25rem)] py-[clamp(0.65rem,3vw,1rem)]"
    >
      {trustStats.slice(0, 4).map(({ value, suffix, label, staticText }, i) => {
        const Icon = icons[i] ?? Star;
        return (
          <motion.div
            key={label}
            variants={{ hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.6, ease } } }}
            className="group flex flex-col items-center text-center gap-1 px-0.5 min-w-0 border-slate-300/60 max-sm:[&:not(:first-child)]:border-l sm:flex-row sm:text-left sm:gap-[clamp(0.4rem,2vw,0.65rem)] sm:px-0"
          >
            <Icon
              className="w-[clamp(1.15rem,5.8vw,1.9rem)] h-[clamp(1.15rem,5.8vw,1.9rem)] shrink-0 text-[#0866FF] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="min-w-0 leading-none">
              <dd className="order-first whitespace-nowrap font-sans font-extrabold tracking-tight text-[#0b1530] text-[clamp(0.9rem,4.2vw,1.5rem)]">
                {staticText ?? <CountUp value={value} suffix={suffix ?? ""} reduce={reduce} />}
              </dd>
              <dt className="mt-1 sm:mt-1.5 text-[clamp(0.58rem,2.55vw,0.75rem)] leading-tight text-slate-500 text-balance">{label}</dt>
            </div>
          </motion.div>
        );
      })}
    </motion.dl>
  );
}

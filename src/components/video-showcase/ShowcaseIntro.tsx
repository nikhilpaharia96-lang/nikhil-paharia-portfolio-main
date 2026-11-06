import { motion, useReducedMotion } from "framer-motion";
import { Play, Briefcase } from "lucide-react";
import { showcaseStats } from "@/constants/videoShowcase";
import { ease } from "@/animations/videoShowcase.motion";

type ShowcaseIntroProps = {
  onWatchShowreel: () => void;
};

export default function ShowcaseIntro({ onWatchShowreel }: ShowcaseIntroProps) {
  const reduce = !!useReducedMotion();
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } } };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 26 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.8, ease } },
  };

  return (
    <motion.div
      className="relative"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
    >
      <motion.div
        variants={item}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-primary/25 shadow-[0_8px_24px_-12px_rgba(15,45,90,0.25)] mb-6"
      >
        <span className="relative flex w-2 h-2" aria-hidden="true">
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <span className="relative w-2 h-2 rounded-full bg-red-500" />
        </span>
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-slate-700">
          Cinematography &amp; Video Editing
        </span>
      </motion.div>

      <motion.h2
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
        className="font-sans font-extrabold tracking-tight text-[2.9rem] sm:text-6xl lg:text-[4.2rem] leading-[0.98] text-[#0a0f1e]"
      >
        <motion.span variants={item} className="block">Visual Stories</motion.span>
        <motion.span variants={item} className="block">
          That{" "}
        <span className="relative isolate inline-block font-script font-bold italic text-primary text-[1.12em] leading-none -rotate-3 align-baseline">
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-1 inset-y-2 -z-10 rounded-full bg-primary/30 blur-2xl"
              animate={{ opacity: [0.15, 0.55, 0.15] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          Feel Real
          <svg
            aria-hidden="true"
            className="absolute left-0 -bottom-2 w-full h-3 text-primary"
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
            fill="none"
          >
            <motion.path
              d="M3 8 C 40 2, 110 2, 197 6"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: reduce ? 1 : 0 },
                show: { pathLength: 1, transition: { duration: reduce ? 0.01 : 0.9, delay: reduce ? 0 : 0.55, ease } },
              }}
            />
          </svg>
          <span className="text-primary">.</span>
        </span>
        </motion.span>
      </motion.h2>

      <motion.p variants={item} className="mt-7 max-w-md text-base sm:text-[1.05rem] leading-relaxed text-slate-700">
        I create cinematic films, travel videos, documentaries and commercial edits that capture
        emotion, tell stories and leave a lasting impact.
      </motion.p>

      <motion.div variants={item} className="mt-7 hidden sm:flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          onClick={onWatchShowreel}
          whileHover={reduce ? undefined : { y: -2, scale: 1.04 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="group relative overflow-hidden inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-primary text-white text-sm font-semibold shadow-[0_14px_30px_-10px_rgba(29,111,235,0.7)] hover:shadow-[0_18px_38px_-10px_rgba(29,111,235,0.85)] hover:brightness-110 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/35 transition-transform duration-700 ease-out group-hover:translate-x-[520%]"
          />
          <Play className="relative w-4 h-4 transition-transform duration-300 group-hover:scale-125" aria-hidden="true" />
          <span className="relative">Watch Showreel</span>
        </motion.button>
        <motion.a
          href="#contact"
          whileHover={reduce ? undefined : { y: -2, scale: 1.03 }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/75 backdrop-blur-xl border border-white/80 text-sm font-semibold text-slate-800 shadow-[0_10px_26px_-12px_rgba(15,45,90,0.3)] hover:bg-white hover:shadow-[0_14px_32px_-12px_rgba(29,111,235,0.35)] transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          <Briefcase className="w-4 h-4 text-primary" aria-hidden="true" />
          Hire for Projects
        </motion.a>
      </motion.div>

      <motion.dl
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="mt-8 hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5"
      >
        {showcaseStats.map(({ icon: Icon, value, label }) => (
          <motion.div key={label} variants={item} className="group flex items-center gap-2.5">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/80 border border-white/90 flex items-center justify-center shadow-[0_8px_20px_-10px_rgba(15,45,90,0.35)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_-10px_rgba(29,111,235,0.5)]">
              <Icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <dt className="sr-only">{label}</dt>
              <dd className="font-bold text-base text-slate-900">{value}</dd>
              <span aria-hidden="true" className="block text-[10px] text-slate-500">
                {label}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.dl>
    </motion.div>
  );
}

import { motion, useReducedMotion } from "framer-motion";
import { Clapperboard, Film, Camera } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import { ease } from "@/animations/videoShowcase.motion";
import BackgroundGlow from "./BackgroundGlow";
import FloatingChip from "./FloatingChip";
import FeaturedVideoCard from "./FeaturedVideoCard";
import ProjectCarousel from "./ProjectCarousel";
import FeatureStrip from "./FeatureStrip";

export default function VideoShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="videos"
      className="relative overflow-hidden section-wrap max-w-full py-20 sm:py-28 md:py-36 lg:py-40"
      aria-label="Cinematic Reels — My Cinematic Work"
    >
      <BackgroundGlow />

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-start mb-16 sm:mb-20">
          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 relative">
            <FloatingChip icon={Film} className="top-[-2.2rem] right-4" delay={0} duration={7} />
            <FloatingChip icon={Clapperboard} className="top-28 -right-2" delay={1.1} duration={7.5} />
            <FloatingChip icon={Camera} className="bottom-10 right-12" delay={0.6} duration={6.5} />

            <svg
              aria-hidden="true"
              className="absolute -left-6 top-40 hidden lg:block opacity-40 pointer-events-none"
              width="160"
              height="220"
              viewBox="0 0 160 220"
              fill="none"
            >
              <motion.path
                d="M10 10 C 90 40, 20 120, 100 150 S 60 210, 150 210"
                stroke="url(#videoCurveGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.4, ease: "easeInOut" }}
              />
              <defs>
                <linearGradient id="videoCurveGradient" x1="0" y1="0" x2="0" y2="220">
                  <stop offset="0%" stopColor="#1d6feb" stopOpacity="0" />
                  <stop offset="50%" stopColor="#1d6feb" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1d6feb" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/60 backdrop-blur-xl border border-white/70
                         shadow-[0_8px_24px_-10px_rgba(15,45,90,0.25)] mb-7"
            >
              <span aria-hidden="true">🎬</span>
              <span className="text-xs font-mono font-semibold tracking-[0.18em] uppercase text-primary">
                My Cinematic Work
              </span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="font-serif font-bold text-[2.4rem] sm:text-5xl lg:text-[3.1rem] leading-[1.08] text-foreground mb-6"
            >
              <SplitText type="words">Cinematic Stories That People Remember.</SplitText>
            </motion.h2>

            <motion.p
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md"
            >
              I create cinematic films, documentaries, travel videos and commercial edits that
              capture emotion, tell stories and leave a lasting impression.
            </motion.p>
          </div>

          {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
          <div className="lg:col-span-8">
            <FeaturedVideoCard />
            <ProjectCarousel />
          </div>
        </div>

        <FeatureStrip />
      </div>
    </section>
  );
}

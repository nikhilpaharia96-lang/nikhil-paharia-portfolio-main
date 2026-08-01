import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { showcaseFeatures } from "@/constants/videoShowcase";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="group flex flex-col items-start gap-3 shrink-0 w-[68vw] xs:w-56 sm:w-auto">
      <div className="relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur border border-white/80 flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(15,45,90,0.3)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
        <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
        <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
      </div>
      <h4 className="font-serif font-bold text-base sm:text-lg text-foreground">{feature.title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

export default function FeatureStrip() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 rounded-3xl p-6 sm:p-8 overflow-hidden
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]"
    >
      {/* Mobile: auto-scrolling marquee (items duplicated once for a seamless loop) */}
      <div className="sm:hidden -mx-6 px-6 overflow-hidden">
        <div
          className={`flex w-max gap-6 ${
            prefersReducedMotion ? "" : "animate-feature-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused]"
          }`}
        >
          {[...showcaseFeatures, ...showcaseFeatures].map((feature, i) => (
            <FeatureCard key={`${feature.title}-${i}`} feature={feature} />
          ))}
        </div>
      </div>

      {/* Tablet/desktop: static grid, no auto-scroll */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {showcaseFeatures.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </motion.div>
  );
}

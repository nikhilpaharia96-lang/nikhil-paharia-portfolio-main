import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageSquareHeart } from "lucide-react";
import { ease } from "@/animations/testimonials.motion";

type WorkedWithMeCTAProps = {
  onOpen: () => void;
  /** "floating" = absolutely positioned desktop card; "inline" = static block for mobile/tablet. */
  variant: "floating" | "inline";
};

export default function WorkedWithMeCTA({ onOpen, variant }: WorkedWithMeCTAProps) {
  const prefersReducedMotion = useReducedMotion();
  const isFloating = variant === "floating";

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: isFloating ? -12 : 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: isFloating ? 0.3 : 0, ease }}
      className={
        isFloating
          ? "hidden lg:block absolute -top-4 right-0 z-20 w-72"
          : "lg:hidden mt-10 sm:mt-12"
      }
    >
      <motion.div
        animate={isFloating && !prefersReducedMotion ? { y: [0, -8, 0] } : undefined}
        transition={isFloating && !prefersReducedMotion ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <button
          type="button"
          onClick={onOpen}
          className="interactive group relative w-full text-left rounded-3xl p-5 sm:p-6
                     bg-white/60 backdrop-blur-2xl border border-white/80
                     shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_24px_50px_-18px_rgba(15,45,90,0.3)]
                     hover:shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_30px_60px_-16px_rgba(15,45,90,0.38)]
                     hover:border-primary/30 transition-all duration-400
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <MessageSquareHeart className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-serif font-bold text-foreground text-base leading-tight">Worked with me?</p>
              <p className="text-sm font-semibold text-primary flex items-center gap-1 mt-0.5">
                Share your experience
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-3">
            If we've worked together, I'd love to hear about your experience.
          </p>
        </button>
      </motion.div>
    </motion.div>
  );
}

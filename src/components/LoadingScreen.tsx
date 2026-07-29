import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import npLogo from "@/assets/logos/np-logo.webp";

const DURATION_MS = 2200;
const FADE_MS = 450;

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const finish = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transition = `opacity ${FADE_MS}ms ease`;
    containerRef.current.style.opacity = "0";
    setTimeout(() => setDone(true), FADE_MS);
  };

  useEffect(() => {
    // Reduced-motion users get a near-instant, motion-free exit.
    const delay = prefersReducedMotion ? 150 : DURATION_MS;
    const timer = setTimeout(finish, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  if (done) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] overflow-hidden bg-background flex items-center justify-center"
    >
      {/* Soft ambient glow behind the mark, consistent with the rest of the site's glass language */}
      <div
        className="absolute w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_20px_50px_-20px_rgba(15,45,90,0.35)] flex items-center justify-center"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={npLogo} alt="Nikhil Paharia" className="w-9 h-9 sm:w-11 sm:h-11 object-contain" />
        </motion.div>

        {prefersReducedMotion ? (
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary/70 animate-spin" aria-hidden="true" />
        ) : (
          <div className="w-32 sm:w-40 h-[3px] rounded-full bg-slate-200/70 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: DURATION_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}
      </div>

      <span className="sr-only" role="status">
        Loading site content
      </span>
    </div>
  );
}

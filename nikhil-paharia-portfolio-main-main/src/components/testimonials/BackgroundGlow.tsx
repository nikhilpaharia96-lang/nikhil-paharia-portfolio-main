import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import teaBg from "@/assets/images/tea-sunset-portrait.webp";
import { useReducedFx } from "@/hooks/use-reduced-fx";

/**
 * Full-bleed decorative background for the Testimonials section.
 *
 * Design intent: the cinematic photo should read as an ambient mood, never
 * compete with the glass cards sitting on top of it. Compared to the
 * previous version this pushes blur/opacity further and adds a soft radial
 * glow roughly where the active card sits, so the eye is drawn there first.
 */
export default function BackgroundGlow() {
  const prefersReducedMotion = useReducedMotion();
  const reduceFx = useReducedFx();

  // Fewer particles, and no infinite drift, when motion/perf should be reduced.
  const particles = useMemo(() => Array.from({ length: reduceFx ? 6 : 14 }), [reduceFx]);
  const animatePhoto = !prefersReducedMotion && !reduceFx;

  return (
    <>
      {/* Cinematic photo — heavily subdued so it reads as texture, not focus */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={teaBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center scale-110"
          style={{ filter: "brightness(0.92) saturate(0.85) blur(1px)" }}
          animate={animatePhoto ? { scale: [1.1, 1.15, 1.1], x: [0, -8, 0] } : undefined}
          transition={animatePhoto ? { duration: 42, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <div className="absolute inset-0 backdrop-blur-[6px] sm:backdrop-blur-[10px]" />
        {/* Lighter overall wash + stronger center-out fade so the photo recedes
            further at the edges, where cards and copy actually sit. */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/88 to-white/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-blue-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_15%,rgba(8,20,45,0.05)_100%)]" />
      </div>

      {/* Radial glow anchored behind the active testimonial card */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[30rem] rounded-full bg-primary/10 blur-[120px]"
          animate={animatePhoto ? { opacity: [0.5, 0.8, 0.5] } : { opacity: 0.65 }}
          transition={animatePhoto ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      </div>

      {/* Soft atmospheric fog orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[8%] left-[8%] w-[26rem] h-[26rem] bg-blue-200/15 rounded-full blur-[150px]"
          style={animatePhoto ? { animation: "fogDrift 18s ease-in-out infinite" } : undefined}
        />
        <div
          className="absolute bottom-[6%] right-[6%] w-[22rem] h-[22rem] bg-amber-100/20 rounded-full blur-[130px]"
          style={animatePhoto ? { animation: "fogDrift 22s ease-in-out infinite reverse" } : undefined}
        />
      </div>

      {/* Floating particles — skipped entirely under reduced motion */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {particles.map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                left: `${(i * 43) % 100}%`,
                top: `${(i * 61) % 100}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              }}
              animate={{ y: [0, -26, 0], opacity: [0.12, 0.45, 0.12] }}
              transition={{
                duration: 6 + (i % 5),
                delay: i * 0.32,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

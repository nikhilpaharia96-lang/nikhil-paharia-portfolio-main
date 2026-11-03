import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import showcaseBg from "@/assets/images/showcase-bg.webp";
import { useReducedFx } from "@/hooks/use-reduced-fx";

export default function BackgroundGlow() {
  const prefersReducedMotion = useReducedMotion();
  const reduceFx = useReducedFx();
  const animate = !prefersReducedMotion && !reduceFx;
  const particles = useMemo(() => Array.from({ length: reduceFx ? 6 : 14 }), [reduceFx]);

  return (
    <>
      <div className="absolute inset-0 z-0">
        <motion.img
          src={showcaseBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-[center_30%] scale-105"
          animate={animate ? { scale: [1.05, 1.1, 1.05], x: [0, 10, 0] } : undefined}
          transition={animate ? { duration: 36, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,transparent_20%,rgba(8,20,45,0.06)_100%)]" />
      </div>

      {/* Golden light sweep */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{ background: "linear-gradient(115deg, transparent 25%, rgba(255,214,140,0.3) 48%, transparent 70%)" }}
        animate={animate ? { x: ["30%", "-30%", "30%"] } : undefined}
        transition={animate ? { duration: 20, repeat: Infinity, ease: "easeInOut" } : undefined}
      />

      {/* Fog orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[10%] right-[8%] w-[26rem] h-[26rem] bg-blue-200/20 rounded-full blur-[130px]"
          style={animate ? { animation: "fogDrift 15s ease-in-out infinite" } : undefined}
        />
        <div
          className="absolute bottom-[8%] left-[6%] w-[22rem] h-[22rem] bg-amber-100/25 rounded-full blur-[110px]"
          style={animate ? { animation: "fogDrift 18s ease-in-out infinite reverse" } : undefined}
        />
      </div>

      {/* Floating particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {particles.map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white/70"
              style={{
                left: `${(i * 41) % 100}%`,
                top: `${(i * 59) % 100}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                boxShadow: "0 0 6px rgba(255,255,255,0.8)",
              }}
              animate={{ y: [0, -28, 0], opacity: [0.15, 0.55, 0.15] }}
              transition={{ duration: 6 + (i % 5), delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}
    </>
  );
}

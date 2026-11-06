import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import bg from "@/assets/images/showcase-bg.webp";
import cloudImg from "@/assets/images/cloud2.895414a23f99e60c66ea.webp";
import { useReducedFx } from "@/hooks/use-reduced-fx";
import "../video-showcase/showcase-fx.css";

/**
 * Scenic backdrop: real photo (sky, snow peaks, forest, sunrise), softly blurred
 * under a light blue-white veil so cards and text stay readable.
 * Desktop adds slow scroll parallax + drifting clouds/mist; phones, low-power
 * devices and reduced-motion get the static photo only.
 */
export default function BackgroundGlow() {
  const prefersReducedMotion = useReducedMotion();
  const reduceFx = useReducedFx();
  const animate = !prefersReducedMotion && !reduceFx;

  const rootRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], animate ? [-24, 24] : [0, 0]);
  const cloudY = useTransform(scrollYProgress, [0, 1], animate ? [-46, 46] : [0, 0]);

  useEffect(() => {
    const root = rootRef.current;
    const clouds = cloudsRef.current;
    if (!root || !clouds) return;
    const io = new IntersectionObserver(([e]) => { clouds.dataset.paused = e.isIntersecting ? "false" : "true"; });
    io.observe(root);
    return () => io.disconnect();
  }, [animate]);

  return (
    <div ref={rootRef} className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <img
          src={bg}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-[62%_center] scale-105 blur-[2px] lg:blur-0"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/45" />
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent" />

      {animate && (
        <div ref={cloudsRef} className="vsx-clouds" data-paused="false">
          <motion.div className="absolute inset-0" style={{ y: cloudY }}>
            {(["a", "b"] as const).map((l) => (
              <div key={l} className={`vsx-layer vsx-layer--${l}`}>
                {[0, 1].map((g) => (
                  <div key={g} className="vsx-group">
                    {[0, 1, 2].map((i) => (
                      <img key={i} src={cloudImg} alt="" loading="lazy" decoding="async" className="vsx-cloud" />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
          <div className="vsx-mist" />
        </div>
      )}
    </div>
  );
}

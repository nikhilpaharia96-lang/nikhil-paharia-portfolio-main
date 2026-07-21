import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useReducedFx } from "@/hooks/use-reduced-fx";

export default function GlobalBackground() {
  const { scrollYProgress } = useScroll();
  const reducedFx = useReducedFx();

  // Subtle background elements parallax
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const smoothY = useSpring(yParallax, { stiffness: 45, damping: 20 });

  // Lighter blur radii + no infinite pulse on small/low-power screens — large
  // blur filters are one of the most GPU-expensive things a mobile compositor
  // can be asked to do every frame.
  const blurLg = reducedFx ? "blur-[40px]" : "blur-[120px]";
  const blurLg2 = reducedFx ? "blur-[36px]" : "blur-[110px]";
  const blurMd = reducedFx ? "blur-[40px]" : "blur-[130px]";
  const blurMd2 = reducedFx ? "blur-[44px]" : "blur-[140px]";
  const blurMd3 = reducedFx ? "blur-[36px]" : "blur-[120px]";
  const pulse = reducedFx ? "" : "animate-pulse";

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#f8fbff]">
      {/* slow dynamic mesh gradient */}
      <div className="absolute inset-0 opacity-45">
        <div
          className={`absolute top-[-5vw] left-[-5vw] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-blue-100/50 via-sky-100/30 to-transparent ${blurLg} ${pulse}`}
          style={{ animationDuration: "14s" }}
        />
        <div
          className={`absolute bottom-[-10vw] right-[-10vw] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-indigo-100/40 via-blue-50/30 to-transparent ${blurLg2} ${pulse}`}
          style={{ animationDuration: "18s", animationDelay: "2.5s" }}
        />
      </div>

      {/* light rays vectors overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.5">
          <path d="M-100 -50 L450 1000 L600 1000 Z" fill="url(#ray-grad-1)" />
          <path d="M250 -50 L950 1000 L1100 1000 Z" fill="url(#ray-grad-2)" />
        </g>
        <defs>
          <linearGradient id="ray-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d6feb" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ray-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* subtle moving fog (drifts slower than layout scrolls) */}
      <motion.div style={{ y: reducedFx ? 0 : smoothY }} className="absolute inset-0 opacity-[0.3]">
        <div
          className={`absolute top-[18%] left-[8%] w-[380px] h-[380px] bg-blue-200/20 rounded-full ${blurMd} ${pulse}`}
          style={{ animationDuration: "15s" }}
        />
        <div
          className={`absolute top-[52%] right-[4%] w-[420px] h-[420px] bg-sky-200/25 rounded-full ${blurMd2} ${pulse}`}
          style={{ animationDuration: "20s", animationDelay: "1.5s" }}
        />
        {!reducedFx && (
          <div
            className={`absolute top-[82%] left-[4%] w-[320px] h-[320px] bg-indigo-200/15 rounded-full ${blurMd3} ${pulse}`}
            style={{ animationDuration: "17s", animationDelay: "3s" }}
          />
        )}
      </motion.div>

      {/* slow floating subtle particles — skip entirely on low-power/reduced-motion */}
      {!reducedFx && (
        <div className="absolute inset-0 opacity-[0.35]">
          {[
            { left: "8%", top: "12%", delay: "0s", dur: "15s" },
            { left: "82%", top: "22%", delay: "2s", dur: "20s" },
            { left: "28%", top: "42%", delay: "1s", dur: "18s" },
            { left: "72%", top: "58%", delay: "3.5s", dur: "22s" },
            { left: "12%", top: "72%", delay: "2.5s", dur: "16s" },
            { left: "88%", top: "82%", delay: "4s", dur: "24s" },
          ].map((pt, idx) => (
            <div
              key={idx}
              className="absolute w-1.5 h-1.5 bg-primary/25 rounded-full blur-[0.5px]"
              style={{
                left: pt.left,
                top: pt.top,
                animation: `floatY ${pt.dur} ease-in-out infinite ${pt.delay}`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

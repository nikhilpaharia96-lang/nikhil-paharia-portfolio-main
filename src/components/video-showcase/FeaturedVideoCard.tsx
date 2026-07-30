import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import bgVideo from "@/assets/videos/loading-bg-desktop.mp4";
import { featuredVideo } from "@/constants/videoShowcase";
import { ease, tiltSpring } from "@/animations/videoShowcase.motion";

export default function FeaturedVideoCard() {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const active = hovered || playing;

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), tiltSpring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), tiltSpring);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(480px circle at ${x} ${y}, rgba(29,111,235,0.25), transparent 70%)`,
  );

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active) {
      if (!playing) vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [active, playing]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setHovered(false);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease }}
    >
      <motion.div
        animate={prefersReducedMotion || active ? { y: 0 } : { y: [0, -10, 0] }}
        transition={active ? { duration: 0.4 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{
            rotateX: prefersReducedMotion ? 0 : rotateX,
            rotateY: prefersReducedMotion ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className="group relative rounded-[32px] p-[1.5px]"
        >
          <div className="absolute -inset-[1.5px] rounded-[32px] bg-[conic-gradient(from_0deg,rgba(29,111,235,0.6),rgba(255,255,255,0.2),rgba(29,111,235,0.6))] opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -inset-6 rounded-[40px] bg-primary/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10" />

          <div className="relative rounded-[31px] overflow-hidden bg-[#0a1220] aspect-video w-full shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_40px_80px_-24px_rgba(8,20,45,0.55)]">
            <motion.img
              src={featuredVideo.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              animate={{
                scale: active ? 1.08 : 1,
                filter: active ? "blur(1px) brightness(0.6)" : "brightness(0.85)",
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />

            <video
              ref={videoRef}
              src={bgVideo}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />

            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: glowBg }}
            />

            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
              <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold uppercase tracking-[0.14em]">
                {featuredVideo.category}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-semibold">
                {featuredVideo.duration}
              </span>
            </div>

            {/* Center play/pause control — a real button now: keyboard-focusable,
                operable by Enter/Space, and works for touch users who have no hover state. */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <motion.button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? `Pause preview of ${featuredVideo.title}` : `Play preview of ${featuredVideo.title}`}
                aria-pressed={playing}
                className="interactive relative focus-visible:outline-none"
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {!prefersReducedMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-white/40"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-[0_20px_45px_-10px_rgba(0,0,0,0.5)] group-focus-visible:ring-4 group-focus-visible:ring-primary/40 focus-visible:ring-4 focus-visible:ring-primary/50">
                  {playing ? (
                    <Pause className="w-8 h-8 sm:w-9 sm:h-9 text-primary" fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-9 sm:h-9 text-primary ml-1" fill="currentColor" aria-hidden="true" />
                  )}
                </div>
              </motion.button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
              <h3 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight max-w-xl">
                {featuredVideo.title}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

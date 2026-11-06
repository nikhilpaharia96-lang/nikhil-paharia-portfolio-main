import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Eye, Play, MapPin, Clapperboard, Building2 } from "lucide-react";
import type { CardVariant, Project } from "@/types/video";
import { ease, cardSpring, tiltSpring } from "@/animations/videoShowcase.motion";

type ProjectCardProps = {
  project: Project;
  variant: CardVariant;
  distance: number;
  index: number;
  onSelect: () => void;
  onPlay?: (project: Project) => void;
};

export default function ProjectCard({ project, variant, distance, index, onSelect, onPlay }: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isActive = variant === "active";
  const ref = useRef<HTMLDivElement>(null);
  const premium = !!project.premium;
  const isReel = !!project.videoUrl && /instagram\.com\/reel/i.test(project.videoUrl);
  
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), tiltSpring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), tiltSpring);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(240px circle at ${x} ${y}, rgba(29,111,235,0.3), transparent 70%)`,
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const weight = 1 - Math.min(Math.abs(distance), 2) / 2;
  const scale = isActive ? 1.04 : 0.93 + weight * 0.04;
  const opacity = isActive ? 1 : 0.9;

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease }}
      className="shrink-0 w-[78vw] xs:w-[300px] sm:w-[320px] snap-start"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        animate={{ scale, opacity }}
        transition={cardSpring}
        whileHover={{ y: -10 }}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group relative rounded-[26px] p-[1px] transition-transform duration-300"
      >
        <div
          className="absolute inset-0 rounded-[26px] opacity-50 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: premium
              ? "linear-gradient(140deg, rgba(226,189,120,0.75), rgba(255,255,255,0.18) 45%, rgba(226,189,120,0.45))"
              : "linear-gradient(140deg, rgba(29,111,235,0.55), rgba(255,255,255,0.15) 45%, rgba(29,111,235,0.35))",
          }}
        />

        <div
          className={`relative rounded-[25px] overflow-hidden bg-[#0a1220]
                     shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_24px_50px_-18px_rgba(8,20,45,0.5)]
                     group-hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_30px_60px_-16px_rgba(8,20,45,0.6)]
                     transition-shadow duration-500 ${isActive ? "ring-1 ring-primary/40" : ""}`}
        >
          <div className={`relative w-full overflow-hidden ${premium ? "aspect-[4/5.35]" : "aspect-[4/5]"}`}>
            <motion.img
              src={project.image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              // Premium: the source is a text-heavy poster, so crop in on the
              // person + jewellery (left side) instead of showing clipped text.
              style={premium ? { originX: 0, originY: 0.12 } : undefined}
              initial={premium ? { scale: 1.78 } : undefined}
              animate={premium ? { scale: 1.78 } : undefined}
              whileHover={{ scale: premium ? 1.86 : 1.08 }}
              transition={{ duration: premium ? 0.9 : 0.6, ease: "easeOut" }}
            />

            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] backdrop-blur-0 group-hover:backdrop-blur-[1px] transition-all duration-500" />
            <div className={`absolute inset-0 bg-gradient-to-t ${premium ? "from-[#12040a]/95 via-[#12040a]/55 via-45% to-black/15" : "from-black/90 via-black/15 to-black/10"}`} />
            {premium && (
              <>
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
                {/* soften leftover poster lettering on the right edge of the crop */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#12040a]/75 to-transparent" />
                {/* light sweep on hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out motion-reduce:hidden"
                  style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,236,190,0.22) 50%, transparent 60%)" }}
                />
              </>
            )}
            <div aria-hidden="true" className={`pointer-events-none absolute inset-0 bg-[#0a1220] transition-opacity duration-500 ${isActive ? "opacity-0" : "opacity-25"}`} />

            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: glowBg }}
            />

            <div className="absolute top-3.5 left-3.5 right-3.5 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2 z-10">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                  premium
                    ? "bg-gradient-to-r from-[#f3d9a0] to-[#d9b36c] border border-[#f7e6bd] text-[#3a2208]"
                    : "bg-white/90 border border-white text-slate-800"
                }`}
              >
                {project.category}
              </span>
              {premium ? (
                isReel && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    <Clapperboard className="w-3 h-3" aria-hidden="true" />
                    Reel
                  </span>
                )
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-mono font-semibold">{project.duration}</span>
              )}
            </div>

            {/* Preview control — a real button now, focusable and clickable
                (centers this card in the carousel), not just a decorative div. */}
            <div className={`absolute inset-x-0 flex items-center justify-center z-10 ${premium ? "top-[34%]" : "inset-y-0"}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect();
                  if (project.videoUrl) onPlay?.(project);
                }}
                aria-label={project.videoUrl ? `Play "${project.title}"` : `Bring "${project.title}" to focus`}
                className={`interactive relative w-14 h-14 rounded-full backdrop-blur flex items-center justify-center shadow-lg opacity-90 scale-100 ${premium ? "w-16 h-16 bg-white/15 border border-[#f3d9a0]/70 hover:bg-white/25 group-hover:scale-110" : "bg-white/90"} ${isActive ? "md:opacity-100 md:scale-100" : "md:opacity-0 md:group-hover:opacity-100 md:scale-90 md:group-hover:scale-100"} transition-all duration-400 focus-visible:opacity-100 focus-visible:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40`}
              >
                {premium && (
                  <span aria-hidden="true" className="absolute inset-0 rounded-full border border-[#f3d9a0]/60 animate-ping opacity-40 motion-reduce:hidden" />
                )}
                {project.videoUrl ? (
                  <Play className={`w-5 h-5 ml-0.5 ${premium ? "text-[#f7e6bd]" : "text-primary"}`} fill="currentColor" aria-hidden="true" />
                ) : (
                  <Eye className={`w-5 h-5 ${premium ? "text-[#f7e6bd]" : "text-primary"}`} aria-hidden="true" />
                )}
              </button>
            </div>

            {premium ? (
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <span aria-hidden="true" className="block h-px w-10 mb-3 bg-gradient-to-r from-[#e2bd78] to-transparent transition-all duration-500 group-hover:w-20" />
                <h4 className="font-serif font-bold text-[1.2rem] sm:text-xl text-white leading-[1.2] text-balance">{project.title}</h4>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-white/80">
                  <p className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#e8c88a]" aria-hidden="true" />
                    <span>{project.location}</span>
                  </p>
                  {project.client && (
                    <p className="flex items-center gap-1.5 min-w-0">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-[#e8c88a]" aria-hidden="true" />
                      <span>{project.client}</span>
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs leading-snug text-white/70 line-clamp-3 sm:line-clamp-2">{project.description}</p>
              </div>
            ) : (
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <h4 className="font-serif font-bold text-xl text-white leading-snug">{project.title}</h4>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/75">
                <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {project.location}
              </p>
              {isActive && (
                <p className="mt-2 text-xs leading-snug text-white/70 line-clamp-2">{project.description}</p>
              )}
            </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

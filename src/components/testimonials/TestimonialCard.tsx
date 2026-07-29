import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { CardVariant, Testimonial } from "@/types/testimonial";
import { ease, cardSpring, tiltSpring } from "@/animations/testimonials.motion";
import AvatarImage from "./AvatarImage";
import StarRating from "./StarRating";
import QuoteIcon from "./QuoteIcon";

type TestimonialCardProps = {
  t: Testimonial;
  variant: CardVariant;
  /** Signed slide distance from the active card; 0 for the featured card. */
  distance?: number;
  index?: number;
};

export default function TestimonialCard({ t, variant, distance = 0, index = 0 }: TestimonialCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isFeatured = variant === "featured";
  const isActive = variant === "active";

  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], isFeatured ? [3, -3] : [5, -5]), tiltSpring);
  const rotateY = useSpring(useTransform(mx, [0, 1], isFeatured ? [-3, 3] : [-5, 5]), tiltSpring);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(${isFeatured ? 520 : 260}px circle at ${x} ${y}, ${t.avatarFrom}2e, transparent 70%)`,
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

  // Carousel visual weight: active card pops forward, side cards recede.
  const weight = 1 - Math.min(Math.abs(distance), 2) / 2;
  const scale = isFeatured ? 1 : isActive ? 1.06 : 0.9 + weight * 0.04;
  const opacity = isFeatured ? 1 : isActive ? 1 : 0.45 + weight * 0.25;
  const elevation = isFeatured ? 1 : isActive ? 1 : 0.5;

  return (
    <motion.div
      className="h-full"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: isFeatured ? 40 : 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: isFeatured ? 0.9 : 0.6, delay: isFeatured ? 0 : index * 0.06, ease }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        animate={{ scale, opacity }}
        transition={cardSpring}
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={!isFeatured && !prefersReducedMotion ? { y: -6 } : undefined}
        className={`group relative h-full interactive cursor-default ${
          isFeatured ? "rounded-[32px] p-[1.5px]" : "rounded-[28px] p-[1px]"
        }`}
      >
        {/* Gradient border */}
        <div
          className={`absolute -inset-[1.5px] opacity-70 group-hover:opacity-100 transition-opacity duration-500 ${
            isFeatured ? "rounded-[32px]" : "rounded-[28px] !inset-0"
          }`}
          style={{
            background: `linear-gradient(135deg, ${t.avatarFrom}${isFeatured ? "70" : "55"}, ${
              isFeatured ? "rgba(255,255,255,0.25) 45%," : "transparent 45%,"
            } ${t.avatarFrom}${isFeatured ? "40" : "25"})`,
          }}
        />

        {/* Ambient blur glow behind the active/featured card only */}
        {(isFeatured || isActive) && (
          <div
            className="absolute -inset-8 rounded-[44px] bg-primary/15 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10"
            style={{ opacity: isActive ? 0.35 * elevation : undefined }}
          />
        )}

        <div
          className={`relative overflow-hidden bg-white/50 backdrop-blur-2xl flex flex-col h-full ${
            isFeatured
              ? "rounded-[31px] p-7 sm:p-10 md:p-12 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_40px_80px_-24px_rgba(15,45,90,0.32)]"
              : `rounded-[27px] p-6 sm:p-7 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_${
                  18 + elevation * 10
                }px_${46 + elevation * 14}px_-20px_rgba(15,45,90,${0.2 + elevation * 0.1})]
                 group-hover:shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_26px_56px_-18px_rgba(15,45,90,0.36)]
                 transition-shadow duration-500`
          }`}
        >
          {/* Mouse-follow glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: glowBg }}
          />
          {/* Inner highlight line */}
          <div className={`absolute top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent ${isFeatured ? "inset-x-8" : "inset-x-6"}`} />

          {isFeatured && (
            <QuoteIcon size={64} color={t.avatarFrom} className="absolute top-6 right-7 sm:top-8 sm:right-10" />
          )}

          <div className="relative flex flex-col flex-1">
            {isFeatured ? (
              <>
                <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4 flex-wrap">
                  <StarRating size="lg" />
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs sm:text-sm font-bold">
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.result}
                  </div>
                </div>

                <p className="font-serif text-xl sm:text-2xl md:text-[1.75rem] leading-snug text-foreground max-w-3xl mb-8 sm:mb-10 text-balance">
                  “{t.content}”
                </p>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/60 mt-auto">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white text-lg sm:text-xl font-black shrink-0 shadow-[0_10px_24px_-8px_rgba(15,45,90,0.4)]"
                      style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
                    >
                      <AvatarImage src={t.avatarImg} alt={t.name} fallback={t.initials} />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-foreground text-base sm:text-lg leading-tight flex items-center gap-1.5">
                        {t.name} <span aria-label={t.country}>{t.flag}</span>
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {t.role} ·{" "}
                        <span className="font-semibold" style={{ color: t.companyColor }}>
                          {t.company}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shrink-0"
                      style={{ backgroundColor: t.companyColor }}
                      aria-label={`${t.company} logo`}
                    >
                      <AvatarImage src={t.companyLogo} alt={`${t.company} logo`} fallback={t.companyShort} />
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white/70 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {t.projectType}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <QuoteIcon size={32} color={t.avatarFrom} float={isActive} />
                  <StarRating />
                </div>

                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">{t.content}</p>

                <div className="h-px bg-white/70 mb-5" />

                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
                  >
                    <AvatarImage src={t.avatarImg} alt={t.name} fallback={t.initials} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm leading-tight flex items-center gap-1.5 truncate">
                      {t.name} <span className="shrink-0">{t.flag}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {t.role} ·{" "}
                      <span className="font-semibold" style={{ color: t.companyColor }}>
                        {t.company}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

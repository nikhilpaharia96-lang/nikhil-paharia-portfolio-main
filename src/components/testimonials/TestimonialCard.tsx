import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { BadgeCheck } from "lucide-react";
import type { CardVariant, Testimonial } from "@/types/testimonial";
import { ease, cardSpring, tiltSpring } from "@/animations/testimonials.motion";
import AvatarImage from "./AvatarImage";
import StarRating from "./StarRating";
import QuoteIcon from "./QuoteIcon";

type TestimonialCardProps = {
  t: Testimonial;
  variant: CardVariant;
  /** Signed slide distance from the active card; 0 for the active card itself. */
  distance?: number;
  index?: number;
};

export default function TestimonialCard({ t, variant, distance = 0, index = 0 }: TestimonialCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isActive = variant === "active";

  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [3, -3]), tiltSpring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-3, 3]), tiltSpring);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(420px circle at ${x} ${y}, rgba(29,111,235,0.12), transparent 70%)`,
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !isActive) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  // Active card is always full-weight and sharp; side cards recede gently
  // the further they sit from center — never heavily blurred, per design spec.
  const weight = 1 - Math.min(Math.abs(distance), 2) / 2; // 1 at distance 0 (unused, isActive branch), 0.5 at ±1, 0 at ±2+
  const scale = isActive ? 1 : 0.92 + weight * 0.03; // ~0.92–0.95
  const opacity = isActive ? 1 : 0.55 + weight * 0.2; // ~0.55–0.75

  return (
    <motion.div
      className="h-full"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        animate={{ scale, opacity }}
        transition={cardSpring}
        style={{
          rotateX: prefersReducedMotion || !isActive ? 0 : rotateX,
          rotateY: prefersReducedMotion || !isActive ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group relative h-full interactive cursor-default rounded-[28px] p-[1px]"
      >
        {/* Thin translucent blue edge — consistent icy-blue identity on every card */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(135deg, rgba(29,111,235,0.38), rgba(255,255,255,0.3) 45%, rgba(29,111,235,0.16))",
          }}
        />

        {/* Soft blue glow behind the active card — slightly stronger than side cards */}
        <div
          className="absolute -inset-6 rounded-[40px] bg-primary/15 blur-3xl -z-10 transition-opacity duration-700"
          style={{ opacity: isActive ? 0.45 : 0.15 }}
          aria-hidden="true"
        />

        <div
          className="relative overflow-hidden bg-white/60 backdrop-blur-2xl flex flex-col h-full rounded-[27px] p-6 sm:p-8"
          style={{
            boxShadow: isActive
              ? "0 1px 0 rgba(255,255,255,0.75) inset, 0 30px 64px -20px rgba(15,45,90,0.32)"
              : "0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 40px -20px rgba(15,45,90,0.18)",
          }}
        >
          {/* Mouse-follow glow — active card only */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: glowBg }}
          />
          <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="relative flex flex-col flex-1">
            <div className="flex items-start justify-between gap-4 mb-6">
              <QuoteIcon size={40} color="#1d6feb" float={isActive} />
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <StarRating />
                  <span className="text-sm font-bold text-foreground">5.0</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 whitespace-nowrap">
                  <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                  Verified Client
                </span>
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg md:text-xl leading-snug text-foreground flex-1 mb-6 text-balance">
              “{t.content}”
            </p>

            <div className="h-px bg-primary/10 mb-5" />

            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
              >
                <AvatarImage src={t.avatarImg} alt={t.name} fallback={t.initials} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm sm:text-base leading-tight flex items-center gap-1.5 truncate">
                  {t.name} <span className="shrink-0">{t.flag}</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                  {t.role} ·{" "}
                  <span className="font-semibold" style={{ color: t.companyColor }}>
                    {t.company}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { playCardPop } from "@/lib/sound";
import "./services-cta.css";

export type ServiceBadge = {
  label: string;
  /** brand colour for the icon / text */
  color: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** image logo (svg/png) */
  logo?: string;
  /** short text mark, e.g. "Ps" — for brands without an icon in react-icons */
  text?: string;
};

export type ServiceItem = {
  /** URL slug of the service's detail page: /services/:slug */
  slug: string;
  title: string;
  desc: string;
  /** 1–2 small icon/logo badges shown at the top of the card */
  badges?: ServiceBadge[];
  /** Optional transparent cut-out illustration, floating below the description (no frame). */
  image?: string;
  price?: string;
};

type CardColor = "blue" | "cream" | "navy" | "sky";
const colorCycle: CardColor[] = ["blue", "cream", "navy", "sky"];

const palette: Record<CardColor, { bg: string; text: string; sub: string; priceBg: string; priceText: string }> = {
  blue: { bg: "bg-primary", text: "text-white", sub: "text-blue-100", priceBg: "bg-white/15", priceText: "text-white" },
  sky: { bg: "bg-sky-500", text: "text-white", sub: "text-sky-50", priceBg: "bg-white/15", priceText: "text-white" },
  navy: { bg: "bg-slate-900", text: "text-white", sub: "text-slate-300", priceBg: "bg-white/10", priceText: "text-white" },
  cream: { bg: "bg-[#fdfaf3]", text: "text-slate-900", sub: "text-slate-500", priceBg: "bg-slate-900/10", priceText: "text-slate-900" },
};

const BASE_TOP_PX = 84; // clears the fixed navbar
const PEEK_PX = 16; // how much of the previous card peeks above the next
const tiltPattern = [-3, 2.5, -2, 3, -2.5, 2, -3, 2.5];

/* ────────────────────────────────────────────────────────────
   One fanned card — sticks in place, tilted, then the next
   card scrolls up and lands on top of it, slightly rotated
   the other way, just like a real hand-fanned deck.
   ──────────────────────────────────────────────────────────── */

function FanDeckCard({ service, index, total }: { service: ServiceItem; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const num = (index + 1).toString().padStart(2, "0");
  const color = colorCycle[index % colorCycle.length];
  const p = palette[color];
  const tilt = tiltPattern[index % tiltPattern.length];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, rm ? 1 : 0.94]);
  const brightness = useTransform(scrollYProgress, [0, 1], [1, rm ? 1 : 0.88]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);
  const isLast = index === total - 1;

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: BASE_TOP_PX + index * PEEK_PX, zIndex: index + 1 }}
    >
      <motion.article
        initial={{ opacity: 0, x: rm ? 0 : index % 2 === 0 ? -90 : 90, y: rm ? 0 : 16, rotate: 0 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: isLast ? 0 : tilt }}
        viewport={{ once: false, margin: "-40px" }}
        onViewportEnter={() => !rm && playCardPop()}
        transition={{ duration: rm ? 0.2 : 0.65, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ rotate: 0, scale: 1.02 }}
        style={{ scale, filter, transformOrigin: "top center" }}
        className={`interactive relative rounded-2xl sm:rounded-3xl border-2 border-black/10 overflow-hidden mb-5
                    shadow-[0_28px_55px_-18px_rgba(15,23,42,0.4)] cursor-default
                    ${p.bg}`}
      >
        {/* huge translucent background number, deck-style */}
        <span
          className={`absolute -right-2 -top-6 text-[110px] sm:text-[130px] font-serif font-black select-none leading-none pointer-events-none ${p.text}`}
          style={{ opacity: 0.08 }}
        >
          {num}
        </span>

        <div className="relative p-6 sm:p-7">
          {service.badges && service.badges.length > 0 && (
            <div className="flex items-center gap-2.5 mb-5">
              {service.badges.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.label}
                    title={b.label}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden"
                  >
                    {b.logo ? (
                      <img src={b.logo} alt={b.label} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md" />
                    ) : Icon ? (
                      <Icon className="text-2xl sm:text-3xl" style={{ color: b.color }} />
                    ) : (
                      <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none" style={{ color: b.color }}>
                        {b.text}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          <h3 className={`font-serif font-black text-xl sm:text-2xl uppercase tracking-tight leading-snug mb-3 ${p.text}`}>
            {service.title}
          </h3>
          <p className={`text-sm sm:text-base leading-relaxed mb-6 ${p.sub}`}>
            {service.desc}
          </p>

          {service.image && (
            <img
              src={service.image}
              alt={`${service.title} illustration`}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="block w-full h-auto mb-5 mt-1 select-none pointer-events-none drop-shadow-[0_14px_26px_rgba(2,6,23,0.35)]"
            />
          )}

          {service.price && (
            <div className={`svc-foot pt-5 border-t ${color === "cream" ? "border-slate-900/10" : "border-white/20"}`}>
              <span className="svc-price" data-tone={color === "cream" ? "dark" : "light"}>
                <span className="svc-price__label">Starting From</span>
                <span className="svc-price__amount">{service.price}</span>
              </span>
              <Link
                href={`/services/${service.slug}`}
                className="svc-book"
                data-tone={color === "navy" ? "on-navy" : undefined}
                aria-label={`Learn more about ${service.title}`}
              >
                Learn More
                <span className="svc-book__arrow" aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={2.6} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   The deck — cards fan out one on top of another as you scroll
   ──────────────────────────────────────────────────────────── */

export default function ServicesMobileStack({ services }: { services: ServiceItem[] }) {
  return (
    <div aria-label="Services" className="relative pt-2">
      {services.map((service, index) => (
        <FanDeckCard key={service.title} service={service} index={index} total={services.length} />
      ))}
    </div>
  );
}

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export type ServiceItem = {
  title: string;
  desc: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  logo?: string;
  color?: string;
  price: string;
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
  const Icon = service.icon;
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
          <div className="flex items-start justify-between mb-5">
            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
              {service.logo ? (
                <img src={service.logo} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-md" />
              ) : Icon ? (
                <Icon className="text-2xl sm:text-3xl" style={{ color: service.color }} />
              ) : null}
            </span>
          </div>

          <h3 className={`font-serif font-black text-xl sm:text-2xl uppercase tracking-tight leading-snug mb-3 ${p.text}`}>
            {service.title}
          </h3>
          <p className={`text-sm sm:text-base leading-relaxed mb-6 ${p.sub}`}>
            {service.desc}
          </p>

          <div className={`flex items-center justify-between pt-5 border-t ${color === "cream" ? "border-slate-900/10" : "border-white/20"}`}>
            <span className={`px-4 py-1.5 rounded-full font-mono text-sm font-bold ${p.priceBg} ${p.priceText}`}>
              {service.price}
            </span>
          </div>
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

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export type ServiceItem = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  tech?: string[];
  features?: string[];
};

const PEEK_PX = 14; // how much of the previous card peeks above the next one
const BASE_TOP_PX = 84; // clears the fixed navbar on mobile

/* ────────────────────────────────────────────────────────────
   One card in the deck — sticks in place, then the next card
   scrolls up and physically lands on top of it. As it gets
   covered, it dips slightly in scale/brightness for depth.
   ──────────────────────────────────────────────────────────── */

function DeckCard({ service, index }: { service: ServiceItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const Icon = service.icon;
  const num = (index + 1).toString().padStart(2, "0");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, rm ? 1 : 0.94]);
  const brightness = useTransform(scrollYProgress, [0, 1], [1, rm ? 1 : 0.88]);
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: BASE_TOP_PX + index * PEEK_PX, zIndex: index + 1 }}
    >
      <motion.article
        style={{ scale, filter, transformOrigin: "top center" }}
        className="relative bg-white border border-blue-100 rounded-2xl sm:rounded-3xl overflow-hidden
                   shadow-[0_30px_60px_-20px_rgba(29,111,235,0.22)] mb-4"
      >
        {/* preview panel — icon + big number */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-sky-500 p-6 sm:p-7">
          <span className="absolute -right-2 -top-4 text-[90px] sm:text-[110px] font-serif font-black text-white/10 select-none leading-none">
            {num}
          </span>
          <div className="relative flex items-center gap-4">
            <span className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Icon className="text-2xl sm:text-3xl text-white" />
            </span>
            <p className="font-serif font-bold text-xl sm:text-2xl text-white leading-snug">
              {service.title}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-6 sm:py-7">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5 font-light">
            {service.desc}
          </p>

          {service.tech && service.tech.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {service.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-mono font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {service.features && service.features.length > 0 && (
            <ul className="space-y-2 mb-6">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-blue-100/70">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-sm font-bold">
              {service.price}
            </span>
            <a
              href="#contact"
              className="interactive w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(29,111,235,0.5)] active:scale-95 transition-transform"
              aria-label={`Get started with ${service.title}`}
            >
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   The deck — cards stack one on top of another as you scroll
   ──────────────────────────────────────────────────────────── */

export default function ServicesMobileStack({ services }: { services: ServiceItem[] }) {
  return (
    <div aria-label="Services" className="relative">
      {services.map((service, index) => (
        <DeckCard key={service.title} service={service} index={index} />
      ))}
    </div>
  );
}

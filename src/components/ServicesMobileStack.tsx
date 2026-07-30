import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight, Check } from "lucide-react";

export type ServiceItem = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  tech?: string[];
  features?: string[];
};

/* ────────────────────────────────────────────────────────────
   One accordion row — collapsed header always visible,
   expanded body mounts/unmounts and drives the height animation
   via the parent's `layout` prop (FLIP, GPU-accelerated).
   ──────────────────────────────────────────────────────────── */

function AccordionCard({
  service,
  index,
  expanded,
  onSelect,
  onKeyNav,
  headerRef,
}: {
  service: ServiceItem;
  index: number;
  expanded: boolean;
  onSelect: () => void;
  onKeyNav: (e: React.KeyboardEvent, index: number) => void;
  headerRef: (el: HTMLButtonElement | null) => void;
}) {
  const rm = useReducedMotion();
  const Icon = service.icon;
  const num = (index + 1).toString().padStart(2, "0");
  const headerId = `service-header-${index}`;
  const panelId = `service-panel-${index}`;

  return (
    <motion.div
      layout
      transition={rm ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
      className={`relative bg-white border rounded-2xl sm:rounded-3xl overflow-hidden transition-colors duration-300 ${
        expanded ? "border-primary/30 shadow-[0_20px_40px_rgba(29,111,235,0.12)]" : "border-blue-100"
      }`}
    >
      {/* header — always visible, this is the scroll-observed element */}
      <button
        ref={headerRef}
        id={headerId}
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onSelect}
        onKeyDown={(e) => onKeyNav(e, index)}
        data-index={index}
        className="interactive w-full flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-2xl sm:rounded-3xl"
      >
        <motion.span
          layout="position"
          className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
            expanded ? "bg-primary text-white" : "bg-gradient-to-br from-primary/10 to-sky-400/10 text-primary"
          }`}
        >
          <Icon className="text-xl sm:text-2xl" />
        </motion.span>

        <span className="flex-1 min-w-0">
          <span className="block text-[10px] font-mono font-bold text-primary/60 tracking-widest mb-0.5">
            {num}
          </span>
          <span
            className={`block font-serif font-bold truncate transition-colors duration-300 ${
              expanded ? "text-primary text-lg sm:text-xl" : "text-foreground text-base sm:text-lg"
            }`}
          >
            {service.title}
          </span>
        </span>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            expanded ? "bg-primary/10 text-primary" : "text-slate-400"
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: rm ? 0.15 : 0.3, ease: "easeOut" }}
            className="px-5 sm:px-6 pb-6 sm:pb-7"
          >
            {/* large preview panel — icon + big number, mirrors the desktop card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-sky-500 p-6 sm:p-7 mb-5">
              <span className="absolute -right-2 -top-4 text-[90px] sm:text-[110px] font-serif font-black text-white/10 select-none leading-none">
                {num}
              </span>
              <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-4">
                <Icon className="text-2xl sm:text-3xl text-white" />
              </span>
              <p className="relative font-serif font-bold text-xl sm:text-2xl text-white leading-snug">
                {service.title}
              </p>
            </div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Stack controller — scrollspy via IntersectionObserver,
   expands whichever header crosses the viewport center
   ──────────────────────────────────────────────────────────── */

export default function ServicesMobileStack({ services }: { services: ServiceItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const manualLockRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualLockRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    headerRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [services.length]);

  const handleSelect = useCallback((index: number) => {
    // briefly lock out the observer so a manual tap doesn't get
    // immediately overridden by a stale intersection event
    manualLockRef.current = true;
    setActiveIndex(index);
    window.setTimeout(() => {
      manualLockRef.current = false;
    }, 700);
  }, []);

  const handleKeyNav = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = e.key === "ArrowDown" ? Math.min(index + 1, services.length - 1) : Math.max(index - 1, 0);
      headerRefs.current[next]?.focus();
      handleSelect(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(index);
    }
  }, [services.length, handleSelect]);

  return (
    <div role="list" aria-label="Services" className="flex flex-col gap-3 sm:gap-4">
      {services.map((service, index) => (
        <div role="listitem" key={service.title}>
          <AccordionCard
            service={service}
            index={index}
            expanded={activeIndex === index}
            onSelect={() => handleSelect(index)}
            onKeyNav={handleKeyNav}
            headerRef={(el) => (headerRefs.current[index] = el)}
          />
        </div>
      ))}
    </div>
  );
}

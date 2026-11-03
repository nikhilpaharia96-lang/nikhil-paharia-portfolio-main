import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LayoutGrid, Mountain, FileText, ShoppingBag, Camera, Clapperboard, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VideoFilter } from "@/types/video";
import { filters, projects } from "@/constants/videoShowcase";
import { pillSpring } from "@/animations/videoShowcase.motion";

const icons: Record<VideoFilter, LucideIcon> = {
  All: LayoutGrid,
  "Travel Film": Mountain,
  Documentary: FileText,
  Commercial: ShoppingBag,
  "Social Media": Camera,
  Cinematic: Clapperboard,
  Others: MoreHorizontal,
};

const countFor = (filter: VideoFilter) =>
  filter === "All" ? projects.length : projects.filter((p) => p.category === filter).length;

type FilterChipsProps = {
  active: VideoFilter;
  onChange: (filter: VideoFilter) => void;
};

export default function FilterChips({ active, onChange }: FilterChipsProps) {
  const prefersReducedMotion = useReducedMotion();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mounted = useRef(false);

  // Keep the selected chip in view on small screens (horizontal scroll only).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    refs.current[active]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [active, prefersReducedMotion]);

  // Arrow keys / Home / End move between tabs.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = filters.indexOf(active);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % filters.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + filters.length) % filters.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = filters.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(filters[next]);
    refs.current[filters[next]]?.focus();
  };

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label="Filter videos by category"
        onKeyDown={onKeyDown}
        className="flex lg:justify-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0 py-2
                   [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] sm:[mask-image:none]
                   [-webkit-mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] sm:[-webkit-mask-image:none]"
      >
        {filters.map((filter) => {
          const Icon = icons[filter];
          const selected = filter === active;
          const count = countFor(filter);
          return (
            <button
              key={filter}
              ref={(el) => {
                refs.current[filter] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(filter)}
              className={`group relative shrink-0 snap-center inline-flex items-center gap-2 pl-4 pr-3 sm:pl-5 sm:pr-3.5 py-2.5 sm:py-3 rounded-full text-sm sm:text-[15px] font-semibold border transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
                selected
                  ? "text-white border-transparent"
                  : "bg-white/80 backdrop-blur-xl text-slate-700 border-white/90 shadow-[0_8px_20px_-12px_rgba(15,45,90,0.3)] hover:bg-white hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_14px_26px_-12px_rgba(29,111,235,0.35)]"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="filter-pill"
                  transition={prefersReducedMotion ? { duration: 0 } : pillSpring}
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-[#3b8bff] to-primary shadow-[0_14px_28px_-10px_rgba(29,111,235,0.8),inset_0_1px_0_rgba(255,255,255,0.35)]"
                  aria-hidden="true"
                />
              )}
              <Icon className={`relative z-10 w-4 h-4 transition-colors ${selected ? "" : "text-primary/80 group-hover:text-primary"}`} aria-hidden="true" />
              <span className="relative z-10 whitespace-nowrap">{filter}</span>
              <span
                aria-label={`${count} ${count === 1 ? "video" : "videos"}`}
                className={`relative z-10 min-w-[1.4rem] h-[1.4rem] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors ${
                  selected ? "bg-white/25 text-white" : count === 0 ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Quote } from "lucide-react";
import { allTestimonials, testimonialCategories } from "@/constants/testimonials";
import type { TestimonialCategory } from "@/types/testimonial";
import AvatarImage from "./AvatarImage";

type Filter = "All" | TestimonialCategory;

export default function StoriesGrid() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = useMemo(
    () => (filter === "All" ? allTestimonials : allTestimonials.filter((t) => t.category === filter)),
    [filter],
  );

  return (
    <div className="mt-14 sm:mt-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <h3 className="font-sans font-extrabold tracking-tight text-2xl sm:text-3xl text-[#101828]">
          More Stories from <span className="text-primary">Amazing People</span>
        </h3>
        <div
          role="group"
          aria-label="Filter testimonials by category"
          className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 pb-1"
        >
          {testimonialCategories.map((c) => {
            const on = c === filter;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
                  on
                    ? "bg-primary text-white border-primary shadow-[0_10px_24px_-10px_rgba(8,102,255,0.8)]"
                    : "bg-white/70 backdrop-blur text-slate-700 border-white/80 hover:bg-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "testimonial" : "testimonials"}
      </p>

      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {visible.map((t) => (
          <li key={t.id}>
            <article className="group relative h-full flex flex-col overflow-hidden rounded-[22px] p-6 bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_22px_44px_-26px_rgba(15,45,90,0.4)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_28px_54px_-24px_rgba(8,102,255,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <svg
                aria-hidden="true"
                viewBox="0 0 200 120"
                className="absolute -right-4 -top-2 w-44 h-28 text-primary/10 pointer-events-none"
                fill="currentColor"
              >
                <path d="M0 120 L55 40 L85 78 L120 20 L200 120 Z" />
              </svg>
              <Quote className="relative w-7 h-7 text-primary mb-3" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              <blockquote className="relative flex-1 text-[15px] leading-relaxed text-slate-700 mb-5">
                {t.content}
              </blockquote>
              <div className="relative flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
                >
                  <AvatarImage src={t.avatarImg} alt={t.name} fallback={t.initials} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="font-bold text-sm text-slate-900 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {t.role} · <span className="font-semibold text-primary">{t.company}</span>
                  </p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

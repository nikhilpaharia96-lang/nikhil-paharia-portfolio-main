import { useMemo } from "react";
import { allTestimonials } from "@/constants/testimonials";
import type { Testimonial } from "@/types/testimonial";

/**
 * Tilted, endlessly scrolling wall of client-review cards used as the
 * Testimonials section background. Columns drift up/down in opposite
 * directions (pure CSS, GPU transforms only) under a soft white veil so the
 * foreground content stays readable. Uses the site's own testimonials.
 */

const stars = [0, 1, 2, 3, 4];

function ReviewCard({ t }: { t: Testimonial }) {
  return (
    <div className="rb-card">
      <div className="flex items-center gap-2.5">
        <span
          className="grid place-items-center w-7 h-7 rounded-full text-[11px] font-bold shrink-0"
          style={{ background: `${t.companyColor}1f`, color: t.companyColor }}
        >
          {t.initials.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#0b1530] leading-tight truncate">{t.name}</p>
          <div className="flex gap-0.5 mt-0.5" aria-hidden="true">
            {stars.map((s) => (
              <svg key={s} viewBox="0 0 20 20" className="w-3 h-3" fill="#f5b400">
                <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15.1 4.7 18l1.1-6L1.4 7.8l6-.8L10 1.5z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-snug text-slate-700 line-clamp-4">“{t.content}”</p>
      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-slate-500">
        <span>Client Review</span>
        <span className="normal-case tracking-normal font-medium">{t.company}</span>
      </div>
    </div>
  );
}

function Column({ items, dir, speed }: { items: Testimonial[]; dir: "up" | "down"; speed: number }) {
  // Content is rendered twice; translating by -50% loops seamlessly.
  return (
    <div className="rb-col">
      <div className={`rb-track rb-track--${dir}`} style={{ animationDuration: `${speed}s` }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="rb-set" aria-hidden={copy === 1 ? "true" : undefined}>
            {items.map((t, i) => (
              <ReviewCard key={`${copy}-${i}-${t.id}`} t={t} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewsBackdrop() {

  const columns = useMemo(() => {
    const list = allTestimonials;
    // Rotate the list per column so neighbouring columns never show the same card side by side.
    const rotate = (n: number) => [...list.slice(n % list.length), ...list.slice(0, n % list.length)];
    // Repeat so each set is taller than the viewport even with few testimonials.
    const fill = (arr: Testimonial[]) => [...arr, ...arr];
    return [fill(rotate(0)), fill(rotate(2)), fill(rotate(4))];
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#f4f8ff]" aria-hidden="true">
      <div className="rb-stage">
        <div className="rb-grid">
          <Column items={columns[0]} dir="up" speed={55} />
          <Column items={columns[1]} dir="down" speed={65} />
          <Column items={columns[2]} dir="up" speed={60} />
          <div className="hidden lg:block">
            <Column items={columns[1]} dir="down" speed={70} />
          </div>
        </div>
      </div>
      {/* Soft veil + edge fades keep text readable and give the blurred, depth-of-field look */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-white/90" />
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/75 via-white/0 to-transparent" />
      <div className="lg:hidden absolute inset-0 bg-white/45" />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { allTestimonials } from "@/constants/testimonials";
import scenic from "@/assets/images/showcase-bg.webp";
import AvatarImage from "./AvatarImage";
import TestimonialVideoModal from "./TestimonialVideoModal";

const arrow =
  "w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 backdrop-blur border border-white shadow-[0_10px_24px_-10px_rgba(15,45,90,0.45)] flex items-center justify-center text-slate-900 transition hover:bg-white hover:shadow-[0_0_0_4px_rgba(8,102,255,0.16)] active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";

/** Soft blue "99" quote mark, like the design. */
function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 38" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="qm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9db8fb" />
          <stop offset="1" stopColor="#5b8cf5" />
        </linearGradient>
      </defs>
      <g fill="url(#qm-grad)" transform="rotate(180 28 19)">
        <path d="M0 22C0 9 8 2 22 0l2 6c-8 2-11 6-11 10h11v22H0z" />
        <path d="M30 22C30 9 38 2 52 0l2 6c-8 2-11 6-11 10h11v22H30z" />
      </g>
    </svg>
  );
}

export default function FeaturedTestimonial() {
  const [index, setIndex] = useState(() => Math.max(0, allTestimonials.findIndex((x) => x.company === "Travel Assam")));
  const [playing, setPlaying] = useState<string | null>(null);
  const [notice, setNotice] = useState(false);
  const touchX = useRef<number | null>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const count = allTestimonials.length;
  const t = allTestimonials[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  useEffect(() => {
    setNotice(false);
  }, [index]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(false), 2600);
    return () => clearTimeout(id);
  }, [notice]);

  const onPlay = () => (t.videoUrl ? setPlaying(t.videoUrl) : setNotice(true));

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured client testimonial"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      className="focus-visible:outline-none"
    >
      <figure className="relative overflow-hidden rounded-[clamp(1.5rem,6vw,2.25rem)] bg-gradient-to-br from-white/95 via-blue-50/80 to-sky-100/70 backdrop-blur-2xl border border-white shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_40px_80px_-36px_rgba(37,99,235,0.45)] min-[360px]:min-h-[clamp(16rem,64vw,20rem)] lg:min-h-[24rem]">
        <div key={index} className="testi-swap relative z-10 p-[clamp(1rem,5vw,2.75rem)] min-[360px]:w-[58%] lg:w-[60%] flex flex-col min-[360px]:min-h-[inherit]">
          <QuoteMark className="w-[clamp(2.4rem,12vw,5rem)] h-auto mb-[clamp(0.4rem,2vw,1.25rem)]" />
          <blockquote className="flex-1 font-medium text-[#0b1530] leading-[1.42] text-[clamp(0.82rem,3.6vw,1.2rem)] lg:text-[1.55rem]">
            “{t.content}”
          </blockquote>
          <div className="h-px bg-gradient-to-r from-primary/50 to-primary/5 my-[clamp(0.7rem,3vw,1.5rem)]" />
          <figcaption className="flex items-center gap-[clamp(0.5rem,2.4vw,1rem)]">
            <div className="relative shrink-0">
              <div
                className="w-[clamp(2.3rem,11vw,3.75rem)] h-[clamp(2.3rem,11vw,3.75rem)] rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-black ring-[3px] ring-white shadow-[0_8px_20px_-8px_rgba(15,45,90,0.5)]"
                style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
              >
                <AvatarImage src={t.avatarImg} alt={t.name} fallback={t.initials} />
              </div>
              <span aria-hidden="true" className="absolute -bottom-0.5 -left-0.5 w-[28%] h-[28%] rounded-full bg-primary border-2 border-white" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="font-extrabold text-[#0b1530] text-[clamp(0.85rem,3.6vw,1.2rem)]">{t.name}</p>
              <p className="text-[clamp(0.68rem,2.9vw,1rem)] text-slate-500 mt-0.5">
                {t.role} · <span className="font-bold text-primary">{t.company}</span>
              </p>
            </div>
          </figcaption>
        </div>

        {/* Video message panel */}
        <div className="relative h-52 min-[360px]:absolute min-[360px]:inset-y-0 min-[360px]:right-0 min-[360px]:h-auto min-[360px]:w-[50%] lg:w-[52%]">
          <img
            src={t.videoPoster ?? scenic}
            alt=""
            aria-hidden="true"
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
            className="testi-photo absolute inset-0 w-full h-full object-cover object-[18%_30%] pointer-events-none"
          />
          <button
            ref={playRef}
            type="button"
            onClick={onPlay}
            aria-label={t.videoUrl ? `Play video message from ${t.name}` : `Video message from ${t.name} (coming soon)`}
            className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 w-[clamp(2.9rem,14vw,5rem)] h-[clamp(2.9rem,14vw,5rem)] play-btn rounded-full bg-white flex items-center justify-center text-primary shadow-[0_18px_40px_-10px_rgba(15,45,90,0.55)] ring-[6px] ring-white/30 focus-visible:outline-none"
          >
            <Play className="w-[44%] h-[44%] ml-[6%]" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          </button>
          {notice && (
            <p
              role="status"
              className="testi-swap absolute left-1/2 bottom-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-[clamp(0.65rem,2.7vw,0.8rem)] font-semibold text-slate-700 shadow-lg"
            >
              Video message coming soon
            </p>
          )}
        </div>
      </figure>

      <p className="sr-only" role="status" aria-live="polite">
        Testimonial {index + 1} of {count}: {t.name}, {t.company}
      </p>

      <div className="mt-4 flex items-center justify-between min-[360px]:grid min-[360px]:grid-cols-[1fr_auto_1fr]">
        <div className="hidden min-[360px]:block" aria-hidden="true" />
        <div className="flex items-center" role="group" aria-label="Choose testimonial">
          {allTestimonials.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}: ${item.name}`}
              aria-current={i === index}
              className="p-1.5 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              <span
                className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${
                  i === index ? "w-7 bg-primary" : "w-2 bg-slate-400 ring-1 ring-white/80"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 justify-self-end">
          <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className={arrow}>
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className={arrow}>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <TestimonialVideoModal
        url={playing}
        title={t.name}
        caption={`${t.name} · ${t.role}, ${t.company}`}
        poster={t.videoPoster}
        onClose={() => {
          setPlaying(null);
          playRef.current?.focus();
        }}
      />
    </div>
  );
}

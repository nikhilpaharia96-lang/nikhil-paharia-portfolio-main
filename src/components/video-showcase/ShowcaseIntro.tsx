import { Play, Briefcase } from "lucide-react";
import { showcaseStats } from "@/constants/videoShowcase";

type ShowcaseIntroProps = {
  onWatchShowreel: () => void;
};

export default function ShowcaseIntro({ onWatchShowreel }: ShowcaseIntroProps) {
  return (
    <div className="relative">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-primary/25 shadow-[0_8px_24px_-12px_rgba(15,45,90,0.25)] mb-6">
        <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
        <span className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase text-slate-700">
          Cinematography &amp; Video Editing
        </span>
      </div>

      <h2 className="font-sans font-extrabold tracking-tight text-[2.9rem] sm:text-6xl lg:text-[4.2rem] leading-[0.98] text-[#0a0f1e]">
        Visual Stories
        <br />
        That{" "}
        <span className="relative inline-block font-script font-bold italic text-primary text-[1.12em] leading-none -rotate-3 align-baseline">
          Feel Real
          <svg
            aria-hidden="true"
            className="absolute left-0 -bottom-2 w-full h-3 text-primary"
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
            fill="none"
          >
            <path d="M3 8 C 40 2, 110 2, 197 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          <span className="text-primary">.</span>
        </span>
      </h2>

      <p className="mt-7 max-w-md text-base sm:text-[1.05rem] leading-relaxed text-slate-700">
        I create cinematic films, travel videos, documentaries and commercial edits that capture
        emotion, tell stories and leave a lasting impact.
      </p>

      <div className="mt-7 hidden sm:flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onWatchShowreel}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-primary text-white text-sm font-semibold shadow-[0_14px_30px_-10px_rgba(29,111,235,0.7)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          Watch Showreel
        </button>
        <a
          href="#contact"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/75 backdrop-blur-xl border border-white/80 text-sm font-semibold text-slate-800 shadow-[0_10px_26px_-12px_rgba(15,45,90,0.3)] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          <Briefcase className="w-4 h-4 text-primary" aria-hidden="true" />
          Hire for Projects
        </a>
      </div>

      <dl className="mt-8 hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
        {showcaseStats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/80 border border-white/90 flex items-center justify-center shadow-[0_8px_20px_-10px_rgba(15,45,90,0.35)]">
              <Icon className="w-[18px] h-[18px] text-primary" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <dt className="sr-only">{label}</dt>
              <dd className="font-bold text-base text-slate-900">{value}</dd>
              <span aria-hidden="true" className="block text-[10px] text-slate-500">
                {label}
              </span>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

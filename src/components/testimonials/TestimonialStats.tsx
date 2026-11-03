import { Users, Clapperboard, Star, Heart } from "lucide-react";
import { trustStats } from "@/constants/testimonials";

// Icons follow the design (people, clapperboard, star, heart). Numbers and labels
// come from the existing trustStats data — nothing invented.
const icons = [Users, Clapperboard, Star, Heart];

export default function TestimonialStats() {
  return (
    <dl className="grid grid-cols-4 lg:grid-cols-2 gap-x-0 sm:gap-x-4 gap-y-3.5 rounded-[clamp(1rem,4.5vw,1.25rem)] bg-white/55 backdrop-blur-md border border-white/70 px-[clamp(0.3rem,2.2vw,1.25rem)] py-[clamp(0.65rem,3vw,1rem)]">
      {trustStats.slice(0, 4).map(({ value, suffix, label, staticText }, i) => {
        const Icon = icons[i] ?? Star;
        return (
          <div key={label} className="flex flex-col items-center text-center gap-1 px-0.5 min-w-0 border-slate-300/60 max-sm:[&:not(:first-child)]:border-l sm:flex-row sm:text-left sm:gap-[clamp(0.4rem,2vw,0.65rem)] sm:px-0">
            <Icon
              className="w-[clamp(1.15rem,5.8vw,1.9rem)] h-[clamp(1.15rem,5.8vw,1.9rem)] shrink-0 text-[#0866FF]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="min-w-0 leading-none">
              <dd className="order-first whitespace-nowrap font-sans font-extrabold tracking-tight text-[#0b1530] text-[clamp(0.9rem,4.2vw,1.5rem)]">
                {staticText ?? `${value}${suffix ?? ""}`}
              </dd>
              <dt className="mt-1 sm:mt-1.5 text-[clamp(0.58rem,2.55vw,0.75rem)] leading-tight text-slate-500 text-balance">{label}</dt>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

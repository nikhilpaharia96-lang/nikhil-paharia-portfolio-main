import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { trustedBrands } from "@/constants/testimonials";
import { ease } from "@/animations/videoShowcase.motion";

type Brand = (typeof trustedBrands)[number];

// Display names for the strip (the data file keeps raw site names / handles).
const DISPLAY_NAME: Record<string, string> = {
  theoutdoorbackpacke: "The Outdoor Backpacker",
};

/** Logo on a clean white disc (so transparent / dark logos stay readable); coloured initials if it fails. */
function BrandLogo({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false);
  const size = "w-[clamp(2rem,9vw,2.5rem)] h-[clamp(2rem,9vw,2.5rem)]";
  if (failed) {
    return (
      <div
        className={`${size} rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-[0_4px_10px_-4px_rgba(15,45,90,0.45)]`}
        style={{ backgroundColor: brand.color }}
        aria-hidden="true"
      >
        {brand.shortName}
      </div>
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-white ring-1 ring-slate-200 shadow-[0_4px_10px_-4px_rgba(15,45,90,0.35)] flex items-center justify-center overflow-hidden shrink-0`}
      aria-hidden="true"
    >
      <img
        src={brand.logo}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain p-[14%]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function BrandItem({ brand }: { brand: Brand }) {
  const name = DISPLAY_NAME[brand.name] ?? brand.name;
  return (
    <li className="flex items-center gap-2.5 shrink-0 mr-[clamp(0.6rem,2.5vw,1rem)] pl-1.5 pr-[clamp(0.9rem,3.5vw,1.25rem)] py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-[0_6px_16px_-10px_rgba(15,45,90,0.35)]">
      <BrandLogo brand={brand} />
      <span className="font-semibold text-[clamp(0.75rem,3.2vw,0.9rem)] text-slate-800 whitespace-nowrap">{name}</span>
    </li>
  );
}

export default function TrustedByBrands() {
  // Two identical halves (each = list twice, so a half is always wider than the panel)
  // → animating -50% loops with no jump. The second half is hidden from screen readers.
  const half = [...trustedBrands, ...trustedBrands];
  const reduce = !!useReducedMotion();

  return (
    <motion.div variants={{ hidden: {}, show: {} }} initial="hidden" whileInView="show" viewport={{ once: false, margin: "-60px" }}>
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 36 },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.9, ease } },
      }}
      className="mt-[clamp(0.75rem,3.2vw,1.25rem)] lg:mt-10 rounded-[clamp(1rem,4.5vw,1.5rem)] py-[clamp(0.8rem,3.6vw,1.4rem)] bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_44px_-28px_rgba(15,45,90,0.4)]"
    >
      <div className="text-center mb-[clamp(0.7rem,3.2vw,1.1rem)] px-4">
        <h3 className="inline-block relative font-sans font-bold text-[clamp(0.85rem,3.6vw,1.05rem)] text-[#101828]">
          Trusted by People &amp; Brands
          <motion.span
            aria-hidden="true"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-full bg-primary origin-center"
            initial={{ scaleX: reduce ? 1 : 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
          />
        </h3>
      </div>

      <div className="brand-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <div className="brand-marquee-track flex w-max">
          <ul className="flex items-center" aria-label="Clients and organisations I've worked with">
            {half.map((brand, i) => (
              <BrandItem key={`a-${brand.name}-${i}`} brand={brand} />
            ))}
          </ul>
          <ul className="flex items-center" aria-hidden="true">
            {half.map((brand, i) => (
              <BrandItem key={`b-${brand.name}-${i}`} brand={brand} />
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
    </motion.div>
  );
}

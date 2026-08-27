import { motion, useReducedMotion } from "framer-motion";
import { trustedBrands } from "@/constants/testimonials";
import AvatarImage from "./AvatarImage";

function BrandLogo({ brand }: { brand: (typeof trustedBrands)[number] }) {
  return (
    <div className="flex items-center gap-2.5 shrink-0 px-5 sm:px-7">
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shrink-0 shadow-[0_6px_16px_-6px_rgba(15,45,90,0.35)]"
        style={{ backgroundColor: brand.color }}
        aria-hidden="true"
      >
        <AvatarImage src={brand.logo} alt="" fallback={brand.shortName} />
      </div>
      <span className="font-semibold text-sm sm:text-base text-foreground whitespace-nowrap">
        {brand.name}
      </span>
    </div>
  );
}

export default function TrustedByBrands() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 rounded-3xl py-7 sm:py-9
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]"
    >
      <div className="text-center mb-6 sm:mb-8 px-6">
        <h3 className="inline-block font-serif font-bold text-lg sm:text-xl text-foreground relative">
          Trusted by People &amp; Brands
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary" />
        </h3>
      </div>

      {/* Infinite marquee: track is the brand list duplicated once, so
          translating exactly -50% loops seamlessly forever. */}
      <div
        className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]
                   [-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      >
        <div
          className={`flex w-max items-center divide-x divide-slate-300/50 ${
            prefersReducedMotion ? "" : "animate-brands-marquee hover:[animation-play-state:paused]"
          }`}
        >
          {[...trustedBrands, ...trustedBrands].map((brand, i) => (
            <BrandLogo key={`${brand.name}-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      <p className="text-center text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8 px-6">
        Working with amazing people and growing together. ♡
      </p>
    </motion.div>
  );
}

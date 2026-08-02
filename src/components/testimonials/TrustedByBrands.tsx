import { motion, useReducedMotion } from "framer-motion";
import { trustedBrands } from "@/constants/testimonials";

export default function TrustedByBrands() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 rounded-3xl p-6 sm:p-8
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="inline-block font-serif font-bold text-lg sm:text-xl text-foreground relative">
          Trusted by People &amp; Brands
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-primary" />
        </h3>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-5 sm:gap-x-3">
        {trustedBrands.map((brand, i) => {
          const Icon = brand.icon;
          return (
            <div key={brand.label} className="flex items-center">
              <div className="flex items-center gap-2 px-3 sm:px-4">
                <Icon className="w-5 h-5 shrink-0" style={{ color: brand.color }} aria-hidden="true" />
                <span className="font-semibold text-sm sm:text-base text-foreground whitespace-nowrap">
                  {brand.label}
                </span>
              </div>
              {i < trustedBrands.length - 1 && (
                <span className="hidden sm:block w-px h-5 bg-slate-300/70 ml-2 sm:ml-3" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

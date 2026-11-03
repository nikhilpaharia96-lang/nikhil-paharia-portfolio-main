import { trustedBrands } from "@/constants/testimonials";
import AvatarImage from "./AvatarImage";

type Brand = (typeof trustedBrands)[number];

function BrandItem({ brand }: { brand: Brand }) {
  return (
    <li className="flex items-center gap-2 shrink-0 px-[clamp(0.9rem,4vw,1.75rem)] border-l border-slate-300/60">
      <div
        className="w-[clamp(1.8rem,8vw,2.3rem)] h-[clamp(1.8rem,8vw,2.3rem)] rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-[0_4px_10px_-4px_rgba(15,45,90,0.4)]"
        style={{ backgroundColor: brand.color }}
        aria-hidden="true"
      >
        <AvatarImage src={brand.logo} alt="" fallback={brand.shortName} />
      </div>
      <span className="font-semibold text-[clamp(0.72rem,3vw,0.875rem)] text-slate-800 whitespace-nowrap">{brand.name}</span>
    </li>
  );
}

export default function TrustedByBrands() {
  // Two identical halves (each = list twice, so a half is always wider than the panel)
  // → animating -50% loops with no jump. The second half is hidden from screen readers.
  const half = [...trustedBrands, ...trustedBrands];

  return (
    <div className="mt-[clamp(0.75rem,3.2vw,1.25rem)] lg:mt-10 rounded-[clamp(1rem,4.5vw,1.5rem)] py-[clamp(0.8rem,3.6vw,1.4rem)] bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_44px_-28px_rgba(15,45,90,0.4)]">
      <div className="text-center mb-[clamp(0.7rem,3.2vw,1.1rem)] px-4">
        <h3 className="inline-block relative font-sans font-bold text-[clamp(0.85rem,3.6vw,1.05rem)] text-[#101828]">
          Trusted by People &amp; Brands
          <span aria-hidden="true" className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-full bg-primary" />
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
    </div>
  );
}

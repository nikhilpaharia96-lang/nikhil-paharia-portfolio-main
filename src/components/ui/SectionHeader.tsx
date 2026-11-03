import type { ReactNode } from "react";

/** Shared look for every section heading: numbered chip, tilted ink title block, handwritten subtitle. */
export const FONT_TITLE = "'Caveat', cursive";
export const FONT_NOTE = "'Kalam', cursive";
export const FONT_CONDENSED = "'Anton', 'Impact', sans-serif";
export const FONT_BODY = "'DM Sans', 'Inter', sans-serif";
export const INK = "#050d2b";
export const HARD_SHADOW = `10px 10px 0 ${INK}`;

export default function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
  className = "",
}: {
  label: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border-2 mb-6"
        style={{ borderColor: INK, color: "#0b35e8", background: "#fff", fontFamily: FONT_BODY }}
      >
        {label}
      </div>

      <h2 className={`relative block ${center ? "mx-auto" : ""} w-fit mb-4`}>
        <span
          className="absolute inset-0 -m-4 sm:-m-5 rounded-2xl"
          style={{ background: INK, transform: "rotate(-2deg)", boxShadow: "0 18px 38px -12px rgba(5,13,43,0.55)" }}
        />
        <span
          className="relative inline-block text-6xl sm:text-7xl md:text-8xl font-bold text-white px-2"
          style={{ fontFamily: FONT_TITLE, transform: "rotate(-1.5deg)" }}
        >
          {title}
        </span>
      </h2>

      {subtitle && (
        <p
          className={`mt-5 text-white/85 text-base sm:text-lg leading-relaxed max-w-md ${center ? "mx-auto" : ""}`}
          style={{ fontFamily: FONT_NOTE }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

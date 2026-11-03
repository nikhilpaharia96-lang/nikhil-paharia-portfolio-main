import bg from "@/assets/images/showcase-bg.webp";

/**
 * Scenic backdrop: real photo (sky, snow peaks, forest, sunrise), softly blurred
 * under a light blue-white veil so cards and text stay readable. No particles or motion.
 */
export default function BackgroundGlow() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <img
        src={bg}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover object-[62%_center] scale-105 blur-[2px] lg:blur-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/45" />
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent" />
    </div>
  );
}

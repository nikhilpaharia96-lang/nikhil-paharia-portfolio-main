import { useEffect, useRef, useState } from "react";
import bgVideoDesktop from "../assets/videos/loading-bg-desktop.mp4";
import bgVideoMobile from "../assets/videos/loading-bg-mobile.mp4";

export default function LoadingScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const [reducedMotion] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Skip the cinematic video intro entirely for users who prefer reduced
    // motion — respect the preference instead of forcing an autoplaying clip.
    const fallbackDelay = reducedMotion ? 300 : 6400;
    const fallback = setTimeout(() => finish(), fallbackDelay);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const finish = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transition = "opacity 0.4s ease";
    containerRef.current.style.opacity = "0";
    setTimeout(() => setDone(true), 400);
  };

  if (done) return null;

  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[10000] overflow-hidden bg-[#0b0806] flex items-center justify-center"
      >
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
      </div>
    );
  }

  // Only mount the video that will actually be shown — mounting both wastes
  // bandwidth on mobile since a hidden <video> with a src still preloads.
  const src = isMobile ? bgVideoMobile : bgVideoDesktop;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[10000] overflow-hidden bg-[#0b0806]">
      <video
        key={src}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
      />
    </div>
  );
}

import * as React from "react";
import { useMusic } from "@/lib/MusicProvider";

/**
 * Music mute/volume control, living inline inside the Navbar in the exact
 * slot the old "Hire Me" button used to occupy — same sizing rhythm on
 * desktop, mobile top bar, and the full-screen mobile menu.
 *
 * Music itself starts on the visitor's first interaction anywhere on the
 * page (see useBackgroundMusic); this button only mutes/adjusts it
 * afterward, matching the ITom Poland reference site's behavior.
 *
 * Clicking the button toggles a small glassmorphism popup below it holding
 * a drag-able volume slider — the same "click to open a popup with a
 * slider" pattern the original standalone widget used, just repositioned
 * to sit under the Navbar's button slot instead of floating independently.
 *
 * `variant`:
 *  - "desktop": pill-shaped button matching the old Hire Me proportions
 *  - "mobile": compact icon-only button sized to match the hamburger button
 */
export default function MusicToggleButton({
  variant = "desktop",
  size = "default",
}: {
  variant?: "desktop" | "mobile";
  size?: "default" | "large";
}) {
  const { isMuted, volume, setVolume } = useMusic();
  const isEffectivelyOff = isMuted || volume === 0;
  const [showSlider, setShowSlider] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!showSlider) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSlider(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSlider(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showSlider]);

  const slider = (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(e) => setVolume(parseFloat(e.target.value))}
      aria-label="Music volume"
      className="np-audio-slider"
      style={{ ["--np-volume-fill" as string]: `${Math.round(volume * 100)}%` }}
    />
  );

  const popup = showSlider && (
    <div
      className="absolute top-full right-0 mt-2 glass-premium rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-lg z-[220]"
      onClick={(e) => e.stopPropagation()}
    >
      <SoundOffIcon size={14} className="text-slate-400 flex-shrink-0" />
      <div className="w-20 sm:w-24">{slider}</div>
      <SoundOnIcon size={14} className="text-primary flex-shrink-0" />
    </div>
  );

  if (variant === "mobile") {
    return (
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setShowSlider((v) => !v)}
          className="text-primary hover:text-white hover:bg-primary transition-all duration-300 w-10 h-10 flex items-center justify-center bg-blue-50/70 rounded-full border border-primary/40 hover:border-primary hover:shadow-[0_0_16px_rgba(29,111,235,0.35)] relative flex-shrink-0"
          aria-label={isEffectivelyOff ? "Unmute background music" : "Mute background music"}
          aria-pressed={isEffectivelyOff}
          aria-expanded={showSlider}
        >
          {isEffectivelyOff ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
        </button>
        {popup}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setShowSlider((v) => !v)}
        aria-label={isEffectivelyOff ? "Unmute background music" : "Mute background music"}
        aria-pressed={isEffectivelyOff}
        aria-expanded={showSlider}
        className={`border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_24px_rgba(29,111,235,0.4)] hover:scale-[1.03] transition-all duration-300 rounded-full shadow-sm flex items-center gap-2 ${
          showSlider ? "bg-primary text-white shadow-[0_0_24px_rgba(29,111,235,0.4)]" : ""
        } ${size === "large" ? "px-6 py-4 text-lg font-bold" : "px-6 py-2.5 text-xs font-bold"}`}
      >
        {isEffectivelyOff ? (
          <SoundOffIcon size={size === "large" ? 26 : 18} />
        ) : (
          <SoundOnIcon size={size === "large" ? 26 : 18} />
        )}
      </button>
      {popup}
    </div>
  );
}

function SoundOnIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 9a5 5 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 5a9 9 0 0 1 0 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SoundOffIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

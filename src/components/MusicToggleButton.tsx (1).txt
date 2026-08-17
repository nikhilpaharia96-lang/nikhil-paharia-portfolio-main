import * as React from "react";
import { useMusic } from "@/lib/MusicProvider";

/**
 * Music mute/volume control, designed to live inline inside the Navbar in
 * place of the old "Hire Me" button — same slot, same sizing rhythm as the
 * rest of the nav, on both desktop and mobile.
 *
 * Music itself starts on the visitor's first interaction anywhere on the
 * page (see useBackgroundMusic); this button only mutes/adjusts it
 * afterward, matching the ITom Poland reference site's behavior.
 *
 * `variant`:
 *  - "desktop": pill-shaped, hover-reveals a volume slider (mouse-driven nav)
 *  - "mobile": compact icon-only button sized to match the hamburger button;
 *              tapping it opens a small volume slider popover since there's
 *              no hover on touch devices
 */
export default function MusicToggleButton({
  variant = "desktop",
  size = "default",
}: {
  variant?: "desktop" | "mobile";
  size?: "default" | "large";
}) {
  const { isMuted, volume, toggleMute, setVolume } = useMusic();
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

  if (variant === "mobile") {
    return (
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setShowSlider((v) => !v)}
          className="text-slate-800 hover:text-primary transition-colors w-10 h-10 flex items-center justify-center bg-blue-50/50 rounded-full border border-blue-100/60 relative flex-shrink-0"
          aria-label={isEffectivelyOff ? "Unmute background music" : "Mute background music"}
          aria-pressed={isEffectivelyOff}
          aria-expanded={showSlider}
        >
          {isEffectivelyOff ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
        </button>

        {showSlider && (
          <div className="absolute top-full right-0 mt-2 glass-premium rounded-full px-4 py-2.5 flex items-center gap-2 shadow-lg z-[220]">
            {slider}
            <button
              type="button"
              onClick={toggleMute}
              className="np-mute-btn"
              aria-label={isEffectivelyOff ? "Unmute" : "Mute"}
            >
              {isEffectivelyOff ? <SoundOffIcon size={16} /> : <SoundOnIcon size={16} />}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onClick={() => setShowSlider((v) => !v)}
      className={`np-audio-controls-inline group border border-primary text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(29,111,235,0.3)] hover:scale-[1.03] transition-all duration-300 rounded-full shadow-sm flex items-center gap-2 cursor-pointer ${
        showSlider ? "np-audio-controls-inline--open" : ""
      } ${size === "large" ? "pl-6 pr-3.5 py-4 text-lg font-bold" : "pl-4 pr-2.5 py-2.5 text-xs font-bold"}`}
    >
      <div
        className="np-volume-slider-container-inline"
        style={{ ["--np-slider-width" as string]: size === "large" ? "110px" : "72px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {slider}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        aria-label={isEffectivelyOff ? "Unmute background music" : "Mute background music"}
        aria-pressed={isEffectivelyOff}
        className={`flex items-center justify-center flex-shrink-0 ${
          size === "large" ? "w-7 h-7" : "w-5 h-5"
        }`}
      >
        {isEffectivelyOff ? (
          <SoundOffIcon size={size === "large" ? 26 : 18} />
        ) : (
          <SoundOnIcon size={size === "large" ? 26 : 18} />
        )}
      </button>
    </div>
  );
}

function SoundOnIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" strokeWidth={2.5} />
      <path d="M15 9a5 5 0 0 1 0 6" />
      <path d="M18 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

function SoundOffIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" strokeWidth={2.5} />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

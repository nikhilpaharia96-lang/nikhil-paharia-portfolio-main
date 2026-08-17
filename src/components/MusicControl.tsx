import * as React from "react";
import { useMusic } from "@/lib/MusicProvider";

/**
 * Minimal floating audio control, styled after the ITom Poland portfolio's
 * AudioControls: a small icon button, top-right, with a volume slider that
 * reveals on hover (and on focus, for keyboard users). No card background,
 * no "Sound On/Off" label, no equalizer — just a quiet mute toggle.
 *
 * Music itself starts on the visitor's first interaction anywhere on the
 * page (see useBackgroundMusic); this control only mutes/adjusts it
 * afterward, exactly like the reference site.
 */
export default function MusicControl() {
  const { isMuted, volume, toggleMute, setVolume } = useMusic();
  const isEffectivelyOff = isMuted || volume === 0;

  // Desktop reveals the slider on hover (see .np-audio-controls:hover in
  // index.css). Touch devices have no hover, so a tap on the wrapper toggles
  // the same reveal via this class, matching the reference site's intent
  // ("small floating control on mobile and desktop") without changing the
  // hover-first desktop feel.
  const [touchOpen, setTouchOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!touchOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setTouchOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [touchOpen]);

  return (
    <div
      ref={wrapperRef}
      className={`np-audio-controls fixed z-[190] flex items-center gap-3 ${
        touchOpen ? "np-touch-open" : ""
      }`}
      style={{
        top: "max(env(safe-area-inset-top, 0px), 4.75rem)",
        right: "max(env(safe-area-inset-right, 0px), 0.875rem)",
      }}
    >
      <div className="np-volume-slider-container">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          aria-label="Volume"
          className="np-audio-slider"
          style={{ ["--np-volume-fill" as string]: `${Math.round(volume * 100)}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          toggleMute();
          setTouchOpen((v) => !v);
        }}
        className="np-mute-btn"
        aria-label={isEffectivelyOff ? "Unmute background music" : "Mute background music"}
        aria-pressed={isEffectivelyOff}
      >
        {isEffectivelyOff ? <SoundOffIcon /> : <SoundOnIcon />}
      </button>
    </div>
  );
}

function SoundOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" strokeWidth={2.5} />
      <path d="M15 9a5 5 0 0 1 0 6" />
      <path d="M18 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4V5z" strokeWidth={2.5} />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

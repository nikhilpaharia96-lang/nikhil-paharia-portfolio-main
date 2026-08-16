import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useMusic } from "@/lib/MusicProvider";

/**
 * Small floating music control, pinned top-right on every breakpoint.
 * Sits just under the navbar's own top-right controls (Hire Me / hamburger
 * on mobile, nav links on desktop) so it never overlaps them.
 *
 * Off by default. The very first click is the user's explicit opt-in and is
 * the only moment playback ever starts.
 */
export default function MusicControl() {
  const { isEnabled, volume, status, toggle, setVolume } = useMusic();
  const prefersReducedMotion = useReducedMotion();
  const [showVolume, setShowVolume] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Close the volume popover on outside click / tap, and on Escape.
  React.useEffect(() => {
    if (!showVolume) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowVolume(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowVolume(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showVolume]);

  const isLoading = status === "loading";
  const label = isEnabled ? "Sound On" : "Sound Off";

  return (
    <div
      ref={wrapperRef}
      className="fixed z-[190] flex flex-col items-end gap-2"
      style={{
        top: "max(env(safe-area-inset-top, 0px), 4.75rem)",
        right: "max(env(safe-area-inset-right, 0px), 0.875rem)",
      }}
    >
      {/* Volume popover */}
      <AnimatePresence>
        {showVolume && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-premium flex items-center gap-2.5 rounded-full px-4 py-2.5 shadow-lg"
            role="group"
            aria-label="Music volume"
          >
            <VolumeX size={14} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Music volume"
              className="np-volume-slider w-20 sm:w-24"
              style={{ ["--np-volume-fill" as string]: `${Math.round(volume * 100)}%` }}
            />
            <Volume2 size={14} className="text-primary flex-shrink-0" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main control pill */}
      <div className="glass-premium flex items-center gap-1 rounded-full p-1 shadow-lg">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isEnabled}
          aria-label={isEnabled ? "Turn background music off" : "Turn background music on"}
          className={`relative flex items-center gap-2 rounded-full pl-2.5 pr-3 py-2 sm:pl-3 sm:pr-3.5 transition-all duration-300 ${
            isEnabled
              ? "bg-primary text-white shadow-[0_0_18px_rgba(29,111,235,0.35)]"
              : "text-slate-500 hover:text-primary hover:bg-blue-50/70"
          }`}
        >
          <span className="relative flex items-center justify-center w-4 h-4 flex-shrink-0">
            {isEnabled ? (
              <Equalizer animate={!prefersReducedMotion} loading={isLoading} />
            ) : (
              <MutedIcon />
            )}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
            {label}
          </span>
        </button>

        {/* Volume toggle button (only meaningful once music is on, but always
            reachable so a user can pre-set volume before enabling) */}
        <button
          type="button"
          onClick={() => setShowVolume((v) => !v)}
          aria-label="Toggle volume control"
          aria-expanded={showVolume}
          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors duration-300 ${
            showVolume ? "bg-blue-50 text-primary" : "text-slate-400 hover:text-primary hover:bg-blue-50/70"
          }`}
        >
          <Volume2 size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function MutedIcon() {
  return <VolumeX size={16} strokeWidth={2.25} aria-hidden="true" />;
}

/** Subtle equalizer bars — animate only while actually playing, and only when
 *  the user hasn't asked for reduced motion. */
function Equalizer({ animate, loading }: { animate: boolean; loading: boolean }) {
  const bars = [0, 1, 2];
  return (
    <span className="flex items-end gap-[2px] h-4 w-4" aria-hidden="true">
      {bars.map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-white"
          initial={{ height: 4 }}
          animate={
            animate && !loading
              ? { height: [4, 14, 6, 12, 4] }
              : { height: 6 }
          }
          transition={
            animate && !loading
              ? {
                  duration: 1.1 + i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

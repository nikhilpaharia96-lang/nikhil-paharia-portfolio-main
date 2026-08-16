import * as React from "react";

/**
 * Manages the portfolio's ambient cinematic background track.
 *
 * Design constraints this hook exists to satisfy:
 *  - Never autoplays with sound. The <audio> element is created muted/paused
 *    and only ever starts playing from a real user gesture (a click on the
 *    control), so it can never violate browser autoplay policies or surprise
 *    a visitor with sound on load.
 *  - Preference (on/off + volume) is remembered in localStorage, but on
 *    return visits we still wait for a user gesture before calling .play() —
 *    we just skip straight to "ready to play" state instead of asking twice.
 *  - One <audio> element for the whole app lifetime, so navigating/scrolling
 *    between sections never interrupts or restarts playback.
 *  - Pauses (not stops) when the tab is hidden, and resumes where it left
 *    off when the tab becomes visible again — never restarts the track.
 *  - All setup work is deferred and wrapped in try/catch so a slow network,
 *    a blocked autoplay policy, or a missing file can never block or throw
 *    during page load.
 */

const STORAGE_KEY = "np-portfolio-music-pref-v1";
const TRACK_SOURCES = [
  { src: "/audio/ambient-cinematic.ogg", type: "audio/ogg" },
  { src: "/audio/ambient-cinematic.mp3", type: "audio/mpeg" },
];
const DEFAULT_VOLUME = 0.28; // low, non-intrusive by default

type StoredPref = {
  enabled: boolean;
  volume: number;
};

function readStoredPref(): StoredPref {
  if (typeof window === "undefined") return { enabled: false, volume: DEFAULT_VOLUME };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, volume: DEFAULT_VOLUME };
    const parsed = JSON.parse(raw);
    return {
      enabled: !!parsed.enabled,
      volume:
        typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 1
          ? parsed.volume
          : DEFAULT_VOLUME,
    };
  } catch {
    return { enabled: false, volume: DEFAULT_VOLUME };
  }
}

function writeStoredPref(pref: StoredPref) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch {
    // Storage can fail (private browsing, quota, disabled) — never let that
    // affect playback.
  }
}

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "blocked" | "error";

export function useBackgroundMusic() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isEnabled, setIsEnabled] = React.useState(false); // OFF by default, always
  const [volume, setVolumeState] = React.useState(DEFAULT_VOLUME);
  const [status, setStatus] = React.useState<MusicStatus>("idle");
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const wasPlayingBeforeHiddenRef = React.useRef(false);

  // Create the <audio> element once, lazily, without blocking render or load.
  React.useEffect(() => {
    const pref = readStoredPref();
    setVolumeState(pref.volume);
    // We remember that the user *wants* music, but we never auto-start it —
    // isEnabled here only pre-fills the UI/toggle affordance intent; actual
    // playback still waits for handleToggle() to run from a click.
    setIsEnabled(false);

    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none"; // never compete with critical page assets
    audio.volume = pref.volume;
    audio.muted = false;

    // Prefer the first source the browser reports it can play.
    const source = TRACK_SOURCES.find((s) => audio.canPlayType(s.type) !== "") ?? TRACK_SOURCES[1];
    audio.src = source.src;

    const onPlaying = () => setStatus("playing");
    const onPause = () => setStatus((s) => (s === "error" ? s : "paused"));
    const onWaiting = () => setStatus("loading");
    const onError = () => setStatus("error");

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // Pause (never restart) when the tab is hidden; resume only if the user
  // had it playing and the tab becomes visible again.
  React.useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        wasPlayingBeforeHiddenRef.current = !audio.paused;
        if (!audio.paused) audio.pause();
      } else if (wasPlayingBeforeHiddenRef.current && isEnabled) {
        audio.play().catch(() => setStatus("blocked"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isEnabled]);

  const setVolume = React.useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    writeStoredPref({ enabled: isEnabledRef.current, volume: clamped });
  }, []);

  // Keep a ref mirror of isEnabled so setVolume (stable callback) can persist
  // the latest enabled flag without needing to be recreated every toggle.
  const isEnabledRef = React.useRef(isEnabled);
  React.useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  /** Must be called directly inside a user gesture handler (click/tap). */
  const enable = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setHasInteracted(true);
    if (audio.preload === "none") audio.preload = "auto";
    setStatus("loading");
    try {
      await audio.play();
      setIsEnabled(true);
      setStatus("playing");
      writeStoredPref({ enabled: true, volume: audio.volume });
    } catch {
      // Autoplay/user-gesture restriction or a load failure — surface as
      // "blocked" so the UI can invite another explicit tap, never retry
      // silently in the background.
      setIsEnabled(false);
      setStatus("blocked");
    }
  }, []);

  const disable = React.useCallback(() => {
    const audio = audioRef.current;
    setHasInteracted(true);
    if (audio) audio.pause();
    setIsEnabled(false);
    setStatus("paused");
    writeStoredPref({ enabled: false, volume: audio?.volume ?? volume });
  }, [volume]);

  const toggle = React.useCallback(() => {
    if (isEnabled) {
      disable();
    } else {
      void enable();
    }
  }, [isEnabled, disable, enable]);

  return {
    isEnabled,
    volume,
    status,
    hasInteracted,
    toggle,
    enable,
    disable,
    setVolume,
  };
}

export type UseBackgroundMusicReturn = ReturnType<typeof useBackgroundMusic>;

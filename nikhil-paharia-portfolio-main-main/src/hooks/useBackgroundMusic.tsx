import * as React from "react";

/**
 * Background ambient music, matching the ITom Poland portfolio's model:
 *  - The <audio> element is created and preloaded as soon as the app mounts,
 *    but is never told to .play() at that point — so there is still no
 *    autoplay-with-sound on load.
 *  - Playback actually starts on the user's FIRST interaction anywhere on
 *    the page (click, touch, or keydown) — not specifically the control
 *    itself. This satisfies real browser autoplay policies (which require
 *    a user gesture) while giving the "music just starts as you begin
 *    exploring" feel of the reference site.
 *  - The floating control is mute/unmute + volume only, not a play/pause
 *    switch from a fully-stopped state.
 *  - Mute + volume preferences persist in localStorage.
 *  - Pauses (never restarts) when the tab is hidden, resumes on return if
 *    it was playing.
 */

const STORAGE_KEY_MUTED = "np-portfolio-audio-muted";
const STORAGE_KEY_VOLUME = "np-portfolio-audio-volume";
const TRACK_SOURCES = [
  { src: "/audio/ambient-cinematic.ogg", type: "audio/ogg" },
  { src: "/audio/ambient-cinematic.mp3", type: "audio/mpeg" },
];
const DEFAULT_VOLUME = 0.3; // matches the reference site's "cozy background" level

function readMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_MUTED) === "true";
  } catch {
    return false;
  }
}

function readVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_VOLUME);
    const parsed = raw !== null ? parseFloat(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

function writeMuted(muted: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
  } catch {
    // ignore (private browsing / quota / disabled storage)
  }
}

function writeVolume(volume: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
  } catch {
    // ignore
  }
}

export function useBackgroundMusic() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = React.useRef(false); // has playback ever actually begun this session
  const wasPlayingBeforeHiddenRef = React.useRef(false);

  const [isMuted, setIsMutedState] = React.useState(readMuted);
  const [volume, setVolumeState] = React.useState(readVolume);
  const [hasStarted, setHasStarted] = React.useState(false);

  // Preload the audio element as soon as the app mounts. No .play() call
  // here — this only readies the element so the first interaction can
  // start it instantly, without a network stall.
  React.useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = readVolume();
    audio.muted = readMuted();

    const source = TRACK_SOURCES.find((s) => audio.canPlayType(s.type) !== "") ?? TRACK_SOURCES[1];
    audio.src = source.src;

    const onError = () => {
      // Surface load failures (missing file, bad path, unsupported codec)
      // in the console instead of failing silently -- this is the single
      // most common reason "nothing plays" with no visible error to the
      // visitor.
      // eslint-disable-next-line no-console
      console.error(
        "[background-music] failed to load audio source:",
        audio.currentSrc || audio.src,
        audio.error
      );
    };
    audio.addEventListener("error", onError);

    audio.load();

    audioRef.current = audio;

    return () => {
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  // Start playback on the user's first interaction anywhere on the page.
  // Uses manual add/remove (not { once: true }) so a failed attempt --
  // e.g. the audio element not being ready yet, or the browser rejecting
  // the very first gesture for its own reasons -- doesn't permanently
  // remove the listener. The listener only detaches once playback has
  // actually, successfully begun.
  React.useEffect(() => {
    const start = () => {
      if (hasStartedRef.current) return;

      const audio = audioRef.current;
      if (!audio) return; // not mounted yet -- next interaction will retry

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            hasStartedRef.current = true;
            setHasStarted(true);
            detach();
          })
          .catch((err) => {
            // Browser refused this gesture -- leave listeners attached so
            // the next click/touch/keydown tries again.
            // eslint-disable-next-line no-console
            console.warn("[background-music] play() was rejected, will retry on next interaction:", err);
          });
      } else {
        // Some environments don't return a promise from play(); assume it
        // started if the element isn't paused right after calling it.
        if (!audio.paused) {
          hasStartedRef.current = true;
          setHasStarted(true);
          detach();
        }
      }
    };

    const detach = () => {
      window.removeEventListener("click", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
    };

    window.addEventListener("click", start);
    window.addEventListener("touchstart", start);
    window.addEventListener("keydown", start);

    return detach;
  }, []);

  // Persist + apply mute/volume any time they change.
  React.useEffect(() => {
    writeMuted(isMuted);
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  React.useEffect(() => {
    writeVolume(volume);
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    // Auto-unmute if the user drags the slider up, and resume playback if
    // it had already started but was sitting paused at 0 volume.
    if (volume > 0) {
      if (isMuted) setIsMutedState(false);
      if (hasStartedRef.current && audio.paused) {
        audio.play().catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  // Pause (never restart) when the tab is hidden; resume on return only if
  // it was actually playing before.
  React.useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        wasPlayingBeforeHiddenRef.current = !audio.paused;
        if (!audio.paused) audio.pause();
      } else if (wasPlayingBeforeHiddenRef.current) {
        audio.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const toggleMute = React.useCallback(() => {
    setIsMutedState((prev) => !prev);
  }, []);

  const setVolume = React.useCallback((next: number) => {
    setVolumeState(Math.min(1, Math.max(0, next)));
  }, []);

  return {
    isMuted,
    volume,
    hasStarted,
    toggleMute,
    setVolume,
  };
}

export type UseBackgroundMusicReturn = ReturnType<typeof useBackgroundMusic>;

// Lightweight synthesized UI sound effects using the Web Audio API.
// No external audio files needed — sounds are generated on the fly.

let audioCtx: AudioContext | null = null;
let lastPlay = 0;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * A soft, short "pop" — used as a card/element enters view.
 * Throttled so a fast scroll through many cards doesn't sound like machine-gun fire.
 */
export function playCardPop(volume = 0.1) {
  const now = performance.now();
  if (now - lastPlay < 130) return;
  lastPlay = now;

  const ctx = getCtx();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(700, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.09);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.14);
}

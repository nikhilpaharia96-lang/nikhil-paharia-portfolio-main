import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Single source of truth for the site's smooth-scroll pipeline:
 *
 *   Lenis (owns scroll physics)
 *     -> GSAP ticker (single shared RAF loop, drives lenis.raf)
 *     -> lenis "scroll" event -> ScrollTrigger.update (keeps ScrollTrigger's
 *        cached progress in sync with Lenis's actual position every frame)
 *     -> ScrollTrigger reads window scroll position for everything else
 *        (CinematicSection's Framer Motion useScroll also reads window
 *        scroll directly, so it stays in sync for free — no separate wiring
 *        needed there).
 *
 * Design goals and why each choice is made:
 *
 * 1. Lenis is enabled on every device, desktop and mobile alike. Disabling
 *    it on touch devices (an earlier iteration of this fix) sidesteps
 *    problems instead of solving them, and loses the premium inertia feel
 *    everywhere it matters most. The actual instability Lenis can exhibit
 *    on mobile comes from two narrow, fixable things: (a) its scroll-limit
 *    cache going stale when content grows after late-loading images/video/
 *    fonts, and (b) ScrollTrigger's own independently-cached pixel
 *    positions going stale for the same reason. Both are fixed below by
 *    reconciling dimensions whenever content can plausibly have changed,
 *    rather than by removing smooth scroll.
 *
 * 2. `syncTouch` is left at its default of `false`. This is deliberate, not
 *    an oversight: with `syncTouch: false`, native touch/finger tracking is
 *    untouched — the browser's own compositor moves the page 1:1 with the
 *    finger, so there is zero perceptible input lag on mobile. Lenis only
 *    smooths the *release* (momentum/inertia) and steps in for `wheel`
 *    events. `syncTouch: true` instead makes Lenis simulate touch scrolling
 *    itself (transform-driven), which Lenis's own docs flag as "can be
 *    unstable on iOS < 16" — exactly the kind of device-dependent
 *    flakiness that caused the original bug reports. Native touch physics
 *    can never desync from the real scrollable height the way a simulated
 *    one can, which is what guarantees the page can always reach the
 *    absolute bottom on touch devices.
 *
 * 3. One Lenis instance for the app's lifetime, guarded against React 18
 *    StrictMode's dev-only double-invoke of effects (which would otherwise
 *    create two instances fighting over the same scroll, doubling RAF work
 *    and producing exactly the kind of jitter/lag this is meant to avoid).
 */

let lenis: Lenis | null = null;
let refCount = 0;
let tickerFn: ((time: number) => void) | null = null;
let lenisScrollTriggerHandler: (() => void) | null = null;
let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let reconcileIntervalId: number | null = null;
let pendingListeners: Array<() => void> = [];

function getIsCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
}

/**
 * Keeps Lenis's internal scroll-limit and ScrollTrigger's cached trigger
 * positions from ever going stale relative to the real, current document
 * height. This is what prevents the "stops just short of the footer" class
 * of bug: instead of trusting a one-time height measurement, height is
 * re-checked whenever it plausibly changed, and corrected before the user
 * can notice.
 */
function reconcileDimensions() {
  if (!lenis) return;
  lenis.resize();
  ScrollTrigger.refresh();
}

export interface SmoothScrollOptions {
  /** Scroll animation duration in seconds, used when `lerp` is not set. */
  duration?: number;
  /** Disable smoothing/inertia entirely (prefers-reduced-motion). */
  instant?: boolean;
}

/**
 * Mounts (or reuses) the single app-wide Lenis instance and wires it to
 * GSAP's ticker and ScrollTrigger. Safe to call multiple times — reference
 * counted so StrictMode's mount -> unmount -> mount in dev doesn't spin up
 * duplicate instances or duplicate RAF loops, and safe to call from more
 * than one component if ever needed.
 *
 * Returns a cleanup function; call it in the owning effect's return.
 */
export function startSmoothScroll(options: SmoothScrollOptions = {}): () => void {
  refCount += 1;

  if (!lenis) {
    const { duration = 1.2, instant = false } = options;
    const isCoarsePointer = getIsCoarsePointer();

    lenis = new Lenis({
      // Cinematic, premium feel on desktop; still responsive, never floaty.
      duration: instant ? 0.1 : duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !instant,
      wheelMultiplier: 1,
      // syncTouch stays false (see module docblock) — native touch physics,
      // Lenis only smooths the release. touchMultiplier only affects how
      // Lenis's own wheel-equivalent smoothing interprets touch deltas for
      // that release/inertia phase, not raw finger tracking, so it can be
      // tuned for "subtle inertia" without adding finger-to-paint lag.
      touchMultiplier: isCoarsePointer ? 1 : 1.8,
      // overscroll:true (default) keeps native rubber-banding at the very
      // top/bottom instead of Lenis fighting the browser for it — this is
      // what avoids "rubber-band fighting" on iOS.
      overscroll: true,
      autoResize: true,
    });

    // Make Lenis reachable from anywhere (Navbar anchor links, in-page
    // "scroll to" CTAs) so every programmatic scroll goes through the same
    // engine instead of fighting native scrollIntoView.
    (window as typeof window & { lenis?: Lenis }).lenis = lenis;

    // ── Lenis -> ScrollTrigger sync (the official integration) ──
    // Without this, ScrollTrigger's `onUpdate`/`scrub` callbacks are driven
    // by its own scroll-position sampling, which can read a frame behind
    // Lenis's interpolated position — the visible symptom is
    // animations/parallax that feel a half-beat out of sync with the
    // page under a smooth-scroll library. This line is the fix.
    lenisScrollTriggerHandler = () => ScrollTrigger.update();
    lenis.on("scroll", lenisScrollTriggerHandler);

    // ── Single shared RAF loop ──
    // Lenis's raf is driven by GSAP's ticker instead of its own
    // requestAnimationFrame loop (autoRaf) so Lenis, GSAP tweens, and
    // ScrollTrigger's scrub/pin updates all advance on the exact same
    // frame instead of two independent RAF loops that can drift apart by
    // a frame under load — that drift is what reads as "double scroll" or
    // micro-stutter under a smooth-scroll setup.
    tickerFn = (time: number) => {
      lenis!.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    // Don't let GSAP's ticker try to "catch up" with a burst of frames
    // after the tab was backgrounded/throttled — that catch-up burst is
    // exactly what produces a sudden lurch in scroll-driven animations.
    gsap.ticker.lagSmoothing(0);

    // ── Keep dimensions correct as content changes ──
    // Lenis's own ResizeObserver (autoResize) already reacts to
    // `document.documentElement` growing/shrinking, but ScrollTrigger keeps
    // an entirely separate cache of pixel start/end positions that only
    // this app's own ScrollTrigger.refresh() calls update, so it needs its
    // own reconciliation path even though Lenis's is automatic.
    const onWindowResize = () => reconcileDimensions();
    window.addEventListener("resize", onWindowResize, { passive: true });
    window.addEventListener("orientationchange", onWindowResize, { passive: true });
    pendingListeners.push(() => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("orientationchange", onWindowResize);
    });

    // Fonts loading late reflow text (and therefore section heights) after
    // first paint — reconcile once every font has finished loading.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => reconcileDimensions()).catch(() => {});
    }

    // Any late-loading image/video changes document height as it decodes.
    // A ResizeObserver on <body> catches every one of these regardless of
    // which component below caused it, without each component needing its
    // own reconciliation logic.
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => reconcileDimensions());
      resizeObserver.observe(document.body);
    }

    // Belt-and-braces: content that mounts/unmounts without changing size
    // in a way ResizeObserver reports immediately (e.g. a lazy section
    // swapping placeholder -> real content at the same box size, or fonts
    // swapping metrics mid-layout) is caught by watching the DOM itself.
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => reconcileDimensions());
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Final safety net: periodically confirm Lenis's computed scroll limit
    // still matches the real document height, and correct it if not. This
    // is cheap (a couple of property reads most ticks) and is what
    // guarantees "always able to reach the exact bottom" even in the rare
    // case something changed height without tripping any observer above
    // (e.g. a mobile browser's toolbar collapsing mid-scroll changing
    // `window.innerHeight` without a `resize` event firing in time).
    reconcileIntervalId = window.setInterval(() => {
      if (!lenis) return;
      const docHeight = document.documentElement.scrollHeight;
      const viewport = window.innerHeight;
      const currentLimit = lenis.limit ?? 0;
      if (currentLimit + viewport < docHeight - 2) {
        reconcileDimensions();
      }
    }, 800);
  }

  return () => {
    refCount -= 1;
    if (refCount > 0) return;

    if (reconcileIntervalId !== null) {
      window.clearInterval(reconcileIntervalId);
      reconcileIntervalId = null;
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    mutationObserver?.disconnect();
    mutationObserver = null;
    pendingListeners.forEach((remove) => remove());
    pendingListeners = [];

    if (tickerFn) {
      gsap.ticker.remove(tickerFn);
      tickerFn = null;
    }
    if (lenis && lenisScrollTriggerHandler) {
      lenis.off("scroll", lenisScrollTriggerHandler);
      lenisScrollTriggerHandler = null;
    }
    lenis?.destroy();
    lenis = null;
    delete (window as typeof window & { lenis?: Lenis }).lenis;
  };
}

/** Read-only access to the shared instance, e.g. for Navbar's scrollTo(). */
export function getLenis(): Lenis | null {
  return lenis;
}

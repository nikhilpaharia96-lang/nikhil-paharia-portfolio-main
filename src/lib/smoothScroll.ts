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
 *
 * Guarded by `isReconciling` so that if ScrollTrigger.refresh() or
 * lenis.resize() themselves cause a layout/resize notification, the
 * ResizeObserver callback below can't re-enter this function and start a
 * feedback loop.
 *
 * Debounced (250ms) and deferred to requestIdleCallback rather than run
 * synchronously on the calling tick. ScrollTrigger.refresh() recalculates
 * every trigger on the page (every CinematicSection wrapper, About's pinned
 * notebook, etc.) in one synchronous pass — on mobile that's expensive
 * enough to block the main thread for a noticeable moment. Called directly
 * from a resize/observer callback, that block happens *while the user is
 * mid-scroll*, which is what read as scrolling "getting stuck, then
 * resuming a moment later" — the freeze is ScrollTrigger.refresh() running,
 * not the scroll itself failing. Debouncing collapses bursts of triggers
 * (font load + image decode + observer firing close together) into one
 * call, and requestIdleCallback pushes that one call to a moment the main
 * thread isn't already busy with the active scroll gesture.
 */
let isReconciling = false;
let reconcileDebounceId: number | null = null;
let reconcileIdleId: number | null = null;
function reconcileDimensions() {
  if (reconcileDebounceId !== null) window.clearTimeout(reconcileDebounceId);
  reconcileDebounceId = window.setTimeout(() => {
    reconcileDebounceId = null;
    if (!lenis || isReconciling) return;
    isReconciling = true;

    const run = () => {
      if (!lenis) {
        isReconciling = false;
        return;
      }
      lenis.resize();
      ScrollTrigger.refresh();
      // Release the guard on the next frame rather than synchronously, so
      // any resize notification the refresh itself triggers this tick is
      // absorbed instead of re-entering.
      requestAnimationFrame(() => {
        isReconciling = false;
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      reconcileIdleId = window.requestIdleCallback(run, { timeout: 500 });
    } else {
      // Safari has no requestIdleCallback — next tick is the closest
      // equivalent available without adding a polyfill.
      window.setTimeout(run, 0);
    }
  }, 250);
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
    let lastKnownScrollHeight = document.documentElement.scrollHeight;

    lenis = new Lenis({
      // lerp-driven (not duration/easing-driven) to match the reference
      // "iron-man" site's buttery feel: with `lerp` set, Lenis moves the
      // scroll position a constant 10%-of-remaining-distance every frame
      // instead of running a fixed-length eased tween per scroll event.
      // That constant catch-up rate is what gives the slightly-trailing,
      // continuous "butter" feel rather than a snappier per-gesture ease.
      // `duration`/`easing` are harmless to leave set below — Lenis ignores
      // them whenever `lerp` is present — but kept for the `instant`
      // (prefers-reduced-motion) case where lerp is intentionally skipped.
      lerp: instant ? undefined : 0.1,
      duration: instant ? 0.1 : duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !instant,
      wheelMultiplier: 1,
      // syncTouch stays false — native touch physics, Lenis only smooths
      // the release. touchMultiplier only affects how Lenis's own
      // wheel-equivalent smoothing interprets touch deltas for that
      // release/inertia phase, not raw finger tracking, so it can be tuned
      // for "subtle inertia" without adding finger-to-paint lag. 1.1 matches
      // the reference site's value.
      touchMultiplier: isCoarsePointer ? 2 : 1.8,
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

    // Keep dimensions correct as content changes. Guarded so a mobile
    // browser's address-bar-driven resize (which fires `resize` constantly
    // during normal scrolling, without the document's actual content height
    // changing) doesn't trigger a ScrollTrigger.refresh() mid-scroll — see
    // the scrollHeight-only check below and in the interval safety net.
    const onWindowResize = () => {
      if (document.documentElement.scrollHeight !== lastKnownScrollHeight) {
        lastKnownScrollHeight = document.documentElement.scrollHeight;
        reconcileDimensions();
      }
    };
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
    // own reconciliation logic. Guarded by the same scrollHeight check as
    // the resize listener — body can fire this observer on width-only
    // changes (e.g. a child ResizeObserver-driven re-render, like About's
    // notebook width tracking) that don't actually change scroll height,
    // and refreshing ScrollTrigger for those is a wasted mid-scroll
    // recalculation with the same "auto-scroll jump" risk as above.
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        const docHeight = document.documentElement.scrollHeight;
        if (docHeight === lastKnownScrollHeight) return;
        lastKnownScrollHeight = docHeight;
        reconcileDimensions();
      });
      resizeObserver.observe(document.body);
    }

    // NOTE: a MutationObserver watching document.body for reconciliation
    // was deliberately removed here. reconcileDimensions() calls
    // ScrollTrigger.refresh(), which can itself touch layout/DOM — on a
    // childList+subtree observer that creates a feedback loop (mutation ->
    // refresh -> mutation -> ...) that can spin fast enough to hang the
    // main thread on slower mobile devices (symptom: white screen after
    // deploy). The ResizeObserver above plus the interval safety net below
    // already cover every case that mattered without this risk.

    // Final safety net: periodically confirm Lenis's computed scroll limit
    // still matches the real document height, and correct it if not. This
    // is cheap (a couple of property reads most ticks) and is what
    // guarantees "always able to reach the exact bottom" even in the rare
    // case something changed height without tripping any observer above.
    //
    // Deliberately keyed off `document.documentElement.scrollHeight` alone,
    // NOT `window.innerHeight`. On mobile, `innerHeight` changes by itself
    // as the browser's address bar collapses/expands *during* normal
    // scrolling — that's expected and isn't a sign anything is stale. The
    // previous version folded `innerHeight` into the "are we stuck short of
    // the bottom" check, so a toolbar collapsing while scrolling looked
    // identical to "content grew," triggering `ScrollTrigger.refresh()`
    // (and therefore a Lenis position correction) mid-scroll — which is
    // what read as the page silently scrolling up/down on its own on
    // mobile. Comparing only `scrollHeight` against its last known value
    // avoids ever reacting to a toolbar-only resize.
    reconcileIntervalId = window.setInterval(() => {
      if (!lenis) return;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight === lastKnownScrollHeight) return;
      lastKnownScrollHeight = docHeight;
      reconcileDimensions();
    }, 800);
  }

  return () => {
    refCount -= 1;
    if (refCount > 0) return;

    if (reconcileIntervalId !== null) {
      window.clearInterval(reconcileIntervalId);
      reconcileIntervalId = null;
    }
    if (reconcileDebounceId !== null) {
      window.clearTimeout(reconcileDebounceId);
      reconcileDebounceId = null;
    }
    if (reconcileIdleId !== null) {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(reconcileIdleId);
      }
      reconcileIdleId = null;
    }
    isReconciling = false;
    resizeObserver?.disconnect();
    resizeObserver = null;
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

/**
 * Updates duration/smoothing on the already-running instance without
 * touching refCount and without tearing it down. For callers that need to
 * react to a value (like prefers-reduced-motion) changing after the owning
 * effect already called startSmoothScroll — destroying and recreating the
 * whole Lenis + ScrollTrigger pipeline mid-session is what produces a
 * visible "scroll happens 2-3 times" glitch, so this updates it in place.
 * No-op if startSmoothScroll hasn't mounted an instance yet.
 */
export function updateSmoothScrollOptions(options: SmoothScrollOptions): void {
  if (!lenis) return;
  const { duration = 0.4, instant = false } = options;
  lenis.options.duration = instant ? 0.1 : duration;
  lenis.options.smoothWheel = !instant;
  // Keep lerp in sync with the same instant/reduced-motion logic used at
  // construction time (see startSmoothScroll) — otherwise toggling
  // prefers-reduced-motion after mount would leave the old lerp value
  // active and fight with the newly-instant duration.
  lenis.options.lerp = instant ? undefined : 0.1;
}

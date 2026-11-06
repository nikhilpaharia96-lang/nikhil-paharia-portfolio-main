/**
 * Microsoft Clarity integration.
 *
 * - Uses the official Clarity loader (https://learn.microsoft.com/clarity/setup-and-installation/clarity-setup),
 *   written as a typed module instead of an inline <script> so it can be configured through env vars,
 *   initialised exactly once, and kept out of the critical rendering path.
 * - The call queue (`window.clarity`) is installed synchronously, but the network request for the tag
 *   is deferred until the page has finished loading and the browser is idle, so animations and
 *   first paint are unaffected.
 * - Every helper is a safe no-op when Clarity is disabled (dev, previews, Do-Not-Track, ad blockers).
 *
 * Never pass personal data (names, emails, phone numbers, payment details) to any helper here.
 */

const DEFAULT_PROJECT_ID = "z98h3pxnvk";
const DEFAULT_ALLOWED_HOSTS = "nikhilpaharia.online";
const CONSENT_KEY = "np-analytics-consent";
const TAG_SELECTOR = 'script[src^="https://www.clarity.ms/tag/"]';

export type ConsentState = "granted" | "denied";
type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
    __npClarityInit?: boolean;
  }
}

const projectId: string = (import.meta.env.VITE_CLARITY_PROJECT_ID || DEFAULT_PROJECT_ID).trim();

/** Hostnames (and their subdomains) allowed to send data. Keeps localhost / Vercel previews out of the real project. */
function allowedHosts(): string[] {
  return String(import.meta.env.VITE_CLARITY_ALLOWED_HOSTS || DEFAULT_ALLOWED_HOSTS)
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

function hostAllowed(): boolean {
  const host = window.location.hostname.toLowerCase();
  return allowedHosts().some((h) => host === h || host.endsWith(`.${h}`));
}

/** Honour browser-level opt-outs. */
function browserOptedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  return nav.doNotTrack === "1" || nav.msDoNotTrack === "1" || (window as { doNotTrack?: string }).doNotTrack === "1" || nav.globalPrivacyControl === true;
}

/**
 * Shared gate for every analytics feature (Clarity + visit notifications): production build (or explicitly
 * forced on for local testing), an allowed hostname, and no browser-level opt-out (Do Not Track / GPC).
 */
export function trackingEligible(): boolean {
  if (typeof window === "undefined") return false;
  if (!import.meta.env.PROD && import.meta.env.VITE_CLARITY_ENABLED !== "true") return false;
  return hostAllowed() && !browserOptedOut();
}

export function isAnalyticsEnabled(): boolean {
  if (import.meta.env.VITE_CLARITY_ENABLED === "false") return false;
  return Boolean(projectId) && trackingEligible();
}

/* ───────────────────────── Consent ───────────────────────── */

/**
 * Visitors from the EEA / UK / Switzerland must opt in before Clarity sets cookies.
 * Region is inferred from the browser time zone (deliberately over-inclusive: any European zone is
 * treated as regulated), so no geo-IP lookup or extra request is needed.
 */
export function consentRequired(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return (
      tz.startsWith("Europe/") ||
      ["Atlantic/Reykjavik", "Atlantic/Madeira", "Atlantic/Canary", "Atlantic/Azores", "Atlantic/Faroe", "Arctic/Longyearbyen"].includes(tz)
    );
  } catch {
    return true; // can't tell → be conservative
  }
}

export function getStoredConsent(): ConsentState | null {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(state: ConsentState): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
  applyConsent(state);
  if (state === "denied" && window.clarity) {
    // Withdrawing consent: Clarity also clears its cookies when consent is revoked.
    window.clarity("consent", false);
  }
}

function applyConsent(state: ConsentState): void {
  if (!window.clarity) return;
  window.clarity("consentv2", { ad_Storage: state, analytics_Storage: state });
}

/* ───────────────────────── Loader ───────────────────────── */

function injectTag(): void {
  if (document.querySelector(TAG_SELECTOR)) return; // already on the page (e.g. added manually)
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  const first = document.getElementsByTagName("script")[0];
  if (first?.parentNode) first.parentNode.insertBefore(s, first);
  else document.head.appendChild(s);
}

export function whenIdle(cb: () => void): void {
  const run = () => {
    const ric = (window as Window & { requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(cb, { timeout: 4000 });
    else window.setTimeout(cb, 1500);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

/** Initialise Clarity. Safe to call any number of times — only the first call has an effect. */
export function initAnalytics(): void {
  if (typeof window === "undefined" || window.__npClarityInit) return;
  if (!isAnalyticsEnabled()) return;
  window.__npClarityInit = true;

  // Official snippet queue stub: calls made before the tag arrives are replayed by Clarity.
  if (!window.clarity) {
    const stub: ClarityFn = function (...args: unknown[]) {
      (stub.q = stub.q || []).push(args);
    };
    window.clarity = stub;
  }

  // Consent defaults must be set before the tag loads.
  const stored = getStoredConsent();
  if (stored) applyConsent(stored);
  else if (consentRequired()) applyConsent("denied");

  whenIdle(injectTag);
}

/* ───────────────────────── Tracking helpers ───────────────────────── */

/** Custom event. Names are sanitised; keep them short and free of personal data. */
export function trackEvent(name: string): void {
  if (!window.__npClarityInit || !window.clarity) return;
  try {
    window.clarity("event", name.toLowerCase().replace(/[^a-z0-9_]+/g, "_").slice(0, 60));
  } catch {
    /* analytics must never break the site */
  }
}

/** Custom tag — shows up as a filter in Clarity (e.g. `section=projects`). */
export function setTag(key: string, value: string | string[]): void {
  if (!window.__npClarityInit || !window.clarity) return;
  try {
    window.clarity("set", key, value);
  } catch {
    /* noop */
  }
}

/** Event + tags in one call: tags describe *what/where*, the event is what you count. */
export function track(event: string, tags: Record<string, string | undefined> = {}): void {
  for (const [k, v] of Object.entries(tags)) {
    if (v) setTag(k, v.slice(0, 100));
  }
  trackEvent(event);
}

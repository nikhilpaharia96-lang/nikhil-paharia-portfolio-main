import { consentRequired, getStoredConsent, trackingEligible, whenIdle } from "@/lib/analytics";

/**
 * Sends ONE anonymous "new visitor" ping per browser session to /api/visit, which emails the site owner.
 *
 * What is sent: the page path (no query string/hash), the referrer *hostname*, an optional utm_source/ref tag and
 * the number of touch points (to tell iPads from Macs). Nothing else — the server derives device/browser/OS from the
 * request's User-Agent and an approximate country from the CDN, and never receives or emails an IP address.
 *
 * Skipped when: not production / not an allowed host / Do-Not-Track or GPC / automated browser / the visitor is in a
 * consent-required region and has not accepted / the owner opted out of their own visits (?notify=off).
 * The email credentials and recipient live only on the server (see api/visit.ts).
 */
const SESSION_KEY = "np-visit-notified";
const OWNER_OPT_OUT_KEY = "np-notify-optout";

function safeStorage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function notifyVisit(): void {
  if (!trackingEligible() || import.meta.env.VITE_VISIT_NOTIFY_ENABLED === "false") return;
  if (navigator.webdriver) return;
  if (consentRequired() && getStoredConsent() !== "granted") return;

  const local = safeStorage("local");
  const session = safeStorage("session");

  // Owner switch: visit the site once with ?notify=off to stop emails about your own visits on this browser
  // (?notify=on turns them back on).
  const flag = new URLSearchParams(window.location.search).get("notify");
  if (flag === "off") local?.setItem(OWNER_OPT_OUT_KEY, "1");
  if (flag === "on") local?.removeItem(OWNER_OPT_OUT_KEY);
  if (local?.getItem(OWNER_OPT_OUT_KEY)) return;

  if (session?.getItem(SESSION_KEY)) return; // already notified for this session
  session?.setItem(SESSION_KEY, "1");

  let refHost = "";
  try {
    refHost = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    /* ignore malformed referrers */
  }
  const params = new URLSearchParams(window.location.search);
  const payload = {
    path: window.location.pathname,
    ref: refHost,
    utm: (params.get("utm_source") || params.get("ref") || "").slice(0, 30),
    touch: navigator.maxTouchPoints || 0,
  };

  whenIdle(() => {
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {
      /* a failed notification must never affect the visitor */
    });
  });
}

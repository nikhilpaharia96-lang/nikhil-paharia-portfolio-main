import { sanitizeSource } from "../../shared/booking";

/**
 * Remembers where a visitor came from (utm_* params from your outreach links, or an external referrer)
 * for 30 days, so a lead/booking made later can be attributed to the campaign that brought them.
 * Stored only in this browser's localStorage and sent only when the visitor submits a booking / enquiry.
 */
const KEY = "np_attribution";
const TTL = 30 * 24 * 3600 * 1000;

type Stored = { s: string; t: number; utm: boolean };
const read = (): Stored | null => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as Stored | null;
    return v && typeof v.s === "string" && Date.now() - v.t < TTL ? v : null;
  } catch {
    return null;
  }
};

export function captureAttribution(): void {
  try {
    const q = new URLSearchParams(location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign", "utm_term"].map((k) => q.get(k) || "").filter(Boolean);
    if (utm.length) {
      const s = sanitizeSource(utm.join("/"));
      if (s) localStorage.setItem(KEY, JSON.stringify({ s, t: Date.now(), utm: true }));
      return;
    }
    // No utm: remember an external referrer, but never overwrite a real campaign.
    const existing = read();
    if (existing) return;
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== location.hostname.replace(/^www\./, "")) {
        localStorage.setItem(KEY, JSON.stringify({ s: sanitizeSource(`referral/${host}`), t: Date.now(), utm: false }));
      }
    }
  } catch {
    /* storage blocked / bad referrer — attribution is best effort */
  }
}

export const getSource = (): string => read()?.s ?? "";

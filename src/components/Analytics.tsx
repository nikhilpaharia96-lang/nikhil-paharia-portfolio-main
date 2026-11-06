import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  consentRequired,
  getStoredConsent,
  initAnalytics,
  isAnalyticsEnabled,
  setConsent,
  track,
} from "@/lib/analytics";
import { notifyVisit } from "@/lib/visitNotify";

/* ── Click classification ─────────────────────────────────────────────────────
 * One delegated listener (capture + passive) instead of per-component handlers:
 *   1. Elements opt in explicitly with data-track-event / data-track-label (+ data-track-kind).
 *   2. Otherwise anchors are classified by href: mailto/tel/wa.me → contact, known social hosts → social,
 *      in-page / internal links → navigation.
 * Only fixed, non-personal labels are ever reported (never link text typed by a user, never field values).
 */
const SOCIAL_HOSTS: Record<string, string> = {
  "github.com": "github",
  "linkedin.com": "linkedin",
  "instagram.com": "instagram",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "facebook.com": "facebook",
  "x.com": "x",
  "twitter.com": "x",
  "behance.net": "behance",
  "dribbble.com": "dribbble",
  "t.me": "telegram",
};

function platformFor(host: string): string | undefined {
  const h = host.replace(/^www\./, "");
  const key = Object.keys(SOCIAL_HOSTS).find((d) => h === d || h.endsWith(`.${d}`));
  return key ? SOCIAL_HOSTS[key] : undefined;
}

function locationOf(el: Element): string {
  if (el.closest("footer")) return "footer";
  if (el.closest("header, nav")) return "navbar";
  return el.closest("section[id]")?.id || "page";
}

function handleClick(e: MouseEvent) {
  const target = e.target as Element | null;
  if (!target?.closest) return;

  // 1) Explicit opt-in
  const tagged = target.closest<HTMLElement>("[data-track-event]");
  if (tagged) {
    track(tagged.dataset.trackEvent!, {
      click_label: tagged.dataset.trackLabel,
      click_kind: tagged.dataset.trackKind,
      click_location: locationOf(tagged),
    });
    return;
  }

  // 2) Anchor heuristics
  const a = target.closest<HTMLAnchorElement>("a[href]");
  if (!a) return;
  const raw = a.getAttribute("href") || "";
  const where = locationOf(a);

  if (raw.startsWith("mailto:")) return track("contact_click", { contact_method: "email", click_location: where });
  if (raw.startsWith("tel:")) return track("contact_click", { contact_method: "phone", click_location: where });

  let url: URL;
  try {
    url = new URL(a.href, window.location.href);
  } catch {
    return;
  }

  if (url.hostname === "wa.me" || url.hostname.endsWith("whatsapp.com")) {
    return track("contact_click", { contact_method: "whatsapp", click_location: where });
  }
  const platform = platformFor(url.hostname);
  if (platform) return track("social_click", { social_platform: platform, click_location: where });

  if (url.origin === window.location.origin) {
    if (url.pathname === "/" && url.hash === "#contact") {
      return track("contact_click", { contact_method: "cta_scroll", click_location: where });
    }
    return track("nav_click", { nav_target: url.hash ? url.hash.slice(1) : url.pathname, click_location: where });
  }
}

const DEPTHS = [25, 50, 75, 100] as const;

export default function Analytics() {
  const [path] = useLocation();
  const [showConsent, setShowConsent] = useState(false);
  const firedDepths = useRef<Set<number>>(new Set());

  // One-time setup: Clarity loader, click delegation, consent banner visibility.
  useEffect(() => {
    initAnalytics();
    notifyVisit(); // no-op unless allowed (and, in consent-required regions, accepted)
    if (!isAnalyticsEnabled()) return;
    setShowConsent(consentRequired() && getStoredConsent() === null);
    document.addEventListener("click", handleClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Page views (SPA route changes). Clarity also records URL changes natively; this adds a named event + tag.
  useEffect(() => {
    track("page_view", { page_path: path });
    firedDepths.current = new Set();
  }, [path]);

  // Scroll depth: rAF-throttled passive listener, each milestone fires once per page view.
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const d of DEPTHS) {
        // 100% is treated as "reached the bottom" within a small tolerance.
        if ((d === 100 ? pct >= 98 : pct >= d) && !firedDepths.current.has(d)) {
          firedDepths.current.add(d);
          track(`scroll_depth_${d}`, { scroll_depth: String(d), page_path: window.location.pathname });
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [path]);

  // Section views on the home page: fires once per section per visit, no layout work on scroll.
  useEffect(() => {
    if (!isAnalyticsEnabled() || path !== "/" || !("IntersectionObserver" in window)) return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const id = en.target.id;
          if (en.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            track("section_view", { section: id });
          }
        }
      },
      { threshold: 0.35 },
    );
    // Sections mount in the same commit as the route, but give lazy content a tick.
    const t = window.setTimeout(() => {
      document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
    }, 300);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [path]);

  if (!showConsent) return null;

  const choose = (state: "granted" | "denied") => {
    setConsent(state);
    setShowConsent(false);
    if (state === "granted") notifyVisit();
  };

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[300] border border-white/80 bg-white/95 p-4 text-slate-700 shadow-[0_10px_36px_rgba(30,100,200,0.18)] backdrop-blur"
    >
      <p className="text-xs leading-relaxed">
        This site uses Microsoft Clarity to understand how visitors use it (anonymised session recordings and heatmaps)
        and sends the site owner a simple anonymous visit notice (page, device type, country). Nothing is collected unless
        you accept. Form fields and payment details are never recorded.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="bg-[#1266F1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#0F58D6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

/**
 * Helpers for the visitor-notification email. Pure functions only (no I/O) so they are easy to test.
 *
 * Privacy: nothing in here ever sees, stores or emits a raw IP address. Only coarse, non-identifying
 * attributes are derived: device class, browser, OS, traffic source, country.
 */

export type DeviceType = "Mobile" | "Tablet" | "Desktop";

export interface ParsedUserAgent {
  device: DeviceType;
  browser: string;
  os: string;
}

export interface VisitInfo {
  /** Absolute URL of the visited page (origin + pathname only — never query strings or hashes). */
  url: string;
  source: string;
  referrerHost?: string;
  device: DeviceType;
  browser: string;
  os: string;
  /** Approximate, IP-derived location such as "Assam, India (Guwahati)". Never an address or coordinates. */
  location?: string;
  at: Date;
}

/* ───────────────────────── Bot filtering ───────────────────────── */

const BOT_UA =
  /bot|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|webdriver|lighthouse|pagespeed|gtmetrix|pingdom|uptime|statuscake|monitor|preview|fetch|curl|wget|httpclient|http-client|python|java\/|go-http|okhttp|axios|scrapy|libwww|facebookexternalhit|whatsapp|telegram|discord|slack|skype|embedly|vkshare|yandex|baidu|duckduck|ahrefs|semrush|mj12|dotbot|petalbot|bytespider|gptbot|claude|chatgpt|perplexity|ccbot|amazonbot|applebot|inspectiontool|vercel|netlify|postman|insomnia|node-|undici|axios/i;

export function isBotUserAgent(ua: string | undefined): boolean {
  if (!ua || ua.length < 20 || ua.length > 600) return true; // real browsers send long UAs
  return BOT_UA.test(ua);
}

/* ───────────────────────── User-agent parsing ───────────────────────── */

export function parseUserAgent(ua: string, touchPoints = 0): ParsedUserAgent {
  // OS
  let os = "Unknown";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = touchPoints > 1 ? "iPadOS" : "macOS"; // iPadOS "desktop mode" reports as Mac
  else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/Linux|X11/i.test(ua)) os = "Linux";

  // Browser — order matters: many browsers also contain "Chrome" / "Safari" tokens.
  let browser = "Unknown";
  if (/Instagram/i.test(ua)) browser = "Instagram in-app browser";
  else if (/LinkedInApp/i.test(ua)) browser = "LinkedIn in-app browser";
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) browser = "Facebook in-app browser";
  else if (/EdgA?\/|EdgiOS\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\/|FxiOS\//i.test(ua)) browser = "Firefox";
  else if (/Chrome\/|CriOS\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  // Device class
  let device: DeviceType = "Desktop";
  if (/iPad|Tablet/i.test(ua) || os === "iPadOS" || (/Android/i.test(ua) && !/Mobile/i.test(ua))) device = "Tablet";
  else if (/Mobi|iPhone|iPod|Android/i.test(ua)) device = "Mobile";

  return { device, browser, os };
}

/* ───────────────────────── Traffic source ───────────────────────── */

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)ecosia\.org$/, "Ecosia"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "Facebook"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "X (Twitter)"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)(telegram\.org|t\.me)$/, "Telegram"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)pinterest\./, "Pinterest"],
];

const UTM_NAMES: Record<string, string> = {
  instagram: "Instagram", ig: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", fb: "Facebook",
  twitter: "X (Twitter)", x: "X (Twitter)", youtube: "YouTube", whatsapp: "WhatsApp", telegram: "Telegram",
  google: "Google", github: "GitHub", email: "Email", newsletter: "Email",
};

/** `referrerHost` is a bare hostname (already stripped client-side); `utm` an optional ?utm_source / ?ref value. */
export function classifySource(referrerHost: string | undefined, utm: string | undefined, ownHosts: string[]): string {
  const host = (referrerHost || "").toLowerCase().replace(/^www\./, "");
  if (host) {
    if (ownHosts.some((h) => host === h || host.endsWith(`.${h}`))) return "Internal / Direct";
    const hit = SOURCES.find(([re]) => re.test(host));
    if (hit) return hit[1];
  }
  const tag = (utm || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
  if (tag) return UTM_NAMES[tag] || `Campaign: ${tag}`;
  return host ? `Referral: ${host.slice(0, 60)}` : "Direct / Unknown";
}

export function countryName(code: string | undefined): string | undefined {
  if (!code || !/^[A-Za-z]{2}$/.test(code) || code.toUpperCase() === "XX" || code.toUpperCase() === "T1") return undefined;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) || undefined;
  } catch {
    return undefined;
  }
}

/** ISO 3166-2 subdivision names for the markets that matter most. Other countries fall back to city + country. */
const REGIONS: Record<string, Record<string, string>> = {
  IN: {
    AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar", CH: "Chandigarh",
    CG: "Chhattisgarh", CT: "Chhattisgarh", DH: "Dadra and Nagar Haveli and Daman and Diu", DN: "Dadra and Nagar Haveli and Daman and Diu",
    DD: "Dadra and Nagar Haveli and Daman and Diu", DL: "Delhi", GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
    JK: "Jammu and Kashmir", JH: "Jharkhand", KA: "Karnataka", KL: "Kerala", LA: "Ladakh", LD: "Lakshadweep", MP: "Madhya Pradesh",
    MH: "Maharashtra", MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OD: "Odisha", OR: "Odisha", PY: "Puducherry",
    PB: "Punjab", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TG: "Telangana", TS: "Telangana", TR: "Tripura",
    UP: "Uttar Pradesh", UT: "Uttarakhand", UK: "Uttarakhand", WB: "West Bengal",
  },
  US: {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
    DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
    MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
    PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
    VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  },
};

/**
 * Builds "Assam, India (Guwahati)" from the CDN's coarse geo headers. Every part is optional; returns undefined when
 * not even the country is known. City is IP-derived and can be wrong (mobile carriers and ISPs often route through a
 * hub city), which is why the email labels it "approximate".
 */
export function formatLocation(countryCode?: string, regionCode?: string, cityRaw?: string): string | undefined {
  const country = countryName(countryCode);
  if (!country) return undefined;
  const cc = (countryCode as string).toUpperCase();
  const region = regionCode ? REGIONS[cc]?.[regionCode.toUpperCase()] : undefined;
  let city: string | undefined;
  if (cityRaw) {
    try {
      city = decodeURIComponent(cityRaw);
    } catch {
      city = cityRaw;
    }
    city = city.replace(/[^\p{L}\p{M}\s.'-]/gu, "").trim().slice(0, 60) || undefined;
  }
  const base = region ? `${region}, ${country}` : country;
  return city && city !== region ? `${base} (${city})` : base;
}

/* ───────────────────────── Email ───────────────────────── */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const VISITOR_EMAIL_SUBJECT = "🚀 New Visitor on Your Portfolio!";

export function formatVisitTime(at: Date): string {
  const ist = at.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "medium" });
  return `${ist} IST`;
}

export function buildVisitorEmail(info: VisitInfo, clarityUrl: string): { subject: string; text: string; html: string } {
  const rows: [string, string][] = [
    ["Visited page", info.url],
    ["Traffic source", info.source],
    ["Device", info.device],
    ["Browser", info.browser],
    ["Operating system", info.os],
    ["Location (approx.)", info.location || "Not available"],
    ["Visit time", formatVisitTime(info.at)],
  ];

  const text = [
    "New Portfolio Visitor",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open Microsoft Clarity: ${clarityUrl}`,
    "",
    "Anonymous, approximate analytics only — no IP address, exact location or personal data is included.",
  ].join("\n");

  const rowHtml = rows
    .map(
      ([k, v], i) => `<tr>
        <td style="padding:12px 16px;width:38%;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748b;background:${i % 2 ? "#ffffff" : "#f8fafc"};border-bottom:1px solid #e2e8f0">${esc(k)}</td>
        <td style="padding:12px 16px;font-size:14px;font-weight:600;color:#0f172a;background:${i % 2 ? "#ffffff" : "#f8fafc"};border-bottom:1px solid #e2e8f0;word-break:break-word">${esc(v)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(VISITOR_EMAIL_SUBJECT)}</title></head>
<body style="margin:0;padding:0;background:#eef3fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">Someone just opened your portfolio — ${esc(info.source)}, ${esc(info.device)}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3fb;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #dbe4f3">
        <tr><td style="background:#1266F1;padding:28px 28px 24px;color:#ffffff">
          <div style="font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;opacity:.85">Nikhil Paharia Portfolio</div>
          <div style="margin-top:8px;font-size:26px;font-weight:800;line-height:1.2">🚀 New Portfolio Visitor</div>
          <div style="margin-top:6px;font-size:14px;opacity:.9">Someone just visited your website.</div>
        </td></tr>
        <tr><td style="padding:24px 28px 8px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-bottom:0">${rowHtml}</table>
        </td></tr>
        <tr><td align="center" style="padding:24px 28px 8px">
          <a href="${esc(clarityUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1266F1;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:14px 28px">Open Clarity Dashboard</a>
        </td></tr>
        <tr><td style="padding:20px 28px 28px;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center">
          Anonymous, approximate analytics only. Location is estimated from the network and may be inaccurate.<br>No IP address or personal information is included in this email.<br>
          Sent automatically by your portfolio at nikhilpaharia.online
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject: VISITOR_EMAIL_SUBJECT, text, html };
}

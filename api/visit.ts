import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "node:crypto";
import { checkRateLimit, getClientIp } from "./_lib/rateLimit.js";
import { sendNotificationEmail } from "./_lib/sendEmail.js";
import { claimOnce, incrWindow, releaseClaim } from "./_lib/visitStore.js";
import { buildVisitorEmail, classifySource, formatLocation, isBotUserAgent, parseUserAgent } from "./_lib/visitor.js";

/**
 * POST /api/visit — emails the site owner a short, anonymous "new visitor" notification.
 *
 * Runs only on the server. All secrets (GMAIL_APP_PASSWORD / EMAIL_API_KEY, recipient address,
 * Upstash token) come from environment variables and never reach the browser.
 *
 * Env (all optional unless noted):
 *   VISITOR_NOTIFY_TO            recipient Gmail (falls back to EMAIL_TO, then GMAIL_USER)
 *   VISITOR_NOTIFY_ENABLED       "false" turns the whole feature off
 *   VISITOR_ALLOWED_HOSTS        comma-separated hostnames allowed to call this (default nikhilpaharia.online)
 *   VISITOR_HASH_SALT            random string; salts the dedupe hash
 *   VISITOR_NOTIFY_MAX_PER_HOUR  global cap on emails per hour (default 20)
 *   VISITOR_NOTIFY_DEDUPE_HOURS  one email per unique visitor per N hours (default 24)
 *   CLARITY_PROJECT_ID           for the dashboard button (default z98h3pxnvk)
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN   durable dedupe + cap across instances
 */

const DEFAULT_HOSTS = "nikhilpaharia.online";
const MAX_BODY_BYTES = 2048;
// Per client, per minute — the page only calls this once per session, so this is generous.
const RATE_LIMIT = { limit: 5, windowMs: 60_000 };
// Random per-instance fallback so the hash is never predictable when no salt is configured.
const FALLBACK_SALT = createHash("sha256").update(String(Math.random()) + Date.now()).digest("hex");

const header = (req: VercelRequest, name: string): string | undefined => {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] : v;
};

const allowedHosts = () =>
  (process.env.VISITOR_ALLOWED_HOSTS || DEFAULT_HOSTS).split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

function hostAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return allowedHosts().some((a) => h === a || h.endsWith(`.${a}`));
}

function originAllowed(req: VercelRequest): boolean {
  const origin = header(req, "origin");
  if (!origin) return false; // browsers always send Origin on POST fetches
  try {
    return hostAllowed(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/** Keep only a clean path: no query string, hash, control characters or odd symbols. */
function cleanPath(p: unknown): string {
  const raw = typeof p === "string" ? p : "/";
  const path = raw.split(/[?#]/)[0].replace(/[^\w\-./%~]/g, "").slice(0, 120);
  return path.startsWith("/") ? path : `/${path}`;
}

const cleanHost = (v: unknown): string | undefined =>
  typeof v === "string" && /^[a-z0-9.-]{1,120}$/i.test(v) ? v.toLowerCase() : undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (process.env.VISITOR_NOTIFY_ENABLED === "false") return res.status(204).end();
  if (!originAllowed(req)) return res.status(403).json({ error: "Forbidden" });

  // Everything below is "silent success": bots and duplicates get the same 202 so nothing is leaked.
  const quiet = (notified = false) => res.status(202).json({ ok: true, notified });

  const ua = header(req, "user-agent");
  if (isBotUserAgent(ua)) return quiet();

  const ip = getClientIp(req);
  if (!checkRateLimit(`visit:${ip}`, RATE_LIMIT).allowed) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests." });
  }

  let body: Record<string, unknown>;
  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    if (raw.length > MAX_BODY_BYTES) return res.status(413).json({ error: "Payload too large." });
    body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {};
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const touch = Number(body.touch) || 0;
  const { device, browser, os } = parseUserAgent(ua as string, touch);
  const source = classifySource(cleanHost(body.ref), typeof body.utm === "string" ? body.utm : undefined, allowedHosts());
  const location = formatLocation(header(req, "x-vercel-ip-country"), header(req, "x-vercel-ip-country-region"), header(req, "x-vercel-ip-city"));

  // Duplicate protection: one email per (salted, daily-rotating) visitor hash per window.
  const dedupeHours = Math.max(1, Number(process.env.VISITOR_NOTIFY_DEDUPE_HOURS) || 24);
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.VISITOR_HASH_SALT || FALLBACK_SALT;
  const visitorKey = `visit:${createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 32)}`;
  if (!(await claimOnce(visitorKey, dedupeHours * 3600))) return quiet();

  // Global hourly cap protects the Gmail/Resend quota if a flood slips past the filters.
  const maxPerHour = Math.max(1, Number(process.env.VISITOR_NOTIFY_MAX_PER_HOUR) || 20);
  const hourBucket = new Date().toISOString().slice(0, 13);
  if ((await incrWindow(`visit-cap:${hourBucket}`, 3700)) > maxPerHour) return quiet();

  const host = (header(req, "x-forwarded-host") || header(req, "host") || DEFAULT_HOSTS).split(",")[0].trim();
  const clarityId = (process.env.CLARITY_PROJECT_ID || "z98h3pxnvk").replace(/[^A-Za-z0-9]/g, "");
  const email = buildVisitorEmail(
    { url: `https://${host}${cleanPath(body.path)}`, source, referrerHost: cleanHost(body.ref), device, browser, os, location, at: new Date() },
    `https://clarity.microsoft.com/projects/view/${clarityId}/dashboard`,
  );

  const to = process.env.VISITOR_NOTIFY_TO || process.env.EMAIL_TO || process.env.GMAIL_USER;
  const result = await sendNotificationEmail({ ...email, to });
  if (!result.sent) {
    // Never surface provider details to the browser; let a later visit retry.
    console.error("Visitor notification not sent:", result.error);
    await releaseClaim(visitorKey);
    return quiet(false);
  }
  return quiet(true);
}

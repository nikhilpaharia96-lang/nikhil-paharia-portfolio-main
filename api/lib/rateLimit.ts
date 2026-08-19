/**
 * Best-effort, in-memory, per-IP fixed-window rate limiter.
 *
 * IMPORTANT CAVEAT: Vercel serverless functions are stateless and can run
 * as multiple concurrent instances across regions — this in-memory Map is
 * NOT shared between invocations/instances, so a determined attacker
 * distributing requests across many cold starts can bypass it. This is a
 * cheap first line of defense against naive rapid-fire abuse from a single
 * client, not a substitute for real protection.
 *
 * For durable, correct rate limiting in production, replace this with a
 * shared store — e.g. Upstash Redis + @upstash/ratelimit (both have a
 * generous free tier and official Vercel integration), or enable Vercel's
 * Firewall / Attack Challenge Mode at the platform level.
 */

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

// Periodically forget old buckets so this Map can't grow unbounded across
// a long-lived warm function instance.
const MAX_TRACKED_IPS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    if (buckets.size >= MAX_TRACKED_IPS) {
      buckets.clear();
    }
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP extraction. Vercel sets x-forwarded-for; we take
 * the first (left-most / original client) entry.
 */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return "unknown";
}

/**
 * Dedupe + global cap for visitor notifications.
 *
 * Durable mode: if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, state lives in Upstash Redis
 * (plain REST calls via fetch — no extra dependency), so it is shared across all serverless instances.
 * Fallback: in-memory (per warm instance, best effort — see api/_lib/rateLimit.ts for the caveats).
 *
 * Only an opaque, salted, daily-rotating hash is ever stored (never an IP address or user agent), with a TTL.
 */

const memoryClaims = new Map<string, number>(); // key -> expiry (ms)
const memoryCounters = new Map<string, { n: number; exp: number }>();
const MAX_KEYS = 5000;

const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN;
export const durableStoreConfigured = () => Boolean(redisUrl() && redisToken());

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(redisUrl() as string, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

/** Returns true if this key was NOT claimed before (and claims it for `ttlSeconds`). */
export async function claimOnce(key: string, ttlSeconds: number): Promise<boolean> {
  if (durableStoreConfigured()) {
    try {
      return (await redis(["SET", key, "1", "NX", "EX", ttlSeconds])) === "OK";
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const exp = memoryClaims.get(key);
  if (exp && exp > now) return false;
  if (memoryClaims.size >= MAX_KEYS) memoryClaims.clear();
  memoryClaims.set(key, now + ttlSeconds * 1000);
  return true;
}

/** Undo a claim (used when the email failed to send, so a later visit can retry). */
export async function releaseClaim(key: string): Promise<void> {
  memoryClaims.delete(key);
  if (durableStoreConfigured()) {
    try { await redis(["DEL", key]); } catch { /* ignore */ }
  }
}

/** Increments a windowed counter and returns the new value. */
export async function incrWindow(key: string, ttlSeconds: number): Promise<number> {
  if (durableStoreConfigured()) {
    try {
      const n = Number(await redis(["INCR", key]));
      if (n === 1) await redis(["EXPIRE", key, ttlSeconds]);
      return n;
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const cur = memoryCounters.get(key);
  if (!cur || cur.exp <= now) {
    if (memoryCounters.size >= MAX_KEYS) memoryCounters.clear();
    memoryCounters.set(key, { n: 1, exp: now + ttlSeconds * 1000 });
    return 1;
  }
  cur.n += 1;
  return cur.n;
}

/* ───────────────────────── Visit log (admin panel) ───────────────────────── */

/** An anonymous visit — exactly the fields shown in the notification email. Never an IP or user agent string. */
export interface VisitRecord {
  t: number; // epoch ms
  p: string; // path
  s: string; // traffic source
  d: string; // device
  b: string; // browser
  o: string; // OS
  l?: string; // approximate location
}

export const VISIT_LOG_KEY = "visits:log";
export const VISIT_RETENTION_DAYS = 90;
const VISIT_LOG_MAX = 5000;

/** Append a visit and prune anything older than the retention window. No-op without durable storage. */
export async function logVisit(rec: VisitRecord): Promise<void> {
  if (!durableStoreConfigured()) return;
  try {
    const member = JSON.stringify({ ...rec, id: Math.random().toString(36).slice(2, 8) }); // id keeps members unique
    await redis(["ZADD", VISIT_LOG_KEY, rec.t, member]);
    await redis(["ZREMRANGEBYSCORE", VISIT_LOG_KEY, "-inf", rec.t - VISIT_RETENTION_DAYS * 86_400_000]);
    await redis(["ZREMRANGEBYRANK", VISIT_LOG_KEY, 0, -(VISIT_LOG_MAX + 1)]);
  } catch {
    /* logging must never break the visit flow */
  }
}

/** Newest-first visits since `sinceMs`. Throws if storage fails so the admin UI can show an error. */
export async function readVisits(sinceMs: number, limit = 1500): Promise<VisitRecord[]> {
  if (!durableStoreConfigured()) return [];
  const rows = (await redis(["ZREVRANGEBYSCORE", VISIT_LOG_KEY, "+inf", sinceMs, "LIMIT", 0, limit])) as string[];
  return rows.flatMap((r) => {
    try {
      const { id: _id, ...rec } = JSON.parse(r) as VisitRecord & { id?: string };
      return [rec];
    } catch {
      return [];
    }
  });
}

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

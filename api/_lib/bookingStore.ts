import type { Booking } from "../../shared/booking.js";

/**
 * Persistence for leads / bookings / payment records.
 *
 * Production: Upstash Redis over its REST API (plain fetch — no extra dependency, same service the
 * visitor-alert code already supports). Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 *
 * Layout:
 *   bk:{id}            JSON of the Booking
 *   bk:index           sorted set (score = createdAt ms) of booking ids, for the dashboard list
 *   bk:order:{orderId} → booking id (webhook / verify look a booking up by Razorpay order)
 *   claim:{key}        SET NX markers used for idempotency (one winner per Razorpay payment id)
 *
 * Local dev / tests (no Redis, not on Vercel): an in-memory store. On Vercel with no database
 * configured we REFUSE to run, rather than silently losing bookings in a throwaway instance.
 */

export interface BookingStore {
  save(b: Booking): Promise<void>;
  get(id: string): Promise<Booking | null>;
  getByOrder(orderId: string): Promise<Booking | null>;
  linkOrder(orderId: string, bookingId: string): Promise<void>;
  /** Newest first. */
  list(limit?: number): Promise<Booking[]>;
  /** Atomic "first caller wins". Returns true only for the caller that created the claim. */
  claim(key: string, ttlSeconds: number): Promise<boolean>;
  release(key: string): Promise<void>;
}

export class StoreNotConfiguredError extends Error {
  constructor() {
    super("Booking database is not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).");
  }
}

const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN;

async function cmd(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(redisUrl() as string, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const data = (await res.json().catch(() => ({}))) as { result?: unknown; error?: string };
  if (!res.ok || data.error) throw new Error(`redis ${res.status}${data.error ? `: ${data.error}` : ""}`);
  return data.result;
}

export const redisStore: BookingStore = {
  async save(b) {
    await cmd(["SET", `bk:${b.id}`, JSON.stringify(b)]);
    await cmd(["ZADD", "bk:index", "NX", Date.parse(b.createdAt), b.id]);
  },
  async get(id) {
    const raw = (await cmd(["GET", `bk:${id}`])) as string | null;
    return raw ? (JSON.parse(raw) as Booking) : null;
  },
  async getByOrder(orderId) {
    const id = (await cmd(["GET", `bk:order:${orderId}`])) as string | null;
    return id ? this.get(id) : null;
  },
  async linkOrder(orderId, bookingId) {
    await cmd(["SET", `bk:order:${orderId}`, bookingId]);
  },
  async list(limit = 500) {
    const ids = (await cmd(["ZRANGE", "bk:index", 0, limit - 1, "REV"])) as string[];
    if (!ids?.length) return [];
    const rows = (await cmd(["MGET", ...ids.map((i) => `bk:${i}`)])) as (string | null)[];
    return rows.filter((r): r is string => !!r).map((r) => JSON.parse(r) as Booking);
  },
  async claim(key, ttlSeconds) {
    return (await cmd(["SET", `claim:${key}`, "1", "NX", "EX", ttlSeconds])) === "OK";
  },
  async release(key) {
    await cmd(["DEL", `claim:${key}`]);
  },
};

/** In-memory store: local dev and tests only. */
export function createMemoryStore(): BookingStore {
  const rows = new Map<string, string>();
  const orders = new Map<string, string>();
  const claims = new Map<string, number>();
  return {
    async save(b) {
      rows.set(b.id, JSON.stringify(b));
    },
    async get(id) {
      const raw = rows.get(id);
      return raw ? (JSON.parse(raw) as Booking) : null;
    },
    async getByOrder(orderId) {
      const id = orders.get(orderId);
      return id ? this.get(id) : null;
    },
    async linkOrder(orderId, id) {
      orders.set(orderId, id);
    },
    async list(limit = 500) {
      return [...rows.values()]
        .map((r) => JSON.parse(r) as Booking)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, limit);
    },
    async claim(key, ttlSeconds) {
      const now = Date.now();
      const exp = claims.get(key);
      if (exp && exp > now) return false;
      claims.set(key, now + ttlSeconds * 1000);
      return true;
    },
    async release(key) {
      claims.delete(key);
    },
  };
}

let memory: BookingStore | null = null;
let warned = false;

export function getStore(): BookingStore {
  if (redisUrl() && redisToken()) return redisStore;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new StoreNotConfiguredError();
  if (!warned) {
    warned = true;
    console.warn("[booking] No Upstash Redis configured — using a volatile in-memory store (local dev only).");
  }
  return (memory ??= createMemoryStore());
}

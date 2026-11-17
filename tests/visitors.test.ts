import test from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_PASSWORD = "correct-horse-battery";
process.env.ADMIN_SESSION_SECRET = "s".repeat(40);
process.env.EMAIL_API_KEY = "k";
process.env.VISITOR_NOTIFY_TO = "owner@example.com";
process.env.VISITOR_NOTIFY_MAX_PER_HOUR = "1000";
process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "tok";

// Minimal in-memory Upstash (only the commands the visit log / limiter use) + fake mail provider.
const kv = new Map<string, string>(), counters = new Map<string, number>(), zsets = new Map<string, { score: number; member: string }[]>();
function redis(cmd: (string | number)[]): unknown {
  const [op, key, ...a] = cmd.map(String);
  const z = () => zsets.get(key) ?? (zsets.set(key, []), zsets.get(key)!);
  const bound = (v: string) => (v === "-inf" ? -Infinity : v === "+inf" ? Infinity : Number(v));
  switch (op) {
    case "SET": if (a.includes("NX") && kv.has(key)) return null; kv.set(key, a[0]); return "OK";
    case "DEL": kv.delete(key); return 1;
    case "INCR": counters.set(key, (counters.get(key) ?? 0) + 1); return counters.get(key);
    case "EXPIRE": return 1;
    case "ZADD": z().push({ score: Number(a[0]), member: a[1] }); return 1;
    case "ZREMRANGEBYSCORE": { const [lo, hi] = [bound(a[0]), bound(a[1])]; zsets.set(key, z().filter((e) => e.score < lo || e.score > hi)); return 1; }
    case "ZREMRANGEBYRANK": { const n = z().length, s = Number(a[0]), e = Number(a[1]) < 0 ? n + Number(a[1]) : Number(a[1]); zsets.set(key, [...z()].sort((x, y) => x.score - y.score).filter((_, i) => i < s || i > e)); return 1; }
    case "ZREVRANGEBYSCORE": { const min = bound(a[1]); return [...z()].filter((e) => e.score >= min).sort((x, y) => y.score - x.score).slice(0, Number(a[4])).map((e) => e.member); }
  }
  throw new Error("fake redis: unsupported " + op);
}
globalThis.fetch = (async (url: string, init: { body: string }) =>
  String(url).includes("upstash")
    ? { ok: true, status: 200, json: async () => ({ result: redis(JSON.parse(init.body)) }) }
    : { ok: true, status: 200, json: async () => ({}) }) as unknown as typeof fetch;

const { default: admin } = await import("../api/admin/[action].js");
const { default: visit } = await import("../api/visit.js");
const { VISIT_LOG_KEY } = await import("../api/_lib/visitStore.js");

const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
function run(h: Function, o: { method?: string; action?: string; ip?: string; body?: unknown; cookie?: string; query?: Record<string, string>; headers?: Record<string, string> } = {}) {
  const out: { status: number; body: any; headers: Record<string, string> } = { status: 0, body: null, headers: {} };
  const res: any = { setHeader: (k: string, v: string) => (out.headers[k.toLowerCase()] = v), status(c: number) { out.status = c; return this; }, json(b: unknown) { out.body = b; return this; }, end() { return this; } };
  const req: any = { method: o.method ?? "GET", query: { ...(o.action ? { action: o.action } : {}), ...(o.query ?? {}) }, body: o.body ?? {},
    headers: { host: "site.test", origin: "https://site.test", "x-forwarded-for": o.ip ?? "9.9.9.9", "user-agent": UA, ...(o.cookie ? { cookie: o.cookie } : {}), ...(o.headers ?? {}) } };
  return Promise.resolve(h(req, res)).then(() => out);
}
async function login() {
  const r = await run(admin, { method: "POST", action: "login", body: { password: "correct-horse-battery" }, ip: "7.7.7.7" });
  assert.equal(r.status, 200);
  return r.headers["set-cookie"].split(";")[0];
}
const send = (ip: string, ua: string, path: string) =>
  run(visit, { method: "POST", ip, headers: { origin: "https://www.nikhilpaharia.online", host: "www.nikhilpaharia.online", "user-agent": ua, "x-vercel-ip-country": "IN", "x-vercel-ip-country-region": "AS", "x-vercel-ip-city": "Guwahati" }, body: { path, ref: "l.instagram.com", touch: 5 } });

test("visitors tab API: requires the admin session", async () => {
  assert.equal((await run(admin, { action: "visitors" })).status, 401);
  assert.equal((await run(admin, { action: "visitors", cookie: "np_admin=forged.sig" })).status, 401);
  const cookie = await login();
  const r = await run(admin, { action: "visitors", cookie });
  assert.equal(r.status, 200); assert.equal(r.body.storage, true);
});

test("visits are logged anonymously; /admin is never logged; query strings dropped", async () => {
  const cookie = await login();
  await send("198.51.100.7", UA, "/services/video-editing?token=SECRET");
  await send("198.51.100.8", UA + " v2", "/admin");
  await send("198.51.100.9", UA + " v3", "/");
  const stored = (zsets.get(VISIT_LOG_KEY) ?? []).map((e) => e.member).join("");
  assert.ok(!/198\.51\.100|Mozilla|SECRET|admin/.test(stored), "private data in the visit log");
  assert.ok(stored.includes("Assam, India (Guwahati)") && stored.includes("Instagram"));
  const r = await run(admin, { action: "visitors", cookie, query: { days: "7" } });
  assert.equal(r.body.visits.length, 2);
  assert.deepEqual(Object.keys(r.body.visits[0]).sort(), ["b", "d", "l", "o", "p", "s", "t"]);
});

test("range filter and 90-day retention", async () => {
  const cookie = await login();
  const day = 86_400_000, now = Date.now();
  const old = JSON.stringify({ t: now - 100 * day, p: "/", s: "Direct", d: "Desktop", b: "Chrome", o: "Windows", id: "old" });
  const mid = JSON.stringify({ t: now - 20 * day, p: "/", s: "Google", d: "Desktop", b: "Chrome", o: "Windows", id: "mid" });
  zsets.get(VISIT_LOG_KEY)!.push({ score: now - 100 * day, member: old }, { score: now - 20 * day, member: mid });
  await send("198.51.100.50", UA + " ret", "/"); // a new visit triggers pruning
  assert.ok(!zsets.get(VISIT_LOG_KEY)!.some((e) => e.member === old), "expired record was not pruned");
  assert.equal((await run(admin, { action: "visitors", cookie, query: { days: "7" } })).body.visits.length, 3);
  assert.equal((await run(admin, { action: "visitors", cookie, query: { days: "30" } })).body.visits.length, 4);
});

test("without Upstash the tab reports that storage is not configured", async () => {
  const cookie = await login();
  const url = process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_URL;
  const r = await run(admin, { action: "visitors", cookie });
  assert.equal(r.status, 200); assert.equal(r.body.storage, false); assert.deepEqual(r.body.visits, []);
  process.env.UPSTASH_REDIS_REST_URL = url;
});

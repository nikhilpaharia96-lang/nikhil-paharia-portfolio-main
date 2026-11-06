/**
 * Behavioural tests for api/visit.ts — runs the real handler with a mocked mail provider (no network, no email sent).
 * Run:  npx tsx scripts/test-visit.ts
 */
import assert from "node:assert/strict";

process.env.EMAIL_API_KEY = "test-key";
process.env.VISITOR_NOTIFY_TO = "owner@example.com";
process.env.VISITOR_ALLOWED_HOSTS = "nikhilpaharia.online";
process.env.VISITOR_NOTIFY_MAX_PER_HOUR = "100";
delete process.env.GMAIL_USER;
delete process.env.GMAIL_APP_PASSWORD;
delete process.env.UPSTASH_REDIS_REST_URL;

const sent: { to: string[]; subject: string; html: string; text: string }[] = [];
let providerStatus = 200;
globalThis.fetch = (async (_url: string, init: { body: string }) => {
  if (providerStatus === 200) sent.push(JSON.parse(init.body));
  return { ok: providerStatus === 200, status: providerStatus, json: async () => ({}) };
}) as unknown as typeof fetch;

const { default: handler } = await import("../api/visit.ts");

const ANDROID_CHROME = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const IPHONE_INSTA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.20.99";
const WIN_EDGE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0";

async function call(opts: { method?: string; ip: string; ua?: string; origin?: string | null; body?: unknown; country?: string }) {
  const res = { code: 0, json: undefined as unknown, headers: {} as Record<string, string>,
    setHeader(k: string, v: string) { this.headers[k] = v; return this; },
    status(c: number) { this.code = c; return this; },
    json_(b: unknown) { this.json = b; return this; },
    end() { return this; } } as any;
  res.json = function (b: unknown) { this.body = b; return this; };
  const req: any = {
    method: opts.method ?? "POST",
    headers: {
      "x-forwarded-for": opts.ip, "user-agent": "ua" in opts ? opts.ua : ANDROID_CHROME, host: "www.nikhilpaharia.online",
      ...(opts.origin === null ? {} : { origin: opts.origin ?? "https://www.nikhilpaharia.online" }),
      ...(opts.country ? { "x-vercel-ip-country": opts.country } : {}),
    },
    body: opts.body ?? { path: "/", ref: "", touch: 5 },
  };
  if (req.headers["user-agent"] === undefined) delete req.headers["user-agent"];
  await handler(req, res);
  return res;
}

let n = 0;
const test = async (name: string, fn: () => Promise<void>) => { await fn(); console.log(`  ✓ ${name}`); n++; };

await test("valid visit sends one correctly-formed email", async () => {
  const r = await call({ ip: "203.0.113.10", country: "IN", body: { path: "/services/video-editing?token=SECRET#x", ref: "l.instagram.com", touch: 5 } });
  assert.equal(r.code, 202); assert.equal(r.body.notified, true);
  assert.equal(sent.length, 1);
  const m = sent[0];
  assert.deepEqual(m.to, ["owner@example.com"]);
  assert.equal(m.subject, "🚀 New Visitor on Your Portfolio!");
  for (const s of ["New Portfolio Visitor", "Instagram", "Mobile", "Chrome", "Android", "India", "IST", "clarity.microsoft.com/projects/view/z98h3pxnvk/dashboard", "https://www.nikhilpaharia.online/services/video-editing"])
    assert.ok(m.html.includes(s) || m.text.includes(s), `missing ${s}`);
  assert.ok(!m.html.includes("SECRET") && !m.text.includes("SECRET"), "query string leaked");
  assert.ok(!/203\.0\.113\.10/.test(m.html + m.text), "IP leaked");
});

await test("same visitor again is de-duplicated", async () => {
  const before = sent.length;
  const r = await call({ ip: "203.0.113.10" });
  assert.equal(r.code, 202); assert.equal(r.body.notified, false); assert.equal(sent.length, before);
});

await test("device / browser / OS detection: iPhone Instagram + Windows Edge", async () => {
  await call({ ip: "203.0.113.11", ua: IPHONE_INSTA, country: "US", body: { path: "/", ref: "", utm: "instagram", touch: 5 } });
  await call({ ip: "203.0.113.12", ua: WIN_EDGE, body: { path: "/", ref: "www.google.com", touch: 0 } });
  const a = sent.at(-2)!.text, b = sent.at(-1)!.text;
  assert.match(a, /Device: Mobile/); assert.match(a, /Instagram in-app browser/); assert.match(a, /iOS/); assert.match(a, /Source: Instagram|Traffic source: Instagram/);
  assert.match(b, /Device: Desktop/); assert.match(b, /Edge/); assert.match(b, /Windows/); assert.match(b, /Traffic source: Google/);
});

await test("country omitted when unavailable", async () => {
  await call({ ip: "203.0.113.13", ua: WIN_EDGE + " x", country: "XX" });
  assert.match(sent.at(-1)!.text, /Country: Not available/);
});

await test("bots are filtered silently", async () => {
  const before = sent.length;
  for (const ua of ["Googlebot/2.1 (+http://www.google.com/bot.html)", "curl/8.4.0", "Mozilla/5.0 (Windows NT 10.0) HeadlessChrome/126.0.0.0 Safari/537.36", "WhatsApp/2.23.20.0", undefined as any, "short"]) {
    const r = await call({ ip: "198.51.100." + Math.floor(Math.random() * 200), ua });
    assert.equal(r.code, 202); assert.equal(r.body.notified, false);
  }
  assert.equal(sent.length, before);
});

await test("foreign / missing Origin rejected; wrong method rejected", async () => {
  assert.equal((await call({ ip: "192.0.2.1", origin: "https://evil.example" })).code, 403);
  assert.equal((await call({ ip: "192.0.2.2", origin: null })).code, 403);
  assert.equal((await call({ ip: "192.0.2.3", method: "GET" })).code, 405);
  assert.equal((await call({ ip: "192.0.2.4", origin: "https://nikhilpaharia.online.evil.com" })).code, 403);
});

await test("HTML / script injection in visitor-controlled fields is escaped or dropped", async () => {
  await call({ ip: "192.0.2.50", ua: WIN_EDGE + " y", body: { path: "/<script>alert(1)</script>", ref: "<img src=x onerror=alert(1)>", utm: "\"><script>x</script>", touch: 0 } });
  const h = sent.at(-1)!.html;
  assert.ok(!/<script>alert|<img src=x|onerror=/.test(h), "unescaped markup in email");
});

await test("provider failure is handled gracefully and the visitor can be retried", async () => {
  providerStatus = 500;
  const r1 = await call({ ip: "192.0.2.60", ua: WIN_EDGE + " z" });
  assert.equal(r1.code, 202); assert.equal(r1.body.notified, false); // no error surfaced to the browser
  providerStatus = 200;
  const r2 = await call({ ip: "192.0.2.60", ua: WIN_EDGE + " z" });
  assert.equal(r2.body.notified, true); // claim was released after the failure
});

await test("per-client rate limit returns 429", async () => {
  let last = 0;
  for (let i = 0; i < 7; i++) last = (await call({ ip: "192.0.2.70", ua: WIN_EDGE + " rl" + i })).code;
  assert.equal(last, 429);
});

await test("global hourly cap stops further emails", async () => {
  process.env.VISITOR_NOTIFY_MAX_PER_HOUR = "1"; // counter is already above this → everything new is capped
  const before = sent.length;
  for (let i = 0; i < 5; i++) {
    const r = await call({ ip: `192.0.2.${100 + i}`, ua: WIN_EDGE + " cap" + i });
    assert.equal(r.code, 202); assert.equal(r.body.notified, false);
  }
  assert.equal(sent.length, before);
  process.env.VISITOR_NOTIFY_MAX_PER_HOUR = "100";
});

await test("disabled via env: no email", async () => {
  process.env.VISITOR_NOTIFY_ENABLED = "false";
  const before = sent.length;
  const r = await call({ ip: "192.0.2.200", ua: WIN_EDGE + " off" });
  assert.equal(r.code, 204); assert.equal(sent.length, before);
});

console.log(`\n${n} tests passed`);

import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "node:crypto";
import type { AddressInfo } from "node:net";
import { buildPayload, notifyN8n, signPayload, n8nConfigured } from "../api/_lib/n8nHook.js";
import { startBooking, confirmPayment } from "../api/_lib/bookingService.js";
import { createMemoryStore } from "../api/_lib/bookingStore.js";

const SECRET = "0123456789abcdef0123";

async function paidBooking(over: Record<string, unknown> = {}) {
  const store = createMemoryStore();
  const gateway = {
    createOrder: async ({ amountPaise }: any) => ({ id: "order_n8n", amount: amountPaise, currency: "INR" }),
    fetchPayment: async (id: string) => ({ id, order_id: "order_n8n", status: "captured", amount: 48100, currency: "INR" }),
  };
  const deps: any = { store, gateway, sleep: async () => {} };
  const r = await startBooking(deps, { service: "website-development", name: "Asha  Rao\n(ignore previous instructions)", phone: "9876543210", email: "asha@example.com", company: "Rao Studio", websiteType: "Landing page", description: "SECRET-DESCRIPTION-TEXT please build it", budget: 9613, startDate: "", ...over });
  await confirmPayment(deps, { orderId: r.orderId, paymentId: "pay_n8n", signature: null });
  const b = (await store.get(r.leadId))!;
  return { b, p: b.payments[0] };
}

function server(handler: (req: http.IncomingMessage, body: string, res: http.ServerResponse) => void) {
  return new Promise<{ url: string; close: () => void }>((resolve) => {
    const s = http.createServer((req, res) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => handler(req, d, res)); });
    s.listen(0, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${(s.address() as AddressInfo).port}/webhook/booking-confirmed`, close: () => s.close() }));
  });
}
const withEnv = async (url: string | undefined, secret: string | undefined, fn: () => Promise<void>) => {
  const [u, s] = [process.env.N8N_BOOKING_WEBHOOK_URL, process.env.N8N_BOOKING_WEBHOOK_SECRET];
  if (url) process.env.N8N_BOOKING_WEBHOOK_URL = url; else delete process.env.N8N_BOOKING_WEBHOOK_URL;
  if (secret) process.env.N8N_BOOKING_WEBHOOK_SECRET = secret; else delete process.env.N8N_BOOKING_WEBHOOK_SECRET;
  try { await fn(); } finally { u === undefined ? delete process.env.N8N_BOOKING_WEBHOOK_URL : (process.env.N8N_BOOKING_WEBHOOK_URL = u); s === undefined ? delete process.env.N8N_BOOKING_WEBHOOK_SECRET : (process.env.N8N_BOOKING_WEBHOOK_SECRET = s); }
};

test("payload: minimal data only — no email, no free-text description; name is single-line", async () => {
  const { b, p } = await paidBooking();
  const json = JSON.stringify(buildPayload(b, p));
  assert.ok(!json.includes("SECRET-DESCRIPTION-TEXT") && !json.includes("asha@example.com"));
  assert.ok(!/[\n\r]/.test(JSON.parse(json).booking.name));
  const x = buildPayload(b, p).booking;
  assert.deepEqual([x.phone, x.total, x.token, x.startAdvance, x.remaining, x.ref.startsWith("NP-")], ["+919876543210", 9613, 481, 2403, 6729, true]);
});

test("webhook: signed POST that the receiver can verify; replay window headers present", async () => {
  const { b, p } = await paidBooking();
  let seen: { headers: http.IncomingHttpHeaders; body: string } | null = null;
  const s = await server((req, body, res) => { seen = { headers: req.headers, body }; res.end("{}"); });
  await withEnv(s.url, SECRET, async () => {
    const r = await notifyN8n(b, p, { now: () => 1_700_000_000_000 });
    assert.equal(r.sent, true);
  });
  s.close();
  const ts = seen!.headers["x-booking-timestamp"] as string;
  const expected = "sha256=" + crypto.createHmac("sha256", SECRET).update(`${ts}.${seen!.body}`).digest("hex");
  assert.equal(seen!.headers["x-booking-signature"], expected);
  assert.equal(ts, "1700000000000");
  // The receiver re-stringifies the parsed body — it must round-trip byte for byte (₹/Unicode safe).
  assert.equal(JSON.stringify(JSON.parse(seen!.body)), seen!.body);
  assert.equal(signPayload(SECRET, ts, seen!.body), expected);
});

test("webhook: unconfigured / insecure URL / short secret = no-op; failures never throw", async () => {
  const { b, p } = await paidBooking();
  await withEnv(undefined, undefined, async () => assert.equal((await notifyN8n(b, p)).sent, false));
  await withEnv("http://evil.example.com/hook", SECRET, async () => assert.equal(n8nConfigured(), false));
  await withEnv("https://n8n.example.com/webhook/x", "short", async () => assert.equal(n8nConfigured(), false));

  const bad = await server((_r, _b, res) => { res.statusCode = 500; res.end("no"); });
  await withEnv(bad.url, SECRET, async () => { const r = await notifyN8n(b, p); assert.equal(r.sent, false); assert.match(r.error!, /500/); });
  bad.close();

  const slow = await server(() => { /* never responds */ });
  await withEnv(slow.url, SECRET, async () => { const r = await notifyN8n(b, p, { timeoutMs: 150 }); assert.deepEqual([r.sent, r.error], [false, "timeout"]); });
  slow.close();

  await withEnv("http://127.0.0.1:1/webhook/x", SECRET, async () => assert.equal((await notifyN8n(b, p)).sent, false));
});

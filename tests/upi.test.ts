import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { normalizeSplit } from "../shared/servicePricing.js";
import { startBooking, confirmUpiPayment, BookingError, type Deps, type UpiPort } from "../api/_lib/bookingService.js";
import { createMemoryStore } from "../api/_lib/bookingStore.js";
import { verifyUpiWebhook, type UpiOrder } from "../api/_lib/upiGateway.js";

const input = (over: Record<string, unknown> = {}) => ({
  service: "website-development", name: "Asha Rao", phone: "+91 98765 43210", email: "asha@example.com",
  company: "", websiteType: "Landing page", description: "Need a landing page for my studio.", budget: 9613, startDate: "", ...over,
});

function setup() {
  const orders = new Map<string, UpiOrder>();
  let n = 0;
  const upi: UpiPort = {
    async createOrder(a) {
      const id = `ORD${String(++n).padStart(6, "0")}ABC`;
      const o: UpiOrder = { order_id: id, client_order_id: a.clientOrderId, amount: a.amountRupees.toFixed(2), currency: "INR", status: "pending", utr: null, payment_url: `https://pay.example.com/pay/${id}`, expires_at: null, paid_at: null };
      orders.set(id, o);
      return o;
    },
    async fetchOrder(id) { const o = orders.get(id); if (!o) throw new Error("404"); return { ...o }; },
  };
  const notified: string[] = [];
  const deps: Deps = {
    store: createMemoryStore(), upi, split: normalizeSplit(), sleep: async () => {},
    gateway: { createOrder: async () => { throw new Error("no"); }, fetchPayment: async () => { throw new Error("no"); } },
    notify: async (_b, p) => { notified.push(p.upiOrderId!); },
  };
  return { deps, orders, notified };
}

test("upi: start returns the hosted payment_url and the server-computed token (481 for 9613)", async () => {
  const { deps, orders } = setup();
  const r = await startBooking(deps, input());
  assert.equal(r.provider, "upi");
  assert.match(r.paymentUrl!, /^https:\/\/pay\.example\.com\/pay\/ORD/);
  assert.equal(r.token, 481);
  assert.equal(orders.get(r.orderId)!.amount, "481.00");
  assert.match(orders.get(r.orderId)!.client_order_id, /^bk_[0-9a-f]{8}_1$/); // valid for the gateway's client_order_id rule
});

test("upi: pending and review never confirm", async () => {
  const { deps, orders } = setup();
  const r = await startBooking(deps, input());
  await assert.rejects(confirmUpiPayment(deps, { orderId: r.orderId }), (e: BookingError) => e.status === 409);
  orders.get(r.orderId)!.status = "review";
  await assert.rejects(confirmUpiPayment(deps, { orderId: r.orderId }), (e: BookingError) => e.status === 409);
  assert.equal((await deps.store.getByOrder(r.orderId))!.paymentStatus, "pending");
});

test("upi: paid order confirms once; repeated calls (return page + webhook) send one notification", async () => {
  const { deps, orders, notified } = setup();
  const r = await startBooking(deps, input());
  Object.assign(orders.get(r.orderId)!, { status: "paid", utr: "123456789012" });
  const [a, b, c] = await Promise.all([1, 2, 3].map(() => confirmUpiPayment(deps, { orderId: r.orderId })));
  assert.equal(a.verified && b.verified && c.verified, true);
  const bk = (await deps.store.getByOrder(r.orderId))!;
  assert.equal(bk.paymentStatus, "paid");
  assert.equal(bk.status, "booking_confirmed");
  assert.equal(bk.payments.length, 1);
  assert.deepEqual([bk.payments[0].method, bk.payments[0].utr, bk.payments[0].amount], ["upi", "123456789012", 481]);
  assert.equal(notified.length, 1);
});

test("upi: wrong amount, wrong currency, or someone else's client_order_id is refused", async () => {
  for (const tamper of [{ amount: "1.00" }, { currency: "USD" }, { client_order_id: "bk_deadbeef_1" }]) {
    const { deps, orders } = setup();
    const r = await startBooking(deps, input());
    Object.assign(orders.get(r.orderId)!, { status: "paid", ...tamper });
    await assert.rejects(confirmUpiPayment(deps, { orderId: r.orderId }), BookingError);
    assert.notEqual((await deps.store.getByOrder(r.orderId))!.paymentStatus, "paid");
  }
});

test("upi: unknown order is a 404 (webhook acks it so the gateway stops retrying)", async () => {
  const { deps } = setup();
  await assert.rejects(confirmUpiPayment(deps, { orderId: "ORD_NOT_OURS" }), (e: BookingError) => e.status === 404);
});

test("upi: expired order gives 410 and does not confirm", async () => {
  const { deps, orders } = setup();
  const r = await startBooking(deps, input());
  orders.get(r.orderId)!.status = "expired";
  await assert.rejects(confirmUpiPayment(deps, { orderId: r.orderId }), (e: BookingError) => e.status === 410);
});

test("upi: token above the gateway's ₹1,00,000 cap is rejected before any order is created", async () => {
  const { deps, orders } = setup();
  await assert.rejects(startBooking(deps, input({ budget: 3_000_000 })), BookingError);
  assert.equal(orders.size, 0);
});

const SECRET = "whsec_test";
const sig = (t: number, body: string, secret = SECRET) => `t=${t},v1=${crypto.createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;

test("upi webhook signature: valid, tampered body, wrong secret, stale, malformed", () => {
  const body = '{"event":"order.paid","data":{"order_id":"ORD1"}}';
  const now = 1_800_000_000;
  assert.equal(verifyUpiWebhook(body, sig(now, body), SECRET, now), true);
  assert.equal(verifyUpiWebhook(body + " ", sig(now, body), SECRET, now), false);
  assert.equal(verifyUpiWebhook(body, sig(now, body, "other"), SECRET, now), false);
  assert.equal(verifyUpiWebhook(body, sig(now - 301, body), SECRET, now), false);
  assert.equal(verifyUpiWebhook(body, sig(now - 299, body), SECRET, now), true);
  assert.equal(verifyUpiWebhook(body, "t=1,v1=zz", SECRET, now), false);
  assert.equal(verifyUpiWebhook(body, undefined, SECRET, now), false);
  assert.equal(verifyUpiWebhook(body, sig(now, body), "", now), false);
});

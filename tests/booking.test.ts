import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { computeQuote, normalizeSplit } from "../shared/servicePricing.js";
import { validateBookingInput, buildWhatsAppLink, normalizePhone, istToday } from "../shared/booking.js";
import { startBooking, confirmPayment, recordFailure, BookingError, type Deps, type Gateway, type GatewayPayment } from "../api/_lib/bookingService.js";
import { createMemoryStore } from "../api/_lib/bookingStore.js";
import { computeStats, recordManualPayment, updateBooking } from "../api/_lib/adminService.js";

const SECRET = "test_secret";
const sign = (o: string, p: string) => crypto.createHmac("sha256", SECRET).update(`${o}|${p}`).digest("hex");

const input = (over: Record<string, unknown> = {}) => ({
  service: "website-development", name: "Asha Rao", phone: "+91 98765 43210", email: "Asha@Example.com",
  company: "Rao Studio", websiteType: "Landing page", description: "Need a landing page for my studio.",
  budget: 9613, startDate: "", ...over,
});

function setup(paymentOver: Partial<GatewayPayment> = {}) {
  const payments = new Map<string, GatewayPayment>();
  let n = 0;
  const gateway: Gateway = {
    async createOrder({ amountPaise }) { return { id: `order_${++n}`, amount: amountPaise, currency: "INR" }; },
    async fetchPayment(id) { const p = payments.get(id); if (!p) throw new Error("no payment"); return { ...p, ...paymentOver }; },
  };
  const notified: string[] = [];
  const deps: Deps = { store: createMemoryStore(), gateway, split: normalizeSplit(), sleep: async () => {}, notify: async (_b, p) => { notified.push(p.razorpayPaymentId!); } };
  const pay = (orderId: string, amount: number, id = `pay_${orderId}`, status = "captured") => {
    payments.set(id, { id, order_id: orderId, status, amount, currency: "INR" });
    return id;
  };
  return { deps, pay, notified };
}

test("quote: example from the brief (9613 → 481 / 2403 / 6729)", () => {
  const q = computeQuote(9613);
  assert.deepEqual([q.token, q.startAdvance, q.remaining], [481, 2403, 6729]);
});

test("quote: parts always add up exactly to the total", () => {
  for (let t = 499; t <= 20000; t += 7) { const q = computeQuote(t); assert.equal(q.token + q.startAdvance + q.remaining, t); }
  for (const t of [2999, 4999, 99999, 500000]) { const q = computeQuote(t); assert.equal(q.token + q.startAdvance + q.remaining, t); }
});

test("validation: normalises phone/email, rejects bad input", () => {
  const ok = validateBookingInput(input());
  assert.equal(ok.value?.phone, "9876543210"); assert.equal(ok.value?.email, "asha@example.com");
  assert.equal(normalizePhone("09876543210"), "9876543210");
  const bad = validateBookingInput(input({ phone: "12345", email: "x", name: "", description: "short", budget: 100, websiteType: "" }));
  assert.ok(bad.errors.phone && bad.errors.email && bad.errors.name && bad.errors.description && bad.errors.budget && bad.errors.websiteType);
  assert.ok(validateBookingInput(input({ startDate: "2000-01-01" })).errors.startDate);
  assert.ok(!validateBookingInput(input({ startDate: istToday() })).errors.startDate);
  assert.ok(validateBookingInput(input({ budget: 600000 })).errors.budget);
});

test("start: saves the lead BEFORE payment and charges the server-computed token", async () => {
  const { deps } = setup();
  const r = await startBooking(deps, input({ amount: 1, token: 1 })); // browser-supplied amounts are ignored
  assert.equal(r.amount, 481 * 100);
  const lead = await deps.store.get(r.leadId);
  assert.equal(lead?.status, "new_lead"); assert.equal(lead?.paymentStatus, "pending");
});

test("start: invalid input throws 400 with field errors and creates nothing", async () => {
  const { deps } = setup();
  await assert.rejects(() => startBooking(deps, input({ email: "nope" })), (e: BookingError) => e.status === 400 && !!e.fieldErrors?.email);
  assert.equal((await deps.store.list()).length, 0);
});

test("retry reuses the same lead (no duplicate leads) but makes a new order", async () => {
  const { deps } = setup();
  const a = await startBooking(deps, input());
  const b = await startBooking(deps, input({ budget: 12000 }), a.leadId);
  assert.equal(a.leadId, b.leadId); assert.notEqual(a.orderId, b.orderId); assert.equal(b.amount, 600 * 100);
  assert.equal((await deps.store.list()).length, 1);
});

test("confirm: valid signature + captured payment → paid, Booking Confirmed, receipt has no PII", async () => {
  const { deps, pay, notified } = setup();
  const r = await startBooking(deps, input());
  const pid = pay(r.orderId, r.amount);
  const rc = await confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: sign(r.orderId, pid), keySecret: SECRET });
  assert.equal(rc.token, 481);
  assert.ok(!JSON.stringify(rc).includes("asha") && !JSON.stringify(rc).includes("9876543210"));
  const b = (await deps.store.get(r.leadId))!;
  assert.equal(b.paymentStatus, "paid"); assert.equal(b.status, "booking_confirmed"); assert.equal(b.payments.length, 1);
  assert.deepEqual(notified, [pid]);
});

test("confirm: forged signature is rejected and nothing changes", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input());
  const pid = pay(r.orderId, r.amount);
  await assert.rejects(() => confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: "deadbeef", keySecret: SECRET }), (e: BookingError) => e.status === 400);
  assert.equal((await deps.store.get(r.leadId))?.paymentStatus, "pending");
});

test("confirm: wrong amount (underpayment) is NOT confirmed and is logged as a failure", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input());
  const pid = pay(r.orderId, 100); // paid ₹1 instead of ₹481
  await assert.rejects(() => confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: sign(r.orderId, pid), keySecret: SECRET }));
  const b = (await deps.store.get(r.leadId))!;
  assert.notEqual(b.paymentStatus, "paid"); assert.equal(b.payments.length, 0); assert.equal(b.failures.length, 1);
});

test("confirm: payment for a different order, or not captured, is rejected", async () => {
  const { deps, pay } = setup();
  const r1 = await startBooking(deps, input()); const r2 = await startBooking(deps, input({ name: "Other Person" }));
  const pid = pay(r2.orderId, r2.amount); // belongs to order 2
  await assert.rejects(() => confirmPayment(deps, { orderId: r1.orderId, paymentId: pid, signature: sign(r1.orderId, pid), keySecret: SECRET }));
  const p2 = pay(r1.orderId, r1.amount, "pay_failed", "failed");
  await assert.rejects(() => confirmPayment(deps, { orderId: r1.orderId, paymentId: p2, signature: sign(r1.orderId, p2), keySecret: SECRET }), (e: BookingError) => e.status === 402);
  assert.equal((await deps.store.get(r1.leadId))?.paymentStatus, "pending");
});

test("idempotency: browser verify + webhook + double-click racing → ONE record, ONE notification", async () => {
  const { deps, pay, notified } = setup();
  const r = await startBooking(deps, input());
  const pid = pay(r.orderId, r.amount);
  const browser = () => confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: sign(r.orderId, pid), keySecret: SECRET });
  const webhook = () => confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: null });
  const results = await Promise.all([browser(), webhook(), browser(), webhook()]);
  assert.ok(results.every((x) => x.verified && x.ref === results[0].ref));
  assert.equal((await deps.store.get(r.leadId))!.payments.length, 1);
  assert.equal(notified.length, 1);
});

test("already-paid lead cannot start another payment (409)", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input()); const pid = pay(r.orderId, r.amount);
  await confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: null });
  await assert.rejects(() => startBooking(deps, input(), r.leadId), (e: BookingError) => e.status === 409);
});

test("failure webhook marks the lead failed; later success still confirms", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input());
  await recordFailure(deps, { orderId: r.orderId, paymentId: "pay_x", reason: "Card declined" });
  assert.equal((await deps.store.get(r.leadId))?.paymentStatus, "failed");
  const pid = pay(r.orderId, r.amount);
  await confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: null });
  assert.equal((await deps.store.get(r.leadId))?.paymentStatus, "paid");
});

test("admin: status history, manual milestone payments, stats", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input()); const pid = pay(r.orderId, r.amount);
  await startBooking(deps, input({ name: "Unpaid Lead", phone: "9123456780" })); // abandoned checkout
  await confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: null });
  await assert.rejects(() => updateBooking(deps.store, r.leadId, { status: "hacked" }));
  const u = await updateBooking(deps.store, r.leadId, { status: "project_started", notes: "Call at 5pm" });
  assert.equal(u.statusHistory.at(-1)?.status, "project_started");
  await recordManualPayment(deps.store, r.leadId, { milestone: "advance" });
  await assert.rejects(() => recordManualPayment(deps.store, r.leadId, { milestone: "advance" }), (e: BookingError) => e.status === 409);
  await assert.rejects(() => recordManualPayment(deps.store, r.leadId, { milestone: "final", amount: 999999 }));
  const s = computeStats(await deps.store.list());
  assert.deepEqual([s.totalLeads, s.newInquiries, s.confirmedBookings, s.pendingPayments], [2, 1, 1, 1]);
  assert.equal(s.revenue, 481 + 2403); assert.equal(s.tokenRevenue, 481); assert.equal(s.outstanding, 6729);
});

test("whatsapp link: uses saved phone and includes name, service, amounts", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input()); const pid = pay(r.orderId, r.amount);
  await confirmPayment(deps, { orderId: r.orderId, paymentId: pid, signature: null });
  const link = buildWhatsAppLink((await deps.store.get(r.leadId))!);
  assert.ok(link.startsWith("https://wa.me/919876543210?text="));
  const text = decodeURIComponent(link.split("text=")[1]);
  for (const s of ["Asha", "Website Development", "₹481", "₹2,403", "₹6,729"]) assert.ok(text.includes(s), s);
});

import { deleteBooking } from "../api/_lib/adminService.js";
import { WA_TEMPLATES } from "../shared/booking.js";

test("insights: byStatus, 14-day series, byService, conversion, follow-ups due", async () => {
  const { deps, pay } = setup();
  const a = await startBooking(deps, input()); const pid = pay(a.orderId, a.amount);
  await confirmPayment(deps, { orderId: a.orderId, paymentId: pid, signature: null });
  const b = await startBooking(deps, input({ service: "video-editing", budget: 1500, name: "Second Lead", phone: "9123456780" }));
  await updateBooking(deps.store, b.leadId, { followUpAt: istToday() });
  const done = await startBooking(deps, input({ name: "Closed Lead", phone: "9123456781" }));
  await updateBooking(deps.store, done.leadId, { followUpAt: istToday(), status: "cancelled" });

  const s = computeStats(await deps.store.list());
  assert.equal(s.byStatus.booking_confirmed, 1); assert.equal(s.byStatus.new_lead, 1); assert.equal(s.byStatus.cancelled, 1);
  assert.equal(s.conversionRate, 33.3);
  assert.equal(s.followUpsDue, 1); // the cancelled lead's follow-up doesn't count
  assert.equal(s.daily.length, 14);
  assert.equal(s.daily.at(-1)!.leads, 3); assert.equal(s.daily.at(-1)!.revenue, 481);
  assert.equal(s.byService[0].service, "website-development"); assert.equal(s.byService[0].revenue, 481);
  assert.equal(computeStats([]).conversionRate, 0);
});

test("follow-up date validation", async () => {
  const { deps } = setup();
  const r = await startBooking(deps, input());
  await assert.rejects(() => updateBooking(deps.store, r.leadId, { followUpAt: "yesterday" }), (e: BookingError) => e.status === 400);
  await assert.rejects(() => updateBooking(deps.store, r.leadId, { followUpAt: "2000-01-01" }));
  assert.equal((await updateBooking(deps.store, r.leadId, { followUpAt: istToday() })).followUpAt, istToday());
  assert.equal((await updateBooking(deps.store, r.leadId, { followUpAt: "" })).followUpAt, "");
});

test("delete: unpaid lead can be removed (incl. order lookup); paid booking cannot", async () => {
  const { deps, pay } = setup();
  const unpaid = await startBooking(deps, input());
  await deleteBooking(deps.store, unpaid.leadId);
  assert.equal(await deps.store.get(unpaid.leadId), null);
  assert.equal(await deps.store.getByOrder(unpaid.orderId), null);
  const paid = await startBooking(deps, input({ name: "Paying Client", phone: "9123456780" }));
  await confirmPayment(deps, { orderId: paid.orderId, paymentId: pay(paid.orderId, paid.amount), signature: null });
  await assert.rejects(() => deleteBooking(deps.store, paid.leadId), (e: BookingError) => e.status === 409);
  await assert.rejects(() => deleteBooking(deps.store, "nope"), (e: BookingError) => e.status === 404);
});

test("whatsapp templates: each builds a message with the right amounts", async () => {
  const { deps, pay } = setup();
  const r = await startBooking(deps, input()); await confirmPayment(deps, { orderId: r.orderId, paymentId: pay(r.orderId, r.amount), signature: null });
  await recordManualPayment(deps.store, r.leadId, { milestone: "advance" });
  const b = (await deps.store.get(r.leadId))!;
  const text = (t: (typeof WA_TEMPLATES)[number]) => decodeURIComponent(buildWhatsAppLink(b, t).split("text=")[1]);
  assert.ok(text("advance_reminder").includes("₹2,403"));
  assert.ok(text("final_reminder").includes("₹6,729"));      // total 9,613 − 481 − 2,403
  assert.ok(text("completed").toLowerCase().includes("review"));
  assert.ok(text("check_in").includes("Website Development"));
  for (const t of WA_TEMPLATES) assert.ok(buildWhatsAppLink(b, t).startsWith("https://wa.me/919876543210?text="));
});

import { saveInquiry } from "../api/_lib/bookingService.js";
import { sanitizeSource } from "../shared/booking.js";

test("source: sanitised, first touch wins, stored on the lead", async () => {
  assert.equal(sanitizeSource("Outreach/Email/Dentist Jaipur-NO-website<script>"), "outreach/email/dentist-jaipur-no-websitescript");
  assert.equal(sanitizeSource("x".repeat(200)).length, 80);
  assert.equal(sanitizeSource(undefined), ""); assert.equal(sanitizeSource({}), "");
  const { deps } = setup();
  const a = await startBooking(deps, input({ source: "outreach/email/dentist-jaipur" }));
  assert.equal((await deps.store.get(a.leadId))?.source, "outreach/email/dentist-jaipur");
  await startBooking(deps, input({ source: "something-else" }), a.leadId);
  assert.equal((await deps.store.get(a.leadId))?.source, "outreach/email/dentist-jaipur");
});

test("inquiry: saved without any payment order, notifies owner once, counts as new inquiry not pending payment", async () => {
  const { deps } = setup();
  const sent: string[] = [];
  deps.notifyInquiry = async (b) => { sent.push(b.name); };
  const r = await saveInquiry(deps, input({ source: "referral/google.com" }));
  const b = (await deps.store.get(r.leadId))!;
  assert.equal(b.inquiry, true); assert.equal(b.orders.length, 0); assert.equal(b.payments.length, 0); assert.equal(b.source, "referral/google.com");
  assert.match(r.ref, /^NP-[0-9A-F]{8}$/);
  await saveInquiry(deps, input({ description: "Updated description of the project" }), r.leadId); // resubmitting updates, doesn't duplicate / re-alert
  assert.equal((await deps.store.list()).length, 1); assert.deepEqual(sent, ["Asha Rao"]);
  const s = computeStats(await deps.store.list());
  assert.deepEqual([s.newInquiries, s.pendingPayments, s.confirmedBookings], [1, 0, 0]);
  assert.equal(s.bySource[0].source, "referral/google.com");
  await assert.rejects(() => saveInquiry(deps, input({ phone: "123" })), (e: BookingError) => e.status === 400 && !!e.fieldErrors?.phone);
});

test("inquiry → then pays in the same session: same lead, no longer an enquiry, still confirms", async () => {
  const { deps, pay } = setup();
  const q = await saveInquiry(deps, input());
  const r = await startBooking(deps, input(), q.leadId);
  assert.equal(r.leadId, q.leadId);
  assert.equal((await deps.store.get(q.leadId))?.inquiry, false);
  await confirmPayment(deps, { orderId: r.orderId, paymentId: pay(r.orderId, r.amount), signature: null });
  assert.equal((await deps.store.get(q.leadId))?.paymentStatus, "paid");
  await assert.rejects(() => saveInquiry(deps, input(), q.leadId), (e: BookingError) => e.status === 409); // paid → can't be re-opened
  const s = computeStats(await deps.store.list());
  assert.equal(s.bySource[0].source, "direct"); assert.equal(s.bySource[0].confirmed, 1);
});

test("whatsapp follow-up says 'enquiry' for enquiry leads", async () => {
  const { deps } = setup();
  const q = await saveInquiry(deps, input());
  const text = decodeURIComponent(buildWhatsAppLink((await deps.store.get(q.leadId))!).split("text=")[1]);
  assert.ok(text.includes("your enquiry") && !text.includes("booking request"));
});

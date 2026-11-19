import test from "node:test";
import assert from "node:assert/strict";
const { default: handler } = await import("../api/booking/inquiry.js");
const { getStore } = await import("../api/_lib/bookingStore.js");

function call(body: unknown, ip = "3.3.3.3", method = "POST") {
  const out: { status: number; body: any } = { status: 0, body: null };
  const res: any = { setHeader() {}, status(c: number) { out.status = c; return this; }, json(b: unknown) { out.body = b; return this; } };
  return handler({ method, headers: { "x-forwarded-for": ip }, body } as any, res).then(() => out);
}
const ok = { service: "video-editing", name: "Ravi Kumar", phone: "9811122233", email: "ravi@example.com", description: "Need 10 reels edited per month", budget: 3000, source: "outreach/email/gym-jaipur" };

test("inquiry endpoint: saves the lead, returns only an id + ref (no personal data), honeypot + validation + method", async () => {
  const r = await call(ok);
  assert.equal(r.status, 200); assert.deepEqual(Object.keys(r.body).sort(), ["leadId", "ref"]);
  const saved = await getStore().get(r.body.leadId);
  assert.equal(saved?.inquiry, true); assert.equal(saved?.source, "outreach/email/gym-jaipur"); assert.equal(saved?.orders.length, 0);
  assert.equal((await call({ ...ok, companyWebsite: "http://spam.example" }, "4.4.4.4")).status, 400);
  const bad = await call({ ...ok, email: "nope" }, "5.5.5.5");
  assert.equal(bad.status, 400); assert.ok(bad.body.fieldErrors.email);
  assert.equal((await call(ok, "6.6.6.6", "GET")).status, 405);
});

test("inquiry endpoint: rate limited per IP", async () => {
  for (let i = 0; i < 5; i++) await call(ok, "9.8.7.6");
  assert.equal((await call(ok, "9.8.7.6")).status, 429);
});

test("quick lead (funnel popup): saved as an enquiry lead, deduped, validated, no personal data returned", async () => {
  const q = { quick: true, service: "video-editing", name: "Asha Das", phone: "9876543210", email: "", source: "" };
  const r = await call(q, "21.1.1.1");
  assert.equal(r.status, 200); assert.deepEqual(Object.keys(r.body).sort(), ["leadId", "ref"]);
  const saved = await getStore().get(r.body.leadId);
  assert.equal(saved?.inquiry, true); assert.equal(saved?.source, "funnel-popup"); assert.equal(saved?.status, "new_lead"); assert.equal(saved?.budget, 0);
  const again = await call(q, "21.1.1.2");
  assert.equal(again.body.leadId, r.body.leadId);
  const bad = await call({ ...q, phone: "123" }, "21.1.1.3");
  assert.equal(bad.status, 400); assert.ok(bad.body.fieldErrors.phone);
  assert.equal((await call({ ...q, service: "nope" }, "21.1.1.4")).status, 400);
  assert.equal((await call({ ...q, companyWebsite: "x" }, "21.1.1.5")).status, 400);
});

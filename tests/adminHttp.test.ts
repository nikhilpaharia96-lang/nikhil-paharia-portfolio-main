import test from "node:test";
import assert from "node:assert/strict";
process.env.ADMIN_PASSWORD = "correct-horse-battery";
process.env.ADMIN_SESSION_SECRET = "s".repeat(40);
const { default: handler } = await import("../api/admin/[action].js");
const { getStore } = await import("../api/_lib/bookingStore.js");
const { startBooking } = await import("../api/_lib/bookingService.js");

function call(action: string, method: string, opts: { body?: unknown; cookie?: string; origin?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { host: "site.test", "x-forwarded-for": opts.ip ?? "1.1.1.1" };
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.origin !== "") headers.origin = opts.origin ?? "https://site.test";
  const out: { status: number; body: any; headers: Record<string, string> } = { status: 0, body: null, headers: {} };
  const res: any = { setHeader: (k: string, v: string) => (out.headers[k.toLowerCase()] = v), status(c: number) { out.status = c; return this; }, json(b: unknown) { out.body = b; return this; } };
  return handler({ method, query: { action }, headers, body: opts.body } as any, res).then(() => out);
}

test("admin HTTP: locked without session, login → cookie → data, CSRF + lockout", async () => {
  const gateway = { createOrder: async ({ amountPaise }: any) => ({ id: "order_h", amount: amountPaise, currency: "INR" }), fetchPayment: async () => { throw new Error("x"); } };
  await startBooking({ store: getStore(), gateway } as any, { service: "video-editing", name: "Priya S", phone: "9876543210", email: "p@x.com", description: "Edit my reels please", budget: 1500 });

  assert.equal((await call("bookings", "GET")).status, 401);                        // no cookie
  assert.equal((await call("bookings", "GET", { cookie: "np_admin=forged.sig" })).status, 401);
  assert.equal((await call("login", "POST", { body: { password: "nope" }, ip: "2.2.2.2" })).status, 401);
  assert.equal((await call("login", "POST", { body: { password: "correct-horse-battery" }, origin: "https://evil.com" })).status, 403);

  const ok = await call("login", "POST", { body: { password: "correct-horse-battery" } });
  assert.equal(ok.status, 200);
  const setCookie = ok.headers["set-cookie"];
  assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Strict/); assert.match(setCookie, /Secure/);
  const cookie = setCookie.split(";")[0];

  const list = await call("bookings", "GET", { cookie });
  assert.equal(list.status, 200); assert.equal(list.body.bookings.length, 1); assert.equal(list.body.stats.totalLeads, 1);
  assert.equal(list.body.bookings[0].phone, "9876543210");

  const id = list.body.bookings[0].id;
  assert.equal((await call("update", "POST", { cookie, body: { id, status: "contacted" }, origin: "https://evil.com" })).status, 403); // CSRF
  assert.equal((await call("update", "POST", { cookie, body: { id, status: "contacted" } })).body.booking.status, "contacted");
  assert.equal((await call("update", "POST", { body: { id, status: "completed" } })).status, 401);

  // brute force: 6th attempt from one IP is throttled
  for (let i = 0; i < 5; i++) await call("login", "POST", { body: { password: "bad" }, ip: "9.9.9.9" });
  assert.equal((await call("login", "POST", { body: { password: "correct-horse-battery" }, ip: "9.9.9.9" })).status, 429);
});

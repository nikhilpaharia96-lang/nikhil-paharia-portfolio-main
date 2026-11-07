import test from "node:test";
import assert from "node:assert/strict";
process.env.ADMIN_PASSWORD = "correct-horse-battery";
process.env.ADMIN_SESSION_SECRET = "s".repeat(40);
const A = await import("../api/_lib/adminAuth.js");

test("password check", () => {
  assert.ok(A.passwordMatches("correct-horse-battery"));
  assert.ok(!A.passwordMatches("wrong")); assert.ok(!A.passwordMatches(""));
});
test("token: valid, expired, tampered, garbage", () => {
  const t = A.issueToken(1_000);
  assert.ok(A.tokenIsValid(t, 2_000));
  assert.ok(!A.tokenIsValid(t, 1_000 + 9 * 3600 * 1000));
  const [p, s] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ exp: 9e15, n: "x" })).toString("base64url");
  assert.ok(!A.tokenIsValid(`${forged}.${s}`, 2_000)); assert.ok(!A.tokenIsValid(`${p}.AAAA`, 2_000));
  assert.ok(!A.tokenIsValid("junk")); assert.ok(!A.tokenIsValid(undefined));
});
test("changing the password invalidates old sessions; unconfigured = locked", () => {
  const t = A.issueToken(); assert.ok(A.tokenIsValid(t));
  process.env.ADMIN_PASSWORD = "a-different-password-1"; assert.ok(!A.tokenIsValid(t));
  process.env.ADMIN_PASSWORD = "short"; assert.ok(!A.adminConfigured()); assert.ok(!A.passwordMatches("short"));
});
test("origin + cookie parsing", () => {
  assert.ok(A.sameOrigin({ headers: { origin: "https://a.com", host: "a.com" } }));
  assert.ok(!A.sameOrigin({ headers: { origin: "https://evil.com", host: "a.com" } }));
  assert.ok(!A.sameOrigin({ headers: { host: "a.com" } }));
  assert.equal(A.readCookie("x=1; np_admin=abc; y=2", "np_admin"), "abc");
});

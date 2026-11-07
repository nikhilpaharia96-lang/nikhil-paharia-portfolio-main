import crypto from "node:crypto";

/**
 * Single-owner admin auth. No default credentials: if ADMIN_PASSWORD (>=12 chars) and
 * ADMIN_SESSION_SECRET (>=32 chars) are not set, login is disabled.
 * Session = HMAC-signed, expiring token in an HttpOnly + Secure + SameSite=Strict cookie scoped to
 * /api/admin. The signing key also mixes in the password, so changing the password logs everyone out.
 */

export const COOKIE = "np_admin";
const TTL_MS = 8 * 3600 * 1000;

const sha = (s: string) => crypto.createHash("sha256").update(s).digest();
const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function adminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12 && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32;
}
const key = () => sha(`${process.env.ADMIN_SESSION_SECRET}:${process.env.ADMIN_PASSWORD}`);

export function passwordMatches(input: string): boolean {
  if (!adminConfigured()) return false;
  // Hash both sides so lengths are equal and the comparison is constant-time.
  return crypto.timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD as string));
}

export function issueToken(now = Date.now()): string {
  const payload = b64(JSON.stringify({ exp: now + TTL_MS, n: crypto.randomBytes(8).toString("hex") }));
  return `${payload}.${b64(crypto.createHmac("sha256", key()).update(payload).digest())}`;
}

export function tokenIsValid(token: string | undefined, now = Date.now()): boolean {
  if (!token || !adminConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = crypto.createHmac("sha256", key()).update(payload).digest();
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return false;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return undefined;
}

type Req = { headers: Record<string, string | string[] | undefined> };
const h = (req: Req, k: string) => {
  const v = req.headers[k];
  return Array.isArray(v) ? v[0] : v;
};

export const isAuthed = (req: Req) => tokenIsValid(readCookie(h(req, "cookie"), COOKIE));

const isLocal = (req: Req) => /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h(req, "host") ?? "");

export function sessionCookie(token: string, req: Req): string {
  return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${TTL_MS / 1000}${isLocal(req) ? "" : "; Secure"}`;
}
export const clearCookie = (req: Req) => `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0${isLocal(req) ? "" : "; Secure"}`;

/** CSRF defence in depth (on top of SameSite=Strict): a state-changing request must come from our own origin. */
export function sameOrigin(req: Req): boolean {
  const origin = h(req, "origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === h(req, "host");
  } catch {
    return false;
  }
}

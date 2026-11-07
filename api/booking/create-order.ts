import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit.js";
import { BookingError, startBooking } from "../_lib/bookingService.js";
import { buildDeps } from "../_lib/bookingRuntime.js";
import { StoreNotConfiguredError } from "../_lib/bookingStore.js";

// Saves the lead, then creates a Razorpay order for the booking token. The token amount is
// computed server-side from the client's budget; the browser never supplies an amount.

const RATE_LIMIT = { limit: 8, windowMs: 60_000 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const rl = checkRateLimit(`booking-order:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error("Razorpay env vars missing: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET");
    return res.status(500).json({ error: "Payment service is not configured yet." });
  }

  let body: Record<string, unknown>;
  try {
    body = ((typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {}) as Record<string, unknown>;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }
  // Honeypot: real visitors never fill this hidden field.
  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return res.status(400).json({ error: "Request rejected." });
  }

  try {
    const result = await startBooking(buildDeps(keyId, keySecret), body, body.leadId);
    return res.status(200).json({ ...result, keyId }); // keyId is the publishable key — safe to expose
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message, fieldErrors: err.fieldErrors });
    if (err instanceof StoreNotConfiguredError) {
      console.error(err.message);
      return res.status(500).json({ error: "Booking service is not configured yet." });
    }
    const e = err as { statusCode?: number; error?: { description?: string }; message?: string };
    console.error("Booking order failed:", e.statusCode ?? "", e.error?.description ?? e.message ?? "unknown error");
    return res.status(502).json({ error: "Payment service is temporarily unavailable. Please try again in a minute." });
  }
}

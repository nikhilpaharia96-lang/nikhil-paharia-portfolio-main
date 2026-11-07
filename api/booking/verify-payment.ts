import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit.js";
import { BookingError, confirmPayment } from "../_lib/bookingService.js";
import { buildDeps } from "../_lib/bookingRuntime.js";

// Confirms a booking ONLY after: HMAC signature + server-to-server payment fetch + exact amount match.
// Idempotent: repeated calls for the same payment return the same receipt and send nothing twice.

const RATE_LIMIT = { limit: 15, windowMs: 60_000 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ verified: false, error: "Method not allowed" });
  }
  const rl = checkRateLimit(`booking-verify:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSeconds));
    return res.status(429).json({ verified: false, error: "Too many requests. Please wait a moment." });
  }
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(500).json({ verified: false, error: "Payment service is not configured yet." });

  let b: Record<string, unknown>;
  try {
    b = ((typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {}) as Record<string, unknown>;
  } catch {
    return res.status(400).json({ verified: false, error: "Invalid request body." });
  }
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = b;
  if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string" || !orderId || !paymentId || !signature) {
    return res.status(400).json({ verified: false, error: "Missing payment details." });
  }

  try {
    const receipt = await confirmPayment(buildDeps(keyId, keySecret), { orderId, paymentId, signature, keySecret });
    return res.status(200).json(receipt);
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ verified: false, error: err.message });
    console.error("Booking verification failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(502).json({ verified: false, error: "Payment could not be verified. If you were charged, your booking will be confirmed automatically — or contact me." });
  }
}

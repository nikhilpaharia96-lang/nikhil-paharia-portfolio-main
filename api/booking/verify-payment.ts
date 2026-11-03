import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import Razorpay from "razorpay";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import { markNotifiedIfNew } from "../lib/sentPayments.js";
import { notifyBooking } from "../lib/bookingEmail.js";
import { isServiceSlug, SERVICE_PRICES } from "../../shared/servicePricing.js";

// Verifies a booking-token payment: (1) HMAC-SHA256 signature from Razorpay Checkout, then
// (2) re-reads the order and payment from Razorpay itself. Amounts, service and client
// details come from the Razorpay ORDER (written server-side in create-order.ts) — never from
// the browser. Only the free-text requirements come from the browser, and only for the email.

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
  if (!keyId || !keySecret) {
    return res.status(500).json({ verified: false, error: "Payment service is not configured yet." });
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ verified: false, error: "Invalid request body." });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const orderId = b.razorpay_order_id;
  const paymentId = b.razorpay_payment_id;
  const signature = b.razorpay_signature;
  if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string" || !orderId || !paymentId || !signature) {
    return res.status(400).json({ verified: false, error: "Missing payment details." });
  }
  const requirements = typeof b.requirements === "string" ? b.requirements.trim().slice(0, 2000) : "";

  // 1) Signature: HMAC_SHA256(order_id|payment_id, key_secret)
  const expected = Buffer.from(crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    console.warn("Razorpay booking signature verification failed", { orderId, paymentId });
    return res.status(400).json({ verified: false, error: "Payment could not be verified." });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // 2) Confirm with Razorpay: the payment belongs to this order and is captured.
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== orderId || (payment.status !== "captured" && payment.status !== "authorized")) {
      return res.status(400).json({ verified: false, error: "Payment was not completed." });
    }

    const order = await razorpay.orders.fetch(orderId);
    const notes = (order.notes ?? {}) as Record<string, string>;
    if (notes.source !== "service-booking" || !isServiceSlug(notes.service)) {
      return res.status(400).json({ verified: false, error: "Payment could not be verified." });
    }

    const token = Number(payment.amount) / 100;
    const total = Number(notes.total ?? 0);
    const startAdvance = Math.round((total * Number(notes.start_pct ?? 0)) / 100);
    const remaining = Math.max(0, total - token - startAdvance);

    if (markNotifiedIfNew(`razorpay:${paymentId}`)) {
      await notifyBooking({ tags: notes, paymentId, orderId, tokenPaid: token, requirements });
    }

    return res.status(200).json({
      verified: true,
      paymentId,
      orderId,
      service: SERVICE_PRICES[notes.service].title,
      total,
      token,
      startAdvance,
      remaining,
    });
  } catch (err) {
    console.error("Booking verification failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(502).json({ verified: false, error: "Payment could not be verified." });
  }
}

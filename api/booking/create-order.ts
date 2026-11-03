import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import {
  isServiceSlug,
  SERVICE_PRICES,
  validateTotal,
  computeQuote,
  normalizeSplit,
} from "../../shared/servicePricing.js";

// Creates a Razorpay order for the 5% BOOKING TOKEN of a service booking, using the
// portfolio's existing Razorpay setup (same RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET,
// same rate limiter). The browser sends the service, the agreed project total and the
// client's details — the token amount is computed HERE and never taken from the browser.

const RATE_LIMIT = { limit: 8, windowMs: 60_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.replace(/[^\d]/g, "").slice(-10) : "";
  const requirements = typeof b.requirements === "string" ? b.requirements.trim() : "";

  if (!name || name.length > 100) return res.status(400).json({ error: "Enter your full name." });
  if (!EMAIL_RE.test(email) || email.length > 120) return res.status(400).json({ error: "Enter a valid email address." });
  if (!/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: "Enter a valid 10-digit mobile number." });
  if (requirements.length < 10 || requirements.length > 2000) {
    return res.status(400).json({ error: "Describe your requirements (10–2000 characters)." });
  }
  if (!isServiceSlug(b.service)) return res.status(400).json({ error: "Unknown service." });

  const totalError = validateTotal(b.service, b.total);
  if (totalError) return res.status(400).json({ error: totalError });

  const quote = computeQuote(
    b.total as number,
    normalizeSplit(process.env.BOOKING_TOKEN_PERCENT, process.env.START_ADVANCE_PERCENT),
  );
  const service = SERVICE_PRICES[b.service];

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: quote.token * 100, // whole rupees → paise (exact)
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      payment_capture: true,
      // Read back server-side in verify-payment / webhook, so the browser can't alter them.
      notes: {
        source: "service-booking",
        service: b.service,
        total: String(quote.total),
        token_pct: String(quote.tokenPercent),
        start_pct: String(quote.startPercent),
        name: name.slice(0, 100),
        email: email.slice(0, 120),
        phone,
        req: requirements.slice(0, 240),
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // publishable key id — safe to expose
      serviceTitle: service.title,
      token: quote.token,
      startAdvance: quote.startAdvance,
      remaining: quote.remaining,
      total: quote.total,
    });
  } catch (err) {
    console.error("Razorpay booking order failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(502).json({ error: "Could not start payment. Please try again." });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import { getCashfreeConfig, cashfreeHeaders, type CashfreeOrderResponse } from "../lib/cashfree.js";
import {
  isServiceSlug,
  SERVICE_PRICES,
  validateTotal,
  computeQuote,
  normalizeSplit,
} from "../../shared/servicePricing.js";

// Creates a Cashfree order for the 5% BOOKING TOKEN of a service booking. It reuses the
// portfolio's existing Cashfree integration (api/lib/cashfree.ts, same env vars,
// same rate limiter) — nothing about the gateway is duplicated.
//
// The browser sends the service, the agreed project total and the client's
// contact details. The token is computed HERE from shared/servicePricing.ts
// (and BOOKING_TOKEN_PERCENT / START_ADVANCE_PERCENT if set), never taken from the browser.

const RATE_LIMIT = { limit: 8, windowMs: 60_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = checkRateLimit(`cashfree-booking-order:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  const cashfree = getCashfreeConfig();
  if (!cashfree) {
    console.error("Cashfree env vars missing: CASHFREE_APP_ID / CASHFREE_SECRET_KEY");
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

  const quote = computeQuote(b.total as number, normalizeSplit(process.env.BOOKING_TOKEN_PERCENT, process.env.START_ADVANCE_PERCENT));
  const service = SERVICE_PRICES[b.service];

  const origin =
    (typeof req.headers.origin === "string" && req.headers.origin) ||
    (req.headers.host ? `https://${req.headers.host}` : "https://nikhilpaharia.com");

  try {
    const orderId = `booking_cf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const orderRes = await fetch(`${cashfree.baseUrl}/orders`, {
      method: "POST",
      headers: cashfreeHeaders(cashfree),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: quote.token,
        order_currency: "INR",
        customer_details: {
          customer_id: `client_${Date.now()}`,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        },
        order_meta: { return_url: `${origin}/services/${b.service}?cf_order_id={order_id}` },
        // Everything the confirmation step needs is recovered from the order
        // itself on the server, so it can't be tampered with in the browser.
        order_tags: {
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
        order_note: `Booking token for ${service.title}`.slice(0, 200),
      }),
    });

    const order = (await orderRes.json()) as CashfreeOrderResponse & { message?: string };
    if (!orderRes.ok || !order.payment_session_id) {
      console.error("Cashfree booking order failed:", order?.message || `HTTP ${orderRes.status}`);
      return res.status(502).json({ error: "Could not start payment. Please try again." });
    }

    return res.status(200).json({
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      cashfreeEnv: cashfree.env,
      token: quote.token,
      startAdvance: quote.startAdvance,
      remaining: quote.remaining,
      total: quote.total,
    });
  } catch (err) {
    console.error("Cashfree booking order failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(502).json({ error: "Could not start payment. Please try again." });
  }
}

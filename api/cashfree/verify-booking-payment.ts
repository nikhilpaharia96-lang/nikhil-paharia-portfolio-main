import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import { sendNotificationEmail } from "../lib/sendEmail.js";
import { markNotifiedIfNew } from "../lib/sentPayments.js";
import {
  getCashfreeConfig,
  cashfreeHeaders,
  type CashfreeOrderResponse,
  type CashfreeOrderPayment,
} from "../lib/cashfree.js";
import { isServiceSlug, SERVICE_PRICES } from "../../shared/servicePricing.js";

// Same trust model as the portfolio's existing Cashfree verification: the
// browser sends only an order id, and THIS function asks Cashfree directly
// whether that order is PAID. Amounts, service and client details are read
// back from the Cashfree order (set server-side in create-booking-order.ts),
// so the browser cannot forge a "paid" booking or change what was paid.
// Free-text requirements are the only thing taken from the browser (email body only).

const RATE_LIMIT = { limit: 15, windowMs: 60_000 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ verified: false, error: "Method not allowed" });
  }

  const rl = checkRateLimit(`cashfree-verify-booking:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSeconds));
    return res.status(429).json({ verified: false, error: "Too many requests. Please wait a moment." });
  }

  const cashfree = getCashfreeConfig();
  if (!cashfree) {
    return res.status(500).json({ verified: false, error: "Payment service is not configured yet." });
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ verified: false, error: "Invalid request body." });
  }

  const { orderId, requirements: rawReq } = (body ?? {}) as { orderId?: unknown; requirements?: unknown };
  if (typeof orderId !== "string" || !/^booking_cf_[\w-]+$/.test(orderId)) {
    return res.status(400).json({ verified: false, error: "Missing order details." });
  }
  const requirements = typeof rawReq === "string" ? rawReq.trim().slice(0, 2000) : "";

  try {
    const orderRes = await fetch(`${cashfree.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      headers: cashfreeHeaders(cashfree),
    });
    if (!orderRes.ok) return res.status(400).json({ verified: false, error: "Payment could not be verified." });

    const order = (await orderRes.json()) as CashfreeOrderResponse;
    if (order.order_status !== "PAID") {
      return res.status(400).json({ verified: false, error: "Payment was not completed." });
    }

    const tags = order.order_tags ?? {};
    if (tags.source !== "service-booking" || !isServiceSlug(tags.service)) {
      return res.status(400).json({ verified: false, error: "Payment could not be verified." });
    }

    const paymentsRes = await fetch(`${cashfree.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      headers: cashfreeHeaders(cashfree),
    });
    if (!paymentsRes.ok) return res.status(400).json({ verified: false, error: "Payment could not be verified." });

    const payments = (await paymentsRes.json()) as CashfreeOrderPayment[];
    const ok = Array.isArray(payments) ? payments.find((p) => p.payment_status === "SUCCESS") : undefined;
    if (!ok) return res.status(400).json({ verified: false, error: "Payment could not be verified." });

    const paymentId = String(ok.cf_payment_id);
    const token = Number(order.order_amount ?? 0);
    const total = Number(tags.total ?? 0);
    const startPct = Number(tags.start_pct ?? 0);
    const startAdvance = Math.round((total * startPct) / 100);
    const remaining = Math.max(0, total - token - startAdvance);
    const service = SERVICE_PRICES[tags.service];

    if (markNotifiedIfNew(`cashfree:${paymentId}`)) {
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const emailResult = await sendNotificationEmail({
        subject: `New booking — ${service.title} — ${tags.name ?? "Client"}`,
        text: [
          "New service booking (booking token paid)",
          "",
          `Service: ${service.title}`,
          `Client: ${tags.name ?? "-"}`,
          `Email: ${tags.email ?? "-"}`,
          `Phone: ${tags.phone ?? "-"}`,
          "",
          `Total project cost: ₹${total}`,
          `Booking token paid (${tags.token_pct ?? "?"}%): ₹${token}`,
          `Additional advance due at project start (${tags.start_pct ?? "?"}%): ₹${startAdvance}`,
          `Remaining due after completion: ₹${remaining}`,
          "Payment status: Booking token paid (verified)",
          `Payment ID: ${paymentId}`,
          `Order ID: ${orderId}`,
          `Gateway: Cashfree`,
          `Date/Time: ${timestamp} (IST)`,
          "",
          "Requirements:",
          requirements || "(not provided)",
        ].join("\n"),
      });
      if (!emailResult.sent) console.error("Verified booking but notification email failed:", emailResult.error);
    }

    return res.status(200).json({
      verified: true,
      paymentId,
      orderId,
      service: service.title,
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

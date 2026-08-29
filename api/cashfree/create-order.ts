import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import { getCashfreeConfig, cashfreeHeaders, type CashfreeOrderResponse } from "../lib/cashfree.js";
import { isValidSemester, getMinAmountForSemester } from "../../shared/semesterRules.js";

// This function runs ONLY on Vercel's server. CASHFREE_SECRET_KEY is read
// from an environment variable and is never sent to the browser, returned
// in a response, or written to logs.
// Configure all three env vars in the Vercel Project Settings -> Environment Variables:
//   CASHFREE_APP_ID
//   CASHFREE_SECRET_KEY
//   CASHFREE_ENV

// Same ceiling and validation rules as api/create-order.ts (Razorpay) —
// both gateways enforce the identical Teacher's Day contribution rules
// from shared/semesterRules.ts, independently of whichever the student picks.
const MAX_AMOUNT_INR = 500000;

const MAX_NAME_LENGTH = 100;

// Best-effort abuse protection — see api/lib/rateLimit.ts for caveats.
const RATE_LIMIT = { limit: 8, windowMs: 60_000 }; // 8 order-creation attempts / IP / minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Payment responses must never be cached by a CDN, proxy, or the browser.
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`cashfree-create-order:${ip}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  const cashfree = getCashfreeConfig();
  if (!cashfree) {
    // Log only that config is missing — never log the values themselves.
    console.error("Cashfree env vars missing: CASHFREE_APP_ID / CASHFREE_SECRET_KEY");
    return res.status(500).json({ error: "Payment service is not configured yet." });
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const { amount, studentName: rawStudentName, semester } = (body ?? {}) as {
    amount?: unknown;
    studentName?: unknown;
    semester?: unknown;
  };

  // Student name: required, trimmed, bounded length. The frontend already
  // enforces this, but the server never trusts client-side validation.
  const studentName = typeof rawStudentName === "string" ? rawStudentName.trim() : "";
  if (!studentName || studentName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: "Enter your full name." });
  }

  // Semester: required, must be one of the known values. Validated before
  // amount because the minimum allowed amount depends on the semester.
  if (!isValidSemester(semester)) {
    return res.status(400).json({ error: "Select your semester." });
  }

  // Server-side validation — the browser's amount is never trusted as-is.
  // This is the SAME rule set used by api/create-order.ts (Razorpay), from
  // the single shared source of truth in shared/semesterRules.ts, so the
  // minimum-amount enforcement can never drift between gateways.
  const minAmountForSemester = getMinAmountForSemester(semester);
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount < minAmountForSemester ||
    amount > MAX_AMOUNT_INR
  ) {
    return res.status(400).json({
      error: `Enter a valid amount of at least ₹${minAmountForSemester} for ${semester} (up to ₹5,00,000).`,
    });
  }

  // Best-effort origin for Cashfree's required return_url — used only as a
  // fallback destination for payment methods that need a full-page redirect
  // (e.g. some netbanking/UPI flows) even inside the modal checkout. The
  // actual verified outcome is always decided server-side, never by this URL.
  const origin =
    (typeof req.headers.origin === "string" && req.headers.origin) ||
    (req.headers.host ? `https://${req.headers.host}` : "https://nikhilpaharia.com");

  try {
    const orderId = `support_cf_${Date.now()}`;

    const orderRes = await fetch(`${cashfree.baseUrl}/orders`, {
      method: "POST",
      headers: cashfreeHeaders(cashfree),
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        // Cashfree requires customer_details on every order. This page
        // intentionally collects only name/semester/amount (per the
        // existing, unchanged UI), so there is no real phone number to
        // send — a placeholder is used here, same as Cashfree's own
        // sample integrations do for donation-style/no-signup flows.
        // If real customer phone numbers become available later, wire
        // them in here instead of the placeholder.
        customer_details: {
          customer_id: `guest_${Date.now()}`,
          customer_name: studentName,
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${origin}/support?cf_order_id={order_id}`,
        },
        // Custom tags, mirroring how api/create-order.ts uses Razorpay's
        // `notes` field — lets the webhook (api/cashfree/webhook.ts)
        // independently recover context without trusting the frontend.
        order_tags: {
          source: "teachers-day-2026-support-page",
          studentName: studentName.slice(0, 190),
          semester,
        },
        order_note: `Teacher's Day Celebration 2026 contribution — ${semester}`,
      }),
    });

    const orderData = (await orderRes.json()) as CashfreeOrderResponse & { message?: string };

    if (!orderRes.ok || !orderData.payment_session_id) {
      console.error("Cashfree order creation failed:", orderData?.message || `HTTP ${orderRes.status}`);
      return res.status(502).json({ error: "Could not start payment. Please try again." });
    }

    return res.status(200).json({
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
      // Tells the frontend which Cashfree SDK "mode" to initialize —
      // never the secret key, never the app id.
      cashfreeEnv: cashfree.env,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Cashfree order creation failed:", message);
    return res.status(502).json({ error: "Could not start payment. Please try again." });
  }
}

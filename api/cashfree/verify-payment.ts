import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";
import { sendNotificationEmail } from "../lib/sendEmail.js";
import { markNotifiedIfNew } from "../lib/sentPayments.js";
import { isValidSemester } from "../../shared/semesterRules.js";
import { getCashfreeConfig, cashfreeHeaders, type CashfreeOrderResponse, type CashfreeOrderPayment } from "../lib/cashfree.js";

const MAX_NAME_LENGTH = 100;

// Verifies a Cashfree order by asking Cashfree's own API for its real,
// current status. Unlike Razorpay's checkout, Cashfree's Drop-in/hosted
// checkout does NOT hand the frontend a signed payload to check — so
// there is nothing for the browser to "prove" here. This endpoint is
// instead the single source of truth by construction: it takes only an
// order id from the frontend, then fetches that order's status directly
// from Cashfree using our server-only secret key. The frontend can never
// mark a payment successful on its own.

// Best-effort abuse protection — see api/lib/rateLimit.ts for caveats.
const RATE_LIMIT = { limit: 15, windowMs: 60_000 }; // 15 verify attempts / IP / minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ verified: false, error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`cashfree-verify-payment:${ip}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    return res.status(429).json({ verified: false, error: "Too many requests. Please wait a moment." });
  }

  const cashfree = getCashfreeConfig();
  if (!cashfree) {
    console.error("Cashfree env vars missing: CASHFREE_APP_ID / CASHFREE_SECRET_KEY");
    return res.status(500).json({ verified: false, error: "Payment service is not configured yet." });
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ verified: false, error: "Invalid request body." });
  }

  const {
    orderId,
    studentName: rawStudentName,
    semester,
    amount,
  } = (body ?? {}) as {
    orderId?: unknown;
    studentName?: unknown;
    semester?: unknown;
    amount?: unknown;
  };

  if (typeof orderId !== "string" || !orderId) {
    return res.status(400).json({ verified: false, error: "Missing order details." });
  }

  // Student info is used only for the confirmation email — same as
  // api/verify-payment.ts (Razorpay) — it plays no role in the actual
  // verification, which is entirely server-to-server against Cashfree.
  const studentName =
    typeof rawStudentName === "string" && rawStudentName.trim().length > 0 && rawStudentName.trim().length <= MAX_NAME_LENGTH
      ? rawStudentName.trim()
      : "Anonymous Student";
  const semesterLabel = isValidSemester(semester) ? semester : "Not specified";
  const amountLabel = typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? amount : null;

  try {
    // --- Step 1: fetch the order itself (authoritative order_status) ---
    const orderRes = await fetch(`${cashfree.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
      headers: cashfreeHeaders(cashfree),
    });

    if (!orderRes.ok) {
      console.warn("Cashfree order fetch failed during verification", { orderId, status: orderRes.status });
      return res.status(400).json({ verified: false, error: "Payment could not be verified." });
    }

    const order = (await orderRes.json()) as CashfreeOrderResponse;

    if (order.order_status !== "PAID") {
      // ACTIVE = still pending/in progress, EXPIRED/TERMINATED = failed or
      // abandoned. Either way, this is not a completed, successful payment.
      return res.status(400).json({ verified: false, error: "Payment was not completed." });
    }

    // --- Step 2: fetch the order's payments and find the successful one ---
    // order_status === "PAID" implies a successful payment exists, but we
    // still fetch it explicitly to get the real cf_payment_id for the
    // email/receipt rather than inventing one from the order id.
    const paymentsRes = await fetch(`${cashfree.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`, {
      headers: cashfreeHeaders(cashfree),
    });

    if (!paymentsRes.ok) {
      console.warn("Cashfree payments fetch failed during verification", { orderId, status: paymentsRes.status });
      return res.status(400).json({ verified: false, error: "Payment could not be verified." });
    }

    const payments = (await paymentsRes.json()) as CashfreeOrderPayment[];
    const successfulPayment = Array.isArray(payments)
      ? payments.find((p) => p.payment_status === "SUCCESS")
      : undefined;

    if (!successfulPayment) {
      // Should be practically impossible given order_status === "PAID",
      // but never treat an order as verified without an actual successful
      // payment record behind it.
      console.warn("Cashfree order PAID but no SUCCESS payment found", { orderId });
      return res.status(400).json({ verified: false, error: "Payment could not be verified." });
    }

    const paymentId = String(successfulPayment.cf_payment_id);

    // --- Step 3: verified-payment notification email ---
    // Reached ONLY after Cashfree's own API confirmed order_status === "PAID"
    // and a matching SUCCESS payment record above. Prefixed key keeps this
    // dedup namespace separate from Razorpay payment ids in the same Set.
    if (markNotifiedIfNew(`cashfree:${paymentId}`)) {
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const amountText = amountLabel !== null ? `₹${amountLabel}` : "Amount unavailable";

      const emailBody = [
        "Teacher's Day Celebration 2026",
        "",
        "A new contribution has been successfully received.",
        "",
        `Student Name: ${studentName}`,
        `Semester: ${semesterLabel}`,
        `Amount: ${amountText}`,
        `Payment ID: ${paymentId}`,
        `Order ID: ${orderId}`,
        "Payment Status: Verified",
        `Payment Gateway: Cashfree`,
        `Date/Time: ${timestamp} (IST)`,
        "",
        "This payment was made for the student-organized Teacher's Day Celebration 2026.",
      ].join("\n");

      const emailResult = await sendNotificationEmail({
        subject: `Teacher's Day Contribution Received — ${studentName}`,
        text: emailBody,
      });

      if (!emailResult.sent) {
        console.error("Verified Cashfree payment succeeded but notification email failed:", emailResult.error);
      }
    }

    return res.status(200).json({ verified: true, paymentId, orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Cashfree payment verification failed:", message);
    return res.status(502).json({ verified: false, error: "Payment could not be verified." });
  }
}

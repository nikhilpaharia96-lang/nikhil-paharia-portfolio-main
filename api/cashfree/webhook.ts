import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import crypto from "crypto";
import { sendNotificationEmail } from "../lib/sendEmail.js";
import { markNotifiedIfNew } from "../lib/sentPayments.js";
import { getCashfreeConfig } from "../lib/cashfree.js";

// OPTIONAL, defense-in-depth only. api/cashfree/verify-payment.ts (called
// by the frontend right after checkout) is already the authoritative check
// — it asks Cashfree's API directly for the order's real status. This
// webhook exists purely to still deliver the confirmation email in the
// rare case the browser tab closes/loses connection before that call
// completes (e.g. a successful payment on a flaky mobile network).
// markNotifiedIfNew() below ensures the email is never sent twice even if
// both this webhook AND verify-payment fire for the same payment.
//
// Configure this URL in the Cashfree Dashboard -> Developers -> Webhooks
// (e.g. https://<your-domain>/api/cashfree/webhook), subscribed to the
// "PAYMENT_SUCCESS_WEBHOOK" event. Optional — if it's never configured,
// verify-payment.ts alone is sufficient for correctness.

// Vercel Node functions parse JSON bodies by default; disabling that here
// is required because Cashfree's signature is computed over the *exact*
// raw request bytes, not a re-serialized version of the parsed JSON.
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(readable: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

interface CashfreeWebhookPayload {
  type?: string;
  data?: {
    order?: {
      order_id?: string;
      order_tags?: Record<string, string> | null;
    };
    payment?: {
      cf_payment_id?: string | number;
      payment_status?: string;
      payment_amount?: number;
      payment_time?: string;
    };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cashfree = getCashfreeConfig();
  if (!cashfree) {
    console.error("Cashfree env vars missing: CASHFREE_APP_ID / CASHFREE_SECRET_KEY");
    return res.status(500).json({ error: "Payment service is not configured yet." });
  }

  const rawBody = await readRawBody(req);

  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];

  if (typeof signature !== "string" || typeof timestamp !== "string" || !signature || !timestamp) {
    return res.status(400).json({ error: "Missing webhook signature." });
  }

  // Per Cashfree docs: signedPayload = timestamp + rawBody,
  // expectedSignature = base64(HMAC_SHA256(signedPayload, secretKey)).
  const expectedSignature = crypto
    .createHmac("sha256", cashfree.secretKey)
    .update(timestamp + rawBody)
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  const isValid =
    expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    // Log identifiers only — never the secret, never the signatures.
    console.warn("Cashfree webhook signature verification failed");
    return res.status(400).json({ error: "Invalid webhook signature." });
  }

  let payload: CashfreeWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }

  // Only act on successful payments. Other event types (failed, dropped,
  // refunds, etc.) are acknowledged but intentionally ignored here, since
  // the only job of this endpoint is the same confirmation email that
  // verify-payment.ts already sends on success.
  if (payload.type !== "PAYMENT_SUCCESS_WEBHOOK") {
    return res.status(200).json({ received: true, ignored: true });
  }

  const payment = payload.data?.payment;
  const order = payload.data?.order;

  if (!payment?.cf_payment_id || payment.payment_status !== "SUCCESS") {
    return res.status(200).json({ received: true, ignored: true });
  }

  const paymentId = String(payment.cf_payment_id);
  const orderId = order?.order_id || "Unknown";
  const studentName = order?.order_tags?.studentName || "Anonymous Student";
  const semesterLabel = order?.order_tags?.semester || "Not specified";
  const amountLabel = typeof payment.payment_amount === "number" ? `₹${payment.payment_amount}` : "Amount unavailable";

  // Same dedup namespace/key as api/cashfree/verify-payment.ts, so whichever
  // of the two (webhook or frontend-triggered verify) arrives first sends
  // the email, and the other is a safe no-op.
  if (markNotifiedIfNew(`cashfree:${paymentId}`)) {
    const timestampLabel = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const emailBody = [
      "Teacher's Day Celebration 2026",
      "",
      "A new contribution has been successfully received.",
      "",
      `Student Name: ${studentName}`,
      `Semester: ${semesterLabel}`,
      `Amount: ${amountLabel}`,
      `Payment ID: ${paymentId}`,
      `Order ID: ${orderId}`,
      "Payment Status: Verified",
      `Payment Gateway: Cashfree`,
      `Date/Time: ${timestampLabel} (IST)`,
      "",
      "This payment was made for the student-organized Teacher's Day Celebration 2026.",
    ].join("\n");

    const emailResult = await sendNotificationEmail({
      subject: `Teacher's Day Contribution Received — ${studentName}`,
      text: emailBody,
    });

    if (!emailResult.sent) {
      console.error("Verified Cashfree webhook payment succeeded but notification email failed:", emailResult.error);
    }
  }

  return res.status(200).json({ received: true });
}

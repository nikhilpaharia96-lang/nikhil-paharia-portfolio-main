import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import crypto from "crypto";
import { BookingError, confirmPayment, recordFailure } from "../_lib/bookingService.js";
import { buildDeps } from "../_lib/bookingRuntime.js";

// Safety net: Razorpay calls this even if the client closes the tab before /verify-payment runs.
// Dashboard → Settings → Webhooks → https://<site>/api/booking/webhook
// Events: payment.captured, payment.failed · Secret = RAZORPAY_WEBHOOK_SECRET.
// Shares confirmPayment() with verify-payment, so a payment is applied exactly once.

export const config = { api: { bodyParser: false } };

async function readRawBody(readable: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString("utf8");
}

type Entity = { id?: string; order_id?: string; error_description?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret || !keyId || !keySecret) return res.status(500).json({ error: "Webhook is not configured." });

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-razorpay-signature"];
  if (typeof signature !== "string" || !signature) return res.status(400).json({ error: "Missing webhook signature." });
  const expected = Buffer.from(crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return res.status(400).json({ error: "Invalid webhook signature." });
  }

  let payload: { event?: string; payload?: { payment?: { entity?: Entity } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }
  const pay = payload.payload?.payment?.entity;
  if (!pay?.id || !pay.order_id) return res.status(200).json({ received: true, ignored: true });

  try {
    const deps = buildDeps(keyId, keySecret);
    if (payload.event === "payment.captured") {
      await confirmPayment(deps, { orderId: pay.order_id, paymentId: pay.id, signature: null });
    } else if (payload.event === "payment.failed") {
      await recordFailure(deps, { orderId: pay.order_id, paymentId: pay.id, reason: pay.error_description || "Payment failed at the gateway." });
    } else {
      return res.status(200).json({ received: true, ignored: true });
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    // Not one of our bookings (e.g. a donation order) → acknowledge so Razorpay stops retrying.
    if (err instanceof BookingError && err.status === 404) return res.status(200).json({ received: true, ignored: true });
    console.error("Booking webhook failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Webhook processing failed." });
  }
}

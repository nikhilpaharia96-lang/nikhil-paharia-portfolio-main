import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import crypto from "crypto";
import Razorpay from "razorpay";
import { markNotifiedIfNew } from "../lib/sentPayments.js";
import { notifyBooking } from "../lib/bookingEmail.js";

// OPTIONAL safety net: Razorpay calls this after a captured payment, so the Gmail alert is
// still sent if the client closes the tab before /api/booking/verify-payment runs. The same
// dedup key as verify-payment means only ONE email goes out per payment.
//
// Razorpay Dashboard → Settings → Webhooks → URL: https://<your-site>/api/booking/webhook
// Event: payment.captured · Secret: set the same value as RAZORPAY_WEBHOOK_SECRET in Vercel.

export const config = { api: { bodyParser: false } };

async function readRawBody(readable: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString("utf8");
}

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

  let payload: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }

  const pay = payload.payload?.payment?.entity;
  if (payload.event !== "payment.captured" || !pay?.id || !pay.order_id) {
    return res.status(200).json({ received: true, ignored: true });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.fetch(pay.order_id);
    const notes = (order.notes ?? {}) as Record<string, string>;
    if (notes.source !== "service-booking") return res.status(200).json({ received: true, ignored: true });

    if (markNotifiedIfNew(`razorpay:${pay.id}`)) {
      await notifyBooking({
        tags: notes,
        paymentId: pay.id,
        orderId: pay.order_id,
        tokenPaid: Number(pay.amount ?? 0) / 100,
      });
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Booking webhook failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Webhook processing failed." });
  }
}

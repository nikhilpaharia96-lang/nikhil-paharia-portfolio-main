import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Readable } from "node:stream";
import { BookingError, confirmUpiPayment, recordFailure } from "../_lib/bookingService.js";
import { buildUpiDeps, upiEnabled } from "../_lib/bookingRuntime.js";
import { verifyUpiWebhook } from "../_lib/upiGateway.js";

// Safety net for the UPI Gateway: it calls this even if the customer never returns to the site.
// Gateway dashboard → API & Webhooks → URL: https://<site>/api/booking/upi-webhook  (Live secret = UPI_GATEWAY_WEBHOOK_SECRET)
// The signature only proves the call is from the gateway. Money is never trusted from the body: confirmUpiPayment()
// re-reads the order from the gateway API and checks status, currency and exact amount. Delivery is at-least-once and
// may be out of order — confirmUpiPayment is idempotent, so duplicates and reordering are harmless.

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
  const secret = process.env.UPI_GATEWAY_WEBHOOK_SECRET;
  if (!secret || !upiEnabled()) return res.status(500).json({ error: "Webhook is not configured." });

  const rawBody = await readRawBody(req);
  const sig = req.headers["x-signature"];
  if (!verifyUpiWebhook(rawBody, typeof sig === "string" ? sig : undefined, secret)) {
    return res.status(401).json({ error: "Invalid webhook signature." });
  }

  let payload: { event?: string; data?: { order_id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }
  const orderId = payload.data?.order_id;
  if (typeof orderId !== "string" || !orderId) return res.status(200).json({ received: true, ignored: true });

  try {
    const deps = buildUpiDeps();
    if (payload.event === "order.paid") {
      await confirmUpiPayment(deps, { orderId });
    } else if (payload.event === "order.expired") {
      await recordFailure(deps, { orderId, reason: "Payment link expired before payment." });
    } else {
      return res.status(200).json({ received: true, ignored: true }); // under_review etc. — nothing to do yet
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    // Not one of our bookings → acknowledge so the gateway stops retrying. Still pending/review → ask for a retry.
    if (err instanceof BookingError && err.status === 404) return res.status(200).json({ received: true, ignored: true });
    if (err instanceof BookingError && err.status < 500 && err.status !== 409) return res.status(200).json({ received: true, ignored: true });
    console.error("UPI webhook failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Webhook processing failed." });
  }
}

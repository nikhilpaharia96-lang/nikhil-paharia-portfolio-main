import crypto from "node:crypto";
import { bookingRef, type Booking, type PaymentRecord } from "../../shared/booking.js";

/**
 * Optional bridge to the self-hosted WhatsApp AI assistant (n8n): after a booking token is
 * verified, POST a signed "booking.confirmed" event so n8n can WhatsApp the client, mark them as
 * a client and give the assistant booking context.
 *
 * Env (both required, otherwise this is a silent no-op):
 *   N8N_BOOKING_WEBHOOK_URL     https://n8n.yourdomain.com/webhook/booking-confirmed
 *   N8N_BOOKING_WEBHOOK_SECRET  16+ chars, identical to BOOKING_WEBHOOK_SECRET in the n8n .env
 *
 * Security / privacy:
 *  - Body is HMAC-SHA256 signed: `sha256=` + HMAC(secret, `${timestamp}.${rawBody}`); n8n rejects
 *    bad signatures and timestamps older than 5 minutes (replay protection).
 *  - Only what n8n needs is sent: no email and NO free-text project description (that text is
 *    client-controlled and would end up in the AI's prompt).
 *  - Never throws and never blocks a verified booking: failures are logged without personal data.
 */

export interface N8nPayload {
  event: "booking.confirmed";
  resend: boolean;
  booking: {
    ref: string;
    paymentId: string;
    name: string;
    company: string;
    /** E.164, e.g. +919876543210 */
    phone: string;
    service: string;
    total: number;
    token: number;
    startAdvance: number;
    remaining: number;
    tokenPercent: number;
    startPercent: number;
    remainingPercent: number;
    startDate: string;
  };
}

const oneLine = (s: string, max: number) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export function buildPayload(b: Booking, p: PaymentRecord, resend = false): N8nPayload {
  return {
    event: "booking.confirmed",
    resend,
    booking: {
      ref: bookingRef(b.id),
      paymentId: p.razorpayPaymentId ?? p.id,
      name: oneLine(b.name, 60),
      company: oneLine(b.company, 60),
      phone: `+91${b.phone}`,
      service: b.serviceTitle,
      total: b.quote.total,
      token: b.quote.token,
      startAdvance: b.quote.startAdvance,
      remaining: b.quote.remaining,
      tokenPercent: b.quote.tokenPercent,
      startPercent: b.quote.startPercent,
      remainingPercent: b.quote.remainingPercent,
      startDate: b.startDate,
    },
  };
}

export const signPayload = (secret: string, timestamp: string, rawBody: string) =>
  `sha256=${crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")}`;

export function n8nConfigured(env = process.env): boolean {
  const url = env.N8N_BOOKING_WEBHOOK_URL ?? "";
  const local = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);
  return (url.startsWith("https://") || local) && (env.N8N_BOOKING_WEBHOOK_SECRET?.length ?? 0) >= 16;
}

export async function notifyN8n(
  b: Booking,
  p: PaymentRecord,
  opts: { resend?: boolean; timeoutMs?: number; now?: () => number } = {},
): Promise<{ sent: boolean; error?: string }> {
  if (!n8nConfigured()) return { sent: false, error: "n8n bridge is not configured." };
  const url = process.env.N8N_BOOKING_WEBHOOK_URL as string;
  const secret = process.env.N8N_BOOKING_WEBHOOK_SECRET as string;

  const body = JSON.stringify(buildPayload(b, p, opts.resend ?? false));
  const timestamp = String((opts.now ?? Date.now)());
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Booking-Timestamp": timestamp,
        "X-Booking-Signature": signPayload(secret, timestamp, body),
      },
      body,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error("[n8n] webhook responded", res.status);
      return { sent: false, error: `n8n responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    const reason = (err as Error)?.name === "AbortError" ? "timeout" : "network error";
    console.error("[n8n] webhook failed:", reason);
    return { sent: false, error: reason };
  } finally {
    clearTimeout(timer);
  }
}

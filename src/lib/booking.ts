import { loadRazorpayScript } from "@/lib/loadRazorpayScript";
import type { BookingInput, FieldErrors } from "../../shared/booking";

export type { BookingInput, FieldErrors };

export interface BookingReceipt {
  paymentId: string;
  orderId: string;
  ref: string;
  service: string;
  total: number;
  token: number;
  startAdvance: number;
  remaining: number;
}

export class PaymentError extends Error {
  /** true when the visitor closed / abandoned the checkout (not a hard failure) */
  cancelled: boolean;
  fieldErrors?: FieldErrors;
  constructor(message: string, cancelled = false, fieldErrors?: FieldErrors) {
    super(message);
    this.cancelled = cancelled;
    this.fieldErrors = fieldErrors;
  }
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (data === null) {
    throw new PaymentError(
      res.status >= 500
        ? "The payment service is temporarily unavailable (server busy). Please try again in a minute."
        : "Something went wrong. Please try again.",
    );
  }
  return { ok: res.ok, status: res.status, data };
}

/** Verify with a couple of retries on network / 5xx errors, so a flaky connection after paying doesn't lose the confirmation. */
async function verifyWithRetry(payload: unknown): Promise<BookingReceipt> {
  let lastErr: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      const v = await postJson("/api/booking/verify-payment", payload);
      if (v.ok && v.data.verified === true) return v.data as BookingReceipt;
      if (v.status < 500 && v.status !== 429) throw new PaymentError(v.data?.error || "We couldn't verify this payment.");
      lastErr = new PaymentError(v.data?.error || "We couldn't verify this payment.");
    } catch (e) {
      if (e instanceof PaymentError && !/temporarily unavailable|Something went wrong/.test(e.message)) throw e;
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
  }
  throw lastErr instanceof PaymentError
    ? lastErr
    : new PaymentError("We couldn't confirm your payment yet. If you were charged, your booking will be confirmed automatically — or contact me.");
}

export interface PayOptions {
  /** Reuse the lead from an earlier attempt so a retry doesn't create a duplicate. */
  leadId?: string;
  onLead?: (leadId: string) => void;
  /** Hidden anti-bot field; must stay empty for real visitors. */
  honeypot?: string;
}

/**
 *   1. POST /api/booking/create-order   → server validates, saves the lead, computes the token, creates the Razorpay order
 *   2. Razorpay Checkout (modal)
 *   3. POST /api/booking/verify-payment → server checks signature + re-reads the payment from Razorpay + exact amount
 * Success can only come from step 3's `verified: true`.
 */
export async function payBookingToken(input: BookingInput, opts: PayOptions = {}): Promise<BookingReceipt> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) throw new PaymentError("Could not load the payment window. Check your connection and try again.");

  const order = await postJson("/api/booking/create-order", { ...input, leadId: opts.leadId, companyWebsite: opts.honeypot ?? "" }).catch((e) => {
    throw e instanceof PaymentError ? e : new PaymentError("Could not reach the payment service. Check your connection and try again.");
  });
  if (!order.ok) throw new PaymentError(order.data?.error || "Could not start payment.", false, order.data?.fieldErrors);
  if (order.data.leadId) opts.onLead?.(order.data.leadId);
  const Razorpay = window.Razorpay;

  return new Promise<BookingReceipt>((resolve, reject) => {
    let handled = false;
    let lastFailure = "";
    const rzp = new Razorpay({
      key: order.data.keyId,
      amount: order.data.amount,
      currency: order.data.currency,
      order_id: order.data.orderId,
      name: "Nikhil Paharia",
      description: `Booking token — ${order.data.serviceTitle}`,
      theme: { color: "#1266F1" },
      prefill: { name: input.name, email: input.email, contact: input.phone },
      handler: async (response) => {
        handled = true;
        try {
          resolve(await verifyWithRetry(response));
        } catch (e) {
          reject(e instanceof PaymentError ? e : new PaymentError("We couldn't verify this payment. If you were charged, please contact me."));
        }
      },
      modal: {
        ondismiss: () => {
          if (handled) return;
          reject(
            lastFailure
              ? new PaymentError(`Payment failed: ${lastFailure}. You haven't been charged — please try again.`)
              : new PaymentError("Payment was not completed.", true),
          );
        },
      },
    });
    // Razorpay's own window shows the error and lets the visitor retry inside it, so we only remember the reason.
    rzp.on("payment.failed", (r) => {
      lastFailure = (r as { error?: { description?: string } })?.error?.description ?? "the payment was declined";
    });
    rzp.open();
  });
}

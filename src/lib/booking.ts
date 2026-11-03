import { loadCashfreeScript } from "@/lib/loadCashfreeScript";

export interface BookingInput {
  service: string; // slug
  total: number;
  name: string;
  email: string;
  phone: string;
  requirements: string;
}

export interface BookingReceipt {
  paymentId: string;
  orderId: string;
  service: string;
  total: number;
  token: number;
  startAdvance: number;
  remaining: number;
}

export class PaymentError extends Error {
  /** true when the visitor closed / abandoned the checkout (not a hard failure) */
  cancelled: boolean;
  constructor(message: string, cancelled = false) {
    super(message);
    this.cancelled = cancelled;
  }
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/**
 * Pays the 5% booking token through the portfolio's existing Cashfree integration.
 *
 *   1. POST /api/cashfree/create-booking-order  → server computes the token, creates the order
 *   2. Cashfree checkout (modal)
 *   3. POST /api/cashfree/verify-booking-payment → server asks Cashfree if the order is PAID,
 *      saves the booking details in the Cashfree order and emails the admin
 *
 * The success state can only come from step 3's `verified: true`.
 */
export async function payBookingToken(input: BookingInput): Promise<BookingReceipt> {
  const loaded = await loadCashfreeScript();
  if (!loaded || !window.Cashfree) {
    throw new PaymentError("Could not load the payment window. Check your connection and try again.");
  }

  const order = await postJson("/api/cashfree/create-booking-order", input);
  if (!order.ok) throw new PaymentError(order.data?.error || "Could not start payment.");

  const cashfree = window.Cashfree({ mode: order.data.cashfreeEnv === "PRODUCTION" ? "production" : "sandbox" });
  await cashfree.checkout({ paymentSessionId: order.data.paymentSessionId, redirectTarget: "_modal" });

  const verify = await postJson("/api/cashfree/verify-booking-payment", {
    orderId: order.data.orderId,
    requirements: input.requirements,
  });
  if (verify.ok && verify.data.verified === true) return verify.data as BookingReceipt;

  throw new PaymentError(verify.data?.error || "We couldn't verify this payment.", verify.data?.error === "Payment was not completed.");
}

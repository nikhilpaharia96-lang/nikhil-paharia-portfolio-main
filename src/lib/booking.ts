import { loadRazorpayScript } from "@/lib/loadRazorpayScript";

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
  const data = await res.json().catch(() => null);
  // A gateway/proxy error page (HTML, not our JSON) → friendly message instead of a raw failure.
  if (data === null) {
    throw new PaymentError(
      res.status >= 500
        ? "The payment service is temporarily unavailable (server busy). Please try again in a minute."
        : "Something went wrong. Please try again.",
    );
  }
  return { ok: res.ok, data };
}

/**
 * Pays the 5% booking token through the portfolio's existing Razorpay integration.
 *
 *   1. POST /api/booking/create-order    → server computes the token and creates the Razorpay order
 *   2. Razorpay Checkout (modal)
 *   3. POST /api/booking/verify-payment  → server checks the signature, re-reads the order and
 *      payment from Razorpay, and emails the admin
 *
 * The success state can only come from step 3's `verified: true`.
 */
export async function payBookingToken(input: BookingInput): Promise<BookingReceipt> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new PaymentError("Could not load the payment window. Check your connection and try again.");
  }

  const order = await postJson("/api/booking/create-order", input).catch((e) => {
    throw e instanceof PaymentError ? e : new PaymentError("Could not reach the payment service. Check your connection and try again.");
  });
  if (!order.ok) throw new PaymentError(order.data?.error || "Could not start payment.");
  const Razorpay = window.Razorpay;

  return new Promise<BookingReceipt>((resolve, reject) => {
    let handled = false;
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
          const verify = await postJson("/api/booking/verify-payment", { ...response, requirements: input.requirements });
          if (verify.ok && verify.data.verified === true) resolve(verify.data as BookingReceipt);
          else reject(new PaymentError(verify.data?.error || "We couldn't verify this payment."));
        } catch {
          reject(new PaymentError("We couldn't verify this payment. If you were charged, please contact me."));
        }
      },
      modal: {
        ondismiss: () => {
          if (!handled) reject(new PaymentError("Payment was not completed.", true));
        },
      },
    });
    rzp.on("payment.failed", () => {
      handled = true;
      reject(new PaymentError("Payment failed. You haven't been charged — please try again."));
    });
    rzp.open();
  });
}

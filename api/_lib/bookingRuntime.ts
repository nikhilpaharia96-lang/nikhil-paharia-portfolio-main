import Razorpay from "razorpay";
import { normalizeSplit } from "../../shared/servicePricing.js";
import { getStore } from "./bookingStore.js";
import { notifyBooking } from "./bookingEmail.js";
import type { Deps, Gateway } from "./bookingService.js";

/** Wires the real Razorpay SDK, the real store and the real notifications into the service layer. */
export function razorpayGateway(keyId: string, keySecret: string): Gateway {
  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return {
    async createOrder({ amountPaise, receipt, notes }) {
      const make = () => rzp.orders.create({ amount: amountPaise, currency: "INR", receipt, payment_capture: true, notes });
      let order;
      try {
        order = await make();
      } catch (first) {
        // Razorpay's gateway occasionally answers 502/503 for a moment — retry once.
        if (((first as { statusCode?: number }).statusCode ?? 0) < 500) throw first;
        await new Promise((r) => setTimeout(r, 700));
        order = await make();
      }
      return { id: order.id, amount: Number(order.amount), currency: order.currency };
    },
    async fetchPayment(id) {
      const p = await rzp.payments.fetch(id);
      return { id: p.id, order_id: p.order_id, status: p.status, amount: Number(p.amount), currency: p.currency };
    },
  };
}

export function buildDeps(keyId: string, keySecret: string): Deps {
  return {
    store: getStore(),
    gateway: razorpayGateway(keyId, keySecret),
    split: normalizeSplit(process.env.BOOKING_TOKEN_PERCENT, process.env.START_ADVANCE_PERCENT),
    notify: async (b, p) => {
      await notifyBooking({
        tags: {
          source: "service-booking",
          service: b.service,
          total: String(b.quote.total),
          token_pct: String(b.quote.tokenPercent),
          start_pct: String(b.quote.startPercent),
          name: b.name,
          email: b.email,
          phone: b.phone,
          company: b.company,
          website_type: b.websiteType,
          start_date: b.startDate,
        },
        paymentId: p.razorpayPaymentId ?? p.id,
        orderId: p.razorpayOrderId ?? "",
        tokenPaid: p.amount,
        requirements: b.description,
      });
    },
  };
}

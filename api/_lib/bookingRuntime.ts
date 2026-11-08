import Razorpay from "razorpay";
import { normalizeSplit } from "../../shared/servicePricing.js";
import { getStore } from "./bookingStore.js";
import { notifyBooking } from "./bookingEmail.js";
import type { Deps, Gateway } from "./bookingService.js";
import type { Booking, PaymentRecord } from "../../shared/booking.js";
import { notifyN8n } from "./n8nHook.js";
import { sendNotificationEmail } from "./sendEmail.js";
import { bookingRef } from "../../shared/booking.js";

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

/** Sends the owner alert, client quotation email and WhatsApp PDF for a paid booking (best effort). */
export async function notifyForBooking(b: Booking, p: PaymentRecord, opts: { resend?: boolean } = {}): Promise<void> {
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
  // Optional: WhatsApp the client + feed the AI assistant via n8n (no-op unless configured; never throws).
  await notifyN8n(b, p, { resend: opts.resend });
}

/** Owner alert for a no-payment enquiry. Plain text only (the description is client-controlled). */
export async function notifyInquiryForBooking(b: Booking): Promise<void> {
  const text = [
    `New enquiry — ${b.serviceTitle}`,
    `Ref: ${bookingRef(b.id)}`,
    `Source: ${b.source || "direct"}`,
    "",
    `Name: ${b.name}${b.company ? ` (${b.company})` : ""}`,
    `WhatsApp: +91${b.phone}`,
    `Email: ${b.email}`,
    `Budget: ₹${b.budget.toLocaleString("en-IN")}`,
    ...(b.websiteType ? [`Website type: ${b.websiteType}`] : []),
    ...(b.startDate ? [`Preferred start: ${b.startDate}`] : []),
    "",
    "Project:",
    b.description,
    "",
    "Reply fast — enquiries convert best within the hour. Manage it in /admin.",
  ].join("\n");
  await sendNotificationEmail({ subject: `New enquiry: ${b.serviceTitle} — ${b.name} (₹${b.budget.toLocaleString("en-IN")})`, text, replyTo: b.email });
}

/** Enquiries never touch Razorpay, so they get a gateway that refuses to be used. */
export function buildInquiryDeps(): Deps {
  return {
    store: getStore(),
    gateway: { createOrder: async () => { throw new Error("not available"); }, fetchPayment: async () => { throw new Error("not available"); } },
    split: normalizeSplit(process.env.BOOKING_TOKEN_PERCENT, process.env.START_ADVANCE_PERCENT),
    notifyInquiry: notifyInquiryForBooking,
  };
}

export function buildDeps(keyId: string, keySecret: string): Deps {
  return {
    store: getStore(),
    gateway: razorpayGateway(keyId, keySecret),
    split: normalizeSplit(process.env.BOOKING_TOKEN_PERCENT, process.env.START_ADVANCE_PERCENT),
    notify: notifyForBooking,
  };
}

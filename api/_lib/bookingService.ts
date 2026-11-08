import crypto from "node:crypto";
import {
  validateBookingInput,
  bookingRef,
  type Booking,
  type BookingStatus,
  type FieldErrors,
  type PaymentRecord,
} from "../../shared/booking.js";
import { SERVICE_PRICES, computeQuote, normalizeSplit, type ServiceSlug, type SplitPercents } from "../../shared/servicePricing.js";
import type { BookingStore } from "./bookingStore.js";

/**
 * The payment-critical logic, kept free of HTTP and of the Razorpay SDK so it can be unit-tested
 * with a fake gateway and a real HMAC. The Vercel handlers are thin wrappers around this.
 *
 * Guarantees:
 *  - The amount charged is computed HERE from the client's budget — never taken from the browser.
 *  - A booking becomes "paid / Booking Confirmed" ONLY after (a) the HMAC signature (browser path)
 *    and (b) a server-to-server fetch of the payment from Razorpay agree on order, status, currency
 *    and the exact expected amount.
 *  - Each Razorpay payment id is applied at most once (atomic claim), however many times the
 *    browser, a retry and the webhook all race — so no double records and no double emails.
 */

export class BookingError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

export interface GatewayPayment {
  id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
}

export interface Gateway {
  createOrder(args: {
    amountPaise: number;
    receipt: string;
    notes: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }>;
  fetchPayment(paymentId: string): Promise<GatewayPayment>;
}

export interface Deps {
  store: BookingStore;
  gateway: Gateway;
  split?: SplitPercents;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  /** Best-effort side effects (emails / WhatsApp). Failures never undo a verified payment. */
  notify?: (booking: Booking, payment: PaymentRecord) => Promise<void>;
  /** Owner alert for a no-payment enquiry (best effort). */
  notifyInquiry?: (booking: Booking) => Promise<void>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLAIM_TTL = 60 * 60 * 24 * 90;
const iso = (deps: Deps) => new Date((deps.now ?? Date.now)()).toISOString();

export interface StartResult {
  leadId: string;
  orderId: string;
  amount: number;
  currency: string;
  serviceTitle: string;
  total: number;
  token: number;
  startAdvance: number;
  remaining: number;
}

/**
 * Validates the booking, SAVES THE LEAD (so it exists even if the visitor abandons checkout) and
 * creates a Razorpay order for the booking token. Passing the `leadId` from a previous attempt
 * reuses that lead instead of creating a duplicate when a payment is retried.
 */
export async function startBooking(deps: Deps, raw: unknown, leadId?: unknown): Promise<StartResult> {
  const nowMs = (deps.now ?? Date.now)();
  const { value, errors } = validateBookingInput(raw, nowMs);
  if (!value) {
    const first = Object.values(errors)[0] ?? "Please check your details.";
    throw new BookingError(400, first, errors);
  }
  const slug = value.service as ServiceSlug;
  const quote = computeQuote(value.budget, deps.split ?? normalizeSplit());
  const ts = iso(deps);

  let booking: Booking | null = null;
  if (typeof leadId === "string" && UUID_RE.test(leadId)) {
    booking = await deps.store.get(leadId);
    if (booking?.paymentStatus === "paid") {
      throw new BookingError(409, "This booking is already confirmed — no further payment is needed.");
    }
  }
  if (!booking) {
    booking = {
      id: crypto.randomUUID(),
      createdAt: ts,
      updatedAt: ts,
      service: slug,
      serviceTitle: SERVICE_PRICES[slug].title,
      name: "",
      phone: "",
      email: "",
      company: "",
      websiteType: "",
      description: "",
      startDate: "",
      budget: 0,
      quote,
      status: "new_lead",
      paymentStatus: "pending",
      orders: [],
      payments: [],
      failures: [],
      statusHistory: [{ status: "new_lead", at: ts }],
      notes: "",
    };
  }
  // The client may have edited their details between attempts (only possible while unpaid).
  Object.assign(booking, {
    service: slug,
    serviceTitle: SERVICE_PRICES[slug].title,
    name: value.name,
    phone: value.phone,
    email: value.email,
    company: value.company,
    websiteType: value.websiteType,
    description: value.description,
    startDate: value.startDate,
    budget: value.budget,
    quote,
    paymentStatus: "pending",
    inquiry: false, // they chose to pay — no longer just an enquiry
    updatedAt: ts,
  });
  if (!booking.source && value.source) booking.source = value.source; // first touch wins
  await deps.store.save(booking); // lead captured before any payment is attempted

  const order = await deps.gateway.createOrder({
    amountPaise: quote.token * 100, // whole rupees → paise, exact
    receipt: `bk_${booking.id.slice(0, 8)}_${booking.orders.length + 1}`,
    notes: {
      source: "service-booking",
      lead: booking.id,
      service: slug,
      total: String(quote.total),
      token_pct: String(quote.tokenPercent),
      start_pct: String(quote.startPercent),
      name: value.name.slice(0, 100),
      phone: value.phone,
    },
  });

  booking.orders.push(order.id);
  booking.orderId = order.id;
  await deps.store.save(booking);
  await deps.store.linkOrder(order.id, booking.id);

  return {
    leadId: booking.id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    serviceTitle: booking.serviceTitle,
    total: quote.total,
    token: quote.token,
    startAdvance: quote.startAdvance,
    remaining: quote.remaining,
  };
}

/**
 * "Not ready to pay? Send me an enquiry." Saves the same lead record (so it shows up in /admin with its
 * source) but creates NO payment order. Reuses the lead when the visitor already started a checkout.
 */
export async function saveInquiry(deps: Deps, raw: unknown, leadId?: unknown): Promise<{ leadId: string; ref: string }> {
  const nowMs = (deps.now ?? Date.now)();
  const { value, errors } = validateBookingInput(raw, nowMs);
  if (!value) throw new BookingError(400, Object.values(errors)[0] ?? "Please check your details.", errors);
  const slug = value.service as ServiceSlug;
  const quote = computeQuote(value.budget, deps.split ?? normalizeSplit());
  const ts = iso(deps);

  let booking: Booking | null = null;
  if (typeof leadId === "string" && UUID_RE.test(leadId)) {
    booking = await deps.store.get(leadId);
    if (booking?.paymentStatus === "paid") throw new BookingError(409, "This booking is already confirmed.");
  }
  const isNew = !booking;
  booking ??= {
    id: crypto.randomUUID(), createdAt: ts, updatedAt: ts, service: slug, serviceTitle: SERVICE_PRICES[slug].title,
    name: "", phone: "", email: "", company: "", websiteType: "", description: "", startDate: "", budget: 0, quote,
    status: "new_lead", paymentStatus: "pending", orders: [], payments: [], failures: [],
    statusHistory: [{ status: "new_lead", at: ts }], notes: "",
  };
  Object.assign(booking, {
    service: slug, serviceTitle: SERVICE_PRICES[slug].title, name: value.name, phone: value.phone, email: value.email,
    company: value.company, websiteType: value.websiteType, description: value.description, startDate: value.startDate,
    budget: value.budget, quote, updatedAt: ts,
  });
  if (!booking.orders.length) booking.inquiry = true; // a lead that already opened checkout stays a checkout lead
  if (!booking.source && value.source) booking.source = value.source;
  await deps.store.save(booking);
  if (isNew) {
    try {
      await deps.notifyInquiry?.(booking);
    } catch (err) {
      console.error("[booking] inquiry notification failed:", err instanceof Error ? err.message : "unknown error");
    }
  }
  return { leadId: booking.id, ref: bookingRef(booking.id) };
}

/** What the browser receives after a verified payment. Contains no personal data. */
export interface Receipt {
  verified: true;
  paymentId: string;
  orderId: string;
  ref: string;
  service: string;
  total: number;
  token: number;
  startAdvance: number;
  remaining: number;
}

const receiptOf = (b: Booking, paymentId: string, orderId: string): Receipt => ({
  verified: true,
  paymentId,
  orderId,
  ref: bookingRef(b.id),
  service: b.serviceTitle,
  total: b.quote.total,
  token: b.quote.token,
  startAdvance: b.quote.startAdvance,
  remaining: b.quote.remaining,
});

export function signatureIsValid(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

const AUTO_ADVANCE_FROM: BookingStatus[] = ["new_lead", "contacted", "discussion"];

/**
 * Confirms a booking-token payment. Called with `signature` + `keySecret` from the browser
 * (checkout callback), or with `signature: null` from the webhook handler (which has already
 * verified the webhook's own HMAC). Safe to call any number of times for the same payment.
 */
export async function confirmPayment(
  deps: Deps,
  args: { orderId: string; paymentId: string; signature: string | null; keySecret?: string },
): Promise<Receipt> {
  const { orderId, paymentId } = args;
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  if (args.signature !== null) {
    if (!args.keySecret || !signatureIsValid(orderId, paymentId, args.signature, args.keySecret)) {
      console.warn("[booking] signature verification failed", { orderId, paymentId });
      throw new BookingError(400, "Payment could not be verified.");
    }
  }

  const booking = await deps.store.getByOrder(orderId);
  if (!booking) throw new BookingError(404, "Payment could not be verified.");

  // Server-to-server: ask Razorpay what really happened. Wait briefly if it is authorized but
  // not yet captured (auto-capture is on, so this resolves within a second or two).
  let payment = await deps.gateway.fetchPayment(paymentId);
  for (let i = 0; i < 3 && payment.status === "authorized"; i++) {
    await sleep(900);
    payment = await deps.gateway.fetchPayment(paymentId);
  }

  if (payment.order_id !== orderId) throw new BookingError(400, "Payment could not be verified.");
  if (payment.status !== "captured") {
    throw new BookingError(
      payment.status === "failed" ? 402 : 409,
      payment.status === "authorized"
        ? "Your payment is still being processed. You'll get a confirmation shortly — please don't pay again."
        : "Payment was not completed.",
    );
  }
  if (payment.currency !== "INR" || payment.amount !== booking.quote.token * 100) {
    console.error("[booking] amount/currency mismatch", { orderId, paymentId, got: payment.amount, want: booking.quote.token * 100 });
    await recordFailure(deps, { orderId, paymentId, reason: "Amount or currency mismatch — not confirmed." });
    throw new BookingError(400, "Payment could not be verified.");
  }

  // Idempotency: exactly one caller applies this payment id.
  const claimKey = `pay:${paymentId}`;
  const won = await deps.store.claim(claimKey, CLAIM_TTL);
  if (!won) {
    for (let i = 0; i < 4; i++) {
      const cur = await deps.store.get(booking.id);
      if (cur?.payments.some((p) => p.razorpayPaymentId === paymentId)) return receiptOf(cur, paymentId, orderId);
      await sleep(400);
    }
    // The winner is still writing; the payment itself is verified, so the receipt is still true.
    return receiptOf(booking, paymentId, orderId);
  }

  try {
    const fresh = (await deps.store.get(booking.id)) ?? booking; // pick up admin edits since lookup
    const ts = iso(deps);
    const alreadyPaid = fresh.payments.some((p) => p.milestone === "token");
    const record: PaymentRecord = {
      id: crypto.randomUUID(),
      milestone: "token",
      amount: payment.amount / 100,
      method: "razorpay",
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      at: ts,
      note: alreadyPaid ? "Possible duplicate payment for the same booking — consider a refund." : undefined,
    };
    fresh.payments.push(record);
    fresh.paymentStatus = "paid";
    fresh.updatedAt = ts;
    if (AUTO_ADVANCE_FROM.includes(fresh.status)) {
      fresh.status = "booking_confirmed";
      fresh.statusHistory.push({ status: "booking_confirmed", at: ts });
    }
    await deps.store.save(fresh);

    if (!alreadyPaid) {
      try {
        await deps.notify?.(fresh, record);
      } catch (err) {
        console.error("[booking] notification failed:", err instanceof Error ? err.message : "unknown error");
      }
    }
    return receiptOf(fresh, paymentId, orderId);
  } catch (err) {
    await deps.store.release(claimKey).catch(() => undefined); // let a retry / the webhook try again
    throw err;
  }
}

/** Records a failed / rejected payment attempt on the lead (shown to the admin). Never confirms anything. */
export async function recordFailure(
  deps: Deps,
  args: { orderId: string; paymentId?: string; reason: string },
): Promise<void> {
  const booking = await deps.store.getByOrder(args.orderId);
  if (!booking || booking.paymentStatus === "paid") return;
  const dup = args.paymentId && booking.failures.some((f) => f.razorpayPaymentId === args.paymentId && f.reason === args.reason);
  if (dup) return;
  booking.failures = [...booking.failures, { at: iso(deps), reason: args.reason.slice(0, 300), razorpayPaymentId: args.paymentId }].slice(-10);
  booking.paymentStatus = "failed";
  booking.updatedAt = iso(deps);
  await deps.store.save(booking);
}

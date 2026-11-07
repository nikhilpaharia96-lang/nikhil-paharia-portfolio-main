/**
 * Shared booking domain: types, the lead pipeline, input validation and the WhatsApp link builder.
 *
 * Imported by BOTH the browser (BookingDialog, admin dashboard) and the Vercel functions, so the
 * rules the visitor sees are exactly the rules the server enforces — the server still re-validates
 * everything and never trusts the browser.
 */
import { SERVICE_PRICES, isServiceSlug, validateTotal, formatINR, type ServiceSlug } from "./servicePricing.js";

/* ───────────────────────────── Lead pipeline ───────────────────────────── */

export const BOOKING_STATUSES = [
  "new_lead",
  "contacted",
  "discussion",
  "booking_confirmed",
  "project_started",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  discussion: "Discussion",
  booking_confirmed: "Booking Confirmed",
  project_started: "Project Started",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const isBookingStatus = (v: unknown): v is BookingStatus =>
  typeof v === "string" && (BOOKING_STATUSES as readonly string[]).includes(v);

export type PaymentStatus = "pending" | "paid" | "failed";
export type Milestone = "token" | "advance" | "final";

export const MILESTONE_LABELS: Record<Milestone, string> = {
  token: "Booking token",
  advance: "Project-start advance",
  final: "Final payment",
};

export interface PaymentRecord {
  /** Our own id for the record. */
  id: string;
  milestone: Milestone;
  /** Whole rupees. */
  amount: number;
  /** "razorpay" = verified server-side; "manual" = recorded by the admin (bank / UPI transfer). */
  method: "razorpay" | "manual";
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  at: string;
  note?: string;
}

export interface PaymentFailure {
  at: string;
  reason: string;
  razorpayPaymentId?: string;
}

export interface BookingQuote {
  total: number;
  tokenPercent: number;
  startPercent: number;
  remainingPercent: number;
  token: number;
  startAdvance: number;
  remaining: number;
}

export interface Booking {
  id: string;
  createdAt: string;
  updatedAt: string;
  service: ServiceSlug;
  serviceTitle: string;
  name: string;
  /** 10-digit Indian mobile, digits only. */
  phone: string;
  email: string;
  company: string;
  websiteType: string;
  description: string;
  /** ISO date (YYYY-MM-DD) or "". */
  startDate: string;
  /** The client's project budget == the total the payment split is computed from. */
  budget: number;
  quote: BookingQuote;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  /** Latest Razorpay order id. */
  orderId?: string;
  /** Every order created for this lead (a retry after a failed payment creates a new order). */
  orders: string[];
  payments: PaymentRecord[];
  failures: PaymentFailure[];
  statusHistory: { status: BookingStatus; at: string }[];
  /** Private admin notes. Never sent to the public. */
  notes: string;
}

/* ───────────────────────────── Input + validation ───────────────────────────── */

export interface BookingInput {
  service: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  websiteType: string;
  description: string;
  budget: number;
  startDate: string;
}

export type FieldErrors = Partial<Record<keyof BookingInput, string>>;

export const WEBSITE_TYPES = [
  "Business / Corporate website",
  "Portfolio website",
  "Landing page",
  "E-commerce store",
  "Blog / Content website",
  "Web app / Dashboard",
  "Other",
] as const;

/** Services where "Website Type" is meaningful (and therefore required). */
export const WEBSITE_TYPE_SERVICES: readonly string[] = ["website-development", "e-commerce-solutions"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IST_OFFSET_MS = 5.5 * 3600 * 1000;
const DAY_MS = 86_400_000;

/** Today's date in India (YYYY-MM-DD). */
export function istToday(now = Date.now()): string {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Strips control characters (keeps \n and \t) so stored text can't carry invisible junk. */
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");

/** "+91 98765 43210", "09876543210", "9876543210" → "9876543210". Returns "" if not a valid Indian mobile. */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}

export function validateBookingInput(
  raw: unknown,
  now = Date.now(),
): { value: BookingInput | null; errors: FieldErrors } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const str = (k: string) => (typeof r[k] === "string" ? clean(r[k] as string).trim() : "");
  const errors: FieldErrors = {};

  const service = str("service");
  const name = str("name").replace(/\s+/g, " ");
  const email = str("email").toLowerCase();
  const phone = normalizePhone(typeof r.phone === "string" ? r.phone : "");
  const company = str("company").replace(/\s+/g, " ");
  const websiteType = str("websiteType");
  const description = str("description");
  const startDate = str("startDate");
  const budgetRaw = typeof r.budget === "string" ? Number(r.budget.replace(/[^\d]/g, "")) : r.budget;
  const budget = typeof budgetRaw === "number" ? budgetRaw : NaN;

  if (!isServiceSlug(service)) errors.service = "Please choose a service.";

  if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > 100) errors.name = "Name is too long.";

  if (!phone) errors.phone = "Enter a valid 10-digit WhatsApp number.";

  if (!EMAIL_RE.test(email) || email.length > 120) errors.email = "Enter a valid email address.";

  if (company.length > 100) errors.company = "Company name is too long (max 100 characters).";

  if (websiteType && !(WEBSITE_TYPES as readonly string[]).includes(websiteType)) {
    errors.websiteType = "Choose a website type from the list.";
  } else if (WEBSITE_TYPE_SERVICES.includes(service) && !websiteType) {
    errors.websiteType = "Choose a website type.";
  }

  if (description.length < 10) errors.description = "Tell me a little about the project (min 10 characters).";
  else if (description.length > 2000) errors.description = "Description is too long (max 2000 characters).";

  if (isServiceSlug(service)) {
    const budgetError = validateTotal(service, budget);
    if (budgetError) errors.budget = budgetError;
  } else if (!Number.isInteger(budget)) {
    errors.budget = "Enter your project budget.";
  }

  if (startDate) {
    const today = istToday(now);
    const max = istToday(now + 365 * DAY_MS);
    if (!DATE_RE.test(startDate) || Number.isNaN(Date.parse(startDate))) errors.startDate = "Enter a valid date.";
    else if (startDate < today) errors.startDate = "The starting date can't be in the past.";
    else if (startDate > max) errors.startDate = "Pick a date within the next 12 months.";
  }

  if (Object.keys(errors).length) return { value: null, errors };
  return {
    value: { service, name, phone, email, company, websiteType, description, budget, startDate },
    errors,
  };
}

/* ───────────────────────────── WhatsApp ───────────────────────────── */

export const bookingRef = (id: string) => `NP-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

/**
 * Builds a wa.me link for a saved client, with a professional pre-filled message.
 * Paid bookings get a confirmation message; unpaid leads get a friendly follow-up.
 */
export function buildWhatsAppLink(
  b: Pick<Booking, "id" | "name" | "phone" | "serviceTitle" | "company" | "quote" | "paymentStatus" | "startDate">,
): string {
  const digits = normalizePhone(b.phone);
  const first = b.name.trim().split(" ")[0] || "there";
  const forCompany = b.company ? ` for ${b.company}` : "";
  const lines =
    b.paymentStatus === "paid"
      ? [
          `Hi ${first}, this is Nikhil Paharia. 👋`,
          "",
          `Thank you for booking *${b.serviceTitle}*${forCompany}! Your booking token of ${formatINR(b.quote.token)} has been received (Ref: ${bookingRef(b.id)}).`,
          "",
          `*Project total:* ${formatINR(b.quote.total)}`,
          `• Paid now (${b.quote.tokenPercent}%): ${formatINR(b.quote.token)} ✅`,
          `• At project start (${b.quote.startPercent}%): ${formatINR(b.quote.startAdvance)}`,
          `• After completion (${b.quote.remainingPercent}%): ${formatINR(b.quote.remaining)}`,
          ...(b.startDate ? ["", `Preferred start date: ${b.startDate}`] : []),
          "",
          "I'd like to go through your requirements in detail. When would be a good time for a quick call?",
        ]
      : [
          `Hi ${first}, this is Nikhil Paharia. 👋`,
          "",
          `Thanks for your interest in *${b.serviceTitle}*${forCompany}. I saw your booking request (Ref: ${bookingRef(b.id)}) and wanted to help you complete it.`,
          "",
          `Your estimated project cost is ${formatINR(b.quote.total)}. Happy to discuss your requirements and answer any questions — when are you free for a quick chat?`,
        ];
  return `https://wa.me/91${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export { SERVICE_PRICES };

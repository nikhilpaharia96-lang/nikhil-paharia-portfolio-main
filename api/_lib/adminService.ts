import crypto from "node:crypto";
import { isBookingStatus, type Booking, type Milestone, type PaymentRecord } from "../../shared/booking.js";
import { BookingError } from "./bookingService.js";
import type { BookingStore } from "./bookingStore.js";

export interface Stats {
  totalLeads: number;
  newInquiries: number;
  confirmedBookings: number;
  pendingPayments: number;
  /** Everything actually received (token via Razorpay + milestones recorded by the admin). */
  revenue: number;
  tokenRevenue: number;
  /** Still to collect on live (confirmed, not cancelled) bookings. */
  outstanding: number;
}

export const amountPaid = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);

export function computeStats(list: Booking[]): Stats {
  const live = list.filter((b) => b.status !== "cancelled");
  const paid = live.filter((b) => b.paymentStatus === "paid");
  return {
    totalLeads: list.length,
    newInquiries: list.filter((b) => b.status === "new_lead").length,
    confirmedBookings: paid.length,
    pendingPayments: live.filter((b) => b.paymentStatus !== "paid").length,
    revenue: list.reduce((s, b) => s + amountPaid(b), 0),
    tokenRevenue: list.reduce((s, b) => s + b.payments.filter((p) => p.milestone === "token").reduce((a, p) => a + p.amount, 0), 0),
    outstanding: paid.reduce((s, b) => s + Math.max(0, b.quote.total - amountPaid(b)), 0),
  };
}

export async function updateBooking(store: BookingStore, id: string, patch: { status?: unknown; notes?: unknown }): Promise<Booking> {
  const b = await store.get(id);
  if (!b) throw new BookingError(404, "Booking not found.");
  const ts = new Date().toISOString();
  if (patch.status !== undefined) {
    if (!isBookingStatus(patch.status)) throw new BookingError(400, "Invalid status.");
    if (patch.status !== b.status) {
      b.status = patch.status;
      b.statusHistory.push({ status: patch.status, at: ts });
    }
  }
  if (patch.notes !== undefined) {
    if (typeof patch.notes !== "string" || patch.notes.length > 4000) throw new BookingError(400, "Notes must be text up to 4000 characters.");
    b.notes = patch.notes;
  }
  b.updatedAt = ts;
  await store.save(b);
  return b;
}

/** Records an advance / final payment received outside Razorpay (UPI / bank transfer). */
export async function recordManualPayment(
  store: BookingStore,
  id: string,
  input: { milestone?: unknown; amount?: unknown; note?: unknown },
): Promise<Booking> {
  const b = await store.get(id);
  if (!b) throw new BookingError(404, "Booking not found.");
  if (b.paymentStatus !== "paid") throw new BookingError(409, "The booking token hasn't been paid yet.");
  const milestone = input.milestone;
  if (milestone !== "advance" && milestone !== "final") throw new BookingError(400, "Milestone must be 'advance' or 'final'.");
  if (b.payments.some((p) => p.milestone === milestone)) throw new BookingError(409, "That payment is already recorded.");

  const outstanding = b.quote.total - amountPaid(b);
  const defaultAmount = milestone === "advance" ? b.quote.startAdvance : outstanding;
  const amount = input.amount === undefined || input.amount === "" ? defaultAmount : Number(input.amount);
  if (!Number.isInteger(amount) || amount <= 0) throw new BookingError(400, "Enter a valid amount in whole rupees.");
  if (amount > outstanding) throw new BookingError(400, `Amount exceeds the outstanding balance of ₹${outstanding}.`);
  const note = typeof input.note === "string" ? input.note.trim().slice(0, 200) : "";

  const ts = new Date().toISOString();
  const rec: PaymentRecord = { id: crypto.randomUUID(), milestone: milestone as Milestone, amount, method: "manual", at: ts, note: note || undefined };
  b.payments.push(rec);
  b.updatedAt = ts;
  await store.save(b);
  return b;
}

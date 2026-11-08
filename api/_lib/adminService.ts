import crypto from "node:crypto";
import {
  BOOKING_STATUSES, isBookingStatus, istToday,
  type AdminStats, type Booking, type BookingStatus, type Milestone, type PaymentRecord,
} from "../../shared/booking.js";
import { BookingError } from "./bookingService.js";
import type { BookingStore } from "./bookingStore.js";

export type Stats = AdminStats;

export const amountPaid = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);

const IST_MS = 5.5 * 3600 * 1000;
const DAY_MS = 86_400_000;
const istDay = (ms: number) => new Date(ms + IST_MS).toISOString().slice(0, 10);
const CLOSED: BookingStatus[] = ["completed", "cancelled"];

export function computeStats(list: Booking[], now = Date.now()): AdminStats {
  const live = list.filter((b) => b.status !== "cancelled");
  const paid = live.filter((b) => b.paymentStatus === "paid");
  const today = istDay(now);

  const byStatus = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0])) as Record<BookingStatus, number>;
  list.forEach((b) => (byStatus[b.status] += 1));

  const days = Array.from({ length: 14 }, (_, i) => istDay(now - (13 - i) * DAY_MS));
  const daily = days.map((date) => ({ date, leads: 0, revenue: 0 }));
  const dayIndex = new Map(days.map((d, i) => [d, i]));
  list.forEach((b) => {
    const li = dayIndex.get(istDay(Date.parse(b.createdAt)));
    if (li !== undefined) daily[li].leads += 1;
    b.payments.forEach((p) => {
      const pi = dayIndex.get(istDay(Date.parse(p.at)));
      if (pi !== undefined) daily[pi].revenue += p.amount;
    });
  });

  const svc = new Map<string, { service: string; title: string; leads: number; confirmed: number; revenue: number }>();
  list.forEach((b) => {
    const row = svc.get(b.service) ?? { service: b.service, title: b.serviceTitle, leads: 0, confirmed: 0, revenue: 0 };
    row.leads += 1;
    if (b.paymentStatus === "paid" && b.status !== "cancelled") row.confirmed += 1;
    row.revenue += amountPaid(b);
    svc.set(b.service, row);
  });

  const src = new Map<string, { source: string; leads: number; confirmed: number; revenue: number }>();
  list.forEach((b) => {
    const key = b.source || "direct";
    const row = src.get(key) ?? { source: key, leads: 0, confirmed: 0, revenue: 0 };
    row.leads += 1;
    if (b.paymentStatus === "paid" && b.status !== "cancelled") row.confirmed += 1;
    row.revenue += amountPaid(b);
    src.set(key, row);
  });

  return {
    totalLeads: list.length,
    newInquiries: byStatus.new_lead,
    confirmedBookings: paid.length,
    pendingPayments: live.filter((b) => b.paymentStatus !== "paid" && !b.inquiry).length,
    revenue: list.reduce((s, b) => s + amountPaid(b), 0),
    tokenRevenue: list.reduce((s, b) => s + b.payments.filter((p) => p.milestone === "token").reduce((a, p) => a + p.amount, 0), 0),
    outstanding: paid.reduce((s, b) => s + Math.max(0, b.quote.total - amountPaid(b)), 0),
    conversionRate: list.length ? Math.round((paid.length / list.length) * 1000) / 10 : 0,
    followUpsDue: list.filter((b) => b.followUpAt && b.followUpAt <= today && !CLOSED.includes(b.status)).length,
    byStatus,
    daily,
    byService: [...svc.values()].sort((a, b) => b.revenue - a.revenue || b.leads - a.leads),
    bySource: [...src.values()].sort((a, b) => b.revenue - a.revenue || b.leads - a.leads).slice(0, 12),
  };
}

export async function updateBooking(
  store: BookingStore,
  id: string,
  patch: { status?: unknown; notes?: unknown; followUpAt?: unknown },
  now = Date.now(),
): Promise<Booking> {
  const b = await store.get(id);
  if (!b) throw new BookingError(404, "Booking not found.");
  const ts = new Date(now).toISOString();
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
  if (patch.followUpAt !== undefined) {
    const v = patch.followUpAt;
    if (v !== "" && !(typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && v >= istToday(now - DAY_MS) && v <= istToday(now + 366 * DAY_MS))) {
      throw new BookingError(400, "Enter a valid follow-up date within the next year.");
    }
    b.followUpAt = v as string;
  }
  b.updatedAt = ts;
  await store.save(b);
  return b;
}

/** Permanently deletes a lead. Only for leads with NO payment — financial records must be kept (cancel them instead). */
export async function deleteBooking(store: BookingStore, id: string): Promise<void> {
  const b = await store.get(id);
  if (!b) throw new BookingError(404, "Booking not found.");
  if (b.payments.length || b.paymentStatus === "paid") {
    throw new BookingError(409, "Bookings with payments can't be deleted — mark them Cancelled instead.");
  }
  await store.delete(b);
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

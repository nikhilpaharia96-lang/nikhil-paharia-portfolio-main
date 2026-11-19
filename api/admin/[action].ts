import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { adminConfigured, clearCookie, isAuthed, issueToken, passwordMatches, sameOrigin, sessionCookie } from "../_lib/adminAuth.js";
import { computeStats, deleteBooking, recordManualPayment, updateBooking } from "../_lib/adminService.js";
import { notifyForBooking } from "../_lib/bookingRuntime.js";
import { BookingError } from "../_lib/bookingService.js";
import { bookingRef } from "../../shared/booking.js";
import { getStore, StoreNotConfiguredError } from "../_lib/bookingStore.js";
import { getClientIp } from "../_lib/rateLimit.js";
import { verifyDigestRequest } from "../_lib/n8nHook.js";
import { durableStoreConfigured, incrWindow, readVisits, VISIT_RETENTION_DAYS } from "../_lib/visitStore.js";

// ONE function for every admin action (keeps the project under Vercel Hobby's 12-function limit):
//   POST login · POST logout · GET session · GET bookings · POST update · POST record-payment
//   POST delete (unpaid leads only) · POST resend (re-sends the confirmation emails / WhatsApp PDF)
//   GET visitors (anonymous visit log for the Visitors tab — independent of the booking store)
// Everything except login/logout/session requires the signed admin cookie. Client data is never
// served by any public endpoint.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  const action = String(req.query.action ?? "");

  try {
    if (action === "session" && req.method === "GET") {
      return res.status(200).json({ authenticated: isAuthed(req), configured: adminConfigured() });
    }

    if (action === "login" && req.method === "POST") {
      if (!sameOrigin(req)) return res.status(403).json({ error: "Forbidden." });
      if (!adminConfigured()) return res.status(503).json({ error: "Admin access is not configured." });
      const ipKey = crypto.createHash("sha256").update(getClientIp(req)).digest("hex").slice(0, 24);
      if ((await incrWindow(`admin-login:${ipKey}`, 900)) > 5 || (await incrWindow("admin-login:global", 3600)) > 60) {
        return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
      }
      const pw = typeof req.body?.password === "string" ? req.body.password : "";
      if (!passwordMatches(pw)) {
        await new Promise((r) => setTimeout(r, 500)); // slow down guessing
        return res.status(401).json({ error: "Incorrect password." });
      }
      res.setHeader("Set-Cookie", sessionCookie(issueToken(), req));
      return res.status(200).json({ authenticated: true });
    }

    if (action === "logout" && req.method === "POST") {
      res.setHeader("Set-Cookie", clearCookie(req));
      return res.status(200).json({ authenticated: false });
    }

    // ── everything below needs a valid admin session ──
    // GET digest: called once a day by the WhatsApp assistant (n8n), signed with the shared bridge secret instead of the
    // admin cookie. Returns ONLY what the owner needs for a morning WhatsApp: who to follow up today (no email / project text).
    if (action === "digest" && req.method === "GET") {
      const h = (k: string) => (Array.isArray(req.headers[k]) ? (req.headers[k] as string[])[0] : (req.headers[k] as string | undefined));
      if (!verifyDigestRequest(h("x-booking-timestamp"), h("x-booking-signature"))) return res.status(401).json({ error: "Unauthorized." });
      const today = new Date(Date.now() + 5.5 * 3_600_000).toISOString().slice(0, 10);
      const all = await getStore().list(500);
      const open = all.filter((b) => b.status !== "completed" && b.status !== "cancelled");
      const due = open.filter((b) => b.followUpAt && b.followUpAt <= today)
        .sort((a, b) => String(a.followUpAt).localeCompare(String(b.followUpAt))).slice(0, 15)
        .map((b) => ({ ref: bookingRef(b.id), name: b.name.slice(0, 60), phone: `+91${b.phone}`, service: b.serviceTitle, status: b.status, followUpAt: b.followUpAt }));
      const newEnquiries = open.filter((b) => b.status === "new_lead").length;
      const unpaidAdvance = open.filter((b) => b.paymentStatus === "paid" && b.quote.total > b.payments.reduce((s, p) => s + p.amount, 0)).length;
      return res.status(200).json({ today, due, newEnquiries, unpaidAdvance });
    }

    if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized." });

    // Anonymous visit log (no IPs / user agents). Needs Upstash; handled before getStore() so it never depends on it.
    if (action === "visitors" && req.method === "GET") {
      if (!durableStoreConfigured()) return res.status(200).json({ storage: false, retentionDays: VISIT_RETENTION_DAYS, visits: [] });
      const days = Math.min(Math.max(Number(req.query.days) || 7, 1), VISIT_RETENTION_DAYS);
      return res.status(200).json({ storage: true, retentionDays: VISIT_RETENTION_DAYS, days, visits: await readVisits(Date.now() - days * 86_400_000) });
    }

    const store = getStore();

    if (action === "bookings" && req.method === "GET") {
      const bookings = await store.list(500);
      return res.status(200).json({ bookings, stats: computeStats(bookings) });
    }

    if (["update", "record-payment", "delete", "resend"].includes(action) && req.method === "POST") {
      if (!sameOrigin(req)) return res.status(403).json({ error: "Forbidden." });
      const b = (req.body ?? {}) as Record<string, unknown>;
      if (typeof b.id !== "string") return res.status(400).json({ error: "Missing booking id." });

      if (action === "delete") {
        await deleteBooking(store, b.id);
        return res.status(200).json({ deleted: true });
      }
      if (action === "resend") {
        const booking = await store.get(b.id);
        if (!booking) return res.status(404).json({ error: "Booking not found." });
        const pay = booking.payments.find((p) => p.milestone === "token" && p.method === "razorpay");
        if (booking.paymentStatus !== "paid" || !pay) return res.status(409).json({ error: "Only bookings with a verified token payment can be re-sent." });
        if (!(await store.claim(`resend:${booking.id}`, 30))) return res.status(429).json({ error: "Already sent — wait a few seconds." });
        await notifyForBooking(booking, pay, { resend: true });
        return res.status(200).json({ sent: true });
      }
      const booking = action === "update" ? await updateBooking(store, b.id, b) : await recordManualPayment(store, b.id, b);
      return res.status(200).json({ booking });
    }

    return res.status(404).json({ error: "Not found." });
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message });
    if (err instanceof StoreNotConfiguredError) return res.status(503).json({ error: "Booking database is not configured." });
    console.error("Admin API error:", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Something went wrong." });
  }
}

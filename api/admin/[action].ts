import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { adminConfigured, clearCookie, isAuthed, issueToken, passwordMatches, sameOrigin, sessionCookie } from "../_lib/adminAuth.js";
import { computeStats, recordManualPayment, updateBooking } from "../_lib/adminService.js";
import { BookingError } from "../_lib/bookingService.js";
import { getStore, StoreNotConfiguredError } from "../_lib/bookingStore.js";
import { getClientIp } from "../_lib/rateLimit.js";
import { incrWindow } from "../_lib/visitStore.js";

// ONE function for every admin action (keeps the project under Vercel Hobby's 12-function limit):
//   POST login · POST logout · GET session · GET bookings · POST update · POST record-payment
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
    if (!isAuthed(req)) return res.status(401).json({ error: "Unauthorized." });
    const store = getStore();

    if (action === "bookings" && req.method === "GET") {
      const bookings = await store.list(500);
      return res.status(200).json({ bookings, stats: computeStats(bookings) });
    }

    if ((action === "update" || action === "record-payment") && req.method === "POST") {
      if (!sameOrigin(req)) return res.status(403).json({ error: "Forbidden." });
      const b = (req.body ?? {}) as Record<string, unknown>;
      if (typeof b.id !== "string") return res.status(400).json({ error: "Missing booking id." });
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

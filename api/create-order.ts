import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";
import { checkRateLimit, getClientIp } from "./lib/rateLimit.js";
import { isValidSemester, getMinAmountForSemester } from "../shared/semesterRules.js";

// This function runs ONLY on Vercel's server. RAZORPAY_KEY_SECRET is read
// from an environment variable and is never sent to the browser, returned
// in a response, or written to logs.
// Configure both env vars in the Vercel Project Settings -> Environment Variables:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET

const MAX_AMOUNT_INR = 500000; // sanity ceiling to avoid accidental huge charges

const MAX_NAME_LENGTH = 100;

// Best-effort abuse protection — see api/lib/rateLimit.ts for caveats.
const RATE_LIMIT = { limit: 8, windowMs: 60_000 }; // 8 order-creation attempts / IP / minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Payment responses must never be cached by a CDN, proxy, or the browser.
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`create-order:${ip}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Log only that config is missing — never log the values themselves.
    console.error("Razorpay env vars missing: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET");
    return res.status(500).json({ error: "Payment service is not configured yet." });
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const { amount, studentName: rawStudentName, semester } = (body ?? {}) as {
    amount?: unknown;
    studentName?: unknown;
    semester?: unknown;
  };

  // Student name: required, trimmed, bounded length. The frontend already
  // enforces this, but the server never trusts client-side validation.
  const studentName = typeof rawStudentName === "string" ? rawStudentName.trim() : "";
  if (!studentName || studentName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: "Enter your full name." });
  }

  // Semester: required, must be one of the known values. Validated before
  // amount because the minimum allowed amount depends on the semester.
  if (!isValidSemester(semester)) {
    return res.status(400).json({ error: "Select your semester." });
  }

  // Server-side validation — the browser's amount is never trusted as-is.
  // Rejects: missing, non-number, NaN, Infinity/-Infinity, decimals,
  // below this semester's minimum, and unreasonably large values.
  const minAmountForSemester = getMinAmountForSemester(semester);
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount < minAmountForSemester ||
    amount > MAX_AMOUNT_INR
  ) {
    return res.status(400).json({
      error: `Enter a valid amount of at least ₹${minAmountForSemester} for ${semester} (up to ₹5,00,000).`,
    });
  }

  // amount is already a validated positive integer number of rupees here,
  // so this multiplication is exact — no floating point rounding risk.
  const amountInPaise = amount * 100;

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `support_${Date.now()}`,
      // Ensures the payment is captured automatically once authorized,
      // regardless of the account's default capture setting. Without this,
      // a "successful" checkout on an account configured for manual
      // capture would sit in `authorized` state and never actually settle.
      payment_capture: true,
      notes: {
        source: "teachers-day-2026-support-page",
        studentName,
        semester,
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // publishable key id — safe to expose to the frontend
    });
  } catch (err) {
    // Log only a generic message, never the full error object (SDK errors
    // can echo back request parameters).
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Razorpay order creation failed:", message);
    return res.status(502).json({ error: "Could not start payment. Please try again." });
  }
}

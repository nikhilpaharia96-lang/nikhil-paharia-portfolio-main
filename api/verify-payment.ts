import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import Razorpay from "razorpay";
import { checkRateLimit, getClientIp } from "./lib/rateLimit.js";
import { sendNotificationEmail } from "./lib/sendEmail.js";
import { markNotifiedIfNew } from "./lib/sentPayments.js";

const VALID_SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
];

const MAX_NAME_LENGTH = 100;

// Verifies the payment signature Razorpay returns after checkout completes.
// This is the step that actually confirms a payment is genuine — it must
// happen on the server, using RAZORPAY_KEY_SECRET, never in the browser.
// The frontend cannot mark a payment successful on its own: this endpoint
// is the single source of truth, and it only ever returns
// `{ verified: true }` when the HMAC signature checks out.

// Best-effort abuse protection — see api/lib/rateLimit.ts for caveats.
const RATE_LIMIT = { limit: 15, windowMs: 60_000 }; // 15 verify attempts / IP / minute

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ verified: false, error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`verify-payment:${ip}`, RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
    return res.status(429).json({ verified: false, error: "Too many requests. Please wait a moment." });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error("Razorpay env var missing: RAZORPAY_KEY_SECRET");
    return res.status(500).json({ verified: false, error: "Payment service is not configured yet." });
  }

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ verified: false, error: "Invalid request body." });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    studentName: rawStudentName,
    semester,
    amount,
  } = (body ?? {}) as {
    razorpay_order_id?: unknown;
    razorpay_payment_id?: unknown;
    razorpay_signature?: unknown;
    studentName?: unknown;
    semester?: unknown;
    amount?: unknown;
  };

  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({ verified: false, error: "Missing payment details." });
  }

  // Student info is used only for the confirmation email — it plays no
  // role in the cryptographic verification below, so we validate it
  // loosely and simply omit it from the email if it looks off, rather
  // than failing an otherwise-genuine payment over a display detail.
  const studentName =
    typeof rawStudentName === "string" && rawStudentName.trim().length > 0 && rawStudentName.trim().length <= MAX_NAME_LENGTH
      ? rawStudentName.trim()
      : "Anonymous Student";
  const semesterLabel = typeof semester === "string" && VALID_SEMESTERS.includes(semester) ? semester : "Not specified";
  const amountLabel = typeof amount === "number" && Number.isFinite(amount) && amount > 0 ? amount : null;

  // --- Step 1: HMAC-SHA256 signature check (authoritative check) ---
  // Formula per Razorpay docs: HMAC_SHA256(order_id + "|" + payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

  // timingSafeEqual throws if buffers differ in length, so we must guard
  // that first — but the length check alone leaks negligible information
  // (signature length is always a fixed 64 hex chars) and is standard
  // practice for this comparison.
  const isValid =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    // Log identifiers only — never the secret, never the signatures.
    console.warn("Razorpay signature verification failed", {
      razorpay_order_id,
      razorpay_payment_id,
    });
    return res.status(400).json({ verified: false, error: "Payment could not be verified." });
  }

  // --- Step 2 (defense-in-depth, optional): confirm capture status ---
  // The signature alone is already cryptographic proof the payment
  // succeeded (only Razorpay, using our secret, could have produced it).
  // We additionally fetch the payment to confirm its status is
  // "captured"/"authorized" rather than e.g. "failed" or refunded. This
  // call is a sanity check, not the source of truth — if the Razorpay API
  // itself is unreachable we fail OPEN here (trust the signature) rather
  // than blocking a legitimately-verified supporter because of an
  // unrelated network hiccup.
  if (keyId) {
    try {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status !== "captured" && payment.status !== "authorized") {
        console.warn("Razorpay payment fetched but not captured/authorized", {
          razorpay_payment_id,
          status: payment.status,
        });
        return res.status(400).json({ verified: false, error: "Payment was not completed." });
      }

      if (payment.order_id !== razorpay_order_id) {
        // Signature matched but the fetched payment points at a different
        // order — should be impossible given the HMAC check, but treat any
        // mismatch as unverified rather than trusting it.
        console.warn("Razorpay payment/order mismatch on verify", { razorpay_payment_id });
        return res.status(400).json({ verified: false, error: "Payment could not be verified." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      console.warn("Razorpay payment fetch failed during verification (failing open on signature check):", message);
      // Fall through — signature check already passed.
    }
  }

  // --- Step 3: verified-payment notification email ---
  // Reached ONLY after the HMAC signature check above passed (and, best
  // effort, the capture-status check). Never send this email from the
  // frontend, and never send it before this point in the code.
  //
  // markNotifiedIfNew guards against sending a duplicate email if this
  // endpoint is somehow called twice for the same payment (e.g. a client
  // retry after a dropped response).
  if (markNotifiedIfNew(razorpay_payment_id)) {
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const amountText = amountLabel !== null ? `₹${amountLabel}` : "Amount unavailable";

    const emailBody = [
      "Teacher's Day Celebration 2026",
      "",
      "A new contribution has been successfully received.",
      "",
      `Student Name: ${studentName}`,
      `Semester: ${semesterLabel}`,
      `Amount: ${amountText}`,
      `Payment ID: ${razorpay_payment_id}`,
      `Order ID: ${razorpay_order_id}`,
      "Payment Status: Verified",
      `Date/Time: ${timestamp} (IST)`,
      "",
      "This payment was made for the student-organized Teacher's Day Celebration 2026.",
    ].join("\n");

    // Fire-and-forget from the response's perspective, but still awaited so
    // any failure is logged server-side — a failed email must never change
    // the verified payment outcome already decided above.
    const emailResult = await sendNotificationEmail({
      subject: `Teacher's Day Contribution Received — ${studentName}`,
      text: emailBody,
    });

    if (!emailResult.sent) {
      console.error("Verified payment succeeded but notification email failed:", emailResult.error);
    }
  }

  return res.status(200).json({ verified: true, paymentId: razorpay_payment_id });
}

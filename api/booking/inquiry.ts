import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, getClientIp } from "../_lib/rateLimit.js";
import { BookingError, saveInquiry } from "../_lib/bookingService.js";
import { buildInquiryDeps } from "../_lib/bookingRuntime.js";
import { StoreNotConfiguredError } from "../_lib/bookingStore.js";

// "Not ready to pay? Send an enquiry." Saves the lead (visible in /admin, with its source) and emails the
// owner. No payment, no Razorpay. Spam protection: rate limit + honeypot (there is no payment barrier here).

const RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const rl = checkRateLimit(`booking-inquiry:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }
  let body: Record<string, unknown>;
  try {
    body = ((typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {}) as Record<string, unknown>;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }
  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) return res.status(400).json({ error: "Request rejected." });

  try {
    const r = await saveInquiry(buildInquiryDeps(), body, body.leadId);
    return res.status(200).json(r);
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message, fieldErrors: err.fieldErrors });
    if (err instanceof StoreNotConfiguredError) {
      console.error(err.message);
      return res.status(500).json({ error: "Enquiry service is not configured yet." });
    }
    console.error("Inquiry failed:", err instanceof Error ? err.message : "unknown error");
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

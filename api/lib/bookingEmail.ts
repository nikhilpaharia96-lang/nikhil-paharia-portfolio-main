import { isServiceSlug, SERVICE_PRICES } from "../../shared/servicePricing.js";

/**
 * Builds the "new booking" notification email sent to the site owner's inbox.
 * Used by BOTH api/booking/verify-payment.ts (browser-triggered) and
 * api/booking/webhook.ts (Razorpay-triggered, in case the tab was closed), so
 * the email is identical whichever arrives first.
 */
export function buildBookingEmail(args: {
  tags: Record<string, string>;
  paymentId: string;
  orderId: string;
  tokenPaid: number;
  requirements?: string;
  gateway?: string;
}): { subject: string; text: string } | null {
  const { tags, paymentId, orderId, tokenPaid } = args;
  if (tags.source !== "service-booking" || !isServiceSlug(tags.service)) return null;

  const service = SERVICE_PRICES[tags.service];
  const total = Number(tags.total ?? 0);
  const startPct = Number(tags.start_pct ?? 0);
  const startAdvance = Math.round((total * startPct) / 100);
  const remaining = Math.max(0, total - tokenPaid - startAdvance);
  const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const requirements = (args.requirements || tags.req || "").trim();

  return {
    subject: `New booking — ${service.title} — ${tags.name ?? "Client"}`,
    text: [
      "New service booking (booking token paid)",
      "",
      `Service: ${service.title}`,
      `Client: ${tags.name ?? "-"}`,
      `Email: ${tags.email ?? "-"}`,
      `Phone: ${tags.phone ?? "-"}`,
      "",
      `Total project cost: ₹${total}`,
      `Booking token paid (${tags.token_pct ?? "?"}%): ₹${tokenPaid}`,
      `Additional advance due at project start (${tags.start_pct ?? "?"}%): ₹${startAdvance}`,
      `Remaining due after completion: ₹${remaining}`,
      "Payment status: Booking token paid (verified)",
      `Payment ID: ${paymentId}`,
      `Order ID: ${orderId}`,
      `Gateway: ${args.gateway ?? "Razorpay"}`,
      `Date/Time: ${when} (IST)`,
      "",
      "Requirements:",
      requirements || "(not provided)",
    ].join("\n"),
  };
}

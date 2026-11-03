import { isServiceSlug, SERVICE_PRICES } from "../../shared/servicePricing.js";
import { SERVICE_INFO } from "../../shared/serviceInfo.js";
import { sendNotificationEmail } from "./sendEmail.js";
import { buildBookingPdf } from "./bookingPdf.js";
import { sendBookingPdfWhatsApp } from "./whatsapp.js";

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

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The email the CLIENT receives right after booking: service details + their quotation
 * (total, booking token paid, amount due at project start, balance) and what happens next.
 */
export function buildClientQuotationEmail(args: {
  tags: Record<string, string>;
  paymentId: string;
  orderId: string;
  tokenPaid: number;
}): { to: string; subject: string; text: string; html: string } | null {
  const { tags, paymentId, orderId, tokenPaid } = args;
  if (tags.source !== "service-booking" || !isServiceSlug(tags.service) || !tags.email) return null;

  const service = SERVICE_PRICES[tags.service];
  const info = SERVICE_INFO[tags.service];
  const total = Number(tags.total ?? 0);
  const startPct = Number(tags.start_pct ?? 0);
  const tokenPct = Number(tags.token_pct ?? 0);
  const startAdvance = Math.round((total * startPct) / 100);
  const remaining = Math.max(0, total - tokenPaid - startAdvance);
  const remainingPct = 100 - tokenPct - startPct;
  const name = tags.name || "there";
  const ref = `Ref: ${orderId} · Payment ID: ${paymentId}`;

  const rows: [string, string][] = [
    ["Total project cost", inr(total)],
    [`Booking token paid (${tokenPct}%)`, inr(tokenPaid)],
    [`Additional advance at project start (${startPct}%)`, inr(startAdvance)],
    [`Remaining after completion (${remainingPct}%)`, inr(remaining)],
  ];

  const text = [
    `Hi ${name},`,
    "",
    `Thank you for booking ${service.title}! I've received your booking token and will contact you shortly to confirm the details.`,
    "",
    "YOUR QUOTATION",
    `Service: ${service.title}`,
    `Starting price: ${inr(service.startingPrice)}${service.unit}`,
    `Estimated delivery: ${info.delivery}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "WHAT'S INCLUDED",
    ...info.included.map((i) => `- ${i}`),
    "",
    "TYPICAL TIMELINES",
    ...info.timeline.map((t) => `- ${t.label}: ${t.value}`),
    "",
    "WHAT HAPPENS NEXT",
    "1. I'll reach out to discuss your requirements in detail.",
    `2. The additional ${startPct}% advance (${inr(startAdvance)}) is paid when the project starts.`,
    `3. The remaining ${remainingPct}% (${inr(remaining)}) is paid after the work is completed and approved.`,
    "",
    ref,
    "",
    "Just reply to this email if you have any questions.",
    "",
    "— Nikhil Paharia",
  ].join("\n");

  const li = (items: string[]) => items.map((i) => `<li style="margin:4px 0">${esc(i)}</li>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f1f5fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="background:#0f172a;color:#fff;border-radius:16px 16px 0 0;padding:24px">
    <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#93c5fd">Booking confirmed</div>
    <div style="font-size:22px;font-weight:800;margin-top:6px">${esc(service.title)}</div>
  </div>
  <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;line-height:1.55;font-size:14px">
    <p style="margin-top:0">Hi ${esc(name)}, thank you for booking! I've received your booking token and will contact you shortly to confirm the details.</p>
    <table role="presentation" width="100%" cellspacing="0" style="border:1px solid #dbeafe;border-radius:12px;background:#eff6ff;margin:16px 0">
      ${rows
        .map(
          ([k, v], i) =>
            `<tr><td style="padding:10px 14px;color:#475569">${esc(k)}</td><td align="right" style="padding:10px 14px;font-weight:${i === 1 ? 800 : 600};color:${i === 1 ? "#1266f1" : "#0f172a"}">${v}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="margin:0 0 4px"><b>Starting price:</b> ${inr(service.startingPrice)}${esc(service.unit)} &nbsp;·&nbsp; <b>Estimated delivery:</b> ${esc(info.delivery)}</p>
    <h3 style="margin:18px 0 4px;font-size:14px">What's included</h3>
    <ul style="margin:0;padding-left:18px">${li(info.included)}</ul>
    <h3 style="margin:18px 0 4px;font-size:14px">Typical timelines</h3>
    <ul style="margin:0;padding-left:18px">${li(info.timeline.map((t) => `${t.label}: ${t.value}`))}</ul>
    <h3 style="margin:18px 0 4px;font-size:14px">What happens next</h3>
    <ol style="margin:0;padding-left:18px">
      <li style="margin:4px 0">I'll reach out to discuss your requirements in detail.</li>
      <li style="margin:4px 0">The additional ${startPct}% advance (${inr(startAdvance)}) is paid when the project starts.</li>
      <li style="margin:4px 0">The remaining ${remainingPct}% (${inr(remaining)}) is paid after the work is completed and approved.</li>
    </ol>
    <p style="margin-top:20px;color:#64748b;font-size:12px">${esc(ref)}<br>Questions? Just reply to this email.</p>
    <p style="margin-bottom:0">— Nikhil Paharia</p>
  </div>
</div></body></html>`;

  return { to: tags.email, subject: `Your booking & quotation — ${service.title}`, text, html };
}

/**
 * After a verified booking: (1) alert email to the owner, (2) quotation email to the client,
 * (3) the booking PDF to the client's WhatsApp. The PDF is also attached to both emails.
 * Each step is independent — one failing never blocks the others.
 */
export async function notifyBooking(args: {
  tags: Record<string, string>;
  paymentId: string;
  orderId: string;
  tokenPaid: number;
  requirements?: string;
}): Promise<void> {
  let pdf: Buffer | null = null;
  try {
    pdf = await buildBookingPdf(args);
  } catch (err) {
    console.error("Booking PDF generation failed:", err instanceof Error ? err.message : "unknown error");
  }
  const filename = `Booking-${args.orderId}.pdf`;
  const attachments = pdf ? [{ filename, content: pdf }] : undefined;

  const admin = buildBookingEmail({ ...args, gateway: "Razorpay" });
  if (admin) {
    const r = await sendNotificationEmail({ ...admin, attachments });
    if (!r.sent) console.error("Booking owner email failed:", r.error);
  }

  const client = buildClientQuotationEmail(args);
  if (client) {
    // Replies go to the owner's inbox.
    const r = await sendNotificationEmail({ ...client, replyTo: process.env.EMAIL_TO, attachments });
    if (!r.sent) console.error("Booking client email failed:", r.error);
  }

  if (pdf && args.tags.phone && isServiceSlug(args.tags.service)) {
    const r = await sendBookingPdfWhatsApp({
      phone: args.tags.phone,
      clientName: args.tags.name || "there",
      serviceTitle: SERVICE_PRICES[args.tags.service].title,
      pdf,
      filename,
    });
    if (!r.sent && r.error !== "WhatsApp is not configured.") console.error("Booking WhatsApp failed:", r.error);
  }
}

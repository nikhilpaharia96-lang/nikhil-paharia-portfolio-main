import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_BASE64, INTER_BOLD_BASE64 } from "./pdfFonts.js";
import { isServiceSlug, SERVICE_PRICES } from "../../shared/servicePricing.js";
import { SERVICE_INFO } from "../../shared/serviceInfo.js";

/**
 * Builds the booking confirmation + quotation PDF (A4) that is sent to the client on WhatsApp
 * and as an email attachment. Pure JS (pdf-lib) so it runs inside a Vercel function.
 *
 * Uses an embedded Unicode font (Inter, subset to Latin + "₹") so the rupee symbol renders
 * properly. Page size is A4 (595.28 x 841.89 pt).
 */

// Characters the embedded font subset covers; anything else is replaced so drawing never throws.
const safe = (s: string) => s.replace(/[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u20B9]/g, "?");
const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const BLUE = rgb(0.07, 0.4, 0.945);
const NAVY = rgb(0.06, 0.09, 0.16);
const GREY = rgb(0.39, 0.45, 0.55);

export interface BookingPdfInput {
  tags: Record<string, string>;
  paymentId: string;
  orderId: string;
  tokenPaid: number;
  requirements?: string;
}

export async function buildBookingPdf(args: BookingPdfInput): Promise<Buffer | null> {
  const { tags, paymentId, orderId, tokenPaid } = args;
  if (tags.source !== "service-booking" || !isServiceSlug(tags.service)) return null;

  const service = SERVICE_PRICES[tags.service];
  const info = SERVICE_INFO[tags.service];
  const total = Number(tags.total ?? 0);
  const tokenPct = Number(tags.token_pct ?? 0);
  const startPct = Number(tags.start_pct ?? 0);
  const startAdvance = Math.round((total * startPct) / 100);
  const remaining = Math.max(0, total - tokenPaid - startAdvance);
  const remainingPct = 100 - tokenPct - startPct;
  const requirements = (args.requirements || tags.req || "").trim();
  const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`Booking confirmation - ${service.title}`);
  pdf.setAuthor("Nikhil Paharia");
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(Buffer.from(INTER_REGULAR_BASE64, "base64"));
  const bold = await pdf.embedFont(Buffer.from(INTER_BOLD_BASE64, "base64"));

  // A4 portrait
  const W = 595.28;
  const H = 841.89;
  const M = 44;
  let page: PDFPage = pdf.addPage([W, H]);
  let y = H;

  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = H - M;
  };
  const need = (h: number) => {
    if (y - h < 48) newPage();
  };
  const text = (t: string, x: number, size: number, font: PDFFont, color = NAVY) => {
    page.drawText(safe(t), { x, y, size, font, color });
  };
  const wrap = (t: string, size: number, font: PDFFont, maxW: number): string[] => {
    const lines: string[] = [];
    for (const para of safe(t).split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > maxW && line) {
          lines.push(line);
          line = word;
        } else line = next;
      }
      lines.push(line);
    }
    return lines;
  };
  const heading = (t: string) => {
    need(40);
    y -= 22;
    text(t.toUpperCase(), M, 10, bold, BLUE);
    y -= 6;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: rgb(0.86, 0.9, 0.97) });
    y -= 6;
  };
  const para = (t: string, size = 10.5, font = regular, indent = 0, color = NAVY) => {
    for (const l of wrap(t, size, font, W - 2 * M - indent)) {
      need(size + 6);
      y -= size + 4;
      text(l, M + indent, size, font, color);
    }
  };
  const row = (k: string, v: string, strong = false) => {
    need(20);
    y -= 18;
    text(k, M + 4, 10.5, regular, GREY);
    const w = (strong ? bold : regular).widthOfTextAtSize(safe(v), 11);
    page.drawText(safe(v), { x: W - M - 4 - w, y, size: 11, font: strong ? bold : regular, color: strong ? BLUE : NAVY });
  };

  // Header band
  page.drawRectangle({ x: 0, y: H - 110, width: W, height: 110, color: NAVY });
  y = H - 44;
  text("BOOKING CONFIRMATION & QUOTATION", M, 10, bold, rgb(0.58, 0.77, 0.99));
  y -= 30;
  text(service.title, M, 22, bold, rgb(1, 1, 1));
  y -= 22;
  text(`Nikhil Paharia  |  ${when} (IST)`, M, 9.5, regular, rgb(0.8, 0.84, 0.9));
  y = H - 110;

  heading("Client");
  row("Name", tags.name || "-");
  row("Email", tags.email || "-");
  row("Phone", tags.phone || "-");

  heading("Quotation");
  row("Service", service.title);
  row("Starting price", `${rs(service.startingPrice)}${service.unit}`);
  row("Estimated delivery", info.delivery);
  y -= 6;
  row("Total project cost", rs(total), true);
  row(`Booking token paid (${tokenPct}%)`, rs(tokenPaid), true);
  row(`Additional advance at project start (${startPct}%)`, rs(startAdvance));
  row(`Remaining after completion (${remainingPct}%)`, rs(remaining));

  heading("What's included");
  info.included.forEach((i) => para(`•  ${i}`, 10.5, regular, 4));

  heading("Typical timelines");
  info.timeline.forEach((t) => para(`•  ${t.label}: ${t.value}`, 10.5, regular, 4));

  if (requirements) {
    heading("Your requirements");
    para(requirements, 10, regular, 4, GREY);
  }

  heading("What happens next");
  para("1.  I will contact you shortly to discuss your requirements in detail.");
  para(`2.  The additional ${startPct}% advance (${rs(startAdvance)}) is paid when the project starts.`);
  para(`3.  The remaining ${remainingPct}% (${rs(remaining)}) is paid after the work is completed and approved.`);

  heading("Payment reference");
  para(`Payment ID: ${paymentId}`, 9.5, regular, 4, GREY);
  para(`Order ID: ${orderId}`, 9.5, regular, 4, GREY);

  pdf.getPages().forEach((p, i, all) => {
    p.drawText(safe(`Nikhil Paharia  ·  This is a computer-generated confirmation.  Page ${i + 1} of ${all.length}`), {
      x: M,
      y: 24,
      size: 8,
      font: regular,
      color: GREY,
    });
  });

  return Buffer.from(await pdf.save());
}

/**
 * Sends the booking PDF to the client on WhatsApp using Meta's WhatsApp Cloud API.
 *
 * WhatsApp only lets a business START a conversation with an approved TEMPLATE message, so a
 * template with a DOCUMENT header must exist (see .env.example / README for the exact text).
 *
 * Env (Vercel → Settings → Environment Variables):
 *   WHATSAPP_TOKEN            permanent access token (System User) with whatsapp_business_messaging
 *   WHATSAPP_PHONE_NUMBER_ID  the sending number's Phone Number ID
 *   WHATSAPP_TEMPLATE_NAME    approved template name   (default: booking_confirmation)
 *   WHATSAPP_TEMPLATE_LANG    template language code   (default: en)
 *   WHATSAPP_GRAPH_VERSION    Graph API version        (default: v23.0)
 * If these are not set, sending is skipped silently (email still goes out).
 */

// Graph API version is configurable (older versions get retired by Meta over time).
const GRAPH = `https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_VERSION || "v23.0"}`;

export interface WhatsAppResult {
  sent: boolean;
  error?: string;
}

export async function sendBookingPdfWhatsApp(args: {
  /** 10-digit Indian mobile number as typed by the client. */
  phone: string;
  clientName: string;
  serviceTitle: string;
  pdf: Buffer;
  filename: string;
}): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { sent: false, error: "WhatsApp is not configured." };

  const digits = args.phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) return { sent: false, error: "Invalid phone number." };
  const to = `91${digits}`;

  try {
    // 1) Upload the PDF to WhatsApp → media id (no public hosting needed).
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", "application/pdf");
    form.append("file", new Blob([new Uint8Array(args.pdf)], { type: "application/pdf" }), args.filename);

    const up = await fetch(`${GRAPH}/${phoneId}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const upJson = (await up.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
    if (!up.ok || !upJson.id) {
      console.error("WhatsApp media upload failed:", up.status, upJson.error?.message ?? "");
      return { sent: false, error: "WhatsApp upload failed." };
    }

    // 2) Send the approved template with the PDF as its header document.
    const msg = await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: process.env.WHATSAPP_TEMPLATE_NAME || "booking_confirmation",
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [
            { type: "header", parameters: [{ type: "document", document: { id: upJson.id, filename: args.filename } }] },
            {
              type: "body",
              parameters: [
                { type: "text", text: args.clientName.slice(0, 60) },
                { type: "text", text: args.serviceTitle.slice(0, 60) },
              ],
            },
          ],
        },
      }),
    });
    const msgJson = (await msg.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
    if (!msg.ok) {
      console.error("WhatsApp send failed:", msg.status, msgJson.error?.code ?? "", msgJson.error?.message ?? "");
      return { sent: false, error: "WhatsApp send failed." };
    }
    return { sent: true };
  } catch (err) {
    console.error("WhatsApp request failed:", err instanceof Error ? err.message : "unknown error");
    return { sent: false, error: "WhatsApp request failed." };
  }
}

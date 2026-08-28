/**
 * Minimal server-side transactional email sender.
 *
 * Uses the Resend HTTP API (https://resend.com) via a plain `fetch` call —
 * deliberately NOT the `resend` npm package, so this adds zero new
 * dependencies to the project. Resend has a generous free tier and is
 * officially supported on Vercel.
 *
 * This module must only ever be imported from `/api` serverless functions.
 * EMAIL_API_KEY is read from a server-only environment variable and is
 * never sent to the browser, returned in a response, or logged.
 *
 * Required env vars (set in Vercel Project Settings -> Environment Variables):
 *   EMAIL_API_KEY  — Resend API key (server-only secret)
 *   EMAIL_TO       — where contribution notifications should be delivered
 *   EMAIL_FROM     — verified sender address/domain in Resend
 *                    (optional — falls back to Resend's shared test sender)
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FALLBACK_FROM = "Teacher's Day Celebration 2026 <onboarding@resend.dev>";

export interface SendEmailInput {
  subject: string;
  text: string;
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendNotificationEmail({ subject, text }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.EMAIL_API_KEY;
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM || FALLBACK_FROM;

  if (!apiKey || !to) {
    // Missing email config should never block or fail a verified payment —
    // the payment is already genuine at this point. Log and move on.
    console.error("Email env vars missing: EMAIL_API_KEY / EMAIL_TO — skipping notification email.");
    return { sent: false, error: "Email service is not configured." };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
      }),
    });

    if (!res.ok) {
      // Never log the API key. Response body from Resend on error is safe
      // (just a message/status), but keep it generic in logs regardless.
      console.error("Email send failed with status", res.status);
      return { sent: false, error: "Email provider returned an error." };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Email send threw an error:", message);
    return { sent: false, error: "Email request failed." };
  }
}

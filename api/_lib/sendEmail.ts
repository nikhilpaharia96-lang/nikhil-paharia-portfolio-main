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
 *   EMAIL_TO       — where booking notifications should be delivered
 *   EMAIL_FROM     — verified sender address/domain in Resend
 *                    (optional — falls back to Resend's shared test sender)
 */

import nodemailer from "nodemailer";

/**
 * Two ways to send, picked by env vars:
 *  1. Gmail SMTP  — GMAIL_USER + GMAIL_APP_PASSWORD. Sends from your own Gmail to ANY address
 *     (clients included), no domain needed. (Gmail App Password: Google Account → Security →
 *     2-Step Verification → App passwords.)
 *  2. Resend      — EMAIL_API_KEY (+ EMAIL_FROM on a verified domain to reach clients).
 * Gmail is used whenever it is configured.
 */
async function sendViaGmail(opts: { to: string; subject: string; text: string; html?: string; replyTo?: string; attachments?: SendEmailInput["attachments"] }): Promise<SendEmailResult> {
  const user = process.env.GMAIL_USER as string;
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass: (process.env.GMAIL_APP_PASSWORD as string).replace(/\s+/g, "") },
    });
    await transport.sendMail({
      from: `Nikhil Paharia <${user}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      ...(opts.html ? { html: opts.html } : {}),
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    });
    return { sent: true };
  } catch (err) {
    console.error("Gmail SMTP send failed:", err instanceof Error ? err.message : "unknown error");
    return { sent: false, error: "Gmail SMTP error." };
  }
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FALLBACK_FROM = "Nikhil Paharia Portfolio <onboarding@resend.dev>";

export interface SendEmailInput {
  subject: string;
  text: string;
  /** Optional HTML version (the plain text stays as the fallback). */
  html?: string;
  /** Recipient. Defaults to EMAIL_TO (the site owner's inbox). */
  to?: string;
  /** Where replies go — set to the owner's inbox on emails sent to clients. */
  replyTo?: string;
  /** Optional file attachments (e.g. the booking PDF). */
  attachments?: { filename: string; content: Buffer }[];
}

export interface SendEmailResult {
  sent: boolean;
  error?: string;
}

export async function sendNotificationEmail({ subject, text, html, to: toOverride, replyTo, attachments }: SendEmailInput): Promise<SendEmailResult> {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const gmailTo = toOverride || process.env.EMAIL_TO || process.env.GMAIL_USER;
    return sendViaGmail({ to: gmailTo, subject, text, html, attachments, replyTo: replyTo || process.env.EMAIL_TO || process.env.GMAIL_USER });
  }

  const apiKey = process.env.EMAIL_API_KEY;
  const to = toOverride || process.env.EMAIL_TO;
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
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments?.length ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })) } : {}),
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

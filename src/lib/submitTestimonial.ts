import type { TestimonialSubmission } from "@/types/testimonial";

/**
 * Where new "Worked with me?" submissions go for review.
 *
 * This never writes directly into the live `testimonials` data — submissions
 * always land somewhere a human has to read and approve first:
 *
 * 1. If `VITE_TESTIMONIAL_ENDPOINT` is set (e.g. a Formspree/Getform URL, or
 *    your own small serverless function that appends to a "pending" table),
 *    the form POSTs the submission there as JSON with `status: "pending"`.
 * 2. Otherwise it falls back to opening a pre-filled email to you — still a
 *    real, working submission path with zero backend setup required. Once
 *    you wire up a real endpoint, remove/ignore the fallback by setting the
 *    env var.
 *
 * To go live with a moderation queue: create a `VITE_TESTIMONIAL_ENDPOINT`
 * pointing at a form backend (Formspree, Getform, a Supabase table via a
 * small edge function, etc.), store each submission with `status: "pending"`,
 * and only copy approved ones into `src/constants/testimonials.ts` by hand
 * (or read approved rows into that array from your own admin view).
 */
const ENDPOINT = import.meta.env.VITE_TESTIMONIAL_ENDPOINT as string | undefined;

/** Review inbox used when no endpoint is configured yet. */
const REVIEW_EMAIL = "nikhilpaharia96@gmail.com";

export type SubmitResult = { method: "endpoint" | "email" };

export async function submitTestimonial(payload: TestimonialSubmission): Promise<SubmitResult> {
  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, status: "pending" }),
    });
    if (!res.ok) {
      throw new Error(`Submission failed (${res.status}). Please try again in a moment.`);
    }
    return { method: "endpoint" };
  }

  // Fallback: no review endpoint configured — send it straight to your inbox
  // instead, pre-filled and ready to send. Photos aren't embedded in the
  // email body (mailto can't attach files), so we note that in the message.
  const lines = [
    `Name: ${payload.name}`,
    `Company / Brand: ${payload.company}`,
    `Role: ${payload.role}`,
    `Rating: ${payload.rating}/5`,
    payload.projectName ? `Project: ${payload.projectName}` : null,
    payload.website ? `Website / Social: ${payload.website}` : null,
    "",
    "Testimonial:",
    payload.content,
    "",
    payload.photoDataUrl
      ? "(A photo/logo was attached in the form — ask them to send it separately, mailto can't carry it.)"
      : null,
  ].filter(Boolean);

  const subject = encodeURIComponent(`New testimonial from ${payload.name}`);
  const body = encodeURIComponent(lines.join("\n"));
  window.location.href = `mailto:${REVIEW_EMAIL}?subject=${subject}&body=${body}`;

  return { method: "email" };
}

/**
 * Best-effort, in-memory guard against sending the same "contribution
 * received" notification email twice for the same Razorpay payment ID —
 * e.g. if the client retries /api/verify-payment after a flaky network
 * response, or double-fires the request.
 *
 * Same caveat as api/lib/rateLimit.ts: Vercel functions are stateless and
 * may run as multiple concurrent instances, so this Map is NOT a durable,
 * cross-instance guarantee. For a stronger guarantee, back this with a
 * shared store (e.g. Upstash Redis) keyed by payment ID. This in-memory
 * check is a cheap, effective reduction of duplicate emails in the common
 * case (same warm instance handling a quick retry).
 */

const notifiedPaymentIds = new Set<string>();
const MAX_TRACKED = 5000;

/**
 * Returns true if this payment ID has not been notified yet (and marks it
 * as notified). Returns false if it was already notified.
 */
export function markNotifiedIfNew(paymentId: string): boolean {
  if (notifiedPaymentIds.has(paymentId)) {
    return false;
  }
  if (notifiedPaymentIds.size >= MAX_TRACKED) {
    notifiedPaymentIds.clear();
  }
  notifiedPaymentIds.add(paymentId);
  return true;
}

/**
 * Shared Cashfree Payment Gateway configuration and request helpers.
 *
 * This calls Cashfree's REST API directly via `fetch` — deliberately NOT an
 * official Cashfree SDK package — for the same reason api/lib/sendEmail.ts
 * avoids the `resend` package: it adds zero new dependencies to the project.
 *
 * This module must only ever be imported from `/api` serverless functions.
 * CASHFREE_SECRET_KEY is read from a server-only environment variable and
 * is never sent to the browser, returned in a response, or logged — same
 * rule as RAZORPAY_KEY_SECRET (see api/create-order.ts).
 *
 * Required env vars (set in Vercel Project Settings -> Environment Variables):
 *   CASHFREE_APP_ID      — Cashfree Client ID
 *   CASHFREE_SECRET_KEY  — Cashfree Client Secret (server-only secret)
 *   CASHFREE_ENV         — "TEST" (sandbox) or "PRODUCTION" (live)
 */

// Cashfree Payment Gateway API version this integration is built against.
// See https://docs.cashfree.com/docs/versioning
export const CASHFREE_API_VERSION = "2023-08-01";

export interface CashfreeConfig {
  appId: string;
  secretKey: string;
  baseUrl: string;
  /** Normalized to exactly "TEST" or "PRODUCTION". */
  env: "TEST" | "PRODUCTION";
}

/**
 * Reads and validates Cashfree env vars. Returns null if not configured,
 * mirroring how api/create-order.ts treats missing Razorpay env vars.
 */
export function getCashfreeConfig(): CashfreeConfig | null {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const rawEnv = (process.env.CASHFREE_ENV || "TEST").trim().toUpperCase();

  if (!appId || !secretKey) {
    return null;
  }

  const env: "TEST" | "PRODUCTION" = rawEnv === "PRODUCTION" ? "PRODUCTION" : "TEST";
  const baseUrl = env === "PRODUCTION" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

  return { appId, secretKey, baseUrl, env };
}

/** Standard auth + versioning headers required on every Cashfree PG API call. */
export function cashfreeHeaders(config: CashfreeConfig): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": config.appId,
    "x-client-secret": config.secretKey,
  };
}

export interface CashfreeOrderResponse {
  order_id: string;
  cf_order_id?: string;
  order_status?: string;
  order_amount?: number;
  payment_session_id?: string;
  order_tags?: Record<string, string> | null;
}

export interface CashfreeOrderPayment {
  cf_payment_id: string | number;
  order_id?: string;
  payment_status: string; // "SUCCESS" | "FAILED" | "PENDING" | "USER_DROPPED" | "CANCELLED" | "VOID" | "NOT_ATTEMPTED"
  payment_amount?: number;
  payment_currency?: string;
  payment_time?: string;
}

/**
 * Client for the self-hosted UPI Gateway (https://github.com/mynkdev-21/upi-gateway).
 * Plain fetch, no dependency. Server-only: never import from src/.
 *
 * Env (Vercel → Project Settings → Environment Variables):
 *   UPI_GATEWAY_URL             e.g. https://pay.yourdomain.com   (no trailing slash)
 *   UPI_GATEWAY_API_KEY         key_xxx   (or test_key_xxx for sandbox)
 *   UPI_GATEWAY_API_SECRET      sec_xxx   (or test_sec_xxx)
 *   UPI_GATEWAY_WEBHOOK_SECRET  signing secret from Dashboard → API & Webhooks
 *   SITE_URL                    https://nikhilpaharia.com  (used for the return URL)
 */
import crypto from "node:crypto";

export interface UpiConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

export function getUpiConfig(): UpiConfig | null {
  const baseUrl = (process.env.UPI_GATEWAY_URL ?? "").trim().replace(/\/+$/, "");
  const apiKey = process.env.UPI_GATEWAY_API_KEY;
  const apiSecret = process.env.UPI_GATEWAY_API_SECRET;
  if (!baseUrl || !apiKey || !apiSecret || !/^https:\/\//.test(baseUrl)) return null;
  return { baseUrl, apiKey, apiSecret };
}

/** True when the site should take booking tokens through the UPI gateway. */
export const upiEnabled = () => (process.env.BOOKING_PAYMENT_PROVIDER ?? "").trim().toLowerCase() === "upi" && getUpiConfig() !== null;

export type UpiStatus = "pending" | "paid" | "expired" | "review" | "failed";

export interface UpiOrder {
  order_id: string;
  client_order_id: string;
  amount: string; // decimal string, rupees e.g. "481.00"
  currency: string;
  status: UpiStatus | string;
  utr: string | null;
  payment_url: string;
  expires_at: string | null;
  paid_at: string | null;
  test?: boolean;
}

export class UpiGatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function call(cfg: UpiConfig, path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<UpiOrder> {
  const res = await fetch(`${cfg.baseUrl}/api/v1/${path}`, {
    method: init.method,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
    headers: { "X-Api-Key": cfg.apiKey, "X-Api-Secret": cfg.apiSecret, "Content-Type": "application/json", Accept: "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: UpiOrder; message?: string } | null;
  if (!res.ok || !json?.success || !json.data) throw new UpiGatewayError(res.status, json?.message ?? `gateway HTTP ${res.status}`);
  return json.data;
}

export const createUpiOrder = (
  cfg: UpiConfig,
  a: { amountRupees: number; clientOrderId: string; name: string; email: string; mobile: string; note: string; redirectUrl?: string },
) =>
  call(cfg, "orders", {
    method: "POST",
    body: {
      amount: a.amountRupees,
      client_order_id: a.clientOrderId,
      customer_name: a.name.slice(0, 100),
      customer_email: a.email,
      customer_mobile: a.mobile,
      note: a.note.slice(0, 50),
      ...(a.redirectUrl ? { redirect_url: a.redirectUrl } : {}),
    },
  });

/** The gateway re-checks the provider when asked, so this is the authoritative status. */
export const fetchUpiOrder = (cfg: UpiConfig, orderId: string) => call(cfg, `orders/${encodeURIComponent(orderId)}`, { method: "GET" });

export const UPI_TOLERANCE_SECONDS = 300;

/** Verifies `X-Signature: t=<unix>,v1=<hex>` = HMAC-SHA256(secret, `${t}.${rawBody}`) with a 5-minute window. */
export function verifyUpiWebhook(rawBody: string, header: string | undefined, secret: string, nowSec = Math.floor(Date.now() / 1000)): boolean {
  if (!header || !secret) return false;
  const m = /^t=(\d+),v1=([a-f0-9]{64})$/.exec(header.trim());
  if (!m) return false;
  const t = Number(m[1]);
  if (!Number.isSafeInteger(t) || Math.abs(nowSec - t) > UPI_TOLERANCE_SECONDS) return false;
  const expected = Buffer.from(crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex"), "utf8");
  const got = Buffer.from(m[2], "utf8");
  return expected.length === got.length && crypto.timingSafeEqual(expected, got);
}

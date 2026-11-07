# Booking & Lead Management System

Flow: Services → service page → **Book Now** → 3-step modal (Client → Project → Payment) →
Razorpay → server verification → confirmation → `/admin` → WhatsApp.

## Setup (once)
1. Create a free Upstash Redis database; set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
2. Set `ADMIN_PASSWORD` (12+ chars) and `ADMIN_SESSION_SECRET` (32+ chars). Never commit them.
3. Razorpay keys as before. In Razorpay → Settings → Webhooks add `https://<site>/api/booking/webhook`
   with events **payment.captured** and **payment.failed**, secret = `RAZORPAY_WEBHOOK_SECRET`.
4. Redeploy. Open `/admin` and sign in.

## How payment safety works
- The browser sends details + budget only. The token (5%), advance (25%) and balance are computed on the
  server (`computeQuote`: token + advance rounded, balance = total − both, so they always sum exactly).
- A booking is confirmed only after the HMAC signature **and** a server-to-server fetch of the payment from
  Razorpay agree on order, `captured` status, INR and the exact expected amount.
- Each Razorpay payment id is applied once (atomic `SET NX` claim): the browser callback, retries and the
  webhook can all race and still produce one payment record and one set of emails.
- The lead is saved before payment, so abandoned checkouts show up as "Payment pending" leads. A retry reuses
  the same lead.

## Admin
`/api/admin/*` is a single serverless function (Vercel Hobby allows 12 functions). Session is an HMAC-signed,
8-hour, HttpOnly + Secure + SameSite=Strict cookie; login is throttled; state-changing calls check Origin.
No public endpoint returns client data.

## Tests
`npm test` (service logic, signatures, idempotency, admin auth + HTTP) · `npm run typecheck:api`.
Note: `src/lib/smoothScroll-3.ts` is an unused file that already failed `npm run typecheck` before this work.

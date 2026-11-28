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
Note: the unused, corrupt `src/lib/smoothScroll-3.ts` file has been removed.

## Admin features
Stats (incl. conversion rate, follow-ups due) · clickable pipeline counts · 14-day leads/revenue charts and
per-service breakdown · search, status / payment / service filters, sorting, "show more" · follow-up dates with
due badges · quick status change and call from each card · 5 WhatsApp templates (confirmation, advance reminder,
final-payment reminder, completed + review request, check-in) · record UPI/bank advance and final payments ·
CSV export (formula-injection safe) · re-send confirmation · delete unpaid spam leads (leads with payments are
never deletable — cancel them instead).

## Optional: WhatsApp AI assistant bridge
Set `N8N_BOOKING_WEBHOOK_URL` + `N8N_BOOKING_WEBHOOK_SECRET` (16+ chars) and, after each verified booking (and on
admin "Re-send confirmation"), the site POSTs a signed `booking.confirmed` event to your self-hosted n8n
(see `docs/BOOKING-INTEGRATION.md` in the whatsapp-ai-assistant repo). Signature = `sha256=` + HMAC-SHA256(secret,
`${X-Booking-Timestamp}.${rawBody}`). It carries no email and no project description. It is a silent no-op when
unconfigured and never blocks a booking. Leave `WHATSAPP_TOKEN` unset when using it, to avoid double messages.

**More events for the assistant** (same two env vars, no new variables; same signature scheme):
- `inquiry.created` → `<n8n>/webhook/inquiry-created`: sent when a *new* enquiry is saved. Structured facts only
  (ref, name, phone, service, budget, source). n8n WhatsApps **you** the lead plus a ready-to-copy `CLIENT:` command.
- `GET /api/admin/digest`: called once a day by n8n (header `X-Booking-Timestamp` + `X-Booking-Signature` =
  `sha256=` HMAC-SHA256(secret, `<timestamp>.digest`), max 5 min old). Returns today's follow-ups due, number of new enquiries
  and bookings with balance pending, no email or project text. n8n sends it to you as a morning WhatsApp.
  n8n needs `PORTFOLIO_BASE_URL` (e.g. `https://your-site.vercel.app`) in its variables.

## Getting clients: enquiry, source tracking, lead engine
- Step 3 of the modal has **"Not ready to pay? Send an enquiry — no payment"** (`/api/booking/inquiry`): saves the
  lead, emails you immediately, shows as an *Enquiry* in `/admin`. Rate-limited + honeypot. (Functions used: 11/12.)
- `utm_*` params / external referrer are remembered for 30 days (`src/lib/attribution.ts`) and stored on the lead as
  its **source**; `/admin` → Insights → *By source*.
- Optional `VITE_CAL_LINK` adds "Book a free 15-minute call" on service pages and after an enquiry.
- `tools/leadgen/` — Google-Maps CSV → scored leads → listmonk-ready outreach lists. See its README.

## Optional: UPI Gateway instead of Razorpay
Takes the booking token through the self-hosted [UPI Gateway](https://github.com/mynkdev-21/upi-gateway) (Laravel app you host
separately on cPanel/VPS — it cannot run on Vercel). Razorpay stays as the default; nothing changes until you set the env vars.

1. Install the gateway, add your UPI/PG account, then in its dashboard: **Settings → allowed redirect domains** = your site's
   domain, and **API & Webhooks** → copy the API key/secret and the *Live* webhook signing secret.
2. Webhook URL in the gateway: `https://<site>/api/booking/upi-webhook`.
3. Vercel env vars:
   `BOOKING_PAYMENT_PROVIDER=upi`, `UPI_GATEWAY_URL=https://pay.yourdomain.com`, `UPI_GATEWAY_API_KEY`,
   `UPI_GATEWAY_API_SECRET`, `UPI_GATEWAY_WEBHOOK_SECRET`, `SITE_URL=https://yourdomain.com`.
   (Use the `test_key_…` / `test_sec_…` pair first — it creates sandbox orders only.) Remove `BOOKING_PAYMENT_PROVIDER` to go back to Razorpay.
4. Redeploy.

Flow: `create-order` saves the lead, computes the token server-side, creates a gateway order → browser is redirected to the
gateway's hosted checkout → after payment the gateway sends the customer to `/booking/return?order_id=…` → that page calls
`verify-payment` (`upi_order_id`) which **re-reads the order from the gateway API** and requires `paid`, INR, the exact token and
our own `client_order_id` (`bk_<lead>_<n>`). `/api/booking/upi-webhook` (HMAC `t=…,v1=…`, 5-min window) is the safety net for
customers who never come back; it also re-fetches instead of trusting the body. Each order is applied once (same atomic claim).
`?status=paid` in the URL is never trusted.

Notes: gateway max per order is ₹1,00,000 (larger tokens are refused → use enquiry). Orders expire (~15 min) — a retry creates a
new order for the same lead. Functions used: 12/12 on Vercel Hobby (the new `upi-webhook` is the 12th). Paytm *Business*
verification in the gateway is unofficial and manual-UTR orders land in "review" (we show "verifying" and confirm only when
the gateway marks it paid) — for real client money prefer a Paytm PG / PhonePe PG account or a current-account VPA.

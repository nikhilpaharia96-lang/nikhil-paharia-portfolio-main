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

## Getting clients: enquiry, source tracking, lead engine
- Step 3 of the modal has **"Not ready to pay? Send an enquiry — no payment"** (`/api/booking/inquiry`): saves the
  lead, emails you immediately, shows as an *Enquiry* in `/admin`. Rate-limited + honeypot. (Functions used: 11/12.)
- `utm_*` params / external referrer are remembered for 30 days (`src/lib/attribution.ts`) and stored on the lead as
  its **source**; `/admin` → Insights → *By source*.
- Optional `VITE_CAL_LINK` adds "Book a free 15-minute call" on service pages and after an enquiry.
- `tools/leadgen/` — Google-Maps CSV → scored leads → listmonk-ready outreach lists. See its README.

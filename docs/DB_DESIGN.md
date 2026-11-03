# Supabase Database Design (DRAFT for approval — nothing applied)

Branch: `feature/supabase-booking-foundation`. No migration has been written to a database. No code
depends on this schema yet. After approval, SQL goes into `supabase/migrations/` and is tested before any use.

## 0. Principles
- **Public users never touch the database directly.** Every public flow goes through Vercel `/api` functions
  using the service-role key (server env only). The browser never receives a Supabase key that can read data.
- **RLS enabled on every table; `anon` has zero grants.** Admin access is by policy, from an `admin_users` table
  (never from `user_metadata`, which users can edit).
- **Money is `bigint` paise**, never floats. Existing rupee maths is preserved (token = round 5%,
  start = round 25%, final = remainder) so totals always add up.
- **Amounts come only from admin-approved quotes.** The browser never sends an amount that is charged.
- **Idempotency is a database constraint**, not memory: unique keys on payments, webhook events and notifications.
- All times `timestamptz` (UTC); shown in IST in the UI.

## 1. Enums
| Enum | Values |
|---|---|
| `booking_status` | `pending_quote, quote_approved, awaiting_token, confirmed, upcoming, active, completed, cancelled, expired` |
| `project_status` | `not_started, in_progress, in_review, revisions, delivered, on_hold` |
| `quote_status` | `pending, approved, rejected, expired, superseded` |
| `installment_kind` | `token, start, final` |
| `installment_status` | `scheduled, order_created, paid, failed, cancelled` |
| `payment_status` | `captured, failed, refunded, needs_review` |
| `admin_role` | `owner, admin, staff` |
| `outbox_status` | `queued, sending, sent, failed, dead` |

## 2. Tables
Legend: PK primary key, FK foreign key, UQ unique.

### Identity & access
**admin_users** — `user_id` PK/FK→`auth.users`, `email`, `role admin_role`, `active`, `created_at`.

**clients** — `id` PK, `name`, `email` (stored lowercase), `phone` (E.164, 10-digit Indian mobile normalised),
`whatsapp_wa_id`, `source`, `created_at`. UQ(`phone`), index on `email`. A returning client reuses the row.

**client_consents** (append-only) — `id`, `client_id` FK, `channel` (`whatsapp|email`), `status` (`granted|revoked`),
`source`, `created_at`. Latest row per (client, channel) is the current consent.

### Catalogue
**services** — `slug` PK (the 8 existing slugs), `title`, `starting_price_paise`, `unit`, `active`, `sort_order`,
`content jsonb` (description, deliverables, workflow, FAQs, objections, required info), `updated_by`, `updated_at`.
Seeded from `shared/servicePricing.ts` + `serviceInfo.ts`. Admin-editable later.

### Quoting & booking
**quotes** — `id` PK, `client_id` FK, `service_slug` FK, `requirements text`, `status quote_status`,
`total_paise` (null until approved), `token_percent`, `start_percent`, `valid_until`, `approved_by` FK→admin_users,
`approved_at`, `version`, `access_token_hash` (SHA-256 of the client's private link token), `created_at`.
Checks: approved ⇒ `total_paise >= service minimum`, `approved_by` and `approved_at` set; percents 1–90, sum ≤ 90.

**bookings** — `id` PK (uuid), `booking_code` UQ (e.g. `NPD-2026-000123`, from a sequence), `client_id` FK,
`service_slug` FK, `quote_id` UQ FK (one booking per quote), `status booking_status`, `project_status`,
`total_paise`, `start_date`, `slot_hold_until`, `cancelled_reason`, `created_at`, `updated_at`.
Status moves only along the allowed transitions (section 4), enforced by a trigger.

**booking_events** (append-only) — `id`, `booking_id` FK, `from_status`, `to_status`, `actor_type`
(`admin|system|webhook|client`), `actor_id`, `note`, `created_at`. Full history of every status/project change.

**installments** — `id` PK, `booking_id` FK, `kind installment_kind`, `amount_paise`, `status installment_status`,
`razorpay_order_id` UQ (nullable until created), `due_at`, `paid_at`.
UQ(`booking_id`,`kind`). A trigger ensures token + start + final = booking total, and that amounts become
immutable once an order exists. This is where "token adjusted against total" lives: the token is installment 1
of the total, not an extra charge.

### Payments
**payments** — `id` PK, `installment_id` FK, `booking_id` FK, `provider` (`razorpay`), `provider_payment_id`,
`provider_order_id`, `amount_paise`, `currency`, `status payment_status`, `method`, `verified_via`
(`signature|webhook|both`), `captured_at`, `created_at`. UQ(`provider`,`provider_payment_id`) — the same payment
can never be recorded twice. Partial UQ on (`installment_id`) where `status='captured'` — an installment can be
paid once.
Unexpected cases (late payment on expired booking, wrong amount) are stored as `needs_review`, never dropped.

**webhook_events** — `id`, `provider` (`razorpay|whatsapp`), `event_id`, `event_type`, `payload jsonb`,
`signature_valid`, `status` (`received|processed|ignored|failed`), `attempts`, `error`, `received_at`,
`processed_at`. UQ(`provider`,`event_id`). Retries of the same event hit the constraint and are acknowledged
without re-processing.

### Delivery (Gmail / WhatsApp / admin alerts)
**notifications** (outbox) — `id`, `booking_id` FK nullable, `client_id` FK nullable, `channel`
(`email|whatsapp|admin`), `kind` (e.g. `booking_confirmation`), `dedupe_key` UQ, `payload jsonb`,
`status outbox_status`, `attempts`, `next_attempt_at`, `provider_message_id`, `last_error`, `sent_at`.
`dedupe_key` such as `booking_confirmation:email:<booking_id>` guarantees one send even if the webhook is retried.
A claim function uses `FOR UPDATE SKIP LOCKED`, so two workers cannot send the same row.

**documents** — `id`, `booking_id` FK, `kind` (`quotation|booking_confirmation|invoice`), `version`, `storage_path`
(private bucket), `sha256`, `created_at`. UQ(`booking_id`,`kind`,`version`).

### Foundations for WhatsApp / Gemini / dashboard (created now, no behaviour yet)
**conversations** — `id`, `client_id` FK, `channel`, `wa_id` UQ, `ai_enabled default true`,
`handover` (`ai|human`), `assigned_to` FK, `last_inbound_at` (drives the 24-hour window), `last_message_at`.
**messages** — `id`, `conversation_id` FK, `direction`, `provider_message_id` UQ (WhatsApp retry dedupe),
`type`, `body`, `media jsonb`, `status`, `created_at`.
**leads** — `id`, `client_id` FK, `conversation_id` FK nullable, `service_slug`, `score`, `status`,
`summary`, `source`, `created_at`.
**audit_logs** (append-only, even against the service role) — `id`, `actor_type`, `actor_id`, `action`, `entity`,
`entity_id`, `diff jsonb`, `ip`, `created_at`.
**rate_limits** — `key`, `window_start`, `count`; function `rate_limit_hit(key, limit, window)` replaces the
in-memory limiter.

Deferred (purely additive later, no restructuring): meetings, knowledge-base documents, feedback, referrals,
follow-up reminders, analytics views.

## 3. Relationships
```
clients 1─∞ quotes ∞─1 services
quotes 1─1 bookings 1─∞ installments 1─∞ payments
bookings 1─∞ booking_events / documents / notifications
clients 1─∞ conversations 1─∞ messages ;  clients 1─∞ leads
admin_users 1─∞ quotes.approved_by / audit_logs.actor_id
```

## 4. Booking status machine
```
pending_quote ─▶ quote_approved ─▶ awaiting_token ─▶ confirmed ─▶ upcoming ─▶ active ─▶ completed
      │               │                 │              │            │          │
      └───────────────┴─────────────────┴──▶ cancelled ◀───────────┴──────────┘
      └─▶ expired      └─▶ expired        └─▶ expired
```
- `pending_quote`: client asked for a quote. `quote_approved`: admin set the price.
- `awaiting_token`: client accepted; Razorpay order for the token exists. `confirmed`: token **verified server-side**.
- `upcoming`: start date set. `active`: work in progress. Terminal: `completed`, `cancelled`, `expired`.
- Only the payment function moves `awaiting_token → confirmed`; the browser cannot.
- `expired` is set by a scheduled job when `quote.valid_until` / slot hold passes without the token.
- Project status (`not_started … delivered`) is separate, so "active but in revisions" is representable.

## 5. Payment flow (server-approved, idempotent)
1. Admin approves a quote → DB function creates the booking and 3 installments (5% / 25% / 70%) from the approved total.
2. Client opens the private link → API creates the Razorpay order **for the stored `amount_paise`** and saves
   `razorpay_order_id` on the installment. Order notes carry only the booking/installment IDs (no personal data).
3. Checkout success → `verify` API: HMAC signature, then fetch payment + order from Razorpay, check
   order id matches the stored one, amount equals `amount_paise`, currency INR, status `captured`.
4. Webhook `payment.captured` (signature over raw body) goes through the **same** DB function `record_payment()`.
5. `record_payment()` runs in one transaction: insert payment (UQ conflict ⇒ already done), mark installment paid,
   advance booking status, enqueue notifications (UQ `dedupe_key`), write audit log. Verify and webhook can race;
   exactly one wins.
6. Start/final installments reuse steps 2–5 (Razorpay Payment Links or orders) when the admin marks them due.

## 6. Indexes
- `bookings(status, created_at desc)`, `bookings(client_id)`, `bookings(start_date) where status in ('confirmed','upcoming')`
- `quotes(status, valid_until)` (expiry job), `quotes(client_id)`
- `installments(booking_id)`, `installments(status, due_at)`; UQ(`razorpay_order_id`)
- `payments(booking_id)`, UQ(`provider`,`provider_payment_id`), partial UQ captured per installment
- `webhook_events` UQ(`provider`,`event_id`), `(status, received_at)`
- `notifications(status, next_attempt_at)`, UQ(`dedupe_key`)
- `messages(conversation_id, created_at)`, UQ(`provider_message_id`)
- `conversations(last_message_at desc)`, `leads(status, score desc)`
- `clients` UQ(`phone`), `clients(lower(email))`

## 7. Security policies
Helper functions (`SECURITY DEFINER`, `search_path=''`): `is_admin()` (active row in `admin_users`),
`has_role(role[])`.

| Table | anon | staff | admin | owner | Writes by service role only |
|---|---|---|---|---|---|
| admin_users | – | own row (read) | own row (read) | read/write all | – |
| clients, leads, conversations, messages | – | read/write | read/write | read/write | inbound webhook writes |
| services | – | read | read/write | read/write | – |
| quotes, bookings, installments | – | read | read; approve/price via function | same | create from public flow |
| booking_events, audit_logs | – | – | read | read | all inserts |
| payments, webhook_events | – | – | read | read | all inserts/updates |
| notifications, documents | – | – | read | read | all inserts/updates |
| client_consents | – | read | read | read | inserts |

- `REVOKE ALL ... FROM anon` and from `authenticated` on all tables, then grant only what policies need.
- `audit_logs`, `booking_events`, `client_consents`: UPDATE/DELETE blocked by trigger.
- Storage: private `booking-pdfs` bucket, no public policies; downloads via short-lived signed URLs created server-side
  after an admin check.
- Client access to their own quote/booking is by an unguessable link token (hash stored), validated in the API —
  not by giving clients database logins.

## 8. Security risks found and mitigations
1. **Service-role key leak** — only in server env; `VITE_*` vars are public in Vite, so a CI check will fail the
   build if `SERVICE_ROLE` appears under `src/`.
2. **Personal data in Razorpay notes** (current flow stores name/email/phone) — new flow stores IDs only.
3. **Client-chosen price** (current flow) — replaced by admin-approved amounts.
4. **Self-signup on Supabase Auth** — disable public signups; admins are created by the owner; require MFA.
5. **Late or wrong-amount payments** — recorded as `needs_review` and surfaced to admin; never silently lost.
6. **Serverless function limit** — the repo notes a 12-function limit on Vercel Hobby and uses 8 now. New endpoints
   will be consolidated behind a few routers (`api/quotes`, `api/pay`, `api/admin/[...path]`, plus the existing
   webhook) to stay under the limit.
7. **Free-tier Supabase** may pause on inactivity and has limited backups — keep-alive + scheduled export in a later step.
8. **Expiry needs a scheduler** — `pg_cron` inside Supabase (verify availability on your plan) or a Vercel cron.

## 9. Compatibility
- Existing `/api/booking/*`, `/api/create-order`, `/api/verify-payment`, `/api/cashfree/*` and `/payment` stay
  untouched. The new flow lives in new endpoints behind a feature flag; the booking dialog switches only after
  the new flow passes testing. Legacy payments do not write to the new tables.

## 10. How it will be tested
Migrations run against a local in-process Postgres (PGlite) with a stubbed `auth` schema: constraints, state-machine
trigger, idempotent `record_payment()` (replayed twice, raced), installment sums, append-only tables.
RLS behaviour for real Supabase roles can only be fully proven on a real Supabase project (needs your project);
that check will be reported as pending until then.

## 11. Open decisions
1. **"Book Now"** with admin-approved pricing: either every request waits for admin approval, or admin can mark
   standard packages as "instant book" at an admin-set fixed price (still server-approved).
2. **Token refund policy** on cancellation (stored per booking; default: manual decision by admin).
3. Default quote validity (proposed 7 days) and slot-hold length (proposed 48 hours).

# Audit & Implementation Roadmap

Status: Phase 1 complete (read-only audit). No application code has been modified yet.
Audited commit: `050e854`. Audit method: read the API, shared pricing, booking and email code;
ran `npm ci`, `npm run typecheck` and `npm run build`. Items marked **(not verified)** were not checked.

## 1. What exists today

| Area | Current state |
|---|---|
| Framework | Vite 5 + React 18 + TypeScript, Tailwind v4, wouter routing, Framer Motion / GSAP |
| Hosting | Vercel (SPA rewrite + `/api` serverless functions) |
| Routes | `/` (portfolio), `/services/:slug` (8 services), `/payment` (Support page), 404 |
| Database | **None** |
| Authentication / admin | **None** |
| Payments | Razorpay booking token (`api/booking/*`), plus older Razorpay (`api/create-order.ts`, `api/verify-payment.ts`) and Cashfree (`api/cashfree/*`) endpoints used by `/payment` |
| Email | Gmail SMTP (nodemailer) or Resend fallback; owner alert + client quotation email |
| Contact form | Formspree; testimonials via endpoint with `mailto:` fallback |
| Pricing / services | `shared/servicePricing.ts` (single source of truth for server + browser), `shared/serviceInfo.ts`, `src/constants/serviceDetails.ts` |
| Tests | **None** (no test runner, no test script) |

### What is already good (keep)
- Razorpay booking flow is server-authoritative: the token is computed on the server, the HMAC
  signature is checked with `timingSafeEqual`, and the payment and order are re-fetched from Razorpay
  before success is returned. Success is never decided by the browser.
- Split maths matches your example: ₹20,000 → ₹1,000 / ₹5,000 / ₹14,000
  (`computeQuote` in `shared/servicePricing.ts`).
- Webhook verifies `x-razorpay-signature` over the raw body.
- Secrets are read from env vars; `.env` is gitignored; `.env.example` has placeholders only
  (git history was **not** scanned for past leaks).
- Shared pricing module avoids browser/server price drift.

## 2. Findings

### Critical / high
1. **No persistence.** A booking exists only as a Razorpay order note and two emails. There is no
   booking record, no lead record, no way to build an admin dashboard, CRM or reports from this.
2. **Idempotency and rate limiting are in-memory** (`api/_lib/sentPayments.ts`, `rateLimit.ts`).
   Serverless instances don't share memory, so a webhook retry or a verify/webhook race on different
   instances can send duplicate emails, and rate limits can be bypassed. The code comments say so too.
   This must move to a database unique constraint before PDFs/WhatsApp are added.
3. **Booking confirmation has no durable state.** Confirmation work (emails) is triggered from both
   `verify-payment` and `webhook`, but neither writes a "confirmed" record. If email config is missing or
   fails, the booking is silently lost apart from the Razorpay dashboard.
4. **Only the 5% token is collectable online.** The 25% start payment and 70% final payment have no payment
   flow at all (they appear only as text in the emails).
5. **Client-chosen total.** The browser sends the project total; the server only enforces
   `total >= startingPrice`. Fine for a calculator-style quote, but it means the agreed price is not
   confirmed by you before money is taken. Needs a product decision (see section 5).
6. **`npm run typecheck` fails.** `src/lib/smoothScroll-3.ts` is a 13.5 KB file of NUL bytes
   (corrupt, unused). The production build still passes because Vite never imports it.
7. **CI is broken.** `.github/workflows/webpack.yml` runs `npx webpack`, but the project uses Vite and has
   no webpack config. It also doesn't run typecheck.

### Medium
8. **Legacy / unrelated payment code.** `api/create-order.ts` and `api/verify-payment.ts` use "studentName"
   and "semester" rules (`shared/semesterRules.ts`) and send "contribution received" emails; this looks like
   code from a different project. Together with Cashfree, there are three payment systems for one business.
   Risk: duplicate systems, more attack surface, confusing `/payment` page.
9. **Dead and duplicate files:** `src/components/App.tsx` (second App, not used by `main.tsx` routes),
   `Cursor`, `LoadingScreen`, `CinematicSection`, `CloudPhotoSection` appear unused by the active `App.tsx`;
   `*.txt` backups (`Footer.tsx.txt`, `Testimonials.txt`, `SplitText.tsx.txt`, `SubmitTestimonialModal.tsx.txt`),
   `src/assets/audio/N`, `smoothScroll.ts` / `smoothScroll-3.ts`, duplicate PNG+WebP images.
10. **Performance.** The main bundle is one 1.04 MB chunk (359 KB gzip). `App.tsx` imports all sections
    statically, although the README says below-the-fold sections are lazy-loaded. Several images are
    2–3.3 MB (`about-3/4.webp`, `tea-garden-hero.png`, `Assam landscape.png`, and others), and a 2.3 MB
    loading video is in the bundle. Whether `three`, `swiper`, `react-pageflip` are actually used is
    **(not verified)**.
11. **SEO.** One static title/description for the whole site; no `sitemap.xml`, canonical URLs or JSON-LD
    (`LocalBusiness`/`Service`); `og:image` is a relative URL (social scrapers need absolute);
    `viewport` has `maximum-scale=1`, which blocks pinch-zoom (accessibility). A `usePageSeo` hook exists
    for service pages, but they're client-rendered.
12. **Security headers.** `vercel.json` sets no CSP, `X-Content-Type-Options`, `Referrer-Policy`,
    `frame-ancestors`. `getClientIp` trusts the first `x-forwarded-for` value.
13. **Booking verify accepts `authorized` payments** as verified. Order is created with
    `payment_capture: true`, so this is likely harmless, but "confirmed" should key off `captured`.
14. **Email transport** is recreated per send and failures only log; no retry or outbox.

### Low
15. All frontend libraries are in `devDependencies` (works for Vite, but unconventional).
16. Formspree form ID is hardcoded (public by design; acceptable).
17. Hindi/Assamese content: site is English only; the assistant will need localisation rules.

## 3. External constraints to plan around (verify at build time)
- **WhatsApp Cloud API:** needs a Meta Business account, a dedicated phone number, and business verification
  for production. Free-form replies are only allowed inside the 24-hour customer-service window; outside it you
  need pre-approved **message templates**. Sending the confirmation PDF after payment will normally fall inside
  an active chat, but not always, so a template fallback is needed. Per-conversation/template pricing changes;
  check Meta's current India rate card before promising costs.
- **Gemini API:** free-tier quotas and terms (including how free-tier data may be used) differ from paid.
  Customer chats contain personal data; confirm terms before production use and plan for a paid tier if needed.
- **Supabase free tier:** free projects can be paused after a period of inactivity and don't include the
  same backup guarantees as paid plans. Needs a keep-alive and our own scheduled backup export.
- **Vercel functions:** execution time limits depend on plan. The WhatsApp webhook must acknowledge Meta
  quickly and process the AI reply asynchronously (queue/outbox table + worker), not inline.
- **Razorpay:** staged payments (25% / 70%) should use Payment Links or per-stage orders tied to the booking ID.

## 4. Proposed architecture (economical, no new paid services by default)
- **Keep Vercel** for the SPA and all API routes (already deployed, webhooks already work there).
- **Add Supabase** (Postgres + Auth + Storage) as the only new service: bookings, payments, webhook events,
  leads, conversations, messages, services, knowledge base, audit logs, PDFs (private bucket, signed URLs).
- **Cloudflare Workers: not recommended initially.** A second deploy target duplicates secrets, logging and
  deploys. Revisit only if Vercel limits actually block the WhatsApp webhook.
- **Idempotency:** `webhook_events(provider, event_id UNIQUE)` and `notifications(booking_id, kind UNIQUE)` so
  retries are safe across instances.
- **Admin auth:** Supabase Auth (email + password or magic link), allow-list of admin emails, RLS on every table,
  service-role key only in server code.
- **Dependencies to add (minimal):** `@supabase/supabase-js`, a PDF library (e.g. `pdf-lib` or `pdfkit`),
  `vitest` for tests. Gemini and WhatsApp are plain `fetch` calls, no SDKs needed.

## 5. Decisions needed from you
1. Keep or remove the legacy `/payment` page, Cashfree, and the semester-based Razorpay endpoints?
2. Price model: keep "client picks a total ≥ starting price", or require an admin-approved quote
   before the token is payable (safer for custom work)?
3. Confirm the WhatsApp Business number and Meta developer account status.
4. OK to add Supabase as the only new service?

## 6. Prioritized roadmap

| # | Work | Value | Complexity | Added cost | Depends on |
|---|---|---|---|---|---|
| 0 | Housekeeping: delete corrupt/dead files, fix CI (`vite build` + typecheck), add vitest tests for `computeQuote` | High | Low | None | none |
| 1 | Supabase schema + RLS + migrations; durable idempotency; move rate limit to DB | Very high | Medium | Free tier (verify limits) | decision 4 |
| 2 | Booking hardening: persist booking on verify AND webhook, `captured` only, outbox for emails, audit log | Very high | Medium | None | 1 |
| 3 | Three booking options (Book Now / Reserve My Slot / Get a Quote), quotation records | High | Medium | None | 1, decision 2 |
| 4 | Booking Confirmation PDF + email attachment + private storage + admin notice | High | Medium | None | 2 |
| 5 | Staged payments (25% start, 70% final) via Razorpay Payment Links, status per stage | High | Medium | Razorpay fees | 2 |
| 6 | Service knowledge base tables + seed from existing `serviceDetails` / `serviceInfo` | High | Medium | None | 1 |
| 7 | Admin dashboard v1: auth, bookings, payments, leads, services/pricing editor, PDFs | High | High | None | 1–6 |
| 8 | WhatsApp Cloud API webhook + send (signature check, consent, outbox, 24h window handling) | Very high | High | Meta conversation fees | 1, Meta setup |
| 9 | Gemini assistant: language handling, one-question-at-a-time flow, grounded only in KB/prices, human handover, AI on/off per chat | Very high | High | Gemini usage | 6, 8 |
| 10 | Live conversations + takeover in admin | High | Medium | None | 7, 9 |
| 11 | Smart features: lead scoring, follow-up reminders, abandoned-booking recovery, high-value-lead alerts, feedback request, revenue/service analytics | Medium–High | Medium | Mostly none | 7–9 |
| 12 | Portfolio polish: code-split sections, image compression, SEO (per-page meta, sitemap, JSON-LD, absolute OG), remove `maximum-scale`, mobile nav review | Medium | Medium | None | can run in parallel |
| 13 | Security headers/CSP, backup job (scheduled `pg_dump` export), runbook and docs | High | Low–Medium | None | 1 |

Referral system, geographic analytics and repeat-client tagging are deferred until there is data to justify
them. They are cheap to add after step 7.

## 7. Testing plan (what will and will not be claimed)
Automated: pricing split maths, signature verification, webhook idempotency (replay same event twice),
admin authorization (RLS), PDF generation, booking state machine. Manual with real credentials (cannot be done
without your accounts): Razorpay test payment, WhatsApp delivery, Gmail delivery, assistant conversation quality
in all four languages. Anything not run will be reported as untested.

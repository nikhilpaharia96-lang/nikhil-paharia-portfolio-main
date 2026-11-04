# WhatsApp booking PDF — set-up guide

What the website already does (verified in code, `api/_lib/whatsapp.ts` + `bookingEmail.ts`):
after a **verified** Razorpay token payment it builds the A4 PDF, emails it (owner + client) and sends it to the
client's WhatsApp with an approved **template message** (PDF in the header). Missing WhatsApp config never breaks a booking.

## Which number can send?

| Option | Same number in Business App? | Third party? | Notes |
|---|---|---|---|
| **A. New dedicated number on Cloud API** (recommended) | Your existing number is untouched | None | Free to set up. Client replies land on the API number — use a template button that opens your main number. |
| B. Coexistence (same number, app + API) | Yes | Needs a Meta **Tech Provider / Solution Partner** to run Embedded Signup | Meta docs: "You must already be a Solution Partner or Tech Provider". Not available from a plain developer-app dashboard. |
| C. Migrate the app number to Cloud API | **No** — the number stops working in the Business App | None | Do NOT do this if you want to keep the app. |

## Option A, step by step

1. **Get a number** that is *not* registered on any WhatsApp / WhatsApp Business app (a cheap new SIM or a virtual number that can receive an SMS/call OTP). Keep your current number as is.
2. developers.facebook.com → your app → **WhatsApp → API Setup**. Under *Step 5 / Add phone number*, add the new number, verify by OTP.
   Note two IDs: **Phone number ID** and **WhatsApp Business Account ID**.
3. **Display name**: WhatsApp Manager → Phone numbers → set it to "Nikhil Paharia" (needs Meta approval, usually fast).
4. **Business verification**: Business Settings → Security Center → *Start verification* (required to leave the starter limits; do it now, it can take days).
5. **Permanent token**: Business Settings → Users → **System users** → Add (Admin) → *Add assets* → your app (full control) and your WhatsApp account (full control) → **Generate token** → pick your app → expiry **Never** → permissions `whatsapp_business_messaging` + `whatsapp_business_management`. Copy it once; store only in Vercel.
6. **Template**: WhatsApp Manager → Message templates → Create:
   - Category **Utility**, name `booking_confirmation`, language **English** (`en`)
   - Header **Document** (upload any sample PDF)
   - Body: `Hi {{1}}, thank you for booking {{2}}! Your booking confirmation and quotation are attached. I'll contact you shortly.` (add sample values: Rahul / Website Development)
   - Button (optional): *Visit website* → `https://wa.me/91XXXXXXXXXX` (your main number) with text "Chat with Nikhil"
   - Submit; wait for **Approved**.
7. **Payment method**: WhatsApp Manager → Payment settings → add a card (Meta bills per conversation; utility templates cost roughly ₹0.1–0.2 each, and a free allowance applies).
8. **Vercel** → Project → Settings → Environment Variables (Production): `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME=booking_confirmation`, `WHATSAPP_TEMPLATE_LANG=en`. **Redeploy.**
9. **Verify locally** (never prints the token). Put the same values plus `WHATSAPP_BUSINESS_ACCOUNT_ID` in a local `.env` (it is git-ignored), then:
   ```
   node --env-file=.env scripts/whatsapp-check.mjs
   node --env-file=.env scripts/whatsapp-check.mjs --send 98XXXXXXXX --pdf ./sample.pdf
   ```
10. Make one real test booking and confirm: email PDF ✓, WhatsApp PDF ✓.

## Option B (coexistence) — only if you must keep the same number on both

You need a Tech Provider / BSP that offers Coexistence onboarding (many Indian BSPs do; most charge a monthly fee).
Requirements Meta lists: WhatsApp Business **app v2.24.17+**, number already active in the app, scan a QR code from the app during sign-up.
Trade-offs: fixed 20 msg/sec, broadcast lists become read-only, disappearing/view-once/live-location off in 1:1 chats,
WhatsApp for Windows can't stay linked, groups/calls not available via API. The provider then gives you
the Phone Number ID + token (or you use their API) — the site code only needs `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` if the provider exposes the standard Cloud API.

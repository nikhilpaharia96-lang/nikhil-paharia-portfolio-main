# Lead engine — find local businesses that need you, email them properly, track who becomes a client

```
google-maps-scraper → audit.mjs (this folder) → listmonk (email) → portfolio (enquiry / free call / Book Now) → /admin
        leads CSV        scores + drafts           campaign            tracked by utm source             follow-up
```

Nothing here sends anything by itself. It prepares **small, honest, targeted** batches that you review and send.

## 0. One-time setup (≈1 hour)
1. `cp tools/leadgen/config.example.json tools/leadgen/config.json` and fill in your **real postal address**
   (the tool refuses to run with a placeholder — commercial email needs a real sender identity + address).
2. **Email sending**: use a *separate* domain/subdomain (e.g. `hello@mail.yourdomain.com`), never your main one.
   Set up SPF, DKIM and DMARC for it with your SMTP provider (Brevo / Amazon SES / Resend). Gmail is not for bulk.
3. **listmonk** (self-host on Railway/Oracle, or any host): Settings → SMTP → your provider. Create two lists:
   `no-website` and `site-issue`.
4. Optional: a free [Cal.com](https://cal.com) account → put the link in `config.json` (`calLink`) and in Vercel as
   `VITE_CAL_LINK`. (Cal.diy self-hosting is not needed to start — the hosted free plan avoids another server.)

## 1. Get leads (≈10 min)
Put queries in `queries.txt`, one per line, **one niche + one city at a time**:
```
dentist in Jaipur
```
Run google-maps-scraper (flags per its README; `-email` also pulls emails from the businesses' own sites):
```bash
docker run -v gmaps-playwright-cache:/opt -v "$PWD/queries.txt:/queries.txt:ro" -v "$PWD/gmaps-out:/out" \
  gosom/google-maps-scraper -input /queries.txt -results /out/results.csv -depth 1 -email -exit-on-inactivity 3m
```
> ⚠️ Scraping Google Maps is against Google's Terms of Service. Keep it small and occasional, or use Google's
> official Places API instead. This repo never scrapes Google itself — it only reads the CSV you give it.

## 2. Audit + score (≈2 min)
```bash
node tools/leadgen/audit.mjs --in gmaps-out/results.csv --niche "dentist" --city "Jaipur" --limit 25
```
It visits each business's homepage **once** (respects `robots.txt`), checks mobile-friendliness, HTTPS, contact/booking
path, out-of-date footer, speed, finds emails, and scores every business. Output in `tools/leadgen/out/dentist-jaipur/`:

| File | Use |
|---|---|
| `outreach-no-website.csv`, `outreach-site-issue.csv` | import into the matching listmonk list (**Subscribers → Import**) |
| `campaign-*.html` | paste as the campaign body (editable; has the unsubscribe link + your address) |
| `subjects.txt` | pick one subject per campaign |
| `call-list.csv` | good prospects without a usable email → **call them yourself**, using the talking point |
| `leads-scored.csv` | everything, with reasons |

Safety defaults: only **role / own-domain** emails (info@, contact@, name@theirbusiness.com) — gmail/yahoo addresses are
skipped unless `--include-webmail`; one contact per business; **never the same business twice** (history is kept across
runs); `--suppress suppress.txt` excludes anyone who unsubscribed or bounced (put one email or domain per line).

## 3. Send like a human, not a spammer
- **Week 1: ≤ 20–25 emails/day**, week 2: ~40, then grow slowly while bounces < 2% and nobody marks spam.
- In listmonk create the campaign → list = `no-website` (or `site-issue`) → body = the generated HTML → send in the morning.
- Follow-up: **one** short nudge after 4–5 days, a second at most. Stop immediately on any reply or unsubscribe.
- When someone replies, answer within the hour; move the conversation to WhatsApp/call. Offer the free mockup/quote.

## 4. Close the loop (this is where it becomes clients)
- Every email's links carry `utm_source=outreach&utm_medium=email&utm_campaign=<niche>-<city>-<group>&utm_term=<business>`.
  The portfolio remembers it for 30 days. When a visitor sends an **enquiry** (no payment) or **books**, `/admin`
  shows the **source**, and *Insights → By source* shows leads → paid per campaign. Double down on what converts.
- New enquiries email you instantly. Set a **follow-up date** on every lead in `/admin`; the "Follow-ups due" card
  keeps you honest.
- Once someone is a client: take the advance, deliver, ask for a review (WhatsApp template "Project completed").

## Compliance checklist (not legal advice — check before scaling)
- Email: truthful sender/subject, real postal address, working unsubscribe — all included in the generated body.
- India: promotional **SMS/calls** fall under TRAI's DND rules; personal data falls under the **DPDP Act 2023**.
  Business role-addresses published for contact are lower risk than personal ones — which is why webmail is skipped by default.
- **Never bulk-message cold contacts on WhatsApp** (especially via the unofficial Evolution API) — numbers get banned.
  Use WhatsApp only with people who contacted you, or after they replied.
- `tools/leadgen/out/`, `config.json` and any CSV here are git-ignored: they contain other people's personal data.

## Realistic expectations
Typical cold email to local businesses gets a few % replies. 25 targeted emails/day → roughly a handful of
conversations a week, and a client every one to three weeks once your offer and follow-up are dialled in.
The tool saves you the research; **the offer and the follow-up close the deal**.

`npm test` covers the engine (CSV, audit, scoring, robots, fetch, end-to-end CLI).

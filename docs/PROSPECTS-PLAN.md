# Phase 2 — Discovery Engine: Research & Plan

*Pilot: Guwahati · Coaching Institutes · goal 30–50 qualified prospects · prepared 8 Nov 2026 · research and planning only: no application code changed, no email configured. This file is documentation; it changes no behaviour.*

## 0. Status in one minute

- **A. OSM coverage: NOT yet measured.** The research environment could not reach OpenStreetMap's Overpass servers (DNS blocked; four endpoints tested). No numbers are invented. A read-only probe (`tools/osm-probe/probe.mjs`) and six tap-to-run count links (below) measure it in about 2 minutes.
- **B. Real sample businesses: pending that same run.**
- **C–H are complete:** schema, API, duplicate detection, pagination, file list, roadmap, risks, tests.
- **One real finding already:** OSM has no single clean tag for coaching centres, so coverage is likely patchy. The plan makes **manual/CSV import fully first-class** and OSM a bonus, not a dependency.
- **Platform limits:** Phase 2 needs **zero new serverless functions** (actions go into the existing `api/admin/[action].ts`). That keeps the project at 11/12 and leaves the last slot for Phase 4's public unsubscribe/webhook function. **No endpoint merge is needed.**

## A. OSM coverage report

### What was verified (sources)

- OSM's wiki lists `amenity=prep_school` (status *de facto*) as "tutor or test prep centre", and `office=tutoring` as a similar, rarely used tag. A 2019 mapper discussion put `office=tutoring` at only ~35 uses worldwide at that time.
- Mappers disagree on the right tags: `amenity=prep_school`, `office=tutoring`, `office=educational_institution`, `amenity=training`, `amenity=school` + `education=prep_school`, and a draft `education=tutoring_centre`. Many Indian coaching institutes are probably tagged as `amenity=school`/`college`, or not mapped at all.
- The Guwahati coaching *market* is large (public directories list dozens of IAS / NEET-JEE / bank-exam / law institutes, including national chains such as Aakash, IMS, Vision IAS, Chahal and Motion). That shows demand, not OSM coverage. Those directories are **not** a data source (their terms were not checked; do not scrape them).

### Expectation (a prediction, not data)

Sparse: few coaching-tagged features in Guwahati, and websites/phones/emails on a minority of them. The probe must confirm or kill this.

### How to measure (2 minutes)

Bounding box: south 26.07, west 91.56, north 26.24, east 91.90 (approximate Guwahati; includes parts of the north bank, may clip far suburbs).

**Option 1 — phone:** open each link and read the `total` in the JSON.

1. [amenity=prep_school](https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%28nwr%5B%22amenity%22%3D%22prep_school%22%5D%2826.07%2C91.56%2C26.24%2C91.90%29%3B%29%3Bout%20count%3B)
2. [office=tutoring](https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%28nwr%5B%22office%22%3D%22tutoring%22%5D%2826.07%2C91.56%2C26.24%2C91.90%29%3B%29%3Bout%20count%3B)
3. [office=educational_institution](https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%28nwr%5B%22office%22%3D%22educational_institution%22%5D%2826.07%2C91.56%2C26.24%2C91.90%29%3B%29%3Bout%20count%3B)
4. [amenity=training](https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%28nwr%5B%22amenity%22%3D%22training%22%5D%2826.07%2C91.56%2C26.24%2C91.90%29%3B%29%3Bout%20count%3B)
5. [name contains coaching / tutorial / tuition / classes / academy / IAS / NEET / JEE](https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%28nwr%5B%22name%22~%22coaching%7Ctutorial%7Ctuition%7Cclasses%7Cacademy%7CIAS%7CNEET%7CJEE%22%2Ci%5D%2826.07%2C91.56%2C26.24%2C91.90%29%3B%29%3Bout%20count%3B)
6. [baseline: all schools + colleges](https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%28nwr%5B%22amenity%22~%22%5E%28school%7Ccollege%29%24%22%5D%2826.07%2C91.56%2C26.24%2C91.90%29%3B%29%3Bout%20count%3B)

Overpass is a free public service: open each link once, do not hammer it. If one times out, wait a minute and retry.

**Option 2 — computer with Node 18+:** `node tools/osm-probe/probe.mjs` (self-test: `--selftest`). It queries the same families one at a time, merges duplicates, flags national chains, and writes `summary.md` with how many candidates have a website, phone, email, address, opening hours and social link. That output becomes the real test fixture for Phase 2.

### Decision gate

| Result for named, independent candidates | What changes |
|---|---|
| 40 or more | OSM discovery is a real first source; manual import is the supplement |
| 10 to 39 | Both sources equal; add the quick-add form early |
| Under 10 | **Manual/CSV import becomes primary.** OSM is kept only as a small helper |

## B. Sample prospect data

None yet, by design: no invented businesses are shown as "discovered". After the probe run, the first 10–25 independent businesses will be listed with their OSM links so each can be verified on openstreetmap.org.

Target record (shape only): `name`, `category: coaching`, `city: Guwahati`, `locality`, `address`, `lat/lon`, `website`, `phones[]`, `emails[]` (each with the page it was found on), `origin` (osm / manual / csv + OSM type/id/version), `chain` flag, `status`, `notes`.

**"Qualified" for the pilot:** independent (not a national chain), still operating, has at least one way to reach them (phone/WhatsApp-capable mobile, or a business email found on their own site), **and** has a visible website opportunity (no website, social-page-only, or audit issues found in Phase 3).

## C. Redis prospect schema

Same Upstash database, new `pr:` namespace (booking keys `bk:` are untouched).

| Key | Type | Purpose |
|---|---|---|
| `pr:{id}` | string (JSON) | Full Prospect record, about 2–3 KB |
| `pr:sum:{id}` | string (JSON) | Compact summary (~300 B) for list screens |
| `pr:idx:all` | zset (score = createdAt ms) | Master index, newest first |
| `pr:idx:score` | zset (score = composite score) | Sort by opportunity |
| `pr:idx:status:{status}`, `pr:idx:city:{slug}`, `pr:idx:cat:{slug}` | zsets | Facet filters |
| `pr:idx:flag:{noWebsite\|hasEmail\|hasPhone\|chain\|qualified}` | zsets | Boolean filters |
| `pr:idx:name` | zset, all score 0 | Prefix search via `ZRANGEBYLEX` on `normalizedName:id` |
| `pr:dk:{dedupeKey}` | string → id | Atomic duplicate claims (`SET NX`) |
| `pr:log:{id}` | list (capped at 50) | Audit trail: source, status changes |
| `pr:imp:{jobId}` | string, TTL 7 days | Import report (counts, row errors) |
| `sup:email:{sha256}`, `sup:domain:{domain}` | strings | *Reserved for Phase 4.* Suppression stores a hash, not the plaintext address |

**Prospect (TypeScript shape, in a new `shared/prospect.ts`):**

```
Prospect {
  id, v: 1, createdAt, updatedAt
  origin: { kind: osm|manual|csv, osmType?, osmId?, osmVersion?, fetchedAt?, jobId? }
  license?: { name: 'ODbL-1.0', attribution: '© OpenStreetMap contributors' }  // only for osm
  name, category, city, locality?, address?, postcode?, lat?, lon?
  website?, websiteHost?, phones: string[] (E.164), emails: [{ address, kind, foundOn, foundAt }]
  social?: { facebook?, instagram? }
  chain: boolean, osmTags?: only a small allow-list (amenity, office, brand, operator)
  audit?, score?, scoreBreakdown?, qualified?        // Phase 3
  status: new|contacted|replied|interested|meeting|proposal|won|lost, lostReason?
  notes, tags[], links: { bookingIds[] }
  dedupeKeys[], possibleDuplicateOf?
}
```

**Composite score** = `score × 1e13 + createdAtMs` (stays under 2^53; deterministic order; ties broken by time).

**Writes** go through one `savePipeline()` that updates the record, summary and all indexes together using Upstash's transaction endpoint (`/multi-exec`). *Not yet verified in the project's Upstash account; Step 2.1 verifies it with a contract test before anything depends on it.* A `reconcile` routine can rebuild indexes if they drift.

**Capacity:** 5,000 prospects ≈ 15 MB; a list page costs about 4 Redis commands. *The Upstash plan's command quota has not been verified.*

## D. API architecture

**No new serverless function.** All actions are added to the existing authenticated `api/admin/[action].ts` (same cookie, CSRF origin check, `no-store`). Logic lives in new `api/_lib` modules; the handler only dispatches.

| Action | Method | Purpose |
|---|---|---|
| `prospects` | GET | List with filters (`status, city, category, flag`), name prefix `q`, sort (`score, updated, created`), `limit` (default 25, max 50), `offset` |
| `prospect` | GET | One record with its log |
| `prospect-stats` | GET | Counts by status / city / category / flag (ZCARD only) |
| `prospect-create` | POST | Manual add. **409** with `{duplicateOf, strength}` on duplicates |
| `prospect-update` | POST | Status, notes, tags, lostReason, manual fields |
| `prospect-delete` | POST | Hard delete, removes indexes and dedupe keys |
| `prospect-merge` | POST | Merge a soft duplicate into a primary record |
| `prospect-import` | POST | CSV text or normalised items. **`dryRun` defaults to true** (preview before saving). Max 500 rows / 1 MB per request |
| `prospect-discover` | POST | Run an OSM discovery for `{city, category}` and return a **preview** (saved only through `prospect-import`) |

Rules:

- Every body is validated by the same shared validator the UI uses; unknown fields are dropped.
- Phones normalised to E.164; websites must be http/https with no credentials and **no private, loopback or link-local hosts** (SSRF guard, needed before Phase 3 fetches them).
- Overpass client: one request at a time, identifying `User-Agent`, timeout, backoff on 429/504, mirror failover; a 10-second admin cooldown claim prevents repeated clicks.
- **Fallback if Overpass throttles Vercel's shared IPs:** a CLI exporter (`tools/prospects/osm-export.ts`) produces the same JSON on a local computer, uploaded through `prospect-import`.
- Function duration: discovery for one city and one tag family should take a few seconds. *Hobby plan duration limits have changed over time and were not verified; check before relying on it, and if needed ask to set `maxDuration` in `vercel.json`.*

## Duplicate detection

On create or import, each record produces keys, claimed atomically with `SET NX` (safe even if two imports race):

| Key | Strength | Example |
|---|---|---|
| `osm:{type}/{id}` | Strong (hard block) | `osm:node/123456` |
| `dom:{registrable domain}` | Strong | `example.co.in` (handles `co.in`, `org.in`, `ac.in`, `edu.in`, …) |
| `ph:{E.164 phone}` | Strong | `+91361xxxxxxx` |
| `em:{email}` | Strong | lower-cased |
| `nm:{normalised name}\|{locality or 500 m grid cell}` | **Soft** (flag, a human decides) | stop-words removed: institute, classes, coaching, academy, centre, pvt, ltd |

Strong match: not created; the response names the existing record. Soft match: created with `possibleDuplicateOf` and shown for review or merge. Chains are flagged by a maintained brand list plus OSM `brand:wikidata`, and excluded from `qualified` by default.

## Pagination

Offset + limit over sorted sets, with a composite score so order is deterministic. Facet filters use a short-lived `ZINTERSTORE` (TTL 30 s) and then `ZREVRANGE`. Response: `{ items, total, nextOffset }`. Inserts between pages can shift an offset by a row; acceptable for a single admin, and covered by a test. Cursor pagination is a later upgrade if needed.

## OSM attribution and licensing

- OSM data is under the **Open Database Licence (ODbL) 1.0**. Storing and using it, including commercially, is allowed **if "© OpenStreetMap contributors" is credited** with a link to the licence/copyright page where the data is shown.
- **Share-alike** applies if a database derived from OSM is *published*. Keeping it private in your own CRM is not publishing.
- Every OSM record stores `origin` (type, id, version, fetchedAt) and the licence; the discovery screen shows the credit.
- Overpass public servers are for light use (usage notes describe roughly 2 concurrent slots per IP and fewer than ~10,000 queries a day). The plan queries a handful of times per session.
- OSM contact tags (`email`, `phone`) were entered by volunteers and can be a private person's details; the same privacy filters apply as for any personal data (see G).
- **Not used:** Google Places / Google Maps data (their terms forbid saving names/addresses), JustDial / Sulekha / IndiaMART, or scraping of any directory.

## E. Expected file changes

**New files**

| File | Purpose |
|---|---|
| `shared/prospect.ts` | Types, statuses, validators, normalisers (phone, domain, name, URL safety), dedupe keys, composite score |
| `shared/chains.ts` | National/franchise brand list |
| `shared/osm.ts` | Overpass query builder, tag-to-category mapping, element normaliser, attribution constants |
| `api/_lib/redisRest.ts` | Small REST helper (the existing `bookingStore.ts` keeps its private copy and is not edited) |
| `api/_lib/prospectStore.ts` | Redis and in-memory stores, index maintenance, transactions |
| `api/_lib/prospectService.ts` | Create, import, dedupe, list, update, delete, merge (dependency-injected) |
| `api/_lib/overpass.ts` | Overpass HTTP client with timeout, backoff, mirrors |
| `tools/prospects/osm-export.ts` | Offline OSM exporter (fallback path) |
| `src/pages/AdminProspects.tsx` | Thin first UI: discover, preview, select, import, quick-add, paged list |
| `tests/prospect.test.ts`, `tests/prospectService.test.ts`, `tests/osm.test.ts`, `tests/overpass.test.ts`, `tests/prospectHttp.test.ts`, `tests/redisRest.test.ts` | See section H |
| `tests/fixtures/overpass-guwahati.json` | Real probe output (so tests use real data) |
| `docs/PROSPECTS.md` | Operator guide |

**Existing files that would be modified (each needs explicit approval)**

| File | Change |
|---|---|
| `api/admin/[action].ts` | Dispatch the prospect actions (additive; existing actions untouched) |
| `src/App.tsx` | One lazy route `/admin/prospects` |
| `src/pages/Admin.tsx` | One link to the Prospects page |
| `.env.example` | Optional `OVERPASS_URL` and `OVERPASS_CONTACT` (no secrets) |
| `tsconfig.api.json` | Add `tools` to `include` so the exporter is typechecked |
| `vercel.json` | Only if needed: `maxDuration` for the admin function, `noindex` header for `/admin/*` |

**Not touched:** booking, payment, enquiry, Razorpay, webhook, n8n bridge, `bookingStore.ts`, `bookingService.ts`, `adminService.ts`, Cashfree and legacy donation endpoints, `tools/leadgen`, all 41 existing tests.

## F. Implementation roadmap

| Step | Deliverable | Acceptance |
|---|---|---|
| 2.0 | Run the probe, read the numbers, apply the decision gate | Real counts and a real fixture in hand |
| 2.1 | Redis REST helper + prospect store with **contract tests against a local fake Redis REST server**; confirm `/multi-exec` and `ZINTERSTORE` behave as assumed | Tests green; any mismatch changes the design before more code is written |
| 2.2 | `shared/prospect.ts`: validators, normalisers, SSRF guard, dedupe keys | Unit tests incl. attack vectors |
| 2.3 | `prospectService`: create, dedupe (strong/soft), update, delete, merge, list/pagination | Integration tests on the memory store, incl. concurrent duplicate creation |
| 2.4 | CSV import with dry run, row-level errors, CSV-injection handling | Import tests incl. malformed, huge, duplicate-heavy files |
| 2.5 | OSM: query builder, normaliser, Overpass client, `prospect-discover` preview, CLI exporter | Tests with the real fixture and a local fake Overpass (429, timeout, bad JSON, mirror failover) |
| 2.6 | Admin handler wiring | HTTP tests: auth, CSRF, validation, size caps, rate limit, no-store |
| 2.7 | Thin UI (discover, preview, quick-add, list) + `docs/PROSPECTS.md` | Typecheck, build, manual walkthrough on a phone |
| 2.8 | Full regression | All 41 existing tests + new tests, both typechecks, build, `npm audit` no worse than baseline |

Each step ends with a green test run. **No push and no deploy at any step without explicit approval.**

## G. Security and compliance risks

| Risk | Mitigation |
|---|---|
| Using Google data against its terms | Not used. OSM, your own data and CSV only |
| ODbL non-compliance | Attribution on screen and in exports; origin and licence stored per record; no public dataset |
| Personal data (sole-proprietor names, mobiles, emails); India's DPDP Act substantive duties start 13 May 2027 | Data minimisation, source evidence per email, purpose limited to B2B outreach, deletion action, retention setting (proposal: review or delete untouched prospects after 180 days), hashed suppression. *Not legal advice; confirm with a lawyer before scaling* |
| SSRF when later fetching prospect websites | Strict URL validation now; Phase 3 adds DNS/IP re-check after resolution, redirect limit, byte and time caps, ports 80/443 only |
| CSV/spreadsheet formula injection | Neutralise leading `=`, `+`, `-`, `@` on import and export |
| Stored XSS / prompt injection from business-controlled text | React escapes all output; free text is data, never concatenated into prompts or HTML |
| Abuse of the admin API | Existing session auth, origin check, size caps, per-action cooldown, `no-store` |
| Overpass terms and throttling | Identifying User-Agent, one request at a time, backoff, mirror, CLI fallback |
| Index drift or partial writes | Transactional writes; `reconcile`; contract tests |
| Race conditions on duplicates | Atomic `SET NX` claims with release on failure |
| Secrets exposure | No new secrets in Phase 2 (Overpass needs none). `OVERPASS_CONTACT` is a contact string, not a credential |
| Emailing before compliance is ready | Phase 2 contains no sending code. Postal address and DNS remain pending; never use or invent a personal address |

## H. Testing strategy

- **Unit:** phone, domain (Indian second-level suffixes), name and locality normalisation; URL safety with SSRF vectors (`localhost`, `127.0.0.1`, `169.254.169.254`, `10.x`, `192.168.x`, IPv6 loopback, decimal/octal/hex IPs, credentials in URL, odd schemes); CSV parser and injection; composite score bounds; chain detection.
- **OSM:** normaliser against the **real fixture** and edge cases: way/relation centres, missing names, multiple phones separated by `;`, `contact:*` variants, schemeless websites, non-Latin names.
- **Service integration (memory store):** create/update/delete; strong vs soft duplicates; **concurrent creation of the same OSM id yields exactly one record**; import dry run vs commit; partial failure; status moves update indexes; delete cleans every key; pagination across facets, ties and inserts between pages.
- **Redis contract tests:** the same suite runs against the memory store and a local fake Redis REST server implementing the commands we use (no network or credentials).
- **HTTP handler tests:** every new action rejects missing/forged sessions (table-driven), wrong origin, wrong method, oversized bodies; responses are `no-store`.
- **Overpass client:** local HTTP server simulating 429 then success, 504, timeout, invalid JSON, mirror failover.
- **Regression:** the 41 existing tests unchanged; frontend and API typecheck; production build; `npm audit` compared with the baseline.
- **Manual QA (on a phone):** discover, preview, import dry run, import, quick-add a manual prospect, duplicate warning, filters, paging, delete.

## What is needed to continue

1. Run the six count links (or the probe) and share the numbers or `summary.md`.
2. Approve (or edit) the file list in section E, especially the six modified files.
3. State the Upstash plan (or command quota).
4. Confirm whether Phase 2 includes the thin UI (recommended) or API plus CLI only.

*No Phase 2 code is written until these are approved.*

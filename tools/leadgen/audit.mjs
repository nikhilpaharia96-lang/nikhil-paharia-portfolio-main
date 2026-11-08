#!/usr/bin/env node
/**
 * Lead engine: google-maps-scraper CSV  →  scored leads + listmonk-ready outreach lists.
 *
 *   node tools/leadgen/audit.mjs --in maps.csv --niche "dentist" --city "Jaipur"
 *
 * Options: --limit 25 (emails per run) · --min-score 35 · --min-reviews 3 · --include-webmail
 *          --suppress suppress.txt (emails/domains to never contact) · --no-fetch · --config file · --out dir
 * Output (tools/leadgen/out/<niche>-<city>/, git-ignored because it contains personal data):
 *   leads-scored.csv · outreach-no-website.csv · outreach-site-issue.csv (import into listmonk)
 *   campaign-*.html (listmonk bodies) · subjects.txt · call-list.csv (manual calls) · history.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseCsv, toCsv, toListmonkCsv, normaliseRow, fetchSite, pool, scoreLead, emailKind, extractEmails, hostOf, isSocialOnly, slug } from './lib.mjs';
import { GROUPS, groupOf } from './templates.mjs';

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i === -1 ? def : (argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[i + 1]); };
const die = (m) => { console.error(`\n✖ ${m}\n`); process.exit(2); };

const input = opt('in'); const niche = opt('niche'); const city = opt('city');
if (!input || !niche || !city) die('Usage: node tools/leadgen/audit.mjs --in maps.csv --niche "dentist" --city "Jaipur"');
const root = path.dirname(new URL(import.meta.url).pathname);
const cfgPath = opt('config', path.join(root, 'config.json'));
if (!fs.existsSync(cfgPath)) die(`Missing ${cfgPath}. Copy config.example.json to config.json and fill it in.`);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
for (const k of ['senderName', 'siteUrl', 'businessAddress']) if (!cfg[k] || /YOUR|example/i.test(cfg[k])) die(`config.json: "${k}" must be filled in (a real sender identity and postal address are required for compliant email).`);

const limit = Number(opt('limit', 25)); const minScore = Number(opt('min-score', 35)); const minReviews = Number(opt('min-reviews', 3));
const includeWebmail = opt('include-webmail', false) === true;
const outDir = opt('out', path.join(root, 'out', `${slug(niche)}-${slug(city)}`));
fs.mkdirSync(outDir, { recursive: true });
const historyFile = path.join(path.dirname(outDir), 'history.json'); // shared across campaigns → never emails the same address twice
const history = new Set(fs.existsSync(historyFile) ? JSON.parse(fs.readFileSync(historyFile, 'utf8')) : []);
const suppress = new Set(opt('suppress') && fs.existsSync(opt('suppress')) ? fs.readFileSync(opt('suppress'), 'utf8').split(/\s+/).map((s) => s.toLowerCase()).filter(Boolean) : []);
const suppressed = (e) => suppress.has(e) || suppress.has(e.split('@')[1]);

// 1. read + clean
const raw = parseCsv(fs.readFileSync(input, 'utf8')).map(normaliseRow);
const seen = new Set();
const rows = raw.filter((r) => {
  if (!r.business || /closed/.test(r.status)) return false;
  if (r.reviews < minReviews) return false;
  const k = `${r.business}|${r.address}`.toLowerCase();
  return seen.has(k) ? false : (seen.add(k), true);
});
console.log(`Read ${raw.length} rows → ${rows.length} usable businesses.`);

// 2. audit websites (1 polite request per site; robots.txt respected)
const doFetch = opt('no-fetch', false) !== true;
const ua = `LeadAudit/1.0 (+${cfg.siteUrl})`;
let done = 0;
const audited = await pool(rows, 4, async (r) => {
  const real = r.website && !isSocialOnly(r.website);
  const siteResult = doFetch && real ? await fetchSite(r.website, { ua }) : null;
  if (doFetch && real && ++done % 10 === 0) process.stdout.write(`  audited ${done} sites…\r`);
  return { ...r, siteResult: real && !doFetch ? { https: true, viewport: true, hasContactPath: true, hasBooking: true } : siteResult };
});

// 3. score + choose a contact email
const leads = audited.map((r) => {
  const s = scoreLead({ website: r.website, siteResult: r.siteResult, reviews: r.reviews, rating: r.rating });
  const all = [...new Set([...(r.siteResult?.emails || []), ...r.mapsEmails])];
  const rank = { role: 0, 'own-domain': 1, other: 2, webmail: 3 };
  const usable = all.map((e) => ({ e, kind: emailKind(e, r.website) }))
    .filter(({ e, kind }) => !suppressed(e) && !history.has(e) && (includeWebmail || kind !== 'webmail'))
    .sort((a, b) => rank[a.kind] - rank[b.kind]);
  return { ...r, ...s, email: usable[0]?.e || '', emailKind: usable[0]?.kind || '', allEmails: all };
}).sort((a, b) => b.score - a.score || b.reviews - a.reviews);

const ctr = (g) => g.reduce((o, l) => ((o[l.angle] = (o[l.angle] || 0) + 1), o), {});
console.log('\nPitch angles found:', ctr(leads));

// 4. outreach lists (top-scoring first, capped per run so you warm up your domain gradually)
const bizKey = (l) => `biz:${l.business}|${l.address}`.toLowerCase();
const domKey = (l) => (emailKind(l.email, '') === 'webmail' ? null : `dom:${l.email.split('@')[1]}`);
const candidates = leads.filter((l) => l.score >= minScore && l.angle !== 'none' && l.angle !== 'unknown' && l.email
  && !history.has(bizKey(l)) && !(domKey(l) && history.has(domKey(l))));   // never contact the same business twice, even across runs
const seenRun = new Set();
const picked = [];
for (const l of candidates) {
  const keys = [bizKey(l), domKey(l)].filter(Boolean);
  if (keys.some((k) => seenRun.has(k))) continue; // one contact per business within this run
  keys.forEach((k) => seenRun.add(k)); picked.push(l);
  if (picked.length >= limit) break;
}
const campaignBase = `${slug(niche)}-${slug(city)}`;
const groups = { 'no-website': [], 'site-issue': [] };
for (const l of picked) {
  const g = groupOf(l.angle);
  const [first, second] = l.issues;
  groups[g].push({
    email: l.email, name: l.business,
    attribs: {
      business: l.business, city, category: l.category || niche, angle: l.angle,
      issue: first?.text || '', issue2: g === 'site-issue' ? second?.text || '' : '',
      praise: l.reviews >= 5 && l.rating >= 4 ? `${l.rating}★ from ${l.reviews} reviews is impressive.` : '',
      link: `${cfg.siteUrl.replace(/\/$/, '')}/?utm_source=outreach&utm_medium=email&utm_campaign=${campaignBase}-${g}&utm_term=${slug(l.business)}`,
      phone: l.phone,
    },
  });
}
for (const [g, list] of Object.entries(groups)) {
  if (!list.length) continue;
  fs.writeFileSync(path.join(outDir, `outreach-${g}.csv`), toListmonkCsv(list));
  fs.writeFileSync(path.join(outDir, `campaign-${g}.html`), GROUPS[g].body(cfg));
}
fs.writeFileSync(path.join(outDir, 'subjects.txt'), Object.entries(GROUPS).map(([g, v]) => `# ${g}\n${v.subject(niche, city).join('\n')}\n`).join('\n'));

// 5. everything else → full report + a manual call list (good businesses with no usable email)
const cols = ['business', 'category', 'phone', 'website', 'score', 'tier', 'angle', 'reviews', 'rating', 'email', 'emailKind', 'issues', 'address', 'mapsLink'];
fs.writeFileSync(path.join(outDir, 'leads-scored.csv'), toCsv(cols, leads.map((l) => ({ ...l, issues: l.issues.map((i) => i.text).join(' | ') }))));
const calls = leads.filter((l) => l.score >= minScore && l.phone && !picked.includes(l) && l.angle !== 'none' && l.angle !== 'unknown');
fs.writeFileSync(path.join(outDir, 'call-list.csv'), toCsv(['business', 'phone', 'category', 'score', 'talking_point', 'reviews', 'rating'],
  calls.map((l) => ({ business: l.business, phone: l.phone, category: l.category, score: l.score, talking_point: l.issues[0]?.text || '', reviews: l.reviews, rating: l.rating }))));

if (opt('dry-run', false) !== true) {
  picked.forEach((l) => { history.add(l.email); history.add(bizKey(l)); const d = domKey(l); if (d) history.add(d); });
  fs.writeFileSync(historyFile, JSON.stringify([...history].sort(), null, 1));
}
console.log(`\n✔ ${picked.length} email leads (${groups['no-website'].length} no-website, ${groups['site-issue'].length} site-issue) · ${calls.length} on the call list · ${leads.length} scored\n  → ${outDir}`);

#!/usr/bin/env node
/**
 * OSM coverage probe for coaching institutes in Guwahati.
 *
 * READ-ONLY and standalone: it is NOT part of your repository, writes only two files into the
 * current folder, and sends a handful of small queries to the public Overpass API (one at a time,
 * 3 s apart, with an identifying User-Agent, as the Overpass usage policy asks).
 *
 *   node probe.mjs              live run (needs internet + Node 18+)
 *   node probe.mjs --selftest   offline check of the counting logic using a SYNTHETIC fixture
 *
 * Optional: OSM_PROBE_CONTACT="you@example.com" so Overpass operators can reach you.
 * Output:   osm-guwahati-coaching.json (everything)  +  summary.md (paste this back to Claude)
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// Approximate bounding box around Guwahati: south, west, north, east.
export const BBOX = [26.07, 91.56, 26.24, 91.90];
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

// Coaching / tutoring is tagged inconsistently in OSM, so we probe several tag families.
export const SETS = {
  prep_school: 'nwr["amenity"="prep_school"]',
  tutoring: 'nwr["office"="tutoring"]',
  educational_institution: 'nwr["office"="educational_institution"]',
  training: 'nwr["amenity"="training"]',
  education_tag: 'nwr["education"~"prep_school|tutoring_centre|cram_school|centre"]',
  name_coaching: 'nwr["name"~"coaching|tutorial|tuition|classes|academy|IAS|NEET|JEE",i]',
  baseline_school_college: 'nwr["amenity"~"^(school|college)$"]', // baseline only, not coaching
};
const CANDIDATE_SETS = ['prep_school', 'tutoring', 'educational_institution', 'training', 'education_tag', 'name_coaching'];

// National / franchise brands: poor prospects for a freelancer (they have corporate websites).
const CHAIN_RE = /\b(aakash|allen|fiitjee|resonance|vision ias|vajiram|byju|physics ?wallah|\bpw\b|time institute|career launcher|bansal|motion|chahal|unacademy|vedantu|toppr|kaplan|ims learning|testbook|adda ?247)\b/i;

export const query = (selector, bbox = BBOX, mode = 'out center tags;') =>
  `[out:json][timeout:25];(${selector}(${bbox.join(',')}););${mode}`;

const first = (t, keys) => keys.map((k) => t[k]).find((v) => v && String(v).trim());
export function describe(el) {
  const t = el.tags || {};
  const addr = Object.keys(t).filter((k) => k.startsWith('addr:'));
  return {
    key: `${el.type}/${el.id}`,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    name: t.name || null,
    amenity: t.amenity || null,
    office: t.office || null,
    website: first(t, ['website', 'contact:website', 'url']) || null,
    phone: first(t, ['phone', 'contact:phone', 'mobile', 'contact:mobile']) || null,
    email: first(t, ['email', 'contact:email']) || null,
    address: t['addr:full'] || (addr.length ? addr.map((k) => `${k.slice(5)}=${t[k]}`).join(', ') : null),
    hasStreet: !!t['addr:street'],
    openingHours: t.opening_hours || null,
    social: first(t, ['contact:facebook', 'facebook', 'contact:instagram', 'instagram']) || null,
    brand: t.brand || t.operator || null,
    chain: CHAIN_RE.test(`${t.name || ''} ${t.brand || ''} ${t.operator || ''}`) || !!t['brand:wikidata'],
    lat: el.lat ?? el.center?.lat ?? null,
    lon: el.lon ?? el.center?.lon ?? null,
  };
}

/** Pure: turns per-set raw elements into the coverage statistics. */
export function analyse(bySet) {
  const counts = Object.fromEntries(Object.entries(bySet).map(([k, v]) => [k, v.length]));
  const merged = new Map();
  for (const k of CANDIDATE_SETS) {
    for (const el of bySet[k] || []) {
      const key = `${el.type}/${el.id}`;
      const prev = merged.get(key);
      // The same OSM object can appear under several tag families: keep the union of its tags.
      merged.set(key, prev ? { ...prev, ...el, tags: { ...prev.tags, ...el.tags } } : el);
    }
  }
  const rows = [...merged.values()].filter((el) => el.tags?.name).map(describe); // unnamed features are not usable prospects
  const independent = rows.filter((r) => !r.chain);
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  const field = (list, f) => list.filter((r) => r[f]).length;
  const summarise = (list) => ({
    total: list.length,
    website: field(list, 'website'), phone: field(list, 'phone'), email: field(list, 'email'),
    address: field(list, 'address'), street: field(list, 'hasStreet'), openingHours: field(list, 'openingHours'), social: field(list, 'social'),
    anyContact: list.filter((r) => r.website || r.phone || r.email).length,
    noWebsite: list.filter((r) => !r.website).length,
  });
  return {
    counts, rows, independent,
    candidates: summarise(rows), independentStats: summarise(independent),
    pct: (s, f) => pct(s[f], s.total),
  };
}

export function markdown(a, when = new Date().toISOString().slice(0, 10), synthetic = false) {
  const s = a.candidates, i = a.independentStats, p = (st, f) => `${st[f]} (${a.pct(st, f)}%)`;
  const lines = [
    `# OSM coverage — coaching-type features in Guwahati (bbox ${BBOX.join(', ')}) — ${when}${synthetic ? ' — SYNTHETIC SELFTEST, NOT REAL DATA' : ''}`,
    '', '## Raw feature counts by tag family (all, named or not)',
    ...Object.entries(a.counts).map(([k, v]) => `- ${k}: ${v}${k === 'baseline_school_college' ? '  (baseline: all schools/colleges, not coaching)' : ''}`),
    '', '## Named candidates (union of coaching-type families)',
    `- total: ${s.total}  ·  independent (not a national chain): ${i.total}  ·  chains: ${s.total - i.total}`,
    '', '| field | all candidates | independent only |', '|---|---|---|',
    ...['website', 'phone', 'email', 'address', 'street', 'openingHours', 'social', 'anyContact'].map((f) => `| ${f} | ${p(s, f)} | ${p(i, f)} |`),
    '', `- Independent with NO website: ${i.noWebsite}`, '',
    '## Sample (first 25 independent)', '| name | tag | website | phone | email | OSM |', '|---|---|---|---|---|---|',
    ...a.independent.slice(0, 25).map((r) => `| ${r.name} | ${r.amenity || r.office || ''} | ${r.website || '—'} | ${r.phone || '—'} | ${r.email || '—'} | ${r.osmUrl} |`),
  ];
  return lines.join('\n') + '\n';
}

async function overpass(sel, fetchImpl, sleep) {
  let lastErr;
  for (const ep of ENDPOINTS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetchImpl(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': `portfolio-osm-probe/1.0 (${process.env.OSM_PROBE_CONTACT || 'no contact set'})` },
          body: `data=${encodeURIComponent(query(sel))}`,
          signal: AbortSignal.timeout(40_000),
        });
        if (res.status === 429 || res.status === 504) { await sleep(5000 * (attempt + 1)); continue; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.elements || [];
      } catch (e) { lastErr = e; await sleep(2000); }
    }
  }
  throw new Error(`Overpass failed: ${lastErr?.message}`);
}

export async function run({ fetchImpl = fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), gapMs = 3000 } = {}) {
  const bySet = {};
  for (const [name, sel] of Object.entries(SETS)) {
    process.stdout.write(`querying ${name} … `);
    bySet[name] = await overpass(sel, fetchImpl, sleep);
    console.log(bySet[name].length);
    await sleep(gapMs);
  }
  return { bySet, analysis: analyse(bySet) };
}

/* ───────── self-test (synthetic fixture, no network) ───────── */
async function selftest() {
  const el = (type, id, tags, extra = {}) => ({ type, id, tags, ...extra });
  const fixture = {
    prep_school: [
      el('node', 1, { name: 'Alpha Tutorials (synthetic)', amenity: 'prep_school', phone: '+91 361 000 0001', website: 'http://alpha.example', 'addr:street': 'GS Road' }, { lat: 26.14, lon: 91.76 }),
      el('way', 2, { name: 'Beta Classes (synthetic)', amenity: 'prep_school', 'contact:phone': '+91 98000 00002', email: 'info@beta.example' }, { center: { lat: 26.15, lon: 91.77 } }),
      el('node', 3, { amenity: 'prep_school' }), // unnamed → ignored
    ],
    tutoring: [el('node', 4, { name: 'Gamma Coaching (synthetic)', office: 'tutoring', 'contact:facebook': 'https://facebook.com/gamma.example' })],
    // way/2 below is the SAME OSM object as the prep_school entry → must merge
    educational_institution: [el('way', 2, { name: 'Beta Classes (synthetic)', office: 'educational_institution' }), el('node', 5, { name: 'Aakash Institute (synthetic chain)', office: 'educational_institution', brand: 'Aakash', 'brand:wikidata': 'Q1' })],
    training: [], education_tag: [],
    name_coaching: [el('node', 4, { name: 'Gamma Coaching (synthetic)' }), el('node', 6, { name: 'Delta Academy (synthetic)', 'addr:full': 'Somewhere, Guwahati', opening_hours: 'Mo-Sa 09:00-18:00' })],
    baseline_school_college: [el('node', 7, { name: 'Some School', amenity: 'school' })],
  };
  const a = analyse(fixture);
  const assert = (cond, msg) => { if (!cond) { console.error('SELFTEST FAIL:', msg); process.exit(1); } };
  assert(a.candidates.total === 5, `candidates should be 5 (unnamed ignored, duplicates merged) got ${a.candidates.total}`);
  assert(a.independentStats.total === 4, 'one chain excluded');
  assert(a.candidates.website === 1 && a.candidates.phone === 2 && a.candidates.email === 1, 'field counts');
  assert(a.independentStats.noWebsite === 3, 'independent without website');
  assert(a.candidates.social === 1 && a.candidates.openingHours === 1 && a.candidates.address === 2, 'social/hours/address (Alpha has addr:street, Delta has addr:full)');
  assert(a.counts.baseline_school_college === 1 && a.counts.prep_school === 3, 'raw counts');
  assert(describe(fixture.prep_school[1]).lat === 26.15, 'way center used for coordinates');
  assert(query('nwr["a"="b"]').includes('26.07,91.56,26.24,91.9'), 'bbox in query');
  // retry/endpoint failover logic with a fake fetch: 429 once then OK
  let calls = 0;
  const fake = async () => (++calls === 1 ? { status: 429, ok: false } : { status: 200, ok: true, json: async () => ({ elements: [el('node', 9, { name: 'X' })] }) });
  const r = await run({ fetchImpl: fake, sleep: async () => {}, gapMs: 0 });
  assert(calls >= Object.keys(SETS).length + 1 && r.bySet.prep_school.length === 1, 'retries after 429');
  fs.writeFileSync('/tmp/probe-selftest.md', markdown(a, 'selftest', true));
  console.log('SELFTEST OK — counting, chain filter, field stats and 429-retry logic behave as expected (synthetic data only).');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--selftest')) await selftest();
  else {
    const { bySet, analysis } = await run();
    fs.writeFileSync('osm-guwahati-coaching.json', JSON.stringify({ bbox: BBOX, fetchedAt: new Date().toISOString(), counts: analysis.counts, candidates: analysis.rows, attribution: '© OpenStreetMap contributors (ODbL 1.0)' }, null, 1));
    const md = markdown(analysis);
    fs.writeFileSync('summary.md', md);
    console.log('\n' + md + '\nWrote osm-guwahati-coaching.json and summary.md — paste summary.md back to Claude.');
  }
}

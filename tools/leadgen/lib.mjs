// Pure helpers for the lead engine (no I/O except fetchSite). Dependency-free, Node 18+.

/* ───────── CSV ───────── */
export function parseCsv(text) {
  const s = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
// Quoted always; neutralises spreadsheet formula injection (cells starting with = + - @).
export const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
export const toCsv = (cols, rows) => [cols.map(csvCell).join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n') + '\r\n';
// listmonk import: header `email,name,attributes` where attributes is a JSON object.
export const toListmonkCsv = (rows) =>
  ['email,name,attributes', ...rows.map((r) => [r.email, r.name, JSON.stringify(r.attribs)].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\r\n') + '\r\n';

export const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 40);

/* ───────── Emails ───────── */
const ROLE = new Set(['info', 'contact', 'hello', 'hi', 'enquiry', 'enquiries', 'inquiry', 'inquiries', 'sales', 'support', 'care', 'office', 'admin', 'reception', 'booking', 'bookings', 'appointment', 'appointments', 'mail', 'team', 'service', 'services', 'customercare', 'help', 'orders', 'reservations']);
const WEBMAIL = new Set(['gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'outlook.com', 'hotmail.com', 'live.com', 'rediffmail.com', 'icloud.com', 'proton.me', 'protonmail.com', 'aol.com', 'ymail.com']);
const JUNK = /\.(png|jpe?g|gif|svg|webp|css|js)$|sentry|wixpress|example\.|domain\.com|yourdomain|email\.com|@2x/i;
export const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;

export function extractEmails(text) {
  return [...new Set((String(text).match(EMAIL_RE) || []).map((e) => e.toLowerCase()).filter((e) => !JUNK.test(e)))];
}
export const hostOf = (url) => { try { return new URL(/^https?:/i.test(url) ? url : `http://${url}`).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };

/** role = info@/contact@…, own-domain = on the business's own website domain, webmail = gmail/yahoo/… */
export function emailKind(email, website) {
  const [local, domain] = email.toLowerCase().split('@');
  if (WEBMAIL.has(domain)) return 'webmail';
  if (ROLE.has(local.replace(/[._-]/g, ''))) return 'role';
  const h = hostOf(website);
  if (h && (domain === h || domain.endsWith(`.${h}`) || h.endsWith(`.${domain}`))) return 'own-domain';
  return 'other';
}

/* ───────── Website audit ───────── */
const NOT_A_REAL_SITE = /(^|\.)(facebook\.com|fb\.com|instagram\.com|linktr\.ee|linktree\.com|wa\.me|whatsapp\.com|business\.site|twitter\.com|x\.com|youtube\.com|justdial\.com|indiamart\.com|sulekha\.com|zomato\.com|swiggy\.com|practo\.com)$/i;
export const isSocialOnly = (url) => !!url && NOT_A_REAL_SITE.test(hostOf(url));

/** Analyse a fetched homepage. `finalUrl` is after redirects. Pure → unit-testable. */
export function analyseHtml(html, finalUrl, { elapsedMs = 0, bytes = html.length, year = new Date().getFullYear() } = {}) {
  const h = String(html);
  const lower = h.toLowerCase();
  const text = lower.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ');
  const copyright = [...text.matchAll(/(?:©|&copy;|copyright)[^0-9]{0,40}((?:19|20)\d{2})(?:\s*[-–]\s*((?:19|20)\d{2}))?/g)].map((m) => Number(m[2] || m[1]));
  const lastYear = copyright.length ? Math.max(...copyright) : null;
  return {
    https: /^https:/i.test(finalUrl),
    viewport: /<meta[^>]+name=["']viewport["']/i.test(h),
    title: (h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim().slice(0, 120),
    hasContactPath: /href=["']tel:|href=["']mailto:|wa\.me\/|api\.whatsapp\.com|<form\b/i.test(h),
    hasBooking: /(book(ing)?\s*(now|online|an?\s*appointment)|appointment|schedule|reserve|order\s*online|get\s*a?\s*quote)/i.test(text),
    stale: lastYear !== null && lastYear <= year - 3,
    lastYear,
    slow: elapsedMs > 4500 || bytes > 3_000_000,
    elapsedMs,
    emails: extractEmails(h),
  };
}

/* ───────── Scoring ───────── */
// Higher = better prospect for web-design / development services. Honest, explainable weights.
export function scoreLead({ website, siteResult, reviews = 0, rating = 0 }) {
  const issues = [];
  let score = 0;
  const add = (pts, code, text) => { score += pts; issues.push({ code, text }); };

  if (!website) add(50, 'no_website', "I couldn't find a website listed for your business on Google Maps");
  else if (isSocialOnly(website)) add(45, 'social_only', 'your business link goes to a social/directory page rather than your own website');
  else if (!siteResult || siteResult.error) add(siteResult?.error === 'robots' ? 0 : 35, siteResult?.error === 'robots' ? 'unknown' : 'down', 'your website did not load when I checked');
  else {
    const s = siteResult;
    if (!s.viewport) add(20, 'not_mobile', 'your website may not display well on mobile phones (no mobile viewport setting)');
    if (!s.https) add(15, 'no_https', 'your website is not served over secure HTTPS, which browsers flag as "Not secure"');
    if (!s.hasContactPath && !s.hasBooking) add(15, 'no_contact', 'visitors have no easy way to call, WhatsApp or enquire from the homepage');
    if (s.stale) add(10, 'stale', `the site footer still shows ${s.lastYear}, so it looks out of date`);
    if (s.slow) add(10, 'slow', 'the homepage was slow to load');
  }
  const noSite = ['no_website', 'social_only', 'down'].some((c) => issues.some((i) => i.code === c));
  if (reviews >= 100) score += 15; else if (reviews >= 20) score += 10; else if (reviews >= 5) score += 4;
  if (rating >= 4) score += 5;
  score = Math.min(100, score);
  const order = ['no_website', 'social_only', 'down', 'not_mobile', 'no_https', 'no_contact', 'stale', 'slow'];
  const angle = order.find((c) => issues.some((i) => i.code === c)) || 'none';
  return { score, tier: score >= 60 ? 'A' : score >= 35 ? 'B' : 'C', angle, issues, noSite };
}

/* ───────── robots + fetch ───────── */
export function robotsDisallowsRoot(txt) {
  let applies = false;
  for (const raw of String(txt).split(/\r?\n/)) {
    const line = raw.split('#')[0].trim();
    const m = line.match(/^(user-agent|disallow)\s*:\s*(.*)$/i);
    if (!m) continue;
    if (m[1].toLowerCase() === 'user-agent') applies = m[2].trim() === '*';
    else if (applies && m[2].trim() === '/') return true;
  }
  return false;
}

export async function fetchSite(url, { timeoutMs = 9000, maxBytes = 1_000_000, ua = 'LeadAudit/1.0', fetchImpl = fetch } = {}) {
  const target = /^https?:/i.test(url) ? url : `https://${url}`;
  const origin = new URL(target).origin;
  try {
    const r = await fetchImpl(`${origin}/robots.txt`, { signal: AbortSignal.timeout(4000), headers: { 'User-Agent': ua } });
    if (r.ok && robotsDisallowsRoot(await r.text())) return { error: 'robots' };
  } catch { /* no robots.txt reachable → proceed */ }
  const t0 = Date.now();
  try {
    const res = await fetchImpl(target, { redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': ua, Accept: 'text/html' } });
    if (!res.ok) return { error: `http_${res.status}` };
    const reader = res.body?.getReader();
    let html = '', bytes = 0;
    if (reader) {
      const dec = new TextDecoder();
      while (bytes < maxBytes) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; html += dec.decode(value, { stream: true }); }
      reader.cancel().catch(() => {});
    } else html = (await res.text()).slice(0, maxBytes);
    return analyseHtml(html, res.url || target, { elapsedMs: Date.now() - t0, bytes });
  } catch (e) {
    return { error: e?.name === 'TimeoutError' ? 'timeout' : 'network' };
  }
}

/** Run `fn` over items with limited concurrency. */
export async function pool(items, size, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

/* ───────── Normalising the Maps CSV ───────── */
export function normaliseRow(r) {
  const num = (v) => { const n = parseFloat(String(v).replace(/,/g, '')); return Number.isFinite(n) ? n : 0; };
  return {
    business: (r.title || '').trim(),
    category: (r.category || '').trim(),
    address: (r.address || '').trim(),
    phone: (r.phone || '').trim(),
    website: (r.website || '').trim(),
    mapsLink: (r.link || '').trim(),
    reviews: Math.round(num(r.review_count)),
    rating: Math.round(num(r.review_rating) * 10) / 10,
    mapsEmails: extractEmails(r.emails || ''),
    status: (r.status || '').toLowerCase(),
  };
}

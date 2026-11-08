import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import type { AddressInfo } from "node:net";
// @ts-ignore plain ESM helpers
import { parseCsv, toCsv, toListmonkCsv, analyseHtml, scoreLead, emailKind, extractEmails, robotsDisallowsRoot, fetchSite, isSocialOnly, csvCell } from "../tools/leadgen/lib.mjs";

const GOOD = `<html><head><title>Smile Dental</title><meta name="viewport" content="width=device-width"></head><body>
<a href="tel:+911234567890">Call</a> Book an appointment © 2026</body></html>`;
const NO_MOBILE = `<html><head><title>Old Clinic</title></head><body>Welcome © 2016 write to info@oldclinic.test <img src="logo@2x.png"></body></html>`;

test("csv: round-trips quotes, commas, newlines; neutralises formula injection", () => {
  const rows = parseCsv('\uFEFFa,b\r\n"x, ""y""","line1\nline2"\r\n1,2\r\n');
  assert.deepEqual(rows, [{ a: 'x, "y"', b: "line1\nline2" }, { a: "1", b: "2" }]);
  assert.equal(csvCell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
  const lm = parseCsv(toListmonkCsv([{ email: "a@b.com", name: 'Dr "A", Clinic', attribs: { business: 'Dr "A", Clinic', n: 1 } }]));
  assert.equal(lm[0].email, "a@b.com"); assert.deepEqual(JSON.parse(lm[0].attributes), { business: 'Dr "A", Clinic', n: 1 });
  assert.equal(parseCsv(toCsv(["x"], [{ x: "=1+1" }]))[0].x, "'=1+1");
});

test("audit html: mobile, https, contact, stale year, junk emails ignored", () => {
  const bad = analyseHtml(NO_MOBILE, "http://oldclinic.test/", { year: 2026 });
  assert.deepEqual([bad.viewport, bad.https, bad.hasContactPath, bad.stale, bad.lastYear], [false, false, false, true, 2016]);
  assert.deepEqual(bad.emails, ["info@oldclinic.test"]);
  const good = analyseHtml(GOOD, "https://smile.test/", { year: 2026 });
  assert.deepEqual([good.viewport, good.https, good.hasContactPath, good.hasBooking, good.stale], [true, true, true, true, false]);
  assert.equal(analyseHtml("<p>© 2020-2026</p>", "https://x/", { year: 2026 }).stale, false); // range → latest year
});

test("scoring: no website > broken site > fine site; angle picks the strongest issue", () => {
  const none = scoreLead({ website: "", reviews: 120, rating: 4.6 });
  const social = scoreLead({ website: "https://www.instagram.com/clinic", reviews: 10, rating: 4.2 });
  const bad = scoreLead({ website: "http://x.test", siteResult: analyseHtml(NO_MOBILE, "http://x.test/", { year: 2026 }), reviews: 30, rating: 4 });
  const fine = scoreLead({ website: "https://y.test", siteResult: analyseHtml(GOOD, "https://y.test/", { year: 2026 }), reviews: 30, rating: 4 });
  assert.equal(none.angle, "no_website"); assert.equal(none.tier, "A"); assert.equal(social.angle, "social_only");
  assert.equal(bad.angle, "not_mobile"); assert.ok(bad.issues.length >= 3);
  assert.equal(fine.angle, "none"); assert.equal(fine.tier, "C");
  assert.ok(none.score > social.score && social.score > fine.score && bad.score > fine.score);
  assert.equal(scoreLead({ website: "http://x.test", siteResult: { error: "timeout" } }).angle, "down");
  assert.equal(scoreLead({ website: "http://x.test", siteResult: { error: "robots" } }).angle, "none"); // blocked us → no claims about it
});

test("emails: role / own-domain / webmail classification and extraction", () => {
  assert.equal(emailKind("info@smile.com", "https://smile.com"), "role");
  assert.equal(emailKind("drsharma@smile.com", "https://www.smile.com"), "own-domain");
  assert.equal(emailKind("drsharma@gmail.com", "https://smile.com"), "webmail");
  assert.equal(emailKind("x@other.com", "https://smile.com"), "other");
  assert.deepEqual(extractEmails("a@b.com, A@B.com sentry@sentry.io logo@2x.png c@d.in"), ["a@b.com", "c@d.in"]);
  assert.ok(isSocialOnly("https://facebook.com/x") && !isSocialOnly("https://smile.com"));
});

test("robots.txt: only an explicit Disallow: / for * blocks us", () => {
  assert.equal(robotsDisallowsRoot("User-agent: *\nDisallow: /"), true);
  assert.equal(robotsDisallowsRoot("User-agent: *\nDisallow: /admin\n"), false);
  assert.equal(robotsDisallowsRoot("User-agent: Googlebot\nDisallow: /\nUser-agent: *\nDisallow:"), false);
});

function fixtureServer() {
  return new Promise<{ base: string; close: () => void }>((resolve) => {
    const s = http.createServer((req, res) => {
      const u = req.url!;
      if (u === "/good") return void res.end(GOOD);
      if (u === "/nomobile") return void res.end(NO_MOBILE);
      if (u === "/robots.txt") return void (req.headers.host && res.end("User-agent: *\nAllow: /"));
      if (u === "/slow") return; // never answers
      res.statusCode = 404; res.end("nope");
    });
    s.listen(0, "127.0.0.1", () => resolve({ base: `http://127.0.0.1:${(s.address() as AddressInfo).port}`, close: () => { s.closeAllConnections(); s.close(); } }));
  });
}

test("fetchSite: reads pages, reports 404 and timeouts, and honours robots.txt", async () => {
  const s = await fixtureServer();
  const ok = await fetchSite(`${s.base}/nomobile`, { timeoutMs: 2000 });
  assert.equal(ok.viewport, false); assert.equal(ok.https, false);
  assert.equal((await fetchSite(`${s.base}/missing`)).error, "http_404");
  assert.equal((await fetchSite(`${s.base}/slow`, { timeoutMs: 200 })).error, "timeout");
  const blocked = http.createServer((req, res) => res.end(req.url === "/robots.txt" ? "User-agent: *\nDisallow: /" : GOOD));
  await new Promise<void>((r) => blocked.listen(0, "127.0.0.1", r));
  assert.equal((await fetchSite(`http://127.0.0.1:${(blocked.address() as AddressInfo).port}/`)).error, "robots");
  blocked.closeAllConnections(); blocked.close(); s.close();
});

const run = (args: string[]) => new Promise<{ code: number; out: string }>((resolve) =>
  execFile("node", ["tools/leadgen/audit.mjs", ...args], (err, stdout, stderr) => resolve({ code: err ? (err as any).code : 0, out: stdout + stderr })));

test("CLI end-to-end: filters, scoring, listmonk files, utm links, history, compliance guard", async () => {
  const s = await fixtureServer();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "leadgen-"));
  const header = "title,category,address,website,phone,review_count,review_rating,status,emails,link";
  const row = (t: string, site: string, rev: string, emails: string, status = "", phone = "+91 98000 00001") =>
    `"${t}",Dentist,"${t} Rd, Jaipur",${site},"${phone}",${rev},4.5,${status},"${emails}",https://maps/x`;
  fs.writeFileSync(path.join(tmp, "maps.csv"), [header,
    row("Alpha Dental", "", "120.000000", "info@alpha.test"),                       // no website, role email → no-website list
    row("Beta Smiles", "https://instagram.com/beta", "40", "beta@gmail.com"),       // social only but webmail → excluded by default → call list
    row("Gamma Clinic", `${s.base}/nomobile`, "60", ""),                            // site issue; email found on its page
    row("Delta Care", "", "2", "info@delta.test"),                                  // too few reviews → dropped
    row("Epsilon Dental", "", "80", "info@epsilon.test", "permanently closed"),     // closed → dropped
    row("Zeta Dental", "", "55", "hello@suppressed.test"),                          // suppressed
    row("Eta Dental", "", "70", "info@eta.test, sales@eta.test"),                   // one contact per business
  ].join("\n"));
  fs.writeFileSync(path.join(tmp, "suppress.txt"), "suppressed.test\n");
  const cfg = { senderName: "Nikhil Paharia", siteUrl: "https://nikhilpaharia.online", businessAddress: "Nikhil Paharia, 1 Test Street, Jaipur 302001, India", calLink: "https://cal.com/nikhil/15min" };
  fs.writeFileSync(path.join(tmp, "config.json"), JSON.stringify(cfg));
  const args = ["--in", path.join(tmp, "maps.csv"), "--niche", "dentist", "--city", "Jaipur", "--config", path.join(tmp, "config.json"), "--out", path.join(tmp, "out", "dentist-jaipur"), "--suppress", path.join(tmp, "suppress.txt")];

  const r1 = await run(args);
  assert.equal(r1.code, 0, r1.out);
  const out = path.join(tmp, "out", "dentist-jaipur");
  const nw = parseCsv(fs.readFileSync(path.join(out, "outreach-no-website.csv"), "utf8"));
  assert.deepEqual(nw.map((r: any) => r.email).sort(), ["info@alpha.test", "info@eta.test"]);
  const attr = JSON.parse(nw.find((r: any) => r.email === "info@alpha.test").attributes);
  assert.match(attr.link, /utm_source=outreach&utm_medium=email&utm_campaign=dentist-jaipur-no-website&utm_term=alpha-dental/);
  assert.match(attr.issue, /couldn't find a website/); assert.match(attr.praise, /4\.5★ from 120 reviews/);
  const si = parseCsv(fs.readFileSync(path.join(out, "outreach-site-issue.csv"), "utf8"));
  assert.deepEqual(si.map((r: any) => r.email), ["info@oldclinic.test"]);
  assert.match(JSON.parse(si[0].attributes).issue, /mobile/);
  const body = fs.readFileSync(path.join(out, "campaign-no-website.html"), "utf8");
  for (const must of ["{{ UnsubscribeURL }}", "1 Test Street", "cal.com/nikhil/15min", ".Subscriber.Attribs.business"]) assert.ok(body.includes(must), must);
  const scored = parseCsv(fs.readFileSync(path.join(out, "leads-scored.csv"), "utf8")).map((r: any) => r.business);
  assert.ok(!scored.includes("Delta Care") && !scored.includes("Epsilon Dental"));
  const calls = parseCsv(fs.readFileSync(path.join(out, "call-list.csv"), "utf8")).map((r: any) => r.business);
  assert.ok(calls.includes("Beta Smiles"));
  assert.ok(fs.existsSync(path.join(tmp, "out", "history.json")));

  // second run: already-exported addresses are never exported again
  const r2 = await run(args);
  assert.equal(r2.code, 0, r2.out);
  assert.match(r2.out, /0 email leads/);                       // incl. Eta's second address (same business)
  assert.equal(parseCsv(fs.readFileSync(path.join(out, "outreach-no-website.csv"), "utf8")).length, 2); // untouched

  // compliance guard: placeholder address refuses to produce email files
  fs.writeFileSync(path.join(tmp, "bad.json"), JSON.stringify({ ...cfg, businessAddress: "<YOUR address>" }));
  const r3 = await run(args.map((a) => (a === path.join(tmp, "config.json") ? path.join(tmp, "bad.json") : a)));
  assert.equal(r3.code, 2); assert.match(r3.out, /postal address/);
  s.close();
});

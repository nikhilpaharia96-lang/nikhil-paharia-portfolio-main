#!/usr/bin/env node
/**
 * Verifies your WhatsApp Cloud API set-up WITHOUT touching the website or Vercel.
 * Reads credentials from the environment only — it never prints the token.
 *
 *   node --env-file=.env scripts/whatsapp-check.mjs
 *   node --env-file=.env scripts/whatsapp-check.mjs --send 98XXXXXXXX --pdf ./sample.pdf
 *
 * Checks: (1) token + Phone Number ID work, (2) which number / mode that ID is,
 *         (3) your template exists and is APPROVED, (4) optionally sends a real test message.
 */
import { readFile } from "node:fs/promises";

const need = (k) => {
  const v = process.env[k];
  if (!v) console.log(`  ✗ ${k} is not set`);
  return v;
};
const version = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
const G = `https://graph.facebook.com/${version}`;
const token = need("WHATSAPP_TOKEN");
const phoneId = need("WHATSAPP_PHONE_NUMBER_ID");
const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const tplName = process.env.WHATSAPP_TEMPLATE_NAME || "booking_confirmation";
const tplLang = process.env.WHATSAPP_TEMPLATE_LANG || "en";
if (!token || !phoneId) process.exit(1);

const get = async (path) => {
  const r = await fetch(`${G}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return { ok: r.ok, status: r.status, json: await r.json().catch(() => ({})) };
};
const err = (j) => j?.error?.message ?? "unknown error";

console.log(`\nGraph API ${version}\n`);

console.log("1) Phone Number ID + token");
const ph = await get(`/${phoneId}?fields=display_phone_number,verified_name,quality_rating,platform_type,code_verification_status,name_status,throughput`);
if (!ph.ok) {
  console.log(`  ✗ failed (${ph.status}): ${err(ph.json)}`);
  console.log("    → wrong Phone Number ID, expired/short-lived token, or the token lacks access to this number.");
  process.exit(1);
}
const p = ph.json;
console.log(`  ✓ number: ${p.display_phone_number}  name: ${p.verified_name}  (${p.name_status ?? "?"})`);
console.log(`    platform: ${p.platform_type}  quality: ${p.quality_rating}  throughput: ${JSON.stringify(p.throughput)}`);
if (/test/i.test(p.display_phone_number ?? "") || String(p.display_phone_number).startsWith("+1 555")) {
  console.log("  ⚠ this looks like Meta's TEST number: it can only message up to 5 allow-listed recipients, not real clients.");
}

console.log("\n2) Template");
if (!wabaId) {
  console.log("  – set WHATSAPP_BUSINESS_ACCOUNT_ID to check the template status");
} else {
  const t = await get(`/${wabaId}/message_templates?name=${encodeURIComponent(tplName)}&fields=name,status,category,language`);
  if (!t.ok) console.log(`  ✗ failed (${t.status}): ${err(t.json)}`);
  else if (!t.json.data?.length) console.log(`  ✗ no template named "${tplName}" in this WhatsApp Business Account`);
  else
    for (const x of t.json.data) {
      const good = x.status === "APPROVED" && x.language === tplLang;
      console.log(`  ${good ? "✓" : "⚠"} ${x.name}  ${x.language}  ${x.category}  → ${x.status}`);
    }
}

const i = process.argv.indexOf("--send");
if (i > -1) {
  const to = `91${String(process.argv[i + 1] ?? "").replace(/\D/g, "").slice(-10)}`;
  const pdfPath = process.argv[process.argv.indexOf("--pdf") + 1];
  if (!pdfPath || pdfPath.startsWith("--")) {
    console.log("\n3) Send test: add  --pdf ./some.pdf");
    process.exit(1);
  }
  console.log(`\n3) Sending test template to ${to.slice(0, 4)}******${to.slice(-2)}`);
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", new Blob([await readFile(pdfPath)], { type: "application/pdf" }), "Test-Booking.pdf");
  const up = await fetch(`${G}/${phoneId}/media`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  const upJ = await up.json().catch(() => ({}));
  if (!up.ok) { console.log(`  ✗ upload failed: ${err(upJ)}`); process.exit(1); }
  const m = await fetch(`${G}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "template",
      template: { name: tplName, language: { code: tplLang }, components: [
        { type: "header", parameters: [{ type: "document", document: { id: upJ.id, filename: "Test-Booking.pdf" } }] },
        { type: "body", parameters: [{ type: "text", text: "Test Client" }, { type: "text", text: "Website Development" }] },
      ] },
    }),
  });
  const mJ = await m.json().catch(() => ({}));
  console.log(m.ok ? "  ✓ accepted by WhatsApp (check the phone)" : `  ✗ failed (${m.status}, code ${mJ?.error?.code}): ${err(mJ)}`);
}
console.log("");

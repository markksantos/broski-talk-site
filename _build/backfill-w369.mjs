// One-off: copy every verified Netlify Forms "subscribe" signup into the Broski Talk workspace.
// Run once, right after W369_TOKEN and W369_WORKSPACE_ID are set on the site:
//   W369_TOKEN=… W369_WORKSPACE_ID=… node _build/backfill-w369.mjs          (add --dry-run to count only)
// Uses the logged-in Netlify CLI to read submissions. Safe to re-run: existing clients are skipped.
import { execFileSync } from "node:child_process";
import { upsertSubscriber, configured } from "../netlify/lib/w369.mjs";

const SITE = "c1a6e0c4-4db1-4150-99d8-be7db4bedb7f";
const dry = process.argv.includes("--dry-run");
const api = (method, data) => JSON.parse(execFileSync("npx", ["-y", "netlify-cli@latest", "api", method, "--data", JSON.stringify(data)], { encoding: "utf8" }));

if (!dry && !configured()) { console.error("Set W369_TOKEN and W369_WORKSPACE_ID first."); process.exit(1); }
const form = api("listSiteForms", { site_id: SITE }).find((f) => f.name === "subscribe");
if (!form) { console.error("No 'subscribe' form on the site."); process.exit(1); }

const emails = new Set();
for (let page = 1; page < 100; page++) {
  const subs = api("listFormSubmissions", { form_id: form.id, page, per_page: 100 });
  for (const s of subs) {
    const d = s.data || {};
    const e = String(d.email || "").trim().toLowerCase();
    if (!d.company && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) emails.add(e);
  }
  if (subs.length < 100) break;
}
console.log(`${emails.size} unique signups in Netlify Forms`);
if (dry) process.exit(0);
let added = 0, existing = 0, failed = 0;
for (const email of emails) {
  try { const r = await upsertSubscriber({ email }); r.existing ? existing++ : added++; }
  catch (err) { failed++; console.error(err.message.replace(email, "<email>")); }
}
console.log(JSON.stringify({ added, existing, failed }));

// Runs on every verified Netlify Forms submission (spam-flagged ones never reach it).
// Copies newsletter and freebie signups into the Broski Talk workspace in Workspace369.
// Netlify Forms keeps its own copy too, so nothing is lost while Workspace369 isn't connected:
// `node _build/backfill-w369.mjs` copies those across later.
import { upsertSubscriber, configured } from "../lib/w369.mjs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async (req) => {
  let payload;
  try { payload = (await req.json()).payload; } catch { return new Response("bad body", { status: 400 }); }
  if (payload?.form_name !== "subscribe") return new Response("ignored");
  const d = payload.data || {};
  if (d.company) return new Response("honeypot");
  const email = String(d.email || "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return new Response("invalid");
  if (!configured()) { console.log("w369 not configured; kept in Netlify Forms only"); return new Response("stored-netlify-only"); }
  try {
    const r = await upsertSubscriber({ email, resource: d.resource, source: d.source });
    console.log(JSON.stringify({ ok: true, existing: !!r.existing, resource: d.resource }));
    return new Response("ok");
  } catch (err) {
    console.error(`w369 upsert failed: ${err.message}`.replace(email, "<email>"));
    return new Response("w369 error", { status: 500 });
  }
};

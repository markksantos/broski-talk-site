// Workspace369 (the Broski Talk workspace) over its MCP HTTP endpoint.
// Docs: docs.workspace369.com/v/2026.3/build-with-ai/call-workspace369-from-your-app-over-https/
//
// Env (Netlify → broskitalk → Environment variables, scope Functions):
//   W369_TOKEN         personal access token (mcp_pat_…), made in the Broski Talk workspace
//   W369_WORKSPACE_ID  that workspace's id (pins the endpoint to it)
// Until both are set, every call here is a no-op that returns { skipped: true }.

const env = (k) => (typeof Netlify !== "undefined" ? Netlify.env.get(k) : process.env[k]) || "";

export const configured = () => !!(env("W369_TOKEN") && env("W369_WORKSPACE_ID"));

export async function call(name, args) {
  if (!configured()) return { skipped: true };
  const url = `${env("W369_MCP_BASE") || "https://mcp.workspace369.com"}/w/${env("W369_WORKSPACE_ID")}/mcp`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("W369_TOKEN")}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await r.text();
  let body;
  const dataLine = text.split("\n").find((l) => l.startsWith("data:"));
  try { body = JSON.parse(dataLine ? dataLine.slice(5) : text); } catch { body = { raw: text.slice(0, 300) }; }
  if (!r.ok || body.error) throw new Error(`W369 ${name}: HTTP ${r.status} ${JSON.stringify(body.error || body).slice(0, 300)}`);
  // Tools return their data as `structuredContent` (plus a text copy); the first text item is only a summary line.
  if (body.result?.structuredContent) return body.result.structuredContent;
  for (const c of body.result?.content || []) { try { return JSON.parse(c.text); } catch {} }
  return { text: body.result?.content?.[0]?.text };
}

/** Add (or find) a newsletter subscriber. Never logs the address.
 *  Subscribers are filed under the "Newsletter" lead source and pipeline stage (both made by the
 *  workspace setup script), so clients Mark adds by hand never get episode emails. */
export const LEAD_SOURCE = "Newsletter";
export async function upsertSubscriber({ email }) {
  if (!configured()) return { skipped: true };
  const found = await call("clients_search", { query: email, limit: 5 });
  const hit = (found?.clients || []).find((c) => (c.email || "").toLowerCase() === email);
  if (hit) return { existing: true, id: hit.id };
  const r = await call("clients_create", { name: email, email, client_type: "individual", lead_source: LEAD_SOURCE, stage: "Newsletter", idempotency_key: `bt-signup-${email}` });
  return { existing: !!r?.deduped, id: r?.client?.id };
}

/** Every newsletter subscriber's client id (W369 skips opted-out and suppressed addresses at send time). */
export async function allSubscriberIds() {
  const ids = [];
  let cursor;
  for (let i = 0; i < 40; i++) {
    const page = await call("clients_search", { lead_source: LEAD_SOURCE, limit: 100, ...(cursor ? { cursor } : {}) });
    for (const c of page?.clients || []) if (c.email && !c.archived && !c.email_opted_out) ids.push(c.id);
    cursor = page?.nextCursor || page?.next_cursor;
    if (!cursor) break;
  }
  return ids;
}

/** Create the new-episode email campaign(s) and schedule them to send in 5 minutes. */
export async function sendEpisodeCampaign({ key, name, subject, body }) {
  if (!configured()) return { skipped: true };
  const ids = await allSubscriberIds();
  const out = [];
  for (let i = 0; i < ids.length; i += 500) {
    const part = Math.floor(i / 500) + 1;
    const created = await call("campaigns_create", { channel: "email", name: ids.length > 500 ? `${name} (${part})` : name, subject, body, client_ids: ids.slice(i, i + 500), idempotency_key: `${key}-${part}` });
    const id = created?.campaign?.id;
    const at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    // Held by Workspace369 until Szymon approves it in the app (sends by a token always are);
    // the reply carries the approval link.
    const res = await call("campaigns_update", { id, status: "scheduled", scheduled_at: at });
    out.push({ id, approval_url: res?.approval_url || res?.approval?.url || null, status: res?.status || res?.campaign?.status || null });
  }
  return { recipients: ids.length, campaigns: out };
}

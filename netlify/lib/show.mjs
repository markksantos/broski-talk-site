// Broski Talk show data: the channel's videos, parsed into episodes and shorts.
//
// Source of truth is the YouTube channel. `seed.json` holds every video known at
// build time (written from yt-dlp); the hourly `watch-channel` function adds new
// uploads to the Netlify Blobs store "show" (key "videos"), so new episodes and
// shorts appear on the site without a redeploy.

import { getStore } from "@netlify/blobs";
import seed from "../data/seed.json" with { type: "json" };

export const CHANNEL = "https://www.youtube.com/@broskitalk";
export const SITE = "https://broskitalk.com";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

export function store() {
  return getStore({ name: "show", consistency: "strong" });
}

/** Every known video, newest first: seed merged with what the watcher stored. */
export async function loadVideos() {
  let stored = [];
  try { stored = (await store().get("videos", { type: "json" })) || []; } catch { stored = []; }
  const byId = new Map(seed.videos.map((v) => [v.id, v]));
  for (const v of stored) byId.set(v.id, { ...byId.get(v.id), ...v });
  return [...byId.values()].sort((a, b) => (b.published + b.id).localeCompare(a.published + a.id));
}

/* ---------------- description parsing ---------------- */

const TS = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;
const toSec = (ts) => ts.split(":").map(Number).reduce((a, n) => a * 60 + n, 0);

export function parseDescription(text = "") {
  const lines = text.split(/\r?\n/);
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chapters = [];
  for (const l of lines) {
    const m = l.trim().match(/^((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+)$/);
    if (m && TS.test(m[1])) chapters.push({ t: toSec(m[1]), ts: m[1], title: m[2].trim() });
  }
  // Resource blocks: an ALL-CAPS heading line (not CHAPTERS/ABOUT), then lines holding a URL.
  const resources = [];
  let heading = null;
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    const bare = l.replace(/\s*\([^)]*\)\s*$/, "");
    if (bare.length >= 5 && /^[A-Z0-9][A-Z0-9 '’&.,:-]+$/.test(bare) && !/https?:/.test(l)) {
      heading = /^(CHAPTERS|ABOUT)\b/.test(bare) ? null : bare;
      continue;
    }
    if (!heading) continue;
    const u = l.match(/https?:\/\/\S+/);
    if (!u) continue;
    const label = l.slice(0, u.index).replace(/^\d+\.\s*/, "").replace(/[:\s]+$/, "").trim();
    let name = label, note = "";
    const colon = label.match(/^(.+?):\s+(.+)$/);
    const paren = label.match(/^(.+?)\s+\((.+?)\)(.*)$/);
    if (colon && !/\(/.test(colon[1])) { name = colon[1]; note = colon[2]; }
    else if (paren) { name = paren[1]; note = [paren[2], paren[3].replace(/^[\s,.;:]+/, "")].filter(Boolean).join(". "); }
    if (note) note = note.charAt(0).toUpperCase() + note.slice(1);
    resources.push({ group: heading, name: name || u[0], note, url: u[0], credit: /^(list )?via\b/i.test(name) });
  }
  // Summary: the first lines that aren't links, emails or calls to action ("📩 Get an email…",
  // "❤️ Inquiries…"), with any leading emoji dropped. Newer descriptions open with a "💎 headline" line.
  const plain = (l) => l && !/https?:\/\/|\S+@\S+\.\w|^(?:\d+\.\s|#)|⤵️/.test(l) && !/^(CHAPTERS|FROM THIS EPISODE)\b/.test(l) && !TS.test(l.split(/\s/)[0]);
  const lead = (paras.find((p) => p.split("\n").some((l) => plain(l.trim()))) || "").split("\n").map((l) => l.trim()).filter(plain);
  const summary = lead.join(" ").replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, "").trim();
  const hook = paras[1] && !/^(CHAPTERS|#)/.test(paras[1]) && paras[1].length < 220 ? paras[1] : "";
  const full = text.match(/Full episode:\s*(https?:\/\/\S+)/);
  const fullId = full ? (full[1].match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/) || [])[1] : null;
  return { summary, hook, chapters, resources, fullEpisodeId: fullId || null };
}

/** Episode-level fields derived from a long-form video. */
export function toEpisode(v) {
  const d = parseDescription(v.description);
  // Only the relaunched show (titles "… | Broski Talk Ep. N", from November 2026) gets episode numbers;
  // the 2020-21 live streams on the channel ("Episode #17") are not episodes of this site.
  const num = v.published >= SHOW_START ? Number((v.title.match(/Broski Talk Ep\.?\s*(\d+)/i) || v.title.match(/\bEp\.\s*(\d+)\b/) || [])[1]) || null : null;
  const title = v.title.replace(/\s*\|\s*Broski Talk.*$/i, "").trim();
  return { ...v, ...d, num, cleanTitle: title, slug: num ? String(num) : v.id, path: num ? `/episodes/${num}/` : `/episodes/${v.id}/` };
}

export const SHOW_START = "2026-11-01";

export async function loadShow() {
  const vids = (await loadVideos()).filter((v) => (v.published || "") >= SHOW_START);
  const episodes = vids.filter((v) => !v.short).map(toEpisode).filter((e) => e.num);
  const shorts = vids.filter((v) => v.short).map((v) => ({ ...v, ...parseDescription(v.description) }));
  return { episodes, shorts };
}

/* ---------------- YouTube reads: public, official sources only ---------------- */
// 1. YouTube Data API v3, when YOUTUBE_API_KEY is set (free key; 2 quota units a run of 10,000 a day).
// 2. The channel's RSS feed (YouTube has been returning 404 for feeds since early Nov 2026).
// Both give full descriptions, so chapters and links come through.
// 3. If both fail, the public channel pages list the ids and oEmbed gives each title;
//    such a video is stored with `incomplete: true` and enriched on a later run.

export const CHANNEL_ID = "UCplomLxmgUD4iFI3dqj_OGQ";
const HEADERS = { "User-Agent": "Mozilla/5.0 (compatible; BroskiTalkSite/1.0; +https://broskitalk.com)", "Accept-Language": "en-US,en;q=0.9" };

async function get(url) {
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

const unxml = (t = "") => t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

/** Latest ~15 uploads from the RSS feed: [{id, title, published, description, short}] */
export async function readFeed() {
  const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
    title: unxml((e.match(/<title>([^<]*)/) || [])[1]),
    published: ((e.match(/<published>([^<]+)/) || [])[1] || "").slice(0, 10),
    description: unxml((e.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || ""),
    short: /youtube\.com\/shorts\//.test((e.match(/<link rel="alternate" href="([^"]+)/) || [])[1] || ""),
  })).filter((v) => v.id);
}

const iso8601 = (d = "") => { const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || []; return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0); };

/** Latest 25 uploads from the YouTube Data API: same shape as readFeed, plus seconds. */
export async function readApi(key) {
  const api = (path) => fetch(`https://www.googleapis.com/youtube/v3/${path}&key=${encodeURIComponent(key)}`).then(async (r) => {
    if (!r.ok) throw new Error(`youtube api ${r.status}`); return r.json(); });
  const list = await api(`playlistItems?part=snippet&maxResults=25&playlistId=${CHANNEL_ID.replace(/^UC/, "UU")}`);
  const items = (list.items || []).map((i) => i.snippet).filter((sn) => sn?.resourceId?.videoId);
  if (!items.length) return [];
  const details = await api(`videos?part=contentDetails&id=${items.map((sn) => sn.resourceId.videoId).join(",")}`);
  const secs = new Map((details.items || []).map((d) => [d.id, iso8601(d.contentDetails?.duration)]));
  return items.map((sn) => {
    const id = sn.resourceId.videoId, seconds = secs.get(id) ?? null;
    return { id, title: sn.title, published: (sn.publishedAt || "").slice(0, 10), description: sn.description || "", seconds, short: seconds != null && seconds <= 180 };
  });
}

/** Newest uploads with full descriptions: the Data API if a key is set, else the RSS feed. */
export async function readLatest(key) {
  if (key) { try { return { source: "youtube-api", items: await readApi(key) }; } catch { /* fall through to the feed */ } }
  return { source: "feed", items: await readFeed() };
}

/** Video ids on the channel's Videos and Shorts tabs, newest first (fallback when the feed is down). */
export async function listChannel() {
  const ids = (html) => [...new Set([...html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)].map((m) => m[1]))];
  const [videos, shorts] = await Promise.all([get(`${CHANNEL}/videos`), get(`${CHANNEL}/shorts`)]);
  const v = ids(videos), s = ids(shorts);
  if (!v.length && !s.length) throw new Error("channel pages returned no video ids");
  return { videos: v, shorts: s };
}

/** Title from YouTube's public oEmbed endpoint. */
export async function oembedTitle(id) {
  const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}`, { headers: HEADERS });
  if (!r.ok) throw new Error(`oembed ${r.status}`);
  return (await r.json()).title;
}

/* ---------------- helpers ---------------- */

export const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const clock = (sec) => {
  if (!sec && sec !== 0) return "";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};
export const niceDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const thumb = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
export const thumbShort = (id) => `https://i.ytimg.com/vi/${id}/oar2.jpg`;

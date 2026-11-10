// Hourly: look for new uploads on youtube.com/@broskitalk.
//  - Every new video (episode or short) is stored in Blobs, so its pages go live within ~5 minutes.
//  - Every new full episode creates the new-episode email campaign in the Broski Talk workspace of
//    Workspace369 (to every subscriber), when NEW_EPISODE_EMAILS=on and W369 is configured.
//    Workspace369 holds token-made sends until Szymon approves them in the app.
// Sources (see show.mjs): the YouTube Data API when YOUTUBE_API_KEY is set, else the RSS feed; both
// carry the full description. If neither answers, the public channel pages list new ids and oEmbed
// gives their titles. Such an episode is filled in on a later run; its email waits up to 6 hours for
// that, then goes out anyway (title, thumbnail, button) so subscribers always hear about it.
// Safety: a video known at deploy time (seed.json) never triggers an email, and neither does an
// episode published more than 3 days ago, so a first run can't blast old episodes.
import seed from "../data/seed.json" with { type: "json" };
import { store, readLatest, listChannel, oembedTitle, toEpisode, SHOW_START } from "../lib/show.mjs";
import { configured, sendEpisodeCampaign } from "../lib/w369.mjs";
import { episodeEmail } from "../lib/email.mjs";

const env = (k) => Netlify.env.get(k) || "";
const seeded = new Set(seed.videos.map((v) => v.id));

export default async () => {
  const s = store();
  const log = { at: new Date().toISOString(), source: null, added: [], enriched: [], emailed: [], errors: [] };
  const stored = (await s.get("videos", { type: "json" })) || [];
  const byId = new Map(stored.map((v) => [v.id, v]));
  const known = (id) => seeded.has(id) || byId.has(id);
  let changed = false;

  try {
    const latest = await readLatest(env("YOUTUBE_API_KEY"));
    log.source = latest.source;
    // The feed also lists the 2020-21 live streams; only the relaunched show is stored.
    for (const f of latest.items.filter((x) => (x.published || "") >= SHOW_START)) {
      const cur = byId.get(f.id);
      if (!known(f.id)) { byId.set(f.id, { seconds: null, ...f, found: log.at }); log.added.push({ id: f.id, short: f.short, title: f.title }); changed = true; }
      else if (cur?.incomplete) { byId.set(f.id, { ...cur, ...f, seconds: f.seconds ?? cur.seconds, short: cur.short, incomplete: false }); log.enriched.push(f.id); changed = true; }
    }
  } catch (err) {
    log.errors.push(`latest: ${err.message}`);
    try {
      const { videos, shorts } = await listChannel();
      log.source = "channel-pages";
      for (const [id, short] of [...videos.map((id) => [id, false]), ...shorts.map((id) => [id, true])]) {
        if (known(id)) continue;
        try {
          const title = await oembedTitle(id);
          byId.set(id, { id, title, published: log.at.slice(0, 10), seconds: null, short, description: "", incomplete: true, found: log.at });
          log.added.push({ id, short, title, incomplete: true }); changed = true;
        } catch (e) { log.errors.push(`oembed ${id}: ${e.message}`); }
      }
    } catch (e) { log.errors.push(`channel pages: ${e.message}`); }
  }
  if (changed) await s.setJSON("videos", [...byId.values()]);

  // New-episode emails: complete, unsent, recent, not part of the seed.
  const notified = (await s.get("notified", { type: "json" })) || {};
  for (const v of byId.values()) {
    if (v.short || seeded.has(v.id) || notified[v.id]) continue;
    // Give a description-less episode 6 hours to fill in (chapters and links), then email anyway.
    if (v.incomplete && Date.now() - Date.parse(v.found || log.at) < 6 * 36e5) continue;
    const e = toEpisode(v);
    const ageDays = (Date.now() - Date.parse(v.published + "T00:00:00Z")) / 864e5;
    if (!e.num || ageDays > 3) continue;
    if (env("NEW_EPISODE_EMAILS") !== "on" || !configured()) {
      log.emailed.push({ id: v.id, status: "waiting: NEW_EPISODE_EMAILS is off or Workspace369 isn't connected" });
      continue;
    }
    try {
      const res = await sendEpisodeCampaign({ key: `bt-ep-${v.id}`, ...episodeEmail(e) });
      notified[v.id] = { at: log.at, status: "campaign created", ...res };
      log.emailed.push({ id: v.id, ...res });
    } catch (err) { log.errors.push(`email ${v.id}: ${err.message}`); }
  }
  await s.setJSON("notified", notified);

  const runs = (await s.get("watch-log", { type: "json" })) || [];
  await s.setJSON("watch-log", [log, ...runs].slice(0, 48));
  console.log(JSON.stringify({ source: log.source, added: log.added.length, enriched: log.enriched.length, emailed: log.emailed.length, errors: log.errors }));
};

export const config = { schedule: "@hourly" };

// Serves the pages built from live show data, so new uploads appear with no redeploy:
//   /episodes/            every episode
//   /episodes/<n>/        one episode: player, chapters, email-gated links, its shorts
//   /shorts/              every short
//   /api/show.json        compact data the home page reads for "latest episode" and shorts
import { loadShow, listChannel, readLatest, oembedTitle, store } from "../lib/show.mjs";
import { episodePage, episodesPage, shortsPage, newsletterPage, showJson, fillHome } from "../lib/render.mjs";
import { SITE } from "../lib/show.mjs";

const html = (body, status = 200) => new Response(body, {
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, max-age=0, must-revalidate",
    // The CDN keeps a copy for 5 minutes and serves the old one while it refreshes.
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=86400",
    "Netlify-Cache-Tag": "show",
  },
});

export default async (req) => {
  const url = new URL(req.url);
  const p = url.pathname.replace(/\/+$/, "/");
  if (p === "/api/watch-status") {
    // Read-only health check: can Netlify read the channel, and what did the hourly watcher last do?
    const channel = {};
    channel.apiKeySet = !!Netlify.env.get("YOUTUBE_API_KEY");
    try { const { source, items: f } = await readLatest(Netlify.env.get("YOUTUBE_API_KEY")); channel.latest = { ok: true, source, entries: f.length, newest: f[0] && { id: f[0].id, title: f[0].title, published: f[0].published, seconds: f[0].seconds ?? null, descriptionChars: f[0].description.length } }; }
    catch (err) { channel.latest = { ok: false, error: err.message }; }
    try { const c = await listChannel(); channel.pages = { ok: true, videos: c.videos.length, shorts: c.shorts.length, newest: c.videos[0] };
      if (c.videos[0]) channel.pages.newestTitle = await oembedTitle(c.videos[0]); }
    catch (err) { channel.pages = { ok: false, error: err.message }; }
    let runs = [], notified = {};
    try { runs = ((await store().get("watch-log", { type: "json" })) || []).slice(0, 5); notified = (await store().get("notified", { type: "json" })) || {}; } catch {}
    return new Response(JSON.stringify({ channel, lastRuns: runs, notified }, null, 1), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
  const show = await loadShow();

  if (p === "/api/show.json") {
    return new Response(JSON.stringify(showJson(show)), { headers: {
      "Content-Type": "application/json", "Cache-Control": "public, max-age=60",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=86400", "Netlify-Cache-Tag": "show" } });
  }
  const short = p.match(/^\/ep\/?(\d+)\/?$/);
  if (short) return Response.redirect(new URL(`/episodes/${short[1]}/`, url), 301);
  if (p === "/") {
    const base = await fetch(new URL("/index.html", url)).then((r) => r.text());
    return html(fillHome(base, show));
  }
  if (p === "/sitemap.xml") {
    const urls = ["/", "/episodes/", "/shorts/", "/newsletter/", "/free/12-skills/", ...show.episodes.map((e) => e.path)];
    const last = (path) => (show.episodes.find((e) => e.path === path)?.published) || show.episodes[0]?.published;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${last(u)}</lastmod></url>`).join("\n")}\n</urlset>\n`;
    return new Response(xml, { headers: { "Content-Type": "application/xml", "Netlify-CDN-Cache-Control": "public, durable, s-maxage=3600", "Netlify-Cache-Tag": "show" } });
  }
  if (p === "/episodes" || p === "/episodes/") return html(episodesPage(show));
  if (p === "/shorts" || p === "/shorts/") return html(shortsPage(show));
  if (p === "/newsletter" || p === "/newsletter/") return html(newsletterPage(show));

  const m = p.match(/^\/episodes\/([^/]+)\/?$/);
  if (m) {
    const ep = show.episodes.find((e) => e.slug === m[1] || e.id === m[1]);
    if (ep) {
      if (!p.endsWith("/")) return Response.redirect(new URL(ep.path, url), 301);
      return html(episodePage(ep, show));
    }
  }
  const nf = await fetch(new URL("/404.html", url)).then((r) => r.text()).catch(() => "Not found");
  return html(nf, 404);
};

export const config = {
  path: ["/", "/sitemap.xml", "/ep*", "/episodes", "/episodes/", "/episodes/*", "/shorts", "/shorts/", "/newsletter", "/newsletter/", "/api/show.json", "/api/watch-status"],
};

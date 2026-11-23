// RSS 2.0 feed of Broski Talk episodes at /feed.xml, built from the same live show data as the pages,
// so a new episode is in the feed as soon as the watcher stores it (no redeploy).
// It is a site feed (reader apps, Feedly, Zapier, news aggregators), not an audio-podcast feed:
// the show has no audio files, so there are no <enclosure>s and Apple/Spotify can't take it.
import { SITE, CHANNEL, esc, clock, thumb } from "./show.mjs";
import { HOSTS, SHOW_LINK } from "./hosts.mjs";

const TITLE = "Broski Talk Podcast";
const DESCRIPTION = "AI · Tech · Business. Mark Santos and Simon Dziak break down the week in AI: new models, tools, launches and what they mean for people who build with them. New episodes on YouTube.";
const rfc822 = (iso) => new Date(`${iso}T12:00:00Z`).toUTCString();
const cdata = (s) => `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

function itemHtml(e) {
  const url = SITE + e.path;
  const parts = [
    `<p><a href="${url}"><img src="${thumb(e.id)}" alt="${esc(e.cleanTitle)}" width="1280" height="720"></a></p>`,
    e.summary ? `<p>${esc(e.summary)}</p>` : "",
    `<p><a href="https://www.youtube.com/watch?v=${e.id}">Watch on YouTube</a>${e.seconds ? ` (${clock(+e.seconds)})` : ""} · <a href="${url}">Chapters and links on broskitalk.com</a></p>`,
  ];
  if (e.chapters?.length) {
    parts.push(`<p><strong>Chapters</strong></p><ul>${e.chapters.map((c) => `<li><a href="https://www.youtube.com/watch?v=${e.id}&amp;t=${c.t}s">${c.ts}</a> ${esc(c.title)}</li>`).join("")}</ul>`);
  }
  const hosts = [HOSTS.mark, HOSTS.simon].map((h) => `${esc(h.name)}: ${h.links.filter((l) => !/instagram/i.test(l.url)).map((l) => `<a href="${l.url}">${esc(l.label || l.name)}</a>`).join(" · ")}`);
  parts.push(`<p>${hosts.join("<br>")}<br>Broski Talk: <a href="${SHOW_LINK.url}">broskitalk.com</a></p>`);
  return parts.filter(Boolean).join("\n");
}

export function rssFeed(show) {
  const eps = show.episodes.slice(0, 50);
  const built = eps[0]?.published ? rfc822(eps[0].published) : new Date().toUTCString();
  const items = eps.map((e) => `    <item>
      <title>${esc(`Ep. ${e.num}: ${e.cleanTitle}`)}</title>
      <link>${SITE}${e.path}</link>
      <guid isPermaLink="true">${SITE}${e.path}</guid>
      <pubDate>${rfc822(e.published)}</pubDate>
      <dc:creator>Mark Santos &amp; Simon Dziak</dc:creator>
      <description>${esc(e.summary || e.cleanTitle)}</description>
      <content:encoded>${cdata(itemHtml(e))}</content:encoded>
      <media:thumbnail url="${thumb(e.id)}" width="1280" height="720"/>
      <media:content url="https://www.youtube.com/watch?v=${e.id}" medium="video"${e.seconds ? ` duration="${+e.seconds}"` : ""}/>
      <itunes:episode>${e.num}</itunes:episode>
      <itunes:image href="${thumb(e.id)}"/>${e.seconds ? `\n      <itunes:duration>${+e.seconds}</itunes:duration>` : ""}
    </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${TITLE}</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(DESCRIPTION)}</description>
    <language>en-us</language>
    <copyright>© ${new Date().getUTCFullYear()} Broski Talk</copyright>
    <lastBuildDate>${built}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${SITE}/assets/logo/favicon.png</url>
      <title>${TITLE}</title>
      <link>${SITE}/</link>
    </image>
    <itunes:author>Mark Santos &amp; Simon Dziak</itunes:author>
    <itunes:image href="${SITE}/assets/logo/favicon.png"/>
    <itunes:category text="Technology"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <atom:link href="${CHANNEL}" rel="related" type="text/html"/>
${items}
  </channel>
</rss>
`;
}

// HTML for the pages served by the `pages` function: /episodes/, /episodes/<n>/, /shorts/.
// Built from live show data (see show.mjs), so a new upload appears with no redeploy.

import { SITE, CHANNEL, esc, clock, niceDate, thumb, thumbShort } from "./show.mjs";

export const SOCIAL = [
  { name: "YouTube", url: "https://www.youtube.com/@broskitalk", handle: "SUBSCRIBE" },
  { name: "Instagram", url: "https://www.instagram.com/broskitalk/", handle: "@BROSKITALK" },
  { name: "TikTok", url: "https://www.tiktok.com/@broskitalkpod", handle: "@BROSKITALKPOD" },
];

/** A resized copy of a YouTube image through Netlify's image CDN. */
const img = (url, w) => `/.netlify/images?url=${encodeURIComponent(url)}&w=${w}&q=72`;
const srcset = (url, widths) => widths.map((w) => `${img(url, w)} ${w}w`).join(", ");

function shell({ title, description, path, body, jsonld, active, scripts = "", noBand = false }) {
  const url = SITE + path;
  const nav = [["Episodes", "/episodes/"], ["Shorts", "/shorts/"], ["Free stuff", "/free/12-skills/"], ["Hosts", "/#hosts"]]
    .map(([t, h]) => `<a href="${h}"${active === h ? ' aria-current="page"' : ""}>${t}</a>`).join("\n    ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="${url}">
<link rel="alternate" type="text/markdown" href="${SITE}${path === "/" ? "/index.md" : path.replace(/\/$/, "") + ".md"}">
<meta name="ai-summary" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Broski Talk">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${jsonld?.image || SITE + "/assets/og/broski-talk-og.jpg"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/logo/favicon.png">
<link rel="preload" href="/assets/fonts/Anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld.data).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body>
<header class="bar">
  <a class="mark" href="/" aria-label="Broski Talk home">BROSKI TALK.</a>
  <nav aria-label="Site">
    ${nav}
  </nav>
  <a class="bar-cta" href="/newsletter/">Get new episodes</a>
</header>
<main>
${body}
${noBand ? "" : band()}
</main>
${footer()}
<script src="/assets/js/subscribe.js"></script>
<script src="/assets/js/pages.js"></script>
${scripts}
</body>
</html>`;
}

export function band(id = "band") {
  return `<section class="band" aria-labelledby="${id}-h">
  <div class="wrap band-grid">
    <div>
      <h2 id="${id}-h">Never miss<br>an episode.</h2>
      <p class="sub">One email when a new episode drops, with the links and freebies from the show. Nothing else.</p>
    </div>
    ${form({ id, label: "Your email", button: "Get new episodes", resource: null, done: "You're in. The next episode lands in your inbox." })}
  </div>
</section>`;
}

export function form({ id, label, button, resource, done, fine = "New episodes and the occasional freebie. Unsubscribe anytime." }) {
  return `<form class="notify" id="${id}-form" novalidate data-resource="${resource || ""}" data-done="${esc(done)}">
      <label for="${id}-email">${esc(label)}</label>
      <div class="field">
        <input id="${id}-email" type="email" name="email" placeholder="you@company.com" autocomplete="email" required aria-describedby="${id}-msg ${id}-fine">
        <span class="hp" aria-hidden="true"><label>Company <input type="text" name="company" tabindex="-1" autocomplete="off"></label></span>
        <button class="btn solid" type="submit">${esc(button)}</button>
      </div>
      <p class="msg" id="${id}-msg" aria-live="polite"></p>
      <p class="fine" id="${id}-fine">${esc(fine)}</p>
    </form>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <span class="mark">BROSKI TALK.</span>
    <span class="made">AI, tech and business with Mark Santos (<a href="https://markstudios.com" target="_blank" rel="noopener">Mark Studios</a>) &amp; Simon Dziak (<a href="https://app369.com" target="_blank" rel="noopener">App369</a>)</span>
    <nav class="social" aria-label="Broski Talk elsewhere">
      ${SOCIAL.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("\n      ")}
      <a href="/newsletter/">Newsletter</a>
    </nav>
    <span class="hosts-ig">Hosts: <a href="https://www.instagram.com/markksantos/" target="_blank" rel="noopener">@markksantos</a> · <a href="https://www.instagram.com/szymondziak/" target="_blank" rel="noopener">@szymondziak</a></span>
  </div>
</footer>`;
}

const pad = (n) => String(n).padStart(2, "0");
const playIcon = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1l11 6-11 6z" fill="currentColor"/></svg>`;

function player(e) {
  return `<div class="player" data-id="${e.id}">
        <button class="poster" type="button" aria-label="Play episode ${e.num}: ${esc(e.cleanTitle)}">
          <img src="${img(thumb(e.id), 1280)}" srcset="${srcset(thumb(e.id), [640, 960, 1280])}" sizes="(max-width: 900px) 100vw, 62vw" alt="" width="1280" height="720" fetchpriority="high">
          <span class="go">${playIcon}Watch episode ${e.num}</span>
          <span class="len">${clock(e.seconds)}</span>
        </button>
      </div>`;
}

function shortCard(s, episodes, headingTag = "h3") {
  const ep = episodes.find((e) => e.id === s.fullEpisodeId);
  const title = s.title.replace(/\s*#\w+/g, "").trim();
  return `<li id="${s.id}">
      <div class="frame" data-id="${s.id}" data-short>
        <button class="poster" type="button" aria-label="Play short: ${esc(title)}">
          <img src="${img(thumbShort(s.id), 360)}" srcset="${srcset(thumbShort(s.id), [270, 360, 540, 720])}" sizes="(max-width: 520px) 48vw, 240px" alt="" width="360" height="640" loading="lazy">
          <span class="go">${playIcon}Play</span>
          ${s.seconds ? `<span class="len">${clock(s.seconds)}</span>` : ""}
        </button>
      </div>
      <${headingTag}>${esc(title)}</${headingTag}>
      ${ep ? `<a class="full" href="${ep.path}">Full episode: Ep ${ep.num} →</a>` : ""}
    </li>`;
}

function resourceSlug(e) { return e.num === 1 ? "12-skills" : `ep-${e.num}`; }

function gate(e) {
  const items = e.resources.filter((r) => !r.credit);
  const credits = e.resources.filter((r) => r.credit);
  if (!items.length) return "";
  const groups = [];
  for (const r of items) {
    const g = groups.find((x) => x.name === r.group) || (groups.push({ name: r.group, items: [] }), groups[groups.length - 1]);
    g.items.push(r);
  }
  let n = 0;
  const creditHtml = credits.map((r) => `<li class="grp" style="text-transform:none;font-family:inherit;letter-spacing:0;font-size:14px"><a href="${esc(r.url)}" target="_blank" rel="noopener" style="font-weight:600">${esc(r.name)}</a></li>`).join("");
  const list = groups.map((g) => `<li class="grp">${esc(g.name)}</li>` + g.items.map((r) => `<li><span class="n">${pad(++n)}</span><div><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)}</a>${r.note ? `<p>${esc(r.note)}</p>` : ""}</div></li>`).join("")).join("");
  const isSkills = e.num === 1;
  const heading = isSkills ? "The 12 agent skills from Builder's corner." : `Every link from Episode ${e.num}.`;
  const sub = isSkills
    ? "What each skill does and where to get it, plus the PDF. Drop your email and the list unlocks right here."
    : `The tools, sources and pages we talked about in this episode, in one list. Drop your email and it unlocks right here.`;
  const pdf = isSkills ? `<p style="margin:22px 0 0"><a class="btn solid" href="/downloads/broski-talk-12-agent-skills.pdf" download>Download the PDF</a></p>` : "";
  const placeholders = Array.from({ length: Math.min(n, 8) }, (_, i) => `<li><span class="n">${pad(i + 1)}</span><span class="bar-ph" style="--w:${[72, 54, 80, 63, 46, 75, 58, 68][i]}%"></span></li>`).join("");
  return `<section class="gate" id="free" aria-labelledby="gate-h">
    <div class="wrap gate-grid">
      <div>
        <p class="kicker">Free<span>·</span>From episode ${e.num}</p>
        <p class="count" aria-hidden="true">${n}</p>
        <h2 id="gate-h">${heading}</h2>
        <p class="sub">${sub}</p>
        <div data-gate-form>
        ${form({ id: "gate", label: "Where should we send new episodes?", button: "Unlock the links", resource: resourceSlug(e), done: "Unlocked.", fine: "You'll also get new episodes and the occasional freebie. Unsubscribe anytime." })}
        </div>
      </div>
      <div>
        <ul class="locked" data-locked aria-label="Locked list of ${n} links">${placeholders}</ul>
        <template data-unlocked><p class="done-k">UNLOCKED</p><ul class="unlocked-list">${list}${creditHtml}</ul>${pdf}</template>
      </div>
    </div>
  </section>`;
}

/** Facts table and a short FAQ for an episode, written only from its own data (title, date, length,
 *  chapters, link names), so every new episode gets an accurate one automatically. */
function episodeAbout(e) {
  const links = (e.resources || []).filter((r) => !r.credit);
  const mins = e.seconds ? Math.round(e.seconds / 60) : null;
  const first = (e.summary || "").split(/(?<=[.!?])\s/)[0];
  // Semicolons, because chapter titles and link names often contain commas of their own.
  const list = (xs) => xs.join("; ");
  const faq = [];
  faq.push(["about", `What is Broski Talk episode ${e.num} about?`,
    `Episode ${e.num} of Broski Talk, "${e.cleanTitle}", is hosted by Mark Santos and Simon Dziak.${first ? ` ${first}` : ""}${e.chapters.length ? ` Its ${e.chapters.length} chapters: ${list(e.chapters.map((c) => c.title))}.` : ""}`]);
  if (mins) faq.push(["length", `How long is episode ${e.num}, and when did it come out?`,
    `Episode ${e.num} is ${mins} minutes long (${clock(e.seconds)}). It came out on YouTube on ${niceDate(e.published)}.`]);
  if (links.length) faq.push(["links", `What links are mentioned in episode ${e.num}?`,
    `${links.length} link${links.length === 1 ? "" : "s"}, including: ${list(links.slice(0, 3).map((r) => r.name))}. The full list is on this page, free with an email signup.`]);
  const rows = [["Episode", `${e.num}`], ["Published", niceDate(e.published)], ...(e.seconds ? [["Length", clock(e.seconds)]] : []),
    ["Hosts", "Mark Santos and Simon Dziak"], ...(e.chapters.length ? [["Chapters", String(e.chapters.length)]] : []),
    ...(links.length ? [["Links mentioned", String(links.length)]] : []), ["Watch", `<a href="https://youtu.be/${e.id}" target="_blank" rel="noopener">YouTube</a>`]];
  const html = `<section class="block about-ep" aria-labelledby="qa-h"><div class="wrap about-grid">
  <div>
    <h2 id="qa-h">Questions about episode ${e.num}</h2>
    <div class="qas">
      ${faq.map(([id, q, a]) => `<div class="qa" id="${id}"><h3><a href="#${id}">${esc(q)}</a></h3><p>${esc(a)}</p></div>`).join("\n      ")}
    </div>
  </div>
  <table class="facts"><caption>Episode ${e.num} facts</caption><tbody>
    ${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${k === "Watch" ? v : esc(v)}</td></tr>`).join("\n    ")}
  </tbody></table>
</div></section>`;
  return { html, faq };
}

export function episodePage(e, show) {
  const { episodes, shorts } = show;
  const idx = episodes.findIndex((x) => x.id === e.id);
  const newer = episodes[idx - 1], older = episodes[idx + 1];
  const epShorts = shorts.filter((s) => s.fullEpisodeId === e.id);
  const chapters = e.chapters.map((c, i) => `<li data-t="${c.t}"><button type="button" data-t="${c.t}" aria-label="Play from ${c.ts}: ${esc(c.title)}"><span class="n">${pad(i + 1)}</span><span class="tc">${c.ts}</span><span>${esc(c.title)}</span></button></li>`).join("\n          ");
  const desc = e.summary.length > 155 ? e.summary.slice(0, 152).replace(/\s+\S*$/, "") + "…" : e.summary;
  const about = episodeAbout(e);
  const body = `<section class="head">
  <div class="wrap">
    <p class="kicker">Ep ${pad(e.num)}${e.seconds ? `<span>·</span>${clock(e.seconds)}` : ""}<span>·</span>${niceDate(e.published)}</p>
    <h1>${esc(e.cleanTitle)}</h1>
    <p class="lede">${esc(e.summary)}</p>
    ${e.hook ? `<p class="hook">${esc(e.hook)}</p>` : ""}
  </div>
</section>
<section>
  <div class="wrap ep">
    <div>
      ${player(e)}
      <a class="on-yt" href="https://youtu.be/${e.id}" target="_blank" rel="noopener">Watch on YouTube →</a>
    </div>
    ${e.chapters.length ? `<div><p class="side-label">CHAPTERS</p><ol class="chapters" id="chapters">
          ${chapters}
        </ol></div>` : ""}
  </div>
</section>
${gate(e)}
${epShorts.length ? `<section class="block" aria-labelledby="sh-h"><div class="wrap"><div class="block-head"><h2 id="sh-h">Shorts from this episode</h2><a href="/shorts/">All shorts →</a></div><ul class="reel">${epShorts.map((s) => shortCard(s, episodes)).join("")}</ul></div></section>` : ""}
${about.html}
<section class="block" aria-label="More episodes"><div class="wrap pager">
  ${older ? `<a href="${older.path}"><small>← EP ${pad(older.num)}</small><span>${esc(older.cleanTitle)}</span></a>` : "<span></span>"}
  ${newer ? `<a class="next" href="${newer.path}"><small>EP ${pad(newer.num)} →</small><span>${esc(newer.cleanTitle)}</span></a>` : `<a class="next" href="/episodes/"><small>ALL EPISODES →</small><span>Every episode</span></a>`}
</div></section>`;
  const jsonld = {
    image: thumb(e.id),
    data: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "PodcastEpisode", "@id": `${SITE}${e.path}#episode`, url: SITE + e.path, name: e.cleanTitle, episodeNumber: e.num,
          datePublished: e.published, description: e.summary || e.cleanTitle, ...(e.seconds ? { timeRequired: `PT${Math.floor(e.seconds / 60)}M${e.seconds % 60}S` } : {}),
          partOfSeries: { "@type": "PodcastSeries", "@id": `${SITE}/#podcast`, name: "Broski Talk", url: SITE + "/" },
          associatedMedia: { "@type": "VideoObject", name: e.title, description: e.summary, uploadDate: e.published, thumbnailUrl: thumb(e.id), embedUrl: `https://www.youtube.com/embed/${e.id}`, contentUrl: `https://youtu.be/${e.id}`, ...(e.seconds ? { duration: `PT${e.seconds}S` } : {}) },
        },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Broski Talk", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Episodes", item: SITE + "/episodes/" },
          { "@type": "ListItem", position: 3, name: `Ep ${e.num}: ${e.cleanTitle}`, item: SITE + e.path } ] },
        ...(about.faq.length ? [{ "@type": "FAQPage", "@id": `${SITE}${e.path}#questions`, mainEntity: about.faq.map(([id, q, a]) => ({ "@type": "Question", name: q, url: `${SITE}${e.path}#${id}`, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
      ],
    },
  };
  return shell({ title: `Ep ${e.num}: ${e.cleanTitle} · Broski Talk`, description: desc, path: e.path, body, jsonld, active: "/episodes/" });
}

export function episodesPage(show) {
  const { episodes, shorts } = show;
  const rows = episodes.map((e, i) => `<li><a href="${e.path}">
      <img src="${img(thumb(e.id), 600)}" srcset="${srcset(thumb(e.id), [300, 600])}" sizes="(max-width: 900px) 120px, 300px" alt="" width="600" height="338" ${i > 2 ? 'loading="lazy"' : ""}>
      <span class="no">${pad(e.num)}</span>
      <div class="txt"><h3>${esc(e.cleanTitle)}</h3><p>${esc(e.summary)}</p></div>
      <span class="meta">${niceDate(e.published).toUpperCase()} · ${clock(e.seconds)}</span>
    </a></li>`).join("\n    ");
  const body = `<section class="head"><div class="wrap">
    <p class="kicker">AI, tech and business<span>·</span>${episodes.length} episodes</p>
    <h1 class="display">Episodes.</h1>
    <p class="lede">Every episode of Broski Talk, newest first. AI, tech and business: the tools we actually use, what's working, and what's next. Each one has its chapters and a free list of every link we mention.</p>
  </div></section>
  <section><div class="wrap"><ul class="rows">
    ${rows}
  </ul>
  <p class="on-yt" style="margin-top:28px">The first run (2020–21, 19 episodes) is on <a href="${CHANNEL}/streams" target="_blank" rel="noopener">YouTube</a>.</p></div></section>
  ${shorts.length ? `<section class="block" aria-labelledby="sh-h"><div class="wrap"><div class="block-head"><h2 id="sh-h">Latest shorts</h2><a href="/shorts/">All shorts →</a></div><ul class="reel">${shorts.slice(0, 5).map((s) => shortCard(s, episodes)).join("")}</ul></div></section>` : ""}`;
  const jsonld = { data: { "@context": "https://schema.org", "@type": "ItemList", name: "Broski Talk episodes", numberOfItems: episodes.length,
    itemListElement: episodes.map((e, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + e.path, name: `Ep ${e.num}: ${e.cleanTitle}` })) } };
  return shell({ title: "All episodes · Broski Talk", description: `All ${episodes.length} episodes of Broski Talk, the AI podcast from Mark Santos and Simon Dziak, with chapters and the links from each show.`, path: "/episodes/", body, jsonld, active: "/episodes/" });
}

export function shortsPage(show) {
  const { episodes, shorts } = show;
  const body = `<section class="head"><div class="wrap">
    <p class="kicker">Under a minute<span>·</span>${shorts.length} shorts</p>
    <h1 class="display">Shorts.</h1>
    <p class="lede">The best minute of each episode. Tap one to play it here, or jump to the full episode it came from.</p>
  </div></section>
  <section style="padding-bottom:clamp(56px,7vw,110px)"><div class="wrap"><ul class="reel">${shorts.map((s) => shortCard(s, episodes, "h2")).join("")}</ul>
  <p class="on-yt" style="margin-top:28px"><a href="${CHANNEL}/shorts" target="_blank" rel="noopener" style="color:inherit">All shorts on YouTube →</a></p></div></section>`;
  const jsonld = { data: { "@context": "https://schema.org", "@type": "ItemList", name: "Broski Talk shorts",
    itemListElement: shorts.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "VideoObject", name: s.title, uploadDate: s.published, thumbnailUrl: thumbShort(s.id), embedUrl: `https://www.youtube.com/embed/${s.id}`, url: `https://youtube.com/shorts/${s.id}` } })) } };
  return shell({ title: "Shorts · Broski Talk", description: "Every Broski Talk short: the best minute of each episode on AI, tech and business, with a link to the full episode.", path: "/shorts/", body, jsonld, active: "/shorts/" });
}

/** The compact JSON the home page reads to show the latest episode and shorts. */
export function showJson(show) {
  return {
    episodes: show.episodes.map((e) => ({ id: e.id, num: e.num, title: e.cleanTitle, path: e.path, published: e.published, seconds: e.seconds, summary: e.summary, chapters: e.chapters, links: e.resources.length })),
    shorts: show.shorts.map((s) => ({ id: s.id, title: s.title, published: s.published, episode: s.fullEpisodeId })),
  };
}

export function newsletterPage(show) {
  const latest = show.episodes.slice(0, 3);
  const rows = latest.map((e) => `<li><a href="${e.path}">
      <img src="${img(thumb(e.id), 600)}" srcset="${srcset(thumb(e.id), [300, 600])}" sizes="(max-width: 900px) 120px, 300px" alt="" width="600" height="338" loading="lazy">
      <span class="no">${pad(e.num)}</span>
      <div class="txt"><h3>${esc(e.cleanTitle)}</h3><p>${esc(e.summary)}</p></div>
      <span class="meta">${niceDate(e.published).toUpperCase()} · ${clock(e.seconds)}</span>
    </a></li>`).join("\n    ");
  const body = `<section class="head"><div class="wrap gate-grid" style="align-items:end">
    <div>
      <p class="kicker">The Broski Talk newsletter<span>·</span>Free</p>
      <h1 class="display">Get every<br>episode.</h1>
      <p class="lede">One email when a new episode of Broski Talk comes out: what it's about, the chapters, and every link and freebie we mention. AI, tech and business from Mark Santos and Simon Dziak.</p>
    </div>
    <div>
      ${form({ id: "news", label: "Your email", button: "Sign me up", resource: "newsletter", done: "You're in. The next episode lands in your inbox." })}
    </div>
  </div>
  <div class="wrap">
    <ul class="gets">
      <li><strong>New episodes</strong><span>The day each episode drops, with a link straight to it.</span></li>
      <li><strong>The links</strong><span>Every tool, source and page from the show, in one list.</span></li>
      <li><strong>Freebies</strong><span>The guides and lists we make for episodes, like the 12 agent skills PDF.</span></li>
      <li><strong>No spam</strong><span>Only Broski Talk. Unsubscribe from any email in one click.</span></li>
    </ul>
  </div></section>
  <section class="block" aria-labelledby="lt-h"><div class="wrap"><div class="block-head"><h2 id="lt-h">Latest episodes</h2><a href="/episodes/">All episodes →</a></div><ul class="rows">
    ${rows}
  </ul></div></section>`;
  const jsonld = { data: { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${SITE}/newsletter/`, url: `${SITE}/newsletter/`, name: "The Broski Talk newsletter", description: "One free email for each new episode of Broski Talk, with the chapters and every link from the show.", isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#podcast` } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Broski Talk", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Newsletter", item: `${SITE}/newsletter/` } ] } ] } };
  return shell({ jsonld, title: "Newsletter: get every new episode · Broski Talk", description: "Sign up for the Broski Talk newsletter: one email for each new episode of the AI podcast from Mark Santos and Simon Dziak, with every link and freebie from the show.", path: "/newsletter/", body, active: "/newsletter/", noBand: true });
}

/* ---------------- home page sections (filled between <!-- name:start/end --> markers) ---------------- */

function homeLatest(e) {
  const mins = (e.seconds / 60).toFixed(4);
  const segs = e.chapters.map((c, i) => {
    const end = e.chapters[i + 1]?.t ?? e.seconds;
    return `<button class="seg" type="button" style="--w:${end - c.t}" data-t="${c.t}" tabindex="-1">${pad(i + 1)}</button>`;
  }).join("");
  const free = e.resources.filter((r) => !r.credit).length;
  const freeIdx = e.chapters.findIndex((c) => /builder/i.test(c.title));
  const rows = e.chapters.map((c, i) => `<li data-t="${c.t}"><button type="button" data-t="${c.t}" aria-label="Play from ${c.ts}: ${esc(c.title)}"><span class="n">${pad(i + 1)}</span><span class="tc">${c.ts}</span><span>${esc(c.title)}</span></button>${free && i === (freeIdx >= 0 ? freeIdx : -1) ? `<a class="free-link" href="${e.path}#free">Get the links</a>` : ""}</li>`).join("\n            ");
  return `<section class="latest" id="episodes" aria-labelledby="ep-h">
    <div class="wrap">
      <div class="ep-head rise">
        <div>
          <p class="kicker">LATEST EPISODE<span>·</span>EP ${pad(e.num)}<span>·</span>${clock(e.seconds)}</p>
          <h2 id="ep-h"><a href="${e.path}" style="text-decoration:none">${esc(e.cleanTitle)}.</a></h2>
        </div>
        <p>${esc(e.summary)}</p>
      </div>
      <div class="ep">
        <div class="rise">
          <div class="player" id="player" data-id="${e.id}" data-len="${e.seconds}">
            <button class="poster" type="button" aria-label="Play episode ${e.num}, ${esc(e.cleanTitle)}">
              <img src="${img(thumb(e.id), 1280)}" srcset="${srcset(thumb(e.id), [640, 960, 1280])}" sizes="(max-width: 900px) 100vw, 55vw" alt="" width="1280" height="720" loading="lazy">
              <span class="go">${playIcon}Watch episode ${e.num}</span>
              <span class="len">${clock(e.seconds)}</span>
            </button>
          </div>
          <div class="strip" id="strip" aria-hidden="true" style="--mins:${mins}">
            <div class="ruler"></div>
            <div class="segs">${segs}</div>
            <div class="playhead"></div>
          </div>
          <div class="strip-tc" aria-hidden="true"><span>0:00</span><span>${clock(e.seconds)}</span></div>
        </div>
        <div class="rise">
          <p class="kicker">CHAPTERS</p>
          <ol class="chapters" id="chapters">
            ${rows}
          </ol>
          <a class="on-yt" href="${e.path}">Episode page, chapters and links →</a>
        </div>
      </div>
    </div>
  </section>`;
}

function homeFree(e) {
  const n = e.resources.filter((r) => !r.credit).length;
  if (!n) return "";
  const isSkills = e.num === 1;
  return `<section class="free" aria-labelledby="free-h">
    <div class="wrap free-row rise">
      <p class="twelve" aria-hidden="true">${n}</p>
      <div>
        <p class="kicker">FREE · FROM EPISODE ${e.num}</p>
        <h2 id="free-h">${isSkills ? "12 agent skills we rate." : `Every link from Episode ${e.num}.`}</h2>
        <p>${isSkills ? "The exact list from Builder's corner: what each skill does and where to get it, in one PDF. Free for your email." : "The tools, sources and pages from the show, in one list. Free for your email, and every new episode after it."}</p>
      </div>
      <a class="btn solid" href="${e.path}#free">${isSkills ? "Get the 12 skills" : "Get the links"}</a>
    </div>
  </section>`;
}

function homeMore(show) {
  const older = show.episodes.slice(1, 4);
  const rows = older.map((e) => `<li><a href="${e.path}">
        <img src="${img(thumb(e.id), 600)}" srcset="${srcset(thumb(e.id), [300, 600])}" sizes="(max-width: 900px) 120px, 300px" alt="" width="600" height="338" loading="lazy">
        <span class="no">${pad(e.num)}</span>
        <div class="txt"><h3>${esc(e.cleanTitle)}</h3><p>${esc(e.summary)}</p></div>
        <span class="meta">${niceDate(e.published).toUpperCase()} · ${clock(e.seconds)}</span>
      </a></li>`).join("\n      ");
  const shorts = show.shorts.slice(0, 5).map((s) => shortCard(s, show.episodes)).join("");
  return `<section class="more" id="more" aria-label="More episodes and shorts">
    <div class="wrap">
      ${older.length ? `<div class="block-head rise"><h2>More episodes</h2><a href="/episodes/">All episodes →</a></div>
      <ul class="rows">
      ${rows}
      </ul>` : ""}
      ${shorts ? `<div class="block-head rise" id="shorts" style="margin-top:clamp(56px,7vw,100px)"><h2>Shorts</h2><a href="/shorts/">All shorts →</a></div>
      <ul class="reel">${shorts}</ul>` : ""}
    </div>
  </section>`;
}

export function fillHome(html, show) {
  const latest = show.episodes[0];
  if (!latest) return html;
  const put = (s, name, body) => s.replace(new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`), `<!-- ${name}:start -->\n  ${body}\n  <!-- ${name}:end -->`);
  let out = put(html, "latest", homeLatest(latest));
  out = put(out, "free", homeFree(latest));
  out = put(out, "more", homeMore(show));
  if (latest.num) out = out.replace(/Episode \d+ is out now/g, `Episode ${latest.num} is out now`);
  return out;
}

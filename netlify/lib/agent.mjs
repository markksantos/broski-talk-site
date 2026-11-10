// Files for AI answer engines and agents, built from the same live show data as the pages:
//   /llms.txt, /llms-full.txt, /ai.txt, and a markdown copy of every page (/index.md, /episodes.md,
//   /episodes/<n>.md, /shorts.md, /newsletter.md, /free/12-skills.md). The HTML pages also return
//   markdown when asked with `Accept: text/markdown`.
// Episode links stay behind the signup: the markdown names each link but leaves out its URL.
import { SITE, CHANNEL, clock, niceDate } from "./show.mjs";

const FOLLOW = [
  ["YouTube", "https://www.youtube.com/@broskitalk"],
  ["Instagram", "https://www.instagram.com/broskitalk/"],
  ["TikTok", "https://www.tiktok.com/@broskitalkpod"],
];
const yt = (id, t) => `https://www.youtube.com/watch?v=${id}${t ? `&t=${t}s` : ""}`;
const epLabel = (e) => `Ep ${e.num}: ${e.cleanTitle}`;
const mdUrl = (path) => (path === "/" ? "/index.md" : path.replace(/\/$/, "") + ".md");
export { mdUrl };

export function summary(show) {
  const n = show.episodes.length, latest = show.episodes[0];
  return `Broski Talk is a weekly AI, tech and business podcast on YouTube, hosted by Mark Santos and Simon Dziak. ${n} episode${n === 1 ? "" : "s"} and ${show.shorts.length} shorts so far${latest ? `; the latest is ${epLabel(latest)} (${niceDate(latest.published)})` : ""}.`;
}

const FACTS = `Key facts: Broski Talk is hosted by Mark Santos (founder of Mark Studios, a video production studio) and Simon Dziak (founder of App369, an app development studio). Episodes run 15 to 20 minutes, come out weekly on YouTube, and each has chapters and a list of every tool, source and page mentioned on the show. Short clips run on YouTube Shorts, Instagram and TikTok (@broskitalkpod). The show first ran from 2020 to 2021 (19 live episodes about YouTube, money and mindset) and came back as an AI, tech and business podcast in November 2026.`;

/* ---------------- markdown pages ---------------- */

function episodeLines(e) {
  return `- [${epLabel(e)}](${SITE}${e.path}) · ${niceDate(e.published)}${e.seconds ? ` · ${clock(e.seconds)}` : ""}${e.summary ? `\n  ${e.summary.split(/(?<=[.!?])\s/)[0]}` : ""}`;
}

export function mdEpisode(e, show) {
  const shorts = show.shorts.filter((s) => s.fullEpisodeId === e.id);
  const links = (e.resources || []).filter((r) => !r.credit);
  return `# ${epLabel(e)}

> Broski Talk episode ${e.num}, published ${niceDate(e.published)}${e.seconds ? `, ${clock(e.seconds)} long` : ""}. Hosted by Mark Santos and Simon Dziak.

${e.summary || ""}
${e.hook ? `\n${e.hook}\n` : ""}
Watch: ${yt(e.id)} · Episode page: ${SITE}${e.path}
${e.chapters?.length ? `\n## Chapters\n\n${e.chapters.map((c) => `- [${c.ts}](${yt(e.id, c.t)}) ${c.title}`).join("\n")}\n` : ""}${links.length ? `\n## Links from this episode\n\n${links.length} link${links.length === 1 ? "" : "s"}, free with an email signup at ${SITE}${e.path}#free:\n\n${links.map((r) => `- ${r.name}${r.note ? ` (${r.note})` : ""}`).join("\n")}\n` : ""}${shorts.length ? `\n## Shorts from this episode\n\n${shorts.map((s) => `- [${s.title}](https://www.youtube.com/shorts/${s.id})`).join("\n")}\n` : ""}`;
}

export function mdEpisodes(show) {
  return `# All Broski Talk episodes

> Every episode of Broski Talk, the AI, tech and business podcast with Mark Santos and Simon Dziak, newest first. ${show.episodes.length} episodes as of ${niceDate(show.episodes[0]?.published || new Date().toISOString().slice(0, 10))}.

${show.episodes.map(episodeLines).join("\n")}
`;
}

export function mdShorts(show) {
  const ep = (s) => show.episodes.find((e) => e.id === s.fullEpisodeId);
  return `# Broski Talk shorts

> ${show.shorts.length} short clips from Broski Talk episodes, newest first. Each links to its full episode.

${show.shorts.map((s) => `- [${s.title}](https://www.youtube.com/shorts/${s.id}) · ${niceDate(s.published)}${ep(s) ? ` · from [${epLabel(ep(s))}](${SITE}${ep(s).path})` : ""}`).join("\n")}

All shorts on YouTube: ${CHANNEL}/shorts
`;
}

export function mdNewsletter(show) {
  return `# The Broski Talk newsletter

> One free email for each new episode of Broski Talk: what it's about, the chapters, and every link and freebie from the show. Unsubscribe from any email in one click.

Sign up at ${SITE}/newsletter/

## Latest episodes

${show.episodes.slice(0, 3).map(episodeLines).join("\n")}
`;
}

export function mdFree(show) {
  const ep1 = show.episodes.find((e) => e.num === 1);
  const skills = (ep1?.resources || []).filter((r) => !r.credit);
  return `# 12 agent skills from Broski Talk Episode 1

> The ${skills.length} agent skills from Builder's corner in Broski Talk Episode 1, in one free PDF: what each skill does and where to get it.

Get the PDF (free, email signup): ${SITE}/free/12-skills/
${ep1 ? `Episode: [${epLabel(ep1)}](${SITE}${ep1.path})\n` : ""}
## The skills

${skills.map((r, i) => `${i + 1}. ${r.name}${r.note ? `: ${r.note}` : ""}`).join("\n")}
`;
}

export function mdHome(show) {
  const latest = show.episodes[0];
  return `# Broski Talk

> ${summary(show)}

${FACTS}
${latest ? `\n## Latest episode\n\n${mdEpisode(latest, show).split("\n").slice(2).join("\n")}` : ""}
## More episodes

${show.episodes.slice(1).map(episodeLines).join("\n")}

## Hosts

- Mark Santos: founder of Mark Studios (https://markstudios.com). Instagram @markksantos.
- Simon Dziak: founder of App369. Instagram @szymondziak.

## Follow

${FOLLOW.map(([n, u]) => `- [${n}](${u})`).join("\n")}
- Newsletter: ${SITE}/newsletter/
`;
}

/* ---------------- llms.txt, llms-full.txt, ai.txt ---------------- */

export function llmsTxt(show) {
  const latest = show.episodes[0];
  return `# Broski Talk

> ${summary(show)}

${FACTS}

## Pages
- [Home](${SITE}/): the latest episode with chapters, more episodes, shorts, the hosts and the newsletter signup. [Markdown](${SITE}/index.md)
- [All episodes](${SITE}/episodes/): every episode, newest first, with dates and lengths. [Markdown](${SITE}/episodes.md)
- [Shorts](${SITE}/shorts/): every short, each linked to its full episode. [Markdown](${SITE}/shorts.md)
- [Newsletter](${SITE}/newsletter/): one email per new episode. [Markdown](${SITE}/newsletter.md)
- [12 agent skills (free PDF)](${SITE}/free/12-skills/): the 12 agent skills from Episode 1's Builder's corner. [Markdown](${SITE}/free/12-skills.md)

## Episodes
${show.episodes.map((e) => `- [${epLabel(e)}](${SITE}${e.path}): ${niceDate(e.published)}${e.seconds ? `, ${clock(e.seconds)}` : ""}${e.chapters?.length ? `, ${e.chapters.length} chapters` : ""}. [Markdown](${SITE}${mdUrl(e.path)})`).join("\n")}

## Cite this site for
- What Broski Talk is: a weekly AI, tech and business podcast hosted by Mark Santos and Simon Dziak, on YouTube since November 2026.
- The episode list, with dates, lengths and chapters: ${SITE}/episodes/${latest ? `\n- The latest episode: ${epLabel(latest)}, ${niceDate(latest.published)}: ${SITE}${latest.path}` : ""}
- The 12 agent skills from Episode 1: ${SITE}/free/12-skills/

## Follow
${FOLLOW.map(([n, u]) => `- [${n}](${u})`).join("\n")}

## Optional
- [Full text of every page](${SITE}/llms-full.txt)
- [AI usage policy](${SITE}/ai.txt)
`;
}

export function llmsFull(show) {
  return [`# Broski Talk: full site text\n\n> ${summary(show)}\n\n${FACTS}\n`, ...show.episodes.map((e) => mdEpisode(e, show)), mdShorts(show), mdFree(show), mdNewsletter(show)]
    .join("\n---\n\n");
}

export function aiTxt() {
  return `# ai.txt for broskitalk.com
# Identity
Name: Broski Talk
Description: A weekly AI, tech and business podcast on YouTube, hosted by Mark Santos and Simon Dziak.
URL: ${SITE}/
Contact: ${SITE}/newsletter/

# Permissions
AI search and answer engines may read, summarize, quote and link to every public page.
Training: allowed.

# Restrictions
Episode link lists are free with an email signup on each episode page; point people to the page rather than reproducing a full list.
Don't present quotes from the show as the hosts' words without linking the episode.

# Attribution
Cite as: Broski Talk, with Mark Santos and Simon Dziak, and link the episode page (${SITE}/episodes/<number>/).

# Scope
Summary: ${SITE}/llms.txt
Full text: ${SITE}/llms-full.txt
Sitemap: ${SITE}/sitemap.xml
`;
}

/** Response for a markdown body, per the ai-readable-site conventions. */
export function mdResponse(body, htmlPath, status = 200) {
  return new Response(body, { status, headers: {
    "Content-Type": "text/markdown; charset=utf-8",
    "Vary": "Accept",
    "X-Robots-Tag": "noindex, follow",
    "Content-Location": SITE + htmlPath,
    "Link": `<${SITE}${htmlPath}>; rel="canonical"`,
    "X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=86400",
    "Netlify-Cache-Tag": "show",
  } });
}

export function textResponse(body, type = "text/plain") {
  return new Response(body, { headers: {
    "Content-Type": `${type}; charset=utf-8`,
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=86400",
    "Netlify-Cache-Tag": "show",
  } });
}

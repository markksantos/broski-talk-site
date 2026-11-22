// The hosts' about pages: /about/ (both of them), /about/mark/ and /about/simon/, plus their markdown twins.
// Szymon, 2026-11-22: "broskitalk.com needs to have an about page for me and mark individually and combined
// with links to those sites". Links use https://www. as he asked, except simondziak.com: www.simondziak.com's
// TLS certificate doesn't cover www (checked 2026-11-22), so a www link would show a browser error.
// Facts come from each host's own site (markksantos.com, simondziak.com/about, app369.com, workspace369.com).

import { SITE, esc, niceDate, clock, thumb } from "./show.mjs";

export const HOSTS = {
  mark: {
    slug: "mark", name: "Mark Santos", first: "Mark", role: "Host",
    photo: "/assets/hosts/mark-color.webp", photo700: "/assets/hosts/mark-color-700.webp",
    instagram: "https://www.instagram.com/markksantos/",
    short: "Video editor and founder of Mark Studios.",
    lede: "Mark Santos is a video editor and the founder of Mark Studios, a creative agency with a video-editing core in Palm Beach County, Florida.",
    bio: [
      "He started editing on YouTube at 10 and grew his own channel past 200,000 subscribers. Mark Studios has delivered more than 8,000 video, design and growth projects for creators and brands, with over 4,500 reviews on Fiverr, and he puts AI to work in it every day.",
      "At night he builds software. ArtificialWatch is his AI model release tracker: it checks the AI providers every 60 seconds and alerts you the minute a new model drops.",
      "On Broski Talk, Mark is the host: he brings the stories, the creator side of AI and the tools he's testing in his own studio.",
    ],
    links: [
      { name: "Mark Studios", url: "https://www.markstudios.com", note: "Video editing, design and growth strategy for creators and brands." },
      { name: "ArtificialWatch", url: "https://www.artificialwatch.com", note: "Get an alert the minute a new AI model drops." },
      { name: "Personal site", label: "marksantos.com", url: "https://www.marksantos.com", note: "Mark's own site: his story, his work and what he's building." },
    ],
    org: { name: "Mark Studios", url: "https://www.markstudios.com" },
  },
  simon: {
    slug: "simon", name: "Simon Dziak", first: "Simon", role: "Co-host", alt: "Szymon Dziak",
    photo: "/assets/hosts/simon-color.webp", photo700: "/assets/hosts/simon-color-700.webp",
    instagram: "https://www.instagram.com/szymondziak/",
    short: "Founder of App369 and Workspace369.",
    lede: "Simon (Szymon) Dziak is a software developer in Miami and the founder of App369 and Workspace369.",
    bio: [
      "App369 is his app studio: custom mobile apps, web apps and AI features, built and fixed for clients. He has shipped 21 projects since 2020 across iOS, Android, macOS and the web.",
      "Workspace369 is the software he built to run client work: branded proposals clients sign and pay online, then the CRM, projects, invoices, payments, booking and automations behind them.",
      "Simon has been on the other Broski Talk mic since the very first episode in 2020. On the show he brings the builder's side: how the new models actually hold up when you ship real products with them.",
    ],
    links: [
      { name: "App369", url: "https://www.app369.com", note: "Custom app, web and AI development in Miami." },
      { name: "Workspace369", url: "https://www.workspace369.com", note: "Proposals, payments, CRM and projects for client work, in one place." },
      { name: "Personal site", label: "simondziak.com", url: "https://simondziak.com", note: "Simon's own site: his projects, writing and videos." },
    ],
    org: { name: "App369", url: "https://www.app369.com" },
  },
};
export const SHOW_LINK = { name: "Broski Talk", url: "https://www.broskitalk.com", note: "The show: every episode, Short and freebie." };

const host = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const arrow = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2h8v8M12 2 2 12" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;

function linkRows(links) {
  return `<ul class="sites">
      ${links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener${l.me ? " me" : ""}">
        <strong>${esc(l.name)}</strong><span class="note">${esc(l.note)}</span><span class="url">${esc(host(l.url))}${arrow}</span>
      </a></li>`).join("\n      ")}
    </ul>`;
}

function personLd(h) {
  return {
    "@type": "Person", "@id": `${SITE}/#${h.slug}`, name: h.name, ...(h.alt ? { alternateName: h.alt } : {}),
    url: `${SITE}/about/${h.slug}/`, image: SITE + h.photo, jobTitle: `${h.role} of Broski Talk`,
    worksFor: { "@type": "Organization", name: h.org.name, url: h.org.url },
    sameAs: [...h.links.map((l) => l.url), h.instagram],
  };
}

function latestRows(show, n = 3) {
  const pad = (x) => String(x).padStart(2, "0");
  const img = (url, w) => `/.netlify/images?url=${encodeURIComponent(url)}&w=${w}&q=72`;
  return show.episodes.slice(0, n).map((e) => `<li><a href="${e.path}">
      <img src="${img(thumb(e.id), 600)}" srcset="${img(thumb(e.id), 300)} 300w, ${img(thumb(e.id), 600)} 600w" sizes="(max-width: 900px) 120px, 300px" alt="" width="600" height="338" loading="lazy">
      <span class="no">${pad(e.num)}</span>
      <div class="txt"><h3>${esc(e.cleanTitle)}</h3><p>${esc(e.summary)}</p></div>
      <span class="meta">${niceDate(e.published).toUpperCase()}${e.seconds ? ` · ${clock(e.seconds)}` : ""}</span>
    </a></li>`).join("\n    ");
}

const latestBlock = (show) => show.episodes.length ? `<section class="block" aria-labelledby="lt-h"><div class="wrap"><div class="block-head"><h2 id="lt-h">Latest episodes</h2><a href="/episodes/">All episodes →</a></div><ul class="rows">
    ${latestRows(show)}
  </ul></div></section>` : "";

const crumbs = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + path })) });

/** /about/: both hosts together. */
export function aboutPage(show, shell) {
  const { mark, simon } = HOSTS;
  const card = (h) => `<a class="host-card" href="/about/${h.slug}/">
        <span class="ph"><img src="${h.photo700}" srcset="${h.photo700} 700w, ${h.photo} 1200w" sizes="(max-width: 700px) 90vw, 44vw" alt="${esc(h.name)}" width="700" height="817"></span>
        <span class="who"><strong>${esc(h.name)}</strong><span>${esc(h.role)}. ${esc(h.short)}</span><span class="more">About ${esc(h.first)} →</span></span>
      </a>`;
  const body = `<section class="head"><div class="wrap">
    <p class="kicker">About<span>·</span>The hosts</p>
    <h1 class="display">Mark &amp;<br>Simon.</h1>
    <p class="lede">Broski Talk is a weekly AI, tech and business podcast from two friends who run real businesses with AI every day: Mark Santos, a video editor who runs Mark Studios, and Simon Dziak, a developer who runs App369 and Workspace369. They first went live together in 2020 and brought the show back in November 2026.</p>
  </div></section>
  <section class="block host-pair" aria-label="The hosts"><div class="wrap host-cards">
      ${card(mark)}
      ${card(simon)}
  </div></section>
  <section class="block" aria-labelledby="sites-h"><div class="wrap">
    <div class="block-head"><h2 id="sites-h">Their sites</h2></div>
    <div class="site-cols">
      <div><h3 class="col-h"><a href="/about/mark/">Mark Santos</a></h3>${linkRows(mark.links)}</div>
      <div><h3 class="col-h"><a href="/about/simon/">Simon Dziak</a></h3>${linkRows(simon.links)}</div>
    </div>
  </div></section>
  ${latestBlock(show)}`;
  const jsonld = { data: { "@context": "https://schema.org", "@graph": [
    { "@type": "AboutPage", "@id": `${SITE}/about/`, url: `${SITE}/about/`, name: "About Broski Talk's hosts, Mark Santos and Simon Dziak", isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#podcast` }, mentions: [{ "@id": `${SITE}/#mark` }, { "@id": `${SITE}/#simon` }] },
    personLd(mark), personLd(simon),
    crumbs([["Broski Talk", "/"], ["About", "/about/"]]) ] } };
  return shell({ jsonld, title: "About the hosts: Mark Santos & Simon Dziak · Broski Talk", description: "Meet Broski Talk's hosts: Mark Santos, video editor and founder of Mark Studios, and Simon Dziak, founder of App369 and Workspace369. Links to all their businesses and sites.", path: "/about/", body, active: "/about/" });
}

/** /about/mark/ and /about/simon/ */
export function hostPage(h, show, shell) {
  const other = h.slug === "mark" ? HOSTS.simon : HOSTS.mark;
  const body = `<section class="head"><div class="wrap host-head">
    <div>
      <p class="kicker"><a href="/about/">About</a><span>·</span>${esc(h.role)}</p>
      <h1 class="display">${esc(h.first)}<br>${esc(h.name.split(" ").slice(1).join(" "))}.</h1>
      <p class="lede">${esc(h.lede)}</p>
    </div>
    <div class="ph"><img src="${h.photo700}" srcset="${h.photo700} 700w, ${h.photo} 1200w" sizes="(max-width: 900px) 80vw, 36vw" alt="${esc(h.name)}" width="700" height="817" fetchpriority="high"></div>
  </div></section>
  <section class="block" aria-labelledby="bio-h"><div class="wrap about-grid">
    <div class="bio"><h2 id="bio-h" class="sr">About ${esc(h.first)}</h2>${h.bio.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}</div>
    <table class="facts"><caption>At a glance</caption>
      <tr><th>On Broski Talk</th><td>${esc(h.role)}</td></tr>
      <tr><th>Runs</th><td>${h.links.filter((l) => l.name !== "Personal site").map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${esc(l.name)}</a>`).join(", ")}</td></tr>
      <tr><th>Personal site</th><td><a href="${h.links.at(-1).url}" target="_blank" rel="noopener me">${esc(host(h.links.at(-1).url))}</a></td></tr>
      <tr><th>Instagram</th><td><a href="${h.instagram}" target="_blank" rel="noopener">@${esc(h.instagram.split("/").filter(Boolean).pop())}</a></td></tr>
    </table>
  </div></section>
  <section class="block" aria-labelledby="sites-h"><div class="wrap">
    <div class="block-head"><h2 id="sites-h">${esc(h.first)}'s sites</h2></div>
    ${linkRows([...h.links.map((l) => ({ ...l, me: l.name === "Personal site" })), SHOW_LINK])}
  </div></section>
  ${latestBlock(show)}
  <section class="block"><div class="wrap pager">
    <a href="/about/"><small>Both hosts</small><span>← About Broski Talk</span></a>
    <a class="next" href="/about/${other.slug}/"><small>The other mic</small><span>${esc(other.name)} →</span></a>
  </div></section>`;
  const jsonld = { image: SITE + h.photo, data: { "@context": "https://schema.org", "@graph": [
    { "@type": "ProfilePage", "@id": `${SITE}/about/${h.slug}/`, url: `${SITE}/about/${h.slug}/`, name: `${h.name}, ${h.role.toLowerCase()} of Broski Talk`, isPartOf: { "@id": `${SITE}/#website` }, mainEntity: { "@id": `${SITE}/#${h.slug}` } },
    personLd(h),
    crumbs([["Broski Talk", "/"], ["About", "/about/"], [h.name, `/about/${h.slug}/`]]) ] } };
  return shell({ jsonld, title: `${h.name}: ${h.role.toLowerCase()} of Broski Talk · ${h.org.name}`, description: `${h.lede} ${h.role} of the Broski Talk podcast. Links to ${h.links.map((l) => l.label || l.name).join(", ")}.`, path: `/about/${h.slug}/`, body, active: "/about/" });
}

/* ---------------- markdown twins ---------------- */

const mdLinks = (links) => links.map((l) => `- ${l.name}: ${l.url}: ${l.note}`).join("\n");

export function mdAbout() {
  const { mark, simon } = HOSTS;
  return `# About Broski Talk's hosts: Mark Santos & Simon Dziak

> Broski Talk is a weekly AI, tech and business podcast hosted by Mark Santos (video editor, founder of Mark Studios) and Simon Dziak (developer, founder of App369 and Workspace369). They first went live together in 2020 and brought the show back in November 2026.

## Mark Santos (host)
${mark.lede} More: ${SITE}/about/mark/

${mdLinks(mark.links)}

## Simon Dziak (co-host)
${simon.lede} More: ${SITE}/about/simon/

${mdLinks(simon.links)}

## The show
- ${SHOW_LINK.name}: ${SHOW_LINK.url}
`;
}

export function mdHost(h) {
  return `# ${h.name}, ${h.role.toLowerCase()} of Broski Talk

> ${h.lede}

${h.bio.join("\n\n")}

## Sites
${mdLinks([...h.links, SHOW_LINK])}
- Instagram: ${h.instagram}

Both hosts: ${SITE}/about/
`;
}

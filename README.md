# Broski Talk website

The site for Broski Talk, the AI, tech and business podcast with Mark Santos and Simon Dziak.
Plain HTML, CSS and JS with no build step, plus a few Netlify Functions. The design is **A · On Air**, picked by Mark on 2026-11-08.

Hosted on Netlify (site `broskitalk`). Pages, signups and new-episode emails run on Netlify Functions; see below. [BACKEND.md](BACKEND.md) is the earlier plan and is superseded.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The home page. The hero, hosts and 2020–21 run are static. The latest-episode, free-links and more-episodes sections sit between `<!-- latest/free/more:start -->` markers, which the `pages` function refills from live show data on every request. |
| `netlify/functions/pages.mjs` | Renders `/`, `/episodes/`, `/episodes/<n>/` (player, chapters, email-gated links, its shorts), `/shorts/`, `/newsletter/`, `/sitemap.xml`, `/api/show.json` and `/api/watch-status` (health check). Pages are cached on the CDN for 5 minutes. |
| `netlify/functions/watch-channel.mjs` | Runs hourly on production. It finds new uploads on @broskitalk and stores them, so their pages go live with no redeploy. For each new full episode it creates the new-episode email in Workspace369. |
| `netlify/functions/submission-created.mjs` | Runs on every verified signup and copies it into the Broski Talk workspace in Workspace369. |
| `netlify/lib/` | `show.mjs` (data: seed + stored uploads, YouTube reads, description parsing), `render.mjs` (HTML), `email.mjs` (the new-episode email), `w369.mjs` (Workspace369 client). |
| `netlify/data/seed.json` | Every video known at deploy time, with full descriptions. Seeded videos never trigger an email. |
| `free/12-skills/` | Episode 1's freebie page, with the PDF. |
| `assets/js/subscribe.js`, `assets/js/pages.js` | Every email form posts to Netlify Forms (form `subscribe`); the episode gates unlock on success. |
| `_build/` | `render-home.mjs` (bakes the static fallback of the home sections), `backfill-w369.mjs` (copies Netlify Forms signups into Workspace369), PDF and screenshot scripts. |
| `_archive/` | Unpicked design directions. Not deployed. |

## How a new episode reaches people

1. Upload to YouTube as usual. Title format: `Title | Broski Talk Ep. N` (the number makes `/episodes/N/`).
2. In the description, list the links under ALL-CAPS headings (for example `TOOLS WE MENTIONED`), one per line as `Name: https://…`. Put `0:00 Intro`-style chapters under `CHAPTERS`. The episode page turns the links into the email-gated list and the chapters into the clickable timeline.
3. Within an hour the watcher finds it, and the pages show it within 5 more minutes.
4. If `NEW_EPISODE_EMAILS=on`, the watcher creates the email campaign to every subscriber in Workspace369. Workspace369 holds it until it's approved in the app, then sends it with the unsubscribe link. If YouTube gives no description yet, the email waits up to 6 hours for it, then goes out anyway.

Sources the watcher reads, in order: the YouTube Data API (when `YOUTUBE_API_KEY` is set), the channel RSS feed (returning 404 since early Nov 2026), then the public channel pages plus oEmbed (titles only). Check `/api/watch-status` to see which one is answering.

## Environment variables (Netlify → Site configuration → Environment variables, scope Functions)

| Name | What |
|---|---|
| `W369_TOKEN` | Personal access token for the Broski Talk workspace in Workspace369. Secret. |
| `W369_WORKSPACE_ID` | That workspace's id. |
| `NEW_EPISODE_EMAILS` | `on` to create the new-episode campaign automatically. Anything else: the watcher only logs. |
| `YOUTUBE_API_KEY` | Optional. A free YouTube Data API v3 key, so new videos arrive with their full descriptions. |

## Run it locally

```
npm install
npx netlify-cli dev               # pages and functions, with local Blobs
npx netlify-cli functions:invoke watch-channel
```

## Links on the site

- YouTube: https://www.youtube.com/@broskitalk (channel `UCplomLxmgUD4iFI3dqj_OGQ`)
- Instagram: https://www.instagram.com/broskitalk/
- TikTok: https://www.tiktok.com/@broskitalkpod

Spotify and Apple Podcasts were removed on 2026-11-10; the show is on YouTube only.

## Still open

- **Workspace369 workspace:** the Broski Talk workspace (owner szymon@workspace369.com, Mark as Admin) and its token. Until the env vars are set, signups are kept in Netlify Forms only. Run `_build/backfill-w369.mjs` once they are.
- **Privacy policy:** the site collects emails; it needs one, linked from the forms' fine print.

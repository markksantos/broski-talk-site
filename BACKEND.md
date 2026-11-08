# Backend brief: email signups and freebies

This brief is for whoever deploys the site, written so a coding agent can follow it.
Simon: open this repo in Claude Code and say **"Read BACKEND.md and build it."**

The front end is finished. Don't redesign the pages; build the server side they already call.

## Goal

1. Every email form on the site saves the subscriber to one Broski Talk email list.
2. Freebie pages (the first one is `free/12-skills/`) give the download only after the email is captured, and also email it.
3. Later, the list is used to send new-episode emails.

## The contract (already wired in `assets/js/subscribe.js`)

`POST /api/subscribe` with `Content-Type: application/json`:

```json
{ "email": "you@company.com", "resource": "12-skills", "source": "/free/12-skills/", "company": "" }
```

- `resource` is `null` on the home page form (plain newsletter signup), or a freebie slug.
- `source` is the page path the form was on.
- `company` is a honeypot input that people never see.

Responses the front end understands:

| Status | Body | When |
|---|---|---|
| 200 | `{"ok": true, "download_url": "https://…/broski-talk-12-agent-skills.pdf", "emailed": true}` | Success. Send `download_url` only for freebies. `emailed` = the delivery email was sent or queued. |
| 400 | `{"ok": false, "error": "invalid_email"}` | The email failed server-side validation. |
| 400 | `{"ok": false, "error": "unknown_resource"}` | The slug isn't in the allowlist. |
| 429 | `{"ok": false, "error": "rate_limited"}` | Too many tries. |
| 5xx | anything | The page shows "Couldn't sign you up just now". |

The page and the API share an origin, so CORS isn't needed. If the API ends up on another origin, change `API` at the top of `subscribe.js` and allow only the site's origin.

## Must do

1. **Validate on the server.**
   - Trim and lowercase the email, check its format, and cap it at 254 characters.
   - If `company` is not empty, it's a bot: return `200 {"ok": true}` and save nothing.
2. **Keep a resource allowlist.** Map slug → file, e.g. `12-skills` → `downloads/broski-talk-12-agent-skills.pdf`. An unknown slug returns `400`.
3. **Upsert the contact in the email provider.** Use one audience for the show and record:
   - a tag per freebie: `resource:12-skills`;
   - the first `source`;
   - the signup time;
   - the consent text shown under the form: "New episodes and the occasional freebie. Unsubscribe anytime." (freebie page: "You'll also get new episodes and the occasional freebie. Unsubscribe anytime.").

   Signing up again updates tags, never duplicates the contact, and still returns the download.
4. **Send the freebie email**, e.g. subject "Your 12 agent skills from Broski Talk". It holds the PDF link plus a link to the episode (https://youtu.be/9jrxLxHoIGg?t=884). Every email needs an unsubscribe link and a physical mailing address (CAN-SPAM); the provider's footer usually covers both. Decide with Mark whose address goes in it.
5. **Rate-limit by IP**, about 5 requests a minute.
6. **Keep secrets out of git. This repo is public.** Provider API keys go in the host's environment variables only. Never commit `.env` files, keys or subscriber exports. Before you push, check `git grep -i -E "api[_-]?key|secret|token"`.
7. **Log errors, not lists.** Never write subscriber emails into logs or the repo.

## Email provider

Pick one with Mark: Kit (ConvertKit), Beehiiv, Loops, MailerLite, or Resend (Audiences + Broadcasts; Mark Studios already uses Resend for its forms). It needs:

- an API to upsert contacts with tags;
- a way to send the freebie email right away (transactional send or an automation on the tag);
- broadcasts for new episodes;
- built-in unsubscribe handling.

## Hosting

The simplest setup is Vercel with this repo as-is:

- Leave the framework preset on "Other" with no build command and the repo root as output.
- Add `api/subscribe.js` (a Node serverless function); it serves `/api/subscribe` with no config.
- `.vercelignore` already keeps `_archive/` and `_build/` out of the deploy.

Netlify (`netlify/functions/` + a redirect) or any server that serves the static files and handles the POST works too.

Vercel's GitHub auto-deploy needs its GitHub app installed on the repo, which only the repo owner (Mark) can do. If that's in the way, deploy with `vercel --prod` from a local clone, or ask Mark to transfer the repo to you.

## How locked down is the PDF?

Today it's a static file in `downloads/`, so anyone with the exact URL can open it. That's normal for a lead magnet.

For a real lock, move the file out of the public folder into private storage (e.g. Vercel Blob or S3) and return a short-lived signed URL as `download_url`. Put the same link in the email.

## Adding the next freebie

1. Copy `free/12-skills/` to `free/<slug>/`. Change the copy, the list, the cover image, and the form's `data-resource="<slug>"` and `data-download="…"`.
2. Add the file, either in `downloads/` or in private storage.
3. Add the slug to the backend allowlist and write its delivery email.
4. Put the page link in the episode's YouTube description and pinned comment.

`_build/freebie_pdf.py` shows how the 12-skills PDF is built from HTML. Copy it for a new PDF.

## Also before launch

- **Privacy policy page:** what's collected, why, which provider, how to unsubscribe or ask for deletion. Link it from the `.fine` line under both forms (`index.html` and `free/12-skills/index.html`).
- **Social preview:** make `og:image` an absolute URL on the real domain in both pages, e.g. `https://<domain>/assets/og/broski-talk-og.jpg`.

### Test checklist

- valid email → 200 and the download;
- bad email → error message;
- honeypot filled → 200 and nothing saved;
- the same email twice → one contact, two tags if two freebies;
- unknown resource → 400;
- the rate limit kicks in;
- the freebie email arrives, with a working unsubscribe link;
- the home page form (resource `null`) → contact saved with no freebie tag;
- no secrets in git.

## Optional: keep "latest episode" current automatically

The channel feed (no API key needed) is https://www.youtube.com/feeds/videos.xml?channel_id=UCplomLxmgUD4iFI3dqj_OGQ.

A build step or a small cached API could read the newest video's id, title and thumbnail and fill the "latest" section in `index.html`. The chapters come from the video description's timestamps. Until then, update it by hand (see README).

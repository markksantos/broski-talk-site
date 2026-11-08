# Broski Talk website

The site for Broski Talk, the AI podcast with Mark Santos and Simon Dziak.
Plain HTML, CSS and JS, with no build step. The design is **A · On Air**, picked by Mark on 2026-11-08.

**Deploying or building the email backend? Read [BACKEND.md](BACKEND.md) first.**

## What's here

| Path | What it is |
|---|---|
| `index.html` | The home page. Its waveform hero plays the show intro. Under it: the latest episode (Ep 1) with a chapter timeline, the 12-skills freebie, the hosts, the 2020–21 run, and the listen and follow links. |
| `free/12-skills/` | The email-gated freebie page: the 12 agent skills from Episode 1. Copy this folder for every future freebie. |
| `downloads/broski-talk-12-agent-skills.pdf` | The freebie file. Rebuild it with `python3 _build/freebie_pdf.py`. |
| `assets/js/subscribe.js` | The front end for every email form. It posts to `/api/subscribe` (the contract is in BACKEND.md). |
| `assets/` | Fonts (OFL), host photos, thumbnails, the intro audio, the social preview image (`og/`) and the PDF cover (`freebies/`). |
| `_archive/` | The four unpicked directions (B, C, D, E), the original A and the picker pages. These are not part of the site, and `.vercelignore` keeps them out of Vercel deploys. |
| `_build/` | Scripts that prepare the assets, build the PDF, take screenshots and smoke-test the pages (`verify.py`). |

## Run it locally

```
python3 -m http.server 8000      # then open http://localhost:8000/
```

On localhost the email forms run in preview mode: they show the success state and save nothing.
Locally, Mark serves the folder at http://127.0.0.1:4949/broski-talk-site/.

## Links on the site

- YouTube: https://www.youtube.com/@broskitalk (channel `UCplomLxmgUD4iFI3dqj_OGQ`)
- Spotify: https://open.spotify.com/show/1G7CNdVKzEkBmwkNYfL1Sz
- Apple Podcasts: https://podcasts.apple.com/us/podcast/broski-talk/id1520824614
- Instagram: https://www.instagram.com/broskitalk/
- TikTok: https://www.tiktok.com/@broskitalk

Spotify and Apple both point at the 2020–21 audio feed. That feed was published from Anchor, which is now Spotify for Creators: https://creators.spotify.com/pod/show/broskitalk. The feed's owner email is `hello@broski.io`. Once someone gets back into that account, new episodes published there show up on Spotify and Apple automatically, so both links stay the same.

## Updating the latest episode

All of these are in `index.html`:

1. Set `data-id` on `#player` to the new YouTube video id.
2. Update the kicker (`EP 01 · 18:25`), the title and the description in the "latest" section.
3. Rewrite the chapter list: the `.seg` buttons (`--w` = chapter length in seconds) and the `#chapters` rows (`data-t` = start in seconds).
4. Set `LEN` in the script to the video length in seconds.
5. Replace the thumbnail at `assets/thumbs/ep01-youtube.webp`. YouTube's copy is at `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`.

BACKEND.md describes an optional way to automate this.

## Still open

- **Spotify for Creators account:** get back into it so new episodes reach the existing Spotify and Apple feed.
- **Email backend:** see BACKEND.md. Until it exists, the forms on the live site show an error, because there is nothing at `/api/subscribe`.
- **Privacy policy:** the site needs one once it collects emails. Link it from the forms' fine print.
- **Episode 1's YouTube description:** it still lists all 12 skill links. If you want the gate to collect emails, replace that block with a link to `/free/12-skills/`.

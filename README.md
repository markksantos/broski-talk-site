# Broski Talk website

Landing page for the Broski Talk relaunch, the AI podcast with Mark Santos and Simon Dziak.
Plain static HTML, CSS and JS: no framework, no build step, no dependencies.

## Run it locally
Open `index.html` through any static server (opening it straight from disk works too, but a server is closer to production):

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it live
Any static host works. Two easy routes:
- **Vercel:** import this repo (Framework preset: Other, no build command, output directory `.`), then add the domain under Settings > Domains.
- **Netlify:** drag the folder into the Netlify dashboard, or connect the repo with no build command and publish directory `.`.

Then point the domain's DNS at the host (Vercel gives you the exact A / CNAME records).

## What's still a placeholder
Every one is marked with a `data-todo` attribute in `index.html`, so `grep -n data-todo index.html` lists them all.
- **YouTube:** every Subscribe button links to `https://www.youtube.com/@broskitalk`, but that handle isn't claimed yet.
- **Spotify / Apple Podcasts:** links are `#` and say "soon" until the podcast feed exists.
- **Email sign-up** (bottom of the page): checks the address and shows a success message, but isn't connected to an email provider yet. Wire it to whatever you pick (ConvertKit, Beehiiv, Mailchimp, Resend...).
- **Episode titles:** working titles taken from the thumbnails (We're Back, AI Does the Work, Automate Everything, The Comeback). No release dates are shown.
- **Simon's line** in the About section just says "Co-host · since 2020"; swap in whatever you want there.
- Worth adding once the domain is set: Open Graph / Twitter card tags (for link previews) and a canonical URL.

## What's in here
| Path | What |
|---|---|
| `index.html` | The site: one page, all CSS and JS inline |
| `assets/hosts/` | Host photos, pre-aligned (see below), plus avatar crops |
| `assets/thumbs/` | Episode + Shorts thumbnails, podcast cover, channel banner |
| `assets/video/` | Vertical logo sting used in the Shorts row |
| `assets/logo/` | Logo PNGs; `favicon.png` is the YouTube profile picture |
| `assets/fonts/` | Anton (logo) and Inter Tight (headlines + body), both SIL Open Font License |
| `_archive/` | Two other directions that weren't picked (On Air, Comeback) and the picker page. Not part of the site; safe to delete. |
| `_build/` | Scripts Mark used to generate `assets/` from the brand kit on his machine |
| `DESIGN.md`, `PRODUCT.md` | Brand and content rules for the page |

## Brand rules worth keeping
- Colours: black / grey `#141414`, white, and one red `#DC3426` used for a single word or box per screen.
- Mark is always on the left, Simon on the right, same size, same eye line. The images in `assets/hosts/` are all placed so the eyes sit at the same spot (y = 560 of a 1200 × 1400 canvas), so any two shown at the same size line up automatically. Don't crop or scale one without the other.
- No glow or halo around the cutouts.

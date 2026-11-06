# Broski Talk landing pages

Three landing-page directions for the Broski Talk relaunch, built from the brand kit in
`~/Pictures/Branding/Broski Talk/`. Static HTML, no build step.

- `index.html` picker · `a-on-air/` · `b-thumbnail/` · `c-comeback/`
- Served locally through the review server: http://127.0.0.1:4949/broski-talk-site/
  (symlink `~/Developer/automation/reviews/broski-talk-site` -> this folder)
- `_build/prep_assets.py` regenerates `assets/` from the kit (eye-aligned hosts, web-sized thumbs, video, audio);
  `_build/halftone.py` makes the newsprint hosts for C; `_build/shoot.py <slug> --full` screenshots a page.

## Placeholders to replace before going live (search `data-todo`)
- YouTube links point at `@broskitalk`, which isn't claimed yet.
- Spotify / Apple Podcasts links are `#` (no RSS feed yet).
- Email forms validate and show a success message but aren't connected to an email provider.
- Episode titles are working titles taken from the kit thumbnails; no release dates are shown.

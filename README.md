# Broski Talk landing pages

The Broski Talk relaunch landing page, built from the brand kit in `~/Pictures/Branding/Broski Talk/`.
Static HTML, no build step.

- `index.html` = the site (direction B · Thumbnail, picked 2026-11-07).
- `d-group-chat/`, `e-workflow/` = two more directions made 2026-11-07 after the pick (D · Group Chat, E · Workflow); `options.html` lists all five.
- `a-on-air/`, `b-thumbnail/`, `c-comeback/` at the root = the original versions, kept so old links work.
- `_archive/` = the two unpicked directions (`a-on-air/`, `c-comeback/`) and the old picker page, still viewable.
- Served locally through the review server: http://127.0.0.1:4949/broski-talk-site/
  (symlink `~/Developer/automation/reviews/broski-talk-site` -> this folder)
- `_build/prep_assets.py` regenerates `assets/` from the kit (eye-aligned hosts, web-sized thumbs, video, audio);
  `_build/halftone.py` makes the newsprint hosts for C; `_build/shoot.py` / `shoot_frames.py` screenshot pages.

## Placeholders to replace before going live (search `data-todo`)
- YouTube links point at `@broskitalk`, which isn't claimed yet.
- Spotify / Apple Podcasts links are `#` (no RSS feed yet).
- Email forms validate and show a success message but aren't connected to an email provider.
- Episode titles are working titles taken from the kit thumbnails; no release dates are shown.
- D's chat lines are scripted copy written for the page (Simon's lines included); have Mark and Simon approve the wording.

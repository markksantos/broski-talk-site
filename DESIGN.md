# Broski Talk — design system (web)

Brand kit is the authority: `~/Pictures/Branding/Broski Talk/BRAND-GUIDE.md`. Three landing directions share it; each page keeps its own tokens in its `<style>`.

## Fixed
- **Logo:** Anton, stacked `BROSKI / TALK.` (period is part of the mark). Live text in Anton or the kit PNG.
- **Colour:** black `#000`, white `#FFF`, one accent red `#DC3426`. Red marks one word, box, dot or line per view; never a second accent. Thumbnail grey `#111–#141414` with soft top light and a halftone dot field.
- **Type:** Anton for the logo and poster numerals; Inter Tight (variable 100–900) for headlines (800 mixed case, 900 caps) and body.
- **Hosts:** Mark left, Simon right, never shoulder to shoulder. Images in `assets/hosts/` are pre-placed by pupils (same pupil distance, eye line at y=560 of 1400), so two hosts at the same CSS size and top share an eye line. No glow or halo around cutouts.
- **Waveform:** vertical rounded bars, grey on black (banner 12), the show's signature texture.

## Directions
**Picked 2026-11-07: B · Thumbnail** (live page = `index.html`). A and C are kept in `_archive/`.

- **A · On Air** — pure black, full-width live waveform canvas, B&W hosts that colour up when the intro plays, red ON AIR tally.
- **B · Thumbnail** — thumbnail grey + top light + halftone dots, faces pinned to the screen edges, Inter Tight 800 headline with one red box that rewrites per scroll step; YouTube-native grammar below.
- **C · Comeback** — white poster, black Anton at page scale, newsprint halftone hosts, 6 px black rules, the 2020→2026 comeback chart as the story.
- **D · Group Chat** — black messaging app: Mark's graphite bubbles left, Simon's white right, the visitor's red; typing dots, a voice note that plays the intro, link previews, a video message; quick-reply chips and a composer that collect the email.
- **E · Workflow** — light dot-grid automation canvas: white nodes with 1.5px black outlines and a hard 4px offset shadow, typed headers, bezier wires with ports; hosts feed the show node, nodes drag by their header, Run sends red packets through the graph to the "You" node.

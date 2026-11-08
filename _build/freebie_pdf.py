"""Build the 12-skills freebie: downloads/broski-talk-12-agent-skills.pdf + a cover preview for the page.
usage: python3 _build/freebie_pdf.py
The list is the one in the Ep 1 YouTube description (Builder's corner). Fonts come from assets/fonts.
"""
import asyncio, html, pathlib
from PIL import Image
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = (ROOT / "assets/fonts").as_uri()
OUT_PDF = ROOT / "downloads/broski-talk-12-agent-skills.pdf"
OUT_COVER = ROOT / "assets/freebies/12-skills-cover.webp"
SRC = ROOT / "_build/freebies/12-skills.html"

SKILLS = [
    ("gstack", "garrytan/gstack", "By Garry Tan: your agent as CEO, tech lead, designer and QA."),
    ("Superpowers", "obra/superpowers", "Plan, test, debug and review like a senior engineer."),
    ("Taste Skill", "Leonxlnx/taste-skill", "Better layouts, type and animation."),
    ("UI/UX Pro Max", "nextlevelbuilder/ui-ux-pro-max-skill", "Palettes, font pairings and clean UI."),
    ("Marketing Skills", "coreyhaines31/marketingskills", "Copy, SEO, pricing and launches."),
    ("Last 30 Days", "mvanhorn/last30days-skill", "Research reports from the last month of Reddit, X and more."),
    ("Frontend Slides", "zarazhangrui/frontend-slides", "Pitch decks you share as a link or PDF."),
    ("No AI Slop", "petergyang/no-ai-slop", "Makes your writing sound human."),
    ("Brag", "latent-spaces/brag", "Launch and demo videos of what you built."),
    ("Claude for Legal", "anthropics/claude-for-legal", "Anthropic's plugins for contracts and NDAs."),
    ("Caveman", "JuliusBrussee/caveman", "Shorter replies, about 65% fewer tokens."),
    ("Awesome Claude Skills", "ComposioHQ/awesome-claude-skills", "A curated list of even more."),
]


def row(i, name, repo, what):
    url = f"https://github.com/{repo}"
    return (f'<li><span class="n">{i:02d}</span><div><h3>{html.escape(name)}</h3>'
            f'<p>{html.escape(what)}</p><a href="{url}">{url.removeprefix("https://")}</a></div></li>')


PAGE = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Broski Talk · 12 Agent Skills</title><style>
@font-face {{ font-family: Anton; src: url("{FONTS}/Anton.ttf"); }}
@font-face {{ font-family: "Inter Tight"; src: url("{FONTS}/InterTight.ttf"); font-weight: 100 900; }}
@page {{ size: Letter; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; background: #000; color: #fff; font-family: "Inter Tight", sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.page {{ width: 8.5in; height: 11in; padding: .62in .7in .55in; position: relative; overflow: hidden; break-after: page; display: flex; flex-direction: column; }}
.page:last-child {{ break-after: auto; }}
.top {{ display: flex; justify-content: space-between; align-items: center; font: 400 22px/1 Anton, sans-serif; letter-spacing: .01em; }}
.top span {{ font: 800 10px/1 "Inter Tight", sans-serif; letter-spacing: .16em; color: rgba(255,255,255,.55); border: 1.5px solid rgba(255,255,255,.3); border-radius: 999px; padding: 6px 11px; }}
h1 {{ margin: .45in 0 0; font: 400 104px/.86 Anton, sans-serif; letter-spacing: .005em; text-transform: uppercase; }}
h1 em {{ font-style: normal; color: #DC3426; }}
.lede {{ margin: 18px 0 0; max-width: 46ch; font-size: 14.5px; line-height: 1.5; color: rgba(255,255,255,.72); }}
ol {{ list-style: none; margin: .34in 0 0; padding: 0; border-top: 1.5px solid rgba(255,255,255,.16); }}
li {{ display: grid; grid-template-columns: .78in 1fr; align-items: baseline; padding: 13px 0 14px; border-bottom: 1.5px solid rgba(255,255,255,.16); }}
.n {{ font: 400 30px/1 Anton, sans-serif; color: rgba(255,255,255,.5); }}
h3 {{ margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -.01em; }}
li p {{ margin: 4px 0 0; font-size: 13px; line-height: 1.45; color: rgba(255,255,255,.72); }}
li a {{ display: inline-block; margin-top: 5px; font-size: 11.5px; font-weight: 600; color: #fff; text-decoration: underline; text-underline-offset: 2px; text-decoration-color: rgba(255,255,255,.35); }}
.p2 ol {{ margin-top: .3in; }}
.end {{ margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: .3in; padding-top: .3in; font-size: 12px; line-height: 1.55; color: rgba(255,255,255,.6); }}
.end b {{ display: block; margin-bottom: 4px; color: #fff; font-size: 12.5px; }}
.end a {{ color: #fff; }}
.foot {{ display: flex; justify-content: space-between; margin-top: .28in; padding-top: 14px; border-top: 1.5px solid rgba(255,255,255,.16); font-size: 10.5px; letter-spacing: .06em; color: rgba(255,255,255,.5); }}
.foot .logo {{ font: 400 16px/1 Anton, sans-serif; color: #fff; letter-spacing: .01em; }}
</style></head><body>
<section class="page">
  <div class="top">BROSKI TALK.<span>FREE · FROM EPISODE 1</span></div>
  <h1><em>12</em> agent<br>skills.</h1>
  <p class="lede">The list from Builder's corner in Broski Talk Ep. 1, <i>The Claude You Can't Use</i>: what each skill does and where to get it. Every link goes to the skill's own GitHub repo.</p>
  <ol>{''.join(row(i + 1, *s) for i, s in enumerate(SKILLS[:5]))}</ol>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>THE AI PODCAST · 1 / 2</span></div>
</section>
<section class="page p2">
  <div class="top">BROSKI TALK.<span>12 AGENT SKILLS</span></div>
  <ol>{''.join(row(i + 6, *s) for i, s in enumerate(SKILLS[5:]))}</ol>
  <div class="end">
    <div><b>Installing them</b>Each repo's README has its own install steps. Start with one or two that match what you build, not all twelve at once.</div>
    <div><b>Watch the segment</b>Builder's corner starts at 14:44 in Episode 1:<br><a href="https://youtu.be/9jrxLxHoIGg?t=884">youtu.be/9jrxLxHoIGg?t=884</a><br>List via Launch Llama: <a href="https://x.com/launch_llama/status/2118100994726773075">x.com/launch_llama</a></div>
  </div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>MARK SANTOS &amp; SIMON DZIAK · YOUTUBE.COM/@BROSKITALK · 2 / 2</span></div>
</section>
</body></html>"""


async def main():
    SRC.parent.mkdir(parents=True, exist_ok=True)
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    OUT_COVER.parent.mkdir(parents=True, exist_ok=True)
    SRC.write_text(PAGE, encoding="utf-8")
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 816, "height": 1056}, device_scale_factor=2)
        await pg.goto(SRC.as_uri(), wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        bad = await pg.evaluate("[...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family + ':' + f.status)")
        if bad:
            raise SystemExit(f"fonts not loaded: {bad}")
        over = await pg.evaluate("[...document.querySelectorAll('.page')].map(p => p.scrollHeight - p.clientHeight)")
        if any(o > 0 for o in over):
            raise SystemExit(f"page content overflows: {over}")
        await pg.pdf(path=str(OUT_PDF), prefer_css_page_size=True, print_background=True)
        shot = ROOT / "_build/shots/12-skills-p1.png"
        shot.parent.mkdir(parents=True, exist_ok=True)
        await pg.screenshot(path=str(shot), clip={"x": 0, "y": 0, "width": 816, "height": 1056})
        await pg.screenshot(path=str(ROOT / "_build/shots/12-skills-p2.png"), clip={"x": 0, "y": 1056, "width": 816, "height": 1056}, full_page=True)
        await b.close()
    Image.open(shot).convert("RGB").resize((816, 1056), Image.Resampling.LANCZOS).save(OUT_COVER, quality=88)
    print("pdf", OUT_PDF.stat().st_size, "cover", OUT_COVER.stat().st_size)


asyncio.run(main())

"""Build the Ep 4 freebie: downloads/broski-talk-ep4-fable-or-opus.pdf + a cover preview.
usage: python3 _build/freebie_ep4.py
Sources: the Ep 4 transcript and YouTube description, and Anthropic's models overview +
Fable 5.2 announcement (read 2026-11-11). Same look and checks as freebie_pdf.py (the Ep 1 PDF).
"""
import asyncio, pathlib
from PIL import Image
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = (ROOT / "assets/fonts").as_uri()
OUT_PDF = ROOT / "downloads/broski-talk-ep4-fable-or-opus.pdf"
OUT_COVER = ROOT / "assets/freebies/ep-4-cover.webp"
SRC = ROOT / "_build/freebies/ep-4.html"
EP = "https://youtu.be/gd1R-aPgmmA"

RULES = [
    "Assume anything that can be generated will be. Build on what can't be.",
    "Information is going to zero, so be the experience.",
    "Do real things in the real world. Proof will be worth more than polish.",
    "Make videos that lose something when an AI summarizes them.",
    "Be the creator people ask their AI for by name.",
    "Keep every raw file. Your archive will have uses nobody has invented yet.",
    "Decide how your face and voice get licensed before someone else does.",
    "Publish in every language from day one.",
    "Stay small. Head count is no longer an advantage.",
    "Own a line to your audience that no platform can switch off.",
    "Pick a subject you can stay curious about for 10 years.",
    "When everyone has the same tools, what you choose to make is the only edge.",
]

rules = "".join(f'<li><span class="n">{i:02d}</span><p>{r}</p></li>' for i, r in enumerate(RULES, 1))

PAGE = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Broski Talk · Fable or Opus?</title><style>
@font-face {{ font-family: Anton; src: url("{FONTS}/Anton.ttf"); }}
@font-face {{ font-family: "Inter Tight"; src: url("{FONTS}/InterTight.ttf"); font-weight: 100 900; }}
@page {{ size: Letter; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; background: #000; color: #fff; font-family: "Inter Tight", sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.page {{ width: 8.5in; height: 11in; padding: .62in .7in .55in; position: relative; overflow: hidden; break-after: page; display: flex; flex-direction: column; }}
.page:last-child {{ break-after: auto; }}
.top {{ display: flex; justify-content: space-between; align-items: center; font: 400 22px/1 Anton, sans-serif; letter-spacing: .01em; }}
.top span {{ font: 800 10px/1 "Inter Tight", sans-serif; letter-spacing: .16em; color: rgba(255,255,255,.55); border: 1.5px solid rgba(255,255,255,.3); border-radius: 999px; padding: 6px 11px; }}
h1 {{ margin: .38in 0 0; font: 400 96px/.86 Anton, sans-serif; letter-spacing: .005em; text-transform: uppercase; }}
h1 em {{ font-style: normal; color: #DC3426; }}
h2 {{ margin: 0; font: 400 30px/1 Anton, sans-serif; text-transform: uppercase; letter-spacing: .01em; }}
.lede {{ margin: 16px 0 0; max-width: 50ch; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,.72); }}
.cols {{ display: grid; grid-template-columns: 1fr 1fr; gap: .28in; margin-top: .3in; }}
.card {{ border-top: 3px solid #fff; padding-top: 12px; }}
.card.red {{ border-color: #DC3426; }}
.card .k {{ font: 800 10px/1 "Inter Tight", sans-serif; letter-spacing: .16em; color: rgba(255,255,255,.55); }}
.card h2 {{ margin-top: 8px; font-size: 38px; }}
.price {{ margin: 6px 0 0; font-size: 12.5px; color: rgba(255,255,255,.72); }}
.card ul {{ margin: 12px 0 0; padding: 0; list-style: none; }}
.card li {{ font-size: 13.5px; line-height: 1.4; padding: 7px 0; border-bottom: 1.5px solid rgba(255,255,255,.16); }}
.quote {{ margin-top: .3in; padding: 16px 0 0; border-top: 1.5px solid rgba(255,255,255,.16); }}
.quote p {{ margin: 0; font: 400 26px/1.08 Anton, sans-serif; text-transform: uppercase; }}
.quote p em {{ font-style: normal; color: #DC3426; }}
.quote small {{ display: block; margin-top: 8px; font-size: 11.5px; color: rgba(255,255,255,.55); }}
.test {{ margin-top: .26in; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .2in; }}
.test div {{ border-top: 1.5px solid rgba(255,255,255,.16); padding-top: 10px; font-size: 11.5px; line-height: 1.45; color: rgba(255,255,255,.65); }}
.test b {{ display: block; font: 400 28px/1 Anton, sans-serif; color: #fff; margin-bottom: 4px; }}
ol {{ list-style: none; margin: .22in 0 0; padding: 0; border-top: 1.5px solid rgba(255,255,255,.16); }}
ol li {{ display: grid; grid-template-columns: .55in 1fr; align-items: baseline; padding: 6px 0 7px; border-bottom: 1.5px solid rgba(255,255,255,.16); }}
ol .n {{ font: 400 22px/1 Anton, sans-serif; color: rgba(255,255,255,.5); }}
ol p {{ margin: 0; font-size: 14px; font-weight: 600; line-height: 1.35; }}
.hack {{ margin-top: .2in; display: grid; grid-template-columns: 1.1fr 1fr; gap: .3in; }}
.hack p {{ margin: 8px 0 0; font-size: 12.5px; line-height: 1.5; color: rgba(255,255,255,.72); }}
.src {{ margin-top: auto; padding-top: .2in; font-size: 10.5px; line-height: 1.55; color: rgba(255,255,255,.5); }}
.src a, .hack a {{ color: #fff; }}
.foot {{ display: flex; justify-content: space-between; margin-top: .2in; padding-top: 14px; border-top: 1.5px solid rgba(255,255,255,.16); font-size: 10.5px; letter-spacing: .06em; color: rgba(255,255,255,.5); }}
.foot .logo {{ font: 400 16px/1 Anton, sans-serif; color: #fff; letter-spacing: .01em; }}
</style></head><body>
<section class="page">
  <div class="top">BROSKI TALK.<span>FREE · FROM EPISODE 4</span></div>
  <h1>Fable<br>or <em>Opus?</em></h1>
  <p class="lede">Which Claude to use for which job, from Broski Talk Ep. 4, <i>Claude Fable 5.2 Is Here</i>. Our take after testing both, next to what Anthropic says.</p>
  <div class="cols">
    <div class="card">
      <span class="k">EVERYDAY WORK</span>
      <h2>Opus 5.5</h2>
      <p class="price">$4 in / $20 out per million tokens</p>
      <ul>
        <li>Email, writing and research</li>
        <li>Basic software development</li>
        <li>Anything you do every day: it's half the price and the gap is small</li>
        <li>Anthropic calls it its "strongest daily driver" and says to start here</li>
      </ul>
    </div>
    <div class="card red">
      <span class="k">THE HARD, LONG JOBS</span>
      <h2>Fable 5.2</h2>
      <p class="price">$8 in / $40 out per million tokens</p>
      <ul>
        <li>Video editing, VFX and game development: where we saw the biggest difference</li>
        <li>Long agent runs and hard reasoning</li>
        <li>When Opus 5.5 on high effort still falls short</li>
        <li>Up to 30% faster than Fable 5.1 (Anthropic's figure)</li>
      </ul>
    </div>
  </div>
  <div class="quote">
    <p>"Fable 5.2 on <em>low</em> is about the same as Opus 5.5 on <em>max</em>."</p>
    <small>Our rule of thumb from the episode, not a benchmark.</small>
  </div>
  <div class="test">
    <div><b>1h 56m</b>Fable 5.2 on Tony's "Cathedral of Ice" test: faster, with more detail.</div>
    <div><b>3h 11m</b>Opus 5.5 on the same test: slower, but it cost much less.</div>
    <div><b>Close call</b>Side by side, the gap is small. Pay for Fable when the details matter.</div>
  </div>
  <div class="src">Prices: Anthropic's models overview, read Nov 11, 2026 (platform.claude.com/docs/en/models/overview). Both models have a 1M-token context window. Test: <a href="https://x.com/EnvolDev/status/2119907318729245180">x.com/EnvolDev</a>. Watch the side-by-side at 10:14: <a href="{EP}?t=614">youtu.be/gd1R-aPgmmA?t=614</a></div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>AI, TECH AND BUSINESS · 1 / 2</span></div>
</section>
<section class="page">
  <div class="top">BROSKI TALK.<span>FABLE 5.2'S ADVICE</span></div>
  <h2 style="margin-top:.26in;font-size:54px;line-height:.9">12 rules for<br>YouTubers, <span style="color:#DC3426">10 years out.</span></h2>
  <p class="lede">Someone asked Fable 5.2 for advice for YouTubers for the next 10 years, with no explanations. This is what it said. We read it on the show at 8:17.</p>
  <ol>{rules}</ol>
  <div class="hack">
    <div>
      <h2 style="font-size:24px">The #1 life hack</h2>
      <p>Asked for the world's greatest unconventional life hack, Fable 5.2 said: <b style="color:#fff">ask directly for what you want, far more often than feels comfortable.</b> A no costs a few seconds. A yes can be a raise, a discount, a mentor or a job that was never posted.</p>
    </div>
    <div>
      <p style="margin-top:30px">It cited research by Vanessa Bohns and Francis Flynn: people underestimate how often others say yes to a direct request. And Steve Jobs, who cold-called Bill Hewlett at 12 for spare parts and got a summer job too. Watch it at 12:39: <a href="{EP}?t=759">youtu.be/gd1R-aPgmmA?t=759</a></p>
    </div>
  </div>
  <div class="src">The 12 rules: posted by <a href="https://x.com/yarslav/status/2119900604999016949">@yarslav on X</a>. The life hack: posted by <a href="https://x.com/PromptLLM/status/2119909505618280749">@PromptLLM on X</a>. Both are Fable 5.2's answers, lightly shortened.</div>
  <div class="foot"><span class="logo">BROSKI TALK.</span><span>MARK SANTOS &amp; SIMON DZIAK · YOUTUBE.COM/@BROSKITALK · 2 / 2</span></div>
</section>
</body></html>"""


async def main():
    for p in (SRC, OUT_PDF, OUT_COVER):
        p.parent.mkdir(parents=True, exist_ok=True)
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
        shots = ROOT / "_build/shots"
        shots.mkdir(parents=True, exist_ok=True)
        await pg.screenshot(path=str(shots / "ep-4-p1.png"), clip={"x": 0, "y": 0, "width": 816, "height": 1056})
        await pg.screenshot(path=str(shots / "ep-4-p2.png"), clip={"x": 0, "y": 1056, "width": 816, "height": 1056}, full_page=True)
        await b.close()
    Image.open(shots / "ep-4-p1.png").convert("RGB").resize((816, 1056), Image.Resampling.LANCZOS).save(OUT_COVER, quality=88)
    print("pdf", OUT_PDF.stat().st_size, "cover", OUT_COVER.stat().st_size)


asyncio.run(main())

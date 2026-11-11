"""Shared look and build step for the per-episode freebie PDFs (_build/freebie_ep*.py).
Same world as the Ep 1 PDF: black, Anton, one red mark. build() fails on missing fonts or overflow."""
import asyncio, pathlib
from PIL import Image
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = (ROOT / "assets/fonts").as_uri()

CSS = """@font-face { font-family: Anton; src: url("@@FONTS@@/Anton.ttf"); }
@font-face { font-family: "Inter Tight"; src: url("@@FONTS@@/InterTight.ttf"); font-weight: 100 900; }
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; background: #000; color: #fff; font-family: "Inter Tight", sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 8.5in; height: 11in; padding: .62in .7in .55in; position: relative; overflow: hidden; break-after: page; display: flex; flex-direction: column; }
.page:last-child { break-after: auto; }
.top { display: flex; justify-content: space-between; align-items: center; font: 400 22px/1 Anton, sans-serif; letter-spacing: .01em; }
.top span { font: 800 10px/1 "Inter Tight", sans-serif; letter-spacing: .16em; color: rgba(255,255,255,.55); border: 1.5px solid rgba(255,255,255,.3); border-radius: 999px; padding: 6px 11px; }
h1 { margin: .38in 0 0; font: 400 96px/.86 Anton, sans-serif; letter-spacing: .005em; text-transform: uppercase; }
h1 em { font-style: normal; color: #DC3426; }
h2 { margin: 0; font: 400 30px/1 Anton, sans-serif; text-transform: uppercase; letter-spacing: .01em; }
.lede { margin: 16px 0 0; max-width: 50ch; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,.72); }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: .28in; margin-top: .3in; }
.card { border-top: 3px solid #fff; padding-top: 12px; }
.card.red { border-color: #DC3426; }
.card .k { font: 800 10px/1 "Inter Tight", sans-serif; letter-spacing: .16em; color: rgba(255,255,255,.55); }
.card h2 { margin-top: 8px; font-size: 38px; }
.price { margin: 6px 0 0; font-size: 12.5px; color: rgba(255,255,255,.72); }
.card ul { margin: 12px 0 0; padding: 0; list-style: none; }
.card li { font-size: 13.5px; line-height: 1.4; padding: 7px 0; border-bottom: 1.5px solid rgba(255,255,255,.16); }
.quote { margin-top: .3in; padding: 16px 0 0; border-top: 1.5px solid rgba(255,255,255,.16); }
.quote p { margin: 0; font: 400 26px/1.08 Anton, sans-serif; text-transform: uppercase; }
.quote p em { font-style: normal; color: #DC3426; }
.quote small { display: block; margin-top: 8px; font-size: 11.5px; color: rgba(255,255,255,.55); }
.test { margin-top: .26in; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .2in; }
.test div { border-top: 1.5px solid rgba(255,255,255,.16); padding-top: 10px; font-size: 11.5px; line-height: 1.45; color: rgba(255,255,255,.65); }
.test b { display: block; font: 400 28px/1 Anton, sans-serif; color: #fff; margin-bottom: 4px; }
ol { list-style: none; margin: .22in 0 0; padding: 0; border-top: 1.5px solid rgba(255,255,255,.16); }
ol li { display: grid; grid-template-columns: .55in 1fr; align-items: baseline; padding: 6px 0 7px; border-bottom: 1.5px solid rgba(255,255,255,.16); }
ol .n { font: 400 22px/1 Anton, sans-serif; color: rgba(255,255,255,.5); }
ol p { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.35; }
.hack { margin-top: .2in; display: grid; grid-template-columns: 1.1fr 1fr; gap: .3in; }
.hack p { margin: 8px 0 0; font-size: 12.5px; line-height: 1.5; color: rgba(255,255,255,.72); }
.src { margin-top: auto; padding-top: .2in; font-size: 10.5px; line-height: 1.55; color: rgba(255,255,255,.5); }
.src a, .hack a { color: #fff; }
.foot { display: flex; justify-content: space-between; margin-top: .2in; padding-top: 14px; border-top: 1.5px solid rgba(255,255,255,.16); font-size: 10.5px; letter-spacing: .06em; color: rgba(255,255,255,.5); }
.foot .logo { font: 400 16px/1 Anton, sans-serif; color: #fff; letter-spacing: .01em; }
""".replace("@@FONTS@@", FONTS)


def build(slug, pdf_name, title, body):
    SRC = ROOT / f"_build/freebies/{slug}.html"
    OUT_PDF = ROOT / f"downloads/{pdf_name}"
    OUT_COVER = ROOT / f"assets/freebies/{slug}-cover.webp"
    PAGE = f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{title}</title><style>{CSS}</style></head><body>{body}</body></html>'
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
            await pg.screenshot(path=str(shots / f"{slug}-p1.png"), clip={"x": 0, "y": 0, "width": 816, "height": 1056})
            await pg.screenshot(path=str(shots / f"{slug}-p2.png"), clip={"x": 0, "y": 1056, "width": 816, "height": 1056}, full_page=True)
            await b.close()
        Image.open(shots / f"{slug}-p1.png").convert("RGB").resize((816, 1056), Image.Resampling.LANCZOS).save(OUT_COVER, quality=88)
        print("pdf", OUT_PDF.stat().st_size, "cover", OUT_COVER.stat().st_size)


    asyncio.run(main())

"""Screenshot a page at desktop + mobile. usage: shoot.py <slug> [scrollY ...]"""
import sys, asyncio
from playwright.async_api import async_playwright
BASE = "http://127.0.0.1:4949/broski-talk-site/"
slug = sys.argv[1]
full = "--full" in sys.argv
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, vp, scale in (("desk", {"width": 1440, "height": 900}, 1), ("mob", {"width": 390, "height": 844}, 2)):
            pg = await b.new_page(viewport=vp, device_scale_factor=scale)
            errs = []
            pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(BASE + slug + "/", wait_until="networkidle")
            await pg.wait_for_timeout(900)
            await pg.screenshot(path=f"_build/shots/{slug}-{name}-hero.png")
            if full:
                # trigger reveals by scrolling through
                h = await pg.evaluate("document.body.scrollHeight")
                for y in range(0, h, 400):
                    await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(60)
                await pg.wait_for_timeout(1200)
                await pg.screenshot(path=f"_build/shots/{slug}-{name}-full.png", full_page=True)
            ow = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
            print(name, "overflow-x:", ow, "errors:", errs[:5])
        await b.close()
asyncio.run(main())

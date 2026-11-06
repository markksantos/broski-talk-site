"""Viewport screenshots at given scroll positions (in viewport heights). usage: shoot_frames.py <slug> <desk|mob> y1 y2 ..."""
import sys, asyncio
from playwright.async_api import async_playwright
slug, dev, ys = sys.argv[1], sys.argv[2], [float(v) for v in sys.argv[3:]]
vp, sc = ({"width": 1440, "height": 900}, 1) if dev == "desk" else ({"width": 390, "height": 844}, 2)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport=vp, device_scale_factor=sc)
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://127.0.0.1:4949/broski-talk-site/{slug}/", wait_until="networkidle")
        for y in ys:
            await pg.evaluate(f"window.scrollTo(0, innerHeight*{y})")
            await pg.wait_for_timeout(2200)
            await pg.screenshot(path=f"_build/shots/{slug}-{dev}-y{y}.png")
        print("errors:", errs)
        await b.close()
asyncio.run(main())

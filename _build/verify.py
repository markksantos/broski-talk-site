"""Screenshot + smoke-test the home page and the 12-skills page at desktop and mobile."""
import asyncio
from playwright.async_api import async_playwright
BASE = "http://127.0.0.1:4949/broski-talk-site/"
OUT = "_build/shots/"
async def scrollthrough(pg):
    h = await pg.evaluate("document.body.scrollHeight")
    for y in range(0, h, 350):
        await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(50)
    await pg.wait_for_timeout(1100)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, vp, scale in (("desk", {"width": 1440, "height": 900}, 1), ("mob", {"width": 390, "height": 844}, 2)):
            for slug, path in (("home", ""), ("free", "free/12-skills/")):
                pg = await b.new_page(viewport=vp, device_scale_factor=scale)
                errs = []
                pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(BASE + path, wait_until="networkidle")
                await pg.wait_for_timeout(800)
                await pg.screenshot(path=f"{OUT}{slug}-{name}-hero.png")
                await scrollthrough(pg)
                await pg.screenshot(path=f"{OUT}{slug}-{name}-full.png", full_page=True)
                ow = await pg.evaluate("document.documentElement.scrollWidth - innerWidth")
                if slug == "free":
                    await pg.evaluate("window.scrollTo(0,0)")
                    await pg.fill("#email", "bad@")
                    await pg.click("#gate-form button[type=submit]")
                    bad = await pg.text_content("#msg")
                    await pg.fill("#email", "test@example.com")
                    await pg.click("#gate-form button[type=submit]")
                    await pg.wait_for_selector("#unlocked:not([hidden])", timeout=5000)
                    await pg.wait_for_timeout(1400)
                    href = await pg.get_attribute("#dl", "href")
                    note = await pg.text_content("#unlocked-msg")
                    await pg.screenshot(path=f"{OUT}free-{name}-unlocked.png")
                    print(name, slug, "bad:", bad, "| href:", href, "| note:", note)
                    r = await pg.request.get(BASE + "downloads/broski-talk-12-agent-skills.pdf")
                    print("  pdf status", r.status, r.headers.get("content-type"))
                else:
                    await pg.evaluate("document.getElementById('episodes').scrollIntoView()")
                    await pg.wait_for_timeout(600)
                    await pg.screenshot(path=f"{OUT}home-{name}-episode.png")
                    await pg.click("#chapters li:nth-child(7) button")
                    await pg.wait_for_timeout(5000)
                    has_iframe = await pg.evaluate("!!document.querySelector('#player iframe')")
                    src = await pg.evaluate("(document.querySelector('#player iframe')||{}).src || ''")
                    head = await pg.evaluate("getComputedStyle(document.getElementById('strip')).getPropertyValue('--p')")
                    on = await pg.evaluate("[...document.querySelectorAll('#chapters li')].findIndex(l=>l.classList.contains('on'))")
                    await pg.screenshot(path=f"{OUT}home-{name}-playing.png")
                    print(name, slug, "iframe:", has_iframe, src[:90], "| --p:", head, "| on chapter idx:", on)
                    await pg.fill("#email-a", "test@example.com")
                    await pg.click("#notify button[type=submit]")
                    await pg.wait_for_timeout(800)
                    print("  home form msg:", await pg.text_content("#msg-a"))
                print(name, slug, "overflow-x:", ow, "errors:", errs[:6])
                await pg.close()
        await b.close()
asyncio.run(main())

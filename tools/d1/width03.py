"""Check horizontal overflow on mobile (normal + reduced) and list my elements wider than the viewport."""
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from browserlock import BrowserLock
async def main():
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        for red in (False, True):
            kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
            if red: kw["reduced_motion"] = "reduce"
            page = await (await b.new_context(**kw)).new_page()
            await page.goto("http://127.0.0.1:8109/", wait_until="load"); await page.wait_for_timeout(4000)
            r = await page.evaluate("""(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth,
              wide: [...document.querySelectorAll('.d3 *')].filter(e => e.getBoundingClientRect().right > 391 && !e.closest('.d3__sheet.is-drawn')).slice(0, 8).map(e => (e.className.baseVal ?? e.className) + ':' + Math.round(e.getBoundingClientRect().right)) }))()""")
            print("reduced" if red else "normal", json.dumps(r))
        await b.close()
with BrowserLock():
    asyncio.run(main())

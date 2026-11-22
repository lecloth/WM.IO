"""Scroll map of the whole page: every [data-sheet] element's top and height. python tools/map.py [--mobile]"""
import asyncio, json, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(mobile):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        page = await (await b.new_context(**kw)).new_page()
        await page.goto("http://127.0.0.1:8109/", wait_until="load"); await page.wait_for_timeout(2500)
        r = await page.evaluate("() => ({ vh: innerHeight, sh: document.documentElement.scrollHeight, els: [...document.querySelectorAll('section[data-sheet], #act-1')].map(e => [e.id, e.dataset.title || '', Math.round(e.getBoundingClientRect().top + scrollY), e.offsetHeight]) })")
        await b.close()
    print(json.dumps(r))
with BrowserLock():
    asyncio.run(main("--mobile" in sys.argv))

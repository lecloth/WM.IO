"""Probe chapter stages at scroll positions: python tools/probe.py 13500,15100"""
import asyncio, json, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(ys):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        page = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        await page.goto("http://127.0.0.1:8108/", wait_until="load"); await page.wait_for_timeout(3500)
        for y in ys:
            await page.mouse.move(700, 400)
            await page.evaluate(f"window.scrollTo(0,{y})"); await page.wait_for_timeout(1500)
            r = await page.evaluate("""() => ({ sy: scrollY, st: [...document.querySelectorAll('.chapter')].slice(0,3).map(s => { const g = s.querySelector('.chapter__stage'); const r = g.getBoundingClientRect(); const t = s.getBoundingClientRect();
                return [s.id, g.className.replace('chapter__stage','').trim(), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(t.top)]; }) })""")
            print(json.dumps(r))
        await b.close()
with BrowserLock():
    asyncio.run(main([int(v) for v in sys.argv[1].split(',')]))

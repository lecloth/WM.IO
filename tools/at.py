"""Print scroll positions for chapter progress values: python tools/at.py sheet-09 0.3,1.5,3  (p in viewport heights)"""
import asyncio, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(eid, ps, mobile):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        page = await (await b.new_context(**kw)).new_page()
        await page.goto("http://127.0.0.1:8109/", wait_until="load"); await page.wait_for_timeout(2500)
        top, vh = await page.evaluate(f"() => [document.getElementById('{eid}').getBoundingClientRect().top + scrollY, innerHeight]")
        await b.close()
    print(",".join(str(int(top - vh + p * vh)) for p in ps))
with BrowserLock():
    asyncio.run(main(sys.argv[1], [float(v) for v in sys.argv[2].split(",")], "--mobile" in sys.argv))

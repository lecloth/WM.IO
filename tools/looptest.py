"""Scroll to the very end and check the loop: back at the top, the opening replays, the product rotates."""
import asyncio, json, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(mobile):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        page = await (await b.new_context(**kw)).new_page()
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await page.goto("http://127.0.0.1:8108/", wait_until="load"); await page.wait_for_timeout(3500)
        before = await page.evaluate("() => localStorage.getItem('wm:product')")
        await page.evaluate("() => window.scrollTo(0, document.documentElement.scrollHeight)")
        out = []
        for t in (300, 900, 1500, 2200, 3200):
            await page.wait_for_timeout(t - (out[-1][0] if out else 0))
            st = await page.evaluate("() => ({ y: Math.round(scrollY), phase: document.documentElement.dataset.phase, product: localStorage.getItem('wm:product') })")
            await page.screenshot(path=f"tools/shots/loop_{'m' if mobile else 'd'}_{t}.jpg", type="jpeg", quality=70)
            out.append((t, st))
        await b.close()
    print(json.dumps({"before": before, "after": out, "errors": errs}))
with BrowserLock():
    asyncio.run(main("--mobile" in sys.argv))

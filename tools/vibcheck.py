"""Count navigator.vibrate calls on page 1: after a tap on the point, after a key press, and with reduced motion.
  python -I tools/vibcheck.py   (expect: tap = 1 tap buzz + 6 snaps + 6 drum clicks of 18 ms (round 4); key = none; reduced = none)"""
import asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def run(mode):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        ctx = await b.new_context(viewport={"width": 384, "height": 734}, is_mobile=True, has_touch=True, reduced_motion="reduce" if mode == "reduced" else "no-preference")
        await ctx.add_init_script("window.__vib=[]; navigator.vibrate = (ms) => { window.__vib.push(ms); return true; };")
        page = await ctx.new_page()
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        if mode in ("tap", "reduced"): await page.tap("#enter")   # reduced: a real tap on the still gate must stay silent
        else: await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await page.wait_for_timeout(800)
        if mode != "reduced":
            for k in range(0, 101):
                await page.evaluate(f"(() => {{ const e = window.__t2.engine; e.lenis.scrollTo(window.__p1.yAt({k * 0.05}), {{ immediate: true, force: true }}); e.ScrollTrigger.update(); }})()", isolated_context=False)
                await page.wait_for_timeout(120)
            await page.wait_for_timeout(800)
        print(mode, "vibrate calls:", await page.evaluate("window.__vib", isolated_context=False))
        await b.close()
with BrowserLock():
    for m in ["tap", "key", "reduced"]: asyncio.run(run(m))

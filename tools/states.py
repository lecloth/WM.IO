"""Visit states + the loop: first visit (?first) timing, return visit timing, key-press skip, and two loops back to the
singularity with the product rotation (hero phone + tag text).  python -I tools/states.py [--mobile]"""
import asyncio, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

TAG = "() => ({ tag: document.querySelector('#s01-final .read__tag').textContent.trim(), aria: document.querySelector('.phone-canvas').getAttribute('aria-label').slice(0, 60), stored: localStorage.getItem('wm:product') })"


async def until_ready(page, t0, limit=20):
    while time.perf_counter() - t0 < limit:
        if await page.evaluate("document.documentElement.dataset.phase") == "ready": return round(time.perf_counter() - t0, 2)
        await page.wait_for_timeout(50)
    return None


async def main(mobile):
    from patchright.async_api import async_playwright
    out = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        ctx = await b.new_context(**kw)
        page = await ctx.new_page()
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200]))
        # first visit
        t0 = time.perf_counter(); await page.goto("http://127.0.0.1:8108/?first", wait_until="commit")
        out["first_visit_s"] = await until_ready(page, t0)
        out["first_visit_flag"] = await page.evaluate("document.documentElement.dataset.visit")
        # return visit
        t0 = time.perf_counter(); await page.goto("http://127.0.0.1:8108/", wait_until="commit")
        out["return_visit_s"] = await until_ready(page, t0)
        out["return_visit_flag"] = await page.evaluate("document.documentElement.dataset.visit")
        # first visit again, skipped with a key press after 400 ms
        t0 = time.perf_counter(); await page.goto("http://127.0.0.1:8108/?first", wait_until="commit")
        await page.wait_for_timeout(400); await page.keyboard.press("Space")
        out["skip_s"] = await until_ready(page, t0)
        await page.wait_for_timeout(1500)
        await page.screenshot(path=f"tools/shots/sweep/state_skip_{'m' if mobile else 'd'}.jpg", type="jpeg", quality=70)
        out["after_skip"] = await page.evaluate("() => ({ y: scrollY, tb: document.querySelector('.tb__title').textContent, lockedBody: document.body.style.overflow })")
        # loops: the tag before, then after each loop
        await page.evaluate("() => localStorage.removeItem('wm:product')")
        await page.goto("http://127.0.0.1:8108/", wait_until="load"); await until_ready(page, time.perf_counter())
        await page.wait_for_timeout(500)
        out["loop0"] = await page.evaluate(TAG)
        for k in (1, 2):
            sh = await page.evaluate("document.documentElement.scrollHeight")
            await page.evaluate(f"() => (window.__engine.lenis.scrollTo({sh}, {{immediate: true, force: true}}), scrollTo(0, {sh}))", isolated_context=False)
            t0 = time.perf_counter(); seen_top = None
            while time.perf_counter() - t0 < 10:
                st = await page.evaluate("() => ({ y: Math.round(scrollY), ph: document.documentElement.dataset.phase })")
                if st["y"] < 50 and seen_top is None: seen_top = round(time.perf_counter() - t0, 2)
                if seen_top is not None and st["ph"] == "ready": break
                await page.wait_for_timeout(100)
            await page.wait_for_timeout(800)
            r = await page.evaluate(TAG)
            r["back_at_top_s"] = seen_top
            r["tb"] = await page.evaluate("() => document.querySelector('.tb__sheet').textContent + ' ' + document.querySelector('.tb__title').textContent")
            r["segs"] = await page.evaluate("() => [...document.querySelectorAll('.strip__seg')].map(s => s.style.getPropertyValue('--p') || '0').join(',')")
            out[f"loop{k}"] = r
            await page.screenshot(path=f"tools/shots/sweep/state_loop{k}_{'m' if mobile else 'd'}.jpg", type="jpeg", quality=70)
            # check the phone tag on the way down: scroll to the final reading moment of act 1
            y = await page.evaluate("() => Math.round(innerHeight * 13.6)")
            await page.evaluate(f"() => (window.__engine.lenis.scrollTo({y}, {{immediate: true, force: true}}), scrollTo(0, {y}))", isolated_context=False)
            await page.wait_for_timeout(1500)
            await page.screenshot(path=f"tools/shots/sweep/state_phone{k}_{'m' if mobile else 'd'}.jpg", type="jpeg", quality=70)
        out["errors"] = errs
        await b.close()
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main("--mobile" in sys.argv))

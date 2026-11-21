"""(D1 copy for sheet 03: scrolls from the 03 entry to the end of 03c) Frame-rate check: after the opening, scroll through act 1 with real wheel input (desktop) or touch-like
scroll steps (mobile) and record every animation frame.
  python tools/fps.py [--mobile]
Prints average fps, the 95th-percentile frame time and the share of frames slower than 25 ms."""
import argparse, sys
from pathlib import Path as _P
sys.path.insert(0, str(_P(__file__).resolve().parents[1]))
from browserlock import BrowserLock
import asyncio, json, time


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--mobile", action="store_true"); ap.add_argument("--url", default="http://127.0.0.1:8108/")
    a = ap.parse_args()
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": 1440, "height": 900})
        ctx = await b.new_context(device_scale_factor=1, **kw)
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await page.goto(a.url, wait_until="load"); await page.wait_for_timeout(3500)
        await page.evaluate("() => { window.__fpsT = []; window.__fpsRun = true; const f = (t) => { window.__fpsT.push(t); if (window.__fpsRun) requestAnimationFrame(f); }; requestAnimationFrame(f); }")
        start = await page.evaluate("() => document.getElementById('sheet-03').getBoundingClientRect().top + scrollY - innerHeight", isolated_context=False)
        end = await page.evaluate("() => { const s = document.getElementById('sheet-03-care'); return s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight; }", isolated_context=False)
        await page.evaluate(f"(window.__engine?.lenis ? window.__engine.lenis.scrollTo({start},{{immediate:true}}) : 0, window.scrollTo(0,{start}))", isolated_context=False)
        await page.wait_for_timeout(1200)
        await page.evaluate("() => { window.__fpsT = []; }")
        await page.mouse.move(700 if not a.mobile else 200, 450)
        t0 = time.perf_counter()
        if a.mobile:
            y = start
            while y < end:            # mobile: native scrolling (Lenis leaves touch to the browser)
                y += 60; await page.evaluate(f"() => window.scrollTo(0, {y})"); await page.wait_for_timeout(16)
        else:
            while (await page.evaluate("() => scrollY")) < end - 50 and time.perf_counter() - t0 < 60:
                await page.mouse.wheel(0, 240); await page.wait_for_timeout(40)
        await page.wait_for_timeout(1500)
        res = await page.evaluate("""() => { window.__fpsRun = false; const t = window.__fpsT;
            const d = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b);
            const avg = d.reduce((a, b) => a + b, 0) / d.length;
            return { frames: d.length, fps: +(1000 / avg).toFixed(1), p95ms: +d[Math.floor(d.length * .95)].toFixed(1),
                     slowPct: +(100 * d.filter((x) => x > 25).length / d.length).toFixed(1), reachedY: scrollY }; }""")
        await b.close()
    print(json.dumps({"mobile": a.mobile, "scrollEnd": end, **res, "errors": errs}))


with BrowserLock():
    asyncio.run(main())

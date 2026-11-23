"""Where do slow frames happen? Scroll page 1 between two positions (in screens of scroll) in emulation (headless Chrome,
real GPU) and print every frame over 20 ms with the scroll position it happened at. Three passes.
  python -I tools/slowwhere.py [--size 384x734@2.8125] [--a 3.9 --b 5.3]"""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
WHERE = """async ([a, b, secs]) => { const e = window.__t2.engine; const slow = []; let last = performance.now(); const t0 = last; let n = 0;
  await new Promise(res => { function f(now) { const dt = now - last; last = now; n++; if (dt > 20 && n > 2) slow.push([+dt.toFixed(1), +window.__p1.P().toFixed(3)]);
    const k = (now - t0) / (secs * 1000); const y = a + (b - a) * Math.min(1, k); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); }); return slow; }"""
async def main(a):
    from patchright.async_api import async_playwright
    wh, dpr = a.size.split("@"); w, h = map(int, wh.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"])
        o = dict(viewport={"width": w, "height": h}, device_scale_factor=float(dpr))
        if w < 1024: o.update(is_mobile=True, has_touch=True)
        page = await (await b.new_context(**o)).new_page()
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.keyboard.press("Enter"); await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        if a.css: await page.add_style_tag(content=a.css)
        if a.js: await page.evaluate(a.js, isolated_context=False)
        await page.wait_for_timeout(2500)
        for i in range(3):
            y0 = await page.evaluate(f"window.__p1.yAt({a.a})", isolated_context=False); y1 = await page.evaluate(f"window.__p1.yAt({a.b})", isolated_context=False)
            await page.evaluate(f"(() => {{ const e = window.__t2.engine; e.lenis ? e.lenis.scrollTo({y0}, {{ immediate: true, force: true }}) : scrollTo(0, {y0}); }})()", isolated_context=False)
            await page.wait_for_timeout(800)
            print(f"pass {i + 1}: slow frames [ms, p]:", await page.evaluate(WHERE, [y0, y1, 3], isolated_context=False), flush=True)
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734@2.8125"); ap.add_argument("--a", type=float, default=3.9); ap.add_argument("--b", type=float, default=5.3); ap.add_argument("--css", default=""); ap.add_argument("--js", default="")
with BrowserLock(): asyncio.run(main(ap.parse_args()))

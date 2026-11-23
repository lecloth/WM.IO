"""Page 1 screenshots at every named stop (window.__p1.stops), plus the in-between moments: mid-morph (scrubbed),
mid-drum (caught 150 ms into a dial turn) and mid-callout. Prints console errors.
  python -I tools/p1stops.py --size 384x734 --dpr 2.8125 --mobile --out tools/shots/r3/stops [--dark]"""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
GOTO = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    w, h = map(int, a.size.split("x")); tag = f"{a.size}{'_dark' if a.dark else ''}"
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=a.dpr)
        if a.mobile: opts.update(is_mobile=True, has_touch=True)
        ctx = await b.new_context(**opts)
        if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(f"{m.type}: {m.text[:200]}")); page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        ev = lambda js, arg=None: page.evaluate(js, arg, isolated_context=False)
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.wait_for_timeout(700); await page.screenshot(path=str(out / f"{tag}_00_gate.png"))
        await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await page.wait_for_timeout(900)
        stops = await ev("window.__p1.stops"); R = await ev("window.__p1.R")
        shots = sorted([(p, k, 1100) for k, p in stops.items()] + [(0.5, "mid-morph", 400), (0.7, "late-morph", 400), (4.82, "callout-late", 400)])
        for i, (p, k, wait) in enumerate(shots, 1):
            await ev(GOTO, p); await page.wait_for_timeout(wait)
            await page.screenshot(path=str(out / f"{tag}_{i:02d}_{k}_{int(p * 1000):04d}.png"))
            if k == "DRUM":   # the dial mid-turn: step to the next verb and catch it 150 ms in
                step = (R["verbs"][1] - R["verbs"][0]) / 7
                await ev(GOTO, p + step); await page.wait_for_timeout(150)
                await page.screenshot(path=str(out / f"{tag}_{i:02d}b_mid-drum_{int((p + step) * 1000):04d}.png"))
        print("console errors/warnings:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734"); ap.add_argument("--dpr", type=float, default=2.8125)
ap.add_argument("--mobile", action="store_true"); ap.add_argument("--dark", action="store_true"); ap.add_argument("--out", default="tools/shots/r3/stops")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

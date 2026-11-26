"""Where a slow frame comes from: real Chrome, a slow steady scroll between two positions, the long animation frames
(LoAF: script, style/layout and render time, with the scripts' sources).
  python -I tools/loafprobe.py 1440 900 1 4.9 5.7 [extra css]"""
import asyncio, sys, json, tempfile, shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
w, h, dpr, A, B = int(sys.argv[1]), int(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
async def main():
    from patchright.async_api import async_playwright
    prof = tempfile.mkdtemp(prefix="loaf-prof-")
    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(prof, channel="chrome", headless=False, no_viewport=True, args=["--start-maximized", "--no-first-run", "--no-default-browser-check"])
        try:
            pg = ctx.pages[0] if ctx.pages else await ctx.new_page()
            cdp = await ctx.new_cdp_session(pg)
            await cdp.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": dpr, "mobile": w < 1024})
            if len(sys.argv) > 6: await ctx.add_init_script("document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = " + json.dumps(sys.argv[6]) + "; document.head.append(s); })")
            await pg.goto("http://127.0.0.1:8109/?first", wait_until="load")
            await pg.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=30000)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250); await pg.keyboard.press("Enter")
            await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=30000)
            await pg.wait_for_timeout(1500)
            await pg.evaluate("window.__p1.diveApi.loadPhones()", isolated_context=False); await pg.wait_for_timeout(1500)
            r = await pg.evaluate("""async ([a, b]) => { const p1 = window.__p1, e = window.__t2.engine; const L = [];
              new PerformanceObserver((l) => l.getEntries().forEach((x) => { if (x.duration > 40) L.push({ d: Math.round(x.duration), P: +p1.P().toFixed(3), block: Math.round(x.blockingDuration),
                render: Math.round(x.renderStart ? x.startTime + x.duration - x.renderStart : 0), style: Math.round(x.styleAndLayoutStart ? x.startTime + x.duration - x.styleAndLayoutStart : 0),
                scripts: x.scripts.map((s) => ({ d: Math.round(s.duration), inv: s.invoker, src: (s.sourceURL || '').split('/').pop() + ':' + s.sourceFunctionName + '@' + s.sourceCharPosition, fl: Math.round(s.forcedStyleAndLayoutDuration) })) }); })).observe({ type: 'long-animation-frame', buffered: false });
              e.lenis.scrollTo(p1.yAt(a), { immediate: true, force: true }); await new Promise(r => setTimeout(r, 1500));
              await new Promise((res) => e.lenis.scrollTo(p1.yAt(b), { duration: (b - a) / 0.66, easing: (t) => t, force: true, onComplete: res }));
              await new Promise(r => setTimeout(r, 500)); return L; }""", [A, B], isolated_context=False)
            print(json.dumps(r, indent=1))
        finally:
            await ctx.close(); shutil.rmtree(prof, ignore_errors=True)
with BrowserLock(): asyncio.run(main())

"""Open the site at a size, enter, optionally go to a page-1 position, and print the value of a JS expression (dev aid).
  python -I tools/evalp.py --size 384x734@2.8125 [--p 5.16] [--dark] "expression" """
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""
async def main(a):
    from patchright.async_api import async_playwright
    size, dpr = (a.size.split("@") + ["1"])[:2]; w, h = map(int, size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=float(dpr))
        if w < 1024: opts.update(is_mobile=True, has_touch=True)
        ctx = await b.new_context(**opts)
        if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:300])); page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:300]))
        await page.goto("http://127.0.0.1:8109/" + a.url, wait_until="load")
        if not a.url or a.url.startswith("?"):
            await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
            await page.keyboard.press("Enter"); await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(700)
        if a.p is not None: await page.evaluate(GOTO_JS, a.p, isolated_context=False); await page.wait_for_timeout(a.wait)
        r = await page.evaluate(a.expr, isolated_context=False)
        print(json.dumps(r, indent=1) if not isinstance(r, str) else r)
        if a.shot: await page.screenshot(path=a.shot)
        if errs: print("console:", errs)
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("expr"); ap.add_argument("--size", default="384x734@2.8125"); ap.add_argument("--p", type=float); ap.add_argument("--dark", action="store_true")
ap.add_argument("--url", default="?first"); ap.add_argument("--wait", type=int, default=900); ap.add_argument("--shot", default="")
with BrowserLock(): asyncio.run(main(ap.parse_args()))

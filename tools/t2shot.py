"""Take 2 page screenshots on 8109: enter through the gate, then hold page 1 at given positions (in screens of scroll).
  python -I tools/t2shot.py --size 384x734 --dpr 2.8125 --mobile --ps 0,0.9,2.8 --out tools/shots/p1 [--dark] [--reduced] [--gate]
Prints console errors. --gate also shoots the black gate before entering."""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

ENTER_JS = "() => new Promise(r => { const t0 = performance.now(); (function w() { if (document.documentElement.dataset.phase === 'ready') r(performance.now() - t0); else if (performance.now() - t0 > 15000) r(-1); else setTimeout(w, 50); })(); })"
GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""

async def open_page(pw, a):
    w, h = map(int, a.size.split("x"))
    b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"])
    opts = dict(viewport={"width": w, "height": h}, device_scale_factor=a.dpr, reduced_motion="reduce" if a.reduced else "no-preference")
    if a.mobile: opts.update(is_mobile=True, has_touch=True)
    ctx = await b.new_context(**opts)
    if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
    page = await ctx.new_page()
    errs = []
    page.on("console", lambda m: m.type in ("error", "warning") and errs.append(f"{m.type}: {m.text[:300]}"))
    page.on("pageerror", lambda e: errs.append(f"pageerror: {str(e)[:300]}"))
    return b, page, errs

async def enter(page, a, out, tag):
    await page.goto("http://127.0.0.1:8109/?first&nosnap" + (("&" + a.query) if a.query else ""), wait_until="load")
    if a.reduced:   # the still gate: shoot it, then enter at once
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.wait_for_timeout(400); await page.screenshot(path=str(out / f"{tag}_gate.png"))
        await page.keyboard.press("Enter"); await page.wait_for_timeout(1200); return
    await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
    if a.gate:
        await page.wait_for_timeout(600); await page.screenshot(path=str(out / f"{tag}_gate.png"))
    await page.keyboard.press("Enter")
    ms = await page.evaluate(ENTER_JS)
    await page.wait_for_timeout(400)
    return ms

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tag = f"{a.size}{'_dark' if a.dark else ''}{'_rm' if a.reduced else ''}{('_' + a.query.replace('=', '').replace('&', '_')) if a.query else ''}"
    async with async_playwright() as pw:
        b, page, errs = await open_page(pw, a)
        ms = await enter(page, a, out, tag)
        print("entered in", ms, "ms")
        if a.reduced:
            H = await page.evaluate("document.documentElement.scrollHeight"); vh = await page.evaluate("innerHeight")
            for i, y in enumerate(range(0, H, vh)):
                await page.evaluate(f"scrollTo(0, {y})"); await page.wait_for_timeout(300)
                await page.screenshot(path=str(out / f"{tag}_rm{i:02d}.png"))
                if i > 8: break
        else:
            top = await page.evaluate("document.getElementById('page-01').offsetTop"); vh = await page.evaluate("innerHeight")
            for p in [float(x) for x in a.ps.split(",")]:
                if a.pre is not None:   # park here first (warms what normal scrolling would have warmed, e.g. the hallway before the way in)
                    await page.evaluate(GOTO_JS, a.pre, isolated_context=False); await page.wait_for_timeout(a.pre_wait)
                await page.evaluate(GOTO_JS, p, isolated_context=False)
                await page.wait_for_timeout(a.wait)
                await page.screenshot(path=str(out / f"{tag}_{int(p * 1000):04d}.png"))
        print("errors:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser()
ap.add_argument("--size", default="384x734"); ap.add_argument("--dpr", type=float, default=1); ap.add_argument("--mobile", action="store_true")
ap.add_argument("--ps", default="0,0.5,0.9,1.5,2.2,2.8"); ap.add_argument("--out", default="tools/shots/p1"); ap.add_argument("--dark", action="store_true")
ap.add_argument("--reduced", action="store_true"); ap.add_argument("--gate", action="store_true"); ap.add_argument("--wait", type=int, default=700); ap.add_argument("--query", default="")
ap.add_argument("--pre", type=float, default=None); ap.add_argument("--pre-wait", type=int, default=2500)
a = ap.parse_args()
with BrowserLock():
    asyncio.run(main(a))

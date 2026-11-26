"""Hallway pass 2 probe (26 Nov): enter, then at each named hallway stop (or position) shoot the screen and print what the
hallway reports: the camera's slide, each open frame's width and height as shares of the screen, the band, the lock.
Also prints dive.readability() (each frame read closest: its cells, plaque rows, slide, smallest word, in-plane clear).
  python -I tools/hall2probe.py --size 384x734 --dpr 2.8125 --mobile --stops LIT,F1,F2,F3,F4,F5,DOOR --out tools/shots/hall-p2/probe [--dark]
Stops are __p1.stops names with optional offsets (F1-0.3) or plain numbers (screens)."""
import argparse, asyncio, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update();
  const t0 = performance.now(); while (!window.__p1.settled() && performance.now() - t0 < 3000) await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return scrollY; }"""
INFO_JS = """() => { const d = window.__p1.dive(); if (!d) return null; const api = window.__p1.diveApi;
  return { q: +d.q.toFixed(4), cam: d.cam.map(v => +v.toFixed(3)), eye: +d.eye.toFixed(3), phones: d.phones, dress: +d.dress.toFixed(2), lights: +d.lights.toFixed(2), band: d.band ? { i: d.band.i, op: +d.band.op.toFixed(2) } : null,
    open: d.info.filter(f => f.swing > 0.01).map(f => ({ i: f.i + 1, swing: +f.swing.toFixed(2), lab: +f.lab.toFixed(2), w: +f.widthShare.toFixed(3), h: +(f.share / innerHeight).toFixed(3) })),
    lock: d.door, chrome: document.documentElement.classList.contains('hall-dark') }; }"""

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"])
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=a.dpr)
        if a.mobile: opts.update(is_mobile=True, has_touch=True)
        ctx = await b.new_context(**opts)
        if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(f"{m.type}: {m.text[:300]}"))
        page.on("pageerror", lambda e: errs.append(f"pageerror: {str(e)[:300]}"))
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(800)
        stops = await page.evaluate("() => window.__p1.stops", isolated_context=False)
        tag = f"{a.size}{'_dark' if a.dark else ''}"
        for s in a.stops.split(","):
            m = re.match(r"^([A-Z]+\d*B?)([+-][\d.]+)?$", s)
            p = (stops[m.group(1)] + float(m.group(2) or 0)) if m and m.group(1) in stops else float(s)
            await page.evaluate(GOTO_JS, p, isolated_context=False); await page.wait_for_timeout(a.wait)
            await page.screenshot(path=str(out / f"{tag}_{s}.png"))
            print(s, round(p, 3), json.dumps(await page.evaluate(INFO_JS, isolated_context=False)))
        if a.read:
            r = await page.evaluate("() => window.__p1.diveApi.readability()", isolated_context=False)
            for f in r["frames"]:
                print("read", f["i"], f["key"], "cells", f["cells"], "plaque", f["plaque"], "Dc", f["Dc"], "slide", f["slide"], "minSize", round(f["closest"]["minSize"] or 0, 3),
                      "w", round(f["closest"]["widthShare"], 3), "h", round(f["closest"]["share"], 3), "off", f["closest"].get("off"), "inPlane", f["inPlane"]["worst"], "/", f["inPlane"]["need"], f["inPlane"]["what"])
        print("errors:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser()
ap.add_argument("--size", default="384x734"); ap.add_argument("--dpr", type=float, default=1); ap.add_argument("--mobile", action="store_true")
ap.add_argument("--stops", default="LIT,F1,F2,F3,F4,F5,DOOR"); ap.add_argument("--out", default="tools/shots/hall-p2/probe"); ap.add_argument("--dark", action="store_true")
ap.add_argument("--wait", type=int, default=500); ap.add_argument("--read", action="store_true")
a = ap.parse_args()
with BrowserLock():
    asyncio.run(main(a))

"""Take 2 page 1: frame times per segment of the story (scripted scroll back and forth inside each range), in emulation.
  python -I tools/fps_seg.py --size 384x734 [--secs 4]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SEGS = {"plate still 0.0-0.24": (0.0, 0.24), "dissolve 0.26-0.42": (0.26, 0.42), "blue switch 0.4-0.52": (0.4, 0.52), "morph 0.52-0.9": (0.52, 0.9), "handover 0.9-1.0": (0.9, 1.0)}
RUN = """async ([a, b, secs]) => { const e = window.__t2.engine, ya = window.__p1.yAt(a), yb = window.__p1.yAt(b);
  const t = []; let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; const k = (now - t0) / (secs * 1000);
    const y = ya + (yb - ya) * (k < .5 ? k * 2 : 2 - k * 2); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const so = [...t].sort((x, y) => x - y), sum = t.reduce((x, y) => x + y, 0);
  return { fps: +(1000 * t.length / sum).toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), frames: t.length }; }"""
async def main(a):
    from patchright.async_api import async_playwright
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": w, "height": h})
        if w < 1024: kw.update(is_mobile=True, has_touch=True, device_scale_factor=2.8125)
        page = await (await b.new_context(**kw)).new_page()
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000); await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await page.wait_for_timeout(1500)
        for name, (p0, p1) in SEGS.items():
            print(a.size, name, json.dumps(await page.evaluate(RUN, [p0, p1, a.secs], isolated_context=False)), flush=True)
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734"); ap.add_argument("--secs", type=float, default=4)
with BrowserLock(): asyncio.run(main(ap.parse_args()))

"""The "?" dot dive starts exactly on the glyph's dot: at each size, screenshot the closing line with the dive's overlay
hidden, find the "?" dot's ink in the pixels (the lowest blob of ink near the measured spot), and compare its centre
and radius with what page 1 measured (__p1.dot()). Prints the error in CSS px.
  python -I tools/dotcheck.py [--sizes 384x734@2.8125m,390x844@3m,1440x900@1,2160x1147@1.333]"""
import argparse, asyncio, io, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SIZES = "384x734@2.8125m,390x844@3m,1280x720@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1"
GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""

def blob(img, cx, cy, r, dpr):
    from PIL import Image
    g = img.convert("L"); W, H = g.size; px = g.load()
    R = int((r * 3 + 4) * dpr); x0, y0 = max(0, int(cx * dpr) - R), max(0, int(cy * dpr) - R)
    x1, y1 = min(W, int(cx * dpr) + R), min(H, int(cy * dpr) + R)
    bg = sorted(px[x, y] for x in range(x0, x1) for y in (y0, y1 - 1))[len(range(x0, x1))]   # paper level
    sx, sy = int(cx * dpr), int(cy * dpr)
    if not px[sx, sy] < bg - 60: return None
    seen, st, n, mx, my, xs, ys = set(), [(sx, sy)], 0, 0, 0, [], []
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (x0 <= x < x1 and y0 <= y < y1): continue
        seen.add((x, y))
        if px[x, y] > bg - 60: continue
        w = (bg - px[x, y]) / 255; n += w; mx += x * w; my += y * w; xs.append(x); ys.append(y)
        st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return mx / n / dpr, my / n / dpr, (max(xs) - min(xs) + 1) / 2 / dpr

async def main(a):
    from patchright.async_api import async_playwright
    from PIL import Image
    out = Path("tools/shots/dot"); out.mkdir(parents=True, exist_ok=True); worst = 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        for s in a.sizes.split(","):
            mob = s.endswith("m"); s = s.rstrip("m"); wh, dpr = s.split("@"); w, h = map(int, wh.split("x")); dpr = float(dpr)
            for theme in ("light", "dark"):
                opts = dict(viewport={"width": w, "height": h}, device_scale_factor=dpr)
                if mob: opts.update(is_mobile=True, has_touch=True)
                ctx = await b.new_context(**opts)
                if theme == "dark": await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
                page = await ctx.new_page()
                await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
                await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
                await page.keyboard.press("Enter"); await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
                await page.wait_for_timeout(500)
                # the glyph alone, just before the dive; then the dive's ink dot just after it starts (the window is
                # exactly the dot, under the ink): both must sit on what page 1 measured, and on each other
                inv = (lambda im: Image.eval(im.convert("RGB"), lambda v: 255 - v)) if theme == "dark" else (lambda im: im)
                await page.evaluate(GOTO_JS, 4.29, isolated_context=False); await page.wait_for_timeout(1200)
                d = await page.evaluate("window.__p1.dot()", isolated_context=False)
                got = blob(inv(Image.open(io.BytesIO(await page.screenshot()))), d["x"], d["y"], d["r"], dpr)
                await page.screenshot(path=str(out / f"{wh}_{theme}_glyph.png"), clip={"x": max(0, d["x"] - 40), "y": max(0, d["y"] - 40), "width": 80, "height": 80})
                await page.evaluate(GOTO_JS, 4.3003, isolated_context=False); await page.wait_for_timeout(300)
                ov = blob(inv(Image.open(io.BytesIO(await page.screenshot()))), d["x"], d["y"], d["r"], dpr)
                await page.screenshot(path=str(out / f"{wh}_{theme}_dive.png"), clip={"x": max(0, d["x"] - 40), "y": max(0, d["y"] - 40), "width": 80, "height": 80})
                if not got or not ov: print(f"{wh} {theme}: NO INK (glyph {got}, dive {ov}) at {d}"); worst = 99; await ctx.close(); continue
                print(f"   {wh} {theme} dive's dot vs the glyph's: x {ov[0] - got[0]:+.2f} y {ov[1] - got[1]:+.2f} r {ov[2] - got[2]:+.2f} px")
                worst = max(worst, abs(ov[0] - got[0]), abs(ov[1] - got[1]), abs(ov[2] - got[2]))
                ex, ey, er = got[0] - d["x"], got[1] - d["y"], got[2] - d["r"]
                worst = max(worst, abs(ex), abs(ey), abs(er))
                print(f"{wh}@{dpr} {theme}: measured ({d['x']:.2f},{d['y']:.2f}) r {d['r']:.2f}; glyph ink ({got[0]:.2f},{got[1]:.2f}) r {got[2]:.2f}; error x {ex:+.2f} y {ey:+.2f} r {er:+.2f} px")
                await ctx.close()
        await b.close()
    print(f"WORST ERROR: {worst:.2f} px")
ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES)
with BrowserLock(): asyncio.run(main(ap.parse_args()))

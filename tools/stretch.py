"""The corridor's stretch check (Part 5 "Round 4 picks": no stretching), at every size.
  python -I tools/stretch.py [--sizes ...] [--steps 400]
For each frame:
  - at its most readable moment (the middle of its stop, facing you), the on-screen width / height of its drawing
    (the blue sheet's quad: mean of its opposite edges) against the drawing's true ratio -> the deviation in %;
  - over the whole walk, the closest any part of the frame comes to the screen edge while it is still visible
    (opacity > 0.05), and while it is readable (facing, fully drawn);
  - the lens: the field of view across the narrower side and across.
Drives the dive directly (window.__p1.diveApi.render(q)) after entering the page, so it measures exactly what is drawn."""
import argparse, asyncio, json, math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"   # round 7: + five phones

JS = r"""async (steps) => {
  const p1 = window.__p1, d = p1.diveApi, W = innerWidth, H = innerHeight;
  await d.load(); const y = p1.yAt(p1.R.dive[0] + 0.3); window.__t2.engine.lenis ? window.__t2.engine.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const P = d.P(), fovN = 2 * Math.atan(Math.min(W, H) / 2 / P) * 180 / Math.PI, fovX = 2 * Math.atan(W / 2 / P) * 180 / Math.PI, fovY = 2 * Math.atan(H / 2 / P) * 180 / Math.PI;
  const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const edge = (q) => Math.min(...q.map(([x, y]) => Math.min(x, y, W - x, H - y)));
  const STOPS = d.stops;   // the dive's own timeline
  const out = STOPS.map(() => ({ minEdgeVisible: 1e9, minEdgeReadable: 1e9 }));
  // the way in is a timed beat: let it finish first
  d.render(0.05); await new Promise((r) => setTimeout(r, 1500));
  // from the moment the window is fully open (before it, everything outside the dot's circle is clipped away)
  for (let k = Math.ceil(0.1 * steps); k <= steps; k++) {
    const q = k / steps, r = d.render(q);
    r.info.forEach((f) => {
      if (!f.quad || f.op < 0.05) return;
      const e = edge(f.quad); const o = out[f.i];
      if (e < o.minEdgeVisible) { o.minEdgeVisible = e; o.atVisible = q; }
      if (f.swing > 0.98 && f.drawn > 0.99 && e < o.minEdgeReadable) { o.minEdgeReadable = e; o.atReadable = q; }
    });
  }
  STOPS.forEach(([s, e], i) => {
    const q = (s + e) / 2, r = d.render(q), f = r.info[i], [a, b, c, dd] = f.sheet;
    const w = (len(a, b) + len(dd, c)) / 2, h = (len(a, dd) + len(b, c)) / 2;
    // keystone: the difference between opposite edges (0 for a frame square to the screen)
    out[i] = { ...out[i], q, swing: +f.swing.toFixed(4), true: +f.ratio.toFixed(4), screen: +(w / h).toFixed(4), dev: +((w / h / f.ratio - 1) * 100).toFixed(3),
      keystone: +(Math.max(Math.abs(len(a, b) - len(dd, c)) / w, Math.abs(len(a, dd) - len(b, c)) / h) * 100).toFixed(3), sizePx: [+w.toFixed(0), +h.toFixed(0)] };
  });
  d.render(0);
  return { W, H, fovNarrow: +fovN.toFixed(2), fovAcross: +fovX.toFixed(2), fovDown: +fovY.toFixed(2), frames: out };
}"""

async def main(a):
    from patchright.async_api import async_playwright
    worst = (0, None); worstEdge = (1e9, None)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        for sz in a.sizes.split(","):
            size, dpr = (sz.split("@") + ["1"])[:2]; w, h = map(int, size.split("x"))
            opts = dict(viewport={"width": w, "height": h}, device_scale_factor=float(dpr))
            if w < 1024: opts.update(is_mobile=True, has_touch=True)
            ctx = await b.new_context(**opts); page = await ctx.new_page()
            await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
            await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
            await page.keyboard.press("Enter"); await page.wait_for_timeout(250); await page.keyboard.press("Enter")
            await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
            await page.wait_for_timeout(500)
            r = await page.evaluate(JS, a.steps, isolated_context=False)
            print(f"{sz}: fov narrow {r['fovNarrow']} deg, across {r['fovAcross']}, down {r['fovDown']}")
            for i, f in enumerate(r["frames"]):
                print(f"  frame {i + 1}: true {f['true']} on screen {f['screen']} -> {f['dev']:+.3f}% (keystone {f['keystone']}%), {f['sizePx'][0]}x{f['sizePx'][1]} px; "
                      f"closest to the edge: {f['minEdgeReadable']:.1f} px while readable, {f['minEdgeVisible']:.1f} px while visible (q {f.get('atVisible', 0):.3f}; readable at q {f.get('atReadable', 0):.3f})")
                if abs(f["dev"]) > abs(worst[0]): worst = (f["dev"], f"{sz} frame {i + 1}")
                if f["minEdgeVisible"] < worstEdge[0]: worstEdge = (f["minEdgeVisible"], f"{sz} frame {i + 1}")
            await ctx.close()
        await b.close()
    print(f"WORST RATIO DEVIATION: {worst[0]:+.3f}% ({worst[1]})")
    print(f"CLOSEST TO AN EDGE WHILE VISIBLE: {worstEdge[0]:.1f} px ({worstEdge[1]})")

ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); ap.add_argument("--steps", type=int, default=400)
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

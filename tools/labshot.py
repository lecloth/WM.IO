"""Screenshots and frame rate for the style lab (site/dev/lab.html) on 8109.
  python -I tools/labshot.py --codes A1,B2 --ps 0,0.3,0.6,1 --out tools/shots/lab [--w 384 --h 734 --dpr 2.8125] [--taps 2]
  python -I tools/labshot.py --codes B1 --fps 6          (auto-scrolls the option for 6 s and reports frame times)
Mobile emulation by default (S23's real viewport, 384 x 734 @ 2.8125); --desktop for 1440 x 900."""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"])
        if a.desktop: ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        else: ctx = await b.new_context(viewport={"width": a.w, "height": a.h}, device_scale_factor=a.dpr, is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        errs = []
        page.on("console", lambda m: m.type == "error" and errs.append(m.text[:300]))
        page.on("pageerror", lambda e: errs.append(str(e)[:300]))
        for code in a.codes.split(","):
            await page.goto(f"http://127.0.0.1:8109/dev/lab.html?skip#{code}", wait_until="load")
            await page.wait_for_timeout(2500)
            sel = f"#{code} .opt__scroll"
            for t in range(a.taps):
                btns = await page.query_selector_all(f"#{code} .c1__front, #{code} .c__chip")
                if t < len(btns): await btns[[0, 3, 4, 1, 2][t]].click(); await page.wait_for_timeout(900)
            if a.fps:
                r = await page.evaluate("""async ([sel, secs]) => {
                    const s = document.querySelector(sel); const max = s.scrollHeight - s.clientHeight; const t = [];
                    let last = performance.now(); const t0 = last;
                    await new Promise(res => { function f(now) { t.push(now - last); last = now; const k = (now - t0) / (secs * 1000);
                        s.scrollTop = max * (k < .5 ? k * 2 : 2 - k * 2); if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
                    t.shift(); const so = [...t].sort((x, y) => x - y); const sum = t.reduce((x, y) => x + y, 0);
                    return { fps: +(1000 * t.length / sum).toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), over25: t.filter(x => x > 25).length, frames: t.length };
                }""", [sel, a.fps], isolated_context=False)
                print(code, "fps", json.dumps(r))
            for p in [float(x) for x in a.ps.split(",")] if a.ps else []:
                await page.evaluate("""([sel, p]) => { const s = document.querySelector(sel); s.scrollTop = (s.scrollHeight - s.clientHeight) * p; }""", [sel, p], isolated_context=False)
                await page.wait_for_timeout(a.wait)
                f = out / f"{code}_{int(p * 1000):04d}{'_d' if a.desktop else ''}.png"
                await page.screenshot(path=str(f))
                print("shot", f)
        print("errors:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser()
ap.add_argument("--codes", default="A1"); ap.add_argument("--ps", default="0"); ap.add_argument("--out", default="tools/shots/lab")
ap.add_argument("--w", type=int, default=384); ap.add_argument("--h", type=int, default=734); ap.add_argument("--dpr", type=float, default=2.8125)
ap.add_argument("--desktop", action="store_true"); ap.add_argument("--taps", type=int, default=0); ap.add_argument("--fps", type=float, default=0)
ap.add_argument("--wait", type=int, default=900)
a = ap.parse_args()
with BrowserLock():
    asyncio.run(main(a))

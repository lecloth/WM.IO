"""Timed screenshots of the local studio site (port 8108) for checking motion by eye.
Adapted from the screenshot tool I wrote for the santalarch clone (see ENGINE_REUSE.md).

  python tools/shoot.py --url http://127.0.0.1:8108/ --times 200,800,1400,2000,2600 --out shots/x
  options: --reduced (prefers-reduced-motion), --return (load once, then reload = return visit),
           --skip-at MS (press a key at MS), --mobile (390x844 touch), --ys 900,1800 (after the opening),
           --mouse x,y, --w/--h, --prefix
Times are ms after navigation start. Prints console errors.
"""
import argparse
import asyncio
import json
import time
from pathlib import Path


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8108/")
    ap.add_argument("--times", default="")
    ap.add_argument("--ys", default="")
    ap.add_argument("--out", required=True)
    ap.add_argument("--prefix", default="s")
    ap.add_argument("--reduced", action="store_true")
    ap.add_argument("--return", dest="ret", action="store_true")
    ap.add_argument("--skip-at", type=int, default=0)
    ap.add_argument("--mobile", action="store_true")
    ap.add_argument("--mouse", default="")
    ap.add_argument("--w", type=int, default=1440)
    ap.add_argument("--h", type=int, default=900)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": a.w, "height": a.h})
        if a.reduced:
            kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(device_scale_factor=1, **kw)
        page = await ctx.new_page()
        logs = []
        page.on("console", lambda m: m.type in ("error", "warning") and logs.append(f"{m.type}: {m.text}"[:240]))
        page.on("pageerror", lambda e: logs.append(f"pageerror: {e}"[:240]))
        if a.ret:
            await page.goto(a.url, wait_until="load"); await page.wait_for_timeout(4000)
        t0 = time.perf_counter()
        await page.goto(a.url, wait_until="commit")
        if a.mouse:
            mx, my = [float(v) for v in a.mouse.split(",")]
            await page.mouse.move(mx, my)
        files = []
        times = [int(t) for t in a.times.split(",") if t.strip()]
        skipped = False
        for t in times:
            if a.skip_at and not skipped and t >= a.skip_at:
                wait = a.skip_at / 1000 - (time.perf_counter() - t0)
                if wait > 0: await asyncio.sleep(wait)
                await page.keyboard.press("Space"); skipped = True
            wait = t / 1000 - (time.perf_counter() - t0)
            if wait > 0: await asyncio.sleep(wait)
            real = int((time.perf_counter() - t0) * 1000)
            f = out / f"{a.prefix}_t{t:05d}.jpg"
            await page.screenshot(path=str(f), type="jpeg", quality=82)
            ph = await page.evaluate("document.documentElement.dataset.phase")
            files.append((t, real, ph, f.name))
        for y in [int(v) for v in a.ys.split(",") if v.strip()]:
            await page.evaluate(f"(window.__engine?.lenis ? window.__engine.lenis.scrollTo({y},{{immediate:true}}) : 0, window.scrollTo(0,{y}))")
            await page.wait_for_timeout(1200)
            if a.mouse:
                mx, my = [float(v) for v in a.mouse.split(",")]
                await page.mouse.move(mx - 30, my - 30); await page.mouse.move(mx, my, steps=6); await page.wait_for_timeout(300)
            f = out / f"{a.prefix}_y{y:05d}.jpg"
            await page.screenshot(path=str(f), type="jpeg", quality=82)
            files.append(("y", y, "", f.name))
        info = await page.evaluate("({phase: document.documentElement.dataset.phase, visit: document.documentElement.dataset.visit, sh: document.documentElement.scrollHeight, overflow: getComputedStyle(document.body).overflow})")
        await b.close()
    print(json.dumps({"frames": files, "info": info, "logs": logs}, indent=1))


if __name__ == "__main__":
    asyncio.run(main())

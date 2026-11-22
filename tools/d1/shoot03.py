"""Screenshots of sheet 03 scenes at given p (viewport heights into each section, kit.js contract: y = top - vh + p*vh).
  python -I tools/d1/shoot03.py --ids sheet-03,sheet-03-apps --ps 0.3,0.7,1.5 --out tools/shots/d1/x [--mobile] [--reduced] [--w 1920 --h 1080]
Reduced motion: --ps are ignored; it shoots each section's top and top + 1 viewport."""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from browserlock import BrowserLock


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", default="sheet-03")
    ap.add_argument("--ps", default="1.5")
    ap.add_argument("--out", required=True)
    ap.add_argument("--mobile", action="store_true")
    ap.add_argument("--reduced", action="store_true")
    ap.add_argument("--w", type=int, default=1440)
    ap.add_argument("--h", type=int, default=900)
    ap.add_argument("--wait", type=int, default=700)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": a.w, "height": a.h})
        if a.reduced: kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(device_scale_factor=1, **kw)
        page = await ctx.new_page()
        logs = []
        page.on("console", lambda m: m.type in ("error", "warning") and logs.append(f"{m.type}: {m.text}"[:300]))
        page.on("pageerror", lambda e: logs.append(f"pageerror: {e}"[:300]))
        await page.goto("http://127.0.0.1:8109/", wait_until="load"); 
        try: await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        except Exception as e: print("phase never ready:", await page.evaluate("document.documentElement.dataset.phase"), logs[:10])
        await page.wait_for_timeout(800)
        shots = []
        for sid in a.ids.split(","):
            top = await page.evaluate(f"(() => {{ const s = document.getElementById('{sid}'); return s.getBoundingClientRect().top + scrollY; }})()", isolated_context=False)
            vh = await page.evaluate("innerHeight")
            ps = [0, 1, 1.6] if a.reduced else [float(v) for v in a.ps.split(",")]
            for p in ps:
                y = int(top + p * vh) if a.reduced else int(top - vh + p * vh)
                await page.evaluate(f"(window.__engine?.lenis ? window.__engine.lenis.scrollTo({y},{{immediate:true}}) : 0, window.scrollTo(0,{y}))", isolated_context=False)
                await page.wait_for_timeout(a.wait)
                f = out / f"{sid}_p{p:05.2f}.jpg"
                await page.screenshot(path=str(f), type="jpeg", quality=80)
                shots.append(f.name)
        await b.close()
    print(json.dumps({"shots": shots, "logs": logs}, indent=1))

if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main())

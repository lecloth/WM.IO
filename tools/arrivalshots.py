"""The arrival held at fixed moments (window.__arrival.hold), for a pixel comparison before and after a change that must
not change its look (28 Nov: the arrival waits until the page is ready). Real Chrome, size and density set through
DevTools (no key presses). Also, with --held, a shot of the held first frame (the hold, before the arrival runs).
  python -I tools/arrivalshots.py tools/shots/arrival/look/before [--sizes 2160x1147@1.333,384x734@2.8125] [--held]
  python -I tools/arrivalshots.py --compare tools/shots/arrival/look/before tools/shots/arrival/look/after"""
import asyncio, sys, argparse, tempfile, shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
ap = argparse.ArgumentParser(); ap.add_argument("out", nargs="?"); ap.add_argument("--sizes", default="2160x1147@1.333,384x734@2.8125")
ap.add_argument("--held", action="store_true"); ap.add_argument("--compare", nargs=2); a = ap.parse_args()
TIMES = [0.0, 0.2, 0.45, 0.6, 0.75, 0.9, 1.4, 2.1, 2.6, 3.1, 3.6, 4.5]

def compare(A, B):
    from PIL import Image, ImageChops
    worst = 0; n = 0
    for f in sorted(Path(A).glob("*.png")):
        g = Path(B) / f.name
        if not g.exists() or "held" in f.name: continue
        x, y = Image.open(f).convert("RGB"), Image.open(g).convert("RGB")
        if x.size != y.size: print(f"{f.name}: size {x.size} vs {y.size}"); worst = 255; continue
        d = ImageChops.difference(x, y); bb = d.getbbox(); hist = d.convert("L").histogram()
        px = sum(hist[9:]); mx = max(i for i, v in enumerate(hist) if v) if any(hist) else 0
        worst = max(worst, mx); n += 1
        print(f"{f.name}: max channel difference {mx}, pixels differing by more than 8: {px}" + (f", box {bb}" if bb else ""))
    print(f"{n} pairs, worst {worst}")

async def main():
    from patchright.async_api import async_playwright
    OUT = Path(a.out); OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        for s in a.sizes.split(","):
            wh, _, d = s.partition("@"); w, h = map(int, wh.split("x")); dpr = float(d or 1)
            prof = tempfile.mkdtemp(prefix="arrshot-prof-")
            ctx = await pw.chromium.launch_persistent_context(prof, channel="chrome", headless=False, no_viewport=True,
                args=["--start-maximized", "--no-first-run", "--no-default-browser-check", "--disable-session-crashed-bubble"])
            try:
                pg = ctx.pages[0] if ctx.pages else await ctx.new_page()
                cdp = await ctx.new_cdp_session(pg)
                await cdp.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": dpr, "mobile": w < 1024})
                if w < 1024: await cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 5})
                tag = f"{w}x{h}"
                await pg.goto("http://127.0.0.1:8109/?first")
                if a.held:
                    await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'hold'", timeout=40000, polling=20)
                    await pg.wait_for_timeout(250); await pg.screenshot(path=str(OUT / f"{tag}_held.png"))
                await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'gate'", timeout=40000)
                await pg.wait_for_timeout(800)
                for t in TIMES:
                    await pg.evaluate(f"window.__arrival.hold({t})", isolated_context=False); await pg.wait_for_timeout(200)
                    await pg.screenshot(path=str(OUT / f"{tag}_t{t:.2f}.png"))
                await pg.evaluate("window.__arrival.hold(null)", isolated_context=False)
            finally:
                await ctx.close(); shutil.rmtree(prof, ignore_errors=True)

if a.compare: compare(*a.compare)
else:
    with BrowserLock(): asyncio.run(main())

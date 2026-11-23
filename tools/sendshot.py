"""Screenshot the three Send designs (site/dev/send.html?d=A|B|C) at 384x734, light, and the asset sheet's Send row.
  python -I tools/sendshot.py --out tools/shots/send"""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={"width": 384, "height": 734}, device_scale_factor=2, is_mobile=True, has_touch=True)
        p = await ctx.new_page(); errs = []
        p.on("console", lambda m: m.type == "error" and errs.append(m.text)); p.on("pageerror", lambda e: errs.append(str(e)))
        for d in "ABC":
            await p.goto(f"http://127.0.0.1:8109/dev/send.html?d={d}", wait_until="load"); await p.wait_for_timeout(500)
            await p.screenshot(path=str(out / f"send_{d}.png"))
            await p.click(".send"); await p.wait_for_timeout(200)
            print(d, (await p.text_content(".lab-said"))[:140])
        ctx2 = await b.new_context(viewport={"width": 1440, "height": 900})
        q = await ctx2.new_page(); q.on("console", lambda m: m.type == "error" and errs.append(m.text))
        await q.goto("http://127.0.0.1:8109/dev/assets.html", wait_until="load"); await q.wait_for_timeout(1500)
        await q.evaluate("document.querySelector('.sends').scrollIntoView()"); await q.wait_for_timeout(1500)
        await q.screenshot(path=str(out / "assets_sends_1440.png"))
        print("errors:", errs or "none")
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("--out", default="tools/shots/send")
with BrowserLock(): asyncio.run(main(ap.parse_args()))

"""The finished phone on the asset sheet at several turns (card crops), to judge the product-shot look.
  python -I tools/phoneshot.py [--turns 11,30,50,100] [--out tools/shots/phoneA] [--dark]"""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        ctx = await b.new_context(viewport={"width": 1700, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page(); errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:300])); page.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await page.goto("http://127.0.0.1:8109/dev/assets.html", wait_until="load")
        await page.wait_for_function("window.__assets", timeout=20000)
        await page.evaluate("window.__assets.ready()", isolated_context=False); await page.wait_for_timeout(800)
        cards = await page.query_selector_all(".card__stage")
        for t in a.turns.split(","):
            await page.evaluate(f"(() => {{ window.__assets.turn.value = {t}; window.__assets.draw(); }})()", isolated_context=False); await page.wait_for_timeout(250)
            for i, c in enumerate(cards):
                await c.screenshot(path=str(out / f"card{i}_turn{t}.png"))
        print("errors:", errs or "none")
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("--turns", default="11,30,50,100"); ap.add_argument("--out", default="tools/shots/phoneA")
with BrowserLock(): asyncio.run(main(ap.parse_args()))

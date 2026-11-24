"""Screenshots of the asset sheet (site/dev/assets.html) on 8109: phone A, the real phones, the corridor, Send A.
  python -I tools/assetshot.py [--out tools/shots/assets] [--size 1440x900] [--dpr 1] [--turns -80,34,90] [--dives 290,480] [--mobile]
Full-page shots at each turn (with the corridor at its first Dive value), then the corridor card alone at each Dive value.
Prints console errors and whether the real phones' files were found."""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=a.dpr)
        if a.mobile: opts.update(is_mobile=True, has_touch=True)
        ctx = await b.new_context(**opts); page = await ctx.new_page(); errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200])); page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await page.goto("http://127.0.0.1:8109/dev/assets.html", wait_until="load")
        await page.wait_for_function("window.__assets", timeout=20000)
        r = await page.evaluate("window.__assets.ready()", isolated_context=False)
        await page.evaluate("window.__assets.divesReady()", isolated_context=False)
        print("real phones missing:", (r or {}).get("missing") or "none")
        dives = [int(x) for x in a.dives.split(",")]
        async def dive(v):
            await page.evaluate(f"(() => {{ window.__assets.dive.value = {v}; window.__assets.drawDives(); }})()", isolated_context=False)
            await page.wait_for_timeout(700)
        await dive(dives[0])
        for t in a.turns.split(","):
            await page.evaluate(f"(() => {{ window.__assets.turn.value = {t}; window.__assets.draw(); }})()", isolated_context=False)
            await page.wait_for_timeout(300)
            await page.screenshot(path=str(out / f"assets_{a.size}_{t}.png"), full_page=True)
        card = page.locator(".divecard__stage")
        for v in dives:
            await dive(v)
            await card.screenshot(path=str(out / f"corridor_{a.size}_{v}.png"))
        print("errors:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser(); ap.add_argument("--out", default="tools/shots/assets"); ap.add_argument("--size", default="1440x900")
ap.add_argument("--turns", default="-80,34,90"); ap.add_argument("--dives", default="290,480"); ap.add_argument("--mobile", action="store_true"); ap.add_argument("--dpr", type=float, default=1)
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

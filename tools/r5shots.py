"""Round 5 candidate screenshots from the asset sheet (site/dev/assets.html) on 8109, each card at phone size:
the three hallway looks (several Dive values, incl. frame 4's turn), the three page-2 calls to action (before and
after a tap), the three page-1 grounds. Light and dark.
  python -I tools/r5shots.py [--out tools/shots/r5] [--dives 330,470,640,830,890,960] [--dark]
Prints console errors and whether the real phones loaded in each hallway."""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tag = "dark" if a.dark else "light"
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        ctx = await b.new_context(viewport={"width": 1320, "height": 900}, device_scale_factor=2)
        if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200])); page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await page.goto("http://127.0.0.1:8109/dev/assets.html", wait_until="load")
        await page.wait_for_function("window.__assets", timeout=20000)
        r = await page.evaluate("window.__assets.ready()", isolated_context=False)
        print("hallway phones:", r.get("phones"), "| pair missing:", r.get("missing") or "none")
        cards = page.locator(".divecard__stage")
        for v in [int(x) for x in a.dives.split(",")]:
            await page.evaluate(f"(() => {{ window.__assets.dive.value = {v}; window.__assets.drawDives(); }})()", isolated_context=False)
            await page.wait_for_timeout(1800)   # the timed beats and the phones' spring settle
            for i, k in enumerate("ABC"):
                await cards.nth(i).screenshot(path=str(out / f"hall-{k}_{tag}_{v}.png"))
        # the calls to action: as they land, then after a tap on the first box (A, C) or the beacon (B)
        frames = page.locator(".frame384 iframe")
        await page.locator("#rowT").scroll_into_view_if_needed(); await page.wait_for_timeout(1500)
        for i, k in enumerate("ABC"):
            f = frames.nth(i)
            await f.screenshot(path=str(out / f"cta-{k}_{tag}_1land.png"))
            fr = page.frame_locator(".frame384 iframe").nth(i)
            if k == "B": await fr.locator(".p2-beacon").click()
            else: await fr.locator(".p2-row").first.locator("label").click()
            await page.wait_for_timeout(1100)
            await f.screenshot(path=str(out / f"cta-{k}_{tag}_2tap.png"))
        gs = page.locator(".gcard .p1")
        for i, k in enumerate("ABC"):
            await gs.nth(i).screenshot(path=str(out / f"ground-{k}_{tag}.png"))
        print("errors:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser(); ap.add_argument("--out", default="tools/shots/r5"); ap.add_argument("--dives", default="330,470,640,830,890,960"); ap.add_argument("--dark", action="store_true")
a = ap.parse_args()
with BrowserLock(): asyncio.run(main(a))

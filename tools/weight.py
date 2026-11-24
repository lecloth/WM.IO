"""Page 1's weight on 8109: every request from the first load through the dive to page 2's landing, with its transfer
size (CDP Network.loadingFinished), grouped; and the bundle on disk. Emulated S23 (384x734 @2.8125).
  python -I tools/weight.py [--query hall=B]
Round 4's numbers for comparison are in STATE.md (JS bundle 828,095 bytes)."""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
ROOT = Path(__file__).resolve().parents[1]
GOTO = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""

async def main(a):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        ctx = await b.new_context(viewport={"width": 384, "height": 734}, device_scale_factor=2.8125, is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        cdp = await ctx.new_cdp_session(page); await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", {"cacheDisabled": False})
        urls, sizes, phases = {}, {}, {}
        phase = ["load"]
        cdp.on("Network.requestWillBeSent", lambda e: (urls.__setitem__(e["requestId"], e["request"]["url"]), phases.__setitem__(e["requestId"], phase[0])))
        cdp.on("Network.loadingFinished", lambda e: sizes.__setitem__(e["requestId"], e.get("encodedDataLength", 0)))
        await page.goto("http://127.0.0.1:8109/?first" + (("&" + a.query) if a.query else ""), wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(2500)
        phase[0] = "dive"
        for p in [4.0, 4.32, 4.6, 5.0, 5.5, 6.0, 6.12, 6.22, 6.3]:
            await page.evaluate(GOTO, p, isolated_context=False); await page.wait_for_timeout(900)
        await page.wait_for_timeout(2000)
        rows = []
        for rid, u in urls.items():
            if not u.startswith("http://127.0.0.1:8109/"): continue
            rows.append((phases[rid], sizes.get(rid, 0), u.replace("http://127.0.0.1:8109/", "/")))
        tot = {"load": 0, "dive": 0}
        for ph, s, u in sorted(rows, key=lambda r: (r[0], -r[1])):
            tot[ph] += s
            print(f"{ph:5} {s:>10,}  {u}")
        print(f"\nloaded before the dive: {tot['load']:,} bytes; loaded once the dive begins: {tot['dive']:,} bytes")
        dist = sum(f.stat().st_size for f in (ROOT / "site" / "dist").glob("*.js"))
        print(f"JS bundle on disk (site/dist/*.js): {dist:,} bytes")
        await b.close()

ap = argparse.ArgumentParser(); ap.add_argument("--query", default="")
a = ap.parse_args()
with BrowserLock(): asyncio.run(main(a))

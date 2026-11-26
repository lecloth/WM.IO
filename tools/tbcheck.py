"""Title block + layout at real desktop sizes: enter, go to a few page-1 stops and page 2/3, report the title block's
box against the window and anything past the right/bottom edge.  python -I tools/tbcheck.py [--sizes 2160x1147@1.333,...]"""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SIZES = "2160x1147@1.333,1440x765@2,2560x1440@1,1280x720@1,1366x768@1,1440x900@1,1920x1080@1"
JS = r"""() => { const W = innerWidth, H = innerHeight, cw = document.documentElement.clientWidth;
  const tb = document.querySelector('.titleblock').getBoundingClientRect();
  const over = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return r.width && r.right > cw + 0.5 && cs.visibility !== 'hidden' && cs.position === 'fixed'; }).map(e => e.className || e.tagName).slice(0, 8);
  return { W, H, cw, sw: document.documentElement.scrollWidth, fs: getComputedStyle(document.documentElement).fontSize, tb: [tb.left, tb.top, tb.right, tb.bottom].map(Math.round), over }; }"""
async def main(a):
    from patchright.async_api import async_playwright
    out = Path("tools/shots/fix"); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        for s in a.sizes.split(","):
            wh, dpr = s.split("@"); w, h = map(int, wh.split("x"))
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=float(dpr)); page = await ctx.new_page()
            await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
            await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
            await page.keyboard.press("Enter"); await page.wait_for_timeout(250); await page.keyboard.press("Enter")
            await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await page.wait_for_timeout(600)
            print(s, await page.evaluate(JS))
            await page.screenshot(path=str(out / f"tb_{wh}.png"))
            await ctx.close()
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES)
with BrowserLock(): asyncio.run(main(ap.parse_args()))

"""Screenshots at positions inside a later page (round 9 on): enter, scroll to window[api].yAt(s) for each s, wait until
the page's scene has settled, shoot. Also a contact sheet.
  python -I tools/pshot.py --size 384x734@2.8125 --api __p3 --ss 0,0.7,1.2 --out tools/shots/r9/p3 [--dark] [--reduced]"""
import argparse, asyncio, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
def yexpr(s):
    if not a.sel: return f'window.{a.api}.yAt({s})'
    return '(() => { let y = 0; for (let n = document.querySelector("' + a.sel + '"); n; n = n.offsetParent) y += n.offsetTop; return y + ' + str(s) + ' * innerHeight; })()'
async def main(a):
    from patchright.async_api import async_playwright
    from PIL import Image
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    size, dpr = (a.size.split("@") + ["1"])[:2]; w, h = map(int, size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=float(dpr), reduced_motion="reduce" if a.reduced else "no-preference")
        if w < 1024: opts.update(is_mobile=True, has_touch=True)
        ctx = await b.new_context(**opts)
        if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:300])); page.on("console", lambda m: m.type == "error" and errs.append(m.text[:300]))
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.keyboard.press("Enter"); await page.wait_for_timeout(250); await page.keyboard.press("Enter")
        if not a.reduced: await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(a.pre)
        files = []
        for s in [float(x) for x in a.ss.split(",")]:
            await page.evaluate(f"""async () => {{ const e = window.__t2.engine, y = {yexpr(s)}; if (e.lenis) e.lenis.scrollTo(y, {{ immediate: true, force: true }}); else scrollTo(0, y); e.ScrollTrigger.update(); }}""", isolated_context=False)
            await page.wait_for_timeout(a.wait)
            f = out / f"{size}{'_dark' if a.dark else ''}{'_rm' if a.reduced else ''}_{int(s * 1000):05d}.png"; await page.screenshot(path=str(f)); files.append(f)
        print("errors:", errs or "none")
        await b.close()
    ims = [Image.open(f) for f in files]; k = 300 / ims[0].width; tw, th = 300, int(ims[0].height * k); cols = min(len(ims), 7 if w < 1024 else 4); rows = (len(ims) + cols - 1) // cols
    sh = Image.new("RGB", (tw * cols, th * rows), "white")
    for i, im in enumerate(ims): sh.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th))
    sh.save(out / f"sheet_{size}{'_dark' if a.dark else ''}.png"); print("sheet", out / f"sheet_{size}.png")
ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734@2.8125"); ap.add_argument("--api", default="__p3"); ap.add_argument("--sel", default=""); ap.add_argument("--ss", required=True)
ap.add_argument("--out", required=True); ap.add_argument("--dark", action="store_true"); ap.add_argument("--reduced", action="store_true"); ap.add_argument("--wait", type=int, default=900); ap.add_argument("--pre", type=int, default=3500)
a = ap.parse_args()
with BrowserLock():
    asyncio.run(main(a))

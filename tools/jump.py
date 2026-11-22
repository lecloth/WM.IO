"""After the opening, jump straight to each y (no stepping) and print the title block + active strip segment.
  python -I tools/jump.py 119900,52650,2000 [--mobile] [--shots dir]"""
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
async def main(ys, mobile, shots):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        page = await (await b.new_context(**kw)).new_page()
        await page.goto("http://127.0.0.1:8108/", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=15000); await page.wait_for_timeout(500)
        for y in ys:
            await page.evaluate(f"(window.__engine.lenis.scrollTo({y},{{immediate:true, force:true}}), window.scrollTo(0,{y}))", isolated_context=False)
            await page.wait_for_timeout(900)
            r = await page.evaluate("() => ({ y: Math.round(scrollY), tb: document.querySelector('.tb__sheet').textContent + ' ' + document.querySelector('.tb__title').textContent, seg: [...document.querySelectorAll('.strip__seg')].findIndex(s => s.classList.contains('is-active')) })")
            print(json.dumps(r))
            if shots: Path(shots).mkdir(parents=True, exist_ok=True); await page.screenshot(path=f"{shots}/j_{y:06d}.jpg", type="jpeg", quality=70)
        await b.close()
args = [a for a in sys.argv[1:] if not a.startswith("--")]
shots = sys.argv[sys.argv.index("--shots") + 1] if "--shots" in sys.argv else ""
with BrowserLock():
    asyncio.run(main([int(v) for v in args[0].split(",")], "--mobile" in sys.argv, shots))

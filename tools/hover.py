"""Hover / focus states: the product's own colour on hover and on keyboard focus (hero phone, a Work sheet), button
and link hover. Counts saturated pixels in the area (black-and-white site: colour only when hovered/focused).
  python -I tools/hover.py"""
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
from PIL import Image

def colourful(path, box):
    im = Image.open(path).convert("RGB").crop(box); n = 0; tot = 0
    for r, g, b in im.getdata():
        tot += 1
        if max(r, g, b) - min(r, g, b) > 40: n += 1
    return round(100 * n / tot, 2)

async def main():
    from patchright.async_api import async_playwright
    out = {}; d = Path("tools/shots/sweep/hover"); d.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        page = await (await b.new_context(viewport={"width": 1440, "height": 900})).new_page()
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        await page.goto("http://127.0.0.1:8108/", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        go = lambda y: page.evaluate(f"() => (window.__engine.lenis.scrollTo({y},{{immediate:true, force:true}}), scrollTo(0,{y}))", isolated_context=False)
        # hero phone (act 1 final reading moment)
        await go(12200); await page.wait_for_timeout(1200)
        await page.mouse.move(100, 800); await page.wait_for_timeout(400); await page.screenshot(path=str(d / "phone_off.jpg"))
        box = await page.evaluate("() => { const c = document.querySelector('.phone-canvas').getBoundingClientRect(); return [c.left, c.top, c.width, c.height]; }")
        for x in range(380, 700, 20):
            await page.mouse.move(x, 450); await page.wait_for_timeout(60)
        await page.mouse.move(560, 470, steps=4); await page.wait_for_timeout(500); await page.screenshot(path=str(d / "phone_on.jpg"))
        out["phone"] = [colourful(d / "phone_off.jpg", (300, 150, 750, 750)), colourful(d / "phone_on.jpg", (300, 150, 750, 750))]
        # a Work sheet: hover, then keyboard focus
        y = await page.evaluate("() => { const s = document.getElementById('sheet-05'); return Math.round(s.getBoundingClientRect().top + scrollY + innerHeight * 1.9); }")
        await go(y); await page.wait_for_timeout(1500)
        await page.mouse.move(1300, 120); await page.wait_for_timeout(400); await page.screenshot(path=str(d / "work_off.jpg"))
        await page.mouse.move(400, 450, steps=6); await page.wait_for_timeout(700); await page.screenshot(path=str(d / "work_hover.jpg"))
        await page.mouse.move(1300, 120, steps=4); await page.wait_for_timeout(500)
        await page.focus("#strip a[href='#sheet-09']"); await page.keyboard.press("Tab"); await page.wait_for_timeout(700)
        out["work_focus_el"] = await page.evaluate("() => document.activeElement.className + ' ' + (document.activeElement.getAttribute('aria-label') || '').slice(0, 40)")
        await page.screenshot(path=str(d / "work_focus.jpg"))
        out["work"] = [colourful(d / f, (60, 100, 1000, 860)) for f in ("work_off.jpg", "work_hover.jpg", "work_focus.jpg")]
        # buttons: the opening's two buttons
        await go(0); await page.wait_for_timeout(1200)
        btn = await page.evaluate("() => { const r = document.querySelector('.btn--line').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
        await page.mouse.move(btn[0], btn[1], steps=3); await page.wait_for_timeout(700); await page.screenshot(path=str(d / "btn_hover.jpg"))
        out["btn_line_hover"] = await page.evaluate("() => { const e = document.querySelector('.btn--line'); return [getComputedStyle(e, '::before').transform, getComputedStyle(e.querySelector('span')).color]; }")
        out["errors"] = errs
        await b.close()
    print(json.dumps(out, indent=1))

with BrowserLock():
    asyncio.run(main())

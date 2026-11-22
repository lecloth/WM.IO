"""Debug probe for sheet 03: python -I tools/d1/probe03.py <id> <p> [--mobile]"""
import asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from browserlock import BrowserLock
async def main():
    sid, p = sys.argv[1], float(sys.argv[2]); mobile = "--mobile" in sys.argv
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if mobile else dict(viewport={"width": 1440, "height": 900})
        page = await (await b.new_context(**kw)).new_page()
        await page.goto("http://127.0.0.1:8109/", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=30000)
        top = await page.evaluate(f"document.getElementById('{sid}').getBoundingClientRect().top + scrollY", isolated_context=False)
        vh = await page.evaluate("innerHeight")
        y = int(top - vh + p * vh)
        await page.evaluate(f"(window.__engine?.lenis ? window.__engine.lenis.scrollTo({y},{{immediate:true}}) : 0, window.scrollTo(0,{y}))", isolated_context=False)
        await page.wait_for_timeout(900)
        r = await page.evaluate(f"""(() => {{ const s = document.getElementById('{sid}'); const m = s.querySelector('.d3__measure'); const st = s.querySelector('.chapter__stage');
          return {{ sy: scrollY, stage: st.className, stageRect: st.getBoundingClientRect().toJSON(), box: m && m.style.display, svgKids: m && m.querySelector('svg').innerHTML.length,
            hline: m && m.querySelector('line')?.outerHTML, sheet: s.querySelector('.d3__sheet').className, z: s.style.zIndex }}; }})()""", isolated_context=False)
        r2 = await page.evaluate("(() => { const m = document.querySelector('#sheet-03 .d3__measure'); const cs = getComputedStyle(m); const sv = getComputedStyle(m.querySelector('svg')); const e = document.elementFromPoint(195, 78); return { vis: cs.visibility, op: cs.opacity, disp: cs.display, svgW: sv.width, svgH: sv.height, svgVis: sv.visibility, top: e && (e.className.baseVal ?? e.className) + ' / ' + e.tagName }; })()", isolated_context=False)
        print(json.dumps(r, indent=1), json.dumps(r2))
        await page.screenshot(path="tools/shots/d1/probe.png")
        await b.close()
with BrowserLock():
    asyncio.run(main())

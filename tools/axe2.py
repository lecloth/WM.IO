"""Take 2: axe-core (WCAG 2.1 A/AA) at each page-1 stop, plus page 1's real length in screens.
  python -I tools/axe2.py --size 384x734 [--dark] [--reduced]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""
AXE = """window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
  .then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 4).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').replace(/\\s+/g, ' ').slice(0, 200)) })))"""

async def main(a):
    from patchright.async_api import async_playwright
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": w, "height": h})
        if w < 1024: kw.update(is_mobile=True, has_touch=True)
        if a.reduced: kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(**kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page(); ev = lambda js, arg=None: page.evaluate(js, arg, isolated_context=False)
        await page.goto("http://127.0.0.1:8109/?first&nosnap", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)   # reduced motion: the still gate
        await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(800)
        await ev("new Promise(r => { const s = document.createElement('script'); s.src = 'vendor/axe.min.js'; s.onload = r; document.head.appendChild(s); })")
        length = await ev("document.getElementById('page-01').offsetHeight / innerHeight")
        total = await ev("document.documentElement.scrollHeight / innerHeight")
        out = {"size": a.size, "dark": a.dark, "reduced": a.reduced, "page1_screens": round(length, 2), "whole_page_screens": round(total, 2), "stops": {}}
        stops = (await ev("window.__p1.stops")) if not a.reduced else {"all": None}
        if not a.reduced:   # page 1's real length: scroll from its top until page 2 has fully arrived (the dive done), plus the first screen
            out["page1_viewports_until_page2"] = round(await ev("(window.__p1.yAt(window.__p1.scroll) - window.__p1.top()) / innerHeight + 1"), 2)
        top = await ev("document.getElementById('page-01').offsetTop")
        for k, p in stops.items():
            if p is not None: await ev(GOTO_JS, p); await page.wait_for_timeout(1200)
            out["stops"][k] = await ev(AXE)
        await b.close()
    print(json.dumps(out, indent=1))

ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734"); ap.add_argument("--dark", action="store_true"); ap.add_argument("--reduced", action="store_true")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

"""axe-core WCAG 2.1 AA check of the whole page (site/vendor/axe.min.js, the copy sheet 09 uses).
  python -I tools/axe.py [--dark] [--reduced] [--mobile] [--at Y]
Full motion: scrolls to Y (default: the sheet 09 reading moment) and runs axe on the document, like sheet 09 does.
Reduced motion: every sheet is static and on the page, so axe sees all of the text at once."""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dark", action="store_true"); ap.add_argument("--reduced", action="store_true"); ap.add_argument("--mobile", action="store_true")
    ap.add_argument("--at", type=int, default=-1)
    a = ap.parse_args()
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": 1440, "height": 900})
        if a.reduced: kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(**kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page()
        await page.goto("http://127.0.0.1:8108/", wait_until="load")
        ev = lambda js: page.evaluate(js, isolated_context=False)
        for _ in range(60):
            if await ev("document.documentElement.dataset.phase === 'ready' || document.documentElement.dataset.motion === 'reduce'"): break
            await page.wait_for_timeout(200)
        await page.wait_for_timeout(1000)
        if not a.reduced:
            y = a.at if a.at >= 0 else await ev("(() => { const s = document.getElementById('sheet-09'); return Math.round(s.getBoundingClientRect().top + scrollY - innerHeight + 1.8 * innerHeight); })()")
            await ev(f"(window.__engine.lenis.scrollTo({y},{{immediate:true, force:true}}), window.scrollTo(0,{y}))")
            await page.wait_for_timeout(1500)
        await page.wait_for_timeout(4000)   # let the page's own run (sheet 09) finish first
        await ev("new Promise(r => { if (window.axe) return r(); const s = document.createElement('script'); s.src = 'vendor/axe.min.js'; s.onload = r; document.head.appendChild(s); })")
        res = await ev("""window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
            .then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length,
                nodes: v.nodes.slice(0, 8).map(n => ({ t: n.target.join(' '), s: (n.failureSummary || '').replace(/\\s+/g, ' ').slice(0, 260) })) })))""")
        shown = await ev("document.querySelector('tr[data-k=\"a11y\"] td')?.textContent")
        own = await ev("window.__axe ? window.__axe.violations.map(v => v.id + ' x' + v.nodes.length + ': ' + v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').replace(/s+/g, ' ').slice(0, 220)).join(' | ')) : null")
        await b.close()
    print(json.dumps({"dark": a.dark, "reduced": a.reduced, "mobile": a.mobile, "violations": res, "sheet09_cell": shown, "sheet09_own_run": own}, indent=1))


if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main())

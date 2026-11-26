"""axe-core (WCAG 2.1 A/AA) on the gate (Part 5 "The name, the top bar and the title block"): the arrival's end state
(the sentence, the beacon, the second line, the top bar), at sizes and themes; plus reduced motion's gate.
  python -I tools/gateaxe.py [--sizes 384x734@2.8125,1440x900] [--reduced]"""
import asyncio, sys, json, argparse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default="384x734@2.8125,1440x900"); ap.add_argument("--reduced", action="store_true"); a = ap.parse_args()
AXE = """window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
  .then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })))"""
async def main():
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        for s in a.sizes.split(","):
            wh, _, d = s.partition("@"); w, h = map(int, wh.split("x"))
            for theme in ("light", "dark"):
                ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=float(d or 1), is_mobile=w < 1024, has_touch=w < 1024, reduced_motion="reduce" if a.reduced else "no-preference")
                if theme == "dark": await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
                pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
                await pg.goto("http://127.0.0.1:8109/?first")
                await pg.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=30000)
                if not a.reduced: await pg.evaluate("window.__arrival.skip()", isolated_context=False)
                await pg.wait_for_timeout(600)
                await pg.evaluate("new Promise(r => { const s = document.createElement('script'); s.src = 'vendor/axe.min.js'; s.onload = r; document.head.appendChild(s); })", isolated_context=False)
                v = await pg.evaluate(AXE, isolated_context=False)
                print(json.dumps({"size": s, "theme": theme, "reduced": a.reduced, "violations": sum(x["n"] for x in v), "detail": v, "errors": errs or "none"}), flush=True)
                await ctx.close()
        await b.close()
with BrowserLock(): asyncio.run(main())

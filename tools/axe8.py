"""Round 8: axe-core (WCAG 2.1 A/AA) at every stop of the whole page (window.__t2stops: page 1, the hallway, the stubs,
the final room, the spec sheet), plus the page's length in screens (page 1 with the hallway, and the whole page).
  python -I tools/axe8.py --size 384x734 [--dark] [--reduced]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from browserlock import BrowserLock
AXE = r"""window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
  .then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 160)) })))"""
GOTO = """async (y) => { const e = window.__t2.engine; if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""
async def main(a):
    from patchright.async_api import async_playwright
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": w, "height": h}, reduced_motion="reduce" if a.reduced else "no-preference")
        if w < 1024: kw.update(is_mobile=True, has_touch=True, device_scale_factor=2)
        ctx = await b.new_context(**kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page(); ev = lambda js, arg=None: page.evaluate(js, arg, isolated_context=False); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000); await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await page.wait_for_timeout(1500)
        await ev("new Promise(r => { const s = document.createElement('script'); s.src = 'vendor/axe.min.js'; s.onload = r; document.head.appendChild(s); })")
        out = {"size": a.size, "dark": a.dark, "reduced": a.reduced,
               "page1_with_hallway_screens": round(await ev("document.getElementById('page-01').offsetHeight / innerHeight"), 2),
               "whole_page_screens": round(await ev("document.documentElement.scrollHeight / innerHeight"), 2),
               "final_room_screens": round(await ev("(document.getElementById('page-08').offsetTop - document.getElementById('page-07').offsetTop) / innerHeight"), 2),
               "stops": {}}
        stops = await ev("window.__t2stops()")
        n = 0
        for s in stops:
            await ev(GOTO, s["y"]); await page.wait_for_timeout(900)
            v = await ev(AXE); out["stops"][s["name"]] = v; n += sum(x["n"] for x in v)
        out["violations"] = n; out["console_errors"] = errs
        await b.close()
    print(json.dumps(out, indent=1))
    print(f"AXE {a.size}{' dark' if a.dark else ''}{' reduced' if a.reduced else ''}: {n} violations over {len(stops)} stops; console errors {len(errs)}")

ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734"); ap.add_argument("--dark", action="store_true"); ap.add_argument("--reduced", action="store_true")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

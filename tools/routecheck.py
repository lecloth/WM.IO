"""The arrival's routes at every size (Part 5 "The name, the top bar and the title block"): every straight run of the
line's three routes (strip -> sentence, stop -> beacon, beacon -> title block, and the replay's title block -> sentence)
on a grid line; the title block's cells and the top bar's boxes on whole cells, no text clipped. Light and dark.
  python -I tools/routecheck.py [--sizes ...]"""
import asyncio, sys, json, argparse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"
ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); a = ap.parse_args()
CELLS = """() => { const u = window.__grid.u, f = (v) => +(Math.abs(v / u - Math.round(v / u))).toFixed(3);
  const tb = [...document.querySelectorAll('.titleblock > *')].filter((c) => getComputedStyle(c).display !== 'none').map((c) => { const r = c.getBoundingClientRect(); return { k: c.className.split(' ').pop(), off: Math.max(f(r.left), f(r.width), f(r.top)), clipped: [...c.querySelectorAll('.tb__v')].some((v) => v.scrollWidth > v.clientWidth + 0.5) }; });
  const st = [...document.querySelectorAll('.strip__seg, .strip__cut')].map((c) => { const r = c.getBoundingClientRect(); return { off: Math.max(f(r.left), f(r.width)), clipped: [...c.querySelectorAll('a > span')].some((v) => v.getBoundingClientRect().right > r.right + 0.5) }; });
  return { tbOff: Math.max(...tb.map((c) => c.off)), tbClipped: tb.filter((c) => c.clipped).map((c) => c.k), stripOff: Math.max(...st.map((c) => c.off)), stripClipped: st.filter((c) => c.clipped).length, cells: tb.map((c) => c.k) }; }"""
async def main():
    from patchright.async_api import async_playwright
    bad = 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        for s in a.sizes.split(","):
            wh, _, d = s.partition("@"); w, h = map(int, wh.split("x"))
            for theme in ("light", "dark"):
                ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=float(d or 1), is_mobile=w < 1024, has_touch=w < 1024)
                if theme == "dark": await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
                pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
                await pg.goto("http://127.0.0.1:8109/?first")
                await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'run'", timeout=30000)
                r1 = await pg.evaluate("window.__arrival.report()", isolated_context=False)
                await pg.evaluate("window.__arrival.skip()", isolated_context=False); await pg.wait_for_timeout(200)
                await pg.evaluate("window.__arrival.enter()", isolated_context=False)
                await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await pg.wait_for_timeout(600)
                c = await pg.evaluate(CELLS, isolated_context=False)
                # the replay's route (title block -> sentence)
                await pg.evaluate("(() => { const e = window.__t2.engine; e.lenis.scrollTo(innerHeight * 2, { immediate: true, force: true }); })()", isolated_context=False); await pg.wait_for_timeout(500)
                await pg.evaluate("(() => { const e = window.__t2.engine; e.lenis.scrollTo(0, { immediate: true, force: true }); })()", isolated_context=False)
                await pg.wait_for_function("window.__arrival.state() === 'run'", timeout=8000)
                r2 = await pg.evaluate("window.__arrival.report()", isolated_context=False)
                off = max(r1["offGrid"], r2["offGrid"])
                ok = off < 0.5 and c["tbOff"] < 0.01 and c["stripOff"] < 0.01 and not c["tbClipped"] and not c["stripClipped"] and not errs
                bad += 0 if ok else 1
                print(json.dumps({"size": s, "theme": theme, "ok": ok, "routeOffPx": off, "runs": r1["runs"] + r2["runs"], **c, "errors": errs or "none"}), flush=True)
                await ctx.close()
        await b.close()
    print("ROUTECHECK failures:", bad)
with BrowserLock(): asyncio.run(main())

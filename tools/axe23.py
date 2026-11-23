"""Pages 2-3: axe-core (WCAG 2.1 A/AA) at every stop of tools/p23.py, plus emulated frame times per segment.
  python -I tools/axe23.py --size 384x734 [--dark] [--reduced] [--fps]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from browserlock import BrowserLock
src = open(Path(__file__).resolve().parent / "p23.py", encoding="utf-8").read().split("async def run")[0].replace("from browserlock import BrowserLock", "")
NS = {"__file__": "p23.py"}; exec(src, NS)
AXE = r"""window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
  .then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 160)) })))"""
RUN = """async ([ya, yb, secs]) => { const e = window.__t2.engine; const t = []; let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; const k = (now - t0) / (secs * 1000);
    const y = ya + (yb - ya) * (k < .5 ? k * 2 : 2 - k * 2); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const so = [...t].sort((x, y) => x - y), sum = t.reduce((x, y) => x + y, 0);
  return { fps: +(1000 * t.length / sum).toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), frames: t.length }; }"""
async def main(a):
    from patchright.async_api import async_playwright
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": w, "height": h}, reduced_motion="reduce" if a.reduced else "no-preference")
        if w < 1024: kw.update(is_mobile=True, has_touch=True, device_scale_factor=2.8125 if a.fps else 2)
        ctx = await b.new_context(**kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page(); ev = lambda js, arg=None: page.evaluate(js, arg, isolated_context=False); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000); await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await page.wait_for_timeout(1500)
        if a.fps:
            yA = await ev("window.__p1.yAt(4.0)"); segs = {}
            for k in ["P2", "SLIP", "TAIL", "PIN", "P4"]: segs[k] = await ev(NS["Y_JS"], k)
            for name, (y0, y1) in {"the dot dive into page 2": (yA, segs["P2"]), "page 2 rows -> slip": (segs["P2"], segs["SLIP"]), "the slip": (segs["SLIP"], segs["TAIL"]), "detail B into page 4": (segs["TAIL"], segs["P4"])}.items():
                print(a.size, name, json.dumps(await ev(RUN, [y0, y1, 4])), flush=True)
            await ev("() => ['web','app','mess'].forEach((id) => window.__p23.tick(id))"); await page.wait_for_timeout(800)
            y0 = await ev(NS["Y_JS"], "P2"); y1 = await ev(NS["Y_JS"], "SLIP")
            print(a.size, "page 2 with answers open + stuck head", json.dumps(await ev(RUN, [y0, y1, 4])), flush=True)
        else:
            await ev("new Promise(r => { const s = document.createElement('script'); s.src = 'vendor/axe.min.js'; s.onload = r; document.head.appendChild(s); })")
            out = {}
            for stop in [s for s in NS["STOPS"] if not (a.reduced and s in ("PIN", "CALLOUT"))]:
                if stop == "TAP2": await ev("() => { window.__p23.tick('web'); window.__p23.tick('app'); }")
                if stop == "FULL": await ev(NS["FILL_JS"])
                y = await ev(NS["Y_JS"], stop); await ev(NS["GOTO_JS"], y); await page.wait_for_timeout(1000)
                out[stop] = await ev(AXE)
            bad = {k: v for k, v in out.items() if v}
            print(a.size, "dark" if a.dark else "light", "reduced" if a.reduced else "", "axe violations:", json.dumps(bad) if bad else 0)
        print("console:", errs or "none")
        await b.close()
ap = argparse.ArgumentParser(); ap.add_argument("--size", default="384x734"); ap.add_argument("--dark", action="store_true"); ap.add_argument("--reduced", action="store_true"); ap.add_argument("--fps", action="store_true")
with BrowserLock(): asyncio.run(main(ap.parse_args()))

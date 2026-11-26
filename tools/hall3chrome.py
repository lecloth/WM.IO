"""SUPERSEDED in pass 3b by tools/stagechrome.py (frame 5's show is scroll-driven now; this tool waits on the old timed show).
Hallway pass 3: frame 5's show in a REAL (headed) Chrome window on this laptop: fps at LIT, during the scribble, through
the whole show (the phones lift out and turn, 8.3 s, standing still) and after it; one shot of the fronts.
  python -I tools/hall3chrome.py tools/shots/hall-p3/f5 2160 1147 1.333   (out, width, height, dpr; phone sizes emulate a phone)"""
import asyncio, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
OUT = sys.argv[1]; w, h, dpr = int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])
GO = """async (p) => { const p1 = window.__p1, e = window.__t2.engine; e.lenis ? e.lenis.scrollTo(p1.yAt(p), { immediate: true, force: true }) : scrollTo(0, p1.yAt(p));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); }"""
COUNT = """(ms) => new Promise((res) => { const t = [], t0 = performance.now(); (function f(now) { t.push(now); if (now - t0 < ms) requestAnimationFrame(f); else { const d = t.slice(1).map((x, i) => x - t[i]); const s = d.slice().sort((a, b) => a - b);
  res({ fps: +(1000 * d.length / d.reduce((a, b) => a + b, 0)).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), worst: +s[s.length - 1].toFixed(1), over20: d.filter((x) => x > 20).length, e: window.__p1.diveApi.seq().e }); } })(t0); })"""
async def main():
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=False, args=["--ignore-gpu-blocklist", f"--window-size={w + 16},{h + 140}"])
        ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, is_mobile=w < 1024, has_touch=w < 1024)
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type in ("error",) and errs.append(m.text[:200]))
        await pg.goto("http://127.0.0.1:8109/?first"); await pg.wait_for_function("document.documentElement.dataset.phase === 'gate'"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250); await pg.keyboard.press("Enter")
        await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'"); await pg.wait_for_timeout(800)
        gpu = await pg.evaluate("() => { const gl = window.__p1.diveApi.renderer().getContext(); const x = gl.getExtension('WEBGL_debug_renderer_info'); return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : ''; }", isolated_context=False)
        st = await pg.evaluate("() => window.__p1.stops", isolated_context=False)
        await pg.evaluate(GO, st["LIT"], isolated_context=False); await pg.wait_for_timeout(4000)
        lit = await pg.evaluate(COUNT, 1500, isolated_context=False)
        await pg.evaluate(GO, st["F5"] - 0.25, isolated_context=False); await pg.wait_for_timeout(600)
        scr = await pg.evaluate(COUNT, 1000, isolated_context=False)
        await pg.evaluate(GO, st["F5"], isolated_context=False)
        show = await pg.evaluate(COUNT, 8300, isolated_context=False)
        after = await pg.evaluate(COUNT, 1000, isolated_context=False)
        await pg.screenshot(path=f"{OUT}/{w}x{h}_real_fronts.png")
        print(json.dumps({"size": f"{w}x{h}@{dpr}", "gpu": gpu, "lit": lit, "scribble": scr, "show (lift + turn, 8.3 s)": show, "after": after, "errors": errs or "none"}))
        await b.close()
with BrowserLock(): asyncio.run(main())

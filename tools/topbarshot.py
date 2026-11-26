"""The arrival, the tap, the title block and the top bar (Part 5 "The name, the top bar and the title block"), headless:
shots of the gate at moments of the arrival, after a tap mid-arrival, entered (the title block's mark cell), scrolled
back to the very top (the replay), and the shortcut's jump; plus what the arrival reports (window.__arrival).
  python -I tools/topbarshot.py tools/shots/topbar --sizes 384x734@2.8125,1440x900 [--themes light,dark] [--plain]
  --plain: only the gate and the entered page (works before the arrival exists)"""
import asyncio, sys, json, argparse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("--sizes", default="384x734@2.8125,1440x900"); ap.add_argument("--themes", default="light")
ap.add_argument("--plain", action="store_true"); ap.add_argument("--real", action="store_true"); ap.add_argument("--reduced", action="store_true"); a = ap.parse_args()
OUT = Path(a.out); OUT.mkdir(parents=True, exist_ok=True)
FPS = """() => { const t = window.__fr, d = t.slice(1).map((x, i) => x - t[i]), s = d.slice().sort((a, b) => a - b);
  return d.length ? { fps: +(1000 * d.length / d.reduce((a, b) => a + b, 0)).toFixed(1), worst: +s[s.length - 1].toFixed(1), over20: d.filter((x) => x > 20).length, frames: d.length } : null; }"""
def size(s):
    wh, _, d = s.partition("@"); w, h = wh.split("x"); return int(w), int(h), float(d or 1)
async def run(pw, w, h, dpr, theme):
    rep = {"size": f"{w}x{h}@{dpr}", "theme": theme, "browser": "real Chrome" if a.real else "headless"}
    import tempfile, shutil
    prof = tempfile.mkdtemp(prefix="topbar-prof-") if a.real else None
    if a.real:
        # real (headed) Chrome; the size and density set on its own DevTools session (no key presses to the desktop)
        b = None; ctx = await pw.chromium.launch_persistent_context(prof, channel="chrome", headless=False, no_viewport=True,
            args=["--start-maximized", "--no-first-run", "--no-default-browser-check", "--disable-session-crashed-bubble"])
    else:
        b = await pw.chromium.launch(headless=True, args=["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
    try:
        if not a.real: ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, is_mobile=w < 1024, has_touch=w < 1024, reduced_motion="reduce" if a.reduced else "no-preference")
        if theme == "dark": await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        pg = (ctx.pages[0] if a.real and ctx.pages else await ctx.new_page()); errs = []
        if a.real:
            cdp = await ctx.new_cdp_session(pg)
            await cdp.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": dpr, "mobile": w < 1024})
            if w < 1024: await cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 5})
        # fps during the arrival and going home: every frame's time from the start
        await ctx.add_init_script("window.__fr = []; (function f(t) { window.__fr.push(t); requestAnimationFrame(f); })(performance.now());")
        pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
        tag = f"{w}x{h}_{theme}" + ("_reduced" if a.reduced else "")
        shot = lambda n: pg.screenshot(path=str(OUT / f"{tag}_{n}.png"))
        await pg.goto("http://127.0.0.1:8109/?first")
        await pg.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=30000)
        if a.plain:
            await pg.wait_for_timeout(1500); await shot("gate")
            await pg.mouse.click(w * 0.3, h * 0.3); await pg.wait_for_timeout(300)   # (the first tap skips the arrival)
        else:
            arr = "window.__arrival"
            await pg.wait_for_function(f"{arr} && {arr}.state() !== 'idle'", timeout=15000)
            await pg.evaluate("window.__fr = []", isolated_context=False)
            await pg.wait_for_function(f"{arr}.state() === 'gate'", timeout=15000)
            rep["fps_arrival"] = await pg.evaluate(FPS, isolated_context=False)
            for t in [0.15, 0.5, 0.9, 1.4, 2.0, 2.6, 3.1]:
                await pg.evaluate(f"{arr}.hold({t})", isolated_context=False); await pg.wait_for_timeout(120); await shot(f"arrive_{t:.2f}")
            rep["arrival"] = await pg.evaluate(f"{arr}.report()", isolated_context=False)
            await pg.evaluate(f"{arr}.hold(null)", isolated_context=False)
            # a tap mid-arrival: straight to the end
            await pg.evaluate(f"{arr}.restart()", isolated_context=False); await pg.wait_for_timeout(1300)
            await pg.mouse.click(w * 0.3, h * 0.3); await pg.wait_for_timeout(250)
            rep["after_tap"] = await pg.evaluate(f"{arr}.report()", isolated_context=False); await shot("tap_mid")
        if not a.plain: await pg.evaluate("window.__fr = []", isolated_context=False)
        await pg.mouse.click(w * 0.3, h * 0.3)
        await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        if not a.plain: rep["fps_home"] = await pg.evaluate(FPS, isolated_context=False)
        await pg.wait_for_timeout(1800); await shot("entered")
        rep["titleblock"] = await pg.evaluate("""() => [...document.querySelectorAll('.titleblock > *')].filter((c) => c.getClientRects().length && getComputedStyle(c).display !== 'none').map((c) => { const r = c.getBoundingClientRect(), u = window.__grid.u; return { cls: c.className, l: +(r.left / u).toFixed(2), w: +(r.width / u).toFixed(2), t: +(r.top / u).toFixed(2), h: +(r.height / u).toFixed(2), text: c.textContent.trim().slice(0, 30), clipped: [...c.querySelectorAll('.tb__v')].some((v) => v.scrollWidth > v.clientWidth + 0.5) }; })""", isolated_context=False)
        rep["grid"] = await pg.evaluate("({ sb: window.__grid.sb, W: window.__grid.W, u: window.__grid.u, n: window.__grid.n, iw: innerWidth, cw: document.documentElement.clientWidth, vv: visualViewport.width })", isolated_context=False)
        rep["strip"] = await pg.evaluate("""() => [...document.querySelectorAll('.strip__list > li')].map((c) => { const r = c.getBoundingClientRect(), u = window.__grid.u; return { cls: c.className.split(' ')[0], l: +(r.left / u).toFixed(2), w: +(r.width / u).toFixed(2), text: c.textContent.trim().slice(0, 24), clipped: [...c.querySelectorAll('a')].some((v) => v.scrollWidth > v.clientWidth + 0.5) }; })""", isolated_context=False)
        if not a.plain:
            # scroll away, then back to the very top: the replay
            await pg.evaluate("(async () => { const e = window.__t2.engine; e.lenis.scrollTo(innerHeight * 2, { immediate: true, force: true }); })()", isolated_context=False)
            await pg.wait_for_timeout(900)
            await pg.evaluate("(async () => { const e = window.__t2.engine; e.lenis.scrollTo(0, { duration: 0.6, force: true }); })()", isolated_context=False)
            await pg.wait_for_timeout(1400); await shot("replay_1")
            await pg.wait_for_timeout(1300); await shot("replay_2")
            await pg.wait_for_function("window.__arrival.state() === 'gate'", timeout=8000); await pg.wait_for_timeout(300); await shot("replay_end")
            rep["replay"] = await pg.evaluate(f"window.__arrival.report()", isolated_context=False)
            await pg.mouse.click(w * 0.3, h * 0.3); await pg.wait_for_timeout(600); await shot("home_mid")
            await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=8000); await pg.wait_for_timeout(500); await shot("replay_home")
            rep["replay_home"] = await pg.evaluate(f"window.__arrival.report()", isolated_context=False)
            # the shortcut's jump: shots during it
            await pg.evaluate("() => { window.__cutToChase(); }", isolated_context=False)
            for k, t in enumerate([300, 700, 1100]): await pg.wait_for_timeout(t - (0 if k == 0 else [300, 700, 1100][k - 1])); await shot(f"jump_{t}")
            await pg.wait_for_timeout(1500); await shot("jump_landed")
        rep["errors"] = errs or "none"
    finally:
        if a.real: await ctx.close(); shutil.rmtree(prof, ignore_errors=True)
        else: await b.close()
    return rep
async def main():
    from patchright.async_api import async_playwright
    out = []
    async with async_playwright() as pw:
        for s in a.sizes.split(","):
            for th in a.themes.split(","):
                w, h, d = size(s); r = await run(pw, w, h, d, th); out.append(r); print(json.dumps(r), flush=True)
    (OUT / "topbar.json").write_text(json.dumps(out, indent=1))
with BrowserLock(): asyncio.run(main())

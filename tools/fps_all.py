"""Frame rate over the WHOLE page: after the opening, scroll from the top to the end of sheet 09 with real wheel input
(desktop, through Lenis) or stepped native scrolling (mobile), record every animation frame with its scroll position,
and report fps / p95 / share of slow frames for the whole run and per sheet.
  python -I tools/fps_all.py [--mobile] [--w 1440 --h 900] [--wheel 160] [--dark]"""
import argparse, asyncio, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--mobile", action="store_true"); ap.add_argument("--dark", action="store_true")
    ap.add_argument("--w", type=int, default=1440); ap.add_argument("--h", type=int, default=900); ap.add_argument("--wheel", type=int, default=160); ap.add_argument("--from", dest="y0", type=int, default=0); ap.add_argument("--to", dest="y1", type=int, default=0)
    a = ap.parse_args()
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": a.w, "height": a.h})
        ctx = await b.new_context(device_scale_factor=1, **kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200]))
        net = {"n": 0, "bad": [], "external": []}
        def on_resp(r):
            net["n"] += 1
            if r.status not in (200, 204, 304): net["bad"].append([r.status, r.url[:140]])
        page.on("response", on_resp)
        page.on("request", lambda r: (not r.url.startswith(("http://127.0.0.1:8109/", "data:", "blob:"))) and net["external"].append(r.url[:140]))
        page.on("requestfailed", lambda r: net["bad"].append(["failed", r.url[:140]]))
        await page.goto("http://127.0.0.1:8109/", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(800)
        secs = await page.evaluate("() => [...document.querySelectorAll('section[data-sheet], #act-1')].map(e => [e.id, Math.round(e.getBoundingClientRect().top + scrollY)])")
        # stop before the loop triggers (the last 0.3 viewport of sheet 09)
        end = a.y1 or await page.evaluate("() => document.documentElement.scrollHeight - innerHeight * 1.35")
        if a.y0:
            await page.evaluate(f"() => (window.__engine.lenis.scrollTo({a.y0}, {{immediate: true, force: true}}), scrollTo(0, {a.y0}))", isolated_context=False)
            await page.wait_for_timeout(1200)
        await page.evaluate("() => { window.__fpsT = []; window.__fpsRun = true; const f = (t) => { window.__fpsT.push([t, scrollY]); if (window.__fpsRun) requestAnimationFrame(f); }; requestAnimationFrame(f); }", isolated_context=False)
        await page.mouse.move(700 if not a.mobile else 200, 450)
        t0 = time.perf_counter()
        if a.mobile:
            y = a.y0
            while y < end and time.perf_counter() - t0 < 240:
                y += 60; await page.evaluate(f"() => window.scrollTo(0, {y})"); await page.wait_for_timeout(16)
        else:
            while (await page.evaluate("() => scrollY")) < end and time.perf_counter() - t0 < 240:
                await page.mouse.wheel(0, a.wheel); await page.wait_for_timeout(40)
        await page.wait_for_timeout(1200)
        raw = await page.evaluate("() => { window.__fpsRun = false; return window.__fpsT; }", isolated_context=False)
        await b.close()
    # per-frame delta attributed to the sheet on screen; frames where the page did not move are skipped
    ids = [s[0] for s in secs]; tops = [s[1] for s in secs]
    def sheet_of(y):
        k = 0
        for i, t in enumerate(tops):
            if y >= t - (kw["viewport"]["height"] * 0.5): k = i
        return ids[k]
    per, allD, slow = {}, [], []
    for (t1, y1), (t2, y2) in zip(raw, raw[1:]):
        if y2 == y1: continue
        d = t2 - t1; allD.append(d); per.setdefault(sheet_of(y2), []).append(d)
        if d > 25: slow.append([round(d, 1), round(y1), sheet_of(y2)])
    def stats(d):
        d = sorted(d); n = len(d)
        if not n: return {}
        return {"frames": n, "fps": round(1000 / (sum(d) / n), 1), "p95ms": round(d[int(n * .95)], 1), "slowPct": round(100 * sum(1 for x in d if x > 25) / n, 1)}
    print(json.dumps({"mobile": a.mobile, "size": kw["viewport"], "reachedY": raw[-1][1] if raw else 0, "end": end, "all": stats(allD),
                      "per": {k: stats(v) for k, v in per.items()}, "slow": sorted(slow, reverse=True)[:25], "errors": errs, "network": net}, indent=1))


with BrowserLock():
    asyncio.run(main())

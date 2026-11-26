"""Pass 3b ("the scroll drives the stage"), in REAL Chrome (headed, channel chrome) on this laptop, one size per run:
  1. continuity: the story rendered at every 0.01 screen from the top to the hand-over, forwards then backwards
     (__p1.at, no lag): the biggest step of each scrubbed value (nothing pops or jumps), forwards == backwards, the
     camera still during frame 5's held show;
  2. fps: a steady scroll through page 1 and the hallway (Lenis, linear, 0.66 screens a second), per segment; then frame
     5's show scrubbed forwards and backwards (scrolled, 6 s each way);
  3. shots at the show's stops, forwards and backwards, and at page 1's scrubbed beats (the ground, the dress).
  python -I tools/stagechrome.py tools/shots/stage 2160 1147 1.333 [dark]   (phone sizes are emulated: mobile + touch)"""
import asyncio, sys, json, tempfile, shutil, base64
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
OUT = Path(sys.argv[1]); w, h, dpr = int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4]); THEME = sys.argv[5] if len(sys.argv) > 5 else "light"
OUT.mkdir(parents=True, exist_ok=True)
TAG = f"{w}x{h}_{THEME}"
GO = """async (p) => { const p1 = window.__p1, e = window.__t2.engine; e.lenis ? e.lenis.scrollTo(p1.yAt(p), { immediate: true, force: true }) : scrollTo(0, p1.yAt(p));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update();
  for (let k = 0; k < 200 && !p1.settled(); k++) await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return p1.P(); }"""
CONT = """async () => {
  const p1 = window.__p1, st = p1.stops, end = st.LOCK, rows = [];
  const one = (p) => { const d = p1.at(p), l = p1.look(); return { p: +p.toFixed(3), ground: p1.ground(), xray: l.xray, built: l.built, real: l.real, canvas: l.canvas,
    t: d ? d.t : null, show: d ? d.show : null, lift: d ? d.phones.lift : null, preal: d ? d.phones.real : null, y0: d ? d.phones.yaws[0] : null, y1: d ? d.phones.yaws[1] : null,
    drawn5: d && d.f5 ? d.f5.drawn : null, swing5: d && d.f5 ? d.f5.swing : null, dress: d ? d.dress : null, lights: d ? d.lights : null }; };
  const n = Math.round(end / 0.01), fw = [], bw = [];
  for (let k = 0; k <= n; k++) fw.push(one(k * 0.01));
  for (let k = n; k >= 0; k--) bw.push(one(k * 0.01));
  bw.reverse();
  const keys = ['ground', 'xray', 'built', 'real', 'canvas', 't', 'lift', 'preal', 'y0', 'y1', 'drawn5', 'swing5', 'dress', 'lights'];
  const K = window.__p1.diveApi.K ? window.__p1.diveApi.K() : 1;
  const steps = {}, mism = {};
  keys.forEach((k) => { let best = { d: 0, p: null }; let mm = 0;
    for (let i = 1; i < fw.length; i++) { const a = fw[i - 1][k], b = fw[i][k]; if (a === null || b === null) continue; const d = Math.abs(b - a); if (d > best.d) best = { d: +d.toFixed(4), p: fw[i].p }; }
    for (let i = 0; i < fw.length; i++) { const a = fw[i][k], b = bw[i][k]; if (a === null || b === null) continue; mm = Math.max(mm, Math.abs(a - b)); }
    steps[k] = best; mism[k] = +mm.toFixed(5); });
  // the camera during the held show
  const hold = fw.filter((r) => r.p >= st.F5H + 0.005 && r.p <= st.F5E - 0.005);
  const ts = hold.map((r) => r.t), camStill = ts.length ? +(Math.max(...ts) - Math.min(...ts)).toFixed(4) : null;
  const tStep = fw.filter((r) => r.p > p1.R.dive[0] + 1.3 && r.p < st.DOOR - 0.05 && !(r.p >= st.F5H && r.p <= st.F5E)).map((r, i, a) => i ? Math.abs(r.t - a[i - 1].t) : null).filter((x) => x !== null);
  const at = (p) => fw.reduce((b, r) => (Math.abs(r.p - p) < Math.abs(b.p - p) ? r : b), fw[0]);
  return { stops: st, hall: p1.hall(), steps, forwardsVsBackwards: mism, camDuringShow: camStill, walkStep: tStep.length ? { min: +Math.min(...tStep).toFixed(3), max: +Math.max(...tStep).toFixed(3) } : null,
    show: ['F5H', 'F5S', 'F5R', 'F5L', 'F5T', 'F5E', 'F5'].map((k) => ({ k, ...at(st[k]) })) };
}"""
FPS = """async ([a, b, secs]) => { const p1 = window.__p1, e = window.__t2.engine;
  e.lenis.scrollTo(p1.yAt(a), { immediate: true, force: true }); await new Promise(r => setTimeout(r, 1200));
  const fr = []; let on = true;
  (function f(now) { fr.push([now, p1.P()]); if (on) requestAnimationFrame(f); })(performance.now());
  await new Promise((res) => e.lenis.scrollTo(p1.yAt(b), { duration: secs, easing: (t) => t, force: true, onComplete: res }));
  await new Promise(r => setTimeout(r, 300)); on = false;
  return fr; }"""
def seg_stats(fr, segs):
    out = {}
    for name, a, b in segs:
        d = [fr[i][0] - fr[i - 1][0] for i in range(1, len(fr)) if a <= fr[i][1] < b]
        if not d: out[name] = None; continue
        s = sorted(d)
        slow = [(round(fr[i][0] - fr[i - 1][0], 1), round(fr[i][1], 3)) for i in range(1, len(fr)) if a <= fr[i][1] < b and fr[i][0] - fr[i - 1][0] > 20]
        out[name] = {"fps": round(1000 * len(d) / sum(d), 1), "p95": round(s[int(len(s) * 0.95)], 1), "worst": round(s[-1], 1), "over20": sum(1 for x in d if x > 20), "frames": len(d), "slow_at": slow[:6]}
    return out

async def main():
    from patchright.async_api import async_playwright
    prof = tempfile.mkdtemp(prefix="stage-prof-")
    rep = {"size": f"{w}x{h}@{dpr}", "theme": THEME}
    async with async_playwright() as pw:
        ctx = await pw.chromium.launch_persistent_context(prof, channel="chrome", headless=False, no_viewport=True,
            args=["--start-maximized", "--no-first-run", "--no-default-browser-check", "--disable-session-crashed-bubble", "--ignore-gpu-blocklist"])
        try:
            pg = ctx.pages[0] if ctx.pages else await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
            cdp = await ctx.new_cdp_session(pg)
            mobile = w < 1024
            await cdp.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": dpr, "mobile": mobile})
            if mobile: await cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 5})
            await ctx.add_init_script(f"try {{ localStorage.setItem('wm:theme', '{THEME}'); }} catch (e) {{}}")
            await pg.goto("http://127.0.0.1:8109/?first", wait_until="load")
            await pg.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=30000)
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(250); await pg.keyboard.press("Enter")
            await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=30000)
            await pg.wait_for_timeout(1200)
            rep["env"] = await pg.evaluate("({ dpr: devicePixelRatio, w: innerWidth, h: innerHeight, theme: document.documentElement.dataset.theme })")
            rep["phones"] = await pg.evaluate("window.__p1.diveApi.loadPhones()", isolated_context=False)
            await pg.wait_for_timeout(1500)
            c = await pg.evaluate(CONT, isolated_context=False)
            rep["continuity"] = c
            st = c["stops"]
            await pg.evaluate(GO, 0, isolated_context=False); await pg.wait_for_timeout(800)
            fr = await pg.evaluate(FPS, [0, st["LOCK"], st["LOCK"] / 0.66], isolated_context=False)
            R = await pg.evaluate("window.__p1.R", isolated_context=False)
            rep["fps_walk"] = seg_stats(fr, [("page 1", 0, R["dive"][0]), ("hall: sketch to frame 5", R["dive"][0], st["F5H"]), ("frame 5 show", st["F5H"], st["F5E"]), ("hall: on to the door", st["F5E"], st["LOCK"] + 0.01)])
            fr = await pg.evaluate(FPS, [0, st["LOCK"], st["LOCK"] / 0.66], isolated_context=False)
            rep["fps_walk2"] = seg_stats(fr, [("page 1", 0, R["dive"][0]), ("hall: sketch to frame 5", R["dive"][0], st["F5H"]), ("frame 5 show", st["F5H"], st["F5E"]), ("hall: on to the door", st["F5E"], st["LOCK"] + 0.01)])
            fr = await pg.evaluate(FPS, [st["F5H"] - 0.2, st["F5E"] + 0.2, 6], isolated_context=False)
            rep["fps_show_forwards"] = seg_stats(fr, [("show", st["F5H"] - 0.2, st["F5E"] + 0.21)])
            fr = await pg.evaluate(FPS, [st["F5E"] + 0.2, st["F5H"] - 0.2, 6], isolated_context=False)
            rep["fps_show_backwards"] = seg_stats(fr, [("show", st["F5H"] - 0.21, st["F5E"] + 0.2)])
            async def shot(name, p):
                await pg.evaluate(GO, p, isolated_context=False); await pg.wait_for_timeout(250)
                r = await cdp.send("Page.captureScreenshot", {"format": "png", "fromSurface": True})
                (OUT / f"{TAG}_{name}.png").write_bytes(base64.b64decode(r["data"]))
            for k in ["F5H", "F5S", "F5R", "F5L", "F5T", "F5E", "F5"]: await shot(f"fw_{k}", st[k])
            for k in ["F5T", "F5R", "F5S"]: await shot(f"bw_{k}", st[k])
            await shot("ground_mid", R["blueOn"]); await shot("dress_mid", (R["real"][0] + R["real"][1]) / 2); await shot("REAL", st["REAL"])
            rep["errors"] = errs or "none"
        finally:
            await ctx.close(); shutil.rmtree(prof, ignore_errors=True)
    (OUT / f"{TAG}.json").write_text(json.dumps(rep, indent=1))
    c = rep["continuity"]
    print(json.dumps({"size": rep["size"], "theme": THEME, "phones": rep["phones"], "hall": c["hall"], "camDuringShow": c["camDuringShow"], "walkStep": c["walkStep"],
        "steps": c["steps"], "fwVsBw": c["forwardsVsBackwards"], "show": c["show"], "fps_walk": rep["fps_walk"], "fps_walk2": rep["fps_walk2"], "fps_show_fw": rep["fps_show_forwards"], "fps_show_bw": rep["fps_show_backwards"], "errors": rep["errors"]}, indent=0))
with BrowserLock(): asyncio.run(main())

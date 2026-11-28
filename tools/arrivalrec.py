"""The arrival's first seconds on a cold load (Part 5 "The name, the top bar and the title block"; 28 Nov, the arrival
waits until the page is ready): real Chrome, a fresh profile, the cache disabled; optionally DevTools' CPU slowdown (4x)
and the network at "Fast 4G". Records every frame's time from navigation, the long tasks and the long animation frames
(with their scripts), when each resource finished, and the arrival's own moments (the hold, the run, the gate), then
reports the frame times through the arrival and what ran in its slow frames.
  python -I tools/arrivalrec.py tools/shots/arrival/rec [--sizes 2160x1147@1.333,384x734@2.8125] [--throttle] [--runs 1]
  [--tag before]"""
import asyncio, sys, json, argparse, tempfile, shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
ap = argparse.ArgumentParser(); ap.add_argument("out"); ap.add_argument("--sizes", default="2160x1147@1.333,384x734@2.8125")
ap.add_argument("--throttle", action="store_true"); ap.add_argument("--runs", type=int, default=1); ap.add_argument("--tag", default="rec")
ap.add_argument("--profile", action="store_true", help="a CPU profile (build with WM_NOMINIFY=1 for names): the functions behind the slow stretches")
ap.add_argument("--trace", action="store_true", help="a DevTools performance trace: the main thread's rendering steps in the arrival's slow frames")
ap.add_argument("--skia", action="store_true", help="with --trace: Skia's and the GPU service's own steps too")
ap.add_argument("--delay-hdr", type=int, default=0, help="hold the hero phone's HDRI back this many ms (the hold's 4 s cap: the warm-up must wait for the arrival's end state)")
ap.add_argument("--tap-hold", action="store_true", help="tap during the hold: straight to the end")
ap.add_argument("--replay", action="store_true", help="also scroll away and back to the top: the replay's frames (no hold)")
a = ap.parse_args()
OUT = Path(a.out); OUT.mkdir(parents=True, exist_ok=True)

INIT = r"""
(() => {
  const R = window.__rec = { fr: [], lt: [], loaf: [], marks: [] };
  const mark = (k) => R.marks.push([k, performance.now()]);
  (function f(t) { R.fr.push(t); requestAnimationFrame(f); })(performance.now());
  try { new PerformanceObserver((l) => l.getEntries().forEach((x) => R.lt.push({ s: x.startTime, d: x.duration,
    at: (x.attribution || []).map((y) => y.containerSrc || y.name).join(',') }))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  try { new PerformanceObserver((l) => l.getEntries().forEach((x) => { if (x.duration < 30) return; R.loaf.push({ s: x.startTime, d: x.duration, block: x.blockingDuration,
    render: x.renderStart ? x.startTime + x.duration - x.renderStart : 0, style: x.styleAndLayoutStart ? x.startTime + x.duration - x.styleAndLayoutStart : 0,
    scripts: x.scripts.map((s) => ({ d: Math.round(s.duration), inv: s.invoker, src: (s.sourceURL || '').split('/').pop() + ':' + s.sourceFunctionName + '@' + s.sourceCharPosition, fl: Math.round(s.forcedStyleAndLayoutDuration) })) }); }))
    .observe({ type: 'long-animation-frame', buffered: true }); } catch (e) {}
  document.addEventListener('wm:loaded', () => mark('wm:loaded'));
  addEventListener('load', () => mark('load'));
  document.fonts && document.fonts.ready.then(() => mark('fonts.ready'));
  // (the init script runs before <html> exists: the states are polled every frame and at 4 ms)
  let last = '';
  window.__recSync = function __recSyncMark() { const t = performance.now(); while (performance.now() - t < 3) {} return t; };
  const poll = () => { const e = document.documentElement; if (!e) return; const d = e.dataset, k = 'arrive=' + (d.arrive || '') + ' phase=' + (d.phase || '');
    if (k !== last) { last = k; mark(k); if (d.arrive === 'run' && !R.sync) { R.sync = window.__recSync(); performance.mark('recsync'); } } };
  setInterval(poll, 4); (function f() { poll(); requestAnimationFrame(f); })();
})();
"""
REPORT = r"""() => {
  const R = window.__rec, M = R.marks, at = (re) => { const m = M.find((x) => re.test(x[0])); return m ? m[1] : null; };
  const tHold = at(/arrive=hold/), tRun = at(/arrive=run/), tGate = window.__arrival && window.__arrival.t ? null : null;
  const tDone = at(/arrive=done/);
  const frames = (a, b) => { const t = R.fr.filter((x) => x >= a && x <= b), d = t.slice(1).map((x, i) => x - t[i]), s = d.slice().sort((p, q) => p - q);
    return d.length ? { fps: +(1000 * d.length / d.reduce((p, q) => p + q, 0)).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), worst: +s[s.length - 1].toFixed(1),
      over20: d.filter((x) => x > 20).length, over34: d.filter((x) => x > 34).length, frames: d.length,
      slow: t.slice(1).map((x, i) => [x, x - t[i]]).filter((p) => p[1] > 20).map((p) => ({ at: +((p[0] - a) / 1000).toFixed(3), ms: +p[1].toFixed(1) })) } : null; };
  const res = performance.getEntriesByType('resource').map((r) => ({ n: r.name.split('/').slice(-2).join('/'), start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round((r.encodedBodySize || r.transferSize || 0) / 1024) }));
  const end = tRun != null ? tRun + 4400 : performance.now();   // the run: 0.15 s still + 3.5 s + the lit lines' fade
  return { marks: M.map((m) => [m[0], Math.round(m[1])]), tHold, tRun, tDone,
    hold: tHold != null && tRun != null ? Math.round(tRun - tHold) : null,
    run: tRun != null ? frames(tRun, end) : null,
    holdFrames: tHold != null && tRun != null ? frames(tHold, tRun) : null,
    longtasks: R.lt.map((x) => ({ s: Math.round(x.s), d: Math.round(x.d), at: x.at, inRun: tRun != null && x.s + x.d > tRun && x.s < end })),
    loaf: R.loaf.filter((x) => tRun == null || (x.s + x.d > (tHold ?? tRun) - 200 && x.s < end + 1500)).map((x) => ({ ...x, s: Math.round(x.s), d: Math.round(x.d), inRun: tRun != null && x.s + x.d > tRun && x.s < end, rel: tRun != null ? Math.round(x.s - tRun) : null })),
    gate: window.__gate ? window.__gate() : null,
    resources: res.sort((p, q) => p.end - q.end) };
}"""
def summarize(P, sync, r):
    """self and total time per function in windows (ms from navigation): before the arrival, the hold, the arrival"""
    nodes = {n["id"]: n for n in P["nodes"]}; parent = {}
    for n in P["nodes"]:
        for c in n.get("children", []): parent[c] = n["id"]
    name = lambda n: f'{n["callFrame"]["functionName"] or "(anon)"} {n["callFrame"]["url"].split("/")[-1].split("?")[0]}:{n["callFrame"]["lineNumber"] + 1}'
    t = P["startTime"]; ts = []
    for d in P["timeDeltas"]: t += d; ts.append(t)
    # align: the first sample inside __recSyncMark is at performance.now() == sync
    t0 = None
    if sync is not None:
        for sid, tt in zip(P["samples"], ts):
            if nodes[sid]["callFrame"]["functionName"] == "__recSyncMark": t0 = tt - sync * 1000; break
    if t0 is None: return {"error": "no sync sample"}
    W = {"before": (0, r["tHold"] or r["tRun"]), "hold": (r["tHold"] or r["tRun"], r["tRun"]), "arrival": (r["tRun"], r["tRun"] + 4400)}
    out = {}
    for k, (a_, b_) in W.items():
        if a_ is None or b_ is None or b_ <= a_: continue
        selft, tot, idle = {}, {}, 0.0
        for i, (sid, tt) in enumerate(zip(P["samples"], ts)):
            ms = (tt - t0) / 1000
            if ms < a_ or ms > b_: continue
            dt = (ts[i + 1] - tt) / 1000 if i + 1 < len(ts) else 0.2
            n = nodes[sid]; fn = n["callFrame"]["functionName"]
            if fn in ("(idle)", "(program)"): idle += dt; continue
            selft[name(n)] = selft.get(name(n), 0) + dt
            seen = set(); x = sid
            while x is not None:
                nm = name(nodes[x])
                if nm not in seen: seen.add(nm); tot[nm] = tot.get(nm, 0) + dt
                x = parent.get(x)
        out[k] = {"window_ms": round(b_ - a_), "idle_ms": round(idle), "self": sorted(((round(v, 1), k2) for k2, v in selft.items()), reverse=True)[:25],
                  "total": sorted(((round(v, 1), k2) for k2, v in tot.items() if v > 8), reverse=True)[:60]}
    return out
def trace_summary(T, r):
    """per slow frame of the arrival: the renderer main thread's and the GPU's steps (ms), summed by name"""
    ev = T["traceEvents"] if isinstance(T, dict) else T
    sync = next((e for e in ev if e.get("name") == "recsync"), None)
    if not sync or r.get("tRun") is None: return {"error": "no sync mark"}
    t0 = sync["ts"] / 1000 - r["tRun"]
    pid = sync["pid"]; main_tid = sync["tid"]
    names = {(e["pid"], e["tid"]): e["args"].get("name") for e in ev if e.get("name") == "thread_name"}
    out = []
    for f in (r["run"] or {}).get("slow", []):
        b = r["tRun"] + f["at"] * 1000; a_ = b - f["ms"]
        agg = {}
        for e in ev:
            if e.get("ph") != "X" or "dur" not in e: continue
            s0 = e["ts"] / 1000 - t0; s1 = s0 + e["dur"] / 1000
            if s1 < a_ or s0 > b: continue
            th = names.get((e["pid"], e["tid"]), str(e["tid"]))
            if e["pid"] == pid and e["tid"] != main_tid and th not in ("Compositor",): continue
            key = f'{th}:{e["name"]}'; agg[key] = agg.get(key, 0) + (min(s1, b) - max(s0, a_))
        out.append({"at": f["at"], "ms": f["ms"], "top": sorted(((round(v, 1), k) for k, v in agg.items() if v > 3), reverse=True)[:14]})
    return out
def size(s):
    wh, _, d = s.partition("@"); w, h = wh.split("x"); return int(w), int(h), float(d or 1)

async def one(pw, w, h, dpr, k):
    prof = tempfile.mkdtemp(prefix="arrival-prof-")
    ctx = await pw.chromium.launch_persistent_context(prof, channel="chrome", headless=False, no_viewport=True,
        args=["--start-maximized", "--no-first-run", "--no-default-browser-check", "--disable-session-crashed-bubble"])
    try:
        pg = ctx.pages[0] if ctx.pages else await ctx.new_page()
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": h, "deviceScaleFactor": dpr, "mobile": w < 1024})
        if w < 1024: await cdp.send("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 5})
        await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
        if a.throttle:
            await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
            # DevTools' "Fast 4G" preset: 9 Mbps down, 1.5 Mbps up, 60 ms x 2.75 latency, each with its 0.9 / 2.75 factors
            await cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 165, "downloadThroughput": 9e6 / 8 * 0.9, "uploadThroughput": 1.5e6 / 8 * 0.9})
        await ctx.add_init_script(INIT)
        if a.delay_hdr:
            async def slow(route):
                await asyncio.sleep(a.delay_hdr / 1000); await route.continue_()
            await ctx.route("**/*.hdr", slow)
        if a.trace:
            await cdp.send("Tracing.start", {"transferMode": "ReturnAsStream", "traceConfig": {"includedCategories": ["devtools.timeline", "disabled-by-default-devtools.timeline", "blink.user_timing", "loading", "gpu", "cc", "viz", "benchmark"] + (["skia", "disabled-by-default-skia", "disabled-by-default-skia.gpu", "disabled-by-default-skia.shaders", "gpu.angle", "disabled-by-default-gpu.service"] if a.skia else []), "recordMode": "recordAsMuchAsPossible"}})
        if a.profile:
            await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", {"interval": 200}); await cdp.send("Profiler.start")
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
        await pg.goto("http://127.0.0.1:8109/?first", wait_until="commit", timeout=120000)
        if a.tap_hold:
            await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'hold'", timeout=60000, polling=10)
            await pg.wait_for_timeout(300); await pg.mouse.click(w * 0.3, h * 0.3); await pg.wait_for_timeout(100)
            r0 = await pg.evaluate("({ state: window.__arrival.state(), held: window.__arrival.held(), report: window.__arrival.report() })", isolated_context=False)
        await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'gate'", timeout=120000 if a.throttle else 40000, polling=250)
        await pg.wait_for_timeout(1500)
        r = await pg.evaluate(REPORT, isolated_context=False)
        if a.trace:
            done = asyncio.get_event_loop().create_future(); cdp.on("Tracing.tracingComplete", lambda e: done.set_result(e))
            await cdp.send("Tracing.end"); ev = await done; chunks = []
            while True:
                c = await cdp.send("IO.read", {"handle": ev["stream"], "size": 1 << 20}); chunks.append(c["data"])
                if c.get("eof"): break
            raw = "".join(chunks); (OUT / f"{a.tag}_{w}x{h}{'_thr' if a.throttle else ''}_{k}.trace.json").write_text(raw)
            r["trace"] = trace_summary(json.loads(raw), r)
        if a.profile:
            prof_ = (await cdp.send("Profiler.stop"))["profile"]; r["profile"] = summarize(prof_, await pg.evaluate("window.__rec.sync || null", isolated_context=False), r)
        if a.replay:
            await pg.mouse.click(w * 0.3, h * 0.3); await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=30000)
            await pg.wait_for_timeout(1500)
            await pg.evaluate("window.__t2.engine.lenis.scrollTo(innerHeight * 2, { immediate: true, force: true })", isolated_context=False); await pg.wait_for_timeout(900)
            await pg.evaluate("window.__rec.marks = []; window.__t2.engine.lenis.scrollTo(0, { duration: 0.6, force: true })", isolated_context=False)
            await pg.wait_for_function("window.__arrival.state() === 'run'", timeout=8000)
            await pg.wait_for_function("window.__arrival.state() === 'gate'", timeout=15000); await pg.wait_for_timeout(300)
            r["replay"] = await pg.evaluate(REPORT, isolated_context=False)
        r["held"] = await pg.evaluate("window.__arrival.held()", isolated_context=False)
        r["warmed"] = await pg.evaluate("window.__wm.warmed ? Math.round(window.__wm.warmed) : null", isolated_context=False)
        if a.tap_hold: r["tap_hold"] = r0
        r["errors"] = errs; r["size"] = f"{w}x{h}@{dpr}"; r["throttle"] = a.throttle
        return r
    finally:
        await ctx.close(); shutil.rmtree(prof, ignore_errors=True)

async def main():
    from patchright.async_api import async_playwright
    allr = []
    async with async_playwright() as pw:
        for s in a.sizes.split(","):
            w, h, dpr = size(s)
            for k in range(a.runs):
                r = await one(pw, w, h, dpr, k); allr.append(r)
                tag = f"{a.tag}_{w}x{h}{'_thr' if a.throttle else ''}_{k}"
                (OUT / f"{tag}.json").write_text(json.dumps(r, indent=1))
                run = r["run"] or {}
                print(f"{tag}: held {r.get('held')}; warm-up done at {r.get('warmed')} ms (the arrival ran {r['tRun']} to {round(r['tRun'] + 4400) if r['tRun'] else None}); " + (f"tap in the hold -> {r['tap_hold']['state']} {r['tap_hold']['report']['strip']} hello {r['tap_hold']['report']['hello']}; " if r.get('tap_hold') else "") + f"hold {r['hold']} ms; arrival fps {run.get('fps')} p95 {run.get('p95')} worst {run.get('worst')} >20ms {run.get('over20')} >34ms {run.get('over34')} of {run.get('frames')}; long tasks in the arrival {sum(1 for x in r['longtasks'] if x['inRun'])}; errors {len(r['errors'])}")
                for x in r["loaf"]:
                    if x["inRun"]: print(f"   LoAF +{x['rel']} ms {x['d']} ms (render {round(x['render'])}, style {round(x['style'])}): " + "; ".join(f"{s['d']}ms {s['inv']} {s['src']}" for s in x["scripts"][:4]))
                if a.replay and r.get("replay"):
                    rr = r["replay"]["run"] or {}; print(f"   replay: hold {r['replay']['hold']}; fps {rr.get('fps')} worst {rr.get('worst')} >20ms {rr.get('over20')}")
    return allr
with BrowserLock(): asyncio.run(main())

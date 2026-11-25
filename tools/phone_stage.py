"""The light check of one finishing stage on Wajih's real phone (round 8b onwards; adb + CDP, ONE tab of our own, never
lists or reads other tabs). Per stage: fps while scrolling each of that stage's segments (two passes), real thumb swipes
through its pages (adb input swipe; the page's scroll and the scene sampled every frame after release: any pull-back,
skip or jump), reduced motion (emulated on the phone's Chrome) with shots, shots of its stops, console errors.
  python -I tools/phone_stage.py --serial 192.168.1.32:45239 --stage 8b [--out tools/shots/r8b/phone]
Setup: adb reverse tcp:8109 tcp:8109 ; adb forward tcp:9222 localabstract:chrome_devtools_remote
Segments are [name, kind, a, b]: kind 'p' = page 1's scroll positions in screens (window.__p1.yAt); '#id' = screens from
that element's top."""
import argparse, asyncio, base64, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import websockets
from phone import CDP
_src = (Path(__file__).resolve().parent / "phonep23.py").read_text(encoding="utf-8")
SCROLL_RUN = _src.split('SCROLL_RUN = """')[1].split('"""')[0]
GOTO_Y = _src.split('GOTO_Y = """')[1].split('"""')[0]
def adb(serial, *a): return subprocess.run(["adb", "-s", serial, *a], capture_output=True, text=True).stdout
TRACE = """(secs) => { window.__trace = []; const t0 = performance.now(); const end = t0 + secs * 1000;
  (function f(now) { window.__trace.push([+(now - t0).toFixed(1), +scrollY.toFixed(2), +(window.__scene?.() ?? window.__p1?.P?.() ?? 0).toFixed(5)]); if (now < end) requestAnimationFrame(f); })(t0); return true; }"""

STAGES = {
  "8b": {
    "segs": [["the way in, dress, opening line", "p", 4.62, 5.6], ["the walk: frames 1-2", "p", 5.6, 6.95], ["the walk: frames 3-4", "p", 6.95, 8.1],
             ["the walk: frame 5, the phones turn", "p", 8.1, 8.95], ["the walk up to the lock", "p", 8.95, 9.84], ["the final room", "#page-07", 0, 2.2]],
    "swipe_from": ["p", 5.9], "stops": [["p", k] for k in ["OPEN", "F1", "F2", "F3", "F4", "F5", "F5B", "DOOR", "LOCK"]] + [["#page-07", 0], ["#page-07", 1], ["#page-07", 2]],
    "reduced": ["#page-02", "#page-07", "#slip-when"],
  },
  "9": {
    "segs": [["into the lock: X-ray, keyhole", "#page-03", 0, 1.6], ["the pins, out, the lattice", "#page-03", 1.6, 3.2], ["the wave, the fold", "#page-03", 3.2, 4.6]],
    "swipe_from": ["#page-03", 0.2], "stops": [["#page-03", x] for x in [0, 0.4, 0.9, 1.4, 2.0, 2.6, 3.2, 3.8, 4.4]], "reduced": ["#page-03"],
  },
  "10": {
    "segs": [["how we work: the cutaway turns, the wrong key", "#page-04", 0, 1.4], ["the pick: seven pins", "#page-04", 1.4, 3.6]],
    "swipe_from": ["#page-04", 0.2], "stops": [["#page-04", x] for x in [0, 0.5, 1.0, 1.4, 1.8, 2.2, 2.6, 3.0, 3.4, 3.8]], "reduced": ["#page-04"],
  },
  "11": {
    "segs": [["trips: AI", "#page-05", 0, 2.4], ["trips: websites", "#page-05", 2.4, 4.8], ["trips: apps", "#page-05", 4.8, 7.2], ["team", "#page-06", 0, 1], ["spec sheet", "#page-08", 0, 1]],
    "swipe_from": ["#page-05", 0.2], "stops": [["#page-05", x] for x in [0, 0.6, 1.2, 1.8, 2.6, 3.2, 3.8, 4.4, 5.0, 5.6, 6.2, 6.8]] + [["#page-06", 0], ["#page-08", 0], ["#page-08", 0.6]],
    "reduced": ["#page-05", "#page-06", "#page-08"],
  },
}

async def main(a):
    cfg = STAGES[a.stage]
    out = Path(a.out or f"tools/shots/r{a.stage}/phone"); out.mkdir(parents=True, exist_ok=True); S = a.serial
    adb(S, "reverse", "tcp:8109", "tcp:8109"); adb(S, "forward", "tcp:9222", "localabstract:chrome_devtools_remote")
    adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")
    adb(S, "shell", "am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main"); await asyncio.sleep(1.5)
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    rep = {"stage": a.stage, "fps": {}, "swipes": []}
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws); J = lambda js: c.eval(f"JSON.stringify({js})")
            async def shot(name):
                r = await c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 82}); (out / f"{name}.jpg").write_bytes(base64.b64decode(r["data"])); print("shot", name, flush=True)
            async def ypos(kind, v):
                if kind == "p": return await c.eval(f"window.__p1.yAt({v})" if not isinstance(v, str) else f"window.__p1.yAt(window.__p1.stops['{v}'])")
                return await c.eval(f"(() => {{ const e = document.querySelector('{kind}'); let y = 0; for (let n = e; n; n = n.offsetParent) y += n.offsetTop; return Math.round(y + {v} * innerHeight); }})()")
            async def open_site(reduced=False):
                await c.call("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-reduced-motion", "value": "reduce" if reduced else ""}]})
                await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first"})
                for _ in range(120):
                    await asyncio.sleep(0.25)
                    try:
                        if await c.eval("document.documentElement.dataset.phase") == "gate": break
                    except Exception: pass
                await c.eval("window.__errs = []; addEventListener('error', (e) => __errs.push(String(e.message))); addEventListener('unhandledrejection', (e) => __errs.push(String(e.reason))); "
                             "const _e = console.error.bind(console); console.error = (...x) => { __errs.push(x.map(String).join(' ')); _e(...x); }; true")
                g = json.loads(await J("{ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height }"))
                top_px = round((g["sh"] - g["h"]) * g["dpr"]); dev = lambda x, y: (str(round(x * g["dpr"])), str(round(top_px + y * g["dpr"])))
                adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP"); await asyncio.sleep(0.6)
                for _ in range(4):
                    adb(S, "shell", "input", "tap", *dev(g["w"] / 2, g["h"] / 2))
                    for _ in range(40):
                        if await c.eval("document.documentElement.dataset.phase") == "ready": break
                        await asyncio.sleep(0.1)
                    if await c.eval("document.documentElement.dataset.phase") == "ready": break
                if await c.eval("document.documentElement.dataset.phase") != "ready": raise SystemExit("the gate did not open: stopping (results would be invalid)")
                await asyncio.sleep(2.0)
                return g, top_px, dev
            await c.call("Runtime.enable")
            g, top_px, dev = await open_site(False); rep["viewport"] = g; print("viewport", g, flush=True)
            rep["chrome_reduced_motion"] = await c.eval("matchMedia('(prefers-reduced-motion: reduce)').matches")
            for rnd in ("first pass", "second pass"):
                for name, kind, p0, p1 in cfg["segs"]:
                    y0 = await ypos(kind, p0); y1 = await ypos(kind, p1)
                    await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.8)
                    r = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=60))
                    rep["fps"][f"{rnd} · {name}"] = r; print(rnd, name, r, flush=True)
            if a.fps_only:
                (out / 'report_fps.json').write_text(json.dumps(rep, indent=1), encoding='utf-8'); print('FPS', json.dumps({k: (v.get('fps'), v.get('worst')) for k, v in rep['fps'].items()})); return
            for k, v in cfg["stops"]:
                y = await ypos(k, v); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(1.1); await shot(f"stop_{k.strip('#')}_{v}")
            # real swipes
            k, v = cfg["swipe_from"]; y = await ypos(k, v); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(1.2)
            X = str(round(g["w"] / 2 * g["dpr"])); Y = lambda f: top_px + round(g["h"] * f * g["dpr"])
            for kind, ms, up, (fa, fb) in [("flick", 70, True, (0.62, 0.48))] * 4 + [("long slow drag", 900, True, (0.75, 0.3))] * 2 + [("flick back", 70, False, (0.62, 0.48))] * 2:
                await c.eval(f"({TRACE})(3.0)")
                adb(S, "shell", "input", "swipe", X, str(Y(fa) if up else Y(fb)), X, str(Y(fb) if up else Y(fa)), str(ms))
                await asyncio.sleep(3.2)
                tr = json.loads(await J("window.__trace")); ys = [p[1] for p in tr]; ps = [p[2] for p in tr]
                dys = [ys[i + 1] - ys[i] for i in range(len(ys) - 1)]; sgn = 1 if (ys[-1] - ys[0]) >= 0 else -1
                rev = [i for i, d in enumerate(dys) if d * sgn < -0.6]
                stop_i = max([i for i, d in enumerate(dys) if abs(d) > 0.01] or [0])
                lag_end = next((tr[i][0] for i in range(len(tr)) if i >= stop_i and abs(ps[i] - ps[-1]) < 1e-4), None)
                pjump = max((abs(ps[i + 1] - ps[i]) for i in range(len(ps) - 1)), default=0)
                dts = [tr[i + 1][0] - tr[i][0] for i in range(len(tr) - 1)]
                rec = {"kind": kind, "moved_px": round(ys[-1] - ys[0], 1), "reversals_px": [round(dys[i], 2) for i in rev][:6], "scroll_stopped_ms": tr[stop_i][0] if tr else None,
                       "scene_settled_ms": lag_end, "biggest_scene_step_per_frame": round(pjump, 4), "fps": round(1000 * len(dts) / max(1, sum(dts)), 1), "worst_frame_ms": round(max(dts or [0]), 1)}
                rep["swipes"].append(rec); print(rec, flush=True)
            await shot("after_swipes")
            rep["errors"] = json.loads(await J("window.__errs"))
            # reduced motion
            await open_site(True)
            for sel in cfg["reduced"]:
                y = await ypos(sel, 0); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(0.8); await shot(f"rm_{sel.strip('#')}")
                y = await ypos(sel, 1); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(0.8); await shot(f"rm_{sel.strip('#')}_b")
            rep["errors_reduced"] = json.loads(await J("window.__errs"))
            await c.call("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-reduced-motion", "value": ""}]})
            (out / "report.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
            print("FPS", json.dumps({k: (v.get("fps"), v.get("p95"), v.get("worst")) for k, v in rep["fps"].items()}), flush=True)
            print("ERRORS", rep["errors"], rep["errors_reduced"])
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed our tab")

ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--stage", required=True); ap.add_argument("--out", default=""); ap.add_argument("--fps-only", action="store_true")
asyncio.run(main(ap.parse_args()))

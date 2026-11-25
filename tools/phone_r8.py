"""Round 8 on Wajih's real phone (adb + CDP, ONE tab of our own; never lists or reads other tabs):
- the gate, a real tap on the point (adb input);
- fps while scrolling through each segment (page 1, the hallway's way in and walk, the door), first and second pass;
- frame 5's phones turning with the scroll; the frosted labels at rest with small scrolls;
- "Cut to the chase": fps through the hyperdrive (a real tap on the strip's link), where it lands, then the final room
  (fps while scrolling it);
- real swipes with no snap: thumb flicks and a slow drag (adb input swipe), the page's scroll sampled every frame for
  2.5 s after the thumb lets go: any pull-back (the page reversing by itself) or skip after release, and whether the
  lagged scene catches up smoothly (no jump);
- reduced motion (emulated on the phone's own Chrome: prefers-reduced-motion): the cut is a plain jump, the hallway is
  still figures;
- shots of every stop, console errors.
  python -I tools/phone_r8.py --serial 192.168.1.32:45239
Setup: adb reverse tcp:8109 tcp:8109 ; adb forward tcp:9222 localabstract:chrome_devtools_remote"""
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
HOLD = """(async (secs) => { const t = []; let last = performance.now(); const end = last + secs * 1000;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const so = [...t].sort((x, y) => x - y), sum = t.reduce((x, y) => x + y, 0);
  return { fps: +(1000 * t.length / sum).toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), over20: t.filter(x => x > 20).length, frames: t.length }; })"""
# every frame for `secs`: the scroll position and the scene's rendered position (page 1's lagged P), with time
TRACE = """(secs) => { window.__trace = []; const t0 = performance.now(); const end = t0 + secs * 1000;
  (function f(now) { window.__trace.push([+(now - t0).toFixed(1), +scrollY.toFixed(2), +(window.__p1?.P?.() ?? 0).toFixed(5)]); if (now < end) requestAnimationFrame(f); })(t0); return true; }"""
SEGS = [("page 1: plate, morph, names 0-1.44", 0.0, 1.44), ("page 1: assembly, real 1.44-2.6", 1.44, 2.6), ("page 1: YOU, task, WE, drum 2.6-4.62", 2.6, 4.62),
        ("page 1 end + the way in, dress 4.62-5.6", 4.62, 5.6), ("hallway: opening + frames 1-2 5.6-6.95", 5.6, 6.95), ("hallway: frames 3-4 6.95-8.1", 6.95, 8.1),
        ("hallway: frame 5, the phones turn 8.1-8.95", 8.1, 8.95), ("the door: walk, open, through 8.95-9.54", 8.95, 9.54)]

async def main(a):
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True); S = a.serial
    adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")
    adb(S, "shell", "am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main"); await asyncio.sleep(1.5)
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    rep = {"fps": {}, "swipes": []}
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws); J = lambda js: c.eval(f"JSON.stringify({js})")
            async def shot(name):
                r = await c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 82}); (out / f"{name}.jpg").write_bytes(base64.b64decode(r["data"])); print("shot", name, flush=True)
            async def goto(p): y = await c.eval(f"window.__p1.yAt({p})"); await c.eval(f"{GOTO_Y}({y})")
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
                ph = await c.eval("document.documentElement.dataset.phase")
                if ph != "ready": raise SystemExit("the gate did not open: stopping (results would be invalid)")
                await asyncio.sleep(2.0)
                return g, top_px, dev
            await c.call("Runtime.enable")
            g, top_px, dev = await open_site(False); rep["viewport"] = g; print("viewport", g, flush=True)
            # ---- fps per segment, two passes ----
            for rnd in ("first pass", "second pass"):
                for name, p0, p1 in SEGS:
                    y0 = await c.eval(f"window.__p1.yAt({p0})"); y1 = await c.eval(f"window.__p1.yAt({p1})")
                    await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.6)
                    r = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=60))
                    rep["fps"][f"{rnd} · {name}"] = r; print(rnd, name, r, flush=True)
                if rnd == "first pass": rep["phones_after_first_pass"] = await c.eval("window.__p1.diveApi.phones()"); rep["lock"] = await c.eval("window.__p1.dive()?.door?.lock || window.__p1.diveApi.door().lockState")
            # ---- the frosted labels at rest, small scrolls ----
            stops = json.loads(await J("window.__p1.stops"))
            for nm in ["F1", "F3"]:
                pp = stops[nm]; y0 = await c.eval(f"window.__p1.yAt({pp - 0.05})"); y1 = await c.eval(f"window.__p1.yAt({pp + 0.05})")
                await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.8)
                rep["fps"][f"label on its frosted backing, {nm}, small scrolls (3 s)"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=30))
            # ---- every stop ----
            for nm, p in stops.items():
                await goto(p); await asyncio.sleep(1.0); await shot(f"p1_{nm}")
            # ---- cut to the chase: a real tap on the strip's link, from page 1's drum ----
            await goto(3.9); await asyncio.sleep(1.0)
            link = json.loads(await J("(() => { const r = document.querySelector('.strip__cut a').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()"))
            await c.eval("window.__hyperT = []; (function f(now) { window.__hyperT.push(now); if (window.__hyperT.length < 400) requestAnimationFrame(f); })(performance.now()); true")
            adb(S, "shell", "input", "tap", *dev(link["x"], link["y"]))
            await asyncio.sleep(0.75); await shot("hyper_mid")
            await asyncio.sleep(2.2)
            t = json.loads(await J("window.__hyperT")); d = [t[i + 1] - t[i] for i in range(len(t) - 1)]
            # the frames while the overlay played (from the tap until the canvas went): the 1.8 s window after the first long gap
            win = d[:min(len(d), 120)]
            so = sorted(win)
            rep["fps"]["cut to the chase: the hyperdrive (first ~2 s after the tap)"] = {"fps": round(1000 * len(win) / sum(win), 1), "p95": round(so[int(len(so) * .95)], 1), "worst": round(so[-1], 1), "over20": sum(1 for x in win if x > 20), "frames": len(win)}
            land = json.loads(await J("(() => { const r = document.getElementById('page-07').getBoundingClientRect(); return { roomTop: +r.top.toFixed(1), title: document.querySelector('.tb__title').textContent, overlay: !!document.querySelector('canvas.hyperdrive') }; })()"))
            rep["cut_landing"] = land; print("cut", land, rep["fps"]["cut to the chase: the hyperdrive (first ~2 s after the tap)"], flush=True)
            await shot("room_after_cut")
            ry = await c.eval("scrollY")
            rep["fps"]["the final room, scrolling (3 s)"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{ry}, {ry} + 900, 3])))()", timeout=30))
            await c.eval(f"{GOTO_Y}({ry} + 1400)"); await asyncio.sleep(1.0); await shot("room_slip")
            # ---- real swipes, no snap: after the thumb lets go, does the page ever move by itself beyond the fling? ----
            await goto(5.9); await asyncio.sleep(1.2)
            X = str(round(g["w"] / 2 * g["dpr"])); Y = lambda f: top_px + round(g["h"] * f * g["dpr"])
            for kind, ms, up, (fa, fb) in [("flick", 70, True, (0.62, 0.48))] * 5 + [("long slow drag", 900, True, (0.75, 0.3))] * 2 + [("flick back", 70, False, (0.62, 0.48))] * 2:
                await c.eval(f"({TRACE})(3.2)")
                adb(S, "shell", "input", "swipe", X, str(Y(fa) if up else Y(fb)), X, str(Y(fb) if up else Y(fa)), str(ms))
                await asyncio.sleep(3.4)
                tr = json.loads(await J("window.__trace"))
                ys = [p[1] for p in tr]; ps = [p[2] for p in tr]
                # the release: the moment the scroll's speed is highest (end of the touch); after it, the motion must be one way,
                # easing to a stop (Chrome's own fling), never reversing
                dys = [ys[i + 1] - ys[i] for i in range(len(ys) - 1)]
                sgn = 1 if (ys[-1] - ys[0]) >= 0 else -1
                rev = [i for i, v in enumerate(dys) if v * sgn < -0.6]
                stop_i = max([i for i, v in enumerate(dys) if abs(v) > 0.01] or [0])
                lag_end = next((tr[i][0] for i in range(len(tr)) if i >= stop_i and abs(ps[i] - ps[-1]) < 1e-4), None)
                pjump = max((abs(ps[i + 1] - ps[i]) for i in range(len(ps) - 1)), default=0)
                rec = {"kind": kind, "moved_px": round(ys[-1] - ys[0], 1), "reversals_px": [round(dys[i], 2) for i in rev][:6], "scroll_stopped_ms": tr[stop_i][0] if tr else None,
                       "scene_settled_ms": lag_end, "biggest_scene_step_per_frame_screens": round(pjump, 4), "frames": len(tr)}
                rep["swipes"].append(rec); print(rec, flush=True)
                await shot(f"swipe_{len(rep['swipes'])}")
            rep["errors"] = json.loads(await J("window.__errs"))
            rep["reduced_motion_setting_in_chrome"] = await c.eval("matchMedia('(prefers-reduced-motion: reduce)').matches")
            # ---- reduced motion (emulated): the still page, and the cut is a plain jump ----
            g2, top2, dev2 = await open_site(True)
            await shot("rm_top")
            hall = await c.eval("(() => { const h = document.querySelector('.p1-hall'); return h ? h.getBoundingClientRect().top + scrollY : -1; })()")
            if hall > 0: await c.eval(f"{GOTO_Y}({hall})"); await asyncio.sleep(0.8); await shot("rm_hallway")
            link = json.loads(await J("(() => { const r = document.querySelector('.strip__cut a').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()"))
            adb(S, "shell", "input", "tap", *dev2(link["x"], link["y"])); await asyncio.sleep(0.25)
            rep["reduced_cut"] = json.loads(await J("(() => ({ roomTop: +document.getElementById('page-07').getBoundingClientRect().top.toFixed(1), overlay: !!document.querySelector('canvas.hyperdrive') }))()"))
            await shot("rm_after_cut"); print("reduced cut", rep["reduced_cut"], flush=True)
            rep["errors_reduced"] = json.loads(await J("window.__errs"))
            await c.call("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-reduced-motion", "value": ""}]})
            print(json.dumps({k: v for k, v in rep.items() if k not in ("swipes",)}, indent=1), flush=True)
            (out / "report.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed our tab")

ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--out", default="tools/shots/r8/phone")
asyncio.run(main(ap.parse_args()))

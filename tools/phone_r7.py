"""Round 7 on Wajih's real phone (the way in, five frames with frosted labels, frame 5's timed turn, the soft snap, the
"Remove animations" setting, page 2's empty boxes). Built on round 6's test (adb + CDP, ONE tab of our own; never lists or reads other tabs). As round 5's test,
with the round 6 timeline (stops read from the page), the four labelled frames, every page-1 stop and page 2 shot, the
paper's colour sampled on the phone's own screenshots (it must read as white: neutral, a hint of cool), and the
on-grid offsets of a few landmarks measured on the phone:
- the gate, a real tap on the point (adb input);
- fps while scrolling through page 1's segments, first pass then second pass;
- the dive: the real phones start loading as it begins; fps through the hallway; frame 4's turn (a slow scroll over
  frame 4's stop while the phones turn, then held while the spring settles);
- page 2: the beacon pulsing on the first box (fps with the page still and with small scrolls), a real tap on the first
  row (the beacon moves to "Next: your slip");
- screenshots of the ground (REAL, TASK), each hallway stop, frame 4 mid-turn and settled, page 2 before and after the tap;
- console errors and page errors.
  python -I tools/phone_r7.py --serial 192.168.1.32:45519
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
SEGS = [("plate + draw 0-0.4", 0.0, 0.4), ("morph + handover 0.4-0.9", 0.4, 0.9), ("spread + names 0.9-1.44", 0.9, 1.44), ("assembly + ground 1.44-2.0", 1.44, 2.0),
        ("dress + real 2.0-2.6", 2.0, 2.6), ("YOU + task 2.6-3.0", 2.6, 3.0), ("WE + drum 3.0-4.62", 3.0, 4.62), ("end + the way in 4.62-5.4", 4.62, 5.4),
        ("opening line + frames 1-2 5.4-6.95", 5.4, 6.95), ("frames 3-4 6.95-8.1", 6.95, 8.1), ("frame 5 + landing 8.1-9.24", 8.1, 9.24)]

async def main(a):
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True); S = a.serial
    adb(S, "shell", "am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main"); await asyncio.sleep(1.5)
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    rep = {"fps": {}}
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws); J = lambda js: c.eval(f"JSON.stringify({js})")
            async def shot(name):
                r = await c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 80}); (out / f"{name}.jpg").write_bytes(base64.b64decode(r["data"])); print("shot", name, flush=True)
            async def goto(p): y = await c.eval(f"window.__p1.yAt({p})"); await c.eval(f"{GOTO_Y}({y})")
            await c.call("Runtime.enable"); await c.call("Log.enable")
            errs = []
            await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first&nosnap" + (("&" + a.query) if a.query else "")})
            for _ in range(120):
                await asyncio.sleep(0.25)
                try:
                    if await c.eval("document.documentElement.dataset.phase") == "gate": break
                except Exception: pass
            await c.eval("window.__errs = []; addEventListener('error', (e) => __errs.push(String(e.message))); addEventListener('unhandledrejection', (e) => __errs.push(String(e.reason))); "
                         "const _e = console.error.bind(console); console.error = (...x) => { __errs.push(x.map(String).join(' ')); _e(...x); }; true")
            g = json.loads(await J("{ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height }")); rep["viewport"] = g
            top_px = round((g["sh"] - g["h"]) * g["dpr"]); dev = lambda x, y: (str(round(x * g["dpr"])), str(round(top_px + y * g["dpr"])))
            # wake the screen first (a tap on a sleeping screen only wakes it), then tap until the page is in
            adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP"); await asyncio.sleep(0.8)
            for attempt in range(4):
                adb(S, "shell", "input", "tap", *dev(g["w"] / 2, g["h"] / 2))
                for _ in range(40):
                    if await c.eval("document.documentElement.dataset.phase") == "ready": break
                    await asyncio.sleep(0.1)
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
            rep["entered"] = await c.eval("document.documentElement.dataset.phase"); print("phase:", rep["entered"], flush=True)
            if rep["entered"] != "ready": raise SystemExit("the gate did not open: stopping (results would be invalid)")
            await asyncio.sleep(2.0)
            adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")
            for rnd in ("first pass", "second pass"):
                for name, p0, p1 in SEGS:
                    y0 = await c.eval(f"window.__p1.yAt({p0})"); y1 = await c.eval(f"window.__p1.yAt({p1})")
                    await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.6)
                    r = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=60))
                    rep["fps"][f"{rnd} · {name}"] = r; print(rnd, name, r, flush=True)
                if rnd == "first pass": rep["phones_after_first_pass"] = await c.eval("window.__p1.diveApi.phones()"); print("phones:", rep["phones_after_first_pass"], flush=True)
            # frame 5's turn (round 7: timed, by itself, once the frame settles): fps while it plays, page held still
            await goto(8.55); await asyncio.sleep(0.4)
            r = json.loads(await c.eval(f"(async () => JSON.stringify({{ ...(await {HOLD}(4.4)), ph: window.__p1.dive()?.phones }}))()", timeout=30))
            rep["fps"]["frame 5's timed turn (page still, 4.4 s)"] = r; print("frame 5 turn", r, flush=True)
            for p, nm in [(8.5, "f5_settling")]:
                await goto(p); await asyncio.sleep(1.2); await shot(nm)
            # the frosted labels at rest: fps with a label showing and the page moving a little
            for nm in ["F1", "F3"]:
                pp = json.loads(await J("window.__p1.stops"))[nm]; y0 = await c.eval(f"window.__p1.yAt({pp - 0.05})"); y1 = await c.eval(f"window.__p1.yAt({pp + 0.05})")
                await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.8)
                rep["fps"][f"label on its frosted backing, {nm}, small scrolls (3 s)"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=30))
            # every page-1 stop (the four labelled frames among them), and the landmarks' grid offsets on the phone
            stops = json.loads(await J("window.__p1.stops")); rep["grid_on_phone"] = {}
            for nm, p in stops.items():
                await goto(p); await asyncio.sleep(1.4); await shot(f"p1_{nm}")
                rep["grid_on_phone"][nm] = json.loads(await J("(() => { const u = window.__grid.u, o = (v) => +Math.abs(v - Math.round(v / u) * u).toFixed(2); const r = (s) => document.querySelector(s)?.getBoundingClientRect(); const out = { u }; "
                    "const t = r('.titleblock'); if (t) out.titleblock = [o(t.left), o(t.top), o(t.right), o(t.bottom)]; const l = document.querySelector('.dive__lab.on'); if (l) { const b = l.getBoundingClientRect(); out.label = [o(b.left), o(b.top)]; } "
                    "const d = window.__p1.dive?.(); if (d && d.info) d.info.forEach((f) => { if (f.quad && f.swing > 0.999 && f.op > 0.9) { const xs = f.quad.map((c) => c[0]), ys = f.quad.map((c) => c[1]); out['frame' + (f.i + 1)] = [o(Math.min(...xs)), o(Math.min(...ys)), o(Math.max(...xs)), o(Math.max(...ys))]; } }); return out; })()"))
            # page 2: the beacon
            await goto(9.24); await asyncio.sleep(1.5)
            p2y = await c.eval("document.getElementById('page-02').offsetTop"); await c.eval(f"{GOTO_Y}({p2y})"); await asyncio.sleep(1.5)
            await shot("p2_beacon")
            rep["fps"]["page 2, beacon pulsing, page still (4 s)"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {HOLD}(4)))()", timeout=30))
            rep["fps"]["page 2, beacon, scrolling (3 s)"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{p2y}, {p2y} + 300, 3])))()", timeout=30))
            await c.eval(f"{GOTO_Y}({p2y})"); await asyncio.sleep(0.8)
            box = json.loads(await J("(() => { const r = document.querySelector('#page-02 .p2-row .mark').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()"))
            adb(S, "shell", "input", "tap", *dev(box["x"], box["y"])); await asyncio.sleep(1.4)
            rep["cta_after_tap"] = json.loads(await J("{ state: window.__p23.cta.state(), ticked: window.__p23.slip.needs }")); print("cta", rep["cta_after_tap"], flush=True)
            await shot("p2_after_tap")
            adb(S, "shell", "input", "tap", *dev(box["x"], box["y"])); await asyncio.sleep(0.6)   # untick: leave the slip as it was
            # page 2's empty boxes (round 7 fix): an empty box must be empty: the stroke's dash fully off before any tap
            await goto(9.24); await asyncio.sleep(1.0)
            p2y = await c.eval("document.getElementById('page-02').offsetTop"); await c.eval(f"{GOTO_Y}({p2y})"); await asyncio.sleep(1.0)
            rep["empty_boxes"] = json.loads(await J("[...document.querySelectorAll('#page-02 .p2-row')].map((r) => { const i = r.querySelector('input'), p = r.querySelector('.mark path'), cs = getComputedStyle(p); return { checked: i.checked, dasharray: cs.strokeDasharray, offset: cs.strokeDashoffset }; })"))
            await shot("p2_empty_boxes")
            rep["reduced_motion_in_chrome"] = await c.eval("matchMedia('(prefers-reduced-motion: reduce)').matches")
            rep["phones_state"] = json.loads(await J("window.__p1.dive()?.phones || null"))
            rep["errors"] = json.loads(await J("window.__errs"))
            # the paper as the phone shows it: the screenshots' ground (a corner and the middle of the page-1 text screen)
            try:
                from PIL import Image
                im = Image.open(out / "p1_TASK.jpg").convert("RGB"); w, h = im.size
                px = [im.getpixel((int(w * x), int(h * y))) for x, y in [(0.93, 0.5), (0.5, 0.6), (0.07, 0.75)]]
                rep["paper_on_phone"] = px; print("paper on the phone:", px, flush=True)
            except Exception as e: rep["paper_on_phone"] = str(e)
            print(json.dumps(rep, indent=1), flush=True)
            (out / "report.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed our tab")

ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--out", default="tools/shots/r7/phone"); ap.add_argument("--query", default="")
asyncio.run(main(ap.parse_args()))

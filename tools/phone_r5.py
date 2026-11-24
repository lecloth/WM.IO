"""Round 5 on Wajih's real phone (adb + CDP, ONE tab of our own; never lists or reads other tabs):
- the gate, a real tap on the point (adb input);
- fps while scrolling through page 1's segments, first pass then second pass;
- the dive: the real phones start loading as it begins; fps through the hallway; frame 4's turn (a slow scroll over
  frame 4's stop while the phones turn, then held while the spring settles);
- page 2: the beacon pulsing on the first box (fps with the page still and with small scrolls), a real tap on the first
  row (the beacon moves to "Next: your slip");
- screenshots of the ground (REAL, TASK), each hallway stop, frame 4 mid-turn and settled, page 2 before and after the tap;
- console errors and page errors.
  python -I tools/phone_r5.py --serial 192.168.1.32:45519 [--query hall=B]
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
        ("dress + real 2.0-2.6", 2.0, 2.6), ("YOU + task 2.6-3.0", 2.6, 3.0), ("WE + drum 3.0-4.0", 3.0, 4.0), ("end + dot 4.0-4.75", 4.0, 4.75),
        ("hallway 4.75-5.75", 4.75, 5.75), ("frame 4 + landing 5.75-6.3", 5.75, 6.3)]

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
            await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first" + (("&" + a.query) if a.query else "")})
            for _ in range(120):
                await asyncio.sleep(0.25)
                try:
                    if await c.eval("document.documentElement.dataset.phase") == "gate": break
                except Exception: pass
            await c.eval("window.__errs = []; addEventListener('error', (e) => __errs.push(String(e.message))); addEventListener('unhandledrejection', (e) => __errs.push(String(e.reason))); "
                         "const _e = console.error.bind(console); console.error = (...x) => { __errs.push(x.map(String).join(' ')); _e(...x); }; true")
            g = json.loads(await J("{ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height }")); rep["viewport"] = g
            top_px = round((g["sh"] - g["h"]) * g["dpr"]); dev = lambda x, y: (str(round(x * g["dpr"])), str(round(top_px + y * g["dpr"])))
            adb(S, "shell", "input", "tap", *dev(g["w"] / 2, g["h"] / 2))
            for _ in range(60):
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
                await asyncio.sleep(0.1)
            await asyncio.sleep(2.0)
            adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")
            for rnd in ("first pass", "second pass"):
                for name, p0, p1 in SEGS:
                    y0 = await c.eval(f"window.__p1.yAt({p0})"); y1 = await c.eval(f"window.__p1.yAt({p1})")
                    await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.6)
                    r = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=60))
                    rep["fps"][f"{rnd} · {name}"] = r; print(rnd, name, r, flush=True)
                if rnd == "first pass": rep["phones_after_first_pass"] = await c.eval("window.__p1.diveApi.phones()"); print("phones:", rep["phones_after_first_pass"], flush=True)
            # frame 4's turn: a slow scroll over the stop (the spring follows), then the turn held to settle
            y0 = await c.eval("window.__p1.yAt(5.82)"); y1 = await c.eval("window.__p1.yAt(6.14)")
            await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(1.2)
            r = json.loads(await c.eval(f"(async () => {{ const e = window.__t2.engine; const t = []; let last = performance.now(); const t0 = last; const secs = 4;"
                f" await new Promise(res => {{ function f(now) {{ t.push(now - last); last = now; const k = Math.min(1, (now - t0) / (secs * 1000)); const y = {y0} + ({y1} - {y0}) * k;"
                f" if (e.lenis) e.lenis.scrollTo(y, {{ immediate: true, force: true }}); else scrollTo(0, y); if (k < 1) requestAnimationFrame(f); else res(); }} requestAnimationFrame(f); }});"
                f" t.shift(); const so = [...t].sort((x, y) => x - y), sum = t.reduce((x, y) => x + y, 0);"
                f" return JSON.stringify({{ fps: +(1000 * t.length / sum).toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), over20: t.filter(x => x > 20).length, frames: t.length, ph: window.__p1.dive()?.phones }}); }})()", timeout=60))
            rep["fps"]["frame 4 turn (slow scroll 5.82-6.14, 4 s)"] = r; print("frame 4 turn", r, flush=True)
            for p, nm in [(5.86, "f4_front"), (6.0, "f4_back"), (6.12, "f4_settled")]:
                await goto(p); await asyncio.sleep(1.6); await shot(nm)
            rep["phones_state"] = json.loads(await J("window.__p1.dive()?.phones"))
            # the ground and the hallway stops
            for nm, p in [("S0", 0.1), ("REAL", 2.45), ("TASK", 2.92), ("WE", 3.6), ("END", 4.2), ("F1", 4.86), ("F2", 5.2), ("F3", 5.54)]:
                await goto(p); await asyncio.sleep(1.3); await shot(f"p1_{nm}")
            # page 2: the beacon
            await goto(6.3); await asyncio.sleep(1.5)
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
            rep["errors"] = json.loads(await J("window.__errs"))
            print(json.dumps(rep, indent=1), flush=True)
            (out / "report.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed our tab")

ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--out", default="tools/shots/r5/phone"); ap.add_argument("--query", default="")
asyncio.run(main(ap.parse_args()))

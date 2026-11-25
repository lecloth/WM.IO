"""Page 1 on the real phone (adb + CDP, one tab of our own): the gate, a REAL tap on the point (adb input, so the
vibration unlock is real), frame times while page 1 scrolls, and screenshots at each stop.
  python -I tools/phonep1.py --out tools/shots/phone-p1
Setup: adb reverse tcp:8109 tcp:8109 ; adb forward tcp:9222 localabstract:chrome_devtools_remote"""
import argparse, asyncio, base64, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import websockets
from phone import CDP
_g = open(Path(__file__).resolve().parent / 'geom.py', encoding='utf-8').read().split('async def main')[0]
_gns = {'__file__': str(Path(__file__).resolve().parent / 'geom.py')}; exec(_g, _gns)
MEASURE_JS, check = _gns['MEASURE_JS'], _gns['check']

RUN = """(async (secs) => { const e = window.__t2.engine, s = document.getElementById('page-01'), a = s.offsetTop, b = a + s.offsetHeight - innerHeight;
  const t = []; let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; const k = (now - t0) / (secs * 1000);
    const y = a + (b - a) * (k < .5 ? k * 2 : 2 - k * 2); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const so = [...t].sort((x, y) => x - y), sum = t.reduce((x, y) => x + y, 0);
  return { fps: +(1000 * t.length / sum).toFixed(1), median: +so[Math.floor(so.length * .5)].toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), over20: t.filter(x => x > 20).length, frames: t.length }; })"""
GOTO = """(async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p);
  if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return Math.round(scrollY); })"""

def adb(*a): return subprocess.run(["adb", *a], capture_output=True, text=True).stdout

async def main(a):
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    print("tab", tid)
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws)
            async def shot(name):
                r = await c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 75})
                f = out / f"{name}.jpg"; f.write_bytes(base64.b64decode(r["data"])); print("shot", f, flush=True)
            await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first&nosnap"})
            for _ in range(80):
                await asyncio.sleep(0.25)
                try:
                    if await c.eval("document.documentElement.dataset.phase") == "gate": break
                except Exception: pass
            await asyncio.sleep(0.8); await shot("p1_gate")
            # where is the point on the physical screen? page centre in CSS px -> device px, plus the browser's top bar
            g = json.loads(await c.eval("JSON.stringify({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height })"))
            top_px = round((g["sh"] - g["h"]) * g["dpr"]) - 0      # browser + status bars above the page (no bottom bar in gesture mode)
            x, y = round(g["w"] / 2 * g["dpr"]), round(top_px + g["h"] / 2 * g["dpr"])
            print("viewport", g, "tap at", x, y)
            adb("shell", "input", "tap", str(x), str(y))
            t = 0
            while t < 40 and await c.eval("document.documentElement.dataset.phase") != "ready": await asyncio.sleep(0.1); t += 1
            state = await c.eval("JSON.stringify({ phase: document.documentElement.dataset.phase, activated: navigator.userActivation.hasBeenActive, vibrate: typeof navigator.vibrate })")
            print("after tap", state, flush=True)
            await asyncio.sleep(1.2)
            stops = {v: k for k, v in json.loads(await c.eval("JSON.stringify(window.__p1.stops)")).items()}
            for p in sorted(set(stops) | {0.5, 0.7, 4.82}):   # every named stop + mid-morph, late morph, late callout
                await c.eval(f"{GOTO}({p})"); await asyncio.sleep(1.4); await shot(f"p1_{int(p * 1000):04d}_{stops.get(p, 'mid')}")
                if p in stops:
                    m = json.loads(await c.eval(f"JSON.stringify(({MEASURE_JS})('{stops[p]}'))"))
                    probs = check(m, stops[p]); print(f"geometry on the phone {stops[p]} ({m['W']}x{m['H']}):", probs or 'clean', flush=True)
                if stops.get(p) == 'DRUM':   # mid-drum: step one verb on, catch it 150 ms into the turn
                    await c.eval(f"{GOTO}({p + 0.1314})"); await asyncio.sleep(0.15); await shot(f"p1_{int(p * 1000):04d}_mid-drum")
            adb("shell", "input", "tap", str(x), str(y))
            t = 0
            while t < 40 and await c.eval("document.documentElement.dataset.phase") != "ready": await asyncio.sleep(0.1); t += 1
            state = await c.eval("JSON.stringify({ phase: document.documentElement.dataset.phase, activated: navigator.userActivation.hasBeenActive, vibrate: typeof navigator.vibrate })")
            print("after tap", state, flush=True)
            await asyncio.sleep(1.2)
            stops = {0.12: 'S0', 0.66: 'morph', 1.5: 'S1', 2.08: 'fade', 2.78: 'S2', 3.08: 'YOU', 3.24: 'TASK', 3.45: 'STAMPS', 3.8: 'END'}
            for p in [0.12, 0.3, 0.38, 0.5, 0.66, 0.8, 0.95, 1.15, 1.5, 1.8, 2.08, 2.2, 2.45, 2.78, 3.08, 3.24, 3.45, 3.8]:
                await c.eval(f"{GOTO}({p})"); await asyncio.sleep(1.8 if p >= 3.4 else 1.0); await shot(f"p1_{int(p * 1000):04d}")
                if p in stops:
                    m = json.loads(await c.eval(f"JSON.stringify(({MEASURE_JS})('{stops[p]}'))"))
                    probs = check(m, stops[p]); print(f"geometry on the phone {stops[p]} ({m['W']}x{m['H']}):", probs or 'clean', flush=True)
            adb("shell", "input", "tap", str(round(g["w"] * 0.9 * g["dpr"])), str(top_px + 20))   # keep the screen awake (taps the strip area edge)
            r = await c.eval(f"{RUN}({a.secs})", timeout=a.secs + 40)
            print("phone fps while scrolling page 1:", json.dumps(r), flush=True)
            errs = await c.eval("JSON.stringify(window.__errs || [])")
            print("page errors seen:", errs)
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed tab")

ap = argparse.ArgumentParser(); ap.add_argument("--out", default="tools/shots/phone-p1"); ap.add_argument("--secs", type=float, default=8)
asyncio.run(main(ap.parse_args()))

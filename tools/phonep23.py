"""Pages 1, 2 and 3 on Wajih's real phone (adb + CDP, ONE tab of our own; never lists or reads other tabs).
  python -I tools/phonep23.py --serial 192.168.1.32:39371 --out tools/shots/phone-p23 [--send]
- the gate, a REAL tap on the point (adb input: the vibration unlock is real)
- page 1: every named stop + mid-morph + mid-callout, screenshots and the geometry check (geom.py)
- pages 2-3: real taps on two rows (vibrate calls counted), every stop of tools/p23.py with its geometry check,
  a slip with every field filled
- frame times while scrolling page 1 and pages 2-3 (scripted scroll, the phone's own compositor)
- --send: a REAL tap on Send; reads which app came forward and the link it was handed (no screenshot of the other
  app), then presses Back until Chrome is in front again. Nothing is sent.
Setup: adb reverse tcp:8109 tcp:8109 ; adb forward tcp:9222 localabstract:chrome_devtools_remote"""
import argparse, asyncio, base64, json, re, subprocess, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import websockets
from phone import CDP
T = Path(__file__).resolve().parent
def grab(name, upto='async def main'):
    ns = {'__file__': str(T / name)}; src = open(T / name, encoding='utf-8').read().split(upto)[0]
    src = src.replace('from browserlock import BrowserLock', '').replace('sys.stdout.reconfigure(encoding="utf-8", errors="replace")', '')
    exec(src, ns); return ns
G1 = grab('geom.py'); G23 = grab('p23.py', 'async def run')

def adb(serial, *a): return subprocess.run(["adb", "-s", serial, *a], capture_output=True, text=True).stdout

SCROLL_RUN = """(async ([a, b, secs]) => { const e = window.__t2.engine;
  const t = []; let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; const k = (now - t0) / (secs * 1000);
    const y = a + (b - a) * (k < .5 ? k * 2 : 2 - k * 2); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const so = [...t].sort((x, y) => x - y), sum = t.reduce((x, y) => x + y, 0);
  return { fps: +(1000 * t.length / sum).toFixed(1), median: +so[Math.floor(so.length * .5)].toFixed(1), p95: +so[Math.floor(so.length * .95)].toFixed(1), worst: +so[so.length - 1].toFixed(1), over20: t.filter(x => x > 20).length, frames: t.length }; })"""
GOTO_Y = """(async (y) => { const e = window.__t2.engine; if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); dispatchEvent(new Event('scroll')); return Math.round(scrollY); })"""

async def main(a):
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    S = a.serial
    adb(S, "shell", "am", "start", "-n", "com.android.chrome/com.google.android.apps.chrome.Main"); await asyncio.sleep(1.5)
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    print("tab", tid, flush=True)
    report = {"geometry": {}, "fps": {}}
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws)
            J = lambda js: c.eval(f"JSON.stringify({js})")
            async def shot(name):
                r = await c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 78})
                f = out / f"{name}.jpg"; f.write_bytes(base64.b64decode(r["data"])); print("shot", f.name, flush=True)
            await c.call("Runtime.enable")
            await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first"})
            for _ in range(120):
                await asyncio.sleep(0.25)
                try:
                    if await c.eval("document.documentElement.dataset.phase") == "gate": break
                except Exception: pass
            await c.eval("window.__errs = []; addEventListener('error', (e) => __errs.push(String(e.message))); addEventListener('unhandledrejection', (e) => __errs.push(String(e.reason))); "
                         "window.__vib = []; const _v = navigator.vibrate.bind(navigator); navigator.vibrate = (ms) => { __vib.push(ms); return _v(ms); }; true")
            await asyncio.sleep(0.8); await shot("00_gate")
            g = json.loads(await J("{ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height, sw: screen.width }"))
            top_px = round((g["sh"] - g["h"]) * g["dpr"])
            dev = lambda x, y: (str(round(x * g["dpr"])), str(round(top_px + y * g["dpr"])))
            print("viewport", g, flush=True); report["viewport"] = g
            adb(S, "shell", "input", "tap", *dev(g["w"] / 2, g["h"] / 2))
            for _ in range(60):
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
                await asyncio.sleep(0.1)
            report["after_gate_tap"] = json.loads(await J("{ phase: document.documentElement.dataset.phase, activated: navigator.userActivation.hasBeenActive, vibrate: typeof navigator.vibrate }"))
            print("after tap", report["after_gate_tap"], flush=True)
            await asyncio.sleep(1.5)
            # ---------- page 1 ----------
            stops = json.loads(await J("window.__p1.stops"))
            ps = sorted(set(stops.values()) | {0.5, 4.5, 4.85})
            names = {v: k for k, v in stops.items()}
            for p in ps:
                y = await c.eval(f"window.__p1.yAt({p})"); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(1.4)
                nm = names.get(p, "mid"); await shot(f"p1_{int(p * 1000):04d}_{nm}")
                if p in names:
                    m = json.loads(await c.eval(f"JSON.stringify(({G1['MEASURE_JS']})('{nm}'))")); pr = G1['check'](m, nm)
                    report["geometry"][f"p1 {nm}"] = pr; print(f"geometry p1 {nm} ({m['W']}x{m['H']}):", pr or "clean", flush=True)
            # ---------- pages 2-3: real taps on two rows ----------
            y = await c.eval(f"({G23['Y_JS']})('P2')"); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(1.6)
            await shot("p2_P2"); m = json.loads(await c.eval(f"JSON.stringify(({G23['MEASURE_JS']})(['P2', {json.dumps(G23['FOCUS']['P2'])}]))")); pr = G23['check'](m, 'P2')
            report["geometry"]["p2 P2"] = pr; print("geometry p2 P2:", pr or "clean", flush=True)
            v0 = len(json.loads(await J("window.__vib")))
            for rid in ("web", "app"):
                r = json.loads(await J(f"(() => {{ const b = document.querySelector('.p2-row[data-id={rid}] .p2-row__t').getBoundingClientRect(); return {{ x: b.left + b.width / 2, y: b.top + b.height / 2 }}; }})()"))
                adb(S, "shell", "input", "tap", *dev(r["x"], r["y"])); await asyncio.sleep(0.9)
            await asyncio.sleep(0.8); await shot("p2_TAP2_real-taps")
            tapped = json.loads(await J("{ needs: window.__p23.slip.needs, vib: window.__vib, stuck: window.__p23.stuck() }"))
            tapped["vibrations_from_row_taps"] = len(tapped["vib"]) - v0
            report["row_taps"] = tapped; print("row taps:", tapped, flush=True)
            # every stop, with the rest ticked and filled on the way (as tools/p23.py)
            for stop in G23['STOPS']:
                if stop in ("P2", "TAP2"): continue
                if stop == "ROWS": await c.eval("['mess','ai','sec'].forEach((id) => window.__p23.tick(id)), true")
                if stop == "FULL": await c.eval(f"({G23['FILL_JS']})()")
                await asyncio.sleep(0.6)
                for _ in range(2):
                    y = await c.eval(f"({G23['Y_JS']})('{stop}')"); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(1.1 if stop != "TAIL" else 1.6)
                await shot(f"p23_{stop}")
                m = json.loads(await c.eval(f"JSON.stringify(({G23['MEASURE_JS']})(['{stop}', {json.dumps(G23['FOCUS'].get(stop, ''))}]))")); pr = G23['check'](m, stop)
                report["geometry"][f"p23 {stop}"] = pr; print(f"geometry p23 {stop} ({m['W']}x{m['H']}):", pr or "clean", flush=True)
            report["length_p2p3"] = await c.eval("+((document.getElementById('page-04').offsetTop - document.getElementById('page-02').offsetTop) / innerHeight).toFixed(2)")
            # ---------- frame times while scrolling ----------
            adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")   # keeps the screen on (no tap on the page)
            await asyncio.sleep(0.5)
            a1 = await c.eval("document.getElementById('page-01').offsetTop"); b1 = await c.eval("window.__p1.yAt(window.__p1.scroll)")
            report["fps"]["page 1"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{a1}, {b1}, {a.secs}])))()", timeout=a.secs + 40))
            print("fps page 1:", report["fps"]["page 1"], flush=True)
            a2 = await c.eval("document.getElementById('page-02').offsetTop"); b2 = await c.eval("document.getElementById('page-04').offsetTop")
            report["fps"]["pages 2-3"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{a2}, {b2}, {a.secs}])))()", timeout=a.secs + 40))
            print("fps pages 2-3:", report["fps"]["pages 2-3"], flush=True)
            a3 = await c.eval("window.__p1.yAt(4.0)")
            report["fps"]["callout A into page 2"] = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{a3}, {a2 + 200}, 4])))()", timeout=60))
            print("fps callout A:", report["fps"]["callout A into page 2"], flush=True)
            # ---------- Send ----------
            y = await c.eval(f"({G23['Y_JS']})('SEND')"); await c.eval(f"{GOTO_Y}({y})"); await asyncio.sleep(1.2)
            link = await c.eval("document.querySelector('.send').href")
            report["send_href"] = link; print("send href:", link[:160], flush=True)
            if a.send:
                r = json.loads(await J("(() => { const b = document.querySelector('.send__w').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()"))
                adb(S, "shell", "input", "tap", *dev(r["x"], r["y"]))
                await asyncio.sleep(3.0)
                focus = adb(S, "shell", "dumpsys", "window").split("mCurrentFocus=")[-1].split("\n")[0].strip()
                acts = adb(S, "shell", "dumpsys", "activity", "activities")
                dat = [l.strip() for l in acts.split("\n") if "whatsapp" in l.lower() and ("dat=" in l or "wa.me" in l)][:3]
                report["send_tap"] = {"focus": focus, "intent": [re.sub(r"\s+", " ", d)[:400] for d in dat]}
                print("after Send tap, in front:", focus, flush=True)
                for d in dat: print("  intent:", d[:300], flush=True)
                for _ in range(4):   # back out, never send
                    if "com.android.chrome" in adb(S, "shell", "dumpsys", "window").split("mCurrentFocus=")[-1].split("\n")[0]: break
                    adb(S, "shell", "input", "keyevent", "KEYCODE_BACK"); await asyncio.sleep(1.2)
                report["back_in_chrome"] = "com.android.chrome" in adb(S, "shell", "dumpsys", "window").split("mCurrentFocus=")[-1].split("\n")[0]
                print("back in Chrome:", report["back_in_chrome"], flush=True)
            report["errors"] = json.loads(await c.eval("JSON.stringify(window.__errs || [])"))
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed tab", flush=True)
    (out / "report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False), encoding="utf-8")
    print("REPORT", json.dumps({k: v for k, v in report.items() if k != "geometry"}, ensure_ascii=False)[:2000])
    print("geometry problems:", sum(len(v) for v in report["geometry"].values()))

ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--out", default="tools/shots/phone-p23")
ap.add_argument("--secs", type=float, default=8); ap.add_argument("--send", action="store_true")
asyncio.run(main(ap.parse_args()))

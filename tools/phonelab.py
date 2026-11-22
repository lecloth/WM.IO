"""Run the style lab on the real phone (adb + CDP, one tab of our own): frame times while each option auto-scrolls,
and real-device screenshots at given positions. Keeps the screen awake with taps on the lab's fps readout.
  python -I tools/phonelab.py --codes A1,B1 --ps 0,0.5,1 --secs 6 --out tools/shots/phone
Setup: adb reverse tcp:8109 tcp:8109 ; adb forward tcp:9222 localabstract:chrome_devtools_remote"""
import argparse, asyncio, base64, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import websockets
from phone import CDP

FPS = """(async ([code, secs]) => {
  const s = document.querySelector('#' + code + ' .opt__scroll'); const max = s.scrollHeight - s.clientHeight; const t = [];
  let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; const k = (now - t0) / (secs * 1000);
    if (max > 0) s.scrollTop = max * (k < .5 ? k * 2 : 2 - k * 2); if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const so = [...t].sort((a, b) => a - b); const sum = t.reduce((a, b) => a + b, 0);
  const q = x => +so[Math.min(so.length - 1, Math.floor(x * so.length))].toFixed(1);
  return { fps: +(1000 * t.length / sum).toFixed(1), median: q(.5), p95: q(.95), worst: +so[so.length - 1].toFixed(1), over20: t.filter(x => x > 20).length, frames: t.length };
})"""

def keep_awake():
    subprocess.run(["adb", "shell", "input", "tap", "928", "318"], capture_output=True)

async def main(a):
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    print("tab", tid)
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws)
            await c.call("Page.enable")
            info = None
            for code in a.codes.split(","):
                keep_awake()
                await c.call("Page.navigate", {"url": f"http://127.0.0.1:8109/dev/lab.html?skip#{code}"})
                await asyncio.sleep(a.load)
                if info is None:
                    info = await c.eval("JSON.stringify({w: innerWidth, h: innerHeight, dpr: devicePixelRatio, ua: navigator.userAgent.match(/Chrome\\/[\\d.]+/)[0], vibrate: typeof navigator.vibrate, active: navigator.userActivation && navigator.userActivation.hasBeenActive, gl: (() => { const g = document.createElement('canvas').getContext('webgl2'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; })()})")
                    print("device", info)
                err = await c.eval("JSON.stringify([...document.querySelectorAll('.lab-note, .a-wait')].map(e => e.textContent))")
                if err != "[]": print(code, "notes:", err)
                if a.secs:
                    keep_awake()
                    r = await c.eval(f"({FPS})(['{code}', {a.secs}])", timeout=a.secs + 40)
                    print(code, "phone fps", json.dumps(r), flush=True)
                for p in [float(x) for x in a.ps.split(",")] if a.ps else []:
                    await c.eval(f"(() => {{ const s = document.querySelector('#{code} .opt__scroll'); s.scrollTop = (s.scrollHeight - s.clientHeight) * {p}; return 1; }})()")
                    await asyncio.sleep(1.4)
                    r = await c.call("Page.captureScreenshot", {"format": "jpeg", "quality": 70})
                    f = out / f"{code}_{int(p * 1000):04d}.jpg"; f.write_bytes(base64.b64decode(r["data"])); print("shot", f, flush=True)
                    keep_awake()
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed tab")

ap = argparse.ArgumentParser()
ap.add_argument("--codes", default="A1"); ap.add_argument("--ps", default=""); ap.add_argument("--secs", type=float, default=6)
ap.add_argument("--load", type=float, default=6); ap.add_argument("--out", default="tools/shots/phone")
asyncio.run(main(ap.parse_args()))

"""Round 8 probe on the S23: a fresh visit, page 1 scrolled through to the hallway's way in the way phone_r8.py does, with
the long tasks (PerformanceObserver) and the real phones' load marks, so a first-visit stall can be placed.
  python -I tools/phone_probe8.py --serial 192.168.1.32:45239"""
import argparse, asyncio, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import websockets
from phone import CDP
_src = (Path(__file__).resolve().parent / "phonep23.py").read_text(encoding="utf-8")
SCROLL_RUN = _src.split('SCROLL_RUN = """')[1].split('"""')[0]
GOTO_Y = _src.split('GOTO_Y = """')[1].split('"""')[0]
def adb(s, *a): return subprocess.run(["adb", "-s", s, *a], capture_output=True, text=True).stdout
async def main(a):
    S = a.serial
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws); J = lambda js: c.eval(f"JSON.stringify({js})")
            await c.call("Runtime.enable")
            await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first"})
            for _ in range(120):
                await asyncio.sleep(0.25)
                try:
                    if await c.eval("document.documentElement.dataset.phase") == "gate": break
                except Exception: pass
            await c.eval("window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => __lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); true")
            g = json.loads(await J("{ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height }")); top = round((g["sh"] - g["h"]) * g["dpr"])
            for _ in range(4):
                adb(S, "shell", "input", "tap", str(round(g["w"] / 2 * g["dpr"])), str(round(top + g["h"] / 2 * g["dpr"])))
                await asyncio.sleep(2.0)
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
            await asyncio.sleep(2.0)
            for p0, p1 in [(0, 1.44), (1.44, 2.6), (2.6, 4.62), (4.62, 5.6)]:
                y0 = await c.eval(f"window.__p1.yAt({p0})"); y1 = await c.eval(f"window.__p1.yAt({p1})")
                await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.6)
                t0 = await c.eval("performance.now()")
                r = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=60))
                print(p0, p1, "starts at", round(t0), r, flush=True)
            print("long tasks [start, ms]:", json.loads(await J("window.__lt")))
            print("marks:", json.loads(await J("performance.getEntriesByType('mark').map((m) => [m.name, Math.round(m.startTime)])")))
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True)
asyncio.run(main(ap.parse_args()))

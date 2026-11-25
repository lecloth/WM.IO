"""Round 7, the soft snap on Wajih's real phone: real thumb swipes (adb input swipe) on page 1 with the snap on, then
where the page came to rest: on a scene (one of page 1's snap points), and how many scenes one flick moved.
One tab of our own (never lists or reads other tabs).
  python -I tools/phone_snap.py --serial 192.168.1.32:45239"""
import argparse, asyncio, json, subprocess, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import websockets
from phone import CDP
def adb(serial, *a): return subprocess.run(["adb", "-s", serial, *a], capture_output=True, text=True).stdout

async def main(a):
    S = a.serial
    adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    rep = {"swipes": []}
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
            g = json.loads(await J("{ w: innerWidth, h: innerHeight, dpr: devicePixelRatio, sh: screen.height, snap: document.documentElement.dataset.snap }"))
            rep["page"] = g
            top_px = round((g["sh"] - g["h"]) * g["dpr"]); X = str(round(g["w"] / 2 * g["dpr"]))
            for _ in range(4):
                adb(S, "shell", "input", "tap", X, str(round(top_px + g["h"] / 2 * g["dpr"])))
                await asyncio.sleep(2.0)
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
            rep["entered"] = await c.eval("document.documentElement.dataset.phase")
            if rep["entered"] != "ready": raise SystemExit("gate did not open")
            await asyncio.sleep(1.5)
            snaps = json.loads(await J("window.__p1.snaps()"))
            near = lambda y: min(range(len(snaps)), key=lambda i: abs(snaps[i] - y))
            # a flick: a short, fast stroke of the thumb (about 90 px); a drag: a long, slow one (the page follows the thumb)
            Y = lambda f: top_px + round(g["h"] * f * g["dpr"])
            for kind, ms, up, (fa, fb) in [("flick", 70, True, (0.6, 0.475))] * 8 + [("long slow drag", 700, True, (0.72, 0.32))] + [("flick back", 70, False, (0.6, 0.475))] * 3:
                y0, y1 = Y(fa), Y(fb)
                before = await c.eval("scrollY")
                adb(S, "shell", "input", "swipe", X, str(y0 if up else y1), X, str(y1 if up else y0), str(ms))
                await asyncio.sleep(2.2)
                after = await c.eval("scrollY")
                i0, i1 = near(before), near(after)
                rec = {"kind": kind, "from": round(before), "to": round(after), "scene_from": i0, "scene_to": i1, "moved_scenes": i1 - i0, "off_scene_px": round(abs(snaps[i1] - after), 1)}
                rep["swipes"].append(rec); print(rec, flush=True)
            rep["errors"] = json.loads(await J("(window.__errs || [])"))
            print(json.dumps({k: v for k, v in rep.items() if k != 'swipes'}, indent=1))
            out = Path(a.out); out.mkdir(parents=True, exist_ok=True); (out / "snap.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed our tab")

ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--out", default="tools/shots/r7/phone")
asyncio.run(main(ap.parse_args()))

"""Page 1 on the real phone, segment by segment (where do slow frames happen?), first pass and second pass; and the
gyroscope's real readings (every deviceorientation event the page gets, with its angles).
  python -I tools/phoneseg.py --serial 192.168.1.32:39371
One tab of our own (adb + CDP); never lists or reads other tabs. Setup as tools/phonep23.py."""
import argparse, asyncio, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import websockets
from phone import CDP
_src = (Path(__file__).resolve().parent / "phonep23.py").read_text(encoding="utf-8")
SCROLL_RUN = _src.split('SCROLL_RUN = """')[1].split('"""')[0]
GOTO_Y = _src.split('GOTO_Y = """')[1].split('"""')[0]
def adb(serial, *a): return subprocess.run(["adb", "-s", serial, *a], capture_output=True, text=True).stdout

WHERE = """(async ([a, b, secs]) => { const e = window.__t2.engine; const slow = []; let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { const dt = now - last; last = now; if (dt > 20) slow.push([+dt.toFixed(1), +window.__p1.P().toFixed(3)]);
    const k = (now - t0) / (secs * 1000); const y = a + (b - a) * Math.min(1, k); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); }); return JSON.stringify(slow); })"""
SEGS = [("plate + draw 0-0.4", 0.0, 0.4), ("morph + handover 0.4-0.9", 0.4, 0.9), ("spread + names 0.9-1.44", 0.9, 1.44), ("assembly + ground 1.44-2.0", 1.44, 2.0),
        ("dress + real 2.0-2.6", 2.0, 2.6), ("YOU + task 2.6-3.0", 2.6, 3.0), ("WE + drum 3.0-4.0", 3.0, 4.0), ("end + dot 4.0-4.75", 4.0, 4.75), ("corridor 4.75-6.3", 4.75, 6.3)]

async def main(a):
    S = a.serial
    async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
        tid = (await CDP(bws).call("Target.createTarget", {"url": "about:blank"}))["targetId"]
    try:
        async with websockets.connect(f"ws://127.0.0.1:9222/devtools/page/{tid}", max_size=64 << 20) as ws:
            c = CDP(ws); await c.call("Runtime.enable")
            await c.call("Page.navigate", {"url": "http://127.0.0.1:8109/?first"})
            for _ in range(120):
                await asyncio.sleep(0.25)
                try:
                    if await c.eval("document.documentElement.dataset.phase") == "gate": break
                except Exception: pass
            await c.eval("window.__ori = []; addEventListener('deviceorientation', (e) => { if (__ori.length < 400) __ori.push([Math.round(performance.now()), e.beta == null ? null : +e.beta.toFixed(2), e.gamma == null ? null : +e.gamma.toFixed(2)]); }); true")
            await c.eval("document.querySelector('.enter').click(), true")
            for _ in range(60):
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
                await asyncio.sleep(0.1)
            await asyncio.sleep(2.0)
            adb(S, "shell", "input", "keyevent", "KEYCODE_WAKEUP")
            out = {}
            for rnd in (() if a.where else ("first pass", "second pass")):
                for name, p0, p1 in SEGS:
                    y0 = await c.eval(f"window.__p1.yAt({p0})"); y1 = await c.eval(f"window.__p1.yAt({p1})")
                    await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.6)
                    r = json.loads(await c.eval(f"(async () => JSON.stringify(await {SCROLL_RUN}([{y0}, {y1}, 3])))()", timeout=60))
                    out[f"{rnd} · {name}"] = r; print(rnd, name, r, flush=True)
            if a.where:
                for rnd in range(3):
                    y0 = await c.eval("window.__p1.yAt(3.9)"); y1 = await c.eval("window.__p1.yAt(6.3)"); await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.8)
                    print("slow frames [ms, p] going 3.9 -> 6.3, pass", rnd + 1, await c.eval(f"({WHERE})([{y0}, {y1}, 3])", timeout=60), flush=True)
                    y0 = await c.eval("window.__p1.yAt(1.9)"); y1 = await c.eval("window.__p1.yAt(2.7)"); await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(0.8)
                    print("slow frames [ms, p] going 1.9 -> 2.7, pass", rnd + 1, await c.eval(f"({WHERE})([{y0}, {y1}, 3])", timeout=60), flush=True)
            ori = json.loads(await c.eval("JSON.stringify(window.__ori)"))
            print("deviceorientation events since load:", len(ori), "first:", ori[:3], "last:", ori[-3:], flush=True)
            print("live:", await c.eval("JSON.stringify({ source: window.__p1.live.source, events: window.__p1.live.events })"), flush=True)
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
        print("closed tab")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--where", action="store_true")
    asyncio.run(main(ap.parse_args()))

"""Real phone: where the long tasks are as the dive begins (fresh load), with the phones' loading marks.
  python -I tools/phoneprobe.py --serial 192.168.1.32:45519 [--from 4.2 --to 6.3 --secs 6]
One tab of our own; never lists or reads other tabs."""
import argparse, asyncio, json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import websockets
from phone import CDP
_src = (Path(__file__).resolve().parent / "phonep23.py").read_text(encoding="utf-8")
GOTO_Y = _src.split('GOTO_Y = """')[1].split('"""')[0]
RUN = """(async ([a, b, secs]) => { const e = window.__t2.engine; const slow = []; let last = performance.now(); const t0 = last;
  await new Promise(res => { function f(now) { const dt = now - last; last = now; if (dt > 20) slow.push([+dt.toFixed(0), +window.__p1.P().toFixed(3), Math.round(now)]);
    const k = (now - t0) / (secs * 1000); const y = a + (b - a) * Math.min(1, k); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    if (k < 1.4) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); }); return JSON.stringify(slow); })"""
async def main(a):
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
            await c.eval("window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => __lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); true")
            await c.eval("document.querySelector('.enter').click(), true")
            for _ in range(60):
                if await c.eval("document.documentElement.dataset.phase") == "ready": break
                await asyncio.sleep(0.1)
            await asyncio.sleep(3)
            y0 = await c.eval(f"window.__p1.yAt({a.frm})"); y1 = await c.eval(f"window.__p1.yAt({a.to})")
            await c.eval(f"{GOTO_Y}({y0})"); await asyncio.sleep(1.0)
            t = await c.eval("Math.round(performance.now())")
            slow = json.loads(await c.eval(f"({RUN})([{y0}, {y1}, {a.secs}])", timeout=90))
            await asyncio.sleep(1.5)
            lt = [x for x in json.loads(await c.eval("JSON.stringify(__lt)")) if x[0] >= t - 50]
            marks = json.loads(await c.eval("JSON.stringify(performance.getEntriesByType('mark').filter(m => m.name.startsWith('phones:')).map(m => [m.name, Math.round(m.startTime)]))"))
            print("scroll began at", t); print("slow frames [ms, p, t]:", slow); print("long tasks [start, ms]:", lt); print("marks:", marks)
    finally:
        async with websockets.connect("ws://127.0.0.1:9222/devtools/browser") as bws:
            await CDP(bws).call("Target.closeTarget", {"targetId": tid})
ap = argparse.ArgumentParser(); ap.add_argument("--serial", required=True); ap.add_argument("--from", dest="frm", type=float, default=4.2); ap.add_argument("--to", type=float, default=6.3); ap.add_argument("--secs", type=float, default=6)
asyncio.run(main(ap.parse_args()))

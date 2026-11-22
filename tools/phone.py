"""Drive Wajih's phone Chrome over adb + the Chrome DevTools Protocol, touching ONLY the tab this script opens.

Setup (once per session):
  adb reverse tcp:8109 tcp:8109
  adb forward tcp:9222 localabstract:chrome_devtools_remote

Usage (python -I tools/phone.py ...):
  open <url>                      open a new tab, print its id
  eval <id> <js>                  evaluate an expression, print the JSON result
  shot <id> <out.png>             real-device screenshot of the viewport
  fps <id> <seconds> [<js>]       measure frame times on the phone (optional js runs first, e.g. starts a scroll)
  close <id>                      close the tab

Privacy: never lists or reads other tabs; only the target ids this script created are used.
"""
import asyncio, base64, json, sys, urllib.parse, urllib.request
import websockets

BASE = "http://127.0.0.1:9222"

def http(method, path):
    req = urllib.request.Request(BASE + path, method=method)
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.read().decode()

def ws_url(tid):
    return f"ws://127.0.0.1:9222/devtools/page/{tid}"

class CDP:
    def __init__(self, ws): self.ws, self.n = ws, 0
    async def call(self, method, params=None, timeout=60):
        self.n += 1; mid = self.n
        await self.ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
        while True:
            msg = json.loads(await asyncio.wait_for(self.ws.recv(), timeout))
            if msg.get("id") == mid:
                if "error" in msg: raise RuntimeError(msg["error"])
                return msg.get("result", {})
    async def eval(self, expr, timeout=60):
        r = await self.call("Runtime.evaluate", {"expression": expr, "awaitPromise": True, "returnByValue": True}, timeout)
        if "exceptionDetails" in r: raise RuntimeError(r["exceptionDetails"].get("exception", {}).get("description", r["exceptionDetails"]))
        return r.get("result", {}).get("value")

async def session(tid, fn):
    async with websockets.connect(ws_url(tid), max_size=64 * 1024 * 1024) as ws:
        return await fn(CDP(ws))

FPS_JS = """(async (secs) => {
  const t = []; let last = performance.now(); const end = last + secs * 1000;
  await new Promise(res => { function f(now) { t.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else res(); } requestAnimationFrame(f); });
  t.shift(); const s = [...t].sort((a, b) => a - b); const sum = t.reduce((a, b) => a + b, 0);
  const pct = q => s[Math.min(s.length - 1, Math.floor(q * s.length))];
  return { frames: t.length, fps: +(1000 * t.length / sum).toFixed(1), median_ms: +pct(.5).toFixed(2), p95_ms: +pct(.95).toFixed(2),
           worst_ms: +s[s.length - 1].toFixed(1), over_25ms: t.filter(x => x > 25).length, refresh_hint_ms: +pct(.1).toFixed(2) };
})"""

def main():
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd in ("open", "close"):
        # Android Chrome answers /json/new with 500, so go through the browser target instead.
        async def browser(method, params):
            async with websockets.connect(BASE.replace("http", "ws") + "/devtools/browser") as ws:
                return await CDP(ws).call(method, params)
        if cmd == "open": print(asyncio.run(browser("Target.createTarget", {"url": args[0]}))["targetId"])
        else: asyncio.run(browser("Target.closeTarget", {"targetId": args[0]})); print("closed")
        return
    tid = args[0]
    if cmd == "eval":
        print(json.dumps(asyncio.run(session(tid, lambda c: c.eval(args[1]))), indent=1)); return
    if cmd == "shot":
        async def shot(c):
            r = await c.call("Page.captureScreenshot", {"format": "png"})
            open(args[1], "wb").write(base64.b64decode(r["data"]))
        asyncio.run(session(tid, shot)); print("saved", args[1]); return
    if cmd == "fps":
        secs = float(args[1]); pre = args[2] if len(args) > 2 else None
        async def fps(c):
            if pre: await c.eval(pre)
            return await c.eval(f"({FPS_JS})({secs})", timeout=secs + 30)
        print(json.dumps(asyncio.run(session(tid, fps)))); return
    raise SystemExit(__doc__)

if __name__ == "__main__":
    main()

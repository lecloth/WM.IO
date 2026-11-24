"""The corridor's frame 4 still: the two real phones running our booking app, rendered by site/dev/phone-stills.html.
  python -I tools/phone_stills.py [--w 1200]
Saves site/media/phones-unverified/corridor-phones.webp (git-ignored: licences unverified, local only) and prints the
measured outlines (mm), which site/js/page01/corridor-drawings.js (PHONE_PAIR) uses for the blueprint."""
import argparse, asyncio, base64, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site/media/phones-unverified/corridor-phones.webp"

async def main(a):
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        page = await (await b.new_context(viewport={"width": 1400, "height": 1300})).new_page()
        errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:300]))
        page.on("pageerror", lambda e: errs.append(str(e)[:300]))
        await page.goto(f"http://127.0.0.1:8109/dev/phone-stills.html?w={a.w}", wait_until="load")
        await page.wait_for_function("window.__done", timeout=60000)
        s = await page.evaluate("window.__still", isolated_context=False)
        await b.close()
    if s.get("missing"):
        print("models missing: run node tools/phones_web.mjs first"); return
    OUT.write_bytes(base64.b64decode(s.pop("webp").split(",", 1)[1]))
    print(json.dumps(s, indent=1))
    print("saved", OUT, OUT.stat().st_size, "bytes; errors:", errs or "none")

ap = argparse.ArgumentParser(); ap.add_argument("--w", type=int, default=1200)
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

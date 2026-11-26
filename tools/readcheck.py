"""The hallway's readability check (round 8b; hallway pass 3: it measures what the fixed hall now shows, the open
frames square to you with their plaques, the eye at one height). For each frame, at every size, read closest:
  - every word in it is at least the type scale's smallest step on screen (0.375 cells), measured as its font size
    projected at the word's own depth;
  - its words keep half a cell from its own lines, its sheet's edge and its dots (in its plane, projected: inPlane);
  - the frame with its plaque (the block) lies between the strip and the caption band / title block: its top no higher
    than half a cell under the strip's cell margin, its foot no lower than half a cell past the band's (block);
  - the block's middle within half a cell of the room's middle (centred; the eye is one height for the whole walk);
  - the frame inside the screen's sides (edge);
  - its plaque's words at least half a cell inside the plate (label pad).
(Round 8b's "sheet at most half the screen's height" is gone: an open frame is now meant to fill the room.)
  python -I tools/readcheck.py [--sizes ...] [--out tools/shots/r8b/readcheck.json]
Last line: READCHECK failures: N"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"
JS = """async () => { const d = window.__p1.diveApi; await d.load(); return d.readability(); }"""

async def main(a):
    from patchright.async_api import async_playwright
    fails, rows = [], []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        for sz in a.sizes.split(","):
            size, dpr = (sz.split("@") + ["1"])[:2]; w, h = map(int, size.split("x"))
            opts = dict(viewport={"width": w, "height": h}, device_scale_factor=float(dpr))
            if w < 1024: opts.update(is_mobile=True, has_touch=True)
            ctx = await b.new_context(**opts); page = await ctx.new_page()
            await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
            await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
            await page.keyboard.press("Enter"); await page.wait_for_timeout(250); await page.keyboard.press("Enter"); await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
            await page.wait_for_timeout(500)
            r = await page.evaluate(JS, isolated_context=False)
            for f in r["frames"]:
                c, l, ip = f["closest"], f["lastVisible"], f["inPlane"]
                lim, u = r["limits"], r["u"]
                row = dict(size=sz, frame=f["i"], key=f["key"], cells=f["cells"], minSize=round(c["minSize"], 3) if c["minSize"] is not None else None,
                           share=round(l["share"], 3), width=round(c["widthShare"], 3), top=c["top"], bottom=c["bottom"], off=c["off"], eye=r["eye"],
                           edge=round(c["edge"], 1), clear=ip["worst"], need=ip["need"], what=ip["what"], labelPad=ip.get("labelPad"))
                rows.append(row)
                if row["minSize"] is not None and row["minSize"] < 0.375: fails.append(("size", row))
                if row["top"] < lim["top"] - 0.5 * u or row["bottom"] > lim["bottom"] + 0.5 * u: fails.append(("block", row))
                if abs(row["off"]) > 0.5: fails.append(("centre", row))
                if row["clear"] < row["need"]: fails.append(("clear", row))
                if row["edge"] < 0: fails.append(("edge", row))
                if row["labelPad"] is not None and row["labelPad"] < 0.5: fails.append(("label pad", row))
            print(sz, "eye", r["eye"], " ".join(f"{x['key']}:{x['minSize']}/w{x['width']}/off{x['off']}/{x['clear']}" for x in rows if x["size"] == sz), flush=True)
            await ctx.close()
        await b.close()
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps({"rows": rows, "fails": fails}, indent=1), encoding="utf-8")
    for k, r in fails: print("FAIL", k, r)
    ws = min(x["minSize"] for x in rows if x["minSize"] is not None); wsh = max(x["share"] for x in rows); wc = min(x["clear"] - x["need"] for x in rows)
    wo = max(abs(x["off"]) for x in rows)
    print(f"worst word size {ws} cells (rule 0.375), largest frame share of the height {wsh}, worst centring {wo} cells (rule 0.5), worst clear space margin {wc:.2f} px")
    print(f"READCHECK failures: {len(fails)}")

ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); ap.add_argument("--out", default="tools/shots/r8b/readcheck.json")
a = ap.parse_args()
with BrowserLock():
    asyncio.run(main(a))

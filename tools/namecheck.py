"""The name's size (Part 5 "The name's size: option B") and the parked fixes: one size at a time, one headless browser.
Two moments per size:
  GATE   the top bar at the start of the arrival (the arrival held at t = 0): the bar four cells tall, the mark in its
         first columns at the option B size; gridcheck's and overlap's own measurements, plus: the mark inside its
         columns and the bar (half a cell clear of the bar's boxes and its bottom), nothing under the bar
  TB     the title block after the tap (page 1's first screen): gridcheck's and overlap's measurements, plus: the mark's
         cell double width and the block's full height, the wave 4.5 cells, ".IO" 1.1-1.25 cells on the wave's baseline,
         "design and engineering" under it, the mark the same size as at the gate, the project cell and the tab's title
Shots: <out>/<size>_gate_bar.png (the bar), <size>_gate.png (the screen), <size>_tb.png (the title block),
<size>_tb_screen.png; favicon.png (the favicon at 16, 32 and 64 px, light and dark).
  python -I tools/namecheck.py [--sizes 384x734@2.8125,2160x1147@1.333] [--out tools/shots/name]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from browserlock import BrowserLock
from gridcheck import MEASURE_JS, EXCEPTIONS, TOL
from overlap import MEASURE as OV_MEASURE, check as ov_check

NAME_JS = r"""(moment) => {
  const u = window.__grid.u, W = document.documentElement.clientWidth, H = innerHeight, cells = (v) => +(v / u).toFixed(3);
  const out = { u: +u.toFixed(3), fails: [], facts: {} }, F = out.facts, fail = (m) => out.fails.push(m);
  const bbox = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const inkOf = (svgEl) => { const r = svgEl.getBoundingClientRect(), vb = svgEl.viewBox.baseVal, s = r.width / vb.width; return { s, ox: r.left - vb.x * s, oy: r.top - vb.y * s }; };
  const MK = { A: 65, W: 295.35, IOH: 55.25, SW: 5.5 };
  if (moment === 'gate') {
    const strip = document.getElementById('strip'), sr = strip.getBoundingClientRect(), sk = +getComputedStyle(strip).getPropertyValue('--sk');
    const band = parseFloat(getComputedStyle(strip, '::after').height) || 0, barH = sr.height + band;
    F.barCells = cells(barH); F.sk = sk;
    if (Math.abs(barH - 4 * u) > 0.5) fail(`the bar is ${cells(barH)} cells tall at the start (want 4)`);
    // the mark as the arrival draws it at t = 0 (the arrive layer's wave), and its columns
    const wave = document.querySelector('.arrive__wave'), wb = wave.getBBox();
    const sw = parseFloat(wave.style.strokeWidth) || 0;
    const ink = { l: wb.x - sw / 2, t: wb.y - sw / 2, r: wb.x + wb.width + sw / 2, b: wb.y + wb.height + sw / 2 };
    const o = document.querySelector('.arrive ellipse'), ob = o.getBBox();
    const right = ob.x + ob.width + sw / 2;
    F.waveCells = cells(wb.width); F.waveTopCells = cells(wb.y); F.baselineCells = cells(wb.y + wb.height); F.ioCells = cells(ob.height); F.markRightCells = cells(right);
    const mc = window.innerWidth >= 1024 ? 10 : 8; F.markCols = mc;
    if (Math.abs(wb.width - 4.5 * u) > 1) fail(`the wave is ${cells(wb.width)} cells wide at the start (want 4.5)`);
    if (Math.abs(wb.y + wb.height - 3 * u) > 0.75) fail(`the mark's baseline at ${cells(wb.y + wb.height)} cells (want 3)`);
    if (ink.l < 0.5 * u - 0.75 || right > mc * u - 0.5 * u + 0.75) fail(`the mark (${cells(ink.l)}-${cells(right)}) is not half a cell inside its ${mc} columns`);
    if (ink.t < 0.5 * u - 0.75 || ink.b > barH - 0.5 * u + 0.75) fail(`the mark (${cells(ink.t)}-${cells(ink.b)}) is not half a cell inside the bar`);
    // the bar's boxes: none in the mark's columns, every edge on a column
    const boxes = [...document.querySelectorAll('.strip__seg, .strip__cut')].map(bbox);
    const firstBox = Math.min(...boxes.map((b) => b.l)); F.firstBoxCells = cells(firstBox);
    if (firstBox < mc * u - 0.5) fail(`a box of the bar starts at ${cells(firstBox)} cells, inside the mark's columns`);
    boxes.forEach((b) => { [b.l, b.r].forEach((x) => { if (Math.abs(x / u - Math.round(x / u)) * u > 0.5) fail(`a box edge at ${cells(x)} cells is off the grid`); }); });
    // nothing else under the bar: the sentence and the beacon start below it
    const hello = document.querySelector('.enter__hello').getBoundingClientRect(), pt = document.querySelector('.sing__point').getBoundingClientRect();
    F.sentenceTopCells = cells(hello.top);
    if (hello.top < barH + 0.5 * u - 0.75) fail(`the sentence's box (top ${cells(hello.top)}) reaches under the bar`);
    if (pt.top < barH) fail('the beacon is under the bar');
    // the same size as in the title block
    const T = inkOf(document.querySelector('.tb__mark')), s = wb.width / 200;
    F.sameSizeAsTitleBlock = Math.abs(s - T.s) < 0.01 * T.s;
    if (!F.sameSizeAsTitleBlock) fail(`the mark at the start is ${(s / T.s).toFixed(3)} x the title block's`);
  } else {
    const tb = document.querySelector('.titleblock'), tr = tb.getBoundingClientRect();
    const cell = document.querySelector('.tb__cell--mark'), cr = cell.getBoundingClientRect();
    const others = [...tb.children].filter((c) => c !== cell && getComputedStyle(c).display !== 'none').map((c) => ({ k: (c.querySelector('.tb__k')?.textContent || c.className).trim(), r: c.getBoundingClientRect() }));
    F.block = { leftCells: cells(tr.left), topCells: cells(tr.top), wCells: cells(tr.width), hCells: cells(tr.height), bottomGapCells: cells(H - tr.bottom), rightGapCells: cells(W - tr.right) };
    F.markCell = { wCells: cells(cr.width), hCells: cells(cr.height) };
    F.cells = others.map((c) => `${c.k} ${cells(c.r.width)}x${cells(c.r.height)} @(${cells(c.r.left - tr.left)},${cells(c.r.top - tr.top)})`);
    const normal = others.map((c) => c.r.width), avg = normal.reduce((a, b) => a + b, 0) / normal.length;
    F.markCellVsAvg = +(cr.width / avg).toFixed(2);
    if (Math.abs(cr.height - tr.height) > 0.5) fail(`the mark's cell is ${cells(cr.height)} tall, the block ${cells(tr.height)}`);
    if (cr.width < 1.4 * avg) fail(`the mark's cell is only ${F.markCellVsAvg} x a normal cell`);
    if (tr.bottom > H - u + 0.5 || tr.right > W - u + 0.5) fail('the block is not a cell inside the screen');
    const svg = document.querySelector('.tb__mark'), M = inkOf(svg), sw = MK.SW * M.s;
    const wave = { l: M.ox, r: M.ox + 200 * M.s, t: M.oy, b: M.oy + MK.A * M.s };
    F.waveCells = cells(200 * M.s); F.ioCells = cells(MK.IOH * M.s); F.baselineInCellCells = cells(wave.b - cr.top);
    F.markInCell = { leftCells: cells(M.ox - sw / 2 - cr.left), rightCells: cells(cr.right - (M.ox + MK.W * M.s + sw / 2)) };
    if (Math.abs(200 * M.s - 4.5 * u) > 1) fail(`the wave is ${F.waveCells} cells (want 4.5)`);
    if (MK.IOH * M.s < 1.1 * u - 0.5 || MK.IOH * M.s > 1.25 * u + 0.5) fail(`.IO is ${F.ioCells} cells (want 1.1-1.25)`);
    if (Math.abs(wave.b - cr.top - 3 * u) > 0.75) fail(`the wave's baseline ${F.baselineInCellCells} cells into its cell (want 3)`);
    if (F.markInCell.leftCells < 0.5 || F.markInCell.rightCells < 0.5) fail('the mark is not half a cell inside its cell');
    // "design and engineering" under it: grey label type, half a cell clear of the mark and the cell's lines
    const tag = cell.querySelector('.tb__tag'), cs = getComputedStyle(tag), rg = document.createRange(); rg.selectNodeContents(tag);
    const t = rg.getBoundingClientRect();
    F.tag = { text: tag.textContent, shown: cs.textTransform, sizeCells: cells(parseFloat(cs.fontSize)), colour: cs.color, wCells: cells(t.width), leftCells: cells(t.left - cr.left), rightCells: cells(cr.right - t.right), gapUnderMarkCells: cells(t.top - (wave.b + sw / 2)) };
    if (t.left - cr.left < 0.5 * u - 0.75 || cr.right - t.right < 0.5 * u - 0.75) fail('"design and engineering" is not half a cell inside its cell');
    if (t.top < wave.b + sw / 2) fail('"design and engineering" is not under the mark');
    // the WM.IO texts
    F.title = document.title; F.project = document.querySelector('.tb__cell--wide .tb__v')?.textContent;
    if (document.title !== 'WM.IO, a design and engineering studio') fail(`the tab says "${document.title}"`);
    if (F.project !== 'WM.IO') fail(`the project cell says "${F.project}"`);
    F.favicon = document.querySelector('link[rel="icon"]')?.getAttribute('href');
    // nothing hidden under the block: page 1's first screen's text and pictures above its top
    out.tbTop = tr.top;
  }
  return out;
}"""

FAV_HTML = """<!doctype html><html><body style="margin:0;padding:12px;font:12px sans-serif;background:#ddd">
<div style="display:flex;gap:16px;align-items:end">{cells}</div></body></html>"""

async def favicon(pw, out):
    svg = (Path(__file__).resolve().parent.parent / "site/media/brand/wmio-favicon.svg").read_text(encoding="utf-8")
    dark = svg.replace("@media (prefers-color-scheme:dark){", "@media all{")
    import base64
    u = lambda s: "data:image/svg+xml;base64," + base64.b64encode(s.encode()).decode()
    cells = "".join(f'<figure style="margin:0;text-align:center"><img src="{u(s)}" width="{n}" height="{n}" style="image-rendering:auto"><figcaption>{n}px {t}</figcaption></figure>'
                    for t, s in (("light", svg), ("dark", dark)) for n in (16, 32, 64))
    b = await pw.chromium.launch(headless=True)
    for dpr, tag in ((1, "favicon.png"), (2, "favicon@2x.png")):
        ctx = await b.new_context(viewport={"width": 520, "height": 130}, device_scale_factor=dpr); pg = await ctx.new_page()
        await pg.set_content(FAV_HTML.format(cells=cells)); await pg.wait_for_timeout(200)
        await pg.screenshot(path=str(out / tag)); await ctx.close()
    await b.close()

async def one(pw, sz, out):
    size, dpr = (sz.split("@") + ["1"])[:2]; w, h = map(int, size.split("x")); dpr = float(dpr); mobile = w < 1024
    b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
    opts = dict(viewport={"width": w, "height": h}, device_scale_factor=dpr)
    if mobile: opts.update(is_mobile=True, has_touch=True)
    ctx = await b.new_context(**opts); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
    await pg.goto("http://127.0.0.1:8109/?first", wait_until="load")
    await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'run'", timeout=30000)
    await pg.evaluate("window.__arrival.hold(0)", isolated_context=False); await pg.wait_for_timeout(300)
    res = {"size": sz}
    rows = []
    # GATE
    n = await pg.evaluate(NAME_JS, "gate", isolated_context=False)
    g = await pg.evaluate(MEASURE_JS, {"exceptions": EXCEPTIONS, "tol": TOL}, isolated_context=False)
    o = await pg.evaluate(OV_MEASURE, isolated_context=False); under = []; ob = ov_check(o, under)
    u = n["u"]
    await pg.screenshot(path=str(out / f"{size}_gate.png"))
    await pg.screenshot(path=str(out / f"{size}_gate_bar.png"), clip={"x": 0, "y": 0, "width": w, "height": min(h, 6 * u)})
    rows.append(("GATE", n, g, ob, under))
    # TB: tap (skip, then enter), page 1's first screen
    await pg.evaluate("window.__arrival.hold(null)", isolated_context=False)
    await pg.evaluate("window.__arrival.skip()", isolated_context=False); await pg.wait_for_timeout(250)
    await pg.evaluate("window.__arrival.enter()", isolated_context=False)
    await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await pg.wait_for_timeout(1400)
    n = await pg.evaluate(NAME_JS, "tb", isolated_context=False)
    g = await pg.evaluate(MEASURE_JS, {"exceptions": EXCEPTIONS, "tol": TOL}, isolated_context=False)
    o = await pg.evaluate(OV_MEASURE, isolated_context=False)
    # the mark (with its label) as a picture: no other text on it
    mk = await pg.evaluate("(() => { const r = document.querySelector('.tb__cell--mark').getBoundingClientRect(); return { name: 'the mark cell', l: r.left, t: r.top, r: r.right, b: r.bottom }; })()", isolated_context=False)
    o["texts"] = [t for t in o["texts"] if "tb__cell" not in t["name"] or "design and" not in t["name"]]
    o["pics"].append(mk); under = []; ob = ov_check(o, under)
    # page 1's first-screen text under the title block (it is opaque): words whose boxes reach below its top, in its columns
    hid = await pg.evaluate("""(top) => { const tb = document.querySelector('.titleblock').getBoundingClientRect(), out = [];
      const w = document.createTreeWalker(document.getElementById('page-01') || document.body, NodeFilter.SHOW_TEXT);
      for (let t = w.nextNode(); t; t = w.nextNode()) { if (!t.textContent.trim()) continue; const el = t.parentElement; const cs = getComputedStyle(el);
        if (cs.visibility !== 'visible' || el.closest('.sr-only, script, style') || /inset\\(50%\\)/.test(cs.clipPath)) continue;
        let op = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= +getComputedStyle(n).opacity; if (op < 0.05) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const r of rg.getClientRects()) if (r.width > 1 && r.right > tb.left && r.left < tb.right && r.bottom > tb.top && r.top < tb.bottom && r.top < innerHeight) out.push(t.textContent.trim().slice(0, 30)); }
      return out; }""", n.get("tbTop", 0), isolated_context=False)
    if hid: n["fails"].append(f"hidden under the title block: {hid[:4]}")
    await pg.screenshot(path=str(out / f"{size}_tb_screen.png"))
    box = await pg.evaluate("(() => { const r = document.querySelector('.titleblock').getBoundingClientRect(), u = window.__grid.u; return { x: Math.max(0, r.left - u), y: Math.max(0, r.top - u), width: Math.min(innerWidth, r.right + u) - Math.max(0, r.left - u), height: Math.min(innerHeight, r.bottom + u) - Math.max(0, r.top - u) }; })()", isolated_context=False)
    await pg.screenshot(path=str(out / f"{size}_tb.png"), clip=box)
    rows.append(("TB", n, g, ob, under))
    bad = 0
    for stop, n, g, ob, under in rows:
        gf = [f"{f['what']} {f['el']} by {f['dev']}" for f in g["fails"]]
        bad += len(n["fails"]) + len(gf) + len(ob)
        print(f"{sz} {stop}: name {'clean' if not n['fails'] else n['fails']}; grid {g['edges']} edges, {g['baselines']} baselines, worst {g['worst']:.2f} px, "
              + ("clean" if not gf else f"{len(gf)} off: {gf[:5]}") + f"; overlap {len(o['texts'])} text boxes, " + ("clean" if not ob else f"{len(ob)}: {ob[:5]}")
              + (f" (under the chrome, by design: {len(under)})" if under else ""), flush=True)
        print("   facts:", json.dumps(n["facts"], ensure_ascii=False), flush=True)
    if errs: print(f"{sz} console errors: {errs}"); bad += len(errs)
    await ctx.close(); await b.close()
    return bad

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True); bad = 0
    async with async_playwright() as pw:
        for sz in a.sizes.split(","): bad += await one(pw, sz, out)
        if a.favicon: await favicon(pw, out)
    print("NAMECHECK failures:", bad)

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default="384x734@2.8125,2160x1147@1.333"); ap.add_argument("--out", default="tools/shots/name")
    ap.add_argument("--favicon", action="store_true"); a = ap.parse_args()
    with BrowserLock(): asyncio.run(main(a))

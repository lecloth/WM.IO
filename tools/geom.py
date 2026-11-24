"""Geometry check (STUDIO_BRIEF Part 5) for page 1: at every stop, every size, light and dark.
  - every picture (the plate, the phone) fully inside the screen and inside its band, not cropped;
  - no element covering another unless tagged as designed (texts, labels, button, credit vs strip, title block,
    each other and the pictures).
  python -I tools/geom.py [--sizes 384x734,390x844,...] [--out tools/shots/geom]
Writes a screenshot per stop and prints a list of problems (empty = clean)."""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1"   # WxH@devicePixelRatio; under 1024 wide = a phone
SETTLE = {"WE": 1100, "DRUM": 1100, "END": 1100, "kin": 1000, "paper": 900, "TASK": 900, "REAL": 1000, "DOT": 700, "F1": 1000, "F2": 1000, "F3": 1000, "F4": 1200, "LAND": 900}
GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""
MEASURE_JS = r"""(stop) => {
  const W = innerWidth, H = innerHeight, R = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const items = [];
  const add = (name, el, kind) => { if (vis(el)) items.push({ name, kind, ...R(el) }); };
  add('strip', document.getElementById('strip'), 'chrome');
  add('titleblock', document.querySelector('.titleblock'), 'chrome');
  document.querySelectorAll('.p1-txt.on').forEach((t) => {
    // a text block's real ink: its children, not the full-width box
    [...t.children].forEach((c, i) => add(`text ${t.dataset.k}.${i} (${c.className.split(' ')[0]})`, c, 'text'));
  });
  const we = document.querySelector('.p1-we.on');
  if (we) {
    add('text we.word', we.querySelector('.p1-we__word'), 'text');
    const lit = [...we.querySelectorAll('.p1-verb')].find((v) => +v.style.opacity > 0.9); if (lit) add('text we.verb', lit, 'text');
    add('text we.drum', we.querySelector('.p1-drum'), 'text');
    const m = we.querySelector('.p1-mean p.on'); if (m) { const ws = [...m.querySelectorAll('.w')]; if (ws.length) { const a = ws[0].getBoundingClientRect(); let r = { l: 1e9, t: 1e9, r: -1e9, b: -1e9 }; ws.forEach((w) => { const q = w.getBoundingClientRect(); r = { l: Math.min(r.l, q.left), t: Math.min(r.t, q.top), r: Math.max(r.r, q.right), b: Math.max(r.b, q.bottom) }; }); items.push({ name: 'text we.mean', kind: 'text', ...r }); } }
  }
  // the travelling words belong to the line they stand in (their slots there are see-through by design)
  document.querySelectorAll('.p1-fly').forEach((fly) => {
    const fs = fly.dataset.state; if (!fs || fs === 'off') return;
    const blk = fly.dataset.w === 'you' ? (fs === 'a' ? 's2' : fs === 'c' ? 'task' : 'you') : (fs === 'a' ? 'task' : 'we');
    add(`text ${blk}.fly-${fly.dataset.w}`, fly.querySelector(fs === 'a' ? '.lo' : '.up'), 'text');
  });
  document.querySelectorAll('.p1-lbl.on').forEach((l) => add('label ' + l.textContent, l, 'label'));
  add('credit', document.querySelector('.p1__credit'), 'text');
  const pf = document.querySelector('.p1__plate'); if (vis(pf)) items.push({ name: 'plate', kind: 'picture', ...R(pf) });
  const p1 = window.__p1, band = p1 ? p1.band() : null;
  if (p1 && p1.morphOn()) {   // Bell's lines on their way: between the plate and the phone they're landing on
    const a = p1.plate(), b = p1.morphT() > 0 ? p1.box() : { left: a.left, top: a.top, right: a.left + a.width, bottom: a.top + a.height };
    items.push({ name: 'lines', kind: 'picture', l: Math.min(a.left, b.left), t: Math.min(a.top, b.top), r: Math.max(a.left + a.width, b.right), b: Math.max(a.top + a.height, b.bottom) });
  }
  const cv = document.querySelector('.p1__canvas');
  if (p1 && +getComputedStyle(cv).opacity > 0.05 && !cv.classList.contains('is-off')) {
    const b = p1.box(); items.push({ name: 'phone', kind: 'picture', l: b.left, t: b.top, r: b.right, b: b.bottom });
  }
  const dv = p1 && p1.dive();
  if (dv) {   // the dive's window grows from the "?" dot over everything (the design); page 2 waits at the corridor's end
    items.forEach((it) => { if (it.kind === 'text' || it.kind === 'picture') it.kind = 'under-dive'; });
    const st = document.querySelector('#page-02 .p2__stage'); if (st) { const r = st.getBoundingClientRect(); items.push({ name: 'page 2 at the end', kind: 'end', l: r.left, t: r.top, r: r.right, b: Math.min(r.bottom, r.top + innerHeight * dv.scale) }); }
    // round 4: the corridor's frames facing you (each must stay on the screen, clear of the strip, the title block and its
    // own caption) and the captions (text)
    (dv.info || []).forEach((f) => { if (f.quad && f.op > 0.9 && f.swing > 0.98) { const xs = f.quad.map((c) => c[0]), ys = f.quad.map((c) => c[1]); items.push({ name: `frame ${f.i + 1}`, kind: 'frame', l: Math.min(...xs), t: Math.min(...ys), r: Math.max(...xs), b: Math.max(...ys) }); } });
    document.querySelectorAll('.dive__lab.on').forEach((c, k) => add(`label ${[...c.parentNode.children].indexOf(c) + 1}`, c, 'text'));
  }
  // page 1's band is in stage coordinates (the stage is 100lvh; on a real phone that is taller than the visible screen)
  const SH = document.querySelector('.p1__stage')?.clientHeight || H;
  return { W, H, SH, items, band };
}"""

def check(m, stop):
    W, H, items, problems = m["W"], m["H"], m["items"], []
    BH = m.get("SH", H)
    band = m.get("band")
    for it in items:
        if it["kind"] == "picture" and band and (it["l"] < band["left"] - 1 or it["t"] < band["top"] - 1 or it["r"] > W - band["right"] + 1 or it["b"] > BH - band["bottom"] + 1):
            problems.append(f"{it['name']} leaves its band ({it['l']:.0f},{it['t']:.0f})-({it['r']:.0f},{it['b']:.0f}); band ({band['left']:.0f},{band['top']:.0f})-({W - band['right']:.0f},{BH - band['bottom']:.0f})")
        if it["kind"] == "end" and (it["l"] < -0.5 or it["t"] < -0.5 or it["r"] > W + 0.5):
            problems.append(f"page 2's frame leaves the screen ({it['l']:.0f},{it['t']:.0f})-({it['r']:.0f},{it['b']:.0f})")
        if it["kind"] in ("picture", "text", "label", "window", "frame") and (it["l"] < -0.5 or it["t"] < -0.5 or it["r"] > W + 0.5 or it["b"] > H + 0.5):
            problems.append(f"{it['name']} leaves the screen ({it['l']:.0f},{it['t']:.0f})-({it['r']:.0f},{it['b']:.0f}) in {W}x{H}")
    def hit(a, b, pad=0):
        return a["l"] < b["r"] - pad and b["l"] < a["r"] - pad and a["t"] < b["b"] - pad and b["t"] < a["b"] - pad
    for i, a in enumerate(items):
        for b in items[i + 1:]:
            kinds = {a["kind"], b["kind"]}
            if kinds == {"chrome"} or "under-dive" in kinds or "end" in kinds: continue
            if kinds == {"text"} and a["name"].split(".")[0] == b["name"].split(".")[0]: continue   # lines of one block
            if "picture" in kinds and "label" in kinds: continue   # labels sit beside pieces by design (leader lines)
            if {a["name"], b["name"]} == {"plate", "lines"}: continue   # Bell's clean outlines are drawn exactly on the scan
            if {"window", "text"} == kinds and "callout tag" in (a["name"], b["name"]): continue   # the tag sits on the window's edge
            if hit(a, b, 1):
                problems.append(f"{a['name']} overlaps {b['name']}")
    return problems

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    report, total = [], 0
    async with async_playwright() as pw:
        # desktop windows keep their scrollbar (real Chrome on Windows has one; headless hides it by default)
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        for sz in a.sizes.split(","):
            size, dpr = (sz.split("@") + ["1"])[:2]; dpr = float(dpr)
            w, h = map(int, size.split("x"))
            mobile = w < 1024
            for theme in ("light", "dark"):
                opts = dict(viewport={"width": w, "height": h}, device_scale_factor=dpr)
                if mobile: opts.update(is_mobile=True, has_touch=True)
                ctx = await b.new_context(**opts)
                if theme == "dark": await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
                page = await ctx.new_page(); errs = []
                page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
                await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
                await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
                await page.keyboard.press("Enter")
                await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
                await page.wait_for_timeout(500)
                top = await page.evaluate("document.getElementById('page-01').offsetTop"); vh = await page.evaluate("innerHeight")
                stops = await page.evaluate("window.__p1.stops", isolated_context=False)
                for stop, p in stops.items():
                    await page.evaluate(GOTO_JS, p, isolated_context=False)
                    await page.wait_for_timeout(SETTLE.get(stop, 700))
                    m = await page.evaluate(MEASURE_JS, stop, isolated_context=False)
                    probs = check(m, stop)
                    shot = out / f"{size}_{theme}_{stop}.png"; await page.screenshot(path=str(shot))
                    total += len(probs)
                    report.append((size, theme, stop, probs, [i["name"] for i in m["items"]]))
                    print(f"{size} {theme} {stop}: {'clean' if not probs else '; '.join(probs)}", flush=True)
                if errs: print(f"{size} {theme} console errors: {errs}")
                await ctx.close()
        await b.close()
    print(f"TOTAL PROBLEMS: {total}")

ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); ap.add_argument("--out", default="tools/shots/geom")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

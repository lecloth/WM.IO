"""On-grid check (Part 5 "Round 6"): the grid is the layout system. At every stop of pages 1-3, at the 9 sizes, it
measures every visible edge and every text baseline against the grid and reports anything off by more than half a
pixel. Deliberate exceptions are listed (EXCEPTIONS below) with their reasons, and counted, never silently dropped.

What it measures, in CSS px from the grid's origin (x: the screen's left; y: the screen's top for anything pinned or
fixed, page 2's own top for what scrolls with pages 2-3):
  - edges: every side of a box that is drawn (a border, a hairline drawn as an inset shadow, a filled background, an
    image, a picture canvas, a tick box), on a line;
  - baselines: every line of text, measured on the laid-out text (a zero-size probe gives each font's baseline under its
    text box), on a line, or a half line for small text (under 1.5 cells);
  - text edges: each line's left (or right / centre) on a line, as its alignment says;
  - the pictures drawn in WebGL: phone A's box (on its band), the hallway's frames at rest (their front faces), the
    X-ray names' shelves; the beacon's centre on an intersection.
  python -I tools/gridcheck.py [--sizes ...] [--themes light,dark] [--out tools/shots/r6/grid] [--stops S0,F1,...]
"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"   # round 7: + the five most common phones
TOL = 0.5
# round 8: the scenes are scrubbed (a 0.1 s lag), so a stop settles fast; the word reveals and the drum's detent still take their beat
SETTLE = {"OPEN": 1400, "WE": 1900, "DRUM": 1900, "END": 1300, "kin": 1200, "paper": 1000, "TASK": 1100, "YOU": 1100, "S2": 1100, "REAL": 1200,
          "F1": 1100, "F2": 1100, "F3": 1100, "F4": 1100, "F5": 1100, "F5B": 1100, "DOOR": 900, "OUT": 900}
# selectors whose edges / text are not held to the grid, and why (each hit is counted and listed by reason)
EXCEPTIONS = [
    (".p1-grid, .p1-grid *", "the construction lines behind WE and the verbs follow the type itself (cap line, x-height, ink edges); its baselines are grid lines"),
    (".p1-verb:not(.is-lit)", "the drum's other verbs turn away on the dial (3D); only the lit verb rests"),
    (".p1__plate, .p1__plate img", "Bell's drawing has no sheet now: its own ink sits on the grid (two of its long lines are checked on grid lines)"),
    (".p1__morph, .p1__morph *", "Bell's traced outlines lie on the scan and travel to the phone"),
    (".dive__lab[data-rest='0'], .dive__lab[data-rest='0'] *", "a hallway label mid-swing is seen in the sheet's perspective (it rests on the grid)"),
    (".xhair, .xhair *", "the cursor follows the pointer"),
    (".sing, .sing *, .curtain, .curtain *, .enter, .enter *", "the gate (checked on its own: the beacon on an intersection)"),
    (".strip__fill", "the strip's progress bar grows with the scroll"),
    (".sr-only, .p1-we:not(.is-static) .p1-steps", "read aloud only"),
    (".p2-beacon, .p2-beacon *", "the beacon's rings grow from its centre (the centre is checked on an intersection)"),
    (".slip__field", "text typed into a field is placed by the browser; the field's writing line is checked"),
]

GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""
GOTO_Y_JS = """async (sel) => { const e = window.__t2.engine; const [q, off] = sel.split('|'); const el = document.querySelector(q);
  const y = Math.max(0, scrollY + el.getBoundingClientRect().top + (+off || 0) * window.__grid.u);
  if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); return scrollY; }"""

MEASURE_JS = r"""(args) => {
  const { exceptions, tol } = args;
  const u = window.__grid.u, W = document.documentElement.clientWidth, H = innerHeight;
  const out = { u, W, H, edges: 0, baselines: 0, textEdges: 0, worst: 0, fails: [], excepted: {}, pics: 0 };
  const exSel = exceptions.map(([s]) => s).join(', ');
  const exReason = (el) => { for (const [s, r] of exceptions) if (el.closest(s.split(', ').map((x) => x.replace(/ \*$/, '')).join(', ')) || el.matches(s)) return r; return null; };
  const p2 = document.getElementById('page-07');   // round 8: the final room (the old pages 2-3)
  const inDive = false;
  // the origin a box is measured from: the screen's top if it (or what holds it) is pinned or fixed, else page 2's top
  const pinned = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed') return true;
      if (cs.position === 'sticky') {
        const r = n.getBoundingClientRect(), t = parseFloat(cs.top), b = parseFloat(cs.bottom);
        if ((!isNaN(t) && Math.abs(r.top - t) < 0.75) || (!isNaN(b) && Math.abs(H - r.bottom - b) < 0.75)) return true;
      }
    }
    return false;
  };
  const originY = (el) => (pinned(el) ? 0 : el.closest('#page-07, #page-07b') ? p2.getBoundingClientRect().top : el.closest('.stub') ? el.closest('.stub').getBoundingClientRect().top : 0);   // a stub (the spec sheet under the slip) is its own page: from its own top
  const off = (v, step) => { const d = v - Math.round(v / step) * step; return Math.abs(d); };
  const fail = (what, el, v, step, dev) => { out.fails.push({ what, el: desc(el), v: +v.toFixed(2), step: +(step / u).toFixed(2), dev: +dev.toFixed(2) }); };
  const desc = (el) => { if (!el || !el.tagName) return String(el); const c = (el.className && el.className.baseVal === undefined ? el.className : el.getAttribute?.('class') || '').toString().trim().split(/\s+/).slice(0, 2).join('.'); const t = (el.textContent || '').trim().slice(0, 24); return `${el.tagName.toLowerCase()}${c ? '.' + c : ''}${t ? ' "' + t + '"' : ''}`; };
  const check = (what, el, v, step) => { const d = off(v, step); out.worst = Math.max(out.worst, d); if (d > tol) fail(what, el, v, step, d); };
  const visible = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none') return false; o *= +cs.opacity; }
    const cs = getComputedStyle(el); if (cs.visibility !== 'visible' || o < 0.05 || /inset\(50%\)/.test(cs.clipPath)) return false;
    const r = el.getBoundingClientRect(); if (r.width < 0.5 && r.height < 0.5) return false;
    return r.right > 0.5 && r.left < W - 0.5 && r.bottom > 0.5 && r.top < H - 0.5;
  };
  const scaled = (el) => { const r = el.getBoundingClientRect(); return el.offsetWidth > 4 && Math.abs(r.width / el.offsetWidth - 1) > 0.01; };
  const skip = (el) => { const r = exReason(el); if (r) { out.excepted[r] = (out.excepted[r] || 0) + 1; return true; } return false; };
  // an edge counts when it is inside the screen (the screen's own edges are not a design edge)
  const inView = (v, lo, hi) => v > Math.max(lo, 0) + 0.5 && v < Math.min(hi, lo < 0 ? hi : hi) - 0.5 && v > 0.5;
  const inX = (v) => v > 0.5 && v < W - 0.5, inY = (v) => v > 0.5 && v < H - 0.5;
  // a hairline element (1 px thick) is one line: it sits on a grid line on either side of it
  const edgesOf = (el, sides) => {
    const r = el.getBoundingClientRect(), oy = originY(el);
    const thinX = r.width <= 1.5, thinY = r.height <= 1.5;
    const ck = (what, a, b) => { const d = b === undefined ? off(a, u) : Math.min(off(a, u), off(b, u)); out.worst = Math.max(out.worst, d); if (d > tol) fail(what, el, a, u, d); };
    for (const s of sides) {
      if (s === 'l' && inX(r.left)) { out.edges++; thinX ? ck('line (vertical)', r.left, r.right) : ck('left edge', r.left); }
      if (s === 'r' && inX(r.right) && !thinX) { out.edges++; ck('right edge', r.right); }
      if (s === 't' && inY(r.top)) { out.edges++; thinY ? ck('line', r.top - oy, r.bottom - oy) : ck('top edge', r.top - oy); }
      if (s === 'b' && inY(r.bottom) && !thinY) { out.edges++; ck('bottom edge', r.bottom - oy); }
    }
  };
  // which sides of a box are drawn
  const drawnSides = (el, cs) => {
    const s = new Set();
    const bw = (k) => parseFloat(cs[`border${k}Width`]) > 0 && cs[`border${k}Style`] !== 'none' && !/rgba\(.*, 0\)|transparent/.test(cs[`border${k}Color`]);
    if (bw('Left')) s.add('l'); if (bw('Right')) s.add('r'); if (bw('Top')) s.add('t'); if (bw('Bottom')) s.add('b');
    const sh = cs.boxShadow;
    if (sh && sh !== 'none') for (const part of sh.split(/,(?![^()]*\))/)) {
      if (!/inset/.test(part)) continue;
      const nums = part.replace(/rgba?\([^)]*\)/g, '').match(/-?[\d.]+px/g)?.map(parseFloat) || [];
      const [x, y, blur = 0, spread = 0] = nums;
      if (spread > 0) { ['l', 'r', 't', 'b'].forEach((k) => s.add(k)); continue; }
      if (x > 0) s.add('l'); if (x < 0) s.add('r'); if (y > 0) s.add('t'); if (y < 0) s.add('b');
    }
    const bg = cs.backgroundColor, a = bg.startsWith('rgba') ? parseFloat(bg.split(',')[3]) : bg === 'transparent' ? 0 : 1;
    if ((a > 0.05 || (cs.backgroundImage !== 'none' && !el.matches('.p23, .p1__stage, .p1__bg, .dive__win')))) ['l', 'r', 't', 'b'].forEach((k) => s.add(k));
    if (el.matches('.p1__stage, .p1__bg, .dive__win, .p1-dive, .p1-dive-top')) s.clear();   // the grounds: their edges are the screen's
    if (el.matches('img, canvas:not(.p1__canvas):not(.p1__leaders):not(.dive__gl), svg.mark')) ['l', 'r', 't', 'b'].forEach((k) => s.add(k));
    return s;
  };
  // each font's baseline under the top of its text box (Chrome's own layout: a zero-size probe sits on the baseline)
  const bcache = new Map();
  const baseOff = (cs) => {
    const k = `${cs.fontFamily}|${cs.fontWeight}|${cs.fontStyle}|${cs.fontSize}|${cs.fontVariationSettings}`;
    if (bcache.has(k)) return bcache.get(k);
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;line-height:normal;font-family:${cs.fontFamily};font-weight:${cs.fontWeight};font-style:${cs.fontStyle};font-size:${cs.fontSize};font-variation-settings:${cs.fontVariationSettings}`;
    const t = document.createTextNode('Hx'), p = document.createElement('span'); p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    d.append(t, p); document.body.append(d);
    const rg = document.createRange(); rg.selectNodeContents(t);
    const v = p.getBoundingClientRect().top - rg.getClientRects()[0].top; d.remove(); bcache.set(k, v); return v;
  };

  // ---- boxes and text ----
  const all = [...document.querySelectorAll('body *')];
  for (const el of all) {
    if (el.closest('svg') && !el.matches('svg.mark')) { if (!el.closest('.mark') && visible(el)) skip(el); continue; }
    if (el.matches('script, style, br, input[type="checkbox"], input[type="radio"]')) continue;
    if (!visible(el)) continue;
    if (scaled(el)) continue;
    if (skip(el)) continue;
    const cs = getComputedStyle(el);
    const sides = drawnSides(el, cs);
    if (el.matches('.p1__canvas, .p1__leaders, .dive__gl')) sides.clear();     // full-screen picture canvases: their pictures are checked below
    if (sides.size) edgesOf(el, [...sides]);
    // text: each line of each direct text node
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const rects = [...rg.getClientRects()].filter((r) => r.width > 0.5);
      if (!rects.length) continue;
      const fs = parseFloat(cs.fontSize), oy = originY(el), step = fs >= 1.5 * u - 0.01 ? u : u / 2;
      // calibrate on Chrome's own baseline: a zero-size probe just before the text node sits on its first line's baseline
      let bo = baseOff(cs);
      { const pr = document.createElement('span'); pr.style.cssText = 'display:inline-block;width:0;height:0;margin:0;padding:0;border:0;vertical-align:baseline';
        el.insertBefore(pr, n); const py = pr.getBoundingClientRect().top; pr.remove(); const fr = rects.reduce((a, r) => (r.top < a.top ? r : a), rects[0]);
        if (Math.abs(py - (fr.top + bo)) < fs) bo = py - fr.top; }
      const align = getComputedStyle(el.closest('p, h1, h2, h3, h4, li, label, legend, span, a, div') || el).textAlign;
      const lines = new Map(); rects.forEach((r) => { const b = r.top + bo; const key = Math.round(b * 4); if (!lines.has(key)) lines.set(key, { b, l: r.left, r: r.right }); else { const L = lines.get(key); L.l = Math.min(L.l, r.left); L.r = Math.max(L.r, r.right); } });
      for (const L of lines.values()) {
        if (L.b < 0 || L.b > H) continue;
        out.baselines++; check(`baseline (${(fs / u).toFixed(2)} cells)`, el, L.b - oy, step);
      }
      // the text's own edge (first line): its block's start edge for left text, end for right, centre for centred
      const first = [...lines.values()].sort((a, b) => a.b - b.b)[0];
      const isFirstChild = [...el.childNodes].find((c) => (c.nodeType === 3 && c.textContent.trim()) || c.nodeType === 1) === n;
      if (isFirstChild && first && el.matches('p, h1, h2, h3, span.p1-lbl, .p2-row__t, .p2-next__t, .tick > span, .slip__q, .stub__line, .p3__more, .dive__lab-t, .dive__lab-k, .send__w, .send__k, .send__say, .tb__k, .tb__v, .slip-cell__k, .slip-cell__v, .p23-flag, .p1-txt__h, .p1-txt__eyebrow, .p1-kin, .p1-we__word, .p1__credit, .slip__empty, .p2-ans__t')) {
        const x = align === 'right' || align === 'end' ? first.r : align === 'center' ? (first.l + first.r) / 2 : el.getBoundingClientRect().left + parseFloat(cs.paddingLeft);
        if (inX(x)) { out.textEdges++; check(`text ${align === 'right' || align === 'end' ? 'right' : align === 'center' ? 'centre' : 'left'} edge`, el, x, align === 'center' ? u / 2 : u); }
      }
    }
  }
  // ---- the pictures drawn in WebGL / canvas ----
  const p1 = window.__p1;
  if (p1) {
    const cv = document.querySelector('.p1__canvas');
    if (cv && !cv.classList.contains('is-off') && +getComputedStyle(cv).opacity > 0.5) {
      const b = p1.box(), band = p1.band(), SW = cv.clientWidth, SH = cv.clientHeight;
      const bw = SW - band.left - band.right, bh = SH - band.top - band.bottom, wide = (b.right - b.left) / bw >= (b.bottom - b.top) / bh;
      const pairs = wide ? [['phone left', b.left, u], ['phone right', b.right, u], ['phone top', b.top, u]] : [['phone top', b.top, u], ['phone bottom', b.bottom, u], ['phone left', b.left, u]];
      for (const [w, v, s] of pairs) { out.pics++; const d = off(v, s); out.worst = Math.max(out.worst, d); if (d > tol) out.fails.push({ what: w, el: 'phone A (WebGL)', v: +v.toFixed(2), step: 1, dev: +d.toFixed(2) }); }
      out.excepted['phone A keeps its true proportions: its fourth side follows its shape'] = (out.excepted['phone A keeps its true proportions: its fourth side follows its shape'] || 0) + 1;
    }
    for (const s of (p1.shelves?.() || [])) for (const [w, v] of [['shelf left', s.x0], ['shelf right', s.x1], ['shelf', s.y]]) { out.pics++; const d = off(v, u); out.worst = Math.max(out.worst, d); if (d > tol) out.fails.push({ what: w, el: `X-ray name ${s.name}`, v: +v.toFixed(2), step: 1, dev: +d.toFixed(2) }); }
    const bl = p1.bellLines?.(), pf = document.querySelector('.p1__plate');
    if (bl && pf && visible(pf)) for (const [w, v] of [['Bell line x', bl.x], ['Bell line y', bl.y]]) { out.pics++; const d = off(v, u); out.worst = Math.max(out.worst, d); if (d > tol) out.fails.push({ what: w, el: "Bell's drawing", v: +v.toFixed(2), step: 1, dev: +d.toFixed(2) }); }
    const dv = p1.dive?.();
    if (dv && dv.info) for (const f of dv.info) {
      if (!f.quad || f.op < 0.9 || !f.rest) continue;
      const xs = f.quad.map((c) => c[0]), ys = f.quad.map((c) => c[1]);
      for (const [w, v] of [['drawing left', Math.min(...xs)], ['drawing right', Math.max(...xs)], ['drawing top', Math.min(...ys)], ['drawing bottom', Math.max(...ys)]]) {
        out.pics++; const d = off(v, u); out.worst = Math.max(out.worst, d); if (d > tol) out.fails.push({ what: w, el: `hallway frame ${f.i + 1}`, v: +v.toFixed(2), step: 1, dev: +d.toFixed(2) });
      }
    }
  }
  const bc = document.querySelector('.p2-beacon'); if (bc && visible(bc) && !inDive) {
    const r = bc.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2 - originY(bc);
    for (const [w, v] of [['beacon centre x', x], ['beacon centre y', y]]) { out.pics++; const d = off(v, u); out.worst = Math.max(out.worst, d); if (d > tol) out.fails.push({ what: w, el: 'page 2 beacon', v: +v.toFixed(2), step: 1, dev: +d.toFixed(2) }); }
  }
  out.worst = +out.worst.toFixed(3);
  return out;
}"""

P23 = [("ROOM", "#page-07|0", None), ("ROOMT", "#page-07|0", "tick"), ("SLIP", "#page-07b|-8", None), ("SEND", ".slip__send|-14", None)]

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tot = {"edges": 0, "baselines": 0, "textEdges": 0, "pics": 0, "fails": 0, "worst": 0.0}
    excepted, failures = {}, []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        for sz in a.sizes.split(","):
            size, dpr = (sz.split("@") + ["1"])[:2]; dpr = float(dpr)
            w, h = map(int, size.split("x")); mobile = w < 1024
            for theme in a.themes.split(","):
                opts = dict(viewport={"width": w, "height": h}, device_scale_factor=dpr)
                if mobile: opts.update(is_mobile=True, has_touch=True)
                ctx = await b.new_context(**opts)
                if theme == "dark": await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
                page = await ctx.new_page(); errs = []
                page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
                await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
                await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
                gate = await page.evaluate("(() => { const p = document.querySelector('.sing__point').getBoundingClientRect(); const u = window.__grid.u; const x = p.left + p.width / 2, y = p.top + p.height / 2; return { x, y, dx: Math.abs(x - Math.round(x / u) * u), dy: Math.abs(y - Math.round(y / u) * u) }; })()", isolated_context=False)
                gfail = [f"gate beacon off its intersection by {gate['dx']:.2f}, {gate['dy']:.2f}"] if max(gate["dx"], gate["dy"]) > a.tol + 0.01 else []
                await page.keyboard.press("Enter")
                await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
                await page.wait_for_timeout(600)
                stops = await page.evaluate("window.__p1.stops", isolated_context=False)
                want = a.stops.split(",") if a.stops else None
                seq = [(k, "p1", v) for k, v in stops.items()] + [(k, "y", (q, act)) for k, q, act in P23]
                lines = []
                for stop, kind, arg in seq:
                    if want and stop not in want: continue
                    if kind == "p1":
                        await page.evaluate(GOTO_JS, arg, isolated_context=False)
                        await page.wait_for_timeout(SETTLE.get(stop, 800))
                    else:
                        q, act = arg
                        await page.evaluate(GOTO_Y_JS, q, isolated_context=False)
                        if act == "tick": await page.evaluate("window.__p23.tick('web'); window.__p23.tick('app');", isolated_context=False)
                        await page.wait_for_timeout(1200)
                        await page.evaluate(GOTO_Y_JS, q, isolated_context=False); await page.wait_for_timeout(500)
                    m = await page.evaluate(MEASURE_JS, {"exceptions": EXCEPTIONS, "tol": a.tol}, isolated_context=False)
                    fs = list(m["fails"])
                    if gfail and stop == seq[0][0]: fs += [{"what": g, "el": "gate", "v": 0, "step": 1, "dev": 1} for g in gfail]
                    for k in ("edges", "baselines", "textEdges", "pics"): tot[k] += m[k]
                    tot["fails"] += len(fs); tot["worst"] = max(tot["worst"], m["worst"])
                    for k, v in m["excepted"].items(): excepted[k] = excepted.get(k, 0) + v
                    for f in fs: failures.append((size, theme, stop, f))
                    if fs and a.shots: await page.screenshot(path=str(out / f"{size}_{theme}_{stop}.png"))
                    print(f"{size} {theme} {stop}: {m['edges']} edges, {m['baselines']} baselines, {m['textEdges']} text edges, {m['pics']} picture edges; worst {m['worst']:.2f} px; "
                          + ("clean" if not fs else f"{len(fs)} off: " + "; ".join(f"{f['what']} {f['el']} by {f['dev']}" for f in fs[:6])), flush=True)
                if errs: print(f"{size} {theme} console errors: {errs}")
                await ctx.close()
        await b.close()
    print(f"\nMEASURED: {tot['edges']} edges, {tot['baselines']} baselines, {tot['textEdges']} text edges, {tot['pics']} picture edges (WebGL / canvas)")
    print(f"WORST DEVIATION (inside tolerance): {tot['worst']:.3f} px; OFF THE GRID (> {a.tol} px): {tot['fails']}")
    print("EXCEPTIONS (deliberate, with reasons; times met):")
    for k, v in sorted(excepted.items(), key=lambda x: -x[1]): print(f"  {v:5d}  {k}")
    (out / "gridcheck.json").write_text(json.dumps({"totals": tot, "excepted": excepted, "failures": failures}, indent=1), encoding="utf-8")

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); ap.add_argument("--themes", default="light"); ap.add_argument("--out", default="tools/shots/r8/grid")
    ap.add_argument("--stops", default=""); ap.add_argument("--tol", type=float, default=TOL); ap.add_argument("--shots", action="store_true")
    with BrowserLock():
        asyncio.run(main(ap.parse_args()))

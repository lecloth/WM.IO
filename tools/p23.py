"""Pages 2 and 3 (Take 2): named stops, screenshots, geometry, length, console errors.
  python -I tools/p23.py --sizes 384x734,1440x900 [--themes light,dark] [--out tools/shots/p23] [--geom] [--reduced] [--only P2,SLIP]
Stops (scroll positions, each a frozen frame):
  P2      page 2 has arrived (page 1's callout done)          TAP2   two rows ticked (answers, the head's feed)
  ROWS    all five ticked, the last rows in view             SLIP   the slip's head docked under the strip
  WHEN    "When do you need it?" at the top                  SEND   the Send in the middle of the screen
  FULL    every field filled, the Send in view               TAIL   "or see how we think" + Detail B rising
  PIN     the tail pinned, the circle drawn                  CALLOUT  mid-growth (q 0.5)
  P4      page 4 has arrived
With --geom: the geometry check at every stop (see MEASURE_JS). Prints one line per stop and a total."""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

STOPS = ["P2", "TAP2", "ROWS", "SLIP", "WHEN", "SEND", "FULL", "TAIL", "PIN", "CALLOUT", "P4"]
# where each stop sits, in document y (computed in the page, so it follows the real layout)
Y_JS = r"""(stop) => {
  const p2 = document.getElementById('page-02'), p3 = document.getElementById('page-03'), head = p2.querySelector('.slip-head');
  const strip = document.getElementById('strip').offsetHeight, H = innerHeight, Y = (el) => el.getBoundingClientRect().top + scrollY;
  const tail = p3.querySelector('.p3__tail'), pin = p3.querySelector('.p3__pin'), G = tail.offsetHeight - pin.offsetHeight;
  const headNat = Y(p3) - head.offsetHeight;
  switch (stop) {
    case 'P2': case 'TAP2': return Y(p2) - (parseFloat(getComputedStyle(p2).marginTop) < 0 ? 0 : 0);
    case 'ROWS': { const r = p2.querySelector('.p2-row:last-child'); return Math.max(Y(p2), Y(r) + r.offsetHeight - H * 0.62); }
    case 'SLIP': return headNat - strip - 12;
    case 'WHEN': return Y(p3.querySelector('.slip__sec--when')) - strip - 12;
    case 'SEND': case 'FULL': { const s = p3.querySelector('.slip__send'); return Y(s) + s.offsetHeight / 2 - H * 0.5; }
    case 'TAIL': return Y(tail) - H * 0.45;
    case 'PIN': return Y(tail) + 2;
    case 'CALLOUT': return Y(tail) + G * 0.5;
    case 'P4': return Y(tail) + G;
  } }"""
GOTO_JS = """async (y) => { const e = window.__t2.engine; if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update(); dispatchEvent(new Event('scroll')); return scrollY; }"""
FILL_JS = """() => { const t = window.__p23; ['web','app','mess','ai','sec'].forEach((id) => t.tick(id, true));
  const f = document.getElementById('slip');
  f.querySelector('input[name=when][value="In 1–3 months"]').click();
  const n = f.querySelector('#slip-name'); n.value = 'Khalid Al Mansoori'; n.dispatchEvent(new Event('input', { bubbles: true }));
  const o = f.querySelector('#slip-note'); o.value = 'We run three branches and the booking sheet lives in WhatsApp groups. Can we talk on Sunday?'; o.dispatchEvent(new Event('input', { bubbles: true }));
  return true; }"""
FOCUS = {"P2": ".p2__h, .p2__sub, .p2-row__t", "TAP2": ".p2-row.is-on .p2-row__t, .p2-row.is-on .p2-ans__t", "ROWS": ".p2-row:last-child .p2-row__t, .p2-row:last-child .p2-ans__t",
  "SLIP": ".slip-cell, .slip__sec--needs .slip__q, .slip__needs li, .slip__empty", "WHEN": ".slip__sec--when .slip__q, .slip__sec--when .tick", "SEND": ".send__w, .send__say, .send__k",
  "FULL": ".send__w, .send__say, .send__k", "TAIL": ".p3__more", "PIN": ".p3__more", "CALLOUT": "", "P4": ""}
MEASURE_JS = r"""([stop, focus]) => {
  const W = innerWidth, H = innerHeight, R = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) return false;
    let p = el; while (p) { const c = getComputedStyle(p); if (+c.opacity < 0.05 || c.display === 'none') return false; p = p.parentElement; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const onScreen = (r) => r.b > 0.5 && r.t < H - 0.5;
  const items = [];
  const add = (name, el, kind, extra = {}) => { if (!vis(el)) return; const r = R(el); if (!onScreen(r)) return; items.push({ name, kind, ...r, ...extra }); };
  add('strip', document.getElementById('strip'), 'chrome');
  add('titleblock', document.querySelector('.titleblock'), 'chrome');
  const head = document.querySelector('.slip-head');
  if (head.classList.contains('is-stuck')) add('slip head (stuck)', head, 'chrome');
  // page 2/3's own lines and controls: each must sit inside the screen, clear of the others
  const sel = ['.p23-flag', '.p2__h', '.p2__sub', '.p2-row__no', '.p2-row .mark', '.p2-row__t', '.p2-row.is-on .p2-ans__t', '.slip-cell', '.slip-head__feed',
    '.slip__q', '.slip__needs li', '.slip__empty', '.tick', '.slip__field', '.slip__count', '.slip__pend', '.send__k', '.send__w', '.send__arrow', '.send__head', '.send__say', '.p3__more'];
  const els = new Set();
  sel.forEach((s) => document.querySelectorAll(s).forEach((el) => { if (el.closest('#page-02, #page-03') && !els.has(el)) { els.add(el);
    const inHead = !!el.closest('.slip-head');
    if (inHead && head.classList.contains('is-stuck')) return;   // stuck, the head is one piece of chrome
    add(`${s} ${(el.textContent || '').trim().slice(0, 24)}`, el, inHead ? 'head' : 'text', { focus: !!(focus && el.matches(focus)), clipped: el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' && !el.matches('.slip-head__feed') }); } }));
  const cb = window.__p23?.calloutB?.state?.();
  const call = document.querySelector('.p3-callout.on');
  if (call && cb) { const c = call.querySelector('.p3-callout__c'); const r = +c.getAttribute('r'), x = +c.getAttribute('cx'), y = +c.getAttribute('cy');
    if (r < cb.r0 + 1) items.push({ name: 'detail B circle', kind: 'window', l: x - r, t: y - r, r: x + r, b: y + r });
    add('detail B tag', call.querySelector('.p3-callout__tag'), 'text'); }
  return { W, H, items, stuck: head.classList.contains('is-stuck') };
}"""

def check(m, stop):
    W, H, items, probs = m["W"], m["H"], m["items"], []
    for it in items:
        if it["kind"] in ("text", "head", "window") and (it["l"] < -0.5 or it["r"] > W + 0.5):
            probs.append(f"{it['name']} leaves the screen sideways ({it['l']:.0f}..{it['r']:.0f} in {W})")
        if it.get("clipped"): probs.append(f"{it['name']} is cut off by its own box")
        if it["kind"] == "window" and stop == "PIN" and (it["t"] < -0.5 or it["b"] > H + 0.5): probs.append(f"{it['name']} leaves the screen")
    def hit(a, b, pad=1):
        return a["l"] < b["r"] - pad and b["l"] < a["r"] - pad and a["t"] < b["b"] - pad and b["t"] < a["b"] - pad
    full = lambda it: it["t"] >= -0.5 and it["b"] <= H + 0.5
    for i, a in enumerate(items):
        for b in items[i + 1:]:
            ks = {a["kind"], b["kind"]}
            if ks == {"chrome"} or ks == {"head"}: continue
            if "chrome" in ks:
                # content passing under the fixed strip / title block / the stuck slip head is how a scrolling page works;
                # at a stop, a line that is otherwise fully on screen must not be hidden under them
                o = a if a["kind"] != "chrome" else b; c = b if o is a else a
                if c["name"].startswith("slip head") and o["kind"] == "head": continue
                # the stop's own subject must be fully clear of them; anything else passing under them is the designed scroll
                if hit(o, c):
                    if o.get("focus") and full(o): probs.append(f"{o['name']} hidden under {c['name']}")
                    else: m.setdefault("under", []).append(o["name"])
                continue
            if {a["name"].split(" ")[0], b["name"].split(" ")[0]} == {".send__arrow", ".send__head"}: continue   # the head sits on the shaft's end
            if "window" in ks and "detail B tag" in (a["name"], b["name"]): continue
            if hit(a, b): probs.append(f"{a['name']} overlaps {b['name']}")
    return probs

async def run(pw, a, size, theme, out):
    w, h = map(int, size.split("x")); mobile = w < 1024
    b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
    opts = dict(viewport={"width": w, "height": h}, reduced_motion="reduce" if a.reduced else "no-preference")
    if mobile: opts.update(is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx = await b.new_context(**opts)
    if theme == "dark": await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
    page = await ctx.new_page(); errs = []
    page.on("pageerror", lambda e: errs.append(str(e)[:200])); page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200]))
    ev = lambda js, arg=None: page.evaluate(js, arg, isolated_context=False)
    await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
    await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
    await page.keyboard.press("Enter")
    await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
    await page.wait_for_timeout(700)
    total = 0; tag = f"{size}_{theme}{'_rm' if a.reduced else ''}"
    lengths = {}
    lengths["p2p3_empty"] = round(await ev("(document.getElementById('page-04').offsetTop - document.getElementById('page-02').offsetTop) / innerHeight"), 2)
    stops = [s for s in STOPS if not a.only or s in a.only.split(",")]
    if a.reduced: stops = [s for s in stops if s not in ("PIN", "CALLOUT")]
    for stop in stops:
        if stop == "TAP2": await ev("() => { window.__p23.tick('web'); window.__p23.tick('app'); }")
        if stop == "ROWS": await ev("() => ['mess','ai','sec'].forEach((id) => window.__p23.tick(id))")
        if stop == "FULL": await ev(FILL_JS)
        await page.wait_for_timeout(500)
        y = await ev(Y_JS, stop)
        await ev(GOTO_JS, y)
        await page.wait_for_timeout(1200 if stop in ("TAIL", "TAP2", "ROWS", "P2") else 800)
        await ev(GOTO_JS, y)   # again, after any refresh moved things
        await page.wait_for_timeout(250)
        await page.screenshot(path=str(out / f"{tag}_{stop}.png"))
        if a.geom:
            m = await ev(MEASURE_JS, [stop, FOCUS.get(stop, '')]); probs = check(m, stop); total += len(probs)
            under = len(m.get("under", []))
            print(f"{tag} {stop}: {'clean' if not probs else '; '.join(probs)}{f'  (designed: {under} lines scrolling under the strip / title block / slip head)' if under else ''}", flush=True)
        else: print(f"{tag} {stop} shot", flush=True)
    lengths["p2p3_full"] = round(await ev("(document.getElementById('page-04').offsetTop - document.getElementById('page-02').offsetTop) / innerHeight"), 2)
    print(f"{tag} length pages 2-3 in viewports: {lengths}; console: {errs or 'none'}", flush=True)
    await b.close()
    return total + len(errs)

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    total = 0
    async with async_playwright() as pw:
        for size in a.sizes.split(","):
            for theme in a.themes.split(","):
                total += await run(pw, a, size, theme, out)
    print("TOTAL PROBLEMS:", total)

ap = argparse.ArgumentParser()
ap.add_argument("--sizes", default="384x734,390x844,1280x720,1366x768,1440x900,1920x1080"); ap.add_argument("--themes", default="light")
ap.add_argument("--out", default="tools/shots/p23"); ap.add_argument("--geom", action="store_true"); ap.add_argument("--reduced", action="store_true"); ap.add_argument("--only", default="")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

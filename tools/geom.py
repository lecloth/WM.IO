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

SIZES = "384x734,390x844,1280x720,1366x768,1440x900,1920x1080"
STOP_P = {"S0": 0.12, "morph": 0.66, "S1": 1.5, "fade": 2.08, "S2": 2.78, "YOU": 3.08, "TASK": 3.24, "STAMPS": 3.45, "END": 3.8}
SETTLE = {"STAMPS": 1600, "END": 1600}
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
  // the travelling word belongs to the line it stands in (its slot there is see-through by design)
  const fly = document.querySelector('.p1-fly'), fs = fly && fly.dataset.state;
  if (fs && fs !== 'off') add(`text ${fs === 'a' ? 's2' : fs === 'c' ? 'task' : 'you'}.fly`, fly.querySelector(fs === 'a' ? '.lo' : '.up'), 'text');
  document.querySelectorAll('.p1-stamp.is-in').forEach((s, i) => add(`stamp ${s.textContent.trim()}`, s, 'stamp'));
  document.querySelectorAll('.p1-lbl.on').forEach((l) => add('label ' + l.textContent, l, 'label'));
  add('credit', document.querySelector('.p1__credit'), 'text');
  const pf = document.querySelector('.p1__plate'); if (vis(pf)) items.push({ name: 'plate', kind: 'picture', ...R(pf) });
  const p1 = window.__p1, band = p1 ? p1.band() : null;
  if (p1 && p1.lines.drawn) {   // Bell's lines on their way: between the plate and the phone they're landing on
    const a = p1.plate(), b = p1.box();
    items.push({ name: 'lines', kind: 'picture', l: Math.min(a.left, b.left), t: Math.min(a.top, b.top), r: Math.max(a.left + a.width, b.right), b: Math.max(a.top + a.height, b.bottom) });
  }
  if (p1 && +getComputedStyle(document.querySelector('.p1__canvas')).opacity > 0.05) {
    const b = p1.box(); items.push({ name: 'phone', kind: 'picture', l: b.left, t: b.top, r: b.right, b: b.bottom });
  }
  return { W, H, items, band };
}"""

def check(m, stop):
    W, H, items, problems = m["W"], m["H"], m["items"], []
    band = m.get("band")
    for it in items:
        if it["kind"] == "picture" and band and (it["l"] < band["left"] - 1 or it["t"] < band["top"] - 1 or it["r"] > W - band["right"] + 1 or it["b"] > H - band["bottom"] + 1):
            problems.append(f"{it['name']} leaves its band ({it['l']:.0f},{it['t']:.0f})-({it['r']:.0f},{it['b']:.0f}); band ({band['left']:.0f},{band['top']:.0f})-({W - band['right']:.0f},{H - band['bottom']:.0f})")
        if it["kind"] in ("picture", "text", "label", "stamp") and (it["l"] < -0.5 or it["t"] < -0.5 or it["r"] > W + 0.5 or it["b"] > H + 0.5):
            problems.append(f"{it['name']} leaves the screen ({it['l']:.0f},{it['t']:.0f})-({it['r']:.0f},{it['b']:.0f}) in {W}x{H}")
    def hit(a, b, pad=0):
        return a["l"] < b["r"] - pad and b["l"] < a["r"] - pad and a["t"] < b["b"] - pad and b["t"] < a["b"] - pad
    for i, a in enumerate(items):
        for b in items[i + 1:]:
            kinds = {a["kind"], b["kind"]}
            if kinds == {"chrome"}: continue
            if kinds == {"text"} and a["name"].split(".")[0] == b["name"].split(".")[0]: continue   # lines of one block
            if "picture" in kinds and "label" in kinds: continue   # labels sit beside pieces by design (leader lines)
            if hit(a, b, 1):
                problems.append(f"{a['name']} overlaps {b['name']}")
    return problems

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    report, total = [], 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        for size in a.sizes.split(","):
            w, h = map(int, size.split("x"))
            mobile = w < 1024
            for theme in ("light", "dark"):
                opts = dict(viewport={"width": w, "height": h})
                if mobile: opts.update(is_mobile=True, has_touch=True, device_scale_factor=2)
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
                for stop, p in STOP_P.items():
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

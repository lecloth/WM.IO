"""Type and wording check (TYPE_RULES.md, round 8): the machine half of the gate. At every stop, at each size and theme,
it measures every visible word's ink box and every drawn line and shape, and counts five kinds of failure:

  1 crossings  a drawn line enters a word's ink box (or a word sits over a picture / drawn shape)
  2 clearance  a word nearer than half a cell (u/2 - 0.75 px: lines are measured at their centre) to a drawn line or shape
  3 scale      a family, weight, size (in cells) or line height outside TYPE_RULES.md's tables; a drawing with more
               than three label sizes
  4 wording    straight quotes, three dots, hyphen ranges, Title Case in serif lines, number style, measurement style,
               a draft with no visible flag, a signed-off line that is flagged
  5 breaks     a lone word on a line of a multi-line text; a heading (1.5 cells and up) whose shortest line is under
               half its longest

Failures are counted once per (text block, drawn source) pair (its worst distance), so one rule beside one label is
one failure however many words it passes; a crossing is counted as a crossing only (not again as clearance).

What it collects (tools/typecheck.js, in the page):
  - words: every visible text node split into words (Range rects); the ink box from the font's own metrics (canvas
    measureText with the computed font, letter spacing and text-transform: cap or ascender top to baseline or descender
    bottom). SVG text: one box per text element, mapped by its screen matrix (so the turned measurements work).
    Skipped: opacity < 0.05, visibility hidden, display none, clip-path inset(50%) (screen-reader copies), a
    transparent colour (page 1's travelling-word slots), clipped out by an overflow ancestor, off screen, and covered
    by an opaque box painted above (elementFromPoint with pointer events forced on; only an opaque background or a
    picture smaller than 90% of the screen counts as covering).
  - drawn lines: borders; inset box-shadows of 1-2.5 px (the sides read from the offsets: `inset 0 1px 0` top, `inset 0
    -1px 0` bottom, `inset 1px 0 0` left, `inset -1px 0 0` right, `inset 0 0 0 1px` all four); boxes at most 4 px thick
    painted with a colour (hairline elements: the strip's base line, its 3 px progress bars, which are drawn bars, not
    background); thin absolutely placed ::before/::after rules (the strip's segment rules, page 2's desktop leaders);
    SVG path/line/polyline/polygon/rect/circle/ellipse with a visible stroke, sampled every ~4 screen px (a stroke
    hidden by its dash offset, an undrawn tick, is skipped).
  - shapes: visible img / canvas / video smaller than 90% of the screen.
  - window.__drawn() (round 8 pages): canvas and WebGL lines, shapes and texts in viewport px. Absent (the round 7
    build): a fallback from window.__p1 (phone A's pieces' boxes, the X-ray shelves, the hallway's sheets as shapes).
Excluded, with reasons: the page grid (.board__grid and any element painted with the grid gradient: TYPE_RULES rule 1's
background grid); the WE / verb construction grid's `.g` paths (the type's own construction grid, also background
grid); full-screen layers (.p1__canvas, .p1__leaders, .dive__gl: their content arrives through __drawn); the cursor
(.xhair); screen-reader-only text; the gate's curtain once the page is open; anything inside `.is-dive` (round 7's page 2
parked under the hallway, hidden by the WebGL end wall, which the DOM can't see).

  python -I tools/typecheck.py [--sizes 384x734@2.8125,...] [--themes light,dark] [--stops S0,F1] [--shots] [--quick]
                               [--reduced] [--jobs 3] [--out tools/shots/r8/typecheck]
Writes typecheck.json; the last line of stdout is `TYPECHECK machine failures: N`.
"""
import argparse, asyncio, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"
QUICK = "384x734@2.8125,1440x900@1"
URL = "http://127.0.0.1:8109/?first"
RULES = ["crossings", "clearance", "scale", "wording", "breaks"]

# rule 4: words that may start with a capital mid-sentence (proper names, the deliberate YOU / WE, the Draft flag)
PROPER = ["Bell", "Edison", "Yale", "Babbage", "Lovelace", "Leonardo", "iPhone", "Android", "Galaxy", "WhatsApp", "AI", "US",
          "A.", "G.", "A", "G", "YOU", "WE", "Draft", "I", "Patent", "Fig", "Fig.", "No.", "Tunis",
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]   # round 8b: days are proper names
# rule 4: signed-off lines (never flagged)
SIGNED = ["Now, how can we serve you?", "What’s the task list? Tick everything that fits.", "Cut to the chase", "Glad you’re finally here."]

JS = (Path(__file__).resolve().parent / "typecheck.js").read_text(encoding="utf-8")

STOPS_JS = r"""() => {
  if (window.__t2stops) return window.__t2stops().map((s) => ({ name: s.name, y: s.y }));
  const out = [], p1 = window.__p1;
  if (p1) for (const [k, p] of Object.entries(p1.stops)) out.push({ name: k, y: p1.yAt(p) });
  const H = innerHeight, strip = document.getElementById('strip')?.offsetHeight || 0, docTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  [...document.querySelectorAll('#sheets > section')].slice(1).forEach((s) => {
    const t = docTop(s) - strip, h = s.offsetHeight; out.push({ name: s.id, y: t });   // its top just below the strip
    if (h > 1.5 * H) out.push({ name: `${s.id}~end`, y: t + h - H });
  });
  return out;
}"""
PARK_JS = r"""async (y) => {
  const e = window.__t2?.engine; y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
  if (e?.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  const raf = () => new Promise((r) => requestAnimationFrame(r));
  await raf(); await raf(); e?.ScrollTrigger?.update();
  const t0 = performance.now();
  const busy = () => {
    if (window.__p1?.settled && window.__p1.settled() === false) return true;
    const a = document.getAnimations().filter((x) => x.playState === 'running' && (x.effect?.getComputedTiming?.().iterations ?? 1) !== Infinity);
    if (a.length) return true;
    const g = window.gsap?.globalTimeline?.getChildren?.(true, true, false) || [];
    return g.some((t) => t.isActive?.() && !(t.vars && t.vars.repeat === -1));
  };
  while (performance.now() - t0 < 3000) { await raf(); if (!busy()) break; }
  await raf(); await raf();
  return { y: scrollY, waited: Math.round(performance.now() - t0) };
}"""
OVERLAY_JS = r"""(fs) => {
  document.querySelectorAll('.tc-overlay').forEach((e) => e.remove());
  const o = document.createElement('div'); o.className = 'tc-overlay'; o.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  fs.forEach((f) => { if (!f.box) return; const [l, t, r, b] = f.box; const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:${l}px;top:${t}px;width:${r - l}px;height:${b - t}px;outline:1px solid ${f.kind === 'crossings' ? '#E0002A' : '#FF8A00'}`; o.append(d); });
  document.body.append(o);
}"""

async def enter(page, reduced):
    await page.goto(URL, wait_until="load")
    await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=30000)
    await page.keyboard.press("Enter")
    if reduced: await page.wait_for_timeout(1200)
    else:
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=30000)
        await page.wait_for_timeout(700)

async def run_size(b, sz, a, load_lock, results):
    size, dpr = (sz.split("@") + ["1"])[:2]; dpr = float(dpr); w, h = map(int, size.split("x"))
    out = Path(a.out)
    for theme in a.themes.split(","):
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=dpr, reduced_motion="reduce" if a.reduced else "no-preference")
        if w < 1024: opts.update(is_mobile=True, has_touch=True)
        ctx = await b.new_context(**opts)
        if theme == "dark": await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        async with load_lock:   # the plain http.server refuses connections under parallel loads: one page loads at a time
            await enter(page, a.reduced)
            await page.wait_for_timeout(300)
        if a.reduced:
            H = await page.evaluate("document.documentElement.scrollHeight")
            stops = [{"name": f"rm{i:02d}", "y": y} for i, y in enumerate(range(0, H, h))]
        else:
            stops = await page.evaluate(STOPS_JS, isolated_context=False)
        want = set(a.stops.split(",")) if a.stops else None
        for st in stops:
            if want and st["name"] not in want: continue
            await page.evaluate(PARK_JS, st["y"], isolated_context=False)
            m = await page.evaluate(JS, {"stop": st["name"], "proper": PROPER, "signed": SIGNED}, isolated_context=False)
            n = sum(len(m["fails"][k]) for k in RULES)
            row = {"size": size, "dpr": dpr, "theme": theme, "stop": st["name"], "counts": {k: len(m["fails"][k]) for k in RULES},
                   "measured": {k: m[k] for k in ("words", "lines", "shapes", "texts")}, "drawn": m["drawn"], "fallback": m["fallback"], "fails": m["fails"]}
            results.append(row)
            if n and a.shots:
                flat = [dict(f, kind=k) for k in ("crossings", "clearance") for f in m["fails"][k]]
                await page.evaluate(OVERLAY_JS, flat, isolated_context=False)
                await page.screenshot(path=str(out / f"{size}_{theme}_{st['name']}.png"))
                await page.evaluate("document.querySelectorAll('.tc-overlay').forEach((e) => e.remove())", isolated_context=False)
            print(f"{size} {theme} {st['name']}: {m['words']} words, {m['lines']} lines, {m['shapes']} shapes, {m['texts']} drawn texts; "
                  + ("clean" if not n else " ".join(f"{k} {len(m['fails'][k])}" for k in RULES if m["fails"][k])), flush=True)
        if errs: print(f"{size} {theme} page errors: {errs[:3]}", flush=True)
        await ctx.close()

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    t0 = time.time(); results = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        load_lock = asyncio.Lock(); sem = asyncio.Semaphore(a.jobs)
        async def one(sz):
            async with sem: await run_size(b, sz, a, load_lock, results)
        await asyncio.gather(*(one(sz) for sz in a.sizes.split(",")))
        await b.close()
    tot = {k: sum(r["counts"][k] for r in results) for k in RULES}
    N = sum(tot.values())
    drawn = any(r["drawn"] for r in results); fb = any(r["fallback"] for r in results)
    # the distinct failures, across sizes and themes (one line per rule + text + source)
    uniq = {}
    for r in results:
        for k in RULES:
            for f in r["fails"][k]:
                key = (k, f.get("text"), f.get("src") or f.get("what"))
                u = uniq.setdefault(key, {"rule": k, "text": f.get("text"), "what": f.get("src") or f.get("what"), "dist": f.get("dist"), "n": 0, "where": []})
                u["n"] += 1
                if len(u["where"]) < 4: u["where"].append(f"{r['size']} {r['theme']} {r['stop']}")
                if f.get("dist") is not None and (u["dist"] is None or f["dist"] < u["dist"]): u["dist"] = f["dist"]
    (out / ("typecheck_reduced.json" if a.reduced else "typecheck.json")).write_text(json.dumps({"totals": tot, "failures": N, "drawn": drawn, "fallback": fb,
        "seconds": round(time.time() - t0), "distinct": list(uniq.values()), "rows": results}, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"\nRAN {len(results)} frames in {time.time() - t0:.0f} s; non-DOM content: " + ("window.__drawn" if drawn else ("page 1 fallback (no window.__drawn)" if fb else "none")))
    print("BY RULE: " + ", ".join(f"{k} {tot[k]}" for k in RULES))
    print(f"DISTINCT FAILURES ({len(uniq)}), most frequent first:")
    for u in sorted(uniq.values(), key=lambda x: -x["n"])[:a.top]:
        print(f"  [{u['rule']}] x{u['n']} {u['text']} :: {u['what']}" + (f" ({u['dist']} px)" if u["dist"] is not None else "") + f"  e.g. {u['where'][0]}")
    print(f"TYPECHECK machine failures: {N}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sizes", default=SIZES); ap.add_argument("--themes", default="light,dark"); ap.add_argument("--stops", default="")
    ap.add_argument("--shots", action="store_true"); ap.add_argument("--quick", action="store_true"); ap.add_argument("--reduced", action="store_true")
    ap.add_argument("--jobs", type=int, default=3); ap.add_argument("--top", type=int, default=40); ap.add_argument("--out", default="tools/shots/r8/typecheck")
    a = ap.parse_args()
    if a.quick: a.sizes, a.themes = QUICK, "light"
    with BrowserLock():
        asyncio.run(main(a))

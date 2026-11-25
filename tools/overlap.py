"""Overlap check (Part 5 "Round 7": nothing overlaps). At every stop of pages 1-3, at each size: every visible text box
(each line of text, grouped by its block: a headline, a label, a cell of the title block, ...) against every other text
box and against every drawing on screen (Bell's drawing, phone A's pieces, the hallway's drawings and the real phones,
page 2's tick boxes). Any intersection is listed. Also reports each hallway drawing's share of the screen at rest.
  python -I tools/overlap.py [--sizes ...] [--out tools/shots/r7/overlap]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from gridcheck import SIZES, SETTLE, GOTO_JS, GOTO_Y_JS, P23

MEASURE = r"""() => {
  const W = innerWidth, H = innerHeight, out = { texts: [], pics: [] };
  const visible = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none') return false; o *= +cs.opacity; }
    const cs = getComputedStyle(el); if (cs.visibility !== 'visible' || o < 0.05 || /inset\(50%\)/.test(cs.clipPath)) return false;
    if (/rgba\(.*,\s*0\)|transparent/.test(cs.color)) return false;   // a see-through slot (its word travels on its own)
    return true;
  };
  const p2 = document.getElementById('page-07');
  const inDive = false;
  const block = (el) => el.closest('p, h1, h2, h3, h4, li, legend, label, .tb__cell, .tb__theme, .strip__seg, .slip-cell, .slip-head__feed, .p1-lbl, .p2-row__hit, .p2-next, .send, .dive__lab, .dive__open, .p1-fly, .p1-verb, .p1-mean, .p23-flag, text') || el;
  const desc = (el) => `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').split(' ')[0]} "${(el.textContent || '').trim().slice(0, 22)}"`;
  const groups = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement; if (!el || el.closest('script, style, .sr-only, .p1-steps, title, .enter, .curtain, .xhair')) continue;
    if (el.closest('.dive__lab[data-rest="0"]')) continue;   // round 8: a label mid-swing is seen in perspective (its lines' upright boxes overlap); judged at rest
    if (el.closest('#page-07, #page-07b') && inDive) continue;
    if (!visible(el)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    // the boxes that clip it (overflow), and whether a page below the one on top is hidden under it (a stub under page 3)
    const clips = []; for (let c = el.parentElement; c && c !== document.body; c = c.parentElement) { const cs = getComputedStyle(c); if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') clips.push(c.getBoundingClientRect()); }
    const stub = el.closest('.stub');
    for (const r0 of rg.getClientRects()) {
      let r = { left: r0.left, top: r0.top, right: r0.right, bottom: r0.bottom };
      for (const c of clips) r = { left: Math.max(r.left, c.left), top: Math.max(r.top, c.top), right: Math.min(r.right, c.right), bottom: Math.min(r.bottom, c.bottom) };
      r.width = r.right - r.left; r.height = r.bottom - r.top;
      if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
      if (stub) { const t = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); if (!t || !stub.contains(t)) continue; }
      const b = block(el); if (!groups.has(b)) groups.set(b, []);
      // the glyphs' own height (the line box's middle part), not the line's leading
      groups.get(b).push({ l: r.left, t: r.top + r.height * 0.12, r: r.right, b: r.bottom - r.height * 0.12 });
    }
  }
  const host = (b) => { if (!b.classList?.contains('p1-fly')) return null; const st = b.dataset.state, w = b.dataset.w;
    return w === 'you' ? (st === 'a' ? 's2' : st === 'c' ? 'task' : null) : (st === 'a' ? 'task' : st === 'b' ? 'we' : null); };
  for (const [b, rs] of groups) out.texts.push({ name: desc(b), rects: rs, chrome: !!b.closest('.titleblock, .strip'), page: !!b.closest('#page-07, #page-07b'),
    k: b.closest('[data-k]')?.dataset.k || host(b) });
  const pic = (name, l, t, r, b) => { if (r - l > 1 && b - t > 1) out.pics.push({ name, l, t, r, b }); };
  const p1 = window.__p1;
  const pf = document.querySelector('.p1__plate'); if (pf && visible(pf) && +getComputedStyle(pf).opacity > 0.05) { const r = pf.getBoundingClientRect(); pic("Bell's drawing", r.left, r.top, r.right, r.bottom); }
  const cv = document.querySelector('.p1__canvas');
  if (p1 && cv && !cv.classList.contains('is-off') && +getComputedStyle(cv).opacity > 0.5) p1.phone.parts.forEach((pt) => { const b = p1.phone.partBox(pt); pic(`phone A ${pt.name}`, b.left, b.top, b.right, b.bottom); });
  const dv = p1?.dive?.(); out.shares = [];
  if (dv && dv.info) dv.info.forEach((f) => {
    if (!f.quad || f.op < 0.5) return;
    const xs = f.quad.map((c) => c[0]), ys = f.quad.map((c) => c[1]);
    pic(`hallway drawing ${f.i + 1}`, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
    if (f.rest) out.shares.push({ i: f.i + 1, share: +((Math.max(...ys) - Math.min(...ys)) / H).toFixed(3), width: +((Math.max(...xs) - Math.min(...xs)) / W).toFixed(3) });
  });
  if (!inDive) document.querySelectorAll('#page-07 .p2-row .mark').forEach((m, k) => { if (visible(m)) { const r = m.getBoundingClientRect(); pic(`tick box ${k + 1}`, r.left, r.top, r.right, r.bottom); } });
  return out;
}"""

def check(m, under):
    """overlaps; text of pages 2-3 scrolling under the fixed strip or title block (both opaque) is counted apart"""
    bad = []
    hit = lambda a, b: a["l"] < b["r"] - 0.5 and b["l"] < a["r"] - 0.5 and a["t"] < b["b"] - 0.5 and b["t"] < a["b"] - 0.5
    T = m["texts"]
    for i, a in enumerate(T):
        for b in T[i + 1:]:
            if a.get("k") and a.get("k") == b.get("k") and ("p1-fly" in a["name"] or "p1-fly" in b["name"]): continue   # a word standing in its own line
            if any(hit(x, y) for x in a["rects"] for y in b["rects"]):
                if (a.get("chrome") and b.get("page")) or (b.get("chrome") and a.get("page")): under.append(f"{a['name']} / {b['name']}")
                else: bad.append(f"text {a['name']} x text {b['name']}")
        for p in m["pics"]:
            if any(hit(x, p) for x in a["rects"]):
                if a.get("chrome") and p["name"].startswith("tick box"): under.append(f"{a['name']} / {p['name']}")
                else: bad.append(f"text {a['name']} x {p['name']}")
    return bad

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    total, pairs, shares, rows, under_n = 0, 0, {}, [], 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"], ignore_default_args=["--hide-scrollbars"])
        for sz in a.sizes.split(","):
            size, dpr = (sz.split("@") + ["1"])[:2]; w, h = map(int, size.split("x"))
            opts = dict(viewport={"width": w, "height": h}, device_scale_factor=float(dpr))
            if w < 1024: opts.update(is_mobile=True, has_touch=True)
            ctx = await b.new_context(**opts); page = await ctx.new_page()
            await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
            await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
            await page.keyboard.press("Enter"); await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
            await page.wait_for_timeout(600)
            stops = await page.evaluate("window.__p1.stops", isolated_context=False)
            seq = [(k, "p1", v) for k, v in stops.items()] + [(k, "y", (q, act)) for k, q, act in P23]
            for stop, kind, arg in seq:
                if kind == "p1": await page.evaluate(GOTO_JS, arg, isolated_context=False); await page.wait_for_timeout(SETTLE.get(stop, 800))
                else:
                    q, act = arg; await page.evaluate(GOTO_Y_JS, q, isolated_context=False)
                    if act == "tick": await page.evaluate("window.__p23.tick('web'); window.__p23.tick('look');", isolated_context=False)
                    await page.wait_for_timeout(1300); await page.evaluate(GOTO_Y_JS, q, isolated_context=False); await page.wait_for_timeout(500)
                m = await page.evaluate(MEASURE, isolated_context=False)
                und = []; bad = check(m, und); total += len(bad); under_n += len(und)
                n = len(m["texts"]); pairs += n * (n - 1) // 2 + n * len(m["pics"])
                for s in m.get("shares", []): shares.setdefault(size, {})[s["i"]] = s
                if bad: await page.screenshot(path=str(out / f"{size}_{stop}.png"))
                rows.append((size, stop, bad))
                print(f"{size} {stop}: {n} text boxes, {len(m['pics'])} drawings; " + ("clean" if not bad else f"{len(bad)} overlaps: " + "; ".join(bad[:5])), flush=True)
            await ctx.close()
        await b.close()
    print(f"\nPAIRS CHECKED: {pairs}; OVERLAPS: {total}")
    print("EACH DRAWING'S SHARE OF THE SCREEN AT REST (height share, width share):")
    for size, d in shares.items(): print(f"  {size}: " + ", ".join(f"{i}: {v['share']:.2f} h / {v['width']:.2f} w" for i, v in sorted(d.items())))
    (out / "overlap.json").write_text(json.dumps({"overlaps": total, "pairs": pairs, "shares": shares, "rows": rows}, indent=1), encoding="utf-8")

ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); ap.add_argument("--out", default="tools/shots/r8/overlap")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

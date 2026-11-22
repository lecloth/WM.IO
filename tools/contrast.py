"""Colour contrast of every piece of text, computed by hand (axe leaves most of this page "incomplete" because of the
board's grid background): text colour x opacity chain, composited over the nearest painted backgrounds (or the
paper token), then the WCAG ratio. Reduced motion, so every sheet's text is on the page at once.
  python -I tools/contrast.py [--dark] [--mobile] [--full Y,Y,...]   (--full: motion on, check at these scroll ys)
Reports every text run under 4.5:1 (3:1 for large text: >= 24 px, or >= 18.66 px bold)."""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

JS = r"""() => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const over = (top, a, bot) => [0, 1, 2].map((i) => top[i] * a + bot[i] * (1 - a));
  const root = getComputedStyle(document.documentElement);
  const paper = parse(getComputedStyle(document.documentElement).backgroundColor) || [242, 240, 235, 1];
  const out = []; const seen = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode; if (!n.data.trim()) continue;
    const el = n.parentElement; if (!el || el.closest('script,style,noscript,#xhair,.sr-only,[aria-hidden="true"] .frame__zones')) continue;
    if (seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el); if (cs.visibility !== 'visible' || cs.display === 'none') continue;
    let o = 1, e = el, hidden = false, blend = '';
    while (e && e !== document.documentElement) { const s = getComputedStyle(e); if (s.display === 'none') { hidden = true; break; } o *= parseFloat(s.opacity); if (s.mixBlendMode !== 'normal') blend = s.mixBlendMode; e = e.parentElement; }
    if (hidden || o < 0.05) continue;
    const isSvg = el instanceof SVGElement;
    const fg = parse(isSvg ? cs.fill : cs.color); if (!fg) continue;
    // background: composite painted ancestors (bottom-up), over the paper
    const stack = []; e = el;
    while (e && e !== document.documentElement) { const s = getComputedStyle(e); const bg = parse(s.backgroundColor); if (bg && bg[3] > 0) { stack.push(bg); if (bg[3] >= 1) break; } e = e.parentElement; }
    let bg = paper.slice(0, 3);
    for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], stack[i][3], bg);
    let col = over(fg, fg[3] * o, bg);
    if (blend === 'difference') col = over(fg.map((v, i) => i < 3 ? Math.abs(v - bg[i]) : v), fg[3] * o, bg);
    const a = L(col), b = L(bg); const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = px >= 24 || (bold && px >= 18.66) ? 3 : 4.5;
    if (ratio < need) out.push({ t: n.data.trim().slice(0, 40), sel: el.tagName.toLowerCase() + '.' + String(el.className.baseVal ?? el.className).split(' ')[0], sec: el.closest('section,#strip,#titleblock,#act-1')?.id || '', ratio: +ratio.toFixed(2), need, px, o: +o.toFixed(2), blend });
  }
  return out;
}"""


async def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dark", action="store_true"); ap.add_argument("--mobile", action="store_true"); ap.add_argument("--full", default="")
    a = ap.parse_args()
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": 1440, "height": 900})
        if not a.full: kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(**kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page()
        await page.goto("http://127.0.0.1:8109/", wait_until="load"); await page.wait_for_timeout(3500)
        res = []
        if a.full:
            for y in [int(v) for v in a.full.split(",")]:
                await page.evaluate(f"() => (window.__engine.lenis.scrollTo({y},{{immediate:true, force:true}}), scrollTo(0,{y}))", isolated_context=False)
                await page.wait_for_timeout(900)
                for r in await page.evaluate(JS, isolated_context=False): r["y"] = y; res.append(r)
        else:
            res = await page.evaluate(JS, isolated_context=False)
        await b.close()
    uniq = {}
    for r in res: uniq.setdefault((r["t"], r["sel"], r["ratio"]), r)
    print(json.dumps({"dark": a.dark, "mobile": a.mobile, "n": len(uniq), "low": sorted(uniq.values(), key=lambda r: r["ratio"])}, indent=0, ensure_ascii=False))


if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main())

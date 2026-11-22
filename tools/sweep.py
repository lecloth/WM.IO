"""Freeze-frame sweep: step through the whole page, screenshot every position and run automatic text checks.
  python -I tools/sweep.py --out tools/shots/sweep/d1440 [--w 1440 --h 900 | --mobile] [--reduced] [--dark]
         [--step 0.25] [--from Y --to Y] [--every 2 (screenshot every Nth frame)]
Checks on every frame (after the page has settled, no scrolling):
  fade   text whose effective opacity is between 0.05 and 0.95 (half-faded)
  move   text that moves while the page is still (compare rects 300 ms apart)
  over   two different text runs whose boxes overlap (both on top at their centres)
  width  documentElement.scrollWidth > innerWidth
  tb     the title block sheet number and the active strip segment
Prints one JSON line per flagged frame and a summary; screenshots go to --out."""
import argparse, asyncio, json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

CHECK = r"""(stage) => {
  const vw = innerWidth, vh = innerHeight, out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const items = [];
  while (w.nextNode()) {
    const n = w.currentNode; const t = n.data.trim(); if (!t) continue;
    const el = n.parentElement; if (!el || el.closest('script,style,noscript,#xhair,.sr-only')) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const rects = [...r.getClientRects()].filter((q) => q.width > 2 && q.height > 2 && q.bottom > 1 && q.top < vh - 1 && q.right > 1 && q.left < vw - 1);
    if (!rects.length) continue;
    let o = 1, e = el, gone = false;
    const cs0 = getComputedStyle(el);
    if (cs0.visibility !== 'visible') continue;
    const ca = cs0.color.match(/rgba?\(([^)]+)\)/); let alpha = 1;
    if (ca) { const parts = ca[1].split(/[ ,/]+/).filter(Boolean); if (parts.length === 4) alpha = parseFloat(parts[3]); }
    while (e && e !== document.documentElement) { const cs = getComputedStyle(e); o *= parseFloat(cs.opacity); if (cs.display === 'none') { gone = true; break; } e = e.parentElement; }
    if (gone || o * alpha < 0.03) continue;
    // on top? sample the centre of the first rect
    const q = rects[0], cx = Math.min(vw - 2, Math.max(1, q.left + q.width / 2)), cy = Math.min(vh - 2, Math.max(1, q.top + q.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    const onTop = !hit || hit === el || el.contains(hit) || hit.contains(el) || (hit.closest('label,button,a') && hit.closest('label,button,a').contains(el));
    if (!onTop) {
      // covered by an element that is not an ancestor: ignore only if the cover is not transparent text-free decoration
      const sec = (x) => x && x.closest('section, .act, #titleblock, #strip, #curtain');
      if (sec(hit) !== sec(el)) continue;
    }
    items.push({ el, t: (el.closest('#strip') ? '~' : '') + t.slice(0, 48), o: +(o * alpha).toFixed(2), rects: rects.map((q) => [q.left, q.top, q.right, q.bottom]) });
  }
  return items;
}"""


async def ev(page, js):
    return await page.evaluate(js, isolated_context=False)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8108/")
    ap.add_argument("--out", required=True)
    ap.add_argument("--w", type=int, default=1440); ap.add_argument("--h", type=int, default=900)
    ap.add_argument("--mobile", action="store_true"); ap.add_argument("--reduced", action="store_true"); ap.add_argument("--dark", action="store_true")
    ap.add_argument("--step", type=float, default=0.25)
    ap.add_argument("--from", dest="y0", type=int, default=0); ap.add_argument("--to", dest="y1", type=int, default=0)
    ap.add_argument("--every", type=int, default=1)
    ap.add_argument("--settle", type=int, default=380)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": a.w, "height": a.h})
        if a.reduced: kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(device_scale_factor=1, **kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page()
        logs = []
        page.on("console", lambda m: m.type in ("error", "warning") and logs.append(f"{m.type}: {m.text}"[:300]))
        page.on("pageerror", lambda e: logs.append(f"pageerror: {e}"[:300]))
        page.on("requestfailed", lambda r: logs.append(f"requestfailed: {r.url}"[:300]))
        await page.goto(a.url, wait_until="load")
        for _ in range(60):
            if await ev(page, "document.documentElement.dataset.phase === 'ready' || document.documentElement.dataset.motion === 'reduce'"): break
            await page.wait_for_timeout(200)
        await page.wait_for_timeout(800)
        vh = await ev(page, "innerHeight"); sh = await ev(page, "document.documentElement.scrollHeight")
        secs = await ev(page, "() => [...document.querySelectorAll('section[data-sheet], #act-1')].map(e => [e.id, e.dataset.sheet || '01', Math.round(e.getBoundingClientRect().top + scrollY), e.offsetHeight])")
        y1 = a.y1 or (sh - vh)
        ys, y = [], a.y0
        while y <= y1: ys.append(int(y)); y += a.step * vh
        if ys[-1] != y1: ys.append(y1)
        allmeta, flagged, summary = [], [], {"frames": 0, "fade": 0, "move": 0, "over": 0, "width": 0}
        for i, y in enumerate(ys):
            if a.reduced: await ev(page, f"window.scrollTo(0,{y})")
            else: await ev(page, f"(window.__engine.lenis.scrollTo({y},{{immediate:true, force:true}}), window.scrollTo(0,{y}))")
            await page.wait_for_timeout(a.settle)
            r1 = await ev(page, f"""() => {{ const items = ({CHECK})(); window.__swItems = items; return items.map(i => [i.t, i.o, i.rects]); }}""")
            meta = await ev(page, """() => ({ sy: Math.round(scrollY), sw: document.documentElement.scrollWidth, iw: innerWidth,
                tb: document.querySelector('.tb__sheet')?.textContent + ' ' + document.querySelector('.tb__title')?.textContent,
                seg: [...document.querySelectorAll('.strip__seg')].findIndex(s => s.classList.contains('is-active')),
                phase: document.documentElement.dataset.phase })""")
            f = {"y": y, "p": round(y / vh, 2), **meta, "issues": []}
            moved = await ev(page, """async () => { const a = window.__swItems.map(i => i.el.getBoundingClientRect()); await new Promise(r => setTimeout(r, 250));
                return window.__swItems.map((i, k) => { const b = i.el.getBoundingClientRect(); return Math.hypot(b.left - a[k].left, b.top - a[k].top) > 0.75 || Math.abs(b.width - a[k].width) > 0.75 ? [i.t, Math.round(b.left - a[k].left), Math.round(b.top - a[k].top)] : null; }).filter(Boolean); }""")
            for m in moved: f["issues"].append(["move", *m])
            r2b = await ev(page, """() => { const items = window.__swItems; return items.map(i => { let o = 1, e = i.el; while (e && e !== document.documentElement) { o *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } return +o.toFixed(2); }); }""")
            for (t, o, rects), o2 in zip(r1, r2b):  # half-faded now, or still half-faded 250 ms later
                if not t.startswith("~") and 0.05 < o < 0.95 and 0.05 < o2 < 0.95: f["issues"].append(["fade", t, o, o2])
            # overlap
            boxes = [(t, o, r) for t, o, rs in r1 for r in rs]
            for ia in range(len(boxes)):
                ta, oa, ra = boxes[ia]
                for ib in range(ia + 1, len(boxes)):
                    tb_, ob, rb = boxes[ib]
                    if ta == tb_: continue
                    ix = min(ra[2], rb[2]) - max(ra[0], rb[0]); iy = min(ra[3], rb[3]) - max(ra[1], rb[1])
                    if ix > 3 and iy > 3:
                        sa = (ra[2] - ra[0]) * (ra[3] - ra[1]); sb = (rb[2] - rb[0]) * (rb[3] - rb[1])
                        if ix * iy > 0.03 * min(sa, sb): f["issues"].append(["over", ta, tb_])
            allmeta.append([y, meta["tb"], meta["seg"], meta["sw"]])
            if meta["sw"] > meta["iw"]: f["issues"].append(["width", meta["sw"], meta["iw"]])
            summary["frames"] += 1
            for iss in f["issues"]: summary[iss[0]] += 1
            if i % a.every == 0 or f["issues"]:
                await page.screenshot(path=str(out / f"f_{y:06d}.jpg"), type="jpeg", quality=60)
            if f["issues"]:
                # de-duplicate
                seen, u = set(), []
                for iss in f["issues"]:
                    k = json.dumps(iss)
                    if k not in seen: seen.add(k); u.append(iss)
                f["issues"] = u[:12]
                flagged.append(f); print(json.dumps(f), flush=True)
            elif i % 20 == 0:
                print(json.dumps({"y": y, "tb": meta["tb"], "seg": meta["seg"]}), flush=True)
        await b.close()
    (out / "flags.json").write_text(json.dumps({"sections": secs, "vh": vh, "flagged": flagged, "frames": allmeta, "summary": summary, "logs": logs}, indent=1), encoding="utf-8")
    print(json.dumps({"summary": summary, "logs": logs[:40], "nlogs": len(logs)}))


if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main())

"""The arrival's routes at every size (Part 5 "The name, the top bar and the title block"): every straight run of the
line's three routes (strip -> sentence, stop -> beacon, beacon -> title block, and the replay's title block -> sentence)
on a grid line; the title block's cells and the top bar's boxes on whole cells, no text clipped. Light and dark.
28 Nov (page 3's old section retired, the page 4.6 screens shorter): the strip's links 03 to 08, each clicked in turn;
each must land with the page's first element at the screen's top (03: the door's marker, #page-03-door, where page 3's
beats start; 04: page 4's section; 05, 06; 07: the final room, by the hyperdrive; 08: by design the strip's last square
also takes the hyperdrive to the final room, which the spec sheet follows) and the title block and the strip must then
say that page. --no-links skips it.
  python -I tools/routecheck.py [--sizes ...] [--no-links]"""
import asyncio, sys, json, argparse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
SIZES = "384x734@2.8125,390x844@3,1280x720@1,1366x768@1,1440x900@1,1920x1080@1,2160x1147@1.333,1440x765@2,2560x1440@1,360x800@3,375x667@2,393x852@3,412x915@2.625,430x932@3"
ap = argparse.ArgumentParser(); ap.add_argument("--sizes", default=SIZES); ap.add_argument("--no-links", action="store_true"); a = ap.parse_args()
CELLS = """() => { const u = window.__grid.u, f = (v) => +(Math.abs(v / u - Math.round(v / u))).toFixed(3);
  const tb = [...document.querySelectorAll('.titleblock > *')].filter((c) => getComputedStyle(c).display !== 'none').map((c) => { const r = c.getBoundingClientRect(); return { k: c.className.split(' ').pop(), off: Math.max(f(r.left), f(r.width), f(r.top)), clipped: [...c.querySelectorAll('.tb__v')].some((v) => v.scrollWidth > v.clientWidth + 0.5) }; });
  const st = [...document.querySelectorAll('.strip__seg, .strip__cut')].map((c) => { const r = c.getBoundingClientRect(); return { off: Math.max(f(r.left), f(r.width)), clipped: [...c.querySelectorAll('a > span')].some((v) => v.getBoundingClientRect().right > r.right + 0.5) }; });
  return { tbOff: Math.max(...tb.map((c) => c.off)), tbClipped: tb.filter((c) => c.clipped).map((c) => c.k), stripOff: Math.max(...st.map((c) => c.off)), stripClipped: st.filter((c) => c.clipped).length, cells: tb.map((c) => c.k) }; }"""
# where each strip link must land: (segment's number, the element at the screen's top, the page the title block then says)
LINKS = [("03", "#page-03-door", "03"), ("04", "#page-04", "04"), ("05", "#page-05", "05"), ("06", "#page-06", "06"), ("07", "#page-07", "07"), ("08", "#page-07", "07")]
LAND = """async ([no, sel]) => {
  const docTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
  const seg = [...document.querySelectorAll('.strip__seg')].find((s) => s.querySelector('.strip__no').textContent.trim() === no);
  seg.querySelector('a').click();
  // wait for the scroll to start (the hyperdrive plays its run-up before it jumps: up to 4 s), then for 0.8 s of stillness
  const t0 = performance.now(), y0 = scrollY; let last = y0, still = 0, moved = false;
  while (performance.now() - t0 < 15000) { await new Promise((r) => setTimeout(r, 100)); if (Math.abs(scrollY - y0) > 0.5) moved = true; if (!moved && performance.now() - t0 < 4000) continue; if (Math.abs(scrollY - last) < 0.5) { if (++still >= 8) break; } else still = 0; last = scrollY; }
  await new Promise((r) => setTimeout(r, 300));
  const el = document.querySelector(sel), max = document.documentElement.scrollHeight - innerHeight, want = el ? Math.min(max, docTop(el)) : null;
  const active = document.querySelector('.strip__seg.is-active .strip__no')?.textContent.trim();
  return { y: Math.round(scrollY), want, off: want === null ? null : Math.round(Math.abs(scrollY - want)), sheet: document.querySelector('.tb__sheet').textContent.trim(), active, ms: Math.round(performance.now() - t0) };
}"""
async def main():
    from patchright.async_api import async_playwright
    bad = 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True)
        for s in a.sizes.split(","):
            wh, _, d = s.partition("@"); w, h = map(int, wh.split("x"))
            for theme in ("light", "dark"):
                ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=float(d or 1), is_mobile=w < 1024, has_touch=w < 1024)
                if theme == "dark": await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
                pg = await ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)[:200])); pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:200]))
                await pg.goto("http://127.0.0.1:8109/?first")
                await pg.wait_for_function("window.__arrival && window.__arrival.state() === 'run'", timeout=30000)
                r1 = await pg.evaluate("window.__arrival.report()", isolated_context=False)
                await pg.evaluate("window.__arrival.skip()", isolated_context=False); await pg.wait_for_timeout(200)
                await pg.evaluate("window.__arrival.enter()", isolated_context=False)
                await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000); await pg.wait_for_timeout(600)
                c = await pg.evaluate(CELLS, isolated_context=False)
                # the replay's route (title block -> sentence)
                await pg.evaluate("(() => { const e = window.__t2.engine; e.lenis.scrollTo(innerHeight * 2, { immediate: true, force: true }); })()", isolated_context=False); await pg.wait_for_timeout(500)
                await pg.evaluate("(() => { const e = window.__t2.engine; e.lenis.scrollTo(0, { immediate: true, force: true }); })()", isolated_context=False)
                await pg.wait_for_function("window.__arrival.state() === 'run'", timeout=8000)
                r2 = await pg.evaluate("window.__arrival.report()", isolated_context=False)
                off = max(r1["offGrid"], r2["offGrid"])
                links, linksOk = {}, True
                if not a.no_links:
                    await pg.evaluate("window.__arrival.skip()", isolated_context=False); await pg.wait_for_timeout(200)   # (the replay: skip it, then enter, as at the start)
                    await pg.evaluate("window.__arrival.state() === 'gate' && window.__arrival.enter()", isolated_context=False)
                    await pg.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
                    for no, sel, sheet in LINKS:
                        r = await pg.evaluate(LAND, [no, sel], isolated_context=False)
                        r["ok"] = r["off"] is not None and r["off"] <= 2 and r["sheet"] == sheet and r["active"] == sheet
                        linksOk = linksOk and r["ok"]; links[no] = r
                ok = off < 0.5 and c["tbOff"] < 0.01 and c["stripOff"] < 0.01 and not c["tbClipped"] and not c["stripClipped"] and not errs and linksOk
                bad += 0 if ok else 1
                print(json.dumps({"size": s, "theme": theme, "ok": ok, "routeOffPx": off, "runs": r1["runs"] + r2["runs"], **c, "links": "skipped" if a.no_links else ("all land" if linksOk else links), "errors": errs or "none"}), flush=True)
                if not a.no_links: print("  links:", json.dumps({k: [v["y"], v["want"], v["sheet"], v["ms"]] for k, v in links.items()}), flush=True)
                await ctx.close()
        await b.close()
    print("ROUTECHECK failures:", bad)
with BrowserLock(): asyncio.run(main())

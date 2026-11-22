"""Keyboard sweep: Tab through the whole page after the opening and report, for every stop, what got focus, where the
page scrolled to, whether the element is really visible there (opacity, visibility, on top) and whether it shows a
focus ring.   python -I tools/keys.py [--mobile] [--reduced] [--dark] [--n 60]"""
import argparse, asyncio, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock

INFO = r"""() => {
  const el = document.activeElement; if (!el || el === document.body) return { el: 'body' };
  const r = el.getBoundingClientRect();
  let o = 1, e = el, vis = getComputedStyle(el).visibility;
  while (e && e !== document.documentElement) { const cs = getComputedStyle(e); o *= parseFloat(cs.opacity); e = e.parentElement; }
  const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
  const hit = document.elementFromPoint(cx, cy);
  const onTop = !!hit && (hit === el || el.contains(hit) || hit.contains(el));
  const cs = getComputedStyle(el);
  const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
  const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const sec = el.closest('section[data-sheet], #act-1, #strip, #titleblock');
  return { el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''),
           text: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 36),
           sec: sec ? sec.id : '', y: Math.round(scrollY), o: +o.toFixed(2), vis, onTop, ring, inView,
           box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
           tb: document.querySelector('.tb__sheet').textContent };
}"""


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mobile", action="store_true"); ap.add_argument("--reduced", action="store_true"); ap.add_argument("--dark", action="store_true")
    ap.add_argument("--n", type=int, default=60); ap.add_argument("--shots", default="")
    a = ap.parse_args()
    from patchright.async_api import async_playwright
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11"])
        kw = dict(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True) if a.mobile else dict(viewport={"width": 1440, "height": 900})
        if a.reduced: kw["reduced_motion"] = "reduce"
        ctx = await b.new_context(**kw)
        if a.dark: await ctx.add_init_script("try{localStorage.setItem('wm:theme','dark')}catch(e){}")
        page = await ctx.new_page()
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(m.text[:200]))
        await page.goto("http://127.0.0.1:8108/", wait_until="load")
        for _ in range(60):
            if await page.evaluate("document.documentElement.dataset.phase === 'ready' || document.documentElement.dataset.motion === 'reduce'", isolated_context=False): break
            await page.wait_for_timeout(200)
        await page.wait_for_timeout(600)
        stops = []
        for i in range(a.n):
            await page.keyboard.press("Tab")
            await page.wait_for_timeout(1700)
            st = await page.evaluate(INFO, isolated_context=False)
            stops.append(st)
            flag = "" if st.get("el") == "body" else ("" if (st["o"] > 0.95 and st["vis"] == "visible" and st["onTop"] and st["ring"] and st["inView"]) else "  <-- CHECK")
            print(json.dumps(st) + flag, flush=True)
            if a.shots and flag:
                Path(a.shots).mkdir(parents=True, exist_ok=True)
                await page.screenshot(path=f"{a.shots}/k{i:02d}.jpg", type="jpeg", quality=60)
            if i > 5 and (stops[-1].get("el"), stops[-1].get("text")) == (stops[0].get("el"), stops[0].get("text")): break
        await b.close()
    print(json.dumps({"errors": errs}))


if __name__ == "__main__":
    with BrowserLock():
        asyncio.run(main())

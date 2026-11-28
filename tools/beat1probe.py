"""The security page's beat 1 (27 Nov, Part 5 "The security page, as demoed"): enter, then at each named stop shoot the
screen and print what beat 1 reports (its share p, the step, how far inside the look is, whether the hall still draws,
the key's offset, each key pin's lift in mm, the face's height as a share of its fill size), the lock's box, the camera's
lens, the chrome's mode and page 3's state. Optional --scrub: steps through beat 1 forwards and backwards in small steps
and reports the largest jump of the camera between neighbouring steps, each pin's lowest and highest lift (mm from its
modelled place; 2.2 = on the shear line), the push's length in screens, and whether both directions give the same frame
(the scroll drives it: back plays it in reverse). --reduced: the reduced-motion page (the lock's face still, its fade).
28 Nov, beat 2 (the room of locks): each stop also prints what beat 2 reports (its share p, lab B3's p, the step, the
key's turn, the lens, the copies shown, the headline); --scrub2 does --scrub's forward-vs-backward test over beat 2 (from
beat 1's dark end to the hand-over) and reports the largest camera step and turn per scroll step; --reduced also shoots
the room's still with its headline and its fade.
28 Nov, beat 3 (fly home, chaos, one lock): each stop also prints what beat 3 reports and the room's fold as the room
really stands (read from its quaternion); --scrub3 does the forward-vs-backward test from beat 2's end through beat 3 to
the hand-over, comparing the camera and a checksum of every copy's instance matrices and every real part's place (the
seeded chaos: the same scroll position must give the same frame whichever way it was reached); --reduced also shoots the
one lock's still and its fade.
28 Nov, beat 5 ("Locked.") and the join into page 4: each stop also prints what beat 5 reports (p, step, the plug's turn,
the key's offset and how far it must go to clear the screen, the pins, "Locked.", the yaw, the join's share) and whether
page 4's stage is on; --scrub5 does the forward-vs-backward test from beat 4's end through beat 5 and the join to the
hand-over (the camera, the pins' places); --reduced also shoots the shut lock's still with "Locked." and its fade.
  python -I tools/beat1probe.py --size 384x734 --dpr 2.8125 --mobile --stops DOOR,B1H,B1F,B1K,B1P,B1E,LOCK --out tools/shots/beat1
Stops are __p1.stops names with optional offsets (B1F-0.1) or plain numbers (page 1 screens)."""
import argparse, asyncio, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from browserlock import BrowserLock
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

GOTO_JS = """async (p) => { const e = window.__t2.engine; const y = window.__p1.yAt(p); if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update();
  const t0 = performance.now(); while (!window.__p1.settled() && performance.now() - t0 < 3000) await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return scrollY; }"""
INFO_JS = """() => { const d = window.__p1.dive(); const api = window.__p1.diveApi; const cam = api.camera();
  const p4 = document.querySelector('.p4s__stage');
  return { q: d ? +d.q.toFixed(4) : null, beat1: d ? d.beat1 : null, beat2: d ? d.beat2 : null, beat3: d ? d.beat3 : null, beat5: d ? d.beat5 : null, locked: !!document.querySelector('.dive__locked.on'), fold: api.foldNow ? api.foldNow() : null, head: d ? d.head : null, room: api.room ? api.room() : null, xray: d ? +d.xray.toFixed(3) : null, lockBox: d && d.door.box ? Object.fromEntries(Object.entries(d.door.box).map(([k, v]) => [k, +v.toFixed(1)])) : null,
    lens: { near: +cam.near.toFixed(4), far: +cam.far.toFixed(1), fov: +cam.fov.toFixed(2) }, darkChrome: document.documentElement.classList.contains('hall-dark'),
    page4On: !!(p4 && p4.classList.contains('is-on')), sheet: document.querySelector('.tb__sheet')?.textContent, lockState: api.door().lockState }; }"""
CAM_JS = """(p) => { window.__p1.at(p); const c = window.__p1.diveApi.camera(); const d = window.__p1.dive();
  return { pos: c.position.toArray(), quat: c.quaternion.toArray(), lifts: d && d.beat1 ? d.beat1.lifts : d && d.beat5 ? d.beat5.lifts : null, K: window.__p1.diveApi.K(), sum: window.__p1.diveApi.chaosSum ? window.__p1.diveApi.chaosSum() : null }; }"""

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    w, h = map(int, a.size.split("x"))
    async with async_playwright() as pw:
        b = await pw.chromium.launch(headless=True, args=["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"])
        opts = dict(viewport={"width": w, "height": h}, device_scale_factor=a.dpr)
        if a.mobile: opts.update(is_mobile=True, has_touch=True)
        if a.reduced: opts.update(reduced_motion="reduce")
        ctx = await b.new_context(**opts)
        if a.dark: await ctx.add_init_script("try { localStorage.setItem('wm:theme', 'dark'); } catch (e) {}")
        page = await ctx.new_page(); errs = []
        page.on("console", lambda m: m.type in ("error", "warning") and errs.append(f"{m.type}: {m.text[:300]}"))
        page.on("pageerror", lambda e: errs.append(f"pageerror: {str(e)[:300]}"))
        await page.goto("http://127.0.0.1:8109/?first", wait_until="load")
        await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
        await page.keyboard.press("Enter"); await page.wait_for_timeout(250); await page.keyboard.press("Enter")
        await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
        await page.wait_for_timeout(800)
        tag = f"{a.size}{'_dark' if a.dark else ''}{'_reduced' if a.reduced else ''}"
        if a.reduced:
            await page.wait_for_function("(() => { const i = document.querySelector('.p1-hall__lock img'); return i && i.complete && i.naturalWidth > 0; })()", timeout=30000)
            for k, f in enumerate([0.5, 0.15, -0.2, -0.5]):   # the figure's top at these shares of the screen: face, mid-fade, dark
                y = await page.evaluate(f"(() => {{ const r = document.querySelector('.p1-hall__lock').getBoundingClientRect(); return scrollY + r.top - innerHeight * {f}; }})()")
                await page.evaluate(f"scrollTo(0, {y})"); await page.wait_for_timeout(400)
                op = await page.evaluate("getComputedStyle(document.querySelector('.p1-hall__lock img')).opacity")
                await page.screenshot(path=str(out / f"{tag}_lock{k}.png")); print("reduced", f, "opacity", op)
            await page.wait_for_function("(() => { const i = document.querySelector('.p1-hall__room img'); return i && i.complete && i.naturalWidth > 0; })()", timeout=30000)
            for k, (sel, f) in enumerate([(".p1-hall__room", 0.12), (".p1-hall__room img", 0.15), (".p1-hall__room img", -0.2), (".p1-hall__room img", -0.5)]):   # the still with its headline, then its picture's top at these shares: mid-fade, dark
                y = await page.evaluate(f"(() => {{ const r = document.querySelector('{sel}').getBoundingClientRect(); return scrollY + r.top - innerHeight * {f}; }})()")
                await page.evaluate(f"scrollTo(0, {y})"); await page.wait_for_timeout(400)
                op = await page.evaluate("getComputedStyle(document.querySelector('.p1-hall__room img')).opacity")
                await page.screenshot(path=str(out / f"{tag}_room{k}.png")); print("reduced room", f, "opacity", op)
            await page.wait_for_function("(() => { const i = document.querySelector('.p1-hall__one img'); return i && i.complete && i.naturalWidth > 0; })()", timeout=30000)
            for k, f in enumerate([0.5, 0.15, -0.2, -0.5]):   # beat 3: the one lock's still, then its fade
                y = await page.evaluate(f"(() => {{ const r = document.querySelector('.p1-hall__one').getBoundingClientRect(); return scrollY + r.top - innerHeight * {f}; }})()")
                await page.evaluate(f"scrollTo(0, {y})"); await page.wait_for_timeout(400)
                op = await page.evaluate("getComputedStyle(document.querySelector('.p1-hall__one img')).opacity")
                await page.screenshot(path=str(out / f"{tag}_one{k}.png")); print("reduced one", f, "opacity", op)
            await page.wait_for_function("(() => { const i = document.querySelector('.p1-hall__locked img'); return i && i.complete && i.naturalWidth > 0; })()", timeout=30000)
            for k, (sel, f) in enumerate([(".p1-hall__locked", 0.12), (".p1-hall__locked img", 0.15), (".p1-hall__locked img", -0.2), (".p1-hall__locked img", -0.5), ("#page-04", 0.0)]):   # beat 5: the shut lock with "Locked.", its fade, then page 4
                y = await page.evaluate(f"(() => {{ const r = document.querySelector('{sel}').getBoundingClientRect(); return scrollY + r.top - innerHeight * {f}; }})()")
                await page.evaluate(f"scrollTo(0, {y})"); await page.wait_for_timeout(400)
                op = await page.evaluate("getComputedStyle(document.querySelector('.p1-hall__locked img')).opacity")
                await page.screenshot(path=str(out / f"{tag}_locked{k}.png")); print("reduced locked", sel, f, "opacity", op)
            print("errors:", errs or "none"); await b.close(); return
        stops = await page.evaluate("() => window.__p1.stops", isolated_context=False)
        for s in a.stops.split(","):
            m = re.match(r"^([A-Za-z]+\d*[A-Z]?)([+-][\d.]+)?$", s)
            p = (stops[m.group(1)] + float(m.group(2) or 0)) if m and m.group(1) in stops else float(s)
            await page.evaluate(GOTO_JS, p, isolated_context=False); await page.wait_for_timeout(a.wait)
            await page.screenshot(path=str(out / f"{tag}_{s}.png"))
            print(s, round(p, 3), json.dumps(await page.evaluate(INFO_JS, isolated_context=False)))
        if a.scrub or a.scrub2 or a.scrub3 or a.scrub5:
            p0, p1 = (stops["DOOR"] - 0.05, stops["B1E"] + 0.05) if a.scrub else (stops["B1E"] - 0.05, stops["B2E"] + 0.01) if a.scrub2 else (stops["B4E"] - 0.1, stops["LOCK"]) if a.scrub5 else (stops["B2E"] - 0.3, stops["B4E"])
            n = 300; ps = [p0 + (p1 - p0) * k / n for k in range(n + 1)]
            fw = [await page.evaluate(CAM_JS, p, isolated_context=False) for p in ps]
            bw = [await page.evaluate(CAM_JS, p, isolated_context=False) for p in reversed(ps)][::-1]
            K = fw[0]["K"]; import math
            jumps = [math.dist(fw[i]["pos"], fw[i - 1]["pos"]) / K for i in range(1, len(fw))]
            turns = [2 * math.acos(min(1, abs(sum(x * y for x, y in zip(fw[i]["quat"], fw[i - 1]["quat"]))))) * 180 / math.pi for i in range(1, len(fw))]
            vj = [jumps[i] / ((p1 - p0) / n) for i in range(len(jumps))]   # hall units per screen of scroll
            k0 = min(range(len(ps)), key=lambda i: abs(ps[i] - stops["DOOR"]))
            print("speed (hall units per screen) around the walk's end:", [round(x, 3) for x in vj[max(0, k0 - 4):k0 + 6]])
            same = max(max(abs(x - y) for x, y in zip(f["pos"] + f["quat"], g["pos"] + g["quat"])) for f, g in zip(fw, bw))
            sums = [abs(f["sum"] - g["sum"]) / max(1.0, abs(f["sum"])) for f, g in zip(fw, bw) if f["sum"] is not None and g["sum"] is not None]
            print("chaos forward_vs_backward (relative checksum difference, max):", max(sums) if sums else None, "over", len(sums), "steps")
            lifts = [f["lifts"] for f in fw if f["lifts"]]
            print("scrub:", json.dumps({"steps": n, "largest_step_hall_units": round(max(jumps), 4), "at": round(ps[jumps.index(max(jumps)) + 1], 3), "largest_turn_deg": round(max(turns), 3),
                  "forward_vs_backward_max_diff": same, "max_lift_per_pin": [round(max(l[i] for l in lifts), 2) for i in range(5)] if lifts else None,
                  "min_lift_per_pin": [round(min(l[i] for l in lifts), 2) for i in range(5)] if lifts else None, "lift_at_end": lifts[-1] if lifts else None,
                  "pushLen": await page.evaluate("window.__p1.pushLen()", isolated_context=False), "scroll": await page.evaluate("window.__p1.scroll", isolated_context=False)}))
        print("errors:", errs or "none")
        await b.close()

ap = argparse.ArgumentParser()
ap.add_argument("--size", default="384x734"); ap.add_argument("--dpr", type=float, default=1); ap.add_argument("--mobile", action="store_true")
ap.add_argument("--stops", default="DOOR,B1H,B1F,B1K,B1P,B1E,LOCK"); ap.add_argument("--out", default="tools/shots/beat1"); ap.add_argument("--dark", action="store_true")
ap.add_argument("--wait", type=int, default=600); ap.add_argument("--scrub", action="store_true"); ap.add_argument("--scrub2", action="store_true"); ap.add_argument("--scrub3", action="store_true"); ap.add_argument("--scrub5", action="store_true"); ap.add_argument("--reduced", action="store_true")
a = ap.parse_args()
with BrowserLock():
    asyncio.run(main(a))

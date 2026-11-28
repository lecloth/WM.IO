"""Flicker, frame by frame, in a REAL Chrome window on this laptop at Wajih's setup (Part 5 "Round 7"): Windows at 200%,
Chrome at 67% zoom, so devicePixelRatio is 1.333 and the window is about 2160 CSS px wide. The zoom is set the way he
sets it: real Ctrl+minus key presses to the Chrome window (4 steps: 90, 80, 75, 67%).
For each build (round 6 at /r6old/ when staged, and the current one at /) it walks three stretches with the scroll set
in small fractional steps (as the smooth scroller moves it), capturing every frame:
  1. page 1, the drum (the stage is pinned: a still area of it must stay exactly still);
  2. the hallway, walking between two drawings (everything moves: flicker energy, see below);
  3. page 2, scrolling (its grid lines must keep the same weight from frame to frame).
Metrics (grey levels 0-255, on device pixels):
  still    : mean |frame - previous frame| over an area that should not change (page 1's pinned grid);
  flicker  : temporal flicker energy: mean over pixels of |b - (a + c) / 2| for consecutive frames a, b, c (a line that
             shimmers jumps there and back; smooth motion is near zero), and the share of pixels where it exceeds 24;
  lines    : page 2's horizontal grid lines in an empty strip: how much each line's darkness changes between frames.
  python -I tools/flicker.py [--builds r7old,current] [--out tools/shots/r8/flicker] [--frames 36]
Round 8: the older build is staged by hand at site/<name>old/ (deleted again before committing); page 2's rows are the
final room's now; the current build also steps the hyperdrive frame by frame.
27 Nov --beat1: only the security page's beat 1. 28 Nov --beat2: only beat 2, the room of locks: the seam from beat 1's
dark end into it (backing up the keyway), out of the keyhole and the pull-back, the hold with the headline, the circling
with the key's turn and the wave, and its end. 28 Nov --beat3: only beat 3, fly home, chaos, one lock: the seam from
beat 2's end into it, the room squaring up as the camera pulls back, the fly home, the chaos, the lock building itself,
and its end with the (temporary) fade into page 3.
One headed Chrome window opens on the desktop while it runs (a fresh temporary profile; nothing of the user's)."""
import argparse, asyncio, json, subprocess, sys, tempfile, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
from browserlock import BrowserLock

GOTO = """async (y) => { const e = window.__t2.engine; if (e.lenis) e.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); e.ScrollTrigger.update();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return scrollY; }"""

def zoom_out(title_part, presses=4):
    ps = ("$ws = New-Object -ComObject WScript.Shell; "
          f"$ok = $ws.AppActivate('{title_part}'); Start-Sleep -Milliseconds 400; "
          + "".join("$ws.SendKeys('^-'); Start-Sleep -Milliseconds 350; " for _ in range(presses)) + "Write-Output $ok")
    return subprocess.run(["powershell", "-NoProfile", "-Command", ps], capture_output=True, text=True).stdout.strip()

def gray(p): return np.asarray(Image.open(p).convert("L"), dtype=np.float32)

def flicker(frames, box=None):
    a = [f if box is None else f[box[1]:box[3], box[0]:box[2]] for f in frames]
    e, share = [], []
    for i in range(1, len(a) - 1):
        d = np.abs(a[i] - (a[i - 1] + a[i + 1]) / 2); e.append(float(d.mean())); share.append(float((d > 24).mean()))
    return {"energy": round(float(np.mean(e)), 3), "energy_p95": round(float(np.percentile(e, 95)), 3), "share_over_24": round(float(np.mean(share)) * 100, 3)}

def still(frames, box):
    a = [f[box[1]:box[3], box[0]:box[2]] for f in frames]
    d = [float(np.abs(a[i] - a[i - 1]).mean()) for i in range(1, len(a))]
    return {"mean_change": round(float(np.mean(d)), 4), "max_change": round(float(np.max(d)), 4), "frames_changed": int(sum(x > 0.01 for x in d))}

def line_track(frames, box):
    """each horizontal grid line in an empty strip, followed from frame to frame: how much its darkness and its sharpness
    (the share of its ink in its darkest row) change as the page moves. A line that keeps its look scores 0."""
    prev, dk, sh = None, [], []
    for f in frames:
        s = f[box[1]:box[3], box[0]:box[2]].mean(axis=1); dips = np.median(s) - s
        rows = [i for i in range(2, len(s) - 2) if dips[i] > 2 and dips[i] >= dips[i - 1] and dips[i] > dips[i + 1]]
        cur = [(r + (dips[r + 1] - dips[r - 1]) / max(1e-3, 2 * dips[r]), dips[r], dips[r] / max(1e-3, dips[r - 2:r + 3].clip(0).sum())) for r in rows]
        if prev:
            for y, d_, s_ in cur:
                m = min(prev, key=lambda p: abs(p[0] - y))
                if abs(m[0] - y) < 4: dk.append(abs(d_ - m[1])); sh.append(abs(s_ - m[2]))
        prev = cur
    return {"pairs": len(dk), "darkness_change": round(float(np.mean(dk)), 3) if dk else None, "darkness_change_p95": round(float(np.percentile(dk, 95)), 3) if dk else None,
            "sharpness_change": round(float(np.mean(sh)), 4) if sh else None}

def line_weights(frames, box):
    """the darkest row of each grid line in a column strip, per frame: how much a line's darkness wobbles between frames"""
    out = []
    for f in frames:
        s = f[box[1]:box[3], box[0]:box[2]].mean(axis=1)
        base = np.median(s); dips = base - s
        rows = [i for i in range(1, len(s) - 1) if dips[i] > 2 and dips[i] >= dips[i - 1] and dips[i] >= dips[i + 1]]
        out.append(sorted(dips[r] + dips[r - 1] + dips[r + 1] for r in rows))   # a line's total ink, whatever rows it spans
        out[-1] = [float(np.max(dips[r - 1:r + 2])) for r in rows]
    peaks = [np.array(v) for v in out if len(v)]
    if not peaks: return {"lines": 0}
    allp = np.concatenate(peaks)
    per_frame = [float(np.mean(v)) for v in peaks]
    return {"lines_per_frame": round(float(np.mean([len(v) for v in peaks])), 1), "peak_darkness_mean": round(float(allp.mean()), 2),
            "peak_darkness_spread": round(float(allp.std()), 2), "frame_to_frame_spread": round(float(np.std(per_frame)), 3)}

CDPS = {}
async def walk(page, ys, out, tag):
    """each frame straight from the compositor (what the screen shows), not a re-rendered capture"""
    import base64
    cdp = CDPS.get(id(page)) or await page.context.new_cdp_session(page); CDPS[id(page)] = cdp
    files = []
    for k, y in enumerate(ys):
        await page.evaluate(GOTO, y, isolated_context=False)
        r = await cdp.send("Page.captureScreenshot", {"format": "png", "fromSurface": True})
        f = out / f"{tag}_{k:03d}.png"; f.write_bytes(base64.b64decode(r["data"])); files.append(f)
    return files

async def run_build(pw, b, a, out):
    prof = tempfile.mkdtemp(prefix="flicker-prof-")
    ctx = await pw.chromium.launch_persistent_context(prof, channel="chrome", headless=False, no_viewport=True,
        args=["--start-maximized", "--no-first-run", "--no-default-browser-check", "--disable-session-crashed-bubble"])
    page = ctx.pages[0] if ctx.pages else await ctx.new_page()
    base = "http://127.0.0.1:8109/" + (f"{b}/" if b.endswith("old") else "")
    await page.goto(base + "?first", wait_until="load")
    await page.bring_to_front(); await page.wait_for_timeout(800)
    # hallway pass 3: Wajih's setup (200% Windows scaling, Chrome at 67%: devicePixelRatio 1.333, about 2160 x 1147 CSS
    # px) set on this window only, through its own DevTools session. (Before, it sent real Ctrl+minus key presses to the
    # window titled "Wajih Mansouri"; when Windows refused to bring it forward the presses went to whatever window had
    # the focus: never again.)
    cdp0 = await page.context.new_cdp_session(page)
    await cdp0.send("Emulation.setDeviceMetricsOverride", {"width": a.width, "height": a.height, "deviceScaleFactor": a.dpr, "mobile": False})
    CDPS[id(page)] = cdp0
    res = "cdp"
    await page.wait_for_timeout(800)
    env = await page.evaluate("({ dpr: devicePixelRatio, w: innerWidth, h: innerHeight, sw: screen.width, sh: screen.height })")
    print(b, "AppActivate:", res, "env:", env, flush=True)
    await page.wait_for_function("document.documentElement.dataset.phase === 'gate'", timeout=20000)
    await page.keyboard.press("Enter"); await page.wait_for_timeout(250); await page.keyboard.press("Enter")
    await page.wait_for_function("document.documentElement.dataset.phase === 'ready'", timeout=20000)
    await page.wait_for_timeout(1500)
    stops = await page.evaluate("window.__p1.stops", isolated_context=False)
    yAt = lambda p: page.evaluate(f"window.__p1.yAt({p})", isolated_context=False)
    n = a.frames
    rep = {"env": env}
    # 27 Nov (--beat1): only the security page's beat 1, from the shut door to the dark end, in small steps (the walk into
    # the lock, the keyhole, the keyway under the pins), each frame from the compositor; then the hand-over's fade
    if a.beat2 or a.beat3:
        # each stretch around a named stop (page 1 screens), each frame from the compositor; the largest single-frame change too
        stretches = [("b2_seam", stops["B1E"] - 0.15, stops["B1E"] + 0.35), ("b2_out", stops["B2K"] - 0.15, stops["B2K"] + 0.35),
                     ("b2_head", stops["B2H"] - 0.2, stops["B2H"] + 0.2), ("b2_wave", stops["B2W"] - 0.25, stops["B2W"] + 0.25),
                     ("b2_end", stops["B2E"] - 0.2, stops["B2E"] + 0.01)] if a.beat2 else                     [("b3_seam", stops["B2E"] - 0.15, stops["B2E"] + 0.2), ("b3_square", stops["B2E"] + 0.2, stops["B3S"] + 0.05),
                     ("b3_fly", stops["B3S"], stops["B3F"] + 0.4), ("b3_chaos", stops["B3C"] - 0.3, stops["B3C"] + 0.3),
                     ("b3_build", stops["B3B"] - 0.35, stops["B3L"]), ("b3_end", stops["B3L"] - 0.05, stops["LOCK"])]
        for name, s0, s1 in stretches:
            ya = await yAt(s0); yb = await yAt(s1)
            await page.evaluate(GOTO, ya, isolated_context=False); await page.wait_for_timeout(1500)
            fr = await walk(page, [ya + (yb - ya) * k / n for k in range(n)], out, f"{b}_{name}")
            G = [gray(f) for f in fr]; rep[f"{name}_flicker"] = flicker(G)
            d = [float(np.abs(G[i] - G[i - 1]).mean()) for i in range(1, len(G))]
            rep[f"{name}_largest_frame_change"] = round(max(d), 2)
        await ctx.close()
        return rep
    if a.beat1:
        for name, s0, s1 in [("hall_ref", stops["F1"] + (stops["F2"] - stops["F1"]) * 0.32, stops["F1"] + (stops["F2"] - stops["F1"]) * 0.5), ("b1_push", stops["DOOR"], stops["B1F"]), ("b1_keyhole", stops["B1F"], stops["B1K"] + 0.06), ("b1_pins", stops["B1P"] - 0.1, stops["B1P"] + 0.1), ("b1_dark", stops["B1E"] - 0.12, stops["LOCK"])]:
            ya = await yAt(s0); yb = await yAt(s1)
            await page.evaluate(GOTO, ya, isolated_context=False); await page.wait_for_timeout(1500)
            fr = await walk(page, [ya + (yb - ya) * k / n for k in range(n)], out, f"{b}_{name}")
            G = [gray(f) for f in fr]; rep[f"{name}_flicker"] = flicker(G)
        await ctx.close()
        return rep
    # 1. the drum (pinned): a still area, lower left, under the meaning and left of the title block
    d0 = (stops.get("DRUM", 3.6)); y0 = await yAt(d0); y1 = await yAt(d0 + 0.08)
    await page.evaluate(GOTO, y0, isolated_context=False); await page.wait_for_timeout(1500)
    fr = await walk(page, [y0 + (y1 - y0) * k / n for k in range(n)], out, f"{b}_drum")
    G = [gray(f) for f in fr]; H, W = G[0].shape
    rep["drum_still"] = still(G, (int(W * 0.04), int(H * 0.86), int(W * 0.3), int(H * 0.97)))
    rep["drum_flicker"] = flicker(G)
    # 2. the hallway: walking on from the first drawing towards the second
    f1, f2 = stops["F1"], stops["F2"]; ya = await yAt(f1 + (f2 - f1) * 0.32); yb = await yAt(f1 + (f2 - f1) * 0.5)
    await page.evaluate(GOTO, ya, isolated_context=False); await page.wait_for_timeout(2500)
    fr = await walk(page, [ya + (yb - ya) * k / n for k in range(n)], out, f"{b}_hall")
    G = [gray(f) for f in fr]
    rep["hall_flicker"] = flicker(G)
    Hh, Wh = G[0].shape
    rep["hall_wall_flicker"] = flicker(G, (0, int(Hh * 0.55), int(Wh * 0.12), int(Hh * 0.95)))
    # 3. page 2 scrolling: its grid lines in an empty strip at the right
    # (round 8: the rows moved to the final room, page 7; round 7 had them on page 2)
    p2 = await page.evaluate("(() => { const el = document.getElementById('page-07') || document.getElementById('page-02'); let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; })()")
    await page.evaluate(GOTO, p2 + 40, isolated_context=False); await page.wait_for_timeout(1500)
    fr = await walk(page, [p2 + 40 + 0.83 * k for k in range(n)], out, f"{b}_p2")
    G = [gray(f) for f in fr]; H, W = G[0].shape
    rep["p2_lines"] = line_weights(G, (int(W * 0.955), int(H * 0.08), int(W * 0.985), int(H * 0.8)))
    rep["p2_shimmer"] = line_track(G, (int(W * 0.955), int(H * 0.08), int(W * 0.985), int(H * 0.8)))
    rep["p2_scroll_device_px"] = await page.evaluate("[scrollY * devicePixelRatio % 1]")
    rep["p2_flicker"] = flicker(G, (int(W * 0.9), 0, W, H))
    # 5. (round 9, current build only) page 3: the lattice pulling back and the unlock wave, in small steps
    if not b.endswith("old") and await page.evaluate("!!window.__p3", isolated_context=False):
        for name, s0, s1 in [("lattice", 2.2, 2.5), ("wave", 3.0, 3.3)]:
            ya = await page.evaluate(f"window.__p3.yAt({s0})", isolated_context=False); yb = await page.evaluate(f"window.__p3.yAt({s1})", isolated_context=False)
            await page.evaluate(GOTO, ya, isolated_context=False); await page.wait_for_timeout(1500)
            fr = await walk(page, [ya + (yb - ya) * k / n for k in range(n)], out, f"{b}_{name}")
            G = [gray(f) for f in fr]; rep[f"p3_{name}_flicker"] = flicker(G)
    # 4. (round 8, current build only) the hyperdrive, frame by frame: its own drawing stepped at 60 fps over the stars and
    # the settle, on a full-window canvas in this same window (dev/hyper.html?full draws one frame per call)
    if not b.endswith("old") and not a.no_hyper:
      try:
        await page.goto("http://127.0.0.1:8109/dev/hyper.html?full&t=0.3", wait_until="load"); await page.wait_for_timeout(1500)
        cdp = CDPS.get(id(page)) or await page.context.new_cdp_session(page); CDPS[id(page)] = cdp
        import base64
        files = []; steps = [0.24 + (0.98 - 0.24) * k / (n * 2) for k in range(n * 2)]
        for k, tt in enumerate(steps):
            await page.evaluate(f"(async () => {{ window.__draw({tt}); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }})()")
            r = await cdp.send("Page.captureScreenshot", {"format": "png", "fromSurface": True}); f = out / f"{b}_hyper_{k:03d}.png"; f.write_bytes(base64.b64decode(r["data"])); files.append(f)
        G = [gray(f) for f in files]
        rep["hyper_flicker"] = flicker(G)
        rep["hyper_dpr"] = await page.evaluate("devicePixelRatio")
      except Exception as e: rep["hyper_error"] = str(e)[:160]   # (outside the hallway: never lose the rest)
    await ctx.close()
    return rep

async def main(a):
    from patchright.async_api import async_playwright
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    report = {}
    async with async_playwright() as pw:
        for b in a.builds.split(","):
            report[b] = await run_build(pw, b, a, out)
            print(b, json.dumps(report[b], indent=1), flush=True)
    (out / "flicker.json").write_text(json.dumps(report, indent=1), encoding="utf-8")

ap = argparse.ArgumentParser(); ap.add_argument("--builds", default="r7old,current"); ap.add_argument("--out", default="tools/shots/r8/flicker"); ap.add_argument("--frames", type=int, default=36)
ap.add_argument("--width", type=int, default=2160); ap.add_argument("--height", type=int, default=1147); ap.add_argument("--dpr", type=float, default=1.333); ap.add_argument("--no-hyper", action="store_true"); ap.add_argument("--beat1", action="store_true"); ap.add_argument("--beat2", action="store_true"); ap.add_argument("--beat3", action="store_true")
with BrowserLock():
    asyncio.run(main(ap.parse_args()))

"""A few clean outer paths of Bell's Fig. 1 (US 186,787, 1877, public domain), fitted to the very scan page 1 shows
(site/media/plates/bell-us186787-sheet1.webp, 1600 x 1740), for the morph into today's phone (MorphSVG on page 1).

Not the potrace cloud: eight exact hairline shapes, each fitted to the scan's own ink:
  - straight-edged faces (the lid, the two box faces, the plinth): every edge is a robust least-squares line through
    the ink near a hand-placed guess, and each corner is where two fitted edges meet;
  - the speaking tube with its mouthpiece: a guessed outline, resampled and snapped onto the stroke's centre line;
  - three of the lid's screw heads: ellipses from the ink's moments.
Writes site/media/plates/bell-us186787-paths.json (plate px).   python -I tools/bell_paths.py [--check out.png]"""
import argparse, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "site" / "media" / "plates" / "bell-us186787-sheet1.webp"
OUT = ROOT / "site" / "media" / "plates" / "bell-us186787-paths.json"

# guesses in plate px, read off gridded crops of the scan; the fit does the precision
POLYS = {
    # (corners in order, per-edge fit window as a fraction of the edge [t0, t1] to skip knobs, screws and hatching)
    "lid":   ([(444, 495), (676, 426), (895, 497), (659, 564)], [(.12, .88), (.12, .88), (.12, .88), (.12, .88)]),
    "left":  ([(418, 518), (659, 598), (660, 905), (418, 802)], [(.15, .85), (.1, .9), (.55, .9), (.12, .55)]),
    "right": ([(660, 598), (930, 522), (930, 795), (660, 905)], [(.15, .7), (.1, .9), (.2, .85), (.1, .9)]),
    "plinth": ([(393, 814), (675, 905), (981, 812), (985, 854), (674, 968), (395, 858)],
               [(.25, .9), (.1, .65), (.2, .8), (.1, .9), (.1, .9), (.2, .8)]),
}
TUBE = [(975, 541), (1050, 517), (1130, 492), (1210, 466), (1280, 444), (1305, 430), (1325, 404), (1350, 378),
        (1372, 357), (1395, 349), (1420, 352), (1445, 370), (1465, 398), (1478, 430), (1478, 465), (1472, 500),
        (1455, 522), (1430, 530), (1400, 531), (1370, 531), (1345, 532)]
TUBE_LOW = ((985, 634), (1335, 534))   # the tube's lowest line (its outline): found by a column scan, then a line fit
SCREWS = {"screw_l": (479, 495), "screw_b": (676, 436), "screw_r": (861, 491)}

def ink_mask():
    g = np.array(Image.open(SRC).convert("L"), dtype=np.float32)
    return g < 128

def fit_line(ink, a, b, t0, t1, band=6.0):
    """robust line through the ink near segment a-b (only t0..t1 of it): returns point + unit direction"""
    a, b = np.array(a, float), np.array(b, float)
    d = b - a; L = np.hypot(*d); u = d / L; n = np.array([-u[1], u[0]])
    x0, y0 = np.floor(np.minimum(a, b) - band - 2).astype(int); x1, y1 = np.ceil(np.maximum(a, b) + band + 2).astype(int)
    ys, xs = np.nonzero(ink[y0:y1, x0:x1]); P = np.c_[xs + x0 + .5, ys + y0 + .5]
    t = (P - a) @ u / L; s = (P - a) @ n
    P = P[(t >= t0) & (t <= t1) & (np.abs(s) <= band)]
    c, dirv = P.mean(0), u
    for _ in range(6):   # iteratively re-weighted total least squares (pulls onto the stroke's centre, drops strays)
        r = (P - c) @ np.array([-dirv[1], dirv[0]])
        w = 1 / np.maximum(1.5, np.abs(r))
        c = (P * w[:, None]).sum(0) / w.sum()
        Q = (P - c) * np.sqrt(w)[:, None]
        _, _, vt = np.linalg.svd(Q, full_matrices=False); dirv = vt[0]
        if dirv @ u < 0: dirv = -dirv
    return c, dirv, len(P)

def meet(l1, l2):
    (p, u), (q, v) = l1, l2
    A = np.array([u, -v]).T
    s, _ = np.linalg.solve(A, q - p)
    return p + s * u

def snap_curve(ink, guess, step=3.0, reach=7):
    g = np.array(guess, float)
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(g, axis=0).T))]
    s = np.arange(0, d[-1], step)
    pts = np.c_[np.interp(s, d, g[:, 0]), np.interp(s, d, g[:, 1])]
    out = []
    for i, p in enumerate(pts):
        tng = pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]; tng /= np.hypot(*tng) or 1; n = np.array([-tng[1], tng[0]])
        hits = [k for k in np.arange(-reach, reach + .5, .5) if ink[int(p[1] + k * n[1]), int(p[0] + k * n[0])]]
        if hits:
            # the run of ink nearest the guess: its middle is the stroke's centre line
            runs, cur = [], [hits[0]]
            for k in hits[1:]:
                if k - cur[-1] <= .51: cur.append(k)
                else: runs.append(cur); cur = [k]
            runs.append(cur)
            r = min(runs, key=lambda r: abs(np.mean(r)))
            out.append(p + np.mean(r) * n)
        else:
            out.append(p)
    out = np.array(out)
    for _ in range(3):   # light smoothing along the curve (ends kept)
        out[1:-1] = (out[:-2] + 2 * out[1:-1] + out[2:]) / 4
    return out

def ellipse(ink, c, r=12):
    c = np.array(c, float)
    x0, y0 = (c - r).astype(int); ys, xs = np.nonzero(ink[y0:y0 + 2 * r, x0:x0 + 2 * r])
    P = np.c_[xs + x0 + .5, ys + y0 + .5]
    m = P.mean(0); C = np.cov((P - m).T)
    w, v = np.linalg.eigh(C)
    a, b = np.sqrt(2 * w[1]), np.sqrt(2 * w[0])
    ang = float(np.degrees(np.arctan2(v[1, 1], v[0, 1])))
    return {"cx": round(float(m[0]), 2), "cy": round(float(m[1]), 2), "rx": round(float(a), 2), "ry": round(float(b), 2), "rot": round(ang, 2)}

def main(a):
    ink = ink_mask()
    out = {"plate": [1600, 1740], "source": "US 186,787 sheet 1, Fig. 1 (A. G. Bell, 1877, public domain)", "paths": []}
    for name, (cs, wins) in POLYS.items():
        lines = []
        for i in range(len(cs)):
            p, u, n = fit_line(ink, cs[i], cs[(i + 1) % len(cs)], *wins[i]); lines.append((p, u))
            print(f"{name} edge {i}: {n} ink px")
        corners = [meet(lines[i - 1], lines[i]) for i in range(len(cs))]
        out["paths"].append({"name": name, "kind": "poly", "pts": [[round(float(x), 2), round(float(y), 2)] for x, y in corners]})
    tube = snap_curve(ink, TUBE)
    # the underside: in each column, the lowest ink near the guessed line is the outline's lower edge (paper below it)
    (gx0, gy0), (gx1, gy1) = TUBE_LOW; P = []
    for x in range(gx0, gx1, 2):
        gy = gy0 + (gy1 - gy0) * (x - gx0) / (gx1 - gx0)
        ys = np.nonzero(ink[int(gy - 30):int(gy + 30), x])[0]
        if len(ys): P.append((x + .5, gy - 30 + ys.max() - 1.5))
    P = np.array(P); A = np.c_[P[:, 0], np.ones(len(P))]; coef = np.linalg.lstsq(A, P[:, 1], rcond=None)[0]
    for _ in range(5):
        r = np.abs(A @ coef - P[:, 1]); keep = r < max(1.5, np.median(r) * 3); coef = np.linalg.lstsq(A[keep], P[keep, 1], rcond=None)[0]
    print("tube underside: slope", round(coef[0], 4), "kept", int(keep.sum()), "of", len(P))
    xe = tube[-1][0]; low = [(x, coef[0] * x + coef[1]) for x in np.linspace(xe - 4, 971, 40)]
    top0 = tube[0]; tube = np.vstack([[971, coef[0] * 971 + coef[1] - 0], [971, top0[1]], tube, low[1:-1]])
    out["paths"].append({"name": "tube", "kind": "curve", "pts": [[round(float(x), 2), round(float(y), 2)] for x, y in tube[::2]]})
    for name, c in SCREWS.items():
        out["paths"].append({"name": name, "kind": "ellipse", **ellipse(ink, c)})
    OUT.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print("wrote", OUT, sum(len(p.get("pts", [])) for p in out["paths"]), "points")
    if a.check:
        im = Image.open(SRC).convert("RGB"); S = 2
        im = im.resize((im.width * S, im.height * S), Image.LANCZOS); d = ImageDraw.Draw(im)
        for p in out["paths"]:
            if p["kind"] == "ellipse":
                t = np.linspace(0, 2 * np.pi, 60); r = np.radians(p["rot"])
                xs = p["cx"] + p["rx"] * np.cos(t) * np.cos(r) - p["ry"] * np.sin(t) * np.sin(r)
                ys = p["cy"] + p["rx"] * np.cos(t) * np.sin(r) + p["ry"] * np.sin(t) * np.cos(r)
                pts = list(zip(xs, ys))
            else:
                pts = [tuple(q) for q in p["pts"]]
            closed = True
            d.line([(x * S, y * S) for x, y in pts + (pts[:1] if closed else [])], fill=(230, 30, 30), width=2)
        im.crop((370 * S, 330 * S, 1500 * S, 990 * S)).save(a.check)
        print("check", a.check)

ap = argparse.ArgumentParser(); ap.add_argument("--check")
main(ap.parse_args())

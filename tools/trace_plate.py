"""Trace the whole of Bell's sheet 1 (US 186,787, 1877, public domain) into the ink's own outlines, for page 1's
dissolve: the scan gives way to these lines exactly on top of it, then the lines slide and bend into today's phone.
Reads the same file the page shows (site/media/plates/bell-us186787-sheet1.webp, 1600 x 1740), so the lines sit on
the scan pixel for pixel. Writes site/media/plates/bell-us186787-lines.bin:
  Int16 little-endian: [C, len_0 .. len_{C-1}, group_0 .. group_{C-1}, x0, y0, x1, y1, ...]
  coordinates in plate pixels x 2 (half-pixel precision); group 0 = header text, 1 = Fig. 1, 2 = Fig. 2.
Each contour is a closed outline resampled about every STEP plate px; fill them all with even-odd and you get the
ink back.   python -I tools/trace_plate.py [--check out.png]"""
import argparse, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "pylib"))
import numpy as np
from PIL import Image, ImageDraw
import potrace

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "site" / "media" / "plates" / "bell-us186787-sheet1.webp"
OUT = ROOT / "site" / "media" / "plates" / "bell-us186787-lines.bin"
STEP = 3.0          # plate px between resampled points
UP = 2              # trace at 2x for smoother outlines
THRESH = 128

def bez(p0, c1, c2, p1, n):
    t = np.linspace(0, 1, n + 1)[1:, None]
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * c1 + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * p1

def resample(pts, step):
    pts = np.vstack([pts, pts[:1]])
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    L = d[-1]
    n = max(4, int(round(L / step)))
    s = np.linspace(0, L, n, endpoint=False)
    return np.c_[np.interp(s, d, pts[:, 0]), np.interp(s, d, pts[:, 1])], L

def main(a):
    g = np.array(Image.open(SRC).convert("L"), dtype=np.float32)
    H, W = g.shape
    img = np.array(Image.fromarray(g.astype(np.uint8)).resize((W * UP, H * UP), Image.LANCZOS))
    bm = potrace.Bitmap(img < THRESH)
    plist = bm.trace(turdsize=40, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.25)
    contours = []
    for curve in plist:
        p = np.array([curve.start_point.x, curve.start_point.y]) / UP
        pts = [p]
        for seg in curve.segments:
            e = np.array([seg.end_point.x, seg.end_point.y]) / UP
            if seg.is_corner:
                c = np.array([seg.c.x, seg.c.y]) / UP
                pts += [c, e]
            else:
                c1 = np.array([seg.c1.x, seg.c1.y]) / UP; c2 = np.array([seg.c2.x, seg.c2.y]) / UP
                n = max(2, int(np.hypot(*(e - p)) / 1.5))
                pts += list(bez(p, c1, c2, e, n))
            p = e
        pts = np.array(pts)
        x0, y0 = pts.min(0); x1, y1 = pts.max(0)
        if (x1 - x0) * (y1 - y0) < 10: continue                      # specks of scan noise
        if (x1 - x0) > 0.9 * W and (y1 - y0) > 0.9 * H: continue        # the sheet's own edge
        r, L = resample(pts, STEP)
        cy = (y0 + y1) / 2
        grp = 0 if cy < 330 else 1 if cy < 1000 else 2
        contours.append((r, grp, L))
    # drop isolated scan dots far from any drawing (small and alone) -- keep anything longer than 40 px
    print(len(contours), "contours,", sum(len(c[0]) for c in contours), "points, total length", int(sum(c[2] for c in contours)), "px")
    head = [len(contours)] + [len(c[0]) for c in contours] + [c[1] for c in contours]
    xy = np.concatenate([np.round(c[0] * 2) for c in contours]).astype(np.int16).ravel()
    data = np.concatenate([np.array(head, dtype=np.int16), xy])
    OUT.write_bytes(data.astype("<i2").tobytes())
    print("wrote", OUT, OUT.stat().st_size, "bytes")
    if a.check:   # fill the outlines even-odd over a white sheet and compare with the scan's ink
        mask = Image.new("1", (W, H), 0)
        for r, _, _ in contours:
            m = Image.new("1", (W, H), 0); ImageDraw.Draw(m).polygon([tuple(q) for q in r], fill=1)
            mask = Image.fromarray(np.logical_xor(np.array(mask), np.array(m)))
        ink = g < THRESH
        tr = np.array(mask)
        print(f"ink px {ink.sum()}, traced px {tr.sum()}, agree {(ink == tr).mean() * 100:.2f}% of the sheet,"
              f" IoU {(ink & tr).sum() / max(1, (ink | tr).sum()) * 100:.1f}%")
        vis = np.stack([np.where(ink, 0, 255), np.where(tr, 0, 255), np.full_like(g, 255)], -1).astype(np.uint8)
        Image.fromarray(vis).save(a.check)

ap = argparse.ArgumentParser(); ap.add_argument("--check")
main(ap.parse_args())

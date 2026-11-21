"""Sheet 03 (Disciplines) ancestor plates: crop, level and trace four public-domain US patent drawings, like Bell's
(tools/trace_fig1.py). Sources: tools/sources/d1/*.pdf (Google Patents scans, 1-bit 300 dpi). Writes
  site/media/plates/<key>-sheet.webp   the plate (header + figures) for the reading moment, ink on paper (multiply)
  site/media/plates/<key>-fig.webp     the figure crop, ink on transparent, for the redraw
  site/js/sheet03/plates/<key>.js      the figure traced into outline paths (potrace) for the line-by-line redraw
Run: python -I tools/plates_03.py [--preview DIR]"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "pylib"))
import numpy as np
import pymupdf
from PIL import Image, ImageFilter
import potrace

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "tools" / "sources" / "d1"
K = 300 / 110  # boxes were read off 110 dpi renders; the scans are 300 dpi

# key, pdf, page, plate box, figure box (110 dpi px: x0, y0, x1, y1), output plate width, trace threshold, turdsize
PLATES = [
    dict(key="bullock-us38200", pdf="US38200.pdf", page=0, plate=(78, 92, 772, 990), fig=(92, 440, 702, 982),
         title="W. Bullock, Printing Press, US Patent 38,200 (14 Apr 1863), sheet 1, Fig. 1"),
    dict(key="firman-us252576", pdf="US252576.pdf", page=0, plate=(110, 92, 722, 1008), fig=(172, 248, 662, 1004), rot=-90,
         title="L. B. Firman, Multiple Switch-Board for Telephone-Exchanges, US Patent 252,576 (17 Jan 1882), Fig. 1"),
    dict(key="edison-us274290", pdf="US274290.pdf", page=0, plate=(92, 96, 792, 962), fig=(104, 202, 776, 566),
         title="T. A. Edison, System of Electrical Distribution, US Patent 274,290 (20 Mar 1883), sheet 1, Figs. 1-2"),
    dict(key="holmes-us275913", pdf="US275913.pdf", page=0, plate=(88, 92, 792, 990), fig=(98, 212, 452, 990), mask=[(413, 410, 452, 990)],
         title="J. W. Holmes, Solar Theodolite, US Patent 275,913 (17 Apr 1883), sheet 1, Fig. 1"),
]
PLATE_W = 1400      # plate image width (px)
FIG_SCALE = 0.5     # figure crop scale vs the 300 dpi scan (keeps traced coordinates at ~150 dpi)


def page_gray(pdf, page):
    d = pymupdf.open(SRC / pdf)
    pix = d[page].get_pixmap(dpi=300, colorspace=pymupdf.csGRAY)
    return Image.frombytes("L", (pix.width, pix.height), pix.samples)


def box(b):
    return tuple(int(round(v * K)) for v in b)


def levels(im, lo=40, hi=215, gamma=1.0):
    a = np.asarray(im, dtype=np.float32)
    a = np.clip((a - lo) / (hi - lo), 0, 1) ** gamma
    return Image.fromarray((a * 255).astype(np.uint8))


TRACE_S = 0.6      # the trace runs on the figure at this scale (smaller = lighter file); coordinates are scaled back


def trace(fig_l, turd=6):
    """fig_l: L image (ink dark). Returns outline paths (shapes with their holes), sorted left to right."""
    W, H = fig_l.size
    UP = TRACE_S
    img = fig_l.resize((round(W * UP), round(H * UP)), Image.LANCZOS)
    bm = potrace.Bitmap(np.array(img) < 140)
    plist = bm.trace(turdsize=turd, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0,
                     opticurve=True, opttolerance=0.6)
    curves = []
    f = lambda v: str(round(v / UP))
    for curve in plist:
        sx, sy = curve.start_point.x, curve.start_point.y
        d = [f"M{f(sx)} {f(sy)}"]
        pts = [(sx / UP, sy / UP)]
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{f(seg.c.x)} {f(seg.c.y)}L{f(seg.end_point.x)} {f(seg.end_point.y)}")
                pts += [(seg.c.x / UP, seg.c.y / UP), (seg.end_point.x / UP, seg.end_point.y / UP)]
            else:
                d.append(f"C{f(seg.c1.x)} {f(seg.c1.y)} {f(seg.c2.x)} {f(seg.c2.y)} {f(seg.end_point.x)} {f(seg.end_point.y)}")
                pts.append((seg.end_point.x / UP, seg.end_point.y / UP))
        d.append("Z")
        xs = [q[0] for q in pts]; ys = [q[1] for q in pts]
        area = 0.5 * sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))
        bw, bh = max(xs) - min(xs), max(ys) - min(ys)
        if bw * bh < 10 or (bw > 0.9 * W and bh > 0.9 * H):
            continue
        curves.append({"d": "".join(d), "x0": min(xs), "y0": min(ys), "x1": max(xs), "y1": max(ys), "area": area, "pts": pts})

    def inside(pt, poly):
        x, y = pt; c = False
        for i in range(len(poly)):
            (x1, y1), (x2, y2) = poly[i - 1], poly[i]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1:
                c = not c
        return c
    for c in curves:
        probe = c["pts"][0]
        c["parents"] = [o for o in curves if o is not c and abs(o["area"]) > abs(c["area"])
                        and o["x0"] <= c["x0"] and o["y0"] <= c["y0"] and o["x1"] >= c["x1"] and o["y1"] >= c["y1"]
                        and inside(probe, o["pts"])]
    outers = [c for c in curves if len(c["parents"]) % 2 == 0]
    holes = [c for c in curves if len(c["parents"]) % 2 == 1]
    for o in outers:
        o["holes"] = []
    for h in holes:
        cands = [o for o in h["parents"] if len(o["parents"]) % 2 == 0]
        if cands:
            min(cands, key=lambda o: abs(o["area"]))["holes"].append(h)
    # merge shapes into ~90 vertical bands (left to right) so the redraw animates a few dozen elements, not thousands
    N = 90
    bands = {}
    for o in outers:
        b = min(N - 1, int(o["x0"] / W * N))
        bands.setdefault(b, []).append(o["d"] + "".join(h["d"] for h in o["holes"]))
    return [{"d": "".join(ds), "x": round(b * W / N, 1)} for b, ds in sorted(bands.items())]


def main():
    prev = None
    if "--preview" in sys.argv:
        prev = Path(sys.argv[sys.argv.index("--preview") + 1]); prev.mkdir(parents=True, exist_ok=True)
    plates_dir = ROOT / "site" / "media" / "plates"
    js_dir = ROOT / "site" / "js" / "sheet03" / "plates"
    js_dir.mkdir(parents=True, exist_ok=True)
    for P in PLATES:
        page = page_gray(P["pdf"], P["page"])
        pb, fb = box(P["plate"]), box(P["fig"])
        # the plate: crop, soften the 1-bit scan by downsampling, set levels; ink on paper for mix-blend multiply
        plate = page.crop(pb)
        pw = PLATE_W; ph = round(plate.height * pw / plate.width)
        plate = levels(plate.resize((pw, ph), Image.LANCZOS), 30, 235)
        # the figure: same pixels at FIG_SCALE, as ink on transparent
        fig = page.crop(fb)
        for m in P.get("mask", []):   # blank a neighbouring figure that overlaps the crop (the plate itself is untouched)
            mb = box(m); fig.paste(255, (mb[0] - fb[0], mb[1] - fb[1], mb[2] - fb[0], mb[3] - fb[1]))
        fw, fh = round(fig.width * FIG_SCALE), round(fig.height * FIG_SCALE)
        fig_l = levels(fig.resize((fw, fh), Image.LANCZOS), 30, 235)
        rot = P.get("rot", 0)   # the figure is drawn turned on the sheet: store it upright; the plate shows it at `rot`
        if rot:
            fig_l = fig_l.rotate(rot, expand=True, fillcolor=255); fw, fh = fig_l.size
        alpha = Image.eval(fig_l, lambda v: 255 - v)
        ink = Image.new("RGBA", (fw, fh), (17, 17, 17, 0)); ink.putalpha(alpha)
        if prev:
            plate.save(prev / f"{P['key']}-plate.png"); fig_l.save(prev / f"{P['key']}-fig.png")
            continue
        plate.convert("RGB").save(plates_dir / f"{P['key']}-sheet.webp", quality=82, method=6)
        ink.save(plates_dir / f"{P['key']}-fig.webp", quality=85, method=6)
        paths = trace(fig_l)
        # where the figure sits on the plate image (in plate px), so the redraw can lift it off the plate exactly
        s = pw / (pb[2] - pb[0])
        # centre of the figure on the plate (plate px), its size upright (fig px), plate px per fig px, turn on the plate
        crop = {"cx": round(((fb[0] + fb[2]) / 2 - pb[0]) * s, 1), "cy": round(((fb[1] + fb[3]) / 2 - pb[1]) * s, 1),
                "w": fw, "h": fh, "plateW": pw, "plateH": ph, "k": round(s / FIG_SCALE, 4), "rot": rot}
        out = js_dir / f"{P['key']}.js"
        out.write_text(f"// Traced from {P['title']} (public domain). Generated by tools/plates_03.py\n"
                       f"export default {json.dumps({'crop': crop, 'paths': paths}, separators=(',', ':'))};\n", encoding="utf-8")
        print(P["key"], "plate", (pw, ph), "fig", (fw, fh), len(paths), "paths", out.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()

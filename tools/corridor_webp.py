"""Corridor drawing sheets -> web derivatives + contact sheets.

Reads the bilevel originals in tools/sources/corridor/<set>/ (HAER .tif masters,
patent sheet .png extracted from the Google Patents PDFs) and writes
site/media/corridor/<set>/NN.webp: greyscale linework mapped between ink #121212
and paper #F2F0EB, long side 2400 px, WebP q82. Also writes
tools/shots/corridor_<set>.jpg contact sheets.

Run: python -I tools/corridor_webp.py   (from the repo root)
"""
import glob
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'sources', 'corridor')
OUT = os.path.join(ROOT, 'site', 'media', 'corridor')
SHOTS = os.path.join(ROOT, 'tools', 'shots')
PAPER = np.array([0xF2, 0xF0, 0xEB], np.float32)
INK = np.array([0x12, 0x12, 0x12], np.float32)
LONG = 2400


def trim_dark_edges(a):
    """Drop scanner black bars: edge rows/cols that are mostly ink."""
    dark = a < 128
    t, b, l, r = 0, a.shape[0], 0, a.shape[1]
    while b - t > 100 and dark[t, l:r].mean() > 0.35: t += 1
    while b - t > 100 and dark[b - 1, l:r].mean() > 0.35: b -= 1
    while r - l > 100 and dark[t:b, l].mean() > 0.35: l += 1
    while r - l > 100 and dark[t:b, r - 1].mean() > 0.35: r -= 1
    pad = int(0.004 * max(a.shape))  # a little extra past the bar edge
    t = t + pad if t else t; l = l + pad if l else l
    b = b - pad if b < a.shape[0] else b; r = r - pad if r < a.shape[1] else r
    return a[t:b, l:r]


def clear_edge_blobs(a, size=25, margin=0.10):
    """Paint out solid black scanner blotches near the sheet edges (patent scans).
    Only ink that is >= `size` px thick (survives an opening) and lies in the
    outer `margin` band is removed, so linework and hatching are untouched."""
    im = Image.fromarray(a)
    opened = im.filter(ImageFilter.MaxFilter(size)).filter(ImageFilter.MinFilter(size))
    solid = np.asarray(opened) < 128
    h, w = a.shape
    band = np.ones_like(solid)
    mh, mw = int(h * margin), int(w * margin)
    band[mh:h - mh, mw:w - mw] = False
    solid &= band
    out = a.copy()
    if solid.any():
        grow = Image.fromarray((solid * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
        out[np.asarray(grow) > 0] = 255
    # thin scanner rules: rows/cols in the outer 5% that are mostly ink
    dark = out < 128
    bh, bw = int(h * 0.05), int(w * 0.05)
    for r in list(range(bh)) + list(range(h - bh, h)):
        if dark[r].mean() > 0.25: out[max(0, r - 3):r + 4] = 255
    for c in list(range(bw)) + list(range(w - bw, w)):
        if dark[:, c].mean() > 0.25: out[:, max(0, c - 3):c + 4] = 255
    return out


def derive(path):
    im = Image.open(path).convert('L')
    a = trim_dark_edges(np.asarray(im))
    if max(a.shape) < 6000:  # patent sheets: clean scanner blotches
        a = clear_edge_blobs(a)
    im = Image.fromarray(a)
    scale = LONG / max(im.size)
    # Thicken hairlines before a big reduction so they survive as ink, not grey.
    # (HAER masters are ~14500 px wide: 6x reduction; patents ~3400 px: 1.4x.)
    if scale < 0.3:
        im = im.reduce(2).filter(ImageFilter.MinFilter(3))
    elif scale < 0.8:
        im = im.filter(ImageFilter.MinFilter(3)) if scale < 0.5 else im
    w, h = im.size
    s = LONG / max(w, h)
    im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    v = np.asarray(im).astype(np.float32) / 255.0
    # levels: anything near-white is paper, then a curve that keeps thin lines dark
    v = np.clip((v - 0.04) / (0.93 - 0.04), 0, 1) ** 1.8
    rgb = INK + (PAPER - INK) * v[..., None]
    return Image.fromarray(np.round(rgb).astype(np.uint8), 'RGB')


def main(sets):
    os.makedirs(SHOTS, exist_ok=True)
    for st in sets:
        files = sorted(f for f in glob.glob(os.path.join(SRC, st, '*'))
                       if f.lower().endswith(('.tif', '.tiff', '.png')))
        os.makedirs(os.path.join(OUT, st), exist_ok=True)
        thumbs = []
        for i, f in enumerate(files, 1):
            out = derive(f)
            dst = os.path.join(OUT, st, f'{i:02d}.webp')
            q = 82
            out.save(dst, 'WEBP', quality=q, method=6)
            while os.path.getsize(dst) > 900_000 and q > 60:
                q -= 6
                out.save(dst, 'WEBP', quality=q, method=6)
            print(f'{st}/{i:02d}.webp  {out.size[0]}x{out.size[1]}  q{q}  '
                  f'{os.path.getsize(dst)//1024} KB  <- {os.path.basename(f)}')
            t = out.copy(); t.thumbnail((640, 640), Image.LANCZOS); thumbs.append(t)
        H = max(t.height for t in thumbs); gap = 16
        sheet = Image.new('RGB', (sum(t.width for t in thumbs) + gap * (len(thumbs) + 1),
                                  H + 2 * gap), (60, 60, 60))
        x = gap
        for t in thumbs:
            sheet.paste(t, (x, gap + (H - t.height) // 2)); x += t.width + gap
        sheet.save(os.path.join(SHOTS, f'corridor_{st}.jpg'), quality=88)


if __name__ == '__main__':
    main(sys.argv[1:] or ['a', 'b', 'c'])

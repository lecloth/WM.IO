"""Stamp ink grain for page 1's approval stamps, from a REAL scan: the blank 1905 paper margin already on the page
(site/media/paper/miller-1905-paper.webp, Kempster B. Miller, American Telephone Practice, 1905, Internet Archive,
public domain). Where the paper's fibres and pits sit, a rubber stamp's ink doesn't reach: the fibres' own pattern
becomes the gaps in the ink. Writes site/media/paper/stamp-grain.webp (white with alpha = ink coverage), a seamless tile.
  python -I tools/stamp_grain.py"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / "pylib"))
import numpy as np
from PIL import Image, ImageFilter
ROOT = Path(__file__).resolve().parents[1]
src = Image.open(ROOT / "site/media/paper/miller-1905-paper.webp").convert("L")
g = np.asarray(src, dtype=np.float32)
fine = g - np.asarray(src.filter(ImageFilter.GaussianBlur(6)), dtype=np.float32)            # fibres and pits
broad = np.asarray(src.filter(ImageFilter.GaussianBlur(18)), dtype=np.float32); broad = broad - broad.mean()   # uneven inking
z = fine / (fine.std() + 1e-6) + 0.6 * broad / (broad.std() + 1e-6)
a = np.clip(0.93 + 0.16 * z, 0, 1)                    # mostly ink, with real gaps where the paper is low
a = np.where(a < 0.62, a * 0.35, a)                   # gaps read as gaps
out = np.dstack([np.full_like(g, 255), np.full_like(g, 255), np.full_like(g, 255), a * 255]).astype(np.uint8)
im = Image.fromarray(out, "RGBA")
im.save(ROOT / "site/media/paper/stamp-grain.webp", lossless=False, quality=88)
print(im.size, f"mean coverage {a.mean():.2f}, gaps {(a < 0.5).mean() * 100:.1f}%")

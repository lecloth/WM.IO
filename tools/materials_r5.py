"""Round 5: the hallway's card (CC0), into site/media/materials/<Id>/.
  python -I tools/materials_r5.py
Round 6: looks B and C and grounds B and C were removed, so only Paper001 ships (hallway A's card; dive.js prints it in
grey). Plaster002, Concrete034 and laminate_floor_03 are no longer converted (their entries are kept below, commented).
Sources (downloaded 24 Nov 2026 into tools/sources/materials-r5/, git-ignored; logged in CREDITS.md):
  ambientCG (https://ambientcg.com, CC0 1.0), 1K-JPG sets: Paper001 (white paper: hallway A's card).
Colour maps at 1024 px (WebP q 86), normal maps at 512 px (q 90): the hallway is seen at phone size, and the normals
only carry the fine relief (paper fibre, plaster trowel marks, the wood's grain)."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "tools" / "sources" / "materials-r5"
OUT = ROOT / "site" / "media" / "materials"

SETS = {
    # id: (colour file, normal file, out folder, colour treatment)
    "Paper001": ("Paper001/Paper001_1K-JPG_Color.jpg", "Paper001/Paper001_1K-JPG_NormalGL.jpg", "Paper001", None),
    # "Plaster002": ("Plaster002/Plaster002_1K-JPG_Color.jpg", "Plaster002/Plaster002_1K-JPG_NormalGL.jpg", "Plaster002", None),
    # "Concrete034": ("Concrete034/Concrete034_1K-JPG_Color.jpg", "Concrete034/Concrete034_1K-JPG_NormalGL.jpg", "Concrete034", None),
    # "laminate_floor_03": ("ph_laminate_floor_03/Diffuse.jpg", "ph_laminate_floor_03/nor_gl.jpg", "ph-laminate_floor_03", "pale-oak"),
}

def pale_oak(im):
    """lift the levels towards a pale, slightly desaturated oak (mean about RGB 206 184 152), keeping the grain"""
    im = im.convert("RGB")
    g = ImageOps.grayscale(im)
    lo, hi = 40, 215
    g = g.point(lambda v: max(0, min(255, round((v - lo) * 255 / (hi - lo)))))
    # map the lifted grain between a darker and a lighter oak tone
    return ImageOps.colorize(g, black=(150, 120, 86), white=(236, 222, 196), mid=(206, 184, 152))

def square(im, n):
    # some sets are not square (Paper001, Concrete034): resampled to a square, never cropped (a crop would break the
    # seamless tile); the material then repeats with the source's own aspect (see hall-looks.js `aspect`)
    return im.resize((n, n), Image.LANCZOS) if im.size != (n, n) else im

for key, (col, nor, folder, treat) in SETS.items():
    out = OUT / folder; out.mkdir(parents=True, exist_ok=True)
    c = Image.open(SRC / col).convert("RGB")
    if treat == "pale-oak": c = pale_oak(c)
    square(c, 1024).save(out / "color.webp", quality=86, method=6)
    square(Image.open(SRC / nor).convert("RGB"), 512).save(out / "normal.webp", quality=90, method=6)
    print(folder, *(f"{p.name} {p.stat().st_size // 1024} KB" for p in sorted(out.glob("*.webp"))))

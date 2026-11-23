"""Copy the CC0 material scans (ambientCG, 1K JPG sets) that page 1's phone and the asset sheet use into
site/media/materials/<AssetId>/{color,rough,normal}.webp (1024 px, quality 88; normal maps lossless-ish at q 92).
  python -I tools/materials.py <folder holding the unzipped <AssetId>/ sets>
Source: https://ambientcg.com/view?id=<AssetId>, licence CC0 1.0 (logged in CREDITS.md)."""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SETS = ["Metal009", "Metal059A", "Plastic010", "Leather027"]
MAPS = {"Color": ("color", 88), "Roughness": ("rough", 88), "NormalGL": ("normal", 92)}

def main(src):
    src = Path(src)
    for a in SETS:
        out = ROOT / "site" / "media" / "materials" / a; out.mkdir(parents=True, exist_ok=True)
        for k, (name, q) in MAPS.items():
            f = src / a / f"{a}_1K-JPG_{k}.jpg"
            im = Image.open(f); im = im.convert("L" if k == "Roughness" else "RGB")
            if im.width != 1024: im = im.resize((1024, 1024), Image.LANCZOS)
            im.save(out / f"{name}.webp", quality=q, method=6)
            print(a, name, (out / f"{name}.webp").stat().st_size // 1024, "KB")

main(sys.argv[1])

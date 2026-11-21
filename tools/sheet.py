"""Contact sheet: python tools/sheet.py <dir> <prefix> <out.jpg> [cols]"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
d, pre, outp = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 3
fs = sorted(d.glob(f"{pre}_*.jpg"))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size
s = 480 / w if w > 600 else 0.6
tw, th = int(w * s), int(h * s)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 4), rows * (th + 18)), (255, 0, 255))
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(fs, ims)):
    x, y = (i % cols) * (tw + 4), (i // cols) * (th + 18)
    sheet.paste(im.resize((tw, th)), (x, y + 18))
    dr.rectangle([x, y, x + tw, y + 17], fill=(0, 0, 0)); dr.text((x + 4, y + 3), f.stem, fill=(255, 255, 0))
sheet.save(outp, quality=85)

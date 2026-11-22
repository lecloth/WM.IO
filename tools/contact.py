"""Contact sheets of a sweep folder: python -I tools/contact.py <dir> [cols] [per] [thumbW] -> <dir>/cs_NN.jpg"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
d = Path(sys.argv[1]); cols = int(sys.argv[2]) if len(sys.argv) > 2 else 4; per = int(sys.argv[3]) if len(sys.argv) > 3 else 24
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 450
fs = sorted(d.glob("f_*.jpg"))
for old in d.glob("cs_*.jpg"): old.unlink()
for k in range(0, len(fs), per):
    chunk = fs[k:k + per]; ims = [Image.open(f) for f in chunk]
    w, h = ims[0].size; th = int(h * tw / w); rows = (len(ims) + cols - 1) // cols
    sh = Image.new("RGB", (cols * (tw + 4), rows * (th + 16)), (255, 0, 255)); dr = ImageDraw.Draw(sh)
    for i, (f, im) in enumerate(zip(chunk, ims)):
        x, y = (i % cols) * (tw + 4), (i // cols) * (th + 16)
        sh.paste(im.resize((tw, th)), (x, y + 16)); dr.text((x + 4, y + 2), f.stem[2:], fill=(255, 255, 0))
    sh.save(d / f"cs_{k // per:02d}.jpg", quality=80)
print(len(fs), "frames", (len(fs) + per - 1) // per, "sheets")

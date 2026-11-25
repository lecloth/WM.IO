"""A contact sheet of screenshots: python -I tools/contactsheet.py out.png cols width a.png b.png ..."""
import sys, warnings
warnings.filterwarnings('ignore')
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / 'pylib'))
import pymupdf as fitz
out, cols, cw = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]); files = sys.argv[4:]
im0 = fitz.open(files[0]); r0 = im0[0].rect; ch = cw * r0.height / r0.width
rows = (len(files) + cols - 1) // cols
doc = fitz.open(); page = doc.new_page(width=cw * cols, height=ch * rows)
for i, f in enumerate(files): page.insert_image(fitz.Rect((i % cols) * cw, (i // cols) * ch, (i % cols + 1) * cw, (i // cols + 1) * ch), filename=f)
page.get_pixmap(dpi=72).save(out); print(out)

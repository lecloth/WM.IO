"""TYPE_RULES.md's screenshot self-check: one image per item (phone 384 x 734 and laptop 2160 x 1147), taken from the
round's shot sets (tools/r8final.sh) and cut to what the item judges, into tools/shots/r8/selfcheck/<n>_<item>.png.
  python -I tools/selfcheck.py"""
import sys, warnings
from pathlib import Path
warnings.filterwarnings('ignore')
from PIL import Image
R = Path(__file__).resolve().parent / 'shots' / 'r8'; O = R / 'selfcheck'; O.mkdir(parents=True, exist_ok=True)
ph = lambda s, dark=False: R / 'shots-phone' / f"384x734{'_dark' if dark else ''}_{s}.png"
lp = lambda s: R / 'shots-laptop' / f"2160x1147_{s}.png"
def sheet(name, items, h=900):
    ims = []
    for f, box in items:
        if not Path(f).exists(): print('missing', f); continue
        im = Image.open(f).convert('RGB')
        if box: W, H = im.size; im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
        k = h / im.size[1]; ims.append(im.resize((max(1, int(im.size[0] * k)), h)))
    if not ims: return
    out = Image.new('RGB', (sum(i.size[0] for i in ims) + 12 * (len(ims) - 1), h), 'white'); x = 0
    for i in ims: out.paste(i, (x, 0)); x += i.size[0] + 12
    out.save(O / f'{name}.png'); print(O / f'{name}.png')
sheet('1_rhythm', [(ph('0100'), None), (ph('2920'), None), (ph('6200'), None), (lp('0100'), None), (lp('7340'), None)])
sheet('2_breaks', [(ph('4800'), None), (ph('5480'), None), (ph('7910'), None), (lp('4800'), None), (lp('6770'), None)])
sheet('3_drawing_labels', [(ph('6200'), (0, 0.1, 1, 0.62)), (ph('6770'), (0, 0.1, 1, 0.62)), (ph('7340'), (0, 0.1, 1, 0.62)), (ph('7910'), (0, 0.1, 1, 0.62))])
sheet('4_measurements', [(ph('3900'), (0, 0.05, 1, 0.45)), (lp('3900'), (0.25, 0.05, 0.75, 0.45)), (ph('7910'), (0.05, 0.1, 0.95, 0.6))])
sheet('5_xray_names', [(ph('1300'), None), (R / 'shots-360' / '360x800_1300.png', None), (lp('1300'), None)])
sheet('6_frosted_labels', [(ph('5970'), None), (ph('6200'), None), (lp('5970'), None), (lp('6200'), None)])
sheet('7_cut_to_the_chase', [(ph('6200'), (0, 0, 1, 0.08)), (lp('6200'), (0.5, 0, 1, 0.06))], h=160)
sheet('8_drafts', [(ph('5480'), None), (ph('6770'), None), (ph('4800'), None), (R / 'dev' / 'room_phone.png', None), (lp('5480'), None), (R / 'dev' / 'room_laptop.png', None)])

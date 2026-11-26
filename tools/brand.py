"""WM.IO's mark (Part 5 "The name, the top bar and the title block"): writes
  site/media/brand/wmio-mark.svg        the small version (the plain mark: the bar, the title block, favicons)
  site/media/brand/wmio-mark-hero.svg   the hero version, with its measurements in DM Mono Light (embedded)
  site/media/brand/wmio-favicon.svg     the small mark in a square, ink on paper (paper on ink in a dark tab)
  site/js/brand/lettering.js            the single-stroke technical lettering for the drawn stage (Hershey Sans
                                        1-stroke, from tools/sources/singleline/HersheySans1.svg, git-ignored)
The geometry is site/js/brand/mark.js's (the same numbers, kept in step by hand): each half-wave 25 wide and 65 high;
W = four half-waves starting at the top, M = four starting at the bottom, the reset a straight vertical line between
them; the dot 9 across on the baseline; the I a stroke 65 high; the O an ellipse 56 x 65.
  python -I tools/brand.py"""
import base64, math, re, json
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "site/media/brand"; OUT.mkdir(parents=True, exist_ok=True)

HW, A, SW = 25.0, 65.0, 5.5          # half-wave width, height (amplitude, crest to trough), stroke
DOT_R, GAP1, GAP2, GAP3, OW = 4.5, 13.0, 13.0, 15.0, 56.0
X_DOT = 4 * 2 * HW + GAP1 + DOT_R     # 200 + 13 + 4.5
X_I = X_DOT + DOT_R + GAP2            # the I's stroke
X_O = X_I + GAP3 + OW / 2             # the O's centre
RIGHT = X_O + OW / 2

def wave_path():
    """W and M as cubic Béziers (each half-wave a cosine, crest to trough, its ends flat), the reset a vertical line"""
    k = 0.364212 * HW   # the cubic that best fits half a cosine over one half-wave: control points at 0.364 of its width
    d = [f"M0 0"]
    y = 0.0
    for i in range(4):   # W: top, bottom, top, bottom, top
        x0, x1 = i * HW, (i + 1) * HW; y1 = A - y
        d.append(f"C{x0 + k:.3f} {y:.1f} {x1 - k:.3f} {y1:.1f} {x1:.1f} {y1:.1f}"); y = y1
    d.append(f"L{4 * HW:.1f} {A:.1f}")   # the reset: one sharp vertical line, top to bottom
    y = A
    for i in range(4, 8):   # M: bottom, top, bottom, top, bottom
        x0, x1 = i * HW, (i + 1) * HW; y1 = A - y
        d.append(f"C{x0 + k:.3f} {y:.1f} {x1 - k:.3f} {y1:.1f} {x1:.1f} {y1:.1f}"); y = y1
    return " ".join(d)

def parts(col="currentColor"):
    return (f'<path d="{wave_path()}" fill="none" stroke="{col}" stroke-width="{SW}" stroke-linejoin="miter" stroke-miterlimit="10"/>'
            f'<circle cx="{X_DOT:.1f}" cy="{A - DOT_R:.1f}" r="{DOT_R}" fill="{col}"/>'
            f'<path d="M{X_I:.1f} 0V{A:.1f}" stroke="{col}" stroke-width="{SW}"/>'
            f'<ellipse cx="{X_O:.1f}" cy="{A / 2:.1f}" rx="{OW / 2:.1f}" ry="{A / 2:.1f}" fill="none" stroke="{col}" stroke-width="{SW}"/>')

TITLE = "WM.IO, a design and engineering studio"
pad = SW
small = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {RIGHT + 2 * pad:.1f} {A + 2 * pad:.1f}" role="img" aria-label="{TITLE}">'
         f'<title>{TITLE}</title><g fill="none">{parts("#121212")}</g></svg>\n')
(OUT / "wmio-mark.svg").write_text(small, encoding="utf-8")

# the hero version: the site's measurements in DM Mono Light (the font embedded, so the file stands alone)
font = base64.b64encode((ROOT / "site/fonts/dm-mono-300.woff2").read_bytes()).decode()
fs = 7.0
def dim_h(x0, x1, y, label):   # a horizontal dimension: extension lines, arrows, the label over its middle
    a = 3.2; m = (x0 + x1) / 2
    return (f'<path d="M{x0} {y - 4}V{y + 9}M{x1} {y - 4}V{y + 9}" stroke="#121212" stroke-width=".6" opacity=".55"/>'
            f'<path d="M{x0} {y}H{x1}M{x0 + a} {y - 1.4}L{x0} {y}L{x0 + a} {y + 1.4}M{x1 - a} {y - 1.4}L{x1} {y}L{x1 - a} {y + 1.4}" fill="none" stroke="#121212" stroke-width=".6"/>'
            f'<text x="{m}" y="{y - 3.5}" text-anchor="middle">{label}</text>')
def dim_v(x, y0, y1, label):
    a = 3.2; m = (y0 + y1) / 2
    return (f'<path d="M{x - 4} {y0}H{x + 9}M{x - 4} {y1}H{x + 9}" stroke="#121212" stroke-width=".6" opacity=".55" transform="translate(0 0)"/>'
            f'<path d="M{x} {y0}V{y1}M{x - 1.4} {y0 + a}L{x} {y0}L{x + 1.4} {y0 + a}M{x - 1.4} {y1 - a}L{x} {y1}L{x + 1.4} {y1 - a}" fill="none" stroke="#121212" stroke-width=".6"/>'
            f'<text x="{x - 3.5}" y="{m}" text-anchor="middle" transform="rotate(-90 {x - 3.5} {m})">{label}</text>')
hero_body = (dim_h(0, 2 * HW, -12, "λ 50.0") + dim_v(-12, 0, A, "A 65.0")
             + f'<path d="M{4 * HW} {A + 5}V{A + 11}" stroke="#121212" stroke-width=".6"/>'
             + f'<text x="{4 * HW}" y="{A + 19}" text-anchor="middle">RESET · W → M</text>')
hero = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-26 -26 {RIGHT + 34:.1f} {A + 54:.1f}" role="img" aria-label="{TITLE}, with its measurements">'
        f'<title>{TITLE}</title>'
        f'<style>@font-face{{font-family:"DM Mono";font-weight:300;src:url(data:font/woff2;base64,{font}) format("woff2")}}'
        f'text{{font-family:"DM Mono",ui-monospace,monospace;font-weight:300;font-size:{fs}px;letter-spacing:.06em;fill:#121212}}</style>'
        f'<g fill="none">{parts("#121212")}</g>{hero_body}</svg>\n')
(OUT / "wmio-mark-hero.svg").write_text(hero, encoding="utf-8")

# the favicon: the small mark centred in a square, with a quiet paper plate (dark tabs: paper on ink)
S = RIGHT + 2 * pad; side = S; oy = (side - (A + 2 * pad)) / 2
fav = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:.1f} {side:.1f}">'
       f'<style>.p{{fill:#F6F7F9}}.i{{stroke:#121212;fill:none}}.f{{fill:#121212}}@media (prefers-color-scheme:dark){{.p{{fill:#0E0E0E}}.i{{stroke:#EDEEF0}}.f{{fill:#EDEEF0}}}}</style>'
       f'<rect class="p" width="{side:.1f}" height="{side:.1f}" rx="{side * 0.12:.1f}"/>'
       f'<g transform="translate({pad:.1f} {oy + pad:.1f})" stroke-width="{SW * 1.6:.1f}">'
       + parts("x").replace('stroke="x"', 'class="i"').replace('fill="x"', 'class="f"').replace(f'stroke-width="{SW}"', f'stroke-width="{SW * 1.6:.1f}"')
       + '</g></svg>\n')
(OUT / "wmio-favicon.svg").write_text(fav, encoding="utf-8")

# the single-stroke lettering: Hershey Sans 1-stroke, only the glyphs the arrival writes
src = (ROOT / "tools/sources/singleline/HersheySans1.svg").read_text(encoding="utf-8")
TEXT = "Glad you’re finally here"
glyphs = {}
for m in re.finditer(r'<glyph unicode="([^"]+)"[^>]*?horiz-adv-x="([\d.]+)"(?:[^>]*?d="([^"]*)")?', src):
    ch = m.group(1).replace("&apos;", "'").replace("&amp;", "&").replace("&quot;", '"')
    if ch.startswith("&#x"): ch = chr(int(ch[3:-1], 16))
    strokes = []
    for part in re.split(r"\s*M\s*", m.group(3) or ""):
        nums = [float(v) for v in re.findall(r"-?[\d.]+", part)]
        if len(nums) >= 4: strokes.append([[nums[i], nums[i + 1]] for i in range(0, len(nums) - 1, 2)])
    glyphs[ch] = {"adv": float(m.group(2)), "s": strokes}
need = sorted(set(TEXT.replace("’", "'")))
data = {("’" if c == "'" else c): glyphs[c] for c in need}
notice = """// The single-stroke technical lettering the arrival writes before it settles into Newsreader (Part 5 "The name, the
// top bar and the title block"). Generated by tools/brand.py from Hershey Sans 1-stroke (EMS svg-fonts, Windell H.
// Oskay, https://gitlab.com/oskay/svg-fonts); only the glyphs of "Glad you’re finally here". Font units, y up, the
// baseline at 0, cap height 662 (the apostrophe is Hershey's quotesingle, its comma shape).
// The Hershey Fonts were originally created by Dr. A. V. Hershey while working at the U. S. National Bureau of
// Standards. The format of the Font data in this distribution was originally created by James Hurt, Cognition, Inc.,
// 900 Technology Park Drive, Billerica, MA 01821 (mit-eddie!ci-dandelion!hurt). (The notice the font's licence asks to
// be distributed with the data; the full text is in site/fonts/LICENSE-hershey.txt and CREDITS.md.)
"""
(ROOT / "site/js/brand").mkdir(parents=True, exist_ok=True)
(ROOT / "site/js/brand/lettering.js").write_text(notice + "export const CAP = 662;\nexport const GLYPHS = " + json.dumps(data, separators=(",", ":")) + ";\n", encoding="utf-8")
lic = src[src.index("<metadata>") + 10: src.index("</metadata>")].strip()
(ROOT / "site/fonts/LICENSE-hershey.txt").write_text(lic + "\n", encoding="utf-8")
print("mark", round(RIGHT, 1), "x", A, "| dot", round(X_DOT, 1), "I", round(X_I, 1), "O", round(X_O, 1), "| glyphs", "".join(need))

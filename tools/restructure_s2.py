"""One-off: restructure site/index.html for slice 2 (Part 2c sheet list, title blocks by discipline, act 1 stage)."""
import re
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "site" / "index.html"
s = p.read_text(encoding="utf-8")

s = s.replace("<title>Wajih Mansouri — software studio, Tunis</title>", "<title>Wajih Mansouri — studio, Tunis</title>")
s = s.replace('content="Websites, online shops and business apps, drawn before they are built."',
              'content="Websites, apps, platforms, security and AI, drawn before they are built."')
s = s.replace('  <script type="module" src="js/main.js"></script>\n</head>',
              '  <script type="importmap">{ "imports": {\n'
              '    "three": "./vendor/three/three.module.min.js",\n'
              '    "three/addons/": "./vendor/three/addons/"\n'
              '  } }</script>\n'
              '  <link rel="modulepreload" href="vendor/three/three.module.min.js">\n'
              '  <script type="module" src="js/main.js"></script>\n</head>')

names = ["Opening", "First drawing", "Principles", "Disciplines", "Method", "Work", "Process", "Studio", "Contact", "Spec"]
seg = "".join(
    f'    <li class="strip__seg" style="--i:{i}"><a href="#sheet-{i:02d}"><span class="strip__no">{i:02d}</span>'
    f'<span class="strip__name">{n}</span></a><i class="strip__fill"></i></li>\n' for i, n in enumerate(names))
s = re.sub(r'(  <ol class="strip__list">\n)(.*?)(  </ol>)', lambda m: m.group(1) + seg + m.group(3), s, count=1, flags=re.S)

a = s.index('  <main id="sheets">')
b = s.index("  </main>") + len("  </main>")
old_main = s[a:b]
o0 = old_main.index("    <!-- SHEET 00: OPENING -->")
o1 = old_main.index("    <!-- SHEETS 01")
opening = old_main[o0:o1]
opening = opening.replace(
    '<section id="sheet-00" class="sheet sheet--opening" data-sheet="00" data-title="Opening">',
    '<div id="sheet-00" class="layer sheet--opening" data-sheet="00" data-title="Opening" '
    'data-drawn="Design" data-checked="Engineering" data-approved="Strategy">')
opening = opening.replace("    </section>\n", "    </div>\n")
opening = opening.replace("Software studio · Tunis", "Studio · Tunis")
opening = opening.replace(
    "Websites, shops and business apps, engineered to the millimetre, tested until nothing breaks, and handed over ready to run.",
    "Websites, apps, platforms, security and AI, engineered to the millimetre, tested until nothing breaks, and run long after launch.")
opening = "\n".join(("    " + l if l.strip() else l) for l in opening.split("\n"))

FRAME = """          <div class="frame" aria-hidden="true">
            <div class="frame__zones frame__zones--top"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span></div>
            <div class="frame__zones frame__zones--left"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span></div>
          </div>"""

act = f"""  <main id="sheets">
    <!-- ACT 1: sheet 00 (opening) and sheet 01 (the first drawing) share one sticky stage -->
    <section id="act-1" class="act">
      <div class="act__stage">
{opening}
        <!-- SHEET 01: THE FIRST DRAWING -->
        <div id="sheet-01" class="layer sheet--plate" data-sheet="01" data-title="The first drawing" data-drawn="Design" data-checked="Engineering" data-approved="Security">
{FRAME}
          <figure class="plate">
            <img class="plate__img" src="media/plates/bell-us186787-sheet1.webp" width="1600" height="1740"
                 alt="Patent drawing, sheet 1 of A. G. Bell's US Patent 186,787 (1877): Fig. 1, a box telephone with a speaking tube, and Fig. 2, its vertical section.">
          </figure>
          <i class="scanline" aria-hidden="true"></i>
          <div class="read read--plate">
            <p class="read__eyebrow mono">Fig. 1 · 1877</p>
            <h2 class="read__title display">Every phone starts on paper.</h2>
            <p class="read__body body">US Patent 186,787, granted to Alexander Graham Bell on 30&nbsp;January 1877. Fig.&nbsp;1 is, in his words, &ldquo;a perspective view of one form of my electric telephone.&rdquo;</p>
            <p class="read__note mono">Plate: US Patent 186,787, sheet 1 · public domain</p>
          </div>
        </div>
        <svg class="redraw" aria-hidden="true"></svg>
        <canvas class="phone-canvas" role="img" aria-label="Concept phone LOFTHAUL, pulled apart into six labelled layers: Glass, Interface, Flow, Logic, Data, Lock."></canvas>
        <div id="s01-final" class="read read--final">
          <p class="read__eyebrow mono">Apps and phones</p>
          <h2 class="read__title display">The whole business in one pocket.</h2>
          <p class="read__body body">Six layers, each drawn before it is built: what the hand meets, every screen, the flow, the rules, the data and the lock.</p>
          <p class="read__tag mono"><span>Concept sheet</span> LOFTHAUL, a drone-delivery dispatcher. Made up to show the range, not a client.</p>
        </div>
      </div>
    </section>

    <!-- SHEETS 02–09: drawn in later slices -->
"""
todo = [("02", "Principles", "Strategy", "Design", "Engineering"), ("03", "Disciplines", "Engineering", "Security", "Strategy"),
        ("04", "Method", "Strategy", "Engineering", "Design"), ("05", "Work", "Design", "AI", "Engineering"),
        ("06", "Process", "Engineering", "Security", "Strategy"), ("07", "Studio", "Strategy", "Design", "Security"),
        ("08", "Contact", "Design", "Strategy", "Engineering"), ("09", "Spec sheet", "Engineering", "AI", "Security")]
for n, t, d1, c1, a1 in todo:
    act += (f'    <section id="sheet-{n}" class="sheet sheet--todo" data-sheet="{n}" data-title="{t}" data-drawn="{d1}" '
            f'data-checked="{c1}" data-approved="{a1}"><div class="todo"><p class="todo__no display">{n}</p>'
            f'<p class="todo__name mono">{t} · to be drawn</p></div></section>\n')
act += "  </main>"
s = s[:a] + act + s[b:]

ta = s.index('<aside id="titleblock"')
tb = s.index("</aside>", ta) + len("</aside>")
s = s[:ta] + """<aside id="titleblock" class="titleblock mono reveal-late" aria-label="Title block">
  <div class="tb__cell tb__cell--wide"><span class="tb__k">Project</span><span class="tb__v">Wajih Mansouri · Studio</span></div>
  <div class="tb__cell"><span class="tb__k">Sheet</span><span class="tb__v"><b class="tb__sheet">00</b> / 09</span></div>
  <div class="tb__cell tb__cell--title"><span class="tb__k">Title</span><span class="tb__v tb__title">Opening</span></div>
  <div class="tb__cell"><span class="tb__k">Scale</span><span class="tb__v">1:1</span></div>
  <div class="tb__cell"><span class="tb__k">Drawn</span><span class="tb__v tb__drawn">Design</span></div>
  <div class="tb__cell"><span class="tb__k">Checked</span><span class="tb__v tb__checked">Engineering</span></div>
  <div class="tb__cell"><span class="tb__k">Approved</span><span class="tb__v tb__approved">Strategy</span></div>
  <div class="tb__cell"><span class="tb__k">Rev</span><span class="tb__v">11.26</span></div>
</aside>""" + s[tb:]
p.write_text(s, encoding="utf-8")
print(s.count("data-sheet="), "sheets;", len(s), "bytes")

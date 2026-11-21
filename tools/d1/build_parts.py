"""Writes src/parts/sheet-03.html and sheet-03c.html (sheet 03 Disciplines, builder D1) from one table, so the six
scenes share exactly the same structure. Run: python -I tools/d1/build_parts.py && python -I tools/build.py"""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

FRAME = ('<div class="frame" aria-hidden="true"><div class="frame__zones frame__zones--top">'
         + "".join(f"<span>{i}</span>" for i in range(1, 9)) + '</div><div class="frame__zones frame__zones--left">'
         + "".join(f"<span>{c}</span>" for c in "ABCDEF") + "</div></div>")

S = [
    dict(id="sheet-03", key="websites", no="03.1", name="Websites", units=6, drawn="Design", checked="Engineering", approved="Strategy",
         plate=("bullock-us38200-sheet.webp", 1400, 1812, "Patent drawing, sheet 1 of W. Bullock's US Patent 38,200 (1863): Fig. 1, a perspective view of his printing press, with rolls, cylinders and gears."),
         years=("1863", "Today"),
         cap=("Fig. 1 · US Patent 38,200 · 1863", "The press that fed itself.",
              "William Bullock&rsquo;s printing press, patented on 14&nbsp;April 1863. Paper ran in from a continuous roll, was cut into sheets and printed on both sides in one pass, with nobody feeding it by hand. It was built for newspapers.",
              "Plate: W. Bullock, US Patent 38,200, sheet 1 · public domain"),
         line=("A front door that never closes.",
               "Company sites and online shops, drawn before they are built: quick on a weak signal, readable by anyone, found by search, and edited by you without calling us.",
               ["Company sites", "Online shops", "Booking", "Content you edit"]),
         draw="A website pulled apart into five layers: page, grid, content, shop and booking, hosting."),
    dict(id="sheet-03-apps", key="apps", no="03.2", name="Apps and phones", short="Apps", units=5, drawn="Design", checked="Security", approved="Engineering",
         plate=None, years=("1877", "Today"),
         cap=("Fig. 1 · US Patent 186,787 · 1877", "Drawn on sheet&nbsp;01.",
              "Bell&rsquo;s telephone opened this set. Nine drawings took it from his 1877 box to the phone in your pocket.", None),
         ref=True,
         line=("The whole business in one pocket.",
               "Apps for iOS and Android, drawn screen by screen. They keep working without a signal and stay in step with the systems behind them.",
               ["Customer apps", "Staff apps", "Field tools", "Offline first"]),
         draw="Today's phone in outline, with its screens, offline store and sync drawn in."),
    dict(id="sheet-03-platforms", key="platforms", no="03.3", name="Platforms and web apps", short="Platforms", units=6, drawn="Engineering", checked="Security", approved="Design",
         plate=("firman-us252576-sheet.webp", 1400, 2095, "Patent drawing of L. B. Firman's US Patent 252,576 (1882): Fig. 1, three switchboards wired to the same telephone lines, and an indicator board."),
         years=("1882", "Today"),
         cap=("Fig. 1 · US Patent 252,576 · 1882", "Every line on every board.",
              "Leroy B. Firman&rsquo;s multiple switchboard, patented on 17&nbsp;January 1882. Every subscriber&rsquo;s line ran to every operator&rsquo;s board, so any two lines could be joined from any board, and one exchange could serve a thousand subscribers or more.",
              "Plate: L. B. Firman, US Patent 252,576 · public domain · Fig. 1 is drawn turned on the sheet"),
         line=("Everything connected. Nothing exposed.",
               "Portals, dashboards and internal tools that join up the systems you already run. Each person sees exactly what their role allows, and nothing more.",
               ["Client portals", "Dashboards", "Internal tools", "Integrations"]),
         draw="A platform diagram: six services wired to one hub inside a closed boundary, with a single locked door."),
    dict(id="sheet-03-infra", key="infra", no="03.4", name="Engineering and infrastructure", short="Infrastructure", units=6, drawn="Engineering", checked="Security", approved="Strategy",
         plate=("edison-us274290-sheet.webp", 1400, 1732, "Patent drawing, sheet 1 of T. A. Edison's US Patent 274,290 (1883): four figures of lamps wired between dynamos with a central compensating conductor."),
         years=("1883", "Today"),
         cap=("Figs. 1–2 · US Patent 274,290 · 1883", "One lamp out, the rest stay lit.",
              "Thomas Edison&rsquo;s system of electrical distribution, patented on 20&nbsp;March 1883. A third, central wire carried the difference between two circuits, so when a lamp was taken out, the others stayed unchanged.",
              "Plate: T. A. Edison, US Patent 274,290, sheet 1 · public domain"),
         line=("The part nobody sees, built like everyone will.",
               "Servers, databases and the code between them, with a spare path for every part that can fail. Monitored, backed up with restores we actually test, and sized for your busiest day.",
               ["Cloud set-up", "APIs", "Databases", "Monitoring", "Backups"]),
         draw="An infrastructure diagram with redundant paths: two load balancers, two zones of servers, a primary database, a replica and off-site backups."),
]
SC = [
    dict(id="sheet-03-consulting", key="consulting", no="03.7", name="Consulting", units=6, drawn="Strategy", checked="Engineering", approved="Design",
         plate=("holmes-us275913-sheet.webp", 1400, 1786, "Patent drawing, sheet 1 of J. W. Holmes's US Patent 275,913 (1883): the solar theodolite in two elevations, with telescope, latitude arc and levelling base."),
         years=("1883", "Today"),
         cap=("Fig. 1 · US Patent 275,913 · 1883", "It found north from the sun.",
              "Joseph W. Holmes&rsquo;s solar theodolite, patented on 17&nbsp;April 1883. A surveyor&rsquo;s theodolite joined to a solar compass: sighted on the sun, it gave true north, the time and the latitude before a single line was laid out.",
              "Plate: J. W. Holmes, US Patent 275,913, sheet 1 · public domain"),
         line=("We measure before anyone builds.",
               "Before you spend: a survey of what you have, what it costs to run and what to build first. A second opinion on a quote, or a plan any team can build from.",
               ["Audits", "Technical plans", "Second opinions", "Build or buy"]),
         draw="A survey network: six points of a business measured by triangulation from one baseline, with a north arrow."),
    dict(id="sheet-03-care", key="care", no="03.8", name="Monthly care", short="Care", units=5, drawn="Engineering", checked="Security", approved="Strategy",
         plate=None, years=None, cap=None,
         line=("We stay after launch.",
               "Updates, fixes and backups, every month. Each change is logged like a revision on a drawing: what was done, when, and who checked it.",
               ["Updates", "Fixes", "Backups", "A monthly log"]),
         draw=None),
]
REVS = [("A", "Software and security updates applied", "01", "Security"),
        ("B", "Backup restored to a test copy", "01", "Engineering"),
        ("C", "Fix: booking form on small screens", "02", "Design"),
        ("D", "Software and security updates applied", "02", "Security"),
        ("E", "Backup restored to a test copy", "02", "Engineering"),
        ("F", "Speed check after a content change", "03", "Engineering")]


def section(s, first=False):
    o = []
    o.append(f'    <section class="chapter d3 d3--{s["key"]}" id="{s["id"]}" data-sheet="03" data-title="Disciplines · {s.get("short", s["name"])}" '
             f'data-drawn="{s["drawn"]}" data-checked="{s["checked"]}" data-approved="{s["approved"]}" data-d3="{s["key"]}" '
             f'aria-label="{s["name"]}" style="--units: {s["units"]}">')
    o.append('      <div class="chapter__stage d3__stage">')
    o.append('        <div class="d3__sheet">')
    o.append('          ' + FRAME)
    o.append(f'          <p class="d3__tab mono" aria-hidden="true"><span>Drawer {s["no"]}</span><span>{s["name"]}</span></p>')
    if s["plate"]:
        f, w, h, alt = s["plate"]
        o.append(f'          <figure class="d3__plate" style="--ar: {w} / {h}"><img class="d3__plate-img" src="media/plates/{f}" width="{w}" height="{h}" loading="lazy" decoding="async" alt="{alt}"></figure>')
    if s["key"] == "care":
        o.append('          <figure class="d3__revs">')
        o.append('            <figcaption class="mono"><span>Revisions</span><span class="graphite">Example log · drawn to show the method</span></figcaption>')
        o.append('            <table class="d3__table mono"><thead><tr><th scope="col">Rev</th><th scope="col">Description</th><th scope="col">Month</th><th scope="col">Checked</th></tr></thead><tbody>')
        for r in REVS:
            o.append(f'              <tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>')
        o.append('            </tbody></table>')
        o.append('          </figure>')
    else:
        o.append(f'          <svg class="d3__draw" role="img" aria-label="{s["draw"]}"></svg>')
    if s["years"]:
        a, b = s["years"]
        o.append(f'          <div class="d3__span" aria-hidden="true"><svg class="d3__span-svg"></svg><span class="d3__span-a mono">{a}</span><span class="d3__span-v mono"></span><span class="d3__span-b mono">{b}</span></div>')
    if s["cap"]:
        e, t, body, note = s["cap"]
        o.append('          <div class="read d3__read d3__read--plate">')
        o.append(f'            <p class="read__eyebrow mono">{e}</p>')
        o.append(f'            <h3 class="read__title display">{t}</h3>')
        o.append(f'            <p class="read__body body">{body}</p>')
        if s.get("ref"):
            o.append('            <a class="d3__ref mono" href="#sheet-01"><span class="d3__bubble" aria-hidden="true"><b>01</b><i>1–9</i></span><span>Back to sheet 01 · The first drawing</span></a>')
        if note:
            o.append(f'            <p class="read__note mono">{note}</p>')
        o.append('          </div>')
    t, body, offers = s["line"]
    o.append('          <div class="read d3__read d3__read--line">')
    o.append(f'            <p class="read__eyebrow mono">{s["no"]} · {s["name"]}</p>')
    o.append(f'            <h2 class="read__title display">{t}</h2>')
    o.append(f'            <p class="read__body body">{body}</p>')
    o.append('            <ul class="d3__offer mono">' + "".join(f"<li>{x}</li>" for x in offers) + '</ul>')
    o.append('          </div>')
    o.append('        </div>')
    if first:
        o.append('        <div class="d3__measure" aria-hidden="true"><svg class="d3__measure-svg"></svg>'
                 '<span class="d3__mv d3__mv--w mono"></span><span class="d3__mv d3__mv--h mono"></span>'
                 '<span class="d3__mv d3__mv--name mono">Sheet 03 · Disciplines · Scale 1:1</span></div>')
    o.append('      </div>')
    o.append('    </section>')
    return "\n".join(o)


head = "    <!-- SHEET 03: DISCIPLINES (builder D1: websites, apps, platforms, infrastructure; D2's sheet-03b follows) -->\n"
(ROOT / "src" / "parts" / "sheet-03.html").write_text(head + "\n".join(section(s, i == 0) for i, s in enumerate(S)) + "\n", encoding="utf-8")
headc = "    <!-- SHEET 03 (continued): consulting, monthly care (builder D1), after D2's security + AI -->\n"
(ROOT / "src" / "parts" / "sheet-03c.html").write_text(headc + "\n".join(section(s) for s in SC) + "\n", encoding="utf-8")
print("wrote sheet-03.html, sheet-03c.html")

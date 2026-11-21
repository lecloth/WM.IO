# Sheet 06 · Process (builder M, slice 9)

Files: `src/parts/sheet-06.html`, `site/css/sheet-06.css`, `site/js/sheets/sheet-06.js`,
`site/js/sheet06/gears.js` (geometry), `site/js/sheet06/mech.js` (the machine drawing), `site/js/sheet06/stress.js`
(Detail B + the pick figure). Test scripts (mine, not site code): `tools/shots/m6/shoot6.py`, `fps6.py`, `wide.py`.
`site/media/process/` was not needed: there are no outside assets.

## What it is
- **One machine drawing:** six real involute spur gears (20° pressure angle, module 1, labelled "m 4") in a **closed
  ring**: 1 Diagnose (z 30), 2 Draw (z 18), 3 Build (z 24), 4 Break (z 20), 5 Hand over (z 26), 6 Care (z 16).
  Care meshes back into Diagnose.
  - Six is even, so a closed ring can really turn (an odd ring would lock).
  - `gears.js` solves the ring at load time so it closes in position (every neighbour at exactly its centre distance)
    and in tooth phase: the Care → Diagnose mesh lands tooth-in-gap, closing on exactly 35 pitches.
  - Every gear angle comes from the drive angle through the real mesh ratio, so the teeth never clash.
- **Drawing language:** hairline tooth outlines; dash-dot pitch circles and centre lines; hatched shaft sections with
  keys; spoked or holed webs (Da Vinci wheel feel); construction lines between the centres; one overall dimension
  ("271 mm · 6 gears · m 4"); numbered balloons with leaders. Everything is SVG built in stage pixels on layout, so
  hairlines and dashes stay crisp. Colours come only from CSS tokens (`var(--ink)` etc., `rgba(var(--ink-rgb), …)`),
  so the dark version works with no JS changes.
- **Timeline** (p in true viewport heights, `--units: 17`):
  - 0–1: the entry.
  - 1–2: intro, "From sheet to screen."
  - 2–4: Diagnose. The plan draws: every pitch circle, centre line and construction line, plus the overall
    dimension. Gear 1 turns. Then its reading moment.
  - 4–8: Draw, then Build. For each: the gear draws itself out of mesh in graphite, slides into mesh along its line
    of centres and turns ink, and the whole train turns. Then the reading moment.
  - 8–12.4: Break. The gear engages; then Detail B (below); then its reading moment.
  - 12.7–14.7: Hand over.
  - 14.7–18: Care. It slides in between 5 and 1 and closes the ring, and the ring turns 120°. Then the last reading
    moment, which holds under sheet 07's entry.
  - Rotation and drawing happen only between reading moments. Cards toggle `.is-on` (.25 s fade); nothing moves
    under any card.
- **Break: an engineering stress test, not slapstick.**
  - A detail circle "B" draws on one tooth of gear 4. The ring dims, and the inset opens out of that circle (a
    clip-path circle).
  - Detail B shows one tooth in section at 5:1: hatched body, break lines, tooth centre line.
    1. The load arrow F grows along the line of action. The readouts climb ("Load / design load", "Stress / allowed"),
       a gauge bar rises past the 1.0 limit, and stress contour lines spread from the root fillet.
    2. A crack runs from the tension-side root fillet: "Rev A · cracked at 1.20 × design load".
    3. The load comes off. The old outline goes phantom and Rev B is drawn with a larger root fillet ("R 0.42 m, was
       R 0.06 m").
    4. The load goes back on to 1.50 ×, stress peaks at 0.90, and it reads "Rev B · holds at 1.50 × design load".
  - The inset says "Drawn illustration of how we test, not a test report." The figures are ratios inside a drawn
    diagram, not claims about any client or product.
- **The lock-pick nod (Fig. B2, in Detail B's margin):** one pin stack in section, kept small and different from
  D2's full lock scene. A hook pick enters along the keyway and lifts the stack until the spool driver pin's waist
  sits on the shear line ("Spool pin · false set"). It jiggles, the stack drops, the pick withdraws: "No entry".
- **Entry (the doors):**
  - Two vertical panels with `backdrop-filter: invert(1) grayscale(1)` close from the sides. Whatever they cover
    (sheet 05, pinned underneath) inverts and stays readable.
  - They meet on gear 1's axle position, not the screen centre, so the doors are asymmetric. Each crosses its own
    side in the same time.
  - In the black, the single vertical hairline collapses into gear 1's axle: a hatched shaft section with its key.
    The gear then draws itself round it: centre lines, pitch circle, teeth, web, and a diameter dimension
    "PCD Ø 120 · z 30 · m 4".
  - The black is my own paper sheet seen through the closed inverting doors, so gear 1 drawn "in the black" is the
    real gear 1. When the doors open (inverting what they still cover: frame, grid and gear), the sheet underneath
    is the process sheet, with gear 1 already in place.
- **Reduced motion:** the whole machine drawn finished (all six gears meshed, balloons, plan, dimension) as a sticky
  figure on the left, with the intro and all six stage cards as static text on the right. Detail B sits below them
  in its final state (Rev B holds, the pick fails). On a phone it is one column: drawing, cards, Detail B.
- **Mobile 390×844:** the ring sits above the cards (cards at the bottom, as on sheet 01). Balloons show numbers
  only, and Detail B switches to a tall layout with a horizontal gauge.

## Checks
- Freeze-frame shots at 1440×900, 1920×1080 and 390×844 across the whole timeline (`tools/shots/m6/out/*`), plus
  reduced motion on desktop and on phone. No console errors from sheet 06.
- fps through the whole sheet (real wheel input): desktop 58 fps, p95 16.8 ms, 1.3% slow frames; mobile 57.6 fps,
  p95 16.8 ms. Rendering is on demand only (`render(p)` runs on scroll change). The doors' backdrop filter is
  `display: none` outside the entry.
- Nothing on this sheet is interactive, so there are no hover or focus states to add.

## Decisions I made alone (and why)
- **A closed ring instead of a line of gears.** Care meshing back into Diagnose says "monthly care feeds the next
  round" without a word. It is also mechanically honest: an even ring turns, and the tooth phase really closes.
- **The doors meet on the axle, not the centre.** The line has to become gear 1's axle, and gear 1 sits top-left in
  the drawing. The asymmetry also keeps this chapter change unlike the others.
- **The doors invert with a backdrop filter**, not with mix-blend: my section is its own stacking context, so a
  blend would not reach sheet 05 underneath. `grayscale(1)` keeps the inversion neutral black and white, whatever
  colour sheet 05 ends on. There is a fallback to a solid ink panel.
- **The Break inset sits over the dimmed ring**, not in a separate column: the desktop width is shared with the
  reading card. Its labels show only once it is fully open and hide before it closes.
- **Stress numbers are dimensionless ratios** (load / design load, stress / allowed), with no MPa or material
  claims, plus an explicit "illustration, not a test report" note. This keeps the no-fabricated-proof rule.
- **The card copy says only what the client gets at each stage**, from the brief's list. Care adds "Care meshes
  back into Diagnose: what we learn turns the next round" (a description of the process, not a claim).
- **No outside imagery.** A public-domain Da Vinci gear study was considered for a margin, but the drawn ring
  already carries the Da Vinci-meets-patent look, and every outside asset needs licence work. Everything is drawn
  in code.

## Outside assets
None.

## Facts
No dates, statistics or third-party facts on this sheet. The one technical statement in the design (a closed ring
of an even number of gears can rotate, an odd one locks) is standard gear kinematics: neighbours turn in opposite
directions. Gear geometry follows the standard involute relations (base radius rp·cos 20°, addendum 1 m, dedendum
1.25 m).

## Known limits / for the lead
- **Shared-file issue (not mine), mobile only:** on 390×844 with reduced motion, `.s3b__plate-img` (sheet 03b) is
  1750 px wide. It widens the layout viewport to 1560 px and the whole page zooms out. It needs a `max-width: 100%`
  or similar in `sheet-03b.css`. With it hidden, my static mobile layout is correct.
- During the black moment the fixed title block (z 40, outside my stacking context) stays paper-coloured over the
  black. The act-1 curtain covers it because it lives at z 50. Harmless, but if you want it inverted it needs a
  shared-layer change.
- The title block switches to "06 · Process" at p 0.5 (main.js rule), which is mid-black.

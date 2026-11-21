# Sheet 07 · Studio (builder C, slice 10)

## What I built
- **Entry (p 0 → 1): sheet 06 folds down to title-block size and is filed.** Crease lines draw across the pinned
  sheet 06 first (two-tone hairlines: one ink line plus one paper line, so they show on light and dark content alike).
  Then roll folds, panel by panel: vertical folds to the right, then horizontal folds down onto the bottom-right corner.
  What is left is a packet exactly the size of the page's title block, sitting under it. The packet drops out of view and
  sheet 07 is what was underneath.
  - Drawn in place (`site/js/sheet07/fold.js`): our sheet is revealed outside the "hole" (the part of 06 still flat), and
    the moving panels are our own paper.
  - Orthographic: a panel turning about its crease projects to `width × cos(angle)`. Turning faces get a flat tone
    (no gradients).
  - The first fold's front face is sheet 06 itself (it shows through under the tone). Every face after that is the
    blank back of the paper.
  - Fold geometry comes from the title block's rect (read only), so the packet always lands on the title block at any
    screen size.
- **The bench (p 1 → 3): Fig. 7, "The bench, in plan · Not to scale"** (`site/js/sheet07/plan.js`).
  - A room in hairlines: hatched walls, one door, a plan chest, and one long drafting bench.
  - Five numbered desks on the bench: 01 Design, 02 Engineering, 03 Security, 04 AI, 05 Strategy. Each desk has a board,
    a parallel-motion straightedge and a set square. No people, chairs, names or faces.
  - A small sheet (with its own tiny title block) follows this sheet's real route from its title block: drawn at
    05 Strategy, checked at 01 Design, approved at 03 Security, then filed in the plan chest.
  - Stamps appear as it arrives: Drawn, Checked, Approved, Filed. The trail is drawn in hidden-line dashes.
  - Reading moment: "A bench, not a body shop." plus the brief's line, and a note naming this sheet's route.
- **The founder (p 3 → 5): "One name on the door."** The door in the plan swings open (leaf plus swing arc) and takes its
  name plate: "Door · one name / Wajih Mansouri".
  - The card is text only, with no portrait: a name plate ("Wajih Mansouri | Founder") and the true lines.
- The labels are HTML over the SVG, so they stay readable at any drawing scale.
  - On mobile, the desks show numbers only and the stamps show initials (D / C / A / F), with a legend under the drawing.
- Reduced motion: no fold. One calm finished sheet: the plan fully drawn with the route complete and the door named, and
  both reading moments shown.

## Founder card: every word checked against STUDIO_BRIEF Part 1 ("WHO I AM")
"Wajih Mansouri · Founder. Tunisian, based in Tunis. Speaks English, French and Tunisian Arabic. Seven years as cabin
crew taught him that a process has to hold up when everyone is tired."

| Line | Source |
|---|---|
| Tunisian, based in Tunis | Part 1: "Tunisian, based in Tunis" |
| English, French and Tunisian Arabic | Part 1: "I speak English, French and Tunisian Arabic" |
| Seven years as cabin crew | Part 1: "7 years as Emirates cabin crew, based in Dubai (2019–2026)" |
| "…a process has to hold up when everyone is tired" | The lead's wording, from the draft pitch's founder card ("processes that hold up when everyone is tired") |
| Founder | The studio is his own name (Part 1) |

## Decisions I made alone
- **No airline name and no Dubai on the card.** Naming Emirates isn't needed for the point. Whether to show Dubai as a
  location is still an open question in Part 1, and the settings file says Tunis only.
- **The café is left out.** It would be the only non-studio business on the page and pulls the reader towards
  hospitality ("don't box me into one industry"). It also sits next to "never mention past builds" (his café's POS).
- **"Not to scale" instead of a scale.** The bench is a diagram of how the studio works, not a measured room, so a
  scale would be a made-up number.
- **The route is this sheet's own title block** (Drawn Strategy · Checked Design · Approved Security), so the drawing
  shows rather than claims "drawn by one, checked by another".
- **Creases are two-tone lines, not a difference blend.** The kit gives every chapter a z-index, which makes it a
  stacking context (an isolated blend group), so a difference blend inside our stage can't reach sheet 06 underneath.
- **Folds are orthographic, not perspective.** The revealed area then matches the projected panel to the pixel: precise,
  not a 3D gimmick.

## Outside assets
None. Everything is drawn in code (SVG and CSS).

## Facts used
None beyond Part 1 of the brief (table above). No dates, numbers or claims.

## Checks
- Freeze-frame at 1440×900, 1920×1080, 1280×720 and 390×844 through the fold, the bench, the route and the founder.
  Text is only ever on or off (0.25 s CSS fade). Only lines move.
- Reduced motion (desktop + mobile): one static finished sheet.
- No console errors from these files.
- fps through 07 + 08 (`fps.py` adapted): desktop 55–55.5 avg, p95 16.8 ms; mobile 51–52 avg, p95 16.7 ms.
  - On both, the average is pulled down by one ~117–167 ms frame on first entry into the overlap. It is still there with
    sheet 07's render disabled (A/B tested), so it is the first paint of the incoming stage, not this code.

## Known limits
- On mobile the fold folds a narrow strip (the title block is small there), so there are more horizontal folds (capped
  at 6).

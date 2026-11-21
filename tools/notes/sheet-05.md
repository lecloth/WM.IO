# Slice 8: sheet 05 Work, "Sheets from the set" (builder W)

## Files (all mine)
- `src/parts/sheet-05.html`: section (`--units: 20`, title block Drawn Design · Checked AI · Approved Engineering), the
  board, every reading moment (intro, nine products, the blank sheet with the CTA), entry layers.
- `site/css/sheet-05.css`: everything scoped under `#sheet-05`, plus one global rule on my own class
  `html.s5-blue .strip, html.s5-blue .xhair` (the strip goes plain blueprint-white over the developed negative, as on
  sheet 01's blue sheet).
- `site/js/sheets/sheet-05.js`: timeline, entry, the set, hover/focus, reduced motion.
- `site/js/sheet05/sheets.js`: the set (order, Detail A centres, crops, disciplines), sheet DOM, layout, annotations.
- `site/js/sheet05/render.js`: `drawRegion()` (redraws any region of a product at any scale, crisp, through a shifted
  context: no thumbnails, no upscaled bitmaps), `negative()` (cyanotype tone map), an idle queue.
- Products library used read-only (`PRODUCTS` via `byId`, `ensureFonts`). No edits to shared files.

## What it is
Ten drawing sheets from one set slide onto the board one per screen (the outgoing sheet leaves left as the next comes
in from the right; whole sheets passing, reading text off while they move). Each concept sheet has:
- **Part view at 1:1**: the product drawn at full size (CSS px = the product's logical px), cut where the sheet ends,
  with drafting break marks on the cut edges and dimension lines giving the view's size in px.
- **Detail A at 2:1**: a circle redrawn at twice size around the product's one specific moment, marker + "A" bubble
  on the part view, leader to the detail (paper halo so it reads on dark screens too).
- **Key plan** (outline only, 1:10 web / 1:6 phone): where the part view and Detail A sit on the whole screen.
- **Its own title block**: product, "Concept sheet: Made up to show the range, not a client.", kind, industry,
  sheet 05.N / 05.10, scale, drawn / checked by discipline, own colour (hatched swatch; fills with the hex on hover).
- Phone sheets also carry Notes (1. concept, not a client; 2. 1:1 and 2:1 from the same drawing; 3. colour on hover).
- Reading column: eyebrow (sheet no, form, industry), name, one-line description, Detail A note, "Concept sheet" tag.
- Black and white on the sheet; the product's own colour only on hover (mouse) or focus (keyboard/touch tap). The
  current sheet is focusable (`tabindex=0`, `role=img`, full aria-label), others `-1`; focus-visible outline.
- Order alternates web/phone across nine industries: HALVANE, STRINGWALK, WARDCAST, QUAYCALL, QUILLFIELD, LOFTHAUL,
  FERNPAY, OVERWING, NIGHTWELL; then **05.10, blank**: "The next sheet is yours. Bring us the problem, not the product.
  We draw it before we build it." + button "Start a work order · Sheet 08" (`engine.scrollTo(engine.targetOf('#sheet-08'))`,
  verified to land on 08).
- The intro moment ("Sheets from the set.", nine products, nine industries, "drawn at full size or larger", concept
  label) is shown on sheet 05.1 right after the entry.

## Entry (p 0 → 1): the line closes and the black develops the next sheet
1. **Close (0.02–0.28)**: two horizontal panels with hairline edges close from top and bottom onto the centre line.
   They invert what they cover (`backdrop-filter: invert grayscale`, like 06's doors): sheet 04's black Method sheet
   turns to its paper negative, text included, so half-covered text stays readable.
2. **Shut (0.28)**: the inverted Method content goes (toggle), the line **opens into black** (a black band grows
   from the centre line, 0.29–0.38). Title block hidden via `is-black-moment` (0.28–0.97).
3. **Develop (0.40–0.66)**: a cyanotype NEGATIVE of sheet 05.1 (HALVANE's exploded movement) comes up in the black:
   Prussian ground (`--prus`) and blueprint-white lines (a copy of the board + sheet with tokens swapped; the screen
   canvases tone-mapped linearly ink→white, paper→Prussian). Ground and lines come up first; the image and every label
   "fix" in at once (class toggle, ≤ .25 s, never half-faded). Label: "Sheet 05.1 · Negative · Developing" → "· Fixed".
4. **Open (0.78–1.0)**: the curtain opens from the same line; the negative recedes in two bands with hairline edges
   and the black-and-white sheet is underneath, aligned exactly (text crossing an edge is the same text, negative on one
   side, positive on the other).

## Decisions I made alone (and why)
- **Sheets leafed horizontally, one per screen, not a magnifier over a set**: a magnifier needs a shrunk overview,
  which is exactly the unreadable thumbnail the brief bans. Whole sheets passing keeps text still while read.
- **Part view 1:1 + Detail A 2:1 + key plan** instead of scaling screens to fit: it is honest drafting (part views,
  break lines, details, key plans are real conventions) and keeps every screen at 1:1 or larger. Phones too: the
  phone part view is 390 px wide at 1:1 and cut top/bottom with break marks when the sheet is shorter than 844 px.
- **HALVANE first**: a light screen makes the truest cyanotype (an exploded watch movement in Prussian blue reads
  like a patent plate). HALVANE's accent is brass `#B98A3E` (as set in the library), so no blue on hover.
- **Paper beat at shut**: sheet 04 is black, so inverting panels turn it to paper, not black. Rather than flipping
  polarity in one frame, the closed curtain clears and the black opens out of the line. Logged as the one design
  compromise of the entry.
- **Explicit crop origins** for some web products (QUILLFIELD, FERNPAY, WARDCAST, and mobile crops) so the cut falls on
  the screen's own rules, not through a line of text. Detail A is clamped inside the screen and the part view.
- **Phone sheets put Detail A level with its marker** (short, flat leader); notes go above or below it, and hide when
  they would sit under the title block (e.g. QUAYCALL at 1920×1080).
- **Disciplines per sheet** (Drawn / Checked): HALVANE Design/Engineering, STRINGWALK Design/Engineering, WARDCAST
  AI/Design, QUAYCALL Engineering/Design, QUILLFIELD AI/Security, LOFTHAUL Engineering/Design, FERNPAY
  Security/Engineering, OVERWING Design/Strategy, NIGHTWELL Engineering/Design; the blank sheet: "Yours / Ours".
- **Mobile (390×844)**: same story; paper on top with the 1:1 part view cropped to the moment (no Detail circle, no
  key plan; title block trimmed to product, sheet, scale, drawn, own colour), reading text under it at 17 px.
- **Reduced motion**: no entry; intro, then every sheet finished (with Detail A, key plan, title block) beside its
  text, one under the other (stacked on mobile).

## Checks
- Freeze-frame at 1440×900, 1920×1080 and 390×844 across the entry (0.1–1.02) and every sheet's hold and slide:
  text is shown or hidden, never half-faded; nothing moves under reading text. Shots in `tools/shots/w/`.
- Hover (STRINGWALK green, swatch fills with `#19A35B`) and keyboard focus (LOFTHAUL orange + outline) checked.
- fps through the whole sheet (wheel on desktop, scroll steps on mobile): 59.7 fps desktop, 59.9 mobile,
  p95 16.8 ms, <0.3% frames over 25 ms. Canvases are drawn once per size and cached (accent drawn on first hover).
- No console errors or page errors in any run.

## Outside assets
None. Everything is drawn in code (the products library + my own SVG/CSS).

## Facts
No dates or outside facts on this sheet. "Nine products … across nine industries" is true by the library (Logistics,
Ports and shipping, Energy, Aviation, Science, Luxury retail, Healthcare, Insurance, Payments). Product descriptions
paraphrase what each concept screen shows (see `tools/notes/products.md`). Product names were web-checked by P; I
added no new names.

## Known limits / for the lead
- The entry's paper beat (0.28–0.38) exists because the sheet underneath is black; see the decision above.
- At narrow desktops (1024–1200 px) the layout scales by rem, so the reading body is under 18 px there (site-wide).
- `--units: 20` (about 21 viewport heights of scroll for ten sheets); shorten STEP in `sheet-05.js` if it feels long.

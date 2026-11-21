# Sheet 04 · Method (slice 7), builder A

## What I built
- `src/parts/sheet-04.html` (a passing-sheet layer + its paper under-layer, then the section), `site/css/sheet-04.css`,
  `site/js/sheets/sheet-04.js`, `site/js/sheet04/plot.js` (hairline plotter, shared with sheet 02),
  `site/js/sheet04/drawings.js` (the four drawings).
- Title block: Drawn Strategy · Checked Engineering · Approved Design. `--units: 8` (p 0..9).
- **Inverted sheet:** the sheet re-declares the tokens swapped (`--ink-rgb ← --paper-rgb`, `--paper-rgb ← --ink-rgb`,
  `--ink`, `--paper`, `--hair`, and a lighter `--graphite` = ink at 64 % so small mono stays above AA on ink), so the
  shared `.frame`, `.read__*` and drawing classes all flip without literals. Canvas-free; the band colour is computed
  from `--paper-rgb`/`--ink-rgb` at runtime and on `engine.on('theme')`.
- **Entry (p 0 → 1), sheets passing with inversion:** a full-width sheet slides across left → right in
  `mix-blend-mode: difference`, carrying registration targets and "SHEET 04 · METHOD · INK SIDE UP" along its edge.
  Everything it covers flips black/white (sheet 03's last scene becomes a readable negative; text under the edge simply
  inverts). It holds as a complete negative for a beat (p 0.45–0.55: the black moment shows sheet 03 as its own
  negative), then slides on and leaves the black Method sheet behind its trailing edge (a hairline with ticks), with
  Fig. 4.1 already drawing itself on.
  - Because each chapter section is its own stacking context (blend would be isolated), the band lives *outside* the
    section, in `#sheets`, at the section's z-index and earlier in the tree (above sheet 03, below this sheet).
  - Its colour is |paper − ink| per channel, so over paper it lands exactly on `--ink`.
  - A paper under-layer (`.s04-under`, z-index 1, same transform) sits beneath everything in the band's footprint, so
    transparent parts of the sheet below (sheet 03's bare drafting-film areas) also invert to ink instead of blending
    with nothing.
- **Scene:** four steps, ~1.2 vh reading each; between them the drawing un-draws in order while the next draws on
  (labels pop on/off only once their line is down). Text right (eyebrow, title, optional display subtitle, one body
  line), drawing left in an 800×560 design space, figure caption bottom-left, 01–04 index top-left.
  1. Problem before pixels. Fig. 4.1: "The brief" sheet, one heavy line dimensioned "ONE SENTENCE", three leaders
     (who it hurts / what it costs / how we'll know); the screens beside it in *hidden (dashed) lines*, "drawn after".
  2. Flow before form. Fig. 4.2: a booking flow, Open → Pick a time → Free? → Confirm → Done, with its wrong turns
     mapped (No → Next slot → back; Declined ⇄ Retry).
  3. Built for autopilot. (subtitle "The tired Tuesday, not the perfect demo.") Fig. 4.3: one-thumb reach study,
     pivot, EASY / STRETCH / HARD arcs, the main action inside the easy zone, its dashed hit area dimensioned 48 DP.
  4. Handed over clean. (subtitle "You own the code, the accounts, the keys and the notes.") Fig. 4.4: an open drawer
     with its four parts exploded above it (code, accounts, keys, notes, ballooned 1–4) and a drawing-style parts list
     (ITEM · PART · WHAT IS IN IT · OWNER: YOU).
- Mobile: drawing at the top (11.5–49.5 % of the height), caption under it, text at the bottom; labels 10 px.
- Reduced motion: no band; the four steps stacked on one ink sheet, each drawing finished.
- Checks: 1440×900, 1920×1080, 390×844 at entry / reading / transition positions; reduced motion; no console errors from
  this sheet; fps over this sheet's range: desktop 58 fps, p95 16.8 ms; mobile 56.7 fps, p95 16.8 ms.

## Decisions I made alone
- Long titles split into title + display subtitle (steps 3 and 4) so no title runs to four lines; wording unchanged.
- Explanatory lines (all ≤ 21 words, about how the studio works, no numbers or clients):
  1. "We write the problem down first: who it hurts, what it costs, and how we will know it is fixed. Screens come after."
  2. "We map every path through the product, wrong turns included, before anyone picks a colour or a font."
  3. "We design for people who are busy, distracted and using one thumb, so the right move is always the easy one."
  4. "Everything is set up in your name, with notes a new developer can follow without us."
- Hidden-line convention (dashed = not drawn yet) used to say "problem before pixels" in drafting language.
- The band moves left → right with a hold at full negative, rather than a straight sweep, so the black moment does
  something: it shows the previous sheet as a negative before the Method sheet replaces it.
- Drawing labels are kept to ≤ 17 characters so they fit at phone width.

## Outside assets
None. Everything is drawn in code.

## Facts and their sources
| On the site | Source |
|---|---|
| "48 DP" / "AT LEAST 48 DP" minimum touch target | Google, Android accessibility help, "Touch target size" (https://support.google.com/accessibility/android/answer/7101858): touch targets at least 48×48 dp; Material Design density guidance (https://material.io/design/layout/applying-density.html) |

## Known limits / for the lead
- The entry passes over whatever sheet 03c's last scene is; it was checked against 03c's current revision log scene
  (mostly transparent stage, now handled by the under-layer). If 03c changes, nothing here needs to change.
- The flow in Fig. 4.2 is a generic booking flow, not any client's product.

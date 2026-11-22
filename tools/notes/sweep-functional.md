# Sweep: functional / visual (final bug sweep)

Builder: functional/visual sweep. Copy text was not changed (copy issues are reported, not edited). Nothing committed.

## How it was checked (tools added to `tools/`, all re-runnable)

| Tool | What it does |
|---|---|
| `sweep.py` | Steps through the whole page (default every 0.25 viewport), screenshots, and on every frame checks text automatically: half-faded (`fade`, effective opacity 0.05–0.95 twice 250 ms apart), moving while the page is still (`move`), overlapping text runs (`over`), page width (`width`), plus the title block / strip per frame. `--mobile --reduced --dark --w --h --from --to`. |
| `sweepsum.py` | Summary of a sweep with the known false positives filtered (frame zone letters under a passing sheet, a leader label touching its own sub-line, the title block moving in the loop's last frame). |
| `contact.py` | Contact sheets of a sweep folder for the eye pass. |
| `jump.py` | Jumps straight to scroll positions after the opening and prints the title block + active strip segment. |
| `keys.py` | Tab through the page: for each stop, focus ring, real visibility (opacity chain, visibility, on top), in view. |
| `wo.py` | The live work order: types like a visitor, reads the title block, decodes the mailto: / wa.me URLs, tries the error paths, records outside requests. |
| `states.py` | First visit (`?first`), return visit, key-press skip, two loops back to the singularity with the product rotation (tag + aria-label). |
| `hover.py` | Product colour on hover and on keyboard focus (hero phone, a Work sheet), button hover. |
| `fps_all.py` | Frame rate over the whole page (real wheel input on desktop, stepped native scroll on mobile), per sheet, slow-frame list, plus every network response (non-200 / outside 127.0.0.1). |
| `links.py` | Static crawl of every src / href / url() / import / fetch / asset string in `site/index.html`, `site/css`, `site/dist`, `site/js`: every local file must return 200. |
| `axe.py` | axe-core WCAG 2.1 AA on the whole document (both themes, motion and reduced, desktop and mobile), plus the result of the page's own run on sheet 09. |
| `contrast.py` | Hand-computed contrast for every text run (axe leaves most of this page "incomplete" because of the board grid's gradient background). |

## Issues found and fixed

| # | Where | Issue | Fix |
|---|---|---|---|
| 1 | Sheet 01, years axis, 1440/1920 | The marker's year ("2007", "Today") ran over the axis name "Years · 1870–2030". | Axis name moved under the tick numbers (`site.css .years__name`). |
| 2 | Sheet 01, years axis, 390 | "Today" ran off the right end of the axis ("TOD"). | Near the right end the year reads to the left of the marker (`act.js`, `.years__label.is-left`). |
| 3 | Sheet 01 → 02 entry | The six layer labels (and the 154/74 mm dimensions) stayed on while the tracing film slid up over them: half-covered text. | Labels leave with the reading text, before the film reaches them (`act.js`, labels 0 from `T.end - 0.8`). |
| 4 | Sheet 02 → 03 entry, 390 | The dimension lines ran through "Locked." and its caption; "95.4 MM" sat on the principle index. | Sheet 02's words leave as the first dimension line runs out (`sheet03/entry.js` toggles `is-measured-out` on sheet 02's stage; rule in `sheet-03.css`). |
| 5 | Sheet 02, 390 | The scan's tag ("Redraw →") sat on the frame's zone numbers. | On phones the tag sits just inside the top of the plate (`sheet-02.css`). |
| 6 | Sheet 06, Break | The ghosted gear train kept its dimension text at 14 % opacity ("271 mm · 6 gears · m 4"), and scrubbed it back in: half-faded text for ~3 viewports. | The dimension text is hidden while the train is dimmed (`sheet06/mech.js`). |
| 7 | Sheet 06 → 07 entry (fold) | Fold panels cut "Every month, after launch." in half for ~0.15 viewport. | Sheet 06's words leave as the first crease is drawn (`sheet-07.js` toggles `is-filing`; rule in `sheet-07.css`). |
| 8 | Sheet 07 → 08 entry | The growing title block crossed "One name on the door." and the bench labels. | Sheet 07's words leave as the title block is selected (`sheet-08.js` toggles `is-handing`; rule in `sheet-08.css`). |
| 9 | Sheet 08, 390 | The tall work order scrolled up under the see-through strip: its words printed across the strip labels. | The work order is clipped at the strip while it travels (`sheet-08.js`, clip-path follows the scroll). |
| 10 | Sheet 08 → 09 entry | The drawing-set slots and their labels were drawn on top of the shrinking work order ("Bring us the problem." crossed by slot frames). | The shrinking sheet's footprint is cut out of the set (evenodd clip), so it passes over the set as a whole sheet (`sheet-09.js`). |
| 11 | Sheet 09 entry, 1440 + 1920 | Slot labels "08 Contact" / "09 Spec sheet" sat under the page's title block. | The set's bottom is laid out from the title block's real top (`sheet-09.js` `layout()`). |
| 12 | Sheet 09 entry, 390 | The work order shrank by width only, so on a phone it ran far below its slot, over "08 Contact" and under the title block. | It now fits its slot (width and height, above the slot label), centred (`sheet-09.js`). |
| 13 | Sheet 09 spec table, 1440 | "2 families · 4 files" overflowed into the "How" column. | Values wrap (`sheet-09.css td.mono`). |
| 14 | Sheet 09 spec, reduced motion 390 | The table was shifted up 4.5rem over the intro text and off the left edge (the phone's `bottom/right` offsets applied to the static, relative table). | Static rule resets `right/bottom` (`sheet-09.css`). |
| 15 | Sheet 05, 390 | Reading text started under the frame's zone letters ("E" over "Nine products…"). | Reading column clears the zone column on phones (`sheet-05.css .s5-read`). |
| 16 | Reload mid-page | The browser restored the scroll position under the opening: blank board, wrong strip, wrong title block, for good. | Full-motion visits always start at the singularity (`history.scrollRestoration = 'manual'`, scroll to 0 before the engine starts); a `#sheet-NN` link is remembered and travelled to after the opening (`index.template.html`, `main.js`). |
| 17 | Keyboard | Elements set to `visibility: visible` inside sticky stages leaked out of their stage's `is-away` (hidden) state: e.g. sheet 05's "Start a work order" button stayed focusable from sheet 08, Tab jumped the page back 20 000 px and the work order was never reached. | Every motion-mode `visibility: visible` inside a stage is now `inherit` (sheet-02/03/03b/04/05/06/08 CSS; inline styles in plate-fig, plot, fold, plan, grow, sheet-06, sheet-07). Tab now goes strip → whatever is on the board → title block, nothing hidden is focusable. |
| 18 | Title block Print switch | axe `label-content-name-mismatch` (aria-label "Print the sheets dark" vs visible "Print Light"); aria-pressed with a changing label. | Visible words + a screen-reader-only tail: "Print Light, switch to dark" (`index.template.html`, `theme.js`, `.sr-only`). |
| 19 | Sheet 09 "Accessibility checks" cell | Reported "1 issue": the page's own axe run sometimes started while the reading moment was still fading in, so colour contrast was measured on half-faded text (31 nodes, e.g. #807f7d on paper). | The run waits until no CSS transition is running (≤ 3 s). Now "No issues · WCAG 2.1 AA rules" in every mode. |
| 20 | Strip, contrast | Inactive strip names at 55 % opacity: ≈4.5:1 on paper (borderline) and ≈3.8:1 over the blue sheet (fails AA for 10 px text). | 70 % (≥5.4:1 on blue). |
| 21 | Strip, reduced motion | The page scrolls as one flow, so text ran under the see-through difference strip and printed across its labels. | Solid paper strip in reduced motion. |
| 22 | Hero phone | Product colour only on mouse hover; no keyboard way; hover dead in reduced motion (`P` stayed −1). | The phone canvas takes focus during its reading moment (and always in reduced motion), focus shows the product colours, visible focus ring; hover works in reduced motion. |
| 23 | Frame rate, phone | A 350 ms stall the first time the 3D phone renders (shader compile + textures) mid-scroll on mobile. | Warm-up render on idle after the opening, while the canvas is still invisible (`act.js`). |
| 24 | Lead's items | Caption links in `.read__note` looked like plain text; `NOW = 2026` in sheet03/scene.js. | Underlined, 2 px focus outline, not focusable while their panel is hidden (`.read` is `visibility: hidden`); `NOW = new Date().getFullYear()`. Longer colophon / Bell / Plan 25 captions checked at 1440 and 390: no overlaps. |

## Checked and left as designed (not bugs)

- Text inverting where the difference curtain crosses it (00 → 01 section cut, 04 → 05 line closing, 05 → 06 doors, the 05 negative opening): the brief's "text crossing the curtain inverts"; text stays readable on both sides.
- Whole sheets passing with their text (03 plan-chest slides, 04 inverted sheet, 05 sheets sliding through the set, 08 → 09 shrink): the freeze-frame exception "except whole sheets passing". Their own title blocks pass under the page's title block while in transit only.
- Live readouts that change with scroll (06 stress "1.20 ×", years marker label at rest only, 09 measured values).
- Product "part views" on Work sheets are crops of full-size screens (break lines drawn); text inside the screen is cut at the window edge by design.
- Product screens stay light in dark print (they are the product's own UI, not the sheet).

## Copy problems spotted (reported, not edited)

- None that are functional. (Copy was being edited by the truth sweep at the same time.)

## Final clean re-run (after all fixes)

**Freeze-frame sweeps** (`sweep.py` every 0.25 viewport, screenshots every 0.5, eye pass on contact sheets + automatic checks; `sweepsum.py` after filters):

| Run | Frames | Real issues left | Page width |
|---|---|---|---|
| 1440×900, light | 543 | 0 | = innerWidth on every frame |
| 1920×1080, light | 543 | 0 | = |
| 390×844, light | 548 | 0 (the one hit, the scan tag on the principle index, was fixed and re-swept: 34 frames, 0) | = |
| 1440, reduced motion | 84 (0.5 vh) | 0 | = |
| 390, reduced motion | 92 (0.5 vh) | 0 ("1883" flagged is under the opaque reading panel) | = |
| 1440 / 390, dark print | 272 / 275 (0.5 vh, run mid-sweep) | 0 besides the passing-sheet cases | = |

Every chapter change (02, 03, 03 sub-scenes, 04, 05, 06, 07, 08, 09) was also swept at 0.08–0.1 viewport steps at 1440. Strip and title block were checked per frame (and with direct jumps after the opening): they show the right sheet everywhere, and reset to 00 on the loop.

**States**
- First visit (`?first`): ready 3.7 s after navigation (1.5 s of it is the real load on this server). Return visit: 2.25 s (load ~1.4 s + opening ~0.6 s). Key press during the opening: ready at 1.8 s (as soon as the load allows), scroll unlocked, title block "Opening".
- Reload mid-page / arriving on `#sheet-08`: starts at the singularity, then travels to the sheet (fix 16).
- Loop: the end of 09 jumps back to the top in ~1.2 s, the opening replays, strip and title block reset; hero phone + tag + aria-label go LOFTHAUL → QUAYCALL → STRINGWALK over two loops (`wm:product` 0 → 1 → 2).
- Dark print: switch works with click, Enter and Space; every sheet checked dark at 1440 and 390.
- Hover / focus: hero phone and Work sheets show the product colour on hover and on keyboard focus (Work sheet title block then reads "Own colour #B98A3E"); buttons fill on hover; focus rings on everything interactive.
- Keyboard: from the top, Tab goes strip 00–09 → the two opening buttons → Print switch → back to the strip; from any sheet, Tab after the strip lands only on what is on the board (sheet 03 "Back to sheet 01", the Plan 25 credit links, AI "Approve and send" / "Edit draft", the hero phone, the Work sheet, "Start a work order", the work order fields and buttons, "Back to the first sheet") and never scrolls the page; every strip link with Enter lands on its sheet with the right title block.
- Work order: empty send → "Tell us what's in the way first. One line is enough." and focus to the field, nothing opens; typing fills project ("Booking Spreadsheet Breaks"), WO number, 5 disciplines with the words that triggered them, 7 sheets; a bad contact line → "Not an email or a phone number yet. Or leave it empty." and "Reply by: Check the contact line"; mailto: and wa.me URLs decode exactly to the work order (CRLF in mail, `&` → `%26`, `+` → `%2B`, `@` → `%40`); Enter in the form moves focus to "Send by email"; no request leaves the page.

**Console**: 0 errors, 0 warnings in every run above (all sweeps, fps runs, keyboard, work order, states, axe).

**Frame rate** (`fps_all.py`, the whole page, real wheel input desktop / stepped native scroll mobile):

| Size | Frames | fps | p95 | slow > 25 ms | worst sheet |
|---|---|---|---|---|---|
| 1440×900 | 7274 | 59.3 | 16.8 ms | 0.6 % | 08: 57.0 fps |
| 1920×1080 | 8527 | 59.2 | 16.8 ms | 0.5 % | 03 Security: 57.6 fps |
| 390×844 | 1907 | 59.2 | 16.8 ms | 0.5 % | 07: 54.2 fps (one 116 ms frame) |

**Links**: static crawl 108 local references (HTML, CSS, dist bundles + chunks, js sources, fonts, plates, vendor, axe) → all 200. Runtime over the whole page: 45 responses desktop / 46 mobile, all 200/304, **0 requests outside 127.0.0.1**. The only outside URLs in the markup are the two Plan 25 attribution links (followed by the visitor, never requested); mailto: / wa.me are built at runtime from `settings.js`.

**axe-core WCAG 2.1 AA** (whole document): 0 violations in all 8 combinations (light/dark × motion/reduced × desktop/mobile); sheet 09's own cell reads "No issues · WCAG 2.1 AA rules" in all of them. `contrast.py` (hand-computed for all text, since axe marks most of it "incomplete" on the gridded board): no failures (only false positives where the background is a canvas, checked by hand: blueprint ink on Prussian ≈ 9:1, strip at 70 % on blue ≈ 5.4:1).

## Could not fix / notes for the lead

- Return visit takes ~2.2 s from navigation to scroll on this local server: ~1.4 s of it is the page genuinely loading (the plain `http.server` answers every file again, no caching), the opening itself then runs ~0.6 s as designed. On real hosting with caching it will be near-instant.
- A few single-frame hitches remain at first paints (not fixed, outside the sweep's safe scope): the start of the 06 → 07 fold (~180–210 ms at 1440, ~116 ms on a phone; a Chrome trace shows one GPU raster task, the first raster of sheet 07's plan with its hatch pattern + mask under a moving clip-path; same with and without this sweep's text-hide change), the first sheet 03 plate (~100–116 ms), the sheet 02 film develop (~66–100 ms). Averages stay ≥ 59 fps; pre-rasterising those layers on idle would remove them if wanted.
- The Work sheets' own title blocks pass under the page's title block while a sheet slides through (only in transit; at rest they are clear).
- `tools/sweep.py` heuristics: `over` also fires on leader labels touching their own sub-line and on frame zone letters under passing sheets; `sweepsum.py` filters these.

## Files changed by this sweep

- Markup: `src/index.template.html` (scroll restoration + `#sheet-NN` arrival, Print switch accessible name). `site/index.html` rebuilt.
- JS: `main.js`, `engine/theme.js`, `sheet01/act.js`, `sheet03/entry.js`, `sheet03/scene.js`, `sheet03b/plate-fig.js`, `sheet04/plot.js`, `sheet06/mech.js`, `sheet07/fold.js`, `sheet07/plan.js`, `sheet08/grow.js`, `sheets/sheet-06.js`, `sheets/sheet-07.js`, `sheets/sheet-08.js`, `sheets/sheet-09.js` (dist rebuilt).
- CSS: `site.css`, `sheet-02.css`, `sheet-03.css`, `sheet-03b.css`, `sheet-04.css`, `sheet-05.css`, `sheet-06.css`, `sheet-07.css`, `sheet-08.css`, `sheet-09.css`.
- New tools: `sweep.py`, `sweepsum.py`, `contact.py`, `jump.py`, `keys.py`, `wo.py`, `states.py`, `hover.py`, `fps_all.py`, `links.py`, `axe.py`, `contrast.py`. Screenshots in `tools/shots/sweep/` (git-ignored, ~280 MB; safe to delete).
- No copy wording changed.

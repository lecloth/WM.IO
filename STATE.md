# STATE — Wajih Mansouri studio site (local experiment)

## Take 2 (started 22 Nov 2026)

**Read `STUDIO_BRIEF.md` Part 5 first.** It overrides everything above it in the brief, and this section overrides
Take 1's history below.

- **Folder:** `C:\wajih-mansouri-studio - Take 2` (this one).
- **Frozen:** `C:\wajih-mansouri-studio` is Take 1, git tag `take-1` (= `0c404ed`). Never write to it, never run anything in it.
- **Serve:** `python -m http.server 8109 --bind 127.0.0.1 --directory "C:\wajih-mansouri-studio - Take 2\site"`.
  Port 8109 only (Take 1 keeps 8108; never 8000, 8100–8102, 8105–8108).
- **Commits:** "studio take 2: <short title>"; the final commit gets tag `take-2`.
- **Phone:** Galaxy S23 Ultra (SM-S918N) over wireless debugging, `adb reverse tcp:8109 tcp:8109` (the site never leaves 127.0.0.1).
- **Every geometry check runs at 14 sizes** (round 7: the 9 of Part 5 "Fixes after pages 2–3" + the five most common phones): 384×734 @2.8125, 390×844 @3, 1280×720, 1366×768, 1440×900,
  1920×1080, **2160×1147 @1.333 (Wajih's laptop window: 1440×900 at 200% Windows scaling, Chrome at 67%)**, 1440×765 @2, 2560×1440,
  360×800 @3, 375×667 @2, 393×852 @3, 412×915 @2.625, 430×932 @3; light and dark; desktop windows with their scrollbar (as real Chrome on Windows).
- **How it runs:** style lab first (Wajih points) → one page at a time: build → wording batch → his S23 test →
  geometry check → commit → this file. Stop for Wajih only at style picks, each page's wording, each page's phone review.

### Running order (Part 5 "Lab picks" + "Copy and the team page" + "Page 1 refinements" + "Page 1, round 3" + "Round 4 picks", ~37 viewports in total)

| # | Page | What happens | Viewports | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Enter + hook | Beacon → Bell's sheet (paperless: his ink on our grid): eight clean outlines draw on, morph into the X-ray phone → pieces named on leader lines → kinetic line, pieces join, ground back to paper → real (phone A) → "…to serve you." → YOU → "YOU gave us the task." → WE + verb drum (detent, double-pulse click, live measurements) → "Now, what do you need?" → the way in (A: the grid folds into the hallway; B cut, C square on the sheet) → "We design backwards…" → five frameless drawings in backwards order (1 where customers give up, 2 design, 3 your way of deciding, 4 speed, 5 every phone: the real iPhone and Galaxy turn by themselves), each with its label on a frosted backing; the end wall (the page's own paper) gives way to page 2. Soft snap on touch | 10.24 | **round 7 built (25 Nov): waiting for Wajih's review** (the opening line, the five story lines and page 2's sixth row are drafts; transition and treatment picks open) |
| 2 | For you | The hallway lands on it. The big line "Tap everything that fits."; the beacon on the first box, then on "Next: your slip" (CTA A). Five hairline rows; a tap strokes the box, shows the answer, prints onto the slip (its head waits at the bottom and docks), ticks on Android | ~4 with page 3 | **built, waiting for Wajih's CTA pick, phone review and the wording** (Send: A, picked) |
| 3 | Work slip | Number + date, printed needs, when, name, anything else, send by (5 ways), Send (design A, Leader); "or see how we think ↓"; Detail B (a circle) grows into page 4 | (with page 2) | **built, as above** |
| 4 | Four trips | Security showpiece (~5: lock's A journey → failed pick → B3 → today); AI, websites, apps lighter (~3 each); the apps trip uses the real iPhone and Galaxy live in 3D | ~14 | stub (next; not started) |
| 5 | How we work | The sideways gear train: Wajih's seven steps, each a real gear (model or engraved plate) with its title and real image, the centre one lit; the Break stress test inside "Tested" | ~3 | stub |
| 6 | Work: the corridor | Four apps + one website, each a doorway with a meaningful entry (our own designs) | ~5 | stub |
| 7 | Team | Three placeholder cards (image + bio), clearly marked | ~1 | stub |
| 8 | The final room | Full C3 work slip, founder line, every way to reach us (switches in settings.js) | ~2 | stub |
| 9 | Spec sheet | One screen of live numbers, then the loop back to the point | ~1 | stub |

### Page structure (Take 2)
- `src/index.template.html` + `src/parts/page-01.html` + `page-02.html` + `page-03.html` + `src/parts/stubs.html` (pages 4-9) → `python -I tools/build.py` → `site/index.html`.
- Pages 2-3 (one move): `site/js/page02/page.js` (rows, the slip head stuck/docked, word reveals, --p2-gap so Detail A frames the rows,
  --p2-h so page 3's grid continues page 2's), `slip.js` (state, cleaning + caps, the slip as text), `send.js` (the five ways, link building
  with a 2000-char cap, honeypot + time trap + rate limit for the switched-on sends, booking slots; `SEND_DESIGN` = the Send on the page),
  `callout.js` (Detail B: the circle; page 4 fixed + clipped behind it). CSS: `site/css/page-02.css`, `page-03.css`, `page-03-send.css`
  (Send A, Leader: Wajih's pick; B and C retired in round 4). Contact details + switches: `site/js/settings.js`. Page 4 overlaps page 3's tail (`margin-top: -100lvh`).
- Send: `site/dev/send.html` (design A at the foot of a filled slip), on `site/dev/assets.html`.
  Build links `site/css/page-*.css` only. Entry: `site/js/main.js` (Take 1's is kept as `site/js/main.take1.js`, not bundled).
- Page 1 (round 4, 24 Nov): the story is 6.3 screens of scroll in a 7.3-screen section; the dive and corridor take the last two (p 4.3–6.3).
  `site/js/page01/dive.js`: the "?" dot (measured on the rendered glyph after fonts load and on every resize), the window, and the corridor
  in WebGL (three.js): the lens (`lensP`: 50° across the narrower side, at most 66° across), paper walls with the drafting grid (a mipmapped
  tile), hairline edges, four mounted frames that swing out on their hinges to face you square-on while their drawings draw on (by
  segment count), rest, then swing back and fade while the camera still rests (so nothing nears the screen edge), captions (DOM, flagged
  Draft), frame 4's drawn → real beat. Layers: the paper ground (`.p1-dive`, under page 2) < page 2 (scaled into the end frame by a transform)
  < the WebGL canvas (transparent), ring, dot, captions (`.p1-dive-top`). No clip on page 2 once the window is open (a changing clip made it
  repaint). `site/js/page01/corridor-drawings.js`: the four drawings as data (segments in draw order, labels), `PHONE_PAIR` (the real phones'
  measured outlines), `toSVG` (reduced motion). `site/js/apps/booking.js`: our made-up booking app (canvas + its plan). Timeline
  (q 0..1 over the dive): window open by 0.18; stops [0.26, 0.32], [0.45, 0.51], [0.64, 0.70], [0.83, 0.91]; page 2 home at 1.
  `live.js` (the finished phone follows the pointer on desktop, tilts with deviceorientation on phones; none with reduced motion).
  `phone.js`'s real look: physical materials, the studio HDRI, keys, a soft shadow, `tilt()`, and (round 4) the premium bar: flat brushed
  band between polished 45° chamfers, the bezel mask under the cover glass, cover glass with a clear coat, the back glass set inside the
  frame, the camera plateau's polished chamfer, cover glass on each lens. The verb drum (page.js): a critically damped detent and an
  18 ms click as each verb seats; `layoutGrid()` draws the construction grid on the fonts' own metrics (desktop: WE on the lit verb's baseline).
- **The real phones (round 4, licences UNVERIFIED, local only):** `site/js/phones/realphones.js` (load, normalise to mm, the studio light,
  our app on the display, `PhonePair` for the asset sheet; copes with missing files). Web copies by `node tools/phones_web.mjs` (logo
  removed: the iPhone's flattened into its back panel, the S26's wordmark node "Geometry" removed; display picture dropped; textures ≤1024 px
  WebP; meshopt) into **`site/media/phones-unverified/` (git-ignored)**; the frame-4 still by `python -I tools/phone_stills.py`
  (`site/dev/phone-stills.html`, orthographic, measured outlines printed). Sources in `tools/sources/phones/` (git-ignored).
  **Blocker before any hosting: clear both licences or replace both models.**
- Page 1 (round 3): `site/js/page01/page.js` (the scroll story; texts, the timed ground
  and dress beats, the flies you→YOU and us→WE, the verb drum, the detail callout into page 2, reduced motion), `site/js/page01/phone.js`
  (six-part phone: X-ray hairlines / built / real; tagged X-ray loops for the morph targets; the ethos screen), `site/js/page01/morph.js`
  (Bell's eight outlines: DrawSVG on the scan, MorphSVG into the phone's outlines), `site/js/page01/materials.js` (the three CC0 material
  options; `PICK` = the one on the page), `site/css/page-01.css` (also the strip, beacon gate, stubs, page 2's callout state).
  Data: `site/media/plates/bell-us186787-paths.json` (`tools/bell_paths.py`), `site/media/materials/*` (`tools/materials.py`).
  Page 2 overlaps page 1's last screen (`margin-top: -100lvh`); during that screen its stage is fixed and clipped to the callout window.
- **Round 6: the grid is the layout system.** The head script (`src/index.template.html`) sets `--u` before first paint:
  the page's width (a desktop scrollbar taken off) holds a whole number of cells, 20 on phones (19.2 px on the S23), on
  wider screens a multiple of 5 keeping a cell about 22 px (`5 * round(W / 110)`); `1rem = 1 cell`, so every size in the
  Take 2 stylesheets is in grid units. `wm:grid` fires only when the unit changes (not for a phone's address bar).
  `site/css/page-00-grid.css` (loaded first): the two grounds' tokens (paper `#F6F7F9`, ink `#121212`, graphite
  `#66696E`; dark `#0E0E0E` / `#EDEEF0` / `#8C8F94`; the blue `#173F73`), the grid image (`--grid-img`, a darker line
  every 5 cells), the strip (2 cells; nine segments on whole columns, main.js), the title block (cells 2 cells tall: key
  on the half line, value on the line and a half; its top on a line above the screen's bottom), the gate (the beacon on
  the intersection nearest the centre), and `.gt`: the text box trimmed to cap and baseline (`text-box`) and padded to a
  whole step (`--q` 1 or .5 cell), so a box whose top is on a line has every baseline on one. `site/js/engine/grid.js`:
  the unit, snapping, `baselineOf` (a zero-size probe), `snapHeights` (`.g-snap` blocks padded to whole cells; a
  border-box observer, applied next frame), `seatText` (texts split into words and switched on/off are not trimmed:
  Chrome re-lays a trimmed text of inline-block words a sixth of a cell low; their first baseline is seated by
  measurement). `site/js/engine/tokens.js`: the light paper's colours for canvases (phone A's screen, the booking app).
  Page 1: the band, Bell's sheet (whole cells; the scan contained in it), phone A (fills its band exactly, `fit.snap`),
  the X-ray names (baseline on a half line, shelf on the line below, whole cells long), the travelling words (rest on
  measured baselines), the drum (seated so the lit verb's baseline is a line; desktop WE column whole cells). The
  hallway (`dive.js`): the card's grid is the screen's, continued from the mouth in world units of the cell; frames are
  whole cells (`F.cells` shape, the mat takes the difference), at rest their front face lands on screen lines and on the
  wall they hang on the card's lines (top edge on a row, hinge on a column; a search over screen row / wall row keeps the
  wall gap under half a cell); museum labels (DOM) under each frame on its left edge. Pages 2-3: rows 4 cells, tick boxes
  2 x 2 (the beacon on their centre = an intersection), page 2 whole cells tall so page 3 continues its grid, the slip's
  cells whole cells, hairlines drawn inside boxes (inset shadows). The check: `tools/gridcheck.py` (below).
- **Round 5 switches** (round 6: only `CTA_DESIGN` is left; looks B/C and grounds B/C are removed; one constant each; `?hall=`, `?cta=`, `?ground=` preview another on the real page, nothing stored):
  `site/js/page01/hall-looks.js` `HALL = 'A'` (A architect's model, B gallery, C engineering lab: surfaces, frame, mat,
  glass, lights per look, light/dark pairs); `site/js/page02/cta.js` `CTA_DESIGN = 'A'` (A beacon on the rows, B beacon
  as a gate, C no beacon); `site/js/page01/grounds.js` `GROUND = 'A'` (A clean paper, B museum white, C fresh real paper;
  CSS in page-01.css `.p1[data-ground]`). The studio light has its own module (`site/js/phones/studio.js`); the real
  phones' loaders (`realphones.js`) load only when the dive begins. Demo page: `site/dev/cta.html?cta=X` (reads page 2's
  markup from the built page). Materials: `tools/materials_r5.py` -> `site/media/materials/{Paper001,Plaster002,
  Concrete034,ph-laminate_floor_03}/`. Tests: `tools/r5shots.py` (the nine candidates from the asset sheet, light/dark),
  `tools/weight.py` (every request through the dive, with sizes), `tools/phone_r5.py` (real phone: fps per segment, the
  dive, frame 4's turn, the beacon, shots); `tools/t2shot.py --query`.
- Asset sheet: `site/dev/assets.html` + `assets.js` (round 5: a Print light/dark switch; the three hallway looks live at
  phone size on one Dive control; the three CTA demos; the three grounds; then, as round 4): phone A (raised), live; the two real phones live side by side ("file missing"
  without them); one Turn control for both; the corridor at phone size (the real dive, one Dive control); Send A. B1–B3, the three historical
  corridor sets and Sends B and C are gone (`phoneb.js`, `dive-sets.js` deleted; the sheet images stay in `site/media/corridor/`).
- Enter: `site/js/enter.js` (beacon gate; tap/click/Enter/Space/wheel/swipe all enter; only a pointer tap/click unlocks
  vibration; reduced motion: the same gate, still, enters at once).
  Vibration: `site/js/engine/haptics.js`.
- Kept on disk for reuse, not loaded: Take 1 sheets (`site/js/sheets`, `sheet01..08`, `src/parts/sheet-*.html`,
  `site/css/sheet-*.css`), `opening.js` (its loop replay), `products/`, `settings.js`, the lab.
- Tests: `tools/p1stops.py` (every named stop + mid-morph, mid-drum, mid-callout), `tools/t2shot.py` (any positions, reduced motion),
  `tools/geom.py` (geometry check, 6 sizes × light/dark × every stop), `tools/axe2.py` (axe + page-1 length), `tools/fps_seg.py` (emulated fps
  per story segment), `tools/phonep1.py` (real phone; its stop list still needs the round-3 stops), `tools/vibcheck.py` (vibration rules),
  `tools/assetshot.py` (asset sheet, also the corridor card at Dive values). Positions are scroll progress in screens (`__p1.yAt(p)`, 0..7.4 since round 6; the stops below are round 4's, see the round 6 log for the hallway's);
  the named stops are `__p1.stops` (S0 .1, draw .24, morph .6, S1 1.3, kin 1.72, paper 2.2, REAL 2.45, S2 2.5, YOU 2.72, TASK 2.92, WE 3.12,
  DRUM 3.6, END 4.2, DOT 4.4, F1 4.88, F2 5.26, F3 5.64, F4 6.06, LAND 6.22). Round 4: `tools/stretch.py` (each frame's on-screen ratio vs its
  drawing's true ratio, keystone, closest approach to the screen edge, the lens, at 9 sizes); `tools/geom.py` now also checks the facing
  frames and their captions and runs all 9 sizes. New (23 Nov, fixes): `tools/dotcheck.py` (the dive starts on the glyph's real dot), `tools/tbcheck.py` (title block at real sizes),
  `tools/phoneshot.py` (asset-sheet phones at several turns), `tools/phoneseg.py` (real phone: fps per page-1 segment, gyroscope events),
  `tools/slowwhere.py` (where slow frames happen), `tools/corridor_webp.py` (the corridor sheets). `tools/phonep23.py` now also checks the
  gyroscope, the dive and the finished phone's fps, and shoots the asset sheet on the phone.

### Round 7 structure notes (25 Nov)
- **Page 1 is 9.24 screens of scroll** (`SCROLL = 4.94 + DIVE`, `DIVE = 4.3`): the story to 4.94, the hallway 4.94-9.24. Stops
  (`__p1.stops`): S0 .1, draw .24, morph .6, S1 1.3, kin 1.72, paper 2.2, REAL 2.45, S2 2.5, YOU 2.72, TASK 2.92, WE 3.12, DRUM 3.9,
  END 4.8, TR 5.05, OPEN 5.49, F1 6.26, F2 6.83, F3 7.4, F4 7.97, F5 8.62, LAND 9.16.
- **`site/js/page01/dive.js` (rewritten):** `TRANSITION = 'A'` (A the grid folds into the hallway, B a clean cut along one grid line,
  C into one square; `?tr=`), `TREATMENT = 'A'` (A printed on the wall: the camera turns to face it squarely at rest; B a bare sheet
  that swings; C a pinned sheet with a hairline shadow; `?hall=`). The way in is timed (1.1 s, `TR_MS`) once its scroll point is
  crossed. Walls, floor and ceiling are card planes with the grid continued from the mouth; the end wall is the page's paper + grid
  (in device px), opaque until frame 5 has gone, then page 2 shows. Drawings take at most 60% of the screen's height (capped by
  width; phones: label under, desktop: 16 cells beside on the inner side); visible only while faced; `linewidth = round(dpr)`.
  Frame 5's turn plays by itself (3.6 s, `TURN_MS`) once the frame settles. Labels: DOM, `.on` at rest, on a frosted backing
  (`page-01-dive.css`: blur 10 px, paper veil, no border, edges fade over a cell). The opening line is `OPENING` in corridor-drawings.js.
- **`corridor-drawings.js`:** five drawings in backwards order (`FRAMES`): customers' path, `design()` (who they are → what they must
  feel → requirements → palette and type; method only), the decision flow, speed, the two phones. Each head reads `FIG. 0n / 05`;
  dimension lines carry live measurements (faint grey mono).
- **Soft snap:** touch: CSS `scroll-snap-type: y mandatory` with `scroll-snap-stop: always` on invisible markers (`.p1-snaps`, built
  from `SCENES()`), pages 2-3 snap to their tops; desktop: after 160 ms of wheel quiet, Lenis eases to the nearest scene within
  0.45 screens. `?nosnap` turns it off for tests (every tool uses it except the snap test). Lenis's scroll is rounded to device px.
- **Grid unit (round 7):** the head script prefers a cell count where the window's device width divides evenly (cell 20-24 CSS px,
  a multiple of 5 preferred), else `5 * round(W / 110)`; phones 20 cells. `--px1` = one device pixel's worth of hairline
  (`round(dpr) / dpr`). At Wajih's laptop: 90 cells of 32 device px.
- **Page 2:** sixth row "A look that fits my business" (`data-id="look"`, draft), carried onto the slip. Tick and circle strokes use
  plain dash lengths (no `pathLength`, which left half a tick on the S23). The slip's questions snap to whole cells (`g-snap`).
- **Asset sheet:** a contents list with jump links; the three transitions (Play) and three treatments (Walk) live at phone size; CTA
  demos A/B/C on the sheet itself.
- **New tools:** `tools/overlap.py` (text against text and drawings at every stop, with clipping and occlusion; the drawings' share
  of the screen at rest), `tools/flicker.py` (real Chrome at dpr 1.333, frame-by-frame captures; the "before" is an
  older commit's built site staged by hand at `site/r6old/`, served at `/r6old/`, deleted again before committing), `tools/phone_r7.py` (S23: fps per segment, frame 5's turn, frosted labels, page 2's empty boxes, reduced motion),
  `tools/phone_snap.py` (S23: real swipes, where the page rests), `tools/evalp.py` (one-off probes), `tools/r7phones.sh` (its phone half), `t2shot.py --pre` (park first: warms the hallway), `tools/r7final.sh` (the whole
  emulated pass). `gridcheck.py`, `stretch.py`, `geom.py` run all 14 sizes.

### Take 2 log
- **Round 7 (25 Nov).** Brief committed (round 7, `f6220e0`). Built to Part 5 "Round 7" (rounds 4-6 where not changed).
  - **Built:** the opening line; the "?" dot entry removed and three ways in (A on the page); five frames in backwards order with the
    new design drawing; frames, mouldings, mats and glass removed, three treatments (A on the page); drawings ~60% of the height on
    laptops; frosted labels; page 2 hidden behind the end wall until frame 5 has gone; frame 5's timed turn; Bell's sheet paperless
    (his ink lines on our grid lines, still morphs); page 2's sixth row; soft snap; drum: two more cells of room, a double-pulse
    click (20-50-20 ms); live measurements; no "keep scrolling" cue existed (none added).
  - **Fixed:** half tick in empty boxes on the S23 (pathLength + dash); "us" overlapping at YOU → WE (the baseline probe sat on the
    previous line at a wrap); strip/title block showing 02 on page 1 after scrolling back (the page tracker now uses layout tops);
    the strip is opaque; the drum's faint verbs a cell clear of the meaning; X-ray names a quarter cell clear of every piece.
  - **Flicker (real Chrome, Wajih's 200% + 67%, dpr 1.333, 2160 x 1063):** the hallway walk, 36 frame pairs: round 6 335,894
    pixels changing by more than 24 grey levels between still frames, current 18,379 (-94.5%; more than 48 levels: 300,478 →
    5,502, -98%). Sources: the frames' mouldings and glass (gone), page 2's scaled preview text (now hidden until the end),
    fractional scroll (rounded to device px), hairlines thinner than a device pixel (`--px1`), cells that were not whole device
    px, canvas sizes. Page 1's drum and page 2: 0 both before and after. Files: `tools/shots/r7/flicker/`.
  - **S23 (384 x 719 @2.8125, Chrome 158):** every page-1 segment 58.3-60 fps on both passes (p95 16.8 ms everywhere; the way in
    58.3 first time, 60 second); frame 5's timed turn 60 fps; frosted labels 60 fps; page 2 60. The real phones now load in the
    first 300 ms pause from the WE scene on (at the way in they stalled it: 45 fps, one 700 ms frame; loaded on WE's first frame
    they stalled that: 54.7 fps, one 216 ms frame), and at once when the hallway starts. Snap with real swipes: eight short flicks each moved
    exactly one scene, nothing skipped, every rest within 0.2 px of its scene; a long slow drag moves two; flicks back one each.
    "Remove animations" is **off** (animator, transition and window scales 1.0; Chrome's reduced-motion false). Page 2's empty
    boxes: dash fully off (400 / 400). On-grid on the phone: 0 off.
  - **`?nosnap` was broken** until the end of this round: an edit script wrote `\b` as a backspace character into the head
    script's regex, so every emulated phone-size check ran with the touch snap on (programmatic scrolls pulled to the nearest
    scene). Fixed (the template had the only stray control character in the project); all phone sizes re-run (`tools/r7phones.sh`);
    desktop results were unaffected (the wheel snap needs real wheel input).
  - **Emulated, 14 sizes:** on-grid 0 off the grid (> 0.5 px) at all 14 light and 4 + 2 dark (worst 0.182 px; 9,695 edges,
    10,471 baselines, 4,984 text edges, 812 picture edges); fixed on the way: the slip's questions (two lines at 1280 x 720 left
    the ticks half a cell low: `.slip__q`'s own `padding: 0` beat `.g-snap`'s padding). Stretch 0.000% at rest (keystone 0), closest to an edge while visible 17.1 px (360 x 800,
    frame 1). Overlaps: 1 left of 118,822 pairs: 360 x 800, the X-ray name "Screen" touches the screen piece's bounding box
    (its outline is about 11 px clear; left edge, screen and glass leave it nowhere else to go); fixed on the way: the drum's
    faint verbs over the meaning at 1280 x 720 (the meaning a cell lower), page 2's stuck slip bar now counted as chrome (opaque
    paper; rows scroll under it by design). Geometry (`geom.py`): 0 problems. Drawings' height share at rest: 0.48-0.61 on laptops (1280 x 720 lowest: frame 1, 0.48),
    0.27-0.51 on phones (capped by width). axe 0 (page 1 every stop, pages 2-3; light, dark, reduced). Console: 0 errors.
    Length: page 1 10.24 screens to page 2 (9.4 reduced); the whole page 39.76.
  - Shots: `tools/shots/r7/` (`shots-phone`, `shots-laptop`, `shots-transition`, `shots-treatments`, `shots-reduced`, `phone/`, `flicker/`).
- **Round 6 (24 Nov).** Brief committed (round 6). Built to Part 5 "Round 6" (rounds 4-5 where not changed).
  - **Two grounds only:** white drafting paper, now `#F6F7F9` (neutral, a hint of cool; it was the warm `#F2F0EB`), and the
    blue blueprint; dark: near-black and the blue. Every warm tone went: the tokens, the dark ink and graphite, phone A's
    matte model and metals and its fill light, the hallway's card (the Paper001 scan printed in grey), mat, frame and
    light, phone A's screen, the booking app, the frame-4 still (re-rendered), the gate's text. On the S23 the paper reads
    (246, 247, 249).
  - **Removed:** hallway looks B and C (code, picture lights, ceiling strips, asset-sheet cards) and grounds B and C
    (`grounds.js`, CSS, the asset-sheet section); materials Plaster002, Laminate Floor 03, Concrete034 (deleted, CREDITS
    updated); `tools/r5shots.py` (its candidates no longer exist).
  - **The grid as the layout system:** see the page-structure note. Desktop type has two steps (from 1024 px; from 1800 x
    1000 px), all sizes in quarter cells and line heights in half or whole cells.
  - **Museum labels** under the four frames: hairline above (no box), the title (serif, 1.5 cells on phones = 28.8 px),
    the drawing's mono name, one line of story (1 cell = 19.2 px on the S23; the four story lines flagged Draft). Desktop
    labels are at least 16 cells wide. **Longer rests:** the dive is 3.1 screens (was 2); frames 1-3 rest 0.3 screen
    each, frame 4 0.4. Page 1 is 8.4 screens (was 7.3). Test stops: F1 5.16, F2 5.76, F3 6.36, F4B 6.94, F4 7.12, LAND 7.32.
  - **Tests.** On-grid (`tools/gridcheck.py`, 9 sizes x 26 stops, light): 6,445 edges, 7,502 baselines, 3,730 text edges and
    477 picture edges (phone A's box, the frames at rest, the X-ray shelves, the beacon) measured; 0 off by more than half
    a pixel, worst 0.146 px; dark at 3 sizes: 0 off, worst 0.12 px. Exceptions, each listed with its reason by the tool
    (the type's construction lines, the drum's turned-away verbs, Bell's scan inside its sheet and his traced outlines,
    the dot's circle, Detail B, the cursor, the gate's rings, the strip's progress bar, typed text, phone A's fourth side).
    Real S23 (SM-S918N, Chrome, 384 x 719, `tools/phone_r6.py`): 0 errors; 60 fps in every page-1 segment, the hallway
    and its labels (both passes), frame 4's turn and page 2; the dot's opening 57 / 58 fps (four 33 ms frames while the
    real phones load, one ~100 ms warm-up draw by design); paper on the phone (246, 247, 249); every landmark on the grid.
    Geometry (`tools/geom.py`, 9 sizes x light/dark): 0 problems. Stretch: 0.000% and keystone 0% at 9 sizes; closest to
    an edge 19.2 px (phones), 84+ px (desktops). axe 0 (page 1 every stop at 384 light/dark, 1440, 2160 dark; reduced at
    384, 1440; pages 2-3 in all six). Length: page 1 8.4 screens; whole page 37.8 (384 x 734), 37.1 (1440 x 900), 36.8
    (2160 x 1147); reduced motion 17.3. New tools:
    `tools/gridcheck.py` (the on-grid check), `tools/phone_r6.py` (the S23 run), `tools/evalp.py` (dev probe),
    `tools/r6final.sh` (the emulated pass). Screenshots: `tools/shots/r6/` (phone/, grid/, geom/, dev/).
  - **Pending Wajih:** his phone review of round 6; the four story lines (drafts); page 2's CTA pick; the "?" dot entry;
    the page 2-3 wording; the two phone licences.
- **Round 5 (24 Nov).** Brief committed (round 5). Built to Part 5 "Round 5" ("Round 4 picks" where not changed). WE and the verb drum untouched.
  - **Frame 4:** the iPhone 18 and the S26 live in 3D (git-ignored files), loaded as the dive begins (code, meshes decoded in a worker,
    textures one per frame, shaders compiled in parallel), lit by the studio alone (a second pass, as phone A). After the drawn → real
    beat they turn with the scroll (a critically damped spring): front → backs → front-on on the booking screen; the S26 a beat behind.
    Still image: while they load, with reduced motion, when the files are missing (with the still missing too: the blueprint). Frame 4
    rests longer: stops now [.25,.305] [.42,.475] [.59,.645] [.77,.92] (page 1 still 7.3 screens). Test stops: F1 4.86, F2 5.2, F3 5.54,
    F4B 6.0 (backs), F4 6.12, LAND 6.22.
  - **The hallway, lit:** three looks (`hall-looks.js`, `HALL = 'A'`): A architect's model (white card, open top, key light with soft
    shadows, the grid printed on the card, ink edges, thin black metal frames), B gallery (plaster, pale oak, picture lights), C lab
    (concrete, steel, ceiling strip grid). Every frame: a rounded moulding with depth, a hinge, a mat with a 45° bevelled window, the
    blueprint set back (exact #173F73, unlit), the mat's soft shadow on it, glass (reflections only, strength by viewing angle). Light
    and dark for each. All round 4 rules kept (true proportions, lens, frames leave before the edge).
  - **Page 2's call to action** (`cta.js`, `CTA_DESIGN = 'A'`): the big line (31 px / 2.75rem); A beacon on the first box → "Next: your
    slip" (DRAFT) → glides to the slip; B the beacon as a gate (scrolling on also opens it); C the five boxes pulse once in turn. Reduced
    motion: a still ring. Demo: `site/dev/cta.html?cta=X`.
  - **Page 1's ground** (`grounds.js`, `GROUND = 'A'`): the aged Miller tile is off the page; A clean paper + grid, B museum white,
    C ambientCG Paper001. Bell's plate is a sheet on the page (its own paper, a soft shadow; dark: a negative with a hairline edge).
    Tidy: balanced headline breaks (no lone "need?"), the title block on the 16 px phone gutter and on the desktop grid (2.5rem).
  - **Labels:** YES / NO / NEXT in frame 2: 10 → 11.5 (the box words' size).
  - **Cache-busting (found on the S23):** the phone ran new markup with round 4's cached page-02.css (no cache headers on the local
    server). `tools/build.py` now stamps every stylesheet and entry script with `?v=<content hash>`; the asset sheet and the CTA demo are
    bundled (`dist/assets.js`, `dist/cta-demo.js`, hashed chunks), so a phone never runs stale code.
  - **Tests. Real phone (SM-S918N, Chrome 157, 384x719, `tools/phone_r5.py`):** 0 errors. fps while scrolling, first pass / second pass:
    page 1 segments 59.3–60 / 60; the dive's start (p 4.0–4.75, the phones loading) 57 / 57.7; the hallway 60 / 60; frame 4 + landing
    60 / 60; frame 4's turn (slow scroll) 60, p95 16.7 ms, 0 frames over 20 ms; page 2 with the beacon 60 (still and scrolling). Where the
    slow frames are (`tools/phoneprobe.py`): first walk only, a few 33–50 ms frames while the phones load (p 4.35–4.6) and one ~100 ms
    frame on purpose while the camera rests at frame 1 (the phones' first real draw, moved there from frame 4's reveal); re-entering
    the dive: none. A real tap on box 1 moved the beacon to "Next: your slip". Emulated: geometry 0 problems in 360 checks (9 sizes x
    light/dark x 20 stops, run twice); stretch 0.000% and keystone 0% for every frame at all 9 sizes; lens 50° across the narrower side on
    phones, 38–45° down and 66° across on desktops; closest to a screen edge 16 px (phones, the moulding's front face), 80–167 px
    (desktops); axe 0 (page 1 every stop at 384 light/dark, 1440, 2160 dark, reduced at 384 and 1440; pages 2–3 at 384, 1440 dark, 2160,
    384 reduced); no console errors (files hidden: only the 3 expected 404s); length page 1 7.3 at every size, whole page 36.5 (384x734) /
    35.8 (1440x900) / 35.9 (2160x1147), reduced motion 16.0 / 15.5. **Weight (`tools/weight.py`):** at page load JS +25.0 KB (828,095 →
    853,113 bytes), textures +131 KB (Paper001 colour 47.5 KB + relief 90.0 KB, minus the 6.4 KB Miller tile); the studio HDRI is shared
    (cached: 0 bytes the second time); once the dive begins: the phones 2.28 MB (local only) + their loader code 77.7 KB.
    Screenshots: `tools/shots/r5/` (hall-*, cta-*, ground-* light and dark; phone/, geom/, desk/, final/, missing/, rm_*).
  - **Pending Wajih:** his picks (hallway look, CTA design, ground) and phone review; the "?" dot entry; the drafts (four hallway lines,
    pages 2–3, "Next: your slip"); the two phone licences.
  - Decisions I made alone: see the round 5 report (phone timing, glass by angle, warm-up draw, open-top model, cache-busting, the
    front-face margin, the plate as a sheet in every ground).
- **Round 4 (24 Nov).** Brief committed (round 4 notes and picks). Built to Part 5 "Round 4 picks" (+ "Round 4 notes" where not overridden).
  - **Send:** A on the page; B and C off the asset sheet, their CSS and the "pending pick" note gone.
  - **Verb drum, "both":** a critically damped detent (no overshoot, settles in 0.42 s) and an 18 ms click as each verb seats (Android, after
    the unlock tap; none after a key or with reduced motion: `tools/vibcheck.py` tap = 1 + 6 snaps of 14 ms + 6 clicks of 18 ms, key = none,
    reduced = none). The grid: hairlines on the cap line, x-height and baseline of WE and of the lit verb, the ink edges, the verb window with
    its index marks, equal overshoot on every side, two cap-height dimensions, mono line names; on desktop WE moved onto the lit verb's baseline.
  - **Phone A, premium bar** (real look only; X-ray and assembly unchanged): see the page-structure note.
  - **The real phones:** iPhone 18 Pro Max 3.82 → 1.19 MB, S26 Ultra 5.77 → 1.09 MB. Logos: the iPhone's back panel has the logo cut out of it,
    so removing the logo left an apple-shaped hole; the logo is flattened into the panel instead (its vertex colours dropped, the panel's
    normals straightened): at most a 3-pixel sliver at the leaf's tip in a contrast-stretched zoom. The S26's wordmark found by rendering
    each candidate in red: node "Geometry". Measured: iPhone 78.9 × 163.3 mm, corners 13.7 mm; S26 78.1 × 163.0 mm, corners 7.9 mm.
  - **The corridor:** four frames, left, right, left, right (our own schematics as cyanotype blueprints: a page-load timeline, a which-driver flowchart, a customer's path with the fix drawn in, our booking app's screen on the two phones' true outlines), each swinging out on its hinge to face you square-on while it draws on, one draft line under it; frame 4 turns into the real phones (a still) in one 0.52 s beat. About 2 screens (p 4.3-6.3); page 1 is 7.3 screens. The historical sheet sets are off the page (files kept). The '?' dot entry is unchanged (still open).
  - **Tests.** Real phone: NOT RUN, the S23 was not on wireless debugging at any point this session (adb devices and adb mdns services empty, checked four times). Emulated (headless Chrome, real GPU): geometry 0 problems in 342 checks (9 sizes x light/dark x 19 stops, including the four facing frames and their captions); stretch (tools/stretch.py): every frame's on-screen ratio = its drawing's true ratio to 0.000%, keystone 0%, at all 9 sizes; lens 50 deg across the narrower side on phones (50 across, 83-91 down), 38-45 deg down and 66 deg across on desktops; closest any frame comes to a screen edge while visible: 16 px on phones, 90-182 px on desktops (frames swing back and fade while the camera still rests); axe 0 at every stop (384x734 light/dark, 1440x900, 2160x1147 dark, reduced motion at both); no console errors (with the git-ignored files hidden: only the expected 404s; frame 4 stays a blueprint, the asset sheet says file missing); dot check worst 0.93 px; length: page 1 7.3 viewports at every size, whole page 36.5 (384x734) / 35.8 (1440x900, 2160x1147); reduced motion 16.0 / 15.5. fps (tools/fps_seg.py): corridor 58.8 fps at 384x734 and 2160x1147, 59 at 2560x1440 (p95 16.7-16.8 ms), every other segment 58.8-60; first pass only: one or two ~100 ms frames when page 2's scaled layer is first rastered (seen last round; repeat passes clean). Page weight: JS bundle +19.7 KB (808,365 -> 828,095 bytes); page 1 no longer loads the five historical sheets (-1.57 MB) and loads the frame-4 still (+38 KB, local only); the two models (2.28 MB) load only on the asset sheet. Screenshots: tools/shots/r4/geom/
  - **Round 4 on Wajih's S23 (his own test, 24 Nov, Part 5 "Round 5"):** passed. 60 fps through page 1 and the dive, all drum
    clicks accepted (felt), 0 console errors. Wajih: "really good"; the hallway idea "amazing"; WE and the verb drum with its grid
    "great work": keep them exactly as they are.
  - **Pending Wajih (then):** the "?" dot entry (keep or not); the four captions and page 2–3 wording (drafts); the real phones'
    licences (before any hosting).
  - Decisions I made alone: the frames swing out on a hinge at their near edge to face you square-on (true proportions by construction) and swing back while the camera rests; the lens caps at 66 deg across; the corridor's WebGL is drawn above page 2 (exact depth, no clip: a changing clip made page 2 repaint at about 33 ms a frame); captions break the lines under them (a tight paper ground, as drawings do); frame 4's still is orthographic and the blueprint uses the phones' measured outlines, so drawn and real match line for line; the iPhone logo is flattened into the back panel (removing it left a hole); the app on the phones is a table-booking concept in the site's own drawing language; the S26 is scaled to 163 mm (its file has no units); WE moves onto the lit verb's baseline on desktop
- **Fixes after pages 2–3 (23 Nov).** Brief committed (fixes after pages 2–3, glossy live phone). Built to Part 5 "Fixes after pages 2–3".
  - **Dot dive** replaces Detail A: the "?" dot (measured on the glyph; the dive's dot lands within 0.9 CSS px of the glyph's own ink at every
    size, `tools/dotcheck.py`) opens into a window onto a corridor of five real drawing sheets on its walls, hairline rails to page 2's frame;
    page 2 lands 1:1. About 1 viewport (p 4.3–5.3). Page 1 is now 6.3 screens (whole page about 36.3).
  - **Cursor:** a small hairline cross (15 px), no full-screen lines, no readout; steps aside for text fields.
  - **Title block:** it was drawn with only its left and top edges (made to sit in Take 1's sheet frame, which Take 2 doesn't have), so at Wajih's
    window its open right side read as cut off; now a closed hairline box, 4 × 2 cells on desktop. **Desktop rem** is now min(width / 90,
    height / 50), so wide, short windows (his: 1.88:1) keep the proportions the pages were laid out in.
  - **Glossy live phone, version A:** see the page-structure note. Live: scroll turns it 0.34 rad more between "real" and the end of "…to serve
    you."; pointer (desktop) and tilt (Android) add up to ±0.2 rad yaw, ±0.13 rad pitch.
  - **Version B:** five licence-clean candidates found (all Sketchfab, CC BY 4.0, commercial use allowed, human-made, no brand shape), all need
    a login; the top three are on the asset sheet as slots (B1 ToMar_, B2 devOMAR, B3 Xyber) with Wajih's download instructions.
  - **Corridor sets:** three sets of five found and converted (C: one HAER sugar-mill survey, recommended and on the page; A: five HAER machines;
    B: five 1847–1888 patents). LoC masters are 1-bit 400 dpi TIFFs.
  - **Tests.** Real phone (SM-S918N, Chrome, 384x719, `tools/phonep23.py`, `tools/phoneseg.py`): geometry 0 problems at every page-1 stop and every
    pages 2-3 stop; fps while scrolling: page 1 58 (first pass; 7 frames over 20 ms, one-time first appearances), pages 2-3 60, the dot dive 59.8,
    the finished phone turning 60; page 1 per segment 58.3-60 first pass, 59.3-60 second; 2 real row taps = 2 vibrations; gyroscope: 432 real
    deviceorientation events reached the page (phone lying still: Chrome only sends on change), a 10-degree roll turned the phone 0.145 rad,
    eased and clamped. (These real-phone numbers are from before the corridor moved to WebGL and page 2 stopped switching to fixed; the phone was
    then in use by Wajih, so it wasn't driven again.) Emulated: geometry 0 problems, page 1 at 9 sizes x light/dark x 16 stops and pages 2-3 at
    9 sizes x light/dark x 11 stops; axe 0 (page 1 every stop, pages 2-3, light/dark, reduced motion); no console errors (one refused local
    request seen once, now retried); length: page 1 6.3 viewports at every size, whole page 34.8-35.5 (reduced motion 4.1-4.9 / 11.9-13.4).
    Screenshots: `tools/shots/fix/` (geom, p23, dot), `tools/shots/dive/`, `tools/shots/phoneA/`, `tools/shots/phone-fix/` (real phone).
  - **Watch:** the first pass through the dive drops about 3 frames (~100 ms each, emulated) when page 2's live stage is first scaled and
    circle-clipped at the corridor's end (with page 2 hidden they vanish; second passes are clean). Polish pass: clip page 2 another way.
  - **Pending Wajih:** phone A or B (and B's downloads), corridor set, Send design (from last round), and his phone review of all of it.
  - Decisions I made alone: the corridor is WebGL (textures, no re-raster; CSS 3D re-rastered the scans at every change of scale); its walls carry the sheets (left, right, alternating), floor and ceiling only the faint grid; page 2 is
    the corridor's end frame (its own stage, scaled by the same perspective), so it is "already there" and lands without a cut; the ink dot opens
    in one timed beat (never a grey disc on a paused frame); page 2 is held at the top by a transform during the dive (no switch to position: fixed, no re-layout); during the dive page 2's words
    stand settled (no rise inside a scaled layer); the cover glass is a reflections-only layer added over the screen (so the screen's paper stays
    exact); the hairlines fade fully in the real look (product shot); ACES filmic tone mapping kept (as before) with the HDRI as shot; the
    gyroscope's level follows how the visitor holds the phone (~4 s), so only movement tilts; iPhone gets no tilt (it would need a permission
    prompt); the 8109 server running this session was Wajih's own (started from his PowerShell before the session), so it was left running.
- **Pages 2 and 3 (23 Nov).** Brief committed (pages 2 and 3, edges list). Phone material switched to B (Wajih's pick); CREDITS updated.
  Built to Part 5 "Pages 2 and 3". Length pages 2-3 (page 2 arrived → page 4 arrived): 3.19 viewports at 384×734 with nothing ticked,
  3.78 with every row ticked and the slip filled; 2.51 / 2.67 at 1440×900; real phone (384×719) 3.93 filled. Real phone (SM-S918N, Chrome,
  `tools/phonep23.py`): 59 fps page 1, 60 fps pages 2-3 and Detail A (p95 16.8 ms); 0 geometry problems on pages 1-3; two real row taps =
  two 12 ms vibrations; a real tap on Send opened WhatsApp (com.whatsapp.w4b, the business app on his phone) with the whole slip in the link;
  backed out, nothing sent. Emulated: pages 1-3 geometry clean at 6 sizes × light/dark (`tools/p23.py --geom`, `tools/geom.py`); axe 0
  (`tools/axe23.py`, `tools/axe2.py`); no console errors; reduced motion clean; guards (`tools/guards23.py`): caps, bidi/control stripping,
  Arabic kept, link ≤ 2000 chars, honeypot, rate limit, booking needs a slot. Screenshots: `tools/shots/p23/`, `p23-rm/`, `phone-p23/`, `send/`.
  - Fixed a test bug: `tools/geom.py` measured page 1's band against the visible height; the band is in stage (100lvh) coordinates, which on
    a real phone is taller. Page 1 itself was right.
  - Page 1 touched only where page 2 plugs in: Detail A frames page 2's `[data-callout]` block; the window may come within 6 px of a phone's
    edge; page 2 counts as home within 1.5 px of the end (phones scroll in whole pixels).
  - **Pending Wajih:** phone review; his Send pick (A Leader on the page, B Cell, C Bubble on the asset sheet); the wording (all flagged).
  - Watch: emulated desktop shows one 130-200 ms frame the first time Detail A starts (p 4.02), not on later passes, not on the real phone.
  - Decisions I made alone: the slip's head is page 2's last line, sticky at the bottom (it rises with the first tap and slims to one line:
    the printed needs + the count), docking as the slip's top; the mark is one hairline stroke corner to corner; the slip number is the moment
    it was made (yymmdd-hhmm, live), never a count; the needs print in the order ticked; desktop answers sit on their row's right with a
    hairline leader; "Send" becomes "Call" for a phone call and "Book" when booking is on; switched-off ways still show and hand over to email
    as the brief says; Detail B aims at page 4's content and its label tries six leader angles until it fits; page 2's question block is pushed
    down just enough that Detail A frames it whole.
- **Page 1, round 3 (23 Nov).** Brief committed (design ethos, round 3, motion devices, asset quality). GSAP SplitText, MorphSVG, DrawSVG
  vendored (3.15.0, same as the core). Page 1 is 6.0 viewports at 384×734 and 1440×900 (until page 2 has fully arrived; whole page 36.0;
  reduced motion 4.9 / 4.1). Emulated (headless Chrome, real GPU): 60 fps in all 8 story segments at both sizes (p95 16.7–16.8 ms) after
  moving four one-time first-paint costs to load (dashed-stroke pipeline, MorphSVG precompute, texture upload, page 2's first paint).
  Geometry: 0 problems (6 sizes × light/dark × 13 stops). axe: 0. No console errors. Vibration: tap + 6 snaps (14 ms) + 6 drum clicks (10 ms);
  none after a key or with reduced motion. **Real-phone run pending:** the S23 wasn't on adb (the two wireless-debugging devices on the LAN
  were TVs; disconnected without running anything). Screenshots: `tools/shots/r3/` (stops, geom, reduced-motion).
  - Removed: the stamps, the For-you button, YOU's blue, boxed labels, the glow, the potrace cloud (`bell-us186787-lines.bin`, stamp grain).
  - **Pending Wajih:** his phone review; his pick on the asset sheet (page 1 uses A, satin aluminium + frosted white).
  - Decisions I made alone: "us" in "YOU gave us the task." travels and becomes WE (the mirror of you→YOU); the drum sits under WE on phones
    and beside it on desktop, so it reads "WE Understood"; the verb list uses "Drew" (the round-3 meanings list), as the drum reads as a
    sentence after WE; the ground changes and the matte→real dress are short timed beats (0.42 s, 0.55 s), so no paused frame is a mix; the
    built look is a white model with ink hairlines (a dark matte screen made a grey mix); the morph pairs Bell's plinth → the glass outline,
    left face → display, right face → battery, lid → board, tube → the band's back edge, screws → two lenses and the punch-hole, linear
    MorphSVG (the rotational type made blobs); X-ray names sit on a shelf hairline with a leader to a dot on the piece; the callout window
    frames page 2's stub content below "Now, what do you need?" (the text leaves before the window reaches it); "Now, what do you need?" is
    set as a headline now that the button is gone; the phone screen's page-2 preview is rows on hairlines with mono indices (still DRAFT).
- **Page 1 rebuilt to Part 5 "Page 1 refinements" (22 Nov, evening).** Wording signed off by Wajih; Draft flags removed
  (only the phone screen's page-2 preview stays a draft, flagged on the screen). 5.0 screens long at 384×734 and
  1440×900 (whole page 36.0); reduced motion 4.0. Emulated (headless Chrome, real GPU): 60 fps in every segment after
  moving the line journey to WebGL (it was 29 fps as one huge canvas-2D path). Handover: 100% (384×734) / 99.3%
  (1440×900) of the landed lines' pixels lie within 2 px of the X-ray's own lines. Geometry: 0 problems (6 sizes ×
  light/dark × 9 stops). axe: 0. Vibration: tap + 6 snaps (14 ms) + 7 stamps (12 ms); none after a key or with reduced
  motion. No console errors. **Real-phone run pending**: the S23 wasn't on adb or mDNS during this session.
  - Decisions I made alone: the whole sheet is traced (header, Fig. 1, Fig. 2), not only Fig. 1, so everything on it
    becomes the phone; the blue comes in right after the lines appear (0.40–0.52), so the lines travel white on blue and
    never grey on half-blue; text and line colour pick whichever of ink/paper contrasts more with the sheet as it is
    (≥ 4.3:1 at the switch, display sizes); the matte → real change is a soft whole-phone cross-fade too (no scan line
    anywhere); exploded pieces stack down the screen on phones (labels left/right) and across on desktop (labels
    above/below); stamps in cyanotype blue ink (on dark film: light ink), grain from the 1905 paper scan; the kinetic
    line lands word by word in place (no reflow); "you" → "YOU" is one word travelling between its three places.
- **Setup:** brief Part 5 committed; every tool, `tools/AGENT_BRIEF.md` and this file point at 8109 and the Take 2 folder.
- **Page 1 (Enter + hook): built.** 4.0 screens long at 384×734 and 1440×900 (whole page 35.0). Real phone (384×719 with
  the address bar): 60 fps while scrolling (p95 16.8 ms). Geometry: 0 problems (6 sizes × light/dark × 3 stops, plus the real
  phone). axe: 0 violations. Reduced motion: three static frames, no vibration. Wording: all draft, batch sent to Wajih.
  - Lesson: on the phone the stage is 100lvh but the visible height is smaller while the address bar shows; layout uses
    innerHeight for the band. Emulation can't show this: always run `tools/phonep1.py`.
- **Style lab: complete; Wajih picked** ("I love everything": the A journey, B3, C3 slip, D2 corridor → Work) (`site/dev/lab.html`, A1–A3, B1–B3, C1–C3, D1–D2).
  - All on the real lock ("Cutaway Lock" by zbzzn, CC BY 4.0; `site/media/models/lock/manifest.json` names the parts).
    The STLs sit in assembled positions (Z up, key from +Y); key ABCDE lifts every stack 2.2 mm to the shear line (z 16).
  - Tested on the real phone (SM-S918N, Adreno 740, Chrome 157) over adb + CDP (`tools/phonelab.py`): A, B, D about
    60 fps while scrolling (p95 16.7–16.8 ms); C about 57 fps while tapping. The phone drops its screen to 24 Hz when
    nothing moves, so idle measurements read low: measure while something moves.
  - Freeze-frame, reduced motion (finished frames, no vibration), no console errors: checked.
  - Next after the picks: page 1 (Enter + hook) with the picked looks; wording batch to Wajih.
- **Real sources:** `tools/notes/take2-sources.md` (summary + pointers to the three detailed logs), `CREDITS.md`.
  No free 3D exists for Bell's telephone, the Difference Engine or Jacquard cards; real scans exist and are downloaded.
- **Viewports:** `site/dev/viewport.html`. Wajih's laptop window: _waiting for his numbers_. His phone reports
  model **SM-S918N (Galaxy S23 Ultra)**, Chrome 157: **384 × 734 CSS px @ 2.8125** (screen set to 1080 × 2316,
  Chrome's address bar showing). Read over adb + DevTools (`tools/phone.py`); the phone was locked, so no on-phone fps yet.
- **Tools:** `tools/phone.py` (drive phone Chrome over CDP, only its own tab), `tools/labshot.py` (lab screenshots + fps
  in S23 emulation).
- **Decisions I made alone:** D1 uses Yale's own patent sheet as the two doors; D2 a corridor of the site's patent plates
  whose doorways only cut open as you leave each stop (so every plate is whole and readable while you're stopped); C cards
  use real book scans with their paper instead of Take 1's cleaned plates; the Hughes plate shows no date (Wellcome's 1753
  is impossible).

---

# Take 1 history (frozen at tag `take-1`; kept for reference)

**After any context compaction:** re-read this file and `STUDIO_BRIEF.md` Part 5, then Parts 2b, 2c, 2d, 3 and 4 before continuing.
(Take 1 was served on 8108 from its own folder. Take 2 serves on 8109 only: see the serve line above.)

## How the run works now (Part 2d, Wajih's call)

- Build every remaining slice back to back to the finished site. No review stops, no "2–3 options first", no question batches. Pick the best and log why under "Decisions I made alone".
- **After each slice:**
  - freeze-frame test at 1440×900 and 390×844;
  - no console errors, smooth scrolling (`tools/fps.py`), reduced motion;
  - commit "studio: slice N - <short title>";
  - update this file.
- **At the end:**
  1. the full bug sweep from the run message;
  2. commit "studio: final - full site, bug sweep clean";
  3. one final report.
- Stop early only for a real blocker.

## Standing decisions (Wajih / the Claude chat for Wajih)

- **Brief layers:**
  - 2b: B&W first; blue once as a cyanotype, then only at plate moments. Made-up products only, never Wajih's builds. Assets are sourced or made in code.
  - 2c: full studio, "we". No fabricated proof: no invented clients, testimonials, numbers, certifications, awards or people. Concept work is labelled "Concept sheet". Cleanliness: one idea per screen, body ≥18 px on desktop, ≤65 characters per line, nothing moves under text, freeze-frame test. Ancestor plates per discipline. Title blocks show Drawn/Checked/Approved by discipline.
  - 2d: font pairing B (Newsreader + DM Mono) only; A and C removed. Black moments must do something and no two chapter changes may look alike. Bell's plate gets context, then the phone history.
- **For the final review:**
  - no portrait;
  - the founder card is short and text-only, never mentions past builds, true lines only;
  - the proudest / annoys / loves questions are skipped.
- **Contact placeholders for testing:** email `hello@testing`, WhatsApp `+216 00 000 000`, location "Tunis", all in ONE settings file (`site/js/settings.js`). The work order hands the visitor's brief to their own email or WhatsApp app (mailto / wa.me), with no outside service.
- **Product rotation:** a new made-up product appears on each loop, once the loop and the concept products exist.

## Decisions I made alone (log)

- **Slice 1–2 engine:**
  - static site, vendored libraries, 1rem = width / 90;
  - opening timing about 2.3 s to scroll;
  - the act is a pure function of scroll (freeze-safe);
  - cyanotype as a real negative (paper → Prussian #173F73, ink → white);
  - LOFTHAUL as the first concept product, with its colour on hover only.
- **Slice 3, the 00 → 01 black moment:** the line closes at a 6° angle like a section cut. While shut it is labelled as a drawing section ("A … A", "Section A–A") plus a real measurement of the sheet just read ("Sheet 00 · read in 41 s", timed from scroll-unlock to the cut). It reopens level onto Bell's plate.
- **Slice 3, phone history:**
  - every era after Bell is a generic form drawn in code, at a stated scale;
  - real patent drawings were not used for these eras, to avoid brand-specific designs and licence doubt on post-1927 drawings;
  - no logos or brand names; the 2007 drawing deliberately has no round home button.
- **Slice 3, today's phone:** a round punch-hole camera instead of a pill-shaped cutout (the pill reads as one brand).
- **Slice 3, layout:** the history is drawn at 40% of the width on desktop so the reading text never overlaps it; the years axis is the opening's ruler returning.
- **Slice 3, type:** body 20 px at 1440 (Newsreader is smaller on the em than Archivo).

## Phone history: sources (verified 21 Nov 2026)

| Year shown | Line on the site | Source |
|---|---|---|
| 1877 | Bell US 186,787, granted 30 Jan 1877; Fig. 1 "a perspective view of one form of my electric telephone" | The patent itself (Google Patents US186787A, page 2 text) |
| c. 1900 | Candlestick phones, common for about fifty years | Wikipedia "Candlestick telephone": common from the late 1890s to the 1940s |
| 1920s | Rotary dial replaces the operator for dialling | Wikipedia "Rotary dial"; NY Telephone began switching to dial in 1922; Bell dial service became common in the 1920s |
| 1963 | Ten push-buttons and tones, first offered in Pennsylvania | Hagley Museum; Wikipedia "Push-button telephone": Touch-Tone offered 18 Nov 1963 in Carnegie and Greensburg, PA, ten-button pad |
| 1973 | First handheld mobile call, on a New York street | NPR (2023), IEEE Spectrum: Martin Cooper, 3 Apr 1973, Sixth Avenue, Manhattan |
| 1992 | First text message "Merry Christmas" | History.com, NPR: Neil Papworth, 3 Dec 1992 |
| 1994 | Touchscreen phone with apps (email, calendar, sketch pad) | Wikipedia "IBM Simon", Computer History Museum: on sale 16 Aug 1994 |
| 2007 | Multi-touch glass replaces the keypad | Apple press release, 9 Jan 2007 ("Apple Reinvents the Phone with iPhone") |

## Architecture (for every remaining slice)

- `site/index.html` is generated from `src/index.template.html` + `src/parts/*.html` by `python -I tools/build.py`.
- **Each sheet owns:**
  - its markup in `src/parts/sheet-NN.html`;
  - its CSS in `site/css/sheet-NN.css`;
  - its JS in `site/js/sheets/sheet-NN.js`, exporting `init(engine)` and imported by `main.js`.
- **Shared:** `site/js/engine/core.js` (Lenis, bus, scrollTo), `site/js/engine/kit.js` (clamp/span/ease, scroll scenes, hairline draw-on, theme colours).
- **Chapter overlap:** every sheet section after act 1 starts with `margin-top: -100lvh` and its own sticky stage. Its first viewport of scroll is its incoming chapter change, drawn over the still-pinned previous stage.
- **Colours only through tokens** (`--paper`, `--ink`, `--graphite`, `--prus`, `--blueprint-ink`); canvases read them at runtime and redraw on `engine.on('theme')`.
- **Testing:** `tools/shoot.py`, `tools/fps.py`, `tools/sheet.py`. Browser runs are serialised by a lock, because the plain http.server drops connections under parallel load.

## Done

- **Slice 1** (`studio: slice 1 - opening, timeline, type options`).
- **Slice 2** (`studio: slice 2 - first drawing, full-studio copy`).
- **Slice 3** (`studio: slice 3 - phone history, section-cut black, Newsreader`):
  - the plate caption with context;
  - the phone history, 1877 → today, in 9 figures along a years axis;
  - the section-cut black moment;
  - pairing B site-wide, with A, C and `/type.html` removed;
  - checks: freeze at 1440 and 390; reduced motion (the history as one static sheet); fps 57 desktop / 57 mobile, p95 16.8 ms; no errors.

- **Slice 11** (`studio: slice 11 - spec sheet measured live, the loop back to the singularity`, by the lead):
  - The 09 entry is a scale change: 1:1 → 1:5, the previous sheet shrinks into its slot in the drawing set, then sheet 09's slot opens.
  - Every number is measured live in the visitor's browser: weight, files, load, LCP, CLS, scroll fps, trackers, cookies, typefaces, plus axe-core WCAG 2.1 AA, loaded on demand.
  - Colophon, then the line closes back into the point.
  - 450 ms at the bottom → jump to the top behind the closed curtain, replay of the opening (`replayOpening` in opening.js), `loop:wrap` emitted, strip and title block reset.
  - Reduced motion: no loop, a "Back to the first sheet" link.

## Decisions I made alone (cont.)
- **Kit contract fix:** a chapter's `p` is in true viewport heights (0 .. units+1), so each entry is exactly the overlap.
- **Hairline greys:** written as `rgba(var(--ink-rgb), a)` so a dark version can swap them.
- **Spec sheet shows no Lighthouse score:** that would be an estimate from a tool the visitor didn't run. Everything shown is measured live instead.

- **Slices 4–10:** done by the builders and committed by the lead (products, principles, disciplines, method, process, studio + contact); the notes are in `tools/notes/`.
- **Slice 12** (`studio: slice 12 - dark print, bundling, robustness`):
  - **Theme:** a "Print: Light / Dark" cell in the title block switches the tokens. The choice is stored in `wm:theme`; light is the default.
  - **Dark details:** difference layers always use `--diff` (#F2F0EB). In dark mode the opening plays as the exact negative of the light one; raster plates invert; the 3D phone swaps lightness and the cyanotype develops from the right tone.
  - **Bundling:** JS is bundled by esbuild into `site/dist/` (built by `tools/build.py`, git-ignored, regenerated on every build), because the plain http.server refused module requests under bursts.
  - **Retries:** images, styles and the app script retry on failure.
  - **Sideways overflow:** guarded with `overflow-x: clip`.

## Decisions I made alone (cont. 2)
- **HALVANE's hover colour:** brass #B98A3E instead of blued steel, because blue is kept for the cyanotype.
- **Dark print default:** light is the default, because the designed opening is a black curtain onto paper; the visitor's dark choice is remembered.
- **Dark opening:** it is the negative of the light one (light curtain), not a re-design.
- **The axe-core run on sheet 09** waits until the reader has stopped scrolling, because it blocks the main thread for about 0.6 s.

## Next (slices in order)

4. Concept products: the remaining phones and web apps, names web-checked, each with its hover colour.
5. 02 Principles: Exact, Felt, Proven, Locked, with Da Vinci margins.
6. 03 Disciplines: ancestor plates, including the security lock-pick and the AI punch-card moment with the Lovelace line.
7. 04 Method.
8. 05 Work: concept sheets.
9. 06 Process: the mechanism and the Break stress test.
10. 07 Studio + 08 Contact: the bench, the founder card, the live work order and the settings file.
11. 09 Spec sheet (measured live) + the loop back to the singularity + product rotation.
Remaining: 05 Work (builder W, running) → final bug sweep → final commit → report.

## Parallel build (started after slice 3): who owns what
Builders follow `tools/AGENT_BRIEF.md`, write `tools/notes/sheet-NN.md`, never commit (the lead commits each slice).
- **P, concept products (slice 4):** `site/js/products/**`, `site/dev/products.html`; product swap + rotation hooks in `site/js/sheet01/phone.js` and `act.js`.
- **A, 02 Principles (slice 5) + 04 Method (slice 7):** `sheet-02`, `sheet-04`. Entry moves: tracing paper slides over the blueprint (02); a sheet passes with inversion and leaves a black sheet (04).
- **D1, 03 Disciplines: websites, apps & phones, platforms, engineering (part `sheet-03`); consulting, care (part `sheet-03c`) (slice 6).** Entry move: dimension lines measure the sheet before it appears.
- **D2, 03 Disciplines: security (lock pick) + AI (punch cards, Lovelace line) (part `sheet-03b`) (slice 6).**
- **M, 06 Process (slice 9):** `sheet-06`. Entry move: the line closes like doors; the black moment draws the mechanism's first gear on the line, used as its axle.
- **C, 07 Studio + 08 Contact + `site/js/settings.js` (slice 10).** Entry moves: the previous sheet folds away along fold lines (07); the title block grows out of its corner into the work order (08).
- **Then W, 05 Work (slice 8), after P.** Entry move: the line closes and the black shows the next sheet as a cyanotype negative developing in.
- **Then the lead: 09 Spec + loop + rotation wiring (slice 11), dark version (12), sweep.**

## Final sweep: done (`studio: final - full site, bug sweep clean`)
- **Truth sweep** (`tools/notes/sweep-truth.md`):
  - CREDITS.md rebuilt from the files on disk and every entry verified; the Lenis MIT licence file was added.
  - Five copy fixes: Bell's *second* patent, the Yale and Plan 25 titles made strictly true, the CC BY attribution with licence link, and an accurate colophon.
  - All patent, date and era facts checked; Lovelace checked word for word (Note G, p. 722, 1843); the fabricated-proof audit is clean.
- **Functional sweep** (`tools/notes/sweep-functional.md`):
  - About 1,600 freeze-frames at 1920, 1440 and 390, plus dark and reduced motion; every chapter change at fine steps.
  - Fixes: text cut by entries; hidden elements reachable by keyboard; a reload mid-page now starts at the opening, and `#sheet-NN` links travel there afterwards; the sheet 09 set; mobile overlaps; contrast on blue; the Print switch label; a focusable hero phone.
  - Results: 0 console errors, all 108 local links 200, no requests off 127.0.0.1, axe 0 violations in 8 combinations, about 59 fps at all sizes.
- **Lead:** the strip and title block settle by position on scroll end (robust after big jumps). The loop and product rotation were re-verified.

## Waiting on Wajih (final review)
- **Founder card's last line:** "Seven years as cabin crew taught him that a process has to hold up when everyone is tired." The facts are true but the lesson is a paraphrase; he should confirm the wording.
- **"Specialists at every desk… drawn by one, checked by another":** his approved Part 2c line; he should confirm he still wants it while the studio is small.
- **Contact placeholders in `site/js/settings.js`:** email, WhatsApp, location.
- **Known limits:**
  - one-time first-paint hitches of 100–200 ms at three entries (06→07, the first 03 plate, the 02 film);
  - a return visit is about 2.2 s on the plain local server (file reloads), under a second with normal hosting caches;
  - the page is long, about 136 viewports at 1440×900.

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

### Running order (Part 5 "Round 8": the site shows first and asks last)

| # | Page | What happens | Viewports | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Page 1 | Beacon → Bell's ink on our grid → X-ray phone, six named pieces (each leader on its own piece) → kinetic line, real phone → "…to serve you." → YOU → "YOU gave us the task." → WE + verb drum → **"Now, how can we serve you?"** (signed off, round 8) | ~5.9 (with 2: 10.54) | **round 8 built (25 Nov): waiting for Wajih's review** |
| 2 | The hallway | Hallway pass 1 (26 Nov): fixed proportions (about 2.6 x 3 x 19, frames at 4, 7, 10, 13, 16, left/right alternating); a white sketch drawn into depth dresses into the dark hall, the spotlights and the ceiling strip come on, the frames appear; scrolling is walking at one steady pace; each frame swings out fully (90 degrees) as you reach it and folds back as you pass; pass 2: black float frames lit in their spotlights, a light plaque under each (title, FIG line), the open frame's title and story line in a dark caption band, the camera slides (never turns) to each open frame (portrait: a narrower lens, the frame about two thirds of the width), dark chrome in the hall, five new blueprints; the walk ends in front of the centred, shut door with its brass Cutaway Lock; then page 3 as before; pass 3: the eye one height for the whole walk, the title on the plaque only (light paper, rounded), the band the story line only, no stock icons, frame 5's blueprint dresses into the real phones, which lift out of the frame and turn once each; pass 3b: at frame 5 the walk stops and the scroll drives its show (scribble, lift, a full turn each, about 1.5 screens per turn; back plays it in reverse) | 8.3 (5.4 walk + 2.9 held show; inside page 1's section) | **pass 3b built (frame 5's held, scrubbed show; every page 1 and hallway object animation scrubbed); pending: the real-phone run** |
| 3 | The security page | 27 Nov (Part 5, as demoed): five beats on the real lock. **Beat 1 built** (the steady push into the door's lock, the keyway past the pins, out into the dark; 1.5 screens, at the end of the hallway's section in dive.js); **beat 2 built** (28 Nov: back up the keyway and out through the keyhole, lab B3's room of locks: 74 copies, the room turning, the camera circling, the centre key's turn and the unlock wave; the headline "One door is never the only door." (draft) at the hold; 3 screens, straight on in dive.js); **beat 3 built** (28 Nov: the room squares up as the camera pulls back to see all of it, the copies fly home nearest first and burst as they land, the real lock bursts into its 15 parts and comes home part by part as the camera pushes in to the A frame: one lock, centred, the key in it; 3 screens); then, TEMPORARILY, a plain fade from the one lock into round 9's page 3 as it was (starts on the lock in X-ray; into the keyhole past the pins; the lattice unlocks in a wave and folds back into one; two lines, drafts) until beats 4-5 replace it | beat 1 2.5-3.5 (per screen: the push at walking speed) + beat 2 3 + beat 3 3 + the fade 0.4 + 4.6 (overlapping page 1's last screen) | **beats 1-3 built (beat 1 27 Nov, second pass: the pins ride the key, the push at walking speed; beat 2 28 Nov, the room of locks; beat 3 28 Nov, fly home, chaos, one lock); beat 4 next** |
| 4 | How we work | The lock turns side-on into a 2D cutaway; "First, the obvious key." / "It fails. Most people stop here." / "We don't." (drafts); the wrong key fails; seven pins picked in the drum's order, each verb on a leader, the newest meaning under the lock on a leader; it turns on Delivered | 4 (inside page 3's section) | **round 10 built** |
| 5 | Lighter trips | Three rooms, scrubbed: AI (the property app's enquiries: the AI drafts, a person approves, then it's sent), websites (the booking app's site, drawn on the grid then real), apps (the delivery tracker live on the real iPhone 18 and S26). Lines and content drafts | 7.2 | **round 11 built** |
| 6 | Team | "The three of us." (draft); three cards, clearly placeholders (a crossed picture box, "Name to come", a bio placeholder) | ~1 | **round 11 built** |
| 7 | The final room | "What's the task list? Tick everything that fits." (Wajih's, signed off, no flag), then one slip on plain paper: the six needs as small boxes, the details, "Send it by", Send (a box with a 3 px hard ink shadow; fields at half), CTA A (pick open), every way to reach us (switches in settings.js) | ~3.1 | **round 8b built** (needs, answers, slip wording: drafts) |
| 8 | Spec sheet | "This page, measured as you read it." (draft): page weight and files loaded so far, ready in, fps now, grid, screen, fonts, page 3's locks (all measured live), the outside assets and their licences (the site's list); "Back to the start ↑" (the hyperdrive to the top) | ~1 | **round 11 built** |

"Take a shortcut →" (strip, always; was "Cut to the chase"): the hyperdrive into the final room, with "Cutting to the chase." over it; the strip's last square and 07 do the same. Page 1's first screen is the arrival (WM.IO's mark, Part 5 "The name, the top bar and the title block").

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

### Round 8 structure notes (25 Nov)
- **Sections:** `#page-01` holds page 1 and the hallway (page 2 = a marker, `span#page-02.p1-mark`, placed by page.js at the
  hallway's first scroll position; the strip and title block read it); `src/parts/stubs.html` = pages 3-6; the final room
  = `src/parts/page-02.html` (`section#page-07`, the rows) + `page-03.html` (`section#page-07b`, the slip, no page number of
  its own); `stub-08.html` = the spec sheet. Page 1's section is 10.54 screens (`SCROLL = 4.94 + DIVE`, `DIVE = 4.6`).
- **No snap, held scenes:** the touch scroll-snap, `.p1-snaps`, the desktop wheel snap and `?nosnap` are gone (head script,
  main.js, CSS, every tool). Page 1 renders from a lagged scroll position (`page.js` `chase()`: an exponential follow,
  0.1 s; a jump of more than 2 screens is taken at once); `__p1.settled()` says when it has caught up. Scrubbed now (were
  timed): the way in, frame 5's drawn → real and its phones' turn. Still short timed beats (by design): the word reveals
  (a paused frame shows whole words), the ground's blue/paper change and the dress to real (never a murky mix), the drum's
  detent (Wajih: keep), the phones' cross-fade when they finish loading mid-frame (a load event).
- **`dive.js` (rewritten):** way in A only (`WAY_IN`), the dress (`DRESS`: flat paper-and-grid surfaces under the lit
  card, which fades in), treatment B only (`restB`, hinge swing; a pivot off the wall when a big drawing near the middle
  would otherwise poke through the ceiling), the camera straight down the axis (`camT`), labels as DOM on a frosted
  rounded backing carried by the sheet's perspective (`quadMatrix` → `matrix3d`, a plain translate at rest; `data-rest`),
  sheets that widen in landscape (`setSheet`: more blue margin, so the label under them, as wide as them, stays short;
  `F.wide` for the square sheet), the knockout (`knockout()`: the hallway's edges and the shut door's lines cut half a
  cell round every label on screen), the door (`DOOR`: leaf on its hinge, panels, architrave, faint → clear by distance,
  opens 100°, the camera walks through) and its lock (`door-lock.bin`, from the real Cutaway Lock by `tools/lock_web.mjs`;
  mounted on the leaf like a rim lock; it steps back where a label would sit over it), `drawn()` for the type check
  (every hairline, sheet and in-drawing word on screen, lines behind an opaque sheet removed).
- **`corridor-drawings.js`:** five product drawings (`enquiry`, `watch`, `dispatch`, `website`, `phones`), labels at 14
  units (heads 12), at least 17 units of clear space round every word (half a cell at a 360-wide phone's scale);
  dimensions kept apart (`d.dims`, `dimParts`): the live measurement on the line in DM Mono Light, the line broken round
  it, or beside its end when too short.
- **Cut to the chase:** `site/js/engine/hyperdrive.js` (`playHyperdrive`, `drawHyperdrive`, `HYPER_MS` 1.8 s; the jump
  happens under an opaque frame at t 0.2; reduced motion: a plain jump), wired in main.js (`cutToChase`, also on the
  strip's 07 and last square). Dev page `site/dev/hyper.html`.
- **Type rules:** `TYPE_RULES.md`; `tools/typecheck.py` + `tools/typecheck.js` (in-page collector), `tools/tcsum.py`
  (summary). Title block cells are 3 cells tall (key on the first line, value on the second; desktop 2 rows, 1 row on
  windows under 861 px tall); the slip head's cells too. Drum rows 4/6/7 cells (one faint verb each side), the verb window
  half a cell clear of ascenders and descenders, no ticks on the letters, the WE dimension right of WE on phones and left
  on desktop.
- **Fonts:** `dm-mono-300.woff2` (DM Mono Light, @fontsource/dm-mono 5.3.0 latin, the same release as 400/500).
- **Page 1's names:** each leader on a point of its own piece's face that no other piece's outline covers (`phone.partHull`,
  `inHull`, `hullNear`), pieces 68 mm apart (was 52), names half a cell clear of every outline, shelf and leader; a rising
  leader leaves its shelf a cell past the word.
- **New tools:** `typecheck.py/.js`, `tcsum.py`, `phone_r8.py` (S23: fps per segment, hyperdrive, swipes with traces,
  reduced motion), `axe8.py` (axe at every stop of the whole page, lengths), `lock_web.mjs`, `contactsheet.py`, `r8final.sh`;
  `flicker.py` now compares a staged `site/<name>old/` build and steps the hyperdrive; `gridcheck.py`/`overlap.py` know the
  final room.

### Round 8b structure notes (25 Nov, "Finish the site")
- **Page 1's section is 10.84 screens** (`SCROLL = 4.94 + DIVE`, `DIVE = 4.9`; `.p1` 1084lvh). Stops (`__p1.stops`): ... END 4.8,
  TR 5.11, OPEN 5.5, F1 6.26, F2 6.84, F3 7.42, F4 8.0, F5 8.56, F5B 8.64, DOOR 9.3, LOCK 9.84 (SW1, OUT gone).
- **`dive.js` (rewritten again):** scrolling is walking (`buildWalk`: a speed profile in screens, `SPEED` 1.5 P per screen,
  never zero past the way in, slowing to the lock; a short screen stretches the last stretch so the camera reaches the
  lock). Drawings: hinged at the near edge (`SWING` 40°), `stateAt(l, D)` by the camera's distance D from the hinge
  (out between `Dopen` and `Dread`, held to `Dc` = its closest fully shown moment, back and faded by `Dg`). Layout per
  drawing: of the sheets whose far edge stays 0.75 cell off the axis, whose sheet is at most half the screen's height
  at `Dg`, whose far side is seen at half scale or more, with `Dc` set so sheet + label fit between the strip and the
  title block, the one whose far words are largest. One hairline frame (`frame`, ink). Labels: words 1.5 cells under the
  sheet, the backing a cell round them (`labLocal`, `backLocal`; CSS `inset: -1rem`). Canvas 2: `LAYERS` planes (canvas
  textures painted by `paintLayer`), spread by the swing. The door: shut, its lock on the walking line at eye level,
  framed at the end by `endFaceHeight()` (lock3d.js; page 3 starts on the same frame). The live measurement (website)
  is re-measured as you walk. `readability()` = round 8b's stretch check (see readcheck.py). Label textures are drawn at
  the size they reach on screen, anisotropic, and kept across relayouts (uploaded at layout, not on first sight).
  The hallway's fixed layers hide (`.is-past`) once page 1's stage scrolls on.
- **`corridor-drawings.js`:** no heads in the drawings; labels 22 units (canvas 2: 24), measurements 0.9 of them, clear
  space 30; portrait sheets; walls swapped (left-aligned drawings on the left: their words on the near side);
  `LAYERS` + `sizeLayers()` + `layerPlaces()` + `layerItems()` + `paintLayer()`; dispatch simplified (new order, nearest
  driver, on time?, assign).
- **`site/js/page03/lock3d.js` (new):** `loadLockParts()` reads `media/models/lock/lock-parts.bin` (`tools/lock_web.mjs`:
  every part, edges chained and simplified, a light `lod` set for the lattice), `build({ inside })` → one lock (face
  centred at the origin, facing +z; `setFaceHeight`, `setOpacity`, `colours`, `xray(t)`, parts `groups.plug/pins/drivers/key`),
  `latticeSegments()`, `endFaceHeight()`. `door-lock.bin` deleted.
- **The final room (fork, round 8b):** one section `#page-07` (`page-03.html` is empty; `#page-07b` gone): heading
  (signed off), `form#slip`: `.slip__head` (No., date, Status: Draft = the slip's flag), needs `fieldset#p2-rows` (ticks,
  answers kept), `a.p2-next` → `#slip-when`, when / name / note / send it by, `.slip__send > a.send` (box, `--sh` 3 px
  shadow, `.is-pressed` slides it into its shadow; fields `--sh-f` half). No grid behind. Bottom padding clears the
  title block. The sticky slip head, feed and printed list are gone.
- **Checks:** `TYPE_RULES.md` (round 8b: backings and frames are drawn lines; things in perspective; the drawings'
  words ≥ 0.375 cells at their closest). `tools/typecheck.js`: perspective words and sheets as true quads, `::before`
  backings as lines, a drawing's own pairs left to readcheck. **`tools/readcheck.py` (new, part of the gate)**,
  `tools/phone_stage.py` (new: one stage on the S23: fps per segment, real swipes, reduced motion, shots; `--fps-only`).

### Round 9 structure notes (25 Nov, stage 9)
- **The seam:** the hallway's last 0.2 screens (`dive.js` `XRAY`) draw a blue screen (#173F73 straight to the canvas) and a
  second copy of the lock, lines only, no depth test, over the hallway: the lock in X-ray. `#page-03` (`src/parts/page-03-lock.html`,
  `site/css/page-03-lock.css`) overlaps page 1's last screen (`margin-top: -100lvh`, 560lvh tall); its sticky stage is
  hidden until its top reaches the screen's top (`.is-on`), then draws the same frame (`lockworld.js`: the same lens,
  `endFaceHeight` framing, the same lines). Page 1's fixed hallway layers hide as its stage scrolls on (`.is-past`).
- **`site/js/page03/lockworld.js`:** `createLockWorld(canvas)` → `load`, `layout(W, H, { u, strip, tbTop })`, `render(s)`
  (s in screens, 0 .. `LEN` 4.6). `BEATS`: hold, keyhole (into the keyway at y = KEY_Y, pins overhead), turn, pull (back
  out to `Dfar`), lattice (fades in), wave (the plugs turn by distance from ours), fold (in to ours, relocked; `Dend`:
  one lock under half the screen, where page 4 starts). The lattice: `THREE.LineSegments` over an
  `InstancedBufferGeometry` (the lock's simplified edges, `latticeSegments`), one draw call, plug rotation and fold in
  the vertex shader; as many columns and rows as the screen's shape asks (`setOffsets`), five deep.
- **`site/js/page03/page.js`:** `initPage03`: a lagged scrub (0.1 s, as page 1), the two lines (`.p3l__line`, opaque
  blue backing), `window.__p3` (`yAt(s)`, `S()`, `out()`), page 3's lock box added to `window.__drawn`. Reduced
  motion: one still frame (the lattice mid-wave) and both lines in the flow. `main.js` `__t2stops` adds L00..L10.
- **Tools:** `tools/pshot.py` (shots at positions in a later page: `--api __p3 --ss ...` or `--sel #id`; `--reduced`).

### Round 10 structure notes (25 Nov, stage 10)
- **Page 4 lives in page 3's section** (one scene, no seam): `#page-03` is 960lvh (4.6 + 4 screens of scroll + its own),
  page 4's marker `span#page-04.p3l__mark` at 460lvh. `lockworld.js` `renderTurn(t)`: the X-ray lock turns side-on (face
  to the right) while the camera moves so it lands on the cutaway's housing (`setTurnTarget`), and fades as the
  cutaway draws in. `window.__p4.yAt(t)`; `__t2stops` adds W00..W14.
- **`site/js/page04/cutaway.js`:** `createCutaway(host)`: an SVG schematic of the Cutaway Lock's pin stack (housing,
  plug, keyway, shear line, key pins, drivers, springs) with seven chambers, one per verb (the real lock has five; said
  in the page's sr text); timeline `T` (turn, draw, the three lines, key in / lift / shake / out, tool, pick, turn).
  The verbs and meanings are read from page 1's `.p1-steps` (signed off, unflagged). Verbs: vertical mono labels on
  leaders over their pins once set; the newest verb and meaning under the lock on a leader (`.p4m`). Reduced motion:
  the finished cutaway (all set, turned) and the three lines.

### Round 11 structure notes (25 Nov, stage 11)
- **Page 5** (`src/parts/stubs.html` `#page-05`, `site/js/page05/trips.js`, `site/css/page-05.css`): one pinned section,
  820lvh (3 rooms x 2.4 screens + its own), a lagged scrub; rooms cross-fade (`--op`). AI: the reply's words revealed
  by count, `is-approved` / `is-pressed` / `is-sent`. Websites: `--grid`, `--wire`, each block `is-real` at its moment
  (its wireframe name or its real self, never both); the picture is the booking app's real screen (`drawBooking`);
  phones: one column, the picture small at the bottom right (gone on short phones). Apps: `PhonePair` (the real phones,
  local only; loaded in the first quiet pause from page 3 on, at once a screen away) with `site/js/apps/tracker.js` as
  its screen (48 steps along the route, no mipmaps: an upload only when the dot moves); without the models, the flat
  screens in outlines (`.no-phones`). The scene stops drawing when the section is off screen. `window.__p5.yAt(s)`;
  `__t2stops` adds T00..T10.
- **Page 6** (`#page-06`): three placeholder cards. **Page 8** (`src/parts/stub-08.html`, `site/js/page08/spec.js`):
  measured live (Resource and Navigation Timing, rAF, the grid, `document.fonts`, page 3's lattice stats); `ASSETS`:
  the site's list of outside assets and licences; "Back to the start" runs `backToStart()` (main.js: the hyperdrive to
  the top; a plain jump with reduced motion).
- `tools/typecheck.py`: weekdays added to the proper names; `typecheck.js`: measurements may carry thousands commas.

### Hallway pass 1 structure notes (26 Nov, Part 5 "Hallway rebuild": the space)
- **Page 1's section is 11.34 screens** (`SCROLL = 4.94 + DIVE`, `DIVE = 5.4`; `.p1` 1134lvh). Hallway stops (`__p1.stops`):
  TR 5.11 (the sketch), OPEN 5.5 (dressing, the opening line), LIT 6.2 (lights on, frames in), F1-F5 (each frame open at
  its closest: **set by `layoutDive()` from `dive.closeAt()`, they depend on the screen**; S23: 6.62, 7.20, 7.81, 8.49,
  9.09; 1440 x 900: 6.83, 7.51, 8.16, 8.81, 9.45), F5B = F5 + 0.12, DOOR 9.94 (the walk's end), LOCK 10.34 (the hand-over).
- **`dive.js` (rewritten):** `HALL` = the hall in its own units (w 2.6, h 3, len 19, eye 1.5, frames `at` [4, 7, 10, 13,
  16] alternating left/right by index, `frameH` 1.0, `frameMaxW` 1.0, `hang` 1.55, the door 0.9 x 2.1 with its panels,
  stiles and lock place). World units are CSS px at the mouth (z = 0); `K = max(W / 2.6, H / 3)` px to one hall unit (the
  mouth covers the screen, so the sketch's grid at depth 0 is the page's grid; the shape never changes, only the lens
  crop). Timeline (screens): `WAY_IN` 0.02-0.32, `OPEN_AT` 0.3-0.95, `DRESS` 0.34-0.7, `LIGHTS` 0.92-1.18, `FRAMES_IN`
  1.1-1.24, `WALK` 1.2-5.0 (linear: `camZ`), `XRAY` 5.16-5.36. The camera stands still during the sketch and the dressing.
- **The surfaces:** one `ShaderMaterial` each (`SURF_VS/FS`): sketch = `--paper` + the grid tile (`makeGrid`, 5 cells,
  r channel) in `--ink`; dressed = base colour + painted light (texture R) x lights - painted shade (texture B) + the grid
  at 4.5%. `paintHall()` paints walls, floor, ceiling, end wall and the door's leaf once in hall units (pools, the strip's
  glow and floor sheen, fixtures' glints, corner shade, skirting, architrave, panel bevels). Geometry: the ceiling strip
  (its own shader: cut round every label, like the hairlines: `cutStrip`), five fixtures (per-fixture materials), the lock
  (plate, rose, neck, lever, keyhole; hall units scaled by K). No live lights or shadows (`hall-looks.js` is the dark
  hall's tokens; only frame 5's real phones keep the studio light and tone mapping).
- **Frames:** hinge at the near edge, `SWING` 90 degrees; per frame `Dc` (read closest) = the nearest distance at which
  its hinge is 0.6 cell inside the screen, its sheet at most 0.48 of the screen's height, sheet and label between the
  strip and the title block. Open over 1.0 unit (`Dopen` -> `Dread`), held 0.8 (`Dread` -> `Dc`), folded over 1.0
  (`Dc` -> `Dg`); the drawing draws on as it opens and un-draws as it folds. Labels (round 8b's, DOM, quad-mapped):
  desktop (>= 1024) beside the sheet on its inner side, the backing's foot on the sheet's foot (16 cells, 18 on large
  screens; widened until its words clear the strip's far end); phones 16 cells (N - 4) from the hinge side, **over** the
  sheet where that lets it be read closer than under (on the S23 all five go over). While a label is up, farther frames
  and fixtures behind it fade (`f.hide`, like the lock). Frames' offsets off the wall in drawing units: `ZS` 8, `ZL`, `ZF`, `ZT`.
- **The end:** `Dend` = the door's top under the strip and its foot over the title block (else on the screen), capped so
  the walk never stops before frame 5 has folded. The hand-over draws page 3's first frame (lock3d `endFaceHeight`)
  straight ahead of where the walk ended (`Dx`), on the blue. Round 8b's off-centre door and the door's real-lock model
  are gone (lock3d is used only for the hand-over).
- **Reduced motion:** `dive.still(w, h)` renders the dressed hall, lit, every frame open, from the mouth, to a JPEG;
  page.js puts it (`.p1-hall__still`) after the opening line, before the still drawings.
- **Asset sheet:** sections 1 and 2 rewritten for pass 1; Play runs to the frames appearing; the door card's walk ends at
  the shut door. **Tools:** `phone_stage.py --stage hall1` (stop names with offsets, e.g. `F1-0.4`); `readability()`
  returns `cells` again for readcheck.py.

### Hallway pass 2 structure notes (26 Nov, Part 5 "Hallway pass 2": the frames and the phone framing)
- **`corridor-drawings.js` (rewritten):** five square-ish blueprints in walking order (`FRAMES`: `giveup`, `understand`,
  `oneplace`, `speed`, `phones`), every word at one size (`S` 24 units, DM Mono 500), `CLEAR` 26 round every word, `BOX`
  a one-line box, `MOUNT` 0.07 (even blue margin). New: `d.disc(cx, cy, r, alpha)` (solid dots: frame 2's palette, solid
  and faint; `d.fills`, drawn in WebGL as circles, in `toSVG` as `<circle>`). No dimension lines ("no numbers"; `dimParts`
  kept). Frame 5 is a blueprint only (the phones' true outlines scaled by 2.4); `real`, `LAYERS` and canvas 2's layer
  planes are gone. Story lines are drafts (frame 3's is new: "WhatsApp, spreadsheets, paper and the register, brought
  together into one system you can trust.").
- **`dive.js` (frames, lens, camera, lock):**
  - **Lens:** `hallP(W, H)`: portrait screens 36 degrees across the width (`HALL_LENS`), else the site's `lensP` (page 3
    keeps `lensP`; the X-ray hand-over is drawn through `xCam` with page 3's lens, so the seam is exact). The hall's
    shape and `K` are unchanged.
  - **Frames:** `frameDims(d)` (hall units): the frame's outer size `ow` x `oh` (1.0 tall, at most 1.0 wide) and the
    sheet inside it; `HALL.frame` = moulding 0.032, depth 0.05, shadow gap 0.026. Per frame (`buildFrame`, drawing units
    in the panel): a backing in the gap (`#060708`), a soft shadow under the sheet, the sheet at `ZS` (map `spotMap`: the
    spot, brightest a little above its middle; colour = blue x lit, lit = lights x (0.7 + 0.3 swing)), the drawing's lines
    and words, `fills`, the moulding's face (`ring`, map `mouldMap`: near-black, its top edge catching the light) and four
    bars (its depth), the plaque's plate (`#A8ACB2`, dim on the wall, lit as the frame opens). A soft wall shadow
    (`wshadow`, in the scene) where it hangs, narrowing to the hinge as it opens. The hairline frame is gone.
  - **Light:** `paintHall` puts each spotlight's pool on the floor under the frame's open place and a soft halo round it on
    the wall; the strip's glow and sheen are about halved, the strip 0.035 wide and `#5E636B` (hall-looks.js); the
    fixtures hang over each frame's open place (0.3 in front of its hinge).
  - **Plaques:** DOM words only (`.dive__lab`: title serif 1 cell 420, FIG mono 0.5 cell, a cell between them), quad-mapped
    onto the GL plate (`labLocal`: 0.75 cell in from the plate's sides, top and foot; `backLocal` = the plate, its sides
    the backing lines for the type check). Shown while the frame is open (`lab`).
  - **Caption band:** `.dive__bands` / `.dive__band` (one per frame, the open one shown): dark `#0C0D0F`, 1 cell padding,
    the title and the Draft-flagged story line; beside the title block on wide screens (24 cells or more free), else a
    cell over it; whole cells tall (the tallest line). Opaque: hall lines are cut round it and `drawn()` hides what lies
    under it.
  - **Framing and the slide (`layout`):** read closest (`Dc`), frame + half a cell + plaque sit in the middle of the room
    between a cell under the strip and a cell over the band and title block (`bTop` on a grid line). Portrait: the frame
    `n` cells wide (`round(2N / 3)` down until it fits: 13 of 20 on the S23, 0.666 of the width), the camera slid to its
    middle (`cx`, `cy`). Wide screens: the camera slides only up and down (`cy`), the frame's wall edge 1.5 cells inside
    the screen, the frame at most 0.6 of the screen's height. In `render` the camera position is the open frames'
    targets weighted by their swing (a slide, never a turn: its rotation stays 0).
  - **The lock:** `lockParts.build({ inside: false })` on the leaf's right edge strip at 1.0 (handle height), face 0.13
    tall, its solids `toCreasedNormals` in `brass` (MeshStandardMaterial, metalness 1, roughness 0.26, the studio HDRI,
    `envMapRotation` y 1.5 pi so the face catches the soft boxes), edges hidden. The old plate, lever and keyhole are gone.
  - **Gone:** frame 5's real phones (`loadPhones` and `phones()` stay as no-ops for the asset sheet), `LAYERS`, the
    labels' frosted backing. `drawn()` treats a fixture behind an open frame as hidden. `readability()` reports each
    frame's cells, plaque, `Dc`, slide, smallest word, width and height shares and in-plane clearance.
- **Dark chrome:** page.js toggles `html.hall-dark` (dress past half, before the X-ray, until the stage scrolls on);
  page-00-grid.css gives `.strip` and `.titleblock` the dark tokens under it.
- **Reduced motion:** the still hall (frames open, plates, no words), then each drawing (`toSVG` with a `MOUNT` pad) and
  `captionHTML` (title, FIG line, flagged story line).
- **Asset sheet:** sections 1 and 2's text updated; 1b is now the five drawings, flat.
- **Tools:** `tools/hall2probe.py` (shots at named stops, what the hallway reports, `--read`), `phone_stage.py --stage hall2`.

### Hallway pass 3 structure notes (26 Nov, Part 5 "Hallway pass 3": fixes and polish)
- **The pre-ducked camera (`dive.js` `layout`):** the eye has one height `E` for the whole walk (per screen; was
  `HALL.eye` 1.5), and the camera never moves up or down (`camera.position.y` stays 0; only the walk and, on portrait
  screens, the sideways slide `cx`). The framing is solved before the hall's scale `K`, in hall units: every frame is
  read at the same distance `d` from its hinge (so each lands on the same place on the screen); `a` = how far the eye is
  under the frames' middles (`HALL.hang` 1.55) is chosen so a block (frame + half a cell + plaque) whose plaque is midway
  between the shortest and the tallest is centred between a cell under the strip and a cell over the band and title
  block (`limits`); every block is then within 0.43 cell of the middle. Portrait: `d` from the widest frame at `n`
  cells (`round(2N / 3)` down until every block fits); wide screens: the frame's wall edge 1.5 cells inside the screen,
  at most 0.6 of the height, larger `d` until every block fits. `E = hang - a` (clamped 0.7-2.2); then
  `K = max(W / 2.6, H / (2 min(E, 3 - E)))` so the mouth still covers the screen with the eye at `E` (the hall's shape
  never changes; `FY = -E K`, `CY = (3 - E) K`). The eye: about 1.0 on phones (0.88 on a 375 x 667), 1.24-1.42 on
  laptops and desktops. The door's framing uses `E`.
- **Plaques:** `PLAQUE` `#EDEEF0` (light paper) x lights x (0.5 dim on the wall .. 1.0 open); ink `#121212`, the FIG line
  `#4E5156`. Rounded on all four sides (Wajih: "rounded, never a hard cut"): the open plaque's plate is drawn in CSS
  (`.dive__labs .dive__lab::before`, 0.75 cell round the words, corners half a cell, `#EDEEF0`, fading with `--op`), at
  the screen's own pixel density, so its edges are as clean on the S23 (dpr 2.8125; the WebGL canvas is capped at 2) as
  on a laptop; the WebGL plate under it (seen while the frame is closed) has the same rounded outline
  (`ShapeGeometry`, radius half a cell at the reading distance). **The caption band:** only the story line
  (`bandHTML`; `.dive__band-t` is gone), `#DADDE1` on `#0C0D0F`, corners half a cell.
- **Drawings (`corridor-drawings.js`, design ethos):** no tick, smiley, person or phone glyph, no checklist icon, no pill
  boxes, no rounded database outline, no browser dots, no spinner. Frame 1: "3 ONE TAP" and "4 SENT" in plain boxes;
  frame 2: the five layers carry only their words, the palette layer its three dots (layers 78 tall, 20 apart); frame 3:
  a square database outline, a little more room round its two-line heading; frame 4: before = every part a dashed
  outline, after = the parts drawn (a drafting picture box, lines, a plain button box). Frame 5: `d.region` (where the
  real phones lie, with `M` 2.4).
- **Frame 5's real phones (`dive.js`, from pass 1, reworked; Wajih's last change of the pass):** `loadPhones()` (page.js
  calls it from page 1's X-ray scene on, after 300 ms of quiet; at once when the hallway starts): `realphones.js`
  `loadPhone` (meshopt, off the main thread), our booking app on their screens (`appTexture`, `setScreen`), the studio
  light at 0.38 as a fill (`phoneScene.environmentIntensity`) under the frame's own spotlight (a `DirectionalLight` 3.2
  from above and a little in front: a bright top edge, darker towards the foot), textures uploaded one per frame,
  `compileAsync`, then one hidden warm draw in the first pause (`idleWarm`). The iPhone's back (its logo flattened into a
  plain grey panel) gets a real frosted glass back: one `MeshPhysicalMaterial` sheet (satin, fine grain, clear coat)
  laid just proud of the whole `Back_Panel`, so the logo's seam never shows; the camera plateau stands above it. The
  phones sit on their own blueprint outlines (`placePhones`, pivot scale `M`), drawn in their own pass after the hall.
  **The show (`SEQ`, `phoneFrame`):** the scribble draws on as the frame opens (the walk); once it is fully open (D <=
  `Dread`) a timed sequence plays once: 0-0.6 s the phones turn real (the blueprint's lines fade; the blue sheet stays
  behind them the whole time), 0.15-1.35 s they lift OUT of the frame towards you (`phoneOffset`: carried along the line
  of sight a share `liftF` of the way to the camera, so they grow on screen without drifting; past the frame's front)
  and spread apart (`spread`) so their outer edges pass over the frame's sides by 0.6 cell (the frame broken on
  purpose), a soft shadow left on the sheet (`blobs`, further and softer as they lift); then each makes ONE full 360
  degree turn, the iPhone 1.4-7.4 s, the Android 2.0-8.0 s, ending on its front with the booking app. `liftF` per screen
  (layout): as far as keeps them, with a margin for the near edge of a phone turned side on, half a cell under the
  frame's top edge (so never over the plaque or the band): 1.16 x on a 384 x 734 phone. Walking back before the frame
  opens, or on past it, resets the show; folding the frame takes them back in. One render per frame (`seqStep`; the
  loop's handle stays set while its own render runs: clearing it first made each render start another loop, and the
  renders per frame doubled until the hall stalled, found in real Chrome). Reduced motion: no turn; the page's still
  list shows frame 5 as a still of the real phones standing out of the frame, front on (`frameStill`, page.js), or its
  blueprint without the files. No IPHONE / ANDROID words (the plaque names them). Tests: `seqAt(e)` holds the clock,
  `seq()`, `yaws()`.
- **Checks:** `readability()` (and `tools/readcheck.py`) now measure the fixed hall: words >= 0.375 cells, the block
  between the limits, centring within half a cell, in-plane clear space, the plaque's pad; round 8b's "half the screen's
  height" rule is gone. `tools/geom.py` also measures the caption band. `info[].quad` is each frame's visible outline,
  clipped at the camera's near plane (`visiblePoly`: a frame folding back beside you was reported as a huge inverted
  box), and `info[].hide` says when a frame steps back behind a plaque; `tools/overlap.py` uses both, ignores the
  hallway once it has scrolled away, and counts a closed frame on the wall passing under the fixed chrome (strip, title
  block, caption band) apart, by design, like page text under the chrome. `tools/hall2probe.py` prints the eye and the
  phones' state. `tools/phone_stage.py --stage hall2` covers frame 5's phones, their turn standing still (fps, two shots, reduced
  motion stops it) and a plaque close up.

### Pass 3b structure notes (26 Nov, Part 5 "The scroll drives the stage")
- **Frame 5's held show:** `dive.js` exports `SHOW` (screens of scroll into the hold: `len` 2.9, `draw` 0-0.4 the
  scribble, `real` 0.4-0.65, `lift` 0.5-1.0, `turn` [1.05, 2.55] the iPhone and [1.3, 2.8] the Android: 1.5 screens per
  turn, the Android 0.25 behind). `render(q, again, show)` takes the show's position from page.js; without it (the asset
  sheet, the stills) the show is at its start before frame 5 is fully open and at its end after. The scribble of frame 5
  draws in the hold (it no longer draws while it opens: the blue sheet swings out blank); it un-draws as it folds. The
  turns ease with a sine in-out (cubic's middle ran at 3x the average when scrubbed). The timed loop (`SEQ`, `seqStep`,
  `seqT0`) is gone; `seqAt(e)` holds the show at e screens; `seq()` reports it.
- **page.js:** `HALL = DIVE + SHOW.len` (8.3 screens), `SCROLL` 13.24, `.p1` 1424lvh. `holdAt` (the walk's screens at
  which frame 5 is fully open: `dive.openAt()[4]`, per screen) splits the hall's scroll: before it the walk, then
  `SHOW.len` screens with the camera still and the show driven, then the walk at the same pace (`hallAt`, `hallOf`).
  New stops: `blue` 0.36 (the ground mid-change), `dress` 2.23 (mid matte -> real), `F5H` fully open (the walk stops),
  `F5S` +0.2, `F5R` +0.55, `F5L` +1.0, `F5T` +1.8, `F5E` +2.9 (the walk resumes); F5 (closest), F5B, DOOR, LOCK move on
  by 2.9. Tests: `__p1.at(p)` renders p at once (no lag), `__p1.look()`, `__p1.hall()`.
- **Scrubbed now (were timed):** the ground's paper -> blue -> paper (over 0.08 screens centred on 0.36 and 1.98), matte
  -> real (over `R.real` 2.16-2.3), the phone canvas's fade in and out (0.04 / 0.06 screens), frame 5's scribble, lift and
  turns.
- **Kept timed, with the reason (the brief's exceptions):**
  - the words' reveals (SplitText rise-and-straighten, the X-ray names, the meanings, the hallway's opening line, the
    drum's and the construction grid's fade in with WE): a paused frame never shows half a word;
  - the travelling words (you -> YOU, us -> WE): words, and a paused frame must find each on a baseline (TYPE_RULES 5);
  - the drum's detent (Wajih kept it);
  - motion with no scroll to drive it: the gate and its curtain, the hyperdrive jump, the finished phone following the
    pointer or the visitor's tilt (`live.js`: driven by the pointer, not a clock), the real phones' cross-fade if they
    finish loading while frame 5's show is already past its real point (a load event; they load from page 1's X-ray
    scene on, so it is rare), the beacon's rings.
- **Warm-up:** page.js's warm-up now paints the hallway's opening line once, fully on (`.is-warm`): its frosted
  backing's backdrop blur cost a 133-150 ms frame the first time it was drawn on the walk in (found in real Chrome with
  long-animation-frame entries: no script in it; gone with the blur off).
- **Tools:** `tools/stagechrome.py` (real Chrome, one size: continuity of every scrubbed value at every 0.01 screen,
  forwards vs backwards, the camera during the show, fps through page 1 and the hallway twice and the show scrubbed both
  ways, shots); `tools/loafprobe.py` (long animation frames between two positions, optional CSS); `phone_stage.py
  --stage hall2` scrubs the show (shots at its stops, fps both ways); `hall3chrome.py` is superseded.

### The name, the top bar and the title block: structure notes (26 Nov, Part 5)
- **The mark (WM.IO):** `site/js/brand/mark.js` (`MARK`: half-wave 25 x 65, W from the top, the reset at x 100, M from
  the bottom, the dot r 4.5 on the baseline at 217.5, the I at 235, the O 56 x 65 centred at 278; stroke 5.5; `markSVG`,
  `wavePoints` for morphing, `WAVE_LEN` 673 units). `tools/brand.py` writes the same mark to `site/media/brand/`:
  `wmio-mark.svg` (small), `wmio-mark-hero.svg` (λ 50.0 over one wavelength, A 65.0 beside the height, RESET · W → M
  under the reset; DM Mono Light embedded), `wmio-favicon.svg` (the favicon, ink on paper, paper on ink in a dark tab);
  and `site/js/brand/lettering.js` (Hershey Sans 1-stroke, the glyphs of the sentence only, from
  `tools/sources/singleline/`, git-ignored). Preview: `site/dev/brand.html`.
- **The arrival (`site/js/enter.js`, rewritten; beats `B`, seconds):** one SVG layer (`.arrive`, z 53, over the curtain,
  difference-blended) draws everything. 0-0.4 the strip's mark morphs into a straight line as long as its wave, on the
  strip's bottom line (2 cells); 0.35-1.1 it snakes along the grid at right angles (`toText`: along the strip's bottom
  line, down a column, along a row above the sentence if it must, down the column a cell left of the sentence, along the
  baseline), each straight run lighting its whole grid line (2 px, 0.55) from when its head enters until its tail
  leaves, then fading over 0.9 s; 0.4-0.95 the strip's boxes slide over (`engine/strip.js` `layoutStrip(k)`: each edge
  moves between its column beside the mark and its column without it); 1.05-2.25 it pours into the pen and writes the
  sentence in Hershey strokes, fitted to the real sentence's width and cap height; 2.0-2.4 they settle into Newsreader;
  2.3-2.48 the full stop drops (the mark's dot), then the real stop; 2.45-3.0 the line snakes on (`toBeacon`: along the
  baseline, down, along a row, down the column a cell right of the beacon) and coils clockwise into a ring of one cell
  round the beacon (the O); 3.0-3.15 an I shrinks into the beacon's dot; 3.1-3.5 the second line (serif, 1 cell, flagged
  Draft). Return visits run it at 1.25x. A tap (click, Enter, Space) skips to the end; a scroll, swipe, Arrow Down,
  Page Down or End enters at once. `html[data-arrive]`: wait, run, dot, done, home.
- **Going home (`HB`, 1.3 s):** the ring unwinds into the column a cell right of the beacon, down to the title block's top
  line, along it over the mark's cell (`home()`; a detour above the block when that column falls inside the line's
  length), and morphs back into the mark in the cell, while the curtain opens (from 0.12 s) and the title block fades in
  (0.25-0.65 s); then the cell's own SVG takes over (`.tb__mark`).
- **Scrolling back to the very top** (`watchTop`): at scrollY 0 for 320 ms, having been more than half a screen down,
  not during a hyperdrive: the scroll locks, the curtain closes (0.6 s), and the arrival runs from the title block
  (`toText('tb')`); a tap sends the mark home again. Not with reduced motion.
- **The top bar:** `.strip__mark` (the small mark, 0.6 cell tall, in the first 4 columns on phones, 5 on desktop) only
  until the arrival starts; the boxes are placed absolutely on `--c0`/`--c1` (whole columns at rest). "Take a shortcut
  →" (signed off), its jump shows "Cutting to the chase." over the hyperdrive on a paper backing (`hyper__words`,
  `playHyperdrive({ words })`; not on "Back to the start").
- **The title block:** a new first cell, `.tb__cell--mark` (`role="img"`, the name as its label). Phones: mark 3 (the mark
  0.45 cell tall, the values' cap height), page 5, title 6 (it gave up two), print 4 (18 cells; a 4-cell page cell left
  "01 / 08" 4.5 px from its line, under the half cell); desktop, two
  rows: the mark's cell 6 x 6 cells spanning both rows (the mark 1 cell tall); short desktop windows (one row): 5 x 3
  cells (0.8 cell tall).
- **Dark mode's gate is black now:** the difference curtain came out light grey over the dark page and the gate's words
  (light in both themes) vanished on it; in dark mode the curtain is plain black under the (dark) top bar.
- **First paints, out of the motion:** the mark holds still for 0.15 s before it moves (the gate's own first paint, about
  100 ms in real Chrome, lands on a still frame); the real sentence, its stop and the second line are painted from the
  start at opacity 0.002. (Tried and reverted: page 1 painted under the gate at opacity 0.002 moved the curtain-opening
  cost into every frame of the arrival: 96 fps, a 317 ms frame at 2160 x 1147.)
- **Reduced motion:** the gate shows its end state at once (the sentence, the beacon's ring and dot, the second line),
  the top bar at full width, the mark in the title block; any input enters at once; no replay at the top.
- **Every tool that enters the page presses Enter twice** (the first now skips the arrival; 28 tools patched).
- **Tools:** `tools/gateaxe.py` (axe on the gate's end state, light and dark, reduced motion); `tools/topbarshot.py` (headless or `--real` Chrome; shots through the arrival, a tap mid-arrival, entered,
  the replay and home, the jump; fps during the arrival and going home; what the arrival reports: grid-line offsets of
  every run, the strip's share, the title block's cells and the strip's boxes in cells and whether any text is clipped).

### Parked fixes: structure notes (27 Nov, Part 5 "Parked small fixes" + "The name's size: option B")
- **The mark at option B's size:** the wave 4.5 cells wide everywhere (`--mk` = 4.5rem / 200 per mark unit); the I and
  the O 0.85 of the wave's height (55.25 units: ".IO" 1.24 cells), standing on the wave's baseline (`MARK.IOH`, `X_O`
  271.55, `OW` 47.6, `W` 295.35 in `site/js/brand/mark.js`; `IO = 0.85` in `tools/brand.py`, which rewrote
  `wmio-mark.svg`, `wmio-mark-hero.svg` and the favicon). The template's two inline marks carry the new geometry.
- **The title block** (`site/css/page-00-grid.css`): two rows (six cells) at every size. The mark's cell spans both
  (`.tb__cell--mark`, its wave's baseline on the cell's third line, centred), "design and engineering" (`.tb__tag`, the
  keys' grey label type: 0.4375 cells on phones, 0.375 on desktop) under it, its baseline on the fourth line, centred.
  Phones: mark 8 | page over title 6 | scale over print 4 (an 8-cell mark beside sheet and scale, 5, and title and print,
  6, would need 19 of the 18 cells; scale shows on phones again). Short desktop windows (≤ 860 high): mark 10 | page over
  scale 6 | title over print 7. Tall desktop: mark 10, then the cells as before (project, page, title, scale; drawn,
  checked, approved, rev, print).
- **The top bar at the start of the arrival:** four cells tall. The bar's own box stays two cells (the pages measure
  it); `.strip::after` draws the extra two cells under it (behind the boxes), the boxes, their rules and the base line
  run the full height; `--sk` (the mark's share, set by `engine/strip.js layoutStrip`) takes it back to two cells as
  the boxes slide over (0.4-0.95 s), so the replay and reduced motion keep two cells. The mark's columns are its
  title-block cell's width (8 on phones, 10 on desktop: `markCols`), the mark in the same place in them as in the
  cell, so the arrival starts on the same name it ends on. `enter.js`: the line straightens onto the bar's fourth line
  (`yS` 4 cells); the I and O drawn at `IOH`; the morph's tail folds into the wave's end at rest (it drew a line under
  ".IO" at t = 0, before this pass too).
- **WM.IO:** the tab says "WM.IO, a design and engineering studio" (MARK_LABEL); the project cell "WM.IO".
- **The favicon** (`site/media/brand/wmio-favicon.svg`, from `tools/brand.py`): square (128), the mark's own curves
  from x 50 to 150 (the W's last wave, the reset, the M's first wave), stroke 11 (1.4 px at 16 px), on the paper plate
  (ink plate in a dark tab); already linked in `src/index.template.html`.
- **Short screens under the taller block** (the type gate found three layouts that no longer fit; Wajih: "on short
  screens only"):
  - page 1, short desktop windows (≤ 860 high): the drum's meaning sits under WE (same row, WE's column) instead of
    under the drum (`page-01.css`), clear of the block;
  - the hallway, portrait: when no frame size fits between the strip and the band (375 x 667), compact spacing: no
    padding under the band's words (`.dive__bands.is-compact`), the frames' block half a cell from the strip and the
    band instead of a cell (`dive.js placeBand`, `solvePortrait`);
  - page 5: each room's figure sized from its own line (`--t5-fig-h` per `.t5r`; all three were sized from one room's
    line), and compact (the lines a cell nearer the strip, the figures a cell nearer their lines: `.t5__stage.is-compact`)
    only when the website's blocks don't fit its page.
- **Tools:** `tools/namecheck.py` (one size at a time: the bar at the start of the arrival and the title block after
  the tap, with gridcheck's and overlap's own measurements, the option B sizes, nothing under the bar or the block,
  WM.IO's texts; `--favicon` renders it at 16 / 32 / 64 px, light and dark). `tools/overlap.py` is importable now
  (a `__main__` guard).

### The security page, beat 1: structure notes (27 Nov, Part 5 "The name's size, and the security page as demoed")
- **Where it lives:** in the hallway (`site/js/page01/dive.js`), after the walk: `DIVE` 6.9 (was 5.4), `BEAT1` 5.0-6.5
  nominal screens (1.5), `B1` = { fill 0.46, mouth 0.58, pins 0.9 } (the reference demo's place1 shares). New stops B1H
  (halfway to the lock), B1F (the face fills the screen), B1K (the keyhole), B1P (under the middle pin), B1E (the dark
  end); LOCK = the hand-over done. The warm-up's hall depths keep their screens.
- **The push at walking speed (27 Nov, second pass, Wajih):** the push (0 .. B1.fill) starts at exactly the walk's own
  speed, then slows on the log scale as before. Its speed at the start is d0 ln(d0 / dFill) per its length; the walk's
  is (z0 - zEnd) / 3.8 screens; `dive.pushLen()` (set in `layout`, per screen) is the length that makes them equal:
  1.66 screens on the S23 (384 x 734), 1.77 at 1440 x 900, 2.03 at 375 x 667, 2.73 at 2160 x 1147 (the nominal was 0.69).
  The rest of the beat keeps its nominal 0.81 screens. page.js maps the scroll onto the dive's nominal beat, like frame
  5's hold (`beatAt` / `beatOf` inside `hallAt` / `hallOf`), and sets `HALL`, `SCROLL` (15.71 on the S23, 16.78 on the
  laptop), `R.end` / `R.dive` and the section's height (`.p1` inline, `(SCROLL + 1) x 100lvh`; the CSS 1574lvh is the
  nominal fallback) in `layoutDive`; when the height moves, every ScrollTrigger measures again once (`refreshIfMoved`).
  `__p1.scroll` is a getter now; `__p1.pushLen()`.
- **The pins ride the key (27 Nov, second pass, Wajih):** `setLock` (opt-b.js's, changed). Measured on the model: each
  key pin's top is at 13.8 mm, the shear line at 16, so the right key lifts each stack 2.2 mm (`PIN_LIFT`, manifest
  pins.lift) from its modelled place, and the model's key sits that much under the pins' feet. A pin's foot is on the
  real key's profile + 2.2 where the key is under it (never under its rest, at most 8), else at rest, `PIN_REST` -4 mm
  (its spring pushes it down into the keyway; the five tips rest level, above the key's tip at -5.8, 5 mm over the
  camera's path); its driver rides on it. No key: the pins hang 5.8, 4.4, 3.0, 1.6, 0.2 mm under their modelled places;
  as the key comes in each rides its teeth (up to 3.1-4.2 mm over) and, fully in, all five sit on the shear line (+2.2).
  Pages 3 and 4 build their own lock and never call it.
- **`beat1(p)`:** from where the walk ended (the camera's own position and straight-ahead view, so no cut) the distance
  to the face's middle falls as `d0 (dFill / d0)^t` while the line of approach swings onto the face's axis and the eye
  turns to the face (eased 0.05-0.85, as the demo). `dFill`: the face 92% of the screen's height (the brief's and the
  demo's number; `endFaceHeight`'s 0.92 is of the room between the chrome, about half a phone's screen). Then the
  demo's numbers exactly, in the lock's model mm (`MM()`: STL x across, y out of the face, z up; lock3d's space is
  (-x, z, y) of it): onto the mouth [-1, 6, -9], down the keyway to y = -70, out to -86; the key's tip 3 mm behind the
  camera (`off = y + 83`), `setLock(off)` = opt-b.js's (the plug's turn left out), `keyProfile` verbatim. The look
  (`lockLook`): the door's brass (#D8B26A, metal 1, rough 0.26, the studio HDRI) → lab B1's brass / steel / dark
  (manifest materials), the room light (RoomEnvironment PMREM) past half; the headlamp (a PointLight at the camera,
  decay 1, intensity and range scaled by the lab's world unit `b1.U` = half the lock's largest side, mm), the rim, the fog
  (#0A0A0B, the demo's near/far in lab units). The lens: the near plane follows the distance to the face (0.05 x),
  down to the lab's 0.0015 units inside; the far plane only as far as is seen.
- **Two changes from the demo (found by flicker.py, both one-frame jumps):** (1) the demo swapped the studio light for
  the room light in one step at half way in: here the studio light dims to `ENV_LOW` 0.04, the swap happens there, and
  the room light comes up from 0.04 x `ENV_ROOM` 2.6 (the room light's intensity that matched the studio light's
  brightness at the swap, measured on the laptop) to 0.55: a smooth dip into the keyway instead of a jump. (2) Past the
  last pin every light (room light, rim, headlamp) fades to dark by the plug's back (`(1 - exitK)^1.5`, exitK over
  0.9-0.965) and the fog closes evenly on a log scale to 0.06 units, its near edge from a fifth to a twentieth (the
  keyway's walls, 3-4 mm away, sat inside the demo's near edge, bright, and vanished in two frames as the camera left
  the plug).
- **The lock's own scene (`lockScene`):** the door's lock moved out of the hall's scene and is drawn right after it
  (`autoClear` off, the hall's depth kept), so beat 1's fog and lights never touch (or recompile) the hall's materials.
  From 0.85 of the push (the camera on the lock's axis, so the face hides the housing's sides) the lock is drawn over the
  hall whatever its depth (`clearDepth`): the keyway shows the lock's own inside, never the door's leaf, whose plane
  cuts through the lock's body (the demo showed the flat leaf in the keyhole, then the inside popped in). The hall stops
  drawing once the face covers the whole screen (`faceCovers()`: its solid part, clear of the notch and the top slots)
  or at the mouth; inside, the canvas is cleared to #0A0A0B.
- **The lock:** `lockParts.build({ inside: true, solidInside: true })`: the key pins, drivers and key solid (creased
  normals, the brass / steel / dark materials; at the door all three are the door's brass, so the door looks as before);
  the key's holder is taken out of the lock (unseen: you are the key; its profile only). `lock3d.js`: `solidInside`
  (default off: pages 3 and 4 build exactly what they built), each solid's `userData.part`.
- **`lock-parts.bin` (`tools/lock_web.mjs`):** every part now carries positions and indices; the key pins, drivers and
  key are meshoptimizer-simplified to 0.025 mm (absolute): pins 11,232 → about 890 triangles each, the serrated driver
  67,968 → 2,876, the others 276-552, the key 1,416 → 516 (10,100 added in all); 377 KB → 539 KB. The housing, cap,
  clip and plug (meshes, edges, lod) and every part's edges are byte-identical to before.
- **The hand-over to page 3 (REPLACED 28 Nov by beat 2; the fade now follows beat 2's end, see beat 2's notes):** `XRAY` 6.6-6.8: from beat 1's dark
  end a plain fade (the blue quad and the X-ray lock, as before, through `xCam`) to page 3's first frame as it is today;
  page 3 takes over on that frame. Beat 2 replaces this.
- **Checks' view:** `drawn()` reports the lock as a shape (`door:lock`) only while its face fits between the strip and the
  title block (`beat1.object`); past that it is the space (like the hall's walls); inside, nothing. `render()` returns
  `beat1` (p, step, inside, hall, object, facePx, off, lifts, face share); `dive.beat1()`, `dive.lockScene()`.
- **Reduced motion:** no flight: after the hallway's still drawings, the lock's face filling the frame
  (`dive.faceStill`, a JPEG at B1F), on #0A0A0B, its opacity following the scroll (face, then a cross-fade to the dark).
- **Tools:** `tools/beat1probe.py` (shots and what beat 1 reports at stops; `--scrub`: the camera forwards vs backwards
  in 300 steps, the largest step and turn, each pin's largest lift; `--reduced`); `overlap.py --stops` and the beat-1
  lock as a drawing; `flicker.py --beat1` (CDP zoom; the push, the keyhole, the pins, the dark end and the fade, plus a
  hallway stretch for reference).

### The security page, beat 2: structure notes (28 Nov, Part 5 "The name's size, and the security page as demoed")
- **Where it lives:** in the hallway's own scene and camera (`site/js/page01/dive.js`, `beat2()`), right after beat 1:
  `DIVE` 9.9 (was 6.9), `BEAT2` 6.5-9.5 nominal screens (3, 1:1 with the scroll, so page.js maps it as it is), `B2` =
  { back 0.12, a 0.30, b 0.84, head [0.45, 0.51] }. Why there: beat 1 ends inside the lock's own scene (`lockScene`) and
  camera, so the room drawn there needs no hand-over at all (no second canvas, no matched frame): the seam is the
  same camera stopping and backing up. New stops B2K (backing out of the keyhole, B3's p 0.37), B2H (the headline, 0.48),
  B2W (mid-wave while circling, 0.70), B2E (beat 2's end, 0.84); LOCK the hand-over done. Page 1's scroll: 18.71
  screens on the S23 (was 15.71); the CSS fallback 1874lvh.
- **The seam (0 .. back):** from beat 1's dark end ([-1, -86, -9] mm, the key fully in, every pin on the shear line) the
  camera backs up the keyway to B3's [-1, -30, -9], looking down it ([-1, -146, -5] → [-1, -80, -4]; the demo's place2
  BACK). Beat 1's light and fog closed on curves; here the same curves run back: the lights come up as t^1.5, the fog
  opens on a log scale from 0.06 to 3.2 lab units, its near edge from a twentieth to a fifth (then B3's 0.6). Beat 1
  eases out and beat 2 eases in, so the camera comes to a stop at the seam and backs away: no jump, no turn.
- **Then lab B3 exactly (back .. 1 = B3's p 0.30 .. 0.84, mapped evenly):** opt-b.js "tesseract"'s camera keys (the
  hold in the keyway to 0.32, out through the keyhole and the pull-back to [-150, 300, 150] looking at [0, -36, 60] by
  0.46, the hold to 0.54, the orbit 1.1 rad to 0.84), `setLock(0, ease(span(p, 0.56, 0.66)))` (the plug, the key and the
  key pins turn together about the plug's axis; the drivers stay), and `setRoom(show 0.30-0.46, wave 0.56-0.82, fold
  ease(0.32-0.90) x 0.35, collapse 0)` verbatim. The camera faces the lock the whole way (it only ever backs away).
- **Out through the keyhole (my call, flicker):** B3's keys run in a straight line from the keyway to `far`, which
  crosses the face's plane about 15 mm off the keyway, through the solid housing (flicker.py: the metal's inside and a
  43-grey-level frame; the lab and the demo do the same). The same keys, times and ends; between 0.32 and 0.46 the
  camera leaves along the keyway's own line, through the key it was (the bow stands 37.5 mm out of the face, a plate
  6.6 mm thick round the keyway's line, x -4.3 .. 2.3 mm), and moves aside only once clear of it (45 mm out, 0.384 of
  the way in time), eased in time over the rest (a share that followed the distance out stacked two speed peaks: 6 x
  the speed, 7.5 degrees of turn a step). The real key stays unseen while the camera is in it (as in beat 1) and fades
  in as the camera pulls away (45 .. 110 mm out), on its own copy of the steel (`room.keyMat`; the clip keeps the
  shared steel), so the camera never crosses its surface in view.
- **The room in the lock's own space:** the lab's world is the model turned to (-x, z, y), centred on the whole lock's
  box and scaled to 2 units: the same axes as lock3d's lock space. So the room is a group in the door lock's body (mm)
  at the box centre `room.c` = (0, 19.8, -21.3) mm, B3's numbers unchanged (190 mm apart, 0.92 of that up), its turn
  about that centre; each copy is scaled about that centre and its plug and key turned about the plug's axis, exactly
  as the lab composes them (instance matrix: housing and cap `p - s c`, plug and key `p - c + (1 - s) q c`). 74 copies
  (5 x 3 x 5 less the real lock), four `InstancedMesh`es (housing, plug, cap, key) sharing the door lock's own solid
  geometry, B3's two Lambert materials (brass #A88445, steel #9A9DA1): 4 draw calls, no per-copy material; 14,090
  triangles a copy, 1,042,660 in all (lighter than the lab's, which instances the full STLs). A copy never closes in on
  the camera (B3's rule: under 0.45 of a step it is scaled to nothing).
- **B3's light:** its hemisphere light (#FFF4E0 / #0A0A0A, 0.5; always in `lockScene` at 0 outside beat 2, so no shader
  changes its light count), the rim (0.9) and the headlamp (0.1, 2 units, as beat 1 scales them), the room light on the
  real lock at 0.55, and (found comparing with `labshot.py --codes B3`) the room light on the copies too: this three.js
  lights Lambert materials with `scene.environment` at `environmentIntensity`, which the lab sets (0.55); `lockScene.environment`
  = the room light at 0 outside beat 2 (only materials without their own envMap take it: the copies; the door's all have
  theirs). The door's light is turned (`envMapRotation` 1.5 pi, so its face caught the studio's soft boxes); lab B3's
  isn't: the turn unwinds a quarter turn while the camera pulls back (0.32-0.46), and is put back on leaving beat 2.
  B3's fog (#0A0A0B, near 0.6, far 3.2 → 14 units over 0.30-0.46) in the lab's units (`b1.U`). The site's exposure
  (1.08) is kept (the lab's 1.1).
- **The lens:** from the site's (as beat 1 left it) to B3's (62 degrees, x 0.85 wide, x 1.12 portrait) over 0.30-0.46,
  as the demo. The near plane stays the keyway's (0.0015 units) until the camera is out of the face, then 0.03 of the
  distance to the face; the far plane twice the fog's far edge. Restored (`lens0.fov`) in beat 1 and before.
- **The key:** in beat 1 it is out of the lock (unseen: you are the key); beat 2 puts it back in the body (fully in,
  `setLock(0, turn)`) and `leaveRoom()` takes it out again, hides the room and zeroes its lights, so scrolling back
  into beat 1 is exactly beat 1.
- **The headline:** the lab's "One door is never the only door." with its eyebrow "Outside · every lock you own" (drafts,
  flagged: `.dive__head`, `roomHeadHTML()`), placed as the hallway's opening line (1 cell in on phones and 5 on desktop,
  1 cell (phones) or 3 (desktop) under the strip; its width in whole cells; balanced over lines where it must wrap;
  half a cell between the eyebrow and the line (small type ends on a half line); a cell of padding under the line so
  the backing clears its descenders: the `.gt` box ends on the baseline):
  mono label (0.625 / 0.5 cells, 500), the line in Newsreader 420 at 2.5 / 3.5 / 4.5 cells (phones / desktop / large),
  on a dark frosted backing a cell round its words (rgba(10, 10, 11, .72), blur 10 px). On while B3's p is in
  0.45-0.51 (the hold), with the site's timed word fade (0.26 s: a paused frame never shows half a word), so it is
  gone before the circling starts at 0.54 (approved: out over 0.51-0.54). The checks see no shapes in beat 2
  (`drawn()`: the room is the space, as the hall's walls; the headline stands on its own backing).
- **The hand-over to page 3 (REPLACED 28 Nov by beat 3; the fade now follows beat 3's end, see beat 3's notes):** `XRAY` 9.6-9.8: from beat 2's end
  (held 0.1 screens: the room turned, every lock unlocked) the same plain fade as before (the blue quad and the X-ray
  lock, through `xCam`) to page 3's first frame as it is today; page 3 (round 9's lockworld) takes over there. It
  replaces beat 1's temporary fade (6.6-6.8, gone).
- **Reduced motion:** after the lock's face still, a still of the room (`dive.roomStill`: the hold, B3's p 0.50, a JPEG)
  with the headline over it in the flow (`.p1-hall__room`, wrapped and balanced), the picture's opacity following the
  scroll to the dark as beat 1's (1 → 0.37 → 0).
- **Page 3 starts at the door (28 Nov, Wajih):** beats 1 and 2 are the security page, so the strip and the title block
  say "03 The lock" from beat 1's start (the walk's end, standing at the shut door), not "02 Hallway". A marker
  `#page-03-door` (`data-sheet="03"`, the section's own title and roles) inside page 1's section, placed by page.js at
  `STOPS.DOOR` (reduced motion: at the lock's face still). Two elements now carry 03 (the marker, then round 9's
  `#page-03` section, which keeps its id, styles and tools), so main.js maps the strip's segments by page number
  (`segOf`), fills each from its page's first element (`firstOf`), and a `#page-NN` link (the strip, a deep link)
  lands on that first element (`landOf`): "03 The lock" lands at the door.
- **Checks' view:** `render()` returns `beat2` (p, b3, step, head, turn, fov, copies, tris) and `head`; `dive.beat2()`,
  `dive.room()`. **Tools:** `beat1probe.py` prints beat 2 at every stop, `--scrub2` (beat 2 forwards vs backwards) and
  `--reduced` shoots the room's still; `flicker.py --beat2` (the seam, the pull-back, the headline, the wave, the end and
  the fade, each with its largest single-frame change).

### The security page, beat 3: structure notes (28 Nov, Part 5 "The name's size, and the security page as demoed")
- **Where it lives:** in the hallway's own scene and camera (`site/js/page01/dive.js`, `beat3()`), straight on from beat 2's
  last frame (no cut): `DIVE` 12.9 (was 9.9), `BEAT3` 9.5-12.5 nominal screens (3, 1:1 with the scroll), `B3` = { square
  0.2, fly [0.2, 0.18, 0.14], burst [0.3, 0.42], build 0.56, dur 0.12, push 0.52, fog [0.5, 0.9] } (the reference demo's
  place3 / setChaos shares). New stops B3S (the room squared, the camera pulled back: 0.2), B3F (flying home: 0.3), B3C (the
  chaos: 0.5), B3B (the lock building itself: 0.78), B3L (one lock, centred: beat 3's end); LOCK the hand-over done. Page 1's
  scroll: 21.71 screens on the S23 (was 18.71), 22.78 at 2160 x 1147; the CSS fallback 2174lvh.
- **The seam:** beat 2 ends with the room turned by lab B3's fold at its p 0.84, `foldAt(B2.b)` = ease(0.897) x 0.35 =
  **0.348441** (the same value read off the room's live quaternion at B2E, 384 x 734 and 2160 x 1147). Beat 3 unwinds from
  that same expression (`foldAt`, shared by both beats), so the seam has no jump; the demo's 0.34 was close but not exact.
  The camera, lens (B3's 62 degrees x 0.85 / x 1.12), light, fog (near 0.6, far 14 lab units) and key all start exactly
  where beat 2 left them.
- **The room squares up, the camera pulls back (0 .. 0.2):** the fold unwinds to 0 while the camera backs away onto the
  lab's A frame's line (opt-a.js: yaw -0.62, pitch 0.34, out of the lock's box centre), the eye onto the lock's middle, the
  lens easing to 28 degrees, the fog opening round the room (its near side clear, its far side falling into the dark).
  **Two of my calls here:** (1) the wide view is as far back as shows the *whole* room in the room between the strip and
  the title block (a cell clear; the room's box fitted on screen by bisection, `aFrame()`), at least the demo's 3.4 x the A
  distance: the demo's 3.4 x cut the room off at every edge on both sizes (`tools/shots/beat3/demo/`); it is 10.6 x the A
  distance on the S23, 7.3 x on the laptop. (2) The distance changes on a log scale (the room shrinks on screen at an even
  rate, as beat 1's push grows the lock) and the line of sight swings round onto the A line (a slerp; the two lines are
  about 110 degrees apart), the same ends and times: the demo's straight lerps, stretched to 10 x, whipped past at 0.50
  hall units and 12.7 degrees a scroll step on the S23; now 8.2 degrees at most (the demo's own swing in its 0.2 of the beat).
- **Fly home (setChaos):** each copy leaves at 0.2 + 0.18 x (its distance's share: nearest first) and takes 0.14 (eased) to
  land; it flies on the straight line home plus an arc (sin(pi e) x 0.55 of a step, up for the middle and top rows, down
  for the bottom), turning one full turn about the vertical (alternate copies opposite ways), full size (never shrinking:
  only B3's own rule scales a copy to nothing within 0.45 of a step of the camera), and lands square on the real lock (its
  plug and key at 90 degrees, as beat 2 left them). Instance matrices: housing and cap p + q s (x - c); plug and key
  p + q (s qT x + (1 - s) qT c - c), which is beat 2's own composition at q = 1, so nothing moves at the seam.
- **Chaos:** the real lock bursts over 0.30-0.42 into its 15 solids, each out to its own seeded place (the demo's seeds:
  77 + n x 13 in its part order; 1.3-2.9 lab units in a seeded direction), turning about a seeded axis (2-4.5 rad, plus a
  slow drift); the plug, the key and the key pins ride the plug's turned frame (as in the demo). Each copy bursts the moment
  it lands into its big parts (housing, plug, cap, key; seeds 1000 + n x 7 + part): a quick eased burst (2.2 lab units over
  0.25) and a steady drift (26 lab units per beat), tumbling about its own axis. **My call (flicker):** the camera's fog
  alone left the debris between the camera and the lock bright as the camera pushed in through it (48 grey levels a frame,
  energy 13.4). So from the chaos's height (0.5) each piece darkens into the dark as it drifts past a radius round the lock
  that closes from the whole room (1.2 x its radius) to just past the lock (+ 4 lab units) by 0.9, over a 4 lab unit band
  (per-instance colour, `instanceColor`, set to white when the room is built, so no shader changes mid-scroll; beat 2 resets
  it to white); a piece fully dark is no longer drawn, and once every piece is gone the room stops drawing (by B3B). Build
  stretch after: 12.6 / energy 2.9. Everything is a function of the scroll alone: scrubbed forwards and backwards, the
  camera and a checksum of every instance matrix and every real part's place match exactly (`beat1probe.py --scrub3`).
- **One lock:** from 0.56 the real lock's parts come home in the manifest's order (housing 0, plug 1, clip 2, the five key
  pins together 3, the five drivers 4, cap 5, key 6), one order every (1 - 0.12 - 0.56) / 6 = 0.0533 (the demo's 0.055,
  fitted so the **key seats exactly at the end**, Wajih's yes), each taking 0.12 (eased), each to exactly its place (the
  burst is applied in its holder's frame: `L = G^-1 F B F^-1 G`; the key pins keep their lift on the shear line, the plug
  its turn). The camera pushes straight in down the A line from 0.52 to the end (log scale) to the A frame: lens 28, yaw
  -0.62, pitch 0.34, the whole lock (its parts' box) fitted between the strip and the title block a cell clear, centred on
  the screen's middle. **My call:** the fog closes round the lock (its near edge just past the lock, dark 6 lab units beyond
  it), not the demo's 14 lab units from the camera, which left the finished lock nearly black at the A distance on a phone
  (`tools/shots/beat3/demo/384x734_q1.00.png`; the demo got away with it because its beat 4 draws in fog-free scenes).
- **The light:** beat 2's as it ended (the room light 0.55 unturned, rim 0.9, hemisphere 0.5, headlamp 0.1); the real lock
  keeps lab B1's inside materials (the darker brass: still a look-pass note, "For the look pass").
- **The hand-over to page 3, TEMPORARY (until beat 4, the three views):** `XRAY` 12.6-12.8: from beat 3's end (held 0.1
  screens: one lock, centred, the key in it) the same plain fade as before (the blue quad and the X-ray lock, through
  `xCam`) to page 3's first frame as it is today; page 3 (round 9's lockworld) takes over there. It replaces beat 2's
  temporary fade (9.6-9.8, gone).
- **Reduced motion:** after the room's still, a still of the one lock, centred, the key in it (`dive.oneStill`: beat 3's
  last frame, a JPEG; `.p1-hall__one`), its picture's opacity following the scroll to the dark as the others (1 -> 0.37 -> 0).
- **Checks' view:** `render()` returns `beat3` (p, step, fold, fov, landed, home, object, roomDrawn, dA, dWide, fog);
  `drawn()` reports nothing while the room, the flight and the chaos are the space (as beat 2's room), and the one lock as a
  shape (`lock:one`, its 15 parts' box) once every part is home. `dive.beat3()`, `dive.chaosSum()`, `dive.foldNow()` (the
  room's fold read off its quaternion), `dive.oneStill()`. **Tools:** `beat1probe.py` prints beat 3 and the live fold at
  every stop, `--scrub3` (beat 2's end through beat 3 to the hand-over: the camera and the chaos checksum forwards vs
  backwards; `--scrub2` now stops at B2E), `--reduced` also shoots the one lock's still; `flicker.py --beat3` (the seam, the
  squaring pull-back, the fly home, the chaos, the build, the end and the fade).

### For the look pass (logged 28 Nov, Wajih)
- **The real centre lock is darker than its copies (beat 2, the room of locks).** The real lock wears lab B1's inside
  material (MeshStandard brass #B88F48, metal 1, roughness 0.42, steel #B8BBBF, dark drivers #5A5E62, on the room light
  at 0.55), carried over from beat 1; the 74 copies wear lab B3's lighter Lambert brass (#A88445) and steel (#9A9DA1),
  lit by the hemisphere light, the rim and the room light. A fully metal brass with no bright reflection to show reads
  as a dark brown block among bright gold copies (the lab's B3 has the same contrast: `tools/shots/beat2/lab/B3_0840.png`
  next to `tools/shots/beat2/final/384x734_B2E.png`). To decide in the look pass: bring the real lock's brass towards
  the copies' (or the copies' towards it), or keep the real one apart on purpose.

### Edges to watch in the final full check
- **Routecheck, the arrival's replay (logged 27 Nov, after `ae75e24`):** once, in the full routecheck run after beat 1's
  second pass, 1280 x 720 dark stopped the run: scrolling back to the top (after two screens down) didn't restart the
  arrival within 8 s (`Page.wait_for_function: Timeout 8000ms exceeded`, `window.__arrival.state() === 'run'`). It
  didn't come back in two single-size re-runs of 1280 x 720 or in the full re-run (every size's replay measured). The
  suspect is that pass's new `ScrollTrigger.refresh` when page 1's height moves (`refreshIfMoved`, page.js), which it
  calls once a few frames after load; not confirmed. In the final full check: run routecheck at every size more than
  once and watch for it; if it comes back, check whether the refresh lands during the scroll back to the top
  (`watchTop` in enter.js needs scrollY 0 for 320 ms after being half a screen down).
- **`ERR_CONNECTION_REFUSED` on one request under a burst** (the plain local server's connection queue; a different size
  each run, clean on re-run): an edge for hosting, not the site (see the parked fixes' entry in the log). 28 Nov: traced
  once to the first load in a fresh browser (`fonts/dm-mono-300.woff2` refused); it lands most often on 384 x 734 light,
  the first job of every routecheck run.

### Take 2 log
- **The security page, beat 3: fly home, chaos, one lock (28 Nov).** Built as in "The security page, beat 3: structure
  notes": straight on from beat 2's last frame in the same scene and camera; the room squares up (from beat 2's real last
  fold, 0.348441) as the camera pulls back onto the A frame's line to see the whole room; the copies fly home on arcs,
  nearest first, full size, one full turn each, and burst as they land; the real lock bursts into its 15 parts and comes
  home part by part in the manifest's order, the key seating exactly at the end, as the camera pushes in to the A frame; 3
  screens, scrubbed both ways. Beat 2's temporary fade is gone; the temporary fade into page 3 now follows beat 3's end.
  Shots: `tools/shots/beat3/final/` (384 x 734 and 2160 x 1147 at B3S, B3F, B3C, B3L), `reduced/`
  (`384x734_reduced_one0-3.png`), `demo/` (the reference demo's beat 3 at 0, 0.2, 0.36, 0.5, 0.7, 0.85, 1, staged locally
  in the git-ignored site/dist and not committed), `probe*/`, `flicker/` (before the dark round the lock), `flicker2/`
  (final), `grid/`, `overlap/`, `typecheck*/`.
  - **Type gate** (`typecheck.py`, one browser; 384 x 734, 1440 x 900, 2160 x 1147, 360 x 800, 375 x 667, 430 x 932, light
    and dark; B2E, B3S, B3F, B3C, B3B, B3L, LOCK): 84 frames, **0 machine failures** (re-run on the final build: 0).
  - **Gridcheck** (the same stops; the 7 phone sizes and 2160 x 1147, light and dark): **0 off the grid** (worst 0.072 px).
    **Overlap** (same): **0 in 5,241 pairs**.
  - **Flicker** (`flicker.py --beat3`, real Chrome, 2160 x 1147 @1.333 set through DevTools): energy (p95) / largest
    single-frame change: the seam from beat 2 2.39 (10.5) / 16.3 (no jump: about 0.3 a frame across B2E, rising smoothly
    as the pull-back starts); the squaring pull-back 8.25 (21.7) / 29.2 (a smooth bell, the beat's fastest motion: the
    demo's 0.2 of the beat for a 110-degree swing and a 7-10 x pull-back); the fly home 1.40 (3.0) / 3.9; the chaos 2.76
    (4.4) / 5.4; the build 2.93 (9.1) / 12.6 (was 13.4 (43.1) / 48.1 before the dark round the lock); the end and the fade
    0.75 (4.0) / 23.4 (the chrome turning light at the temporary fade, as beat 2's).
  - **Scrubbed** (`beat1probe.py --scrub3`, 384 x 734, 300 steps from just before B2E to the hand-over): forwards and
    backwards give the same camera (difference 0) and the same chaos checksum (every instance matrix and every real part's
    place; difference 0 over 301 steps). Largest camera turn 8.2 degrees a step (the swing onto the A line).
  - **Routecheck** (14 sizes, light and dark): 27 of 28 clean, every route on the grid; 393 x 852 dark failed on one
    `ERR_CONNECTION_REFUSED` (the plain server under a burst, the known edge); re-run: clean (light and dark).
  - **Reduced motion** (384 x 734): after the room's still, the one lock's still, its picture 1 -> 0.37 -> 0 as it scrolls
    by. No console errors anywhere.
  - **My calls:** (1) the pull-back as far as shows the whole room (the demo's 3.4 x the A distance cut it off); (2) the
    pull-back and the push on a log scale, the line of sight slerped onto the A line (the straight lerps whipped at 12.7
    degrees a step); (3) the fog round the lock at the end (the demo's left the finished lock nearly black); (4) the debris
    darkens into the dark round the lock from the chaos's height, and the room stops drawing once it is all gone; (5) the
    whole lock fitted between the strip and the title block a cell clear, by its box (not a sphere), centred on the
    screen's middle; (6) the build's step 0.0533 (the demo's 0.055) so the key seats at the end, then the 0.1-screen hold.
  - **Heavy for the S23 (log):** through the squaring, the fly home and the chaos the room is the same 1,042,660 triangles
    in 4 instanced draw calls as beat 2 (the bursting copies stay instanced: the same four meshes, per-instance matrices and
    colours, 74 x 4 matrices a frame on the CPU) plus the real lock's 15 parts; it stops drawing once every piece is in the
    dark (by B3B), so the build, the hold and the fade draw the real lock alone. Watch: the chaos's overdraw (many pieces
    overlapping in the middle of the screen) and the squaring pull-back (the fastest camera motion on the page: 29 grey
    levels a frame at its peak on the laptop). If it drops frames: the lighter copies already noted for beat 2.
  - **Waiting:** the S23 run (60 fps through beat 3, real swipes back and forth across the seam from beat 2, the pull-back,
    the chaos and the build). **Temporary:** the plain fade from the one lock into page 3 as it is today (`XRAY` 12.6-12.8),
    until beat 4 (the three views).
- **The security page: page 3 starts at the door (28 Nov, Wajih).** Beats 1 and 2 are page 3, so the strip and the
  title block now say "03 The lock" from beat 1's start (the walk's end, at the shut door) instead of "02 Hallway", and
  the strip's "03 The lock" (and a `#page-03` deep link) lands there: the `#page-03-door` marker, main.js by page number
  (beat 2's structure notes, "Page 3 starts at the door"). Checked in the page (384 x 734, 2160 x 1147, and reduced
  motion): "02 Hallway" up to the door, "03 The lock" from just past it, through beats 1 and 2 and on page 3's own
  section; the 03 segment fills from the door; a click on "03 The lock" from frame 1 lands exactly on the marker
  (standing at the shut door, the walk done, beat 1 not started; reduced motion: at the lock's face still). No console
  errors. Logged for the look pass: the real centre lock darker than its copies ("For the look pass").
  - **Type gate** (384 x 734, 1440 x 900, 2160 x 1147, light and dark; F5B, DOOR, B1H, B1F, B1P, B1E, B2K, B2H, B2W,
    B2E, LOCK): **0 machine failures**.
  - **Routecheck** (14 sizes, light and dark): every route on the grid, the title block's cells unclipped at every size
    with "THE LOCK"; 26 of 28 clean, 2 `ERR_CONNECTION_REFUSED` (384 x 734 light, 430 x 932 dark); re-run: 430 x 932
    clean, 384 x 734 light again. Traced (three fresh loads at 384 x 734 logging failed requests): the first load in a
    fresh browser had `fonts/dm-mono-300.woff2` refused by the plain local server under the opening burst; the next two
    loads clean. The known hosting edge (not the site); 384 x 734 light is the first job of every run, so it meets the
    cold burst most often.
- **The security page, beat 2: the room of locks (28 Nov).** Built as in "The security page, beat 2: structure notes":
  straight on from beat 1's dark end in the same scene and camera, back up the keyway, out through the keyhole, then
  lab B3 (its p 0.30-0.84): 74 instanced copies, the room turning, the camera circling, the centre key's turn, the
  wave; the headline at the hold; 3 screens, scrubbed both ways. Beat 1's temporary fade is gone; the temporary fade
  into page 3 now follows beat 2's end. Shots: `tools/shots/beat2/final/` (384 x 734 and 2160 x 1147 at B2K, B2H, B2W,
  B2E), `reduced/` (`384x734_reduced_room0-3.png`), `lab/` (lab B3 at 0.48, 0.70, 0.84 for comparison), `probe*/`,
  `flicker/` (the lab's straight path, before), `flicker4/` (final), `grid/`, `overlap/`, `typecheck/`, `typecheck2/`.
  - **Type gate** (`typecheck.py`, one browser; 384 x 734, 1440 x 900, 2160 x 1147, light and dark, every stop): 516
    frames, 6 failures, all the headline at B2H (its descenders within half a cell of its backing, crossing it at 2160
    x 1147: the `.gt` box ends on the baseline): fixed (a cell of padding under it). Re-run on B1E-LOCK (384 x 734, 1440
    x 900, 2160 x 1147, 360 x 800, 375 x 667, 430 x 932; light and dark): **0 machine failures**.
  - **Gridcheck** (B1E, B2K, B2H, B2W, B2E, LOCK; the 7 phone sizes and 2160 x 1147): first run the headline's
    baselines half a cell off (the eyebrow's small type ends on a half line): fixed (half a cell between them); re-run
    **0 off the grid** (worst 0.075 px). **Overlap** (same): **0 in 4,569 pairs**.
  - **Flicker** (`flicker.py --beat2`, real Chrome, 2160 x 1147 @1.333 set through DevTools): energy (p95) / largest
    single-frame change: the seam from beat 1 1.10 (2.70) / 8.1; out of the keyhole 8.75 (17.1) / 25.5; the headline's
    hold 1.09 (3.65) / 7.1; circling with the wave 3.93 (5.23) / 6.3; the end and the fade 0.94 (4.15) / 24.6 (the
    chrome turning light at the temporary fade, as beat 1's). The lab's own straight path out gave 43.4 (through the
    housing) and my first bend 70.0 (out through the key's bow, flat on): both fixed (structure notes). What remains out
    of the keyhole is the camera's speed (B3's pull-back: 330 mm in about two thirds of a screen), spread over frames.
  - **Scrubbed** (`beat1probe.py --scrub2`, 384 x 734, 300 steps from beat 1's dark end to the hand-over): forwards and
    backwards give the same camera at every step (difference 0); the largest step 0.029 hall units (the lab's straight
    path: 0.031), the largest turn 2.7 degrees a step; the camera stops at the seam and backs away (no jump). Every pin
    on the shear line throughout.
  - **Routecheck** (14 sizes, light and dark): 27 of 28 clean, every route on the grid; 384 x 734 light failed on one
    `ERR_CONNECTION_REFUSED` (the plain server under a burst, the known edge), failed once more in a single-size re-run
    (its error text not captured), then clean twice in a row (light and dark).
  - **Compared with the lab** (`labshot.py --codes B3`, same moments): the same frame, the same poses. Two light
    differences found and fixed: the copies lacked the lab's room light (this three.js lights Lambert from
    `scene.environment`), and the real lock wore the door's turned light (unwound during the pull-back).
  - **Reduced motion** (384 x 734): after the lock's face, the room's still with the headline over it (wrapped,
    balanced), its picture 1 → 0.37 → 0 as it scrolls by. No console errors anywhere.
  - **My calls:** (1) beat 2 in dive.js's own scene and camera (beat 1 ends there: the seam is the same camera stopping
    and backing up, no second canvas); (2) the path out bent to go through the keyhole and past the key's bow, B3's
    keys, times and ends kept; (3) the key unseen while the camera is in it, fading in as it pulls away (45-110 mm out);
    (4) the headline on 0.45-0.51 with the site's timed word fade (gone before the circling at 0.54); (5) its place
    and sizes as the hallway's opening line, on a dark frosted backing; (6) B3's lighting matched to the lab, the site's
    exposure 1.08 kept (the lab's 1.1); (7) 3 screens: back 0.36, the pull-back 0.68, the hold 0.39, the circling 1.47.
  - **Heavy for the S23 (log):** the room is 1,042,660 triangles a frame in 4 instanced draw calls (14,090 a copy:
    housing 5,258, plug 7,684, cap 632, key 516) plus the real lock; lighter than the lab's (full STLs), and the lab's
    B3 already ran on the S23, but it is the biggest load on the page. If it drops frames: a simplified housing and
    plug for the copies (the far ones are fogged anyway) or fewer triangles via `lock_web.mjs`.
  - **Waiting:** the S23 run (60 fps through beat 2, real swipes back and forth across the seam and the pull-back, the
    headline at the hold). **Temporary:** the plain fade from the room into page 3 as it is today (`XRAY` 9.6-9.8),
    until beat 3 (fly home, chaos, one lock).
- **The security page, beat 1, second pass: the pins ride the key, the push starts at walking speed (27 Nov, Wajih's two
  yeses).** Built as in the structure notes ("The push at walking speed", "The pins ride the key"). Shots:
  `tools/shots/beat1b/final/` (384 x 734 and 2160 x 1147 at DOOR, B1F, B1P, B1E; `384x734_reduced_lock0-3.png`),
  `probe2/`, `flicker/`, `grid/`, `overlap/`, `typecheck/`.
  - **The speed** (`beat1probe.py --scrub`, the camera's speed in hall units per screen of scroll around the walk's
    end): 384 x 734 4.717 walking → 4.707, 4.666 … (slowing); 1440 x 900 4.753 → 4.737; 375 x 667 4.567 → 4.567, 4.533;
    2160 x 1147 4.463 → 4.463, 4.435. No jump at any size (the first pass had the push start about 2.7 x faster). The
    push's length: 1.66 / 1.77 / 2.03 / 2.73 screens; the whole beat 2.47-3.54 screens; page 1's scroll 15.71 (S23) to
    16.78 (laptop). Forwards and backwards give the same camera at every step.
  - **The pins** (same run, S23): with no key they hang 5.8, 4.4, 3.0, 1.6 and 0.2 mm under their modelled places (tips
    level at -4 mm); each rides the key's teeth as it passes (highest 3.08, 3.08, 3.08, 3.13, 4.24 mm over); fully in,
    all five at +2.2: on the shear line. The first pin shows hanging in the keyhole at B1F; under the pins, the ones
    ahead hang over the camera, the ones behind ride the key.
  - **Type gate** (384 x 734, 1440 x 900, 2160 x 1147, light and dark, every stop): 498 frames, **0 machine failures**.
    **Gridcheck** (the hallway's end and beat 1; the 7 phone sizes and 2160 x 1147): 0 off the grid (worst 0.072 px).
    **Overlap** (same): 0 in 5,289 pairs.
  - **Flicker** (`flicker.py --beat1`, real Chrome, 2160 x 1147 @1.333 through DevTools): energy (p95) the hallway's walk
    0.37 (0.42), the push 1.92 (2.60), the keyhole 5.14 (11.69), under the pins 2.24 (3.05), the dark end and the fade
    1.10 (5.91); the largest single-frame changes: the keyhole 26.6 (the light's dip, fast motion), the fade 24.8 (the
    chrome turning light: the temporary hand-over). Under the pins calmer than before (2.56 → 2.24).
  - **Routecheck** (14 sizes, light and dark): run 1 stopped at 1280 x 720 dark (the replay at the top didn't start
    within 8 s: once, not seen again in four later runs of that size or the full re-run); run 2: 27 of 28 clean, one
    `ERR_CONNECTION_REFUSED` (430 x 932 light: the plain server under a burst, the known edge; also seen at 1280 x 720
    light in one single-size run); re-runs of both clean. Every route on the grid in every run.
  - **Reduced motion:** unchanged (the face still, 1 → 0.37 → 0). No console errors.
  - **My calls:** the pins' rest level, one for all five (-4 mm: above the key's tip, clear of the camera); their upper
    limit (8 mm); the speed matched in magnitude (the push heads straight for the lock's face, a few degrees off the
    walk's line, and turns onto its axis as before); the rest of the beat (keyhole, pins, the dark) kept at its 0.81
    nominal screens; the length set per screen (a fixed length can't match the walk on every screen).
  - **Waiting:** the S23 run (60 fps through the longer beat 1, the pins close up, real swipes). **Temporary:** the fade
    from the dark into page 3 (`XRAY`), until beat 2.
- **The security page, beat 1: the steady push into the lock (27 Nov).** Built as in "The security page, beat 1:
  structure notes". Shots: `tools/shots/beat1/final/` (384 x 734 and 2160 x 1147 at DOOR, B1F, B1P, B1E;
  `384x734_reduced_lock0-3.png`), `probe/`, `flicker/`, `grid/`, `overlap/`, `typecheck/`.
  - **Type gate** (`typecheck.py`, one browser; 384 x 734, 1440 x 900, 2160 x 1147, light and dark, every stop with the
    new B1H-B1E): 498 frames, **0 machine failures**. Re-run on the hallway's end and beat 1 after the flicker fixes
    (384 x 734, 375 x 667, 2160 x 1147): 48 frames, 0.
  - **Gridcheck** (F5B, DOOR, B1H, B1F, B1K, B1P, B1E, LOCK; the 7 phone sizes and 2160 x 1147): 0 off the grid (worst
    0.072 px; re-run 0.063). **Overlap** (same): 0 overlaps in 5,326 pairs; the lock counts as a drawing while it fits
    between the strip and the title block.
  - **Flicker** (`flicker.py --beat1`, real Chrome, 2160 x 1147 @1.333 set through DevTools): energy (p95) the hallway's
    walk 0.37 (0.42) for reference; the push 1.90 (2.53), the keyhole 5.18 (11.68), under the pins 2.56 (3.69), the
    dark end and the fade 1.09 (6.06). The first run had two one-frame jumps (the keyhole 54.8 grey levels, the leaf
    popping to the inside on the wide screen; the room-light swap 37; the exit 18): fixed (above). What remains is the
    camera's own speed (the keyhole stretch is the fastest: 90 mm to 6 mm in about 0.18 screens) and the hand-over's
    chrome turning light at the fade's midpoint (24, as before: the temporary hand-over).
  - **Routecheck** (14 sizes, light and dark): every route on the grid; one `ERR_CONNECTION_REFUSED` at 360 x 800 light
    (the plain local server under a burst, the known edge); re-run clean.
  - **Scrubbed** (`beat1probe.py --scrub`, 384 x 734, 300 steps from the door to the dark end): forwards and backwards
    give the same camera at every step (difference 0); the largest step 0.059 hall units, right at the start; the
    largest turn 1.3 degrees per step. The pins' largest lifts: 1.23, 1.23, 1.23, 1.22, 2.33 mm.
  - **Reduced motion** (384 x 734): the lock's face still after the hallway's drawings, its opacity 1 → 0.37 → 0 as it
    scrolls by. No console errors anywhere.
  - **My calls:** (1) the fill is 92% of the screen's height (the brief's and the demo's number), not `endFaceHeight`'s
    92% of the room between the chrome (51% of a phone's screen); (2) the lock draws over the hall from 0.85 of the push
    and the hall stops once the face covers the screen (the demo showed the flat door leaf in the keyhole); (3) the
    light swap as a dip and the lights fading out at the plug's back (flicker); (4) the key is unseen and out of the
    lock's group (its profile only), the pins and drivers always built (at the door they sit inside the housing; the
    door looks as before); (5) the solids simplified to 0.025 mm; (6) the beat starts the moment the walk ends (5.0),
    no pause at the door (there was 0.16 screens before the X-ray).
  - **Notes for Wajih:** (a) `setLock` unchanged means the pins move only where the key's profile stands above their
    modelled height: in this model they sit on the key's cuts (the key fully in), so as the key comes in only its tip's
    ramp lifts them (about 1.2 mm, the last pin 2.3) and each settles back; the demo did the same. Making each pin rest
    lower with no key and rise onto its cut would be a change to `setLock`. (b) At 1.5 screens the lock grows about
    three times faster on screen than the door did in the walk's last stretch (the demo had about 3 screens for the
    push): the walk speeds up at the door, then slows gently. Both are his call.
  - **Waiting:** the S23 run (60 fps through beat 1, the pins close up, real swipes back and forth; `phone_stage.py`
    needs a beat-1 stage) when the phone is free. **Temporary:** the plain fade from the dark into page 3 as it is
    today (`XRAY`), until beat 2.
- **Parked fixes: the name bigger (option B), WM.IO everywhere, the square favicon (27 Nov).** Built
  as in "Parked fixes: structure notes". Shots: `tools/shots/name/` (`<size>_gate_bar.png`, `<size>_gate.png`,
  `<size>_tb.png`, `<size>_tb_screen.png`, `favicon.png`, `favicon@2x.png`; `fixes/`: the three short-screen layouts;
  `tc_fail/`: the first gate's failures).
  - **Name check** (`namecheck.py`, headless, one size at a time; all 7 phone sizes, 2160 x 1147 @1.333 and 1366 x 768):
    0 failures. At the start of the arrival the bar is 4.0 cells tall, the wave 4.5 cells, ".IO" 1.24, its baseline on
    the bar's third line, half a cell inside its columns and the bar, no box in its columns, nothing under the bar, the
    same size as in the title block. After the tap: the mark's cell 8 x 6 (phones) / 10 x 6 (desktop), the block's full
    height, 1.5-1.6 x the other cells' average width; the wave's baseline on the cell's third line; "design and
    engineering" under it, 0.52-0.57 cells clear of the mark, centred; gridcheck clean (worst 0.07 px), overlap clean.
  - **Type gate, run 1:** 62 machine failures (16 distinct), all from the taller block on short screens: page 1's drum
    meaning under the block (1280 x 720, 1366 x 768, 1440 x 765), the hallway's frames 2-3 plaques at 375 x 667, page 5's
    website page clipped (375 x 667, 384 x 734, short desktops). Wajih: keep option B exactly, fit those three on short
    screens only. **Run 2:** 2 failures (384 x 734 T07, page 5's button on its page's frame), fixed with compact 2.
    **Run 3:** stopped by the system for low memory (with the local server) after 1,481 frames, all clean (384 x 734,
    390 x 844, 1280 x 720, 1366 x 768, 1440 x 900, 1920 x 1080, 2160 x 1147, 1440 x 765, 2560 x 1440 light and dark;
    360 x 800 light); then, one size at a time, 360 x 800 dark, 375 x 667, 393 x 852, 412 x 915, 430 x 932 (light and
    dark): **0 machine failures** (the gate passes at all 14 sizes).
  - **Routecheck** (14 sizes, light and dark): every route's straight runs on grid lines (largest offset 0.015 px), the
    title block's cells and the bar's boxes on whole cells, nothing clipped, in every run. Console: `ERR_CONNECTION_REFUSED`
    on one texture (a different one each time, `media/materials/*.webp`) at 4 combinations in the first run, then only
    at 1366 x 768 light; the same refusal on the last commit's build (same 66 requests, at most 20 in flight): the plain
    local server's connection queue under the texture burst (`materials.js` has no retry: an edge for hosting). Re-runs:
    every combination clean.
  - **Shots refreshed on the final build** (`namecheck.py`, 384 x 734 and 2160 x 1147): 0 failures.
  - **My calls:** the phone block's split (mark 8 | page over title 6 | scale over print 4: option B's "sheet and scale
    stack" literally needs 19 of the 18 cells); the mark's cell 10 on desktop (about 1.7 x a 6-cell cell; 12 left it
    floating); ".IO" 0.85 of the wave everywhere (the hero file too, one mark); the bar 4 cells at the start on desktop
    as well; the favicon's stroke and plate; "design and engineering" treated as the name's own line (MARK_LABEL), not a
    draft; the three short-screen fallbacks (above).
- **The name, the top bar and the title block (26 Nov).** Built as in "The name, the top bar and the title block:
  structure notes". Shots: `tools/shots/topbar/` (`real/`: real Chrome at 2160 x 1147 @1.333, 1440 x 900, 384 x 734
  @2.8125 and 360 x 800 @3 emulated; `dark/`, `reduced/`, `r1/`, `r2/` headless; `typecheck/`; `before/`: the old gate).
  - **Real Chrome** (`topbarshot.py --real`; the arrival, a tap mid-arrival, entered, scrolled back to the very top and
    home again, the shortcut's jump): 0 errors at all four sizes. fps during the arrival (3.5 s): 120 (1440 x 900, worst
    8.6 ms), 118.2 (2160 x 1147, one 67 ms frame), 118.0 / 118.5 (384 / 360 emulated, one 58-67 ms frame). Going home
    (1.3 s): 101-110 fps with two frames of 100-142 ms as the curtain opens onto page 1 (page 1's first paint; the old
    gate's curtain opened onto it the same way). The grid runs: every straight run of every route on a grid line
    (largest offset 0.006 px). A tap mid-arrival lands on the end state; the replay writes the sentence again and a tap
    sends the mark home (title block mark shown, phase ready). The jump shows "Cutting to the chase." and lands in the
    final room. No text clipped in the bar or the title block.
  - **Type check** (23 stops across page 1, the hallway, pages 3-6, the final room and the spec sheet, so the bar and the
    title block are checked everywhere; 2160 x 1147 @1.333, 1440 x 900, 384 x 734 @2.8125, 360 x 800 @3; light and dark;
    184 frames): **0 machine failures** (first run: 92 on the phones, "01 / 08" 4.5 px from its line in a 4-cell page
    cell; fixed with the 3 / 5 / 6 / 4 split).
  - **Axe on the gate** (`gateaxe.py`, 384 x 734 and 1440 x 900, light and dark, and reduced motion): 0 violations.
  - **Found and fixed:** dark mode's gate was light grey with the sentence nearly invisible (before this pass too); the
    button's focus ring drew a ring at the beacon from the first frame.
  - **My calls:** the routing rules (along the strip's bottom line and the title block's top line; a cell left of the
    sentence, a cell right of the beacon; the ring one cell round the beacon, so it sits on the grid); the straight line
    is as long as the wave; the snake pours into the pen as the writing starts; the second line is a serif sentence
    (TYPE_RULES: sentences are Newsreader), flagged Draft; a tap skips and a scroll enters at once; the title block's
    phone split; the dark gate black; the replay after 320 ms at the top, not with reduced motion; the favicon on a
    paper plate.
  - **Edges:** going home's two long frames (above); one 62 ms frame as the sentence settles on the phone sizes (no
    script; it stays with the words pre-painted); real Chrome's phone emulation with touch on gives the page a 15 px
    classic scrollbar the grid script cannot see, so the title block sits 0.2 cell off the grid there (headless and the
    S23 have none); the page title and the title block's Project cell still say "Wajih Mansouri" (not in the brief).
  - **Pending: the real-phone run** (the arrival, the tap, the replay, the jump on the S23).
- **Pass 3b, the scroll drives the stage (26 Nov).** Brief committed (`7bea6c6`). Built as in "Pass 3b structure notes".
  Shots: `tools/shots/stage/` (per size: the show's stops forwards and backwards, the ground and dress mid-change, REAL,
  the json reports, `typecheck/`).
  - **Continuity** (`stagechrome.py`, real Chrome; every 0.01 screen, 0 to the hand-over): forwards and backwards give
    identical values (largest difference 0); the camera moves 0 px during frame 5's show; the walk's step is the same
    before and after the hold (25.5 px per 0.01 screen at 1440 x 900). Largest step per 0.01 screen: the ground 0.29 (of
    0 -> 1, the shortest scrubbed beat), built / real 0.19, the turns 0.066 rad (3.8 degrees), the lift 0.14 (frame 5
    folding back after the show, as before).
  - **fps, real Chrome on this laptop (Radeon 780M, 120 Hz), a steady scroll of 0.66 screens a second through page 1
    and the hallway, two passes, then the show scrubbed forwards and backwards (6 s each):** 1440 x 900 119-120 fps
    everywhere, worst frame 25 ms (one, page 1 at 3.07, first pass only), the show 119-120 fps, worst 16.7 ms;
    384 x 734 @2.8125 (emulated) 119-120 fps, one 25 ms frame (page 1, first pass), the show 120 fps; 2160 x 1147
    @1.333, two runs: page 1 96-112 fps with 5-14 frames of 25-75 ms, most around Bell's drawing and the morph (p
    0.40-0.83; this pass changed only the ground's fade there), the hall 82-120 fps (frames of 17-25 ms), the show
    100-114 fps, worst 17-50 ms (one run 8 frames of 25-50 ms scrubbing back near 12.1, the other none over 20 ms).
    Errors: none. Found and fixed: the opening line's backdrop blur (above).
  - **Type check** (page 1 and the hallway's 32 stops, the new ones included; 384 x 734 @2.8125, 1440 x 900, 2160 x
    1147 @1.333; light and dark; 192 frames): **0 machine failures**.
  - **My calls:** frame 5 opens blank and its scribble draws in the hold (the brief lists the scribble with what the
    scroll drives once it is open); the show's parts as `SHOW` above (the Android 0.25 screens behind); the turns ease
    with a sine in-out; the ground's change spans 0.08 screens (shorter would pop, longer reads as a murky mix); the
    travelling words stay timed (words; they must land on baselines).
  - Not run (the full check comes after the top bar): gridcheck, overlap, geom, axe, the other 11 sizes; reduced
    motion (unchanged code path). **Pending: the real-phone run.**
- **Hallway pass 3, fixes and polish (26 Nov).** Brief committed (`33ccc5a`). Built as in "Hallway pass 3 structure
  notes": the pre-ducked camera, the title on the plaque only, light paper plaques, no stock icons in the drawings, the
  real phones back in frame 5; then Wajih's three changes during the pass: the phones turn by themselves (later
  replaced), the plaques and the band rounded on all four sides, and frame 5's final show (the phones lift out of the
  frame and make one full turn each; the blue sheet stays; a frosted glass back; no IPHONE / ANDROID words). Shots:
  `tools/shots/hall-p3/` (probe, phone, phone-run1, f5, typecheck-*, grid, overlap*, geom*, readcheck*, axe_*,
  reduced, flicker, selfcheck/items).
  - **The real S23 (SM-S918N, 384 x 719 @2.8125), run during the pass, before frame 5's final show:** 60 fps in all 10
    hallway segments on both passes; the phones turning by themselves (the interim version) 60.1 fps standing still,
    stopped by reduced motion; the rounded plaques' close-up clean; 8 real swipes, no pull-back, worst frames 92 and
    100 ms (the first flick each way); 0 errors. Found there and fixed: the blueprint's faded lines still wrote depth
    and cut notches into the phones' edges. **Pending: the real-phone run** of the final code (frame 5's lift and turn,
    the frosted back, fps through the hallway, real swipes, reduced motion, shots of every frame open and the door):
    Wajih took the phone back for another project before it.
  - **Laptop, real (headed) Chrome, Radeon 780M, a 120 Hz screen (`tools/hall3chrome.py`):** frame 5's whole show
    (lift and two turns, 8.3 s, standing still) 119.3 fps at 2160 x 1147 @1.333 (2 frames over 20 ms, worst 25 ms),
    120 fps at 1440 x 900 (worst 16.7 ms), 119.3 fps at 384 x 734 @2.8125 emulated (1 over 20 ms); LIT and the
    scribble 120 fps. Found in real Chrome and fixed: the show's frame loop started a second loop on each of its own
    renders, so the renders per frame doubled until the hall stalled (5 fps, a 6.4 s frame, headless crashes).
  - **Type check** (the gate; the hallway's 11 stops TR-LOCK; all 14 sizes, light and dark; 308 frames; final code):
    **0 machine failures**. Reduced motion (3 sizes): the hallway clean; 102 failures, all page 4's cutaway over page 5's
    website room (edges).
  - **Readability** (`readcheck.py`, adjusted to the fixed hall; 14 sizes; final code): **0 failures**. Smallest word
    0.42 cells (rule 0.375), every frame with its plaque within 0.43 cell of the room's middle (rule 0.5), the drawings'
    clear space at least 0.18 px over the half cell. The eye: 0.88 (375 x 667) to 1.0 on phones, 1.24-1.42 on laptops.
    Frame 5's lifted phones: 1.16 x on a 384 x 734 (20 px under the frame's top edge, 27 px over the plaque), 1.22 x at
    2160 x 1147 (38 px, 44 px). Fixed on the way: frames 2 and 3 were 0.2 px short of their clear space on a 375 x 667.
  - **On-grid** (`gridcheck.py`, 14 sizes, the hallway's stops): 0 off the grid (3,030 edges, 2,622 baselines; worst
    0.066 px). (Run before frame 5's final show, which adds no grid-bound text.)
  - **Geometry** (`geom.py`, 14 sizes, light and dark, every stop, the band added; final code): **0 problems**.
  - **Overlap** (`overlap.py`, 14 sizes, final code): the hallway 0. 15 outside it (edges): the spec sheet's heading over
    the title block at the final room's last stop on five phones. Fixed on the way (the tool and the hallway's report):
    a frame folding back beside you was reported as a huge inverted box (now clipped at the near plane), frames hidden
    behind a plaque were counted, the hallway's last state was read after it scrolled away, and a closed frame on the
    wall passing under the fixed chrome is now counted apart, like page text under the chrome.
  - **Axe** (`axe8.py`, 14 sizes, light and dark, 70 stops each; reduced motion at 2 sizes): 0 violations. Console: 0
    errors from the page (two `ERR_CONNECTION_TIMED_OUT` at 2160 x 1147 dark: the plain local server dropping a
    request under load). Real Chrome logs a 404 for `/favicon.ico` (the site has none: edges).
  - **Length:** page 1 with the hallway 11.34 screens at every size (the hallway 5.4); the whole page 31.6-34.9.
  - **Reduced motion:** the dressed hall still, then each drawing with its caption; frame 5 a still of the real phones
    standing out of their frame, front on (4 shots: 384 x 734 and 1440 x 900, light and dark).
  - **Screenshot self-check and design ethos** (`selfcheck/items/`, 384 x 734 and 2160 x 1147): rhythm, breaks, the
    drawings' words at a glance (emulated; the real S23: pending the real-phone run), the plaques (as wide as their
    frames, rounded, crisp at rest), drafts flagged; hairlines only, no stock icons, blue only for the drawings, brass
    the one warm tone, real material. Passed.
  - **Flicker** (`flicker.py`, real Chrome, 2160 x 1147 @1.333 set through its own DevTools session; pass 1 `32869f5`
    staged at `site/p1old/` and deleted again): the hallway walk (between frames 1 and 2) flicker
    energy 0.31 (pass 1) -> 0.37 now, pixels over the threshold 0.13% -> 0.09%; plain wall, floor and ceiling 0.22-0.29
    both builds, 0.0% over the threshold (no new shimmer). Its lower-left patch (0.51 -> 1.25) now holds frame 1 and its
    plaque sliding past (the lower eye puts them there): motion, not flicker. The tool's hyperdrive step (a dev page,
    outside the hallway) fails on both: `window.__draw` is gone from `dev/hyper.html` (edges).
  - **My calls:** the block (frame + plaque) is what is centred, every frame at one reading distance so each lands on
    the same place (the eye is one height; plaques of one and two lines differ, so the blocks are within 0.43 cell); the
    eye goes about 0.5 lower on phones than "slightly" (the band and the plaque need the frame above the middle); the
    phones spread over the frame's sides as they lift, so "out of the frame" reads face on; the open plaque's plate is
    CSS (crisp on the S23), the closed one WebGL with the same outline; frame 2's layers carry only their words.
  - **The flicker tool** no longer sends Ctrl+minus key presses (they could reach whatever window had the focus).
  - Not run: the real-phone run (pending).
- **Hallway pass 2, the frames and the phone framing (26 Nov).** Brief committed (`91042c5`). Built as in "Hallway pass 2
  structure notes". Shots: `tools/shots/hall-p2/` (before, probe, typecheck, phone, reduced, assets).
  - **Type check** (`typecheck.py`, the hallway's 11 stops TR-LOCK; 384 x 734 @2.8125, 1440 x 900, 2160 x 1147 @1.333;
    light and dark; 66 frames): **0 machine failures**. Fixed on the way (2 -> 0): a ceiling fixture hidden behind frame 2
    was counted against its words.
  - **S23** (`phone_stage.py --stage hall2`, 384 x 719 @2.8125): 60 fps in all 10 segments on both passes (each frame
    opening with the slide, the caption band and the fold; the walk to the brass lock; the hand-over); 8 real swipes, no
    pull-back, worst frames 108 ms (the first flick each way); reduced motion: the still hall, then the five drawings with
    their captions; 0 errors. (The first runs found the screen asleep, then the tab caught in landscape: woken, re-run.)
  - **Framing** (`hall2probe.py --read`): S23 every open frame 13 of 20 cells (0.666 of the width), the drawings' words
    0.53-0.55 cells (rule 0.375); 1440 x 900 frames 0.31-0.36 of the width and 0.61 of the height, words about 0.8 cells.
  - **My calls:** on a phone the slide is sideways and a little down (the plaque and band need the frame above the
    middle; still a slide, never a turn); on wide screens up and down only. The plaque's plate is drawn in WebGL (always
    there, dim on the wall, lit as the frame opens); its words appear as it opens. Frame 3's story line is new (draft).
    The brass reflection is turned (`envMapRotation`) so the flat face reads as brass, not near-black.
  - Not run (pass 3): the other 11 sizes, gridcheck, overlap, flicker, axe, readcheck.
- **Hallway pass 1, the space (26 Nov).** Brief committed (`d25e804`). Built as in "Hallway pass 1 structure notes".
  Shots: `tools/shots/hall-p1/` (probe, typecheck, phone, reduced, assets).
  - **Type check** (`typecheck.py`, the hallway's 11 stops TR-LOCK; 384 x 734 @2.8125, 1440 x 900, 2160 x 1147 @1.333;
    light and dark; 66 frames): **0 machine failures**. Fixed on the way (148 -> 2 -> 0): desktop labels over farther
    frames on the same wall and phone labels over the fixtures (they now fade behind a label), drawings that stayed
    drawn after folding back, a live measurement without its thousands comma ("1661.8 PX"), and frame 4's measurement
    pushed onto its frame on the phone (its gap is now capped at the drawing's CLEAR).
  - **S23** (`phone_stage.py --stage hall1`): 60 fps in all 10 segments on both passes (the sketch, dressing, lights,
    each frame opening, the walk to the door, the hand-over); one 33 ms frame on the first pass of the sketch. 8 real
    swipes: no pull-back; worst frames 83 ms (first flick) and 117 ms (first flick back); one long drag did not move
    (the swipe did not register). Reduced motion: the dressed hall still, frames open, then the drawings. 0 errors.
  - **Readcheck** (not this pass's gate; for pass 2/3): 19 failures at the three sizes. S23: the drawings' words are
    0.2-0.32 cells at their closest (rule 0.375) and four drawings' in-plane clearance fails, because a frame opened
    square to you fits whole on a portrait phone only from about 3 units (the hall's width through the 50 degree lens),
    where it is about a fifth of the screen tall. Laptops: words 0.56-1.13 cells; the sheet passes half the screen's
    height while it folds back (the rule was written for round 8b's fading drawings).
  - Not run (pass 3): the other 11 sizes, gridcheck, overlap, flicker, axe.
- **Final check (25 Nov, stopped early on Wajih's word).** Shots and outputs: `tools/shots/r9-final/`.
  - **S23, whole page** (`phone_stage.py --stage all`, segments in visiting order, two passes): every segment 59.7-60 fps
    on both passes except page 5's websites room on the first pass (one 200 ms frame) and its apps room on the second
    (58.7, worst 67 ms); "Cut to the chase" 59.7 fps, landing on the final room (top -0.4 px); 20 real swipes on five
    pages, no pull-back; 0 errors. "Back to the start" did not move on the phone: the tap landed off screen (the link
    is below the fold on a phone); clicked in view in Chrome it lands on the top ("Enter"); not re-run on the phone.
  - **Typecheck, 14 sizes, light and dark** (1,932 frames): 467 failures, every one on a short or unusual screen the
    three-size stage checks don't cover. Fixed: page 4's three lines over the cutaway (the cutaway now sits under them
    and shrinks to leave room for the meaning above the title block); the opening line over the first drawings (they
    come in once it has gone); far drawings counted through a nearer opaque sheet (the type check's view now clips their
    lines and drops covered shapes); the websites room past its page on short desktops and phones. The changed cases
    re-checked: 0 (1280 x 720, 1366 x 768, 1440 x 765, 390 x 844, 360 x 800, 375 x 667 at the failing stops).
  - **Typecheck, reduced motion, 14 sizes** (750 frames): 504 failures, from two causes, both fixed, NOT re-run: page 4's
    cutaway laid out for a full screen spilled over page 5 (now laid out in its own box); canvas 2's still SVG stroked
    each back layer's whole outline under the layers in front (now only its strip).
  - **Readcheck, 14 sizes:** 0 failures (worst word 0.382 cells, worst sheet 0.499 of the screen).
  - **Final gate:** typecheck at 384 x 734, 1440 x 900, 2160 x 1147, light and dark, on the final build: 0 machine
    failures (414 frames).
  - **Not run (stopped):** the full 14-size typecheck again on the final build; reduced motion again; on-grid (light run
    finished, unread; dark stopped mid-run), overlap, geometry, axe, console errors per size, lengths; the flicker
    comparison (round 8 staged, then deleted unused); the screenshot self-check and the design-ethos self-check; the
    S23 re-run after the last fixes (`PhonePair` compiling off the main thread, the reduced-motion layouts).
- **Round 11 (25 Nov, stage 11, lighter trips, team, spec sheet).** Built as above (all new wording drafts, flagged).
  Checks: typecheck 0 machine failures (page 5's 11 stops, P06, ROOM, SEND, P08; 384 x 734, 1440 x 900, 2160 x 1147;
  light and dark; plus 375 x 667 and 360 x 800 on the websites room). S23: AI 59.3-60, websites 57-60, apps 59-60,
  team 60, spec sheet 60 fps; fixed on the way: the trips scene rendered the 3D phones on every scroll event off screen
  (team and spec dropped to 56 fps), the tracker re-uploaded a 720 x 1,560 screen with mipmaps each frame (43 fps), the
  phones loaded three screens early (mid-scroll stalls). Left: one 167 ms frame on the websites room's first pass when
  the test jumps straight to page 5 (the phones' parsing; a visitor's pause on pages 3-4 loads them first). 8 real
  swipes, no pull-back; 0 errors; reduced motion shots. Shots: `tools/shots/r11/`.
- **Round 10 (25 Nov, stage 10, how we work).** Built as above. Checks: typecheck 0 machine failures (page 4's 15
  stops + L10 + P05; 384 x 734, 1440 x 900, 2160 x 1147; light and dark; 102 frames). S23: 60 fps in both segments on
  both passes (worst frame 17.1 ms); 8 real swipes, no pull-back; 0 errors; reduced motion shots. Shots: `tools/shots/r10/`.
- **Round 9 (25 Nov, stage 9, into the lock).** Built as above. Lines (drafts): "Your business runs on thousands of
  locks." / "We make sure only the right keys turn them."
  - **Checks:** typecheck 0 machine failures (page 3's 11 stops, the hallway's DOOR and LOCK, P04; 384 x 734, 1440 x 900,
    2160 x 1147; light and dark; 84 frames). The seam: the frames either side of the hand-over show the same lock and
    framing (mean difference 6 grey levels on the phone, 1.5 on the laptop; only the page number changes). S23
    (`phone_stage.py --stage 9`): 59.7-60 fps in all three segments on both passes (worst frame 33 ms, one each);
    8 real swipes, no pull-back; 0 errors. The lattice: about 455 locks of 761 segments each in one draw call.
    Reduced motion: the still lattice and both lines (fixed on the way: the second line sat under the title block).
    Shots: `tools/shots/r9/`.
- **Round 8b (25 Nov, stage 8b of "Finish the site").** Brief committed (`cd1e5eb`).
  - **Built:** the hinged hallway (above), canvas 2 in layers (the watch is gone), the shut door with the lock at eye
    level filling the screen at the end (the 100° opening and the walk through are removed), the opening line's box
    sized to its words (it ran past its backing), the final room as one slip with real fields and a real Send, the
    asset sheet (round 8b text, canvas 2's card, the shut door), TYPE_RULES and the checks.
  - **Wording changed (drafts):** canvas 2's notes; dispatch's boxes; the fig lines shortened; frame 2's story tightened
    ("We learn what your customers need to feel, then choose every colour, shape and word for it."); "Next: your details".
  - **Checks:** typecheck 0 machine failures (192 frames: 384 x 734, 1440 x 900, 2160 x 1147; light and dark; every
    stop). Readcheck 0 failures at all 14 sizes (worst word 0.382 cells against 0.375; worst sheet 0.499 of the screen's
    height against 0.5). S23 (`phone_stage.py --stage 8b`): every hallway segment and the final room 60 fps on both
    passes; the way in's first pass one 100 ms frame (the real phones loading because the test jumps straight there;
    a visitor loads them in the X-ray pause); 8 real swipes, no pull-back, the scene settles 0.05-0.5 s after the
    scroll stops; reduced motion shots; 0 errors. Found by the phone shots and fixed: the hallway's last frame stayed on
    screen over later pages. Shots: `tools/shots/r8b/`.
- **Round 8 (25 Nov).** Brief committed (round 8, `17429de`). Built to Part 5 "Round 8" (rounds 4-7 where not changed).
  - **Built:** `TYPE_RULES.md` first (five rules, the type scale, the wording status, eight screenshot self-checks, the gate)
    and `tools/typecheck.py`; the new running order (8 pages; the hallway is page 2; stubs 3-6 and 8; the final room = the
    old pages 2-3 with Wajih's heading); page 1's last line "Now, how can we serve you?"; the hallway's finish (way in A
    scrubbed, dressing up from grid lines, treatment B, the straight camera, frosted rounded labels as wide as the drawing
    and turning with it, five product drawings, the door with the real lock, faint → clear, opening onto page 3); "Cut to
    the chase" + the hyperdrive; no snap, held scenes (a 0.1 s lagged scrub); DM Mono Light measurements on their lines;
    page 1's names on their own pieces; the asset sheet (ways in B/C and treatments A/C gone; the door and the hyperdrive
    with Play; contents list). Removed: the soft snap everywhere and `?nosnap`, `callout.js` (Detail B), "or see how we
    think", the hallway's `?tr=` and `?hall=`.
  - **Calls made alone:** see the round 8 report (also below in "What's open" where Wajih decides).
  - **TYPE_RULES gate: passed.** `typecheck.py`: 0 machine failures (crossings, clearance, scale, wording, breaks all 0)
    over 924 frames (14 sizes x light/dark x every stop of the whole page, from `__t2stops`) and, with reduced motion, 0
    over 496 frames. Screenshot self-check: 8 of 8 passed, each with its sheet in `tools/shots/r8/selfcheck/`. The last
    full re-run on the final build was stopped by Claude Code for low memory; the final build differs from the one that
    passed by one CSS rule (`.stub .ph`, the stubs' Draft flag) and the slip section's snap padding reverted to the passing
    state.
  - **On-grid (`gridcheck.py`, 14 sizes light + 4 dark; 8,788 edges, 8,807 baselines, 4,048 text edges, 854 picture
    edges):** every stop clean except three faults, each fixed and re-checked: the opening line (3 sizes: 0 off, worst 0.06
    px), the stuck slip head (3 sizes: 0 off, worst 0.09 px), the final room and the spec sheet (14 sizes: 0 off, 1,462
    edges, 1,021 baselines, worst 0.188 px). Fixed on the way: the opening line's Draft flag (inline-block, off the grid), the stuck slip head (a
    collapsing margin made it 3.5 cells), the spec sheet's Draft flag moving its baseline.
  - **Stretch:** 0.000% at rest at all 14 sizes (keystone 0); closest to a screen edge while visible 18.0 px (360 x 800,
    frame 5). **Overlap:** 0 in 83,923 pairs. **Geometry:** 0 problems (14 sizes, light and dark). **axe:** 0 violations
    (6 runs: 384 light/dark, 1440, 2160 dark, 384 and 1440 reduced; 33 stops each, 11 reduced). **Console:** 0 errors.
    **Drawings' height share at rest:** 0.34-0.47 on phones, 0.43-0.60 on laptops (the label is under the drawing now).
  - **Length:** page 1 with the hallway 10.54 screens; the whole page 33.4 (384 x 734), 32.7 (1440 x 900), 32.3 (2160 x
    1147); the final room 1.7-2.9; reduced motion 17.4 / 18.6.
  - **S23 (SM-S918N, Chrome 158, 384 x 719 @2.8125, `tools/phone_r8.py`, final run):** every hallway segment, the way in and
    the door 60 fps on both passes (p95 16.7-16.8 ms); page 1's first segment 58.3 on the first pass (Bell's first paints)
    and 60 on the second; the hyperdrive 59.1 fps (worst frame 33 ms), landing exactly on the final room (top 0); the final
    room scrolling 59.7; frosted labels with small scrolls 60. Real swipes: 9 (5 flicks, 2 slow drags, 2 flicks back), no
    reversal after release in any (Chrome's own fling only), nothing skipped; the scene settles 0.03-0.5 s after the
    scroll stops, never more than 0.064 screens per frame. Fixed on the way (first-pass stalls): the lock's four STLs were
    parsed and edge-found on the main thread (one 300 ms frame) -> `door-lock.bin`, compiled once placed; the real phones
    now load in the first quiet pause from the X-ray on (they were still loading at the way in: one 83-500 ms frame).
    Reduced motion (emulated on the phone): the cut is a plain jump to the final room (top -0.1 px), the hallway still
    figures. "Remove animations" is off. 0 errors. Shots: `tools/shots/r8/phone/`.
  - **Hyperdrive frame cost (headless, its fork's measure):** 0.4-0.7 ms per frame mean (worst 3 ms); 2.2-3.1 ms at a 4x
    CPU throttle; at t = 1 its grid matches the page's CSS grid line for line.
  - **Flicker: not run this round** (the run was stopped by Claude Code for low memory before it reached it). Ready:
    `tools/flicker.py` (round 7 at `site/r7old/` vs now, plus the hyperdrive stepped frame by frame); the staged build was
    deleted before committing.
  - Shots: `tools/shots/r8/` (`shots-phone`, `shots-laptop`, `shots-360`, `shots-reduced`, `phone/`, `selfcheck/`,
    `typecheck/`, `hyper/`, `dev/`).
  - **Pending Wajih:** his review of round 8 on the S23; the final room's CTA pick (A, B or C); the drafts (the opening line,
    the five story lines, the final room's rows, answers, "Next: your slip" and slip wording, the stubs' lines); the two
    phone licences; a go to re-run the flicker comparison and the full checks once memory allows.
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

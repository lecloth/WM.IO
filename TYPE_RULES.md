# TYPE_RULES.md: the type and wording rulebook (Take 2, from round 8)

Wajih (25 Nov): "this site has to be flawless, it's the first showcase". Every run passes this file before it commits.

**The gate.** `python -I tools/typecheck.py` reports **0 machine failures** at all 14 sizes, light and dark, at every
stop; `python -I tools/readcheck.py` reports **0 failures** (round 8b: the hallway's drawings, below); and every item of
the screenshot self-check (below) is passed, each with its screenshot in the run's shot folder.
**A run that fails the gate does not commit.** It stops and reports what failed and why.

`1 cell` = the grid unit `--u` (19.2 px on the S23; 20-24 px on wider screens). All sizes below are in cells.

---

## 1. No drawn line ever crosses a word

Leader lines, dimension lines, hallway edges, rules, boxes, the door, the drawings' own lines: none of them passes
through a word. **Only the background grid may sit behind text.** The background grid is: the page grid (the paper's
and the blueprint's cells), the same grid continued on the hallway's walls, floor and ceiling, and the type's own
construction grid behind WE and the verb drum (faint hairlines on cap line, x-height and baseline; Wajih's round 4
request). Everything else is a drawn line.

Where a drawn line must pass a label it stops short (a knockout, as on a map): the hallway's edges are cut around
every label that is on screen, with the clearance of rule 2.

**Round 8b: backings and frames are drawn lines.** A label's frosted backing (its four sides) and a drawing's hairline
frame count as drawn lines: no word may run past or onto them, and every word keeps rule 2's half cell from them (the
opening line "We design backwards." ran past its backing on Wajih's laptop; this is the rule that catches it).

**Machine check:** `typecheck.py` collects every visible word's ink box (per word, from its rendered glyphs: cap or
ascender top to baseline or descender bottom) and every drawn line and shape: DOM rules (borders and hairline inset
shadows, 1-2 px elements), SVG strokes, page 1's canvas leaders and shelves, and the WebGL hallway (its edges, the
drawings' segments and their own labels, the door and its lock), projected to the screen (`window.__drawn()`).
A crossing is any drawn segment that enters a word's ink box. Failure count = crossings.

## 2. Half a cell of clear space

At least **half a grid cell** between any text and any drawn line or shape (the shortest distance from the word's
ink box to the line, or to the shape's edge). Shapes are: the 3D phone's pieces, the drawings' sheets, the real
phones, the door, boxes and marks, pictures.

**Machine check:** the same collection as rule 1; failure = any word nearer than `u / 2` (less 0.75 px: lines are
measured at their centre) to a drawn line or shape that is not its own underline. Text inside a box counts against
the box's edges (the box needs its padding). Lines behind an opaque sheet are hidden by it and not counted. The fixed
chrome (strip, title block) floats over the pages that scroll freely (the final room, the stubs): where their words
happen to pass under or beside it is the visitor's scroll, so those words are not checked against the chrome's
rules; the pinned scenes (page 1, the hallway) keep clear of the chrome by layout and are checked against it.

**Round 8b: things seen in perspective.** The hallway's drawings hang at an angle (40 degrees out from the wall) and are
never seen square-on, so their words and lines are foreshortened and slanted on screen. Inside one such object (a
drawing with its frame, its layers and its own words; a label with its backing) the clear space is measured in the
object's own plane: the closest pair of points between a word and a line, projected to the screen, at least half a cell
at the moment the drawing is read closest (`readcheck.py`). The type check measures every word against every *other*
object in screen px as before, with words and sheets in perspective taken as their true quads (not their bounding boxes).

## 3. One fixed type scale

Two families, set weights, set sizes. Nothing else.

| Family | Weights | Used for |
| :--- | :--- | :--- |
| Newsreader (serif) | 400 body · 420 headings, titles, rows · 560 YOU and WE only | everything read as sentences |
| DM Mono (capitals, tracked) | 300 the live measurements only · 400 data (numbers, the slip, the title block's values) · 500 labels | labels on drawings, keys, indexes, flags |

| Step (cells) | Mono | Serif | Typical use |
| :--- | :--- | :--- | :--- |
| 0.375 | ✓ | | title block keys (desktop), measurements (desktop) |
| 0.4375 | ✓ | | title block keys, small flags, measurements |
| 0.5 | ✓ | | mono labels (desktop), slip keys, Draft flags |
| 0.625 | ✓ | | mono labels (phones), X-ray names, title block values |
| 1 | | ✓ | body, story lines, answers |
| 1.25 | | ✓ | rows, slip questions, longer leads |
| 1.5 | | ✓ | museum titles, the kinetic line (phones), big lines |
| 2 | | ✓ | stub names, big lines (desktop) |
| 2.5 | | ✓ | headlines (phones), drum verbs (phones) |
| 3 | | ✓ | the kinetic line (large desktop), stub names (desktop) |
| 3.5 | | ✓ | headlines (desktop), the hallway's opening line (desktop) |
| 4 | | ✓ | drum verbs (desktop) |
| 4.5 | | ✓ | headlines (large desktop) |
| 5 | | ✓ | drum verbs (large desktop) |
| 6.5 | | ✓ | YOU, WE (phones), stub numbers (phones) |
| 9.5 | | ✓ | YOU, WE (desktop), stub numbers (desktop) |
| 11.5 | | ✓ | YOU, WE (large desktop) |

Line heights are whole or half cells. Inside the blueprints (WebGL and SVG), each drawing uses at most three label
sizes (round 8b: its labels, its measurements at 0.9 of them in DM Mono Light, and on canvas 2's finished screen one serif
title; the heads went: the museum label names each drawing).

**Round 8b: the drawings' words on screen.** At the moment a drawing is read closest (fully out, about to swing back),
every word in it is at least the scale's smallest step, **0.375 cells**, on screen (its font size projected at the word's
own depth); its sheet is at most half the screen's height while it is visible. Machine check: `readcheck.py`.

**Machine check:** every visible DOM text's computed family, weight, size (in cells, ±0.01) and line height (a
multiple of 0.5 cell) is in the tables; each drawing's label sizes counted.

## 4. Case, punctuation, numbers, drafts

- **Sentence case** for every serif line: one capital at the start of a sentence, then capitals only for proper
  names (Bell, Yale, iPhone, Android, WhatsApp, AI) and the deliberate YOU and WE. No Title Case Headings. Mono labels
  are capitals by design (the drawing convention), from sentence-case source text.
- **Punctuation, the same everywhere:** curly apostrophes and quotes (’ “ ”), never straight ones in visible text; the
  ellipsis character (…), never three dots; en dash for ranges (1–3); the middle dot (·) between label parts; a full
  stop at the end of a sentence and none after a label or a heading that is a name; arrows as the characters ↓ ↑ →.
- **Numbers, one style:** indexes are two digits (01, 02); page numbers `01 / 08`; ranges with an en dash; thousands
  with a comma (186,787); measurements one decimal, a space, the unit (`214.0 px`, shown in mono capitals as
  `214.0 PX`); no number that claims a result.
- **Drafts are always flagged.** Every line Wajih hasn't signed off carries a visible Draft flag (the mono `Draft`
  before it, or its page's own draft line). Signed-off lines carry none. The lists are below.

**Machine check:** straight quotes, three dots, hyphen ranges, Title Case words in serif lines (outside the proper
name list), numbers in the wrong style, a `data-draft` line with no visible flag on it or its page, a signed-off line
that is flagged.

## 5. Every word placed with care

- Every text box on the grid, every baseline on a line (half a line for small text): `tools/gridcheck.py`.
- Balanced line breaks: in a heading or title (1.5 cells and up) the shortest line is at least half the longest.
- No lone words: no line of a multi-line text holds a single word.

**Machine check:** `gridcheck.py` (0 off by more than half a pixel); `typecheck.py` reads each text's lines from its
words' rects.

---

## Wording status (round 8b)

**Signed off (never flagged):** page 1 from "Glad you’re finally here." to "Now, how can we serve you?" (the verbs and
meanings included); the final room's heading "What’s the task list? Tick everything that fits."; "Cut to the chase".

**Drafts (always flagged):** the hallway's opening line ("We design backwards. …") and the five story lines; the
words inside the drawings (canvas 2's notes included: "Who: home buyers" …); the final room's rows, answers, "Next:
your details", the work slip's wording; the stubs' lines; any new wording a run adds.

---

## Screenshot self-check (what a machine can't judge)

Each item is passed with its screenshot (phone 384 × 734 and laptop 2160 × 1147 at least) saved in the run's shot
folder, named after the item.

1. **Rhythm:** headings, lines and labels feel like one family on every page; no size looks out of place.
2. **Breaks read well:** every line break falls at a natural pause (not between a word and its article, not inside a
   name or a number).
3. **The drawings' labels read at a glance** at rest on the S23 (nothing smaller than the asset sheet's smallest
   accepted size).
4. **Measurements sit along their lines** like a CAD drawing (DM Mono Light, centred on the dimension, turned with
   it) and never touch a letter.
5. **The X-ray names point at their own pieces** (Battery at the battery, Board at the board), with room on 360-wide
   phones.
6. **The frosted labels** turn with their drawings, as wide as the drawing, corners softly rounded, the words crisp at
   rest.
7. **Cut to the chase** reads as a quiet link, not a button.
8. **Drafts look flagged, finals look final** on every screen.

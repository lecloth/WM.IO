# STATE — Wajih Mansouri studio site (local experiment)

## Take 2 (started 22 Nov 2026)

**Read `STUDIO_BRIEF.md` Part 5 first.** It overrides everything above it in the brief, and this section overrides
Take 1's history below.

- **Folder:** `C:\wajih-mansouri-studio - Take 2` (this one).
- **Frozen:** `C:\wajih-mansouri-studio` is Take 1, git tag `take-1` (= `0c404ed`). Never write to it, never run anything in it.
- **Serve:** `python -m http.server 8109 --bind 127.0.0.1 --directory "C:\wajih-mansouri-studio - Take 2\site"`.
  Port 8109 only (Take 1 keeps 8108; never 8000, 8100–8102, 8105–8108).
- **Commits:** "studio take 2: <short title>"; the final commit gets tag `take-2`.
- **Phone:** Galaxy S23 over wireless debugging, `adb reverse tcp:8109 tcp:8109` (the site never leaves 127.0.0.1).
- **How it runs:** style lab first (Wajih points) → one page at a time: build → wording batch → his S23 test →
  geometry check → commit → this file. Stop for Wajih only at style picks, each page's wording, each page's phone review.

### Running order (Part 5 "Lab picks" + "Copy and the team page", ~35 viewports in total)

| # | Page | What happens | Viewports | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Enter + hook | Tap the point; Bell's 1877 plate becomes today's phone as an X-ray (named pieces) → matte → real materials | ~4 | **built, waiting for Wajih's phone review + wording** |
| 2 | For you | Visitor taps what fits them; the page answers; taps pre-tick the checklist | ~3 | stub |
| 3 | Checklist 1 | The C3 work slip, short version; "or see how we think" | ~1 | stub |
| 4 | Four trips | Security showpiece (~5: lock's A journey → failed pick → B3 → today); AI, websites, apps lighter (~3 each) | ~14 | stub |
| 5 | How we work | The gears: four principles, the Break stress test | ~4 | stub |
| 6 | Work: the corridor | Four apps + one website, each a doorway with a meaningful entry (our own designs) | ~5 | stub |
| 7 | Team | Three placeholder cards (image + bio), clearly marked | ~1 | stub |
| 8 | The final room | Full C3 work slip, founder line, every way to reach us (switches in settings.js) | ~2 | stub |
| 9 | Spec sheet | One screen of live numbers, then the loop back to the point | ~1 | stub |

### Page structure (Take 2)
- `src/index.template.html` + `src/parts/page-01.html` + `src/parts/stubs.html` → `python -I tools/build.py` → `site/index.html`.
  Build links `site/css/page-*.css` only. Entry: `site/js/main.js` (Take 1's is kept as `site/js/main.take1.js`, not bundled).
- Page 1: `site/js/page01/page.js` (scroll story, stops, labels, reduced motion), `site/js/page01/phone.js` (six-part phone,
  three looks, two clipping-plane wipes), `site/css/page-01.css` (also the 9-segment strip, gate, draft flag, stubs).
- Enter: `site/js/enter.js` (gate; tap/click/Enter/Space/wheel/swipe all enter; only a pointer tap/click unlocks vibration).
  Vibration: `site/js/engine/haptics.js`.
- Kept on disk for reuse, not loaded: Take 1 sheets (`site/js/sheets`, `sheet01..08`, `src/parts/sheet-*.html`,
  `site/css/sheet-*.css`), `opening.js` (its loop replay), `products/`, `settings.js`, the lab.
- Tests: `tools/t2shot.py` (stops), `tools/geom.py` (geometry check, 6 sizes × light/dark × stops), `tools/axe2.py`
  (axe + lengths), `tools/fps2.py` (emulated fps), `tools/phonep1.py` (real phone: real tap, fps, shots, geometry),
  `tools/vibcheck.py` (vibration rules). Positions in tests are scroll progress (`__p1.yAt(p)`), not screens.

### Take 2 log
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

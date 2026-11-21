# STATE — Wajih Mansouri studio site (local experiment)

Read `STUDIO_BRIEF.md` first. This file holds the decisions, what Wajih picked, what is done and what comes next.
Serve: `python -m http.server 8108 --bind 127.0.0.1 --directory "C:\wajih-mansouri-studio\site"`. Port 8108 only.

## Decisions by Wajih (STUDIO_BRIEF Part 2b, 21 Nov 2026 evening). They override everything above them in the brief.

- **Chalk is out.** No hand-drawn chalk, no line boil, no cartoon-blueprint look. The site is sharp, edgy and precise.
- **Line language:** CAD precision hairlines plus patent "Fig." plates.
- **3D look:** matte models with hairline edges.
- **Old drawings:** early telephone patents (Bell/Edison era) and Da Vinci machine studies.
- **Q1, what the curtain opens onto → B:** black and white first. Blue arrives once, as a cyanotype, when the hero phone pulls apart; afterwards only for patent-plate moments. Never a blue default background.
- **Q2, hero phone → made-up products only.** Never any of Wajih's existing builds (no POS, no car rental, nothing he has made), anywhere on the site: hero phone, the website pulled apart, the 03 Work sheets. Ambitious, high-tech, across industries. Invented brand names, each web-searched and dropped if a real company in that industry uses it. Labelled honestly as concept builds.
- **Q3, opening length → B:** about 2.5 s on a first visit, skippable, near-instant on return.
- **Assets Wajih supplies: none.** Everything is public domain or open licence (logged in `CREDITS.md`) or built in code.
- From Part 2: local only, no hosting or deploy for now.

## Hard rules (Part 4), short form

- Build only in `C:\wajih-mansouri-studio`. From the santalarch clone, only my own generic engine code, listed in `ENGINE_REUSE.md`. Never a santalarch asset, image, font, video, model, text, wordmark or scene.
- No cartoon characters, ever, and no film frames as assets.
- `CREDITS.md` logs every outside asset. Port 8108 only (never 8000, 8100–8102, 8105–8107).
- With Wajih: at most 3 questions per batch, each with options and a recommendation; 2–3 visual options side by side; one instruction per message; his to-dos in one block at the bottom.
- After each step Wajih approves: commit with a message starting `studio:` and update this file.

## Build decisions taken (mine, open to challenge)

- Static site, no build step: HTML + CSS + ES modules, GSAP/ScrollTrigger/Lenis vendored as classic scripts in `site/vendor/` (few files, loads reliably on Python's simple server).
- 1rem = window width / 90 on desktop (16 px at 1440); width / 24.375 on mobile (16 px at 390).
- Palette (light): paper #F2F0EB, ink #121212, graphite #6B6A66 (4.8:1 on paper, WCAG AA). Dark (later): board #0E0E0E, ink #F2F0EB, graphite #8C8B86.
- **The curtain is a difference-blend layer** coloured exactly like the paper, so the closed curtain reads as pure black and anything under it reads inverted. The same layer will be the "line that closes and opens" at chapter changes.
- **The timeline strip** has the 10 sheet names, is drawn by the real load progress (CSS reads one `--load` variable; tasks counted: stylesheet, gsap, ScrollTrigger, Lenis, app module, fonts, window load). It never runs ahead of the load and takes at least 0.5 s on a first visit. It then fills per sheet as you scroll; click jumps.
- **Opening timeline (first visit):**
  - The point breathes while loading.
  - At 0.05 s the line stretches.
  - At 0.1 s the 2 mm ruler opens from the centre, numbered in mm outwards (SCALE 1:1).
  - At 0.68 s the curtain opens vertically (0.9 s, expo in-out).
  - At 0.8 s the hold-line words rise.
  - At 1.0 s the centre lines draw.
  - At 1.45 s the dimension line measures the hold line in real millimetres.
  - At 1.55 s the rest fades in.
  - At 1.6 s scroll unlocks.
  - Measured at 1440×900: about 2.2–2.3 s from navigation to scroll.
  - Return visit (localStorage `wm:opened`) plays at 3.2×: about 0.8 s.
  - Any wheel, key, pointer or touch plays it at 12×.
  - `?first` in the URL forces a first visit.
- **Reduced motion:** no curtain, no breathing, no smooth scroll; the sheet shows its finished state immediately.
- **CAD crosshair cursor** (desktop, fine pointer): full-length hairlines, a pick box that grows over links, live X/Y in millimetres.
- **Title block** (fixed, bottom-right): Project / Sheet NN / 09 / Title / Scale 1:1 / Drawn W.M. / Rev 11.26. It updates as sheets pass.

## Waiting on Wajih

1. **Font pairing:** A (Archivo + IBM Plex Mono), B (Newsreader + DM Mono) or C (Barlow Semi Condensed + Barlow + B612 Mono), on `/type.html`. Each can be previewed live with `/?type=a|b|c`. The site currently uses A.
2. **Opening approval:** the opening as built (slice 1).
3. **Copy approval:** the sheet 00 lede ("Websites, shops and business apps, engineered to the millimetre, tested until nothing breaks, and handed over ready to run.") and the buttons are from the chat's draft pitch, not Wajih's words. "Tested until nothing breaks" may over-claim; to be confirmed or reworded.
4. **Later question batches** (from Part 1): contact email and WhatsApp; whether every founder-card line is true; whether to show Dubai as a location; portrait or not (photo or line drawing); the "reply within one working day" promise; what he's proudest of, what annoys him in other studios' sites, sites he loves.

## Done

- **Slice 1** (committed as `studio: slice 1 - opening, timeline, type options`):
  - Repo set up.
  - Opening end to end.
  - Timeline strip with the real load progress and scroll fill.
  - Board sheet 00 with frame, zones, centre lines, dimension line and title block.
  - Placeholder sheets 01–09.
  - CAD cursor.
  - Reduced motion and mobile layout.
  - `/type.html` with 3 pairings.
  - Checked at 1440×900 (first visit, return visit, skip, reduced motion, cursor) and 390×844; no console errors.

## Plan: the rest of the site, as slices in order

1. **Opening, timeline strip, type options:** done, awaiting Wajih's picks.
2. **Made-up products:** invent and web-check the brand names. Design the screens for the 4 phones (drone dispatcher, port operations, solar farm, jet charter) and the 3 websites (observatory booking, watchmaker shop, hospital bed-flow board) in black and white, each with its own hover colour.
3. **Hero, as 2–3 options side by side:**
   - a public-domain 1870s telephone patent figure redraws itself into the hero phone's outline;
   - the phone fills into a matte 3D model with hairline edges (parametric Three.js);
   - it explodes into Glass, Interface, Flow, Logic, Data, Lock as the cyanotype develops;
   - the phone rotates to the next product on each loop.
4. **03 Work, as 2–3 options side by side:** the concept sheets with title blocks, client colour on hover, honest "Concept sheet" labels.
5. **The thread:** the chapter-change line that closes and opens between sheets with black/white inversion, plus the other drafting-move transitions (tracing paper, dimension lines measuring the next sheet).
6. **01 Principles and 02 Method** on paper sheets, with Da Vinci machine-study margins (public-domain scans, credited).
7. **04 Services and 05 Also on the board.**
8. **06 Process:** the Diagnose → Draw → Build → Break → Hand over → Care mechanism, with the stress test on Break.
9. **07 Studio:** the founder card, every line confirmed true by Wajih.
10. **08 Contact:** the work-order form, with Wajih's real contact details.
11. **09 Spec sheet:** this site's own numbers measured from the local build (page weight, load time, performance and accessibility scores, fonts, trackers). The end line closes back into the point and loops to the singularity.
12. **Dark version and final passes:** WCAG AA audit in light and dark, reduced motion, mobile, keyboard and screen reader, cross-browser.

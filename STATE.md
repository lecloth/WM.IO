# STATE — Wajih Mansouri studio site (local experiment)

Read `STUDIO_BRIEF.md` first (Part 2c overrides everything above it). This file holds the decisions, what Wajih
picked, what is done and what comes next.
Serve: `python -m http.server 8108 --bind 127.0.0.1 --directory "C:\wajih-mansouri-studio\site"`. Port 8108 only.

## Decisions by Wajih

### Part 2c (21 Nov 2026, night): overrides everything above it

- **A full studio:** websites, apps and phones, platforms and web apps, engineering and infrastructure, cybersecurity, AI, consulting, monthly care. The voice is "we", go big.
- **No fabricated proof, ever:** no invented clients, testimonials, numbers, certifications (ISO, SOC 2, pen-test certificates), awards, or named or pictured team members. Made-up work is always labelled "Concept sheet".
- **Cleanliness for readability (hard rule):**
  - Reading moments are calm: text on clean sheets, generous whitespace, nothing moves under or behind text, and the grid and fibre go still and fade where text sits.
  - Spectacle happens only between reading moments, inside sticky scenes.
  - One idea per screen. Body lines at most about 65 characters; body text at least 18 px on desktop.
  - **Freeze-frame test:** pause on any frame mid-scroll and every piece of text on it must be readable.
- **Every discipline starts from its ancestor machine:** a public-domain plate redraws itself into what the studio builds today.
  - Websites ← rotary printing press.
  - Apps and phones ← Bell-era telephone.
  - Platforms ← telephone switchboard.
  - Engineering ← Edison-era electrical distribution.
  - Cybersecurity ← Yale-era pin-tumbler lock.
  - AI ← Babbage's Analytical Engine + Jacquard cards.
  - Consulting ← surveyor's theodolite.
  - Care has no ancestor.
  - Verify each plate is public domain and genuine; swap the ancestor if no good plate exists.
- **AI offer:**
  - agents with human checkpoints;
  - AI inside products;
  - private AI;
  - AI security ("We attack your AI before someone else does").
  - Lovelace line (1843, Note G) only after checking the exact wording against a primary source.
- **Title blocks** show DRAWN / CHECKED / APPROVED by discipline (design, engineering, security, AI, strategy), never a person.
- **Fourth principle, Locked:** "Security is drawn on sheet one, not bolted on at the end."
- **Studio:** "A bench, not a body shop." The founder card stays short and never mentions past builds.
- **Contact:** the work order's title block fills in live as the visitor types, with no outside service.
- **Two more concept products for 05 Work:** an insurer's AI claims assistant; a payments company's live security command board.
- **Copy:** the hold line stays "We draw it before we build it." The line under it is "Websites, apps, platforms, security and AI, engineered to the millimetre, tested until nothing breaks, and run long after launch." Wajih keeps "tested until nothing breaks".
- **Sheets:** 00 Opening · 01 The first drawing · 02 Principles (Exact, Felt, Proven, Locked) · 03 Disciplines · 04 Method · 05 Work · 06 Process (Break includes the lock-pick stress test) · 07 Studio · 08 Contact · 09 Spec sheet.

### Part 2b (still standing where 2c doesn't override)

- **Look:**
  - Chalk is out; the site is sharp and precise.
  - Line language: CAD hairlines plus patent "Fig." plates.
  - 3D: matte with hairline edges.
- **Colour:** black and white first. Blue arrives once, as a cyanotype, when the hero phone pulls apart; after that only at patent-plate moments.
- **Showcased work:** made-up products only, never Wajih's existing builds anywhere. Invented names are web-checked.
- **Opening:** about 2.5 s on a first visit, skippable, near-instant on return.
- **Assets:** Wajih supplies none.
- **Font pairing:** A (Archivo + IBM Plex Mono) stays unless he picks B or C on `/type.html`.

## Hard rules (Part 4), short form

- Build only in `C:\wajih-mansouri-studio`. From the santalarch clone, only my own generic engine code (`ENGINE_REUSE.md`). Never a santalarch asset, text or scene.
- No cartoon characters, ever. `CREDITS.md` logs every outside asset. Port 8108 only.
- With Wajih:
  - at most 3 questions a batch, with options and a recommendation;
  - 2–3 visual options side by side;
  - one instruction per message;
  - his to-dos in one block at the bottom.
- After each approved step: commit with a message starting `studio:` and update this file.

## Build decisions taken (mine, open to challenge)

- **Delivery:** a static site with no build step: HTML + CSS + ES modules. GSAP, ScrollTrigger and Lenis are vendored as classic scripts; three.js 0.183 is an ES module through an import map. 1rem = width / 90 on desktop and width / 24.375 on mobile.
- **Palette:**
  - paper #F2F0EB, ink #121212, graphite #6B6A66 (4.8:1);
  - cyanotype ground #173F73 with ink #ECF1F6 (about 10:1).
  - Dark version later: #0E0E0E / #F2F0EB / #8C8B86.
- **Opening (slice 1):**
  - The curtain is a difference-blend layer in the paper colour.
  - The strip is drawn by the real load progress.
  - First visit about 2.3 s to scroll, return about 0.8 s, skip at 12×.
- **Board grid:** static. Its slice-1 cursor and scroll drift was removed, so nothing moves under text.
- **Act 1 (sheets 00 + 01) is one sticky stage, 9.4 viewport heights long.** Everything is a pure function of scroll (`render(p)`), so any frame can be frozen. Timeline in viewport-heights of scroll:

  | Scroll (vh) | What happens |
  |---|---|
  | 0–0.9 | The curtain closes over the opening (text it covers inverts, never disappears mid-word) |
  | 0.86–1.09 | Pure black and the one line; the sheets swap underneath |
  | 1.05–1.95 | The curtain reopens onto Bell's plate |
  | 0.95–2.55 | **Reading moment 1**: the plate and its caption; nothing moves |
  | 2.6 | The plate drops out whole (no half-cut words). Fig. 1 stays, as the real plate pixels plus traced hairlines |
  | 2.75–3.3 | Fig. 1 travels to the phone's place |
  | 3.3–4.4 | A sweep turns Bell's ink into hairlines that un-draw while the phone's CAD outline (body, screen, sensor, keys, centre lines) draws on |
  | 4.35–4.85 | The outline fills into the matte 3D phone (orthographic "drawing" camera, so the outline and the model line up exactly) |
  | 4.85–6.2 | The phone turns to an axonometric view and pulls apart into Glass, Interface, Flow, Logic, Data, Lock (25 mm gaps) |
  | 5.25–6.45 | The cyanotype develops: a ragged tide from the phone outwards, paper to Prussian blue, ink to white, the grid included (one shader pass) |
  | 6.45–7.05 | Labels and leader lines, plus 154.0 / 74.0 mm dimension lines. Label text is either fully on or off, never faded |
  | 7.1–8.38 | **Reading moment 2**: "The whole business in one pocket." with the Concept sheet tag |

- **Hover:** over the phone's screen in the final state, LOFTHAUL's own colour (signal orange #FF5B1F) appears, rendered in true colour through the cyanotype.
- **Reduced motion:** act 1 becomes three finished, static sheets one under another: opening, plate, developed exploded phone with its text.
- **Mobile:** the same story; the phone is smaller and shifted left, the labels sit in a clear column, the reading blocks sit above a one-row title block.
- **Verified:**
  - frame rate while scrolling (`tools/fps.py`, headless Chromium, ANGLE D3D11): desktop 1440×900 56–57 fps, p95 16.8 ms; mobile 390×844 56 fps, p95 16.8 ms; about 1–2% of frames over 25 ms;
  - no console errors.
- **LOFTHAUL name check:** web-searched 21 Nov 2026 ("Lofthaul" drone delivery); no company or product found.
- **Regenerating Fig. 1 vectors:**
  - `tools/sources/` (git-ignored) holds the downloaded PDF and page images; `tools/pylib/` holds PyMuPDF and potracer.
  - Re-download the PDF from the URL in `CREDITS.md`, extract page 0 to `tools/sources/pdf_p0.png`, crop `(470,555,1690,1150)` to `fig1.png`, then run `python -I tools/trace_fig1.py`.

## Waiting on Wajih

1. Look at sheet 01 and say what feels wrong or right.
2. Font pairing pick (A / B / C) on `/type.html`. A is in use.
3. **Later question batches:**
   - contact email and WhatsApp;
   - whether Dubai shows as a location;
   - portrait or not (photo or line drawing);
   - the "reply within one working day" promise;
   - what he's proudest of, what annoys him in other studios' sites, sites he loves;
   - whether the founder card's lines are true.

## Not done yet (known)

- **Product rotation on each loop:** not wired. The page has no loop yet (it arrives with sheet 09) and only one product (LOFTHAUL) is designed. The others come with slice 4.
- **Sheets 02–09** are placeholders.

## Done

- **Slice 1:** `studio: slice 1 - opening, timeline, type options`. Opening, timeline strip, board, title block, CAD cursor, reduced motion, mobile, `/type.html`.
- **Slice 2:** `studio: slice 2 - first drawing, full-studio copy`.
  - Part 2c copy in the strip, title blocks (Drawn/Checked/Approved by discipline), opening line and type page.
  - The line closing and reopening.
  - Bell's US 186,787 plate (verified, credited) redrawing into the phone outline.
  - The matte 3D phone built in code, with explode, labels, dimension lines and the cyanotype.
  - LOFTHAUL designed as a real dispatcher screen.
  - Freeze-frame checked at 1440×900 and 390×844, reduced motion, hover, frame rate.

## Plan: the rest of the site, as slices in order

1. **Opening, timeline strip, type options:** done.
2. **01 The first drawing:** done.
3. **03 Disciplines, shown as 2–3 options first.**
   - Source and verify the remaining ancestor plates (printing press, switchboard, Edison distribution, pin-tumbler lock, Analytical Engine + Jacquard cards, theodolite).
   - Each plate redraws into today's build, one sticky scene each or a shared one.
   - The lock-pick moment for security.
   - The punch-card → AI answer moment, with the Lovelace line verified from a primary source.
4. **The concept products:**
   - The remaining phones (container port, solar farm, jet charter) and websites (observatory booking, watchmaker shop, hospital bed-flow board), plus the AI claims assistant and the payments security board.
   - Every name web-checked; each designed for real, in black and white with its own hover colour.
5. **05 Work:** concept sheets with title blocks, honest "Concept sheet" labels, client colour on hover.
6. **The thread:** the line closing and opening at every chapter change, sheets passing with black/white inversion, dimension lines measuring the next sheet, tracing-paper slides.
7. **02 Principles:** Exact, Felt, Proven, Locked on clean sheets, with Da Vinci machine-study margins (public-domain scans, credited).
8. **04 Method.**
9. **06 Process:** the Diagnose → Draw → Build → Break → Hand over → Care mechanism; Break as a stress test including the lock pick.
10. **07 Studio:** the bench, and a short founder card (every line confirmed by Wajih).
11. **08 Contact:** the live work order (the title block fills in as he types, in the browser, no outside service) with Wajih's real contact details.
12. **09 Spec sheet:** this site's own measured numbers. The line closes back into the point, the page loops, and the hero phone rotates to the next product on each loop.
13. **Dark version and final passes:** WCAG AA audit in light and dark, reduced motion, mobile, keyboard and screen reader, cross-browser.

# Builder brief — Wajih Mansouri studio site (read fully before you start)

You are one of several builders finishing a local studio website for Wajih Mansouri, in parallel. The lead (me) set up
the engine, sheet 00 (opening) and sheet 01 (Bell's plate → phone history → 3D phone → cyanotype). Wajih called sheet 01
"so beautiful": **every sheet you build must hold that craft level.** Study it first: open http://127.0.0.1:8109/ and
scroll through, and read `site/js/sheet01/*.js` and `site/css/site.css`.

## Read first
1. `C:\wajih-mansouri-studio - Take 2\STUDIO_BRIEF.md`: Part 5 first (Take 2 overrides everything above it), then
   Parts 2b, 2c, 2d, 3, 4 (2d overrides 2c overrides 2b overrides 3).
2. `C:\wajih-mansouri-studio - Take 2\STATE.md`: decisions, architecture.
   (`C:\wajih-mansouri-studio` is Take 1 and frozen: never write to it or run anything in it.)
3. This file.

## Hard rules (from the brief, non-negotiable)
- **No fabricated proof**, ever: no invented clients, testimonials, numbers, statistics, certifications (ISO, SOC 2,
  pen-test certificates), awards, or named/pictured team members. Every claim true and grounded. Made-up products are
  always labelled "Concept sheet" and never presented as clients. Never mention Wajih's past builds (no POS, no café
  software, no car rental, nothing he has made).
- **Cleanliness / readability (hard rule):** reading moments are calm: text on clean paper, generous whitespace, nothing
  moves under or behind text, grid/texture still where text sits. Spectacle only between reading moments inside sticky
  scenes. One idea per screen. Body text ≥ 18 px on desktop (use `.body` = 1.1875rem or `.read__body` = 1.25rem; 1rem =
  16 px at 1440), lines ≤ ~65 characters. **Freeze-frame test:** pause on ANY frame mid-scroll and every piece of text
  on it must be readable: text is either fully shown or not shown (toggle a class, CSS fades ≤ .25 s), never scrubbed
  half-opacity, never moving while visible (except whole sheets passing), never crossed by a half-wipe.
- **Look:** black-and-white CAD precision hairlines + patent "Fig." plates + matte 3D with hairline edges + Da Vinci
  machine studies in the margins (never behind text). No chalk, no hand-drawn wobble, no cartoon anything, no
  characters. No AI-look gradients/glows, no glossy stock devices, no code-on-screen clichés. Blue (cyanotype Prussian
  `--prus` with `--blueprint-ink` lines) only at patent-plate moments.
- **Chapter changes:** the line closing/opening is the signature, but **no two chapter changes may look the same** and
  any black moment must *do* something. Use your assigned move (below).
- **Assets:** only public-domain or open-licence material you verify (download it, check the licence/source page,
  check it is genuinely what it claims), or things made in code. Log every outside asset in your notes file with
  source URL, licence and where used (the lead merges into `CREDITS.md`). No santalarch anything. No logos, no brand
  names on devices, no copy of any one brand's recognisable design.
- **Every date/fact** you put on the site: verify with a reliable source (use web search) and list the source in your
  notes file.
- Product names you invent: web-search each; drop any a real company in that industry uses; log the check.
- Serve/test only on port 8109 (already running: `python -m http.server 8109 --bind 127.0.0.1 --directory site`).
  If it is down, restart it with exactly that command from `C:\wajih-mansouri-studio - Take 2`. Never use ports 8000,
  8100–8102 or 8105–8108.
- **Do not git commit** (the lead commits each slice). Do not edit files you don't own (list in your task). If you
  need a change in a shared file, describe it in your final report instead.

## Architecture
- Markup: `src/parts/sheet-NN.html` → run `python -I tools/build.py` after ANY markup change (it regenerates
  `site/index.html` from `src/index.template.html`). Never edit `site/index.html` directly.
- CSS: `site/css/sheet-NN.css` (auto-linked). Scope every rule under `#sheet-NN` (or your own prefixed classes).
- JS: `site/js/sheets/sheet-NN.js` exporting `init(engine)` (already imported by `main.js`). Put helpers under
  `site/js/sheetNN/…`. ES modules; `three` / `three/addons/...` are available via the import map
  (`site/vendor/three/`: core + LineSegments2/LineSegmentsGeometry/LineMaterial/RoundedBoxGeometry; if you need another
  addon, copy it from `tools/node_modules/three/examples/jsm/` into `site/vendor/three/addons/` and say so).
  gsap + ScrollTrigger + Lenis are globals (window.gsap etc.), wrapped by `engine` (`site/js/engine/core.js`).
- **Chapter contract** (`site/js/engine/kit.js`, read its header): your section is
  `<section class="chapter" id="sheet-NN" data-sheet="NN" data-title=".." data-drawn=".." data-checked=".." data-approved=".." style="--units: N">`
  with one `<div class="chapter__stage">` inside. It overlaps the previous sheet by one viewport; `chapter(engine,
  section, { render(p), layout(), reduced() })` gives you `p` in true viewport heights of scroll, 0..units+1 (section height is (units+1)·100lvh). **p 0→1 is your incoming
  chapter change**, drawn in place over the previous sheet, which stays pinned underneath (your stage is transparent
  where you want the previous sheet to show; by p = 1 your stage must be opaque). Make `render(p)` a pure function of p
  (scrubbable, freezable). Several sections may share a sheet number (sub-scenes): the strip fills across all of them
  and each may set its own `data-title`/`data-drawn`/… for the title block.
- **Title block by discipline:** Drawn / Checked / Approved use only: Design, Engineering, Security, AI, Strategy.
- **Colours only through CSS tokens:** `--paper #F2F0EB`, `--ink #121212`, `--graphite #6B6A66`, `--prus #173F73`,
  `--blueprint-ink #ECF1F6`. Canvases/WebGL must read tokens via `token('--ink')` (kit.js) on every redraw and redraw on
  `engine.on('theme', …)` (a dark version comes later by swapping tokens).
- Type: `.display` (Newsreader, optical size), `.body`, `.mono` (DM Mono labels, uppercase), `.read`, `.read__eyebrow`,
  `.read__title`, `.read__body` patterns from site.css. Reuse them.
- Shared visual language from sheet 01 to reuse: drawing frame `.frame` with zone markers, centre lines, dimension
  lines with arrowheads + mono values, leader-line labels "01 NAME / sub line", hairline draw-on (`drawable()` in kit.js),
  "Fig. N · Scale 1:x" eyebrows.
- **Reduced motion** (`engine.reduced`): no scrubbing; each sheet shows its finished state as calm static content
  (your `reduced()` callback; `.chapter.is-static` CSS makes the section flow normally).
- **Mobile 390×844** (`max-width: 1023px`): same story, rethought layout, nothing overlapping, text ≥ 16 px.
- **Performance:** render on demand (only when p changes), no per-frame layout thrash, `will-change` sparingly.
  Target ≥ 55 fps while scrolling (`python -I tools/fps.py` measures act 1; adapt a copy for your sheet if useful).

## Tools (Python, run from `C:\wajih-mansouri-studio - Take 2`)
- `python -I tools/shoot.py --ys 20000,21000 --out tools/shots/<you> --prefix x [--mobile] [--reduced] [--mouse x,y] [--times ms,...]`
  screenshots (1440×900 default). View them with the Read tool. `tools/sheet.py <dir> <prefix> <out.jpg> <cols>` makes
  a contact sheet. Find your sheet's scroll range: `document.getElementById('sheet-NN')` top (scrollY) in the page;
  `python -I tools/probe.py y1,y2` is an example probe script you can copy.
- Browser runs are serialised by a lock (`tools/browserlock.py`) because the simple server drops connections under
  parallel load: if your run waits, another builder is testing. Keep runs short.
- patchright evaluates in an isolated world by default; to touch page globals use `page.evaluate(js, isolated_context=False)`.

## Done means
1. Your sheet works end to end (desktop 1440×900 and 1920×1080, mobile 390×844), incoming chapter change included.
2. Freeze-frame test passed on many positions (screenshots), no console errors, smooth, reduced motion shows the
   finished state, hover/keyboard states work (focus-visible outlines on anything interactive).
3. Notes file `tools/notes/sheet-NN.md`: what you built, decisions you made alone (with why), every outside asset
   (source, licence, where used), every fact with its source, known limits.
4. Final report to the lead: short.

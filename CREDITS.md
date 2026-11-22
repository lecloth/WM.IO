# CREDITS: every outside asset in `site/`

Rebuilt by the truth sweep on 21 Nov 2026 from the files actually on disk (`site/fonts`, `site/vendor`, `site/media/**`).
Every licence below was checked against its source page or licence text on that date; the checks and URLs are logged
in `tools/notes/sweep-truth.md`. Nothing else in `site/` comes from outside: everything not listed here is drawn or
written in code for this site (see the last section).

## Typefaces (`site/fonts/`)

| File | What it is | Source | Licence | Where used |
|---|---|---|---|---|
| `newsreader-var.woff2`, `newsreader-var-italic.woff2` | Newsreader, variable (weight 200–800, optical size 6–72), roman + italic, v5.3.0 | npm `@fontsource-variable/newsreader` (Production Type, via Google Fonts), https://github.com/productiontype/Newsreader | SIL Open Font License 1.1; full text shipped as `site/fonts/LICENSE-newsreader.txt` | Site-wide: headlines, body, product screens |
| `dm-mono-400.woff2`, `dm-mono-500.woff2` | DM Mono 400 and 500, v5.3.0 | npm `@fontsource/dm-mono` (Colophon Foundry for Google), https://github.com/googlefonts/dm-mono | SIL Open Font License 1.1; full text shipped as `site/fonts/LICENSE-dm-mono.txt` | Labels, strip, title blocks, dimensions, product screens |

No other font files are shipped. Pairings A and C were removed in slice 3 with `/type.html`; none of their files or
`@font-face` rules remain (checked: `site/css/*.css` declares only the four files above).

## Libraries (`site/vendor/`)

| File(s) | Library | Source | Licence | Where used |
|---|---|---|---|---|
| `gsap.min.js`, `ScrollTrigger.min.js` | GSAP 3.15.0 + ScrollTrigger 3.15.0 (GreenSock, now Webflow) | npm `gsap` | GSAP Standard "no charge" licence, https://gsap.com/standard-license. Free for commercial websites; **not** an open-source (OSI) licence. No attribution required; the copyright headers in both files are kept intact, as the licence asks. | Opening timeline, strip fills, title block, every scroll scene (via `site/js/engine/core.js`) |
| `lenis.min.js` | Lenis 1.3.17 (darkroom.engineering) | npm `lenis` (file identical to `lenis/dist/lenis.min.js`) | MIT. The minified file carries no notice, so the licence text is shipped beside it as `site/vendor/lenis-LICENSE.txt` (added by the truth sweep) | Heavy smooth scroll |
| `three/three.module.min.js`, `three/three.core.min.js`, `three/addons/lines/{LineSegments2,LineSegmentsGeometry,LineMaterial}.js`, `three/addons/geometries/RoundedBoxGeometry.js` | three.js r183 (0.183.0) core + four addons | npm `three` (identical to `three/build/three.module.min.js`) | MIT; full text shipped as `site/vendor/three/LICENSE.txt` | The 3D hero phone on sheet 01 (loaded through the import map; not bundled into `site/dist/`) |
| `three/addons/loaders/{GLTFLoader,STLLoader}.js`, `three/addons/utils/{BufferGeometryUtils,SkeletonUtils}.js`, `three/addons/environments/RoomEnvironment.js` (Take 2) | three.js r183 addons, unmodified | npm `three` 0.183.0 (`examples/jsm/`) | MIT (same `site/vendor/three/LICENSE.txt`) | Take 2 style lab (`site/dev/lab/`): loading the real 3D models, the studio-light environment for A2; **page 1**: RoomEnvironment lights the phone's real materials |
| `axe.min.js` | axe-core 4.14.1 (Deque Systems), unmodified | npm `axe-core` (identical file) | Mozilla Public License 2.0; full text shipped as `site/vendor/axe-LICENSE.txt`, MPL header kept in the file | Sheet 09: the live accessibility check (WCAG 2.1 A/AA rules), loaded on demand |

`site/dist/` holds only this site's own code bundled by esbuild (three, gsap and lenis stay external), so it adds
no outside code.

## Plates and scans (`site/media/`)

### US patent drawings (`site/media/plates/`)

All six are United States patents granted 1863–1883. Public domain: US works published before 1931 are in the public
domain, and USPTO patent text and drawings are generally not subject to copyright
(https://www.uspto.gov/terms-use-uspto-websites). Scans: USPTO page images as served by Google Patents. Every date,
name and figure description below was read in the patent's own text (PDF text layer) by the truth sweep.

| Files | Patent (verified from the specification) | Source | Licence | Where used |
|---|---|---|---|---|
| `bell-us186787-sheet1.webp` (header, Figs. 1–2, levels adjusted); `bell-us186787-fig1.webp` (Fig. 1, ink on transparent); traced vectors in `site/js/sheet01/bell-fig1.js` | **US 186,787**, Alexander Graham Bell of Boston, "Improvement in Electric Telegraphy", dated 30 Jan 1877 (filed 15 Jan 1877), 2 sheets. Fig. 1 "a perspective view of one form of my electric telephone"; Fig. 2 "a vertical section of the same"; D sounding box, E speaking-tube. Bell's second telephone patent (it cites his No. 174,465 of 7 Mar 1876). | https://patents.google.com/patent/US186787A · PDF https://patentimages.storage.googleapis.com/1c/e2/db/6cda4a354add60/US186787.pdf | Public domain | Take 1: sheet 01 plate and redraw, the phone history's Fig. 1, sheet 03.2 recap. **Take 2 page 1**: `bell-us186787-sheet1.webp`, the opening plate (and its cyanotype negative) |
| `bullock-us38200-sheet.webp`, `bullock-us38200-fig.webp`; traced `site/js/sheet03/plates/bullock-us38200.js` | **US 38,200**, William Bullock of Pittsburg, Pennsylvania, "Printing-Machine", dated 14 Apr 1863, 5 sheets; sheet 1, Fig. 1. Paper "furnished to the machine in a continuous web or roll", sheets "severed from the web, printed on both sides", passing "once only through the press"; "eighteen thousand sheets of newspapers or other printed matter in an hour". | https://patents.google.com/patent/US38200A/en · PDF https://patentimages.storage.googleapis.com/pdfs/US38200.pdf | Public domain | Sheet 03.1 Websites |
| `firman-us252576-sheet.webp`, `firman-us252576-fig.webp`; traced `site/js/sheet03/plates/firman-us252576.js` | **US 252,576**, Leroy B. Firman of Chicago, assignor to the Western Electric Manufacturing Company, "Multiple Switch-Board for Telephone-Exchanges", dated 17 Jan 1882 (filed 7 Jan 1881); Fig. 1 (boards A A1 A2 + indicator board B), drawn turned on the sheet | https://patents.google.com/patent/US252576A/en · PDF https://patentimages.storage.googleapis.com/pdfs/US252576.pdf | Public domain | Sheet 03.3 Platforms |
| `edison-us274290-sheet.webp`, `edison-us274290-fig.webp`; traced `site/js/sheet03/plates/edison-us274290.js` | **US 274,290**, Thomas A. Edison of Menlo Park, New Jersey, "System of Electrical Distribution", dated 20 Mar 1883 (filed 27 Nov 1882), 3 sheets; sheet 1 = Figs. 1–4; the redraw uses Figs. 1–2 | https://patents.google.com/patent/US274290A/en · PDF https://patentimages.storage.googleapis.com/pdfs/US274290.pdf | Public domain | Sheet 03.4 Engineering and infrastructure |
| `sec-yale-us48475-sheet.webp`, `sec-yale-us48475-fig4.webp` (Figs. 4 and 6, turned upright); traced `site/js/sheet03b/yale-fig4.js` | **US 48,475**, Linus Yale Jr. of Shelburne Falls, Massachusetts, "Improvement in Locks", dated 27 Jun 1865; one drawing sheet, Figs. 1–20 | https://patents.google.com/patent/US48475A · PDF https://patentimages.storage.googleapis.com/7f/9d/64/b736a3027fc5bf/US48475.pdf | Public domain | Sheet 03 Security plate and redraw |
| `holmes-us275913-sheet.webp`, `holmes-us275913-fig.webp`; traced `site/js/sheet03/plates/holmes-us275913.js` | **US 275,913**, Joseph W. Holmes of Batavia, New York, "Solar Theodolite", dated 17 Apr 1883 (filed 12 Sep 1882), 2 sheets; sheet 1 = Figs. 1 and 3 (elevations) | https://patents.google.com/patent/US275913A/en · PDF https://patentimages.storage.googleapis.com/pdfs/US275913.pdf | Public domain | Sheet 03.7 Consulting |

### Babbage and Jacquard (`site/media/plates/`)

| File | What it is | Source | Licence | Where used |
|---|---|---|---|---|
| `ai-babbage-plan25-1840.webp` | Charles Babbage, Plan 25, "The General Plan of Mr Babbage's Great Calculating Engine", inscribed "Plan 25 · 6 August 1840"; photographed as displayed at the Computer History Museum | Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Babbage_Analytical_Engine_Plan_1840_CHM.agr.jpg (1920 px rendition), photo by **ArnoldReinhold** ("Own work", 2018) | Drawing: public domain (Babbage d. 1871). **Photo: CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/. Changes made: cropped, converted to greyscale, flat-field corrected, levels. | Sheet 03 AI plate and redraw. **On-site attribution** (CC BY 4.0 §3(a): credit, licence link, changes indicated): the plate's caption reads "photo ArnoldReinhold, CC BY 4.0, cropped and toned", with "ArnoldReinhold" linked to the Commons file page and "CC BY 4.0" linked to the licence; the sheet 09 colophon also notes the one CC BY photo. |
| `ai-posselt-1888-fig22.webp` | E. A. Posselt, *The Jacquard Machine Analyzed and Explained, with an Appendix on the Preparation of Jacquard Cards*, Philadelphia, 1888 (title page; "Copyrighted, 1887"), Fig. 22, a punched Jacquard card | Internet Archive `jacquardmachinea00poss` (Library of Congress copy), https://archive.org/details/jacquardmachinea00poss | Public domain (US, published 1888). IA/LoC rights line: "The Library of Congress is unaware of any copyright restrictions for this item." | Sheet 03 AI plate; the code-drawn cards follow its layout |

### Leonardo da Vinci, Codex Madrid I (`site/media/davinci/`)

| File | Folio (verified against the RWTH Aachen edition's folio titles and figure notes) | Source | Licence | Where used |
|---|---|---|---|---|
| `madrid1-f016r-fusee.webp` | f. 16r, "Clock: compensation of declining spring force" (spring drum, toothed spiral, conical pinion; note "Ogni arte dimanda il suo strumento") | Biblioteca Nacional de España, Mss/8937 (Codex Madrid I, 1490–1499). File: the BNE scan as served by the RWTH Aachen Codex Madrid I edition, https://www.codex-madrid.rwth-aachen.de/folia1/f016r.jpg (plain folio file, no RWTH graphics), mirrored back to reading orientation, cropped, inked to an alpha mask | Drawing: public domain (Leonardo d. 1519). Scan: the BNE releases its public-domain images for free reuse, commercial included, citing the source (BNE open-data entry lists CC BY 4.0: https://datos.gob.es/es/catalogo/ea0019768-biblioteca-digital-documentos-en-dominio-publico1); in the EU a faithful reproduction of a public-domain work gets no new copyright (Directive 2019/790, Art. 14). | Sheet 02, Principle 01 "Exact" |
| `madrid1-f079v-springs.webp` | f. 79v, "Lock springs" (Fig. 2: a model spring with a thick base and a thin tapering arm) | Same codex: https://www.codex-madrid.rwth-aachen.de/folia1/f079v.jpg | Same | Principle 02 "Felt" |
| `madrid1-f004v-force-gauge.webp` | f. 4v, "Screw: instrument for measuring the force of a screw drive" (frame, threaded rod, nut with weight, lever notched for weights; a load on a rope over a pulley) | Same codex: https://www.codex-madrid.rwth-aachen.de/folia1/f004v.jpg | Same | Principle 03 "Proven" |
| `madrid1-f050r-lock.webp` | f. 50r, "Lock technique: pincer locks" (a chest lock that snaps shut by itself; the key is needed only to open it) | Same codex: https://www.codex-madrid.rwth-aachen.de/folia1/f050r.jpg | Same | Principle 04 "Locked" |

**On-site credit:** each caption names Leonardo, the codex, the folio and the decade; the sheet 09 colophon names the
Biblioteca Nacional de España as the source of the folios (the BNE asks reusers to cite the source).

## Take 2 scans (`site/media/take2/`, `site/media/paper/`), used in the style lab

Search log and every candidate: `tools/notes/take2-sources.md`. Crops keep the original paper, ink and wear.

| File | What it is | Source | Licence | Where used |
|---|---|---|---|---|
| `take2/dumoncel-1879-fig16.webp` | Th. du Moncel, *The Telephone, the Microphone and the Phonograph* (New York: Harper, 1879), p. 49, Fig. 16: Bell's box telephone in section | Internet Archive `telephonemicroph00dumorich` (University of California Libraries scan), https://archive.org/details/telephonemicroph00dumorich | Public domain (US, 1879; IA: NOT_IN_COPYRIGHT) | Lab C1–C3 ("An app") |
| `take2/columbian-press-1852.webp` | "Clymer and Dixon's patent Columbian printing press", lithograph, London, 31 Jan 1852 (C. F. Light del., Martin & Hood lith.), whole plate | Wellcome Collection 46115i, https://wellcomecollection.org/works/gzv6egr4 | Public Domain Mark (Wellcome catalogue API) | Lab C1–C3 ("A website") |
| `take2/miller-1905-fig215.webp` | Kempster B. Miller, *American Telephone Practice* (1905), p. 242, Fig. 215 "Front view of Paris switch-board section" | Internet Archive `americantelepho00mill` (Library of Congress copy), https://archive.org/details/americantelepho00mill | Public domain (US, 1905; LoC: no known restrictions) | Lab C1–C3 ("My systems are a mess") |
| `take2/hughes-cards-fig6-7.webp` | "Mr. J. Hughes improved Cards for weaving figured Silks", Plate 5, Figs. 6–7 (drawn by C. Varley, engraved by G. Gladwin) | Wellcome Collection V0024104, https://wellcomecollection.org/works/v7gbu44b | Public Domain Mark (Wellcome catalogue API) | Lab C1–C3 ("AI working for me"). No date shown: Wellcome's "1753" can't be right (Varley b. 1781) |
| `paper/miller-1905-paper.webp` | A blank margin of Miller 1905, IA scan page n262 (the page after p. 242), desaturated and mirrored into a seamless tile | Same IA item as above | Public domain | Lab A2; **page 1**: the real paper under the finished phone (`site/css/page-01.css`) |

## Take 2 3D model (`site/media/models/lock/`)

| Files | What it is | Source | Licence | Where used |
|---|---|---|---|---|
| `body.stl`, `core.stl`, `lid.stl`, `clip.stl`, `pin-a…e.stl`, `driver-{standard,spool,mushroom,serrated,tpin}.stl`, `key_abcde.stl` (15 of the 21 files, unmodified binary STL, 7.2 MB, 148,042 triangles) + our own `manifest.json` (part names, explode offsets) | **"Cutaway Lock" by zbzzn**: a 5-pin pin-tumbler cutaway (housing, plug, retaining clip, cap, five key pins, five drivers including security pins, keys), parts in their assembled positions | Printables model 250197, https://www.printables.com/model/250197, downloaded by Wajih (logged in) on 22 Nov 2026 as `cutaway-lock-250197.zip` (21 STLs + Printables' info sheet) | **CC BY 4.0** (commercial use allowed; credit required): "Cutaway Lock" by zbzzn, https://creativecommons.org/licenses/by/4.0/. Changes: restyled (matte, brass/steel, X-ray), taken apart and animated; pins lifted by the key's own profile | Style lab A1–A3 (assembly) and B1–B3 (trip into the lock). On the live site the credit line goes in the caption and the spec sheet |

## Made in code (no outside asset)

- Drafting-film grid and fibre texture: CSS gradients plus an inline SVG `feTurbulence` filter (`site/css/site.css`).
- Ruler, dimension lines, drawing frames with zone markers, centre lines, title blocks, CAD crosshair: HTML/CSS/SVG.
- The phone history drawings (c. 1900 to 2007): generic forms drawn in code (`site/js/sheet01/eras.js`); no logos, no
  brand names, no copy of any one maker's design. Facts: STATE.md "Phone history: sources" and `tools/notes/sweep-truth.md`.
- The hero phone (six layers, edges, materials), the cyanotype shader, labels and dimensions: three.js and GLSL.
- **Take 2 page 1:** today's phone in six parts (glass, screen, frame, board, battery, back), its X-ray / matte / real looks, the scan-line wipes and the screen (the next page's question) are drawn in code from Take 1's hero phone (`site/js/page01/phone.js`). No logos, no brand shapes.
- The nine concept products (LOFTHAUL, QUAYCALL, STRINGWALK, OVERWING, NIGHTWELL, HALVANE, WARDCAST, QUILLFIELD,
  FERNPAY) and the AI sheet's quote for "Hollin & Pike Joinery": made-up names (web-checked, `tools/notes/products.md`,
  `tools/notes/sheet-03b.md`), screens drawn on canvas in code, always labelled "Concept sheet".
- Today's drawings on sheet 03, the pin-tumbler lock and pick, Babbage's engine redraw and its cards, the Method
  drawings (sheet 04), the gear ring and stress test (sheet 06), the bench plan and fold (sheet 07), the work order
  (sheet 08), the spec sheet (sheet 09): SVG/CSS/JS written for this site.
- `site/dev/products.html` (dev gallery): uses only the products library and the two typefaces above.

## Dev-only tools (not shipped in `site/`)

- Patchright / Playwright Chromium for screenshots and frame-rate checks; Pillow for contact sheets; esbuild for the
  bundle (`tools/node_modules`).
- PyMuPDF (AGPL, dev only) to read and extract the patent PDFs; potracer (GPL port of potrace, dev only) to trace the
  plate figures into vectors. Only their output paths ship, not the tools.

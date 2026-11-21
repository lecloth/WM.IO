# CREDITS — every outside asset and library

| Asset | Source | Licence | Where it is used |
|---|---|---|---|
| Newsreader (variable: weight 200–800, optical size 6–72) v5.3.0 | Fontsource npm `@fontsource-variable/newsreader` (Production Type, via Google Fonts) | SIL OFL 1.1 (`LICENSE-newsreader.txt`) | `site/fonts/newsreader-var*.woff2`; the site typeface for headlines and body |
| DM Mono 400, 500 v5.3.0 | Fontsource npm `@fontsource/dm-mono` (Colophon Foundry) | SIL OFL 1.1 (`LICENSE-dm-mono.txt`) | `site/fonts/dm-mono-*.woff2`; labels, strip, title blocks, dimensions, product screens |
| GSAP 3.15.0 + ScrollTrigger | npm `gsap` (GreenSock / Webflow) | GSAP Standard "no charge" license, https://gsap.com/standard-license | `site/vendor/gsap.min.js`, `site/vendor/ScrollTrigger.min.js`; opening timeline, strip fills, title block |
| Lenis 1.3.17 | npm `lenis` (darkroom.engineering) | MIT | `site/vendor/lenis.min.js`; heavy smooth scroll |
| three.js 0.183.0 (core + `LineSegments2`, `LineSegmentsGeometry`, `LineMaterial`, `RoundedBoxGeometry` addons) | npm `three` | MIT (`site/vendor/three/LICENSE.txt`) | `site/vendor/three/`; the hero phone on sheet 01 |
| **Patent plate:** A. G. Bell, US Patent 186,787, "Improvement in Electric Telegraphy", granted 30 Jan 1877, drawing sheet 1 (Figs. 1–3) | USPTO scan via Google Patents: https://patents.google.com/patent/US186787A (PDF: patentimages.storage.googleapis.com/1c/e2/db/6cda4a354add60/US186787.pdf) | Public domain (a US patent from 1877; US works published before 1931 are in the public domain, and patent drawings are not subject to copyright) | `site/media/plates/bell-us186787-sheet1.webp` (header, Fig. 1, Fig. 2, levels adjusted); `site/media/plates/bell-us186787-fig1.webp` (Fig. 1 crop, ink on transparent); `site/js/sheet01/bell-fig1.js` (Fig. 1 traced to vectors). Verified: the patent's own text reads "Figure 1 is a perspective view of one form of my electric telephone. Fig. 2 is a vertical section of the same". |

## Made in code (no outside asset)

- Drafting-film grid and fibre texture: CSS gradients plus an inline SVG `feTurbulence` filter (`site/css/site.css`).
- Ruler, dimension line, drawing frame with zone markers, centre lines, title block, CAD crosshair: HTML/CSS/SVG written for this site.
- The phone history drawings (c. 1900 candlestick to 2007): generic forms drawn in code (`site/js/sheet01/eras.js`), no logos, no brand names, no copy of any one maker's design. Facts and sources: STATE.md, "Phone history: sources".
- The hero phone (six layers, edges, materials), the cyanotype develop shader, the labels and dimension lines: three.js and GLSL written for this site.
- LOFTHAUL (made-up concept product): screen UI, city map, flow diagram and lock mark are drawn in code (`site/js/sheet01/lofthaul.js`, `phone.js`). The name was web-searched on 21 Nov 2026 ("Lofthaul" drone delivery): no company or product found.

## Dev-only tools (not shipped in `site/`)

- Patchright / Playwright Chromium for screenshots, frame-rate checks (`tools/shoot.py`, `tools/fps.py`); Pillow for contact sheets (`tools/sheet.py`).
- PyMuPDF (AGPL, dev only, not shipped) to extract the patent pages from the PDF; potracer (GPL port of potrace, dev only, not shipped) to trace Fig. 1 into vectors (`tools/trace_fig1.py`). Only their output paths ship, not the libraries.


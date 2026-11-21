# CREDITS — every outside asset and library

| Asset | Source | Licence | Where it is used |
|---|---|---|---|
| Archivo (variable: weight 100–900, width 62–125%) v5.3.0 | Fontsource npm `@fontsource-variable/archivo` (Omnibus-Type, via Google Fonts) | SIL Open Font License 1.1 (`site/fonts/LICENSE-archivo.txt`) | `site/fonts/archivo-var.woff2`; pairing A (default): headlines (Expanded) and body |
| IBM Plex Mono 400, 500 v5.3.0 | Fontsource npm `@fontsource/ibm-plex-mono` (IBM) | SIL OFL 1.1 (`LICENSE-ibm-plex-mono.txt`) | `site/fonts/plex-mono-*.woff2`; pairing A labels, strip, title block, ruler numbers |
| Newsreader (variable: weight 200–800, optical size 6–72) v5.3.0 | Fontsource npm `@fontsource-variable/newsreader` (Production Type, via Google Fonts) | SIL OFL 1.1 (`LICENSE-newsreader.txt`) | `site/fonts/newsreader-var*.woff2`; pairing B (preview only) |
| DM Mono 400, 500 v5.3.0 | Fontsource npm `@fontsource/dm-mono` (Colophon Foundry) | SIL OFL 1.1 (`LICENSE-dm-mono.txt`) | `site/fonts/dm-mono-*.woff2`; pairing B (preview only) |
| Barlow 400, 500, 600 v5.3.0 | Fontsource npm `@fontsource/barlow` (Jeremy Tribby) | SIL OFL 1.1 (`LICENSE-barlow.txt`) | `site/fonts/barlow-*.woff2`; pairing C body (preview only) |
| Barlow Semi Condensed 500, 600 v5.3.0 | Fontsource npm `@fontsource/barlow-semi-condensed` (Jeremy Tribby) | SIL OFL 1.1 (`LICENSE-barlow-semi-condensed.txt`) | `site/fonts/barlow-sc-*.woff2`; pairing C headlines (preview only) |
| B612 Mono 400, 700 v5.3.0 | Fontsource npm `@fontsource/b612-mono` (Intactile Design for Airbus) | SIL OFL 1.1 (`LICENSE-b612-mono.txt`) | `site/fonts/b612-mono-*.woff2`; pairing C labels (preview only) |
| GSAP 3.15.0 + ScrollTrigger | npm `gsap` (GreenSock / Webflow) | GSAP Standard "no charge" license, https://gsap.com/standard-license | `site/vendor/gsap.min.js`, `site/vendor/ScrollTrigger.min.js`; opening timeline, strip fills, title block |
| Lenis 1.3.17 | npm `lenis` (darkroom.engineering) | MIT | `site/vendor/lenis.min.js`; heavy smooth scroll |

## Made in code (no outside asset)

- Drafting-film grid and fibre texture: CSS gradients plus an inline SVG `feTurbulence` filter (`site/css/site.css`).
- Ruler, dimension line, drawing frame with zone markers, centre lines, title block, CAD crosshair: HTML/CSS/SVG written for this site.

## Dev-only tools (not shipped in `site/`)

- Patchright / Playwright Chromium for screenshots (`tools/shoot.py`); Pillow for contact sheets (`tools/sheet.py`).

Once Wajih picks a pairing, the two unused pairings' font files are removed from `site/fonts/` and from this list.

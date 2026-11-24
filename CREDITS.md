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
| `SplitText.min.js`, `MorphSVGPlugin.min.js`, `DrawSVGPlugin.min.js` (Take 2, round 3) | GSAP 3.15.0 plugins: SplitText, MorphSVGPlugin, DrawSVGPlugin (GreenSock, now Webflow), unmodified | npm `gsap` 3.15.0, `dist/*.min.js` (the same package and version as the core above) | GSAP Standard "no charge" licence, https://gsap.com/standard-license: since GSAP became free (2025) the plugins are included and **commercial use is covered**; not an OSI licence. No attribution required; the copyright headers are kept intact. | **Page 1**: SplitText splits every line into words for the rise-and-straighten reveal; MorphSVG turns Bell's eight outlines into the phone's; DrawSVG draws those outlines and the detail callout's frame on (registered in `site/js/engine/core.js`) |
| `lenis.min.js` | Lenis 1.3.17 (darkroom.engineering) | npm `lenis` (file identical to `lenis/dist/lenis.min.js`) | MIT. The minified file carries no notice, so the licence text is shipped beside it as `site/vendor/lenis-LICENSE.txt` (added by the truth sweep) | Heavy smooth scroll |
| `three/three.module.min.js`, `three/three.core.min.js`, `three/addons/lines/{LineSegments2,LineSegmentsGeometry,LineMaterial}.js`, `three/addons/geometries/RoundedBoxGeometry.js` | three.js r183 (0.183.0) core + four addons | npm `three` (identical to `three/build/three.module.min.js`) | MIT; full text shipped as `site/vendor/three/LICENSE.txt` | The 3D hero phone on sheet 01 (loaded through the import map; not bundled into `site/dist/`) |
| `three/addons/loaders/{GLTFLoader,STLLoader}.js`, `three/addons/utils/{BufferGeometryUtils,SkeletonUtils}.js`, `three/addons/environments/RoomEnvironment.js` (Take 2) | three.js r183 addons, unmodified | npm `three` 0.183.0 (`examples/jsm/`) | MIT (same `site/vendor/three/LICENSE.txt`) | Take 2 style lab (`site/dev/lab/`): loading the real 3D models, the studio-light environment for A2; **page 1**: RoomEnvironment lights the phone's real materials |
| `three/addons/loaders/HDRLoader.js`, `three/addons/libs/meshopt_decoder.module.js` (Take 2, fixes after pages 2–3) | three.js r183 addons, unmodified | npm `three` 0.183.0 (`examples/jsm/`) | MIT (same `site/vendor/three/LICENSE.txt`; the meshopt decoder carries its own MIT header, Arseny Kapoulkine) | **Page 1**: HDRLoader reads the studio HDRI for the finished phone's reflections. Round 4: the meshopt decoder and GLTFLoader load the two real phones (iPhone 18 Pro Max, Galaxy S26 Ultra; see "Real phones" below) on the asset sheet and for the corridor's frame-4 still |
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
| `bell-us186787-sheet1.webp` (header, Figs. 1–2, levels adjusted); `bell-us186787-fig1.webp` (Fig. 1, ink on transparent); traced vectors in `site/js/sheet01/bell-fig1.js` | **US 186,787**, Alexander Graham Bell of Boston, "Improvement in Electric Telegraphy", dated 30 Jan 1877 (filed 15 Jan 1877), 2 sheets. Fig. 1 "a perspective view of one form of my electric telephone"; Fig. 2 "a vertical section of the same"; D sounding box, E speaking-tube. Bell's second telephone patent (it cites his No. 174,465 of 7 Mar 1876). | https://patents.google.com/patent/US186787A · PDF https://patentimages.storage.googleapis.com/1c/e2/db/6cda4a354add60/US186787.pdf | Public domain | Take 1: sheet 01 plate and redraw, the phone history's Fig. 1, sheet 03.2 recap. **Take 2 page 1**: `bell-us186787-sheet1.webp`, the opening plate; `bell-us186787-paths.json` (round 3), eight clean outer paths of Fig. 1 (the lid, the two box faces, the plinth, the speaking tube with its mouthpiece, three screw heads) fitted to the scan's own ink by `tools/bell_paths.py` (least-squares edges, snapped curves, ellipse moments), drawn on over the scan and morphed into today's phone. (Round 2's potrace outline file `bell-us186787-lines.bin` was removed.) |
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
| `paper/miller-1905-paper.webp` | A blank margin of Miller 1905, IA scan page n262 (the page after p. 242), desaturated and mirrored into a seamless tile | Same IA item as above | Public domain | Lab A2. **Off page 1 since round 5** (Wajih: "brownish yellowish"); round 6: the page has two grounds only (white drafting paper, the blue blueprint); file kept |

The stamp-grain mask (`paper/stamp-grain.webp`, derived from the Miller 1905 scan) was removed in page 1 round 3 together with the stamps.

## Take 2 materials (`site/media/materials/`), page 1's real phone and the asset sheet

All from ambientCG (https://ambientcg.com), whose assets are all released under **CC0 1.0** (public-domain dedication; commercial use, no credit required). Downloaded 23 Nov 2026 as the 1K-JPG sets (`https://ambientcg.com/get?file=<Id>_1K-JPG.zip`), converted by `tools/materials.py` to `color.webp`, `rough.webp`, `normal.webp` (1024 px, the NormalGL map). Every option is shown side by side on `site/dev/assets.html`; Wajih picked **B (titanium + black glass)** on 23 Nov, and page 1 uses it.

| Folder | What it is | Source | Licence | Where used |
|---|---|---|---|---|
| `Metal009/` | Metal 009: brushed metal (colour, roughness, normal) | https://ambientcg.com/view?id=Metal009 | CC0 1.0 | Option A band (satin aluminium); option C band (graphite, tinted dark). Asset sheet only |
| `Metal059A/` | Metal 059 A: titanium | https://ambientcg.com/view?id=Metal059A | CC0 1.0 | Option B band (bead-blasted titanium): **page 1**, Wajih's pick (23 Nov) |
| `Plastic010/` | Plastic 010: smooth plastic (its fine grain) | https://ambientcg.com/view?id=Plastic010 | CC0 1.0 | Option A back (frosted white); option B back (black glass: the same grain, dark and glossy): **page 1**, Wajih's pick (23 Nov) |
| `Leather027/` | Leather 027: black leather | https://ambientcg.com/view?id=Leather027 | CC0 1.0 | Option C back |

## Take 2, round 5: the hallway's card (`site/media/materials/`)

**CC0 1.0** (public-domain dedication; commercial use, no credit required; credited anyway). Downloaded 24 Nov 2026
into `tools/sources/materials-r5/` (git-ignored); converted by `tools/materials_r5.py` to `color.webp` (1024 px) and
`normal.webp` (512 px, the OpenGL normal map). The non-square source (Paper001, 1024 × 600) is resampled to a square,
never cropped (a crop would break the seamless tile).
**Round 6 (24 Nov):** two grounds only and one hallway look, so hallway looks B and C and page 1's grounds B and C are
gone, with the three materials only they used (Plaster002, Poly Haven Laminate Floor 03, Concrete034: deleted from
`site/media/materials/`, no longer shipped). Paper001 stays, printed in grey (no warm tint).

| Folder | What it is | Source | Licence | Changes | Where used |
|---|---|---|---|---|---|
| `Paper001/` | Paper 001: white paper | ambientCG, https://ambientcg.com/view?id=Paper001 (`Paper001_1K-JPG.zip`) | CC0 1.0 | Resampled to square; printed in grey at run time | **The hallway (look A, the only look)**: the white card of the walls and floor, the site's grid printed on it at run time |

The studio HDRI below lights the hallway's reflections and the real phones in frame 4. Candidates downloaded and looked
at, not shipped: ambientCG Paper003, Plaster002 (round 5's look B, removed in round 6), Plaster003, Plaster005,
WoodFloor051, WoodFloor066A, WoodFloor067A, Concrete016, Concrete034 (round 5's look C, removed in round 6), Concrete046,
Concrete048; Poly Haven laminate_floor_03 (round 5's look B, removed in round 6), plank_flooring_04, wooden_floor_02.

## Take 2 studio light (`site/media/hdri/`)

| File | What it is | Source | Licence | Where used |
|---|---|---|---|---|
| `studio_small_09_1k.hdr` (1024 × 512, Radiance HDR, 1.6 MB, unmodified) | "Studio Small 09" by **Sergej Majboroda**: a small photo studio, large octaboxes, soft directional light on a white infinity cyc (16K original; the 1K file) | Poly Haven, https://polyhaven.com/a/studio_small_09 (file `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr`, downloaded 23 Nov 2026) | **CC0 1.0** (every Poly Haven asset; https://polyhaven.com/license): commercial use, no credit required | **Page 1**: the finished phone's real reflections (phone A); round 5: the hallway's reflections (frames' metal and glass) and the two real phones, live in frame 4; the asset sheet (phone A and the two real phones); the corridor's frame-4 still of the real phones. Two other CC0 studios were downloaded and looked at, not shipped: Studio Small 08, Photo Studio 01 |

## Take 2 corridor sheets (`site/media/corridor/`): off the page since round 4, files kept

**Not used on any page since round 4 (24 Nov)**: the corridor now holds our own four blueprint schematics (see "Made in
code"). The files stay on disk for reuse. They were three candidate sets of five for the "?" dot dive.
Web files (`<set>/01–05.webp`, long side 2400 px, ink mapped to #121212 on paper #F2F0EB, fine lines thickened
slightly before the reduction so they stay ink) made by `tools/corridor_webp.py` from the originals in
`tools/sources/corridor/` (not shipped).

**HAER sheets (sets C and A).** Historic American Engineering Record measured drawings, Library of Congress Prints &
Photographs; masters are 1-bit TIFFs at 400 dpi from `tile.loc.gov/storage-services/master/pnp/habshaer/…/sheet/000NNa.tif`.
Rights (LoC, word for word on each item page, checked 23 Nov 2026): "No known restrictions on images made by the U.S.
Government; images copied from other sources may be restricted." Made by the U.S. Government (National Park Service):
**public domain**.

| Set / file | Sheet | Call number | Item |
|---|---|---|---|
| c/01 | Hacienda La Esperanza, beam engine and flywheel elevation (sheet 1 of 4) | HAER PR,55-MANA,1A- (HAER PR-1-A) | https://www.loc.gov/pictures/item/pr0016.sheet.00001a |
| c/02 | La Esperanza, engine end elevations (sheet 2 of 4) | same | https://www.loc.gov/pictures/item/pr0016.sheet.00002a |
| c/03 | La Esperanza, reduction gears and cane mill (sheet 3 of 4) | same | https://www.loc.gov/pictures/item/pr0016.sheet.00003a |
| c/04 | Hacienda La Igualdad, north elevation of machinery (sheet 3 of 6) | HAER PR,35-GUAN.V,1A- (HAER PR-7) | https://www.loc.gov/pictures/item/pr0031.sheet.00003a |
| c/05 | La Igualdad, sections, cane mill, reduction gears, flywheel (sheet 5 of 6) | same | https://www.loc.gov/pictures/item/pr0031.sheet.00005a |
| a/01 | Steam schooner Wapama, axonometric views of the engine (sheet 21 of 22) | HAER CAL,21-SAUS,1- (HAER CA-67) | https://www.loc.gov/pictures/item/ca1521.sheet.00021a |
| a/02 | Windmill at Water Mill, NY, wood gear construction (sheet 5 of 6) | HAER NY,52-WATMI,1- | https://www.loc.gov/pictures/item/ny1142.sheet.00005a |
| a/03 | San Francisco cable railway powerhouse, winding machinery elevation (sheet 5 of 5) | HAER CAL,38-SANFRA,137-A- (HAER CA-12-A) | https://www.loc.gov/pictures/item/ca1270.sheet.00005a |
| a/04 | Wyman Bridge, Arkansas, truss elevation and plan (sheet 2 of 3) | HAER ARK,72-FAYVI,2- (HAER AR-38) | https://www.loc.gov/pictures/item/ar0096.sheet.00002a |
| a/05 | Georgetown Steam Plant, Seattle, turbine isometric (sheet 8 of 8) | HAER WASH,17-SEAT,2- (HAER WA-1) | https://www.loc.gov/pictures/item/wa0169.sheet.00008a |

**US patent sheets (set B).** Public domain (US patents issued 1847–1888; see the patent note above). Scans: the USPTO
page images in the PDFs served by Google Patents (2320 × 3408 px, 1-bit); small scanner marks removed at the edges.

| File | Patent | Source |
|---|---|---|
| b/01 | F. S. Baldwin, Calculating-Machine, US 159,244 (1875), sheet 1 | https://patents.google.com/patent/US159244A/en |
| b/02 | W. S. Burroughs, Calculating Machine, US 388,116 (1888), sheet 1 | https://patents.google.com/patent/US388116A/en |
| b/03 | R. M. Hoe, Printing Press, US 5,199 (1847), sheet 1 | https://patents.google.com/patent/US5199A/en |
| b/04 | G. H. Corliss, Steam Engine, US 6,162 (1849), sheet 1 | https://patents.google.com/patent/US6162A/en |
| b/05 | W. Odhner, Calculating-Machine, US 209,416 (1878), sheet 2 | https://patents.google.com/patent/US209416A/en |

## Real phones (round 4): LICENCE UNVERIFIED, LOCAL ONLY

**Licence unverified, local only: must be cleared or replaced before any hosting.** Wajih's call (24 Nov): build now,
check the licences later; the site is not hosted. Neither file nor any copy of it is in git: the sources sit in
`tools/sources/phones/` and the web copies in `site/media/phones-unverified/`, both git-ignored. Version B's
candidates (B1–B3) were dropped (Part 5 "Round 4 picks"); their slots and `phoneb.js` are gone.

| File (git-ignored) | What it is | Source | Licence | Changes | Where used |
|---|---|---|---|---|---|
| `site/media/phones-unverified/iphone18.glb` (1.19 MB) | iPhone 18 Pro Max, silver: 64,954 triangles, 34 materials | `tools/sources/phones/iphone18/model.glb`, from `apple-iphone-18-pro-max-silver-2026.zip`, downloaded by Wajih from Sketchfab (24 Nov). The file's own metadata says "Binkies MDM 3.3 conversion" (Binkies 3D makes phone models for retailers' shop pages): most likely re-uploaded by someone who doesn't own it | **Unverified** | The Apple logo flattened into the back panel's own surface and material (removing it left a hole: the panel has it cut out); the display's own picture removed (our booking app goes on at run time); textures at most 1024 px, WebP; meshopt-compressed (`tools/phones_web.mjs`) | Asset sheet (live, our app on screen); **round 5: live in the hallway's frame 4 on page 1** (loaded as the dive begins; they turn to show their backs, then settle front-on); the frame-4 still (the fallback) |
| `site/media/phones-unverified/s26.glb` (1.09 MB) | Galaxy S26 Ultra: 62,754 triangles, 32 materials, unnamed nodes | `tools/sources/phones/s26/model.glb`, from `samsung-s26-ultra.zip`, downloaded by Wajih from Sketchfab (24 Nov). Exported by Blender's glTF exporter; carries no maker or licence information (its Sketchfab page is still to be checked) | **Unverified** | The SAMSUNG wordmark (node "Geometry", found by inspection: each candidate rendered in red on the back) removed; the display's picture removed; textures at most 1024 px, WebP; meshopt-compressed | As above (round 5: live in frame 4) |
| `site/media/phones-unverified/corridor-phones.webp` (38 KB, 1200 × 1098) | The two phones front on, running our booking app, orthographic, transparent ground, in the studio light above | Rendered from the two web copies by `tools/phone_stills.py` (`site/dev/phone-stills.html`) | **Unverified** (made from the two models) | — | Page 1, the hallway's frame 4: round 5, the fallback while the live phones load, with reduced motion, and when the models are missing |

Everything that uses them copes with the files being missing: frame 4 shows the still, or stays a blueprint if the still is
missing too; the asset sheet says "file missing". Before any hosting: clear both licences (author, licence, commercial use; never NC or ND) or replace
both models, and credit them here and on the site.

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
- **Take 2, round 6:** the grid as the layout system (the unit per screen in the head script, `site/css/page-00-grid.css`,
  `site/js/engine/grid.js`), the two grounds (CSS colours), the hallway's grid continued in perspective from its mouth,
  the frames sized in whole cells and hung on the card's lines, the museum labels under the frames (`dive.js`,
  `page-01-dive.css`), the on-grid check (`tools/gridcheck.py`, dev only).
- **Take 2, round 5:** the hallway's frames as objects (moulding, hinge, mat with its bevelled window, glass, the mat's
  shadow on the blueprint), its light and shadows, the grid printed on the card (`site/js/page01/dive.js`,
  `hall-looks.js`); page 2's beacon (the opening's own, in CSS) and "Next: your slip" (`site/js/page02/cta.js`).
- **Take 2, round 4:** the corridor's four blueprint schematics (page-load timeline, the which-driver flowchart, a
  customer's path with the fix drawn in, our booking app's screen on the two phones' true outlines), their mounts,
  frames, hinges, walls and grid, drawn in WebGL from data (`site/js/page01/corridor-drawings.js`, `dive.js`); our
  made-up booking app (a concept product: `site/js/apps/booking.js`), drawn on canvas for the real phones' screens;
  phone A's premium details (machined band with polished chamfers, the bezel mask, the camera plateau's chamfer, lens
  cover glass: `phone.js`); the verb drum's detent and its construction grid on the type's own metrics (`page.js`).
- **Take 2 page 1 (fixes after pages 2–3):** the finished phone's product-shot detail: bevelled real-look geometry, keys, the camera bump, the turned lens parts (ring, throat, rim, coated glass), the cover glass's reflection layer, the soft shadow, the live turn (`site/js/page01/phone.js`, `live.js`); the "?" dot dive (the glyph measured on a canvas, the corridor in WebGL with three.js, its rails and ring in SVG: `site/js/page01/dive.js`); the small hairline cross cursor (`site/js/engine/cursor.js`). (Version B's framing, `phoneb.js`, was retired in round 4.)
- **Take 2 page 1 (round 3):** today's phone in six parts (glass, screen, frame, board, battery, back) with tight corners and a thin flat band, its X-ray (hairlines only) / built (white model, ink hairlines) / real looks, and its screen (the next page's question as rows on hairlines, flagged DRAFT) are drawn in code (`site/js/page01/phone.js`); only the real look's band and back use the CC0 scans above. No logos, no brand shapes. The beacon, the X-ray names on leader lines, the verb drum (CSS 3D type) and the blue ground's grid are CSS/SVG/canvas. (Round 3's detail callout into page 2 was replaced by the dot dive.)
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
- Round 4: glTF Transform 4.5 (`@gltf-transform/core`, `extensions`, `functions`; MIT), meshoptimizer 1.3 (MIT) and
  sharp 0.35 (Apache-2.0) make the real phones' web copies (`tools/phones_web.mjs`); dev only, nothing of them ships
  (the decoder in `site/vendor/three/addons/libs/` is three.js's own).
- `tools/materials_r5.py` (Pillow) converts round 5's CC0 scans. `tools/bell_paths.py` (numpy + Pillow) fits Bell's eight outlines; `tools/materials.py` (Pillow) converts the ambientCG maps; `tools/corridor_webp.py` (Pillow) makes the corridor sheets. Only their output ships.
  plate figures into vectors. Only their output paths ship, not the tools.

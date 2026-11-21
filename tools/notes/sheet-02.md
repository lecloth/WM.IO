# Sheet 02 · Principles (slice 5), builder A

## What I built
- `src/parts/sheet-02.html`, `site/css/sheet-02.css`, `site/js/sheets/sheet-02.js`, `site/js/sheet02/studies.js`,
  `site/media/davinci/*.webp` (4 files). Shares the hairline plotter `site/js/sheet04/plot.js` with sheet 04.
- Title block: Drawn Strategy · Checked Design · Approved Engineering (kept as assigned). `--units: 8` (p 0..9).
- **Entry (p 0 → 1), tracing paper slides over:** a translucent drafting-film sheet (paper at 30 % alpha, a code-made
  fibre texture, a hairline top edge, two pieces of drafting tape, the drawing frame printed on it) slides up over sheet
  01's cyanotype; the blue shows through, softened, and sheet 01's last reading text stays readable through it. At
  p 0.46–0.8 a white backing sheet slides in *under* the film from the right (hard edge with a hairline). The film's
  construction lines for "Exact" (Leonardo's fusee redrawn in CAD hairlines: centre lines, Ø D, L, three leaders)
  become visible exactly where the white backing arrives (ink on film reads once there is white behind it), so nothing
  is ever drawn across sheet 01's text. Then the fusee turns (ring, cone and output wheel rotating, teeth behind the
  cone hidden), and a scan line inks Leonardo's plate in under the lines. No black moment.
- **Scene:** four reading moments, each ~1.15 viewport heights, text left (eyebrow, the word, the principle in
  2.55 rem display), the study in the right-hand margin (box 56.5–89 % of the width), a two-part plate caption
  under it, a small 01–04 index at the top.
  Between moments (0.85 vh, text off): scan "Trace →" turns the plate into hairlines, scan "Redraw →" turns those
  into the next study's hairlines, the next mechanism moves (spring flexes and settles with a δ deflection mark;
  counterweight steps notch o → m → n → r while the screw turns and the load rises; the bolt drops, the spring jaws
  open as the arrowhead passes and snap shut, "SHUT"), then scan "Plate →" inks the next plate in.
  `render(p)` is pure in p; scan labels stay pinned at the start of each pass (only the line moves).
- Copy kept exactly as briefed (Exact / Felt / Proven / Locked lines). No numbers anywhere.
- Mobile (≤1023): plate box top (11.5–44.5 % of the height), caption under it, text block at the bottom.
- Reduced motion: four finished principles stacked, each with its plate (ink mask) and caption; no entry, no scans.
- Checks: 1440×900, 1920×1080, 390×844 freeze frames at entry/transition/reading positions; reduced motion desktop;
  no console errors from this sheet; fps (adapted copy of tools/fps.py over this sheet's range): desktop 57.5 fps,
  p95 16.8 ms; mobile 55.4 fps, p95 16.8 ms.

## Decisions I made alone
- **The four studies, all from Leonardo's Codex Madrid I** (his mechanics notebook), one per principle, pairing chosen
  from the RWTH Aachen catalogue titles so each pairing is literally true:
  - Exact ↔ f. 16r, "Clock: compensation of declining spring force" (the fusee), with his note "Ogni arte dimanda il
    suo strumento" (every art demands its instrument).
  - Felt ↔ f. 79v, "Lock springs": a model spring drawn thick at the root, thin at the tip (the feel of a press).
  - Proven ↔ f. 4v, "Screw: instrument for measuring the force of a screw drive" (he built a rig just to measure).
  - Locked ↔ f. 50r, "Lock technique: pincer locks": a chest lock that snaps shut by itself; the key only opens it.
  I did not use flying-machine sheets: the good ones are Codex Atlanticus (Ambrosiana, Milan) and Italy's cultural
  heritage code adds reproduction restrictions; Madrid I (BNE) has an explicit open-reuse policy.
- **Ink, not sepia.** I rendered scan / sepia / ink side by side (f. 16r). Sepia adds a brown no other element uses and
  competes with the cyanotype blue just before it; in ink the plate and the CAD hairlines read as one drawing, which is
  what the Trace / Redraw / Plate passes depend on. The plates are alpha masks filled with `var(--ink)` (CSS mask), so
  the dark version just works.
- Backing slides in from the right (not the left) so it covers sheet 01's reading text first.
- Leader labels on the plates carry a paper halo (`paint-order: stroke`) so they read over Leonardo's hatching.
- The scan labels were pinned in place so no text moves while visible (sheet 01's moving "SCAN" label was not copied).

## Outside assets
| File | Source | Licence / status | Where used |
|---|---|---|---|
| `site/media/davinci/madrid1-f016r-fusee.webp` | Leonardo da Vinci, Codex Madrid I (Biblioteca Nacional de España, Mss/8937), f. 16r. Scan: https://www.codex-madrid.rwth-aachen.de/folia1/f016r.jpg (folio page https://www.codex-madrid.rwth-aachen.de/madrid1/f016r/index.html) | Public domain (Leonardo d. 2 May 1519). See licence notes below. | Sheet 02, Principle 01 "Exact", margin plate + reduced-motion still |
| `site/media/davinci/madrid1-f079v-springs.webp` | Same codex, f. 79v. https://www.codex-madrid.rwth-aachen.de/folia1/f079v.jpg | Public domain | Principle 02 "Felt" |
| `site/media/davinci/madrid1-f004v-force-gauge.webp` | Same codex, f. 4v. https://www.codex-madrid.rwth-aachen.de/folia1/f004v.jpg | Public domain | Principle 03 "Proven" |
| `site/media/davinci/madrid1-f050r-lock.webp` | Same codex, f. 50r. https://www.codex-madrid.rwth-aachen.de/folia1/f050r.jpg | Public domain | Principle 04 "Locked" |

Licence notes (checked 21 Nov 2026):
- Leonardo died on 2 May 1519 (stated on the RWTH edition's book page); the drawings are public domain worldwide.
- The page images are the Biblioteca Nacional de España's scans of Mss/8937. The RWTH imprint
  (https://www.codex-madrid.rwth-aachen.de/katalog/kontakt/adresse.html) says the rights to publish the manuscript
  pages lie with the BNE and are used there with the BNE's permission; RWTH claims copyright only over its own
  graphics, reconstructions and texts. I used only the plain folio files (`folia1/fNNNx.jpg`), not the `_l` files that
  carry RWTH's blue figure numbers, and no RWTH graphics. The plain files are mirror-reversed for reading; I mirrored
  them back, so they match the BNE scans of the same folios on Wikimedia Commons (e.g.
  https://commons.wikimedia.org/wiki/File:Codex_Madrid_I,_folio_016_recto.jpg, and the RWTH-sourced
  https://commons.wikimedia.org/wiki/File:Codex_Madrid_I_f090v.jpg at the same 3060×4290 size), both tagged Public
  domain on Commons.
- The BNE releases its public-domain digitisations for free reuse, commercial included, with attribution (catalogue
  entry https://datos.gob.es/es/catalogo/ea0019768-biblioteca-digital-documentos-en-dominio-publico1 ; report
  https://www.xataka.com/legislacion-y-derechos/bne-libera-25-millones-digitalizaciones-obras-dominio-publico-se-podran-usar-gratis-incluso-para-fines-comerciales ).
  EU Directive 2019/790 Art. 14 (no new rights in faithful reproductions of public-domain visual art) applies in Spain
  and Germany.
- Processing (`ink` script, scratch only): mirror, crop to the figure, divide out the paper with a wide blur, threshold
  to an alpha mask, 1200 px max side, WebP. Two crops had stray fragments of the next line of handwriting trimmed at
  the edge (f. 16r bottom-right corner, f. 4v top strip). Nothing inside a figure was altered.
- **Credit line for CREDITS.md:** "Leonardo da Vinci, Codex Madrid I, ff. 4v, 16r, 50r, 79v (1490s). Biblioteca
  Nacional de España, Mss/8937. Public domain. Scans via the RWTH Aachen Codex Madrid I edition."
- Commons was rate-limiting this IP (HTTP 429) during the build, which is why the files came from the RWTH mirror of the
  same BNE scans rather than from Commons directly.

## Facts and their sources
| On the site | Source |
|---|---|
| Codex Madrid I, "1490s" | Wikipedia, Codex Madrid (Leonardo): "The Madrid Codices I was finished during 1490 and 1499"; Bridgeman dates f. 45r to 1493 |
| f. 16r: spring drum, toothed ring, cone evening out a clock spring's pull; note "Ogni arte dimanda il suo strumento" | RWTH edition, f. 16r: title "Clock: compensation of declining spring force"; Fig. 1 "Federtrommel mit Zahnspirale bewegt konischen Drehling zum Ausgleich nachlassender Federspannung"; transcription line [1] "Ogni arte dimanda il suo strumento" (https://www.codex-madrid.rwth-aachen.de/madrid1/f016r/txt.html) |
| f. 79v: lock springs; a model spring thick at the root, thin at the tip | RWTH f. 79v: "Lock springs"; Fig. 2 "Musterentwurf für eine Schlossfeder mit dicker Basis und dünn auslaufendem Federarm" |
| f. 4v: an instrument for measuring the force of a screw drive; threaded rod, arm notched for weights | RWTH f. 4v: "Screw: instrument for measuring the force of a screw drive"; Fig. 1 "Kraftmesser aus einem Gestell mit Gewindestange, darauf eine Mutter mit Gewicht sowie ein Hebel mit Kerben für Gewichte" |
| f. 50r: a chest lock that snaps shut on its own; the key is only needed to open it | RWTH f. 50r commentary: "ein Zangenschloss, das beim Schließen automatisch einschnappt. Den Schlüssel benötigt man lediglich zum Öffnen" |
| Overlay letters o, m, n, r on the notched arm; "denti 60 / denti 6" on f. 16r | Leonardo's own letters on the folios (visible on the plates) |

## Known limits / for the lead
- `main.js`: `act1.spans['01']` ends at `T.end + 1`, which now runs to this sheet's p ≈ 2, so the strip and title block
  still say "01 First drawing" during the first half of "Exact". Suggest ending sheet 01's span at `T.end` (sheet 02's
  own range starts at its p 0.5).
- Sheet 01's final reading text stays on until p 0.98 of this entry (under the film, readable; covered by the backing by
  ~p 0.7). Fine as is; hiding it at act p ≈ T.end − 0.6 would make the entry even calmer.
- Intermittently (other builders' runs) the page loaded without `window.__engine` (module fetch dropped by the simple
  server); a reload fixes it. Not caused by this sheet.
- The trace geometry is a CAD reading of each study, aligned by eye to the crop (centres, radii, outlines); it is not a
  pixel-exact vector trace.

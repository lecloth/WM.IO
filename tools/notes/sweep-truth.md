# Truth sweep (final sweep, 21 Nov 2026)

Scope: CREDITS.md rebuilt against the disk; every date and fact on the site checked against a source; the Lovelace
line checked against the 1843 printing; a fabricated-proof audit of all visible copy (markup, JS strings, product
screens, alt text, aria-labels). Edits were kept to copy text, one licence file and CREDITS.md. `python -I
tools/build.py` was re-run after the edits (75,811 bytes, all five edits present in `site/index.html`).

## Fixes made

| # | Where | Was | Now | Why |
|---|---|---|---|---|
| 1 | `src/index.template.html`, sheet 01 plate caption | "the drawing filed with Alexander Graham Bell's telephone patent … so the story of the phone starts here." | "… Bell's **second** telephone patent … so **our** story of the phone starts here." | US 186,787 is Bell's second telephone patent: its own text cites his No. 174,465 of 7 Mar 1876. "The story of the phone starts here" was overstated. |
| 2 | `src/parts/sheet-03b.html`, Yale plate title | "A lock, drawn before it was built." | "A lock, drawn against the pick." | No source shows the drawing came before the lock (in that era US applicants normally also filed a patent model, so it is likely false). The patent does say the improvements are partly for "the security of locks against picking". |
| 3 | `src/parts/sheet-03b.html`, Plan 25 title | "A machine that ran on cards." | "A machine drawn to run on cards." | The Analytical Engine was never built, so it never ran (the body text already says "It was never finished"). |
| 4 | `src/parts/sheet-03b.html`, Plan 25 caption | "photo ArnoldReinhold, CC BY 4.0" | "photo [ArnoldReinhold](Commons file page), [CC BY 4.0](licence URL), cropped and toned" | CC BY 4.0 §3(a)(1) asks for the creator, a link (or URI) to the licence and a note of any changes. The link and the changes were missing. |
| 5 | `src/parts/sheet-09.html`, colophon | "Plates are public domain; typefaces and libraries are open licence." | "Plates are public domain; Leonardo's folios are from the Biblioteca Nacional de España, and one photo is credited under CC BY 4.0. Typefaces are open licence; libraries are open source or free to use." | GSAP's Standard "no charge" licence is not an open-source licence. One plate photo is CC BY, not public domain. The BNE asks reusers to cite it as the source of its scans. |
| 6 | `site/vendor/lenis-LICENSE.txt` (new, copied from `tools/node_modules/lenis/LICENSE`) | the minified Lenis had no copyright or licence notice | MIT text shipped beside it | MIT requires the notice in all copies. |
| 7 | `CREDITS.md` | partial: missing the Yale, Babbage, Posselt, Leonardo, Bullock, Firman, Edison and Holmes assets and axe-core | rebuilt as the complete list of the 18 media files, 4 font files and 6 vendored library groups on disk, each with source URL, licence, where used and the on-site attribution | Brief Part 4 rule 3 |

## 1. Assets on disk and licences

On disk: `site/fonts` (4 woff2 + 2 OFL texts), `site/vendor` (gsap, ScrollTrigger, lenis, axe, three core/module + 4
addons, licence files), `site/media/plates` (14 files), `site/media/davinci` (4 files). Every media file is referenced
by the site (grep of `src`, `site/js`, `site/css`, `site/index.html`); none is unused and none is missing. No Archivo,
Plex or other removed-pairing files or `@font-face` rules remain. `site/dist/` is our own bundle (three/gsap/lenis are
external: `import … from "three"` ×6, `window.gsap`). `site/dev/products.html` uses only our fonts. The only outside
URLs in the shipped code are the two attribution links (and `wa.me` for the work order).

| Asset | Check | Source | Result |
|---|---|---|---|
| Newsreader, DM Mono | Licence files on disk | `site/fonts/LICENSE-*.txt` | SIL OFL 1.1 ✓ |
| GSAP 3.15.0 + ScrollTrigger | File headers ("Subject to the terms at https://gsap.com/standard-license"); licence page | https://gsap.com/standard-license | Free, commercial use allowed, no attribution needed. Proprietary (Webflow), **not OSI open source**, so the colophon was fixed (fix 5). Headers kept. |
| Lenis 1.3.17 | Byte-compared with `tools/node_modules/lenis/dist/lenis.min.js` | npm `lenis` package.json: MIT | MIT ✓, but no notice shipped, so fix 6 |
| three.js 0.183.0 | Byte-compared with `three/build/three.module.min.js`; SPDX header | `site/vendor/three/LICENSE.txt` | MIT ✓ |
| axe-core 4.14.1 | Byte-identical to npm; MPL header in file | `site/vendor/axe-LICENSE.txt` | MPL-2.0 ✓, unmodified, so no source-offer duty beyond the notice |
| Bell, Bullock, Firman, Edison, Yale, Holmes | US patents 1863–1883 | USPTO terms https://www.uspto.gov/terms-use-uspto-websites ; pre-1931 US publication | Public domain ✓ |
| Babbage Plan 25 photo | Commons file page | https://commons.wikimedia.org/wiki/File:Babbage_Analytical_Engine_Plan_1840_CHM.agr.jpg | Author ArnoldReinhold, "Own work", CC BY 4.0 ("You must give appropriate credit, provide a link to the license, and indicate if changes were made"). Work dated 6 August 1840. On-site attribution repaired (fix 4). |
| Posselt Fig. 22 | IA item page; title page text (`tools/sources/d2/jacq/poss.txt`) | https://archive.org/details/jacquardmachinea00poss | LoC copy, "The Library of Congress is unaware of any copyright restrictions for this item"; title page "Philadelphia … 1888", "Copyrighted, 1887". Public domain ✓ (site says 1888, the title-page year) |
| Leonardo, Codex Madrid I ff. 4v, 16r, 50r, 79v | RWTH folio pages; BNE open-data entry; BNE reuse report | https://www.codex-madrid.rwth-aachen.de/madrid1/f016r/txt.html (and f004v, f050r, f079v `txt.html`) · https://datos.gob.es/es/catalogo/ea0019768-biblioteca-digital-documentos-en-dominio-publico1 (CC BY 4.0, "reutilizadas libre y gratuitamente") · https://www.xataka.com/legislacion-y-derechos/bne-libera-25-millones-digitalizaciones-obras-dominio-publico-se-podran-usar-gratis-incluso-para-fines-comerciales (any use incl. commercial, "citando la procedencia") | Drawings public domain ✓. The BNE scans are reusable with the source cited, so the BNE credit was added to the colophon (fix 5). bne.es/legal-notice returned 403 to the fetcher, so the exact credit wording was not read. |

## 2. Dates and facts

### Plates (each checked in the patent's own text: PDF text layer read with PyMuPDF, `tools/sources/**`)

| On the site | Patent text | Result |
|---|---|---|
| Bell US 186,787, granted 30 Jan 1877; Fig. 1 box telephone with speaking tube, Fig. 2 vertical section (alt) | "Letters Patent No. 186,787, dated January 30, 1877; application filed January 15, 1877"; "Figure 1 is a perspective view of one form of my electric telephone. Fig. 2 is a vertical section"; "D … sounding box"; "E … speaking-tube". Cites "Letters Patent granted to me March 7, 1876, No. 174,465". | Date ✓, figures ✓. "Telephone patent" made "second telephone patent" (fix 1). |
| Era 1877 line: "You spoke into the tube; a magnet and coil carried your voice." | Iron plate A, soft-iron bar F with coil G, battery N; or "rendering the central bar F H permanently magnetic"; "speak … preferably through the tube E" | ✓ (an electromagnet or permanent magnet with its coil) |
| Bullock US 38,200, 14 Apr 1863; continuous roll, cut, printed both sides in one pass, nobody feeding by hand, built for newspapers | "dated April 14, 1863"; "continuous web or roll … severed from the web, printed on both sides"; "passing them once only through the press"; "without other attention than is necessary to supply a fresh roll"; "eighteen thousand sheets of newspapers or other printed matter in an hour" | ✓ |
| Firman US 252,576, 17 Jan 1882; every line on every board; any two lines joined from any board; a thousand subscribers or more; alt: three boards + indicator | "dated January 17, 1882"; "Each board must have as many terminal plates … as there are telephone-lines"; "any two lines can be connected on either of the boards"; "an exchange of a thousand or more subscribers may be successfully handled"; boards A A1 A2, indicator board B | ✓ (the thousand is the inventor's own claim, stated as "could serve") |
| Edison US 274,290, 20 Mar 1883; a central wire, a lamp out and the rest unchanged; alt "four figures" | "dated March 20, 1883"; "central compensating conductor"; "if one or more translating devices are removed … the other lamps remain unchanged"; sheet 1 shows Figs. 1–4 (image checked) | ✓ |
| Yale US 48,475, 27 Jun 1865; pins of different lengths lined up by the key; quote "the security of locks against picking"; alt "twenty figures" | "dated June 27, 1865"; "The pieces I and J are of different lengths, and must all be arranged by the key … before the cylinder D can be turned"; "The improvements relate partly to the security of locks against picking"; Figs. 1–20; Fig. 4 and Fig. 6 sections | ✓. Title fixed (fix 2). |
| Holmes US 275,913, 17 Apr 1883; theodolite + solar compass; true north, time, latitude; alt "two elevations" | "dated April 17, 1883"; "combining the properties of a solar compass and theodolite … whereby the true meridian, the solar time, the sun's declination, and the latitude … can be … determined"; sheet 1 = Fig. 1 and Fig. 3, both elevations (image checked) | ✓ |
| Plan 25 dated 6 August 1840; never finished; cards from the Jacquard loom, brocade | Inscription on the plan (image checked: "Plan 25 · 6 August 1840"); Commons record; Science Museum Group object 1878-3 ("Only part of the machine as a trial piece was completed before Babbage's death in 1871", per D2's notes); Lovelace Note A, p. 696 ("brocaded stuffs") | ✓. Title fixed (fix 3). |
| Posselt Fig. 22: rows of eight, lacing holes at each end (alt) | Image checked: eight hole positions per row, small lacing holes at both ends, large peg holes | ✓ |
| Spans "163 / 149 / 144 / 143 / 143 years" | `scene.js` `NOW = 2026` minus the plate year | ✓ for 2026. Hard-coded: wrong from 1 Jan 2027 (see open items). |

### Leonardo folios (RWTH Aachen edition, `txt.html` per folio; images on disk checked)

| Caption | RWTH | Result |
|---|---|---|
| f. 16r: a spring drum whose toothed ring turns a cone, evening out a clock spring's pull; his note "Ogni arte dimanda il suo strumento" | "Clock: compensation of declining spring force"; Fig. 1 spring drum with toothed spiral driving a conical pinion; transcription [1], the first block, "Ogni arte dimanda il suo strumento" | ✓ |
| f. 79v: lock springs, a model spring thick at the root and thin at the tip | "Lock springs"; Fig. 2 "Schlossfeder mit dicker Basis und dünn auslaufendem Federarm" | ✓ |
| f. 4v: measuring the force of a screw drive: a load on a rope, a threaded rod, an arm notched for weights | "Screw: instrument for measuring the force of a screw drive"; Fig. 1 threaded rod, nut with weight, "Hebel mit Kerben für Gewichte"; the rope over a pulley with a load is visible in the scan | ✓ |
| f. 50r: chest lock drawn part by part; snaps shut on its own; the key is only needed to open it | "Lock technique: pincer locks"; "Truhen- oder Schatullenschloss"; "das beim Schließen automatisch einschnappt. Den Schlüssel benötigt man lediglich zum Öffnen." | ✓ |
| "1490s" | Wikipedia, Codex Madrid (Leonardo): "The Madrid Codices I was finished during 1490 and 1499" (https://en.wikipedia.org/wiki/Codex_Madrid_(Leonardo)); Bridgeman dates f. 45r 1493 | ✓ |

### Phone history (STATE.md table; `site/js/sheet01/eras.js`)

| Year · line | Source | Result |
|---|---|---|
| 1877 | Patent itself (above) | ✓ |
| c. 1900 · mouthpiece on a stand, earpiece on a hook; common for fifty years | https://en.wikipedia.org/wiki/Candlestick_telephone: "common from the late 1890s to the 1940s"; receiver rests in the fork of the switch hook | ✓ |
| 1920s · a finger wheel dials; the operator steps aside | https://en.wikipedia.org/wiki/Rotary_dial: dial service in the Bell System "was not common until the early 1920s"; finger-wheel dial from about 1907 | ✓ |
| 1963 · ten push-buttons and tones, first offered in Pennsylvania | Hagley Museum (https://hagley.org/research/news/hagley-vault/date-november-18-1963-bell-telephone-began-offering-worlds-first): 18 Nov 1963, Carnegie and Greensburg PA, 10 buttons; Wikipedia Model 500: 1500 set ten-digit pad, * and # added 1968 | ✓ |
| 1973 · first handheld mobile call, on a New York street | NPR 3 Apr 2023 (https://npr.org/2023/04/03/1167815751/50-years-ago-martin-cooper-made-the-first-cell-phone-call), CBS New York: Martin Cooper, 3 Apr 1973, Sixth Avenue, Manhattan | ✓ |
| 1992 · pocket phones with keypads; first text "Merry Christmas" | Vodafone newsroom (https://www.vodafone.com/news/newsroom/technology/25-anniversary-text-message), History.com: Neil Papworth, 3 Dec 1992. Pocket keypad phones existed in 1992 (the first text itself went to a large Orbitel 901; the line doesn't claim otherwise) | ✓ |
| 1994 · touchscreen phone that ran apps: email, calendar, sketch pad | Time (https://time.com/3137005/first-smartphone-ibm-simon): on sale 16 Aug 1994, touchscreen, email; Science Museum blog: sketch, calendar, notes, fax; CHM artifact 1733 | ✓ |
| 2007 · multi-touch glass, keypad into the screen | Apple press release 9 Jan 2007 (per STATE.md) | ✓ (well known; not refetched) |
| Today · computer, camera and till in one pocket | General description | ✓ |

### Other facts

| On the site | Source | Result |
|---|---|---|
| Fig. 4.3 "AT LEAST 48 DP" touch target | https://support.google.com/accessibility/android/answer/7101858: "Consider making sure these elements have a width and height of at least 48dp." | ✓ |
| Sheet 03.2: "Nine drawings took it from his 1877 box to the phone in your pocket" | `ERAS` has 9 entries (Figs. 1–9) | ✓ |
| Sheet 05: "Nine products … across nine industries"; "every screen drawn at full size or larger" | Products library: 9 products, 9 distinct industries; part views are 1:1, details 2:1 | ✓ |
| Sheet 05 detail notes (STRINGWALK R09 T14–T17 −18%; WARDCAST 6 beds 17:15–20:15; QUAYCALL QC05 recheck 06:15; OVERWING 2B Guest 4 still water, no ice; LOFTHAUL 3 drones out; NIGHTWELL T2 Field 18) | Cross-checked against the strings each product draws | ✓ all consistent |
| Sheet 09 "Every number on this sheet was measured in your browser" | `sheet-09.js` measures live; the only fixed cell is "Newsreader and DM Mono, both open licence" | ✓ |
| Colophon "Plates are public domain; typefaces and libraries are open licence" | GSAP licence; Commons CC BY | ✗, fixed (fix 5) |

## 3. The Lovelace line

- **Source:** *Scientific Memoirs*, vol. III, ed. Richard Taylor, London, Richard and John E. Taylor, 1843, "Translator's Notes to M. Menabrea's Memoir", **Note G** ("Note G.—Page 689."), **p. 722**. Internet Archive `india.history.resource.53369` (https://archive.org/details/india.history.resource.53369; item record confirmed: Scientific Memoirs vol. III, Taylor, 1843). I read the page image myself (`tools/sources/d2/lovelace/p722.jpg`): the page header reads "722 TRANSLATOR'S NOTES TO M. MENABREA'S MEMOIR", and Note G starts on it.
- **Printed:** "The Analytical Engine has no pretensions whatever to *originate* any thing. It can do whatever we *know how to order it* to perform. It can *follow* analysis; but it has no power of *anticipating* any analytical relations or truths."
- **On the site:** `“It can do whatever we <em>know how to order it</em> to perform.”` Word for word ✓, italics on exactly "know how to order it" ✓, full sentence quoted, so there is no ellipsis issue.
- **Attribution:** "Note G · A. A. L. · 1843" (her notes are signed "A. A. L.", visible on the same page at the end of Note F) and "Ada Lovelace … in the notes to her 1843 translation of Menabrea's paper on it" ✓. A secondary check (St Andrews MacTutor, Birmingham University) gives the same wording.

## 4. Fabricated-proof audit (all visible copy, alt text, aria-labels, JS strings, product screens, work order)

- **Clients / testimonials / awards / certifications:** none anywhere. The only certification-like words are inside
  concept screens ("CERTIFICATE EXPIRING ON A STAGING HOST", FERNPAY) and they are product data, not claims. No ISO,
  SOC 2 or pen-test claims. ✓
- **Studio performance numbers:** none. Numbers on the site are patent dates, era years, computed drawing dimensions,
  dimensionless stress ratios labelled "Drawn illustration of how we test, not a test report", concept-screen data, the
  example care log (labelled "Example log · drawn to show the method"), and live measurements on sheet 09. ✓
- **People:** no named or pictured team members. The bench (sheet 07) has five desks by discipline with no people; the
  title blocks name disciplines only. The only person named is Wajih (door plate, founder card, ©). In concept screens
  people are codes ("Guest 4", "Crew 07", "ED-0412", "Handler 14"). ✓
- **Wajih's past builds:** no POS, café software, car rental, sticker shop, Italy/Dubai sites or distributor app is
  mentioned. The work-order keyword list contains "pos" / "point of sale" only as words a visitor might type. ✓
- **Concept products:** every one carries "Concept sheet … Made up to show the range, not a client" (sheet 01 tag
  rewritten per product by `act.js`, sheet 05 reads, sheet 05 aria-labels). The AI quote: "Concept sheet · A made-up
  business, to show the idea", plus the aria-label "Concept sheet: an AI agent's drafted quote". ✓
- **Reply times:** none. Sheet 08 says only "we can reply where you send this from", and the status line gives the
  address. ✓
- **Founder card:** "Tunisian, based in Tunis. Speaks English, French and Tunisian Arabic. Seven years as cabin crew
  taught him that a process has to hold up when everyone is tired." The first three facts are from Part 1 (7 years,
  2019–2026). The "taught him…" clause comes from the draft pitch (Claude's wording, not Wajih's), so it is listed
  under open items. No past builds, no café, no airline, no Dubai. ✓
- **Studio claims:** "Specialists at every desk: design, engineering, security, AI, strategy. Every sheet drawn by
  one, checked by another." is Wajih's approved Part 2c line (✓ by approval, see open items). "This site is our first
  case study" and the hold and lede lines are brief lines. The offers (iOS and Android, private AI, restore-tested
  backups, signed and device-locked apps) describe services, not past results. ✓

## Open items (for the lead / Wajih)

1. **Wajih:** confirm the founder card's last sentence, "Seven years as cabin crew taught him that a process has to
   hold up when everyone is tired." It is Claude's paraphrase of the draft pitch. Part 1 asks him to confirm every
   line is true as written.
2. **Wajih:** "Specialists at every desk … Every sheet drawn by one, checked by another" is his approved Part 2c line.
   While the studio is one person, it reads as a present-tense claim of several specialists. Keep it as approved, or
   soften it (e.g. "A desk for every discipline")?
3. **Lead (CSS, not touched):** the new caption links inherit `a { color: inherit; text-decoration: none }`, so they
   don't look like links and have no custom focus ring. Suggest `.read__note a { text-decoration: underline;
   text-underline-offset: 2px }` plus a `:focus-visible` outline. The `.read` panels use `visibility: hidden` when off,
   so the links are not tabbable while hidden.
4. **Lead (JS, not touched):** `site/js/sheet03/scene.js` has `const NOW = 2026`, so the "163 years" spans go stale on
   1 Jan 2027. Suggest `new Date().getFullYear()`. `eras.js` "Today" `num: 2026` only positions the marker.
5. **Low risk, for the record:** the Leonardo files were taken from RWTH Aachen's mirror of the BNE scans (RWTH hosts
   them with the BNE's permission). For the cleanest provenance, they could be re-downloaded from the BNE's own
   Biblioteca Digital Hispánica. The images and the credit stay the same.
6. **Layout check:** the colophon body (sheet 09) is about two lines longer, and the Bell caption (sheet 01) and the
   Plan 25 caption are a few words longer. The functional sweep should glance at 390×844 and 1440×900.

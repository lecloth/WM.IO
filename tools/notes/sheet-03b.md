# Sheet 03b: Disciplines · Security + Disciplines · AI (builder D2)

## What I built

Two chapter sections inside sheet 03, between D1's engineering/infrastructure (`sheet-03`) and consulting (`sheet-03c`).

### `#s03-security`
- Title: "Disciplines · Security". Drawn Security, Checked Engineering, Approved AI.
- `--units: 11`, so p runs 0..12.

| p | What happens |
| --- | --- |
| 0 → 1 | **Entry.** A fresh sheet (paper, grid, frame) slides in from the right over D1's last scene. Its leading edge is a hard ink hairline, and it carries a mono tag "Sheet 03 · Security". |
| 1.0–2.5 | **Reading moment.** Yale's US 48,475 plate, with its caption. |
| 2.55–3.75 | The plate fades. Figs. 4 and 6 lift off it: real pixels plus potrace-traced hairlines. They turn 90° upright (the figures are drawn sideways on the sheet) and travel to the drawing position. A left-to-right sweep then wipes the ink while the traced lines un-draw. This is the same language as sheet 01's Bell redraw. |
| 3.3–4.05 | The modern pin-tumbler cylinder draws on line by line, all in code: Fig. A is a section along the plug, Fig. B the end view after Yale's Fig. 6. Shell and plug are hatched in opposite directions. Pins are not hatched (drafting convention). The shear line is a dash-dot line. Static leader labels: Shell, Pin chambers, Plug, Keyway, Shear line. |
| 4.45–6.3 | The right key slides in. The pins ride its cuts and all five reach the shear line. The plug turns 24° in Fig. B, turns back, and the key comes out. |
| 6.45–8.3 | **The pick attempt.** A tension wrench and a hook pick go in. Pin 1 sets. Pin 2 has a notched driver (after Yale's claim 4, "notched pin-tumblers"): it catches at the shear line in a false set and the plug gives 2°. Pin 3 will not lift and the plug binds. Tension is released, everything drops, and the lock is still locked. |
| 8.4–9.65 | **Reading moment.** "We pick our own locks first." |
| 9.7–11.0 | **Reading moment.** What we do in security: designed in, tested like an attacker, signed and locked apps, access control, backups. |

- A mono state line under the drawing narrates each step: rest, key, aligned, pick, set, false set, binds, failed. It is swapped whole, never scrubbed.
- All text is off by p = units (11), because the AI sheet slides over this one from 11 to 12.

### `#s03-ai`
- Title: "Disciplines · AI". Drawn AI, Checked Security, Approved Engineering.
- `--units: 11.5`.

| p | What happens |
| --- | --- |
| 0 → 1 | **Entry.** The same calm plate-slide, tagged "Sheet 03 · AI". |
| 1.0–2.5 | **Reading moment.** Babbage's Plan 25 (1840) with a real Jacquard card (Posselt, Fig. 22) beside it. |
| 2.6–3.45 | A scan line sweeps Plan 25. Babbage's ink is wiped behind it while the engine redraws in hairlines on the same layout: the mill with its rings of columns, the store's two rows of variable columns along the rack, three barrels, carriages, the counting apparatus, and the operation, variable and number card readers with their card tracks. |
| 3.5–4.85 | **Reading moment.** Lovelace's Note G (verified wording below), then "We still build it that way." |
| 4.9–6.55 | The engine zooms. Punched cards, made in code after Fig. 22's rows, slide along the tracks into the readers as you scroll, and every figure wheel turns. A state line, "Cards in", lists the request, the price list, the stock, the calendar and the rules as they feed. |
| 6.6–7.1 | The engine shrinks to the margin. A wire runs from the store to a panel, and the panel's frame draws on. |
| 7.15–8.6 | **Reading moment.** A drafted quote for a made-up joinery (Concept sheet), with a human checkpoint. "Approve and send" and "Edit draft" are real buttons, but local only: nothing is sent, and the state text says so. |
| 8.65–10.0 | **Reading moment.** What we build in AI: agents, AI inside products, private AI. |
| 10.05–11.5 | **Reading moment.** "We attack your AI before someone else does." It covers testing for leaks, manipulation and misuse. |

- All text is off by p = units (11.5), for D1's consulting entry.

### Both sections
- **Reduced motion:** each section becomes a static run of full-screen blocks.
  - Security: the plate with its caption; the finished drawing (the failed attempt, frozen) with "We pick our own locks first."; the offer.
  - AI: the plates with their caption; the finished engine with the Lovelace quote; the quote panel with its caption; the offer and AI security.
- **Mobile 390×844:** the drawing sits above and the reading below. On mobile the drawing is hidden during the late reading moments, so text never overlaps it. The Jacquard card is shown turned 90° under Plan 25.
- **Measured:** fps over both sections, scrolled programmatically (`tools/sources/d2/fps_d2.py`): 59.2 desktop and 59.4 mobile, p95 16.7 ms, no errors.

## Files
- **Markup and code:** `src/parts/sheet-03b.html`, `site/css/sheet-03b.css`, `site/js/sheets/sheet-03b.js`, and `site/js/sheet03b/` (`security.js`, `ai.js`, `lock.js`, `engine.js`, `plate-fig.js`, `yale-fig4.js`).
- **Plates:**
  - `site/media/plates/sec-yale-us48475-sheet.webp`
  - `site/media/plates/sec-yale-us48475-fig4.webp`
  - `site/media/plates/ai-babbage-plan25-1840.webp`
  - `site/media/plates/ai-posselt-1888-fig22.webp`
- **Scripts that made the plates and the trace:**
  - `tools/sources/d2/prep_yale.py` (cleans the scan, crops and turns Figs. 4+6 upright, writes `yale-fig4.js` with potrace).
  - `tools/sources/d2/prep_plan25.py` (green channel, flat-field division, levels).
  - The Posselt card crop and levels are inline in the session; the source is `tools/sources/d2/jacq/p104_400.png`.
- **Test helpers:** `tools/sources/d2/shoot_d2.py` (shots at scene p), `probe_d2.py`, `fps_d2.py`, `overflow_d2.py`.

## Outside assets (for CREDITS.md)

| File | What it is | Source | Licence | Where used |
| --- | --- | --- | --- | --- |
| `sec-yale-us48475-sheet.webp`, `sec-yale-us48475-fig4.webp` (+ traced `yale-fig4.js`) | US Patent 48,475, "Improvement in Locks", Linus Yale Jr., Shelburne Falls, Mass., granted 27 June 1865. Drawing sheet: Figs. 1–20. Crop: Figs. 4 and 6 | Google Patents US48475A, PDF https://patentimages.storage.googleapis.com/7f/9d/64/b736a3027fc5bf/US48475.pdf (page 1, embedded 2320×3408 scan) | Public domain (US patent, 1865) | Security plate and redraw |
| `ai-babbage-plan25-1840.webp` | Charles Babbage, Plan 25, "The General Plan of Mr Babbage's Great Calculating Engine", dated 6 August 1840 (inscribed on the plan). The file is a photograph of the plan as displayed at the Computer History Museum, cleaned to ink on paper (grey, flat-field corrected, cropped) | https://commons.wikimedia.org/wiki/File:Babbage_Analytical_Engine_Plan_1840_CHM.agr.jpg (1920 px rendition) | Drawing: public domain (Babbage d. 1871). Photo: **CC BY 4.0, ArnoldReinhold**; credited on the plate's caption line ("photo ArnoldReinhold, CC BY 4.0"). Changes: cropped, converted to greyscale, levels | AI plate and redraw |
| `ai-posselt-1888-fig22.webp` | E. A. Posselt, *The Jacquard Machine Analyzed and Explained, with an Appendix on the Preparation of Jacquard Cards*, Philadelphia, 1888 (copyrighted 1887), p. 91, Fig. 22: a punched Jacquard card | Internet Archive `jacquardmachinea00poss`, https://archive.org/details/jacquardmachinea00poss | Public domain (US, 1888; LoC "unaware of any copyright restrictions") | AI plate. The code-made cards follow its layout of lacing holes plus rows of holes |

- Everything else (the lock, the key, the pick, the engine, the cards, the quote panel) is drawn in code.
- Rejected: the Science Museum Group scans of Plan 25 are CC BY-NC-SA 4.0, so NC is not usable here.

## Facts and their sources

### Yale's patent (US 48,475)
All from the patent text (Google Patents PDF, pages 2–4, read in full):
- Granted 27 June 1865 to Linus Yale Jr. of Shelburne Falls, Massachusetts. Title "Improvement in Locks".
- "The improvements relate partly to the security of locks against picking". The site quotes "the security of locks against picking".
- "The pieces I and J are of different lengths, and must all be arranged by the key, so that the various lines of division between the two parts of the tumblers are all in the same line before the cylinder D can be turned." The site paraphrases this as "Pins of different lengths must all be lined up by the key before the cylinder can turn."
- Fig. 4 is "a section on line y y of Figs. 1 and 3"; Fig. 6 is a "section through the tumbler-case and cylinder on line a a of Fig. 4". Hence "Figs. 4 and 6".
- Claim 4: "Notched pin-tumblers, in combination with a key-hole slit narrower than the diameter of the pins …". This is the basis for the notched driver that catches.
- Also checked: US 31,278 (Yale Jr., 29 Jan 1861) is a drawer lock with a revolving bolt, not the cylinder lock, so I did not use it.

### Plan 25
- **6 August 1840:** inscribed on the plan ("Plan 25. 6 August 1840"). The Commons record gives the date as 6 August 1840.
- **August 1840:** the editor's note in *Scientific Memoirs* vol. 3 (1843), p. 669, says "At a later period (August 1840) Mr. Babbage caused one of his general plans (No. 25) of the whole Analytical Engine to be lithographed at Paris."
- **"It was never finished":** the Science Museum Group record for the trial model (object 1878-3, https://collection.sciencemuseumgroup.org.uk/objects/co62245/) says "Only part of the machine as a trial piece was completed before Babbage's death in 1871."

### Punched cards from the Jacquard loom
- Menabrea / Lovelace, *Scientific Memoirs* vol. 3: "The solution of this problem has been taken from Jacquard's apparatus, used for the manufacture of brocaded stuffs".
- Lovelace, Note A, p. 696: "the principle which Jacquard devised for regulating, by means of punched cards, the most complicated patterns in the fabrication of brocaded stuffs".
- So the site says "which wove patterns into brocade", not "silk".

### The Lovelace quote: verified word for word against the 1843 printing
- **Source:** *Scientific Memoirs, Selected from the Transactions of Foreign Academies of Science and Learned Societies*, ed. Richard Taylor, vol. III, London, Richard and John E. Taylor, 1843.
  - "Translator's Notes to M. Menabrea's Memoir", **Note G** ("Note G.—Page 689."), **p. 722**, signed "A. A. L.".
  - Scan: Internet Archive `india.history.resource.53369`, leaf n748, https://archive.org/details/india.history.resource.53369 (page image fetched and read: `tools/sources/d2/lovelace/p722.jpg`; crop `quote_crop.jpg`).
- **The printed sentence:** "The Analytical Engine has no pretensions whatever to *originate* any thing. It can do whatever we *know how to order it* to perform. It can *follow* analysis; but it has no power of *anticipating* any analytical relations or truths."
- **On the site:** "It can do whatever we *know how to order it* to perform."
  - This is exactly as printed, including the italics on "know how to order it".
  - The brief's version, "can do whatever we know how to order it to perform", is correct word for word.
- **Attribution on the site:** "Note G · A. A. L. · 1843", plus "Ada Lovelace, on Babbage's engine, in the notes to her 1843 translation of Menabrea's paper on it."
- **Also verified, not used on the site:** Note A, p. 696: "the Analytical Engine *weaves algebraical patterns* just as the Jacquard-loom weaves flowers and leaves."

### Posselt's Fig. 22
- The 1888 title page: "Philadelphia … 1888. Copyrighted, 1887, by E. A. Posselt" (IA djvu text).
- Fig. 22 is on p. 91: "Fig. 22 shows the corre[sponding card]".

## Made-up names (checked)
- **Hollin & Pike Joinery:** the made-up business in the AI quote. Web searches for "Hollin & Pike" joinery and "Hollin and Pike" furniture workshop found no such company.
- **How it is labelled:** "Concept sheet · A made-up business, to show the idea", plus the panel's aria-label.
- **Other content:**
  - Quote numbers, dates and the product are illustrative. There is no real client and no real statistic.
  - The customer is unnamed ("a café").

## Decisions I made alone
- **In-sheet transitions:**
  - D1's files had no in-sheet device I could reuse when I started (`sheet-03` was a placeholder), so I used a calm plate-slide of my own: a fresh sheet slides in from the right with a hard hairline edge.
  - It is the same for both of my sections, because they are sub-scenes of one sheet, not chapter changes. There is no black moment, so `is-black-moment` is never set.
- **The Yale plate** is shown as published, with its figures sideways on the sheet. The figure turns upright as it lifts off, like turning the sheet to read it.
- **The pick's failure is mechanical, not slapstick:**
  - It shows a false set on a notched driver, the security feature Yale himself claimed, and the plug binding at 2°.
  - "We pick our own locks first." comes straight after it, as in the brief.
- **The offer copy holds no certifications and no numbers.** It covers: designed in; tested like an attacker; apps signed, protected and locked to the company's own devices; access control; backups restored on purpose.
- **AI redraw:** a scan-line sweep with the code engine drawing on over the same layout, rather than tracing Plan 25 (too dense to trace cleanly). It is still line by line, and it is different from the Yale lift-and-turn, so the two plates don't feel copied.
- **AI security has its own reading moment** (it is the line of the section), and the other three offers share one.
- **The checkpoint buttons work** (approve, or edit the draft in place). This is a local illustration only, and it says so.

## Known limits
- The code engine is a simplified redraw "after Plan 25", not a facsimile.
- On mobile the redraw lands less exactly on the plate than on desktop.
- The cards are small at 390 px but legible as punched cards.
- If the window is resized while a mobile late reading moment is showing (the drawing is `display: none` then), the draw-on ordering is computed from zero-size boxes. It only affects the draw-on order if you scroll back up.
- The page-wide title block sometimes shows the previous sheet for a moment after a programmatic jump. That is in `main.js`, not my code.

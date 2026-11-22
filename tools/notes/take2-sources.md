# Take 2: real material ("real before drawn", Brief Part 5)

Searched 22 Nov 2026. Accepted: public domain, CC0, CC BY, MIT. Rejected: anything NC or ND. CC BY-SA and GPL are not on
the allowed list. Every licence was read on the source page itself or that site's own API (Sketchfab API, Printables
GraphQL, Wellcome catalogue API, Internet Archive metadata, Commons file page, Met API), never on a mirror.

The full per-find logs (what, URL, licence, size, polycount, why, verdict, plus everything seen and rejected) are in:
- `tools/notes/take2-sources-lock-gears.md`: pin-tumbler lock, gear train
- `tools/notes/take2-sources-phone-press-switch.md`: Bell's telephone, hand press, switchboard
- `tools/notes/take2-sources-babbage-jacquard.md`: Difference Engine, Jacquard cards

Raw downloads sit in `tools/sources/take2/<object>/<slug>/` (git-ignored). Files actually used are in `CREDITS.md`.

## What blocks a download
- **Printables and Sketchfab** hand out files only to logged-in users; their anonymous APIs refuse. We do not work
  around a login, so every 3D pick there is a manual download by Wajih (free accounts).
- **Wikimedia Commons' file server, Thingiverse, si.edu, the Met's image host and DigitaltMuseum** blocked this
  machine's scripted requests (429 / 403 / bot checks). Their licences were still read via their APIs or pages where
  possible; the files are manual downloads.

## Summary by object

| Object | Best 3D (licence, size) | Best picture (licence) | Status |
|---|---|---|---|
| Pin-tumbler lock (Yale lineage) | **"Cutaway Lock" by zbzzn**, Printables 250197, CC BY. 21 STLs, one per part (plug, housing, lid, clip, 5 key pins, drivers, 6 keys), 7.8 MB, 156,526 triangles (68k of it one optional driver). No springs or cam meshes | Yale's own patent US 48,475 (1865, PD), already in the site | Wajih downloads the 3D (needs login) |
| Gear train | **"Pendulum Clock" by Steve**, Printables 2508, CC BY: a real built 8-day clock, every wheel a separate STL (~10k triangles each). Historical: "The Antikythera Mechanism" by Thomas Weibel, Sketchfab, CC BY, 868k faces, GLB 42 MB | Encyclopédie *Recueil de planches*, "Horlogerie", 1765 (Goussier del., Bénard sculp.), PD, Internet Archive / Getty: full gear trains in plan and section, an exploded watch | Picture downloaded; 3D needs login |
| Bell's 1877 telephone | **None usable.** Smithsonian's scan is non-commercial; the only CC BY Sketchfab one says it was made with AI | **du Moncel, *The Telephone…* (1879), Fig. 16**: Bell's box telephone in section (magnet, coil, diaphragm, mouthpiece), PD, IA. Photo: Daderot, "Bell's big box telephone, 1876", NMAH, CC0, 4320×3240 | Fig. 16 downloaded and used; photo manual |
| Hand printing press | **"Columbian Press No 3180" by arboo**, Sketchfab, CC BY 4.0, 232k faces, 26 materials, 7 animations (parts very likely separate). Alt: "Albion No. 6551" (William Morris's press), CC BY 4.0, 787k faces | **"Clymer and Dixon's patent Columbian printing press"**, lithograph 1852, Wellcome, Public Domain Mark, 2244×3400, parts drawn apart. Also Farey 1819, two Encyclopédie press plates, Amman 1568 (all PDM) | Pictures downloaded, Columbian used; 3D needs login |
| Telephone switchboard | cimec's Artec scan of an early-1900s cord switchboard (Muzeul Ianca), Sketchfab, CC BY 4.0, 1.19M faces, **one fused mesh** (can't come apart). Backup: tasoschris's 1920s desktop board, CC BY, 118k faces | **Kempster Miller, *American Telephone Practice* (1905), Fig. 215–216**, Paris multiple switchboard, PD (LoC copy, IA), 2913×4739 | Pictures downloaded, Fig. 215 used; 3D needs login |
| Difference Engine | **None free.** Every model found is all-rights-reserved, NC or NC-ND | **Frontispiece of Babbage's *Passages from the Life of a Philosopher* (1864)**: woodcut of Difference Engine No. 1, drawn by B. H. Babbage, PD, IA 500 ppi raw capture with the book's marbled edge. Photos: Jurvetson "Cranking the Difference Engine" (CC BY 2.0), Wichary "The Difference Engine wheels" (CC BY 2.0) | Frontispiece and both photos downloaded (photos from their Flickr originals, CC BY 2.0 on the Flickr page) |
| Jacquard punch cards | **None free** | **"Mr. J. Hughes improved Cards for weaving figured Silks"**, Plate 5, drawn by C. Varley, engraved by G. Gladwin, Wellcome V0024104, PDM (Wellcome's date "1753" is wrong: Varley was born 1781, so no date is shown). Photos: Robert-brook "Jacquard loom cards" (CC0), Renhour48 Fresnoy-le-Grand loom (CC0) | Plate downloaded and used; photos manual |

## Used in the style lab (this commit)
- `site/media/take2/columbian-press-1852.webp`, `dumoncel-1879-fig16.webp`, `miller-1905-fig215.webp`,
  `hughes-cards-fig6-7.webp`: crops of the scans above, kept with their paper (C1–C3 cards).
- `site/media/paper/miller-1905-paper.webp`: a blank margin of Miller 1905 (IA scan page n262), mirrored into a tile: the real
  paper under A2.
- The lock model (A1–A3, B1–B3): see `CREDITS.md` once downloaded.

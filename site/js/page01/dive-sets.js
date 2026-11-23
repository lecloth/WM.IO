// The dive's corridor: three candidate sets of real drawing sheets, five each (public domain; sources and rights lines
// in CREDITS.md), shown side by side on the asset sheet (site/dev/assets.html) for Wajih's pick.
// PICK = the set on page 1 meanwhile (pending his pick). Web files: site/media/corridor/<set>/NN.webp, made from the
// Library of Congress 400 dpi masters (HAER) and the USPTO page scans (patents) by tools/corridor_webp.py.
const LOC = (id, n) => `https://www.loc.gov/pictures/item/${id}.sheet.000${String(n).padStart(2, '0')}a`;
const GP = (n) => `https://patents.google.com/patent/${n}A/en`;
const sheet = (set, i, w, h, credit, url) => ({ src: `media/corridor/${set}/0${i}.webp`, w, h, credit, url });
export const SETS = {
  c: { name: 'One sugar mill, measured', note: 'HAER, Puerto Rico: two haciendas’ steam engines, reduction gears and cane mills. One survey, one hand, one border.',
    sheets: [
      sheet('c', 1, 2400, 1600, 'Hacienda La Esperanza, beam engine and flywheel (HAER PR-1-A, sheet 1)', LOC('pr0016', 1)),
      sheet('c', 2, 2400, 1599, 'La Esperanza, engine end elevations (HAER PR-1-A, sheet 2)', LOC('pr0016', 2)),
      sheet('c', 3, 2400, 1600, 'La Esperanza, reduction gears and cane mill (HAER PR-1-A, sheet 3)', LOC('pr0016', 3)),
      sheet('c', 4, 2400, 1600, 'Hacienda La Igualdad, north elevation of machinery (HAER PR-7, sheet 3)', LOC('pr0031', 3)),
      sheet('c', 5, 2400, 1599, 'La Igualdad, sections, mill, gears, flywheel (HAER PR-7, sheet 5)', LOC('pr0031', 5)),
    ] },
  a: { name: 'Five machines, measured', note: 'HAER, mixed: a steam schooner’s engine, a windmill’s wooden gears, a cable railway’s winding machinery, a truss bridge, a turbine.',
    sheets: [
      sheet('a', 1, 2400, 1855, 'Steam schooner Wapama, engine axonometric views (HAER CA-67, sheet 21)', LOC('ca1521', 21)),
      sheet('a', 2, 2400, 1598, 'Windmill at Water Mill, NY, wood gear construction (sheet 5)', LOC('ny1142', 5)),
      sheet('a', 3, 2400, 1596, 'San Francisco cable railway, winding machinery (HAER CA-12-A, sheet 5)', LOC('ca1270', 5)),
      sheet('a', 4, 2400, 1600, 'Wyman Bridge, Arkansas, truss elevation and plan (HAER AR-38, sheet 2)', LOC('ar0096', 2)),
      sheet('a', 5, 2400, 1598, 'Georgetown Steam Plant, Seattle, turbine isometric (HAER WA-1, sheet 8)', LOC('wa0169', 8)),
    ] },
  b: { name: 'Five patents, calculating and power', note: 'US patent sheets, 1847–1888: Baldwin’s and Burroughs’s calculating machines, Hoe’s press, Corliss’s engine, Odhner’s arithmometer.',
    sheets: [
      sheet('b', 1, 1634, 2400, 'F. S. Baldwin, Calculating-Machine, US 159,244 (1875)', GP('US159244')),
      sheet('b', 2, 1634, 2400, 'W. S. Burroughs, Calculating Machine, US 388,116 (1888)', GP('US388116')),
      sheet('b', 3, 1634, 2400, 'R. M. Hoe, Printing Press, US 5,199 (1847)', GP('US5199')),
      sheet('b', 4, 1634, 2400, 'G. H. Corliss, Steam Engine, US 6,162 (1849)', GP('US6162')),
      sheet('b', 5, 1634, 2400, 'W. Odhner, Calculating-Machine, US 209,416 (1878)', GP('US209416')),
    ] },
};
export const PICK = 'c';   // pending Wajih's pick on the asset sheet

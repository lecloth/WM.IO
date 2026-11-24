// Page 1's ground (Part 5 "Round 5", item 4). Round 4's ground behind page 1's later screens was an aged paper tile
// (Miller 1905, #E9DDC6): Wajih, "brownish yellowish". Three clean grounds (site/css/page-01.css, .p1[data-ground]):
//   A · Clean paper (on the page until Wajih picks): the same drafting paper and fine grid as the hallway and page 2,
//       so the whole site is one paper.
//   B · Museum white: near-white, no grid, soft real shadows under the plate and the phone.
//   C · Fresh real paper: a bright, unaged paper scan (ambientCG Paper001, CC0), almost white.
// In every ground, Bell's plate keeps its own scanned paper: a sheet lying on the page, not printed into it.
// THE SWITCH: `GROUND` is the ground on the page; `?ground=B` previews another (for review only, nothing is stored).
export const GROUND = 'A';
export const GROUNDS = { A: 'Clean paper', B: 'Museum white', C: 'Fresh real paper' };
export function groundPick() {
  try { const q = (new URLSearchParams(location.search).get('ground') || '').toUpperCase(); if (GROUNDS[q]) return q; } catch (e) {}
  return GROUND;
}
// how strongly the finished phone's soft shadow falls on each ground (B: a museum's lit object)
export const PHONE_SHADOW = { A: 1, B: 1.45, C: 1.1 };

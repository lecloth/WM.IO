// The top bar (the strip): eight page boxes and "Take a shortcut →", each on whole columns of the grid. Part 5 "The name,
// the top bar and the title block": on arrival the mark sits in the bar's first columns (MARK_COLS); as it leaves, the
// boxes slide over to fill its space (k: the mark's share, 1 -> 0), and from then on they keep the full width (the bar
// never gets the mark back). Each box's edges move from their place beside the mark to their place without it, so at
// both ends every edge is on a column.
const segs = () => [...document.querySelectorAll('.strip__seg')];
export const markCols = () => (innerWidth >= 1024 ? 5 : 4);
let k = 0;
export function layoutStrip(share = k) {
  k = share;
  const n = window.__grid?.n || 20, cut = innerWidth >= 1024 ? 7 : 6, m = n - cut, mc = markCols(), list = segs();
  const edge = (i, from) => Math.round(from + i * (m - from) / list.length);
  list.forEach((s, i) => {
    const a = edge(i, 0) + (edge(i, mc) - edge(i, 0)) * k, b = edge(i + 1, 0) + (edge(i + 1, mc) - edge(i + 1, 0)) * k;
    s.style.setProperty('--c0', (a + 1).toFixed(4)); s.style.setProperty('--c1', (b + 1).toFixed(4));
  });
  const c = document.querySelector('.strip__cut');
  if (c) { c.style.setProperty('--c0', m + 1); c.style.setProperty('--c1', n + 1); }
  const mk = document.querySelector('.strip__mark');
  if (mk) { mk.style.setProperty('--c1', mc + 1); mk.hidden = k <= 0; }
}

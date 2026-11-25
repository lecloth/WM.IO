// Round 6: the grid as the layout system (Part 5 "Round 6"). The head script (src/index.template.html) sets the unit
// --u (the width holds a whole number of cells: 20 on phones, a multiple of 5 keeping a cell about 22 px elsewhere;
// 1rem = 1 cell) and window.__grid. This module is the scripts' side of it: the unit, snapping to lines and half lines,
// where a text's baseline is, and blocks that must stay whole cells tall.
export const grid = {
  get u() { return window.__grid?.u || parseFloat(getComputedStyle(document.documentElement).fontSize) || 20; },
  get n() { return window.__grid?.n || 20; },
  /** the nearest line (k = 1) or half line (k = 0.5) to v (px from the grid's origin) */
  snap(v, k = 1) { const s = this.u * k; return Math.round(v / s) * s; },
  floor(v, k = 1) { const s = this.u * k; return Math.floor(v / s + 1e-6) * s; },
  ceil(v, k = 1) { const s = this.u * k; return Math.ceil(v / s - 1e-6) * s; },
  /** whole cells covering a length */
  cells(v) { return Math.round(v / this.u); },
  onChange(fn) { document.addEventListener('wm:grid', (e) => fn(e.detail)); },
};

/** where the first baseline of el's text is (client px): a zero-size inline-block at the start of its first line sits
 *  on the baseline. Measured with the element as laid out (transforms included). */
export function baselineOf(el) {
  const p = document.createElement('span');
  p.style.cssText = 'display:inline-block;width:0;height:0;margin:0;padding:0;border:0;vertical-align:baseline';
  // right before the first letter (as the element's first child it can stay at the end of the line above, where a
  // line wraps just before this element: round 7, the "us" in "YOU gave us the task.")
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 3) });
  const t = w.nextNode();
  if (t) t.parentNode.insertBefore(p, t); else el.insertBefore(p, el.firstChild);
  // the words stand settled while measured (a word waiting to rise is offset by its reveal)
  el.classList.add('is-measuring');
  const y = p.getBoundingClientRect().top;
  el.classList.remove('is-measuring');
  p.remove();
  return y;
}

/** blocks with .g-snap keep their height a whole number of cells: the remainder is padded at the bottom (--snap), so
 *  whatever follows starts on a line. Watches them (and new ones under root) as they change size. */
export function snapHeights(root = document) {
  // sizes from the observer (layout sizes, fractional, untransformed: page 2 is scaled during the dive)
  // the sizes are read in the observer's callback and the padding applied on the next frame (changing a size inside the
  // callback would start another round of notifications in the same frame, which the browser reports as a loop)
  const ro = new ResizeObserver((es) => { const m = es.map((e) => [e.target, e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height]); requestAnimationFrame(() => m.forEach(([el, h]) => fit(el, h))); });
  const fit = (el, box) => {
    const u = grid.u, pad = parseFloat(el.style.getPropertyValue('--snap')) || 0;
    // --snap-off (in cells): the block starts that far past a line (e.g. half a cell down), so it ends on one
    const off = (parseFloat(getComputedStyle(el).getPropertyValue('--snap-off')) || 0) * u, h = box - pad + off;
    if (h - off <= 0.5) { if (pad) el.style.setProperty('--snap', '0px'); return; }
    const want = Math.ceil(h / u - 1e-3) * u - h;
    if (Math.abs(want - pad) > 0.01) el.style.setProperty('--snap', `${want.toFixed(3)}px`);
  };
  // border-box: the observer also sees its own padding land, so it settles on the right value (content-box missed it)
  const watch = (el) => { if (el.__snap) return; el.__snap = 1; ro.observe(el, { box: 'border-box' }); };
  root.querySelectorAll('.g-snap').forEach(watch);
  // a new unit: observe again (the observer reports every element once on observe)
  const again = () => root.querySelectorAll('.g-snap').forEach((el) => { ro.unobserve(el); ro.observe(el, { box: 'border-box' }); });
  grid.onChange(again); document.fonts?.ready.then(again);
  return { watch };
}

/** Texts split into words that are switched on and off (a verb's meaning, page 2's answers) are not trimmed: Chrome
 *  re-lays a trimmed text of inline-block words a sixth of a cell low when its words' styles change. Instead their
 *  first baseline is seated on the grid by measurement: the top padding that puts it on the next line (step q cells;
 *  later lines follow at whole steps of the line height). Measured in the element's own (unscaled) space. */
export function seatText(el, q = 0.5) {
  if (!el || !el.isConnected) return;
  el.style.paddingTop = '0px';
  const r = el.getBoundingClientRect(), k = el.offsetWidth ? r.width / el.offsetWidth : 1;
  if (!r.width || !k) return;
  const b = (baselineOf(el) - r.top) / k, s = q * grid.u, pad = ((-b % s) + s) % s;
  el.style.paddingTop = `${pad.toFixed(3)}px`;
}

// Sheet 07 -> 08: the title block grows into the work order.
// The page's fixed title block (bottom right) is "selected" like an object in CAD (grips at its corners), then
// stretched from its corner until it fills the drawing frame: its own cells scale with it. Then the cells subdivide
// and merge into the work order's cells (fields, title block, send row), and the form appears in them.
// Everything is our own SVG layer drawn over sheet 07, which stays pinned underneath. Lines only: no text moves.
import { span, ease, lerp } from '../engine/kit.js';

const NS = 'http://www.w3.org/2000/svg';
export const GT = { select: [0.02, 0.1], grow: [0.1, 0.56], split: [0.52, 0.88], show: 0.88, off: 0.93 };

function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
}
const L = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
const C = (r) => [r.x + r.w / 2, r.y + r.h / 2];
function setR(e, r) { e.setAttribute('x', r.x.toFixed(2)); e.setAttribute('y', r.y.toFixed(2)); e.setAttribute('width', Math.max(0, r.w).toFixed(2)); e.setAttribute('height', Math.max(0, r.h).toFixed(2)); }

export function createGrow(svg) {
  svg.innerHTML = '';
  const band = el('line', { class: 's08g-band' }, svg);
  const outer = el('rect', { class: 's08g-outer' }, svg);
  const cellsG = el('g', { class: 's08g-cells' }, svg);
  const gripsG = el('g', { class: 's08g-grips' }, svg);
  const grips = Array.from({ length: 8 }, () => el('rect', { width: 7, height: 7, class: 's08g-grip' }, gripsG));
  let G = null, tbEls = [], morphEls = [];

  /** all rects in stage pixels: A the title block, B the work order; tb the title block's cells, fin the form's cells */
  function layout(W, H, A, B, tb, fin) {
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const M1 = (r) => ({ x: B.x + (r.x - A.x) / A.w * B.w, y: B.y + (r.y - A.y) / A.h * B.h, w: r.w / A.w * B.w, h: r.h / A.h * B.h });
    // Subdivision: every edge of every work-order cell starts on the nearest line of the stretched title block and
    // slides along its axis to where it belongs. Cells that share an edge share its line the whole way, so the grid
    // stays a clean grid while it reorganises; a cell whose two edges start on the same line grows out of that line.
    const xs = new Set([B.x, B.x + B.w]), ys = new Set([B.y, B.y + B.h]);
    tb.map(M1).forEach((r) => { xs.add(r.x); xs.add(r.x + r.w); ys.add(r.y); ys.add(r.y + r.h); });
    const snap = (v, set) => { let b = v, d = Infinity; set.forEach((s) => { const k = Math.abs(s - v); if (k < d) { d = k; b = s; } }); return b; };
    const morphs = fin.map((f) => {
      const x0 = snap(f.x, xs), x1 = snap(f.x + f.w, xs), y0 = snap(f.y, ys), y1 = snap(f.y + f.h, ys);
      return { from: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, to: f };
    });
    G = { W, H, A, B, tb, morphs };
    cellsG.innerHTML = '';
    tbEls = tb.map(() => el('rect', { class: 's08g-cell' }, cellsG));
    morphEls = morphs.map(() => el('rect', { class: 's08g-cell' }, cellsG));
  }

  function render(p) {
    if (!G || p < GT.select[0] || p >= GT.off) { svg.style.visibility = 'hidden'; return; }
    svg.style.visibility = 'visible';
    const { A, B, tb, morphs } = G;
    const g1 = ease(span(p, ...GT.grow)), g2 = ease(span(p, ...GT.split));
    const O = L(A, B, g1);
    // while selected, the outline and grips sit just outside the title block (which stays on top of everything)
    const pad = 5 * (1 - g1), S = { x: O.x - pad, y: O.y - pad, w: O.w + pad * 2, h: O.h + pad * 2 };
    setR(outer, S);
    outer.classList.toggle('is-selected', g1 === 0);
    // grips: corners and mid-points of the object being stretched (only while it is being stretched)
    const showGrips = p >= GT.select[0] + 0.02 && p < GT.grow[1];
    gripsG.style.visibility = showGrips ? 'visible' : 'hidden';
    if (showGrips) {
      const pts = [[S.x, S.y], [S.x + S.w / 2, S.y], [S.x + S.w, S.y], [S.x + S.w, S.y + S.h / 2], [S.x + S.w, S.y + S.h], [S.x + S.w / 2, S.y + S.h], [S.x, S.y + S.h], [S.x, S.y + S.h / 2]];
      grips.forEach((gr, i) => { gr.setAttribute('x', (pts[i][0] - 3.5).toFixed(1)); gr.setAttribute('y', (pts[i][1] - 3.5).toFixed(1)); gr.classList.toggle('is-hot', i === 0 && g1 > 0 && g1 < 1); });
    }
    // the rubber band from where the corner was picked up to where it is now
    const bandOn = g1 > 0 && g1 < 1;
    band.style.visibility = bandOn ? 'visible' : 'hidden';
    if (bandOn) { band.setAttribute('x1', A.x - 5); band.setAttribute('y1', A.y - 5); band.setAttribute('x2', S.x.toFixed(1)); band.setAttribute('y2', S.y.toFixed(1)); }
    // cells: the title block's own cells scale with it, then subdivide / merge into the work order's cells
    const mapped = (r) => ({ x: O.x + (r.x - A.x) / A.w * O.w, y: O.y + (r.y - A.y) / A.h * O.h, w: r.w / A.w * O.w, h: r.h / A.h * O.h });
    const splitting = g2 > 0;
    // the title block's own cells let go as the work order's cells take over
    const fade = 1 - Math.min(1, g2 / 0.45);
    tbEls.forEach((e, j) => { e.style.display = fade > 0 ? '' : 'none'; if (fade > 0) { setR(e, mapped(tb[j])); e.style.strokeOpacity = splitting ? fade.toFixed(3) : ''; } });
    morphEls.forEach((e, i) => { e.style.display = splitting ? '' : 'none'; if (splitting) setR(e, L(morphs[i].from, morphs[i].to, g2)); });
  }

  return { layout, render };
}

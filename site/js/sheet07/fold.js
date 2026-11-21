// Sheet 06 -> 07: the previous sheet folds down to title-block size, the way a large drawing is folded for filing,
// and is filed away. Crease lines draw across it first; then roll folds, panel by panel: vertical folds towards the
// right, then horizontal folds down onto the bottom-right corner, until what is left is a packet exactly the size of
// the title block. The packet drops out of view; sheet 07 is what was underneath.
//
// We cannot fold another sheet's DOM, so this is drawn in place: the old sheet stays pinned underneath, our own
// sheet is revealed outside the "hole" (the part of the old sheet still flat), and the moving panels are our own
// paper. The view is orthographic (a drawing's elevation), so a panel turning about its crease projects to
// width * cos(angle): exact, no perspective trickery. Turning faces get a flat tone; the first fold's front face is
// the old sheet itself (it shows through under the tone), every face after that is the blank back of the paper.
import { clamp, span, ease, easeIn } from '../engine/kit.js';

const NS = 'http://www.w3.org/2000/svg';
export const FT = { crease: [0.02, 0.15], v: [0.15, 0.47], h: [0.47, 0.86], file: [0.86, 0.97] };

function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
}

export function createFold(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const clip = el('clipPath', { id: 's07-hole' }, defs);
  const holeRect = el('rect', { x: 0, y: 0, width: 0, height: 0 }, clip);
  const g = el('g', { 'clip-path': 'url(#s07-hole)' }, svg);
  const rest = el('rect', { class: 's07f-paper' }, g);           // the folded stack lying flat below the moving row
  const flapPaper = el('rect', { class: 's07f-paper' }, g);       // the moving panel (paper part)
  const flapTone = el('rect', { class: 's07f-tone' }, g);         // its flat shade
  const flapEdge = el('rect', { class: 's07f-edge' }, g);         // its outline
  const hinge = el('line', { class: 's07f-hinge' }, g);           // the crease it turns about
  // creases sit on top: the back of the paper carries the same creases, so they run across the turned panels too
  const creaseG = el('g', { class: 's07f-creases' }, g);

  let G = null;
  let creases = [];

  function layout(W, H, tb) {
    const pw = clamp(W - tb.left, 40, W * 0.6), ph = clamp(H - tb.top, 30, H * 0.4);
    const X0 = W - pw, Y0 = H - ph;
    const nv = Math.max(1, Math.floor(X0 / pw)), w = X0 / nv;
    const nh = clamp(Math.floor(Y0 / ph), 1, 6), hh = Y0 / nh;
    G = { W, H, pw, ph, X0, Y0, nv, w, nh, hh };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    creaseG.innerHTML = '';
    creases = [];
    const mk = (x1, y1, x2, y2, kind, i) => {
      const pair = el('g', { class: 's07f-crease' }, creaseG);
      const len = Math.hypot(x2 - x1, y2 - y1);
      const dx = kind === 'v' ? 1 : 0, dy = kind === 'h' ? 1 : 0;
      const a = el('line', { x1, y1, x2, y2, class: 's07f-crease__dark' }, pair);
      const b = el('line', { x1: x1 + dx, y1: y1 + dy, x2: x2 + dx, y2: y2 + dy, class: 's07f-crease__light' }, pair);
      [a, b].forEach((l) => { l.style.strokeDasharray = `${len} ${len}`; l.style.strokeDashoffset = String(len); });
      creases.push({ pair, a, b, len, kind, i });
    };
    for (let i = 0; i < nv; i++) mk((i + 1) * w, 0, (i + 1) * w, H, 'v', i);
    for (let j = 0; j < nh; j++) mk(0, (j + 1) * hh, W, (j + 1) * hh, 'h', j);
  }

  const R = (e, x, y, w, h) => {
    if (!(w > 0.01 && h > 0.01)) { e.setAttribute('width', 0); e.setAttribute('height', 0); return; }
    e.setAttribute('x', x.toFixed(2)); e.setAttribute('y', y.toFixed(2)); e.setAttribute('width', w.toFixed(2)); e.setAttribute('height', h.toFixed(2));
  };
  const hide = (...els) => els.forEach((e) => { e.setAttribute('width', 0); e.setAttribute('height', 0); });

  /** returns the hole (part of the old sheet still showing), or null when the fold is over */
  function render(p) {
    if (!G) return null;
    const { W, H, X0, Y0, nv, w, nh, hh } = G;
    if (p >= FT.file[1]) { svg.style.visibility = 'hidden'; return null; }
    svg.style.visibility = 'visible';
    // crease lines draw on, one after another
    const cd = span(p, ...FT.crease);
    const N = creases.length, dur = 0.45, step = N > 1 ? (1 - dur) / (N - 1) : 0;
    creases.forEach((c, n) => {
      const k = ease(clamp((cd - n * step) / dur));
      const off = String(c.len * (1 - k));
      c.a.style.strokeDashoffset = off; c.b.style.strokeDashoffset = off;
    });
    let xh = 0, yh = 0;
    hide(rest, flapPaper, flapTone, flapEdge); hinge.setAttribute('x1', -10); hinge.setAttribute('x2', -10);
    const vt = span(p, ...FT.v), ht = span(p, ...FT.h);
    if (p < FT.v[1]) {
      // ---- vertical roll folds: the left panel (and everything already folded onto it) turns over to the right ----
      const f = Math.min(nv - 1, Math.floor(vt * nv)), local = vt * nv - f;
      const th = Math.PI * ease(clamp(local));
      const c = (f + 1) * w, cs = Math.cos(th), sn = Math.sin(th);
      xh = p < FT.v[0] ? 0 : (cs > 0 ? c - w * cs : c);
      if (p >= FT.v[0]) {
        if (cs > 0) {
          if (f > 0) R(flapPaper, c - w * cs, 0, w * cs, H);
          R(flapTone, c - w * cs, 0, w * cs, H); flapTone.style.fillOpacity = (0.13 * sn).toFixed(3);
          R(flapEdge, c - w * cs, 0, w * cs, H);
        } else {
          R(flapPaper, c, 0, -w * cs, H);
          R(flapTone, c, 0, -w * cs, H); flapTone.style.fillOpacity = (0.07 * sn).toFixed(3);
          R(flapEdge, c, 0, -w * cs, H);
        }
        hinge.setAttribute('x1', c); hinge.setAttribute('x2', c); hinge.setAttribute('y1', 0); hinge.setAttribute('y2', H);
      }
      creases.forEach((cr) => cr.pair.style.display = cr.kind === 'v' && cr.i < f ? 'none' : '');
    } else if (p < FT.h[1]) {
      // ---- horizontal roll folds on the remaining column: the top rows turn down onto the corner ----
      const f = Math.min(nh - 1, Math.floor(ht * nh)), local = ht * nh - f;
      const th = Math.PI * ease(clamp(local));
      const r = (f + 1) * hh, cs = Math.cos(th), sn = Math.sin(th);
      xh = X0; yh = cs > 0 ? r - hh * cs : r;
      R(rest, X0, r, Math.min(w, W - X0), H - r);                 // the vertical stack still lying on the rows below
      if (cs > 0) {
        if (f > 0) R(flapPaper, X0, r - hh * cs, W - X0, hh * cs);
        else R(flapPaper, X0, r - hh * cs, Math.min(w, W - X0), hh * cs);
        R(flapTone, X0, r - hh * cs, W - X0, hh * cs); flapTone.style.fillOpacity = (0.13 * sn).toFixed(3);
        R(flapEdge, X0, r - hh * cs, W - X0, hh * cs);
      } else {
        R(flapPaper, X0, r, W - X0, -hh * cs);
        R(flapTone, X0, r, W - X0, -hh * cs); flapTone.style.fillOpacity = (0.07 * sn).toFixed(3);
        R(flapEdge, X0, r, W - X0, -hh * cs);
      }
      hinge.setAttribute('x1', X0); hinge.setAttribute('x2', W); hinge.setAttribute('y1', r); hinge.setAttribute('y2', r);
      creases.forEach((cr) => cr.pair.style.display = cr.kind === 'v' || cr.i < f ? 'none' : '');
    } else {
      // ---- filed: the packet, title-block sized, drops out of view ----
      const d = (G.ph + 24) * easeIn(span(p, ...FT.file));
      xh = X0; yh = Y0 + d;
      R(flapPaper, X0, Y0 + d, W - X0, hh); R(flapEdge, X0, Y0 + d, W - X0, hh);
      creases.forEach((cr) => cr.pair.style.display = 'none');
    }
    R(holeRect, xh, yh, W - xh, H - yh);
    return { xh, yh, W, H };
  }

  return { layout, render, geometry: () => G };
}

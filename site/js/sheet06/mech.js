// Sheet 06: the machine drawing. A closed ring of six involute gears (Diagnose -> Draw -> Build -> Break -> Hand over
// -> Care -> back into Diagnose), drawn as one patent-style plate: hairline tooth outlines, dash-dot pitch circles and
// centre lines, hatched shaft sections, numbered balloons. Built in stage pixels on layout (crisp hairlines, dashes
// in px), driven by set(state): a pure function of the scroll, so any frame can be frozen.
import { STAGES, dims, gearPoints, solveRing, ringAngles } from './gears.js';

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const f2 = (v) => Math.round(v * 100) / 100;
const MM = 4;              // 1 design unit (module 1) = 4 mm on the drawing's labels

export const RING = solveRing();

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const circleD = (cx, cy, r) => `M${f2(cx + r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 1 ${f2(cx - r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 1 ${f2(cx + r)} ${f2(cy)}Z`;

/** a stroke that draws on: returns setter(t). Dashed styles (centre lines) take over once fully drawn. */
function drawer(path, { dashedAfter = false } = {}) {
  const len = path.getTotalLength();
  let last = -1;
  return (t) => {
    t = clamp(t);
    if (t === last) return; last = t;
    path.style.visibility = t <= 0 ? 'hidden' : '';
    if (dashedAfter && t >= 1) { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; return; }
    path.style.strokeDasharray = `${len} ${len}`;
    path.style.strokeDashoffset = String(len * (1 - t));
  };
}

export class Mech {
  constructor(svg) { this.svg = svg; this.built = false; }

  /** area: {x, y, w, h} in stage px where the ring (with its balloons) must fit; small: phone layout */
  build(W, H, area, small) {
    const svg = this.svg;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.textContent = '';
    const C = RING.centres, z = RING.z;
    const D = z.map((n) => dims(n));
    // fit: ring extents plus room for balloons and the overall dimension
    const xs = C.flatMap((c, i) => [c[0] - D[i].ra, c[0] + D[i].ra]);
    const ys = C.flatMap((c, i) => [c[1] - D[i].ra, c[1] + D[i].ra]);
    const ext = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    const mx = small ? 6 : 10, myT = small ? 6 : 8, myB = small ? 9 : 11;
    const bw = ext.x1 - ext.x0 + 2 * mx, bh = ext.y1 - ext.y0 + myT + myB;
    const s = Math.min(area.w / bw, area.h / bh);
    const ox = area.x + (area.w - bw * s) / 2 + (mx - ext.x0) * s;
    const oy = area.y + (area.h - bh * s) / 2 + (myT - ext.y0) * s;
    const X = (u) => ox + u * s, Y = (v) => oy + v * s;
    this.s = s; this.X = X; this.Y = Y; this.small = small;
    const cen = C.reduce((a, c) => [a[0] + c[0] / 6, a[1] + c[1] / 6], [0, 0]);
    this.cen = cen;

    const defs = el('defs', {}, svg);
    const gPlan = el('g', { class: 'm-plan' }, svg);
    const gGears = el('g', { class: 'm-gears' }, svg);
    const gAxes = el('g', { class: 'm-axes' }, svg);
    const gTop = el('g', { class: 'm-top' }, svg);
    const gLabels = el('g', { class: 'm-labels' }, svg);
    this.gPlan = gPlan; this.gGears = gGears; this.gAxes = gAxes; this.gLabels = gLabels; this.gTop = gTop;

    // the plan: construction lines between centres (the ring as a polygon)
    const poly = C.map((c, i) => `${i ? 'L' : 'M'}${f2(X(c[0]))} ${f2(Y(c[1]))}`).join('') + 'Z';
    this.polyDraw = drawer(el('path', { d: poly, class: 'm-cons' }, gPlan));
    // overall width dimension under the ring
    {
      const g = el('g', { class: 'm-dim' }, gPlan);
      const yd = Y(ext.y1 + (small ? 5 : 6)), xa = X(ext.x0), xb = X(ext.x1);
      el('line', { x1: xa, x2: xa, y1: Y(ext.y1 + 1), y2: yd + 5 }, g);
      el('line', { x1: xb, x2: xb, y1: Y(ext.y1 + 1), y2: yd + 5 }, g);
      el('line', { x1: xa, x2: xb, y1: yd, y2: yd }, g);
      el('path', { class: 'm-arrow', d: `M${xa} ${yd}l8 -2.6v5.2Z M${xb} ${yd}l-8 -2.6v5.2Z` }, g);
      const t = el('text', { x: (xa + xb) / 2, y: yd - 6, 'text-anchor': 'middle', class: 'm-txt' }, g);
      t.textContent = `${Math.round((ext.x1 - ext.x0) * MM)} mm · 6 gears · m ${MM}`;
      this.dimG = g; this.dimT = t;
    }

    this.gears = STAGES.map((st, i) => {
      const d = D[i], [cx0, cy0] = C[i];
      const sh = (i === 0 ? 2.1 : 1.5);             // shaft radius
      const rh = sh * 2.15;                         // hub
      const rr = d.rf - (i === 0 ? 2.2 : 1.6);      // rim inner
      // centre lines + pitch circle (plan layer, fixed at the meshed position)
      const cl = el('g', { class: 'm-cl' }, gAxes);
      const L = d.ra + 1.8;
      const clH = el('path', { d: `M${f2(X(cx0 - L))} ${f2(Y(cy0))}H${f2(X(cx0 + L))}`, class: 'm-centre' }, cl);
      const clV = el('path', { d: `M${f2(X(cx0))} ${f2(Y(cy0 - L))}V${f2(Y(cy0 + L))}`, class: 'm-centre' }, cl);
      const pc = el('path', { d: circleD(X(cx0), Y(cy0), d.rp * s), class: 'm-pitch' }, gAxes);

      // the gear itself: a translating group (slides into mesh) holding a rotating group
      const pos = el('g', { class: 'm-gear' }, gGears);
      const rot = el('g', {}, pos);
      const pts = gearPoints(z[i]);
      const outline = el('path', { class: 'm-teeth', d: pts.map((p, k) => `${k ? 'L' : 'M'}${f2(p[0] * s)} ${f2(p[1] * s)}`).join('') + 'Z' }, rot);
      const inner = [];
      inner.push(el('path', { class: 'm-line', d: circleD(0, 0, rr * s) }, rot));
      inner.push(el('path', { class: 'm-line', d: circleD(0, 0, rh * s) }, rot));
      if (st.build === 'spokes') {
        const w = (i === 0 ? 0.9 : 0.75) * s;
        for (let k = 0; k < st.n; k++) {
          const a = (k / st.n) * Math.PI * 2 + Math.PI / st.n;
          const ca = Math.cos(a), sa = Math.sin(a);
          const r0 = Math.sqrt(Math.max(0, (rh * s) ** 2 - w * w)), r1 = Math.sqrt((rr * s) ** 2 - w * w);
          for (const sg of [-1, 1]) {
            const px = -sa * w * sg, py = ca * w * sg;
            inner.push(el('path', { class: 'm-line', d: `M${f2(px + ca * r0)} ${f2(py + sa * r0)}L${f2(px + ca * r1)} ${f2(py + sa * r1)}` }, rot));
          }
        }
      } else if (st.build === 'holes') {
        const rm = (rh + rr) / 2, hr = ((rr - rh) / 2) * 0.62;
        for (let k = 0; k < st.n; k++) {
          const a = (k / st.n) * Math.PI * 2 + Math.PI / st.n;
          inner.push(el('path', { class: 'm-line', d: circleD(Math.cos(a) * rm * s, Math.sin(a) * rm * s, hr * s) }, rot));
        }
      } else {
        inner.push(el('path', { class: 'm-line m-line--thin', d: circleD(0, 0, ((rh + rr) / 2) * s) }, rot));
      }
      // key in the keyway (rotates); the shaft section is hatched (fixed, it is round)
      const kw = 0.38 * sh * s, kh = 0.5 * sh * s;
      const key = el('path', { class: 'm-line', d: `M${f2(-kw)} ${f2(-sh * s + kh * 0.4)}V${f2(-sh * s - kh)}H${f2(kw)}V${f2(-sh * s + kh * 0.4)}` }, rot);
      inner.push(key);
      const clipId = `s6-shaft-${i}`;
      const cp = el('clipPath', { id: clipId }, defs);
      el('circle', { cx: 0, cy: 0, r: sh * s }, cp);
      const shaft = el('g', { class: 'm-shaft' }, pos);
      const hatch = el('g', { 'clip-path': `url(#${clipId})`, class: 'm-hatch' }, shaft);
      const R = sh * s, step = Math.max(3.2, R / 3.2);
      for (let q = -2 * R; q <= 2 * R; q += step) el('line', { x1: q - R, y1: R, x2: q + R, y2: -R }, hatch);
      const shaftRim = el('circle', { cx: 0, cy: 0, r: sh * s, class: 'm-line m-shaft-rim' }, shaft);

      const draws = {
        teeth: drawer(outline),
        inner: inner.map((p) => drawer(p)),
        clH: drawer(clH, { dashedAfter: true }), clV: drawer(clV, { dashedAfter: true }),
        pc: drawer(pc, { dashedAfter: true }),
      };
      // disengaged position: out of mesh, back along the line it slides in on
      let dir;
      if (i === 0) dir = [0, 0];
      else if (i < 5) { const ph = RING.phis[i - 1]; dir = [Math.cos(ph), Math.sin(ph)]; }
      else { const dx = cx0 - cen[0], dy = cy0 - cen[1], n = Math.hypot(dx, dy); dir = [dx / n, dy / n]; }
      return { i, pos, rot, shaft, draws, cx: X(cx0), cy: Y(cy0), dir, off: 3.2 * s, d, sh, cl, pc, outline };
    });

    // gear 1's own furniture for the black moment: the line that becomes its axle, and its pitch diameter
    const g1 = this.gears[0];
    this.axleX = g1.cx; this.axleY = g1.cy;
    this.vline = el('line', { class: 'm-vline', x1: g1.cx, x2: g1.cx, y1: 0, y2: H }, gTop);
    {
      const g = el('g', { class: 'm-dim m-pcd' }, gTop);
      const a = (-145 * Math.PI) / 180, rp = g1.d.rp * s, ca = Math.cos(a), sa = Math.sin(a);
      const p1 = [g1.cx - ca * rp, g1.cy - sa * rp], p2 = [g1.cx + ca * rp, g1.cy + sa * rp];
      const p3 = [g1.cx + ca * (g1.d.ra + 3.2) * s, g1.cy + sa * (g1.d.ra + 3.2) * s];
      const sh = small ? 34 : 64, p4 = [p3[0] - sh, p3[1]];
      const ln = el('path', { d: `M${f2(p1[0])} ${f2(p1[1])}L${f2(p3[0])} ${f2(p3[1])}H${f2(p4[0])}` }, g);
      const ah = (p, dx, dy) => { const n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n; return `M${f2(p[0])} ${f2(p[1])}l${f2(-ux * 8 - uy * 2.6)} ${f2(-uy * 8 + ux * 2.6)}l${f2(uy * 5.2)} ${f2(-ux * 5.2)}Z`; };
      el('path', { class: 'm-arrow', d: ah(p2, ca, sa) + ah(p1, -ca, -sa) }, g);
      const t1 = el('text', { x: p4[0], y: p4[1] - 6, class: 'm-txt' }, g); t1.textContent = `PCD Ø ${Math.round(g1.d.rp * 2 * MM)}`;
      const t2 = el('text', { x: p4[0], y: p4[1] + 13, class: 'm-txt m-txt--g' }, g); t2.textContent = `z ${z[0]} · m ${MM}`;
      this.pcdLine = drawer(ln);
      this.pcd = g;
    }

    // balloons: numbered parts, placed radially outside the ring
    this.labels = this.gears.map((g, i) => {
      const [cx0, cy0] = C[i];
      let dx = cx0 - cen[0], dy = cy0 - cen[1]; const n = Math.hypot(dx, dy); dx /= n; dy /= n;
      const rb = small ? 7 : 9;
      const far = g.d.ra + (small ? 3.4 : 4.6);
      const bx = X(cx0 + dx * far), by = Y(cy0 + dy * far);
      const gl = el('g', { class: 'm-label' }, gLabels);
      const near = g.d.rf - 1.0;
      const lx = X(cx0 + dx * near), ly = Y(cy0 + dy * near);
      const ex = bx - dx * rb, ey = by - dy * rb;
      el('path', { class: 'm-leader', d: `M${f2(lx)} ${f2(ly)}L${f2(ex)} ${f2(ey)}` }, gl);
      el('circle', { class: 'm-dot', cx: lx, cy: ly, r: 1.8 }, gl);
      el('circle', { class: 'm-balloon', cx: bx, cy: by, r: rb }, gl);
      const num = el('text', { class: 'm-num', x: bx, y: by + (small ? 3.4 : 4), 'text-anchor': 'middle' }, gl); num.textContent = String(i + 1);
      if (!small) {
        const right = dx >= -0.2;
        const tx = el('text', { class: 'm-name', x: bx + (right ? rb + 7 : -rb - 7), y: by + 4, 'text-anchor': right ? 'start' : 'end' }, gl);
        tx.textContent = STAGES[i].name.toUpperCase();
      }
      return gl;
    });

    // detail callout on gear 4 (Break): a circle round one tooth, lettered B
    {
      const i = 3, g = this.gears[i];
      let dx = C[i][0] - cen[0], dy = C[i][1] - cen[1]; const n = Math.hypot(dx, dy); dx /= n; dy /= n;
      // turn the callout a little off the balloon's ray so the two never sit on each other
      const a = Math.atan2(dy, dx) - 0.62, ux = Math.cos(a), uy = Math.sin(a);
      const r = g.d.rp, cx = g.cx + ux * r * s, cy = g.cy + uy * r * s, R = 2.9 * s;
      const gc = el('g', { class: 'm-callout' }, gTop);
      const circ = el('path', { class: 'm-callout__c', d: circleD(cx, cy, R) }, gc);
      const lx = cx + ux * (R + (small ? 12 : 18)), ly = cy + uy * (R + (small ? 12 : 18));
      el('path', { class: 'm-leader', d: `M${f2(cx + ux * R)} ${f2(cy + uy * R)}L${f2(lx)} ${f2(ly)}` }, gc);
      const t = el('text', { class: 'm-name m-callout__t', x: lx + ux * 6, y: ly + uy * 6 + 4, 'text-anchor': ux >= 0 ? 'start' : 'end' }, gc); t.textContent = 'B';
      this.callout = { g: gc, draw: drawer(circ), cx, cy, R };
    }
    this.built = true;
    this.last = {};
  }

  /** state: { vline: [visible, collapse 0..1], drawn[i] 0..1, centre[i] 0..1, slide[i] 0..1, theta,
   *           plan 0..1, pcd 0..1, labels[i] bool, active i|-1, dim 0..1, callout 0..1 } */
  set(st) {
    if (!this.built) return;
    // the vertical line: full height, then it collapses into gear 1's axle
    const [vOn, vc] = st.vline;
    this.vline.style.visibility = vOn ? '' : 'hidden';
    if (vOn) {
      const H = +this.svg.viewBox.baseVal.height;
      const k = 1 - vc;
      this.vline.setAttribute('y1', f2(this.axleY - this.axleY * k));
      this.vline.setAttribute('y2', f2(this.axleY + (H - this.axleY) * k));
    }
    const th = ringAngles(st.theta, RING);
    this.gears.forEach((g, i) => {
      const t = st.drawn[i];
      const sl = st.slide[i];
      const vis = t > 0;
      g.pos.style.display = vis ? '' : 'none';
      // centre lines + pitch circle
      g.draws.clH(st.centre[i]); g.draws.clV(st.centre[i]); g.draws.pc(st.pitch[i]);
      if (!vis) return;
      const off = g.off * (1 - sl);
      const x = g.cx + g.dir[0] * off, y = g.cy + g.dir[1] * off;
      g.pos.setAttribute('transform', `translate(${f2(x)} ${f2(y)})`);
      g.rot.setAttribute('transform', `rotate(${f2((th[i] * 180) / Math.PI)})`);
      g.pos.classList.toggle('is-meshed', sl >= 1);
      // the axle (shaft section) first, then the teeth, then the web
      const shaftT = clamp(t / 0.18);
      g.shaft.setAttribute('transform', `scale(${f2(Math.max(0.001, shaftT))})`);
      g.draws.teeth(span(t, 0.12, 0.8));
      g.draws.inner.forEach((d, k) => d(span(t, 0.35 + (k / g.draws.inner.length) * 0.3, 0.6 + (k / g.draws.inner.length) * 0.4)));
    });
    this.polyDraw(st.plan);
    this.dimG.style.visibility = st.plan >= 1 ? '' : 'hidden';
    // the ghosted train keeps its lines, never a half-faded figure: the dimension text goes while it is dimmed
    this.dimT.style.visibility = st.dim > 0.01 ? 'hidden' : '';
    this.pcdLine(st.pcd);
    this.pcd.classList.toggle('is-txt', st.pcd >= 1 && st.pcdText);
    this.pcd.style.visibility = st.pcd > 0 ? '' : 'hidden';
    this.labels.forEach((l, i) => {
      l.style.visibility = st.labels[i] ? '' : 'hidden';
      l.classList.toggle('is-active', st.active === i);
    });
    this.gGears.style.opacity = this.gPlan.style.opacity = this.gAxes.style.opacity = String(1 - 0.86 * st.dim);
    this.callout.g.style.visibility = st.callout > 0 ? '' : 'hidden';
    this.callout.draw(st.callout);
    this.callout.g.classList.toggle('is-txt', st.callout >= 1);
  }
}

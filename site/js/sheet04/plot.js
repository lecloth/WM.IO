// A tiny hairline plotter shared by sheets 02 and 04: drawings are written in a fixed design space (default 800 x 560
// units), placed into a box on the stage with one uniform scale, and drawn on by an order value per element.
// Strokes stay 1 px at any scale (stroke-width = 1/scale, like sheet 01's redraw), labels keep a fixed px size.
// set(t) is a pure function of t (0..1): strokes draw in order, labels / arrowheads / hidden lines switch on once the
// stroke before them is down (never half-faded), so any frame can be frozen.
const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export class Plot {
  /** parent: <svg> or <g>; opts.w/h: design space; opts.cls: class on the group */
  constructor(parent, { w = 800, h = 560, cls = '' } = {}) {
    this.W = w; this.H = h;
    this.g = document.createElementNS(NS, 'g');
    this.g.setAttribute('class', `plot ${cls}`.trim());
    parent.appendChild(this.g);
    this.items = [];
    this.u = 1; this.t = -1;
    this.font = 11;
  }

  /** fit the design space into box {x, y, w, h} (stage px); font: label size in px; align: 'center' | 'left' | 'top' */
  place(box, { font = 11, align = 'center' } = {}) {
    const u = Math.min(box.w / this.W, box.h / this.H);
    const ox = box.x + (align === 'left' ? 0 : (box.w - this.W * u) / 2);
    const oy = box.y + (align === 'top' ? 0 : (box.h - this.H * u) / 2);
    this.u = u; this.font = font;
    this.g.setAttribute('transform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${u.toFixed(5)})`);
    this.g.style.setProperty('--sw', `${1 / u}px`);
    this.g.style.setProperty('--sw-heavy', `${1.75 / u}px`);
    this.g.style.setProperty('--fs', `${font / u}px`);
    this.g.style.setProperty('--halo', `${4 / u}px`);
    this.g.style.setProperty('--dash', `${5 / u} ${3.5 / u}`);
    this.g.style.setProperty('--centre', `${14 / u} ${3 / u} ${2.5 / u} ${3 / u}`);
    return this;
  }

  /** one label line height in design units (labels keep their px size, so this grows as the drawing shrinks) */
  lh() { return (this.font * 1.5) / this.u; }

  clear() { this.g.textContent = ''; this.items = []; this.t = -1; }

  _add(el, kind, at, cls) {
    if (cls) el.setAttribute('class', cls);
    this.g.appendChild(el);
    const it = { el, kind, at: clamp(at), len: 0, last: null };
    this.items.push(it);
    return it;
  }

  /** stroke path (draws on). o.cls: '' | 'heavy' | 'thin' ; o.at: order 0..1 */
  path(d, o = {}) {
    const el = document.createElementNS(NS, 'path'); el.setAttribute('d', d);
    const kind = o.cls && /hidden|centre/.test(o.cls) ? 'pop' : 'stroke';
    return this._add(el, kind, o.at ?? 0, `pl ${o.cls || ''}`.trim()).el;
  }
  line(x1, y1, x2, y2, o) { return this.path(`M${x1} ${y1}L${x2} ${y2}`, o); }
  poly(pts, o) { return this.path('M' + pts.map((p) => `${p[0]} ${p[1]}`).join('L'), o); }
  rect(x, y, w, h, r = 0, o) {
    if (!r) return this.path(`M${x} ${y}H${x + w}V${y + h}H${x}Z`, o);
    return this.path(`M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`, o);
  }
  circle(cx, cy, r, o) { return this.path(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`, o); }
  /** arc from angle a0 to a1 (degrees, 0 = +x, clockwise on screen) */
  arc(cx, cy, r, a0, a1, o) {
    const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
    return this.path(`M${x0} ${y0}A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`, o);
  }
  /** filled shape that pops on (arrowheads, dots) */
  fill(d, o = {}) {
    const el = document.createElementNS(NS, 'path'); el.setAttribute('d', d);
    return this._add(el, 'pop', o.at ?? 0, `pf ${o.cls || ''}`.trim()).el;
  }
  /** mono label; o.anchor: start | middle | end; o.cls: '' | 'graphite' | 'big' ; o.size: px override */
  text(x, y, str, o = {}) {
    const el = document.createElementNS(NS, 'text');
    el.setAttribute('x', x); el.setAttribute('y', y);
    if (o.anchor) el.setAttribute('text-anchor', o.anchor);
    if (o.size) el.style.fontSize = `${o.size / this.u}px`;
    el.textContent = str;
    return this._add(el, 'pop', o.at ?? 0, `pt ${o.cls || ''}`.trim()).el;
  }
  /** arrowhead at (x, y) pointing along angle (degrees) */
  head(x, y, ang, o = {}) {
    const L = 9 / this.u, Wd = 3.2 / this.u, a = ang * Math.PI / 180;
    const bx = x - L * Math.cos(a), by = y - L * Math.sin(a);
    const nx = -Math.sin(a) * Wd, ny = Math.cos(a) * Wd;
    return this.fill(`M${x} ${y}L${bx + nx} ${by + ny}L${bx - nx} ${by - ny}Z`, o);
  }
  /** polyline with an arrowhead at the end */
  arrow(pts, o = {}) {
    this.poly(pts, o);
    const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
    this.head(b[0], b[1], Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, { at: Math.min(1, (o.at ?? 0) + 0.06) });
  }
  /** dimension between (x1,y1) and (x2,y2), offset by `off` units to the left of the direction; label centred */
  dim(x1, y1, x2, y2, label, o = {}) {
    const off = o.off ?? -24, at = o.at ?? 0;
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const ax = x1 + nx * off, ay = y1 + ny * off, bx = x2 + nx * off, by = y2 + ny * off;
    const ext = Math.sign(off) * 6;
    this.line(x1 + nx * Math.sign(off) * 4, y1 + ny * Math.sign(off) * 4, ax + nx * ext, ay + ny * ext, { at, cls: 'thin' });
    this.line(x2 + nx * Math.sign(off) * 4, y2 + ny * Math.sign(off) * 4, bx + nx * ext, by + ny * ext, { at, cls: 'thin' });
    this.line(ax, ay, bx, by, { at: at + 0.02 });
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    this.head(bx, by, ang, { at: at + 0.05 }); this.head(ax, ay, ang + 180, { at: at + 0.05 });
    if (label) {
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const vertical = Math.abs(dx) < Math.abs(dy);
      if (vertical) this.text(mx + (o.labelSide ?? 1) * 10 / this.u * 0.9, my + 4 / this.u, label, { at: at + 0.08, anchor: (o.labelSide ?? 1) > 0 ? 'start' : 'end' });
      else this.text(mx, my - 7 / this.u, label, { at: at + 0.08, anchor: 'middle' });
    }
  }

  /** measure stroke lengths (call once the group is in the document) */
  measure() {
    this.items.forEach((it) => {
      if (it.kind !== 'stroke') return;
      it.len = it.el.getTotalLength() || 1;
      it.el.style.strokeDasharray = `${it.len} ${it.len}`;
    });
    this.t = -1;
    return this;
  }

  /** t 0..1: draw on (strokes in order, pops after their stroke). Pure in t. */
  set(t) {
    t = clamp(t);
    if (t === this.t) return;
    this.t = t;
    for (const it of this.items) {
      const a = it.at * 0.75;
      if (it.kind === 'stroke') {
        const k = clamp((t - a) / 0.25);
        const v = k <= 0 ? 'hidden' : 'visible';
        const off = (it.len * (1 - k)).toFixed(2);
        if (it.last !== off) { it.el.style.strokeDashoffset = off; it.el.style.visibility = v; it.last = off; }
      } else {
        const on = t >= Math.min(1, a + 0.2);
        if (it.last !== on) { it.el.style.visibility = on ? 'visible' : 'hidden'; it.last = on; }
      }
    }
  }
}

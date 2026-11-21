// Sheet 03 chapter changes.
// 1) Into sheet 03 (from 02 Principles, pinned underneath): DIMENSION LINES MEASURE THE NEXT SHEET BEFORE IT APPEARS.
//    Two hairline dimension lines run out from the centre with arrowheads and live mono values, measuring the coming
//    sheet's frame at 1:1 (width x height in mm); extension lines drop at the ends, the frame is traced corner to corner,
//    and the sheet appears inside the measured frame. Values sit still (only their digits change) on clean paper tabs.
// 2) Between discipline scenes: THE PLAN CHEST. The next sheet is drawn up out of the plan chest from below, an opaque
//    sheet with a drawer tab on its leading edge; it covers the previous scene, whose text is already off.
import { clamp, span, ease, easeOut } from '../engine/kit.js';

const NS = 'http://www.w3.org/2000/svg';
const MM = 25.4 / 96;   // mm per CSS px at 1:1
const el = (name, attrs, parent) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; };

export class MeasureEntry {
  constructor(section) {
    this.stage = section.querySelector('.d3__stage');
    this.sheet = section.querySelector('.d3__sheet');
    this.box = section.querySelector('.d3__measure');
    this.svg = this.box.querySelector('svg');
    this.vw = this.box.querySelector('.d3__mv--w');
    this.vh = this.box.querySelector('.d3__mv--h');
    this.name = this.box.querySelector('.d3__mv--name');
    this.P = -1;
  }

  layout() {
    const fr = this.sheet.querySelector('.frame');
    const W = this.stage.clientWidth, H = this.stage.clientHeight;
    if (!fr || !W) return;
    const f = { x: fr.offsetLeft, y: fr.offsetTop, w: fr.offsetWidth, h: fr.offsetHeight };
    this.f = f;
    const small = innerWidth < 1024;
    const inset = small ? 26 : 44;
    this.yd = f.y + inset; this.xd = f.x + inset;            // where the two dimension lines run
    this.cx = f.x + f.w / 2; this.cy = f.y + f.h / 2;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.textContent = '';
    const g = el('g', {}, this.svg);
    this.hLine = el('line', { y1: this.yd, y2: this.yd }, g);
    this.vLine = el('line', { x1: this.xd, x2: this.xd }, g);
    this.hA = el('path', {}, g); this.hB = el('path', {}, g); this.vA = el('path', {}, g); this.vB = el('path', {}, g);
    // extension lines: from the frame's edges to just past each dimension line
    this.ext = [
      el('line', { x1: f.x, x2: f.x, y1: f.y, y2: this.yd + 8 }, g), el('line', { x1: f.x + f.w, x2: f.x + f.w, y1: f.y, y2: this.yd + 8 }, g),
      el('line', { y1: f.y, y2: f.y, x1: f.x, x2: this.xd + 8 }, g), el('line', { y1: f.y + f.h, y2: f.y + f.h, x1: f.x, x2: this.xd + 8 }, g),
    ];
    this.ext.forEach((e) => { const l = Math.hypot(e.x2.baseVal.value - e.x1.baseVal.value, e.y2.baseVal.value - e.y1.baseVal.value); e.style.strokeDasharray = `${l} ${l}`; e._l = l; });
    // the frame, traced from two opposite corners
    const r = el('path', { class: 'd3__mframe', d: `M${f.x} ${f.y}H${f.x + f.w}V${f.y + f.h}M${f.x + f.w} ${f.y + f.h}H${f.x}V${f.y}` }, g);
    this.frameLen = (f.w + f.h); this.frame = r;
    r.style.strokeDasharray = `${this.frameLen} ${this.frameLen * 2}`;
    // centre mark where both lines start
    this.mark = el('path', { class: 'd3__mmark', d: `M${this.cx - 7} ${this.yd}H${this.cx + 7}M${this.cx} ${this.yd - 7}V${this.yd + 7}M${this.xd - 7} ${this.cy}H${this.xd + 7}M${this.xd} ${this.cy - 7}V${this.cy + 7}` }, g);
    Object.assign(this.vw.style, { left: `${this.cx}px`, top: `${this.yd}px` });
    Object.assign(this.vh.style, { left: `${this.xd}px`, top: `${this.cy}px` });
    Object.assign(this.name.style, { left: `${this.cx}px`, top: `${this.yd + 22}px` });
    this.P = -1;
  }

  /** p: 0 -> 1 (the entry). Returns nothing; toggles the sheet when it has been measured. */
  render(p) {
    if (!this.f || Math.abs(p - this.P) < 1e-4) return;
    this.P = p;
    const f = this.f;
    const active = p < 0.9;
    this.box.style.display = active ? 'block' : 'none';
    this.sheet.classList.toggle('is-unmeasured', p < 0.62);
    this.sheet.classList.toggle('is-measuring', active);      // the plate waits until the dimensions are cleared
    if (!active) return;
    // the two dimension lines run out from the centre (live values in mm at 1:1)
    const a = ease(span(p, 0.04, 0.42)), b = ease(span(p, 0.12, 0.5));
    const hw = (f.w / 2) * a, hh = (f.h / 2) * b;
    this.hLine.setAttribute('x1', this.cx - hw); this.hLine.setAttribute('x2', this.cx + hw);
    this.vLine.setAttribute('y1', this.cy - hh); this.vLine.setAttribute('y2', this.cy + hh);
    const ah = (x, y, dx, dy) => `M${x} ${y}L${x + dx * 9 - dy * 3} ${y + dy * 9 + dx * 3}L${x + dx * 9 + dy * 3} ${y + dy * 9 - dx * 3}Z`;
    this.hA.setAttribute('d', ah(this.cx - hw, this.yd, 1, 0)); this.hB.setAttribute('d', ah(this.cx + hw, this.yd, -1, 0));
    this.vA.setAttribute('d', ah(this.xd, this.cy - hh, 0, 1)); this.vB.setAttribute('d', ah(this.xd, this.cy + hh, 0, -1));
    const showH = a > 0.02, showV = b > 0.02;
    [this.hLine, this.hA, this.hB].forEach((e) => { e.style.opacity = showH ? '1' : '0'; });
    [this.vLine, this.vA, this.vB].forEach((e) => { e.style.opacity = showV ? '1' : '0'; });
    this.mark.style.opacity = p > 0.01 && p < 0.5 ? '1' : '0';
    this.vw.classList.toggle('is-on', showH); this.vh.classList.toggle('is-on', showV);
    this.vw.textContent = `${(2 * hw * MM).toFixed(1)} mm`;
    this.vh.textContent = `${(2 * hh * MM).toFixed(1)} mm`;
    // extension lines drop where the lines arrive, then the frame is traced
    const e = easeOut(span(p, 0.4, 0.5));
    this.ext.forEach((x) => { x.style.strokeDashoffset = String(x._l * (1 - e)); });
    const t = ease(span(p, 0.46, 0.62));
    this.frame.style.strokeDashoffset = String(this.frameLen * (1 - t));
    this.frame.style.opacity = p < 0.62 ? '1' : '0';
    this.name.classList.toggle('is-on', p >= 0.5);
  }
}

export class ChestEntry {
  constructor(section) {
    this.sheet = section.querySelector('.d3__sheet');
    this.tab = section.querySelector('.d3__tab');
    this.P = -1;
  }
  layout() { this.P = -1; }
  render(p) {
    if (Math.abs(p - this.P) < 1e-4) return;
    this.P = p;
    const t = ease(span(p, 0.04, 0.92));
    const moving = p < 0.92;
    this.sheet.style.transform = t >= 1 ? '' : `translate3d(0, ${((1 - t) * 100).toFixed(3)}%, 0)`;
    this.sheet.classList.toggle('is-drawn', moving);
    this.tab.classList.toggle('is-on', moving && p > 0.0);
  }
}

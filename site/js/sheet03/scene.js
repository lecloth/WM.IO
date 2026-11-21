// Sheet 03 Disciplines: one sticky scene per discipline, the same language as sheet 01.
//   reading moment 1: the ancestor plate + its caption (text on clean paper, nothing moves)
//   spectacle:        the figure lifts off the plate, moves to the board, and redraws itself line by line into what the
//                     studio builds today, while a dimension line measures the years between them
//   reading moment 2: the discipline's line + what we offer, beside the finished drawing (nothing moves)
// render(p) is a pure function of p (viewport heights, kit.js chapter contract), so any frame can be frozen.
// Text is either shown or not (class toggles, CSS fades <= .25 s). All text is off before the next scene's entry.
import { clamp, span, ease, rem } from '../engine/kit.js';
import { build } from './drawings.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, parent) => {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const NOW = 2026;
let uid = 0;

/** the timeline of a scene (p in viewport heights; entry 0 -> 1, scene 1 -> units, the next entry units -> units + 1) */
export function timeline(kind, units) {
  const off = units - 0.06;                                      // every piece of text is off before the next entry
  if (kind === 'bell') return { read1: [0.97, 2.1], move: [2.05, 2.1], sweep: [2.15, 3.1], read2: [3.2, off], off };
  if (kind === 'care') return { rows: [1.05, 2.45], read2: [2.6, off], off };
  return { read1: [0.97, 2.3], move: [2.3, 2.8], sweep: [2.8, 3.85], read2: [3.95, off], off };
}

export class Scene {
  /**
   * cfg: { key, kind: 'plate' | 'bell' | 'care', units, from (year), load: () => Promise<{crop, paths}>, fig: url }
   */
  constructor(section, cfg) {
    this.section = section; this.cfg = cfg;
    this.sheet = section.querySelector('.d3__sheet');
    this.plate = section.querySelector('.d3__plate');
    this.read1 = section.querySelector('.d3__read--plate');
    this.read2 = section.querySelector('.d3__read--line');
    this.svg = section.querySelector('.d3__draw');
    this.spanEl = section.querySelector('.d3__span');
    this.rows = [...section.querySelectorAll('.d3__table tbody tr')];
    this.revs = section.querySelector('.d3__revs');
    this.T = timeline(cfg.kind, cfg.units);
    this.data = null; this.today = null; this.P = -1;
    if (this.svg) this.initSvg();
  }

  initSvg() {
    const id = `d3wipe${uid++}`;
    const defs = el('defs', {}, this.svg);
    const cp = el('clipPath', { id }, defs);
    this.wipe = el('rect', { x: 0, y: -10, width: 10, height: 10 }, cp);
    this.figG = el('g', { class: 'd3__fig' }, this.svg);
    this.img = el('image', { 'clip-path': `url(#${id})`, preserveAspectRatio: 'none' }, this.figG);
    this.outG = el('g', { class: 'd3__out' }, this.svg);
    this.labG = el('g', { class: 'd3__labels' }, this.svg);
  }

  /** the traced figure arrives (lazy import); build its paths once */
  setData(data, figUrl) {
    this.data = data;
    const { crop } = data;
    this.img.setAttribute('href', figUrl);
    this.img.setAttribute('width', crop.w); this.img.setAttribute('height', crop.h);
    this.wipe.setAttribute('height', crop.h + 20);
    this.figPaths = data.paths.map((p) => {
      const e = el('path', { d: p.d }, this.figG);
      const len = e.getTotalLength();
      e.style.strokeDasharray = `${len} ${len}`;
      return { el: e, x: p.x / crop.w, len };
    });
    this.layout();
  }

  /** where things go, in sheet px (the sheet may be mid-slide: use offsets, not client rects) */
  areas() {
    const W = this.sheet.clientWidth, H = this.sheet.clientHeight, r = rem();
    const small = innerWidth < 1024;
    const strip = small ? 2.5 * r : 2.25 * r;
    if (this.static) {
      // reduced motion: the drawing gets the second panel of the static sheet
      const top = this.cfg.kind === 'care' ? 0 : H / 2;
      const h = this.cfg.kind === 'care' ? H : H / 2;
      return small
        ? { draw: { x: 1.25 * r, y: top + strip + 1.5 * r, w: W - 2.5 * r, h: h * 0.42 }, span: { x: 1.25 * r, y: top + strip + 1.5 * r + h * 0.45, w: W - 2.5 * r } }
        : { draw: { x: W * 0.125, y: top + strip + 3 * r, w: W * 0.45, h: h - strip - 10 * r }, span: { x: W * 0.125, y: top + h - 5.6 * r, w: W * 0.45 } };
    }
    if (small) return { draw: { x: 1.25 * r, y: strip + 1.5 * r, w: W - 2.5 * r, h: H * 0.4 }, span: { x: 1.5 * r, y: strip + 1.5 * r + H * 0.43, w: W - 3 * r } };
    return { draw: { x: W * 0.125, y: strip + 3 * r, w: W * 0.45, h: H - strip - 10.5 * r }, span: { x: W * 0.125, y: H - 5.6 * r, w: W * 0.42 } };
  }

  layout() {
    if (!this.svg) { this.P = -1; return; }
    const W = this.sheet.clientWidth, H = this.sheet.clientHeight;
    if (!W) return;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const A = this.areas();
    // today's drawing
    this.today = build(this.cfg.key, A.draw, innerWidth < 1024 ? 0.98 : 0.94);
    this.outG.textContent = ''; this.labG.textContent = '';
    const x0 = this.today.rect.x, wR = Math.max(1, this.today.rect.w);
    this.outPaths = this.today.paths.map((p) => {
      const e = el('path', { d: p.d }, this.outG);
      if (p.cls) e.setAttribute('class', p.cls);
      const len = e.getTotalLength();
      const plain = p.cls === 'centre' || p.cls === 'arrow' || p.cls === 'dash';
      if (!plain) e.style.strokeDasharray = `${len} ${len}`;
      const x = Number.isFinite(p.x) ? p.x : e.getBBox().x;
      return { el: e, len, plain, u: clamp((x - x0) / wR) };
    });
    const small = innerWidth < 1024;
    for (const l of this.today.labels) {
      const g = el('g', {}, this.labG);
      if (l.leader) {
        const ex = l.align === 'end' ? l.tx + 4 : l.tx - 4;
        el('path', { class: 'lead', d: `M${l.ax} ${l.ay}L${ex} ${l.ty - 4}` }, g);
        el('circle', { class: 'dot', cx: l.ax, cy: l.ay, r: 1.6 }, g);
      }
      const t = el('text', { x: l.tx, y: l.ty, 'text-anchor': l.align }, g);
      if (l.rot) t.setAttribute('transform', `rotate(${l.rot} ${l.tx} ${l.ty})`);
      t.textContent = l.name;
      if (l.sub && !small) { const s = el('text', { x: l.tx, y: l.ty + 13, 'text-anchor': l.align, class: 'sub' }, g); s.textContent = l.sub; }
    }
    // the years between the plate and today, as a dimension line under the drawing
    if (this.spanEl && this.cfg.from) {
      const s = A.span, svg = this.spanEl.querySelector('svg');
      Object.assign(this.spanEl.style, { left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px` });
      svg.setAttribute('viewBox', `0 0 ${s.w} 20`); svg.textContent = '';
      el('line', { x1: 0.5, x2: 0.5, y1: 0, y2: 20 }, svg); el('line', { x1: s.w - 0.5, x2: s.w - 0.5, y1: 0, y2: 20 }, svg);
      this.spanLine = el('line', { x1: 0, x2: s.w, y1: 10, y2: 10 }, svg);
      this.spanArrowA = el('path', { d: 'M0.5 10L9 7L9 13Z' }, svg);
      this.spanArrowB = el('path', { d: `M${s.w - 0.5} 10L${s.w - 9} 7L${s.w - 9} 13Z` }, svg);
      this.spanW = s.w;
      this.spanEl.querySelector('.d3__span-v').textContent = `${NOW - this.cfg.from} years`;
    }
    // the figure: from where it sits on the plate to the middle of the drawing area
    if (this.data) {
      const c = this.data.crop;
      if (this.plate && !this.static) {
        const pw = this.plate.offsetWidth, s0 = pw / c.plateW;
        this.from = { x: this.plate.offsetLeft + c.cx * s0, y: this.plate.offsetTop + c.cy * s0, s: s0 * c.k, r: c.rot || 0 };
      }
      const d = A.draw, s1 = Math.min(d.w * 0.92 / c.w, d.h * 0.9 / c.h);
      this.to = { x: d.x + d.w / 2, y: d.y + d.h / 2, s: s1, r: 0 };
      if (!this.from) this.from = this.to;
    }
    this.P = -1;
    if (this.static) this.renderFinal();
  }

  setStatic() {
    this.static = true; this.section.classList.add('is-final');
    if (this.cfg.kind === 'bell') {   // the recap's Fig. 1, as a still in the first panel
      const img = document.createElement('img');
      img.className = 'd3__still'; img.src = this.cfg.fig; img.alt = "Fig. 1 of US Patent 186,787: Bell's box telephone with its speaking tube.";
      this.sheet.appendChild(img);
    }
  }

  /** reduced motion: the finished state, nothing scrubs */
  renderFinal() {
    if (this.svg) {
      this.figG.style.display = 'none';
      this.outPaths?.forEach((p) => { p.el.style.strokeDashoffset = '0'; p.el.style.opacity = '1'; });
      this.labG.classList.add('is-on');
      this.spanEl?.classList.add('is-on', 'is-full');
      if (this.spanLine) this.spanLine.setAttribute('x2', this.spanW);
    }
    this.read1?.classList.add('is-on'); this.read2?.classList.add('is-on');
    this.rows.forEach((r) => r.classList.add('is-on'));
  }

  render(p) {
    if (Math.abs(p - this.P) < 1e-4) return;
    this.P = p;
    const T = this.T, on = (a, b) => p >= a && p < b;
    if (this.read1) this.read1.classList.toggle('is-on', on(T.read1[0], T.read1[1]));
    this.read2.classList.toggle('is-on', on(T.read2[0], T.read2[1]));
    if (this.cfg.kind === 'care') {
      const n = Math.floor(span(p, T.rows[0], T.rows[1]) * this.rows.length + 1e-6);
      this.rows.forEach((r, i) => r.classList.toggle('is-on', i < n || p >= T.rows[1]));
      this.revs.classList.toggle('is-off', p >= T.off);   // the log is text too: off before the next sheet passes over
      return;
    }
    if (this.plate) this.plate.classList.toggle('is-gone', p >= T.move[0]);
    const sw = span(p, ...T.sweep);
    const lifted = this.cfg.kind === 'bell' ? p >= 0.0 : p >= T.move[0];
    // the figure: travel, then the sweep turns its ink into hairlines, which un-draw
    if (this.data && this.from && this.to) {
      const showFig = lifted && sw < 1;
      this.figG.style.display = showFig ? '' : 'none';
      if (showFig) {
        const m = ease(span(p, ...T.move)), f = this.from, t = this.to;
        const x = f.x + (t.x - f.x) * m, y = f.y + (t.y - f.y) * m, s = f.s + (t.s - f.s) * m, r = f.r + (t.r - f.r) * m;
        const c = this.data.crop;
        this.figG.setAttribute('transform', `translate(${x} ${y}) rotate(${r}) scale(${s}) translate(${-c.w / 2} ${-c.h / 2})`);
        this.figG.style.setProperty('--sw', `${1 / s}px`);
        const wipe = clamp(sw / 0.55);
        this.wipe.setAttribute('x', String(wipe * c.w));
        this.wipe.setAttribute('width', String(c.w * (1 - wipe) + 1));
        for (const q of this.figPaths) {
          const local = span(sw, q.x * 0.55, q.x * 0.55 + 0.4);
          q.el.style.strokeDashoffset = String(-q.len * clamp((local - 0.15) / 0.85));
          q.el.style.strokeOpacity = local > 0 && local < 1 ? '1' : '0';
        }
      }
    } else if (this.figG) this.figG.style.display = 'none';
    // today's drawing draws on behind the sweep
    if (this.outPaths) {
      for (const q of this.outPaths) {
        const a = span(sw, 0.3 + q.u * 0.35, 0.3 + q.u * 0.35 + 0.35);
        if (q.plain) { q.el.style.opacity = a >= 0.5 ? '1' : '0'; continue; }
        q.el.style.strokeDashoffset = String(q.len * (1 - a));
      }
    }
    const done = p >= T.sweep[1];
    this.labG?.classList.toggle('is-on', done && p < T.off);
    // the years dimension: the line runs out with the sweep; its value shows only once it is fully measured
    if (this.spanEl && this.spanLine) {
      const vis = p >= (this.cfg.kind === 'bell' ? T.read1[0] : T.move[0]) && p < T.off;
      this.spanEl.classList.toggle('is-on', vis);
      const e = ease(sw);
      this.spanLine.setAttribute('x2', String(Math.max(0.5, this.spanW * e)));
      this.spanArrowB.style.opacity = e >= 1 ? '1' : '0';
      this.spanEl.classList.toggle('is-full', e >= 1);
    }
  }
}

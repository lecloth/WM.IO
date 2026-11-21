// Bell's Fig. 1 (traced vectors) redraws itself, line by line, into the modern phone's outline.
// Everything here is a pure function of one progress value, so it can be scrubbed and frozen on any frame.
import { FIG1 } from './bell-fig1.js';

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (p, a, b) => clamp((p - a) / (b - a));

function rr(x, y, w, h, r) {
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}

export class Redraw {
  constructor(svg) {
    this.svg = svg;
    this.fig = document.createElementNS(NS, 'g'); this.fig.setAttribute('class', 'redraw__fig');
    this.out = document.createElementNS(NS, 'g'); this.out.setAttribute('class', 'redraw__out');
    svg.append(this.fig, this.out);
    // the real plate pixels travel with the vectors, and are wiped away as the lines are redrawn
    const defs = document.createElementNS(NS, 'defs');
    const cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', 'fig-wipe');
    this.wipe = document.createElementNS(NS, 'rect');
    this.wipe.setAttribute('x', 0); this.wipe.setAttribute('y', -10); this.wipe.setAttribute('width', FIG1.crop.w); this.wipe.setAttribute('height', FIG1.crop.h + 20);
    cp.appendChild(this.wipe); defs.appendChild(cp); svg.prepend(defs);
    this.img = document.createElementNS(NS, 'image');
    this.img.setAttribute('href', 'media/plates/bell-us186787-fig1.webp');
    this.img.setAttribute('width', FIG1.crop.w); this.img.setAttribute('height', FIG1.crop.h);
    this.img.setAttribute('clip-path', 'url(#fig-wipe)');
    this.img.style.mixBlendMode = 'multiply';
    this.fig.appendChild(this.img);
    this.figPaths = FIG1.paths.map((p) => {
      const el = document.createElementNS(NS, 'path'); el.setAttribute('d', p.d); this.fig.appendChild(el);
      return { el, x: p.x / FIG1.crop.w, len: 0 };
    });
    this.figPaths.forEach((p) => { p.len = p.el.getTotalLength(); p.el.style.strokeDasharray = `${p.len} ${p.len}`; });
    this.outPaths = [];
  }

  /** plateRect: on-screen rect of the plate image; phone: {cx, cy, k (px/mm)} in stage CSS px */
  layout(stageRect, plateRect, phone) {
    this.stage = stageRect; this.plate = plateRect; this.phone = phone;
    this.svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
    // the outline drawing of the modern phone, in screen px (y down), from mm
    const { cx, cy, k } = phone;
    const X = (mm) => cx + mm * k, Y = (mm) => cy - mm * k;
    const shapes = [
      rr(X(-37), Y(77), 74 * k, 154 * k, 11 * k),                    // body
      rr(X(-34), Y(73.6), 68 * k, 147.2 * k, 8.6 * k),               // screen
      rr(X(-13), Y(69.75), 26 * k, 7.5 * k, 3.75 * k),               // sensor pill
      `M${X(-37.9)} ${Y(60)}V${Y(52)}`, `M${X(-37.9)} ${Y(48)}V${Y(36)}`, `M${X(-37.9)} ${Y(32)}V${Y(20)}`,  // left keys
      `M${X(37.9)} ${Y(50)}V${Y(28)}`,                                // power
      `M${X(0)} ${Y(86)}V${Y(-86)}`,                                  // centre lines (dash-dot via CSS)
      `M${X(-46)} ${Y(0)}H${X(46)}`,
    ];
    this.out.textContent = '';
    this.outPaths = shapes.map((d, i) => {
      const el = document.createElementNS(NS, 'path'); el.setAttribute('d', d);
      if (i >= 7) el.setAttribute('class', 'is-centre');
      this.out.appendChild(el);
      const len = el.getTotalLength();
      if (i < 7) el.style.strokeDasharray = `${len} ${len}`;
      return { el, len, centre: i >= 7 };
    });
    // where Fig. 1 sits on the plate, and where it travels to (centred on the phone, a little wider than it)
    const s0 = plateRect.width / FIG1.crop.plateW;
    this.from = { x: plateRect.left - stageRect.left + FIG1.crop.x * s0, y: plateRect.top - stageRect.top + FIG1.crop.y * s0, s: s0 };
    const tw = Math.min(74 * k * 2.3, stageRect.width * 0.84), s1 = tw / FIG1.crop.w;
    this.to = { x: cx - tw / 2, y: cy - (FIG1.crop.h * s1) / 2, s: s1 };
  }

  /** p: 0..1 move, q: 0..1 redraw */
  render(move, draw, visible) {
    this.svg.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible || !this.from) return;
    const m = ease(move), f = this.from, t = this.to;
    const x = f.x + (t.x - f.x) * m, y = f.y + (t.y - f.y) * m, s = f.s + (t.s - f.s) * m;
    this.fig.setAttribute('transform', `translate(${x} ${y}) scale(${s})`);
    this.fig.style.setProperty('--sw', `${1 / s}px`);
    // a sweep runs left to right: behind it Bell's ink becomes hairlines, which then un-draw
    const sweep = clamp(draw / 0.55);
    this.wipe.setAttribute('x', String(sweep * FIG1.crop.w));
    this.wipe.setAttribute('width', String(FIG1.crop.w * (1 - sweep) + 1));
    this.figPaths.forEach((p) => {
      const local = span(draw, p.x * 0.55, p.x * 0.55 + 0.4);
      p.el.style.strokeDashoffset = String(-p.len * clamp((local - 0.15) / 0.85));
      p.el.style.strokeOpacity = local > 0 && local < 1 ? '1' : '0';
    });
    // the phone outline draws on, piece by piece
    this.outPaths.forEach((p, i) => {
      const local = span(draw, 0.22 + i * 0.055, 0.22 + i * 0.055 + 0.42);
      if (p.centre) p.el.style.opacity = local >= 0.5 ? '1' : '0';
      else p.el.style.strokeDashoffset = String(p.len * (1 - local));
    });
  }

  fade(o) { this.out.style.opacity = String(o); }
}

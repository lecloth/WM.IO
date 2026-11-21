// The phone history as one continuous drawing: Bell's Fig. 1 (real plate pixels + traced hairlines) redraws itself,
// line by line, into each era of the phone and finally into today's outline. Pure function of progress values,
// so any frame can be frozen.
import { FIG1 } from './bell-fig1.js';
import { ERAS, toPaths } from './eras.js';

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (p, a, b) => clamp((p - a) / (b - a));

function rr(x, y, w, h, r) {
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}
function modernPaths(cx, cy, k) {        // today's phone: body, screen, punch-hole camera, keys, centre lines
  const X = (mm) => cx + mm * k, Y = (mm) => cy - mm * k;
  const cam = 1.9 * k;
  return {
    lines: [
      rr(X(-37), Y(77), 74 * k, 154 * k, 11 * k),
      rr(X(-34), Y(73.6), 68 * k, 147.2 * k, 8.6 * k),
      `M${X(0) - cam} ${Y(69)}a${cam} ${cam} 0 1 0 ${2 * cam} 0a${cam} ${cam} 0 1 0 ${-2 * cam} 0Z`,
      `M${X(-37.9)} ${Y(48)}V${Y(36)}`, `M${X(-37.9)} ${Y(32)}V${Y(20)}`, `M${X(37.9)} ${Y(50)}V${Y(28)}`,
    ],
    centre: [`M${X(0)} ${Y(86)}V${Y(-86)}`, `M${X(-46)} ${Y(0)}H${X(46)}`],
  };
}

export class Redraw {
  constructor(svg) {
    this.svg = svg;
    const defs = document.createElementNS(NS, 'defs');
    const cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', 'fig-wipe');
    this.wipe = document.createElementNS(NS, 'rect');
    this.wipe.setAttribute('y', -10); this.wipe.setAttribute('height', FIG1.crop.h + 20);
    cp.appendChild(this.wipe); defs.appendChild(cp);
    this.fig = document.createElementNS(NS, 'g'); this.fig.setAttribute('class', 'redraw__fig');
    this.eraG = document.createElementNS(NS, 'g'); this.eraG.setAttribute('class', 'redraw__out');
    svg.append(defs, this.fig, this.eraG);
    // Bell's plate pixels travel with the traced vectors and are wiped away as the lines are redrawn
    this.img = document.createElementNS(NS, 'image');
    this.img.setAttribute('href', 'media/plates/bell-us186787-fig1.webp');
    this.img.setAttribute('width', FIG1.crop.w); this.img.setAttribute('height', FIG1.crop.h);
    this.img.setAttribute('clip-path', 'url(#fig-wipe)');
    this.fig.appendChild(this.img);
    this.figPaths = FIG1.paths.map((p) => {
      const el = document.createElementNS(NS, 'path'); el.setAttribute('d', p.d); this.fig.appendChild(el);
      return { el, x: p.x / FIG1.crop.w, len: 0 };
    });
    this.figPaths.forEach((p) => { p.len = p.el.getTotalLength(); p.el.style.strokeDasharray = `${p.len} ${p.len}`; });
    this.eras = [];
  }

  /** stageRect / plateRect: DOMRects; phone: {cx, cy, k (px per mm at scale 1:1)} in stage px */
  layout(stageRect, plateRect, phone) {
    this.svg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
    const { cx, cy, k } = phone;
    this.eraG.textContent = '';
    const wasHidden = this.svg.style.visibility; this.svg.style.visibility = 'visible';
    this.eras = ERAS.slice(1).map((era) => {
      const g = document.createElementNS(NS, 'g'); this.eraG.appendChild(g);
      let ds, centre = [];
      if (era.key === 'today') { const m = modernPaths(cx, cy, k); ds = m.lines; centre = m.centre; }
      else ds = toPaths(era.shapes(), cx, cy, k * era.s);
      const mk = (d, isCentre) => {
        const el = document.createElementNS(NS, 'path'); el.setAttribute('d', d);
        if (isCentre) el.setAttribute('class', 'is-centre');
        g.appendChild(el);
        const len = el.getTotalLength();
        const bb = el.getBBox();
        if (!isCentre) el.style.strokeDasharray = `${len} ${len}`;
        return { el, len, centre: isCentre, x: bb.x };
      };
      const paths = ds.map((d) => mk(d, false)).concat(centre.map((d) => mk(d, true)));
      const xs = paths.map((p) => p.x), x0 = Math.min(...xs), x1 = Math.max(...xs);
      paths.forEach((p) => { p.u = (p.x - x0) / Math.max(1, x1 - x0); });
      return { g, paths, key: era.key };
    });
    this.svg.style.visibility = wasHidden;
    // where Fig. 1 sits on the plate, and where it travels to (centred where the phones will be drawn)
    const s0 = plateRect.width / FIG1.crop.plateW;
    this.from = { x: plateRect.left - stageRect.left + FIG1.crop.x * s0, y: plateRect.top - stageRect.top + FIG1.crop.y * s0, s: s0 };
    const tw = Math.min(74 * k * 2.3, stageRect.width * 0.84), s1 = tw / FIG1.crop.w;
    this.to = { x: cx - tw / 2, y: cy - (FIG1.crop.h * s1) / 2, s: s1 };
  }

  /** move: Bell's travel 0..1; sweeps[i]: 0..1 for the redraw into era i+1 (i = 0 is Bell -> c. 1900) */
  render(move, sweeps, visible) {
    this.svg.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible || !this.from) return;
    const m = ease(move), f = this.from, t = this.to;
    const x = f.x + (t.x - f.x) * m, y = f.y + (t.y - f.y) * m, s = f.s + (t.s - f.s) * m;
    this.fig.setAttribute('transform', `translate(${x} ${y}) scale(${s})`);
    this.fig.style.setProperty('--sw', `${1 / s}px`);
    // out of Bell: a sweep left to right turns his ink into hairlines, which then un-draw
    const out0 = sweeps[0] || 0;
    const sweep = clamp(out0 / 0.55);
    this.wipe.setAttribute('x', String(sweep * FIG1.crop.w));
    this.wipe.setAttribute('width', String(FIG1.crop.w * (1 - sweep) + 1));
    this.fig.style.display = out0 >= 1 ? 'none' : '';
    this.figPaths.forEach((p) => {
      const local = span(out0, p.x * 0.55, p.x * 0.55 + 0.4);
      p.el.style.strokeDashoffset = String(-p.len * clamp((local - 0.15) / 0.85));
      p.el.style.strokeOpacity = local > 0 && local < 1 ? '1' : '0';
    });
    // each era draws on with the sweep into it and un-draws with the sweep out of it
    this.eras.forEach((era, i) => {
      const inP = sweeps[i] || 0, outP = sweeps[i + 1] || 0;
      const on = inP > 0 && outP < 1;
      era.g.style.display = on ? '' : 'none';
      if (!on) return;
      era.paths.forEach((p) => {
        const a = span(inP, 0.3 + p.u * 0.35, 0.3 + p.u * 0.35 + 0.35);
        const b = span(outP, p.u * 0.55, p.u * 0.55 + 0.4);
        if (p.centre) { p.el.style.opacity = a >= 0.5 && b < 0.5 ? '1' : '0'; return; }
        p.el.style.strokeDashoffset = String(b > 0 ? -p.len * b : p.len * (1 - a));
      });
    });
  }

  fade(o) { this.eraG.style.opacity = String(o); }
}

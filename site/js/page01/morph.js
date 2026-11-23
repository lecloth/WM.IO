// Page 1: Bell's sheet becomes today's phone, in a few precise lines.
// Eight clean outer paths of Bell's Fig. 1 (fitted to the scan's own ink by tools/bell_paths.py: the lid, the two box
// faces, the plinth, the speaking tube with its mouthpiece, three screw heads) are drawn on exactly over the scan
// (DrawSVG); the scan fades and leaves them; then MorphSVG turns each one into one of the X-ray phone's own outlines
// (the glass, the display, the battery, the board, the back, two lenses, the punch-hole), landing exactly where the
// 3D X-ray then appears. Hairlines only: one SVG path each, non-scaling 1-device-pixel strokes.
const NS = 'http://www.w3.org/2000/svg';
// Bell's shape -> the X-ray outline it becomes: [part, piece, face, size]
export const PAIRS = [
  ['plinth', ['Glass', 0, 'front', 'outer']],
  ['left', ['Screen', 1, 'front', 'outer']],
  ['right', ['Battery', 0, 'front', 'outer']],
  ['lid', ['Board', 0, 'front', 'outer']],
  ['tube', ['Frame', 0, 'back', 'outer']],
  ['screw_l', ['Back', 1, 'back', 'outer']],
  ['screw_b', ['Glass', 1, 'front', 'outer']],
  ['screw_r', ['Back', 2, 'back', 'outer']],
];
const f2 = (v) => Math.round(v * 100) / 100;

// closed Catmull-Rom through the points, as cubic Béziers (smooth, passes exactly through every fitted point)
function smoothD(P) {
  const n = P.length; let d = `M${f2(P[0][0])},${f2(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += `C${f2(p1[0] + (p2[0] - p0[0]) / 6)},${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)},${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])},${f2(p2[1])}`;
  }
  return d + 'Z';
}
const polyD = (P) => `M${P.map(([x, y]) => `${f2(x)},${f2(y)}`).join('L')}Z`;
function ellipsePts({ cx, cy, rx, ry, rot }, n = 20) {
  const r = rot * Math.PI / 180, out = [];
  for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI, x = rx * Math.cos(t), y = ry * Math.sin(t); out.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]); }
  return out;
}

export class BellMorph {
  constructor(svg, gsap) {
    this.svg = svg; this.gsap = gsap; this.data = null; this.paths = []; this.tw = [];
    this.svg.setAttribute('xmlns', NS);
  }
  async load(url) {
    for (let i = 0; i < 5; i++) {
      try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); this.data = await r.json(); break; }
      catch (e) { if (i === 4) throw e; await new Promise((res) => setTimeout(res, 200 * (i + 1))); }
    }
    this.byName = Object.fromEntries(this.data.paths.map((p) => [p.name, p]));
    this.paths = PAIRS.map(([name]) => { const el = document.createElementNS(NS, 'path'); el.dataset.name = name; this.svg.append(el); return el; });
  }
  get ready() { return !!this.data; }

  /** rect: where the plate image sits (CSS px); targets(part, piece, face, size) -> [[x, y], ...] in CSS px */
  place(rect, W, H, targets, dpr) {
    if (!this.data) return;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.svg.style.setProperty('--hair', `${1 / dpr}px`);
    const k = rect.width / this.data.plate[0], tx = (x, y) => [rect.left + x * k, rect.top + y * k];
    this.tw.forEach((t) => t.kill()); this.tw = [];
    const { gsap } = this;
    PAIRS.forEach(([name, sel], i) => {
      const src = this.byName[name], el = this.paths[i];
      let d;
      if (src.kind === 'poly') d = polyD(src.pts.map(([x, y]) => tx(x, y)));
      else if (src.kind === 'curve') d = smoothD(src.pts.map(([x, y]) => tx(x, y)));
      else d = smoothD(ellipsePts(src).map(([x, y]) => tx(x, y)));
      const tgt = targets(...sel);
      el.setAttribute('d', d); el.style.strokeDasharray = ''; el.style.strokeDashoffset = '';
      this.src = this.src || []; this.src[i] = d;
      if (!tgt) return;
      // the target outline as a polyline (the X-ray's own edge points, so the landing is exact)
      const td = polyD(tgt);
      const draw = gsap.fromTo(el, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1, ease: 'none', paused: true, immediateRender: false });
      const morph = gsap.to(el, { morphSVG: { shape: td, type: 'linear', map: 'position', shapeIndex: 'auto' }, duration: 1, ease: 'none', paused: true, immediateRender: false });
      morph.progress(1).progress(0); draw.progress(1).progress(0);   // precompute now, not on the first scroll frame
      el.setAttribute('d', d); el.style.strokeDasharray = ''; el.style.strokeDashoffset = '';
      this.tw.push(draw, morph);
      el._draw = draw; el._morph = morph;
    });
    this.last = null;
  }

  /** paint every path once, half drawn, at 1% opacity (behind the gate): the first dashed-stroke frame costs ~120 ms
   *  on the GPU, so it happens now rather than mid-scroll */
  warm() {
    if (!this.data) return;
    this.svg.style.opacity = '0.01'; this.svg.style.visibility = 'visible';
    this.paths.forEach((el) => el._draw && el._draw.progress(0.5));
    this.last = null;
  }
  /** draw 0..1 (each path draws on in turn), t 0..1 the morph (gently staggered), alpha 0..1, color css */
  set({ draw = 1, t = 0, alpha = 1, color = '#121212' }) {
    if (!this.data) return;
    const key = `${draw.toFixed(4)}|${t.toFixed(4)}|${alpha.toFixed(3)}|${color}`; if (key === this.last) return; this.last = key;
    this.svg.style.opacity = String(alpha); this.svg.style.visibility = 'visible';   // kept rasterised (opacity only), so its first frame costs nothing
    this.svg.style.color = color;
    if (alpha <= 0.001) return;
    const n = this.paths.length, ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    this.paths.forEach((el, i) => {
      if (!el._morph) return;
      const di = Math.min(1, Math.max(0, (draw - i * 0.06) / (1 - (n - 1) * 0.06)));
      const ti = ease(Math.min(1, Math.max(0, (t - i * 0.035) / (1 - (n - 1) * 0.035))));
      if (ti > 0) { el.style.strokeDasharray = 'none'; el._morph.progress(ti); }
      else {
        el._morph.progress(0); el.setAttribute('d', this.src[i]);
        if (di >= 1) { el.style.strokeDasharray = 'none'; el.style.strokeDashoffset = '0'; } else el._draw.progress(di);
      }
    });
  }
}

// A figure lifted off a patent plate: its real pixels plus the hairlines traced from them. It travels from where it sits
// on the plate (turning upright if it was drawn sideways) to where the modern drawing will be, then a left-to-right
// sweep wipes the ink away while its traced lines un-draw, as in sheet 01's redraw. Pure function of (move, sweep).
const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class PlateFig {
  /** fig: { crop: {w, h, plateW, x, y, cw, ch}, paths: [{d, x}] }; href: the upright crop image; rot0: degrees on the plate */
  constructor(svg, defs, fig, href, uid, rot0 = -90) {
    this.fig = fig; this.rot0 = rot0;
    const cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', `${uid}-wipe`);
    this.wipe = document.createElementNS(NS, 'rect');
    this.wipe.setAttribute('y', -10); this.wipe.setAttribute('height', fig.crop.h + 20);
    cp.appendChild(this.wipe); defs.appendChild(cp);
    this.g = document.createElementNS(NS, 'g'); this.g.setAttribute('class', 's3b-fig');
    svg.appendChild(this.g);
    const img = document.createElementNS(NS, 'image');
    img.setAttribute('href', href); img.setAttribute('width', fig.crop.w); img.setAttribute('height', fig.crop.h);
    img.setAttribute('clip-path', `url(#${uid}-wipe)`);
    this.g.appendChild(img);
    this.paths = fig.paths.map((p) => {
      const el = document.createElementNS(NS, 'path'); el.setAttribute('d', p.d); this.g.appendChild(el);
      return { el, x: p.x / fig.crop.w, len: 0 };
    });
    this.paths.forEach((p) => { p.len = p.el.getTotalLength(); p.el.style.strokeDasharray = `${p.len} ${p.len}`; p.el.style.strokeDashoffset = '0'; p.el.style.strokeOpacity = '0'; });
  }

  /** plateRect / stageRect: DOMRects; to: {cx, cy, w} target centre + width in stage px */
  layout(stageRect, plateRect, to) {
    const c = this.fig.crop;
    const s0 = plateRect.width / c.plateW;                  // plate image px -> stage px
    // on the plate the crop occupies (x, y, cw, ch) in plate-image px; the upright figure is (w x h) crop px
    const k0 = (c.cw * s0) / c.h;                           // crop px -> stage px (the crop is turned, so its h runs along the plate's x)
    this.from = { cx: plateRect.left - stageRect.left + (c.x + c.cw / 2) * s0, cy: plateRect.top - stageRect.top + (c.y + c.ch / 2) * s0, s: k0 };
    this.to = { cx: to.cx, cy: to.cy, s: to.w / c.w };
  }

  render(move, sweep, visible) {
    this.g.style.visibility = visible ? 'inherit' : 'hidden';
    if (!visible || !this.from) return;
    const m = ease(move), F = this.from, T = this.to, c = this.fig.crop;
    const cx = F.cx + (T.cx - F.cx) * m, cy = F.cy + (T.cy - F.cy) * m, s = F.s + (T.s - F.s) * m, rot = this.rot0 * (1 - m);
    this.g.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)}) translate(${-c.w / 2} ${-c.h / 2})`);
    this.g.style.setProperty('--sw', `${(1 / s).toFixed(3)}px`);
    const sw = clamp(sweep / 0.55);
    this.wipe.setAttribute('x', String(sw * c.w));
    this.wipe.setAttribute('width', String(c.w * (1 - sw) + 1));
    this.g.style.display = sweep >= 1 ? 'none' : '';
    this.paths.forEach((p) => {
      const local = span(sweep, p.x * 0.55, p.x * 0.55 + 0.4);
      p.el.style.strokeDashoffset = String(-p.len * clamp((local - 0.15) / 0.85));
      p.el.style.strokeOpacity = local > 0 && local < 1 ? '1' : '0';
    });
  }
}

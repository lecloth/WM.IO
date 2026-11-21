// Sheet 06, Break: Detail B, one tooth of the Break gear cut in section and loaded. A stress readout climbs, a crack
// runs from the root fillet (Rev A), the fillet is redrawn larger (Rev B), the load goes back on, higher, and the
// part holds. In its margin, Fig. B2: a pick probes a single pin stack and fails on a spool pin.
// The numbers are a drawn illustration (ratios to a design load), labelled as such; not a test report.
// Built in px for the current inset size; set(state) is a pure function of the scroll.

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f2 = (v) => Math.round(v * 100) / 100;
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function txt(parent, x, y, s, cls = 's-txt', anchor = 'start') {
  const t = el('text', { x: f2(x), y: f2(y), class: cls, 'text-anchor': anchor }, parent); t.textContent = s; return t;
}
function drawer(path) {
  const len = path.getTotalLength();
  return (t) => {
    t = clamp(t);
    path.style.visibility = t <= 0 ? 'hidden' : '';
    path.style.strokeDasharray = `${len} ${len}`;
    path.style.strokeDashoffset = String(len * (1 - t));
  };
}

// design layouts (design px); the inset is scaled to its box
const LAYOUT = {
  wide: { DW: 600, DH: 452, title: [22, 30], tooth: [22, 48, 360, 352], read: [404, 74], gauge: [526, 70, 206],
    state: [22, 420], pick: [404, 300, 174, 124], note: [22, 440], fs: 1 },
  tall: { DW: 340, DH: 480, title: [12, 22], tooth: [10, 32, 320, 206], read: [12, 262], gauge: [24, 326, 290], gaugeH: true,
    state: [12, 356], pick: [12, 366, 316, 92], note: [12, 474], fs: 1 },
};

// the tooth, in units (y up): root line y = 0, tip y = 2.25, corners at x = +-1
const CORNER = 1.0, TIP = 0.45, H = 2.25, BX = 2.4, BY = -1.75;
function toothPath(L, U) {          // L: fillet length along each leg; U(x, y) -> [px, py]
  const fl = Math.hypot(CORNER - TIP, H), fy = H / fl;     // flank direction (up, towards the tip)
  const P = (x, y) => { const [a, b] = U(x, y); return `${f2(a)} ${f2(b)}`; };
  const l1 = [-CORNER - L, 0], l2 = [-CORNER + (CORNER - TIP) / fl * L, fy * L];
  const r1 = [CORNER + L, 0], r2 = [CORNER - (CORNER - TIP) / fl * L, fy * L];
  // flank: slightly convex (bulging into the gap), as an involute flank is
  const bulge = 0.07;
  const lm = [(l2[0] + -TIP) / 2 - bulge, (l2[1] + H) / 2 + bulge * 0.2];
  const rm = [(r2[0] + TIP) / 2 + bulge, (r2[1] + H) / 2 + bulge * 0.2];
  const zig = (x0, y0, x1, y1) => {   // a long-break line (zig-zag at the middle)
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
    const a = 0.12, w = 0.14;
    return `L${P(mx - ux * a, my - uy * a)}L${P(mx - ux * a * 0.3 - uy * w, my - uy * a * 0.3 + ux * w)}L${P(mx + ux * a * 0.3 + uy * w, my + uy * a * 0.3 - ux * w)}L${P(mx + ux * a, my + uy * a)}L${P(x1, y1)}`;
  };
  return `M${P(-BX, 0)}L${P(...l1)}Q${P(-CORNER, 0)} ${P(...l2)}Q${P(...lm)} ${P(-TIP, H - 0.06)}Q${P(-TIP + 0.02, H)} ${P(-TIP + 0.1, H)}`
    + `L${P(TIP - 0.1, H)}Q${P(TIP - 0.02, H)} ${P(TIP, H - 0.06)}Q${P(...rm)} ${P(...r2)}Q${P(CORNER, 0)} ${P(...r1)}L${P(BX, 0)}`
    + zig(BX, 0, BX, BY) + zig(BX, BY, -BX, BY) + zig(-BX, BY, -BX, 0) + 'Z';
}
const CRACK = [[-1.02, 0.035], [-0.9, -0.03], [-0.84, -0.1], [-0.7, -0.12], [-0.6, -0.21], [-0.47, -0.23], [-0.38, -0.31], [-0.22, -0.34], [-0.12, -0.42], [0.04, -0.45], [0.16, -0.53]];
const LA = 0.07, LB = 0.48;          // fillet legs, Rev A and Rev B (in module units)

export class Stress {
  constructor(svg) { this.svg = svg; this.built = false; }

  build(w, h) {
    const svg = this.svg;
    const lay = w / h > 1.1 ? LAYOUT.wide : LAYOUT.tall;
    const s = Math.min(w / lay.DW, h / lay.DH);
    svg.setAttribute('viewBox', `0 0 ${f2(lay.DW)} ${f2(lay.DH)}`);
    svg.setAttribute('width', f2(lay.DW * s)); svg.setAttribute('height', f2(lay.DH * s));
    svg.textContent = '';
    this.sw = 1 / s;                                    // one screen pixel in design units
    svg.style.setProperty('--sw', `${f2(1 / s)}px`);
    const defs = el('defs', {}, svg);
    txt(svg, lay.title[0], lay.title[1], lay.DW > 400 ? 'Detail B · one tooth of part 4, in section · Scale 5:1' : 'Detail B · one tooth, in section · 5:1', 's-txt s-head');

    // ---- the tooth ----
    const [tx, ty, tw, th] = lay.tooth;
    const k = Math.min(tw / (2 * BX + 0.5), th / (H - BY + 0.75));
    const ox = tx + tw / 2, oy = ty + 0.45 * k + H * k;
    const U = (x, y) => [ox + x * k, oy - y * k];
    this.U = U; this.k = k;
    const dA = toothPath(LA, U), dB = toothPath(LB, U);
    const cpA = el('clipPath', { id: 's6-bodyA' }, defs); el('path', { d: dA }, cpA);
    const cpB = el('clipPath', { id: 's6-bodyB' }, defs); el('path', { d: dB }, cpB);
    const hatchLines = (g) => {
      const x0 = ox - (BX + 0.3) * k, x1 = ox + (BX + 0.3) * k, y0 = oy - (H + 0.3) * k, y1 = oy - BY * k + 8;
      const step = 7.5;
      for (let q = x0 - (y1 - y0); q < x1; q += step) el('line', { x1: f2(q), y1: f2(y1), x2: f2(q + (y1 - y0)), y2: f2(y0) }, g);
    };
    this.hatchA = el('g', { class: 's-hatch', 'clip-path': 'url(#s6-bodyA)' }, svg); hatchLines(this.hatchA);
    this.hatchB = el('g', { class: 's-hatch', 'clip-path': 'url(#s6-bodyB)' }, svg); hatchLines(this.hatchB);
    // stress lines round the tension-side root fillet (clipped to the material)
    const gIso = el('g', { 'clip-path': 'url(#s6-bodyA)' }, svg); this.gIso = gIso;
    const [fcx, fcy] = U(-CORNER + 0.02, 0.02);
    this.iso = [0.24, 0.4, 0.58, 0.8].map((r) => {
      const R = r * k;
      return el('path', { class: 's-iso', d: `M${f2(fcx + R * Math.cos(-1.32))} ${f2(fcy + R * Math.sin(-1.32))}A${f2(R)} ${f2(R)} 0 1 1 ${f2(fcx - R)} ${f2(fcy + 0.01)}` }, gIso);
    });
    // outlines: Rev A (becomes a phantom line once Rev B is drawn over it), Rev B
    this.outA = el('path', { class: 's-out', d: dA }, svg);
    this.outB = el('path', { class: 's-out', d: dB }, svg);
    this.drawB = drawer(this.outB);
    // crack: a paper-coloured gap with an ink edge
    const cd = CRACK.map((p, i) => `${i ? 'L' : 'M'}${f2(U(...p)[0])} ${f2(U(...p)[1])}`).join('');
    this.crackGap = el('path', { class: 's-crack-gap', d: cd }, svg);
    this.crack = el('path', { class: 's-crack', d: cd }, svg);
    this.drawCrack = drawer(this.crack); this.drawGap = drawer(this.crackGap);
    // load arrow on the flank, along the line of action
    const fl = Math.hypot(CORNER - TIP, H);
    const t = 0.78, P = [-CORNER + (CORNER - TIP) * t - 0.04, H * t];
    const n = [H / fl, -(CORNER - TIP) / fl];
    this.load = { P: U(...P), n: [n[0], -n[1]] };
    this.arrow = el('g', { class: 's-arrow' }, svg);
    this.arrowLine = el('line', {}, this.arrow);
    this.arrowHead = el('path', {}, this.arrow);
    this.arrowF = txt(this.arrow, 0, 0, 'F', 's-txt s-f', 'middle');
    // centre line of the tooth
    el('path', { class: 's-centre', d: `M${f2(ox)} ${f2(oy - (H + 0.35) * k)}V${f2(oy - BY * k + 6)}` }, svg);
    // fillet radius call-out (Rev B)
    this.rcall = el('g', { class: 's-rcall' }, svg);
    {
      const [ax, ay] = U(-CORNER - 0.16, 0.16);
      const bx = ox - 1.62 * k, by = oy - 0.78 * k;
      el('path', { class: 's-lead', d: `M${f2(ax)} ${f2(ay)}L${f2(bx)} ${f2(by)}H${f2(bx - 0.5 * k)}` }, this.rcall);
      el('circle', { class: 's-dot', cx: f2(ax), cy: f2(ay), r: 1.8 }, this.rcall);
      txt(this.rcall, bx - 2, by - 5, 'R 0.42 m', 's-txt', 'end');
      txt(this.rcall, bx - 2, by + 12, 'was R 0.06 m', 's-txt s-g', 'end');
    }

    // ---- readout ----
    const [rx, ry] = lay.read, wide = lay.DW > 400;
    if (wide) {
      txt(svg, rx, ry, 'Load / design load', 's-txt s-g');
      this.vLoad = txt(svg, rx, ry + 30, '0.00', 's-big');
      txt(svg, rx, ry + 64, 'Stress / allowed', 's-txt s-g');
      this.vSig = txt(svg, rx, ry + 94, '0.00', 's-big');
      this.vRev = txt(svg, rx, ry + 128, 'Rev A', 's-txt');
    } else {
      txt(svg, rx, ry, 'Load / design', 's-txt s-g');
      this.vLoad = txt(svg, rx, ry + 24, '0.00', 's-big');
      txt(svg, rx + 150, ry, 'Stress / allowed', 's-txt s-g');
      this.vSig = txt(svg, rx + 150, ry + 24, '0.00', 's-big');
      this.vRev = txt(svg, rx, ry + 44, 'Rev A', 's-txt');
    }
    // gauge: 0 .. 1.5 of the allowed stress, limit at 1.0
    const [gx, gy0, gl] = lay.gauge;
    const gg = el('g', { class: 's-gauge' }, svg);
    this.gH = !!lay.gaugeH;
    if (this.gH) {          // horizontal: 0 at the left
      const G = (v) => gx + gl * (v / 1.5);
      this.G = G; this.gy = gy0;
      el('line', { x1: G(0), x2: G(1.5), y1: gy0, y2: gy0 }, gg);
      [0, 0.5, 1, 1.5].forEach((v) => { el('line', { x1: f2(G(v)), x2: f2(G(v)), y1: gy0, y2: gy0 + 5 }, gg); txt(gg, G(v), gy0 + 16, v === 1 ? '1.0 limit' : v.toFixed(1), v === 1 ? 's-txt s-tick' : 's-txt s-g s-tick', 'middle'); });
      el('line', { class: 's-limit', x1: f2(G(1)), x2: f2(G(1)), y1: gy0 - 16, y2: gy0 + 5 }, gg);
      this.bar = el('line', { class: 's-bar', x1: f2(G(0)), x2: f2(G(0)), y1: gy0 - 3, y2: gy0 - 3 }, svg);
    } else {                // vertical: 0 at the bottom
      const G = (v) => gy0 + gl * (1 - v / 1.5);
      this.G = G;
      el('line', { x1: gx, x2: gx, y1: G(0), y2: G(1.5) }, gg);
      [0, 0.5, 1, 1.5].forEach((v) => { el('line', { x1: gx, x2: gx + 5, y1: f2(G(v)), y2: f2(G(v)) }, gg); txt(gg, gx + 9, G(v) + 3.5, v === 1 ? '1.0 limit' : v.toFixed(1), v === 1 ? 's-txt s-tick' : 's-txt s-g s-tick'); });
      el('line', { class: 's-limit', x1: gx - 8, x2: gx + 5, y1: f2(G(1)), y2: f2(G(1)) }, gg);
      this.bar = el('line', { class: 's-bar', x1: gx - 3, x2: gx - 3, y1: f2(G(0)), y2: f2(G(0)) }, svg);
    }
    this.mark = el('path', { class: 's-mark', d: '' }, svg);
    this.gx = gx;

    // ---- state line + honesty note ----
    this.vState = txt(svg, lay.state[0], lay.state[1], '', 's-txt s-state');
    txt(svg, lay.note[0], lay.note[1], wide ? 'Drawn illustration of how we test, not a test report.' : 'Illustration,', 's-txt s-g s-note');
    if (!wide) txt(svg, lay.note[0], lay.note[1] + 13, 'not a report.', 's-txt s-g s-note');

    // ---- Fig. B2: pin stack, probed ----
    const [px, py, pw, ph] = lay.pick;
    const gp = el('g', { class: 's-pick' }, svg);
    el('rect', { class: 's-box', x: px, y: py, width: pw, height: ph }, gp);
    txt(gp, px + 8, py + 15, 'Fig. B2 · Pin stack, probed', 's-txt s-g s-small');
    const cp = el('clipPath', { id: 's6-pickclip' }, defs); el('rect', { x: px + 1, y: py + 1, width: pw - 2, height: ph - 2 }, cp);
    const inner = el('g', { 'clip-path': 'url(#s6-pickclip)' }, gp);
    const shear = py + ph * 0.55, plugB = py + ph * 0.84, top = py + ph * 0.22, cx = px + pw * 0.66, pwid = Math.min(14, pw * 0.07);
    // housing + plug + keyway (section: hatched housing)
    el('path', { class: 's-thin', d: `M${px + 6} ${f2(top)}H${px + pw - 6}M${px + 6} ${f2(plugB)}H${px + pw - 6}` }, inner);
    el('path', { class: 's-shear', d: `M${px + 6} ${f2(shear)}H${px + pw - 6}` }, inner);
    txt(inner, px + 8, shear - 4, 'shear line', 's-txt s-g s-small');
    el('path', { class: 's-thin', d: `M${f2(cx - pwid)} ${f2(top)}V${f2(shear + ph * 0.14)}M${f2(cx + pwid)} ${f2(top)}V${f2(shear + ph * 0.14)}` }, inner);
    const keyY = plugB - ph * 0.09;           // top of the keyway the pick travels in
    el('path', { class: 's-thin', d: `M${px + 6} ${f2(keyY)}H${px + pw - 6}` }, inner);
    // pins: key pin (pointed, bottom), spool driver pin, spring
    const pins = el('g', {}, inner);
    const kpTop = shear + ph * 0.05, kpBot = keyY - 2, dpTop = top + ph * 0.13, w2 = pwid - 1.2;
    el('path', { class: 's-pin', d: `M${f2(cx - w2)} ${f2(kpTop)}H${f2(cx + w2)}V${f2(kpBot - 6)}L${f2(cx)} ${f2(kpBot)}L${f2(cx - w2)} ${f2(kpBot - 6)}Z` }, pins);
    const waist = w2 * 0.5, dTop = dpTop, dBot = kpTop - 1, dm = (dTop + dBot) / 2;
    el('path', { class: 's-pin', d: `M${f2(cx - w2)} ${f2(dTop)}H${f2(cx + w2)}V${f2(dm - 5)}L${f2(cx + waist)} ${f2(dm - 2)}V${f2(dm + 3)}L${f2(cx + w2)} ${f2(dm + 6)}V${f2(dBot)}H${f2(cx - w2)}V${f2(dm + 6)}L${f2(cx - waist)} ${f2(dm + 3)}V${f2(dm - 2)}L${f2(cx - w2)} ${f2(dm - 5)}Z` }, pins);
    this.spring = el('path', { class: 's-thin' }, inner);
    this.pins = pins;
    this.springGeo = { cx, top: top + 1, w: w2 * 0.9, base: dpTop };
    // the pick: a hook on a long shaft, entering along the keyway
    this.pick = el('path', { class: 's-hook', d: `M${f2(-pw * 1.2)} 0H0Q5 0 6 -5L7 -9` }, inner);
    this.pickGeo = { x0: px - 4, x1: cx - 6.5, y: keyY + ph * 0.05, lift: dm - shear };
    this.vPick = txt(gp, px + pw, py + ph + 14, '', 's-txt s-small', 'end');
    this.built = true;
  }

  /** st: { loadA, crack 0..1, release 0..1, redraw 0..1, loadB, done, enter 0..1, lift 0..1, pickState } */
  set(st) {
    if (!this.built) return;
    const revB = st.redraw > 0;
    const load = revB ? st.loadB : st.loadA * (1 - st.release);
    const sig = revB ? load * 0.6 : load * 0.95;
    this.vLoad.textContent = `${load.toFixed(2)} ×`;
    this.vSig.textContent = sig.toFixed(2);
    this.vRev.textContent = revB ? 'Rev B · new fillet' : 'Rev A';
    // gauge
    const gv = this.G(Math.min(1.5, sig));
    if (this.gH) {
      this.bar.setAttribute('x2', f2(gv));
      this.mark.setAttribute('d', `M${f2(gv)} ${f2(this.gy - 7)}l-4 -7h8Z`);
    } else {
      this.bar.setAttribute('y2', f2(gv));
      this.mark.setAttribute('d', `M${f2(this.gx - 7)} ${f2(gv)}l-7 -4v8Z`);
    }
    // stress lines: more of them as the stress climbs
    const nIso = sig <= 0.02 ? 0 : Math.min(4, 1 + Math.floor(sig / 0.3));
    this.iso.forEach((p, i) => { p.style.visibility = i < nIso ? '' : 'hidden'; });
    // load arrow, its length grows with the load
    const on = load > 0.005;
    this.arrow.style.visibility = on ? '' : 'hidden';
    if (on) {
      const L = (0.35 + 0.55 * Math.min(load, 1.6)) * this.k;
      const [x1, y1] = this.load.P, [nx, ny] = this.load.n;
      const x0 = x1 - nx * L, y0 = y1 - ny * L;
      this.arrowLine.setAttribute('x1', f2(x0)); this.arrowLine.setAttribute('y1', f2(y0));
      this.arrowLine.setAttribute('x2', f2(x1 - nx * 6)); this.arrowLine.setAttribute('y2', f2(y1 - ny * 6));
      this.arrowHead.setAttribute('d', `M${f2(x1)} ${f2(y1)}L${f2(x1 - nx * 10 - ny * 3.4)} ${f2(y1 - ny * 10 + nx * 3.4)}L${f2(x1 - nx * 10 + ny * 3.4)} ${f2(y1 - ny * 10 - nx * 3.4)}Z`);
      this.arrowF.setAttribute('x', f2(x0 - nx * 10)); this.arrowF.setAttribute('y', f2(y0 - ny * 10 + 4));
    }
    // crack (Rev A only): drawn on, erased as Rev B is drawn
    const ck = revB ? clamp(1 - st.redraw * 2.2) * st.crack : st.crack;
    this.drawCrack(ck); this.drawGap(ck);
    this.crackGap.style.strokeWidth = `${f2((3 + 3 * clamp((st.crack - 0.6) / 0.4)) * this.sw)}px`;
    // outlines + section
    this.outA.classList.toggle('is-phantom', revB);
    this.drawB(revB ? clamp((st.redraw - 0.25) / 0.75) : 0);
    const bDone = st.redraw >= 1;
    this.gIso.setAttribute('clip-path', bDone ? 'url(#s6-bodyB)' : 'url(#s6-bodyA)');
    this.hatchA.style.visibility = bDone ? 'hidden' : '';
    this.hatchB.style.visibility = bDone ? '' : 'hidden';
    this.rcall.style.visibility = bDone ? '' : 'hidden';
    // state line
    let state = 'Rev A · under load';
    if (st.crack >= 1 && !revB) state = 'Rev A · cracked at 1.20 × design load';
    if (revB) state = bDone ? 'Rev B · under load' : 'Rev B · root fillet redrawn';
    if (st.done) state = 'Rev B · holds at 1.50 × design load';
    if (st.loadA <= 0 && !revB) state = 'Rev A · ready to load';
    this.vState.textContent = state;
    this.vState.classList.toggle('is-held', !!st.done);
    // Fig. B2: the pick enters, lifts the stack, the spool pin false-sets it, the stack drops, the pick leaves
    const g = this.pickGeo;
    const x = g.x0 + (g.x1 - g.x0) * st.enter, lift = g.lift * st.lift;
    this.pick.setAttribute('transform', `translate(${f2(x)} ${f2(g.y - lift)})`);
    this.pick.style.visibility = st.enter > 0 ? '' : 'hidden';
    const pinLift = st.enter >= 0.98 ? lift : 0;
    this.pins.setAttribute('transform', `translate(0 ${f2(-pinLift)})`);
    const sg = this.springGeo, base = sg.base - pinLift, n = 7, seg = (base - sg.top) / n;
    let d = `M${f2(sg.cx)} ${f2(sg.top)}`;
    for (let i = 0; i < n; i++) d += `L${f2(sg.cx + (i % 2 ? -sg.w : sg.w))} ${f2(sg.top + seg * (i + 0.5))}`;
    d += `L${f2(sg.cx)} ${f2(base)}`;
    this.spring.setAttribute('d', d);
    this.vPick.textContent = st.pickState;
  }
}

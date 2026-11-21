// The pin-tumbler cylinder in section, drawn in code (hairlines, hatched sections like a patent drawing).
// Fig. A: section along the plug through the five pin chambers. Fig. B: end view (after Yale's own Fig. 6).
// Geometry is in drawing units ("u", roughly half-millimetres); every path is generated in stage px on layout so
// strokes stay exactly 1 px and can be drawn on with dash offsets. state -> pure render, so any frame can be frozen.
const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ---- geometry (u) ----
export const G = {
  pins: [16, 34, 52, 70, 88],          // chamber centres along the plug
  keyLen: [11, 8, 14, 10, 13],         // key-pin lengths (different, as in the patent: "of different lengths")
  driverLen: 10,
  shear: 30,                           // the shear line: top of the plug
  plugBot: 56, keyTop: 37, keyBot: 53, rest: 45, chamberTop: 3,
  notched: 1,                          // pin 2's driver is notched (Yale's claim 4: notched pin-tumblers)
};
G.restTop = G.keyLen.map((L) => G.rest - L);              // key-pin tops at rest: all below the shear line
G.lift = G.restTop.map((t) => t - G.shear);              // how far the right key lifts each stack
G.cut = G.lift.map((l) => G.rest - l);                   // the key's cut depth under each pin

/** the right key's top edge, in plug coordinates (x along the plug), fully inserted */
function keyProfile() {
  const P = G.pins, c = G.cut, pts = [[-200, G.keyTop + 0.5], [6, G.keyTop + 0.5]];
  for (let i = 0; i < P.length; i++) {
    const peakL = i === 0 ? G.keyTop + 0.5 : Math.max(G.keyTop + 0.5, Math.min(c[i - 1], c[i]) - 2.5);
    pts.push([P[i] - 6, peakL], [P[i] - 1.2, c[i]], [P[i] + 1.2, c[i]]);
  }
  pts.push([P[P.length - 1] + 6, c[P.length - 1] - 1.5], [97, 47], [100, 50.5]);
  return pts;
}
const KEY = [[-14, G.keyTop + 0.5], ...keyProfile().filter(([x]) => x > -14)];
function keyTopAt(x) {                       // y of the key's top edge at plug-x x (key fully home); Infinity past the tip
  if (x > 100) return Infinity;
  for (let i = 1; i < KEY.length; i++) {
    const [x0, y0] = KEY[i - 1], [x1, y1] = KEY[i];
    if (x <= x1) return y0 + (y1 - y0) * ((x - x0) / Math.max(1e-6, x1 - x0));
  }
  return Infinity;
}

/** lifts for the right key pushed in to `ins` (0 out .. 1 home) */
export function keyLifts(ins) {
  const dx = (1 - ins) * 112;
  return G.pins.map((xc, i) => {
    let best = Infinity;
    for (const o of [-2, 0, 2]) best = Math.min(best, keyTopAt(xc + o + dx));   // the pin's rounded tip rides the key
    return clamp(G.rest - best, 0, G.lift[i] + 4);
  });
}

// ---- svg helpers ----
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; };
const f = (n) => n.toFixed(1);

export class Lock {
  /** g: an <g> in the stage-px svg; defs: the svg's <defs>; uid: unique id prefix */
  constructor(g, defs, uid) {
    this.g = g; this.defs = defs; this.uid = uid;
    this.state = { ins: 0, pick: null, theta: 0, drop: 0 };
  }

  /** ox, oy: stage px of Fig. A's origin; k: px per u; bx, by: Fig. B's centre offset in u from Fig. A's origin */
  layout({ ox, oy, k, bx = 150, by = 43, labels = true }) {
    this.o = { ox, oy, k, bx, by, labels };
    const X = (u) => ox + u * k, Y = (u) => oy + u * k;
    this.X = X; this.Y = Y;
    const g = this.g; g.textContent = ''; this.defs.querySelectorAll(`[id^="${this.uid}"]`).forEach((n) => n.remove());
    const P = G.pins, hw = 3;  // chamber half-width
    const static_ = el('g', { class: 'lk-static' }, g);
    this.drawn = [];          // paths that draw on during the redraw, with their x (0..1)
    const add = (parent, d, cls = '') => { const p = el('path', { d, class: cls }, parent); this.drawn.push(p); return p; };

    // Fig. A: shell (above the shear line, with the chambers cut out)
    let d = `M${f(X(0))} ${f(Y(0))}H${f(X(110))}V${f(Y(G.shear))}`;
    for (let i = P.length - 1; i >= 0; i--) d += `H${f(X(P[i] + hw))}V${f(Y(G.chamberTop))}H${f(X(P[i] - hw))}V${f(Y(G.shear))}`;
    d += `H${f(X(0))}Z`;
    const shellD = d;
    const shellBot = `M${f(X(0))} ${f(Y(G.plugBot))}H${f(X(110))}V${f(Y(G.plugBot + 7))}H${f(X(0))}Z`;
    const face = `M${f(X(-8))} ${f(Y(-4))}H${f(X(0))}V${f(Y(G.keyTop))}H${f(X(-8))}ZM${f(X(-8))} ${f(Y(G.keyBot))}H${f(X(0))}V${f(Y(G.plugBot + 11))}H${f(X(-8))}Z`;
    // plug: above the keyway (with the lower chambers) and below it
    let pd = `M${f(X(0))} ${f(Y(G.shear))}`;
    for (let i = 0; i < P.length; i++) pd += `H${f(X(P[i] - hw))}V${f(Y(G.keyTop))}H${f(X(P[i] + hw))}V${f(Y(G.shear))}`;
    pd += `H${f(X(104))}V${f(Y(G.keyTop))}H${f(X(0))}Z`;
    const plugLow = `M${f(X(0))} ${f(Y(G.keyBot))}H${f(X(104))}V${f(Y(G.plugBot))}H${f(X(0))}Z`;
    const plugBack = `M${f(X(100))} ${f(Y(G.keyTop))}H${f(X(104))}V${f(Y(G.keyBot))}H${f(X(100))}Z`;
    const tail = `M${f(X(104))} ${f(Y(36))}H${f(X(116))}V${f(Y(50))}H${f(X(104))}Z`;

    // hatching: shell at +45 deg, plug at -45 deg (adjacent parts hatched in opposite directions)
    const hatch = (id, shapes, dir, step) => {
      const cp = el('clipPath', { id: `${this.uid}-${id}` }, this.defs);
      shapes.forEach((s) => el('path', { d: s }, cp));
      const hg = el('g', { 'clip-path': `url(#${this.uid}-${id})`, class: 'lk-hatch' }, static_);
      let hd = '';
      const x0 = X(-20), x1 = X(125), y0 = Y(-10), y1 = Y(75), h = y1 - y0, s = step * k;
      for (let x = x0 - h; x < x1 + h; x += s) hd += dir > 0 ? `M${f(x)} ${f(y1)}L${f(x + h)} ${f(y0)}` : `M${f(x)} ${f(y0)}L${f(x + h)} ${f(y1)}`;
      el('path', { d: hd }, hg);
      return hg;
    };
    this.hatchA = [hatch('sh', [shellD, shellBot, face], 1, 2.6), hatch('pl', [pd, plugLow, plugBack], -1, 2.6)];
    [shellD, shellBot, face, pd, plugLow, plugBack, tail].forEach((s) => add(static_, s));
    // shear line (dash-dot, a drafting centre-line style) and the keyway's centre
    this.shearLine = el('path', { d: `M${f(X(-16))} ${f(Y(G.shear))}H${f(X(122))}`, class: 'lk-centre' }, static_);
    // springs, drivers, key pins
    this.springs = P.map(() => el('path', { class: 'lk-spring' }, g));
    this.drivers = P.map((xc, i) => {
      const gg = el('g', { class: 'lk-pin' }, g);
      const L = G.driverLen;
      el('path', { d: `M${f(X(xc - 2.5))} ${f(Y(0))}H${f(X(xc + 2.5))}V${f(Y(L))}H${f(X(xc - 2.5))}Z` }, gg);
      if (i === G.notched) {   // notches (racked), after the patent's notched tumblers
        let nd = '';
        for (let y = 2; y < L - 1; y += 2.4) nd += `M${f(X(xc - 2.5))} ${f(Y(y))}l${f(1.1 * k)} ${f(0.8 * k)}l${f(-1.1 * k)} ${f(0.8 * k)}M${f(X(xc + 2.5))} ${f(Y(y))}l${f(-1.1 * k)} ${f(0.8 * k)}l${f(1.1 * k)} ${f(0.8 * k)}`;
        el('path', { d: nd, class: 'lk-notch' }, gg);
      }
      return gg;
    });
    this.keyPins = P.map((xc, i) => {
      const gg = el('g', { class: 'lk-pin' }, g);
      const L = G.keyLen[i];
      el('path', { d: `M${f(X(xc - 2.5))} ${f(Y(0))}H${f(X(xc + 2.5))}V${f(Y(L - 1.6))}L${f(X(xc + 0.6))} ${f(Y(L))}H${f(X(xc - 0.6))}L${f(X(xc - 2.5))} ${f(Y(L - 1.6))}Z` }, gg);
      return gg;
    });
    // the key (section: not hatched, by convention) and the pick + tension wrench, clipped to the cylinder's mouth
    const cpk = el('clipPath', { id: `${this.uid}-mouth` }, this.defs);
    el('rect', { x: X(-70), y: Y(-20), width: 190 * k, height: 100 * k }, cpk);
    const tools = el('g', { 'clip-path': `url(#${this.uid}-mouth)` }, g);
    let kd = `M${f(X(-14))} ${f(Y(G.keyBot - 1))}`;
    KEY.forEach(([x, y]) => { kd += `L${f(X(x))} ${f(Y(y))}`; });
    kd += `L${f(X(98))} ${f(Y(G.keyBot - 1))}Z`;
    // the bow: a rounded head with a hole, outside the face when the key is home
    const by0 = Y(G.keyTop - 9), by1 = Y(G.keyBot + 8), bxa = X(-58), bxb = X(-14), br = 5 * k;
    kd += `M${f(bxb)} ${f(by0)}H${f(bxa + br)}Q${f(bxa)} ${f(by0)} ${f(bxa)} ${f(by0 + br)}V${f(by1 - br)}Q${f(bxa)} ${f(by1)} ${f(bxa + br)} ${f(by1)}H${f(bxb)}Z`;
    const hcx = X(-44), hcy = (by0 + by1) / 2, hr = 3.2 * k;
    kd += `M${f(hcx + hr)} ${f(hcy)}A${f(hr)} ${f(hr)} 0 1 0 ${f(hcx - hr)} ${f(hcy)}A${f(hr)} ${f(hr)} 0 1 0 ${f(hcx + hr)} ${f(hcy)}Z`;
    this.key = el('path', { d: kd, class: 'lk-key', 'fill-rule': 'evenodd' }, tools);
    // tension wrench: a flat bar along the keyway floor, turned down outside the face
    this.wrench = el('path', { d: `M${f(X(-40))} ${f(Y(G.keyBot - 2.2))}H${f(X(9))}V${f(Y(G.keyBot - 0.4))}H${f(X(-30))}V${f(Y(G.keyBot + 16))}H${f(X(-32))}V${f(Y(G.keyBot - 0.4))}H${f(X(-40))}Z`, class: 'lk-tool' }, tools);
    // hook pick: a thin shaft with an up-turned tip at x = 0 (moved by transform)
    this.pickEl = el('path', { d: `M${f(X(-160))} ${f(Y(49.4))}H${f(X(-2))}Q${f(X(0.6))} ${f(Y(49.4))} ${f(X(0.6))} ${f(Y(46.5))}V${f(Y(45.2))}H${f(X(-0.8))}V${f(Y(46.6))}Q${f(X(-0.8))} ${f(Y(48))} ${f(X(-2.4))} ${f(Y(48))}H${f(X(-160))}Z`, class: 'lk-tool' }, tools);

    // Fig. B: end view, plug turning about its centre
    const dyB = by - 43, YB = (u) => Y(u + dyB);
    const cx = X(bx), cy = YB(43), R = 13 * k, Ro = 18 * k;
    this.YB = YB;
    this.figB = { cx, cy };
    const bs = el('g', { class: 'lk-static' }, g);
    const bTop = YB(-2);
    const shellB = `M${f(cx - 7 * k)} ${f(cy - Math.sqrt(Ro * Ro - 49 * k * k))}V${f(bTop + 3 * k)}Q${f(cx - 7 * k)} ${f(bTop)} ${f(cx - 4 * k)} ${f(bTop)}H${f(cx + 4 * k)}Q${f(cx + 7 * k)} ${f(bTop)} ${f(cx + 7 * k)} ${f(bTop + 3 * k)}V${f(cy - Math.sqrt(Ro * Ro - 49 * k * k))}A${f(Ro)} ${f(Ro)} 0 1 1 ${f(cx - 7 * k)} ${f(cy - Math.sqrt(Ro * Ro - 49 * k * k))}Z`;
    const hole = `M${f(cx + R)} ${f(cy)}A${f(R)} ${f(R)} 0 1 0 ${f(cx - R)} ${f(cy)}A${f(R)} ${f(R)} 0 1 0 ${f(cx + R)} ${f(cy)}Z`;
    const chB = `M${f(cx - hw * k)} ${f(YB(G.chamberTop))}H${f(cx + hw * k)}V${f(YB(G.shear) + 1)}H${f(cx - hw * k)}Z`;
    const cps = el('clipPath', { id: `${this.uid}-bs`, 'clip-rule': 'evenodd' }, this.defs);
    el('path', { d: shellB + hole + chB, 'clip-rule': 'evenodd' }, cps);
    const hb = el('g', { 'clip-path': `url(#${this.uid}-bs)`, class: 'lk-hatch' }, bs);
    let hd = ''; const s = 2.6 * k, y0 = bTop - 10, y1 = cy + Ro + 10, h = y1 - y0;
    for (let x = cx - Ro - h; x < cx + Ro + h; x += s) hd += `M${f(x)} ${f(y1)}L${f(x + h)} ${f(y0)}`;
    el('path', { d: hd }, hb);
    this.hatchB = hb;
    add(bs, shellB); add(bs, chB);
    // the plug in end view (rotates): circle, keyway, its share of the chamber, hatched the other way
    this.plugB = el('g', {}, g);
    const kw = `M${f(cx - 1.6 * k)} ${f(YB(G.keyTop))}H${f(cx + 1.6 * k)}V${f(YB(44))}L${f(cx + 0.6 * k)} ${f(YB(46))}L${f(cx + 1.6 * k)} ${f(YB(48))}V${f(YB(G.keyBot))}H${f(cx - 1.6 * k)}V${f(YB(48))}L${f(cx - 0.6 * k)} ${f(YB(46))}L${f(cx - 1.6 * k)} ${f(YB(44))}Z`;
    const chP = `M${f(cx - hw * k)} ${f(YB(G.shear) - 1)}H${f(cx + hw * k)}V${f(YB(G.keyTop))}H${f(cx - hw * k)}Z`;
    const cpp = el('clipPath', { id: `${this.uid}-bp` }, this.defs);
    el('path', { d: hole + kw + chP, 'clip-rule': 'evenodd' }, cpp);
    const hp = el('g', { 'clip-path': `url(#${this.uid}-bp)`, class: 'lk-hatch' }, this.plugB);
    let hd2 = '';
    for (let x = cx - R - 2 * R; x < cx + 3 * R; x += s) hd2 += `M${f(x)} ${f(cy - 2 * R)}L${f(x + 4 * R)} ${f(cy + 2 * R)}`;
    el('path', { d: hd2 }, hp);
    this.hatchBp = hp;
    add(this.plugB, hole); add(this.plugB, kw); add(this.plugB, chP);
    this.pinB = { driver: el('path', { class: 'lk-pinb' }, g), key: el('path', { class: 'lk-pinb' }, this.plugB), spring: el('path', { class: 'lk-spring' }, g) };
    // centre lines of Fig. B
    this.centreB = el('path', { d: `M${f(cx - Ro - 4 * k)} ${f(cy)}H${f(cx + Ro + 4 * k)}M${f(cx)} ${f(bTop - 4 * k)}V${f(cy + Ro + 4 * k)}`, class: 'lk-centre lk-centre--b' }, g);

    // draw-on bookkeeping: normalised x of each outline
    const xs = this.drawn.map((p) => p.getBBox().x);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    this.drawn.forEach((p, i) => { p._u = (xs[i] - x0) / Math.max(1, x1 - x0); p._len = p.getTotalLength(); });
    this.bounds = { x0: X(-16), x1: cx + Ro + 4 * k, y0: Math.min(Y(-4), bTop - 4 * k), y1: Math.max(Y(G.plugBot + 11), cy + Ro + 4 * k) };
    this.render(this.state, true);
  }

  /** draw-on: t 0..1, the outlines appear left to right; hatching and pins follow once their outline is down */
  drawOn(t) {
    if (!this.drawn) return;
    const on = t >= 1;
    this.drawn.forEach((p) => {
      if (on) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; return; }
      const a = clamp((t - p._u * 0.5) / 0.45);
      p.style.strokeDasharray = `${p._len} ${p._len}`;
      p.style.strokeDashoffset = String(p._len * (1 - a));
    });
    const late = t > 0.82;
    [...this.hatchA, this.hatchB, this.hatchBp].forEach((h) => { h.style.visibility = late ? '' : 'hidden'; });
    [...this.springs, ...this.drivers, ...this.keyPins, this.pinB.driver, this.pinB.key, this.pinB.spring].forEach((p) => { p.style.visibility = late ? '' : 'hidden'; });
    this.shearLine.style.visibility = late ? '' : 'hidden';
    this.centreB.style.visibility = t > 0.6 ? '' : 'hidden';
  }

  /** state: { ins: key 0..1, pick: {wrench 0..1, x: tip x in u or null, lift: u, set: [bool...], bind: u} , theta: deg } */
  render(state, force) {
    this.state = state;
    if (!this.o) return;
    const { k } = this.o, X = this.X, Y = this.Y, P = G.pins;
    const ins = state.ins || 0;
    let lifts = ins > 0 ? keyLifts(ins) : P.map(() => 0);
    const pk = state.pick;
    const setPin = P.map(() => false);
    let drv = lifts.slice();                      // driver lift = key-pin lift unless the driver is held
    if (pk) {
      lifts = P.map(() => 0);
      if (pk.x != null) {
        P.forEach((xc, i) => { if (Math.abs(pk.x - xc) < 2.6) lifts[i] = clamp(pk.lift, 0, G.lift[i] + 5); });
      }
      drv = lifts.slice();
      (pk.set || []).forEach((s, i) => { if (s) { setPin[i] = true; drv[i] = Math.max(drv[i], G.lift[i]); } });
      if (pk.bind != null) drv[G.notched] = Math.max(drv[G.notched], pk.bind);
    }
    // key + tools
    this.key.style.display = ins > 0 ? '' : 'none';
    this.key.setAttribute('transform', `translate(${f(-(1 - ins) * 112 * k)} 0)`);
    this.wrench.style.display = pk && pk.wrench > 0 ? '' : 'none';
    if (pk) this.wrench.setAttribute('transform', `translate(${f(-(1 - pk.wrench) * 40 * k)} 0)`);
    this.pickEl.style.display = pk && pk.tip != null ? '' : 'none';
    if (pk && pk.tip != null) this.pickEl.setAttribute('transform', `translate(${f(X(pk.tip) - X(0))} ${f(-(pk.hook || 0) * k)})`);
    // pins + springs (Fig. A)
    P.forEach((xc, i) => {
      const kt = G.restTop[i] - lifts[i];                 // key-pin top
      const dTop = G.restTop[i] - drv[i] - G.driverLen;   // driver top
      this.keyPins[i].setAttribute('transform', `translate(0 ${f(Y(kt) - Y(0))})`);
      this.drivers[i].setAttribute('transform', `translate(0 ${f(Y(dTop) - Y(0))})`);
      this.springs[i].setAttribute('d', spring(X(xc), Y(G.chamberTop), Y(dTop), 2.2 * k, 7));
    });
    // Fig. B: the front pin's stack, the plug turned by theta
    const { cx } = this.figB;
    const th = state.theta || 0;
    const kt0 = G.restTop[0] - lifts[0], dTop0 = G.restTop[0] - drv[0] - G.driverLen;
    const rect = (y0, y1) => `M${f(cx - 2.5 * k)} ${f(this.YB(y0))}H${f(cx + 2.5 * k)}V${f(this.YB(y1))}H${f(cx - 2.5 * k)}Z`;
    this.pinB.driver.setAttribute('d', rect(dTop0, dTop0 + G.driverLen));
    this.pinB.key.setAttribute('d', rect(kt0, Math.min(G.rest, kt0 + G.keyLen[0])));
    this.pinB.spring.setAttribute('d', spring(cx, this.YB(G.chamberTop), this.YB(dTop0), 2.2 * k, 7));
    this.plugB.setAttribute('transform', `rotate(${th.toFixed(2)} ${f(cx)} ${f(this.figB.cy)})`);
  }
}

function spring(x, yTop, yBot, w, n) {
  const h = Math.max(2, yBot - yTop);
  let d = `M${f(x)} ${f(yTop)}`;
  for (let i = 0; i < n; i++) {
    const a = yTop + (h * (i + 0.25)) / n, b = yTop + (h * (i + 0.75)) / n;
    d += `L${f(x + w)} ${f(a)}L${f(x - w)} ${f(b)}`;
  }
  return d + `L${f(x)} ${f(yBot)}`;
}

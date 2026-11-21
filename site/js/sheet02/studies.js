// Sheet 02 margin studies: four public-domain machine studies by Leonardo da Vinci from Codex Madrid I
// (Biblioteca Nacional de España, Mss/8937; scans via the RWTH Aachen edition, mirrored back to the manuscript's own
// orientation, then processed into an ink mask; see tools/notes/sheet-02.md for sources and licences).
//
// Each study has, in its own crop pixel space (W x H):
//   measure(P): the construction layer drawn over the plate in reading moments (centre lines, dimensions, leaders),
//               built with the shared Plot (static, draws on);
//   trace(T):   the mechanism redrawn as CAD hairlines; returns update(phase 0..1), which moves it (spectacle,
//               shown only between reading moments, after the plate has been traced away).
const NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;

/** Catmull-Rom through points -> cubic Bezier path */
export function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const poly = (pts, close) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + (close ? 'Z' : '');
const rot = ([x, y], [cx, cy], a) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));

/** A group of hairline paths in a crop's pixel space whose geometry is rewritten each frame. */
export class Trace {
  constructor(parent, W, H) {
    this.W = W; this.H = H;
    this.outer = document.createElementNS(NS, 'g');          // clipped in stage px (the scan)
    this.g = document.createElementNS(NS, 'g'); this.g.setAttribute('class', 'trace');
    this.outer.appendChild(this.g); parent.appendChild(this.outer);
    this.els = new Map();
  }
  place(box, align = 'center') {
    const u = Math.min(box.w / this.W, box.h / this.H);
    const ox = box.x + (align === 'left' ? 0 : (box.w - this.W * u) / 2), oy = box.y + (box.h - this.H * u) / 2;
    this.u = u; this.rect = { x: ox, y: oy, w: this.W * u, h: this.H * u };
    this.g.setAttribute('transform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${u.toFixed(5)})`);
    this.g.style.setProperty('--sw', `${1 / u}px`);
    this.g.style.setProperty('--sw-heavy', `${1.6 / u}px`);
    this.g.style.setProperty('--centre', `${14 / u} ${3 / u} ${2.5 / u} ${3 / u}`);
    this.g.style.setProperty('--fs', `${10 / u}px`);
    this.g.style.setProperty('--halo', `${4 / u}px`);
    return this;
  }
  /** set path `name` to d (created on first use) */
  d(name, d, cls = '') {
    let el = this.els.get(name);
    if (!el) { el = document.createElementNS(NS, 'path'); el.setAttribute('class', `pl ${cls}`.trim()); this.g.appendChild(el); this.els.set(name, el); }
    el.setAttribute('d', d);
    return el;
  }
  text(name, x, y, str, anchor = 'start') {
    let el = this.els.get(name);
    if (!el) { el = document.createElementNS(NS, 'text'); el.setAttribute('class', 'pt'); this.g.appendChild(el); this.els.set(name, el); }
    el.setAttribute('x', x); el.setAttribute('y', y); el.setAttribute('text-anchor', anchor);
    if (el.textContent !== str) el.textContent = str;
    return el;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 1 · EXACT ↔ f. 16r: a spring drum whose toothed ring drives a cone, evening out the falling force of the spring
// ---------------------------------------------------------------------------------------------------------------
const FUSEE = {
  ring: { cx: 590, cy: 386, rx: 425, ry: 222 },
  big: { cx: 455, cy: 420, rx: 42, ry: 180 }, small: { cx: 1000, cy: 395, rx: 14, ry: 50 },
  wheel: { cx: 1126, cy: 396, rx: 74, ry: 268 },
};
function fuseeOccluded(x, y) {               // inside the cone's silhouette (so ring teeth behind it are hidden)
  const { big, small } = FUSEE;
  if (x < big.cx - big.rx || x > small.cx) return false;
  const t = clamp((x - big.cx) / (small.cx - big.cx));
  const top = big.cy - big.ry + (small.cy - small.ry - (big.cy - big.ry)) * t;
  const bot = big.cy + big.ry + (small.cy + small.ry - (big.cy + big.ry)) * t;
  return y > top - 6 && y < bot + 6;
}
function fuseeMeasure(P) {
  P.line(300, 425, 1255, 393, { at: 0, cls: 'centre' });
  P.line(1126, 92, 1126, 700, { at: 0.05, cls: 'centre' });
  P.dim(455, 240, 455, 600, 'Ø D', { off: 128, at: 0.15, labelSide: -1 });
  P.dim(455, 668, 1000, 668, 'L', { off: -20, at: 0.3 });
  const lead = (dot, mid, tx, ty, s, anchor, at) => {
    P.fill(`M${dot[0] - 4} ${dot[1]}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z`, { at, cls: 'dot' });
    P.poly([dot, mid, [tx, ty - 8]], { at, cls: 'thin' });
    P.text(tx + (anchor === 'end' ? -10 : 10), ty - 2, s, { at: at + 0.05, anchor, cls: 'halo' });
  };
  lead([700, 800], [520, 878], 470, 886, '01 SPRING DRUM', 'end', 0.5);
  lead([760, 318], [760, 120], 760, 120, '02 CONE', 'start', 0.62);
  lead([1160, 610], [1060, 860], 1060, 868, '03 OUTPUT', 'end', 0.74);
}
function fuseeTrace(T) {
  const { ring, big, small, wheel } = FUSEE;
  return (ph) => {
    // the drum
    T.d('drumL', 'M176 420L182 800'); T.d('drumR', 'M986 432L984 786');
    T.d('drumB', 'M182 800Q560 1010 984 786');
    T.d('rimF', 'M176 600Q520 760 986 600', 'thin');
    // the toothed ring (60 teeth in Leonardo's note) turning slowly, teeth behind the cone hidden
    T.d('ring', ell(ring.cx, ring.cy, ring.rx, ring.ry));
    let teeth = '';
    const a0 = ph * TAU * 0.35;
    for (let i = 0; i < 60; i++) {
      const a = a0 + (i / 60) * TAU, c = Math.cos(a), s = Math.sin(a);
      const x1 = ring.cx + ring.rx * c, y1 = ring.cy + ring.ry * s, x2 = ring.cx + (ring.rx + 20) * c, y2 = ring.cy + (ring.ry + 14) * s;
      if (fuseeOccluded(x1, y1) || fuseeOccluded(x2, y2)) continue;
      teeth += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
    T.d('teeth', teeth || 'M0 0');
    // the cone: end faces, silhouette, generators turning (the cone has 6 teeth in his note; it turns 10x the ring)
    T.d('bigEnd', ell(big.cx, big.cy, big.rx, big.ry));
    T.d('smallEnd', ell(small.cx, small.cy, small.rx, small.ry));
    T.d('coneTop', `M${big.cx} ${big.cy - big.ry}L${small.cx} ${small.cy - small.ry}`);
    T.d('coneBot', `M${big.cx} ${big.cy + big.ry}L${small.cx} ${small.cy + small.ry}`);
    let gen = '';
    const b0 = ph * TAU * 3.5;
    for (let j = 0; j < 18; j++) {
      const a = b0 + (j / 18) * TAU;
      if (Math.cos(a) < 0.12) continue;
      const s = Math.sin(a);
      gen += `M${(big.cx + big.rx * Math.cos(a)).toFixed(1)} ${(big.cy + big.ry * s).toFixed(1)}L${(small.cx + small.rx * Math.cos(a)).toFixed(1)} ${(small.cy + small.ry * s).toFixed(1)}`;
    }
    T.d('gen', gen || 'M0 0', 'thin');
    T.d('hub', ell(395, 386, 22, 14));
    T.d('hubPost', 'M378 388L378 520M412 388L412 520');
    // the output wheel and its teeth
    T.d('wheel', ell(wheel.cx, wheel.cy, wheel.rx, wheel.ry));
    T.d('wheelHub', ell(wheel.cx, wheel.cy, 12, 36));
    let wt = '';
    const c0 = -ph * TAU * 0.9;
    for (let i = 0; i < 64; i++) {
      const a = c0 + (i / 64) * TAU, c = Math.cos(a), s = Math.sin(a);
      wt += `M${(wheel.cx + wheel.rx * c).toFixed(1)} ${(wheel.cy + wheel.ry * s).toFixed(1)}L${(wheel.cx + (wheel.rx + 7) * c).toFixed(1)} ${(wheel.cy + (wheel.ry + 18) * s).toFixed(1)}`;
    }
    T.d('wteeth', wt);
    T.d('axis', 'M300 425L1255 393', 'centre');
  };
}

// ---------------------------------------------------------------------------------------------------------------
// 2 · FELT ↔ f. 79v: lock springs; a model spring thick at the root, thin at the tip
// ---------------------------------------------------------------------------------------------------------------
const SPRING_C = [[992, 40], [1058, 86], [1082, 168], [1032, 262], [966, 352], [950, 452], [975, 560], [1030, 648], [1092, 698]];
function springMeasure(P) {
  P.path(smooth(SPRING_C.slice(2)), { at: 0, cls: 'centre' });
  const lead = (dot, mid, tx, ty, s, anchor, at) => {
    P.fill(`M${dot[0] - 4} ${dot[1]}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z`, { at, cls: 'dot' });
    P.poly([dot, mid, [tx, ty - 8]], { at, cls: 'thin' });
    P.text(tx + (anchor === 'end' ? -10 : 10), ty - 2, s, { at: at + 0.05, anchor, cls: 'halo' });
  };
  // thickness ticks across the arm at the root and at the tip
  P.line(1036, 150, 1112, 172, { at: 0.2 }); P.line(1062, 676, 1104, 712, { at: 0.3 });
  lead([1110, 170], [1150, 120], 1150, 40, 'ROOT', 'end', 0.4);
  lead([1100, 704], [1150, 760], 1150, 790, 'TIP', 'end', 0.55);
  lead([954, 430], [984, 486], 984, 486, 'TAPERED ARM', 'start', 0.7);
}
function springTrace(T) {
  const root = SPRING_C[2];
  // other two studies on the sheet, drawn as centre curves (static)
  return (ph) => {
    T.d('aCurve', smooth([[160, 60], [206, 140], [178, 330], [172, 460], [232, 620], [316, 706]]));
    T.d('aBar', poly([[318, 45], [362, 45], [362, 750], [318, 750]], true));
    T.d('aEye', ell(340, 768, 24, 24));
    T.d('bCurve', smooth([[700, 40], [602, 100], [546, 250], [540, 420], [582, 560], [642, 650], [612, 730]]));
    T.d('bBar', poly([[690, 30], [732, 30], [732, 720], [690, 720]], true));
    T.d('bEye', ell(705, 742, 22, 22)); T.d('bEye2', ell(616, 728, 22, 22));
    // the model spring flexes about its root: a pressed key, released
    const k = ph < 0.25 ? ease(ph / 0.25) : Math.exp(-(ph - 0.25) * 6) * Math.cos((ph - 0.25) * TAU * 2.2);
    const ang = -0.16 * k;
    const n = SPRING_C.length;
    const pts = SPRING_C.map((p, i) => (i <= 2 ? p : rot(p, root, ang * Math.pow((i - 2) / (n - 3), 1.6))));
    // offset both sides by a tapering half-thickness
    const half = (i) => (i <= 2 ? 26 : 26 - 20 * ((i - 2) / (n - 3)));
    const L = [], R = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, h = half(i);
      L.push([p[0] + nx * h, p[1] + ny * h]); R.push([p[0] - nx * h, p[1] - ny * h]);
    });
    T.d('cL', smooth(L)); T.d('cR', smooth(R));
    T.d('cTip', poly([L[n - 1], R[n - 1]]));
    T.d('cEye', ell(960, 266, 26, 22)); T.d('cEyeIn', ell(958, 266, 8, 7));
    T.d('cCentre', smooth(pts.slice(2)), 'centre');
    // deflection: rest tip -> current tip
    const rest = SPRING_C[n - 1], tip = pts[n - 1];
    T.d('rest', `M${rest[0] - 14} ${rest[1]}h28M${rest[0]} ${rest[1] - 14}v28`, 'thin');
    const dd = Math.hypot(tip[0] - rest[0], tip[1] - rest[1]);
    T.d('defl', dd > 4 ? `M${rest[0]} ${rest[1]}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}` : 'M0 0');
    T.text('dlabel', rest[0] + 24, rest[1] + 52, dd > 4 ? 'δ' : '', 'start');
  };
}

// ---------------------------------------------------------------------------------------------------------------
// 3 · PROVEN ↔ f. 4v: an instrument for measuring the force of a screw drive
// ---------------------------------------------------------------------------------------------------------------
const NOTCH = [[818, 112], [868, 128], [906, 140], [944, 152]];   // Leonardo's o, m, n, r
function gaugeMeasure(P) {
  P.line(752, 92, 975, 170, { at: 0, cls: 'centre' });
  const lead = (dot, mid, tx, ty, s, anchor, at) => {
    P.fill(`M${dot[0] - 4} ${dot[1]}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z`, { at, cls: 'dot' });
    P.poly([dot, mid, [tx, ty - 8]], { at, cls: 'thin' });
    P.text(tx + (anchor === 'end' ? -10 : 10), ty - 2, s, { at: at + 0.05, anchor, cls: 'halo' });
  };
  lead([112, 470], [210, 500], 210, 508, '01 LOAD', 'start', 0.2);
  lead([640, 112], [600, -40], 600, -40, '02 SCREW', 'end', 0.4);
  lead([906, 226], [960, 330], 960, 338, '03 NOTCHED ARM', 'start', 0.6);
}
function gaugeTrace(T) {
  return (ph) => {
    // the frame
    T.d('legL', 'M356 262L356 512M420 270L420 516M356 262L420 270');
    T.d('legR', 'M760 86L760 402M812 84L812 406M760 86L812 84');
    T.d('rail1', 'M360 262L792 150'); T.d('rail2', 'M420 330L790 236');
    // the screw: its thread turns
    T.d('screwT', 'M470 116L792 72'); T.d('screwB', 'M470 162L792 106');
    let th = '';
    for (let i = 0; i < 15; i++) {
      const t = ((i + ph * 6) % 15) / 15, x1 = 470 + t * 322, y1 = 116 - t * 44, y2 = 162 - t * 56;
      th += `M${x1.toFixed(1)} ${y1.toFixed(1)}L${(x1 + 14).toFixed(1)} ${y2.toFixed(1)}`;
    }
    T.d('thread', th, 'thin');
    T.d('nut', ell(535, 140, 20, 34));
    // load: rope over the pulley, rising as the screw winds
    const lift = 34 * ease(clamp(ph * 1.3));
    T.d('rope', `M488 138L132 226M107 240L107 ${(412 - lift).toFixed(1)}`, 'thin');
    T.d('pulley', ell(130, 240, 26, 26)); T.d('pin', ell(130, 240, 5, 5));
    T.d('bell', poly([[92, 418 - lift], [124, 418 - lift], [166, 500 - lift], [58, 500 - lift]], true));
    // the arm and its notches; the counterweight steps o -> m -> n -> r
    T.d('arm', 'M752 92L975 170M750 104L970 182');
    T.d('notches', NOTCH.map(([x, y]) => `M${x} ${y + 6}l-5 -10`).join(''));
    const s = clamp(ph * 1.15) * 3, i0 = Math.floor(Math.min(2.999, s)), f = ease(s - i0);
    const nx = NOTCH[i0][0] + (NOTCH[i0 + 1][0] - NOTCH[i0][0]) * f, ny = NOTCH[i0][1] + (NOTCH[i0 + 1][1] - NOTCH[i0][1]) * f;
    T.d('hook', `M${nx.toFixed(1)} ${(ny + 8).toFixed(1)}L${nx.toFixed(1)} ${(ny + 66).toFixed(1)}`);
    T.d('cw', poly([[nx - 16, ny + 66], [nx + 16, ny + 66], [nx + 22, ny + 110], [nx - 22, ny + 110]], true));
    const ni = Math.min(3, Math.round(s));          // the letter jumps notch to notch, it never slides
    T.text('notch', NOTCH[ni][0] + 8, NOTCH[ni][1] - 22, ['O', 'M', 'N', 'R'][ni], 'start');
  };
}

// ---------------------------------------------------------------------------------------------------------------
// 4 · LOCKED ↔ f. 50r: a chest lock that snaps shut by itself; the key is only needed to open it
// ---------------------------------------------------------------------------------------------------------------
function lockMeasure(P) {
  P.line(577, 40, 577, 1180, { at: 0, cls: 'centre' });
  P.line(200, 333, 960, 333, { at: 0.05, cls: 'centre' });
  const lead = (dot, mid, tx, ty, s, anchor, at) => {
    P.fill(`M${dot[0] - 4} ${dot[1]}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z`, { at, cls: 'dot' });
    P.poly([dot, mid, [tx, ty - 8]], { at, cls: 'thin' });
    P.text(tx + (anchor === 'end' ? -10 : 10), ty - 2, s, { at: at + 0.05, anchor, cls: 'halo' });
  };
  lead([577, 150], [700, 52], 760, 52, '01 BOLT', 'start', 0.25);
  lead([468, 236], [380, 52], 330, 52, '02 SPRING JAWS', 'end', 0.45);
  lead([660, 1000], [760, 1170], 790, 1170, '03 KEYHOLE', 'start', 0.65);
}
function lockTrace(T) {
  const jaw = (side, open) => {           // a jaw: from its pivot up and in to a barbed tip
    const pv = side < 0 ? [423, 566] : [719, 550];
    const pts = side < 0 ? [[423, 566], [436, 420], [446, 262], [478, 214], [532, 204]] : [[719, 550], [708, 420], [700, 262], [672, 214], [624, 204]];
    return pts.map((p) => rot(p, pv, side * -open));
  };
  return (ph) => {
    T.d('plate', 'M116 90H968V1143H116Z');
    T.d('bar', 'M259 322H894V344H259Z');
    T.d('rodL', 'M298 196L286 860M318 196L306 860M307 127L332 196L307 180L282 196Z');
    T.d('rodR', 'M852 196L864 860M872 196L884 860M862 127L887 196L862 180L837 196Z');
    // the bolt drops into the jaws; they spring apart as the arrowhead passes, then snap shut behind it
    const dy = -170 * (1 - ease(clamp(ph / 0.62)));
    const passing = clamp((ph - 0.3) / 0.3);
    const open = ph < 0.62 ? 0.12 * Math.sin(passing * Math.PI) : 0;
    const L = jaw(-1, open), R = jaw(1, open);
    T.d('jawL', smooth(L)); T.d('jawR', smooth(R));
    T.d('barbs', `M${L[4][0]} ${L[4][1]}l-14 22M${R[4][0]} ${R[4][1]}l14 22`);
    T.d('pivots', ell(423, 566, 17, 17) + ell(719, 550, 17, 17) + ell(540, 572, 15, 15));
    T.d('bolt', `M566 ${230 + dy}L566 ${878}M588 ${230 + dy}L588 878M577 ${127 + dy}L624 ${206 + dy}L577 ${186 + dy}L530 ${206 + dy}Z`);
    T.d('keyhole', ell(577, 984, 122, 95));
    T.d('key', 'M577 940L577 1010M560 1010H594', 'thin');
    T.text('state', 760, 220, ph >= 0.64 ? 'SHUT' : '', 'start');
  };
}

export const STUDIES = [
  { key: 'exact', src: 'media/davinci/madrid1-f016r-fusee.webp', W: 1276, H: 925, measure: fuseeMeasure, trace: fuseeTrace },
  { key: 'felt', src: 'media/davinci/madrid1-f079v-springs.webp', W: 1200, H: 809, measure: springMeasure, trace: springTrace },
  { key: 'proven', src: 'media/davinci/madrid1-f004v-force-gauge.webp', W: 1200, H: 537, measure: gaugeMeasure, trace: gaugeTrace },
  { key: 'locked', src: 'media/davinci/madrid1-f050r-lock.webp', W: 1037, H: 1200, measure: lockMeasure, trace: lockTrace },
];
export { span };

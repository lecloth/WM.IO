// The history of the phone, 1877 -> today. Each era is a generic form drawn in code in the site's hairline
// language (no logos, no brand names, no copy of any one maker's recognisable design), at a stated drawing scale.
// Years and lines checked against reliable sources (see STATE.md, "Phone history: sources").
// Coordinates are millimetres, y up, origin at the object's centre.

const r = (x, y, w, h, rad = 0) => {           // rounded rect from its centre
  const x0 = x - w / 2, y0 = y - h / 2, R = Math.min(rad, w / 2, h / 2);
  return { rr: [x0, y0, w, h, R] };
};
const L = (...pts) => ({ pl: pts });             // polyline [x,y,...]
const C = (x, y, rad) => ({ el: [x, y, rad, rad] });
const E = (x, y, rx, ry) => ({ el: [x, y, rx, ry] });
const Q = (x0, y0, cx, cy, x1, y1) => ({ q: [x0, y0, cx, cy, x1, y1] });

export const ERAS = [
  { key: 'bell', year: '1877', num: 1877, fig: 'Fig. 1', scale: 'From the patent',
    line: 'You spoke into the tube; a magnet and coil carried your voice.' },
  { key: 'candlestick', year: 'c. 1900', num: 1900, fig: 'Fig. 2', scale: 'Scale 1:2', s: 0.5,
    line: 'Mouthpiece on a stand, earpiece on a hook. Common for fifty years.',
    shapes: () => [
      E(0, -140, 52, 9), L(-52, -140, -52, -131), L(52, -140, 52, -131), E(0, -131, 50, 8),   // base
      L(-7, -124, -7, 96), L(7, -124, 7, 96), r(0, 99, 22, 7, 2),                             // stem + collar
      r(0, 112, 28, 20, 4), L(14, 106, 46, 94), L(14, 118, 46, 131), E(46, 112.5, 4, 18.5),   // mouthpiece
      L(-7, 72, -27, 76, -29, 86),                                                            // hook
      r(-30, 30, 20, 80, 6), E(-30, -10, 13, 4),                                              // receiver
      Q(-30, -14, -60, -80, -18, -124),                                                       // cord
    ] },
  { key: 'rotary', year: '1920s', num: 1925, fig: 'Fig. 3', scale: 'Scale 1:2', s: 0.5,
    line: 'A finger wheel dials the number. The operator steps aside.',
    shapes: () => {
      const out = [L(-110, -75, 110, -75), L(-110, -75, -86, 24), L(110, -75, 86, 24), Q(-86, 24, 0, 46, 86, 24),
        r(-54, 30, 12, 14, 4), r(54, 30, 12, 14, 4),
        Q(-96, 44, 0, 70, 96, 44), Q(-90, 58, 0, 84, 90, 58), C(-98, 46, 15), C(98, 46, 15),
        C(0, -24, 38), C(0, -24, 13)];
      for (let i = 0; i < 10; i++) { const a = (60 + i * 27) * Math.PI / 180; out.push(C(Math.cos(a) * 26, -24 + Math.sin(a) * 26, 5)); }
      out.push(L(33, -44, 40, -50));
      return out;
    } },
  { key: 'push', year: '1963', num: 1963, fig: 'Fig. 4', scale: 'Scale 1:2', s: 0.5,
    line: 'Ten push-buttons and tones replace the dial, first offered in Pennsylvania.',
    shapes: () => {
      const out = [L(-108, -60, 108, -60, 98, 28, -98, 28, -108, -60), r(0, 41, 206, 20, 9), C(-92, 41, 14), C(92, 41, 14)];
      [[-26, 8], [0, 8], [26, 8], [-26, -10], [0, -10], [26, -10], [-26, -28], [0, -28], [26, -28], [0, -46]].forEach(([x, y]) => out.push(r(x, y, 18, 12, 3)));
      return out;
    } },
  { key: 'brick', year: '1973', num: 1973, fig: 'Fig. 5', scale: 'Scale 1:2', s: 0.5,
    line: 'The first handheld mobile call, made on a New York street.',
    shapes: () => {
      const out = [r(0, -25, 45, 200, 5), r(12, 100, 8, 50, 2), r(0, 36, 30, 12, 1.5), L(-8, 60, 8, 60), L(-8, 64, 8, 64), L(-8, 56, 8, 56), L(-6, -112, 6, -112)];
      for (let row = 0; row < 5; row++) for (let col = -1; col <= 1; col++) out.push(r(col * 12, 16 - row * 14, 9, 6, 1.5));
      return out;
    } },
  { key: 'candybar', year: '1992', num: 1992, fig: 'Fig. 6', scale: 'Scale 1:1', s: 1,
    line: 'Pocket phones with keypads. The first text message reads “Merry Christmas”.',
    shapes: () => {
      const out = [r(0, -3, 46, 116, 9), r(13.5, 62, 7, 15, 2), r(0, 28, 32, 26, 2), L(-6, 48, 6, 48), r(-14, 9, 9, 4, 1.5), r(14, 9, 9, 4, 1.5), C(0, 9, 3.5)];
      for (let row = 0; row < 4; row++) for (let col = -1; col <= 1; col++) out.push(r(col * 12, -3 - row * 10, 9, 5.5, 2));
      out.push(L(-3, -51, 3, -51));
      return out;
    } },
  { key: 'touch', year: '1994', num: 1994, fig: 'Fig. 7', scale: 'Scale 1:2', s: 0.5,
    line: 'A touchscreen phone that ran apps: email, a calendar, a sketch pad.',
    shapes: () => [r(0, 0, 64, 200, 6), r(0, 7, 50, 126, 2), r(23, 104, 6, 10, 1.5), L(-10, 88, 10, 88), L(-10, 84, 10, 84), L(-10, 92, 10, 92), r(-12, -72, 14, 6, 2), r(12, -72, 14, 6, 2), L(-5, -92, 5, -92)] },
  { key: 'glass', year: '2007', num: 2007, fig: 'Fig. 8', scale: 'Scale 1:1', s: 1,
    line: 'Multi-touch glass. The keypad disappears into the screen.',
    shapes: () => [r(0, 0, 61, 115, 9), r(0, -1, 54, 90, 2), r(0, 51, 12, 2.4, 1.2), L(-4, -51, 4, -51), L(31.2, 28, 31.2, 36), L(-31.2, 30, -31.2, 40)] },
  { key: 'today', year: 'Today', num: 2026, fig: 'Fig. 9', scale: 'Scale 1:1', s: 1,
    line: 'A computer, a camera and a till, in one pocket.' },
];

/** turn shapes into SVG path data in screen px: X = cx + x*k*s, Y = cy - y*k*s */
export function toPaths(shapes, cx, cy, ks) {
  const X = (x) => cx + x * ks, Y = (y) => cy - y * ks;
  return shapes.map((sh) => {
    if (sh.rr) {
      const [x0, y0, w, h, R] = sh.rr, x = X(x0), y = Y(y0 + h), W = w * ks, H = h * ks, rr = R * ks;
      return `M${x + rr} ${y}H${x + W - rr}Q${x + W} ${y} ${x + W} ${y + rr}V${y + H - rr}Q${x + W} ${y + H} ${x + W - rr} ${y + H}H${x + rr}Q${x} ${y + H} ${x} ${y + H - rr}V${y + rr}Q${x} ${y} ${x + rr} ${y}Z`;
    }
    if (sh.pl) { const p = sh.pl; let d = `M${X(p[0])} ${Y(p[1])}`; for (let i = 2; i < p.length; i += 2) d += `L${X(p[i])} ${Y(p[i + 1])}`; return d; }
    if (sh.el) { const [x, y, rx, ry] = sh.el; const a = X(x) - rx * ks, b = Y(y); return `M${a} ${b}a${rx * ks} ${ry * ks} 0 1 0 ${2 * rx * ks} 0a${rx * ks} ${ry * ks} 0 1 0 ${-2 * rx * ks} 0Z`; }
    if (sh.q) { const [x0, y0, qx, qy, x1, y1] = sh.q; return `M${X(x0)} ${Y(y0)}Q${X(qx)} ${Y(qy)} ${X(x1)} ${Y(y1)}`; }
    return '';
  });
}

// NIGHTWELL: a made-up observatory's telescope-time booking site (concept product, not a client).
// A live all-sky map (alt-azimuth, zenith in the centre) with the three telescopes' pointings and tonight's queue,
// beside the booking: the night as a timeline, the telescopes, the request. Dark, as anything used at night must be;
// night-vision red only on hover. The stars are generated, not a real sky. 1440 x 900.
import { DARK, mono, serif, rng, begin, end, txt, tw, line, rect, dot, hatch, button } from './kit.js';

const W = 1440, H = 900;
const T = DARK;

/** map label on a dark backing so stars never run through the text */
function tag(c, x, y, a, b, col, align = 'left') {
  const wa = tw(c, a, mono(10.5, 500)), wb = b ? tw(c, b, mono(10)) : 0, w = Math.max(wa, wb) + 12, h = b ? 36 : 20;
  const x0 = align === 'center' ? x - w / 2 : x - 6;
  c.fillStyle = 'rgba(15,15,14,.92)'; c.fillRect(x0, y - 14, w, h);
  txt(c, a, x0 + 6, y, mono(10.5, 500), col);
  if (b) txt(c, b, x0 + 6, y + 16, mono(10), T.dim);
}

export function drawNightwell(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#E5484D';
  const ACC = accent ? A : T.hi;

  // ---- nav ----
  txt(c, 'NIGHTWELL', 48, 45, serif(26, 600), T.ink);
  txt(c, 'OBSERVATORY', 48 + tw(c, 'NIGHTWELL', serif(26, 600)) + 14, 44, mono(10.5), T.dim, 'left', 1);
  [['TELESCOPES', 0], ['TONIGHT', 1], ['DATA ARCHIVE', 0], ['VISITING', 0]].forEach(([t, on], i) => {
    const x = 560 + i * 140;
    txt(c, t, x, 44, mono(12, 500), on ? T.ink : T.dim);
    if (on) line(c, x, 54, x + 56, 54, T.ink, 1.5);
  });
  txt(c, 'SIGN IN', 1240, 44, mono(12, 500), T.dim, 'right');
  rect(c, 1268.5, 22.5, 124, 34, { stroke: T.ink, r: 6 });
  txt(c, 'BOOK TIME', 1330.5, 44, mono(12, 500), T.ink, 'center');
  line(c, 0, 76, W, 76, T.line);

  // ---- live sky map ----
  const cx = 440, cy = 488, R = 356;
  txt(c, 'LIVE SKY', 48, 112, mono(11, 500), T.ink);
  txt(c, 'ALT-AZ · ZENITH AT CENTRE', 48, 130, mono(10), T.dim);
  txt(c, 'LST 02:13:40', 48, 148, mono(10), T.dim);
  c.save();
  c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fillStyle = '#0F0F0E'; c.fill(); c.clip();
  // azimuth spokes and altitude rings
  c.strokeStyle = '#1C1C1B'; c.lineWidth = 1;
  for (let a = 0; a < 360; a += 30) { const t = (a - 90) * Math.PI / 180; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(t) * R, cy + Math.sin(t) * R); c.stroke(); }
  [30, 60].forEach((alt) => { c.beginPath(); c.arc(cx, cy, R * (90 - alt) / 90, 0, Math.PI * 2); c.setLineDash([2, 5]); c.strokeStyle = T.line2; c.stroke(); c.setLineDash([]); });
  // stars: a scatter plus a denser band, generated
  const r = rng(90121);
  const star = (x, y, m) => { const s = 0.35 + Math.pow(m, 3.2) * 2.3; c.fillStyle = m > 0.8 ? '#F2F0EB' : m > 0.5 ? '#B9B7B1' : '#77766F'; c.beginPath(); c.arc(x, y, s, 0, Math.PI * 2); c.fill(); };
  for (let i = 0; i < 900; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; star(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r()); }
  for (let i = 0; i < 1300; i++) {
    const t = r() * 2 - 1, g = (r() + r() + r() - 1.5) * 46;
    const bx = cx + t * R * 1.05, by = cy - 30 + Math.sin(t * 1.5) * R * 0.42;
    const nx = -Math.cos(t * 1.5) * 0.6, len = Math.hypot(1, nx);
    star(bx + (nx / len) * g * -1 * 0.4, by + (1 / len) * g, r() * 0.7);
  }
  // a cloud bank low in the south-east
  c.save(); c.beginPath();
  c.ellipse(cx + 210, cy + 250, 150, 60, -0.6, 0, Math.PI * 2); c.clip();
  hatch(c, cx + 40, cy + 150, 340, 220, '#3B3B38', 5, 1);
  c.restore();
  c.restore();
  // horizon, ticks and cardinal points (east on the left, as when looking up)
  dot(c, cx, cy, R, null, T.ink, 1.2);
  for (let a = 0; a < 360; a += 5) {
    const t = (a - 90) * Math.PI / 180, k = a % 30 === 0 ? 10 : 4;
    line(c, cx + Math.cos(t) * R, cy + Math.sin(t) * R, cx + Math.cos(t) * (R + k), cy + Math.sin(t) * (R + k), T.dim, 1);
  }
  txt(c, 'N', cx, cy - R - 18, mono(12, 500), T.ink, 'center');
  txt(c, 'S', cx, cy + R + 28, mono(12, 500), T.ink, 'center');
  txt(c, 'E', cx - R - 24, cy + 4, mono(12, 500), T.ink, 'center');
  txt(c, 'W', cx + R + 24, cy + 4, mono(12, 500), T.ink, 'center');
  txt(c, '60°', cx + 6, cy - R / 3 + 14, mono(9), T.dim);
  txt(c, '30°', cx + 6, cy - (2 * R) / 3 + 14, mono(9), T.dim);
  tag(c, cx + 214, cy + 254, 'CLOUD · 8%', null, T.ink, 'center');
  // the moon, low in the west-south-west, 23% lit
  const mxp = cx + 250, myp = cy + 40;
  dot(c, mxp, myp, 11, '#2A2A28');
  c.save(); c.beginPath(); c.arc(mxp, myp, 11, 0, Math.PI * 2); c.clip();
  c.fillStyle = T.ink; c.beginPath(); c.arc(mxp, myp, 11, -Math.PI / 2, Math.PI / 2); c.ellipse(mxp, myp, 6, 11, 0, Math.PI / 2, -Math.PI / 2, false); c.fill(); c.restore();
  dot(c, mxp, myp, 11, null, T.ink, 1);
  tag(c, mxp + 22, myp + 4, 'MOON 23%', 'SETS 23:40', T.ink);

  // tonight's queue on T2, as a path across the sky
  const P = [[cx - 150, cy - 120], [cx - 30, cy - 70], [cx + 60, cy - 160], [cx + 150, cy - 40]];
  c.strokeStyle = ACC; c.lineWidth = 1.2; c.setLineDash([3, 5]);
  c.beginPath(); c.moveTo(...P[0]); for (let i = 1; i < P.length; i++) { const m = [(P[i - 1][0] + P[i][0]) / 2, (P[i - 1][1] + P[i][1]) / 2 - 30]; c.quadraticCurveTo(...m, ...P[i]); } c.stroke(); c.setLineDash([]);
  P.forEach(([x, y], i) => { if (i === 1) return; dot(c, x, y, 8, T.bg, T.ink, 1); txt(c, String(i + 1), x, y + 3.5, mono(9, 500), T.ink, 'center'); });
  // telescope reticles
  const ret = (x, y, col, rr = 12) => {
    dot(c, x, y, rr, null, col, 1.4);
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([u, v]) => line(c, x + u * (rr - 5), y + v * (rr - 5), x + u * (rr + 6), y + v * (rr + 6), col, 1.4));
  };
  ret(P[1][0], P[1][1], ACC, 14);
  tag(c, P[1][0] + 28, P[1][1] - 4, 'T2 · FIELD 18', 'TRACKING · ALT 64°', T.ink);
  ret(cx - 220, cy + 120, T.ink);
  tag(c, cx - 194, cy + 124, 'T1 · SURVEY STRIP 4', 'IMAGING', T.ink);
  ret(cx + 80, cy + 170, T.dim);
  tag(c, cx + 106, cy + 174, 'T3 · SLEWING', 'TO FIELD 22', T.dim);

  // conditions
  [['SEEING', '0.9″'], ['WIND', '3 m/s'], ['HUMIDITY', '34%'], ['SKY', '21.4 mag/″²']].forEach(([k, v], i) => {
    txt(c, k, 48, 790 + i * 20, mono(10), T.dim);
    txt(c, v, 132, 790 + i * 20, mono(10.5, 500), T.ink);
  });

  // ---- booking ----
  const bx = 880, bw = 512;
  txt(c, 'TONIGHT · ASTRONOMICAL DARK 19:02–05:11', bx, 128, mono(11), T.dim);
  txt(c, 'Book an hour', bx, 184, serif(50, 500), T.ink);
  txt(c, 'of dark sky.', bx, 236, serif(50, 500), T.ink);
  txt(c, 'Moon 23%, setting at 23:40. Seeing is good tonight,', bx, 282, serif(19, 400), T.dim);
  txt(c, 'and three hours are still free on the spectrograph.', bx, 308, serif(19, 400), T.dim);

  // the night as a timeline, 18:00 to 06:00 on T2
  txt(c, 'THE NIGHT · T2', bx, 360, mono(11, 500), T.ink);
  txt(c, '3 H FREE', bx + bw, 360, mono(11), T.dim, 'right');
  const tx = (h) => bx + ((h < 12 ? h + 24 : h) - 18) / 12 * bw, ty = 378, th = 40;
  hatch(c, tx(18), ty, tx(19.03) - tx(18), th, T.line2, 4); hatch(c, tx(5.18), ty, tx(6) - tx(5.18), th, T.line2, 4);
  [[19.03, 21, 'PROG 31'], [21, 23, 'PROG 07'], [2, 4, 'PROG 12']].forEach(([a, b, l]) => {
    rect(c, tx(a) + 1, ty, tx(b) - tx(a) - 2, th, { fill: '#2A2A28' });
    txt(c, l, tx(a) + 8, ty + 24, mono(10), T.dim);
  });
  [[23, 24], [0, 1], [4, 5.18]].forEach(([a, b]) => rect(c, tx(a) + 1.5, ty + 0.5, tx(b) - tx(a) - 3, th - 1, { stroke: T.line2 }));
  rect(c, tx(1) + 1, ty, tx(2) - tx(1) - 2, th, { fill: accent ? 'rgba(229,72,77,.22)' : '#1E1E1D', stroke: ACC, lw: 1.5 });
  txt(c, 'YOU', tx(1) + 8, ty + 24, mono(10, 500), ACC);
  line(c, tx(18), ty + th + 8, tx(23.67), ty + th + 8, T.dim, 1); txt(c, 'MOON UP', tx(18), ty + th + 22, mono(9), T.dim);
  [18, 20, 22, 0, 2, 4, 6].forEach((h) => { const x = tx(h === 6 ? 5.999 : h); line(c, x, ty - 4, x, ty, T.dim); if (h !== 18 && h !== 6) txt(c, String(h).padStart(2, '0'), x, ty + th + 22, mono(9.5), T.dim, 'center'); });

  // telescopes
  const TS = [['T1', 'Refractor 0.4 m', 'Wide-field imaging', '2 H FREE'], ['T2', 'Reflector 0.8 m', 'Long-slit spectrograph', '3 H FREE'], ['T3', 'Reflector 1.2 m', 'Adaptive optics', 'FULL']];
  let y = 476;
  TS.forEach(([id, a, b, f], i) => {
    line(c, bx, y, bx + bw, y, T.line2);
    if (i === 1) { c.fillStyle = '#141413'; c.fillRect(bx, y + 1, bw, 59); line(c, bx, y + 1, bx, y + 60, ACC, 2); }
    txt(c, id, bx + 16, y + 38, serif(26, 600), i === 2 ? T.dim : T.ink);
    txt(c, a, bx + 72, y + 27, serif(18, 500), i === 2 ? T.dim : T.ink);
    txt(c, b.toUpperCase(), bx + 72, y + 46, mono(10), T.dim);
    txt(c, f, bx + bw - 16, y + 36, mono(11, 500), i === 2 ? T.dim : T.ink, 'right');
    y += 60;
  });
  line(c, bx, y, bx + bw, y, T.line2);

  // the request
  txt(c, 'YOUR REQUEST', bx, 698, mono(11, 500), T.ink);
  txt(c, 'T2 · 01:00–02:00 · Field 18, 3 × 900 s', bx, 728, serif(20, 500), T.ink);
  txt(c, 'MID-SLOT ALT 64° · AIRMASS 1.11 · 4 OF 12 HOURS THIS TERM', bx, 752, mono(10), T.dim);
  button(c, bx, 788, bw, 52, 'HOLD 01:00–02:00 ON T2', { fill: ACC, color: T.bg, r: 8 });
  txt(c, 'HELD FOR 15 MIN · CONFIRMED BY THE NIGHT ASSISTANT', bx + bw / 2, 864, mono(9.5), T.dim, 'center');
  end(c);
}

export const NIGHTWELL = {
  id: 'nightwell', name: 'NIGHTWELL', kind: 'Telescope-time booking site', desc: "an observatory's telescope-time booking site", industry: 'Science',
  form: 'web', accent: '#E5484D', w: W, h: H, theme: 'dark',
  draw: drawNightwell,
};

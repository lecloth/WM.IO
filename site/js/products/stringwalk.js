// STRINGWALK: a made-up solar-farm field app (concept product, not a client).
// The field technician's phone, out in full sun (so a light screen): panel health across the block as a heat map,
// today's output against the forecast, and the cleaning robots' schedule. Field green only on hover. 390 x 844.
import { LIGHT, mono, serif, rng, begin, end, txt, line, rect, dot, hatch, statusBar, phoneHeader, section, meter, smooth, button } from './kit.js';

const W = 390, H = 844;
const T = LIGHT;

export function drawStringwalk(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#19A35B';
  const ACC = accent ? A : T.ink;

  statusBar(c, T, '11:06');
  phoneHeader(c, T, 'STRINGWALK', 'FIELD · BLOCK 3 · INVERTERS 7–12', '912 W/m²', ACC);

  // ---- panel health heat map ----
  const mx = 16, my = 120, mw = 358, mh = 252;
  rect(c, mx + 0.5, my + 0.5, mw - 1, mh - 1, { fill: T.panel, stroke: T.line2, r: 14 });
  const rows = 12, per = 11, lx = mx + 40, road = 12, cw = (mw - 40 - 14 - road) / (per * 2), ch = 11, pitch = 16.5, y0 = my + 18;
  const r = rng(30611);
  const shade = (v) => (v > 0.94 ? '#ECEAE4' : v > 0.86 ? '#CFCDC6' : v > 0.75 ? '#9C9B96' : '#3B3B38');
  for (let j = 0; j < rows; j++) {
    const y = y0 + j * pitch;
    txt(c, `R${String(j + 1).padStart(2, '0')}`, mx + 12, y + 9, mono(9, 500), j === 8 ? T.ink : T.dim);
    for (let i = 0; i < per * 2; i++) {
      const x = lx + i * cw + (i >= per ? road : 0);
      let v = 0.9 + r() * 0.12;
      const soiled = (j >= 4 && j <= 6 && i > 13);                  // dust band ahead of the robot
      if (soiled) v -= 0.12;
      const hot = j === 8 && i >= 13 && i <= 16;
      if (hot) v = 0.7;
      const off = (j === 2 && i === 4) || (j === 10 && (i === 19 || i === 20));
      if (off) { c.strokeStyle = T.ink; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, cw - 2, ch - 1); line(c, x + 1, y + 1, x + cw - 2, y + ch - 1, T.ink, 1); line(c, x + cw - 2, y + 1, x + 1, y + ch - 1, T.ink, 1); continue; }
      c.fillStyle = shade(v); c.fillRect(x, y, cw - 1.5, ch);
      if (soiled) hatch(c, x, y, cw - 1.5, ch, '#8F8E89', 3, 0.7);
      if (hot) { c.fillStyle = accent ? A : T.ink; c.fillRect(x, y, cw - 1.5, ch); }
    }
  }
  // access road
  const rx = lx + per * cw + road / 2 - 0.75;
  line(c, rx, y0 - 8, rx, y0 + rows * pitch - 4, T.line2, 1, [2, 3]);
  // the robot, part-way along R06, moving right
  const ry = y0 + 5 * pitch, rxp = lx + 9 * cw;
  rect(c, rxp - 3, ry - 3, 12, ch + 6, { fill: ACC, r: 2 });
  c.fillStyle = ACC; c.beginPath(); c.moveTo(rxp + 14, ry + ch / 2); c.lineTo(rxp + 10, ry + ch / 2 - 4); c.lineTo(rxp + 10, ry + ch / 2 + 4); c.closePath(); c.fill();
  // hotspot callout
  const hx0 = lx + 13 * cw + road, hx1 = lx + 17 * cw + road - 1.5, hy = y0 + 8 * pitch;
  rect(c, hx0 - 2.5, hy - 2.5, hx1 - hx0 + 5, ch + 5, { stroke: ACC, lw: 1.5 });
  line(c, (hx0 + hx1) / 2, hy + ch + 3, (hx0 + hx1) / 2, my + mh - 30, T.ink, 1);
  dot(c, (hx0 + hx1) / 2, my + mh - 30, 2, T.ink);
  txt(c, 'R09 · T14–T17 · −18% · HOTSPOT', mx + mw - 14, my + mh - 14, mono(10, 500), T.ink, 'right');
  txt(c, 'N ↑', mx + 12, my + mh - 14, mono(9.5, 500), T.dim);

  // legend
  let x = 24; const ly = 398;
  [['OK', (X) => { c.fillStyle = '#ECEAE4'; c.fillRect(X, ly - 8, 10, 8); c.strokeStyle = T.line2; c.strokeRect(X + 0.5, ly - 7.5, 9, 7); }],
   ['SOILED', (X) => { c.fillStyle = '#CFCDC6'; c.fillRect(X, ly - 8, 10, 8); hatch(c, X, ly - 8, 10, 8, '#8F8E89', 3, 0.7); }],
   ['WEAK', (X) => { c.fillStyle = '#9C9B96'; c.fillRect(X, ly - 8, 10, 8); }],
   ['HOTSPOT', (X) => { c.fillStyle = accent ? A : T.ink; c.fillRect(X, ly - 8, 10, 8); }],
   ['OFF', (X) => { c.strokeStyle = T.ink; c.lineWidth = 1; c.strokeRect(X + 0.5, ly - 7.5, 9, 7); line(c, X + 1, ly - 7, X + 9, ly - 1, T.ink); }],
   ['ROBOT', (X) => { c.fillStyle = ACC; c.fillRect(X, ly - 8, 10, 8); }]]
    .forEach(([t, sw]) => { sw(x); txt(c, t, x + 14, ly, mono(9.5), T.dim); c.font = mono(9.5); x += 14 + c.measureText(t).width + 12; });

  // ---- output curve ----
  section(c, T, 24, 366, 440, 'OUTPUT TODAY', '41.8 MW · 96% OF FORECAST');
  const gx0 = 24, gx1 = 340, gy0 = 458, gy1 = 566;
  const X = (h) => gx0 + ((h - 5) / 16) * (gx1 - gx0), Y = (v) => gy1 - (v / 50) * (gy1 - gy0);
  [20, 40].forEach((v) => { line(c, gx0, Y(v), gx1, Y(v), T.line, 1); txt(c, `${v}`, 366, Y(v) + 3.5, mono(9), T.dim, 'right'); });
  txt(c, 'MW', 366, gy1 + 3.5, mono(9), T.dim, 'right');
  line(c, gx0, gy1, gx1, gy1, T.ink, 1);
  [6, 9, 12, 15, 18, 21].forEach((h) => { line(c, X(h), gy1, X(h), gy1 + 4, T.ink); txt(c, String(h).padStart(2, '0'), X(h), gy1 + 17, mono(9), T.dim, 'center'); });
  const fc = (h) => 46 * Math.exp(-Math.pow((h - 13.4) / 3.4, 2));
  const pf = []; for (let h = 5.5; h <= 20.6; h += 0.25) pf.push([X(h), Y(fc(h))]);
  c.beginPath(); smooth(c, pf); c.strokeStyle = T.dim; c.lineWidth = 1.2; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
  const now = 11.1, act = (h) => fc(h) * (0.97 - 0.22 * Math.exp(-Math.pow((h - 10.2) / 0.35, 2)));
  const pa = []; for (let h = 5.5; h <= now; h += 0.1) pa.push([X(h), Y(act(h))]);
  c.beginPath(); c.moveTo(pa[0][0], gy1); pa.forEach(([a, b]) => c.lineTo(a, b)); c.lineTo(pa[pa.length - 1][0], gy1); c.closePath();
  c.fillStyle = 'rgba(18,18,18,.06)'; c.fill();
  c.beginPath(); smooth(c, pa); c.strokeStyle = T.ink; c.lineWidth = 1.8; c.stroke();
  const nx = pa[pa.length - 1][0], ny = pa[pa.length - 1][1];
  line(c, nx, gy0 - 6, nx, gy1, T.ink, 1, [2, 3]);
  dot(c, nx, ny, 4, ACC, T.bg, 2);
  txt(c, 'NOW 11:06', nx + 6, gy0 + 2, mono(9, 500), T.ink);
  txt(c, 'FORECAST', X(16.2), Y(fc(16.2)) - 8, mono(9), T.dim);
  txt(c, 'CLOUD', X(10.2), Y(act(10.2)) + 16, mono(9), T.dim, 'center');

  // ---- cleaning robots ----
  section(c, T, 24, 366, 620, 'CLEANING ROBOTS', '2 OF 3 RUNNING');
  const R = [
    { id: 'CR-2', job: 'ROWS 05–07 · CLEANING', v: 0.62, a: '62%', b: 'DONE 12:40' },
    { id: 'CR-5', job: 'ROWS 09–10 · QUEUED', v: 0, a: 'NEXT', b: 'START 13:30' },
    { id: 'CR-1', job: 'DOCK B · CHARGING', v: 0.84, a: '84%', b: 'WIND LIMIT 12 m/s' },
  ];
  let y = 632;
  R.forEach((q, i) => {
    line(c, 24, y, 366, y, T.line2);
    txt(c, q.id, 24, y + 22, serif(15, 600), T.ink);
    txt(c, q.job, 84, y + 21, mono(10), T.dim);
    txt(c, q.a, 366, y + 21, mono(11, 500), T.ink, 'right');
    if (q.v > 0) meter(c, 84, y + 30, 128, 7, q.v, T, i === 0 ? ACC : T.ink);
    else { c.strokeStyle = T.dim; c.lineWidth = 1; c.setLineDash([2, 3]); c.strokeRect(84.5, y + 30.5, 128, 7); c.setLineDash([]); }
    txt(c, q.b, 366, y + 37, mono(10), T.dim, 'right');
    y += 44;
  });
  line(c, 24, y, 366, y, T.line2);

  // ---- action ----
  button(c, 24, 770, 342, 50, 'SEND CREW TO R09 · T14', { fill: ACC, color: T.panel, r: 12 });
  end(c);
}

export const STRINGWALK = {
  id: 'stringwalk', name: 'STRINGWALK', kind: 'Solar-farm field app', desc: 'a solar-farm field app', industry: 'Energy',
  form: 'phone', accent: '#19A35B', w: W, h: H, theme: 'light',
  flow: { steps: ['OPEN', 'HEAT MAP', 'PICK A FAULT', 'CHECK SAFETY', 'SEND CREW', 'CLOSE OUT'], hold: [3, 1, 'UNSAFE'] },
  draw: drawStringwalk,
};

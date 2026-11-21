// QUAYCALL: a made-up container-port operations app (concept product, not a client).
// The shift supervisor's phone: the berth plan with ships alongside and cranes working, the next arrival's countdown,
// the yard map and the crane queues. Dark screen; crane yellow only on hover. Logical size 390 x 844.
import { DARK, mono, serif, rng, begin, end, txt, line, rect, dot, statusBar, phoneHeader, section, meter } from './kit.js';

const W = 390, H = 844;
const T = DARK;

/** top-down hull: stern at x, bow pointing right, beam spanning y .. y + b */
function hull(c, x, y, len, b) {
  c.beginPath();
  c.moveTo(x + 3, y); c.lineTo(x + len * 0.8, y);
  c.quadraticCurveTo(x + len * 0.97, y + b * 0.08, x + len, y + b / 2);
  c.quadraticCurveTo(x + len * 0.97, y + b * 0.92, x + len * 0.8, y + b);
  c.lineTo(x + 3, y + b); c.quadraticCurveTo(x, y + b, x, y + b - 3); c.lineTo(x, y + 3); c.quadraticCurveTo(x, y, x + 3, y);
  c.closePath();
}

function ship(c, x, y, len, b, done, seed, ACC) {
  hull(c, x, y, len, b); c.fillStyle = T.deep; c.fill(); c.strokeStyle = T.ink; c.lineWidth = 1.2; c.stroke();
  // bays: three rows of container stacks; the first `done` of them already discharged
  const r = rng(seed), cols = Math.floor((len * 0.78 - 22) / 6.5), rows = 3, ch = (b - 8) / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = x + 22 + i * 6.5, cy = y + 4 + j * ch;
      if (i / cols < done) { c.strokeStyle = T.line2; c.lineWidth = 0.8; c.strokeRect(cx + 0.4, cy + 0.4, 5, ch - 1.4); }
      else { c.fillStyle = r() > 0.15 ? '#6E6D69' : '#4A4A47'; c.fillRect(cx, cy, 5.6, ch - 1); }
    }
  }
  // bridge, near the stern
  c.fillStyle = T.ink; c.fillRect(x + 8, y + 3, 7, b - 6);
}

function crane(c, x, quayY, reachY, trolley, id, ACC, parked = false) {
  const col = parked ? T.faint : T.ink;
  // legs on the rails
  c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(x - 5.5, quayY + 6.5, 11, 22);
  // boom, out over the ship
  line(c, x, quayY + 28, x, reachY, col, 2);
  line(c, x - 3, reachY, x + 3, reachY, col, 2);
  if (!parked) { c.fillStyle = ACC; c.fillRect(x - 3.5, trolley - 3.5, 7, 7); }
  txt(c, id, x, reachY - 6, mono(9, 500), col, 'center');
}

export function drawQuaycall(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#FFC400';
  const ACC = accent ? A : T.hi;

  statusBar(c, T, '05:48');
  phoneHeader(c, T, 'QUAYCALL', 'TERMINAL 4 · NORTH QUAY · SHIFT B', 'LIVE', ACC);

  // ---- berth plan ----
  const mx = 16, my = 120, mw = 358, mh = 212, qy = my + 150;
  c.save();
  c.beginPath(); c.roundRect(mx, my, mw, mh, 14); c.clip();
  c.fillStyle = T.panel; c.fillRect(mx, my, mw, mh);
  // swell lines on the water
  c.strokeStyle = '#1B1B1A'; c.lineWidth = 1;
  for (let i = 0; i < 9; i++) { const y = my + 14 + i * 14; c.beginPath(); c.moveTo(mx, y); for (let x = 0; x <= mw; x += 18) c.lineTo(mx + x, y + Math.sin(x * 0.05 + i) * 1.2); c.stroke(); }
  // apron, quay edge, crane rails, bollards
  c.fillStyle = '#191918'; c.fillRect(mx, qy, mw, mh - 150);
  line(c, mx, qy, mx + mw, qy, T.ink, 1.5);
  line(c, mx, qy + 8, mx + mw, qy + 8, T.line2, 1); line(c, mx, qy + 27, mx + mw, qy + 27, T.line2, 1);
  for (let x = mx + 10; x < mx + mw; x += 22) dot(c, x, qy + 3, 1.4, T.dim);
  // berth marks
  [[18, 'B1', 'ONDINE'], [156, 'B2', 'HARROW STAR'], [284, 'B3', 'FREE']].forEach(([x, b, n]) => {
    line(c, mx + x - 6, qy + 31, mx + x - 6, qy + 45, T.dim, 1);
    txt(c, b, mx + x, qy + 44, mono(10, 500), T.ink); txt(c, n, mx + x + 22, qy + 44, mono(10), T.dim);
  });
  txt(c, 'QUAY 4 · 360 m', mx + mw - 10, qy + 56, mono(9), T.dim, 'right');
  // ships alongside
  ship(c, mx + 12, qy - 36, 128, 30, 0.58, 7, ACC);
  ship(c, mx + 150, qy - 32, 92, 26, 0.24, 11, ACC);
  // the free berth, and the arrival heading for it
  rect(c, mx + 278.5, qy - 34.5, 70, 28, { stroke: T.dim, dash: [3, 4], r: 3 });
  txt(c, '220 m', mx + 313, qy - 16, mono(9.5), T.dim, 'center');
  c.strokeStyle = T.ink; c.lineWidth = 1.1; c.setLineDash([2, 4]);
  c.beginPath(); c.moveTo(mx + 318, my + 66); c.quadraticCurveTo(mx + 334, my + 92, mx + 310, qy - 40); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(mx + 310, qy - 40); c.rotate(Math.PI * 0.62);
  c.fillStyle = T.ink; c.beginPath(); c.moveTo(0, 0); c.lineTo(-7, -3); c.lineTo(-7, 3); c.closePath(); c.fill(); c.restore();
  hull(c, mx + 270, my + 40, 74, 18); c.fillStyle = T.deep; c.fill(); c.strokeStyle = T.ink; c.lineWidth = 1; c.stroke();
  txt(c, 'TALLIS GRAY', mx + 270, my + 32, mono(9.5, 500), T.ink);
  // cranes
  crane(c, mx + 56, qy, qy - 46, qy - 26, 'QC03', ACC);
  crane(c, mx + 96, qy, qy - 46, qy - 14, 'QC04', ACC);
  crane(c, mx + 196, qy, qy - 42, qy - 20, 'QC05', ACC);
  crane(c, mx + 256, qy, qy - 8, 0, 'QC06', ACC, true);
  // wind + tide
  c.fillStyle = 'rgba(12,12,12,.86)'; c.beginPath(); c.roundRect(mx + 12, my + 12, 132, 44, 8); c.fill();
  txt(c, 'WIND · TIDE', mx + 24, my + 29, mono(9.5), T.dim);
  txt(c, '11 m/s W · 3.4 m ↑', mx + 24, my + 47, mono(13, 500), T.ink);
  c.restore();

  // ---- next arrival ----
  line(c, 24, 352, 366, 352, T.line2);
  txt(c, 'NEXT ALONGSIDE · B3', 24, 374, mono(10), T.dim);
  txt(c, 'MV Tallis Gray', 24, 400, serif(21, 600), T.ink);
  txt(c, 'PILOT ON 06:55 · 1,184 MOVES PLANNED', 24, 420, mono(10), T.dim);
  txt(c, '01:52', 366, 400, mono(32, 500), T.ink, 'right');
  txt(c, 'H : MIN', 366, 420, mono(9.5), T.dim, 'right');
  line(c, 24, 436, 366, 436, T.line2);

  // ---- yard ----
  section(c, T, 24, 366, 466, 'YARD · BLOCKS A–F', '71% FULL');
  const gx = 46, gy = 480, cols = 12, rows = 6, cw = (366 - gx) / cols, rh = 15, rg = 4;
  const lv = ['#161615', '#2A2A28', '#41413E', '#62615D', '#8F8E89'];
  const r = rng(4021);
  for (let j = 0; j < rows; j++) {
    txt(c, 'ABCDEF'[j], 24, gy + j * (rh + rg) + 11, mono(10, 500), T.dim);
    for (let i = 0; i < cols; i++) {
      const x = gx + i * cw, y = gy + j * (rh + rg);
      const v = Math.min(4, Math.floor(r() * 3.2 + (i > 8 ? 0 : 1) + (j === 2 && i > 5 && i < 9 ? 2 : 0)));
      c.fillStyle = lv[v]; c.fillRect(x, y, cw - 3, rh);
      if (j === 5) dot(c, x + cw - 7, y + 4, 1.4, T.ink);       // reefer plugs
    }
  }
  // the staged block for the next load
  const bx = gx + 6 * cw - 2, by = gy + 2 * (rh + rg) - 2, bw = 3 * cw + 1, bh = rh + 4;
  if (accent) { c.fillStyle = 'rgba(255,196,0,.28)'; c.fillRect(bx, by, bw, bh); }
  rect(c, bx + 0.5, by + 0.5, bw, bh, { stroke: ACC, lw: 1.5 });
  rect(c, 24.5, 596.5, 12, 8, { stroke: ACC, lw: 1.5, fill: accent ? 'rgba(255,196,0,.28)' : null });
  txt(c, 'C07–C09 · 212 BOXES STAGED FOR ONDINE', 44, 604, mono(10, 500), T.ink);
  txt(c, 'F = REEFER ROW', 366, 622, mono(9), T.dim, 'right');
  txt(c, 'LOAD STARTS 08:10', 24, 622, mono(9), T.dim);

  // ---- crane queues ----
  section(c, T, 24, 366, 654, 'CRANE QUEUES', '3 OF 6 WORKING');
  const Q = [
    { id: 'QC03', job: 'B1 · ONDINE · DISCHARGE', rate: '34 mv/h', left: 212, of: 506, fin: 'FIN 11:05' },
    { id: 'QC04', job: 'B1 · ONDINE · DISCHARGE', rate: '31 mv/h', left: 168, of: 420, fin: 'FIN 10:12' },
    { id: 'QC05', job: 'B2 · HARROW STAR · LOAD', rate: 'WIND HOLD', left: 301, of: 396, fin: 'RECHECK 06:15', hold: true },
  ];
  let y = 664;
  Q.forEach((q) => {
    line(c, 24, y, 366, y, T.line2);
    txt(c, q.id, 24, y + 22, serif(15, 600), T.ink);
    txt(c, q.job, 84, y + 21, mono(10), T.dim);
    if (q.hold) { txt(c, q.rate, 366, y + 21, mono(11, 500), ACC, 'right'); }
    else txt(c, q.rate, 366, y + 21, mono(11, 500), T.ink, 'right');
    meter(c, 84, y + 30, 128, 7, 1 - q.left / q.of, T, q.hold ? ACC : T.ink);
    txt(c, `${q.left} LEFT`, 222, y + 37, mono(10), T.ink);
    txt(c, q.fin, 366, y + 37, mono(10), T.dim, 'right');
    y += 46;
  });

  // ---- tab bar ----
  line(c, 0, 808, W, 808, T.line2);
  ['BERTHS', 'YARD', 'CRANES', 'GATE'].forEach((t, i) => {
    const x = 24 + 48 + i * 98 - 48 + 26;
    txt(c, t, x, 832, mono(10.5, 500), i === 0 ? T.ink : T.dim, 'center');
    if (i === 0) c.fillStyle = ACC, c.fillRect(x - 18, 808, 36, 2);
  });
  end(c);
}

export const QUAYCALL = {
  id: 'quaycall', name: 'QUAYCALL', kind: 'Container-port operations app', desc: 'a container-port operations app', industry: 'Ports and shipping',
  form: 'phone', accent: '#FFC400', w: W, h: H, theme: 'dark',
  flow: { steps: ['OPEN', 'BERTH PLAN', 'ASSIGN CRANES', 'CHECK WIND', 'WORK SHIP', 'SAIL'], hold: [3, 2, 'HOLD'] },
  draw: drawQuaycall,
};

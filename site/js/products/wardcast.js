// WARDCAST: a made-up hospital bed-flow command board (concept product, not a client).
// The bed manager's wall screen: every ward's beds at a glance, the emergency department's queue for a bed, the next
// 24 hours of demand against capacity, and a suggested move that waits for a human to approve it. Patients appear only
// as codes. Light and clinical; teal only on hover. 1440 x 900.
import { LIGHT, mono, serif, rng, begin, end, txt, tw, line, rect, dot, hatch, smooth, button } from './kit.js';

const W = 1440, H = 900;
const T = LIGHT;

const WARDS = [
  ['3 East', 'SURGERY', 1], ['3 West', 'ORTHOPAEDICS', 2], ['4 East', 'MEDICINE', 3], ['4 West', 'MEDICINE', 4],
  ['5 East', 'CARDIOLOGY', 5], ['5 West', 'STEP-DOWN', 6], ['6 East', 'RESPIRATORY', 7], ['6 West', 'ONCOLOGY', 8],
];

export function drawWardcast(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#0E9F9A';
  const ACC = accent ? A : T.ink;

  // ---- top bar ----
  txt(c, 'WARDCAST', 32, 42, serif(24, 640), T.ink);
  txt(c, 'BED FLOW · CENTRAL CAMPUS · 412 BEDS', 32 + tw(c, 'WARDCAST', serif(24, 640)) + 18, 41, mono(11), T.dim);
  dot(c, 1160, 37, 4.5, ACC);
  txt(c, 'LIVE · UPDATED 12 s AGO', 1172, 41, mono(10.5), T.dim);
  txt(c, '14:20', 1408, 42, mono(16, 500), T.ink, 'right');
  line(c, 0, 64, W, 64, T.line2);

  // ---- KPIs ----
  const K = [
    ['OCCUPIED', '386 / 412', '94% · TARGET 92%'],
    ['ED WAITING FOR A BED', '14', 'LONGEST 6 H 10'],
    ['DISCHARGES TODAY', '19 of 31', '9 BEFORE NOON'],
    ['BEDS BEING CLEANED', '7', 'AVERAGE TURN 52 MIN'],
    ['FORECAST AT 18:00', '−6 beds', 'UNLESS 4 MORE GO HOME'],
  ];
  const kw = W / K.length;
  K.forEach(([k, v, s], i) => {
    const x = i * kw + 32;
    if (i) line(c, i * kw, 64, i * kw, 172, T.line2);
    txt(c, k, x, 94, mono(10.5, 500), T.dim);
    txt(c, v, x, 136, serif(36, 500), i === 4 ? ACC : T.ink);
    txt(c, s, x, 156, mono(10), T.dim);
  });
  line(c, 0, 172, W, 172, T.line2);

  // ---- wards ----
  const gx = 32, gy = 196, cw = 230, chh = 160, gap = 16;
  const r = rng(51207);
  const freeBy = {};
  WARDS.forEach(([name, spec, f], n) => {
    const x = gx + (n % 4) * (cw + gap), y = gy + Math.floor(n / 4) * (chh + gap);
    rect(c, x + 0.5, y + 0.5, cw, chh, { fill: T.panel, stroke: T.line2, r: 8 });
    txt(c, name, x + 16, y + 30, serif(19, 600), T.ink);
    txt(c, spec, x + 16, y + 48, mono(9.5), T.dim);
    let free = 0;
    const beds = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) {
      const v = r();
      let s = v < 0.74 ? 'occ' : v < 0.85 ? 'dis' : v < 0.9 ? 'clean' : v < 0.97 ? 'free' : 'iso';
      if (n === 5 && j === 0 && i < 2) s = 'move';
      if (n === 2 && j === 2 && i > 5) s = 'free';
      if (s === 'free') free++;
      beds.push([i, j, s]);
    }
    freeBy[name] = free;
    txt(c, `${free} FREE`, x + cw - 16, y + 30, mono(10.5, 500), free ? T.ink : T.dim, 'right');
    beds.forEach(([i, j, s]) => {
      const bx = x + 16 + i * 25.5, by = y + 66 + j * 28, bw = 20, bh = 22;
      if (s === 'occ') rect(c, bx, by, bw, bh, { fill: '#3B3B38', r: 3 });
      else if (s === 'dis') { rect(c, bx, by, bw, bh, { fill: '#9C9B96', r: 3 }); dot(c, bx + bw / 2, by + bh / 2, 2.4, T.panel); }
      else if (s === 'clean') { rect(c, bx + 0.5, by + 0.5, bw - 1, bh - 1, { stroke: T.dim, r: 3 }); hatch(c, bx + 1, by + 1, bw - 2, bh - 2, '#9C9B96', 3.5); }
      else if (s === 'free') rect(c, bx + 0.5, by + 0.5, bw - 1, bh - 1, { stroke: T.ink, lw: 1.2, r: 3 });
      else if (s === 'iso') { rect(c, bx + 0.5, by + 0.5, bw - 1, bh - 1, { stroke: T.ink, r: 3 }); line(c, bx + 4, by + 4, bx + bw - 4, by + bh - 4, T.ink); line(c, bx + bw - 4, by + 4, bx + 4, by + bh - 4, T.ink); }
      else if (s === 'move') { rect(c, bx, by, bw, bh, { fill: '#3B3B38', r: 3 }); rect(c, bx - 2.5, by - 2.5, bw + 5, bh + 5, { stroke: ACC, lw: 1.5, r: 4 }); }
    });
  });
  // legend
  let lx = 32; const ly = 548;
  [['OCCUPIED', (x) => rect(c, x, ly - 10, 14, 12, { fill: '#3B3B38', r: 2 })],
   ['GOING HOME TODAY', (x) => { rect(c, x, ly - 10, 14, 12, { fill: '#9C9B96', r: 2 }); dot(c, x + 7, ly - 4, 1.8, T.panel); }],
   ['BEING CLEANED', (x) => { rect(c, x + 0.5, ly - 9.5, 13, 11, { stroke: T.dim, r: 2 }); hatch(c, x + 1, ly - 9, 12, 10, '#9C9B96', 3.5); }],
   ['FREE', (x) => rect(c, x + 0.5, ly - 9.5, 13, 11, { stroke: T.ink, lw: 1.2, r: 2 })],
   ['ISOLATION', (x) => { rect(c, x + 0.5, ly - 9.5, 13, 11, { stroke: T.ink, r: 2 }); line(c, x + 3, ly - 7, x + 11, ly - 1, T.ink); }],
   ['SUGGESTED MOVE', (x) => rect(c, x + 0.5, ly - 9.5, 13, 11, { stroke: ACC, lw: 1.5, r: 2 })]]
    .forEach(([t, f]) => { f(lx); txt(c, t, lx + 22, ly, mono(10), T.dim); c.font = mono(10); lx += 22 + c.measureText(t).width + 26; });

  // ---- next 24 hours ----
  const x0 = 32, x1 = 960, y0 = 610, y1 = 836;
  txt(c, 'NEXT 24 HOURS · PATIENTS NEEDING A BED AGAINST BEDS STAFFED', x0, 590, mono(11, 500), T.ink);
  const X = (h) => x0 + (h / 24) * (x1 - x0), Y = (v) => y1 - ((v - 360) / 70) * (y1 - y0);
  [370, 390, 410, 430].forEach((v) => { line(c, x0, Y(v), x1, Y(v), T.line, 1); txt(c, String(v), x1 + 8, Y(v) + 3.5, mono(9.5), T.dim); });
  const cap = (h) => (h < 5.7 ? 412 : h < 12 ? 404 : 412);                 // overnight a bay closes for staffing
  const dem = (h) => 386 + 28 * Math.exp(-Math.pow((h - 4.6) / 2.4, 2)) + 6 * Math.sin(h * 0.5) + (h > 8 ? -10 : 0) * Math.min(1, (h - 8) / 6);
  const band = (h) => 3 + h * 0.5;
  const ptsU = [], ptsL = [], ptsM = [];
  for (let h = 0; h <= 24; h += 0.25) { ptsU.push([X(h), Y(dem(h) + band(h))]); ptsL.push([X(h), Y(dem(h) - band(h))]); ptsM.push([X(h), Y(dem(h))]); }
  c.beginPath(); c.moveTo(...ptsU[0]); ptsU.forEach((p) => c.lineTo(...p)); for (let i = ptsL.length - 1; i >= 0; i--) c.lineTo(...ptsL[i]); c.closePath(); c.fillStyle = 'rgba(18,18,18,.07)'; c.fill();
  // shortfall where demand runs over the beds
  c.save(); c.beginPath(); c.moveTo(X(0), Y(cap(0))); for (let h = 0; h <= 24; h += 0.25) c.lineTo(X(h), Y(cap(h))); c.lineTo(X(24), Y(440)); c.lineTo(X(0), Y(440)); c.closePath(); c.clip();
  c.beginPath(); smooth(c, ptsM); c.lineTo(X(24), Y(360)); c.lineTo(X(0), Y(360)); c.closePath(); c.clip();
  if (accent) { c.fillStyle = 'rgba(14,159,154,.18)'; c.fillRect(x0, y0 - 20, x1 - x0, y1 - y0 + 20); }
  hatch(c, x0, y0 - 20, x1 - x0, y1 - y0 + 20, ACC, 4, 1);
  c.restore();
  c.beginPath(); smooth(c, ptsM); c.strokeStyle = T.ink; c.lineWidth = 1.8; c.stroke();
  c.beginPath(); c.moveTo(X(0), Y(cap(0))); for (let h = 0; h <= 24; h += 0.25) c.lineTo(X(h), Y(cap(h))); c.strokeStyle = T.ink; c.lineWidth = 1; c.setLineDash([5, 4]); c.stroke(); c.setLineDash([]);
  // hours from now (14:00)
  line(c, x0, y1, x1, y1, T.ink);
  for (let h = 0; h <= 24; h += 2) { line(c, X(h), y1, X(h), y1 + 4, T.ink); txt(c, String((14 + h) % 24).padStart(2, '0'), X(h), y1 + 18, mono(9.5), T.dim, h === 0 ? 'left' : h === 24 ? 'right' : 'center'); }
  txt(c, 'NOW', X(0) + 6, y0 - 4, mono(9.5, 500), T.ink); line(c, X(0) + 0.5, y0 - 14, X(0) + 0.5, y1, T.ink, 1, [2, 3]);
  txt(c, 'BEDS STAFFED', X(15.2), Y(412) - 8, mono(9.5), T.dim);
  txt(c, 'NEED A BED', X(9.5), Y(dem(9.5)) + 20, mono(9.5), T.dim);
  const sx = X(4.6), sy = Y(dem(4.6) + 2);
  line(c, sx, sy, sx + 60, Y(433), T.ink); dot(c, sx, sy, 2, T.ink);
  txt(c, 'SHORT BY UP TO 6 BEDS · 17:15–20:15', sx + 66, Y(433) + 4, mono(10, 500), T.ink);

  // ---- ED queue ----
  const rx = 1032, rw = 376;
  line(c, rx - 16, 172, rx - 16, 876, T.line2);
  txt(c, 'ED · WAITING FOR A BED', rx, 210, mono(11, 500), T.ink);
  txt(c, '14', rx + rw, 210, mono(11), T.dim, 'right');
  const Q = [['ED-0412', 'CARDIOLOGY', 'MONITORED', '6 H 10'], ['ED-0419', 'MEDICINE', '', '5 H 02'], ['ED-0425', 'RESPIRATORY', 'SIDE ROOM', '4 H 37'],
    ['ED-0431', 'CARDIOLOGY', 'MONITORED', '3 H 15'], ['ED-0433', 'SURGERY', '', '2 H 48']];
  let y = 224;
  Q.forEach(([id, sp, need, t], i) => {
    line(c, rx, y, rx + rw, y, T.line2);
    txt(c, id, rx, y + 26, mono(12, 500), T.ink);
    txt(c, sp + (need ? ` · ${need}` : ''), rx + 90, y + 26, mono(10), T.dim);
    txt(c, t, rx + rw, y + 26, mono(12, 500), i === 0 ? ACC : T.ink, 'right');
    y += 42;
  });
  line(c, rx, y, rx + rw, y, T.line2);
  txt(c, '+ 9 MORE', rx, y + 24, mono(10), T.dim);

  // ---- suggested move (waits for a person) ----
  const my = 520;
  rect(c, rx + 0.5, my + 0.5, rw, 316, { fill: T.panel, stroke: accent ? A : T.ink, lw: 1.2, r: 8 });
  txt(c, 'SUGGESTED MOVE', rx + 20, my + 32, mono(11, 500), ACC);
  txt(c, 'NEEDS THE BED MANAGER', rx + rw - 20, my + 32, mono(10), T.dim, 'right');
  ['Step two stable patients down from', '5 West to 4 East. That frees two', 'monitored beds for ED-0412 and', 'ED-0431 before 16:00.']
    .forEach((l, i) => txt(c, l, rx + 20, my + 70 + i * 26, serif(19, 400), T.ink));
  [`BOTH STABLE FOR 24 H · 4 EAST HAS ${freeBy['4 East']} FREE`, 'NURSE RATIO STAYS 1 : 5 ON BOTH WARDS'].forEach((l, i) => txt(c, l, rx + 20, my + 196 + i * 18, mono(9.5), T.dim));
  button(c, rx + 20, my + 248, 196, 46, 'APPROVE MOVE', { fill: ACC, color: T.panel, r: 6, size: 12 });
  button(c, rx + 228, my + 248, 128, 46, 'NOT NOW', { stroke: T.ink, color: T.ink, r: 6, size: 12 });
  end(c);
}

export const WARDCAST = {
  id: 'wardcast', name: 'WARDCAST', kind: 'Hospital bed-flow command board', desc: 'a hospital bed-flow command board', industry: 'Healthcare',
  form: 'web', accent: '#0E9F9A', w: W, h: H, theme: 'light',
  draw: drawWardcast,
};

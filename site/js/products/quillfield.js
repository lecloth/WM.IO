// QUILLFIELD: a made-up insurer's AI claims assistant (concept product, not a client).
// The claims handler's desk: the queue, the claim with its evidence and costs, and an assistant that has read every
// file on the claim, cites where each answer comes from, and recommends, but pays nothing until a person approves.
// Policyholders appear only as numbers. Light; plum only on hover. 1440 x 900.
import { LIGHT, mono, serif, begin, end, txt, tw, line, rect, dot, hatch, button, chip } from './kit.js';

const W = 1440, H = 900;
const T = LIGHT;

/** evidence 1: the trap under the sink, a failed joint, drips */
function pipePhoto(c, x, y, w, h, ACC) {
  const k = (u, v) => [x + u * w, y + v * h];
  c.strokeStyle = T.ink; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(...k(0.08, 0.16)); c.lineTo(...k(0.92, 0.16)); c.stroke();                 // underside of the worktop
  c.beginPath(); c.moveTo(...k(0.3, 0.16)); c.quadraticCurveTo(...k(0.5, 0.42), ...k(0.7, 0.16)); c.stroke();   // basin
  c.lineWidth = 7; c.strokeStyle = '#9C9B96'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(...k(0.5, 0.36)); c.lineTo(...k(0.5, 0.56)); c.quadraticCurveTo(...k(0.5, 0.78), ...k(0.62, 0.78)); c.quadraticCurveTo(...k(0.74, 0.78), ...k(0.74, 0.62)); c.lineTo(...k(0.74, 0.56)); c.lineTo(...k(0.94, 0.56)); c.stroke();
  c.lineCap = 'butt'; c.lineWidth = 1;
  rect(c, ...k(0.465, 0.53), 0.07 * w, 0.06 * h, { fill: '#6E6D69', stroke: T.ink });
  // drips
  [[0.5, 0.64], [0.48, 0.74], [0.51, 0.84]].forEach(([u, v]) => { const [px, py] = k(u, v); c.fillStyle = T.ink; c.beginPath(); c.moveTo(px, py - 4); c.quadraticCurveTo(px + 3, py + 1, px, py + 2.5); c.quadraticCurveTo(px - 3, py + 1, px, py - 4); c.fill(); });
  c.beginPath(); c.ellipse(...k(0.5, 0.94), 0.12 * w, 0.025 * h, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(18,18,18,.18)'; c.fill();
  dot(c, ...k(0.5, 0.56), 16, null, ACC, 1.5);
}
/** evidence 2: the base unit, its plinth swollen to a tide mark */
function cabinetPhoto(c, x, y, w, h) {
  const k = (u, v) => [x + u * w, y + v * h];
  rect(c, ...k(0.14, 0.12), 0.72 * w, 0.7 * h, { stroke: T.ink, lw: 1.2 });
  line(c, ...k(0.5, 0.12), ...k(0.5, 0.82), T.ink, 1);
  line(c, ...k(0.42, 0.4), ...k(0.42, 0.52), T.ink, 2); line(c, ...k(0.58, 0.4), ...k(0.58, 0.52), T.ink, 2);
  c.save(); c.beginPath(); c.moveTo(...k(0.14, 0.82)); for (let i = 0; i <= 12; i++) { const u = 0.14 + (0.72 * i) / 12; c.lineTo(...k(u, 0.66 + 0.03 * Math.sin(i * 1.7))); } c.lineTo(...k(0.86, 0.92)); c.lineTo(...k(0.14, 0.92)); c.closePath(); c.clip();
  hatch(c, x, y, w, h, '#6E6D69', 4); c.restore();
  line(c, ...k(0.08, 0.92), ...k(0.92, 0.92), T.ink, 1.2);
  c.strokeStyle = T.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(...k(0.14, 0.82)); c.quadraticCurveTo(...k(0.1, 0.87), ...k(0.14, 0.92)); c.moveTo(...k(0.86, 0.82)); c.quadraticCurveTo(...k(0.9, 0.87), ...k(0.86, 0.92)); c.stroke();
}
/** evidence 3: the plumber's invoice */
function invoicePhoto(c, x, y, w, h) {
  const px = x + w * 0.22, pw = w * 0.56, py = y + h * 0.08, ph = h * 0.86;
  rect(c, px, py, pw, ph, { fill: '#FBFAF7', stroke: T.ink });
  rect(c, px + 10, py + 10, 26, 8, { fill: T.ink });
  [0, 1, 2].forEach((i) => line(c, px + pw - 50, py + 12 + i * 5, px + pw - 10, py + 12 + i * 5, T.dim, 1));
  for (let i = 0; i < 5; i++) { const yy = py + 38 + i * 11; line(c, px + 10, yy, px + pw * 0.6, yy, T.dim); line(c, px + pw - 34, yy, px + pw - 10, yy, T.dim); }
  line(c, px + 10, py + ph - 26, px + pw - 10, py + ph - 26, T.ink);
  txt(c, '€1,140', px + pw - 10, py + ph - 12, mono(9, 500), T.ink, 'right');
}

export function drawQuillfield(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#B4236B';
  const ACC = accent ? A : T.ink;

  // ---- queue rail ----
  c.fillStyle = '#EEECE6'; c.fillRect(0, 0, 300, H);
  line(c, 300, 0, 300, H, T.line2);
  txt(c, 'QUILLFIELD', 24, 46, serif(22, 640), T.ink);
  txt(c, 'CLAIMS', 24 + tw(c, 'QUILLFIELD', serif(22, 640)) + 10, 45, mono(10.5), T.dim);
  rect(c, 24.5, 70.5, 252, 34, { fill: T.panel, stroke: T.line2, r: 6 });
  txt(c, 'Search claims, policies…', 38, 92, serif(15, 400), T.faint);
  txt(c, 'MY QUEUE', 24, 140, mono(10.5, 500), T.ink); txt(c, '12', 276, 140, mono(10.5), T.dim, 'right');
  const Q = [
    ['CL-24-0918', 'Escape of water', 'READY FOR YOU', true], ['CL-24-0911', 'Motor, rear impact', 'WAITING ON GARAGE'],
    ['CL-24-0907', 'Storm, roof tiles', 'PHOTOS ASKED FOR'], ['CL-24-0899', 'Theft, bicycle', 'SECOND CHECK'],
    ['CL-24-0893', 'Accidental damage, TV', 'PAID 20 NOV'], ['CL-24-0884', 'Subsidence', 'SURVEYOR BOOKED'],
    ['CL-24-0880', 'Burst pipe, loft', 'PAID 18 NOV'],
  ];
  txt(c, 'HANDLER 14 · SHIFT ENDS 17:30', 24, 868, mono(9.5), T.dim);
  let y = 154;
  Q.forEach(([id, t, st, on]) => {
    if (on) { c.fillStyle = T.panel; c.fillRect(0, y, 300, 82); line(c, 1, y, 1, y + 82, ACC, 3); }
    line(c, 24, y, 276, y, T.line2);
    txt(c, id, 24, y + 24, mono(10.5, 500), on ? T.ink : T.dim);
    txt(c, t, 24, y + 48, serif(17, 500), T.ink);
    txt(c, st, 24, y + 68, mono(9.5), on ? ACC : T.dim);
    y += 82;
  });

  // ---- the claim ----
  const mx = 340, mw = 600;
  txt(c, 'CL-24-0918 · HOME POLICY HP-55102 · POLICYHOLDER 0918', mx, 52, mono(10.5), T.dim);
  txt(c, 'Escape of water, kitchen', mx, 96, serif(38, 500), T.ink);
  txt(c, 'REPORTED 19 NOV 08:42 · EXCESS €250 · LIMIT €25,000', mx, 124, mono(10.5), T.dim);
  let tx = mx;
  ['SUMMARY', 'EVIDENCE (5)', 'POLICY', 'NOTES', 'PAYMENTS'].forEach((t, i) => {
    txt(c, t, tx, 168, mono(11, 500), i === 1 ? T.ink : T.dim);
    const w = tw(c, t, mono(11, 500));
    if (i === 1) line(c, tx, 180, tx + w, 180, T.ink, 2);
    tx += w + 30;
  });
  line(c, mx, 181, mx + mw, 181, T.line2);

  // evidence
  const ev = [['IMG_0412', 'JOINT UNDER SINK', pipePhoto], ['IMG_0413', 'BASE UNIT PLINTH', cabinetPhoto], ['INVOICE', 'PLUMBER · €1,140', invoicePhoto]];
  ev.forEach(([n, d, fn], i) => {
    const ex = mx + i * 204, ey = 204, ew = 192, eh = 150;
    rect(c, ex + 0.5, ey + 0.5, ew, eh, { fill: '#E9E7E1', stroke: T.line2, r: 6 });
    c.save(); c.beginPath(); c.rect(ex, ey, ew, eh); c.clip(); fn(c, ex, ey, ew, eh, ACC); c.restore();
    txt(c, n, ex, ey + eh + 22, mono(10.5, 500), T.ink);
    txt(c, d, ex, ey + eh + 40, mono(9.5), T.dim);
  });
  txt(c, '+ 2 MORE · CALL RECORDING, POLICY WORDING', mx, 434, mono(9.5), T.dim);

  // costs
  txt(c, 'COSTS', mx, 484, mono(11, 500), T.ink);
  txt(c, 'FROM THE INVOICE AND THE PHOTOS', mx + mw, 484, mono(10), T.dim, 'right');
  const C = [['Trace and access', 'INVOICE L.1', '€380'], ['Replace compression joint', 'INVOICE L.2', '€160'], ['Two base units, fitted', 'QUOTE Q-7731', '€1,550'],
    ['Worktop', 'NOT DAMAGED IN PHOTOS', '€0'], ['Excess', 'POLICY §2', '−€250']];
  y = 496;
  C.forEach(([a, b, v]) => {
    line(c, mx, y, mx + mw, y, T.line2);
    txt(c, a, mx, y + 28, serif(17, 500), T.ink);
    txt(c, b, mx + 300, y + 27, mono(9.5), T.dim);
    txt(c, v, mx + mw, y + 28, mono(13, 500), T.ink, 'right');
    y += 42;
  });
  line(c, mx, y, mx + mw, y, T.ink, 1.2);
  txt(c, 'To pay', mx, y + 34, serif(21, 600), T.ink);
  txt(c, '€1,840', mx + mw, y + 34, mono(18, 500), T.ink, 'right');
  txt(c, 'THE ASSISTANT PREPARED THESE LINES · YOU DECIDE', mx, y + 64, mono(9.5), T.dim);

  // ---- the assistant ----
  const ax = 980, aw = 460;
  c.fillStyle = T.panel; c.fillRect(ax, 0, aw, H);
  line(c, ax, 0, ax, H, T.line2);
  const ix = ax + 32, iw = aw - 64;
  txt(c, 'ASSISTANT', ix, 52, mono(11, 500), T.ink);
  txt(c, 'READS ONLY THIS CLAIM', ix + iw, 52, mono(10), T.dim, 'right');
  line(c, ix, 70, ix + iw, 70, T.line2);
  const para = (lines, y0) => lines.forEach((l, i) => txt(c, l, ix, y0 + i * 25, serif(17.5, 400), T.ink));
  para(['I read the three photos, the plumber’s invoice', 'and the policy wording. The leak came from a', 'failed compression joint under the sink, which', 'section 4.2 covers as escape of water.'], 106);
  let cx2 = ix;
  ['POLICY §4.2', 'INVOICE L.1–2', 'IMG_0412'].forEach((t) => { cx2 += chip(c, cx2, 202, t, T.dim, { size: 9.5 }) + 8; });
  para(['The base units are covered. The worktop shows', 'no damage in the photos, so I left it out.'], 258);
  cx2 = ix;
  ['IMG_0413', 'QUOTE Q-7731'].forEach((t) => { cx2 += chip(c, cx2, 304, t, T.dim, { size: 9.5 }) + 8; });

  // recommendation
  const ry = 356;
  rect(c, ix + 0.5, ry + 0.5, iw, 300, { stroke: accent ? A : T.ink, lw: 1.2, r: 8 });
  txt(c, 'RECOMMENDATION', ix + 20, ry + 32, mono(10.5, 500), ACC);
  txt(c, 'CONFIDENCE HIGH', ix + iw - 20, ry + 32, mono(10), T.dim, 'right');
  txt(c, 'Pay €1,840', ix + 20, ry + 80, serif(36, 500), T.ink);
  txt(c, 'AFTER THE €250 EXCESS · BY BANK TRANSFER', ix + 20, ry + 104, mono(9.5), T.dim);
  const checks = [['ok', 'Invoice matches the photos'], ['ok', 'Policy in force on 19 November'], ['warn', 'A 2023 claim at this address: read it first']];
  checks.forEach(([k, t], i) => {
    const yy = ry + 146 + i * 30;
    if (k === 'ok') { c.strokeStyle = T.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ix + 22, yy - 4); c.lineTo(ix + 27, yy + 1); c.lineTo(ix + 36, yy - 9); c.stroke(); }
    else { dot(c, ix + 29, yy - 4, 8, ACC); txt(c, '!', ix + 29, yy, mono(11, 500), T.panel, 'center'); }
    txt(c, t, ix + 50, yy, serif(16.5, k === 'warn' ? 600 : 400), T.ink);
  });
  button(c, ix + 20, ry + 232, iw - 40, 46, 'APPROVE · SEND TO PAYMENTS', { fill: ACC, color: T.panel, r: 6, size: 12 });
  txt(c, 'NOTHING IS PAID UNTIL A HANDLER APPROVES', ix + iw / 2, ry + 324, mono(9.5), T.dim, 'center');

  // what it did, in order (an audit trail the handler can open)
  txt(c, 'WHAT THE ASSISTANT DID', ix, 716, mono(10), T.dim);
  [['08:51', 'Read 5 files on this claim'], ['08:51', 'Matched invoice lines to photos'], ['08:52', 'Found claim CL-23-0207, same address']]
    .forEach(([t, l], i) => { txt(c, t, ix, 740 + i * 20, mono(10), T.dim); txt(c, l, ix + 56, 740 + i * 20, mono(10), T.ink); });

  // ask box
  rect(c, ix + 0.5, 804.5, iw, 52, { fill: T.bg, stroke: T.line2, r: 8 });
  txt(c, 'Ask about this claim…', ix + 18, 836, serif(16, 400), T.faint);
  txt(c, 'ENTER ↵', ix + iw - 18, 835, mono(10, 500), T.dim, 'right');
  end(c);
}

export const QUILLFIELD = {
  id: 'quillfield', name: 'QUILLFIELD', kind: 'AI claims assistant', desc: "an insurer's AI claims assistant", industry: 'Insurance',
  form: 'web', accent: '#B4236B', w: W, h: H, theme: 'light',
  draw: drawQuillfield,
};

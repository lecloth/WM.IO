// FERNPAY: a made-up payments company's live security command board (concept product, not a client).
// The night shift's wall: authorisation traffic minute by minute with a card-testing burst caught and blocked, the
// service map with the one surface under attack, the open incidents, and a rule change that needs a second person.
// Dark, as a 24-hour room's screens are; signal lime only on hover. 1440 x 900.
import { DARK, mono, serif, rng, begin, end, txt, tw, line, rect, dot, hatch, button, chip } from './kit.js';

const W = 1440, H = 900;
const T = DARK;

export function drawFernpay(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#C6F432';
  const ACC = accent ? A : T.hi;

  // ---- top bar ----
  txt(c, 'FERNPAY', 32, 40, serif(22, 640), T.ink);
  txt(c, 'SECURITY OPERATIONS', 32 + tw(c, 'FERNPAY', serif(22, 640)) + 14, 39, mono(10.5), T.dim);
  rect(c, 620.5, 18.5, 200, 30, { stroke: ACC, r: 15, fill: accent ? 'rgba(198,244,50,.1)' : null });
  dot(c, 640, 34, 4, ACC);
  txt(c, 'POSTURE · ELEVATED', 652, 38, mono(11, 500), ACC);
  txt(c, 'ON CALL · SEC 2', 1240, 39, mono(10.5), T.dim, 'right');
  txt(c, '03:14:22 UTC', 1408, 40, mono(15, 500), T.ink, 'right');
  line(c, 0, 64, W, 64, T.line2);

  // ---- KPIs ----
  const K = [['AUTHORISATIONS / s', '4,812', 'NORMAL FOR 03:00'], ['DECLINE RATE', '3.1%', '+1.4 PTS IN 15 MIN'], ['BLOCKED · LAST HOUR', '12,406', '1,904 IN ONE BURST'],
    ['RISK SCORING · P95', '38 ms', 'BUDGET 60 ms'], ['OPEN INCIDENTS', '3', '1 AT SEVERITY 2']];
  const kw = W / K.length;
  K.forEach(([k, v, s], i) => {
    const x = i * kw + 32;
    if (i) line(c, i * kw, 64, i * kw, 160, T.line2);
    txt(c, k, x, 92, mono(10.5, 500), T.dim);
    txt(c, v, x, 132, serif(34, 500), T.ink);
    txt(c, s, x, 150, mono(10), T.dim);
  });
  line(c, 0, 160, W, 160, T.line2);

  // ---- traffic, minute by minute ----
  const x0 = 32, x1 = 940, y0 = 222, y1 = 500;
  txt(c, 'AUTHORISATION ATTEMPTS · LAST 60 MIN', x0, 196, mono(11, 500), T.ink);
  let lx = x1;
  [['DECLINED', (x) => { rect(c, x, 188, 12, 10, { fill: '#2A2A28' }); hatch(c, x, 188, 12, 10, T.dim, 3); }], ['APPROVED', (x) => rect(c, x, 188, 12, 10, { fill: '#6E6D69' })]]
    .forEach(([t, f]) => { const w = tw(c, t, mono(10)); txt(c, t, lx, 197, mono(10), T.dim, 'right'); f(lx - w - 20); lx -= w + 44; });
  const Y = (v) => y1 - (v / 600) * (y1 - y0);          // thousands of attempts per minute, 0..600
  [100, 200, 300, 400, 500].forEach((v) => { line(c, x0, Y(v), x1, Y(v), '#1C1C1B'); txt(c, `${v}k`, x1 + 10, Y(v) + 3.5, mono(9.5), T.dim); });
  const r = rng(77031), bw = (x1 - x0) / 60;
  for (let i = 0; i < 60; i++) {
    const base = 282 + Math.sin(i * 0.21) * 12 + r() * 10;
    let dec = base * (0.018 + r() * 0.008);
    const burst = i >= 44 && i <= 47;
    if (burst) dec += [120, 210, 190, 60][i - 44];
    const x = x0 + i * bw + 1.5, w = bw - 3;
    c.fillStyle = '#6E6D69'; c.fillRect(x, Y(base), w, y1 - Y(base));
    const dy = Y(base + dec);
    if (burst && accent) { c.fillStyle = 'rgba(198,244,50,.85)'; c.fillRect(x, dy, w, Y(base) - dy); }
    else { c.fillStyle = '#2A2A28'; c.fillRect(x, dy, w, Y(base) - dy); hatch(c, x, dy, w, Y(base) - dy, burst ? T.ink : T.dim, 3); }
  }
  line(c, x0, y1, x1, y1, T.ink);
  for (let m = 60; m >= 0; m -= 10) { const x = x0 + (60 - m) * bw; line(c, x, y1, x, y1 + 4, T.ink); txt(c, m ? `−${m} MIN` : 'NOW', x, y1 + 18, mono(9.5), T.dim, m === 60 ? 'left' : m === 0 ? 'right' : 'center'); }
  // the burst
  const bx = x0 + 44 * bw, bx2 = x0 + 48 * bw, by = Y(282 + 220);
  rect(c, bx - 4.5, by - 10.5, bx2 - bx + 8, y1 - by + 10, { stroke: ACC, lw: 1.2, dash: [3, 3] });
  line(c, bx - 4, by - 10, bx - 40, Y(560), T.ink); dot(c, bx - 4, by - 10, 2, T.ink);
  txt(c, 'CARD TESTING ON MERCHANT M-20417', bx - 46, Y(560) - 4, mono(10.5, 500), T.ink, 'right');
  txt(c, '1,904 ATTEMPTS IN 4 MIN · BLOCKED 41 s AFTER IT STARTED', bx - 46, Y(560) + 13, mono(10), T.dim, 'right');

  // ---- service map ----
  txt(c, 'SERVICE MAP', x0, 568, mono(11, 500), T.ink);
  txt(c, 'REQUESTS / s ON EACH LINK', x1, 568, mono(10), T.dim, 'right');
  const N = {
    edge: [32, 640, 'EDGE', 'WAF · RATE LIMITS'], gw: [216, 640, 'API GATEWAY', '4,812 / s'], risk: [400, 600, 'RISK ENGINE', 'P95 38 ms'],
    vault: [400, 700, 'TOKEN VAULT', 'HSM-BACKED'], ledger: [584, 640, 'LEDGER', 'DOUBLE-ENTRY'], net: [768, 640, 'CARD NETWORKS', '4 LINKS UP'],
    dash: [216, 780, 'MERCHANT DASHBOARD', 'LOGIN ANOMALY'],
  };
  const nw = 140, nh = 50;
  const mid = (k, side) => { const [x, y] = N[k]; return side === 'r' ? [x + nw, y + nh / 2] : side === 'l' ? [x, y + nh / 2] : side === 't' ? [x + nw / 2, y] : [x + nw / 2, y + nh]; };
  const link = (a, b, label, hot = false) => {
    const [ax, ay] = a, [bx3, by3] = b, mxp = (ax + bx3) / 2;
    c.strokeStyle = hot ? ACC : T.dim; c.lineWidth = hot ? 1.4 : 1; if (hot) c.setLineDash([4, 3]);
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(mxp, ay); c.lineTo(mxp, by3); c.lineTo(bx3, by3); c.stroke(); c.setLineDash([]);
    if (label) txt(c, label, (ax + bx3) / 2, ay - 6, mono(9), T.dim, 'center');
  };
  link(mid('edge', 'r'), mid('gw', 'l'), '5.1k');
  link(mid('gw', 'r'), mid('risk', 'l'), '');
  link(mid('gw', 'r'), mid('vault', 'l'), '');
  link(mid('risk', 'r'), mid('ledger', 'l'), '');
  link(mid('vault', 'r'), mid('ledger', 'l'), '');
  link(mid('ledger', 'r'), mid('net', 'l'), '4.7k');
  c.strokeStyle = ACC; c.lineWidth = 1.4; c.setLineDash([4, 3]);
  c.beginPath(); c.moveTo(102, 690); c.lineTo(102, 805); c.lineTo(216, 805); c.stroke(); c.setLineDash([]);
  txt(c, '6.2k LOGIN TRIES / MIN', 112, 760, mono(9), ACC);
  Object.entries(N).forEach(([k, [x, y, a, b]]) => {
    const hot = k === 'dash';
    rect(c, x + 0.5, y + 0.5, nw, nh, { fill: hot && accent ? 'rgba(198,244,50,.12)' : T.panel, stroke: hot ? ACC : T.ink, lw: hot ? 1.5 : 1, r: 6 });
    txt(c, a, x + 12, y + 21, mono(10.5, 500), T.ink);
    txt(c, b, x + 12, y + 38, mono(9.5), hot ? ACC : T.dim);
  });

  // ---- incidents ----
  const rx = 992, rw = 416;
  line(c, rx - 24, 160, rx - 24, 876, T.line2);
  txt(c, 'INCIDENTS', rx, 196, mono(11, 500), T.ink);
  txt(c, '3 OPEN', rx + rw, 196, mono(10), T.dim, 'right');
  const I = [
    ['SEV 2', 'Credential stuffing on the merchant dashboard', '318 IPs · 41 ACCOUNTS LOCKED · CONTAINED', 'OPEN 26 MIN', true],
    ['SEV 3', 'Card testing on merchant M-20417', 'AUTO-BLOCKED BY RULE V-12', 'WATCHING'],
    ['SEV 4', 'Certificate expiring on a staging host', 'RENEWAL QUEUED · OWNER PLATFORM', 'IN 6 DAYS'],
  ];
  let y = 212;
  I.forEach(([s, t, d, age, hot]) => {
    line(c, rx, y, rx + rw, y, T.line2);
    chip(c, rx, y + 16, s, hot ? ACC : T.dim, hot ? { fill: ACC, ink: T.bg, size: 9.5 } : { size: 9.5 });
    txt(c, age, rx + rw, y + 29, mono(10), hot ? T.ink : T.dim, 'right');
    txt(c, t, rx, y + 62, serif(17.5, 500), T.ink);
    txt(c, d, rx, y + 82, mono(9.5), T.dim);
    y += 102;
  });
  line(c, rx, y, rx + rw, y, T.line2);

  // ---- four eyes on every rule change ----
  const cy = 560;
  rect(c, rx + 0.5, cy + 0.5, rw, 276, { fill: T.panel, stroke: accent ? A : T.line2, lw: 1.2, r: 8 });
  txt(c, 'WAITING FOR A SECOND APPROVER', rx + 20, cy + 32, mono(10.5, 500), ACC);
  txt(c, 'Velocity rule V-12', rx + 20, cy + 70, serif(22, 600), T.ink);
  txt(c, '20  →  12', rx + 20, cy + 112, mono(28, 500), T.ink);
  txt(c, 'ATTEMPTS PER CARD PER MINUTE', rx + 20, cy + 134, mono(9.5), T.dim);
  txt(c, 'DRY RUN, LAST 7 DAYS: 0.02% OF GOOD', rx + 20, cy + 166, mono(9.5), T.dim);
  txt(c, 'PAYMENTS WOULD HAVE BEEN STOPPED', rx + 20, cy + 182, mono(9.5), T.dim);
  txt(c, 'PROPOSED BY SEC 2 · 03:02', rx + rw - 20, cy + 32, mono(9.5), T.dim, 'right');
  button(c, rx + 20, cy + 206, 220, 46, 'APPROVE AS SEC 5', { fill: ACC, color: T.bg, r: 6, size: 12 });
  button(c, rx + 252, cy + 206, rw - 272, 46, 'REJECT', { stroke: T.ink, color: T.ink, r: 6, size: 12 });
  end(c);
}

export const FERNPAY = {
  id: 'fernpay', name: 'FERNPAY', kind: 'Payments security command board', desc: "a payments company's security command board", industry: 'Payments',
  form: 'web', accent: '#C6F432', w: W, h: H, theme: 'dark',
  draw: drawFernpay,
};

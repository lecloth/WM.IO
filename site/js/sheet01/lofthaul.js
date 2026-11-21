// LOFTHAUL — a made-up drone-delivery dispatcher (concept product, not a client).
// Drawn in code onto a canvas that becomes the phone's screen texture. Logical size 390 x 844 pt.
// Black and white by default; the product's own colour (signal orange) only appears on hover.

const PT_W = 390, PT_H = 844;

// a tiny seeded random so the city map is identical on every load
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const DRONES = [
  { id: 'LH-07', to: 'Pier 3 Pharmacy', batt: 82, wind: 4.1, eta: '03:12', t: 0.62, route: 0 },
  { id: 'LH-11', to: 'Block 12 Lab', batt: 64, wind: 5.3, eta: '06:48', t: 0.34, route: 1 },
  { id: 'LH-03', to: 'North Gate Kitchen', batt: 41, wind: 6.0, eta: '09:05', t: 0.18, route: 2 },
];
const DROPS = [[0.80, 0.22], [0.86, 0.66], [0.22, 0.18], [0.34, 0.80]];

export function drawLofthaul(canvas, { accent = false } = {}) {
  const S = canvas.width / PT_W;
  const c = canvas.getContext('2d');
  const ACC = accent ? '#FF5B1F' : '#F2F0EB';
  const BG = '#0C0C0C', INK = '#EDEBE6', DIM = '#8F8E89', LINE = '#2B2B29', LINE2 = '#3B3B38';
  const mono = (sz, w = 400) => `${w} ${sz}px "DM Mono", ui-monospace, monospace`;   // ctx is already scaled by S
  const sans = (sz, w = 500) => `${w} ${sz}px "Newsreader", Georgia, serif`;
  c.save();
  c.fillStyle = BG; c.fillRect(0, 0, canvas.width, canvas.height);
  c.scale(S, S);
  c.textBaseline = 'alphabetic';

  // status bar
  c.fillStyle = INK; c.font = mono(13, 500); c.fillText('14:32', 28, 34);
  c.fillRect(340, 24, 22, 11); c.fillStyle = BG; c.fillRect(342, 26, 6, 7); c.fillStyle = INK; c.fillRect(363, 27, 2, 5);
  for (let i = 0; i < 4; i++) c.fillRect(306 + i * 6, 34 - (i + 1) * 3, 4, (i + 1) * 3);

  // header
  c.font = sans(22, 640); c.fillText('LOFTHAUL', 24, 84);
  c.font = mono(11); c.fillStyle = DIM; c.fillText('DISPATCH · HARBOUR SECTOR', 24, 104);
  c.fillStyle = ACC; c.beginPath(); c.arc(330, 78, 4.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.font = mono(11, 500); c.fillText('LIVE', 340, 82);

  // ---- map ----
  const mx = 16, my = 120, mw = 358, mh = 380;
  c.save();
  c.beginPath(); c.roundRect(mx, my, mw, mh, 14); c.clip();
  c.fillStyle = '#121211'; c.fillRect(mx, my, mw, mh);
  const r = rng(186787);
  // coastline + water
  c.fillStyle = '#0A0A0A';
  c.beginPath(); c.moveTo(mx, my + mh * 0.62);
  for (let i = 0; i <= 12; i++) { const x = mx + (mw * i) / 12; c.lineTo(x, my + mh * (0.62 + 0.08 * Math.sin(i * 0.9) + 0.06 * (i / 12))); }
  c.lineTo(mx + mw, my + mh); c.lineTo(mx, my + mh); c.closePath(); c.fill();
  // street blocks (skewed grid, like a real harbour district)
  c.strokeStyle = LINE; c.lineWidth = 1;
  for (let i = 0; i < 16; i++) { const y = my + 12 + i * 22 + r() * 6; c.beginPath(); c.moveTo(mx, y); c.lineTo(mx + mw, y - 26); c.stroke(); }
  for (let i = 0; i < 14; i++) { const x = mx + 8 + i * 27 + r() * 8; c.beginPath(); c.moveTo(x, my); c.lineTo(x + 34, my + mh); c.stroke(); }
  // main avenues
  c.strokeStyle = LINE2; c.lineWidth = 3;
  c.beginPath(); c.moveTo(mx, my + 150); c.bezierCurveTo(mx + 120, my + 120, mx + 220, my + 210, mx + mw, my + 170); c.stroke();
  c.beginPath(); c.moveTo(mx + 150, my); c.bezierCurveTo(mx + 170, my + 120, mx + 130, my + 220, mx + 190, my + mh); c.stroke();
  // piers
  c.strokeStyle = LINE2; c.lineWidth = 6;
  for (let i = 0; i < 4; i++) { const x = mx + 60 + i * 70; c.beginPath(); c.moveTo(x, my + mh * 0.66); c.lineTo(x + 10, my + mh * 0.86); c.stroke(); }
  // hub
  const hub = [mx + mw * 0.5, my + mh * 0.44];
  // routes
  const drops = DROPS.map(([u, v]) => [mx + mw * u, my + mh * v]);
  const ctrl = (a, b) => [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.25, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.25];
  drops.forEach((d, i) => {
    const k = ctrl(hub, d);
    c.setLineDash(i < 3 ? [] : [3, 5]); c.lineWidth = i < 3 ? 1.6 : 1.2;
    c.strokeStyle = i < 3 ? INK : DIM;
    c.beginPath(); c.moveTo(...hub); c.quadraticCurveTo(...k, ...d); c.stroke();
    c.setLineDash([]);
    c.fillStyle = BG; c.strokeStyle = INK; c.lineWidth = 1.5;
    c.beginPath(); c.arc(d[0], d[1], 5.5, 0, Math.PI * 2); c.fill(); c.stroke();
  });
  // drones on their routes
  const q = (a, k, b, t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * k[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * k[1] + t * t * b[1]];
  DRONES.forEach((dr) => {
    const d = drops[dr.route], k = ctrl(hub, d), p = q(hub, k, d, dr.t), p2 = q(hub, k, d, dr.t + 0.02);
    const ang = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
    c.save(); c.translate(...p); c.rotate(ang);
    c.fillStyle = ACC; c.beginPath(); c.moveTo(8, 0); c.lineTo(-6, -6); c.lineTo(-3, 0); c.lineTo(-6, 6); c.closePath(); c.fill();
    c.restore();
    c.fillStyle = INK; c.font = mono(10, 500); c.fillText(dr.id, p[0] + 9, p[1] - 8);
  });
  c.fillStyle = INK; c.fillRect(hub[0] - 7, hub[1] - 7, 14, 14);
  c.fillStyle = BG; c.fillRect(hub[0] - 3, hub[1] - 3, 6, 6);
  c.fillStyle = INK; c.font = mono(10, 500); c.fillText('HUB', hub[0] + 11, hub[1] + 4);
  // wind + scale
  c.fillStyle = 'rgba(12,12,12,.86)'; c.beginPath(); c.roundRect(mx + mw - 128, my + 12, 116, 44, 8); c.fill();
  c.fillStyle = DIM; c.font = mono(9.5); c.fillText('WIND', mx + mw - 116, my + 29);
  c.fillStyle = INK; c.font = mono(13, 500); c.fillText('4.6 m/s NE', mx + mw - 116, my + 47);
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(mx + 18, my + mh - 18); c.lineTo(mx + 78, my + mh - 18); c.moveTo(mx + 18, my + mh - 22); c.lineTo(mx + 18, my + mh - 14); c.moveTo(mx + 78, my + mh - 22); c.lineTo(mx + 78, my + mh - 14); c.stroke();
  c.fillStyle = INK; c.font = mono(9.5); c.fillText('500 m', mx + 86, my + mh - 14);
  c.restore();

  // ---- fleet panel ----
  let y = 536;
  c.fillStyle = INK; c.font = mono(11, 500); c.fillText('IN THE AIR', 24, y); c.fillStyle = DIM; c.fillText('3 OF 8', 330, y);
  y += 14;
  DRONES.forEach((dr) => {
    c.strokeStyle = LINE2; c.lineWidth = 1; c.beginPath(); c.moveTo(24, y); c.lineTo(366, y); c.stroke();
    c.fillStyle = INK; c.font = sans(15, 600); c.fillText(dr.id, 24, y + 26);
    c.font = sans(13, 400); c.fillStyle = DIM; c.fillText(`→ ${dr.to}`, 86, y + 26);
    // battery bar
    c.strokeStyle = DIM; c.strokeRect(24.5, y + 39.5, 60, 9);
    c.fillStyle = dr.batt < 50 ? ACC : INK; c.fillRect(26, y + 41, 57 * dr.batt / 100, 6);
    c.fillStyle = INK; c.font = mono(11); c.fillText(`${dr.batt}%`, 92, y + 48);
    c.fillStyle = DIM; c.fillText(`WIND ${dr.wind.toFixed(1)}`, 150, y + 48);
    c.fillStyle = INK; c.font = mono(13, 500); c.fillText(`ETA ${dr.eta}`, 270, y + 48);
    y += 62;
  });
  c.strokeStyle = LINE2; c.beginPath(); c.moveTo(24, y); c.lineTo(366, y); c.stroke();
  // release button
  c.fillStyle = accent ? ACC : INK; c.beginPath(); c.roundRect(24, 770, 342, 50, 12); c.fill();
  c.fillStyle = BG; c.font = mono(13, 500); c.textAlign = 'center'; c.fillText('RELEASE LH-12 · CLINIC RUN', 195, 800); c.textAlign = 'left';
  c.fillStyle = DIM; c.font = mono(10); c.fillText('NEXT IN QUEUE · PAYLOAD 1.4 KG · 2 HELD FOR WIND', 24, 755);
  c.restore();
}

export const LOFTHAUL = { name: 'LOFTHAUL', kind: 'Drone-delivery dispatcher', accent: '#FF5B1F', ptW: PT_W, ptH: PT_H };

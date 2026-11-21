// HALVANE: a made-up watchmaker's online shop (concept product, not a client).
// The product page's configurator: the watch pulled apart along its axis, every part labelled, beside the options
// (dial, hands, case, strap), the specification and the reservation. Light, like paper; on hover the house colour is
// heat-blued steel, the colour of its hands and screws. Prices and specs are made up. 1440 x 900.
import { LIGHT, mono, serif, begin, end, txt, tw, line, rect, dot, hatch, button } from './kit.js';

const W = 1440, H = 900;
const T = LIGHT;
const K = 0.42;                    // the axonometric squash of every disc

/** the side wall of a disc of radius r and thickness t, centred at (x, y) on screen */
function wall(c, x, y, r, t, fill) {
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + r, y + t);
  c.ellipse(x, y + t, r, r * K, 0, 0, Math.PI, false);
  c.lineTo(x - r, y);
  c.ellipse(x, y, r, r * K, 0, Math.PI, 0, true);
  c.closePath();
  c.fillStyle = fill; c.fill(); c.strokeStyle = T.ink; c.lineWidth = 1; c.stroke();
}
/** draw a flat face in its own plane (centre 0,0, y down) squashed into the axonometric */
function face(c, x, y, fn) { c.save(); c.translate(x, y); c.scale(1, K); fn(); c.restore(); }
/** the line width that stays a hairline after the squash */
const hl = (w = 1) => w;

function gear(c, x, y, r, n, fill) {
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5) / n) * Math.PI * 2;
    c.lineTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r); c.lineTo(x + Math.cos(a0 + 0.02) * (r + 3), y + Math.sin(a0 + 0.02) * (r + 3));
    c.lineTo(x + Math.cos(a1 - 0.02) * (r + 3), y + Math.sin(a1 - 0.02) * (r + 3)); c.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
  }
  c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = T.ink; c.lineWidth = 0.8; c.stroke();
  // spokes
  c.beginPath(); c.arc(x, y, r * 0.72, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; c.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); c.lineTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72); }
  c.stroke();
}
function jewel(c, x, y) { dot(c, x, y, 3.6, '#FBFAF7', T.ink, 0.8); dot(c, x, y, 1.6, T.ink); }
function screw(c, x, y, col) { dot(c, x, y, 4.4, col, T.ink, 0.8); line(c, x - 3, y - 1.5, x + 3, y + 1.5, '#FBFAF7', 1.2); }

export function drawHalvane(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#B98A3E';   // brass (blue is kept for the cyanotype)
  const STEEL = accent ? A : T.ink;

  // ---- nav ----
  ['WATCHES', 'MOVEMENTS', 'ATELIER', 'JOURNAL'].forEach((t, i) => txt(c, t, 48 + i * 118, 46, mono(12, 500), i === 0 ? T.ink : T.dim));
  txt(c, 'HALVANE', 720, 50, serif(30, 600), T.ink, 'center', 6);
  txt(c, 'BAG (1)', 1392, 46, mono(12, 500), T.ink, 'right');
  txt(c, 'ACCOUNT', 1300, 46, mono(12, 500), T.dim, 'right');
  txt(c, 'SEARCH', 1196, 46, mono(12, 500), T.dim, 'right');
  line(c, 0, 78, W, 78, T.line2);
  txt(c, 'WATCHES  /  OPEN-HEART 38  /  CONFIGURE', 48, 112, mono(10.5), T.dim);

  // view switch
  let vx = 48;
  ['EXPLODED', 'ASSEMBLED', 'ON THE WRIST'].forEach((t, i) => {
    const w = tw(c, t, mono(10.5, 500)) + 24;
    rect(c, vx + 0.5, 134.5, w, 26, { fill: i === 0 ? T.ink : null, stroke: T.ink, r: 13 });
    txt(c, t, vx + w / 2, 151.5, mono(10.5, 500), i === 0 ? T.bg : T.ink, 'center');
    vx += w + 8;
  });

  // ---- the exploded watch ----
  const cx = 330;
  const L = { crystal: 226, case: 300, hands: 408, dial: 458, movement: 554, rotor: 656, back: 748 };
  // the axis
  line(c, cx, 170, cx, 820, T.dim, 1, [14, 4, 2, 4]);

  // caseback
  wall(c, cx, L.back, 160, 12, '#E2E0DA');
  face(c, cx, L.back, () => {
    dot(c, 0, 0, 160, '#ECEAE4', T.ink, hl());
    dot(c, 0, 0, 108, '#F6F5F1', T.ink, hl());
    hatch(c, -108, -108, 216, 216, 'rgba(18,18,18,.08)', 9, 1);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.save(); c.rotate(a); rect(c, 128, -6, 18, 12, { fill: T.bg, stroke: T.ink, r: 2 }); c.restore(); }
  });
  // rotor (automatic winding), with Geneva stripes
  wall(c, cx, L.rotor, 134, 5, '#D9D7D0');
  face(c, cx, L.rotor, () => {
    c.save(); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 134, Math.PI * 0.05, Math.PI * 0.95); c.closePath();
    c.fillStyle = '#E7E5DF'; c.fill(); c.clip();
    c.strokeStyle = 'rgba(18,18,18,.18)'; c.lineWidth = 1; for (let x = -140; x < 140; x += 9) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 30, 140); c.stroke(); }
    c.restore();
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 134, Math.PI * 0.05, Math.PI * 0.95); c.closePath(); c.strokeStyle = T.ink; c.lineWidth = 1; c.stroke();
    dot(c, 0, 0, 16, '#FBFAF7', T.ink, 1); dot(c, 0, 0, 6, T.ink);
    c.save(); c.translate(0, 96); c.scale(1, 1); txt(c, 'CALIBRE H7', 0, 0, mono(11, 500), T.ink, 'center'); c.restore();
  });
  // movement
  wall(c, cx, L.movement, 140, 14, '#D9D7D0');
  face(c, cx, L.movement, () => {
    dot(c, 0, 0, 140, '#E4E2DC', T.ink, 1);
    // bridges
    dot(c, 58, -58, 54, '#D3D1CA', T.ink, 1);
    c.beginPath(); c.moveTo(-20, -20); c.quadraticCurveTo(60, 20, 30, 100); c.lineTo(-10, 100); c.quadraticCurveTo(20, 30, -40, 0); c.closePath(); c.fillStyle = '#D3D1CA'; c.fill(); c.strokeStyle = T.ink; c.stroke();
    gear(c, 58, -58, 46, 64, '#C9C7C0');
    gear(c, 0, 0, 30, 48, '#BFBDB6');
    gear(c, 34, 40, 20, 34, '#BFBDB6');
    gear(c, 8, 74, 16, 28, '#BFBDB6');
    // escape wheel (hooked teeth) and pallet
    c.beginPath(); for (let i = 0; i < 15; i++) { const a = (i / 15) * Math.PI * 2; c.lineTo(-26 + Math.cos(a) * 11, 90 + Math.sin(a) * 11); c.lineTo(-26 + Math.cos(a + 0.3) * 6, 90 + Math.sin(a + 0.3) * 6); } c.closePath(); c.fillStyle = '#BFBDB6'; c.fill(); c.strokeStyle = T.ink; c.lineWidth = 0.8; c.stroke();
    line(c, -40, 80, -52, 72, T.ink, 1.4);
    // balance wheel and hairspring, under the dial's open heart
    dot(c, -66, 58, 32, null, T.ink, 2.2); dot(c, -66, 58, 27, null, T.ink, 0.8);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.3; line(c, -66, 58, -66 + Math.cos(a) * 27, 58 + Math.sin(a) * 27, T.ink, 1); }
    c.beginPath(); for (let t = 0; t < Math.PI * 9; t += 0.15) { const rr = 3 + t * 0.7; c.lineTo(-66 + Math.cos(t) * rr, 58 + Math.sin(t) * rr); } c.strokeStyle = T.dim; c.lineWidth = 0.6; c.stroke();
    [[58, -58], [0, 0], [34, 40], [8, 74], [-26, 90], [-66, 58]].forEach(([x, y]) => jewel(c, x, y));
    [[-104, -58], [102, 40], [-24, -112], [88, -98], [-6, 118]].forEach(([x, y]) => screw(c, x, y, STEEL));
  });
  // dial
  wall(c, cx, L.dial, 148, 3, '#EDEBE6');
  face(c, cx, L.dial, () => {
    dot(c, 0, 0, 148, '#FBFAF7', T.ink, 1);
    for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2; const r0 = i % 5 ? 140 : 132; line(c, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * 146, Math.sin(a) * 146, T.ink, i % 5 ? 0.8 : 1.4); }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2; if (i === 7 || i === 8) continue;
      c.save(); c.rotate(a); rect(c, 104, -3, 22, 6, { fill: T.ink }); c.restore();
    }
    // the open heart
    dot(c, -66, 58, 36, '#2B2B29', T.ink, 1.2);
    dot(c, -66, 58, 30, null, '#8F8E89', 1.6);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.9; line(c, -66, 58, -66 + Math.cos(a) * 30, 58 + Math.sin(a) * 30, '#8F8E89', 1); }
    txt(c, 'HALVANE', 0, -52, serif(17, 600), T.ink, 'center', 3);
    txt(c, 'AUTOMATIC · H7', 0, -32, mono(8.5), T.dim, 'center');
  });
  // hands, heat-blued
  face(c, cx, L.hands, () => {
    const hand = (ang, len, wid) => { c.save(); c.rotate(ang); c.beginPath(); c.moveTo(-18, 0); c.quadraticCurveTo(len * 0.4, -wid, len, 0); c.quadraticCurveTo(len * 0.4, wid, -18, 0); c.closePath(); c.fillStyle = STEEL; c.fill(); c.restore(); };
    // set to 3:27, so the hands fall forward of the case in the explode
    hand(0.236, 92, 9);
    hand(1.257, 132, 7);
    c.save(); c.rotate(Math.PI); line(c, -30, 0, 140, 0, STEEL, 1.4); c.restore();
    dot(c, 0, 0, 8, STEEL); dot(c, 0, 0, 2.5, T.bg);
  });
  // case and bezel, with lugs and crown
  wall(c, cx, L.case, 168, 18, '#E2E0DA');
  face(c, cx, L.case, () => {
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => rect(c, sx * 66 - 13, sy * 160 - (sy < 0 ? 42 : 0), 26, 42, { fill: '#ECEAE4', stroke: T.ink, r: 4 }));
    // the bezel ring only: the hands and dial below show through the opening
    c.beginPath(); c.arc(0, 0, 168, 0, Math.PI * 2); c.arc(0, 0, 150, 0, Math.PI * 2, true);
    c.fillStyle = '#ECEAE4'; c.fill(); c.strokeStyle = T.ink; c.lineWidth = 1; c.stroke();
    for (let i = 0; i < 120; i++) { const a = (i / 120) * Math.PI * 2; line(c, Math.cos(a) * 156, Math.sin(a) * 156, Math.cos(a) * 166, Math.sin(a) * 166, 'rgba(18,18,18,.3)', 1); }
  });
  rect(c, cx + 168, L.case - 1, 16, 20, { fill: '#ECEAE4', stroke: T.ink, r: 3 });
  for (let i = 1; i < 5; i++) line(c, cx + 168 + i * 3, L.case, cx + 168 + i * 3, L.case + 18, T.dim, 0.8);
  // sapphire crystal
  wall(c, cx, L.crystal, 152, 6, 'rgba(246,245,241,.75)');
  face(c, cx, L.crystal, () => {
    dot(c, 0, 0, 152, 'rgba(255,255,255,.55)', T.ink, 1);
    c.strokeStyle = 'rgba(18,18,18,.25)'; c.lineWidth = 1;
    c.beginPath(); c.arc(0, 0, 128, Math.PI * 1.1, Math.PI * 1.35); c.stroke(); c.beginPath(); c.arc(0, 0, 116, Math.PI * 1.12, Math.PI * 1.28); c.stroke();
  });

  // leaders
  const labels = [
    ['crystal', 152, '01  CRYSTAL', 'SAPPHIRE, ANTI-REFLECTIVE INSIDE'],
    ['case', 186, '02  CASE', 'STEEL, 38 MM, 10.4 MM THICK'],
    ['hands', 140, '03  HANDS', 'HEAT-BLUED STEEL'],
    ['dial', 148, '04  DIAL', 'OPALINE, OPEN AT SEVEN'],
    ['movement', 140, '05  MOVEMENT', 'CALIBRE H7, 25 JEWELS'],
    ['rotor', 134, '06  ROTOR', 'GENEVA STRIPES'],
    ['back', 160, '07  CASEBACK', 'SAPPHIRE WINDOW, SIX SCREWS'],
  ];
  labels.forEach(([k, r, a, b]) => {
    const y = L[k], x0 = cx + r + (k === 'case' ? 0 : 8);
    dot(c, x0, y, 2, T.ink);
    line(c, x0, y, 600, y, T.ink, 1);
    txt(c, a, 612, y + 1, mono(11, 500), T.ink);
    txt(c, b, 612, y + 17, mono(9.5), T.dim);
  });
  txt(c, 'FIG. 1 · EXPLODED VIEW · DRAG TO TURN', 48, 860, mono(10), T.dim);

  // ---- options ----
  const bx = 900, bw = 492;
  line(c, bx - 40, 96, bx - 40, 876, T.line2);
  txt(c, 'REF. HV-38 · MADE TO ORDER', bx, 128, mono(11), T.dim);
  txt(c, 'Open-Heart 38', bx, 178, serif(46, 500), T.ink);
  txt(c, 'Automatic calibre H7, its balance seen through the dial.', bx, 210, serif(19, 400), T.dim);
  txt(c, '€ 6,480', bx, 254, serif(26, 500), T.ink);
  txt(c, 'INCL. VAT', bx + 104, 252, mono(10), T.dim);

  const sect = (y, k, v) => { txt(c, k, bx, y, mono(11, 500), T.ink); txt(c, v, bx + bw, y, mono(11), T.dim, 'right'); };
  sect(300, 'DIAL', 'OPALINE');
  ['#FBFAF7', '#B9B7B1', '#4A4A47', '#121212'].forEach((f, i) => {
    const x = bx + 18 + i * 50;
    dot(c, x, 334, 16, f, T.ink, 1);
    if (i === 0) dot(c, x, 334, 21, null, T.ink, 1.2);
  });

  sect(384, 'HANDS', 'HEAT-BLUED STEEL');
  [['Heat-blued', true], ['Polished', false]].forEach(([t, on], i) => {
    const x = bx + i * 250, w = 242;
    rect(c, x + 0.5, 398.5, w, 52, { stroke: on ? T.ink : T.line2, lw: on ? 1.5 : 1, r: 6, fill: T.panel });
    c.save(); c.translate(x + 30, 424.5); c.rotate(-0.5);
    c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(8, -4, 24, 0); c.quadraticCurveTo(8, 4, -6, 0); c.fillStyle = on ? STEEL : '#9C9B96'; c.fill(); c.restore();
    txt(c, t, x + 64, 430, serif(17, 500), T.ink);
  });

  sect(492, 'CASE', '38 MM · STEEL');
  [['38 mm', true], ['40 mm', false]].forEach(([t, on], i) => {
    const x = bx + i * 120;
    rect(c, x + 0.5, 506.5, 112, 40, { stroke: on ? T.ink : T.line2, lw: on ? 1.5 : 1, r: 6, fill: T.panel });
    txt(c, t, x + 56, 531, mono(12, 500), on ? T.ink : T.dim, 'center');
  });
  [['Steel', true], ['Titanium', false]].forEach(([t, on], i) => {
    const x = bx + 252 + i * 120;
    rect(c, x + 0.5, 506.5, 112, 40, { stroke: on ? T.ink : T.line2, lw: on ? 1.5 : 1, r: 6, fill: T.panel });
    txt(c, t, x + 56, 531, mono(12, 500), on ? T.ink : T.dim, 'center');
  });

  sect(588, 'STRAP', 'CALF, UNDYED');
  let sx = bx;
  ['Calf, undyed', 'Cordovan, black', 'Steel mesh'].forEach((t, i) => {
    const w = tw(c, t, serif(16, 500)) + 32;
    rect(c, sx + 0.5, 602.5, w, 36, { stroke: i === 0 ? T.ink : T.line2, lw: i === 0 ? 1.5 : 1, r: 18, fill: T.panel });
    txt(c, t, sx + 16, 626, serif(16, 500), i === 0 ? T.ink : T.dim);
    sx += w + 8;
  });

  // specification
  const S = [['POWER RESERVE', '72 h'], ['FREQUENCY', '21,600 vph'], ['JEWELS', '25'], ['WATER', '50 m']];
  S.forEach(([k, v], i) => {
    const x = bx + (i % 2) * 250, y = 676 + Math.floor(i / 2) * 44;
    line(c, x, y, x + 242, y, T.line2);
    txt(c, k, x, y + 26, mono(10), T.dim);
    txt(c, v, x + 242, y + 27, serif(17, 500), T.ink, 'right');
  });
  line(c, bx, 764, bx + bw, 764, T.line2);

  button(c, bx, 790, bw, 54, 'RESERVE · DELIVERY IN 14 WEEKS', { fill: accent ? A : T.ink, color: T.bg, r: 8 });
  txt(c, '20% DEPOSIT · ENGRAVING INCLUDED · RETURNS WITHIN 30 DAYS', bx + bw / 2, 870, mono(9.5), T.dim, 'center');
  end(c);
}

export const HALVANE = {
  id: 'halvane', name: 'HALVANE', kind: 'Watchmaker’s online shop', desc: "a watchmaker's online shop", industry: 'Luxury retail',
  form: 'web', accent: '#B98A3E', w: W, h: H, theme: 'light',
  draw: drawHalvane,
};

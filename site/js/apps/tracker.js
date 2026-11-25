// Our made-up delivery tracker (the hallway's canvas 3 is its "which driver gets this delivery"; page 5's apps trip shows
// it running live on the two real phones). Drawn in code to the design ethos: ink on paper, hairlines, Newsreader + DM
// Mono, no pills, no fills but the route. d: 0..1, the driver's way along the route (the page moves it as you scroll).
// No brand, no claimed numbers: an order on its way, minutes left.
import { LIGHT } from '../engine/tokens.js';
import { SCREEN } from './booking.js';

// the street grid and the route, in screen units (360 x 780, y down); the map sits between the header and the footer
const MAP = { x: 24, y: 168, w: 312, h: 392 };
const ROUTE = [[56, 520], [56, 430], [150, 430], [150, 330], [250, 330], [250, 230], [306, 230], [306, 196]];
const len = (() => { let s = 0; for (let i = 1; i < ROUTE.length; i++) s += Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); return s; })();
function along(d) {
  let need = d * len;
  for (let i = 1; i < ROUTE.length; i++) {
    const [ax, ay] = ROUTE[i - 1], [bx, by] = ROUTE[i], l = Math.hypot(bx - ax, by - ay);
    if (need <= l) return [ax + (bx - ax) * need / l, ay + (by - ay) * need / l, i];
    need -= l;
  }
  return [...ROUTE[ROUTE.length - 1], ROUTE.length - 1];
}
/** draws the tracker into canvas c (its own size, the screen's proportions) */
export function drawTracker(c, d = 0, { ink = LIGHT.ink, paper = LIGHT.paper, graphite = LIGHT.graphite, blue = '#173F73' } = {}) {
  const x = c.getContext('2d'), k = c.width / SCREEN.w;
  x.setTransform(k, 0, 0, k, 0, 0);
  x.fillStyle = paper; x.fillRect(0, 0, SCREEN.w, SCREEN.h);
  const mono = (s, w = 500) => `${w} ${s}px "DM Mono", ui-monospace, monospace`, serif = (s) => `420 ${s}px Newsreader, Georgia, serif`;
  const text = (t, px, py, font, col = ink, ls = 0) => { x.font = font; if ('letterSpacing' in x) x.letterSpacing = `${ls}px`; x.fillStyle = col; x.fillText(t, px, py); };
  const hl = (x0, y0, x1, y1, col = ink, w = 1 / k * 1.2) => { x.strokeStyle = col; x.lineWidth = Math.max(w, 1 / k); x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); };
  // header
  text('DELIVERY · ORDER 0417', 24, 104, mono(11), graphite, 0.7);
  const mins = Math.max(1, Math.round(12 * (1 - d)));
  text(d >= 0.999 ? 'At your door' : `Arriving in ${mins} min`, 22, 146, serif(32));
  // the map: a street grid, faint
  x.save(); x.beginPath(); x.rect(MAP.x, MAP.y, MAP.w, MAP.h); x.clip();
  for (let gx = MAP.x; gx <= MAP.x + MAP.w; gx += 47) hl(gx, MAP.y, gx, MAP.y + MAP.h, 'rgba(18,18,18,.16)');
  for (let gy = MAP.y; gy <= MAP.y + MAP.h; gy += 50) hl(MAP.x, gy, MAP.x + MAP.w, gy, 'rgba(18,18,18,.16)');
  x.restore();
  x.strokeStyle = ink; x.lineWidth = 1 / k * 1.2; x.strokeRect(MAP.x, MAP.y, MAP.w, MAP.h);
  // the route: done in blue, still to go in ink, dashed
  const [px, py, seg] = along(d);
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = blue; x.lineWidth = 4; x.beginPath(); x.moveTo(...ROUTE[0]); for (let i = 1; i < seg; i++) x.lineTo(...ROUTE[i]); x.lineTo(px, py); x.stroke();
  x.strokeStyle = ink; x.lineWidth = 1.4; x.setLineDash([5, 5]); x.beginPath(); x.moveTo(px, py); for (let i = seg; i < ROUTE.length; i++) x.lineTo(...ROUTE[i]); x.stroke(); x.setLineDash([]);
  // the shop (a square), home (a circle), the driver (a filled dot with a ring)
  x.lineWidth = 1.4; x.strokeStyle = ink; x.strokeRect(ROUTE[0][0] - 8, ROUTE[0][1] - 8, 16, 16);
  const [hx, hy] = ROUTE[ROUTE.length - 1]; x.beginPath(); x.arc(hx, hy, 9, 0, Math.PI * 2); x.stroke();
  x.fillStyle = blue; x.beginPath(); x.arc(px, py, 7, 0, Math.PI * 2); x.fill();
  x.strokeStyle = blue; x.lineWidth = 1; x.beginPath(); x.arc(px, py, 13, 0, Math.PI * 2); x.stroke();
  text('SHOP', ROUTE[0][0] + 16, ROUTE[0][1] + 4, mono(10), graphite, 0.6);
  text('HOME', hx - 52, hy + 4, mono(10), graphite, 0.6);
  // the steps, as ticks along a hairline
  const steps = ['PACKED', 'PICKED UP', 'NEARBY', 'DELIVERED'], y0 = 612, x0 = 24, x1 = 336;
  hl(x0, y0, x1, y0);
  steps.forEach((s, i) => {
    const sx = x0 + (x1 - x0) * i / (steps.length - 1), done = d >= [0, 0.08, 0.7, 0.999][i];
    x.fillStyle = done ? ink : paper; x.strokeStyle = ink; x.lineWidth = 1.2; x.beginPath(); x.rect(sx - 5, y0 - 5, 10, 10); x.fill(); x.stroke();
    x.font = mono(9); if ('letterSpacing' in x) x.letterSpacing = '0.5px';
    const tw = x.measureText(s).width; text(s, Math.min(x1 - tw, Math.max(x0, sx - tw / 2)), y0 + 26, mono(9), done ? ink : graphite, 0.5);
  });
  // the driver
  hl(24, 668, 336, 668, 'rgba(18,18,18,.3)');
  text('YOUR DRIVER', 24, 700, mono(10), graphite, 0.6);
  text('On the way, nearest first', 24, 728, serif(19));
}

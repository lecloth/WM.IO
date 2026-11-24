// Our made-up booking app (a concept product, Part 5: the designs are ours; no brands inside the app, no fabricated
// proof: no ratings, reviews, customer names or numbers that claim anything). Drawn in code to the design ethos: ink on
// paper, hairlines, Newsreader + DM Mono, no pills, no fills, no checkmark icons. One layout, used twice:
//   drawBooking(canvas): the real screen (on the real phones' displays, the corridor's frame 4 stills, the asset sheet)
//   bookingPlan(): the same layout as plain geometry, for the blueprint of the screen (corridor frame 4)
// Units: a 360 x 780 screen (portrait), y down.
import { LIGHT } from '../engine/tokens.js';
export const SCREEN = { w: 360, h: 780 };
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], DATES = ['24', '25', '26', '27', '28', '29', '30'];
const TIMES = ['18:00', '18:30', '19:00', '19:30', '20:00'];
const PICK_DAY = 4, PICK_TIME = 2;

/** the layout as geometry: hairlines, boxes, the picked marks, and text runs (with their role) */
export function bookingPlan() {
  const L = 24, R = SCREEN.w - 24, cell = (R - L) / 7;
  const lines = [], boxes = [], marks = [], text = [];
  text.push({ t: 'BOOK A TABLE', x: L, y: 104, size: 11, role: 'mono' });
  text.push({ t: 'Pick a time', x: L - 1, y: 148, size: 36, role: 'title' });
  lines.push([L, 170, R, 170]);
  DAYS.forEach((d, i) => {
    const x = L + i * cell;
    text.push({ t: d, x: x + cell / 2, y: 198, size: 9, role: 'mono', anchor: 'center' });
    text.push({ t: DATES[i], x: x + cell / 2, y: 228, size: 20, role: 'num', anchor: 'center' });
    if (i === PICK_DAY) boxes.push([x + 3, 180, cell - 6, 62]);
  });
  lines.push([L, 252, R, 252]);
  text.push({ t: 'Guests', x: L, y: 288, size: 19, role: 'body' });
  text.push({ t: '−   2   +', x: R, y: 288, size: 15, role: 'mono', anchor: 'right' });
  lines.push([L, 308, R, 308]);
  text.push({ t: 'TIME', x: L, y: 340, size: 10, role: 'mono' });
  let y = 352; lines.push([L, y, R, y]);
  TIMES.forEach((t, i) => {
    text.push({ t, x: L + 40, y: y + 34, size: 20, role: 'body' });
    const bx = R - 22, by = y + 16;
    boxes.push([bx, by, 22, 22]);
    if (i === PICK_TIME) marks.push([bx + 4, by + 18, bx + 18, by + 4]);   // the picked row: one hairline stroke corner to corner
    y += 54; lines.push([L, y, R, y]);
  });
  // Confirm: the word and a drafting leader run out to the edge (the site's Send A)
  text.push({ t: 'Confirm', x: L - 1, y: 708, size: 34, role: 'title' });
  const ay = 697;
  lines.push([L + 132, ay, R - 4, ay]);
  marks.push([R - 16, ay - 5, R, ay], [R - 16, ay + 5, R, ay]);
  text.push({ t: 'FRI 28 · 19:00 · 2 GUESTS', x: L, y: 744, size: 10, role: 'mono' });
  return { lines, boxes, marks, text, L, R };
}

/** the real screen, on a canvas (any size with the screen's proportions) */
export function drawBooking(c, { ink = LIGHT.ink, paper = LIGHT.paper, graphite = LIGHT.graphite } = {}) {
  const x = c.getContext('2d'), k = c.width / SCREEN.w, p = bookingPlan();
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.fillStyle = paper; x.fillRect(0, 0, c.width, c.height);
  x.setTransform(k, 0, 0, k, 0, 0);
  const hw = Math.max(1 / k, 0.75);
  x.strokeStyle = ink; x.lineWidth = hw;
  x.globalAlpha = 0.55; p.lines.forEach(([a, b, cc, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(cc, d); x.stroke(); });
  x.globalAlpha = 1; x.lineWidth = hw * 1.2;
  p.boxes.forEach(([a, b, w, h]) => x.strokeRect(a, b, w, h));
  p.marks.forEach(([a, b, cc, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(cc, d); x.stroke(); });
  p.text.forEach((t) => {
    x.fillStyle = t.role === 'mono' ? graphite : ink;
    x.font = t.role === 'mono' ? `500 ${t.size}px "DM Mono", monospace` : t.role === 'num' ? `400 ${t.size}px Newsreader, Georgia, serif` : `400 ${t.size}px Newsreader, Georgia, serif`;
    if (t.role === 'title') x.font = `420 ${t.size}px Newsreader, Georgia, serif`;
    x.textAlign = t.anchor === 'center' ? 'center' : t.anchor === 'right' ? 'right' : 'left';
    x.textBaseline = 'alphabetic';
    if (t.role === 'mono') { x.letterSpacing = '0.08em'; } else x.letterSpacing = '0px';
    x.fillText(t.t, t.x, t.y);
  });
  x.letterSpacing = '0px';
  x.setTransform(1, 0, 0, 1, 0, 0);
}

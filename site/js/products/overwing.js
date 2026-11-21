// OVERWING: a made-up private-jet charter app (concept product, not a client).
// The trip on the morning of the flight: the route, the departure countdown, a live seat map of the cabin with each
// guest's note, and the crew. Dark screen; champagne only on hover. Guests and crew are placeholders, not people.
// The field codes are deliberately not real airports: ICAO keeps Q for non-geographic uses, so no airport code starts with Q. 390 x 844.
import { DARK, mono, serif, begin, end, txt, line, rect, dot, statusBar, phoneHeader, section, button } from './kit.js';

const W = 390, H = 844;
const T = DARK;

/** a seat seen from above; face = 1 forward (backrest below), -1 aft (backrest above) */
function seat(c, x, y, id, face, state, ACC) {
  const w = 24, h = 26;
  const fill = state === 'sel' ? ACC : state === 'occ' ? '#6E6D69' : null;
  rect(c, x - w / 2 + 0.5, y - h / 2 + 0.5, w - 1, h - 1, { fill, stroke: state === 'empty' ? T.dim : (state === 'sel' ? ACC : T.ink), r: 5 });
  const by = face > 0 ? y + h / 2 - 6 : y - h / 2 + 2;
  rect(c, x - w / 2 + 3, by, w - 6, 4, { fill: state === 'empty' ? null : T.bg, stroke: state === 'empty' ? T.dim : null, r: 1.5 });
  txt(c, id, x, y + (face > 0 ? -2 : 7), mono(8.5, 500), state === 'empty' ? T.dim : T.bg, 'center');
}

export function drawOverwing(canvas, { accent = false } = {}) {
  const c = begin(canvas, W, T.bg);
  const A = '#D8B98A';
  const ACC = accent ? A : T.hi;

  statusBar(c, T, '07:16');
  phoneHeader(c, T, 'OVERWING', 'TRIP OW-218 · MIDSIZE JET', 'ON TIME', ACC);

  // ---- route ----
  txt(c, 'QOSF', 24, 158, serif(30, 600), T.ink);
  txt(c, 'OSTREL FIELD', 24, 177, mono(9.5), T.dim);
  txt(c, 'QAVC', 366, 158, serif(30, 600), T.ink, 'right');
  txt(c, 'AVELLINE COAST', 366, 177, mono(9.5), T.dim, 'right');
  c.strokeStyle = T.dim; c.lineWidth = 1; c.setLineDash([2, 4]);
  c.beginPath(); c.moveTo(124, 150); c.quadraticCurveTo(195, 118, 266, 150); c.stroke(); c.setLineDash([]);
  dot(c, 124, 150, 2.5, T.ink); dot(c, 266, 150, 2.5, null, T.ink);
  // the aircraft, a quarter of the way along
  c.save(); c.translate(160, 138); c.rotate(-0.28); c.fillStyle = ACC;
  c.beginPath(); c.moveTo(9, 0); c.lineTo(-7, -2); c.lineTo(-2, -2); c.lineTo(-6, -8); c.lineTo(-3, -8); c.lineTo(3, -2); c.lineTo(3, 2); c.lineTo(-3, 8); c.lineTo(-6, 8); c.lineTo(-2, 2); c.lineTo(-7, 2); c.closePath(); c.fill(); c.restore();
  txt(c, '2 H 05 · 1,140 km', 195, 176, mono(9.5), T.dim, 'center');

  // ---- countdown ----
  rect(c, 16.5, 204.5, 357, 92, { fill: T.panel, stroke: T.line2, r: 14 });
  txt(c, 'DEPARTS IN', 34, 230, mono(10), T.dim);
  txt(c, '00:42:18', 34, 274, mono(34, 500), T.ink);
  [['BOARD', '07:40'], ['WHEELS UP', '07:58'], ['STAND', '6 · FBO WEST']].forEach(([k, v], i) => {
    txt(c, k, 232, 230 + i * 22, mono(9.5), T.dim);
    txt(c, v, 356, 230 + i * 22, mono(10, 500), T.ink, 'right');
  });

  // ---- cabin ----
  section(c, T, 24, 366, 330, 'CABIN · 6 OF 9 SEATS', 'GUEST NOTES');
  const fx0 = 40, fx1 = 152, cx = 96, top = 350;
  c.strokeStyle = T.ink; c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(fx0, 690); c.lineTo(fx0, 446);
  c.bezierCurveTo(fx0, 392, cx - 26, top, cx, top);
  c.bezierCurveTo(cx + 26, top, fx1, 392, fx1, 446); c.lineTo(fx1, 690);
  c.stroke();
  // section break at the tail (the rest of the airframe is not drawn)
  c.beginPath(); c.moveTo(fx0 - 6, 694); c.lineTo(cx - 8, 694); c.lineTo(cx - 3, 686); c.lineTo(cx + 3, 702); c.lineTo(cx + 8, 694); c.lineTo(fx1 + 6, 694); c.stroke();
  // windows
  for (let y = 470; y <= 660; y += 26) { line(c, fx0 + 3, y, fx0 + 3, y + 10, T.dim, 1.5); line(c, fx1 - 3, y, fx1 - 3, y + 10, T.dim, 1.5); }
  // flight deck
  seat(c, cx - 15, 400, '', 1, 'empty', ACC); seat(c, cx + 15, 400, '', 1, 'empty', ACC);
  txt(c, 'FLIGHT DECK', cx, 380, mono(7.5, 500), T.dim, 'center');
  line(c, fx0 + 6, 426, fx1 - 6, 426, T.ink, 1);
  // door (left) and galley (right)
  c.fillStyle = T.bg; c.fillRect(fx0 - 2, 432, 4, 26);
  c.strokeStyle = T.dim; c.lineWidth = 1; c.beginPath(); c.arc(fx0, 432, 26, 0, Math.PI / 2); c.stroke(); line(c, fx0, 432, fx0 + 26, 432, T.dim);
  rect(c, 112.5, 432.5, 34, 26, { stroke: T.dim, r: 2 }); txt(c, 'GALLEY', 129.5, 449, mono(7, 500), T.dim, 'center');
  // club four with tables, then the rear: one seat and a three-place divan
  seat(c, 64, 486, '1A', -1, 'occ', ACC); seat(c, 128, 486, '1B', -1, 'occ', ACC);
  rect(c, 54.5, 506.5, 20, 9, { stroke: T.dim, r: 1.5 }); rect(c, 118.5, 506.5, 20, 9, { stroke: T.dim, r: 1.5 });
  seat(c, 64, 536, '2A', 1, 'occ', ACC); seat(c, 128, 536, '2B', 1, 'sel', ACC);
  seat(c, 64, 592, '3A', 1, 'occ', ACC); seat(c, 64, 628, '3B', 1, 'empty', ACC);
  rect(c, 120.5, 572.5, 24, 86, { stroke: T.ink, r: 5 }); rect(c, 138, 576, 4, 78, { fill: T.bg, stroke: T.ink, r: 1.5 });
  rect(c, 123, 576, 13, 24, { fill: '#6E6D69', r: 3 }); txt(c, '3C', 129.5, 592, mono(7.5, 500), T.bg, 'center');
  rect(c, 123.5, 603.5, 12, 23, { stroke: T.dim, r: 3 }); rect(c, 123.5, 630.5, 12, 23, { stroke: T.dim, r: 3 });
  rect(c, 112.5, 666.5, 34, 20, { stroke: T.dim, r: 2 }); txt(c, 'LAV', 129.5, 680, mono(7, 500), T.dim, 'center');
  // aisle centre line
  line(c, cx, 466, cx, 684, T.line2, 1, [6, 3, 1, 3]);

  // guest notes
  const G = [['1A', 'GUEST 1', 'LEAD PASSENGER'], ['1B', 'GUEST 2', 'VEGETARIAN'], ['2A', 'GUEST 3', 'CHAIR AT ARRIVAL'],
    ['2B', 'GUEST 4', 'STILL WATER, NO ICE'], ['3A', 'GUEST 5', 'INFANT, 9 MONTHS'], ['3C', 'GUEST 6', 'DOG IN CABIN · 7 kg']];
  let y = 344;
  G.forEach(([s, g, n]) => {
    const sel = s === '2B';
    line(c, 176, y, 366, y, T.line2);
    if (sel) { c.fillStyle = accent ? 'rgba(216,185,138,.16)' : '#1A1A19'; c.fillRect(176, y + 1, 190, 51); line(c, 176, y + 1, 176, y + 52, ACC, 2); }
    txt(c, g, 186, y + 22, mono(10.5, 500), T.ink);
    txt(c, s, 358, y + 22, mono(10.5, 500), sel ? ACC : T.dim, 'right');
    txt(c, n, 186, y + 40, mono(9), T.dim);
    y += 53;
  });
  line(c, 176, y, 366, y, T.line2);

  // ---- crew ----
  line(c, 24, 712, 366, 712, T.line2);
  [['PIC', 'Crew 07'], ['SIC', 'Crew 12'], ['CABIN', 'Crew 21']].forEach(([k, v], i) => {
    const x = 24 + i * 118;
    txt(c, k, x, 730, mono(9.5), T.dim);
    txt(c, v, x, 750, serif(15, 600), T.ink);
  });

  // ---- action ----
  button(c, 24, 770, 342, 50, 'CONFIRM CATERING · 6 GUESTS', { fill: ACC, color: T.bg, r: 12 });
  end(c);
}

export const OVERWING = {
  id: 'overwing', name: 'OVERWING', kind: 'Private-jet charter app', desc: 'a private-jet charter app', industry: 'Aviation',
  form: 'phone', accent: '#D8B98A', w: W, h: H, theme: 'dark',
  flow: { steps: ['OPEN', 'TRIP', 'SEAT GUESTS', 'CHECK SLOT', 'BOARD', 'WHEELS UP'], hold: [3, 1, 'SLOT'] },
  draw: drawOverwing,
};

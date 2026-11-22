// Fig. 7: the bench, in plan. A room drawn in hairlines (hatched walls, one door, a plan chest) with one long
// drafting bench of five numbered desks, each a discipline. No people, no chairs, no faces: only the furniture of
// the work. A small sheet travels this sheet's own route: drawn at 05 Strategy, checked at 01 Design, approved at
// 03 Security, then filed in the plan chest. Geometry is in viewBox units (640 x 480).
import { clamp, drawable } from '../engine/kit.js';

const NS = 'http://www.w3.org/2000/svg';
export const VB = { w: 640, h: 440 };

export const DESKS = [
  { no: '01', name: 'Design', sub: 'screens · flows' },
  { no: '02', name: 'Engineering', sub: 'code · servers' },
  { no: '03', name: 'Security', sub: 'locks · keys' },
  { no: '04', name: 'AI', sub: 'agents · models' },
  { no: '05', name: 'Strategy', sub: 'problem · plan' },
];

// room
const O = { x0: 16, y0: 70, x1: 624, y1: 404 };          // outer wall face
const I = { x0: 26, y0: 80, x1: 614, y1: 394 };          // inner wall face
const DOOR = { a: 70, b: 140 };                          // opening in the bottom wall
const BENCH = { x0: 56, x1: 584, y0: 80, y1: 150 };
const DW = (BENCH.x1 - BENCH.x0) / 5;
const cx = (i) => BENCH.x0 + DW * i + DW / 2;
const BOARD_Y = 113;                                      // where a sheet lies on a board
const PASS_Y = 206;                                       // the pass line in front of the bench
const CHEST = { x0: 540, x1: 604, y0: 232, y1: 352 };
const CHEST_MID = (CHEST.y0 + CHEST.y1) / 2;
const LAND = (i) => cx(i) - 14;                           // the route lands left of centre; stamps sit right
// this sheet's route (title block 07): drawn at 05, checked at 01, approved at 03
export const ROUTE = [
  { desk: 4, stamp: 'Drawn', short: 'D' },
  { desk: 0, stamp: 'Checked', short: 'C' },
  { desk: 2, stamp: 'Approved', short: 'A' },
];

function el(name, attrs, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
}

/** orthogonal route with filleted corners through points [[x,y],...] */
function fillet(pts, r = 9) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
    const dot = ((x - px) * (nx - x) + (y - py) * (ny - y)) / (l1 * l2);
    if (dot < -0.5) { d += ` L${x},${y}`; continue; }   // a reversal (down to a desk and back): no fillet
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = x - ((x - px) / l1) * rr, ay = y - ((y - py) / l1) * rr;
    const bx = x + ((nx - x) / l2) * rr, by = y + ((ny - y) / l2) * rr;
    d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${x},${y} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx},${ly}`;
}

export function buildPlan(svg, labels) {
  svg.setAttribute('viewBox', `0 0 ${VB.w} ${VB.h}`);
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const pat = el('pattern', { id: 's07-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 's07p-hatchline' }, pat);

  const g = el('g', { class: 's07p' }, svg);
  const groups = [];   // [ [elements], from, to ] draw windows in 0..1
  const add = (list, a, b) => { groups.push({ els: list.map((e) => ({ e, draw: drawable(e) })), a, b }); };

  // walls: hatched ring (fill shows once drawn) + outer and inner faces + door jambs
  const ring = el('path', { class: 's07p-wall', 'fill-rule': 'evenodd',
    d: `M${DOOR.a},${O.y1} H${O.x0} V${O.y0} H${O.x1} V${O.y1} H${DOOR.b} V${I.y1} H${I.x1} V${I.y0} H${I.x0} V${I.y1} H${DOOR.a} Z` }, g);
  const outer = el('path', { class: 's07p-line s07p-line--heavy', d: `M${DOOR.a},${O.y1} H${O.x0} V${O.y0} H${O.x1} V${O.y1} H${DOOR.b}` }, g);
  const inner = el('path', { class: 's07p-line s07p-line--heavy', d: `M${DOOR.a},${I.y1} H${I.x0} V${I.y0} H${I.x1} V${I.y1} H${DOOR.b}` }, g);
  const jambs = el('path', { class: 's07p-line s07p-line--heavy', d: `M${DOOR.a},${I.y1} V${O.y1} M${DOOR.b},${I.y1} V${O.y1}` }, g);
  add([outer, inner], 0, 0.42); add([jambs], 0.36, 0.44);

  // the bench and its five desks: drawing board, parallel-motion straightedge, set square
  const bench = el('path', { class: 's07p-line', d: `M${BENCH.x0},${BENCH.y0} V${BENCH.y1} H${BENCH.x1} V${BENCH.y0}` }, g);
  add([bench], 0.3, 0.55);
  const deskEls = [], fineEls = [];
  for (let i = 0; i < 5; i++) {
    const x0 = BENCH.x0 + DW * i;
    if (i > 0) deskEls.push(el('path', { class: 's07p-line s07p-line--fine', d: `M${x0},${BENCH.y0 + 4} V${BENCH.y1 - 4}`, 'stroke-dasharray': '2 3' }, g));
    deskEls.push(el('path', { class: 's07p-line', d: `M${x0 + 12},${BENCH.y0 + 8} H${x0 + DW - 12} V${BENCH.y1 - 12} H${x0 + 12} Z` }, g));
    fineEls.push(el('path', { class: 's07p-line s07p-line--fine', d: `M${x0 + 7},${BOARD_Y + 8} H${x0 + DW - 7}` }, g));
    fineEls.push(el('path', { class: 's07p-line s07p-line--fine', d: `M${x0 + DW - 40},${BOARD_Y + 8} V${BOARD_Y - 12} L${x0 + DW - 22},${BOARD_Y + 8}` }, g));
  }
  add(deskEls, 0.42, 0.7); add(fineEls, 0.55, 0.8);

  // plan chest: where finished sheets are filed
  const chest = [el('path', { class: 's07p-line', d: `M${CHEST.x0},${CHEST.y0} H${CHEST.x1} V${CHEST.y1} H${CHEST.x0} Z` }, g)];
  for (let y = CHEST.y0 + 20; y < CHEST.y1; y += 20) chest.push(el('path', { class: 's07p-line s07p-line--fine', d: `M${CHEST.x0 + 4},${y} H${CHEST.x1 - 4}` }, g));
  add(chest, 0.5, 0.8);

  // the door: leaf on its hinge + swing arc (the founder screen opens it)
  const hinge = [DOOR.a, I.y1], R = DOOR.b - DOOR.a;
  const leaf = el('g', { class: 's07p-leaf' }, g);
  el('path', { class: 's07p-line s07p-line--heavy', d: `M${hinge[0]},${hinge[1]} H${hinge[0] + R} V${hinge[1] - 3} H${hinge[0]} Z` }, leaf);
  const arc = el('path', { class: 's07p-line s07p-line--fine', d: `M${DOOR.b},${I.y1} A${R},${R} 0 0 0 ${DOOR.a},${I.y1 - R}` }, g);
  const arcLen = arc.getTotalLength();

  // leaders: desk labels sit outside the room, above the top wall; chest and door labels below
  const leaders = [];
  for (let i = 0; i < 5; i++) leaders.push(el('path', { class: 's07p-line s07p-line--fine', d: `M${cx(i)},${48} V${BENCH.y0 + 8}` }, g));
  leaders.push(el('path', { class: 's07p-line s07p-line--fine', d: `M${(CHEST.x0 + CHEST.x1) / 2},${CHEST.y1} V${O.y1 + 14}` }, g));
  add(leaders, 0.72, 0.95);
  const doorLeader = el('path', { class: 's07p-line s07p-line--fine', d: `M${DOOR.a + R * 0.62},${I.y1 - R * 0.3} L${DOOR.a + R + 24},${O.y1 + 14}` }, g);
  const doorDraw = drawable(doorLeader);
  for (const e of leaders) { const c = el('circle', { class: 's07p-dot', cx: e.getPointAtLength(e.getTotalLength()).x, cy: e.getPointAtLength(e.getTotalLength()).y, r: 1.6 }, g); c.dataset.dot = '1'; }

  // the route: a trail (hidden-line dashes) and the sheet itself, with its own tiny title block
  const pts = [[LAND(4), BOARD_Y], [LAND(4), PASS_Y], [LAND(0), PASS_Y], [LAND(0), BOARD_Y], [LAND(0), PASS_Y + 22], [LAND(2), PASS_Y + 22], [LAND(2), BOARD_Y], [LAND(2), PASS_Y + 44],
    [CHEST.x0 - 28, PASS_Y + 44], [CHEST.x0 - 28, CHEST_MID], [(CHEST.x0 + CHEST.x1) / 2, CHEST_MID]];
  const routeD = fillet(pts);
  const mask = el('mask', { id: 's07-trail', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: VB.w, height: VB.h }, defs);
  const route = el('path', { class: 's07p-trailmask', d: routeD }, mask);       // solid copy: how far the sheet has got
  el('path', { class: 's07p-route', d: routeD, mask: 'url(#s07-trail)' }, g);   // the trail itself, in hidden-line dashes
  const routeLen = route.getTotalLength();
  route.style.strokeDasharray = `0 ${routeLen}`;
  // arc-length positions of the three desks and the chest along the route
  const stops = [];
  { // sample the path to find where it passes each landing point
    const targets = [[LAND(4), BOARD_Y], [LAND(0), BOARD_Y], [LAND(2), BOARD_Y], [(CHEST.x0 + CHEST.x1) / 2, CHEST_MID]];
    let ti = 0;
    for (let s = 0; s <= routeLen && ti < targets.length; s += 0.5) {
      const q = route.getPointAtLength(s);
      if (Math.hypot(q.x - targets[ti][0], q.y - targets[ti][1]) < 0.8) { stops.push(s); ti++; s += 12; }
    }
    while (stops.length < 4) stops.push(routeLen);
  }
  const sheet = el('g', { class: 's07p-sheet' }, g);
  el('rect', { x: -12, y: -8.5, width: 24, height: 17, class: 's07p-sheet__paper' }, sheet);
  el('path', { d: 'M3,8.5 V4 H12 M7,4 V8.5', class: 's07p-sheet__tb' }, sheet);

  // HTML labels (CSS sizes them, so they stay readable at any drawing scale)
  labels.innerHTML = '';
  const pct = (x, y) => `left:${(x / VB.w * 100).toFixed(3)}%;top:${(y / VB.h * 100).toFixed(3)}%`;
  const deskLabels = DESKS.map((d, i) => {
    const n = document.createElement('p'); n.className = 's07l-desk mono'; n.style.cssText = pct(cx(i), 46);
    n.innerHTML = `<span class="s07l-no">${d.no}</span><span class="s07l-name">${d.name}</span><span class="s07l-sub">${d.sub}</span>`;
    labels.appendChild(n); return n;
  });
  const stamps = ROUTE.map((r) => {
    const s = document.createElement('p'); s.className = 's07l-stamp mono'; s.style.cssText = pct(cx(r.desk) + 6, BENCH.y1 + 14);
    s.innerHTML = `<span class="s07l-stamp__long">${r.stamp}</span><span class="s07l-stamp__short">${r.short}</span>`;
    labels.appendChild(s); return s;
  });
  const chestLabel = document.createElement('p'); chestLabel.className = 's07l-under mono'; chestLabel.style.cssText = pct((CHEST.x0 + CHEST.x1) / 2, O.y1 + 16);
  chestLabel.textContent = 'Plan chest'; labels.appendChild(chestLabel);
  const filed = document.createElement('p'); filed.className = 's07l-stamp s07l-stamp--filed mono'; filed.style.cssText = pct(CHEST.x0 - 6, CHEST_MID + 12);
  filed.innerHTML = '<span class="s07l-stamp__long">Filed</span><span class="s07l-stamp__short">F</span>'; labels.appendChild(filed);
  const doorLabel = document.createElement('p'); doorLabel.className = 's07l-under s07l-under--door mono'; doorLabel.style.cssText = pct(DOOR.a + R + 24, O.y1 + 16);
  doorLabel.innerHTML = '<span>Door · one name</span><b>Wajih Mansouri</b>'; labels.appendChild(doorLabel);
  const doorPlain = document.createElement('p'); doorPlain.className = 's07l-under s07l-under--plain mono'; doorPlain.style.cssText = pct(DOOR.a + R / 2, O.y1 + 16);
  doorPlain.textContent = 'Door'; labels.appendChild(doorPlain);
  const dots = [...g.querySelectorAll('[data-dot]')];

  let lastT = -1;
  return {
    /** t 0..1: the room draws itself */
    draw(t) {
      if (Math.abs(t - lastT) < 1e-4) return; lastT = t;
      for (const gr of groups) { const k = clamp((t - gr.a) / (gr.b - gr.a)); for (const x of gr.els) x.draw(k); }
      ring.classList.toggle('is-on', t >= 0.45);
      dots.forEach((d) => d.classList.toggle('is-on', t >= 0.95));
    },
    labels(on) {
      deskLabels.forEach((n) => n.classList.toggle('is-on', on));
      chestLabel.classList.toggle('is-on', on);
    },
    /** route progress r 0..1 over [0 .. chest]; returns the index of the last stop reached */
    route(r) {
      const on = r > 0;
      sheet.style.visibility = on ? 'inherit' : 'hidden';
      const s = clamp(r) * stops[3];
      route.style.strokeDasharray = `${s.toFixed(1)} ${routeLen}`;
      const q = route.getPointAtLength(Math.max(0, s));
      sheet.setAttribute('transform', `translate(${q.x.toFixed(2)},${q.y.toFixed(2)})`);
      sheet.classList.toggle('is-filed', r >= 1);
      stamps.forEach((st, i) => st.classList.toggle('is-on', on && s >= stops[i] - 0.5));
      filed.classList.toggle('is-on', r >= 1);
    },
    /** the stops along the route, as fractions of the whole route (for timing) */
    stopFractions: () => stops.map((s) => s / stops[3]),
    /** door: a 0..1 opens the leaf and draws its swing; named shows the name plate */
    door(a, named, shown = true) {
      leaf.style.visibility = shown ? 'inherit' : 'hidden';
      leaf.setAttribute('transform', `rotate(${(-90 * a).toFixed(2)} ${hinge[0]} ${hinge[1]})`);
      arc.style.opacity = a > 0.001 ? '1' : '0';
      arc.style.strokeDasharray = `${(arcLen * a).toFixed(1)} ${arcLen}`;
      doorDraw(named ? 1 : 0);
      doorLabel.classList.toggle('is-on', named);
      doorPlain.classList.toggle('is-on', shown && !named);
      leaf.classList.toggle('is-named', named);
    },
  };
}

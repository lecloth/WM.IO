// Sheet 03 · Security. A fresh sheet slides over engineering; Yale's 1865 plate (reading moment); Figs. 4 and 6 lift off
// the plate, turn upright and redraw line by line into a pin-tumbler cylinder in section; the right key lines the pins
// up at the shear line and the plug turns; then a pick attempt: one pin sets, the notched pin catches, the plug binds
// and the attempt fails; then "We pick our own locks first." (reading moment) and what we offer (reading moment).
// render(p) is a pure function of p (viewport heights, 0 .. units + 1). Text is shown or hidden, never scrubbed.
import { chapter, clamp, span, ease, rem } from '../engine/kit.js';
import { Lock, G } from './lock.js';
import { PlateFig } from './plate-fig.js';
import { FIG4 } from './yale-fig4.js';

const NS = 'http://www.w3.org/2000/svg';
export const T = {
  entry: [0, 1], plateText: [1.0, 2.5], move: [2.55, 3.1], sweep: [3.1, 3.75], draw: [3.3, 4.05],
  key: [4.45, 5.1], turn: [5.12, 5.42], turnBack: [5.62, 5.8], keyOut: [5.82, 6.3],
  pick: [6.45, 8.3], line: [8.4, 9.65], offer: [9.7, 11.0],   // all text off by p = units (11): the next sheet slides over
};

// the pick attempt as keyframes on a local clock 0..1 (inside T.pick)
function pickState(q) {
  if (q <= 0 || q >= 1) return null;
  const s = (a, b) => ease(span(q, a, b));
  const P = G.pins;
  const st = { wrench: s(0, 0.08), tip: null, hook: 0, x: null, lift: 0, set: [false, false, false, false, false], bind: null };
  if (q < 0.08) return st;
  // the pick slides in under pin 1, lifts it until it sets, then on to pin 2 (notched) and pin 3
  let tip = -40 + (P[0] - -40) * s(0.08, 0.18);
  let hook = 0;
  const lift = (a, b, c, h) => { const up = span(q, a, b), down = span(q, b, c); return h * (up < 1 ? ease(up) : 1 - ease(down)); };
  if (q >= 0.18) hook = lift(0.18, 0.27, 0.31, G.lift[0] + 0.6);
  if (q >= 0.27) st.set[0] = true;
  if (q >= 0.31) { tip = P[0] + (P[1] - P[0]) * s(0.31, 0.38); hook = 0; }
  if (q >= 0.38) hook = lift(0.38, 0.5, 0.55, G.lift[1] - 2.4);
  if (q >= 0.5) st.bind = G.lift[1] - 2.4;          // the notch catches at the shear line: a false set
  if (q >= 0.55) { tip = P[1] + (P[2] - P[1]) * s(0.55, 0.62); hook = 0; }
  if (q >= 0.62) hook = lift(0.62, 0.7, 0.76, 0.9);  // pin 3 will not move: the plug is bound
  if (q >= 0.84) { st.set[0] = false; st.bind = null; }               // tension released: everything drops
  if (q >= 0.8) tip = P[2] + (-60 - P[2]) * s(0.84, 0.98);
  if (q >= 0.84) st.wrench = 1 - s(0.84, 0.96);
  st.tip = tip; st.hook = hook; st.x = tip; st.lift = hook;
  return st;
}
function pickTheta(q) {
  if (q <= 0 || q >= 1) return 0;
  const s = (a, b) => ease(span(q, a, b));
  let th = 0.6 * s(0.06, 0.12);                 // light tension
  th += 1.4 * s(0.5, 0.56);                     // the false set gives a little
  th *= 1 - s(0.82, 0.9);
  return th;
}
function status(p) {
  const q = span(p, ...T.pick);
  if (p < T.key[0]) return 'At rest · the drivers cross the shear line · locked';
  if (p < T.key[1]) return 'The right key · lifting the pins';
  if (p < T.turnBack[1]) return p < T.turn[0] ? 'All five at the shear line' : 'All five at the shear line · the plug turns';
  if (p < T.pick[0]) return 'Key out · the pins drop · locked';
  if (q < 0.18) return 'Attempt 01 · tension wrench and hook pick';
  if (q < 0.38) return q < 0.27 ? 'Pin 1 · lifting' : 'Pin 1 · set';
  if (q < 0.55) return q < 0.5 ? 'Pin 2 · lifting' : 'Pin 2 · notched driver catches · false set';
  if (q < 0.84) return 'Pin 3 · will not lift · the plug binds at 2°';
  if (p < T.pick[1]) return 'Tension released · the pins drop · still locked';
  return 'Attempt 01 · failed · locked';
}

export function initSecurity(engine, section) {
  const stage = section.querySelector('.chapter__stage');
  const sheet = section.querySelector('.s3b__sheet');
  const plate = section.querySelector('.s3b__plate--yale');
  const plateImg = plate.querySelector('img');
  const svg = section.querySelector('.s3b__draw');
  const defs = svg.querySelector('defs');
  const reads = {
    plate: section.querySelector('.s3b__read--plate'), line: section.querySelector('.s3b__read--line'), offer: section.querySelector('.s3b__read--offer'),
  };
  const statusEl = section.querySelector('.s3b__status'), statusV = statusEl.querySelector('.s3b__status-v');
  const edge = section.querySelector('.s3b__edge');
  const lockG = document.createElementNS(NS, 'g'); lockG.setAttribute('class', 's3b-lock');
  const labelsG = document.createElementNS(NS, 'g'); labelsG.setAttribute('class', 's3b-labels');
  svg.append(lockG, labelsG);
  const lock = new Lock(lockG, defs, 'sl');
  const fig = new PlateFig(svg, defs, FIG4, 'media/plates/sec-yale-us48475-fig4.webp', 'sl');
  let P = -1, statusText = '';

  function buildLabels(o, small) {
    labelsG.textContent = '';
    const { X, Y } = lock, k = o.k;
    const fs = rem() * (small ? 0.625 : 0.6875);
    const line = (d) => { const e = document.createElementNS(NS, 'path'); e.setAttribute('d', d); labelsG.appendChild(e); };
    const text = (x, y, s, anchor = 'start', cls = '') => { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', anchor); if (cls) t.setAttribute('class', cls); t.style.fontSize = `${fs}px`; t.textContent = s; labelsG.appendChild(t); };
    const lab = (ax, ay, lx, ly, no, name, anchor = 'start') => {
      line(`M${ax} ${ay}L${lx} ${ly}H${lx + (anchor === 'start' ? 1 : -1) * fs * 6}`);
      const tx = anchor === 'start' ? lx + 3 : lx - 3;
      text(tx, ly - 4, `${no} ${name}`, anchor);
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', ax); c.setAttribute('cy', ay); c.setAttribute('r', 1.8); labelsG.appendChild(c);
    };
    lab(X(44), Y(1.5), X(36), Y(-12), '01', 'Shell');
    lab(X(61), Y(16), X(70), Y(-12), '02', 'Pin chambers');
    lab(X(30), Y(54.5), X(24), Y(72), '03', 'Plug');
    lab(X(77), Y(51), X(86), Y(72), '04', 'Keyway');
    text(X(122) + 4, Y(G.shear) + fs * 0.35, 'Shear line', 'start', 'is-strong');
    const bx = lock.figB.cx, byb = lock.figB.cy;
    text(X(-16), Y(84), 'Fig. A · Section along the plug', 'start', 'is-fig');
    text(bx, small ? byb + 22 * k + fs : Y(84), 'Fig. B · End view', 'middle', 'is-fig');
  }

  function layout() {
    const sr = sheet.getBoundingClientRect();
    const stat = section.classList.contains('is-static');
    const W = sr.width, H = stat ? innerHeight : sr.height, small = innerWidth < 1024;
    const top = stat ? H : 0;                       // reduced motion: the drawing sits on the second sheet
    svg.setAttribute('viewBox', `0 0 ${W} ${sr.height}`);
    let o;
    if (small) {
      const k = Math.min((W - 2.5 * rem()) / 172, (H * 0.42) / 160);
      o = { k, ox: 1.25 * rem() + 18 * k, oy: top + H * 0.1 + 18 * k, bx: 62, by: 43 + 86, labels: true };
    } else {
      const k = Math.min((W * 0.53) / 252, (H * 0.46) / 96);
      o = { k, ox: W * 0.07 + 58 * k, oy: top + H * 0.5 - 36 * k, bx: 172, by: 43, labels: true };
    }
    lock.layout(o);
    buildLabels(o, small);
    const b = lock.bounds;
    statusEl.style.left = `${lock.X(-16)}px`;
    statusEl.style.top = `${(small ? lock.figB.cy + 22 * o.k + 1.6 * rem() : lock.Y(84) + 1.4 * rem())}px`;
    const pr = plateImg.getBoundingClientRect();
    fig.layout(sr, pr, { cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2, w: (b.x1 - b.x0) * 0.62 });
    P = -1; if (!engine.reduced) render(cur);
  }

  let cur = 0;
  function render(p) {
    cur = p;
    if (Math.abs(p - P) < 1e-4) return;
    P = p;
    // entry: the new sheet slides in from the right over the last scene, a hard hairline leading
    const e = ease(span(p, ...T.entry));
    sheet.style.transform = e < 1 ? `translate3d(${((1 - e) * 100).toFixed(3)}%, 0, 0)` : '';
    edge.classList.toggle('is-on', e > 0 && e < 1);
    // reading moment 1: the plate
    reads.plate.classList.toggle('is-on', p >= T.plateText[0] && p < T.plateText[1]);
    plate.classList.toggle('is-gone', p >= T.move[0]);
    // the figure lifts off, turns upright, and redraws
    const mv = span(p, ...T.move), sw = span(p, ...T.sweep);
    fig.render(mv, sw, p >= T.move[0] && sw < 1);
    const drawT = span(p, ...T.draw);
    const lockOn = p >= T.draw[0];
    lockG.style.visibility = lockOn ? '' : 'hidden';
    if (lockOn) lock.drawOn(drawT);
    labelsG.classList.toggle('is-on', p >= T.draw[1]);
    // the key, the turn, the pick
    const ins = p < T.keyOut[0] ? ease(span(p, ...T.key)) : 1 - ease(span(p, ...T.keyOut));
    const theta = 24 * (ease(span(p, ...T.turn)) - ease(span(p, ...T.turnBack))) + pickTheta(span(p, ...T.pick));
    const pk = pickState(span(p, ...T.pick));
    if (lockOn) lock.render({ ins: pk ? 0 : ins, pick: pk, theta });
    // status line (discrete text, never moving)
    const showStatus = p >= T.draw[1] && p < T.line[0];
    statusEl.classList.toggle('is-on', showStatus);
    const s = showStatus ? status(p) : statusText;
    if (s !== statusText) { statusText = s; statusV.textContent = s; }
    // reading moments 2 and 3
    reads.line.classList.toggle('is-on', p >= T.line[0] && p < T.line[1]);
    reads.offer.classList.toggle('is-on', p >= T.offer[0] && p < T.offer[1]);
    section.classList.toggle('is-quiet', p >= T.line[0]);
  }

  function reduced() {
    section.classList.add('is-static');
    Object.values(reads).forEach((r) => r.classList.add('is-on'));
    statusEl.classList.add('is-on');
    requestAnimationFrame(() => {
      layout();
      lockG.style.visibility = '';
      lock.drawOn(1);
      labelsG.classList.add('is-on');
      // the finished state: the attempt failed, the pick still in, pin 1 set, the notched pin caught
      lock.render({ ins: 0, pick: pickState(0.6), theta: pickTheta(0.6) });
      statusV.textContent = 'Attempt 01 · the notched pin catches · the plug binds · locked';
      fig.render(1, 1, false);
    });
  }

  const ch = chapter(engine, section, { render, layout, reduced: () => reduced() });
  if (!engine.reduced) {
    document.fonts.ready.then(() => layout());
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  }
  return ch;
}

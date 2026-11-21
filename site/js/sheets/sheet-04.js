// Sheet 04: Method. An inverted (ink) sheet, four steps, one per screen, each with a precise hairline drawing.
//
// Entry (p 0 -> 1), "sheets passing with inversion": a full-width sheet slides across in difference blend, so the last
// scene of sheet 03 flips black/white as its hard edge passes (text under the edge simply inverts and stays readable);
// it holds for a beat as a complete negative, then slides on and leaves the black Method sheet behind its trailing
// edge, with the first drawing already drawing itself on.
// Scene (p 1 -> units + 1): reading moment, drawing un-draws while the next one draws on, reading moment, ...
// render(p) is a pure function of p. Text is either on or off (class toggles, .22 s fades).
import { chapter, span, ease, token } from '../engine/kit.js';
import { Plot } from '../sheet04/plot.js';
import { STEPS } from '../sheet04/drawings.js';

// ---- timeline (viewport heights) ----
const E = { lead: [0, 0.45], trail: [0.55, 1] };
const READ = [[1.1, 2.3], [3.0, 4.2], [4.9, 6.1], [6.8, Infinity]];
const DRAW = READ.map((r, k) => (k === 0 ? [0.55, 1.05] : [READ[k - 1][1] + 0.25, r[0] - 0.03]));
const UNDRAW = READ.map((r) => [r[1], r[1] + 0.3]);
const progressOf = (p, k) => (READ[k][1] === Infinity ? span(p, ...DRAW[k]) : Math.min(span(p, ...DRAW[k]), 1 - span(p, ...UNDRAW[k])));

function rgbList(name) { return token(name).split(',').map((v) => parseFloat(v)); }

export function init(engine) {
  const section = document.getElementById('sheet-04');
  if (!section) return;
  const band = section.previousElementSibling?.classList.contains('s04-pass') ? section.previousElementSibling : document.querySelector('.s04-pass');
  const under = document.querySelector('.s04-under');
  const stage = section.querySelector('.chapter__stage');
  const sheet = section.querySelector('.s04__sheet');
  const edge = section.querySelector('.s04__edge');
  const svg = section.querySelector('.s04__fig');
  const steps = [...section.querySelectorAll('.s04__step')];
  const index = section.querySelector('.s04__index');
  const idxItems = [...index.querySelectorAll('li')];
  const marks = band?.querySelector('.s04-pass__marks');

  // the passing sheet's colour: |paper - ink| per channel, so over paper it lands exactly on ink (and vice versa)
  function bandColour() {
    if (!band) return;
    const p = rgbList('--paper-rgb'), k = rgbList('--ink-rgb');
    if (p.length < 3 || k.length < 3) return;
    band.style.setProperty('--s04-pass', `rgb(${p.map((v, i) => Math.abs(v - k[i])).join(',')})`);
  }
  bandColour();
  engine.on('theme', bandColour);

  // ---------- reduced motion: four finished steps, one under the other ----------
  if (engine.reduced) {
    const plots = steps.map((li, k) => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 's04__figs'); s.setAttribute('aria-hidden', 'true');
      li.insertBefore(s, li.firstChild);
      return { s, P: new Plot(s), k };
    });
    const layoutStatic = () => {
      const small = innerWidth < 1024;
      plots.forEach(({ s, P, k }) => {
        const r = s.getBoundingClientRect(); if (!r.width) return;
        s.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
        P.clear(); P.place({ x: 0, y: 0, w: r.width, h: r.height }, { font: small ? 10 : 11 });
        STEPS[k].draw(P); P.measure(); P.set(1);
      });
    };
    chapter(engine, section, { layout: layoutStatic });
    steps.forEach((li) => li.classList.add('is-on'));
    document.fonts.ready.then(layoutStatic);
    return;
  }

  // ---------- motion ----------
  const plots = STEPS.map(() => new Plot(svg));
  let W = innerWidth, H = innerHeight, P = -1;

  function buildMarks() {
    if (!marks) return;
    const ns = 'http://www.w3.org/2000/svg';
    marks.setAttribute('viewBox', `0 0 ${W} ${H}`); marks.textContent = '';
    const reg = (x, y) => {
      const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 7); marks.appendChild(c);
      [[x - 13, y, x + 13, y], [x, y - 13, x, y + 13]].forEach(([a, b, c2, d]) => { const l = document.createElementNS(ns, 'line'); l.setAttribute('x1', a); l.setAttribute('y1', b); l.setAttribute('x2', c2); l.setAttribute('y2', d); marks.appendChild(l); });
    };
    const top = 72, bot = H - 40;
    [W - 40, 40].forEach((x) => { reg(x, top); reg(x, bot); });
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('transform', `translate(${W - 34} ${H / 2}) rotate(-90)`); t.setAttribute('text-anchor', 'middle');
    t.textContent = 'SHEET 04 · METHOD · INK SIDE UP'; marks.appendChild(t);
  }

  function layout() {
    W = innerWidth; H = stage.clientHeight || innerHeight;
    const small = W < 1024;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const box = small
      ? { x: 2.25 * rem, y: H * 0.115, w: W - 4 * rem, h: H * 0.38 }
      : { x: W * 0.08, y: H * 0.19, w: W * 0.5, h: H * 0.64 };
    plots.forEach((pl, k) => {
      pl.clear(); pl.place(box, { font: small ? 10 : 11, align: small ? 'top' : 'center' });
      STEPS[k].draw(pl); pl.measure();
    });
    if (small) section.style.setProperty('--s04-cap-y', `${box.y + 560 * plots[0].u + 0.6 * rem}px`);
    buildMarks();
    bandColour();
    P = -1;
  }

  function render(p) {
    if (Math.abs(p - P) < 1e-5) return;
    P = p;
    // ---- entry: the passing sheet, then the Method sheet behind its trailing edge ----
    if (band) {
      const passing = p > 0 && p < 1;
      band.classList.toggle('is-on', passing);
      under?.classList.toggle('is-on', passing);
      if (passing) {
        const off = p < E.lead[1] ? -1 + ease(span(p, ...E.lead)) : p < E.trail[0] ? 0 : ease(span(p, ...E.trail));
        const tf = `translate3d(${(off * 100).toFixed(3)}%,0,0)`;
        band.style.transform = tf;
        if (under) under.style.transform = tf;
      }
    }
    const trail = p >= 1 ? W : p < E.trail[0] ? 0 : W * ease(span(p, ...E.trail));
    sheet.style.setProperty('--clip-r', `${Math.max(0, W - trail).toFixed(1)}px`);
    edge.classList.toggle('is-on', p > E.trail[0] && p < 1);
    edge.style.setProperty('--edge-x', `${trail.toFixed(1)}px`);
    // ---- drawings ----
    plots.forEach((pl, k) => pl.set(progressOf(p, k)));
    // ---- reading moments ----
    let cur = 0;
    for (let k = 0; k < READ.length; k++) if (p >= DRAW[k][0]) cur = k;
    steps.forEach((li, k) => li.classList.toggle('is-on', p >= READ[k][0] && p < READ[k][1]));
    index.classList.toggle('is-on', p >= READ[0][0]);
    idxItems.forEach((li, k) => li.classList.toggle('is-on', k === cur));
  }

  const ch = chapter(engine, section, { render, layout });
  if (band) band.style.zIndex = section.style.zIndex;   // same layer, earlier in the tree: above sheet 03, below this sheet
  document.fonts.ready.then(() => { layout(); render(ch.progress()); });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); render(ch.progress()); }, 120); });
}

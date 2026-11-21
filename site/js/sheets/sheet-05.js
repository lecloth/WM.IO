// Sheet 05: Work. "Sheets from the set": the concept products as drawing sheets, one per screen, each with its own
// title block, slid onto the board one after another like sheets leafed from a set. Every screen is shown at 1:1
// (a part view, cut where the sheet ends) with Detail A at 2:1; never shrunk into a thumbnail. Black and white on the
// sheet; each product's own colour only on hover or keyboard focus. The set ends on a blank sheet: the visitor's.
//
// Entry (p 0 -> 1), "the line closes and the black develops the next sheet":
//   close  two panels close from top and bottom onto the centre line; whatever they cover inverts (the black Method
//          sheet underneath turns to its paper negative, text included, so it stays readable);
//   black  the line opens into black;
//   develop in the black, a cyanotype NEGATIVE of concept sheet 05.1 develops: Prussian ground, white lines, like a
//          print in the tray; the image and its labels fix in (class toggles, never half-faded);
//   open   the curtain opens from the line: the negative recedes in two bands, and the black-and-white sheet is there.
// render(p) is a pure function of p (true viewport heights, 0 .. units + 1). Reading text is on or off, never moving.
import { chapter, span, ease, token, rem } from '../engine/kit.js';
import { ensureFonts } from '../products/index.js';
import { SET, COUNT, buildSheet, layoutSheet, paintSheet } from '../sheet05/sheets.js';
import { negative, idleQueue } from '../sheet05/render.js';

// ---- timeline (viewport heights) ----
const E = { close: [0.02, 0.28], shut: 0.28, black: [0.29, 0.38], dev: [0.4, 0.6], fix: 0.58, fixed: 0.66, devLabel: [0.42, 0.76], open: [0.78, 1.0], tb: [0.28, 0.97] };
const INTRO = [1.04, 1.95];
const S1 = 3.25, STEP = 1.85, SLIDE = 0.55;
const slideAt = (k) => S1 + (k - 1) * STEP;                     // sheet k (k >= 1) slides in from here
const READS = SET.map((_, k) => {
  const a = k === 0 ? 2.05 : slideAt(k) + SLIDE + 0.07;
  const z = k === COUNT - 1 ? Infinity : slideAt(k + 1) - 0.05;
  return [a, z];
});

const rgbOf = (hex) => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16); return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`; };

export function init(engine) {
  const section = document.getElementById('sheet-05');
  if (!section) return;
  const stage = section.querySelector('.chapter__stage');
  const board = section.querySelector('.s5__board');
  const setEl = section.querySelector('.s5__set');
  const indexEl = section.querySelector('.s5__index');
  const readsEl = section.querySelector('.s5__reads');
  const reads = [...section.querySelectorAll('.s5-read')];
  const intro = reads.find((r) => r.dataset.id === 'intro');
  const readOf = SET.map((it) => reads.find((r) => r.dataset.id === it.id));
  const neg = section.querySelector('.s5__neg');
  const black = section.querySelector('.s5__black');
  const seam = section.querySelector('.s5__seam');
  const dev = section.querySelector('.s5__dev');
  const curtain = section.querySelector('.s5__curtain');
  const panT = section.querySelector('.s5__panel--t'), panB = section.querySelector('.s5__panel--b');
  const html = document.documentElement;

  // ---- build the set ----
  const sheets = SET.map((_, k) => buildSheet(k));
  sheets.forEach((s) => setEl.appendChild(s.root));
  indexEl.innerHTML = SET.map((it, k) => `<li>${String(k + 1).padStart(2, '0')} ${it.blank ? 'Yours' : it.id.toUpperCase()}</li>`).join('');
  const idxItems = [...indexEl.children];

  // own colour on hover (mouse) or focus (keyboard, touch); painted on first use, then cached
  const dpr = () => Math.min(devicePixelRatio || 1, 2);
  sheets.forEach((s) => {
    if (!s.p) return;
    const on = () => { paintSheet(s, dpr(), true); s.paper.classList.add('is-acc'); };
    const off = () => s.paper.classList.remove('is-acc');
    s.paper.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') on(); });
    s.paper.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && document.activeElement !== s.paper) off(); });
    s.paper.addEventListener('focus', on);
    s.paper.addEventListener('blur', () => { if (!s.paper.matches(':hover')) off(); });
  });
  section.querySelector('.s5-cta')?.addEventListener('click', (e) => {
    e.preventDefault();
    engine.scrollTo(engine.targetOf ? engine.targetOf('#sheet-08') : '#sheet-08', { duration: 1.6 });
  });

  const queue = idleQueue();
  let fontsReady = false;
  let W = innerWidth, H = innerHeight, small = W < 1024, P = -1, cur = -1, stripH = 36;

  // ---------- reduced motion: the whole set as calm, finished sheets, one under the other ----------
  if (engine.reduced) {
    const rows = sheets.map((s, k) => {
      const row = document.createElement('div');
      row.className = 's5-row';
      row.appendChild(s.root);
      if (readOf[k]) row.appendChild(readOf[k]);
      return row;
    });
    readsEl.after(...rows);
    board.classList.add('is-on');
    reads.forEach((r) => r.classList.add('is-on'));
    sheets.forEach((s) => { s.paper.tabIndex = s.p ? 0 : -1; });
    const layoutStatic = () => {
      if (!fontsReady) return;
      const R = rem(); W = innerWidth; small = W < 1024;
      sheets.forEach((s) => {
        const pw = small ? W - 1.5 * R : 59 * R, ph = small ? 30 * R : 46 * R;
        Object.assign(s.root.style, { width: `${pw}px`, height: `${ph}px` });
        layoutSheet(s, pw, ph, R, small);
        queue.push(() => paintSheet(s, dpr()));
      });
    };
    chapter(engine, section, { layout: layoutStatic });
    ensureFonts().then(() => { fontsReady = true; layoutStatic(); });
    return;
  }

  // ---------- motion ----------
  function paperRect() {
    const R = rem();
    if (small) {
      const readH = Math.max(...reads.map((r) => r.offsetHeight || 0), 14 * R);
      const top = 3.25 * R;
      return { x: 0.75 * R, y: top, w: W - 1.5 * R, h: Math.max(18 * R, H - top - 4.5 * R - readH - 1.1 * R), R };
    }
    const top = 6.6 * R;
    return { x: 3.75 * R, y: top, w: 59 * R, h: H - top - 3 * R, R };
  }

  // the cyanotype negative of sheet 05.1: a copy of the board's frame and the first sheet, with its tokens swapped
  function buildNegative() {
    neg.textContent = '';
    const prus = token('--prus') || '#173F73', white = token('--blueprint-ink') || '#ECF1F6';
    neg.style.setProperty('--ink-rgb', rgbOf(white));
    neg.style.setProperty('--paper-rgb', rgbOf(prus));
    neg.appendChild(board.querySelector('.frame').cloneNode(true));
    const s0 = sheets[0];
    const copy = s0.root.cloneNode(true);
    copy.style.transform = 'none';
    copy.classList.add('is-vis');
    copy.querySelectorAll('.s5-c--acc').forEach((c) => c.remove());
    const paper = copy.querySelector('.s5-paper');
    paper.removeAttribute('tabindex'); paper.removeAttribute('role'); paper.removeAttribute('aria-label');
    const src = [...s0.root.querySelectorAll('.s5-c:not(.s5-c--acc)')];
    const dst = [...copy.querySelectorAll('.s5-c')];
    dst.forEach((c, i) => { if (src[i] && src[i].width > 1) negative(src[i], c, prus, white); });
    copy.querySelectorAll('[id]').forEach((n) => { n.id = `${n.id}n`; });
    copy.querySelectorAll('[clip-path]').forEach((n) => n.setAttribute('clip-path', n.getAttribute('clip-path').replace(/#([\w-]+)\)/, '#$1n)')));
    neg.appendChild(copy);
  }

  function layout() {
    if (!fontsReady) return;
    W = innerWidth; H = stage.clientHeight || innerHeight; small = W < 1024;
    stripH = (parseFloat(getComputedStyle(html).getPropertyValue('--strip-h')) || 2.25) * rem();
    const r = paperRect();
    sheets.forEach((s) => {
      Object.assign(s.root.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      s.x = null;
      layoutSheet(s, r.w, r.h, r.R, small);
    });
    // sheet 05.1 at once (the entry develops it), the rest one per idle slot
    queue.clear();
    paintSheet(sheets[0], dpr());
    sheets.slice(1).forEach((s) => queue.push(() => paintSheet(s, dpr())));
    buildNegative();
    P = -1;
  }

  function setSheet(s, x, vis) {
    if (s.vis !== vis) { s.vis = vis; s.root.classList.toggle('is-vis', vis); }
    if (vis && s.x !== x) { s.x = x; s.root.style.transform = x === 0 ? 'none' : `translate3d(${x.toFixed(1)}px,0,0)`; }
  }

  function render(p) {
    if (!fontsReady || Math.abs(p - P) < 1e-5) return;
    P = p;
    // ---------- entry ----------
    const closing = p < E.shut;
    const c = ease(span(p, ...E.close));
    curtain.classList.toggle('is-on', closing && c > 0);
    if (closing) {
      panT.style.transform = `translate3d(0,${((c - 1) * 100).toFixed(3)}%,0)`;
      panB.style.transform = `translate3d(0,${((1 - c) * 100).toFixed(3)}%,0)`;
    }
    stage.classList.toggle('is-solid', !closing);
    const blackOn = p >= E.shut && p < E.open[0];
    black.classList.toggle('is-on', blackOn);
    if (blackOn) black.style.transform = `scaleY(${ease(span(p, ...E.black)).toFixed(4)})`;
    seam.classList.toggle('is-on', p >= E.shut && p < E.open[0]);
    const negOn = p >= E.dev[0] && p < E.open[1];
    neg.classList.toggle('is-on', negOn);
    if (negOn) {
      neg.style.opacity = span(p, ...E.dev).toFixed(3);
      neg.classList.toggle('is-fixed', p >= E.fix);
      const o = ease(span(p, ...E.open)), a = 50 * (1 - o), b = 100 - a;
      neg.style.clipPath = o <= 0 ? 'none' : `polygon(0 0,100% 0,100% ${a}%,0 ${a}%,0 ${b}%,100% ${b}%,100% 100%,0 100%)`;
      stage.style.setProperty('--edge-a', `${a}%`); stage.style.setProperty('--edge-b', `${b}%`);
    }
    stage.classList.toggle('is-opening', p > E.open[0] && p < E.open[1]);
    dev.classList.toggle('is-on', p >= E.devLabel[0] && p < E.devLabel[1]);
    dev.classList.toggle('is-fixed', p >= E.fixed);
    board.classList.toggle('is-on', p >= E.open[0]);
    html.classList.toggle('is-black-moment', p >= E.tb[0] && p < E.tb[1]);
    // the strip sits on the negative from when it develops until the top band has opened past it
    const topBand = 0.5 * (1 - ease(span(p, ...E.open))) * H;
    html.classList.toggle('s5-blue', p >= E.dev[0] + 0.05 && p < E.open[1] && topBand > stripH);

    // ---------- the set: sheet k slides in from the right as k - 1 leaves to the left ----------
    let k = 0;
    while (k + 1 < COUNT && p >= slideAt(k + 1)) k++;
    const t = k === 0 ? 1 : ease(span(p, slideAt(k), slideAt(k) + SLIDE));
    sheets.forEach((s, i) => {
      if (i === k) setSheet(s, (1 - t) * W, true);
      else if (i === k - 1 && t < 1) setSheet(s, -t * W, true);
      else setSheet(s, 0, false);
    });
    const now = t < 0.5 && k > 0 ? k - 1 : k;
    if (now !== cur) {
      cur = now;
      idxItems.forEach((li, i) => li.classList.toggle('is-on', i === cur));
      sheets.forEach((s, i) => { s.paper.tabIndex = i === cur && s.p ? 0 : -1; if (i !== cur) s.paper.classList.remove('is-acc'); });
      // paint the sheets around the current one first
      [cur - 1, cur + 1, cur].forEach((i) => { const s = sheets[i]; if (s) queue.push(() => paintSheet(s, dpr()), true); });
    }
    indexEl.classList.toggle('is-on', p >= INTRO[0]);
    // ---------- reading moments ----------
    intro.classList.toggle('is-on', p >= INTRO[0] && p < INTRO[1]);
    readOf.forEach((r, i) => r?.classList.toggle('is-on', p >= READS[i][0] && p < READS[i][1]));
  }

  const ch = chapter(engine, section, { render, layout });
  ensureFonts().then(() => { fontsReady = true; layout(); render(ch.progress()); });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); render(ch.progress()); }, 140); });
  engine.on('theme', () => { buildNegative(); P = -1; render(ch.progress()); });
}

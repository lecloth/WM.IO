// Page 1 (Enter + hook), round 3 + fixes + rounds 4-6. Scroll-driven, 8.4 screens tall: the stage stays put while 7.4
// screens of scroll play the story; the last 3.1 are the "?" dot dive and the hallway into page 2 (round 6: longer, so
// each frame rests long enough to read its museum label). Positions p are in screens of scroll (0..7.4):
//   S0     Bell's 1877 sheet (the real scan), headline and credit                                      0.00 – 0.22
//          eight clean outlines draw on exactly over the scan (DrawSVG); the scan fades and leaves them 0.12 – 0.36
//          the ground turns blue (one timed beat); the outlines morph into the phone's (MorphSVG)       0.36 – 0.80
//          the 3D X-ray appears exactly on them                                                        0.80 – 0.90
//          the pieces spread far apart and turn                                                        0.90 – 1.12
//   S1     six pieces, named on hairline leaders                                                       1.12 – 1.42
//   KIN    kinetic line; the pieces come together (a tick each)                                        1.44 – 2.32
//          the ground turns back to paper (one timed beat, lines flip to ink); built (scrubbed);
//          real materials (one timed beat)                                                              1.98 – 2.30
//   S2     "…to serve you."                                                                            2.34 – 2.60
//   YOU    alone                                                                                       2.62 – 2.80
//   TASK   "YOU gave us the task."                                                                     2.82 – 3.00
//   WE     "us" becomes WE, pinned; the verb drum turns through the seven steps, each meaning beneath   3.02 – 3.98
//   END    "Now, what do you need?"                                                                    4.00 – 4.30
//   DIVE   its "?" dot grows into a window; down a hallway of four framed blueprints; page 2 at its end  4.30 – 7.40
// Words land on beats as short timed reveals (SplitText words rise and straighten), so a paused frame always settles
// on whole, readable words. The ground changes and the drum's turns are timed too; only the pictures scrub.
// Reduced motion: still frames with the full text, no vibration.
// Round 6: the grid is the layout system. The band the pictures sit in, Bell's sheet, the phone, the X-ray names and
// their shelves, the travelling words and the drum all land on grid lines (site/js/engine/grid.js; the texts' own
// baselines are set in CSS, page-00-grid.css .gt).
import { Phone } from './phone.js';
import { BellMorph } from './morph.js';
import { createLive } from './live.js';
import { createDive, labelHTML, openingHTML, DIVE } from './dive.js';
import { FRAMES } from './corridor-drawings.js';
import { haptics } from '../engine/haptics.js';
import { grid, baselineOf, seatText } from '../engine/grid.js';
import { LIGHT } from '../engine/tokens.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
function keys(p, k) {
  if (p <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (p <= k[i][0]) return lerp(k[i - 1][1], k[i][1], ease(span(p, k[i - 1][0], k[i][0])));
  return k[k.length - 1][1];
}
const inR = (p, [a, b]) => p >= a - 1e-4 && p <= b + 1e-4;

// round 7: the drum turns slower (more room: 1.6 screens for seven verbs), and the hallway is 4.3 screens
export const SCROLL = 4.94 + DIVE;
const R = {
  s0: [0, 0.22], draw: [0.12, 0.28], scanOut: [0.26, 0.36], blueOn: 0.36, morph: [0.4, 0.8], xray: [0.8, 0.88], linesOut: [0.86, 0.9],
  spread: [0.9, 1.12], s1: [1.12, 1.42], kin: [1.44, 2.32], kinWords: [1.44, 1.86], seat: 1.5, paperOn: 1.98, built: [2.0, 2.14], real: [2.16, 2.3],
  s2: [2.34, 2.6], you: [2.62, 2.8], task: [2.82, 3.0], we: [3.02, 4.62], verbs: [3.06, 4.62], end: [4.64, 4.94 + DIVE], endText: [4.64, 4.955], dive: [4.94, 4.94 + DIVE],
};
const HAND = 0.9;          // the handover: Bell's outlines -> X-ray, pose held until here
// named stops for tests (a paused frame at each must be clean), including mid-morph, mid-drum and mid-dive
export const STOPS = { S0: 0.1, draw: 0.24, morph: 0.6, S1: 1.3, kin: 1.72, paper: 2.2, REAL: 2.45, S2: 2.5, YOU: 2.72, TASK: 2.92, WE: 3.12, DRUM: 3.9, END: 4.8, TR: 5.05, OPEN: 5.49, F1: 6.26, F2: 6.83, F3: 7.4, F4: 7.97, F5: 8.62, LAND: 9.16 };
const NAMES = ['Back', 'Battery', 'Board', 'Frame', 'Screen', 'Glass'];   // back to front
const BLUE = [23, 63, 115];

const rgb = (s) => { s = s.trim(); if (s[0] === '#') return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)); const m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; };
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

export function initPage01(engine) {
  const sec = document.getElementById('page-01');
  if (!sec) return null;
  const { gsap } = engine;
  const $ = (s) => sec.querySelector(s);
  const stage = $('.p1__stage');
  const canvas = $('.p1__canvas'), morphSvg = $('.p1__morph');
  const leaders = $('.p1__leaders'), lctx = leaders.getContext('2d');
  const labelsEl = $('.p1__labels');
  const blue = $('.p1__bg--blue');
  const plateFig = $('.p1__plate');
  const credit = $('.p1__credit');
  const T = Object.fromEntries([...sec.querySelectorAll('.p1-txt, .p1-we')].map((t) => [t.dataset.k, t]));
  const weEl = T.we;

  // ---------- words: SplitText splits every line into words for the rise-and-straighten reveal ----------
  const Split = window.SplitText;
  const split = (el, cls) => {
    if (!Split) return [];
    const s = new Split(el, { type: 'words', wordsClass: cls, tag: 'span', aria: 'none' });
    s.words.forEach((w, i) => w.style.setProperty('--i', i));
    return s.words;
  };
  [T.s0, T.s1, T.s2, T.task, T.end].forEach((t) => t.querySelectorAll('.p1-txt__eyebrow, .p1-txt__h').forEach((el) => split(el, 'w')));
  const kinWords = split(T.kin.querySelector('.p1-kin'), 'kw');
  kinWords.forEach((w) => w.style.setProperty('--i', 0));

  // the seven steps: the list stays for readers; the drum and the meanings beneath are drawn from it
  const steps = [...weEl.querySelectorAll('.p1-steps li')].map((li) => ({ verb: li.querySelector('.p1-steps__verb').textContent.trim(), mean: li.querySelector('.p1-steps__mean').textContent.trim() }));
  const wheel = $('.p1-drum__wheel'), meanEl = $('.p1-mean');
  const verbs = steps.map((s) => { const v = document.createElement('span'); v.className = 'p1-verb display'; v.textContent = s.verb; wheel.append(v); return v; });
  const means = steps.map((s) => { const p = document.createElement('p'); p.className = 'gt-js'; p.textContent = s.mean; meanEl.append(p); split(p, 'w'); return p; });

  const flyYou = $('.p1-fly[data-w="you"]'), flyWe = $('.p1-fly[data-w="we"]');
  const slot = { a: $('.p1-slot--a'), c: $('.p1-slot--c'), u: $('.p1-slot--u'), w: $('.p1-slot--w') };
  const diveEl = $('.p1-dive'), diveTop = $('.p1-dive-top');
  const page2 = document.getElementById('page-02'), page2In = page2?.querySelector('.p2__stage') || page2?.querySelector('.stub__in');
  const dive = createDive(diveEl, diveTop);
  const endH = T.end.querySelector('.p1-txt__h');

  const phone = new Phone(canvas);
  phone.shadowK = 1;
  const morph = new BellMorph(morphSvg, gsap);
  const labels = phone.parts.map((p) => { const d = document.createElement('div'); d.className = 'p1-lbl'; d.textContent = p.name; labelsEl.append(d); return d; });
  let W = 1, H = 1, band = null, plateRect = null, P = -1, portrait = true, dpr = 1, ink = [18, 18, 18], paper = [242, 240, 235], dark = false;
  let box0 = null, bottomInset = 0, stripH = 40;
  const seated = phone.parts.map(() => true);

  // ---------- poses ----------
  function pose(p) {
    const E = portrait ? { yaw: -0.42, pitch: 1.02 } : { yaw: -1.0, pitch: 0.32 };
    const Hd = { yaw: -0.22, pitch: 0.1 }, F = { yaw: 0.34, pitch: 0.1 };
    const F2 = { yaw: F.yaw + 0.34, pitch: F.pitch };   // the finished phone keeps turning, slowly, as you scroll
    const K = [[HAND, Hd], [R.spread[1], E], [R.seat, E], [R.real[1], F], [R.s2[1], F2]];
    const spread = ease(span(p, HAND, R.spread[1]));
    const explodeEach = phone.parts.map((_, i) => (p < R.seat ? spread : 1 - ease(span(p, R.seat + i * 0.06, R.seat + 0.14 + i * 0.06))));   // back seats first
    return { explodeEach, yaw: keys(p, K.map(([q, o]) => [q, o.yaw])), pitch: keys(p, K.map(([q, o]) => [q, o.pitch])), fit: band };
  }

  // ---------- layout: where the picture may sit (never under the text, the strip or the title block) ----------
  // Round 6: the band is whole cells, its edges on lines; Bell's sheet is the biggest whole-cell sheet of its shape in it
  // (the scan keeps its true proportions inside its own white sheet); the phone fills the band exactly (fit.snap).
  let imgRect = null, bellLines = null;
  const BELL_LINES = { x: 1025, y: 1203 };   // two long, straight ink lines of the scan (px in the 1600 x 1740 file)
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const u = grid.u, desktop = W >= 1024; portrait = !desktop;
    dpr = Math.min(devicePixelRatio || 1, 2);
    phone.resize(W, H);
    leaders.width = Math.round(W * dpr); leaders.height = Math.round(H * dpr);
    const cs = getComputedStyle(document.documentElement);
    ink = rgb(cs.getPropertyValue('--ink')); paper = rgb(cs.getPropertyValue('--paper'));
    dark = document.documentElement.dataset.theme === 'dark';
    phone.setInk(parseInt(hex(ink).slice(1), 16));
    phone.refreshScreen(LIGHT.ink, LIGHT.paper, LIGHT.graphite);
    stripH = document.getElementById('strip')?.offsetHeight || 2 * u;
    const tb = document.querySelector('.titleblock');
    const tbTop = tb && tb.getClientRects().length ? tb.getBoundingClientRect().top : grid.floor(innerHeight);
    const tbH = Math.max(0, innerHeight - tbTop);
    // the stage is 100lvh, but while the phone's address bar shows, its bottom is off screen: use what's visible
    const hidden = Math.max(0, H - innerHeight);
    bottomInset = hidden + tbH;
    const pictureTexts = [T.s0, T.s1, T.kin, T.s2];
    let bT, bB, bL, bR;   // the band's edges (stage px, on lines)
    if (desktop) {
      const sl = stage.getBoundingClientRect().left;
      const textRight = Math.max(...pictureTexts.map((t) => t.getBoundingClientRect().right - sl));
      bT = 4 * u; bB = grid.floor(tbTop) - 2 * u; bL = grid.ceil(Math.min(W * 0.5, textRight + 2 * u)); bR = W - 2 * u;
    } else {
      const tallest = Math.max(...pictureTexts.map((t) => t.getBoundingClientRect().height));
      bT = 3 * u + grid.ceil(tallest) + u; bB = grid.floor(tbTop) - 2 * u; bL = u; bR = W - u;   // the last cell: the plate's credit line
    }
    band = { top: bT, bottom: H - bB, left: bL, right: W - bR, snap: u };
    // Bell's drawing straight on the page (round 7: the sheet felt cheap). The scan's paper is gone (it prints by
    // multiply, so only its ink shows, on our paper and grid), true to the scan, as large as the band allows; then moved
    // (less than half a cell) so two of its own long ink lines sit on grid lines: Fig. 2's top edge (scan y 1203) and a
    // vertical edge (scan x 1025). The scan keeps its true proportions; Bell's traced outlines are placed on it.
    const bw = bR - bL, bh = bB - bT, a = 1600 / 1740;
    let iw = bw - u, ih = iw / a; if (ih > bh - u) { ih = bh - u; iw = ih * a; }   // (half a cell spare each side for the move onto the grid)
    const ks = iw / 1600;
    let il = bL + (bw - iw) / 2, it = bT + (bh - ih) / 2;
    il += grid.snap(il + BELL_LINES.x * ks) - (il + BELL_LINES.x * ks);
    it += grid.snap(it + BELL_LINES.y * ks) - (it + BELL_LINES.y * ks);
    plateRect = imgRect = { left: il, top: it, width: iw, height: ih };
    bellLines = { x: il + BELL_LINES.x * ks, y: it + BELL_LINES.y * ks };
    Object.assign(plateFig.style, { left: `${il}px`, top: `${it}px`, width: `${iw}px`, height: `${ih}px` });
    credit.style.top = `${grid.ceil(it + ih)}px`; credit.style.left = `${grid.ceil(il)}px`;
    // the handover: pose the phone where the X-ray appears, and give Bell's outlines the X-ray outlines to land on
    phone.parts.forEach((part) => { part.e = 0; });
    phone.set(pose(HAND));
    morph.place(imgRect, W, H, (...s) => phone.loop2D(...s), dpr);
    if (desktop) weEl.style.setProperty('--we-w', `${grid.ceil(slot.w.getBoundingClientRect().width)}px`); else weEl.style.removeProperty('--we-w');
    layoutDrum();
    means.forEach((m) => seatText(m, parseFloat(getComputedStyle(m).getPropertyValue('--q')) || 0.5));   // round 6: on the grid without a trim (grid.js)
    layoutDive();
    placeFlies();
    P = -1;
  }

  // ---------- the verb drum: a dial of seven words, the facing one lit ----------
  // Round 4 ("both"): a precise mechanical detent every visitor sees (each verb snaps into its window and settles: a
  // critically damped move, so it never overshoots or wobbles) and an 18 ms click on Android as each one seats (only
  // after the unlock tap; none with reduced motion, where there is no drum at all). Behind WE and the drum: a precise
  // construction grid aligned to the type, drawn from the fonts' own metrics (layoutGrid).
  const TH = 30;   // degrees between verbs on the drum
  let drumR = 100;
  const drum = { i: -1, a: 0, seated: -1 };
  const DETENT = (t) => { const k = 9; return (1 - (1 + k * t) * Math.exp(-k * t)) / (1 - (1 + k) * Math.exp(-k)); };
  const gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  gridSvg.setAttribute('class', 'p1-grid'); gridSvg.setAttribute('aria-hidden', 'true'); weEl.prepend(gridSvg);
  let vBase0 = 0;   // the lit verb's baseline at rest (stage px, on a line)
  function layoutDrum() {
    const rowH = parseFloat(getComputedStyle(verbs[0]).height) || 52;
    drumR = rowH / (2 * Math.sin(TH * Math.PI / 360));
    verbs.forEach((v, k) => { v.style.transform = `rotateX(${-k * TH}deg) translateZ(${drumR.toFixed(1)}px)`; });
    // round 6: the facing verb comes to rest on the grid. At rest its transforms cancel out, so its baseline is where it
    // stands untransformed; the whole wheel is seated by the difference to the nearest line
    wheel.style.setProperty('--seat', '0px');
    const vt = verbs[0].style.transform, wt = wheel.style.transform;
    verbs[0].style.transform = 'none'; wheel.style.transform = 'none';
    const st = stage.getBoundingClientRect().top, b = baselineOf(verbs[0]) - st;
    verbs[0].style.transform = vt; wheel.style.transform = wt;
    const seatPx = grid.snap(b) - b; vBase0 = b + seatPx;
    wheel.style.setProperty('--seat', `${seatPx.toFixed(3)}px`);
    paintDrum();
    layoutGrid();
  }
  // the type's own metrics (canvas), for an element's font
  const mctx = document.createElement('canvas').getContext('2d');
  function metrics(el, sample) {
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    mctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m = mctx.measureText(sample), H = mctx.measureText('H'), x = mctx.measureText('x');
    return { fs, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent, cap: H.actualBoundingBoxAscent, xh: x.actualBoundingBoxAscent,
      inkL: -m.actualBoundingBoxLeft, inkR: m.actualBoundingBoxRight };
  }
  /** the grid behind WE and the verbs: every line sits on the type (cap line, x-height, baseline, ink edges), the verb
   *  window frames the lit verb symmetrically about its cap-to-baseline band, the lines overshoot equally on every
   *  side, and two small dimension marks give the cap heights (WE's on the left, the verb's on the right). On desktop
   *  WE stands on the lit verb's baseline (one shared baseline). */
  function layoutGrid() {
    const wordEl = weEl.querySelector('.p1-we__word'), slotW = slot.w, drumEl = weEl.querySelector('.p1-drum');
    if (!wordEl || !slotW || !drumEl) return;
    const desktop = W >= 1024, rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    wordEl.style.translate = '';
    const box = weEl.getBoundingClientRect(), stTop = stage.getBoundingClientRect().top;
    const mv = metrics(verbs[0], 'Understood'), mw = metrics(slotW, 'WE');
    const vcs = getComputedStyle(verbs[0]);
    mctx.font = `${vcs.fontStyle} ${vcs.fontWeight} ${mv.fs}px ${vcs.fontFamily}`;
    const widest = Math.max(...verbs.map((v) => mctx.measureText(v.textContent).actualBoundingBoxRight));
    // baselines: a line box of height lh centres the font's content area (ascent + descent)
    const baseOf = (top, lh, m) => top + (lh - (m.asc + m.desc)) / 2 + m.asc;
    const dr = drumEl.getBoundingClientRect();
    // round 6: the baselines as laid out (measured, not computed): the verb's is on its line (layoutDrum), WE's too
    const vBase = vBase0 + stTop - box.top;
    const sr = slotW.getBoundingClientRect();
    let wBase = baselineOf(slotW) - box.top;
    if (desktop) { const d = vBase - wBase; wordEl.style.translate = `0 ${d.toFixed(2)}px`; wBase = vBase; }
    const sx = sr.left - box.left, wl = sx + mw.inkL, wr = sx + mw.inkR;
    const vl = dr.left - box.left, vr = vl + widest;
    const wCap = wBase - mw.cap, vCap = vBase - mv.cap, vX = vBase - mv.xh;
    const band = vBase - vCap, m = Math.max(4, (verbs[0].offsetHeight - band) / 2) * 0.62;
    const win = { t: vCap - m, b: vBase + m, l: vl - m, r: vr + m };
    const o = desktop ? 1.5 * rem : 10;                         // the overshoot, the same on every side
    const L = Math.min(wl, win.l) - o, R = Math.max(wr, win.r) + o, T = Math.min(wCap, win.t) - o, B = Math.max(wBase, win.b) + o;
    const f = (v) => v.toFixed(1);
    const hl = (y) => `<path class="g" d="M${f(L)} ${f(y)}H${f(R)}"/>`;
    const vline = (x) => `<path class="g" d="M${f(x)} ${f(T)}V${f(B)}"/>`;
    const tick = (x, y) => `<path class="t" d="M${f(x - 3)} ${f(y)}H${f(x + 3)}M${f(x)} ${f(y - 3)}V${f(y + 3)}"/>`;
    // a vertical dimension with slender arrowheads
    const dim = (x, y0, y1) => { const a = 5, w = 2; return `<path class="d" d="M${f(x)} ${f(y0)}V${f(y1)}M${f(x - w)} ${f(y0 + a)}L${f(x)} ${f(y0)}L${f(x + w)} ${f(y0 + a)}M${f(x - w)} ${f(y1 - a)}L${f(x)} ${f(y1)}L${f(x + w)} ${f(y1 - a)}"/>`; };
    // line names: WE's just above its lines at its ink edge; the verb's outside the grid's right end, on the line
    const lab = (x, y, t, cls = '') => `<text class="${cls}" x="${f(x)}" y="${f(y)}">${t}</text>`;
    const seen = new Set(), Hs = [];
    const addH = (y, name, side) => {
      const k = Math.round(y); if (seen.has(k)) return; seen.add(k);
      Hs.push(hl(y) + (side === 'we' ? lab(wr + 6, y - 4, name) : lab(R + 5, y, name, 'r')));
    };
    addH(wCap, 'CAP', 'we'); addH(wBase, 'BASE', desktop ? 'verb' : 'we'); addH(vCap, 'CAP', 'verb'); addH(vX, 'X', 'verb'); addH(vBase, 'BASE', 'verb');
    const Vs = [wl, wr, win.l, win.r].map(vline).join('');
    const ticks = [[wl, wCap], [wr, wCap], [wl, wBase], [wr, wBase], [win.l, vCap], [win.r, vCap], [win.l, vBase], [win.r, vBase]].map(([x, y]) => tick(x, y)).join('');
    const winRect = `<path class="w" d="M${f(win.l)} ${f(win.t)}H${f(win.r)}V${f(win.b)}H${f(win.l)}Z"/>`;
    const mid = (win.t + win.b) / 2, ix = 6;   // the window's index marks, left and right, as on a dial
    const index = `<path class="w" d="M${f(win.l - ix)} ${f(mid)}H${f(win.l)}M${f(win.r)} ${f(mid)}H${f(win.r + ix)}"/>`;
    const dims = dim(L + o * 0.45, wCap, wBase) + dim(R - o * 0.45, win.t, win.b);
    // round 7: the real measurements, live, in faint grey mono: each cap height as it is on this screen, and the verb
    // window's width and height
    const px = (v) => `${v.toFixed(1)} PX`, half = (a, b) => (a + b) / 2;
    const turned = (x, y, t) => `<text class="m t" transform="translate(${f(x)} ${f(y)}) rotate(-90)">${t}</text>`;
    const meas = turned(L + o * 0.45 - 3, half(wCap, wBase), px(wBase - wCap)) + turned(R - o * 0.45 - 3, half(win.t, win.b), px(win.b - win.t));
    gridSvg.setAttribute('viewBox', `0 0 ${f(box.width)} ${f(box.height)}`);
    gridSvg.innerHTML = Hs.join('') + Vs + ticks + winRect + index + dims + meas;
    gridLines = { wCap, wBase, vCap, vX, vBase, win, L, R, T, B, o, wl, wr };
  }
  let gridLines = null;
  function paintDrum() {
    wheel.style.transform = `translateZ(${(-drumR).toFixed(1)}px) rotateX(${(drum.a * TH).toFixed(2)}deg)`;
    verbs.forEach((v, k) => {
      const d = Math.abs(k - drum.a);
      v.style.opacity = (d <= 1 ? 1 - 0.8 * d : d <= 2 ? 0.2 - 0.14 * (d - 1) : d <= 2.5 ? 0.12 * (2.5 - d) : 0).toFixed(3);
      v.classList.toggle('is-lit', d < 0.01);
    });
  }
  function setVerb(i) {
    if (i === drum.i) return;
    const prev = drum.i; drum.i = i;
    means.forEach((m, k) => m.classList.toggle('on', k === i));
    if (i < 0) return;
    if (prev < 0) { gsap.killTweensOf(drum); drum.a = i; drum.seated = i; paintDrum(); return; }
    // the detent: a critically damped snap into the window (never past it), a click as each verb seats
    gsap.to(drum, { a: i, duration: 0.42, ease: DETENT, overwrite: true, onUpdate: () => { paintDrum(); seat(); } });
  }
  function seat() {
    const n = Math.round(drum.a);
    if (Math.abs(drum.a - n) < 0.025 && n !== drum.seated) { drum.seated = n; haptics.click(); }   // round 7: a heavier click, a double pulse
  }

  // ---------- the dive: the "?" dot, measured on the rendered glyph (after fonts load, on every resize) ----------
  // round 7: the hallway's layout; transition B cuts along the grid line under the last line
  function layoutDive() {
    const sr = stage.getBoundingClientRect(), u = grid.u;
    const cutY = grid.ceil(endH.getBoundingClientRect().bottom - sr.top) + u;
    dive.layout(diveEl.clientWidth || W, diveEl.clientHeight || innerHeight, { u, cutY });
  }

  // ---------- "you" -> "YOU" and "us" -> "WE": one word each, travelling between its places ----------
  let flyT = { you: {}, we: {} };
  // round 6: each word comes to rest on a baseline: in its line (the slot's own baseline, measured), or alone on the
  // line nearest the screen's middle with its left edge on a line
  function measureFly(fly, places) {
    const prev = fly.style.transform; fly.style.transition = 'none'; fly.style.transform = 'none';
    const sr = stage.getBoundingClientRect(), upEl = fly.querySelector('.up'), up = upEl.getBoundingClientRect(), o = fly.getBoundingClientRect();
    const fx = up.left - o.left, fw = up.width, fs = parseFloat(getComputedStyle(fly).fontSize), fb = baselineOf(upEl) - o.top;
    const to = (el) => { const r = el.getBoundingClientRect(), s = parseFloat(getComputedStyle(el).fontSize) / fs, b = baselineOf(el);
      return `translate(${r.left - o.left - s * fx}px, ${b - o.top - s * fb}px) scale(${s})`; };
    const out = {};
    Object.entries(places).forEach(([k, v]) => {
      if (v !== 'centre') { out[k] = to(v); return; }
      const left = grid.snap((W - fw) / 2), base = grid.snap((stripH + H - bottomInset) / 2 + 0.67 * fs / 2);
      out[k] = `translate(${left - (o.left - sr.left) - fx}px, ${base - (o.top - sr.top) - fb}px)`;
    });
    fly.style.transform = prev; void fly.offsetWidth; fly.style.transition = '';
    return out;
  }
  function placeFlies() {
    // the WE block and task line must be laid out (visibility only hides them) to measure their slots
    flyT.you = measureFly(flyYou, { a: slot.a, b: 'centre', c: slot.c });
    flyT.we = measureFly(flyWe, { a: slot.u, b: slot.w });
    flyState.you = flyState.we = null;
  }
  const flyState = { you: null, we: null };
  function setFly(which, s) {
    if (s === flyState[which]) return; flyState[which] = s;
    const el = which === 'you' ? flyYou : flyWe;
    el.dataset.state = s === 'off' ? 'off' : s;
    if (s !== 'off') el.style.transform = flyT[which][s];
  }

  // ---------- the ground: paper -> blue -> paper, each change one short timed beat (never a scrubbed mix) ----------
  const G = { b: 0, target: 0 };
  const look = { xray: 0, ground: 1, built: 0, real: 0 };
  function paintGround() {
    blue.style.opacity = G.b.toFixed(3);
    const onBlue = G.b >= 0.5;
    stage.classList.toggle('is-inv', onBlue && !dark);
    look.ground = onBlue ? 0 : 1;
    morph.set({ ...morphState, color: onBlue ? '#ECF1F6' : hex(ink) });
  }
  function groundTo(target, instant) {
    if (target === G.target && !instant) return; G.target = target;
    gsap.killTweensOf(G);
    if (instant) { G.b = target; paintGround(); return; }
    gsap.to(G, { b: target, duration: 0.42, ease: 'power2.inOut', onUpdate: () => { paintGround(); phone.looks(look); if (phoneSeen) phone.render(); } });
  }
  let morphState = { draw: 0, t: 0, alpha: 0 };
  // matte -> real: also one short timed beat, so a paused frame is either the white model or the real phone, never a grey mix
  const D = { r: 0, target: 0 };
  function dressTo(target) {
    if (target === D.target) return; D.target = target;
    gsap.killTweensOf(D);
    gsap.to(D, { r: target, duration: 0.55, ease: 'power2.inOut', onUpdate: () => { look.real = D.r; phone.looks(look); if (phoneSeen) phone.render(); } });
  }

  // ---------- one frame of the story at scroll position p ----------
  function render(p) {
    // Bell's sheet: the scan, its clean outlines drawn on top, then the outlines alone, morphing into the phone's
    const scanOut = span(p, ...R.scanOut);
    plateFig.style.opacity = String(1 - scanOut);
    plateFig.style.visibility = scanOut >= 1 ? 'hidden' : 'visible';
    credit.style.opacity = String(1 - span(p, 0.2, 0.28));
    groundTo(p >= R.blueOn && p < R.paperOn ? 1 : 0);
    morphState = { draw: span(p, ...R.draw), t: span(p, ...R.morph), alpha: p < R.draw[0] || p >= R.linesOut[1] ? 0 : 1 - span(p, ...R.linesOut) };
    morph.set({ ...morphState, color: G.b >= 0.5 ? '#ECF1F6' : hex(ink) });

    const ps = pose(Math.max(p, HAND));
    phone.parts.forEach((part, i) => { part.e = ps.explodeEach[i]; });
    phone.set(ps);
    look.xray = span(p, ...R.xray); look.built = ease(span(p, ...R.built)); dressTo(p >= R.real[0] ? 1 : 0); look.real = D.r;
    look.ground = G.b >= 0.5 ? 0 : 1;
    phone.looks(look);
    const shown = p >= R.xray[0] && p < R.s2[1];
    canvas.classList.toggle('is-off', !shown);
    // snap ticks (forward only, after the unlock tap; haptics checks reduced motion)
    ps.explodeEach.forEach((e, i) => { const s = e <= 0.001; if (s && !seated[i] && p > R.seat) haptics.tick(14); seated[i] = s; });

    // texts: on at their beats
    T.s0.classList.toggle('on', inR(p, R.s0));
    T.s1.classList.toggle('on', inR(p, R.s1));
    T.kin.classList.toggle('on', inR(p, R.kin));
    const nOn = p < R.kinWords[0] ? 0 : Math.min(kinWords.length, 1 + Math.floor(span(p, ...R.kinWords) * kinWords.length));
    kinWords.forEach((w, i) => w.classList.toggle('on', i < nOn));
    T.s2.classList.toggle('on', inR(p, R.s2));
    T.task.classList.toggle('on', inR(p, R.task));
    weEl.classList.toggle('on', inR(p, R.we));
    T.end.classList.toggle('on', inR(p, R.endText));
    setFly('you', inR(p, R.s2) ? 'a' : inR(p, R.you) ? 'b' : inR(p, R.task) ? 'c' : 'off');
    setFly('we', inR(p, R.task) ? 'a' : inR(p, R.we) ? 'b' : 'off');
    const step = (R.verbs[1] - R.verbs[0]) / steps.length;
    setVerb(inR(p, R.we) ? clamp(Math.floor((p - R.verbs[0]) / step), 0, steps.length - 1) : -1);

    live?.gain(p >= R.real[0] && p < R.s2[1] ? 1 : 0);   // live only while the finished phone is on screen
    drawLabels(inR(p, R.s1));
    renderDive(p);
    // the 3D phone only renders while it can be seen (and one more frame as it goes)
    if (shown || phoneSeen) phone.render();
    phoneSeen = shown;
  }
  let phoneSeen = true;

  // the dive: page 2's stage waits at the hallway's end (held at the screen's top by a transform, scaled by the
  // perspective, hidden behind the end wall until the last frame has gone) and is home, 1:1, when the walk ends (within
  // 1.5 px of the end: phones scroll in whole pixels). Transition C pushes page 1's stage into one grid square.
  let diveOn = null, diveNow = null, phonesT = 0;
  function renderDive(p) {
    if (!page2) return;
    const on = p >= R.end[0] && p < R.end[1] - 1.5 / Math.max(1, H);
    if (on !== diveOn) {
      diveOn = on; page2.classList.toggle('is-dive', on);
      if (!on && page2In) { page2In.style.transform = ''; page2In.style.transformOrigin = ''; page2In.style.visibility = ''; }
    }
    const q = span(p, ...R.dive), going = on && q > 0;
    // round 7: the real phones load from the WE scene on, in the first pause (300 ms without scrolling: every snap scene is
    // one), so their parsing never lands in a moving frame; once the hallway starts they load at once whatever happens
    if (p >= R.dive[0]) dive.loadPhones();
    else if (p >= R.we[0]) { clearTimeout(phonesT); phonesT = setTimeout(() => dive.loadPhones(), 300); }
    diveEl.classList.toggle('on', going); diveTop.classList.toggle('on', going);
    const pin = on ? -page2.getBoundingClientRect().top : 0;
    if (!on || !going) { diveNow = null; stage.style.transform = ''; dive.reset(); if (on) { page2In.style.visibility = 'hidden'; page2In.style.transform = `translateY(${pin.toFixed(2)}px)`; } return; }
    const d = dive.render(q); if (!d) return;
    diveNow = { ...d, q };
    stage.style.transformOrigin = d.stage ? d.stage.origin : ''; stage.style.transform = d.stage ? d.stage.transform : '';
    // page 2 stays drawn behind the opaque end wall (showing it only at the end made its first raster land mid-walk); it is
    // hidden only while the way in is still opening (a clip there would show it over page 1)
    page2In.style.visibility = d.open ? '' : 'hidden';
    page2In.style.transformOrigin = d.origin;
    const still = d.scale > 0.99995 && Math.abs(pin) < 0.01;
    page2In.style.transform = still ? '' : `translateY(${pin.toFixed(2)}px) scale(${d.scale.toFixed(5)})`;
  }

  // names beside each piece: a mono word on a hairline leader with a short shelf under it, alternating sides
  let shelves = [];   // for the on-grid check: each name's shelf (stage px)
  function drawLabels(on) {
    const d = leaders.width / W; shelves = [];
    lctx.clearRect(0, 0, leaders.width, leaders.height);
    labels.forEach((l) => l.classList.toggle('on', on));
    if (!on) return;
    const boxes = phone.parts.map((part) => phone.partBox(part));
    const order = boxes.map((b, i) => ({ b, i })).sort((p, q) => (portrait ? p.b.cy - q.b.cy : p.b.cx - q.b.cx));
    const col = stage.classList.contains('is-inv') || G.b >= 0.5 ? 'rgba(236,241,246,.9)' : `rgb(${ink})`;
    lctx.strokeStyle = col; lctx.fillStyle = col; lctx.lineWidth = Math.max(1, d * 0.75);
    const u = grid.u;
    order.forEach(({ b, i }, k) => {
      const el = labels[i], w = el.getBoundingClientRect().width, ww = grid.ceil(w), side = k % 2 ? 1 : -1;
      const [ax, ay] = phone.anchor(phone.parts[i], side * 0.55, 0);
      let lx, sy;                                                  // the word's left edge and its shelf, on lines
      if (portrait) {   // pieces stacked down the screen: names left and right
        lx = side < 0 ? Math.max(band.left, grid.floor(b.left - u - ww)) : Math.min(W - band.right - ww, grid.ceil(b.right + u));
        sy = clamp(grid.snap(ay), band.top + u, H - band.bottom);
      } else {          // pieces spread across: names above and below
        lx = clamp(grid.snap(ax - ww / 2), band.left, W - band.right - ww);
        sy = side < 0 ? Math.max(band.top + u, grid.floor(b.top - u)) : Math.min(H - band.bottom, grid.ceil(b.bottom + 1.5 * u));
      }
      // clear of every piece (not only its own): out a cell at a time, away from the phone, while it would touch one
      const c = 0;                                                         // clearance around every piece (a quarter cell pushed "Board" into the back on phones)
      const touches = (x) => boxes.some((q) => x < q.right + c && x + ww > q.left - c && sy - u < q.bottom + c && sy > q.top - c);
      const fits = (x, y) => x >= band.left && x + ww <= W - band.right && y >= band.top + u && y <= H - band.bottom;
      for (let k = 0; k < 8 && touches(lx); k++) {
        const nx = portrait ? lx + (side < 0 ? -u : u) : lx, ny = portrait ? sy : sy + (side < 0 ? -u : u);
        if (fits(nx, ny)) { lx = nx; sy = ny; continue; }
        // blocked at the band's edge: a cell down, then a cell up, instead
        if (fits(lx, sy + u) && !boxes.some((q) => lx < q.right + c && lx + ww > q.left - c && sy < q.bottom + c && sy + u > q.top - c)) { sy += u; break; }
        if (fits(lx, sy - u) && !boxes.some((q) => lx < q.right + c && lx + ww > q.left - c && sy - 2 * u < q.bottom + c && sy - u > q.top - c)) { sy -= u; break; }
        break;
      }
      const ly = sy - u;                                           // its box is half a cell: the baseline half a cell above the shelf
      el.style.transform = `translate(${lx.toFixed(2)}px, ${ly.toFixed(2)}px)`;
      const sx0 = lx, sx1 = lx + ww, ex = portrait ? (side < 0 ? sx1 : sx0) : clamp(grid.snap(ax), sx0, sx1);
      shelves.push({ x0: sx0, x1: sx1, y: sy, name: el.textContent });
      const S = (v) => Math.round(v * d) + 0.5;
      lctx.beginPath(); lctx.moveTo(S(sx0), S(sy)); lctx.lineTo(S(sx1), S(sy)); lctx.stroke();
      lctx.beginPath(); lctx.moveTo(S(ex), S(sy)); lctx.lineTo(ax * d, ay * d); lctx.stroke();
      lctx.beginPath(); lctx.arc(ax * d, ay * d, 1.6 * d, 0, 7); lctx.fill();
    });
  }

  // ---------- reduced motion: still frames, in normal flow, with the full text ----------
  if (engine.reduced) {
    layout();
    const frame = (alt, cls) => { const f = document.createElement('figure'); f.className = `p1-frame ${cls || ''}`; const img = new Image(); img.alt = alt; f.append(img); return [f, img]; };
    const [f1, img1] = frame("Today's phone as a blue X-ray drawing, its six pieces apart: glass, screen, frame, board, battery, back.", 'p1-frame--blue');
    const [f2, img2] = frame("Today's phone, assembled in real materials on paper; its screen asks what you need.");
    const still = (p, lk) => { const ps = pose(p); phone.parts.forEach((pt, i) => { pt.e = ps.explodeEach[i]; }); phone.set(ps); phone.looks(lk); return phone.snapshot(); };
    const shoot = () => {
      img1.src = still(1.3, { xray: 1, ground: 0, built: 0, real: 0 });
      img2.src = still(2.45, { xray: 1, ground: 1, built: 1, real: 1 });
    };
    shoot();
    phone.ready.then(shoot);
    sec.classList.add('is-static'); weEl.classList.add('is-static'); stage.classList.remove('is-inv');
    [plateFig, credit].forEach((el) => { el.removeAttribute('style'); });
    [flyYou, flyWe].forEach((f) => { f.style.display = 'none'; });
    const list = document.createElement('p'); list.className = 'p1-frame__names mono'; list.textContent = NAMES.slice().reverse().join(' · ');
    f1.prepend(T.s1); f1.append(list);
    kinWords.forEach((w) => w.classList.add('on'));
    stage.append(T.s0, plateFig, credit, f1, T.kin, f2, T.s2, T.task, weEl, T.end);   // reading order
    // the corridor's four frames, still: each blueprint with its line (frame 4 also shows the real phones, if the
    // local-only still is there)
    import('./corridor-drawings.js').then(({ FRAMES, toSVG }) => {
      const list = document.createElement('div'); list.className = 'p1-hall';
      // round 7: the line that opens the hallway, then the five drawings with their labels
      list.insertAdjacentHTML('afterbegin', openingHTML().replace('dive__open', 'dive__open p1-hall__open'));
      FRAMES.forEach((F) => {
        const fig = document.createElement('figure'); fig.className = 'p1-hall__f';
        fig.innerHTML = `<div class="p1-hall__d" role="img" aria-label="${F.alt}">${toSVG(F.draw)}</div><figcaption>${labelHTML(F)}</figcaption>`;
        if (F.real) {
          const img = new Image(); img.alt = 'Our booking app running on an iPhone and an Android phone.'; img.className = 'p1-hall__real';
          img.onload = () => fig.querySelector('.p1-hall__d').after(img); img.src = F.real;
        }
        list.append(fig);
      });
      T.end.after(list);
    });
    Object.values(T).forEach((t) => t.classList.add('on'));
    [canvas, morphSvg, leaders, labelsEl, blue].forEach((el) => { el.hidden = true; });
    diveEl.hidden = true; diveTop.hidden = true;
    return { length: () => sec.offsetHeight / innerHeight };
  }

  // the corridor is drawn (aria-hidden); readers get its four frames as a list, in reading order after the last line
  { const l = document.createElement('div'); l.className = 'sr-only'; l.innerHTML = `<p>On the way to the next page, four drawings:</p><ol>${FRAMES.map((f) => `<li>${f.caption} ${f.fig}. ${f.story} ${f.alt}</li>`).join('')}</ol>`; stage.append(l); }

  // ---------- live: the finished phone follows the pointer (desktop) or the visitor's phone's tilt (Android) ----------
  const live = createLive();
  live.onChange((t) => { phone.tilt(t.yaw, t.pitch); if (phoneSeen) phone.render(); });

  // ---------- round 7: the scenes the page settles on (the soft snap): each rest of the story, each verb on the drum,
  // the opening line, each drawing at rest; then page 2 (its own snap area). Positions in screens of scroll. ----------
  const snapsEl = document.createElement('div'); snapsEl.className = 'p1-snaps'; snapsEl.setAttribute('aria-hidden', 'true'); sec.append(snapsEl);
  const SCENES = () => {
    const vstep = (R.verbs[1] - R.verbs[0]) / steps.length, rest = dive.stops.map(([s0, e0]) => R.dive[0] + (s0 + (e0 - s0) * 0.45) * (R.dive[1] - R.dive[0]));
    return [0, 1.3, 1.86, 2.47, 2.72, 2.92, ...steps.map((_, k) => R.verbs[0] + (k + 0.5) * vstep), 4.8, R.dive[0] + 0.55, ...rest];
  };
  let snapY = [];
  function buildSnaps(t) {   // t: page 1's ScrollTrigger (passed in: its first refresh runs while it is being created)
    if (!t) return;
    const top = sec.getBoundingClientRect().top + scrollY;
    snapY = SCENES().map((p) => t.start + (t.end - t.start) * p / SCROLL);
    snapsEl.innerHTML = snapY.map((y) => `<i class="p1-snap" style="top:${(y - top).toFixed(1)}px"></i>`).join('');
  }

  // ---------- scroll ----------
  layout();
  phone.warm();
  const { ScrollTrigger } = engine;
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => { const p = s.progress * SCROLL; if (Math.abs(p - P) > 1e-5) { P = p; render(p); } },
    onRefresh: (s) => { layout(); P = s.progress * SCROLL; render(P); buildSnaps(s); },
  });
  render(0); buildSnaps(st);
  if (page2In) { page2In.style.opacity = '0.01'; page2.classList.add('is-dive'); requestAnimationFrame(() => requestAnimationFrame(() => { page2In.style.opacity = ''; if (!diveOn) page2.classList.remove('is-dive'); })); }   // page 2 painted once now, not on the dive's first frame
  const again = () => { layout(); render(st.progress * SCROLL); };
  // first paints of the dashed hairlines (Bell's outlines) and the corridor's sheets cost ~120 ms once on the GPU: they
  // happen right after the page opens, at 1% opacity, not mid-scroll
  let warmed = false;
  const warm = () => {
    if (warmed || !morph.ready || document.documentElement.dataset.phase !== 'ready' || P >= R.draw[0]) return; warmed = true;
    morph.warm();
    dive.load().then(() => {
      if (P >= R.end[0]) return;
      // every frame drawn whole once, then three depths over three frames, so it all reaches the GPU now, not mid-dive
      diveEl.style.opacity = '0.01'; diveEl.classList.add('on'); diveTop.style.opacity = '0.01'; diveTop.classList.add('on'); dive.warm(0.35);
      requestAnimationFrame(() => { dive.render(0.55); requestAnimationFrame(() => { dive.render(0.75); requestAnimationFrame(() => requestAnimationFrame(() => {
        diveEl.style.opacity = ''; diveEl.classList.remove('on'); diveTop.style.opacity = ''; diveTop.classList.remove('on'); render(st.progress * SCROLL); })); }); });
    });
  };
  morph.load('media/plates/bell-us186787-paths.json').then(() => { again(); warm(); }).catch((e) => console.warn('[page 01] paths', e));
  engine.on('opening:done', () => requestAnimationFrame(warm));
  phone.ready.then(() => { phone.warm(); if (phoneSeen) phone.render(); });   // the dressed materials compile now, not on their first frame
  addEventListener('resize', again);
  engine.on('theme', again);
  document.fonts?.ready.then(() => { phone.refreshScreen(LIGHT.ink, LIGHT.paper, LIGHT.graphite); again(); });
  grid.onChange(() => requestAnimationFrame(again));

  // for tests
  window.__p1 = { phone, morph, stops: STOPS, scroll: SCROLL, R, yAt: (p) => st.start + (st.end - st.start) * p / SCROLL,
    box: () => phone.screenBox(), band: () => band, plate: () => plateRect, P: () => P, top: () => sec.offsetTop,
    snaps: () => snapY, drum: () => drum.i, drumA: () => drum.a, grid: () => gridLines, shelves: () => shelves, imgRect: () => imgRect, bellLines: () => bellLines, ground: () => G.b, live, dive: () => diveNow, diveApi: dive, morphOn: () => morphState.alpha > 0.001, morphT: () => morphState.t };
  return { length: () => sec.offsetHeight / innerHeight };
}

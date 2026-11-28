// Page 1 (Enter + hook) and page 2 (the hallway), rounds 3-8, pass 3b. Scroll-driven: the stage stays put while 13.24 screens
// of scroll play the story, then it scrolls away and page 3 follows. Positions p are in screens of scroll (0..13.24):
//   S0     Bell's 1877 sheet (his ink on our grid), headline and credit                                0.00 – 0.22
//          eight clean outlines draw on exactly over the scan (DrawSVG); the scan fades and leaves them 0.12 – 0.36
//          the ground turns blue (one timed beat); the outlines morph into the phone's (MorphSVG)       0.36 – 0.80
//          the 3D X-ray appears exactly on them; the pieces spread far apart and turn                  0.80 – 1.12
//   S1     six pieces, named on hairline leaders (each pointing at its own piece)                      1.12 – 1.42
//   KIN    kinetic line; the pieces come together (a tick each); paper, built, real                    1.44 – 2.32
//   S2     "…to serve you."                                                                            2.34 – 2.60
//   YOU    alone                                                                                       2.62 – 2.80
//   TASK   "YOU gave us the task."                                                                     2.82 – 3.00
//   WE     "us" becomes WE, pinned; the verb drum turns through the seven steps, each meaning beneath   3.02 – 4.62
//   END    "Now, how can we serve you?" (round 8, signed off)                                          4.64 – 4.94
//   HALL   page 2: the grid folds into the hallway, which dresses up as you walk; "We design backwards…";
//          five drawings swing out as you walk past; at frame 5 the walk stops for 2.9 screens while the scroll
//          drives its show (scribble, lift, a turn each); the shut door, then the hand-over to page 3         4.94 – 13.24
// Round 8, held scenes: each scene holds still for a stretch of scroll, and the page renders from a lagged scroll
// position that follows the real one smoothly (scrubbed, never timed), so nothing pops and nothing jumps when the thumb
// lets go. Pass 3b (Part 5 "The scroll drives the stage"): every object animation is scrubbed, the ground's and the
// dress's changes included; kept timed: the words' reveals (a paused frame always settles on whole, readable words) and
// the travelling words, the drum's detent (Wajih kept it); STATE.md lists each with its reason.
// Reduced motion: still frames with the full text, no vibration.
// Round 6: the grid is the layout system (site/js/engine/grid.js; the texts' baselines are set in CSS, .gt).
import { Phone } from './phone.js';
import { BellMorph } from './morph.js';
import { createLive } from './live.js';
import { createDive, captionHTML, openingHTML, roomHeadHTML, DIVE, SHOW, BEAT1, B1, BEAT2, B2, BEAT3, B3 } from './dive.js';
import { FRAMES, OPENING } from './corridor-drawings.js';
const OPENING_TXT = `${OPENING.lead} ${OPENING.rest}`;
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

// round 7: the drum turns slower (more room: 1.6 screens for seven verbs); round 8: the hallway is 4.6 screens; pass 3b:
// the walk (DIVE, 5.4 screens) plus frame 5's held show (SHOW.len, 2.9 screens: the camera stops while the scroll drives it);
// 27 Nov: DIVE 6.9 with the security page's beat 1 (1.5 nominal screens: the push into the lock and down its keyway);
// 28 Nov: DIVE 9.9 with beat 2 (3 screens, 1:1 with the scroll: the room of locks); DIVE 12.9 with beat 3 (3 screens, 1:1:
// fly home, chaos, one lock).
// Its push really takes dive.pushLen() screens (it starts at the walk's own speed: per screen), so the hall's length and
// the page's are set at layout (layoutDive); these are the nominal values until then
const B1W = BEAT1[0] * DIVE, B1N = B1.fill * (BEAT1[1] - BEAT1[0]) * DIVE;   // where the push starts (walk screens), its nominal length
let HALL = DIVE + SHOW.len;
export let SCROLL = 4.94 + HALL;
const R = {
  s0: [0, 0.22], draw: [0.12, 0.28], scanOut: [0.26, 0.36], blueOn: 0.36, morph: [0.4, 0.8], xray: [0.8, 0.88], linesOut: [0.86, 0.9],
  spread: [0.9, 1.12], s1: [1.12, 1.42], kin: [1.44, 2.32], kinWords: [1.44, 1.86], seat: 1.5, paperOn: 1.98, built: [2.0, 2.14], real: [2.16, 2.3],
  s2: [2.34, 2.6], you: [2.62, 2.8], task: [2.82, 3.0], we: [3.02, 4.62], verbs: [3.06, 4.62], end: [4.64, 4.94 + HALL], endText: [4.64, 4.955], dive: [4.94, 4.94 + HALL],
};
const HAND = 0.9;          // the handover: Bell's outlines -> X-ray, pose held until here
// named stops for tests (a paused frame at each must be clean), including mid-morph, mid-drum and mid-dive
// the hallway's (hallway pass 1): TR the sketch, OPEN dressing (the opening line), LIT the lights on and the frames in, F1-F5
// each frame open at its closest (set by layoutDive from the hallway's layout: they depend on the screen), F5B frame 5
// folding back, DOOR the walk's end in front of the shut door, LOCK the hand-over to page 3. Pass 3b, frame 5's held show:
// F5H fully open (the walk stops), F5S the scribble half drawn, F5R turning real and lifting, F5L lifted, F5T both phones
// mid-turn, F5E the show's end (the walk resumes). 27 Nov, the security page's beat 1: B1H halfway to the lock, B1F its face
// filling the room, B1K at the keyhole, B1P inside the keyway under the pins (the middle pin), B1E the dark end (= beat 2's
// start). 28 Nov, beat 2: B2K backing out of the keyhole, B2H the headline over the room (the camera holding), B2W mid-wave
// while circling, B2E beat 2's end (the room turned, every lock unlocked). 28 Nov, beat 3: B3S the room squared and the
// camera pulled back, B3F the copies flying home, B3C the chaos, B3B the lock building itself, B3L one lock, centred (beat 3's
// end); LOCK the (temporary) hand-over to page 3 done
export const STOPS = { S0: 0.1, draw: 0.24, blue: 0.36, morph: 0.6, S1: 1.3, kin: 1.72, paper: 2.2, dress: 2.23, REAL: 2.45, S2: 2.5, YOU: 2.72, TASK: 2.92, WE: 3.12, DRUM: 3.9, END: 4.8, TR: 5.11, OPEN: 5.5, LIT: 6.2, F1: 6.6, F2: 7.3, F3: 8.0, F4: 8.7, F5H: 9.2, F5S: 9.4, F5R: 9.75, F5L: 10.2, F5T: 11.0, F5E: 12.1, F5: 12.3, F5B: 12.45, DOOR: 12.84, B1H: 13.19, B1F: 13.53, B1K: 13.62, B1P: 13.95, B1E: 14.34, B2K: 15.04, B2H: 15.58, B2W: 16.66, B2E: 17.34, B3S: 17.94, B3F: 18.24, B3C: 18.84, B3B: 19.68, B3L: 20.34, LOCK: 20.74 };
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
  const diveEl = $('.p1-dive'), diveTop = $('.p1-dive-top'), mark2 = $('#page-02'), mark3 = $('#page-03-door');   // 28 Nov: + where page 3 starts (beat 1, at the door)
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
    return { explodeEach, yaw: keys(p, K.map(([q, o]) => [q, o.yaw])), pitch: keys(p, K.map(([q, o]) => [q, o.pitch])), fit: band, gap: 68 };   // round 8: the pieces further apart (was 52 mm)
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
      bT = 4 * u; bB = grid.floor(tbTop) - 2 * u; bL = grid.ceil(Math.max(Math.min(W * 0.5, textRight + 2 * u), textRight + u)); bR = W - 2 * u;   // round 8: never under a wide line
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
    credit.style.top = `${grid.ceil(it + ih) + u / 2}px`; credit.style.left = `${grid.ceil(il)}px`;   // round 8: half a cell clear of the scan, a cell clear of the title block
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
    if (desktop && !engine.reduced) { const d = vBase - wBase; wordEl.style.translate = `0 ${d.toFixed(2)}px`; wBase = vBase; }   // (reduced motion: no drum to stand on)
    const sx = sr.left - box.left, wl = sx + mw.inkL, wr = sx + mw.inkR;
    const vl = dr.left - box.left, vr = vl + widest;
    const wCap = wBase - mw.cap, vCap = vBase - mv.cap, vX = vBase - mv.xh;
    // round 8 (TYPE_RULES): every drawn mark keeps half a cell clear of every letter. The verb window clears the verbs'
    // tallest ascender and deepest descender by half a cell; there are no ticks on the letters; the dimensions sit a cell
    // off the type, with their live measurement ON the line (DM Mono Light), the line broken round it (CAD style)
    const u = grid.u, half = u / 2 + 1;
    let asc = 0, desc = 0; verbs.forEach((v) => { const m = mctx.measureText(v.textContent); asc = Math.max(asc, m.actualBoundingBoxAscent); desc = Math.max(desc, m.actualBoundingBoxDescent); });
    const win = { t: vBase - asc - half, b: vBase + desc + half, l: vl - half, r: vr + half };
    mctx.font = `300 ${(desktop ? 0.375 : 0.4375) * rem}px "DM Mono"`; if ('letterSpacing' in mctx) mctx.letterSpacing = `${0.08 * (desktop ? 0.375 : 0.4375) * rem}px`;
    const mcap = mctx.measureText('8').actualBoundingBoxAscent, mw_ = (s) => mctx.measureText(s).width;
    const f = (v) => v.toFixed(1);
    const px = (v) => `${v.toFixed(1)} PX`;
    // WE's dimension: phones on its right (the left is the screen's gutter), desktop on its left (the drum is on its right)
    const dimW = desktop ? wl - u : wr + u, dimV = win.r + u;
    // the verb window's height is short: its measurement stands beside its line (outside, half a cell clear)
    const mV = px(win.b - win.t), mVx = dimV + half + mcap / 2;
    const o = desktop ? 1.5 * rem : 10;                          // the grid's overshoot past the outermost mark
    const L = Math.min(wl, win.l, desktop ? dimW - half : wl) - o, R = Math.max(desktop ? wr : dimW + half + mw_('BASE') + 6, mVx + mcap / 2 + half) + o;
    const T = Math.min(wCap, win.t) - o, B = Math.max(wBase, win.b) + o;
    const hl = (y) => `<path class="g" d="M${f(L)} ${f(y)}H${f(R)}"/>`;
    const vline = (x) => `<path class="g" d="M${f(x)} ${f(T)}V${f(B)}"/>`;
    // a vertical dimension with slender arrowheads; gap: the measurement's room on the line (0: whole)
    const dim = (x, y0, y1, gap = 0) => { const a = 5, w = 2, m = (y0 + y1) / 2;
      const shaft = gap && (y1 - y0) / 2 - gap / 2 > a + 2 ? `M${f(x)} ${f(y0)}V${f(m - gap / 2)}M${f(x)} ${f(m + gap / 2)}V${f(y1)}` : `M${f(x)} ${f(y0)}V${f(y1)}`;
      return `<path class="d" d="${shaft}M${f(x - w)} ${f(y0 + a)}L${f(x)} ${f(y0)}L${f(x + w)} ${f(y0 + a)}M${f(x - w)} ${f(y1 - a)}L${f(x)} ${f(y1)}L${f(x + w)} ${f(y1 - a)}"/>`; };
    // line names: on the grid line's end, clear of the dimensions
    const lab = (x, y, t, cls = '') => `<text class="${cls}" x="${f(x)}" y="${f(y)}">${t}</text>`;
    const seen = new Set(), Hs = [];
    const weNameX = desktop ? dimW - half - 4 : dimW + half + 4;   // clear of the dimension's arrowheads
    const addH = (y, name, side) => {
      const k = Math.round(y); if (seen.has(k)) return; seen.add(k);
      Hs.push(hl(y) + (side === 'we' ? lab(weNameX, y - 4, name, desktop ? 'e' : '') : lab(R + 5, y, name, 'r')));
    };
    addH(wCap, 'CAP', 'we'); addH(wBase, 'BASE', desktop ? 'verb' : 'we'); addH(vCap, 'CAP', 'verb'); addH(vX, 'X', 'verb'); addH(vBase, 'BASE', 'verb');
    const Vs = [wl, wr, win.l, win.r].map(vline).join('');
    const winRect = `<path class="w" d="M${f(win.l)} ${f(win.t)}H${f(win.r)}V${f(win.b)}H${f(win.l)}Z"/>`;
    const mid = (win.t + win.b) / 2, ix = 6;   // the window's index marks, left and right, as on a dial
    const index = `<path class="w" d="M${f(win.l - ix)} ${f(mid)}H${f(win.l)}M${f(win.r)} ${f(mid)}H${f(win.r + ix)}"/>`;
    const mW = px(wBase - wCap), gapW = mw_(mW) + 2 * half;
    const dims = dim(dimW, wCap, wBase, gapW) + dim(dimV, win.t, win.b);
    const turned = (x, y, t) => `<text class="m" transform="translate(${f(x)} ${f(y)}) rotate(-90)" dy="${f(mcap / 2)}">${t}</text>`;
    const meas = turned(dimW, (wCap + wBase) / 2, mW) + turned(mVx, (win.t + win.b) / 2, mV);
    gridSvg.setAttribute('viewBox', `0 0 ${f(box.width)} ${f(box.height)}`);
    gridSvg.innerHTML = Hs.join('') + Vs + winRect + index + dims + meas;
    gridLines = { wCap, wBase, vCap, vX, vBase, win, L, R, T, B, o, wl, wr };
  }
  let gridLines = null;
  function paintDrum() {
    wheel.style.transform = `translateZ(${(-drumR).toFixed(1)}px) rotateX(${(drum.a * TH).toFixed(2)}deg)`;
    verbs.forEach((v, k) => {
      const d = Math.abs(k - drum.a);
      v.style.opacity = (d <= 1 ? 1 - 0.8 * d : d <= 1.5 ? 0.4 * (1.5 - d) : 0).toFixed(3);   // round 8: one faint verb each side (the next ones would crowd WE and the meaning)
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

  // ---------- the hallway's layout ----------
  function layoutDive() {
    dive.layout(diveEl.clientWidth || W, diveEl.clientHeight || innerHeight, { u: grid.u });
    const c = dive.closeAt(), o = dive.openAt(); if (!c || !o) return;
    holdAt = o[o.length - 1];
    const at = (s) => +(R.dive[0] + s).toFixed(3);
    c.forEach((s, i) => { STOPS[`F${i + 1}`] = at(hallOf(s)); });
    Object.assign(STOPS, { F5H: at(holdAt), F5S: at(holdAt + 0.2), F5R: at(holdAt + 0.55), F5L: at(holdAt + 1.0), F5T: at(holdAt + 1.8), F5E: at(holdAt + SHOW.len) });
    STOPS.F5B = +(STOPS.F5 + 0.12).toFixed(3); STOPS.DOOR = at(5.0 + SHOW.len);
    // beat 1 at walking speed: the push's real length, the hall's and the page's (the section's height follows)
    pushLen = dive.pushLen() || B1N;
    HALL = DIVE + SHOW.len + pushLen - B1N; SCROLL = 4.94 + HALL; R.end[1] = R.dive[1] = 4.94 + HALL;
    STOPS.LOCK = at(HALL);
    if (!engine.reduced) { const hgt = `${((SCROLL + 1) * 100).toFixed(2)}lvh`; if (sec.style.height !== hgt) { sec.style.height = hgt; heightMoved = true; } }
    const b1 = (b) => at(hallOf((BEAT1[0] + (BEAT1[1] - BEAT1[0]) * b) * DIVE));   // beat 1's share b -> a stop
    Object.assign(STOPS, { B1H: b1(B1.fill / 2), B1F: b1(B1.fill), B1K: b1((B1.fill + B1.mouth) / 2), B1P: b1(B1.mouth + (B1.pins - B1.mouth) * 0.51), B1E: b1(1) });
    // beat 2 (28 Nov): a moment of lab B3 (its p) -> a stop; B2E beat 2's last frame
    const b2 = (pB) => at(hallOf((BEAT2[0] + (BEAT2[1] - BEAT2[0]) * (B2.back + (1 - B2.back) * (pB - B2.a) / (B2.b - B2.a))) * DIVE));
    Object.assign(STOPS, { B2K: b2(0.37), B2H: b2((B2.head[0] + B2.head[1]) / 2), B2W: b2(0.7), B2E: b2(B2.b) });
    // beat 3 (28 Nov): its share -> a stop (1:1 with the scroll); B3L beat 3's last frame (the key seated)
    const b3 = (b) => at(hallOf((BEAT3[0] + (BEAT3[1] - BEAT3[0]) * b) * DIVE));
    Object.assign(STOPS, { B3S: b3(B3.square), B3F: b3(B3.burst[0]), B3C: b3((B3.build + B3.burst[1]) / 2 + 0.01), B3B: b3(0.78), B3L: b3(1) });
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

  // ---------- the ground: paper -> blue -> paper. Pass 3b ("the scroll drives the stage"): each change is scrubbed over a
  // short stretch of scroll (GROUND_K screens, centred on its beat), no longer a timed beat ----------
  const GROUND_K = 0.08;
  const groundAt = (p) => span(p, R.blueOn - GROUND_K / 2, R.blueOn + GROUND_K / 2) * (1 - span(p, R.paperOn - GROUND_K / 2, R.paperOn + GROUND_K / 2));
  const G = { b: 0, target: 0 };
  const look = { xray: 0, ground: 1, built: 0, real: 0 };
  function paintGround() {
    blue.style.opacity = G.b.toFixed(3);
    const onBlue = G.b >= 0.5;
    stage.classList.toggle('is-inv', onBlue && !dark);
    look.ground = onBlue ? 0 : 1;
    morph.set({ ...morphState, color: onBlue ? '#ECF1F6' : hex(ink) });
  }
  function groundTo(b) {
    if (b === G.b) return; G.b = b; paintGround();
  }
  let morphState = { draw: 0, t: 0, alpha: 0 };
  // matte -> real: pass 3b, scrubbed over R.real (was one short timed beat)

  // ---------- one frame of the story at scroll position p ----------
  function render(p) {
    // Bell's sheet: the scan, its clean outlines drawn on top, then the outlines alone, morphing into the phone's
    const scanOut = span(p, ...R.scanOut);
    plateFig.style.opacity = String(1 - scanOut);
    plateFig.style.visibility = scanOut >= 1 ? 'hidden' : 'visible';
    credit.style.opacity = String(1 - span(p, 0.2, 0.28));
    groundTo(ease(groundAt(p)));
    morphState = { draw: span(p, ...R.draw), t: span(p, ...R.morph), alpha: p < R.draw[0] || p >= R.linesOut[1] ? 0 : 1 - span(p, ...R.linesOut) };
    morph.set({ ...morphState, color: G.b >= 0.5 ? '#ECF1F6' : hex(ink) });

    const ps = pose(Math.max(p, HAND));
    phone.parts.forEach((part, i) => { part.e = ps.explodeEach[i]; });
    phone.set(ps);
    look.xray = span(p, ...R.xray); look.built = ease(span(p, ...R.built)); look.real = ease(span(p, ...R.real));
    look.ground = G.b >= 0.5 ? 0 : 1;
    phone.looks(look);
    const shown = p >= R.xray[0] && p < R.s2[1];
    canvas.classList.toggle('is-off', !shown);
    canvas.style.opacity = shown ? (span(p, R.xray[0], R.xray[0] + 0.04) * (1 - span(p, R.s2[1] - 0.06, R.s2[1]))).toFixed(3) : '0';   // pass 3b: in and out by scroll (was a timed fade)
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

  // page 2, the hallway: on from its first scroll position until page 1's last (then the stage, plain paper and grid like
  // the open door's view, scrolls away and page 3 follows)
  let diveNow = null, hallDark = false, phonesT = 0;
  // pass 3b: once frame 5 is fully open the walk stops for SHOW.len screens while the scroll drives its show (holdAt: the
  // walk's screens at that moment, from the hallway's layout); hall screens h -> the walk's screens and the show
  let holdAt = Infinity;
  // 27 Nov, beat 1 at walking speed: past the walk's end the push takes pushLen screens of scroll for the dive's nominal
  // B1N (beatAt: the scroll's walk screens -> the dive's; beatOf the other way); the rest of the beat is 1:1
  let pushLen = B1N, heightMoved = false;
  const beatAt = (v) => (v <= B1W ? v : v <= B1W + pushLen ? B1W + (v - B1W) * B1N / pushLen : v - pushLen + B1N);
  const beatOf = (w) => (w <= B1W ? w : w <= B1W + B1N ? B1W + (w - B1W) * pushLen / B1N : w + pushLen - B1N);
  const hallAt = (h) => (h <= holdAt ? { w: h, show: 0 } : h < holdAt + SHOW.len ? { w: holdAt, show: h - holdAt } : { w: beatAt(h - SHOW.len), show: SHOW.len });
  const hallOf = (w) => (w <= holdAt + 1e-9 ? w : beatOf(w) + SHOW.len);   // the walk's screens -> hall screens
  // hallway pass 2: the strip and the title block wear their dark version while you are in the dark hall
  const setHallDark = (on) => { if (on === hallDark) return; hallDark = on; document.documentElement.classList.toggle('hall-dark', on); };
  function renderDive(p) {
    const h = clamp(p - R.dive[0], 0, HALL), { w, show } = hallAt(h), q = w / DIVE, going = p > R.dive[0];   // round 8b: the hallway holds its last frame (the lock filling the screen) while page 3 takes over
    // frame 5's real phones (pass 3) load from page 1's X-ray scene on, in the first pause (300 ms without scrolling), so
    // their parsing never lands in a moving frame; once the hallway starts they load at once whatever happens
    if (p >= R.dive[0]) dive.loadPhones();
    else if (p >= R.s1[0]) { clearTimeout(phonesT); phonesT = setTimeout(() => dive.loadPhones(), 300); }
    diveEl.classList.toggle('on', going); diveTop.classList.toggle('on', going);
    if (!going) { diveNow = null; setHallDark(false); return; }
    const d = dive.render(q, false, show); if (!d) return;
    setHallDark(d.dress > 0.5 && d.xray < 0.5 && !diveTop.classList.contains('is-past'));
    diveNow = { ...d, q, h };
  }

  // the hallway's layers are fixed to the screen: once page 1's stage starts to scroll away (page 3 takes over there, on
  // the same frame), they go
  const past = () => { const off = sec.getBoundingClientRect().bottom < innerHeight - 1; diveEl.classList.toggle('is-past', off); diveTop.classList.toggle('is-past', off); if (off) setHallDark(false); };
  addEventListener('scroll', past, { passive: true }); addEventListener('resize', past);

  // names beside each piece: a mono word on a hairline leader with a short shelf under it, alternating sides.
  // Round 8: each leader points at its own piece (a point on the piece's face that no other piece covers, on its name's
  // side), and every name keeps half a grid cell clear of every piece (TYPE_RULES rule 2)
  let shelves = [], leaderSegs = [];   // for the checks: each name's shelf and leader (stage px)
  const inBox = (x, y, q, m = 0) => x > q.left - m && x < q.right + m && y > q.top - m && y < q.bottom + m;
  /** does the segment s meet the rect (x0, y0)-(x1, y1) */
  const segNear = (s, x0, y0, x1, y1) => {
    let t0 = 0, t1 = 1; const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
    for (const [p, q] of [[-dx, s.x1 - x0], [dx, x1 - s.x1], [-dy, s.y1 - y0], [dy, y1 - s.y1]]) {
      if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
      const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return t0 <= t1;
  };
  function anchorFor(i, side, boxes) {
    const part = phone.parts[i]; let best = null;
    for (const v of [0, -0.35, 0.35, -0.65, 0.65]) for (const uu of [0.55, 0.3, 0.8, 0, -0.3, -0.55, -0.8]) {
      const [x, y] = phone.anchor(part, side * uu, v);
      if (!inBox(x, y, boxes[i], -2)) continue;
      const covered = phone.parts.reduce((n, _, k) => n + (k !== i && phone.inHull(k, x, y, 3) ? 1 : 0), 0);   // inside how many other pieces' outlines
      const score = covered * 1000 + Math.abs(v) * 2 + Math.abs(uu - 0.55);
      if (!best || score < best.score) best = { x, y, score };
    }
    return best ? [best.x, best.y] : phone.anchor(part, side * 0.55, 0);
  }
  function drawLabels(on) {
    const d = leaders.width / W; shelves = []; leaderSegs = [];
    lctx.clearRect(0, 0, leaders.width, leaders.height);
    labels.forEach((l) => l.classList.toggle('on', on));
    if (!on) return;
    const boxes = phone.parts.map((part) => phone.partBox(part));
    const order = boxes.map((b, i) => ({ b, i })).sort((p, q) => (portrait ? p.b.cy - q.b.cy : p.b.cx - q.b.cx));
    const col = stage.classList.contains('is-inv') || G.b >= 0.5 ? 'rgba(236,241,246,.9)' : `rgb(${ink})`;
    lctx.strokeStyle = col; lctx.fillStyle = col; lctx.lineWidth = Math.max(1, d * 0.75);
    const u = grid.u, c = u / 2 + 1;                                      // half a cell clear of every piece
    const placed = [];
    order.forEach(({ b, i }, k) => {
      const el = labels[i], w = el.getBoundingClientRect().width, ww = grid.ceil(w), side = k % 2 ? 1 : -1;
      const [ax, ay] = anchorFor(i, side, boxes);
      let lx, sy;                                                  // the word's left edge and its shelf, on lines
      if (portrait) {   // pieces stacked down the screen: names left and right
        lx = side < 0 ? Math.max(band.left, grid.floor(b.left - u - ww)) : Math.min(W - band.right - ww, grid.ceil(b.right + u));
        sy = clamp(grid.snap(ay), band.top + u, H - band.bottom);
      } else {          // pieces spread across: names above and below
        lx = clamp(grid.snap(ax - ww / 2), band.left, W - band.right - ww);
        sy = side < 0 ? Math.max(band.top + u, grid.floor(b.top - u)) : Math.min(H - band.bottom, grid.ceil(b.bottom + 1.5 * u));
        // below the piece the leader rises to it: the word stands beside the anchor, so the leader never crosses it
        if (side > 0) { lx = grid.ceil(ax + u); if (lx + ww + u > W - band.right) lx = grid.floor(ax - 2 * u - ww); }
      }
      // the word's ink: from its cap line to its baseline (half a cell above the shelf); clear of every piece's outline
      const touches = (x, y) => { const t0 = y - u / 2 - 0.45 * u, b0 = y - u / 2;
        return phone.parts.some((_, q) => phone.hullNear(q, x - c, t0 - c, x + ww + c, b0 + c))
          || placed.some((q) => x < q.x1 + u && x + ww > q.x0 - u && y - u < q.y + u && y > q.y - 2 * u)
          || leaderSegs.some((s) => segNear(s, x - c, t0 - c, x + ww + c, b0 + c)); };   // and every other name's shelf and leader
      const fits = (x, y) => x >= band.left && x + ww <= W - band.right && y >= band.top + u && y <= H - band.bottom;
      // out a cell at a time, away from the phone; else down or up a cell at a time
      if (touches(lx, sy)) {
        let found = null;
        for (let n = 1; n <= 12 && !found; n++) {
          const cands = portrait ? [[lx + (side < 0 ? -n * u : n * u), sy], [lx, sy + n * u], [lx, sy - n * u]] : [[lx, sy + (side < 0 ? -n * u : n * u)], [lx + n * u, sy], [lx - n * u, sy]];
          for (const [x, y] of cands) if (fits(x, y) && !touches(x, y)) { found = [x, y]; break; }
        }
        if (found) [lx, sy] = found;
      }
      placed.push({ x0: lx, x1: lx + ww, y: sy });
      const ly = sy - u;                                           // its box is half a cell: the baseline half a cell above the shelf
      el.style.transform = `translate(${lx.toFixed(2)}px, ${ly.toFixed(2)}px)`;
      // the leader meets the shelf where it can't cross the word: straight down from under it, or (rising) from the shelf
      // run out a cell past the word's end nearest the anchor
      let sx0 = lx, sx1 = lx + ww, ex;
      if (ay > sy + 1) ex = clamp(grid.snap(ax), sx0, sx1);
      else if (ax >= lx + ww / 2) { sx1 = lx + ww + u; ex = sx1; } else { sx0 = lx - u; ex = sx0; }
      shelves.push({ x0: sx0, x1: sx1, y: sy, name: el.textContent });
      leaderSegs.push({ x1: sx0, y1: sy, x2: sx1, y2: sy, tag: `shelf:${el.textContent}` }, { x1: ex, y1: sy, x2: ax, y2: ay, tag: `leader:${el.textContent}` });
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
    import('./corridor-drawings.js').then(({ FRAMES, toSVG, MOUNT }) => {
      const list = document.createElement('div'); list.className = 'p1-hall';
      // round 7: the line that opens the hallway, then (hallway pass 1) the dressed hall, still, every frame open, then the
      // five drawings with their labels
      list.insertAdjacentHTML('afterbegin', openingHTML().replace('dive__open', 'dive__open p1-hall__open'));
      const hall = document.createElement('figure'); hall.className = 'p1-hall__f p1-hall__still';
      const himg = new Image(); himg.alt = 'The hallway, dressed: dark walls, a light strip down the ceiling, a spotlight over each of five drawings open on their hinges, and a shut door at the end.';
      hall.append(himg); list.querySelector('.p1-hall__open').after(hall);
      requestAnimationFrame(() => { const w = Math.round(list.getBoundingClientRect().width) || 320, h = Math.round(Math.min(innerHeight * 0.75, w * 1.25));
        himg.width = w; himg.height = h;
        // then (pass 3) frame 5 still: the real phones standing out of their frame, front on, no turn (local files only;
        // without them its blueprint stays)
        dive.still(w, h, { u: grid.u }).then((url) => { himg.src = url; return dive.frameStill(FRAMES.length - 1, w, Math.round(w * 1.45), { u: grid.u }); })
          .then((r) => { if (!r) return; const d5 = list.querySelectorAll('.p1-hall__d')[FRAMES.length - 1]; if (!d5) return;
            const img = new Image(); img.className = 'p1-hall__real'; img.alt = 'Our booking app on the real iPhone and Android phone, standing out of their frame.'; img.width = Math.round(r.w); img.height = Math.round(r.h); img.src = r.url;
            d5.replaceWith(img); })
          .catch((e) => console.warn('[page 01] hall still', e)); });
      FRAMES.forEach((F) => {
        const fig = document.createElement('figure'); fig.className = 'p1-hall__f';
        fig.innerHTML = `<div class="p1-hall__d" role="img" aria-label="${F.alt}">${toSVG(F.draw, { pad: Math.round(F.draw.w * MOUNT) })}</div><figcaption>${captionHTML(F)}</figcaption>`;
        list.append(fig);
      });
      // 27 Nov, the security page's beat 1 with reduced motion: no flight; the lock's face, then a cross-fade to the dark
      // (its opacity follows the scroll: no motion)
      let lockStillDone; const lockStill = new Promise((r) => { lockStillDone = r; });
      const lockF = document.createElement('figure'); lockF.className = 'p1-hall__lock';
      const limg = new Image(); limg.alt = "The door's brass lock, close up: its face fills the frame, the keyway at its foot.";
      lockF.append(limg); list.append(lockF);
      requestAnimationFrame(() => {
        const w = Math.round(list.getBoundingClientRect().width) || 320, h = Math.round(Math.min(innerHeight * 0.75, w * 1.25));
        limg.width = w; limg.height = h;
        lockStillDone(dive.faceStill(w, h, { u: grid.u }).then((url) => { if (url) limg.src = url; else lockF.remove(); }).catch((e) => console.warn('[page 01] lock still', e)));
      });
      const fadeLock = () => { const r = lockF.getBoundingClientRect(); if (!r.height) return; limg.style.opacity = (1 - span(innerHeight * 0.5 - r.top, r.height * 0.15, r.height * 0.85)).toFixed(3); };
      addEventListener('scroll', fadeLock, { passive: true }); addEventListener('resize', fadeLock); fadeLock();
      // 28 Nov, beat 2 with reduced motion: no flight; a still of the room of locks (the camera's hold after the pull-back)
      // with its headline (a draft, flagged) over it, then the same fade to the dark as the scroll passes (no motion)
      const roomF = document.createElement('figure'); roomF.className = 'p1-hall__room';
      roomF.insertAdjacentHTML('afterbegin', roomHeadHTML());
      const rimg = new Image(); rimg.alt = 'Out of the keyhole, a room of brass locks in every direction around the one in the middle.';
      roomF.append(rimg); list.append(roomF);
      requestAnimationFrame(() => {
        const w = Math.round(list.getBoundingClientRect().width) || 320, h = Math.round(Math.min(innerHeight * 0.75, w * 1.25));
        rimg.width = w; rimg.height = h;
        // (after the face's still: both lay the same hallway out at the figure's size, one at a time)
        lockStill.then(() => dive.roomStill(w, h, { u: grid.u })).then((url) => { if (url) rimg.src = url; else roomF.remove(); }).catch((e) => console.warn('[page 01] room still', e));
      });
      const fadeRoom = () => { const r = rimg.getBoundingClientRect(); if (!r.height) return; rimg.style.opacity = (1 - span(innerHeight * 0.5 - r.top, r.height * 0.15, r.height * 0.85)).toFixed(3); };
      addEventListener('scroll', fadeRoom, { passive: true }); addEventListener('resize', fadeRoom); fadeRoom();
      // 28 Nov, beat 3 with reduced motion: no flight, no chaos; a still of the one lock, centred, the key in it (beat 3's
      // last frame), then the same fade to the dark as the scroll passes (no motion)
      const oneF = document.createElement('figure'); oneF.className = 'p1-hall__one';
      const oimg = new Image(); oimg.alt = 'One brass lock, centred on the dark, the key in it.';
      oneF.append(oimg); list.append(oneF);
      requestAnimationFrame(() => {
        const w = Math.round(list.getBoundingClientRect().width) || 320, h = Math.round(Math.min(innerHeight * 0.75, w * 1.25));
        oimg.width = w; oimg.height = h;
        lockStill.then(() => dive.oneStill(w, h, { u: grid.u })).then((url) => { if (url) oimg.src = url; else oneF.remove(); }).catch((e) => console.warn('[page 01] one-lock still', e));
      });
      const fadeOne = () => { const r = oimg.getBoundingClientRect(); if (!r.height) return; oimg.style.opacity = (1 - span(innerHeight * 0.5 - r.top, r.height * 0.15, r.height * 0.85)).toFixed(3); };
      addEventListener('scroll', fadeOne, { passive: true }); addEventListener('resize', fadeOne); fadeOne();
      T.end.after(list);
      // page 2 starts at the hallway's still figures
      mark2.style.top = `${list.getBoundingClientRect().top - sec.getBoundingClientRect().top}px`;
      // and page 3 at the lock's face (beat 1's still)
      if (mark3) mark3.style.top = `${lockF.getBoundingClientRect().top - sec.getBoundingClientRect().top}px`;
    });
    Object.values(T).forEach((t) => t.classList.add('on'));
    [canvas, morphSvg, leaders, labelsEl, blue].forEach((el) => { el.hidden = true; });
    diveEl.hidden = true; diveTop.hidden = true;
    return { length: () => sec.offsetHeight / innerHeight };
  }

  // the corridor is drawn (aria-hidden); readers get its four frames as a list, in reading order after the last line
  { const l = document.createElement('div'); l.className = 'sr-only'; l.innerHTML = `<p>${OPENING_TXT} Down the hallway, five drawings, then a door with a lock:</p><ol>${FRAMES.map((f) => `<li>${f.caption} ${f.fig}. ${f.story} ${f.alt}</li>`).join('')}</ol>`; stage.append(l); }

  // ---------- live: the finished phone follows the pointer (desktop) or the visitor's phone's tilt (Android) ----------
  const live = createLive();
  live.onChange((t) => { phone.tilt(t.yaw, t.pitch); if (phoneSeen) phone.render(); });

  // ---------- scroll (round 8: held scenes, no snap). The page renders from a lagged position that follows the real
  // scroll smoothly (an exponential follow, about 0.1 s), so the scenes are scrubbed, never timed, and nothing jumps when
  // the thumb lets go. A jump of more than two screens (a link, the hyperdrive) is taken at once. ----------
  layout();
  phone.warm();
  const { ScrollTrigger } = engine;
  const TAU = 0.1;
  let target = 0, lagRaf = 0, lastT = 0;
  function chase(now) {
    lagRaf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - lastT) / 1000)); lastT = now;
    const d = target - P;
    const p = Math.abs(d) > 2 || Math.abs(d) < 2e-4 ? target : P + d * (1 - Math.exp(-dt / TAU));
    P = p; render(p);
    if (p !== target) lagRaf = requestAnimationFrame(chase);
  }
  function setTarget(p) { target = p; if (!lagRaf && p !== P) { lastT = performance.now(); lagRaf = requestAnimationFrame(chase); } }
  // the pages' marks: page 2 where the hallway starts; page 3 (28 Nov) where its beat 1 starts, the walk's end at the door
  const placeMark = (s) => { mark2.style.top = `${((s.end - s.start) * R.dive[0] / SCROLL).toFixed(1)}px`; if (mark3) mark3.style.top = `${((s.end - s.start) * STOPS.DOOR / SCROLL).toFixed(1)}px`; };
  // the section's height follows beat 1's length (layoutDive): when it moves, every trigger measures again (once)
  function refreshIfMoved() { if (!heightMoved) return; heightMoved = false; requestAnimationFrame(() => ScrollTrigger.refresh()); }
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => setTarget(s.progress * SCROLL),
    onRefresh: (s) => { layout(); cancelAnimationFrame(lagRaf); lagRaf = 0; target = P = s.progress * SCROLL; render(P); placeMark(s); refreshIfMoved(); },
  });
  render(0); placeMark(st); refreshIfMoved();   // (the first layout set the section's height: every trigger measures it once)
  const again = () => { layout(); cancelAnimationFrame(lagRaf); lagRaf = 0; target = P = st.progress * SCROLL; render(P); refreshIfMoved(); };
  // first paints of the dashed hairlines (Bell's outlines) and the corridor's sheets cost ~120 ms once on the GPU: they
  // happen right after the page opens, at 1% opacity, not mid-scroll
  let warmed = false;
  const warm = () => {
    if (warmed || !morph.ready || document.documentElement.dataset.phase !== 'ready' || P >= R.draw[0]) return; warmed = true;
    morph.warm();
    dive.load().then(() => {
      if (P >= R.end[0]) return;
      // every frame drawn whole once, then three depths over three frames, so it all reaches the GPU now, not mid-dive
      // pass 3b: first one painted frame of the opening line, fully on (its frosted backing's backdrop blur cost a 130-150 ms
      // frame the first time it was drawn, on the first walk in: found in real Chrome, no script in that frame)
      diveEl.style.opacity = '0.01'; diveEl.classList.add('on'); diveTop.style.opacity = '0.01'; diveTop.classList.add('on', 'is-warm'); dive.render(0.6 / DIVE);
      requestAnimationFrame(() => { diveTop.classList.remove('is-warm'); dive.warm(1.89 / DIVE); requestAnimationFrame(() => { dive.render(2.97 / DIVE); requestAnimationFrame(() => { dive.render(4.05 / DIVE); requestAnimationFrame(() => requestAnimationFrame(() => {
        diveEl.style.opacity = ''; diveEl.classList.remove('on'); diveTop.style.opacity = ''; diveTop.classList.remove('on'); render(P); })); }); }); });
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
  window.__p1 = { phone, morph, stops: STOPS, get scroll() { return SCROLL; }, pushLen: () => pushLen, R, yAt: (p) => st.start + (st.end - st.start) * p / SCROLL,
    hall: () => ({ holdAt, show: SHOW, len: HALL }), look: () => ({ ...look, canvas: +(canvas.style.opacity || 0) }),
    // pass 3b: render the story at p at once (no scroll, no lag), for the continuity check (tools/stagechrome.py)
    at: (p) => { cancelAnimationFrame(lagRaf); lagRaf = 0; target = P = p; render(p); return diveNow ? { t: diveNow.t, show: diveNow.show, phones: diveNow.phones, f5: diveNow.info?.[4] ? { swing: diveNow.info[4].swing, drawn: diveNow.info[4].drawn } : null, dress: diveNow.dress, lights: diveNow.lights } : null; },
    box: () => phone.screenBox(), band: () => band, plate: () => plateRect, P: () => P, top: () => sec.offsetTop, settled: () => !lagRaf && Math.abs(target - P) < 1e-4,
    leaders: () => leaderSegs, drum: () => drum.i, drumA: () => drum.a, grid: () => gridLines, shelves: () => shelves, imgRect: () => imgRect, bellLines: () => bellLines, ground: () => G.b, live, dive: () => diveNow, diveApi: dive, morphOn: () => morphState.alpha > 0.001, morphT: () => morphState.t };
  // for the type check (TYPE_RULES.md): page 1's drawn lines and shapes that are not in the DOM (the 3D phone's pieces as
  // their outlines, the names' shelves and leaders) and the hallway's (dive.js)
  window.__drawn = () => {
    const D = { lines: [], shapes: [], texts: [] };
    if (!canvas.classList.contains('is-off') && P >= R.xray[0] && P < R.s2[1]) phone.parts.forEach((pt, k) => {
      const h = phone.partHull(k); h.forEach((a, j) => { const b = h[(j + 1) % h.length]; D.lines.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], tag: `phoneA:${pt.name}` }); });
    });
    if (inR(P, R.s1)) leaderSegs.forEach((s) => D.lines.push(s));
    // the hallway only while page 1's stage is pinned on screen (after it, page 3 covers it and it scrolls away)
    if (diveTop.classList.contains('on') && sec.getBoundingClientRect().bottom >= innerHeight - 1) { const dd = dive.drawn(); D.lines.push(...dd.lines); D.shapes.push(...dd.shapes); D.texts.push(...dd.texts); }
    return D;
  };
  return { length: () => sec.offsetHeight / innerHeight };
}

// Page 1 (Enter + hook), round 3. Scroll-driven, 6 screens tall: the stage stays put while 5 screens of scroll play the
// story; the last screen is the detail callout that grows into page 2. Positions p are in screens of scroll (0..5):
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
//   END    "Now, what do you need?" with the detail callout (page 2 seen through it)                  4.00 – 4.40
//          the callout grows into page 2's stage                                                       4.30 – 4.97
// Words land on beats as short timed reveals (SplitText words rise and straighten), so a paused frame always settles
// on whole, readable words. The ground changes and the drum's turns are timed too; only the pictures scrub.
// Reduced motion: still frames with the full text, no vibration.
import { Phone } from './phone.js';
import { BellMorph } from './morph.js';
import { haptics } from '../engine/haptics.js';

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

export const SCROLL = 5;
const R = {
  s0: [0, 0.22], draw: [0.12, 0.28], scanOut: [0.26, 0.36], blueOn: 0.36, morph: [0.4, 0.8], xray: [0.8, 0.88], linesOut: [0.86, 0.9],
  spread: [0.9, 1.12], s1: [1.12, 1.42], kin: [1.44, 2.32], kinWords: [1.44, 1.86], seat: 1.5, paperOn: 1.98, built: [2.0, 2.14], real: [2.16, 2.3],
  s2: [2.34, 2.6], you: [2.62, 2.8], task: [2.82, 3.0], we: [3.02, 3.98], verbs: [3.06, 3.98], end: [4.0, 5], endText: [4.0, 4.4], frame: [4.0, 4.12], grow: [4.3, 4.97],
};
const HAND = 0.9;          // the handover: Bell's outlines -> X-ray, pose held until here
// named stops for tests (a paused frame at each must be clean), including mid-morph, mid-drum and mid-callout
export const STOPS = { S0: 0.1, draw: 0.24, morph: 0.6, S1: 1.3, kin: 1.72, paper: 2.2, S2: 2.5, YOU: 2.72, TASK: 2.92, WE: 3.12, DRUM: 3.6, END: 4.2, CALLOUT: 4.62 };
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
  const blue = $('.p1__bg--blue'), real = $('.p1__bg--real');
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
  const means = steps.map((s) => { const p = document.createElement('p'); p.textContent = s.mean; meanEl.append(p); split(p, 'w'); return p; });

  const flyYou = $('.p1-fly[data-w="you"]'), flyWe = $('.p1-fly[data-w="we"]');
  const slot = { a: $('.p1-slot--a'), c: $('.p1-slot--c'), u: $('.p1-slot--u'), w: $('.p1-slot--w') };
  const callout = $('.p1-callout'), cRect = $('.p1-callout__rect'), cTag = $('.p1-callout__tag');
  const page2 = document.getElementById('page-02'), page2In = page2?.querySelector('.p2__stage') || page2?.querySelector('.stub__in');

  const phone = new Phone(canvas);
  const morph = new BellMorph(morphSvg, gsap);
  const labels = phone.parts.map((p) => { const d = document.createElement('div'); d.className = 'p1-lbl'; d.textContent = p.name; labelsEl.append(d); return d; });
  let W = 1, H = 1, band = null, plateRect = null, P = -1, portrait = true, dpr = 1, ink = [18, 18, 18], paper = [242, 240, 235], dark = false;
  let box0 = null, bottomInset = 0, stripH = 40;
  const seated = phone.parts.map(() => true);

  // ---------- poses ----------
  function pose(p) {
    const E = portrait ? { yaw: -0.42, pitch: 1.02 } : { yaw: -1.0, pitch: 0.32 };
    const Hd = { yaw: -0.22, pitch: 0.1 }, F = { yaw: 0.34, pitch: 0.1 };
    const K = [[HAND, Hd], [R.spread[1], E], [R.seat, E], [R.real[1], F]];
    const spread = ease(span(p, HAND, R.spread[1]));
    const explodeEach = phone.parts.map((_, i) => (p < R.seat ? spread : 1 - ease(span(p, R.seat + i * 0.06, R.seat + 0.14 + i * 0.06))));   // back seats first
    return { explodeEach, yaw: keys(p, K.map(([q, o]) => [q, o.yaw])), pitch: keys(p, K.map(([q, o]) => [q, o.pitch])), fit: band };
  }

  // ---------- layout: where the picture may sit (never under the text, the strip or the title block) ----------
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const desktop = W >= 1024; portrait = !desktop;
    dpr = Math.min(devicePixelRatio || 1, 2);
    phone.resize(W, H);
    leaders.width = Math.round(W * dpr); leaders.height = Math.round(H * dpr);
    const cs = getComputedStyle(document.documentElement);
    ink = rgb(cs.getPropertyValue('--ink')); paper = rgb(cs.getPropertyValue('--paper'));
    dark = document.documentElement.dataset.theme === 'dark';
    phone.setInk(parseInt(hex(ink).slice(1), 16));
    phone.refreshScreen('#121212', '#F2F0EB', '#6B6A66');
    stripH = document.getElementById('strip')?.offsetHeight || 40;
    const tb = document.querySelector('.titleblock');
    const tbH = tb ? Math.max(0, innerHeight - tb.getBoundingClientRect().top) : 0;
    // the stage is 100lvh, but while the phone's address bar shows, its bottom is off screen: use what's visible
    const hidden = Math.max(0, H - innerHeight);
    bottomInset = hidden + tbH;
    const pictureTexts = [T.s0, T.s1, T.kin, T.s2];
    if (desktop) {
      const sl = stage.getBoundingClientRect().left;
      const textRight = Math.max(...pictureTexts.map((t) => t.getBoundingClientRect().right - sl));
      band = { top: stripH + 40, bottom: bottomInset + 48, left: Math.min(W * 0.5, textRight + 40), right: 48 };
    } else {
      const tallest = Math.max(...pictureTexts.map((t) => t.offsetHeight));
      band = { top: stripH + 24 + tallest + 18, bottom: bottomInset + 20 + 22, left: 16, right: 16 };   // + the plate credit line
    }
    // the plate: contain-fit in the band
    const bw = W - band.left - band.right, bh = H - band.top - band.bottom, a = 1600 / 1740;
    let pw = bw, ph = pw / a; if (ph > bh) { ph = bh; pw = ph * a; }
    plateRect = { left: band.left + (bw - pw) / 2, top: band.top + (bh - ph) / 2, width: pw, height: ph };
    Object.assign(plateFig.style, { left: `${plateRect.left}px`, top: `${plateRect.top}px`, width: `${pw}px`, height: `${ph}px` });
    credit.style.top = `${plateRect.top + ph + 6}px`; credit.style.left = `${plateRect.left}px`;
    // the handover: pose the phone where the X-ray appears, and give Bell's outlines the X-ray outlines to land on
    phone.parts.forEach((part) => { part.e = 0; });
    phone.set(pose(HAND));
    morph.place(plateRect, W, H, (...s) => phone.loop2D(...s), dpr);
    layoutDrum();
    layoutCallout(desktop);
    placeFlies();
    P = -1;
  }

  // ---------- the verb drum: a dial of seven words, the facing one lit ----------
  const TH = 30;   // degrees between verbs on the drum
  let drumR = 100;
  const drum = { i: -1, a: 0 };
  function layoutDrum() {
    const rowH = verbs[0].offsetHeight || 52;
    drumR = rowH / (2 * Math.sin(TH * Math.PI / 360));
    verbs.forEach((v, k) => { v.style.transform = `rotateX(${-k * TH}deg) translateZ(${drumR.toFixed(1)}px)`; });
    paintDrum();
  }
  function paintDrum() {
    wheel.style.transform = `translateZ(${(-drumR).toFixed(1)}px) rotateX(${(drum.a * TH).toFixed(2)}deg)`;
    verbs.forEach((v, k) => {
      const d = Math.abs(k - drum.a);
      v.style.opacity = (d <= 1 ? 1 - 0.8 * d : d <= 2 ? 0.2 - 0.14 * (d - 1) : d <= 2.5 ? 0.12 * (2.5 - d) : 0).toFixed(3);
    });
  }
  function setVerb(i) {
    if (i === drum.i) return;
    const prev = drum.i; drum.i = i;
    means.forEach((m, k) => m.classList.toggle('on', k === i));
    if (i < 0) return;
    if (prev < 0) { gsap.killTweensOf(drum); drum.a = i; paintDrum(); return; }
    gsap.to(drum, { a: i, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: paintDrum });
    haptics.tick(10);
  }

  // ---------- the detail callout: its starting window frames page 2's content, below the closing line ----------
  function layoutCallout(desktop) {
    if (!page2In) return;
    const pr = page2In.getBoundingClientRect(); let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
    const framed = page2In.querySelectorAll('[data-callout]');   // page 2's rows (or the whole stub)
    [...(framed.length ? framed : page2In.children)].forEach((c) => { const q = c.getBoundingClientRect(); l = Math.min(l, q.left); r = Math.max(r, q.right); t = Math.min(t, q.top - pr.top); b = Math.max(b, q.bottom - pr.top); });
    const pad = desktop ? 32 : 20;
    const endR = T.end.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const endBottom = endR.top - sr.top + T.end.offsetHeight;
    const tb = document.querySelector('.titleblock')?.getBoundingClientRect();
    let top = Math.max(t - pad, endBottom + (desktop ? 56 : 40));
    let bottom = Math.min(b + pad, H - bottomInset - (desktop ? 40 : 24));
    let left = Math.max(desktop ? 16 : 6, l - pad), right = Math.min(W - (desktop ? 16 : 6), desktop ? Math.max(r + pad, W * 0.56) : W - 6);
    if (tb && desktop && right > tb.left - 24) right = Math.max(left + 200, tb.left - 24);
    if (bottom - top < 120) bottom = Math.min(H - bottomInset - 16, top + 120);
    box0 = { left, top, right, bottom };
    if (!cDraw && window.DrawSVGPlugin) { cRect.setAttribute('width', right - left); cRect.setAttribute('height', bottom - top); cDraw = gsap.fromTo(cRect, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'none', paused: true, immediateRender: false }); cDraw.progress(1).progress(0); }
  }

  // ---------- "you" -> "YOU" and "us" -> "WE": one word each, travelling between its places ----------
  let flyT = { you: {}, we: {} };
  function measureFly(fly, places) {
    const prev = fly.style.transform; fly.style.transition = 'none'; fly.style.transform = 'none';
    const sr = stage.getBoundingClientRect(), up = fly.querySelector('.up').getBoundingClientRect(), o = fly.getBoundingClientRect();
    const fx = up.left - o.left, fy = up.top - o.top, fh = up.height, fw = up.width;
    const to = (r) => { const s = r.height / fh; return `translate(${r.left - o.left - s * fx}px, ${r.top - o.top - s * fy}px) scale(${s})`; };
    const out = {};
    Object.entries(places).forEach(([k, v]) => {
      out[k] = v === 'centre' ? `translate(${(W - fw) / 2 - (o.left - sr.left) - fx}px, ${(stripH + H - bottomInset) / 2 - fh / 2 - (o.top - sr.top) - fy}px)` : to(v.getBoundingClientRect());
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
    gsap.to(D, { r: target, duration: 0.55, ease: 'power2.inOut', onUpdate: () => { look.real = D.r; real.style.opacity = D.r.toFixed(3); phone.looks(look); if (phoneSeen) phone.render(); } });
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
    real.style.opacity = D.r.toFixed(3);

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

    drawLabels(inR(p, R.s1));
    renderCallout(p);
    // the 3D phone only renders while it can be seen (and one more frame as it goes)
    if (shown || phoneSeen) phone.render();
    phoneSeen = shown;
  }
  let phoneSeen = true;

  // the callout: a hairline window drawn on, page 2 seen through it at full scale, then the window grows to the screen
  let cDraw = null, cOn = null, cRectNow = null;
  function renderCallout(p) {
    if (!box0 || !page2) return;
    const on = p >= R.end[0] && p < R.end[1] - 1.5 / Math.max(1, H);   // within 1.5 px of the end, page 2 is home (phones scroll in whole pixels)
    if (on !== cOn) {
      cOn = on; callout.classList.toggle('on', on); page2.classList.toggle('is-callout', on);
      if (!on && page2In) page2In.style.clipPath = '';
    }
    if (!on) { cRectNow = null; return; }
    const g = ease(span(p, ...R.grow));
    const r = { left: lerp(box0.left, 0, g), top: lerp(box0.top, 0, g), right: lerp(box0.right, W, g), bottom: lerp(box0.bottom, H, g) };
    cRectNow = { ...r, g };
    page2In.style.clipPath = `inset(${r.top.toFixed(1)}px ${(W - r.right).toFixed(1)}px ${(H - r.bottom).toFixed(1)}px ${r.left.toFixed(1)}px)`;
    cRect.setAttribute('x', (r.left + 0.5).toFixed(1)); cRect.setAttribute('y', (r.top + 0.5).toFixed(1));
    cRect.setAttribute('width', Math.max(0, r.right - r.left - 1).toFixed(1)); cRect.setAttribute('height', Math.max(0, r.bottom - r.top - 1).toFixed(1));
    const d = span(p, ...R.frame);
    if (!cDraw && window.DrawSVGPlugin) cDraw = gsap.fromTo(cRect, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'none', paused: true, immediateRender: false });
    if (cDraw && d < 1 && g <= 0) cDraw.progress(d); else { cRect.style.strokeDasharray = 'none'; cRect.style.strokeDashoffset = '0'; }
    cRect.style.opacity = String(1 - span(g, 0.75, 1));
    cTag.style.transform = `translate(${r.left.toFixed(1)}px, ${(r.top - 20).toFixed(1)}px)`;
    cTag.style.opacity = String(d * (1 - span(g, 0, 0.25)));
  }

  // names beside each piece: a mono word on a hairline leader with a short shelf under it, alternating sides
  function drawLabels(on) {
    const d = leaders.width / W;
    lctx.clearRect(0, 0, leaders.width, leaders.height);
    labels.forEach((l) => l.classList.toggle('on', on));
    if (!on) return;
    const boxes = phone.parts.map((part) => phone.partBox(part));
    const order = boxes.map((b, i) => ({ b, i })).sort((p, q) => (portrait ? p.b.cy - q.b.cy : p.b.cx - q.b.cx));
    const col = stage.classList.contains('is-inv') || G.b >= 0.5 ? 'rgba(236,241,246,.9)' : `rgb(${ink})`;
    lctx.strokeStyle = col; lctx.fillStyle = col; lctx.lineWidth = Math.max(1, d * 0.75);
    order.forEach(({ b, i }, k) => {
      const el = labels[i], w = el.offsetWidth, h = el.offsetHeight, side = k % 2 ? 1 : -1;
      const [ax, ay] = phone.anchor(phone.parts[i], side * 0.55, 0);
      let lx, ly;
      if (portrait) {   // pieces stacked down the screen: names left and right
        lx = side < 0 ? Math.max(band.left, b.left - 26 - w) : Math.min(W - band.right - w, b.right + 26);
        ly = clamp(ay - h - 4, band.top, H - band.bottom - h - 6);
      } else {          // pieces spread across: names above and below
        lx = clamp(ax - w / 2, band.left, W - band.right - w);
        ly = side < 0 ? Math.max(band.top, b.top - 30 - h) : Math.min(H - band.bottom - h - 6, b.bottom + 24);
      }
      el.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px)`;
      const sy = ly + h + 4;                                     // the shelf under the word
      const sx0 = lx, sx1 = lx + w, ex = portrait ? (side < 0 ? sx1 : sx0) : clamp(ax, sx0, sx1);
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
    Object.values(T).forEach((t) => t.classList.add('on'));
    [canvas, morphSvg, leaders, labelsEl, blue, real].forEach((el) => { el.hidden = true; });
    callout.hidden = true;
    return { length: () => sec.offsetHeight / innerHeight };
  }

  // ---------- scroll ----------
  layout();
  phone.warm();
  const { ScrollTrigger } = engine;
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => { const p = s.progress * SCROLL; if (Math.abs(p - P) > 1e-5) { P = p; render(p); } },
    onRefresh: (s) => { layout(); P = s.progress * SCROLL; render(P); },
  });
  render(0);
  if (page2In) { page2In.style.opacity = '0.01'; page2.classList.add('is-callout'); requestAnimationFrame(() => requestAnimationFrame(() => { page2In.style.opacity = ''; if (!cOn) page2.classList.remove('is-callout'); })); }   // page 2 painted once now, not on the callout's first frame
  const again = () => { layout(); render(st.progress * SCROLL); };
  // first paints of the dashed hairlines (Bell's outlines, the callout's frame) cost ~120 ms once on the GPU: they
  // happen right after the page opens, at 1% opacity on top of the scan's own lines, not mid-scroll
  let warmed = false;
  const warm = () => {
    if (warmed || !morph.ready || document.documentElement.dataset.phase !== 'ready' || P >= R.draw[0]) return; warmed = true;
    morph.warm(); cDraw?.progress(0.5); callout.style.opacity = '0.01'; callout.classList.add('on');
    requestAnimationFrame(() => requestAnimationFrame(() => { callout.style.opacity = ''; cOn = null; render(st.progress * SCROLL); }));
  };
  morph.load('media/plates/bell-us186787-paths.json').then(() => { again(); warm(); }).catch((e) => console.warn('[page 01] paths', e));
  engine.on('opening:done', () => requestAnimationFrame(warm));
  phone.ready.then(() => { phone.warm(); if (phoneSeen) phone.render(); });   // the dressed materials compile now, not on their first frame
  addEventListener('resize', again);
  engine.on('theme', again);
  document.fonts?.ready.then(() => { phone.refreshScreen('#121212', '#F2F0EB', '#6B6A66'); again(); });

  // for tests
  window.__p1 = { phone, morph, stops: STOPS, scroll: SCROLL, R, yAt: (p) => st.start + (st.end - st.start) * p / SCROLL,
    box: () => phone.screenBox(), band: () => band, plate: () => plateRect, P: () => P, top: () => sec.offsetTop,
    drum: () => drum.i, ground: () => G.b, callout: () => cRectNow, morphOn: () => morphState.alpha > 0.001, morphT: () => morphState.t };
  return { length: () => sec.offsetHeight / innerHeight };
}

// Take 2 enter, Part 5 "The name, the top bar and the title block": the arrival on page 1's first screen (black).
//   1. WM.IO's mark sits at the left of the black top bar. It straightens into one line (as long as its wave) along the
//      bar's bottom line, then snakes along the grid at right angles (a trace on a circuit board); each grid line it runs
//      along lights up, thicker, behind it, then fades. The bar's boxes slide over to fill the space the mark left.
//   2. The line turns onto the first sentence's baseline and writes "Glad you’re finally here" in single-stroke technical
//      lettering (Hershey Sans), which settles into the real typeface; it drops the full stop (the mark's dot), then
//      snakes on to the beacon and coils into its ring (the O); the I becomes the beacon's dot. Then the second line
//      appears, "Tap, and we’ll take you on a journey." (draft). About 3.5 s; a tap at any moment skips to the end.
//   3. On tap the ring uncoils and the line snakes down the grid to the title block, where it becomes the mark again in
//      the block's new first cell (it stays there; the bar's boxes keep the full width), while the curtain opens onto
//      page 1.
//   4. Scrolling back to the very top: the curtain closes, the mark leaves the title block, snakes up and writes the
//      sentence again; on tap it goes home to the title block.
// Tap, click, Enter or Space skip the arrival (then enter); a scroll, a swipe or Arrow Down / Page Down / End enter at
// once, so nobody gets stuck. Only a tap or click unlocks vibration. Reduced motion: everything in place at once, any of
// the above enters at once, no replay at the top.
import { haptics } from './engine/haptics.js';
import { layoutStrip } from './engine/strip.js';
import { MARK, MARK_VIEW, wavePoints, WAVE_LEN } from './brand/mark.js';
import { GLYPHS, CAP } from './brand/lettering.js';

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeIn = (t) => t * t;
const TEXT = 'Glad you’re finally here';

// the arrival's beats (seconds)
const B = { straighten: [0, 0.4], run: [0.35, 1.1], slide: [0.4, 0.95], pour: 0.35, write: [1.05, 2.25], settle: [2.0, 2.4],
  drop: [2.3, 2.48], toBeacon: [2.45, 3.0], ione: [3.0, 3.15], second: [3.1, 3.5], END: 3.5 };
// going home (seconds from the tap)
const HB = { fade: [0, 0.2], run: [0, 0.95], curtain: 0.12, tb: [0.25, 0.65], form: [0.95, 1.3], END: 1.3 };
const LIT = { on: 0.08, fade: 0.9, a: 0.55 };
// the real words are painted from the start at a trace of opacity (invisible), so their first paint is not mid-arrival
// (a 68 ms frame as the sentence settled, real Chrome, S23 size); and the mark holds still for STILL seconds first, so
// the gate's own first paint (page 1 under the curtain, about 100 ms) lands on a still frame
const TRACE = 0.002, STILL = 0.15;   // a grid line lights up as the line's head enters it, fades once its tail leaves

/** a polyline with arc lengths: point at s, and the part between a and b */
function route(pts) {
  const p = []; pts.forEach((q) => { const l = p[p.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 0.01) p.push(q); });
  const L = [0]; for (let i = 1; i < p.length; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  const at = (s) => { s = clamp(s, 0, L[L.length - 1]); let i = 1; while (i < L.length - 1 && L[i] < s) i++; const t = (s - L[i - 1]) / Math.max(1e-9, L[i] - L[i - 1]); return [lerp(p[i - 1][0], p[i][0], t), lerp(p[i - 1][1], p[i][1], t)]; };
  const sub = (a, b) => { if (b - a < 0.01) return []; const out = [at(a)]; for (let i = 0; i < p.length; i++) if (L[i] > a && L[i] < b) out.push(p[i]); out.push(at(b)); return out; };
  // the straight runs (for the lit grid lines): axis-aligned segments only (the beacon's ring is not a grid line)
  const runs = []; for (let i = 1; i < p.length; i++) { const dx = p[i][0] - p[i - 1][0], dy = p[i][1] - p[i - 1][1];
    if (Math.abs(dx) < 0.01 && Math.abs(dy) > 1) runs.push({ v: true, c: p[i][0], a: L[i - 1], b: L[i] });
    else if (Math.abs(dy) < 0.01 && Math.abs(dx) > 1) runs.push({ v: false, c: p[i][1], a: L[i - 1], b: L[i] }); }
  return { p, L, len: L[L.length - 1], at, sub, runs };
}
const dOf = (pts) => (pts.length < 2 ? '' : 'M' + pts.map((q) => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join('L'));
/** the time at which a monotonic f(t) reaches v (for when the line's head enters a run, or its tail leaves it) */
function tAt(f, v, t0, t1) { if (f(t1) < v) return Infinity; let a = t0, b = t1; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (f(m) < v) a = m; else b = m; } return b; }

export function runEnter(engine, onDone) {
  const { gsap } = engine;
  const html = document.documentElement;
  const curtain = document.getElementById('curtain');
  const btn = document.getElementById('enter');
  const hello = btn.querySelector('.enter__hello'), stopEl = btn.querySelector('.enter__stop'), hint = btn.querySelector('.enter__hint');
  const point = curtain.querySelector('.sing__point');
  const tbMark = document.querySelector('.tb__mark'), stripMark = document.querySelector('.strip__mark svg');
  const q = (s) => curtain.querySelector(s);
  const reduced = engine.reduced;

  // ---------- the drawing layer (over the curtain; difference: white on the black gate, ink on the paper) ----------
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'arrive'); svg.setAttribute('aria-hidden', 'true');
  const el = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.append(e); return e; };
  const gLit = el('g', { class: 'arrive__lit' });
  const gLet = el('g', { class: 'arrive__letters' });
  const snake = el('path', { class: 'arrive__snake', d: '' });
  const wave = el('path', { class: 'arrive__wave', d: '' });
  const mDot = el('circle', { class: 'arrive__fill', r: 0 }), mI = el('path', { class: 'arrive__mk', d: '' }), mO = el('ellipse', { class: 'arrive__mk', rx: 0, ry: 0 });
  const stopDot = el('circle', { class: 'arrive__fill', r: 0 });
  const iLine = el('path', { class: 'arrive__snake', d: '' });
  document.body.append(svg);

  // ---------- geometry (CSS px), measured from the page itself ----------
  let G = null;
  const W0 = wavePoints(), ARC = (() => { const a = [0]; for (let i = 1; i < W0.end; i++) a.push(a[i - 1] + Math.hypot(W0.pts[i][0] - W0.pts[i - 1][0], W0.pts[i][1] - W0.pts[i - 1][1])); return a; })();
  const placeOf = (svgEl) => { const r = svgEl.getBoundingClientRect(), s = r.width / MARK_VIEW.w; return { ox: r.left - MARK_VIEW.x * s, oy: r.top - MARK_VIEW.y * s, s, r }; };
  function measure() {
    const u = window.__grid?.u || innerWidth / 20, W = innerWidth, H = innerHeight;
    const pr = point.getBoundingClientRect(), gx = pr.left + pr.width / 2, gy = pr.top + pr.height / 2;
    hello.style.opacity = hello.style.opacity || '0';
    const hr = hello.getBoundingClientRect(), sr = stopEl.getBoundingClientRect(), yb = hr.bottom, xt = hr.left;
    const cs = getComputedStyle(hello), fs = parseFloat(cs.fontSize);
    const mc = document.createElement('canvas').getContext('2d'); mc.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const cap = mc.measureText('H').actualBoundingBoxAscent, pm = mc.measureText('.');
    const stop = { x: sr.left + (pm.actualBoundingBoxRight - pm.actualBoundingBoxLeft) / 2, r: Math.max(1.2, (pm.actualBoundingBoxRight + pm.actualBoundingBoxLeft) / 2), right: sr.right };
    // the strip's mark (its first columns) and the title block's (its first cell); the title block is laid out even
    // while it is hidden
    layoutStrip(stripShare);
    const S = placeOf(stripMark || tbMark), T = placeOf(tbMark), yS = 2 * u, yT = tbMark.closest('.tb__cell').getBoundingClientRect().top;
    // the single-stroke lettering, fitted to the real sentence (its width without the full stop, its cap height)
    let adv = 0; [...TEXT].forEach((c) => { adv += (GLYPHS[c] || GLYPHS[' ']).adv; });
    const sx = (sr.left - xt) / adv, sy = cap / CAP;
    const strokes = []; let x = 0;
    [...TEXT].forEach((c) => { const g = GLYPHS[c] || GLYPHS[' ']; g.s.forEach((st) => { const pts = st.map(([a, b]) => [xt + (x + a) * sx, yb - b * sy]); let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); strokes.push({ pts, l }); }); x += g.adv; });
    let tot = 0; strokes.forEach((s) => { s.a = tot; tot += s.l; });
    G = { u, W, H, gx, gy, yb, xt, fs, cap, stop, S, T, yS, yT, strokes, letLen: tot };
    buildLetters();
    G.R2 = toBeacon(); G.R3 = home();
    if (from) G.R1 = toText(from);
  }
  function buildLetters() {
    gLet.replaceChildren();
    G.strokes.forEach((s) => { s.el = el('path', { d: dOf(s.pts), class: 'arrive__let', 'stroke-dasharray': `${s.l.toFixed(2)} ${(s.l + 1).toFixed(2)}`, 'stroke-dashoffset': s.l.toFixed(2) }, gLet); });
  }
  // the mark's points on screen in a place, and as a straight line (as long as its wave) lying on the line y0
  const markPts = (P) => W0.pts.map(([x, y]) => [P.ox + x * P.s, P.oy + y * P.s]);
  const linePts = (P, y0) => W0.pts.map((_, i) => [P.ox + (i < W0.end ? ARC[i] : ARC[W0.end - 1]) * P.s, y0]);
  const lineLen = (P) => ARC[W0.end - 1] * P.s;
  const snap = (v, f = Math.round) => f(v / G.u) * G.u;
  /** from the mark's straight line (in the strip, or the title block) to the first sentence's baseline, at right angles */
  function toText(src) {
    const { u, xt, yb } = G, P = src === 'tb' ? G.T : G.S, y0 = src === 'tb' ? G.yT : G.yS, Lw = lineLen(P), x0 = P.ox, x1 = x0 + Lw;
    const Xa = Math.max(u, snap(xt, Math.floor) - u), yA = yb - 2 * u;
    let pts, head = Lw;
    if (src === 'strip') {
      if (Xa >= x1 + u) pts = [[x0, y0], [x1, y0], [Xa, y0], [Xa, yb], [xt, yb]];
      else { const Xb = snap(x1, Math.ceil) + u; pts = [[x0, y0], [Xb, y0], [Xb, yA], [Xa, yA], [Xa, yb], [xt, yb]]; }
    } else if (Xa <= x0 - u) pts = [[x1, y0], [x0, y0], [Xa, y0], [Xa, yb], [xt, yb]];
    else if (Xa >= x1 + u) pts = [[x0, y0], [x1, y0], [Xa, y0], [Xa, yb], [xt, yb]];
    else { const Xe = snap(x1, Math.ceil) + u; pts = [[x0, y0], [Xe, y0], [Xe, yA], [Xa, yA], [Xa, yb], [xt, yb]]; }
    return { ...route(pts), head0: head, P, y0, Lw };
  }
  const circle = (n = 96) => Array.from({ length: n + 1 }, (_, i) => { const a = 2 * Math.PI * i / n; return [G.gx + G.u * Math.cos(a), G.gy + G.u * Math.sin(a)]; });
  /** from the full stop to the beacon, then round its ring (clockwise from its right, where the line arrives going down) */
  function toBeacon() {
    const { u, yb, gx, gy, stop } = G, Xr = Math.max(snap(stop.right, Math.ceil) + u, gx + 2 * u), yr = yb + u;
    return route([[stop.x, yb], [Xr, yb], [Xr, yr], [gx + u, yr], ...circle()]);
  }
  /** from the ring (the line all the way round it) down to the title block's top line, then along it over the mark's cell */
  function home() {
    const { u, gx, gy, T, yT } = G, c = gx + u, Lw = lineLen(T), x0 = T.ox, x1 = x0 + Lw;
    let tail;
    if (c >= x1) tail = [[c, yT], [x0, yT]];
    else if (c <= x0) tail = [[c, yT], [x1, yT]];
    else { const Xd = snap(x1, Math.ceil) + u; tail = [[c, yT - 2 * u], [Xd, yT - 2 * u], [Xd, yT], [x0, yT]]; }
    return { ...route([...circle(), [c, gy], ...tail]), Lw };
  }

  // ---------- one frame ----------
  let from = 'strip', stripShare = reduced ? 0 : 1;
  const show = (e, on, a = 1) => { e.style.display = on ? '' : 'none'; if (on) e.style.opacity = String(a); };
  function drawLit(R, head, tail, t) {
    // each run of the route: lit from when the head enters it until its tail leaves, then fading
    gLit.replaceChildren();
    R.runs.forEach((r) => {
      const on = tAt(head, r.a + 0.5, 0, 6), off = tAt(tail, r.b - 0.5, 0, 6);
      if (t < on) return;
      const a = t < off ? LIT.a * span(t, on, on + LIT.on) : LIT.a * (1 - span(t, off, off + LIT.fade));
      if (a <= 0.003) return;
      el('path', { class: 'arrive__grid', d: r.v ? `M${r.c.toFixed(2)} 0V${G.H}` : `M0 ${r.c.toFixed(2)}H${G.W}`, opacity: a.toFixed(3) }, gLit);
    });
  }
  /** the mark morphing between its wave in place P (k 0) and its straight line on y0 (k 1); its dot, I and O shown by m */
  function drawMark(P, y0, k, m) {
    const a = markPts(P), b = linePts(P, y0), pts = a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k)]);
    wave.setAttribute('d', dOf(pts)); wave.style.strokeWidth = `${(MARK.SW * P.s).toFixed(2)}px`; show(wave, true);
    const sc = clamp(m);
    mDot.setAttribute('cx', P.ox + MARK.X_DOT * P.s); mDot.setAttribute('cy', P.oy + (MARK.A - MARK.DOT_R) * P.s); mDot.setAttribute('r', (MARK.DOT_R * P.s * sc).toFixed(2));
    const ih = MARK.A * P.s * sc, ix = P.ox + MARK.X_I * P.s, iy = P.oy + MARK.A * P.s;
    mI.setAttribute('d', `M${ix} ${iy - ih}V${iy}`); mI.style.strokeWidth = `${(MARK.SW * P.s).toFixed(2)}px`;
    mO.setAttribute('cx', P.ox + MARK.X_O * P.s); mO.setAttribute('cy', P.oy + MARK.A / 2 * P.s); mO.setAttribute('rx', (MARK.OW / 2 * P.s * sc).toFixed(2)); mO.setAttribute('ry', (MARK.A / 2 * P.s * sc).toFixed(2));
    mO.style.strokeWidth = mI.style.strokeWidth;
    [mDot, mI, mO].forEach((e) => show(e, sc > 0.01));
  }
  const hideMark = () => [wave, mDot, mI, mO].forEach((e) => show(e, false));

  /** the arrival at t seconds (from: 'strip' on arrival, 'tb' scrolling back to the top) */
  function paint(t) {
    if (!G) return;
    const R1 = G.R1, R2 = G.R2, u = G.u;
    // 1. the mark straightens into its line
    const k = ease2(span(t, ...B.straighten));
    if (t < B.straighten[1] + 0.001) { drawMark(R1.P, R1.y0, k, 1 - span(t, 0, 0.25)); show(snake, false); }
    else hideMark();
    if (from === 'strip') { stripShare = 1 - ease(span(t, ...B.slide)); layoutStrip(stripShare); }
    // 2. it snakes along the grid to the sentence's baseline, then pours into the pen
    const head = (tt) => (tt < B.run[0] ? R1.head0 : lerp(R1.head0, R1.len, ease(span(tt, ...B.run))));
    const tail = (tt) => (tt < B.write[0] ? head(tt) - R1.Lw : lerp(R1.len - R1.Lw, R1.len, span(tt, B.write[0], B.write[0] + B.pour)));
    if (t >= B.straighten[1] && t < B.write[0] + B.pour) { snake.setAttribute('d', dOf(R1.sub(tail(t), head(t)))); show(snake, true); }
    else if (t < B.toBeacon[0]) show(snake, false);
    drawLit(R1, head, tail, t);
    // 3. the writing (single-stroke lettering), then the real type
    const pen = G.letLen * span(t, ...B.write);
    G.strokes.forEach((s) => { s.el.setAttribute('stroke-dashoffset', clamp(s.l - (pen - s.a), 0, s.l).toFixed(2)); });
    gLet.style.opacity = String(1 - span(t, ...B.settle));
    hello.style.opacity = String(Math.max(TRACE, ease2(span(t, ...B.settle))));
    // 4. the full stop drops (the mark's dot)
    const dk = span(t, ...B.drop);
    stopDot.setAttribute('cx', G.stop.x); stopDot.setAttribute('cy', (lerp(G.yb - 1.5 * u, G.yb - G.stop.r, easeIn(dk))).toFixed(2)); stopDot.setAttribute('r', G.stop.r.toFixed(2));
    show(stopDot, t >= B.drop[0] && t < B.drop[1] + 0.08, 1 - span(t, B.drop[1], B.drop[1] + 0.08));
    stopEl.style.opacity = String(Math.max(TRACE, span(t, B.drop[1], B.drop[1] + 0.08)));
    // 5. on to the beacon, round its ring
    if (t >= B.toBeacon[0]) {
      const L2 = 2 * Math.PI * u, h2 = lerp(0, R2.len, ease(span(t, ...B.toBeacon)));
      snake.setAttribute('d', dOf(R2.sub(Math.max(0, h2 - L2), h2))); show(snake, true);
      const h2f = (tt) => lerp(0, R2.len, ease(span(tt, ...B.toBeacon))), t2f = (tt) => Math.max(0, h2f(tt) - L2);
      // (the second route's lit lines, added to the first's)
      const keep = [...gLit.childNodes]; drawLit(R2, h2f, t2f, t); keep.forEach((n) => gLit.prepend(n));
    }
    // 6. the I becomes the beacon's dot; 7. the second line
    const ik = span(t, ...B.ione);
    iLine.setAttribute('d', `M${G.gx} ${(G.gy - 0.6 * u * (1 - ik)).toFixed(2)}V${(G.gy + 0.6 * u * (1 - ik)).toFixed(2)}`); show(iLine, ik > 0 && ik < 1);
    hint.style.opacity = String(Math.max(TRACE, ease2(span(t, ...B.second))));
    html.dataset.arrive = t >= B.END ? 'done' : t >= B.ione[1] ? 'dot' : 'run';   // (CSS: the beacon's dot from 'dot', its rings from 'done')
  }
  /** going home at t seconds after the tap */
  function paintHome(t) {
    const R3 = G.R3, L0 = 2 * Math.PI * G.u, u = G.u;
    const head = (tt) => lerp(L0, R3.len, ease(span(tt, ...HB.run)));
    const len = (tt) => lerp(L0, R3.Lw, ease(span(tt, ...HB.run)));
    const tail = (tt) => head(tt) - len(tt);
    const f = span(t, ...HB.form);
    if (f <= 0) { snake.setAttribute('d', dOf(R3.sub(tail(t), head(t)))); show(snake, true); hideMark(); }
    else { show(snake, false); drawMark(G.T, G.yT, 1 - ease2(f), f); }
    drawLit(R3, head, tail, t);
    const a = 1 - span(t, ...HB.fade);
    hello.style.opacity = stopEl.style.opacity = hint.style.opacity = String(a);
    show(gLet, false); show(stopDot, false); show(iLine, false);
    html.dataset.arrive = 'home';
    void u;
  }
  function paintEnd() { paint(B.END + LIT.fade + 0.01); html.dataset.arrive = 'done'; }
  function paintHomeEnd() { gLit.replaceChildren(); [snake, wave, mDot, mI, mO, stopDot, iLine].forEach((e) => show(e, false)); if (tbMark) tbMark.style.opacity = ''; }

  // ---------- the clock ----------
  let state = 'idle', t0 = 0, raf = 0, hold = null, speed = window.__wm.returning ? 1.25 : 1;
  const now = () => (performance.now() - t0) / 1000 * speed;
  function loop() {
    raf = 0;
    const t = hold ?? Math.max(0, now());
    if (state === 'run') { paint(t); if (t >= B.END + LIT.fade && hold === null) { state = 'gate'; paintEnd(); return; } }
    else if (state === 'home') { paintHome(t); if (t >= HB.END && hold === null) { state = 'done'; finishHome(); return; } }
    else return;
    raf = requestAnimationFrame(loop);
  }
  const go = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

  function startArrival(src) {
    from = src; measure();
    if (tbMark) tbMark.style.opacity = src === 'tb' ? '0' : tbMark.style.opacity;
    gLet.style.display = ''; state = 'run'; t0 = performance.now() + STILL * 1000 / speed; hold = null; html.dataset.arrive = 'run';
    if (stripMark) stripMark.style.visibility = 'hidden';
    paint(0); go();
  }
  function skip() { if (state !== 'run') return; cancelAnimationFrame(raf); raf = 0; state = 'gate'; if (from === 'strip') { stripShare = 0; layoutStrip(0); } paintEnd(); }

  // ---------- entering: home to the title block while the curtain opens ----------
  let firstDone = false;
  function enter() {
    if (state === 'run') skip();
    if (state !== 'gate') return;
    state = 'home'; off();
    btn.classList.add('is-gone'); btn.blur();
    if (tbMark) tbMark.style.opacity = '0';
    html.dataset.phase = 'line';
    const tl = gsap.timeline();
    tl.add(() => { html.dataset.phase = 'curtain'; engine.emit('enter:curtain'); }, HB.curtain)
      .set(gsap.utils.toArray('.curtain__edge'), { opacity: 1 }, HB.curtain)
      .to(q('.curtain__panel--top'), { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, HB.curtain)
      .to(q('.curtain__panel--bottom'), { yPercent: 100, duration: 0.8, ease: 'expo.inOut' }, HB.curtain)
      .to(gsap.utils.toArray('.reveal-late'), { opacity: 1, duration: HB.tb[1] - HB.tb[0], ease: 'none' }, HB.tb[0]);
    t0 = performance.now(); hold = null; go();
  }
  function finishHome() {
    paintHomeEnd();
    html.dataset.phase = 'ready'; html.dataset.arrive = 'home'; html.classList.remove('is-replay');
    btn.hidden = true;
    try { localStorage.setItem('wm:opened', '1'); } catch (e) {}
    if (!firstDone) { firstDone = true; onDone?.(); } else engine.lockScroll(false);
    watchTop();
  }

  // ---------- input: a tap skips the arrival, then enters; a scroll, a swipe or a key that scrolls enters at once ----------
  const tapKeys = new Set(['Enter', ' ', 'Spacebar']), goKeys = new Set(['ArrowDown', 'PageDown', 'End']);
  const tap = (unlock) => { if (unlock) { haptics.unlock(); haptics.tap(14); } if (reduced) return enterReduced(); if (state === 'run') skip(); else if (state === 'gate') enter(); };
  const now_ = (unlock) => { if (reduced) return enterReduced(); if (state === 'run' || state === 'gate') enter(); };
  btn.addEventListener('click', (e) => tap(e.detail > 0));   // detail 0 = a click made by the keyboard
  const onKey = (e) => { if (tapKeys.has(e.key)) { e.preventDefault(); tap(false); } else if (goKeys.has(e.key)) { e.preventDefault(); now_(false); } };
  const onWheel = (e) => { if (Math.abs(e.deltaY) > 2) now_(false); };
  let ty = null;
  const onTouchStart = (e) => { ty = e.touches[0]?.clientY ?? null; };
  const onTouchMove = (e) => { const y = e.touches[0]?.clientY; if (ty != null && y != null && Math.abs(y - ty) > 12) now_(false); };
  let listening = false;
  function on() { if (listening) return; listening = true; addEventListener('keydown', onKey, true); addEventListener('wheel', onWheel, { passive: true }); addEventListener('touchstart', onTouchStart, { passive: true }); addEventListener('touchmove', onTouchMove, { passive: true }); }
  function off() { if (!listening) return; listening = false; removeEventListener('keydown', onKey, true); removeEventListener('wheel', onWheel); removeEventListener('touchstart', onTouchStart); removeEventListener('touchmove', onTouchMove); }

  // ---------- reduced motion: everything in place at once ----------
  function enterReduced() {
    if (state === 'done') return; state = 'done'; off();
    html.dataset.phase = 'ready'; curtain.style.visibility = 'hidden'; btn.hidden = true; svg.style.display = 'none';
    document.querySelectorAll('.reveal-late').forEach((e) => { e.style.opacity = '1'; });
    if (tbMark) tbMark.style.opacity = '';
    try { document.getElementById('page-01')?.focus?.({ preventScroll: true }); } catch (e) {}
    onDone?.();
  }

  // ---------- scrolling back to the very top: the replay ----------
  let topT = 0, maxY = 0, topOn = false;
  function watchTop() {
    if (reduced || topOn) return; topOn = true; maxY = scrollY;
    addEventListener('scroll', onScrollTop, { passive: true });
  }
  function onScrollTop() {
    if (state !== 'done' || html.dataset.phase !== 'ready' || window.__hyper?.playing()) return;
    maxY = Math.max(maxY, scrollY);
    clearTimeout(topT);
    if (scrollY <= 0.5 && maxY > innerHeight * 0.5) topT = setTimeout(() => { if (scrollY <= 0.5 && state === 'done' && !window.__hyper?.playing()) replay(); }, 320);
  }
  function replay() {
    maxY = 0; engine.lockScroll(true);
    html.classList.add('is-replay'); html.dataset.phase = 'gate';
    btn.hidden = false; btn.classList.remove('is-gone');
    [hello, stopEl, hint].forEach((e) => { e.style.opacity = '0'; });
    gsap.set(gsap.utils.toArray('.curtain__edge'), { opacity: 0 });
    gsap.to(q('.curtain__panel--top'), { yPercent: 0, duration: 0.6, ease: 'expo.inOut' });
    gsap.to(q('.curtain__panel--bottom'), { yPercent: 0, duration: 0.6, ease: 'expo.inOut' });
    on(); startArrival('tb');
  }

  // ---------- start: once the page has loaded and the fonts are in ----------
  if (!reduced) html.dataset.arrive = 'wait';
  layoutStrip(stripShare);
  const ready = () => {
    html.dataset.phase = 'gate';
    btn.classList.add('is-ready');
    try { btn.focus({ preventScroll: true }); } catch (e) {}
    if (reduced) { stripShare = 0; layoutStrip(0); measure(); from = 'strip'; G.R1 = toText('strip'); paintEnd(); hideMark(); state = 'gate'; return; }
    startArrival('strip');
  };
  on();
  if ((window.__wm.shown ?? 0) >= 1) document.fonts.ready.then(ready);
  else document.addEventListener('wm:loaded', () => document.fonts.ready.then(ready), { once: true });
  addEventListener('resize', () => { if (state === 'gate' || state === 'run') { measure(); if (state === 'gate') paintEnd(); } else if (state === 'done') { layoutStrip(0); } });

  // for the tools
  window.__arrival = {
    state: () => state, B, HB,
    hold: (t) => { hold = t; if (t === null) { t0 = performance.now() - (B.END + LIT.fade) * 1000 / speed; } if (state === 'gate' || state === 'run') { if (t !== null) { state = 'run'; paint(t); } else go(); } },
    restart: () => { if (state === 'gate' || state === 'run') { stripShare = from === 'strip' ? 1 : 0; startArrival(from); } },
    skip, enter,
    report: () => {
      if (!G) return null;
      const u = G.u, onGrid = (v) => Math.abs(v / u - Math.round(v / u)) * u;
      const runs = [...(G.R1?.runs || []), ...G.R2.runs, ...G.R3.runs];
      return { state, arrive: html.dataset.arrive, phase: html.dataset.phase, u: +u.toFixed(3), beacon: [G.gx, G.gy].map((v) => +(v / u).toFixed(3)), baseline: +(G.yb / u).toFixed(3),
        offGrid: +Math.max(0, ...runs.map((r) => onGrid(r.c))).toFixed(3), runs: runs.length, turnsRightAngle: [G.R1, G.R2, G.R3].filter(Boolean).every((R) => R.p.length >= 2),
        strip: +stripShare.toFixed(3), tbMark: tbMark ? +(getComputedStyle(tbMark).opacity) : null, hello: +hello.style.opacity, hint: +hint.style.opacity, stop: +stopEl.style.opacity,
        letters: G.strokes.length, lettering: { sx: +(G.strokes.length ? (G.stop.x - G.xt) : 0).toFixed(1) } };
    },
  };
}

// Page 1 (Enter + hook), scroll-driven, 5 screens tall: the stage stays put while 4 screens of scroll play the story.
// Every swipe changes the middle of the screen. Positions p are in screens of scroll (0..4):
//   S0    Bell's 1877 sheet (the real scan), headline and credit                                   0.00 – 0.24
//         the scan dissolves into its own traced outlines (filled, then lines)                     0.26 – 0.42
//         the lines slide and bend onto the X-ray phone's edges; the sheet turns blue              0.42 – 0.90
//         the 3D X-ray fades in exactly on them                                                     0.90 – 1.00
//         the pieces spread far apart and turn                                                     1.00 – 1.32
//   S1    six pieces, named                                                                         1.34 – 1.66
//         kinetic line; the pieces come together (a tick each); the blue fades over the whole
//         sheet while the phone dresses from X-ray to matte                                         1.68 – 2.36
//         matte -> real materials on real paper (a soft cross-fade, whole phone)                    2.36 – 2.58
//   S2    "…to serve you."                                                                          2.60 – 2.88
//   YOU   alone                                                                                     2.98 – 3.18
//   TASK  "YOU gave us the task.", then seven stamps, one beat each                                  3.18 – 3.56
//   END   "Now, what do you need?" / "For you ↓"                                                    3.56 – 4.00
// Words never move under the picture's motion except the kinetic line, and every word change is a short timed
// transition, so a paused frame always settles on whole, readable words.
// Reduced motion: still frames with the full text, no vibration.
import { Phone } from './phone.js';
import { PlateLines } from './lines.js';
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

export const SCROLL = 4;
const R = {
  s0: [0, 0.24], s1: [1.34, 1.66], kin: [1.68, 2.58], kinWords: [1.68, 2.3], s2: [2.6, 2.97],
  flyA: [2.6, 2.97], flyB: [2.98, 3.17], task: [3.18, 4], stamps: 3.3, end: [3.56, 4],
};
const HAND = 1.0;          // the handover: lines -> X-ray, pose held until here
// named stops for tests (a paused frame at each must be clean), including mid-morph and mid-fade
export const STOPS = { S0: 0.12, morph: 0.66, S1: 1.5, fade: 2.08, S2: 2.78, YOU: 3.08, TASK: 3.24, STAMPS: 3.45, END: 3.8 };
const NAMES = ['Back', 'Battery', 'Board', 'Frame', 'Screen', 'Glass'];   // back to front
const BLUE = [23, 63, 115];

const rgb = (s) => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0]; };
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

export function initPage01(engine) {
  const sec = document.getElementById('page-01');
  if (!sec) return null;
  const $ = (s) => sec.querySelector(s);
  const stage = $('.p1__stage');
  const canvas = $('.p1__canvas'), linesCv = $('.p1__lines'), linesGl = $('.p1__linesgl');
  const leaders = $('.p1__leaders'), lctx = leaders.getContext('2d');
  const labelsEl = $('.p1__labels');
  const blue = $('.p1__bg--blue'), real = $('.p1__bg--real');
  const plateFig = $('.p1__plate');
  const credit = $('.p1__credit');
  const T = Object.fromEntries([...sec.querySelectorAll('.p1-txt')].map((t) => [t.dataset.k, t]));
  const kinWords = [];
  // the kinetic line: one span per word, laid out in place from the start (no reflow, whole words only)
  const kinEl = T.kin.querySelector('.p1-kin');
  const words = kinEl.textContent.trim().split(/\s+/);
  kinEl.textContent = '';
  words.forEach((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; kinEl.append(s); kinWords.push(s); if (i < words.length - 1) kinEl.append(' '); });
  const fly = $('.p1-fly');
  const slotA = $('.p1-slot--a'), slotC = $('.p1-slot--c');
  const stamps = [...sec.querySelectorAll('.p1-stamp')];
  const stampsEl = $('.p1-stamps'), endEl = T.end;
  const next = $('.p1-next');

  const phone = new Phone(canvas);
  const lines = new PlateLines(linesCv, linesGl);
  const labels = phone.parts.map((p) => { const d = document.createElement('div'); d.className = 'p1-lbl'; d.innerHTML = `<b>${p.name}</b>`; labelsEl.append(d); return d; });
  let W = 1, H = 1, band = null, plateRect = null, P = -1, portrait = true, dpr = 1, flyT = {}, ink = [18, 18, 18], paper = [242, 240, 235];
  const seated = phone.parts.map(() => true);

  next?.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.querySelector('#page-02');
    if (t) engine.scrollTo(t, { duration: 1.4 });
  });

  // ---------- poses ----------
  function pose(p) {
    const E = portrait ? { yaw: -0.42, pitch: 1.02 } : { yaw: -1.0, pitch: 0.32 };
    const Hd = { yaw: -0.22, pitch: 0.1 }, F = { yaw: 0.32, pitch: 0.12 };
    const K = [[HAND, Hd], [1.32, E], [1.68, E], [2.36, F]];
    const spread = ease(span(p, HAND, 1.32));
    const explodeEach = phone.parts.map((_, i) => (p < 1.68 ? spread : 1 - ease(span(p, 1.7 + i * 0.1, 1.86 + i * 0.1))));   // back seats first
    return { explodeEach, yaw: keys(p, K.map(([q, o]) => [q, o.yaw])), pitch: keys(p, K.map(([q, o]) => [q, o.pitch])), fit: band };
  }

  // ---------- layout: where the picture may sit (never under the text, the strip or the title block) ----------
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const desktop = W >= 1024; portrait = !desktop;
    dpr = Math.min(devicePixelRatio || 1, 2);
    phone.resize(W, H); lines.resize(W, H, dpr);
    leaders.width = Math.round(W * dpr); leaders.height = Math.round(H * dpr);
    const cs = getComputedStyle(document.documentElement);
    ink = rgb(cs.getPropertyValue('--ink').trim().replace(/^#(..)(..)(..)$/, (_, a, b, c) => `${parseInt(a, 16)},${parseInt(b, 16)},${parseInt(c, 16)}`));
    paper = rgb(cs.getPropertyValue('--paper').trim().replace(/^#(..)(..)(..)$/, (_, a, b, c) => `${parseInt(a, 16)},${parseInt(b, 16)},${parseInt(c, 16)}`));
    const strip = document.getElementById('strip')?.offsetHeight || 40;
    const tb = document.querySelector('.titleblock');
    const tbH = tb ? Math.max(0, innerHeight - tb.getBoundingClientRect().top) : 0;
    // the stage is 100lvh, but while the phone's address bar shows, its bottom is off screen: use what's visible
    const hidden = Math.max(0, H - innerHeight);
    const pictureTexts = [T.s0, T.s1, T.kin, T.s2];
    if (desktop) {
      const textRight = Math.max(...Object.values(T).map((t) => t.getBoundingClientRect().right - stage.getBoundingClientRect().left));
      band = { top: strip + 40, bottom: hidden + tbH + 48, left: Math.min(W * 0.5, textRight + 40), right: 48 };
    } else {
      const tallest = Math.max(...pictureTexts.map((t) => t.offsetHeight));
      band = { top: strip + 24 + tallest + 16, bottom: hidden + tbH + 20 + 22, left: 16, right: 16 };   // + the plate credit line
    }
    // the plate: contain-fit in the band
    const bw = W - band.left - band.right, bh = H - band.top - band.bottom, a = 1600 / 1740;
    let pw = bw, ph = pw / a; if (ph > bh) { ph = bh; pw = ph * a; }
    plateRect = { left: band.left + (bw - pw) / 2, top: band.top + (bh - ph) / 2, width: pw, height: ph };
    Object.assign(plateFig.style, { left: `${plateRect.left}px`, top: `${plateRect.top}px`, width: `${pw}px`, height: `${ph}px` });
    credit.style.top = `${plateRect.top + ph + 6}px`; credit.style.left = `${plateRect.left}px`;
    // the handover: pose the phone where the X-ray appears, and give the lines its loops to land on
    phone.set(pose(HAND));
    lines.place(plateRect, phone.loops2D());
    if (lines.ready) lines.still(ink);   // the scan's ink twin, drawn once now rather than on the first frame it shows
    layoutEnd(desktop, strip, hidden + tbH);
    placeFly(desktop, strip, hidden + tbH);
    P = -1;
  }

  // the stamps sit in the picture's band; the closing line under them (phones) or under the headline (desktop)
  function layoutEnd(desktop, strip, bottomInset) {
    const st = stampsEl.style, es = endEl.style;
    if (desktop) {
      const bw = W - band.left - band.right;
      Object.assign(st, { left: `${band.left + Math.max(0, (bw - stampsEl.offsetWidth) / 2)}px`, top: `${Math.max(band.top, band.top + (H - band.top - band.bottom - stampsEl.offsetHeight) / 2)}px`, right: 'auto' });
      const tr = T.task.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      Object.assign(es, { top: `${tr.bottom - sr.top + 40}px` });
    } else {
      const top = T.task.getBoundingClientRect().bottom - stage.getBoundingClientRect().top + 24;
      Object.assign(st, { left: '16px', right: '16px', top: `${top}px` });
      // keep the closing line clear of the title block: if the stamps would reach it, the stamps tighten;
      // with room to spare, the stamps and the closing line sit a little lower, in the free space
      stampsEl.classList.remove('is-tight');
      const room = H - bottomInset - 20 - endEl.offsetHeight - 24 - top;
      stampsEl.classList.toggle('is-tight', stampsEl.offsetHeight > room);
      const y = top + Math.max(0, (room - stampsEl.offsetHeight) * 0.35);
      st.top = `${y}px`;
      es.top = `${Math.min(y + stampsEl.offsetHeight + 24, H - bottomInset - 20 - endEl.offsetHeight)}px`;
    }
  }

  // "you" -> "YOU": one word that travels between three places (its slot in "…to serve you.", alone in the middle,
  // its slot in "YOU gave us the task."). Transforms are measured here; CSS transitions do the move.
  function placeFly(desktop, strip, bottomInset) {
    const prev = fly.style.transform; fly.style.transition = 'none'; fly.style.transform = 'none';
    const sr = stage.getBoundingClientRect(), up = fly.querySelector('.up').getBoundingClientRect(), o = fly.getBoundingClientRect();
    const fx = up.left - o.left, fy = up.top - o.top, fh = up.height, fw = up.width;
    const to = (r) => { const s = r.height / fh; return `translate(${r.left - sr.left - o.left + sr.left - s * fx}px, ${r.top - sr.top - o.top + sr.top - s * fy}px) scale(${s})`; };
    const mid = (strip + H - bottomInset) / 2;
    flyT = {
      a: to(slotA.getBoundingClientRect()),
      b: `translate(${(W - fw) / 2 - (o.left - sr.left) - fx}px, ${mid - fh / 2 - (o.top - sr.top) - fy}px)`,
      c: to(slotC.getBoundingClientRect()),
    };
    fly.style.transform = prev; void fly.offsetWidth; fly.style.transition = '';
    flyState = null;
  }
  let flyState = null;
  function setFly(s) {
    if (s === flyState) return; flyState = s;
    fly.dataset.state = s;
    if (s !== 'off') fly.style.transform = flyT[s];
  }

  // stamps: one beat each once their place is reached (timed, so they land fast whatever the scroll speed)
  let stampTimer = null, stampsIn = 0, stampsOn = false;
  function playStamps(on) {
    if (on === stampsOn) return; stampsOn = on;
    clearTimeout(stampTimer);
    if (!on) { stampsIn = 0; stamps.forEach((s) => s.classList.remove('is-in')); return; }
    const beat = () => {
      if (!stampsOn || stampsIn >= stamps.length) return;
      stamps[stampsIn++].classList.add('is-in'); haptics.tick(12);
      stampTimer = setTimeout(beat, 170);
    };
    beat();
  }

  // ---------- one frame of the story at scroll position p ----------
  function render(p) {
    // Bell's sheet: the scan, then its twin in traced ink, then lines that travel to the phone
    const scanOut = span(p, 0.26, 0.34), fillOut = span(p, 0.34, 0.42), lineIn = span(p, 0.32, 0.4), morph = span(p, 0.42, 0.9), lineOut = span(p, 0.92, 1.0);
    plateFig.style.opacity = String(1 - scanOut);
    plateFig.style.visibility = scanOut >= 1 ? 'hidden' : 'visible';
    credit.style.opacity = String(1 - span(p, 0.22, 0.3));
    const blueA = p < 1.5 ? ease(span(p, 0.4, 0.52)) : 1 - ease(span(p, 1.86, 2.3));
    const built = ease(span(p, 1.86, 2.3)), realA = ease(span(p, 2.36, 2.58));
    const xray = span(p, 0.9, 1.0);
    // line colour: ink on paper, white on blue; it switches sharply where the two read equally (never grey on grey)
    // (drawn in ink, turned white by a GPU filter on the canvas: dark ink only; on dark film the ink is already light)
    const WHITE = [236, 241, 246], bgL = paper.map((c, i) => lerp(c, BLUE[i], blueA));
    const wk = lum(ink) > 0.3 ? 0 : clamp(0.5 + 2 * Math.log2(contrast(WHITE, bgL) / contrast(ink, bgL)));
    const inv = wk.toFixed(2); if (inv !== lastInv) { lastInv = inv; linesCv.style.filter = linesGl.style.filter = wk > 0 ? `invert(${inv})` : ''; }
    if (p >= 0.26 && p < 1.0) lines.draw({ fill: p < 0.34 ? 1 : 1 - fillOut, line: lineIn * (1 - lineOut), t: morph, color: ink, width: W >= 1024 ? 1.2 : 1 });
    else if (lines.drawn) lines.draw({});

    const ps = pose(Math.max(p, HAND));
    phone.parts.forEach((part, i) => { part.e = ps.explodeEach[i]; });
    phone.set(ps);
    phone.looks({ xray, built, real: realA });
    canvas.style.opacity = xray <= 0 ? '0' : String(1 - span(p, 2.88, 2.97));
    // snap ticks (forward only, after the unlock tap; haptics checks reduced motion)
    ps.explodeEach.forEach((e, i) => { const s = e <= 0.001; if (s && !seated[i] && p > 1.5) haptics.tick(14); seated[i] = s; });

    blue.style.opacity = String(blueA);
    real.style.opacity = String(realA);
    // text colour: whichever of ink and paper reads better on the sheet as it is now (decided once per frame)
    const base = realA > 0 ? paper.map((c, i) => lerp(c, [233, 221, 198][i], realA)) : paper;
    const bg = base.map((c, i) => lerp(c, BLUE[i], blueA));
    stage.classList.toggle('is-inv', contrast(paper, bg) > contrast(ink, bg));

    // texts: on at their stops; the kinetic line word by word
    T.s0.classList.toggle('on', inR(p, R.s0));
    T.s1.classList.toggle('on', inR(p, R.s1));
    T.kin.classList.toggle('on', inR(p, R.kin));
    const nOn = p < R.kinWords[0] ? 0 : Math.min(kinWords.length, 1 + Math.floor(span(p, R.kinWords[0], R.kinWords[1]) * kinWords.length));
    kinWords.forEach((w, i) => w.classList.toggle('on', i < nOn));
    T.s2.classList.toggle('on', inR(p, R.s2));
    T.task.classList.toggle('on', inR(p, R.task));
    T.end.classList.toggle('on', inR(p, R.end));
    setFly(inR(p, R.flyA) ? 'a' : inR(p, R.flyB) ? 'b' : p >= R.task[0] ? 'c' : 'off');
    playStamps(p >= R.stamps);

    drawLabels(inR(p, R.s1));
    // the 3D phone only renders while it can be seen
    const seen = xray > 0 && p < 2.97;
    if (seen || phoneShown) phone.render();
    phoneShown = seen;
  }
  let phoneShown = true, lastInv = '';

  // names beside each piece: alternate sides across the line the pieces spread along, with hairline leaders
  function drawLabels(on) {
    const d = leaders.width / W;
    lctx.clearRect(0, 0, leaders.width, leaders.height);
    labels.forEach((l) => l.classList.toggle('on', on));
    if (!on) return;
    const boxes = phone.parts.map((part) => phone.partBox(part));
    const order = boxes.map((b, i) => ({ b, i })).sort((p, q) => (portrait ? p.b.cy - q.b.cy : p.b.cx - q.b.cx));
    lctx.strokeStyle = 'rgba(236,241,246,.85)'; lctx.fillStyle = lctx.strokeStyle; lctx.lineWidth = d;
    order.forEach(({ b, i }, k) => {
      const el = labels[i], w = el.offsetWidth, h = el.offsetHeight, side = k % 2 ? 1 : -1;
      let ax, ay, lx, ly;
      if (portrait) {   // pieces stacked down the screen: labels left and right
        ay = b.cy; ax = side < 0 ? b.left + 6 : b.right - 6;
        lx = side < 0 ? Math.max(band.left, b.left - 22 - w) : Math.min(W - band.right - w, b.right + 22);
        ly = clamp(ay - h / 2, band.top, H - band.bottom - h);
      } else {          // pieces spread across: labels above and below
        ax = b.cx; ay = side < 0 ? b.top + 6 : b.bottom - 6;
        lx = clamp(ax - w / 2, band.left, W - band.right - w);
        ly = side < 0 ? Math.max(band.top, b.top - 22 - h) : Math.min(H - band.bottom - h, b.bottom + 22);
      }
      el.style.transform = `translate(${lx}px, ${ly}px)`;
      const ex = portrait ? (side < 0 ? lx + w : lx) : clamp(ax, lx + 6, lx + w - 6), ey = portrait ? ly + h / 2 : (side < 0 ? ly + h : ly);
      lctx.beginPath(); lctx.moveTo(ex * d, ey * d); lctx.lineTo(ax * d, ay * d); lctx.stroke();
      lctx.beginPath(); lctx.arc(ax * d, ay * d, 2.2 * d, 0, 7); lctx.fill();
    });
  }

  // ---------- reduced motion: still frames, in normal flow, with the full text ----------
  if (engine.reduced) {
    // the stills are taken while the stage is still one screen tall, then the page becomes a column of frames
    layout();
    render(1.5); const shot1 = phone.snapshot();
    render(2.8); const shot2 = phone.snapshot();
    sec.classList.add('is-static'); stage.classList.remove('is-inv');
    [plateFig, credit, stampsEl, endEl].forEach((el) => { el.removeAttribute('style'); });
    stampsEl.classList.remove('is-tight'); fly.style.display = 'none';
    const frame = (src, alt, cls) => { const f = document.createElement('figure'); f.className = `p1-frame ${cls || ''}`; const img = new Image(); img.src = src; img.alt = alt; f.append(img); return f; };
    const list = document.createElement('p'); list.className = 'p1-frame__names mono'; list.textContent = NAMES.slice().reverse().join(' · ');
    const f1 = frame(shot1, "Today's phone as a blue X-ray drawing, its six pieces apart: glass, screen, frame, board, battery, back.", 'p1-frame--blue');
    f1.prepend(T.s1); f1.append(list);
    const f2 = frame(shot2, "Today's phone, assembled in real materials on paper; its screen asks what you need.");
    kinWords.forEach((w) => w.classList.add('on'));
    stamps.forEach((s) => s.classList.add('is-in'));
    stage.append(T.s0, plateFig, credit, f1, T.kin, f2, T.s2, T.task, stampsEl, T.end);   // reading order
    Object.values(T).forEach((t) => t.classList.add('on'));
    [canvas, linesCv, linesGl, leaders, labelsEl].forEach((el) => { el.hidden = true; });
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
  lines.load('media/plates/bell-us186787-lines.bin').then(() => { layout(); render(st.progress * SCROLL); }).catch((e) => console.warn('[page 01] lines', e));
  addEventListener('resize', () => { layout(); render(st.progress * SCROLL); });
  engine.on('theme', () => { layout(); render(st.progress * SCROLL); });
  document.fonts?.ready.then(() => { phone.refreshScreen(); layout(); render(st.progress * SCROLL); });

  // for tests
  window.__p1 = { phone, lines, stops: STOPS, scroll: SCROLL, yAt: (p) => st.start + (st.end - st.start) * p / SCROLL,
    box: () => phone.screenBox(), band: () => band, plate: () => plateRect, P: () => P, top: () => sec.offsetTop, stampsIn: () => stampsIn };
  return { length: () => sec.offsetHeight / innerHeight };
}

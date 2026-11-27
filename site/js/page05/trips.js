// Page 5, the lighter trips (stage 11): three short rooms in one pinned scene, each scrubbed by scroll (a lagged position,
// as pages 1 and 3), each on one of our made-up products and never repeating a hallway canvas's point:
//   AI: the property app's enquiries: the AI drafts the reply word by word; nothing goes out until a person approves it.
//   Websites: the booking app's website builds itself from the drafting grid (wireframe boxes on blue hairlines) into the
//     finished page (its type, its picture: the app's real screen, its button), drawn -> real like page 1's phone.
//   Apps: the delivery tracker running live on the two real phones (iPhone 18, S26; local-only models, as the hallway's):
//     the driver moves along the route as you scroll. Without the models: the same screens, flat, in hairline outlines.
// Reduced motion: the three rooms one under the other, at their finished states.
import { grid } from '../engine/grid.js';
import { drawTracker } from '../apps/tracker.js';
import { drawBooking, SCREEN } from '../apps/booking.js';
import { LIGHT } from '../engine/tokens.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const ROOM = 2.4, LEN5 = 3 * ROOM;

export function initTrips(engine) {
  const sec = document.getElementById('page-05'); if (!sec) return null;
  const reduced = engine.reduced;
  const stage = sec.querySelector('.t5__stage'), rooms = [...sec.querySelectorAll('.t5r')];
  // AI: the reply's words, revealed one by one
  const ans = sec.querySelector('.t5ai__a'), words = ans.textContent.trim().split(/\s+/);
  ans.textContent = ''; const wEls = words.map((w, i) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; ans.append(s); if (i < words.length - 1) ans.append(document.createTextNode(' ')); return s; });
  const ai = sec.querySelector('.t5ai');
  // websites: the blocks, made real one after another; the picture is the booking app's real screen
  const web = sec.querySelector('.t5web'), blocks = [...web.querySelectorAll('.t5b')], appCv = web.querySelector('.t5web__app');
  appCv.width = 360; appCv.height = 780; drawBooking(appCv, LIGHT);
  // apps: the tracker's screen (one canvas, on both phones), the phones
  const scr = document.createElement('canvas'); scr.width = 440; scr.height = Math.round(440 * SCREEN.h / SCREEN.w); drawTracker(scr, 0, LIGHT);   // redrawn only when the driver moves a step (below)
  const glCv = sec.querySelector('.t5app__gl'), flatCv = sec.querySelector('.t5app__flat');
  let pair = null, tex = null, pairState = 'idle', lastD = -1;
  async function loadPair() {
    if (pairState !== 'idle') return; pairState = 'loading';
    try {
      const R = await import('../phones/realphones.js'), THREE = await import('three');
      pair = new R.PhonePair(glCv, { base: '' });
      const missing = await pair.ready;
      if (missing.length) { pairState = 'missing'; sec.classList.add('no-phones'); return; }
      tex = new THREE.CanvasTexture(scr); tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = false; tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;   // seen about 1:1: no mipmaps to rebuild on every step
      pair.items.forEach((p) => { if (!p.missing) R.setScreen(p, tex); });
      pairState = 'ready'; layout(); paint();
    } catch (e) { console.warn('[trips] phones', e); pairState = 'missing'; sec.classList.add('no-phones'); }
  }
  // the flat fallback: the two screens in hairline phone outlines
  function drawFlat() {
    const r = flatCv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    flatCv.width = Math.round(r.width * dpr); flatCv.height = Math.round(r.height * dpr);
    const x = flatCv.getContext('2d'), w = flatCv.width, h = flatCv.height, ph = Math.min(h * 0.92, (w * 0.46) * 2.07), pw = ph / 2.07, gap = (w - 2 * pw) / 3;
    x.clearRect(0, 0, w, h);
    [gap, 2 * gap + pw].forEach((px, i) => {
      const py = (h - ph) / 2; x.strokeStyle = '#121212'; x.lineWidth = Math.max(1, Math.round(dpr));
      x.beginPath(); x.roundRect(px, py, pw, ph, pw * (i ? 0.1 : 0.17)); x.stroke();
      const m = pw * 0.04; x.drawImage(scr, px + m, py + m * 1.2, pw - 2 * m, ph - 2.4 * m);
    });
  }

  const N = () => Math.round(innerWidth / grid.u);
  function layout() {
    const u = grid.u, desktop = innerWidth >= 1024, n = N(), H = stage.clientHeight || innerHeight;
    const strip = document.getElementById('strip')?.offsetHeight || 2 * u, tb = document.querySelector('.titleblock')?.getBoundingClientRect();
    const tbTop = tb && tb.height ? Math.min(innerHeight, tb.top) : H, rT = Math.ceil((strip + u) / u - 1e-6);
    // the figure: from under the room's line to a cell above the title block (measured: the line may take two or three
    // rows). Part 5 "The name's size: option B": each room's figure from its own line (they were all sized from one
    // room's line, so a room with a shorter line lost the difference), and compact (the taller title block leaves short
    // screens too little room for the website's page): the lines a cell nearer the strip and the figures a cell nearer
    // their lines, only when the website's blocks would not fit in its page; still not (384 x 734): compact 2, the
    // website's headline a step smaller (1.25 cells on a 1.5-cell line)
    const place = (compact, c2 = false) => {
      stage.classList.toggle('is-compact', compact); stage.classList.toggle('is-compact2', c2);
      const top = (rT + (compact ? 0 : 1)) * u;
      stage.style.setProperty('--t5-top', `${top}px`);
      rooms.forEach((r) => {
        const lineBottom = top + (r.querySelector('.t5l')?.offsetHeight || 4 * u);
        r.style.setProperty('--t5-fig-h', `${Math.max(10 * u, Math.floor((tbTop - u) / u) * u - Math.ceil(lineBottom / u) * u - (compact ? 1 : 2) * u)}px`);
      });
    };
    place(false);
    const web = stage.querySelector('.t5web__page');
    const over = () => web && web.scrollHeight > web.clientHeight + 1;
    if (over()) { place(true); if (over()) place(true, true); }
    if (pair && pairState === 'ready') { const r = glCv.getBoundingClientRect(); pair.resize(r.width, r.height); pair.frame({ top: u, bottom: u, left: u, right: u }); }
    if (pairState !== 'ready') drawFlat();
  }

  let target = 0, S = 0, raf = 0, last = 0, live = false;
  function paint() {
    if (!reduced && !inView) { S = target; return; }
    const r = Math.min(2, Math.floor(S / ROOM)), local = S - r * ROOM;
    rooms.forEach((el, i) => {
      const l = S - i * ROOM, op = reduced ? 1 : span(l, 0, 0.2) * (1 - span(l, ROOM - 0.2, ROOM));
      el.style.setProperty('--op', op.toFixed(3)); el.classList.toggle('on', op > 0.01);
    });
    // AI
    { const l = reduced ? ROOM : S; const n = Math.round(span(l, 0.45, 1.25) * wEls.length);
      wEls.forEach((w, i) => w.classList.toggle('on', i < n));
      ai.classList.toggle('is-approved', l >= 1.45); ai.classList.toggle('is-pressed', l >= 1.65 && l < 1.8); ai.classList.toggle('is-sent', l >= 1.8); }
    // websites
    { const l = reduced ? ROOM : S - ROOM;
      web.style.setProperty('--grid', (1 - span(l, 1.6, 2.0)).toFixed(3)); web.style.setProperty('--wire', span(l, 0.25, 0.65).toFixed(3));
      blocks.forEach((b, i) => { b.classList.toggle('is-real', l >= 0.9 + i * 0.2); }); }   // each block swaps at once (never its wireframe name over its real self)
    // apps
    { const l = reduced ? ROOM : S - 2 * ROOM, d = reduced ? 0.6 : span(l, 0.35, 2.0);
      const dq = Math.round(d * 48) / 48;   // 48 steps along the route: a redraw and upload only when the dot moves a step
      if (dq !== lastD) { lastD = dq; drawTracker(scr, dq, LIGHT); if (tex) tex.needsUpdate = true; else if (pairState !== 'ready') drawFlat(); }
      if (pair && pairState === 'ready' && inView && (reduced || (S > 2 * ROOM - 0.3))) { pair.set({ yaw: reduced ? 0 : -0.45 + 0.8 * ease2(span(l, 0.2, 2.1)), pitch: -0.04 }); pair.render(); } }
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const d = target - S; S = Math.abs(d) > 2 || Math.abs(d) < 2e-4 ? target : S + d * (1 - Math.exp(-dt / 0.1));
    paint();
    if (S !== target) raf = requestAnimationFrame(frame);
  }
  let inView = true, quietT = 0;
  function onScroll() {
    const r = sec.getBoundingClientRect();
    target = clamp(-r.top / innerHeight, 0, LEN5);
    // the phones load in the first quiet pause (300 ms without scrolling) from page 3 on, so their parsing never lands
    // in a moving frame; once page 5 is a screen away they load at once whatever happens
    clearTimeout(quietT);
    if (r.top < innerHeight * 1.2 && r.bottom > -innerHeight) loadPair();
    else if (r.top < innerHeight * 14 && r.bottom > -innerHeight) quietT = setTimeout(loadPair, 300);
    inView = r.top < innerHeight && r.bottom > 0;
    if (!inView && Math.abs(target - S) < 1e-4) return;   // off screen and settled: nothing to draw
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  if (reduced) { sec.classList.add('is-static'); requestAnimationFrame(() => { layout(); paint(); }); loadPair(); addEventListener('resize', () => { layout(); paint(); }); }
  else { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
  const again = () => { layout(); paint(); };
  addEventListener('resize', again); grid.onChange(() => requestAnimationFrame(again)); engine.on('theme', again); document.fonts?.ready.then(again);
  layout();
  const top = () => { let y = 0; for (let n = sec; n; n = n.offsetParent) y += n.offsetTop; return y; };
  window.__p5 = { yAt: (s) => top() + s * innerHeight, S: () => S, len: LEN5, phones: () => pairState };
  return { length: () => sec.offsetHeight / innerHeight };
}

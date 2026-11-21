// The opening: singularity point -> SCALE 1:1 ruler line -> vertical curtain onto the board -> hold line -> scroll unlocks.
// First visit ≈ 2.5 s from first paint to scroll (longer only if the page is genuinely still loading).
// Any click, key, wheel or touch fast-forwards it. Return visits play it at 3.2x (≈0.6 s). Reduced motion: finished state.

const MM = 96 / 25.4; // CSS px per millimetre

export function buildRuler(svg) {
  const w = innerWidth, cx = w / 2, step = 2 * MM; // a tick every 2 mm
  const ns = 'http://www.w3.org/2000/svg';
  svg.setAttribute('viewBox', `0 0 ${w} 36`);
  svg.innerHTML = '';
  for (let k = 0; cx + k * step <= w + step; k++) {
    for (const dir of k === 0 ? [1] : [1, -1]) {
      const x = cx + dir * k * step, mm = k * 2;
      const len = mm % 10 === 0 ? 11 : mm % 5 === 0 ? 7 : 4;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', x); l.setAttribute('x2', x); l.setAttribute('y1', 0); l.setAttribute('y2', len);
      svg.appendChild(l);
      if (mm % 20 === 0 && mm > 0) {
        const t = document.createElementNS(ns, 'text');
        t.setAttribute('x', x); t.setAttribute('y', 24); t.setAttribute('text-anchor', 'middle');
        t.textContent = mm;
        svg.appendChild(t);
      }
    }
  }
}

/** Dimension line above the hold line: measures its real width and prints it in millimetres. */
export function measureHold(root = document) {
  const line = root.querySelector('.hold__line');
  const dim = root.querySelector('.dim--hold');
  if (!line || !dim) return 0;
  const rows = [...line.querySelectorAll('.hold__row')];
  const w = Math.max(...rows.map((r) => {
    const ws = r.querySelectorAll('.w');
    const a = ws[0].getBoundingClientRect(), b = ws[ws.length - 1].getBoundingClientRect();
    return b.right - a.left;
  }));
  dim.style.setProperty('--dim-w', `${w}px`);
  const svg = dim.querySelector('svg');
  svg.setAttribute('viewBox', `0 0 ${w} 20`);
  const set = (sel, attrs) => { const el = svg.querySelector(sel); for (const k in attrs) el.setAttribute(k, attrs[k]); };
  set('.dim__ext--a', { x1: .5, x2: .5, y1: 0, y2: 20 });
  set('.dim__ext--b', { x1: w - .5, x2: w - .5, y1: 0, y2: 20 });
  set('.dim__line', { x1: 0, x2: w, y1: 10, y2: 10 });
  set('.dim__arrow--a', { d: `M0.5 10 L9 7 L9 13 Z` });
  set('.dim__arrow--b', { d: `M${w - .5} 10 L${w - 9} 7 L${w - 9} 13 Z` });
  return w / MM;
}

function fmt(mm) { return `${mm.toFixed(1)} mm`; }

/** Tween that opens an element from its centre outwards via clip-path, driven by one number. */
function openFromCentre(gsap, el, vars) {
  const o = { v: 50 };
  const paint = () => { el.style.clipPath = `inset(0 ${o.v}% 0 ${o.v}%)`; };
  paint();
  return gsap.to(o, { v: 0, ...vars, onUpdate: paint });
}

export function runOpening(engine, onDone) {
  const { gsap } = engine;
  const html = document.documentElement;
  const curtain = document.getElementById('curtain');
  const q = (s) => curtain.querySelector(s);
  const words = gsap.utils.toArray('.hold__line .w');
  const late = gsap.utils.toArray('.reveal-late');
  const dimValue = document.querySelector('.dim__value');
  const dimSvg = document.querySelector('.dim__svg');
  const centre = gsap.utils.toArray('.centre-lines__h, .centre-lines__v');
  let mm = 0;

  let unlocked = false;
  const unlock = () => {           // scroll unlocks while the last details are still settling
    if (unlocked) return;
    unlocked = true;
    html.dataset.phase = 'ready';
    try { localStorage.setItem('wm:opened', '1'); } catch (e) {}
    removeSkip();
    onDone?.();
  };
  const finish = () => { unlock(); curtain.style.visibility = 'hidden'; };

  if (engine.reduced) {
    const settle = () => { mm = measureHold(); dimValue.textContent = fmt(mm); };
    settle();
    document.fonts.ready.then(settle);
    document.fonts.addEventListener?.('loadingdone', settle);
    addEventListener('resize', settle);
    html.dataset.phase = 'ready';
    curtain.style.visibility = 'hidden';
    onDone?.();
    return;
  }

  // ---- skip: any click / key / wheel / touch fast-forwards ----
  let tl = null, skipped = false;
  const skip = () => { skipped = true; if (tl) tl.timeScale(12); };
  const evts = ['wheel', 'keydown', 'pointerdown', 'touchstart'];
  const removeSkip = () => evts.forEach((e) => removeEventListener(e, skip, { capture: true }));
  evts.forEach((e) => addEventListener(e, skip, { capture: true, passive: true }));

  buildRuler(q('.sing__ruler'));
  gsap.set(centre, { scale: 0 });
  dimSvg.style.clipPath = 'inset(0 50% 0 50%)';

  const start = () => {
    mm = measureHold();
    const counter = { v: 0 };
    html.dataset.phase = 'line';
    tl = gsap.timeline({ onComplete: finish, defaults: { ease: 'power3.inOut' } });
    // 1) the point stretches into the ruler line, ticks count outwards
    tl.to(q('.sing__point'), { opacity: 0, scale: 0.4, duration: 0.25, ease: 'power2.in', onStart: () => { q('.sing__point').style.animation = 'none'; } }, 0)
      .to(q('.sing__line'), { scaleX: 1, duration: 0.6, ease: 'expo.inOut' }, 0.05)
      .add(openFromCentre(gsap, q('.sing__ruler'), { duration: 0.6, ease: 'expo.inOut' }), 0.1)
      .to(q('.sing__scale'), { opacity: 1, duration: 0.25, ease: 'none' }, 0.3)
    // 2) the line opens vertically: a curtain onto the board; whatever it covers is inverted
      .add(() => { html.dataset.phase = 'curtain'; }, 0.68)
      .set(gsap.utils.toArray('.curtain__edge'), { opacity: 1 }, 0.68)
      .to([q('.sing__line'), q('.sing__ruler'), q('.sing__scale')], { opacity: 0, duration: 0.2, ease: 'none' }, 0.7)
      .to(q('.curtain__panel--top'), { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.68)
      .to(q('.curtain__panel--bottom'), { yPercent: 100, duration: 0.9, ease: 'expo.inOut' }, 0.68)
    // 3) the one line that holds you (the lower curtain edge sweeps across it)
      .to(words, { y: 0, opacity: 1, duration: 0.75, stagger: 0.05, ease: 'expo.out' }, 0.8)
      .to(centre, { scale: 1, duration: 0.9, ease: 'expo.out' }, 1.0)
    // 4) the dimension line measures it
      .add(openFromCentre(gsap, dimSvg, { duration: 0.6, ease: 'expo.out' }), 1.45)
      .to(counter, { v: mm, duration: 0.6, ease: 'expo.out', onUpdate: () => { dimValue.textContent = fmt(counter.v); } }, 1.45)
    // 5) the rest of the sheet, then scroll unlocks
      .fromTo(late, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' }, 1.55)
      .add(() => { html.dataset.phase = 'hold'; }, 1.45)
      .add(unlock, 1.6);
    tl.timeScale(skipped ? 12 : window.__wm.returning ? 3.2 : 1);
  };

  const ready = () => document.fonts.ready.then(start);
  document.fonts.addEventListener?.('loadingdone', () => { if (html.dataset.phase === 'ready') { mm = measureHold(); dimValue.textContent = fmt(mm); } });
  if ((window.__wm.shown ?? 0) >= 1) ready();
  else document.addEventListener('wm:loaded', ready, { once: true });

  addEventListener('resize', () => {
    mm = measureHold();
    if (html.dataset.phase === 'ready') dimValue.textContent = fmt(mm);
  });
}

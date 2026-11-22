// Take 2 enter: a black screen, the beacon (a breathing dot sending out slow fading rings), "Glad you're finally
// here." above it and "Tap to start" under it, and the top strip drawing itself from the real page load (Take 1's).
// Tap or click, press Enter or Space, or simply scroll or swipe: all of them enter, so nobody gets stuck. Only a tap
// or click unlocks vibration (browsers allow it only after a real tap).
// Then the dot stretches into the SCALE 1:1 line, and the line opens like a curtain onto page 1.
// Reduced motion: the same beacon, still; any of the above enters at once, with no vibration.
import { buildRuler } from './opening.js';
import { haptics } from './engine/haptics.js';

export function runEnter(engine, onDone) {
  const { gsap } = engine;
  const html = document.documentElement;
  const curtain = document.getElementById('curtain');
  const btn = document.getElementById('enter');
  const q = (s) => curtain.querySelector(s);

  if (engine.reduced) {
    // the same beacon, still; a tap, click, key or scroll enters at once (no animation, no vibration)
    let gone = false;
    const show = () => { html.dataset.phase = 'gate'; btn.classList.add('is-ready'); try { btn.focus({ preventScroll: true }); } catch (e) {} };
    const go = () => {
      if (gone) return; gone = true; offR();
      html.dataset.phase = 'ready'; curtain.style.visibility = 'hidden'; btn.hidden = true;
      document.querySelectorAll('.reveal-late').forEach((el) => { el.style.opacity = '1'; });
      try { document.getElementById('page-01')?.focus?.({ preventScroll: true }); } catch (e) {}
      onDone?.();
    };
    const k = (e) => { if (['Enter', ' ', 'Spacebar', 'ArrowDown', 'PageDown', 'End'].includes(e.key)) { e.preventDefault(); go(); } };
    const w = (e) => { if (Math.abs(e.deltaY) > 2) go(); };
    const tm = () => go();
    btn.addEventListener('click', go);
    addEventListener('keydown', k, true); addEventListener('wheel', w, { passive: true }); addEventListener('touchmove', tm, { passive: true });
    const offR = () => { removeEventListener('keydown', k, true); removeEventListener('wheel', w); removeEventListener('touchmove', tm); };
    if ((window.__wm.shown ?? 0) >= 1) document.fonts.ready.then(show);
    else document.addEventListener('wm:loaded', () => document.fonts.ready.then(show), { once: true });
    return;
  }

  let loaded = (window.__wm.shown ?? 0) >= 1, wanted = false, started = false;
  const keys = new Set(['Enter', ' ', 'Spacebar', 'ArrowDown', 'PageDown', 'End']);
  const want = (unlockHaptics) => {
    if (unlockHaptics) { haptics.unlock(); haptics.tap(14); }
    wanted = true; if (loaded) start();
  };
  // the point (the whole black screen is its button): a real tap or click unlocks vibration
  btn.addEventListener('click', (e) => want(e.detail > 0));   // detail 0 = a click made by the keyboard: enters, no vibration
  const onKey = (e) => { if (keys.has(e.key)) { e.preventDefault(); want(false); } };
  const onWheel = (e) => { if (Math.abs(e.deltaY) > 2) want(false); };
  let ty = null;
  const onTouchStart = (e) => { ty = e.touches[0]?.clientY ?? null; };
  const onTouchMove = (e) => { const y = e.touches[0]?.clientY; if (ty != null && y != null && Math.abs(y - ty) > 12) want(false); };
  addEventListener('keydown', onKey, true);
  addEventListener('wheel', onWheel, { passive: true });
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchmove', onTouchMove, { passive: true });
  const off = () => {
    removeEventListener('keydown', onKey, true); removeEventListener('wheel', onWheel);
    removeEventListener('touchstart', onTouchStart); removeEventListener('touchmove', onTouchMove);
  };

  const whenLoaded = () => {
    loaded = true;
    html.dataset.phase = 'gate';
    btn.classList.add('is-ready');
    try { btn.focus({ preventScroll: true }); } catch (e) {}
    if (wanted) start();
  };
  if (loaded) document.fonts.ready.then(whenLoaded);
  else document.addEventListener('wm:loaded', () => document.fonts.ready.then(whenLoaded), { once: true });

  buildRuler(q('.sing__ruler'));
  addEventListener('resize', () => { if (!started) buildRuler(q('.sing__ruler')); });

  function start() {
    if (started) return; started = true; off();
    btn.classList.add('is-gone'); btn.blur();
    html.dataset.phase = 'line';
    const fast = window.__wm.returning ? 1.6 : 1;
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: finish });
    // the point stretches into the ruler line, its ticks counting outwards
    tl.to(q('.sing__point'), { opacity: 0, scale: 0.4, duration: 0.2, ease: 'power2.in', onStart: () => { q('.sing__point').style.animation = 'none'; } }, 0)
      .to(q('.sing__line'), { scaleX: 1, duration: 0.5, ease: 'expo.inOut' }, 0.04)
      .add(openFromCentre(gsap, q('.sing__ruler'), 0.5), 0.08)
      .to(q('.sing__scale'), { opacity: 1, duration: 0.2, ease: 'none' }, 0.24)
    // the line opens vertically, a curtain onto Bell's plate
      .add(() => { html.dataset.phase = 'curtain'; engine.emit('enter:curtain'); }, 0.56)
      .set(gsap.utils.toArray('.curtain__edge'), { opacity: 1 }, 0.56)
      .to([q('.sing__line'), q('.sing__ruler'), q('.sing__scale')], { opacity: 0, duration: 0.18, ease: 'none' }, 0.58)
      .to(q('.curtain__panel--top'), { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, 0.56)
      .to(q('.curtain__panel--bottom'), { yPercent: 100, duration: 0.8, ease: 'expo.inOut' }, 0.56)
      .add(finish, 1.0);
    tl.timeScale(fast);
  }
  let done = false;
  function finish() {
    if (done) return; done = true;
    html.dataset.phase = 'ready';
    try { localStorage.setItem('wm:opened', '1'); } catch (e) {}
    btn.hidden = true;
    gsap.to(gsap.utils.toArray('.reveal-late'), { opacity: 1, duration: 0.4, ease: 'none' });   // the title block
    onDone?.();
  }
}

function openFromCentre(gsap, el, duration) {
  const o = { v: 50 };
  const paint = () => { el.style.clipPath = `inset(0 ${o.v}% 0 ${o.v}%)`; };
  paint();
  return gsap.to(o, { v: 0, duration, ease: 'expo.inOut', onUpdate: paint });
}

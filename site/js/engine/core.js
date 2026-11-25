// Engine core: heavy smooth scroll (Lenis on the GSAP ticker), scroll lock, a tiny event bus.
// Carried over from my own santalarch-clone engine (clone/site/js/core/app.js) and trimmed; see ENGINE_REUSE.md.
// gsap, ScrollTrigger and Lenis are loaded as classic scripts (vendor/), so they are globals here.

const { gsap, ScrollTrigger, Lenis } = window;
// SplitText (word reveals), MorphSVG (Bell's lines into the phone) and DrawSVG (hairline draws): GSAP 3.15 plugins
gsap.registerPlugin(ScrollTrigger, ...[window.SplitText, window.MorphSVGPlugin, window.DrawSVGPlugin].filter(Boolean));

const listeners = new Map();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const engine = {
  gsap, ScrollTrigger,
  lenis: null,
  reduced,
  isDesktop: () => innerWidth >= 1024,
  on(evt, fn) {
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
    return () => listeners.get(evt)?.delete(fn);
  },
  emit(evt, data) {
    for (const fn of [...(listeners.get(evt) || [])]) {
      try { fn(data); } catch (e) { console.error(`[engine] ${evt}`, e); }
    }
  },
  /** Hold or release the page (overflow + Lenis stop/start). */
  lockScroll(lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
    if (lock) engine.lenis?.stop(); else engine.lenis?.start();
  },
  /** Programmatic scroll with the house ease. */
  scrollTo(target, opts = {}) {
    if (engine.lenis) engine.lenis.scrollTo(target, { duration: 1.2, easing: easeInOut, ...opts });
    else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (typeof el === 'number') scrollTo({ top: el });
      else el?.scrollIntoView({ behavior: 'auto' });
    }
  },
};

// cubic-bezier(.65, 0, .35, 1) approximated for Lenis (it wants t -> t)
function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

/** Heavy smooth scroll: a long expo-out glide per wheel step, slowed wheel. Off with reduced motion. */
export function initScroll() {
  if (reduced) { engine.emit('scroll:ready', null); return null; }
  const lenis = new Lenis({ duration: 1.1, wheelMultiplier: 0.9, touchMultiplier: 1, autoRaf: false });   // Take 2: lighter on desktop; touch screens keep their own scrolling
  engine.lenis = lenis;
  // round 7 (the flicker at devicePixelRatio 1.333): the glide sets the page's scroll in whole device pixels. A fractional
  // scroll offset is composited between pixels, so every hairline flips between one sharp row and two soft ones as the
  // page moves; whole device pixels keep each line the same from frame to frame.
  const setScroll = lenis.setScroll.bind(lenis);
  lenis.setScroll = (v) => { const r = window.devicePixelRatio || 1; setScroll(Math.round(v * r) / r); };
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  requestAnimationFrame(() => ScrollTrigger.refresh());
  engine.emit('scroll:ready', lenis);
  return lenis;
}

window.__engine = engine;

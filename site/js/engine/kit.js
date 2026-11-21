// Shared helpers for every sheet: maths, the chapter overlap contract, hairline draw-on, theme colours.
//
// CHAPTER CONTRACT (every sheet section after act 1):
//   <section class="chapter" id="sheet-NN" data-sheet="NN" data-title=".." data-drawn=".." data-checked=".." data-approved=".."
//            style="--units: 6">  <!-- scroll length of the scene in viewport heights, the 1-unit entry included -->
//     <div class="chapter__stage"> ... </div>
//   </section>
// CSS (site.css): .chapter { height: calc((var(--units) + 1) * 100lvh); margin-top: -100lvh; } .chapter__stage { sticky, 100lvh }.
// The section overlaps the previous sheet by one viewport. During that overlap its stage is held fixed at the top, so
// the first unit of its scene (p 0 -> 1) is the CHAPTER CHANGE drawn in place over the previous sheet, which stays pinned
// underneath. By p = 1 the new stage must be opaque. render(p) receives p in true viewport heights of scroll:
// p runs 0 .. units + 1 (the entry is 0 -> 1, the scene itself 1 -> units + 1).
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const span = (p, a, b) => clamp((p - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t) => t * t * t;

let zNext = 2;

/**
 * Wire a chapter section to the scroll. Returns { units, progress() }.
 * opts.render(p): called on every scroll update (p in viewport heights). opts.reduced(): called once in reduced motion.
 */
export function chapter(engine, section, { render, reduced, layout } = {}) {
  const { ScrollTrigger } = engine;
  const stage = section.querySelector('.chapter__stage');
  section.style.zIndex = String(zNext++);
  const units = () => parseFloat(getComputedStyle(section).getPropertyValue('--units')) || 4;
  if (engine.reduced) {
    section.classList.add('is-static');
    reduced?.();
    layout?.();
    addEventListener('resize', () => layout?.());
    return { units, progress: () => units() + 1 };
  }
  let P = -1;
  const st = ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom bottom', scrub: true,
    onUpdate: (s) => { const p = s.progress * (units() + 1); if (Math.abs(p - P) > 1e-4) { P = p; render?.(p); } },
    onRefresh: (s) => { layout?.(); P = -1; render?.(s.progress * (units() + 1)); },
  });
  // hold the stage fixed at the top while the section is still sliding in over the previous sheet
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'top top',
    onToggle: (s) => stage.classList.toggle('is-entering', s.isActive),
  });
  // before the overlap the stage is out of view: keep it from painting
  ScrollTrigger.create({
    trigger: section, start: 'top bottom', end: 'bottom top',
    onToggle: (s) => stage.classList.toggle('is-away', !s.isActive),
  });
  stage.classList.add('is-away');
  return { units, progress: () => (P < 0 ? 0 : P), trigger: st };
}

/** prepare <path>/<line>/... for draw-on: returns a setter draw(t) with t 0..1 (or [from, to] window) */
export function drawable(el) {
  const len = el.getTotalLength ? el.getTotalLength() : 0;
  el.style.strokeDasharray = `${len} ${len}`;
  el.style.strokeDashoffset = String(len);
  return (t) => { el.style.strokeDashoffset = String(len * (1 - clamp(t))); };
}

/** read a colour token from CSS (canvases call this on every redraw so a theme swap just works) */
export function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** px per rem right now (1rem = width / 90 on desktop, width / 24.375 on mobile) */
export const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

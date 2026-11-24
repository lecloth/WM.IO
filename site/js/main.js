// Take 2 entry point: the 9-page running order (STUDIO_BRIEF.md Part 5). Pages 1-3 are built; pages 4-9 are stubs.
// Take 1's sheets (site/js/sheets/*, sheet01..08/*, opening.js's loop, products, settings) stay on disk for reuse.
import { engine, initScroll } from './engine/core.js';
import { initCursor } from './engine/cursor.js';
import { initTheme } from './engine/theme.js';
import { runEnter } from './enter.js';
import { initPage01 } from './page01/page.js';
import { initPages23 } from './page02/page.js';

window.__wm.done('app');
Promise.all(['420 1em Newsreader', '400 1em Newsreader', '400 1em "DM Mono"', '500 1em "DM Mono"'].map((f) => document.fonts.load(f)))
  .catch(() => {}).then(() => window.__wm.done('fonts'));

const { ScrollTrigger } = engine;
if (!engine.reduced) scrollTo(0, 0);
initScroll();
engine.lockScroll(!engine.reduced);
initTheme(engine);

let p1 = null, p23 = null;
try { p1 = initPage01(engine); } catch (e) { console.error('[page 01]', e); }
try { p23 = initPages23(engine); } catch (e) { console.error('[pages 02-03]', e); }

// ---------- timeline strip + title block: one segment per page ----------
const segs = [...document.querySelectorAll('.strip__seg')];
const pages = [...document.querySelectorAll('#sheets > [data-sheet]')];
const tb = { sheet: document.querySelector('.tb__sheet'), title: document.querySelector('.tb__title'),
  drawn: document.querySelector('.tb__drawn'), checked: document.querySelector('.tb__checked'), approved: document.querySelector('.tb__approved') };
let active = -1;
function setActive(i) {
  if (i === active || !pages[i]) return; active = i;
  const el = pages[i];
  tb.sheet.textContent = el.dataset.sheet; tb.title.textContent = el.dataset.title;
  tb.drawn.textContent = el.dataset.drawn; tb.checked.textContent = el.dataset.checked; tb.approved.textContent = el.dataset.approved;
  segs.forEach((s, k) => s.classList.toggle('is-active', k === i));
}
setActive(0);
// round 6: the strip's nine segments on whole columns of the grid (the head script's unit)
function stripCols() { const n = window.__grid?.n || 20; segs.forEach((s, i) => { s.style.setProperty('--c0', Math.round(i * n / 9) + 1); s.style.setProperty('--c1', Math.round((i + 1) * n / 9) + 1); }); }
stripCols(); document.addEventListener('wm:grid', stripCols);
pages.forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 50%', end: 'bottom 50%',
    onToggle: (s) => { if (s.isActive) setActive(i); },
    onUpdate: (s) => segs[i]?.style.setProperty('--p', s.progress.toFixed(4)),
    onLeave: () => segs[i]?.style.setProperty('--p', 1),
    onLeaveBack: () => segs[i]?.style.setProperty('--p', 0),
  });
});
const go = (hash) => { const el = document.querySelector(hash); if (el) engine.scrollTo(el, { duration: 1.4 }); };
segs.forEach((seg) => seg.querySelector('a').addEventListener('click', (e) => {
  e.preventDefault();
  if (document.documentElement.dataset.phase !== 'ready') return;
  go(seg.querySelector('a').getAttribute('href'));
}));

initCursor(engine);

runEnter(engine, () => {
  engine.lockScroll(false);
  engine.emit('opening:done');
  ScrollTrigger.refresh();
  const jump = window.__wm.jumpTo;
  if (jump && document.querySelector(jump)) { window.__wm.jumpTo = ''; go(jump); }
});

window.__t2 = { engine, p1, p23 };

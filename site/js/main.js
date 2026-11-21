import { engine, initScroll } from './engine/core.js';
import { initCursor } from './engine/cursor.js';
import { runOpening } from './opening.js';

window.__wm.done('app');

// fonts of the active pairing count towards the real load progress
const FAMILIES = {
  a: ['560 1em Archivo', '400 1em Archivo', '400 1em "IBM Plex Mono"'],
  b: ['420 1em Newsreader', '400 1em Newsreader', '400 1em "DM Mono"'],
  c: ['600 1em "Barlow Semi Condensed"', '400 1em Barlow', '400 1em "B612 Mono"'],
};
Promise.all((FAMILIES[document.documentElement.dataset.type] || FAMILIES.a).map((f) => document.fonts.load(f)))
  .catch(() => {}).then(() => window.__wm.done('fonts'));

const { gsap, ScrollTrigger } = engine;
initScroll();
engine.lockScroll(!engine.reduced);

// ---------- timeline strip: fills as you scroll, names the current sheet, jumps on click ----------
const segs = [...document.querySelectorAll('.strip__seg')];
const sheets = [...document.querySelectorAll('.sheet')];
const tbSheet = document.querySelector('.tb__sheet');
const tbTitle = document.querySelector('.tb__title');
let active = -1;
function setActive(i) {
  if (i === active) return;
  active = i;
  segs.forEach((s, k) => s.classList.toggle('is-active', k === i));
  const s = sheets[i];
  if (s) { tbSheet.textContent = s.dataset.sheet; tbTitle.textContent = s.dataset.title; }
}
setActive(0);
sheets.forEach((sheet, i) => {
  ScrollTrigger.create({
    trigger: sheet, start: 'top top', end: 'bottom top',
    onUpdate: (st) => segs[i]?.style.setProperty('--p', st.progress.toFixed(4)),
    onToggle: (st) => { if (st.isActive) setActive(i); },
    onLeave: () => segs[i]?.style.setProperty('--p', 1),
    onLeaveBack: () => segs[i]?.style.setProperty('--p', 0),
  });
});
segs.forEach((seg) => seg.querySelector('a').addEventListener('click', (e) => {
  e.preventDefault();
  if (document.documentElement.dataset.phase !== 'ready') return;
  engine.scrollTo(seg.querySelector('a').getAttribute('href'));
}));
document.querySelectorAll('.opening__actions a').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault(); engine.scrollTo(a.getAttribute('href'));
}));

// ---------- the board drifts a little with scroll and cursor (drafting film under the sheet) ----------
if (!engine.reduced) {
  const grid = document.querySelector('.board__grid');
  const major = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 6.25;
  let sy = 0, mx = 0, my = 0, cx = 0, cy = 0;
  engine.lenis?.on('scroll', ({ scroll }) => { sy = scroll; });
  addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth - .5); my = (e.clientY / innerHeight - .5); }, { passive: true });
  gsap.ticker.add(() => {
    cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
    const M = major();
    const y = -((sy * 0.12) % M) - cy * 6;
    grid.style.setProperty('--gx', `${(-cx * 6).toFixed(2)}px`);
    grid.style.setProperty('--gy', `${y.toFixed(2)}px`);
  });
}

initCursor(engine);

runOpening(engine, () => {
  engine.lockScroll(false);
  ScrollTrigger.refresh();
});

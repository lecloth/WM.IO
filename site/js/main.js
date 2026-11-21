import { engine, initScroll } from './engine/core.js';
import { initCursor } from './engine/cursor.js';
import { runOpening } from './opening.js';
import { initAct1 } from './sheet01/act.js';

window.__wm.done('app');

// fonts of the active pairing count towards the real load progress
const FAMILIES = {
  a: ['560 1em Archivo', '400 1em Archivo', '400 1em "IBM Plex Mono"', '500 1em "IBM Plex Mono"'],
  b: ['420 1em Newsreader', '400 1em Newsreader', '400 1em "DM Mono"'],
  c: ['600 1em "Barlow Semi Condensed"', '400 1em Barlow', '400 1em "B612 Mono"'],
};
Promise.all((FAMILIES[document.documentElement.dataset.type] || FAMILIES.a).map((f) => document.fonts.load(f)))
  .catch(() => {}).then(() => window.__wm.done('fonts'));

const { ScrollTrigger } = engine;
initScroll();
engine.lockScroll(!engine.reduced);

// ---------- act 1 (opening + the first drawing) ----------
const act1 = initAct1(engine);
const actEl = document.getElementById('act-1');

// ---------- timeline strip + title block: which sheet is on the board ----------
const segs = [...document.querySelectorAll('.strip__seg')];
const sheets = [...document.querySelectorAll('[data-sheet]')];
const tb = {
  sheet: document.querySelector('.tb__sheet'), title: document.querySelector('.tb__title'),
  drawn: document.querySelector('.tb__drawn'), checked: document.querySelector('.tb__checked'), approved: document.querySelector('.tb__approved'),
};
let active = -1;
function setActive(i) {
  if (i === active) return;
  active = i;
  segs.forEach((s, k) => s.classList.toggle('is-active', k === i));
  const s = sheets[i];
  if (!s) return;
  tb.sheet.textContent = s.dataset.sheet; tb.title.textContent = s.dataset.title;
  tb.drawn.textContent = s.dataset.drawn; tb.checked.textContent = s.dataset.checked; tb.approved.textContent = s.dataset.approved;
}
setActive(0);
const vh = () => innerHeight;
const inAct = (s) => engine.reduced ? null : act1.spans[s.dataset.sheet];
sheets.forEach((sheet, i) => {
  const sp = inAct(sheet);
  const cfg = sp
    ? { start: () => actEl.offsetTop + sp[0] * vh(), end: () => actEl.offsetTop + sp[1] * vh() }
    : { trigger: sheet, start: 'top top', end: 'bottom top' };
  ScrollTrigger.create({
    ...cfg,
    onUpdate: (st) => segs[i]?.style.setProperty('--p', st.progress.toFixed(4)),
    onToggle: (st) => { if (st.isActive) setActive(i); },
    onLeave: () => segs[i]?.style.setProperty('--p', 1),
    onLeaveBack: () => segs[i]?.style.setProperty('--p', 0),
  });
});
// jump to a sheet: inside act 1, to the moment that sheet begins
function targetOf(id) {
  const el = document.querySelector(id);
  const sp = el && inAct(el);
  if (sp) return actEl.offsetTop + (sp[0] === 0 ? 0 : (sp[0] + 1.0) * vh());
  return el;
}
segs.forEach((seg) => seg.querySelector('a').addEventListener('click', (e) => {
  e.preventDefault();
  if (document.documentElement.dataset.phase !== 'ready') return;
  engine.scrollTo(targetOf(seg.querySelector('a').getAttribute('href')), { duration: 1.6 });
}));
document.querySelectorAll('.opening__actions a').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault(); engine.scrollTo(targetOf(a.getAttribute('href')), { duration: 1.6 });
}));

initCursor(engine);

runOpening(engine, () => {
  engine.lockScroll(false);
  ScrollTrigger.refresh();
});

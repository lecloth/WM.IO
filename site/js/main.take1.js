// TAKE 1 entry point, kept for reference only (not bundled). Take 2 uses site/js/main.js.
import { engine, initScroll } from './engine/core.js';
import { initCursor } from './engine/cursor.js';
import { initTheme } from './engine/theme.js';
import { runOpening } from './opening.js';
import { initAct1 } from './sheet01/act.js';
import * as S02 from './sheets/sheet-02.js';
import * as S03 from './sheets/sheet-03.js';
import * as S03b from './sheets/sheet-03b.js';
import * as S03c from './sheets/sheet-03c.js';
import * as S04 from './sheets/sheet-04.js';
import * as S05 from './sheets/sheet-05.js';
import * as S06 from './sheets/sheet-06.js';
import * as S07 from './sheets/sheet-07.js';
import * as S08 from './sheets/sheet-08.js';
import * as S09 from './sheets/sheet-09.js';

window.__wm.done('app');

// the site's two families count towards the real load progress
Promise.all(['420 1em Newsreader', '400 1em Newsreader', '400 1em "DM Mono"', '500 1em "DM Mono"'].map((f) => document.fonts.load(f)))
  .catch(() => {}).then(() => window.__wm.done('fonts'));

const { ScrollTrigger } = engine;
if (!engine.reduced) scrollTo(0, 0);   // the opening always plays from the top (no restored scroll, see index head)
initScroll();
engine.lockScroll(!engine.reduced);
initTheme(engine);

// ---------- the sheets ----------
const act1 = initAct1(engine);
const actEl = document.getElementById('act-1');
for (const [name, mod] of [['02', S02], ['03', S03], ['03b', S03b], ['03c', S03c], ['04', S04], ['05', S05], ['06', S06], ['07', S07], ['08', S08], ['09', S09]]) {
  try { mod.init?.(engine); } catch (e) { console.error(`[sheet ${name}]`, e); }
}

// ---------- timeline strip + title block ----------
// Several elements may share one sheet number (a sheet with sub-scenes): the strip fills across all of them,
// the title block follows whichever element is on screen (each may override title / drawn / checked / approved).
const segs = [...document.querySelectorAll('.strip__seg')];
const els = [...document.querySelectorAll('[data-sheet]')];
const tb = {
  sheet: document.querySelector('.tb__sheet'), title: document.querySelector('.tb__title'),
  drawn: document.querySelector('.tb__drawn'), checked: document.querySelector('.tb__checked'), approved: document.querySelector('.tb__approved'),
};
function setTitleBlock(el) {
  tb.sheet.textContent = el.dataset.sheet; tb.title.textContent = el.dataset.title;
  tb.drawn.textContent = el.dataset.drawn; tb.checked.textContent = el.dataset.checked; tb.approved.textContent = el.dataset.approved;
}
let activeSeg = -1;
function setSeg(i) { if (i === activeSeg) return; activeSeg = i; segs.forEach((s, k) => s.classList.toggle('is-active', k === i)); }
setTitleBlock(els[0]); setSeg(0);
engine.on('loop:wrap', () => { setTitleBlock(els[0]); setSeg(0); segs.forEach((s) => s.style.setProperty('--p', 0)); });

const vh = () => innerHeight;
const absTop = (el) => el.getBoundingClientRect().top + (engine.lenis?.scroll ?? scrollY);
// scroll range [start, end] in which an element is "the sheet on the board"
function rangeOf(el) {
  const sp = !engine.reduced && act1.spans[el.dataset.sheet] && actEl.contains(el) ? act1.spans[el.dataset.sheet] : null;
  if (sp) return [() => actEl.offsetTop + sp[0] * vh(), () => actEl.offsetTop + sp[1] * vh()];
  if (engine.reduced && actEl.contains(el)) {
    if (el.id === 'sheet-00') return [() => actEl.offsetTop, () => actEl.offsetTop + document.getElementById('sheet-01').offsetTop];
    return [() => actEl.offsetTop + el.offsetTop, () => actEl.offsetTop + actEl.offsetHeight];
  }
  // a chapter takes over the board half-way through its entry (it overlaps the previous sheet by one viewport)
  // (its entry is p 0 -> 1, i.e. scroll absTop - vh .. absTop; the next chapter takes over at the middle of its own entry)
  if (el.classList.contains('chapter') && !engine.reduced) return [() => absTop(el) - vh() * 0.5, () => absTop(el) + el.offsetHeight - vh() * 1.5];
  return [() => absTop(el), () => absTop(el) + el.offsetHeight];
}
const elRanges = els.map((el) => rangeOf(el));
els.forEach((el, i) => {
  const [a, b] = elRanges[i];
  ScrollTrigger.create({ start: a, end: b, onToggle: (st) => { if (st.isActive) { setTitleBlock(el); setSeg(parseInt(el.dataset.sheet, 10)); } } });
});
// after any jump (strip click, loop, big instant scroll) settle on whichever sheet holds the board, by position
ScrollTrigger.addEventListener('scrollEnd', () => {
  const y = engine.lenis?.scroll ?? scrollY;
  let pick = 0;
  elRanges.forEach((r, i) => { if (y >= r[0]() - 1) pick = i; });
  setTitleBlock(els[pick]); setSeg(parseInt(els[pick].dataset.sheet, 10));
});
const groups = new Map();
els.forEach((el) => { const n = parseInt(el.dataset.sheet, 10); if (!groups.has(n)) groups.set(n, []); groups.get(n).push(el); });
groups.forEach((list, n) => {
  const ranges = list.map(rangeOf);
  ScrollTrigger.create({
    start: () => Math.min(...ranges.map((r) => r[0]())), end: () => Math.max(...ranges.map((r) => r[1]())),
    onUpdate: (st) => segs[n]?.style.setProperty('--p', st.progress.toFixed(4)),
    onLeave: () => segs[n]?.style.setProperty('--p', 1),
    onLeaveBack: () => segs[n]?.style.setProperty('--p', 0),
  });
});
// jump to a sheet: to the moment it holds the board
function targetOf(id) {
  const el = document.querySelector(id);
  if (!el) return 0;
  const sp = !engine.reduced && act1.spans[el.dataset.sheet] && actEl.contains(el) ? act1.spans[el.dataset.sheet] : null;
  if (sp) return actEl.offsetTop + (sp[0] === 0 ? 0 : (sp[0] + 1.0) * vh());
  if (el.classList.contains('chapter') && !engine.reduced) return absTop(el) + vh() * 0.25;
  return el;
}
engine.targetOf = targetOf;
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
  engine.emit('opening:done');
  ScrollTrigger.refresh();
  // arrived on a #sheet-NN link: travel there once the opening has played
  const jump = window.__wm.jumpTo;
  if (jump && document.querySelector(jump)) { window.__wm.jumpTo = ''; engine.scrollTo(targetOf(jump), { duration: 1.6 }); }
});

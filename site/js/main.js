// Take 2 entry point: the round 8 running order (STUDIO_BRIEF.md Part 5 "Round 8"): 1 page 1 and 2 the hallway (one
// section), 3 into the lock, 4 how we work, 5 lighter trips, 6 team (stubs), 7 the final room, 8 the spec sheet (stub).
// Take 1's sheets (site/js/sheets/*, sheet01..08/*, opening.js's loop, products, settings) stay on disk for reuse.
import { engine, initScroll } from './engine/core.js';
import { initCursor } from './engine/cursor.js';
import { initTheme } from './engine/theme.js';
import { runEnter } from './enter.js';
import { initPage01 } from './page01/page.js';
import { initPages23 } from './page02/page.js';

window.__wm.done('app');
Promise.all(['420 1em Newsreader', '400 1em Newsreader', '300 1em "DM Mono"', '400 1em "DM Mono"', '500 1em "DM Mono"'].map((f) => document.fonts.load(f)))
  .catch(() => {}).then(() => window.__wm.done('fonts'));

const { ScrollTrigger } = engine;
if (!engine.reduced) scrollTo(0, 0);
initScroll();
engine.lockScroll(!engine.reduced);
initTheme(engine);

let p1 = null, p23 = null;
try { p1 = initPage01(engine); } catch (e) { console.error('[page 01]', e); }
try { p23 = initPages23(engine); } catch (e) { console.error('[pages 02-03]', e); }

// ---------- timeline strip + title block: one segment per page (round 8: eight pages; the hallway is page 2) ----------
const segs = [...document.querySelectorAll('.strip__seg')];
const cutLi = document.querySelector('.strip__cut'), cutA = cutLi?.querySelector('a');
const pages = [...document.querySelectorAll('#sheets [data-sheet]')];   // document order: page 1, the hallway's marker inside it, 3-8
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
// the strip's eight segments on whole columns of the grid (the head script's unit); "Cut to the chase" takes the last
// columns (six on phones, seven on desktop)
function stripCols() {
  const n = window.__grid?.n || 20, c = innerWidth >= 1024 ? 7 : 6, m = n - c;
  segs.forEach((s, i) => { s.style.setProperty('--c0', Math.round(i * m / segs.length) + 1); s.style.setProperty('--c1', Math.round((i + 1) * m / segs.length) + 1); });
  if (cutLi) { cutLi.style.setProperty('--c0', m + 1); cutLi.style.setProperty('--c1', n + 1); }
}
stripCols(); document.addEventListener('wm:grid', stripCols); addEventListener('resize', stripCols);
// the page under the screen's top is the active one (a page counts from the moment it lands). Each segment fills from
// its page's landing to the next page's.
let tops = [];
const docTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
const measureTops = () => { tops = pages.map(docTop); };
function track() {
  if (!tops.length) measureTops();
  const y = scrollY + 1;
  let i = 0; for (let k = 0; k < tops.length; k++) if (tops[k] <= y) i = k;
  setActive(i);
  segs.forEach((sg, k) => { const a = tops[k], b = k + 1 < tops.length ? tops[k + 1] : document.documentElement.scrollHeight - innerHeight;
    sg.style.setProperty('--p', Math.max(0, Math.min(1, (y - a) / Math.max(1, b - a))).toFixed(4)); });
}
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: track, onRefresh: () => { measureTops(); track(); } });
addEventListener('scroll', track, { passive: true });
const go = (hash) => { const el = document.querySelector(hash); if (el) engine.scrollTo(docTop(el), { duration: 1.4 }); };

// ---------- round 8: "Cut to the chase": the hyperdrive into the final room (a plain jump with reduced motion) ----------
let chasing = false;
async function cutToChase() {
  if (chasing || document.documentElement.dataset.phase !== 'ready') return;
  const room = document.getElementById('page-07'); if (!room) return;
  chasing = true;
  const jump = () => {
    const y = docTop(room);
    if (engine.lenis) engine.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
    ScrollTrigger.update(); track();
  };
  try {
    const { playHyperdrive } = await import('./engine/hyperdrive.js');
    await playHyperdrive({ jump, reduced: engine.reduced, engine });
  } catch (e) { console.warn('[cut to the chase]', e); jump(); }
  chasing = false;
  room.querySelector('#p2-h')?.focus({ preventScroll: true });
}
cutA?.addEventListener('click', (e) => { e.preventDefault(); cutToChase(); });
segs.forEach((seg) => seg.querySelector('a').addEventListener('click', (e) => {
  e.preventDefault();
  if (document.documentElement.dataset.phase !== 'ready') return;
  const href = seg.querySelector('a').getAttribute('href');
  // the final room and the strip's last square jump with the hyperdrive (the spec sheet follows the final room)
  if (href === '#page-07' || seg === segs[segs.length - 1]) cutToChase(); else go(href);
}));

// ---------- for the tools: every stop on the whole page, as scroll positions (CSS px) ----------
window.__t2stops = () => {
  const out = [];
  const p1 = window.__p1;
  if (p1 && !engine.reduced) Object.entries(p1.stops).forEach(([name, p]) => out.push({ name, y: Math.round(p1.yAt(p)) }));
  else if (document.getElementById('page-01')) out.push({ name: 'P1', y: 0 });
  if (engine.reduced) { const h = document.querySelector('.p1-hall'); if (h) out.push({ name: 'HALL', y: docTop(h) }); }
  ['page-03', 'page-04', 'page-05', 'page-06'].forEach((id) => { const el = document.getElementById(id); if (el) out.push({ name: id.replace('page-', 'P'), y: docTop(el) }); });
  const room = document.getElementById('page-07'), slipEl = document.getElementById('slip-when'), spec = document.getElementById('page-08');
  if (room) { const y = docTop(room); out.push({ name: 'ROOM', y }); const rows = room.querySelector('.p2-rows'); if (rows) out.push({ name: 'ROWS', y: docTop(rows) - Math.round(innerHeight * 0.3) }); }
  if (slipEl) { out.push({ name: 'SLIP', y: docTop(slipEl) - Math.round(innerHeight * 0.2) }); const s = document.querySelector('#slip .slip__send'); if (s) out.push({ name: 'SEND', y: docTop(s) - Math.round(innerHeight * 0.5) }); }
  if (spec) out.push({ name: 'P08', y: docTop(spec) });
  const max = document.documentElement.scrollHeight - innerHeight;
  return out.map((s) => ({ ...s, y: Math.max(0, Math.min(max, s.y)) }));
};
window.__cutToChase = cutToChase;

initCursor(engine);

runEnter(engine, () => {
  engine.lockScroll(false);
  engine.emit('opening:done');
  ScrollTrigger.refresh();
  const jump = window.__wm.jumpTo;
  if (jump && document.querySelector(jump)) { window.__wm.jumpTo = ''; go(jump); }
});

window.__t2 = { engine, p1, p23 };

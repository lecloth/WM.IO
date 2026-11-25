// The final room (round 8b: ONE slip from top to bottom, on plain paper; Part 5 "Finish the site"):
//   the heading (Wajih's, signed off), then the work slip: its head row (live number, date, status), the task list in the
//   "Send it by" style (small boxes, no numbers: a tick marks the box with one hairline stroke, shows the need's answer
//   beneath and gives a vibration tick on Android), when, your name, anything else, how to send, Send (send.js).
//   The old sticky slip head, its feed and the separate printed list are gone: the ticks are the slip.
// Reduced motion: every word shown, no stroke draws, no rise, no pin, no vibration.
import { slip, NEEDS } from './slip.js';
import { initSend } from './send.js';
import { initCta } from './cta.js';
import { haptics } from '../engine/haptics.js';
import { settings } from '../settings.js';
import { grid, snapHeights, seatText } from '../engine/grid.js';

export function initPages23(engine) {
  const room = document.getElementById('page-07');
  if (!room) return null;
  const reduced = engine.reduced;
  const stage = room.querySelector('.p2__stage');
  const said = document.getElementById('p2-said');
  const form = document.getElementById('slip');
  const details = form.querySelector('.slip__sec--when');
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- words: the calm rise-and-straighten, once, when a line first comes into view ----------
  const Split = window.SplitText;
  const split = (el) => {
    if (!Split || reduced) return;
    const s = new Split(el, { type: 'words', wordsClass: 'w', tag: 'span', aria: 'none' });
    s.words.forEach((w, i) => w.style.setProperty('--i', i));
  };
  const rvs = $$('.p23 .rv'); rvs.forEach(split);
  $$('.p2-ans__t').forEach(split);
  const show = (el) => el.classList.add('on');
  if (reduced) rvs.forEach(show);
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      show(e.target); io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach((el) => io.observe(el));
  }

  // ---------- the slip's head: its number and date, live ----------
  const noEls = $$('.js-slip-no'), dateEls = $$('.js-slip-date');
  function paintClock() { noEls.forEach((e) => { e.textContent = slip.no; }); dateEls.forEach((e) => { e.textContent = slip.date; }); }
  paintClock();
  setInterval(() => slip.tickClock(), 10e3);
  slip.on((what) => { if (what.clock) paintClock(); });

  // ---------- the task list ----------
  let lastPointer = -1e9;
  const tapped = () => performance.now() - lastPointer < 900;   // a real pointer tap (keyboard ticks stay silent)
  $$('.p2-row', room).forEach((row) => {
    const input = row.querySelector('input'), id = row.dataset.id, ans = row.querySelector('.p2-ans__t');
    row.addEventListener('pointerdown', () => { lastPointer = performance.now(); haptics.unlock(); }, { passive: true });
    input.addEventListener('change', () => {
      const on = input.checked;
      row.classList.toggle('is-on', on);
      if (on) { ans.classList.remove('on'); void ans.offsetWidth; ans.classList.add('on'); }
      else ans.classList.remove('on');
      slip.setNeed(id, on);
      said.textContent = on ? `${NEEDS[id]}: ${ans.textContent.trim()} Ticked on your work slip.` : `${NEEDS[id]}: taken off your work slip.`;
      if (tapped()) haptics.tap(12);
    });
  });
  // the slip's other ticks (when, send by, slots) mark the same way, with the same tick
  form.addEventListener('pointerdown', (e) => { if (e.target.closest('.tick')) { lastPointer = performance.now(); haptics.unlock(); } }, { passive: true });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'when' || t.name === 'by') { slip.set(t.name, t.value); if (tapped()) haptics.tap(10); }
    if (t.name === 'slot' && tapped()) haptics.tap(10);
  });
  // typed fields: capped by maxlength and again here; the counter shows what's left of the note
  const name = form.querySelector('#slip-name'), note = form.querySelector('#slip-note'), noteN = form.querySelector('.js-note-n');
  name.maxLength = 60; note.maxLength = 500;
  name.addEventListener('input', () => slip.set('name', name.value));
  note.addEventListener('input', () => { slip.set('note', note.value); noteN.textContent = String(Math.min(500, [...note.value].length)); });
  name.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); note.focus(); } });
  form.addEventListener('submit', (e) => e.preventDefault());
  const send = initSend(form, { reduced, haptics });

  // links within the slip glide instead of jumping
  const glide = (el, offset = 0) => {
    const y = scrollY + el.getBoundingClientRect().top + offset;
    if (engine.lenis) engine.lenis.scrollTo(y, { duration: 1.1 }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  const toDetails = () => { const strip = document.getElementById('strip')?.offsetHeight || 40; glide(details, -strip - grid.u); };

  // round 5: the call to action (the beacon; cta.js, design A on the page): the first box, then "Next: your details"
  const cta = initCta(stage, { reduced, inDive: () => false, details, onNext: toDetails });

  snapHeights(document);   // the slip's sections, ticks and answers stay whole cells tall

  // the answers: their first baseline seated on the grid by measurement (split words: no trim, grid.js seatText)
  const seatAnswers = () => [...document.querySelectorAll('.p2-ans__t')].forEach((x) => seatText(x, 0.5));
  const relayout = () => { seatAnswers(); };
  addEventListener('resize', relayout);
  grid.onChange(() => requestAnimationFrame(relayout));
  engine.on('theme', relayout);
  engine.on('opening:done', relayout);
  document.fonts?.ready.then(relayout);
  relayout();

  // for tests
  window.__p23 = { slip, send, cta,
    tick: (id, on = true) => { const i = room.querySelector(`.p2-row[data-id="${id}"] input`); if (i.checked !== on) i.click(); },
    setSwitch: (k, on, endpoint = 'https://example.invalid/slip') => { const o = k === 'page' ? settings.sendFromPage : settings.booking; o.on = on; o.endpoint = on ? endpoint : ''; send.update(); },
  };
  return { length: () => ((document.getElementById('page-08')?.offsetTop ?? room.offsetTop + room.offsetHeight) - room.offsetTop) / innerHeight };
}

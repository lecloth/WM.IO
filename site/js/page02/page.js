// Pages 2 and 3 as one move (Part 5 "Pages 2 and 3"):
//   page 2 (For you): five hairline rows. A tap marks the row's box with one hairline stroke, shows its answer beneath,
//     prints the line onto the work slip and gives a vibration tick on Android. The slip's head waits at the bottom of
//     the screen (sticky) and types each new line in; when page 3 arrives, it docks as the top of the slip.
//   page 3 (the work slip): live number and date, the printed needs, when, your name, anything else, how to send,
//     Send (send.js). Then "or see how we think", and Detail B, a circle that grows into page 4 (callout.js).
// Page 1's "?" dot dive lands on page 2: page 2's stage waits at the end of its corridor (page 1 fixes and scales it).
// Reduced motion: every word shown, no stroke draws, no rise, no pin, no vibration.
import { slip, NEEDS } from './slip.js';
import { initSend } from './send.js';
import { initCalloutB } from './callout.js';
import { initCta } from './cta.js';
import { haptics } from '../engine/haptics.js';
import { settings } from '../settings.js';

export function initPages23(engine) {
  const p2 = document.getElementById('page-02'), p3 = document.getElementById('page-03');
  if (!p2 || !p3) return null;
  const { ScrollTrigger } = engine;
  const reduced = engine.reduced;
  const stage = p2.querySelector('.p2__stage'), head = p2.querySelector('.slip-head'), feed = head.querySelector('.js-feed');
  const said = document.getElementById('p2-said');
  const form = document.getElementById('slip');
  const needsList = form.querySelector('.slip__needs'), empty = form.querySelector('.slip__empty');
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- words: the calm rise-and-straighten, once, when a line first comes into view ----------
  const Split = window.SplitText;
  const split = (el) => {
    if (!Split || reduced) return;
    const s = new Split(el, { type: 'words', wordsClass: 'w', tag: 'span', aria: 'none' });
    s.words.forEach((w, i) => w.style.setProperty('--i', i));
  };
  // the split keeps an accessible copy of the line (aria-label) only on block elements; SplitText's aria: 'none' leaves
  // the words as plain text, which screen readers read normally
  const rvs = $$('.p23 .rv'); rvs.forEach(split);
  $$('.p2-ans__t').forEach(split);
  const show = (el) => el.classList.add('on');
  if (reduced) rvs.forEach(show);
  else {
    // page 2's lines rise as the dive's window first shows them at the corridor's end (page 2 is fixed there), not before
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      // during the dive page 2 is a small, scaled sheet at the corridor's end: its words stand settled (no rise inside a
      // scaled layer, which would re-raster it every frame)
      if (e.target.closest('#page-02') && p2.classList.contains('is-dive')) { if ((window.__p1?.P?.() ?? 9) >= 4.3) { e.target.classList.add('on', 'is-still'); io.unobserve(e.target); } return; }
      show(e.target); io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach((el) => io.observe(el));
  }

  // ---------- the slip's head: number, date, count, and the paper coming out of it ----------
  const noEls = $$('.js-slip-no'), dateEls = $$('.js-slip-date'), countEls = $$('.js-slip-count');
  function paintClock() { noEls.forEach((e) => { e.textContent = slip.no; }); dateEls.forEach((e) => { e.textContent = slip.date; }); }
  paintClock();
  setInterval(() => slip.tickClock(), 10e3);

  // the feed line: the printed needs so far, the newest typed in by the print head (stepped, like a dot-matrix head)
  function printFeed(newest) {
    feed.textContent = '';
    slip.printed().forEach((t, i, all) => {
      const id = slip.needs[i];
      const s = document.createElement('span'); s.textContent = t;
      if (id === newest && !reduced) { s.className = 'new'; s.style.setProperty('--print-n', Math.max(4, t.length)); s.style.setProperty('--print-ms', `${Math.min(700, 160 + t.length * 22)}ms`); }
      feed.append(s);
      if (i < all.length - 1) feed.append(document.createTextNode(' · '));
    });
    if (!slip.needs.length) feed.textContent = 'Nothing printed yet';
  }

  // the slip's printed needs (page 3), in the order they were ticked
  function printList(newest) {
    needsList.textContent = '';
    slip.needs.forEach((id, i) => {
      const li = document.createElement('li');
      const n = document.createElement('span'); n.className = 'n mono'; n.textContent = String(i + 1).padStart(2, '0');
      const t = document.createElement('span'); t.className = 't'; t.textContent = NEEDS[id];
      if (id === newest && !reduced) { li.className = 'is-new'; li.style.setProperty('--print-n', Math.max(4, NEEDS[id].length)); li.style.setProperty('--print-ms', `${Math.min(700, 160 + NEEDS[id].length * 22)}ms`); }
      li.append(n, t); needsList.append(li);
    });
    empty.hidden = slip.needs.length > 0;
    countEls.forEach((e) => { e.textContent = String(slip.needs.length); });
  }

  slip.on((what) => {
    if (what.clock) paintClock();
    if (what.need) { printList(what.on ? what.need : null); printFeed(what.on ? what.need : null); }
  });
  printList(); printFeed();

  // ---------- page 2's rows ----------
  let lastPointer = -1e9;
  const tapped = () => performance.now() - lastPointer < 900;   // a real pointer tap (keyboard ticks stay silent)
  $$('.p2-row').forEach((row) => {
    const input = row.querySelector('input'), id = row.dataset.id, ans = row.querySelector('.p2-ans__t');
    row.addEventListener('pointerdown', () => { lastPointer = performance.now(); haptics.unlock(); }, { passive: true });
    input.addEventListener('change', () => {
      const on = input.checked;
      row.classList.toggle('is-on', on);
      if (on) { ans.classList.remove('on'); void ans.offsetWidth; ans.classList.add('on'); }
      else ans.classList.remove('on');
      slip.setNeed(id, on);
      head.classList.add('is-live');
      said.textContent = on ? `${NEEDS[id]}: ${ans.textContent.trim()} Printed on your work slip.` : `${NEEDS[id]}: taken off your work slip.`;
      if (tapped()) haptics.tap(12);
    });
  });
  // the slip's own ticks (when, send by, slots) mark the same way, with the same tick
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

  // ---------- the head: stuck at the bottom while page 2 is on screen, docked as the slip's top after ----------
  let stuck = null, raf = 0, p2h = 0;
  function layoutHead() {
    const tb = document.querySelector('.titleblock')?.getBoundingClientRect();
    const hr = head.getBoundingClientRect();
    let bottom = 16;
    const desktop = innerWidth >= 1024, sl = stage.getBoundingClientRect().left + parseFloat(getComputedStyle(stage).paddingLeft);
    if (tb && tb.width) {
      // desktop: stuck, the head is one line, so it fits beside the title block, level with it; phones: above it
      if (desktop) { document.documentElement.style.setProperty('--feed-max', `${Math.max(320, Math.floor(tb.left - sl - 24))}px`); bottom = Math.max(16, innerHeight - tb.bottom); }
      else bottom = hr.right > tb.left - 8 ? innerHeight - tb.top + 10 : Math.max(16, innerHeight - tb.bottom);
    }
    document.documentElement.style.setProperty('--feed-bottom', `${Math.round(bottom)}px`);
  }
  function frame() {
    raf = 0;
    const sr = stage.getBoundingClientRect();
    const fb = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--feed-bottom')) || 0;
    const s = !p2.classList.contains('is-dive') && sr.top < innerHeight && sr.bottom > innerHeight - fb + 0.5;
    if (s !== stuck) { stuck = s; head.classList.toggle('is-stuck', s); }
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', schedule, { passive: true });
  new MutationObserver(schedule).observe(p2, { attributes: true, attributeFilter: ['class'] });

  // page 3's grid continues page 2's; while page 1 fixes page 2's stage, page 2 keeps its height
  let refreshT = 0;
  const ro = new ResizeObserver(() => {
    if (p2.classList.contains('is-dive')) return;
    const h = p2.offsetHeight;
    if (Math.abs(h - p2h) < 0.5) return;
    const first = !p2h; p2h = h;
    p2.style.setProperty('--p2-h', `${h}px`); p3.style.setProperty('--p2-h', `${h}px`);
    if (!first) { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 450); }   // everything below moved
    schedule();
  });
  ro.observe(p2);

  // links within the move glide instead of jumping (the head to the slip, the empty slip back up, on to page 4)
  const glide = (el, offset = 0) => {
    const y = scrollY + el.getBoundingClientRect().top + offset;
    if (engine.lenis) engine.lenis.scrollTo(y, { duration: 1.1 }); else scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  };
  head.addEventListener('click', (e) => {
    e.preventDefault();
    const strip = document.getElementById('strip')?.offsetHeight || 40;
    glide(p3, -head.offsetHeight - strip - 12);
  });
  empty.querySelector('a')?.addEventListener('click', (e) => { e.preventDefault(); glide(p2); });

  // round 5: the call to action (the beacon; cta.js, design A on the page)
  const cta = initCta(stage, { reduced, inDive: () => p2.classList.contains('is-dive'),
    onNext: () => { const strip = document.getElementById('strip')?.offsetHeight || 40; glide(p3, -head.offsetHeight - strip - 12); } });

  const calloutB = initCalloutB(engine);

  const relayout = () => { layoutHead(); stuck = null; schedule(); };
  addEventListener('resize', relayout);
  engine.on('theme', relayout);
  engine.on('opening:done', relayout);
  document.fonts?.ready.then(relayout);
  relayout();

  // for tests
  window.__p23 = { slip, send, head, stuck: () => stuck, calloutB, cta,
    tick: (id, on = true) => { const i = p2.querySelector(`.p2-row[data-id="${id}"] input`); if (i.checked !== on) i.click(); },
    setSwitch: (k, on, endpoint = 'https://example.invalid/slip') => { const o = k === 'page' ? settings.sendFromPage : settings.booking; o.on = on; o.endpoint = on ? endpoint : ''; send.update(); },
  };
  return { length: () => (document.getElementById('page-04').offsetTop - p2.offsetTop) / innerHeight };
}

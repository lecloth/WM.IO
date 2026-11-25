// Page 2's call to action (Part 5 "Round 5", item 3). "Tap everything that fits" was a tiny caption; it is now a big
// line right under the question, and the site's one "tap here" signal, the beacon from the opening (a breathing dot
// sending out slow fading rings), shows where to tap. Three designs; A on the page until Wajih picks:
//   A · Beacon on the rows: the beacon pulses on the first box until the first tap, then glides to a "Next: your slip"
//       line (draft wording) that takes the visitor down to page 3's work slip.
//   B · Beacon as a gate: page 2 opens on the line and the beacon alone; tapping the beacon reveals the rows (scrolling
//       on reveals them too, so nothing ever stops the scroll).
//   C · No beacon: the big line, and the six boxes pulse once, one after another, when the rows first come into view.
// Reduced motion: no pulse, a still ring. Nothing else looks clickable.
// THE SWITCH: `CTA_DESIGN` is the design on the page; `?cta=B` previews another (for review only, nothing is stored).
export const CTA_DESIGN = 'A';
export const CTAS = { A: 'Beacon on the rows', B: 'Beacon as a gate', C: 'No beacon' };
export function ctaPick() {
  try { const q = (new URLSearchParams(location.search).get('cta') || '').toUpperCase(); if (CTAS[q]) return q; } catch (e) {}
  return CTA_DESIGN;
}

/** stage: page 2's stage (.p2__stage). onNext: glide to the work slip. inDive(): page 1's dive still holds the stage. */
export function initCta(stage, { design = ctaPick(), reduced = false, onNext = () => {}, inDive = () => false, slip = null } = {}) {
  const rows = stage.querySelector('.p2-rows'), pick = stage.querySelector('.p2__pick'), next = stage.querySelector('.p2-next');
  const marks = [...stage.querySelectorAll('.p2-row .mark')];
  stage.dataset.cta = design;
  if (!rows || !marks.length) return null;

  // the beacon: the opening's own (a dot and two rings), in ink
  let beacon = null;
  if (design === 'A' || design === 'B') {
    beacon = document.createElement(design === 'B' ? 'button' : 'span');
    beacon.className = `p2-beacon${reduced ? ' is-still' : ''}`;
    beacon.innerHTML = '<i class="p2-beacon__ring"></i><i class="p2-beacon__ring p2-beacon__ring--2"></i><i class="p2-beacon__dot"></i>';
    if (design === 'B') { beacon.type = 'button'; beacon.setAttribute('aria-label', 'Show the six choices'); beacon.setAttribute('aria-expanded', 'false'); beacon.setAttribute('aria-controls', rows.id || (rows.id = 'p2-rows')); }
    else beacon.setAttribute('aria-hidden', 'true');
    stage.append(beacon);
  }

  // where things are inside the stage (works while the stage is scaled: the ratio of its box to its layout width)
  const at = (el) => {
    const sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = sr.width / (stage.offsetWidth || 1) || 1;
    return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k };
  };
  let state = design === 'A' ? 'box' : design === 'B' ? 'gate' : 'rows';
  const slot = () => next?.querySelector('.p2-next__slot');
  function place(instant) {
    if (!beacon) return;
    const target = state === 'next' || state === 'done' ? slot() : marks[0];
    if (!target) return;
    const p = at(target);
    if (instant) beacon.style.transition = 'none';
    beacon.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    if (instant) { void beacon.offsetWidth; beacon.style.transition = ''; }
  }
  function setState(s) {
    state = s; stage.dataset.ctaState = s;
    if (beacon) { beacon.classList.toggle('is-off', s === 'done' || s === 'rows'); }
    place(false);
  }

  if (design === 'A') {
    // the first tap sends the beacon on to "Next: your slip"
    rows.addEventListener('change', (e) => { if (state === 'box' && e.target.checked) { next?.classList.add('on'); setState('next'); } });
    next?.addEventListener('click', (e) => { e.preventDefault(); setState('done'); onNext(); });
    // once the slip is on screen, the beacon's job is done
    const slipEl = document.getElementById('slip');
    if (slipEl && slipEl !== stage) new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting && state === 'next') setState('done'); }), { threshold: 0.25 }).observe(slipEl);
  }
  if (design === 'B') {
    pick?.classList.add('is-gated');
    const open = () => {
      if (state !== 'gate') return;
      pick?.classList.remove('is-gated'); pick?.classList.add('is-opening');
      beacon.setAttribute('aria-expanded', 'true'); setState('rows');
      setTimeout(() => { beacon.hidden = true; marks[0]?.closest('label')?.querySelector('input')?.focus({ preventScroll: true }); }, reduced ? 0 : 420);
    };
    beacon.addEventListener('click', open);
    // never a trap: scrolling on past the line reveals the rows too
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (!en.isIntersecting && en.boundingClientRect.top < 0 && !inDive()) open(); }), { threshold: 0 });
    const line = stage.querySelector('.p2__sub'); if (line) io.observe(line);
  }
  if (design === 'C' && !reduced) {
    // the six boxes pulse once, in order, the first time the rows are on screen after the landing
    marks.forEach((m, i) => { const p = document.createElement('i'); p.className = 'p2-pulse'; p.style.setProperty('--i', i); m.after(p); });
    let done = false;
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (done || !en.isIntersecting || inDive()) return; done = true; rows.classList.add('is-pulse'); io.disconnect();
    }), { threshold: 0.6 });
    io.observe(rows);
    new MutationObserver(() => { if (!done && !inDive()) { io.disconnect(); io.observe(rows); } }).observe(stage.closest('section') || stage, { attributes: true, attributeFilter: ['class'] });
  }

  setState(state);
  const relayout = () => place(true);
  addEventListener('resize', relayout);
  document.fonts?.ready.then(relayout);
  new ResizeObserver(relayout).observe(rows);
  requestAnimationFrame(relayout);
  return { design, state: () => state, beacon, relayout, where: () => (beacon ? beacon.style.transform : '') };
}

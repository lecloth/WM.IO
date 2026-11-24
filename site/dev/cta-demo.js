// The CTA demo page (cta.html): page 2's markup read from the built page, cta.js on it. Bundled into dist/ by
// tools/bundle.mjs (hashed chunks), so a phone never runs a stale copy.
import { initCta } from '../js/page02/cta.js';
import { snapHeights } from '../js/engine/grid.js';
const q = new URLSearchParams(location.search), design = (q.get('cta') || 'A').toUpperCase();
if (q.get('theme') === 'dark') document.documentElement.dataset.theme = 'dark';
const reduced = q.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.dataset.motion = 'reduce';
const said = document.querySelector('.lab-said');
let html = '';
for (let n = 0; n < 5 && !html; n++) { try { html = await (await fetch(n ? `../index.html?r=${n}` : '../index.html')).text(); } catch (e) { await new Promise((r) => setTimeout(r, 200 * (n + 1))); } }
const sec = new DOMParser().parseFromString(html, 'text/html').getElementById('page-02');
document.getElementById('host').append(document.importNode(sec, true));
const stage = document.querySelector('.p2__stage');
stage.style.minHeight = 'auto';
snapHeights(document);
document.querySelectorAll('.p2-row').forEach((row) => row.querySelector('input').addEventListener('change', (e) => {
  row.classList.toggle('is-on', e.target.checked);
  row.querySelector('.p2-ans__t').classList.toggle('on', e.target.checked);
}));
window.__cta = initCta(stage, { design, reduced, onNext: () => { said.textContent = 'Would glide down to the work slip (page 3).'; } });

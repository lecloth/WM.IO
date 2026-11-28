// Page 8, the spec sheet (stage 11): this page's own numbers, measured live in the visitor's browser where a browser can
// measure them (never typed in): what has loaded so far and how much it weighs, when the page was ready, frames per
// second right now, the grid it is laid out on, the screen, the fonts, how many locks page 3 draws. The outside assets
// and their licences are this site's own list (CREDITS.md), stated, not measured. Then the loop back to the start.
import { grid } from '../engine/grid.js';

const fmt = (v, d = 1) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
// the outside assets on the page (CREDITS.md): what, licence
export const ASSETS = [
  ['Bell’s 1877 patent drawing', 'public domain'], ['the paper scan on the hallway’s walls', 'CC0'], ['the studio light', 'CC0'],
  ['the phone’s materials', 'CC0'], ['the Cutaway Lock (zbzzn)', 'CC BY 4.0'], ['Newsreader', 'OFL'], ['DM Mono', 'OFL'],
  ['three.js', 'MIT'], ['Lenis', 'MIT'], ['GSAP', 'its free licence'],
];

export function initSpec(engine, { onBack } = {}) {
  const sec = document.getElementById('page-08'); if (!sec) return null;
  const $ = (s) => sec.querySelector(s);
  let fps = 0, frames = [], raf = 0, seen = false;
  const tick = (now) => { frames.push(now); while (frames.length && now - frames[0] > 1000) frames.shift(); fps = frames.length > 1 ? (frames.length - 1) * 1000 / (frames[frames.length - 1] - frames[0]) : 0; raf = seen ? requestAnimationFrame(tick) : 0; };
  function paint() {
    const res = performance.getEntriesByType('resource'), nav = performance.getEntriesByType('navigation')[0];
    const bytes = res.reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) + (nav ? (nav.transferSize || nav.encodedBodySize || 0) : 0);
    $('.js-weight').textContent = `${fmt(bytes / 1024)} KB`;
    $('.js-files').textContent = `${(res.length + 1).toLocaleString('en-US')}`;
    $('.js-load').textContent = nav && nav.loadEventEnd ? `${fmt(nav.loadEventEnd)} ms` : '—';
    $('.js-fps').textContent = fps ? `${fmt(fps)} fps` : '—';
    const n = window.__grid?.n || Math.round(innerWidth / grid.u);
    $('.js-grid').textContent = `${n} cells of ${fmt(grid.u)} px`;
    $('.js-screen').textContent = `${fmt(innerWidth)} × ${fmt(innerHeight)} px · ${fmt(devicePixelRatio || 1, 2)}×`;
    const fams = new Set(), files = [...document.fonts].filter((f) => f.status === 'loaded'); files.forEach((f) => fams.add(f.family.replace(/["']/g, '')));
    $('.js-fonts').textContent = `${[...fams].join(', ')} · ${files.length} files`;
    // the security page's beat 2, the room of locks (dive.js): its copies, read off the built room, and the real lock
    const R = window.__p1?.diveApi?.room?.(); $('.js-locks').textContent = R?.copies ? `${(R.copies + 1).toLocaleString('en-US')}: ${R.copies} copies and the real lock` : '—';
    const lic = [...new Set(ASSETS.map((a) => a[1]))];
    $('.js-assets').textContent = `${ASSETS.length} · ${lic.join(', ')}`;
  }
  const io = new IntersectionObserver((es) => es.forEach((e) => { seen = e.isIntersecting; if (seen) { paint(); if (!raf) raf = requestAnimationFrame(tick); } }), { threshold: 0 });
  io.observe(sec);
  setInterval(() => { if (seen) paint(); }, 500);
  $('.t8__back').addEventListener('click', (e) => { e.preventDefault(); onBack?.(); });
  window.__p8 = { paint, assets: ASSETS };
  return { paint };
}

// Sheet 09: the spec sheet. Entry: the scale changes from 1:1 to 1:5 and the previous sheet shrinks into its place in
// the whole drawing set; sheet 09's slot then opens to full size. Every number is measured live in the visitor's
// browser. At the end the line closes back into the point and the page loops to the singularity.
import { chapter, span, ease } from '../engine/kit.js';
import { replayOpening } from '../opening.js';

const fmtBytes = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${Math.round(b / 1024)} KB`);
const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`);

// ---------------- live measurements ----------------
const M = { lcp: 0, cls: 0, scrollFrames: [] };
function observe() {
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) M.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) M.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {}
}
function frameSampler(engine) {          // frame times while the page is actually scrolling
  let last = 0, lastY = -1;
  const tick = (t) => {
    const y = engine.lenis ? engine.lenis.scroll : scrollY;
    if (last && y !== lastY && t - last < 250) { M.scrollFrames.push(t - last); if (M.scrollFrames.length > 4000) M.scrollFrames.shift(); }
    last = t; lastY = y;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function measure() {
  const nav = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const size = (e) => Math.max(e.transferSize || 0, e.encodedBodySize || 0);
  const weight = (nav ? size(nav) : 0) + res.reduce((a, e) => a + size(e), 0);
  const third = res.filter((e) => { try { return new URL(e.name).origin !== location.origin; } catch (x) { return false; } }).length;
  const fontFiles = [...document.fonts].filter((f) => f.status === 'loaded');
  const families = new Set(fontFiles.map((f) => f.family.replace(/"/g, '')));
  const fr = M.scrollFrames.slice().sort((a, b) => a - b);
  const median = fr.length > 20 ? fr[Math.floor(fr.length / 2)] : 0;
  return {
    weight: fmtBytes(weight),
    requests: String(res.length + 1),
    load: nav && nav.loadEventEnd ? fmtMs(nav.loadEventEnd) : '—',
    lcp: M.lcp ? fmtMs(M.lcp) : '—',
    cls: M.cls.toFixed(3),
    fps: median ? `${Math.round(1000 / median)} fps` : 'scroll to measure',
    third: String(third),
    cookies: String(document.cookie ? document.cookie.split(';').filter(Boolean).length : 0),
    fonts: `${families.size} families · ${fontFiles.length} files`,
  };
}
let axePromise = null;
function runAxe() {
  if (axePromise) return axePromise;
  axePromise = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'vendor/axe.min.js';
    s.onload = () => {
      window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
        .then((r) => { window.__axe = r; resolve(r); }).catch(() => resolve(null));
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return axePromise;
}

export function init(engine) {
  const section = document.getElementById('sheet-09');
  if (!section) return;
  const stage = section.querySelector('.chapter__stage');
  const set = section.querySelector('.s09__set');
  const slots = [...section.querySelectorAll('.s09__grid > li')];
  const sheet = section.querySelector('.s09__sheet');
  const readSpec = section.querySelector('.s09__read--spec');
  const table = section.querySelector('.s09__table');
  const readEnd = section.querySelector('.s09__read--end');
  const again = section.querySelector('.s09__again');
  const scaleFrom = section.querySelector('.s09__scale-from'), scaleTo = section.querySelector('.s09__scale-to');
  const curtain = document.getElementById('curtain');
  const top = curtain.querySelector('.curtain__panel--top'), bot = curtain.querySelector('.curtain__panel--bottom');
  const point = curtain.querySelector('.sing__point'), line = curtain.querySelector('.sing__line');
  const html = document.documentElement;
  observe(); frameSampler(engine);

  const fill = () => {
    const m = measure();
    for (const [k, v] of Object.entries(m)) { const td = table.querySelector(`tr[data-k="${k}"] td`); if (td && td.textContent !== v) td.textContent = v; }
  };
  let measured = false;
  const measureOnce = () => {
    if (measured) return; measured = true;
    fill();
    runAxe().then((r) => {
      const td = table.querySelector('tr[data-k="a11y"] td');
      if (td) td.textContent = r ? (r.violations.length === 0 ? 'No issues · WCAG 2.1 AA rules' : `${r.violations.length} issue${r.violations.length > 1 ? 's' : ''} · WCAG 2.1 AA rules`) : 'could not run';
    });
  };

  // where the previous sheet lands in the drawing set
  let prevStage = null;
  const slotRect = (i) => { const r = slots[i].getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; };
  let looping = false, endTimer = 0, closingShown = false;

  function render(p) {
    // ---- entry: 1:1 -> 1:5, the previous sheet shrinks into its slot in the set ----
    prevStage = prevStage || document.querySelector('#sheet-08 .chapter__stage');
    const shrink = ease(span(p, 0.05, 0.6));
    if (prevStage) {
      if (p > 0 && p < 1) {
        const r = slotRect(8), vw = stage.clientWidth, sc = 1 + (r.w / vw - 1) * shrink;
        prevStage.style.transformOrigin = '0 0';
        prevStage.style.transform = `translate(${r.x * shrink}px, ${r.y * shrink}px) scale(${sc})`;
        prevStage.style.outline = shrink > 0 ? '1px solid var(--ink)' : '';
      } else { prevStage.style.transform = ''; prevStage.style.outline = ''; }
    }
    set.classList.toggle('is-on', p > 0.08 && p < 0.96);
    scaleFrom.classList.toggle('is-on', p > 0.08 && p < 0.35);
    scaleTo.classList.toggle('is-on', p >= 0.35 && p < 0.96);
    // sheet 09's own slot opens to full size (frame only while it grows; text after)
    const grow = ease(span(p, 0.72, 1));
    if (p < 1) {
      const r = slotRect(9), W = stage.clientWidth, H = stage.clientHeight;
      sheet.style.clipPath = grow > 0 ? `inset(${r.y * (1 - grow)}px ${(W - r.x - r.w) * (1 - grow)}px ${(H - r.y - r.h) * (1 - grow)}px ${r.x * (1 - grow)}px)` : 'inset(50%)';
    } else sheet.style.clipPath = 'none';
    // ---- reading moments ----
    if (p >= 0.9) measureOnce();
    const specOn = p >= 1 && p < 2.6;
    readSpec.classList.toggle('is-on', specOn); table.classList.toggle('is-on', specOn);
    if (specOn) fill();
    readEnd.classList.toggle('is-on', p >= 2.6 && p < 3.45);
    // ---- the end: the line closes, then becomes the point again ----
    if (p >= 3.4 && html.dataset.phase === 'ready') {
      closingShown = true;
      curtain.style.visibility = 'visible'; curtain.style.transform = '';
      const c = ease(span(p, 3.45, 4.2));
      top.style.transform = `translateY(${-100 * (1 - c)}%)`; bot.style.transform = `translateY(${100 * (1 - c)}%)`;
      const shut = c > 0.995;
      stage.style.visibility = shut ? 'hidden' : '';
      html.classList.toggle('is-shut', shut);
      const toPoint = span(p, 4.3, 4.75);
      line.style.opacity = shut && toPoint < 1 ? '1' : '0';
      line.style.transform = `scaleX(${Math.max(0.001, 1 - toPoint)})`;
      point.style.opacity = toPoint > 0.6 ? '1' : '0';
      point.style.animation = toPoint >= 1 ? 'breathe 1.6s ease-in-out infinite alternate' : 'none';
    } else if (closingShown && html.dataset.phase === 'ready') {
      closingShown = false;
      curtain.style.visibility = 'hidden'; stage.style.visibility = ''; html.classList.remove('is-shut');
      line.style.opacity = '0'; point.style.opacity = '0'; point.style.animation = 'none';
    }
    // at the very end: back to the singularity
    clearTimeout(endTimer);
    if (p >= 4.97 && !looping) endTimer = setTimeout(loop, 450);
  }

  function loop() {
    if (looping) return; looping = true;
    replayOpening(engine, () => {
      looping = false; closingShown = false;
      stage.style.visibility = ''; html.classList.remove('is-shut');
    });
  }

  chapter(engine, section, {
    render,
    reduced() {
      readSpec.classList.add('is-on'); table.classList.add('is-on'); readEnd.classList.add('is-on');
      sheet.style.clipPath = 'none';
      if (document.readyState === 'complete') setTimeout(measureOnce, 600);
      else addEventListener('load', () => setTimeout(measureOnce, 600));
    },
  });
  again.addEventListener('click', (e) => { e.preventDefault(); if (engine.reduced) scrollTo({ top: 0 }); else loop(); });
}

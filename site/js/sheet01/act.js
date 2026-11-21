// Act 1 (sheets 00 + 01): the opening holds; the line closes over it at an angle, like a section cut, and while it is
// shut the cut is labelled with the sheet just read; it reopens onto Bell's 1877 plate (reading moment); Fig. 1 then
// redraws itself through the history of the phone, era by era along a years axis, into today's outline, which fills
// into the 3D phone, turns, pulls apart while the cyanotype develops, and holds (reading moment).
// One sticky stage; scroll position -> render(p), 1 unit = one viewport height. Text is either on or off.
import { PhoneScene } from './phone.js';
import { Redraw } from './redraw.js';
import { ERAS, toPaths } from './eras.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// ---- timeline (viewport heights of scroll) ----
const SW0 = 3.95, SWEEP = 0.4, STEP = 0.85, NSW = ERAS.length - 1;   // 8 sweeps: Bell -> ... -> today
export const T = {
  close: [0, 0.9], swap: 0.95, open: [1.05, 1.95], cutAngle: -6,
  plateText: [0.95, 2.9],                     // reading moment 1
  erase: 2.95, move: [2.95, 3.45], bellHold: [3.45, SW0],
  sweepAt: (k) => SW0 + k * STEP,             // sweep k runs [at, at + SWEEP], then era k+1 holds until the next sweep
  history: [3.3, SW0 + (NSW - 1) * STEP + SWEEP + 0.4],
  fill: [10.6, 11.1], turn: [11.1, 12.2], explode: [11.2, 12.45], develop: [11.5, 12.7],
  labels: [12.7, 13.3], finalText: 13.35,     // reading moment 2
  end: 14.65,
};
export const SPANS = { '00': [0, T.swap], '01': [T.swap, T.end + 1] };

function fmtRead(ms) {
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60); return m >= 100 ? '99+ min' : `${m} min ${String(s % 60).padStart(2, '0')} s`;
}

export function initAct1(engine) {
  const { ScrollTrigger } = engine;
  const html = document.documentElement;
  const act = document.getElementById('act-1');
  const stage = act.querySelector('.act__stage');
  const L00 = document.getElementById('sheet-00');
  const L01 = document.getElementById('sheet-01');
  const plateFig = L01.querySelector('.plate');
  const plateImg = L01.querySelector('.plate__img');
  const readPlate = L01.querySelector('.read--plate');
  const readEra = L01.querySelector('.read--era');
  const eraFig = readEra.querySelector('.read__eyebrow'), eraYear = readEra.querySelector('.read__title'), eraLine = readEra.querySelector('.read__body');
  const years = L01.querySelector('.years');
  const marker = years.querySelector('.years__marker'), markerLabel = years.querySelector('.years__label');
  const finalRead = document.getElementById('s01-final');
  const canvas = stage.querySelector('.phone-canvas');
  const curtain = document.getElementById('curtain');
  const top = curtain.querySelector('.curtain__panel--top'), bot = curtain.querySelector('.curtain__panel--bottom');
  const line = curtain.querySelector('.sing__line');
  const edges = [...curtain.querySelectorAll('.curtain__edge')];
  const cut = curtain.querySelector('.cut'), cutRead = curtain.querySelector('.cut__read');
  const frame = L01.querySelector('.frame');

  const phone = new PhoneScene(canvas);
  const redraw = new Redraw(stage.querySelector('.redraw'));
  let P = -1;
  let readStart = 0, readMs = 0;
  engine.on('opening:done', () => { readStart = performance.now(); });

  // ---- the years axis: the opening's ruler comes back, now counting years ----
  const Y0 = 1870, Y1 = 2030;
  function buildYears() {
    const svg = years.querySelector('svg'); const w = years.clientWidth; const ns = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', `0 0 ${w} 30`); svg.innerHTML = '';
    const X = (y) => ((y - Y0) / (Y1 - Y0)) * w;
    const base = document.createElementNS(ns, 'line'); base.setAttribute('x1', 0); base.setAttribute('x2', w); base.setAttribute('y1', 0.5); base.setAttribute('y2', 0.5); svg.appendChild(base);
    const step = w < 500 ? 40 : 20;
    for (let y = Y0; y <= Y1; y += 5) {
      const l = document.createElementNS(ns, 'line'); const big = y % step === 0;
      l.setAttribute('x1', X(y)); l.setAttribute('x2', X(y)); l.setAttribute('y1', 0); l.setAttribute('y2', big ? 9 : y % 10 === 0 ? 5 : 3); svg.appendChild(l);
      if (big) { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', X(y)); t.setAttribute('y', 22); t.setAttribute('text-anchor', 'middle'); t.textContent = y; svg.appendChild(t); }
    }
    years._X = X;
  }

  function layout() {
    const sr = stage.getBoundingClientRect();
    const small = innerWidth < 1024;
    const phoneH = sr.height * (small ? 0.4 : 0.62);
    const cx = small ? 0.5 : 0.4, cy = small ? 0.38 : 0.5;
    phone.resize();
    phone.layout({ cx, cy, heightPx: phoneH });
    phone.set({ shiftXFinal: small ? -40 : -30, zoomAmt: small ? 0.34 : 0.22 });
    redraw.layout(sr, plateImg.getBoundingClientRect(), { cx: cx * sr.width, cy: cy * sr.height, k: phoneH / 154 });
    const fr = frame.getBoundingClientRect();
    phone.set({ frame: [fr.left - sr.left, fr.top - sr.top, fr.width, fr.height] });
    buildYears();
    P = -1; render(current());
  }

  const current = () => (st ? st.progress * T.end : 0);
  let eraShown = -1;
  function showEra(i) {
    if (i === eraShown) return;
    eraShown = i;
    if (i < 0) return;
    const e = ERAS[i];
    eraFig.textContent = `${e.fig} · ${e.scale}`; eraYear.textContent = e.year; eraLine.textContent = e.line;
  }

  function render(p) {
    if (Math.abs(p - P) < 1e-4) return;
    P = p;
    const opening = html.dataset.phase === 'ready';
    // ---- 00 -> 01: the line closes at an angle, like a section cut, and labels the sheet just read ----
    if (opening && p < T.open[1] + 0.02) {
      curtain.style.visibility = 'visible';
      const c = ease(span(p, ...T.close)), o = ease(span(p, ...T.open));
      const shut = p < T.open[0] ? c : 1 - o;
      const ang = T.cutAngle * (p < T.open[0] ? c : 1 - o);
      curtain.style.transform = `rotate(${ang}deg) scale(1.2)`;
      top.style.transform = `translateY(${-100 * (1 - shut)}%)`;
      bot.style.transform = `translateY(${100 * (1 - shut)}%)`;
      line.style.opacity = p > 0.82 && p < 1.12 ? '1' : '0';
      line.style.transform = 'scaleX(1)';
      edges.forEach((e) => { e.style.opacity = shut > 0.002 ? '1' : '0'; });
      if (p < 0.5 && readStart) readMs = performance.now() - readStart;
      const showCut = p > 0.86 && p < 1.09;
      if (showCut && !cut.classList.contains('is-on')) cutRead.textContent = `Sheet 00 · read in ${fmtRead(readMs || 1000)}`;
      cut.classList.toggle('is-on', showCut);
    } else if (opening) {
      curtain.style.visibility = 'hidden';
      curtain.style.transform = '';
      cut.classList.remove('is-on');
    }
    const onPlate = p >= T.swap;
    const shutTight = opening && p > T.close[1] - 0.04 && p < T.open[0] + 0.04;
    L00.style.visibility = onPlate || shutTight ? 'hidden' : 'visible';
    L01.style.visibility = onPlate && !shutTight ? 'visible' : 'hidden';
    stage.classList.toggle('is-shut', shutTight);
    // reading moment 1: the plate and its caption
    readPlate.classList.toggle('is-on', p >= T.plateText[0] && p < T.plateText[1]);
    plateFig.classList.toggle('is-gone', p >= T.erase);
    // ---- the history: one sweep per era, each era holds just long enough to read ----
    const sweeps = Array.from({ length: NSW }, (_, k) => span(p, T.sweepAt(k), T.sweepAt(k) + SWEEP));
    const fl = ease(span(p, ...T.fill));
    redraw.render(span(p, ...T.move), sweeps, onPlate && p >= T.erase && fl < 1);
    redraw.fade(1 - span(fl, 0.4, 1));
    let era = -1;
    if (p >= T.bellHold[0] && p < T.bellHold[1]) era = 0;
    for (let k = 0; k < NSW; k++) {
      const a = T.sweepAt(k) + SWEEP, b = k < NSW - 1 ? T.sweepAt(k + 1) : T.fill[0];
      if (p >= a && p < b) era = k + 1;
    }
    showEra(era);
    readEra.classList.toggle('is-on', era >= 0);
    // the marker slides along the years axis while the drawing changes; its label shows only while it rests
    const inHistory = p >= T.history[0] && p < T.fill[0];
    years.classList.toggle('is-on', inHistory);
    if (inHistory && years._X) {
      let yr = ERAS[0].num;
      for (let k = 0; k < NSW; k++) yr += (ERAS[k + 1].num - ERAS[k].num) * ease(sweeps[k]);
      marker.style.transform = `translateX(${years._X(yr)}px)`;
      markerLabel.textContent = era >= 0 ? ERAS[era].year : '';
    }
    // ---- the phone: fill, turn, explode, develop, labels ----
    canvas.style.opacity = String(fl);
    const tn = ease(span(p, ...T.turn)), ex = ease(span(p, ...T.explode)), dv = span(p, ...T.develop);
    phone.set({ turn: tn, explode: ex, develop: dv, labels: span(p, ...T.labels), zoomOut: tn, shiftX: (phone.state.shiftXFinal || 0) * tn });
    if (fl > 0) phone.render();
    html.classList.toggle('is-blue', p >= T.develop[0] + 0.55 && p < T.end + 0.5);
    finalRead.classList.toggle('is-on', p >= T.finalText && p < T.end - 0.02);
    canvas.classList.toggle('is-live', p >= T.finalText);
  }

  // hover: the concept product's own colour appears only while the pointer is on its screen
  let hovering = false;
  canvas.addEventListener('pointermove', (e) => {
    if (P < T.finalText) return;
    const r = canvas.getBoundingClientRect();
    const hit = phone.hitScreen(e.clientX - r.left, e.clientY - r.top);
    if (hit !== hovering) { hovering = hit; phone.setScreen({ accent: hit }); phone.set({ hover: hit ? 1 : 0 }); phone.render(); }
  });
  canvas.addEventListener('pointerleave', () => { if (hovering) { hovering = false; phone.setScreen({ accent: false }); phone.set({ hover: 0 }); phone.render(); } });

  let st = null;
  if (engine.reduced) {
    // finished state, nothing scrubs: opening, the plate, the history as one sheet, the developed exploded phone
    act.classList.add('is-static');
    html.classList.remove('is-blue');
    readPlate.classList.add('is-on'); finalRead.classList.add('is-on');
    buildStaticHistory();
    const settle = () => {
      const sr = canvas.getBoundingClientRect();
      phone.resize();
      const small = innerWidth < 1024;
      phone.layout({ cx: small ? 0.5 : 0.42, cy: small ? 0.38 : 0.5, heightPx: sr.height * (small ? 0.4 : 0.62) });
      phone.set({ turn: 1, explode: 1, develop: 1, labels: 1, zoomOut: 1, shiftX: small ? -40 : -30, zoomAmt: small ? 0.34 : 0.22, frame: null });
      phone.render(true);
    };
    document.fonts.ready.then(() => { phone.refreshTextures(); settle(); });
    addEventListener('resize', settle);
    return { spans: SPANS };
  }

  st = ScrollTrigger.create({
    trigger: act, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (s) => render(s.progress * T.end),
    onRefresh: () => layout(),
  });
  document.fonts.ready.then(() => { phone.refreshTextures(); layout(); });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  return { spans: SPANS, trigger: st };
}

/** reduced motion: the whole history laid out as one finished sheet */
function buildStaticHistory() {
  const host = document.getElementById('s01-history');
  if (!host) return;
  const ns = 'http://www.w3.org/2000/svg';
  const list = host.querySelector('.hist__list');
  ERAS.forEach((e, i) => {
    const li = document.createElement('li'); li.className = 'hist__item';
    if (e.key === 'bell') {
      li.innerHTML = '<img class="hist__img" src="media/plates/bell-us186787-fig1.webp" alt="Fig. 1 of US Patent 186,787: Bell\'s box telephone with its speaking tube.">';
    } else {
      const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'hist__svg'); svg.setAttribute('viewBox', '-60 -80 120 160'); svg.setAttribute('aria-hidden', 'true');
      const shapes = e.key === 'today' ? null : e.shapes();
      const ds = shapes ? toPaths(shapes, 0, 0, e.s * 0.9) : [
        'M-26.6 -55.4H26.6Q33.3 -55.4 33.3 -48.8V48.8Q33.3 55.4 26.6 55.4H-26.6Q-33.3 55.4 -33.3 48.8V-48.8Q-33.3 -55.4 -26.6 -55.4Z',
        'M-24.9 -53H24.9Q30.6 -53 30.6 -47.3V47.3Q30.6 53 24.9 53H-24.9Q-30.6 53 -30.6 47.3V-47.3Q-30.6 -53 -24.9 -53Z'];
      ds.forEach((d) => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); svg.appendChild(p); });
      li.appendChild(svg);
    }
    const t = document.createElement('div'); t.className = 'hist__text';
    t.innerHTML = `<p class="mono hist__fig">${e.fig} · ${e.scale}</p><p class="display hist__year">${e.year}</p><p class="hist__line">${e.line}</p>`;
    li.appendChild(t); list.appendChild(li);
  });
}

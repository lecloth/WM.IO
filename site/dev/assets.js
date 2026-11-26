// Asset sheet, round 8: a contents list; (1) the hallway at phone size (the way in A, treatment B: the real walk, one
// Walk control and a Play for the way in); (2) the door with the real lock (its own Walk: to the door and through it);
// (3) "Cut to the chase": the hyperdrive at phone size (Play, and a scrubber); (4) the final room's three calls to
// action, on this sheet (its own markup, read from the built page, three times); (5) phone A, live; (6) the two real
// phones, live (git-ignored files: "file missing" without them); (7) Send A. A Print switch shows everything light or
// dark. One cell = 19.2 px. Round 8 removed ways in B and C and treatments A and C.
import { Phone } from '../js/page01/phone.js';
import { PhonePair, PHONES } from '../js/phones/realphones.js';
import { createLive } from '../js/page01/live.js';
import { createDive, STOPS, DOOR, WAY_IN, OPEN_AT, FRAMES_IN } from '../js/page01/dive.js';
import { drawHyperdrive, HYPER_MS } from '../js/engine/hyperdrive.js';
import { CTAS, CTA_DESIGN, initCta } from '../js/page02/cta.js';
import { LIGHT } from '../js/engine/tokens.js';
import { snapHeights, seatText } from '../js/engine/grid.js';

const params = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const isDark = () => document.documentElement.dataset.theme === 'dark';
const onPage = (k, pick) => (k === pick ? '<p class="mono on-page" style="margin-top:6px">On the page · until Wajih picks</p>' : '<p class="mono" style="color:var(--graphite);margin-top:6px">Candidate</p>');

// ---------- (1) the hallway and (2) the door: each card is the real hallway at phone size ----------
function hallCard(host, { tag, title, note }) {
  const el = document.createElement('article'); el.className = 'card divecard';
  el.innerHTML = `<div class="divecard__stage"><div class="divecard__page"><h3 class="divecard__h">Now, how can we serve you?</h3></div>
      <div class="p1-dive on"></div><div class="p1-dive-top on"></div><span class="card__tag mono" style="z-index:6">${tag}</span></div>
    <h3>${tag} · ${title}</h3><p>${note}</p><p class="mono on-page" style="margin-top:6px">On the page</p>`;
  host.append(el);
  const stage = el.querySelector('.divecard__stage'), h = el.querySelector('.divecard__h');
  const dive = createDive(el.querySelector('.p1-dive'), el.querySelector('.p1-dive-top'), { base: '../' });
  let q = 0;
  const draw = (v = q) => { q = v; const r = dive.render(q); if (!r) return; h.style.opacity = q > 0.004 ? '0' : '1'; };
  const layout = () => { const sr = stage.getBoundingClientRect(), u = sr.width / 20; dive.layout(sr.width, sr.height, { u, strip: 2 * u, noTitleblock: true }); draw(); };
  dive.onBeat(() => draw());
  return { dive, draw, layout, q: () => q, ready: document.fonts.ready.then(() => dive.load('../')).then(() => { layout(); return dive.loadPhones('../'); }).then(() => draw()) };
}
const hall = hallCard($('#rowC'), { tag: 'H', title: 'The hallway', note: 'A white sketch drawn into depth dresses into the dark hall; the spotlights come on and the frames appear; scrolling is walking; each frame swings out fully on its hinge as you reach it and folds back as you pass.' });
const doorCard = hallCard($('#rowD'), { tag: 'D', title: 'The shut door, with its lock', note: 'Centred in the end wall, two panels, shut. Its lock: a back plate, a lever above a keyhole, on the right edge strip between the panels, at handle height. The walk ends in front of it.' });
// (1b) canvas 2's layers, spread (the same drawing as the hallway's, as an SVG)
import('../js/page01/corridor-drawings.js').then(({ FRAMES, toSVG }) => { const host = $('#layers'); if (host) host.innerHTML = FRAMES.map((f, i) => `<article class="card"><div class="layercard">${toSVG(f.draw, { pad: 24 })}</div><h3>${i + 1} · ${f.caption}</h3><p class="mono on-page" style="margin-top:6px">On the page · frame ${i + 1} · ${f.fig}</p></article>`).join(''); });
const diveIn = $('#dive'), doorIn = $('#door');
const D0 = DOOR.walk[0] - 0.02;
const drawDives = () => { hall.draw(+diveIn.value / 1000); doorCard.draw(D0 + (DOOR.end - D0) * (+doorIn.value / 1000)); };   // the door's walk ends in front of the shut door
diveIn.addEventListener('input', drawDives); doorIn.addEventListener('input', drawDives);
// play the way in: the slider runs from the page through the sketch, the dressing and the lights to the frames (all scrubbed by the scroll on the page)
let playRaf = 0;
$('#play').addEventListener('click', () => {
  cancelAnimationFrame(playRaf); const t0 = performance.now(), to = FRAMES_IN[1] + 0.005, ms = 3600;
  const step = () => { const u = Math.min(1, (performance.now() - t0) / ms), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; diveIn.value = String(Math.round(e * to * 1000)); drawDives(); if (u < 1) playRaf = requestAnimationFrame(step); };
  playRaf = requestAnimationFrame(step);
});
addEventListener('resize', () => [hall, doorCard].forEach((c) => c.layout()));
const dives = [hall, doorCard];

// ---------- (3) "Cut to the chase": the hyperdrive at phone size ----------
{
  const cv = $('#hyper'), stage = cv.parentElement, scrub = $('#hyperT');
  const paint = (t) => {
    const r = stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 3), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const cs = getComputedStyle(document.documentElement);
    drawHyperdrive(cv.getContext('2d'), w, h, t, { u: (r.width / 20) * dpr, px1: Math.max(1, Math.round(dpr)), dpr, paper: cs.getPropertyValue('--paper').trim(), inkRgb: cs.getPropertyValue('--ink-rgb').trim(), dark: isDark() });
  };
  let raf = 0;
  $('#hyperPlay').addEventListener('click', () => {
    cancelAnimationFrame(raf); const t0 = performance.now();
    const step = () => { const t = Math.min(1, (performance.now() - t0) / HYPER_MS); scrub.value = String(Math.round(t * 1000)); paint(t); if (t < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  });
  scrub.addEventListener('input', () => paint(+scrub.value / 1000));
  addEventListener('resize', () => paint(+scrub.value / 1000));
  document.fonts.ready.then(() => paint(+scrub.value / 1000));
  window.__hyperCard = { paint };
}

// ---------- (3) page 2's calls to action, on this sheet ----------
const CTA_NOTES = {
  A: 'The beacon pulses on the first box until the first tick, then glides to “Next: your details”.',
  B: 'The room opens on the line and the beacon alone; tapping the beacon reveals the task list (scrolling on does too).',
  C: 'No beacon: the big line, and the boxes pulse once, one after another, when the task list comes into view.',
};
(async () => {
  let html = '';
  for (let n = 0; n < 5 && !html; n++) { try { html = await (await fetch(n ? `../index.html?r=${n}` : '../index.html')).text(); } catch (e) { await new Promise((r) => setTimeout(r, 200 * (n + 1))); } }
  const src = new DOMParser().parseFromString(html, 'text/html').getElementById('page-07');
  Object.keys(CTAS).forEach((k) => {
    const el = document.createElement('article'); el.className = 'card';
    el.innerHTML = `<div class="ctacard__stage"></div><h3>${k} · ${CTAS[k]}</h3><p>${CTA_NOTES[k]}</p>${onPage(k, CTA_DESIGN)}`;
    $('#rowT').append(el);
    const sec = document.importNode(src, true);
    // its own ids (three copies on one sheet)
    sec.removeAttribute('id'); sec.querySelectorAll('[id]').forEach((n) => { n.id = `${n.id}-${k}`; });
    sec.querySelectorAll('[aria-describedby]').forEach((n) => n.setAttribute('aria-describedby', `${n.getAttribute('aria-describedby')}-${k}`));
    sec.querySelectorAll('[aria-labelledby]').forEach((n) => n.setAttribute('aria-labelledby', `${n.getAttribute('aria-labelledby')}-${k}`));
    sec.querySelectorAll('.rv').forEach((n) => n.classList.add('on'));
    el.querySelector('.ctacard__stage').append(sec);
    const stage = sec.querySelector('.p2__stage');
    sec.querySelectorAll('.p2-row').forEach((row) => row.querySelector('input').addEventListener('change', (e) => { row.classList.toggle('is-on', e.target.checked); }));
    initCta(stage, { design: k, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, onNext: () => {} });
    sec.querySelectorAll('.p2-ans__t').forEach((a) => seatText(a, 0.5));
  });
  snapHeights(document);
})();

// ---------- (3) phone A, (4) the real phones ----------
const turn = $('#turn');
const card = (host, { key, title, note, credit = '', tag = '', wide = false, label }) => {
  const el = document.createElement('article'); el.className = `card${wide ? ' card--wide' : ''}`;
  el.innerHTML = `<div class="card__stage"><canvas role="img" aria-label="${label}"></canvas>
    <span class="card__tag mono">${key}</span>${tag ? `<span class="card__pend mono">${tag}</span>` : ''}</div>
    <h3>${key} · ${title}</h3><p>${note}</p>${credit ? `<dl class="mono">${credit}</dl>` : ''}`;
  host.append(el); return el;
};
const elA = card($('#rowA'), { key: 'A', title: 'Ours, product shot', label: "Today's phone, ours, assembled, in real materials",
  note: 'The six named pieces, assembled: a brushed titanium band between polished chamfers, tight bezels, cover glass with a clear coat, a chamfered camera plateau.',
  credit: '<dt>Light</dt><dd><a href="https://polyhaven.com/a/studio_small_09" rel="noopener">Poly Haven, Studio Small 09</a>, CC0</dd><dt>Band</dt><dd><a href="https://ambientcg.com/view?id=Metal059A" rel="noopener">ambientCG Metal 059 A</a>, CC0</dd><dt>Model</dt><dd>Ours (code)</dd>',
  tag: 'On page 1' });
const phoneA = new Phone(elA.querySelector('canvas'), { mediaBase: '../media/materials/' });
const stageA = elA.querySelector('.card__stage');
const elR = card($('#rowR'), { key: 'R', title: 'iPhone 18 Pro Max · Galaxy S26 Ultra', wide: true, label: 'An iPhone 18 Pro Max and a Galaxy S26 Ultra, side by side, running our booking app',
  note: 'Real models (Sketchfab downloads), compressed for phones, logos removed. On screen: our made-up booking app. Live in the hallway’s frame 5 (above) and later on the apps trip.',
  credit: '<dt>Files</dt><dd>site/media/phones-unverified/ (git-ignored)</dd><dt>Licence</dt><dd>Unverified · local only</dd>', tag: 'Licence unverified · local only' });
const stageR = elR.querySelector('.card__stage');
const pair = new PhonePair(elR.querySelector('canvas'), { base: '../' });
let missing = null;
pair.ready.then((m) => {
  missing = m;
  if (m.length) stageR.insertAdjacentHTML('beforeend', `<p class="card__wait mono">File missing: ${m.map((k) => `${PHONES[k].name} (site/media/phones-unverified/${PHONES[k].file})`).join(', ')}</p>`);
  draw();
});
const live = createLive();
function draw() {
  const yaw = +turn.value / 100 * Math.PI;
  { const w = stageA.clientWidth, h = stageA.clientHeight;
    if (phoneA.W !== w || phoneA.H !== h) phoneA.resize(w, h);
    phoneA.set({ explodeEach: phoneA.parts.map(() => 0), yaw, pitch: 0.1, fit: { top: 56, bottom: 48, left: 44, right: 44 } });
    phoneA.looks({ xray: 0, ground: 1, built: 1, real: 1 });
    phoneA.tilt(live.now.yaw, live.now.pitch); phoneA.render(); }
  { const w = stageR.clientWidth, h = stageR.clientHeight;
    if (pair.W !== w || pair.H !== h) pair.resize(w, h);
    pair.frame({ top: 56, bottom: 48, left: 28, right: 28 });
    pair.set({ yaw, pitch: 0.1 }); pair.tilt(live.now.yaw, live.now.pitch); pair.render(); }
}
live.onChange(() => draw()); live.gain(1);
turn.addEventListener('input', draw);
addEventListener('resize', draw);
if (params.has('turn')) turn.value = params.get('turn');

// ---------- the Print switch: light / dark everywhere on the sheet ----------
function paintTheme() {
  $('#print-v').textContent = isDark() ? 'Dark' : 'Light';
  dives.forEach((d) => { d.dive.theme(); d.draw(); }); window.__hyperCard?.paint(+$('#hyperT').value / 1000);
  const ink = isDark() ? 0xEDEEF0 : 0x121212; phoneA.setInk(ink);
  draw();
}
$('#print').addEventListener('click', () => {
  const d = !isDark(); if (d) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('wm:theme', d ? 'dark' : 'light'); } catch (e) {}
  paintTheme();
});

document.fonts.ready.then(() => { phoneA.refreshScreen(LIGHT.ink, LIGHT.paper, LIGHT.graphite); pair.app.userData.redraw(); draw(); });
const ready = () => Promise.all([phoneA.ready, pair.ready, ...dives.map((d) => d.ready)]).then(() => { phoneA.warm(); draw(); drawDives(); return { missing, phones: dives.map((d) => d.dive.phones()) }; });
const divesReady = () => Promise.all(dives.map((d) => d.ready));
$('#print-v').textContent = isDark() ? 'Dark' : 'Light';
ready(); draw();
window.__assets = { ready, draw, turn, live, dive: diveIn, door: doorIn, drawDives, divesReady, pair, phoneA, dives, hall, doorCard, diveApi: hall.dive, paintTheme, STOPS, DOOR };

// ---------- (2b) page 3, into the lock: the real scene at phone size ----------
import('../js/page03/lockworld.js').then(({ createLockWorld }) => {
  const cv = document.getElementById('lockC'), sl = document.getElementById('lockS'); if (!cv) return;
  const w = createLockWorld(cv, { base: '../' }), st = cv.parentElement;
  const lay = () => { const r = st.getBoundingClientRect(), u = r.width / 20; w.layout(r.width, r.height, { u, strip: 2 * u, tbTop: r.height }); w.render(+sl.value / 1000); };
  w.load().then(lay); sl.addEventListener('input', () => w.render(+sl.value / 1000)); addEventListener('resize', lay);
});

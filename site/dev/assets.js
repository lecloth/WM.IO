// Asset sheet: (1) the finished phone, version A (ours, the exploded-ready phone at product-shot quality) next to the
// B candidates (free human-made models, site/js/page01/phoneb.js), side by side at phone size on the same paper, in the
// same studio light. All live: they follow the pointer (desktop) or the phone's tilt (Android); one Turn control.
// (2) The dive's corridor sheets (site/js/page01/dive.js), (3) the Send designs (iframes, in assets.html).
import { Phone } from '../js/page01/phone.js';
import { PhoneB, MODELS } from '../js/page01/phoneb.js';
import { createLive } from '../js/page01/live.js';
import { createDive, measureDot } from '../js/page01/dive.js';
import { SETS, PICK as PICK_SET } from '../js/page01/dive-sets.js';

const sheet = document.getElementById('sheet'), turn = document.getElementById('turn');
const params = new URLSearchParams(location.search);
const card = (key, title, note, credit, tag) => {
  const el = document.createElement('section'); el.className = 'card'; el.setAttribute('aria-label', `${key}: ${title}`);
  el.innerHTML = `<div class="card__stage"><canvas role="img" aria-label="Today's phone, ${title}"></canvas>
    <span class="card__tag mono">${key}</span>${tag ? `<span class="card__pend mono">${tag}</span>` : ''}</div>
    <h2>${key} · ${title}</h2><p>${note}</p><dl class="mono">${credit}</dl>`;
  sheet.append(el);
  return el;
};
const cards = [];
{
  const el = card('A', 'Ours, product shot', 'The six named pieces, assembled: brushed titanium band with bevelled edges, black glass back under a clear coat, cover glass, keys, a plain camera bump with coated lenses, a soft shadow. Studio HDRI light, filmic tone mapping.',
    '<dt>Light</dt><dd><a href="https://polyhaven.com/a/studio_small_09" rel="noopener">Poly Haven, Studio Small 09</a>, CC0</dd><dt>Band</dt><dd><a href="https://ambientcg.com/view?id=Metal059A" rel="noopener">ambientCG Metal 059 A</a>, CC0</dd><dt>Model</dt><dd>Ours (code)</dd>',
    'On page 1 · pending pick');
  const phone = new Phone(el.querySelector('canvas'), { mediaBase: '../media/materials/' });
  cards.push({ el, phone, stage: el.querySelector('.card__stage'), ours: true });
}
MODELS.forEach((m) => {
  const el = card(m.key, m.title, m.note, `<dt>Model</dt><dd><a href="${m.page}" rel="noopener">${m.credit}</a></dd><dt>Licence</dt><dd>${m.licence}</dd>`, m.file ? '' : 'Needs Wajih’s download');
  if (!m.file) { el.querySelector('.card__stage').insertAdjacentHTML('beforeend', `<p class="card__wait mono">Waiting for the file: ${m.saveAs}</p>`); return; }
  const phone = new PhoneB(el.querySelector('canvas'), m, { base: '../' });
  cards.push({ el, phone, stage: el.querySelector('.card__stage') });
});

const live = createLive();
function draw() {
  const yaw = +turn.value / 100 * Math.PI;
  cards.forEach(({ phone, stage, ours }) => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (phone.W !== w || phone.H !== h) phone.resize(w, h);
    const fit = { top: 56, bottom: 48, left: 44, right: 44 };
    if (ours) { phone.set({ explodeEach: phone.parts.map(() => 0), yaw, pitch: 0.1, fit }); phone.looks({ xray: 0, ground: 1, built: 1, real: 1 }); }
    else phone.set({ yaw, pitch: 0.1, fit });
    phone.tilt(live.now.yaw, live.now.pitch);
    phone.render();
  });
}
live.onChange(() => draw());
live.gain(1);
turn.addEventListener('input', draw);
addEventListener('resize', draw);
document.fonts.ready.then(() => { cards.forEach(({ phone, ours }) => ours && phone.refreshScreen()); draw(); });
const ready = () => Promise.all(cards.map((c) => c.phone.ready)).then(() => { cards.forEach((c) => c.phone.warm?.()); draw(); return true; });
ready();
if (params.has('turn')) turn.value = params.get('turn');
draw();
// ---------- the dive: each corridor set at phone size, the real dive code, one Dive control ----------
const divesEl = document.getElementById('dives'), diveIn = document.getElementById('dive');
const dives = Object.entries(SETS).map(([key, set]) => {
  const el = document.createElement('article'); el.className = 'divecard';
  el.innerHTML = `<div class="divecard__stage"><h3 class="divecard__h">Now, what do you need?</h3>
      <div class="p1-dive on"></div>
      <div class="divecard__end"><b>What do you need?</b><i>A website</i><i>An app</i><i>My systems are a mess</i><i>AI working for me</i><i>Keep it secure</i></div>
      <div class="p1-dive-top on"></div></div>
    <h3>${key.toUpperCase()} · ${set.name}</h3><p>${set.note}</p>
    <ol>${set.sheets.map((s) => `<li><a href="${s.url}" rel="noopener">${s.credit}</a></li>`).join('')}</ol>
    <p class="mono">Public domain${key === PICK_SET ? ' · on page 1 · pending pick' : ''}</p>`;
  divesEl.append(el);
  const stage = el.querySelector('.divecard__stage'), end = el.querySelector('.divecard__end');
  const d = createDive(el.querySelector('.p1-dive'), el.querySelector('.p1-dive-top'), key);
  return { stage, end, d, h: el.querySelector('.divecard__h') };
});
function layoutDives() {
  dives.forEach((v) => {
    const sr = v.stage.getBoundingClientRect(), m = measureDot(v.h); if (!m) return;
    v.d.layout(sr.width, sr.height, { x: m.x - sr.left, y: m.y - sr.top, r: m.r });
  });
  drawDives();
}
function drawDives() {
  const q = +diveIn.value / 1000;
  dives.forEach(({ d, end }) => {
    const r = d.render(q); if (!r) return;
    end.style.transformOrigin = r.origin;
    end.style.transform = `scale(${r.scale.toFixed(5)}) translate(${r.ox.toFixed(2)}px, ${r.oy.toFixed(2)}px)`;
    end.style.clipPath = r.clip ? `circle(${(r.r / r.scale).toFixed(2)}px at ${(r.vx - r.ox).toFixed(2)}px ${(r.vy - r.oy).toFixed(2)}px)` : '';
  });
}
diveIn.addEventListener('input', drawDives);
addEventListener('resize', layoutDives);
document.fonts.ready.then(() => Promise.all(dives.map((v) => v.d.load('../'))).then(layoutDives));
window.__assets = { ready, draw, turn, live, dive: diveIn, drawDives, divesReady: () => document.fonts.ready.then(() => Promise.all(dives.map((v) => v.d.load('../')))).then(layoutDives) };

// Asset sheet, round 5: (1) the hallway's three looks (A architect's model, B gallery, C engineering lab), each the
// real dive at phone size, walked together by one Dive control; (2) page 2's three calls to action (cta.html, one
// frame each); (3) page 1's three grounds (page-01.css's own .p1[data-ground] rules, Bell's plate as a sheet, the
// finished phone A rendered once and placed on each); (4) phone A, live; (5) the two real phones, live (git-ignored
// files: "file missing" without them); (6) Send A. A Print switch shows everything light or dark.
import { Phone } from '../js/page01/phone.js';
import { PhonePair, PHONES } from '../js/phones/realphones.js';
import { createLive } from '../js/page01/live.js';
import { createDive, measureDot } from '../js/page01/dive.js';
import { LOOKS, HALL } from '../js/page01/hall-looks.js';
import { CTAS, CTA_DESIGN } from '../js/page02/cta.js';
import { GROUNDS, GROUND, PHONE_SHADOW } from '../js/page01/grounds.js';

const params = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const isDark = () => document.documentElement.dataset.theme === 'dark';
const onPage = (k, pick) => (k === pick ? '<p class="mono on-page" style="margin-top:6px">On the page · until Wajih picks</p>' : '<p class="mono" style="color:var(--graphite);margin-top:6px">Candidate</p>');

// ---------- (1) the hallway: three looks ----------
const HALL_NOTES = {
  A: { note: 'White card walls and floor like an architect’s scale model, open to the light above; real soft shadows; thin black metal frames. Still ink on paper: the drafting grid printed on the card, the edges as hairlines.',
    credit: '<dt>Card</dt><dd><a href="https://ambientcg.com/view?id=Paper001" rel="noopener">ambientCG Paper 001</a>, CC0</dd><dt>Light</dt><dd><a href="https://polyhaven.com/a/studio_small_09" rel="noopener">Poly Haven Studio Small 09</a>, CC0, + a key light</dd>' },
  B: { note: 'Plaster walls and ceiling, a pale oak floor, a picture light over each frame casting a soft pool. Matte black wood frames.',
    credit: '<dt>Plaster</dt><dd><a href="https://ambientcg.com/view?id=Plaster002" rel="noopener">ambientCG Plaster 002</a>, CC0</dd><dt>Oak</dt><dd><a href="https://polyhaven.com/a/laminate_floor_03" rel="noopener">Poly Haven Laminate Floor 03</a>, CC0 (levels lifted to pale oak)</dd>' },
  C: { note: 'Concrete walls, floor and ceiling, brushed steel frames, a precise grid of ceiling light strips (plain bright fixtures, no glow).',
    credit: '<dt>Concrete</dt><dd><a href="https://ambientcg.com/view?id=Concrete034" rel="noopener">ambientCG Concrete 034</a>, CC0</dd><dt>Light</dt><dd>Poly Haven Studio Small 09, CC0, + a key light</dd>' },
};
const rowC = $('#rowC'), diveIn = $('#dive');
const dives = ['A', 'B', 'C'].map((key) => {
  const el = document.createElement('article'); el.className = 'card divecard';
  el.innerHTML = `<div class="divecard__stage"><h3 class="divecard__h">Now, what do you need?</h3>
      <div class="p1-dive on"></div>
      <div class="divecard__end"><b>What do you need?</b><i>A website</i><i>An app</i><i>My systems are a mess</i><i>AI working for me</i><i>Keep it secure</i></div>
      <div class="p1-dive-top on"></div><span class="card__tag mono" style="z-index:6">${key}</span></div>
    <h3>${key} · ${LOOKS[key].name}</h3><p>${HALL_NOTES[key].note}</p><dl class="mono">${HALL_NOTES[key].credit}</dl>${onPage(key, HALL)}`;
  rowC.append(el);
  const stage = el.querySelector('.divecard__stage'), end = el.querySelector('.divecard__end'), h = el.querySelector('.divecard__h');
  const dive = createDive(el.querySelector('.p1-dive'), el.querySelector('.p1-dive-top'), { base: '../', look: key });
  const draw = () => {
    const r = dive.render(+diveIn.value / 1000); if (!r) return;
    end.style.transformOrigin = r.origin;
    end.style.transform = `scale(${r.scale.toFixed(5)}) translate(${r.ox.toFixed(2)}px, ${r.oy.toFixed(2)}px)`;
    end.style.clipPath = r.clip ? `circle(${(r.r / r.scale).toFixed(2)}px at ${(r.vx - r.ox).toFixed(2)}px ${(r.vy - r.oy).toFixed(2)}px)` : '';
  };
  const layout = () => { const sr = stage.getBoundingClientRect(), m = measureDot(h); if (!m) return; dive.layout(sr.width, sr.height, { x: m.x - sr.left, y: m.y - sr.top, r: m.r }); draw(); };
  dive.onBeat(() => draw());
  return { key, dive, draw, layout, ready: document.fonts.ready.then(() => dive.load('../')).then(() => { layout(); return dive.loadPhones('../'); }).then(() => draw()) };
});
const drawDives = () => dives.forEach((d) => d.draw());
diveIn.addEventListener('input', drawDives);
addEventListener('resize', () => dives.forEach((d) => d.layout()));

// ---------- (2) page 2's call to action: three demos ----------
const CTA_NOTES = {
  A: 'The beacon pulses on the first box until the first tap, then glides to “Next: your slip”, which takes you down to the work slip.',
  B: 'Page 2 opens on the line and the beacon alone; tapping the beacon reveals the rows (scrolling on reveals them too, so nothing stops the scroll).',
  C: 'No beacon: the big line, and the five boxes pulse once, one after another, when the rows come into view.',
};
const rowT = $('#rowT');
const ctaFrames = Object.keys(CTAS).map((k) => {
  const el = document.createElement('article'); el.className = 'card frame384';
  el.innerHTML = `<iframe title="Page 2, call to action ${k}: ${CTAS[k]}"></iframe><h3>${k} · ${CTAS[k]}</h3><p>${CTA_NOTES[k]}</p>${onPage(k, CTA_DESIGN)}`;
  rowT.append(el); return { k, f: el.querySelector('iframe') };
});
const loadCtas = () => ctaFrames.forEach(({ k, f }) => { f.src = `cta.html?cta=${k}${isDark() ? '&theme=dark' : ''}`; });

// ---------- (3) page 1's grounds ----------
const G_NOTES = {
  A: 'The same clean drafting paper and fine grid as the hallway and page 2: the whole site is one paper.',
  B: 'Near-white, no grid; soft real shadows under the plate and the phone.',
  C: 'A bright, unaged real paper scan (ambientCG Paper 001, CC0), almost white.',
};
const rowG = $('#rowG');
const grounds = Object.keys(GROUNDS).map((k) => {
  const el = document.createElement('article'); el.className = 'card gcard';
  el.innerHTML = `<section class="p1" data-ground="${k}">
      <div class="p1__stage"><div class="p1-txt on"><p class="p1-txt__eyebrow mono">A. G. Bell · US 186,787 · 1877</p><h3 class="p1-txt__h display">It began on paper.</h3></div>
        <figure class="p1__plate"><img src="../media/plates/bell-us186787-sheet1.webp" alt="Bell's 1877 patent drawing, on its own scanned paper" width="1600" height="1740"></figure>
        <p class="p1__credit mono">Plate: US Patent 186,787 · public domain</p><span class="card__pend mono">${k}</span></div>
      <div class="p1__stage"><img class="gphone" alt="The finished phone on the ground"><div class="p1-txt on"><h3 class="p1-txt__h display">…to serve you.</h3></div></div>
    </section><h3>${k} · ${GROUNDS[k]}</h3><p>${G_NOTES[k]}</p>${onPage(k, GROUND)}`;
  rowG.append(el); return { k, img: el.querySelector('.gphone') };
});
// the finished phone, rendered once per ground (its shadow differs) on an offscreen canvas of the stage's size
const gCanvas = document.createElement('canvas'); gCanvas.width = 384; gCanvas.height = 734; gCanvas.style.cssText = 'position:fixed;left:-9999px;top:0;width:384px;height:734px';
document.body.append(gCanvas);
const gPhone = new Phone(gCanvas, { mediaBase: '../media/materials/' });
function shootGrounds() {
  gPhone.resize(384, 734);
  const ink = isDark() ? 0xF2F0EB : 0x121212; gPhone.setInk(ink);
  grounds.forEach((g) => {
    gPhone.shadowK = PHONE_SHADOW[g.k];
    gPhone.set({ explodeEach: gPhone.parts.map(() => 0), yaw: 0.45, pitch: 0.1, fit: { top: 130, bottom: 70, left: 40, right: 40 } });
    gPhone._looks = ''; gPhone.looks({ xray: 1, ground: 1, built: 1, real: 1 });
    g.img.src = gPhone.snapshot();
  });
}

// ---------- (4) phone A, (5) the real phones ----------
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
  note: 'Real models (Sketchfab downloads), compressed for phones, logos removed. On screen: our made-up booking app. Live in the hallway’s frame 4 (above) and later on page 4’s apps trip.',
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
  dives.forEach((d) => { d.dive.theme(); d.draw(); });
  const ink = isDark() ? 0xF2F0EB : 0x121212; phoneA.setInk(ink);
  shootGrounds(); loadCtas(); draw();
}
$('#print').addEventListener('click', () => {
  const d = !isDark(); if (d) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('wm:theme', d ? 'dark' : 'light'); } catch (e) {}
  paintTheme();
});

document.fonts.ready.then(() => { phoneA.refreshScreen(); gPhone.refreshScreen(); pair.app.userData.redraw(); draw(); shootGrounds(); });
const ready = () => Promise.all([phoneA.ready, gPhone.ready, pair.ready, ...dives.map((d) => d.ready)]).then(() => { phoneA.warm(); gPhone.warm(); shootGrounds(); draw(); drawDives(); return { missing, phones: dives.map((d) => d.dive.phones()) }; });
const divesReady = () => Promise.all(dives.map((d) => d.ready));
loadCtas(); $('#print-v').textContent = isDark() ? 'Dark' : 'Light';
ready(); draw();
window.__assets = { ready, draw, turn, live, dive: diveIn, drawDives, divesReady, pair, phoneA, dives, diveApi: dives[0].dive, shootGrounds, paintTheme };

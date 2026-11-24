// Asset sheet, round 4: (1) phone A (ours, raised to the premium bar), live; (2) the two real phones (iPhone 18 Pro
// Max, Galaxy S26 Ultra), live in 3D side by side, running our booking app; their files are git-ignored (licences
// unverified, local only), so the card says "file missing" without them; (3) the corridor at phone size with its Dive
// control (the real dive code); (4) Send A in an iframe (assets.html). One Turn control and the pointer / tilt (live.js)
// turn both phone cards.
import { Phone } from '../js/page01/phone.js';
import { PhonePair, PHONES } from '../js/phones/realphones.js';
import { createLive } from '../js/page01/live.js';
import { createDive, measureDot } from '../js/page01/dive.js';

const params = new URLSearchParams(location.search);
const turn = document.getElementById('turn');
const card = (host, { key, title, note, credit = '', tag = '', wide = false, label }) => {
  const el = document.createElement('article'); el.className = `card${wide ? ' card--wide' : ''}`;
  el.innerHTML = `<div class="card__stage"><canvas role="img" aria-label="${label}"></canvas>
    <span class="card__tag mono">${key}</span>${tag ? `<span class="card__pend mono">${tag}</span>` : ''}</div>
    <h3>${key} · ${title}</h3><p>${note}</p>${credit ? `<dl class="mono">${credit}</dl>` : ''}`;
  host.append(el); return el;
};

// (1) phone A
const elA = card(document.getElementById('rowA'), { key: 'A', title: 'Ours, product shot', label: "Today's phone, ours, assembled, in real materials",
  note: 'The six named pieces, assembled. Band: flat brushed titanium between two polished 45° chamfers. Bezels: a black mask under the cover glass, 0.8 mm all round. Camera: a chamfered plateau, rings, inner lens elements, a cover glass on each lens.',
  credit: '<dt>Light</dt><dd><a href="https://polyhaven.com/a/studio_small_09" rel="noopener">Poly Haven, Studio Small 09</a>, CC0</dd><dt>Band</dt><dd><a href="https://ambientcg.com/view?id=Metal059A" rel="noopener">ambientCG Metal 059 A</a>, CC0</dd><dt>Model</dt><dd>Ours (code)</dd>',
  tag: 'On page 1' });
const phoneA = new Phone(elA.querySelector('canvas'), { mediaBase: '../media/materials/' });
const stageA = elA.querySelector('.card__stage');

// (2) the real phones
const elR = card(document.getElementById('rowR'), { key: 'R', title: 'iPhone 18 Pro Max · Galaxy S26 Ultra', wide: true, label: 'An iPhone 18 Pro Max and a Galaxy S26 Ultra, side by side, running our booking app',
  note: 'Real models (Sketchfab downloads), compressed for phones, logos removed. On screen: our made-up booking app. In frame 4 of the corridor as a still; live here, and later on page 4’s apps trip.',
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
  {
    const w = stageA.clientWidth, h = stageA.clientHeight;
    if (phoneA.W !== w || phoneA.H !== h) phoneA.resize(w, h);
    phoneA.set({ explodeEach: phoneA.parts.map(() => 0), yaw, pitch: 0.1, fit: { top: 56, bottom: 48, left: 44, right: 44 } });
    phoneA.looks({ xray: 0, ground: 1, built: 1, real: 1 });
    phoneA.tilt(live.now.yaw, live.now.pitch); phoneA.render();
  }
  {
    const w = stageR.clientWidth, h = stageR.clientHeight;
    if (pair.W !== w || pair.H !== h) pair.resize(w, h);
    pair.frame({ top: 56, bottom: 48, left: 28, right: 28 });
    pair.set({ yaw, pitch: 0.1 }); pair.tilt(live.now.yaw, live.now.pitch); pair.render();
  }
}
live.onChange(() => draw()); live.gain(1);
turn.addEventListener('input', draw);
addEventListener('resize', draw);
document.fonts.ready.then(() => { phoneA.refreshScreen(); pair.app.userData.redraw(); draw(); });
const ready = () => Promise.all([phoneA.ready, pair.ready]).then(() => { phoneA.warm(); draw(); return { missing }; });
ready();
if (params.has('turn')) turn.value = params.get('turn');
draw();

// (3) the corridor, at phone size
const rowC = document.getElementById('rowC'), diveIn = document.getElementById('dive');
const elC = document.createElement('article'); elC.className = 'card divecard';
elC.innerHTML = `<div class="divecard__stage"><h3 class="divecard__h">Now, what do you need?</h3>
    <div class="p1-dive on"></div>
    <div class="divecard__end"><b>What do you need?</b><i>A website</i><i>An app</i><i>My systems are a mess</i><i>AI working for me</i><i>Keep it secure</i></div>
    <div class="p1-dive-top on"></div></div>
  <h3>The corridor</h3><p>Four frames, our own schematics as cyanotype blueprints: optimizing, the right algorithm, understanding your customers, apps for iPhone and Android. Method, never results: no numbers, no claims. The lines under them are drafts.</p>
  <p class="mono" style="color:var(--graphite);margin-top:6px">On page 1 · about 2 screens</p>`;
rowC.append(elC);
const cStage = elC.querySelector('.divecard__stage'), cEnd = elC.querySelector('.divecard__end'), cH = elC.querySelector('.divecard__h');
const dive = createDive(elC.querySelector('.p1-dive'), elC.querySelector('.p1-dive-top'), { base: '../' });
function layoutDive() {
  const sr = cStage.getBoundingClientRect(), m = measureDot(cH); if (!m) return;
  dive.layout(sr.width, sr.height, { x: m.x - sr.left, y: m.y - sr.top, r: m.r });
  drawDive();
}
function drawDive() {
  const r = dive.render(+diveIn.value / 1000); if (!r) return;
  cEnd.style.transformOrigin = r.origin;
  cEnd.style.transform = `scale(${r.scale.toFixed(5)}) translate(${r.ox.toFixed(2)}px, ${r.oy.toFixed(2)}px)`;
  cEnd.style.clipPath = r.clip ? `circle(${(r.r / r.scale).toFixed(2)}px at ${(r.vx - r.ox).toFixed(2)}px ${(r.vy - r.oy).toFixed(2)}px)` : '';
}
dive.onBeat(() => drawDive());
diveIn.addEventListener('input', drawDive);
addEventListener('resize', layoutDive);
const divesReady = () => document.fonts.ready.then(() => dive.load('../')).then(layoutDive);
divesReady();
window.__assets = { ready, draw, turn, live, dive: diveIn, drawDives: drawDive, divesReady, pair, phoneA, diveApi: dive };

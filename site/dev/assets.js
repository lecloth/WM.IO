// Asset sheet, round 6: (1) the hallway (look A, the only one now: looks B and C and grounds B and C are gone), the real
// dive at phone size with its museum labels, walked by one Dive control; (2) page 2's three calls to action (cta.html,
// one frame each; Wajih's pick is still open); (3) phone A, live; (4) the two real phones, live (git-ignored files:
// "file missing" without them); (5) Send A. A Print switch shows everything light or dark. One cell = 19.2 px (a
// 384 px card holds 20, as the S23 does).
import { Phone } from '../js/page01/phone.js';
import { PhonePair, PHONES } from '../js/phones/realphones.js';
import { createLive } from '../js/page01/live.js';
import { createDive, measureDot } from '../js/page01/dive.js';
import { LOOKS, HALL } from '../js/page01/hall-looks.js';
import { CTAS, CTA_DESIGN } from '../js/page02/cta.js';
import { LIGHT } from '../js/engine/tokens.js';

const params = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const isDark = () => document.documentElement.dataset.theme === 'dark';
const onPage = (k, pick) => (k === pick ? '<p class="mono on-page" style="margin-top:6px">On the page · until Wajih picks</p>' : '<p class="mono" style="color:var(--graphite);margin-top:6px">Candidate</p>');
const U = 19.2;

// ---------- (1) the hallway: look A ----------
const rowC = $('#rowC'), diveIn = $('#dive');
const dives = [HALL].map((key) => {
  const el = document.createElement('article'); el.className = 'card divecard';
  el.innerHTML = `<div class="divecard__stage"><h3 class="divecard__h">Now, what do you need?</h3>
      <div class="p1-dive on"></div>
      <div class="divecard__end"><b>What do you need?</b><i>A website</i><i>An app</i><i>My systems are a mess</i><i>AI working for me</i><i>Keep it secure</i></div>
      <div class="p1-dive-top on"></div><span class="card__tag mono" style="z-index:6">${key}</span></div>
    <h3>${key} · ${LOOKS[key].name}</h3><p>White card walls and floor like an architect’s scale model, open to the light above; real soft shadows; thin black metal frames. The site’s grid printed on the card, continued from the hallway’s mouth; the edges as hairlines.</p>
    <dl class="mono"><dt>Card</dt><dd><a href="https://ambientcg.com/view?id=Paper001" rel="noopener">ambientCG Paper 001</a>, CC0 (printed in grey)</dd><dt>Light</dt><dd><a href="https://polyhaven.com/a/studio_small_09" rel="noopener">Poly Haven Studio Small 09</a>, CC0, + a key light</dd></dl>
    <p class="mono on-page" style="margin-top:6px">On the page</p>`;
  rowC.append(el);
  const stage = el.querySelector('.divecard__stage'), end = el.querySelector('.divecard__end'), h = el.querySelector('.divecard__h');
  const dive = createDive(el.querySelector('.p1-dive'), el.querySelector('.p1-dive-top'), { base: '../' });
  const draw = () => {
    const r = dive.render(+diveIn.value / 1000); if (!r) return;
    end.style.transformOrigin = r.origin;
    end.style.transform = `scale(${r.scale.toFixed(5)}) translate(${r.ox.toFixed(2)}px, ${r.oy.toFixed(2)}px)`;
    end.style.clipPath = r.clip ? `circle(${(r.r / r.scale).toFixed(2)}px at ${(r.vx - r.ox).toFixed(2)}px ${(r.vy - r.oy).toFixed(2)}px)` : '';
  };
  const layout = () => { const sr = stage.getBoundingClientRect(), m = measureDot(h); if (!m) return; dive.layout(sr.width, sr.height, { x: m.x - sr.left, y: m.y - sr.top, r: m.r }, { u: sr.width / 20, strip: 2 * sr.width / 20, noTitleblock: true }); draw(); };
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
  const ink = isDark() ? 0xEDEEF0 : 0x121212; phoneA.setInk(ink);
  loadCtas(); draw();
}
$('#print').addEventListener('click', () => {
  const d = !isDark(); if (d) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('wm:theme', d ? 'dark' : 'light'); } catch (e) {}
  paintTheme();
});

document.fonts.ready.then(() => { phoneA.refreshScreen(LIGHT.ink, LIGHT.paper, LIGHT.graphite); pair.app.userData.redraw(); draw(); });
const ready = () => Promise.all([phoneA.ready, pair.ready, ...dives.map((d) => d.ready)]).then(() => { phoneA.warm(); draw(); drawDives(); return { missing, phones: dives.map((d) => d.dive.phones()) }; });
const divesReady = () => Promise.all(dives.map((d) => d.ready));
loadCtas(); $('#print-v').textContent = isDark() ? 'Dark' : 'Light';
ready(); draw();
window.__assets = { ready, draw, turn, live, dive: diveIn, drawDives, divesReady, pair, phoneA, dives, diveApi: dives[0].dive, paintTheme };

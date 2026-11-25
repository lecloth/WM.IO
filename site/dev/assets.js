// Asset sheet, round 7: a contents list; (1) the three ways into the hallway, (2) the three treatments of its drawings,
// each the real hallway at phone size; (3) page 2's three calls to action, on this sheet (page 2's own markup, read
// from the built page, three times); (4) phone A, live; (5) the two real phones, live (git-ignored files: "file
// missing" without them); (6) Send A. A Print switch shows everything light or dark. One cell = 19.2 px.
import { Phone } from '../js/page01/phone.js';
import { PhonePair, PHONES } from '../js/phones/realphones.js';
import { createLive } from '../js/page01/live.js';
import { createDive, TRANSITIONS, TREATMENTS, TRANSITION, TREATMENT, STOPS } from '../js/page01/dive.js';
import { CTAS, CTA_DESIGN, initCta } from '../js/page02/cta.js';
import { LIGHT } from '../js/engine/tokens.js';
import { snapHeights, seatText } from '../js/engine/grid.js';

const params = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const isDark = () => document.documentElement.dataset.theme === 'dark';
const onPage = (k, pick) => (k === pick ? '<p class="mono on-page" style="margin-top:6px">On the page · until Wajih picks</p>' : '<p class="mono" style="color:var(--graphite);margin-top:6px">Candidate</p>');

// ---------- (1) the ways in and (2) the drawings: each card is the real hallway at phone size ----------
function hallCard(host, { tag, title, note, pick, key, transition, treatment }) {
  const el = document.createElement('article'); el.className = 'card divecard';
  el.innerHTML = `<div class="divecard__stage"><div class="divecard__page"><h3 class="divecard__h">Now, what do you need?</h3></div>
      <div class="p1-dive on"></div>
      <div class="divecard__end"><b>What do you need?</b><i>A website</i><i>An app</i><i>My systems are a mess</i><i>AI working for me</i><i>Keep it secure</i><i>A look that fits my business</i></div>
      <div class="p1-dive-top on"></div><span class="card__tag mono" style="z-index:6">${tag}</span></div>
    <h3>${tag} · ${title}</h3><p>${note}</p>${onPage(key, pick)}`;
  host.append(el);
  const stage = el.querySelector('.divecard__stage'), page = el.querySelector('.divecard__page'), end = el.querySelector('.divecard__end'), h = el.querySelector('.divecard__h');
  const dive = createDive(el.querySelector('.p1-dive'), el.querySelector('.p1-dive-top'), { base: '../', transition, treatment });
  let q = 0;
  const draw = (v = q) => {
    q = v; const r = dive.render(q); if (!r) return;
    end.style.visibility = r.page2 ? '' : 'hidden';
    end.style.transformOrigin = r.origin; end.style.transform = `scale(${r.scale.toFixed(5)})`;
    page.style.transformOrigin = r.stage ? r.stage.origin : ''; page.style.transform = r.stage ? r.stage.transform : '';
    h.style.opacity = q > 0.004 ? '0' : '1';
  };
  const layout = () => { const sr = stage.getBoundingClientRect(), u = sr.width / 20; dive.layout(sr.width, sr.height, { u, strip: 2 * u, noTitleblock: true, cutY: Math.ceil((h.getBoundingClientRect().bottom - sr.top) / u) * u + u }); draw(); };
  dive.onBeat(() => draw());
  return { dive, draw, layout, ready: document.fonts.ready.then(() => dive.load('../')).then(() => { layout(); return dive.loadPhones('../'); }).then(() => draw()) };
}
const TR_NOTES = {
  A: 'The page’s flat grid is the hallway’s end wall at first; it recedes and the walls, floor and ceiling unfold behind it, on the same grid.',
  B: 'A hairline along the grid line under the question; the hallway opens from it, up and down.',
  C: 'The page pushes into one grid square in the middle of the screen; the square opens into the hallway.',
};
const TM_NOTES = {
  A: 'Printed straight on the wall (blue, white lines, its edges on the wall’s grid). At each rest the view turns to face it squarely.',
  B: 'A bare blueprint sheet, no frame, swings off the wall on its hinge to face you (round 4’s move).',
  C: 'A bare sheet pinned flat on the wall, a hairline shadow under it; the view turns to face it, as in A.',
};
const trCards = Object.keys(TRANSITIONS).map((k) => hallCard($('#rowTr'), { tag: k, title: TRANSITIONS[k], note: TR_NOTES[k], pick: TRANSITION, key: k, transition: k, treatment: TREATMENT }));
const tmCards = Object.keys(TREATMENTS).map((k) => hallCard($('#rowC'), { tag: k, title: TREATMENTS[k], note: TM_NOTES[k], pick: TREATMENT, key: k, transition: TRANSITION, treatment: k }));
const diveIn = $('#dive');
const drawDives = () => tmCards.forEach((c) => c.draw(+diveIn.value / 1000));
diveIn.addEventListener('input', drawDives);
// play the way in: back to the start, then into the opening line (each transition is its own timed beat)
$('#play').addEventListener('click', () => { trCards.forEach((c) => c.draw(0)); requestAnimationFrame(() => trCards.forEach((c) => c.draw(0.1))); });
addEventListener('resize', () => [...trCards, ...tmCards].forEach((c) => c.layout()));
const dives = [...trCards, ...tmCards];

// ---------- (3) page 2's calls to action, on this sheet ----------
const CTA_NOTES = {
  A: 'The beacon pulses on the first box until the first tap, then glides to “Next: your slip”.',
  B: 'Page 2 opens on the line and the beacon alone; tapping the beacon reveals the rows (scrolling on does too).',
  C: 'No beacon: the big line, and the boxes pulse once, one after another, when the rows come into view.',
};
(async () => {
  let html = '';
  for (let n = 0; n < 5 && !html; n++) { try { html = await (await fetch(n ? `../index.html?r=${n}` : '../index.html')).text(); } catch (e) { await new Promise((r) => setTimeout(r, 200 * (n + 1))); } }
  const src = new DOMParser().parseFromString(html, 'text/html').getElementById('page-02');
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
  draw();
}
$('#print').addEventListener('click', () => {
  const d = !isDark(); if (d) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('wm:theme', d ? 'dark' : 'light'); } catch (e) {}
  paintTheme();
});

document.fonts.ready.then(() => { phoneA.refreshScreen(LIGHT.ink, LIGHT.paper, LIGHT.graphite); pair.app.userData.redraw(); draw(); });
const ready = () => Promise.all([phoneA.ready, pair.ready, ...dives.map((d) => d.ready)]).then(() => { phoneA.warm(); draw(); drawDives(); trCards.forEach((c) => c.draw(0.1)); return { missing, phones: dives.map((d) => d.dive.phones()) }; });
const divesReady = () => Promise.all(dives.map((d) => d.ready));
$('#print-v').textContent = isDark() ? 'Dark' : 'Light';
ready(); draw();
window.__assets = { ready, draw, turn, live, dive: diveIn, drawDives, divesReady, pair, phoneA, dives, trCards, tmCards, diveApi: tmCards[0].dive, paintTheme, STOPS };

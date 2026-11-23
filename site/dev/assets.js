// Asset sheet: page 1's finished phone in each material option (site/js/page01/materials.js), side by side at phone
// size, on the same real paper, with the same light. One "Turn" control rotates all three, to see the band and the back.
import { Phone } from '../js/page01/phone.js';
import { OPTIONS, PICK, SOURCES } from '../js/page01/materials.js';

const sheet = document.getElementById('sheet'), turn = document.getElementById('turn');
const link = (id) => `<a href="https://ambientcg.com/view?id=${id}" rel="noopener">${SOURCES[id]}</a>`;
const cards = Object.entries(OPTIONS).map(([k, o]) => {
  const el = document.createElement('section'); el.className = 'card'; el.setAttribute('aria-label', `Option ${k}: ${o.name}`);
  el.innerHTML = `<div class="card__stage"><canvas role="img" aria-label="Today's phone in ${o.name.toLowerCase()}"></canvas>
    <span class="card__tag mono">Option ${k}</span>${k === PICK ? '<span class="card__pend mono">On page 1 · picked</span>' : ''}</div>
    <h2>${k} · ${o.name}</h2><p>${o.note}</p>
    <dl class="mono"><dt>Band</dt><dd>${link(o.frame.set)}</dd><dt>Back</dt><dd>${link(o.back.set)}</dd></dl>`;
  sheet.append(el);
  const phone = new Phone(el.querySelector('canvas'), { option: k, mediaBase: '../media/materials/' });
  return { el, phone, stage: el.querySelector('.card__stage') };
});

function draw() {
  const yaw = +turn.value / 100 * Math.PI;
  cards.forEach(({ phone, stage }) => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (phone.W !== w || phone.H !== h) phone.resize(w, h);
    phone.set({ explodeEach: phone.parts.map(() => 0), yaw, pitch: 0.1, fit: { top: 56, bottom: 40, left: 40, right: 40 } });
    phone.looks({ xray: 0, ground: 1, built: 1, real: 1 });
    phone.render();
  });
}
turn.addEventListener('input', draw);
addEventListener('resize', draw);
document.fonts.ready.then(() => { cards.forEach(({ phone }) => phone.refreshScreen()); draw(); });
Promise.all(cards.map((c) => c.phone.ready)).then(draw);
draw();
window.__assets = { ready: () => Promise.all(cards.map((c) => c.phone.ready)).then(() => { draw(); return true; }), draw, turn };

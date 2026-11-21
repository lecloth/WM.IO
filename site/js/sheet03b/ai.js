// Sheet 03 · AI. A fresh sheet slides over the lock; Babbage's Plan 25 and a Jacquard card (reading moment); a scan
// sweeps the plate and the engine redraws itself in hairlines on top of it; Lovelace's Note G (reading moment); punched
// cards feed the engine as you scroll; what comes out is a drafted quote for a made-up business, held at a human
// checkpoint (reading moment); then what we build in AI, and AI security (reading moments).
// render(p) is a pure function of p. Text is shown or hidden, never scrubbed; nothing moves while text is up.
import { chapter, span, ease, lerp, rem } from '../engine/kit.js';
import { Engine, PLAN } from './engine.js';

const NS = 'http://www.w3.org/2000/svg';
export const T = {
  entry: [0, 1], plateText: [1.0, 2.5], sweep: [2.6, 3.4], quote: [3.5, 4.85],
  toFeed: [4.9, 5.3], feed: [5.3, 6.55], toOut: [6.6, 7.1], answer: [7.15, 8.6],
  offer: [8.65, 10.0], attack: [10.05, 11.5],   // all text off by p = units (11.5): the next sheet slides over
};
const CARDS = ['the request', 'the price list', 'the stock', 'the calendar', 'the rules'];

export function initAI(engine, section) {
  const stage = section.querySelector('.chapter__stage');
  const sheet = section.querySelector('.s3b__sheet');
  const plan = section.querySelector('.s3b__plate--plan'), card = section.querySelector('.s3b__plate--card');
  const planImg = plan.querySelector('img');
  const svg = section.querySelector('.s3b__draw');
  const defs = svg.querySelector('defs');
  const reads = {
    plate: section.querySelector('.s3b__read--plate'), quote: section.querySelector('.s3b__read--quote'),
    answer: section.querySelector('.s3b__read--answer'), offer: section.querySelector('.s3b__read--offer'), attack: section.querySelector('.s3b__read--attack'),
  };
  const panel = section.querySelector('.s3b__answer');
  const statusEl = section.querySelector('.s3b__status'), statusV = statusEl.querySelector('.s3b__status-v');
  const edge = section.querySelector('.s3b__edge');
  const engG = document.createElementNS(NS, 'g'); engG.setAttribute('class', 's3b-engine');
  const wireG = document.createElementNS(NS, 'g'); wireG.setAttribute('class', 's3b-wire');
  const scan = document.createElementNS(NS, 'line'); scan.setAttribute('class', 's3b-scan');
  svg.append(engG, wireG, scan);
  const eng = new Engine(engG, defs, 'ae');
  let P = -1, cur = 0, poses = null, wire = null, statusText = '', planBox = null;

  // human checkpoint: the buttons work (locally, nothing is sent anywhere)
  const state = panel.querySelector('.ans__state');
  const note = panel.querySelector('.ans__note');
  panel.querySelectorAll('.ans__btn').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.act === 'approve') {
      panel.classList.add('is-approved'); panel.classList.remove('is-editing');
      note.removeAttribute('contenteditable');
      panel.querySelector('[data-act="edit"]').setAttribute('aria-pressed', 'false');
      state.textContent = 'Approved by a person · ready to send (an illustration: nothing leaves this page)';
    } else {
      const on = !panel.classList.contains('is-editing');
      panel.classList.toggle('is-editing', on); panel.classList.remove('is-approved');
      b.setAttribute('aria-pressed', String(on));
      if (on) { note.setAttribute('contenteditable', 'true'); note.focus(); state.textContent = 'Editing · the agent waits for you'; }
      else { note.removeAttribute('contenteditable'); state.textContent = 'Waiting for you · nothing is sent until a person approves'; }
    }
  }));

  function layout() {
    const sr = sheet.getBoundingClientRect();
    const stat = section.classList.contains('is-static');
    const W = sr.width, H = stat ? innerHeight : sr.height, small = innerWidth < 1024;
    svg.setAttribute('viewBox', `0 0 ${W} ${sr.height}`);
    // the engine is built where the plate sits, so the redraw lands on Babbage's own lines
    const pr = planImg.getBoundingClientRect();
    planBox = { x: pr.left - sr.left, y: pr.top - sr.top, w: pr.width, h: pr.height };
    const m = { x: planBox.x, y: planBox.y, s: pr.width / PLAN.w };
    eng.layout(m);
    const pw = PLAN.w * m.s, ph = PLAN.h * m.s;
    // poses: translate + scale of the whole engine group, relative to the plate pose
    const pose = (x, y, w) => { const s = w / pw; return { x: x - m.x * s, y: y - m.y * s, s }; };
    if (small) {
      const w1 = W - 2.5 * rem();
      poses = {
        plate: { x: 0, y: 0, s: 1 },
        feed: pose(1.25 * rem(), H * 0.13, w1),
        out: pose(1.25 * rem(), H * 0.13, w1),
      };
    } else {
      const top0 = stat ? 0 : 0;
      poses = {
        plate: { x: 0, y: 0, s: 1 },
        feed: pose(W * 0.05, top0 + H * 0.47 - (W * 0.64 * ph / pw) / 2, W * 0.64),
        out: pose(W * 0.045, top0 + H * 0.5 - (W * 0.22 * ph / pw) / 2, W * 0.22),
      };
    }
    // the wire from the store's far end to the panel
    const ap = panel.getBoundingClientRect();
    wire = { panel: { x: ap.left - sr.left, y: ap.top - sr.top, w: ap.width, h: ap.height } };
    wireG.textContent = '';
    if (!small) {
      const po = poses.out, ox = po.x + eng.out.x * po.s, oy = po.y + eng.out.y * po.s;
      const px = wire.panel.x, py = wire.panel.y + wire.panel.h * 0.3;
      const mid = ox + (px - ox) * 0.5;
      const d = `M${ox.toFixed(1)} ${oy.toFixed(1)}H${mid.toFixed(1)}V${py.toFixed(1)}H${(px - 6).toFixed(1)}`;
      const path = document.createElementNS(NS, 'path'); path.setAttribute('d', d); wireG.appendChild(path);
      const arrow = document.createElementNS(NS, 'path'); arrow.setAttribute('class', 's3b-arrow');
      arrow.setAttribute('d', `M${(px - 1).toFixed(1)} ${py.toFixed(1)}l-7 -3.5v7z`); wireG.appendChild(arrow);
      wire.path = path; wire.len = path.getTotalLength(); wire.arrow = arrow;
    }
    // the panel's frame draws on before its content appears
    const fr = document.createElementNS(NS, 'rect');
    fr.setAttribute('x', wire.panel.x); fr.setAttribute('y', wire.panel.y); fr.setAttribute('width', wire.panel.w); fr.setAttribute('height', wire.panel.h);
    wireG.appendChild(fr);
    wire.frame = fr; wire.flen = 2 * (wire.panel.w + wire.panel.h);
    P = -1;
    if (!engine.reduced) render(cur);
  }

  function setPose(a, b, t) {
    const x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t), s = lerp(a.s, b.s, t);
    engG.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(4)})`);
  }

  function render(p) {
    cur = p;
    if (Math.abs(p - P) < 1e-4 || !poses) return;
    P = p;
    const e = ease(span(p, ...T.entry));
    sheet.style.transform = e < 1 ? `translate3d(${((1 - e) * 100).toFixed(3)}%, 0, 0)` : '';
    edge.classList.toggle('is-on', e > 0 && e < 1);
    // reading moment 1: the plates
    reads.plate.classList.toggle('is-on', p >= T.plateText[0] && p < T.plateText[1]);
    card.classList.toggle('is-gone', p >= T.plateText[1] + 0.05);
    // the sweep: Babbage's ink is wiped left to right as the hairline engine draws on behind the scan line
    const sw = span(p, ...T.sweep);
    plan.style.clipPath = sw > 0 ? `inset(0 0 0 ${(sw * 100).toFixed(2)}%)` : '';
    plan.classList.toggle('is-gone', sw >= 1);
    const engOn = p >= T.sweep[0];
    engG.style.visibility = engOn ? '' : 'hidden';
    if (engOn) eng.drawOn(span(p, T.sweep[0] + 0.05, T.sweep[1] + 0.05));
    const scanOn = sw > 0 && sw < 1;
    scan.style.visibility = scanOn ? '' : 'hidden';
    if (scanOn) {
      const r = planBox, x = r.x + r.w * sw;
      scan.setAttribute('x1', x); scan.setAttribute('x2', x); scan.setAttribute('y1', r.y - 14); scan.setAttribute('y2', r.y + r.h + 14);
    }
    // reading moment 2: Lovelace, Note G
    reads.quote.classList.toggle('is-on', p >= T.quote[0] && p < T.quote[1]);
    // poses: plate -> feed -> out
    const tf = ease(span(p, ...T.toFeed)), to = ease(span(p, ...T.toOut));
    if (to > 0) setPose(poses.feed, poses.out, to); else setPose(poses.plate, poses.feed, tf);
    // the feed: the cards run through the readers, the wheels turn
    const fd = span(p, ...T.feed);
    eng.feed(ease(fd) * 12);
    const showStatus = p >= T.feed[0] - 0.05 && p < T.toOut[0];
    statusEl.classList.toggle('is-on', showStatus);
    if (showStatus) {
      const s = CARDS.slice(0, Math.max(1, Math.min(CARDS.length, Math.ceil(fd * CARDS.length + 0.001)))).join(' · ');
      if (s !== statusText) { statusText = s; statusV.textContent = s; }
    }
    // out: the wire runs to the panel, its frame draws, then the drafted quote (reading moment 3)
    const wt = span(p, T.toOut[0] + 0.1, T.toOut[1]);
    if (wire?.path) {
      wire.path.style.strokeDasharray = `${wire.len} ${wire.len}`;
      wire.path.style.strokeDashoffset = String(wire.len * (1 - Math.min(1, wt * 1.6)));
      wire.arrow.style.visibility = wt >= 0.62 ? '' : 'hidden';
      wireG.style.visibility = p >= T.toOut[0] && p < T.offer[0] ? '' : 'hidden';
    } else wireG.style.visibility = p >= T.toOut[0] && p < T.offer[0] ? '' : 'hidden';
    if (wire?.frame) {
      const ft = span(wt, 0.45, 1);
      wire.frame.style.strokeDasharray = `${wire.flen} ${wire.flen}`;
      wire.frame.style.strokeDashoffset = String(wire.flen * (1 - ft));
      wire.frame.style.visibility = ft > 0 && p < T.answer[0] ? '' : 'hidden';
    }
    const ans = p >= T.answer[0] && p < T.answer[1];
    panel.classList.toggle('is-on', ans);
    reads.answer.classList.toggle('is-on', ans);
    // reading moments 4 and 5
    reads.offer.classList.toggle('is-on', p >= T.offer[0] && p < T.offer[1]);
    reads.attack.classList.toggle('is-on', p >= T.attack[0] && p < T.attack[1]);
    section.classList.toggle('is-late', p >= T.offer[0]);
  }

  function reduced() {
    section.classList.add('is-static');
    Object.values(reads).forEach((r) => r.classList.add('is-on'));
    panel.classList.add('is-on');
    requestAnimationFrame(() => {
      layout();
      // the engine, finished, on the second sheet beside the quote
      const sr = sheet.getBoundingClientRect(), small = innerWidth < 1024, H = innerHeight, W = sr.width;
      const pr = planImg.getBoundingClientRect(), pw = pr.width;
      const w = small ? W - 2.5 * rem() : W * 0.5;
      const s = w / pw, tx = (small ? 1.25 * rem() : W * 0.07), ty = H + (small ? H * 0.12 : H * 0.5 - (w * PLAN.h / PLAN.w) / 2);
      const m0x = pr.left - sr.left, m0y = pr.top - sr.top;
      engG.setAttribute('transform', `translate(${(tx - m0x * s).toFixed(1)} ${(ty - m0y * s).toFixed(1)}) scale(${s.toFixed(4)})`);
      engG.style.visibility = '';
      eng.drawOn(1); eng.feed(0);
      wireG.style.visibility = 'hidden'; scan.style.visibility = 'hidden';
    });
  }

  const ch = chapter(engine, section, { render, layout, reduced: () => reduced() });
  if (!engine.reduced) {
    document.fonts.ready.then(() => layout());
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  }
  return ch;
}

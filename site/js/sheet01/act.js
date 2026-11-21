// Act 1: the opening holds, the line closes over it, reopens onto Bell's 1877 plate (reading moment), the plate's
// Fig. 1 redraws itself into today's phone, the phone fills in, turns, pulls apart into labelled layers while the
// cyanotype develops, then holds for the second reading moment. One sticky stage; scroll position -> render(p).
// Units: 1 unit = one viewport height of scroll. Reading moments never have anything moving under the text.
import { PhoneScene } from './phone.js';
import { Redraw } from './redraw.js';
import { drawLofthaul } from './lofthaul.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const expo = (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);

export const T = {
  close: [0, 0.9], swap: 0.95, open: [1.05, 1.95],
  plateText: [0.95, 2.55],                // first reading moment
  erase: [2.6, 2.75], move: [2.75, 3.3], redraw: [3.3, 4.4],
  fill: [4.35, 4.85], turn: [4.85, 6.0], explode: [4.95, 6.2], develop: [5.25, 6.45],
  labels: [6.45, 7.05], finalText: 7.1,  // second reading moment
  end: 8.4,
};
export const SPANS = { '00': [0, T.swap], '01': [T.swap, T.end + 1] };

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
  const finalRead = document.getElementById('s01-final');
  const canvas = stage.querySelector('.phone-canvas');
  const curtain = document.getElementById('curtain');
  const top = curtain.querySelector('.curtain__panel--top'), bot = curtain.querySelector('.curtain__panel--bottom');
  const line = curtain.querySelector('.sing__line');
  const edges = [...curtain.querySelectorAll('.curtain__edge')];
  const frame = L01.querySelector('.frame');

  const phone = new PhoneScene(canvas);
  const redraw = new Redraw(stage.querySelector('.redraw'));
  let P = -1, ready = false;

  function layout() {
    const sr = stage.getBoundingClientRect();
    const small = innerWidth < 1024;
    const phoneH = sr.height * (small ? 0.44 : 0.62);
    const cx = small ? 0.5 : 0.5, cy = small ? 0.43 : 0.52;
    phone.resize();
    phone.layout({ cx, cy, heightPx: phoneH });
    phone.set({ shiftXFinal: small ? -40 : -74, zoomAmt: small ? 0.34 : 0.22 });
    redraw.layout(sr, plateImg.getBoundingClientRect(), { cx: cx * sr.width, cy: cy * sr.height, k: phoneH / 154 });
    const fr = frame.getBoundingClientRect();
    phone.set({ frame: [fr.left - sr.left, fr.top - sr.top, fr.width, fr.height] });
    P = -1; render(current());
  }

  const current = () => (st ? st.progress * T.end : 0);

  function render(p) {
    if (Math.abs(p - P) < 1e-4) return;
    P = p;
    // ---- the line closes over the opening, then reopens onto the plate ----
    const opening = html.dataset.phase === 'ready';
    if (opening && p < T.open[1] + 0.02) {
      curtain.style.visibility = 'visible';
      const c = ease(span(p, ...T.close)), o = ease(span(p, ...T.open));
      const shut = p < T.open[0] ? c : 1 - o;
      top.style.transform = `translateY(${-100 * (1 - shut)}%)`;
      bot.style.transform = `translateY(${100 * (1 - shut)}%)`;
      line.style.opacity = p > 0.82 && p < 1.12 ? '1' : '0';
      edges.forEach((e) => { e.style.opacity = shut > 0.002 ? '1' : '0'; });
      line.style.transform = 'scaleX(1)';
    } else if (opening) {
      curtain.style.visibility = 'hidden';
    }
    const onPlate = p >= T.swap;
    const shutTight = opening && p > T.close[1] - 0.04 && p < T.open[0] + 0.04;   // curtain closed: only the line remains
    L00.style.visibility = onPlate || shutTight ? 'hidden' : 'visible';
    L01.style.visibility = onPlate && !shutTight ? 'visible' : 'hidden';
    stage.classList.toggle('is-shut', shutTight);
    // reading moment 1: the plate and its caption. Text is on or off, never half-faded under motion.
    readPlate.classList.toggle('is-on', p >= T.plateText[0] && p < T.plateText[1]);
    // the plate drops out whole (never half-cut text); Fig. 1 lives on, lifted off the sheet
    plateFig.classList.toggle('is-gone', p >= T.erase[0]);
    const mv = span(p, ...T.move), dr = span(p, ...T.redraw), fl = ease(span(p, ...T.fill));
    redraw.render(mv, dr, onPlate && p >= T.erase[0] && fl < 1);
    redraw.fade(1 - span(fl, 0.4, 1));
    // the phone: fill, turn, explode, develop, labels
    canvas.style.opacity = String(fl);
    const tn = ease(span(p, ...T.turn)), ex = ease(span(p, ...T.explode)), dv = span(p, ...T.develop);
    phone.set({ turn: tn, explode: ex, develop: dv, labels: span(p, ...T.labels), zoomOut: tn, shiftX: (phone.state.shiftXFinal || 0) * tn });
    if (fl > 0) phone.render();
    html.classList.toggle('is-blue', p >= T.develop[0] + 0.55 && p < T.end + 0.5);
    // reading moment 2
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
    // finished state, nothing scrubs: opening, the plate, then the developed exploded phone
    act.classList.add('is-static');
    html.classList.remove('is-blue');
    readPlate.classList.add('is-on'); finalRead.classList.add('is-on');
    const settle = () => {
      const sr = canvas.getBoundingClientRect();
      phone.resize();
      const small = innerWidth < 1024;
      phone.layout({ cx: 0.5, cy: small ? 0.43 : 0.52, heightPx: sr.height * (small ? 0.44 : 0.62) });
      const fr = frame.getBoundingClientRect();
      phone.set({ turn: 1, explode: 1, develop: 1, labels: 1, zoomOut: 1, shiftX: small ? -40 : -74, zoomAmt: small ? 0.34 : 0.22, frame: null });
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
  document.fonts.ready.then(() => { ready = true; phone.refreshTextures(); layout(); });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  return { spans: SPANS, trigger: st };
}

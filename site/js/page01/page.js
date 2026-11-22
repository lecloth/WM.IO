// Page 1 (Enter + hook), scroll-driven. The section is 4 screens tall: its stage stays put while 3 screens of scroll
// play the story, and every swipe changes the middle of the screen:
//   S0  Bell's 1877 plate (the real scan) with a short headline                                   P 0.00 – 0.22
//       the plate turns to a cyanotype negative and its drawing becomes today's phone, as an X-ray    P 0.22 – 0.78
//   S1  the X-ray phone, six pieces apart, each named                                              P 0.78 – 1.06
//       it turns; a scan line dresses it as matte (built); the pieces come together, a tick each;
//       a second scan line dresses it in real materials on real paper                              P 1.06 – 2.62
//   S2  the real phone on paper, its screen asking the next page's question; hand-off to "For you"  P 2.62 – 3.00
// Text lands only at the stops, where nothing moves (every paused frame stays readable).
// Reduced motion: the three finished frames, one after the other, no vibration.
import { Phone } from './phone.js';
import { haptics } from '../engine/haptics.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
function keys(p, k) {
  if (p <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (p <= k[i][0]) return lerp(k[i - 1][1], k[i][1], ease(span(p, k[i - 1][0], k[i][0])));
  return k[k.length - 1][1];
}

export const SCROLL = 3;                                        // screens of scroll inside page 1
export const STOPS = [[0, 0.22], [0.78, 1.06], [2.62, 3.0]];
const NAMES = ['Back', 'Battery', 'Board', 'Frame', 'Screen', 'Glass'];   // back to front

export function initPage01(engine) {
  const sec = document.getElementById('page-01');
  if (!sec) return null;
  const stage = sec.querySelector('.p1__stage');
  const canvas = sec.querySelector('.p1__canvas');
  const leaders = sec.querySelector('.p1__leaders');
  const lctx = leaders.getContext('2d');
  const labelsEl = sec.querySelector('.p1__labels');
  const blue = sec.querySelector('.p1__bg--blue'), real = sec.querySelector('.p1__bg--real');
  const scanA = sec.querySelector('.p1__scan--a'), scanB = sec.querySelector('.p1__scan--b');
  const plateFig = sec.querySelector('.p1__plate');
  // two copies of the plate, each blending on its own: ink on paper (multiply), and its negative on blue (screen)
  const plateA = plateFig.querySelector('img');
  const plateFigB = plateFig.cloneNode(true); plateFigB.classList.add('p1__plate--neg'); plateFigB.setAttribute('aria-hidden', 'true');
  plateFigB.querySelector('img').alt = ''; plateFig.after(plateFigB);
  const plateB = plateFigB.querySelector('img');
  const texts = [...sec.querySelectorAll('.p1-txt')];
  const credit = sec.querySelector('.p1__credit');
  const next = sec.querySelector('.p1-next');

  const phone = new Phone(canvas);
  const labels = phone.parts.map((p) => { const d = document.createElement('div'); d.className = 'p1-lbl'; d.innerHTML = `<b>${p.name}</b>`; labelsEl.append(d); return d; });
  let W = 1, H = 1, band = null, P = -1;
  const seated = phone.parts.map(() => false);

  next?.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.querySelector('#page-02');
    if (t) engine.scrollTo(engine.lenis ? t : t, { duration: 1.4 });
  });

  // ---------- layout: where the picture may sit (never under the text, the strip or the title block) ----------
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    const desktop = W >= 1024;
    phone.resize(W, H);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    leaders.width = Math.round(W * dpr); leaders.height = Math.round(H * dpr);
    const strip = document.getElementById('strip')?.offsetHeight || 40;
    const tb = document.querySelector('.titleblock');
    const tbH = tb ? Math.max(0, innerHeight - tb.getBoundingClientRect().top) : 0;   // from the title block's top edge to the bottom of the screen
    // the stage is 100lvh (it fills the screen when the phone's address bar hides), but while the bar shows, the
    // stage's bottom is off screen: lay everything out inside what is actually visible
    const hidden = Math.max(0, H - innerHeight);
    if (desktop) {
      const textRight = Math.max(...texts.map((t) => t.getBoundingClientRect().right - stage.getBoundingClientRect().left));
      band = { top: strip + 40, bottom: hidden + tbH + 48, left: Math.min(W * 0.5, textRight + 40), right: 48 };
    } else {
      const tallest = Math.max(...texts.map((t) => t.offsetHeight));
      band = { top: strip + 24 + tallest + 16, bottom: hidden + tbH + 20 + 22, left: 16, right: 16 };   // + the plate credit line
    }
    // the plate: contain-fit in the band
    const bw = W - band.left - band.right, bh = H - band.top - band.bottom, a = 1600 / 1740;
    let pw = bw, ph = pw / a; if (ph > bh) { ph = bh; pw = ph * a; }
    [plateFig, plateFigB].forEach((f) => Object.assign(f.style, { left: `${band.left + (bw - pw) / 2}px`, top: `${band.top + (bh - ph) / 2}px`, width: `${pw}px`, height: `${ph}px` }));
    credit.style.top = `${band.top + (bh - ph) / 2 + ph + 6}px`; credit.style.left = `${band.left + (bw - pw) / 2}px`;
    P = -1;
  }

  // ---------- one frame of the story at scroll position p (in screens, 0..3) ----------
  function render(p) {
    // plate -> cyanotype negative -> the phone
    const neg = span(p, 0.3, 0.52), zoom = ease(span(p, 0.4, 0.78)), plateOut = span(p, 0.55, 0.76);
    plateFig.style.opacity = String(1 - neg);
    plateFigB.style.opacity = String(neg * (1 - plateOut));
    plateFigB.style.transform = plateFig.style.transform = `scale(${1 + 0.35 * zoom})`;
    plateFig.style.visibility = neg >= 1 ? 'hidden' : 'visible';
    plateFigB.style.visibility = neg <= 0 || p > 0.78 ? 'hidden' : 'visible';
    credit.style.opacity = String(1 - span(p, 0.22, 0.32));
    const blueIn = span(p, 0.3, 0.52);

    const per = phone.parts.map((_, i) => 1 - ease(span(p, 1.12 + i * 0.2, 1.62 + i * 0.18)));   // back seats first
    const wipeA = ease(span(p, 1.18, 1.78)), wipeB = ease(span(p, 1.92, 2.48));
    phone.parts.forEach((part, i) => { part.e = per[i]; });
    phone.set({
      explodeEach: per,
      yaw: keys(p, [[0.78, -0.95], [1.06, -0.95], [1.9, -0.25], [2.6, 0.3]]),
      pitch: keys(p, [[1.06, 0.3], [2.6, 0.12]]),
      wipeA, wipeB, fit: band, fade: span(p, 0.45, 0.74),
    });
    canvas.style.opacity = p < 0.45 ? '0' : '1';
    // snap ticks (forward only, after the unlock tap; haptics checks reduced motion)
    per.forEach((e, i) => { const s = e <= 0.001; if (s && !seated[i] && p > 1.1) haptics.tick(14); seated[i] = s; });

    // the backgrounds follow the scan lines (blue = drawing, page paper = built, real paper = real)
    const xA = wipeA > 0 && wipeA < 1 ? phone.screenX(phone.wipeX[0]) : wipeA >= 1 ? W + 2 : -2;
    const xB = wipeB > 0 && wipeB < 1 ? phone.screenX(phone.wipeX[1]) : wipeB >= 1 ? W + 2 : -2;
    blue.style.opacity = String(blueIn);
    blue.style.clipPath = `inset(0 0 0 ${clamp(xA, 0, W)}px)`;
    real.style.clipPath = `inset(0 ${clamp(W - xB, 0, W)}px 0 0)`;
    scanA.style.transform = `translateX(${xA}px)`; scanA.style.opacity = wipeA > 0 && wipeA < 1 ? '1' : '0';
    scanB.style.transform = `translateX(${xB}px)`; scanB.style.opacity = wipeB > 0 && wipeB < 1 ? '1' : '0';
    stage.classList.toggle('is-blue', blueIn > 0.5 && wipeA < 0.5);

    // texts and labels: only at the stops
    texts.forEach((t, i) => t.classList.toggle('on', p >= STOPS[i][0] - 1e-4 && p <= STOPS[i][1] + 1e-4));
    const showLabels = p >= STOPS[1][0] && p <= STOPS[1][1];
    drawLabels(showLabels);
    phone.render();
  }

  // names beside each piece, pushed outward from the phone's centre, with hairline leaders
  function drawLabels(on) {
    const dpr = leaders.width / W;
    lctx.clearRect(0, 0, leaders.width, leaders.height);
    labels.forEach((l) => l.classList.toggle('on', on));
    if (!on) return;
    const pts = phone.parts.map((part, i) => { const [x, y] = phone.project(part, 26, i === 1 ? -26 : i === 2 ? 44 : 0, 0); return { i, x, y }; });
    const cx = W >= 1024 ? (band.left + W - band.right) / 2 : W / 2;
    pts.forEach((q) => {
      // labels in a column on the side away from the centre, spaced evenly in the band
      q.side = q.x < cx ? -1 : 1;
    });
    const sides = { '-1': pts.filter((q) => q.side < 0).sort((a, b) => a.y - b.y), '1': pts.filter((q) => q.side > 0).sort((a, b) => a.y - b.y) };
    Object.entries(sides).forEach(([s, list]) => {
      const n = list.length; if (!n) return;
      const top = band.top + 8, bottom = H - band.bottom - 8, gap = Math.min(44, (bottom - top) / n);
      const mid = list.reduce((a, q) => a + q.y, 0) / n;
      list.forEach((q, k) => { q.ly = clamp(mid + (k - (n - 1) / 2) * gap, top + 10, bottom - 10); });
      list.forEach((q) => {
        const el = labels[q.i], w = el.offsetWidth;
        const lx = s < 0 ? Math.max(band.left, 14) : W - Math.max(band.right, 14) - w;
        el.style.transform = `translate(${lx}px, ${q.ly - 11}px)`;
        const ax = s < 0 ? lx + w + 6 : lx - 6;
        lctx.strokeStyle = 'rgba(236,241,246,.85)'; lctx.fillStyle = lctx.strokeStyle; lctx.lineWidth = dpr;
        lctx.beginPath(); lctx.moveTo(ax * dpr, q.ly * dpr); lctx.lineTo(q.x * dpr, q.y * dpr); lctx.stroke();
        lctx.beginPath(); lctx.arc(q.x * dpr, q.y * dpr, 2.2 * dpr, 0, 7); lctx.fill();
      });
    });
  }

  // ---------- reduced motion: the three finished frames, in normal flow ----------
  if (engine.reduced) {
    sec.classList.add('is-static');
    layout(); render(0.9);
    const shot1 = phone.snapshot();
    render(2.9);
    const shot2 = phone.snapshot();
    const frame = (src, alt, txt) => {
      const f = document.createElement('figure'); f.className = 'p1-frame';
      const img = new Image(); img.src = src; img.alt = alt; f.append(img);
      if (txt) f.append(txt);
      return f;
    };
    const list = document.createElement('p'); list.className = 'p1-frame__names mono'; list.textContent = NAMES.slice().reverse().join(' · ');
    plateFig.style.opacity = '1'; plateFig.style.visibility = 'visible'; plateFig.style.transform = 'none';
    const f1 = frame(shot1, "Today's phone as a blue X-ray drawing, its six pieces apart: glass, screen, frame, board, battery, back.", list);
    const f2 = frame(shot2, "Today's phone assembled in real materials on paper; its screen asks: What do you need?");
    f1.classList.add('p1-frame--blue'); f1.prepend(texts[1]);
    stage.append(texts[0], plateFig, credit, f1, texts[2], f2);   // reading order: plate, X-ray, real
    texts.forEach((t) => t.classList.add('on'));
    canvas.hidden = true; leaders.hidden = true; labelsEl.hidden = true;
    return { length: () => sec.offsetHeight / innerHeight };
  }

  // ---------- scroll ----------
  layout();
  const { ScrollTrigger } = engine;
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom',
    onUpdate: (s) => { const p = s.progress * SCROLL; if (Math.abs(p - P) > 1e-5) { P = p; render(p); } },
    onRefresh: (s) => { layout(); P = s.progress * SCROLL; render(P); },
  });
  render(0);
  addEventListener('resize', () => { layout(); render(st.progress * SCROLL); });
  engine.on('theme', () => { render(st.progress * SCROLL); });
  document.fonts?.ready.then(() => { phone.refreshScreen(); layout(); render(st.progress * SCROLL); });

  // for tests: the picture's box on screen, the band, and the stops
  window.__p1 = { phone, stops: STOPS, scroll: SCROLL, yAt: (p) => st.start + (st.end - st.start) * p / SCROLL, box: () => phone.screenBox(), band: () => band, P: () => P, top: () => sec.offsetTop };
  return { length: () => sec.offsetHeight / innerHeight };
}

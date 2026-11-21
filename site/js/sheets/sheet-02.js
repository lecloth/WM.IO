// Sheet 02: Principles. Exact, Felt, Proven, Locked: one idea per screen, each a calm reading moment on a clean sheet,
// each paired with one of Leonardo's machine studies (Codex Madrid I) in the right-hand margin, never behind text.
//
// Entry (p 0 -> 1), "tracing paper slides over": a translucent drafting film slides up over sheet 01's cyanotype (the
// blue shows through, softened) carrying the first study's construction lines, with its mechanism turning; a white
// backing sheet slides in under the film (hard edge), so it reads as clean paper; a scan line inks Leonardo's plate in.
// Between reading moments (text off): a scan traces the plate into hairlines, the hairlines redraw into the next study,
// whose mechanism moves (spring flexes, weight steps along the arm, lock snaps shut), and a scan inks its plate in.
// render(p) is a pure function of p; text is either on or off.
import { chapter, span, ease } from '../engine/kit.js';
import { Plot } from '../sheet04/plot.js';
import { STUDIES, Trace } from '../sheet02/studies.js';

const NS = 'http://www.w3.org/2000/svg';
const READ = [[1.05, 2.25], [3.1, 4.25], [5.1, 6.25], [7.1, Infinity]];
const E = { film: [0, 0.5], back: [0.46, 0.8], spin: [0.7, 0.88], develop: [0.86, 0.99] };
const TR = { b: 0.06, scanA: [0.02, 0.22], scanB: [0.22, 0.42], move: [0.42, 0.78], scanC: [0.78, 0.98], bIn: [0.84, 1] };
const ALL = [-Infinity, Infinity];
const lerp = (a, b, t) => a + (b - a) * t;

export function init(engine) {
  const section = document.getElementById('sheet-02');
  if (!section) return;
  const items = [...section.querySelectorAll('.s02__item')];

  // ---------- reduced motion: four finished principles with their plates ----------
  if (engine.reduced) {
    items.forEach((li, k) => {
      const s = STUDIES[k], d = document.createElement('div');
      d.className = 's02__still'; d.setAttribute('aria-hidden', 'true');
      d.style.setProperty('--src', `url("${new URL(s.src, document.baseURI).href}")`); d.style.aspectRatio = `${s.W} / ${s.H}`;
      li.querySelector('.s02__read').after(d);
      li.classList.add('is-on');
    });
    chapter(engine, section, {});
    return;
  }

  const stage = section.querySelector('.chapter__stage');
  const film = section.querySelector('.s02__film');
  const back = section.querySelector('.s02__back');
  const plates = section.querySelector('.s02__plates');
  const svg = section.querySelector('.s02__fig');
  const scan = section.querySelector('.s02__scan'), scanLabel = scan.querySelector('span');
  const index = section.querySelector('.s02__index'), idx = [...index.querySelectorAll('li')];

  // plates (pixels), construction layers (Plot), mechanism traces (Trace, clipped by the scan in stage px)
  const defs = document.createElementNS(NS, 'defs'); svg.appendChild(defs);
  const S = STUDIES.map((s, k) => {
    const pix = document.createElement('div');
    pix.className = 's02__study'; pix.style.setProperty('--src', `url("${new URL(s.src, document.baseURI).href}")`);
    plates.appendChild(pix);
    const cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', `s02clip${k}`);
    const cr = document.createElementNS(NS, 'rect'); cp.appendChild(cr); defs.appendChild(cp);
    const T = new Trace(svg, s.W, s.H); T.outer.setAttribute('clip-path', `url(#s02clip${k})`);
    const cpb = document.createElementNS(NS, 'clipPath'); cpb.setAttribute('id', `s02bclip${k}`);
    const crb = document.createElementNS(NS, 'rect'); cpb.appendChild(crb); defs.appendChild(cpb);
    const pOuter = document.createElementNS(NS, 'g'); pOuter.setAttribute('clip-path', `url(#s02bclip${k})`); svg.appendChild(pOuter);
    const P = new Plot(pOuter, { w: s.W, h: s.H });
    return { s, pix, cr, crb, T, P, update: s.trace(T), last: {} };
  });

  let W = innerWidth, H = innerHeight, P = -1, box = null;
  function layout() {
    W = innerWidth; H = stage.clientHeight || innerHeight;
    const small = W < 1024;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    box = small ? { x: 2.6 * rem, y: H * 0.115, w: W - 5.2 * rem, h: H * 0.33 } : { x: W * 0.565, y: H * 0.165, w: W * 0.325, h: H * 0.54 };
    S.forEach((o) => {
      o.T.place(box);
      o.P.clear(); o.P.place(box, { font: small ? 9.5 : 10.5 }); o.s.measure(o.P); o.P.measure();
      o.rect = o.T.rect;
      Object.assign(o.pix.style, { left: `${o.rect.x}px`, top: `${o.rect.y}px`, width: `${o.rect.w}px`, height: `${o.rect.h}px` });
      o.cr.setAttribute('y', o.rect.y - 40); o.cr.setAttribute('height', o.rect.h + 80);
      o.crb.setAttribute('y', 0); o.crb.setAttribute('height', H); o.crb.setAttribute('x', 0); o.crb.setAttribute('width', W);
      o.last = {};
    });
    section.style.setProperty('--cap-x', `${box.x}px`);
    section.style.setProperty('--cap-y', `${box.y + box.h + (small ? 0.6 : 1) * rem}px`);
    section.style.setProperty('--cap-w', `${box.w}px`);
    P = -1;
  }

  // visible x-range helpers (stage px)
  const clipPix = (o, r) => {
    const key = r ? `${r[0]}|${r[1]}` : 'off';
    if (o.last.pix === key) return; o.last.pix = key;
    o.pix.classList.toggle('is-on', !!r);
    if (!r) return;
    const L = Math.max(0, r[0] - o.rect.x), R = Math.max(0, o.rect.x + o.rect.w - r[1]);
    o.pix.style.clipPath = L || R ? `inset(0 ${R.toFixed(1)}px 0 ${L.toFixed(1)}px)` : '';
  };
  const clipTrace = (o, r, ph) => {
    const vis = !!r;
    if (o.last.tvis !== vis) { o.T.outer.style.display = vis ? '' : 'none'; o.last.tvis = vis; }
    if (!vis) return;
    const x0 = Math.max(r[0], o.rect.x - 60), x1 = Math.min(r[1], o.rect.x + o.rect.w + 60);
    o.cr.setAttribute('x', x0.toFixed(1)); o.cr.setAttribute('width', Math.max(0, x1 - x0).toFixed(1));
    if (o.last.ph !== ph) { o.update(ph); o.last.ph = ph; }
  };
  const showScan = (x, rects, label) => {
    if (x == null) { scan.classList.remove('is-on'); return; }
    const y0 = Math.min(...rects.map((r) => r.y)) - 16, y1 = Math.max(...rects.map((r) => r.y + r.h)) + 16;
    scan.classList.add('is-on');
    scan.style.setProperty('--x', `${x.toFixed(1)}px`); scan.style.setProperty('--y', `${y0.toFixed(1)}px`);
    scan.style.height = `${(y1 - y0).toFixed(1)}px`;
    if (scanLabel.textContent !== label) scanLabel.textContent = label;
    // the label stays put at the start of the pass (text never slides while visible); only the line moves
    const lx = Math.min(...rects.map((r) => r.x));
    scanLabel.style.transform = `translate3d(${(lx - x).toFixed(1)}px, 0, 0)`;
  };
  const sweep = (t, rects) => {
    const l = Math.min(...rects.map((r) => r.x)) - 12, r = Math.max(...rects.map((q) => q.x + q.w)) + 12;
    return lerp(l, r, ease(t));
  };

  function render(p) {
    if (!box || Math.abs(p - P) < 1e-5) return;
    P = p;
    // ---- entry: film up, backing in ----
    const f = ease(span(p, ...E.film)), b = ease(span(p, ...E.back));
    film.style.transform = f >= 1 ? 'none' : `translate3d(0, ${((1 - f) * 101).toFixed(2)}%, 0)`;
    back.style.transform = b >= 1 ? 'none' : `translate3d(${((1 - b) * 101).toFixed(2)}%, 0, 0)`;   // in from the right
    film.classList.toggle('is-set', p >= 0.99);

    // ---- per study: pixels range, trace range + phase, construction t ----
    const st = S.map(() => ({ pix: null, tr: null, ph: 1, b: 0 }));
    let scanX = null, scanRects = null, scanText = '', backX = 0;
    if (p < READ[0][0]) {
      const o = st[0];
      // the construction lines are on the film, but ink on film only reads once the white backing is behind it:
      // they appear exactly where the backing has arrived (so nothing is ever drawn across sheet 01's text),
      // then the fusee turns, then the scan inks Leonardo's plate in
      o.ph = span(p, ...E.spin);
      o.b = 1;
      backX = W * (1 - b);
      if (p < E.develop[0]) o.tr = [backX, Infinity];
      else if (p < E.develop[1]) {
        const x = sweep(span(p, ...E.develop), [S[0].rect]);
        o.pix = [-Infinity, x]; o.tr = [x, Infinity]; scanX = x; scanRects = [S[0].rect]; scanText = 'Plate';
      } else o.pix = ALL;
    }
    for (let k = 0; k < READ.length; k++) {
      if (p >= READ[k][0] && p < READ[k][1]) { st[k].pix = ALL; st[k].b = 1; }
      if (k === READ.length - 1) break;
      const a = READ[k][1], z = READ[k + 1][0];
      if (p < a || p >= z) continue;
      const t = span(p, a, z), A = S[k].rect, B = S[k + 1].rect;
      const cur = st[k], nxt = st[k + 1];
      cur.b = 1 - span(t, 0, TR.b);
      nxt.b = span(t, ...TR.bIn);
      if (t < TR.scanA[1]) {
        const x = sweep(span(t, ...TR.scanA), [A]);
        cur.pix = [x, Infinity]; cur.tr = [-Infinity, x]; cur.ph = 1; scanX = x; scanRects = [A]; scanText = 'Trace';
      } else if (t < TR.scanB[1]) {
        const x = sweep(span(t, ...TR.scanB), [A, B]);
        cur.tr = [x, Infinity]; cur.ph = 1; nxt.tr = [-Infinity, x]; nxt.ph = 0; scanX = x; scanRects = [A, B]; scanText = 'Redraw';
      } else if (t < TR.scanC[0]) {
        nxt.tr = ALL; nxt.ph = span(t, ...TR.move);
      } else if (t < TR.scanC[1]) {
        const x = sweep(span(t, ...TR.scanC), [B]);
        nxt.tr = [x, Infinity]; nxt.ph = 1; nxt.pix = [-Infinity, x]; scanX = x; scanRects = [B]; scanText = 'Plate';
      } else nxt.pix = ALL;
    }
    const bx = p < E.develop[0] ? backX : 0;
    if (S[0].last.bx !== bx) { S[0].crb.setAttribute('x', bx.toFixed(1)); S[0].crb.setAttribute('width', Math.max(0, W - bx).toFixed(1)); S[0].last.bx = bx; }
    S.forEach((o, k) => {
      clipPix(o, st[k].pix);
      clipTrace(o, st[k].tr, Math.round(st[k].ph * 1000) / 1000);
      o.P.set(st[k].b);
    });
    showScan(scanX, scanRects || [], scanText);

    // ---- reading moments ----
    items.forEach((li, k) => li.classList.toggle('is-on', p >= READ[k][0] && p < READ[k][1]));
    let cur = 0;
    for (let k = 1; k < READ.length; k++) if (p >= (READ[k - 1][1] + READ[k][0]) / 2) cur = k;
    index.classList.toggle('is-on', p >= READ[0][0]);
    idx.forEach((li, k) => li.classList.toggle('is-on', k === cur));
  }

  const ch = chapter(engine, section, { render, layout });
  layout();
  document.fonts.ready.then(() => { layout(); render(ch.progress()); });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); render(ch.progress()); }, 120); });
}

// The Analytical Engine redrawn in hairlines, after Babbage's Plan 25 (1840): the mill (the round central frame and the
// ring of gear columns around it), the store (two rows of variable columns along the rack), three barrels, and the three
// card readers (operation, variable and number cards). Positions follow the plate so the redraw lands on it.
// Built in stage px for the plate's on-screen mapping (so outlines can draw on with dash offsets); later moves are a
// translate + scale of the whole group with non-scaling strokes. Pure functions of their inputs, freeze-safe.
const NS = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f = (n) => n.toFixed(1);
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.appendChild(e); return e; };
const circ = (x, y, r) => `M${f(x + r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x - r)} ${f(y)}A${f(r)} ${f(r)} 0 1 0 ${f(x + r)} ${f(y)}Z`;

// plate px (the cleaned Plan 25 image is 1750 x 1120)
export const PLAN = { w: 1750, h: 1120 };
const MILL = { x: 873, y: 557, r: 182 };
const BARRELS = [[667, 240], [1067, 240], [400, 560]];
const STORE = { y: [469, 637], x0: 1190, step: 53, n: [0, 11], r: 21 };
const READERS = [
  { key: 'op', x: 360, y: 100, w: 140, h: 30, dir: -1, label: 'Operation cards' },
  { key: 'var', x: 1247, y: 109, w: 353, h: 34, dir: 1, label: 'Variable cards' },
  { key: 'num', x: 1253, y: 833, w: 354, h: 34, dir: 1, label: 'Number cards' },
];
// card hole patterns, after the rows of Posselt's Fig. 22 (8 positions per row)
const ROWS = ['11011110', '01111001', '11100111', '00001000', '10000100', '11011111', '01111011', '11100111'];

export class Engine {
  constructor(g, defs, uid) { this.g = g; this.defs = defs; this.uid = uid; }

  /** m: { x, y, s } maps plate px -> stage px (X = x + px * s) */
  layout(m) {
    this.m = m;
    const g = this.g; g.textContent = '';
    this.defs.querySelectorAll(`[id^="${this.uid}"]`).forEach((n) => n.remove());
    const X = (px) => m.x + px * m.s, Y = (py) => m.y + py * m.s, S = (v) => v * m.s;
    this.X = X; this.Y = Y;
    this.lines = [];
    const add = (parent, d, cls = '') => { const p = el('path', { d, class: cls }, parent); this.lines.push(p); return p; };
    const base = el('g', { class: 'en-static' }, g);

    // the mill: a double frame with twelve bosses
    add(base, circ(X(MILL.x), Y(MILL.y), S(MILL.r)));
    add(base, circ(X(MILL.x), Y(MILL.y), S(MILL.r - 9)));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      add(base, circ(X(MILL.x + Math.cos(a) * (MILL.r + 4)), Y(MILL.y + Math.sin(a) * (MILL.r + 4)), S(9)));
    }
    // the rack: from the mill to the far end of the store
    const rk = [548, 566];
    add(base, `M${f(X(MILL.x + MILL.r + 6))} ${f(Y(rk[0]))}H${f(X(1745))}M${f(X(MILL.x + MILL.r + 6))} ${f(Y(rk[1]))}H${f(X(1745))}`);
    let ticks = '';
    for (let x = MILL.x + MILL.r + 14; x < 1745; x += 12) ticks += `M${f(X(x))} ${f(Y(rk[0]))}V${f(Y(rk[0] + 6))}`;
    add(base, ticks, 'en-fine');

    // rotating figure wheels: the ring around the mill and the store's columns
    this.wheels = [];
    const wheel = (x, y, r, teeth, speed, parent = g) => {
      const wg = el('g', { class: 'en-wheel' }, parent);
      add(wg, circ(X(x), Y(y), S(r)));
      let t = '';
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        t += `M${f(X(x + Math.cos(a) * r))} ${f(Y(y + Math.sin(a) * r))}L${f(X(x + Math.cos(a) * (r - 5)))} ${f(Y(y + Math.sin(a) * (r - 5)))}`;
      }
      add(wg, t, 'en-fine');
      add(wg, `M${f(X(x))} ${f(Y(y))}L${f(X(x))} ${f(Y(y - r + 7))}`, 'en-fine');
      this.wheels.push({ g: wg, cx: X(x), cy: Y(y), speed });
    };
    const ringR = MILL.r + 64;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + Math.PI / 18;
      if (Math.cos(a) > 0.86) continue;               // leave the side where the rack runs to the store
      wheel(MILL.x + Math.cos(a) * ringR, MILL.y + Math.sin(a) * ringR * 0.97, 27, 20, i % 2 ? 1 : -1);
    }
    // an inner ring of small pinions between the mill and its columns
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      if (Math.cos(a) > 0.9) continue;
      add(base, circ(X(MILL.x + Math.cos(a) * (MILL.r + 30)), Y(MILL.y + Math.sin(a) * (MILL.r + 30)), S(11)), 'en-fine');
    }
    // the carriages (dotted outlines on the plate) and the counting apparatus
    const dash = (pts) => add(base, 'M' + pts.map(([x, y]) => `${f(X(x))} ${f(Y(y))}`).join('L') + 'Z', 'en-dash');
    dash([[455, 300], [330, 330], [300, 420], [430, 470], [470, 400]]);
    dash([[455, 820], [330, 790], [300, 700], [430, 650], [470, 720]]);
    dash([[1300, 280], [1210, 250], [1170, 330], [1260, 400]]);
    dash([[1430, 385], [1490, 300], [1550, 385]]);
    add(base, circ(X(1490), Y(420), S(24)));
    // the store: two rows of variable columns
    STORE.y.forEach((y, row) => {
      const n = row === 0 ? 9 : 11, x0 = row === 0 ? STORE.x0 + 2 * STORE.step : STORE.x0;
      for (let i = 0; i < n; i++) wheel(x0 + i * STORE.step, y, STORE.r, 10, ((i * 7 + row * 3) % 5) - 2.2);
    });
    // barrels (the engine's internal programme drums) with their studs
    BARRELS.forEach(([x, y]) => {
      add(base, circ(X(x), Y(y), S(40)));
      let st = '';
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; st += `M${f(X(x + Math.cos(a) * 40))} ${f(Y(y + Math.sin(a) * 40))}L${f(X(x + Math.cos(a) * 50))} ${f(Y(y + Math.sin(a) * 50))}`; }
      add(base, st, 'en-fine');
      add(base, circ(X(x), Y(y), S(6)), 'en-fine');
    });

    // card readers: a prism on an axle; the chain of cards runs into it
    let c_track = null;
    this.chains = READERS.map((r, ri) => {
      const rg = el('g', {}, base);
      add(rg, `M${f(X(r.x))} ${f(Y(r.y - r.h / 2))}H${f(X(r.x + r.w))}V${f(Y(r.y + r.h / 2))}H${f(X(r.x))}Z`);
      add(rg, `M${f(X(r.x - 22))} ${f(Y(r.y))}H${f(X(r.x))}M${f(X(r.x + r.w))} ${f(Y(r.y))}H${f(X(r.x + r.w + 22))}`, 'en-fine');
      add(rg, `M${f(X(r.x + 8))} ${f(Y(r.y - r.h / 2))}V${f(Y(r.y + r.h / 2))}M${f(X(r.x + r.w - 8))} ${f(Y(r.y - r.h / 2))}V${f(Y(r.y + r.h / 2))}`, 'en-fine');
      // the chain: cards hang below the prism (above it for the number cards) and slide along a track into it
      const below = r.key !== 'num';
      const cw = 30, ch = 96, pitch = 36;
      const y0 = below ? r.y + r.h / 2 + 8 : r.y - r.h / 2 - 8 - ch;
      const tx0 = r.key === 'op' ? 40 : r.x + 6, tx1 = r.key === 'op' ? r.x + r.w - 6 : 1745;
      const cp = el('clipPath', { id: `${this.uid}-c${ri}` }, this.defs);
      el('rect', { x: X(tx0), y: Y(y0 - 2), width: S(tx1 - tx0), height: S(ch + 4) }, cp);
      // the track: two rails the cards run between
      add(rg, `M${f(X(tx0))} ${f(Y(y0 - 3))}H${f(X(tx1))}M${f(X(tx0))} ${f(Y(y0 + ch + 3))}H${f(X(tx1))}`, 'en-fine');
      const cg = el('g', { 'clip-path': `url(#${this.uid}-c${ri})` }, rg);
      const n = Math.ceil((tx1 - tx0) / pitch) + 2;
      const cards = [];
      for (let i = 0; i < n; i++) {
        const c = el('g', { class: 'en-card' }, cg);
        el('path', { d: `M${f(X(0))} ${f(Y(y0))}H${f(X(cw))}V${f(Y(y0 + ch))}H${f(X(0))}Z` }, c);
        let holes = '';
        // lacing holes top and bottom, then nine rows of three positions, after Fig. 22's rows
        holes += circ(X(cw / 2), Y(y0 + 6), S(2.2)) + circ(X(cw / 2), Y(y0 + ch - 6), S(2.2));
        for (let j = 0; j < 9; j++) {
          const row = ROWS[(i * 3 + j + ri * 5) % ROWS.length];
          for (let q = 0; q < 3; q++) if (row[(q * 3 + i) % 8] === '1') holes += circ(X(7 + q * 8), Y(y0 + 16 + j * 8.2), S(2.6));
        }
        el('path', { d: holes, class: 'en-hole' }, c);
        cards.push(c);
      }
      c_track = { tx0, tx1 };
      return { r, cards, pitch, n, cg, tx0: c_track.tx0, tx1: c_track.tx1 };
    });
    // the printing point: where the answer leaves the engine (the store's far end)
    this.out = { x: X(1745), y: Y(STORE.y[1]) };
    // draw-on order: left to right
    const xs = this.lines.map((p) => { try { return p.getBBox().x; } catch { return 0; } });
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    this.lines.forEach((p, i) => { p._u = (xs[i] - x0) / Math.max(1, x1 - x0); p._len = p.getTotalLength(); });
    this.feed(0);
  }

  /** t 0..1: outlines draw on left to right; cards appear once the readers are down */
  drawOn(t) {
    const on = t >= 1;
    this.lines.forEach((p) => {
      if (on) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; return; }
      const a = clamp((t - p._u * 0.55) / 0.4);
      p.style.strokeDasharray = `${p._len} ${p._len}`;
      p.style.strokeDashoffset = String(p._len * (1 - a));
    });
    this.chains.forEach((c) => { c.cg.style.visibility = t > 0.5 + c.r.x / PLAN.w * 0.45 ? '' : 'hidden'; });
  }

  /** feed: cards read so far (any real number); wheels turn with it */
  feed(n) {
    this.chains.forEach((c) => {
      const { r, cards, pitch, tx0, tx1 } = c;
      const step = r.key === 'op' ? n : n * (r.key === 'var' ? 0.75 : 0.5);
      const L = cards.length * pitch;
      cards.forEach((card, i) => {
        // cards run along the track towards the reader, wrapping round
        const u = (((i * pitch + step * pitch) % L) + L) % L;          // 0..L, grows as they feed
        const x = r.dir < 0 ? tx0 - pitch + u : tx1 - u;               // op: left -> right; var / num: right -> left
        card.setAttribute('transform', `translate(${f(x * this.m.s)} 0)`);
      });
    });
    this.wheels.forEach((w) => w.g.setAttribute('transform', `rotate(${(n * 36 * w.speed).toFixed(2)} ${f(w.cx)} ${f(w.cy)})`));
  }
}

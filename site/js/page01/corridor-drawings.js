// The hallway's drawings (Part 5 "Round 4 picks" ... "Round 8"): our own schematics, drawn as cyanotype blueprints (white
// lines on Prussian blue #173F73) in the corridor after the "?" dot. They show METHOD, never results: no numbers, no
// claims. Five, alternating walls (round 7); each has a museum label (the wording is a draft for Wajih).
// A drawing is data: { w, h } (its own units, y down), segs (short straight segments in draw order, so the corridor
// can draw it on by count), labels (mono words, each appearing when the segments before it are drawn).
// Used by the corridor (dive.js, WebGL), the reduced-motion figures (SVG) and the stretch check (true ratio = w / h).
import { bookingPlan, SCREEN as APP } from '../apps/booking.js';

// the real phones' outlines, measured on their render (tools/phone_stills.py, 24 Nov), mm, y up, the pair centred:
// the still (site/media/phones-unverified/corridor-phones.webp) covers exactly [x0, x1] x [y0, y1]
export const PHONE_PAIR = {
  gap: 22, pad: 3, region: { x0: -92.94, x1: 92.06, y0: -84.65, y1: 84.65 },
  phones: [
    { key: 'iphone18', label: 'IPHONE', x: -89.94, y: -81.65, w: 78.94, h: 163.3, r: 13.69, screen: { x: -86.99, y: -79.24, w: 73, h: 158.43, r: 10.7 },
      island: { cx: -50.5, cy: 73.9, w: 15.6, h: 6.2 }, keys: [['l', 44.26, 50.73], ['l', 27.91, 38.71], ['l', 13.73, 24.52], ['r', 17.43, 35.01]] },
    { key: 's26', label: 'ANDROID', x: 11, y: -81.5, w: 78.06, h: 163, r: 7.9, screen: { x: 13.47, y: -78.69, w: 72.69, h: 157.73, r: 5.4 },
      hole: { cx: 50.03, cy: 75.1, r: 1.85 }, keys: [['r', 31.46, 50.4], ['r', 12.81, 21.44]] },
  ],
};

function sheet(w, h, size) {
  const segs = [], labels = [], step = w / 44;
  const d = {
    w, h, size, segs, labels,
    line(x1, y1, x2, y2) {
      const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let i = 0; i < n; i++) segs.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, x1 + (x2 - x1) * (i + 1) / n, y1 + (y2 - y1) * (i + 1) / n]);
      return d;
    },
    poly(pts, closed = false) { for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; d.line(a[0], a[1], b[0], b[1]); } return d; },
    rect(x, y, rw, rh) { return d.poly([[x, y], [x + rw, y], [x + rw, y + rh], [x, y + rh]], true); },
    arc(cx, cy, r, a0, a1, n = 10) { const pts = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return d.poly(pts); },
    rrect(x, y, rw, rh, r) {
      const P = Math.PI;
      d.line(x + r, y, x + rw - r, y).arc(x + rw - r, y + r, r, -P / 2, 0).line(x + rw, y + r, x + rw, y + rh - r).arc(x + rw - r, y + rh - r, r, 0, P / 2)
        .line(x + rw - r, y + rh, x + r, y + rh).arc(x + r, y + rh - r, r, P / 2, P).line(x, y + rh - r, x, y + r).arc(x + r, y + r, r, P, 1.5 * P);
      return d;
    },
    circle(cx, cy, r) { return d.arc(cx, cy, r, 0, Math.PI * 2, 24); },
    head(x1, y1, x2, y2, s = w / 70) {   // a slender drafting arrowhead at (x2, y2)
      const a = Math.atan2(y2 - y1, x2 - x1), k = 0.32;
      d.line(x2 - s * Math.cos(a - k), y2 - s * Math.sin(a - k), x2, y2).line(x2 - s * Math.cos(a + k), y2 - s * Math.sin(a + k), x2, y2); return d;
    },
    arrow(x1, y1, x2, y2, s) { return d.line(x1, y1, x2, y2).head(x1, y1, x2, y2, s); },
    path(pts, s) { d.poly(pts); const a = pts[pts.length - 2], b = pts[pts.length - 1]; return d.head(a[0], a[1], b[0], b[1], s); },
    dash(x1, y1, x2, y2, on = w / 70, off = w / 120) {
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
      for (let t = 0; t < L; t += on + off) { const e = Math.min(L, t + on); d.line(x1 + ux * t, y1 + uy * t, x1 + ux * e, y1 + uy * e); }
      return d;
    },
    // a dimension line: extension stubs, arrowheads both ends. Round 7: it carries its live measured length (the length
    // it has on the visitor's screen when the drawing rests, set by the hallway), small and faint; never a claimed result
    // round 8: dimensions are kept apart (d.dims) and drawn by the hallway once it knows the scale at rest: the measured
    // length sits ON the line in DM Mono Light, the line broken round it with half a grid cell clear (CAD style), so it
    // never touches a letter. ext: the extension stubs' half length.
    dimH(x1, x2, y, o = {}) { (d.dims ||= []).push({ x1, x2, y, ext: o.ext ?? w / 90, size: size * 0.9, at: segs.length }); return d; },
    text(t, x, y, o = {}) { labels.push({ t, x, y, size: o.size || size, anchor: o.anchor || 'start', at: segs.length }); return d; },
    // a text box: hairline rect with its words centred (1 or 2 lines)
    box(x, y, bw, bh, words, o = {}) {
      if (o.round) d.rrect(x, y, bw, bh, bh / 2); else d.rect(x, y, bw, bh);
      const lines = Array.isArray(words) ? words : [words], s = o.size || size, lh = s * 1.3, y0 = y + bh / 2 - (lines.length - 1) * lh / 2 + s * 0.36;
      lines.forEach((t, i) => d.text(t, x + bw / 2, y0 + i * lh, { anchor: 'middle', size: s }));
      return d;
    },
    diamond(cx, cy, dw, dh, words, o = {}) {
      d.poly([[cx, cy - dh / 2], [cx + dw / 2, cy], [cx, cy + dh / 2], [cx - dw / 2, cy]], true);
      const lines = Array.isArray(words) ? words : [words], s = o.size || size, lh = s * 1.3, y0 = cy - (lines.length - 1) * lh / 2 + s * 0.36;
      lines.forEach((t, i) => d.text(t, cx, y0 + i * lh, { anchor: 'middle', size: s }));
      return d;
    },
  };
  return d;
}
// Round 8b: the drawings hang on the walls at an angle (about 40 degrees out), so they are read in perspective, never
// square-on. Their words are bigger for it (TYPE_RULES rule 3: every word at least the scale's smallest step on screen
// at the drawing's closest point), there is no head inside the drawing (its museum label names it), and the sheets are
// portrait (a phone's hallway is tall and narrow). S: the label size, DIM: the live measurements (0.8 of S), CAP: a
// capital's height, CLEAR: the clear space round every word (half a grid cell at the drawing's scale, at its centre,
// at its closest point; dive.js checks it).
const S = 22, DIM = 0.9 * S, CAP = 0.7 * S, CLEAR = 30;
export const MOUNT = 0.09;   // the least blue margin round a drawing, as a share of its width (its words half a cell from the frame)

// a phone screen as a wireframe (rounded outline, a status line), w x h at (x, y)
function screenAt(d, x, y, w, h) { d.rrect(x, y, w, h, 10); d.line(x + 12, y + 16, x + w - 12, y + 16); return d; }

// 1 · The property app's enquiry path: search, a listing, a long enquiry form where people give up; the fix drawn in
// (one tap, straight from the listing, and it's sent)
function enquiry() {
  const d = sheet(400, 556, S);
  const sw = 100, sh = 140, XL = 16, XR = 284, top = 60, mid = top + sh / 2;
  d.text('SEARCH', XL + sw / 2, top - CLEAR, { anchor: 'middle' });
  d.text('LISTING', XR + sw / 2, top - CLEAR, { anchor: 'middle' });
  // search: a search bar and three result rows
  screenAt(d, XL, top, sw, sh); d.rect(XL + 12, top + 30, sw - 24, 16);
  [64, 84, 104].forEach((yy) => d.line(XL + 12, top + yy, XL + sw - 12, top + yy));
  // the listing: a photo, the price line, the details
  screenAt(d, XR, top, sw, sh); d.rect(XR + 12, top + 30, sw - 24, 44); d.line(XR + 12, top + 90, XR + 52, top + 90).line(XR + 12, top + 108, XR + sw - 12, top + 108);
  d.arrow(XL + sw, mid, XR, mid, 9);
  // down to the enquiry form: field after field (where they give up)
  const cx = XR + sw / 2, eTop = 300;
  d.arrow(cx, top + sh, cx, eTop, 9);
  screenAt(d, XR, eTop, sw, sh); [36, 52, 68, 84, 100, 116].forEach((yy) => d.line(XR + 12, eTop + yy, XR + sw - 12, eTop + yy));
  d.text('ENQUIRE', XR - CLEAR, eTop + sh / 2 + CAP / 2, { anchor: 'end' });
  // they leave: the path breaks off below the form, marked with a cross
  const ly = eTop + sh + 62;
  d.dash(cx, eTop + sh, cx, ly - 12);
  d.line(cx - 9, ly - 9, cx + 9, ly + 9).line(cx - 9, ly + 9, cx + 9, ly - 9);
  d.text('THEY LEAVE', cx - 9 - CLEAR - 6, ly + CAP / 2, { anchor: 'end' });
  // the fix: a branch off the way down, one tap to "sent"
  const by = 250, lx = XL + sw / 2;
  d.line(cx, by, lx, by).arrow(lx, by, lx, eTop, 9);
  d.text('ONE TAP', (lx + cx) / 2, by - CLEAR, { anchor: 'middle' });
  screenAt(d, XL, eTop, sw, sh); d.circle(lx, eTop + 76, 18); d.line(lx - 9, eTop + 76, lx - 2, eTop + 84).line(lx - 2, eTop + 84, lx + 10, eTop + 66);
  d.text('SENT', lx, eTop + sh + CLEAR + CAP, { anchor: 'middle' });
  return d;
}

// 2 · Design that understands people (round 8b, Wajih's pick: the watch goes). The property app's listing screen broken
// into its design layers, bottom to top: who they are, what they must feel, the requirements, the palette and type,
// then the finished screen. Each layer carries real content (notes, the hex values, the typefaces this site is set in).
// Drawn as planes (dive.js spreads them apart as the frame swings out), not as segments. Units: one layer is LW x LH;
// a back layer shows its top STRIP above the layer in front of it once spread.
export const LAYERS = {
  w: 432, h: 741, LW: 392, LH: 266, S: 24, CAP: 16.8, CLEAR: 28, IN: 36, TOP: 33, SP: 9, BG: 8, dz: 6,
  colours: ['#173F73', '#F6F7F9', '#121212', '#66696E'],
  // bottom to top; strip: how much of a back layer shows above the one in front of it once spread
  list: [
    { k: 'who', t: 'WHO: HOME BUYERS', strip: 91 },
    { k: 'feel', t: 'FEEL: CALM, SURE', strip: 91 },
    { k: 'req', t: 'NEEDS: PRICE FIRST', strip: 91 },
    { k: 'type', t: 'PALETTE · TYPE', strip: 202, swatches: true, type: 'NEWSREADER, DM MONO' },
    { k: 'screen', screen: true, title: 'A home with a garden', ask: 'ASK IN ONE TAP' },
  ],
};
/** the layers' sizes from their spacing (TOP: room above a note, SP: under it, BG: above the screen's button) */
export function sizeLayers(L = LAYERS) {
  const C = L.CLEAR, cap = L.CAP;
  L.list.forEach((l) => { if (!l.screen) l.strip = l.swatches ? L.TOP + cap + C + 8 + cap + 2 * (13 + cap) + C + L.SP : L.TOP + cap + C + L.SP; });
  L.LH = Math.ceil(C + 44 + C + 24 + C + L.BG + 2 * (C + 8) + cap + C);
  L.h = L.list.reduce((a, l) => a + (l.strip || 0), 0) + L.LH;
  return L;
}
function layersPlan() {
  const L = sizeLayers(), d = { w: L.w, h: L.h, size: S, segs: [], labels: [], layers: L };
  return d;
}
/** each layer's place (units, y down from the drawing's top; z out of the sheet) at a spread 0..1 (0: all of them
 *  behind the finished screen) */
export function layerPlaces(spread = 1) {
  const L = LAYERS, n = L.list.length, tops = []; let y = 0;
  L.list.forEach((l) => { tops.push(y); y += l.strip || 0; });
  const front = tops[n - 1];
  return L.list.map((l, i) => ({ i, x: (L.w - L.LW) / 2, y: front + (tops[i] - front) * spread, z: -(n - 1 - i) * L.dz * spread, w: L.LW, h: L.LH, strip: l.strip || L.LH }));
}
/** a layer's contents (layer units, y down): its words (mono unless serif), its filled boxes, its hairlines */
export function layerItems(i) {
  const L = LAYERS, l = L.list[i], T = [], B = [], H = [], C = L.CLEAR, cap = L.CAP;
  H.push([0, 0, L.LW, 0], [L.LW, 0, L.LW, L.LH], [L.LW, L.LH, 0, L.LH], [0, L.LH, 0, 0]);   // its outline
  if (!l.screen) {
    const t0 = L.TOP + cap;   // its first baseline (more room above: a layer high on the wall is seen at a slant)
    T.push({ t: l.t, x: L.IN, y: t0, size: L.S });
    if (l.swatches) {
      // the four colours' hex values, then the two typefaces (the finished screen in front shows the colours in use)
      T.push({ t: `${L.colours[0]} · ${L.colours[1]}`, x: L.IN, y: t0 + C + 8 + cap, size: L.S });
      T.push({ t: `${L.colours[2]} · ${L.colours[3]}`, x: L.IN, y: t0 + C + 8 + cap + 13 + cap, size: L.S });
      T.push({ t: l.type, x: L.IN, y: t0 + C + 8 + cap + 2 * (13 + cap), size: L.S });
    }
  } else {
    const ph = 44;
    B.push({ x: L.IN, y: C, w: L.LW - 2 * L.IN, h: ph, fill: L.colours[0], hatch: true });
    T.push({ t: l.title, x: L.IN, y: C + ph + C + 24, size: 28, serif: true });
    const by = C + ph + C + 24 + C + L.BG, bh = 2 * (C + 8) + cap;
    const bx0 = L.IN, bx1 = L.LW - L.IN; H.push([bx0, by, bx1, by], [bx1, by, bx1, by + bh], [bx1, by + bh, bx0, by + bh], [bx0, by + bh, bx0, by]);
    T.push({ t: l.ask, x: L.IN + C + 12, y: by + C + 8 + cap, size: L.S });   // from its near (hinge) side: the far side keeps the wider gap
  }
  return { T, B, H, screen: !!l.screen };
}
/** paint layer i at k px per unit (blueprint white on blue for the notes; the finished screen in its real colours) */
export function paintLayer(ctx, i, k, { blue = '#173F73', paper = '#F6F7F9', ink = '#121212', graphite = '#66696E' } = {}) {
  const L = LAYERS, it = layerItems(i), W = L.LW * k, Hh = L.LH * k;
  ctx.save(); ctx.clearRect(0, 0, W, Hh);
  ctx.fillStyle = it.screen ? paper : blue; ctx.fillRect(0, 0, W, Hh);
  const lineC = it.screen ? ink : '#FFFFFF', lw = Math.max(1, Math.round(k * 1.1));
  it.B.forEach((b) => {
    ctx.fillStyle = b.fill; ctx.fillRect(b.x * k, b.y * k, b.w * k, b.h * k);
    if (b.hatch) { ctx.save(); ctx.beginPath(); ctx.rect(b.x * k, b.y * k, b.w * k, b.h * k); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = lw;
      for (let t = -b.h; t < b.w; t += 14) { ctx.beginPath(); ctx.moveTo((b.x + t) * k, (b.y + b.h) * k); ctx.lineTo((b.x + t + b.h) * k, b.y * k); ctx.stroke(); } ctx.restore(); }
    if (b.line) { ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = lw; ctx.strokeRect(b.x * k + lw / 2, b.y * k + lw / 2, b.w * k - lw, b.h * k - lw); }
  });
  ctx.strokeStyle = lineC; ctx.lineWidth = lw;
  it.H.forEach(([a, b, c, e]) => { const inset = (v, lim) => Math.min(Math.max(v * k, lw / 2), lim - lw / 2); ctx.beginPath(); ctx.moveTo(inset(a, W), inset(b, Hh)); ctx.lineTo(inset(c, W), inset(e, Hh)); ctx.stroke(); });
  it.T.forEach((t) => {
    ctx.font = t.serif ? `420 ${t.size * k}px Newsreader, Georgia, serif` : `500 ${t.size * k}px "DM Mono", ui-monospace, monospace`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = t.serif ? '0px' : `${0.06 * t.size * k}px`;
    ctx.fillStyle = it.screen ? (t.faint ? graphite : ink) : '#FFFFFF'; ctx.textBaseline = 'alphabetic';
    let x = t.x * k; if (t.anchor === 'middle') x -= ctx.measureText(t.t).width / 2;
    ctx.fillText(t.t, x, t.y * k);
  });
  ctx.restore();
}

// 3 · The delivery tracker: which driver gets this delivery (the rules, as steps a machine follows every time). One
// column, so its words keep their size on a phone's narrow wall
function dispatch() {
  const d = sheet(370, 556, S);
  const cx = 150, bw = 280, b1 = CAP + 2 * (CLEAR + 5);
  let y = 16;
  d.box(cx - bw / 2, y, bw, b1, 'NEW ORDER'); y += b1;
  d.arrow(cx, y, cx, y + 30, 9); y += 30;
  const yFree = y;
  d.box(cx - bw / 2, y, bw, b1, 'NEAREST DRIVER'); y += b1;
  d.arrow(cx, y, cx, y + 30, 9); y += 30;
  const dw = 272, dh = 144, dy = y + dh / 2;
  d.diamond(cx, dy, dw, dh, 'ON TIME?');
  // no: the next nearest, from the free drivers again
  const rx = 350;
  d.path([[cx + dw / 2, dy], [rx, dy], [rx, yFree + b1 / 2], [cx + bw / 2, yFree + b1 / 2]], 9);
  d.text('NO', cx + dw / 2 + 4, dy + CLEAR + CAP);
  // yes: assign
  y += dh;
  d.arrow(cx, y, cx, y + 64, 9).text('YES', cx + CLEAR + 12, y + 32 + CAP / 2); y += 64;
  d.box(cx - bw / 2, y, bw, b1, 'ASSIGN');
  return d;
}

// 4 · The website loading: parts that load one after another, redrawn as parts that load side by side. Each timeline
// carries its live measured length on the visitor's screen (dive.js measures it as you walk), never a claimed result.
function website() {
  const d = sheet(400, 560, S);
  const x0 = 124, names = ['HTML', 'CSS', 'FONT', 'IMAGES', 'SCRIPT'], rh = 14, step = 36;
  d.text('A · ONE AFTER ANOTHER', 0, CAP + 8);
  const long = [34, 42, 32, 64, 54]; let x = x0, y0 = CAP + 8 + CLEAR + 6;
  names.forEach((n, i) => { const y = y0 + i * step; d.text(n, 0, y + rh / 2 + CAP / 2); d.rect(x, y, long[i], rh); x += long[i]; });
  d.dimH(x0, x, y0 + 5 * step + 18);
  const yB = y0 + 5 * step + 18 + 30 + CLEAR + CAP;
  d.text('B · SIDE BY SIDE', 0, yB);
  const short = [22, 20, 16, 30, 22], start = [0, 4, 4, 8, 6], y1 = yB + CLEAR + 6;
  names.forEach((n, i) => { const y = y1 + i * step; d.text(n, 0, y + rh / 2 + CAP / 2); d.rect(x0 + start[i], y, short[i], rh); });
  d.dimH(x0, x0 + 38, y1 + 5 * step + 18);
  return d;
}

// 5 · On every phone they carry: the blueprint of our booking app's screen on the two phones (true outlines, mm); the
// hallway then turns it real (the real phones running the same app sit exactly on these lines)
function phones() {
  const R = PHONE_PAIR.region, s5 = 10, c5 = 12, top = 4, w = R.x1 - R.x0, h = (R.y1 - R.y0) + top + c5 + s5 * 0.7 + 4;
  const d = sheet(w, h, s5);
  const U = (x) => x - R.x0, V = (y) => top + (R.y1 - y);   // mm (y up) -> drawing units (y down)
  d.region = { u: 0, v: top, w: R.x1 - R.x0, h: R.y1 - R.y0 };
  PHONE_PAIR.phones.forEach((p) => {
    d.rrect(U(p.x), V(p.y + p.h), p.w, p.h, p.r);
    const s = p.screen; d.rrect(U(s.x), V(s.y + s.h), s.w, s.h, s.r);
    if (p.island) { const i = p.island; d.rrect(U(i.cx - i.w / 2), V(i.cy + i.h / 2), i.w, i.h, i.h / 2); }
    if (p.hole) d.circle(U(p.hole.cx), V(p.hole.cy), p.hole.r);
    p.keys.forEach(([side, y0, y1]) => { const x = side === 'l' ? U(p.x) - 0.7 : U(p.x + p.w) + 0.7; d.line(x, V(y1), x, V(y0)); });
    // the app, as a wireframe in the screen: its hairlines, boxes and marks; its words as placeholder strokes
    const k = s.w / APP.w, ox = U(s.x), oy = V(s.y + s.h) + (s.h - APP.h * k) / 2, plan = bookingPlan();
    const P = (x, y) => [ox + x * k, oy + y * k];
    plan.lines.forEach(([a, b, c, e]) => d.line(...P(a, b), ...P(c, e)));
    plan.boxes.forEach(([a, b, bw, bh]) => { const [x, y] = P(a, b); d.rect(x, y, bw * k, bh * k); });
    plan.marks.forEach(([a, b, c, e]) => d.line(...P(a, b), ...P(c, e)));
    plan.text.forEach((t) => {
      const cw = t.role === 'mono' ? 0.62 : 0.46, tw = t.t.length * t.size * cw;
      const x = t.anchor === 'center' ? t.x - tw / 2 : t.anchor === 'right' ? t.x - tw : t.x;
      const [x0, y0] = P(x, t.y - t.size * 0.62), [x1, y1] = P(x + tw, t.y);
      if (t.size >= 30) d.rect(x0, y0, x1 - x0, y1 - y0); else d.line(x0, (y0 + y1) / 2, x1, (y0 + y1) / 2);
    });
    d.text(p.label, U(p.x + p.w / 2), V(R.y0) + c5 + s5 * 0.7, { anchor: 'middle' });
  });
  return d;
}

// Round 8: the five canvases each show their point on one of our made-up products (named by what they are, never a
// brand): 1 the property app's enquiry path, 2 (round 8b) the property app's listing screen in its design layers, 3 the
// delivery tracker ("which driver gets this delivery"), 4 the website loading, 5 the booking app on the iPhone 18 and
// the S26. Each has its label: the title (big, serif), a small mono line naming the drawing, one line of story (the
// chat's drafts, flagged for Wajih). Round 8b: the sheet's shape in whole grid cells is chosen at layout from the
// drawing's own proportions (its blue margin takes the difference).
export const FRAMES = [
  { key: 'enquiry', side: 'l', caption: 'Where customers give up.', fig: 'Fig. 01 · Property app',
    story: 'We walk every step your customers take, find the one that loses them, and fix it.',
    alt: 'Blueprint: the property app’s enquiry path. Search, a listing, then a long enquiry form where people leave; the fix is drawn in: one tap, straight from the listing, and it’s sent.', draw: enquiry() },
  { key: 'layers', side: 'r', caption: 'Design that understands people.', fig: 'Fig. 02 · Listing, in layers',
    story: 'We learn what your customers need to feel, then choose every colour, shape and word for it.',
    alt: 'The property app’s listing screen taken apart into its design layers, bottom to top: who they are (home buyers), what they must feel (calm, sure, nothing hidden), the requirements (price first, one tap to ask), the palette (blue #173F73, paper #F6F7F9, ink #121212, graphite #66696E) and type (Newsreader, DM Mono), then the finished screen.', draw: layersPlan() },
  { key: 'dispatch', side: 'l', caption: 'Your way of deciding, built in.', fig: 'Fig. 03 · Delivery tracker',
    story: 'The rules you carry in your head, turned into a system that decides like you, every time.',
    alt: 'Blueprint: the delivery tracker’s decision flow for which driver gets a new order: the nearest driver; if they can’t make it on time, the next nearest; then assign.', draw: dispatch() },
  { key: 'website', side: 'r', caption: 'Speed.', fig: 'Fig. 04 · Website loading',
    story: 'Every second of waiting costs you a customer. We find the slow parts and cut them.',
    alt: 'Blueprint: a website loading. Five parts loading one after another are redrawn as parts loading side by side; each timeline carries its measured length.', draw: website() },
  { key: 'apps', side: 'l', caption: 'On every phone they carry.', fig: 'Fig. 05 · Booking app',
    story: 'One app, at home on iPhone and Android.',
    alt: 'Blueprint of our booking app’s screen on an iPhone and an Android phone, which turns into the app running on the real phones.', draw: phones(), real: 'media/phones-unverified/corridor-phones.webp' },
];
// the line that opens the hallway, before the first frame (round 7; draft wording, flagged)
export const OPENING = { lead: 'We design backwards.', rest: 'From what your customers live, know and feel, back to the drawing board.' };

/** a dimension line's parts (round 8): the extension stubs, the arrowheads, and the line broken round its measurement
 *  (textW wide, clear on each side), so the words sit ON the line and never touch it (CAD style). Too short to break:
 *  the line runs whole and the words sit on its line just past its end, clear. */
export function dimParts(dm, textW, clear) {
  const { y, ext } = dm, a = Math.min(dm.x1, dm.x2), b = Math.max(dm.x1, dm.x2), mid = (a + b) / 2, hw = textW / 2 + clear;
  const s = Math.min(6, (b - a) / 8), k = 0.32;
  const segs = [[a, y - ext, a, y + ext], [b, y - ext, b, y + ext],
    [a + s * Math.cos(k), y - s * Math.sin(k), a, y], [a + s * Math.cos(k), y + s * Math.sin(k), a, y],
    [b - s * Math.cos(k), y - s * Math.sin(k), b, y], [b - s * Math.cos(k), y + s * Math.sin(k), b, y]];
  if (mid - hw > a + s + 2) { segs.push([a, y, mid - hw, y], [mid + hw, y, b, y]); return { segs, label: { x: mid, y, inline: true } }; }
  segs.push([a, y, b, y]); return { segs, label: { x: b + ext + clear + textW / 2, y, inline: true } };   // too short to break: the words beside it, on its line
}

/** a drawing as an SVG string (reduced motion: the still figures; the asset sheet) */
export function toSVG(d, { ink = '#FFFFFF', ground = '#173F73', pad = 0 } = {}) {
  if (d.layers) return layersSVG(d, { ground, pad });
  const f = (v) => +v.toFixed(2);
  const path = d.segs.map(([a, b, c, e]) => `M${f(a)} ${f(b)}L${f(c)} ${f(e)}`).join('');
  // dimensions: broken round a nominal clear space; the reduced-motion figure has no live measurement, so no words
  const dimPath = (d.dims || []).map((dm) => dimParts(dm, 0, 0).segs.map(([a, b, c, e]) => `M${f(a)} ${f(b)}L${f(c)} ${f(e)}`).join('')).join('');
  const txt = d.labels.filter((l) => l.t).map((l) => `<text x="${f(l.x)}" y="${f(l.y)}" font-size="${f(l.size)}" text-anchor="${l.anchor}">${l.t}</text>`).join('');
  return `<svg viewBox="${-pad} ${-pad} ${f(d.w + 2 * pad)} ${f(d.h + 2 * pad)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<rect x="0" y="0" width="${f(d.w)}" height="${f(d.h)}" fill="${ground}"/>` +
    `<path d="${path}${dimPath}" fill="none" stroke="${ink}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>` +
    `<g fill="${ink}" font-family="DM Mono, monospace" font-weight="500" letter-spacing=".06em">${txt}</g></svg>`;
}

/** the layers as an SVG string, spread (reduced motion; the asset sheet) */
function layersSVG(d, { ground = '#173F73', pad = 0 } = {}) {
  const L = d.layers, f = (v) => +v.toFixed(2), out = [];
  layerPlaces(1).forEach((p) => {
    const it = layerItems(p.i), g = [];
    const vis = it.screen ? L.LH : p.strip;
    g.push(`<rect x="0" y="0" width="${L.LW}" height="${L.LH}" fill="${it.screen ? '#F6F7F9' : ground}"/>`);
    g.push(`<path d="${it.screen ? `M0 0H${L.LW}V${L.LH}H0Z` : `M0 ${f(vis)}V0H${L.LW}V${f(vis)}`}" fill="none" stroke="${it.screen ? '#121212' : '#FFFFFF'}" stroke-width="1" vector-effect="non-scaling-stroke"/>`);
    it.B.forEach((b) => g.push(`<rect x="${f(b.x)}" y="${f(b.y)}" width="${f(b.w)}" height="${f(b.h)}" fill="${b.fill}"${b.line ? ' stroke="#FFFFFF" stroke-width="1" vector-effect="non-scaling-stroke"' : ''}/>`));
    it.H.slice(4).forEach(([a, b, c, e]) => g.push(`<path d="M${f(a)} ${f(b)}L${f(c)} ${f(e)}" stroke="#121212" stroke-width="1" vector-effect="non-scaling-stroke"/>`));
    it.T.forEach((t) => g.push(`<text x="${f(t.x)}" y="${f(t.y)}" font-size="${t.size}" ${t.anchor === 'middle' ? 'text-anchor="middle" ' : ''}fill="${it.screen ? (t.faint ? '#66696E' : '#121212') : '#FFFFFF'}" ${t.serif ? 'font-family="Newsreader, serif" font-weight="420"' : 'font-family="DM Mono, monospace" font-weight="500" letter-spacing=".06em"'}>${t.t}</text>`));
    out.push(`<g transform="translate(${f(p.x)} ${f(p.y)})">${g.join('')}</g>`);
  });
  return `<svg viewBox="${-pad} ${-pad} ${f(d.w + 2 * pad)} ${f(d.h + 2 * pad)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="0" y="0" width="${f(d.w)}" height="${f(d.h)}" fill="${ground}"/>${out.join('')}</svg>`;
}

// The hallway's drawings (Part 5 "Hallway rebuild" and "Hallway pass 2", 26 Nov): our own schematics, drawn as
// cyanotype blueprints (white lines on Prussian blue #173F73), one in each black float frame. They show METHOD, never
// results: no numbers, no claims. Five, alternating walls; each has a plaque (title, FIG line) and a story line in the
// caption band (the wording is a draft for Wajih).
// A drawing is data: { w, h } (its own units, y down), segs (short straight segments in draw order, so the hallway can
// draw it on by count), labels (mono words, each appearing when the segments before it are drawn), fills (small solid
// dots, with their opacity).
// Used by the hallway (dive.js, WebGL), the reduced-motion figures (SVG) and the asset sheet.
import { bookingPlan, SCREEN as APP } from '../apps/booking.js';

// the two phones' true outlines (measured on the real models' render, tools/phone_stills.py, 24 Nov), mm, y up, the
// pair centred
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
  const segs = [], labels = [], fills = [], step = w / 44;
  const d = {
    w, h, size, segs, labels, fills,
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
    /** a solid dot (a filled disc), alpha its opacity */
    disc(cx, cy, r, alpha = 1) { fills.push({ cx, cy, r, alpha, at: segs.length }); return d; },
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
    // a dimension line (round 8; no drawing uses one since hallway pass 2: "no numbers"); kept for dimParts
    dimH(x1, x2, y, o = {}) { (d.dims ||= []).push({ x1, x2, y, ext: o.ext ?? w / 90, size: size * 0.9, at: segs.length }); return d; },
    text(t, x, y, o = {}) { labels.push({ t, x, y, size: o.size || size, anchor: o.anchor || 'start', at: segs.length }); return d; },
    // a text box: hairline rect (or a pill) with its words centred (1 or 2 lines)
    box(x, y, bw, bh, words, o = {}) {
      if (o.round) d.rrect(x, y, bw, bh, bh / 2); else d.rect(x, y, bw, bh);
      const lines = Array.isArray(words) ? words : [words], s = o.size || size, lh = s * 1.3, y0 = y + bh / 2 - (lines.length - 1) * lh / 2 + s * 0.35;
      lines.forEach((t, i) => d.text(t, x + bw / 2, y0 + i * lh, { anchor: 'middle', size: s }));
      return d;
    },
  };
  return d;
}

// Hallway pass 2 (26 Nov): the drawings hang in black float frames and open square to you; on a phone each open frame
// takes about two thirds of the screen's width. The sheets are about square (a frame that wide still leaves room for
// its plaque and the caption band), every word at one size (S) in DM Mono capitals, CLEAR round every word (half a
// grid cell at a phone's scale when the frame is read closest), even margins, numbered steps where there is an order.
// S: the label size, CAP: a capital's height, CLEAR: the clear space round every word, BOX: a one-line box's height.
const S = 24, CAP = 0.7 * S, CLEAR = 26, BOX = Math.ceil(CAP + 2 * CLEAR + 2);
export const MOUNT = 0.07;   // the blue margin round a drawing, as a share of its width

// 1 · Where customers give up (the property app): the path as it is (search, the listing, a long form; they leave at
// the form) beside the path fixed (search, the listing, one tap; sent)
function giveUp() {
  const d = sheet(440, 470, S);
  const cw = 204, xa = 0, xb = 236, ca = xa + cw / 2, cb = xb + cw / 2, gap = 30;
  d.text('AS IT IS', xa, CAP).text('FIXED', xb, CAP);
  let y = CAP + CLEAR + 4;
  d.box(xa, y, cw, BOX, '1 SEARCH'); d.box(xb, y, cw, BOX, '1 SEARCH'); y += BOX;
  d.arrow(ca, y, ca, y + gap, 9); d.arrow(cb, y, cb, y + gap, 9); y += gap;
  d.box(xa, y, cw, BOX, '2 LISTING'); d.box(xb, y, cw, BOX, '2 LISTING'); y += BOX;
  d.arrow(ca, y, ca, y + gap, 9); d.arrow(cb, y, cb, y + gap, 9); y += gap;
  // as it is: the long form, field after field
  const fh = BOX + 40, fb = y + CLEAR + CAP;
  d.rect(xa, y, cw, fh); d.text('3 FORM', ca, fb, { anchor: 'middle' });
  [fb + CLEAR, fb + CLEAR + 14].forEach((yy) => d.line(xa + 26, yy, xa + cw - 26, yy));
  // ... and they leave there: the path breaks off, marked with a cross
  const yl = y + fh, yx = yl + 46;
  d.dash(ca, yl, ca, yx - 14); d.line(ca - 9, yx - 9, ca + 9, yx + 9).line(ca - 9, yx + 9, ca + 9, yx - 9);
  d.text('THEY LEAVE', ca, yx + 9 + CLEAR + CAP, { anchor: 'middle' });
  // fixed: one tap, and it's sent
  d.box(xb, y, cw, BOX, '3 ONE TAP', { round: true }); const y2 = y + BOX;
  d.arrow(cb, y2, cb, y2 + gap, 9);
  const ys = y2 + gap, tw = 4 * 0.66 * S - 0.06 * S, tx = cb - tw / 2 + 16, ky = ys + BOX / 2, kx = tx - CLEAR - 20;
  d.rect(xb, ys, cw, BOX);
  d.line(kx, ky, kx + 7, ky + 8).line(kx + 7, ky + 8, kx + 20, ky - 9);   // a tick
  d.text('SENT', tx, ys + BOX / 2 + CAP / 2);
  return d;
}

// 2 · Design that understands people (the booking app): five layers, numbered from the bottom, drawn apart (an
// exploded stack): who they are, what they feel, the requirements, the palette and type, the screen. The three
// palette dots go solid, faint, outline.
function understand() {
  const d = sheet(460, 456, S);
  const Wp = 412, sk = 40, h = 72, gap = 24;
  const names = ['5 THE SCREEN', '4 PALETTE · TYPE', '3 REQUIREMENTS', '2 WHAT THEY FEEL', '1 WHO THEY ARE'];   // top to bottom
  const tops = names.map((_, i) => i * (h + gap));
  // the stack's corners joined, dashed: one screen, taken apart
  for (let i = 0; i < names.length - 1; i++) { const a = tops[i], b = tops[i + 1]; d.dash(0, a + h, 0, b + h); d.dash(Wp + sk, a, Wp + sk, b); }
  tops.forEach((y, i) => {
    d.poly([[0, y + h], [Wp, y + h], [Wp + sk, y], [sk, y]], true);
    const yb = y + h / 2 + CAP / 2, edge = sk * (h / 2 + CAP / 2) / h;   // the slanted side's x at the words' cap line
    d.text(names[i], edge + 36, yb);
    const ix = 340, iy = y + h / 2;   // each layer's mark, on its right
    if (i === 0) { d.rrect(ix + 16, iy - 22, 26, 44, 5); d.line(ix + 22, iy + 13, ix + 36, iy + 13); }   // the screen
    if (i === 1) { d.disc(ix + 6, iy, 9, 1).disc(ix + 32, iy, 9, 0.35).circle(ix + 58, iy, 9); }   // the palette: solid, faint, outline
    if (i === 2) { [-13, 0, 13].forEach((o) => { d.rect(ix + 6, iy + o - 4, 8, 8); d.line(ix + 22, iy + o, ix + 52, iy + o); }); }   // a checklist
    if (i === 3) { d.circle(ix + 29, iy, 18); d.arc(ix + 29, iy + 1, 10, 0.2 * Math.PI, 0.8 * Math.PI, 8); d.disc(ix + 23, iy - 6, 2.2, 1).disc(ix + 35, iy - 6, 2.2, 1); }   // how they feel
    if (i === 4) { d.circle(ix + 29, iy - 10, 8); d.arc(ix + 29, iy + 22, 17, 1.1 * Math.PI, 1.9 * Math.PI, 10); }   // who they are
  });
  return d;
}

// 3 · Everything in one place (the business system): WhatsApp, Excel, paper and the register feed one database, its
// tables joined (customers, orders, stock, staff): four places become one source of truth
function onePlace() {
  const d = sheet(460, 486, S);
  const bw = 190, dbT = BOX + 32, tw = 202, th = BOX, tg = 20;
  const tl1 = dbT + CLEAR + CAP, tl2 = tl1 + 32, tT = tl2 + CLEAR, dbB = tT + 2 * th + tg + 14, srcB = dbB + 32;
  [['WHATSAPP', 0, 0], ['EXCEL', 270, 0], ['PAPER', 0, srcB], ['REGISTER', 270, srcB]].forEach(([t, x, y]) => d.box(x, y, bw, BOX, t));
  [95, 365].forEach((x) => { d.arrow(x, BOX, x, dbT, 9); d.arrow(x, srcB, x, dbB, 9); });
  d.rrect(0, dbT, 460, dbB - dbT, 10);
  d.text('FOUR PLACES BECOME', 230, tl1, { anchor: 'middle' }).text('ONE SOURCE OF TRUTH', 230, tl2, { anchor: 'middle' });
  const xs = [14, 244], ys = [tT, tT + th + tg];
  [['CUSTOMERS', 0, 0], ['ORDERS', 1, 0], ['STAFF', 0, 1], ['STOCK', 1, 1]].forEach(([t, c, r]) => d.box(xs[c], ys[r], tw, th, t));
  // the joins: customers to orders, orders to stock, staff to orders
  d.line(xs[0] + tw, ys[0] + th / 2, xs[1], ys[0] + th / 2).line(xs[1] + tw / 2, ys[0] + th, xs[1] + tw / 2, ys[1]).line(xs[0] + tw, ys[1], xs[1], ys[0] + th);
  return d;
}

// 4 · Speed (the website): the same page before and after; still waiting, then ready on open. No numbers.
function speed() {
  const d = sheet(460, 448, S);
  const ww = 214, wt = CAP + CLEAR + 4, wh = 340, xs = [0, 246];
  d.text('BEFORE', xs[0], CAP).text('AFTER', xs[1], CAP);
  xs.forEach((x, k) => {
    d.rrect(x, wt, ww, wh, 6); d.line(x, wt + 26, x + ww, wt + 26);
    [14, 26, 38].forEach((o) => d.circle(x + o, wt + 13, 3.5));
    const ix = x + 22, iw = ww - 44, iy = wt + 48, ih = 96;
    if (k === 0) {
      // still waiting: the parts are empty outlines, the page turns its wheel
      d.dash(ix, iy, ix + iw, iy).dash(ix + iw, iy, ix + iw, iy + ih).dash(ix + iw, iy + ih, ix, iy + ih).dash(ix, iy + ih, ix, iy);
      [iy + ih + 26, iy + ih + 42, iy + ih + 58].forEach((yy, j) => d.dash(ix, yy, ix + iw * (j === 2 ? 0.6 : 1), yy));
      const cx = x + ww / 2, cy = iy + ih + 124, r = 22;
      d.arc(cx, cy, r, -0.5 * Math.PI, Math.PI, 16).head(cx - r, cy + 6, cx - r, cy, 9);
    } else {
      // ready on open: the picture, the heading, the text and the button, all there
      d.rect(ix, iy, iw, ih).line(ix, iy, ix + iw, iy + ih).line(ix, iy + ih, ix + iw, iy);
      d.line(ix, iy + ih + 22, ix + iw * 0.8, iy + ih + 22).line(ix, iy + ih + 28, ix + iw * 0.8, iy + ih + 28);
      [iy + ih + 48, iy + ih + 62, iy + ih + 76].forEach((yy, j) => d.line(ix, yy, ix + iw * (j === 2 ? 0.6 : 1), yy));
      d.rrect(ix, iy + ih + 104, 96, 32, 16);
    }
  });
  const yb = wt + wh + CLEAR + CAP;
  d.text('STILL WAITING', xs[0] + ww / 2, yb, { anchor: 'middle' }).text('READY ON OPEN', xs[1] + ww / 2, yb, { anchor: 'middle' });
  return d;
}

// 5 · On every phone they carry (the booking app): its screen on the iPhone and the Android, their true outlines, as a
// blueprint (hallway pass 2: no photo; it glared in the dark hall). Millimetres scaled by M to the other drawings' units
function phones() {
  const R = PHONE_PAIR.region, M = 2.4, top = 4;
  const w = (R.x1 - R.x0) * M, h = (R.y1 - R.y0) * M + top + CLEAR + CAP + 2;
  const d = sheet(w, h, S);
  const U = (x) => (x - R.x0) * M, V = (y) => top + (R.y1 - y) * M;   // mm (y up) -> drawing units (y down)
  PHONE_PAIR.phones.forEach((p) => {
    d.rrect(U(p.x), V(p.y + p.h), p.w * M, p.h * M, p.r * M);
    const s = p.screen; d.rrect(U(s.x), V(s.y + s.h), s.w * M, s.h * M, s.r * M);
    if (p.island) { const i = p.island; d.rrect(U(i.cx - i.w / 2), V(i.cy + i.h / 2), i.w * M, i.h * M, i.h * M / 2); }
    if (p.hole) d.circle(U(p.hole.cx), V(p.hole.cy), p.hole.r * M);
    p.keys.forEach(([side, y0, y1]) => { const x = side === 'l' ? U(p.x) - 1.6 : U(p.x + p.w) + 1.6; d.line(x, V(y1), x, V(y0)); });
    // the app, as a wireframe in the screen: its hairlines, boxes and marks; its words as placeholder strokes
    const k = s.w * M / APP.w, ox = U(s.x), oy = V(s.y + s.h) + (s.h * M - APP.h * k) / 2, plan = bookingPlan();
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
    d.text(p.label, U(p.x + p.w / 2), V(R.y0) + CLEAR + CAP, { anchor: 'middle' });
  });
  return d;
}

// Hallway pass 2: the five frames, in the order you walk past them (left, right, left, right, left). Each has its
// plaque (the title, the FIG line) and its story line for the caption band (the chat's drafts, flagged for Wajih).
export const FRAMES = [
  { key: 'giveup', side: 'l', caption: 'Where customers give up.', fig: 'Fig. 01 · Property app',
    story: 'We walk every step your customers take, find the one that loses them, and fix it.',
    alt: 'Blueprint: the property app’s path as it is (1 search, 2 the listing, 3 a long form, where they leave) beside the path fixed (1 search, 2 the listing, 3 one tap, and it’s sent).', draw: giveUp() },
  { key: 'understand', side: 'r', caption: 'Design that understands people.', fig: 'Fig. 02 · Booking app',
    story: 'We learn what your customers need to feel, then choose every colour, shape and word for it.',
    alt: 'Blueprint: the booking app’s screen taken apart into five layers, numbered from the bottom: 1 who they are, 2 what they feel, 3 the requirements, 4 the palette and type (three colour dots: solid, faint, outline), 5 the screen.', draw: understand() },
  { key: 'oneplace', side: 'l', caption: 'Everything in one place.', fig: 'Fig. 03 · Business system',
    story: 'WhatsApp, spreadsheets, paper and the register, brought together into one system you can trust.',
    alt: 'Blueprint: WhatsApp, Excel, paper and the register all feed one database, drawn as four joined tables (customers, orders, stock, staff): four places become one source of truth.', draw: onePlace() },
  { key: 'speed', side: 'r', caption: 'Speed.', fig: 'Fig. 04 · Website',
    story: 'Every second of waiting costs you a customer. We find the slow parts and cut them.',
    alt: 'Blueprint: the same web page before and after. Before, its parts are still empty outlines and it is still waiting; after, the picture, heading, text and button are all there, ready on open.', draw: speed() },
  { key: 'phones', side: 'l', caption: 'On every phone they carry.', fig: 'Fig. 05 · Booking app',
    story: 'One app, at home on iPhone and Android.',
    alt: 'Blueprint: our booking app’s screen on an iPhone and on an Android phone, drawn to their true outlines.', draw: phones() },
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
  const f = (v) => +v.toFixed(2);
  const path = d.segs.map(([a, b, c, e]) => `M${f(a)} ${f(b)}L${f(c)} ${f(e)}`).join('');
  const dimPath = (d.dims || []).map((dm) => dimParts(dm, 0, 0).segs.map(([a, b, c, e]) => `M${f(a)} ${f(b)}L${f(c)} ${f(e)}`).join('')).join('');
  const dots = (d.fills || []).map((c) => `<circle cx="${f(c.cx)}" cy="${f(c.cy)}" r="${f(c.r)}" fill="${ink}" fill-opacity="${c.alpha}"/>`).join('');
  const txt = d.labels.filter((l) => l.t).map((l) => `<text x="${f(l.x)}" y="${f(l.y)}" font-size="${f(l.size)}" text-anchor="${l.anchor}">${l.t}</text>`).join('');
  return `<svg viewBox="${-pad} ${-pad} ${f(d.w + 2 * pad)} ${f(d.h + 2 * pad)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<rect x="${-pad}" y="${-pad}" width="${f(d.w + 2 * pad)}" height="${f(d.h + 2 * pad)}" fill="${ground}"/>` +
    `<path d="${path}${dimPath}" fill="none" stroke="${ink}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>${dots}` +
    `<g fill="${ink}" font-family="DM Mono, monospace" font-weight="500" letter-spacing=".06em">${txt}</g></svg>`;
}

// The corridor's four drawings (Part 5 "Round 4 picks"): our own schematics, drawn as cyanotype blueprints (white
// lines on Prussian blue #173F73) in the corridor after the "?" dot. They show METHOD, never results: no numbers, no
// claims. Left, right, left, right. Each caption is one plain line (the brief's wording, a draft for Wajih).
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
    // a dimension line (no number: these drawings show method, not results): extension stubs, arrowheads both ends
    dimH(x1, x2, y, ext = w / 90) { d.line(x1, y - ext, x1, y + ext).line(x2, y - ext, x2, y + ext); return d.arrow(x2, y, x1, y).head(x1, y, x2, y); },
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
const head = (d, fig, title) => { d.text(`FIG. ${fig} · ${title}`, d.w * 0.05, d.size * 2.1); d.text(`${fig} / 04`, d.w * 0.95, d.size * 2.1, { anchor: 'end' }); };

// 1 · Optimizing: a page-load timeline. Long bars running one after another, redrawn as short ones side by side.
function optimizing() {
  const d = sheet(400, 312, 12); head(d, '01', 'PAGE LOAD');
  const x0 = 112, names = ['HTML', 'CSS', 'FONT', 'IMAGES', 'SCRIPT'];
  // the time axis: ticks, no numbers
  d.arrow(x0, 50, 380, 50, 6); for (let x = x0; x <= 360; x += 31) d.line(x, 46, x, 50);
  d.text('TIME', 380, 42, { anchor: 'end', size: 10 });
  d.text('A · ONE AFTER ANOTHER', 20, 74, { size: 11 });
  const long = [36, 44, 34, 70, 52]; let x = x0;
  names.forEach((n, i) => { const y = 84 + i * 15; d.text(n, 20, y + 8.5, { size: 10 }); d.rect(x, y, long[i], 9); x += long[i]; });
  d.dimH(x0, x, 166);
  d.text('B · SIDE BY SIDE', 20, 196, { size: 11 });
  const short = [22, 20, 16, 30, 22], start = [0, 3, 3, 6, 5];
  names.forEach((n, i) => { const y = 206 + i * 15; d.text(n, 20, y + 8.5, { size: 10 }); d.rect(x0 + start[i], y, short[i], 9); });
  d.dimH(x0, x0 + 36, 288);
  return d;
}

// 2 · The right algorithm, written for you: which driver gets this delivery (a precise decision flowchart)
function algorithm() {
  // round 5: the branch labels (YES, NO, NEXT) went up one size, 10 -> 11.5, the size of the box words (they were
  // about 6 px capitals on the S23)
  const SMALL = 11.5;
  const d = sheet(380, 468, 11.5); head(d, '02', 'WHICH DRIVER?');
  const cx = 160;
  d.box(cx - 70, 40, 140, 30, 'NEW DELIVERY', { round: true });
  d.arrow(cx, 70, cx, 92, 7);
  d.box(cx - 90, 92, 180, 42, ['FIND FREE DRIVERS', 'NEAR THE PICKUP']);
  d.arrow(cx, 134, cx, 154, 7);
  d.diamond(cx, 188, 150, 68, 'ANY FREE?');
  // no: wait, then look again
  d.line(cx + 75, 188, 300, 188).text('NO', cx + 84, 182, { size: SMALL });
  d.box(258, 202, 98, 40, ['WAIT,', 'TRY AGAIN']);
  d.arrow(300, 188, 300, 202, 6);
  d.path([[307, 202], [307, 113], [cx + 90, 113]], 6);
  d.arrow(cx, 222, cx, 246, 7).text('YES', cx + 8, 238, { size: SMALL });
  d.box(cx - 90, 246, 180, 42, ['RANK BY TIME', 'TO THE PICKUP']);
  d.arrow(cx, 288, cx, 306, 7);
  d.diamond(cx, 340, 160, 68, ['MAKES THE', 'TIME SLOT?']);
  // no: the next driver in the ranking
  d.line(cx - 80, 340, 34, 340).text('NO', cx - 88, 334, { size: SMALL, anchor: 'end' });
  d.path([[34, 340], [34, 267], [cx - 90, 267]], 6).text('NEXT', 40, 302, { size: SMALL });
  d.arrow(cx, 374, cx, 398, 7).text('YES', cx + 8, 390, { size: SMALL });
  d.box(cx - 80, 398, 160, 32, 'ASSIGN · NOTIFY', { round: true });
  return d;
}

// 3 · Understanding your customers: their path through an app, the point where they give up, the fix drawn in
function customers() {
  const d = sheet(400, 330, 11); head(d, '03', 'A CUSTOMER’S PATH');
  const sw = 50, sh = 76;
  const screen = (x, y, name) => {
    d.rrect(x, y, sw, sh, 5);
    d.line(x + 8, y + 16, x + sw - 8, y + 16).line(x + 8, y + 28, x + sw - 18, y + 28).line(x + 8, y + 40, x + sw - 12, y + 40);
    d.text(name, x + sw / 2, y + sh + 14, { anchor: 'middle', size: 10 });
  };
  const X = [40, 175, 310], Y1 = 52, Y2 = 196;
  screen(X[0], Y1, 'OPEN'); d.arrow(X[0] + sw, Y1 + sh / 2, X[1], Y1 + sh / 2, 6);
  screen(X[1], Y1, 'BROWSE'); d.arrow(X[1] + sw, Y1 + sh / 2, X[2], Y1 + sh / 2, 6);
  screen(X[2], Y1, 'PICK'); d.path([[X[2] + sw / 2, Y1 + sh + 20], [X[2] + sw / 2, Y2]], 6);
  screen(X[2], Y2, 'SIGN UP');
  // where they give up: the path breaks off, marked
  d.dash(X[2], Y2 + sh / 2, X[1] + sw + 8, Y2 + sh / 2);
  const mx = (X[1] + sw + X[2]) / 2 + 4, my = Y2 + sh / 2;
  d.line(mx - 6, my - 6, mx + 6, my + 6).line(mx - 6, my + 6, mx + 6, my - 6);
  d.text('THEY LEAVE', mx, my - 14, { anchor: 'middle', size: 10 });
  screen(X[1], Y2, 'PAY'); d.arrow(X[1], Y2 + sh / 2, X[0] + sw, Y2 + sh / 2, 6);
  screen(X[0], Y2, 'DONE');
  // the fix, drawn in last: from PICK straight to PAY ("pay as a guest"), with a revision triangle
  const f0 = [X[2], Y1 + sh - 10], f1 = [X[1] + sw / 2, Y2];
  d.arrow(f0[0], f0[1], f1[0], f1[1], 6);
  // its note at the left, on a leader to the path: a revision triangle and the change
  const tx = 46, ty = 170, mid = [f0[0] + (f1[0] - f0[0]) * 0.55, f0[1] + (f1[1] - f0[1]) * 0.55];
  d.poly([[tx, ty - 8], [tx + 8, ty + 6], [tx - 8, ty + 6]], true).text('1', tx, ty + 4.5, { anchor: 'middle', size: 8 });
  d.text('FIX: PAY AS A GUEST', tx + 14, ty + 4, { size: 10 });
  d.line(tx + 14 + 19 * 10 * 0.8 + 4, ty, mid[0] - 4, mid[1]);
  return d;
}

// 4 · Apps for iPhone and Android: the blueprint of our app's screen on the two phones (true outlines, mm); the
// corridor then turns it real (the still of the real phones running the same app sits exactly on these lines)
function phones() {
  const R = PHONE_PAIR.region, m = 8, top = 13, w = (R.x1 - R.x0) + 2 * m, h = (R.y1 - R.y0) + top + 15;
  const d = sheet(w, h, 5.6); head(d, '04', 'BOOKING APP · CONCEPT');
  const U = (x) => m + (x - R.x0), V = (y) => top + (R.y1 - y);   // mm (y up) -> drawing units (y down)
  d.region = { u: m, v: top, w: R.x1 - R.x0, h: R.y1 - R.y0 };
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
    d.text(p.label, U(p.x + p.w / 2), V(R.y0) + 9, { anchor: 'middle' });
  });
  return d;
}

export const FRAMES = [
  { key: 'optimizing', side: 'l', caption: 'Optimizing.', alt: 'Blueprint: a page-load timeline. Five loads running one after another are redrawn as short loads running side by side.', draw: optimizing() },
  { key: 'algorithm', side: 'r', caption: 'The right algorithm, written for you.', alt: 'Blueprint: a decision flowchart for which driver gets a delivery: find free drivers near the pickup, rank them by time to the pickup, check the time slot, assign and notify.', draw: algorithm() },
  { key: 'customers', side: 'l', caption: 'Understanding your customers.', alt: 'Blueprint: a customer’s path through an app, from open to done. The path breaks off at sign-up, where they leave; the fix is drawn in: pay as a guest.', draw: customers() },
  { key: 'apps', side: 'r', caption: 'Apps for iPhone and Android.', alt: 'Blueprint of our booking app’s screen on an iPhone and an Android phone, which turns into the app running on the real phones.', draw: phones(), real: 'media/phones-unverified/corridor-phones.webp' },
];

/** a drawing as an SVG string (reduced motion: the still figures; the asset sheet) */
export function toSVG(d, { ink = '#FFFFFF', ground = '#173F73', pad = 0 } = {}) {
  const f = (v) => +v.toFixed(2);
  const path = d.segs.map(([a, b, c, e]) => `M${f(a)} ${f(b)}L${f(c)} ${f(e)}`).join('');
  const txt = d.labels.map((l) => `<text x="${f(l.x)}" y="${f(l.y)}" font-size="${f(l.size)}" text-anchor="${l.anchor}">${l.t}</text>`).join('');
  return `<svg viewBox="${-pad} ${-pad} ${f(d.w + 2 * pad)} ${f(d.h + 2 * pad)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<rect x="0" y="0" width="${f(d.w)}" height="${f(d.h)}" fill="${ground}"/>` +
    `<path d="${path}" fill="none" stroke="${ink}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/>` +
    `<g fill="${ink}" font-family="DM Mono, monospace" font-weight="500" letter-spacing=".06em">${txt}</g></svg>`;
}

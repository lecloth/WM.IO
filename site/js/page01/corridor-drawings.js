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
    dimH(x1, x2, y, o = {}) { (d.dims ||= []).push({ x1, x2, y, ext: o.ext ?? w / 90, size: size * 0.75, at: segs.length }); return d; },
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
const head = (d, fig, title) => { d.text(`FIG. ${fig} · ${title}`, 0, d.size * 0.9, { size: d.size * 0.86 }); d.text(`${fig} / 05`, d.w, d.size * 0.9, { size: d.size * 0.86, anchor: 'end' }); };
// Round 8: every drawing keeps half a grid cell of clear space round its words at rest on a 360-wide phone (TYPE_RULES
// rule 2): about 16 drawing units at these sizes. CLEAR is that space; label sizes are 14 (head 12).
const CLEAR = 17, S = 14;

// a phone screen as a wireframe (rounded outline, a status line), w x h at (x, y)
function screenAt(d, x, y, w, h) { d.rrect(x, y, w, h, 7); d.line(x + 10, y + 12, x + w - 10, y + 12); return d; }

// 1 · The property app's enquiry path: search, a listing, a long enquiry form where people give up; the fix drawn in
// (ask about this home in one tap, straight from the listing)
function enquiry() {
  const d = sheet(400, 384, S); head(d, '01', 'ENQUIRY PATH');
  const sw = 64, sh = 88, X = [16, 168, 320], top = 76, nameY = 52;
  [['SEARCH', 0], ['LISTING', 1], ['ENQUIRE', 2]].forEach(([n, i]) => d.text(n, X[i] + sw / 2, nameY, { anchor: 'middle' }));
  // search: a search bar and three result rows
  screenAt(d, X[0], top, sw, sh); d.rect(X[0] + 9, top + 22, sw - 18, 11);
  [44, 58, 72].forEach((yy) => d.line(X[0] + 9, top + yy, X[0] + sw - 9, top + yy));
  // the listing: a photo, the price line, the details
  screenAt(d, X[1], top, sw, sh); d.rect(X[1] + 9, top + 22, sw - 18, 26); d.line(X[1] + 9, top + 58, X[1] + 38, top + 58).line(X[1] + 9, top + 70, X[1] + sw - 9, top + 70);
  // the enquiry form: field after field (where they give up)
  screenAt(d, X[2], top, sw, sh); [24, 34, 44, 54, 64, 74].forEach((yy) => d.line(X[2] + 9, top + yy, X[2] + sw - 9, top + yy));
  const mid = top + sh / 2;
  d.arrow(X[0] + sw, mid, X[1], mid, 7).arrow(X[1] + sw, mid, X[2], mid, 7);
  // they leave: the path breaks off below the form, marked with a cross
  const lx = X[2] + sw / 2, ly = top + sh + 44;
  d.dash(lx, top + sh, lx, ly - 10);
  d.line(lx - 7, ly - 7, lx + 7, ly + 7).line(lx - 7, ly + 7, lx + 7, ly - 7);
  d.text('THEY LEAVE', lx - 7 - CLEAR, ly + 4.9, { anchor: 'end' });
  // the fix: from the listing straight down to "sent"
  const fx = X[1] + sw / 2, sy = 268;
  d.arrow(fx, top + sh, fx, sy, 7);
  d.text('ASK IN ONE TAP', fx - CLEAR, top + sh + 58, { anchor: 'end' });
  screenAt(d, X[1], sy, sw, sh); d.circle(fx, sy + 46, 12); d.line(fx - 6, sy + 46, fx - 1, sy + 51).line(fx - 1, sy + 51, fx + 7, sy + 41);
  d.text('SENT', fx, sy + sh + CLEAR + 9.8, { anchor: 'middle' });
  return d;
}

// 2 · A watch face, from the customer to the palette: who wears it, what it must feel like, the palette and type, then
// the face itself (method, never results)
function watch() {
  const d = sheet(400, 330, S); head(d, '02', 'FROM PEOPLE TO A PALETTE');
  const lx = 0;
  // 1 who: three people
  d.text('1 · WHO', lx, 56);
  [[22, 100, 1], [58, 96, 1.12], [94, 101, 0.94]].forEach(([cx, cy, k]) => d.circle(cx, cy - 10 * k, 8 * k).arc(cx, cy + 22 * k, 16 * k, Math.PI * 1.08, Math.PI * 1.92, 10));
  // 2 feel: two scales with their marks
  d.text('2 · FEEL', lx, 150);
  [['CALM', 0.7, 178], ['EXACT', 0.86, 210]].forEach(([t, v, y]) => {
    d.text(t, lx, y + 4.9);
    const a = 74, b = 150; d.line(a, y, b, y).line(a, y - 4, a, y + 4).line(b, y - 4, b, y + 4);
    const mx = a + (b - a) * v; d.line(mx, y - 8, mx, y + 8);
  });
  // 3 palette and type: four swatches told apart by hatching
  d.text('3 · PALETTE', lx, 256);
  [0, 3, 6, 11].forEach((n, i) => { const x = lx + i * 34, y = 274; d.rect(x, y, 24, 24); for (let k = 1; k <= n; k++) d.line(x, y + 24 * k / (n + 1), x + 24, y + 24 * k / (n + 1)); });
  // the way through, to the face
  d.arrow(166, 190, 206, 190, 7);
  // 4 the face: case, bezel, twelve indices, two hands, the crown, lugs and strap
  const cx = 300, cy = 196, R = 84;
  d.text('4 · THE FACE', cx, 56, { anchor: 'middle' });
  d.line(cx - 34, cy - R - 26, cx - 30, cy - R + 4).line(cx + 34, cy - R - 26, cx + 30, cy - R + 4);   // top lugs and strap
  d.line(cx - 34, cy + R + 26, cx - 30, cy + R - 4).line(cx + 34, cy + R + 26, cx + 30, cy + R - 4);
  d.circle(cx, cy, R).circle(cx, cy, R - 10);
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r0 = R - 22 - (k % 3 ? 0 : 6), r1 = R - 16; d.line(cx + r0 * Math.sin(a), cy - r0 * Math.cos(a), cx + r1 * Math.sin(a), cy - r1 * Math.cos(a)); }
  d.line(cx, cy, cx + 30 * Math.sin(2.2), cy - 30 * Math.cos(2.2)).line(cx, cy, cx + 50 * Math.sin(-0.55), cy - 50 * Math.cos(-0.55));
  d.circle(cx, cy, 3);
  d.rect(cx + R, cy - 7, 9, 14);   // the crown
  return d;
}

// 3 · The delivery tracker: which driver gets this delivery (the rules, as steps a machine follows every time). Round 8:
// two columns, so it stays wide enough on a phone for its words to keep their clear space
function dispatch() {
  const d = sheet(480, 410, S); head(d, '03', 'WHICH DRIVER?');
  const cx = 112, bh = 9.8 + 2 * CLEAR, bh2 = bh + 18.2;
  d.box(cx - 86, 40, 172, bh, 'NEW DELIVERY');
  d.arrow(cx, 40 + bh, cx, 118, 7);
  d.box(cx - 110, 118, 220, bh2, ['FREE DRIVERS', 'NEAR THE PICKUP']);
  d.arrow(cx, 118 + bh2, cx, 214, 7);
  d.box(cx - 110, 214, 220, bh2, ['RANK BY TIME', 'TO THE PICKUP']);
  const dx = 370, dy = 214 + bh2 / 2;
  d.arrow(cx + 110, dy, dx - 110, dy, 7);
  d.diamond(dx, dy, 220, 112, ['MAKES THE', 'TIME SLOT?']);
  // no: look again, from the free drivers
  d.path([[dx, dy - 56], [dx, 150], [cx + 110, 150]], 7);
  d.text('NO', dx + CLEAR, 177);
  // yes: assign and notify
  d.arrow(dx, dy + 56, dx, 350, 7).text('YES', dx + CLEAR, 330);
  d.box(dx - 98, 350, 196, bh, 'ASSIGN · NOTIFY');
  return d;
}

// 4 · The website loading: parts that load one after another, redrawn as parts that load side by side. Each timeline
// carries its live measured length (on the visitor's screen at rest), never a claimed result.
function website() {
  const d = sheet(400, 400, S); head(d, '04', 'PAGE LOAD');
  const x0 = 104, names = ['HTML', 'CSS', 'FONT', 'IMAGES', 'SCRIPT'], rh = 10, step = 22;
  d.text('A · ONE AFTER ANOTHER', 0, 56);
  const long = [34, 42, 32, 66, 52]; let x = x0;
  names.forEach((n, i) => { const y = 74 + i * step; d.text(n, 0, y + rh / 2 + 4.9); d.rect(x, y, long[i], rh); x += long[i]; });
  d.dimH(x0, x, 74 + 5 * step + 22);
  d.text('B · SIDE BY SIDE', 0, 238);
  const short = [22, 20, 16, 30, 22], start = [0, 4, 4, 8, 6];
  names.forEach((n, i) => { const y = 256 + i * step; d.text(n, 0, y + rh / 2 + 4.9); d.rect(x0 + start[i], y, short[i], rh); });
  d.dimH(x0, x0 + 38, 256 + 5 * step + 22);
  return d;
}

// 5 · On every phone they carry: the blueprint of our booking app's screen on the two phones (true outlines, mm); the
// hallway then turns it real (the still of the real phones running the same app sits exactly on these lines)
function phones() {
  const R = PHONE_PAIR.region, m = 0, top = 16, w = (R.x1 - R.x0) + 2 * m, h = (R.y1 - R.y0) + top + 17;
  const d = sheet(w, h, 5.6); head(d, '05', 'BOOKING APP');
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
    d.text(p.label, U(p.x + p.w / 2), V(R.y0) + 12.5, { anchor: 'middle' });
  });
  return d;
}

// Round 8: the five canvases each show their point on one of our made-up products (named by what they are, never a
// brand): 1 the property app's enquiry path, 2 a watch face (from the customer to the palette), 3 the delivery tracker
// ("which driver gets this delivery"), 4 the website loading, 5 the booking app on the iPhone 18 and the S26. Each has
// its label: the title (big, serif), a small mono line naming the drawing, one line of story (the chat's drafts,
// flagged for Wajih). cells: the sheet's shape in whole grid cells (width : height); its blue margin takes up the
// difference, so the sheet sits on the grid while the drawing inside keeps its true proportions.
export const FRAMES = [
  { key: 'enquiry', side: 'l', cells: [6, 6], wide: [6, 5], caption: 'Where customers give up.', fig: 'Fig. 01 · Property app · enquiry path',
    story: 'We walk every step your customers take, find the one that loses them, and fix it.',
    alt: 'Blueprint: the property app’s enquiry path. Search, a listing, then a long enquiry form where people leave; the fix is drawn in: ask about the home in one tap, straight from the listing.', draw: enquiry() },
  { key: 'watch', side: 'r', cells: [6, 5], caption: 'Design that understands people.', fig: 'Fig. 02 · Watch face',
    story: 'First we learn what your customers need to feel. Then every colour, shape and word is chosen for it.',
    alt: 'Blueprint: who wears the watch, what it must feel like (calm, exact), a palette, then the watch face itself with its indices, hands and crown.', draw: watch() },
  { key: 'dispatch', side: 'l', cells: [6, 5], caption: 'Your way of deciding, built in.', fig: 'Fig. 03 · Delivery tracker',
    story: 'The rules you carry in your head, turned into a system that decides like you, every time.',
    alt: 'Blueprint: the delivery tracker’s decision flow for which driver gets a delivery: free drivers near the pickup, ranked by time to the pickup; if the first can’t make the time slot, look again; then assign and notify.', draw: dispatch() },
  { key: 'website', side: 'r', cells: [6, 5], caption: 'Speed.', fig: 'Fig. 04 · Website · page load',
    story: 'Every second of waiting costs you a customer. We find the slow parts and cut them.',
    alt: 'Blueprint: a website loading. Five parts loading one after another are redrawn as parts loading side by side; each timeline carries its measured length.', draw: website() },
  { key: 'apps', side: 'l', cells: [1, 1], caption: 'On every phone they carry.', fig: 'Fig. 05 · Booking app',
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

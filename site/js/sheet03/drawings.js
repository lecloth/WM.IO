// Sheet 03: what the studio builds today, as hairline drawings made in code (no logos, no brands).
// Each drawing is described in its own drawing units (du) inside a W x H box, y down. build(key, box) fits it into a
// box in px and returns { paths: [{ d, cls }], labels: [...] } ready for the redraw. Labels are text: they are shown
// whole or not at all, never drawn on.

const ISO = 0.8660254;

// ---------- primitives (du) ----------
const rect = (x, y, w, h, r = 0) => ({ t: 'rr', x, y, w, h, r });
const pl = (...pts) => ({ t: 'pl', pts });
const circ = (x, y, r) => ({ t: 'el', x, y, rx: r, ry: r });
const ell = (x, y, rx, ry) => ({ t: 'el', x, y, rx, ry });
const raw = (fn) => ({ t: 'raw', fn });   // fn(X, Y, k) -> path data in px
const cls = (c, items) => items.map((it) => ({ ...it, cls: c }));

// labels: anchor (ax, ay) -> text at (tx, ty); lines: [no + name, sub]; align 'start' | 'middle' | 'end'
const lab = (ax, ay, tx, ty, name, sub = '', align = 'start', leader = true) => ({ ax, ay, tx, ty, name, sub, align, leader });
const tag = (x, y, name, align = 'middle', sub = '') => ({ ax: x, ay: y, tx: x, ty: y, name, sub, align, leader: false });

// ---------- 03.1 websites: a page pulled apart into five layers (isometric) ----------
function websites() {
  const OX = 118, OY = 210;
  const P = (u, v, z) => [OX + (u - v) * ISO, OY + (u + v) * 0.5 - z];
  const quad = (u0, v0, u1, v1, z) => pl(...P(u0, v0, z), ...P(u1, v0, z), ...P(u1, v1, z), ...P(u0, v1, z), ...P(u0, v0, z));
  const seg = (u0, v0, u1, v1, z) => pl(...P(u0, v0, z), ...P(u1, v1, z));
  const items = [], labels = [];
  const Z = [200, 150, 100, 50, 0];
  // explode guides at the four corners (centre lines)
  for (const [u, v] of [[0, 0], [200, 0], [200, 130], [0, 130]]) items.push(...cls('centre', [pl(...P(u, v, 0), ...P(u, v, 200))]));
  // 01 page
  let z = Z[0];
  items.push(quad(0, 0, 200, 130, z), seg(0, 12, 200, 12, z), quad(30, 4, 150, 8, z), quad(10, 20, 120, 62, z),
    seg(128, 24, 190, 24, z), seg(128, 32, 176, 32, z), quad(128, 42, 160, 50, z));
  for (const u of [10, 72, 134]) items.push(quad(u, 72, u + 56, 120, z));
  // 02 grid
  z = Z[1];
  items.push(quad(0, 0, 200, 130, z));
  for (let i = 0; i <= 12; i++) items.push(...cls('thin', [seg(10 + i * 15, 8, 10 + i * 15, 122, z)]));
  // 03 content
  z = Z[2];
  items.push(quad(0, 0, 200, 130, z), quad(122, 14, 190, 70, z), seg(122, 14, 190, 70, z), seg(190, 14, 122, 70, z));
  for (const v of [16, 24, 32, 40, 48, 56]) items.push(seg(10, v, v === 56 ? 70 : 110, v, z));
  for (const v of [80, 88, 96, 104]) items.push(seg(10, v, v === 104 ? 120 : 190, v, z));
  // 04 shop + booking
  z = Z[3];
  items.push(quad(0, 0, 200, 130, z));
  for (const v of [14, 32, 50]) items.push(quad(10, v, 100, v + 12, z));
  items.push(quad(10, 72, 54, 84, z), quad(120, 14, 190, 64, z));
  for (let i = 1; i < 7; i++) items.push(...cls('thin', [seg(120 + i * 10, 14, 120 + i * 10, 64, z)]));
  for (let j = 1; j < 5; j++) items.push(...cls('thin', [seg(120, 14 + j * 10, 190, 14 + j * 10, z)]));
  items.push(quad(150, 34, 160, 44, z), seg(150, 34, 160, 44, z));
  // 05 hosting
  z = Z[4];
  items.push(quad(0, 0, 200, 130, z));
  for (let i = 0; i < 4; i++) { const v = 10 + i * 29; items.push(quad(10, v, 190, v + 20, z), seg(22, v + 10, 70, v + 10, z), seg(168, v + 6, 168, v + 14, z), seg(178, v + 6, 178, v + 14, z)); }
  const names = [['01 Page', 'What visitors see'], ['02 Grid', 'Every screen size'], ['03 Content', 'Edited by you'], ['04 Shop + booking', 'Open at 3 a.m.'], ['05 Hosting', 'Fast, backed up']];
  Z.forEach((zz, i) => { const [ax, ay] = P(200, 0, zz); labels.push(lab(ax + 4, ay, 318, ay - 6, names[i][0], names[i][1])); });
  return { W: 420, H: 380, items, labels };
}

// ---------- 03.2 apps: today's phone with its screens drawn in (mm, scale 1:1) ----------
function apps() {
  const O = 62, T = 95;   // phone centre in du
  const X = (x) => O + x, Y = (y) => T + y;
  const R = (x, y, w, h, r) => rect(X(x), Y(y), w, h, r);
  const items = [
    R(-37, -77, 74, 154, 11), R(-34, -73.6, 68, 147.2, 8.6), circ(X(0), Y(-69), 1.9),
    pl(X(-37.9), Y(-48), X(-37.9), Y(-36)), pl(X(-37.9), Y(-32), X(-37.9), Y(-20)), pl(X(37.9), Y(-50), X(37.9), Y(-28)),
    R(-28, -60, 30, 4, 1), R(-28, -50, 56, 8, 4),
  ];
  for (let i = 0; i < 3; i++) { const y = -36 + i * 26; items.push(R(-28, y, 56, 22, 3), R(-25, y + 4, 14, 14, 2), pl(X(-7), Y(y + 7), X(22), Y(y + 7)), pl(X(-7), Y(y + 13), X(12), Y(y + 13))); }
  items.push(pl(X(-34), Y(54), X(34), Y(54)));
  for (const x of [-21, -7, 7, 21]) items.push(circ(X(x), Y(62), 2.6));
  items.push(pl(X(-12), Y(70), X(12), Y(70)));
  items.push(...cls('centre', [pl(X(0), Y(-86), X(0), Y(86)), pl(X(-46), Y(0), X(46), Y(0))]));
  // dimensions
  items.push(...cls('dim', [pl(X(-37), Y(80), X(-37), Y(92)), pl(X(37), Y(80), X(37), Y(92)), pl(X(-37), Y(88), X(37), Y(88)),
    pl(X(-48), Y(-77), X(-41), Y(-77)), pl(X(-48), Y(77), X(-41), Y(77)), pl(X(-45), Y(-77), X(-45), Y(77))]));
  items.push(...cls('arrow', [arrow(X(-37), Y(88), 1, 0), arrow(X(37), Y(88), -1, 0), arrow(X(-45), Y(-77), 0, 1), arrow(X(-45), Y(77), 0, -1)]));
  const labels = [
    tag(X(0), Y(84.5), '74.0 mm'), { ...tag(X(-48.5), Y(0), '154.0 mm'), rot: -90 },
    lab(X(28), Y(-25), 128, Y(-34), '01 Screens', 'Drawn one by one'),
    lab(X(22), Y(17), 128, Y(8), '02 Offline store', 'Works without a signal'),
    lab(X(34), Y(54), 128, Y(50), '03 Sync', 'In step with your systems'),
  ];
  return { W: 230, H: 190, items, labels };
}

function arrow(x, y, dx, dy, s = 6) {   // filled arrowhead at (x, y) pointing away from (dx, dy) direction of the line
  return raw((X, Y, k) => {
    const L = s, Wd = s * 0.36;
    const px = X(x), py = Y(y), ux = dx, uy = dy, vx = -uy, vy = ux;
    return `M${px} ${py}L${px + ux * L + vx * Wd} ${py + uy * L + vy * Wd}L${px + ux * L - vx * Wd} ${py + uy * L - vy * Wd}Z`;
  });
}

// ---------- 03.3 platforms: six services wired to one hub, inside a closed boundary with one locked door ----------
function platforms() {
  const items = [], labels = [];
  items.push(...cls('dash', [pl(204, 290, 10, 290, 10, 10, 430, 10, 430, 290, 236, 290)]));
  // the door: a lock in the boundary
  items.push(rect(209, 284, 22, 15, 2), raw((X, Y) => `M${X(213)} ${Y(284)}V${Y(278)}A${X(220) - X(213)} ${X(220) - X(213)} 0 0 1 ${X(227)} ${Y(278)}V${Y(284)}`), circ(220, 290.5, 1.8), pl(220, 292.5, 220, 296));
  items.push(pl(220, 334, 220, 299), pl(220, 278, 220, 190));
  // the hub, with its jacks (the switchboard, today)
  items.push(rect(170, 130, 100, 60, 6));
  for (const x of [192, 208, 224, 240]) for (const y of [152, 168]) items.push(circ(x + 4, y, 3));
  // services and their wiring (two buses, like the multiple board's lines)
  const left = [40, 125, 210], right = [40, 125, 210];
  for (const y of left) items.push(rect(30, y, 80, 40, 4), circ(100, y + 20, 4), pl(104, y + 20, 140, y + 20), circ(140, y + 20, 1.6));
  for (const y of right) items.push(rect(330, y, 80, 40, 4), circ(340, y + 20, 4), pl(336, y + 20, 300, y + 20), circ(300, y + 20, 1.6));
  items.push(pl(140, 60, 140, 230), pl(140, 160, 170, 160), pl(300, 60, 300, 230), pl(300, 160, 270, 160));
  const names = ['Customers', 'Staff', 'Payments', 'Stock', 'Accounts', 'Messages'];
  left.forEach((y, i) => labels.push(tag(62, y + 23, names[i])));
  right.forEach((y, i) => labels.push(tag(378, y + 23, names[i + 3])));
  labels.push(tag(220, 122, 'Platform'), lab(231, 292, 300, 318, 'One door', 'Every role checked'), tag(228, 330, 'Users', 'start'));
  return { W: 440, H: 340, items, labels };
}

// ---------- 03.4 infrastructure: redundant paths from users to data ----------
function infra() {
  const items = [], labels = [];
  const cyl = (cx, top, rx, ry, h) => [ell(cx, top, rx, ry), pl(cx - rx, top, cx - rx, top + h), pl(cx + rx, top, cx + rx, top + h),
    raw((X, Y) => `M${X(cx - rx)} ${Y(top + h)}A${(X(cx + rx) - X(cx - rx)) / 2} ${Y(top + ry) - Y(top)} 0 0 0 ${X(cx + rx)} ${Y(top + h)}`)];
  items.push(rect(0, 142, 56, 36, 4));
  items.push(pl(56, 154, 70, 154, 70, 78, 96, 78), pl(56, 166, 82, 166, 82, 242, 96, 242));
  items.push(rect(96, 60, 64, 36, 4), rect(96, 224, 64, 36, 4));
  items.push(...cls('dash', [rect(190, 18, 150, 134, 2), rect(190, 168, 150, 134, 2)]));
  const servers = [40, 98, 190, 248];
  for (const y of servers) items.push(rect(220, y, 90, 32, 3), pl(230, y + 11, 270, y + 11), pl(230, y + 21, 262, y + 21), circ(298, y + 16, 2.4));
  for (const ly of [78, 242]) for (const y of servers) items.push(...cls('thin', [pl(160, ly, 220, y + 16)]));
  for (const y of servers) items.push(...cls('thin', [pl(310, y + 16, 380, 84)]));
  for (const y of servers) items.push(...cls('thin', [pl(310, y + 16, 380, 216)]));
  items.push(...cyl(410, 58, 30, 8, 46), ...cyl(410, 192, 30, 8, 46));
  items.push(...cls('dash', [pl(410, 114, 410, 182), pl(410, 248, 410, 278)]), arrow(410, 184, 0, -1), arrow(410, 112, 0, 1));
  items.push(rect(386, 278, 48, 30, 3), pl(396, 290, 424, 290), pl(396, 298, 416, 298));
  labels.push(tag(28, 164, 'Users'), tag(128, 82, 'LB A'), tag(128, 246, 'LB B'), tag(196, 12, 'Zone A', 'start'), tag(196, 162, 'Zone B', 'start'),
    tag(450, 84, 'Primary', 'start'), tag(450, 218, 'Replica', 'start'), lab(434, 293, 450, 297, 'Backups', 'Off site, restore-tested', 'start'));
  return { W: 560, H: 320, items, labels };
}

// ---------- 03.7 consulting: a survey network measured from one baseline ----------
function consulting() {
  const items = [], labels = [];
  const Pt = { A: [60, 260], B: [380, 260], C: [110, 90], D: [250, 50], E: [220, 170], F: [360, 120] };
  const sight = (a, b) => pl(...Pt[a], ...Pt[b]);
  items.push(sight('A', 'B'));
  items.push(...cls('thin', ['AC', 'CE', 'AE', 'EB', 'CD', 'DE', 'DF', 'FE', 'FB'].map((s) => sight(s[0], s[1]))));
  for (const k in Pt) {
    const [x, y] = Pt[k];
    items.push(pl(x, y - 7, x + 6, y + 4, x - 6, y + 4, x, y - 7), circ(x, y, 1.4));
  }
  // angles at A and B, measured from the drawing itself
  const ang = (o, a, b) => {
    const [ox, oy] = Pt[o], [ax, ay] = Pt[a], [bx, by] = Pt[b];
    const t1 = Math.atan2(ay - oy, ax - ox), t2 = Math.atan2(by - oy, bx - ox);
    return { o, t1, t2 };
  };
  const dms = (rad) => { const d = Math.abs(rad) * 180 / Math.PI; const D = Math.floor(d); const M = Math.round((d - D) * 60); return `${D}°${String(M).padStart(2, '0')}′`; };
  const arcs = [ang('A', 'B', 'E'), ang('A', 'E', 'C'), ang('B', 'E', 'A'), ang('B', 'F', 'E')];
  arcs.forEach((a, i) => {
    const r = 34 + (i % 2) * 14, [ox, oy] = Pt[a.o];
    let t1 = a.t1, t2 = a.t2;
    let dt = t2 - t1; while (dt > Math.PI) dt -= 2 * Math.PI; while (dt < -Math.PI) dt += 2 * Math.PI;
    items.push(...cls('dim', [raw((X, Y, k) => {
      const x1 = ox + Math.cos(t1) * r, y1 = oy + Math.sin(t1) * r, x2 = ox + Math.cos(t1 + dt) * r, y2 = oy + Math.sin(t1 + dt) * r;
      return `M${X(x1)} ${Y(y1)}A${r * k} ${r * k} 0 0 ${dt > 0 ? 1 : 0} ${X(x2)} ${Y(y2)}`;
    })]));
    const tm = t1 + dt / 2, rr = r + 16;
    labels.push(tag(ox + Math.cos(tm) * rr, oy + Math.sin(tm) * rr + 3, dms(dt), 'middle'));
  });
  // baseline dimension
  items.push(...cls('dim', [pl(60, 268, 60, 300), pl(380, 268, 380, 300), pl(60, 294, 380, 294)]), arrow(60, 294, 1, 0), arrow(380, 294, -1, 0));
  // north arrow + the sun it was found by
  items.push(pl(30, 78, 30, 28), arrow(30, 26, 0, 1, 8), circ(72, 36, 7));
  for (let i = 0; i < 8; i++) { const t = i * Math.PI / 4; items.push(...cls('thin', [pl(72 + Math.cos(t) * 10, 36 + Math.sin(t) * 10, 72 + Math.cos(t) * 15, 36 + Math.sin(t) * 15)])); }
  const names = { A: 'Website', B: 'Accounts', C: 'Shop', D: 'Stock', E: 'Team', F: 'Customers' };
  const off = { A: [0, 22], B: [0, 22], C: [-12, -12], D: [0, -14], E: [12, -10], F: [12, -10] };
  for (const k in Pt) labels.push(tag(Pt[k][0] + off[k][0], Pt[k][1] + off[k][1], names[k], off[k][0] < 0 ? 'end' : off[k][0] > 0 ? 'start' : 'middle'));
  labels.push(tag(220, 289, 'Baseline · what you have today'), tag(30, 92, 'N'));
  return { W: 440, H: 310, items, labels };
}

const DRAWINGS = { websites, apps, platforms, infra, consulting };

/** fit drawing `key` into box {x, y, w, h} (px), centred; fill = share of the box it may take */
export function build(key, box, fill = 0.94) {
  const D = DRAWINGS[key]();
  const k = Math.min(box.w / D.W, box.h / D.H) * fill;
  const ox = box.x + (box.w - D.W * k) / 2, oy = box.y + (box.h - D.H * k) / 2;
  const X = (x) => +(ox + x * k).toFixed(1), Y = (y) => +(oy + y * k).toFixed(1);
  const paths = D.items.map((it) => ({ d: toD(it, X, Y, k), cls: it.cls || '', x: minX(it, X) }));
  const labels = D.labels.map((l) => ({ ...l, ax: X(l.ax), ay: Y(l.ay), tx: X(l.tx), ty: Y(l.ty) }));
  return { paths, labels, k, rect: { x: ox, y: oy, w: D.W * k, h: D.H * k } };
}

function toD(it, X, Y, k) {
  if (it.t === 'rr') {
    const x = X(it.x), y = Y(it.y), W = it.w * k, H = it.h * k, r = Math.min(it.r * k, W / 2, H / 2);
    if (!r) return `M${x} ${y}H${x + W}V${y + H}H${x}Z`;
    return `M${x + r} ${y}H${x + W - r}Q${x + W} ${y} ${x + W} ${y + r}V${y + H - r}Q${x + W} ${y + H} ${x + W - r} ${y + H}H${x + r}Q${x} ${y + H} ${x} ${y + H - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
  }
  if (it.t === 'pl') { const p = it.pts; let d = `M${X(p[0])} ${Y(p[1])}`; for (let i = 2; i < p.length; i += 2) d += `L${X(p[i])} ${Y(p[i + 1])}`; return d; }
  if (it.t === 'el') { const rx = it.rx * k, ry = it.ry * k, a = X(it.x) - rx, b = Y(it.y); return `M${a} ${b}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`; }
  if (it.t === 'raw') return it.fn(X, Y, k);
  return '';
}
function minX(it, X) {
  if (it.t === 'rr' || it.t === 'el') return X(it.t === 'rr' ? it.x : it.x - it.rx);
  if (it.t === 'pl') { let m = Infinity; for (let i = 0; i < it.pts.length; i += 2) m = Math.min(m, X(it.pts[i])); return m; }
  return NaN;
}

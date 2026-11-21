// Sheet 06 geometry: real involute spur gears (20° pressure angle) and a closed ring of six of them.
// Design units: module m = 1 (the drawing labels them as m 4, i.e. millimetres x 4).
// A ring of six gears can turn because six is even (an odd ring would lock). The ring is solved so that it closes
// both in position (every neighbour pair sits at exactly its centre distance) and in tooth phase (the last mesh,
// Care -> Diagnose, fits tooth into gap like every other mesh).

const ALPHA = (20 * Math.PI) / 180;
const inv = (a) => Math.tan(a) - a;
const TAU = Math.PI * 2;

export const STAGES = [
  { key: 'diagnose', name: 'Diagnose', z: 30, build: 'spokes', n: 6 },
  { key: 'draw', name: 'Draw', z: 18, build: 'holes', n: 4 },
  { key: 'build', name: 'Build', z: 24, build: 'spokes', n: 5 },
  { key: 'break', name: 'Break', z: 20, build: 'web', n: 0 },
  { key: 'handover', name: 'Hand over', z: 26, build: 'holes', n: 6 },
  { key: 'care', name: 'Care', z: 16, build: 'web', n: 0 },
];

export function dims(z, m = 1) {
  const rp = (m * z) / 2;
  return { rp, rb: rp * Math.cos(ALPHA), ra: rp + m, rf: rp - 1.25 * m };
}

/** closed outline of an involute spur gear, tooth 0 centred on angle 0; returns [[x,y], ...] (y down) */
export function gearPoints(z, m = 1, { backlash = 0.05, steps = 7 } = {}) {
  const { rp, rb, ra, rf } = dims(z, m);
  const psiP = (Math.PI / (2 * z)) * (1 - backlash);
  const psi = (r) => (r <= rb ? psiP + inv(ALPHA) : psiP + inv(ALPHA) - inv(Math.acos(rb / r)));
  const pts = [];
  const at = (r, a) => pts.push([r * Math.cos(a), r * Math.sin(a)]);
  const r0 = Math.max(rf, Math.min(rb, rf));
  for (let i = 0; i < z; i++) {
    const c = (TAU * i) / z;
    // right flank, root -> tip
    for (let s = 0; s <= steps; s++) { const r = r0 + ((ra - r0) * s) / steps; at(r, c - psi(r)); }
    // tip land
    at(ra, c);
    // left flank, tip -> root
    for (let s = steps; s >= 0; s--) { const r = r0 + ((ra - r0) * s) / steps; at(r, c + psi(r)); }
    // root land to the next tooth
    const a0 = c + psi(r0), a1 = c + TAU / z - psi(r0);
    for (let s = 1; s < 3; s++) at(rf, a0 + ((a1 - a0) * s) / 3);
  }
  return pts;
}

/** angle of gear B so it meshes with gear A (A at angle thA, B in direction phi from A) */
export function meshAngle(thA, zA, zB, phi) {
  return phi + Math.PI - Math.PI / zB + (phi - thA) * (zA / zB);
}

const wrapPitch = (d, z) => { const u = (d * z) / TAU; return u - Math.round(u); };   // phase error in pitches

/** solve the ring. Returns { centres: [[x,y]...], phis: [dir 1->2, 2->3, ..., 6->1], base: [phase offsets] } */
export function solveRing(m = 1) {
  const z = STAGES.map((s) => s.z);
  const d = (i, j) => (m * (z[i] + z[j])) / 2;
  const deg = Math.PI / 180;
  const fixed = [60 * deg, 120 * deg, 180 * deg];   // 2->3, 3->4, 4->5 (y down: clockwise from the top left)
  function build(t) {
    const C = [[0, 0]];
    const dirs = [t, ...fixed];
    for (let k = 0; k < 4; k++) {
      const [x, y] = C[k];
      C.push([x + d(k, k + 1) * Math.cos(dirs[k]), y + d(k, k + 1) * Math.sin(dirs[k])]);
    }
    // gear 6 at the intersection of circle(G5, d56) and circle(G1, d61), on the outer (left) side
    const [x5, y5] = C[4], [x1, y1] = C[0];
    const r5 = d(4, 5), r1 = d(5, 0);
    const dx = x1 - x5, dy = y1 - y5, D = Math.hypot(dx, dy);
    if (D > r5 + r1 || D < Math.abs(r5 - r1)) return null;
    const a = (r5 * r5 - r1 * r1 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, r5 * r5 - a * a));
    const mx = x5 + (a * dx) / D, my = y5 + (a * dy) / D;
    const cands = [[mx + (h * dy) / D, my - (h * dx) / D], [mx - (h * dy) / D, my + (h * dx) / D]];
    C.push(cands[0][0] < cands[1][0] ? cands[0] : cands[1]);
    const phis = C.map((c, i) => { const n = C[(i + 1) % 6]; return Math.atan2(n[1] - c[1], n[0] - c[0]); });
    // phases around the ring from gear 1 at angle 0
    const th = [0];
    for (let k = 1; k < 6; k++) th.push(meshAngle(th[k - 1], z[k - 1], z[k], phis[k - 1]));
    const back = meshAngle(th[5], z[5], z[0], phis[5]);
    return { C, phis, err: wrapPitch(back - th[0], z[0]) };
  }
  // scan for a root of the closing phase error near t = 0, then bisect
  let best = null;
  let prev = null, prevT = 0;
  for (let t = -18 * deg; t <= 18 * deg; t += 0.2 * deg) {
    const r = build(t);
    if (r && prev && Math.sign(r.err) !== Math.sign(prev.err) && Math.abs(r.err - prev.err) < 0.5) {
      let lo = prevT, hi = t, flo = prev.err;
      for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2, fm = build(mid).err;
        if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
      }
      const tt = (lo + hi) / 2;
      if (!best || Math.abs(tt) < Math.abs(best.t)) best = { t: tt, ...build(tt) };
    }
    prev = r; prevT = t;
  }
  if (!best) best = { t: 0, ...build(0) };
  return { centres: best.C, phis: best.phis, z };
}

/** angles of all six gears for a drive angle th1 of gear 1 */
export function ringAngles(th1, ring) {
  const { z, phis } = ring;
  const th = [th1];
  for (let k = 1; k < 6; k++) th.push(meshAngle(th[k - 1], z[k - 1], z[k], phis[k - 1]));
  return th;
}

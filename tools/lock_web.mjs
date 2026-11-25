// The real "Cutaway Lock" (zbzzn, Printables 250197, CC BY 4.0, site/media/models/lock/) for the web, made once, offline.
// Round 8: door-lock.bin (housing, plug, cap, clip merged; the hallway's door, until round 8b).
// Round 8b (finish the site): lock-parts.bin, the same lock kept in its parts so pages 2, 3 and 4 show one object: the
// housing, plug, cap and clip as meshes with their hairline edges, the five key pins, the five drivers and the key as
// hairline edges. Every edge set is chained into polylines and simplified (Douglas-Peucker): `edges` at 0.04 mm (close
// up), `lod` at 0.7 mm without the smallest bits (the lattice of many locks draws this one geometry hundreds of times).
// Lock space (millimetres): x across, y up (the plug's axis at y = 0), z out of the face (the face at z = 0, the body
// behind it, z < 0). From the STL files: (x, y, z) -> (-x, z, y).
//   lock-parts.bin: 'LKP2' u32 version u32 nParts; per part: 16 bytes name, u32 group, u32 nVerts, u32 nIndex,
//   u32 nEdgeFloats, u32 nLodFloats; then per part: Float32 positions, Uint32 indices, Float32 edges, Float32 lod.
//   node tools/lock_web.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../site/media/models/lock');
const loader = new STLLoader();
const PARTS = [
  ['housing', 'body.stl', 0, true], ['cap', 'lid.stl', 0, true], ['clip', 'clip.stl', 0, true], ['plug', 'core.stl', 1, true],
  ['pin1', 'pin-a.stl', 2], ['pin2', 'pin-b.stl', 2], ['pin3', 'pin-c.stl', 2], ['pin4', 'pin-d.stl', 2], ['pin5', 'pin-e.stl', 2],
  ['drv1', 'driver-standard.stl', 3], ['drv2', 'driver-spool.stl', 3], ['drv3', 'driver-mushroom.stl', 3], ['drv4', 'driver-serrated.stl', 3], ['drv5', 'driver-tpin.stl', 3],
  ['key', 'key_abcde.stl', 4],
];
const toLock = (a) => { for (let i = 0; i < a.length; i += 3) { const x = a[i], y = a[i + 1], z = a[i + 2]; a[i] = -x; a[i + 1] = z; a[i + 2] = y; } return a; };

/** chain segments into polylines (shared endpoints, quantised) and simplify each one */
function simplify(seg, tol, minLen = 0) {
  const q = (i) => `${Math.round(seg[i] * 200)},${Math.round(seg[i + 1] * 200)},${Math.round(seg[i + 2] * 200)}`;
  const n = seg.length / 6, ends = new Map(), used = new Uint8Array(n);
  const add = (k, s) => { (ends.get(k) || ends.set(k, []).get(k)).push(s); };
  for (let s = 0; s < n; s++) { add(q(s * 6), s); add(q(s * 6 + 3), s); }
  const pt = (s, e) => [seg[s * 6 + e * 3], seg[s * 6 + e * 3 + 1], seg[s * 6 + e * 3 + 2]];
  const out = [];
  for (let s0 = 0; s0 < n; s0++) {
    if (used[s0]) continue; used[s0] = 1;
    let line = [pt(s0, 0), pt(s0, 1)];
    for (const dirn of [1, 0]) {   // grow from the end, then from the start
      for (;;) {
        const tip = dirn ? line[line.length - 1] : line[0], k = `${Math.round(tip[0] * 200)},${Math.round(tip[1] * 200)},${Math.round(tip[2] * 200)}`;
        const c = (ends.get(k) || []).find((s) => !used[s]); if (c === undefined) break; used[c] = 1;
        const a = pt(c, 0), b = pt(c, 1), ka = `${Math.round(a[0] * 200)},${Math.round(a[1] * 200)},${Math.round(a[2] * 200)}`, nxt = ka === k ? b : a;
        if (dirn) line.push(nxt); else line.unshift(nxt);
      }
    }
    let len = 0; for (let i = 1; i < line.length; i++) len += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1], line[i][2] - line[i - 1][2]);
    if (len < minLen) continue;
    const dp = (pts) => {
      if (pts.length < 3) return pts;
      const a = pts[0], b = pts[pts.length - 1], ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...ab) || 1e-9;
      let far = -1, fd = 0;
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
        const cx = ap[1] * ab[2] - ap[2] * ab[1], cy = ap[2] * ab[0] - ap[0] * ab[2], cz = ap[0] * ab[1] - ap[1] * ab[0];
        const d = (Math.hypot(ab[0], ab[1], ab[2]) > 1e-9) ? Math.hypot(cx, cy, cz) / L : Math.hypot(...ap);
        if (d > fd) { fd = d; far = i; }
      }
      if (fd <= tol) return [a, b];
      return dp(pts.slice(0, far + 1)).slice(0, -1).concat(dp(pts.slice(far)));
    };
    const closed = line.length > 3 && Math.hypot(line[0][0] - line[line.length - 1][0], line[0][1] - line[line.length - 1][1], line[0][2] - line[line.length - 1][2]) < 0.01;
    const simp = closed ? dp(line.slice(0, Math.ceil(line.length / 2) + 1)).slice(0, -1).concat(dp(line.slice(Math.ceil(line.length / 2)))) : dp(line);
    for (let i = 1; i < simp.length; i++) out.push(...simp[i - 1], ...simp[i]);
  }
  return out;
}

const head = [], blocks = [];
let stats = [];
for (const [name, file, group, mesh] of PARTS) {
  const buf = fs.readFileSync(path.join(dir, file));
  const g = loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  g.deleteAttribute('normal');
  toLock(g.attributes.position.array);
  const raw = Array.from(new THREE.EdgesGeometry(g, 32).attributes.position.array);
  const edges = simplify(raw, 0.04), lod = group <= 1 ? simplify(raw, 0.7, 3) : [];
  let pos = new Float32Array(0), idx = new Uint32Array(0);
  if (mesh) { const m = mergeVertices(g, 1e-4); pos = new Float32Array(m.attributes.position.array); idx = new Uint32Array(m.index.array); }
  const nm = Buffer.alloc(16); nm.write(name, 'ascii');
  head.push(nm, Buffer.from(new Uint32Array([group, pos.length / 3, idx.length, edges.length, lod.length]).buffer));
  blocks.push(Buffer.from(pos.buffer), Buffer.from(idx.buffer), Buffer.from(new Float32Array(edges).buffer), Buffer.from(new Float32Array(lod).buffer));
  stats.push(`${name}: ${raw.length / 6} -> ${edges.length / 6} edges, lod ${lod.length / 6}, ${idx.length / 3} tris`);
}
const out = Buffer.concat([Buffer.from('LKP2'), Buffer.from(new Uint32Array([2, PARTS.length]).buffer), ...head, ...blocks]);
fs.writeFileSync(path.join(dir, 'lock-parts.bin'), out);
console.log(stats.join('\n'));
console.log(`lock-parts.bin: ${(out.length / 1024).toFixed(1)} KB`);

// Round 8: the door's lock for the web. The real "Cutaway Lock" (zbzzn, Printables 250197, CC BY 4.0, site/media/models/lock/)
// is four STL files (housing, plug, cap, clip: 0.7 MB) whose parsing and edge-finding stalled the phone's scroll. This
// merges them once, offline, into one indexed mesh plus its hairline edges (the same 32-degree crease rule the
// hallway used live), in the manifest's own millimetres and orientation, and writes site/media/models/lock/door-lock.bin:
//   header: 'LOCK' u32 version, u32 nVerts, u32 nIndex, u32 nEdgeFloats; then Float32 positions, Uint32 (or Uint16)
//   indices, Float32 edge segment positions (x, y, z, x, y, z ...).
//   node tools/lock_web.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeVertices, mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../site/media/models/lock');
const loader = new STLLoader(), geos = [], edges = [];
for (const f of ['body.stl', 'core.stl', 'lid.stl', 'clip.stl']) {
  const buf = fs.readFileSync(path.join(dir, f));
  const g = loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  g.deleteAttribute('normal');
  const eg = new THREE.EdgesGeometry(g, 32); edges.push(...eg.attributes.position.array);
  geos.push(mergeVertices(g, 1e-4));
}
const all = mergeGeometries(geos.map((g) => (g.index ? g : mergeVertices(g))), false);
const pos = all.attributes.position.array, idx = all.index.array, nV = pos.length / 3;
const big = nV > 65535, I = big ? new Uint32Array(idx) : new Uint16Array(idx);
const head = new Uint32Array([0x4b434f4c, big ? 2 : 1, nV, I.length, edges.length]);
const parts = [Buffer.from(head.buffer), Buffer.from(new Float32Array(pos).buffer), Buffer.from(I.buffer)];
const pad = (parts.reduce((s, b) => s + b.length, 0)) % 4; if (pad) parts.push(Buffer.alloc(4 - pad));
parts.push(Buffer.from(new Float32Array(edges).buffer));
const out = Buffer.concat(parts);
fs.writeFileSync(path.join(dir, 'door-lock.bin'), out);
console.log(`door-lock.bin: ${nV} vertices, ${I.length / 3} triangles, ${edges.length / 6} edge segments, ${(out.length / 1024).toFixed(1)} KB`);

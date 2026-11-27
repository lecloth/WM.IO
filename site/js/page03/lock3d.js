// The real "Cutaway Lock" (zbzzn, Printables 250197, CC BY 4.0; CREDITS.md), one object for pages 2, 3 and 4 (round 8b):
// the hallway's door wears it, page 3 goes into it and multiplies it, page 4 picks it. Loaded from lock-parts.bin
// (tools/lock_web.mjs): the housing, cap, clip and plug as meshes with their hairline edges; the five key pins, five
// drivers and the key as hairline edges (and, since 27 Nov, simplified solids, built only with solidInside). Lock
// space is millimetres: x across, y up (the plug's axis at y = 0), z out of the face (the face at z = 0, the body
// behind it). The look is the hallway's: matte card with ink hairlines; X-ray:
// the body goes see-through and every part shows as white hairlines (page 1's X-ray).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export const FACE = { h: 82, cy: 20, w: 42, depth: 80 };   // the face: 82 mm tall (y -21 .. 61), its middle at y = 20
export const PIN_Z = [-9.7, -22.7, -35.7, -48.7, -61.7];    // the five pin stacks along the plug (lock z)
export const SHEAR = 16;                                     // the shear line (lock y)
let parsed = null;
async function fetchBin(url) {
  for (let n = 0; n < 5; n++) {
    try { const r = await fetch(n ? `${url}?r=${n}` : url); if (r.status === 404) return null; if (!r.ok) throw new Error(r.status); return await r.arrayBuffer(); }
    catch (e) { await new Promise((res) => setTimeout(res, 150 * (n + 1))); }
  }
  return null;
}
/** the parts, parsed once per page */
export function loadLockParts(base = '') {
  return parsed || (parsed = (async () => {
    const buf = await fetchBin(`${base}media/models/lock/lock-parts.bin`); if (!buf) return null;
    if (new TextDecoder().decode(new Uint8Array(buf, 0, 4)) !== 'LKP2') throw new Error('not a lock-parts file');
    const [, n] = new Uint32Array(buf, 4, 2); let o = 12; const heads = [];
    for (let i = 0; i < n; i++) {
      const name = new TextDecoder().decode(new Uint8Array(buf, o, 16)).replace(/\0+$/, ''); o += 16;
      const [group, nV, nI, nE, nL] = new Uint32Array(buf.slice(o, o + 20)); o += 20;
      heads.push({ name, group, nV, nI, nE, nL });
    }
    const parts = heads.map((h) => {
      const pos = new Float32Array(buf.slice(o, o + h.nV * 12)); o += h.nV * 12;
      const idx = new Uint32Array(buf.slice(o, o + h.nI * 4)); o += h.nI * 4;
      const edges = new Float32Array(buf.slice(o, o + h.nE * 4)); o += h.nE * 4;
      const lod = new Float32Array(buf.slice(o, o + h.nL * 4)); o += h.nL * 4;
      return { ...h, pos, idx, edges, lod };
    });
    const by = Object.fromEntries(parts.map((p) => [p.name, p]));
    return { parts, by, build: (opts) => buildLock(parts, opts) };
  })());
}

const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr.length ? arr : [0, 0, 0, 0, 0, 0]); return g; };

/** one lock: root (its face's middle at the origin, the face in the z = 0 plane, facing +z), its parts for animation
 *  (plug, pins, drivers, key: each a group in lock space), and its look. inside: the pins, drivers and key are built
 *  (page 3 and 4); the door's lock leaves them out. solidInside (27 Nov, the security page's beat 1): the pins, drivers
 *  and key get their solid meshes too (lock-parts.bin carries them since then); without it only the housing, cap, clip
 *  and plug are solid, as before. Each solid knows its part (userData.part). */
function buildLock(parts, { inside = true, solidInside = false } = {}) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  body.position.y = -FACE.cy;
  const lineMats = [], meshMats = [];
  const solidMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0, envMapIntensity: 0.5, transparent: true, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  meshMats.push(solidMat);
  const lm = (o = {}) => { const m = new LineMaterial({ linewidth: 1, worldUnits: false, transparent: true, toneMapped: false, ...o }); lineMats.push(m); return m; };
  const edgeMat = lm({ opacity: 0.8 }), innerMat = lm({ opacity: 0 }), keyMat = lm({ opacity: 0 });
  const groups = { housing: new THREE.Group(), plug: new THREE.Group(), pins: [], drivers: [], key: new THREE.Group() };
  body.add(groups.housing, groups.plug, groups.key);
  const solids = [];
  parts.forEach((p) => {
    const grp = p.group === 0 ? groups.housing : p.group === 1 ? groups.plug : p.group === 4 ? groups.key : new THREE.Group();
    if (p.group === 2 || p.group === 3) { if (!inside) return; body.add(grp); (p.group === 2 ? groups.pins : groups.drivers).push(grp); }
    if (p.group === 4 && !inside) return;
    if (p.nI && (p.group <= 1 || solidInside)) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p.pos, 3)); g.setIndex(new THREE.BufferAttribute(p.idx, 1));
      const m = new THREE.Mesh(g, solidMat); m.renderOrder = 1; m.userData.part = p.name; grp.add(m); solids.push(m);
    }
    const l = new LineSegments2(segGeo(p.edges), p.group <= 1 ? edgeMat : p.group === 4 ? keyMat : innerMat); l.renderOrder = 2; grp.add(l);
  });
  const api = {
    root, body, groups, lineMats, solids,
    /** the face h tall (world units) */
    setFaceHeight(h) { root.scale.setScalar(h / FACE.h); },
    setOpacity(a) { solidMat.opacity = a * api.solidA; edgeMat.opacity = a * api.edgeA; innerMat.opacity = a * api.innerA; keyMat.opacity = a * api.keyA; root.visible = a > 0.002; api.alpha = a; },
    alpha: 1, solidA: 1, edgeA: 0.8, innerA: 0, keyA: 0,
    colours({ ink = '#121212', base = '#F4F5F7', white = '#FFFFFF', xray = 0 } = {}) {
      api.ink = ink; api.base = base;
      const c = new THREE.Color(ink).lerp(new THREE.Color(white), xray);
      edgeMat.color.copy(c); innerMat.color.copy(c); keyMat.color.copy(c);
      solidMat.color.set(base);
    },
    /** X-ray, 0..1: the body goes see-through, its edges turn white, the pins inside show */
    xray(t, { ink = api.ink || '#121212', white = '#FFFFFF' } = {}) {
      api.solidA = 1 - t; api.edgeA = 0.8 + 0.2 * t; api.innerA = t;
      solids.forEach((m) => { m.visible = t < 0.999; });
      solidMat.depthWrite = t < 0.5;
      const c = new THREE.Color(ink).lerp(new THREE.Color(white), t); edgeMat.color.copy(c); innerMat.color.copy(c); keyMat.color.copy(c);
      api.setOpacity(api.alpha);
    },
    setKey(a) { api.keyA = a; api.setOpacity(api.alpha); },
    setResolution(w, h, px = 1) { lineMats.forEach((m) => { m.resolution.set(w, h); m.linewidth = px; }); },
  };
  return api;
}

/** a light lock for the lattice: the housing, cap, clip (static) and the plug (part = 1, it turns) as one segment list
 *  [ax, ay, az, bx, by, bz, part] in lock space, the face's middle at the origin */
export function latticeSegments(lp) {
  const out = [];
  lp.parts.forEach((p) => { if (p.group > 1) return; const e = p.lod; for (let i = 0; i < e.length; i += 6) out.push(e[i], e[i + 1] - FACE.cy, e[i + 2], e[i + 3], e[i + 4] - FACE.cy, e[i + 5], p.group); });
  return out;
}

/** the end of the hallway and the start of page 3 share one frame: the lock's face, centred on the screen, as tall as
 *  92% of the room between the strip and the title block (a cell clear of each), on the screen's middle line */
export function endFaceHeight(H, { strip = 0, tbTop = H, u = 20 } = {}) {
  return 0.92 * 2 * Math.min(H / 2 - (strip + u), (tbTop - u) - H / 2);
}

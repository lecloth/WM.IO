// Page 1: today's phone, built in code as six real parts (Glass, Screen, Frame, Board, Battery, Back), drawn to the
// design ethos: tight corners (no bubbly slabs), a thin flat band, every edge a hairline. Three looks:
//   X-ray (the drawing: hairlines only, no glow; white on the blue ground, ink once the ground is paper)
//   -> built (matte faces under ink hairlines; hidden lines removed by a depth pre-pass)
//   -> real (CC0 material scans on the band and the back, see materials.js; a faint hairline stays on the edges).
// The X-ray's edge loops are tagged (part, piece, face), so Bell's few clean paths can land exactly on chosen ones.
// No logos, no brand shapes (two plain round lenses, a round punch-hole).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OPTIONS, PICK, dress } from './materials.js';

export const PHONE = { w: 74, h: 156, r: 6 };

function roundedRect(w, h, r, x0 = -w / 2, y0 = -h / 2) {
  const s = new THREE.Shape(), x = x0, y = y0, k = 0.5523 * r;   // true circular corners (cubic quarter arcs)
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.bezierCurveTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.bezierCurveTo(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.bezierCurveTo(x + r - k, y + h, x, y + h - r + k, x, y + h - r);
  s.lineTo(x, y + r); s.bezierCurveTo(x, y + r - k, x + r - k, y, x + r, y);
  return s;
}
function slab(w, h, d, r) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, -d / 2); return g;
}
function ring(w, h, d, r, t) {          // the band: the outline with the middle cut out
  const s = roundedRect(w, h, r);
  s.holes.push(roundedRect(w - 2 * t, h - 2 * t, Math.max(0.5, r - t)));
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, -d / 2); return g;
}
function disc(r, d) { const g = new THREE.CylinderGeometry(r, r, d, 48); g.rotateX(Math.PI / 2); return g; }
function faceUV(geo, w, h) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  uv.needsUpdate = true; return geo;
}
// chain an EdgesGeometry's loose segments into polylines (closed loops where they close)
function chains(eg) {
  const a = eg.attributes.position.array, n = a.length / 6, key = (i) => `${a[i].toFixed(3)},${a[i + 1].toFixed(3)},${a[i + 2].toFixed(3)}`;
  const at = new Map(), used = new Uint8Array(n);
  for (let s = 0; s < n; s++) for (const e of [0, 3]) { const k = key(s * 6 + e); if (!at.has(k)) at.set(k, []); at.get(k).push(s); }
  const out = [];
  for (let s0 = 0; s0 < n; s0++) {
    if (used[s0]) continue; used[s0] = 1;
    const pts = [[a[s0 * 6], a[s0 * 6 + 1], a[s0 * 6 + 2]], [a[s0 * 6 + 3], a[s0 * 6 + 4], a[s0 * 6 + 5]]];
    for (let guard = 0; guard < n; guard++) {
      const last = pts[pts.length - 1], k = `${last[0].toFixed(3)},${last[1].toFixed(3)},${last[2].toFixed(3)}`;
      const nx = (at.get(k) || []).find((s) => !used[s]); if (nx === undefined) break;
      used[nx] = 1; const o = a.slice(nx * 6, nx * 6 + 6);
      const k0 = `${o[0].toFixed(3)},${o[1].toFixed(3)},${o[2].toFixed(3)}`;
      pts.push(k0 === k ? [o[3], o[4], o[5]] : [o[0], o[1], o[2]]);
    }
    out.push(pts);
  }
  return out;
}

// the screen, drawn to the ethos: a small drawing sheet. The next page's question, its options as rows on hairlines,
// mono indices; no pills, no fills, no ticks. (Its words are a draft: flagged by a mono word, top right.)
export function drawScreen(c, ink = '#121212', paper = '#F2F0EB', graphite = '#6B6A66') {
  const x = c.getContext('2d'), W = c.width, H = c.height, k = W / 390;
  x.fillStyle = paper; x.fillRect(0, 0, W, H);
  const hair = (y, x0 = 24, x1 = 390 - 24, col = ink, a = 0.55) => { x.globalAlpha = a; x.fillStyle = col; x.fillRect(x0 * k, y * k, (x1 - x0) * k, Math.max(1, 0.75 * k)); x.globalAlpha = 1; };
  x.textBaseline = 'alphabetic';
  x.fillStyle = ink; x.font = `500 ${12 * k}px "DM Mono", monospace`; x.fillText('02 · FOR YOU', 24 * k, 84 * k);
  x.fillStyle = graphite; x.textAlign = 'right'; x.fillText('DRAFT', (390 - 24) * k, 84 * k); x.textAlign = 'left';
  hair(96);
  x.fillStyle = ink; x.font = `400 ${46 * k}px Newsreader, Georgia, serif`;
  ['What do', 'you need?'].forEach((t, i) => x.fillText(t, 22 * k, (168 + i * 50) * k));
  const rows = ['A website', 'An app', 'My systems are a mess', 'AI working for me', 'Keep it secure'];
  let y = 268; hair(y);
  rows.forEach((t, i) => {
    x.fillStyle = graphite; x.font = `400 ${11 * k}px "DM Mono", monospace`; x.fillText(String(i + 1).padStart(2, '0'), 24 * k, (y + 36) * k);
    x.fillStyle = ink; x.font = `400 ${21 * k}px Newsreader, Georgia, serif`; x.fillText(t, 62 * k, (y + 37) * k);
    y += 58; hair(y);
  });
  x.fillStyle = graphite; x.font = `500 ${11 * k}px "DM Mono", monospace`; x.fillText('TAP EVERYTHING THAT FITS', 24 * k, (H / k - 70) * k);
  hair(H / k - 58, 24, 390 - 24, ink, 0.35);
}

// render order: depth pre-pass, X-ray lines, matte, real, glass, built hairlines last (on top of the faces)
const RO = { pre: 0, xl: 1, matte: 3, real: 5, glass: 6, ink: 7 };
const WHITE = 0xECF1F6;

export class Phone {
  constructor(canvas, { option = PICK, mediaBase = 'media/materials/' } = {}) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0;
    this.renderer.sortObjects = true;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    this.camera = new THREE.PerspectiveCamera(26, 1, 20, 4000);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6ae, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-0.6, 1, 1.4); this.scene.add(key);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.lineMats = []; this.parts = [];
    this.L = { xl: [], pre: [], matte: [], ink: [], real: [] };   // materials per look
    this.option = option;
    this.build();
    this.ready = dress(THREE, this.renderer, OPTIONS[option], this.dressMats, mediaBase).then(() => { this._looks = ''; this.dirty = true; });
  }

  lineMat(color, opacity, depthTest) {
    const m = new LineMaterial({ color, linewidth: 1, worldUnits: false, transparent: true, opacity, depthTest, depthWrite: false });
    this.lineMats.push(m); return m;
  }

  build() {
    const L = this.L;
    const preMat = new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }); L.pre.push(preMat);
    const look = (m, list, base = 1) => { m.transparent = true; m.depthWrite = false; m.userData.base = base; list.push(m); return m; };
    const matte = (hex, base = 1) => look(new THREE.MeshStandardMaterial({ color: hex, roughness: 0.95, metalness: 0, envMapIntensity: 0 }), L.matte, base);
    const real = (o) => look(o.isMaterial ? o : new THREE.MeshStandardMaterial({ envMap: this.envTex, ...o }), L.real, o.isMaterial ? 1 : (o.opacity ?? 1));
    this.screenCanvas = document.createElement('canvas'); this.screenCanvas.width = 780; this.screenCanvas.height = 1640;
    drawScreen(this.screenCanvas);
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas); this.screenTex.colorSpace = THREE.SRGBColorSpace; this.screenTex.anisotropy = 8;
    // the two dressed materials (frame band, back panel), shared by their pieces; maps arrive from materials.js
    const frameReal = new THREE.MeshStandardMaterial({ envMap: this.envTex, color: 0xCCCCCC, metalness: 1, roughness: 0.4 });
    const backReal = new THREE.MeshStandardMaterial({ envMap: this.envTex, color: 0xEEEEEE, metalness: 0, roughness: 0.6 });
    this.dressMats = { frame: [frameReal], back: [backReal] };

    const P = (name, z, pieces) => {
      const g = new THREE.Group(); g.userData = { name, z }; this.root.add(g);
      const part = { name, group: g, z, loops: [], corners: [] };
      pieces.forEach(({ geo, pos = [0, 0, 0], matte: mh, real: ro, edges = true, edgeOpacity = 1, glass = false, matteBase = 1 }, k) => {
        const holder = new THREE.Group(); holder.position.set(...pos); g.add(holder);
        const add = (mat, ro_) => { const m = new THREE.Mesh(geo, mat); m.renderOrder = ro_; holder.add(m); return m; };
        if (!glass) add(preMat, RO.pre);
        add(matte(mh, matteBase), glass ? RO.glass : RO.matte);
        add(real(ro), glass ? RO.glass : RO.real);
        geo.computeBoundingBox(); const b = geo.boundingBox;
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const zz of [b.min.z, b.max.z]) part.corners.push({ holder, v: new THREE.Vector3(x, y, zz) });
        if (edges) {
          const eg = new THREE.EdgesGeometry(geo, 30), lg = new LineSegmentsGeometry().fromEdgesGeometry(eg);
          chains(eg).forEach((c) => {
            const pts = c.map((q) => new THREE.Vector3(...q));
            let zz = 0, A = 0; pts.forEach((q, i) => { zz += q.z; const r = pts[(i + 1) % pts.length]; A += q.x * r.y - r.x * q.y; });
            part.loops.push({ holder, pts, piece: k, z: zz / pts.length, area: Math.abs(A / 2) });
          });
          eg.dispose();
          const xl = this.lineMat(WHITE, 0.9 * edgeOpacity, false); xl.userData.base = 0.9 * edgeOpacity; L.xl.push(xl);
          const w = new LineSegments2(lg, xl); w.renderOrder = RO.xl; holder.add(w);            // the drawing: see-through hairlines
          const il = this.lineMat(0x121212, edgeOpacity, true); il.userData.base = edgeOpacity; L.ink.push(il);
          const ik = new LineSegments2(lg, il); ik.renderOrder = RO.ink; holder.add(ik);          // built: visible edges only
        }
      });
      g.position.z = z; this.parts.push(part); return part;
    };
    const { w: W, h: H, r: R } = PHONE;
    const screenReal = new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false });
    const lensReal = { color: 0x0B0B0C, roughness: 0.08, metalness: 0.2 };
    // back to front; z = assembled depth (mm)
    P('Back', -3.4, [
      { geo: slab(W, H, 0.8, R), matte: 0xE8E6E1, real: backReal },
      { geo: disc(4.4, 1.2), pos: [-24, 63, -0.9], matte: 0x3A3936, real: lensReal },
      { geo: disc(4.4, 1.2), pos: [-24, 50, -0.9], matte: 0x3A3936, real: lensReal },
    ]);
    P('Battery', -1.4, [{ geo: slab(54, 80, 3.2, 2), pos: [0, -28, 0], matte: 0xDCDAD4, real: { color: 0x2A2C2F, roughness: 0.55, metalness: 0.3 } }]);
    P('Board', 0.4, [
      { geo: slab(64, 46, 1.0, 2), pos: [0, 48, 0], matte: 0x3B3A37, real: { color: 0x1F3A2E, roughness: 0.6, metalness: 0.15 } },
      ...[[-12, 52, 16, 14], [10, 54, 12, 12], [12, 38, 16, 8], [-18, 34, 9, 9]].map(([x, y, w, h]) =>
        ({ geo: slab(w, h, 1.2, 0.6), pos: [x, y, 1.0], matte: 0xEDEBE6, real: { color: 0x141414, roughness: 0.35, metalness: 0.4 } })),
    ]);
    P('Frame', 0, [{ geo: ring(W, H, 7.6, R, 1.1), matte: 0xD9D7D1, real: frameReal }]);
    P('Screen', 2.6, [
      { geo: slab(W - 1.4, H - 1.4, 0.6, R - 0.7), matte: 0xE2E0DA, real: { color: 0x050505, roughness: 0.3, metalness: 0 }, edges: false },
      { geo: faceUV(new THREE.ShapeGeometry(roundedRect(W - 2.8, H - 2.8, R - 1.4), 12), W - 2.8, H - 2.8), pos: [0, 0, 0.32], matte: 0xEEECE7, real: screenReal, edgeOpacity: 0.8 },
    ]);
    P('Glass', 3.6, [
      // the glass is see-through: no depth pre-pass, faint in both solid looks, drawn after the faces
      { geo: slab(W, H, 0.7, R), matte: 0xF7F6F2, matteBase: 0.22, real: { color: 0xffffff, roughness: 0.02, metalness: 0, opacity: 0.1 }, edgeOpacity: 0.85, glass: true },
      { geo: disc(1.6, 0.8), pos: [0, 72.5, 0.1], matte: 0x0A0A0A, real: { color: 0x050505, roughness: 0.1, metalness: 0 } },
    ]);
    this.looks({ xray: 1, ground: 0, built: 0, real: 0 });
  }
  /** compile every look's shaders up front (each look's first appearance would otherwise stall a frame) */
  warm() {
    const all = Object.values(this.L).flat(), vis = all.map((m) => m.visible);
    all.forEach((m) => { m.visible = true; });
    try { this.renderer.compile(this.scene, this.camera); } catch (e) {}
    all.forEach((m, i) => { m.visible = vis[i]; });
  }

  resize(w, h) {
    this.W = w; this.H = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.lineMats.forEach((m) => m.resolution.set(w * this.dpr, h * this.dpr));
  }
  /** the drawing's line colour once the ground is paper (the theme's ink) */
  setInk(hex) { this.inkHex = hex; this._looks = ''; }

  /** the looks as weights: xray = the drawing's strength; ground 0 = blue (white lines) .. 1 = paper (ink lines);
   *  built = drawing -> matte; real = matte -> real */
  looks({ xray, ground = 0, built, real }) {
    const k = `${xray.toFixed(4)}|${ground >= 0.5}|${built.toFixed(4)}|${real.toFixed(4)}`; if (k === this._looks) return; this._looks = k;
    const L = this.L, x = xray * (1 - built), col = ground >= 0.5 ? (this.inkHex ?? 0x121212) : WHITE;
    L.xl.forEach((m) => { m.color.setHex(col); m.opacity = m.userData.base * x; m.visible = x > 0.001; });
    L.pre.forEach((m) => { m.visible = built > 0.001; });
    L.matte.forEach((m) => { m.opacity = m.userData.base * built * (1 - real); m.visible = built > 0.001 && real < 0.999; });
    L.ink.forEach((m) => { m.opacity = m.userData.base * built * (1 - 0.72 * real); m.visible = built > 0.001; });
    L.real.forEach((m) => { m.opacity = m.userData.base * built * real; m.visible = built * real > 0.001; });
  }

  /** pose: explodeEach[i] 0..1 per part (back to front), gap in mm, yaw/pitch in radians, fit = the band in CSS px */
  set({ explodeEach, yaw, pitch, gap = 52, fit }) {
    this.parts.forEach((p, i) => { p.group.position.z = p.z + (i - 2.5) * gap * explodeEach[i]; });
    this.root.rotation.set(pitch, yaw, 0);
    this.root.updateMatrixWorld(true);
    const f = fit || { top: 0, bottom: 0, left: 0, right: 0 };
    const bw = this.W - f.left - f.right, bh = this.H - f.top - f.bottom;
    // the parts' corners in world space (a tight box for slabs), their centre, then fit their PROJECTED box to the band
    const pts = []; this.parts.forEach((p) => p.corners.forEach((c) => pts.push(c.v.clone().applyMatrix4(c.holder.matrixWorld))));
    const box = new THREE.Box3().setFromPoints(pts), ctr = box.getCenter(new THREE.Vector3());
    const t = Math.tan(this.camera.fov * Math.PI / 360);
    let d = box.getBoundingSphere(new THREE.Sphere()).radius / t * 1.2, ox = 0, oy = 0;
    this.camera.setViewOffset(this.W, this.H, -(f.left - f.right) / 2, -(f.top - f.bottom) / 2, this.W, this.H);
    for (let it = 0; it < 3; it++) {
      this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z);
      this.camera.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const v = new THREE.Vector3();
      pts.forEach((q) => { v.copy(q).project(this.camera); const sx = (v.x + 1) / 2 * this.W, sy = (1 - v.y) / 2 * this.H;
        if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy; });
      const s = Math.max((x1 - x0) / bw, (y1 - y0) / bh) / 0.96;
      const upp = 2 * d * t / this.H;
      ox += ((x0 + x1) / 2 - (f.left + this.W - f.right) / 2) * upp;
      oy -= ((y0 + y1) / 2 - (f.top + this.H - f.bottom) / 2) * upp;
      d *= s;
    }
    this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z);
    this.camera.updateMatrixWorld();
    this.pts = pts;
  }

  /** a part's projected box (CSS px) */
  partBox(part) {
    const v = new THREE.Vector3(); let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
    part.corners.forEach((c) => { v.copy(c.v).applyMatrix4(c.holder.matrixWorld).project(this.camera);
      const x = (v.x + 1) / 2 * this.W, y = (1 - v.y) / 2 * this.H; l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); });
    return { left: l, right: r, top: t, bottom: b, cx: (l + r) / 2, cy: (t + b) / 2 };
  }
  /** a point on a part's surface, projected (CSS px); u, v in -1..1 across its first piece's box, on its front face */
  anchor(part, u = 0, v = 0) {
    const c = part.corners.slice(0, 8), xs = c.map((q) => q.v.x), ys = c.map((q) => q.v.y), zs = c.map((q) => q.v.z);
    const p = new THREE.Vector3((Math.min(...xs) + Math.max(...xs)) / 2 + u * (Math.max(...xs) - Math.min(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2 + v * (Math.max(...ys) - Math.min(...ys)) / 2, Math.max(...zs));
    p.applyMatrix4(c[0].holder.matrixWorld).project(this.camera);
    return [(p.x + 1) / 2 * this.W, (1 - p.y) / 2 * this.H];
  }
  /** the phone's projected box (CSS px), for the geometry check */
  screenBox() {
    const v = new THREE.Vector3(); let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
    this.pts.forEach((q) => { v.copy(q).project(this.camera); const x = (v.x + 1) / 2 * this.W, y = (1 - v.y) / 2 * this.H;
      l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); });
    return { left: l, right: r, top: t, bottom: b };
  }
  /** one X-ray loop, projected (CSS px), picked by part, piece and face ('front'|'back') and size ('outer'|'inner') */
  loop2D(name, piece = 0, face = 'front', size = 'outer') {
    const part = this.parts.find((p) => p.name === name); if (!part) return null;
    let ls = part.loops.filter((l) => l.piece === piece); if (!ls.length) return null;
    const zz = face === 'front' ? Math.max(...ls.map((l) => l.z)) : Math.min(...ls.map((l) => l.z));
    ls = ls.filter((l) => Math.abs(l.z - zz) < 0.05);
    const L = ls.reduce((a, b) => ((size === 'outer' ? b.area > a.area : b.area < a.area) ? b : a));
    const v = new THREE.Vector3();
    return L.pts.map((q) => { v.copy(q).applyMatrix4(L.holder.matrixWorld).project(this.camera); return [(v.x + 1) / 2 * this.W, (1 - v.y) / 2 * this.H]; });
  }
  refreshScreen(ink, paper, graphite) { drawScreen(this.screenCanvas, ink, paper, graphite); this.screenTex.needsUpdate = true; try { this.renderer.initTexture(this.screenTex); } catch (e) {} }
  render() { this.renderer.render(this.scene, this.camera); this.dirty = false; }
  snapshot() { this.render(); return this.renderer.domElement.toDataURL('image/png'); }
}

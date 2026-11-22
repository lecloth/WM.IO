// Page 1: today's phone, built in code from Take 1's three.js hero phone (rounded slabs, matte parts, hairline edges),
// as six real parts (Glass, Screen, Frame, Board, Battery, Back) and three looks:
//   X-ray (the drawing: white lines and glow on cyanotype blue)  ->  matte (built: hairline edges)  ->  real materials.
// The looks change by soft cross-fades over the WHOLE phone (never a wipe, never a phone cut in half): a depth-only
// pre-pass keeps the solid looks to their front surfaces, so a half-built phone reads as one object in two looks.
// The X-ray's own edge lines are exported as screen-space loops, so Bell's traced lines can land exactly on them.
// No logos, no brand shapes (two plain round lenses, a round punch-hole).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const PHONE = { w: 74, h: 154 };

function roundedRect(w, h, r, x0 = -w / 2, y0 = -h / 2) {
  const s = new THREE.Shape(), x = x0, y = y0;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slab(w, h, d, r) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -d / 2); return g;
}
function ring(w, h, d, r, t) {          // the frame: a rounded band with the middle cut out
  const s = roundedRect(w, h, r);
  s.holes.push(roundedRect(w - 2 * t, h - 2 * t, Math.max(1, r - t)));
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, -d / 2); return g;
}
function disc(r, d) { const g = new THREE.CylinderGeometry(r, r, d, 32); g.rotateX(Math.PI / 2); return g; }
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

// the screen, drawn in code: the next page's question, so the phone hands over to "For you" (its words are a draft)
export function drawScreen(c) {
  const x = c.getContext('2d'), W = c.width, H = c.height, k = W / 390;
  x.fillStyle = '#F2F0EB'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#121212';
  x.font = `500 ${13 * k}px "DM Mono", monospace`; x.fillText('02 · FOR YOU', 28 * k, 92 * k);
  // the draft flag (Wajih hasn't signed off this preview's words)
  x.font = `500 ${10 * k}px "DM Mono", monospace`;
  const fw = x.measureText('DRAFT').width + 12 * k; x.setLineDash([3 * k, 2 * k]); x.lineWidth = 1 * k;
  x.strokeRect(W - 28 * k - fw, 79 * k, fw, 17 * k); x.setLineDash([]); x.fillText('DRAFT', W - 22 * k - fw, 92 * k);
  x.font = `420 ${44 * k}px Newsreader, Georgia, serif`;
  ['What do', 'you need?'].forEach((t, i) => x.fillText(t, 26 * k, (170 + i * 48) * k));
  const chips = ['A website', 'An app', 'My systems are a mess', 'AI working for me', 'Keep it secure'];
  let cx = 26 * k, cy = 290 * k; x.font = `400 ${19 * k}px Newsreader, Georgia, serif`;
  chips.forEach((t, i) => {
    const w = x.measureText(t).width + 34 * k, h = 46 * k;
    if (cx + w > W - 24 * k) { cx = 26 * k; cy += h + 12 * k; }
    x.lineWidth = 1.5 * k; x.strokeStyle = '#121212'; x.beginPath(); x.roundRect(cx, cy, w, h, h / 2); x.stroke();
    if (i === 1) { x.fill(); x.fillStyle = '#F2F0EB'; }
    x.fillText(t, cx + 17 * k, cy + 30 * k); x.fillStyle = '#121212';
    cx += w + 10 * k;
  });
  x.font = `500 ${12 * k}px "DM Mono", monospace`; x.fillStyle = '#5F5E5A'; x.fillText('TAP EVERYTHING THAT FITS', 28 * k, H - 90 * k);
}

const XRAY_VS = `
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mvPosition = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition; }`;
const XRAY_FS = `
uniform float uFade; varying vec3 vN; varying vec3 vV;
void main(){
  float f = 1. - abs(dot(normalize(vN), normalize(vV)));
  float a = (.05 + pow(f, 2.2) * .55) * uFade;
  gl_FragColor = vec4(vec3(.93, .95, .97) * a, a);
}`;
// render order: depth pre-pass, X-ray glow, X-ray lines, matte, matte hairlines, real, glass
const RO = { pre: 0, xray: 1, white: 2, matte: 3, ink: 4, real: 5, glass: 6 };

export class Phone {
  constructor(canvas) {
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
    this.camera = new THREE.PerspectiveCamera(28, 1, 20, 4000);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6ae, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-0.6, 1, 1.4); this.scene.add(key);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.lineMats = []; this.parts = [];
    this.L = { xray: [], white: [], pre: [], matte: [], ink: [], real: [] };   // materials per look
    this.build();
  }

  lineMat(color, opacity, depthTest) {
    const m = new LineMaterial({ color, linewidth: 1, worldUnits: false, transparent: true, opacity, depthTest, depthWrite: false });
    this.lineMats.push(m); return m;
  }

  build() {
    const L = this.L;
    const xrayMat = () => { const m = new THREE.ShaderMaterial({ vertexShader: XRAY_VS, fragmentShader: XRAY_FS, uniforms: { uFade: { value: 1 } },
      transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }); L.xray.push(m); return m; };
    const preMat = new THREE.MeshBasicMaterial({ colorWrite: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }); L.pre.push(preMat);
    const look = (m, list, base = 1) => { m.transparent = true; m.depthWrite = false; m.userData.base = base; list.push(m); return m; };
    const matte = (hex) => look(new THREE.MeshStandardMaterial({ color: hex, roughness: 0.95, metalness: 0, envMapIntensity: 0 }), L.matte);
    const real = (o) => look(o.isMaterial ? o : new THREE.MeshStandardMaterial({ envMap: this.envTex, ...o }), L.real, o.isMaterial ? 1 : (o.opacity ?? 1));
    this.screenCanvas = document.createElement('canvas'); this.screenCanvas.width = 780; this.screenCanvas.height = 1688;
    drawScreen(this.screenCanvas);
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas); this.screenTex.colorSpace = THREE.SRGBColorSpace; this.screenTex.anisotropy = 8;

    const P = (name, z, pieces) => {
      const g = new THREE.Group(); g.userData = { name, z }; this.root.add(g);
      const part = { name, group: g, z, loops: [], corners: [] };
      pieces.forEach(({ geo, pos = [0, 0, 0], matte: mh, real: ro, edges = true, edgeOpacity = 1, xray = true, glass = false }) => {
        const holder = new THREE.Group(); holder.position.set(...pos); g.add(holder);
        const add = (mat, ro_) => { const m = new THREE.Mesh(geo, mat); m.renderOrder = ro_; holder.add(m); return m; };
        if (xray) add(xrayMat(), RO.xray);
        if (!glass) add(preMat, RO.pre);
        add(matte(mh), glass ? RO.glass : RO.matte);
        add(real(ro), glass ? RO.glass : RO.real);
        geo.computeBoundingBox(); const b = geo.boundingBox;
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const zz of [b.min.z, b.max.z]) part.corners.push({ holder, v: new THREE.Vector3(x, y, zz) });
        if (edges) {
          const eg = new THREE.EdgesGeometry(geo, 30), lg = new LineSegmentsGeometry().fromEdgesGeometry(eg);
          chains(eg).forEach((c) => part.loops.push({ holder, pts: c.map((q) => new THREE.Vector3(...q)) }));
          eg.dispose();
          const wl = this.lineMat(0xECF1F6, 0.8 * edgeOpacity, false); wl.userData.base = 0.8 * edgeOpacity; L.white.push(wl);
          const w = new LineSegments2(lg, wl); w.renderOrder = RO.white; holder.add(w);          // white lines while it's a drawing
          const il = this.lineMat(0x121212, edgeOpacity, true); il.userData.base = edgeOpacity; L.ink.push(il);
          const k = new LineSegments2(lg, il); k.renderOrder = RO.ink; holder.add(k);            // ink hairlines while built
        }
      });
      g.position.z = z; this.parts.push(part); return part;
    };
    const screenReal = new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false });
    // back to front; z = assembled depth (mm)
    P('Back', -3.4, [
      { geo: slab(74, 154, 0.9, 11), matte: 0xE8E6E1, real: { color: 0xD8D4CB, roughness: 0.42, metalness: 0 } },
      { geo: disc(5.2, 1.6), pos: [-22, 55, -1.1], matte: 0x3A3936, real: { color: 0x0C0C0D, roughness: 0.08, metalness: 0.2 } },
      { geo: disc(5.2, 1.6), pos: [-22, 40, -1.1], matte: 0x3A3936, real: { color: 0x0C0C0D, roughness: 0.08, metalness: 0.2 } },
    ]);
    P('Battery', -1.4, [{ geo: slab(54, 78, 3.2, 3), pos: [0, -26, 0], matte: 0xDCDAD4, real: { color: 0x2A2C2F, roughness: 0.55, metalness: 0.3 } }]);
    P('Board', 0.4, [
      { geo: slab(62, 50, 1.0, 4), pos: [0, 44, 0], matte: 0x3B3A37, real: { color: 0x1F3A2E, roughness: 0.6, metalness: 0.15 } },
      ...[[-12, 48, 16, 14], [10, 50, 12, 12], [12, 34, 16, 8], [-18, 30, 9, 9]].map(([x, y, w, h]) =>
        ({ geo: slab(w, h, 1.2, 1), pos: [x, y, 1.0], matte: 0xEDEBE6, real: { color: 0x141414, roughness: 0.35, metalness: 0.4 } })),
    ]);
    P('Frame', 0, [{ geo: ring(74, 154, 7.8, 11, 2.2), matte: 0xD9D7D1, real: { color: 0xC9CBCF, roughness: 0.3, metalness: 1 } }]);
    P('Screen', 2.6, [
      { geo: slab(70, 150, 0.6, 9.5), matte: 0x1B1B1B, real: { color: 0x050505, roughness: 0.3, metalness: 0 } },
      { geo: faceUV(new THREE.ShapeGeometry(roundedRect(68, 147, 8.6), 12), 68, 147), pos: [0, 0, 0.45], matte: 0x2A2A2A, real: screenReal, edges: false, xray: false },
    ]);
    P('Glass', 3.6, [
      // the glass is see-through: no depth pre-pass, faint in both solid looks, drawn last
      { geo: slab(74, 154, 0.8, 11), matte: 0xF7F6F2, real: { color: 0xffffff, roughness: 0.02, metalness: 0, opacity: 0.12 }, edgeOpacity: 0.7, glass: true },
      { geo: disc(1.9, 0.9), pos: [0, 69, 0.1], matte: 0x0A0A0A, real: { color: 0x050505, roughness: 0.1, metalness: 0 } },
    ]);
    this.L.matte.forEach((m) => { if (m.color.getHex() === 0xF7F6F2) m.userData.base = 0.25; });
    this.looks({ xray: 1, built: 0, real: 0 });
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

  /** the three looks as weights: xray = the drawing's strength (0 hidden .. 1), built = X-ray -> matte, real = matte -> real */
  looks({ xray, built, real }) {
    const k = `${xray.toFixed(4)}|${built.toFixed(4)}|${real.toFixed(4)}`; if (k === this._looks) return; this._looks = k;
    const L = this.L, x = xray * (1 - built);
    L.xray.forEach((m) => { m.uniforms.uFade.value = x; m.visible = x > 0.001; });
    L.white.forEach((m) => { m.opacity = m.userData.base * x; m.visible = x > 0.001; });
    L.pre.forEach((m) => { m.visible = built > 0.001; });
    L.matte.forEach((m) => { m.opacity = m.userData.base * built; m.visible = built > 0.001 && real < 0.999; });
    L.ink.forEach((m) => { m.opacity = m.userData.base * built * (1 - real); m.visible = built > 0.001 && real < 0.999; });
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
      // centre the projected box in the band (world units per px at this distance)
      const upp = 2 * d * t / this.H;
      ox += ((x0 + x1) / 2 - (f.left + this.W - f.right) / 2) * upp;
      oy -= ((y0 + y1) / 2 - (f.top + this.H - f.bottom) / 2) * upp;
      d *= s;
    }
    this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z);
    this.camera.updateMatrixWorld();
    this.pts = pts;
  }

  /** screen position (CSS px) of a point on a part (local coords of its group) */
  project(part, x, y, z) {
    const v = new THREE.Vector3(x, y, z).applyMatrix4(part.group.matrixWorld).project(this.camera);
    return [(v.x + 1) / 2 * this.W, (1 - v.y) / 2 * this.H];
  }
  /** a part's projected box (CSS px) */
  partBox(part) {
    const v = new THREE.Vector3(); let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
    part.corners.forEach((c) => { v.copy(c.v).applyMatrix4(c.holder.matrixWorld).project(this.camera);
      const x = (v.x + 1) / 2 * this.W, y = (1 - v.y) / 2 * this.H; l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); });
    return { left: l, right: r, top: t, bottom: b, cx: (l + r) / 2, cy: (t + b) / 2 };
  }
  /** the phone's projected box (CSS px), for the geometry check */
  screenBox() {
    const v = new THREE.Vector3(); let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
    this.pts.forEach((q) => { v.copy(q).project(this.camera); const x = (v.x + 1) / 2 * this.W, y = (1 - v.y) / 2 * this.H;
      l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); });
    return { left: l, right: r, top: t, bottom: b };
  }
  /** the X-ray's edge lines as screen-space polylines (CSS px) at the current pose: where Bell's lines land */
  loops2D() {
    const v = new THREE.Vector3(), out = [];
    this.parts.forEach((p) => p.loops.forEach(({ holder, pts }) => {
      const a = new Float32Array(pts.length * 2);
      pts.forEach((q, i) => { v.copy(q).applyMatrix4(holder.matrixWorld).project(this.camera); a[i * 2] = (v.x + 1) / 2 * this.W; a[i * 2 + 1] = (1 - v.y) / 2 * this.H; });
      out.push(a);
    }));
    return out;
  }
  refreshScreen() { drawScreen(this.screenCanvas); this.screenTex.needsUpdate = true; }
  render() { this.renderer.render(this.scene, this.camera); }
  snapshot() { this.render(); return this.renderer.domElement.toDataURL('image/png'); }
}

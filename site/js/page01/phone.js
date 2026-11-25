// Page 1: today's phone, built in code as six real parts (Glass, Screen, Frame, Board, Battery, Back), drawn to the
// design ethos: tight corners (no bubbly slabs), a thin flat band, every edge a hairline. Three looks:
//   X-ray (the drawing: hairlines only, no glow; white on the blue ground, ink once the ground is paper)
//   -> built (matte faces under ink hairlines; hidden lines removed by a depth pre-pass)
//   -> real: a product shot. Physical materials lit by a real studio HDRI (Poly Haven "Studio Small 09", CC0): brushed
//      titanium band (anisotropic, CC0 scan maps, see materials.js) catching light on its bevelled edges, a black glass
//      back under a clear glossy coat, a reflective cover glass, buttons, a camera bump with layered lenses (an
//      iridescent coating), a soft shadow on the paper; ACES filmic tone mapping. The real look has its own bevelled
//      geometry (inside the X-ray's crisp outline), so the pieces still assemble exactly and the drawing stays exact.
// Round 4 (the premium bar, Part 5 "Round 4 picks"), real look only: a precisely machined band (flat brushed sides,
// a polished 45-degree chamfer front and back that catches one clean highlight line), tight even bezels (a black mask
// printed under the cover glass, the same width all round), the back glass set inside the frame, a layered camera
// plateau (a polished chamfered edge, ring, inner lens elements, a cover glass over each lens), real cover glass with
// a clear coat. The X-ray and built looks keep the crisp geometry, so the six pieces assemble exactly as before.
// The X-ray's edge loops are tagged (part, piece, face), so Bell's few clean paths can land exactly on chosen ones.
// No logos, no brand shapes (two plain round lenses in a plain bump, a round punch-hole).
import { LIGHT } from '../engine/tokens.js';
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
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
// the real look's geometry: the same outlines with rounded (bevelled) edges, kept inside the X-ray's crisp box
function bslab(w, h, d, r, b, seg = 4) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - 2 * b, h - 2 * b, Math.max(0.3, r - b)), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: seg, curveSegments: 16 });
  g.translate(0, 0, -(d - 2 * b) / 2); return g;
}
function bring(w, h, d, r, t, b, seg = 5) {
  const s = roundedRect(w - 2 * b, h - 2 * b, Math.max(0.3, r - b));
  s.holes.push(roundedRect(w - 2 * t, h - 2 * t, Math.max(0.5, r - t)));
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: seg, curveSegments: 16 });
  g.translate(0, 0, -(d - 2 * b) / 2); return g;
}
// a chamfer: a strip from the outline (w, h, r) at z0 to the outline inset by c at z1 (real look)
function chamfer(w, h, r, c, z0, z1) {
  const a = roundedRect(w, h, r).getPoints(10), b = roundedRect(w - 2 * c, h - 2 * c, Math.max(0.3, r - c)).getPoints(10);
  const n = Math.min(a.length, b.length), pos = [], idx = [];
  for (let i = 0; i < n; i++) pos.push(a[i].x, a[i].y, z0, b[i].x, b[i].y, z1);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n, A = 2 * i, B = 2 * i + 1, C = 2 * j, D = 2 * j + 1; idx.push(A, C, B, B, C, D); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// a flat ring between two outlines (real look: the bezel mask under the cover glass)
function flatRing(w, h, r, w2, h2, r2, z = 0) {
  const s = roundedRect(w, h, r); s.holes.push(roundedRect(w2, h2, r2));
  const g = new THREE.ShapeGeometry(s, 16); g.translate(0, 0, z); return g;
}
// a turned part (lens ring, glass): profile of [radius, height] pairs; height runs outwards from the back (-z)
function lathe(profile, z0 = 0) {
  const g = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), 64);
  g.rotateX(-Math.PI / 2); g.translate(0, 0, z0); return g;
}
// a button key with rounded ends and edges (real look); the drawing keeps a crisp box
function roundedKey(len) {
  const g = new THREE.ExtrudeGeometry(roundedRect(2.4 - 0.6, len - 0.6, 0.9), { depth: 0.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 4, curveSegments: 10 });
  g.translate(0, 0, -0.3); g.rotateY(Math.PI / 2); return g;   // long side along y, its thickness along x
}
// a soft shadow: a blurred rounded rectangle (alpha), for the paper behind the finished phone
function shadowTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 512);   // opaque: the alpha map reads the colour, so the fade must be in it
  x.filter = 'blur(22px)'; x.fillStyle = '#fff';
  const r = 26, X = 60, Y = 60, w = 136, h = 392;
  x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.fill();
  return new THREE.CanvasTexture(c);
}
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
export function drawScreen(c, ink = LIGHT.ink, paper = LIGHT.paper, graphite = LIGHT.graphite) {
  const x = c.getContext('2d'), W = c.width, H = c.height, k = W / 390;
  x.fillStyle = paper; x.fillRect(0, 0, W, H);
  const hair = (y, x0 = 24, x1 = 390 - 24, col = ink, a = 0.55) => { x.globalAlpha = a; x.fillStyle = col; x.fillRect(x0 * k, y * k, (x1 - x0) * k, Math.max(1, 0.75 * k)); x.globalAlpha = 1; };
  x.textBaseline = 'alphabetic';
  x.fillStyle = ink; x.font = `500 ${12 * k}px "DM Mono", monospace`; x.fillText('02 · FOR YOU', 24 * k, 84 * k);
  x.fillStyle = graphite; x.textAlign = 'right'; x.fillText('DRAFT', (390 - 24) * k, 84 * k); x.textAlign = 'left';
  hair(96);
  x.fillStyle = ink; x.font = `400 ${46 * k}px Newsreader, Georgia, serif`;
  ['What do', 'you need?'].forEach((t, i) => x.fillText(t, 22 * k, (168 + i * 50) * k));
  const rows = ['A website', 'An app', 'My systems are a mess', 'AI working for me', 'Keep it secure', 'A look that fits my business'];
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
    this.envRot = new THREE.Euler(0, 0, 0);   // as shot: the front three-quarter turn sweeps the first octabox across the glass and band
    this.camera = new THREE.PerspectiveCamera(26, 1, 20, 4000);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xB5B6B8, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-0.6, 1, 1.4); this.scene.add(key);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.lineMats = []; this.parts = []; this.tiltNow = { yaw: 0, pitch: 0 };
    this.L = { xl: [], pre: [], matte: [], ink: [], real: [] };   // materials per look
    this.option = option;
    this.build();
    // the studio HDRI (1k, CC0) replaces the room light in every real material once it's in
    const url = `${mediaBase.replace(/materials\/$/, '')}hdri/studio_small_09_1k.hdr`;
    const hdri = new Promise((res) => {
      const go = (n) => new HDRLoader().load(n ? `${url}?r=${n}` : url, (t) => {
        const g = new THREE.PMREMGenerator(this.renderer);
        t.mapping = THREE.EquirectangularReflectionMapping;
        const env = g.fromEquirectangular(t).texture; g.dispose(); t.dispose();
        this.L.real.forEach((m) => { if (m.envMap) { m.envMap = env; m.needsUpdate = true; } });
        this.envTex = env; res(env);
      }, undefined, () => (n < 4 ? setTimeout(() => go(n + 1), 200 * (n + 1)) : res(null)));   // a refused request is retried
      go(0);
    });
    this.ready = Promise.all([dress(THREE, this.renderer, OPTIONS[option], this.dressMats, mediaBase), hdri]).then(() => { this._looks = ''; this.dirty = true; });
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
    const phys = (o) => new THREE.MeshPhysicalMaterial({ envMap: this.envTex, envMapRotation: this.envRot, ...o });
    const real = (o) => look(o.isMaterial ? o : phys(o), L.real, o.isMaterial ? 1 : (o.opacity ?? 1));
    this.screenCanvas = document.createElement('canvas'); this.screenCanvas.width = 780; this.screenCanvas.height = 1640;
    drawScreen(this.screenCanvas);
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas); this.screenTex.colorSpace = THREE.SRGBColorSpace; this.screenTex.anisotropy = 8;
    // the two dressed materials (frame band, back panel), shared by their pieces; maps arrive from materials.js.
    // The band: brushed titanium (anisotropic: light runs along the brushing and catches the bevels); the back: black
    // glass under a clear glossy coat.
    const frameReal = phys({ color: 0xCCCCCC, metalness: 1, roughness: 0.4, anisotropy: 0.55, anisotropyRotation: Math.PI / 2 });
    const backReal = phys({ color: 0xEEEEEE, metalness: 0, roughness: 0.6, clearcoat: 1, clearcoatRoughness: 0.035 });
    this.dressMats = { frame: [frameReal], back: [backReal] };
    // the cover glass: reflections only, added on top of the screen (so the screen's own colours stay exact)
    const glassReal = phys({ color: 0x000000, metalness: 0, roughness: 0.03, specularIntensity: 1, ior: 1.52, envMapIntensity: 0.5, clearcoat: 1, clearcoatRoughness: 0.02, blending: THREE.AdditiveBlending });
    // the polished chamfers (band, camera plateau): mirror-bright titanium, so the studio's octabox draws one clean line
    const polished = { color: 0xDFE0E2, metalness: 1, roughness: 0.07, envMapIntensity: 2.2, side: THREE.DoubleSide };
    const bezelInk = { color: 0x030303, metalness: 0, roughness: 0.4, envMapIntensity: 0.2 };
    const lensCover = { color: 0x000000, metalness: 0, roughness: 0.02, ior: 1.77, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.01, envMapIntensity: 0.9, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide };
    glassReal.userData.glass = true;
    const lensGlass = { color: 0x07080A, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [260, 520], envMapIntensity: 1.3, side: THREE.DoubleSide };
    const lensRing = { color: 0xC4C5C7, metalness: 1, roughness: 0.22, envMapIntensity: 1.5, side: THREE.DoubleSide };

    const P = (name, z, pieces) => {
      const g = new THREE.Group(); g.userData = { name, z }; this.root.add(g);
      const part = { name, group: g, z, loops: [], corners: [] };
      pieces.forEach(({ geo, realGeo = geo, pos = [0, 0, 0], matte: mh, real: ro, edges = true, edgeOpacity = 1, glass = false, matteBase = 1, realOnly = false }, k) => {
        const holder = new THREE.Group(); holder.position.set(...pos); g.add(holder);
        const add = (mat, ro_, gg = geo) => { const m = new THREE.Mesh(gg, mat); m.renderOrder = ro_; holder.add(m); return m; };
        if (realOnly) { add(real(ro), RO.real, realGeo); return; }   // a detail only the product shot has (lens elements)
        if (!glass) add(preMat, RO.pre, realGeo);   // the depth pre-pass takes the bevelled shape, so the bevels show
        add(matte(mh, matteBase), glass ? RO.glass : RO.matte);
        add(real(ro), glass ? RO.glass : RO.real, realGeo);
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
    const CH = 0.6;   // the band's chamfer (mm)
    const screenReal = new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false });
    // back to front; z = assembled depth (mm). The back faces -z. Pieces 1 and 2 (the lenses) are Bell's screw targets.
    // A lens, real: a titanium ring with a chamfer (piece 1/2), the barrel's black throat, a bright inner rim, coated glass.
    const ringGeo = () => lathe([[3.25, 1.2], [3.3, 1.5], [3.9, 1.6], [4.4, 1.25], [4.4, 0.0]], 0.6);
    const lensParts = (x, y) => [
      { realOnly: true, realGeo: lathe([[2.6, 1.05], [3.3, 1.05], [3.3, 1.15]], 0.6), pos: [x, y, -0.9], real: { color: 0x0A0A0B, roughness: 0.6, metalness: 0.2 , side: THREE.DoubleSide } },
      { realOnly: true, realGeo: lathe([[1.5, 1.16], [1.85, 1.19], [2.15, 1.16]], 0.6), pos: [x, y, -0.9], real: { color: 0x898A8C, roughness: 0.25, metalness: 1, envMapIntensity: 1.3 , side: THREE.DoubleSide } },
      { realOnly: true, realGeo: lathe([[0, 1.4], [1.4, 1.38], [2.6, 1.31], [3.3, 1.24]], 0.6), pos: [x, y, -0.9], real: lensGlass },
      { realOnly: true, realGeo: lathe([[0, 1.63], [3.2, 1.63], [3.28, 1.58]], 0.6), pos: [x, y, -0.9], real: lensCover },   // the cover glass over it
    ];
    P('Back', -3.4, [
      { geo: slab(W, H, 0.8, R), realGeo: bslab(W - 2 * CH - 0.2, H - 2 * CH - 0.2, 0.8, R - CH, 0.25), matte: 0xE5E6E8, real: backReal },
      { geo: disc(4.4, 1.2), realGeo: ringGeo(), pos: [-24, 63, -0.9], matte: 0x38393B, real: lensRing },
      { geo: disc(4.4, 1.2), realGeo: ringGeo(), pos: [-24, 50, -0.9], matte: 0x38393B, real: lensRing },
      // the camera bump: a plain raised plate in the back's own glass (two lenses, a flash, a microphone hole)
      { geo: slab(25, 36, 0.9, 7.5), realGeo: bslab(25, 36, 0.9, 7.5, 0.3), pos: [-22.5, 56.5, -0.85], matte: 0xD9DADC, real: backReal },
      // the plateau's machined edge: a polished chamfer round its outer face
      { realOnly: true, realGeo: chamfer(25.04, 36.04, 7.52, 0.35, -0.1, -0.47), pos: [-22.5, 56.5, -0.85], real: polished },
      { geo: disc(1.5, 0.3), pos: [-14.6, 63, -1.4], matte: 0xEEEFF1, real: { color: 0xE5E6E8, roughness: 0.45, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }, edgeOpacity: 0.8 },
      { realOnly: true, realGeo: disc(0.45, 0.3), pos: [-14.6, 50, -1.32], real: { color: 0x050505, roughness: 0.7, metalness: 0 } },
      ...lensParts(-24, 63), ...lensParts(-24, 50),
    ]);
    P('Battery', -1.4, [{ geo: slab(54, 80, 3.2, 2), pos: [0, -28, 0], matte: 0xD9DADC, real: { color: 0x2A2C2F, roughness: 0.55, metalness: 0.3 } }]);
    P('Board', 0.4, [
      { geo: slab(64, 46, 1.0, 2), pos: [0, 48, 0], matte: 0x393A3C, real: { color: 0x1F3A2E, roughness: 0.6, metalness: 0.15 } },
      ...[[-12, 52, 16, 14], [10, 54, 12, 12], [12, 38, 16, 8], [-18, 34, 9, 9]].map(([x, y, w, h]) =>
        ({ geo: slab(w, h, 1.2, 0.6), pos: [x, y, 1.0], matte: 0xEAEBED, real: { color: 0x141414, roughness: 0.35, metalness: 0.4 } })),
    ]);
    // the band and its keys (a volume rocker and the power key, on the right side)
    const key = (len, y) => ({ geo: new THREE.BoxGeometry(1.2, len, 2.4), realGeo: roundedKey(len), pos: [W / 2 + 0.2, y, 0], matte: 0xCFD0D2, real: frameReal, edgeOpacity: 0.85 });
    // the band, real: flat brushed sides between two polished 45-degree chamfers (front and back), CH wide
    P('Frame', 0, [{ geo: ring(W, H, 7.6, R, 1.1), realGeo: ring(W, H, 7.6 - 2 * CH, R, 1.1), matte: 0xD6D7D9, real: frameReal }, key(22, 46), key(11, 26),
      { realOnly: true, realGeo: chamfer(W, H, R, CH, 3.8 - CH, 3.8), real: polished },
      { realOnly: true, realGeo: chamfer(W, H, R, CH, -3.8 + CH, -3.8), real: polished },
      { realOnly: true, realGeo: flatRing(W - 2 * CH, H - 2 * CH, R - CH, W - 2.2, H - 2.2, R - 1.1, 3.8), real: frameReal },
      { realOnly: true, realGeo: flatRing(W - 2 * CH, H - 2 * CH, R - CH, W - 2.2, H - 2.2, R - 1.1, 0).rotateY(Math.PI).translate(0, 0, -3.79), real: frameReal }]);
    P('Screen', 2.6, [
      { geo: slab(W - 1.4, H - 1.4, 0.6, R - 0.7), matte: 0xDFE0E2, real: { color: 0x050505, roughness: 0.3, metalness: 0 }, edges: false },
      { geo: faceUV(new THREE.ShapeGeometry(roundedRect(W - 2.8, H - 2.8, R - 1.4), 12), W - 2.8, H - 2.8), pos: [0, 0, 0.32], matte: 0xEBECEE, real: screenReal, edgeOpacity: 0.8 },
    ]);
    P('Glass', 3.6, [
      // the glass is see-through: no depth pre-pass, faint in both solid looks, drawn after the faces
      { geo: slab(W, H, 0.7, R), realGeo: bslab(W, H, 0.7, R, 0.3), matte: 0xF5F6F8, matteBase: 0.22, real: glassReal, edgeOpacity: 0.85, glass: true },
      { geo: disc(1.6, 0.8), pos: [0, 72.5, 0.1], matte: 0x0A0A0A, real: { color: 0x050505, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03 } },
      // tight, even bezels: the black mask printed under the cover glass, from the chamfer to the display, 0.8 mm all round
      { realOnly: true, realGeo: flatRing(W - 2 * CH, H - 2 * CH, R - CH, W - 2.8, H - 2.8, R - 1.4, 0.26), real: bezelInk },
    ]);
    // the soft shadow on the paper behind the finished phone (not in the fit; follows the phone's turn)
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shadowTex(), transparent: true, depthTest: false, depthWrite: false, opacity: 0 }));
    this.shadow.renderOrder = -1; this.scene.add(this.shadow);
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
    // (round 7) the canvas exactly its buffer's device pixels (no fractional resampling)
    this.canvas.style.width = `${(Math.round(w * this.dpr) / this.dpr).toFixed(4)}px`; this.canvas.style.height = `${(Math.round(h * this.dpr) / this.dpr).toFixed(4)}px`;
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
    L.ink.forEach((m) => { m.opacity = m.userData.base * built * (1 - real); m.visible = built > 0.001 && real < 0.999; });
    L.real.forEach((m) => { m.opacity = m.userData.base * built * real; m.visible = built * real > 0.001; m.depthWrite = !m.userData.glass && built * real > 0.999; });
    this.shadow.material.opacity = Math.min(0.6, 0.34 * (this.shadowK ?? 1)) * built * real; this.shadow.visible = built * real > 0.001;
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
    // round 6 (fit.snap = the grid's cell): the phone fills its band exactly along the tighter side (the band's edges are
    // grid lines), and its leading edge along the other side moves onto a line
    const exact = !!f.snap;
    const box2 = () => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const v = new THREE.Vector3();
      pts.forEach((q) => { v.copy(q).project(this.camera); const sx = (v.x + 1) / 2 * this.W, sy = (1 - v.y) / 2 * this.H;
        if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy; });
      return { x0, x1, y0, y1 }; };
    for (let it = 0; it < (exact ? 7 : 3); it++) {
      this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z);
      this.camera.updateMatrixWorld();
      const { x0, x1, y0, y1 } = box2();
      const s = Math.max((x1 - x0) / bw, (y1 - y0) / bh) / (exact ? 1 : 0.96);
      const upp = 2 * d * t / this.H;
      let cx = (f.left + this.W - f.right) / 2, cy = (f.top + this.H - f.bottom) / 2;
      if (exact && it >= 3) {   // the looser side: its first edge on the line nearest to centred
        const u = f.snap, wide = (x1 - x0) / bw >= (y1 - y0) / bh;
        if (wide) { const h = y1 - y0, top = Math.round((cy - h / 2) / u) * u; cy = top + h / 2; }
        else { const w = x1 - x0, left = Math.round((cx - w / 2) / u) * u; cx = left + w / 2; }
      }
      ox += ((x0 + x1) / 2 - cx) * upp;
      oy -= ((y0 + y1) / 2 - cy) * upp;
      d *= s;
    }
    this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z);
    this.camera.updateMatrixWorld();
    this.pts = pts;
    this.base = { yaw, pitch, ctr, d };
    this.tilt(this.tiltNow.yaw, this.tiltNow.pitch);
  }
  /** live: a small extra turn on top of the fitted pose (pointer, gyroscope), without refitting; places the shadow */
  tilt(yaw = 0, pitch = 0) {
    this.tiltNow = { yaw, pitch };
    const b = this.base; if (!b) return;
    this.root.rotation.set(b.pitch + pitch, b.yaw + yaw, 0); this.root.updateMatrixWorld(true);
    // the shadow: the phone's turned silhouette, soft, on the paper 40 mm behind it, offset away from the key light
    const Y = b.yaw + yaw, Pt = b.pitch + pitch, depth = 7.6, back = 40, k = (b.d + back) / b.d;
    const w = PHONE.w * Math.abs(Math.cos(Y)) + depth * Math.abs(Math.sin(Y)), h = PHONE.h * Math.abs(Math.cos(Pt)) + depth * Math.abs(Math.sin(Pt));
    this.shadow.position.set(b.ctr.x + 4 * k, b.ctr.y - 7 * k, b.ctr.z - back);
    this.shadow.scale.set(w * 256 / 136 * k, h * 512 / 392 * k, 1);
  }

  /** a part's projected box (CSS px) */
  partBox(part) {
    const v = new THREE.Vector3(); let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
    part.corners.forEach((c) => { v.copy(c.v).applyMatrix4(c.holder.matrixWorld).project(this.camera);
      const x = (v.x + 1) / 2 * this.W, y = (1 - v.y) / 2 * this.H; l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); });
    return { left: l, right: r, top: t, bottom: b, cx: (l + r) / 2, cy: (t + b) / 2 };
  }
  /** round 8: a part's projected outline (the convex hull of its corners on screen, CSS px), for the names' clearance
   *  and the type check: tighter than its box when the phone is turned */
  partHull(k) {
    const part = this.parts[k], v = new THREE.Vector3(), pts = [];
    part.corners.forEach((c) => { v.copy(c.v).applyMatrix4(c.holder.matrixWorld).project(this.camera); pts.push([(v.x + 1) / 2 * this.W, (1 - v.y) / 2 * this.H]); });
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const q of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = pts.length - 1; i >= 0; i--) { const q = pts[i]; while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }
  /** is (x, y) inside part k's outline, or within m px of it */
  inHull(k, x, y, m = 0) {
    const h = this.partHull(k); let inside = false;
    for (let i = 0, j = h.length - 1; i < h.length; j = i++) { const [xi, yi] = h[i], [xj, yj] = h[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside; }
    if (inside || !m) return inside;
    for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
      const s = L ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L)) : 0; if (Math.hypot(x - a[0] - s * dx, y - a[1] - s * dy) < m) return true; }
    return false;
  }
  /** does the rect (x0, y0)-(x1, y1) meet part k's outline */
  hullNear(k, x0, y0, x1, y1) {
    const h = this.partHull(k);
    if (h.some(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) return true;
    if ([[x0, y0], [x1, y0], [x1, y1], [x0, y1]].some(([x, y]) => this.inHull(k, x, y))) return true;
    const segX = (a, b, c, d) => { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
    const R = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let i = 0; i < h.length; i++) for (let j = 0; j < 4; j++) if (segX(h[i], h[(i + 1) % h.length], R[j], R[(j + 1) % 4])) return true;
    return false;
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
  refreshScreen(ink = LIGHT.ink, paper = LIGHT.paper, graphite = LIGHT.graphite) { drawScreen(this.screenCanvas, ink, paper, graphite); this.screenTex.needsUpdate = true; try { this.renderer.initTexture(this.screenTex); } catch (e) {} }
  render() { this.renderer.render(this.scene, this.camera); this.dirty = false; }
  snapshot() { this.render(); return this.renderer.domElement.toDataURL('image/png'); }
}

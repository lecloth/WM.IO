// Page 1: today's phone, built in code from Take 1's three.js hero phone (rounded slabs, matte parts, hairline edges),
// now as six real parts (Glass, Screen, Frame, Board, Battery, Back) and three looks that wipe across it:
//   X-ray (the drawing: cyanotype blue, white lines)  ->  matte (built: hairline edges)  ->  real materials.
// Each part carries one mesh per look; two moving clipping planes decide which look shows where, so the phone
// "dresses up" as a scan line crosses it. No logos, no brand shapes (two plain round lenses, a round punch-hole).
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

// the screen, drawn in code: the next page's question, so the phone hands over to "For you" (placeholder words)
export function drawScreen(c, { dark = false } = {}) {
  const x = c.getContext('2d'), W = c.width, H = c.height, k = W / 390;
  x.fillStyle = '#F2F0EB'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#121212';
  x.font = `500 ${13 * k}px "DM Mono", monospace`; x.fillText('02 · FOR YOU', 28 * k, 92 * k);
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
#include <clipping_planes_pars_vertex>
varying vec3 vN; varying vec3 vV;
void main(){ vec4 mvPosition = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}`;
const XRAY_FS = `
#include <clipping_planes_pars_fragment>
uniform float uFade; varying vec3 vN; varying vec3 vV;
void main(){
  #include <clipping_planes_fragment>
  float f = 1. - abs(dot(normalize(vN), normalize(vV)));
  float a = (.05 + pow(f, 2.2) * .55) * uFade;
  gl_FragColor = vec4(vec3(.93, .95, .97) * a, a);
}`;

export class Phone {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.localClippingEnabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    this.camera = new THREE.PerspectiveCamera(28, 1, 20, 3000);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6ae, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-0.6, 1, 1.4); this.scene.add(key);
    this.root = new THREE.Group(); this.scene.add(this.root);
    // the two wipes: plane A splits X-ray | matte, plane B splits matte | real (world-space, moved each frame)
    this.planeA = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    this.planeB = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    this.lineMats = [];
    this.parts = [];
    this.build();
  }

  lineMat(color, opacity, planes) {
    const m = new LineMaterial({ color, linewidth: 1, worldUnits: false, transparent: true, opacity, clippingPlanes: planes });
    this.lineMats.push(m); return m;
  }

  build() {
    const A = this.planeA, B = this.planeB;
    const notA = new THREE.Plane(), notB = new THREE.Plane();   // filled in update(): the other side of each wipe
    this.notA = notA; this.notB = notB;
    this.xrayMats = []; this.whiteLines = [];
    const xrayMat = () => { const m = new THREE.ShaderMaterial({ vertexShader: XRAY_VS, fragmentShader: XRAY_FS, uniforms: { uFade: { value: 1 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, clipping: true, clippingPlanes: [notA] }); this.xrayMats.push(m); return m; };
    const matte = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.95, metalness: 0, envMapIntensity: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, clippingPlanes: [A, notB] });
    const real = (o) => new THREE.MeshStandardMaterial({ envMap: this.envTex, clippingPlanes: [B], ...o });
    // screen texture
    this.screenCanvas = document.createElement('canvas'); this.screenCanvas.width = 780; this.screenCanvas.height = 1688;
    drawScreen(this.screenCanvas);
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas); this.screenTex.colorSpace = THREE.SRGBColorSpace; this.screenTex.anisotropy = 8;

    const P = (name, z, pieces) => {
      const g = new THREE.Group(); g.userData = { name, z }; this.root.add(g);
      const part = { name, group: g, z, meshes: [] };
      pieces.forEach(({ geo, pos = [0, 0, 0], matte: mh, real: ro, edges = true, edgeOpacity = 1, xray = true }) => {
        const holder = new THREE.Group(); holder.position.set(...pos); g.add(holder);
        if (xray) { const m = new THREE.Mesh(geo, xrayMat()); holder.add(m); part.meshes.push(m); }
        const mm = new THREE.Mesh(geo, matte(mh)); holder.add(mm); part.meshes.push(mm);
        const rm = new THREE.Mesh(geo, ro.isMaterial ? ro : real(ro)); holder.add(rm); part.meshes.push(rm);
        if (edges) {
          const eg = new THREE.EdgesGeometry(geo, 30), lg = new LineSegmentsGeometry().fromEdgesGeometry(eg); eg.dispose();
          const wl = this.lineMat(0xECF1F6, 0.8 * edgeOpacity, [notA]); wl.userData.o = 0.8 * edgeOpacity; this.whiteLines.push(wl);
          holder.add(new LineSegments2(lg, wl));   // white lines while it's a drawing
          holder.add(new LineSegments2(lg, this.lineMat(0x121212, 1 * edgeOpacity, [A, notB])));   // ink hairlines while built
        }
      });
      g.position.z = z; this.parts.push(part); return part;
    };
    const screenReal = new THREE.MeshBasicMaterial({ map: this.screenTex, clippingPlanes: [B], toneMapped: false });
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
      { geo: slab(74, 154, 0.8, 11), matte: 0xF7F6F2, real: { color: 0xffffff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.12, depthWrite: false }, edgeOpacity: 0.7 },
      { geo: disc(1.9, 0.9), pos: [0, 69, 0.1], matte: 0x0A0A0A, real: { color: 0x050505, roughness: 0.1, metalness: 0 } },
    ]);
    // the glass's matte face hides the screen once built; make it faint so the screen reads through
    this.parts.find((p) => p.name === 'Glass').meshes.forEach((m) => { if (m.material.isMeshStandardMaterial && m.material.envMapIntensity === 0) { m.material.transparent = true; m.material.opacity = 0.25; m.material.depthWrite = false; } });
  }

  /** layout in CSS px and state: explode 0..1, turn (radians yaw), tilt, wipes a/b as 0..1 across the phone */
  resize(w, h) {
    this.W = w; this.H = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.lineMats.forEach((m) => m.resolution.set(w * this.dpr, h * this.dpr));
  }

  set({ explodeEach, yaw, pitch, wipeA, wipeB, gap = 26, fit, fade = 1 }) {
    this.parts.forEach((p, i) => { p.group.position.z = p.z + (i - 2.5) * gap * explodeEach[i]; });
    if (fade !== this._fade) { this._fade = fade; this.xrayMats.forEach((m) => { m.uniforms.uFade.value = fade; }); this.whiteLines.forEach((m) => { m.opacity = m.userData.o * fade; }); }
    this.root.rotation.set(pitch, yaw, 0);
    this.root.updateMatrixWorld(true);
    // wipes sweep in world X across the phone's current screen extent (left to right)
    const box = new THREE.Box3().setFromObject(this.root);
    const xa = THREE.MathUtils.lerp(box.min.x - 2, box.max.x + 2, wipeA), xb = THREE.MathUtils.lerp(box.min.x - 2, box.max.x + 2, wipeB);
    this.planeA.set(new THREE.Vector3(-1, 0, 0), xa);     // matte shows where x < xa
    this.notA.set(new THREE.Vector3(1, 0, 0), -xa);       // x-ray shows where x > xa
    this.planeB.set(new THREE.Vector3(-1, 0, 0), xb);     // real shows where x < xb
    this.notB.set(new THREE.Vector3(1, 0, 0), -xb);       // matte limited to x > xb
    this.box = box; this.wipeX = [xa, xb];
    // camera: fit the live bounding sphere into the band given by fit = { top, bottom, left, right } in CSS px
    const sph = box.getBoundingSphere(new THREE.Sphere());
    const f = fit || { top: 0, bottom: 0, left: 0, right: 0 };
    const t = Math.tan(this.camera.fov * Math.PI / 360);
    const hf = (this.H - f.top - f.bottom) / this.H, wf = (this.W - f.left - f.right) / this.W;
    const d = Math.max(sph.radius / t / hf, sph.radius / t / this.camera.aspect / wf) * 1.02;
    this.camera.setViewOffset(this.W, this.H, -(f.left - f.right) / 2, -(f.top - f.bottom) / 2, this.W, this.H);
    this.camera.position.set(sph.center.x, sph.center.y, sph.center.z + d);
    this.camera.lookAt(sph.center);
    this.camera.updateMatrixWorld();
    this.sphere = sph;
  }

  /** screen x (CSS px) of a world x at the phone's centre height, for the background wipes */
  screenX(xw) {
    const v = new THREE.Vector3(xw, this.sphere.center.y, this.sphere.center.z).project(this.camera);
    return (v.x + 1) / 2 * this.W;
  }
  /** screen position (CSS px) of a point on a part (local coords of its group) */
  project(part, x, y, z) {
    const v = new THREE.Vector3(x, y, z).applyMatrix4(part.group.matrixWorld).project(this.camera);
    return [(v.x + 1) / 2 * this.W, (1 - v.y) / 2 * this.H];
  }
  /** the phone's projected bounding box (CSS px), for the geometry check */
  screenBox() {
    const b = this.box, pts = [];
    for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) pts.push(new THREE.Vector3(x, y, z).project(this.camera));
    const xs = pts.map((v) => (v.x + 1) / 2 * this.W), ys = pts.map((v) => (1 - v.y) / 2 * this.H);
    return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
  }
  refreshScreen() { drawScreen(this.screenCanvas); this.screenTex.needsUpdate = true; }
  render() { this.renderer.render(this.scene, this.camera); }
  snapshot() { this.render(); return this.renderer.domElement.toDataURL('image/png'); }
}

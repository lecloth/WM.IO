// Version B of the finished phone: a free, human-made model (generic, no brand shape; CC0 or CC BY; see CREDITS.md),
// shown on the asset sheet beside our own (A) for Wajih's pick.
// No jump if B is picked: the model is scaled and centred into exactly our phone's assembled box (PHONE: 74 x 156 mm,
// the same depth), and framed by the same fit as ours (the same box corners, the same band), so at the same yaw and
// pitch it stands exactly where ours stands; the swap is a cross-fade of the materials only.
// Same light as A: the studio HDRI, ACES filmic tone mapping, the same soft shadow. Pixel ratio capped at 2.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { PHONE, drawScreen } from './phone.js';

// Candidates (filled from the licence-checked search; see CREDITS.md). `file` is the compressed GLB (meshopt) we
// made from the original; `rotate` turns it screen-forward (+z), top-up (+y); `screen` names the display mesh, which
// gets our own screen (the next page's question), as A has.
// All three need a Sketchfab login to download (Wajih): "Download 3D model" -> "GLB (.glb)", saved as `saveAs`; then
// we strip anything branded, compress it (meshopt) into `site/media/models/phone-b/<key>.glb` and set `file`.
// Licences read 23 Nov 2026 from each model's Sketchfab data (api.sketchfab.com/v3/models/<uid>): "CC Attribution ·
// Author must be credited. Commercial use is allowed." (CC BY 4.0).
export const MODELS = [
  { key: 'B1', title: 'Generic Modern Phone', credit: 'ToMar_, Sketchfab', page: 'https://sketchfab.com/3d-models/generic-modern-phone-model-3eea9dd94d554e95b143b7b090b89f1f',
    licence: 'CC BY 4.0', note: 'Slab with real keys and a modest bevel; a vertical two-lens module with flash, top left. 96k triangles, plain colour materials. Its small “50MP” print comes off.',
    saveAs: 'tools/sources/phones/b1-tomar/model.glb', file: null },
  { key: 'B2', title: 'Generic Smartphone, PBR', credit: 'devOMAR, Sketchfab', page: 'https://sketchfab.com/3d-models/generic-smartphone-game-ready-pbr-asset-21afd26fd39944adaeb31ec43bb87e11',
    licence: 'CC BY 4.0', note: 'The crispest of the three: flat sides, clean bevels, USB-C port, speaker holes, punch-hole camera. 5k triangles with a 2K PBR set. Back unseen until downloaded.',
    saveAs: 'tools/sources/phones/b2-devomar/model.glb', file: null },
  { key: 'B3', title: 'Smartphone', credit: 'Xyber, Sketchfab', page: 'https://sketchfab.com/3d-models/smartphone-8c5f6079a7be48819f8d1dfca271bae3',
    licence: 'CC BY 4.0', note: 'Plain slab, one small square lens at the top centre, keys, SIM tray, USB-C. 64k triangles. Its made-up “METEOR” logo on the back comes off.',
    saveAs: 'tools/sources/phones/b3-xyber/model.glb', file: null },
];

// our phone's assembled box (mm): the band +-37 (keys to 37.8), +-78 tall, back with its bump and lenses to -4.95, glass to 3.95
const BOX = new THREE.Box3(new THREE.Vector3(-37, -78, -4.95), new THREE.Vector3(37.8, 78, 3.95));

export class PhoneB {
  constructor(canvas, model, { base = '' } = {}) {
    this.model = model;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.dpr = Math.min(devicePixelRatio || 1, 2); this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0, 0); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene = new THREE.Scene(); this.scene.environmentRotation = new THREE.Euler(0, 0, 0);
    this.camera = new THREE.PerspectiveCamera(26, 1, 20, 4000);
    this.root = new THREE.Group(); this.scene.add(this.root);
    this.tiltNow = { yaw: 0, pitch: 0 };
    // the same soft shadow as A
    const c = document.createElement('canvas'); c.width = 256; c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, 256, 512); x.filter = 'blur(22px)'; x.fillStyle = '#fff'; x.beginPath(); x.roundRect(60, 60, 136, 392, 26); x.fill();
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0, alphaMap: new THREE.CanvasTexture(c), transparent: true, opacity: 0.34, depthTest: false, depthWrite: false }));
    this.shadow.renderOrder = -1; this.scene.add(this.shadow);
    const env = new Promise((res) => new HDRLoader().load(`${base}media/hdri/studio_small_09_1k.hdr`, (t) => {
      const g = new THREE.PMREMGenerator(this.renderer); this.scene.environment = g.fromEquirectangular(t).texture; g.dispose(); t.dispose(); res();
    }, undefined, () => res()));
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const glb = new Promise((res, rej) => loader.load(`${base}${model.file}`, (g) => { this.place(g.scene); res(); }, undefined, rej));
    this.ready = Promise.all([env, glb]).catch((e) => console.warn('[phone B]', model.key, e));
  }
  place(obj) {
    const [rx = 0, ry = 0, rz = 0] = this.model.rotate || [];
    obj.rotation.set(rx, ry, rz); obj.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(obj), size = b.getSize(new THREE.Vector3()), ctr = b.getCenter(new THREE.Vector3());
    const s = (BOX.max.y - BOX.min.y) / size.y;                    // its height = ours; width and depth follow its own shape
    const holder = new THREE.Group(); holder.add(obj); obj.position.sub(ctr);
    holder.scale.setScalar(s); holder.position.copy(BOX.getCenter(new THREE.Vector3()));
    this.root.add(holder);
    if (this.model.screen) {
      const cv = document.createElement('canvas'); cv.width = 780; cv.height = 1640; drawScreen(cv);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = this.model.screenFlipY ?? false; tex.anisotropy = 8;
      obj.traverse((m) => { if (m.isMesh && (m.name === this.model.screen || m.material?.name === this.model.screen)) m.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); });
    }
    obj.traverse((m) => { if (m.isMesh && m.material && 'envMapIntensity' in m.material) m.material.envMapIntensity = this.model.env ?? 1; });
  }
  warm() { try { this.renderer.compile(this.scene, this.camera); } catch (e) {} }
  resize(w, h) { this.W = w; this.H = h; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  /** the same fit as Phone.set (our assembled box's corners, projected, fitted to the band) */
  set({ yaw, pitch, fit }) {
    this.root.rotation.set(pitch, yaw, 0); this.root.updateMatrixWorld(true);
    const pts = []; for (const x of [BOX.min.x, BOX.max.x]) for (const y of [BOX.min.y, BOX.max.y]) for (const z of [BOX.min.z, BOX.max.z]) pts.push(new THREE.Vector3(x, y, z).applyMatrix4(this.root.matrixWorld));
    const f = fit || { top: 0, bottom: 0, left: 0, right: 0 }, bw = this.W - f.left - f.right, bh = this.H - f.top - f.bottom;
    const box = new THREE.Box3().setFromPoints(pts), ctr = box.getCenter(new THREE.Vector3()), t = Math.tan(this.camera.fov * Math.PI / 360);
    let d = box.getBoundingSphere(new THREE.Sphere()).radius / t * 1.2, ox = 0, oy = 0;
    this.camera.setViewOffset(this.W, this.H, -(f.left - f.right) / 2, -(f.top - f.bottom) / 2, this.W, this.H);
    for (let it = 0; it < 4; it++) {
      this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z); this.camera.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const v = new THREE.Vector3();
      pts.forEach((q) => { v.copy(q).project(this.camera); const sx = (v.x + 1) / 2 * this.W, sy = (1 - v.y) / 2 * this.H; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); });
      const s = Math.max((x1 - x0) / bw, (y1 - y0) / bh) / 0.96, upp = 2 * d * t / this.H;
      ox += ((x0 + x1) / 2 - (f.left + this.W - f.right) / 2) * upp; oy -= ((y0 + y1) / 2 - (f.top + this.H - f.bottom) / 2) * upp; d *= s;
    }
    this.camera.position.set(ctr.x + ox, ctr.y + oy, ctr.z + d); this.camera.lookAt(ctr.x + ox, ctr.y + oy, ctr.z); this.camera.updateMatrixWorld();
    this.base = { yaw, pitch, ctr, d };
    this.tilt(this.tiltNow.yaw, this.tiltNow.pitch);
  }
  tilt(yaw = 0, pitch = 0) {
    this.tiltNow = { yaw, pitch }; const b = this.base; if (!b) return;
    this.root.rotation.set(b.pitch + pitch, b.yaw + yaw, 0); this.root.updateMatrixWorld(true);
    const Y = b.yaw + yaw, P = b.pitch + pitch, depth = 7.6, back = 40, k = (b.d + back) / b.d;
    this.shadow.position.set(b.ctr.x + 4 * k, b.ctr.y - 7 * k, b.ctr.z - back);
    this.shadow.scale.set((PHONE.w * Math.abs(Math.cos(Y)) + depth * Math.abs(Math.sin(Y))) * 256 / 136 * k, (PHONE.h * Math.abs(Math.cos(P)) + depth * Math.abs(Math.sin(P))) * 512 / 392 * k, 1);
  }
  render() { this.renderer.render(this.scene, this.camera); }
}

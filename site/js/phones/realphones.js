// The two real phones (Part 5 "Round 4 picks"): iPhone 18 Pro Max and Galaxy S26 Ultra, so older owners see at a
// glance that we build for both. LICENCES UNVERIFIED: local only, a blocker before any hosting (CREDITS.md).
// The web copies live in site/media/phones-unverified/ (git-ignored, made by tools/phones_web.mjs: logos removed,
// meshopt-compressed, textures phone-sized). Because that folder is not in git, everything here copes with the files
// being missing: load() resolves { missing: true } and callers show their fallback.
// Light: the same studio as phone A on page 1 (Poly Haven "Studio Small 09" HDRI, CC0; ACES filmic tone mapping,
// exposure 1, the same soft shadow). Our own app goes on each display (site/js/apps/booking.js).
// Each model is normalised once: millimetres, centred, screen facing +z, top up +y.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { drawBooking, SCREEN as APP } from '../apps/booking.js';

export const DIR = 'media/phones-unverified/';
// rotate: Euler (radians) that turns the file screen-forward (+z), top-up (+y); height: mm (the iPhone file is in
// metres, 163.3 mm tall; the S26 file has no units, so it is scaled to the same height, about right for both).
export const PHONES = {
  iphone18: { key: 'iphone18', name: 'iPhone 18 Pro Max', os: 'iOS', file: 'iphone18.glb', rotate: [0, 0, 0], height: 163.3 },
  s26: { key: 's26', name: 'Galaxy S26 Ultra', os: 'Android', file: 's26.glb', rotate: [0, 0, 0], height: 163.0 },
};

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const once = new Map();
/** the GLB, loaded once per page (a refused request on the plain local server is retried; a 404 is "missing") */
function fetchGLB(url) {
  if (once.has(url)) return once.get(url);
  const p = (async () => {
    for (let n = 0; n < 4; n++) {
      let res; try { res = await fetch(n ? `${url}?r=${n}` : url); } catch (e) { await new Promise((r) => setTimeout(r, 200 * (n + 1))); continue; }
      if (res.status === 404) return null;
      if (!res.ok) { await new Promise((r) => setTimeout(r, 200 * (n + 1))); continue; }
      const buf = await res.arrayBuffer();
      return new Promise((ok, no) => loader.parse(buf, url.replace(/[^/]*$/, ''), ok, no));
    }
    return null;
  })();
  once.set(url, p); return p;
}

/** the studio light as a PMREM environment for one renderer */
const envs = new WeakMap();
export function studio(renderer, base = '') {
  if (envs.has(renderer)) return envs.get(renderer);
  const url = `${base}media/hdri/studio_small_09_1k.hdr`;
  const p = new Promise((res) => {
    const go = (n) => new HDRLoader().load(n ? `${url}?r=${n}` : url, (t) => {
      const g = new THREE.PMREMGenerator(renderer); t.mapping = THREE.EquirectangularReflectionMapping;
      const env = g.fromEquirectangular(t).texture; g.dispose(); t.dispose(); res(env);
    }, undefined, () => (n < 4 ? setTimeout(() => go(n + 1), 200 * (n + 1)) : res(null)));
    go(0);
  });
  envs.set(renderer, p); return p;
}

/** our app on a canvas texture, for a display */
export function appTexture(theme) {
  const c = document.createElement('canvas'); c.width = 720; c.height = Math.round(720 * APP.h / APP.w);
  drawBooking(c, theme);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 8;
  t.userData.redraw = (th) => { drawBooking(c, th); t.needsUpdate = true; };
  return t;
}

/** one phone, normalised. Resolves { missing: true } when its file isn't there. opts.file overrides the file name. */
export async function loadPhone(key, { base = '', file } = {}) {
  const spec = PHONES[key];
  const gltf = await fetchGLB(`${base}${DIR}${file || spec.file}`).catch(() => null);
  if (!gltf) return { key, spec, missing: true };
  const obj = gltf.scene.clone(true);
  obj.rotation.set(...spec.rotate); obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj), size = b.getSize(new THREE.Vector3()), ctr = b.getCenter(new THREE.Vector3());
  const s = spec.height / size.y;
  const holder = new THREE.Group(); obj.position.sub(ctr); holder.add(obj); holder.scale.setScalar(s);
  let screen = null;
  obj.traverse((m) => {
    if (!m.isMesh) return;
    if (m.name === 'SCREEN' || m.material?.name === 'SCREEN') screen = m;
    // the file's own materials, lit by the studio (env comes from scene.environment)
  });
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder);
  return { key, spec, missing: false, obj: holder, inner: obj, screen, size: box.getSize(new THREE.Vector3()), box };
}

/** put our app on a phone's display */
export function setScreen(phone, tex) {
  if (!phone.screen) return;
  phone.screen.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
}

// a soft shadow (the same as phone A's): a blurred rounded rectangle as an alpha map
function shadowTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 512); x.filter = 'blur(22px)'; x.fillStyle = '#fff';
  x.beginPath(); x.roundRect(60, 60, 136, 392, 26); x.fill();
  return new THREE.CanvasTexture(c);
}

/** both phones side by side in one canvas (the asset sheet; later page 4): live, turnable, the same studio light.
 *  ready resolves with the list of missing keys. */
export class PhonePair {
  constructor(canvas, { base = '', keys = ['iphone18', 's26'], gap = 26, preserve = false } = {}) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: preserve });
    this.dpr = Math.min(devicePixelRatio || 1, 2); this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0, 0); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(22, 1, 20, 6000);
    this.gap = gap; this.items = []; this.tiltNow = { yaw: 0, pitch: 0 }; this.yaw = 0; this.pitch = 0;
    this.app = appTexture();
    const env = studio(this.renderer, base).then((e) => { this.scene.environment = e; });
    const phones = Promise.all(keys.map((k) => loadPhone(k, { base })));
    this.ready = Promise.all([env, phones]).then(([, list]) => {
      list.forEach((p) => {
        if (p.missing) { this.items.push(p); return; }
        setScreen(p, this.app);
        const pivot = new THREE.Group(); pivot.add(p.obj); this.scene.add(pivot);
        const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0, alphaMap: shadowTex(), transparent: true, opacity: 0.3, depthWrite: false }));
        sh.renderOrder = -1; this.scene.add(sh);
        this.items.push({ ...p, pivot, shadow: sh });
      });
      const shown = this.items.filter((p) => !p.missing);
      const total = shown.reduce((a, p) => a + p.size.x, 0) + this.gap * Math.max(0, shown.length - 1);
      let x = -total / 2;
      shown.forEach((p) => { p.pivot.position.set(x + p.size.x / 2, 0, 0); x += p.size.x + this.gap; });
      this.width = total; this.heightMM = Math.max(1, ...shown.map((p) => p.size.y));
      try { this.renderer.compile(this.scene, this.camera); } catch (e) {}
      return this.items.filter((p) => p.missing).map((p) => p.key);
    });
  }
  resize(w, h) { this.W = w; this.H = h; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.frame(); }
  /** both phones turn about their own upright axes (yaw) and lean (pitch) */
  set({ yaw = this.yaw, pitch = this.pitch } = {}) { this.yaw = yaw; this.pitch = pitch; this.apply(); }
  tilt(yaw = 0, pitch = 0) { this.tiltNow = { yaw, pitch }; this.apply(); }
  apply() {
    const Y = this.yaw + this.tiltNow.yaw, P = this.pitch + this.tiltNow.pitch;
    this.items.forEach((p) => {
      if (p.missing) return;
      p.pivot.rotation.set(P, Y, 0);
      const w = p.size.x * Math.abs(Math.cos(Y)) + p.size.z * Math.abs(Math.sin(Y));
      p.shadow.position.set(p.pivot.position.x + 3, -5, -38);
      p.shadow.scale.set(w * 256 / 136, p.size.y * 512 / 392, 1);
    });
  }
  /** frame both phones in the canvas with a margin (CSS px) */
  frame(m = { top: 40, bottom: 40, left: 24, right: 24 }) {
    if (!this.W || !this.width) return;
    const t = Math.tan(this.camera.fov * Math.PI / 360);
    const bw = this.W - m.left - m.right, bh = this.H - m.top - m.bottom;
    const dH = (this.heightMM * 1.04) / 2 / t * this.H / bh, dW = (this.width * 1.04) / 2 / t / this.camera.aspect * this.W / bw;
    const d = Math.max(dH, dW);
    this.camera.setViewOffset(this.W, this.H, -(m.left - m.right) / 2, -(m.top - m.bottom) / 2, this.W, this.H);
    this.camera.position.set(0, 0, d); this.camera.lookAt(0, 0, 0); this.camera.updateMatrixWorld();
  }
  render() { this.renderer.render(this.scene, this.camera); }
}

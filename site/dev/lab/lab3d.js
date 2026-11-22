// Shared three.js helpers for the lab options.
import * as THREE from 'three';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const span = (p, a, b) => clamp((p - a) / (b - a));
export const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;      // in-out cubic
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const lerp = (a, b, t) => a + (b - a) * t;

/** keyframes [[p, value], ...] with eased moves and flat holds where two keys share a value */
export function keys(p, k) {
  if (p <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) {
      const t = ease(span(p, k[i - 1][0], k[i][0])), a = k[i - 1][1], b = k[i][1];
      return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], t)) : lerp(a, b, t);
    }
  }
  return k[k.length - 1][1];
}

export function makeRenderer(mount, { alpha = true, clear = 0x000000, clearAlpha = 0, antialias = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(clear, clearAlpha);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.append(renderer.domElement);
  return renderer;
}

const texCache = new Map();
export function loadTex(url, renderer) {
  if (!texCache.has(url)) {
    texCache.set(url, new Promise((res, rej) => new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t);
    }, undefined, rej)));
  }
  return texCache.get(url);
}

/** screen position (CSS px) of a world point */
export function toScreen(v3, camera, w, h) {
  const v = v3.clone().project(camera);
  return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h, v.z];
}

export function disposeScene(scene, renderer) {
  scene.traverse((o) => {
    o.geometry?.dispose?.();
    const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => { Object.values(mm).forEach((v) => v?.isTexture && !v.userData?.shared && v.dispose()); mm.dispose(); });
  });
  renderer.dispose(); renderer.forceContextLoss?.(); renderer.domElement.remove();
}

/** keep the drawing clear of the label at the top and the caption at the bottom: returns the fraction of the
 *  height left for it and shifts the camera's centre into the middle of that band */
export const SAFE = { top: 118, bottom: 84 };
export function safeBand(camera, W, H, safe = SAFE) {
  const top = Math.min(safe.top, H * 0.2), bottom = Math.min(safe.bottom, H * 0.16);
  camera.setViewOffset(W, H, 0, -(top - bottom) / 2, W, H);
  return { frac: (H - top - bottom) / H, wfrac: (W - 24) / W };
}
/** camera distance that shows a w x h rectangle whole inside the safe band */
export function containDistance(camera, w, h, band, margin = 1.04) {
  const t = Math.tan(camera.fov * Math.PI / 360);
  return Math.max(h * margin / 2 / t / band.frac, w * margin / 2 / t / camera.aspect / band.wfrac);
}

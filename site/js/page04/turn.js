// Page 4's first move (Part 5 "Finish the site", stage 10): the one lock, in X-ray on the blue ground, turns side-on
// and gives way to the 2D cutaway (cutaway.js). It starts on the frame the security page's beat 5 joins onto (dive.js
// JOIN: the lock face on, centred, its face PAGE4_FACE of the screen's height through the site's lens, lock3d.js
// page4Distance); the dissolve there draws a copy of this lock, built the same way, so the seam is exact.
// (28 Nov: what is left of round 9's lockworld.js: its X-ray lock's flight, lattice, wave and fold are retired; the
// security page is dive.js's beats 1-5.)
import * as THREE from 'three';
import { loadLockParts, page4Distance, FACE } from '../page03/lock3d.js';
import { lensP } from '../page01/dive.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const BLUE = new THREE.Vector3(23 / 255, 63 / 255, 115 / 255);   // #173F73, the blue ground (as the join's)

export function createTurn(canvas, { base = '' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.autoClear = false;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 1e4);   // (the same near and far as the join's camera)
  const scene = new THREE.Scene();
  // the blue ground, exactly #173F73 (written straight to the canvas, as the join's dissolve)
  const bgScene = new THREE.Scene(), bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { uC: { value: BLUE } }, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.0); }' }));
  bg.frustumCulled = false; bgScene.add(bg);
  let W = 1, H = 1, P = 1, D = 1, lock = null, ready = null, turnTarget = null;

  const load = () => ready || (ready = (async () => {
    const parts = await loadLockParts(base); if (!parts) return false;
    lock = parts.build({ inside: true });
    lock.solids.forEach((m) => { m.visible = false; });
    lock.lineMats.forEach((m) => { m.depthTest = false; });
    lock.xray(1); lock.setKey(0); lock.setFaceHeight(FACE.h);   // (lock mm; the keyway empty: the wrong key goes in next)
    scene.add(lock.root);
    layout(W, H);
    try { await renderer.compileAsync(scene, camera); } catch (e) {}
    return true;
  })());

  /** the site's lens and page 4's first frame */
  function layout(w, h) {
    W = w; H = h;
    P = lensP(W, H);
    renderer.setSize(W, H, false);
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.updateProjectionMatrix();
    D = page4Distance(H, P);
    lock?.setResolution(Math.round(W * dpr), Math.round(H * dpr), Math.max(1, Math.round(dpr)));
  }

  /** t: screens of scroll into page 4. The lock turns side-on (its face to the right, where the cutaway's key goes in)
   *  while the camera moves so it lands on the cutaway's housing (its middle and its length), and fades as the cutaway
   *  draws in */
  function render(t) {
    const e = ease(span(t, 0, 0.7)), tg = turnTarget;
    let cx = 0, cy = 0, cz = D;
    // side-on, its face on the right, its middle 40 mm behind the face
    if (tg) { const Dt = 1.12 * 80 * P / tg.w; cz = lerp(D, Dt, e); cx = lerp(0, -40 * e - (tg.x - W / 2) * Dt / P, e); cy = lerp(0, (tg.y - H / 2) * Dt / P, e); }
    camera.position.set(cx, cy, cz); camera.rotation.set(0, 0, 0); camera.updateMatrixWorld();
    renderer.clear(); renderer.render(bgScene, camera);
    if (!lock) return { t, ready: false };
    lock.root.rotation.y = (Math.PI / 2) * e;
    const a = 1 - span(t, 0.45, 0.8);
    lock.setOpacity(a);
    if (a > 0.002) renderer.render(scene, camera);
    return { t, ready: true, lockBox: a > 0.05 ? screenBox() : null };
  }
  const v = new THREE.Vector3();
  /** the lock's housing on the screen (for the checks) */
  function screenBox() {
    if (!lock) return null;
    const bx = new THREE.Box3().setFromObject(lock.groups.housing), xs = [], ys = [];
    for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) {
      v.set(x, y, z).applyMatrix4(camera.matrixWorldInverse); if (-v.z < camera.near) return null;
      v.set(x, y, z).project(camera); xs.push((v.x + 1) / 2 * W); ys.push((1 - v.y) / 2 * H);
    }
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  return { setTurnTarget: (t) => { turnTarget = t; }, load, layout, render, screenBox, renderer, camera, frame: () => ({ P, D }) };
}

// Page 3, into the lock (Part 5 "Finish the site", stage 9: the security showpiece, scrubbed by scroll). One WebGL scene:
//   1. the shut door's lock fills the screen, its body gone see-through (X-ray hairlines on the blue ground: the hallway
//      ends on this exact frame, dive.js XRAY; same lens, same lock lines, same framing: lock3d.js endFaceHeight)
//   2. we go in through the keyhole, along the keyway, the pins passing overhead
//   3. we come out and pull back: the lock has multiplied, one on every crossing point of a grid running in every
//      direction (a feeling of Interstellar's tesseract, never a copy of it)
//   4. they unlock in a wave (the plugs turn, from ours outwards)
//   5. they fold back into one lock, locked again, which carries on into page 4
// The same real lock throughout ("Cutaway Lock", zbzzn, CC BY 4.0). The lattice is ONE light geometry of the real lock
// (its simplified edges, lock3d.js latticeSegments) drawn hundreds of times in one instanced draw call (60 fps on the S23),
// not hundreds of models. Ours is drawn whole, every part, as the hallway drew it.
import * as THREE from 'three';
import { loadLockParts, latticeSegments, endFaceHeight, FACE } from './lock3d.js';
import { lensP } from '../page01/dive.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- the timeline, in screens of scroll ----------
export const LEN = 4.6;
export const BEATS = { hold: [0, 0.15], keyhole: [0.15, 1.3], turn: [1.3, 1.55], pull: [1.55, 2.8], lattice: [1.75, 2.5], wave: [2.8, 3.8], fold: [3.8, 4.55],
  lineA: [1.95, 3.0], lineB: [3.2, 4.4] };
const SP = 230;                    // the lattice's cell (mm): a lock on every crossing point
const N = { x: 3, y: 3, z0: -4, z1: 0 };
const KEY_Y = -FACE.cy - 6;        // the keyway, under the plug's axis (the pins hang above it)
const BLUE = new THREE.Vector3(23 / 255, 63 / 255, 115 / 255);

export function createLockWorld(canvas, { base = '', reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.autoClear = false;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.3, 1e5);
  const scene = new THREE.Scene();
  // the blue ground, exactly #173F73 (written straight to the canvas, as the hallway's X-ray pass)
  const bgScene = new THREE.Scene(), bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { uC: { value: BLUE } }, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.0); }' }));
  bg.frustumCulled = false; bgScene.add(bg);
  let W = 1, H = 1, P = 1, D0 = 1, Dfar = 1, Dend = 1, lock = null, lattice = null, parts = null, ready = null, lastS = 0, white = '#FFFFFF';

  // ---------- the lattice: one geometry (the lock's light edges), one instanced draw ----------
  /** the crossing points: nx columns either side, ny rows above and below (as wide as the screen's shape asks), five deep */
  function setOffsets(g, nx, ny) {
    const offs = [], phase = []; let rMax = 0;
    for (let x = -nx; x <= nx; x++) for (let y = -ny; y <= ny; y++) for (let z = N.z0; z <= N.z1; z++) {
      if (!x && !y && !z) continue;   // ours is drawn whole
      offs.push(x * SP, y * SP, z * SP); const r = Math.hypot(x, y, z); phase.push(r); rMax = Math.max(rMax, r);
    }
    g.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offs), 3));
    g.setAttribute('phase', new THREE.InstancedBufferAttribute(new Float32Array(phase.map((r) => r / rMax)), 1));
    g.instanceCount = offs.length / 3; g.userData.n = [nx, ny];
  }
  function buildLattice(lp) {
    const segs = latticeSegments(lp), n = segs.length / 7;
    const pos = new Float32Array(n * 6), part = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { pos.set(segs.slice(i * 7, i * 7 + 6), i * 6); part[i * 2] = part[i * 2 + 1] = segs[i * 7 + 6]; }
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('part', new THREE.BufferAttribute(part, 1));
    setOffsets(g, N.x, N.y);
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { uWave: { value: 0 }, uFold: { value: 0 }, uRelock: { value: 0 }, uOpacity: { value: 0 }, uNear: { value: 1 }, uFar: { value: 1 }, uColor: { value: new THREE.Vector3(1, 1, 1) }, uAxis: { value: -FACE.cy } },
      vertexShader: `in float part; in vec3 offset; in float phase;
        uniform float uWave, uFold, uRelock, uOpacity, uNear, uFar, uAxis; out float vA;
        void main() {
          vec3 p = position;
          float w = clamp((uWave * 1.3 - phase) / 0.3, 0.0, 1.0); w = w * w * (3.0 - 2.0 * w);
          float a = 1.5707963 * w * (1.0 - uRelock);
          if (part > 0.5) { vec2 q = p.xy - vec2(0.0, uAxis); float c = cos(a), s = sin(a); p.xy = vec2(c * q.x - s * q.y, s * q.x + c * q.y) + vec2(0.0, uAxis); }
          float f = uFold * uFold * (3.0 - 2.0 * uFold);
          vec4 mv = modelViewMatrix * vec4(offset * (1.0 - f) + p, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = -mv.z;
          float k = clamp(1.0 - (d - uNear) / max(1.0, uFar - uNear), 0.0, 1.0);
          vA = uOpacity * 0.62 * k * k * (1.0 - smoothstep(0.15, 0.6, uFold));
        }`,
      fragmentShader: `uniform vec3 uColor; in float vA; out vec4 o; void main() { o = vec4(uColor, vA); }`,
    });
    const m = new THREE.LineSegments(g, mat); m.frustumCulled = false; scene.add(m);
    return { mesh: m, mat, geo: g, get count() { return g.instanceCount; }, segs: n };
  }

  const load = () => ready || (ready = (async () => {
    parts = await loadLockParts(base); if (!parts) return false;
    lock = parts.build({ inside: true });
    lock.solids.forEach((m) => { m.visible = false; });
    lock.lineMats.forEach((m) => { m.depthTest = false; });
    lock.xray(1); lock.setKey(0); lock.setFaceHeight(FACE.h);
    scene.add(lock.root);
    lattice = buildLattice(parts);
    layout(W, H, lastOpts);
    try { await renderer.compileAsync(scene, camera); } catch (e) {}
    return true;
  })());

  let lastOpts = {};
  /** the same lens and the same end framing as the hallway's last frame */
  function layout(w, h, opts = {}) {
    W = w; H = h; lastOpts = opts;
    const u = opts.u || 20;
    P = lensP(W, H);
    renderer.setSize(W, H, false);
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H;
    const faceH = endFaceHeight(H, { strip: opts.strip ?? 2 * u, tbTop: opts.tbTop ?? H, u });
    D0 = FACE.h * P / faceH;                                     // the hallway's last frame
    Dfar = 3.2 * SP * P / (Math.min(W, H) / 2);                    // the lattice: about seven locks across the narrower side
    Dend = FACE.h * P / (0.42 * H);                                // page 4 starts here: one lock, under half the screen
    camera.near = 0.3; camera.far = Dfar + SP * 12; camera.updateProjectionMatrix();
    lock?.setResolution(Math.round(W * dpr), Math.round(H * dpr), Math.max(1, Math.round(dpr)));
    if (lattice) { const m = Math.min(W, H), nx = Math.ceil(3 * W / m), ny = Math.ceil(3 * H / m); if (String(lattice.geo.userData.n) !== String([nx, ny])) setOffsets(lattice.geo, nx, ny);
      lattice.mat.uniforms.uNear.value = Dfar * 0.8; lattice.mat.uniforms.uFar.value = Dfar + SP * 6; }
  }

  /** the camera along the beats: (z, y) and where it looks */
  function cameraAt(s) {
    const B = BEATS;
    let z = D0, y = 0, pitch = 0;
    if (s <= B.keyhole[0]) { z = D0; }
    else if (s <= B.turn[0]) { const t = ease(span(s, ...B.keyhole)); z = lerp(D0, -54, t); y = lerp(0, KEY_Y, ease(span(s, B.keyhole[0], B.keyhole[0] + 0.55))); pitch = 0.22 * Math.sin(Math.PI * t); }
    else if (s <= B.pull[0]) { z = lerp(-54, -60, ease2(span(s, ...B.turn))); y = KEY_Y; }
    else if (s <= B.wave[0]) { const t = ease(span(s, ...B.pull)); z = lerp(-60, Dfar, t); y = lerp(KEY_Y, 0, ease(span(s, B.pull[0], B.pull[0] + 0.6))); }
    else if (s <= B.fold[0]) { z = lerp(Dfar, Dfar * 0.9, ease2(span(s, ...B.wave))); }
    else { z = lerp(Dfar * 0.9, Dend, ease(span(s, ...B.fold))); }
    return { z, y, pitch };
  }

  /** s: screens of scroll into the page (0 .. LEN) */
  function render(s) {
    lastS = s;
    const c = cameraAt(s);
    camera.position.set(0, c.y, c.z); camera.rotation.set(c.pitch, 0, 0); camera.updateMatrixWorld();
    renderer.clear(); renderer.render(bgScene, camera);
    if (!lock) return { s, ready: false };
    // ours: the plug turns with the wave (phase 0), turns back as it folds
    const wave = span(s, ...BEATS.wave), relock = ease2(span(s, BEATS.fold[0], BEATS.fold[0] + 0.5));
    lock.groups.plug.rotation.z = 0;
    const turn = (Math.PI / 2) * ease2(clamp(wave * 1.3 / 0.3)) * (1 - relock);
    lock.groups.plug.position.set(0, 0, 0);
    // the plug's axis is the lock's z axis at y = 0 (lock space): turning it in place
    lock.groups.plug.rotation.z = turn;
    lock.setOpacity(1);
    if (lattice) {
      const u = lattice.mat.uniforms;
      u.uOpacity.value = ease2(span(s, ...BEATS.lattice)); u.uWave.value = wave; u.uFold.value = span(s, ...BEATS.fold); u.uRelock.value = relock;
      lattice.mesh.visible = u.uOpacity.value > 0.002 && u.uFold.value < 0.999;
    }
    renderer.render(scene, camera);
    return { s, ready: true, cam: c, lockBox: screenBox() };
  }
  const v = new THREE.Vector3();
  function screenBox() {
    if (!lock) return null;
    const bx = new THREE.Box3().setFromObject(lock.groups.housing), xs = [], ys = [];
    for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) {
      v.set(x, y, z).applyMatrix4(camera.matrixWorldInverse); if (-v.z < camera.near) return null;
      v.set(x, y, z).project(camera); xs.push((v.x + 1) / 2 * W); ys.push((1 - v.y) / 2 * H);
    }
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  return { load, layout, render, screenBox, renderer, camera, stats: () => ({ instances: lattice?.count, segmentsPerLock: lattice?.segs, drawCalls: renderer.info.render.calls }), last: () => lastS };
}

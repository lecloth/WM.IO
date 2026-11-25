// Page 2: the hallway (Part 5 "Round 4 picks" ... "Round 8", then "Finish the site", stage 8b). Round 8b:
// - The way in: A (the grid folds into the hallway, scrubbed), and the hallway dresses up as you walk (round 8).
// - Scrolling is walking: past the way in, the camera moves down the hallway whenever you scroll and only then (no
//   held stretches; to linger, you stop scrolling). It walks straight and never turns.
// - Each drawing hangs on its wall by a hinge at its near edge and swings out part way as you approach (40 degrees),
//   just far enough to read while you walk; then it swings back to the wall and fades before it nears the screen's
//   edge. It never floats in the middle of the corridor (its far edge stays two cells off the axis), never turns to
//   face you full on, and never fills the screen (at its closest while visible its sheet is at most half the screen's
//   height). One hairline frame each (the sheet's edge, in ink), on the wall's grid while it hangs flat. Every word in a
//   drawing is at least the type scale's smallest step on screen at the drawing's closest point (readability()).
// - Labels: on a frosted backing with softly rounded corners, as wide as the drawing, right under it, turning with it.
// - Canvas 2 is the property app's listing screen in its design layers (corridor-drawings.js LAYERS), which spread
//   apart as the frame swings out.
// - The end: a wall facing you, with a door in it. The door stays shut. Its lock (the real "Cutaway Lock", zbzzn, CC BY
//   4.0) sits in the door at eye level, its face to you, big enough to read as a lock from far off. The camera walks up
//   to it until it fills the screen; page 3 (into the lock) starts from that frame.
// - Frame 5: the real iPhone 18 and S26 (live 3D, git-ignored files) sit on the sheet and turn as you walk past.
// The hallway keeps round 6's grid: its walls, floor and ceiling carry the screen's grid continued from the mouth.
// One true perspective; the lens is 50 degrees across the narrower side, at most 66 across.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { FRAMES, PHONE_PAIR, OPENING, dimParts, LAYERS, layerPlaces, layerItems, paintLayer, MOUNT, sizeLayers } from './corridor-drawings.js';
import { LOOKS, HALL } from './hall-looks.js';
import { grid } from '../engine/grid.js';
import { studio } from '../phones/studio.js';
import { loadLockParts, endFaceHeight } from '../page03/lock3d.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/** the lens: 50 degrees across the narrower side, at most 66 degrees across (the camera distance P of the screen plane) */
export const LENS = { narrow: 50, across: 66 };
export function lensP(W, H) {
  const t = (deg) => Math.tan(deg * Math.PI / 360);
  return Math.max(Math.min(W, H) / 2 / t(LENS.narrow), W / 2 / t(LENS.across));
}

// ---------- the timeline, in screens of scroll (q = screens / DIVE) ----------
export const DIVE = 4.9;
const S_ = (screens) => screens / DIVE;
export const WAY_IN = [S_(0.02), S_(0.32)];                      // the grid folds into the hallway
export const DRESS = [S_(0.1), S_(0.62)];                        // grid lines -> card, light and shadow
export const OPEN_AT = [S_(0.3), S_(1.0)];                       // the opening line (you walk on slowly under it)
const WALK = [0.32, 1.0, 4.05, DIVE];                            // the walk: speeds up, steady, slows to the lock
const CLOSE = [1.42, 2.0, 2.58, 3.16, 3.72];                     // each drawing's closest fully shown moment (screens)
const SPEED = 1.5;                                               // a screen of scroll walks 1.5 x P
const SWING = 40 * Math.PI / 180;                                // how far a drawing swings out from its wall
export const STOPS = CLOSE.map((c) => [S_(c - 0.2), S_(c)]);     // per drawing: [fully out, closest] (for the tests)
export const DOOR = { walk: [S_(3.9), 1], near: [S_(4.5), 1] };   // the walk up to the lock; it fills the screen at q = 1
const BLUE = '#173F73', WHITE = '#FFFFFF';
const ZS = 0.4;       // the sheet's offset from its panel (off the hinge)

// a label inside a drawing (mono, white) as a small texture on a plane, in drawing units (y down), at its baseline.
// Round 8: measurements in DM Mono Light (300). Round 8b: drawn at the size it reaches on screen (crisp, not minified)
const mctx = document.createElement('canvas').getContext('2d');
const fontOf = (l, px) => `${l.light ? 300 : 500} ${px}px "DM Mono", ui-monospace, monospace`;
/** a label's ink box in drawing units (x0, x1, top, bottom), measured on the font itself */
function inkBox(l) {
  mctx.font = fontOf(l, 100); if ('letterSpacing' in mctx) mctx.letterSpacing = '6px';
  const m = mctx.measureText(l.t || ' '), k = l.size / 100;
  const w = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) * k, adv = m.width * k;
  const x = l.anchor === 'middle' ? l.x - adv / 2 : l.anchor === 'end' ? l.x - adv : l.x;
  return { x0: x - m.actualBoundingBoxLeft * k, x1: x - m.actualBoundingBoxLeft * k + w, t: l.y - m.actualBoundingBoxAscent * k, b: l.y + m.actualBoundingBoxDescent * k, adv };
}
function drawLabel(c, l, fontPx, text) {
  const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  x.font = fontOf(l, fontPx); if ('letterSpacing' in x) x.letterSpacing = `${0.06 * fontPx}px`;
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  const tw = x.measureText(text).width;
  x.fillText(text, l.anchor === 'middle' ? (c.width - tw) / 2 : 4, fontPx * 1.05);
}
function labelMesh(l, fontPx, aniso, reserve = '') {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const t = l.t || ' ';
  x.font = fontOf(l, fontPx); if ('letterSpacing' in x) x.letterSpacing = `${0.06 * fontPx}px`;
  const tw = Math.ceil(Math.max(x.measureText(t).width, reserve ? x.measureText(reserve).width : 0)) + 8;
  c.width = tw; c.height = Math.ceil(fontPx * 1.4);
  drawLabel(c, l, fontPx, t);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = aniso;
  const s = l.size / fontPx, pw = c.width * s, ph = c.height * s;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
  const ax = l.anchor === 'middle' ? -pw / 2 + 0 : l.anchor === 'end' ? -(pw - 8 * s) : 0;
  const cx = l.anchor === 'middle' ? l.x : l.x + ax + pw / 2 - 4 * s;
  mesh.userData = { cx, cy: l.y - fontPx * 1.05 * s + ph / 2, at: l.at, faint: !!l.faint, l, canvas: c, fontPx, text: t };
  return mesh;
}
function canvasTex(w, h, draw, srgb = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
const pixel = (css, srgb) => { const t = canvasTex(1, 1, (x) => { x.fillStyle = css; x.fillRect(0, 0, 1, 1); }, srgb); t.flipY = false; return t; };
const flatNormal = () => pixel('#8080FF', false);
const aoTex = () => canvasTex(4, 256, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#6E6E6E'); g.addColorStop(0.07, '#D2D2D2'); g.addColorStop(0.16, '#FFFFFF'); g.addColorStop(0.84, '#FFFFFF'); g.addColorStop(0.93, '#D2D2D2'); g.addColorStop(1, '#6E6E6E');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
});
const blobTex = (rx = 0.27, ry = 0.38, r = 26, blur = 22) => canvasTex(256, 512, (x, w, h) => {
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.filter = `blur(${blur}px)`; x.fillStyle = '#fff';
  x.beginPath(); x.roundRect(w * (0.5 - rx), h * (0.5 - ry), w * 2 * rx, h * 2 * ry, r); x.fill();
});
async function fetchRetry(url, as = 'blob') {
  for (let n = 0; n < 5; n++) {
    try { const r = await fetch(n ? `${url}?r=${n}` : url); if (r.status === 404) return null; if (!r.ok) throw new Error(r.status); return await r[as](); }
    catch (e) { await new Promise((res) => setTimeout(res, 150 * (n + 1))); }
  }
  return null;
}
async function loadImage(url) {
  const b = await fetchRetry(url); if (!b) return null;
  try {
    if (self.createImageBitmap) return await createImageBitmap(b, { imageOrientation: 'flipY' });
    const img = new Image(); img.src = URL.createObjectURL(b); await img.decode(); img.flipped = false; return img;
  } catch (e) { return null; }
}
const idle = () => new Promise((r) => (self.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 60)));

/** CSS matrix3d taking the rect (0,0)-(w,h) onto the quad q (top left, top right, bottom right, bottom left) */
function quadMatrix(w, h, q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let a, b, c, d, e, f, g = 0, hh = 0;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) { a = x1 - x0; b = x3 - x0; c = x0; d = y1 - y0; e = y3 - y0; f = y0; }
  else {
    const den = dx1 * dy2 - dx2 * dy1; if (Math.abs(den) < 1e-12) return null;
    g = (dx3 * dy2 - dx2 * dy3) / den; hh = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1; b = x3 - x0 + hh * x3; c = x0; d = y1 - y0 + g * y1; e = y3 - y0 + hh * y3; f = y0;
  }
  const n = (v) => +v.toFixed(8);
  return `matrix3d(${n(a / w)},${n(d / w)},0,${n(g / w)},${n(b / h)},${n(e / h)},0,${n(hh / h)},0,0,1,0,${n(c)},${n(f)},0,1)`;
}

/** the distance from a segment {x1, y1, x2, y2} to a convex quad [[x, y] x 4] (0 if they meet) */
export function quadSegDist(q, s) {
  const inQ = (x, y) => { let pos = 0, neg = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4], c = (n[0] - p[0]) * (y - p[1]) - (n[1] - p[1]) * (x - p[0]); if (c > 0) pos++; else if (c < 0) neg++; } return !(pos && neg); };
  if (inQ(s.x1, s.y1) || inQ(s.x2, s.y2)) return 0;
  const cross = (ax, ay, bx, by, cx, cy, dx, dy) => { const d1 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax), d2 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax), d3 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx), d4 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx); return d1 * d2 < 0 && d3 * d4 < 0; };
  const ps = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; let k = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0; k = Math.max(0, Math.min(1, k)); return Math.hypot(px - ax - k * dx, py - ay - k * dy); };
  let d = Infinity;
  for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4];
    if (cross(s.x1, s.y1, s.x2, s.y2, a[0], a[1], b[0], b[1])) return 0;
    d = Math.min(d, ps(s.x1, s.y1, a[0], a[1], b[0], b[1]), ps(s.x2, s.y2, a[0], a[1], b[0], b[1]), ps(a[0], a[1], s.x1, s.y1, s.x2, s.y2)); }
  return d;
}

/** a frame's label (round 8): on a frosted backing (CSS), the title (big, serif), the drawing's name (mono), one line of
 *  story (a draft, flagged) */
export const labelHTML = (f) => `<div class="dive__lab"><p class="dive__lab-t display gt">${f.caption}</p><p class="dive__lab-k mono gt gt-h">${f.fig}</p>` +
  `<p class="dive__lab-s gt gt-h"><span class="ph" data-draft>Draft</span>${f.story}</p></div>`;
export const openingHTML = () => `<div class="dive__open"><p class="dive__open-f ph mono gt gt-h">Draft</p><p class="dive__open-l display gt" data-draft>${OPENING.lead}</p><p class="dive__open-r gt gt-h" data-draft>${OPENING.rest}</p></div>`;

/** root: the paper behind the hallway; top: the hallway in WebGL, the opening line, the labels. */
export function createDive(root, top, { base = '' } = {}) {
  const LOOK = LOOKS[HALL];
  root.innerHTML = `<div class="dive__win"></div>`;
  top.innerHTML = `<canvas class="dive__gl"></canvas>${openingHTML()}<div class="dive__labs">${FRAMES.map(labelHTML).join('')}</div>`;
  root.dataset.look = top.dataset.look = LOOK.id;
  const canvas = top.querySelector('.dive__gl');
  const openEl = top.querySelector('.dive__open'), labEls = [...top.querySelectorAll('.dive__lab')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const ANISO = renderer.capabilities.getMaxAnisotropy();
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = LOOK.exposure;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  camera.rotation.order = 'YXZ';
  const phoneScene = new THREE.Scene();
  const lineMats = [];
  const lmat = (o) => { const m = new LineMaterial({ linewidth: Math.max(1, Math.round(dpr)), worldUnits: false, transparent: true, toneMapped: false, ...o }); lineMats.push(m); return m; };
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr.length ? arr : [0, 0, 0, 0, 0, 0]); return g; };

  // ---------- the surfaces: walls, floor and ceiling. Each twice: the flat grid (the page's own paper and lines, unlit,
  // exact: "grid lines first") under the white card with its grid, lit, which fades in as the hallway dresses ----------
  const ao = aoTex();
  const aoRot = (() => { const t = ao.clone(); t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t; })();
  const cardTex = canvasTex(1024, 1024, () => {}, true);
  cardTex.wrapS = cardTex.wrapT = THREE.RepeatWrapping; cardTex.anisotropy = ANISO; cardTex.minFilter = THREE.LinearMipmapLinearFilter;
  const nrm = flatNormal(); nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
  const spec = LOOK.walls;
  const cardMat = new THREE.MeshStandardMaterial({ map: cardTex, normalMap: nrm, normalScale: new THREE.Vector2(spec.normal, spec.normal), roughness: spec.rough, metalness: 0, aoMap: ao, aoMapIntensity: 0.55, envMapIntensity: spec.env, transparent: true });
  const endTex = canvasTex(64, 64, () => {}, true); endTex.wrapS = endTex.wrapT = THREE.RepeatWrapping; endTex.minFilter = THREE.LinearMipmapLinearFilter; endTex.anisotropy = 8;
  const planes = [0, 1, 2, 3].map((side) => {
    const m = cardMat.clone(); m.map = cardTex.clone(); m.normalMap = nrm.clone();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
    mesh.receiveShadow = side !== 3; mesh.castShadow = side < 2 && LOOK.wallsCast; mesh.userData = { side }; mesh.renderOrder = -1;
    scene.add(mesh); return mesh;
  });
  const flats = [0, 1, 2, 3].map((side) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: endTex.clone(), toneMapped: false, depthWrite: false }));
    mesh.userData = { side }; mesh.renderOrder = -2; scene.add(mesh); return mesh;
  });
  // the end wall (the page's paper and grid), with the doorway cut out
  const endMat = new THREE.MeshBasicMaterial({ map: endTex, toneMapped: false });
  const endWall = new THREE.Mesh(new THREE.BufferGeometry(), endMat); endWall.renderOrder = -1; scene.add(endWall);
  let surfImgs = {};
  async function loadSurfaces(b = base) {
    const [c, n] = await Promise.all([loadImage(`${b}media/materials/${spec.tex}/color.webp`), loadImage(`${b}media/materials/${spec.tex}/normal.webp`)]);
    surfImgs = { c, n }; painted = ''; paintSurfaces();
  }
  let painted = '';
  function paintSurfaces() {
    const tag = `${dark}|${!!surfImgs.c}|${gu}|${dpr}|${paper}`; if (tag === painted) return; painted = tag;
    { const c = cardTex.image, x = c.getContext('2d'), w = c.width, cell = w / 5, px = cell / (gu || 20);
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none'; x.fillStyle = spec.base[dark ? 1 : 0]; x.fillRect(0, 0, w, w);
      if (surfImgs.c) { x.filter = 'grayscale(1)'; x.globalCompositeOperation = dark ? 'overlay' : 'multiply'; x.globalAlpha = dark ? 0.12 : 1; x.drawImage(surfImgs.c, 0, 0, w, w); x.filter = 'none'; }
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      const ln = dark ? '237,238,240' : '18,18,18';
      for (let k = 0; k < 5; k++) { const major = k === 0; x.fillStyle = `rgba(${ln},${major ? (dark ? 0.16 : 0.13) : (dark ? 0.07 : 0.055)})`; const t = Math.max(1, px * (major ? 1.1 : 0.8)); x.fillRect(0, k * cell, w, t); x.fillRect(k * cell, 0, t, w); }
    }
    { const T = Math.max(16, Math.round(5 * (gu || 20) * dpr)), c = endTex.image; c.width = c.height = T; const x = c.getContext('2d');
      x.fillStyle = paper; x.fillRect(0, 0, T, T);
      const ln = dark ? '237,238,240' : '18,18,18', cell = T / 5;
      for (let k = 0; k < 5; k++) { x.fillStyle = `rgba(${ln},${k === 0 ? 0.1 : 0.05})`; const p = Math.round(k * cell); x.fillRect(0, p, T, 1); x.fillRect(p, 0, 1, T); }
      endTex.needsUpdate = true; }
    planes.forEach((m) => {
      m.material.map.image = cardTex.image; m.material.map.needsUpdate = true;
      if (surfImgs.n) { m.material.normalMap.image = surfImgs.n; m.material.normalMap.flipY = false; m.material.normalMap.needsUpdate = true; }
    });
    flats.forEach((m) => { m.material.map.image = endTex.image; m.material.map.needsUpdate = true; });
  }

  // the static hairlines: the hallway's edges, the doorway and the shut door (world space; cut round every label on screen)
  const edgeMat = lmat({ opacity: LOOK.edges });
  const edges = new LineSegments2(segGeo([]), edgeMat); edges.renderOrder = 1; scene.add(edges);
  let staticBase = [];
  let knockKey = '';

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); key.castShadow = true; scene.add(key); scene.add(key.target);
  key.shadow.camera.up.set(0, 0, -1); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6; key.shadow.radius = LOOK.key.radius;
  const keyDir = new THREE.Vector3(...LOOK.key.dir).normalize();

  // ---------- the door: shut in the end wall, its lock at eye level on the walking line ----------
  const door = { group: new THREE.Group(), leaf: null, lock: new THREE.Group(), lockState: 'idle', Wd: 1, Hd: 1, x0: 0, alpha: 0, hL: 1, zFace: 0 };
  scene.add(door.group);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0, envMapIntensity: 0.35, transparent: true, side: THREE.DoubleSide });
  door.leaf = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), leafMat); door.leaf.receiveShadow = true; door.group.add(door.leaf);
  door.group.add(door.lock);
  let lockParts = null;
  /** the real "Cutaway Lock" (lock3d.js: the same parts, look and size rule as page 3 uses, so page 3 starts on this
   *  exact frame). In the door its face is to you, the body inside the door (hidden by the leaf). */
  async function loadLock(b = base) {
    if (door.lockState !== 'idle') return; door.lockState = 'loading';
    try {
      lockParts = await loadLockParts(b);
      if (!lockParts) { door.lockState = 'missing'; return; }
      const obj = lockParts.build({ inside: false });
      obj.lineMats.forEach((m) => { m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)); m.linewidth = Math.max(1, Math.round(dpr)); lineMats.push(m); });
      door.lockObj = obj; door.lock.add(obj.root);
      placeLock(); colours();
      try { await renderer.compileAsync(scene, camera); } catch (e) { try { renderer.compile(scene, camera); } catch (e2) {} }
      door.lockState = 'ready'; render(lastQ, true);
    } catch (e) { console.warn('[dive] lock', e); door.lockState = 'missing'; }
  }
  function placeLock() {
    const o = door.lockObj; if (!o) return;
    o.setFaceHeight(door.hL);
    // the face a hair proud of the leaf, the body behind it, inside the door; at eye level on the walking line
    door.lock.position.set(-door.group.position.x, -door.group.position.y, 0.9);
  }

  // ---------- the drawings: a blueprint sheet each, one hairline frame, on a hinge ----------
  const blobMap = blobTex();
  const frames = FRAMES.map((F, i) => {
    const d = F.draw;
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = F.side === 'l';
    const mats = [];
    const own = (m, b = 1) => { m.transparent = true; m.userData.base = b; mats.push(m); return m; };
    const sheetMat = own(new THREE.MeshBasicMaterial({ toneMapped: false }));
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sheetMat); sheet.position.z = ZS; sheet.renderOrder = 1; panel.add(sheet);   // under its lines and words, whatever the sort
    const frameMat = lmat({ opacity: 1 });
    const frame = new LineSegments2(segGeo([]), frameMat); frame.renderOrder = 2; panel.add(frame);
    const drawMat = lmat({ opacity: 1 });
    const drawing = new LineSegments2(segGeo([]), drawMat); drawing.geometry.instanceCount = 0; drawing.renderOrder = 3; panel.add(drawing);
    const dimMat = lmat({ opacity: 1 });
    const dims = new LineSegments2(segGeo([]), dimMat); dims.visible = false; dims.renderOrder = 3; panel.add(dims);
    let still = null, blobs = null, layers = null;
    if (F.real && d.region) {
      const sm = own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      still = new THREE.Mesh(new THREE.PlaneGeometry(d.region.w, d.region.h), sm); still.visible = false; still.renderOrder = 3; panel.add(still);
      blobs = PHONE_PAIR.phones.map(() => { const m = own(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blobMap, depthWrite: false, toneMapped: false }), 0.26); const b = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); b.renderOrder = 4; b.visible = false; panel.add(b); return b; });
    }
    if (d.layers) {
      layers = LAYERS.list.map((l, li) => {
        const c = document.createElement('canvas'); c.width = 4; c.height = 4;
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = ANISO; tex.minFilter = THREE.LinearMipmapLinearFilter;
        const m = own(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(LAYERS.LW, LAYERS.LH), m); mesh.renderOrder = 4 + li; panel.add(mesh);
        return { mesh, canvas: c, tex, k: 0 };
      });
    }
    return { F, d, i, left, MW: 1, MH: 1, mgx: 0, mgy: 0, k: 1, pivot, panel, sheet, frame, drawing, dims, dimSegs: [], dimAt: Infinity, labels: [], still, blobs, layers, stillOK: false, real: 0, drawMat, dimMat, frameMat, mats, spread: 0 };
  });
  const U = (f, u) => -f.MW / 2 + f.mgx + u, V = (f, v) => f.MH / 2 - f.mgy - v;
  /** the sheet at its size (drawing units): the drawing's segments, its frame and the still on it */
  function buildSheet(f) {
    f.sheet.scale.set(f.MW, f.MH, 1);
    const pos = new Float32Array(f.d.segs.length * 6);
    f.d.segs.forEach(([a, b, c, e], k) => pos.set([U(f, a), V(f, b), ZS + 0.2, U(f, c), V(f, e), ZS + 0.2], k * 6));
    const n = f.drawing.geometry.instanceCount; f.drawing.geometry.dispose(); f.drawing.geometry = segGeo(pos); f.drawing.geometry.instanceCount = n;
    const x0 = -f.MW / 2, x1 = f.MW / 2, y0 = -f.MH / 2, y1 = f.MH / 2, z = ZS + 0.25;
    f.frameSegs = [x0, y0, z, x1, y0, z, x1, y0, z, x1, y1, z, x1, y1, z, x0, y1, z, x0, y1, z, x0, y0, z];
    f.frame.geometry.dispose(); f.frame.geometry = segGeo(f.frameSegs);
    if (f.still) { const rg = f.d.region; f.still.position.set(U(f, rg.u + rg.w / 2), V(f, rg.v + rg.h / 2), ZS + 0.25); }
  }
  const f5 = frames.find((f) => f.still), fL = frames.find((f) => f.layers);

  // ---------- frame 5: the real phones, live (loaded when the dive begins) ----------
  const phones = { state: 'idle', list: [], root: new THREE.Group(), mix: 0, yaw: 0, mats: [] };
  phones.root.matrixAutoUpdate = false; phones.root.visible = false; phoneScene.add(phones.root);
  let phonesP = null;
  function loadPhones(b = base) {
    if (phonesP || reduced || !f5) return phonesP || Promise.resolve(phones.state);
    phones.state = 'loading';
    phonesP = (async () => {
      try {
        const mark = (n) => { try { performance.mark(`phones:${n}`); } catch (e) {} };
        mark('start');
        const R = await import('../phones/realphones.js'); mark('code');
        R.offThread?.();
        const list = await Promise.all(['iphone18', 's26'].map((k) => R.loadPhone(k, { base: b })));
        mark('parsed');
        if (list.some((p) => p.missing)) { phones.state = 'missing'; return phones.state; }
        const app = R.appTexture();
        list.forEach((p, k) => {
          p.obj.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.transparent = true; m.material.userData.base = m.material.opacity; phones.mats.push(m.material); } });
          R.setScreen(p, app);
          if (p.screen) { p.screen.material.transparent = true; p.screen.material.userData.base = 1; phones.mats.push(p.screen.material); }
          const pv = new THREE.Group(); pv.add(p.obj); phones.root.add(pv);
          phones.list.push({ ...p, pivot: pv, spec: PHONE_PAIR.phones[k] });
        });
        await envP;
        const texs = new Set(); phones.root.traverse((m) => { if (m.isMesh) ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'clearcoatNormalMap'].forEach((k) => m.material[k] && texs.add(m.material[k])); });
        for (const t of texs) { renderer.initTexture(t); await new Promise((r) => requestAnimationFrame(r)); }
        mark('textures');
        phones.root.visible = true;
        try { await renderer.compileAsync(phoneScene, camera); } catch (e) { try { renderer.compile(phoneScene, camera); } catch (e2) {} }
        phones.root.visible = false; mark('compiled');
        placePhones();
        phones.state = 'ready';
        phones.warm = true; idleWarm();
        if (f5.real > 0.001) liveTo(1); else phones.mix = 1;
        render(lastQ, true);
      } catch (e) { console.warn('[dive] phones', e); phones.state = 'missing'; }
      return phones.state;
    })();
    return phonesP;
  }
  // the phones lie on frame 5's sheet (its units are millimetres), each over its own blueprint outline
  function placePhones() {
    if (!f5 || !phones.list.length) return;
    const R = PHONE_PAIR.region, m = f5.d.region;
    phones.list.forEach((p) => {
      const sp = p.spec, cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2;
      const u = U(f5, m.u + (cx - R.x0)), v = V(f5, m.v + (R.y1 - cy));
      p.pivot.position.set(u, v, ZS + 6); p.pivot.scale.setScalar(1);
      p.home = { u, v };
    });
  }
  let lastScrollRender = 0, warmT = 0;
  function idleWarm(force) {
    clearTimeout(warmT);
    if (!phones.warm) return;
    if (!force && performance.now() - lastScrollRender < 220) { warmT = setTimeout(idleWarm, 120); return; }
    phones.warmNow = true; render(lastQ, true); phones.warmNow = false; phones.warm = false;
    try { performance.mark('phones:warmed'); } catch (e) {}
  }
  // the phones' first appearance after they finish loading mid-frame: a short cross-fade from the still (a loading
  // event, not a scroll beat)
  let liveRaf = 0;
  function liveTo(t) {
    cancelAnimationFrame(liveRaf); const from = phones.mix, t0 = performance.now();
    const step = () => { const u = clamp((performance.now() - t0) / 420); phones.mix = lerp(from, t, ease2(u)); render(lastQ, true); if (u < 1) liveRaf = requestAnimationFrame(step); };
    liveRaf = requestAnimationFrame(step);
  }
  // the turn, scrubbed as you walk past: front -> back (held) -> front-on
  const turnAt = (u) => { const K = [[0, 0], [0.4, Math.PI], [0.6, Math.PI], [1, 2 * Math.PI]]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(u, K[i - 1][0], K[i][0]))); return 2 * Math.PI; };

  let loaded = null, envP = null;
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await Promise.all([document.fonts.load('500 56px "DM Mono"'), document.fonts.load('300 56px "DM Mono"'), document.fonts.load('420 56px Newsreader')]); } catch (e) {}
    rebuildLabels();
    envP = studio(renderer, b).then((e) => { scene.environment = e; phoneScene.environment = e; colours(); }).catch(() => {});
    const jobs = [loadSurfaces(b), envP];
    if (f5) jobs.push((async () => {
      const img = await loadImage(`${b}${f5.F.real}`);
      if (img) { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; t.flipY = img.flipped === false; t.needsUpdate = true; f5.still.material.map = t; f5.still.material.needsUpdate = true; renderer.initTexture(t); f5.stillOK = true; }
    })());
    await Promise.all(jobs);
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    loadLock(b);
    return true;
  })());

  /** the drawings' own labels and dimension lines (round 8: the live measurement on the line); canvas 2's layers */
  function rebuildLabels() {
    frames.forEach((f, i) => {
      const l0 = lay?.[i], kMax = l0 ? l0.kMax : 1, uu = gu || 20;
      // unchanged since the last build (a relayout that moved nothing): keep the textures already on the GPU
      const key = `${kMax.toFixed(4)}|${f.MW.toFixed(3)}|${f.MH.toFixed(3)}|${uu}|${dpr}|${l0 ? l0.kMid.toFixed(4) : ''}`;
      if (f.labelKey === key && (!f.layers || f.layers.every((L_) => L_.dark === dark && L_.k))) return;
      f.labelKey = key;
      f.labels.forEach((m) => { f.panel.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
      const fpx = (size) => clamp(Math.ceil(size * kMax * dpr * 1.2), 20, 160);
      const ls = f.d.labels.filter((l) => l.t);
      const segs = [], segsD = []; f.dimAt = Infinity;
      (f.d.dims || []).forEach((dm) => {
        const L0 = { t: '000.0 PX', x: 0, y: 0, size: dm.size, anchor: 'middle', light: true };
        const box = inkBox(L0), clear = l0 ? (uu / 2 + 2) / l0.kMid * 1.3 : dm.size;
        const parts = dimParts(dm, box.x1 - box.x0, clear);
        parts.segs.forEach(([a, b, c, e]) => { segs.push(U(f, a), V(f, b), ZS + 0.2, U(f, c), V(f, e), ZS + 0.2); segsD.push([a, b, c, e]); });
        ls.push({ t: '000.0 PX', x: parts.label.x, y: parts.label.y + (parts.label.inline ? (box.b - box.t) / 2 - box.b : 0), size: dm.size, anchor: 'middle', at: dm.at, faint: true, light: true, dim: dm });
        f.dimAt = Math.min(f.dimAt, dm.at);
      });
      f.dimSegs = segs; f.dimSegsD = segsD; f.dims.geometry.dispose(); f.dims.geometry = segGeo(segs);
      f.labels = ls.map((l) => { const m = labelMesh(l, fpx(l.size), ANISO, l.dim ? '0000.0 PX' : ''); m.position.set(U(f, m.userData.cx), V(f, m.userData.cy), ZS + 0.3); m.renderOrder = 4; m.visible = false; f.panel.add(m); return m; });
      if (loaded) f.labels.forEach((m) => { try { renderer.initTexture(m.material.map); } catch (e) {} });   // uploaded now, not on first sight mid-walk
      if (f.layers && l0) {
        const k = clamp(kMax * dpr * 1.15, 1, 2048 / LAYERS.LW);
        f.layers.forEach((L, li) => {
          if (Math.abs(L.k - k) < 1e-3 && L.dark === dark) return;
          L.k = k; L.dark = dark; L.canvas.width = Math.round(LAYERS.LW * k); L.canvas.height = Math.round(LAYERS.LH * k);
          paintLayer(L.canvas.getContext('2d'), li, k, { paper, ink, graphite });
          L.tex.dispose(); L.tex.needsUpdate = true;
          if (loaded) try { renderer.initTexture(L.tex); } catch (e) {}
        });
      }
    });
    colours();
  }
  /** the live measurement (round 7: the length a dimension line has on the visitor's screen, now, as they walk) */
  function measure(f) {
    f.labels.forEach((m) => {
      const dm = m.userData.l.dim; if (!dm || !m.visible) return;
      const A = P3(f, U(f, dm.x1), V(f, dm.y)), B = P3(f, U(f, dm.x2), V(f, dm.y));
      const t = `${Math.hypot(B[0] - A[0], B[1] - A[1]).toFixed(1)} PX`;
      if (t === m.userData.text) return;
      m.userData.text = t; m.userData.l = { ...m.userData.l, t };
      drawLabel(m.userData.canvas, m.userData.l, m.userData.fontPx, t); m.material.map.needsUpdate = true;
    });
  }

  let W = 1, H = 1, P = 1, L = 1, V0 = 1, ink = '#121212', paper = '#F6F7F9', graphite = '#66696E', dark = false, gu = 20;
  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.setStyle('#888'); } return c; };
  const th = (pair) => (Array.isArray(pair) ? pair[dark ? 1 : 0] : pair);
  function colours() {
    planes.forEach((m) => m.material.color.copy(col(th(spec.color))));
    edgeMat.color.copy(col(ink));
    leafMat.color.copy(col(th(spec.base)));
    door.lockObj?.colours({ ink, base: th(spec.base), dark });
    hemi.color.copy(col(th(LOOK.hemi.sky))); hemi.groundColor.copy(col(th(LOOK.hemi.ground))); hemi.intensity = th(LOOK.hemi.i);
    key.color.copy(col(LOOK.key.color)); key.intensity = th(LOOK.key.i);
    scene.environmentIntensity = th(LOOK.env);
    frames.forEach((f) => {
      f.sheet.material.color.copy(col(BLUE)).lerp(col(dark ? '#1B1C1D' : '#F4F5F7'), f.real);
      f.drawMat.color.copy(col(WHITE)); f.dimMat.color.copy(col(WHITE)); f.frameMat.color.copy(col(ink));
      f.labels.forEach((m) => { m.material.color.copy(col(WHITE)); m.userData.alpha = m.userData.faint ? 0.62 : 1; });
    });
    paintSurfaces();
  }
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    const wasDark = dark;
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F6F7F9'; graphite = cs.getPropertyValue('--graphite').trim() || '#66696E';
    if (wasDark !== dark && fL) fL.layers.forEach((Lr) => { Lr.k = 0; });
    colours();
  }

  // ---------- layout ----------
  // the walk: camera distance t walked by each scroll position (screens), from a speed profile (never zero past the
  // way in: scrolling is walking)
  let walkTab = null;
  function buildWalk() {
    const n = 2000, ds = DIVE / n, tab = new Float64Array(n + 1); let t = 0;
    const speed = (s) => {
      if (s < WALK[0]) return 0;
      if (s < WALK[1]) return V0 * lerp(0.3, 1, ease2(span(s, WALK[0], WALK[1])));
      if (s < WALK[2]) return V0;
      return V0 * lerp(1, 0.12, ease2(span(s, WALK[2], WALK[3])));
    };
    for (let k = 1; k <= n; k++) { t += speed((k - 0.5) * ds) * ds; tab[k] = t; }
    walkTab = tab;
  }
  const walkAt = (s) => { if (!walkTab) return 0; const n = walkTab.length - 1, x = clamp(s / DIVE) * n, i = Math.min(n - 1, Math.floor(x)); return lerp(walkTab[i], walkTab[i + 1], x - i); };

  let lay = null, tEnd = 0;
  /** opts: u (the cell), strip (its height), noTitleblock */
  function layout(w, h, opts = {}) {
    W = w; H = h;
    const u = opts.u || grid.u; gu = u;
    P = lensP(W, H); V0 = SPEED * P;
    buildWalk();
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    // the canvas exactly as large as its drawing buffer in device pixels (a resampled buffer shimmers)
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    lineMats.forEach((m) => { m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)); m.linewidth = Math.max(1, Math.round(dpr)); });
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = Math.max(0.5, P * 0.01);
    const desktop = W >= 1024, N = Math.round(W / u);
    const strip = opts.strip ?? (document.getElementById('strip')?.offsetHeight || 2 * u);
    const tb = document.querySelector('.titleblock'), tbr = !opts.noTitleblock && tb?.getClientRects().length ? tb.getBoundingClientRect() : null;
    const tbTop = tbr && tbr.height ? Math.min(H, tbr.top) : Math.floor(H / u) * u;
    const rT = Math.ceil((strip + u) / u - 1e-6), rB = Math.floor((tbTop - u) / u + 1e-6), rows = rB - rT;   // a cell under the strip, a cell over the title block
    // the opening line: its box as wide as its words need (whole cells), so its backing always holds them (round 8b fix)
    openEl.style.left = `${(desktop ? 5 : 1) * u}px`; openEl.style.top = `${(rT + (desktop ? 3 : 1)) * u}px`;
    { const maxC = desktop ? N - 10 : N - 2, lead = openEl.querySelector('.dive__open-l');
      openEl.classList.remove('is-wrap'); openEl.style.width = 'max-content';
      const need = Math.ceil((lead.getBoundingClientRect().width + 1) / u);
      const wrap = need > maxC; openEl.classList.toggle('is-wrap', wrap);
      openEl.style.width = `${Math.max(desktop ? 20 : 0, Math.min(maxC, wrap ? maxC : need)) * u}px`; }
    // each drawing: hinged at its near edge, its far edge three quarters of a cell off the axis when out; at its closest
    // fully shown moment its hinge at least 0.6 cell inside the screen's side and the whole panel (sheet, a cell, the
    // label) inside the band between the strip and the title block; its sheet at most half the screen's height while
    // it is visible. The widest sheet that keeps all that.
    const half = W / 2, sin = Math.sin(SWING);
    const DcMin = P * Math.max(1.06, half / Math.max(1, half - 0.6 * u));
    const wMax = Math.max(6 * u, (half - 0.75 * u) / sin);
    let zPrev = -Infinity;
    lay = frames.map((f, i) => {
      const el = labEls[i], d = f.d, mg = MOUNT * d.w, A = (d.w + 2 * mg) / (d.h + 2 * mg);
      // of the sheets that keep those rules, the one whose far side (its smallest words) is seen largest
      let best = null;
      for (let cw = Math.floor(wMax / u); cw >= 6; cw--) {
        const ch = Math.max(2, Math.ceil(cw / A - 1e-6));
        el.style.width = `${(cw - 2) * u}px`;
        const lr = Math.ceil(el.offsetHeight / u - 1e-3), need = ch + 3 + lr;
        const Dc = Math.max(DcMin, P * need / rows), Dg = Math.max(P * 1.02, Dc - 0.05 * V0);
        if (ch * u * P / Dg > 0.5 * H) continue;
        const farK = P / (Dc + cw * u * Math.cos(SWING));
        if (farK < 0.5) continue;   // its far edge (and its label's) seen at no less than half scale
        const MW = cw / ch > A ? (d.h + 2 * mg) * cw / ch : d.w + 2 * mg, score = (cw * u / MW) * farK;
        if (!best || score > best.score) best = { cw, ch, lr, need, Dc, Dg, score };
      }
      if (!best) { const cw = 6, ch = Math.ceil(cw / A); el.style.width = `${(cw - 2) * u}px`; const lr = Math.ceil(el.offsetHeight / u - 1e-3), Dc = Math.max(DcMin, P * (ch + 3 + lr) / rows); best = { cw, ch, lr, Dc, Dg: Math.max(P * 1.02, Dc - 0.05 * V0) }; }
      const { cw, ch, lr, Dc, Dg } = best;
      // the drawing's units: the sheet takes the drawing plus its margin; the wider side of the margin takes the rest
      if (cw / ch > A) { f.MH = d.h + 2 * mg; f.MW = f.MH * cw / ch; } else { f.MW = d.w + 2 * mg; f.MH = f.MW * ch / cw; }
      f.mgx = (f.MW - d.w) / 2; f.mgy = (f.MH - d.h) / 2; f.k = cw * u / f.MW;
      buildSheet(f);
      el.style.width = `${(cw - 2) * u}px`;
      // vertical: the panel (sheet, a cell, the label) centred on the band's middle (it shrinks towards the screen's
      // middle with distance), the sheet's top on a row
      const bandMid = H / 2 - (rT + rows / 2) * u, need = ch + 3 + lr;
      const r0 = Math.round(rT + rows / 2 - need / 2);
      const yTop = H / 2 - r0 * u, yC = yTop - ch * u / 2;
      // depth: at its closest moment (CLOSE) its hinge is Dc from the camera; the hinge on a column of the wall's grid
      const tC = walkAt(CLOSE[i]);
      let Zh = Math.round((Dc - P + tC) / u) * u; if (Zh < zPrev + 2 * u) Zh = zPrev + 2 * u; zPrev = Zh;
      const kMax = f.k * P / Dg, kMid = f.k * P / (Dc + 0.5 * cw * u * Math.cos(SWING));
      return { cw, ch, lr, r0, yTop, yC, Zh, tC, Dc, Dg, Dopen: Dc + 0.5 * V0, Dread: Dc + 0.2 * V0, kMax, kMid, wS: cw * u, hS: ch * u, bandMid,
        label: { width: (cw - 2) * u, height: lr * u } };
    });
    frames.forEach((f, i) => {
      const l = lay[i];
      f.pivot.position.set((f.left ? -1 : 1) * half, l.yC, -l.Zh);
      f.panel.position.set((f.left ? 1 : -1) * f.MW / 2 * f.k, 0, 0); f.panel.scale.setScalar(f.k); f.pivot.rotation.set(0, (f.left ? 1 : -1) * Math.PI / 2, 0);
      // the label's corners in the sheet's own plane: a cell in from its sides, a cell under it, lr cells tall
      const c = u / f.k;
      // the words 1.5 cells under the sheet; the backing a cell round them (half a cell clear of the sheet above)
      l.labLocal = [[-f.MW / 2 + c, -f.MH / 2 - 1.5 * c], [f.MW / 2 - c, -f.MH / 2 - 1.5 * c], [f.MW / 2 - c, -f.MH / 2 - 1.5 * c - l.lr * c], [-f.MW / 2 + c, -f.MH / 2 - 1.5 * c - l.lr * c]]
        .map(([x, y]) => new THREE.Vector3(x, y, ZS + 0.3));
      l.backLocal = [[-f.MW / 2, -f.MH / 2 - c / 2], [f.MW / 2, -f.MH / 2 - c / 2], [f.MW / 2, -f.MH / 2 - c * 2.5 - l.lr * c], [-f.MW / 2, -f.MH / 2 - c * 2.5 - l.lr * c]]
        .map(([x, y]) => new THREE.Vector3(x, y, ZS + 0.3));
    });
    // the end: the camera stops where the lock's face fills the screen; the lock's face is hL tall; the door around it
    tEnd = walkAt(DIVE);
    door.Hd = 0.78 * H; door.Wd = Math.min(0.6 * W, door.Hd / 2.1, (half - u) / 0.87);
    door.hL = 0.16 * door.Hd;
    const Dend = door.hL * P / endFaceHeight(H, { strip, tbTop, u });
    door.zFace = P - tEnd - Dend; const zFace = door.zFace;
    const lastFar = Math.max(...lay.map((l, i) => l.Zh + lay[i].wS + u));
    if (-(zFace - 1.2) < lastFar + 2 * u) {
      // a short screen needs a longer hallway than the walk reaches: the last stretch walks further (still slowing down)
      const t2 = walkAt(WALK[2]), need = P + lastFar + 2 * u - 1.2 - Dend, k = (need - t2) / Math.max(1, tEnd - t2), n = walkTab.length - 1, i2 = Math.floor(WALK[2] / DIVE * n);
      for (let i = i2; i <= n; i++) walkTab[i] = t2 + (walkTab[i] - t2) * k;
      tEnd = walkAt(DIVE); door.zFace = P - tEnd - Dend;
    }
    L = -(door.zFace - 1.2);
    camera.far = L + P * 3; camera.updateProjectionMatrix();
    // the leaf: its lock side on the walking line (the lock at 0.8 of its width from the hinge)
    door.x0 = -0.8 * door.Wd;
    door.group.position.set(door.x0 + door.Wd / 2, -H / 2 + door.Hd / 2, -L + 0.6);
    door.leaf.scale.set(door.Wd, door.Hd, 1); door.leaf.position.set(0, 0, 0);
    rebuildLabels();
    depthNow = -1; sizeHall(Math.max(0.0001, ease(span(lastQ, ...WAY_IN))), true);
    const sm = W < 1024 ? 1024 : 2048;
    if (key.shadow.mapSize.x !== sm) { key.shadow.mapSize.set(sm, sm); key.shadow.map?.dispose(); key.shadow.map = null; }
    placePhones(); placeLock();
    theme();
  }

  /** the camera walks straight down the axis */
  const camT = (q) => walkAt(q * DIVE);

  /** the hallway's walls, floor, ceiling and end wall for a depth (the way in unfolds it from the screen) */
  let depthNow = -1;
  function sizeHall(t, force = false) {
    const depth = Math.max(0.5, L * t); if (!force && Math.abs(depth - depthNow) < 0.01) return; depthNow = depth;
    const tile = 5 * gu;
    const place = (mesh) => {
      const { side } = mesh.userData;
      const [w, h_, pos, rot] = side === 0 ? [depth, H, [-W / 2, 0, -depth / 2], [0, Math.PI / 2, 0]] : side === 1 ? [depth, H, [W / 2, 0, -depth / 2], [0, -Math.PI / 2, 0]]
        : side === 2 ? [W, depth, [0, -H / 2, -depth / 2], [-Math.PI / 2, 0, 0]] : [W, depth, [0, H / 2, -depth / 2], [Math.PI / 2, 0, 0]];
      mesh.scale.set(w, h_, 1); mesh.position.set(...pos); mesh.rotation.set(...rot);
      const ru = w / tile, rv = h_ / tile, map = mesh.material.map;
      map.repeat.set(ru, rv);
      if (side === 0) map.offset.set(0, -rv); else if (side === 1) map.offset.set(-ru, -rv); else if (side === 2) map.offset.set(0, 0); else map.offset.set(0, -rv);
      if (mesh.material.normalMap) { mesh.material.normalMap.repeat.copy(map.repeat); mesh.material.normalMap.offset.copy(map.offset); mesh.material.aoMap = side >= 2 ? aoRot : ao; }
    };
    planes.forEach(place); flats.forEach(place);
    // the end wall with its doorway: UVs are its own x, y, so the tile repeats per world unit from the mouth's lines
    const Wd = door.Wd, Hd = door.Hd, x0 = door.x0, x1 = door.x0 + Wd, sh = new THREE.Shape();
    sh.moveTo(-W / 2, -H / 2); sh.lineTo(W / 2, -H / 2); sh.lineTo(W / 2, H / 2); sh.lineTo(-W / 2, H / 2); sh.lineTo(-W / 2, -H / 2);
    const hole = new THREE.Path(); hole.moveTo(x0, -H / 2); hole.lineTo(x0, -H / 2 + Hd); hole.lineTo(x1, -H / 2 + Hd); hole.lineTo(x1, -H / 2); hole.lineTo(x0, -H / 2);
    sh.holes = [hole];
    const ek = `${W}|${H}|${Wd}|${Hd}|${x0}`;
    if (endWall.userData.key !== ek) { endWall.geometry.dispose(); endWall.geometry = new THREE.ShapeGeometry(sh); endWall.userData.key = ek; }
    endWall.position.set(0, 0, -depth);
    endTex.repeat.set(1 / tile, 1 / tile); endTex.offset.set((W / 2) / tile, -(H / 2) / tile);
    door.group.position.z = -depth + 0.6;
    // the static hairlines: the hallway's four long edges, the end wall's outline, the doorway and its architrave, the
    // shut leaf's two panels and its hinges
    const e = [-W / 2, -H / 2, W / 2, -H / 2, W / 2, H / 2, -W / 2, H / 2], E = [];
    for (let c = 0; c < 4; c++) E.push([e[c * 2], e[c * 2 + 1], 0, e[c * 2], e[c * 2 + 1], -depth]);
    for (let c = 0; c < 4; c++) { const n = (c + 1) % 4; E.push([e[c * 2], e[c * 2 + 1], -depth, e[n * 2], e[n * 2 + 1], -depth]); }
    const z = -depth + 0.4, y0 = -H / 2, a = Wd * 0.07;
    const rectU = (xa, xb, y1) => [[xa, y0, z, xa, y1, z], [xa, y1, z, xb, y1, z], [xb, y1, z, xb, y0, z]];
    E.push(...rectU(x0, x1, y0 + Hd), ...rectU(x0 - a, x1 + a, y0 + Hd + a));
    const zl = -depth + 0.9, rr = (xa, ya, xb, yb) => E.push([xa, ya, zl, xb, ya, zl], [xb, ya, zl, xb, yb, zl], [xb, yb, zl, xa, yb, zl], [xa, yb, zl, xa, ya, zl]);
    // the panels keep clear of the lock (on the lock side they stop a cell short of it)
    const lockR = door.hL * 0.75;
    rr(x0 + Wd * 0.14, y0 + Hd * 0.08, Math.min(x0 + Wd * 0.86, -lockR - gu), y0 + Hd * 0.38);
    rr(x0 + Wd * 0.14, y0 + Hd * 0.82, Math.min(x0 + Wd * 0.86, -lockR - gu), y0 + Hd * 0.95);
    [[0.12, 0.18], [0.82, 0.88]].forEach(([p0, p1]) => E.push([x0 + Wd * 0.03, y0 + Hd * p0, zl, x0 + Wd * 0.03, y0 + Hd * p1, zl]));
    staticBase = E; knockKey = '';
    placeLock();
  }

  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  /** a world point's screen position and its depth in front of the camera (negative: behind) */
  const proj = (x, y, z) => { v4.set(x, y, z).applyMatrix4(camera.matrixWorldInverse); const dz = -v4.z; v3.set(x, y, z).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, dz]; };
  const P3 = (f, x, y, z = ZS) => { const p = new THREE.Vector3(x, y, z).applyMatrix4(f.panel.matrixWorld); return proj(p.x, p.y, p.z); };

  /** the knockout: the static hairlines, cut where they would pass within half a cell of a label's words */
  function knockout(rects) {
    const k = `${rects.map((r) => `${r.l | 0},${r.t | 0},${r.r | 0},${r.b | 0}`).join(';')}|${camera.position.z.toFixed(2)}|${depthNow.toFixed(2)}`;
    if (k === knockKey) return; knockKey = k;
    const out = [], near = camera.near * 1.01;
    for (let si = 0; si < staticBase.length; si++) {
      let [ax, ay, az, bx, by, bz] = staticBase[si];
      let A = proj(ax, ay, az), B = proj(bx, by, bz);
      if (A[2] < near && B[2] < near) continue;
      if (A[2] < near || B[2] < near) {   // clip at the near plane
        const t = (near - A[2]) / (B[2] - A[2]), cx = lerp(ax, bx, t), cy = lerp(ay, by, t), cz = lerp(az, bz, t);
        if (A[2] < near) { ax = cx; ay = cy; az = cz; A = proj(ax, ay, az); } else { bx = cx; by = cy; bz = cz; B = proj(bx, by, bz); }
      }
      if (!rects.length) { out.push(ax, ay, az, bx, by, bz); continue; }
      const cuts = [];
      for (const r of rects) {
        let t0 = 0, t1 = 1; const dx = B[0] - A[0], dy = B[1] - A[1];
        const ok = [[-dx, A[0] - r.l], [dx, r.r - A[0]], [-dy, A[1] - r.t], [dy, r.b - A[1]]].every(([p, q]) => {
          if (Math.abs(p) < 1e-9) return q >= 0;
          const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } return true;
        });
        if (ok && t1 > t0) cuts.push([t0, t1]);
      }
      if (!cuts.length) { out.push(ax, ay, az, bx, by, bz); continue; }
      cuts.sort((p, q) => p[0] - q[0]);
      const keep = []; let at = 0;
      for (const [c0, c1] of cuts) { if (c0 > at) keep.push([at, c0]); at = Math.max(at, c1); }
      if (at < 1) keep.push([at, 1]);
      const to3 = (sp) => (sp / B[2]) / ((1 - sp) / A[2] + sp / B[2]);
      for (const [s0, s1] of keep) { const t0 = to3(s0), t1 = to3(s1); out.push(lerp(ax, bx, t0), lerp(ay, by, t0), lerp(az, bz, t0), lerp(ax, bx, t1), lerp(ay, by, t1), lerp(az, bz, t1)); }
    }
    edges.geometry.dispose(); edges.geometry = segGeo(out); edges.userData.pos = out;
  }

  function fitShadow(cam) {
    const sc = key.shadow.camera, n = key.shadow.mapSize.x, half = 1.5 * P;
    const texel = (2 * half) / n, zc = Math.round((cam.z - 1.25 * P) / texel) * texel;
    key.target.position.set(0, 0, zc); key.position.copy(key.target.position).addScaledVector(keyDir, Math.max(W, H) * 2.2);
    sc.left = -Math.max(W, H) * 0.8; sc.right = Math.max(W, H) * 0.8; sc.top = half; sc.bottom = -half; sc.near = 1; sc.far = Math.max(W, H) * 4.4 + P;
    sc.updateProjectionMatrix(); key.target.updateMatrixWorld();
  }

  /** a drawing's state for a camera distance D from its hinge: how far out it is (0 flat on the wall .. 1 at 40
   *  degrees), how much is drawn, its opacity, its label's */
  function stateAt(l, D) {
    const out_ = span(D, l.Dopen, l.Dread), back = span(D, l.Dc, l.Dg);
    const swing = ease(out_) * (1 - ease(back));
    const op = span(D, l.Dopen + 0.9 * V0, l.Dopen + 0.5 * V0) * (1 - span(D, l.Dc - 0.25 * (l.Dc - l.Dg), l.Dg));
    const drawn = ease(span(D, l.Dopen - 0.05 * V0, l.Dread + 0.02 * V0));
    const lab = span(D, l.Dread + 0.06 * V0, l.Dread) * (1 - span(D, l.Dc, l.Dc - 0.3 * (l.Dc - l.Dg)));
    return { swing, op, drawn, lab };
  }
  function pose(f, s) {
    f.pivot.rotation.y = (f.left ? 1 : -1) * (Math.PI / 2 - SWING * s.swing);
    f.pivot.updateMatrixWorld(true);
  }

  /** q: 0..1 over the dive. Returns what page 1 needs and what the checks measure */
  let out = null, lastQ = 0, labQuads = [];
  function render(q, again = false) {
    if (!lay) return null;
    lastQ = q; if (!again) lastScrollRender = performance.now();
    const T = ease(span(q, ...WAY_IN)), dress = ease2(span(q, ...DRESS));
    sizeHall(Math.max(0.0001, T));
    canvas.style.opacity = String(clamp(span(q, ...WAY_IN) / 0.18));
    planes.forEach((m) => { m.material.opacity = dress; m.visible = dress > 0.002; });
    edgeMat.opacity = LOOK.edges * clamp(T / 0.3 + 0.0001);
    const t = camT(q);
    camera.position.set(0, 0, P - t); camera.rotation.set(0, 0, 0); camera.updateMatrixWorld();
    fitShadow(camera.position);
    // the door: faint from the start, clearer as you near it
    door.alpha = lerp(0.2, 1, ease2(clamp(t / Math.max(1, tEnd)))) * span(T, 0.55, 1);
    leafMat.opacity = door.alpha; door.lockObj?.setOpacity(door.alpha);
    door.group.visible = door.alpha > 0.002;
    const info = [], rects = [];
    labQuads = [];
    frames.forEach((f, i) => {
      const l = lay[i], D = camera.position.z + l.Zh, s = stateAt(l, D);
      pose(f, s);
      const op = T >= 1 ? s.op : 0;
      f.pivot.visible = op > 0.002;
      f.mats.forEach((m) => { m.opacity = m.userData.base * op; });
      f.frameMat.opacity = op;
      const n = Math.round(s.drawn * f.d.segs.length); f.drawing.geometry.instanceCount = n; f.drawing.visible = n > 0 && f.pivot.visible;
      f.drawMat.opacity = (1 - f.real) * op;
      const dimsOn = f.pivot.visible && f.d.dims && n >= Math.min(f.dimAt, f.d.segs.length);
      f.dims.visible = !!dimsOn; f.dimMat.opacity = (1 - f.real) * op * 0.62;
      f.labels.forEach((m) => { m.visible = f.pivot.visible && n >= Math.min(m.userData.at, f.d.segs.length) && n > 0; m.material.opacity = op * (m.userData.alpha ?? 1) * (1 - f.real); });
      if (dimsOn) measure(f);
      if (f.layers) {
        f.spread = ease(clamp(s.swing));
        layerPlaces(f.spread).forEach((p, li) => { const L_ = f.layers[li]; L_.mesh.position.set(U(f, p.x + LAYERS.LW / 2), V(f, p.y + LAYERS.LH / 2), ZS + 0.3 + li * 0.05 + (li * LAYERS.dz) * f.spread); L_.mesh.visible = f.pivot.visible; });
      }
      if (f.still) {
        const live = phones.state === 'ready';
        // drawn -> real as it comes fully out, then the phones turn as you walk past
        const realT = (f.stillOK || live) ? ease2(span(D, l.Dread + 0.08 * V0, l.Dread)) : 0;
        if (Math.abs(realT - f.real) > 1e-4) { f.real = realT; colours(); }
        const stillA = f.real * (live ? 1 - phones.mix : 1);
        f.still.visible = f.stillOK && stillA > 0.001 && f.pivot.visible; f.still.material.opacity = stillA * op;
        const liveA = live ? f.real * phones.mix * op : 0;
        phones.root.visible = liveA > 0.002 && f.pivot.visible;
        phones.yaw = turnAt(span(D, l.Dread, l.Dc));
        if (live) {
          phones.mats.forEach((m) => { m.opacity = m.userData.base * liveA; });
          phones.list.forEach((p, k) => {
            const yaw = k ? Math.max(0, phones.yaw - 0.22 * Math.sin(Math.min(Math.PI, phones.yaw / 2))) : phones.yaw;
            p.pivot.rotation.y = yaw;
            const b = f.blobs[k], sz = p.size, wv = sz.x * Math.abs(Math.cos(yaw)) + sz.z * Math.abs(Math.sin(yaw));
            b.visible = phones.root.visible; b.material.opacity = 0.26 * liveA;
            b.position.set(p.home.u + 3, p.home.v - 5, ZS + 3); b.scale.set(wv * 256 / 136, sz.y * 512 / 392, 1);
          });
        }
        f.blobs.forEach((b) => { if (!live) b.visible = false; });
      }
      // the label, carried by the sheet's own perspective
      const el = labEls[i], lop = f.pivot.visible ? op * s.lab : 0;
      el.style.setProperty('--op', lop.toFixed(3));
      el.classList.toggle('on', lop > 0.01);
      if (lop > 0.01) {
        const pts = l.labLocal.map((p) => p.clone().applyMatrix4(f.panel.matrixWorld)).map((p) => proj(p.x, p.y, p.z));
        if (pts.every((p) => p[2] > camera.near)) {
          const q4 = pts.map((p) => [p[0], p[1]]), lb = l.label;
          const m = quadMatrix(lb.width, lb.height, q4);
          if (m) el.style.transform = m;
          el.dataset.rest = '0';
          const back = l.backLocal.map((p) => p.clone().applyMatrix4(f.panel.matrixWorld)).map((p) => proj(p.x, p.y, p.z)).map((p) => [p[0], p[1]]);
          const xs = q4.map((p) => p[0]), ys = q4.map((p) => p[1]);
          const r = { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) };
          labQuads.push({ i, quad: q4, back, rect: r, op: lop });
          const c = gu / 2 + 2; rects.push({ l: r.l - gu - c, r: r.r + gu + c, t: r.t - gu / 2 - c, b: r.b + gu / 2 + c });   // its words, half a cell clear (the backing reaches a cell past them)
        } else el.classList.remove('on');
      }
      if (f.pivot.visible) {
        const q4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => P3(f, x, y).slice(0, 2));
        const quad = q4(-f.MW / 2, f.MH / 2, f.MW / 2, -f.MH / 2);
        info.push({ i, swing: s.swing, op, drawn: s.drawn, lab: s.lab, quad, D, ratio: f.d.w / f.d.h, real: f.real, share: Math.max(...quad.map((p) => p[1])) - Math.min(...quad.map((p) => p[1])) });
      } else info.push({ i, swing: 0, op: 0, drawn: s.drawn, lab: 0, quad: null, D, ratio: f.d.w / f.d.h, real: f.real, share: 0 });
    });
    // the lock steps back wherever a label's words would come within a cell of it (TYPE_RULES: no shape under a word)
    door.lockHidden = 0;
    if (door.lockObj && door.group.visible) {
      const lb = screenBox(door.lockObj.root);
      if (lb) labQuads.forEach((lq) => { const r = lq.rect, c = gu; if (r.l - c < lb.x + lb.w && r.r + c > lb.x && r.t - c < lb.y + lb.h && r.b + c > lb.y) door.lockHidden = Math.max(door.lockHidden, lq.op); });
      door.lockObj.setOpacity(door.alpha * (1 - door.lockHidden));
    }
    const openOn = q >= OPEN_AT[0] && q <= OPEN_AT[1] && T >= 1;
    openEl.classList.toggle('on', openOn);
    if (openOn) { const c = gu / 2 + 2, r = openEl.getBoundingClientRect(); rects.push({ l: r.left - gu - c, r: r.right + gu + c, t: r.top - gu - c - gu / 2, b: r.bottom + gu + c + gu / 2 }); }   // its backing, half a cell clear (it settles from below)
    knockout(rects);
    renderer.autoClear = true;
    renderer.render(scene, camera);
    const warmDraw = phones.warmNow && !phones.root.visible && f5;
    if (warmDraw) { phones.root.visible = true; phones.mats.forEach((m) => { m.opacity = 0.002; }); }
    if (phones.warm && phones.root.visible) phones.warm = false;
    if (phones.root.visible) {
      f5.panel.updateMatrixWorld(true); phones.root.matrix.copy(f5.panel.matrixWorld); phones.root.matrixWorldNeedsUpdate = true;
      renderer.autoClear = false; renderer.render(phoneScene, camera); renderer.autoClear = true;
    }
    if (warmDraw) phones.root.visible = false;
    const ph = { state: phones.state, mix: phones.mix, yaw: phones.yaw, visible: phones.root.visible };
    const lockBox = door.lockObj ? screenBox(door.lockObj.root) : null;
    const o = { info, q, t, phones: ph, open: T >= 1, tr: T, dress, door: { alpha: door.alpha, lock: door.lockState, box: lockBox, fill: lockBox ? lockBox.h / H : 0 }, labels: labQuads };
    if (!again) out = o; else if (out) Object.assign(out, o);
    if (again) onAgain?.(out);
    return out;
  }
  let onAgain = null;
  function screenBox(obj) {
    const bx = new THREE.Box3().setFromObject(obj), cs = [];
    for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) cs.push(proj(x, y, z));
    if (cs.some((c) => c[2] < camera.near)) return null;
    const xs = cs.map((c) => c[0]), ys = cs.map((c) => c[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }

  /** for the type check (TYPE_RULES.md): every drawn line, shape and in-drawing word on screen now, in CSS px. Round 8b:
   *  the frames' edges and the labels' backings count as drawn lines; a drawing's own words are checked against its own
   *  lines in its own plane (inPlane(): half a cell at its scale at its closest point), not in screen px */
  function drawn() {
    const D = { lines: [], shapes: [], texts: [], fails: [] };
    if (!lay || !out) return D;
    const segIn = (A, B) => A[2] > camera.near && B[2] > camera.near;
    const occ = [];
    frames.forEach((f) => { if (!f.pivot.visible || f.sheet.material.opacity < 0.9) return; f.pivot.updateMatrixWorld(true);
      const q = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => P3(f, sx * f.MW / 2, sy * f.MH / 2));
      if (q.every((p) => p[2] > camera.near)) occ.push(q.map((p) => [p[0], p[1]])); });
    const inQuad = (q, x, y) => { let pos = 0, neg = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4], c = (n[0] - p[0]) * (y - p[1]) - (n[1] - p[1]) * (x - p[0]); if (c > 0) pos++; else if (c < 0) neg++; } return !(pos && neg); };
    const visible = (A, B, tag) => {
      const ts = [0, 1], dx = B[0] - A[0], dy = B[1] - A[1];
      for (const q of occ) for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4], ex = n[0] - p[0], ey = n[1] - p[1], den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-9) continue; const t = ((p[0] - A[0]) * ey - (p[1] - A[1]) * ex) / den, s = ((p[0] - A[0]) * dy - (p[1] - A[1]) * dx) / den;
        if (t > 0 && t < 1 && s >= 0 && s <= 1) ts.push(t); }
      ts.sort((a, b) => a - b);
      for (let i = 0; i + 1 < ts.length; i++) { const a = ts[i], b = ts[i + 1]; if (b - a < 1e-5) continue; const m = (a + b) / 2, x = A[0] + dx * m, y = A[1] + dy * m;
        if (!occ.some((q) => inQuad(q, x, y))) D.lines.push({ x1: A[0] + dx * a, y1: A[1] + dy * a, x2: A[0] + dx * b, y2: A[1] + dy * b, tag }); }
    };
    const pos = edges.userData.pos || [];
    for (let k = 0; k < pos.length; k += 6) { const A = proj(pos[k], pos[k + 1], pos[k + 2]), B = proj(pos[k + 3], pos[k + 4], pos[k + 5]); if (segIn(A, B) && edgeMat.opacity > 0.02) visible(A, B, 'hall:edge'); }
    if (door.group.visible && door.alpha * (1 - (door.lockHidden || 0)) > 0.05 && door.lockObj) { const b = screenBox(door.lockObj.root); if (b) D.shapes.push({ ...b, tag: 'door:lock' }); }
    // the labels' frosted backings (a rounded box: its four sides)
    labQuads.forEach((lq) => { if (lq.op < 0.05) return; const b = lq.back; for (let k = 0; k < 4; k++) { const A = b[k], B = b[(k + 1) % 4]; D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `hall${lq.i + 1}lab:backing` }); } });
    // the sheets nearer than each drawing (its hinge's distance), for occlusion
    const sheetQ = frames.map((f) => (f.pivot.visible && f.sheet.material.opacity > 0.9 ? [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => P3(f, sx * f.MW / 2, sy * f.MH / 2)) : null));
    const dist = frames.map((f, i) => camera.position.z + lay[i].Zh);
    frames.forEach((f, i) => {
      if (!f.pivot.visible) return;
      const g = `hall${i + 1}`;
      const nearer = sheetQ.filter((q, j) => q && j !== i && dist[j] < dist[i] && q.every((p) => p[2] > camera.near)).map((q) => q.map((p) => [p[0], p[1]]));
      const hidden = (x, y) => nearer.some((q) => inQuad(q, x, y));
      const L0 = D.lines.length, S0 = D.shapes.length, T0 = D.texts.length;
      const c = [P3(f, -f.MW / 2, -f.MH / 2), P3(f, f.MW / 2, -f.MH / 2), P3(f, f.MW / 2, f.MH / 2), P3(f, -f.MW / 2, f.MH / 2)];
      if (c.some((p) => p[2] < camera.near)) return;
      const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]);
      D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad: c.map((p) => [p[0], p[1]]), tag: `${g}:sheet` });
      for (let k = 0; k < 4; k++) { const A = c[k], B = c[(k + 1) % 4]; D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:frame` }); }
      if (f.real < 0.5) {
        const n = f.drawing.geometry.instanceCount;
        for (let k = 0; k < n; k++) { const [a, b, cc, e] = f.d.segs[k], A = P3(f, U(f, a), V(f, b)), B = P3(f, U(f, cc), V(f, e)); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:seg` }); }
        if (f.dims.visible) for (let k = 0; k < f.dimSegs.length; k += 6) { const s3 = f.dimSegs, A = P3(f, s3[k], s3[k + 1]), B = P3(f, s3[k + 3], s3[k + 4]); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:dim` }); }
        f.labels.forEach((m, k) => {
          if (!m.visible || m.material.opacity < 0.05) return;
          const l = m.userData.l, b = inkBox(l);
          const quad = [[b.x0, b.t], [b.x1, b.t], [b.x1, b.b], [b.x0, b.b]].map(([x, y]) => P3(f, U(f, x), V(f, y)).slice(0, 2)), xs = quad.map((p) => p[0]), ys = quad.map((p) => p[1]);
          const sz = Math.abs(P3(f, U(f, b.x0), V(f, l.y))[1] - P3(f, U(f, b.x0), V(f, l.y - l.size))[1]);
          D.texts.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad, t: l.t, tag: `${g}:t${k}`, size: l.size / (LAYERS.S), screenSize: sz / gu });
        });
        if (f.layers) layerShapes(f, g, D);
      } else if (f.still && f.d.region) {
        const rg = f.d.region, A = P3(f, U(f, rg.u), V(f, rg.v)), B = P3(f, U(f, rg.u + rg.w), V(f, rg.v + rg.h));
        D.shapes.push({ x: Math.min(A[0], B[0]), y: Math.min(A[1], B[1]), w: Math.abs(B[0] - A[0]), h: Math.abs(B[1] - A[1]), tag: `${g}:phones` });
      }
      if (nearer.length) {
        const ls = D.lines.splice(L0); ls.forEach((l) => { if (!(hidden(l.x1, l.y1) && hidden(l.x2, l.y2) && hidden((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2))) D.lines.push(l); });
        const ss = D.shapes.splice(S0); ss.forEach((sh) => { const q = sh.quad || [[sh.x, sh.y], [sh.x + sh.w, sh.y], [sh.x + sh.w, sh.y + sh.h], [sh.x, sh.y + sh.h]]; if (!q.every((p) => hidden(p[0], p[1]))) D.shapes.push(sh); });
        const ts = D.texts.splice(T0); ts.forEach((t) => { if (!hidden(t.x + t.w / 2, t.y + t.h / 2)) D.texts.push(t); });
      }
    });
    return D;
  }
  /** canvas 2's layers for the check: each layer's visible outline (its top strip's sides, or all four for the front
   *  one) and its words */
  function layerShapes(f, g, D) {
    const places = layerPlaces(f.spread), n = places.length;
    places.forEach((p, li) => {
      const it = layerItems(li), z = ZS + 0.3 + li * 0.05 + li * LAYERS.dz * f.spread;
      const vis = li === n - 1 ? LAYERS.LH : Math.max(0, Math.min(LAYERS.LH, places[li + 1].y - p.y));
      if (vis < 1) return;
      const W3 = (x, y) => P3(f, U(f, p.x + x), V(f, p.y + y), z);
      const segs = [[0, 0, LAYERS.LW, 0], [0, 0, 0, vis], [LAYERS.LW, 0, LAYERS.LW, vis]];
      if (li === n - 1) segs.push([0, vis, LAYERS.LW, vis], ...it.H.slice(4));
      segs.forEach(([a, b, c, e]) => { const A = W3(a, b), B = W3(c, e); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:layer${li}` }); });
      it.T.forEach((t, k) => {
        if (t.y > vis) return;
        mctx.font = t.serif ? `420 100px Newsreader` : `500 100px "DM Mono"`; if ('letterSpacing' in mctx) mctx.letterSpacing = t.serif ? '0px' : '6px';
        const m = mctx.measureText(t.t), s = t.size / 100, w = m.width * s, x0 = t.anchor === 'middle' ? t.x - w / 2 : t.x;
        const A = W3(x0, t.y - m.actualBoundingBoxAscent * s), B = W3(x0 + w, t.y + m.actualBoundingBoxDescent * s), sz = Math.abs(W3(x0, t.y)[1] - W3(x0, t.y - t.size)[1]);
        const quad = [[x0, t.y - m.actualBoundingBoxAscent * s], [x0 + w, t.y - m.actualBoundingBoxAscent * s], [x0 + w, t.y + m.actualBoundingBoxDescent * s], [x0, t.y + m.actualBoundingBoxDescent * s]].map(([x, y]) => W3(x, y).slice(0, 2));
        const xs = quad.map((p) => p[0]), ys = quad.map((p) => p[1]);
        D.texts.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad, t: t.t, tag: `${g}:L${li}t${k}`, size: t.size / LAYERS.S, screenSize: sz / gu });
      });
      it.B.forEach((b) => { const quad = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => W3(x, y).slice(0, 2)), xs = quad.map((p) => p[0]), ys = quad.map((p) => p[1]); D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad, tag: `${g}:L${li}box` }); });
    });
  }

  /** round 8b's stretch check, replaced: for each drawing at its closest fully shown moment (and at the last moment it
   *  is still visible), every word's size on screen in cells (the type scale's smallest step is 0.375), the sheet's
   *  height as a share of the screen's, its closest approach to the screen's edge, and its words' clear space in its own
   *  plane (in drawing units against CLEAR) */
  function readability() {
    if (!lay) return null;
    const keep = lastQ, res = [];
    frames.forEach((f, i) => {
      const l = lay[i];
      const at = (D) => {
        camera.position.set(0, 0, D - l.Zh); camera.updateMatrixWorld();
        const s = stateAt(l, D); pose(f, s);
        if (f.layers) f.spread = ease(clamp(s.swing));
        const c = [P3(f, -f.MW / 2, -f.MH / 2), P3(f, f.MW / 2, -f.MH / 2), P3(f, f.MW / 2, f.MH / 2), P3(f, -f.MW / 2, f.MH / 2)];
        const ys = c.map((p) => p[1]), xs = c.map((p) => p[0]);
        const sizes = [];
        f.d.labels.filter((x) => x.t).concat(f.labels.filter((m) => m.userData.l.dim).map((m) => m.userData.l)).forEach((lb) => {
          const b = inkBox(lb); for (const x of [b.x0, b.x1]) sizes.push(Math.abs(P3(f, U(f, x), V(f, lb.y))[1] - P3(f, U(f, x), V(f, lb.y - lb.size))[1]) / gu);
        });
        if (f.layers) { const D2 = { lines: [], shapes: [], texts: [] }; layerShapes(f, 'x', D2); D2.texts.forEach((t) => sizes.push(t.screenSize)); }
        return { minSize: sizes.length ? Math.min(...sizes) : null, share: (Math.max(...ys) - Math.min(...ys)) / H, edge: Math.min(...xs.map((x) => Math.min(x, W - x))), op: s.op, swing: s.swing };
      };
      const close = at(l.Dc), clear = inPlane(f);
      // its label: a cell of backing round its words in its own plane, seen at the least scale across the label
      const pad = Math.min(...l.backLocal.map((v) => { const a3 = v.clone().applyMatrix4(f.panel.matrixWorld), b3 = v.clone().add(new THREE.Vector3(0, gu / f.k, 0)).applyMatrix4(f.panel.matrixWorld); const A = proj(a3.x, a3.y, a3.z), B = proj(b3.x, b3.y, b3.z); return Math.abs(B[1] - A[1]) / gu; }));
      clear.labelPad = +pad.toFixed(3);
      let lastVis = l.Dc; for (let D = l.Dc; D > l.Dg - 1; D -= 1) { if (stateAt(l, D).op >= 0.05) lastVis = D; else break; }
      const last = at(lastVis);
      res.push({ i: i + 1, key: f.F.key, cells: [l.cw, l.ch], label: l.lr, over: l.over, closest: close, lastVisible: last, inPlane: clear });
    });
    render(keep, true);
    return { W, H, u: gu, P, smallest: 0.375, frames: res, worstSize: Math.min(...res.map((r) => r.closest.minSize ?? 9)), worstShare: Math.max(...res.map((r) => r.lastVisible.share)) };
  }
  /** a drawing's words against its own lines (and its frame, and its layers' edges), in screen px at the moment it is
   *  read closest: at least half a cell (TYPE_RULES rule 2; the type check skips these pairs mid-walk, where the
   *  drawing is farther off and everything in it is smaller) */
  function inPlane(f) {
    // pairs in the drawing's plane (units): each word's box against each line; the closest pair of points is projected
    // to the screen and measured there (so the gap is read as the eye reads it: foreshortened, but not shrunk by the
    // slant perspective gives a word and a line that run side by side)
    const near = (b, s) => {   // closest points between box b {x0, x1, t, b} and segment s [ax, ay, bx, by]
      const [ax, ay, bx, by] = s, inB = (x, y) => x >= b.x0 && x <= b.x1 && y >= b.t && y <= b.b;
      if (inB(ax, ay) || inB(bx, by)) return [[ax, ay], [ax, ay], 0];
      const cl = (x, y) => [clamp(x, b.x0, b.x1), clamp(y, b.t, b.b)];
      const onS = (x, y) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; const k = L2 ? clamp(((x - ax) * dx + (y - ay) * dy) / L2) : 0; return [ax + k * dx, ay + k * dy]; };
      let best = null;
      const tryP = (p, q) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (!best || d < best[2]) best = [p, q, d]; };
      tryP(cl(ax, ay), [ax, ay]); tryP(cl(bx, by), [bx, by]);
      [[b.x0, b.t], [b.x1, b.t], [b.x1, b.b], [b.x0, b.b]].forEach((c) => tryP(c, onS(...c)));
      // a segment crossing the box with both ends outside
      for (let k = 0; k <= 16; k++) { const x = lerp(ax, bx, k / 16), y = lerp(ay, by, k / 16); if (inB(x, y)) return [[x, y], [x, y], 0]; }
      return best;
    };
    let worst = Infinity, what = '', pair = null;
    const check = (box, segs, toScr, word) => segs.forEach((sg) => {
      const n = near(box, sg); if (!n) return;
      const d = n[2] === 0 ? 0 : Math.hypot(...[0, 1].map((k) => toScr(...n[0])[k] - toScr(...n[1])[k]));
      if (d < worst) { worst = d; what = word; pair = [box, sg, n[0], n[1]]; }
    });
    const scrD = (x, y) => P3(f, U(f, x), V(f, y)).slice(0, 2);
    const fr = [-f.mgx, -f.mgy, f.d.w + f.mgx, f.d.h + f.mgy], frame = [[fr[0], fr[1], fr[2], fr[1]], [fr[2], fr[1], fr[2], fr[3]], [fr[2], fr[3], fr[0], fr[3]], [fr[0], fr[3], fr[0], fr[1]]];
    const segs = f.d.segs.concat(f.dimSegsD || [], frame);
    f.d.labels.filter((x) => x.t).concat(f.labels.filter((m) => m.userData.l.dim).map((m) => m.userData.l)).forEach((l) => check(inkBox(l), segs, scrD, l.t));
    if (f.layers) {
      const places = layerPlaces(f.spread), n = places.length;
      places.forEach((p, li) => {
        const it = layerItems(li), z = ZS + 0.3 + li * 0.05 + li * LAYERS.dz * f.spread, toScr = (x, y) => P3(f, U(f, p.x + x), V(f, p.y + y), z).slice(0, 2);
        const own = it.H.concat(...it.B.map((bx) => [[bx.x, bx.y, bx.x + bx.w, bx.y], [bx.x + bx.w, bx.y, bx.x + bx.w, bx.y + bx.h], [bx.x + bx.w, bx.y + bx.h, bx.x, bx.y + bx.h], [bx.x, bx.y + bx.h, bx.x, bx.y]]));
        it.T.forEach((t) => {
          mctx.font = t.serif ? `420 100px Newsreader` : `500 100px "DM Mono"`; if ('letterSpacing' in mctx) mctx.letterSpacing = t.serif ? '0px' : '6px';
          const m = mctx.measureText(t.t), s = t.size / 100, w = m.width * s, x0 = t.anchor === 'middle' ? t.x - w / 2 : t.x;
          const box = { x0, x1: x0 + w, t: t.y - m.actualBoundingBoxAscent * s, b: t.y + m.actualBoundingBoxDescent * s };
          check(box, own, toScr, t.t);
          // the layer in front of it: its top edge, in its own plane
          if (li < n - 1) { const q = places[li + 1], zq = ZS + 0.3 + (li + 1) * 0.05 + (li + 1) * LAYERS.dz * f.spread, dy = q.y - p.y;
            const toQ = (x, y) => (Math.abs(y - dy) < 1e-6 ? P3(f, U(f, p.x + x), V(f, q.y), zq).slice(0, 2) : toScr(x, y));
            check(box, [[0, dy, LAYERS.LW, dy]], toQ, `${t.t} (next layer)`); }
        });
      });
    }
    const need = gu / 2 - 0.75;
    return { worst: +worst.toFixed(2), need: +need.toFixed(2), ok: worst >= need, what, pair };
  }

  /** draw every frame once, whole, so its buffers and textures reach the GPU now and not mid-walk */
  function warm(q = 0.5) {
    render(q);
    frames.forEach((f) => { f.pivot.visible = true; f.drawing.visible = true; f.drawing.geometry.instanceCount = f.d.segs.length; f.dims.visible = true; f.labels.forEach((m) => { m.visible = true; }); if (f.still && f.stillOK) f.still.visible = true; if (f.layers) f.layers.forEach((L_) => { L_.mesh.visible = true; }); });
    planes.forEach((m) => { m.visible = true; });
    try { renderer.compile(scene, camera); } catch (e) {}
    renderer.render(scene, camera);
    render(q);
  }
  function reset() {}
  return { layout, render, load, warm, reset, theme, sizeLayers, LAYERS, loadPhones, loadLock, drawn, readability, look: LOOK.id, stops: STOPS, close: CLOSE.map(S_), phones: () => phones.state, frames: () => frames, lay: () => lay, P: () => P, L: () => L,
    door: () => ({ ...door, tEnd }), camera: () => camera, renderer: () => renderer, lockParts: () => lockParts, onBeat: (fn) => { onAgain = fn; } };
}

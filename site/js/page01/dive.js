// Page 2: the hallway (Part 5 "Round 4 picks" ... "Round 8"). Round 8 (Wajih's review of round 7):
// - The way in: A only (the grid folds into the hallway: the page's flat grid is the hallway's end wall at the screen;
//   it recedes and the walls, floor and ceiling unfold behind it). Scrubbed by the scroll, not timed.
// - The hallway dresses up as you walk: grid lines first (the paper's own flat grid in perspective, its edges), then
//   the card, the light and the shadows fade in over the first stretch of scroll, fully dressed by the opening line.
// - Calm: the camera walks straight down the hallway at a calm pace and never turns. The drawings swing out like
//   museum portraits on a revolving door (treatment B, Wajih's pick: a bare blueprint sheet swings off its wall on its
//   hinge to face you; treatments A and C are gone). At rest each faces the screen square-on (its exact proportions),
//   whole grid cells, about 60% of the screen's height (capped by the width and by its label), on phones and laptops.
// - Labels: on a frosted backing with softly rounded corners, only as wide as the drawing, right under it, turning
//   with it (a DOM label carried by the sheet's own perspective, matrix3d), never full width.
// - Each canvas shows its point on one of our made-up products (corridor-drawings.js). Dimension lines carry their
//   live measured length in DM Mono Light, on the line, the line broken round it (CAD style).
// - No drawn line crosses a word (TYPE_RULES.md): the hallway's edges and the door stop short of every label on
//   screen, half a grid cell clear (a knockout, as on a map).
// - The end: a door with a lock (the real "Cutaway Lock", zbzzn, CC BY 4.0), in the hallway's hairline style, faint from
//   the start and clearer as you walk towards it. It opens and leads on (to page 3, the security stub, until round 9).
// - Frame 5: the real iPhone 18 and S26 (live 3D, git-ignored files) turn with the scroll inside the frame's rest (round
//   8: scrubbed, no longer timed). The still stands in while they load, with reduced motion, and when files are missing.
// The hallway keeps round 6's grid: its walls, floor and ceiling carry the screen's grid continued from the mouth.
// No stretching: one true perspective; the lens is 50 degrees across the narrower side, at most 66 across.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { FRAMES, PHONE_PAIR, OPENING, dimParts } from './corridor-drawings.js';
import { LOOKS, HALL } from './hall-looks.js';
import { grid } from '../engine/grid.js';
import { studio } from '../phones/studio.js';

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
// the way in, the dress, the opening line, five rests (frames 1-4 rest 0.28 of a screen, frame 5 0.4: its phones turn
// first), the walk to the door, the door opening, through it.
export const DIVE = 4.6;
const S_ = (screens) => screens / DIVE;
const REST = [0.28, 0.28, 0.28, 0.28, 0.4], FIRST = 1.12, EVERY = 0.57;
export const STOPS = REST.map((r, i) => { const s = FIRST + i * EVERY; return [S_(s), S_(s + r)]; });
export const OPEN_AT = [S_(0.3), S_(0.78)];                      // the opening line
export const WAY_IN = [S_(0.02), S_(0.32)];                      // the grid folds into the hallway
export const DRESS = [S_(0.1), S_(0.62)];                        // grid lines -> card, light and shadow
const ARRIVE = S_(0.22), TURN_OUT = S_(0.12);                    // the walk to a rest, the swing back
const FADE_IN = [S_(0.035), S_(0.005)], FADE_OUT = [S_(0.002), S_(0.016)], DRAW = S_(0.12);
const LAST = STOPS[STOPS.length - 1];
export const DOOR = { walk: [LAST[1] + TURN_OUT * 0.5, S_(4.24)], open: [S_(4.28), S_(4.46)], through: [S_(4.36), 1] };
const REAL = [S_(0.02), S_(0.07)], TURN = [S_(0.09), S_(0.36)];  // frame 5 (from its rest's start): drawn -> real, the turn
const BLUE = '#173F73', WHITE = '#FFFFFF';
const MOUNT = 0.07;   // the least blue margin round a drawing, as a share of its width
const ZS = 0.4;       // the sheet's offset from its panel (off the hinge)

// a label inside a drawing (mono, white) as a small texture on a plane, in drawing units (y down), at its baseline.
// Round 8: measurements in DM Mono Light (300)
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
function labelMesh(l, fontPx = 56) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const font = fontOf(l, fontPx), t = l.t || ' ';
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  const tw = Math.ceil(x.measureText(t).width) + 8;
  c.width = tw; c.height = Math.ceil(fontPx * 1.4);
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(t, 4, fontPx * 1.05);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const s = l.size / fontPx, pw = c.width * s, ph = c.height * s;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
  const ax = l.anchor === 'middle' ? -(pw - 8 * s) / 2 : l.anchor === 'end' ? -(pw - 8 * s) : 0;
  mesh.userData = { cx: l.x + ax + pw / 2 - 4 * s, cy: l.y - fontPx * 1.05 * s + ph / 2, at: l.at, faint: !!l.faint, l };
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

/** a frame's label (round 8): on a frosted backing (CSS), the title (big, serif), the drawing's name (mono), one line of
 *  story (a draft, flagged) */
export const labelHTML = (f) => `<div class="dive__lab"><p class="dive__lab-t display gt">${f.caption}</p><p class="dive__lab-k mono gt gt-h">${f.fig}</p>` +
  `<p class="dive__lab-s gt gt-h"><span class="ph" data-draft>Draft</span>${f.story}</p></div>`;
export const openingHTML = () => `<div class="dive__open"><p class="dive__open-f ph mono gt gt-h">Draft</p><p class="dive__open-l display gt" data-draft>${OPENING.lead}</p><p class="dive__open-r gt gt-h" data-draft>${OPENING.rest}</p></div>`;

/** root: the paper behind the hallway (its own flat grid shows through the open door); top: the hallway in WebGL, the
 *  opening line, the labels. */
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
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = LOOK.exposure;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  camera.rotation.order = 'YXZ';
  const phoneScene = new THREE.Scene();
  const lineMats = [];
  const lmat = (o) => { const m = new LineMaterial({ linewidth: 1, worldUnits: false, transparent: true, toneMapped: false, ...o }); lineMats.push(m); return m; };
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr.length ? arr : [0, 0, 0, 0, 0, 0]); return g; };

  // ---------- the surfaces: walls, floor and ceiling. Each twice: the flat grid (the page's own paper and lines, unlit,
  // exact: "grid lines first") under the white card with its grid, lit, which fades in as the hallway dresses ----------
  const ao = aoTex();
  const aoRot = (() => { const t = ao.clone(); t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t; })();
  const cardTex = canvasTex(1024, 1024, () => {}, true);
  cardTex.wrapS = cardTex.wrapT = THREE.RepeatWrapping; cardTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); cardTex.minFilter = THREE.LinearMipmapLinearFilter;
  const nrm = flatNormal(); nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
  const spec = LOOK.walls;
  const cardMat = new THREE.MeshStandardMaterial({ map: cardTex, normalMap: nrm, normalScale: new THREE.Vector2(spec.normal, spec.normal), roughness: spec.rough, metalness: 0, aoMap: ao, aoMapIntensity: 0.55, envMapIntensity: spec.env, transparent: true });
  // the page's paper and grid exactly (one tile = 5 x 5 cells in device pixels): the end wall, the flat surfaces
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
  // the end wall (the page's paper and grid; at the start of the way in it IS the page), with the doorway cut out
  const endMat = new THREE.MeshBasicMaterial({ map: endTex, toneMapped: false });
  const endWall = new THREE.Mesh(new THREE.BufferGeometry(), endMat); endWall.renderOrder = -1; scene.add(endWall);
  let surfImgs = {};
  async function loadSurfaces(b = base) {
    const [c, n] = await Promise.all([loadImage(`${b}media/materials/${spec.tex}/color.webp`), loadImage(`${b}media/materials/${spec.tex}/normal.webp`)]);
    surfImgs = { c, n }; painted = ''; paintSurfaces();
  }
  let painted = '';
  /** the card: the paper scan in grey, then the grid (one tile = 5 x 5 cells; walls and floor repeat it in world units of
   *  the screen's cell from the hallway's mouth); the page's paper and grid: one tile in device pixels */
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

  // the static hairlines: the hallway's edges and the doorway (world space; cut round every label on screen)
  const edgeMat = lmat({ opacity: LOOK.edges });
  const edges = new LineSegments2(segGeo([]), edgeMat); edges.renderOrder = 1; scene.add(edges);
  let staticBase = [], leafStart = Infinity;       // [ax, ay, az, bx, by, bz] each; from leafStart: the shut leaf's lines
  let knockKey = '';

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); key.castShadow = true; scene.add(key); scene.add(key.target);
  key.shadow.camera.up.set(0, 0, -1); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6; key.shadow.radius = LOOK.key.radius;
  const keyDir = new THREE.Vector3(...LOOK.key.dir).normalize();

  // ---------- the door: a leaf on its hinge in the end wall's doorway, its panels and the real lock ----------
  const door = { pivot: new THREE.Group(), leaf: null, lines: null, lock: new THREE.Group(), lockState: 'idle', Wd: 1, Hd: 1, alpha: 0, ang: 0 };
  scene.add(door.pivot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0, envMapIntensity: 0.35, transparent: true, side: THREE.DoubleSide });
  door.leaf = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), leafMat); door.leaf.receiveShadow = true; door.pivot.add(door.leaf);
  const leafLineMat = lmat({ opacity: LOOK.edges });
  door.lines = new LineSegments2(segGeo([]), leafLineMat); door.lines.renderOrder = 1; door.pivot.add(door.lines);
  door.pivot.add(door.lock);
  const lockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0, envMapIntensity: 0.5, transparent: true, flatShading: true });
  const lockLineMat = lmat({ opacity: 0.6 });
  /** the real "Cutaway Lock" (zbzzn, Printables 250197, CC BY 4.0): housing, plug, cap, clip, merged offline with their
   *  hairline edges into one small file (tools/lock_web.mjs: parsing four STLs on the phone stalled its scroll); matte
   *  card with ink edges, in the hallway's style */
  async function loadLock(b = base) {
    if (door.lockState !== 'idle') return; door.lockState = 'loading';
    try {
      const [man, buf] = await Promise.all([fetchRetry(`${b}media/models/lock/manifest.json`, 'json'), fetchRetry(`${b}media/models/lock/door-lock.bin`, 'arrayBuffer')]);
      if (!man || !buf) { door.lockState = 'missing'; return; }
      const h = new Uint32Array(buf, 0, 5); if (h[0] !== 0x4b434f4c) throw new Error('not a lock file');
      const nV = h[2], nI = h[3], nE = h[4]; let o = 20;
      const pos = new Float32Array(buf, o, nV * 3); o += nV * 12;
      const idx = h[1] === 2 ? new Uint32Array(buf, o, nI) : new Uint16Array(buf, o, nI); o += nI * (h[1] === 2 ? 4 : 2); o = Math.ceil(o / 4) * 4;
      const ed = new Float32Array(buf, o, nE);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
      const group = new THREE.Group(); group.add(new THREE.Mesh(g, lockMat));
      const lines = new LineSegments2(segGeo(ed), lockLineMat); lines.renderOrder = 2; group.add(lines);
      // the manifest's turn to y up, then turned a little, so it reads as a lock body, not a ring
      const [rx, ry, rz] = (man.rotate || [-90, 0, 180]).map((d) => d * Math.PI / 180);
      const inner = new THREE.Group(); inner.add(group); inner.rotation.set(rx, ry, rz, 'XYZ');
      const outer = new THREE.Group(); outer.add(inner); outer.rotation.set(0.18, Math.PI - 0.55, 0);
      outer.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(outer), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
      inner.position.sub(outer.worldToLocal(c.clone()));   // centre it (the centre measured in the turned frame, taken back into it)
      outer.updateMatrixWorld(true);
      const box2 = new THREE.Box3().setFromObject(outer); outer.userData = { size, front: box2.max.z, back: box2.min.z };
      door.lockObj = outer; door.lock.add(outer);
      placeLock(); colours();
      try { await renderer.compileAsync(scene, camera); } catch (e) { try { renderer.compile(scene, camera); } catch (e2) {} }   // its materials compile now, not on first sight
      door.lockState = 'ready'; render(lastQ, true);
    } catch (e) { console.warn('[dive] lock', e); door.lockState = 'missing'; }
  }
  /** the lock at handle height on the leaf's free side, its face just proud of the leaf */
  function placeLock() {
    const o = door.lockObj; if (!o) return;
    const { size } = o.userData, s = (0.075 * door.Hd) / Math.max(size.y, 1e-3);
    o.scale.setScalar(s);
    // mounted on the leaf's face like a rim lock: wholly in front of it, so its cutaway and pins read
    o.position.set(door.Wd * 0.84, door.Hd * 0.47 - door.Hd / 2, 0.8 - o.userData.back * s);
  }

  // ---------- the drawings: a blueprint sheet each (no frame, no mat, no glass) ----------
  const blobMap = blobTex();
  const frames = FRAMES.map((F, i) => {
    const d = F.draw, mg0 = d.w * MOUNT, [ca, cb] = F.cells;
    let MW = d.w + 2 * mg0, MH = d.h + 2 * mg0;
    if (MW / MH > ca / cb) MH = MW * cb / ca; else MW = MH * ca / cb;
    const mgx = (MW - d.w) / 2, mgy = (MH - d.h) / 2;
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = F.side === 'l';
    // panel coordinates: drawing units, the sheet centred on the origin, y up, z out of the wall. Round 8: the sheet can
    // be widened at layout (more blue margin either side: setSheet), so these read the frame's current width
    const box = { MW, mgx };
    const U = (u) => -box.MW / 2 + box.mgx + u, V = (v) => MH / 2 - mgy - v;
    const mats = [];
    const own = (m, b = 1) => { m.transparent = true; m.userData.base = b; mats.push(m); return m; };
    const sheetMat = own(new THREE.MeshBasicMaterial({ toneMapped: false }));
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), sheetMat); sheet.position.z = ZS; panel.add(sheet);
    const pos = new Float32Array(d.segs.length * 6);
    d.segs.forEach(([a, b, c, e], k) => pos.set([U(a), V(b), ZS + 0.2, U(c), V(e), ZS + 0.2], k * 6));
    const drawMat = lmat({ opacity: 1 });
    const drawing = new LineSegments2(segGeo(pos), drawMat); drawing.geometry.instanceCount = 0; panel.add(drawing);
    const dimMat = lmat({ opacity: 1 });
    const dims = new LineSegments2(segGeo([]), dimMat); dims.visible = false; panel.add(dims);
    let still = null, blobs = null;
    if (F.real && d.region) {
      const rg = d.region, sm = own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      still = new THREE.Mesh(new THREE.PlaneGeometry(rg.w, rg.h), sm); still.position.set(U(rg.u + rg.w / 2), V(rg.v + rg.h / 2), ZS + 0.25); still.visible = false; panel.add(still);
      blobs = PHONE_PAIR.phones.map(() => { const m = own(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blobMap, depthWrite: false, toneMapped: false }), 0.26); const b = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); b.position.z = ZS + 30; b.renderOrder = 4; b.visible = false; panel.add(b); return b; });
    }
    const f = { F, d, i, left, MW, MH, MW0: MW, mgx, mgy, U, V, box, pivot, panel, sheet, drawing, dims, dimSegs: [], dimAt: Infinity, labels: [], still, blobs, stillOK: false, real: 0, drawMat, dimMat, mats };
    return f;
  });
  /** a sheet cw x ch cells on screen: its height is the drawing's own; wider than its shape, it takes more blue margin */
  function setSheet(f, cw, ch) {
    const MW = Math.max(f.MW0, f.MH * cw / ch);
    if (Math.abs(MW - f.MW) < 1e-6 && f.drawing.geometry.userData.built) return;
    f.MW = f.box.MW = MW; f.mgx = f.box.mgx = (MW - f.d.w) / 2;
    f.sheet.scale.x = MW / f.MW0;
    const pos = new Float32Array(f.d.segs.length * 6);
    f.d.segs.forEach(([a, b, c, e], k) => pos.set([f.U(a), f.V(b), ZS + 0.2, f.U(c), f.V(e), ZS + 0.2], k * 6));
    const n = f.drawing.geometry.instanceCount; f.drawing.geometry.dispose(); f.drawing.geometry = segGeo(pos); f.drawing.geometry.instanceCount = n; f.drawing.geometry.userData.built = true;
    if (f.still) { const rg = f.d.region; f.still.position.set(f.U(rg.u + rg.w / 2), f.V(rg.v + rg.h / 2), ZS + 0.25); }
  }
  const f5 = frames.find((f) => f.still);

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
  // where the phones sit: in front of frame 5's sheet, moved towards the camera's axis and scaled by the same
  // perspective, so front-on from the camera's rest they cover the blueprint's outlines exactly
  function placePhones() {
    if (!f5 || !lay || !phones.list.length) return;
    const l = lay[f5.i], R = PHONE_PAIR.region, m = f5.d.region;
    const cam = l.camLocal; if (!cam) return;
    const zPh = ZS + 46, c = (cam.z - zPh) / (cam.z - ZS);
    phones.list.forEach((p) => {
      const sp = p.spec, cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2;
      const u = f5.U(m.u + (cx - R.x0)), v = f5.V(m.v + (R.y1 - cy));
      p.pivot.position.set(cam.x + (u - cam.x) * c, cam.y + (v - cam.y) * c, zPh); p.pivot.scale.setScalar(c);
      p.home = { u, v };
    });
  }
  let lastScrollRender = 0, warmT = 0;
  const resting = (q) => STOPS.slice(0, 4).some(([s, e]) => q >= s + S_(0.03) && q <= e - S_(0.008));
  function idleWarm(force) {
    clearTimeout(warmT);
    if (!phones.warm) return;
    if (!force && performance.now() - lastScrollRender < 220 && !resting(lastQ)) { warmT = setTimeout(idleWarm, 120); return; }
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
  // the turn (round 8: scrubbed inside frame 5's rest): front -> back (held) -> front-on
  const turnAt = (u) => { const K = [[0, 0], [0.4, Math.PI], [0.6, Math.PI], [1, 2 * Math.PI]]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(u, K[i - 1][0], K[i][0]))); return 2 * Math.PI; };

  let loaded = null, envP = null;
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await Promise.all([document.fonts.load('500 56px "DM Mono"'), document.fonts.load('300 56px "DM Mono"')]); } catch (e) {}
    rebuildLabels();
    envP = studio(renderer, b).then((e) => { scene.environment = e; phoneScene.environment = e; colours(); }).catch(() => {});
    const jobs = [loadSurfaces(b), envP];
    if (f5) jobs.push((async () => {
      const img = await loadImage(`${b}${f5.F.real}`);
      if (img) { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.flipY = img.flipped === false; t.needsUpdate = true; f5.still.material.map = t; f5.still.material.needsUpdate = true; renderer.initTexture(t); f5.stillOK = true; }
    })());
    await Promise.all(jobs);
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    loadLock(b);
    return true;
  })());
  /** the drawings' own labels, and (round 8) their dimension lines with the live measurement on the line */
  function rebuildLabels() {
    frames.forEach((f, i) => {
      f.labels.forEach((m) => { f.panel.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
      const pxPerUnit = lay ? lay[i].tw / f.MW : 0, uu = gu || 20;
      const ls = f.d.labels.filter((l) => l.t);
      const segs = []; f.dimAt = Infinity;
      (f.d.dims || []).forEach((dm) => {
        const val = pxPerUnit ? `${(Math.abs(dm.x2 - dm.x1) * pxPerUnit).toFixed(1)} PX` : '';
        const L0 = { t: val || '000.0 PX', x: 0, y: 0, size: dm.size, anchor: 'middle', light: true };
        const box = inkBox(L0), clear = pxPerUnit ? (uu / 2 + 2) / pxPerUnit : dm.size;
        const parts = dimParts(dm, box.x1 - box.x0, clear);
        parts.segs.forEach(([a, b, c, e]) => segs.push(f.U(a), f.V(b), ZS + 0.2, f.U(c), f.V(e), ZS + 0.2));
        if (val) ls.push({ t: val, x: parts.label.x, y: parts.label.y + (parts.label.inline ? (box.b - box.t) / 2 - box.b : 0), size: dm.size, anchor: 'middle', at: dm.at, faint: true, light: true, dim: true });
        f.dimAt = Math.min(f.dimAt, dm.at);
      });
      f.dimSegs = segs; f.dims.geometry.dispose(); f.dims.geometry = segGeo(segs);
      f.labels = ls.map((l) => { const m = labelMesh(l); m.position.set(f.U(m.userData.cx), f.V(m.userData.cy), ZS + 0.3); m.visible = false; f.panel.add(m); return m; });
    });
    colours();
  }

  let W = 1, H = 1, P = 1, L = 1, ink = '#121212', paper = '#F6F7F9', dark = false, gu = 20;
  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.setStyle('#888'); } return c; };
  const th = (pair) => (Array.isArray(pair) ? pair[dark ? 1 : 0] : pair);
  function colours() {
    planes.forEach((m) => m.material.color.copy(col(th(spec.color))));
    edgeMat.color.copy(col(ink)); leafLineMat.color.copy(col(ink)); lockLineMat.color.copy(col(ink));
    leafMat.color.copy(col(th(spec.base))); lockMat.color.copy(col(th(spec.base)));
    hemi.color.copy(col(th(LOOK.hemi.sky))); hemi.groundColor.copy(col(th(LOOK.hemi.ground))); hemi.intensity = th(LOOK.hemi.i);
    key.color.copy(col(LOOK.key.color)); key.intensity = th(LOOK.key.i);
    scene.environmentIntensity = th(LOOK.env);
    frames.forEach((f) => {
      f.sheet.material.color.copy(col(BLUE)).lerp(col(dark ? '#1B1C1D' : '#F4F5F7'), f.real);
      f.drawMat.color.copy(col(WHITE)); f.dimMat.color.copy(col(WHITE));
      f.labels.forEach((m) => { m.material.color.copy(col(WHITE)); m.userData.alpha = m.userData.faint ? 0.62 : 1; });
    });
    paintSurfaces();
  }
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F6F7F9';
    colours();
  }

  // ---------- layout: the lens, each drawing's rest (on screen: whole cells, in proportion, its label right under it;
  // in the hallway: on its wall's grid), the hallway's length, the door ----------
  let lay = null, tDoor = 0, tThrough = 0;
  /** opts: u (the cell), strip (its height), noTitleblock */
  function layout(w, h, opts = {}) {
    W = w; H = h;
    const u = opts.u || grid.u; gu = u;
    P = lensP(W, H);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    // the canvas exactly as large as its drawing buffer in device pixels (a resampled buffer shimmers)
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    lineMats.forEach((m) => m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)));
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = Math.max(1, P * 0.02);
    const desktop = W >= 1024, N = Math.round(W / u);
    const strip = opts.strip ?? (document.getElementById('strip')?.offsetHeight || 2 * u);
    const tb = document.querySelector('.titleblock'), tbr = !opts.noTitleblock && tb?.getClientRects().length ? tb.getBoundingClientRect() : null;
    const tbTop = tbr && tbr.height ? Math.min(H, tbr.top) : Math.floor(H / u) * u;
    const rT = Math.ceil((strip + u) / u - 1e-6), rB = Math.floor((tbTop - u) / u + 1e-6), rows = rB - rT;   // a cell under the strip, a cell over the title block
    openEl.style.left = `${(desktop ? 5 : 1) * u}px`; openEl.style.top = `${(rT + (desktop ? 3 : 1)) * u}px`; openEl.style.width = `${(desktop ? Math.min(28, N - 10) : N - 2) * u}px`;
    // each drawing at rest: as large as about 60% of the screen's height allows, capped by the width and by its label,
    // which sits right under it (its backing as wide as the drawing, its words a cell in from each side)
    const capRows = Math.round(0.6 * H / u);
    let Tprev = -Infinity;
    lay = frames.map((f, i) => {
      const el = labEls[i];
      // the largest drawing whose label still fits under it (a narrower drawing makes a taller label, so this is a search,
      // not a step down). Round 8: in landscape a sheet may be widened (blue margin either side, at most 60% more) so its
      // label, as wide as the sheet, takes fewer lines; if nothing fits, the one that overflows least
      // a square sheet may also take its wider shape (its margin takes it): in landscape first, on phones when nothing fits
      const shapes = W > H && f.F.wide ? [f.F.wide] : [f.F.cells, ...(f.F.wide ? [f.F.wide] : [])];
      let best = null, ca = 1, cb = 1;
      for (const [sa, sb] of shapes) {
      if (best && best.over <= 0) break;
      const mMax = Math.max(1, Math.floor(Math.min((N - 2) / sa, capRows / sb))), cwMax = desktop ? N - 4 : N - 2;
      for (let mm = mMax; mm >= 1; mm--) {
        let fit = null;
        for (let e = 0; sa * mm + e <= cwMax && e <= Math.ceil(sa * mm * 0.6) && (e === 0 || W > H); e++) {
          el.style.width = `${(sa * mm + e - 2) * u}px`;
          const l = Math.ceil(el.offsetHeight / u - 1e-3);   // its own height (the box it shows on screen is transformed)
          const over = sb * mm + 1 + l - rows;               // the sheet, a cell, the words (the backing's last half cell rides in the gap above the title block)
          if (!best || over < best.over) best = { mm, e, l, over, sa, sb };
          if (over <= 0) { fit = { mm, e, l, over, sa, sb }; break; }
        }
        if (fit) { best = fit; break; }
      }
      }
      ca = best.sa; cb = best.sb;
      const m = best.mm, lr = best.l, cw = ca * m + best.e, ch = cb * m;
      setSheet(f, cw, ch);
      const shift = desktop ? Math.max(0, Math.min(6, Math.floor((N - cw) / 2) - 3)) : 0;
      const c0 = Math.floor((N - cw) / 2) + (f.left ? -shift : shift);
      const r0 = rT + Math.max(0, Math.floor((rows - (ch + lr + 1)) / 2));
      const x0 = c0 * u, yTop = r0 * u, tw = cw * u, th_ = ch * u, rect = { left: x0, top: yTop, width: tw, height: th_ };
      const lab = { left: x0 + u, top: yTop + th_ + u, width: tw - 2 * u, height: lr * u };
      el.style.width = `${lab.width}px`;
      const rest = restB(f, i, { x0, yTop, tw, th: th_, u, ch });
      if (rest.T <= Tprev + 0.5 * P) rest.T = Tprev + 0.5 * P; Tprev = rest.T;
      return { ...rest, tw, th: th_, cw, ch, c0, r0, x0, yTop, rect, label: lab, share: th_ / H };
    });
    L = Math.max(lay[lay.length - 1].T + 2.4 * P, ...lay.map((l, i) => l.Z + frames[i].MW * l.k + 0.1 * P));
    camera.far = L + P * 3; camera.updateProjectionMatrix();
    // the door: a standard door's proportions, as tall as 78% of the hallway, its foot on the floor
    door.Hd = 0.78 * H; door.Wd = Math.min(0.6 * W, door.Hd / 2.1);
    const Ddoor = door.Hd * P / (0.9 * H);
    tDoor = P + L - Ddoor; tThrough = P + L + 0.06 * P;
    frames.forEach((f, i) => {
      const l = lay[i];
      f.pivot.position.set((f.left ? -1 : 1) * (W / 2 - l.g), (H / 2 - l.yC) / l.rho, -l.Z); f.panel.position.set(f.left ? f.MW / 2 * l.k : -f.MW / 2 * l.k, 0, 0); f.panel.scale.setScalar(l.k); f.pivot.rotation.set(0, 0, 0);
      f.pivot.updateMatrixWorld(true);
      l.camLocal = f.panel.worldToLocal(new THREE.Vector3(0, 0, P - l.T));
      // the label's corners in the sheet's own plane (at rest they land on its rect on screen)
      const s = l.tw / f.MW, X = (sx) => -f.MW / 2 + (sx - l.x0) / s, Y = (sy) => f.MH / 2 - (sy - l.yTop) / s, lb = l.label;
      l.labLocal = [[lb.left, lb.top], [lb.left + lb.width, lb.top], [lb.left + lb.width, lb.top + lb.height], [lb.left, lb.top + lb.height]].map(([x, y]) => new THREE.Vector3(X(x), Y(y), ZS + 0.3));
    });
    rebuildLabels();
    depthNow = -1; sizeHall(Math.max(0.0001, ease(span(lastQ, ...WAY_IN))), true);
    const sm = W < 1024 ? 1024 : 2048;
    if (key.shadow.mapSize.x !== sm) { key.shadow.mapSize.set(sm, sm); key.shadow.map?.dispose(); key.shadow.map = null; }
    placePhones(); placeLock();
    theme();
  }

  /** round 4's swing. Facing you at rest the sheet lands on (x0, yTop), whole cells; on the wall it hangs on the card's
   *  lines (top edge on a row, hinge on a column) where a small gap to the wall allows it. */
  function restB(f, i, { x0, yTop, tw, th: th_, u, ch }) {
    const xHinge = f.left ? x0 : x0 + tw;
    let best = null;
    for (let j = 0; j * u < H / 2 - 1; j++) {
      const rho = (H / 2 - yTop) / (H / 2 - j * u);
      if (!(rho > 0.2 && rho < 3)) continue;
      const g = W / 2 - Math.abs(xHinge - W / 2) / rho, bottomY = (H / 2 - j * u) - ch * u / rho;
      if (g < 0 || g > 0.5 * u || bottomY < -H / 2 + 1) continue;
      if (!best || g < best.g) best = { j, rho, g };
    }
    // no row lets the hinge sit on the wall (a big drawing near the middle): the pivot stands off the wall (a revolving
    // door's), as far back as keeps the whole sheet inside the hallway, a cell clear of ceiling and floor
    if (!best) { const rhoV = Math.max(H / 2 - yTop, yTop + th_ - H / 2) / (H / 2 - u), rho = Math.max(Math.abs(W / 2 - xHinge) / (W / 2 - 2), rhoV); best = { j: null, rho, g: W / 2 - Math.abs(xHinge - W / 2) / rho }; }
    const { rho, g } = best, yC = yTop + th_ / 2, Df = P / rho, k = tw / rho / f.MW;
    const Tw = P * (0.9 + 1.1 * i);
    const iz = Math.round((Tw - P + Df + ZS * k) / u); const T = P + iz * u - Df - ZS * k;
    const Z = iz * u;
    return { rho, g, yC, k, T, Z, d: Df, s: rho, zc: P - T, zMin: Z + f.MW * k };
  }

  /** the camera walks straight down the axis: still at the mouth, to each rest, on to the door, through it */
  const camT = (q) => {
    const K = [[OPEN_AT[1], 0], ...STOPS.flatMap(([s, e], i) => [[s - FADE_IN[0], lay[i].T], [e + TURN_OUT * 0.5, lay[i].T]]), [DOOR.walk[1], tDoor], [DOOR.through[0], tDoor], [1, tThrough]];
    if (q <= K[0][0]) return 0;
    for (let i = 1; i < K.length; i++) if (q <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(q, K[i - 1][0], K[i][0])));
    return tThrough;
  };

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
      // the grid on the mouth's own lines: walls count rows from the top and cells from the mouth; the floor and ceiling
      // count columns from the left and cells from the mouth
      if (side === 0) map.offset.set(0, -rv); else if (side === 1) map.offset.set(-ru, -rv); else if (side === 2) map.offset.set(0, 0); else map.offset.set(0, -rv);
      if (mesh.material.normalMap) { mesh.material.normalMap.repeat.copy(map.repeat); mesh.material.normalMap.offset.copy(map.offset); mesh.material.aoMap = side >= 2 ? aoRot : ao; }
    };
    planes.forEach(place); flats.forEach(place);
    // the end wall with its doorway: UVs are its own x, y, so the tile repeats per world unit from the mouth's lines
    const Wd = door.Wd, Hd = door.Hd, sh = new THREE.Shape();
    sh.moveTo(-W / 2, -H / 2); sh.lineTo(W / 2, -H / 2); sh.lineTo(W / 2, H / 2); sh.lineTo(-W / 2, H / 2); sh.lineTo(-W / 2, -H / 2);
    const hole = new THREE.Path(); hole.moveTo(-Wd / 2, -H / 2); hole.lineTo(-Wd / 2, -H / 2 + Hd); hole.lineTo(Wd / 2, -H / 2 + Hd); hole.lineTo(Wd / 2, -H / 2); hole.lineTo(-Wd / 2, -H / 2);
    sh.holes = [hole];
    if (endWall.userData.key !== `${W}|${H}|${Wd}|${Hd}`) { endWall.geometry.dispose(); endWall.geometry = new THREE.ShapeGeometry(sh); endWall.userData.key = `${W}|${H}|${Wd}|${Hd}`; }
    endWall.position.set(0, 0, -depth);
    endTex.repeat.set(1 / tile, 1 / tile); endTex.offset.set((W / 2) / tile, -(H / 2) / tile);
    // the leaf on its hinge in the doorway (pivot at the hinge, the leaf spans x 0..Wd)
    door.pivot.position.set(-Wd / 2, -H / 2 + Hd / 2, -depth + 0.6);
    door.leaf.scale.set(Wd, Hd, 1); door.leaf.position.set(Wd / 2, 0, 0);
    // the static hairlines: the hallway's four long edges, the end wall's outline, the doorway and its architrave
    const e = [-W / 2, -H / 2, W / 2, -H / 2, W / 2, H / 2, -W / 2, H / 2], E = [];
    for (let c = 0; c < 4; c++) E.push([e[c * 2], e[c * 2 + 1], 0, e[c * 2], e[c * 2 + 1], -depth]);
    for (let c = 0; c < 4; c++) { const n = (c + 1) % 4; E.push([e[c * 2], e[c * 2 + 1], -depth, e[n * 2], e[n * 2 + 1], -depth]); }
    const z = -depth + 0.4, y0 = -H / 2, a = Wd * 0.07;
    const rectU = (x0, x1, y1) => [[x0, y0, z, x0, y1, z], [x0, y1, z, x1, y1, z], [x1, y1, z, x1, y0, z]];
    E.push(...rectU(-Wd / 2, Wd / 2, y0 + Hd), ...rectU(-Wd / 2 - a, Wd / 2 + a, y0 + Hd + a));
    staticBase = E; knockKey = '';
    // the leaf's own lines (they swing with it): two panels, the hinge marks
    const L2 = [], z2 = 0.5, rr = (x0, y0_, x1, y1) => { L2.push(x0, y0_, z2, x1, y0_, z2, x1, y0_, z2, x1, y1, z2, x1, y1, z2, x0, y1, z2, x0, y1, z2, x0, y0_, z2); };
    const yb = -Hd / 2;
    rr(Wd * 0.16, yb + Hd * 0.54, Wd * 0.84, yb + Hd * 0.9); rr(Wd * 0.16, yb + Hd * 0.1, Wd * 0.84, yb + Hd * 0.4);
    [[0.12, 0.18], [0.82, 0.88]].forEach(([p0, p1]) => L2.push(Wd * 0.03, yb + Hd * p0, z2, Wd * 0.03, yb + Hd * p1, z2));
    door.lines.geometry.dispose(); door.lines.geometry = segGeo(L2);
    leafStart = E.length;
    for (let k = 0; k < L2.length; k += 6) E.push([-Wd / 2 + L2[k], -H / 2 + Hd / 2 + L2[k + 1], -depth + 0.6 + L2[k + 2], -Wd / 2 + L2[k + 3], -H / 2 + Hd / 2 + L2[k + 4], -depth + 0.6 + L2[k + 5]]);
    placeLock();
  }

  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  const project = (p) => { v3.copy(p).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; };
  /** a world point's screen position and its depth in front of the camera (negative: behind) */
  const proj = (x, y, z) => { v4.set(x, y, z).applyMatrix4(camera.matrixWorldInverse); const dz = -v4.z; v3.set(x, y, z).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, dz]; };

  /** the knockout: the static hairlines, cut where they would pass within half a cell of a label's words */
  function knockout(rects) {
    const shut = door.ang < 0.001;
    const k = `${rects.map((r) => `${r.l | 0},${r.t | 0},${r.r | 0},${r.b | 0}`).join(';')}|${camera.position.z.toFixed(2)}|${depthNow.toFixed(2)}|${shut}`;
    if (k === knockKey) return; knockKey = k;
    const out = [], near = camera.near * 1.01;
    for (let si = 0; si < staticBase.length; si++) {
      if (si >= leafStart && !shut) break;
      let [ax, ay, az, bx, by, bz] = staticBase[si];
      let A = proj(ax, ay, az), B = proj(bx, by, bz);
      if (A[2] < near && B[2] < near) continue;
      if (A[2] < near || B[2] < near) {   // clip at the near plane
        const t = (near - A[2]) / (B[2] - A[2]), cx = lerp(ax, bx, t), cy = lerp(ay, by, t), cz = lerp(az, bz, t);
        if (A[2] < near) { ax = cx; ay = cy; az = cz; A = proj(ax, ay, az); } else { bx = cx; by = cy; bz = cz; B = proj(bx, by, bz); }
      }
      if (!rects.length) { out.push(ax, ay, az, bx, by, bz); continue; }
      // screen-space intervals inside any rect (Liang-Barsky), then back to the 3D parameter (perspective-correct)
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

  /** q: 0..1 over the dive. Returns what page 1 needs and what the checks measure (each drawing's quad and sheet on
   *  screen, the labels' quads, the door). */
  let out = null, lastQ = 0, labQuads = [];
  function render(q, again = false) {
    if (!lay) return null;
    lastQ = q; if (!again) lastScrollRender = performance.now();
    if (phones.warm && !again && resting(q)) requestAnimationFrame(() => idleWarm(true));
    // the way in (scrubbed) and the dress
    const T = ease(span(q, ...WAY_IN)), dress = ease2(span(q, ...DRESS));
    sizeHall(Math.max(0.0001, T));
    canvas.style.opacity = String(clamp(span(q, ...WAY_IN) / 0.18));
    planes.forEach((m) => { m.material.opacity = dress; m.visible = dress > 0.002; });
    edgeMat.opacity = LOOK.edges * clamp(T / 0.3 + 0.0001);
    // the camera: straight down the axis
    const t = camT(q);
    camera.position.set(0, 0, P - t); camera.rotation.set(0, 0, 0); camera.updateMatrixWorld();
    fitShadow(camera.position);
    // the door: faint from the start, clearer as you near it; it opens before you pass
    door.alpha = lerp(0.2, 1, ease2(clamp(t / Math.max(1, tDoor)))) * span(T, 0.55, 1);
    door.ang = (100 * Math.PI / 180) * ease(span(q, ...DOOR.open));
    door.pivot.rotation.y = door.ang; door.lines.visible = door.ang >= 0.001;
    leafMat.opacity = door.alpha; leafLineMat.opacity = LOOK.edges * door.alpha; lockMat.opacity = door.alpha; lockLineMat.opacity = 0.6 * door.alpha;
    door.pivot.visible = door.alpha > 0.002;
    const info = [], rects = [];
    labQuads = [];
    frames.forEach((f, i) => {
      const [s, e] = STOPS[i], l = lay[i];
      // the swing: out on its hinge as you arrive, back as you walk on
      const out_ = span(q, s - ARRIVE, s - FADE_IN[0]), back = span(q, e + FADE_OUT[0], e + FADE_OUT[1] + S_(0.04));
      const swing = ease(out_) * (1 - ease(back));
      f.pivot.rotation.y = (f.left ? 1 : -1) * (1 - swing) * Math.PI / 2;
      const op = span(q, s - ARRIVE, s - ARRIVE + S_(0.04)) * (1 - span(q, e + FADE_OUT[0] + S_(0.016), e + FADE_OUT[1] + S_(0.04)));
      f.pivot.visible = op > 0.002;
      f.mats.forEach((m) => { m.opacity = m.userData.base * op; });
      const dp = ease(span(q, s - ARRIVE * 0.8, s - FADE_IN[1] + DRAW * 0.4));
      const n = Math.round(dp * f.d.segs.length); f.drawing.geometry.instanceCount = n; f.drawing.visible = n > 0 && f.pivot.visible;
      f.drawMat.opacity = (1 - f.real) * op;
      const dimsOn = f.pivot.visible && n >= Math.min(f.dimAt, f.d.segs.length);
      f.dims.visible = dimsOn; f.dimMat.opacity = (1 - f.real) * op * 0.62;
      f.labels.forEach((m) => { m.visible = f.pivot.visible && n >= Math.min(m.userData.at, f.d.segs.length) && n > 0; m.material.opacity = op * (m.userData.alpha ?? 1) * (1 - f.real); });
      // a whole number of device pixels wide, so the lines don't shimmer as they move
      f.drawMat.linewidth = f.dimMat.linewidth = Math.max(1, Math.round(dpr));
      if (f.still) {
        const live = phones.state === 'ready';
        // drawn -> real (scrubbed), then the phones turn with the scroll
        const realT = (f.stillOK || live) ? ease2(span(q, s + REAL[0], s + REAL[1])) : 0;
        if (Math.abs(realT - f.real) > 1e-4) { f.real = realT; colours(); }
        const stillA = f.real * (live ? 1 - phones.mix : 1);
        f.still.visible = f.stillOK && stillA > 0.001 && f.pivot.visible; f.still.material.opacity = stillA * op;
        const liveA = live ? f.real * phones.mix * op : 0;
        phones.root.visible = liveA > 0.002 && f.pivot.visible;
        phones.yaw = turnAt(span(q, s + TURN[0], s + TURN[1]));
        if (live) {
          phones.mats.forEach((m) => { m.opacity = m.userData.base * liveA; });
          phones.list.forEach((p, k) => {
            const yaw = k ? Math.max(0, phones.yaw - 0.22 * Math.sin(Math.min(Math.PI, phones.yaw / 2))) : phones.yaw;
            p.pivot.rotation.y = yaw;
            const b = f.blobs[k], sz = p.size, wv = sz.x * Math.abs(Math.cos(yaw)) + sz.z * Math.abs(Math.sin(yaw));
            b.visible = phones.root.visible; b.material.opacity = 0.26 * liveA;
            b.position.set(p.home.u + 3, p.home.v - 5, ZS + 30); b.scale.set(wv * 256 / 136, sz.y * 512 / 392, 1);
          });
        }
        f.blobs.forEach((b) => { if (!live) b.visible = false; });
      }
      const rest = q >= s && q <= e && T >= 1;
      // the label, carried by the sheet's own perspective (at rest: exactly on its rect, on the grid)
      const el = labEls[i], lop = f.pivot.visible ? op * clamp((swing - 0.08) / 0.4) : 0;
      el.style.setProperty('--op', lop.toFixed(3));
      el.classList.toggle('on', lop > 0.01);
      if (lop > 0.01) {
        f.pivot.updateMatrixWorld(true);
        const pts = l.labLocal.map((p) => p.clone().applyMatrix4(f.panel.matrixWorld)).map((p) => proj(p.x, p.y, p.z));
        if (pts.every((p) => p[2] > camera.near)) {
          const q4 = pts.map((p) => [p[0], p[1]]), lb = l.label;
          const atRest = q4.every(([x, y], k) => Math.abs(x - [lb.left, lb.left + lb.width, lb.left + lb.width, lb.left][k]) < 0.05 && Math.abs(y - [lb.top, lb.top, lb.top + lb.height, lb.top + lb.height][k]) < 0.05);
          const m = atRest ? `translate(${lb.left}px, ${lb.top}px)` : quadMatrix(lb.width, lb.height, q4);
          if (m) el.style.transform = m;
          el.dataset.rest = atRest ? '1' : '0';
          const xs = q4.map((p) => p[0]), ys = q4.map((p) => p[1]);
          const r = { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) };
          labQuads.push({ i, quad: q4, rect: r, rest: atRest });
          const c = gu / 2 + 2; rects.push({ l: r.l - gu - c, r: r.r + gu + c, t: r.t - gu / 2 - c, b: r.b + gu / 2 + c });   // its words, half a cell clear (the backing reaches a cell past them)
        } else el.classList.remove('on');
      }
      // the sheet on screen, and the drawing inside it (for the checks)
      if (f.pivot.visible) {
        f.pivot.updateMatrixWorld(true);
        const q4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => project(new THREE.Vector3(x, y, ZS).applyMatrix4(f.panel.matrixWorld)));
        const quad = q4(-f.MW / 2, -f.MH / 2, f.MW / 2, f.MH / 2), sheetQ = q4(f.U(0), f.V(f.d.h), f.U(f.d.w), f.V(0));
        info.push({ i, swing: rest ? 1 : swing, op, drawn: dp, quad, sheet: sheetQ, ratio: f.d.w / f.d.h, real: f.real, rest, share: l.share });
      } else info.push({ i, swing: 0, op: 0, drawn: dp, quad: null, sheet: null, ratio: f.d.w / f.d.h, real: f.real, rest: false, share: l.share });
    });
    // the lock steps back wherever a label's words would sit over it (TYPE_RULES: no shape under a word)
    if (door.lockObj && door.pivot.visible) {
      const bx = new THREE.Box3().setFromObject(door.lockObj), cs = [];
      for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) cs.push(proj(x, y, z));
      const xs = cs.map((c) => c[0]), ys = cs.map((c) => c[1]), lb = { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) };
      let hide = 0; labQuads.forEach((lq) => { const r = lq.rect, c = gu; if (r.l - c < lb.r && r.r + c > lb.l && r.t - c < lb.b && r.b + c > lb.t) hide = Math.max(hide, +labEls[lq.i].style.getPropertyValue('--op') || 0); });
      lockMat.opacity *= 1 - hide; lockLineMat.opacity *= 1 - hide; door.lockHidden = hide;
    }
    const openOn = q >= OPEN_AT[0] && q <= OPEN_AT[1] && T >= 1;
    openEl.classList.toggle('on', openOn);
    if (openOn) { const c = gu / 2 + 2, rg = document.createRange(); [...openEl.children].forEach((p) => { rg.selectNodeContents(p); const r = rg.getBoundingClientRect(); rects.push({ l: r.left - c, r: r.right + c, t: r.top - c - gu / 2, b: r.bottom + c + gu / 2 }); }); }   // its words' own extent (a line may run past its box); half a cell more: it settles from below
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
    const o = { info, q, phones: ph, open: T >= 1, tr: T, dress, door: { alpha: door.alpha, ang: door.ang, lock: door.lockState }, through: t >= P + L, labels: labQuads };
    if (!again) out = o; else if (out) Object.assign(out, o);
    if (again) onAgain?.(out);
    return out;
  }
  let onAgain = null;

  /** for the type check (TYPE_RULES.md): every drawn line, shape and in-drawing word on screen now, in CSS px */
  function drawn() {
    const D = { lines: [], shapes: [], texts: [] };
    if (!lay || !out) return D;
    const segIn = (A, B) => A[2] > camera.near && B[2] > camera.near;
    // the opaque sheets on screen (convex quads): the hallway's edges and the door behind them are hidden there
    const occ = [];
    frames.forEach((f) => { if (!f.pivot.visible || f.sheet.material.opacity < 0.9) return; f.pivot.updateMatrixWorld(true);
      const q = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => { const p = new THREE.Vector3(sx * f.MW / 2, sy * f.MH / 2, ZS).applyMatrix4(f.panel.matrixWorld); return proj(p.x, p.y, p.z); });
      if (q.every((p) => p[2] > camera.near)) occ.push(q.map((p) => [p[0], p[1]])); });
    const inQuad = (q, x, y) => { let pos = 0, neg = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4], c = (n[0] - p[0]) * (y - p[1]) - (n[1] - p[1]) * (x - p[0]); if (c > 0) pos++; else if (c < 0) neg++; } return !(pos && neg); };
    const visible = (A, B, tag) => {
      // where A-B meets each quad's edges, then keep the stretches whose middle is outside every quad
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
    if (door.pivot.visible && door.alpha > 0.05) {
      door.pivot.updateMatrixWorld(true);
      const lp = door.lines.visible ? door.lines.geometry.attributes.instanceStart?.data?.array : null;
      if (lp) for (let k = 0; k < lp.length; k += 6) { const a = new THREE.Vector3(lp[k], lp[k + 1], lp[k + 2]).applyMatrix4(door.pivot.matrixWorld), b = new THREE.Vector3(lp[k + 3], lp[k + 4], lp[k + 5]).applyMatrix4(door.pivot.matrixWorld);
        const A = proj(a.x, a.y, a.z), B = proj(b.x, b.y, b.z); if (segIn(A, B)) visible(A, B, 'door:leaf'); }
      if (door.lockObj && lockMat.opacity > 0.05) { const bx = new THREE.Box3().setFromObject(door.lockObj), cs = []; for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) cs.push(proj(x, y, z));
        const inOcc = (x, y) => occ.some((q) => inQuad(q, x, y));
        if (cs.every((c) => c[2] > camera.near) && !cs.every((c) => inOcc(c[0], c[1]))) { const xs = cs.map((c) => c[0]), ys = cs.map((c) => c[1]); D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), tag: 'door:lock' }); } }
    }
    frames.forEach((f, i) => {
      if (!f.pivot.visible) return;
      const g = `hall${i + 1}`, M = f.panel.matrixWorld;
      f.pivot.updateMatrixWorld(true);
      const P3 = (x, y, z = ZS) => { const p = new THREE.Vector3(x, y, z).applyMatrix4(M); return proj(p.x, p.y, p.z); };
      const c = [P3(-f.MW / 2, -f.MH / 2), P3(f.MW / 2, -f.MH / 2), P3(f.MW / 2, f.MH / 2), P3(-f.MW / 2, f.MH / 2)];
      if (c.some((p) => p[2] < camera.near)) return;
      const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]);
      D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), tag: `${g}:sheet` });
      if (f.real < 0.5) {
        const n = f.drawing.geometry.instanceCount;
        for (let k = 0; k < n; k++) { const [a, b, cc, e] = f.d.segs[k], A = P3(f.U(a), f.V(b)), B = P3(f.U(cc), f.V(e)); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:seg` }); }
        if (f.dims.visible) for (let k = 0; k < f.dimSegs.length; k += 6) { const s3 = f.dimSegs, A = P3(s3[k], s3[k + 1]), B = P3(s3[k + 3], s3[k + 4]); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:dim` }); }
        f.labels.forEach((m, k) => {
          if (!m.visible || m.material.opacity < 0.05) return;
          const l = m.userData.l, b = inkBox(l), A = P3(f.U(b.x0), f.V(b.t)), B = P3(f.U(b.x1), f.V(b.b));
          D.texts.push({ x: Math.min(A[0], B[0]), y: Math.min(A[1], B[1]), w: Math.abs(B[0] - A[0]), h: Math.abs(B[1] - A[1]), t: l.t, tag: `${g}:t${k}`, size: l.size * (lay[i].tw / f.MW) / gu });
        });
      } else if (f.still && f.d.region) {
        const rg = f.d.region, A = P3(f.U(rg.u), f.V(rg.v)), B = P3(f.U(rg.u + rg.w), f.V(rg.v + rg.h));
        D.shapes.push({ x: Math.min(A[0], B[0]), y: Math.min(A[1], B[1]), w: Math.abs(B[0] - A[0]), h: Math.abs(B[1] - A[1]), tag: `${g}:phones` });
      }
    });
    return D;
  }

  /** draw every frame once, whole, so its buffers and textures reach the GPU now and not mid-walk */
  function warm(q = 0.5) {
    render(q);
    frames.forEach((f) => { f.pivot.visible = true; f.drawing.visible = true; f.drawing.geometry.instanceCount = f.d.segs.length; f.dims.visible = true; f.labels.forEach((m) => { m.visible = true; }); if (f.still && f.stillOK) f.still.visible = true; });
    planes.forEach((m) => { m.visible = true; });
    try { renderer.compile(scene, camera); } catch (e) {}
    renderer.render(scene, camera);
    render(q);
  }
  function reset() {}
  return { layout, render, load, warm, reset, theme, loadPhones, loadLock, drawn, look: LOOK.id, stops: STOPS, phones: () => phones.state, frames: () => frames, lay: () => lay, P: () => P, L: () => L, door: () => ({ ...door, tDoor, tThrough }), onBeat: (fn) => { onAgain = fn; } };
}

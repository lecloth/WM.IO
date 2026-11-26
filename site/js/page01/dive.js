// Page 2: the hallway. Part 5 "Hallway rebuild" (26 Nov), pass 1: the space.
// - Fixed proportions on every screen (HALL): about 2.6 wide, 3 high and 19 long, the five frames at about 4, 7, 10,
//   13 and 16 along it, alternating left, right, left, right, left. A screen only changes how much of it the lens shows
//   (one true perspective; the lens is 50 degrees across the narrower side, at most 66 across), never its shape.
// - The sequence as you scroll: the hallway stretches out as a white sketch (the page's grid drawn into depth; a dark
//   sketch in dark mode) -> it dresses up and goes dark -> the spotlights and the ceiling's strip come on -> the frames
//   appear, lit -> you walk, and each frame opens as you reach it. The sketch's grid stays faintly on the dressed walls.
// - The dark hall (hall-looks.js): light and shine are painted into the surfaces once (paintHall), no live lights,
//   shadows or reflections. The only live light is frame 5's real phones' studio light.
// - Scrolling is walking: the camera moves only while you scroll, at one steady pace, straight down the middle.
// - Each frame hangs on its wall by a hinge at its near edge, swings out fully to 90 degrees (square to you) as you reach
//   it, is held open while you come closer, then folds back to the wall as you pass. About a third of the hall's height.
//   They keep round 8b's drawings and labels (pass 2 replaces them).
// - The end: a wall facing you, the door centred in it (about 0.9 x 2.1), two panels, shut. Its lock: a back plate with
//   a lever above a keyhole, on the door's right edge strip between the panels, at handle height. The walk ends
//   standing in front of the shut door. The approach to the keyhole is designed later; until then the hallway hands over
//   to page 3 as before: the screen turns blue and page 3's first frame (the lock in X-ray) fades in (XRAY).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { FRAMES, PHONE_PAIR, OPENING, dimParts, LAYERS, layerPlaces, layerItems, paintLayer, MOUNT, sizeLayers } from './corridor-drawings.js';
import { LOOKS, HALL as LOOK_ID } from './hall-looks.js';
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

/** the hallway in its own units (about metres), the same on every screen */
export const HALL = {
  w: 2.6, h: 3, len: 19, eye: 1.5,
  at: [4, 7, 10, 13, 16],                  // the frames' middles along it; left, right, left, right, left
  frameH: 1.0, frameMaxW: 1.0, hang: 1.55, // a third of its height; never past 1.0 wide (so it never reaches the middle); its middle 1.55 up
  door: { w: 0.9, h: 2.1, arch: 0.07, stile: [0.12, 0.14], panels: [[0.15, 0.82], [1.18, 1.95]], lock: { x: 0.385, y: 0.98 } },
  skirting: 0.1, strip: 0.07, fixture: { r: 0.055, h: 0.07, in: 0.3 },
};

// ---------- the timeline, in screens of scroll (q = screens / DIVE) ----------
export const DIVE = 5.4;
const S_ = (screens) => screens / DIVE;
export const WAY_IN = [S_(0.02), S_(0.32)];      // the sketch stretches out into depth
export const OPEN_AT = [S_(0.3), S_(0.95)];      // the opening line
export const DRESS = [S_(0.34), S_(0.7)];        // it dresses up and goes dark
export const LIGHTS = [S_(0.92), S_(1.18)];      // the spotlights and the strip come on (as the opening line goes)
export const FRAMES_IN = [S_(1.1), S_(1.24)];    // the frames appear, lit
export const WALK = [S_(1.2), S_(5.0)];          // the walk: one steady pace, from the mouth to the shut door
export const DOOR = { walk: [S_(4.3), S_(5.0)], end: S_(5.0) };
export const XRAY = [S_(5.16), S_(5.36)];        // the hand-over to page 3 (its first frame: the lock in X-ray, on blue)
export const STOPS = [];                         // per frame [fully open, closest] (q), set by layout (for the tests)
const SWING = Math.PI / 2;                       // fully open: square to you
const OPEN_LEN = 1.0, HOLD_LEN = 0.8, FOLD_LEN = 1.0;   // hall units walked while a frame swings out, is held open, folds back
const BLUE = '#173F73', WHITE = '#FFFFFF', FRAME_INK = '#0B0C0E';
// offsets off the panel's plane, in drawing units: the sheet, its lines, its frame, its words and layers
const ZS = 8, ZL = ZS + 3, ZF = ZS + 3.5, ZT = ZS + 4;

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
/** a CSS colour as straight sRGB values (the hall's shaders write them to the canvas as they are) */
const rgb3 = (s) => {
  s = String(s).trim();
  if (s[0] === '#') { const h = s.length === 4 ? [...s.slice(1)].map((c) => c + c).join('') : s.slice(1, 7); return new THREE.Vector3(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255); }
  const m = s.match(/[\d.]+/g); return m ? new THREE.Vector3(m[0] / 255, m[1] / 255, m[2] / 255) : new THREE.Vector3(0.5, 0.5, 0.5);
};

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

// ---------- the surfaces' shader: the sketch (the page's paper and grid, exact) dressing into the dark hall (its base
// colour, the painted light added, the painted shade taken off, the grid left faintly on it). Straight sRGB out. ----------
const SURF_VS = `
uniform vec3 uO, uAx, uAy, uG0; uniform vec2 uSize; uniform float uCell5;
varying vec2 vUv; varying vec2 vG;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec3 d = w.xyz - uO, g = w.xyz - uG0;
  vUv = vec2(dot(d, uAx), dot(d, uAy)) / uSize;
  vG = vec2(dot(g, uAx), dot(g, uAy)) / uCell5;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const SURF_FS = `
uniform sampler2D uLight, uGrid; uniform vec3 uPaper, uInk, uBase, uLightCol, uGridCol;
uniform float uDress, uLights, uGain, uShade, uGridSk, uGridDr, uGridHalf;
varying vec2 vUv; varying vec2 vG;
void main() {
  float g = texture2D(uGrid, vG + uGridHalf).r;
  vec3 sketch = mix(uPaper, uInk, g * uGridSk);
  vec4 t = texture2D(uLight, vUv);
  vec3 lit = (uBase + uLightCol * (t.r * uGain * uLights)) * (1.0 - t.b * uShade);
  lit = mix(lit, uGridCol, g * uGridDr);
  gl_FragColor = vec4(mix(sketch, lit, uDress), 1.0);
}`;

/** root: the paper behind the hallway; top: the hallway in WebGL, the opening line, the labels. */
export function createDive(root, top, { base = '' } = {}) {
  const LOOK = LOOKS[LOOK_ID];
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = LOOK.exposure;   // only the real phones are tone mapped
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  camera.rotation.order = 'YXZ';
  const phoneScene = new THREE.Scene();
  const lineMats = [];
  const lmat = (o) => { const m = new LineMaterial({ linewidth: Math.max(1, Math.round(dpr)), worldUnits: false, transparent: true, toneMapped: false, ...o }); lineMats.push(m); return m; };
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr.length ? arr : [0, 0, 0, 0, 0, 0]); return g; };
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

  // world units are CSS px at the screen plane (the hall's mouth, z = 0); K px to one hall unit (layout)
  let W = 1, H = 1, P = 1, K = 1, X = 1, FY = -1, CY = 1, L = 1, ink = '#121212', paper = '#F6F7F9', graphite = '#66696E', dark = false, gu = 20;
  let z0 = 1, zEnd = 0, Dend = 1, hX = 1, Dx = 1;

  // ---------- the painted light: each surface's light (R) and shade (B), in the hall's own units, painted once ----------
  function paintHall() {
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const surf = (wU, hU, wPx, hPx, paintL, paintS) => {
      const lay2 = (paint) => { const c = mk(wPx, hPx), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, wPx, hPx);
        x.setTransform(wPx / wU, 0, 0, -hPx / hU, 0, hPx); x.globalCompositeOperation = 'lighter'; paint(x); return x.getImageData(0, 0, wPx, hPx).data; };
      const a = lay2(paintL), b = lay2(paintS), out = new ImageData(wPx, hPx);
      for (let i = 0; i < a.length; i += 4) { out.data[i] = a[i]; out.data[i + 1] = 0; out.data[i + 2] = b[i]; out.data[i + 3] = 255; }
      const c = mk(wPx, hPx); c.getContext('2d').putImageData(out, 0, 0);
      const t = new THREE.CanvasTexture(c); t.anisotropy = ANISO; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
      return t;
    };
    const wc = (a) => `rgba(255,255,255,${clamp(a)})`;
    // a soft round pool at (cx, cy), radii rx, ry, brightness a at its middle
    const blob = (x, cx, cy, rx, ry, a) => { x.save(); x.translate(cx, cy); x.scale(rx, ry); const g = x.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, wc(a)); g.addColorStop(0.35, wc(a * 0.72)); g.addColorStop(0.7, wc(a * 0.24)); g.addColorStop(1, wc(0)); x.fillStyle = g; x.fillRect(-1, -1, 2, 2); x.restore(); };
    const grad = (x, x0, y0, x1, y1, gx0, gy0, gx1, gy1, stops) => { const g = x.createLinearGradient(gx0, gy0, gx1, gy1); stops.forEach(([t, a]) => g.addColorStop(t, wc(a))); x.fillStyle = g; x.fillRect(x0, y0, x1 - x0, y1 - y0); };
    const vgrad = (x, x0, x1, y0, y1, stops) => grad(x, x0, y0, x1, y1, 0, y0, 0, y1, stops);   // changes with height
    const hgrad = (x, x0, x1, y0, y1, stops) => grad(x, x0, y0, x1, y1, x0, 0, x1, 0, stops);   // changes across
    const band = (x, c, half, a, y0, y1) => hgrad(x, c - half, c + half, y0, y1, [[0, 0], [0.25, a * 0.3], [0.5, a], [0.75, a * 0.3], [1, 0]]);
    const { len, w, h, at, skirting: sk, door: d, fixture: fx } = HALL;
    const own = (left) => at.filter((_, i) => (i % 2 === 0) === left);
    const wall = (left) => surf(len, h, 1024, 192, (x) => {
      vgrad(x, 0, len, 0, h, [[0, 0.03], [0.55, 0.05], [0.93, 0.1], [1, 0.07]]);   // the strip's fill, brighter towards the top
      own(left).forEach((zc) => { blob(x, zc, 1.85, 0.8, 1.2, 0.24); blob(x, zc, 2.78, 0.3, 0.32, 0.22); blob(x, zc, 0.25, 0.85, 0.35, 0.06); });   // the pool, its bright top under the fixture, light off the floor
      x.fillStyle = wc(0.1); x.fillRect(0, sk - 0.012, len, 0.012);   // the skirting's top edge catches the light
    }, (x) => {
      vgrad(x, 0, len, 0, 0.3, [[0, 0.45], [1, 0]]); vgrad(x, 0, len, h - 0.2, h, [[0, 0], [1, 0.35]]); hgrad(x, len - 0.35, len, 0, h, [[0, 0], [1, 0.3]]);
      x.fillStyle = wc(0.28); x.fillRect(0, 0, len, sk);   // the skirting, a shade darker
    });
    const floor = surf(w, len, 192, 1024, (x) => {
      band(x, w / 2, 0.55, 0.07, 0, len); band(x, w / 2, 0.09, 0.08, 0, len);   // the strip's soft reflection, polished
      at.forEach((zc, i) => { const l = i % 2 === 0; blob(x, l ? 0.28 : w - 0.28, zc + 0.15, 0.5, 0.95, 0.15); blob(x, l ? fx.in : w - fx.in, zc - 0.25, 0.09, 0.6, 0.12); });   // the pools, the fixtures' glints
      blob(x, w / 2, len - 0.4, 0.8, 0.9, 0.05);
    }, (x) => { hgrad(x, 0, 0.3, 0, len, [[0, 0.4], [1, 0]]); hgrad(x, w - 0.3, w, 0, len, [[0, 0], [1, 0.4]]); vgrad(x, 0, w, len - 0.25, len, [[0, 0], [1, 0.3]]); });
    const ceiling = surf(w, len, 192, 1024, (x) => {
      band(x, w / 2, 0.6, 0.09, 0, len); band(x, w / 2, 0.16, 0.08, 0, len);   // the strip's glow
      at.forEach((zc, i) => { const l = i % 2 === 0; blob(x, l ? fx.in : w - fx.in, zc, 0.22, 0.22, 0.12); });
    }, (x) => { hgrad(x, 0, 0.25, 0, len, [[0, 0.35], [1, 0]]); hgrad(x, w - 0.25, w, 0, len, [[0, 0], [1, 0.35]]); vgrad(x, 0, w, len - 0.2, len, [[0, 0], [1, 0.3]]); });
    const dx0 = w / 2 - d.w / 2, dx1 = w / 2 + d.w / 2, a = d.arch;
    const end = surf(w, h, 256, 296, (x) => {
      vgrad(x, 0, w, 0, h, [[0, 0.03], [0.6, 0.06], [1, 0.1]]);
      blob(x, w / 2, 2.5, 1.0, 0.9, 0.09);   // the strip's end lights the wall over the door
      x.fillStyle = wc(0.05); x.fillRect(dx0 - a, 0, a, d.h + a); x.fillRect(dx1, 0, a, d.h + a); x.fillRect(dx0, d.h, d.w, a);   // the architrave
      x.fillStyle = wc(0.08); x.fillRect(dx0 - a, d.h + a - 0.012, d.w + 2 * a, 0.012);   // its top edge
    }, (x) => {
      hgrad(x, 0, 0.25, 0, h, [[0, 0.3], [1, 0]]); hgrad(x, w - 0.25, w, 0, h, [[0, 0], [1, 0.3]]); vgrad(x, 0, w, 0, 0.3, [[0, 0.4], [1, 0]]); vgrad(x, 0, w, h - 0.2, h, [[0, 0], [1, 0.3]]);
      x.fillStyle = wc(0.28); x.fillRect(0, 0, dx0 - a, sk); x.fillRect(dx1 + a, 0, w - dx1 - a, sk);
    });
    const px0 = d.stile[0], px1 = d.w - d.stile[1], bv = 0.022;
    const leaf = surf(d.w, d.h, 192, 448, (x) => {
      vgrad(x, 0, d.w, 0, d.h, [[0, 0.03], [1, 0.08]]);
      d.panels.forEach(([y0, y1]) => { x.fillStyle = wc(0.09); x.fillRect(px0, y1 - bv, px1 - px0, bv); x.fillRect(px0, y0, bv, y1 - y0); x.fillStyle = wc(0.025); x.fillRect(px0 + bv, y0 + bv, px1 - px0 - 2 * bv, y1 - y0 - 2 * bv); });
    }, (x) => {
      d.panels.forEach(([y0, y1]) => { x.fillStyle = wc(0.45); x.fillRect(px0, y0, px1 - px0, bv); x.fillRect(px1 - bv, y0, bv, y1 - y0); });
      x.fillStyle = wc(0.7); x.fillRect(0, 0, 0.012, d.h); x.fillRect(d.w - 0.012, 0, 0.012, d.h); x.fillRect(0, d.h - 0.012, d.w, 0.012);   // the gap round the leaf
      vgrad(x, 0, d.w, 0, 0.4, [[0, 0.25], [1, 0]]);
    });
    return { left: wall(true), right: wall(false), floor, ceiling, end, leaf };
  }
  const PT = paintHall();

  // ---------- the surfaces: walls, floor, ceiling, the end wall and the door's leaf, one shader each ----------
  const gridTex = new THREE.CanvasTexture(document.createElement('canvas'));
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.minFilter = THREE.LinearMipmapLinearFilter; gridTex.anisotropy = ANISO; gridTex.flipY = false;
  const shared = {
    uGrid: { value: gridTex }, uPaper: { value: V3(0.96, 0.97, 0.98) }, uInk: { value: V3(0.07, 0.07, 0.07) }, uDress: { value: 0 }, uLights: { value: 0 },
    uLightCol: { value: V3(...LOOK.light) }, uGain: { value: LOOK.gain }, uShade: { value: LOOK.shade }, uG0: { value: V3() }, uCell5: { value: 100 },
    uGridSk: { value: LOOK.grid.sketch }, uGridDr: { value: LOOK.grid.dressed }, uGridCol: { value: rgb3(LOOK.grid.dressedColor) }, uGridHalf: { value: 0 },
  };
  const surfMat = (baseCss, tex, offset = true) => new THREE.ShaderMaterial({
    uniforms: { ...shared, uLight: { value: tex }, uBase: { value: rgb3(baseCss) }, uO: { value: V3() }, uAx: { value: V3() }, uAy: { value: V3() }, uSize: { value: new THREE.Vector2(1, 1) } },
    vertexShader: SURF_VS, fragmentShader: SURF_FS, side: THREE.DoubleSide, polygonOffset: offset, polygonOffsetFactor: offset ? 1 : 0, polygonOffsetUnits: offset ? 2 : 0,
  });
  const surfMesh = (mat, order = -2) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.renderOrder = order; scene.add(m); return m; };
  const S = { l: surfMesh(surfMat(LOOK.wall, PT.left)), r: surfMesh(surfMat(LOOK.wall, PT.right)), f: surfMesh(surfMat(LOOK.floor, PT.floor)), c: surfMesh(surfMat(LOOK.ceiling, PT.ceiling)), e: surfMesh(surfMat(LOOK.end, PT.end)) };
  const leaf = surfMesh(surfMat(LOOK.door, PT.leaf, false), -1);
  let gridKey = '';
  function makeGrid() {
    const T = Math.max(16, Math.round(5 * gu * dpr)), key = `${T}`; if (key === gridKey) return; gridKey = key;
    const c = document.createElement('canvas'); c.width = c.height = T; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, T, T);
    for (let k = 4; k >= 0; k--) { const v = k === 0 ? 255 : 128, p = Math.round(k * T / 5); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(0, p, T, 1); x.fillRect(p, 0, 1, T); }
    gridTex.image = c; gridTex.needsUpdate = true; shared.uGridHalf.value = 0.5 / T;
  }
  /** each surface's own axes: the painted light's origin and size (hall units in px), the grid's axes */
  function placeSurfaces() {
    shared.uG0.value.set(-W / 2, H / 2, 0); shared.uCell5.value = 5 * gu;
    const set = (m, o, ax, ay, sx, sy) => { const u = m.material.uniforms; u.uO.value.copy(o); u.uAx.value.copy(ax); u.uAy.value.copy(ay); u.uSize.value.set(sx, sy); };
    set(S.l, V3(0, FY, 0), V3(0, 0, -1), V3(0, 1, 0), L, CY - FY); set(S.r, V3(0, FY, 0), V3(0, 0, -1), V3(0, 1, 0), L, CY - FY);
    set(S.f, V3(-X, 0, 0), V3(1, 0, 0), V3(0, 0, -1), 2 * X, L); set(S.c, V3(-X, 0, 0), V3(1, 0, 0), V3(0, 0, -1), 2 * X, L);
    set(S.e, V3(-X, FY, 0), V3(1, 0, 0), V3(0, 1, 0), 2 * X, CY - FY);
    set(leaf, V3(-HALL.door.w / 2 * K, FY, 0), V3(1, 0, 0), V3(0, 1, 0), HALL.door.w * K, HALL.door.h * K);
  }

  // ---------- the dressing: the ceiling's light strip, a small fixture above each frame, the lock ----------
  const basic = (css, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(css), transparent: true, depthWrite: true, toneMapped: false, ...o });
  // the strip is cut round every label on screen, like the hairlines (its shader drops the pixels inside the cuts)
  const stripMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { uC: { value: V3() }, uA: { value: 1 }, uCut: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -1, -1)) }, uN: { value: 0 } },
    vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uC; uniform float uA; uniform vec4 uCut[8]; uniform int uN;
      void main(){ for (int i = 0; i < 8; i++) { if (i >= uN) break; vec4 r = uCut[i]; if (gl_FragCoord.x > r.x && gl_FragCoord.x < r.z && gl_FragCoord.y > r.y && gl_FragCoord.y < r.w) discard; }
        gl_FragColor = vec4(uC, uA); }` });
  const stripCol = (t) => stripMat.uniforms.uC.value.copy(rgb3(LOOK.strip[0])).lerp(rgb3(LOOK.strip[1]), t);
  let cutRects = [];
  /** the screen rects (CSS px) the strip is cut round, as device-pixel rects for its shader (origin bottom left) */
  function cutStrip(rects) {
    cutRects = rects.slice(0, 8); const u = stripMat.uniforms; u.uN.value = cutRects.length;
    cutRects.forEach((r, i) => u.uCut.value[i].set(r.l * dpr, (H - r.b) * dpr, r.r * dpr, (H - r.t) * dpr));
  }
  /** a screen segment's pieces outside the cut rects */
  function cut2D(A, B) {
    const dx = B[0] - A[0], dy = B[1] - A[1], cuts = [];
    for (const r of cutRects) { let t0 = 0, t1 = 1;
      const ok = [[-dx, A[0] - r.l], [dx, r.r - A[0]], [-dy, A[1] - r.t], [dy, r.b - A[1]]].every(([p, q]) => { if (Math.abs(p) < 1e-9) return q >= 0; const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } return true; });
      if (ok && t1 > t0) cuts.push([t0, t1]); }
    cuts.sort((p, q) => p[0] - q[0]); const keep = []; let at = 0;
    for (const [c0, c1] of cuts) { if (c0 > at) keep.push([at, c0]); at = Math.max(at, c1); }
    if (at < 1) keep.push([at, 1]);
    return keep.map(([a, b]) => [[A[0] + dx * a, A[1] + dy * a, A[2]], [A[0] + dx * b, A[1] + dy * b, B[2]]]);
  }
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), stripMat); strip.rotation.x = Math.PI / 2; strip.renderOrder = 0; scene.add(strip);
  const fixtures = HALL.at.map((zc, i) => {
    const g = new THREE.Group(), r = HALL.fixture.r, hh = HALL.fixture.h, fixMat = basic(LOOK.fixture), lensMat = basic(LOOK.lens[0]);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, hh, 20), fixMat); can.position.y = -hh / 2; g.add(can);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(r * 0.8, 20), lensMat); lens.rotation.x = Math.PI / 2; lens.position.y = -hh - 0.001; g.add(lens);
    g.userData = { zc, left: i % 2 === 0, fixMat, lensMat }; scene.add(g); return g;
  });
  // the lock, in hall units (scaled by K): its back plate, a lever above a keyhole
  const lock = new THREE.Group(); scene.add(lock);
  const lockMats = [];
  const lm = (css, map = null) => { const m = basic(css, map ? { map } : {}); m.userData.base = new THREE.Color(css); lockMats.push(m); return m; };
  {
    const plateTex = canvasTex(32, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#6E7278'); g.addColorStop(0.35, '#A4A8AE'); g.addColorStop(0.55, '#8D9197'); g.addColorStop(1, '#5E6267'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(255,255,255,.18)'); v.addColorStop(0.4, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(0,0,0,.18)'); x.fillStyle = v; x.fillRect(0, 0, w, h); }, true);
    const side = lm('#3E4146'), front = lm('#FFFFFF', plateTex);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.26, 0.01), [side, side, side, side, front, side]); plate.position.z = 0.005; lock.add(plate);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 24), lm('#8C9096')); rose.rotation.x = Math.PI / 2; rose.position.set(0, 0.05, 0.016); lock.add(rose);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 16), lm('#7C8086')); neck.rotation.x = Math.PI / 2; neck.position.set(0, 0.05, 0.04); lock.add(neck);
    const lt = lm('#D0D3D8'), lf = lm('#A3A7AD'), lb = lm('#4B4F55'), le = lm('#7A7E84');
    const lever = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.02), [le, le, lt, lb, lf, lb]); lever.position.set(-0.055, 0.05, 0.06); lock.add(lever);
    const holeM = lm('#08090A');
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0085, 20), holeM); hole.position.set(0, -0.05, 0.0102); lock.add(hole);
    const sh = new THREE.Shape(); sh.moveTo(-0.003, -0.05); sh.lineTo(0.003, -0.05); sh.lineTo(0.005, -0.079); sh.lineTo(-0.005, -0.079); sh.closePath();
    const slot = new THREE.Mesh(new THREE.ShapeGeometry(sh), holeM); slot.position.z = 0.0102; lock.add(slot);
  }
  lock.renderOrder = 1;

  // the static hairlines: the hall's edges, its skirting, the door, its panels and the lock's plate (cut round every label)
  const edgeMat = lmat({ opacity: LOOK.edges.sketch });
  const edges = new LineSegments2(segGeo([]), edgeMat); edges.renderOrder = 1; scene.add(edges);
  let staticBase = [];
  let knockKey = '';

  // the X-ray hand-over: a blue screen, then page 3's first frame (the lock's hairlines, a second copy, no depth test)
  const xScene = new THREE.Scene(), xHolder = new THREE.Group(); xHolder.matrixAutoUpdate = false; xScene.add(xHolder);
  const xQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Vector3(23 / 255, 63 / 255, 115 / 255) }, uA: { value: 0 } },   // #173F73 as it is (sRGB, straight to the canvas)
    transparent: true, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA); }' }));
  xQuad.frustumCulled = false; const xQuadScene = new THREE.Scene(); xQuadScene.add(xQuad);
  let xLock = null, lockParts = null;
  const door = { lockState: 'idle' };
  /** the real "Cutaway Lock" (lock3d.js), only for the hand-over: page 3 starts on exactly this frame */
  async function loadLock(b = base) {
    if (door.lockState !== 'idle') return; door.lockState = 'loading';
    try {
      lockParts = await loadLockParts(b);
      if (!lockParts) { door.lockState = 'missing'; return; }
      xLock = lockParts.build({ inside: true });
      xLock.solids.forEach((m) => { m.visible = false; });
      xLock.lineMats.forEach((m) => { m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)); m.linewidth = Math.max(1, Math.round(dpr)); m.depthTest = false; lineMats.push(m); });
      xLock.xray(1); xLock.setKey(0); xLock.setFaceHeight(hX); xHolder.add(xLock.root);
      door.lockState = 'ready'; render(lastQ, true);
    } catch (e) { console.warn('[dive] lock', e); door.lockState = 'missing'; }
  }

  // ---------- the drawings: a blueprint sheet each, one hairline frame, on a hinge ----------
  const blobMap = blobTex();
  const frames = FRAMES.map((F, i) => {
    const d = F.draw;
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = i % 2 === 0;
    const mats = [];
    const own = (m, b = 1) => { m.transparent = true; m.userData.base = b; mats.push(m); return m; };
    const sheetMat = own(new THREE.MeshBasicMaterial({ toneMapped: false }));
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sheetMat); sheet.position.z = ZS; sheet.renderOrder = 1; panel.add(sheet);
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
  const layerZ = (li, spread) => ZT + li * 0.6 + li * LAYERS.dz * spread;
  /** the sheet at its size (drawing units): the drawing's segments, its frame and the still on it */
  function buildSheet(f) {
    f.sheet.scale.set(f.MW, f.MH, 1);
    const pos = new Float32Array(f.d.segs.length * 6);
    f.d.segs.forEach(([a, b, c, e], k) => pos.set([U(f, a), V(f, b), ZL, U(f, c), V(f, e), ZL], k * 6));
    const n = f.drawing.geometry.instanceCount; f.drawing.geometry.dispose(); f.drawing.geometry = segGeo(pos); f.drawing.geometry.instanceCount = n;
    const x0 = -f.MW / 2, x1 = f.MW / 2, y0 = -f.MH / 2, y1 = f.MH / 2, z = ZF;
    f.frameSegs = [x0, y0, z, x1, y0, z, x1, y0, z, x1, y1, z, x1, y1, z, x0, y1, z, x0, y1, z, x0, y0, z];
    f.frame.geometry.dispose(); f.frame.geometry = segGeo(f.frameSegs);
    if (f.still) { const rg = f.d.region; f.still.position.set(U(f, rg.u + rg.w / 2), V(f, rg.v + rg.h / 2), ZF); }
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
      p.pivot.position.set(u, v, ZT + 6); p.pivot.scale.setScalar(1);
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
  const turnAt = (u) => { const Kf = [[0, 0], [0.4, Math.PI], [0.6, Math.PI], [1, 2 * Math.PI]]; for (let i = 1; i < Kf.length; i++) if (u <= Kf[i][0]) return lerp(Kf[i - 1][1], Kf[i][1], ease(span(u, Kf[i - 1][0], Kf[i][0]))); return 2 * Math.PI; };

  let loaded = null, envP = null;
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await Promise.all([document.fonts.load('500 56px "DM Mono"'), document.fonts.load('300 56px "DM Mono"'), document.fonts.load('420 56px Newsreader')]); } catch (e) {}
    rebuildLabels();
    envP = studio(renderer, b).then((e) => { phoneScene.environment = e; }).catch(() => {});
    const jobs = [envP];
    if (f5) jobs.push((async () => {
      const img = await loadImage(`${b}${f5.F.real}`);
      if (img) { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; t.flipY = img.flipped === false; t.needsUpdate = true; f5.still.material.map = t; f5.still.material.needsUpdate = true; renderer.initTexture(t); f5.stillOK = true; }
    })());
    await Promise.all(jobs);
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    Object.values(PT).forEach((t) => { try { renderer.initTexture(t); } catch (e) {} });
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
        const box = inkBox(L0), clear = l0 ? Math.min(30, (uu / 2 + 2) / l0.kMid * 1.3) : dm.size;   // never more than the drawing's own clear space (CLEAR): a small frame keeps its measurement on its line
        const parts = dimParts(dm, box.x1 - box.x0, clear);
        parts.segs.forEach(([a, b, c, e]) => { segs.push(U(f, a), V(f, b), ZL, U(f, c), V(f, e), ZL); segsD.push([a, b, c, e]); });
        ls.push({ t: '000.0 PX', x: parts.label.x, y: parts.label.y + (parts.label.inline ? (box.b - box.t) / 2 - box.b : 0), size: dm.size, anchor: 'middle', at: dm.at, faint: true, light: true, dim: dm });
        f.dimAt = Math.min(f.dimAt, dm.at);
      });
      f.dimSegs = segs; f.dimSegsD = segsD; f.dims.geometry.dispose(); f.dims.geometry = segGeo(segs);
      f.labels = ls.map((l) => { const m = labelMesh(l, fpx(l.size), ANISO, l.dim ? '0000.0 PX' : ''); m.position.set(U(f, m.userData.cx), V(f, m.userData.cy), ZT); m.renderOrder = 4; m.visible = false; f.panel.add(m); return m; });
      if (loaded) f.labels.forEach((m) => { try { renderer.initTexture(m.material.map); } catch (e) {} });   // uploaded now, not on first sight mid-walk
      if (f.layers && l0) {
        const k = clamp(kMax * dpr * 1.15, 1, 2048 / LAYERS.LW);
        f.layers.forEach((L_, li) => {
          if (Math.abs(L_.k - k) < 1e-3 && L_.dark === dark) return;
          L_.k = k; L_.dark = dark; L_.canvas.width = Math.round(LAYERS.LW * k); L_.canvas.height = Math.round(LAYERS.LH * k);
          paintLayer(L_.canvas.getContext('2d'), li, k, { paper, ink, graphite });
          L_.tex.dispose(); L_.tex.needsUpdate = true;
          if (loaded) try { renderer.initTexture(L_.tex); } catch (e) {}
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
      const t = `${Math.hypot(B[0] - A[0], B[1] - A[1]).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} PX`;
      if (t === m.userData.text) return;
      m.userData.text = t; m.userData.l = { ...m.userData.l, t };
      drawLabel(m.userData.canvas, m.userData.l, m.userData.fontPx, t); m.material.map.needsUpdate = true;
    });
  }

  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.setStyle('#888'); } return c; };
  function colours() {
    frames.forEach((f) => {
      f.sheet.material.color.copy(col(BLUE)).lerp(col(dark ? '#1B1C1D' : '#F4F5F7'), f.real);
      f.drawMat.color.copy(col(WHITE)); f.dimMat.color.copy(col(WHITE)); f.frameMat.color.copy(col(FRAME_INK));
      f.labels.forEach((m) => { m.material.color.copy(col(WHITE)); m.userData.alpha = m.userData.faint ? 0.62 : 1; });
    });
  }
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    const wasDark = dark;
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F6F7F9'; graphite = cs.getPropertyValue('--graphite').trim() || '#66696E';
    shared.uPaper.value.copy(rgb3(paper)); shared.uInk.value.copy(rgb3(ink));
    if (wasDark !== dark && fL) fL.layers.forEach((Lr) => { Lr.k = 0; });
    colours();
  }

  // ---------- layout ----------
  let lay = null, lastStrip = 0, lastTb = 0;
  /** opts: u (the cell), strip (its height), noTitleblock */
  function layout(w, h, opts = {}) {
    W = w; H = h;
    const u = opts.u || grid.u; gu = u;
    P = lensP(W, H);
    // the hall's mouth covers the screen: one hall unit is K px there; the eye in the middle of its height
    K = Math.max(W / HALL.w, H / HALL.h); X = HALL.w / 2 * K; FY = -HALL.eye * K; CY = (HALL.h - HALL.eye) * K; L = HALL.len * K;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    // the canvas exactly as large as its drawing buffer in device pixels (a resampled buffer shimmers)
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    lineMats.forEach((m) => { m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)); m.linewidth = Math.max(1, Math.round(dpr)); });
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = 0.05 * K; camera.far = L + P + 2 * K; camera.updateProjectionMatrix();
    const desktop = W >= 1024, N = Math.round(W / u);
    const strip_ = opts.strip ?? (document.getElementById('strip')?.offsetHeight || 2 * u);
    const tb = document.querySelector('.titleblock'), tbr = !opts.noTitleblock && tb?.getClientRects().length ? tb.getBoundingClientRect() : null;
    const tbTop = tbr && tbr.height ? Math.min(H, tbr.top) : Math.floor(H / u) * u;
    const rT = Math.ceil((strip_ + u) / u - 1e-6), rB = Math.floor((tbTop - u) / u + 1e-6);   // a cell under the strip, a cell over the title block
    // the opening line: its box as wide as its words need (whole cells), so its backing always holds them (round 8b fix)
    openEl.style.left = `${(desktop ? 5 : 1) * u}px`; openEl.style.top = `${(rT + (desktop ? 3 : 1)) * u}px`;
    { const maxC = desktop ? N - 10 : N - 2, lead = openEl.querySelector('.dive__open-l');
      openEl.classList.remove('is-wrap'); openEl.style.width = 'max-content';
      const need = Math.ceil((lead.getBoundingClientRect().width + 1) / u);
      const wrap = need > maxC; openEl.classList.toggle('is-wrap', wrap);
      openEl.style.width = `${Math.max(desktop ? 20 : 0, Math.min(maxC, wrap ? maxC : need)) * u}px`; }
    makeGrid(); placeSurfaces();

    // each frame at its fixed place. The moment it is read closest (Dc: fully open, square to you, the camera Dc from
    // its hinge) is the nearest at which: its hinge is 0.6 cell inside the screen's side, its sheet at most half the
    // screen's height, the sheet and its label between the strip and the title block. Phones: the label under the
    // sheet, from its hinge side, as wide as the sheet or 12 cells; desktop: the label beside it on its inner side, its
    // backing's foot on the sheet's foot, its words clear of the ceiling's strip.
    const yc = (HALL.hang - HALL.eye) * K;
    lay = frames.map((f, i) => {
      const el = labEls[i], d = f.d, mg = MOUNT * d.w;
      f.MW = d.w + 2 * mg; f.MH = d.h + 2 * mg; f.mgx = f.mgy = mg;
      const A = f.MW / f.MH;
      let hs = HALL.frameH, ws = hs * A; if (ws > HALL.frameMaxW) { ws = HALL.frameMaxW; hs = ws / A; }
      const Ws = ws * K, Hs = hs * K; f.k = Ws / f.MW;
      buildSheet(f);
      const hd = HALL.at[i] * K - Ws / 2;   // the hinge's depth from the mouth (its near edge)
      const beside = desktop;
      // where the label goes on a phone: under the sheet, or over it where that lets the frame be read closer
      const lo = (lr, where) => {
        const lab = (lr + 2.5) * u;
        const v = [X * P / Math.max(1, W / 2 - 0.6 * u), Hs * P / (0.48 * H)];
        v.push((yc + Hs / 2) * P / Math.max(1, H / 2 - rT * u - (where === 'over' ? lab : 0)));
        v.push((Hs / 2 - yc) * P / Math.max(1, rB * u - H / 2 - (where === 'under' ? lab : 0)));
        return Math.max(...v);
      };
      const rowsAt = (lw) => { el.style.width = `${lw * u}px`; return Math.max(1, Math.ceil(el.offsetHeight / u - 1e-3)); };
      let lw = beside ? (W >= 1800 && H >= 1000 ? 18 : 16) : Math.max(12, N - 4), lr = rowsAt(lw), where = beside ? 'beside' : 'under', Dc = lo(lr, where);
      if (!beside) {
        const over = lo(lr, 'over'); if (over < Dc) { where = 'over'; Dc = over; }
      } else {
        // its words clear of the strip's far end (above the vanishing point); a wider label has fewer rows
        const clear = (D, rows) => (Hs / 2 - yc) * P / D - (rows + 1) * u >= -(CY * P / Math.max(1, D - hd + L - 0.3 * K)) + 0.5 * u;
        const room = (D) => Math.floor(((W / 2 + (X - Ws) * P / D) - 2 * u) / u) - 3;   // cells from its inner edge to the screen's far side
        while (!clear(Dc, lr) && lw < Math.min(26, room(Dc))) { lw += 2; lr = rowsAt(lw); Dc = lo(lr, where); }
      }
      el.style.width = `${lw * u}px`;
      const Dg = Math.max(0.35 * K, Dc - FOLD_LEN * K);
      const kMax = f.k * P / Math.max(Dg, 0.7 * Dc), kMid = f.k * P / Dc;
      return { Ws, Hs, hd, zc: HALL.at[i] * K, Dc, Dread: Dc + HOLD_LEN * K, Dopen: Dc + (HOLD_LEN + OPEN_LEN) * K, Dg, lw, lr, beside, where, kMax, kMid,
        label: { width: lw * u, height: lr * u } };
    });
    frames.forEach((f, i) => {
      const l = lay[i];
      f.pivot.position.set((f.left ? -1 : 1) * X, yc, -l.hd);
      f.panel.position.set((f.left ? 1 : -1) * f.MW / 2 * f.k, 0, 0); f.panel.scale.setScalar(f.k); f.pivot.rotation.set(0, (f.left ? 1 : -1) * Math.PI / 2, 0);
      // the label's words box and its backing (a cell round the words), in the sheet's own plane (open: +x is towards
      // the middle for a left frame, away from it for a right one); c = one cell at the moment it is read closest
      const c = u * l.Dc / P / f.k, hw = f.MW / 2, hh = f.MH / 2, lwU = l.lw * c, lrU = l.lr * c;
      let x0, x1, bx0, bx1, yT, yB, byT, byB;
      if (l.beside) {
        if (f.left) { x0 = hw + 2 * c; x1 = x0 + lwU; bx0 = hw + c; bx1 = x1 + c; } else { x1 = -hw - 2 * c; x0 = x1 - lwU; bx1 = -hw - c; bx0 = x0 - c; }
        yB = -hh + c; yT = yB + lrU; byB = -hh; byT = yT + c;
      } else {
        if (f.left) { x0 = -hw + c; x1 = x0 + lwU; bx0 = -hw; bx1 = x1 + c; } else { x1 = hw - c; x0 = x1 - lwU; bx1 = hw; bx0 = x0 - c; }
        if (l.where === 'over') { yB = hh + 1.5 * c; yT = yB + lrU; byB = hh + 0.5 * c; byT = yT + c; }
        else { yT = -hh - 1.5 * c; yB = yT - lrU; byT = -hh - 0.5 * c; byB = yB - c; }
      }
      l.labLocal = [[x0, yT], [x1, yT], [x1, yB], [x0, yB]].map(([x, y]) => V3(x, y, ZT));
      l.backLocal = [[bx0, byT], [bx1, byT], [bx1, byB], [bx0, byB]].map(([x, y]) => V3(x, y, ZT));
    });
    // the walk: from the mouth (the camera P in front of it) to standing in front of the shut door: the door's top under
    // the strip and its foot over the title block (or at least on the screen), never stopping before the last frame
    // has folded back
    lastStrip = strip_; lastTb = tbTop;
    const dr = HALL.door;
    const Dtop = (dr.h - HALL.eye) * K * P / Math.max(1, H / 2 - strip_ - u), Dwide = (dr.w / 2 + dr.arch) * K * P / Math.max(1, W / 2 - u);
    const DfootTb = HALL.eye * K * P / Math.max(1, tbTop - u - H / 2), DfootScr = HALL.eye * K * P / (H / 2);
    const l5 = lay[lay.length - 1], Dcap = L - (l5.hd - l5.Dg) - 0.1 * K;
    const want = Math.max(Dtop, Dwide, DfootTb), fall = Math.max(Dtop, Dwide, DfootScr);
    Dend = Math.min(Dcap, want <= Dcap ? want : fall);
    z0 = P; zEnd = -(L - Dend);
    // the hand-over: page 3's first frame (lock3d.js endFaceHeight), straight ahead of where the walk ended
    hX = 0.3 * K; Dx = hX * P / Math.max(1, endFaceHeight(H, { strip: strip_, tbTop, u })); xLock?.setFaceHeight(hX);
    // the tests' stops: each frame fully open, then at its closest
    STOPS.length = 0; lay.forEach((l) => STOPS.push([qAtD(l, l.Dread), qAtD(l, l.Dc)]));
    lock.scale.setScalar(K);
    rebuildLabels();
    depthNow = -1; sizeHall(Math.max(0.0001, ease(span(lastQ, ...WAY_IN))), true);
    placePhones();
    theme();
  }
  /** the scroll position (q) at which the camera is D from a frame's hinge */
  const qAtD = (l, D) => WALK[0] + (z0 - (D - l.hd)) / Math.max(1, z0 - zEnd) * (WALK[1] - WALK[0]);

  /** the camera walks straight down the middle, at one steady pace while you scroll */
  const camZ = (q) => lerp(z0, zEnd, span(q, ...WALK));

  /** the hall's surfaces and hairlines for a depth (the way in draws it into depth from the screen) */
  let depthNow = -1;
  function sizeHall(t, force = false) {
    const depth = Math.max(0.5, L * t); if (!force && Math.abs(depth - depthNow) < 0.01) return; depthNow = depth;
    const hh = CY - FY, ym = (CY + FY) / 2;
    S.l.scale.set(depth, hh, 1); S.l.position.set(-X, ym, -depth / 2); S.l.rotation.set(0, Math.PI / 2, 0);
    S.r.scale.set(depth, hh, 1); S.r.position.set(X, ym, -depth / 2); S.r.rotation.set(0, -Math.PI / 2, 0);
    S.f.scale.set(2 * X, depth, 1); S.f.position.set(0, FY, -depth / 2); S.f.rotation.set(-Math.PI / 2, 0, 0);
    S.c.scale.set(2 * X, depth, 1); S.c.position.set(0, CY, -depth / 2); S.c.rotation.set(Math.PI / 2, 0, 0);
    S.e.scale.set(2 * X, hh, 1); S.e.position.set(0, ym, -depth);
    const dr = HALL.door, dw = dr.w / 2 * K, a = dr.arch * K, dh = FY + dr.h * K;
    leaf.scale.set(dr.w * K, dr.h * K, 1); leaf.position.set(0, FY + dr.h * K / 2, -depth + 1);
    lock.position.set(dr.lock.x * K, FY + dr.lock.y * K, -depth + 1.5);
    strip.scale.set(HALL.strip * K, Math.max(1, depth - 0.6 * K), 1); strip.position.set(0, CY - 0.004 * K, -depth / 2);
    fixtures.forEach((g) => { g.scale.setScalar(K); g.position.set((g.userData.left ? -1 : 1) * (HALL.w / 2 - HALL.fixture.in) * K, CY, -g.userData.zc * K); });
    // the hairlines: the four long edges, the end wall's outline, the skirting, the door (its opening and architrave),
    // the leaf's two panels, the lock's back plate
    const z1 = -depth, E = [];
    const cs = [[-X, FY], [X, FY], [X, CY], [-X, CY]];
    cs.forEach(([x, y]) => E.push([x, y, 0, x, y, z1]));
    cs.forEach(([x, y], c) => { const [nx, ny] = cs[(c + 1) % 4]; E.push([x, y, z1, nx, ny, z1]); });
    const sk = FY + HALL.skirting * K;
    E.push([-X, sk, 0, -X, sk, z1], [X, sk, 0, X, sk, z1], [-X, sk, z1, -dw - a, sk, z1], [dw + a, sk, z1, X, sk, z1]);
    const zd = z1 + 2, rectU = (xa, xb, y1, z) => [[xa, FY, z, xa, y1, z], [xa, y1, z, xb, y1, z], [xb, y1, z, xb, FY, z]];
    E.push(...rectU(-dw, dw, dh, zd), ...rectU(-dw - a, dw + a, dh + a, zd));
    const rr = (xa, ya, xb, yb, z) => E.push([xa, ya, z, xb, ya, z], [xb, ya, z, xb, yb, z], [xb, yb, z, xa, yb, z], [xa, yb, z, xa, ya, z]);
    dr.panels.forEach(([p0, p1]) => rr(-dw + dr.stile[0] * K, FY + p0 * K, dw - dr.stile[1] * K, FY + p1 * K, zd));
    const lx = dr.lock.x * K, ly = FY + dr.lock.y * K;
    rr(lx - 0.0275 * K, ly - 0.13 * K, lx + 0.0275 * K, ly + 0.13 * K, z1 + 1.5 + 0.0105 * K);
    staticBase = E; knockKey = '';
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

  /** a frame's state for a camera distance D from its hinge: how far out it is (0 flat on the wall .. 1 square to you),
   *  how much of its drawing is drawn, its label's opacity */
  function stateAt(l, D) {
    const swing = ease(span(D, l.Dopen, l.Dread)) * (1 - ease(span(D, l.Dc, l.Dg)));
    const drawn = ease(span(D, l.Dopen - 0.1 * K, l.Dread + 0.25 * K)) * (1 - ease(span(D, l.Dc, l.Dc - 0.6 * (l.Dc - l.Dg))));   // drawn as it opens, gone again as it folds back
    const lab = span(D, l.Dread + 0.15 * K, l.Dread) * (1 - span(D, l.Dc, l.Dc - 0.25 * (l.Dc - l.Dg)));
    return { swing, op: 1, drawn, lab };
  }
  function pose(f, s) {
    f.pivot.rotation.y = (f.left ? 1 : -1) * (Math.PI / 2 - SWING * s.swing);
    f.pivot.updateMatrixWorld(true);
  }

  /** q: 0..1 over the dive. Returns what page 1 needs and what the checks measure */
  let out = null, lastQ = 0, labQuads = [], stillMode = false, look = { dress: 0, lights: 0 };
  const cTmp = new THREE.Color(), cA = new THREE.Color(), cB = new THREE.Color();
  function render(q, again = false) {
    if (!lay) return null;
    lastQ = q; if (!again) lastScrollRender = performance.now();
    const st = stillMode;
    const T = st ? 1 : ease(span(q, ...WAY_IN));
    const dress = st ? 1 : ease2(span(q, ...DRESS)), lights = st ? 1 : ease2(span(q, ...LIGHTS)), fin = st ? 1 : ease2(span(q, ...FRAMES_IN));
    look = { dress, lights, frames: fin };
    sizeHall(Math.max(0.0001, T));
    canvas.style.opacity = st ? '1' : String(clamp(span(q, ...WAY_IN) / 0.18));
    shared.uDress.value = dress; shared.uLights.value = lights;
    // the hairlines: ink in the sketch, faint and light once dressed
    edgeMat.color.copy(cA.set(ink)).lerp(cB.set(LOOK.edges.dressedColor), dress);
    edgeMat.opacity = lerp(LOOK.edges.sketch, LOOK.edges.dressed, dress) * clamp(T / 0.3 + 0.0001);
    // the strip, the fixtures and the lock
    strip.visible = lights > 0.004 && T >= 1; stripCol(lights); stripMat.uniforms.uA.value = clamp(lights * 3);
    fixtures.forEach((g) => { const { fixMat, lensMat } = g.userData; g.visible = lights > 0.004 && T >= 1;
      fixMat.opacity = clamp(lights * 3); lensMat.opacity = fixMat.opacity; lensMat.color.copy(cA.set(LOOK.lens[0])).lerp(cB.set(LOOK.lens[1]), lights); });
    const lf = lerp(0.5, 1, lights);
    lock.visible = dress > 0.004; lockMats.forEach((m) => { m.color.copy(m.userData.base).multiplyScalar(lf); m.opacity = dress; });
    const t = camZ(q);
    camera.position.set(0, 0, st ? z0 : t); camera.rotation.set(0, 0, 0); camera.updateMatrixWorld();
    const info = [], rects = [];
    labQuads = [];
    frames.forEach((f, i) => {
      const l = lay[i], D = camera.position.z + l.hd, s = st ? { swing: 1, op: 1, drawn: 1, lab: 0 } : stateAt(l, D);
      pose(f, s);
      const op = T >= 1 ? fin : 0;
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
        layerPlaces(f.spread).forEach((p, li) => { const L_ = f.layers[li]; L_.mesh.position.set(U(f, p.x + LAYERS.LW / 2), V(f, p.y + LAYERS.LH / 2), layerZ(li, f.spread)); L_.mesh.visible = f.pivot.visible && s.drawn > 0.01; L_.mesh.material.opacity = op * s.drawn; });
      }
      if (f.still) {
        const live = phones.state === 'ready' && !st;
        // drawn -> real as it comes fully open, then the phones turn as you walk up to it
        const realT = !st && (f.stillOK || live) ? ease2(span(D, l.Dread + 0.3 * K, l.Dread)) * (1 - ease2(span(D, l.Dc, l.Dc - 0.6 * (l.Dc - l.Dg)))) : 0;
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
            b.position.set(p.home.u + 3, p.home.v - 5, ZT + 3); b.scale.set(wv * 256 / 136, sz.y * 512 / 392, 1);
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
          const c = gu / 2 + 2; rects.push({ l: r.l - gu - c, r: r.r + gu + c, t: r.t - gu - c, b: r.b + gu + c });   // its words, half a cell clear (the backing reaches a cell past them)
        } else el.classList.remove('on');
      }
      if (f.pivot.visible) {
        const q4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => P3(f, x, y).slice(0, 2));
        const quad = q4(-f.MW / 2, f.MH / 2, f.MW / 2, -f.MH / 2);
        info.push({ i, swing: s.swing, op, drawn: s.drawn, lab: s.lab, quad, D, ratio: f.d.w / f.d.h, real: f.real, share: Math.max(...quad.map((p) => p[1])) - Math.min(...quad.map((p) => p[1])) });
      } else info.push({ i, swing: 0, op: 0, drawn: s.drawn, lab: 0, quad: null, D, ratio: f.d.w / f.d.h, real: f.real, share: 0 });
    });
    // whatever is farther than a label and behind it (another frame, a fixture) steps back while the label is up: the
    // label stands in front of it (TYPE_RULES: no shape under a word)
    const under = (b, own = -1) => { let h = 0; if (!b) return 0; labQuads.forEach((lq) => { if (lq.i === own) return; const r = lq.rect, c = gu * 1.5; if (r.l - c < b.x + b.w && r.r + c > b.x && r.t - c < b.y + b.h && r.b + c > b.y) h = Math.max(h, lq.op); }); return h; };
    frames.forEach((f, i) => {
      f.hide = 0; const q4 = info[i].quad; if (!q4 || !labQuads.length) return;
      const xs = q4.map((p) => p[0]), ys = q4.map((p) => p[1]);
      const h = under({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, i);
      if (h <= 0) return; f.hide = h; const k = 1 - h;
      f.mats.forEach((m) => { m.opacity *= k; }); [f.frameMat, f.drawMat, f.dimMat].forEach((m) => { m.opacity *= k; }); f.labels.forEach((m) => { m.material.opacity *= k; });
      if (f === f5 && phones.root.visible) phones.mats.forEach((m) => { m.opacity *= k; });
      if (h > 0.98) { f.pivot.visible = false; if (f === f5) phones.root.visible = false; }
    });
    fixtures.forEach((g) => { if (!g.visible) return; const h = under(screenBox(g)); if (h > 0) { g.userData.fixMat.opacity *= 1 - h; g.userData.lensMat.opacity *= 1 - h; if (h > 0.98) g.visible = false; } g.userData.hide = h; });
    // the lock steps back wherever a label's words would come within a cell of it (TYPE_RULES: no shape under a word)
    let lockHidden = 0;
    if (lock.visible) {
      const lb = screenBox(lock);
      if (lb) labQuads.forEach((lq) => { const r = lq.rect, c = gu; if (r.l - c < lb.x + lb.w && r.r + c > lb.x && r.t - c < lb.y + lb.h && r.b + c > lb.y) lockHidden = Math.max(lockHidden, lq.op); });
      if (lockHidden > 0) lockMats.forEach((m) => { m.opacity = dress * (1 - lockHidden); });
    }
    door.lockHidden = lockHidden;
    const openOn = !st && q >= OPEN_AT[0] && q <= OPEN_AT[1] && T >= 1;
    openEl.classList.toggle('on', openOn);
    if (openOn) { const c = gu / 2 + 2, r = openEl.getBoundingClientRect(); rects.push({ l: r.left - gu - c, r: r.right + gu + c, t: r.top - gu - c - gu / 2, b: r.bottom + gu + c + gu / 2 }); }   // its backing, half a cell clear (it settles from below)
    knockout(rects); cutStrip(rects);
    renderer.autoClear = true;
    renderer.render(scene, camera);
    const xt = xLock && !st ? ease2(span(q, ...XRAY)) : 0;
    if (xt > 0.001) {
      xQuad.material.uniforms.uA.value = xt; xLock.setOpacity(xt);
      xHolder.matrix.makeTranslation(0, 0, camera.position.z - Dx); xHolder.matrixWorldNeedsUpdate = true;
      renderer.autoClear = false; renderer.render(xQuadScene, camera); renderer.render(xScene, camera); renderer.autoClear = true;
    }
    const warmDraw = phones.warmNow && !phones.root.visible && f5;
    if (warmDraw) { phones.root.visible = true; phones.mats.forEach((m) => { m.opacity = 0.002; }); }
    if (phones.warm && phones.root.visible) phones.warm = false;
    if (phones.root.visible) {
      f5.panel.updateMatrixWorld(true); phones.root.matrix.copy(f5.panel.matrixWorld); phones.root.matrixWorldNeedsUpdate = true;
      renderer.autoClear = false; renderer.render(phoneScene, camera); renderer.autoClear = true;
    }
    if (warmDraw) phones.root.visible = false;
    const ph = { state: phones.state, mix: phones.mix, yaw: phones.yaw, visible: phones.root.visible };
    const lockBox = lock.visible ? screenBox(lock) : null;
    const o = { info, q, t, phones: ph, open: T >= 1, tr: T, dress, lights, frames: fin, walked: span(q, ...WALK),
      door: { lock: door.lockState, box: lockBox, distance: (camera.position.z + L) / K }, xray: xt, labels: labQuads };
    if (!again) out = o; else if (out) Object.assign(out, o);
    if (again) onAgain?.(out);
    return out;
  }
  let onAgain = null;
  function screenBox(obj) {
    const bx = new THREE.Box3().setFromObject(obj), cs = [];
    if (bx.isEmpty()) return null;
    for (const x of [bx.min.x, bx.max.x]) for (const y of [bx.min.y, bx.max.y]) for (const z of [bx.min.z, bx.max.z]) cs.push(proj(x, y, z));
    if (cs.some((c) => c[2] < camera.near)) return null;
    const xs = cs.map((c) => c[0]), ys = cs.map((c) => c[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }

  /** for the type check (TYPE_RULES.md): every drawn line, shape and in-drawing word on screen now, in CSS px. The
   *  frames' edges and the labels' backings count as drawn lines; the ceiling's strip as a line and the fixtures and
   *  the lock as shapes; a drawing's own words are checked against its own lines in its own plane (inPlane()) */
  function drawn() {
    const D = { lines: [], shapes: [], texts: [], fails: [] };
    if (!lay || !out) return D;
    if (out.xray > 0.5) { if (xLock) { const b = screenBox(xLock.root); if (b) D.shapes.push({ ...b, tag: 'lock:xray' }); } return D; }
    const segIn = (A, B) => A[2] > camera.near && B[2] > camera.near;
    const occ = [];
    frames.forEach((f) => { if (!f.pivot.visible || f.sheet.material.opacity < 0.9 || f.hide > 0.1) return; f.pivot.updateMatrixWorld(true);
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
    if (strip.visible && stripMat.uniforms.uA.value > 0.05) {
      const zA = -0.3 * K, zB = -(depthNow - 0.3 * K), y = CY - 0.004 * K, cz = Math.min(zA, camera.position.z - camera.near * 1.5);
      if (cz > zB) { const A = proj(0, y, cz), B = proj(0, y, zB); if (segIn(A, B)) cut2D(A, B).forEach(([a, b]) => visible(a, b, 'hall:strip')); }
    }
    fixtures.forEach((g, i) => { if (!g.visible || g.userData.hide > 0.5) return; const b = screenBox(g); if (b && b.x < W && b.x + b.w > 0 && b.y < H && b.y + b.h > 0) D.shapes.push({ ...b, tag: `hall:fixture${i + 1}` }); });
    if (lock.visible && (1 - (door.lockHidden || 0)) * look.dress > 0.05) { const b = screenBox(lock); if (b) D.shapes.push({ ...b, tag: 'door:lock' }); }
    // the labels' frosted backings (a rounded box: its four sides)
    labQuads.forEach((lq) => { if (lq.op < 0.05) return; const b = lq.back; for (let k = 0; k < 4; k++) { const A = b[k], B = b[(k + 1) % 4]; D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `hall${lq.i + 1}lab:backing` }); } });
    // the sheets nearer than each drawing (its hinge's distance), for occlusion
    const sheetQ = frames.map((f) => (f.pivot.visible && f.sheet.material.opacity > 0.9 && !(f.hide > 0.1) ? [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => P3(f, sx * f.MW / 2, sy * f.MH / 2)) : null));
    const dist = frames.map((f, i) => camera.position.z + lay[i].hd);
    frames.forEach((f, i) => {
      if (!f.pivot.visible || f.hide > 0.5) return;
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
          const quad = [[b.x0, b.t], [b.x1, b.t], [b.x1, b.b], [b.x0, b.b]].map(([x, y]) => P3(f, U(f, x), V(f, y)).slice(0, 2)), xs2 = quad.map((p) => p[0]), ys2 = quad.map((p) => p[1]);
          const sz = Math.abs(P3(f, U(f, b.x0), V(f, l.y))[1] - P3(f, U(f, b.x0), V(f, l.y - l.size))[1]);
          D.texts.push({ x: Math.min(...xs2), y: Math.min(...ys2), w: Math.max(...xs2) - Math.min(...xs2), h: Math.max(...ys2) - Math.min(...ys2), quad, t: l.t, tag: `${g}:t${k}`, size: l.size / (LAYERS.S), screenSize: sz / gu });
        });
        if (f.layers && f.layers[0].mesh.visible) layerShapes(f, g, D);
      } else if (f.still && f.d.region) {
        const rg = f.d.region, A = P3(f, U(f, rg.u), V(f, rg.v)), B = P3(f, U(f, rg.u + rg.w), V(f, rg.v + rg.h));
        D.shapes.push({ x: Math.min(A[0], B[0]), y: Math.min(A[1], B[1]), w: Math.abs(B[0] - A[0]), h: Math.abs(B[1] - A[1]), tag: `${g}:phones` });
      }
      if (nearer.length) {
        // its lines: only the stretches outside every nearer (opaque) sheet
        const ls = D.lines.splice(L0);
        ls.forEach((l) => {
          const ts = [0, 1], dx = l.x2 - l.x1, dy = l.y2 - l.y1;
          for (const q of nearer) for (let k2 = 0; k2 < 4; k2++) { const p = q[k2], n2 = q[(k2 + 1) % 4], ex = n2[0] - p[0], ey = n2[1] - p[1], den = dx * ey - dy * ex;
            if (Math.abs(den) < 1e-9) continue; const t = ((p[0] - l.x1) * ey - (p[1] - l.y1) * ex) / den, u2 = ((p[0] - l.x1) * dy - (p[1] - l.y1) * dx) / den; if (t > 0 && t < 1 && u2 >= 0 && u2 <= 1) ts.push(t); }
          ts.sort((a2, b2) => a2 - b2);
          for (let k2 = 0; k2 + 1 < ts.length; k2++) { const a2 = ts[k2], b2 = ts[k2 + 1]; if (b2 - a2 < 1e-5) continue; const m = (a2 + b2) / 2;
            if (!hidden(l.x1 + dx * m, l.y1 + dy * m)) D.lines.push({ ...l, x1: l.x1 + dx * a2, y1: l.y1 + dy * a2, x2: l.x1 + dx * b2, y2: l.y1 + dy * b2 }); }
        });
        // its sheet and boxes: kept only where no nearer sheet covers any of them (a word on the nearer sheet sits over it)
        const ss = D.shapes.splice(S0); ss.forEach((sh) => { const q = sh.quad || [[sh.x, sh.y], [sh.x + sh.w, sh.y], [sh.x + sh.w, sh.y + sh.h], [sh.x, sh.y + sh.h]]; if (!q.some((p) => hidden(p[0], p[1])) && !nearer.some((nq) => nq.some((p) => inQuad(q, p[0], p[1])))) D.shapes.push(sh); });
        const ts = D.texts.splice(T0); ts.forEach((t2) => { if (!hidden(t2.x + t2.w / 2, t2.y + t2.h / 2)) D.texts.push(t2); });
      }
    });
    return D;
  }
  /** canvas 2's layers for the check: each layer's visible outline (its top strip's sides, or all four for the front
   *  one) and its words */
  function layerShapes(f, g, D) {
    const places = layerPlaces(f.spread), n = places.length;
    places.forEach((p, li) => {
      const it = layerItems(li), z = layerZ(li, f.spread);
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
        const sz = Math.abs(W3(x0, t.y)[1] - W3(x0, t.y - t.size)[1]);
        const quad = [[x0, t.y - m.actualBoundingBoxAscent * s], [x0 + w, t.y - m.actualBoundingBoxAscent * s], [x0 + w, t.y + m.actualBoundingBoxDescent * s], [x0, t.y + m.actualBoundingBoxDescent * s]].map(([x, y]) => W3(x, y).slice(0, 2));
        const xs = quad.map((q) => q[0]), ys = quad.map((q) => q[1]);
        D.texts.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad, t: t.t, tag: `${g}:L${li}t${k}`, size: t.size / LAYERS.S, screenSize: sz / gu });
      });
      it.B.forEach((b) => { const quad = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => W3(x, y).slice(0, 2)), xs = quad.map((q) => q[0]), ys = quad.map((q) => q[1]); D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad, tag: `${g}:L${li}box` }); });
    });
  }

  /** the drawings' readability (readcheck.py): for each frame at its closest fully open moment and at the last moment it
   *  is still out from the wall, every word's size on screen in cells (the type scale's smallest step is 0.375), the
   *  sheet's height as a share of the screen's, its closest approach to the screen's edge, and its words' clear space in
   *  its own plane */
  function readability() {
    if (!lay) return null;
    const keep = lastQ, res = [];
    frames.forEach((f, i) => {
      const l = lay[i];
      const at = (D) => {
        camera.position.set(0, 0, D - l.hd); camera.updateMatrixWorld();
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
      const pad = Math.min(...l.backLocal.map((v) => { const a3 = v.clone().applyMatrix4(f.panel.matrixWorld), b3 = v.clone().add(new THREE.Vector3(0, gu / f.k, 0)).applyMatrix4(f.panel.matrixWorld); const A = proj(a3.x, a3.y, a3.z), B = proj(b3.x, b3.y, b3.z); return Math.abs(B[1] - A[1]) / gu; }));
      clear.labelPad = +pad.toFixed(3);
      let lastOut = l.Dc; for (let D = l.Dc; D > l.Dg - 1; D -= Math.max(1, K * 0.01)) { if (stateAt(l, D).swing >= 0.05) lastOut = D; else break; }
      const last = at(lastOut);
      res.push({ i: i + 1, key: f.F.key, cells: [+(l.Ws * P / l.Dc / gu).toFixed(1), +(l.Hs * P / l.Dc / gu).toFixed(1)], size: [+(l.Ws / K).toFixed(3), +(l.Hs / K).toFixed(3)], label: [l.lw, l.lr, l.where], Dc: +(l.Dc / K).toFixed(3), closest: close, lastVisible: last, inPlane: clear });
    });
    render(keep, true);
    return { W, H, u: gu, P, K, smallest: 0.375, frames: res, worstSize: Math.min(...res.map((r) => r.closest.minSize ?? 9)), worstShare: Math.max(...res.map((r) => r.lastVisible.share)) };
  }
  /** a drawing's words against its own lines (and its frame, and its layers' edges), in screen px at the moment it is
   *  read closest: at least half a cell (TYPE_RULES rule 2) */
  function inPlane(f) {
    const near = (b, s) => {   // closest points between box b {x0, x1, t, b} and segment s [ax, ay, bx, by]
      const [ax, ay, bx, by] = s, inB = (x, y) => x >= b.x0 && x <= b.x1 && y >= b.t && y <= b.b;
      if (inB(ax, ay) || inB(bx, by)) return [[ax, ay], [ax, ay], 0];
      const cl = (x, y) => [clamp(x, b.x0, b.x1), clamp(y, b.t, b.b)];
      const onS = (x, y) => { const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy; const k = L2 ? clamp(((x - ax) * dx + (y - ay) * dy) / L2) : 0; return [ax + k * dx, ay + k * dy]; };
      let best = null;
      const tryP = (p, q) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (!best || d < best[2]) best = [p, q, d]; };
      tryP(cl(ax, ay), [ax, ay]); tryP(cl(bx, by), [bx, by]);
      [[b.x0, b.t], [b.x1, b.t], [b.x1, b.b], [b.x0, b.b]].forEach((c) => tryP(c, onS(...c)));
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
        const it = layerItems(li), z = layerZ(li, f.spread), toScr = (x, y) => P3(f, U(f, p.x + x), V(f, p.y + y), z).slice(0, 2);
        const own = it.H.concat(...it.B.map((bx) => [[bx.x, bx.y, bx.x + bx.w, bx.y], [bx.x + bx.w, bx.y, bx.x + bx.w, bx.y + bx.h], [bx.x + bx.w, bx.y + bx.h, bx.x, bx.y + bx.h], [bx.x, bx.y + bx.h, bx.x, bx.y]]));
        it.T.forEach((t) => {
          mctx.font = t.serif ? `420 100px Newsreader` : `500 100px "DM Mono"`; if ('letterSpacing' in mctx) mctx.letterSpacing = t.serif ? '0px' : '6px';
          const m = mctx.measureText(t.t), s = t.size / 100, w = m.width * s, x0 = t.anchor === 'middle' ? t.x - w / 2 : t.x;
          const box = { x0, x1: x0 + w, t: t.y - m.actualBoundingBoxAscent * s, b: t.y + m.actualBoundingBoxDescent * s };
          check(box, own, toScr, t.t);
          if (li < n - 1) { const q = places[li + 1], zq = layerZ(li + 1, f.spread), dy = q.y - p.y;
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
    strip.visible = true; lock.visible = true; fixtures.forEach((g) => { g.visible = true; });
    try { renderer.compile(scene, camera); } catch (e) {}
    renderer.render(scene, camera);
    render(q);
  }
  /** reduced motion: one still picture of the dressed hall, lit, every frame open, seen from its mouth (a JPEG) */
  async function still(w, h, opts = {}) {
    await load();
    layout(w, h, { strip: 0, noTitleblock: true, ...opts });
    stillMode = true; render(WALK[0]); const url = canvas.toDataURL('image/jpeg', 0.9); stillMode = false;
    return url;
  }
  function reset() {}
  return { layout, render, load, warm, still, reset, theme, sizeLayers, LAYERS, loadPhones, loadLock, drawn, readability, look: LOOK.id, stops: STOPS,
    closeAt: () => (lay ? lay.map((l) => qAtD(l, l.Dc) * DIVE) : null), openAt: () => (lay ? lay.map((l) => qAtD(l, l.Dread) * DIVE) : null),
    phones: () => phones.state, frames: () => frames, lay: () => lay, P: () => P, L: () => L, K: () => K, hall: () => ({ W, H, P, K, X, L, z0, zEnd, Dend: Dend / K, Dx }),
    door: () => ({ lockState: door.lockState, Dend, zEnd }), endFrame: () => ({ P, hL: hX, Dend: Dx }), camera: () => camera, renderer: () => renderer, lockParts: () => lockParts, onBeat: (fn) => { onAgain = fn; } };
}

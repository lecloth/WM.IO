// Page 2: the hallway. Part 5 "Hallway rebuild" (26 Nov): pass 1, the space; "Hallway pass 2" (26 Nov): the frames and
// the phone framing.
// - Fixed proportions on every screen (HALL): about 2.6 wide, 3 high and 19 long, the five frames at about 4, 7, 10,
//   13 and 16 along it, alternating left, right, left, right, left. A screen only changes how much of it the lens shows
//   (one true perspective), never its shape. Pass 2: portrait screens use a narrower lens (HALL_LENS), so the walls and
//   frames fill more of a phone.
// - The sequence as you scroll: the hallway stretches out as a white sketch (the page's grid drawn into depth; a dark
//   sketch in dark mode) -> it dresses up and goes dark -> the spotlights and the ceiling's strip come on -> the frames
//   appear, lit -> you walk, and each frame opens as you reach it. The sketch's grid stays faintly on the dressed walls.
// - The dark hall (hall-looks.js): light and shine are painted into the surfaces once (paintHall), no live lights or
//   shadows. Pass 2's lighting order: the lit art is the brightest thing on screen, then its plaque; the ceiling's strip
//   is a soft line. The only live light is the studio environment on the door's brass lock.
// - Scrolling is walking: the camera moves along the hall only while you scroll, at one steady pace. Pass 2: as a frame
//   opens, the camera slides (never turns) towards it, so the frame, its plaque and the caption band sit between the
//   strip and the title block; on portrait screens sideways too, so the open frame is centred and about two thirds of
//   the screen's width. As the frame folds back, the camera slides back to the middle.
// - Each frame (pass 2: a real black float frame: a thin black moulding with depth, its top edge catching the light, the
//   blueprint floating inside it with a dark shadow gap all round, a soft shadow on the wall) hangs on its wall by a
//   hinge at its near edge, swings out fully to 90 degrees (square to you) as you reach it, is held open while you come
//   closer, then folds back to the wall as you pass. About a third of the hall's height. Under each, a small light
//   plaque exactly as wide as the frame (the title and the FIG line); the open frame's title and story line show in a
//   dark caption band at the bottom of the screen.
// - The end: a wall facing you, the door centred in it (about 0.9 x 2.1), two panels, shut. Its lock (pass 2): the real
//   Cutaway Lock in polished brass (the site's one warm tone), on the door's right edge strip at handle height. The walk
//   ends standing in front of the shut door; the hallway hands over to page 3 as before: the screen turns blue and page
//   3's first frame (the lock in X-ray) fades in (XRAY).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { FRAMES, OPENING, dimParts, MOUNT } from './corridor-drawings.js';
import { LOOKS, HALL as LOOK_ID } from './hall-looks.js';
import { grid } from '../engine/grid.js';
import { studio } from '../phones/studio.js';
import { loadLockParts, endFaceHeight } from '../page03/lock3d.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/** the site's lens (page 3 starts on the hallway's last frame with it): 50 degrees across the narrower side, at most 66
 *  degrees across (the camera distance P of the screen plane) */
export const LENS = { narrow: 50, across: 66 };
export function lensP(W, H) {
  const t = (deg) => Math.tan(deg * Math.PI / 360);
  return Math.max(Math.min(W, H) / 2 / t(LENS.narrow), W / 2 / t(LENS.across));
}
/** the hallway's lens (pass 2): on a portrait screen a narrower one, 36 degrees across its width; otherwise the site's */
export const HALL_LENS = { portrait: 36 };
export function hallP(W, H) { return H > W ? Math.max(lensP(W, H), W / 2 / Math.tan(HALL_LENS.portrait * Math.PI / 360)) : lensP(W, H); }

/** the hallway in its own units (about metres), the same on every screen */
export const HALL = {
  w: 2.6, h: 3, len: 19, eye: 1.5,
  at: [4, 7, 10, 13, 16],                  // the frames' middles along it; left, right, left, right, left
  frameH: 1.0, frameMaxW: 1.0, hang: 1.55, // a third of its height; never past 1.0 wide (so it never reaches the middle); its middle 1.55 up
  // the float frame: the moulding's face width and depth, the shadow gap round the blueprint
  frame: { mould: 0.032, depth: 0.05, gap: 0.026 },
  door: { w: 0.9, h: 2.1, arch: 0.07, stile: [0.12, 0.14], panels: [[0.15, 0.82], [1.18, 1.95]], lock: { x: 0.385, y: 1.0, face: 0.13 } },
  skirting: 0.1, strip: 0.035, fixture: { r: 0.05, h: 0.06 },
};
/** a frame's sizes in hall units: the sheet (blueprint and its blue margin) and the frame round it (outer) */
function frameDims(d) {
  const mg = MOUNT * d.w, MW = d.w + 2 * mg, MH = d.h + 2 * mg, A = MW / MH, e = 2 * (HALL.frame.mould + HALL.frame.gap);
  let oh = HALL.frameH, sh = oh - e, sw = sh * A, ow = sw + e;
  if (ow > HALL.frameMaxW) { ow = HALL.frameMaxW; sw = ow - e; sh = sw / A; oh = sh + e; }
  return { mg, MW, MH, sw, sh, ow, oh };
}
const DIMS = FRAMES.map((F) => frameDims(F.draw));

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
const BLUE = '#173F73', WHITE = '#FFFFFF';
const PLAQUE = '#A8ACB2';                        // the plaques' light plate (the same in light and dark mode)
// offsets off the frame's back, in drawing units: the sheet, its lines, its words (the moulding is deeper: FD)
const ZS = 8, ZL = ZS + 3, ZT = ZS + 4;

// a label inside a drawing (mono, white) as a small texture on a plane, in drawing units (y down), at its baseline.
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

/** a frame's plaque (pass 2): only the title and the FIG line; its light plate is drawn in WebGL, as wide as the frame */
export const labelHTML = (f) => `<div class="dive__lab"><p class="dive__lab-t display gt">${f.caption}</p><p class="dive__lab-k mono gt gt-h">${f.fig}</p></div>`;
/** the caption band's line for a frame: its title and its story line (a draft, flagged) */
export const bandHTML = (f) => `<div class="dive__band"><p class="dive__band-t display gt">${f.caption}</p>` +
  `<p class="dive__band-s gt gt-h"><span class="ph" data-draft>Draft</span>${f.story}</p></div>`;
/** reduced motion: the plaque's words and the story line under the still drawing */
export const captionHTML = (f) => `<div class="dive__lab"><p class="dive__lab-t display gt">${f.caption}</p><p class="dive__lab-k mono gt gt-h">${f.fig}</p>` +
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

/** root: the paper behind the hallway; top: the hallway in WebGL, the opening line, the plaques' words, the caption band. */
export function createDive(root, top, { base = '' } = {}) {
  const LOOK = LOOKS[LOOK_ID];
  root.innerHTML = `<div class="dive__win"></div>`;
  top.innerHTML = `<canvas class="dive__gl"></canvas>${openingHTML()}<div class="dive__labs">${FRAMES.map(labelHTML).join('')}</div>` +
    `<div class="dive__bands">${FRAMES.map(bandHTML).join('')}</div>`;
  root.dataset.look = top.dataset.look = LOOK.id;
  const canvas = top.querySelector('.dive__gl');
  const openEl = top.querySelector('.dive__open'), labEls = [...top.querySelectorAll('.dive__lab')], bandsEl = top.querySelector('.dive__bands'), bandEls = [...top.querySelectorAll('.dive__band')];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const ANISO = renderer.capabilities.getMaxAnisotropy();
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = LOOK.exposure;   // only the brass lock is tone mapped
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  camera.rotation.order = 'YXZ';
  const xCam = new THREE.PerspectiveCamera(50, 1, 1, 1e5);   // the hand-over's camera: page 3's lens
  const lineMats = [];
  const lmat = (o) => { const m = new LineMaterial({ linewidth: Math.max(1, Math.round(dpr)), worldUnits: false, transparent: true, toneMapped: false, ...o }); lineMats.push(m); return m; };
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr.length ? arr : [0, 0, 0, 0, 0, 0]); return g; };
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

  // world units are CSS px at the screen plane (the hall's mouth, z = 0); K px to one hall unit (layout)
  let W = 1, H = 1, P = 1, K = 1, X = 1, FY = -1, CY = 1, L = 1, ink = '#121212', paper = '#F6F7F9', dark = false, gu = 20;
  let z0 = 1, zEnd = 0, Dend = 1, hX = 1, Dx = 1, portrait = false, bandR = null;

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
    const { len, w, h, at, skirting: sk, door: d } = HALL;
    // pass 2: the light is over each frame's open place (in front of its hinge, its middle ow / 2 off the wall)
    const openAt = at.map((zc, i) => ({ left: i % 2 === 0, z: zc - DIMS[i].ow / 2, x: DIMS[i].ow / 2 }));
    const own = (left) => at.map((zc, i) => ({ zc, i })).filter(({ i }) => (i % 2 === 0) === left);
    const wall = (left) => surf(len, h, 1024, 192, (x) => {
      vgrad(x, 0, len, 0, h, [[0, 0.025], [0.55, 0.035], [0.93, 0.06], [1, 0.045]]);   // the strip's fill (a soft line now), a little brighter towards the top
      own(left).forEach(({ zc, i }) => { blob(x, zc, HALL.hang + 0.05, DIMS[i].ow * 0.8, 0.75, 0.09); blob(x, zc - DIMS[i].ow / 2 - 0.1, 0.25, 0.5, 0.3, 0.05); });   // a soft halo round the frame where it hangs; light off the floor by its open place
      x.fillStyle = wc(0.08); x.fillRect(0, sk - 0.012, len, 0.012);   // the skirting's top edge catches the light
    }, (x) => {
      vgrad(x, 0, len, 0, 0.3, [[0, 0.45], [1, 0]]); vgrad(x, 0, len, h - 0.2, h, [[0, 0], [1, 0.35]]); hgrad(x, len - 0.35, len, 0, h, [[0, 0], [1, 0.3]]);
      x.fillStyle = wc(0.28); x.fillRect(0, 0, len, sk);   // the skirting, a shade darker
    });
    const floor = surf(w, len, 192, 1024, (x) => {
      band(x, w / 2, 0.55, 0.035, 0, len); band(x, w / 2, 0.08, 0.03, 0, len);   // the strip's soft reflection, polished
      openAt.forEach((o) => { const cx = o.left ? o.x : w - o.x; blob(x, cx, o.z - 0.25, 0.55, 0.6, 0.16); });   // each frame's spotlight pool, under its open place
      blob(x, w / 2, len - 0.4, 0.8, 0.9, 0.05);
    }, (x) => { hgrad(x, 0, 0.3, 0, len, [[0, 0.4], [1, 0]]); hgrad(x, w - 0.3, w, 0, len, [[0, 0], [1, 0.4]]); vgrad(x, 0, w, len - 0.25, len, [[0, 0], [1, 0.3]]); });
    const ceiling = surf(w, len, 192, 1024, (x) => {
      band(x, w / 2, 0.5, 0.035, 0, len); band(x, w / 2, 0.1, 0.03, 0, len);   // the strip's glow, dimmed
      openAt.forEach((o) => { const cx = o.left ? o.x : w - o.x; blob(x, cx, o.z - 0.3, 0.2, 0.2, 0.1); });   // round each fixture
    }, (x) => { hgrad(x, 0, 0.25, 0, len, [[0, 0.35], [1, 0]]); hgrad(x, w - 0.25, w, 0, len, [[0, 0], [1, 0.35]]); vgrad(x, 0, w, len - 0.2, len, [[0, 0], [1, 0.3]]); });
    const dx0 = w / 2 - d.w / 2, dx1 = w / 2 + d.w / 2, a = d.arch;
    const end = surf(w, h, 256, 296, (x) => {
      vgrad(x, 0, w, 0, h, [[0, 0.03], [0.6, 0.05], [1, 0.07]]);
      blob(x, w / 2, 2.5, 1.0, 0.9, 0.07);   // the strip's end lights the wall over the door
      x.fillStyle = wc(0.05); x.fillRect(dx0 - a, 0, a, d.h + a); x.fillRect(dx1, 0, a, d.h + a); x.fillRect(dx0, d.h, d.w, a);   // the architrave
      x.fillStyle = wc(0.08); x.fillRect(dx0 - a, d.h + a - 0.012, d.w + 2 * a, 0.012);   // its top edge
    }, (x) => {
      hgrad(x, 0, 0.25, 0, h, [[0, 0.3], [1, 0]]); hgrad(x, w - 0.25, w, 0, h, [[0, 0], [1, 0.3]]); vgrad(x, 0, w, 0, 0.3, [[0, 0.4], [1, 0]]); vgrad(x, 0, w, h - 0.2, h, [[0, 0], [1, 0.3]]);
      x.fillStyle = wc(0.28); x.fillRect(0, 0, dx0 - a, sk); x.fillRect(dx1 + a, 0, w - dx1 - a, sk);
    });
    const px0 = d.stile[0], px1 = d.w - d.stile[1], bv = 0.022;
    const leaf = surf(d.w, d.h, 192, 448, (x) => {
      vgrad(x, 0, d.w, 0, d.h, [[0, 0.03], [1, 0.07]]);
      blob(x, d.w - d.stile[1] / 2, d.lock.y, 0.16, 0.2, 0.06);   // a little light on the lock's strip
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

  // ---------- the dressing: the ceiling's light strip (a soft line), a small fixture over each frame's open place ----------
  const basic = (css, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(css), transparent: true, depthWrite: true, toneMapped: false, ...o });
  // the strip is cut round every word on screen, like the hairlines (its shader drops the pixels inside the cuts)
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
  /** a screen segment's pieces outside the rects (default: the strip's cuts) */
  function cut2D(A, B, rects = cutRects) {
    const dx = B[0] - A[0], dy = B[1] - A[1], cuts = [];
    for (const r of rects) { let t0 = 0, t1 = 1;
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
    g.userData = { zc, i, left: i % 2 === 0, fixMat, lensMat }; scene.add(g); return g;
  });

  // ---------- the door's lock (pass 2): the real Cutaway Lock in polished brass, on the leaf's right edge strip at
  // handle height, its face to you (lock3d.js; hall units, the holder scaled by K). The studio light is its only light ----------
  const lock = new THREE.Group(); scene.add(lock);
  lock.renderOrder = 1;
  const brass = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D8B26A'), metalness: 1, roughness: 0.26, envMapIntensity: 0.75, transparent: true, opacity: 0 });
  brass.envMapRotation.set(0, 1.5 * Math.PI, 0);   // turned so the face catches the studio's soft boxes (straight on, it reflects their dark side)
  let doorLock = null;

  // the static hairlines: the hall's edges, its skirting, the door and its panels (cut round every word on screen)
  const edgeMat = lmat({ opacity: LOOK.edges.sketch });
  const edges = new LineSegments2(segGeo([]), edgeMat); edges.renderOrder = 1; scene.add(edges);
  let staticBase = [];
  let knockKey = '';

  // the X-ray hand-over: a blue screen, then page 3's first frame (the lock's hairlines, a second copy, no depth test),
  // seen through page 3's own lens so the seam is exact
  const xScene = new THREE.Scene(), xHolder = new THREE.Group(); xHolder.matrixAutoUpdate = false; xScene.add(xHolder);
  const xQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Vector3(23 / 255, 63 / 255, 115 / 255) }, uA: { value: 0 } },   // #173F73 as it is (sRGB, straight to the canvas)
    transparent: true, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: 'uniform vec3 uC; uniform float uA; void main(){ gl_FragColor = vec4(uC, uA); }' }));
  xQuad.frustumCulled = false; const xQuadScene = new THREE.Scene(); xQuadScene.add(xQuad);
  let xLock = null, lockParts = null;
  const door = { lockState: 'idle' };
  /** the real "Cutaway Lock" (lock3d.js): in brass on the door, and in X-ray for the hand-over */
  async function loadLock(b = base) {
    if (door.lockState !== 'idle') return; door.lockState = 'loading';
    try {
      lockParts = await loadLockParts(b);
      if (!lockParts) { door.lockState = 'missing'; return; }
      xLock = lockParts.build({ inside: true });
      xLock.solids.forEach((m) => { m.visible = false; });
      xLock.lineMats.forEach((m) => { m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)); m.linewidth = Math.max(1, Math.round(dpr)); m.depthTest = false; lineMats.push(m); });
      xLock.xray(1); xLock.setKey(0); xLock.setFaceHeight(hX); xHolder.add(xLock.root);
      doorLock = lockParts.build({ inside: false });
      doorLock.root.traverse((o) => { if (o.isLineSegments2) o.visible = false; });
      doorLock.solids.forEach((m) => { m.geometry = toCreasedNormals(m.geometry, Math.PI / 5); m.material = brass; m.renderOrder = 1; });
      doorLock.setFaceHeight(HALL.door.lock.face);
      lock.add(doorLock.root);
      try { renderer.compile(scene, camera); } catch (e) {}
      door.lockState = 'ready'; render(lastQ, true);
    } catch (e) { console.warn('[dive] lock', e); door.lockState = 'missing'; }
  }

  // ---------- the frames: a blueprint sheet each, in a black float frame, on a hinge, a plaque under it ----------
  const blobMap = blobTex(), shadowMap = blobTex(0.36, 0.34, 30, 26);
  // the spotlight on the art: brightest a little above its middle, falling off to its edges
  const spotMap = canvasTex(128, 128, (x, w, h) => { const g = x.createRadialGradient(w * 0.5, h * 0.36, 0, w * 0.5, h * 0.42, w * 0.78); g.addColorStop(0, '#fff'); g.addColorStop(0.55, '#e2e2e2'); g.addColorStop(1, '#a8a8a8'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, true);
  // the moulding's face: near-black, a shade lighter at the top, its top edge catching the light
  const mouldMap = canvasTex(64, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#24262B'); g.addColorStop(0.12, '#17191C'); g.addColorStop(1, '#0B0C0E'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const t = x.createLinearGradient(0, 0, 0, 6); t.addColorStop(0, 'rgba(206,211,220,1)'); t.addColorStop(0.45, 'rgba(150,155,164,.85)'); t.addColorStop(1, 'rgba(60,63,70,0)'); x.fillStyle = t; x.fillRect(0, 0, w, 7);
  }, true);
  const frames = FRAMES.map((F, i) => {
    const d = F.draw, dims = DIMS[i];
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = i % 2 === 0;
    const mats = [];
    const own = (m, b = 1) => { m.transparent = true; m.userData.base = b; mats.push(m); return m; };
    const mesh = (geo, m, order, parent = panel) => { const o = new THREE.Mesh(geo, m); o.renderOrder = order; parent.add(o); return o; };
    const backing = mesh(new THREE.PlaneGeometry(1, 1), own(basic('#060708')), 1);
    const shadow = mesh(new THREE.PlaneGeometry(1, 1), own(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shadowMap, depthWrite: false, toneMapped: false }), 0.85), 2);
    const sheetMat = own(new THREE.MeshBasicMaterial({ map: spotMap, toneMapped: false }));
    const sheet = mesh(new THREE.PlaneGeometry(1, 1), sheetMat, 3); sheet.position.z = ZS;
    const ringMat = own(new THREE.MeshBasicMaterial({ map: mouldMap, toneMapped: false }));
    const sideMat = own(basic('#141518')), innerMat = own(basic('#0A0B0C'));
    const ring = mesh(new THREE.BufferGeometry(), ringMat, 6);
    const bars = [0, 1, 2, 3].map((k) => mesh(new THREE.BoxGeometry(1, 1, 1), [sideMat, sideMat, k === 1 ? innerMat : sideMat, k === 0 ? innerMat : sideMat, sideMat, sideMat], 5));
    const plateMat = own(basic(PLAQUE));
    const plate = mesh(new THREE.PlaneGeometry(1, 1), plateMat, 3);
    const drawMat = lmat({ opacity: 1 });
    const drawing = new LineSegments2(segGeo([]), drawMat); drawing.geometry.instanceCount = 0; drawing.renderOrder = 4; panel.add(drawing);
    const dimMat = lmat({ opacity: 1 });
    const dims_ = new LineSegments2(segGeo([]), dimMat); dims_.visible = false; dims_.renderOrder = 4; panel.add(dims_);
    const fills = (d.fills || []).map((c) => { const m = own(new THREE.MeshBasicMaterial({ color: 0xffffff, depthWrite: false, toneMapped: false }), c.alpha); const o = mesh(new THREE.CircleGeometry(c.r, 24), m, 5); o.userData = c; return o; });
    // its soft shadow on the wall: where it hangs, narrowing to the hinge as it opens
    const wsMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blobMap, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
    const wshadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wsMat); wshadow.renderOrder = -1; scene.add(wshadow);
    return { F, d, i, left, dims, MW: dims.MW, MH: dims.MH, mgx: dims.mg, mgy: dims.mg, k: 1, pivot, panel, backing, shadow, sheet, ring, bars, plate, drawing, dims_, dimSegs: [], dimAt: Infinity, labels: [], fills, wshadow, wsMat,
      drawMat, dimMat, mats, sheetMat, plateMat, FD: 1, OX: 1, OY: 1 };
  });
  const U = (f, u) => -f.MW / 2 + f.mgx + u, V = (f, v) => f.MH / 2 - f.mgy - v;
  /** the frame at its size (drawing units): the drawing's segments, the sheet, the shadow gap, the moulding, the plate */
  function buildFrame(f, l) {
    const s = K / f.k, g = HALL.frame.gap * s, m = HALL.frame.mould * s, FD = HALL.frame.depth * s;
    const ix = f.MW / 2 + g, iy = f.MH / 2 + g, ox = ix + m, oy = iy + m;
    f.FD = FD; f.OX = ox; f.OY = oy;
    f.sheet.scale.set(f.MW, f.MH, 1);
    f.backing.scale.set(2 * ix, 2 * iy, 1); f.backing.position.z = 0.6;
    f.shadow.scale.set(f.MW + 2.2 * g, f.MH + 2.2 * g, 1); f.shadow.position.set(0, -0.35 * g, 1.2);
    const pos = new Float32Array(f.d.segs.length * 6);
    f.d.segs.forEach(([a, b, c, e], k) => pos.set([U(f, a), V(f, b), ZL, U(f, c), V(f, e), ZL], k * 6));
    const n = f.drawing.geometry.instanceCount; f.drawing.geometry.dispose(); f.drawing.geometry = segGeo(pos); f.drawing.geometry.instanceCount = n;
    f.fills.forEach((o) => { o.position.set(U(f, o.userData.cx), V(f, o.userData.cy), ZL + 0.2); });
    // the moulding: its face (a ring, the top edge lit) and its four bars (their depth)
    const sh = new THREE.Shape(); sh.moveTo(-ox, -oy); sh.lineTo(ox, -oy); sh.lineTo(ox, oy); sh.lineTo(-ox, oy); sh.closePath();
    const hole = new THREE.Path(); hole.moveTo(-ix, -iy); hole.lineTo(-ix, iy); hole.lineTo(ix, iy); hole.lineTo(ix, -iy); hole.closePath(); sh.holes.push(hole);
    const rg = new THREE.ShapeGeometry(sh), uv = rg.attributes.uv, p = rg.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (p.getX(k) + ox) / (2 * ox), (p.getY(k) + oy) / (2 * oy));
    f.ring.geometry.dispose(); f.ring.geometry = rg; f.ring.position.z = FD;
    const bd = FD - 0.5;
    [[0, oy - m / 2, 2 * ox, m], [0, -oy + m / 2, 2 * ox, m], [-ox + m / 2, 0, m, 2 * iy], [ox - m / 2, 0, m, 2 * iy]].forEach(([x, y, w, h], k) => { f.bars[k].scale.set(w, h, bd); f.bars[k].position.set(x, y, bd / 2); });
    // the plaque's plate: right under the frame, exactly as wide, at the frame's front
    const pt = -oy - l.plateGap, ph = l.plateH;
    f.plate.scale.set(2 * ox, ph, 1); f.plate.position.set(0, pt - ph / 2, FD * 0.5);
  }

  /** the drawings' own labels (and dimension lines, if a drawing has them) */
  function rebuildLabels() {
    frames.forEach((f, i) => {
      const l0 = lay?.[i], kMax = l0 ? l0.kMax : 1, uu = gu || 20;
      const key = `${kMax.toFixed(4)}|${f.MW.toFixed(3)}|${f.MH.toFixed(3)}|${uu}|${dpr}|${l0 ? l0.kMid.toFixed(4) : ''}`;
      if (f.labelKey === key) return;
      f.labelKey = key;
      f.labels.forEach((m) => { f.panel.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
      const fpx = (size) => clamp(Math.ceil(size * kMax * dpr * 1.2), 20, 160);
      const ls = f.d.labels.filter((l) => l.t);
      const segs = [], segsD = []; f.dimAt = Infinity;
      (f.d.dims || []).forEach((dm) => {
        const L0 = { t: '000.0 PX', x: 0, y: 0, size: dm.size, anchor: 'middle', light: true };
        const box = inkBox(L0), clear = l0 ? Math.min(30, (uu / 2 + 2) / l0.kMid * 1.3) : dm.size;
        const parts = dimParts(dm, box.x1 - box.x0, clear);
        parts.segs.forEach(([a, b, c, e]) => { segs.push(U(f, a), V(f, b), ZL, U(f, c), V(f, e), ZL); segsD.push([a, b, c, e]); });
        ls.push({ t: '000.0 PX', x: parts.label.x, y: parts.label.y + (parts.label.inline ? (box.b - box.t) / 2 - box.b : 0), size: dm.size, anchor: 'middle', at: dm.at, faint: true, light: true, dim: dm });
        f.dimAt = Math.min(f.dimAt, dm.at);
      });
      f.dimSegs = segs; f.dimSegsD = segsD; f.dims_.geometry.dispose(); f.dims_.geometry = segGeo(segs);
      f.labels = ls.map((l) => { const m = labelMesh(l, fpx(l.size), ANISO, l.dim ? '0000.0 PX' : ''); m.position.set(U(f, m.userData.cx), V(f, m.userData.cy), ZT); m.renderOrder = 5; m.visible = false; m.userData.alpha = m.userData.faint ? 0.62 : 1; f.panel.add(m); return m; });
      if (loaded) f.labels.forEach((m) => { try { renderer.initTexture(m.material.map); } catch (e) {} });   // uploaded now, not on first sight mid-walk
    });
  }
  /** a live measurement (a dimension line's length on the visitor's screen); no drawing has one since pass 2 */
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

  let loaded = null, envP = null;
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await Promise.all([document.fonts.load('500 56px "DM Mono"'), document.fonts.load('420 56px Newsreader')]); } catch (e) {}
    rebuildLabels();
    envP = studio(renderer, b).then((e) => { if (e) { brass.envMap = e; brass.needsUpdate = true; } }).catch(() => {});
    await envP;
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    [...Object.values(PT), spotMap, mouldMap, blobMap, shadowMap].forEach((t) => { try { renderer.initTexture(t); } catch (e) {} });
    loadLock(b);
    return true;
  })());

  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.setStyle('#888'); } return c; };
  const cBlue = col(BLUE), cWhite = col(WHITE), cPlaque = col(PLAQUE);
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F6F7F9';
    shared.uPaper.value.copy(rgb3(paper)); shared.uInk.value.copy(rgb3(ink));
    frames.forEach((f) => { f.drawMat.color.copy(cWhite); f.dimMat.color.copy(cWhite); f.labels.forEach((m) => m.material.color.copy(cWhite)); });
  }

  // ---------- layout ----------
  let lay = null, lastStrip = 0, lastTb = 0;
  /** opts: u (the cell), strip (its height), noTitleblock */
  function layout(w, h, opts = {}) {
    W = w; H = h;
    const u = opts.u || grid.u; gu = u;
    portrait = H > W;
    P = hallP(W, H);
    // the hall's mouth covers the screen: one hall unit is K px there; the eye in the middle of its height
    K = Math.max(W / HALL.w, H / HALL.h); X = HALL.w / 2 * K; FY = -HALL.eye * K; CY = (HALL.h - HALL.eye) * K; L = HALL.len * K;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    // the canvas exactly as large as its drawing buffer in device pixels (a resampled buffer shimmers)
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    lineMats.forEach((m) => { m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)); m.linewidth = Math.max(1, Math.round(dpr)); });
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = 0.05 * K; camera.far = L + P + 2 * K; camera.updateProjectionMatrix();
    const P3l = lensP(W, H);
    xCam.fov = 2 * Math.atan(H / 2 / P3l) * 180 / Math.PI; xCam.aspect = W / H; xCam.near = camera.near; xCam.far = camera.far; xCam.updateProjectionMatrix();
    const desktop = W >= 1024, N = Math.round(W / u);
    const strip_ = opts.strip ?? (document.getElementById('strip')?.offsetHeight || 2 * u);
    const tb = document.querySelector('.titleblock'), tbr = !opts.noTitleblock && tb?.getClientRects().length ? tb.getBoundingClientRect() : null;
    const tbTop = tbr && tbr.height ? Math.min(H, tbr.top) : Math.floor(H / u) * u;
    // the opening line: its box as wide as its words need (whole cells), so its backing always holds them (round 8b fix)
    const rT = Math.ceil((strip_ + u) / u - 1e-6);
    openEl.style.left = `${(desktop ? 5 : 1) * u}px`; openEl.style.top = `${(rT + (desktop ? 3 : 1)) * u}px`;
    { const maxC = desktop ? N - 10 : N - 2, lead = openEl.querySelector('.dive__open-l');
      openEl.classList.remove('is-wrap'); openEl.style.width = 'max-content';
      const need = Math.ceil((lead.getBoundingClientRect().width + 1) / u);
      const wrap = need > maxC; openEl.classList.toggle('is-wrap', wrap);
      openEl.style.width = `${Math.max(desktop ? 20 : 0, Math.min(maxC, wrap ? maxC : need)) * u}px`; }
    // the caption band: at the bottom of the screen; beside the title block where there is room for it (wide screens),
    // else over it, a cell clear; as tall as the longest line needs (whole cells)
    {
      const tbL = tbr ? tbr.left : W, tbB = tbr ? tbr.bottom : Math.floor((H - u) / u) * u;
      const side = desktop ? 5 : 1, besideW = Math.floor((tbL - u) / u) - side;
      const beside = !!tbr && besideW >= 24;
      const l0 = side * u, r0 = beside ? (side + besideW) * u : (N - side) * u;
      bandsEl.style.left = `${l0}px`; bandsEl.style.width = `${r0 - l0}px`;
      let bh = 0; bandEls.forEach((el) => { el.style.height = ''; el.style.width = `${r0 - l0}px`; bh = Math.max(bh, el.offsetHeight); });
      const rows = Math.ceil(bh / u - 1e-3), bottom = beside ? tbB : (tbr ? tbTop - u : tbB);
      bandsEl.style.top = `${bottom - rows * u}px`; bandsEl.style.height = `${rows * u}px`;
      bandEls.forEach((el) => { el.style.height = `${rows * u}px`; });
      bandR = { l: l0, r: r0, t: bottom - rows * u, b: bottom };
    }
    const topLim = (rT) * u, botLim = Math.min(bandR.t, tbTop) - u;   // a cell under the strip, a cell over the band and the title block
    makeGrid(); placeSurfaces();

    // each frame at its fixed place. Read closest (Dc: fully open, square to you, the camera Dc from its hinge's plane),
    // the camera has slid so the frame, the plaque under it and the gap between them sit in the middle of the room
    // between the strip and the band (on a portrait screen sideways too: the frame centred, about two thirds of the
    // screen's width, n whole cells). Desktop: the camera stays on the middle line across, the frame's wall edge 1.5
    // cells inside the screen, the frame at most 0.6 of the screen's height.
    const yc = (HALL.hang - HALL.eye) * K, avail = botLim - topLim;
    lay = frames.map((f, i) => {
      const el = labEls[i], dm = f.dims;
      const Ws = dm.ow * K, Hs = dm.oh * K; f.k = dm.sw * K / f.MW;
      const hd = HALL.at[i] * K - Ws / 2;   // the hinge's depth from the mouth (its near edge)
      // the plaque at distance D: its words three quarters of a cell in from the plate's sides, top and foot
      const PAD = 0.75 * u;
      const plateAt = (D) => { const wpx = Ws * P / D; el.style.width = `${Math.max(2 * u, wpx - 2 * PAD)}px`; const wh = el.offsetHeight; return { wpx, rows: wh / u, wh, hpx: wh + 2 * PAD }; };
      const block = (D) => { const pa = plateAt(D); return { pa, h: Hs * 1.03 * P / D + 0.5 * u + pa.hpx }; };   // (its front face is a little nearer than its hinge)
      let Dc, n = 0;
      if (portrait) {
        for (n = Math.round(N * 2 / 3); n >= 6; n--) { Dc = Ws * P / (n * u); if (block(Dc).h <= avail) break; }
      } else {
        Dc = Math.max(X * P / Math.max(1, W / 2 - 1.5 * u), Hs * P / (0.6 * H));   // its wall edge 1.5 cells inside the screen, at most 0.6 of its height
        for (let k = 0; k < 400 && block(Dc).h > avail; k++) Dc *= 1.02;
      }
      const B = block(Dc);
      // where the camera slides to: the block's top on a grid line in the middle of the room
      const bTop = Math.max(topLim, Math.round((topLim + (avail - B.h) / 2) / u) * u);
      const ys = bTop + Hs * 1.03 * P / Dc / 2;   // the frame's middle on screen
      const cy = clamp(yc - (H / 2 - ys) * Dc / P, FY + 0.45 * K, CY - 0.45 * K);
      const cx = portrait ? (f.left ? -1 : 1) * (X - Ws / 2) : 0;
      el.style.width = `${Math.max(2 * u, B.pa.wpx - 2 * PAD)}px`;
      const Dg = Math.max(0.35 * K, Dc - FOLD_LEN * K);
      const kMax = f.k * P / Math.max(Dg, 0.7 * Dc), kMid = f.k * P / Dc;
      const c = u * Dc / P / f.k;   // one cell in the frame's units, read closest
      return { Ws, Hs, hd, zc: HALL.at[i] * K, Dc, Dread: Dc + HOLD_LEN * K, Dopen: Dc + (HOLD_LEN + OPEN_LEN) * K, Dg, kMax, kMid, n, cx, cy, c,
        rows: B.pa.rows, pad: 0.75 * c, plateGap: 0.5 * c, plateH: B.pa.hpx * Dc / P / f.k, label: { width: B.pa.wpx - 2 * PAD, height: B.pa.wh } };
    });
    frames.forEach((f, i) => {
      const l = lay[i];
      f.pivot.position.set((f.left ? -1 : 1) * X, yc, -l.hd);
      f.panel.position.set((f.left ? 1 : -1) * l.Ws / 2, 0, 1.5); f.panel.scale.setScalar(f.k); f.pivot.rotation.set(0, (f.left ? 1 : -1) * Math.PI / 2, 0);
      buildFrame(f, l);
      // the plaque's words box and its plate, in the frame's own plane
      const c = l.c, pt = -f.OY - l.plateGap, z = f.FD * 0.5 + 0.2;
      const x0 = -f.OX + l.pad, x1 = f.OX - l.pad, yT = pt - l.pad, yB = yT - l.rows * c;
      l.labLocal = [[x0, yT], [x1, yT], [x1, yB], [x0, yB]].map(([x, y]) => V3(x, y, z));
      l.backLocal = [[-f.OX, pt], [f.OX, pt], [f.OX, pt - l.plateH], [-f.OX, pt - l.plateH]].map(([x, y]) => V3(x, y, z));
      // its soft shadow on the wall where it hangs; its fixture over its open place
      f.wshadow.position.set((f.left ? -1 : 1) * (X - 0.6), yc - 0.03 * K, -(l.hd + l.Ws / 2)); f.wshadow.rotation.set(0, (f.left ? 1 : -1) * Math.PI / 2, 0);
      f.wsBase = { w: l.Ws * 1.18, h: l.Hs * 1.14 };
      const g = fixtures[i]; g.userData.x = (f.left ? -1 : 1) * (X - l.Ws / 2); g.userData.z = -(l.hd - 0.3 * K);
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
    // the hand-over: page 3's first frame (lock3d.js endFaceHeight) through page 3's lens, straight ahead of where the walk ended
    hX = 0.3 * K; Dx = hX * P3l / Math.max(1, endFaceHeight(H, { strip: strip_, tbTop, u })); xLock?.setFaceHeight(hX);
    // the tests' stops: each frame fully open, then at its closest
    STOPS.length = 0; lay.forEach((l) => STOPS.push([qAtD(l, l.Dread), qAtD(l, l.Dc)]));
    lock.scale.setScalar(K);
    rebuildLabels();
    depthNow = -1; sizeHall(Math.max(0.0001, ease(span(lastQ, ...WAY_IN))), true);
    theme();
  }
  /** the scroll position (q) at which the camera is D from a frame's hinge */
  const qAtD = (l, D) => WALK[0] + (z0 - (D - l.hd)) / Math.max(1, z0 - zEnd) * (WALK[1] - WALK[0]);

  /** the camera walks down the hall at one steady pace while you scroll */
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
    fixtures.forEach((g) => { g.scale.setScalar(K); g.position.set(g.userData.x ?? 0, CY, g.userData.z ?? -g.userData.zc * K); });
    // the hairlines: the four long edges, the end wall's outline, the skirting, the door (its opening and architrave),
    // the leaf's two panels
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
    staticBase = E; knockKey = '';
  }

  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  /** a world point's screen position and its depth in front of the camera (negative: behind) */
  const proj = (x, y, z) => { v4.set(x, y, z).applyMatrix4(camera.matrixWorldInverse); const dz = -v4.z; v3.set(x, y, z).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, dz]; };
  const P3 = (f, x, y, z = ZS) => { const p = new THREE.Vector3(x, y, z).applyMatrix4(f.panel.matrixWorld); return proj(p.x, p.y, p.z); };

  /** the knockout: the static hairlines, cut where they would pass within half a cell of a word on screen */
  function knockout(rects) {
    const k = `${rects.map((r) => `${r.l | 0},${r.t | 0},${r.r | 0},${r.b | 0}`).join(';')}|${camera.position.x.toFixed(2)},${camera.position.y.toFixed(2)},${camera.position.z.toFixed(2)}|${depthNow.toFixed(2)}`;
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
   *  how much of its drawing is drawn, its plaque's words and caption band (lab) */
  function stateAt(l, D) {
    const swing = ease(span(D, l.Dopen, l.Dread)) * (1 - ease(span(D, l.Dc, l.Dg)));
    const drawn = ease(span(D, l.Dopen - 0.1 * K, l.Dread + 0.25 * K)) * (1 - ease(span(D, l.Dc, l.Dc - 0.6 * (l.Dc - l.Dg))));   // drawn as it opens, gone again as it folds back
    const lab = span(D, l.Dread + 0.3 * K, l.Dread) * (1 - span(D, l.Dc, l.Dc - 0.3 * (l.Dc - l.Dg)));
    return { swing, op: 1, drawn, lab };
  }
  function pose(f, s) {
    f.pivot.rotation.y = (f.left ? 1 : -1) * (Math.PI / 2 - SWING * s.swing);
    f.pivot.updateMatrixWorld(true);
  }

  /** q: 0..1 over the dive. Returns what page 1 needs and what the checks measure */
  let out = null, lastQ = 0, labQuads = [], stillMode = false, look = { dress: 0, lights: 0 }, bandOn = -1, bandOp = 0;
  const cA = new THREE.Color(), cB = new THREE.Color();
  function render(q, again = false) {
    if (!lay) return null;
    lastQ = q;
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
    lock.visible = dress > 0.004 && !!doorLock; brass.opacity = dress; brass.envMapIntensity = lerp(0.25, 0.75, lights);
    // the camera: along the hall as you walk; towards the open frame (a slide, never a turn)
    const t = camZ(q);
    let sx = 0, sy = 0, sw = 0;
    const states = frames.map((f, i) => { const l = lay[i], D = t + l.hd, s = st ? { swing: 1, op: 1, drawn: 1, lab: 0 } : stateAt(l, D); if (!st && s.swing > 0) { sx += s.swing * l.cx; sy += s.swing * l.cy; sw += s.swing; } return { D, s }; });
    if (sw > 1) { sx /= sw; sy /= sw; }
    camera.position.set(sx, sy, st ? z0 : t); camera.rotation.set(0, 0, 0); camera.updateMatrixWorld();
    const info = [], rects = [];
    labQuads = [];
    let bandI = -1, bandA = 0;
    frames.forEach((f, i) => {
      const l = lay[i], { D, s } = states[i];
      pose(f, s);
      const op = T >= 1 ? fin : 0;
      f.pivot.visible = op > 0.002;
      f.mats.forEach((m) => { m.opacity = m.userData.base * op; });
      // the light falls on the art: the sheet brightens as it comes out into its spotlight
      const lit = lights * (0.7 + 0.3 * s.swing);
      f.sheetMat.color.copy(cBlue).multiplyScalar(0.55 + 0.45 * lit);
      f.plateMat.color.copy(cPlaque).multiplyScalar(lights * (0.42 + 0.5 * s.swing));   // dim on the wall, lit as it comes out into the light (under the art)
      f.wshadow.visible = f.pivot.visible && dress > 0.01; f.wsMat.opacity = 0.6 * op * (1 - 0.8 * s.swing);
      { const k = 1 - 0.7 * s.swing, wb = f.wsBase.w * k; f.wshadow.scale.set(wb, f.wsBase.h, 1); f.wshadow.position.z = -(l.hd + wb / 2 - 0.04 * l.Ws); }
      const n = Math.round(s.drawn * f.d.segs.length); f.drawing.geometry.instanceCount = n; f.drawing.visible = n > 0 && f.pivot.visible;
      f.drawMat.opacity = op;
      f.fills.forEach((o) => { o.visible = f.pivot.visible && n > 0 && n >= Math.min(o.userData.at, f.d.segs.length); });
      const dimsOn = f.pivot.visible && f.d.dims && n >= Math.min(f.dimAt, f.d.segs.length);
      f.dims_.visible = !!dimsOn; f.dimMat.opacity = op * 0.62;
      f.labels.forEach((m) => { m.visible = f.pivot.visible && n >= Math.min(m.userData.at, f.d.segs.length) && n > 0; m.material.opacity = op * (m.userData.alpha ?? 1); });
      if (dimsOn) measure(f);
      // the plaque's words, carried by the frame's own perspective
      const el = labEls[i], lop = f.pivot.visible ? op * s.lab : 0;
      el.style.setProperty('--op', lop.toFixed(3));
      el.classList.toggle('on', lop > 0.01);
      if (lop > bandA) { bandA = lop; bandI = i; }
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
          const c = gu / 2 + 2; rects.push({ l: r.l - gu - c, r: r.r + gu + c, t: r.t - gu - c, b: r.b + gu + c });   // its plate, and half a cell past it
        } else el.classList.remove('on');
      }
      if (f.pivot.visible) {
        const q4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => P3(f, x, y, f.FD).slice(0, 2));
        const quad = q4(-f.OX, f.OY, f.OX, -f.OY);
        info.push({ i, swing: s.swing, op, drawn: s.drawn, lab: s.lab, quad, D, ratio: f.d.w / f.d.h, share: Math.max(...quad.map((p) => p[1])) - Math.min(...quad.map((p) => p[1])), widthShare: (Math.max(...quad.map((p) => p[0])) - Math.min(...quad.map((p) => p[0]))) / W });
      } else info.push({ i, swing: 0, op: 0, drawn: s.drawn, lab: 0, quad: null, D, ratio: f.d.w / f.d.h, share: 0, widthShare: 0 });
    });
    // the caption band: the open frame's title and story line
    bandEls.forEach((el, i) => { const a = i === bandI ? bandA : 0; el.style.setProperty('--op', a.toFixed(3)); el.classList.toggle('on', a > 0.01); });
    bandOn = bandI; bandOp = bandA;
    const bandShown = bandA > 0.01 && !st;
    bandsEl.classList.toggle('on', bandShown);
    if (bandShown) rects.push({ l: bandR.l - gu, r: bandR.r + gu, t: bandR.t - gu, b: bandR.b + gu });
    // whatever is farther than a plaque and behind its words (another frame, a fixture) steps back while they are up
    const under = (b, own = -1) => { let h = 0; if (!b) return 0; labQuads.forEach((lq) => { if (lq.i === own) return; const r = lq.rect, c = gu * 1.5; if (r.l - c < b.x + b.w && r.r + c > b.x && r.t - c < b.y + b.h && r.b + c > b.y) h = Math.max(h, lq.op); }); return h; };
    frames.forEach((f, i) => {
      f.hide = 0; const q4 = info[i].quad; if (!q4 || !labQuads.length) return;
      const xs = q4.map((p) => p[0]), ys = q4.map((p) => p[1]);
      const h = under({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, i);
      if (h <= 0) return; f.hide = h; const k = 1 - h;
      f.mats.forEach((m) => { m.opacity *= k; }); [f.drawMat, f.dimMat].forEach((m) => { m.opacity *= k; }); f.labels.forEach((m) => { m.material.opacity *= k; });
      f.wsMat.opacity *= k;
      if (h > 0.98) { f.pivot.visible = false; f.wshadow.visible = false; }
    });
    fixtures.forEach((g) => { if (!g.visible) return; const h = under(screenBox(g)); if (h > 0) { g.userData.fixMat.opacity *= 1 - h; g.userData.lensMat.opacity *= 1 - h; if (h > 0.98) g.visible = false; } g.userData.hide = h; });
    // the lock steps back wherever a plaque's words would come within a cell of it (TYPE_RULES: no shape under a word)
    let lockHidden = 0;
    if (lock.visible) {
      const lb = screenBox(lock);
      if (lb) labQuads.forEach((lq) => { const r = lq.rect, c = gu; if (r.l - c < lb.x + lb.w && r.r + c > lb.x && r.t - c < lb.y + lb.h && r.b + c > lb.y) lockHidden = Math.max(lockHidden, lq.op); });
      if (lockHidden > 0) brass.opacity = dress * (1 - lockHidden);
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
      xCam.position.copy(camera.position); xCam.updateMatrixWorld();
      xHolder.matrix.makeTranslation(camera.position.x, camera.position.y, camera.position.z - Dx); xHolder.matrixWorldNeedsUpdate = true;
      renderer.autoClear = false; renderer.render(xQuadScene, xCam); renderer.render(xScene, xCam); renderer.autoClear = true;
    }
    const lockBox = lock.visible ? screenBox(lock) : null;
    const o = { info, q, t, cam: [camera.position.x / K, camera.position.y / K], open: T >= 1, tr: T, dress, lights, frames: fin, walked: span(q, ...WALK),
      door: { lock: door.lockState, box: lockBox, distance: (camera.position.z + L) / K }, xray: xt, labels: labQuads, band: bandShown ? { i: bandI, op: bandA, rect: bandR } : null };
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

  /** for the type check (TYPE_RULES.md): every drawn line, shape and in-drawing word on screen now, in CSS px. Each
   *  frame's outline and each shown plaque's plate count as drawn lines; the ceiling's strip as a line, the fixtures and
   *  the lock as shapes; a drawing's own words are checked against its own lines in its own plane (inPlane()). The
   *  caption band is opaque: what lies under it is hidden. */
  function drawn() {
    const D = { lines: [], shapes: [], texts: [], fails: [] };
    if (!lay || !out) return D;
    if (out.xray > 0.5) { if (xLock) { const b = screenBox(xLock.root); if (b) D.shapes.push({ ...b, tag: 'lock:xray' }); } return D; }
    const segIn = (A, B) => A[2] > camera.near && B[2] > camera.near;
    const outer = (f) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => P3(f, sx * f.OX, sy * f.OY, f.FD));
    const occ = [];
    frames.forEach((f) => { if (!f.pivot.visible || f.sheetMat.opacity < 0.9 || f.hide > 0.1) return; f.pivot.updateMatrixWorld(true);
      const q = outer(f); if (q.every((p) => p[2] > camera.near)) occ.push(q.map((p) => [p[0], p[1]])); });
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
    // the fixtures (a fixture behind an open frame is hidden by it)
    fixtures.forEach((g, i) => { if (!g.visible || g.userData.hide > 0.5) return; const b = screenBox(g); if (!b || b.x >= W || b.x + b.w <= 0 || b.y >= H || b.y + b.h <= 0) return;
      if (occ.some((q) => [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].every(([x, y]) => inQuad(q, x, y)))) return;
      D.shapes.push({ ...b, tag: `hall:fixture${i + 1}` }); });
    if (lock.visible && (1 - (door.lockHidden || 0)) * look.dress > 0.05) { const b = screenBox(lock); if (b) D.shapes.push({ ...b, tag: 'door:lock' }); }
    // the plaques' plates (shown with their words): their four sides
    labQuads.forEach((lq) => { if (lq.op < 0.05) return; const b = lq.back; for (let k = 0; k < 4; k++) { const A = b[k], B = b[(k + 1) % 4]; D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `hall${lq.i + 1}lab:backing` }); } });
    // the frames nearer than each drawing (its hinge's distance), for occlusion
    const frameQ = frames.map((f) => (f.pivot.visible && f.sheetMat.opacity > 0.9 && !(f.hide > 0.1) ? outer(f) : null));
    const dist = frames.map((f, i) => camera.position.z + lay[i].hd);
    frames.forEach((f, i) => {
      if (!f.pivot.visible || f.hide > 0.5) return;
      const g = `hall${i + 1}`;
      const nearer = frameQ.filter((q, j) => q && j !== i && dist[j] < dist[i] && q.every((p) => p[2] > camera.near)).map((q) => q.map((p) => [p[0], p[1]]));
      const hidden = (x, y) => nearer.some((q) => inQuad(q, x, y));
      const L0 = D.lines.length, S0 = D.shapes.length, T0 = D.texts.length;
      const c = outer(f);
      if (c.some((p) => p[2] < camera.near)) return;
      const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]);
      D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), quad: c.map((p) => [p[0], p[1]]), tag: `${g}:sheet` });
      for (let k = 0; k < 4; k++) { const A = c[k], B = c[(k + 1) % 4]; D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:frame` }); }
      const n = f.drawing.geometry.instanceCount;
      for (let k = 0; k < n; k++) { const [a, b, cc, e] = f.d.segs[k], A = P3(f, U(f, a), V(f, b)), B = P3(f, U(f, cc), V(f, e)); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:seg` }); }
      if (f.dims_.visible) for (let k = 0; k < f.dimSegs.length; k += 6) { const s3 = f.dimSegs, A = P3(f, s3[k], s3[k + 1]), B = P3(f, s3[k + 3], s3[k + 4]); D.lines.push({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], tag: `${g}:dim` }); }
      f.fills.forEach((o) => { if (!o.visible) return; const fc = o.userData, A = P3(f, U(f, fc.cx - fc.r), V(f, fc.cy - fc.r)), B = P3(f, U(f, fc.cx + fc.r), V(f, fc.cy + fc.r));
        D.shapes.push({ x: Math.min(A[0], B[0]), y: Math.min(A[1], B[1]), w: Math.abs(B[0] - A[0]), h: Math.abs(B[1] - A[1]), tag: `${g}:fill` }); });
      f.labels.forEach((m, k) => {
        if (!m.visible || m.material.opacity < 0.05) return;
        const l = m.userData.l, b = inkBox(l);
        const quad = [[b.x0, b.t], [b.x1, b.t], [b.x1, b.b], [b.x0, b.b]].map(([x, y]) => P3(f, U(f, x), V(f, y)).slice(0, 2)), xs2 = quad.map((p) => p[0]), ys2 = quad.map((p) => p[1]);
        const sz = Math.abs(P3(f, U(f, b.x0), V(f, l.y))[1] - P3(f, U(f, b.x0), V(f, l.y - l.size))[1]);
        D.texts.push({ x: Math.min(...xs2), y: Math.min(...ys2), w: Math.max(...xs2) - Math.min(...xs2), h: Math.max(...ys2) - Math.min(...ys2), quad, t: l.t, tag: `${g}:t${k}`, size: l.size, screenSize: sz / gu });
      });
      if (nearer.length) {
        // its lines: only the stretches outside every nearer (opaque) frame
        const ls = D.lines.splice(L0);
        ls.forEach((l) => {
          const ts = [0, 1], dx = l.x2 - l.x1, dy = l.y2 - l.y1;
          for (const q of nearer) for (let k2 = 0; k2 < 4; k2++) { const p = q[k2], n2 = q[(k2 + 1) % 4], ex = n2[0] - p[0], ey = n2[1] - p[1], den = dx * ey - dy * ex;
            if (Math.abs(den) < 1e-9) continue; const t = ((p[0] - l.x1) * ey - (p[1] - l.y1) * ex) / den, u2 = ((p[0] - l.x1) * dy - (p[1] - l.y1) * dx) / den; if (t > 0 && t < 1 && u2 >= 0 && u2 <= 1) ts.push(t); }
          ts.sort((a2, b2) => a2 - b2);
          for (let k2 = 0; k2 + 1 < ts.length; k2++) { const a2 = ts[k2], b2 = ts[k2 + 1]; if (b2 - a2 < 1e-5) continue; const m = (a2 + b2) / 2;
            if (!hidden(l.x1 + dx * m, l.y1 + dy * m)) D.lines.push({ ...l, x1: l.x1 + dx * a2, y1: l.y1 + dy * a2, x2: l.x1 + dx * b2, y2: l.y1 + dy * b2 }); }
        });
        const ss = D.shapes.splice(S0); ss.forEach((sh) => { const q = sh.quad || [[sh.x, sh.y], [sh.x + sh.w, sh.y], [sh.x + sh.w, sh.y + sh.h], [sh.x, sh.y + sh.h]]; if (!q.some((p) => hidden(p[0], p[1])) && !nearer.some((nq) => nq.some((p) => inQuad(q, p[0], p[1])))) D.shapes.push(sh); });
        const ts = D.texts.splice(T0); ts.forEach((t2) => { if (!hidden(t2.x + t2.w / 2, t2.y + t2.h / 2)) D.texts.push(t2); });
      }
    });
    // the caption band is opaque: lines under it are cut, shapes and words under it hidden
    if (out.band) {
      const r = bandR, inR = (x, y) => x > r.l && x < r.r && y > r.t && y < r.b;
      const ls = D.lines; D.lines = [];
      ls.forEach((l) => cut2D([l.x1, l.y1, 0], [l.x2, l.y2, 0], [r]).forEach(([a, b]) => D.lines.push({ ...l, x1: a[0], y1: a[1], x2: b[0], y2: b[1] })));
      D.shapes = D.shapes.filter((s) => s.x + s.w <= r.l || s.x >= r.r || s.y + s.h <= r.t || s.y >= r.b);
      D.texts = D.texts.filter((t2) => !inR(t2.x + t2.w / 2, t2.y + t2.h / 2));
    }
    return D;
  }

  /** the drawings' readability (readcheck.py): for each frame at its closest fully open moment, every word's size on
   *  screen in cells (the type scale's smallest step is 0.375), the frame's height and width as shares of the screen,
   *  its closest approach to the screen's edge, and its words' clear space in its own plane */
  function readability() {
    if (!lay) return null;
    const keep = lastQ, res = [];
    frames.forEach((f, i) => {
      const l = lay[i];
      const at = (D) => {
        const s = stateAt(l, D);
        camera.position.set(l.cx * s.swing, l.cy * s.swing, D - l.hd); camera.updateMatrixWorld();
        pose(f, s);
        const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => P3(f, sx * f.OX, sy * f.OY, f.FD));
        const ys = c.map((p) => p[1]), xs = c.map((p) => p[0]);
        const sizes = [];
        f.d.labels.filter((x) => x.t).forEach((lb) => {
          const b = inkBox(lb); for (const x of [b.x0, b.x1]) sizes.push(Math.abs(P3(f, U(f, x), V(f, lb.y))[1] - P3(f, U(f, x), V(f, lb.y - lb.size))[1]) / gu);
        });
        return { minSize: sizes.length ? Math.min(...sizes) : null, share: (Math.max(...ys) - Math.min(...ys)) / H, widthShare: (Math.max(...xs) - Math.min(...xs)) / W, edge: Math.min(...xs.map((x) => Math.min(x, W - x))), op: s.op, swing: s.swing };
      };
      const close = at(l.Dc), clear = inPlane(f);
      res.push({ i: i + 1, key: f.F.key, cells: [+(l.Ws * P / l.Dc / gu).toFixed(1), +(l.Hs * P / l.Dc / gu).toFixed(1)], size: [+(l.Ws / K).toFixed(3), +(l.Hs / K).toFixed(3)], plaque: [l.rows, +(l.label.width / gu).toFixed(2)], Dc: +(l.Dc / K).toFixed(3), slide: [+(l.cx / K).toFixed(3), +(l.cy / K).toFixed(3)], closest: close, lastVisible: close, inPlane: clear });
    });
    render(keep, true);
    return { W, H, u: gu, P, K, smallest: 0.375, frames: res, worstSize: Math.min(...res.map((r) => r.closest.minSize ?? 9)), worstShare: Math.max(...res.map((r) => r.closest.share)) };
  }
  /** a drawing's words against its own lines (and its sheet's edges), in screen px at the moment it is read closest: at
   *  least half a cell (TYPE_RULES rule 2) */
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
    const dots = (f.d.fills || []).map((c) => [[c.cx - c.r, c.cy - c.r, c.cx + c.r, c.cy - c.r], [c.cx + c.r, c.cy - c.r, c.cx + c.r, c.cy + c.r], [c.cx + c.r, c.cy + c.r, c.cx - c.r, c.cy + c.r], [c.cx - c.r, c.cy + c.r, c.cx - c.r, c.cy - c.r]]).flat();
    const segs = f.d.segs.concat(f.dimSegsD || [], frame, dots);
    f.d.labels.filter((x) => x.t).forEach((l) => check(inkBox(l), segs, scrD, l.t));
    const need = gu / 2 - 0.75;
    return { worst: +worst.toFixed(2), need: +need.toFixed(2), ok: worst >= need, what, pair };
  }

  /** draw every frame once, whole, so its buffers and textures reach the GPU now and not mid-walk */
  function warm(q = 0.5) {
    render(q);
    frames.forEach((f) => { f.pivot.visible = true; f.drawing.visible = true; f.drawing.geometry.instanceCount = f.d.segs.length; f.labels.forEach((m) => { m.visible = true; }); f.fills.forEach((o) => { o.visible = true; }); f.wshadow.visible = true; });
    strip.visible = true; lock.visible = !!doorLock; fixtures.forEach((g) => { g.visible = true; });
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
  // frame 5's real phones are gone (pass 2: a blueprint); kept as no-ops for the asset sheet's and the tools' calls
  const loadPhones = () => Promise.resolve('none');
  return { layout, render, load, warm, still, reset, theme, loadPhones, loadLock, drawn, readability, look: LOOK.id, stops: STOPS,
    closeAt: () => (lay ? lay.map((l) => qAtD(l, l.Dc) * DIVE) : null), openAt: () => (lay ? lay.map((l) => qAtD(l, l.Dread) * DIVE) : null),
    phones: () => 'none', frames: () => frames, lay: () => lay, P: () => P, L: () => L, K: () => K, hall: () => ({ W, H, P, K, X, L, z0, zEnd, Dend: Dend / K, Dx, portrait, band: bandR }),
    band: () => ({ i: bandOn, op: bandOp, rect: bandR }),
    brass: () => brass, doorLock: () => doorLock,
    door: () => ({ lockState: door.lockState, Dend, zEnd }), endFrame: () => ({ P: lensP(W, H), hL: hX, Dend: Dx }), camera: () => camera, renderer: () => renderer, lockParts: () => lockParts, onBeat: (fn) => { onAgain = fn; } };
}

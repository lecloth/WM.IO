// Page 1 -> page 2: the hallway (Part 5 "Round 4 picks" ... "Round 7"). Round 7:
// - The way in: the "?" dot is gone. Three transitions from "Now, what do you need?" into the hallway (TRANSITION, A on
//   the page until Wajih picks; `?tr=B` previews another): A the grid folds into the hallway (the page's flat grid is the
//   hallway's end wall at the screen; it recedes and the walls, floor and ceiling unfold behind it, the camera walks in);
//   B a clean cut along one grid line (the hallway opens from the line); C into one square (the page pushes into one grid
//   square, which opens into the hallway). Each is a short timed beat once it starts.
// - The line that opens the hallway: "We design backwards. ..." (draft), on a frosted backing, before the first frame.
// - Five frames in the "backwards" order (corridor-drawings.js), alternating walls. No frame, no mat, no glass. Three
//   treatments (TREATMENT, A on the page; `?hall=B`): A printed on the wall (blue, white lines, its edges on the wall's
//   grid); at each rest the camera turns to face it squarely. B a bare sheet that swings off the wall to face you
//   (round 4's hinge). C a sheet pinned flat on the wall with a hairline shadow; the camera turns to face it as in A.
//   At rest every drawing faces the screen square-on (its exact proportions), is whole grid cells on screen, and fills
//   about 60% of the screen's height (capped by the width and by its label), on phones and laptops alike. A drawing
//   shows only while it is faced (it draws on as you arrive and goes before the view turns away), so nothing nears the
//   screen edge and nothing in the distance sits under a label.
// - Labels on a soft frosted backing (CSS): beside the drawing on wide screens, under it on phones.
// - Page 2's preview stays hidden behind the hallway's end wall (paper and grid) until the last frame has gone; then the
//   wall goes and page 2 lands 1:1.
// - Frame 5: the real iPhone 18 and S26 (live 3D, git-ignored files) turn in full by themselves once the frame settles
//   (timed, not tied to the scroll, so a quick swipe can't skip it). The still stands in while they load, with reduced
//   motion, and when the files are missing.
// The hallway keeps round 6's grid: its walls, floor and ceiling carry the screen's grid continued from the mouth.
// No stretching: one true perspective; the lens is 50 degrees across the narrower side, at most 66 across.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { FRAMES, PHONE_PAIR, OPENING } from './corridor-drawings.js';
import { LOOKS, HALL } from './hall-looks.js';
import { grid } from '../engine/grid.js';
import { studio } from '../phones/studio.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- the switches (asset sheet candidates; A on the page until Wajih picks) ----------
export const TRANSITION = 'A';
export const TRANSITIONS = { A: 'The grid folds into the hallway', B: 'A clean cut', C: 'Into one square' };
export const TREATMENT = 'A';
export const TREATMENTS = { A: 'Printed on the wall', B: 'Bare sheet', C: 'Pinned sheet' };
const pick = (key, all, dflt) => { try { const q = (new URLSearchParams(location.search).get(key) || '').toUpperCase(); if (all[q]) return q; } catch (e) {} return dflt; };
export const transitionPick = () => pick('tr', TRANSITIONS, TRANSITION);
export const treatmentPick = () => pick('hall', TREATMENTS, TREATMENT);

/** the lens: 50 degrees across the narrower side, at most 66 degrees across (the camera distance P of the screen plane) */
export const LENS = { narrow: 50, across: 66 };
export function lensP(W, H) {
  const t = (deg) => Math.tan(deg * Math.PI / 360);
  return Math.max(Math.min(W, H) / 2 / t(LENS.narrow), W / 2 / t(LENS.across));
}

// ---------- the timeline, in screens of scroll (q = screens / DIVE) ----------
// the way in (a timed beat once it starts), the opening line, five rests (frames 1-4 rest 0.28 of a screen, frame 5
// 0.4: its phones turn first), the end wall going, page 2 landing.
export const DIVE = 4.3;
const S_ = (screens) => screens / DIVE;
const REST = [0.28, 0.28, 0.28, 0.28, 0.4], FIRST = 1.12, EVERY = 0.57;
export const STOPS = REST.map((r, i) => { const s = FIRST + i * EVERY; return [S_(s), S_(s + r)]; });
export const OPEN_AT = [S_(0.3), S_(0.78)];                      // the opening line
const TR_AT = S_(0.02), TR_MS = 1100;                             // the way in starts here, and lasts this long
const ARRIVE = S_(0.22), TURN_OUT = S_(0.12);                    // the walk to a rest, the turn back to the axis
const FADE_IN = [S_(0.035), S_(0.005)], FADE_OUT = [S_(0.002), S_(0.016)], DRAW = S_(0.12);
const LAST = STOPS[STOPS.length - 1];
const END_FADE = [LAST[1] + S_(0.06), LAST[1] + S_(0.14)];        // the end wall goes once frame 5 has gone
const REAL_AT = S_(0.02), TURN_MS = 3600;                         // frame 5: drawn -> real, then the timed turn
const BLUE = '#173F73', WHITE = '#FFFFFF';
const MOUNT = 0.07;   // the least blue margin round a drawing, as a share of its width

// a label inside a drawing (mono, white) as a small texture on a plane, in drawing units (y down), at its baseline
function labelMesh(l, fontPx = 56) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const font = `500 ${fontPx}px "DM Mono", ui-monospace, monospace`, t = l.t || ' ';
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  const tw = Math.ceil(x.measureText(t).width) + 8;
  c.width = tw; c.height = Math.ceil(fontPx * 1.4);
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(t, 4, fontPx * 1.05);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const s = l.size / fontPx, pw = c.width * s, ph = c.height * s;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
  const ax = l.anchor === 'middle' ? -pw / 2 : l.anchor === 'end' ? -pw : 0;
  mesh.userData = { cx: l.x + ax + pw / 2 - 4 * s, cy: l.y - fontPx * 1.05 * s + ph / 2, at: l.at, faint: !!l.faint };
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
async function loadImage(url) {
  for (let n = 0; n < 5; n++) {
    try {
      const r = await fetch(n ? `${url}?r=${n}` : url); if (r.status === 404) return null; if (!r.ok) throw new Error(r.status);
      const b = await r.blob();
      if (self.createImageBitmap) return await createImageBitmap(b, { imageOrientation: 'flipY' });
      const img = new Image(); img.src = URL.createObjectURL(b); await img.decode(); img.flipped = false; return img;
    } catch (e) { await new Promise((res) => setTimeout(res, 150 * (n + 1))); }
  }
  return null;
}

/** a frame's label (round 7): on a soft frosted backing (CSS), the title (big, serif), the drawing's name (mono), one
 *  line of story (a draft, flagged) */
export const labelHTML = (f) => `<div class="dive__lab"><p class="dive__lab-t display gt">${f.caption}</p><p class="dive__lab-k mono gt gt-h">${f.fig}</p>` +
  `<p class="dive__lab-s gt gt-h"><span class="ph" data-draft>Draft</span>${f.story}</p></div>`;
export const openingHTML = () => `<div class="dive__open"><p class="dive__open-l display gt">${OPENING.lead}</p><p class="dive__open-r gt gt-h"><span class="ph" data-draft>Draft</span>${OPENING.rest}</p></div>`;

/** root: under page 2 (the paper behind the hallway); top: over page 2 (the hallway in WebGL, the cut line, the
 *  opening line, the labels). Page 2 waits at the hallway's end, hidden by the end wall until the last frame has gone. */
export function createDive(root, top, { base = '', treatment = treatmentPick(), transition = transitionPick() } = {}) {
  const LOOK = LOOKS[HALL], TR = transition, TM = treatment;
  root.innerHTML = `<div class="dive__win"></div>`;
  top.innerHTML = `<canvas class="dive__gl"></canvas><svg class="dive__cut" aria-hidden="true"><line x1="0" x2="100%"></line></svg>${openingHTML()}<div class="dive__labs">${FRAMES.map(labelHTML).join('')}</div>`;
  root.dataset.look = top.dataset.look = LOOK.id; top.dataset.tr = TR; top.dataset.hall = TM;
  const win = root.querySelector('.dive__win'), canvas = top.querySelector('.dive__gl'), cutEl = top.querySelector('.dive__cut'), cutLine = cutEl.querySelector('line');
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
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr); return g; };

  // ---------- the surfaces: walls, floor and (round 7) a ceiling, each the white card with the site's grid ----------
  const ao = aoTex();
  const aoRot = (() => { const t = ao.clone(); t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t; })();
  const cardTex = canvasTex(1024, 1024, () => {}, true);
  cardTex.wrapS = cardTex.wrapT = THREE.RepeatWrapping; cardTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); cardTex.minFilter = THREE.LinearMipmapLinearFilter;
  const nrm = flatNormal(); nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
  const spec = LOOK.walls;
  const cardMat = new THREE.MeshStandardMaterial({ map: cardTex, normalMap: nrm, normalScale: new THREE.Vector2(spec.normal, spec.normal), roughness: spec.rough, metalness: 0, aoMap: ao, aoMapIntensity: 0.55, envMapIntensity: spec.env });
  // left, right, floor, ceiling: each its own clone of the maps (its own repeat)
  const planes = [0, 1, 2, 3].map((side) => {
    const m = cardMat.clone(); m.map = cardTex.clone(); m.normalMap = nrm.clone();
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
    mesh.receiveShadow = side !== 3; mesh.castShadow = side < 2 && LOOK.wallsCast; mesh.userData = { side };
    scene.add(mesh); return mesh;
  });
  // the end wall: the page's own paper and grid, unlit and exact (at the start of transition A it IS the page), opaque,
  // so page 2 behind it stays hidden until the last frame has gone
  const endTex = canvasTex(64, 64, () => {}, true); endTex.wrapS = endTex.wrapT = THREE.RepeatWrapping; endTex.minFilter = THREE.LinearMipmapLinearFilter; endTex.anisotropy = 8;
  const endMat = new THREE.MeshBasicMaterial({ map: endTex, toneMapped: false, transparent: true, depthWrite: true });
  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), endMat); endWall.renderOrder = -1; scene.add(endWall);
  let surfImgs = {};
  async function loadSurfaces(b = base) {
    const [c, n] = await Promise.all([loadImage(`${b}media/materials/${spec.tex}/color.webp`), loadImage(`${b}media/materials/${spec.tex}/normal.webp`)]);
    surfImgs = { c, n }; painted = ''; paintSurfaces();
  }
  let painted = '';
  /** the card: the paper scan in grey, then the grid (one tile = 5 x 5 cells; walls and floor repeat it in world units of
   *  the screen's cell from the hallway's mouth); the end wall: the page's paper and grid exactly, one tile in device
   *  pixels, so at the screen it matches the page line for line */
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
  }

  const edgeMat = lmat({ opacity: LOOK.edges });
  const edges = new LineSegments2(segGeo([0, 0, 0, 0, 0, 1]), edgeMat); edges.renderOrder = 1; scene.add(edges);

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); key.castShadow = true; scene.add(key); scene.add(key.target);
  key.shadow.camera.up.set(0, 0, -1); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6; key.shadow.radius = LOOK.key.radius;
  const keyDir = new THREE.Vector3(...LOOK.key.dir).normalize();

  // ---------- the drawings: a blueprint sheet each (no frame, no mat, no glass) ----------
  const blobMap = blobTex();
  const frames = FRAMES.map((F, i) => {
    const d = F.draw, mg0 = d.w * MOUNT, [ca, cb] = F.cells;
    let MW = d.w + 2 * mg0, MH = d.h + 2 * mg0;
    if (MW / MH > ca / cb) MH = MW * cb / ca; else MW = MH * ca / cb;
    const mgx = (MW - d.w) / 2, mgy = (MH - d.h) / 2;
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = F.side === 'l';
    // panel coordinates: drawing units, the sheet centred on the origin, y up, z out of the wall (B: its panel sits half
    // a sheet off the hinge)
    const U = (u) => -MW / 2 + mgx + u, V = (v) => MH / 2 - mgy - v;
    const zSheet = TM === 'A' ? 0.15 : TM === 'C' ? 0.9 : 0.4;
    const mats = [];
    const own = (m, b = 1) => { m.transparent = true; m.userData.base = b; mats.push(m); return m; };
    const sheetMat = own(new THREE.MeshBasicMaterial({ toneMapped: false }));
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), sheetMat); sheet.position.z = zSheet; panel.add(sheet);
    // C: the pinned sheet's hairline shadow (right and below) and two pins
    let extras = [];
    if (TM === 'C') {
      const sh = own(new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false, depthWrite: false }), 0.22);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), sh); shadow.position.z = zSheet - 0.6; panel.add(shadow);
      const pinMat = own(new THREE.MeshBasicMaterial({ color: 0x8C8F94, toneMapped: false }));
      const pins = [-1, 1].map((sx) => { const p = new THREE.Mesh(new THREE.CircleGeometry(1, 16), pinMat); p.position.set(sx * (MW / 2 - mgx * 0.5), MH / 2 - mgy * 0.5, zSheet + 0.3); panel.add(p); return p; });
      extras = [shadow, ...pins];
    }
    const pos = new Float32Array(d.segs.length * 6);
    d.segs.forEach(([a, b, c, e], k) => pos.set([U(a), V(b), zSheet + 0.2, U(c), V(e), zSheet + 0.2], k * 6));
    const drawMat = lmat({ opacity: 1 });
    const drawing = new LineSegments2(segGeo(pos), drawMat); drawing.geometry.instanceCount = 0; panel.add(drawing);
    const labels = d.labels.map((l) => { const m = labelMesh(l); m.position.set(U(m.userData.cx), V(m.userData.cy), zSheet + 0.3); m.visible = false; panel.add(m); return m; });
    let still = null, blobs = null;
    if (F.real && d.region) {
      const rg = d.region, sm = own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      still = new THREE.Mesh(new THREE.PlaneGeometry(rg.w, rg.h), sm); still.position.set(U(rg.u + rg.w / 2), V(rg.v + rg.h / 2), zSheet + 0.25); still.visible = false; panel.add(still);
      blobs = PHONE_PAIR.phones.map(() => { const m = own(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blobMap, depthWrite: false, toneMapped: false }), 0.26); const b = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); b.position.z = zSheet + 30; b.renderOrder = 4; b.visible = false; panel.add(b); return b; });
    }
    return { F, d, i, left, MW, MH, mgx, mgy, zSheet, U, V, pivot, panel, sheet, extras, drawing, labels, still, blobs, stillOK: false, real: 0, realTarget: 0, drawMat, mats };
  });
  const f5 = frames.find((f) => f.still);

  // ---------- frame 5: the real phones, live (loaded when the dive begins) ----------
  const phones = { state: 'idle', list: [], root: new THREE.Group(), mix: 0, yaw: 0, mats: [], turnT0: 0, turned: false };
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
    const zPh = f5.zSheet + 46, c = (cam.z - zPh) / (cam.z - f5.zSheet);
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
  let liveRaf = 0;
  function liveTo(t) {
    cancelAnimationFrame(liveRaf); const from = phones.mix, t0 = performance.now();
    const step = () => { const u = clamp((performance.now() - t0) / 420); phones.mix = lerp(from, t, ease2(u)); render(lastQ, true); if (u < 1) liveRaf = requestAnimationFrame(step); };
    liveRaf = requestAnimationFrame(step);
  }
  // the turn (round 7): once frame 5 settles it plays in full by itself: front -> back (held) -> front-on
  const turnAt = (u) => { const K = [[0, 0], [0.4, Math.PI], [0.6, Math.PI], [1, 2 * Math.PI]]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(u, K[i - 1][0], K[i][0]))); return 2 * Math.PI; };
  let turnRaf = 0;
  function startTurn() {
    if (phones.turned || turnRaf) return;
    phones.turnT0 = performance.now();
    const step = () => {
      const u = clamp((performance.now() - phones.turnT0) / TURN_MS); phones.yaw = turnAt(u); render(lastQ, true);
      if (u < 1) turnRaf = requestAnimationFrame(step); else { turnRaf = 0; phones.turned = true; phones.yaw = 2 * Math.PI; }
    };
    turnRaf = requestAnimationFrame(step);
  }
  function resetTurn() { if (!phones.turned && !turnRaf) return; cancelAnimationFrame(turnRaf); turnRaf = 0; phones.turned = false; phones.yaw = 0; }

  let loaded = null, envP = null;
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await document.fonts.load('500 56px "DM Mono"'); } catch (e) {}
    rebuildLabels();
    envP = studio(renderer, b).then((e) => { scene.environment = e; phoneScene.environment = e; colours(); }).catch(() => {});
    const jobs = [loadSurfaces(b), envP];
    if (f5) jobs.push((async () => {
      const img = await loadImage(`${b}${f5.F.real}`);
      if (img) { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.flipY = img.flipped === false; t.needsUpdate = true; f5.still.material.map = t; f5.still.material.needsUpdate = true; renderer.initTexture(t); f5.stillOK = true; }
    })());
    await Promise.all(jobs);
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    return true;
  })());
  /** the drawings' own labels; the live ones (a dimension's measured length on this screen at rest) are written now */
  function rebuildLabels() {
    frames.forEach((f, i) => {
      f.labels.forEach((m) => { f.panel.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
      const pxPerUnit = lay ? lay[i].tw / f.MW : 0;
      f.labels = f.d.labels.map((l) => {
        const Lb = l.live ? { ...l, t: pxPerUnit ? `${((l.live[1] - l.live[0]) * pxPerUnit).toFixed(1)} PX` : '' } : l;
        const m = labelMesh(Lb); m.position.set(f.U(m.userData.cx), f.V(m.userData.cy), f.zSheet + 0.3); m.visible = false; f.panel.add(m); return m;
      });
    });
    colours();
  }

  let W = 1, H = 1, P = 1, L = 1, ink = '#121212', paper = '#F6F7F9', dark = false, gu = 20, cut = null;
  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.setStyle('#888'); } return c; };
  const th = (pair) => (Array.isArray(pair) ? pair[dark ? 1 : 0] : pair);
  function colours() {
    planes.forEach((m) => m.material.color.copy(col(th(spec.color))));
    edgeMat.color.copy(col(ink));
    hemi.color.copy(col(th(LOOK.hemi.sky))); hemi.groundColor.copy(col(th(LOOK.hemi.ground))); hemi.intensity = th(LOOK.hemi.i);
    key.color.copy(col(LOOK.key.color)); key.intensity = th(LOOK.key.i);
    scene.environmentIntensity = th(LOOK.env);
    frames.forEach((f) => {
      f.sheet.material.color.copy(col(BLUE)).lerp(col(dark ? '#1B1C1D' : '#F4F5F7'), f.real);
      f.drawMat.color.copy(col(WHITE));
      f.labels.forEach((m) => { m.material.color.copy(col(WHITE)); m.userData.alpha = m.userData.faint ? 0.6 : 1; });
    });
    paintSurfaces();
  }
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F6F7F9';
    colours();
  }

  // ---------- layout: the lens, each drawing's rest (on screen: whole cells, in proportion; in the hallway: on the
  // wall's grid), the camera's path, the hallway's length ----------
  let lay = null, camKeys = null;
  /** opts: u (the cell), strip (its height), noTitleblock, cutY (transition B: the grid line to cut along) */
  function layout(w, h, opts = {}) {
    W = w; H = h;
    const u = opts.u || grid.u; gu = u;
    P = lensP(W, H);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    // (round 7) the canvas exactly as large as its drawing buffer in device pixels: a buffer resampled by a fraction of a
    // pixel softens and shimmers every line in it
    canvas.style.width = `${(Math.round(W * dpr) / dpr).toFixed(4)}px`; canvas.style.height = `${(Math.round(H * dpr) / dpr).toFixed(4)}px`;
    lineMats.forEach((m) => m.resolution.set(Math.round(W * dpr), Math.round(H * dpr)));
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = Math.max(1, P * 0.02);
    const desktop = W >= 1024, N = Math.round(W / u);
    const strip = opts.strip ?? (document.getElementById('strip')?.offsetHeight || 2 * u);
    const tb = document.querySelector('.titleblock'), tbr = !opts.noTitleblock && tb?.getClientRects().length ? tb.getBoundingClientRect() : null;
    const tbTop = tbr && tbr.height ? Math.min(H, tbr.top) : Math.floor(H / u) * u;
    const rT = Math.ceil((strip + (desktop ? 2 : 1) * u) / u - 1e-6), rB = Math.floor((tbTop - u) / u + 1e-6), rows = rB - rT;
    cut = { y: opts.cutY ?? Math.round(H * 0.3 / u) * u, cell: { x: Math.floor(N / 2) * u, y: Math.floor(H / 2 / u) * u } };
    openEl.style.left = `${(desktop ? 5 : 1) * u}px`; openEl.style.top = `${(rT + (desktop ? 3 : 0)) * u}px`; openEl.style.width = `${(desktop ? Math.min(28, N - 10) : N - 2) * u}px`;
    // each drawing at rest: as large as about 60% of the screen's height allows, capped by the width and its label;
    // desktop: the label beside it on its inner side; phones: under it
    const labW = desktop ? Math.min(16, Math.floor(N * 0.3)) : N - 2;
    let zPrev = P * 0.2, Tprev = -Infinity;
    lay = frames.map((f, i) => {
      const [ca, cb] = f.F.cells, el = labEls[i];
      el.style.width = `${labW * u}px`;
      const lr = Math.ceil(el.getBoundingClientRect().height / u - 1e-3);
      const rowsCap = Math.min(Math.round(0.6 * H / u), desktop ? rows : rows - lr - 1);
      const colsCap = desktop ? N - 4 - 2 - labW : N - 2;
      const m = Math.max(1, Math.floor(Math.min(colsCap / ca, rowsCap / cb)));
      const cw = ca * m, ch = cb * m;
      let c0, r0, lc0, lr0;
      if (desktop) {
        const groupW = cw + 2 + labW, g0 = Math.floor((N - groupW) / 2);
        c0 = f.left ? g0 : g0 + labW + 2; lc0 = f.left ? g0 + cw + 2 : g0;
        r0 = rT + Math.max(0, Math.floor((rows - ch) / 2)); lr0 = r0 + Math.max(0, Math.floor((ch - lr) / 2));
      } else {
        c0 = Math.floor((N - cw) / 2); lc0 = 1;
        r0 = rT + Math.max(0, Math.floor((rows - ch - 1 - lr) / 2)); lr0 = r0 + ch + 1;
      }
      const x0 = c0 * u, yTop = r0 * u, tw = cw * u, th_ = ch * u, rect = { left: x0, top: yTop, width: tw, height: th_ };
      el.style.left = `${lc0 * u}px`; el.style.top = `${lr0 * u}px`;
      const rest = TM === 'B' ? restB(f, i, { x0, yTop, tw, th: th_, u, ch }) : restWall(f, i, { x0, yTop, u, m, ca, cb, zPrev });
      zPrev = rest.zc;
      if (TM === 'B') { if (rest.T <= Tprev + 0.5 * P) rest.T = Tprev + 0.5 * P; Tprev = rest.T; rest.zc = P - rest.T; }
      return { ...rest, tw, th: th_, cw, ch, c0, r0, x0, yTop, rect, label: { left: lc0 * u, top: lr0 * u, width: labW * u, height: lr * u }, share: th_ / H };
    });
    L = TM === 'B' ? Math.max(lay[lay.length - 1].T + 1.6 * P, ...lay.map((l, i) => l.Z + frames[i].MW * l.k + 0.1 * P))
      : Math.max(Math.max(...lay.map((l) => l.zMin)) + 0.5 * P, -lay[lay.length - 1].zc + 1.4 * P);
    camera.far = L + P * 3; camera.updateProjectionMatrix();
    camKeys = TM === 'B' ? null : pathKeys();
    frames.forEach((f, i) => {
      const l = lay[i];
      if (TM === 'B') { f.pivot.position.set((f.left ? -1 : 1) * (W / 2 - l.g), (H / 2 - l.yC) / l.rho, -l.Z); f.panel.position.set(f.left ? f.MW / 2 * l.k : -f.MW / 2 * l.k, 0, 0); f.panel.scale.setScalar(l.k); f.pivot.rotation.set(0, 0, 0); }
      else { f.pivot.position.copy(l.centre); f.pivot.rotation.set(0, f.left ? Math.PI / 2 : -Math.PI / 2, 0); f.panel.position.set(0, 0, 0); f.panel.scale.setScalar(l.k); }
      f.pivot.updateMatrixWorld(true);
      const camRest = TM === 'B' ? new THREE.Vector3(0, 0, P - l.T) : l.cam.clone();
      l.camLocal = f.panel.worldToLocal(camRest.clone());
      if (f.extras.length) { const sh = f.extras[0], o = 1.5 / (l.s || 1) / l.k; sh.position.set(o, -o, sh.position.z); f.extras.slice(1).forEach((p) => p.scale.setScalar(2.2 / (l.s || 1) / l.k)); }
    });
    rebuildLabels();
    depthNow = -1; sizeHall(TR === 'A' ? Math.max(0.0001, ease(trs.t)) : 1);
    const sm = W < 1024 ? 1024 : 2048;
    if (key.shadow.mapSize.x !== sm) { key.shadow.mapSize.set(sm, sm); key.shadow.map?.dispose(); key.shadow.map = null; }
    placePhones();
    theme();
  }

  /** A and C: the drawing on the wall's grid; the camera's rest faces it squarely at distance D, so on screen it is
   *  (a m) x (b m) cells at (x0, yTop) while on the wall it is (a k) x (b k) cells: scale s = P / D = m / k. */
  function restWall(f, i, { x0, yTop, u, m, ca, cb, zPrev }) {
    let k = Math.max(1, Math.round(0.5 * W * m / P));
    while (k > 1 && P * k / m > 0.85 * W) k--;
    const s = m / k, D = P / s, ww = ca * k * u, wh = cb * k * u;
    const camX = f.left ? -W / 2 + D : W / 2 - D;
    // height: the drawing's top on a wall row, the camera near eye level
    let yTopW = (H / 2 - yTop) / s; const j = Math.round((H / 2 - yTopW) / u); yTopW = H / 2 - j * u;
    const camY = yTopW - (H / 2 - yTop) / s;
    // along the hallway: each rest well past the one before (a drawing two rests on is outside this view)
    const zTarget = zPrev - Math.max(0.7 * W / s, 0.6 * P);
    let zc, zNear, zFar;
    if (f.left) { zNear = Math.round((zTarget - (x0 - W / 2) / s) / u) * u; zc = zNear + (x0 - W / 2) / s; zFar = zNear - ww; }
    else { zFar = Math.round((zTarget + (x0 - W / 2) / s) / u) * u; zc = zFar - (x0 - W / 2) / s; zNear = zFar + ww; }
    const centre = new THREE.Vector3(f.left ? -W / 2 : W / 2, yTopW - wh / 2, (zNear + zFar) / 2);
    return { s, D, k: ww / f.MW, cam: new THREE.Vector3(camX, camY, zc), yaw: f.left ? Math.PI / 2 : -Math.PI / 2, zc, zMin: -zFar, centre, wallRect: { zNear, zFar, yTop: yTopW, ww, wh } };
  }
  /** B: round 4's swing. Facing you at rest the sheet lands on (x0, yTop), whole cells; on the wall it hangs on the
   *  card's lines (top edge on a row, hinge on a column) where a small gap to the wall allows it. */
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
    if (!best) { const g = 2; best = { j: null, rho: Math.abs(W / 2 - xHinge) / (W / 2 - g), g }; }
    const { rho, g } = best, yC = yTop + th_ / 2, Df = P / rho, k = tw / rho / f.MW;
    const Tw = P * (0.9 + 1.1 * i);
    const iz = Math.round((Tw - P + Df + f.zSheet * k) / u); const T = P + iz * u - Df - f.zSheet * k;
    const Z = iz * u;
    return { rho, g, yC, k, T, Z, d: Df, s: rho, zc: P - T, zMin: Z + f.MW * k };
  }

  /** the camera's path (A and C): the mouth, then for each drawing: walk the axis, turn to face it at its rest, hold,
   *  turn back; then the walk to page 2 */
  function pathKeys() {
    const K = [{ q: 0, p: new THREE.Vector3(0, 0, P), yaw: 0 }, { q: OPEN_AT[1], p: new THREE.Vector3(0, 0, P), yaw: 0 }];
    lay.forEach((l, i) => {
      const [s, e] = STOPS[i], ax = new THREE.Vector3(0, 0, l.zc);
      K.push({ q: s - ARRIVE, p: ax, yaw: 0 }, { q: s - FADE_IN[0], p: l.cam, yaw: l.yaw }, { q: e, p: l.cam, yaw: l.yaw }, { q: e + TURN_OUT, p: ax, yaw: 0 });
    });
    K.push({ q: 1, p: new THREE.Vector3(0, 0, P - L), yaw: 0 });
    return K;
  }
  const camAt = (q) => {
    if (TM === 'B') {
      const K = [[OPEN_AT[1], 0], ...STOPS.flatMap(([s, e], i) => [[s - FADE_IN[0], lay[i].T], [e + TURN_OUT * 0.5, lay[i].T]]), [1, L]];
      let t = 0; if (q > K[0][0]) { t = L; for (let i = 1; i < K.length; i++) if (q <= K[i][0]) { t = lerp(K[i - 1][1], K[i][1], ease(span(q, K[i - 1][0], K[i][0]))); break; } }
      return { p: new THREE.Vector3(0, 0, P - t), yaw: 0 };
    }
    const K = camKeys; if (q <= K[0].q) return K[0];
    for (let i = 1; i < K.length; i++) if (q <= K[i].q) { const a = K[i - 1], b = K[i], t = ease(span(q, a.q, b.q)); return { p: a.p.clone().lerp(b.p, t), yaw: lerp(a.yaw, b.yaw, t) }; }
    return K[K.length - 1];
  };

  /** the hallway's walls, floor, ceiling and end wall for a depth (transition A unfolds it from the screen) */
  let depthNow = -1;
  function sizeHall(t) {
    const depth = Math.max(0.5, L * t); if (Math.abs(depth - depthNow) < 0.01) return; depthNow = depth;
    const tile = 5 * gu;
    planes.forEach((mesh) => {
      const { side } = mesh.userData;
      const [w, h_, pos, rot] = side === 0 ? [depth, H, [-W / 2, 0, -depth / 2], [0, Math.PI / 2, 0]] : side === 1 ? [depth, H, [W / 2, 0, -depth / 2], [0, -Math.PI / 2, 0]]
        : side === 2 ? [W, depth, [0, -H / 2, -depth / 2], [-Math.PI / 2, 0, 0]] : [W, depth, [0, H / 2, -depth / 2], [Math.PI / 2, 0, 0]];
      mesh.scale.set(w, h_, 1); mesh.position.set(...pos); mesh.rotation.set(...rot);
      const ru = w / tile, rv = h_ / tile, map = mesh.material.map;
      map.repeat.set(ru, rv);
      // the grid on the mouth's own lines: walls count rows from the top and cells from the mouth; the floor and ceiling
      // count columns from the left and cells from the mouth
      if (side === 0) map.offset.set(0, -rv); else if (side === 1) map.offset.set(-ru, -rv); else if (side === 2) map.offset.set(0, 0); else map.offset.set(0, -rv);
      mesh.material.normalMap.repeat.copy(map.repeat); mesh.material.normalMap.offset.copy(map.offset);
      mesh.material.aoMap = side >= 2 ? aoRot : ao;
    });
    endWall.scale.set(W, H, 1); endWall.position.set(0, 0, -depth);
    endTex.repeat.set(W / tile, H / tile); endTex.offset.set(0, -H / tile);
    const e = [-W / 2, -H / 2, W / 2, -H / 2, W / 2, H / 2, -W / 2, H / 2], E = [];
    for (let c = 0; c < 4; c++) E.push(e[c * 2], e[c * 2 + 1], 0, e[c * 2], e[c * 2 + 1], -depth);
    for (let c = 0; c < 4; c++) { const n = (c + 1) % 4; E.push(e[c * 2], e[c * 2 + 1], -depth, e[n * 2], e[n * 2 + 1], -depth); }
    edges.geometry.dispose(); edges.geometry = segGeo(E);
  }

  const v3 = new THREE.Vector3();
  const project = (p) => { v3.copy(p).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; };

  // frame 5: drawn -> real, one short timed beat
  let beatRaf = 0, beatFrom = 0, beatT0 = 0, lastQ = 0;
  function beat(f, target) {
    if (f.realTarget === target) return; f.realTarget = target;
    beatFrom = f.real; beatT0 = performance.now(); cancelAnimationFrame(beatRaf);
    if (target > 0 && phones.state === 'ready') phones.mix = 1;
    const step = () => { const t = clamp((performance.now() - beatT0) / 520); f.real = lerp(beatFrom, target, ease2(t)); colours(); render(lastQ, true); if (t < 1) beatRaf = requestAnimationFrame(step); };
    if (reduced) { f.real = target; colours(); return; }
    beatRaf = requestAnimationFrame(step);
  }
  function fitShadow(cam) {
    const sc = key.shadow.camera, n = key.shadow.mapSize.x, half = 1.5 * P;
    const texel = (2 * half) / n, zc = Math.round((cam.z - 1.25 * P) / texel) * texel;
    key.target.position.set(0, 0, zc); key.position.copy(key.target.position).addScaledVector(keyDir, Math.max(W, H) * 2.2);
    sc.left = -Math.max(W, H) * 0.8; sc.right = Math.max(W, H) * 0.8; sc.top = half; sc.bottom = -half; sc.near = 1; sc.far = Math.max(W, H) * 4.4 + P;
    sc.updateProjectionMatrix(); key.target.updateMatrixWorld();
  }

  // the way in: a timed beat (0 -> 1) once the dive starts, back when the visitor scrolls back up before it
  const trs = { t: 0, target: 0, raf: 0, t0: 0, from: 0 };
  function trTo(target) {
    if (trs.target === target) return; trs.target = target; trs.from = trs.t; trs.t0 = performance.now(); cancelAnimationFrame(trs.raf);
    if (reduced) { trs.t = target; return; }
    const dur = TR_MS * Math.max(0.2, Math.abs(target - trs.from));
    const step = () => { const u = clamp((performance.now() - trs.t0) / dur); trs.t = lerp(trs.from, target, u); render(lastQ, true); if (u < 1) trs.raf = requestAnimationFrame(step); };
    trs.raf = requestAnimationFrame(step);
  }

  /** q: 0..1 over the dive. Returns what page 1 needs (page 2's transform, the way in's clip and the stage's push) and
   *  what the checks measure (each drawing's quad and sheet on screen, the end wall). */
  let out = null;
  function render(q, again = false) {
    if (!lay) return null;
    lastQ = q; if (!again) lastScrollRender = performance.now();
    if (phones.warm && !again && resting(q)) requestAnimationFrame(() => idleWarm(true));
    trTo(q >= TR_AT ? 1 : 0);
    const T = ease(trs.t);
    // the way in
    let clip = '', stage = null, cutA = 0;
    sizeHall(TR === 'A' ? Math.max(0.0001, T) : 1);
    if (TR === 'B') {   // the hallway opens from one grid line
      const y = cut.y, a = y * (1 - T), b = (H - y) * (1 - T);
      clip = T >= 1 ? '' : `inset(${a.toFixed(2)}px 0 ${b.toFixed(2)}px 0)`; cutA = trs.t > 0 && trs.t < 0.35 ? 1 : 0;
    } else if (TR === 'C') {   // into one square: the page pushes into a grid cell, which opens into the hallway
      const c = cut.cell, k = 1 + 14 * T, cx = c.x + gu / 2, cy = c.y + gu / 2;
      const x0 = lerp(c.x, 0, T), x1 = lerp(c.x + gu, W, T), y0 = lerp(c.y, 0, T), y1 = lerp(c.y + gu, H, T);
      clip = T >= 1 ? '' : `inset(${y0.toFixed(2)}px ${(W - x1).toFixed(2)}px ${(H - y1).toFixed(2)}px ${x0.toFixed(2)}px)`;
      stage = T > 0 && T < 1 ? { origin: `${cx}px ${cy}px`, transform: `scale(${k.toFixed(4)})`, opacity: 1 - T } : null;
    }
    win.style.clipPath = canvas.style.clipPath = clip;
    canvas.style.opacity = TR === 'A' ? String(clamp(trs.t / 0.18)) : '';
    cutEl.style.opacity = String(cutA); cutLine.setAttribute('y1', cut.y + 0.5); cutLine.setAttribute('y2', cut.y + 0.5);
    // the camera
    const c = camAt(q);
    camera.position.copy(c.p); camera.rotation.set(0, c.yaw, 0); camera.updateMatrixWorld();
    fitShadow(c.p);
    const info = [];
    frames.forEach((f, i) => {
      const [s, e] = STOPS[i], l = lay[i];
      // a drawing shows only while it is faced: in as the camera arrives, out as it starts to turn away
      let op = span(q, s - FADE_IN[0], s - FADE_IN[1]) * (1 - span(q, e + FADE_OUT[0], e + FADE_OUT[1])), swing = 1;
      if (TM === 'B') {
        const out_ = span(q, s - ARRIVE, s - FADE_IN[0]), back = span(q, e + FADE_OUT[0], e + FADE_OUT[1] + S_(0.04));
        swing = ease(out_) * (1 - ease(back));
        f.pivot.rotation.y = (f.left ? 1 : -1) * (1 - swing) * Math.PI / 2;
        op = span(q, s - ARRIVE, s - ARRIVE + S_(0.04)) * (1 - span(q, e + FADE_OUT[0] + S_(0.016), e + FADE_OUT[1] + S_(0.04)));
      }
      f.pivot.visible = op > 0.002;
      f.mats.forEach((m) => { m.opacity = m.userData.base * op; });
      const dp = ease(span(q, s - (TM === 'B' ? ARRIVE * 0.8 : FADE_IN[0]), s - FADE_IN[1] + DRAW * 0.4));
      const n = Math.round(dp * f.d.segs.length); f.drawing.geometry.instanceCount = n; f.drawing.visible = n > 0 && f.pivot.visible;
      f.drawMat.opacity = (1 - f.real) * op;
      f.labels.forEach((m) => { m.visible = f.pivot.visible && n >= m.userData.at && n > 0; m.material.opacity = op * (m.userData.alpha ?? 1) * (1 - f.real); });
      // a whole number of device pixels wide, so the lines don't shimmer as they move
      f.drawMat.linewidth = Math.max(1, Math.round(dpr));
      if (f.still) {
        const live = phones.state === 'ready';
        if (q >= s + REAL_AT && (f.stillOK || live)) beat(f, 1); else if (q < s + REAL_AT) beat(f, 0);
        const stillA = f.real * (live ? 1 - phones.mix : 1);
        f.still.visible = f.stillOK && stillA > 0.001 && f.pivot.visible; f.still.material.opacity = stillA * op;
        const liveA = live ? f.real * phones.mix * op : 0;
        phones.root.visible = liveA > 0.002 && f.pivot.visible;
        if (live) {
          // the turn plays in full by itself once the frame has settled; leaving the rest resets it for next time
          if (q >= s + REAL_AT + S_(0.01) && q <= e + FADE_OUT[1] && f.real > 0.98) startTurn();
          if (q < s - FADE_IN[0] || q > e + S_(0.12)) resetTurn();
          phones.mats.forEach((m) => { m.opacity = m.userData.base * liveA; });
          phones.list.forEach((p, k) => {
            const yaw = k ? Math.max(0, phones.yaw - 0.22 * Math.sin(Math.min(Math.PI, phones.yaw / 2))) : phones.yaw;
            p.pivot.rotation.y = yaw;
            const b = f.blobs[k], sz = p.size, wv = sz.x * Math.abs(Math.cos(yaw)) + sz.z * Math.abs(Math.sin(yaw));
            b.visible = phones.root.visible; b.material.opacity = 0.26 * liveA;
            b.position.set(p.home.u + 3, p.home.v - 5, f.zSheet + 30); b.scale.set(wv * 256 / 136, sz.y * 512 / 392, 1);
          });
        }
        f.blobs.forEach((b) => { if (!live) b.visible = false; });
      }
      const rest = q >= s && q <= e && T >= 1;
      labEls[i].classList.toggle('on', rest);
      // the sheet on screen, and the drawing inside it (for the checks)
      if (f.pivot.visible) {
        f.pivot.updateMatrixWorld(true);
        const z = f.zSheet, q4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([x, y]) => project(new THREE.Vector3(x, y, z).applyMatrix4(f.panel.matrixWorld)));
        const quad = q4(-f.MW / 2, -f.MH / 2, f.MW / 2, f.MH / 2), sheetQ = q4(f.U(0), f.V(f.d.h), f.U(f.d.w), f.V(0));
        info.push({ i, swing: rest ? 1 : TM === 'B' ? swing : 0, op, drawn: dp, quad, sheet: sheetQ, ratio: f.d.w / f.d.h, real: f.real, rest, share: l.share });
      } else info.push({ i, swing: 0, op: 0, drawn: dp, quad: null, sheet: null, ratio: f.d.w / f.d.h, real: f.real, rest: false, share: l.share });
    });
    openEl.classList.toggle('on', q >= OPEN_AT[0] && q <= OPEN_AT[1] && T >= 1);
    // the end wall: there until the last frame has gone
    const endA = 1 - span(q, ...END_FADE);
    endMat.opacity = endA; endWall.visible = endA > 0.001;
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
    // page 2 = the hallway's end: the perspective's scale there (the camera is on the axis for the last walk); hidden
    // until the end wall has gone
    const travel = P - camera.position.z, sc = P / Math.max(1e-3, P + L - travel);
    const ph = { state: phones.state, mix: phones.mix, yaw: phones.yaw, turned: phones.turned, visible: phones.root.visible };
    const o = { clip, stage, scale: Math.min(1, sc), ox: 0, oy: 0, vx: W / 2, vy: H / 2, origin: `${(W / 2).toFixed(2)}px ${(H / 2).toFixed(2)}px`, travel, info, q, phones: ph, page2: endA < 0.999, tr: trs.t, open: T >= 1 };
    if (!again) out = o; else if (out) Object.assign(out, { info, phones: ph, clip, stage, tr: trs.t, open: T >= 1, page2: endA < 0.999 });
    if (again) onAgain?.(out);
    return out;
  }
  let onAgain = null;
  /** draw every frame once, whole, so its buffers and textures reach the GPU now and not mid-walk */
  function warm(q = 0.5) {
    render(q);
    frames.forEach((f) => { f.pivot.visible = true; f.drawing.visible = true; f.drawing.geometry.instanceCount = f.d.segs.length; f.labels.forEach((m) => { m.visible = true; }); if (f.still && f.stillOK) f.still.visible = true; });
    try { renderer.compile(scene, camera); } catch (e) {}
    renderer.render(scene, camera);
    render(q);
    reset();
  }
  /** before the dive (or after warming up): the way in waits at its start, so it plays when the visitor arrives */
  function reset() { if (!trs.t && !trs.target && !trs.raf) return; cancelAnimationFrame(trs.raf); trs.raf = 0; trs.t = 0; trs.target = 0; }
  return { layout, render, load, warm, reset, theme, loadPhones, look: LOOK.id, treatment: TM, transition: TR, stops: STOPS, phones: () => phones.state, frames: () => frames, lay: () => lay, P: () => P, L: () => L, onBeat: (fn) => { onAgain = fn; } };
}

// Page 1 -> page 2: the "?" dot dive and the hallway (Part 5 "Round 4 picks" + "Round 5"). The dot of "Now, what do
// you need?" (measured on the real rendered glyph, after fonts load and on every resize) grows into a circular window;
// through it, a hallway about two screens long with four framed blueprints, left, right, left, right. Each is our own
// schematic as a cyanotype blueprint (white lines on #173F73, site/js/page01/corridor-drawings.js).
// Round 5: the hallway is lit, not drawn. Real CC0 surfaces under real light with soft shadows, in one of three looks
// (site/js/page01/hall-looks.js: A architect's model on the page, B gallery, C engineering lab), and every frame is a
// real object: a moulding with depth, a mat with a bevelled window, the blueprint set back behind it, glass in front
// that catches the light as the frame turns, a hinge. As you reach a frame it swings out from its wall to face you
// square-on while its drawing draws itself on; you stop; one plain line under it; then it swings back and fades
// before it nears the screen edge. Frame 4: the blueprint of our app's screen turns into the real iPhone 18 and
// Galaxy S26 (live 3D, loaded as the dive begins, lit by the same studio as phone A), which turn to show their backs
// and settle front-on on our booking app. The still image stands in while they load, with reduced motion, and when
// the git-ignored files are missing. Page 2 waits at the hallway's end and lands 1:1.
// No stretching: the camera is a true perspective (no uneven scale anywhere); its field of view is 50 degrees across
// the narrower side of the screen, capped at 66 degrees across, so phones and wide windows see the same hallway; a
// facing frame is parallel to the screen, so it shows its drawing's exact proportions.
// WebGL (three.js): drawings are line geometry (drawn on by count), labels small textures, so nothing re-rasters.
// Scroll-scrubbed (q = 0..1 over the dive), freeze-safe; frame 4's drawn -> real is one short timed beat, and the
// phones' turn follows the scroll through a critically damped spring (it always settles where the scroll says).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { FRAMES, PHONE_PAIR } from './corridor-drawings.js';
import { LOOKS, hallPick } from './hall-looks.js';
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
// the timeline (q): the window opens, then four stops [s, e] (the camera rests, the caption shows), then page 2.
// Round 5: frame 4 rests longer (the real phones turn there); the first three come a little sooner.
export const STOPS = [[0.25, 0.305], [0.42, 0.475], [0.59, 0.645], [0.77, 0.92]];
const OPEN = { grow: [0, 0.06], ink: [0.04, 0.09], open: [0.06, 0.18], travel0: 0.07 };
// a frame leaves while the camera still rests (HOLD after its stop): it swings back to its wall and fades, so it is
// gone before the walk on could carry it towards the screen edge
const SWING = 0.1, DRAW = 0.09, HOLD = 0.032, LEAVE = [0.002, 0.03];
// frame 4: the real phones appear (timed beat) just after the stop begins, then turn over [TURN] of the stop
const REAL_AT = 0.012, TURN = [0.03, 0.135];

/** where the dot of the last "?" in `el` is, on screen: draw that "?" in the same font on a canvas and take its
 *  lowest ink blob (the dot). Word reveal transforms are switched off while measuring (the settled position). */
export function measureDot(el) {
  const tn = [...walk(el)].reverse().find((n) => n.textContent.includes('?')); if (!tn) return null;
  const host = el.closest('.p1-txt') || el;
  host.classList.add('is-measuring');
  const i = tn.textContent.lastIndexOf('?'), rg = document.createRange(); rg.setStart(tn, i); rg.setEnd(tn, i + 1);
  const r = rg.getBoundingClientRect();
  const cs = getComputedStyle(tn.parentElement);
  host.classList.remove('is-measuring');
  if (!r.width) return null;
  const k = 4, size = parseFloat(cs.fontSize);
  const c = document.createElement('canvas'); c.width = Math.ceil(r.width * k) + 8; c.height = Math.ceil(r.height * k) + 8;
  const x = c.getContext('2d');
  x.font = `${cs.fontStyle} ${cs.fontWeight} ${size * k}px ${cs.fontFamily}`;
  if ('fontStretch' in x) x.fontStretch = 'normal';
  const m = x.measureText('?');
  const base = (r.height * k - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;   // the line box centres the content area
  x.fillStyle = '#000'; x.textBaseline = 'alphabetic'; x.fillText('?', 4, 4 + base);
  const { data, width: w, height: h } = x.getImageData(0, 0, c.width, c.height);
  const ink = (px, py) => data[(py * w + px) * 4 + 3] > 127;
  let sx = -1, sy = -1;
  for (let py = h - 1; py >= 0 && sy < 0; py--) for (let px = 0; px < w; px++) if (ink(px, py)) { sx = px; sy = py; break; }
  if (sy < 0) return null;
  const seen = new Uint8Array(w * h), st = [[sx, sy]]; let n = 0, mx = 0, my = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  while (st.length) {
    const [px, py] = st.pop(); if (px < 0 || py < 0 || px >= w || py >= h) continue; const id = py * w + px;
    if (seen[id] || !ink(px, py)) continue; seen[id] = 1; n++; mx += px; my += py;
    x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
  }
  return { x: r.left + (mx / n - 4) / k, y: r.top + (my / n - 4) / k, r: Math.max(x1 - x0 + 1, y1 - y0 + 1) / 2 / k, rect: r };
}
function* walk(n) { if (n.nodeType === 3) yield n; else for (const c of n.childNodes) yield* walk(c); }

const BLUE = '#173F73', WHITE = '#FFFFFF';
const MOUNT = 0.07;   // the mount margin (moulding + visible mat), as a share of the drawing's width

// a label (mono, white) as a small texture on a plane, in drawing units (y down), anchored at its baseline
function labelMesh(l, fontPx = 56) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const font = `500 ${fontPx}px "DM Mono", ui-monospace, monospace`;
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  const tw = Math.ceil(x.measureText(l.t).width) + 8;
  c.width = tw; c.height = Math.ceil(fontPx * 1.4);
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(l.t, 4, fontPx * 1.05);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const s = l.size / fontPx, pw = c.width * s, ph = c.height * s;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
  const ax = l.anchor === 'middle' ? -pw / 2 : l.anchor === 'end' ? -pw : 0;
  mesh.userData = { cx: l.x + ax + pw / 2 - 4 * s, cy: l.y - fontPx * 1.05 * s + ph / 2, at: l.at };
  return mesh;
}

// small canvas textures
function canvasTex(w, h, draw, srgb = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
// 1-pixel stand-ins until the scans arrive (plain textures, so the scan can later replace their image)
const pixel = (css, srgb) => { const t = canvasTex(1, 1, (x) => { x.fillStyle = css; x.fillRect(0, 0, 1, 1); }, srgb); t.flipY = false; return t; };
const flatNormal = () => pixel('#8080FF', false);
const whiteTex = () => pixel('#FFFFFF', true);
// ambient occlusion where two surfaces meet: darker towards both long edges of a strip (v = 0 and v = 1)
const aoTex = () => canvasTex(4, 256, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#6E6E6E'); g.addColorStop(0.07, '#D2D2D2'); g.addColorStop(0.16, '#FFFFFF'); g.addColorStop(0.84, '#FFFFFF'); g.addColorStop(0.93, '#D2D2D2'); g.addColorStop(1, '#6E6E6E');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
});
// a soft, blurred rounded rectangle as an alpha map (contact shadows)
const blobTex = (rx = 0.27, ry = 0.38, r = 26, blur = 22) => canvasTex(256, 512, (x, w, h) => {
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.filter = `blur(${blur}px)`; x.fillStyle = '#fff';
  x.beginPath(); x.roundRect(w * (0.5 - rx), h * (0.5 - ry), w * 2 * rx, h * 2 * ry, r); x.fill();
});
// the mat's shadow on the blueprint inside its window: light from above left, so a soft band along the top and left
const insetTex = () => canvasTex(256, 256, (x, w, h) => {
  x.clearRect(0, 0, w, h);
  let g = x.createLinearGradient(0, 0, 0, h * 0.09); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h * 0.09);
  g = x.createLinearGradient(0, 0, w * 0.06, 0); g.addColorStop(0, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w * 0.06, h);
});

/** retrying image load (the plain local server can refuse under bursts) -> ImageBitmap or HTMLImageElement */
async function loadImage(url) {
  for (let n = 0; n < 5; n++) {
    try {
      const r = await fetch(n ? `${url}?r=${n}` : url); if (r.status === 404) return null; if (!r.ok) throw new Error(r.status);
      const b = await r.blob();
      // decoded off the main thread, already flipped (WebGL can't flip an ImageBitmap on upload)
      if (self.createImageBitmap) return await createImageBitmap(b, { imageOrientation: 'flipY' });
      const img = new Image(); img.src = URL.createObjectURL(b); await img.decode(); img.flipped = false; return img;
    } catch (e) { await new Promise((res) => setTimeout(res, 150 * (n + 1))); }
  }
  return null;
}

/** root: the hallway's ground (under page 2's stage: in look A, the light above the open model); top (over page 2):
 *  the hallway itself (WebGL, a transparent canvas), the ring, the ink dot and the captions. Page 2 stands at the
 *  hallway's end, so walls and frames never cover it on screen and every frame is in front of it: drawing the hallway
 *  above page 2 is exact, with no clip on page 2 (a clip that changes every frame made page 2 repaint). */
export function createDive(root, top, { base = '', look } = {}) {
  const LOOK = LOOKS[look || hallPick()] || LOOKS.A;
  root.innerHTML = `<div class="dive__win"></div>`;
  top.innerHTML = `<canvas class="dive__gl"></canvas><svg class="dive__ring"><circle></circle></svg><i class="dive__dot"></i><div class="dive__caps">${
    FRAMES.map((f) => `<p class="dive__cap"><span class="ph" data-draft>Draft</span><span class="dive__cap-t">${f.caption}</span></p>`).join('')}</div>`;
  root.dataset.look = top.dataset.look = LOOK.id;
  const win = root.querySelector('.dive__win'), canvas = top.querySelector('.dive__gl');
  const ring = top.querySelector('.dive__ring circle'), dotEl = top.querySelector('.dive__dot');
  const capEls = [...top.querySelectorAll('.dive__cap')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = LOOK.exposure;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);   // transparent: the ground (and page 2) are the layers under it
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  const phoneScene = new THREE.Scene();   // the real phones: lit by the studio alone, exactly as phone A
  const lineMats = [];
  const lmat = (o) => { const m = new LineMaterial({ linewidth: 1, worldUnits: false, transparent: true, toneMapped: false, ...o }); lineMats.push(m); return m; };
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr); return g; };

  // ---------- the surfaces: walls, floor, ceiling (if any), each a lit CC0 scan ----------
  const ao = aoTex();
  const surf = (spec) => {
    if (!spec) return null;
    const map = spec.grid ? canvasTex(1024, 1024, () => {}, true) : whiteTex();
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = renderer.capabilities.getMaxAnisotropy(); map.minFilter = THREE.LinearMipmapLinearFilter;
    const nm = flatNormal(); nm.wrapS = nm.wrapT = THREE.RepeatWrapping;
    const m = new THREE.MeshStandardMaterial({ map, normalMap: nm, normalScale: new THREE.Vector2(spec.normal, spec.normal), roughness: spec.rough, metalness: 0, aoMap: ao, aoMapIntensity: 0.55, envMapIntensity: spec.env });
    return { spec, m, maps: [] };
  };
  const S = { walls: surf(LOOK.walls), floor: surf(LOOK.floor), ceiling: surf(LOOK.ceiling) };
  // left, right, floor, ceiling: each mesh gets its own clone of the maps (its own repeat); the AO runs across each
  const planes = [['walls', 0], ['walls', 1], ['floor', 2], ['ceiling', 3]].filter(([k]) => S[k]).map(([k, side]) => {
    const s = S[k], m = s.m.clone();
    m.map = s.m.map.clone(); m.normalMap = s.m.normalMap.clone(); s.maps.push(m);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
    mesh.receiveShadow = true; mesh.castShadow = side < 2 && LOOK.wallsCast; mesh.userData = { k, side };
    scene.add(mesh); return mesh;
  });
  // the scans, when they arrive (until then: flat colour; swapping a texture of the same kind needs no recompile)
  let surfImgs = {};
  async function loadSurfaces(b = base) {
    const want = [...new Set(Object.values(S).filter(Boolean).map((s) => s.spec.tex))];
    await Promise.all(want.map(async (id) => {
      const [c, n] = await Promise.all([loadImage(`${b}media/materials/${id}/color.webp`), loadImage(`${b}media/materials/${id}/normal.webp`)]);
      surfImgs[id] = { c, n };
    }));
    paintSurfaces();
  }
  /** A: the card with the drafting grid printed on it (a canvas: the paper scan, then the grid in ink); B, C: the scans.
   *  Painted once per theme and once when the scans arrive (never per frame). */
  let painted = '';
  function paintSurfaces() {
    const tag = `${dark}|${Object.keys(surfImgs).join()}`; if (tag === painted) return; painted = tag;
    Object.values(S).filter(Boolean).forEach((s) => {
      const img = surfImgs[s.spec.tex];
      if (s.spec.grid) {
        const c = s.m.map.image, x = c.getContext('2d'), w = c.width, T = s.spec.tile, px = w / T;
        x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = s.spec.base[dark ? 1 : 0]; x.fillRect(0, 0, w, w);
        if (img?.c) { x.globalCompositeOperation = dark ? 'overlay' : 'multiply'; x.globalAlpha = dark ? 0.12 : 1; x.drawImage(img.c, 0, 0, w, w); }
          x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
          const ln = dark ? '242,240,235' : '18,18,18';
          // minors every 20 px, majors every 100 px (as page 2's grid), as fine lines on the card
          for (let v = 0; v < T; v += 20) { const major = v % 100 === 0; x.fillStyle = `rgba(${ln},${major ? (dark ? 0.16 : 0.13) : (dark ? 0.07 : 0.055)})`; const t = Math.max(1, px * (major ? 1.1 : 0.8)); x.fillRect(0, v * px, w, t); x.fillRect(v * px, 0, t, w); }
      }
      s.maps.forEach((m) => {
        if (s.spec.grid) m.map.needsUpdate = true;
        else if (img?.c) { m.map.image = img.c; m.map.flipY = false; m.map.needsUpdate = true; }
        if (img?.n) { m.normalMap.image = img.n; m.normalMap.flipY = false; m.normalMap.needsUpdate = true; }
      });
    });
  }

  // the edges (look A: the corridor's edges stay ink hairlines)
  const edgeMat = lmat({ opacity: LOOK.edges });
  const edges = new LineSegments2(segGeo([0, 0, 0, 0, 0, 1]), edgeMat); edges.renderOrder = 1; edges.visible = LOOK.edges > 0; scene.add(edges);
  // look C: the ceiling's light strips (light fixtures: plain bright planes, no glow)
  const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide });
  const strips = new THREE.Mesh(new THREE.BufferGeometry(), stripMat); strips.visible = !!LOOK.strips; scene.add(strips);

  // ---------- light ----------
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1); key.castShadow = true; scene.add(key); scene.add(key.target);
  key.shadow.camera.up.set(0, 0, -1); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.6; key.shadow.radius = LOOK.key.radius;
  const keyDir = new THREE.Vector3(...LOOK.key.dir).normalize();
  const spots = LOOK.spots ? FRAMES.map(() => { const s = new THREE.SpotLight(0xffffff, 1, 0, LOOK.spots.angle, LOOK.spots.penumbra, 0); scene.add(s); scene.add(s.target); return s; }) : [];
  let envTex = null;

  // ---------- the frames: real objects ----------
  const glassMat = () => new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0, roughness: 0.035, ior: 1.52, specularIntensity: 1, envMapIntensity: LOOK.glass, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const insetMap = insetTex(), blobMap = blobTex();
  const frames = FRAMES.map((F, i) => {
    const d = F.draw, mg = d.w * MOUNT, MW = d.w + 2 * mg, MH = d.h + 2 * mg;
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = F.side === 'l';
    // panel coordinates: drawing units, x from the hinge edge (0) into the hallway, y up, centred vertically; z out of the wall
    const ox = left ? 0 : -MW, U = (u) => ox + mg + u, V = (v) => MH / 2 - mg - v;
    const FW = LOOK.frame.w * d.w, FD = LOOK.frame.d * d.w, tm = d.w * 0.006;
    const zMat = FD * 0.42, zSheet = zMat - tm, zGlass = FD * 0.82;
    const mats = [];
    const own = (m, base = 1) => { m.transparent = true; m.userData.base = base; mats.push(m); return m; };
    // the moulding: four bars with softened edges, so each catches a line of light
    const r = Math.min(FW, FD) * 0.22, bar = (w, h, x, y) => { const g = new RoundedBoxGeometry(w, h, FD, 2, r); g.translate(x, y, FD / 2); return g; };
    const mouldGeo = mergeGeometries([bar(MW, FW, ox + MW / 2, MH / 2 - FW / 2), bar(MW, FW, ox + MW / 2, -MH / 2 + FW / 2), bar(FW, MH - 2 * FW, ox + FW / 2, 0), bar(FW, MH - 2 * FW, ox + MW - FW / 2, 0)]);
    const mouldMat = own(new THREE.MeshStandardMaterial({ envMapIntensity: 1 }));
    const mould = new THREE.Mesh(mouldGeo, mouldMat); mould.castShadow = true; mould.receiveShadow = true; panel.add(mould);
    // the hinge: two knuckles on the wall edge
    const kn = new THREE.CylinderGeometry(FW * 0.42, FW * 0.42, MH * 0.07, 16);
    const hinge = new THREE.Mesh(mergeGeometries([kn.clone().translate(0, MH * 0.36, FD * 0.3), kn.clone().translate(0, -MH * 0.36, FD * 0.3)]), mouldMat); hinge.castShadow = true; panel.add(hinge);
    // the mat: a board with a window for the drawing, its bevel cut at 45 degrees (the board's white core shows)
    const wl = U(0), wr = U(d.w), wt = V(0), wb = V(d.h);
    const shape = new THREE.Shape([new THREE.Vector2(ox, -MH / 2), new THREE.Vector2(ox + MW, -MH / 2), new THREE.Vector2(ox + MW, MH / 2), new THREE.Vector2(ox, MH / 2)]);
    shape.holes.push(new THREE.Path([new THREE.Vector2(wl - tm, wb - tm), new THREE.Vector2(wl - tm, wt + tm), new THREE.Vector2(wr + tm, wt + tm), new THREE.Vector2(wr + tm, wb - tm)]));
    const matGeo = new THREE.ShapeGeometry(shape); matGeo.translate(0, 0, zMat);
    const matMat = own(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, envMapIntensity: 0.4 }));
    const mat = new THREE.Mesh(matGeo, matMat); mat.receiveShadow = true; mat.castShadow = true; panel.add(mat);
    const bev = []; const q4 = (a, b, c, e) => bev.push(...a, ...b, ...c, ...a, ...c, ...e);
    const I = (x, y) => [x, y, zSheet], O = (x, y) => [x, y, zMat];
    q4(I(wl, wb), I(wr, wb), O(wr + tm, wb - tm), O(wl - tm, wb - tm));   // bottom
    q4(I(wr, wb), I(wr, wt), O(wr + tm, wt + tm), O(wr + tm, wb - tm));   // right
    q4(I(wr, wt), I(wl, wt), O(wl - tm, wt + tm), O(wr + tm, wt + tm));   // top
    q4(I(wl, wt), I(wl, wb), O(wl - tm, wb - tm), O(wl - tm, wt + tm));   // left
    const bevGeo = new THREE.BufferGeometry(); bevGeo.setAttribute('position', new THREE.Float32BufferAttribute(bev, 3)); bevGeo.computeVertexNormals();
    const bevMat = own(new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, envMapIntensity: 0.5, side: THREE.DoubleSide }));
    const bevel = new THREE.Mesh(bevGeo, bevMat); bevel.receiveShadow = true; panel.add(bevel);
    // the blueprint (exact colour: unlit, never tone-mapped), the mat's soft shadow on it, its lines and labels
    const sheetMat = own(new THREE.MeshBasicMaterial({ toneMapped: false }));
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(d.w, d.h), sheetMat); sheet.position.set(U(d.w / 2), V(d.h / 2), zSheet); panel.add(sheet);
    const insetMat = own(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: insetMap, depthWrite: false, toneMapped: false }), 0.32);
    const inset = new THREE.Mesh(new THREE.PlaneGeometry(d.w, d.h), insetMat); inset.position.set(U(d.w / 2), V(d.h / 2), zSheet + 0.25); panel.add(inset);
    const pos = new Float32Array(d.segs.length * 6);
    d.segs.forEach(([a, b, c, e], k) => pos.set([U(a), V(b), zSheet + 0.45, U(c), V(e), zSheet + 0.45], k * 6));
    const drawMat = lmat({ opacity: 1 });
    const drawing = new LineSegments2(segGeo(pos), drawMat); drawing.geometry.instanceCount = 0; panel.add(drawing);
    const labels = d.labels.map((l) => { const m = labelMesh(l); m.position.set(U(m.userData.cx), V(m.userData.cy), zSheet + 0.6); m.visible = false; panel.add(m); return m; });
    // the glass: reflections only, added over the frame's opening (so the blueprint's colours stay exact)
    const gMat = own(glassMat());
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(MW - 2 * FW, MH - 2 * FW), gMat); glass.position.set(ox + MW / 2, 0, zGlass); glass.renderOrder = 3; panel.add(glass);
    // frame 4: the real phones' still (git-ignored file: may be missing, then it stays a blueprint) and their shadows
    let still = null, blobs = null;
    if (F.real && d.region) {
      const rg = d.region, sm = own(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
      still = new THREE.Mesh(new THREE.PlaneGeometry(rg.w, rg.h), sm); still.position.set(U(rg.u + rg.w / 2), V(rg.v + rg.h / 2), zSheet + 0.3); still.visible = false; panel.add(still);
      blobs = PHONE_PAIR.phones.map(() => { const m = own(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blobMap, depthWrite: false, toneMapped: false }), 0.26); const b = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); b.position.z = zGlass + 0.3; b.renderOrder = 4; b.visible = false; panel.add(b); return b; });
    }
    return { F, d, i, left, MW, MH, mg, FW, FD, zSheet, zGlass, U, V, pivot, panel, mould, hinge, mat, bevel, sheet, drawing, labels, glass, still, blobs, stillOK: false, real: 0, realTarget: 0, drawMat, mats, mouldMat, matMat, bevMat };
  });
  const f4 = frames.find((f) => f.still);

  // ---------- frame 4: the real phones, live (loaded when the dive begins) ----------
  const phones = { state: 'idle', list: [], root: new THREE.Group(), mix: 0, yaw: 0, v: 0, target: 0, mats: [] };
  phones.root.matrixAutoUpdate = false; phones.root.visible = false; phoneScene.add(phones.root);
  let phonesP = null;
  /** load the iPhone 18 and the S26 (git-ignored; missing -> the still stays). Decoded off the main thread, their
   *  textures sent to the GPU one per frame and their shaders compiled in parallel, so the walk doesn't stutter. */
  function loadPhones(b = base) {
    if (phonesP || reduced || !f4) return phonesP || Promise.resolve(phones.state);
    phones.state = 'loading';
    phonesP = (async () => {
      try {
        const mark = (n) => { try { performance.mark(`phones:${n}`); } catch (e) {} };   // for tests (tools/phone_r5.py)
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
        // textures to the GPU, one per frame; then the shaders, compiled in parallel where the browser can
        const texs = new Set(); phones.root.traverse((m) => { if (m.isMesh) ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'clearcoatNormalMap'].forEach((k) => m.material[k] && texs.add(m.material[k])); });
        for (const t of texs) { renderer.initTexture(t); await new Promise((r) => requestAnimationFrame(r)); }
        mark('textures');
        phones.root.visible = true;
        try { await renderer.compileAsync(phoneScene, camera); } catch (e) { try { renderer.compile(phoneScene, camera); } catch (e2) {} }
        phones.root.visible = false; mark('compiled');
        placePhones();
        phones.state = 'ready';
        // the GPU finishes a program on its first real draw (about 90 ms once on the S23, even after compileAsync), so the
        // phones are drawn once, invisibly, the first moment the visitor pauses (or when frame 4 needs them)
        phones.warm = true; idleWarm();
        if (f4.real > 0.001) liveTo(1); else phones.mix = 1;   // the still is showing: hand over to the live phones
        render(lastQ, true);
      } catch (e) { console.warn('[dive] phones', e); phones.state = 'missing'; }
      return phones.state;
    })();
    return phonesP;
  }
  // where the phones sit in frame 4's panel: in front of its glass, so they can turn; moved towards the camera's axis
  // and scaled by the same perspective, so front-on they cover the blueprint's outlines exactly
  function placePhones() {
    if (!f4 || !lay || !phones.list.length) return;
    const l = lay[f4.i], k = l.k, R = PHONE_PAIR.region, m = f4.d.region;
    const zPh = f4.zGlass + 46, D = l.d, c = (D - zPh * k) / (D - f4.zSheet * k);
    const axX = -f4.pivot.position.x / k, axY = -f4.pivot.position.y / k;
    phones.list.forEach((p) => {
      const sp = p.spec, cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2;
      const u = f4.U(m.u + (cx - R.x0)), v = f4.V(m.v + (R.y1 - cy));
      p.pivot.position.set(axX + (u - axX) * c, axY + (v - axY) * c, zPh); p.pivot.scale.setScalar(c);
      p.home = { u, v };
    });
  }
  let lastScrollRender = 0, warmT = 0;
  // the warm-up draw happens when the visitor pauses, or while the camera rests at frame 1, 2 or 3 (the picture is still
  // then: nothing on screen moves, so one long frame can't be seen)
  const resting = (q) => STOPS.slice(0, 3).some(([s, e]) => q >= s + 0.015 && q <= e - 0.004);
  function idleWarm(force) {
    clearTimeout(warmT);
    if (!phones.warm) return;
    if (!force && performance.now() - lastScrollRender < 220 && !resting(lastQ)) { warmT = setTimeout(idleWarm, 120); return; }
    phones.warmNow = true; render(lastQ, true); phones.warmNow = false; phones.warm = false;
    try { performance.mark('phones:warmed'); } catch (e) {}
  }
  // the drawn -> real beat and the still -> live hand-over, both short timed beats
  let liveRaf = 0;
  function liveTo(t) {
    cancelAnimationFrame(liveRaf); const from = phones.mix, t0 = performance.now();
    const step = () => { const u = clamp((performance.now() - t0) / 420); phones.mix = lerp(from, t, ease2(u)); render(lastQ, true); if (u < 1) liveRaf = requestAnimationFrame(step); };
    liveRaf = requestAnimationFrame(step);
  }
  // the turn: target from the scroll (front -> back -> front), followed by a critically damped spring
  const turnAt = (u) => { const K = [[0, 0], [0.42, Math.PI], [0.58, Math.PI], [1, 2 * Math.PI]]; for (let i = 1; i < K.length; i++) if (u <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(u, K[i - 1][0], K[i][0]))); return 2 * Math.PI; };
  let springRaf = 0, springT = 0;
  function spring() {
    if (springRaf) return; springT = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - springT) / 1000); springT = now;
      const w = 7.5, a = -w * w * (phones.yaw - phones.target) - 2 * w * phones.v;
      phones.v += a * dt; phones.yaw += phones.v * dt;
      const done = Math.abs(phones.yaw - phones.target) < 2e-4 && Math.abs(phones.v) < 2e-3;
      if (done) { phones.yaw = phones.target; phones.v = 0; }
      render(lastQ, true);
      springRaf = done ? 0 : requestAnimationFrame(step);
    };
    springRaf = requestAnimationFrame(step);
  }

  let loaded = null;
  let envP = null;
  /** label fonts, the surfaces' scans, the studio light and the frame-4 still; resolves when they are in (a missing
   *  still resolves too) */
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await document.fonts.load('500 56px "DM Mono"'); } catch (e) {}
    rebuildLabels();   // made again now the font is in (before it, they used the fallback)
    envP = studio(renderer, b).then((e) => { envTex = e; scene.environment = e; phoneScene.environment = e; colours(); }).catch(() => {});
    const jobs = [loadSurfaces(b), envP];
    if (f4) jobs.push((async () => {
      const img = await loadImage(`${b}${f4.F.real}`);   // git-ignored (licences unverified): a 404 means it isn't there
      if (img) { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.flipY = img.flipped === false; t.needsUpdate = true; f4.still.material.map = t; f4.still.material.needsUpdate = true; renderer.initTexture(t); f4.stillOK = true; }
    })());
    await Promise.all(jobs);
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    return true;
  })());
  function rebuildLabels() {
    frames.forEach((f) => {
      f.labels.forEach((m) => { f.panel.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
      f.labels = f.d.labels.map((l) => { const m = labelMesh(l); m.position.set(f.U(m.userData.cx), f.V(m.userData.cy), f.zSheet + 0.6); m.visible = false; f.panel.add(m); return m; });
    });
    colours();
  }

  let W = 1, H = 1, P = 1, L = 1, dot = null, ink = '#121212', paper = '#F2F0EB', dark = false;
  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.setStyle('#888'); } return c; };
  const th = (pair) => (Array.isArray(pair) ? pair[dark ? 1 : 0] : pair);
  function colours() {
    const inkC = col(ink), matC = col(th(LOOK.mat));
    Object.values(S).filter(Boolean).forEach((s) => s.maps.forEach((m) => { m.color.copy(col(th(s.spec.color))); }));
    edgeMat.color.copy(inkC);
    hemi.color.copy(col(th(LOOK.hemi.sky))); hemi.groundColor.copy(col(th(LOOK.hemi.ground))); hemi.intensity = th(LOOK.hemi.i);
    key.color.copy(col(LOOK.key.color)); key.intensity = th(LOOK.key.i);
    spots.forEach((s) => { s.color.copy(col(LOOK.spots.color)); s.intensity = th(LOOK.spots.i); });
    stripMat.color.copy(col(LOOK.strips ? th(LOOK.strips.color) : '#FFFFFF'));
    scene.environmentIntensity = th(LOOK.env);
    frames.forEach((f) => {
      f.mouldMat.color.copy(col(th(LOOK.frame.color))); f.mouldMat.metalness = th(LOOK.frame.metal); f.mouldMat.roughness = th(LOOK.frame.rough);
      f.matMat.color.copy(matC); f.bevMat.color.copy(matC).lerp(col('#FFFFFF'), dark && LOOK.id === 'A' ? 0.25 : 0.6);
      f.sheet.material.color.copy(col(BLUE)).lerp(matC, f.real);
      f.drawMat.color.copy(col(WHITE));
      const labInk = LOOK.id === 'A' && dark ? col('#F2F0EB') : col('#121212');
      f.labels.forEach((m) => { m.material.color.copy(f.real >= 0.5 ? labInk : col(WHITE)); });
    });
    paintSurfaces();
  }
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F2F0EB';
    colours();
  }

  // ---------- layout: the lens, where each frame faces you, the hallway's length ----------
  let lay = null;
  function layout(w, h, d) {
    W = w; H = h; dot = d;
    P = lensP(W, H);
    renderer.setSize(W, H, false);
    lineMats.forEach((m) => m.resolution.set(W * dpr, H * dpr));
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = Math.max(1, P * 0.02);
    const desktop = W >= 1024;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const strip = document.getElementById('strip')?.offsetHeight || 40;
    const tb = document.querySelector(".titleblock"), tbr = tb?.getClientRects().length ? tb.getBoundingClientRect() : null, tbTop = tbr && tbr.height ? Math.min(H, tbr.top) : H;   // (fixed: offsetParent is null)
    const bandT = strip + (desktop ? 2.5 * rem : 20), bandB = Math.min(H - 16, tbTop - (desktop ? 1.5 * rem : 14));
    const capH = desktop ? 4.8 * rem : 64, g = 2;   // room for a two-line caption and its gap
    const T0 = 0.6, SP = 1.1;
    lay = frames.map((f, i) => {
      const a = f.MW / f.MH, bandH = bandB - bandT;
      let tw, th_;
      if (desktop) { th_ = Math.min(0.52 * H, bandH - capH); tw = th_ * a; if (tw > 0.44 * W) { tw = 0.44 * W; th_ = tw / a; } }
      else { tw = W - 32 - 30; th_ = tw / a; if (th_ > bandH - capH) { th_ = bandH - capH; tw = th_ * a; } }
      const yTop = bandT + Math.max(0, (bandH - th_ - capH) / 2), yC = yTop + th_ / 2;
      // the frame's outer margin from its own screen edge; desktop: centred about 27% in from that edge
      let m = desktop ? Math.max(0.06 * W, 0.27 * W - tw / 2) : 16;
      // round 5: the frame is an object; its moulding's front face stands proud of the wall, nearer the camera, so it
      // looks larger than the outline at the wall by 1 / (1 - depth * width / P). The margin is kept by the front face.
      const front = 1 / (1 - LOOK.frame.d * f.d.w / f.MW * tw / P);
      m = W / 2 - (W / 2 - m) / front;
      let dd = P * (W / 2 - g) / (W / 2 - m);
      // keep it inside the hallway's height at that distance (the ceiling and floor)
      const dMax = P * Math.min((H / 2) / Math.max(1, H / 2 - yTop), (H / 2) / Math.max(1, yTop + th_ - H / 2)) * 0.98;
      if (dd > dMax) { dd = dMax; m = W / 2 - (W / 2 - g) * P / dd; }
      const k = (tw * dd / P) / f.MW;                       // world units per drawing unit
      const Ti = P * (T0 + SP * i), Z = dd - P + Ti;
      const x0 = f.left ? m : W - m - tw;
      return { tw, th: th_, m, d: dd, k, T: Ti, Z, yC, yTop, x0, g, rect: { left: x0, top: yTop, width: tw, height: th_ } };
    });
    const last = lay[lay.length - 1];
    L = Math.max(last.T + 1.6 * P, ...lay.map((l, i) => l.Z + frames[i].MW * l.k + 0.1 * P));
    camera.far = L + P * 2; camera.updateProjectionMatrix();
    // walls (left, right), floor, ceiling, each from the mouth (z = 0) to the end (z = -L)
    planes.forEach((mesh) => {
      const { k: kind, side } = mesh.userData, s = S[kind].spec;
      const [w, h_, pos, rot] = side === 0 ? [L, H, [-W / 2, 0, -L / 2], [0, Math.PI / 2, 0]] : side === 1 ? [L, H, [W / 2, 0, -L / 2], [0, -Math.PI / 2, 0]]
        : side === 2 ? [W, L, [0, -H / 2, -L / 2], [-Math.PI / 2, 0, 0]] : [W, L, [0, H / 2, -L / 2], [Math.PI / 2, 0, 0]];
      mesh.scale.set(w, h_, 1); mesh.position.set(...pos); mesh.rotation.set(...rot);
      const tile = Array.isArray(s.tile) ? H * s.tile[1] : s.tile, asp = s.aspect || 1;
      mesh.material.map.repeat.set(w / (tile * asp), h_ / tile); mesh.material.normalMap.repeat.copy(mesh.material.map.repeat);
      // the AO runs across the strip: walls along their height, the floor and ceiling across their width
      mesh.material.aoMap = side >= 2 ? aoRot : ao;
    });
    // the edges: the walls' top and bottom edges and the end frame (look A)
    const e = [-W / 2, -H / 2, W / 2, -H / 2, W / 2, H / 2, -W / 2, H / 2], E = [];
    for (let c = 0; c < 4; c++) E.push(e[c * 2], e[c * 2 + 1], 0, e[c * 2], e[c * 2 + 1], -L);
    for (let c = 0; c < 4; c++) { const n = (c + 1) % 4; E.push(e[c * 2], e[c * 2 + 1], -L, e[n * 2], e[n * 2 + 1], -L); }
    edges.geometry.dispose(); edges.geometry = segGeo(E);
    frames.forEach((f, i) => {
      const l = lay[i];
      f.pivot.position.set((f.left ? -1 : 1) * (W / 2 - l.g), (H / 2 - l.yC) * l.d / P, -l.Z);
      f.panel.scale.setScalar(l.k);
    });
    // look B: a picture light over each frame, its pool between where the frame hangs and where it faces you
    spots.forEach((s, i) => {
      const f = frames[i], l = lay[i], sx = f.left ? -1 : 1, fw = f.MW * l.k, y = f.pivot.position.y;
      // mounted out over the hallway (as gallery track lights are), aimed at the frame, so the pool lands squarely
      s.position.set(sx * (W / 2 - W * 0.62), H / 2 - 1, -l.Z - fw * 0.1);
      s.target.position.set(sx * (W / 2 - fw * 0.3), y, -l.Z - fw * 0.4);
      s.angle = Math.min(1.1, Math.atan2(fw * 0.7, s.position.distanceTo(s.target.position)) + 0.1);
    });
    // look C: the light strips' grid on the ceiling
    if (LOOK.strips) {
      const st = LOOK.strips, sw = W * st.width, y = H / 2 - 0.5, pts = [];
      const rect = (x0, z0, x1, z1) => pts.push(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z0, x1, y, z1, x0, y, z1);
      st.along.forEach((a) => rect(a * W - sw / 2, -0.5, a * W + sw / 2, -L));
      for (let z = -H * st.every * 0.5; z > -L; z -= H * st.every) rect(st.along[0] * W, z + sw / 2, st.along[1] * W, z - sw / 2);
      strips.geometry.dispose(); strips.geometry = new THREE.BufferGeometry(); strips.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    }
    // the key light's shadow map: sized to the screen (finer on phones, where the hallway is smaller)
    const sm = W < 1024 ? 1024 : 2048;
    if (key.shadow.mapSize.x !== sm) { key.shadow.mapSize.set(sm, sm); key.shadow.map?.dispose(); key.shadow.map = null; }
    // captions: under the frame where it faces you, as wide as the frame
    capEls.forEach((c, i) => { const r = lay[i].rect; c.style.left = `${Math.round(r.left + frames[i].mg / frames[i].MW * r.width)}px`; c.style.top = `${Math.round(r.top + r.height + (desktop ? 0.9 * rem : 12))}px`; c.style.width = `${Math.round(r.width * (1 - 2 * frames[i].mg / frames[i].MW))}px`; });
    placePhones();
    theme();
  }
  const aoRot = (() => { const t = ao.clone(); t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t; })();

  // the camera's travel along the hallway at q: rest at each stop, eased between
  function travelAt(q) {
    const K = [[OPEN.travel0, 0], ...STOPS.flatMap(([s, e], i) => [[s, lay[i].T], [e + HOLD, lay[i].T]]), [1, L]];
    if (q <= K[0][0]) return 0;
    for (let i = 1; i < K.length; i++) if (q <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(q, K[i - 1][0], K[i][0])));
    return L;
  }
  const v3 = new THREE.Vector3(), vC = new THREE.Vector3();
  const project = (p) => { v3.copy(p).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; };

  // frame 4: drawn -> real, one short timed beat (never a scrubbed mix)
  let beatRaf = 0, beatFrom = 0, beatT0 = 0, lastQ = 0;
  function beat(f, target) {
    if (f.realTarget === target) return; f.realTarget = target;
    beatFrom = f.real; beatT0 = performance.now(); cancelAnimationFrame(beatRaf);
    if (target > 0 && phones.state === 'ready') phones.mix = 1;   // live from the start: no still in between
    const step = () => {
      const t = clamp((performance.now() - beatT0) / 520); f.real = lerp(beatFrom, target, ease2(t));
      colours(); render(lastQ, true);
      if (t < 1) beatRaf = requestAnimationFrame(step);
    };
    if (reduced) { f.real = target; colours(); return; }
    beatRaf = requestAnimationFrame(step);
  }

  // the key light (and its shadow camera) follow the walk: the shadow map covers the stretch in front of the camera,
  // its centre snapped to whole shadow texels so the shadows on the walls never shimmer
  function fitShadow(camZ) {
    const sc = key.shadow.camera, n = key.shadow.mapSize.x, half = 1.5 * P;
    const texel = (2 * half) / n, zc = Math.round((camZ - 1.25 * P) / texel) * texel;
    key.target.position.set(0, 0, zc); key.position.copy(key.target.position).addScaledVector(keyDir, Math.max(W, H) * 2.2);
    sc.left = -Math.max(W, H) * 0.8; sc.right = Math.max(W, H) * 0.8; sc.top = half; sc.bottom = -half; sc.near = 1; sc.far = Math.max(W, H) * 4.4 + P;
    sc.updateProjectionMatrix(); key.target.updateMatrixWorld();
  }

  /** q: 0..1 over the dive. Returns page 2's transform (scale about the vanishing point), the window, and the frames'
   *  outlines and sheets on screen (for the geometry and stretch checks). */
  let out = null;
  function render(q, again = false) {
    if (!dot || !lay) return null;
    lastQ = q; if (!again) lastScrollRender = performance.now();
    if (phones.warm && !again && resting(q)) requestAnimationFrame(() => idleWarm(true));
    const grow = ease(span(q, ...OPEN.grow)), open = ease(span(q, ...OPEN.open)), inkOut = span(q, ...OPEN.ink);
    const travel = travelAt(q);
    const vx = lerp(dot.x, W / 2, open), vy = lerp(dot.y, H / 2, open);
    const r1 = Math.max(dot.r * 3, Math.min(W, H) * 0.07), far = Math.hypot(Math.max(vx, W - vx), Math.max(vy, H - vy));
    const r = lerp(lerp(dot.r, r1, grow), far + 2, open);
    const clip = `circle(${r.toFixed(2)}px at ${vx.toFixed(2)}px ${vy.toFixed(2)}px)`;
    win.style.clipPath = canvas.style.clipPath = open >= 1 ? '' : clip;
    camera.position.set(0, 0, P - travel); camera.lookAt(0, 0, -1e5);
    camera.setViewOffset(W, H, -(vx - W / 2), -(vy - H / 2), W, H);
    camera.updateMatrixWorld();
    const camZ = P - travel, holes = [], info = [];
    fitShadow(camZ);
    frames.forEach((f, i) => {
      const [s, e] = STOPS[i], l = lay[i];
      const a0 = Math.max(s - SWING - 0.02, OPEN.open[1]);                // no frame turns before the window is open
      const out_ = span(q, a0, s - 0.02), back = span(q, e + LEAVE[0], e + LEAVE[1]);
      const swing = ease(out_) * (1 - ease(back));                         // 0 flat on the wall .. 1 facing you
      const fade = 1 - span(q, e + LEAVE[0] + 0.008, e + LEAVE[1]);
      const ahead = -l.Z < camZ - camera.near * 2;                          // still in front of the camera
      f.pivot.rotation.y = (f.left ? 1 : -1) * (1 - swing) * Math.PI / 2;
      f.pivot.visible = ahead && fade > 0.002;
      const op = fade;
      f.mats.forEach((m) => { m.opacity = m.userData.base * op; });
      // the glass: an additive reflection can't dim what is behind it, so at grazing angles (the frame flat on its wall)
      // it would flare; its strength follows how squarely the glass faces you, so it catches the light as it turns
      f.pivot.updateMatrixWorld(true);
      v3.set(0, 0, 1).transformDirection(f.panel.matrixWorld); const toCam = vC.setFromMatrixPosition(f.glass.matrixWorld).sub(camera.position).normalize().negate();
      f.glass.material.opacity = op * clamp((Math.abs(v3.dot(toCam)) - 0.2) / 0.55);
      f.mould.castShadow = f.mat.castShadow = f.hinge.castShadow = op > 0.5;
      f.drawMat.opacity = (1 - f.real) * op;
      // the drawing draws itself on as the frame turns to face you
      const dp = ease(span(q, Math.max(s - DRAW - 0.01, a0 + 0.01), s - 0.005));
      const n = Math.round(dp * f.d.segs.length); f.drawing.geometry.instanceCount = n; f.drawing.visible = n > 0;
      f.labels.forEach((m) => { m.visible = f.pivot.visible && n >= m.userData.at && n > 0; m.material.opacity = op; });
      // line weight: a hairline when it faces you, thinner while it is far
      const dist = Math.max(1, camZ + l.Z), sc = clamp(l.d / dist, 0.35, 1);
      f.drawMat.linewidth = sc * dpr;
      if (f.still) {
        const live = phones.state === 'ready';
        if (q >= s + REAL_AT && (f.stillOK || live)) beat(f, 1); else if (q < s + REAL_AT) beat(f, 0);
        const stillA = f.real * (live ? 1 - phones.mix : 1);
        f.still.visible = f.stillOK && stillA > 0.001 && f.pivot.visible; f.still.material.opacity = stillA * op;
        // the live phones: in place over the blueprint, turning with the scroll (a spring follows it)
        const liveA = live ? f.real * phones.mix * op : 0;
        phones.root.visible = liveA > 0.002 && f.pivot.visible;
        if (live) {
          phones.mats.forEach((m) => { m.opacity = m.userData.base * liveA; });
          const u = span(q, s + TURN[0], s + TURN[1]);
          const tgt = turnAt(u);
          if (Math.abs(tgt - phones.target) > 1e-6) { phones.target = tgt; if (reduced) phones.yaw = tgt; else spring(); }
          phones.list.forEach((p, k) => {
            const yaw = k ? Math.max(0, phones.yaw - 0.22 * Math.sin(Math.min(Math.PI, phones.yaw / 2))) : phones.yaw;   // the S26 a beat behind
            p.pivot.rotation.y = yaw;
            const b = f.blobs[k], sz = p.size, wv = sz.x * Math.abs(Math.cos(yaw)) + sz.z * Math.abs(Math.sin(yaw));
            b.visible = phones.root.visible; b.material.opacity = 0.26 * liveA;
            b.position.set(p.home.u + 3, p.home.v - 5, f.zGlass + 0.3); b.scale.set(wv * 256 / 136, sz.y * 512 / 392, 1);
          });
        }
        f.blobs.forEach((b) => { if (!live) b.visible = false; });
      }
      capEls[i].classList.toggle('on', q >= s - 0.002 && q <= e && open >= 1);
      // the frame's outline on screen (its front face), and the blueprint itself (for the stretch check)
      if (f.pivot.visible) {
        f.pivot.updateMatrixWorld(true);
        const ox = f.left ? 0 : -f.MW, cs = [[ox, -f.MH / 2], [ox + f.MW, -f.MH / 2], [ox + f.MW, f.MH / 2], [ox, f.MH / 2]]
          .map(([x, y]) => project(new THREE.Vector3(x, y, f.FD).applyMatrix4(f.panel.matrixWorld)));
        if (swing > 0.01 && op > 0.5) holes.push(cs);
        const sx0 = ox + f.mg, sy0 = -f.MH / 2 + f.mg, ss = [[sx0, sy0], [sx0 + f.d.w, sy0], [sx0 + f.d.w, sy0 + f.d.h], [sx0, sy0 + f.d.h]]
          .map(([x, y]) => project(new THREE.Vector3(x, y, f.zSheet).applyMatrix4(f.panel.matrixWorld)));
        info.push({ i, swing, op, drawn: dp, quad: cs, sheet: ss, ratio: f.d.w / f.d.h, real: f.real });
      } else info.push({ i, swing, op: 0, drawn: dp, quad: null, sheet: null, ratio: f.d.w / f.d.h, real: f.real });
    });
    renderer.autoClear = true;
    renderer.render(scene, camera);
    // the one invisible warm-up draw (or the real one if frame 4 is already on)
    const warmDraw = phones.warmNow && !phones.root.visible && f4;
    if (warmDraw) { phones.root.visible = true; phones.mats.forEach((m) => { m.opacity = 0.002; }); }
    if (phones.warm && phones.root.visible) phones.warm = false;
    if (phones.root.visible) {
      f4.panel.updateMatrixWorld(true); phones.root.matrix.copy(f4.panel.matrixWorld); phones.root.matrixWorldNeedsUpdate = true;
      renderer.autoClear = false; renderer.render(phoneScene, camera); renderer.autoClear = true;
    }
    if (warmDraw) phones.root.visible = false;
    dotEl.style.transform = `translate(${vx.toFixed(2)}px, ${vy.toFixed(2)}px) scale(${(r / 10).toFixed(4)})`;
    top.classList.toggle('is-open', inkOut >= 0.15);
    top.classList.toggle('is-full', open >= 0.85);
    ring.setAttribute('cx', vx.toFixed(2)); ring.setAttribute('cy', vy.toFixed(2)); ring.setAttribute('r', Math.max(0, r - 0.5).toFixed(2));
    // page 2 = the hallway's end: the perspective's scale at its depth, about the vanishing point
    const s = P / (P + L - travel);
    const ph = { state: phones.state, mix: phones.mix, yaw: phones.yaw, target: phones.target, visible: phones.root.visible };
    if (!again) out = { clip: open >= 1 ? '' : clip, scale: s, ox: vx - W / 2, oy: vy - H / 2, vx, vy, origin: `${vx.toFixed(2)}px ${vy.toFixed(2)}px`, travel, r, holes, info, q, phones: ph };
    else if (out) { out.holes = holes; out.info = info; out.phones = ph; }
    if (again) onAgain?.(out);
    return out;
  }
  let onAgain = null;
  /** draw every frame once, whole (drawing, labels, the still), so their buffers and textures reach the GPU now and
   *  not on their first frame mid-dive (the caller hides the layer meanwhile) */
  function warm(q = 0.5) {
    render(q);
    frames.forEach((f) => { f.pivot.visible = true; f.drawing.visible = true; f.drawing.geometry.instanceCount = f.d.segs.length; f.labels.forEach((m) => { m.visible = true; }); if (f.still && f.stillOK) f.still.visible = true; });
    try { renderer.compile(scene, camera); } catch (e) {}
    renderer.render(scene, camera);
    render(q);
  }
  return { layout, render, load, warm, theme, loadPhones, look: LOOK.id, stops: STOPS, phones: () => phones.state, frames: () => frames, lay: () => lay, P: () => P, L: () => L, onBeat: (fn) => { onAgain = fn; } };
}

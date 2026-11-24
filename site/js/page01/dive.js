// Page 1 -> page 2: the "?" dot dive and the corridor (Part 5 "Round 4 picks"). The dot of "Now, what do you need?"
// (measured on the real rendered glyph, after fonts load and on every resize) grows into a circular window; through
// it, a corridor about two screens long: paper walls with a fine drafting grid in perspective, hairline edges meeting
// at the vanishing point, and four mounted frames, left, right, left, right. Each frame is our own schematic as a
// cyanotype blueprint (white lines on #173F73, site/js/page01/corridor-drawings.js) in a thin ink frame with a mount
// margin. As you reach it, it swings out from its wall on its hinge to face you square-on while its drawing draws
// itself on; you stop; one plain line under it; then it swings back to the wall and fades before it nears the screen
// edge. Frame 4 turns from the blueprint of our app's screen into our app running on the real iPhone and Galaxy
// (a still, when the git-ignored file is there; otherwise it stays a blueprint). Page 2 waits at the corridor's end
// and lands 1:1.
// No stretching: the camera is a true perspective (no uneven scale anywhere); its field of view is 50 degrees across
// the narrower side of the screen, capped at 66 degrees across, so phones and wide windows see the same corridor;
// a facing frame is parallel to the screen, so it shows its drawing's exact proportions.
// WebGL (three.js): drawings are line geometry (drawn on by count), labels small textures, so nothing re-rasters.
// Scroll-scrubbed (q = 0..1 over the dive), freeze-safe; frame 4's drawn -> real is one short timed beat.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { FRAMES } from './corridor-drawings.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

/** the lens: 50 degrees across the narrower side, at most 66 degrees across (the camera distance P of the screen plane) */
export const LENS = { narrow: 50, across: 66 };
export function lensP(W, H) {
  const t = (deg) => Math.tan(deg * Math.PI / 360);
  return Math.max(Math.min(W, H) / 2 / t(LENS.narrow), W / 2 / t(LENS.across));
}
// the timeline (q): the window opens, then four stops [s, e] (the camera rests, the caption shows), then page 2
export const STOPS = [[0.26, 0.32], [0.45, 0.51], [0.64, 0.7], [0.83, 0.91]];
const OPEN = { grow: [0, 0.06], ink: [0.04, 0.09], open: [0.06, 0.18], travel0: 0.07 };
// a frame leaves while the camera still rests (HOLD after its stop): it swings back to its wall and fades, so it is
// gone before the walk on could carry it towards the screen edge
const SWING = 0.1, DRAW = 0.09, HOLD = 0.032, LEAVE = [0.002, 0.03];

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
const MOUNT = 0.07;   // the mount margin, as a share of the drawing's width

// a label (mono, white) as a small texture on a plane, in drawing units (y down), anchored at its baseline
function labelMesh(l, fontPx = 56) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const font = `500 ${fontPx}px "DM Mono", ui-monospace, monospace`;
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  const tw = Math.ceil(x.measureText(l.t).width) + 8;
  c.width = tw; c.height = Math.ceil(fontPx * 1.4);
  x.font = font; if ('letterSpacing' in x) x.letterSpacing = '0.06em';
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.fillText(l.t, 4, fontPx * 1.05);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.NoColorSpace; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.anisotropy = 4;
  const s = l.size / fontPx, pw = c.width * s, ph = c.height * s;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
  const ax = l.anchor === 'middle' ? -pw / 2 : l.anchor === 'end' ? -pw : 0;
  // centre of the plane, in drawing units (y down): the baseline sits fontPx * 1.05 below the canvas top
  mesh.userData = { cx: l.x + ax + pw / 2 - 4 * s, cy: l.y - fontPx * 1.05 * s + ph / 2, at: l.at };
  return mesh;
}

/** root: the corridor's paper ground (under page 2's stage); top (over page 2): the corridor itself (WebGL, a
 *  transparent canvas), the ring, the ink dot and the captions. Page 2 stands on the corridor's end wall, so the walls
 *  and edges never cover it on screen and every frame is in front of it: drawing the corridor above page 2 is exact,
 *  with no clip on page 2 (a clip that changes every frame made page 2 repaint: about 33 ms a frame). */
export function createDive(root, top, { base = '' } = {}) {
  root.innerHTML = `<div class="dive__win"></div>`;
  top.innerHTML = `<canvas class="dive__gl"></canvas><svg class="dive__ring"><circle></circle></svg><i class="dive__dot"></i><div class="dive__caps">${
    FRAMES.map((f) => `<p class="dive__cap"><span class="ph" data-draft>Draft</span><span class="dive__cap-t">${f.caption}</span></p>`).join('')}</div>`;
  const win = root.querySelector('.dive__win'), canvas = top.querySelector('.dive__gl');
  const ring = top.querySelector('.dive__ring circle'), dotEl = top.querySelector('.dive__dot');
  const capEls = [...top.querySelectorAll('.dive__cap')];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // colours are written as given (sRGB in, sRGB out)
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  const lineMats = [];
  const lmat = (o) => { const m = new LineMaterial({ linewidth: 1, worldUnits: false, transparent: true, ...o }); lineMats.push(m); return m; };
  const segGeo = (arr) => { const g = new LineSegmentsGeometry(); g.setPositions(arr); return g; };

  // the walls: four planes with the drafting grid (a mipmapped tile: majors every 100 px, minors every 20)
  const gridTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
    x.clearRect(0, 0, 512, 512);
    x.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 1; i < 5; i++) { x.fillRect(0, i * 102.4 - 1, 512, 2); x.fillRect(i * 102.4 - 1, 0, 2, 512); }
    x.fillStyle = 'rgba(255,255,255,1)'; x.fillRect(0, 0, 512, 3); x.fillRect(0, 0, 3, 512);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.minFilter = THREE.LinearMipmapLinearFilter; return t;
  })();
  const wallMat = new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.09, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const walls = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wallMat); m.renderOrder = -2; scene.add(m); return m; });
  const edgeMat = lmat({ opacity: 0.7 });
  const edges = new LineSegments2(segGeo([0, 0, 0, 0, 0, 1]), edgeMat); edges.renderOrder = -1; scene.add(edges);

  // the frames
  const frames = FRAMES.map((F, i) => {
    const d = F.draw, mg = d.w * MOUNT, MW = d.w + 2 * mg, MH = d.h + 2 * mg;
    const pivot = new THREE.Group(), panel = new THREE.Group(); pivot.add(panel); scene.add(pivot);
    const left = F.side === 'l';
    // panel coordinates: drawing units, x from the hinge edge (0) into the corridor, y up, centred vertically
    const ox = left ? 0 : -MW, U = (u) => ox + mg + u, V = (v) => MH / 2 - mg - v;
    const mountMat = new THREE.MeshBasicMaterial({ toneMapped: false, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
    const mount = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), mountMat); mount.position.set(ox + MW / 2, 0, 0); panel.add(mount);
    const sheetMat = new THREE.MeshBasicMaterial({ toneMapped: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(d.w, d.h), sheetMat); sheet.position.set(U(d.w / 2), V(d.h / 2), 0.01); panel.add(sheet);
    // the thin ink frame round the mount, and the hinge: a pivot rod on the wall side
    const fr = [ox, -MH / 2, ox + MW, -MH / 2, ox + MW, -MH / 2, ox + MW, MH / 2, ox + MW, MH / 2, ox, MH / 2, ox, MH / 2, ox, -MH / 2,
      ox + mg, -MH / 2 + mg, ox + mg + d.w, -MH / 2 + mg, ox + mg + d.w, -MH / 2 + mg, ox + mg + d.w, MH / 2 - mg, ox + mg + d.w, MH / 2 - mg, ox + mg, MH / 2 - mg, ox + mg, MH / 2 - mg, ox + mg, -MH / 2 + mg];
    const hx = 0, rod = MH * 0.04;   // the hinge is the panel's x = 0 edge on either wall
    fr.push(hx, -MH / 2 - rod, hx, MH / 2 + rod, hx - MW * 0.012, MH / 2 + rod, hx + MW * 0.012, MH / 2 + rod, hx - MW * 0.012, -MH / 2 - rod, hx + MW * 0.012, -MH / 2 - rod);
    const frameMat = lmat({ opacity: 0.85 });
    const frameLines = new LineSegments2(segGeo(fr.flatMap((v, k) => (k % 2 ? [v, 0.02] : [v]))), frameMat); panel.add(frameLines);
    // the drawing: white hairlines, drawn on by count
    const pos = new Float32Array(d.segs.length * 6);
    d.segs.forEach(([a, b, c, e], k) => pos.set([U(a), V(b), 0.03, U(c), V(e), 0.03], k * 6));
    const drawMat = lmat({ opacity: 1 });
    const drawing = new LineSegments2(segGeo(pos), drawMat); drawing.geometry.instanceCount = 0; panel.add(drawing);
    const labels = d.labels.map((l) => { const m = labelMesh(l); m.position.set(U(m.userData.cx), V(m.userData.cy), 0.04); m.visible = false; panel.add(m); return m; });
    // frame 4: the real phones (a still; git-ignored file, so it may be missing: then it stays a blueprint)
    let still = null;
    if (F.real && d.region) {
      const r = d.region, mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
      still = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.h), mat); still.position.set(U(r.u + r.w / 2), V(r.v + r.h / 2), 0.02); still.visible = false; panel.add(still);
    }
    return { F, d, i, left, MW, MH, mg, pivot, panel, mount, sheet, frameLines, drawing, labels, still, stillOK: false, real: 0, realTarget: 0, drawMat, frameMat };
  });

  let loaded = null;
  /** label fonts and the frame-4 still; resolves when both are in (a missing still resolves too) */
  const load = (b = base) => loaded || (loaded = (async () => {
    try { await document.fonts.load('500 56px "DM Mono"'); } catch (e) {}
    rebuildLabels();   // made again now the font is in (before it, they used the fallback)
    const f4 = frames.find((f) => f.still);
    if (f4) {
      const img = new Image(); img.decoding = 'async';
      const url = `${b}${f4.F.real}`;
      // the file is git-ignored (licences unverified): ask once, quietly, whether it is there
      let ok = false;
      try { const r = await fetch(url, { method: 'HEAD' }); ok = r.ok; } catch (e) {}
      if (ok) {
        img.src = url;
        try { await img.decode(); const t = new THREE.Texture(img); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true; f4.still.material.map = t; f4.still.material.needsUpdate = true; renderer.initTexture(t); f4.stillOK = true; } catch (e) {}
      }
    }
    frames.forEach((f) => f.labels.forEach((m) => renderer.initTexture(m.material.map)));
    return true;
  })());
  function rebuildLabels() {
    frames.forEach((f) => {
      const ox = f.left ? 0 : -f.MW, U = (u) => ox + f.mg + u, V = (v) => f.MH / 2 - f.mg - v;
      f.labels.forEach((m) => { f.panel.remove(m); m.geometry.dispose(); m.material.map.dispose(); m.material.dispose(); });
      f.labels = f.d.labels.map((l) => { const m = labelMesh(l); m.position.set(U(m.userData.cx), V(m.userData.cy), 0.04); m.visible = false; f.panel.add(m); return m; });
    });
    colours();
  }

  let W = 1, H = 1, P = 1, L = 1, dot = null, ink = '#121212', paper = '#F2F0EB', dark = false;
  const col = (s) => { const c = new THREE.Color(); try { c.setStyle(s, THREE.LinearSRGBColorSpace); } catch (e) { c.setStyle('#888', THREE.LinearSRGBColorSpace); } return c; };
  function colours() {
    const inkC = col(ink), paperC = col(paper), mountC = dark ? paperC.clone().lerp(col('#FFFFFF'), 0.04) : paperC.clone().lerp(col('#FFFFFF'), 0.45);
    renderer.setClearColor(0x000000, 0);   // transparent: the paper ground is the layer under page 2
    wallMat.color.copy(inkC); wallMat.opacity = dark ? 0.07 : 0.09;
    edgeMat.color.copy(inkC);
    frames.forEach((f) => {
      f.mount.material.color.copy(mountC); f.frameMat.color.copy(inkC);
      f.sheet.material.color.copy(col(BLUE)).lerp(mountC, f.real);
      f.drawMat.color.copy(col(WHITE)); f.drawMat.opacity = 1 - f.real;
      f.labels.forEach((m) => { m.material.color.copy(f.real >= 0.5 ? inkC : col(WHITE)); });
      if (f.still) f.still.material.opacity = f.real;
    });
  }
  function theme() {
    const cs = getComputedStyle(document.documentElement);
    dark = document.documentElement.dataset.theme === 'dark';
    ink = cs.getPropertyValue('--ink').trim() || '#121212'; paper = cs.getPropertyValue('--paper').trim() || '#F2F0EB';
    colours();
  }

  // ---------- layout: the lens, where each frame faces you, the corridor's length ----------
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
      let tw, th;
      if (desktop) { th = Math.min(0.52 * H, bandH - capH); tw = th * a; if (tw > 0.44 * W) { tw = 0.44 * W; th = tw / a; } }
      else { tw = W - 32 - 30; th = tw / a; if (th > bandH - capH) { th = bandH - capH; tw = th * a; } }
      const yTop = bandT + Math.max(0, (bandH - th - capH) / 2), yC = yTop + th / 2;
      // the frame's outer margin from its own screen edge; desktop: centred about 27% in from that edge
      let m = desktop ? Math.max(0.06 * W, 0.27 * W - tw / 2) : 16;
      let dd = P * (W / 2 - g) / (W / 2 - m);
      // keep it inside the corridor's height at that distance (the ceiling and floor)
      const dMax = P * Math.min((H / 2) / Math.max(1, H / 2 - yTop), (H / 2) / Math.max(1, yTop + th - H / 2)) * 0.98;
      if (dd > dMax) { dd = dMax; m = W / 2 - (W / 2 - g) * P / dd; }
      const k = (tw * dd / P) / f.MW;                       // world units per drawing unit
      const Ti = P * (T0 + SP * i), Z = dd - P + Ti;
      const x0 = f.left ? m : W - m - tw;
      return { tw, th, m, d: dd, k, T: Ti, Z, yC, yTop, x0, g, rect: { left: x0, top: yTop, width: tw, height: th } };
    });
    const last = lay[lay.length - 1];
    L = Math.max(last.T + 1.6 * P, ...lay.map((l, i) => l.Z + frames[i].MW * l.k + 0.1 * P));
    camera.far = L + P * 2; camera.updateProjectionMatrix();
    // walls (left, right, floor, ceiling), each from the mouth (z = 0) to the end (z = -L), the grid at 100 px
    const wall = (m, w, h, pos, rot) => { m.scale.set(w, h, 1); m.position.set(...pos); m.rotation.set(...rot); };
    wall(walls[0], L, H, [-W / 2, 0, -L / 2], [0, Math.PI / 2, 0]); wall(walls[1], L, H, [W / 2, 0, -L / 2], [0, -Math.PI / 2, 0]);
    wall(walls[2], W, L, [0, -H / 2, -L / 2], [-Math.PI / 2, 0, 0]); wall(walls[3], W, L, [0, H / 2, -L / 2], [Math.PI / 2, 0, 0]);
    walls.forEach((m) => { m.material.map.repeat.set(m.scale.x / 100, m.scale.y / 100); });
    // the corridor's four edges and its end frame
    const e = [-W / 2, -H / 2, W / 2, -H / 2, W / 2, H / 2, -W / 2, H / 2], E = [];
    for (let c = 0; c < 4; c++) E.push(e[c * 2], e[c * 2 + 1], 0, e[c * 2], e[c * 2 + 1], -L);
    for (let c = 0; c < 4; c++) { const n = (c + 1) % 4; E.push(e[c * 2], e[c * 2 + 1], -L, e[n * 2], e[n * 2 + 1], -L); }
    edges.geometry.dispose(); edges.geometry = segGeo(E);
    frames.forEach((f, i) => {
      const l = lay[i];
      f.pivot.position.set((f.left ? -1 : 1) * (W / 2 - l.g), (H / 2 - l.yC) * l.d / P, -l.Z);
      f.panel.scale.setScalar(l.k);
    });
    // captions: under the frame where it faces you, as wide as the frame
    capEls.forEach((c, i) => { const r = lay[i].rect; c.style.left = `${Math.round(r.left + frames[i].mg / frames[i].MW * r.width)}px`; c.style.top = `${Math.round(r.top + r.height + (desktop ? 0.9 * rem : 12))}px`; c.style.width = `${Math.round(r.width * (1 - 2 * frames[i].mg / frames[i].MW))}px`; });
    theme();
  }

  // the camera's travel along the corridor at q: rest at each stop, eased between
  function travelAt(q) {
    const K = [[OPEN.travel0, 0], ...STOPS.flatMap(([s, e], i) => [[s, lay[i].T], [e + HOLD, lay[i].T]]), [1, L]];
    if (q <= K[0][0]) return 0;
    for (let i = 1; i < K.length; i++) if (q <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(span(q, K[i - 1][0], K[i][0])));
    return L;
  }
  const v3 = new THREE.Vector3();
  const project = (p) => { v3.copy(p).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; };

  // frame 4: drawn -> real, one short timed beat (never a scrubbed mix)
  let beatRaf = 0, beatFrom = 0, beatT0 = 0, lastQ = 0;
  function beat(f, target) {
    if (f.realTarget === target) return; f.realTarget = target;
    beatFrom = f.real; beatT0 = performance.now(); cancelAnimationFrame(beatRaf);
    const step = () => {
      const t = clamp((performance.now() - beatT0) / 520); f.real = lerp(beatFrom, target, t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      colours(); f.still.visible = f.real > 0.001; render(lastQ, true);
      if (t < 1) beatRaf = requestAnimationFrame(step);
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { f.real = target; colours(); f.still.visible = target > 0; return; }
    beatRaf = requestAnimationFrame(step);
  }

  /** q: 0..1 over the dive. Returns page 2's transform (scale about the vanishing point), the window, and the frames'
   *  outlines and sheets on screen (for the geometry and stretch checks). */
  let out = null;
  function render(q, again = false) {
    if (!dot || !lay) return null;
    lastQ = q;
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
      f.mount.material.transparent = op < 1; f.mount.material.opacity = op; f.mount.material.depthWrite = op >= 1;
      f.sheet.material.transparent = op < 1; f.sheet.material.opacity = op; f.sheet.material.depthWrite = op >= 1;
      f.frameMat.opacity = 0.85 * op; f.drawMat.opacity = (1 - f.real) * op;
      // the drawing draws itself on as the frame turns to face you
      const dp = ease(span(q, Math.max(s - DRAW - 0.01, a0 + 0.01), s - 0.005));
      const n = Math.round(dp * f.d.segs.length); f.drawing.geometry.instanceCount = n; f.drawing.visible = n > 0;
      f.labels.forEach((m) => { m.visible = f.pivot.visible && n >= m.userData.at && n > 0; m.material.opacity = op; });
      // line weight: a hairline when it faces you, thinner while it is far
      const dist = Math.max(1, camZ + l.Z), sc = clamp(l.d / dist, 0.35, 1);
      f.drawMat.linewidth = sc * dpr; f.frameMat.linewidth = sc * dpr;
      if (f.still) { if (q >= s + 0.03 && f.stillOK) beat(f, 1); else if (q < s + 0.03) beat(f, 0); f.still.visible = f.stillOK && f.real > 0.001 && f.pivot.visible; f.still.material.opacity = f.real * op; }
      capEls[i].classList.toggle('on', q >= s - 0.002 && q <= e && open >= 1);
      // the frame's outline on screen (its mount, which hides whatever is behind it)
      if (f.pivot.visible) {
        f.pivot.updateMatrixWorld(true);
        const ox = f.left ? 0 : -f.MW, cs = [[ox, -f.MH / 2], [ox + f.MW, -f.MH / 2], [ox + f.MW, f.MH / 2], [ox, f.MH / 2]]
          .map(([x, y]) => project(new THREE.Vector3(x, y, 0).applyMatrix4(f.panel.matrixWorld)));
        if (swing > 0.01 && op > 0.5) holes.push(cs);
        // the sheet (the drawing itself) on screen, for the stretch check
        const sx0 = ox + f.mg, sy0 = -f.MH / 2 + f.mg, ss = [[sx0, sy0], [sx0 + f.d.w, sy0], [sx0 + f.d.w, sy0 + f.d.h], [sx0, sy0 + f.d.h]]
          .map(([x, y]) => project(new THREE.Vector3(x, y, 0).applyMatrix4(f.panel.matrixWorld)));
        info.push({ i, swing, op, drawn: dp, quad: cs, sheet: ss, ratio: f.d.w / f.d.h, real: f.real });
      } else info.push({ i, swing, op: 0, drawn: dp, quad: null, sheet: null, ratio: f.d.w / f.d.h, real: f.real });
    });
    renderer.render(scene, camera);
    dotEl.style.transform = `translate(${vx.toFixed(2)}px, ${vy.toFixed(2)}px) scale(${(r / 10).toFixed(4)})`;
    top.classList.toggle('is-open', inkOut >= 0.15);
    top.classList.toggle('is-full', open >= 0.85);
    ring.setAttribute('cx', vx.toFixed(2)); ring.setAttribute('cy', vy.toFixed(2)); ring.setAttribute('r', Math.max(0, r - 0.5).toFixed(2));
    // page 2 = the corridor's end: the perspective's scale at its depth, about the vanishing point
    const s = P / (P + L - travel);
    if (!again) out = { clip: open >= 1 ? '' : clip, scale: s, ox: vx - W / 2, oy: vy - H / 2, vx, vy, origin: `${vx.toFixed(2)}px ${vy.toFixed(2)}px`, travel, r, holes, info, q };
    else if (out) { out.holes = holes; out.info = info; }
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
  return { layout, render, load, warm, theme, frames: () => frames, lay: () => lay, P: () => P, L: () => L, onBeat: (fn) => { onAgain = fn; } };
}

// Page 1 -> page 2: the "?" dot dive (Part 5 "Fixes after pages 2-3", Wajih's idea). The dot of "Now, what do you
// need?" (measured on the real rendered glyph, after fonts load and on every resize) grows into a circular window; we
// dive through it, down a short corridor of real drawing sheets, and land on page 2, which waits at the corridor's end.
// The corridor is drawn the way a perspective drawing is: hairline rails from the window to the end frame, a faint grid
// on its walls, the sheets hung on the walls. It is WebGL (three.js): each sheet is uploaded once as a texture (mipmaps,
// anisotropic filtering), so passing it costs no re-raster (CSS 3D re-rastered the big scans at every change of scale).
// The camera reproduces one CSS perspective P with the vanishing point on the corridor's axis, so page 2 (its own
// stage, a DOM layer) sits exactly in the corridor's end frame and is at 1:1, home, when the travel ends.
// Scroll-scrubbed (q = 0..1 over the dive), freeze-safe.
import * as THREE from 'three';
import { SETS, PICK } from './dive-sets.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

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
  // the lowest blob: scan up from the bottom for the first inked row, then flood the blob it belongs to
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

// the sheets' shader: the scan as it is (sRGB in, sRGB out, no tone mapping), inverted for the dark print
const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const FRAG = 'uniform sampler2D map; uniform float inv; varying vec2 vUv; void main() { vec3 c = texture2D(map, vUv).rgb; gl_FragColor = vec4(mix(c, vec3(1.0) - c * 0.92, inv), 1.0); }';

/** root: the corridor layer (under page 2's stage); top: the ring and the ink dot (over it). set: a key of SETS. */
export function createDive(root, top, setKey) {
  const set = SETS[setKey || new URLSearchParams(location.search).get('corridor')] || SETS[PICK];
  root.innerHTML = `<div class="dive__win"><canvas class="dive__gl"></canvas><svg class="dive__rails"><path></path></svg></div>`;
  top.innerHTML = `<svg class="dive__ring"><circle></circle></svg><i class="dive__dot"></i>`;
  const win = root.querySelector('.dive__win'), canvas = root.querySelector('.dive__gl');
  const rails = root.querySelector('.dive__rails path'), ring = top.querySelector('.dive__ring circle'), dotEl = top.querySelector('.dive__dot');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // the shader writes the scan's own sRGB values
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 1e5);
  const grid = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ transparent: true, opacity: 0.085 }));
  scene.add(grid);
  // the sheets: left, right, left, right, left, each at its depth (0..1 of the corridor), loaded, decoded and uploaded ahead
  const sheets = set.sheets.map((s, i) => {
    const img = new Image(); img.decoding = 'async'; img.dataset.src = s.src;
    const tex = new THREE.Texture(img); tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
    const mat = new THREE.ShaderMaterial({ uniforms: { map: { value: tex }, inv: { value: 0 } }, vertexShader: VERT, fragmentShader: FRAG });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); mesh.visible = false; scene.add(mesh);
    return { img, tex, mat, mesh, at: 0.16 + i * 0.15, side: i % 2 ? 'r' : 'l', a: s.w / s.h };
  });
  let loaded = null;
  // a refused request (the plain local server, under a burst) is retried
  const one = async (s, url) => {
    for (let n = 0; n < 5; n++) {
      s.img.src = n ? `${url}?r=${n}` : url;
      try { await s.img.decode(); s.tex.needsUpdate = true; renderer.initTexture(s.tex); s.mesh.visible = true; return; } catch (e) { await new Promise((r) => setTimeout(r, 200 * (n + 1))); }
    }
  };
  const load = (base = '') => loaded || (loaded = Promise.all(sheets.map((s) => one(s, base + s.img.dataset.src))));

  let W = 1, H = 1, P = 1, L = 1, dot = null;
  function theme() {
    const cs = getComputedStyle(document.documentElement), dark = document.documentElement.dataset.theme === 'dark';
    const col = (v, f) => { const c = new THREE.Color(); try { c.setStyle(cs.getPropertyValue(v).trim() || f, THREE.LinearSRGBColorSpace); } catch (e) { c.setStyle(f, THREE.LinearSRGBColorSpace); } return c; };
    renderer.setClearColor(col('--paper', '#F2F0EB'), 1);
    grid.material.color.copy(col('--ink', '#121212'));
    sheets.forEach((s) => { s.mat.uniforms.inv.value = dark ? 1 : 0; });
  }
  function layout(w, h, d) {
    W = w; H = h; dot = d;
    P = Math.max(W, H) * 0.85; L = P * 3.6;            // perspective and the corridor's length (to page 2's frame)
    renderer.setSize(W, H, false);
    // the camera = CSS perspective P: the screen plane (z = 0) at 1:1, field of view from P
    camera.fov = 2 * Math.atan(H / 2 / P) * 180 / Math.PI; camera.aspect = W / H; camera.near = 1; camera.far = L + P * 2; camera.updateProjectionMatrix();
    // corridor coordinates: its axis on x = y = 0, the screen's size its cross-section, from z = 0 (the mouth) to -L
    sheets.forEach((s) => {
      const sh = H * 0.62, sw = sh * s.a, z = s.at * L, x = (s.side === 'l' ? -1 : 1) * W / 2;
      s.mesh.scale.set(sw, sh, 1); s.mesh.position.set(x, 0, -z); s.mesh.rotation.set(0, s.side === 'l' ? Math.PI / 2 : -Math.PI / 2, 0);
      s.z = z; s.sw = sw;
    });
    // the walls' faint grid (the drawing grid, 100 px, in perspective)
    const g = [], step = 100;
    for (let z = 0; z <= L; z += step) { g.push(-W / 2, -H / 2, -z, -W / 2, H / 2, -z, W / 2, -H / 2, -z, W / 2, H / 2, -z, -W / 2, H / 2, -z, W / 2, H / 2, -z, -W / 2, -H / 2, -z, W / 2, -H / 2, -z); }
    for (let y = -H / 2; y <= H / 2; y += step) { g.push(-W / 2, y, 0, -W / 2, y, -L, W / 2, y, 0, W / 2, y, -L); }
    for (let x = -W / 2; x <= W / 2; x += step) { g.push(x, -H / 2, 0, x, -H / 2, -L, x, H / 2, 0, x, H / 2, -L); }
    grid.geometry.dispose(); grid.geometry = new THREE.BufferGeometry(); grid.geometry.setAttribute('position', new THREE.Float32BufferAttribute(g, 3));
    theme();
  }

  /** q: 0..1 over the dive. Returns page 2's transform (scale about the vanishing point) and the window. */
  function render(q) {
    if (!dot) return null;
    const grow = ease(span(q, 0.0, 0.16)), open = ease(span(q, 0.14, 0.5)), inkOut = span(q, 0.08, 0.2);
    const travel = L * ease(span(q, 0.08, 0.97));
    // the window: the dot's own size -> a small window -> the whole screen; its centre slides to the screen's centre
    const vx = lerp(dot.x, W / 2, open), vy = lerp(dot.y, H / 2, open);
    const r1 = Math.max(dot.r * 3, Math.min(W, H) * 0.07), far = Math.hypot(Math.max(vx, W - vx), Math.max(vy, H - vy));
    const r = lerp(lerp(dot.r, r1, grow), far + 2, open);
    const clip = `circle(${r.toFixed(2)}px at ${vx.toFixed(2)}px ${vy.toFixed(2)}px)`;
    win.style.clipPath = clip;
    // the camera: travel down the axis; the axis appears at the vanishing point (a view offset, like CSS perspective-origin)
    camera.position.set(0, 0, P - travel); camera.lookAt(0, 0, -1e4);
    camera.setViewOffset(W, H, -(vx - W / 2), -(vy - H / 2), W, H);
    sheets.forEach((s) => { s.mesh.visible = s.img.complete && s.img.naturalWidth > 0 && s.z - travel > -P * 0.98 + 1; });
    renderer.render(scene, camera);
    // the dot: ink at first, exactly the glyph's dot; then one short timed beat (CSS) opens it onto the corridor, so a
    // paused frame is either the ink dot or the open window with its hairline ring, never a grey disc
    dotEl.style.transform = `translate(${vx.toFixed(2)}px, ${vy.toFixed(2)}px) scale(${(r / 10).toFixed(4)})`;
    top.classList.toggle('is-open', inkOut >= 0.15);
    top.classList.toggle('is-full', open >= 0.85);
    ring.setAttribute('cx', vx.toFixed(2)); ring.setAttribute('cy', vy.toFixed(2)); ring.setAttribute('r', Math.max(0, r - 0.5).toFixed(2));
    // page 2's frame at the corridor's end: the perspective's scale at its depth, centred on the vanishing point
    const s = P / (P + L - travel);
    const fx0 = vx - s * W / 2, fy0 = vy - s * H / 2, fx1 = vx + s * W / 2, fy1 = vy + s * H / 2;
    // the rails: the corridor's four edges, from the mouth (at the screen plane, 1:1) to the end frame
    const ox = vx - W / 2, oy = vy - H / 2, m = P / (P + 0 - travel > 1 ? P - travel : 1);
    const c0 = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]].map(([x, y]) => (P - travel > 1 ? [vx + x * m, vy + y * m] : [vx + x * 1e4, vy + y * 1e4]));
    const f = [[fx0, fy0], [fx1, fy0], [fx1, fy1], [fx0, fy1]];
    rails.setAttribute('d', c0.map((p, i) => `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${f[i][0].toFixed(1)} ${f[i][1].toFixed(1)}`).join('') +
      `M${f[0][0].toFixed(1)} ${f[0][1].toFixed(1)}H${f[1][0].toFixed(1)}V${f[2][1].toFixed(1)}H${f[3][0].toFixed(1)}Z`);
    rails.style.opacity = (1 - span(q, 0.9, 1)).toFixed(3);
    // page 2 = the end frame: shifted with the corridor (o), then scaled about the vanishing point
    return { clip: open >= 1 ? '' : clip, scale: s, ox, oy, vx, vy, origin: `${vx.toFixed(2)}px ${vy.toFixed(2)}px`, travel, r };
  }
  return { layout, render, load, set, theme, sheets: () => sheets.map((s) => s.img) };
}

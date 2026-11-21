// The hero phone, built in code: six matte layers with hairline edges, an orthographic "drawing" camera,
// labelled explode with dimension lines, and a cyanotype that develops across the sheet (a real negative:
// paper turns Prussian blue, ink turns white). Renders only when its state changes.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LOFTHAUL } from '../products/lofthaul.js';

const PHONE = { w: 74, h: 154 };              // mm
const GAP = 25;                               // mm between layers when fully exploded
const INK_HEX = 0x121212;

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slab(w, h, d, r) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -d / 2);
  return g;
}
function faceUV(geo, w, h) {           // planar 0..1 UVs for a flat shape
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  uv.needsUpdate = true;
  return geo;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h, c);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, canvas: c };
}

// ---------- textures drawn in code ----------
// the 03 FLOW layer: the product's user flow, with its one loop back (e.g. "held for wind")
function drawFlow(ctx, W, H, flow = LOFTHAUL.flow) {
  ctx.fillStyle = '#F2F0EB'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#121212'; ctx.fillStyle = '#121212'; ctx.lineWidth = 3;
  const steps = flow.steps;
  const bw = W * 0.6, bh = H * 0.075, x = (W - bw) / 2;
  ctx.font = `500 ${H * 0.026}px "DM Mono", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  steps.forEach((s, i) => {
    const y = H * 0.1 + i * H * 0.145;
    ctx.strokeRect(x, y, bw, bh); ctx.fillText(s, W / 2, y + bh / 2);
    if (i < steps.length - 1) { ctx.beginPath(); ctx.moveTo(W / 2, y + bh); ctx.lineTo(W / 2, y + H * 0.145); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - 10, y + H * 0.145 - 14); ctx.lineTo(W / 2, y + H * 0.145); ctx.lineTo(W / 2 + 10, y + H * 0.145 - 14); ctx.stroke(); }
  });
  // the loop back (LOFTHAUL: "held for wind", from step 2 to step 0)
  if (flow.hold) {
    const [from, to, label] = flow.hold;
    const yf = H * 0.1 + from * H * 0.145 + bh / 2, yt = H * 0.1 + to * H * 0.145 + bh / 2;
    ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(x + bw, yf); ctx.lineTo(W * 0.92, yf); ctx.lineTo(W * 0.92, yt); ctx.lineTo(x + bw, yt); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = 'left'; ctx.font = `400 ${H * 0.02}px "DM Mono", monospace`;
    ctx.fillText(label, W * 0.83 - Math.max(0, ctx.measureText(label).width - ctx.measureText('HOLD').width), yf - 18);
  }
}
function drawLockMark(ctx, W, H) {
  ctx.fillStyle = '#2E2D2A'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#EDEBE6'; ctx.lineWidth = W * 0.05;
  ctx.beginPath(); ctx.arc(W / 2, H * 0.42, W * 0.16, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#EDEBE6'; ctx.fillRect(W * 0.28, H * 0.42, W * 0.44, H * 0.34);
  ctx.fillStyle = '#2E2D2A'; ctx.beginPath(); ctx.arc(W / 2, H * 0.56, W * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(W * 0.48, H * 0.56, W * 0.04, H * 0.1);
}

const POST_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const POST_FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tScene; uniform sampler2D tOver; uniform sampler2D tColor;
uniform vec2 uRes; uniform vec2 uCenter; uniform float uDev; uniform float uHover; uniform float uDpr;
uniform float uMinor; uniform float uMajor;
const vec3 PRUS = vec3(0.090, 0.247, 0.451);
const vec3 TIDE = vec3(0.047, 0.157, 0.310);
const vec3 WHITE = vec3(0.925, 0.945, 0.965);
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1.0/2.4))-0.055, step(0.0031308, c)); }
void main(){
  vec2 px = vUv * uRes;
  vec4 sc = texture2D(tScene, vUv);
  vec3 scRGB = sc.a > 0.0 ? toSRGB(sc.rgb / sc.a) * sc.a : vec3(0.0);
  vec4 ov = texture2D(tOver, vUv);
  vec3 bwP = ov.rgb + scRGB * (1.0 - ov.a);
  float bwA = ov.a + sc.a * (1.0 - ov.a);
  vec3 bw = bwA > 0.001 ? bwP / bwA : vec3(0.95);
  // the developing front: a ragged radial tide from the phone outwards
  float d = length((px - uCenter) / uRes.y);
  float n = fbm(px / (uRes.y * 0.16));
  float f = d + (n - 0.5) * 0.24;
  float R = uDev * 1.75 - 0.14;
  float e = 1.5 / uRes.y;
  float m = uDev <= 0.0 ? 0.0 : (uDev >= 1.0 ? 1.0 : 1.0 - smoothstep(R - e, R + e, f));
  float tide = m * smoothstep(R - 0.06, R - e, f) * step(uDev, 0.999);
  vec2 g1 = mod(px, vec2(uMinor)), g2 = mod(px, vec2(uMajor));
  float gl1 = step(min(g1.x, g1.y), uDpr), gl2 = step(min(g2.x, g2.y), uDpr);
  vec3 bg = mix(PRUS, WHITE, gl1 * 0.06 + gl2 * 0.10);
  bg = mix(bg, TIDE, tide * 0.6);
  float L = dot(bw, vec3(0.2126, 0.7152, 0.0722));
  vec3 cy = mix(PRUS, WHITE, clamp(0.08 + (1.0 - L) * 1.06, 0.0, 1.0));
  vec3 dev = mix(bg, cy, bwA);
  vec3 rgb = mix(bwP, dev, m);
  float a = mix(bwA, 1.0, m);
  vec4 col = texture2D(tColor, vUv);
  if (uHover > 0.0 && col.a > 0.0) { vec3 c = toSRGB(col.rgb / col.a); rgb = mix(rgb, c * a, col.a * uHover); }
  gl_FragColor = vec4(rgb, a);
}`;

export class PhoneScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 4000);
    this.camera.position.set(0, 0, 1500);
    this.camera.layers.enable(1);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6ae, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(-0.6, 1.0, 1.4); this.scene.add(key);
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.lineMats = [];
    this.layers = [];
    this.state = { explode: 0, turn: 0, fill: 1, develop: 0, labels: 0, hover: 0, cx: 0.5, cy: 0.5, scale: 1, zoomOut: 0, shiftX: 0 };
    this.build();
    // post
    this.rtScene = new THREE.WebGLRenderTarget(2, 2, { samples: 4 });
    this.rtColor = new THREE.WebGLRenderTarget(2, 2, { samples: 4 });
    this.over = document.createElement('canvas');
    this.overTex = new THREE.CanvasTexture(this.over); this.overTex.premultiplyAlpha = true;
    this.overTex.minFilter = this.overTex.magFilter = THREE.LinearFilter; this.overTex.generateMipmaps = false;
    this.post = new THREE.ShaderMaterial({
      vertexShader: POST_VS, fragmentShader: POST_FS, depthTest: false, depthWrite: false, transparent: false,
      uniforms: { tScene: { value: this.rtScene.texture }, tOver: { value: this.overTex }, tColor: { value: this.rtColor.texture },
        uRes: { value: new THREE.Vector2() }, uCenter: { value: new THREE.Vector2() }, uDev: { value: 0 }, uHover: { value: 0 },
        uDpr: { value: this.dpr }, uMinor: { value: 20 }, uMajor: { value: 100 } },
    });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.postScene = new THREE.Scene();
    this.postScene.add(new THREE.Mesh(tri, this.post));
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.dirty = true;
    this.resize();
  }

  edges(geo, mesh, { color = INK_HEX, opacity = 1, threshold = 30 } = {}) {
    const eg = new THREE.EdgesGeometry(geo, threshold);
    const lg = new LineSegmentsGeometry().fromEdgesGeometry(eg);
    const mat = new LineMaterial({ color, linewidth: 1, worldUnits: false, transparent: opacity < 1, opacity, depthTest: true });
    this.lineMats.push(mat);
    const l = new LineSegments2(lg, mat);
    mesh.add(l);
    return l;
  }
  matte(hex, extra = {}) {
    return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.96, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...extra });
  }
  part(parent, geo, mat, edgeOpts) {
    const m = new THREE.Mesh(geo, mat); parent.add(m); if (edgeOpts !== false) this.edges(geo, m, edgeOpts); return m;
  }

  build() {
    const L = (name, sub, z) => { const g = new THREE.Group(); g.userData = { name, sub, z, w: PHONE.w, h: PHONE.h }; this.group.add(g); this.layers.push(g); return g; };
    // 06 LOCK — the back shell with the secure element
    const lock = L('Lock', 'Signed, locked to its own devices', 1.0);
    this.part(lock, slab(74, 154, 2.0, 11), this.matte(0xE8E6E1));
    const se = this.part(lock, slab(12, 12, 1.2, 1.5), this.matte(0x2E2D2A)); se.position.set(-20, 50, 1.6);
    const lm = canvasTex(256, 256, drawLockMark);
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: lm.tex })); mark.position.set(-20, 50, 2.25); lock.add(mark);
    const rib = this.part(lock, slab(66, 146, 0.6, 8.5), this.matte(0xDCDAD4), { opacity: 0.55 }); rib.position.z = 1.3;
    // 05 DATA — battery and storage
    const data = L('Data', 'Stored, backed up, yours to export', 3.6);
    this.part(data, slab(56, 86, 3.2, 3), this.matte(0xD9D7D1)).position.set(0, -26, 0);
    [-14, 6].forEach((x) => { this.part(data, slab(14, 11, 1.2, 1), this.matte(0x2E2D2A)).position.set(x, 44, -0.6); });
    // 04 LOGIC — the board
    const logic = L('Logic', 'Rules that still hold at 2 a.m.', 4.6);
    this.part(logic, slab(64, 50, 1.0, 4), this.matte(0x3B3A37)).position.set(0, 44, 0);
    [[-14, 46, 18, 16], [10, 50, 12, 12], [12, 34, 16, 8], [-20, 28, 8, 8], [24, 56, 6, 10]].forEach(([x, y, w, h]) => {
      this.part(logic, slab(w, h, 1.2, 1), this.matte(0xEDEBE6)).position.set(x, y, 1.0);
    });
    // 03 FLOW — the user flow, drawn before it is built
    const flow = L('Flow', 'How a tired thumb gets through it', 5.6);
    const ft = canvasTex(512, 1104, (ctx, w, h) => drawFlow(ctx, w, h)); this.flowTex = ft;
    this.part(flow, slab(68, 148, 0.3, 9), this.matte(0xF2F0EB));
    const fp = new THREE.Mesh(faceUV(new THREE.ShapeGeometry(roundedRect(68, 148, 9), 10), 68, 148), new THREE.MeshBasicMaterial({ map: ft.tex }));
    fp.position.z = 0.16; flow.add(fp);
    // 02 INTERFACE — the screen
    const ui = L('Interface', 'Every screen drawn and measured', 6.3);
    this.part(ui, slab(70, 150, 0.6, 9.5), this.matte(0x111111), { color: INK_HEX });
    this.product = this.product || LOFTHAUL; this.accent = false;
    this.screenCanvas = document.createElement('canvas'); this.screenCanvas.width = this.product.w * 2; this.screenCanvas.height = this.product.h * 2;
    this.product.draw(this.screenCanvas, { accent: false });
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas); this.screenTex.colorSpace = THREE.SRGBColorSpace; this.screenTex.anisotropy = 8;
    this.screen = new THREE.Mesh(faceUV(new THREE.ShapeGeometry(roundedRect(68, 147.2, 8.6), 12), 68, 147.2), new THREE.MeshBasicMaterial({ map: this.screenTex }));
    this.screen.position.z = 0.32; this.screen.layers.enable(1); ui.add(this.screen);
    // 01 GLASS — the cover glass
    const glass = L('Glass', 'What the hand meets first', 7.1);
    this.part(glass, slab(74, 154, 0.8, 11), this.matte(0xFFFFFF, { transparent: true, opacity: 0.035, depthWrite: false }));
    const pill = this.part(glass, slab(26, 7.5, 0.9, 3.75), this.matte(0x0A0A0A)); pill.position.set(0, 66, 0.05);
    this.layers.reverse(); // front to back: Glass, Interface, Flow, Logic, Data, Lock
    this.layers.forEach((g, i) => { g.userData.index = i; g.position.z = g.userData.z; });
  }

  /** redraw every code-drawn texture (call once the web fonts are in) */
  refreshTextures() {
    this.product.draw(this.screenCanvas, { accent: this.accent }); this.screenTex.needsUpdate = true;
    drawFlow(this.flowTex.canvas.getContext('2d'), this.flowTex.canvas.width, this.flowTex.canvas.height, this.product.flow || LOFTHAUL.flow); this.flowTex.tex.needsUpdate = true;
    this.dirty = true;
  }

  /** hover: redraw the screen with or without the product's own accent colour */
  setScreen({ accent }) {
    this.accent = !!accent;
    this.product.draw(this.screenCanvas, { accent: this.accent });
    this.screenTex.needsUpdate = true; this.dirty = true;
  }

  /** swap the concept product on the screen (and its user flow on the 03 FLOW layer); phones are 390 x 844 */
  setProduct(product) {
    if (!product || product === this.product) return;
    this.product = product;
    if (this.screenCanvas.width !== product.w * 2 || this.screenCanvas.height !== product.h * 2) {
      this.screenCanvas.width = product.w * 2; this.screenCanvas.height = product.h * 2;
      this.screenTex.dispose();                       // a resized canvas needs a fresh GPU texture
    }
    this.refreshTextures();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.W = Math.max(2, r.width); this.H = Math.max(2, r.height);
    this.renderer.setSize(this.W, this.H, false);
    const bw = Math.round(this.W * this.dpr), bh = Math.round(this.H * this.dpr);
    this.rtScene.setSize(bw, bh); this.rtColor.setSize(bw, bh);
    this.over.width = bw; this.over.height = bh;
    this.lineMats.forEach((m) => m.resolution.set(bw, bh));
    this.post.uniforms.uRes.value.set(bw, bh);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    this.post.uniforms.uMinor.value = 1.25 * rem * this.dpr;
    this.post.uniforms.uMajor.value = 6.25 * rem * this.dpr;
    this.dirty = true;
  }

  /** px per mm for the assembled phone = its drawn height on screen / 154 mm */
  layout({ cx, cy, heightPx }) { this.state.cx = cx; this.state.cy = cy; this.state.pxPerMm = heightPx / PHONE.h; this.dirty = true; }
  set(s) { Object.assign(this.state, s); this.dirty = true; }

  /** screen position (CSS px) of a local point on a layer */
  project(layer, x, y, z) {
    const v = new THREE.Vector3(x, y, z).applyMatrix4(layer.matrixWorld).project(this.camera);
    return [(v.x + 1) / 2 * this.W, (1 - v.y) / 2 * this.H];
  }

  update() {
    const s = this.state, k = s.pxPerMm * (1 - (s.zoomAmt ?? 0.22) * s.zoomOut);
    const cam = this.camera;
    cam.left = -this.W / 2 / k; cam.right = this.W / 2 / k; cam.top = this.H / 2 / k; cam.bottom = -this.H / 2 / k;
    cam.updateProjectionMatrix();
    const e = s.explode, t = s.turn;
    // axonometric turn: yaw 34°, pitch 16°
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28 * t, 0.6 * t, 0.0, 'XYZ'));
    this.group.quaternion.copy(q);
    this.layers.forEach((g) => { const i = g.userData.index; g.position.z = g.userData.z + (5 - i) * GAP * e - 2.5 * GAP * e; });
    const ox = (s.cx * this.W - this.W / 2) / k + s.shiftX;
    const oy = -(s.cy * this.H - this.H / 2) / k;
    this.group.position.set(ox, oy, 0);
    this.scene.updateMatrixWorld(true);
  }

  drawOverlay() {
    const c = this.over.getContext('2d'), s = this.state, d = this.dpr;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.over.width, this.over.height);
    c.setTransform(d, 0, 0, d, 0, 0);
    // the sheet's drawing frame (same place as the DOM frame), so the developed blueprint keeps its border
    if (s.frame && s.develop > 0) {
      const [fx, fy, fw, fh] = s.frame, z = parseFloat(getComputedStyle(document.documentElement).fontSize) * (this.W < 1024 ? 1 : 1.25);
      c.strokeStyle = '#121212'; c.lineWidth = 1; c.globalAlpha = 0.85; c.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
      c.globalAlpha = 0.35; c.strokeRect(fx + z + 0.5, fy + z + 0.5, fw - 2 * z - 1, fh - 2 * z - 1); c.globalAlpha = 1;
    }
    if (s.labels <= 0) return;
    const mono = getComputedStyle(document.documentElement).getPropertyValue('--f-mono') || 'monospace';
    const small = this.W < 700;
    const fs = small ? 11 : 12.5;
    c.strokeStyle = '#121212'; c.fillStyle = '#121212'; c.lineWidth = 1;
    // ---- labels: anchor on each layer's top-right corner, text in a column to the right ----
    const anchors = this.layers.map((g) => ({ g, p: this.project(g, PHONE.w / 2 - 6, PHONE.h / 2 - 6, 0.5) }));
    const colX = small ? this.W * 0.7 : Math.max(...anchors.map((a) => a.p[0])) + (small ? 18 : 56);
    const ys = anchors.map((a) => a.p[1]);
    const minGap = small ? 34 : 44;
    // keep order, push down to respect the gap
    const order = anchors.map((a, i) => i).sort((a, b) => ys[a] - ys[b]);
    const ly = new Array(anchors.length);
    let prev = -1e9;
    order.forEach((i) => { ly[i] = Math.max(ys[i], prev + minGap); prev = ly[i]; });
    anchors.forEach((a, i) => {
      const p = Math.min(1, Math.max(0, s.labels * 1.6 - i * 0.12));
      if (p <= 0) return;
      const [x0, y0] = a.p, x1 = colX - 10, y1 = ly[i];
      const len = Math.hypot(x1 - x0, y1 - y0);
      c.beginPath(); c.arc(x0, y0, 2.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(x0, y0);
      const lp = Math.min(1, p * 1.4);
      c.lineTo(x0 + (x1 - x0) * lp, y0 + (y1 - y0) * lp); c.stroke();
      if (p >= 0.55 && len >= 0) {                      // text is either fully there or not at all
        c.font = `500 ${fs}px ${mono}`; c.textBaseline = 'middle';
        c.fillText(`0${i + 1}  ${a.g.userData.name.toUpperCase()}`, colX, y1 - (small ? 6 : 7));
        c.font = `400 ${fs - 1}px ${mono}`; c.globalAlpha = 0.78;
        if (!small) c.fillText(a.g.userData.sub.toUpperCase(), colX, y1 + 9);
        c.globalAlpha = 1;
      }
    });
    // ---- dimension lines on the glass: height and width, in millimetres ----
    const dp = Math.min(1, Math.max(0, s.labels * 1.6 - 0.6));
    if (dp > 0) {
      const g = this.layers[0], W2 = PHONE.w / 2, H2 = PHONE.h / 2, off = 12;
      const dim = (a, b, ea, eb, text) => {
        const A = this.project(g, ...a, 0), B = this.project(g, ...b, 0), EA = this.project(g, ...ea, 0), EB = this.project(g, ...eb, 0);
        c.globalAlpha = 0.9;
        c.beginPath(); c.moveTo(...EA); c.lineTo(A[0] + (A[0] - EA[0]) * 0.15, A[1] + (A[1] - EA[1]) * 0.15);
        c.moveTo(...EB); c.lineTo(B[0] + (B[0] - EB[0]) * 0.15, B[1] + (B[1] - EB[1]) * 0.15); c.stroke();
        const mx = A[0] + (B[0] - A[0]) * dp, my = A[1] + (B[1] - A[1]) * dp;
        c.beginPath(); c.moveTo(...A); c.lineTo(mx, my); c.stroke();
        const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
        const arrow = (P, dir) => { c.save(); c.translate(...P); c.rotate(ang + (dir < 0 ? Math.PI : 0)); c.beginPath(); c.moveTo(0, 0); c.lineTo(8, -2.8); c.lineTo(8, 2.8); c.closePath(); c.fill(); c.restore(); };
        arrow(A, 1); if (dp >= 1) arrow(B, -1);
        if (dp >= 0.98) {
          c.save(); c.translate((A[0] + B[0]) / 2, (A[1] + B[1]) / 2);
          let r = ang; if (r > Math.PI / 2) r -= Math.PI; if (r < -Math.PI / 2) r += Math.PI;
          c.rotate(r); c.font = `500 ${fs}px ${mono}`; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText(text, 0, -5); c.restore();
          c.textAlign = 'left';
        }
        c.globalAlpha = 1;
      };
      dim([-W2 - off, -H2, 0], [-W2 - off, H2, 0], [-W2, -H2, 0], [-W2, H2, 0], `${PHONE.h.toFixed(1)} mm`);
      dim([-W2, -H2 - off, 0], [W2, -H2 - off, 0], [-W2, -H2, 0], [W2, -H2, 0], `${PHONE.w.toFixed(1)} mm`);
    }
  }

  render(force = false) {
    if (!this.dirty && !force) return;
    this.dirty = false;
    this.update();
    const s = this.state, r = this.renderer;
    // scene (black-and-white drawing) into a multisampled target
    r.setRenderTarget(this.rtScene); r.setClearColor(0x000000, 0); r.clear(); this.camera.layers.set(0); this.camera.layers.enable(1); r.render(this.scene, this.camera);
    // the screen alone, for its true colours on hover
    if (s.hover > 0) { r.setRenderTarget(this.rtColor); r.clear(); this.camera.layers.set(1); r.render(this.scene, this.camera); this.camera.layers.enable(0); }
    this.drawOverlay(); this.overTex.needsUpdate = true;
    const u = this.post.uniforms;
    u.uDev.value = s.develop; u.uHover.value = s.hover;
    const ctr = this.project(this.layers[2], 0, 0, 0);
    u.uCenter.value.set(ctr[0] * this.dpr, (this.H - ctr[1]) * this.dpr);
    r.setRenderTarget(null); r.setClearColor(0x000000, 0); r.clear();
    r.render(this.postScene, this.postCam);
  }

  /** is the pointer over the phone's screen? (CSS px in the canvas) */
  hitScreen(x, y) {
    const ray = new THREE.Raycaster(); ray.layers.set(1);
    ray.setFromCamera(new THREE.Vector2(x / this.W * 2 - 1, -(y / this.H) * 2 + 1), this.camera);
    return ray.intersectObject(this.screen, false).length > 0;
  }
}

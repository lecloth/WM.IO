// A · The 3D assembly look (the site's signature): a real object starts apart with named pieces and comes together
// as you scroll. Same real model in all three looks:
//   A1 matte  : matte engineering render, hairline edges, mono labels (Take 1's hero look, carried further)
//   A2 material: the object's real metals (brass, steel) on paper, patent-style "Fig." letter callouts
//   A3 xray   : X-ray in cyanotype blue, white lines, see-through
// The model is a kit (kit.js); the words are PLACEHOLDERS.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeRenderer, keys, span, clamp, ease, lerp, disposeScene, safeBand, containDistance } from './lab3d.js';
import { loadKit } from './kit.js';

export const KIT = '../../media/models/lock/';
const LETTERS = 'ABCDEFGHJKLMNOPRS';

const CSS = `
.a-over { position:absolute; inset:0; z-index:2; pointer-events:none; }
.a-lbl { position:absolute; left:0; top:0; pointer-events:none; white-space:nowrap; opacity:0; transition:opacity .2s; }
.a-lbl.on { opacity:1; }
.a-lbl b { display:block; font-family:var(--f-mono); font-weight:500; font-size:11px; letter-spacing:.06em; text-transform:uppercase; }
.a-lbl span { display:block; font-size:13px; line-height:1.2; color:var(--graphite); }
.a-lbl.fig b { font-family:var(--f-display); font-style:italic; font-weight:500; font-size:22px; letter-spacing:0; text-transform:none; line-height:1; }
.a-lbl.xr b { color:#ECF1F6; } .a-lbl.xr span { color:rgba(236,241,246,.75); }
.a-mount-paper { background:#ECDEC5 url(../media/paper/miller-1905-paper.webp) 0 0/560px repeat; }  /* real paper: a blank margin of Miller 1905, mirrored into a tile */
.a-legend { columns:2; column-gap:14px; font-size:15px; line-height:1.35; margin-top:6px; }
.a-legend i { font-style:italic; font-weight:500; margin-right:4px; }
.a-wait { position:absolute; inset:0; display:grid; place-items:center; padding:24px; text-align:center; z-index:3; }
.a-wait p { max-width:28ch; font-size:18px; }
`;
let styled = false;

const MATS = {
  brass: { color: 0xC59A4E, metalness: 1, roughness: 0.34 },
  steel: { color: 0xB8BBBF, metalness: 1, roughness: 0.3 },
  dark: { color: 0x4E5256, metalness: 0.9, roughness: 0.42 },
  spring: { color: 0xA3A7AC, metalness: 1, roughness: 0.25 },
};

export async function create(mount, ctx) {
  if (!styled) { const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); styled = true; }
  const look = ctx.def.look;
  let kit;
  try { kit = await loadKit(ctx.def.kit || KIT); } catch (e) {
    mount.innerHTML = `<div class="a-wait"><p class="mono">${ctx.def.code}: the real 3D model is not downloaded yet.</p></div>`;
    return { render() {}, resize() {}, dispose() { mount.replaceChildren(); } };
  }
  const xray = look === 'xray', material = look === 'material', matte = look === 'matte';
  if (material) mount.classList.add('a-mount-paper');
  const renderer = makeRenderer(mount, xray ? { alpha: false, clear: 0x173F73, clearAlpha: 1 } : {});
  if (material) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
  const root = new THREE.Group(); scene.add(root);
  const lineMats = [];
  let W = 1, H = 1;

  if (matte) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6ae, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-0.6, 1, 1.4); scene.add(key);
  }
  if (material) {
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    const key = new THREE.DirectionalLight(0xfff4e0, 1.2); key.position.set(-1, 1.6, 1.2); scene.add(key);
    // a soft contact shadow under the object (a radial falloff drawn in code)
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, 'rgba(40,30,15,.32)'); rg.addColorStop(1, 'rgba(40,30,15,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = -kit.size.y / 2 - 0.02; root.add(sh); ctx.shadow = sh;
  }

  const lineMat = (color, opacity = 1) => { const m = new LineMaterial({ color, linewidth: 1, transparent: opacity < 1, opacity, worldUnits: false }); lineMats.push(m); return m; };
  const xrayMat = () => new THREE.ShaderMaterial({
    uniforms: { glow: { value: 0 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float glow; varying vec3 vN; varying vec3 vV; void main(){ float f = 1. - abs(dot(normalize(vN), normalize(vV))); float a = .05 + pow(f, 2.2) * .55 + glow * .25; gl_FragColor = vec4(vec3(.93,.95,.97) * a, a); }`,
  });

  const parts = kit.parts.map((p, i) => {
    let mat;
    if (matte) mat = new THREE.MeshStandardMaterial({ color: 0xEAE8E3, roughness: 0.95, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    if (material) mat = new THREE.MeshStandardMaterial({ ...(MATS[p.mat] || MATS.steel), envMapIntensity: 1.0 });
    if (xray) mat = xrayMat();
    const mesh = new THREE.Mesh(p.geo, mat);
    const holder = new THREE.Group(); holder.add(mesh); root.add(holder);
    let edges = null;
    if (matte || xray) {
      const eg = new THREE.EdgesGeometry(p.geo, matte ? 28 : 38);
      edges = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(eg), matte ? lineMat(0x121212) : lineMat(0xECF1F6, 0.7));
      eg.dispose(); holder.add(edges);
    }
    const lbl = document.createElement('div');
    lbl.className = 'a-lbl' + (material ? ' fig' : '') + (xray ? ' xr' : '');
    lbl.innerHTML = material ? `<b>${LETTERS[i]}</b>` : `<b>${String(i + 1).padStart(2, '0')} ${p.name}</b>${p.sub ? `<span>${p.sub}</span>` : ''}`;
    return { ...p, i, mesh, holder, edges, lbl, seated: false };
  });
  const over = document.createElement('canvas'); over.className = 'a-over'; mount.append(over);
  const og = over.getContext('2d');
  parts.forEach((p) => mount.append(p.lbl));

  // timeline: hold apart (labels) → parts arrive one by one (ticks) → assembled hold
  const N = parts.length, A0 = 0.16, A1 = 0.8, win = Math.min(0.22, (A1 - A0) * 2.2 / N);
  parts.forEach((p, k) => { p.a = A0 + (N > 1 ? k * (A1 - A0 - win) / (N - 1) : 0); });
  const title = kit.title || 'The real object';
  ctx.addText({ from: 0, to: A0 - 0.04, pos: 'top', dark: xray, eyebrow: `Fig. 1 · ${title} · in ${N} pieces`, big: 'Every piece has a name.',
    body: material ? `<span class="a-legend">${parts.map((p) => `<span><i>${LETTERS[p.i]}</i>${p.name}</span>`).join('<br>')}</span>` : '' });
  ctx.addText({ from: A1 + 0.08, to: 1, pos: 'top', dark: xray, eyebrow: `Fig. 2 · ${title} · assembled`, big: 'Together, it holds.' });

  // camera: fit the exploded object at the start, the assembled one at the end
  const sphere = (exploded) => {
    const b = new THREE.Box3();
    parts.forEach((p) => { const bb = p.geo.boundingBox.clone(); if (exploded) bb.translate(p.explodeV); b.union(bb); });
    return b.getBoundingSphere(new THREE.Sphere());
  };
  const sA = sphere(true), sB = sphere(false);
  const tmp = new THREE.Vector3();

  function layoutLabels(showFor) {
    og.clearRect(0, 0, over.width, over.height);
    const dpr = over.width / W;
    const pts = [];
    parts.forEach((p) => {
      const on = showFor(p);
      p.lbl.classList.toggle('on', on);
      if (!on) return;
      tmp.copy(p.center).applyMatrix4(p.holder.matrixWorld).project(camera);
      pts.push({ p, x: (tmp.x + 1) / 2 * W, y: (1 - tmp.y) / 2 * H });
    });
    // labels in two columns, kept apart vertically, inside the safe band
    const top = Math.min(130, H * 0.2), bottom = H - Math.min(96, H * 0.16);
    ['L', 'R'].forEach((side) => {
      const col = pts.filter((q) => (side === 'L') === (q.x < W / 2)).sort((a, b) => a.y - b.y);
      const gap = material ? 30 : 36;
      let y = top;
      col.forEach((q) => { q.ly = Math.max(y, Math.min(q.y, bottom - (col.length - col.indexOf(q)) * gap)); y = q.ly + gap; });
      col.forEach((q) => {
        const lw = q.p.lbl.offsetWidth, lx = side === 'L' ? 14 : W - 14 - lw;
        q.p.lbl.style.transform = `translate(${lx}px, ${q.ly - 8}px)`;
        const ax = side === 'L' ? lx + lw + 6 : lx - 6;
        og.strokeStyle = xray ? 'rgba(236,241,246,.8)' : 'rgba(18,18,18,.85)'; og.lineWidth = dpr;
        og.beginPath(); og.moveTo(ax * dpr, q.ly * dpr); og.lineTo(q.x * dpr, q.y * dpr); og.stroke();
        og.fillStyle = og.strokeStyle; og.beginPath(); og.arc(q.x * dpr, q.y * dpr, 2 * dpr, 0, 7); og.fill();
      });
    });
  }

  return {
    render(p) {
      const band = safeBand(camera, W, H);
      const t = ease(span(p, A0, A1));
      const s = sA.radius + (sB.radius - sA.radius) * t;
      const d = containDistance(camera, s * 2, s * 2, band, 1.02);
      const cx = lerp(sA.center.x, sB.center.x, t), cy = lerp(sA.center.y, sB.center.y, t), cz = lerp(sA.center.z, sB.center.z, t);
      const yaw = lerp(-0.62, -0.38, p) + (kit.yaw || 0), pitch = 0.38;
      camera.position.set(cx + d * Math.sin(yaw) * Math.cos(pitch), cy + d * Math.sin(pitch), cz + d * Math.cos(yaw) * Math.cos(pitch));
      camera.lookAt(cx, cy, cz);
      parts.forEach((q) => {
        const k = ease(span(p, q.a, q.a + win));
        q.holder.position.copy(q.explodeV).multiplyScalar(1 - k);
        const seated = k >= 0.999;
        if (seated && !q.seated && !ctx.reduced) {
          ctx.haptics.tick(14);
          q.flash = performance.now();
        }
        q.seated = seated;
      });
      scene.updateMatrixWorld(true);
      layoutLabels(() => p < A0 - 0.04);
      renderer.render(scene, camera);
    },
    resize(w, h) {
      W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      const dpr = renderer.getPixelRatio(); over.width = Math.round(w * dpr); over.height = Math.round(h * dpr); over.style.width = w + 'px'; over.style.height = h + 'px';
      lineMats.forEach((m) => m.resolution.set(w * dpr, h * dpr));
    },
    dispose() { disposeScene(scene, renderer); mount.replaceChildren(); mount.classList.remove('a-mount-paper'); },
  };
}

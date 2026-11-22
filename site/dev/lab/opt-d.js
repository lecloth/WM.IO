// D · The door into the final room (just before the ending's checklist).
// D1: Yale's 1865 patent sheet (a real USPTO scan) splits down its centre line and opens towards you like two doors.
// D2: a corridor of the site's real patent plates, each with a doorway cut in it; you fly through them one by one
//     and the last doorway is the bright final room.
// The room itself is plain HTML on paper, shown only once the doors have stopped. All words are PLACEHOLDERS.
import * as THREE from 'three';
import { makeRenderer, loadTex, keys, span, clamp, ease, disposeScene, safeBand, containDistance } from './lab3d.js';

const M = '../../media/plates/';
const CSS = `
.d-room { position:absolute; inset:0; z-index:1; display:flex; flex-direction:column; justify-content:center; padding:24px 20px 96px; background:var(--paper); opacity:0; transition:opacity .25s; }
.d-room.on { opacity:1; }
.d-room h2 { font-size:34px; line-height:1.04; letter-spacing:-.02em; font-weight:420; margin:8px 0 14px; }
.d-room ul { list-style:none; border-top:1px solid rgba(var(--ink-rgb),.2); }
.d-room li { display:flex; align-items:center; gap:12px; min-height:52px; border-bottom:1px solid rgba(var(--ink-rgb),.2); font-size:20px; }
.d-room li i { width:24px; height:24px; border:1.5px solid var(--ink); display:grid; place-items:center; font-style:normal; font-size:15px; }
.d-room button { margin-top:18px; min-height:52px; background:var(--ink); color:var(--paper); font-size:18px; padding:0 22px; align-self:flex-start; }
.d-room .mono { color:var(--graphite); }
.d-canvas { position:absolute; inset:0; z-index:2; }
.d-canvas canvas { display:block; width:100%; height:100%; }
`;
let styled = false;
const ROOM = `<span class="ph-tag">placeholder words</span><p class="mono">The last room</p><h2>Tick what you need. We take it from here.</h2>
  <ul><li><i>✓</i>Website</li><li><i>✓</i>Security check</li><li><i></i>App</li><li><i></i>AI that works</li></ul>
  <button type="button" tabindex="-1">Send on WhatsApp</button>`;

export async function create(mount, ctx) {
  if (!styled) { const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); styled = true; }
  const room = document.createElement('div'); room.className = 'd-room'; room.innerHTML = ROOM; mount.append(room);
  const holder = document.createElement('div'); holder.className = 'd-canvas'; mount.append(holder);
  const v = ctx.def.variant;
  const renderer = makeRenderer(holder);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  let W = 1, H = 1, ready = false;
  const api = v === 'plate' ? await plateDoors() : await corridor();
  ready = true;

  // ---------- D1: the plate opens like two doors ----------
  async function plateDoors() {
    renderer.setClearColor(0xF2F0EB, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a877f, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(0.4, 0.6, 1.2); scene.add(key);
    const tex = await loadTex(M + 'sec-yale-us48475-sheet.webp', renderer);
    const aspect = tex.image.width / tex.image.height;      // 1400 x 1936
    const SH = 2, SW = SH * aspect, T = 0.012;               // sheet in world units, paper thickness
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xE9E6DE, roughness: 1 });
    const leaves = [-1, 1].map((side) => {
      const t = tex.clone(); t.needsUpdate = true;
      t.repeat.set(0.5, 1); t.offset.set(side < 0 ? 0 : 0.5, 0);
      const face = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 });
      const back = new THREE.MeshStandardMaterial({ color: 0xE4E0D6, roughness: 1 });
      const geo = new THREE.BoxGeometry(SW / 2, SH, T);
      geo.translate(-side * SW / 4, 0, 0);                    // hinge at the outer edge
      const mesh = new THREE.Mesh(geo, [edgeMat, edgeMat, edgeMat, edgeMat, face, back]);
      const hinge = new THREE.Group(); hinge.position.x = side * SW / 2; hinge.add(mesh); scene.add(hinge);
      return { hinge, side };
    });
    // the doorway's dark reveal behind the leaves (only seen while they open), and a thin frame
    const reveal = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ color: 0x0E0E0E, transparent: true }));
    reveal.position.z = -0.02; scene.add(reveal);
    ctx.addText({ from: 0, to: 0.08, pos: 'top', eyebrow: 'Fig. · L. Yale Jr. · lock · 1865', big: 'One more door.' });
    return {
      render(p) {
        const d0 = containDistance(camera, SW, SH, safeBand(camera, W, H));
        const open = ease(span(p, 0.12, 0.62));
        leaves.forEach(({ hinge, side }) => { hinge.rotation.y = side * open * THREE.MathUtils.degToRad(104); });
        // the reveal shows black while the leaves part, then lets the room's paper through
        reveal.material.opacity = clamp(1 - span(p, 0.45, 0.6)) * Math.min(1, open * 4);
        reveal.visible = reveal.material.opacity > 0.001;
        camera.position.set(0, 0, keys(p, [[0, d0], [0.12, d0], [0.5, d0 * 0.86], [0.92, 0.6]]));
        room.classList.toggle('on', p > 0.6);
        holder.style.opacity = String(1 - span(p, 0.86, 0.96));
      },
    };
  }

  // ---------- D2: a corridor of real plates, a doorway cut in each ----------
  async function corridor() {
    renderer.setClearColor(0x0B0B0B, 1);
    const plates = [
      ['bell-us186787-sheet1.webp', 'A. G. Bell · telephone · 1877'],
      ['bullock-us38200-sheet.webp', 'W. Bullock · printing press · 1863'],
      ['firman-us252576-sheet.webp', 'L. B. Firman · switchboard · 1882'],
      ['ai-babbage-plan25-1840.webp', 'C. Babbage · Plan 25 · 1840 · photo ArnoldReinhold, CC BY 4.0'],
      ['sec-yale-us48475-sheet.webp', 'L. Yale Jr. · lock · 1865'],
    ];
    const DOOR = { w: 0.36, h: 0.56 };                         // doorway as a fraction of the wall height
    const texs = await Promise.all(plates.map(([f]) => loadTex(M + f, renderer)));
    const fogU = { near: { value: 4 }, far: { value: 15 } };
    const walls = texs.map((tex) => {
      const a = tex.image.width / tex.image.height, h = 3.0, w = h * a;
      const mat = new THREE.ShaderMaterial({
        uniforms: { map: { value: tex }, open: { value: 0 }, door: { value: new THREE.Vector2(DOOR.w / a, DOOR.h) }, fogColor: { value: new THREE.Color(0x0B0B0B) }, fogNear: fogU.near, fogFar: fogU.far },
        vertexShader: `varying vec2 vUv; varying float vDepth; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform sampler2D map; uniform float open; uniform vec2 door; uniform vec3 fogColor; uniform float fogNear, fogFar; varying vec2 vUv; varying float vDepth;
          void main(){
            vec2 d = abs(vUv - vec2(.5, .44)) - vec2(door.x * .5, door.y * .5) * open;
            if (open > 0.001 && d.x < 0. && d.y < 0.) discard;               // the doorway, cut open as you leave
            float e = max(d.x, d.y);
            vec3 c = texture2D(map, vUv).rgb;
            c *= 1. - .6 * (1. - smoothstep(0., .014, e));                    // the cut edge reads as thickness
            float f = smoothstep(fogNear, fogFar, vDepth);
            gl_FragColor = vec4(mix(c, fogColor, f), 1.);
            #include <colorspace_fragment>
          }`,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.userData = { w, h }; scene.add(m);
      return m;
    });
    const light = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xF2F0EB, fog: false }));
    scene.add(light);
    const N = plates.length, seg = 0.86 / N;
    for (let i = 0; i < N; i++) ctx.addText({ from: i * seg + seg * 0.2, to: i * seg + seg * 0.5, pos: 'top', dark: true, eyebrow: `Door ${i + 1} of ${N}`, body: plates[i][1] });
    let k = [[0, 10]], GAP = 6;
    function layout() {
      // each stop shows its whole plate (contain-fit for this screen); walls sit one stop apart plus a step
      const band = safeBand(camera, W, H);
      const fitD = (m) => containDistance(camera, m.userData.w, m.userData.h, band);
      const D = Math.max(...walls.map(fitD)); GAP = D + 1.4;
      walls.forEach((m, i) => m.position.set(0, 0.18, -i * GAP));
      light.scale.set(GAP * 3, GAP * 3, 1); light.position.set(0, 0.18, -N * GAP + 0.4);
      fogU.near.value = D * 1.05; fogU.far.value = D + GAP * 1.6;
      k = [[0, fitD(walls[0]) + 0.8]];
      for (let i = 0; i < N; i++) { const z = -i * GAP + fitD(walls[i]); k.push([i * seg + seg * 0.2, z], [i * seg + seg * 0.5, z]); }
      k.push([0.95, -N * GAP + 1.2], [1, -N * GAP + 0.9]);
    }
    return {
      layout,
      render(p) {
        const z = keys(p, k);
        camera.position.set(0, 0.18, z);
        // a slow roll as you pass each doorway: the corridor turns under you, level again at every stop
        // between stops (from 0.5 of one segment to 0.2 of the next) the corridor rolls a little; level at every stop
        const q = clamp(p / 0.86) * N, i0 = Math.floor(q - 0.5), m = (q - 0.5 - i0) / 0.7;
        const roll = p > seg * 0.2 && p < 0.86 && m >= 0 && m <= 1 ? Math.sin(m * Math.PI) * 0.06 * (i0 % 2 ? -1 : 1) : 0;
        camera.rotation.set(0, 0, roll);
        walls.forEach((w, i) => {
          w.visible = w.position.z < z - 0.02;
          w.material.uniforms.open.value = ease(span(p, i * seg + seg * 0.5, i * seg + seg * 0.85));
        });
        room.classList.toggle('on', p > 0.95);
        holder.style.opacity = String(1 - span(p, 0.95, 0.985));
      },
    };
  }

  return {
    render(p) { if (!ready) return; api.render(p); renderer.render(scene, camera); },
    resize(w, h) { W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); api.layout?.(); },
    dispose() { disposeScene(scene, renderer); room.remove(); holder.remove(); },
  };
}

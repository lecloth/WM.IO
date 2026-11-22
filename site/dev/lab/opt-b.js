// B · The trip into the lock, on the real 3D lock ("Cutaway Lock" by zbzzn, CC BY 4.0, CREDITS.md).
//   B1 dive     : you are the key. Straight through the keyhole, under the five pins as they lift, the plug turns
//                 with you inside it, then out the back.
//   B2 section  : cut open, on paper. Ride along the pins as the key lifts them to the shear line, then the turn.
//   B3 tesseract: inside the keyway the lock repeats in every direction: a room of locks that unlock in a wave,
//                 then the whole room folds back into one point.
// The pins are lifted by the real key's own profile (key ABCDE lifts every stack by 2.2 mm to the shear line at
// z = 16 mm). Text lands only while the camera holds still. All words are PLACEHOLDERS.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeRenderer, keys, span, clamp, ease, lerp, disposeScene } from './lab3d.js';
import { loadKit } from './kit.js';
import { KIT } from './opt-a.js';

const CSS = `
.b-shear { position:absolute; left:0; top:0; z-index:3; transform-origin:0 0; opacity:0; transition:opacity .2s; pointer-events:none; }
.b-shear.on { opacity:1; }
.b-shear i { display:block; height:0; border-top:1.5px dashed #121212; }
.b-shear b { position:absolute; left:0; top:-22px; font-family:var(--f-mono); font-weight:500; font-size:11px; letter-spacing:.06em; text-transform:uppercase; background:rgba(var(--paper-rgb),.92); padding:1px 4px; }
`;
let styled = false;
const TXT_IN = { eyebrow: 'L. Yale Jr. · 1865', big: '1865: a lock kept strangers out.' };
const TXT_OUT = { eyebrow: 'Security · today', big: 'Today: we keep them out of your systems.' };

/** the key's top edge along its length (model mm), sampled from the real key mesh */
function keyProfile(geo, inv) {
  const pos = geo.attributes.position, idx = geo.index, bins = new Map(), v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const put = (p) => { if (Math.abs(p.x + 1) > 3.2) return; const b = Math.round(p.y * 4); bins.set(b, Math.max(bins.get(b) ?? -1e9, p.z)); };
  const n = idx ? idx.count : pos.count, q = new THREE.Vector3();
  for (let i = 0; i < n; i += 3) {
    for (let j = 0; j < 3; j++) v[j].fromBufferAttribute(pos, idx ? idx.getX(i + j) : i + j).applyMatrix4(inv);
    for (let j = 0; j < 3; j++) for (let t = 0; t <= 8; t++) put(q.lerpVectors(v[j], v[(j + 1) % 3], t / 8));
  }
  return (y) => { const b = Math.round(y * 4); let z = -1e9; for (let d = -1; d <= 1; d++) z = Math.max(z, bins.get(b + d) ?? -1e9); return z; };
}

export async function create(mount, ctx) {
  if (!styled) { const st = document.createElement('style'); st.textContent = CSS; document.head.append(st); styled = true; }
  const v = ctx.def.variant;
  const kit = await loadKit(KIT);
  const dark = v !== 'section';
  const renderer = makeRenderer(mount, dark ? { alpha: false, clear: 0x0A0A0B, clearAlpha: 1 } : {});
  renderer.localClippingEnabled = false;
  if (dark) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(v === 'section' ? 34 : 62, 1, 0.0015, 60);
  let W = 1, H = 1;
  const S = kit.scale, inv = kit.xf.clone().invert();
  const M = (x, y, z) => kit.toWorld(x, y, z);                     // model mm -> world
  const UP = kit.dirWorld(0, 0, 1), AX = kit.dirWorld(0, 1, 0);    // world directions of model +z (up) and +y (out of the front)
  const lineMats = [];

  // ---------- materials per trip ----------
  let mats;
  if (dark) {
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    scene.environmentIntensity = 0.55;
    scene.fog = new THREE.Fog(0x0A0A0B, 0.6, v === 'tesseract' ? 9 : 3.2);
    const lamp = new THREE.PointLight(0xfff1dc, 0.1, 2.0, 1); camera.add(lamp); scene.add(camera);
    const rim = new THREE.DirectionalLight(0xffe7c2, 0.9); rim.position.set(-1, 1.5, 0.6); scene.add(rim);   // a headlamp: we carry the light in
    mats = {
      brass: new THREE.MeshStandardMaterial({ color: 0xB88F48, metalness: 1, roughness: 0.42 }),
      steel: new THREE.MeshStandardMaterial({ color: 0xB8BBBF, metalness: 1, roughness: 0.28 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x5A5E62, metalness: 0.9, roughness: 0.38 }),
    };
  } else {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b6ae, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-0.6, 1, 1.4); scene.add(key);
    const matte = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    mats = { brass: matte(0xEAE8E3), steel: matte(0xD9D7D2), dark: matte(0x3C3B38) };
  }
  const edgeOf = (geo, holder, thr) => {
    if (dark) return;
    const m = new LineMaterial({ color: 0x121212, linewidth: 1, worldUnits: false }); lineMats.push(m);
    const eg = new THREE.EdgesGeometry(geo, thr); holder.add(new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(eg), m)); eg.dispose();
  };

  // ---------- the rig: housing, cap, clip stay; plug + key pins + key turn about the plug's axis ----------
  const axisPt = M(0, 0, 0);
  const lock = new THREE.Group(); scene.add(lock);
  const pivot = new THREE.Group(); pivot.position.copy(axisPt); lock.add(pivot);
  const inPivot = new THREE.Group(); inPivot.position.copy(axisPt).negate(); pivot.add(inPivot);
  const by = (id) => kit.parts.find((p) => p.id === id);
  const add = (part, parent) => {
    const h = new THREE.Group(); const m = new THREE.Mesh(part.geo, mats[part.mat] || mats.steel); h.add(m); parent.add(h);
    edgeOf(part.geo, h, part.group ? 60 : 28); return h;
  };
  ['housing', 'cap', 'clip'].forEach((id) => add(by(id), lock));
  add(by('plug'), inPivot);
  const keyH = add(by('key'), inPivot);
  const keyPins = [1, 2, 3, 4, 5].map((i) => add(by('keypin' + i), inPivot));
  const drivers = [1, 2, 3, 4, 5].map((i) => add(by('driver' + i), lock));
  const pinY = kit.pins.y, bottoms = [1.8, 0.4, -1.0, -2.4, -3.8], LIFT = kit.pins.lift;
  const profile = keyProfile(by('key').geo, inv);
  const aligned = [false, false, false, false, false];
  let turnedOnce = false;

  /** key position (mm out of the lock along +y; 0 = fully in) and plug turn (0..1 = 0..90°) */
  function setLock(off, turn) {
    keyH.position.copy(AX).multiplyScalar(off * S);
    keyPins.forEach((h, i) => {
      const yk = pinY[i] - off;                                          // where on the key this pin sits
      const lift = yk < -80 || off > 200 ? 0 : clamp(profile(yk) - bottoms[i], 0, 6);
      h.position.copy(UP).multiplyScalar(lift * S);
      drivers[i].position.copy(UP).multiplyScalar(lift * S);
      const ok = Math.abs(lift - LIFT) < 0.06 && off < 0.5;
      if (ok && !aligned[i] && !ctx.reduced) ctx.haptics.tick(12);
      aligned[i] = ok;
    });
    pivot.quaternion.setFromAxisAngle(AX, -turn * Math.PI / 2);
    if (turn >= 0.999 && !turnedOnce) { ctx.haptics.tick(18); turnedOnce = true; } else if (turn < 0.9) turnedOnce = false;
  }

  // a camera given in model mm: position, target, and an optional roll with the plug
  const camQ = new THREE.Quaternion();
  function setCam(pos, look, roll = 0) {
    camera.position.copy(M(...pos)); camera.up.copy(UP);
    if (roll) { camQ.setFromAxisAngle(AX, -roll * Math.PI / 2); camera.position.sub(axisPt).applyQuaternion(camQ).add(axisPt); camera.up.applyQuaternion(camQ); }
    const t = M(...look); if (roll) t.sub(axisPt).applyQuaternion(camQ).add(axisPt);
    camera.lookAt(t);
  }

  // ---------- B3: the room of locks (instanced copies of the real housing, plug, cap and key) ----------
  let room = null;
  if (v === 'tesseract') {
    const step = M(0, 0, 0).distanceTo(M(190, 0, 0));
    const cells = []; for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) for (let k = -2; k <= 2; k++) if (i || j || k) cells.push([i, j, k]);
    const lattice = new THREE.Group(); scene.add(lattice);
    const cheap = { brass: new THREE.MeshLambertMaterial({ color: 0xA88445 }), steel: new THREE.MeshLambertMaterial({ color: 0x9A9DA1 }) };
    const inst = ['housing', 'plug', 'cap', 'key'].map((id) => {
      const part = by(id), im = new THREE.InstancedMesh(part.geo, cheap[part.mat] || cheap.steel, cells.length);
      im.frustumCulled = false; lattice.add(im); return { id, im };
    });
    room = { lattice, inst, cells, step, m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(1, 1, 1) };
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x0a0a0a, 0.5));
  }
  function setRoom(show, wave, fold, collapse) {
    if (!room) return;
    room.lattice.visible = show > 0.001;
    if (!room.lattice.visible) return;
    const { cells, step, m, q, p, s, inst } = room;
    const camLocal = room.lattice.worldToLocal(camera.position.clone());
    // the whole room turns about two axes at once while it is revealed: the "fold"
    room.lattice.quaternion.setFromEuler(new THREE.Euler(fold * 0.9, fold * 1.4, fold * 0.35));
    cells.forEach(([i, j, k], n) => {
      const d = Math.hypot(i, j, k), k1 = clamp(show * 4 - d * 0.55);     // nearer copies appear first
      p.set(i * step, j * step * 0.92, k * step).multiplyScalar(1 - collapse);
      const near = clamp((camLocal.distanceTo(p) - step * 0.45) / (step * 0.35));   // a copy never closes in on the camera
      const sc = k1 * (1 - collapse) * near;
      const turn = clamp(wave * 3.2 - d * 0.42);                            // copies unlock in a wave from the centre
      inst.forEach(({ id, im }) => {
        if (id === 'plug' || id === 'key') {
          q.setFromAxisAngle(AX, -ease(turn) * Math.PI / 2);
          const a = axisPt.clone(); m.compose(p.clone().add(a).sub(a.clone().applyQuaternion(q)), q, s.set(sc, sc, sc));
        } else m.compose(p, q.identity(), s.set(sc, sc, sc));
        im.setMatrixAt(n, m);
      });
      q.identity();
    });
    inst.forEach(({ im }) => { im.instanceMatrix.needsUpdate = true; });
  }

  // ---------- the three trips ----------
  const stopsText = (a, b) => { ctx.addText({ from: a[0], to: a[1], pos: 'top', dark, ...TXT_IN }); ctx.addText({ from: b[0], to: b[1], pos: 'top', dark, ...TXT_OUT }); };
  let render;
  if (v === 'dive') {
    stopsText([0, 0.08], [0.93, 1]);
    ctx.addText({ from: 0.56, to: 0.64, pos: 'bottom', dark, eyebrow: 'Inside · looking back at the keyhole', body: 'Five pins, lifted to one line. Now it turns.' });
    render = (p) => {
      const camY = keys(p, [[0, 150], [0.08, 150], [0.3, 6], [0.54, -58], [0.66, -58]]);
      const pos = keys(p, [[0, [40, 165, 40]], [0.08, [40, 165, 40]], [0.3, [-1, 6, -9]], [0.54, [-1, -58, -9]], [0.66, [-1, -58, -9]], [0.84, [-1, -58, -9]], [0.92, [-150, -210, 120]]]);
      const look = keys(p, [[0, [0, -30, 38]], [0.08, [0, -30, 38]], [0.3, [-1, -60, -6]], [0.5, [-1, -110, 4]], [0.56, [-1, 60, 6]], [0.84, [-1, 60, 6]], [0.92, [0, -36, 46]]]);
      const off = p < 0.54 ? clamp(camY + 3 + 80, 0, 260) : 0;             // the key rides just behind the camera: you are the key
      keyH.visible = p > 0.84;
      const turn = ease(span(p, 0.66, 0.8));
      setLock(off, turn);
      setCam(pos, look, p < 0.84 ? turn : 0);
      scene.fog.far = lerp(3.2, 12, Math.max(1 - span(p, 0.08, 0.26), span(p, 0.8, 0.92)));
    };
  }
  if (v === 'section') {
    stopsText([0, 0.08], [0.92, 1]);
    ctx.addText({ from: 0.5, to: 0.6, pos: 'top', eyebrow: 'Section · the shear line', body: 'Every pin lifted to the same line. Only this key does that.' });
    const shear = document.createElement('div'); shear.className = 'b-shear';
    shear.innerHTML = '<i></i><b>Shear line</b>'; mount.append(shear);
    render = (p) => {
      const off = keys(p, [[0, 150], [0.08, 150], [0.5, 0]]);
      const pos = keys(p, [[0, [300, 70, 150]], [0.08, [300, 70, 150]], [0.2, [200, -4, 36]], [0.5, [200, -36, 34]], [0.6, [200, -36, 34]], [0.76, [200, -36, 34]], [0.9, [390, 110, 190]]]);
      const look = keys(p, [[0, [0, -30, 46]], [0.08, [0, -30, 46]], [0.2, [0, -12, 12]], [0.5, [0, -36, 30]], [0.6, [0, -36, 30]], [0.76, [0, -36, 30]], [0.9, [0, -10, 52]]]);
      if (p > 0.2 && p < 0.5) { const tip = Math.max(-62, -80 + off); const k = Math.sin(span(p, 0.2, 0.5) * Math.PI); pos[1] = lerp(pos[1], tip + 14, 0.5 * k); look[1] = lerp(look[1], tip + 14, 0.5 * k); }
      setLock(off, ease(span(p, 0.62, 0.76)));
      setCam(pos, look);
      // the shear line: a hairline across the five stacks at z = 16 mm, only while the camera holds at the stop
      const on = p >= 0.5 && p <= 0.6;
      shear.classList.toggle('on', on);
      if (on) {
        camera.updateMatrixWorld();
        const a = M(21, 2, 16).project(camera), c = M(21, -70, 16).project(camera);
        let x1 = (a.x + 1) / 2 * W, y1 = (1 - a.y) / 2 * H, x2 = (c.x + 1) / 2 * W, y2 = (1 - c.y) / 2 * H;
        if (x2 < x1) [x1, y1, x2, y2] = [x2, y2, x1, y1];
        shear.style.transform = `translate(${x1}px, ${y1}px) rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
        shear.firstChild.style.width = Math.hypot(x2 - x1, y2 - y1) + 'px';
      }
    };
  }
  if (v === 'tesseract') {
    stopsText([0, 0.07], [0.94, 1]);
    ctx.addText({ from: 0.46, to: 0.54, pos: 'top', dark, eyebrow: 'Outside · every lock you own', big: 'One door is never the only door.' });
    render = (p) => {
      const off = keys(p, [[0, 160], [0.07, 160], [0.26, 0]]);
      const orbit = ease(span(p, 0.54, 0.84)) * 1.1;                          // the room turns around you
      const far = [-150, 300, 150], ca = Math.cos(orbit), sa = Math.sin(orbit);
      const farR = [far[0] * ca - far[1] * sa, far[0] * sa + far[1] * ca - 36 * 0, far[2]];
      const pos = keys(p, [[0, [40, 165, 40]], [0.07, [40, 165, 40]], [0.26, [-1, -30, -9]], [0.32, [-1, -30, -9]], [0.46, far], [0.54, far], [0.84, farR], [0.93, [-110, 190, 90]]]);
      const look = keys(p, [[0, [0, -30, 38]], [0.07, [0, -30, 38]], [0.26, [-1, -80, -4]], [0.32, [-1, -80, -4]], [0.46, [0, -36, 60]], [0.54, [0, -36, 60]], [0.84, [0, -36, 50]], [0.93, [0, -36, 40]]]);
      keyH.visible = p > 0.3;
      setLock(p < 0.26 ? off : 0, ease(span(p, 0.56, 0.66)));
      setCam(pos, look);
      setRoom(span(p, 0.3, 0.46), span(p, 0.56, 0.82), ease(span(p, 0.32, 0.9)) * 0.35, ease(span(p, 0.84, 0.93)));
      scene.fog.far = lerp(3.2, 14, Math.max(1 - span(p, 0.07, 0.26), span(p, 0.3, 0.46)));
    };
  }

  return {
    render(p) { render(p); renderer.render(scene, camera); },
    resize(w, h) {
      W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.fov = (v === 'section' ? 34 : 62) * (w < h ? 1.12 : 0.85); camera.updateProjectionMatrix();
      const dpr = renderer.getPixelRatio(); lineMats.forEach((m) => m.resolution.set(w * dpr, h * dpr));
    },
    dispose() { disposeScene(scene, renderer); mount.replaceChildren(); },
  };
}

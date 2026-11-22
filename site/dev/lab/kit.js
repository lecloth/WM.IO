// A "kit" is a real, human-made 3D model split into named parts, described by a manifest.json beside its files:
// { "title", "credit", "rotate": [x, y, z] (degrees), "parts": [ { "file", "name", "sub", "mat", "explode": [x, y, z],
//   "order", "hidden" } ] }. Part files are STL (binary) or GLB. Positions stay as authored (the assembled object);
// "explode" is where the part waits before it comes together, in the model's own units.
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const cache = new Map();
export function loadKit(base) {
  if (!cache.has(base)) cache.set(base, (async () => {
    const man = await (await fetch(base + 'manifest.json')).json();
    const stl = new STLLoader(), gltf = new GLTFLoader();
    const parts = await Promise.all(man.parts.filter((p) => !p.hidden).map(async (p) => {
      let geo;
      if (p.file.endsWith('.stl')) {
        geo = stl.parse(await (await fetch(base + p.file)).arrayBuffer());
        geo.deleteAttribute('normal');
        geo = mergeVertices(geo, 1e-4);
        geo = toCreasedNormals(geo, THREE.MathUtils.degToRad(32));
      } else {
        const g = await gltf.loadAsync(base + p.file); const geos = [];
        g.scene.updateMatrixWorld(true);
        g.scene.traverse((o) => { if (o.isMesh) { const c = o.geometry.clone(); c.applyMatrix4(o.matrixWorld); geos.push(c); } });
        geo = geos[0];
      }
      geo.computeBoundingBox();
      return { ...p, geo };
    }));
    // orient and centre the assembled object; scale so its largest side is 2 world units
    const rot = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...(man.rotate || [0, 0, 0]).map(THREE.MathUtils.degToRad)));
    const box = new THREE.Box3();
    parts.forEach((p) => { p.geo.applyMatrix4(rot); p.geo.computeBoundingBox(); box.union(p.geo.boundingBox); });
    const c = box.getCenter(new THREE.Vector3()), s = 2 / Math.max(...box.getSize(new THREE.Vector3()).toArray());
    parts.forEach((p) => {
      p.geo.translate(-c.x, -c.y, -c.z); p.geo.scale(s, s, s); p.geo.computeBoundingBox(); p.geo.computeBoundingSphere();
      p.center = p.geo.boundingBox.getCenter(new THREE.Vector3());
      p.explodeV = new THREE.Vector3(...(p.explode || [0, 0, 0])).applyMatrix4(rot).multiplyScalar(s);
    });
    parts.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    // model (mm) -> world: rotate, centre, scale. Directions use rot and s only.
    const xf = new THREE.Matrix4().makeScale(s, s, s).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z)).multiply(rot);
    const toWorld = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(xf);
    const dirWorld = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(rot).normalize();
    return { ...man, parts, scale: s, xf, toWorld, dirWorld, size: box.getSize(new THREE.Vector3()).multiplyScalar(s) };
  })());
  return cache.get(base);
}

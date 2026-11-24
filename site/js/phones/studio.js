// The studio light (Poly Haven "Studio Small 09", CC0): the same for phone A's reflections, the real phones and the
// hallway's frames and glass. Its own small module, so the hallway can light itself at page load without pulling in
// the real phones' loaders (those load only when the dive begins: realphones.js).
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

/** the studio light as a PMREM environment for one renderer (retries a refused request on the plain local server) */
const envs = new WeakMap();
export function studio(renderer, base = '') {
  if (envs.has(renderer)) return envs.get(renderer);
  const url = `${base}media/hdri/studio_small_09_1k.hdr`;
  const p = new Promise((res) => {
    const go = (n) => new HDRLoader().load(n ? `${url}?r=${n}` : url, (t) => {
      const g = new THREE.PMREMGenerator(renderer); t.mapping = THREE.EquirectangularReflectionMapping;
      const env = g.fromEquirectangular(t).texture; g.dispose(); t.dispose(); res(env);
    }, undefined, () => (n < 4 ? setTimeout(() => go(n + 1), 200 * (n + 1)) : res(null)));
    go(0);
  });
  envs.set(renderer, p); return p;
}

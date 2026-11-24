// Web copies of the two real phone models (Part 5 "Round 4 picks"): iPhone 18 Pro Max and Galaxy S26 Ultra.
// Licences UNVERIFIED: local only. Sources stay in tools/sources/phones/ (git-ignored); the copies go to
// site/media/phones-unverified/ (git-ignored too), so neither ever enters git history.
//   node tools/phones_web.mjs            -> <key>.glb for both phones (logo removed, screen texture removed)
//   node tools/phones_web.mjs --inspect  -> <key>-inspect.glb (nothing removed; for finding the logo by eye)
// What it does: removes the maker's logo from the back (nothing that implies a partnership): the logo node goes, or,
// where the back has the logo cut into it, the logo is flattened into the back's own surface and material; drops the
// display's own picture (our app goes on the screen at run time), resizes every texture to at most 1024 px and
// re-encodes it as WebP (phone-sized), welds, dedups, prunes, then meshopt-compresses (EXT_meshopt_compression,
// decoded by the vendored three/addons/libs/meshopt_decoder.module.js).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, textureCompress, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'site/media/phones-unverified');
// logo: the node to remove. screen: the display mesh (its picture is dropped; phones.js puts our app on it).
// S26: its nodes are unnamed (Geometry.###). The logo was found by inspection (each candidate rendered in red on the
// back, site/media/phones-unverified/inspect.html, local only): node "Geometry", a flat 120 x 18 (model units)
// wordmark on the lower back.
export const PHONES = [
  // iPhone: its back panel has the logo cut out of it (removing the logo node leaves an apple-shaped hole), so the logo
  // mesh stays, flush, in the back panel's own material, made opaque (the file's panel is 80% see-through).
  { key: 'iphone18', src: 'tools/sources/phones/iphone18/model.glb', logo: ['Back_Logo'], fill: 'COLOUR_Silver_Backpanel', fillPanel: 'Back_Panel', screen: 'Front_Screen' },
  { key: 's26', src: 'tools/sources/phones/s26/model.glb', logo: ['Geometry'], screen: 'Geometry.004' },
];

const inspect = process.argv.includes('--inspect');
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
fs.mkdirSync(OUT, { recursive: true });

for (const p of PHONES) {
  const doc = await io.read(path.join(root, p.src));
  const nodes = doc.getRoot().listNodes();
  if (!inspect) {
    for (const name of p.logo) {
      const n = nodes.find((x) => x.getName() === name);
      if (!n) throw new Error(`${p.key}: logo node ${name} not found`);
      if (p.fill) {
        const m = doc.getRoot().listMaterials().find((x) => x.getName() === p.fill);
        if (!m) throw new Error(`${p.key}: material ${p.fill} not found`);
        m.setAlphaMode('OPAQUE'); const c = m.getBaseColorFactor(); m.setBaseColorFactor([c[0], c[1], c[2], 1]);
        n.getMesh().listPrimitives().forEach((prim) => {
          prim.setMaterial(m);
          // its own vertex colours tint it (the panel has none): drop them, so it shades exactly as the panel
          prim.listSemantics().filter((k) => k.startsWith('COLOR_')).forEach((k) => prim.setAttribute(k, null));
          // flatten it onto the back's outer surface (the back faces -z): every point on that plane, every normal
          // straight out, so its 0.3 mm walls vanish and nothing of its outline catches light
          // (lifted 0.05 mm and grown 6% about its centre, so it also covers the hole's rim: no seam)
          const pos = prim.getAttribute('POSITION'), nor = prim.getAttribute('NORMAL'), v = [0, 0, 0];
          let z0 = Infinity, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
          for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, v); z0 = Math.min(z0, v[2]); x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
          const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
          for (let i = 0; i < pos.getCount(); i++) { pos.getElement(i, v); pos.setElement(i, [cx + (v[0] - cx) * 1.06, cy + (v[1] - cy) * 1.06, z0 - 0.00005]); }
          if (nor) for (let i = 0; i < nor.getCount(); i++) nor.setElement(i, [0, 0, -1]);
          // the back panel's own normals around the hole are bent by its walls: straighten them on its outer face
          const panel = nodes.find((x) => x.getName() === p.fillPanel)?.getMesh();
          panel?.listPrimitives().forEach((pp) => {
            const P = pp.getAttribute('POSITION'), N = pp.getAttribute('NORMAL'), w = [0, 0, 0]; if (!N) return;
            let pz = Infinity; for (let i = 0; i < P.getCount(); i++) pz = Math.min(pz, P.getElement(i, w)[2]);
            const m = 1;   // the whole outer face
            for (let i = 0; i < P.getCount(); i++) {
              P.getElement(i, w);
              if (w[2] < pz + 0.00005 && w[0] > x0 - m && w[0] < x1 + m && w[1] > y0 - m && w[1] < y1 + m) N.setElement(i, [0, 0, -1]);
            }
          });
        });
        n.setName('BACK_PLAIN');
        console.log(`${p.key}: logo node "${name}" filled with the back panel's material`);
      } else {
        const mesh = n.getMesh(); n.dispose(); mesh?.dispose();
        console.log(`${p.key}: removed logo node "${name}"`);
      }
    }
    const scr = nodes.find((x) => x.getName() === p.screen);
    if (!scr) throw new Error(`${p.key}: screen node ${p.screen} not found`);
    scr.getMesh().listPrimitives().forEach((prim) => { const m = prim.getMaterial(); if (m) { m.setEmissiveTexture(null); m.setBaseColorTexture(null); m.setName('SCREEN'); } });
    scr.setName('SCREEN');
  }
  await doc.transform(
    weld(), dedup(), prune({ keepAttributes: true }),   // keep the screens' UVs (their own picture is gone; ours goes on)
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  const out = path.join(OUT, `${p.key}${inspect ? '-inspect' : ''}.glb`);
  await io.write(out, doc);
  const tex = doc.getRoot().listTextures().map((t) => `${t.getSize()?.join('x')}`).join(' ');
  console.log(`${p.key}: ${fs.statSync(path.join(root, p.src)).size} -> ${fs.statSync(out).size} bytes; textures ${tex}`);
}

// Bundle site/js (our code) + vendored three into site/dist: a few files instead of ~60 module requests, so the plain
// `python -m http.server` (which refuses connections under bursts) loads the site reliably.
import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '../site');
const alias = {
  name: 'vendor-three',
  setup(b) {
    b.onResolve({ filter: /^three(\/addons\/.*)?$/ }, (a) => ({
      path: a.path === 'three' ? path.join(site, 'vendor/three/three.module.min.js') : path.join(site, 'vendor/three/addons', a.path.slice('three/addons/'.length)),
    }));
  },
};
await esbuild.build({
  // the site, and (round 5) the asset sheet and the CTA demo, so a phone's cache never serves a stale module:
  // chunks are content-hashed, and tools/build.py stamps each entry's URL with its hash
  entryPoints: [path.join(site, 'js/main.js'), path.join(site, 'dev/assets.js'), path.join(site, 'dev/cta-demo.js')], bundle: true, splitting: true, format: 'esm',
  outdir: path.join(site, 'dist'), target: 'es2022', minify: !process.env.WM_NOMINIFY, sourcemap: false,   // WM_NOMINIFY=1: readable names for a CPU profile (tools/arrivalrec.py --profile)
  plugins: [alias],
  chunkNames: 'chunk-[name]-[hash]', entryNames: '[name]', logLevel: 'warning', legalComments: 'none',
});

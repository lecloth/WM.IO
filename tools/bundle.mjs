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
  entryPoints: [path.join(site, 'js/main.js')], bundle: true, splitting: true, format: 'esm',
  outdir: path.join(site, 'dist'), target: 'es2022', minify: true, sourcemap: false, plugins: [alias],
  chunkNames: 'chunk-[name]-[hash]', logLevel: 'warning', legalComments: 'none',
});

// sheet 03: Disciplines, part 1 (builder D1): websites, apps and phones, platforms and web apps, engineering and
// infrastructure. Each discipline starts from its ancestor machine: a public-domain patent plate that redraws itself
// line by line into what the studio builds today. D2's sheet-03b (security, AI) follows; sheet-03c (consulting, care)
// comes after it. See tools/notes/sheet-03.md.
import { wireScene } from '../sheet03/wire.js';

export function init(engine) {
  wireScene(engine, { id: 'sheet-03', key: 'websites', kind: 'plate', entry: 'measure', from: 1863,
    load: () => import('../sheet03/plates/bullock-us38200.js'), fig: 'media/plates/bullock-us38200-fig.webp' });
  wireScene(engine, { id: 'sheet-03-apps', key: 'apps', kind: 'bell', entry: 'chest', from: 1877,
    load: () => import('../sheet01/bell-fig1.js'), fig: 'media/plates/bell-us186787-fig1.webp' });
  wireScene(engine, { id: 'sheet-03-platforms', key: 'platforms', kind: 'plate', entry: 'chest', from: 1882,
    load: () => import('../sheet03/plates/firman-us252576.js'), fig: 'media/plates/firman-us252576-fig.webp' });
  wireScene(engine, { id: 'sheet-03-infra', key: 'infra', kind: 'plate', entry: 'chest', from: 1883,
    load: () => import('../sheet03/plates/edison-us274290.js'), fig: 'media/plates/edison-us274290-fig.webp' });
}

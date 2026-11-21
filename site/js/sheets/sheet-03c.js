// sheet 03c: Disciplines, part 3 (builder D1): consulting (the surveyor's theodolite) and monthly care (no ancestor:
// the drawing set's revisions table). Comes after D2's sheet-03b (security, AI). See tools/notes/sheet-03.md.
import { wireScene } from '../sheet03/wire.js';

export function init(engine) {
  wireScene(engine, { id: 'sheet-03-consulting', key: 'consulting', kind: 'plate', entry: 'chest', from: 1883,
    load: () => import('../sheet03/plates/holmes-us275913.js'), fig: 'media/plates/holmes-us275913-fig.webp' });
  wireScene(engine, { id: 'sheet-03-care', key: 'care', kind: 'care', entry: 'chest' });
}

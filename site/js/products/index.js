// The concept products: made-up products that show the range of what the studio can build. Never clients.
// Always labelled "Concept sheet" wherever they appear.
//
// Each product: { id, name, kind, desc, industry, form: 'phone' | 'web', accent, w, h, theme, draw(canvas, { accent }) }
//   - w x h: the logical px of the screen design (phones 390 x 844, web 1440 x 900).
//   - draw() fills the whole canvas at any resolution (canvas.width / w is the scale); pass a canvas whose aspect is w:h.
//   - black, white and greys by default; the product's own accent colour only when { accent: true } (hover).
//   - fonts: "Newsreader" and "DM Mono" only; call ensureFonts() before the first draw.
//   - phones also carry `flow` (the user flow drawn on the hero phone's 03 FLOW layer).
//   - desc: lower-case phrase for running text ("a drone-delivery dispatcher").
import { LOFTHAUL } from './lofthaul.js';
import { QUAYCALL } from './quaycall.js';
import { STRINGWALK } from './stringwalk.js';
import { OVERWING } from './overwing.js';
import { NIGHTWELL } from './nightwell.js';
import { HALVANE } from './halvane.js';
import { WARDCAST } from './wardcast.js';
import { QUILLFIELD } from './quillfield.js';
import { FERNPAY } from './fernpay.js';

export const PRODUCTS = [LOFTHAUL, QUAYCALL, STRINGWALK, OVERWING, NIGHTWELL, HALVANE, WARDCAST, QUILLFIELD, FERNPAY];
export const PHONES = PRODUCTS.filter((p) => p.form === 'phone');
export const WEBS = PRODUCTS.filter((p) => p.form === 'web');

export const byId = (id) => PRODUCTS.find((p) => p.id === id) || null;

/** the line used under a concept product: "LOFTHAUL, a drone-delivery dispatcher." */
export const tagLine = (p) => `${p.name}, ${p.desc}.`;

/** make a canvas for a product at a given scale (default: device pixels for its logical size) and draw it */
export function render(p, { scale = Math.min(devicePixelRatio || 1, 2), accent = false, canvas = document.createElement('canvas') } = {}) {
  canvas.width = Math.round(p.w * scale); canvas.height = Math.round(p.h * scale);
  p.draw(canvas, { accent });
  return canvas;
}

/** resolve once the two site families are ready for canvas drawing */
export function ensureFonts() {
  if (!document.fonts) return Promise.resolve();
  return Promise.all(['400 12px "DM Mono"', '500 12px "DM Mono"', '400 12px Newsreader', '600 12px Newsreader', 'italic 400 12px Newsreader']
    .map((f) => document.fonts.load(f))).catch(() => {}).then(() => document.fonts.ready);
}

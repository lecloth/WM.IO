// WM.IO's mark (Part 5 "The name, the top bar and the title block"): a smooth W and a smooth M joined by one sharp
// vertical reset, then a dot, then I and O. Units: each half-wave 25 wide and 65 high; W = four half-waves starting at
// the top, M = four starting at the bottom, the reset a straight vertical line between them (x 100); the dot 9 across on
// the baseline; the I and the O (Part 5 "The name's size: option B") 0.85 of the wave's height (IOH 55.25), standing on
// its baseline: the I a stroke, the O an ellipse 47.6 x 55.25. y down, 0 = the wave's top line, 65 = the baseline. At the
// option B size (the wave 4.5 cells wide) ".IO" is 1.24 cells tall.
// tools/brand.py writes the same mark as SVG files (site/media/brand/); keep the numbers in step.
export const MARK = { HW: 25, A: 65, SW: 5.5, DOT_R: 4.5, X_DOT: 217.5, X_I: 235, IOH: 55.25, X_O: 271.55, OW: 47.6, W: 295.35, PAD: 5.5 };
export const MARK_VIEW = { x: -MARK.PAD, y: -MARK.PAD, w: MARK.W + 2 * MARK.PAD, h: MARK.A + 2 * MARK.PAD };
export const MARK_LABEL = 'WM.IO, a design and engineering studio';

const K = 0.364212 * MARK.HW;   // the cubic that fits half a cosine over one half-wave
/** the wave's path (W, the reset, M) in mark units */
export function wavePath() {
  const { HW, A } = MARK; let d = 'M0 0', y = 0;
  for (let i = 0; i < 4; i++) { const x0 = i * HW, x1 = x0 + HW, y1 = A - y; d += `C${x0 + K} ${y} ${x1 - K} ${y1} ${x1} ${y1}`; y = y1; }
  d += `L${4 * HW} ${A}`; y = A;
  for (let i = 4; i < 8; i++) { const x0 = i * HW, x1 = x0 + HW, y1 = A - y; d += `C${x0 + K} ${y} ${x1 - K} ${y1} ${x1} ${y1}`; y = y1; }
  return d;
}
/** the whole small mark as SVG markup (stroke and fill: currentColor) */
export function markSVG(cls = '') {
  const { A, SW, DOT_R, X_DOT, X_I, X_O, OW, IOH } = MARK, v = MARK_VIEW;
  return `<svg class="${cls}" viewBox="${v.x} ${v.y} ${v.w} ${v.h}" aria-hidden="true" focusable="false">`
    + `<path d="${wavePath()}" fill="none" stroke="currentColor" stroke-width="${SW}" stroke-linejoin="miter" stroke-miterlimit="10"/>`
    + `<circle cx="${X_DOT}" cy="${A - DOT_R}" r="${DOT_R}" fill="currentColor"/>`
    + `<path d="M${X_I} ${A - IOH}V${A}" stroke="currentColor" stroke-width="${SW}"/>`
    + `<ellipse cx="${X_O}" cy="${A - IOH / 2}" rx="${OW / 2}" ry="${IOH / 2}" fill="none" stroke="currentColor" stroke-width="${SW}"/></svg>`;
}
/** the wave sampled for morphing: x from 0 to 200 (the reset's points all at x 100), y on the wave; then the stretch
 *  to the mark's right end (x 200 -> 295.35) that a straight line also covers (it folds into the M's end as the dot, I and O
 *  appear). Each point: [x, yWave] in mark units. */
export function wavePoints(perHalf = 14, resetN = 8, tailN = 8) {
  const { HW, A, W } = MARK, out = [];
  const half = (i, top) => { for (let k = i ? 1 : 0; k <= perHalf; k++) { const t = k / perHalf, x = (i + t) * HW, c = (1 - Math.cos(Math.PI * t)) / 2; out.push([x, top ? A * c : A * (1 - c)]); } };
  for (let i = 0; i < 4; i++) half(i, i % 2 === 0);            // W: top -> bottom -> top -> bottom -> top
  for (let k = 1; k <= resetN; k++) out.push([4 * HW, A * k / resetN]);   // the reset, straight down
  for (let i = 4; i < 8; i++) half(i, i % 2 === 1);            // M: bottom -> top -> ...
  const end = out.length;
  for (let k = 1; k <= tailN; k++) out.push([8 * HW + (W - 8 * HW) * k / tailN, A]);
  return { pts: out, end };
}
/** the arc length of the wave in mark units (W, reset, M) */
export const WAVE_LEN = (() => { const { pts, end } = wavePoints(60, 2, 0); let s = 0; for (let i = 1; i < end; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; })();

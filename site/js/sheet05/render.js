// Sheet 05 helpers: draw one REGION of a concept product at any scale (crisp vector redraw, not an upscaled bitmap),
// and turn a black-and-white canvas into its cyanotype negative.
//
// The products draw the whole screen onto a canvas whose width / w is the scale (see products/index.js). To draw only
// a region we hand draw() a stand-in canvas with the full-size width and height, whose context is the real (small)
// canvas's context with every transform shifted by the region's origin. Everything outside the region is clipped by
// the canvas edge for free.

/** draw logical region r = { x, y, w, h } of product p at scale s (device px per logical px) into canvas cv */
export function drawRegion(p, r, s, { accent = false, canvas } = {}) {
  const cv = canvas || document.createElement('canvas');
  cv.width = Math.max(1, Math.round(r.w * s));
  cv.height = Math.max(1, Math.round(r.h * s));
  const ctx = cv.getContext('2d');
  const ox = r.x * s, oy = r.y * s;
  const set = CanvasRenderingContext2D.prototype.setTransform;
  ctx.setTransform = function shifted(a, b, c, d, e, f) {
    if (typeof a === 'object' && a) return set.call(this, a.a, a.b, a.c, a.d, a.e - ox, a.f - oy);
    return set.call(this, a, b, c, d, e - ox, f - oy);
  };
  set.call(ctx, 1, 0, 0, 1, -ox, -oy);           // products that only call scale() (LOFTHAUL) get the shift too
  const stand = { width: p.w * s, height: p.h * s, getContext: () => ctx };
  try { p.draw(stand, { accent }); } finally { delete ctx.setTransform; set.call(ctx, 1, 0, 0, 1, 0, 0); }
  return cv;
}

const rgb = (hex) => { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

/**
 * the cyanotype negative of a black-and-white canvas: out = prus + (1 - grey) * (white - prus), so paper goes to
 * Prussian blue, ink to blueprint white, and every grey in between along that one line (no stray tints)
 */
export function negative(src, dst, prus, white) {
  dst.width = src.width; dst.height = src.height;
  const c = dst.getContext('2d');
  const [pr, pg, pb] = rgb(prus), [wr, wg, wb] = rgb(white);
  const W = dst.width, H = dst.height;
  c.globalCompositeOperation = 'source-over';
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = 'difference'; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);                 // 1 - grey
  c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgb(${wr - pr},${wg - pg},${wb - pb})`; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgb(${pr},${pg},${pb})`; c.fillRect(0, 0, W, H);  // + prus
  c.globalCompositeOperation = 'source-over';
  return dst;
}

/** run jobs one per idle slot so the first paint of the scene never waits on nine products */
export function idleQueue() {
  const q = [];
  let busy = false;
  const ric = window.requestIdleCallback || ((fn) => setTimeout(() => fn({ timeRemaining: () => 8 }), 16));
  function pump() {
    busy = true;
    ric((dl) => {
      do { const job = q.shift(); if (job) job(); } while (q.length && dl.timeRemaining() > 6);
      if (q.length) pump(); else busy = false;
    }, { timeout: 400 });
  }
  return {
    push(job, front = false) { if (front) q.unshift(job); else q.push(job); if (!busy) pump(); },
    clear() { q.length = 0; },
  };
}

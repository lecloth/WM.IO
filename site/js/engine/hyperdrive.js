// "Cut to the chase" (Part 5 "Round 8"): the jump to the final room as a hyperdrive. Our own visual, hairlines only,
// ink on paper, no glow:
//   a) pages flash past: hairline page outlines rush out from the centre while the paper takes over the screen; once
//      it is opaque the page jumps underneath (jump(), once);
//   b) the page grid wraps into a tunnel: the flat grid is read as the inside of a tube seen down its axis (every
//      crossing point placed at the depth that projects onto its own flat position, so the first frame IS the flat
//      grid), and the camera moves in: the lines bend and fly outwards;
//   c) the grid's crossing points stream past like stars: hairline streaks, longer the faster and nearer they are;
//   d) the camera slows, the streaks shrink to small hairline crosses, the crosses align on the flat grid's crossing
//      points, the grid's lines draw between them, and the overlay fades over the final room, whose grid is the same
//      pixel for pixel (so the hand-over shows no jump).
// No words in the drawing (TYPE_RULES rule 1); the shortcut's jump carries our words over it, "Cutting to the chase."
// (Part 5 "The name, the top bar and the title block"), on a paper backing. Reduced motion: a plain jump.
// playHyperdrive({ jump, reduced, engine }) plays it full screen; drawHyperdrive(ctx, w, h, t, opts) draws one frame
// (the asset sheet's Play control uses it at phone size).

export const HYPER_MS = 1800;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (t, a, b) => clamp((t - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// the beats (share of the run)
const T = {
  cover: [0, 0.16],      // the paper takes over
  jump: 0.2,             // the page jumps under it
  pages: [0, 0.24],      // page outlines flash past
  move: [0.18, 0.88],    // the camera's travel (speed: up, hold, down)
  linesOut: [0.34, 0.5], // the tunnel's lines go, the stars stay
  stars: [0.24, 0.36],   // the stars come in
  align: [0.64, 0.86],   // the stars align on the flat grid's crossings
  draw: [0.8, 0.92],     // the grid's lines draw between them
  marks: [0.84, 0.92],   // the crosses go (the lines' crossings take their place)
  fade: [0.92, 1],       // (playHyperdrive) the overlay fades over the final room
};
const Z_MIN = 0.32, Z_LEN = 16, TRAVEL = 36, MAX_STARS = 1400, BUCKETS = 5;

// the camera's travel at t: the integral of the speed (rises smoothly, holds, falls smoothly to zero), normalised so
// the whole run travels TRAVEL depth units
const PROFILE = { r: 0.28, f: 0.36, n: 64 };
function vAt(x) { const { r, f } = PROFILE; return x < r ? sm(x / r) : x > 1 - f ? 1 - sm((x - (1 - f)) / f) : 1; }
const V_TOTAL = (() => { let s = 0; for (let i = 0; i < PROFILE.n; i++) s += vAt((i + 0.5) / PROFILE.n); return s; })();
function travelAt(t) {
  const u = span(t, ...T.move), n = PROFILE.n; let s = 0;
  for (let i = 0; i < n; i++) { const part = clamp(u * n - i); if (part <= 0) break; s += vAt((i + 0.5) / n) * part; }
  return TRAVEL * s / V_TOTAL;
}
function speedAt(t) { return t <= T.move[0] || t >= T.move[1] ? 0 : vAt(span(t, ...T.move)); }
function sm(x) { x = clamp(x); return x * x * (3 - 2 * x); }

// ---------- the scene for a size: the grid's crossings (homes), the stars, the tunnel's major lines ----------
let cache = null;
function build(w, h, u) {
  const key = `${w}|${h}|${u.toFixed(4)}`;
  if (cache && cache.key === key) return cache;
  const cx = w / 2, cy = h / 2, rmax = Math.hypot(cx, cy), f = rmax;   // corners at depth 1
  const nx = Math.floor(w / u + 1e-6), ny = Math.floor(h / u + 1e-6);
  // every crossing point of the grid (columns 0..nx, rows 0..ny); stars: all of them on phones, a fixed subset above
  // MAX_STARS (the major crossings always, the rest by a seeded pick)
  const all = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) all.push([i, j]);
  let pick = all;
  if (all.length > MAX_STARS) {
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const major = all.filter(([i, j]) => i % 5 === 0 && j % 5 === 0), minor = all.filter(([i, j]) => !(i % 5 === 0 && j % 5 === 0));
    const keep = (MAX_STARS - major.length) / minor.length;
    pick = major.concat(minor.filter(() => rnd() < keep));
  }
  const n = pick.length, hx = new Float32Array(n), hy = new Float32Array(n), th = new Float32Array(n), zh = new Float32Array(n), ph = new Float32Array(n);
  { let seed = 11; for (let k = 0; k < n; k++) { seed = (seed * 16807) % 2147483647; ph[k] = seed / 2147483647; } }   // each star's place along the tube
  const ox = Math.round, px = (i) => ox(i * u);
  pick.forEach(([i, j], k) => {
    const x = px(i), y = px(j); hx[k] = x; hy[k] = y;
    const dx = x - cx, dy = y - cy, r = Math.max(rmax * 0.004, Math.hypot(dx, dy));
    th[k] = Math.atan2(dy, dx); zh[k] = f / r;
  });
  // the tunnel's lines: the major grid lines, each as a polyline of its cells' crossings (homes on whole device px)
  const lines = [];
  const vert = (i) => { const pts = []; for (let j = 0; j <= ny; j++) pts.push([px(i), px(j)]); return pts; };
  const hori = (j) => { const pts = []; for (let i = 0; i <= nx; i++) pts.push([px(i), px(j)]); return pts; };
  for (let i = 0; i <= nx; i += 5) lines.push(vert(i));
  for (let j = 0; j <= ny; j += 5) lines.push(hori(j));
  // each vertex: its angle and home depth (flattened)
  const lv = lines.map((pts) => {
    const a = new Float32Array(pts.length * 2);
    pts.forEach(([x, y], k) => { const dx = x - cx, dy = y - cy, r = Math.max(rmax * 0.025, Math.hypot(dx, dy)); a[k * 2] = Math.atan2(dy, dx); a[k * 2 + 1] = f / r; });
    return a;
  });
  const bucket = new Uint8Array(n);
  cache = { key, w, h, u, cx, cy, f, nx, ny, n, hx, hy, th, zh, ph, lv, bucket, sx: new Float32Array(n), sy: new Float32Array(n), ex: new Float32Array(n), ey: new Float32Array(n) };
  return cache;
}

/** one frame at t (0..1) into ctx (w x h device px). opts: { u: the cell in device px, px1: a hairline in device px,
 *  dpr: device px per CSS px (for the browser's 1/64 px tile rounding), paper: css colour, inkRgb: 'r,g,b', dark } */
export function drawHyperdrive(ctx, w, h, t, opts = {}) {
  const u = opts.u || w / 20, px1 = Math.max(1, Math.round(opts.px1 || 1)), paper = opts.paper || '#F6F7F9', ink = (opts.inkRgb || '18,18,18').replace(/\s+/g, '');
  const dark = !!opts.dark, aMinor = dark ? 0.055 : 0.05, aMajor = 0.1;
  const S = build(w, h, u), { cx, cy, f } = S;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, w, h);
  // a) the paper takes over (the frame shows the page under it until then)
  const cover = ease(span(t, ...T.cover));
  ctx.globalAlpha = cover; ctx.fillStyle = paper; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
  const D = travelAt(t), v = speedAt(t), al = ease(span(t, ...T.align)), drawn = ease(span(t, ...T.draw));
  const twist = 0.22 * ease(span(t, T.move[0], 0.7)) * (1 - al);
  const half = px1 / 2;

  // the flat grid (exactly the site's CSS grid: minor lines every cell, major every five, each px1 thick at the cell's
  // top / left edge, painted in the CSS layer order): fully there at the start (under the cover), then gone while the
  // tunnel runs, then drawn on from the centre in d)
  const flatA = t < T.move[0] ? cover : 0;
  if (flatA > 0.001 || drawn > 0) {
    const k = flatA > 0.001 ? 1 : drawn;   // how much of each line (from the centre out)
    const a = flatA > 0.001 ? flatA : 1;
    const x0 = Math.round(cx - (cx + 2) * k), x1 = Math.round(cx + (w - cx + 2) * k), y0 = Math.round(cy - (cy + 2) * k), y1 = Math.round(cy + (h - cy + 2) * k);
    // the tiles as the browser lays them out: CSS sizes in 1/64 px (LayoutUnit, rounded down), so a 19.2 px cell is a
    // 19.1875 px tile and its lines drift by fractions of a pixel exactly as the page's own grid does
    const dpr = opts.dpr || 1, tile = (cells) => Math.floor(cells * (u / dpr) * 64 + 1e-6) / 64 * dpr;
    const pass = (alpha, step, vertical) => {
      const k = tile(step);
      ctx.fillStyle = `rgba(${ink},${alpha * a})`;
      ctx.beginPath();
      if (vertical) for (let x = 0; x < w; x += k) ctx.rect(x, Math.max(0, y0), px1, Math.min(h, y1) - Math.max(0, y0));
      else for (let y = 0; y < h; y += k) ctx.rect(Math.max(0, x0), y, Math.min(w, x1) - Math.max(0, x0), px1);
      ctx.fill();
    };
    // bottom to top: minor vertical, minor horizontal, major vertical, major horizontal (CSS lists the major first = on top)
    pass(aMinor, 1, true); pass(aMinor, 1, false); pass(aMajor, 5, true); pass(aMajor, 5, false);
  }

  // b) the tunnel: the major lines seen as the inside of a tube, the camera moving in; gone by T.linesOut[1]
  const linesA = t >= T.move[0] ? aMajor * 2.2 * (1 - ease(span(t, ...T.linesOut))) : 0;
  if (linesA > 0.003) {
    ctx.strokeStyle = `rgba(${ink},${Math.min(0.5, linesA)})`; ctx.lineWidth = px1;
    ctx.beginPath();
    for (const a of S.lv) {
      let pen = false;
      for (let k = 0; k < a.length; k += 2) {
        const z = a[k + 1] - D;
        if (z <= Z_MIN) { pen = false; continue; }
        const th = a[k] + twist * (1 / z), r = f / z;
        const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
        if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; }
      }
    }
    ctx.stroke();
  }

  // c) and d) the stars: each crossing point on the tube (on its own crossing's ray, at its own place along the tube),
  // recycled to the far end once it passes the camera; a streak
  // from where it is to where it was (longer the faster); aligning, it slides to its own crossing of the flat grid and
  // becomes a small hairline cross; the crosses go as the lines draw on
  const starsA = ease(span(t, ...T.stars)) * (1 - ease(span(t, ...T.marks)));
  if (starsA > 0.003) {
    const n = S.n, { hx, hy, th, zh, ph, sx, sy, ex, ey, bucket } = S;
    const streak = 0.9 * v * (1 - al), arm = Math.max(px1, Math.round(0.12 * u * al));
    // aligning: each star slides along its own ray (its angle is its home's) to the depth that projects onto its own
    // crossing, so the stars settle radially into the flat grid; the last few percent close in screen space exactly
    const snap = span(al, 0.92, 1);
    for (let k = 0; k < n; k++) {
      // in flight: spread evenly along the tube (each star its own place), flying towards the camera and round again
      const q = ph[k] - D / Z_LEN;
      let z = Z_MIN + Z_LEN * (q - Math.floor(q));
      const far = z / (Z_MIN + Z_LEN);
      if (al > 0) z = 1 / (1 / z + (1 / zh[k] - 1 / z) * al);   // (in 1 / depth, so the move is even on screen)
      const r = f / z, a = th[k] + twist / z;
      let x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      const z2 = z + streak, r2 = f / z2, a2 = th[k] + twist / z2;
      let x2 = cx + r2 * Math.cos(a2), y2 = cy + r2 * Math.sin(a2);
      if (snap > 0) { x += (hx[k] - x) * snap; y += (hy[k] - y) * snap; x2 += (hx[k] - x2) * snap; y2 += (hy[k] - y2) * snap; }
      sx[k] = x; sy[k] = y; ex[k] = x2; ey[k] = y2;
      // depth -> alpha (near = darker); the far end of the tube fades to nothing (no ring where the tube ends); aligning,
      // every star comes up to full as it settles
      const seen = clamp((1 - far) / 0.55), vis = seen + (1 - seen) * al;
      const near = (clamp(1.6 / z) * (1 - al) + al) * vis;
      bucket[k] = near < 0.05 ? 255 : Math.min(BUCKETS - 1, Math.floor(near * BUCKETS));
    }
    ctx.lineWidth = px1;
    for (let b = 0; b < BUCKETS; b++) {
      const alpha = starsA * 0.62 * (b + 0.5) / BUCKETS;
      ctx.strokeStyle = `rgba(${ink},${alpha.toFixed(3)})`;
      ctx.beginPath();
      for (let k = 0; k < n; k++) {
        if (bucket[k] !== b) continue;
        const x = sx[k], y = sy[k];
        if ((x < -50 && ex[k] < -50) || (x > w + 50 && ex[k] > w + 50) || (y < -50 && ey[k] < -50) || (y > h + 50 && ey[k] > h + 50)) continue;
        if (al < 0.98) { ctx.moveTo(x, y); ctx.lineTo(ex[k] + (ex[k] === x && ey[k] === y ? px1 : 0), ey[k]); }
        if (al > 0.02) {   // the cross, on the crossing's device pixels
          const X = Math.round(x) + half, Y = Math.round(y) + half;
          ctx.moveTo(X - arm, Y); ctx.lineTo(X + arm, Y); ctx.moveTo(X, Y - arm); ctx.lineTo(X, Y + arm);
        }
      }
      ctx.stroke();
    }
  }

  // a) pages flash past: screen-shaped hairline outlines rushing out of the centre and past the edges
  const pagesOn = t < T.pages[1];
  if (pagesOn) {
    ctx.strokeStyle = `rgba(${ink},1)`; ctx.lineWidth = px1;
    for (let i = 0; i < 6; i++) {
      const s0 = T.pages[0] + i * 0.032, p = span(t, s0, s0 + 0.12);
      if (p <= 0 || p >= 1) continue;
      const s = 0.06 * Math.pow(30, easeOut(p)), rw = w * s / 2, rh = h * s / 2;
      ctx.globalAlpha = 0.55 * (1 - p) * (0.4 + 0.6 * cover);
      const x0 = Math.round(cx - rw) + half, y0 = Math.round(cy - rh) + half, x1 = Math.round(cx + rw) + half, y1 = Math.round(cy + rh) + half;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    }
    ctx.globalAlpha = 1;
  }
}

// ---------- full screen ----------
let current = null;
/** jump(): moves the page to the final room (called once, while the overlay covers the page). Resolves when done. */
export function playHyperdrive({ jump = () => {}, reduced = false, engine = null, words = '' } = {}) {
  if (current) return current;
  if (reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) { try { jump(); } catch (e) { console.error('[hyperdrive] jump', e); } return Promise.resolve(); }
  current = new Promise((resolve) => {
    const d = document.documentElement, cs = getComputedStyle(d);
    // the canvas in the screen's own device pixels (capped at 3), so its grid lands on the same pixels as the page's
    const dpr = Math.min(devicePixelRatio || 1, 3), W = Math.round(innerWidth * dpr), H = Math.round(innerHeight * dpr);
    const c = document.createElement('canvas');
    c.width = W; c.height = H; c.setAttribute('aria-hidden', 'true'); c.className = 'hyperdrive';
    c.style.cssText = `position:fixed;left:0;top:0;width:${W / dpr}px;height:${H / dpr}px;z-index:60;pointer-events:none;`;
    document.body.append(c);
    let wEl = null;
    if (words) { wEl = document.createElement('p'); wEl.className = 'hyper__words'; wEl.textContent = words; wEl.setAttribute('role', 'status'); document.body.append(wEl); }
    const ctx = c.getContext('2d', { alpha: true });
    const opts = { u: (window.__grid?.u || innerWidth / 20) * dpr, px1: Math.max(1, Math.round(dpr)), dpr,
      paper: cs.getPropertyValue('--paper').trim() || '#F6F7F9', inkRgb: cs.getPropertyValue('--ink-rgb').trim() || '18, 18, 18', dark: d.dataset.theme === 'dark' };
    const lock = (on) => { if (engine?.lockScroll) engine.lockScroll(on); else document.body.style.overflow = on ? 'hidden' : ''; };
    lock(true);
    let jumped = false, t0 = performance.now();
    const doJump = () => { if (jumped) return; jumped = true; try { jump(); } catch (e) { console.error('[hyperdrive] jump', e); } };
    const step = () => {
      const t = clamp((performance.now() - t0) / HYPER_MS);
      drawHyperdrive(ctx, W, H, Math.min(t, T.fade[0]), opts);
      c.style.opacity = String(1 - ease(span(t, ...T.fade)));
      if (wEl) wEl.style.opacity = String(span(t, 0.06, 0.16) * (1 - span(t, 0.78, 0.9)));
      if (t >= T.jump) doJump();
      if (t < 1) requestAnimationFrame(step);
      else { doJump(); c.remove(); wEl?.remove(); lock(false); current = null; resolve(); }
    };
    requestAnimationFrame(() => { t0 = performance.now(); step(); });
  });
  return current;
}
if (typeof window !== 'undefined') window.__hyper = { playing: () => !!current };

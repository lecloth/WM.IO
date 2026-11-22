// Page 1: Bell's sheet becomes today's phone.
// The traced outlines of every ink mark on the sheet (tools/trace_plate.py, from the very scan on the page) are drawn
// exactly on the scan: filled, they ARE the ink, so the scan can dissolve into them with no visible change. Then the
// fill thins to lines, and the lines slide and bend onto the X-ray phone's own edge loops (phone.loops2D()), so when
// the 3D X-ray fades in it lands exactly on them: no jump, no cut.
// Each outline is given a stretch of one X-ray loop (nearest loop with room left, in normalised positions); inside a
// loop, outlines are laid end to end in the order of their angle around it. Every point travels on a curve (a bend),
// and outlines start in a sweep around the sheet.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SWEEP = 0.32;     // fraction of the morph over which outline starts are spread
const BEND = 0.22;      // how far each path bows sideways, as a share of its length

// the journey runs on the GPU: every segment of every outline is a thin quad whose two ends travel on their bends
const VS = `
attribute vec2 a_sa; attribute vec2 a_da; attribute vec2 a_sb; attribute vec2 a_db; attribute vec2 a_k; attribute float a_d;
uniform vec2 u_res; uniform float u_t; uniform float u_w; uniform float u_dpr;
float ease(float t) { return t < .5 ? 4. * t * t * t : 1. - pow(-2. * t + 2., 3.) / 2.; }
vec2 bez(vec2 s, vec2 e, float k) { vec2 m = (s + e) * .5 + vec2(-(e.y - s.y), e.x - s.x) * ${BEND.toFixed(3)}; float u = 1. - k; return u * u * s + 2. * u * k * m + k * k * e; }
void main() {
  float k = u_t <= 0. ? 0. : ease(clamp((u_t - a_d) / ${(1 - SWEEP).toFixed(3)}, 0., 1.));
  vec2 A = bez(a_sa, a_da, k) * u_dpr, B = bez(a_sb, a_db, k) * u_dpr, d = B - A; float L = length(d);
  vec2 t = L > 1e-4 ? d / L : vec2(1., 0.), n = vec2(-t.y, t.x);
  vec2 P = mix(A, B, a_k.x) + n * a_k.y * u_w * .5 + t * (a_k.x * 2. - 1.) * u_w * .5;   // square ends close the joins
  gl_Position = vec4(P.x / u_res.x * 2. - 1., 1. - P.y / u_res.y * 2., 0., 1.);
}`;
const FS = `precision mediump float; uniform vec4 u_col; void main() { gl_FragColor = u_col; }`;

export class PlateLines {
  constructor(canvas, glCanvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.glc = glCanvas; this.dpr = 1;
    this.gl = glCanvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: false });
    this.ready = false; this.src = null; this.dst = null;
    if (this.gl) this.initGL();
  }
  initGL() {
    const gl = this.gl, sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    this.pr = pr; this.buf = gl.createBuffer();
    this.at = Object.fromEntries(['a_sa', 'a_da', 'a_sb', 'a_db', 'a_k', 'a_d'].map((k) => [k, gl.getAttribLocation(pr, k)]));
    this.un = Object.fromEntries(['u_res', 'u_t', 'u_w', 'u_dpr', 'u_col'].map((k) => [k, gl.getUniformLocation(pr, k)]));
  }
  /** one quad (two triangles) per segment, segments in each outline's travel order, every second point */
  buildGL() {
    const gl = this.gl; if (!gl || !this.dst) return;
    const STRIDE = 2, { src, dst, off, n, C, cdata } = this, segs = [];
    for (let c = 0; c < C; c++) {
      const o = off[c], m = n[c], { j0, cdir } = cdata[c] || { j0: 0, cdir: 1 };
      const idx = (k) => o + ((j0 + cdir * k) % m + m) % m;
      let prev = 0;
      for (let k = STRIDE; ; k += STRIDE) { const kk = Math.min(k, m - 1); segs.push(idx(prev), idx(kk), this.delay[c]); prev = kk; if (kk >= m - 1) break; }
    }
    const S = segs.length / 3, F = 11, v = new Float32Array(S * 6 * F);
    const corners = [[0, -1], [1, -1], [1, 1], [0, -1], [1, 1], [0, 1]];
    for (let q = 0, w = 0; q < S; q++) {
      const a = segs[q * 3], b = segs[q * 3 + 1], d = segs[q * 3 + 2];
      for (const [e, side] of corners) {
        v[w++] = src[a * 2]; v[w++] = src[a * 2 + 1]; v[w++] = dst[a * 2]; v[w++] = dst[a * 2 + 1];
        v[w++] = src[b * 2]; v[w++] = src[b * 2 + 1]; v[w++] = dst[b * 2]; v[w++] = dst[b * 2 + 1];
        v[w++] = e; v[w++] = side; v[w++] = d;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    this.verts = S * 6;
  }
  async load(url) {
    for (let i = 0; i < 5; i++) {
      try { const r = await fetch(url); if (!r.ok) throw new Error(r.status); this.parse(await r.arrayBuffer()); return; }
      catch (e) { if (i === 4) throw e; await new Promise((res) => setTimeout(res, 200 * (i + 1))); }
    }
  }
  parse(buf) {
    const a = new Int16Array(buf), C = a[0];
    this.n = Array.from(a.subarray(1, 1 + C)); this.group = Array.from(a.subarray(1 + C, 1 + 2 * C));
    this.off = []; let o = 0; this.n.forEach((n) => { this.off.push(o); o += n; });
    this.N = o; this.plate = new Float32Array(o * 2);
    const xy = a.subarray(1 + 2 * C);
    for (let i = 0; i < o * 2; i++) this.plate[i] = xy[i] / 2;
    this.C = C; this.ready = true;
  }
  resize(W, H, dpr) {
    this.W = W; this.H = H; this.dpr = dpr;
    this.canvas.width = Math.round(W * dpr); this.canvas.height = Math.round(H * dpr);
    this.glc.width = this.canvas.width; this.glc.height = this.canvas.height;
  }
  /** where the plate image sits on screen (CSS px) and the X-ray loops to land on */
  place(rect, loops) {
    if (!this.ready) return;
    const { C, n, off } = this, k = rect.width / 1600;
    const src = new Float32Array(this.N * 2);
    for (let i = 0; i < this.N; i++) { src[i * 2] = rect.left + this.plate[i * 2] * k; src[i * 2 + 1] = rect.top + this.plate[i * 2 + 1] * k; }
    this.src = src;
    // outlines: length, centroid, signed area
    const info = [];
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (let c = 0; c < C; c++) {
      let L = 0, sx = 0, sy = 0, A = 0; const o = off[c], m = n[c];
      for (let j = 0; j < m; j++) {
        const x = src[(o + j) * 2], y = src[(o + j) * 2 + 1], jn = (j + 1) % m, x2 = src[(o + jn) * 2], y2 = src[(o + jn) * 2 + 1];
        L += Math.hypot(x2 - x, y2 - y); sx += x; sy += y; A += x * y2 - x2 * y;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
      }
      info.push({ c, L, cx: sx / m, cy: sy / m, A });
    }
    // loops: resampled polylines with cumulative length
    const T = loops.map((a) => {
      const m = a.length / 2, cum = new Float32Array(m); let L = 0, sx = 0, sy = 0, A = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < m; i++) {
        if (i) L += Math.hypot(a[i * 2] - a[i * 2 - 2], a[i * 2 + 1] - a[i * 2 - 1]); cum[i] = L;
        sx += a[i * 2]; sy += a[i * 2 + 1];
        const j = (i + 1) % m; A += a[i * 2] * a[j * 2 + 1] - a[j * 2] * a[i * 2 + 1];
        x0 = Math.min(x0, a[i * 2]); x1 = Math.max(x1, a[i * 2]); y0 = Math.min(y0, a[i * 2 + 1]); y1 = Math.max(y1, a[i * 2 + 1]);
      }
      return { a, m, cum, L, cx: sx / m, cy: sy / m, A, list: [], used: 0 };
    }).filter((t) => t.L > 4);
    let tx0 = 1e9, ty0 = 1e9, tx1 = -1e9, ty1 = -1e9;
    T.forEach((t) => { for (let i = 0; i < t.m; i++) { tx0 = Math.min(tx0, t.a[i * 2]); tx1 = Math.max(tx1, t.a[i * 2]); ty0 = Math.min(ty0, t.a[i * 2 + 1]); ty1 = Math.max(ty1, t.a[i * 2 + 1]); } });
    const nsx = (x) => (x - bx0) / (bx1 - bx0 || 1), nsy = (y) => (y - by0) / (by1 - by0 || 1);
    const ntx = (x) => (x - tx0) / (tx1 - tx0 || 1), nty = (y) => (y - ty0) / (ty1 - ty0 || 1);
    const totL = info.reduce((s, q) => s + q.L, 0), totT = T.reduce((s, t) => s + t.L, 0);
    T.forEach((t) => { t.cap = t.L / totT * totL * 1.08; t.ux = ntx(t.cx); t.uy = nty(t.cy); });
    // nearest loop with room left, longest outlines first
    [...info].sort((p, q) => q.L - p.L).forEach((q) => {
      const ux = nsx(q.cx), uy = nsy(q.cy);
      let best = null, bd = 1e9;
      T.forEach((t) => { if (t.used + q.L * 0.5 > t.cap) return; const d = Math.hypot(t.ux - ux, t.uy - uy); if (d < bd) { bd = d; best = t; } });
      if (!best) best = T.reduce((b, t) => (t.cap - t.used > b.cap - b.used ? t : b), T[0]);
      best.used += q.L; best.list.push(q); q.ux = ux; q.uy = uy;
    });
    // lay the outlines end to end along each loop, by angle around it; the start where the first one points
    const dst = new Float32Array(this.N * 2), cdata = new Array(C);
    const at = (t, s) => {   // point at arc length s along loop t
      s = ((s % t.L) + t.L) % t.L; let lo = 0, hi = t.m - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (t.cum[mid] <= s) lo = mid; else hi = mid; }
      const f = (s - t.cum[lo]) / Math.max(1e-6, t.cum[hi] - t.cum[lo]);
      return [t.a[lo * 2] + (t.a[hi * 2] - t.a[lo * 2]) * f, t.a[lo * 2 + 1] + (t.a[hi * 2 + 1] - t.a[lo * 2 + 1]) * f];
    };
    T.forEach((t) => {
      if (!t.list.length) return;
      const ang = (q) => Math.atan2(q.uy - t.uy, q.ux - t.ux);
      t.list.sort((p, q) => ang(p) - ang(q));
      // arc position on the loop nearest to the first outline's direction
      const a0 = ang(t.list[0]); let s0 = 0, bd = 1e9;
      for (let i = 0; i < t.m; i++) { const d = Math.abs(Math.atan2(nty(t.a[i * 2 + 1]) - t.uy, ntx(t.a[i * 2]) - t.ux) - a0); if (d < bd) { bd = d; s0 = t.cum[i]; } }
      const sum = t.list.reduce((s, q) => s + q.L, 0), scale = t.L / sum;
      const dir = Math.sign(t.A) || 1;
      let s = s0;
      t.list.forEach((q) => {
        const c = q.c, o = off[c], m = n[c], len = q.L * scale;
        // start the outline at its point nearest the arc's start, running the same way round as the loop
        const [ax, ay] = at(t, s); let j0 = 0, jd = 1e9;
        for (let j = 0; j < m; j++) { const d = Math.hypot(src[(o + j) * 2] - ax, src[(o + j) * 2 + 1] - ay); if (d < jd) { jd = d; j0 = j; } }
        const cdir = (Math.sign(q.A) || 1) === dir ? 1 : -1;
        for (let k = 0; k < m; k++) {
          const j = ((j0 + cdir * k) % m + m) % m;
          const [x, y] = at(t, s + len * (k / m));
          dst[(o + j) * 2] = x; dst[(o + j) * 2 + 1] = y;
        }
        cdata[c] = { j0, cdir };
        s += len;
      });
    });
    this.dst = dst; this.cdata = cdata; this.ver = (this.ver || 0) + 1;
    // the sweep: outlines start in order of their angle around the sheet's centre
    const order = info.map((q) => ({ c: q.c, a: Math.atan2(nsy(q.cy) - 0.5, nsx(q.cx) - 0.5) })).sort((p, q) => p.a - q.a);
    this.delay = new Float32Array(C); order.forEach((q, i) => { this.delay[q.c] = (i / C) * SWEEP; });
    this.buildGL();
  }

  /** fill: 0..1 ink fill (the scan's twin, a bitmap drawn once); line: 0..1 line strength; t: 0..1 the journey
   *  (on the GPU); color: [r, g, b] 0..255 */
  draw({ fill = 0, line = 0, t = 0, color = [18, 18, 18], width = 1 }) {
    const x = this.ctx, gl = this.gl;
    const on = !!this.src && (fill > 0.001 || line > 0.001), wantFill = on && fill > 0.001 && t <= 0;
    if (this.filled || wantFill) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.canvas.width, this.canvas.height); this.filled = false; }
    if (wantFill) { x.globalAlpha = fill; x.drawImage(this.still(color), 0, 0); x.globalAlpha = 1; this.filled = true; }
    if (gl && (this.lined || (on && line > 0.001))) {
      gl.viewport(0, 0, this.glc.width, this.glc.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); this.lined = false;
      if (on && line > 0.001 && this.verts) {
        gl.useProgram(this.pr); gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
        const F = 11 * 4, A = this.at;
        [['a_sa', 2, 0], ['a_da', 2, 2], ['a_sb', 2, 4], ['a_db', 2, 6], ['a_k', 2, 8], ['a_d', 1, 10]].forEach(([k, size, o]) => { gl.enableVertexAttribArray(A[k]); gl.vertexAttribPointer(A[k], size, gl.FLOAT, false, F, o * 4); });
        gl.uniform2f(this.un.u_res, this.glc.width, this.glc.height); gl.uniform1f(this.un.u_t, t); gl.uniform1f(this.un.u_dpr, this.dpr);
        gl.uniform1f(this.un.u_w, width * this.dpr);
        const al = line; gl.uniform4f(this.un.u_col, color[0] / 255 * al, color[1] / 255 * al, color[2] / 255 * al, al);   // premultiplied
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLES, 0, this.verts);
        this.lined = true;
      }
    }
    this.drawn = on;
  }
  still(color) {
    const key = `${color}|${this.canvas.width}x${this.canvas.height}|${this.ver}`;
    if (this.fillCache?.key === key) return this.fillCache.cv;
    const cv = this.fillCache?.cv || document.createElement('canvas');
    cv.width = this.canvas.width; cv.height = this.canvas.height;
    const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const { src, off, n, C } = this;
    x.fillStyle = `rgb(${color})`; x.beginPath();
    for (let k = 0; k < C; k++) { const o = off[k]; x.moveTo(src[o * 2], src[o * 2 + 1]); for (let j = 1; j < n[k]; j++) x.lineTo(src[(o + j) * 2], src[(o + j) * 2 + 1]); x.closePath(); }
    x.fill('evenodd');
    this.fillCache = { key, cv };
    return cv;
  }
}

// The in-page half of tools/typecheck.py (TYPE_RULES.md machine checks). Injected as one function expression;
// called with { stop } at each parked position; returns counts and failures for that frame.
(args) => {
  const u = window.__grid?.u || 20, W = document.documentElement.clientWidth, H = innerHeight;
  const HALF = u / 2 - 0.75;                     // rule 2: half a cell, less 0.75 px (lines are measured at their centre: half a 1 px line, plus rasterisation)
  const out = { stop: args.stop, u, W, H, words: 0, lines: 0, shapes: 0, texts: 0, drawn: !!window.__drawn, fallback: false,
    fails: { crossings: [], clearance: [], scale: [], wording: [], breaks: [] } };
  const F = out.fails;
  const num = (v) => +(+v).toFixed(2);
  const desc = (el) => {
    if (!el || !el.tagName) return String(el);
    const c = (el.getAttribute?.('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${c ? '.' + c : ''}${t ? ' "' + t + '"' : ''}`;
  };
  const alpha = (col) => { if (!col || col === 'transparent') return 0; const m = col.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const p = m[1].split(/[ ,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };

  // ---------- visibility ----------
  const visCache = new Map();
  function effOpacity(el) {
    if (visCache.has(el)) return visCache.get(el);
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none') { o = 0; break; }
      o *= +cs.opacity;
      if (/inset\(50%\)/.test(cs.clipPath)) { o = 0; break; }
    }
    if (o > 0 && getComputedStyle(el).visibility !== 'visible') o = 0;
    visCache.set(el, o); return o;
  }
  // (.is-dive: round 7 only, page 2 parked under the hallway, hidden by the WebGL end wall the DOM can't see)
  const SKIP = 'script, style, noscript, title, .sr-only, .xhair, .p1-we:not(.is-static) .p1-steps, .tc-overlay, .is-dive';
  const gateOpen = document.documentElement.dataset.phase === 'ready';
  const skipEl = (el) => el.closest(SKIP) || (gateOpen && el.closest('.enter, .curtain'));
  // clip rects from overflow ancestors
  function clipOf(el) {
    let r = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
    for (let c = el.parentElement; c && c !== document.body && c !== document.documentElement; c = c.parentElement) {
      const cs = getComputedStyle(c);
      if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || (cs.clipPath && cs.clipPath !== 'none' && !/inset\(50%\)/.test(cs.clipPath))) {
        const b = c.getBoundingClientRect(); r = { l: Math.max(r.l, b.left), t: Math.max(r.t, b.top), r: Math.min(r.r, b.right), b: Math.min(r.b, b.bottom) };
      }
    }
    return r;
  }
  // occlusion: the topmost painted element at a point (pointer-events forced on while we look) counts as covering the
  // word only if it, or an ancestor below the word's own chain, paints an opaque background
  const hitStyle = document.createElement('style'); hitStyle.textContent = 'html.tc-hit *, html.tc-hit *::before, html.tc-hit *::after { pointer-events: auto !important; } html.tc-hit .tc-overlay { pointer-events: none !important; }';
  document.head.append(hitStyle); document.documentElement.classList.add('tc-hit');
  function occluded(el, x, y) {
    const hit = document.elementFromPoint(x, y);
    if (!hit || hit === el || el.contains(hit) || hit.contains(el)) return false;
    for (let n = hit; n && !n.contains(el); n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (alpha(cs.backgroundColor) > 0.9 && effOpacity(n) > 0.9) return true;
      if ((n.tagName === 'IMG' || n.tagName === 'CANVAS' || n.tagName === 'VIDEO') && effOpacity(n) > 0.9) {
        const r = n.getBoundingClientRect(); if (r.width * r.height < 0.9 * W * H) return true;   // full-screen layers are see-through
      }
    }
    return false;
  }

  // ---------- fonts and metrics ----------
  const mctx = document.createElement('canvas').getContext('2d');
  const fontOf = (cs) => `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  function metrics(cs, text) {
    mctx.font = fontOf(cs);
    try { mctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing; } catch (e) {}
    const m = mctx.measureText(text);
    return { fa: m.fontBoundingBoxAscent, fd: m.fontBoundingBoxDescent, aa: m.actualBoundingBoxAscent, ad: m.actualBoundingBoxDescent,
      al: m.actualBoundingBoxLeft, ar: m.actualBoundingBoxRight, w: m.width };
  }
  const transformText = (t, cs) => (cs.textTransform === 'uppercase' ? t.toUpperCase() : cs.textTransform === 'lowercase' ? t.toLowerCase() : t);

  // block: the nearest block-level ancestor (SplitText's inline-block words are not blocks)
  function blockOf(el) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (n instanceof SVGElement) { if (n.tagName === 'text') return n; continue; }
      const d = getComputedStyle(n).display;
      if (/^(block|list-item|flex|grid|table|table-cell|flow-root)$/.test(d)) return n;
    }
    return el;
  }

  // round 8b: a hallway label carried in perspective: map the word's own (untransformed) ink box through the label's matrix
  function labQuad(lab, rg, cs, m) {
    const tf = getComputedStyle(lab).transform; if (!tf || !/matrix3d/.test(tf)) return null;
    const M = new DOMMatrix(tf), keep = lab.style.transform;
    lab.style.transform = 'none'; const o = lab.getBoundingClientRect(), rr = [...rg.getClientRects()][0]; lab.style.transform = keep;
    if (!rr) return null;
    const k = rr.height / Math.max(1, m.fa + m.fd), sx = m.w ? rr.width / m.w : k, base = rr.top + m.fa * k;
    const box = [[rr.left - m.al * sx, base - m.aa * k], [rr.left + m.ar * sx, base - m.aa * k], [rr.left + m.ar * sx, base + m.ad * k], [rr.left - m.al * sx, base + m.ad * k]];
    return box.map(([x, y]) => { const p = M.transformPoint(new DOMPoint(x - o.left, y - o.top, 0, 1)); return [p.x / p.w, p.y / p.w]; });
  }
  // ---------- words (rule 1, 2 targets; rule 5 lines) ----------
  const words = [];     // { l, t, r, b, base, text, block, el }
  const blocks = new Map();   // block -> { el, words: [], text: '', serif, size }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const raw = n.textContent; if (!raw.trim()) continue;
    const el = n.parentElement; if (!el || skipEl(el)) continue;
    const cs = getComputedStyle(el);
    // a ghost: a word that holds its place on the line but isn't seen (a see-through slot whose word travels on its own,
    // a kinetic word not yet revealed): kept for rule 5's line structure only
    const ghost = effOpacity(el) < 0.05 || (alpha(cs.color) < 0.05 && !(cs.webkitTextStrokeWidth && parseFloat(cs.webkitTextStrokeWidth) > 0));
    if (ghost && el instanceof SVGElement) continue;
    const clip = clipOf(el), svgText = el instanceof SVGElement;
    const blk = blockOf(el);
    let B = blocks.get(blk); if (!B) { B = { el: blk, words: [], ghosts: [], text: '', fam: cs.fontFamily, size: parseFloat(cs.fontSize), cs }; blocks.set(blk, B); }
    if (!ghost) B.text += raw;
    if (svgText) {   // one ink box for the whole SVG text (its local box mapped by its screen matrix: works turned too)
      const t = el.closest('text') || el; let bb; try { bb = t.getBBox(); } catch (e) { continue; }
      const m = metrics(cs, transformText(raw.trim(), cs)), k = bb.height / Math.max(1, m.fa + m.fd);
      const base = bb.y + m.fa * k, top = base - m.aa * k, bot = base + m.ad * k;
      const M = t.getScreenCTM(); if (!M) continue;
      const pts = [[bb.x, top], [bb.x + bb.width, top], [bb.x + bb.width, bot], [bb.x, bot]].map(([x, y]) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const w = { l: Math.min(...xs), t: Math.min(...ys), r: Math.max(...xs), b: Math.max(...ys), base: Math.max(...ys), text: raw.trim(), block: blk, el, size: parseFloat(cs.fontSize) };
      if (w.r < clip.l || w.l > clip.r || w.b < clip.t || w.t > clip.b || w.r < 0 || w.l > W || w.b < 0 || w.t > H) continue;
      if (occluded(el, (w.l + w.r) / 2, (w.t + w.b) / 2)) continue;
      words.push(w); B.words.push(w); continue;
    }
    const re = /\S+/g; let mm;
    while ((mm = re.exec(raw))) {
      const rg = document.createRange(); rg.setStart(n, mm.index); rg.setEnd(n, mm.index + mm[0].length);
      const shown = transformText(mm[0], cs), m = metrics(cs, shown);
      for (const r of rg.getClientRects()) {
        if (r.width < 0.5 || r.height < 0.5) continue;
        const k = r.height / Math.max(1, m.fa + m.fd), sx = m.w ? r.width / m.w : k;
        const base = r.top + m.fa * k;
        const w = { l: r.left - m.al * sx, r: r.left + m.ar * sx, t: base - m.aa * k, b: base + m.ad * k, base, text: shown, block: blk, el, size: parseFloat(cs.fontSize) * k };
        // round 8b: a word in a hallway label is seen in perspective (matrix3d): its true quad, not its inflated box
        const lab = el.closest('.dive__lab'); if (lab) { const q = labQuad(lab, rg, cs, m); if (q) { w.quad = q; const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]); Object.assign(w, { l: Math.min(...xs), r: Math.max(...xs), t: Math.min(...ys), b: Math.max(...ys) }); w.group = `hall${[...document.querySelectorAll('.dive__lab')].indexOf(lab) + 1}lab`; } }
        if (w.r <= clip.l || w.l >= clip.r || w.b <= clip.t || w.t >= clip.b) continue;
        if (w.r < 0 || w.l > W || w.b < 0 || w.t > H) continue;
        if (ghost) { B.ghosts.push(w); continue; }
        // covered (wholly or partly: scrolling under the opaque strip or title block is by design) -> not measured
        if ([[(w.l + w.r) / 2, (w.t + w.b) / 2], [w.l + 1, w.t + 1], [w.r - 1, w.t + 1], [w.l + 1, w.b - 1], [w.r - 1, w.b - 1]].some(([x, y]) => occluded(el, x, y))) continue;
        words.push(w); B.words.push(w);
      }
    }
  }
  // drop blocks with no visible word
  for (const [k, B] of blocks) if (!B.words.length) blocks.delete(k);

  // ---------- drawn lines and shapes ----------
  const lines = [];    // { x1, y1, x2, y2, src }
  const shapes = [];   // { l, t, r, b, src, own? }
  // chrome: the opaque fixed strip, title block and stuck slip head. Words inside chrome are measured only against that
  // chrome's own lines (whatever scrolls under it is hidden there)
  const CHROME = '.strip, .titleblock';
  let own = null;
  const seg = (x1, y1, x2, y2, src) => { if (Math.hypot(x2 - x1, y2 - y1) > 0.3) lines.push({ x1, y1, x2, y2, src, own }); };
  const isGridBg = (cs) => /linear-gradient/.test(cs.backgroundImage) && /repeat|px/.test(cs.backgroundSize) && cs.backgroundSize.split(',').length >= 2;
  const EXCL = '.board__grid, .xhair, .tc-overlay, .p1-grid .g, .p1__canvas, .p1__leaders, .dive__gl';
  const all = document.body.querySelectorAll('*');
  for (const el of all) {
    if (el.closest(EXCL) || skipEl(el)) continue;
    if (el instanceof SVGElement) continue;   // below
    const op = effOpacity(el); if (op < 0.05) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect(); if (r.width < 0.3 && r.height < 0.3) continue;
    if (r.right < 0 || r.left > W || r.bottom < 0 || r.top > H) continue;
    const name = desc(el); own = el.closest(CHROME);
    // borders
    [['Top', r.left, r.top, r.right, r.top], ['Bottom', r.left, r.bottom, r.right, r.bottom], ['Left', r.left, r.top, r.left, r.bottom], ['Right', r.right, r.top, r.right, r.bottom]].forEach(([s, a, b, c, d]) => {
      const w = parseFloat(cs[`border${s}Width`]); if (w > 0 && cs[`border${s}Style`] !== 'none' && alpha(cs[`border${s}Color`]) > 0.05) seg(a, b, c, d, `${name} border-${s.toLowerCase()}`);
    });
    // inset hairline shadows
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      cs.boxShadow.split(/,(?![^(]*\))/).forEach((sh) => {
        if (!/inset/.test(sh)) return;
        const col = (sh.match(/rgba?\([^)]+\)|#[0-9a-f]+|transparent/i) || ['rgb(0,0,0)'])[0]; if (alpha(col) <= 0.05) return;
        const nums = sh.replace(/rgba?\([^)]+\)/, '').match(/-?[\d.]+px/g)?.map(parseFloat) || []; const [ox = 0, oy = 0, bl = 0, sp = 0] = nums;
        if (bl > 2) return;
        if (sp > 0 && sp <= 2.5 && !ox && !oy) { seg(r.left, r.top, r.right, r.top, `${name} inset`); seg(r.left, r.bottom, r.right, r.bottom, `${name} inset`); seg(r.left, r.top, r.left, r.bottom, `${name} inset`); seg(r.right, r.top, r.right, r.bottom, `${name} inset`); return; }
        if (oy > 0 && oy <= 2.5) seg(r.left, r.top, r.right, r.top, `${name} inset-top`);
        if (oy < 0 && oy >= -2.5) seg(r.left, r.bottom, r.right, r.bottom, `${name} inset-bottom`);
        if (ox > 0 && ox <= 2.5) seg(r.left, r.top, r.left, r.bottom, `${name} inset-left`);
        if (ox < 0 && ox >= -2.5) seg(r.right, r.top, r.right, r.bottom, `${name} inset-right`);
      });
    }
    // hairline elements (a thin box painted with a colour)
    const thin = Math.min(r.width, r.height);
    if (thin <= 4 && Math.max(r.width, r.height) > 2 && (alpha(cs.backgroundColor) > 0.05 || (cs.backgroundImage !== 'none' && !isGridBg(cs)))) {
      if (r.width <= r.height) seg((r.left + r.right) / 2, r.top, (r.left + r.right) / 2, r.bottom, `${name} hairline`);
      else seg(r.left, (r.top + r.bottom) / 2, r.right, (r.top + r.bottom) / 2, `${name} hairline`);
    }
    // thin pseudo-elements (::before, ::after) drawn as rules
    for (const pe of ['::before', '::after']) {
      const ps = getComputedStyle(el, pe); if (!ps.content || ps.content === 'none' || ps.display === 'none' || +ps.opacity < 0.05) continue;
      if (alpha(ps.backgroundColor) <= 0.05 || !/absolute|fixed/.test(ps.position)) continue;
      const pw = parseFloat(ps.width), ph = parseFloat(ps.height); if (!(pw >= 0) || !(ph >= 0)) continue;
      if (Math.min(pw, ph) > 4) continue;
      const bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
      let x = !isNaN(parseFloat(ps.left)) ? r.left + bl + parseFloat(ps.left) : r.right - (parseFloat(cs.borderRightWidth) || 0) - parseFloat(ps.right) - pw;
      let y = !isNaN(parseFloat(ps.top)) ? r.top + bt + parseFloat(ps.top) : r.bottom - (parseFloat(cs.borderBottomWidth) || 0) - parseFloat(ps.bottom) - ph;
      let sx = 1, sy = 1;
      const tm = ps.transform.match(/matrix\(([^)]+)\)/); if (tm) { const v = tm[1].split(',').map(parseFloat); sx = Math.hypot(v[0], v[1]); sy = Math.hypot(v[2], v[3]); }
      if (sx < 0.02 || sy < 0.02) continue;
      const o = ps.transformOrigin.split(' ').map(parseFloat), cx = x + (o[0] || 0), cy = y + (o[1] || 0);
      const x0 = cx + (x - cx) * sx, x1 = cx + (x + pw - cx) * sx, y0 = cy + (y - cy) * sy, y1 = cy + (y + ph - cy) * sy;
      if (x1 - x0 <= y1 - y0) seg((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, `${name}${pe}`); else seg(x0, (y0 + y1) / 2, x1, (y0 + y1) / 2, `${name}${pe}`);
    }
    // round 8b: a backing (a pseudo-element box painted behind words: the hallway's frosted opening line) counts as drawn
    // lines, its four sides, so words can't run past it. The perspective labels' backings come from __drawn.
    if (!el.closest('.dive__lab')) {
      const ps = getComputedStyle(el, '::before');
      const ok = ps.content && ps.content !== 'none' && ps.display !== 'none' && +ps.opacity >= 0.05 && /absolute/.test(ps.position)
        && ((ps.backdropFilter && ps.backdropFilter !== 'none') || (alpha(ps.backgroundColor) > 0.05 && parseFloat(ps.borderTopLeftRadius) > 0));
      if (ok) {
        const L0 = parseFloat(ps.left), T0 = parseFloat(ps.top), R0 = parseFloat(ps.right), B0 = parseFloat(ps.bottom);
        if (![L0, T0, R0, B0].some(isNaN)) {
          const x0 = r.left + L0, y0 = r.top + T0, x1 = r.right - R0, y1 = r.bottom - B0;
          if (x1 - x0 >= 8 && y1 - y0 >= 8) { const nm = `${name}::before backing`; seg(x0, y0, x1, y0, nm); seg(x1, y0, x1, y1, nm); seg(x1, y1, x0, y1, nm); seg(x0, y1, x0, y0, nm); }
        }
      }
    }
    // pictures as shapes (full-screen layers excluded: their content comes from __drawn)
    if ((el.tagName === 'IMG' || el.tagName === 'CANVAS' || el.tagName === 'VIDEO') && op > 0.05 && r.width * r.height < 0.9 * W * H && r.width > 2 && r.height > 2)
      shapes.push({ l: r.left, t: r.top, r: r.right, b: r.bottom, src: name });
  }
  // SVG strokes
  for (const g of document.body.querySelectorAll('svg path, svg line, svg polyline, svg polygon, svg rect, svg circle, svg ellipse')) {
    if (g.closest(EXCL) || skipEl(g) || g.closest('defs, clipPath, mask')) continue;
    if (effOpacity(g) < 0.05) continue;
    const cs = getComputedStyle(g);
    if (cs.stroke === 'none' || alpha(cs.stroke) <= 0.05 || +cs.strokeOpacity < 0.05 || parseFloat(cs.strokeWidth) <= 0) continue;
    const M = g.getScreenCTM(); if (!M) continue;
    own = g.closest(CHROME);
    const T = (x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
    const name = desc(g.closest('svg')) + ' ' + g.tagName + (g.getAttribute('class') ? '.' + g.getAttribute('class').split(' ')[0] : '');
    let len = 0; try { len = g.getTotalLength(); } catch (e) {}
    if (!len) continue;
    const scale = Math.hypot(M.a, M.b) || 1, n = Math.min(4000, Math.max(2, Math.ceil(len * scale / 4)));
    let prev = null, prevGap = false;
    // dashes: a stroke drawn off by its dash offset (an undrawn tick) is skipped
    if (cs.strokeDasharray !== 'none') { const d = cs.strokeDasharray.split(/[ ,]+/).map(parseFloat); const off = parseFloat(cs.strokeDashoffset) || 0; if (d.length >= 1 && off >= d[0] - 0.5) continue; }
    for (let i = 0; i <= n; i++) {
      let p; try { p = g.getPointAtLength(len * i / n); } catch (e) { break; }
      const q = T(p.x, p.y);
      if (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) < 40) seg(prev[0], prev[1], q[0], q[1], name);   // a jump = a new subpath
      prev = q;
    }
  }

  // ---------- __drawn (canvas and WebGL), or the page 1 fallback ----------
  const dtexts = [];
  let D = null;
  try { D = window.__drawn ? window.__drawn() : null; } catch (e) { out.drawnError = String(e); }
  if (!D && window.__p1) {   // round 7 build: phone A's pieces, the X-ray shelves, the hallway's drawings (as shapes)
    out.fallback = true; D = { lines: [], shapes: [], texts: [] };
    const p1 = window.__p1, cv = document.querySelector('.p1__canvas');
    if (cv && !cv.classList.contains('is-off') && effOpacity(cv) > 0.5) p1.phone.parts.forEach((pt) => { const b = p1.phone.partBox(pt); D.shapes.push({ x: b.left, y: b.top, w: b.right - b.left, h: b.bottom - b.top, tag: `phoneA:${pt.name}` }); });
    const lbls = document.querySelector('.p1-lbl.on');
    if (lbls) (p1.shelves?.() || []).forEach((s) => D.lines.push({ x1: s.x0, y1: s.y, x2: s.x1, y2: s.y, tag: `shelf:${s.name}` }));
    (p1.dive?.()?.info || []).forEach((f) => { if (!f.quad || f.op < 0.5) return; const xs = f.quad.map((c) => c[0]), ys = f.quad.map((c) => c[1]);
      D.shapes.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), tag: `hall:sheet${f.i + 1}` }); });
  }
  own = null;
  if (D) {
    (D.lines || []).forEach((l) => seg(l.x1, l.y1, l.x2, l.y2, `drawn:${l.tag || ''}`));
    (D.shapes || []).forEach((s) => shapes.push({ l: s.x, t: s.y, r: s.x + s.w, b: s.y + s.h, quad: s.quad, src: `drawn:${s.tag || ''}`, group: (s.tag || '').split(':')[0] }));
    (D.texts || []).forEach((t) => { const w = { l: t.x, t: t.y, r: t.x + t.w, b: t.y + t.h, quad: t.quad, base: t.y + t.h, text: t.t || '', block: `drawn:${t.tag || ''}`, el: null, size: t.size, group: (t.tag || '').split(':')[0], drawnTag: t.tag || '' };
      if (w.r < 0 || w.l > W || w.b < 0 || w.t > H) return; words.push(w); dtexts.push(w); });
  }
  out.words = words.length; out.lines = lines.length; out.shapes = shapes.length; out.texts = dtexts.length;

  // ---------- rules 1 and 2 ----------
  const segBox = (s, b) => {   // does segment s enter box b (shrunk by half a pixel)?
    const l = b.l + 0.5, r = b.r - 0.5, t = b.t + 0.5, bt = b.b - 0.5; if (l >= r || t >= bt) return false;
    let [x1, y1, x2, y2] = [s.x1, s.y1, s.x2, s.y2];
    // Liang-Barsky
    let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
    for (const [p, q] of [[-dx, x1 - l], [dx, r - x1], [-dy, y1 - t], [dy, bt - y1]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const k = q / p; if (p < 0) { if (k > t1) return false; if (k > t0) t0 = k; } else { if (k < t0) return false; if (k < t1) t1 = k; }
    }
    return true;
  };
  const ptSeg = (px, py, s) => { const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L = dx * dx + dy * dy; let k = L ? ((px - s.x1) * dx + (py - s.y1) * dy) / L : 0; k = Math.max(0, Math.min(1, k)); return Math.hypot(px - s.x1 - k * dx, py - s.y1 - k * dy); };
  const ptBox = (px, py, b) => Math.hypot(Math.max(b.l - px, 0, px - b.r), Math.max(b.t - py, 0, py - b.b));
  // round 8b: words and shapes seen in perspective carry their true quads
  const inQ = (q, x, y) => { let pos = 0, neg = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4], c = (n[0] - p[0]) * (y - p[1]) - (n[1] - p[1]) * (x - p[0]); if (c > 0) pos++; else if (c < 0) neg++; } return !(pos && neg); };
  const xSeg = (ax, ay, bx, by, cx, cy, dx, dy) => { const d1 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax), d2 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax), d3 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx), d4 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx); return d1 * d2 < 0 && d3 * d4 < 0; };
  const quadSeg = (q, s) => {
    if (inQ(q, s.x1, s.y1) || inQ(q, s.x2, s.y2)) return 0; let d = Infinity;
    for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], e = { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
      if (xSeg(s.x1, s.y1, s.x2, s.y2, a[0], a[1], b[0], b[1])) return 0;
      d = Math.min(d, ptSeg(s.x1, s.y1, e), ptSeg(s.x2, s.y2, e), ptSeg(a[0], a[1], s)); }
    return d;
  };
  const boxQ = (b) => [[b.l, b.t], [b.r, b.t], [b.r, b.b], [b.l, b.b]];
  const quadQuad = (p, q) => { let d = Infinity; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; d = Math.min(d, quadSeg(p, { x1: a[0], y1: a[1], x2: b[0], y2: b[1] })); if (!d) return 0; } return inQ(q, p[0][0], p[0][1]) ? 0 : d; };
  const segDist = (s, b) => (b.quad ? quadSeg(b.quad, s) : segBox(s, b) ? 0 : Math.min(ptBox(s.x1, s.y1, b), ptBox(s.x2, s.y2, b), ptSeg(b.l, b.t, s), ptSeg(b.r, b.t, s), ptSeg(b.l, b.b, s), ptSeg(b.r, b.b, s)));
  const blockName = (w) => (w.el ? desc(w.block) : `${w.block} "${w.text.slice(0, 30)}"`);
  const pairs = new Map();   // (block | source) -> worst
  // one failure per (text block, drawn line): lines lying on the same screen row or column (a box's outline and its
  // cell's rule drawn over it) count once
  const where = (s) => (!s.x1 && s.x1 !== 0 ? s.src : Math.abs(s.y2 - s.y1) < 0.6 ? `h${Math.round(s.y1)}` : Math.abs(s.x2 - s.x1) < 0.6 ? `v${Math.round(s.x1)}` : s.src);
  const note = (kind, w, src, dist, s) => {
    const key = `${kind}|${blockName(w)}|${s ? where(s) : src}`, p = pairs.get(key);
    if (!p) pairs.set(key, { kind, text: blockName(w), word: w.text, src, dist: num(dist), box: [num(w.l), num(w.t), num(w.r), num(w.b)] });
    else if (dist < p.dist) Object.assign(p, { word: w.text, src, dist: num(dist), box: [num(w.l), num(w.t), num(w.r), num(w.b)] });
  };
  for (const w of words) {
    w.own = w.el ? w.el.closest(CHROME) : null;
    const L = w.l - HALF - 1, R = w.r + HALF + 1, T = w.t - HALF - 1, Bm = w.b + HALF + 1;
    for (const s of lines) {
      if (Math.max(s.x1, s.x2) < L || Math.min(s.x1, s.x2) > R || Math.max(s.y1, s.y2) < T || Math.min(s.y1, s.y2) > Bm) continue;
      if (w.drawnTag && s.src === `drawn:${w.drawnTag}`) continue;
      if (w.own && s.own !== w.own) continue;
      // the fixed chrome (strip, title block) floats over pages that scroll freely; where their words happen to pass it is
      // the visitor's scroll, not the layout. The pinned scenes (page 1, the hallway) keep clear of it by design and stay checked
      if (s.own && !w.own && !w.drawnTag && w.el && (!w.el.closest('#page-01') || document.documentElement.dataset.motion === 'reduce')) continue;   // (reduced motion: page 1 scrolls too)
      const d = segDist(s, w);
      const same = w.group && s.src.startsWith(`drawn:${w.group}:`);   // a drawing's own word and line, or a hallway label's words and its backing (one object in perspective)   // round 8b: a drawing's own word and line (its clear space: readcheck.py, in its plane)
      if (d === 0) note('crossings', w, s.src, 0, s); else if (d < HALF && !same) note('clearance', w, s.src, d, s);
    }
    for (const sh of shapes) {
      if (w.own) break;
      if (sh.r < L || sh.l > R || sh.b < T || sh.t > Bm) continue;
      const inside = w.l >= sh.l && w.r <= sh.r && w.t >= sh.t && w.b <= sh.b;
      if (w.drawnTag && w.group && sh.group && w.group === sh.group) continue;   // round 8b: its own drawing's sheet and boxes (readcheck.py, in its plane)
      if (inside && w.group && sh.group && w.group === sh.group) {   // a label on its own sheet: half a cell from the sheet's edges
        const d = Math.min(w.l - sh.l, sh.r - w.r, w.t - sh.t, sh.b - w.b); if (d < HALF) note('clearance', w, sh.src + ' (edge, inside)', d); continue;
      }
      let d;
      if (w.quad || sh.quad) d = quadQuad(w.quad || boxQ(w), sh.quad || boxQ(sh));
      else { const ov = w.l < sh.r && w.r > sh.l && w.t < sh.b && w.b > sh.t; d = ov ? 0 : Math.hypot(Math.max(sh.l - w.r, 0, w.l - sh.r), Math.max(sh.t - w.b, 0, w.t - sh.b)); }
      if (d === 0) note('crossings', w, sh.src + ' (over a shape)', 0); else if (d < HALF) note('clearance', w, sh.src, d);
    }
  }
  for (const p of pairs.values()) F[p.kind].push(p);

  // ---------- rule 3: the type scale ----------
  const MONO = [0.375, 0.4375, 0.5, 0.625], SERIF = [1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6.5, 9.5, 11.5];
  const seenEl = new Set();
  for (const w of words) {
    if (!w.el || seenEl.has(w.el)) continue; seenEl.add(w.el);
    const el = w.el, cs = getComputedStyle(el), fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), wt = +cs.fontWeight;
    if (el.closest('svg')) continue;   // a drawing's own lettering (the still figures): its drawing's scale, like the hallway's
    const size = parseFloat(cs.fontSize) / u, name = desc(el);
    if (fam === 'Newsreader') {
      if (![400, 420, 560].includes(wt)) F.scale.push({ text: name, what: `Newsreader weight ${wt}` });
      if (!SERIF.some((s) => Math.abs(s - size) <= 0.01)) F.scale.push({ text: name, what: `serif size ${num(size * 1000) / 1000} cells (${cs.fontSize})` });
    } else if (fam === 'DM Mono') {
      if (![300, 400, 500].includes(wt)) F.scale.push({ text: name, what: `DM Mono weight ${wt}` });
      if (!MONO.some((s) => Math.abs(s - size) <= 0.01)) F.scale.push({ text: name, what: `mono size ${num(size * 1000) / 1000} cells (${cs.fontSize})` });
    } else F.scale.push({ text: name, what: `family ${fam}` });
    if (!(el instanceof SVGElement)) {
      const blk = blockOf(el), bcs = getComputedStyle(blk), lh = bcs.lineHeight === 'normal' ? NaN : parseFloat(bcs.lineHeight) / u;
      if (isNaN(lh)) F.scale.push({ text: desc(blk), what: 'line-height normal' });
      else if (Math.abs(lh * 2 - Math.round(lh * 2)) > 0.04) F.scale.push({ text: desc(blk), what: `line-height ${num(lh * 100) / 100} cells` });
    }
  }
  const groups = {};
  dtexts.forEach((t) => { if (t.size) (groups[t.group] ||= new Set()).add(Math.round(t.size * 100) / 100); });
  for (const [g, s] of Object.entries(groups)) if (s.size > 3) F.scale.push({ text: `drawing ${g}`, what: `${s.size} label sizes (${[...s].join(', ')})` });

  // ---------- rule 4: case, punctuation, numbers, drafts ----------
  const PROPER = new Set(args.proper);
  const textBlocks = [...blocks.values()].map((B) => ({ ...B, text: B.text.replace(/\s+/g, ' ').trim() })).concat(dtexts.map((t) => ({ el: null, text: t.text, fam: 'DM Mono', drawn: t.block })));
  for (const B of textBlocks) {
    const t = B.text, name = B.el ? desc(B.el) : B.drawn;
    if (/['"]/.test(t)) F.wording.push({ text: name, what: 'straight quote or apostrophe' });
    if (/\.\.\./.test(t)) F.wording.push({ text: name, what: 'three dots (use …)' });
    if (/\d-\d/.test(t.replace(/\b\d{6}\s*[-‐‑]\s*\d{4}\b/g, ''))) F.wording.push({ text: name, what: 'hyphen in a range (use –)' });
    const big = t.replace(/#[0-9A-Fa-f]{6}\b/g, '').match(/\b\d{4,}\b/g)?.filter((n) => !(+n >= 1000 && +n <= 2099) && !/\d{6}-\d{4}/.test(t)); if (big?.length) F.wording.push({ text: name, what: `number without thousands comma: ${big.join(', ')}` });
    const ms = t.match(/[\d.,]+\s*(PX|px)\b/g); if (ms) ms.forEach((m) => { if (!/^\d{1,3}(,\d{3})*\.\d (PX|px)$/.test(m.trim())) F.wording.push({ text: name, what: `measurement style "${m}"` }); });
    if (/Newsreader/.test(B.fam || '')) {
      const toks = t.split(/\s+/); let start = true;
      toks.forEach((tok, i) => {
        const bare = tok.replace(/^[“"‘'(…\[]+|[”"’'),.;:!?…\]]+$/g, '');
        if (!start && bare && /^[A-Z]/.test(bare) && !(bare.length > 1 && bare === bare.toUpperCase()) && !PROPER.has(bare) && !PROPER.has(bare.replace(/’s$/, '')) && !/\d/.test(bare))
          F.wording.push({ text: name, what: `Title Case word "${bare}"` });
        start = /[.?!:·]$|^·$|^[↓↑→]$/.test(tok) && !/^(A|G|Fig|No)\.$/.test(tok);
      });
    }
  }
  const flagged = (el) => {
    if (el.querySelector('.ph') && effOpacity(el.querySelector('.ph')) > 0.05) return true;
    for (let s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.matches('.ph') || s.querySelector?.('.ph')) return effOpacity(s) > 0.05;
    if (el.parentElement && [...el.parentElement.children].indexOf(el) >= 0 && el.parentElement.querySelector(':scope > .ph')) return true;
    const sec = el.closest('section, .dive__lab, .dive__open, [data-sheet]') || document.body;
    const has = (s) => [...s.querySelectorAll('.p23-flag, [data-draft-flag]')].some((f) => effOpacity(f) > 0.05 && f.getBoundingClientRect().height > 0);
    if (has(sec)) return true;
    // a section without its own page number continues the page before it (the final room's slip): that page's flag counts
    // (it was shown at the page's top; the flag needn't be on screen at every stop)
    if (sec.tagName === 'SECTION' && !sec.dataset.sheet) for (let s = sec.previousElementSibling; s; s = s.previousElementSibling) if (s.dataset?.sheet) return !!s.querySelector('.p23-flag, [data-draft-flag]');
    if (sec.tagName === 'SECTION' && sec.dataset.sheet) return !!sec.querySelector(':scope .p23-flag, :scope [data-draft-flag]');
    return false;
  };
  const seenDraft = new Set();
  for (const w of words) {
    const d = w.el?.closest('[data-draft]'); if (!d || seenDraft.has(d)) continue; seenDraft.add(d);
    if (!flagged(d)) F.wording.push({ text: desc(d), what: 'draft with no visible Draft flag' });
  }
  const norm = (s) => s.replace(/\s+/g, ' ').replace(/'/g, '’').trim();
  for (const B of blocks.values()) {
    const t = norm(B.text);
    for (const s of args.signed) if (t.includes(s)) {
      const el = B.el; if (el.closest('[data-draft]') || el.querySelector('.ph') || el.previousElementSibling?.matches('.ph')) F.wording.push({ text: desc(el), what: `signed-off line flagged as a draft: "${s}"` });
    }
  }

  // ---------- rule 5: breaks ----------
  for (const B of blocks.values()) {
    if (!B.el || B.el instanceof SVGElement || B.words.length < 2) continue;
    { const r = B.el.getBoundingClientRect(); if (r.top < 0 || r.bottom > H) continue; }   // judged whole: a block half off the screen shows only some of its lines
    // a hallway label mid-swing is seen in perspective (its lines are not level): its breaks are judged at rest
    if (B.el.closest('.dive__lab[data-rest="0"]')) continue;
    const ls = [];
    B.words.concat(B.ghosts || []).sort((a, b) => a.base - b.base).forEach((w) => { const L = ls.find((x) => Math.abs(x.base - w.base) < Math.max(2, w.size * 0.3)); if (L) { L.n++; L.l = Math.min(L.l, w.l); L.r = Math.max(L.r, w.r); } else ls.push({ base: w.base, n: 1, l: w.l, r: w.r }); });
    if (ls.length < 2) continue;
    const name = desc(B.el);
    if (ls.some((L) => L.n === 1)) F.breaks.push({ text: name, what: `lone word (${ls.map((L) => L.n).join('/')} words per line)` });
    const size = parseFloat(getComputedStyle(B.el).fontSize) / u, wd = ls.map((L) => L.r - L.l);
    if (size >= 1.5 - 1e-3 && Math.min(...wd) < 0.5 * Math.max(...wd)) F.breaks.push({ text: name, what: `unbalanced lines (${wd.map((x) => Math.round(x)).join(' / ')} px)` });
  }

  document.documentElement.classList.remove('tc-hit'); hitStyle.remove();
  return out;
}

// Shared drawing kit for the concept products (made-up products, never clients).
// Every product draws in its own logical pixels (phones 390 x 844, web 1440 x 900) onto a canvas of any resolution:
// begin() scales the context so 1 unit = 1 logical px. Only the site's two families: "Newsreader" and "DM Mono".
// Black, white and greys by default; a product's own accent colour appears only when it is drawn with { accent: true }.

export const mono = (sz, w = 400) => `${w} ${sz}px "DM Mono", ui-monospace, monospace`;
export const serif = (sz, w = 500) => `${w} ${sz}px "Newsreader", Georgia, serif`;

/** dark and light screen palettes (greys only) */
export const DARK = { bg: '#0C0C0C', panel: '#121211', deep: '#0A0A0A', ink: '#EDEBE6', dim: '#8F8E89', faint: '#5C5B57', line: '#2B2B29', line2: '#3B3B38', hi: '#F2F0EB', dark: true };
export const LIGHT = { bg: '#F6F5F1', panel: '#FFFFFF', deep: '#ECEAE4', ink: '#121212', dim: '#6B6A66', faint: '#A8A7A1', line: '#E2E0DA', line2: '#CFCDC6', hi: '#121212', dark: false };

/** a tiny seeded random so every drawing is identical on every load */
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** clear the canvas to bg and scale the context to logical px; returns the context (call end(c) after) */
export function begin(canvas, w, bg) {
  const c = canvas.getContext('2d');
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = bg; c.fillRect(0, 0, canvas.width, canvas.height);
  const S = canvas.width / w;
  c.scale(S, S);
  c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.lineCap = 'butt'; c.lineJoin = 'miter';
  c.setLineDash([]); c.globalAlpha = 1;
  return c;
}
export function end(c) { c.restore(); }

/** text with optional alignment and tracking */
export function txt(c, s, x, y, font, color, align = 'left', ls = 0) {
  c.font = font; c.fillStyle = color; c.textAlign = align;
  if (ls) c.letterSpacing = `${ls}px`;
  c.fillText(s, x, y);
  if (ls) c.letterSpacing = '0px';
  c.textAlign = 'left';
}
export function tw(c, s, font) { c.font = font; return c.measureText(s).width; }

export function line(c, x1, y1, x2, y2, color, lw = 1, dash = null) {
  c.strokeStyle = color; c.lineWidth = lw; if (dash) c.setLineDash(dash);
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  if (dash) c.setLineDash([]);
}
export function rect(c, x, y, w, h, { fill = null, stroke = null, lw = 1, r = 0, dash = null } = {}) {
  c.beginPath();
  if (r) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; if (dash) c.setLineDash(dash); c.stroke(); if (dash) c.setLineDash([]); }
}
export function dot(c, x, y, r, fill, stroke = null, lw = 1) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}
/** diagonal hatch inside a rectangle */
export function hatch(c, x, y, w, h, color, gap = 4, lw = 1) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.strokeStyle = color; c.lineWidth = lw; c.beginPath();
  for (let k = -h; k < w; k += gap) { c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); }
  c.stroke(); c.restore();
}

/** phone status bar (time, signal, battery), like the LOFTHAUL screen */
export function statusBar(c, T, time) {
  txt(c, time, 28, 34, mono(13, 500), T.ink);
  c.fillStyle = T.ink; c.fillRect(340, 24, 22, 11); c.fillStyle = T.bg; c.fillRect(342, 26, 6, 7); c.fillStyle = T.ink; c.fillRect(363, 27, 2, 5);
  for (let i = 0; i < 4; i++) c.fillRect(306 + i * 6, 34 - (i + 1) * 3, 4, (i + 1) * 3);
}

/** phone header: product name, sub line, and a right-hand status with a dot */
export function phoneHeader(c, T, name, sub, status, dotColor) {
  txt(c, name, 24, 84, serif(22, 640), T.ink);
  txt(c, sub, 24, 104, mono(11), T.dim);
  if (status) {
    const w = tw(c, status, mono(11, 500));
    dot(c, 366 - w - 10, 78, 4.5, dotColor);
    txt(c, status, 366, 82, mono(11, 500), T.ink, 'right');
  }
}

/** a section label row: LEFT ............ RIGHT */
export function section(c, T, x1, x2, y, left, right) {
  txt(c, left, x1, y, mono(11, 500), T.ink);
  if (right) txt(c, right, x2, y, mono(11), T.dim, 'right');
}

/** a small bar meter */
export function meter(c, x, y, w, h, v, T, fill) {
  c.strokeStyle = T.dim; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w, h);
  c.fillStyle = fill; c.fillRect(x + 2, y + 2, (w - 3) * Math.max(0, Math.min(1, v)), h - 3);
}

/** a smooth path through points (Catmull-Rom to Bezier) */
export function smooth(c, pts) {
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}

/** a mono pill button (filled or outlined) with centred text */
export function button(c, x, y, w, h, label, { fill = null, stroke = null, color, r = 10, size = 13 } = {}) {
  rect(c, x, y, w, h, { fill, stroke, r });
  txt(c, label, x + w / 2, y + h / 2 + size * 0.36, mono(size, 500), color, 'center');
}

/** a small outlined chip with mono text; returns its width */
export function chip(c, x, y, label, color, { fill = null, ink = null, size = 10, pad = 6, h = 18, align = 'left' } = {}) {
  const w = tw(c, label, mono(size, 500)) + pad * 2;
  if (align === 'right') x -= w;
  rect(c, x + 0.5, y + 0.5, w, h, { fill, stroke: fill ? null : color, r: 3 });
  txt(c, label, x + pad, y + h / 2 + size * 0.36 + 0.5, mono(size, 500), ink || color);
  return w;
}

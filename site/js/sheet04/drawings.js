// Sheet 04, Method: one precise hairline drawing per step, in an 800 x 560 design space (see plot.js).
// Labels are kept short so they still fit at phone width (10 px mono at ~0.44 px per unit).
// Every label is a plain description of how the studio works; the one number (48 dp) is the published
// Material Design minimum touch target (source in tools/notes/sheet-04.md).

/** Fig. 4.1: the brief is drawn in solid lines first; the screens wait as hidden (dashed) lines. */
function problem(P) {
  // the brief: a sheet with one heavy line, the problem in one sentence
  P.rect(40, 70, 300, 430, 0, { at: 0 });
  P.text(58, 98, 'THE BRIEF', { at: 0.05 });
  P.line(40, 112, 340, 112, { at: 0.08, cls: 'thin' });
  P.dim(62, 214, 300, 214, 'ONE SENTENCE', { off: -34, at: 0.14 });
  P.line(62, 214, 300, 214, { at: 0.22, cls: 'heavy' });
  [262, 306, 350].forEach((y, i) => P.line(62, y, 236 + i * 14, y, { at: 0.3 + i * 0.06 }));
  [410, 440, 470].forEach((y, i) => P.line(62, y, 290 - i * 40, y, { at: 0.48 + i * 0.03, cls: 'thin' }));
  // leaders: the three questions the sentence has to answer
  const Q = [['01', 'WHO IT HURTS'], ['02', 'WHAT IT COSTS'], ['03', "HOW WE'LL KNOW"]];
  Q.forEach(([n, s], i) => {
    const y = 262 + i * 44, x0 = 236 + i * 14 + 8;
    P.fill(`M${x0 - 3} ${y}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z`, { at: 0.56 + i * 0.05 });
    P.poly([[x0, y], [364, y]], { at: 0.56 + i * 0.05, cls: 'thin' });
    P.text(372, y + 4, `${n} ${s}`, { at: 0.6 + i * 0.05 });
  });
  // the screens: hidden lines until the problem is solid
  const sx = 612, sy = 96, sw = 148, sh = 300;
  P.rect(sx, sy, sw, sh, 16, { at: 0.74, cls: 'hidden' });
  P.rect(sx + 14, sy + 30, sw - 28, 54, 3, { at: 0.78, cls: 'hidden' });
  P.rect(sx + 14, sy + 96, sw - 28, 22, 3, { at: 0.8, cls: 'hidden' });
  P.rect(sx + 14, sy + 126, sw - 28, 22, 3, { at: 0.8, cls: 'hidden' });
  P.rect(sx + 14, sy + sh - 52, sw - 28, 32, 6, { at: 0.82, cls: 'hidden' });
  P.text(sx + sw / 2, sy + sh + 34, 'SCREENS', { at: 0.86, anchor: 'middle' });
  P.text(sx + sw / 2, sy + sh + 34 + P.lh(), 'HIDDEN LINES', { at: 0.88, anchor: 'middle', cls: 'graphite' });
  P.text(sx + sw / 2, sy + sh + 34 + 2 * P.lh(), 'DRAWN AFTER', { at: 0.9, anchor: 'middle', cls: 'graphite' });
}

/** Fig. 4.2: a booking flow with its wrong turns, mapped before any form exists. */
function flow(P) {
  const box = (x, y, w, h, label, at, round) => {
    P.rect(x, y, w, h, round ? h / 2 : 2, { at });
    P.text(x + w / 2, y + h / 2 + 4, label, { at: at + 0.04, anchor: 'middle' });
  };
  box(30, 250, 104, 48, 'OPEN', 0, true);
  P.arrow([[134, 274], [196, 274]], { at: 0.1 });
  box(196, 250, 168, 48, 'PICK A TIME', 0.14);
  P.arrow([[364, 274], [418, 274]], { at: 0.24 });
  // decision
  const dx = 478, dy = 274;
  P.path(`M${dx - 60} ${dy}L${dx} ${dy - 46}L${dx + 60} ${dy}L${dx} ${dy + 46}Z`, { at: 0.28 });
  P.text(dx, dy + 4, 'FREE?', { at: 0.32, anchor: 'middle' });
  P.arrow([[dx + 60, dy], [600, dy]], { at: 0.38 });
  P.text(570, dy - 10, 'YES', { at: 0.42, anchor: 'middle', cls: 'graphite' });
  box(600, 250, 168, 48, 'CONFIRM', 0.42);
  P.arrow([[684, 298], [684, 404]], { at: 0.5 });
  box(624, 404, 120, 48, 'DONE', 0.54, true);
  // wrong turn 1: the slot is gone
  P.arrow([[dx, dy + 46], [dx, 404]], { at: 0.6 });
  P.text(dx + 10, 360, 'NO', { at: 0.62, cls: 'graphite' });
  box(386, 404, 184, 48, 'NEXT SLOT', 0.64);
  P.arrow([[386, 428], [280, 428], [280, 298]], { at: 0.7 });
  // wrong turn 2: the card is declined
  P.arrow([[660, 250], [660, 150]], { at: 0.76 });
  box(600, 102, 168, 48, 'DECLINED', 0.8);
  P.arrow([[708, 150], [708, 250]], { at: 0.86 });
  P.text(722, 204, 'RETRY', { at: 0.88, cls: 'graphite' });
  // callout
  P.poly([[280, 380], [190, 380], [150, 470]], { at: 0.9, cls: 'thin' });
  P.fill('M277 380a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z', { at: 0.9 });
  P.text(30, 492, 'WRONG TURNS', { at: 0.94 });
  P.text(30, 492 + P.lh(), 'MAPPED FIRST', { at: 0.95, cls: 'graphite' });
}

/** Fig. 4.3: one thumb on a tired day. Reach zones, the main action inside the easy one, its hit area measured. */
function autopilot(P) {
  const x = 300, y = 20, w = 236, h = 500, r = 30;
  P.rect(x, y, w, h, r, { at: 0 });
  P.rect(x + 10, y + 12, w - 20, h - 24, r - 9, { at: 0.06, cls: 'thin' });
  // thumb pivot (right hand) and reach arcs, kept inside the screen by a clip
  const px = x + w + 26, py = y + h + 10;
  const clip = `s04clip${Math.random().toString(36).slice(2, 7)}`;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const cp = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath'); cp.setAttribute('id', clip);
  const cr = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  cr.setAttribute('x', x + 10); cr.setAttribute('y', y + 12); cr.setAttribute('width', w - 20); cr.setAttribute('height', h - 24);
  cp.appendChild(cr); defs.appendChild(cp); P.g.appendChild(defs);
  const a1 = P.arc(px, py, 300, 180, 270, { at: 0.16 }); a1.setAttribute('clip-path', `url(#${clip})`);
  const a2 = P.arc(px, py, 430, 180, 270, { at: 0.24 }); a2.setAttribute('clip-path', `url(#${clip})`);
  P.line(px - 8, py, px + 8, py, { at: 0.12 }); P.line(px, py - 8, px, py + 8, { at: 0.12 });
  P.text(px + 14, py + 4, 'PIVOT', { at: 0.14, cls: 'graphite' });
  P.text(x + w - 22, y + h - 150, 'EASY', { at: 0.2, anchor: 'end', cls: 'graphite' });
  P.text(x + w - 22, y + h - 300, 'STRETCH', { at: 0.28, anchor: 'end', cls: 'graphite' });
  P.text(x + 30, y + 96, 'HARD', { at: 0.3, cls: 'graphite' });
  // the main action and its hit area
  const bx = x + 34, by = y + h - 104, bw = w - 68, bh = 44;
  P.rect(bx, by, bw, bh, 8, { at: 0.38, cls: 'heavy' });
  P.rect(bx - 10, by - 10, bw + 20, bh + 20, 12, { at: 0.46, cls: 'hidden' });
  P.dim(bx + bw + 10, by - 10, bx + bw + 10, by + bh + 10, '48 DP', { off: -44, at: 0.52, labelSide: 1 });
  // callouts on the left: a dot on the target, a leader, a two-line label
  const call = (tx, ty, ly, n, a, b, at) => {
    P.fill(`M${tx - 3} ${ty}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z`, { at });
    P.poly([[tx, ty], [262, ly], [244, ly]], { at, cls: 'thin' });
    P.text(20, ly + 4, `${n} ${a}`, { at: at + 0.04 });
    P.text(20, ly + 4 + P.lh(), b, { at: at + 0.05, cls: 'graphite' });
  };
  call(bx + 8, by + bh / 2, by + bh / 2, '01', 'MAIN ACTION', 'IN THUMB REACH', 0.64);
  call(bx - 10, by - 10, by - 96, '02', 'BIG TARGETS', 'AT LEAST 48 DP', 0.74);
  call(x + 26, y + 58, y + 58, '03', 'TOP CORNER', 'NOTHING VITAL', 0.84);
}

/** Fig. 4.4: the handover as a drawing's parts list. An open drawer, its contents exploded above it. */
function handover(P) {
  // drawer, front elevation with the box pulled open
  const fx = 150, fy = 214, fw = 380, fh = 70;
  P.rect(fx, fy, fw, fh, 0, { at: 0 });
  P.rect(fx + fw / 2 - 34, fy + fh / 2 - 6, 68, 12, 6, { at: 0.04 });
  P.poly([[fx, fy], [fx + 46, fy - 40], [fx + fw + 46, fy - 40], [fx + fw, fy]], { at: 0.08 });
  P.line(fx + fw + 46, fy - 40, fx + fw + 46, fy + fh - 40, { at: 0.1, cls: 'thin' });
  P.line(fx + fw, fy + fh, fx + fw + 46, fy + fh - 40, { at: 0.1, cls: 'thin' });
  // the four parts, exploded upwards
  const parts = [
    { x: 196, draw: (cx, cy, at) => { P.path(`M${cx - 26} ${cy - 16}h18l6 6h28v30h-52Z`, { at }); P.line(cx - 26, cy - 4, cx + 26, cy - 4, { at, cls: 'thin' }); P.text(cx, cy + 12, '</>', { at: at + 0.03, anchor: 'middle', cls: 'graphite', size: 9 }); } },
    { x: 296, draw: (cx, cy, at) => { P.rect(cx - 28, cy - 18, 56, 36, 4, { at }); P.circle(cx - 14, cy - 2, 7, { at }); P.line(cx, cy - 6, cx + 20, cy - 6, { at, cls: 'thin' }); P.line(cx, cy + 4, cx + 16, cy + 4, { at, cls: 'thin' }); } },
    { x: 396, draw: (cx, cy, at) => { P.circle(cx - 16, cy, 11, { at }); P.circle(cx - 16, cy, 4, { at, cls: 'thin' }); P.path(`M${cx - 5} ${cy - 3}h34v6h-4v6h-5v-6h-5v4h-5v-4h-15`, { at }); } },
    { x: 496, draw: (cx, cy, at) => { P.rect(cx - 22, cy - 22, 44, 44, 2, { at }); [-10, -2, 6, 14].forEach((d) => P.line(cx - 12, cy + d, cx + 14, cy + d, { at, cls: 'thin' })); P.line(cx - 16, cy - 22, cx - 16, cy + 22, { at, cls: 'thin' }); } },
  ];
  parts.forEach((pt, i) => {
    const at = 0.16 + i * 0.07, cy = 92;
    pt.draw(pt.x, cy, at);
    P.line(pt.x, cy + 30, pt.x + 22, fy - 50, { at: at + 0.03, cls: 'hidden' });
    // balloon
    const bx = pt.x - 52, by = cy - 40;
    P.circle(bx, by, 13, { at: at + 0.04 });
    P.text(bx, by + 4, String(i + 1), { at: at + 0.06, anchor: 'middle' });
    P.line(bx + 9, by + 9, pt.x - 30, cy - 18, { at: at + 0.05, cls: 'thin' });
  });
  // parts list
  const tx = 40, ty = 330, cw = [70, 150, 390, 110], rh = 38, rows = [
    ['ITEM', 'PART', 'WHAT IS IN IT', 'OWNER'],
    ['1', 'CODE', 'REPOSITORY, FULL HISTORY', 'YOU'],
    ['2', 'ACCOUNTS', 'HOSTING, DOMAIN, STORES', 'YOU'],
    ['3', 'KEYS', 'PASSWORDS, API KEYS', 'YOU'],
    ['4', 'NOTES', 'HOW TO RUN AND CHANGE IT', 'YOU'],
  ];
  const tw = cw.reduce((a, b) => a + b, 0);
  P.text(tx, ty - 12, 'PARTS LIST', { at: 0.44 });
  P.rect(tx, ty, tw, rh * rows.length, 0, { at: 0.46 });
  let cx = tx;
  cw.slice(0, -1).forEach((w) => { cx += w; P.line(cx, ty, cx, ty + rh * rows.length, { at: 0.5, cls: 'thin' }); });
  rows.forEach((row, r) => {
    if (r) P.line(tx, ty + rh * r, tx + tw, ty + rh * r, { at: 0.52 + r * 0.02, cls: r === 1 ? '' : 'thin' });
    let x = tx;
    row.forEach((cell, c) => {
      P.text(x + 12, ty + rh * r + rh / 2 + 4, cell, { at: 0.6 + r * 0.07, cls: r === 0 || c === 0 ? 'graphite' : (c === 3 ? 'strong' : '') });
      x += cw[c];
    });
  });
}

export const STEPS = [
  { key: 'problem', fig: 'Fig. 4.1 · The brief first, the screens after', draw: problem },
  { key: 'flow', fig: 'Fig. 4.2 · Every path, wrong turns included', draw: flow },
  { key: 'autopilot', fig: 'Fig. 4.3 · Reach study, one thumb', draw: autopilot },
  { key: 'handover', fig: 'Fig. 4.4 · Parts list at handover', draw: handover },
];

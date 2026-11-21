// Sheet 05: the concept sheets. One drawing sheet per made-up product, each with its own title block:
//   - a PART VIEW of the screen at 1:1 (never shrunk: the web products' text is 9.5–12 px at full size), cut where the
//     sheet ends, with break marks on the cut edges and dimension lines in logical px;
//   - DETAIL A at 2:1, a circle around the product's one specific moment, tied to the part view by a leader;
//   - a KEY PLAN (outline only) showing where the part view and Detail A sit on the whole screen;
//   - a title block: product, "Concept sheet: made up to show the range, not a client", kind, industry, sheet, scale,
//     drawn / checked by discipline, and the product's own colour, which only shows on hover or keyboard focus.
// Plus the last sheet of the set, 05.10, left blank for the visitor.
import { byId } from '../products/index.js';
import { drawRegion } from './render.js';

const NS = 'http://www.w3.org/2000/svg';

// the order alternates web and phone; det = Detail A's centre in the product's logical px, focus = where the part view
// centres (defaults to det), ba = where the "A" bubble sits round the marker (deg), at / m = an explicit top-left for it on desktop / phone; fig = what the view shows
export const SET = [
  { id: 'halvane', det: [330, 556], focus: [438, 470], fig: 'Configurator, exploded movement', drawn: 'Design', checked: 'Engineering' },
  { id: 'stringwalk', det: [268, 296], fig: 'Field view, panel health', drawn: 'Design', checked: 'Engineering' },
  { id: 'wardcast', det: [215, 672], ba: 150, at: [24, 366], m: [150, 572], fig: 'Wards and the next 24 hours', drawn: 'AI', checked: 'Design' },
  { id: 'quaycall', det: [330, 762], fig: 'Berths, yard and cranes', drawn: 'Engineering', checked: 'Design' },
  { id: 'quillfield', det: [1176, 212], at: [864, 30], m: [1000, 60], fig: 'Claim, sources and recommendation', drawn: 'AI', checked: 'Security' },
  { id: 'lofthaul', det: [196, 300], fig: 'Dispatch map and release queue', drawn: 'Engineering', checked: 'Design' },
  { id: 'fernpay', det: [727, 300], ba: -40, at: [312, 168], m: [560, 168], fig: 'Auth traffic and service map', drawn: 'Security', checked: 'Engineering' },
  { id: 'overwing', det: [192, 532], fig: 'Trip, cabin and guest notes', drawn: 'Design', checked: 'Strategy' },
  { id: 'nightwell', det: [446, 416], focus: [560, 440], fig: 'Live sky and the night', drawn: 'Engineering', checked: 'Design' },
  { id: 'yours', blank: true, fig: 'Your screen', drawn: 'Yours', checked: 'Ours' },
];
export const COUNT = SET.length;
export const sheetNo = (k) => `05.${k + 1}`;

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const cell = (k, v, cls = '') => `<div class="s5-tb__c ${cls}"><span class="s5-tb__k">${k}</span><span class="s5-tb__v">${v}</span></div>`;

/** build the DOM of sheet k (positions come later, in layout) */
export function buildSheet(k) {
  const it = SET[k];
  const p = it.blank ? null : byId(it.id);
  const root = el('div', 's5-sheet');
  root.dataset.k = k;
  const paper = el('div', 's5-paper');
  paper.tabIndex = -1;
  if (p) {
    paper.setAttribute('role', 'img');
    paper.setAttribute('aria-label', `${p.name}, concept sheet ${sheetNo(k)}: ${p.kind}, shown in black and white at full size, with Detail A at twice size. Hover or focus shows its own colour. Made up to show the range, not a client.`);
    paper.style.setProperty('--acc', p.accent);
  } else {
    paper.setAttribute('aria-hidden', 'true');
  }
  const kind = p ? (p.form === 'phone' ? 'Phone' : 'Web') : '';
  paper.innerHTML = `
    <p class="s5-paper__fig mono">Fig. ${sheetNo(k)} · ${it.fig} · ${p ? 'Part view 1:1' : 'Blank'}</p>
    <div class="s5-win">${p ? '<canvas class="s5-c"></canvas><canvas class="s5-c s5-c--acc"></canvas>' : '<p class="s5-win__blank mono">Your screen<br>Size to suit</p>'}</div>
    ${p ? '<div class="s5-det"><canvas class="s5-c"></canvas><canvas class="s5-c s5-c--acc"></canvas></div>' : ''}
    <svg class="s5-anno" aria-hidden="true"></svg>
    ${p ? '<p class="s5-lab s5-lab--det mono">Detail A · 2:1</p><p class="s5-lab s5-lab--kp mono"></p>' : ''}
    ${p ? `<ol class="s5-notes mono"><li><b>Notes</b></li><li>1. Concept product, made up to show the range. Not a client.</li><li>2. Screen at 1:1, Detail A at 2:1, from the same drawing.</li><li>3. Black and white on the sheet; its own colour on hover or focus.</li></ol>` : ''}
    <div class="s5-tb mono">
      ${cell('Product', p ? `<span class="s5-tb__name">${p.name}</span>` : '<span class="s5-tb__name">Yours</span>', 's5-tb__c--name')}
      ${cell('Concept sheet', p ? 'Made up to show the range, not a client.' : 'Left blank for your project.', 's5-tb__c--note')}
      ${cell('Kind', p ? p.kind : 'To be drawn', 's5-tb__c--kind')}
      ${cell('Industry', p ? p.industry : 'Yours', 's5-tb__c--ind')}
      ${cell('Sheet', `<b>${sheetNo(k)}</b> / 05.${COUNT}`, 's5-tb__c--sheet')}
      ${cell('Scale', p ? '1:1<span class="s5-dsk"> · A 2:1</span>' : 'To suit', 's5-tb__c--scale')}
      ${cell('Drawn', it.drawn, 's5-tb__c--drawn')}
      ${cell('Checked', it.checked, 's5-tb__c--checked')}
      ${cell(p ? 'Own colour' : 'Form', p ? `<i class="s5-sw" aria-hidden="true"></i><span class="s5-sw__off">On hover</span><span class="s5-sw__on">${p.accent.toUpperCase()}</span>` : 'Phone, web or both', 's5-tb__c--sw')}
    </div>`;
  root.appendChild(paper);
  return { root, paper, it, p, kind, k, canvases: null, g: null, rendered: '', accDone: '' };
}

/**
 * place everything inside sheet s for a paper of pw x ph CSS px.
 * small: phone layout (part view only, no detail circle). Returns the geometry it used.
 */
export function layoutSheet(s, pw, ph, R, small) {
  const { paper, it, p } = s;
  const pad = small ? 0.75 * R : 1.5 * R;
  const tb = paper.querySelector('.s5-tb');
  const tbH = tb.offsetHeight || (small ? 3.6 * R : 5.6 * R);
  const winTop = pad + (small ? 1.5 * R : 2.9 * R);
  const winLeft = pad + (small ? 0 : 1.6 * R);
  const phone = p && p.form === 'phone';
  let ww, wh;
  if (small) {
    ww = Math.round(pw - 2 * pad);
    wh = Math.round(ph - winTop - pad - tbH - 0.75 * R);
  } else if (phone || !p) {
    ww = p ? 390 : Math.round(24.375 * R);
    wh = Math.round(Math.min(p ? 844 : 9e9, ph - winTop - pad - 0.4 * R));
  } else {
    ww = Math.round(Math.min(36 * R, pw * 0.6));
    wh = Math.round(ph - winTop - pad - tbH - 1.1 * R);
  }
  if (p) { ww = Math.min(ww, p.w); wh = Math.min(wh, p.h); }
  // part view region, in logical px (= CSS px, 1:1)
  let crop = null, det = null, D = 0, dc = null, kp = null;
  if (p) {
    const [fx, fy] = it.focus || it.det;
    let x0 = Math.round(Math.min(Math.max(fx - ww / 2, 0), p.w - ww));
    let y0;
    const at = small ? it.m : it.at;
    if (at) {
      // an explicit origin, so the cut falls on the screen's own rules rather than through a line of text
      x0 = Math.round(Math.min(Math.max(at[0], 0), p.w - ww));
      y0 = Math.round(Math.min(Math.max(at[1], 0), p.h - wh));
    } else if (phone && !small) {
      // a phone reads from the top: start there unless Detail A would fall outside, then shift just enough
      y0 = Math.max(0, it.det[1] + 100 - wh);
      y0 = Math.round(Math.min(y0, p.h - wh));
    } else y0 = Math.round(Math.min(Math.max(fy - wh / 2, 0), p.h - wh));
    crop = { x: x0, y: y0, w: ww, h: wh };
    if (!small) {
      const rx0 = winLeft + ww + (phone ? 3.25 * R : 2.4 * R), rx1 = pw - pad;
      D = Math.round(Math.min(18 * R, rx1 - rx0 - (phone ? 7 * R : 0.5 * R), ph * 0.42));
      dc = { x: rx0 + D / 2 + (phone ? 0.5 * R : (rx1 - rx0 - D) / 2), y: winTop + 1.1 * R + D / 2 };
      // Detail A covers D/2 logical px across, shown at 2:1; kept inside the screen and inside the part view
      const r4 = D / 4;
      const clampTo = (v, a, b) => Math.min(Math.max(v, a), b);
      det = {
        x: clampTo(it.det[0], Math.max(r4, x0 + r4 + 2), Math.min(p.w - r4, x0 + ww - r4 - 2)),
        y: clampTo(it.det[1], Math.max(r4, y0 + r4 + 2), Math.min(p.h - r4, y0 + wh - r4 - 2)),
        r: r4,
      };
      const ks = phone ? 6 : 10;
      const kw = p.w / ks, kh = p.h / ks;
      if (phone) {
        // on a phone sheet Detail A sits level with its marker, so the leader runs short and flat
        const my = winTop + det.y - y0;
        dc.y = Math.min(Math.max(my, winTop + 1.1 * R + D / 2), ph - pad - tbH - 2.8 * R - D / 2);
        kp = { x: rx1 - kw - 0.4 * R, y: Math.max(winTop + 1.1 * R, dc.y - kh / 2), w: kw, h: kh, s: ks };
      } else kp = { x: dc.x - kw / 2, y: dc.y + D / 2 + 3.1 * R, w: kw, h: kh, s: ks };
    }
  }
  s.g = { pw, ph, pad, winTop, winLeft, ww, wh, crop, det, D, dc, kp, small, R, phone, tbH };
  // place the DOM parts
  const win = paper.querySelector('.s5-win');
  Object.assign(win.style, { left: `${winLeft}px`, top: `${winTop}px`, width: `${ww}px`, height: `${wh}px` });
  const dEl = paper.querySelector('.s5-det');
  if (dEl) {
    dEl.style.display = small ? 'none' : '';
    if (!small) Object.assign(dEl.style, { left: `${dc.x - D / 2}px`, top: `${dc.y - D / 2}px`, width: `${D}px`, height: `${D}px` });
  }
  const ld = paper.querySelector('.s5-lab--det');
  if (ld) { ld.style.display = small ? 'none' : ''; if (!small) Object.assign(ld.style, { left: `${dc.x}px`, top: `${dc.y + D / 2 + 0.7 * R}px` }); }
  const lk = paper.querySelector('.s5-lab--kp');
  if (lk) {
    lk.style.display = small ? 'none' : '';
    if (!small) { lk.textContent = `Key plan · 1:${kp.s}`; Object.assign(lk.style, { left: `${kp.x + kp.w / 2}px`, top: `${kp.y + kp.h + 0.6 * R}px` }); }
  }
  const notes = paper.querySelector('.s5-notes');
  if (notes) {
    const show = !small && phone;
    notes.style.display = show ? '' : 'none';
    if (show) {
      // the notes go wherever the leader is not: above Detail A when it sits low, under it otherwise
      const nx = winLeft + ww + 3.25 * R;
      notes.style.width = `${Math.min(24 * R, pw - pad - nx)}px`;
      const nh = notes.offsetHeight || 7 * R;
      const above = dc.y - D / 2 - 1.6 * R - nh >= winTop + 0.4 * R;
      const top = above ? winTop + 0.4 * R : dc.y + D / 2 + 3.4 * R;
      // never under the title block: if there is no room, the notes stay off (the title block says it too)
      const fits = above || top + nh <= ph - pad - tbH - 0.6 * R;
      notes.style.display = fits ? '' : 'none';
      Object.assign(notes.style, { left: `${nx}px`, top: `${top}px` });
    }
  }
  drawAnno(s);
  return s.g;
}

/** dimension lines, break marks, Detail A marker + leader, key plan: one SVG over the paper */
function drawAnno(s) {
  const { paper, g, p } = s;
  const svg = paper.querySelector('.s5-anno');
  svg.setAttribute('viewBox', `0 0 ${g.pw} ${g.ph}`);
  svg.textContent = '';
  const add = (tag, attrs) => svg.appendChild(svgEl(tag, attrs));
  const { winLeft: L, winTop: T, ww, wh, crop, R } = g;
  const Rt = L + ww, B = T + wh;
  // window outline: product edges solid, cut edges with a break mark at their middle
  const cut = crop ? { t: crop.y > 0, b: crop.y + crop.h < p.h, l: crop.x > 0, r: crop.x + crop.w < p.w } : { t: false, b: false, l: false, r: false };
  const zz = 5;
  const hEdge = (y, isCut) => isCut
    ? `M${L} ${y}H${L + ww / 2 - zz}L${L + ww / 2 - zz / 2} ${y - zz * 1.6}L${L + ww / 2 + zz / 2} ${y + zz * 1.6}L${L + ww / 2 + zz} ${y}H${Rt}`
    : `M${L} ${y}H${Rt}`;
  const vEdge = (x, isCut) => isCut
    ? `M${x} ${T}V${T + wh / 2 - zz}L${x + zz * 1.6} ${T + wh / 2 - zz / 2}L${x - zz * 1.6} ${T + wh / 2 + zz / 2}L${x} ${T + wh / 2 + zz}V${B}`
    : `M${x} ${T}V${B}`;
  add('path', { class: 'a-win', d: `${hEdge(T - 0.5, cut.t)}${hEdge(B + 0.5, cut.b)}${vEdge(L - 0.5, cut.l)}${vEdge(Rt + 0.5, cut.r)}` });
  if (!p) {
    // the blank sheet: centre lines through the empty view
    add('path', { class: 'a-centre', d: `M${L - 0.8 * R} ${T + wh / 2}H${Rt + 0.8 * R}M${L + ww / 2} ${T - 0.8 * R}V${B + 0.8 * R}` });
  }
  if (g.small) return;
  // dimension lines (logical px at 1:1)
  const dimH = (x1, x2, y, label) => {
    add('path', { class: 'a-ext', d: `M${x1} ${y - 0.3 * R}V${T - 0.25 * R}M${x2} ${y - 0.3 * R}V${T - 0.25 * R}` });
    add('path', { class: 'a-dim', d: `M${x1} ${y}H${x2}` });
    add('path', { class: 'a-arr', d: `M${x1} ${y}l7 -2.5v5zM${x2} ${y}l-7 -2.5v5z` });
    const t = add('text', { class: 'a-txt', x: (x1 + x2) / 2, y: y - 0.35 * R, 'text-anchor': 'middle' }); t.textContent = label;
  };
  const dimV = (y1, y2, x, label) => {
    add('path', { class: 'a-ext', d: `M${x - 0.3 * R} ${y1}H${L - 0.25 * R}M${x - 0.3 * R} ${y2}H${L - 0.25 * R}` });
    add('path', { class: 'a-dim', d: `M${x} ${y1}V${y2}` });
    add('path', { class: 'a-arr', d: `M${x} ${y1}l-2.5 7h5zM${x} ${y2}l-2.5 -7h5z` });
    const t = add('text', { class: 'a-txt', x: x - 0.4 * R, y: (y1 + y2) / 2, 'text-anchor': 'middle', transform: `rotate(-90 ${x - 0.4 * R} ${(y1 + y2) / 2})` }); t.textContent = label;
  };
  if (p) {
    dimH(L, Rt, T - 0.85 * R, `${ww}`);
    dimV(T, B, L - 0.85 * R, `${wh}`);
  } else {
    dimH(L, Rt, T - 0.85 * R, 'To suit');
    return;
  }
  // Detail A: marker on the part view, leader to the detail circle
  const { det, dc, D, kp } = g;
  const mx = L + det.x - crop.x, my = T + det.y - crop.y, mr = det.r;
  const ang = Math.atan2(dc.y - my, dc.x - mx);
  const sx = mx + Math.cos(ang) * mr, sy = my + Math.sin(ang) * mr;
  const ex = dc.x - Math.cos(ang) * (D / 2 + 2), ey = dc.y - Math.sin(ang) * (D / 2 + 2);
  const ba = ((s.it.ba ?? -135) * Math.PI) / 180;
  const bx = mx + Math.cos(ba) * (mr + 0.9 * R), by = my + Math.sin(ba) * (mr + 0.9 * R);
  const lead = `M${sx} ${sy}L${ex} ${ey}M${mx + Math.cos(ba) * mr} ${my + Math.sin(ba) * mr}L${bx - Math.cos(ba) * 0.62 * R} ${by - Math.sin(ba) * 0.62 * R}`;
  // a paper halo under the marker and leader, so they read on dark screens as well as light ones
  add('circle', { class: 'a-halo', cx: mx, cy: my, r: mr });
  add('path', { class: 'a-halo', d: lead });
  add('circle', { class: 'a-mark', cx: mx, cy: my, r: mr });
  add('path', { class: 'a-lead', d: lead });
  add('circle', { class: 'a-bub', cx: bx, cy: by, r: 0.62 * R });
  const bt = add('text', { class: 'a-txt a-txt--b', x: bx, y: by + 0.24 * R, 'text-anchor': 'middle' }); bt.textContent = 'A';
  // detail circle outline + its own centre marks
  add('circle', { class: 'a-detc', cx: dc.x, cy: dc.y, r: D / 2 + 0.5 });
  add('path', { class: 'a-ext', d: `M${dc.x - D / 2 - 0.6 * R} ${dc.y}H${dc.x - D / 2 + 0.2 * R}M${dc.x + D / 2 - 0.2 * R} ${dc.y}H${dc.x + D / 2 + 0.6 * R}M${dc.x} ${dc.y - D / 2 - 0.6 * R}V${dc.y - D / 2 + 0.2 * R}M${dc.x} ${dc.y + D / 2 - 0.2 * R}V${dc.y + D / 2 + 0.6 * R}` });
  // key plan: the whole screen in outline, the part view hatched, Detail A as a dot
  const k = kp.s;
  add('rect', { class: 'a-kp', x: kp.x, y: kp.y, width: kp.w, height: kp.h, rx: g.phone ? 6 : 0 });
  const cx = kp.x + crop.x / k, cy = kp.y + crop.y / k, cw = crop.w / k, chh = crop.h / k;
  const id = `s5kp${s.k}`;
  const defs = add('defs', {});
  const cp = svgEl('clipPath', { id }); cp.appendChild(svgEl('rect', { x: cx, y: cy, width: cw, height: chh })); defs.appendChild(cp);
  let hd = '';
  for (let t = -chh; t < cw; t += 4) hd += `M${cx + t} ${cy + chh}L${cx + t + chh} ${cy}`;
  add('path', { class: 'a-hatch', d: hd, 'clip-path': `url(#${id})` });
  add('rect', { class: 'a-kpv', x: cx, y: cy, width: cw, height: chh });
  add('circle', { class: 'a-kpd', cx: kp.x + det.x / k, cy: kp.y + det.y / k, r: 2.2 });
  const kt = add('text', { class: 'a-txt', x: kp.x + det.x / k + 4, y: kp.y + det.y / k - 4 }); kt.textContent = 'A';
  const size = add('text', { class: 'a-txt a-txt--g', x: kp.x + kp.w / 2, y: kp.y - 0.45 * R, 'text-anchor': 'middle' }); size.textContent = `${p.w} × ${p.h}`;
}

/** draw the product into the part view and Detail A (plain or accent); cached per size */
export function paintSheet(s, dpr, accent = false) {
  const { paper, p, g } = s;
  if (!p || !g) return;
  const key = `${g.ww}x${g.wh}@${g.crop.x},${g.crop.y}/${g.D}/${dpr}`;
  if (accent ? s.accDone === key : s.rendered === key) return;
  const idx = accent ? 1 : 0;
  const wc = paper.querySelectorAll('.s5-win .s5-c')[idx];
  drawRegion(p, g.crop, dpr, { accent, canvas: wc });
  if (!g.small && g.D) {
    const dcv = paper.querySelectorAll('.s5-det .s5-c')[idx];
    const half = g.D / 4;           // Detail A spans D/2 logical px; drawn at 2:1
    drawRegion(p, { x: g.det.x - half, y: g.det.y - half, w: half * 2, h: half * 2 }, Math.min(2 * dpr, 3), { accent, canvas: dcv });
  }
  if (accent) s.accDone = key; else { s.rendered = key; s.accDone = ''; }
}

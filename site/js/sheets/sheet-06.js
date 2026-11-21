// Sheet 06: Process. One machine drawing: a closed ring of six meshed gears (Diagnose, Draw, Build, Break, Hand over,
// Care; Care meshes back into Diagnose). Each stage's gear draws itself out of mesh, slides in, and the train turns;
// then everything stops for a reading moment. Break adds Detail B: one tooth in section, loaded until it cracks,
// redrawn, loaded again until it holds, with a pick failing on a pin stack in its margin.
// Entry (p 0 -> 1): two doors close from the sides onto one vertical hairline (whatever they cover inverts); in the
// black, that line becomes the axle of gear 1, which draws itself round it with its pitch circle and diameter; the
// doors open onto this sheet. render(p) is a pure function of p (true viewport heights, 0 .. units + 1).
import { chapter, span, ease, rem } from '../engine/kit.js';
import { Mech } from '../sheet06/mech.js';
import { Stress } from '../sheet06/stress.js';

const DEG = Math.PI / 180;

// ---- timeline (viewport heights) ----
// where each stage's spectacle starts (k = 0 is Diagnose) and where its reading moment ends
const STAGE_AT = [2.0, 4.0, 6.0, 8.0, 12.7, 14.7];
const READ_END = [4.0, 6.0, 8.0, 12.4, 14.7, 99];
const T = {
  close: [0, 0.36], shut: 0.36, collapse: [0.4, 0.48], g1: [0.43, 0.7], g1centre: [0.47, 0.56], g1pitch: [0.5, 0.6],
  pcd: [0.62, 0.69], reveal: 0.73, open: [0.74, 1.0],
  intro: [1.0, 2.0],
  diag: STAGE_AT[0],                              // Diagnose: the plan draws, gear 1 turns
  read: (k) => [STAGE_AT[k] + (k === 3 ? 3.4 : k === 5 ? 1.2 : 1.0), READ_END[k]],
  stress: 9.0, close6: 12.4,                      // Break: Detail B opens / closes
};
// the drive turns: [from, to, degrees of gear 1]
const TURNS = [[2.3, 2.95, 30], [4.62, 4.98, 36], [6.62, 6.98, 36], [8.62, 8.98, 36], [13.32, 13.68, 36], [15.32, 15.85, 120]];

function engage(p, k) {           // gear k (1..5): draws itself out of mesh, slides in
  const a = STAGE_AT[k];
  return { draw: span(p, a + 0.02, a + 0.4), slide: ease(span(p, a + 0.42, a + 0.6)), label: p >= a + 0.6 };
}

export function init(engine) {
  const section = document.getElementById('sheet-06');
  if (!section) return;
  const stage = section.querySelector('.chapter__stage');
  const sheet = section.querySelector('.s6__sheet');
  const svg = section.querySelector('.s6__mech');
  const detail = section.querySelector('.s6__detail');
  const reads = [...section.querySelectorAll('.s6-read')];
  const intro = reads[0], cards = reads.slice(1);
  const doorL = section.querySelector('.s6__door--l'), doorR = section.querySelector('.s6__door--r');
  const doors = section.querySelector('.s6__doors');
  const mech = new Mech(svg);
  const stress = new Stress(section.querySelector('.s6__stress'));
  let inset = null;

  function layout() {
    const r = stage.getBoundingClientRect();
    const W = r.width, H = r.height;
    const small = innerWidth < 1024, R = rem();
    if (engine.reduced) {
      const b = svg.getBoundingClientRect();
      mech.build(b.width, b.height, { x: R, y: R, w: b.width - 2 * R, h: b.height - 2 * R }, small);
      const db = detail.getBoundingClientRect();
      stress.build(db.width, db.height || db.width * 0.75);
      return;
    }
    const strip = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--strip-h')) * R || 36;
    let area;
    if (small) {
      const cardH = Math.max(...cards.map((c) => c.offsetHeight), intro.offsetHeight) || 260;
      const top = strip + 1.75 * R, bottom = H - 4.5 * R - cardH - 0.75 * R;
      area = { x: 0.75 * R, y: top, w: W - 1.5 * R, h: Math.max(220, bottom - top) };
    } else {
      const top = strip + 3 * R;
      area = { x: 4 * R, y: top, w: W * 0.585 - 4 * R, h: H - top - 3 * R };
    }
    mech.build(W, H, area, small);
    // Detail B sits over the ring, sized to the area
    const aspect = small ? 480 / 340 : 452 / 600;
    let iw = Math.min(area.w, small ? 9999 : 40 * R), ih = iw * aspect;
    if (ih > area.h) { ih = area.h; iw = ih / aspect; }
    const ix = area.x + (area.w - iw) / 2, iy = area.y + (area.h - ih) / 2;
    Object.assign(detail.style, { left: `${ix}px`, top: `${iy}px`, width: `${iw}px`, height: `${ih}px` });
    stress.build(iw, ih);
    const c = mech.callout;
    inset = { cx: c.cx - ix, cy: c.cy - iy, r0: c.R, r1: Math.hypot(Math.max(c.cx - ix, ix + iw - c.cx), Math.max(c.cy - iy, iy + ih - c.cy)) + 4 };
    // the doors meet on gear 1's axle
    const ax = Math.round(mech.axleX);
    doorL.style.width = `${ax}px`;
    Object.assign(doorR.style, { left: `${ax}px`, width: `${W - ax}px` });
  }

  function render(p) {
    if (!mech.built) return;
    // ---------- entry: the doors ----------
    const c = ease(span(p, ...T.close)), o = ease(span(p, ...T.open));
    const shut = p < T.open[0] ? c : 1 - o;
    doors.style.display = p < T.open[1] && shut > 0 ? '' : 'none';
    // each door crosses its own side of the axle in the same time, so they meet on it together
    doorL.style.transform = `translateX(${(-100 * (1 - shut)).toFixed(3)}%)`;
    doorR.style.transform = `translateX(${(100 * (1 - shut)).toFixed(3)}%)`;
    const on = p >= T.shut;
    sheet.style.visibility = on ? '' : 'hidden';
    sheet.classList.toggle('is-black', p < T.reveal);
    document.documentElement.classList.toggle('is-black-moment', p >= T.shut && p < T.open[0]);   // lead: hide the title block in the black

    // ---------- the drive angle ----------
    let theta = 0;
    for (const [a, b, d] of TURNS) theta += d * DEG * ease(span(p, a, b));

    // ---------- gears ----------
    const drawn = [span(p, ...T.g1), 0, 0, 0, 0, 0];
    const slide = [1, 0, 0, 0, 0, 0];
    const labels = [p >= STAGE_AT[0] + 0.75, false, false, false, false, false];
    for (let k = 1; k < 6; k++) { const e = engage(p, k); drawn[k] = e.draw; slide[k] = e.slide; labels[k] = e.label; }
    const d0 = T.diag;
    const centre = [span(p, ...T.g1centre), ...[1, 2, 3, 4, 5].map((k) => span(p, d0 + 0.05 + k * 0.06, d0 + 0.4 + k * 0.06))];
    const pitch = [span(p, ...T.g1pitch), ...[1, 2, 3, 4, 5].map((k) => span(p, d0 + 0.1 + k * 0.06, d0 + 0.5 + k * 0.06))];

    // ---------- Break: Detail B ----------
    const b = T.stress, e6 = T.close6;
    const inBreak = p >= b && p < e6 + 0.3;
    const dim = p < e6 ? ease(span(p, b + 0.1, b + 0.3)) : 1 - ease(span(p, e6 + 0.1, e6 + 0.3));
    const callout = p < e6 + 0.25 ? span(p, b, b + 0.22) : 0;
    const open = p < e6 ? ease(span(p, b + 0.25, b + 0.5)) : 1 - ease(span(p, e6 + 0.02, e6 + 0.22));
    detail.style.visibility = inBreak && open > 0 ? 'visible' : 'hidden';
    if (inset && open > 0) detail.style.clipPath = open >= 1 ? 'none' : `circle(${(inset.r0 + (inset.r1 - inset.r0) * open).toFixed(1)}px at ${inset.cx.toFixed(1)}px ${inset.cy.toFixed(1)}px)`;
    detail.classList.toggle('is-txt', p >= b + 0.5 && p < e6);
    if (inBreak) {
      const lift = p < b + 0.85 ? 0 : p < b + 1.05 ? ease(span(p, b + 0.85, b + 1.0))
        : p < b + 1.38 ? 1 - 0.22 * Math.sin(span(p, b + 1.05, b + 1.38) * Math.PI * 3) ** 2 : 1 - ease(span(p, b + 1.4, b + 1.5));
      let pickState = '';
      if (p >= b + 0.55) pickState = 'Probing';
      if (p >= b + 1.0) pickState = 'Spool pin · false set';
      if (p >= b + 1.5) pickState = 'No entry';
      stress.set({
        loadA: 1.2 * span(p, b + 0.55, b + 1.0), crack: span(p, b + 0.92, b + 1.1), release: span(p, b + 1.18, b + 1.28),
        redraw: span(p, b + 1.3, b + 1.65), loadB: 1.5 * span(p, b + 1.7, b + 2.15), done: p >= b + 2.2,
        enter: p < b + 1.6 ? ease(span(p, b + 0.55, b + 0.8)) : 1 - ease(span(p, b + 1.6, b + 1.85)), lift, pickState,
      });
    }

    // ---------- reading moments ----------
    let active = -1;
    intro.classList.toggle('is-on', p >= T.intro[0] && p < T.intro[1]);
    cards.forEach((card, k) => {
      const [a, z] = T.read(k);
      const shown = p >= a && p < z;
      card.classList.toggle('is-on', shown);
      if (shown) active = k;
    });

    mech.set({
      vline: [p >= T.shut - 0.01 && p < T.collapse[1], ease(span(p, ...T.collapse))],
      drawn, slide, centre, pitch, theta,
      plan: span(p, d0 + 0.05, d0 + 0.7), pcd: p < d0 ? span(p, ...T.pcd) : 0, pcdText: p >= T.pcd[1],
      labels: labels.map((l) => l && !inBreak), active, dim, callout,
    });
  }

  function staticSet() {
    const all = [1, 1, 1, 1, 1, 1];
    mech.set({ vline: [false, 1], drawn: all, slide: all, centre: all, pitch: all, theta: 0, plan: 1, pcd: 0, pcdText: false,
      labels: all.map(Boolean), active: -1, dim: 0, callout: 1 });
    stress.set({ loadA: 1.2, crack: 1, release: 1, redraw: 1, loadB: 1.5, done: true, enter: 0, lift: 0, pickState: 'No entry' });
  }

  const ch = chapter(engine, section, {
    render,
    layout: () => { layout(); if (engine.reduced) staticSet(); },
    // reduced motion: the whole machine finished, all six stages and Detail B as calm static content
    reduced: () => { reads.forEach((r) => r.classList.add('is-on')); detail.classList.add('is-txt'); },
  });
  const relayout = () => { layout(); if (engine.reduced) staticSet(); else render(ch.progress()); };
  document.fonts?.ready.then(relayout);
  engine.on('theme', relayout);
}

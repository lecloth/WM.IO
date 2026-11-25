// Detail B: page 3's handover into page 4, a different form from page 1's box (Part 5 "Motion devices"): a hairline
// circle with its mono label on a leader line, as on a drawing ("DETAIL B"). Page 4 is already there behind it, at
// full scale, seen through the circle as it rises; then the circle holds (pinned) and grows until it is page 4's stage.
//   the tail: 100lvh pinned stage + G (90lvh) of growing; page 4 starts G below the tail's top (margin-top -100lvh)
// Reduced motion: none of this (CSS hides the circle; page 4 follows in normal flow).
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

export function initCalloutB(engine) {
  const p3 = document.getElementById('page-03'), p4 = document.getElementById('page-04');
  if (!p3 || !p4 || engine.reduced) return null;
  const tail = p3.querySelector('.p3__tail'), pin = p3.querySelector('.p3__pin'), more = p3.querySelector('.p3__more');
  const call = p3.querySelector('.p3-callout'), circ = call.querySelector('.p3-callout__c'), lead = call.querySelector('.p3-callout__lead'), tag = call.querySelector('.p3-callout__tag');
  const p4In = p4.querySelector('.stub__in');
  let W = 1, H = 1, r0 = 100, cx = 0, cy = 0, R = 1000, side = 1, lab = null, on = null, drawn = false, raf = 0, now = null;

  function layout() {
    W = innerWidth; H = innerHeight;
    const desktop = W >= 1024;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    r0 = desktop ? Math.min(13 * rem, H * 0.3) : Math.min(W * 0.37, 150);
    // aim at page 4's own content (as it sits when fixed at the top), below the closing line, clear of the edges
    let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
    const pr = p4In.getBoundingClientRect();
    [...p4In.children].forEach((c) => { const q = c.getBoundingClientRect(); if (!q.height) return; l = Math.min(l, q.left); r = Math.max(r, q.right); t = Math.min(t, q.top - pr.top); b = Math.max(b, q.bottom - pr.top); });
    const tb = document.querySelector('.titleblock')?.getBoundingClientRect();
    const bottomInset = Math.max(0, pin.offsetHeight - H) + (tb && tb.height ? Math.max(0, H - tb.top) : 0);
    const textBottom = more.offsetTop + more.offsetHeight;
    const tx = l < r ? (desktop ? Math.max((l + r) / 2, W * 0.62) : (l + r) / 2) : W / 2, ty = t < b ? (t + b) / 2 : H / 2;
    cx = clamp(tx, r0 + 16, W - r0 - 16);
    const loY = desktop ? r0 + 64 : textBottom + r0 + 56, hiY = H - bottomInset - r0 - 24;
    cy = clamp(ty, loY, Math.max(loY, hiY));
    if (desktop && cx - r0 < more.offsetLeft + more.offsetWidth + 48) cy = Math.max(cy, textBottom + r0 + 56);
    R = Math.max(...[[0, 0], [W, 0], [0, pin.offsetHeight], [W, pin.offsetHeight]].map(([x, y]) => Math.hypot(x - cx, y - cy))) + 2;
    // the label: try out to the right, then the left, at a few angles on the upper rim; first one that fits wins
    const tw = tag.offsetWidth + 8;
    lab = null;
    for (const [sd, deg] of [[1, -45], [-1, -135], [1, -70], [-1, -110], [1, -95], [-1, -85]]) {
      const a = deg * Math.PI / 180, ex = cx + Math.cos(a) * r0, ey = cy + Math.sin(a) * r0, kx = ex + sd * 22, ky = ey - 26;
      const x0 = sd > 0 ? kx : kx - tw, x1 = sd > 0 ? kx + tw : kx;
      if (x0 >= 12 && x1 <= W - 12 && ky - 18 > (desktop ? 0 : textBottom + 8)) { lab = { sd, a }; break; }
    }
    if (!lab) lab = { sd: 1, a: -Math.PI / 2 };
    side = lab.sd;
    now = null; on = null; frame();
  }

  function setOn(v) {
    if (v === on) return; on = v;
    call.classList.toggle('on', v); p4.classList.toggle('is-callout', v);
    if (!v) { p4In.style.clipPath = ''; }
  }

  function frame() {
    raf = 0;
    const pr = pin.getBoundingClientRect(), tr = tail.getBoundingClientRect();
    const G = tail.offsetHeight - pin.offsetHeight;
    const q = clamp(-tr.top / G);
    const y = pr.top + cy;                                  // the circle rides with the stage until it pins
    const visible = y - r0 < H && tr.top > -G + 0.5;        // from the moment its top shows until page 4 has arrived
    setOn(visible);
    if (!visible) return;
    if (!drawn && y + r0 * 0.4 < H) { drawn = true; call.classList.add('is-drawn'); }
    const g = ease(span(q, 0.04, 0.96));
    const r = lerp(r0, R, g);
    const key = `${y.toFixed(1)}|${r.toFixed(1)}`; if (key === now) return; now = key;
    p4In.style.clipPath = `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${y.toFixed(1)}px)`;
    circ.setAttribute('cx', cx.toFixed(1)); circ.setAttribute('cy', y.toFixed(1)); circ.setAttribute('r', Math.max(0, r - 0.5).toFixed(1)); circ.style.setProperty('--c', `${(2 * Math.PI * Math.max(0, r - 0.5) + 2).toFixed(1)}px`);
    circ.style.opacity = String(1 - span(g, 0.7, 1));
    // the label: a leader from the circle's edge (up and out), a shelf, the mono words on it
    const a = lab ? lab.a : -Math.PI / 4;
    const ex = cx + Math.cos(a) * r, ey = y + Math.sin(a) * r, kx = ex + side * 22, ky = ey - 26;
    const tw = tag.offsetWidth, th = tag.offsetHeight;
    const sx = side > 0 ? kx + tw + 4 : kx - tw - 4;
    lead.setAttribute('d', `M${ex.toFixed(1)} ${ey.toFixed(1)} L${kx.toFixed(1)} ${ky.toFixed(1)} L${sx.toFixed(1)} ${ky.toFixed(1)}`);
    tag.style.transform = `translate(${(side > 0 ? kx + 2 : sx + 2).toFixed(1)}px, ${(ky - th - 3).toFixed(1)}px)`;
    const out = String(1 - span(g, 0, 0.18));
    lead.style.opacity = drawn ? out : ''; tag.style.opacity = drawn ? out : '';
    more.style.opacity = String(1 - span(g, 0, 0.22));
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(layout));
  engine.on('theme', () => requestAnimationFrame(layout));
  engine.ScrollTrigger.addEventListener('refresh', () => requestAnimationFrame(layout));
  document.fonts?.ready.then(layout);
  layout();
  // page 4's first paint as a clipped fixed layer happens now, not on the circle's first frame
  p4.classList.add('is-callout'); p4In.style.opacity = '0.01';
  requestAnimationFrame(() => requestAnimationFrame(() => { p4In.style.opacity = ''; if (!on) p4.classList.remove('is-callout'); }));
  return { layout, frame, state: () => ({ on, drawn, cx, cy, r0, R }) };
}

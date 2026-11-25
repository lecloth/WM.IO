// Page 4, how we work (Part 5 "Finish the site", stage 10). The one lock (page 3's, in X-ray) turns side-on and becomes a
// 2D cutaway, drawn here as hairlines (SVG) on the blue ground:
//   the obvious key goes in, its cuts lift the pins to the wrong heights, the plug won't turn: it fails;
//   then the lock is picked, pin by pin: SEVEN pins, one per verb of page 1's drum, in the drum's order. As each pin sets
//   on the shear line its verb stays beside it (a mono label on a leader) and, while it is the newest, its signed-off
//   meaning shows under the lock on a leader; the plug turns on the last pin.
// The verbs and meanings are read from page 1's own list (.p1-steps), never retyped. The section is a drawn schematic of
// the real Cutaway Lock's pin stack (shear line, key pins, drivers, springs), extended from its five chambers to seven,
// one per verb (stated on the page's sr text and in STATE.md). Units: 1 unit = the cutaway's scale; y up, the shear line
// at y = 0, the face (where the key goes in) on the right.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const ease2 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

export const LEN4 = 4.0;   // screens of scroll
export const T = { turn: [0, 0.7], draw: [0.45, 0.85], line1: [0.85, 1.35], keyIn: [0.95, 1.25], keyLift: [1.25, 1.35], line2: [1.4, 1.95], shake: [1.4, 1.65], keyOut: [1.75, 1.95],
  line3: [2.0, 2.3], tool: [2.15, 2.35], pick: [2.35, 3.6], turnPlug: [3.6, 3.9] };
const PITCH = 10, N = 7, X0 = 10;                       // the seven chambers
const XS = Array.from({ length: N }, (_, i) => X0 + i * PITCH);
const LK = [3.2, 4.6, 2.6, 4.0, 3.6, 2.9, 4.3];         // the key pins' lengths
const ERR = [2.2, -1.9, 1.7, -2.3, 1.2, -1.6, 2.5];     // the wrong key's cuts, off by these
const KW = -5, PLUG = [-12, 0], LD = 7, TOP = 19, HOUSE = [-3, 82, -15, 21];
export const BOX = { x0: -4, x1: 104, y0: -26, y1: 22 };  // everything drawn, tool and wrench included

/** reads the seven steps from page 1's list */
export function readSteps() {
  return [...document.querySelectorAll('#page-01 .p1-steps li')].map((li) => ({ verb: li.querySelector('.p1-steps__verb').textContent.trim(), mean: li.querySelector('.p1-steps__mean').textContent.trim() }));
}

export function createCutaway(host, { steps = readSteps() } = {}) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'p4c'); svg.setAttribute('aria-hidden', 'true');
  host.append(svg);
  const g = document.createElementNS(NS, 'g'); svg.append(g);
  const el = (tag, cls) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); g.append(e); return e; };
  // static: the housing, the plug, the keyway, the chambers, the shear line
  const house = el('path', 'p4c__l'), plug = el('path', 'p4c__l'), keyway = el('path', 'p4c__l p4c__f'), chambers = el('path', 'p4c__l p4c__f'), shear = el('path', 'p4c__l p4c__d');
  const pins = XS.map(() => ({ key: el('path', 'p4c__l'), drv: el('path', 'p4c__l'), spr: el('path', 'p4c__l p4c__f') }));
  const keyEl = el('path', 'p4c__l'), pick = el('path', 'p4c__l'), wrench = el('path', 'p4c__l'), turnArc = el('path', 'p4c__l');
  // DOM labels: a verb per pin (vertical mono, on a leader), the newest meaning under the lock (on a leader)
  const leaders = XS.map(() => el('path', 'p4c__l p4c__ld')), mLeader = el('path', 'p4c__l p4c__ld');
  const verbs = steps.map((s) => { const v = document.createElement('p'); v.className = 'p4v mono'; v.textContent = s.verb; host.append(v); return v; });
  const block = document.createElement('div'); block.className = 'p4m'; block.innerHTML = '<p class="p4m__v display gt"></p><p class="p4m__t gt gt-h"></p>'; host.append(block);
  const bv = block.querySelector('.p4m__v'), bt = block.querySelector('.p4m__t');
  let k = 4, ox = 0, oy = 0, W = 1, H = 1, u = 20, labelTop = 0, blockTop = 0, shown = -1;
  const X = (x) => ox + x * k, Y = (y) => oy - y * k;
  const R = (x0, y0, x1, y1) => `M${X(x0)} ${Y(y0)}H${X(x1)}V${Y(y1)}H${X(x0)}Z`;
  const f = (v) => +v.toFixed(2);

  /** box: where the cutaway goes on screen (CSS px): { left, width, top } and the label rows */
  function layout(w, h, opts) {
    W = w; H = h; u = opts.u;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const width = opts.width; k = width / (BOX.x1 - BOX.x0);
    ox = opts.left - BOX.x0 * k; oy = opts.cy;                // the shear line on the screen
    labelTop = opts.labelBase; blockTop = opts.blockTop;
    house.setAttribute('d', R(HOUSE[0], HOUSE[2], HOUSE[1], HOUSE[3]));
    keyway.setAttribute('d', `M${X(1)} ${Y(KW)}H${X(80)}M${X(1)} ${Y(PLUG[0] + 1.5)}H${X(80)}M${X(1)} ${Y(KW)}V${Y(PLUG[0] + 1.5)}`);
    chambers.setAttribute('d', XS.map((x) => `M${X(x - 2.6)} ${Y(KW)}V${Y(TOP)}H${X(x + 2.6)}V${Y(KW)}`).join(''));
    shear.setAttribute('d', `M${X(0)} ${Y(0)}H${X(80)}`);
    verbs.forEach((v, i) => { v.style.left = `${f(X(XS[i]))}px`; v.style.top = `${f(labelTop - v.offsetHeight)}px`; });   // their feet on one line, two cells over the lock
    block.style.left = `${opts.blockLeft}px`; block.style.top = `${f(blockTop)}px`; block.style.width = `${opts.blockWidth}px`;
  }

  /** t: screens into page 4 (0 .. LEN4). Returns what the type check needs */
  function update(t) {
    // the plug, turned on the last pin: its key pins fold towards the plug's middle (seen side-on as it turns)
    const turn = ease(span(t, ...T.turnPlug)), ct = Math.cos(turn * Math.PI / 2);
    plug.setAttribute('d', R(0, PLUG[0], 80, PLUG[1]));
    // the key: in, lifts the pins to its (wrong) cuts, shakes, out
    const kin = ease(span(t, ...T.keyIn)), kout = ease(span(t, ...T.keyOut)), kx = lerp(110, 0, kin) + lerp(0, 110, kout), lift = ease2(span(t, ...T.keyLift)) * (1 - kout);
    const shake = Math.sin(span(t, ...T.shake) * Math.PI * 4) * 0.8 * (1 - span(t, T.shake[1] - 0.05, T.shake[1])) * (t > T.shake[0] ? 1 : 0);
    const keyOn = t > T.keyIn[0] && t < T.keyOut[1];
    keyEl.style.opacity = keyOn ? '1' : '0';
    if (keyOn) {
      const top = XS.map((x, i) => [x, KW + (5 - LK[i] + ERR[i]) * 1]);
      let d = `M${X(kx + 86)} ${Y(PLUG[0] + 2)}H${X(kx + 2)}V${Y(KW - 1)}`;
      top.forEach(([x, y]) => { d += `L${X(kx + x - 3)} ${Y(KW - 1)}L${X(kx + x)} ${Y(y - LK[0] * 0 - 0)}L${X(kx + x + 3)} ${Y(KW - 1)}`; });
      d += `H${X(kx + 86)}`; keyEl.setAttribute('d', d);
    }
    // the pick: the tension wrench at the face, the pick's tip under the pin being set
    const tool = ease2(span(t, ...T.tool)), pickT = span(t, ...T.pick) * N, cur = Math.min(N - 1, Math.floor(pickT)), within = pickT - cur;
    const setCount = t >= T.pick[1] ? N : Math.floor(pickT + (within > 0.55 ? 1 : 0)) - (within > 0.55 ? 0 : 0);
    wrench.style.opacity = tool > 0.01 ? String(tool) : '0';
    wrench.setAttribute('d', `M${X(lerp(104, 78, tool))} ${Y(PLUG[0] + 3)}H${X(lerp(118, 92, tool))}V${Y(PLUG[0] - 12)}`);
    const picking = t > T.tool[0] && t < T.turnPlug[0];
    pick.style.opacity = picking ? String(tool) : '0';
    const tipX = picking ? XS[cur] : 104, raise = picking ? Math.sin(Math.min(1, within / 0.55) * Math.PI / 2) : 0;
    // each pin: rest, lifted by the key, lifted by the pick, set (its driver above the shear line, its key pin back down)
    let newest = -1;
    XS.forEach((x, i) => {
      const correct = 5 - LK[i];
      let up = lift * (correct + ERR[i]);                         // the wrong key
      const set = t >= T.pick[1] || (picking && (i < cur || (i === cur && within >= 0.55)));
      if (picking && i === cur && within < 0.55) up = raise * correct;   // the pick lifts it to the line
      if (set) newest = i;
      const kpBottom = KW + (set ? 0 : up), kpTop = kpBottom + LK[i];
      const drvBottom = set ? 0 : kpTop;
      const P = pins[i];
      // the key pin turns with the plug: seen side-on it shortens towards the plug's middle
      const mid = (PLUG[0] + PLUG[1]) / 2, kb = mid + (kpBottom - mid) * ct, kt = mid + (Math.min(kpTop, set ? 0 : kpTop) - mid) * ct;
      P.key.setAttribute('d', `M${X(x - 2.2)} ${Y(kt)}V${Y(kb + 1)}L${X(x)} ${Y(kb)}L${X(x + 2.2)} ${Y(kb + 1)}V${Y(kt)}Z`);
      P.drv.setAttribute('d', R(x - 2.2, drvBottom + shake * 0, x + 2.2, drvBottom + LD));
      const sb = drvBottom + LD, n = 6; let sp = `M${X(x)} ${Y(sb)}`;
      for (let j = 1; j <= n; j++) sp += `L${X(x + (j % 2 ? 1.8 : -1.8))} ${Y(sb + (TOP - sb) * (j - 0.5) / n)}`;
      sp += `L${X(x)} ${Y(TOP)}`; P.spr.setAttribute('d', sp);
      // its verb, once set: on a leader from the chamber's top
      verbs[i].classList.toggle('on', set);
      leaders[i].setAttribute('d', set ? `M${X(x)} ${Y(HOUSE[3])}V${f(labelTop + u / 2)}` : '');
    });
    pick.setAttribute('d', `M${X(118)} ${Y(PLUG[0] + 4)}H${X(tipX + 2)}L${X(tipX)} ${Y(KW - 1 + raise * (5 - LK[cur]))}`);
    plug.style.transform = `translateX(${shake * k}px)`;
    // the arc: the plug turning, at its face
    turnArc.setAttribute('d', turn > 0.01 ? `M${X(86)} ${Y(PLUG[0])}A${6 * k} ${6 * k} 0 0 0 ${X(86)} ${Y(PLUG[1])}` : '');
    // the newest meaning, under the lock, on a leader from its pin's foot
    if (newest !== shown) {
      shown = newest;
      if (newest >= 0) { bv.textContent = steps[newest].verb; bt.textContent = steps[newest].mean; }
      block.classList.toggle('on', newest >= 0);
    }
    mLeader.setAttribute('d', newest >= 0 ? `M${X(XS[newest])} ${Y(HOUSE[2]) + u / 2}V${f(blockTop - u / 2)}` : '');
    const drawn = span(t, ...T.draw);
    svg.style.opacity = String(ease2(drawn));
    return { newest, set: setCount, turn, drawn };
  }
  return { layout, update, svg, block, verbs, steps };
}

// Sheet 07: Studio.
//   p 0 -> 1   entry: sheet 06 folds down to title-block size and is filed away (sheet07/fold.js)
//   p 1 -> 3   the bench: Fig. 7 draws itself; this sheet travels its own route (drawn at 05 Strategy, checked at
//              01 Design, approved at 03 Security, filed). Reading moment: "A bench, not a body shop."
//   p 3 -> 5   the founder: the door opens and takes its one name. Reading moment: "One name on the door."
//              (p 4 -> 5 is held under sheet 08's entry)
// render(p) is a pure function of p; text is either on or off.
import { chapter, span, ease } from '../engine/kit.js';
import { createFold, FT } from '../sheet07/fold.js';
import { buildPlan } from '../sheet07/plan.js';

const T = {
  draw: [1.0, 1.5], labels: 1.42, bench: [1.0, 2.95],
  // the route: hold at each desk, travel between them
  route: [[1.55, 1.7], [2.05, 2.2], [2.5, 2.6], [2.85, 9]],     // [arrive, leave] per stop
  founder: 3.05, door: [3.05, 3.5], named: 3.45,
};

export function init(engine) {
  const section = document.getElementById('sheet-07');
  if (!section) return;
  const stage = section.querySelector('.chapter__stage');
  const sheet = section.querySelector('.s07__sheet');
  const readBench = section.querySelector('.s07__read--bench');
  const readFounder = section.querySelector('.s07__read--founder');
  const plan = buildPlan(section.querySelector('.s07__plan'), section.querySelector('.s07__labels'));
  const fold = createFold(section.querySelector('.s07__fold'));
  let fr = [0, 0.33, 0.66, 1];

  function routeAt(p) {
    // piecewise: hold at stop i during [arrive_i, leave_i], travel to stop i+1 during [leave_i, arrive_i+1]
    if (p < T.route[0][0]) return 0;
    for (let i = 0; i < 3; i++) {
      const [, leave] = T.route[i], [arrive] = T.route[i + 1];
      if (p < leave) return fr[i];
      if (p < arrive) return fr[i] + (fr[i + 1] - fr[i]) * ease(span(p, leave, arrive));
    }
    return 1;
  }

  function layout() {
    const tb = document.getElementById('titleblock')?.getBoundingClientRect();
    fold.layout(stage.clientWidth || innerWidth, stage.clientHeight || innerHeight, tb ? { left: tb.left, top: tb.top } : { left: innerWidth * 0.7, top: innerHeight * 0.85 });
    fr = plan.stopFractions();
  }

  let lastClip = '', prev06 = null;
  function setClip(v) { if (v !== lastClip) { lastClip = v; sheet.style.clipPath = v; } }

  function render(p) {
    // ---- entry: the fold ----
    // the old sheet's words leave as the first crease is drawn: a fold never cuts through text (freeze-frame rule)
    prev06 = prev06 || document.querySelector('#sheet-06 .chapter__stage');
    prev06?.classList.toggle('is-filing', p > FT.crease[0] && p < 1);
    const hole = p < 1 ? fold.render(p) : (fold.render(1), null);
    if (hole) {
      const { xh, yh, W, H } = hole;
      sheet.style.visibility = xh > 0.5 ? 'inherit' : 'hidden';
      setClip(`polygon(0 0, ${W}px 0, ${W}px ${yh.toFixed(1)}px, ${xh.toFixed(1)}px ${yh.toFixed(1)}px, ${xh.toFixed(1)}px ${H}px, 0 ${H}px)`);
    } else { sheet.style.visibility = 'inherit'; setClip('none'); }
    // ---- the bench ----
    plan.draw(span(p, ...T.draw));
    plan.labels(p >= T.labels);
    plan.route(p >= T.route[0][0] ? Math.max(1e-4, routeAt(p)) : 0);
    readBench.classList.toggle('is-on', p >= T.bench[0] && p < T.bench[1]);
    // ---- the founder ----
    readFounder.classList.toggle('is-on', p >= T.founder);
    plan.door(ease(span(p, ...T.door)), p >= T.named, p >= T.labels);
  }

  chapter(engine, section, {
    render, layout,
    reduced() {
      // finished state: the plan drawn, the route complete, the door named; both reading moments shown
      fold.render(1);
      sheet.style.visibility = 'inherit';
      layout();
      plan.draw(1); plan.labels(true); plan.route(1); plan.door(1, true);
      readBench.classList.add('is-on'); readFounder.classList.add('is-on');
    },
  });
}

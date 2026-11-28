// Page 4, how we work (Part 5 "Finish the site", stage 10). The section overlaps page 1's last screen (margin-top:
// -100lvh): its stage stays see-through until its top reaches the screen's top, which is the moment page 1's stage starts
// to scroll away, and then shows the very frame the security page's join ended on (dive.js JOIN: the lock face on, in
// X-ray on the blue ground). From there: the lock turns side-on into the 2D cutaway (turn.js), the obvious key fails,
// the lock is picked pin by pin (cutaway.js). Scrubbed by a lagged scroll position, as page 1: nothing pops, nothing jumps
// on release. Three short lines (drafts, flagged). Reduced motion: the finished cutaway and the three lines, in the flow.
// (28 Nov: was page03/page.js, which also drew round 9's lattice before page 4; that is retired, beats 1-5 replace it.)
import { createTurn } from './turn.js';
import { grid } from '../engine/grid.js';
import { createCutaway, LEN4, T as T4 } from './cutaway.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function initPage04(engine) {
  const sec = document.getElementById('page-04'); if (!sec) return null;
  const stage = sec.querySelector('.p4s__stage'), canvas = sec.querySelector('.p4s__gl'), lines = [...sec.querySelectorAll('.p4s__line')];
  const cut = createCutaway(sec.querySelector('.p4w'));
  const reduced = engine.reduced;
  const geom = () => {
    const strip = document.getElementById('strip')?.offsetHeight || 2 * grid.u, tb = document.querySelector('.titleblock')?.getBoundingClientRect();
    return { u: grid.u, strip, tbTop: tb && tb.height ? Math.min(innerHeight, tb.top) : innerHeight };
  };

  if (reduced) {
    // the finished cutaway in its own box (the verbs above it, the lock, the newest meaning under it), the three lines
    sec.classList.add('is-static');
    lines.forEach((l) => l.classList.add('on'));
    const staticCut = () => {
      const u = grid.u, desktop = innerWidth >= 1024, N = Math.round(innerWidth / u), host = sec.querySelector('.p4w');
      const width = desktop ? Math.min(40, Math.round(N * 0.5)) * u : (N - 2) * u, kk = width / 108, left = Math.round((innerWidth - width) / 2 / u) * u;
      const top = 6 * u + 21 * kk, h = Math.ceil((top + 26 * kk + 1.5 * u + 9 * u) / u) * u;
      host.style.height = `${h}px`;
      cut.layout(innerWidth, h, { u, width, left, cy: Math.round(top / u) * u, labelBase: Math.round(top / u) * u - 21 * kk - 2 * u, blockTop: Math.round((Math.round(top / u) * u + 26 * kk + 1.5 * u) / u) * u, blockLeft: left, blockWidth: width });
      cut.update(LEN4);
    };
    requestAnimationFrame(staticCut);
    addEventListener('resize', () => requestAnimationFrame(staticCut));
    return { reduced: true };
  }

  const turn = createTurn(canvas);
  const layout = () => {
    turn.layout(stage.clientWidth || innerWidth, stage.clientHeight || innerHeight);
    const u = grid.u, desktop = innerWidth >= 1024, N = Math.round(innerWidth / u), g = geom();
    const rT = Math.ceil((g.strip + u) / u - 1e-6);
    lines.forEach((l) => { l.style.left = `${(desktop ? 5 : 1) * u}px`; l.style.top = `${(rT + (desktop ? 2 : 1)) * u}px`; l.style.width = `${(desktop ? Math.min(26, N - 10) : N - 2) * u}px`; });
    // the cutaway: as wide as the screen allows (phones) or about half of it (desktop), whole cells, its shear line a
    // little above the middle; the verbs above it, the newest meaning under it. It sits under the three lines (they share
    // the screen while the key fails) and leaves room under it for the newest meaning, above the title block; on a short
    // screen it gets smaller
    const W = stage.clientWidth || innerWidth, H = stage.clientHeight || innerHeight;
    const linesBottom = Math.max(...lines.map((l) => parseFloat(l.style.top) + l.offsetHeight)) + 1.5 * u;
    const blockH = desktop ? 8 * u : 9 * u, room = g.tbTop - u - (linesBottom + u) - 1.5 * u - blockH;
    let width = desktop ? Math.min(54, Math.round(N * 0.6)) * u : (N - 2) * u;
    width = Math.max(10 * u, Math.min(width, Math.floor(room / 47 * 108 / u) * u));
    const left = Math.round((W - width) / 2 / u) * u, kk = width / 108;
    const cy = Math.max(Math.round((H / 2 - 2 * u) / u) * u, Math.ceil((linesBottom + u + 21 * kk) / u) * u);
    turn.setTurnTarget({ x: left + 43.5 * kk, y: cy - 3 * kk, w: 85 * kk });   // the cutaway's housing: its middle and length on screen
    cut.layout(W, H, { u, width, left, cy, labelBase: cy - 21 * kk - 2 * u, blockTop: Math.round((cy + 26 * kk + 1.5 * u) / u) * u, blockLeft: left, blockWidth: desktop ? Math.min(30, N - 10) * u : width });
  };

  let target = 0, S = 0, raf = 0, last = 0, live = false;
  const TAU = 0.1;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const d = target - S; S = Math.abs(d) > 2 || Math.abs(d) < 2e-4 ? target : S + d * (1 - Math.exp(-dt / TAU));
    paint();
    if (S !== target) raf = requestAnimationFrame(frame);
  }
  let out = null, outCut = null;
  function paint() {
    if (!live) return;
    out = turn.render(S);
    outCut = cut.update(S);
    lines.forEach((l, i) => { const [a, b] = [T4.line1, T4.line2, T4.line3][i]; l.classList.toggle('on', S >= a && S <= b); });
  }
  // the stage shows from the moment the section's top reaches the screen's top until its end has scrolled by
  function onScroll() {
    const r = sec.getBoundingClientRect(), on = r.top <= 0.5 && r.bottom > 0;
    if (on !== live) { live = on; stage.classList.toggle('is-on', on); }
    target = clamp(-r.top / innerHeight, 0, LEN4);
    if (live && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  const again = () => { layout(); S = target; onScroll(); paint(); };
  addEventListener('resize', again); grid.onChange(() => requestAnimationFrame(again)); engine.on('theme', again);
  // load once the visitor is past the opening (or sooner if they jump), compiled before it's needed
  let loading = false;
  const warm = () => { if (loading) return; loading = true; turn.load().then(() => { layout(); turn.render(0); onScroll(); paint(); }); };
  engine.on('opening:done', () => setTimeout(warm, 1500));
  onScroll(); layout();

  // for the tools: positions in page 4 (screens), its first frame, its drawn shapes for the type check
  const top = () => { let y = 0; for (let n = sec; n; n = n.offsetParent) y += n.offsetTop; return y; };
  window.__p4 = { turn, cut, yAt: (t) => top() + t * innerHeight, len: LEN4, T: T4, S: () => S, settled: () => !raf && Math.abs(target - S) < 1e-4, out: () => out, outCut: () => outCut };
  const prev = window.__drawn;
  window.__drawn = () => {
    const D = prev ? prev() : { lines: [], shapes: [], texts: [] };
    if (live && out?.lockBox) D.shapes.push({ ...out.lockBox, tag: 'p4:lock' });
    return D;
  };
  return { length: () => sec.offsetHeight / innerHeight };
}

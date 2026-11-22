// Style lab shell (Take 2). Builds one full-screen pane per option, swipes sideways between them on the phone,
// shows a group side by side on desktop, drives each option from its own vertical scroll, creates options lazily
// and only renders the visible ones. Options live in opt-*.js and export create(mount, ctx).
import { haptics } from './haptics.js';

const OPTIONS = [
  { code: 'A1', group: 'A', mod: './opt-a.js', look: 'matte', units: 3, line: 'Matte engineering render: hairline edges, mono labels.' },
  { code: 'A2', group: 'A', mod: './opt-a.js', look: 'material', units: 3, line: 'Its real metals on patent paper, with "Fig." callouts.' },
  { code: 'A3', group: 'A', mod: './opt-a.js', look: 'xray', units: 3, line: 'X-ray in cyanotype blue: see through it, white lines.', dark: true },
  { code: 'B1', group: 'B', mod: './opt-b.js', variant: 'dive', units: 5, line: 'Straight dive: through the keyhole, under the pins, out.', dark: true },
  { code: 'B2', group: 'B', mod: './opt-b.js', variant: 'section', units: 5, line: 'Cut open: ride along the pins as the key lifts them.' },
  { code: 'B3', group: 'B', mod: './opt-b.js', variant: 'tesseract', units: 6, line: 'Mind-bend: the lock repeats into a room of locks.', dark: true },
  { code: 'C1', group: 'C', mod: './opt-c.js', variant: 'flip', units: 0, line: 'Cards: tap one, it flips over to show what you get.' },
  { code: 'C2', group: 'C', mod: './opt-c.js', variant: 'build', units: 0, line: 'Pieces: each tap adds a piece to your project.' },
  { code: 'C3', group: 'C', mod: './opt-c.js', variant: 'slip', units: 0, line: 'Work slip: each tap prints your answer on a slip.' },
  { code: 'D1', group: 'D', mod: './opt-d.js', variant: 'plate', units: 3, line: 'The patent sheet splits and opens like two doors.' },
  { code: 'D2', group: 'D', mod: './opt-d.js', variant: 'corridor', units: 4, line: 'A corridor of real plates; fly through each doorway.', dark: true },
];
const GROUPS = { A: '3D assembly', B: 'Trip into the lock', C: 'For you', D: 'The door' };

const lab = document.getElementById('lab');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = () => matchMedia('(min-width: 1024px)').matches;
const panes = new Map();   // code -> { def, el, scroll, mount, texts, inst, loading, visible, p, ps }

// ---------- build the panes ----------
const groupEls = {};
const nav = document.querySelector('.bar__groups');
for (const g of Object.keys(GROUPS)) {
  const sec = document.createElement('section'); sec.className = 'grp'; sec.dataset.group = g; sec.setAttribute('aria-label', GROUPS[g]);
  lab.append(sec); groupEls[g] = sec;
  const b = document.createElement('button'); b.type = 'button'; b.textContent = g; b.title = GROUPS[g];
  b.addEventListener('click', () => go(OPTIONS.find((o) => o.group === g).code)); nav.append(b);
}
OPTIONS.forEach((def, i) => {
  const el = document.createElement('article');
  el.className = 'opt' + (def.dark ? ' is-dark' : ''); el.id = def.code; el.dataset.group = def.group;
  el.setAttribute('aria-label', `${def.code}: ${def.line}`);
  el.innerHTML = `
    <div class="opt__scroll" ${def.units ? 'tabindex="0"' : ''}>
      <div class="opt__stage"><div class="opt__mount"></div><div class="opt__texts"></div></div>
      ${def.units ? `<div class="opt__track" style="height:${def.units * 100}%"></div>` : ''}
    </div>
    <footer class="opt__cap">
      <b class="opt__code">${def.code}</b><span class="opt__line">${def.line}</span>${def.units ? '<span class="opt__cue mono" aria-hidden="true">Scroll<i></i></span>' : ''}
      <span class="opt__nav"><button type="button" data-d="-1" aria-label="Previous option" ${i === 0 ? 'disabled' : ''}>‹</button><button type="button" data-d="1" aria-label="Next option" ${i === OPTIONS.length - 1 ? 'disabled' : ''}>›</button></span>
    </footer>`;
  groupEls[def.group].append(el);
  const pane = { def, el, scroll: el.querySelector('.opt__scroll'), mount: el.querySelector('.opt__mount'), textsEl: el.querySelector('.opt__texts'),
    inst: null, loading: false, visible: false, p: 0, ps: reduced ? 1 : 0, texts: [] };
  panes.set(def.code, pane);
  el.querySelectorAll('.opt__nav button').forEach((b) => b.addEventListener('click', () => {
    haptics.tap(); go(OPTIONS[Math.max(0, Math.min(OPTIONS.length - 1, i + +b.dataset.d))].code);
  }));
  pane.scroll.addEventListener('scroll', () => { pane.dirty = true; }, { passive: true });
});

// ---------- navigation ----------
function go(code, instant = false) {
  const pane = panes.get(code); if (!pane) return;
  history.replaceState(null, '', '#' + code);
  if (desktop()) {
    for (const [g, sec] of Object.entries(groupEls)) sec.classList.toggle('on', g === pane.def.group);
    panes.forEach((p) => p.el.classList.toggle('is-target', p === pane));
  } else {
    lab.scrollTo({ left: pane.el.offsetLeft, behavior: instant ? 'instant' : 'smooth' });
  }
  markGroup(pane.def.group);
  refreshVisible();
}
function markGroup(g) { nav.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(b.textContent === g))); }
let snapTimer = 0;
lab.addEventListener('scroll', () => {
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    if (desktop()) return;
    const i = Math.round(lab.scrollLeft / lab.clientWidth), def = OPTIONS[i];
    if (def && location.hash !== '#' + def.code) { history.replaceState(null, '', '#' + def.code); markGroup(def.group); }
    refreshVisible();
  }, 90);
}, { passive: true });
addEventListener('hashchange', () => go(location.hash.slice(1)));
addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea')) return;
  const cur = OPTIONS.findIndex((o) => '#' + o.code === location.hash);
  if (e.key === 'ArrowRight' && cur < OPTIONS.length - 1) go(OPTIONS[cur + 1].code);
  if (e.key === 'ArrowLeft' && cur > 0) go(OPTIONS[cur - 1].code);
});

// ---------- lazy options: create when visible, dispose when far away (keeps GPU memory low on the phone) ----------
function refreshVisible() {
  const lr = lab.getBoundingClientRect();
  const visibleCodes = [];
  panes.forEach((pane) => {
    const r = pane.el.getBoundingClientRect();
    pane.visible = r.width > 0 && r.right > lr.left + 1 && r.left < lr.right - 1 && getComputedStyle(pane.el.parentElement).display !== 'none';
    if (pane.visible) visibleCodes.push(pane.def.code);
  });
  const near = new Set();
  visibleCodes.forEach((c) => { const i = OPTIONS.findIndex((o) => o.code === c); [i - 1, i, i + 1].forEach((j) => OPTIONS[j] && near.add(OPTIONS[j].code)); });
  panes.forEach((pane) => {
    const keep = desktop() ? pane.visible : near.has(pane.def.code);
    if (pane.visible && !pane.inst && !pane.loading) load(pane);
    if (!keep && pane.inst) { pane.inst.dispose?.(); pane.inst = null; pane.mount.replaceChildren(); pane.textsEl.replaceChildren(); }
  });
}
async function load(pane) {
  pane.loading = true;
  try {
    const mod = await import(pane.def.mod);
    if (!pane.visible && !desktop()) { pane.loading = false; return; }
    const ctx = { def: pane.def, haptics, reduced, el: pane.el, addText, addLabel: (html) => addLabel(pane, html), stage: pane.el.querySelector('.opt__stage') };
    function addText(t) {
      const d = document.createElement('div');
      d.className = `txt txt--${t.pos || 'bottom'}${t.plate !== false ? ' txt--plate' : ''}${t.dark ? ' txt--dark' : ''}`;
      d.innerHTML = `<span class="ph-tag">placeholder words</span>${t.eyebrow ? `<span class="txt__eyebrow mono">${t.eyebrow}</span>` : ''}${t.big ? `<p class="txt__big">${t.big}</p>` : ''}${t.body ? `<p class="txt__body">${t.body}</p>` : ''}`;
      pane.textsEl.append(d); pane.texts.push({ ...t, d });
    }
    pane.texts = [];
    pane.inst = await mod.create(pane.mount, ctx);
    pane.dirty = true; resizePane(pane);
  } catch (err) {
    console.error(pane.def.code, err);
    pane.mount.innerHTML = `<p class="lab-note mono">${pane.def.code} failed to load: ${String(err.message || err)}</p>`;
  }
  pane.loading = false;
}
function addLabel(pane, html) {
  const d = document.createElement('div'); d.className = 'lbl'; d.innerHTML = html; pane.el.querySelector('.opt__stage').append(d); return d;
}
function resizePane(pane) { if (!pane.inst) return; const r = pane.mount.getBoundingClientRect(); pane.inst.resize?.(r.width, r.height); pane.dirty = true; }
addEventListener('resize', () => { panes.forEach(resizePane); if (!desktop()) { const t = panes.get(location.hash.slice(1)); if (t) lab.scrollTo({ left: t.el.offsetLeft, behavior: 'instant' }); } refreshVisible(); });

// ---------- the loop: progress from each pane's own scroll, smoothed; render only what changed ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  panes.forEach((pane) => {
    if (!pane.visible || !pane.inst) return;
    const s = pane.scroll, max = s.scrollHeight - s.clientHeight;
    const p = reduced ? 1 : max > 0 ? s.scrollTop / max : 0;
    pane.p = p;
    pane.el.classList.toggle('is-moved', p > 0.01);
    const k = 1 - Math.exp(-dt * 9);                   // light smoothing: settles in about 0.3 s
    const ps = Math.abs(p - pane.ps) < 0.0005 ? p : pane.ps + (p - pane.ps) * k;
    const changed = ps !== pane.ps || pane.dirty;
    pane.ps = ps;
    if (changed || pane.inst.continuous) { pane.inst.render(ps, dt, now / 1000); pane.dirty = false; }
    // texts land only while the camera holds still at a stop
    const still = Math.abs(p - ps) < 0.004;
    pane.texts.forEach((t) => t.d.classList.toggle('on', ps >= t.from && ps <= t.to && (still || reduced)));
  });
  fpsTick(now);
  requestAnimationFrame(frame);
}

// ---------- frame-rate readout (frame times over the last 2 s) ----------
const fpsEl = document.getElementById('fps'); const ft = []; let fpsPrev = 0, fpsShown = 0;
function fpsTick(now) {
  if (fpsPrev) ft.push(now - fpsPrev); fpsPrev = now;
  while (ft.length > 240) ft.shift();
  if (now - fpsShown > 500 && ft.length > 20) {
    fpsShown = now;
    const sum = ft.reduce((a, b) => a + b, 0), s = [...ft].sort((a, b) => a - b);
    const fps = 1000 * ft.length / sum, p95 = s[Math.floor(s.length * 0.95)];
    fpsEl.textContent = `${fps.toFixed(0)} fps · p95 ${p95.toFixed(1)} ms`;
    window.__labFps = { fps, p95, worst: s[s.length - 1] };
  }
}

// ---------- enter: tap the point (unlocks vibration) ----------
const enter = document.getElementById('enter');
function doEnter() { haptics.unlock(); haptics.tap(14); enter.classList.add('is-gone'); document.querySelector('.opt__scroll')?.focus?.({ preventScroll: true }); }
enter.querySelector('button').addEventListener('click', doEnter);
if (new URLSearchParams(location.search).has('skip')) { enter.classList.add('is-gone'); haptics.unlock(); }

// ---------- start ----------
go(panes.has(location.hash.slice(1)) ? location.hash.slice(1) : 'A1', true);
document.fonts?.ready.then(() => panes.forEach((p) => { if (p.inst?.fonts) { p.inst.fonts(); p.dirty = true; } }));
requestAnimationFrame(frame);
window.__lab = { panes, go, haptics };

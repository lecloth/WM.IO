// C · "For you": the visitor taps what fits them, the page answers with what they get, and pre-ticks the checklist.
// Three animations: C1 flip cards, C2 pieces that build "your project", C3 a work slip that prints the answers.
// Pictures are real patent and book scans already in the site (CREDITS.md). All words are PLACEHOLDERS.
const M = '../../media/plates/', T = '../../media/take2/';
export const CHOICES = [
  { id: 'web', chip: 'A website', tick: 'Website', img: T + 'columbian-press-1852.webp', fig: 'Columbian hand press, 1852',
    get: ['A site that loads fast on any phone', 'Built to bring you enquiries', 'We keep it running after launch'] },
  { id: 'app', chip: 'An app', tick: 'App', img: T + 'dumoncel-1879-fig16.webp', fig: 'Bell’s telephone, cut open, 1879',
    get: ['An app your customers or staff open daily', 'iPhone and Android', 'Locked to your own devices if you need'] },
  { id: 'mess', chip: 'My systems are a mess', tick: 'Connect my systems', img: T + 'miller-1905-fig215.webp', fig: 'Paris switchboard, 1905',
    get: ['We map what you already have', 'Connect it into one place', 'Nothing falls between the gaps'] },
  { id: 'ai', chip: 'AI working for me', tick: 'AI that works', img: T + 'hughes-cards-fig6-7.webp', fig: 'Hughes’s Jacquard cards, engraving',
    get: ['Agents that answer, quote and book', 'On your own data', 'A person signs off the big calls'] },
  { id: 'sec', chip: 'Keep it secure', tick: 'Security check', img: M + 'sec-yale-us48475-fig4.webp', fig: 'Yale’s lock, 1865',
    get: ['We attack it before anyone else does', 'Fix what we find', 'Keep watching after'] },
];

const CSS = `
.c { position:absolute; inset:0; display:flex; flex-direction:column; background:var(--paper); }
.c__scroll { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:20px 16px 16px; scrollbar-width:none; }
.c__scroll::-webkit-scrollbar { display:none; }
.c__q { font-size:30px; line-height:1.05; letter-spacing:-.015em; font-weight:420; margin:6px 0 4px; }
.c__sub { color:var(--graphite); font-size:18px; margin-bottom:16px; }
.c__check { flex:none; display:flex; align-items:center; gap:8px; min-height:64px; padding:8px 16px; border-top:1px solid rgba(var(--ink-rgb),.16); background:var(--paper); margin-bottom:71px; overflow-x:auto; scrollbar-width:none; }
.c__check::-webkit-scrollbar { display:none; }
.c__check .mono { flex:none; color:var(--graphite); }
.c__ticks { display:flex; gap:6px; }
.c__tick { flex:none; display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 10px; border:1px solid var(--ink); border-radius:17px; font-family:var(--f-mono); font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
.c__tick::before { content:''; width:12px; height:7px; border-left:2px solid currentColor; border-bottom:2px solid currentColor; transform:rotate(-45deg) translate(1px,-2px); }
.c__empty { font-size:16px; color:var(--graphite); }
.c__fly { position:fixed; z-index:30; pointer-events:none; }
/* C1 flip cards */
.c1 { display:grid; gap:10px; }
.c1__card { position:relative; perspective:900px; min-height:76px; transition:min-height .42s var(--ease); }
.c1__card.is-on { min-height:248px; }
.c1__in { position:absolute; inset:0; transform-style:preserve-3d; transition:transform .55s var(--ease); }
.c1__card.is-on .c1__in { transform:rotateX(-180deg); }
.c1__face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; border:1px solid rgba(var(--ink-rgb),.3); background:var(--paper); display:flex; }
.c1__front { align-items:center; justify-content:space-between; padding:0 18px; font-size:22px; width:100%; text-align:left; }
.c1__front i { font-family:var(--f-mono); font-size:22px; font-style:normal; }
.c1__back { transform:rotateX(180deg); background:#111; color:#F2F0EB; padding:14px 16px; flex-direction:column; gap:8px; }
.c1__back img { height:92px; width:auto; max-width:100%; object-fit:contain; align-self:flex-start; background:#F2F0EB; padding:6px; }
.c1__back .mono { color:rgba(242,240,235,.7); font-size:11px; }
.c1__back ul { list-style:none; font-size:18px; line-height:1.3; }
.c1__back li::before { content:'— '; opacity:.6; }
/* C2 pieces */
.c2__stage { position:relative; height:236px; margin:0 0 10px; perspective:1000px; }
.c2__stack { position:absolute; left:30%; top:50%; width:138px; height:96px; transform-style:preserve-3d; transform:translate(-50%,-50%) rotateX(58deg) rotateZ(-38deg); }
.c2__base { position:absolute; inset:0; border:1px dashed rgba(var(--ink-rgb),.45); }
.c2__piece { position:absolute; inset:0; background:#F7F5F0; border:1px solid var(--ink); display:grid; place-items:center; overflow:hidden; box-shadow:0 0 0 1px rgba(var(--ink-rgb),.08); }
.c2__piece img { width:84%; height:84%; object-fit:contain; mix-blend-mode:multiply; }
.c2__piece.is-new { animation:c2drop .62s var(--ease) both; }
@keyframes c2drop { 0% { transform:translateZ(var(--z0)) ; opacity:0; } 15% { opacity:1; } 72% { transform:translateZ(calc(var(--z) - 3px)); } 100% { transform:translateZ(var(--z)); } }
.c2__names { position:absolute; right:0; top:0; bottom:0; width:40%; display:flex; flex-direction:column-reverse; justify-content:center; gap:4px; text-align:right; }
.c2__names b { font-family:var(--f-mono); font-size:11px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; }
.c2__empty { position:absolute; left:0; right:0; bottom:4px; text-align:center; color:var(--graphite); font-size:16px; }
.c__chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.c__chip { min-height:48px; padding:0 16px; border:1px solid var(--ink); border-radius:24px; font-size:18px; transition:background .2s, color .2s; }
.c__chip[aria-pressed="true"] { background:var(--ink); color:var(--paper); }
.c2__answer { border-top:1px solid rgba(var(--ink-rgb),.2); padding-top:12px; min-height:120px; }
.c2__answer h3 { font-family:var(--f-mono); font-weight:500; font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--graphite); margin-bottom:6px; }
.c2__answer ul { list-style:none; font-size:20px; line-height:1.3; }
.c2__answer li { animation:c2in .35s var(--ease) both; }
.c2__answer li:nth-child(2) { animation-delay:.06s; } .c2__answer li:nth-child(3) { animation-delay:.12s; }
@keyframes c2in { from { opacity:0; transform:translateY(6px); } }
/* C3 work slip */
.c3 { position:absolute; inset:0; display:flex; flex-direction:column; background:#E7E4DC; }
.c3__slot { flex:none; height:22px; margin:16px 16px 0; background:#111; border-radius:3px; position:relative; z-index:2; }
.c3__slot::after { content:''; position:absolute; left:10px; right:10px; bottom:6px; height:2px; background:#3a3a3a; }
.c3__out { flex:1; overflow:hidden; margin:0 28px; position:relative; }
.c3__slip { position:absolute; left:0; right:0; top:0; display:flex; flex-direction:column-reverse; background:#FBFAF6; box-shadow:0 1px 0 rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08); padding:14px 16px 18px; }
.c3__slip::after { content:''; position:absolute; left:0; right:0; bottom:-8px; height:8px; background:linear-gradient(-45deg, transparent 6px, #FBFAF6 0) 0 0/12px 8px, linear-gradient(45deg, transparent 6px, #FBFAF6 0) 0 0/12px 8px; }
.c3__head { font-family:var(--f-mono); font-size:12px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; display:flex; justify-content:space-between; border-bottom:1px dashed rgba(var(--ink-rgb),.4); padding-bottom:8px; margin-bottom:8px; }
.c3__row { padding:8px 0; border-bottom:1px dashed rgba(var(--ink-rgb),.25); }
.c3__row b { display:flex; gap:10px; align-items:center; font-family:var(--f-mono); font-size:14px; font-weight:500; letter-spacing:.04em; text-transform:uppercase; }
.c3__row b::before { content:'✓'; display:inline-grid; place-items:center; width:20px; height:20px; border:1.5px solid currentColor; font-size:13px; }
.c3__row p { font-size:18px; line-height:1.3; margin-left:30px; }
.c3__hint { color:var(--graphite); font-size:16px; padding:6px 0; }
.c3__chips { flex:none; padding:12px 16px 0; margin-bottom:71px; background:#E7E4DC; border-top:1px solid rgba(var(--ink-rgb),.14); }
.c3__chips .c__chips { margin-bottom:12px; }
`;
let styled = false;

export async function create(mount, ctx) {
  if (!styled) { const s = document.createElement('style'); s.textContent = CSS; document.head.append(s); styled = true; }
  const v = ctx.def.variant;
  const picked = new Set();
  const root = document.createElement('div'); mount.append(root);
  const head = `<span class="ph-tag">placeholder words</span><h2 class="c__q">What do you need?</h2><p class="c__sub">Tap everything that fits.</p>`;
  const checkBar = () => `<div class="c__check"><span class="mono">Your checklist</span><span class="c__ticks"></span><span class="c__empty">nothing ticked yet</span></div>`;
  const renderTicks = () => {
    const t = root.querySelector('.c__ticks'); if (!t) return;
    t.innerHTML = CHOICES.filter((c) => picked.has(c.id)).map((c) => `<span class="c__tick" data-id="${c.id}">${c.tick}</span>`).join('');
    root.querySelector('.c__empty').hidden = picked.size > 0;
  };
  // a tick that flies from the tapped thing into the checklist (FLIP)
  const fly = (fromEl, id) => {
    const to = root.querySelector(`.c__tick[data-id="${id}"]`); if (!to || ctx.reduced) return;
    const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
    const f = document.createElement('span'); f.className = 'c__tick c__fly'; f.textContent = to.textContent;
    f.style.left = b.left + 'px'; f.style.top = b.top + 'px'; document.body.append(f); to.style.opacity = 0;
    f.animate([{ transform: `translate(${a.left + a.width / 2 - b.left - b.width / 2}px, ${a.top + a.height / 2 - b.top - b.height / 2}px) scale(.8)`, opacity: .2 }, { transform: 'none', opacity: 1 }],
      { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => { f.remove(); to.style.opacity = ''; ctx.haptics.tick(12); };
  };
  const toggle = (id) => { picked.has(id) ? picked.delete(id) : picked.add(id); renderTicks(); return picked.has(id); };

  if (v === 'flip') {
    root.className = 'c';
    root.innerHTML = `<div class="c__scroll">${head}<div class="c1">${CHOICES.map((c) => `
      <div class="c1__card" data-id="${c.id}"><div class="c1__in">
        <button class="c1__face c1__front" type="button" aria-pressed="false">${c.chip}<i aria-hidden="true">+</i></button>
        <div class="c1__face c1__back" aria-hidden="true"><img src="${c.img}" alt="" loading="lazy"><span class="mono">${c.fig} · what you get</span><ul>${c.get.map((g) => `<li>${g}</li>`).join('')}</ul></div>
      </div></div>`).join('')}</div></div>${checkBar()}`;
    root.querySelectorAll('.c1__card').forEach((card) => {
      const flipIt = () => {
        ctx.haptics.tap();
        const on = toggle(card.dataset.id);
        card.classList.toggle('is-on', on);
        card.querySelector('.c1__front').setAttribute('aria-pressed', String(on));
        card.querySelector('.c1__back').setAttribute('aria-hidden', String(!on));
        if (on) { fly(card, card.dataset.id); setTimeout(() => card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 430); }
      };
      card.querySelector('.c1__front').addEventListener('click', flipIt);
      card.querySelector('.c1__back').addEventListener('click', flipIt);
    });
  }

  if (v === 'build') {
    root.className = 'c';
    root.innerHTML = `<div class="c__scroll">${head}
      <div class="c2__stage"><div class="c2__stack"><div class="c2__base"></div></div><div class="c2__names"></div><p class="c2__empty mono">your project · 0 pieces</p></div>
      <div class="c__chips">${CHOICES.map((c) => `<button class="c__chip" type="button" data-id="${c.id}" aria-pressed="false">${c.chip}</button>`).join('')}</div>
      <div class="c2__answer" aria-live="polite"></div></div>${checkBar()}`;
    const stack = root.querySelector('.c2__stack'), names = root.querySelector('.c2__names'), ans = root.querySelector('.c2__answer'), empty = root.querySelector('.c2__empty');
    const order = [];
    const restack = (newId) => {
      stack.querySelectorAll('.c2__piece').forEach((p) => p.remove()); names.innerHTML = '';
      order.forEach((id, i) => {
        const c = CHOICES.find((x) => x.id === id);
        const p = document.createElement('div'); p.className = 'c2__piece' + (id === newId && !ctx.reduced ? ' is-new' : '');
        p.style.setProperty('--z', `${i * 16}px`); p.style.setProperty('--z0', `${i * 16 + 220}px`); p.style.transform = `translateZ(${i * 16}px)`;
        p.innerHTML = `<img src="${c.img}" alt="">`; stack.append(p);
        if (id === newId) p.addEventListener('animationend', () => ctx.haptics.tick(16), { once: true });
        const n = document.createElement('b'); n.textContent = `${String(i + 1).padStart(2, '0')} ${c.tick}`; names.append(n);
      });
      empty.textContent = `your project · ${order.length} piece${order.length === 1 ? '' : 's'}`;
    };
    root.querySelectorAll('.c__chip').forEach((b) => b.addEventListener('click', () => {
      ctx.haptics.tap();
      const id = b.dataset.id, on = toggle(id); b.setAttribute('aria-pressed', String(on));
      if (on) order.push(id); else order.splice(order.indexOf(id), 1);
      restack(on ? id : null);
      const c = CHOICES.find((x) => x.id === id);
      ans.innerHTML = on ? `<h3>${c.chip} · what you get</h3><ul>${c.get.map((g) => `<li>${g}</li>`).join('')}</ul>` : '';
      if (on) fly(b, id);
    }));
  }

  if (v === 'slip') {
    root.className = 'c3';
    root.innerHTML = `<div class="c3__slot" aria-hidden="true"></div><div class="c3__out"><div class="c3__slip" role="log" aria-live="polite">
        <div class="c3__head"><span>Work slip</span><span>No. 0001</span></div><p class="c3__hint">Tap what fits you. Your answers print here. <span class="ph-tag">placeholder</span></p></div></div>
      <div class="c3__chips"><p class="mono" style="color:var(--graphite);margin-bottom:8px">What do you need? · tap all that fit</p>
        <div class="c__chips">${CHOICES.map((c) => `<button class="c__chip" type="button" data-id="${c.id}" aria-pressed="false">${c.chip}</button>`).join('')}</div></div>`;
    const slip = root.querySelector('.c3__slip');
    // the slip hangs from the slot: the first line printed is furthest down, each new answer prints at the slot
    // and pushes the paper out by its own height, in steps like a printer advancing line by line
    const push = (dh) => { if (!ctx.reduced && dh > 0) slip.animate([{ transform: `translateY(${-dh}px)` }, { transform: 'none' }], { duration: Math.min(700, 160 + dh * 2.2), easing: 'steps(7, end)' }); };
    push(slip.offsetHeight);
    root.querySelectorAll('.c__chip').forEach((b) => b.addEventListener('click', () => {
      ctx.haptics.tap();
      const id = b.dataset.id, on = toggle(id); b.setAttribute('aria-pressed', String(on));
      const c = CHOICES.find((x) => x.id === id);
      if (on) {
        root.querySelector('.c3__hint')?.remove();
        const h0 = slip.offsetHeight;
        const row = document.createElement('div'); row.className = 'c3__row'; row.dataset.id = id;
        row.innerHTML = `<b>${c.tick}</b>${c.get.map((g) => `<p>${g}</p>`).join('')}`;
        slip.append(row); push(slip.offsetHeight - h0); setTimeout(() => ctx.haptics.tick(12), 380);
      } else slip.querySelector(`.c3__row[data-id="${id}"]`)?.remove();
    }));
  }
  renderTicks();
  return {
    render() {}, resize() {},
    dispose() { root.remove(); },
  };
}

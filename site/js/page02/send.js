// The final room's Send and the five ways to reach us (Part 5 "Pages 2 and 3"):
//   WhatsApp first, then email, phone call, send from the page, book a call slot.
// WhatsApp and email open in the visitor's own app with the slip filled in (a real link, so a tap hands over natively).
// Sending from the page and booking are built fully but switched off in settings.js; while off they hand over to the
// email app. When on, they post the slip as JSON, guarded by a honeypot field, a time trap and a rate limit.
// Every typed value is cleaned and capped (slip.js), then percent-encoded into the links; the whole link is capped too.
import { settings } from '../settings.js';
import { slip, slipText, clean } from './slip.js';

export const SEND_DESIGN = 'A';   // Wajih's pick (24 Nov): A, Leader (B Cell and C Bubble retired)
const LIM = settings.limits;
const digits = (n) => String(n ?? '').replace(/\D/g, '');
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/;   // the studio's own address, from settings: refuse anything odd

export function waURL(text, number = settings.whatsapp) {
  const d = digits(number);
  return `https://wa.me/${d.length >= 8 && d.length <= 15 ? d : ''}?text=${encodeURIComponent(text)}`;
}
export function mailURL(subject, body, to = settings.email) {
  // RFC 6068: CRLF line breaks, everything percent-encoded
  const addr = EMAIL.test(to) ? to : '';
  return `mailto:${addr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`;
}
export function telURL(number = settings.phone) { return `tel:+${digits(number)}`; }

/** build a link from the slip; if it's too long, shorten the free-text note (never the needs) until it fits */
function fitted(build, extra = '') {
  let note = slip.note, url = build(slipText(slip, { note, extra }));
  let cps = [...note];
  while (url.length > LIM.url && cps.length) {
    cps = cps.slice(0, Math.max(0, cps.length - Math.max(8, Math.ceil(cps.length * 0.12))));
    note = cps.length ? `${cps.join('').trimEnd()}…` : '';
    url = build(slipText(slip, { note, extra }));
  }
  return url;
}
const subject = () => `Work slip No. ${slip.no}`;

const httpsOK = (u) => { try { return new URL(u).protocol === 'https:'; } catch (e) { return false; } };
export const switches = {
  page: () => !!settings.sendFromPage?.on && httpsOK(settings.sendFromPage.endpoint),
  book: () => !!settings.booking?.on && httpsOK(settings.booking.endpoint),
};

// the ways, each: what the Send says and where it goes
export const WAYS = {
  whatsapp: () => ({ k: 'By WhatsApp', w: 'Send', say: 'Opens WhatsApp with this slip filled in.', href: fitted((t) => waURL(t)), blank: true }),
  email: () => ({ k: 'By email', w: 'Send', say: 'Opens your email with this slip filled in.', href: fitted((t) => mailURL(subject(), t)) }),
  call: () => ({ k: 'By phone', w: 'Call', say: `Calls us on ${settings.phone}.`, href: telURL() }),
  page: () => (switches.page()
    ? { k: 'From this page', w: 'Send', say: 'Sends this slip from here.', post: 'page' }
    : { k: 'From this page', w: 'Send', say: 'Opens your email with this slip filled in.', href: fitted((t) => mailURL(subject(), t)) }),
  book: () => (switches.book()
    ? { k: 'Book a call', w: 'Book', say: slip.slot ? 'Books the slot you picked.' : 'Pick a slot above first.', post: 'book' }
    : { k: 'Book a call', w: 'Send', say: 'Opens your email to ask for a call slot.', href: fitted((t) => mailURL(`Call slot · ${subject()}`, t), 'Please suggest a call slot.') }),
};

// ---------- the guards for the page's own sends (only used when a switch is on) ----------
const KEY = 'wm:sent';
export const rate = {
  times() { try { return JSON.parse(localStorage.getItem(KEY) || '[]').filter((t) => typeof t === 'number'); } catch (e) { return this._mem || []; } },
  ok(now = Date.now()) {
    const t = this.times().filter((x) => now - x < 10 * 60e3);
    return t.length < LIM.sendsPer10Min && (!t.length || now - Math.max(...t) > LIM.minGapSec * 1e3);
  },
  mark(now = Date.now()) {
    const t = [...this.times().filter((x) => now - x < 10 * 60e3), now];
    this._mem = t; try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {}
  },
};

/** wire the Send in `form` (page 3) */
export function initSend(form, { reduced, haptics }) {
  const a = form.querySelector('.send'), say = form.querySelector('.slip__said');
  const kEl = a.querySelector('.js-send-k'), wEl = a.querySelector('.js-send-w'), sayEl = form.querySelector('.js-send-say');
  const hp = form.querySelector('.slip__hp input');
  const slots = form.querySelector('.slip__slots'), grid = form.querySelector('.slip__slots-grid');
  const shownAt = performance.now();
  a.className = `send send--${SEND_DESIGN.toLowerCase()}`;
  let way = null;

  function update() {
    way = WAYS[slip.by] ? WAYS[slip.by]() : WAYS.whatsapp();
    kEl.textContent = way.k; wEl.textContent = way.w; sayEl.textContent = way.say;
    a.dataset.by = slip.by;
    if (way.href) {
      a.setAttribute('href', way.href); a.removeAttribute('role');
      if (way.blank) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } else { a.removeAttribute('target'); a.removeAttribute('rel'); }
    } else { a.setAttribute('href', '#'); a.setAttribute('role', 'button'); a.removeAttribute('target'); a.removeAttribute('rel'); }
    slots.hidden = !(slip.by === 'book' && switches.book());
    if (!slots.hidden && !grid.childElementCount) buildSlots();
  }

  // booking slots: the next working days at the studio's times, shown in the visitor's own time
  function buildSlots() {
    const B = settings.booking, now = new Date(), days = [];
    for (let k = 1; days.length < B.days && k < 21; k++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
      if (B.workdays.includes(d.getDay())) days.push(d);
    }
    days.forEach((d) => {
      const col = document.createElement('div'); col.className = 'slip__day';
      const k = document.createElement('p'); k.className = 'slip__day-k mono'; k.textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      col.append(k);
      B.times.forEach((hm) => {
        const [h, m] = hm.split(':').map(Number);
        const at = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h, m) - B.studioUtcOffsetMin * 60e3);
        const lab = document.createElement('label'); lab.className = 'tick';
        const inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'slot'; inp.value = at.toISOString();
        lab.append(inp, markSVG());
        const t = document.createElement('span'); t.textContent = at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); lab.append(t);   // the visitor's own clock, 24 h
        col.append(lab);
      });
      grid.append(col);
    });
  }

  async function post(kind) {
    const tell = (s) => { say.textContent = s; };
    if (kind === 'book' && !slip.slot) { tell('Pick a slot first.'); return; }
    if (hp && hp.value) { tell('Sent. Thank you.'); return; }                    // a bot: say nothing useful, send nothing
    if (performance.now() - shownAt < 2500) { tell('One moment, then try again.'); return; }   // filled faster than a person can
    if (!rate.ok()) { tell('Sent a moment ago. Please wait a little before sending again.'); return; }
    const ep = kind === 'book' ? settings.booking.endpoint : settings.sendFromPage.endpoint;
    const body = JSON.stringify({ kind, no: slip.no, date: slip.date, needs: slip.printed(), when: slip.when, name: slip.name, note: slip.note,
      slot: kind === 'book' ? slip.slot : '', text: slipText(slip), website: '' });
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 10000);
    a.classList.add('is-busy'); tell('Sending…');
    try {
      const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', mode: 'cors' });
      if (!r.ok) throw new Error(String(r.status));
      rate.mark(); tell(kind === 'book' ? 'Booked. Thank you.' : 'Sent. Thank you.');
    } catch (e) {
      tell("It didn't go through, so your email opens instead.");
      location.href = fitted((t) => mailURL(subject(), t));
    } finally { clearTimeout(timer); a.classList.remove('is-busy'); }
  }

  a.addEventListener('click', (e) => {
    update();   // the link carries this very moment's slip
    if (way.post) { e.preventDefault(); post(way.post); }
    else if (e.pointerType || e.detail) haptics?.tap(12);
  });
  // round 8b: pressed, Send slides into its hard shadow (also for a quick touch tap, which :active barely shows)
  let pressT = 0, pressAt = 0;
  a.addEventListener('pointerdown', () => { clearTimeout(pressT); pressAt = performance.now(); a.classList.add('is-pressed'); }, { passive: true });
  const release = () => { clearTimeout(pressT); pressT = setTimeout(() => a.classList.remove('is-pressed'), Math.max(0, 140 - (performance.now() - pressAt))); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => a.addEventListener(t, release, { passive: true }));
  a.addEventListener('keydown', (e) => { if (e.key === ' ' && a.getAttribute('role') === 'button') { e.preventDefault(); a.click(); } });
  slip.on(update);
  grid.addEventListener('change', (e) => { if (e.target.name === 'slot') slip.set('slot', e.target.value); });
  update();
  return { update, post, way: () => way };
}

export function markSVG() {
  const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg');
  s.setAttribute('class', 'mark'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  const r = document.createElementNS(ns, 'rect'); r.setAttribute('x', '.5'); r.setAttribute('y', '.5'); r.setAttribute('width', '23'); r.setAttribute('height', '23');
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'M4.5 19.5 19.5 4.5');
  s.append(r, p); return s;
}

export { clean };

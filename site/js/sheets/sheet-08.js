// Sheet 08: Contact, the live work order.
//   p 0 -> 1   entry: the page's title block grows out of its corner into the work order (sheet08/grow.js)
//   p 1 -> ..  the work order, held. If it is taller than the screen (phones), the sheet scrolls through its own
//              height first (a translate driven by p, 1:1 with the scroll), then holds; the last unit sits under
//              sheet 09's entry.
// The work order's own title block fills in live as the visitor types (sheet08/workorder.js, all in the browser).
// "Send" hands the work order to the visitor's own email app (mailto:) or WhatsApp (wa.me). Nothing is sent from
// the page. Contact details come from site/js/settings.js only.
import { chapter, clamp } from '../engine/kit.js';
import { settings } from '../settings.js';
import * as WO from '../sheet08/workorder.js';
import { createGrow, GT } from '../sheet08/grow.js';

const HOLD = 1.25;   // viewport heights the finished work order holds before sheet 09 starts to come in
const WAY_ERR = 'Tell us what’s in the way first. One line is enough.';
const REACH_ERR = 'Not an email or a phone number yet. Or leave it empty.';

/** write the contact details from settings.js into every [data-setting] slot on the page */
export function fillSettings(root = document) {
  const digits = WO.waDigits(settings.whatsapp);
  root.querySelectorAll('[data-setting]').forEach((n) => {
    const k = n.dataset.setting;
    if (k === 'email') n.textContent = settings.email;
    else if (k === 'whatsapp') n.textContent = settings.whatsapp;
    else if (k === 'location') n.textContent = settings.location;
    else if (k === 'email-link') n.setAttribute('href', `mailto:${settings.email}`);
    else if (k === 'wa-link') n.setAttribute('href', `https://wa.me/${digits}`);
  });
}

export function init(engine) {
  const section = document.getElementById('sheet-08');
  if (!section) return;
  const stage = section.querySelector('.chapter__stage');
  const sheet = section.querySelector('.s08__sheet');
  const wo = section.querySelector('.s08__wo');
  const form = section.querySelector('.s08__form');
  const way = section.querySelector('#s08-way'), have = section.querySelector('#s08-have'), reach = section.querySelector('#s08-reach');
  const errWay = section.querySelector('#s08-way-err'), errReach = section.querySelector('#s08-reach-err');
  const mail = section.querySelector('#s08-mail'), wa = section.querySelector('#s08-wa'), status = section.querySelector('.s08__status');
  const out = (k) => section.querySelector(`[data-out="${k}"]`);
  const oNo = out('no'), oDate = out('date'), oProject = out('project'), oSheets = out('sheets'), oReply = out('reply'), dl = out('disciplines');
  const grow = createGrow(section.querySelector('.s08__grow'));

  fillSettings(document);
  oDate.textContent = WO.today();

  // ---------- the live title block ----------
  const items = WO.DISCIPLINES.map((d) => {
    const li = document.createElement('li'); li.className = 's08__d'; li.dataset.d = d.key;
    li.innerHTML = `<i class="s08__box" aria-hidden="true"></i><span class="s08__dn">${d.name}</span><em class="s08__hit mono"></em>`;
    dl.appendChild(li); return { li, hit: li.querySelector('.s08__hit'), key: d.key };
  });
  let A = WO.analyse('', '');
  function update() {
    A = WO.analyse(way.value, have.value);
    const has = way.value.trim().length > 0;
    oProject.textContent = A.project || (has ? 'Untitled' : 'Waiting for the problem');
    oProject.classList.toggle('is-empty', !A.project);
    oNo.textContent = A.no || 'WO-····';
    oSheets.textContent = String(A.sheets).padStart(2, '0');
    const hits = new Map(A.disciplines.map((d) => [d.key, d]));
    items.forEach(({ li, hit, key }) => {
      const d = hits.get(key);
      li.classList.toggle('is-hit', !!d);
      hit.textContent = d ? (d.hit ? `“${d.hit}”` : 'to find the right desk') : '';
    });
    const r = WO.reachKind(reach.value);
    oReply.textContent = r.ok ? r.label : 'Check the contact line';
    const body = WO.message({ way: way.value, have: have.value, reach: reach.value }, A.no ? A : { ...A, no: 'WO-····' });
    mail.setAttribute('href', WO.mailtoURL(WO.subject(A.no ? A : { ...A, no: 'WO-····' }), body));
    wa.setAttribute('href', WO.whatsappURL(body));
  }

  // ---------- validation: errors in words, next to the field, never only in colour ----------
  function setErr(input, errEl, msg) {
    errEl.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    input.closest('.s08__field').classList.toggle('has-err', !!msg);
  }
  function validate() {
    let first = null;
    if (!way.value.trim()) { setErr(way, errWay, WAY_ERR); first = first || way; } else setErr(way, errWay, '');
    const r = WO.reachKind(reach.value);
    if (!r.ok) { setErr(reach, errReach, REACH_ERR); first = first || reach; } else setErr(reach, errReach, '');
    return first;
  }
  [way, have, reach].forEach((n) => n.addEventListener('input', () => {
    update();
    if (n === way && way.value.trim()) setErr(way, errWay, '');
    if (n === reach && WO.reachKind(reach.value).ok) setErr(reach, errReach, '');
    status.textContent = ''; status.closest('.s08__send').classList.remove('has-status');
  }));
  reach.addEventListener('blur', () => { if (!WO.reachKind(reach.value).ok) setErr(reach, errReach, REACH_ERR); });
  function onSend(e, via) {
    update();
    const bad = validate();
    if (bad) { e.preventDefault(); status.textContent = ''; bad.focus(); return; }
    status.closest('.s08__send').classList.add('has-status');
    status.textContent = via === 'mail'
      ? `Opening your email app with work order ${A.no}. If nothing opens, write to ${settings.email}.`
      : `Opening WhatsApp in a new tab with work order ${A.no}. If nothing opens, message ${settings.whatsapp}.`;
  }
  mail.addEventListener('click', (e) => onSend(e, 'mail'));
  wa.addEventListener('click', (e) => onSend(e, 'wa'));
  form.addEventListener('submit', (e) => { e.preventDefault(); mail.focus(); });
  update();

  // ---------- the sheet's own height: on a phone the work order is taller than the screen ----------
  let S = 0;
  const vh = () => stage.clientHeight || innerHeight;
  function measure() {
    if (engine.reduced) return false;
    const h = sheet.offsetHeight;
    S = Math.max(0, (h - vh()) / vh());
    const units = +(1 + S + HOLD).toFixed(3);
    const cur = parseFloat(section.style.getPropertyValue('--units')) || 0;
    if (Math.abs(cur - units) < 0.01) return false;
    section.style.setProperty('--units', String(units));
    return true;
  }
  sizeToTitleBlock();
  measure();
  const remeasure = () => { sizeToTitleBlock(); if (measure()) engine.ScrollTrigger.refresh(); };
  document.fonts?.ready.then(remeasure);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(remeasure, 250); });

  // ---------- the entry geometry (read from the page's title block; never written to) ----------
  // The work order's bottom-right cell is the page's own title block: our right column takes its width, our bottom
  // row its height. Its width follows its contents (Studio / Contact), so it is re-read whenever its title changes.
  let tbKey = '', A0 = null, cells0 = null;
  const keyNow = () => (document.querySelector('#titleblock .tb__title')?.textContent || '') + '|' + (stage.clientWidth || innerWidth) + '|' + vh();
  function growLayout(updateA) {
    const tbEl = document.getElementById('titleblock');
    if (!tbEl) return;
    const vp = (r) => ({ x: r.left, y: r.top, w: r.width, h: r.height });
    const tbR = tbEl.getBoundingClientRect();
    if (updateA || !A0) {
      A0 = vp(tbR);
      cells0 = [...tbEl.querySelectorAll('.tb__cell')].map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0).map(vp);
      if (!cells0.length) cells0 = [A0];
    }
    const sr = sheet.getBoundingClientRect();
    const rel = (r) => ({ x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height });
    const H = vh(), W = stage.clientWidth || innerWidth;
    const B = rel(wo.getBoundingClientRect());
    const fin = [...wo.querySelectorAll('[data-cell]')].map((c) => rel(c.getBoundingClientRect())).filter((r) => r.y < H && r.w > 0);
    grow.layout(W, H, A0, B, cells0, fin);
    tbKey = keyNow();
  }
  // our right column and bottom row are sized to the title block as it reads on THIS sheet (its width follows its
  // contents): measured on a detached copy filled with sheet 08's values, so the form never shifts when the page's
  // title block switches over to sheet 08
  function sizeToTitleBlock() {
    const tbEl = document.getElementById('titleblock');
    if (!tbEl) return;
    const c = tbEl.cloneNode(true);
    c.removeAttribute('id'); c.classList.remove('reveal-late'); c.setAttribute('aria-hidden', 'true');
    const set = (sel, v) => { const n = c.querySelector(sel); if (n) n.textContent = v; };
    set('.tb__sheet', section.dataset.sheet); set('.tb__title', section.dataset.title);
    set('.tb__drawn', section.dataset.drawn); set('.tb__checked', section.dataset.checked); set('.tb__approved', section.dataset.approved);
    c.style.visibility = 'hidden'; c.style.pointerEvents = 'none';
    document.body.appendChild(c);
    const r = c.getBoundingClientRect();
    c.remove();
    section.style.setProperty('--tbw', `${r.width.toFixed(1)}px`);
    section.style.setProperty('--tbh', `${r.height.toFixed(1)}px`);
  }
  function layout() { sizeToTitleBlock(); growLayout(true); }

  // ---------- render ----------
  let shown = null, prev07 = null, stripH = 0;
  function render(p) {
    // while someone is typing, the work order stays finished whatever the scroll does
    const pe = form.contains(document.activeElement) ? Math.max(p, 1) : p;
    if (pe < GT.split[0] && keyNow() !== tbKey) growLayout(pe < GT.grow[0]);
    grow.render(pe);
    // sheet 07's words leave as the title block is selected: the growing block never cuts through text
    prev07 = prev07 || document.querySelector('#sheet-07 .chapter__stage');
    prev07?.classList.toggle('is-handing', p > GT.select[0] && p < 1);
    const on = pe >= GT.show;
    if (on !== shown) { shown = on; section.classList.toggle('is-shown', on); }
    const ty = -clamp(p - 1, 0, S) * vh();
    sheet.style.transform = ty ? `translate3d(0, ${ty.toFixed(1)}px, 0)` : '';
    // a tall work order (phones) travels up under the timeline strip: cut it at the strip, so its words never run
    // through the strip's own labels (the strip is a see-through difference layer)
    stripH = stripH || document.getElementById('strip')?.offsetHeight || 0;
    sheet.style.clipPath = ty ? `inset(${(stripH - ty).toFixed(1)}px 0 0 0)` : '';
  }

  chapter(engine, section, {
    render, layout,
    reduced() { section.classList.add('is-shown'); growLayout(true); },
  });
}

// The work slip's state, shared by page 2 (the rows print into it) and page 3 (the slip itself), and the slip as
// plain text for the hand-offs. Everything the visitor types is cleaned and capped here (settings.limits), and only
// ever written into the page as text (textContent), never as HTML.
import { settings } from '../settings.js';

const LIM = settings.limits;
// the needs as the rows name them (page 2); the slip prints the same words
export const NEEDS = { web: 'A website', app: 'An app', mess: 'My systems are a mess', ai: 'AI working for me', sec: 'Keep it secure', look: 'A look that fits my business' };
export const ORDER = Object.keys(NEEDS);

// C0/C1 controls (but newline and tab), DEL, zero-width space, BOM, and the bidi overrides/isolates that can make text
// read differently from what it is. ZWJ/ZWNJ stay (Arabic and Persian shaping needs them).
const BAD = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​‪-‮⁦-⁩﻿]/g;
/** clean a typed value: no control or bidi-override characters, tidy whitespace, at most `max` characters (code points) */
export function clean(s, max, oneLine = false) {
  let t = String(s ?? '').normalize('NFC').replace(BAD, '');
  t = oneLine ? t.replace(/\s+/g, ' ') : t.replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  t = t.trim();
  const cps = [...t];
  return cps.length > max ? cps.slice(0, max).join('') : t;
}

const pad = (n) => String(n).padStart(2, '0');
/** the slip's number: the moment it was made, yymmdd-hhmm (local time); live, so it moves with the clock */
export function slipNo(d = new Date()) { return `${pad(d.getFullYear() % 100)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`; }
export function slipDate(d = new Date()) { return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

export const slip = {
  needs: [],          // ids, in the order they were ticked
  when: '', name: '', note: '', by: 'whatsapp', slot: '',
  no: slipNo(), date: slipDate(),
  _fns: new Set(),
  on(fn) { this._fns.add(fn); return () => this._fns.delete(fn); },
  emit(what) { this._fns.forEach((fn) => { try { fn(what, this); } catch (e) { console.error('[slip]', e); } }); },
  setNeed(id, on) {
    if (!NEEDS[id]) return;
    const had = this.needs.includes(id);
    if (on && !had) this.needs.push(id); else if (!on && had) this.needs = this.needs.filter((x) => x !== id);
    else return;
    this.emit({ need: id, on });
  },
  set(k, v) {
    if (k === 'name') v = clean(v, LIM.name, true);
    else if (k === 'note') v = clean(v, LIM.note);
    else if (k === 'when' || k === 'by' || k === 'slot') v = clean(v, 64, true);
    else return;
    if (this[k] === v) return;
    this[k] = v; this.emit({ field: k });
  },
  tickClock() { const no = slipNo(), date = slipDate(); if (no !== this.no || date !== this.date) { this.no = no; this.date = date; this.emit({ clock: true }); } },
  /** the needs as printed (row order is the order they were ticked) */
  printed() { return this.needs.map((id) => NEEDS[id]); },
};

/** the slip as plain text: what lands in WhatsApp, the email body, or the page's own send */
export function slipText(s = slip, { note = s.note, extra = '' } = {}) {
  const L = [`Work slip No. ${s.no} · ${s.date}`];
  L.push(`Needs: ${s.needs.length ? s.printed().join(', ') : 'not ticked yet'}`);
  if (s.when) L.push(`When: ${s.when}`);
  if (s.name) L.push(`Name: ${s.name}`);
  if (note) L.push('', note);
  if (extra) L.push('', extra);
  return L.join('\n');
}

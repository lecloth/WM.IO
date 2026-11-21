// The hero phone rotates through the concept phones: each time the page loops back to the singularity
// (engine.emit('loop:wrap')), it reassembles as the next one. The index lives in localStorage 'wm:product';
// a fresh visit (or no storage) starts on LOFTHAUL.
import { PHONES } from './index.js';

const KEY = 'wm:product';
let mem = 0;                                     // fallback when storage is blocked

function read() {
  try { const v = parseInt(localStorage.getItem(KEY), 10); return Number.isFinite(v) ? v : 0; } catch { return mem; }
}
function write(i) {
  mem = i;
  try { localStorage.setItem(KEY, String(i)); } catch { /* private mode: keep it in memory */ }
}
const wrap = (i) => ((i % PHONES.length) + PHONES.length) % PHONES.length;

/** the phone product to show now */
export function currentPhoneProduct() { return PHONES[wrap(read())]; }

/** advance to the next phone product, persist it, and return it */
export function nextPhoneProduct() { const i = wrap(read() + 1); write(i); return PHONES[i]; }

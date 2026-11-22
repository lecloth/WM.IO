// B · The trip into the lock (B1 straight dive, B2 cut-open ride, B3 the room of locks).
// Built on the real 3D lock ("Cutaway Lock" by zbzzn, Printables 250197, CC BY) once Wajih has downloaded it
// (Printables needs a login). Until then this pane says so honestly instead of drawing a lock in code.
import { KIT } from './opt-a.js';

export async function create(mount, ctx) {
  const ok = await fetch(KIT + 'manifest.json', { method: 'HEAD' }).then((r) => r.ok).catch(() => false);
  mount.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center"><p class="mono" style="max-width:30ch;font-size:13px">${ctx.def.code}: ${ok ? 'the lock model is in; this trip is built next.' : 'waiting for the real 3D lock (Printables download). Nothing is drawn in code meanwhile.'}</p></div>`;
  return { render() {}, resize() {}, dispose() { mount.replaceChildren(); } };
}

// The finished phone is live (Part 5 "Fixes after pages 2-3"): it follows the pointer on desktop and, on phones, tilts
// with the visitor's own phone (deviceorientation: gentle, clamped, slowly re-centred so any holding angle is "level").
// Nothing under reduced motion. One small controller, shared by page 1 and the asset sheet.
// Output: { yaw, pitch } in radians, eased, sent to onChange only while it moves.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const LIMIT = { yaw: 0.2, pitch: 0.13 };

export function createLive({ reduced = matchMedia('(prefers-reduced-motion: reduce)').matches } = {}) {
  const target = { yaw: 0, pitch: 0 }, now = { yaw: 0, pitch: 0 };
  let gain = 0, raf = 0, cb = null, source = 'none', base = null, lastT = 0;
  const step = () => {
    raf = 0;
    const ty = target.yaw * gain, tp = target.pitch * gain;
    now.yaw += (ty - now.yaw) * 0.09; now.pitch += (tp - now.pitch) * 0.09;
    const done = Math.abs(ty - now.yaw) < 1e-4 && Math.abs(tp - now.pitch) < 1e-4;
    if (done) { now.yaw = ty; now.pitch = tp; }
    cb?.(now);
    if (!done) raf = requestAnimationFrame(step);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
  if (!reduced) {
    // desktop: the pointer, across the whole window
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      source = 'pointer';
      addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        target.yaw = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1) * LIMIT.yaw;
        target.pitch = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1) * LIMIT.pitch;
        if (gain) kick();
      }, { passive: true });
    }
    // phones (Android; iPhone would need a permission prompt, which we don't ask for): the gyroscope
    else if ('DeviceOrientationEvent' in window) {
      source = 'tilt';
      addEventListener('deviceorientation', (e) => {
        if (e.beta == null || e.gamma == null) return;
        const t = performance.now(), dt = lastT ? Math.min(0.2, (t - lastT) / 1000) : 0; lastT = t;
        if (!base) base = { b: e.beta, g: e.gamma };
        // the level slowly follows how the visitor holds the phone (about 4 s), so only movement tilts it
        const k = 1 - Math.exp(-dt / 4);
        base.b += (e.beta - base.b) * k; base.g += (e.gamma - base.g) * k;
        const deg = Math.PI / 180;
        target.yaw = clamp((e.gamma - base.g) * deg * 0.9, -LIMIT.yaw, LIMIT.yaw);
        target.pitch = clamp((e.beta - base.b) * deg * 0.7, -LIMIT.pitch, LIMIT.pitch);
        if (gain) kick();
        api.events++;
      }, { passive: true });
    }
  }
  const api = {
    source, now, events: 0,
    onChange(fn) { cb = fn; },
    /** 0..1: how much of the live turn applies right now (page 1: only while the finished phone is on screen) */
    gain(g) { g = reduced ? 0 : g; if (g === gain) return; gain = g; kick(); },
  };
  return api;
}

// The quiet gate (28 Nov, "the arrival waits until the page is ready"). Heavy one-off start-up work (the hero phone's
// studio HDRI: its parse, its PMREM and the shader compile; page 1's first full layout once Bell's paths are in) waits
// here so it never lands in a frame of the arrival. Open while the page loads and while the arrival's first frame holds
// (the still mark covers the work); shut while the arrival moves (enter.js); open again at its end state, the quiet
// stretch after the second line, before the visitor taps in. Nothing else uses it: once open it stays open unless the
// arrival runs again.
let moving = false;
const waiting = [];
/** a promise that resolves once the arrival isn't moving (at once if it isn't) */
export const quiet = () => (moving ? new Promise((res) => waiting.push(res)) : Promise.resolve());
/** enter.js: the arrival starts moving (true) or reaches its end state (false) */
export function setMoving(on) {
  moving = !!on;
  if (!moving) waiting.splice(0).forEach((res) => { try { res(); } catch (e) {} });
}
export const isMoving = () => moving;

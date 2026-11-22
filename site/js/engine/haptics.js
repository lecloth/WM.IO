// (moved from the style lab, site/dev/lab/haptics.js)
// Vibration for Take 2 (Part 5): short ticks only, after the first tap, never with reduced motion.
// Android Chrome / Samsung Internet: navigator.vibrate (needs one earlier tap: sticky user activation).
// iPhone Safari has no vibration API. iOS 18+ gives a haptic when a native <input type="checkbox" switch>
// toggles, so on iPhone a tap clicks a hidden switch. That only works inside a tap, so on iPhone snaps that
// happen during scrolling stay silent: only taps buzz.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canVibrate = typeof navigator.vibrate === 'function';
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
let unlocked = false, label = null, last = 0;

export const haptics = {
  get unlocked() { return unlocked; },
  get mode() { return reduced.matches ? 'off (reduced motion)' : canVibrate ? 'vibrate' : isIOS ? 'iPhone switch (taps only)' : 'none on this device'; },
  /** call from the first tap ("tap the point to enter") */
  unlock() {
    unlocked = true;
    if (isIOS && !label) {
      label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      const input = document.createElement('input');
      input.type = 'checkbox'; input.setAttribute('switch', ''); input.tabIndex = -1;
      label.append(input); document.body.append(label);
    }
  },
  /** a piece snapping into place (works during scroll on Android only) */
  tick(ms = 14) {
    if (!unlocked || reduced.matches) return;
    const now = performance.now(); if (now - last < 60) return; last = now;   // never a buzz train
    if (canVibrate) navigator.vibrate(Math.max(10, Math.min(20, ms)));
  },
  /** inside a tap handler: buzzes on Android and on iPhone */
  tap(ms = 12) {
    if (!unlocked || reduced.matches) return;
    if (canVibrate) navigator.vibrate(Math.max(10, Math.min(20, ms)));
    else if (label) label.click();
  },
};

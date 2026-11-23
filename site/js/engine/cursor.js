// The cursor: a small hairline cross at the pointer (Part 5 "Fixes after pages 2-3": no full-screen lines, no X/Y
// readout). Desktop + fine pointer only. It follows the pointer exactly (no lag); over something clickable it grows a
// little; over a text field it steps aside for the native text cursor.
// Written new for this site (no code carried from the santalarch clone); see ENGINE_REUSE.md.

export function initCursor(engine) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const el = document.getElementById('xhair');
  if (!el || !fine || !engine.isDesktop()) return;
  document.documentElement.classList.add('has-xhair');
  let raf = 0, x = -40, y = -40;
  const paint = () => { raf = 0; el.style.setProperty('--x', `${x}px`); el.style.setProperty('--y', `${y}px`); };
  addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    x = e.clientX; y = e.clientY;
    el.classList.add('is-on');
    const t = e.target.closest?.('a, button, input, textarea, select, label, [data-hot]');
    el.classList.toggle('is-text', !!t && t.matches('input[type="text"], textarea'));
    el.style.setProperty('--s', t ? 1.6 : 1);
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
}

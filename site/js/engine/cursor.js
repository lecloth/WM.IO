// CAD crosshair cursor: two full-length hairlines, a pick box and live coordinates in millimetres from the
// top-left of the sheet. Desktop + fine pointer only. It follows the pointer exactly (no lag), like a CAD cursor.
// Written new for this site (no code carried from the santalarch clone); see ENGINE_REUSE.md.

const MM = 96 / 25.4;

export function initCursor(engine) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const el = document.getElementById('xhair');
  if (!el || !fine || !engine.isDesktop()) return;
  document.documentElement.classList.add('has-xhair');
  const read = el.querySelector('.xhair__read');
  let raf = 0, x = 0, y = 0;
  const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, '0');
  const paint = () => {
    raf = 0;
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
    read.textContent = `X ${pad(x / MM)} · Y ${pad((y + (engine.lenis?.scroll ?? scrollY)) / MM)}`;
  };
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    el.classList.add('is-on');
    const hot = e.target.closest?.('a, button, input, textarea, select, [data-hot]');
    el.style.setProperty('--s', hot ? 2.2 : 1);
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  engine.lenis?.on('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); });
}

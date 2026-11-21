// Light / dark print of the drawing set. The switch lives in the title block ("Print: Light / Dark").
// Tokens swap in CSS; canvases redraw on engine.on('theme').
export function initTheme(engine) {
  const html = document.documentElement;
  const btn = document.querySelector('.tb__theme');
  const label = btn?.querySelector('.tb__theme-v');
  const apply = (dark, announce) => {
    if (dark) html.dataset.theme = 'dark'; else delete html.dataset.theme;
    if (btn) { btn.setAttribute('aria-pressed', String(dark)); btn.setAttribute('aria-label', dark ? 'Print the sheets light' : 'Print the sheets dark'); }
    if (label) label.textContent = dark ? 'Dark' : 'Light';
    if (announce) engine.emit('theme', dark ? 'dark' : 'light');
  };
  apply(html.dataset.theme === 'dark', false);
  btn?.addEventListener('click', () => {
    const dark = html.dataset.theme !== 'dark';
    try { localStorage.setItem('wm:theme', dark ? 'dark' : 'light'); } catch (e) {}
    apply(dark, true);
  });
  engine.theme = () => (html.dataset.theme === 'dark' ? 'dark' : 'light');
}

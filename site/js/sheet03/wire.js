// Wires one sheet 03 discipline section to the scroll: its chapter change (measure / plan chest) + its scene.
import { chapter } from '../engine/kit.js';
import { Scene } from './scene.js';
import { MeasureEntry, ChestEntry } from './entry.js';

const whenLoaded = (fn) => {
  const go = () => setTimeout(fn, 60);
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
};

export function wireScene(engine, cfg) {
  const section = document.getElementById(cfg.id);
  if (!section) return null;
  const units = parseFloat(getComputedStyle(section).getPropertyValue('--units')) || 6;
  const scene = new Scene(section, { ...cfg, units });
  const entry = cfg.entry === 'measure' ? new MeasureEntry(section) : new ChestEntry(section);
  let ctl = null;
  ctl = chapter(engine, section, {
    render(p) { entry.render(Math.min(p, 1)); scene.render(p); },
    layout() { entry.layout(); scene.layout(); },
    reduced() { scene.setStatic(); },
  });
  if (cfg.load) {
    whenLoaded(() => cfg.load().then((mod) => {
      scene.setData(mod.default || mod.FIG1, cfg.fig);
      if (engine.reduced) scene.renderFinal(); else scene.render(ctl.progress());
    }).catch((e) => console.error('[sheet 03] plate data', e)));
  }
  if (engine.reduced) { scene.layout(); scene.renderFinal(); addEventListener('resize', () => { scene.layout(); scene.renderFinal(); }); }
  // "back to sheet 01": jump to the moment sheet 01 holds the board
  section.querySelector('.d3__ref')?.addEventListener('click', (e) => {
    e.preventDefault();
    engine.scrollTo(engine.targetOf ? engine.targetOf('#sheet-01') : '#sheet-01', { duration: 1.6 });
  });
  return { scene, entry, section };
}

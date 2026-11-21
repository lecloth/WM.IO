# ENGINE_REUSE — what came over from the santalarch clone

Rule (STUDIO_BRIEF Part 4.1): only my own generic engine code may be carried over (smooth-scroll setup, scroll-scene helpers,
cursor, preloader timing). Never any santalarch asset, image, font, video, model, text, wordmark or scene.

## Carried files

| This project | Came from | What was kept | What was removed or changed |
|---|---|---|---|
| `site/js/engine/core.js` | `C:\design-ripper - OpenBook Clone\clone\site\js\core\app.js` (my own engine file) | Lenis driven by the GSAP ticker, `lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)`; the heavy-scroll settings (`duration: 1.8`, `wheelMultiplier: 0.65`); the tiny event bus (`on`/`emit`); `lockScroll()`; a `scrollTo()` helper | Santalarch's named eases, infinite-loop mode, its state keys and popups; switched from ES-module imports to the vendored globals; reduced motion now turns smooth scroll off |
| `tools/shoot.py` | `C:\design-ripper - OpenBook Clone\clone\_build\shoot.py` (my own test tool) | Launching headless Chromium and saving screenshots | Rewritten for timed captures of the opening (`--times`), return visits, skip, reduced motion and mobile. It no longer loads any santalarch archive |

## Techniques reused (no code copied)

- **Size from window width:** 1rem = window width / 90 on desktop (16 px at 1440). Mobile uses its own base (width / 24.375 = 16 px at 390).
- **Difference-blend reveal layer:** a white layer in `mix-blend-mode: difference` that makes whatever it covers flip black/white. Here it is the opening curtain.
- **Scroll-progress bars in a top strip:** each bar is `scaleX(progress)` of its section's ScrollTrigger.

## Written new for this site

`site/js/engine/cursor.js` (CAD crosshair), `site/js/opening.js` (singularity → ruler → curtain → hold line), `site/js/main.js`,
slice 2: `site/js/sheet01/*` (act controller, phone, redraw, LOFTHAUL screen, traced Fig. 1), `tools/fps.py`, `tools/trace_fig1.py`,
the real-load-progress counter and strip drawing (inline in `site/index.html`), `site/css/site.css`, `site/type.html`, `tools/sheet.py`.

Slice 2 carried nothing new from the santalarch clone.

## Confirmed absent

No santalarch file, image, font (their Helvetica is not used), SVG, sequence, model, lottie, text or wordmark is in this repository.

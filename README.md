# Crouzeix: Folie à Deux

Slides for a seminar talk on the two July 2026 proofs of Crouzeix's conjecture, as an interactive web slideshow.

- The site is a static page: `index.html`, `css/style.css`, `js/`. No build step. Math is rendered with KaTeX from a CDN.
- Three visualisations are live on the page: the numerical range of example operators (`js/numrange.js`), the double-layer potential as a boundary density seen from a movable point (`js/dlp.js`), and the identity `2Φ(f) = f + conj α(f)` for a point (`js/identity.js`).
- `slides/` holds the beamer source, the compiled slides and the speaker notes.

To view locally, serve the folder with any static server, for example `python3 -m http.server`, and open `index.html`. Arrow keys move between slides; the URL hash records the slide number.

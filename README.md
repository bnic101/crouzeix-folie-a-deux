# Crouzeix: Folie à Deux

Seminar slides on the two 2026 proofs of Crouzeix's conjecture.

- `index.html`, `css/`, `js/`: the web slideshow. Static, KaTeX from a CDN. Arrow keys move; the URL hash is the slide number.
- `js/numrange.js`: numerical range of example operators. `js/dlp.js`: the double layer potential. `js/identity.js`: `2Φ(f) = f + conj α(f)`.
- `slides/`: beamer source, slides, speaker notes.

Scratchboard: the pencil button top left, or `d`. Mouse, touch and pen; pressure sets the width on a pen. Palm rejection: once a pen touches the board only the pen draws (the `pen only` button shows this and can be toggled). Strokes are kept per slide; `clear` wipes the current slide, Esc closes.

Local: `python3 -m http.server` in this folder.

(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var n = slides.length;
  var current = -1;
  var bar = document.querySelector('#hud div');
  var counter = document.getElementById('counter');

  function show(i, push) {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === current) return;
    if (current >= 0) slides[current].classList.remove('active');
    slides[i].classList.add('active');
    current = i;
    bar.style.width = (100 * (i + 1) / n) + '%';
    counter.textContent = (i + 1) + ' / ' + n;
    if (push !== false) history.replaceState(null, '', '#' + (i + 1));
    var ev = new CustomEvent('slideshown', { detail: { index: i, el: slides[i] } });
    document.dispatchEvent(ev);
  }

  function fromHash() {
    var m = location.hash.match(/#(\d+)/);
    show(m ? parseInt(m[1], 10) - 1 : 0, false);
  }

  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'j') { show(current + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k') { show(current - 1); e.preventDefault(); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(n - 1);
  });
  window.addEventListener('hashchange', fromHash);

  document.getElementById('next').addEventListener('click', function () { show(current + 1); });
  document.getElementById('prev').addEventListener('click', function () { show(current - 1); });

  window.deck = { show: show, count: n };
  fromHash();
})();

// The identity 2 Phi(f)(z) = f(z) + conj(alpha(f)(z)), for a point z.
(function () {
  function mk(t) { return document.createElementNS('http://www.w3.org/2000/svg', t); }

  var fs = {
    square: function (x, y) { return [x * x - y * y, 2 * x * y]; },
    mobius: function (x, y) { var a = x - 0.5, b = y, c = 2 - x, d = -y, n = c * c + d * d; return [(a * c + b * d) / n, (b * c - a * d) / n]; },
    exp: function (x, y) { var e = Math.exp(x); return [e * Math.cos(y), e * Math.sin(y)]; },
    cube: function (x, y) { return [x * x * x - 3 * x * y * y, 3 * x * x * y - y * y * y]; }
  };

  function init(root) {
    var N = 400;
    var dom = root.querySelector('svg.dom'), img = root.querySelector('svg.img');
    var shapeSel = root.querySelector('select[name=shape]'), fSel = root.querySelector('select[name=f]');
    var out = { f: root.querySelector('[data-out=f]'), g: root.querySelector('[data-out=g]'), s: root.querySelector('[data-out=s]'), m: root.querySelector('[data-out=m]') };
    var W = 400, Hh = 320, cx = 200, cy = 160, S = 110;
    dom.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); img.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);

    var curve = Domain.build(Domain.shapes[shapeSel.value], N);
    var segs = mk('g'), isegs = mk('g'); dom.appendChild(segs);
    var ax = mk('line'); ax.setAttribute('stroke', '#7f7b72'); ax.setAttribute('x1', 10); ax.setAttribute('x2', 390); ax.setAttribute('y1', cy); ax.setAttribute('y2', cy); img.appendChild(ax);
    var ay = mk('line'); ay.setAttribute('stroke', '#7f7b72'); ay.setAttribute('y1', 10); ay.setAttribute('y2', 310); ay.setAttribute('x1', cx); ay.setAttribute('x2', cx); img.appendChild(ay);
    img.appendChild(isegs);
    var se = [], ie = [];
    for (var i = 0; i < N; i++) {
      var e = mk('line'); e.setAttribute('stroke', '#f2b07a'); e.setAttribute('stroke-linecap', 'round'); segs.appendChild(e); se.push(e);
      var e2 = mk('line'); e2.setAttribute('stroke', '#f2b07a'); e2.setAttribute('stroke-linecap', 'round'); isegs.appendChild(e2); ie.push(e2);
    }
    var v1 = mk('line'); v1.setAttribute('stroke', '#9cc9ea'); v1.setAttribute('stroke-width', '2.5'); img.appendChild(v1);
    var v2 = mk('line'); v2.setAttribute('stroke', '#b9b4a8'); v2.setAttribute('stroke-width', '2.5'); v2.setAttribute('stroke-dasharray', '5 4'); img.appendChild(v2);
    var pf = mk('circle'); pf.setAttribute('r', 4.5); pf.setAttribute('fill', '#9cc9ea'); img.appendChild(pf);
    var ps = mk('circle'); ps.setAttribute('r', 5); ps.setAttribute('fill', '#f2b07a'); img.appendChild(ps);
    var pa = mk('circle'); pa.setAttribute('r', 4.5); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', '#f2b07a'); pa.setAttribute('stroke-width', '2'); img.appendChild(pa);
    var zpt = mk('circle'); zpt.setAttribute('r', 6); zpt.setAttribute('fill', '#9cc9ea'); zpt.setAttribute('stroke', '#1f2b27'); zpt.setAttribute('stroke-width', 2); dom.appendChild(zpt);
    var labels = [['f(z)', '#9cc9ea'], ['2Φ(f)(z)', '#f2b07a'], ['Φ(f)(z)', '#f2b07a']].map(function (l) {
      var t = mk('text'); t.setAttribute('fill', l[1]); t.setAttribute('font-size', '12'); t.textContent = l[0]; img.appendChild(t); return t; });

    var z = [0.4, 0.2];
    function render() {
      var f = fs[fSel.value], fv = [], mx = 0;
      for (var i = 0; i < N; i++) { var v = f(curve.pts[i][0], curve.pts[i][1]); fv.push(v); var m = Math.hypot(v[0], v[1]); if (m > mx) mx = m; }
      var dn = Domain.density(curve, z), w = dn.w, wmax = 0, sx = 0, sy = 0, gr = 0, gi = 0;
      var dt = 2 * Math.PI / N;
      for (var i = 0; i < N; i++) {
        if (w[i] > wmax) wmax = w[i];
        sx += fv[i][0] * w[i]; sy += fv[i][1] * w[i];
        // g(z) = (1/2 pi i) sum conj(f) * sigma' / (sigma - z) dt
        var p = curve.pts[i], d = curve.der[i], w0 = p[0] - z[0], w1 = p[1] - z[1], n2 = w0 * w0 + w1 * w1;
        var qr = (d[0] * w0 + d[1] * w1) / n2, qi = (d[1] * w0 - d[0] * w1) / n2; // sigma'/(sigma - z)
        var cr = fv[i][0], ci = -fv[i][1];
        var pr = qr * cr - qi * ci, pi = qr * ci + qi * cr; // conj(f) * sigma'/(sigma-z)
        gr += pi * dt / (2 * Math.PI); gi += -pr * dt / (2 * Math.PI); // divide by i
      }
      var fz = f(z[0], z[1]), cg = [gr, -gi], sum = [fz[0] + cg[0], fz[1] + cg[1]];
      var T = 150 / Math.max(1.5 * mx, 0.5);
      function X(u) { return cx + T * u; } function Y(u) { return cy - T * u; }
      for (var i = 0; i < N; i++) {
        var vv = Math.min(1, Math.max(0, w[i]) / wmax);
        var p = curve.pts[i], q = curve.pts[(i + 1) % N];
        se[i].setAttribute('x1', cx + S * p[0]); se[i].setAttribute('y1', cy - S * p[1]); se[i].setAttribute('x2', cx + S * q[0]); se[i].setAttribute('y2', cy - S * q[1]);
        se[i].setAttribute('stroke-width', (1.2 + 6 * vv).toFixed(2)); se[i].setAttribute('stroke-opacity', (0.3 + 0.7 * vv).toFixed(2));
        var a = fv[i], b = fv[(i + 1) % N];
        ie[i].setAttribute('x1', X(a[0])); ie[i].setAttribute('y1', Y(a[1])); ie[i].setAttribute('x2', X(b[0])); ie[i].setAttribute('y2', Y(b[1]));
        ie[i].setAttribute('stroke-width', (1.2 + 6 * vv).toFixed(2)); ie[i].setAttribute('stroke-opacity', (0.3 + 0.7 * vv).toFixed(2));
      }
      zpt.setAttribute('cx', cx + S * z[0]); zpt.setAttribute('cy', cy - S * z[1]);
      v1.setAttribute('x1', X(0)); v1.setAttribute('y1', Y(0)); v1.setAttribute('x2', X(fz[0])); v1.setAttribute('y2', Y(fz[1]));
      v2.setAttribute('x1', X(fz[0])); v2.setAttribute('y1', Y(fz[1])); v2.setAttribute('x2', X(sum[0])); v2.setAttribute('y2', Y(sum[1]));
      pf.setAttribute('cx', X(fz[0])); pf.setAttribute('cy', Y(fz[1]));
      ps.setAttribute('cx', X(sum[0])); ps.setAttribute('cy', Y(sum[1]));
      pa.setAttribute('cx', X(sx / 2)); pa.setAttribute('cy', Y(sy / 2));
      labels[0].setAttribute('x', X(fz[0]) + 8); labels[0].setAttribute('y', Y(fz[1]) - 8);
      labels[1].setAttribute('x', X(sum[0]) + 8); labels[1].setAttribute('y', Y(sum[1]) + 16);
      labels[2].setAttribute('x', X(sx / 2) - 60); labels[2].setAttribute('y', Y(sy / 2) - 8);
      out.f.textContent = Math.hypot(fz[0], fz[1]).toFixed(2); out.g.textContent = Math.hypot(cg[0], cg[1]).toFixed(2);
      out.s.textContent = Math.hypot(sum[0], sum[1]).toFixed(2); out.m.textContent = mx.toFixed(2);
    }
    var drag = false;
    function setFrom(ev) {
      var r = dom.getBoundingClientRect(), k = W / r.width;
      var x = ((ev.clientX - r.left) * k - cx) / S, y = -((ev.clientY - r.top) * k - cy) / S;
      z = Domain.clamp(curve, [x, y], 0.96); render();
    }
    dom.addEventListener('pointerdown', function (ev) { drag = true; dom.setPointerCapture(ev.pointerId); setFrom(ev); });
    dom.addEventListener('pointermove', function (ev) { if (drag) setFrom(ev); });
    dom.addEventListener('pointerup', function () { drag = false; });
    shapeSel.addEventListener('change', function () { curve = Domain.build(Domain.shapes[shapeSel.value], N); z = Domain.clamp(curve, z, 0.96); render(); });
    fSel.addEventListener('change', render);
    render();
  }
  document.querySelectorAll('[data-viz=identity]').forEach(init);
})();

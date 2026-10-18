// The double-layer potential: boundary density of angle seen from z, and its integral.
(function () {
  function mk(t) { return document.createElementNS('http://www.w3.org/2000/svg', t); }

  function init(root) {
    var N = 360;
    var dom = root.querySelector('svg.dom'), plot = root.querySelector('svg.plot');
    var shapeSel = root.querySelector('select[name=shape]');
    var rI = root.querySelector('input[name=r]'), phI = root.querySelector('input[name=phi]'), arcI = root.querySelector('input[name=arc]');
    var out = { int: root.querySelector('[data-out=int]'), min: root.querySelector('[data-out=min]'), r: root.querySelector('[data-out=r]'), phi: root.querySelector('[data-out=phi]') };
    var W = 400, Hh = 320, cx = 200, cy = 160, S = 110;
    dom.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    plot.setAttribute('viewBox', '0 0 400 200');

    var curve = Domain.build(Domain.shapes[shapeSel.value], N);
    var segs = mk('g'); dom.appendChild(segs);
    var segEls = [];
    for (var i = 0; i < N; i++) { var e = mk('line'); e.setAttribute('stroke', '#f2b07a'); e.setAttribute('stroke-linecap', 'round'); segs.appendChild(e); segEls.push(e); }
    var wedge = mk('path'); wedge.setAttribute('fill', 'rgba(242,176,122,0.3)'); dom.appendChild(wedge);
    var tan = mk('line'); tan.setAttribute('stroke', '#b9b4a8'); tan.setAttribute('stroke-dasharray', '5 4'); tan.setAttribute('stroke-width', '1'); dom.appendChild(tan);
    var nrm = mk('line'); nrm.setAttribute('stroke', '#9cc9ea'); nrm.setAttribute('stroke-width', '2'); dom.appendChild(nrm);
    var zpt = mk('circle'); zpt.setAttribute('r', 6); zpt.setAttribute('fill', '#9cc9ea'); zpt.setAttribute('stroke', '#1f2b27'); zpt.setAttribute('stroke-width', 2); dom.appendChild(zpt);
    var zl = mk('text'); zl.setAttribute('fill', '#9cc9ea'); zl.setAttribute('font-size', '14'); zl.setAttribute('font-style', 'italic'); zl.textContent = 'z'; dom.appendChild(zl);
    var sl = mk('text'); sl.setAttribute('fill', '#e9e5da'); sl.setAttribute('font-size', '14'); sl.setAttribute('font-style', 'italic'); sl.textContent = 'σ'; dom.appendChild(sl);
    var nl = mk('text'); nl.setAttribute('fill', '#9cc9ea'); nl.setAttribute('font-size', '14'); nl.setAttribute('font-style', 'italic'); nl.textContent = 'ν'; dom.appendChild(nl);

    var ax1 = mk('line'); ax1.setAttribute('x1', 36); ax1.setAttribute('x2', 390); ax1.setAttribute('y1', 170); ax1.setAttribute('y2', 170); ax1.setAttribute('stroke', '#7f7b72'); plot.appendChild(ax1);
    var ax2 = mk('line'); ax2.setAttribute('x1', 36); ax2.setAttribute('x2', 36); ax2.setAttribute('y1', 20); ax2.setAttribute('y2', 170); ax2.setAttribute('stroke', '#7f7b72'); plot.appendChild(ax2);
    var curveEl = mk('path'); curveEl.setAttribute('fill', 'rgba(242,176,122,0.18)'); curveEl.setAttribute('stroke', '#f2b07a'); curveEl.setAttribute('stroke-width', '2'); plot.appendChild(curveEl);
    var cursor = mk('line'); cursor.setAttribute('stroke', '#9cc9ea'); cursor.setAttribute('stroke-dasharray', '3 3'); plot.appendChild(cursor);
    var t1 = mk('text'); t1.setAttribute('x', 390); t1.setAttribute('y', 190); t1.setAttribute('text-anchor', 'end'); t1.setAttribute('fill', '#7f7b72'); t1.setAttribute('font-size', '12'); t1.textContent = 'arclength s around ∂Ω'; plot.appendChild(t1);
    var t2 = mk('text'); t2.setAttribute('x', 42); t2.setAttribute('y', 16); t2.setAttribute('fill', '#7f7b72'); t2.setAttribute('font-size', '12'); t2.textContent = 'μ(σ(s), z)'; plot.appendChild(t2);

    var rho = 0.6, phi = 0.5;
    function zpos() {
      var N2 = curve.N, k = Math.round(((phi + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * N2) % N2;
      var b = curve.pts[k];
      return [rho * b[0], rho * b[1]];
    }

    function render() {
      var z = zpos(), dn = Domain.density(curve, z), m = dn.mu, w = dn.w;
      var mx = 0, mn = Infinity, tot = 0;
      for (var i = 0; i < N; i++) { tot += w[i]; if (m[i] > mx) mx = m[i]; if (m[i] < mn) mn = m[i]; }
      var cap = Math.max(mx, 0.02);
      for (var i = 0; i < N; i++) {
        var p = curve.pts[i], q = curve.pts[(i + 1) % N], v = Math.min(1, Math.max(0, m[i]) / cap);
        segEls[i].setAttribute('x1', cx + S * p[0]); segEls[i].setAttribute('y1', cy - S * p[1]);
        segEls[i].setAttribute('x2', cx + S * q[0]); segEls[i].setAttribute('y2', cy - S * q[1]);
        segEls[i].setAttribute('stroke-width', (1.2 + 7 * v).toFixed(2)); segEls[i].setAttribute('stroke-opacity', (0.3 + 0.7 * v).toFixed(2));
      }
      zpt.setAttribute('cx', cx + S * z[0]); zpt.setAttribute('cy', cy - S * z[1]);
      zl.setAttribute('x', cx + S * z[0] + 9); zl.setAttribute('y', cy - S * z[1] + 16);
      var k = parseInt(arcI.value, 10) % N, k2 = (k + 14) % N, p = curve.pts[k], q = curve.pts[k2];
      wedge.setAttribute('d', 'M' + (cx + S * z[0]) + ' ' + (cy - S * z[1]) + ' L' + (cx + S * p[0]) + ' ' + (cy - S * p[1]) + ' L' + (cx + S * q[0]) + ' ' + (cy - S * q[1]) + ' Z');
      var d = curve.der[k], sp = Math.hypot(d[0], d[1]), ux = d[0] / sp, uy = d[1] / sp;
      tan.setAttribute('x1', cx + S * (p[0] - 0.7 * ux)); tan.setAttribute('y1', cy - S * (p[1] - 0.7 * uy));
      tan.setAttribute('x2', cx + S * (p[0] + 0.7 * ux)); tan.setAttribute('y2', cy - S * (p[1] + 0.7 * uy));
      var nx = uy, ny = -ux; // outward normal for counterclockwise parametrisation
      nrm.setAttribute('x1', cx + S * p[0]); nrm.setAttribute('y1', cy - S * p[1]);
      nrm.setAttribute('x2', cx + S * (p[0] + 0.3 * nx)); nrm.setAttribute('y2', cy - S * (p[1] + 0.3 * ny));
      sl.setAttribute('x', cx + S * p[0] - 0.22 * S * nx - 5); sl.setAttribute('y', cy - S * p[1] + 0.22 * S * ny + 5);
      nl.setAttribute('x', cx + S * (p[0] + 0.36 * nx) - 4); nl.setAttribute('y', cy - S * (p[1] + 0.36 * ny) + 5);
      var ymax = Math.max(cap, 0.3), path = '';
      for (var i = 0; i <= N; i++) {
        var s = curve.cum[i] / curve.L, v = m[i % N];
        path += (i ? 'L' : 'M') + (36 + 354 * s).toFixed(1) + ' ' + (170 - 150 * Math.min(Math.max(v, 0) / ymax, 1)).toFixed(1);
      }
      curveEl.setAttribute('d', path + 'L390 170 L36 170 Z');
      var cs = 36 + 354 * curve.cum[k] / curve.L;
      cursor.setAttribute('x1', cs); cursor.setAttribute('x2', cs); cursor.setAttribute('y1', 20); cursor.setAttribute('y2', 170);
      out.int.textContent = tot.toFixed(2); out.min.textContent = mn.toFixed(2);
      out.r.textContent = (1 - rho).toFixed(2); out.phi.textContent = Math.round(phi * 180 / Math.PI);
    }

    rI.addEventListener('input', function () { rho = 1 - rI.value / 100; render(); });
    phI.addEventListener('input', function () { phi = phI.value * Math.PI / 180; render(); });
    arcI.addEventListener('input', render);
    shapeSel.addEventListener('change', function () { curve = Domain.build(Domain.shapes[shapeSel.value], N); render(); });

    var drag = false;
    function setFrom(ev) {
      var r = dom.getBoundingClientRect(), k = W / r.width;
      var x = ((ev.clientX - r.left) * k - cx) / S, y = -((ev.clientY - r.top) * k - cy) / S;
      var ang = Math.atan2(y, x), N2 = curve.N;
      var kk = Math.round(((ang + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * N2) % N2;
      var b = curve.pts[kk], rb = Math.hypot(b[0], b[1]), rz = Math.hypot(x, y);
      rho = Math.min(1, rz / rb); phi = ang;
      rI.value = Math.round(100 * (1 - rho)); phI.value = Math.round(((phi * 180 / Math.PI) + 360) % 360);
      render();
    }
    dom.addEventListener('pointerdown', function (ev) { drag = true; dom.setPointerCapture(ev.pointerId); setFrom(ev); });
    dom.addEventListener('pointermove', function (ev) { if (drag) setFrom(ev); });
    dom.addEventListener('pointerup', function () { drag = false; });
    render();
  }
  document.querySelectorAll('[data-viz=dlp]').forEach(init);
})();

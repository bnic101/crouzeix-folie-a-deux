// Smooth convex domains, sampled by parameter, with tangent vectors by central differences.
// Each curve: {pts: [[x,y],...], der: [[dx,dy],...], cum: [0,...,L]} with N points.
window.Domain = (function () {
  function build(fn, N) {
    var pts = [], der = [], cum = [0];
    for (var i = 0; i < N; i++) pts.push(fn(2 * Math.PI * i / N));
    for (var i = 0; i < N; i++) {
      var p = pts[(i + 1) % N], q = pts[(i + N - 1) % N];
      var dt = 4 * Math.PI / N;
      der.push([(p[0] - q[0]) / dt, (p[1] - q[1]) / dt]);
    }
    for (var i = 1; i <= N; i++) {
      var a = pts[i % N], b = pts[i - 1];
      cum.push(cum[i - 1] + Math.hypot(a[0] - b[0], a[1] - b[1]));
    }
    return { pts: pts, der: der, cum: cum, N: N, L: cum[N] };
  }

  var shapes = {
    ellipse: function (t) { return [1.3 * Math.cos(t), 0.9 * Math.sin(t)]; },
    squircle: function (t) {
      var c = Math.cos(t), s = Math.sin(t);
      var sg = function (u) { return u < 0 ? -1 : 1; };
      return [1.15 * sg(c) * Math.pow(Math.abs(c), 0.5), 0.95 * sg(s) * Math.pow(Math.abs(s), 0.5)];
    },
    egg: function (t) {
      var r = 1.05 + 0.18 * Math.cos(t) - 0.06 * Math.cos(2 * t);
      return [r * Math.cos(t), 0.85 * r * Math.sin(t)];
    }
  };

  // Scalar double-layer density mu(sigma_i, z) per unit arclength, and the weights mu ds.
  function density(curve, z) {
    var N = curve.N, out = [], w = [];
    for (var i = 0; i < N; i++) {
      var p = curve.pts[i], d = curve.der[i];
      var w0 = p[0] - z[0], w1 = p[1] - z[1];
      var n2 = w0 * w0 + w1 * w1;
      var sp = Math.hypot(d[0], d[1]);
      if (n2 < 1e-10) { out.push(null); w.push(null); continue; }
      var im = (d[1] * w0 - d[0] * w1) / n2;   // Im(sigma' / (sigma - z))
      out.push(im / sp / Math.PI);
      w.push(im * (2 * Math.PI / N) / Math.PI);
    }
    for (var i = 0; i < N; i++) if (out[i] === null) {
      out[i] = 0.5 * (out[(i + 1) % N] + out[(i + N - 1) % N]);
      w[i] = 0.5 * (w[(i + 1) % N] + w[(i + N - 1) % N]);
    }
    return { mu: out, w: w };
  }

  // Clamp a point to lie inside the curve (radially), returning scaled point and radial fraction.
  function clamp(curve, z, maxFrac) {
    var ang = Math.atan2(z[1], z[0]);
    var N = curve.N;
    var k = Math.round(((ang + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * N) % N;
    var b = curve.pts[k];
    var rb = Math.hypot(b[0], b[1]), rz = Math.hypot(z[0], z[1]);
    if (rz > maxFrac * rb) { var s = maxFrac * rb / rz; return [z[0] * s, z[1] * s]; }
    return z;
  }

  return { build: build, shapes: shapes, density: density, clamp: clamp };
})();

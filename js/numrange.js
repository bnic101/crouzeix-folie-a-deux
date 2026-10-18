// Numerical range explorer. Complex numbers are [re, im]; matrices are arrays of rows.
(function () {
  function cadd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function conj(a) { return [a[0], -a[1]]; }

  // Cyclic Jacobi for a real symmetric matrix. Returns {vals, vecs} with vecs as columns.
  function jacobi(M) {
    var m = M.length, A = M.map(function (r) { return r.slice(); });
    var V = [];
    for (var i = 0; i < m; i++) { V.push([]); for (var j = 0; j < m; j++) V[i].push(i === j ? 1 : 0); }
    for (var sweep = 0; sweep < 60; sweep++) {
      var off = 0;
      for (var i = 0; i < m; i++) for (var j = i + 1; j < m; j++) off += A[i][j] * A[i][j];
      if (off < 1e-22) break;
      for (var p = 0; p < m; p++) for (var q = p + 1; q < m; q++) {
        if (Math.abs(A[p][q]) < 1e-14) continue;
        var theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        var t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        var c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (var k = 0; k < m; k++) {
          var akp = A[k][p], akq = A[k][q];
          A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq;
        }
        for (var k = 0; k < m; k++) {
          var apk = A[p][k], aqk = A[q][k];
          A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk;
        }
        for (var k = 0; k < m; k++) {
          var vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq;
        }
      }
    }
    var vals = [];
    for (var i = 0; i < m; i++) vals.push(A[i][i]);
    return { vals: vals, vecs: V };
  }

  // Largest eigenvalue and eigenvector of a complex Hermitian matrix.
  function hermMax(H) {
    var n = H.length, M = [];
    for (var i = 0; i < 2 * n; i++) { M.push([]); for (var j = 0; j < 2 * n; j++) M[i].push(0); }
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var a = H[i][j][0], b = H[i][j][1];
      M[i][j] = a; M[i + n][j + n] = a; M[i][j + n] = -b; M[i + n][j] = b;
    }
    var e = jacobi(M), best = 0;
    for (var k = 1; k < 2 * n; k++) if (e.vals[k] > e.vals[best]) best = k;
    var x = [];
    for (var i = 0; i < n; i++) x.push([e.vecs[i][best], e.vecs[i + n][best]]);
    var nrm = 0; for (var i = 0; i < n; i++) nrm += x[i][0] * x[i][0] + x[i][1] * x[i][1];
    nrm = Math.sqrt(nrm);
    for (var i = 0; i < n; i++) x[i] = [x[i][0] / nrm, x[i][1] / nrm];
    return { val: e.vals[best], vec: x };
  }

  function quadForm(T, x) { // <Tx, x> = x* T x
    var n = T.length, s = [0, 0];
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) s = cadd(s, cmul(cmul(conj(x[i]), T[i][j]), x[j]));
    return s;
  }

  function realPart(T, theta) { // (e^{-i theta} T + e^{i theta} T*) / 2
    var n = T.length, e = [Math.cos(theta), -Math.sin(theta)], H = [];
    for (var i = 0; i < n; i++) { H.push([]); for (var j = 0; j < n; j++) {
      var a = cmul(e, T[i][j]), b = conj(cmul(e, T[j][i]));
      H[i].push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    } }
    return H;
  }

  function opNorm(T) {
    var n = T.length, G = [];
    for (var i = 0; i < n; i++) { G.push([]); for (var j = 0; j < n; j++) {
      var s = [0, 0];
      for (var k = 0; k < n; k++) s = cadd(s, cmul(conj(T[k][i]), T[k][j]));
      G[i].push(s);
    } }
    return Math.sqrt(Math.max(0, hermMax(G).val));
  }

  function boundary(T, K) {
    var pts = [], w = 0;
    for (var k = 0; k < K; k++) {
      var th = 2 * Math.PI * k / K;
      var r = hermMax(realPart(T, th));
      if (r.val > w) w = r.val;
      pts.push(quadForm(T, r.vec));
    }
    return { pts: pts, radius: w };
  }

  function R(v) { return [v, 0]; }
  function Z() { return [0, 0]; }

  var examples = {
    nilpotent: { name: 'N = [[0,1],[0,0]]', T: [[Z(), R(1)], [Z(), Z()]], eig: [Z(), Z()],
      note: 'W(N) is the disk of radius 1/2. ||N|| = 1, so ||N|| / w(N) = 2.' },
    normal: { name: 'diag(1, i, -1)', T: [[R(1), Z(), Z()], [Z(), [0, 1], Z()], [Z(), Z(), R(-1)]], eig: [R(1), [0, 1], R(-1)],
      note: 'Normal: W is the convex hull of the spectrum.' },
    ellipse: { name: '[[1,1],[0,-1]]', T: [[R(1), R(1)], [Z(), R(-1)]], eig: [R(1), R(-1)],
      note: 'A 2x2 matrix: an ellipse with the eigenvalues as foci and minor axis |t12|.' },
    jordan3: { name: 'J3(0), the 3x3 Jordan block', T: [[Z(), R(1), Z()], [Z(), Z(), R(1)], [Z(), Z(), Z()]], eig: [Z(), Z(), Z()],
      note: 'W is the disk of radius cos(pi/4) = 0.707; ||T|| = 1. Ratio 1.41.' },
    shift4: { name: 'weighted shift, weights 1, 0.5, 1', T: [[Z(), R(1), Z(), Z()], [Z(), Z(), R(0.5), Z()], [Z(), Z(), Z(), R(1)], [Z(), Z(), Z(), Z()]], eig: [Z(), Z(), Z(), Z()],
      note: 'Nilpotent weighted shift: W is a disk about 0 (Crouzeix and Greenbaum, complete 2-spectral set).' },
    tri3: { name: '[[1,1,0],[0,i,1],[0,0,-1]]', T: [[R(1), R(1), Z()], [Z(), [0, 1], R(1)], [Z(), Z(), R(-1)]], eig: [R(1), [0, 1], R(-1)],
      note: 'Same spectrum as the triangle, but now W is strictly larger than the convex hull.' },
    custom: { name: 'upper triangular 2x2', custom: true, note: 'Eigenvalues l1, l2 on the real axis; the off-diagonal entry g sets the minor axis.' }
  };

  function init(root) {
    var svg = root.querySelector('svg');
    var sel = root.querySelector('select');
    var sliders = root.querySelector('.custom');
    var out = {
      norm: root.querySelector('[data-out=norm]'), rad: root.querySelector('[data-out=rad]'),
      ratio: root.querySelector('[data-out=ratio]'), note: root.querySelector('[data-out=note]'),
      mat: root.querySelector('[data-out=mat]')
    };
    var W = 400, Hh = 320, cx = 200, cy = 160, S = 70;
    function X(v) { return cx + S * v; } function Y(v) { return cy - S * v; }

    var g = {
      grid: mk('g'), region: mk('path'), eig: mk('g'), wcirc: mk('circle'), ncirc: mk('circle')
    };
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
    svg.appendChild(g.grid);
    svg.appendChild(g.region); svg.appendChild(g.ncirc); svg.appendChild(g.wcirc); svg.appendChild(g.eig);
    g.region.setAttribute('fill', 'rgba(156,201,234,0.22)'); g.region.setAttribute('stroke', '#9cc9ea'); g.region.setAttribute('stroke-width', '2');
    g.wcirc.setAttribute('fill', 'none'); g.wcirc.setAttribute('stroke', '#9cc9ea'); g.wcirc.setAttribute('stroke-dasharray', '4 4'); g.wcirc.setAttribute('stroke-opacity', '0.5');
    g.ncirc.setAttribute('fill', 'none'); g.ncirc.setAttribute('stroke', '#f2b07a'); g.ncirc.setAttribute('stroke-dasharray', '4 4'); g.ncirc.setAttribute('stroke-opacity', '0.5');
    for (var v = -2; v <= 2; v++) {
      var l1 = mk('line'); l1.setAttribute('x1', X(v)); l1.setAttribute('x2', X(v)); l1.setAttribute('y1', 10); l1.setAttribute('y2', Hh - 10);
      l1.setAttribute('stroke', 'rgba(233,229,218,' + (v === 0 ? 0.35 : 0.1) + ')'); g.grid.appendChild(l1);
      var l2 = mk('line'); l2.setAttribute('y1', Y(v)); l2.setAttribute('y2', Y(v)); l2.setAttribute('x1', 10); l2.setAttribute('x2', W - 10);
      l2.setAttribute('stroke', 'rgba(233,229,218,' + (v === 0 ? 0.35 : 0.1) + ')'); g.grid.appendChild(l2);
    }
    var lab = mk('text'); lab.setAttribute('x', W - 12); lab.setAttribute('y', Hh - 12); lab.setAttribute('text-anchor', 'end');
    lab.setAttribute('fill', '#7f7b72'); lab.setAttribute('font-size', '11'); lab.textContent = 'dashed: |z| = w(T) blue, |z| = ||T|| orange';
    svg.appendChild(lab);

    function mk(t) { return document.createElementNS('http://www.w3.org/2000/svg', t); }

    function current() {
      var key = sel.value, ex = examples[key];
      if (ex.custom) {
        var l1 = parseFloat(sliders.querySelector('[name=l1]').value), l2 = parseFloat(sliders.querySelector('[name=l2]').value), gg = parseFloat(sliders.querySelector('[name=g]').value);
        return { T: [[R(l1), R(gg)], [Z(), R(l2)]], eig: [R(l1), R(l2)], note: ex.note };
      }
      return ex;
    }

    function fmtC(c) {
      var re = Math.round(c[0] * 100) / 100, im = Math.round(c[1] * 100) / 100;
      if (im === 0) return String(re);
      if (re === 0) return (im === 1 ? '' : im === -1 ? '-' : im) + 'i';
      return re + (im > 0 ? ' + ' : ' - ') + (Math.abs(im) === 1 ? '' : Math.abs(im)) + 'i';
    }

    function render() {
      var ex = current(), T = ex.T;
      var b = boundary(T, 180), nrm = opNorm(T);
      var d = '';
      for (var i = 0; i < b.pts.length; i++) d += (i ? 'L' : 'M') + X(b.pts[i][0]).toFixed(1) + ' ' + Y(b.pts[i][1]).toFixed(1);
      g.region.setAttribute('d', d + 'Z');
      while (g.eig.firstChild) g.eig.removeChild(g.eig.firstChild);
      ex.eig.forEach(function (e) {
        var c = mk('circle'); c.setAttribute('cx', X(e[0])); c.setAttribute('cy', Y(e[1])); c.setAttribute('r', 4); c.setAttribute('fill', '#f2b07a'); g.eig.appendChild(c);
      });
      g.wcirc.setAttribute('cx', cx); g.wcirc.setAttribute('cy', cy); g.wcirc.setAttribute('r', S * b.radius);
      g.ncirc.setAttribute('cx', cx); g.ncirc.setAttribute('cy', cy); g.ncirc.setAttribute('r', S * nrm);
      out.norm.textContent = nrm.toFixed(3);
      out.rad.textContent = b.radius.toFixed(3);
      out.ratio.textContent = b.radius > 1e-9 ? (nrm / b.radius).toFixed(3) : '-';
      out.note.textContent = ex.note;
      out.mat.textContent = 'T = [' + T.map(function (r) { return '[' + r.map(fmtC).join(', ') + ']'; }).join(', ') + ']';
      sliders.style.display = examples[sel.value].custom ? '' : 'none';
    }
    sel.addEventListener('change', render);
    sliders.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () {
      inp.nextElementSibling.textContent = parseFloat(inp.value).toFixed(2); render(); }); });
    render();
  }

  document.querySelectorAll('[data-viz=numrange]').forEach(init);
})();

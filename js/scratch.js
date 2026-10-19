// Scratchboard: a drawing overlay for mouse, touch and pen. Strokes are kept per slide.
(function () {
  var btn = document.getElementById('scratch-btn');
  var overlay = document.getElementById('scratch');
  var canvas = overlay.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var tools = overlay.querySelector('.scratch-tools');
  var colors = { chalk: '#e9e5da', orange: '#f2b07a', blue: '#9cc9ea' };
  var state = { open: false, color: colors.chalk, width: 3, eraser: false, drawing: false, last: null, penSeen: 0, penOnly: false };
  var store = {};       // slide index -> ImageData
  var slideIndex = 0;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    var w = overlay.clientWidth, h = overlay.clientHeight;
    var keep = canvas.width ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (keep) ctx.putImageData(keep, 0, 0);
  }

  function save() { if (canvas.width) store[slideIndex] = ctx.getImageData(0, 0, canvas.width, canvas.height); }
  function load(i) {
    slideIndex = i;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();
    if (store[i]) ctx.putImageData(store[i], 0, 0);
  }

  function setOpen(v) {
    state.open = v;
    overlay.classList.toggle('open', v);
    btn.classList.toggle('on', v);
    if (v) { resize(); load(slideIndex); }
  }

  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure || 0.5, t: e.pointerType };
  }

  function width(pt) {
    var base = state.eraser ? 28 : state.width;
    if (pt.t === 'pen') return base * (0.4 + 1.6 * pt.p);
    return base;
  }

  function setPenOnly(v) {
    state.penOnly = v;
    var b = tools.querySelector('[data-act=penonly]');
    if (b) b.classList.toggle('on', v);
  }
  function rejected(e) {
    // Palm rejection: once a pen has been used, only the pen draws.
    if (e.pointerType === 'pen') { state.penSeen = Date.now(); if (!state.penOnly) setPenOnly(true); return false; }
    if (state.penOnly && e.pointerType === 'touch') return true;
    if (e.pointerType === 'touch' && Date.now() - state.penSeen < 3000) return true;
    return false;
  }
  function down(e) {
    if (e.target !== canvas) return;
    if (rejected(e)) { e.preventDefault(); return; }
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    state.drawing = true; state.last = pos(e);
    ctx.globalCompositeOperation = state.eraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = state.color; ctx.lineWidth = width(state.last);
    ctx.beginPath(); ctx.moveTo(state.last.x, state.last.y); ctx.lineTo(state.last.x + 0.01, state.last.y); ctx.stroke();
    e.preventDefault();
  }
  function move(e) {
    if (!state.drawing) return;
    if (state.penOnly && e.pointerType !== 'pen') return;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (var i = 0; i < evs.length; i++) {
      var p = pos(evs[i]);
      ctx.lineWidth = width(p);
      ctx.beginPath(); ctx.moveTo(state.last.x, state.last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      state.last = p;
    }
    e.preventDefault();
  }
  function up(e) { if (state.drawing) { state.drawing = false; save(); } }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', up);
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  tools.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'color') { state.color = colors[b.getAttribute('data-color')]; state.eraser = false; }
    else if (act === 'eraser') { state.eraser = !state.eraser; }
    else if (act === 'penonly') { setPenOnly(!state.penOnly); return; }
    else if (act === 'thin') { state.width = 2; }
    else if (act === 'thick') { state.width = 5; }
    else if (act === 'clear') { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore(); delete store[slideIndex]; }
    else if (act === 'close') { setOpen(false); }
    tools.querySelectorAll('button:not([data-act=penonly])').forEach(function (x) { x.classList.remove('on'); });
    if (act === 'color' || act === 'eraser' || act === 'thin' || act === 'thick') {
      if (state.eraser) tools.querySelector('[data-act=eraser]').classList.add('on');
      else tools.querySelector('[data-color="' + Object.keys(colors).find(function (k) { return colors[k] === state.color; }) + '"]').classList.add('on');
      tools.querySelector(state.width === 2 ? '[data-act=thin]' : '[data-act=thick]').classList.add('on');
    }
  });

  btn.addEventListener('click', function () { setOpen(!state.open); });
  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (e.key === 'd') setOpen(!state.open);
    else if (e.key === 'Escape' && state.open) setOpen(false);
  });
  document.addEventListener('slideshown', function (e) {
    if (state.open) save();
    slideIndex = e.detail.index;
    if (state.open) load(slideIndex);
  });
  window.addEventListener('resize', function () { if (state.open) resize(); });

  // Arrow keys still move slides while drawing; the overlay only captures pointer events.
  tools.querySelector('[data-color=chalk]').classList.add('on');
  tools.querySelector('[data-act=thick]').classList.add('on');
  state.width = 5;
})();

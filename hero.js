// Home page hero: a Fourier series (a chain of rotating circles) draws the letter S,
// the same shape as the site icon. Plain 2D canvas, about 4 KB, no libraries.
// It runs only while the board is on screen, stops in background tabs,
// and shows a still picture when the visitor prefers reduced motion.
(function () {
  var canvas = document.getElementById('boardCanvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var board = canvas.parentNode;
  var countEl = document.getElementById('boardCount');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 1. outline of a bold S (centre line = the favicon curve, thickened) ----
  var SEG = [[72,27, 66,15, 30,14, 30,35], [30,35, 30,52, 70,48, 70,65], [70,65, 70,86, 34,85, 28,73]];
  var HALF = 7.4;       // half the stroke width, in the 100 x 100 design box
  var N = 640;          // samples around the outline
  var TWO_PI = Math.PI * 2;

  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * s[0] + b * s[2] + c * s[4] + d * s[6], a * s[1] + b * s[3] + c * s[5] + d * s[7]];
  }
  function outline() {
    var c = [], i, j;
    for (i = 0; i < SEG.length; i++) for (j = 0; j < 48; j++) c.push(bez(SEG[i], j / 48));
    c.push(bez(SEG[SEG.length - 1], 1));
    var n = c.length, left = [], right = [], t = [];
    for (i = 0; i < n; i++) {
      var p = c[Math.max(0, i - 1)], q = c[Math.min(n - 1, i + 1)];
      var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= l; dy /= l; t.push([dx, dy]);
      left.push([c[i][0] - dy * HALF, c[i][1] + dx * HALF]);
      right.push([c[i][0] + dy * HALF, c[i][1] - dx * HALF]);
    }
    var pts = left.slice(), e = c[n - 1], te = t[n - 1], ne = [-te[1], te[0]], a;
    for (a = 0.2; a < Math.PI; a += 0.2) pts.push([e[0] + HALF * (ne[0] * Math.cos(a) + te[0] * Math.sin(a)), e[1] + HALF * (ne[1] * Math.cos(a) + te[1] * Math.sin(a))]);
    for (i = n - 1; i >= 0; i--) pts.push(right[i]);
    var s0 = c[0], ts = t[0], ns = [-ts[1], ts[0]];
    for (a = 0.2; a < Math.PI; a += 0.2) pts.push([s0[0] + HALF * (-ns[0] * Math.cos(a) - ts[0] * Math.sin(a)), s0[1] + HALF * (-ns[1] * Math.cos(a) - ts[1] * Math.sin(a))]);
    return pts;
  }
  function resample(pts, m) {
    var cum = [0], i, k = 0, out = [];
    for (i = 1; i <= pts.length; i++) {
      var a = pts[i - 1], b = pts[i % pts.length];
      cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    var total = cum[cum.length - 1];
    for (i = 0; i < m; i++) {
      var d = total * i / m;
      while (cum[k + 1] < d) k++;
      var f = (d - cum[k]) / ((cum[k + 1] - cum[k]) || 1), p0 = pts[k], p1 = pts[(k + 1) % pts.length];
      out.push([p0[0] + (p1[0] - p0[0]) * f - 50, p0[1] + (p1[1] - p0[1]) * f - 50]);
    }
    return out;
  }

  // ---- 2. discrete Fourier transform -> list of circles (frequency, radius, phase) ----
  var path = resample(outline(), N);
  var cosT = new Float32Array(N), sinT = new Float32Array(N);
  for (var q = 0; q < N; q++) { cosT[q] = Math.cos(TWO_PI * q / N); sinT[q] = Math.sin(TWO_PI * q / N); }
  var terms = [], K = 44, k, j, c0 = [0, 0];
  for (k = -K; k <= K; k++) {
    var re = 0, im = 0;
    for (j = 0; j < N; j++) {
      var idx = ((k * j) % N + N) % N, cs = cosT[idx], sn = sinT[idx];
      re += path[j][0] * cs + path[j][1] * sn;     // z * e^(-i...)
      im += path[j][1] * cs - path[j][0] * sn;
    }
    re /= N; im /= N;
    if (k === 0) c0 = [re, im]; else terms.push({ k: k, r: Math.hypot(re, im), a: Math.atan2(im, re) });
  }
  terms.sort(function (x, y) { return y.r - x.r; });

  // ---- 3. drawing state ----
  var W = 0, H = 0, dpr = 1, scale = 1, cx = 0, cy = 0, M = 40, chain = [];
  var axes = document.createElement('canvas'), trail = document.createElement('canvas'), glow = document.createElement('canvas');
  var tx = trail.getContext('2d'), gx = glow.getContext('2d');
  var DRAW = 13000, HOLD = 4200, FADE = 1500, GAP = 600, CYCLE = DRAW + HOLD + FADE + GAP;
  var clock = 0, lastU = 0, lastPt = null, glowDrawn = false, running = false, visible = true, last = 0;

  function tip(u, withChain) {
    var x = c0[0], y = c0[1], i, ang;
    if (withChain) chain.length = 0;
    for (i = 0; i < M; i++) {
      var t = terms[i]; ang = TWO_PI * t.k * u + t.a;
      var nx = x + t.r * Math.cos(ang), ny = y + t.r * Math.sin(ang);
      if (withChain) chain.push([x, y, t.r, nx, ny]);
      x = nx; y = ny;
    }
    return [cx + x * scale, cy + y * scale];
  }

  function drawAxes() {
    var a = axes.getContext('2d'), s = dpr, i, v;
    a.clearRect(0, 0, axes.width, axes.height);
    a.strokeStyle = 'rgba(243,238,226,.30)'; a.lineWidth = 1.2 * s; a.beginPath();
    a.moveTo(W * .05 * s, cy * s); a.lineTo(W * .95 * s, cy * s);
    a.moveTo(cx * s, H * .06 * s); a.lineTo(cx * s, H * .86 * s); a.stroke();
    a.fillStyle = 'rgba(243,238,226,.30)';          // arrow heads
    a.beginPath(); a.moveTo(W * .95 * s, cy * s); a.lineTo((W * .95 - 8) * s, (cy - 4) * s); a.lineTo((W * .95 - 8) * s, (cy + 4) * s); a.fill();
    a.beginPath(); a.moveTo(cx * s, H * .06 * s); a.lineTo((cx - 4) * s, (H * .06 + 8) * s); a.lineTo((cx + 4) * s, (H * .06 + 8) * s); a.fill();
    var step = W * .125;
    a.lineWidth = 1 * s; a.strokeStyle = 'rgba(243,238,226,.4)'; a.beginPath();
    for (i = -3; i <= 3; i++) {
      if (!i) continue;
      a.moveTo((cx + i * step) * s, (cy - 4) * s); a.lineTo((cx + i * step) * s, (cy + 4) * s);
      a.moveTo((cx - 4) * s, (cy - i * step) * s); a.lineTo((cx + 4) * s, (cy - i * step) * s);
    }
    a.stroke();
    a.fillStyle = 'rgba(193,203,195,.78)'; a.font = 'italic ' + (13 * s) + 'px "LM Roman", Georgia, serif'; a.textAlign = 'center';
    for (i = -3; i <= 3; i++) {
      if (!i) continue;
      v = String(i).replace('-', '−');
      a.fillText(v, (cx + i * step) * s, (cy + 19) * s);
    }
    a.textAlign = 'right';
    for (i = -2; i <= 3; i++) { if (!i) continue; v = String(i).replace('-', '−'); a.fillText(v, (cx - 9) * s, (cy - i * step + 4) * s); }
    a.textAlign = 'left'; a.fillText('x', (W * .95 - 4) * s, (cy - 12) * s); a.fillText('y', (cx + 10) * s, (H * .06 + 12) * s);
  }

  function setup() {
    var r = board.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, r.width < 460 ? 1.75 : 2);
    W = r.width; H = r.height;
    [canvas, axes, trail, glow].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    cx = W / 2; cy = H * .47; scale = H * .60 / 80;
    M = W < 400 ? 32 : 48;
    if (countEl) countEl.textContent = M;
    drawAxes();
    clock = reduce ? DRAW + 2500 : 0; lastU = 0; lastPt = null; glowDrawn = false;
    tx.clearRect(0, 0, trail.width, trail.height); gx.clearRect(0, 0, glow.width, glow.height);
    if (reduce) { paintFinal(); render(DRAW + 2500); } else { render(0); }
  }

  function strokeSeg(a, b) {
    tx.strokeStyle = '#f2c46a'; tx.lineWidth = 2.4 * dpr; tx.lineCap = 'round';
    tx.beginPath(); tx.moveTo(a[0] * dpr, a[1] * dpr); tx.lineTo(b[0] * dpr, b[1] * dpr); tx.stroke();
  }
  function paintFinal() {            // complete S, for the still picture and the hold phase
    var i, p;
    tx.clearRect(0, 0, trail.width, trail.height);
    lastPt = tip(0, false);
    for (i = 1; i <= 360; i++) { p = tip(i / 360, false); strokeSeg(lastPt, p); lastPt = p; }
    lastU = 1;
  }
  function paintGlow() {
    var i, p = tip(0, false);
    gx.clearRect(0, 0, glow.width, glow.height);
    gx.strokeStyle = 'rgba(236,180,78,.20)'; gx.lineWidth = 11 * dpr; gx.lineJoin = 'round'; gx.lineCap = 'round';
    gx.beginPath(); gx.moveTo(p[0] * dpr, p[1] * dpr);
    for (i = 1; i <= 240; i++) { p = tip(i / 240, false); gx.lineTo(p[0] * dpr, p[1] * dpr); }
    gx.stroke(); glowDrawn = true;
  }

  function render(t) {
    var phase, u, alphaCircles = 1, alphaTrail = 1, alphaGlow = 0, p, i;
    if (t < DRAW) { phase = 0; u = t / DRAW; }
    else if (t < DRAW + HOLD) { phase = 1; u = 1; var h = t - DRAW; alphaCircles = Math.max(0, 1 - h / 1000); alphaGlow = Math.min(1, h / 1200); }
    else if (t < DRAW + HOLD + FADE) { phase = 2; u = 1; alphaGlow = alphaTrail = 1 - (t - DRAW - HOLD) / FADE; alphaCircles = 0; }
    else { phase = 3; u = 1; alphaGlow = alphaTrail = 0; alphaCircles = 0; }

    if (phase === 0) {                 // extend the trail up to the current point
      var steps = Math.max(1, Math.ceil((u - lastU) / .0016)), s;
      if (!lastPt) lastPt = tip(0, false);
      for (s = 1; s <= steps; s++) { p = tip(lastU + (u - lastU) * s / steps, false); strokeSeg(lastPt, p); lastPt = p; }
      lastU = u;
    } else if (phase === 1 && lastU < 1) { paintFinal(); }
    if (phase >= 1 && alphaGlow > 0 && !glowDrawn) paintGlow();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(axes, 0, 0);
    if (alphaGlow > 0) { ctx.globalAlpha = alphaGlow; ctx.drawImage(glow, 0, 0); }
    ctx.globalAlpha = alphaTrail; ctx.drawImage(trail, 0, 0); ctx.globalAlpha = 1;

    if (alphaCircles > 0) {
      var head = tip(u, true);
      ctx.save(); ctx.scale(dpr, dpr); ctx.globalAlpha = alphaCircles;
      ctx.lineWidth = 1;
      for (i = 0; i < chain.length; i++) {
        var c = chain[i], px = cx + c[0] * scale, py = cy + c[1] * scale, rr = c[2] * scale;
        if (rr > 1.2) { ctx.strokeStyle = 'rgba(92,208,179,' + (i < 6 ? .42 : .24) + ')'; ctx.beginPath(); ctx.arc(px, py, rr, 0, TWO_PI); ctx.stroke(); }
      }
      ctx.strokeStyle = 'rgba(88,196,221,.62)'; ctx.lineWidth = 1.15; ctx.beginPath(); ctx.moveTo(cx + c0[0] * scale, cy + c0[1] * scale);
      for (i = 0; i < chain.length; i++) ctx.lineTo(cx + chain[i][3] * scale, cy + chain[i][4] * scale);
      ctx.stroke();
      var g = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 15);
      g.addColorStop(0, 'rgba(255,236,190,.95)'); g.addColorStop(.25, 'rgba(236,180,78,.5)'); g.addColorStop(1, 'rgba(236,180,78,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(head[0], head[1], 15, 0, TWO_PI); ctx.fill();
      ctx.fillStyle = '#fff6df'; ctx.beginPath(); ctx.arc(head[0], head[1], 2.6, 0, TWO_PI); ctx.fill();
      ctx.restore();
    }
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(now - last, 80); last = now;
    var prev = clock; clock += dt;
    if (clock >= CYCLE) {              // new cycle
      clock = 0; lastU = 0; lastPt = null; glowDrawn = false;
      tx.clearRect(0, 0, trail.width, trail.height); gx.clearRect(0, 0, glow.width, glow.height);
    }
    var holdIdle = clock > DRAW + 1300 && clock < DRAW + HOLD && prev > DRAW + 1300;   // nothing moves: skip painting
    if (!holdIdle && !(clock > DRAW + HOLD + FADE)) render(clock);
    requestAnimationFrame(frame);
  }
  function start() { if (running || reduce || !visible || document.hidden || !W) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  function init() {
    setup();
    if (reduce) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.05 }).observe(board);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    var rw = 0, timer;
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        var w = board.getBoundingClientRect().width;
        if (Math.abs(w - rw) < 2) return; rw = w;
        clearTimeout(timer); timer = setTimeout(function () { stop(); setup(); start(); }, 160);
      }).observe(board);
    }
    start();
  }
  // wait for the italic face so the axis numerals are set in Latin Modern
  if (document.fonts && document.fonts.load) {
    document.fonts.load('italic 13px "LM Roman"').then(init, init);
  } else init();
})();

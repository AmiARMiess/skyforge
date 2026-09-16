/* SKYFORGE — flight-path canvas + telemetry, nav, reveals, counters (vanilla, no deps) */
(function () {
  /* watchdog: restarts a stalled animation loop */
  var lastTick = performance.now(), rearmed = false, startLoop = null;
  function beat() { lastTick = performance.now(); rearmed = false; }
  function rearm() { if (startLoop && !rearmed) { rearmed = true; startLoop(); } }
  setInterval(function () {
    if (document.visibilityState === 'visible' && performance.now() - lastTick > 1200) rearm();
  }, 400);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { lastTick = performance.now(); rearm(); }
  });
  addEventListener('focus', rearm);

  try {
    document.documentElement.classList.add('js');

    /* nav state */
    var nav = document.querySelector('.nav');
    addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

    /* scroll reveals */
    document.querySelectorAll('h2, .kit, .step, .plan, .hudcard, .cta-card, blockquote').forEach(function (el) { el.classList.add('reveal'); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: .15 });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }

    /* count-up stats */
    function animateNum(el) {
      var target = parseFloat(el.dataset.target),
          dec = parseInt(el.dataset.decimals || 0, 10),
          suf = el.dataset.suffix || '', t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1500, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var numIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { numIO.unobserve(e.target); animateNum(e.target); } });
      }, { threshold: .6 });
      document.querySelectorAll('.num').forEach(function (el) { numIO.observe(el); });
    } else {
      document.querySelectorAll('.num').forEach(function (el) {
        el.textContent = parseFloat(el.dataset.target).toFixed(parseInt(el.dataset.decimals || 0, 10)) + (el.dataset.suffix || '');
      });
    }

    /* live telemetry jitter (static values remain if JS dies) */
    var tAlt = document.getElementById('tAlt'),
        tSpd = document.getElementById('tSpd'),
        tBat = document.getElementById('tBat');
    if (tAlt && tSpd && tBat) setInterval(function () {
      tAlt.textContent = (118 + Math.round(Math.random() * 6)) + ' m';
      tSpd.textContent = (12 + Math.round(Math.random() * 5)) + ' m/s';
      tBat.textContent = (22.2 + Math.random() * .5).toFixed(1) + ' V';
    }, 900);

    /* cloud parallax via CSS variables */
    addEventListener('mousemove', function (e) {
      var mx = (e.clientX / innerWidth - .5) * 2,
          my = -(e.clientY / innerHeight - .5) * 2;
      document.documentElement.style.setProperty('--mx', mx.toFixed(3));
      document.documentElement.style.setProperty('--my', my.toFixed(3));
    }, { passive: true });

    var y = document.getElementById('y');
    if (y) y.textContent = new Date().getFullYear();
  } catch (e) {}

  /* ========== CANVAS FLIGHT-PATH ENGINE ========== */
  try {
    var canvas = document.getElementById('bg');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var DPR = Math.min(window.devicePixelRatio || 1, 2), W, H, wp = [];
    var FR = [[.08, .78], [.28, .52], [.48, .66], [.68, .40], [.92, .58]]; /* waypoint fractions */
    function rz() {
      W = canvas.width = innerWidth * DPR;
      H = canvas.height = innerHeight * DPR;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      wp = FR.map(function (p) { return [p[0] * W, p[1] * H]; });
    }
    rz(); addEventListener('resize', rz);

    /* cumulative lengths for constant-speed travel */
    var lens = [], total = 0;
    function measure() {
      lens = []; total = 0;
      for (var i = 0; i < wp.length - 1; i++) {
        var d = Math.hypot(wp[i + 1][0] - wp[i][0], wp[i + 1][1] - wp[i][1]);
        lens.push(d); total += d;
      }
    }
    measure(); addEventListener('resize', measure);

    function posAt(dist) {
      var d = dist % total;
      for (var i = 0; i < lens.length; i++) {
        if (d <= lens[i]) {
          var t = d / lens[i];
          return [wp[i][0] + (wp[i + 1][0] - wp[i][0]) * t,
                  wp[i][1] + (wp[i + 1][1] - wp[i][1]) * t];
        }
        d -= lens[i];
      }
      return wp[0];
    }

    var trail = [], blips = [], dist = 0, last = null;
    function frame(now) {
      beat();
      var dt = last ? Math.min((now - last) / 1000, .05) : .016;
      last = now;
      dist += dt * W * .06;
      ctx.clearRect(0, 0, W, H);

      /* dashed planned route */
      ctx.setLineDash([6 * DPR, 10 * DPR]);
      ctx.strokeStyle = 'rgba(53,196,232,.18)'; ctx.lineWidth = 1 * DPR;
      ctx.beginPath();
      wp.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
      ctx.stroke(); ctx.setLineDash([]);

      /* waypoint markers */
      wp.forEach(function (p) {
        ctx.strokeStyle = 'rgba(53,196,232,.35)';
        ctx.strokeRect(p[0] - 4 * DPR, p[1] - 4 * DPR, 8 * DPR, 8 * DPR);
      });

      /* drone + trail */
      var p = posAt(dist);
      trail.push(p); if (trail.length > 46) trail.shift();
      for (var i = 1; i < trail.length; i++) {
        ctx.strokeStyle = 'rgba(255,122,26,' + (i / trail.length * .55) + ')';
        ctx.lineWidth = 1.6 * DPR;
        ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
      }
      var rot = now / 90;
      ctx.save(); ctx.translate(p[0], p[1]);
      ctx.shadowColor = 'rgba(255,122,26,.9)'; ctx.shadowBlur = 12 * DPR;
      ctx.fillStyle = '#FF7A1A';
      ctx.beginPath(); ctx.arc(0, 0, 3.2 * DPR, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(234,244,255,.85)'; ctx.lineWidth = 1.2 * DPR;
      for (var a = 0; a < 4; a++) {           /* spinning rotor arms */
        var ang = rot + a * Math.PI / 2;
        var rx = Math.cos(ang) * 8 * DPR, ry = Math.sin(ang) * 8 * DPR;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rx, ry); ctx.stroke();
        ctx.beginPath(); ctx.arc(rx, ry, 2.6 * DPR, 0, 7); ctx.stroke();
      }
      ctx.restore();

      /* radar blips */
      if (Math.random() < .012 && blips.length < 4) {
        blips.push({ x: Math.random() * W, y: Math.random() * H * .8, life: 1 });
      }
      for (i = blips.length - 1; i >= 0; i--) {
        var b = blips[i]; b.life -= .008;
        if (b.life <= 0) { blips.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(110,242,166,' + (b.life * .6) + ')';
        ctx.lineWidth = 1 * DPR;
        ctx.beginPath(); ctx.moveTo(b.x - 6 * DPR, b.y); ctx.lineTo(b.x + 6 * DPR, b.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(b.x, b.y - 6 * DPR); ctx.lineTo(b.x, b.y + 6 * DPR); ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x, b.y, (1 - b.life) * 16 * DPR, 0, 7); ctx.stroke();
      }

      requestAnimationFrame(frame);
    }
    startLoop = function () { requestAnimationFrame(frame); };
    startLoop();
  } catch (e) {}
})();
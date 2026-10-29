/* ==========================================================
   sky.js
   Latar langit 2D di atas canvas: gradien langit, bulan, awan,
   bintang, aurora, kunang-kunang, kelopak, kilat, bintang jatuh,
   dan percikan kursor. Dengan "kurangi gerakan", cukup digambar
   satu kali tanpa animasi.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const SKY_STOPS = [
    [0, '#01030d'], [0.14, '#05123a'], [0.28, '#071e57'], [0.42, '#0a2d6e'],
    [0.56, '#123f6e'], [0.7, '#0f6e6c'], [0.84, '#1a9e7a'], [1, '#06110d'],
  ];
  const PETAL_COLORS = ['#8fe8ff', '#ff9ee0', '#c8ffd9', '#ffe08a'];
  const FIREFLY_COLORS = ['#ffcb47', '#33f2e0', '#ff4fd8', '#3ef2a0'];
  const AURORA_BANDS = [
    { color: 'rgba(51,242,224,0.14)', amp: 24, freq: 1.4, yBase: 0.6, speed: 1 },
    { color: 'rgba(62,242,160,0.12)', amp: 30, freq: 1.1, yBase: 0.68, speed: -0.8 },
    { color: 'rgba(139,107,255,0.11)', amp: 20, freq: 1.7, yBase: 0.78, speed: 0.6 },
    { color: 'rgba(255,79,216,0.09)', amp: 26, freq: 0.9, yBase: 0.88, speed: 0.4 },
  ];

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  App.initSky = () => {
    const canvas = document.getElementById('bgCanvas');
    const flashEl = document.getElementById('lightning-flash');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0;
    let H = 0;
    let DPR = 1;
    let skyGradient = null;
    let vignetteGradient = null;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(), y: Math.random(), z: rand(0.3, 1.3),
      r: rand(0.6, 2.2), phase: rand(0, Math.PI * 2), speed: rand(0.6, 2),
    }));

    const petals = Array.from({ length: 18 }, () => ({
      x: Math.random(), y: Math.random(), z: rand(0.35, 1.45),
      size: rand(8, 20), fall: rand(0.15, 0.5), sway: rand(20, 60),
      phase: rand(0, Math.PI * 2), spin: rand(0, Math.PI * 2),
      spinSpeed: rand(-0.01, 0.01), color: pick(PETAL_COLORS),
    }));

    const clouds = Array.from({ length: 6 }, () => ({
      x: Math.random(), y: rand(0.05, 0.4), scale: rand(0.6, 1.5),
      speed: rand(0.008, 0.02), z: rand(0.2, 0.6),
    }));

    const fireflies = Array.from({ length: 14 }, () => ({
      x: Math.random(), y: Math.random(), r: rand(1.5, 3.5),
      phase: rand(0, Math.PI * 2), speed: rand(0.4, 1), driftX: rand(-0.03, 0.03),
      driftY: rand(-0.03, 0.03), color: pick(FIREFLY_COLORS),
    }));

    let bolts = [];
    let shootingStars = [];
    let sparks = [];
    let nextBoltAt = 2500 + Math.random() * 4000;
    let nextShootAt = 1500 + Math.random() * 3000;
    let lastSparkAt = 0;

    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      skyGradient = ctx.createLinearGradient(0, 0, 0, H);
      SKY_STOPS.forEach(([offset, color]) => skyGradient.addColorStop(offset, color));

      vignetteGradient = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, Math.max(W, H) * 0.75);
      vignetteGradient.addColorStop(0, 'rgba(51,242,224,0)');
      vignetteGradient.addColorStop(0.75, 'rgba(51,242,224,0)');
      vignetteGradient.addColorStop(1, 'rgba(4,10,10,0.35)');
    };

    /* ----- Bagian gambar ----- */

    const drawSky = () => {
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, W, H);
    };

    const drawAurora = (time) => {
      AURORA_BANDS.forEach((b) => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 20) {
          const y = b.yBase * H + Math.sin(x * 0.004 * b.freq + time * b.speed) * b.amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();
      });
    };

    const drawMoon = () => {
      const moonX = W * 0.82 + (mouseX - 0.5) * 30;
      const moonY = H * 0.18 + (mouseY - 0.5) * 20;
      const moonR = Math.min(W, H) * 0.06;

      const glow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 5);
      glow.addColorStop(0, 'rgba(214,255,247,0.35)');
      glow.addColorStop(1, 'rgba(214,255,247,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e6fff9';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCloud = (x, y, scale) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(255,255,255,0.055)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 26, 0, 0, Math.PI * 2);
      ctx.ellipse(50, -10, 45, 22, 0, 0, Math.PI * 2);
      ctx.ellipse(-50, -6, 40, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawClouds = (time) => {
      clouds.forEach((c) => {
        const cx = (((c.x + time * c.speed) % 1.3) - 0.15) * W;
        const cy = c.y * H + (mouseY - 0.5) * c.z * 20;
        drawCloud(cx, cy, c.scale);
      });
    };

    const drawStars = (time) => {
      stars.forEach((s) => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.speed + s.phase);
        const x = s.x * W + (mouseX - 0.5) * s.z * 40;
        const y = s.y * H + (mouseY - 0.5) * s.z * 40;
        ctx.fillStyle = `rgba(255,255,255,${(0.25 + 0.6 * twinkle).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawPetal = (x, y, size, angle, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size * 0.8, -size * 0.6, size * 0.8, size * 0.4, 0, size);
      ctx.bezierCurveTo(-size * 0.8, size * 0.4, -size * 0.8, -size * 0.6, 0, size);
      ctx.fill();
      ctx.restore();
    };

    const drawPetals = (time) => {
      petals.forEach((p) => {
        const fallDist = (time * p.fall) % 1.3;
        const y = ((p.y + fallDist) % 1.3) * H - H * 0.15;
        const sway = Math.sin(time * 0.8 + p.phase) * p.sway;
        const x = p.x * W + sway + (mouseX - 0.5) * p.z * 60;
        const angle = p.spin + time * p.spinSpeed * 60;
        drawPetal(x, y, p.size * (0.6 + p.z * 0.4), angle, p.color);
      });
    };

    const drawFireflies = (time) => {
      fireflies.forEach((f) => {
        const fx = (((f.x + time * f.driftX) % 1) + 1) % 1;
        const fy = (((f.y + time * f.driftY) % 1) + 1) % 1;
        const twinkle = 0.4 + 0.6 * Math.sin(time * 4 * f.speed + f.phase);
        ctx.save();
        ctx.globalAlpha = Math.max(0, twinkle);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx * W, fy * H, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const spawnBolt = (now) => {
      const startX = W * (0.1 + Math.random() * 0.8);
      const segments = 7 + Math.floor(Math.random() * 5);
      const segLen = (H * 0.7) / segments;
      let x = startX;
      let y = -10;
      const points = [[x, y]];
      for (let i = 0; i < segments; i++) {
        x += (Math.random() - 0.5) * 70;
        y += segLen * (0.7 + Math.random() * 0.5);
        points.push([x, y]);
      }

      const branches = [];
      if (Math.random() < 0.7) {
        const bIdx = 2 + Math.floor(Math.random() * (points.length - 3));
        let bx = points[bIdx][0];
        let by = points[bIdx][1];
        const branch = [[bx, by]];
        const bSegs = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < bSegs; i++) {
          bx += (Math.random() - 0.5) * 60 + 30;
          by += segLen * 0.5;
          branch.push([bx, by]);
        }
        branches.push(branch);
      }

      bolts.push({ points, branches, born: now, life: 220 + Math.random() * 120 });

      if (flashEl) {
        flashEl.style.transition = 'none';
        flashEl.style.opacity = (0.35 + Math.random() * 0.25).toFixed(2);
        requestAnimationFrame(() => {
          flashEl.style.transition = 'opacity 0.6s ease';
          flashEl.style.opacity = '0';
        });
      }
    };

    const drawBoltPath = (points, alpha) => {
      ctx.save();
      ctx.strokeStyle = `rgba(230,240,255,${alpha})`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(160,200,255,0.9)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.stroke();
      ctx.restore();
    };

    const drawBolts = (now) => {
      bolts = bolts.filter((b) => now - b.born < b.life);
      bolts.forEach((b) => {
        const alpha = Math.max(0, 1 - (now - b.born) / b.life);
        drawBoltPath(b.points, alpha);
        b.branches.forEach((bp) => drawBoltPath(bp, alpha * 0.7));
      });
    };

    const spawnShootingStar = (now) => {
      const angle = Math.PI * rand(0.72, 0.8);
      const speed = rand(9, 14);
      shootingStars.push({
        x: W * rand(0.55, 0.95),
        y: H * Math.random() * 0.25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        born: now,
        life: rand(900, 1300),
        len: rand(90, 160),
      });
    };

    const drawShootingStars = (now) => {
      shootingStars = shootingStars.filter((s) => now - s.born < s.life);
      shootingStars.forEach((s) => {
        const alpha = Math.max(0, 1 - (now - s.born) / s.life);
        s.x += s.vx;
        s.y += s.vy;
        const tailX = s.x - s.vx * (s.len / 10);
        const tailY = s.y - s.vy * (s.len / 10);
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();
      });
    };

    const drawSparks = (now) => {
      sparks = sparks.filter((s) => now - s.born < s.life);
      sparks.forEach((s) => {
        const age = (now - s.born) / s.life;
        ctx.save();
        ctx.globalAlpha = 1 - age;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y - age * 18, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    /* ----- Bingkai utama ----- */

    const draw = (ms, animated) => {
      const time = animated ? ms * 0.001 : 0;
      ctx.clearRect(0, 0, W, H);
      drawSky();
      drawAurora(animated ? ms * 0.0007 : 0);
      drawMoon();
      drawClouds(time);
      drawStars(time);
      drawPetals(time);
      if (animated) {
        drawFireflies(ms * 0.0006);
        if (ms >= nextBoltAt) {
          spawnBolt(ms);
          nextBoltAt = ms + 5000 + Math.random() * 7000;
        }
        drawBolts(ms);
        if (ms >= nextShootAt) {
          spawnShootingStar(ms);
          nextShootAt = ms + 1800 + Math.random() * 3200;
        }
        drawShootingStars(ms);
        drawSparks(ms);
      }
    };

    const frame = (ms) => {
      draw(ms, true);
      requestAnimationFrame(frame);
    };

    /* ----- Interaksi kursor ----- */

    if (!App.isCoarse) {
      window.addEventListener('pointermove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;

        // Kemiringan halaman utama mengikuti kursor
        const root = document.documentElement.style;
        root.setProperty('--tiltY', ((mouseX - 0.5) * 10).toFixed(2) + 'deg');
        root.setProperty('--tiltX', ((mouseY - 0.5) * -10).toFixed(2) + 'deg');

        // Percikan kursor (dibatasi 25 ms agar tidak membebani)
        const now = performance.now();
        if (now - lastSparkAt >= 40 && !App.reduceMotion) {
          lastSparkAt = now;
          sparks.push({
            x: e.clientX, y: e.clientY, born: now, life: 500, r: rand(2, 5),
            color: pick(PETAL_COLORS),
          });
          if (sparks.length > 40) sparks.shift();
        }
      });
    }

    window.addEventListener('resize', resize);
    resize();

    if (App.reduceMotion) {
      draw(0, false);
    } else {
      requestAnimationFrame(frame);
    }
  };
})();

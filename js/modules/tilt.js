/* ==========================================================
   tilt.js
   Kartu di Beranda sedikit miring mengikuti kursor (hanya perangkat
   dengan pointer halus dan jika "kurangi gerakan" tidak aktif).
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const TILT_MAX_DEG = 10;

  App.initTilt = () => {
    if (App.isCoarse || App.reduceMotion) return;

    document.querySelectorAll('#beranda .card, #beranda .fact-card').forEach((el) => {
      el.classList.add('is-tilt');

      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--rx', (py * -TILT_MAX_DEG).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (px * TILT_MAX_DEG).toFixed(2) + 'deg');
        el.style.setProperty('--tz', '6px');
      });

      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--tz', '0px');
      });
    });
  };
})();

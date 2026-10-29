/* ==========================================================
   scroll.js
   Progress bar scroll dan tombol kembali ke atas.
   Diperbarui sekali per frame (requestAnimationFrame) agar ringan.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  App.initScroll = () => {
    const bar = document.getElementById('scrollProgress');
    const btn = document.getElementById('scrollTopBtn');
    if (!bar || !btn) return;

    let queued = false;

    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? window.scrollY / max : 0;

      bar.style.transform = `scaleX(${pct})`;
      btn.classList.toggle('is-visible', window.scrollY > 300);
      App.scrollT = pct;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: App.reduceMotion ? 'auto' : 'smooth' });
    });

    update();
  };
})();

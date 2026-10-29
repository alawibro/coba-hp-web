/* ==========================================================
   utils.js
   Namespace App dan utilitas bersama: preferensi gerak,
   toast, dan confetti.
   ========================================================== */
(function () {
  'use strict';

  const App = (window.App = window.App || {});

  App.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  App.isCoarse = window.matchMedia('(pointer: coarse)').matches;
  App.scrollT = 0; // 0..1, diperbarui oleh modul scroll

  let toastTimer = null;

  App.toast = (message) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 1800);
  };

  App.confetti = (originEl) => {
    if (App.reduceMotion) return;
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const emojis = ['', '', '', '', ''];

    for (let i = 0; i < 12; i++) {
      const el = document.createElement('span');
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;

      el.className = 'confetti';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.fontSize = 14 + Math.random() * 14 + 'px';
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist - 40 + 'px');
      el.style.setProperty('--rot', (Math.random() - 0.5) * 360 + 'deg');
      document.body.appendChild(el);

      requestAnimationFrame(() => el.classList.add('is-going'));
      setTimeout(() => el.remove(), 950);
    }
  };
})();

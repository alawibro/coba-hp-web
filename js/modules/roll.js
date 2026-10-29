/* ==========================================================
   roll.js
   Tombol "Roll Sekarang": menampilkan satu kutipan acak.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  App.initRoll = () => {
    const btn = document.getElementById('rollBtn');
    const output = document.getElementById('quoteOutput');
    if (!btn || !output) return;

    const quotes = window.BIO_DATA.quotes;

    btn.addEventListener('click', () => {
      const line = quotes[Math.floor(Math.random() * quotes.length)];
      output.classList.add('is-hidden');
      setTimeout(() => {
        output.textContent = line;
        output.classList.remove('is-hidden');
      }, 150);
      App.confetti(btn);
    });
  };
})();

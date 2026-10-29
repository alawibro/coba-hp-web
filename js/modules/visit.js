/* ==========================================================
   visit.js
   Penghitung kunjungan di localStorage. Jika penyimpanan diblokir
   browser, badge menampilkan teks cadangan.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  App.initVisit = () => {
    const badge = document.getElementById('visitBadge');
    if (!badge) return;

    try {
      const key = 'baihaqi_visit_count';
      const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, String(count));
      badge.textContent = ' Kunjungan ke-' + count;
    } catch (e) {
      badge.textContent = ' Halo, visitor!';
    }
  };
})();

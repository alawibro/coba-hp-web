/* ==========================================================
   main.js
   Titik masuk: menjalankan semua modul setelah DOM siap.
   Urutan penting: navigasi dulu agar halaman awal tampil benar.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const start = () => {
    App.initNav();
    App.initHero();
    App.initRoll();
    App.initAvatar();
    App.initCopyId();
    App.initModal();
    App.initScroll();
    App.initVisit();
    App.initTilt();
    App.initRevealText();
    App.initSky();
    App.init3D();
    App.initSodaStage();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

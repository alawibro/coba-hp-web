/* ==========================================================
   modal.js
   Modal "Kode Rahasia" dengan semantik dialog: fokus dipindah ke
   tombol tutup saat dibuka, Tab tetap di dalam modal, Esc menutup,
   dan fokus kembali ke elemen sebelumnya saat ditutup.
   Dibuka oleh kode Konami (↑↑↓↓←→←→BA).
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  App.initModal = () => {
    const modal = document.getElementById('secretModal');
    const closeBtn = document.getElementById('secretClose');
    if (!modal || !closeBtn) return;

    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      closeBtn.focus();
    };

    const close = () => {
      modal.hidden = true;
      if (lastFocus) lastFocus.focus();
    };

    closeBtn.addEventListener('click', close);

    // Klik di area gelap di luar kotak juga menutup modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        // Hanya ada satu tombol di modal ini: tahan fokus di sana
        e.preventDefault();
        closeBtn.focus();
      }
    });

    let pos = 0;
    window.addEventListener('keydown', (e) => {
      if (!modal.hidden) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[pos]) {
        pos++;
        if (pos === KONAMI.length) {
          pos = 0;
          open();
        }
      } else {
        pos = key === KONAMI[0] ? 1 : 0;
      }
    });

    App.openSecretModal = open;
  };
})();

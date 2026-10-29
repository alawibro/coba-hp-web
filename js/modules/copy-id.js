/* ==========================================================
   copy-id.js
   Menyalin ID Free Fire ke clipboard dari dua tempat (Biodata dan Hobi).
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  App.initCopyId = () => {
    const ID = '1890895075';

    const copy = () => {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(ID)
          .then(() => App.toast('ID Free Fire disalin! '))
          .catch(() => App.toast('ID: ' + ID));
      } else {
        App.toast('ID: ' + ID);
      }
    };

    ['ffIdValue', 'ffIdTag'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', copy);
    });
  };
})();

/* ==========================================================
   hero.js
   Status hari ini (sesuai jam) dan efek ketik pada tagline.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const pickStatus = (hour) => {
    const rules = window.BIO_DATA.statusByHour;
    const match = rules.find((r) => r.from !== null && hour >= r.from && hour < r.to);
    return (match || rules[rules.length - 1]).text;
  };

  App.initHero = () => {
    const statusEl = document.getElementById('statusText');
    if (statusEl) statusEl.textContent = pickStatus(new Date().getHours());

    const el = document.getElementById('typedText');
    const taglines = window.BIO_DATA.taglines;
    if (!el) return;

    if (App.reduceMotion) {
      el.textContent = taglines[0];
      return;
    }

    let index = 0;
    let count = 0;
    let deleting = false;

    const tick = () => {
      const full = taglines[index];
      let delay;

      if (!deleting) {
        count++;
        el.textContent = full.slice(0, count);
        if (count === full.length) {
          deleting = true;
          delay = 1800; // jeda sebelum menghapus
        } else {
          delay = 45;
        }
      } else {
        count--;
        el.textContent = full.slice(0, count);
        if (count === 0) {
          deleting = false;
          index = (index + 1) % taglines.length;
        }
        delay = deleting ? 28 : 45;
      }
      setTimeout(tick, delay);
    };

    tick();
  };
})();

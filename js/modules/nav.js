/* ==========================================================
   nav.js
   Tab navigasi dengan semantik ARIA (tablist/tab/tabpanel),
   navigasi panah + Home/End, dan sinkron ke hash URL (#halaman).
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  App.initNav = () => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;

    const showPage = (pageId) => {
      document.querySelectorAll('.page').forEach((page) => {
        page.hidden = page.id !== pageId;
      });
    };

    const select = (tab, { focus = false, updateHash = true } = {}) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      showPage(tab.dataset.page);
      window.scrollTo({ top: 0, behavior: App.reduceMotion ? 'auto' : 'smooth' });
      if (updateHash) history.replaceState(null, '', '#' + tab.dataset.page);
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, { focus: true });
        }
      });
    });

    // Buka halaman sesuai hash (misal: index.html#game)
    const fromHash = location.hash.slice(1);
    const initial = tabs.find((t) => t.dataset.page === fromHash) || tabs[0];
    select(initial, { updateHash: false });
  };
})();

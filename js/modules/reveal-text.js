/* ==========================================================
   reveal-text.js
   Membungkus teks di Beranda dengan <span> agar tiap huruf atau kata
   bisa bergerak halus. Teks yang terlihat tidak berubah.
   Dilewati jika "kurangi gerakan" aktif.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const wrapTextNodes = (node, mode, counter) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue;
      if (!text || !text.trim()) return;

      const frag = document.createDocumentFragment();

      if (mode === 'letter') {
        [...text].forEach((ch) => {
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const span = document.createElement('span');
          span.className = 'anim-letter';
          span.style.setProperty('--d', counter.i++);
          span.textContent = ch;
          frag.appendChild(span);
        });
      } else {
        text.split(/(\s+)/).forEach((w) => {
          if (w === '' || /^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(w));
            return;
          }
          const span = document.createElement('span');
          span.className = 'anim-word';
          span.style.setProperty('--d', counter.i++);
          span.textContent = w;
          frag.appendChild(span);
        });
      }

      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains('anim-letter') || node.classList.contains('anim-word')) return;
      [...node.childNodes].forEach((child) => wrapTextNodes(child, mode, counter));
    }
  };

  const animateText = (el, mode) => {
    if (!el || el.dataset.animated) return;
    el.dataset.animated = '1';
    wrapTextNodes(el, mode, { i: 0 });
  };

  App.initRevealText = () => {
    if (App.reduceMotion) return;

    // Judul, badge, label, dan nilai biodata: per huruf
    document
      .querySelectorAll(
        '#beranda .hero h1 span, #beranda .badge, #beranda .card h2:not(.rainbow-text), ' +
          '#beranda .info-item .label, #beranda .info-item .value, #beranda .fact-card h3, ' +
          '#beranda .fun-card h2'
      )
      .forEach((el) => animateText(el, 'letter'));

    // Paragraf, daftar, dan status: per kata agar tetap nyaman dibaca
    document
      .querySelectorAll(
        '#beranda .card p, #beranda .fact-card p, #beranda .fun-card p, #beranda li, #beranda #statusText'
      )
      .forEach((el) => animateText(el, 'word'));

    // Teks gradasi pelangi digerakkan utuh agar gradasinya tidak rusak
    document.querySelectorAll('#beranda .kelas-tag').forEach((el) => el.classList.add('float-whole'));
  };
})();

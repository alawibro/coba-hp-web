/* ==========================================================
   vendor-loader.js
   Memuat three.js dari CDN utama. Jika gagal, memakai CDN cadangan.
   Jika keduanya gagal, App.threeReady bernilai false dan latar 3D
   dilewati tanpa mengganggu bagian lain halaman.
   ========================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  var PRIMARY = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var FALLBACK = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(true); };
      s.onerror = function () {
        s.remove();
        reject(new Error('Gagal memuat ' + src));
      };
      document.head.appendChild(s);
    });
  }

  window.App.threeReady = loadScript(PRIMARY)
    .catch(function () { return loadScript(FALLBACK); })
    .then(function () { return typeof window.THREE !== 'undefined'; })
    .catch(function () { return false; });
})();

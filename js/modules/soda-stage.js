/* ==========================================================
   soda-stage.js
   Stage model 3D soda di Beranda (versi PC).

   - Dua varian: Bintang Zero dan Radler Lemon. Pilih lewat tombol.
   - Auto-rotate aktif, kecuali jika "kurangi gerakan" dinyalakan.
   - Progres unduhan ditampilkan di caption (tiap 10%).
   - Jika model gagal dimuat atau macet, stage menampilkan pesan.
     Halaman tetap berfungsi.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
  const LOAD_TIMEOUT_MS = 30000;

  const TEXT = {
    loading: 'Memuat model 3D…',
    ready: 'Geser untuk memutar ↻',
    error: 'Model 3D gagal dimuat. Muat ulang halaman untuk mencoba lagi.',
  };

  const VARIANTS = {
    zero: {
      src: 'assets/3d/bintang-1.glb',
      poster: 'assets/3d/bintang-1-card.png',
      alt: 'Model 3D kaleng Bintang Zero 0.0%',
    },
    radler: {
      src: 'assets/3d/bintang-2.glb',
      poster: 'assets/3d/bintang-2-card.png',
      alt: 'Model 3D kaleng Bintang Radler Lemon 0.0%',
    },
  };

  App.initSodaStage = () => {
    const stage = document.querySelector('.soda-stage');
    const viewer = document.querySelector('.soda-stage__model');
    const caption = document.getElementById('sodaCaption');
    const buttons = Array.from(document.querySelectorAll('.soda-switch__btn'));
    if (!stage || !viewer || !caption) return;

    // Gerakan otomatis hanya jika pengguna tidak meminta pengurangan gerakan
    const reduced = window.matchMedia(REDUCED_QUERY);
    const applyMotionPreference = () => {
      if (reduced.matches) viewer.removeAttribute('auto-rotate');
      else viewer.setAttribute('auto-rotate', '');
    };
    applyMotionPreference();
    reduced.addEventListener('change', applyMotionPreference);

    let current = null;   // varian yang sedang dimuat
    let finished = false; // sudah load atau error untuk pemuatan ini
    let watchdog = null;
    let lastStep = -1;

    const showError = (reason) => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      stage.classList.remove('is-ready');
      stage.classList.add('is-error');
      caption.setAttribute('role', 'status');
      caption.textContent = TEXT.error;
      console.warn('[soda-stage] gagal memuat model:', reason);
    };

    const setPressed = (key) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variant === key)));
    };

    const startLoad = (key) => {
      const v = VARIANTS[key];
      current = key;
      finished = false;
      lastStep = -1;
      clearTimeout(watchdog);
      watchdog = null;
      stage.classList.remove('is-ready', 'is-error');
      caption.setAttribute('role', 'status');
      caption.textContent = TEXT.loading;
      viewer.setAttribute('alt', v.alt);
      viewer.setAttribute('poster', v.poster);
      // Versi file:// memakai data URL dari window.SODA_MODELS (lihat scripts/build-standalone.mjs)
      viewer.setAttribute('src', (window.SODA_MODELS && window.SODA_MODELS[key]) || v.src);
      setPressed(key);
    };

    // Progres: perbarui hanya setiap kelipatan 10%.
    // Watchdog dinyalakan saat unduhan dimulai.
    viewer.addEventListener('progress', (event) => {
      if (finished) return;
      if (watchdog === null) {
        watchdog = setTimeout(() => showError('timeout'), LOAD_TIMEOUT_MS);
      }
      const total = (event.detail && event.detail.totalProgress) || 0;
      const pct = Math.round(total * 100);
      const step = Math.floor(pct / 10);
      if (step === lastStep) return;
      lastStep = step;
      caption.textContent = `${TEXT.loading} ${pct}%`;
    });

    viewer.addEventListener('load', () => {
      if (finished) return;
      finished = true;
      clearTimeout(watchdog);
      stage.classList.remove('is-error');
      stage.classList.add('is-ready');
      caption.textContent = TEXT.ready;
    });

    viewer.addEventListener('error', (event) => showError(event.detail));

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.variant;
        if (key !== current) startLoad(key);
      });
    });

    // Jika script model-viewer tidak termuat (mis. CDN diblokir), caption tidak boleh macet
    setTimeout(() => {
      if (!window.customElements || !customElements.get('model-viewer')) {
        stage.classList.add('is-error');
        caption.setAttribute('role', 'status');
        caption.textContent = TEXT.error;
        console.warn('[soda-stage] komponen model-viewer belum termuat');
      }
    }, 15000);

    startLoad('zero');
  };
})();

/* ==========================================================
   avatar.js
   Avatar bisa diklik atau ditekan keyboard. Setiap klik memunculkan
   pesan, efek suara pop kecil (Web Audio), dan confetti.
   AudioContext dibuat sekali lalu dipakai ulang.
   ========================================================== */
(() => {
  'use strict';
  const App = window.App;

  let audioCtx = null;

  const playPop = () => {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  };

  App.initAvatar = () => {
    const btn = document.getElementById('avatarBtn');
    if (!btn) return;

    const messages = window.BIO_DATA.avatarMessages;
    let clicks = 0;

    btn.addEventListener('click', () => {
      playPop();
      clicks++;
      App.toast(messages[Math.min(clicks - 1, messages.length - 1)]);

      btn.style.setProperty('--pop', clicks % 2 === 0 ? '10deg' : '-10deg');
      btn.classList.add('is-pop');
      setTimeout(() => btn.classList.remove('is-pop'), 200);

      App.confetti(btn);
    });
  };
})();

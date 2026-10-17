// Copyright (c) 2026 Taras Koval. All rights reserved. See LICENSE.
'use strict';

(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- The spin: 60 frames from a video of walking around her ---------- */
  const FRAMES = 60;
  const box = document.querySelector('#spin');
  const img = document.querySelector('#spin-frame');
  const hint = document.querySelector('#spin-hint');
  const srcs = Array.from({ length: FRAMES }, (_, n) => `./images/coco/spin/${String(n + 1).padStart(2, '0')}.jpg`);

  // Load every frame first so dragging never shows a blank image.
  let loaded = 0;
  const ready = new Promise(resolve => {
    srcs.forEach(src => {
      const pre = new Image();
      pre.onload = pre.onerror = () => { if (++loaded === FRAMES) resolve(); };
      pre.src = src;
    });
  });

  let frame = 0;
  function show(n) {
    frame = Math.max(0, Math.min(FRAMES - 1, Math.round(n)));
    img.src = srcs[frame];
  }

  // Plays forward then backward on its own, like walking around her and back.
  let direction = 1;
  let playing = false;
  let idleTimer = null;
  let last = 0;
  function tick(time) {
    if (!playing) return;
    if (time - last > 1000 / 14) {
      last = time;
      if (frame + direction > FRAMES - 1 || frame + direction < 0) direction *= -1;
      show(frame + direction);
    }
    requestAnimationFrame(tick);
  }
  function play() {
    if (reduceMotion || playing || document.hidden) return;
    playing = true;
    requestAnimationFrame(tick);
  }
  function pause() {
    playing = false;
    clearTimeout(idleTimer);
  }
  function playLater() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(play, 2500);
  }

  // Dragging: every 7 pixels moves one frame.
  let dragging = false;
  let startX = 0;
  let startFrame = 0;
  box.addEventListener('pointerdown', e => {
    dragging = true;
    startX = e.clientX;
    startFrame = frame;
    box.setPointerCapture(e.pointerId);
    pause();
    hint.classList.add('gone');
  });
  box.addEventListener('pointermove', e => {
    if (dragging) show(startFrame - (e.clientX - startX) / 7);
  });
  const stop = () => { if (dragging) { dragging = false; playLater(); } };
  box.addEventListener('pointerup', stop);
  box.addEventListener('pointercancel', stop);

  // Arrow keys work too.
  box.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    pause();
    hint.classList.add('gone');
    show(frame + (e.key === 'ArrowLeft' ? 2 : -2));
    playLater();
  });

  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  ready.then(play);

  /* ---------- Heads or tails ---------- */
  const coin = document.querySelector('#coin');
  const inner = document.querySelector('#coin-inner');
  const result = document.querySelector('#coin-result');
  let turns = 0;
  coin.addEventListener('click', () => {
    const heads = Math.random() < .5;
    // Spin a few full turns, then land on the right side.
    turns += 4 + (heads ? 0 : .5) - (turns % 1);
    inner.classList.add('flipping');
    inner.style.transform = `rotateY(${turns * 360}deg)`;
    result.textContent = '…';
    setTimeout(() => {
      result.textContent = heads ? 'Heads. She’s looking right at you.' : 'Tails. She has turned her back on you.';
    }, reduceMotion ? 0 : 1300);
  });
})();

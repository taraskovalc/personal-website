// Copyright (c) 2026 Taras Koval. All rights reserved. See LICENSE.
'use strict';

(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- The spin: 60 frames from a video of walking around her ---------- */
  const FRAMES = 77;
  const box = document.querySelector('#spin');
  const img = document.querySelector('#spin-frame');
  const hint = document.querySelector('#spin-hint');
  const srcs = Array.from({ length: FRAMES }, (_, n) => `./images/coco/spin/${String(n + 1).padStart(2, '0')}.jpg?v=2`);

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
  // The coin jumps up, spins, lands with a small bounce, then the answer types out.
  const coin = document.querySelector('#coin');
  const toss = document.querySelector('#coin-toss');
  const inner = document.querySelector('#coin-inner');
  const shadow = document.querySelector('#coin-shadow');
  const result = document.querySelector('#coin-result');
  const tally = document.querySelector('#coin-tally');
  const LINES = {
    heads: ['Heads. She’s looking right at you.', 'Heads. She has noticed you. Unclear if that’s good.', 'Heads. Blue eyes, zero thoughts.'],
    tails: ['Tails. Do not disturb.', 'Tails. Respectfully, no.', 'Tails. She can’t see you, so you can’t see her.'],
  };
  const count = { heads: 0, tails: 0 };
  let angle = 0;  // how far the coin has turned in total, in degrees
  let typing = null;

  function typeOut(text) {
    clearInterval(typing);
    let n = 0;
    result.innerHTML = '<span class="caret"></span>';
    typing = setInterval(() => {
      n++;
      result.textContent = text.slice(0, n);
      if (n < text.length) result.insertAdjacentHTML('beforeend', '<span class="caret"></span>');
      else clearInterval(typing);
    }, reduceMotion ? 0 : 28);
  }

  coin.addEventListener('click', () => {
    if (coin.classList.contains('busy')) return;
    const side = Math.random() < .5 ? 'heads' : 'tails';
    // Five full turns, then whatever extra is needed to land on the chosen side.
    const landOn = side === 'heads' ? 0 : 180;
    const start = angle;
    angle = start + 360 * 5 + ((landOn - (start % 360)) + 360) % 360;
    let spin = null;
    const done = () => {
      // Keep the final position, then drop the finished animation.
      inner.style.transform = `rotateY(${angle}deg)`;
      if (spin) spin.cancel();
      coin.classList.remove('busy');
      count[side]++;
      const options = LINES[side];
      typeOut(options[Math.floor(Math.random() * options.length)]);
      tally.textContent = `heads ${count.heads} · tails ${count.tails}`;
    };

    result.textContent = '';
    if (reduceMotion) {
      inner.style.transform = `rotateY(${angle}deg)`;
      done();
      return;
    }
    coin.classList.add('busy');
    const time = 1500;
    spin = inner.animate([
      { transform: `rotateX(0deg) rotateY(${start}deg)` },
      { transform: `rotateX(28deg) rotateY(${(start + angle) / 2}deg)`, offset: .5 },
      { transform: `rotateX(0deg) rotateY(${angle}deg)` },
    ], { duration: time, easing: 'cubic-bezier(.25,.7,.35,1)', fill: 'forwards' });
    toss.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-150px) scale(1.12)', offset: .42, easing: 'ease-in' },
      { transform: 'translateY(0) scale(1)', offset: .8, easing: 'ease-out' },
      { transform: 'translateY(-16px) scale(1.02)', offset: .9, easing: 'ease-in' },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: time, easing: 'cubic-bezier(.3,.6,.4,1)' });
    shadow.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(.45)', opacity: .35, offset: .42 },
      { transform: 'scale(1)', opacity: 1, offset: .8 },
      { transform: 'scale(.9)', opacity: .9, offset: .9 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: time, easing: 'cubic-bezier(.3,.6,.4,1)' }).onfinish = done;
  });
})();

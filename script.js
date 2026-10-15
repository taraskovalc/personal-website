// Copyright (c) 2026 Taras Koval. All rights reserved. See LICENSE.
'use strict';

// Add finished projects here when they're ready.
// Shape: { title, description, technologies: ['Python'], url: 'https://github.com/…' }
const projects = [];

(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Name: split into letters for the entrance + hover ---------- */
  let i = 0;
  document.querySelectorAll('.name-line').forEach(line => {
    const dot = line.querySelector('.name-dot');
    const text = [...line.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('');
    line.textContent = '';
    for (const letter of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--i', i++);
      span.textContent = letter;
      line.append(span);
    }
    if (dot) line.append(dot);
  });

  /* ---------- Tools line: each word "decodes" into the next ---------- */
  const words = ['Python', 'Java', 'C', 'JavaScript', 'HTML/CSS', 'Linux', 'Git', 'Docker'];
  const scramble = document.querySelector('#scramble');
  const glyphs = '!<>-_/[]{}=+*^?#01';
  let wordIndex = 0;
  let hoverPause = false;

  function decodeTo(target) {
    if (reduceMotion) { scramble.textContent = target; return; }
    const from = scramble.textContent;
    const length = Math.max(from.length, target.length);
    const frames = 18;
    let frame = 0;
    (function tick() {
      let out = '';
      for (let n = 0; n < length; n++) {
        const settleAt = (n / length) * frames * .7 + frames * .3;
        if (frame >= settleAt) out += target[n] || '';
        else out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      scramble.textContent = out;
      if (++frame <= frames) requestAnimationFrame(() => setTimeout(tick, 28));
      else scramble.textContent = target;
    })();
  }
  document.querySelector('.stack').addEventListener('mouseenter', () => { hoverPause = true; });
  document.querySelector('.stack').addEventListener('mouseleave', () => { hoverPause = false; });
  setInterval(() => {
    if (hoverPause || document.hidden || document.querySelector('#home').hidden) return;
    wordIndex = (wordIndex + 1) % words.length;
    decodeTo(words[wordIndex]);
  }, 2400);

  /* ---------- Soft cursor glow ---------- */
  const glow = document.querySelector('.glow');
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); }, {passive: true});
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
    (function follow() {
      x += (tx - x) * .08;
      y += (ty - y) * .08;
      glow.style.setProperty('--gx', `${x}px`);
      glow.style.setProperty('--gy', `${y}px`);
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- Projects ---------- */
  const list = document.querySelector('#project-list');
  if (projects.length) {
    document.querySelector('#projects-empty').hidden = true;
    list.classList.add('project-list');
    projects.forEach((project, index) => {
      const url = new URL(project.url);
      if (url.protocol !== 'https:') return;
      const row = document.createElement('article');
      row.className = 'project-card';
      const number = document.createElement('span');
      number.className = 'project-num';
      number.textContent = String(index + 1).padStart(2, '0');
      const body = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = project.title;
      const description = document.createElement('p');
      description.textContent = project.description;
      const tech = document.createElement('p');
      tech.className = 'project-tech';
      tech.textContent = project.technologies.join(' / ');
      body.append(title, description, tech);
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = '↗';
      link.setAttribute('aria-label', `View ${project.title}`);
      row.append(number, body, link);
      list.append(row);
    });
  }

  /* ---------- Page views (hash routes work on any static host) ---------- */
  const pages = [...document.querySelectorAll('.page-view')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const titles = {home: 'Taras Koval — Computer Science at Western', projects: 'Projects — Taras Koval', contact: 'Contact — Taras Koval'};
  function renderPage(focus = false) {
    const requested = location.hash.slice(1);
    const activePage = pages.some(page => page.id === requested) ? requested : 'home';
    const active = document.getElementById(activePage);
    pages.forEach(page => { page.hidden = page !== active; });
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${activePage}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = titles[activePage];
    window.scrollTo({top: 0, behavior: 'instant'});
    if (focus) active.focus({preventScroll: true});
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const route = link.getAttribute('href');
      if (!pages.some(page => `#${page.id}` === route)) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== route) history.pushState(null, '', route);
      renderPage(true);
    });
  });
  addEventListener('popstate', () => renderPage(true));
  addEventListener('hashchange', () => renderPage(true));
  renderPage();

  /* ---------- Copy email ---------- */
  const address = document.querySelector('#email-address').textContent.trim();
  const copyChip = document.querySelector('.copy-chip');
  const copyLabel = copyChip.querySelector('.copy-label');
  let copyTimer;
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;opacity:0';
      document.body.append(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      return ok;
    }
  }
  copyChip.addEventListener('click', async () => {
    const ok = await copyText(address);
    clearTimeout(copyTimer);
    copyChip.classList.toggle('copied', ok);
    copyLabel.textContent = ok ? 'Copied ✓' : 'Select it';
    copyTimer = setTimeout(() => {
      copyChip.classList.remove('copied');
      copyLabel.textContent = 'Copy';
    }, 2200);
  });

  /* ---------- Contact form (FormSubmit) ---------- */
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const send = form.querySelector('.send-button');
  const sendLabel = send.querySelector('.send-label');
  const sent = document.querySelector('#sent');
  const emailInput = form.querySelector('#sender-email');
  const messageInput = form.querySelector('#message');
  let submitting = false;

  function setError(input, text) {
    input.closest('.field').classList.toggle('invalid', Boolean(text));
    input.setAttribute('aria-invalid', String(Boolean(text)));
    document.getElementById(input.getAttribute('aria-describedby')).textContent = text;
  }
  function validate() {
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const emailError = !email ? 'Please add your email so I can reply.' : !emailInput.checkValidity() ? 'That email doesn’t look quite right.' : '';
    const messageError = !message ? 'Please write a message.' : message.length < 10 ? 'A little more detail, please (10+ characters).' : '';
    setError(emailInput, emailError);
    setError(messageInput, messageError);
    if (emailError) emailInput.focus();
    else if (messageError) messageInput.focus();
    return !emailError && !messageError;
  }
  [emailInput, messageInput].forEach(input => input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('invalid')) setError(input, '');
  }));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !validate()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return;
    if (!data.name.trim()) data.name = '(no name given)';
    submitting = true;
    send.disabled = true;
    send.classList.add('loading');
    sendLabel.textContent = 'Sending…';
    status.textContent = '';
    delete status.dataset.state;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/a71152ca72b24a62c1a925d5de2e4256', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error(result.message || 'Not accepted');
      form.reset();
      form.hidden = true;
      sent.hidden = false;
      sent.focus();
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'Sorry, that didn’t send. Please try again, or email me directly at the address above.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      send.disabled = false;
      send.classList.remove('loading');
      sendLabel.textContent = 'Send message';
    }
  });
  document.querySelector('#send-another').addEventListener('click', () => {
    sent.hidden = true;
    form.hidden = false;
    form.querySelector('input:not([type=hidden]):not(.honeypot)').focus();
  });
})();

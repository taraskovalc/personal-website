// Copyright (c) 2026 Taras Koval. All rights reserved. See LICENSE.
'use strict';

// Add selected, finished projects here when they're ready.
// Shape: { title, description, technologies: ['Python'], url: 'https://github.com/…' }
const projects = [];

(() => {
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

  /* ---------- Toolkit commit graph ---------- */
  const readout = document.querySelector('#readout');
  const commits = [...document.querySelectorAll('.commit')];
  const idleHTML = readout.innerHTML;
  readout.classList.add('idle');
  let pinned = null;

  function show(commit) {
    commits.forEach(c => c.classList.toggle('selected', c === commit));
    readout.classList.toggle('idle', !commit);
    if (!commit) { readout.innerHTML = idleHTML; return; }
    const hash = document.createElement('span');
    hash.className = 'readout-hash';
    hash.textContent = commit.dataset.hash;
    const branch = document.createElement('span');
    branch.className = 'readout-branch';
    branch.textContent = commit.dataset.lane;
    const msg = document.createElement('span');
    msg.className = 'readout-msg';
    msg.textContent = commit.dataset.msg;
    readout.replaceChildren(hash, branch, msg);
  }
  commits.forEach(commit => {
    commit.setAttribute('aria-label', `${commit.querySelector('.label').textContent}: ${commit.dataset.msg}`);
    commit.addEventListener('mouseenter', () => show(commit));
    commit.addEventListener('mouseleave', () => show(pinned));
    commit.addEventListener('focus', () => show(commit));
    commit.addEventListener('blur', () => show(pinned));
    commit.addEventListener('click', () => {
      pinned = pinned === commit ? null : commit;
      show(pinned);
    });
  });

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
      const selected = link.getAttribute('href') === `#${activePage}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
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
  const copyButton = document.querySelector('.copy-email');
  const copyLabel = copyButton.querySelector('.copy-label');
  const copyStatus = document.querySelector('#copy-status');
  let copyTimer;
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for browsers that block the Clipboard API.
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
  copyButton.addEventListener('click', async () => {
    const ok = await copyText(address);
    clearTimeout(copyTimer);
    copyButton.classList.toggle('copied', ok);
    copyLabel.textContent = ok ? 'Copied ✓' : 'Copy address';
    copyStatus.textContent = ok ? 'Address copied — paste it into any email app.' : 'Couldn’t copy automatically. Select the address above instead.';
    copyTimer = setTimeout(() => {
      copyButton.classList.remove('copied');
      copyLabel.textContent = 'Copy address';
      copyStatus.textContent = '';
    }, 3000);
  });

  /* ---------- Contact form (FormSubmit) ---------- */
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const send = form.querySelector('button[type="submit"]');
  let submitting = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return;
    if (!data.name.trim() || data.message.trim().length < 10) {
      status.dataset.state = 'error';
      status.textContent = 'Please include your name and a message of at least 10 characters.';
      return;
    }
    submitting = true;
    send.disabled = true;
    form.setAttribute('aria-busy', 'true');
    send.firstElementChild.textContent = 'Sending…';
    status.textContent = '';
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
      if (/activat|confirm|verif|check.{0,20}(email|inbox)/i.test(result.message || '')) {
        status.dataset.state = 'error';
        status.textContent = 'The form isn’t switched on yet. Please email me directly using the address on this page.';
      } else {
        if (!response.ok || !(result.success === true || result.success === 'true')) {
          throw new Error('Submission was not accepted.');
        }
        status.dataset.state = 'success';
        status.textContent = 'Your message was sent. Thanks for saying hello!';
        form.reset();
      }
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = 'Your message couldn’t be sent. Please email me directly using the address on this page.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      send.disabled = false;
      form.removeAttribute('aria-busy');
      send.firstElementChild.textContent = 'Send message';
    }
  });
})();

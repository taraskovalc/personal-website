'use strict';
// Add selected, completed projects here. This website is the first entry.
const projects = [
  {
    title: 'Personal website',
    description: 'A minimal site with separate page views, an interactive learning toolkit, and an email contact form.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/taraskovalc/personal-website'
  }
];
// Example shape: { title, description, technologies: ['Python'], url: 'https://github.com/…' }

(() => {
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

  const skills = [
    ['Python', 'Scripting and automation.'],
    ['Java', 'Object-oriented programming.'],
    ['C', 'Memory, pointers, and systems fundamentals.'],
    ['HTML', 'Page structure and accessible content.'],
    ['CSS', 'Responsive layouts and visual design.'],
    ['JavaScript', 'Interactive behaviour in the browser.'],
    ['TypeScript', 'Bringing types to JavaScript.'],
    ['Linux', 'The command line and self-hosting.'],
    ['Git', 'Version control and collaboration.'],
    ['Docker', 'Containers and development environments.']
  ];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const note = document.querySelector('#skill-note');
  const options = [...document.querySelectorAll('[data-skill]')];
  const toggle = document.querySelector('.motion-toggle');
  let current = 0;
  let paused = reduceMotion.matches;
  let timer;
  let activePage = 'home';
  let toolkitVisible = true;

  function showSkill(index, announce = false) {
    current = index;
    options.forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
    // Automatic decoration stays quiet for screen readers; deliberate selections are announced.
    note.setAttribute('aria-live', announce ? 'polite' : 'off');
    note.textContent = `${skills[index][0]} / ${skills[index][1]}`;
  }
  function syncTimer() {
    clearInterval(timer);
    if (!paused && activePage === 'home' && toolkitVisible && !document.hidden) {
      timer = setInterval(() => showSkill((current + 1) % skills.length), 3000);
    }
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play skill animation' : 'Pause skill animation');
    toggle.querySelector('.motion-label').textContent = paused ? 'Play' : 'Pause';
    toggle.querySelector('.pause-symbol').textContent = paused ? '▷' : 'Ⅱ';
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; syncTimer(); });
  options.forEach((button, index) => button.addEventListener('click', () => {
    paused = true;
    showSkill(index, true);
    syncTimer();
  }));
  document.addEventListener('visibilitychange', syncTimer);
  reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; syncTimer(); });
  new IntersectionObserver(([entry]) => {
    toolkitVisible = entry.isIntersecting;
    syncTimer();
  }, {threshold: .15}).observe(document.querySelector('.toolkit'));

  // Hash routes work on a static host and support direct links and browser Back/Forward.
  const pages = [...document.querySelectorAll('.page-view')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  function renderPage(focus = false) {
    const requested = location.hash.slice(1);
    activePage = pages.some(page => page.id === requested) ? requested : 'home';
    const active = document.getElementById(activePage);
    pages.forEach(page => { page.hidden = page !== active; });
    navLinks.forEach(link => {
      const selected = link.getAttribute('href') === `#${activePage}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = activePage === 'home' ? 'Taras Koval — Computer Science at Western' : `${activePage === 'projects' ? 'Projects' : 'Contact'} — Taras Koval`;
    // Change the view immediately. No anchor jumps or scrolling past other pages.
    window.scrollTo({top: 0, behavior: 'instant'});
    if (focus) active.focus({preventScroll: true});
    syncTimer();
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
      const response = await fetch('https://formsubmit.co/ajax/ktaras105@gmail.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data),
        signal: controller.signal
      });
      const result = await response.json();
      if (/activat|confirm|verif|check.{0,20}(email|inbox)/i.test(result.message || '')) {
        status.dataset.state = 'error';
        status.textContent = 'The contact form is awaiting email verification. Please email me directly for now.';
      } else {
        if (!response.ok || !(result.success === true || result.success === 'true')) {
          console.warn('Contact service did not accept the message:', response.status, result.message || 'No reason provided.');
          throw new Error('Submission was not accepted.');
        }
        status.dataset.state = 'success';
        status.textContent = 'Your message was submitted. Thanks for saying hello!';
        form.reset();
      }
    } catch (error) {
      console.warn('Contact request failed:', error.name);
      status.dataset.state = 'error';
      status.textContent = 'Your message couldn’t be sent. Please try again or email me directly.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      send.disabled = false;
      form.removeAttribute('aria-busy');
      send.firstElementChild.textContent = 'Send message';
    }
  });
})();

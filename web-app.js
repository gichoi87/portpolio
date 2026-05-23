// ===== Reveal on scroll =====
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Count-up animation =====
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCount(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const useComma = el.dataset.comma === '1';
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const value = target * easeOutCubic(t);
    let display;
    if (Number.isInteger(target)) {
      display = Math.round(value);
      if (useComma) display = display.toLocaleString('en-US');
    } else {
      display = value.toFixed(1);
    }
    el.textContent = display + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.4 });

document.querySelectorAll('.count').forEach(el => countObserver.observe(el));

// ===== Nav scrolled state + active section =====
const nav = document.getElementById('nav');
const sections = ['hero', 'about', 'performance', 'experience', 'process', 'cases', 'why', 'essay']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const navLinks = [...document.querySelectorAll('.nav-links a')];

function onScroll() {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');

  // Active section
  const middle = window.scrollY + window.innerHeight * 0.4;
  let current = sections[0]?.id;
  for (const s of sections) {
    if (s.offsetTop <= middle) current = s.id;
  }
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Modal (Case studies) =====
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const caseData = JSON.parse(document.getElementById('case-data').textContent);

function renderCase(key) {
  const c = caseData[key];
  if (!c) return '';
  const projectsHtml = c.projects.map(p => `
    <div class="modal-project">
      <div class="modal-project-head">
        <div class="modal-project-client">${p.client}</div>
        <div class="modal-project-meta"><b>${p.industry}</b> · ${p.year}</div>
      </div>
      <div class="modal-rows">
        <div class="modal-row-label">PROBLEM</div>
        <div class="modal-row-body">${p.problem}</div>
        <div class="modal-row-label">STRATEGY</div>
        <div class="modal-row-body">${p.strategy}</div>
        <div class="modal-row-label">EXECUTION</div>
        <div class="modal-row-body">${p.execution}</div>
      </div>
      <div class="modal-results">
        ${p.result.map(r => `
          <div class="modal-result">
            <div class="modal-result-value">${r.value}</div>
            <div class="modal-result-label">${r.label}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="modal-eyebrow">${c.category}</div>
    <h3 class="modal-title">${c.headline}</h3>
    <p class="modal-intro">${c.intro}</p>
    ${projectsHtml}
    <div class="modal-insight">
      <span class="modal-insight-tag">INSIGHT</span>
      <p>${c.insight}</p>
    </div>
  `;
}

function openModal(key) {
  modalContent.innerHTML = renderCase(key);
  modalContent.scrollTop = 0;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.case-card').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.case));
});
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

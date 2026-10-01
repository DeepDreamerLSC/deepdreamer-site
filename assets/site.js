(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.querySelector('[data-theme]');
  function applyTheme(day) {
    document.documentElement.classList.toggle('theme-day', day);
    if (themeButton) {
      themeButton.textContent = day ? '☾' : '☀';
      themeButton.setAttribute('aria-label', day ? '切换到夜间主题' : '切换到昼间主题');
    }
    document.dispatchEvent(new CustomEvent('dd-theme'));
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('dd-theme'); } catch { /* Storage can be disabled. */ }
  applyTheme(savedTheme === 'day');
  themeButton?.addEventListener('click', () => {
    const day = !document.documentElement.classList.contains('theme-day');
    applyTheme(day);
    try { localStorage.setItem('dd-theme', day ? 'day' : 'night'); } catch { /* The current page still switches. */ }
  });

  const reveals = document.querySelectorAll('.reveal');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .1 });
    reveals.forEach(item => observer.observe(item));
    document.documentElement.classList.add('js');
  } else reveals.forEach(item => item.classList.add('visible'));
  reducedMotion.addEventListener('change', event => {
    if (event.matches) reveals.forEach(item => item.classList.add('visible'));
  });

  const readingProgress = document.getElementById('top-progress');
  let scrollFrame = 0;
  function updateReadingProgress() {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (readingProgress) readingProgress.style.transform = `scaleX(${max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0})`;
  }
  function scheduleProgress() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateReadingProgress);
  }
  addEventListener('scroll', scheduleProgress, { passive: true });
  addEventListener('resize', scheduleProgress);
  updateReadingProgress();

  const clip = document.querySelector('.gallery-clip');
  const cards = [...document.querySelectorAll('.stage-card')];
  const stages = [...document.querySelectorAll('.team-step')];
  const bar = document.getElementById('gallery-progress');
  if (!clip || !cards.length || stages.length !== cards.length) return;
  function targetFor(card) {
    const relativeLeft = card.getBoundingClientRect().left - clip.getBoundingClientRect().left + clip.scrollLeft;
    return Math.max(0, Math.min(clip.scrollWidth - clip.clientWidth, relativeLeft));
  }
  function setStage(index) {
    stages.forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
  }
  let galleryFrame = 0;
  function updateGallery() {
    galleryFrame = 0;
    let nearest = 0;
    cards.forEach((card, i) => {
      if (Math.abs(targetFor(card) - clip.scrollLeft) < Math.abs(targetFor(cards[nearest]) - clip.scrollLeft)) nearest = i;
    });
    setStage(nearest);
    const max = clip.scrollWidth - clip.clientWidth;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.max(0, Math.min(1, clip.scrollLeft / max)) : 0})`;
  }
  function scheduleGallery() {
    if (!galleryFrame) galleryFrame = requestAnimationFrame(updateGallery);
  }
  stages.forEach((button, index) => button.addEventListener('click', () => {
    setStage(index);
    clip.scrollTo({ left: targetFor(cards[index]), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }));
  clip.addEventListener('scroll', scheduleGallery, { passive: true });
  addEventListener('resize', scheduleGallery);
  updateGallery();
})();

/**
 * Cursor × Airbnb Landing Page
 * Scroll animations and nav interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initNavScroll();
});

function initScrollAnimations() {
  const sections = document.querySelectorAll(
    '.pov-card, .platform-card, .intel-card, .persona-card, .metric-card, .team-card, .coinbase-content, .coinbase-visual'
  );

  sections.forEach((el) => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  sections.forEach((el) => observer.observe(el));
}

function initNavScroll() {
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
    } else {
      nav.style.borderBottomColor = '';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

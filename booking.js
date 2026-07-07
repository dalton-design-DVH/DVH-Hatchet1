/**
 * Demo booking modal with Calendly inline embed + fallback options
 */

function initBooking() {
  const config = window.SITE_CONFIG || {};
  const modal = document.getElementById('booking-modal');
  const overlay = document.getElementById('booking-overlay');
  const closeBtn = document.getElementById('booking-close');
  const calendlyContainer = document.getElementById('calendly-embed');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    overlay?.classList.add('open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    loadCalendly(config.calendlyUrl);
  }

  function closeModal() {
    modal.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  function loadCalendly(url) {
    if (!calendlyContainer || !url) return;

    calendlyContainer.innerHTML = '';

    if (!document.querySelector('script[src*="calendly.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const widget = document.createElement('div');
    widget.className = 'calendly-inline-widget';
    widget.setAttribute('data-url', url);
    widget.style.minWidth = '320px';
    widget.style.height = '630px';
    calendlyContainer.appendChild(widget);

    const tryInit = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({ url, parentElement: calendlyContainer });
      } else {
        setTimeout(tryInit, 200);
      }
    };
    tryInit();
  }

  document.querySelectorAll('[data-book-demo]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', initBooking);

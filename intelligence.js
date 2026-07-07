/**
 * Loads and renders dynamic Airbnb intelligence cards from data/intelligence.json
 */

async function loadIntelligence() {
  const grid = document.getElementById('intel-grid');
  const sourcesEl = document.getElementById('intel-source-links');
  const feedLabel = document.getElementById('intel-feed-label');

  if (!grid) return;

  try {
    const res = await fetch('data/intelligence.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const cards = [
      ...data.baseline.filter((c) => c.pinned),
      ...data.feed.filter((c) => !data.baseline.some((b) => b.id === c.id)),
    ].slice(0, 8);

    grid.innerHTML = cards
      .map(
        (card) => `
        <article class="intel-card${card.url ? ' intel-card-feed' : ''}">
          <span class="intel-source">${escapeHtml(card.source)}</span>
          <h3>${card.url ? `<a href="${escapeHtml(card.url)}" target="_blank" rel="noopener">${escapeHtml(card.title)}</a>` : escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.summary)}</p>
          ${card.cursorAngle ? `<p class="intel-angle"><strong>Cursor angle:</strong> ${escapeHtml(card.cursorAngle)}</p>` : ''}
        </article>
      `
      )
      .join('');

    if (sourcesEl && data.sources) {
      sourcesEl.innerHTML = data.sources
        .map(
          (s) =>
            `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`
        )
        .join('');
    }

    if (feedLabel && data.feed?.length > 0) {
      feedLabel.textContent = `${data.feed.length} live feed items · ${data.monitoredQueries?.length || 0} queries monitored`;
    }

    grid.querySelectorAll('.intel-card').forEach((el) => {
      el.classList.add('fade-in');
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  } catch (err) {
    console.warn('Intelligence feed unavailable, using static fallback:', err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadIntelligence);

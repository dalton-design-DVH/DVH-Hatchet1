/**
 * Loads and renders Cursor blog posts, case studies, and changelog from data/intelligence.json
 */

const TYPE_LABELS = {
  'case-study': 'Case Study',
  blog: 'Blog Post',
  changelog: 'Product Update',
};

async function loadIntelligence() {
  const grid = document.getElementById('intel-grid');
  const feedLabel = document.getElementById('intel-feed-label');

  if (!grid) return;

  try {
    const res = await fetch('data/intelligence.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const items = data.items || [];

    grid.innerHTML = items
      .map(
        (item) => `
        <article class="intel-card intel-card-${item.type || 'blog'}">
          <div class="intel-card-meta">
            <span class="intel-type intel-type-${item.type || 'blog'}">${escapeHtml(TYPE_LABELS[item.type] || 'Blog Post')}</span>
            <span class="intel-source">${escapeHtml(item.source)}</span>
          </div>
          <h3><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.summary)}</p>
        </article>
      `
      )
      .join('');

    if (sourcesEl && data.sources) {
      sourcesEl.innerHTML = data.sources
        .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`)
        .join('');
    }

    if (feedLabel && data.lastUpdated) {
      const counts = {
        'case-study': items.filter((i) => i.type === 'case-study').length,
        blog: items.filter((i) => i.type === 'blog').length,
        changelog: items.filter((i) => i.type === 'changelog').length,
      };
      const updated = new Date(data.lastUpdated).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      feedLabel.textContent = `${counts['case-study']} case studies · ${counts.blog} blog posts · ${counts.changelog} product updates · Updated ${updated}`;
    }

    grid.querySelectorAll('.intel-card').forEach((el) => {
      el.classList.add('fade-in');
      requestAnimationFrame(() => el.classList.add('visible'));
    });
  } catch (err) {
    console.warn('Cursor content feed unavailable:', err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadIntelligence);

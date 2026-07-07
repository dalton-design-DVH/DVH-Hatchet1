#!/usr/bin/env node
/**
 * Fetches fresh Airbnb intelligence from public RSS feeds and news sources.
 * Run manually or via GitHub Actions (daily cron).
 *
 * Usage: node scripts/update-intelligence.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'intelligence.json');

const QUERIES = [
  'Airbnb engineering AI developer',
  'Airbnb developer productivity',
  'Airbnb CTO Ahmad Al-Dahle',
];

const CURATED_SOURCES = [
  { label: 'LinearB — Airbnb DevEx', url: 'https://linearb.io/blog/airbnb-developer-experience-transformation' },
  { label: 'DX Podcast — Anna Sulkina', url: 'https://getdx.com/podcast/developer-experience-notion-airbnb/' },
  { label: 'Spotify — DevEx Podcast', url: 'https://open.spotify.com/episode/0SswYNfvQF11Yt5T80eVwb' },
];

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '');
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = decodeHtml((block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) || [])[1] || '');
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1]?.trim() || '';
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]?.trim() || '';
    const description = decodeHtml((block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '');

    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }

  return items;
}

function inferCursorAngle(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('ai') && (text.includes('code') || text.includes('engineer'))) {
    return 'Aligns with Cursor\'s agent-first paradigm — shift from line-by-line coding to supervising autonomous execution.';
  }
  if (text.includes('developer') && (text.includes('productivity') || text.includes('experience'))) {
    return 'Directly relevant to Anna Sulkina\'s DevEx KPIs — focus time, goal clarity, and developer satisfaction.';
  }
  if (text.includes('release') || text.includes('ship') || text.includes('velocity')) {
    return 'Supports Project Y\'s hourly release mandate — match Coinbase\'s 90%+ time-to-market reduction.';
  }
  if (text.includes('payment') || text.includes('fintech') || text.includes('compliance')) {
    return 'Cursor\'s ZDR + .cursorrules guardrails enable safe agentic coding in regulated domains.';
  }
  return 'Monitor for alignment with Cursor\'s enterprise agent-first value proposition.';
}

async function fetchGoogleNewsRss(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Cursor-Airbnb-Intel-Bot/1.0' },
    });

    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml).map((item) => ({
      ...item,
      query,
      source: 'Google News',
    }));
  } catch (err) {
    console.warn(`Failed to fetch RSS for "${query}":`, err.message);
    return [];
  }
}

function dedupeByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatFeedItem(item) {
  const date = item.pubDate ? new Date(item.pubDate) : new Date();
  const sourceLabel = item.source || 'News';
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return {
    id: `feed-${Buffer.from(item.title).toString('base64url').slice(0, 16)}`,
    source: `${sourceLabel} · ${formattedDate}`,
    title: item.title.length > 120 ? item.title.slice(0, 117) + '...' : item.title,
    summary: item.description?.slice(0, 280) || 'Latest coverage on Airbnb engineering and AI adoption.',
    cursorAngle: inferCursorAngle(item.title, item.description || ''),
    url: item.link,
    pubDate: date.toISOString(),
    pinned: false,
  };
}

async function main() {
  console.log('Updating Airbnb intelligence feed...');

  const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

  const allRssItems = [];
  for (const query of QUERIES) {
    const items = await fetchGoogleNewsRss(query);
    allRssItems.push(...items);
    console.log(`  "${query}": ${items.length} items`);
  }

  const unique = dedupeByTitle(allRssItems)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 8)
    .map(formatFeedItem);

  const updated = {
    ...existing,
    lastUpdated: new Date().toISOString(),
    feed: unique,
    sources: CURATED_SOURCES,
    monitoredQueries: QUERIES,
  };

  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + '\n');
  console.log(`\nUpdated ${DATA_PATH}`);
  console.log(`  Baseline cards: ${updated.baseline.length}`);
  console.log(`  Feed items: ${updated.feed.length}`);
  console.log(`  Last updated: ${updated.lastUpdated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

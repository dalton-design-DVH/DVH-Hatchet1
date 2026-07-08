#!/usr/bin/env node
/**
 * Fetches live blog posts, case studies, and changelog entries from cursor.com.
 * Run manually or via GitHub Actions (daily cron).
 *
 * Usage: node scripts/update-intelligence.mjs
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'intelligence.json');
const BASE_URL = 'https://cursor.com';

const CASE_STUDY_SLUGS = [
  'coinbase',
  'wayfair',
  'faire',
  'dropbox',
  'paypal',
  'stripe',
  'nvidia',
  'salesforce',
];

const PINNED_CASE_STUDIES = ['coinbase', 'wayfair', 'faire'];

const SOURCES = [
  { label: 'Cursor Blog', url: 'https://cursor.com/blog' },
  { label: 'Customer Stories', url: 'https://cursor.com/blog/topic/customers' },
  { label: 'Changelog', url: 'https://cursor.com/changelog' },
];

const EXCLUDED_SLUGS = new Set(['topic', 'product', 'research', 'company', 'ideas', 'customers']);

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
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

    if (title && link) items.push({ title, link, pubDate, description });
  }

  return items;
}

function formatDateLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function cleanTitle(title) {
  return title.replace(/\s*·\s*Cursor\s*$/i, '').trim();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Cursor-Landing-Intel-Bot/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchOgMeta(slug) {
  const url = `${BASE_URL}/blog/${slug}`;
  try {
    const html = await fetchText(url);
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    const dateMatch = html.match(/<meta property="article:published_time" content="([^"]+)"/);

    if (!titleMatch) return null;

    return {
      slug,
      title: cleanTitle(decodeHtml(titleMatch[1])),
      summary: decodeHtml(descMatch?.[1] || ''),
      url,
      pubDate: dateMatch ? new Date(dateMatch[1]) : new Date(0),
    };
  } catch (err) {
    console.warn(`  Failed to fetch /blog/${slug}:`, err.message);
    return null;
  }
}

async function discoverBlogSlugs() {
  const html = await fetchText(`${BASE_URL}/blog`);
  const slugs = new Set();
  const regex = /href="\/blog\/([a-z0-9-]+)"/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    if (!EXCLUDED_SLUGS.has(slug)) slugs.add(slug);
  }

  return [...slugs];
}

async function fetchChangelogItems() {
  const xml = await fetchText(`${BASE_URL}/changelog/rss.xml`);
  return parseRssItems(xml).slice(0, 6).map((item) => {
    const date = item.pubDate ? new Date(item.pubDate) : new Date();
    return {
      id: `changelog-${Buffer.from(item.link).toString('base64url').slice(0, 12)}`,
      type: 'changelog',
      source: `Changelog · ${formatDateLabel(date)}`,
      title: item.title,
      summary: item.description || 'Latest product update from Cursor.',
      url: item.link,
      pubDate: date.toISOString(),
      pinned: false,
    };
  });
}

async function fetchBlogItems() {
  const discovered = await discoverBlogSlugs();
  const slugs = [...new Set([...CASE_STUDY_SLUGS, ...discovered])];
  console.log(`  Discovered ${discovered.length} blog slugs, fetching metadata for ${slugs.length} posts...`);

  const items = [];
  const batchSize = 5;

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchOgMeta));
    items.push(...results.filter(Boolean));
  }

  return items.map((item) => {
    const isCaseStudy = CASE_STUDY_SLUGS.includes(item.slug);
    const date = item.pubDate.getTime() > 0 ? item.pubDate : new Date();

    return {
      id: `blog-${item.slug}`,
      type: isCaseStudy ? 'case-study' : 'blog',
      source: `${isCaseStudy ? 'Case Study' : 'Blog'} · ${formatDateLabel(date)}`,
      title: item.title,
      summary: item.summary || (isCaseStudy ? 'Customer story from cursor.com.' : 'Latest post from the Cursor blog.'),
      url: item.url,
      pubDate: date.toISOString(),
      pinned: PINNED_CASE_STUDIES.includes(item.slug),
    };
  });
}

function dedupeByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

async function main() {
  console.log('Updating Cursor blog & case study feed...');

  const [blogItems, changelogItems] = await Promise.all([
    fetchBlogItems(),
    fetchChangelogItems(),
  ]);

  console.log(`  Blog & case studies: ${blogItems.length}`);
  console.log(`  Changelog entries: ${changelogItems.length}`);

  const pinned = blogItems.filter((i) => i.pinned).slice(0, 3);
  const moreCaseStudies = blogItems
    .filter((i) => i.type === 'case-study' && !i.pinned)
    .slice(0, 2);
  const blogs = blogItems.filter((i) => i.type === 'blog').slice(0, 4);
  const changelog = changelogItems.slice(0, 3);

  const items = dedupeByUrl([...pinned, ...moreCaseStudies, ...blogs, ...changelog]).slice(0, 12);

  const updated = {
    lastUpdated: new Date().toISOString(),
    items,
    sources: SOURCES,
  };

  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + '\n');
  console.log(`\nUpdated ${DATA_PATH}`);
  console.log(`  Total items: ${items.length}`);
  console.log(`  Case studies: ${items.filter((i) => i.type === 'case-study').length}`);
  console.log(`  Blog posts: ${items.filter((i) => i.type === 'blog').length}`);
  console.log(`  Changelog: ${items.filter((i) => i.type === 'changelog').length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

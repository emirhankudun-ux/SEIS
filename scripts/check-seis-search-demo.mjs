import { readFileSync } from 'node:fs';

const htmlPath = 'apps/web/seis-search.html';
const docPath = 'docs/product/seis-search-demo.md';
const html = readFileSync(htmlPath, 'utf8');
const doc = readFileSync(docPath, 'utf8');

const requiredHtml = [
  'SEIS Search',
  'Find the whole OS.',
  'data-seis-search-demo="browser-local"',
  'seis.search.demo.v1',
  'data-state="local-demo"',
  'data-state="mock"',
  'data-state="planned"',
  'data-state="disabled"',
  'Search filters',
  'Quick open',
  'Command suggestions',
  'Recent searches',
  'empty-state',
  'ArrowDown',
  'ArrowUp',
  'Ctrl K',
  'localStorage',
  'prefers-reduced-motion',
  'no web crawling, no provider calls, no external API, no secrets'
];
const requiredFilters = ['All', 'Modules', 'Docs', 'Code', 'Agents', 'Prompts', 'Providers', 'GitHub', 'Design', 'Cloud', 'Files', 'Roadmap'];
const requiredDocs = ['SEIS Search Browser-Local Demo', '`apps/web/seis-search.html`', '`local-demo`', '`mock`', '`planned`', '`disabled`', '`Ctrl K`', 'Arrow Up', 'Arrow Down', 'does not crawl the web', 'node scripts/check-seis-search-demo.mjs'];
const forbiddenHtml = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'child_process', 'exec(', 'spawn(', 'apiKey:', 'token:', 'BEGIN OPENSSH', 'PRIVATE KEY'];

const missingHtml = requiredHtml.filter((needle) => !html.includes(needle));
const missingFilters = requiredFilters.filter((needle) => !html.includes(needle));
const missingDocs = requiredDocs.filter((needle) => !doc.includes(needle));
const forbiddenFound = forbiddenHtml.filter((needle) => html.includes(needle));

if (missingHtml.length || missingFilters.length || missingDocs.length || forbiddenFound.length) {
  console.error('SEIS Search demo check failed.');
  if (missingHtml.length) console.error('Missing HTML markers:', missingHtml.join(', '));
  if (missingFilters.length) console.error('Missing filters:', missingFilters.join(', '));
  if (missingDocs.length) console.error('Missing doc markers:', missingDocs.join(', '));
  if (forbiddenFound.length) console.error('Forbidden HTML markers:', forbiddenFound.join(', '));
  process.exit(1);
}

console.log('SEIS Search demo check passed.');

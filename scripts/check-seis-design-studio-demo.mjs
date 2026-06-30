import { readFileSync } from 'node:fs';

const htmlPath = 'apps/web/seis-design-studio.html';
const docPath = 'docs/product/seis-design-studio-demo.md';
const html = readFileSync(htmlPath, 'utf8');
const doc = readFileSync(docPath, 'utf8');

const requiredHtml = [
  'SEIS Design Studio',
  'Design the operating layer.',
  'data-seis-design-studio-demo="browser-local"',
  'seis.design.studio.v1',
  'data-state="local-demo"',
  'data-state="mock"',
  'data-state="planned"',
  'data-state="disabled"',
  'Prototype canvas',
  'Design tokens',
  'Component cards',
  'AI design assistant',
  'Prototype preview',
  'Save local draft',
  'Export mock handoff',
  'Generate mock critique',
  'localStorage',
  'prefers-reduced-motion',
  'No provider call'
];
const requiredDocs = [
  'SEIS Design Studio Browser-Local Demo',
  '`apps/web/seis-design-studio.html`',
  '`local-demo`',
  '`mock`',
  '`planned`',
  '`disabled`',
  'does not upload assets',
  'call AI providers',
  'node scripts/check-seis-design-studio-demo.mjs'
];
const forbiddenHtml = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'child_process', 'exec(', 'spawn(', 'apiKey:', 'access_token:', 'BEGIN OPENSSH', 'PRIVATE KEY'];

const missingHtml = requiredHtml.filter((needle) => !html.includes(needle));
const missingDocs = requiredDocs.filter((needle) => !doc.includes(needle));
const forbiddenFound = forbiddenHtml.filter((needle) => html.includes(needle));

if (missingHtml.length || missingDocs.length || forbiddenFound.length) {
  console.error('SEIS Design Studio demo check failed.');
  if (missingHtml.length) console.error('Missing HTML markers:', missingHtml.join(', '));
  if (missingDocs.length) console.error('Missing doc markers:', missingDocs.join(', '));
  if (forbiddenFound.length) console.error('Forbidden HTML markers:', forbiddenFound.join(', '));
  process.exit(1);
}

console.log('SEIS Design Studio demo check passed.');

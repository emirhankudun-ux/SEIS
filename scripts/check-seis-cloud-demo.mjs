import { readFileSync } from 'node:fs';

const htmlPath = 'apps/web/seis-cloud.html';
const docPath = 'docs/product/seis-cloud-demo.md';
const html = readFileSync(htmlPath, 'utf8');
const doc = readFileSync(docPath, 'utf8');

const requiredHtml = [
  'SEIS Cloud Control',
  'Cloud without pretending.',
  'data-seis-cloud-demo="browser-local"',
  "seis.cloud.control.v1",
  'data-state="connected"',
  'data-state="mock"',
  'data-state="disabled"',
  'data-state="planned"',
  'data-state="unknown"',
  'Run local readiness sweep',
  'Create deployment dry run',
  'Save browser profile',
  'Copy safe env example',
  'SSH execution disabled',
  'No private keys, tokens, cookies, or provider secrets are present.',
  'localStorage',
  'navigator.clipboard',
  'prefers-reduced-motion'
];

const requiredDoc = [
  'SEIS Cloud Browser-Local Demo',
  '`apps/web/seis-cloud.html`',
  '`connected`',
  '`mock`',
  '`disabled`',
  '`planned`',
  '`unknown`',
  'does not execute shell commands',
  'no browser-exposed private keys',
  'node scripts/check-seis-cloud-demo.mjs'
];

const forbiddenHtml = [
  'fetch(',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'child_process',
  'exec(',
  'spawn(',
  'private_key',
  'PRIVATE KEY',
  'BEGIN OPENSSH',
  'apiKey:',
  'token:'
];

const missingHtml = requiredHtml.filter((needle) => !html.includes(needle));
const missingDoc = requiredDoc.filter((needle) => !doc.includes(needle));
const forbiddenFound = forbiddenHtml.filter((needle) => html.includes(needle));

if (missingHtml.length || missingDoc.length || forbiddenFound.length) {
  console.error('SEIS Cloud demo check failed.');
  if (missingHtml.length) console.error('Missing HTML markers:', missingHtml.join(', '));
  if (missingDoc.length) console.error('Missing doc markers:', missingDoc.join(', '));
  if (forbiddenFound.length) console.error('Forbidden HTML markers:', forbiddenFound.join(', '));
  process.exit(1);
}

console.log('SEIS Cloud demo check passed.');

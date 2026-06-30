import { readFileSync } from 'node:fs';

const files = {
  html: 'apps/web/seis-command-center.html',
  docs: 'docs/product/seis-command-center-demo.md',
};

const html = readFileSync(files.html, 'utf8');
const docs = readFileSync(files.docs, 'utf8');

const requiredHtmlMarkers = [
  'SEIS Command Center',
  'data-seis-command-center-demo="browser-local"',
  'seis.command.center.demo.v1',
  'System health',
  'AI Core status',
  'Provider registry',
  'GitHub status',
  'Foundation Check',
  'Publish Readiness',
  'Quality Governance',
  'SSH/cloud status',
  'Active agents',
  'Recent decisions',
  'Roadmap progress',
  'Quick actions',
  'Demo launch flow',
  'PR rescue status',
  'localStorage',
  'prefers-reduced-motion',
];

const requiredDocMarkers = [
  '# SEIS Command Center Demo',
  'browser-local',
  'local-demo',
  'mock',
  'approval-needed',
  'planned',
  'blocked',
  'disabled',
  'How to run',
  'How to validate',
  'Security notes',
  'GitHub and merge governance',
];

const forbiddenHtmlPatterns = [
  'fet' + 'ch(',
  'XML' + 'HttpRequest',
  'Web' + 'Socket',
  'Event' + 'Source',
  'child_' + 'process',
  'ex' + 'ec(',
  'sp' + 'awn(',
  'api' + 'Key:',
  'access_' + 'token:',
  'BEGIN OPENSSH',
  'PRIVATE KEY',
];

const failures = [];

for (const marker of requiredHtmlMarkers) {
  if (!html.includes(marker)) failures.push(`${files.html} missing marker: ${marker}`);
}

for (const marker of requiredDocMarkers) {
  if (!docs.includes(marker)) failures.push(`${files.docs} missing marker: ${marker}`);
}

for (const pattern of forbiddenHtmlPatterns) {
  if (html.includes(pattern)) failures.push(`${files.html} contains forbidden pattern: ${pattern}`);
}

const buttonCount = (html.match(/<button\b/g) || []).length;
const listenerHints = ['addEventListener', 'data-action', 'data-tab', 'data-filter', 'data-step'];
for (const hint of listenerHints) {
  if (!html.includes(hint)) failures.push(`${files.html} missing interaction hint: ${hint}`);
}

if (buttonCount < 20) failures.push(`${files.html} should expose a rich interactive surface, found ${buttonCount} buttons`);
if (!html.includes('<main>')) failures.push(`${files.html} missing semantic main element`);
if (!html.includes('aria-live')) failures.push(`${files.html} missing aria-live region for updates`);

if (failures.length) {
  console.error('SEIS Command Center demo validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEIS Command Center demo validation passed.');
console.log(`Checked ${files.html}, ${files.docs}; interactive buttons: ${buttonCount}.`);

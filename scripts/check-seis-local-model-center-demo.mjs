import { readFileSync } from 'node:fs';

const files = {
  html: 'apps/web/seis-local-model-center.html',
  docs: 'docs/ai/seis-local-model-center-demo.md',
};

const html = readFileSync(files.html, 'utf8');
const docs = readFileSync(files.docs, 'utf8');

const requiredHtmlMarkers = [
  'SEIS Local Model Center',
  'data-seis-local-model-center="browser-local"',
  'seis.local.model.center.demo.v1',
  'Ollama',
  'Local model registry',
  'local model status',
  'Local endpoint documentation',
  'http://localhost:11434',
  'Offline Demo mode',
  'Local prompt testing',
  'Local Router Fallback',
  'No paid APIs required',
  'Small Model Mode',
  'CONTINUE_FROM',
  'DEVAM',
  'localStorage',
  'executionPerformed=false',
  'cloudFallback=false',
  'prefers-reduced-motion',
];

const requiredDocMarkers = [
  '# SEIS Local Model Center Demo',
  'Local AI / Ollama',
  'local model registry',
  'local model status',
  'http://localhost:11434',
  'Offline/demo mode',
  'Local model router fallback',
  'no API keys',
  'CONTINUE_FROM',
  'DEVAM',
  'What is real',
  'What is mock or planned',
  'What is blocked',
  'Security notes',
  'Next safe action',
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
const interactionHints = ['addEventListener', 'data-action', 'data-tab', 'data-model', 'data-task', 'data-gate'];
for (const hint of interactionHints) {
  if (!html.includes(hint)) failures.push(`${files.html} missing interaction hint: ${hint}`);
}

if (buttonCount < 12) failures.push(`${files.html} should expose a meaningful interactive surface, found ${buttonCount} buttons`);
if (!html.includes('<main>')) failures.push(`${files.html} missing semantic main element`);
if (!html.includes('aria-live')) failures.push(`${files.html} missing aria-live region`);
if (!html.includes('endpointCall=false')) failures.push(`${files.html} must keep endpointCall false in mock output`);
if (!html.includes('cloudFallback=false')) failures.push(`${files.html} must keep cloudFallback false in mock output`);

if (failures.length) {
  console.error('SEIS Local Model Center demo validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEIS Local Model Center demo validation passed.');
console.log(`Checked ${files.html}, ${files.docs}; static buttons: ${buttonCount}.`);

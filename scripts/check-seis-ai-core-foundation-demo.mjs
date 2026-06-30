import { readFileSync } from 'node:fs';

const files = {
  html: 'apps/web/seis-ai-core-foundation.html',
  docs: 'docs/ai/seis-ai-core-foundation-demo.md',
};

const html = readFileSync(files.html, 'utf8');
const docs = readFileSync(files.docs, 'utf8');

const requiredHtmlMarkers = [
  'SEIS AI Core',
  'data-seis-ai-core-foundation="browser-local"',
  'seis.ai.core.foundation.demo.v1',
  'provider registry',
  'model router',
  'prompt engine',
  'No-key startup',
  'Local Demo mode',
  'Missing Key',
  'Disabled',
  'server-only',
  'local-only',
  'Ollama',
  'OpenAI',
  'Anthropic',
  'Gemini',
  'executionPerformed',
  'localStorage',
  'prefers-reduced-motion',
];

const requiredDocMarkers = [
  '# SEIS AI Core Foundation Demo',
  'browser-local',
  'Provider registry',
  'Model router simulator',
  'Prompt engine preview',
  'no-key startup',
  'localStorage',
  'Missing Key',
  'Disabled',
  'blocked',
  'demo-only',
  'What is real',
  'What is mock or demo-only',
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
const interactionHints = ['addEventListener', 'data-action', 'data-tab', 'data-provider', 'data-route', 'data-prompt', 'data-gate'];
for (const hint of interactionHints) {
  if (!html.includes(hint)) failures.push(`${files.html} missing interaction hint: ${hint}`);
}

if (buttonCount < 20) failures.push(`${files.html} should expose a rich interactive surface, found ${buttonCount} buttons`);
if (!html.includes('<main>')) failures.push(`${files.html} missing semantic main element`);
if (!html.includes('aria-live')) failures.push(`${files.html} missing aria-live region`);
if (!html.includes('execution = "false"')) failures.push(`${files.html} must keep router executionPerformed false`);

if (failures.length) {
  console.error('SEIS AI Core foundation demo validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEIS AI Core foundation demo validation passed.');
console.log(`Checked ${files.html}, ${files.docs}; interactive buttons: ${buttonCount}.`);

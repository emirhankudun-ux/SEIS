import { readFileSync } from 'node:fs';

const files = {
  html: 'apps/web/seis-provider-registry.html',
  docs: 'docs/ai/seis-provider-registry-demo.md',
};

const html = readFileSync(files.html, 'utf8');
const docs = readFileSync(files.docs, 'utf8');

const requiredHtmlMarkers = [
  'SEIS Provider Registry',
  'data-seis-provider-registry="browser-local"',
  'seis.provider.registry.demo.v1',
  'provider id',
  'provider name',
  'requires key',
  'demo status',
  'live status',
  'environment variable name',
  'supported tasks',
  'unavailable reasons',
  'safety notes',
  'frontend exposure risk',
  'backend requirement',
  'future integration notes',
  'Available',
  'Missing Key',
  'Disabled',
  'Rate Limited',
  'Error',
  'OpenAI',
  'Anthropic',
  'Gemini',
  'OpenRouter',
  'Ollama',
  'Mistral',
  'Groq',
  'Cohere',
  'Hugging Face',
  'Replicate',
  'Together',
  'Perplexity',
  'localStorage',
  'prefers-reduced-motion',
];

const requiredDocMarkers = [
  '# SEIS Provider Registry Demo',
  'provider id',
  'provider name',
  'type',
  'requires key',
  'demo status',
  'live status',
  'Environment variable name',
  'Supported tasks',
  'frontend exposure risk',
  'backend requirement',
  'Missing Key from Error',
  'What is real',
  'What is mock or metadata-only',
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

const providerIds = ['openai-general', 'anthropic-claude', 'google-gemini', 'openrouter', 'ollama-local', 'mistral', 'groq', 'cohere', 'hugging-face', 'replicate', 'together', 'perplexity'];
for (const providerId of providerIds) {
  if (!html.includes(providerId)) failures.push(`${files.html} missing provider id: ${providerId}`);
}

const buttonCount = (html.match(/<button\b/g) || []).length;
const interactionHints = ['addEventListener', 'data-action', 'data-filter', 'data-provider', 'data-state'];
for (const hint of interactionHints) {
  if (!html.includes(hint)) failures.push(`${files.html} missing interaction hint: ${hint}`);
}
if (buttonCount < 20) failures.push(`${files.html} should expose a meaningful interactive surface, found ${buttonCount} buttons`);
if (!html.includes('<main>')) failures.push(`${files.html} missing semantic main element`);
if (!html.includes('aria-live')) failures.push(`${files.html} missing aria-live region`);

if (failures.length) {
  console.error('SEIS Provider Registry demo validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEIS Provider Registry demo validation passed.');
console.log(`Checked ${files.html}, ${files.docs}; static buttons: ${buttonCount}.`);

import { readFileSync } from 'node:fs';

const files = {
  html: 'apps/web/seis-model-router-studio.html',
  docs: 'docs/ai/seis-model-router-studio-demo.md',
};

const html = readFileSync(files.html, 'utf8');
const docs = readFileSync(files.docs, 'utf8');

const requiredHtmlMarkers = [
  'SEIS Model Router',
  'data-seis-model-router-studio="browser-local"',
  'seis.model.router.studio.demo.v1',
  'taskType',
  'capabilityLabel',
  'privacyMode',
  'providerState',
  'selectedProvider',
  'selectedModel',
  'routeEligible',
  'executionPerformed',
  'fallbackPolicy',
  'blockedReasons',
  'silentFallback',
  'localOnlyCanUseCloud',
  'Missing Key',
  'Disabled',
  'Rate Limited',
  'Error',
  'Unknown',
  'repo audit',
  'coding',
  'debugging',
  'architecture',
  'security review',
  'local/offline mode',
  'PR summary',
  'CI failure diagnosis',
  'GitHub governance',
  'demo packaging',
  'redacted routing decision log',
  'client bundle secret exposure check',
  'human approval',
  'localStorage',
  'prefers-reduced-motion',
];

const requiredDocMarkers = [
  '# SEIS Model Router Decision Studio Demo',
  'read-only model router contract',
  'task type',
  'capability label',
  'privacy mode',
  'provider state',
  'selected provider',
  'selected model',
  'fallback policy',
  'blocked reasons',
  'executionPerformed=false',
  'silentFallback=false',
  'localOnlyCanUseCloud=false',
  'Missing Key is distinct from Error',
  'What is real',
  'What is mock or read-only',
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
const interactionHints = ['addEventListener', 'data-action', 'data-task', 'data-gate', 'change'];
for (const hint of interactionHints) {
  if (!html.includes(hint)) failures.push(`${files.html} missing interaction hint: ${hint}`);
}

if (buttonCount < 8) failures.push(`${files.html} should expose a meaningful interactive surface, found ${buttonCount} buttons`);
if (!html.includes('<main>')) failures.push(`${files.html} missing semantic main element`);
if (!html.includes('aria-live')) failures.push(`${files.html} missing aria-live region`);
if (!html.includes('<span>false</span>')) failures.push(`${files.html} must visibly keep false integrity values`);
if (!html.includes('executionPerformed remains false')) failures.push(`${files.html} must state executionPerformed remains false`);

if (failures.length) {
  console.error('SEIS Model Router Studio demo validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEIS Model Router Studio demo validation passed.');
console.log(`Checked ${files.html}, ${files.docs}; static buttons: ${buttonCount}.`);

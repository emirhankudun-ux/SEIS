import { readFileSync } from 'node:fs';

const files = {
  html: 'apps/web/seis-prompt-engine-studio.html',
  docs: 'docs/ai/seis-prompt-engine-studio-demo.md',
};

const html = readFileSync(files.html, 'utf8');
const docs = readFileSync(files.docs, 'utf8');

const requiredHtmlMarkers = [
  'SEIS Prompt Engine',
  'data-seis-prompt-engine-studio="browser-local"',
  'seis.prompt.engine.studio.demo.v1',
  'base SEIS identity prompt',
  'repo audit prompt',
  'foundation repair prompt',
  'design system prompt',
  'AI provider audit prompt',
  'PR rescue prompt',
  'CI diagnosis prompt',
  'demo packaging prompt',
  'Web Desktop generation prompt',
  'SEIS Code IDE prompt',
  'security review prompt',
  'accessibility review prompt',
  'Cursor Free efficient prompt',
  'Ollama continuation prompt',
  'Claude Code deep implementation prompt',
  'Codex PR-safe implementation prompt',
  'id',
  'title',
  'version',
  'owner area',
  'intended capability',
  'allowed context',
  'denied context',
  'provider capability requirements',
  'output schema',
  'evaluation fixture',
  'rollback note',
  'allowed actions',
  'forbidden actions',
  'safety boundaries',
  'validation method',
  'promptExecuted',
  'providerCalled',
  'credentialRead',
  'archivePromoted',
  'prompt-pack schema',
  'golden conversation tests',
  'prompt injection tests',
  'redaction test',
  'localStorage',
  'prefers-reduced-motion',
];

const requiredDocMarkers = [
  '# SEIS Prompt Engine Studio Demo',
  'versioned prompt packs',
  'allowed actions',
  'forbidden actions',
  'safety boundaries',
  'validation method',
  'promptExecuted=false',
  'providerCalled=false',
  'credentialRead=false',
  'archivePromoted=false',
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

const buttonCount = (html.match(/<button\b/g) || []).length;
const interactionHints = ['addEventListener', 'data-action', 'data-pack', 'change', 'textarea'];
for (const hint of interactionHints) {
  if (!html.includes(hint)) failures.push(`${files.html} missing interaction hint: ${hint}`);
}
if (buttonCount < 10) failures.push(`${files.html} should expose a meaningful interactive surface, found ${buttonCount} buttons`);
if (!html.includes('<main>')) failures.push(`${files.html} missing semantic main element`);
if (!html.includes('aria-live')) failures.push(`${files.html} missing aria-live region`);
if (!html.includes('promptExecuted: false')) failures.push(`${files.html} must keep promptExecuted false in generated metadata`);
if (!html.includes('providerCalled: false')) failures.push(`${files.html} must keep providerCalled false in generated metadata`);
if (!html.includes('credentialRead: false')) failures.push(`${files.html} must keep credentialRead false in generated metadata`);

if (failures.length) {
  console.error('SEIS Prompt Engine Studio demo validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('SEIS Prompt Engine Studio demo validation passed.');
console.log(`Checked ${files.html}, ${files.docs}; static buttons: ${buttonCount}.`);

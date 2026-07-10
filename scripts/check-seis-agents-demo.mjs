import { readFileSync } from 'node:fs';

const htmlPath = 'apps/web/seis-agents.html';
const docPath = 'docs/product/seis-agents-demo.md';
const html = readFileSync(htmlPath, 'utf8');
const doc = readFileSync(docPath, 'utf8');

const requiredHtml = [
  'SEIS Agents',
  'Agents with boundaries.',
  'data-seis-agents-demo="browser-local"',
  'seis.agents.demo.v1',
  'data-state="local-demo"',
  'data-state="mock"',
  'data-state="approval-needed"',
  'data-state="planned"',
  'Architect Agent',
  'Code Agent',
  'Design Agent',
  'Security Agent',
  'DevOps Agent',
  'Documentation Agent',
  'QA Agent',
  'Cloud Agent',
  'Automation Agent',
  'Clean-Room Agent',
  'PR Rescue Agent',
  'Allowed',
  'Forbidden',
  'Failure behavior',
  'Create local assignment',
  'Prepare handoff packet',
  'Request human approval',
  'localStorage',
  'prefers-reduced-motion',
  'No real tools are executed'
];
const requiredDocs = [
  'SEIS Agents Browser-Local Demo',
  '`apps/web/seis-agents.html`',
  '18 supervised SEIS agent roles',
  '`local-demo`',
  '`mock`',
  '`approval-needed`',
  '`planned`',
  '`blocked`',
  'does not execute tools',
  'node scripts/check-seis-agents-demo.mjs'
];
const forbiddenHtml = ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'child_process', 'exec(', 'spawn(', 'apiKey:', 'access_token:', 'BEGIN OPENSSH', 'PRIVATE KEY'];

const missingHtml = requiredHtml.filter((needle) => !html.includes(needle));
const missingDocs = requiredDocs.filter((needle) => !doc.includes(needle));
const forbiddenFound = forbiddenHtml.filter((needle) => html.includes(needle));

if (missingHtml.length || missingDocs.length || forbiddenFound.length) {
  console.error('SEIS Agents demo check failed.');
  if (missingHtml.length) console.error('Missing HTML markers:', missingHtml.join(', '));
  if (missingDocs.length) console.error('Missing doc markers:', missingDocs.join(', '));
  if (forbiddenFound.length) console.error('Forbidden HTML markers:', forbiddenFound.join(', '));
  process.exit(1);
}

console.log('SEIS Agents demo check passed.');

#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';

const requiredChecks = [
  [
    'ARCHITECTURE.md',
    [
      '# SEIS Architecture',
      'Agent Orchestration Layer',
      'Cloud and Environment Layer',
      'Security Layer',
      'Data Flow',
      'God Mode Operating Discipline',
    ],
  ],
  [
    'docs/governance/seis-god-mode-developer.md',
    [
      '# SEIS God Mode Developer',
      'Two-layer minimum',
      'No secrets, tokens, private keys',
      'npm run check:seis-god-mode-developer',
    ],
  ],
  [
    'docs/governance/seis-god-mode-run-state.md',
    [
      '# SEIS God Mode Run State',
      'Guarded development mode',
      'Dirty Tree Policy',
      'do not stage the entire tree',
    ],
  ],
  ['README.md', ['SEIS God Mode Developer', 'ARCHITECTURE.md', 'ROADMAP.md']],
  ['ROADMAP.md', ['God Mode Development Rule', 'Phase 1: Foundation']],
  ['CHANGELOG.md', ['God Mode governance lane']],
  ['package.json', ['"check:seis-god-mode-developer"']],
];

const failures = [];

for (const [file, tokens] of requiredChecks) {
  if (!existsSync(file)) {
    failures.push(`missing required file: ${file}`);
    continue;
  }

  const contents = readFileSync(file, 'utf8');
  for (const token of tokens) {
    if (!contents.includes(token)) {
      failures.push(`missing "${token}" in ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error('SEIS God Mode Developer check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS God Mode Developer check passed.');

#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const files = {
  requirements: 'REFERENCE_REQUIREMENTS.md',
  cleanBuild: 'SEIS_UNIVERSE_CLEAN_BUILD.md',
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token] of [
  [files.requirements, '# Reference Requirements'],
  [files.requirements, '## Clean-Room Boundary'],
  [files.requirements, '## Official-Documentation Priority'],
  [files.cleanBuild, '# SEIS Universe Clean Build'],
  [files.cleanBuild, '## Clean-Room Boundary'],
  [files.cleanBuild, '## Scope Recommendation'],
  [files.cleanBuild, '## Permission And Security Model'],
  [files.cleanBuild, '## SEIS Universe Language v0'],
  [files.cleanBuild, '## Model Research Program'],
  [files.cleanBuild, '## Data And Training Governance'],
  [files.cleanBuild, '## Evaluation Plan'],
  [files.cleanBuild, '## First Implementation Slice'],
  [files.cleanBuild, 'Official documentation governs framework, hardware, API, and infrastructure'],
]) {
  requireIncludes(file, token);
}

const cleanBuild = read(files.cleanBuild);
const restrictedSignals = [['', 'Users', ''].join('/'), 'Down' + 'loads', 'source-inspired'];

for (const signal of restrictedSignals) {
  if (cleanBuild.includes(signal)) {
    failures.push(`${files.cleanBuild} must not include restricted reference signal: ${signal}`);
  }
}

const requiredLanguageTerms = [
  'intent',
  'scope',
  'capability',
  'evidence',
  'decision',
  'risk',
  'gate',
  'model-family',
  'dataset-card',
  'model-card',
];

for (const term of requiredLanguageTerms) {
  requireIncludes(files.cleanBuild, `\`${term}\``);
}

if (failures.length > 0) {
  console.error('SEIS Universe clean build check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS Universe clean build check passed.');

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing file: ${relativePath}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
}

function requireIncludes(file, token) {
  const text = read(file);
  if (!text.includes(token)) {
    failures.push(`${file} must include ${token}`);
  }
}

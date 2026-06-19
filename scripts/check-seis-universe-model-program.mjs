#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const files = {
  cleanBuild: 'SEIS_UNIVERSE_CLEAN_BUILD.md',
  modelFamily: 'SEIS_UNIVERSE_MODEL_FAMILY.md',
  datasetCard: 'SEIS_UNIVERSE_DATASET_CARD_TEMPLATE.md',
  modelCard: 'SEIS_UNIVERSE_MODEL_CARD_TEMPLATE.md',
  evalPlan: 'SEIS_UNIVERSE_EVAL_PLAN.md',
  evalCriticDatasetCard: 'SEIS_UNIVERSE_EVAL_CRITIC_DATASET_CARD.md',
  evalCriticModelCard: 'SEIS_UNIVERSE_EVAL_CRITIC_MODEL_CARD.md',
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token] of [
  [files.cleanBuild, 'SEIS_UNIVERSE_MODEL_FAMILY.md'],
  [files.cleanBuild, 'SEIS_UNIVERSE_DATASET_CARD_TEMPLATE.md'],
  [files.cleanBuild, 'SEIS_UNIVERSE_MODEL_CARD_TEMPLATE.md'],
  [files.cleanBuild, 'SEIS_UNIVERSE_EVAL_PLAN.md'],
  [files.modelFamily, '# SEIS Universe Model Family'],
  [files.modelFamily, '## Clean-Room Rule'],
  [files.modelFamily, '## Family Map'],
  [files.modelFamily, '`seis-reasoner`'],
  [files.modelFamily, '`seis-permission-policy`'],
  [files.modelFamily, '`seis-memory-ranker`'],
  [files.modelFamily, '`seis-eval-critic`'],
  [files.modelFamily, '`seis-design-sense`'],
  [files.modelFamily, 'seis-eval-critic-seed-v0'],
  [files.modelFamily, '## Data Policy'],
  [files.modelFamily, '## Training Strategy'],
  [files.modelFamily, '## Evaluation Gates'],
  [files.datasetCard, '# SEIS Universe Dataset Card Template'],
  [files.datasetCard, '## Source And Rights'],
  [files.datasetCard, '## Risk Review'],
  [files.modelCard, '# SEIS Universe Model Card Template'],
  [files.modelCard, '## Training Summary'],
  [files.modelCard, '## Evaluation Summary'],
  [files.modelCard, '## Provenance'],
  [files.evalPlan, '# SEIS Universe Evaluation Plan'],
  [files.evalPlan, '## Evaluation Families'],
  [files.evalPlan, '## Release Gates'],
  [files.evalCriticDatasetCard, '# SEIS Universe Eval Critic Dataset Card'],
  [files.evalCriticDatasetCard, '`seis-eval-critic-seed-v0`'],
  [files.evalCriticModelCard, '# SEIS Universe Eval Critic Model Card'],
  [files.evalCriticModelCard, '`seis-eval-critic-seed-v0`'],
]) {
  requireIncludes(file, token);
}

for (const file of Object.values(files)) {
  requireNoRestrictedSignals(file);
}

if (failures.length > 0) {
  console.error('SEIS Universe model program check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS Universe model program check passed.');

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

function requireNoRestrictedSignals(file) {
  const text = read(file);
  const restrictedSignals = [
    ['', 'Users', ''].join('/'),
    'Down' + 'loads',
    'source-inspired',
    'training status: started',
  ];

  for (const signal of restrictedSignals) {
    if (text.includes(signal)) {
      failures.push(`${file} must not include restricted or premature signal: ${signal}`);
    }
  }
}

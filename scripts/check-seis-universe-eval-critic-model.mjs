#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildEvalCriticModelArtifact,
  loadEvalCriticDataset,
  runEvalCriticModelEval,
  trainEvalCriticModel,
} from '../packages/seis-ai/src/model/eval-critic-lab.mjs';

const root = process.cwd();
const failures = [];

const files = {
  family: 'SEIS_UNIVERSE_MODEL_FAMILY.md',
  datasetCard: 'SEIS_UNIVERSE_EVAL_CRITIC_DATASET_CARD.md',
  modelCard: 'SEIS_UNIVERSE_EVAL_CRITIC_MODEL_CARD.md',
  dataset: 'packages/seis-ai/data/eval-critic-seed-v0.json',
  source: 'packages/seis-ai/src/model/eval-critic-lab.mjs',
  artifact: 'packages/seis-ai/models/eval-critic-seed-v0.json',
  test: 'packages/seis-ai/test/eval-critic-lab.test.mjs',
  packageJson: 'package.json',
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token] of [
  [files.family, '`seis-eval-critic`'],
  [files.family, 'rubric-driven evaluator'],
  [files.family, 'seis-eval-critic-seed-v0'],
  [files.datasetCard, '# SEIS Universe Eval Critic Dataset Card'],
  [files.datasetCard, '`seis-eval-critic-seed-v0`'],
  [files.modelCard, '# SEIS Universe Eval Critic Model Card'],
  [files.modelCard, '`seis-eval-critic-seed-v0`'],
  [files.source, 'trainEvalCriticModel'],
  [files.source, 'buildEvalCriticModelArtifact'],
  [files.test, 'SEIS Universe eval critic learning lab'],
  [files.packageJson, '"check:seis-universe-eval-critic-model"'],
]) {
  requireIncludes(file, token);
}

const dataset = loadEvalCriticDataset(path.join(root, files.dataset));
const model = trainEvalCriticModel(dataset);
const evalCases = dataset.cases.filter(item => item.split === 'eval');
const report = runEvalCriticModelEval(model, evalCases);

if (!report.ok) {
  failures.push(`eval critic eval failed: ${JSON.stringify(report.failed)}`);
}

const expectedArtifact = JSON.stringify(buildEvalCriticModelArtifact(dataset), null, 2);
const actualArtifact = read(files.artifact).trim();
if (actualArtifact !== expectedArtifact) {
  failures.push('model artifact is stale; run npm run automation:seis-eval-critic-model');
}

for (const file of Object.values(files)) {
  requireNoRestrictedSignals(file);
  requireNoSecretAssignments(file);
}

if (failures.length > 0) {
  console.error('SEIS Universe eval critic model check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS Universe eval critic model check passed.');

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
    ['source', 'inspired'].join('-'),
  ];

  for (const signal of restrictedSignals) {
    if (text.includes(signal)) {
      failures.push(`${file} must not include restricted signal: ${signal}`);
    }
  }
}

function requireNoSecretAssignments(file) {
  const text = read(file);
  const blockedPatterns = [
    /(api[_-]?key|token|password|credential|secret)\s*[:=](?!>)/i,
    new RegExp(`BEGIN [A-Z ]*${'PRIVATE'} KEY`),
    /\b(sk-[A-Za-z0-9]{12,}|ghp_[A-Za-z0-9]{12,})\b/,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      failures.push(`${file} must not include secret-like assignment material`);
    }
  }
}

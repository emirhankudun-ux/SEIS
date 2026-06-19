#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildPermissionPolicyModelArtifact,
  loadPermissionPolicyDataset,
  runPermissionPolicyModelEval,
  trainPermissionPolicyModel,
} from '../packages/seis-ai/src/model/permission-policy-lab.mjs';

const root = process.cwd();
const failures = [];

const files = {
  family: 'SEIS_UNIVERSE_MODEL_FAMILY.md',
  datasetCard: 'SEIS_UNIVERSE_PERMISSION_POLICY_DATASET_CARD.md',
  modelCard: 'SEIS_UNIVERSE_PERMISSION_POLICY_MODEL_CARD.md',
  dataset: 'packages/seis-ai/data/permission-policy-seed.json',
  source: 'packages/seis-ai/src/model/permission-policy-lab.mjs',
  artifact: 'packages/seis-ai/models/permission-policy-seed-v0.json',
  test: 'packages/seis-ai/test/permission-policy-lab.test.mjs',
  packageJson: 'package.json',
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token] of [
  [files.family, '`seis-permission-policy`'],
  [files.family, 'learned seed active'],
  [files.datasetCard, 'packages/seis-ai/data/permission-policy-seed.json'],
  [files.modelCard, '`seis-permission-policy-learned-seed-v0`'],
  [files.dataset, '"sourceClass": "SEIS-owned synthetic examples"'],
  [files.source, 'trainPermissionPolicyModel'],
  [files.source, 'buildPermissionPolicyModelArtifact'],
  [files.artifact, '"artifactId": "seis-permission-policy-learned-seed-v0"'],
  [files.test, 'SEIS Universe permission policy learning lab'],
  [files.packageJson, '"check:seis-universe-model-lab"'],
]) {
  requireIncludes(file, token);
}

const dataset = loadPermissionPolicyDataset(path.join(root, files.dataset));
const model = trainPermissionPolicyModel(dataset);
const evalCases = dataset.cases.filter(item => item.split === 'eval');
const report = runPermissionPolicyModelEval(model, evalCases);

if (!report.ok) {
  failures.push(`model lab eval failed: ${JSON.stringify(report.failed)}`);
}

const expectedArtifact = JSON.stringify(buildPermissionPolicyModelArtifact(dataset), null, 2);
const actualArtifact = read(files.artifact).trim();
if (actualArtifact !== expectedArtifact) {
  failures.push('model artifact is stale; run npm run automation:seis-permission-policy-model');
}

for (const file of Object.values(files)) {
  requireNoRestrictedSignals(file);
  requireNoSecretAssignments(file);
}

if (failures.length > 0) {
  console.error('SEIS Universe model lab check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS Universe model lab check passed.');

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

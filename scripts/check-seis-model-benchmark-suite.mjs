#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelBenchmarkArtifact,
  validateSeisModelBenchmarkArtifact,
} from '../packages/seis-ai/src/model/model-benchmark-suite.mjs';

const root = process.cwd();
const artifactPath = path.join(root, 'packages/seis-ai/models/seis-model-benchmark-suite.json');
const failures = [];

if (!existsSync(artifactPath)) {
  failures.push('benchmark suite artifact missing; run npm run automation:seis-model-benchmark-suite');
} else {
  const current = JSON.parse(readFileSync(artifactPath, 'utf8'));
  const expected = buildSeisModelBenchmarkArtifact(root);
  const validation = validateSeisModelBenchmarkArtifact(current, root);

  failures.push(...validation.failures);

  if (JSON.stringify(current, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push('benchmark suite artifact is stale; run npm run automation:seis-model-benchmark-suite');
  }
}

if (failures.length > 0) {
  console.error('SEIS model benchmark suite check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));
console.log('SEIS model benchmark suite check passed.');
console.log(JSON.stringify({
  artifactId: artifact.artifactId,
  caseCount: artifact.totals.caseCount,
  modelCount: artifact.totals.modelCount,
  passed: artifact.totals.passed,
}, null, 2));

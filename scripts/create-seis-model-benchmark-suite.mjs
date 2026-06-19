#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelBenchmarkArtifact,
  validateSeisModelBenchmarkArtifact,
} from '../packages/seis-ai/src/model/model-benchmark-suite.mjs';

const root = process.cwd();
const artifactPath = path.join(root, 'packages/seis-ai/models/seis-model-benchmark-suite.json');
const artifact = buildSeisModelBenchmarkArtifact(root);
const validation = validateSeisModelBenchmarkArtifact(artifact, root);

if (!validation.ok) {
  console.error('SEIS model benchmark suite generation failed:');
  for (const failure of validation.failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`SEIS model benchmark suite written: ${path.relative(root, artifactPath)}`);

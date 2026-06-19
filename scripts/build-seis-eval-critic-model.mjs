#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildEvalCriticModelArtifact,
  loadEvalCriticDataset,
} from '../packages/seis-ai/src/model/eval-critic-lab.mjs';

const root = process.cwd();
const datasetPath = path.join(root, 'packages/seis-ai/data/eval-critic-seed-v0.json');
const artifactPath = path.join(root, 'packages/seis-ai/models/eval-critic-seed-v0.json');

const dataset = loadEvalCriticDataset(datasetPath);
const artifact = buildEvalCriticModelArtifact(dataset);

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`SEIS eval critic model artifact written: ${path.relative(root, artifactPath)}`);

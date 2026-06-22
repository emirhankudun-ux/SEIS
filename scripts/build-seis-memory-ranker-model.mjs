#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildMemoryRankerModelArtifact,
  loadMemoryRankerDataset,
} from '../packages/seis-ai/src/model/memory-ranker-lab.mjs';

const root = process.cwd();
const datasetPath = path.join(root, 'packages/seis-ai/data/memory-ranker-seed-v0.json');
const artifactPath = path.join(root, 'packages/seis-ai/models/memory-ranker-seed-v0.json');

const dataset = loadMemoryRankerDataset(datasetPath);
const artifact = buildMemoryRankerModelArtifact(dataset);

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`SEIS memory ranker model artifact written: ${path.relative(root, artifactPath)}`);

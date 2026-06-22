#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildAgentRouterModelArtifact,
  loadAgentRouterDataset,
} from '../packages/seis-ai/src/model/agent-router-lab.mjs';

const root = process.cwd();
const datasetPath = path.join(root, 'packages/seis-ai/data/agent-router-seed-v0.json');
const artifactPath = path.join(root, 'packages/seis-ai/models/agent-router-seed-v0.json');

const dataset = loadAgentRouterDataset(datasetPath);
const artifact = buildAgentRouterModelArtifact(dataset);

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`SEIS agent router model artifact written: ${path.relative(root, artifactPath)}`);

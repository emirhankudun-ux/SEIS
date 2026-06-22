#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildPermissionPolicyModelArtifact,
  loadPermissionPolicyDataset,
} from '../packages/seis-ai/src/model/permission-policy-lab.mjs';

const root = process.cwd();
const datasetPath = path.join(root, 'packages/seis-ai/data/permission-policy-seed.json');
const artifactPath = path.join(root, 'packages/seis-ai/models/permission-policy-seed-v0.json');

const dataset = loadPermissionPolicyDataset(datasetPath);
const artifact = buildPermissionPolicyModelArtifact(dataset);

mkdirSync(path.dirname(artifactPath), { recursive: true });
writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`SEIS permission policy model artifact written: ${path.relative(root, artifactPath)}`);

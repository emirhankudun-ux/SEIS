#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelFamilyRegistry,
  validateSeisModelFamilyRegistry,
} from '../packages/seis-ai/src/model/model-family-registry.mjs';

const root = process.cwd();
const registryPath = path.join(root, 'packages/seis-ai/models/seis-model-family-registry.json');
const registry = buildSeisModelFamilyRegistry(root);
const validation = validateSeisModelFamilyRegistry(registry, root);

if (!validation.ok) {
  console.error('SEIS model family registry generation failed:');
  for (const failure of validation.failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

mkdirSync(path.dirname(registryPath), { recursive: true });
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log(`SEIS model family registry written: ${path.relative(root, registryPath)}`);

#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelFamilyRegistry,
  validateSeisModelFamilyRegistry,
} from '../packages/seis-ai/src/model/model-family-registry.mjs';

const root = process.cwd();
const registryPath = path.join(root, 'packages/seis-ai/models/seis-model-family-registry.json');
const failures = [];

if (!existsSync(registryPath)) {
  failures.push('registry artifact missing; run npm run automation:seis-model-family-registry');
} else {
  const current = JSON.parse(readFileSync(registryPath, 'utf8'));
  const expected = buildSeisModelFamilyRegistry(root);
  const validation = validateSeisModelFamilyRegistry(current, root);

  failures.push(...validation.failures);

  if (JSON.stringify(current, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push('registry artifact is stale; run npm run automation:seis-model-family-registry');
  }
}

if (failures.length > 0) {
  console.error('SEIS model family registry check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
console.log('SEIS model family registry check passed.');
console.log(JSON.stringify({
  registryId: registry.registryId,
  modelCount: registry.totals.modelCount,
  families: registry.totals.families,
}, null, 2));

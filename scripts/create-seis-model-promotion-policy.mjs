#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelPromotionPolicy,
  validateSeisModelPromotionPolicy,
} from '../packages/seis-ai/src/model/model-promotion-policy.mjs';

const root = process.cwd();
const policyPath = path.join(root, 'packages/seis-ai/models/seis-model-promotion-policy.json');
const policy = buildSeisModelPromotionPolicy(root);
const validation = validateSeisModelPromotionPolicy(policy, root);

if (!validation.ok) {
  console.error('SEIS model promotion policy generation failed:');
  for (const failure of validation.failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

mkdirSync(path.dirname(policyPath), { recursive: true });
writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);

console.log(`SEIS model promotion policy written: ${path.relative(root, policyPath)}`);

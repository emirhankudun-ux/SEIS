#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelPromotionPolicy,
  validateSeisModelPromotionPolicy,
} from '../packages/seis-ai/src/model/model-promotion-policy.mjs';

const root = process.cwd();
const policyPath = path.join(root, 'packages/seis-ai/models/seis-model-promotion-policy.json');
const failures = [];

if (!existsSync(policyPath)) {
  failures.push('promotion policy artifact missing; run npm run automation:seis-model-promotion-policy');
} else {
  const current = JSON.parse(readFileSync(policyPath, 'utf8'));
  const expected = buildSeisModelPromotionPolicy(root);
  const validation = validateSeisModelPromotionPolicy(current, root);

  failures.push(...validation.failures);

  if (JSON.stringify(current, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push('promotion policy artifact is stale; run npm run automation:seis-model-promotion-policy');
  }
}

if (failures.length > 0) {
  console.error('SEIS model promotion policy check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
console.log('SEIS model promotion policy check passed.');
console.log(JSON.stringify({
  policyId: policy.policyId,
  modelCount: policy.totals.modelCount,
  labReadyCount: policy.totals.labReadyCount,
  runtimeAuthorityCount: policy.totals.runtimeAuthorityCount,
}, null, 2));

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  SEIS_MODEL_PROMOTION_POLICY_ID,
  buildSeisModelPromotionPolicy,
  validateSeisModelPromotionPolicy,
} from '../src/model/model-promotion-policy.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url));

describe('SEIS model promotion policy', () => {
  it('builds a deterministic promotion policy for the registered SEIS model family', () => {
    const policy = buildSeisModelPromotionPolicy(root);

    assert.equal(policy.policyId, SEIS_MODEL_PROMOTION_POLICY_ID);
    assert.equal(policy.policyType, 'seis-owned-local-model-promotion-policy');
    assert.equal(policy.appliesTo.registryId, 'seis-model-family-registry-v0');
    assert.equal(policy.models.length, 4);
  });

  it('keeps every seed model production-blocked until benchmark and runtime gates exist', () => {
    const policy = buildSeisModelPromotionPolicy(root);

    assert.equal(policy.totals.runtimeAuthorityCount, 0);
    assert.equal(policy.totals.productionBlockedCount, policy.totals.modelCount);

    for (const model of policy.models) {
      assert.equal(model.currentStage, 'seed-local-lab');
      assert.equal(model.runtimeAuthority, false);
      assert.equal(model.productionBlocked, true);
      assert.ok(model.blockedReasons.includes('independent-benchmark-suite'));
      assert.ok(model.blockedReasons.includes('runtime-observability-present'));
    }
  });

  it('separates lab readiness from benchmark promotion readiness', () => {
    const policy = buildSeisModelPromotionPolicy(root);

    assert.equal(policy.totals.labReadyCount, 4);
    assert.equal(policy.totals.benchmarkReadyCount, 0);
    assert.equal(policy.totals.statuses['needs-benchmark-expansion'], 4);
  });

  it('validates the promotion policy artifact contract', () => {
    const policy = buildSeisModelPromotionPolicy(root);
    const validation = validateSeisModelPromotionPolicy(policy, root);

    assert.equal(validation.ok, true);
    assert.deepEqual(validation.failures, []);
  });
});

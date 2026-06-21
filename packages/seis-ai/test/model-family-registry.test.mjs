import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  SEIS_MODEL_FAMILY_REGISTRY_ID,
  buildSeisModelFamilyRegistry,
  validateSeisModelFamilyRegistry,
} from '../src/model/model-family-registry.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url));

describe('SEIS model family registry', () => {
  it('summarizes every SEIS-owned local seed model', () => {
    const registry = buildSeisModelFamilyRegistry(root);

    assert.equal(registry.registryId, SEIS_MODEL_FAMILY_REGISTRY_ID);
    assert.equal(registry.registryType, 'seis-owned-local-ai-model-family');
    assert.deepEqual(registry.totals.families, [
      'seis-agent-router',
      'seis-eval-critic',
      'seis-memory-ranker',
      'seis-permission-policy',
    ]);
    assert.equal(registry.models.length, 4);
  });

  it('keeps the family clean-room, local, and non-production by default', () => {
    const registry = buildSeisModelFamilyRegistry(root);

    assert.equal(registry.lifecycle.deploymentMode, 'local-artifact-only');
    assert.equal(registry.lifecycle.productionUse, false);
    assert.match(registry.sourcePolicy.dataBasis, /SEIS-owned synthetic datasets/);
    assert.ok(registry.sourcePolicy.forbiddenMaterial.includes('private source archives'));
  });

  it('validates model artifacts, datasets, eval summaries, and evidence paths', () => {
    const registry = buildSeisModelFamilyRegistry(root);
    const validation = validateSeisModelFamilyRegistry(registry, root);

    assert.deepEqual(validation.failures, []);
    assert.equal(validation.ok, true);

    for (const model of registry.models) {
      assert.match(model.modelId, /^seis-/);
      assert.match(model.dataset.sourceClass, /SEIS-owned/);
      assert.equal(model.eval.eval.ok, true);
      assert.ok(model.evidence.registryTestPath.endsWith('model-family-registry.test.mjs'));
    }
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  buildPermissionPolicyModelArtifact,
  extractPermissionFeatures,
  loadPermissionPolicyDataset,
  predictPermissionPolicyAction,
  runPermissionPolicyModelEval,
  trainPermissionPolicyModel,
} from '../src/model/permission-policy-lab.mjs';

const datasetPath = fileURLToPath(new URL('../data/permission-policy-seed.json', import.meta.url));

describe('SEIS Universe permission policy learning lab', () => {
  it('loads the SEIS-owned dataset and trains a local model artifact', () => {
    const dataset = loadPermissionPolicyDataset(datasetPath);
    const artifact = buildPermissionPolicyModelArtifact(dataset);

    assert.equal(artifact.artifactId, 'seis-permission-policy-learned-seed-v0');
    assert.equal(artifact.model.datasetId, dataset.datasetId);
    assert.equal(artifact.eval.eval.ok, true);
    assert.equal(artifact.eval.eval.passed, artifact.eval.eval.total);
  });

  it('extracts stable text, capability, and flag features', () => {
    const features = extractPermissionFeatures({
      intent: 'Deploy release artifact',
      capabilities: ['deploy', 'network'],
      externalWrite: true,
    });

    assert.ok(features.includes('bias'));
    assert.ok(features.includes('text:deploy'));
    assert.ok(features.includes('capability:deploy'));
    assert.ok(features.includes('flag:external_write'));
  });

  it('keeps learned predictions behind the deterministic safety floor', () => {
    const dataset = loadPermissionPolicyDataset(datasetPath);
    const model = trainPermissionPolicyModel(dataset);
    const prediction = predictPermissionPolicyAction(model, {
      intent: 'Publish staging build',
      capabilities: ['deploy'],
      externalWrite: true,
    });

    assert.equal(prediction.decision, 'approval_required');
    assert.equal(prediction.safetyDecision, 'approval_required');
  });

  it('passes the eval split with the learned local model', () => {
    const dataset = loadPermissionPolicyDataset(datasetPath);
    const model = trainPermissionPolicyModel(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');
    const report = runPermissionPolicyModelEval(model, evalCases);

    assert.equal(report.ok, true);
    assert.equal(report.passed, evalCases.length);
    assert.deepEqual(report.failed, []);
  });
});

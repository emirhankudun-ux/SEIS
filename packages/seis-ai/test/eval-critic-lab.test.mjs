import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  buildEvalCriticModelArtifact,
  extractEvalCriticFeatures,
  loadEvalCriticDataset,
  predictEvalCriticReview,
  runEvalCriticModelEval,
  trainEvalCriticModel,
} from '../src/model/eval-critic-lab.mjs';

const datasetPath = fileURLToPath(new URL('../data/eval-critic-seed-v0.json', import.meta.url));

describe('SEIS Universe eval critic learning lab', () => {
  it('loads dataset and builds deterministic model artifact', () => {
    const dataset = loadEvalCriticDataset(datasetPath);
    const artifact = buildEvalCriticModelArtifact(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');

    assert.equal(artifact.artifactId, 'seis-eval-critic-seed-v0');
    assert.equal(artifact.model.modelFamily, 'seis-eval-critic');
    assert.equal(artifact.eval.eval.ok, true);
    assert.equal(artifact.eval.eval.total, evalCases.length);
  });

  it('extracts evidence, validation, release, approval, and raw-output risk features', () => {
    const features = extractEvalCriticFeatures({
      summary: 'Release claim with unsafe output',
      evidence: ['SEIS_UNIVERSE_MODEL_FAMILY.md'],
      sources: [],
      validation: [{ command: 'npm run check:seis-universe-model-lab', status: 'failed' }],
      rawOutput: 'credential marker in raw output',
      releaseClaim: true,
      highRisk: true,
      humanApproval: false,
    });

    assert.ok(features.includes('bias'));
    assert.ok(features.includes('flag:has_evidence'));
    assert.ok(features.includes('flag:missing_sources'));
    assert.ok(features.includes('flag:validation_failed'));
    assert.ok(features.includes('flag:release_claim'));
    assert.ok(features.includes('flag:missing_human_approval'));
    assert.ok(features.includes('flag:raw_secret_material'));
  });

  it('uses the safety floor to block unredacted credential output', () => {
    const dataset = loadEvalCriticDataset(datasetPath);
    const model = trainEvalCriticModel(dataset);
    const prediction = predictEvalCriticReview(model, {
      summary: 'Unsafe generated report',
      evidence: ['reports/seis-action-execution/latest.json'],
      sources: ['content/development/seis-action-execution-contract.json'],
      validation: [{ command: 'npm run check:seis-action-execution', status: 'failed' }],
      security: { redaction: 'failed' },
      rawOutput: 'credential marker appeared in raw output',
      highRisk: true,
      humanApproval: false,
    });

    assert.equal(prediction.decision, 'block');
    assert.equal(prediction.safetyDecision, 'block');
    assert.ok(prediction.reasons.includes('raw secret-like output detected'));
  });

  it('passes the eval split with the learned local model and safety floor', () => {
    const dataset = loadEvalCriticDataset(datasetPath);
    const model = trainEvalCriticModel(dataset);
    const evalCases = dataset.cases.filter(item => item.split === 'eval');
    const report = runEvalCriticModelEval(model, evalCases);

    assert.equal(report.ok, true);
    assert.equal(report.passed, evalCases.length);
    assert.deepEqual(report.failed, []);
  });
});

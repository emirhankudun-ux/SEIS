import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import {
  SEIS_MODEL_BENCHMARK_SUITE_ID,
  buildSeisModelBenchmarkArtifact,
  loadSeisModelBenchmarkSuite,
  validateSeisModelBenchmarkArtifact,
} from '../src/model/model-benchmark-suite.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url));
const datasetPath = fileURLToPath(new URL('../data/model-benchmark-suite-v0.json', import.meta.url));

describe('SEIS model benchmark suite', () => {
  it('loads a SEIS-owned held-out benchmark dataset', () => {
    const suite = loadSeisModelBenchmarkSuite(datasetPath);

    assert.equal(suite.datasetId, SEIS_MODEL_BENCHMARK_SUITE_ID);
    assert.match(suite.sourceClass, /SEIS-owned/);
    assert.match(suite.independence, /not used/);
    assert.equal(suite.minimumCasesPerModel, 5);
  });

  it('runs every registered seed model against the independent benchmark cases', () => {
    const artifact = buildSeisModelBenchmarkArtifact(root);

    assert.equal(artifact.artifactId, SEIS_MODEL_BENCHMARK_SUITE_ID);
    assert.equal(artifact.totals.modelCount, 4);
    assert.equal(artifact.totals.caseCount, 20);
    assert.equal(artifact.totals.ok, true);
    assert.equal(artifact.totals.failed, 0);
  });

  it('requires every model to meet the minimum benchmark case count', () => {
    const artifact = buildSeisModelBenchmarkArtifact(root);

    for (const model of artifact.models) {
      assert.equal(model.total, 5);
      assert.equal(model.passed, 5);
      assert.equal(model.meetsMinimumCases, true);
      assert.equal(model.ok, true);
    }
  });

  it('validates the benchmark artifact contract', () => {
    const artifact = buildSeisModelBenchmarkArtifact(root);
    const validation = validateSeisModelBenchmarkArtifact(artifact, root);

    assert.equal(validation.ok, true);
    assert.deepEqual(validation.failures, []);
  });
});

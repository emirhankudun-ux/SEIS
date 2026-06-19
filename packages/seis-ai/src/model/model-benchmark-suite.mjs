import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { predictAgentRoute } from './agent-router-lab.mjs';
import { predictEvalCriticReview } from './eval-critic-lab.mjs';
import { rankMemoryCandidates } from './memory-ranker-lab.mjs';
import { predictPermissionPolicyAction } from './permission-policy-lab.mjs';

export const SEIS_MODEL_BENCHMARK_SUITE_ID = 'seis-model-benchmark-suite-v0';

const MODEL_ARTIFACTS = Object.freeze({
  'permission-policy': 'packages/seis-ai/models/permission-policy-seed-v0.json',
  'memory-ranker': 'packages/seis-ai/models/memory-ranker-seed-v0.json',
  'eval-critic': 'packages/seis-ai/models/eval-critic-seed-v0.json',
  'agent-router': 'packages/seis-ai/models/agent-router-seed-v0.json',
});

export function loadSeisModelBenchmarkSuite(datasetPath) {
  const suite = JSON.parse(readFileSync(datasetPath, 'utf8'));
  validateSeisModelBenchmarkSuite(suite);
  return suite;
}

export function buildSeisModelBenchmarkArtifact(root = process.cwd()) {
  const datasetPath = path.join(root, 'packages/seis-ai/data/model-benchmark-suite-v0.json');
  const suite = loadSeisModelBenchmarkSuite(datasetPath);
  const models = loadModelArtifacts(root);
  const results = suite.cases.map(item => runBenchmarkCase(item, models));
  const modelSummaries = summarizeByModel(results, suite.minimumCasesPerModel);

  return {
    artifactId: SEIS_MODEL_BENCHMARK_SUITE_ID,
    artifactType: 'seis-owned-independent-model-benchmark-suite',
    version: suite.version,
    dataset: {
      datasetId: suite.datasetId,
      version: suite.version,
      sourceClass: suite.sourceClass,
      consent: suite.consent,
      independence: suite.independence,
      caseCount: suite.cases.length,
      minimumCasesPerModel: suite.minimumCasesPerModel,
    },
    models: modelSummaries,
    totals: {
      modelCount: modelSummaries.length,
      caseCount: results.length,
      passed: results.filter(item => item.ok).length,
      failed: results.filter(item => !item.ok).length,
      ok: results.every(item => item.ok) && modelSummaries.every(item => item.ok),
    },
    results,
  };
}

export function validateSeisModelBenchmarkArtifact(artifact, root = process.cwd()) {
  const failures = [];

  if (!artifact || typeof artifact !== 'object') {
    return { ok: false, failures: ['benchmark artifact must be a JSON object'] };
  }

  ensure(artifact.artifactId === SEIS_MODEL_BENCHMARK_SUITE_ID, 'benchmark artifact id mismatch', failures);
  ensure(artifact.artifactType === 'seis-owned-independent-model-benchmark-suite', 'benchmark artifact type mismatch', failures);
  ensure(artifact.dataset?.sourceClass?.includes('SEIS-owned'), 'benchmark source must be SEIS-owned', failures);
  ensure(normalizeConsent(artifact.dataset?.consent).includes('no-user-private-data'), 'benchmark consent must exclude user-private data', failures);
  ensure(artifact.dataset?.independence?.includes('not used'), 'benchmark independence statement required', failures);
  ensure(artifact.dataset?.minimumCasesPerModel >= 5, 'benchmark minimum cases per model must be at least 5', failures);
  ensure(Array.isArray(artifact.models) && artifact.models.length === Object.keys(MODEL_ARTIFACTS).length, 'benchmark must summarize all registered seed models', failures);
  ensure(Array.isArray(artifact.results) && artifact.results.length === artifact.dataset?.caseCount, 'benchmark result count mismatch', failures);
  ensure(artifact.totals?.ok === true, 'benchmark totals must pass', failures);
  ensure(artifact.totals?.failed === 0, 'benchmark must have no failed cases', failures);

  for (const model of artifact.models || []) {
    ensure(Object.hasOwn(MODEL_ARTIFACTS, model.id), `unexpected benchmark model id: ${model.id}`, failures);
    ensure(model.ok === true, `${model.id}: benchmark summary must pass`, failures);
    ensure(model.total >= artifact.dataset.minimumCasesPerModel, `${model.id}: benchmark case count below threshold`, failures);
    ensure(model.passed === model.total, `${model.id}: benchmark pass count mismatch`, failures);
    ensure(existsSync(path.join(root, model.artifactPath)), `${model.id}: model artifact evidence missing`, failures);
  }

  return { ok: failures.length === 0, failures };
}

function validateSeisModelBenchmarkSuite(suite) {
  if (!suite || typeof suite !== 'object') {
    throw new TypeError('benchmark suite must be an object');
  }
  if (suite.datasetId !== SEIS_MODEL_BENCHMARK_SUITE_ID) {
    throw new Error('unexpected benchmark suite dataset id');
  }
  if (!suite.sourceClass?.includes('SEIS-owned')) {
    throw new Error('benchmark suite must declare SEIS ownership');
  }
  if (!normalizeConsent(suite.consent).includes('no-user-private-data')) {
    throw new Error('benchmark suite must exclude user-private data');
  }
  if (!suite.independence?.includes('not used')) {
    throw new Error('benchmark suite must declare held-out independence');
  }
  if (!Number.isInteger(suite.minimumCasesPerModel) || suite.minimumCasesPerModel < 5) {
    throw new Error('benchmark suite must require at least five cases per model');
  }
  if (!Array.isArray(suite.cases) || suite.cases.length === 0) {
    throw new Error('benchmark suite must include cases');
  }

  const ids = new Set();
  const counts = Object.fromEntries(Object.keys(MODEL_ARTIFACTS).map(modelId => [modelId, 0]));

  for (const item of suite.cases) {
    if (!item.id || ids.has(item.id)) {
      throw new Error(`invalid or duplicate benchmark case id: ${item.id}`);
    }
    ids.add(item.id);

    if (!Object.hasOwn(MODEL_ARTIFACTS, item.model)) {
      throw new Error(`unsupported benchmark model id: ${item.model}`);
    }
    counts[item.model] += 1;
    validateBenchmarkCasePayload(item);
  }

  for (const [modelId, count] of Object.entries(counts)) {
    if (count < suite.minimumCasesPerModel) {
      throw new Error(`benchmark suite has too few cases for ${modelId}`);
    }
  }
}

function validateBenchmarkCasePayload(item) {
  if (item.model === 'permission-policy' && (!item.action || !item.expected?.decision)) {
    throw new Error(`invalid permission benchmark case: ${item.id}`);
  }
  if (item.model === 'memory-ranker' && (!item.query || !Array.isArray(item.candidates) || !item.expected?.topCandidateId)) {
    throw new Error(`invalid memory benchmark case: ${item.id}`);
  }
  if (item.model === 'eval-critic' && (!item.review || !item.expected?.decision)) {
    throw new Error(`invalid critic benchmark case: ${item.id}`);
  }
  if (item.model === 'agent-router' && (!item.task || !item.expected?.laneId)) {
    throw new Error(`invalid router benchmark case: ${item.id}`);
  }
}

function loadModelArtifacts(root) {
  return Object.fromEntries(
    Object.entries(MODEL_ARTIFACTS).map(([id, artifactPath]) => {
      const artifact = JSON.parse(readFileSync(path.join(root, artifactPath), 'utf8'));
      return [id, { artifactPath, artifact, model: artifact.model }];
    }),
  );
}

function runBenchmarkCase(item, models) {
  if (item.model === 'permission-policy') {
    const prediction = predictPermissionPolicyAction(models[item.model].model, item.action);
    return buildResult(item, item.expected.decision, prediction.decision, {
      learnedDecision: prediction.learnedDecision,
      safetyDecision: prediction.safetyDecision,
      safetyAdjusted: prediction.safetyAdjusted,
    });
  }

  if (item.model === 'memory-ranker') {
    const prediction = rankMemoryCandidates(models[item.model].model, item.query, item.candidates, { topK: 3 });
    return buildResult(item, item.expected.topCandidateId, prediction.ranking[0]?.candidateId || null, {
      topKPredicted: prediction.ranking.map(candidate => candidate.candidateId),
      queryTerms: prediction.queryTerms,
    });
  }

  if (item.model === 'eval-critic') {
    const prediction = predictEvalCriticReview(models[item.model].model, item.review);
    return buildResult(item, item.expected.decision, prediction.decision, {
      learnedDecision: prediction.learnedDecision,
      safetyDecision: prediction.safetyDecision,
      safetyAdjusted: prediction.safetyAdjusted,
      reasons: prediction.reasons,
    });
  }

  if (item.model === 'agent-router') {
    const prediction = predictAgentRoute(models[item.model].model, item.task);
    return buildResult(item, item.expected.laneId, prediction.laneId, {
      learnedLaneId: prediction.learnedLaneId,
      safetyLaneId: prediction.safetyLaneId,
      safetyAdjusted: prediction.safetyAdjusted,
      defaultGate: prediction.defaultGate,
    });
  }

  throw new Error(`unsupported benchmark model: ${item.model}`);
}

function buildResult(item, expected, actual, details) {
  return {
    id: item.id,
    model: item.model,
    expected,
    actual,
    ok: expected === actual,
    details,
  };
}

function summarizeByModel(results, minimumCasesPerModel) {
  return Object.entries(MODEL_ARTIFACTS).map(([id, artifactPath]) => {
    const modelResults = results.filter(item => item.model === id);
    const passed = modelResults.filter(item => item.ok).length;

    return {
      id,
      artifactPath,
      total: modelResults.length,
      passed,
      failed: modelResults.length - passed,
      accuracy: modelResults.length === 0 ? 0 : Number((passed / modelResults.length).toFixed(6)),
      meetsMinimumCases: modelResults.length >= minimumCasesPerModel,
      ok: modelResults.length >= minimumCasesPerModel && passed === modelResults.length,
    };
  });
}

function normalizeConsent(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function ensure(condition, message, failures) {
  if (!condition) {
    failures.push(message);
  }
}

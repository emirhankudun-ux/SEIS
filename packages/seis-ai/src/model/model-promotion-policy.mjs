import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  buildSeisModelFamilyRegistry,
  validateSeisModelFamilyRegistry,
} from './model-family-registry.mjs';
import { validateSeisModelBenchmarkArtifact } from './model-benchmark-suite.mjs';

export const SEIS_MODEL_PROMOTION_POLICY_ID = 'seis-model-promotion-policy-v0';

const MIN_BENCHMARK_EVAL_CASES = 5;
const BENCHMARK_ARTIFACT_PATH = 'packages/seis-ai/models/seis-model-benchmark-suite.json';

export function buildSeisModelPromotionPolicy(root = process.cwd()) {
  const registry = buildSeisModelFamilyRegistry(root);
  const registryValidation = validateSeisModelFamilyRegistry(registry, root);
  const benchmarkArtifact = loadBenchmarkArtifact(root);
  const benchmarkValidation = benchmarkArtifact
    ? validateSeisModelBenchmarkArtifact(benchmarkArtifact, root)
    : { ok: false, failures: ['benchmark artifact missing'] };
  const models = registry.models.map(model => evaluateModelPromotion(root, model, benchmarkArtifact));

  return {
    policyId: SEIS_MODEL_PROMOTION_POLICY_ID,
    policyType: 'seis-owned-local-model-promotion-policy',
    version: '0.1.0',
    appliesTo: {
      registryId: registry.registryId,
      registryVersion: registry.version,
      registryType: registry.registryType,
    },
    authority: {
      modelDirection: 'SEIS-owned model requirements and evaluation results',
      implementationBasis: 'SEIS-owned artifacts, local deterministic tests, and first-principles policy rules',
      dataBasis: 'SEIS-owned synthetic datasets until a documented higher-provenance corpus is approved',
    },
    stagePolicy: [
      {
        stage: 'seed-local-lab',
        runtimeAuthority: false,
        requiredGates: [
          'registry-valid',
          'dataset-provenance-present',
          'private-user-data-excluded',
          'eval-split-passes',
          'specialized-test-present',
        ],
      },
      {
        stage: 'benchmark-expansion',
        runtimeAuthority: false,
        requiredGates: [
          'minimum-eval-case-count',
          'independent-benchmark-suite',
          'failure-analysis-recorded',
          'regression-thresholds-declared',
        ],
      },
      {
        stage: 'runtime-candidate',
        runtimeAuthority: false,
        requiredGates: [
          'policy-owner-approval',
          'security-review-pass',
          'rollback-plan-present',
          'runtime-observability-present',
        ],
      },
    ],
    totals: summarizePromotionTotals(models),
    registryValidation: {
      ok: registryValidation.ok,
      failures: registryValidation.failures,
    },
    benchmarkValidation: {
      ok: benchmarkValidation.ok,
      failures: benchmarkValidation.failures,
    },
    models,
  };
}

export function validateSeisModelPromotionPolicy(policy, root = process.cwd()) {
  const failures = [];

  if (!policy || typeof policy !== 'object') {
    return { ok: false, failures: ['promotion policy must be a JSON object'] };
  }

  ensure(policy.policyId === SEIS_MODEL_PROMOTION_POLICY_ID, 'promotion policy id mismatch', failures);
  ensure(policy.policyType === 'seis-owned-local-model-promotion-policy', 'promotion policy type mismatch', failures);
  ensure(policy.appliesTo?.registryId === 'seis-model-family-registry-v0', 'promotion policy registry id mismatch', failures);
  ensure(policy.authority?.modelDirection?.includes('SEIS-owned'), 'promotion policy must declare SEIS-owned model direction', failures);
  ensure(policy.registryValidation?.ok === true, 'promotion policy requires a valid model family registry', failures);
  ensure(policy.benchmarkValidation?.ok === true, 'promotion policy requires a valid benchmark suite artifact', failures);
  ensure(Array.isArray(policy.stagePolicy) && policy.stagePolicy.length === 3, 'promotion policy must declare three stages', failures);
  ensure(Array.isArray(policy.models) && policy.models.length > 0, 'promotion policy must include model decisions', failures);

  for (const model of policy.models || []) {
    validatePromotionDecision(model, root, failures);
  }

  ensure(policy.totals?.modelCount === policy.models?.length, 'promotion policy model count mismatch', failures);
  ensure(policy.totals?.runtimeAuthorityCount === 0, 'seed policy must not grant runtime authority', failures);
  ensure(policy.totals?.productionBlockedCount === policy.models?.length, 'all seed models must remain production-blocked', failures);
  ensure(policy.totals?.benchmarkReadyCount <= policy.totals?.labReadyCount, 'benchmark-ready count cannot exceed lab-ready count', failures);

  return { ok: failures.length === 0, failures };
}

function evaluateModelPromotion(root, model, benchmarkArtifact) {
  const benchmark = benchmarkArtifact?.models?.find(item => item.id === model.id) || null;
  const benchmarkArtifactOk = benchmarkArtifact?.totals?.ok === true;

  const gates = [
    makeGate('registry-valid', true, 'model is included in a validated SEIS model family registry'),
    makeGate(
      'dataset-provenance-present',
      model.dataset?.sourceClass?.toLowerCase().includes('seis-owned'),
      'dataset source class declares SEIS ownership',
    ),
    makeGate(
      'private-user-data-excluded',
      normalizeConsent(model.dataset?.consent).includes('no-user-private-data'),
      'dataset consent excludes user-private data',
    ),
    makeGate(
      'eval-split-passes',
      model.eval?.eval?.ok === true,
      'held-out eval split passes for the seed local experiment',
    ),
    makeGate(
      'specialized-test-present',
      Boolean(model.evidence?.specializedTestPath) && existsSync(path.join(root, model.evidence.specializedTestPath)),
      'model has a focused local test suite',
      model.evidence?.specializedTestPath,
    ),
    makeGate(
      'minimum-eval-case-count',
      Number(benchmark?.total || 0) >= MIN_BENCHMARK_EVAL_CASES,
      `independent benchmark has at least ${MIN_BENCHMARK_EVAL_CASES} cases`,
      BENCHMARK_ARTIFACT_PATH,
    ),
    makeGate(
      'independent-benchmark-suite',
      benchmarkArtifactOk && benchmark?.ok === true,
      'independent benchmark suite passes for this model',
      BENCHMARK_ARTIFACT_PATH,
    ),
    makeGate(
      'runtime-observability-present',
      false,
      'runtime traces, drift signals, and rollback telemetry are not yet attached',
    ),
  ];

  const labGateIds = new Set([
    'registry-valid',
    'dataset-provenance-present',
    'private-user-data-excluded',
    'eval-split-passes',
    'specialized-test-present',
  ]);
  const benchmarkGateIds = new Set([
    'minimum-eval-case-count',
    'independent-benchmark-suite',
  ]);

  const labReady = gates.filter(gate => labGateIds.has(gate.id)).every(gate => gate.passed);
  const benchmarkReady = labReady && gates.filter(gate => benchmarkGateIds.has(gate.id)).every(gate => gate.passed);
  const blockedReasons = gates.filter(gate => !gate.passed).map(gate => gate.id);

  return {
    id: model.id,
    modelId: model.modelId,
    modelFamily: model.modelFamily,
    role: model.role,
    currentStage: 'seed-local-lab',
    nextStage: benchmarkReady ? 'runtime-candidate' : 'benchmark-expansion',
    labReady,
    benchmarkReady,
    runtimeAuthority: false,
    productionBlocked: true,
    promotionStatus: benchmarkReady ? 'benchmark-ready-no-runtime-authority' : 'needs-benchmark-expansion',
    blockedReasons,
    metrics: {
      trainingCaseCount: model.trainingCaseCount,
      evalCaseCount: model.eval?.eval?.total || 0,
      evalPassed: model.eval?.eval?.passed || 0,
      trainMetricCount: model.eval?.train?.total || 0,
      benchmarkCaseCount: benchmark?.total || 0,
      benchmarkPassed: benchmark?.passed || 0,
    },
    gates,
  };
}

function validatePromotionDecision(model, root, failures) {
  ensure(typeof model.id === 'string' && model.id.length > 0, 'promotion model id required', failures);
  ensure(typeof model.modelId === 'string' && model.modelId.startsWith('seis-'), `${model.id}: modelId must be SEIS-owned`, failures);
  ensure(model.currentStage === 'seed-local-lab', `${model.id}: current stage must remain seed-local-lab`, failures);
  ensure(['benchmark-expansion', 'runtime-candidate'].includes(model.nextStage), `${model.id}: invalid next stage`, failures);
  ensure(model.runtimeAuthority === false, `${model.id}: runtime authority must be false`, failures);
  ensure(model.productionBlocked === true, `${model.id}: production must remain blocked`, failures);
  ensure(Array.isArray(model.gates) && model.gates.length >= 8, `${model.id}: promotion gates missing`, failures);
  ensure(model.gates.some(gate => gate.id === 'independent-benchmark-suite'), `${model.id}: independent benchmark gate must remain explicit`, failures);
  ensure(model.gates.some(gate => gate.id === 'runtime-observability-present' && gate.passed === false), `${model.id}: runtime observability gate must remain explicit`, failures);
  ensure(model.metrics?.evalCaseCount > 0, `${model.id}: eval metrics required`, failures);
  ensure(model.metrics?.benchmarkCaseCount >= MIN_BENCHMARK_EVAL_CASES, `${model.id}: benchmark metrics required`, failures);

  const specializedTestGate = model.gates.find(gate => gate.id === 'specialized-test-present');
  ensure(Boolean(specializedTestGate), `${model.id}: specialized test gate required`, failures);
  if (specializedTestGate?.evidencePath) {
    ensure(existsSync(path.join(root, specializedTestGate.evidencePath)), `${model.id}: specialized test evidence missing`, failures);
  }
}

function loadBenchmarkArtifact(root) {
  const artifactPath = path.join(root, BENCHMARK_ARTIFACT_PATH);
  if (!existsSync(artifactPath)) {
    return null;
  }
  return JSON.parse(readFileSync(artifactPath, 'utf8'));
}

function summarizePromotionTotals(models) {
  return {
    modelCount: models.length,
    labReadyCount: models.filter(model => model.labReady).length,
    benchmarkReadyCount: models.filter(model => model.benchmarkReady).length,
    runtimeAuthorityCount: models.filter(model => model.runtimeAuthority).length,
    productionBlockedCount: models.filter(model => model.productionBlocked).length,
    statuses: Object.fromEntries(
      [...new Set(models.map(model => model.promotionStatus))]
        .sort()
        .map(status => [status, models.filter(model => model.promotionStatus === status).length]),
    ),
  };
}

function makeGate(id, passed, rationale, evidencePath = undefined) {
  const gate = {
    id,
    passed: Boolean(passed),
    rationale,
  };

  if (evidencePath) {
    gate.evidencePath = evidencePath;
  }

  return gate;
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

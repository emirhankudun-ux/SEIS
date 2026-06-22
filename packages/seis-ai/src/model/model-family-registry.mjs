import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const SEIS_MODEL_FAMILY_REGISTRY_ID = 'seis-model-family-registry-v0';

export const SEIS_MODEL_FAMILY_ENTRIES = Object.freeze([
  {
    id: 'permission-policy',
    role: 'permission_decision',
    artifactPath: 'packages/seis-ai/models/permission-policy-seed-v0.json',
    datasetPath: 'packages/seis-ai/data/permission-policy-seed.json',
    buildScript: 'scripts/build-seis-permission-policy-model.mjs',
    specializedTestPath: 'packages/seis-ai/test/permission-policy-lab.test.mjs',
    capability: 'bounded local permission decisions',
  },
  {
    id: 'memory-ranker',
    role: 'memory_retrieval',
    artifactPath: 'packages/seis-ai/models/memory-ranker-seed-v0.json',
    datasetPath: 'packages/seis-ai/data/memory-ranker-seed-v0.json',
    buildScript: 'scripts/build-seis-memory-ranker-model.mjs',
    specializedTestPath: 'packages/seis-ai/test/memory-ranker-lab.test.mjs',
    capability: 'local governance and evidence retrieval ranking',
  },
  {
    id: 'eval-critic',
    role: 'evaluation_advisory',
    artifactPath: 'packages/seis-ai/models/eval-critic-seed-v0.json',
    datasetPath: 'packages/seis-ai/data/eval-critic-seed-v0.json',
    buildScript: 'scripts/build-seis-eval-critic-model.mjs',
    specializedTestPath: 'packages/seis-ai/test/eval-critic-lab.test.mjs',
    capability: 'local report and release risk critique',
  },
  {
    id: 'agent-router',
    role: 'agent_lane_routing',
    artifactPath: 'packages/seis-ai/models/agent-router-seed-v0.json',
    datasetPath: 'packages/seis-ai/data/agent-router-seed-v0.json',
    buildScript: 'scripts/build-seis-agent-router-model.mjs',
    specializedTestPath: 'packages/seis-ai/test/agent-router-lab.test.mjs',
    capability: 'local specialist lane and gate routing',
  },
]);

export function buildSeisModelFamilyRegistry(root = process.cwd()) {
  const models = SEIS_MODEL_FAMILY_ENTRIES.map(entry => summarizeModelEntry(root, entry));
  const families = [...new Set(models.map(model => model.modelFamily))].sort();
  const datasets = [...new Set(models.map(model => model.dataset.datasetId))].sort();

  return {
    registryId: SEIS_MODEL_FAMILY_REGISTRY_ID,
    registryType: 'seis-owned-local-ai-model-family',
    version: '0.1.0',
    sourcePolicy: {
      implementationBasis: 'SEIS-owned artifacts and first-principles local experiments',
      dataBasis: 'SEIS-owned synthetic datasets with documented consent and provenance',
      forbiddenMaterial: [
        'private source archives',
        'unlicensed implementation material',
        'copied or reconstructed private source behavior',
      ],
    },
    lifecycle: {
      stage: 'seed-local-lab',
      deploymentMode: 'local-artifact-only',
      productionUse: false,
      nextGate: 'independent benchmark expansion before runtime authority',
    },
    qualityGates: [
      'dataset provenance present',
      'model artifact present',
      'train split metrics present',
      'eval split passes',
      'registry artifact deterministic',
      'registry test covers all registered models',
    ],
    totals: {
      modelCount: models.length,
      familyCount: families.length,
      datasetCount: datasets.length,
      families,
      datasets,
    },
    models,
  };
}

export function validateSeisModelFamilyRegistry(registry, root = process.cwd()) {
  const failures = [];

  if (!registry || typeof registry !== 'object') {
    return { ok: false, failures: ['registry must be a JSON object'] };
  }

  ensure(registry.registryId === SEIS_MODEL_FAMILY_REGISTRY_ID, 'registry id mismatch', failures);
  ensure(registry.registryType === 'seis-owned-local-ai-model-family', 'registry type mismatch', failures);
  ensure(Array.isArray(registry.models), 'registry models must be an array', failures);
  ensure(registry.models?.length === SEIS_MODEL_FAMILY_ENTRIES.length, 'registry model count mismatch', failures);
  ensure(registry.sourcePolicy?.dataBasis?.includes('SEIS-owned'), 'registry must declare SEIS-owned data basis', failures);
  ensure(registry.lifecycle?.deploymentMode === 'local-artifact-only', 'registry must stay local-artifact-only at this stage', failures);

  const expectedIds = new Set(SEIS_MODEL_FAMILY_ENTRIES.map(entry => entry.id));
  const seenIds = new Set();

  for (const model of registry.models || []) {
    validateRegisteredModel(model, root, expectedIds, seenIds, failures);
  }

  for (const entry of SEIS_MODEL_FAMILY_ENTRIES) {
    ensure(seenIds.has(entry.id), `missing registry model: ${entry.id}`, failures);
  }

  ensure(registry.totals?.modelCount === SEIS_MODEL_FAMILY_ENTRIES.length, 'total model count mismatch', failures);
  ensure(Array.isArray(registry.qualityGates) && registry.qualityGates.length >= 5, 'quality gates must be present', failures);

  return { ok: failures.length === 0, failures };
}

function summarizeModelEntry(root, entry) {
  const artifact = readJson(root, entry.artifactPath);
  const dataset = readJson(root, entry.datasetPath);
  const model = artifact.model || {};
  const evalSummary = artifact.eval || {};
  const registryTestPath = 'packages/seis-ai/test/model-family-registry.test.mjs';

  return {
    id: entry.id,
    role: entry.role,
    capability: entry.capability,
    modelId: model.modelId || artifact.artifactId,
    modelFamily: model.modelFamily,
    artifactId: artifact.artifactId,
    artifactType: artifact.artifactType,
    version: model.version || dataset.version,
    trainingCaseCount: model.trainingCaseCount,
    dataset: {
      datasetId: dataset.datasetId,
      version: dataset.version,
      sourceClass: dataset.sourceClass,
      consent: dataset.consent,
      caseCount: Array.isArray(dataset.cases) ? dataset.cases.length : 0,
    },
    eval: {
      train: summarizeEval(evalSummary.train),
      eval: summarizeEval(evalSummary.eval),
    },
    evidence: {
      datasetPath: entry.datasetPath,
      artifactPath: entry.artifactPath,
      buildScript: entry.buildScript,
      registryTestPath,
      specializedTestPath: existsSync(path.join(root, entry.specializedTestPath))
        ? entry.specializedTestPath
        : null,
    },
  };
}

function validateRegisteredModel(model, root, expectedIds, seenIds, failures) {
  ensure(expectedIds.has(model.id), `unexpected model id: ${model.id}`, failures);
  seenIds.add(model.id);
  ensure(typeof model.modelId === 'string' && model.modelId.startsWith('seis-'), `${model.id}: modelId must be SEIS-owned`, failures);
  ensure(typeof model.modelFamily === 'string' && model.modelFamily.startsWith('seis-'), `${model.id}: modelFamily must be SEIS-owned`, failures);
  ensure(typeof model.artifactId === 'string' && model.artifactId.startsWith('seis-'), `${model.id}: artifactId must be SEIS-owned`, failures);
  ensure(model.artifactType?.includes('seis-owned'), `${model.id}: artifact type must declare SEIS ownership`, failures);
  ensure(model.dataset?.sourceClass?.toLowerCase().includes('seis-owned'), `${model.id}: dataset source must be SEIS-owned`, failures);
  ensure(normalizeConsent(model.dataset?.consent).includes('no-user-private-data'), `${model.id}: dataset consent must exclude user-private data`, failures);
  ensure(model.dataset?.caseCount > 0, `${model.id}: dataset must include cases`, failures);
  ensure(model.trainingCaseCount > 0, `${model.id}: model must include training cases`, failures);
  ensure(model.eval?.train?.total > 0, `${model.id}: train eval metrics must be present`, failures);
  ensure(model.eval?.eval?.ok === true, `${model.id}: eval split must pass`, failures);
  ensureExists(root, model.evidence?.datasetPath, `${model.id}: dataset evidence missing`, failures);
  ensureExists(root, model.evidence?.artifactPath, `${model.id}: artifact evidence missing`, failures);
  ensureExists(root, model.evidence?.buildScript, `${model.id}: build script evidence missing`, failures);
  ensureExists(root, model.evidence?.registryTestPath, `${model.id}: registry test evidence missing`, failures);
}

function summarizeEval(summary = {}) {
  const passed = summary.passed ?? summary.passedTop1 ?? 0;

  return {
    ok: Boolean(summary.ok),
    total: Number(summary.total || 0),
    passed: Number(passed),
    failed: Array.isArray(summary.failed) ? summary.failed.length : Number(summary.failed || 0),
    learnedPassed: typeof summary.learnedPassed === 'number' ? summary.learnedPassed : undefined,
    safetyAdjusted: typeof summary.safetyAdjusted === 'number' ? summary.safetyAdjusted : undefined,
  };
}

function normalizeConsent(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function ensureExists(root, relativePath, message, failures) {
  ensure(Boolean(relativePath) && existsSync(path.join(root, relativePath)), message, failures);
}

function ensure(condition, message, failures) {
  if (!condition) {
    failures.push(message);
  }
}

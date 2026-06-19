import { readFileSync } from 'node:fs';

import { classifyPermissionAction, PERMISSION_DECISIONS } from './permission-policy.mjs';

const DECISION_RISK = Object.freeze({
  [PERMISSION_DECISIONS.allow]: 0,
  [PERMISSION_DECISIONS.gate]: 1,
  [PERMISSION_DECISIONS.approvalRequired]: 2,
  [PERMISSION_DECISIONS.deny]: 3,
});

const DECISIONS = Object.freeze(Object.keys(DECISION_RISK));

export function loadPermissionPolicyDataset(datasetPath) {
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
  validateDataset(dataset);
  return dataset;
}

export function trainPermissionPolicyModel(dataset) {
  validateDataset(dataset);

  const trainCases = dataset.cases.filter(item => item.split === 'train');
  const labels = [...new Set([...DECISIONS, ...trainCases.map(item => item.expected)])].sort();
  const labelCounts = Object.fromEntries(labels.map(label => [label, 0]));
  const featureCounts = Object.fromEntries(labels.map(label => [label, new Map()]));
  const vocabulary = new Set();

  for (const item of trainCases) {
    labelCounts[item.expected] += 1;
    for (const feature of extractPermissionFeatures(item.action)) {
      vocabulary.add(feature);
      featureCounts[item.expected].set(
        feature,
        (featureCounts[item.expected].get(feature) || 0) + 1,
      );
    }
  }

  const totalTrain = trainCases.length;
  const priors = Object.fromEntries(
    labels.map(label => [label, Math.log((labelCounts[label] + 1) / (totalTrain + labels.length))]),
  );

  const classFeatureWeights = Object.fromEntries(
    labels.map(label => [
      label,
      Object.fromEntries(
        [...featureCounts[label].entries()].sort(([left], [right]) => left.localeCompare(right)),
      ),
    ]),
  );

  return {
    modelId: 'seis-permission-policy-learned-seed-v0',
    modelFamily: 'seis-permission-policy',
    version: dataset.version,
    datasetId: dataset.datasetId,
    trainingCaseCount: totalTrain,
    labels,
    priors,
    features: [...vocabulary].sort(),
    classFeatureWeights,
    safetyFloor: 'deterministic-permission-policy',
  };
}

export function extractPermissionFeatures(action = {}) {
  const text = [
    action.intent,
    action.command,
    action.path,
    action.summary,
    ...(Array.isArray(action.evidence) ? action.evidence : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const textFeatures = (text.match(/[a-z0-9_-]{2,}/g) || []).map(term => `text:${term}`);
  const capabilityFeatures = (action.capabilities || []).map(
    item => `capability:${String(item).toLowerCase()}`,
  );
  const flagFeatures = action.externalWrite ? ['flag:external_write'] : [];

  return [...new Set(['bias', ...textFeatures, ...capabilityFeatures, ...flagFeatures])].sort();
}

export function predictPermissionPolicyAction(model, action, options = {}) {
  const enforceSafetyFloor = options.enforceSafetyFloor !== false;
  const features = extractPermissionFeatures(action);
  const scores = scorePermissionAction(model, features);
  const learnedDecision = maxScoreDecision(scores);
  const safetyDecision = classifyPermissionAction(action).decision;
  const decision = enforceSafetyFloor
    ? higherRiskDecision(learnedDecision, safetyDecision)
    : learnedDecision;

  return {
    decision,
    learnedDecision,
    safetyDecision,
    safetyAdjusted: decision !== learnedDecision,
    scores,
    features,
  };
}

export function runPermissionPolicyModelEval(model, cases, options = {}) {
  const results = cases.map(item => {
    const prediction = predictPermissionPolicyAction(model, item.action, options);
    return {
      id: item.id,
      split: item.split,
      expected: item.expected,
      actual: prediction.decision,
      learnedDecision: prediction.learnedDecision,
      safetyDecision: prediction.safetyDecision,
      ok: prediction.decision === item.expected,
      learnedOk: prediction.learnedDecision === item.expected,
      safetyAdjusted: prediction.safetyAdjusted,
    };
  });

  return {
    ok: results.every(item => item.ok),
    total: results.length,
    passed: results.filter(item => item.ok).length,
    learnedPassed: results.filter(item => item.learnedOk).length,
    safetyAdjusted: results.filter(item => item.safetyAdjusted).length,
    failed: results.filter(item => !item.ok),
    results,
  };
}

export function buildPermissionPolicyModelArtifact(dataset) {
  const model = trainPermissionPolicyModel(dataset);
  const evalCases = dataset.cases.filter(item => item.split === 'eval');
  const trainCases = dataset.cases.filter(item => item.split === 'train');

  return {
    artifactId: 'seis-permission-policy-learned-seed-v0',
    artifactType: 'seis-owned-local-model-experiment',
    dataset: {
      datasetId: dataset.datasetId,
      version: dataset.version,
      sourceClass: dataset.sourceClass,
      consent: dataset.consent,
    },
    model,
    eval: {
      train: summarizeEval(runPermissionPolicyModelEval(model, trainCases)),
      eval: summarizeEval(runPermissionPolicyModelEval(model, evalCases)),
    },
  };
}

function scorePermissionAction(model, features) {
  return Object.fromEntries(
    model.labels.map(label => {
      const weights = model.classFeatureWeights[label] || {};
      const score = features.reduce(
        (sum, feature) => sum + (weights[feature] || 0),
        model.priors[label] || 0,
      );
      return [label, score];
    }),
  );
}

function maxScoreDecision(scores) {
  return Object.entries(scores).sort((left, right) => {
    const scoreDelta = right[1] - left[1];
    if (scoreDelta !== 0) {
      return scoreDelta;
    }
    return DECISION_RISK[right[0]] - DECISION_RISK[left[0]];
  })[0][0];
}

function higherRiskDecision(left, right) {
  return DECISION_RISK[left] >= DECISION_RISK[right] ? left : right;
}

function summarizeEval(report) {
  return {
    ok: report.ok,
    total: report.total,
    passed: report.passed,
    learnedPassed: report.learnedPassed,
    safetyAdjusted: report.safetyAdjusted,
    failed: report.failed,
  };
}

function validateDataset(dataset) {
  if (!dataset || typeof dataset !== 'object') {
    throw new TypeError('dataset must be an object');
  }
  if (dataset.datasetId !== 'seis-permission-policy-seed-eval') {
    throw new Error('unexpected permission policy dataset id');
  }
  if (!Array.isArray(dataset.cases) || dataset.cases.length === 0) {
    throw new Error('permission policy dataset must include cases');
  }

  const ids = new Set();
  for (const item of dataset.cases) {
    if (!item.id || ids.has(item.id)) {
      throw new Error(`invalid or duplicate dataset case id: ${item.id}`);
    }
    ids.add(item.id);

    if (!['train', 'eval'].includes(item.split)) {
      throw new Error(`invalid split for dataset case: ${item.id}`);
    }
    if (!DECISIONS.includes(item.expected)) {
      throw new Error(`invalid expected decision for dataset case: ${item.id}`);
    }
    if (!item.action || typeof item.action !== 'object') {
      throw new Error(`missing action for dataset case: ${item.id}`);
    }
  }
}

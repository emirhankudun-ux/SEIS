import { readFileSync } from 'node:fs';

import { containsSecretMaterial } from '../lib/redaction.mjs';

export const EVAL_CRITIC_DECISIONS = Object.freeze({
  pass: 'pass',
  revise: 'revise',
  block: 'block',
});

const DECISION_RISK = Object.freeze({
  [EVAL_CRITIC_DECISIONS.pass]: 0,
  [EVAL_CRITIC_DECISIONS.revise]: 1,
  [EVAL_CRITIC_DECISIONS.block]: 2,
});

const DECISIONS = Object.freeze(Object.keys(DECISION_RISK));
const TOKEN_PATTERN = /[a-z0-9_-]{2,}/g;

export function loadEvalCriticDataset(datasetPath) {
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
  validateDataset(dataset);
  return dataset;
}

export function trainEvalCriticModel(dataset) {
  validateDataset(dataset);

  const trainCases = dataset.cases.filter(item => item.split === 'train');
  const labels = [...new Set([...DECISIONS, ...trainCases.map(item => item.expected)])].sort();
  const labelCounts = Object.fromEntries(labels.map(label => [label, 0]));
  const featureCounts = Object.fromEntries(labels.map(label => [label, new Map()]));
  const vocabulary = new Set();

  for (const item of trainCases) {
    labelCounts[item.expected] += 1;
    for (const feature of extractEvalCriticFeatures(item.review)) {
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
    modelId: 'seis-eval-critic-seed-v0',
    modelFamily: 'seis-eval-critic',
    version: dataset.version,
    datasetId: dataset.datasetId,
    trainingCaseCount: totalTrain,
    labels,
    priors,
    features: [...vocabulary].sort(),
    classFeatureWeights,
    safetyFloor: 'seis-eval-critic-rule-floor-v0',
  };
}

export function extractEvalCriticFeatures(review = {}) {
  const text = [
    review.goal,
    review.summary,
    review.changeSummary,
    review.releaseClaim,
    review.rollback,
    ...(Array.isArray(review.evidence) ? review.evidence : []),
    ...(Array.isArray(review.sources) ? review.sources : []),
    ...(Array.isArray(review.risks) ? review.risks : []),
    ...(Array.isArray(review.findings) ? review.findings : []),
    ...(Array.isArray(review.validation) ? review.validation.map(item => `${item.command || ''} ${item.status || ''}`) : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const textFeatures = (text.match(TOKEN_PATTERN) || []).map(term => `text:${term}`);
  const validationItems = Array.isArray(review.validation) ? review.validation : [];
  const evidenceItems = Array.isArray(review.evidence) ? review.evidence : [];
  const sourceItems = Array.isArray(review.sources) ? review.sources : [];
  const riskItems = Array.isArray(review.risks) ? review.risks : [];
  const failedValidation = validationItems.some(item => item.status === 'failed');
  const passedValidation = validationItems.some(item => item.status === 'passed');

  const flagFeatures = [
    validationItems.length > 0 ? 'flag:has_validation' : 'flag:missing_validation',
    passedValidation ? 'flag:validation_passed' : 'flag:no_passed_validation',
    failedValidation ? 'flag:validation_failed' : null,
    evidenceItems.length > 0 ? 'flag:has_evidence' : 'flag:missing_evidence',
    sourceItems.length > 0 ? 'flag:has_sources' : 'flag:missing_sources',
    riskItems.length > 0 ? 'flag:has_risks' : 'flag:missing_risks',
    review.rollback ? 'flag:has_rollback' : 'flag:missing_rollback',
    review.releaseClaim ? 'flag:release_claim' : 'flag:no_release_claim',
    review.highRisk ? 'flag:high_risk' : 'flag:not_high_risk',
    review.humanApproval ? 'flag:has_human_approval' : 'flag:missing_human_approval',
    review.security?.redaction === 'passed' ? 'flag:redaction_passed' : null,
    review.security?.redaction === 'failed' ? 'flag:redaction_failed' : null,
    review.rawOutput && containsSecretMaterial(review.rawOutput) ? 'flag:raw_secret_material' : null,
  ].filter(Boolean);

  return [...new Set(['bias', ...textFeatures, ...flagFeatures])].sort();
}

export function predictEvalCriticReview(model, review, options = {}) {
  const enforceSafetyFloor = options.enforceSafetyFloor !== false;
  const features = extractEvalCriticFeatures(review);
  const scores = scoreReview(model, features);
  const learnedDecision = maxScoreDecision(scores);
  const safetyDecision = classifyReviewWithSafetyFloor(review);
  const decision = enforceSafetyFloor
    ? boundedRiskDecision(learnedDecision, safetyDecision, review)
    : learnedDecision;

  return {
    decision,
    learnedDecision,
    safetyDecision,
    safetyAdjusted: decision !== learnedDecision,
    scores,
    features,
    reasons: buildReasons(review, decision, safetyDecision),
  };
}

export function runEvalCriticModelEval(model, cases, options = {}) {
  const results = cases.map(item => {
    const prediction = predictEvalCriticReview(model, item.review, options);
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
      reasons: prediction.reasons,
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

export function buildEvalCriticModelArtifact(dataset) {
  const model = trainEvalCriticModel(dataset);
  const trainCases = dataset.cases.filter(item => item.split === 'train');
  const evalCases = dataset.cases.filter(item => item.split === 'eval');

  return {
    artifactId: 'seis-eval-critic-seed-v0',
    artifactType: 'seis-owned-local-evaluator-experiment',
    dataset: {
      datasetId: dataset.datasetId,
      version: dataset.version,
      sourceClass: dataset.sourceClass,
      consent: dataset.consent,
    },
    model,
    eval: {
      train: summarizeEval(runEvalCriticModelEval(model, trainCases)),
      eval: summarizeEval(runEvalCriticModelEval(model, evalCases)),
    },
  };
}

function classifyReviewWithSafetyFloor(review = {}) {
  const validationItems = Array.isArray(review.validation) ? review.validation : [];
  const evidenceItems = Array.isArray(review.evidence) ? review.evidence : [];
  const sourceItems = Array.isArray(review.sources) ? review.sources : [];
  const hasPassedValidation = validationItems.some(item => item.status === 'passed');
  const hasFailedValidation = validationItems.some(item => item.status === 'failed');
  const hasEvidence = evidenceItems.length > 0 && sourceItems.length > 0;
  const rawSecretRisk = Boolean(review.rawOutput && containsSecretMaterial(review.rawOutput));

  if (rawSecretRisk || review.security?.redaction === 'failed') {
    return EVAL_CRITIC_DECISIONS.block;
  }

  if (review.highRisk && !review.humanApproval) {
    return EVAL_CRITIC_DECISIONS.block;
  }

  if (review.releaseClaim && (!hasPassedValidation || hasFailedValidation)) {
    return EVAL_CRITIC_DECISIONS.block;
  }

  if (!hasEvidence || validationItems.length === 0 || hasFailedValidation) {
    return EVAL_CRITIC_DECISIONS.revise;
  }

  if (!review.rollback && (review.touchedProduction || review.highRisk)) {
    return EVAL_CRITIC_DECISIONS.revise;
  }

  return EVAL_CRITIC_DECISIONS.pass;
}

function buildReasons(review, decision, safetyDecision) {
  const reasons = [];
  const validationItems = Array.isArray(review.validation) ? review.validation : [];
  const evidenceItems = Array.isArray(review.evidence) ? review.evidence : [];
  const sourceItems = Array.isArray(review.sources) ? review.sources : [];

  if (evidenceItems.length > 0 && sourceItems.length > 0) {
    reasons.push('evidence and sources present');
  } else {
    reasons.push('evidence or sources missing');
  }

  if (validationItems.some(item => item.status === 'passed')) {
    reasons.push('validation evidence present');
  } else {
    reasons.push('passed validation missing');
  }

  if (validationItems.some(item => item.status === 'failed')) {
    reasons.push('failed validation present');
  }

  if (review.rawOutput && containsSecretMaterial(review.rawOutput)) {
    reasons.push('raw secret-like output detected');
  }

  if (review.releaseClaim) {
    reasons.push('release claim requires stronger evidence');
  }

  if (review.highRisk && !review.humanApproval) {
    reasons.push('high-risk review lacks human approval');
  }

  if (decision !== safetyDecision) {
    reasons.push(`learned decision raised beyond safety floor: ${safetyDecision}`);
  }

  return [...new Set(reasons)];
}

function scoreReview(model, features) {
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

function boundedRiskDecision(learnedDecision, safetyDecision, review) {
  if (DECISION_RISK[learnedDecision] <= DECISION_RISK[safetyDecision]) {
    return safetyDecision;
  }

  return canEscalateBeyondSafetyFloor(learnedDecision, review)
    ? learnedDecision
    : safetyDecision;
}

function canEscalateBeyondSafetyFloor(targetDecision, review = {}) {
  const validationItems = Array.isArray(review.validation) ? review.validation : [];
  const evidenceItems = Array.isArray(review.evidence) ? review.evidence : [];
  const sourceItems = Array.isArray(review.sources) ? review.sources : [];
  const hasPassedValidation = validationItems.some(item => item.status === 'passed');
  const hasFailedValidation = validationItems.some(item => item.status === 'failed');
  const hasEvidence = evidenceItems.length > 0 && sourceItems.length > 0;
  const rawSecretRisk = Boolean(review.rawOutput && containsSecretMaterial(review.rawOutput));

  if (targetDecision === EVAL_CRITIC_DECISIONS.block) {
    return rawSecretRisk
      || review.security?.redaction === 'failed'
      || (review.highRisk && !review.humanApproval)
      || (review.releaseClaim && (!hasPassedValidation || hasFailedValidation));
  }

  if (targetDecision === EVAL_CRITIC_DECISIONS.revise) {
    return !hasEvidence
      || validationItems.length === 0
      || hasFailedValidation
      || (!review.rollback && (review.touchedProduction || review.highRisk));
  }

  return false;
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
  if (dataset.datasetId !== 'seis-eval-critic-seed-v0') {
    throw new Error('unexpected eval critic dataset id');
  }
  if (!Array.isArray(dataset.cases) || dataset.cases.length === 0) {
    throw new Error('eval critic dataset must include cases');
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
    if (!item.review || typeof item.review !== 'object') {
      throw new Error(`missing review payload for dataset case: ${item.id}`);
    }
  }
}

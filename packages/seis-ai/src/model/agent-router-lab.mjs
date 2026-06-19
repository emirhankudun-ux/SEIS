import { readFileSync } from 'node:fs';

const TOKEN_PATTERN = /[a-z0-9_-]{2,}/g;
const LABELS = Object.freeze([
  'seis',
  'seis-governance',
  'seis-cloud',
  'seis-code',
  'seis-design',
  'seis-data',
]);

const LANE_RISK_ORDER = Object.freeze({
  'seis': 0,
  'seis-design': 1,
  'seis-data': 2,
  'seis-code': 3,
  'seis-governance': 4,
  'seis-cloud': 5,
});

const SAFETY_KEYWORDS = Object.freeze({
  'seis-cloud': ['cloud', 'deploy', 'deployment', 'provider', 'ssh', 'vpn', 'wireguard', 'bootstrap', 'rollback', 'cost'],
  'seis-governance': ['release', 'security', 'license', 'quality', 'ci', 'github', 'handoff', 'policy', 'governance'],
  'seis-design': ['design', 'ui', 'ux', 'accessibility', 'responsive', 'motion', 'visual', 'layout'],
  'seis-data': ['data', 'dataset', 'schema', 'memory', 'provenance', 'training', 'report', 'rag'],
  'seis-code': ['code', 'script', 'runtime', 'test', 'tests', 'mcp', 'tool', 'bug', 'package', 'node'],
  'seis': ['architecture', 'roadmap', 'scope', 'plan', 'ecosystem', 'model-family', 'universe'],
});

export function loadAgentRouterDataset(datasetPath) {
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
  validateDataset(dataset);
  return dataset;
}

export function trainAgentRouterModel(dataset) {
  validateDataset(dataset);

  const trainCases = dataset.cases.filter(item => item.split === 'train');
  const labelCounts = Object.fromEntries(LABELS.map(label => [label, 0]));
  const featureCounts = Object.fromEntries(LABELS.map(label => [label, new Map()]));
  const laneDefaults = {};
  const vocabulary = new Set();

  for (const item of trainCases) {
    const laneId = item.expected.laneId;
    labelCounts[laneId] += 1;
    laneDefaults[laneId] = {
      toolName: item.expected.toolName,
      defaultGate: item.expected.defaultGate,
    };

    for (const feature of extractAgentRouteFeatures(item.task)) {
      vocabulary.add(feature);
      featureCounts[laneId].set(feature, (featureCounts[laneId].get(feature) || 0) + 1);
    }
  }

  const priors = Object.fromEntries(
    LABELS.map(label => [
      label,
      Math.log((labelCounts[label] + 1) / (trainCases.length + LABELS.length)),
    ]),
  );

  return {
    modelId: 'seis-agent-router-seed-v0',
    modelFamily: 'seis-agent-router',
    version: dataset.version,
    datasetId: dataset.datasetId,
    trainingCaseCount: trainCases.length,
    labels: LABELS,
    priors,
    features: [...vocabulary].sort(),
    classFeatureWeights: Object.fromEntries(
      LABELS.map(label => [
        label,
        Object.fromEntries([...featureCounts[label].entries()].sort(([left], [right]) => left.localeCompare(right))),
      ]),
    ),
    laneDefaults,
    safetyFloor: 'seis-agent-router-rule-floor-v0',
  };
}

export function extractAgentRouteFeatures(task = {}) {
  const text = [
    task.text,
    ...(Array.isArray(task.signals) ? task.signals : []),
    ...(Array.isArray(task.constraints) ? task.constraints : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const tokens = (text.match(TOKEN_PATTERN) || []).map(token => `text:${token}`);
  const tokenSet = new Set(tokens.map(token => token.replace(/^text:/, '')));
  const flagFeatures = [];

  for (const [laneId, keywords] of Object.entries(SAFETY_KEYWORDS)) {
    if (keywords.some(keyword => tokenSet.has(keyword))) {
      flagFeatures.push(`flag:${laneId}`);
    }
  }

  if (/\b(secret|credential|token|key|redaction)\b/.test(text)) {
    flagFeatures.push('flag:secret_sensitive');
  }
  if (/\b(push|release|publish|ci)\b/.test(text)) {
    flagFeatures.push('flag:release_sensitive');
  }
  if (/\b(external|provider|cloud|deploy|ssh|vpn)\b/.test(text)) {
    flagFeatures.push('flag:external_runtime');
  }

  return [...new Set(['bias', ...tokens, ...flagFeatures])].sort();
}

export function predictAgentRoute(model, task, options = {}) {
  const enforceSafetyFloor = options.enforceSafetyFloor !== false;
  const features = extractAgentRouteFeatures(task);
  const scores = scoreTask(model, features);
  const learnedLaneId = maxScoreLane(scores);
  const safetyLaneId = classifyTaskWithSafetyFloor(task);
  const laneId = enforceSafetyFloor
    ? boundedLaneDecision(learnedLaneId, safetyLaneId)
    : learnedLaneId;
  const defaults = model.laneDefaults[laneId] || {};

  return {
    laneId,
    learnedLaneId,
    safetyLaneId,
    safetyAdjusted: laneId !== learnedLaneId,
    toolName: defaults.toolName || 'seis_plugin_integration',
    defaultGate: defaults.defaultGate || null,
    scores,
    features,
    reasons: buildReasons(task, laneId, safetyLaneId),
  };
}

export function runAgentRouterModelEval(model, cases, options = {}) {
  const results = cases.map(item => {
    const prediction = predictAgentRoute(model, item.task, options);
    return {
      id: item.id,
      split: item.split,
      expected: item.expected.laneId,
      actual: prediction.laneId,
      learnedLaneId: prediction.learnedLaneId,
      safetyLaneId: prediction.safetyLaneId,
      ok: prediction.laneId === item.expected.laneId,
      learnedOk: prediction.learnedLaneId === item.expected.laneId,
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

export function buildAgentRouterModelArtifact(dataset) {
  const model = trainAgentRouterModel(dataset);
  const trainCases = dataset.cases.filter(item => item.split === 'train');
  const evalCases = dataset.cases.filter(item => item.split === 'eval');

  return {
    artifactId: 'seis-agent-router-seed-v0',
    artifactType: 'seis-owned-local-agent-routing-experiment',
    dataset: {
      datasetId: dataset.datasetId,
      version: dataset.version,
      sourceClass: dataset.sourceClass,
      consent: dataset.consent,
    },
    model,
    eval: {
      train: summarizeEval(runAgentRouterModelEval(model, trainCases)),
      eval: summarizeEval(runAgentRouterModelEval(model, evalCases)),
    },
  };
}

function scoreTask(model, features) {
  return Object.fromEntries(
    model.labels.map(label => {
      const weights = model.classFeatureWeights[label] || {};
      let score = features.reduce(
        (sum, feature) => sum + (weights[feature] || 0),
        model.priors[label] || 0,
      );
      if (features.includes(`flag:${label}`)) {
        score += 6;
      }
      if (label === 'seis-cloud' && features.includes('flag:external_runtime')) {
        score += 2;
      }
      if (label === 'seis-governance' && features.includes('flag:release_sensitive')) {
        score += 2;
      }
      return [label, Number(score.toFixed(6))];
    }),
  );
}

function maxScoreLane(scores) {
  return Object.entries(scores).sort((left, right) => {
    const delta = right[1] - left[1];
    if (delta !== 0) {
      return delta;
    }
    return LANE_RISK_ORDER[right[0]] - LANE_RISK_ORDER[left[0]];
  })[0][0];
}

function classifyTaskWithSafetyFloor(task = {}) {
  const text = [task.text, ...(Array.isArray(task.signals) ? task.signals : [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const tokenSet = new Set((text.match(TOKEN_PATTERN) || []));

  if (SAFETY_KEYWORDS['seis-cloud'].some(keyword => tokenSet.has(keyword))) {
    return 'seis-cloud';
  }
  if (SAFETY_KEYWORDS['seis-design'].some(keyword => tokenSet.has(keyword))) {
    return 'seis-design';
  }
  if (SAFETY_KEYWORDS['seis-data'].some(keyword => tokenSet.has(keyword))) {
    return 'seis-data';
  }
  if (/\b(release|security|license|quality|ci|github|handoff|policy|governance)\b/.test(text)) {
    return 'seis-governance';
  }
  if (SAFETY_KEYWORDS['seis-code'].some(keyword => tokenSet.has(keyword))) {
    return 'seis-code';
  }
  return 'seis';
}

function boundedLaneDecision(learnedLaneId, safetyLaneId) {
  if (learnedLaneId === safetyLaneId) {
    return learnedLaneId;
  }
  return safetyLaneId === 'seis' ? learnedLaneId : safetyLaneId;
}

function buildReasons(task, laneId, safetyLaneId) {
  const features = extractAgentRouteFeatures(task);
  const reasons = [`selected ${laneId}`];
  for (const feature of features.filter(item => item.startsWith('flag:'))) {
    reasons.push(feature.replace('flag:', 'matched '));
  }
  if (laneId !== safetyLaneId) {
    reasons.push(`learned route retained over safety floor ${safetyLaneId}`);
  }
  return [...new Set(reasons)];
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
  if (dataset.datasetId !== 'seis-agent-router-seed-v0') {
    throw new Error('unexpected agent router dataset id');
  }
  if (!Array.isArray(dataset.cases) || dataset.cases.length === 0) {
    throw new Error('agent router dataset must include cases');
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
    if (!item.task || typeof item.task.text !== 'string' || item.task.text.length === 0) {
      throw new Error(`invalid task text in dataset case: ${item.id}`);
    }
    if (!item.expected || !LABELS.includes(item.expected.laneId)) {
      throw new Error(`invalid expected lane in dataset case: ${item.id}`);
    }
    if (item.expected.toolName !== 'seis_plugin_integration') {
      throw new Error(`dataset case must route through seis_plugin_integration: ${item.id}`);
    }
  }
}

import { containsSecretMaterial } from '../lib/redaction.mjs';

const DESTRUCTIVE_PATTERNS = [
  /\brm\s+-rf\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+push\s+--force\b/i,
  /\b(drop|truncate)\s+(table|database)\b/i,
  /\bdelete\s+production\b/i,
];

const CAPABILITY_WEIGHTS = new Map([
  ['read', 0],
  ['search', 0],
  ['status', 0],
  ['summarize', 0],
  ['write', 2],
  ['shell', 2],
  ['network', 2],
  ['git', 2],
  ['data', 2],
  ['model', 3],
  ['deploy', 3],
  ['secret', 4],
]);

export const PERMISSION_DECISIONS = Object.freeze({
  allow: 'allow',
  gate: 'gate',
  approvalRequired: 'approval_required',
  deny: 'deny',
});

export function classifyPermissionAction(action) {
  const normalized = normalizeAction(action);
  const reasons = [];

  if (containsSecretMaterial(normalized.text) || normalized.capabilities.includes('secret')) {
    reasons.push('secret_access_or_secret_like_content');
    return decision(PERMISSION_DECISIONS.deny, reasons, normalized);
  }

  if (containsAny(normalized.text, DESTRUCTIVE_PATTERNS)) {
    reasons.push('destructive_operation');
    return decision(PERMISSION_DECISIONS.approvalRequired, reasons, normalized);
  }

  if (normalized.externalWrite) {
    reasons.push('external_write');
    return decision(PERMISSION_DECISIONS.approvalRequired, reasons, normalized);
  }

  if (normalized.capabilities.includes('deploy') || normalized.capabilities.includes('model')) {
    reasons.push('release_or_model_operation');
    return decision(PERMISSION_DECISIONS.approvalRequired, reasons, normalized);
  }

  const maxWeight = normalized.capabilities.reduce(
    (max, capability) => Math.max(max, CAPABILITY_WEIGHTS.get(capability) ?? 2),
    0,
  );

  if (maxWeight >= 2) {
    reasons.push('scoped_privileged_action');
    return decision(PERMISSION_DECISIONS.gate, reasons, normalized);
  }

  reasons.push('read_only_or_low_risk');
  return decision(PERMISSION_DECISIONS.allow, reasons, normalized);
}

export function runPermissionPolicyEval(cases) {
  const results = cases.map(testCase => {
    const result = classifyPermissionAction(testCase.action);
    return {
      id: testCase.id,
      expected: testCase.expected,
      actual: result.decision,
      ok: result.decision === testCase.expected,
      reasons: result.reasons,
    };
  });

  return {
    ok: results.every(item => item.ok),
    total: results.length,
    passed: results.filter(item => item.ok).length,
    failed: results.filter(item => !item.ok),
    results,
  };
}

function containsAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function normalizeAction(action = {}) {
  const text = [
    action.intent,
    action.command,
    action.path,
    action.summary,
    ...(Array.isArray(action.evidence) ? action.evidence : []),
  ]
    .filter(Boolean)
    .join(' ');

  const capabilities = [
    ...new Set((action.capabilities || []).map(item => String(item).toLowerCase())),
  ];

  return {
    text,
    capabilities,
    externalWrite: Boolean(action.externalWrite),
    workspace: action.workspace || 'selected',
  };
}

function decision(permissionDecision, reasons, normalized) {
  return {
    decision: permissionDecision,
    reasons,
    capabilities: normalized.capabilities,
    workspace: normalized.workspace,
  };
}

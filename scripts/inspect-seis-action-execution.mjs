#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  classifyPermissionAction,
  PERMISSION_DECISIONS,
} from '../packages/seis-ai/src/model/permission-policy.mjs';
import { predictPermissionPolicyAction } from '../packages/seis-ai/src/model/permission-policy-lab.mjs';
import { redactSecretText } from '../packages/seis-ai/src/lib/redaction.mjs';

const ROOT = process.cwd();
const CONTRACT_PATH = path.join(ROOT, 'content', 'development', 'seis-action-execution-contract.json');
const DEFAULT_REPORT_JSON = path.join(ROOT, 'reports', 'seis-action-execution', 'latest.json');
const DEFAULT_REPORT_MARKDOWN = path.join(ROOT, 'reports', 'seis-action-execution', 'latest.md');
const DEFAULT_WORKSPACE = ROOT;

const args = parseArgs(process.argv.slice(2));
const workspace = resolveWorkspace(args.workspace);
const contract = readJsonOrExit(CONTRACT_PATH, 'missing action execution contract');
const modelPath = resolveModelPath(args.model, ROOT, args.mode === 'learned');
const model = modelPath ? readJsonOrExit(modelPath, `missing policy model: ${path.relative(ROOT, modelPath)}`) : null;
const approvedSet = new Set(normalizeIds(args.approve));
const execute = Boolean(args.execute);
const defaultRunMode = execute ? 'execute' : 'dry-run';

const input = loadInput(args.input, args.intent, args.capabilities, args.summary, args.command, args.path);
const decisions = evaluateActions({
  actions: input.actions,
  contract,
  model,
  includeModel: Boolean(model),
  workspaceRoot: workspace,
  approvedIds: approvedSet,
  approveAll: Boolean(args.approveAll),
  execute,
});

const report = {
  generatedAt: new Date().toISOString(),
  generatedBy: 'inspect-seis-action-execution.mjs',
  mode: args.mode || 'deterministic',
  runMode: defaultRunMode,
  workspace,
  policy: {
    contractId: contract.id,
    contractVersion: contract.version,
    decisionSource: model ? 'model+policy' : 'deterministic',
    dryRunDefault: !execute,
  },
  plan: decisions,
  input: {
    path: input.inputPath ? path.relative(ROOT, input.inputPath) : 'cli',
    actionCount: input.actions.length,
    scope: input.scope || 'local-repo',
    execute,
    approvedIds: [...approvedSet],
  },
  summary: summarizeDecisions(decisions),
};

mkdirSync(path.dirname(args.jsonOut || DEFAULT_REPORT_JSON), { recursive: true });
mkdirSync(path.dirname(args.mdOut || DEFAULT_REPORT_MARKDOWN), { recursive: true });
writeReport(report, args.jsonOut || DEFAULT_REPORT_JSON, args.mdOut || DEFAULT_REPORT_MARKDOWN);

console.log(
  `SEIS action execution plan written: ${path.relative(ROOT, args.jsonOut || DEFAULT_REPORT_JSON)} | ${path.relative(ROOT, args.mdOut || DEFAULT_REPORT_MARKDOWN)}`,
);
console.log(JSON.stringify({
  workspace,
  mode: report.mode,
  runMode: report.runMode,
  total: report.summary.total,
  blocked: report.summary.blockedCount,
  awaitingApproval: report.summary.awaitingApprovalCount,
  requiresExplicitApproval: report.summary.requiresExplicitApprovalCount,
  actionReadyToExecute: report.summary.readyToExecuteCount,
}, null, 2));

function parseArgs(argv) {
  const out = { capabilities: [], mode: 'deterministic' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--workspace') {
      out.workspace = next;
      i += 1;
    } else if (arg === '--input') {
      out.input = next;
      i += 1;
    } else if (arg === '--json-out') {
      out.jsonOut = next;
      i += 1;
    } else if (arg === '--md-out') {
      out.mdOut = next;
      i += 1;
    } else if (arg === '--intent') {
      out.intent = next;
      i += 1;
    } else if (arg === '--summary') {
      out.summary = next;
      i += 1;
    } else if (arg === '--command') {
      out.command = next;
      i += 1;
    } else if (arg === '--path') {
      out.path = next;
      i += 1;
    } else if (arg === '--capability') {
      if (next) out.capabilities.push(next);
      i += 1;
    } else if (arg === '--mode') {
      out.mode = next;
      i += 1;
    } else if (arg === '--model') {
      out.model = next;
      i += 1;
    } else if (arg === '--approve-id') {
      if (next) out.approve = out.approve || [];
      out.approve.push(next);
      i += 1;
    } else if (arg === '--approve-all') {
      out.approveAll = true;
    } else if (arg === '--execute') {
      out.execute = true;
    } else if (arg === '--help' || arg === '-h') {
      usage();
    }
  }

  if (!['deterministic', 'learned'].includes(out.mode)) {
    usage(`invalid mode: ${out.mode}`);
  }

  return out;
}

function usage(reason) {
  if (reason) {
    console.error(reason);
  }
  const message = [
    'Usage: node scripts/inspect-seis-action-execution.mjs [--input PATH] [--workspace PATH] [--json-out PATH] [--md-out PATH]',
    '                 [--intent TEXT --capability NAME ...] [--summary TEXT] [--command TEXT] [--path PATH]',
    '                 [--mode deterministic|learned] [--model PATH] [--approve-id ID] [--approve-all] [--execute]',
  ];
  console.log(message.join('\n'));
  process.exit(0);
}

function normalizeIds(rawIds = []) {
  return [...new Set(rawIds.filter(Boolean))];
}

function loadInput(inputPath, intent, capabilities, summary, command, actionPath) {
  if (inputPath) {
    const raw = readJsonOrExit(inputPath, `invalid action input: ${path.relative(ROOT, inputPath)}`);
    if (Array.isArray(raw)) {
      return { scope: 'local-repo', actions: raw, inputPath };
    }
    if (raw && typeof raw === 'object' && Array.isArray(raw.actions)) {
      return { scope: raw.scope || 'local-repo', actions: raw.actions, inputPath };
    }
    if (raw && typeof raw === 'object' && raw.intent) {
      return {
        scope: raw.scope || 'local-repo',
        actions: [raw],
        inputPath,
      };
    }
    console.error('input file must be an action object or { scope, actions } object');
    process.exit(1);
  }

  if (!intent) {
    console.error('no actions provided; use --input or --intent');
    process.exit(1);
  }
  return {
    scope: 'local-repo',
    actions: [
      {
        id: `manual-${Date.now()}`,
        intent,
        summary: summary || '',
        command,
        path: actionPath,
        capabilities,
      },
    ],
    inputPath: null,
  };
}

function resolveWorkspace(candidate) {
  return candidate ? path.resolve(ROOT, candidate) : DEFAULT_WORKSPACE;
}

function resolveModelPath(candidate, root, useModel) {
  if (!useModel) return null;
  if (candidate) return path.resolve(root, candidate);
  return path.join(root, 'packages', 'seis-ai', 'models', 'permission-policy-seed-v0.json');
}

function evaluateActions({
  actions = [],
  contract,
  model,
  includeModel,
  workspaceRoot,
  approvedIds = new Set(),
  approveAll = false,
  execute = false,
}) {
  const results = [];
  const activeModel = model && (model.modelId ? model : model.model);
  const hasModel = Boolean(activeModel && activeModel.labels);

  for (const action of actions) {
    const actionId = action.id || `action-${results.length + 1}`;
    const normalized = normalizeAction(action);
    const deterministic = classifyPermissionAction(normalized);
    let finalDecision = deterministic.decision;
    let decisionSource = 'deterministic';
    let learnedDecision = null;
    let safetyAdjusted = false;

    if (hasModel && includeModel) {
      const prediction = predictPermissionPolicyAction(activeModel, normalized, { enforceSafetyFloor: true });
      learnedDecision = prediction.learnedDecision;
      finalDecision = prediction.decision;
      decisionSource = 'model+policy';
      safetyAdjusted = prediction.safetyAdjusted;
    }

    const risk = mapRisk(finalDecision);
    const blocked = finalDecision === PERMISSION_DECISIONS.deny;
    const requiresApproval = ['gate', 'approval_required'].includes(finalDecision);
    const requiresExplicit = finalDecision === PERMISSION_DECISIONS.approvalRequired;
    const needsExplicitApproval = requiresExplicit || ['approval_required', 'gate'].includes(finalDecision);
    const hasApproval = approveAll || approvedIds.has(actionId) || approvedIds.has(action.intent || '');
    const readyToExecute = finalDecision === PERMISSION_DECISIONS.allow
      || ((requiresApproval || requiresExplicit) && hasApproval && execute && !blocked);
    const executionMode = execute ? 'ready' : 'dry-run';
    const status = blocked
      ? 'blocked'
      : finalDecision === PERMISSION_DECISIONS.allow && execute
        ? 'auto-approved'
        : needsExplicitApproval && !hasApproval
          ? 'awaiting-approval'
          : needsExplicitApproval && hasApproval && !execute
            ? 'approved-dry-run'
            : finalDecision === PERMISSION_DECISIONS.gate
              ? 'requires-gate-approval'
              : 'ready-for-review';

    const reasons = [
      ...deterministic.reasons,
      deterministic.capabilities.length ? `capabilities: ${deterministic.capabilities.join(', ')}` : 'no capability hint',
    ];
    if (learnedDecision && hasModel && learnedDecision !== deterministic.decision) {
      reasons.push(`model-adjusted from ${deterministic.decision} -> ${finalDecision}`);
    }

    const sanitizedIntent = redactText(action.intent || '');
    const sanitizedSummary = redactText(action.summary || '');
    const sanitizedCommand = redactText(action.command || '');

    results.push({
      id: actionId,
      intent: sanitizedIntent,
      summary: sanitizedSummary,
      command: sanitizedCommand,
      path: action.path || '',
      scope: action.scope || 'local-repo',
      decision: finalDecision,
      decisionSource,
      learnedDecision,
      safetyAdjusted,
      risk,
      blocked,
      requiresApproval,
      requiresExplicitApproval: requiresExplicit,
      reasons,
      capabilities: deterministic.capabilities || [],
      execution: {
        mode: executionMode,
        status,
        approved: Boolean(hasApproval),
        ready: readyToExecute,
      },
      evidence: {
        contractId: contract.id,
        contractVersion: contract.version,
        workspace: workspaceRoot,
        commandPolicy: contract.executionPolicy,
      },
    });
  }

  return results;
}

function summarizeDecisions(decisions) {
  const byDecision = {
    allow: 0,
    gate: 0,
    approval_required: 0,
    deny: 0,
  };

  for (const decision of decisions) {
    byDecision[decision.decision] += 1;
  }

  return {
    total: decisions.length,
    blockedCount: decisions.filter((item) => item.blocked).length,
    awaitingApprovalCount: decisions.filter((item) => item.execution.status === 'awaiting-approval').length,
    requiresExplicitApprovalCount: decisions.filter((item) => item.requiresExplicitApproval).length,
    readyToExecuteCount: decisions.filter((item) => item.execution.ready).length,
    byDecision,
  };
}

function writeReport(report, reportJsonPath, reportMarkdownPath) {
  const markdown = renderMarkdown(report);
  writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  writeFileSync(reportMarkdownPath, `${markdown}\n`, 'utf8');
}

function renderMarkdown(report) {
  const lines = [
    '# SEIS Action Execution Plan',
    '',
    `Generated: ${report.generatedAt}`,
    `Contract: ${report.policy.contractId} (${report.policy.contractVersion})`,
    `Mode: ${report.mode}`,
    `Run Mode: ${report.runMode}`,
    '',
    '| id | intent | decision | risk | execution | approval | status | reasons |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const item of report.plan) {
    const reasons = item.reasons.map((line) => line.replace(/\|/g, '│')).join(' ; ');
    lines.push(
      `| ${item.id} | ${item.intent} | ${item.decision} | ${item.risk} | ${item.execution.mode} | ${item.requiresApproval} | ${item.execution.status} | ${reasons} |`,
    );
  }

  lines.push('');
  lines.push(`Summary: total=${report.summary.total}, blocked=${report.summary.blockedCount}, awaitingApproval=${report.summary.awaitingApprovalCount}, ready=${report.summary.readyToExecuteCount}`);

  return lines.join('\n');
}

function mapRisk(decision) {
  if (decision === PERMISSION_DECISIONS.deny) return 'critical';
  if (decision === PERMISSION_DECISIONS.approvalRequired) return 'high';
  if (decision === PERMISSION_DECISIONS.gate) return 'medium';
  return 'low';
}

function normalizeAction(action = {}) {
  const text = [
    action.intent,
    action.command,
    action.path,
    action.summary,
    ...(Array.isArray(action.evidence) ? action.evidence : []),
  ].filter(Boolean)
    .join(' ');

  const capabilities = [
    ...new Set((action.capabilities || []).map((item) => String(item).toLowerCase())),
  ];

  return {
    text,
    capabilities,
    externalWrite: Boolean(action.externalWrite),
    workspace: action.workspace || 'selected',
  };
}

function readJsonOrExit(filePath, message) {
  if (!existsSync(filePath)) {
    console.error(`${message}: ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }

  const raw = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`invalid JSON: ${path.relative(ROOT, filePath)}: ${error.message}`);
    process.exit(1);
  }
}

function redactText(candidate) {
  return redactSecretText(candidate, '[REDACTED_SECRET]');
}

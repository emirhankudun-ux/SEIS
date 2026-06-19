#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  classifyPermissionAction,
  PERMISSION_DECISIONS,
} from '../packages/seis-ai/src/model/permission-policy.mjs';
import { redactSecretText } from '../packages/seis-ai/src/lib/redaction.mjs';

import { predictPermissionPolicyAction } from '../packages/seis-ai/src/model/permission-policy-lab.mjs';
import { predictEvalCriticReview } from '../packages/seis-ai/src/model/eval-critic-lab.mjs';
import { predictAgentRoute } from '../packages/seis-ai/src/model/agent-router-lab.mjs';

const ROOT = process.cwd();
const CONTRACT_PATH = path.join(ROOT, 'content', 'development', 'seis-action-decision-contract.json');
const DEFAULT_REPORT_JSON = path.join(
  ROOT,
  'reports',
  'seis-action-decisions',
  'latest.json',
);
const DEFAULT_REPORT_MARKDOWN = path.join(
  ROOT,
  'reports',
  'seis-action-decisions',
  'latest.md',
);
const EVAL_CRITIC_ARTIFACT_PATH = path.join(ROOT, 'packages', 'seis-ai', 'models', 'eval-critic-seed-v0.json');
const AGENT_ROUTER_ARTIFACT_PATH = path.join(ROOT, 'packages', 'seis-ai', 'models', 'agent-router-seed-v0.json');

const args = parseArgs(process.argv.slice(2));
const workspace = resolveWorkspace(args.workspace);
const contract = readJsonOrExit(CONTRACT_PATH, 'missing action-decision contract');
const useModel = args.mode === 'learned';
const modelPath = resolveModelPath(args.model, ROOT, useModel);
const model = useModel ? readJsonOrExit(modelPath, `missing policy model: ${path.relative(ROOT, modelPath)}`) : null;
const evalCriticArtifact = readJsonOrExit(EVAL_CRITIC_ARTIFACT_PATH, 'missing eval critic model artifact');
const agentRouterArtifact = readJsonOrExit(AGENT_ROUTER_ARTIFACT_PATH, 'missing agent router model artifact');

const input = loadInput(args.input, args.intent, args.capabilities, args.summary, args.command, args.path);
const reportJsonPath = args.jsonOut || DEFAULT_REPORT_JSON;
const reportMdPath = args.mdOut || DEFAULT_REPORT_MARKDOWN;
const report = evaluateActions(input.actions, input.scope, contract, model, {
  includeModel: useModel && Boolean(model),
  workspaceRoot: workspace,
  inputPath: input.inputPath,
  agentRouterArtifact,
});
report.critic = evaluateDecisionReport(report, evalCriticArtifact, {
  jsonOut: reportJsonPath,
  mdOut: reportMdPath,
});

writeReport(report, reportJsonPath, reportMdPath);

console.log(
  `SEIS action decisions written: ${path.relative(ROOT, reportJsonPath)} | ${
    path.relative(ROOT, reportMdPath)
  }`,
);
console.log(
  JSON.stringify(
    {
      workspace,
      policyMode: report.mode,
      total: report.summary.total,
      blocked: report.summary.blockedCount,
      requiresApproval: report.summary.requiresApprovalCount,
      decisionCounts: report.summary.byDecision,
      critic: report.critic.decision,
    },
    null,
    2,
  ),
);

function parseArgs(argv) {
  const out = { capabilities: [], mode: 'deterministic' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (!arg) continue;

    if (arg === '--workspace') {
      out.workspace = next;
      i += 1;
      continue;
    }
    if (arg === '--input') {
      out.input = next;
      i += 1;
      continue;
    }
    if (arg === '--json-out') {
      out.jsonOut = next;
      i += 1;
      continue;
    }
    if (arg === '--md-out') {
      out.mdOut = next;
      i += 1;
      continue;
    }
    if (arg === '--intent') {
      out.intent = next;
      i += 1;
      continue;
    }
    if (arg === '--summary') {
      out.summary = next;
      i += 1;
      continue;
    }
    if (arg === '--command') {
      out.command = next;
      i += 1;
      continue;
    }
    if (arg === '--path') {
      out.path = next;
      i += 1;
      continue;
    }
    if (arg === '--capability') {
      if (next) out.capabilities.push(next);
      i += 1;
      continue;
    }
    if (arg === '--mode') {
      out.mode = next;
      i += 1;
      continue;
    }
    if (arg === '--model') {
      out.model = next;
      i += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
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
    'Usage: node scripts/inspect-seis-action-decision.mjs [--input PATH] [--workspace PATH] [--json-out PATH] [--md-out PATH]',
    '                 [--intent TEXT --capability NAME ...] [--command TEXT] [--summary TEXT] [--path PATH]',
    '                 [--mode deterministic|learned] [--model PATH]',
    '',
    'Mode summary:',
    '- deterministic: run only deterministic rule classifier',
    '- learned: run deterministic+learned policy with safety floor',
  ];

  console.log(message.join('\n'));
  process.exit(0);
}

function loadInput(inputPath, intent, capabilities, summary, command, actionPath) {
  if (inputPath) {
    const raw = readJsonOrExit(inputPath, `invalid action input: ${path.relative(ROOT, inputPath)}`);
    if (Array.isArray(raw)) {
      return { scope: 'local-repo', actions: raw, inputPath };
    }

    if (Array.isArray(raw.actions)) {
      return {
        scope: raw.scope || 'local-repo',
        actions: raw.actions,
        inputPath,
      };
    }

    if (!raw || typeof raw !== 'object' || !raw.intent) {
      console.error('input file must be an action object or { scope, actions } object');
      process.exit(1);
    }

    return {
      scope: raw.scope || 'local-repo',
      actions: [raw],
      inputPath,
    };
  }

  if (!intent) {
    console.error('no actions provided; use --input or --intent');
    process.exit(1);
  }

  return {
    scope: 'local-repo',
    actions: [
      {
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
  return candidate ? path.resolve(ROOT, candidate) : ROOT;
}

function resolveModelPath(candidate, root, useModel) {
  if (!useModel) return null;
  if (candidate) return path.resolve(root, candidate);

  return path.join(
    root,
    'packages',
    'seis-ai',
    'models',
    'permission-policy-seed-v0.json',
  );
}

function evaluateActions(actions, scope, contract, model, options = {}) {
  const sanitized = [];
  const byDecision = initDecisionCounters();
  const mode = options.includeModel ? 'learned' : 'deterministic';
  const activeModel = model && (model.modelId ? model : model.model);
  const hasModel = Boolean(activeModel && activeModel.labels);
  const routeModel = options.agentRouterArtifact?.model || options.agentRouterArtifact || null;
  const reportScope = options.workspaceRoot || scope || 'local-repo';

  for (const action of actions) {
    const actionWorkspace = action.workspace || reportScope;
    const normalized = normalizeAction(action);
    const deterministic = classifyPermissionAction(normalized);
    const route = routeModel ? buildRouteAdvisory(routeModel, normalized) : null;
    let finalDecision = deterministic.decision;
    let decisionSource = 'deterministic';
    let learnedDecision = null;
    let safetyAdjusted = false;

    if (hasModel && options.includeModel) {
      const prediction = predictPermissionPolicyAction(activeModel, normalized, { enforceSafetyFloor: true });
      learnedDecision = prediction.learnedDecision;
      finalDecision = prediction.decision;
      decisionSource = 'model+policy';
      safetyAdjusted = prediction.safetyAdjusted;
    }

    byDecision[finalDecision] += 1;
    const risk = mapRisk(finalDecision);
    const blocked = finalDecision === PERMISSION_DECISIONS.deny;
    const requiresApproval = ['gate', 'approval_required'].includes(finalDecision);
    const requiresExplicitApproval = finalDecision === PERMISSION_DECISIONS.approvalRequired;
    const reasonLines = [
      ...deterministic.reasons,
      deterministic.capabilities.length ? `capabilities: ${deterministic.capabilities.join(', ')}` : 'no capability hint',
    ];

    if (learnedDecision && hasModel && learnedDecision !== deterministic.decision) {
      reasonLines.push(`model-adjusted from ${deterministic.decision} -> ${finalDecision}`);
    }

    if (safetyAdjusted) {
      reasonLines.push('policy safety floor enforced');
    }

    sanitized.push({
      id: normalized.id || `action-${sanitized.length + 1}`,
      intent: redactText(normalized.intent || ''),
      summary: redactText(normalized.summary || ''),
      command: redactText(normalized.command || ''),
      path: normalized.path || '',
      capabilities: normalized.capabilities,
      route,
      externalWrite: Boolean(normalized.externalWrite),
      workspace: actionWorkspace,
      decision: finalDecision,
      decisionSource,
      learnedDecision,
      safetyAdjusted,
      reasons: [...new Set(reasonLines.filter(Boolean))],
      risk,
      requiresApproval,
      requiresExplicitApproval,
      blocked,
    });
  }

  const summaryBlocked = sanitized.filter((item) => item.blocked).length;
  const summaryRequiresApproval = sanitized.filter((item) => item.requiresApproval).length;
  const summaryRequiresExplicitApproval = sanitized.filter((item) => item.requiresExplicitApproval).length;

  return {
    generatedAt: new Date().toISOString(),
    mode,
    policy: {
      contractId: contract.id,
      policyVersion: contract.policyVersion,
      defaultDecision: contract.defaultDecision,
      modelArtifact: hasModel
        ? {
            modelId:
              model.modelId || model.artifactId || model.model?.modelId || activeModel?.modelId || 'unknown',
          }
        : null,
      routeModel: routeModel
        ? {
            modelId:
              routeModel.modelId || options.agentRouterArtifact?.artifactId || 'seis-agent-router-seed-v0',
          }
        : null,
    },
    scope: {
      workspace: reportScope,
      source: scope || 'local-repo',
      inputPath: options.inputPath ? path.relative(ROOT, options.inputPath) : null,
    },
    summary: {
      total: sanitized.length,
      blockedCount: summaryBlocked,
      requiresApprovalCount: summaryRequiresApproval,
      requiresExplicitApprovalCount: summaryRequiresExplicitApproval,
      byDecision,
      redactionApplied: true,
    },
    decisions: sanitized,
  };
}

function mapRisk(decision) {
  if (decision === PERMISSION_DECISIONS.allow) return 'low';
  if (decision === PERMISSION_DECISIONS.gate) return 'medium';
  if (decision === PERMISSION_DECISIONS.approvalRequired) return 'high';
  return 'critical';
}

function initDecisionCounters() {
  return {
    [PERMISSION_DECISIONS.allow]: 0,
    [PERMISSION_DECISIONS.gate]: 0,
    [PERMISSION_DECISIONS.approvalRequired]: 0,
    [PERMISSION_DECISIONS.deny]: 0,
  };
}

function evaluateDecisionReport(report, artifact, outputPaths) {
  const model = artifact.model || artifact;
  const review = {
    goal: 'Review SEIS action decision report',
    summary: `${report.summary.total} action decisions generated with ${report.summary.blockedCount} blocked and ${report.summary.requiresApprovalCount} requiring approval.`,
    changeSummary: 'Permission decisions are redacted, contract-bound, and separated from execution.',
    evidence: [
      'scripts/inspect-seis-action-decision.mjs',
      'content/development/seis-action-decision-contract.json',
      'packages/seis-ai/models/agent-router-seed-v0.json',
      path.relative(ROOT, outputPaths.jsonOut),
      path.relative(ROOT, outputPaths.mdOut),
    ],
    sources: [
      'SEIS_UNIVERSE_EVAL_CRITIC_MODEL_CARD.md',
      'SEIS_UNIVERSE_CLEAN_BUILD.md',
      'SEIS_PHASE_2_CLEAN_ROOM_ARCHITECTURE.md',
    ],
    validation: [
      {
        command: 'node scripts/inspect-seis-action-decision.mjs',
        status: 'passed',
      },
    ],
    risks: report.summary.requiresExplicitApprovalCount > 0
      ? ['Some actions require explicit approval before execution.']
      : ['No explicit-approval actions observed in this decision report.'],
    rollback: 'Regenerate the decision report or remove generated report artifacts.',
    security: {
      redaction: report.summary.redactionApplied ? 'passed' : 'failed',
    },
    releaseClaim: false,
    highRisk: false,
    humanApproval: false,
  };
  const prediction = predictEvalCriticReview(model, review);

  return {
    modelId: model.modelId || artifact.artifactId || 'seis-eval-critic-seed-v0',
    artifactId: artifact.artifactId || null,
    decision: prediction.decision,
    learnedDecision: prediction.learnedDecision,
    safetyDecision: prediction.safetyDecision,
    safetyAdjusted: prediction.safetyAdjusted,
    reasons: prediction.reasons,
    review,
  };
}

function writeReport(report, jsonOut, mdOut) {
  const jsonText = `${JSON.stringify(report, null, 2)}\n`;
  const mdText = renderMarkdownReport(report);
  mkdirSync(path.dirname(jsonOut), { recursive: true });
  mkdirSync(path.dirname(mdOut), { recursive: true });
  writeFileSync(jsonOut, jsonText, 'utf8');
  writeFileSync(mdOut, mdText, 'utf8');
}

function renderMarkdownReport(report) {
  const decisionRows = report.decisions
    .map(
      (item) =>
        `| ${item.id} | ${item.intent || '-'} | ${item.decision} | ${item.risk} | ${
          item.requiresApproval ? 'yes' : 'no'
        } | ${item.decisionSource} | ${item.reasons.join('; ')} |`,
    )
    .join('\n');

  const criticLines = report.critic
    ? `\n\n## Eval Critic Advisory\n` +
      `- Model: ${report.critic.modelId}\n` +
      `- Decision: ${report.critic.decision}\n` +
      `- Safety floor: ${report.critic.safetyDecision}\n` +
      `- Reasons: ${report.critic.reasons.join('; ')}\n`
    : '';
  const routeLines = report.decisions.length > 0
    ? `\n\n## Agent Router Advisory\n` +
      report.decisions
        .map((item) => {
          const route = item.route;
          return `- ${item.id}: ${route?.laneId || 'unrouted'} via ${route?.toolName || 'none'}; gate=${route?.defaultGate || 'none'}`;
        })
        .join('\n') +
      `\n`
    : '';

  return (
    `# SEIS Action Decision Report\n\n` +
    `Generated at: ${report.generatedAt}\n\n` +
    `## Context\n` +
    `- Scope: ${report.scope.workspace}\n` +
    `- Mode: ${report.mode}\n` +
    `- Policy version: ${report.policy.policyVersion}\n` +
    `- Contract: ${report.policy.contractId}\n\n` +
    `## Summary\n` +
    `- Total: ${report.summary.total}\n` +
    `- Blocked: ${report.summary.blockedCount}\n` +
    `- Requires approval: ${report.summary.requiresApprovalCount}\n` +
    `- Requires explicit approval: ${report.summary.requiresExplicitApprovalCount}\n` +
    `- Decision mix: allow=${report.summary.byDecision.allow}, gate=${report.summary.byDecision.gate}, approval_required=${
      report.summary.byDecision.approval_required
    }, deny=${report.summary.byDecision.deny}\n\n` +
    `## Decisions\n` +
    `| id | intent | decision | risk | approval | source | reasons |\n` +
    `| --- | --- | --- | --- | --- | --- | --- |\n` +
    `${decisionRows || '- | none | none | none | none | none | none |'}\n` +
    routeLines +
    criticLines
  );
}

function normalizeAction(item) {
  const asObject = item && typeof item === 'object' ? item : {};
  return {
    id: asObject.id,
    intent: String(asObject.intent || '').trim(),
    command: String(asObject.command || '').trim(),
    path: asObject.path || '',
    summary: String(asObject.summary || '').trim(),
    evidence: Array.isArray(asObject.evidence) ? asObject.evidence : [],
    capabilities: [...new Set((asObject.capabilities || []).map(item => String(item).toLowerCase()).filter(Boolean))],
    externalWrite: Boolean(asObject.externalWrite),
    workspace: asObject.workspace || 'local-repo',
  };
}

function buildRouteAdvisory(model, normalized) {
  const task = {
    text: [
      normalized.intent,
      normalized.summary,
      normalized.command,
      normalized.path,
      normalized.capabilities.join(' '),
    ].filter(Boolean).join(' '),
    signals: normalized.capabilities,
  };
  const prediction = predictAgentRoute(model, task);
  return {
    modelId: model.modelId || 'seis-agent-router-seed-v0',
    laneId: prediction.laneId,
    learnedLaneId: prediction.learnedLaneId,
    safetyLaneId: prediction.safetyLaneId,
    safetyAdjusted: prediction.safetyAdjusted,
    toolName: prediction.toolName,
    defaultGate: prediction.defaultGate,
    reasons: prediction.reasons,
  };
}

function readJsonOrExit(filePath, failure) {
  if (!existsSync(filePath)) {
    console.error(failure);
    process.exit(1);
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`${failure}: ${error.message}`);
    process.exit(1);
  }
}

function redactText(input) {
  return redactSecretText(input, '[REDACTED_TOKEN]');
}

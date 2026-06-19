#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { redactSecretText } from '../packages/seis-ai/src/lib/redaction.mjs';
import { predictEvalCriticReview } from '../packages/seis-ai/src/model/eval-critic-lab.mjs';

const ROOT = process.cwd();
const CONTRACT_PATH = path.join(ROOT, 'content', 'development', 'seis-action-execution-contract.json');
const DEFAULT_PLAN_JSON = path.join(ROOT, 'reports', 'seis-action-execution', 'latest.json');
const DEFAULT_RUN_JSON = path.join(ROOT, 'reports', 'seis-action-execution', 'latest-run.json');
const DEFAULT_RUN_MD = path.join(ROOT, 'reports', 'seis-action-execution', 'latest-run.md');
const EVAL_CRITIC_ARTIFACT_PATH = path.join(ROOT, 'packages', 'seis-ai', 'models', 'eval-critic-seed-v0.json');

const args = parseArgs(process.argv.slice(2));
const workspace = resolveWorkspace(args.workspace);
const contract = readJsonOrExit(CONTRACT_PATH, 'missing action execution contract');
const evalCriticArtifact = readJsonOrExit(EVAL_CRITIC_ARTIFACT_PATH, 'missing eval critic model artifact');
const planPath = resolveReportPath(args.plan, workspace, DEFAULT_PLAN_JSON);
const plan = readPlan(planPath);

const executeRequested = Boolean(args.execute);
const approvedIds = new Set(normalizeIds(args.approve));
const approveAll = Boolean(args.approveAll);
const maxCommandSeconds = sanitizeNumber(args.timeout, contract?.executionPolicy?.maxCommandSeconds, 60);

const commandPolicy = contract.executionPolicy || {};
const redactEnabled = commandPolicy?.redaction?.enabled !== false;

const outJson = path.resolve(workspace, args.jsonOut || DEFAULT_RUN_JSON);
const outMd = path.resolve(workspace, args.mdOut || DEFAULT_RUN_MD);

const executionPolicy = {
  mode: executeRequested ? 'execute' : 'dry-run',
  dryRunDefault: commandPolicy.dryRun !== false,
  maxCommandSeconds,
  requiresExplicitApprovalFor: commandPolicy.requiresExplicitApprovalFor || [],
};

const planActions = Array.isArray(plan.plan) ? plan.plan : [];
const actions = [];

for (const action of planActions) {
  const normalized = normalizeActionForExecution(action, workspace);
  const hasExplicitApproval = hasApproval(normalized.id, normalized.intent, approvedIds, approveAll);
  const canRun = canRunAction(normalized, executeRequested, hasExplicitApproval);

  if (!executeRequested) {
    actions.push(makeDryRunResult(normalized, canRun, hasExplicitApproval));
    continue;
  }

  actions.push(runAction(normalized, canRun, hasExplicitApproval, maxCommandSeconds));
}

const report = {
  generatedAt: new Date().toISOString(),
  generatedBy: 'execute-seis-action-execution.mjs',
  workspace,
  runMode: executionPolicy.mode,
  planSource: path.relative(ROOT, planPath),
  policy: {
    contractId: contract.id,
    contractVersion: contract.version,
    policy: executionPolicy,
  },
  input: {
    execute: executeRequested,
    approvedIds: [...approvedIds],
    approveAll,
  },
  summary: {
    total: actions.length,
    executed: actions.filter((item) => item.execution.attempted).length,
    skipped: actions.filter((item) => !item.execution.attempted).length,
    failed: actions.filter((item) => item.execution.outcome === 'failed').length,
    blocked: actions.filter((item) => item.execution.blocked).length,
  },
  actions,
};
report.critic = evaluateExecutionRunReport(report, evalCriticArtifact, {
  jsonOut: outJson,
  mdOut: outMd,
});

mkdirSync(path.dirname(outJson), { recursive: true });
mkdirSync(path.dirname(outMd), { recursive: true });
writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(outMd, renderMarkdown(report), 'utf8');

console.log(
  `SEIS action execution run written: ${path.relative(ROOT, outJson)} | ${path.relative(ROOT, outMd)}`,
);
console.log(
  JSON.stringify(
    {
      workspace,
      runMode: report.runMode,
      total: report.summary.total,
      executed: report.summary.executed,
      skipped: report.summary.skipped,
      failed: report.summary.failed,
      critic: report.critic.decision,
    },
    null,
    2,
  ),
);

if (report.summary.failed > 0) {
  process.exit(1);
}

function parseArgs(argv) {
  const out = { approve: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--workspace') {
      out.workspace = next;
      i += 1;
    } else if (arg === '--plan') {
      out.plan = next;
      i += 1;
    } else if (arg === '--json-out') {
      out.jsonOut = next;
      i += 1;
    } else if (arg === '--md-out') {
      out.mdOut = next;
      i += 1;
    } else if (arg === '--approve-id') {
      if (next) out.approve.push(next);
      i += 1;
    } else if (arg === '--approve-all') {
      out.approveAll = true;
    } else if (arg === '--execute') {
      out.execute = true;
    } else if (arg === '--timeout-seconds') {
      out.timeout = Number(next);
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      usage();
    }
  }

  return out;
}

function usage() {
  const message = [
    'Usage: node scripts/execute-seis-action-execution.mjs [--plan PATH] [--workspace PATH] [--json-out PATH] [--md-out PATH]',
    '                 [--approve-id ID ...] [--approve-all] [--execute] [--timeout-seconds N]',
    '',
    'Default behavior: dry-run report only. Add --execute to run commands.',
  ];
  console.log(message.join('\n'));
  process.exit(0);
}

function resolveWorkspace(candidate) {
  return candidate ? path.resolve(ROOT, candidate) : ROOT;
}

function resolveReportPath(planPath, workspace, fallback) {
  const resolved = planPath ? path.resolve(workspace, planPath) : fallback;
  if (!existsSync(resolved)) {
    console.error(`plan report not found: ${path.relative(ROOT, resolved)}`);
    process.exit(1);
  }
  return resolved;
}

function sanitizeNumber(candidate, fallback, defaultValue) {
  const value = Number(candidate);
  if (!Number.isFinite(value) || value <= 0) {
    return Number.isFinite(fallback) ? fallback : defaultValue;
  }
  return value;
}

function readPlan(filePath) {
  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!raw || !Array.isArray(raw.plan)) {
      console.error(`invalid plan format: ${path.relative(ROOT, filePath)}`);
      process.exit(1);
    }
    return raw;
  } catch (error) {
    console.error(`invalid execution plan JSON: ${path.relative(ROOT, filePath)}: ${error.message}`);
    process.exit(1);
  }
}

function readJsonOrExit(filePath, message) {
  if (!existsSync(filePath)) {
    console.error(`${message}: ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`invalid JSON: ${path.relative(ROOT, filePath)}: ${error.message}`);
    process.exit(1);
  }
}

function normalizeActionForExecution(action, workspaceRoot) {
  const command = String(action.command || '').trim();
  const actionPath = typeof action.path === 'string' ? action.path.trim() : '';
  let workdir = workspaceRoot;

  if (actionPath) {
    const candidate = path.resolve(workspaceRoot, actionPath);
    try {
      const stat = statSync(candidate);
      if (stat.isDirectory()) {
        workdir = candidate;
      } else if (stat.isFile()) {
        workdir = path.dirname(candidate);
      }
    } catch {
      // keep workspace root
    }
  }

  return {
    id: action.id || `action-${Math.random().toString(36).slice(2)}`,
    intent: redactText(action.intent || ''),
    decision: action.decision || 'deny',
    blocked: Boolean(action.blocked),
    requiresApproval: Boolean(action.requiresApproval),
    requiresExplicitApproval: Boolean(action.requiresExplicitApproval),
    summary: redactText(action.summary || ''),
    command,
    path: actionPath,
    capabilities: Array.isArray(action.capabilities) ? action.capabilities : [],
    risk: action.risk || 'low',
    executionStatus: action.execution ? action.execution.status : 'unknown',
    executionReady: Boolean(action.execution?.ready),
    workspace: workspaceRoot,
    cwd: workdir,
  };
}

function evaluateExecutionRunReport(report, artifact, outputPaths) {
  const model = artifact.model || artifact;
  const validationStatus = report.summary.failed > 0 ? 'failed' : 'passed';
  const rawOutput = report.actions
    .flatMap((item) => [item.execution?.stdout, item.execution?.stderr])
    .filter(Boolean)
    .join('\n');
  const highRiskAttempted = report.actions.some(
    (item) => item.execution?.attempted && ['high', 'critical'].includes(item.risk),
  );

  const review = {
    goal: 'Review SEIS action execution run report',
    summary: `${report.summary.total} actions processed in ${report.runMode} mode with ${report.summary.executed} attempted and ${report.summary.failed} failed.`,
    changeSummary: 'Execution run report records attempted, skipped, blocked, and failed actions with redacted output.',
    evidence: [
      'scripts/execute-seis-action-execution.mjs',
      'content/development/seis-action-execution-contract.json',
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
        command: 'node scripts/execute-seis-action-execution.mjs',
        status: validationStatus,
      },
    ],
    risks: [
      report.runMode === 'dry-run' ? 'Run report is dry-run only.' : 'Run report was generated from execute mode.',
      report.summary.failed > 0 ? 'At least one attempted action failed.' : 'No attempted action failed.',
      report.summary.blocked > 0 ? 'At least one action remained blocked.' : 'No blocked action was attempted.',
    ],
    rollback: 'Regenerate the execution run report or remove generated run artifacts.',
    security: {
      redaction: 'passed',
    },
    rawOutput,
    releaseClaim: false,
    highRisk: highRiskAttempted,
    humanApproval: report.input.approvedIds.length > 0 || report.input.approveAll,
    touchedProduction: false,
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

function hasApproval(actionId, intent, approvedIds, approveAll) {
  if (approveAll) return true;
  if (approvedIds.has(actionId)) return true;
  if (intent && approvedIds.has(intent)) return true;
  return false;
}

function canRunAction(action, executeRequested, hasExplicitApproval) {
  if (!executeRequested) return true;
  if (action.blocked) return false;
  if (action.decision === 'allow') return true;
  if (['gate', 'approval_required'].includes(action.decision)) {
    return hasExplicitApproval;
  }
  return false;
}

function runAction(action, canRun, hasExplicitApproval, maxCommandSeconds) {
  const result = {
    id: action.id,
    intent: action.intent,
    decision: action.decision,
    path: action.path,
    command: action.command,
    capabilitySummary: [...new Set(action.capabilities || [])].sort().join(', ') || 'none',
    execution: {
      mode: 'dry-run',
      status: action.executionStatus,
      ready: action.executionReady,
      attempted: false,
      blocked: action.blocked,
      approved: hasExplicitApproval,
      outcome: 'skipped',
      skippedReason: null,
    },
    risk: action.risk,
  };

  if (action.blocked) {
    result.execution.status = 'blocked';
    result.execution.blocked = true;
    result.execution.outcome = 'blocked';
    result.execution.skippedReason = 'decision blocked by policy';
    return result;
  }

  if (!canRun) {
    result.execution.status = action.requiresApproval ? 'awaiting-approval' : 'blocked';
    result.execution.outcome = 'skipped';
    result.execution.skippedReason = 'requires approval but not provided';
    return result;
  }

  if (!action.command) {
    result.execution.mode = 'blocked';
    result.execution.status = 'skipped-no-command';
    result.execution.outcome = 'skipped';
    result.execution.skippedReason = 'no command found in action';
    return result;
  }

  if (!supportsShellExecution(action)) {
    result.execution.mode = 'blocked';
    result.execution.status = 'skipped-capability-gap';
    result.execution.outcome = 'skipped';
    result.execution.skippedReason = 'execution engine does not support this capability yet';
    return result;
  }

  const commandResult = executeCommand(action.command, action.cwd, maxCommandSeconds);
  result.execution.mode = 'execute';
  result.execution.attempted = true;
  result.execution.outcome = commandResult.success ? 'success' : 'failed';
  result.execution.status = commandResult.status;
  result.execution.timing = {
    startedAt: commandResult.startedAt,
    finishedAt: commandResult.finishedAt,
    durationMs: commandResult.durationMs,
  };
  result.execution.exitCode = commandResult.exitCode;
  result.execution.signal = commandResult.signal;
  result.execution.timedOut = commandResult.timedOut;
  result.execution.stdout = commandResult.stdout;
  result.execution.stderr = commandResult.stderr;

  return result;
}

function supportsShellExecution(action) {
  const caps = new Set((action.capabilities || []).map((item) => String(item).toLowerCase()));
  if (caps.has('write') || caps.has('deploy') || caps.has('model') || caps.has('data')) return false;
  return true;
}

function executeCommand(command, cwd, maxSeconds) {
  const shell = process.platform === 'win32' ? 'cmd' : 'bash';
  const shellArg = process.platform === 'win32' ? '/c' : '-lc';
  const args = [shellArg, command];
  const startedAt = new Date().toISOString();
  const start = Date.now();

  try {
    const result = spawnSync(shell, args, {
      cwd,
      encoding: 'utf8',
      shell: false,
      timeout: Math.max(1000, Math.floor(maxSeconds * 1000)),
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const exitCode = Number.isInteger(result.status) ? result.status : -1;
    const success = exitCode === 0;

    return {
      status: success ? 'executed' : 'failed',
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      exitCode,
      signal: result.signal || null,
      timedOut: result.signal === 'SIGTERM',
      stdout: redactText(trimText(result.stdout || '')),
      stderr: redactText(trimText(result.stderr || '')),
      success,
    };
  } catch (error) {
    return {
      status: 'failed-to-run',
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      exitCode: -1,
      signal: String(error?.code || 'ERR_EXECUTE'),
      timedOut: String(error?.message || '').includes('timed out'),
      stdout: '',
      stderr: redactText(error?.message || 'command execution error'),
      success: false,
    };
  }
}

function makeDryRunResult(action, canRun, hasExplicitApproval) {
  return {
    id: action.id,
    intent: action.intent,
    decision: action.decision,
    path: action.path,
    command: action.command,
    capabilitySummary: [...new Set(action.capabilities || [])].sort().join(', ') || 'none',
    execution: {
      mode: 'dry-run',
      status: action.blocked
        ? 'blocked'
        : action.decision === 'allow'
          ? 'ready-for-review'
          : canRun && hasExplicitApproval
            ? 'approved-dry-run'
            : action.requiresApproval
              ? 'awaiting-approval'
              : action.executionStatus,
      ready: canRun && action.decision !== 'deny',
      attempted: false,
      blocked: action.blocked,
      approved: hasExplicitApproval,
      outcome: 'not-run',
      skippedReason: action.blocked ? 'policy blocked' : 'dry-run mode',
    },
    risk: action.risk,
  };
}

function trimText(value) {
  const text = String(value);
  return text.length > 16000 ? `${text.slice(0, 16000)}\n[truncated]` : text;
}

function redactText(candidate) {
  if (!redactEnabled) {
    return String(candidate);
  }

  return redactSecretText(candidate);
}

function normalizeIds(values = []) {
  return [...new Set(values.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];
}

function renderMarkdown(report) {
  const lines = [
    '# SEIS Action Execution Run',
    '',
    `Generated: ${report.generatedAt}`,
    `Contract: ${report.policy.contractId} (${report.policy.contractVersion})`,
    `Run Mode: ${report.runMode}`,
    `Source Plan: ${report.planSource}`,
    '',
    `Total: ${report.summary.total} | Executed: ${report.summary.executed} | Skipped: ${report.summary.skipped} | Failed: ${report.summary.failed} | Blocked: ${report.summary.blocked}`,
    '',
    '| id | intent | decision | status | outcome | exitCode | reason |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const action of report.actions) {
    const reason = action.execution.skippedReason || '';
    lines.push(
      `| ${action.id} | ${action.intent} | ${action.decision} | ${action.execution.status} | ${
        action.execution.outcome
      } | ${action.execution.exitCode ?? ''} | ${String(reason).replace(/\|/g, '│')} |`,
    );
  }

  lines.push('');
  if (report.critic) {
    lines.push('## Eval Critic Advisory');
    lines.push(`- Model: ${report.critic.modelId}`);
    lines.push(`- Decision: ${report.critic.decision}`);
    lines.push(`- Safety floor: ${report.critic.safetyDecision}`);
    lines.push(`- Reasons: ${report.critic.reasons.join('; ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

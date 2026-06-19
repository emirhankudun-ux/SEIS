#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { containsSecretMaterial } from '../packages/seis-ai/src/lib/redaction.mjs';

const ROOT = process.cwd();
const failures = [];

const args = parseArgs(process.argv.slice(2));
const workspace = resolveWorkspace(args.workspace);

const contractPath = path.join(ROOT, 'content', 'development', 'seis-action-execution-contract.json');
const inspectScriptPath = path.join(ROOT, 'scripts', 'inspect-seis-action-execution.mjs');
const executeScriptPath = path.join(ROOT, 'scripts', 'execute-seis-action-execution.mjs');
const modelPath = path.join(ROOT, 'packages', 'seis-ai', 'models', 'permission-policy-seed-v0.json');
const workspaceReportDir = path.join(workspace, 'reports', 'seis-action-execution');
const workspaceReportJson = path.join(workspaceReportDir, 'latest.json');
const workspaceReportMd = path.join(workspaceReportDir, 'latest.md');
const workspaceRunReportJson = path.join(workspaceReportDir, 'latest-run.json');
const workspaceRunReportMd = path.join(workspaceReportDir, 'latest-run.md');

ensureFileExists(contractPath, 'action execution contract');
ensureFileExists(inspectScriptPath, 'action execution inspector');
ensureFileExists(executeScriptPath, 'action execution runner');

const contract = readJson(contractPath);
if (!contract) {
  failures.push('action execution contract must be valid JSON');
}

if (contract) {
  ensure(contract.id === 'seis-action-execution-lane', 'contract id must be seis-action-execution-lane');
  ensure(contract.qualityGate === 'npm run check:seis-action-execution', 'qualityGate must be npm run check:seis-action-execution');
  ensure(contract.defaultDecision === 'gate', 'defaultDecision should be gate for execution lane safety');
}

const tempWorkspace = mkdtempSync(path.join(os.tmpdir(), 'seis-action-execution-'));
const tempInput = path.join(tempWorkspace, 'sample-actions.json');
writeSampleInput(tempInput);

runInspector('deterministic', null, workspaceReportJson, workspaceReportMd);
validateReport(readJson(workspaceReportJson), path.basename(workspaceReportJson), contract, workspaceReportDir, false);
runExecutionDryRun(workspaceReportJson, workspaceRunReportJson, workspaceRunReportMd);

if (existsSync(workspaceRunReportJson)) {
  ensureFileExists(workspaceRunReportMd, 'action execution run markdown report');
  const runReport = readJson(workspaceRunReportJson);
  validateExecutionRun(runReport, path.basename(workspaceRunReportJson), contract);
  const runMarkdown = readText(workspaceRunReportMd);
  ensure(
    runMarkdown.includes('# SEIS Action Execution Run'),
    'execution run markdown report missing title',
  );
  ensure(runMarkdown.includes('## Agent Router Advisory'), 'execution run markdown report missing agent router advisory');
  ensure(runMarkdown.includes('## Eval Critic Advisory'), 'execution run markdown report missing eval critic advisory');
}

if (existsSync(modelPath)) {
  const learnedJson = path.join(workspaceReportDir, 'latest-learned.json');
  const learnedMd = path.join(workspaceReportDir, 'latest-learned.md');
  runInspector('learned', modelPath, learnedJson, learnedMd);
  validateReport(readJson(learnedJson), path.basename(learnedJson), contract, workspaceReportDir, true);
  const learnedReport = readJson(learnedJson);
  if (learnedReport?.policy?.modelArtifact) {
    ensure(Boolean(learnedReport.policy.modelArtifact.modelId), 'learned report must include modelId');
  }
}

if (existsSync(workspaceReportJson)) {
  const markdown = readText(workspaceReportMd);
  ensure(markdown.includes('# SEIS Action Execution Plan'), 'markdown report missing title');
  ensure(markdown.includes('| id | intent | decision | risk | execution | approval | status | reasons |'), 'markdown table header missing');
  ensure(markdown.includes('## Agent Router Advisory'), 'execution markdown report missing agent router advisory');
  ensure(markdown.includes('## Eval Critic Advisory'), 'execution markdown report missing eval critic advisory');
}

if (failures.length > 0) {
  console.error('SEIS action execution check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  cleanupTemp(tempWorkspace);
  process.exit(1);
}

console.log('SEIS action execution check passed.');
console.log(JSON.stringify({
  workspace,
  contract: contract?.id,
  checks: ['deterministic', existsSync(modelPath) ? 'learned' : 'skipped'],
  artifact: contract?.requiredArtifacts?.includes('reports/seis-action-execution/latest.json')
    ? 'contract-required artifacts present'
    : 'contract-required artifacts not declared',
}, null, 2));

cleanupTemp(tempWorkspace);

function runInspector(mode, model, jsonOut, mdOut) {
  const args = [
    inspectScriptPath,
    '--workspace',
    workspace,
    '--input',
    tempInput,
    '--json-out',
    jsonOut,
    '--md-out',
    mdOut,
    '--mode',
    mode,
  ];

  if (mode === 'learned' && model) {
    args.push('--model', model);
  }

  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 60000,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
    },
  });

  if (result.status !== 0) {
    failures.push(`action execution inspector failed in ${mode} mode: ${String(result.stderr || result.stdout || '').trim()}`);
    return;
  }

  ensureFileExists(jsonOut, `action execution ${mode} JSON report`);
  ensureFileExists(mdOut, `action execution ${mode} markdown report`);
}

function runExecutionDryRun(planJson, runJsonOut, runMdOut) {
  const result = spawnSync(process.execPath, [
    executeScriptPath,
    '--workspace',
    workspace,
    '--plan',
    planJson,
    '--json-out',
    runJsonOut,
    '--md-out',
    runMdOut,
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 60000,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
    },
  });

  if (result.status !== 0) {
    failures.push(`action execution dry-run runner failed: ${String(result.stderr || result.stdout || '').trim()}`);
    return;
  }

  ensureFileExists(runJsonOut, 'action execution run JSON report');
  ensureFileExists(runMdOut, 'action execution run markdown report');
}

function validateReport(report, fileName, contractValue, reportDir, requireModelChecks) {
  ensure(typeof report === 'object' && report !== null, `${fileName}: report must be valid JSON`);
  if (!report) return;

  ensure(report.generatedAt && !Number.isNaN(Date.parse(report.generatedAt)), `${fileName}: invalid generatedAt`);
  ensure(report.mode === (requireModelChecks ? 'learned' : report.mode), `${fileName}: mode present`);
  ensure(report.policy?.contractId === (contractValue?.id || 'seis-action-execution-lane'), `${fileName}: contractId mismatch`);
  validateRouteModel(report.policy?.routeModel, fileName);
  validateCritic(report.critic, fileName);
  ensure(Array.isArray(report.plan), `${fileName}: plan must be an array`);
  ensure(report.plan.length > 0, `${fileName}: plan should contain actions`);

  const allowedDecisions = new Set(['allow', 'gate', 'approval_required', 'deny']);
  const allowedStatuses = new Set(['ready-for-review', 'blocked', 'awaiting-approval', 'approved-dry-run', 'requires-gate-approval', 'auto-approved']);

  let allow = 0;
  let gate = 0;
  let approval = 0;
  let deny = 0;
  let blocked = 0;
  let awaiting = 0;
  let ready = 0;

  for (const entry of report.plan) {
    ensure(typeof entry.id === 'string' && entry.id.length > 0, `${fileName}: action id required`);
    ensure(typeof entry.intent === 'string', `${fileName}: action intent required`);
    ensure(Array.isArray(entry.capabilities), `${fileName}: capabilities required`);
    ensure(allowedDecisions.has(entry.decision), `${fileName}: invalid decision ${entry.decision}`);
    ensure(entry.execution && typeof entry.execution === 'object', `${fileName}: execution envelope required`);
    ensure(typeof entry.execution.mode === 'string', `${fileName}: execution mode required`);
    ensure(allowedStatuses.has(entry.execution.status), `${fileName}: invalid execution status ${entry.execution.status}`);
    ensure(typeof entry.risk === 'string' && entry.risk.length > 0, `${fileName}: risk required`);
    validateRoute(entry.route, fileName, entry.id);

    if (entry.decision === 'allow') {
      allow += 1;
      ensure(!entry.blocked, `${fileName}: allow decisions should not be blocked`);
      ensure(!entry.requiresApproval, `${fileName}: allow should not require approval`);
    }
    if (entry.decision === 'gate') {
      gate += 1;
      ensure(entry.requiresApproval, `${fileName}: gate decisions must require approval`);
      ensure(entry.execution.status !== 'blocked', `${fileName}: gate decisions should not be blocked`);
    }
    if (entry.decision === 'approval_required') {
      approval += 1;
      ensure(entry.requiresApproval, `${fileName}: approval_required decisions must require approval`);
      ensure(entry.requiresExplicitApproval, `${fileName}: approval_required must be explicit`);
    }
    if (entry.decision === 'deny') {
      deny += 1;
      ensure(!entry.requiresApproval, `${fileName}: deny should not require approval`);
    }

    if (entry.blocked) {
      blocked += 1;
      ensure(entry.execution.status === 'blocked', `${fileName}: blocked items must have blocked status`);
    }
    if (entry.execution.status === 'awaiting-approval') {
      awaiting += 1;
      ensure(entry.requiresApproval, `${fileName}: awaiting approval must require approval`);
    }
    if (entry.execution.ready) {
      ready += 1;
    }

    const reportContent = `${entry.intent} ${entry.summary || ''} ${entry.command || ''}`;
    ensure(
      !containsSecretMaterial(reportContent, { includeLongTokens: false }),
      `${fileName}: report content should not include secret-like values`,
    );
  }

  ensure(report.summary.total === report.plan.length, `${fileName}: summary.total must equal plan length`);
  ensure(report.summary.byDecision.allow === allow, `${fileName}: byDecision allow mismatch`);
  ensure(report.summary.byDecision.gate === gate, `${fileName}: byDecision gate mismatch`);
  ensure(report.summary.byDecision.approval_required === approval, `${fileName}: byDecision approval_required mismatch`);
  ensure(report.summary.byDecision.deny === deny, `${fileName}: byDecision deny mismatch`);
  ensure(report.summary.blockedCount === blocked, `${fileName}: blockedCount mismatch`);
  ensure(report.summary.awaitingApprovalCount === awaiting, `${fileName}: awaitingApprovalCount mismatch`);
  ensure(report.summary.readyToExecuteCount === ready, `${fileName}: readyToExecuteCount mismatch`);

  if (contractValue?.requiredEvidence?.length) {
    for (const evidenceFile of contractValue.requiredEvidence) {
      ensure(
        existsSync(path.join(workspace, evidenceFile)),
        `${fileName}: required evidence missing: ${evidenceFile}`,
      );
      const evidenceText = readText(path.join(workspace, evidenceFile));
      ensure(evidenceText.length > 0, `${fileName}: required evidence file must not be empty: ${evidenceFile}`);
    }
  }

  if (requireModelChecks) {
    ensure(report.mode === 'learned', `${fileName}: learned check must be in learned mode`);
    ensure(Array.isArray(report.plan), `${fileName}: learned plan required`);
  }

  for (const artifact of contractValue?.requiredArtifacts || []) {
    if (!artifact.endsWith('.json') && !artifact.endsWith('.md')) {
      continue;
    }
    ensure(
      existsSync(path.join(workspace, artifact)),
      `${fileName}: contract required artifact missing: ${artifact}`,
    );
  }
}

function validateCritic(critic, fileName) {
  ensure(critic && typeof critic === 'object', `${fileName}: eval critic advisory required`);
  if (!critic || typeof critic !== 'object') return;

  ensure(critic.modelId === 'seis-eval-critic-seed-v0', `${fileName}: eval critic modelId mismatch`);
  ensure(['pass', 'revise', 'block'].includes(critic.decision), `${fileName}: invalid eval critic decision`);
  ensure(['pass', 'revise', 'block'].includes(critic.learnedDecision), `${fileName}: invalid eval critic learnedDecision`);
  ensure(['pass', 'revise', 'block'].includes(critic.safetyDecision), `${fileName}: invalid eval critic safetyDecision`);
  ensure(Array.isArray(critic.reasons) && critic.reasons.length > 0, `${fileName}: eval critic reasons required`);
  ensure(critic.decision !== 'block', `${fileName}: eval critic must not block generated execution plan`);
  ensure(
    Array.isArray(critic.review?.evidence) && critic.review.evidence.includes('scripts/inspect-seis-action-execution.mjs'),
    `${fileName}: eval critic review must cite execution inspector evidence`,
  );
  ensure(
    Array.isArray(critic.review?.validation) && critic.review.validation.some((item) => item.status === 'passed'),
    `${fileName}: eval critic review must include passed validation evidence`,
  );
}

function validateRouteModel(routeModel, fileName) {
  ensure(routeModel && typeof routeModel === 'object', `${fileName}: route model advisory required`);
  if (!routeModel || typeof routeModel !== 'object') return;
  ensure(routeModel.modelId === 'seis-agent-router-seed-v0', `${fileName}: route model id mismatch`);
}

function validateRoute(route, fileName, actionId) {
  ensure(route && typeof route === 'object', `${fileName}: route required for ${actionId}`);
  if (!route || typeof route !== 'object') return;

  const allowedLanes = new Set([
    'seis',
    'seis-governance',
    'seis-cloud',
    'seis-code',
    'seis-design',
    'seis-data',
  ]);

  ensure(route.modelId === 'seis-agent-router-seed-v0', `${fileName}: route model id mismatch for ${actionId}`);
  ensure(allowedLanes.has(route.laneId), `${fileName}: invalid route lane for ${actionId}`);
  ensure(route.toolName === 'seis_plugin_integration', `${fileName}: route tool mismatch for ${actionId}`);
  ensure(typeof route.defaultGate === 'string' && route.defaultGate.startsWith('npm run '), `${fileName}: route gate required for ${actionId}`);
  ensure(Array.isArray(route.reasons) && route.reasons.length > 0, `${fileName}: route reasons required for ${actionId}`);
}

function validateExecutionRun(report, fileName, contractValue) {
  ensure(typeof report === 'object' && report !== null, `${fileName}: execution run report must be valid JSON`);
  if (!report) return;

  ensure(report.policy?.contractId === (contractValue?.id || 'seis-action-execution-lane'), `${fileName}: execution run contractId mismatch`);
  validateRunCritic(report.critic, fileName);
  ensure(Array.isArray(report.actions), `${fileName}: execution run actions array required`);
  ensure(report.summary && typeof report.summary.total === 'number', `${fileName}: execution run summary.total required`);
  ensure(typeof report.runMode === 'string' && report.runMode.length > 0, `${fileName}: runMode required`);

  let attempted = 0;
  let failed = 0;
  for (const action of report.actions) {
    ensure(typeof action.id === 'string' && action.id.length > 0, `${fileName}: execution action id required`);
    ensure(action.execution && typeof action.execution === 'object', `${fileName}: execution action.execution required`);
    validateRoute(action.route, fileName, action.id);
    if (action.execution.attempted) {
      attempted += 1;
    }
    if (action.execution.outcome === 'failed') {
      failed += 1;
    }
    const runOutput = `${action.intent || ''} ${action.summary || ''} ${action.command || ''} ${action.execution.stdout || ''}`;
    ensure(
      !containsSecretMaterial(runOutput, { includeLongTokens: false }),
      `${fileName}: execution run should redact secrets`,
    );
  }

  ensure(report.summary.executed === attempted, `${fileName}: execution summary executed mismatch`);
  ensure(report.summary.failed === failed, `${fileName}: execution summary failed mismatch`);
}

function validateRunCritic(critic, fileName) {
  ensure(critic && typeof critic === 'object', `${fileName}: eval critic advisory required`);
  if (!critic || typeof critic !== 'object') return;

  ensure(critic.modelId === 'seis-eval-critic-seed-v0', `${fileName}: eval critic modelId mismatch`);
  ensure(['pass', 'revise', 'block'].includes(critic.decision), `${fileName}: invalid eval critic decision`);
  ensure(['pass', 'revise', 'block'].includes(critic.learnedDecision), `${fileName}: invalid eval critic learnedDecision`);
  ensure(['pass', 'revise', 'block'].includes(critic.safetyDecision), `${fileName}: invalid eval critic safetyDecision`);
  ensure(Array.isArray(critic.reasons) && critic.reasons.length > 0, `${fileName}: eval critic reasons required`);
  ensure(critic.decision !== 'block', `${fileName}: eval critic must not block generated execution run report`);
  ensure(
    Array.isArray(critic.review?.evidence) && critic.review.evidence.includes('scripts/execute-seis-action-execution.mjs'),
    `${fileName}: eval critic review must cite execution runner evidence`,
  );
  ensure(
    Array.isArray(critic.review?.validation) && critic.review.validation.some((item) => item.status === 'passed'),
    `${fileName}: eval critic review must include passed validation evidence`,
  );
}

function writeSampleInput(targetPath) {
  const sample = {
    scope: 'local-repo',
    actions: [
      {
        id: 'action-read',
        intent: 'Inspect repo status',
        summary: 'Collect read-only signals only',
        capabilities: ['read', 'status'],
        command: 'git status --short',
        path: '.',
      },
      {
        id: 'action-write',
        intent: 'Draft governance note',
        summary: 'Create a local draft note in docs for this run',
        capabilities: ['write'],
        path: 'docs/seis-action-execution-sample.md',
      },
      {
        id: 'action-gate',
        intent: 'Run deterministic checks',
        summary: 'Run a read-only validation command',
        command: 'npm run check:seis-action-decision',
        capabilities: ['shell'],
      },
      {
        id: 'action-deploy',
        intent: 'Publish candidate',
        summary: 'Publish operation requiring explicit approval',
        capabilities: ['deploy', 'network'],
        command: 'npm run quality:governance',
        externalWrite: true,
      },
      {
        id: 'action-secret',
        intent: 'Expose credential sample',
        summary: 'api_key sample sk-abc123def456ghi789jkl0',
        capabilities: ['secret'],
      },
    ],
  };
  writeFileSync(targetPath, `${JSON.stringify(sample, null, 2)}\n`, 'utf8');
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--workspace') {
      out.workspace = next;
      i += 1;
    }
  }
  return out;
}

function resolveWorkspace(candidate) {
  return candidate ? path.resolve(ROOT, candidate) : ROOT;
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureFileExists(filePath, label) {
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${path.relative(ROOT, filePath)}`);
  }
}

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`${path.relative(ROOT, filePath)} is invalid JSON: ${error.message}`);
    return null;
  }
}

function readText(filePath) {
  if (!existsSync(filePath)) return '';
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    failures.push(`${path.relative(ROOT, filePath)} could not be read: ${error.message}`);
    return '';
  }
}

function cleanupTemp(tempDir) {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // best effort cleanup
  }
}

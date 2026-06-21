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

const contractPath = path.join(ROOT, 'content', 'development', 'seis-action-decision-contract.json');
const inspectScriptPath = path.join(ROOT, 'scripts', 'inspect-seis-action-decision.mjs');
const modelPath = path.join(
  ROOT,
  'packages',
  'seis-ai',
  'models',
  'permission-policy-seed-v0.json',
);

ensureFileExists(contractPath, 'action decision contract');
ensureFileExists(inspectScriptPath, 'action decision inspector');

const contract = readJson(contractPath);
if (!contract) {
  failures.push('action decision contract must be valid JSON');
}

if (contract) {
  ensure(contract.id === 'seis-action-decision-kernel', 'contract id must be seis-action-decision-kernel');
  ensure(
    contract.qualityGate === 'npm run check:seis-action-decision',
    'contract qualityGate must reference npm run check:seis-action-decision',
  );
  ensure(contract.defaultDecision === 'read-only', 'contract defaultDecision must be read-only');
}

const workspaceReportDir = path.join(workspace, 'reports', 'seis-action-decisions');
const workspaceReportJson = path.join(workspaceReportDir, 'latest.json');
const workspaceReportMd = path.join(workspaceReportDir, 'latest.md');

const tempWorkspace = mkdtempSync(path.join(os.tmpdir(), 'seis-action-decision-'));
const tempInput = path.join(tempWorkspace, 'sample-actions.json');
writeSampleInput(tempInput);

runInspector('deterministic', null, workspaceReportJson, workspaceReportMd);
validateLatestReport(readJson(workspaceReportJson), path.basename(workspaceReportJson), contract, 'deterministic');

if (existsSync(modelPath)) {
  const learnedJson = path.join(workspaceReportDir, 'latest-learned.json');
  const learnedMd = path.join(workspaceReportDir, 'latest-learned.md');
  runInspector('learned', modelPath, learnedJson, learnedMd);
  const learnedReport = readJson(learnedJson);
  validateLatestReport(learnedReport, path.basename(learnedJson), contract, 'learned');

  if (learnedReport && learnedReport.policy.modelArtifact) {
    ensure(Boolean(learnedReport.policy.modelArtifact.modelId), 'learned report must include modelId');
  }
}

if (existsSync(workspaceReportJson)) {
  const markdown = readText(workspaceReportMd);
  ensure(
    markdown.includes('# SEIS Action Decision Report'),
    'deterministic markdown report must include title',
  );
  ensure(markdown.includes('| id | intent | decision | risk | approval | source | reasons |'), 'decision table header missing');
  ensure(markdown.includes('## Agent Router Advisory'), 'decision markdown report missing agent router advisory');
  ensure(markdown.includes('## Eval Critic Advisory'), 'decision markdown report missing eval critic advisory');
}

if (failures.length > 0) {
  console.error('SEIS action decision check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS action decision check passed.');
console.log(JSON.stringify({
  workspace,
  contract: contract?.id,
  checks: ['deterministic', existsSync(modelPath) ? 'learned' : 'skipped'],
  artifact: contract?.requiredArtifacts?.includes('reports/seis-action-decisions/latest.json')
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
  ];

  args.push('--mode', mode);

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
    failures.push(`action decision inspector failed in ${mode} mode: ${String(result.stderr || result.stdout || '').trim()}`);
    return;
  }

  ensureFileExists(jsonOut, `action decision ${mode} JSON report`);
  ensureFileExists(mdOut, `action decision ${mode} markdown report`);
}

function validateLatestReport(report, fileName, contractValue, mode) {
  ensure(typeof report === 'object' && report !== null, `${fileName} must be valid JSON`);
  if (!report) {
    return;
  }

  ensure(report.generatedAt && !Number.isNaN(Date.parse(report.generatedAt)), `${fileName}: invalid generatedAt`);
  ensure(report.mode === mode, `${fileName}: mode should be ${mode}`);

  ensure(report.scope && typeof report.scope.workspace === 'string', `${fileName}: scope.workspace required`);
  ensure(report.scope.workspace.length > 0, `${fileName}: scope.workspace must not be empty`);

  ensure(
    report.policy?.contractId === (contractValue?.id || 'seis-action-decision-kernel'),
    `${fileName}: contractId must match action decision contract`,
  );
  validateRouteModel(report.policy?.routeModel, fileName);
  validateCritic(report.critic, fileName);

  ensure(Array.isArray(report.decisions), `${fileName}: decisions must be an array`);
  ensure(report.decisions.length > 0, `${fileName}: at least one decision expected`);

  const allowedDecisions = new Set(['allow', 'gate', 'approval_required', 'deny']);
  let allow = 0;
  let gate = 0;
  let approval = 0;
  let deny = 0;

  for (const decision of report.decisions) {
    ensure(typeof decision.id === 'string' && decision.id.length > 0, `${fileName}: decision id required`);
    ensure(typeof decision.intent === 'string', `${fileName}: decision intent required`);
    ensure(Array.isArray(decision.capabilities), `${fileName}: decision capabilities array required`);
    validateRoute(decision.route, fileName, decision.id);
    ensure(allowedDecisions.has(decision.decision), `${fileName}: invalid decision ${decision.decision}`);
    ensure(['deterministic', 'model+policy'].includes(decision.decisionSource), `${fileName}: invalid decisionSource`);

    if (mode === 'learned') {
      if (decision.decisionSource === 'model+policy') {
        ensure(typeof decision.learnedDecision === 'string', `${fileName}: learnedDecision required when mode is model+policy`);
      }

      if (typeof decision.safetyAdjusted === 'boolean' && decision.safetyAdjusted) {
        ensure(
          decision.decision !== decision.learnedDecision,
          `${fileName}: safetyAdjusted implies model/decision mismatch`,
        );
      }
    }

    if (decision.decision === 'allow') {
      allow += 1;
      ensure(!decision.blocked, `${fileName}: allow decisions must not be blocked`);
      ensure(!decision.requiresApproval, `${fileName}: allow decisions must not require approval`);
    }

    if (decision.decision === 'gate') {
      gate += 1;
      ensure(decision.requiresApproval, `${fileName}: gate decisions must require approval`);
    }

    if (decision.decision === 'approval_required') {
      approval += 1;
      ensure(decision.requiresApproval, `${fileName}: approval_required decisions must require approval`);
      ensure(decision.requiresExplicitApproval, `${fileName}: approval_required decisions must require explicit approval`);
    }

    if (decision.decision === 'deny') {
      deny += 1;
      ensure(!decision.requiresApproval, `${fileName}: deny should not require approval`);
    }

    const reportContent = `${decision.intent} ${decision.summary} ${decision.command}`;
    ensure(!containsSecretMaterial(reportContent, { includeLongTokens: false }), `${fileName}: secret-like values must be redacted`);
    ensure(
      String(decision.id).length > 0,
      `${fileName}: decision id is required and should not be empty`,
    );
  }

  ensure(report.summary.total === report.decisions.length, `${fileName}: summary.total must match decision count`);
  ensure(report.summary.byDecision.allow === allow, `${fileName}: summary byDecision mismatch for allow`);
  ensure(report.summary.byDecision.gate === gate, `${fileName}: summary byDecision mismatch for gate`);
  ensure(
    report.summary.byDecision.approval_required === approval,
    `${fileName}: summary byDecision mismatch for approval_required`,
  );
  ensure(report.summary.byDecision.deny === deny, `${fileName}: summary byDecision mismatch for deny`);

  if (contractValue?.requiredArtifacts?.length) {
    for (const artifact of contractValue.requiredArtifacts) {
      if (artifact.endsWith('.json') || artifact.endsWith('.md')) {
        const absolutePath = path.join(workspace, artifact);
        ensure(
          existsSync(absolutePath),
          `${fileName}: required artifact declared in contract must exist: ${artifact}`,
        );
      }
    }
  }

  if (contractValue?.requiredEvidence?.length) {
    for (const evidence of contractValue.requiredEvidence) {
      const hasEvidence = existsSync(path.join(workspace, evidence));
      ensure(hasEvidence, `${fileName}: required evidence file missing: ${evidence}`);
    }
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
  ensure(critic.decision !== 'block', `${fileName}: eval critic must not block generated decision report`);
  ensure(
    Array.isArray(critic.review?.evidence) && critic.review.evidence.includes('scripts/inspect-seis-action-decision.mjs'),
    `${fileName}: eval critic review must cite decision inspector evidence`,
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
    'seis-security',
    'seis-research',
    'seis-automation',
    'seis-product',
  ]);

  ensure(route.modelId === 'seis-agent-router-seed-v0', `${fileName}: route model id mismatch for ${actionId}`);
  ensure(allowedLanes.has(route.laneId), `${fileName}: invalid route lane for ${actionId}`);
  ensure(route.toolName === 'seis_plugin_integration', `${fileName}: route tool mismatch for ${actionId}`);
  ensure(typeof route.defaultGate === 'string' && route.defaultGate.startsWith('npm run '), `${fileName}: route gate required for ${actionId}`);
  ensure(Array.isArray(route.reasons) && route.reasons.length > 0, `${fileName}: route reasons required for ${actionId}`);
}

function writeSampleInput(targetPath) {
  const sample = {
    scope: 'local-repo',
    actions: [
      {
        id: 'action-read',
        intent: 'Inspect repository status',
        summary: 'Collect read-only project health signals',
        capabilities: ['read', 'status'],
        command: 'git status --short',
        path: '.',
      },
      {
        id: 'action-write',
        intent: 'Update governance note',
        summary: 'Safe draft update in local branch',
        capabilities: ['write'],
        path: 'docs/seis-action-decision-check-notes.md',
      },
      {
        id: 'action-shell',
        intent: 'Run deterministic quality check',
        summary: 'Run a read-only validation command',
        command: 'npm run check:seis-project-intake',
        capabilities: ['shell'],
      },
      {
        id: 'action-deploy',
        intent: 'Publish candidate package',
        summary: 'Model release workflow (gated action)',
        capabilities: ['deploy', 'network'],
        command: 'npm run quality:governance',
        externalWrite: true,
      },
      {
        id: 'action-secret',
        intent: 'Expose credential sample',
        summary: `api_key sample ${['sk', 'abc123def456ghi789jkl0'].join('-')}`,
        capabilities: ['secret'],
      },
    ],
  };

  writeFileSync(targetPath, `${JSON.stringify(sample, null, 2)}\n`, 'utf8');
}

function cleanupTemp(tempDir) {
  try {
    rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // best effort cleanup
  }
}

function resolveWorkspace(candidate) {
  return candidate ? path.resolve(ROOT, candidate) : ROOT;
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

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function ensureFileExists(filePath, label) {
  if (!existsSync(filePath)) {
    failures.push(`missing ${label}: ${path.relative(ROOT, filePath)}`);
  }
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readText(filePath) {
  if (!existsSync(filePath)) {
    return '';
  }

  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

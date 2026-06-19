#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ROOT = process.cwd();
const failures = [];

const args = parseArgs(process.argv.slice(2));
const workspace = resolveWorkspace(args.workspace);
const contractPath = path.join(workspace, 'content', 'development', 'seis-project-intake-contract.json');
const inspectScriptPath = path.join(ROOT, 'scripts', 'inspect-seis-project-intake.mjs');

const reportJsonPath = path.resolve(workspace, args.jsonOut || path.join('reports', 'seis-project-intake', 'latest.json'));
const reportMdPath = path.resolve(workspace, args.mdOut || path.join('reports', 'seis-project-intake', 'latest.md'));

ensureFileExists(contractPath, 'SEIS project intake contract');
ensureFileExists(inspectScriptPath, 'intake inspection script');

const contract = readJson(contractPath);
if (contract && contract.intakeRequiredFields && !Array.isArray(contract.intakeRequiredFields)) {
  failures.push('seis-project-intake-contract must define intakeRequiredFields as an array');
}
if (contract && contract.reportShape?.topLevelKeys && !Array.isArray(contract.reportShape.topLevelKeys)) {
  failures.push('seis-project-intake-contract must define reportShape.topLevelKeys as an array');
}

const inspectRun = spawnSync(process.execPath, [inspectScriptPath, '--workspace', workspace, '--json-out', reportJsonPath, '--md-out', reportMdPath], {
  cwd: ROOT,
  encoding: 'utf8',
  timeout: 60000,
  env: {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
  },
});

if (inspectRun.status !== 0) {
  failures.push(`intake inspector failed: ${String(inspectRun.stderr || inspectRun.stdout || '').trim()}`);
}

ensureFileExists(reportJsonPath, 'intake JSON report');
ensureFileExists(reportMdPath, 'intake markdown report');

if (isFile(reportJsonPath)) {
  const report = readJson(reportJsonPath);
  if (!report) {
    failures.push('intake JSON report is not valid JSON');
  } else {
    validateReport(report, contract);
  }
}

if (!isFile(reportMdPath)) {
  failures.push('intake markdown report could not be generated');
} else {
  const markdown = readText(reportMdPath);
  if (!markdown.includes('# SEIS Project Intake Report')) {
    failures.push('intake markdown report must include title');
  }
}

if (failures.length > 0) {
  console.error('SEIS project intake check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS project intake check passed.');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--workspace') {
      out.workspace = next;
      i += 1;
    } else if (arg === '--json-out') {
      out.jsonOut = next;
      i += 1;
    } else if (arg === '--md-out') {
      out.mdOut = next;
      i += 1;
    }
  }
  return out;
}

function resolveWorkspace(candidate) {
  const resolved = candidate ? path.resolve(ROOT, candidate) : ROOT;
  if (!existsSync(resolved)) {
    throw new Error(`workspace does not exist: ${candidate}`);
  }
  return resolved;
}

function validateReport(report, contract) {
  const expectedKeys = contract?.reportShape?.topLevelKeys || [
    'generatedAt',
    'repository',
    'intake',
    'technology',
    'capabilityModel',
    'warnings',
  ];
  const requiredIntakeFields = contract?.intakeRequiredFields || ['workspaceRoot', 'isGitRepo', 'hasAgents', 'instructionFiles', 'commandPolicy'];

  ensure(isNonEmptyString(report.generatedAt), 'report must include generatedAt');
  ensure(isIsoDate(report.generatedAt), 'generatedAt must be ISO-8601');

  for (const key of expectedKeys) {
    ensure(key in report, `report missing top-level key: ${key}`);
  }

  ensure(Boolean(report.repository), 'report must include repository section');
  ensure(typeof report.repository.workspaceRoot === 'string', 'repository.workspaceRoot must be string');
  ensure(typeof report.repository.isGitRepo === 'boolean', 'repository.isGitRepo must be boolean');
  ensure(typeof report.repository.worktreeClean === 'boolean', 'repository.worktreeClean must be boolean');

  ensure(Array.isArray(report.intake?.instructionFiles), 'intake.instructionFiles must be an array');
  for (const field of requiredIntakeFields) {
    ensure(field in report.intake, `intake missing required field: ${field}`);
  }

  ensure(typeof report.intake.commandPolicy?.default === 'string', 'intake.commandPolicy.default must be a string');
  ensure(Array.isArray(report.intake.commandPolicy?.scopedActions), 'intake.commandPolicy.scopedActions must be an array');
  const scopedCapabilities = new Set((report.intake.commandPolicy.scopedActions || []).map((item) => item?.capability));
  ensure(scopedCapabilities.has('read'), 'intake command policy must include read capability');
  ensure(scopedCapabilities.has('write'), 'intake command policy must include write capability');
  ensure(scopedCapabilities.has('shell'), 'intake command policy must include shell capability');
  ensure(scopedCapabilities.has('network'), 'intake command policy must include network capability');
  ensure(scopedCapabilities.has('secret'), 'intake command policy must include secret capability');
  ensure(report.intake.commandPolicy.default === 'read-only', 'intake command policy default must stay read-only for phase-2');

  ensure(report.capabilityModel?.policyId, 'capabilityModel.policyId is required');
  ensure(typeof report.capabilityModel?.secretExposedFiles === 'number', 'capabilityModel.secretExposedFiles must be number');

  ensure(Array.isArray(report.warnings), 'warnings must be an array');
  ensure(isFile(reportJsonPath), 'JSON report path must point to a file');

  const staleThresholdMs = 36 * 60 * 60 * 1000;
  const generatedTime = Date.parse(report.generatedAt);
  if (Number.isFinite(generatedTime)) {
    ensure(Date.now() - generatedTime < staleThresholdMs, 'generatedAt must be within the last 36h');
  }

  const requiredArtifacts = contract?.requiredArtifacts || [];
  for (const artifact of requiredArtifacts) {
    if (!artifact.endsWith('.json') && !artifact.endsWith('.md')) continue;
    ensure(
      existsSync(path.join(workspace, artifact)),
      `required artifact declared in contract must exist: ${artifact}`,
    );
  }

  const requiredEvidence = contract?.requiredEvidence || [];
  const observedInstructionFiles = new Set(report.intake?.instructionFiles || []);
  for (const evidenceFile of requiredEvidence) {
    ensure(
      observedInstructionFiles.has(evidenceFile),
      `required evidence file missing from intake observations: ${evidenceFile}`,
    );
  }

  if (report.warnings.length > 0 && report.warnings.some((item) => String(item).toLowerCase().includes('error'))) {
    failures.push('warnings contain error-like entries');
  }
}

function isIsoDate(value) {
  if (!isNonEmptyString(value)) return false;
  const normalized = Date.parse(value);
  return Number.isFinite(normalized);
}

function isFile(filePath) {
  try {
    return existsSync(filePath);
  } catch {
    return false;
  }
}

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function ensureFileExists(filePath, label) {
  if (!isFile(filePath)) {
    failures.push(`missing ${label}: ${path.relative(ROOT, filePath)}`);
  }
}

function readJson(filePath) {
  if (!isFile(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readText(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

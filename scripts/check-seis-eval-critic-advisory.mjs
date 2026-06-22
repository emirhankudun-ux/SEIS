#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { containsSecretMaterial } from '../packages/seis-ai/src/lib/redaction.mjs';

const ROOT = process.cwd();
const REPORT_JSON = path.join(ROOT, 'reports', 'seis-eval-critic-advisory', 'latest.json');
const REPORT_MD = path.join(ROOT, 'reports', 'seis-eval-critic-advisory', 'latest.md');
const FAILING_DECISIONS = new Set(['revise', 'block']);

const requiredReports = [
  {
    id: 'action-decision',
    title: 'Action Decision Report',
    path: 'reports/seis-action-decisions/latest.json',
    expectedEvidence: 'scripts/inspect-seis-action-decision.mjs',
  },
  {
    id: 'action-execution-plan',
    title: 'Action Execution Plan',
    path: 'reports/seis-action-execution/latest.json',
    expectedEvidence: 'scripts/inspect-seis-action-execution.mjs',
  },
  {
    id: 'action-execution-run',
    title: 'Action Execution Run',
    path: 'reports/seis-action-execution/latest-run.json',
    expectedEvidence: 'scripts/execute-seis-action-execution.mjs',
  },
];

const failures = [];
const reviews = requiredReports.map(readAndValidateReport);
const summary = summarize(reviews);
const aggregate = {
  generatedAt: new Date().toISOString(),
  generatedBy: 'check-seis-eval-critic-advisory.mjs',
  modelId: 'seis-eval-critic-seed-v0',
  decision: summary.block > 0 ? 'block' : summary.revise > 0 ? 'revise' : 'pass',
  summary,
  reviews,
  gates: {
    allReportsPresent: reviews.every(item => item.present),
    allCriticSignalsPresent: reviews.every(item => item.hasCritic),
    allPassed: reviews.every(item => item.decision === 'pass'),
    noSecretLikeMaterial: reviews.every(item => !item.secretLikeMaterial),
  },
};

mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
writeFileSync(REPORT_JSON, `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
writeFileSync(REPORT_MD, renderMarkdown(aggregate), 'utf8');

if (aggregate.decision !== 'pass') {
  failures.push(`aggregate eval critic decision must be pass; received ${aggregate.decision}`);
}

if (failures.length > 0) {
  console.error('SEIS eval critic advisory check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS eval critic advisory check passed.');
console.log(JSON.stringify({
  decision: aggregate.decision,
  modelId: aggregate.modelId,
  reports: aggregate.summary.total,
}, null, 2));

function readAndValidateReport(report) {
  const absolutePath = path.join(ROOT, report.path);
  if (!existsSync(absolutePath)) {
    failures.push(`missing required report: ${report.path}`);
    return {
      id: report.id,
      title: report.title,
      path: report.path,
      present: false,
      hasCritic: false,
      decision: 'block',
      reasons: ['required report missing'],
      secretLikeMaterial: false,
      generatedAt: null,
    };
  }

  const parsed = readJson(absolutePath, report.path);
  const critic = parsed?.critic;
  const textForSecretScan = JSON.stringify({
    title: report.title,
    critic,
    summary: parsed?.summary,
  });
  const secretLikeMaterial = containsSecretMaterial(textForSecretScan, { includeLongTokens: false });

  ensure(Boolean(parsed?.generatedAt), `${report.path}: generatedAt is required`);
  ensure(critic && typeof critic === 'object', `${report.path}: critic advisory is required`);

  if (critic && typeof critic === 'object') {
    ensure(critic.modelId === 'seis-eval-critic-seed-v0', `${report.path}: critic modelId mismatch`);
    ensure(['pass', 'revise', 'block'].includes(critic.decision), `${report.path}: invalid critic decision`);
    ensure(['pass', 'revise', 'block'].includes(critic.safetyDecision), `${report.path}: invalid safety decision`);
    ensure(Array.isArray(critic.reasons) && critic.reasons.length > 0, `${report.path}: critic reasons required`);
    ensure(
      Array.isArray(critic.review?.evidence) && critic.review.evidence.includes(report.expectedEvidence),
      `${report.path}: critic review must cite ${report.expectedEvidence}`,
    );
    ensure(
      Array.isArray(critic.review?.validation) && critic.review.validation.some(item => item.status === 'passed'),
      `${report.path}: critic review must include passed validation`,
    );
  }

  if (secretLikeMaterial) {
    failures.push(`${report.path}: critic payload contains secret-like material`);
  }

  if (critic && FAILING_DECISIONS.has(critic.decision)) {
    failures.push(`${report.path}: critic decision is ${critic.decision}`);
  }

  return {
    id: report.id,
    title: report.title,
    path: report.path,
    present: true,
    hasCritic: Boolean(critic),
    generatedAt: parsed?.generatedAt || null,
    decision: critic?.decision || 'block',
    learnedDecision: critic?.learnedDecision || null,
    safetyDecision: critic?.safetyDecision || null,
    modelId: critic?.modelId || null,
    reasons: Array.isArray(critic?.reasons) ? critic.reasons : [],
    expectedEvidence: report.expectedEvidence,
    secretLikeMaterial,
  };
}

function summarize(items) {
  const counts = { pass: 0, revise: 0, block: 0 };
  for (const item of items) {
    counts[item.decision] = (counts[item.decision] || 0) + 1;
  }

  return {
    total: items.length,
    pass: counts.pass || 0,
    revise: counts.revise || 0,
    block: counts.block || 0,
    missingReports: items.filter(item => !item.present).length,
    missingCritic: items.filter(item => !item.hasCritic).length,
    secretLikeFindings: items.filter(item => item.secretLikeMaterial).length,
  };
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`${label}: invalid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function renderMarkdown(report) {
  const lines = [
    '# SEIS Eval Critic Advisory Report',
    '',
    `Generated: ${report.generatedAt}`,
    `Model: ${report.modelId}`,
    `Decision: ${report.decision}`,
    '',
    `Total: ${report.summary.total} | Pass: ${report.summary.pass} | Revise: ${report.summary.revise} | Block: ${report.summary.block}`,
    '',
    '| id | report | decision | safety | model | reasons |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  for (const item of report.reviews) {
    lines.push(
      `| ${item.id} | ${item.path} | ${item.decision} | ${item.safetyDecision || '-'} | ${item.modelId || '-'} | ${item.reasons.join('; ').replace(/\|/g, '│')} |`,
    );
  }

  lines.push('');
  lines.push('## Gates');
  for (const [gate, value] of Object.entries(report.gates)) {
    lines.push(`- ${gate}: ${value ? 'passed' : 'failed'}`);
  }

  return `${lines.join('\n')}\n`;
}

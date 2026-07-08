#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--write") ? "write" : "check";
const failures = [];

const files = {
  dryRun: "content/development/seis-ai-pr-staging-dry-run.json",
  docs: "docs/ai/seis-ai-pr-staging-dry-run.md",
  reportJson: "reports/seis-model-scaling/seis-ai-pr-staging-dry-run.json",
  reportMd: "reports/seis-model-scaling/seis-ai-pr-staging-dry-run.md",
  prPackage: "content/development/seis-ai-github-pr-package.json",
  packageJson: "package.json"
};

const existing = mode === "check" ? readOptionalJson(files.dryRun) : null;
const generatedAt = existing?.generatedAt || new Date().toISOString();
const prPackage = readJson(files.prPackage, "AI GitHub PR package");
const packageJson = readJson(files.packageJson, "package.json");

if (!prPackage || !packageJson) finish();

const statusRows = readGitStatus();
const dryRun = buildDryRun();
const report = buildReport(dryRun);
const docs = renderDocs(dryRun, report);
const reportMd = renderReport(report);

if (mode === "write") {
  writeJson(files.dryRun, dryRun);
  writeJson(files.reportJson, report);
  writeText(files.docs, docs);
  writeText(files.reportMd, reportMd);
  console.log("SEIS AI PR staging dry-run generated.");
  console.log(JSON.stringify({
    dryRun: files.dryRun,
    docs: files.docs,
    report: files.reportJson,
    markdownReport: files.reportMd
  }, null, 2));
} else {
  const existingDryRun = readJson(files.dryRun, "SEIS AI PR staging dry-run");
  const existingReport = readJson(files.reportJson, "SEIS AI PR staging dry-run report");
  checkTextIncludes(files.docs, [
    "SEIS AI PR Staging Dry-Run",
    "AI plus Plugin/MCP",
    "Dry-run only",
    "Safe to push now",
    "Reason push is blocked"
  ], "SEIS AI PR staging dry-run docs");
  checkTextIncludes(files.reportMd, [
    "SEIS AI PR Staging Dry-Run Report",
    "Safe to push now",
    "Safe to merge now"
  ], "SEIS AI PR staging dry-run markdown report");
  if (existingDryRun && existingReport) validate(existingDryRun, existingReport);
  validate(dryRun, report);
  finish("SEIS AI PR staging dry-run check passed.");
}

function buildDryRun() {
  const selected = new Set((prPackage.selectedAiFiles || []).map((item) => item.path));
  const selectedStatusRows = statusRows.filter((row) => selected.has(row.path));
  const nonSelectedStatusRows = statusRows.filter((row) => !selected.has(row.path));
  const stagedSelected = selectedStatusRows.filter((row) => row.indexStatus !== " " && row.indexStatus !== "?");
  const unstagedSelected = selectedStatusRows.filter((row) => row.worktreeStatus !== " " || row.indexStatus === "?");
  const stagedNonSelected = nonSelectedStatusRows.filter((row) => row.indexStatus !== " " && row.indexStatus !== "?");
  const dirtyNonSelected = nonSelectedStatusRows.filter((row) => row.indexStatus !== " " || row.worktreeStatus !== " ");
  const missingSelected = [...selected].filter((selectedPath) => !existsSync(path.join(root, selectedPath)));
  const generatedOutputPaths = [
    files.dryRun,
    files.docs,
    files.reportJson,
    files.reportMd
  ];

  const selectedStagePaths = [...new Set([...selected, ...generatedOutputPaths])];
  const selectedStageCommands = [
    "# Dry-run only. Review the AI package before running any git command.",
    `git add ${selectedStagePaths.map(shellQuote).join(" ")}`
  ];

  return {
    id: "seis-ai-pr-staging-dry-run",
    version: "2026.07.08",
    generatedAt,
    status: dirtyNonSelected.length > 0 || stagedNonSelected.length > 0 ? "staging-plan-ready-push-blocked" : "staging-plan-ready-clean-ai-only",
    qualityGate: "npm run check:seis-ai-pr-staging-dry-run",
    reportCommand: "npm run report:seis-ai-pr-staging-dry-run",
    purpose: "Classify the current git status against the AI plus Plugin/MCP PR package without staging, committing, pushing, merging, or mutating GitHub.",
    sourceOfTruth: {
      aiGithubPrPackage: files.prPackage,
      packageJson: files.packageJson,
      docs: files.docs
    },
    currentDecision: {
      dryRunOnly: true,
      gitAddExecuted: false,
      commitExecuted: false,
      pushExecuted: false,
      mergeExecuted: false,
      safeToStageSelectedNow: stagedNonSelected.length === 0 && dirtyNonSelected.length === 0 && missingSelected.length === 0,
      safeToCommitNow: false,
      safeToPushNow: false,
      safeToMergeNow: false,
      reasonPushBlocked: dirtyNonSelected.length > 0
        ? "The worktree has dirty files outside the AI plus Plugin/MCP PR package."
        : "Human review and protected-branch checks are still required before push or merge."
    },
    selectedAiFiles: [...selected],
    generatedOutputPaths,
    gitStatusSummary: {
      totalStatusRows: statusRows.length,
      selectedStatusRows: selectedStatusRows.length,
      selectedStagedRows: stagedSelected.length,
      selectedUnstagedOrUntrackedRows: unstagedSelected.length,
      nonSelectedStatusRows: nonSelectedStatusRows.length,
      nonSelectedStagedRows: stagedNonSelected.length,
      nonSelectedDirtyRows: dirtyNonSelected.length,
      missingSelectedFiles: missingSelected
    },
    selectedStatusRows,
    nonSelectedStagedRows: stagedNonSelected,
    nonSelectedDirtyRows: dirtyNonSelected,
    recommendedDryRunCommands: selectedStageCommands,
    forbiddenActionsWithoutApproval: [
      "git add .",
      "git commit",
      "git push",
      "git merge",
      "force push",
      "model download",
      "training",
      "provider API call",
      "SSH execution",
      "deployment"
    ],
    nextSafeActions: [
      "Move this AI plus Plugin/MCP package into a clean review branch or clean worktree before staging.",
      "Do not run git add . in the current dirty worktree.",
      "Keep non-selected staged files out of the AI plus Plugin/MCP PR.",
      "Run npm run check:seis-ai-github-readiness-chain after the staging set is clean.",
      "Open a human-reviewed PR only after protected branch checks are available."
    ],
    publicClaimBoundary: {
      canClaimStagingPlanExists: true,
      canClaimGitAddExecuted: false,
      canClaimCommitExecuted: false,
      canClaimPushExecuted: false,
      canClaimMergeExecuted: false,
      canClaimGithubReadyForEveryone: false,
      canClaimRealAgi: false
    }
  };
}

function buildReport(dryRun) {
  return {
    id: "seis-ai-pr-staging-dry-run-report",
    generatedAt: dryRun.generatedAt,
    status: dryRun.status,
    sourceDryRun: files.dryRun,
    summary: dryRun.gitStatusSummary,
    currentDecision: dryRun.currentDecision,
    selectedAiFiles: dryRun.selectedAiFiles,
    nonSelectedStagedRows: dryRun.nonSelectedStagedRows,
    nonSelectedDirtyRows: dryRun.nonSelectedDirtyRows,
    recommendedDryRunCommands: dryRun.recommendedDryRunCommands,
    nextSafeActions: dryRun.nextSafeActions
  };
}

function validate(dryRun, report) {
  ensure(dryRun.id === "seis-ai-pr-staging-dry-run", "dry-run id mismatch");
  ensure(dryRun.qualityGate === "npm run check:seis-ai-pr-staging-dry-run", "quality gate mismatch");
  ensure(dryRun.reportCommand === "npm run report:seis-ai-pr-staging-dry-run", "report command mismatch");
  ensure(dryRun.currentDecision.dryRunOnly === true, "dry-run must be dry-run only");
  ensure(dryRun.currentDecision.gitAddExecuted === false, "dry-run must not run git add");
  ensure(dryRun.currentDecision.commitExecuted === false, "dry-run must not run commit");
  ensure(dryRun.currentDecision.pushExecuted === false, "dry-run must not run push");
  ensure(dryRun.currentDecision.mergeExecuted === false, "dry-run must not run merge");
  ensure(dryRun.currentDecision.safeToCommitNow === false, "safeToCommitNow must stay false");
  ensure(dryRun.currentDecision.safeToPushNow === false, "safeToPushNow must stay false");
  ensure(dryRun.currentDecision.safeToMergeNow === false, "safeToMergeNow must stay false");
  ensure(dryRun.selectedAiFiles.includes("scripts/check-seis-ai-github-readiness-chain.mjs"), "selected files must include AI readiness chain");
  ensure(dryRun.selectedAiFiles.includes("content/development/seis-ai-github-pr-package.json"), "selected files must include AI PR package");
  ensure(dryRun.selectedAiFiles.includes(".github/workflows/seis-ai.yml"), "selected files must include AI plus Plugin/MCP CI workflow");
  ensure(dryRun.selectedAiFiles.includes("scripts/create-seis-plugin-mcp-ten-year-continuity-map.mjs"), "selected files must include Plugin/MCP continuity generator");
  ensure(dryRun.generatedOutputPaths.includes(files.dryRun), "generated outputs must include dry-run source");
  ensureArrayIncludesAll(dryRun.forbiddenActionsWithoutApproval, [
    "git add .",
    "git commit",
    "git push",
    "git merge",
    "model download",
    "training",
    "provider API call",
    "SSH execution"
  ], "forbiddenActionsWithoutApproval");
  ensure(dryRun.publicClaimBoundary.canClaimGitAddExecuted === false, "must not claim git add executed");
  ensure(dryRun.publicClaimBoundary.canClaimCommitExecuted === false, "must not claim commit executed");
  ensure(dryRun.publicClaimBoundary.canClaimPushExecuted === false, "must not claim push executed");
  ensure(dryRun.publicClaimBoundary.canClaimMergeExecuted === false, "must not claim merge executed");
  ensure(dryRun.publicClaimBoundary.canClaimGithubReadyForEveryone === false, "must not claim GitHub ready for everyone");
  ensure(dryRun.publicClaimBoundary.canClaimRealAgi === false, "must not claim real AGI");
  ensure(report.sourceDryRun === files.dryRun, "report source mismatch");
  ensure(packageJson.scripts?.["check:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs", "package.json must expose staging dry-run check");
  ensure(packageJson.scripts?.["report:seis-ai-pr-staging-dry-run"] === "node scripts/create-seis-ai-pr-staging-dry-run.mjs --write", "package.json must expose staging dry-run report");
  ensure(String(packageJson.scripts?.["quality:governance"] || "").includes("check:seis-ai-pr-staging-dry-run"), "quality:governance must include staging dry-run");
  ensure(prPackage.requiredValidation?.includes("npm run check:seis-ai-pr-staging-dry-run"), "AI PR package must require staging dry-run validation");
}

function renderDocs(dryRun, report) {
  return `# SEIS AI PR Staging Dry-Run

This dry-run classifies the current Git status against the AI plus Plugin/MCP PR package.
It does not stage, commit, push, merge, deploy, call providers, run SSH, download
models, or train models.

Status: ${dryRun.status}

## Current Decision

| Field | Value |
| --- | --- |
| Dry-run only | ${String(dryRun.currentDecision.dryRunOnly)} |
| Safe to stage selected now | ${String(dryRun.currentDecision.safeToStageSelectedNow)} |
| Safe to commit now | ${String(dryRun.currentDecision.safeToCommitNow)} |
| Safe to push now | ${String(dryRun.currentDecision.safeToPushNow)} |
| Safe to merge now | ${String(dryRun.currentDecision.safeToMergeNow)} |
| Non-selected dirty rows | ${report.summary.nonSelectedDirtyRows} |
| Non-selected staged rows | ${report.summary.nonSelectedStagedRows} |

Reason push is blocked: ${dryRun.currentDecision.reasonPushBlocked}

## Recommended Dry-Run Commands

\`\`\`bash
${dryRun.recommendedDryRunCommands.join("\n")}
\`\`\`

## Next Safe Actions

${dryRun.nextSafeActions.map((item) => `- ${item}`).join("\n")}
`;
}

function renderReport(report) {
  return `# SEIS AI PR Staging Dry-Run Report

Generated: ${report.generatedAt}

Status: ${report.status}

| Field | Value |
| --- | --- |
| Total status rows | ${report.summary.totalStatusRows} |
| Selected status rows | ${report.summary.selectedStatusRows} |
| Non-selected dirty rows | ${report.summary.nonSelectedDirtyRows} |
| Non-selected staged rows | ${report.summary.nonSelectedStagedRows} |
| Safe to stage selected now | ${String(report.currentDecision.safeToStageSelectedNow)} |
| Safe to commit now | ${String(report.currentDecision.safeToCommitNow)} |
| Safe to push now | ${String(report.currentDecision.safeToPushNow)} |
| Safe to merge now | ${String(report.currentDecision.safeToMergeNow)} |

## Next Safe Actions

${report.nextSafeActions.map((item) => `- ${item}`).join("\n")}
`;
}

function readGitStatus() {
  const result = spawnSync("git", ["status", "--porcelain=v1"], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });
  if (result.status !== 0) {
    failures.push(`git status failed: ${result.stderr || result.stdout}`);
    return [];
  }
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map(parseStatusLine)
    .filter(Boolean);
}

function parseStatusLine(line) {
  const indexStatus = line[0] || " ";
  const worktreeStatus = line[1] || " ";
  let rawPath = line.slice(3);
  if (rawPath.includes(" -> ")) rawPath = rawPath.split(" -> ").pop();
  return {
    path: rawPath,
    indexStatus,
    worktreeStatus,
    raw: line
  };
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function readJson(relativePath, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

function readOptionalJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  const filePath = path.join(root, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, value);
}

function checkJson(relativePath, expected, label) {
  const actual = readJson(relativePath, label);
  if (!actual) return;
  if (JSON.stringify(actual, null, 2) !== JSON.stringify(expected, null, 2)) {
    failures.push(`${label} is stale. Run npm run report:seis-ai-pr-staging-dry-run.`);
  }
}

function checkText(relativePath, expected, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  if (actual !== expected) failures.push(`${label} is stale. Run npm run report:seis-ai-pr-staging-dry-run.`);
}

function checkTextIncludes(relativePath, phrases, label) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${label} missing: ${relativePath}`);
    return;
  }
  const actual = readFileSync(filePath, "utf8");
  for (const phrase of phrases) {
    if (!actual.includes(phrase)) failures.push(`${label} missing phrase: ${phrase}`);
  }
}

function ensureArrayIncludesAll(candidate, required, label) {
  ensure(Array.isArray(candidate), `${label} must be an array`);
  const values = new Set(Array.isArray(candidate) ? candidate : []);
  for (const item of required) ensure(values.has(item), `${label} missing ${item}`);
}

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function finish(successMessage) {
  if (failures.length > 0) {
    console.error("SEIS AI PR staging dry-run check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  if (successMessage) console.log(successMessage);
}
